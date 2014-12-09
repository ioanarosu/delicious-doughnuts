gulp        = require('gulp')
gutil       = require('gulp-util')
clean       = require('gulp-clean')
connect     = require('gulp-connect')
fileinclude = require('gulp-file-include')
runSequence = require('run-sequence')
rsync       = require('gulp-rsync')
sass        = require('gulp-sass')

paths =
  scripts:
    src: ['js/**/*.js']
    dest: 'public/js'
  sass_styles:
    src: ['css/**/*.scss']
    dest: 'public/css'
  styles:
    src: ['css/**/*.css', 'css/**/*.map']
    dest: 'public/css'
  fonts:
    src: ['fonts/**/*']
    dest: 'public/fonts'
  images:
    src: ['images/**/*']
    dest: 'public/images'
  html:
    src: ['*.html']
    dest: 'public'
  templates:
    src: ['partials/*.html']
    dest: 'public/partials'

#move images to public
gulp.task 'images', ->
  gulp.src(paths.images.src)
  .pipe gulp.dest(paths.images.dest)
  .pipe connect.reload()

handleError = (err)->
  gutil.log err.toString()
  @emit 'end'

#styles
gulp.task 'sassStyles', ->
  gulp.src(paths.sass_styles.src)
  .pipe sass().on('error', handleError)
  .pipe gulp.dest(paths.styles.dest)
  .pipe connect.reload()

gulp.task 'styles', ->
  gulp.src(paths.styles.src)
  .pipe gulp.dest(paths.styles.dest)
  .pipe connect.reload()

#scripts
gulp.task 'scripts', ->
  gulp.src(paths.scripts.src)
  .pipe gulp.dest(paths.scripts.dest)
  .pipe connect.reload()

#move font files to public
gulp.task 'fonts', ->
  gulp.src(paths.fonts.src)
  .pipe gulp.dest(paths.fonts.dest)
  .pipe connect.reload()

gulp.task 'templates', ->
  gulp.src(paths.templates.src)
  .pipe gulp.dest(paths.templates.dest)
  .pipe connect.reload()

# move html files to public
gulp.task 'html', ->
  gulp.src(paths.html.src)
  .pipe fileinclude()
  .pipe gulp.dest(paths.html.dest)
  .pipe connect.reload()

#delete all from public
gulp.task 'cleanup', ->
  gulp.src("/public/**/*",
    read: false
  ).pipe clean()

gulp.task 'connect', ->
  connect.server
    root: ['./public']
    port: 1337
    livereload: true

gulp.task 'watch', ->
  gulp.watch paths.scripts.src, ['scripts']
  gulp.watch paths.sass_styles.src, ['sassStyles']
  gulp.watch paths.styles.src, ['styles']
  gulp.watch paths.fonts.src, ['fonts']
  gulp.watch paths.html.src, ['html']
  gulp.watch paths.templates.src, ['html']
  gulp.watch paths.images.src, ['images']

gulp.task 'deploy-server', ->
  gulp.src('public/**')
  .pipe rsync
    root: 'public'
    username: 'ubuntu'
    hostname: 'www.diningchicago.com'
    destination: '/home/ubuntu/websites/diacaffe'
    progress: true
    recursive: true
    clean: true

gulp.task 'assets', ['cleanup', 'scripts', 'sassStyles', 'styles', 'fonts', 'images', 'html']

default_sequence = ['connect', 'assets', 'watch']

gulp.task 'deploy', ->
  runSequence('assets', 'deploy-server')

gulp.task 'default', default_sequence
