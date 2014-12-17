var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var connect = require('gulp-connect');
var fileinclude = require('gulp-file-include');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var htmlreplace = require("gulp-html-replace");
var gulpif = require('gulp-if');
var runSequence = require('gulp-run-sequence');

var paths = {
  favicons: {
    src: ['favicons/**/*.*'],
    dest: 'public/favicons'
  },
  scripts: {
    src: ['js/vendor/jquery.js', 'js/vendor/modernizr.js', 'js/vendor/fastclick.js',
    'js/vendor/slick.min.js', 'js/vendor/jquery.swipebox.js', 'js/foundation/foundation.js', 'js/foundation/foundation.topbar.js',
    'js/foundation/foundation.magellan.js', 'js/foundation/foundation.equalizer.js'],
    dest: 'public/js'
  },
  sass_styles: {
    src: ['css/**/*.scss'],
    dest: 'public/css'
  },
  styles: {
    src: ['css/**/*.css', 'css/**/*.map'],
    dest: 'public/css'
  },
  fonts: {
    src: ['fonts/**/*'],
    dest: 'public/fonts'
  },
  images: {
    src: ['images/**/*', 'images-selected/**/*'],
    dest: 'public/images'
  },
  html: {
    src: ['*.html'],
    dest: 'public'
  },
  templates: {
    src: ['partials/*.html'],
    dest: 'public/partials'
  }
};

if (!gutil.env.stage) {
	gutil.log('Please provide stage environment. Ex:  gulp --stage development');
	process.exit(1);
}

var isProduction = gutil.env.stage === 'production';

gulp.task('favicons', function() {
  return gulp.src(paths.favicons.src).
  pipe(gulp.dest(paths.favicons.dest))
  .pipe(connect.reload());
});

gulp.task('images', function() {
  return gulp.src(paths.images.src)
  .pipe(gulpif(isProduction, imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false }],
      use: [pngquant()]
  })))
  .pipe(gulp.dest(paths.images.dest))
  .pipe(connect.reload());
});

handleError = function(err) {
  gutil.log(err.toString());
  return this.emit('end');
};

gulp.task('sassStyles', function() {
  return gulp.src(paths.sass_styles.src)
  .pipe(sass().on('error', handleError))
  .pipe(gulpif(isProduction, minifyCSS({keepBreaks:true})))
  .pipe(gulpif(isProduction, concat('all.css', {newLine: ';'})))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(connect.reload());
});

gulp.task('styles', function() {
  return gulp.src(paths.styles.src)
  .pipe(gulpif(isProduction, minifyCSS({keepBreaks:true})))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(connect.reload());
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts.src)
  .pipe(gulpif(isProduction, uglify()))
  .pipe(gulpif(isProduction, concat('all.js')))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(connect.reload());
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts.src)
  .pipe(gulp.dest(paths.fonts.dest))
  .pipe(connect.reload());
});

gulp.task('templates', function() {
  return gulp.src(paths.templates.src)
  .pipe(gulp.dest(paths.templates.dest))
  .pipe(connect.reload());
});

gulp.task('html', function() {
  return gulp.src(paths.html.src)
  .pipe(fileinclude())
  .pipe(gulpif(isProduction, htmlreplace({
  	js: 'js/all.js',
  	css: 'css/all.css'
  })))
  .pipe(gulpif(isProduction, htmlmin({
  	collapseWhitespace: false,
  	removeComments: true,
  	minifyJS: true,
  	minifyCSS: true,
  	keepClosingSlash: true
  })))
  .pipe(gulp.dest(paths.html.dest))
  .pipe(connect.reload());
});

gulp.task('cleanup', function() {
  return gulp.src("./public", {
    read: false
  }).pipe(clean());
});

gulp.task('connect', function() {
  return connect.server({
    root: ['./public'],
    port: 1337,
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts.src, ['scripts']);
  gulp.watch(paths.sass_styles.src, ['sassStyles']);
  gulp.watch(paths.styles.src, ['styles']);
  gulp.watch(paths.fonts.src, ['fonts']);
  gulp.watch(paths.html.src, ['html']);
  gulp.watch(paths.templates.src, ['html']);
  gulp.watch(paths.images.src, ['images']);
  return gulp.watch(paths.favicons.src, ['favicons']);
});

gulp.task('assets', ['scripts', 'sassStyles', 'styles', 'fonts', 'images', 'favicons', 'html']);

gulp.task('default', function(cb){
  runSequence('cleanup', 'assets', 'connect', 'watch', cb);
});
gulp.task('deploy', function(cb){
  runSequence('cleanup', 'assets', cb);
});
