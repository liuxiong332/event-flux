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

gulp.task('ts', function () {
  var tsResult = gulp.src('src/**/*.ts')
    .pipe(ts({
      declaration: true,
      "target": "es5",
      "lib": ["es2015", "es2017", "dom"],
      "jsx": "react",
    }));

  return merge([
    tsResult.dts.pipe(gulp.dest('lib')),
    tsResult.js.pipe(gulp.dest('lib'))
  ]);
});

gulp.task('default', gulp.series('clean', 'ts'));
