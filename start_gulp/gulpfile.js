const {src, dest, watch, series, parallel} = require('gulp');
const del = require('gulp-clean');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const copy = () => {
    return src('src/**/*.*')
    .pipe(dest('dist'))
}

const clean = () => {
    return src('dist/**/*')
    .pipe(del());
}

const server = (done) => {
    browserSync.init({
      watch: true,
      server: {
        baseDir: './dist'
      }
    });
    done();
};

const watchers = (done) => {
    watch('src/**/*.html').on('all', series(copy, reload));
    done();
}

exports.default = series(clean, copy, parallel(server, watchers));