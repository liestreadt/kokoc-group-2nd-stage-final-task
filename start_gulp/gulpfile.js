const {src, dest, watch, series} = require('gulp');
const cl = require('gulp-clean');
const browserSync = require('browser-sync').create();

function defaultTask(cb) {
    console.log('asd')
    cb();
  }

const copy = () => {
    return src('src/**/*.*')
    .pipe(dest('dist'))
}

const clean = () => {
    return src('dist/**/*').pipe(cl());
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
    watch('src/**/*.html').on('all',series(copy, browserSync.reload));
    done();
}
  
  
exports.default = defaultTask;
exports.default = series(clean, copy, watchers, server);