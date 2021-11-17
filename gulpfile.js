const {src, dest, watch, series, parallel, task} = require('gulp');
const del = require('gulp-clean');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

task('copy', () => {
    return src('src/**/*.*')
    .pipe(dest('dist'))
});
task('clean', () => {
    return src('dist/**/*')
    .pipe(del());
});

task('server', (done) => {
    browserSync.init({
      watch: true,
      server: {
        baseDir: './dist'
      }
    });
    done();
});

const watchers = (done) => {
    watch('src/**/*.html').on('all', series('copy', reload));
    done();
}

task("default", series('clean', 'copy', parallel('server', watchers)));