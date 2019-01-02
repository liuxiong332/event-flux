var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var mocha = require('gulp-mocha');
var ts = require("gulp-typescript");
var merge = require('merge2'); 

gulp.task('clean', function () {
  return del([
    'lib/**/*',
    'dist/**/*'
  ]);
});

gulp.task('babel', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib/'));
});

gulp.task('ts', function () {
  var tsResult = gulp.src('src/**/*.ts')
    .pipe(ts({
      declaration: true,
      "target": "es5",
      "jsx": "react",
    }));

  return merge([
    tsResult.dts.pipe(gulp.dest('lib')),
    tsResult.js.pipe(gulp.dest('lib'))
  ]);
});

gulp.task('default', gulp.series('clean', 'babel', 'ts'));

gulp.task('test', function () {
  // src/server/**/__tests__npm
  return gulp.src('src/server/**/__tests__/**/*Test.js', { read: false })
    .pipe(env.set({
      NODE_ENV: 'testing',
    }))
    .pipe(mocha({ reporter: 'nyan', timeout: 10000000 }));
});

gulp.task('test-crawel', function () {
  return gulp.src('src/crawler/**/__tests__/**/*Test.js', { read: false })
    .pipe(env.set({
      NODE_ENV: 'testing',
    }))
    .pipe(mocha({ reporter: 'nyan', timeout: 10000000 }));
});
