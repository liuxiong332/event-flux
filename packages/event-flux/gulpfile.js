var gulp = require('gulp');
var del = require('del');
var ts = require("gulp-typescript");
var merge = require('merge2'); 

gulp.task('clean', function () {
  return del([
    'lib/**/*',
    'dist/**/*'
  ]);
});

var tsProject = ts.createProject("tsconfig.json");
gulp.task('ts', function () {
  var tsResult = gulp.src('src/**/*.ts')
    .pipe(tsProject());

  return merge([
    tsResult.dts.pipe(gulp.dest('lib')),
    tsResult.js.pipe(gulp.dest('lib'))
  ]);
});

gulp.task('default', gulp.series('clean', 'ts'));
