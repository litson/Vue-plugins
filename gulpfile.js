var fs = require('fs');

var gulp = require('gulp');
var size = require('gulp-size');

var watch = require('gulp-watch');

var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
// var jshint = require('gulp-jshint');

// var sourceMaps = require('gulp-sourcemaps');

// ==================== tasks ==================== //

var filePath = 'src/*.js';
var distPath = './dist/';

gulp.task('op', function () {
    gulp.src(
        distPath + '*.js'
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

gulp.task('combo', function () {
    gulp.src(filePath).pipe(concat('plugins.js')).pipe(
        gulp.dest(distPath)
    );
});

gulp.task('release', function () {
    gulp.start('combo');
    setTimeout(function () {
        gulp.start('op');
    }, 1000)
});

gulp.task('default', function () {

    gulp.src(filePath)
        .pipe(
        watch(filePath, function () {
        gulp.start('combo');
    }));

});
