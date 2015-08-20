var fs = require('fs');

var gulp = require('gulp');
var size = require('gulp-size');

// var watch = require('gulp-watch');

// var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
// var jshint = require('gulp-jshint');

// var sourceMaps = require('gulp-sourcemaps');

// ==================== tasks ==================== //

var filePath = 'src/*.js';
var distPath = 'dist/';

gulp.task('op', function () {

    gulp.src(
        filePath
    )
        .pipe(
        uglify()
    )
        .pipe(
        size(
            {
                showFiles: true,
                gzip: true,
                title: 'After compress: '
            }
        )
    )
        .pipe(
        gulp.dest(distPath)
    );

});




