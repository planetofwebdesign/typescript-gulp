var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var connect = require("gulp-connect"),
    livereload = require('gulp-livereload');
var paths = {
    pages: ['src/*.html']
};

gulp.task('webserver', function () {
    connect.server({
        livereload: true,
        root: ['.', 'dist']
    });
});

var watchedBrowserify = watchify(browserify({
            basedir: '.',
            debug: true,
            entries: ['src/app/app.ts'],
            cache: {},
            packageCache: {}
        })
        .plugin(tsify))
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    });

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist"))
        .pipe(connect.reload());
}

gulp.task("default", ["copy-html", "webserver"], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);