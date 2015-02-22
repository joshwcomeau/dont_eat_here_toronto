var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    jshint       = require('gulp-jshint'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    concat       = require('gulp-concat'),
    notify       = require('gulp-notify'),
    livereload   = require('gulp-livereload'),
    sourcemaps   = require('gulp-sourcemaps');


gulp.task('default', function() {
  gulp.start('styles', 'scripts', 'watch');
});

gulp.task('styles', function() {
  return gulp.src('extension/sass/**/*.scss')  
    .pipe(sass())  
    .pipe(concat('style.css')) 
    .pipe(gulp.dest('extension/css/')) 
    .pipe(notify({ message: 'Styles task complete'}));
});

gulp.task('scripts', function() {
 
});

gulp.task('watch', ['styles', 'scripts'], function() {
  gulp.watch('extension/js/*.js', ['scripts']);
  gulp.watch('extension/sass/*.scss', ['styles']);
});