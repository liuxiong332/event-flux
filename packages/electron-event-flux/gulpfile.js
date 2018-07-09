var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var gulpSequence = require('gulp-sequence');

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
