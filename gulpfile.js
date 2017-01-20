var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var mocha = require('gulp-mocha');

gulp.task('clean', function() {
  return del([
    'lib/**/*',
    'dist/**/*'
  ]);
});

gulp.task('babel', function() {
	return gulp.src('src/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('lib/'));
});

gulp.task('default', gulpSequence('clean', 'babel'));

gulp.task('test', function() {
  // src/server/**/__tests__npm
  return gulp.src('src/server/**/__tests__/**/*Test.js', {read: false})
    .pipe(env.set({
      NODE_ENV: 'testing',
    }))
    .pipe(mocha({reporter: 'nyan', timeout: 10000000}));
});

gulp.task('test-crawel', function() {
  return gulp.src('src/crawler/**/__tests__/**/*Test.js', {read: false})
    .pipe(env.set({
      NODE_ENV: 'testing',
    }))
    .pipe(mocha({reporter: 'nyan', timeout: 10000000}));
});
