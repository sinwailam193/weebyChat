var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var uglifyCSS = require('gulp-minify-css');

gulp.task('minify', function(){
  gulp.src('./public/js/*.js')
      .pipe(uglify())
      .pipe(concat('script.min.js'))
      .pipe(gulp.dest('./public'));
});

gulp.task('minifyCSS', function(){
  gulp.src('./public/style/style.css')
    .pipe(uglifyCSS())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('./public'));
});

gulp.task('watch', function(){
  gulp.watch('./public/js/*.js', function(){
    gulp.run('minify');
  });
  gulp.watch('./public/style/style.css', function(){
    gulp.run('minifyCSS');
  });
});

gulp.task('default', ['minify', 'minifyCSS', 'watch']);