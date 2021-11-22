const {src, dest, watch, series, parallel, task} = require('gulp');
const del = require('gulp-clean');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const reload = browserSync.reload;

sass.compiler = require('node-sass');

task('copy', () => {
    return src('src/**/*.html')
    .pipe(dest('dist'))
});
task('clean', () => {
    return src('dist/**/*')
    .pipe(del());
});

task('server', () => {
    browserSync.init({
      watch: true,
      server: {
        baseDir: './dist'
      }
    });
});

task('compileScss', () => {
  return src('src/styles/main.scss')
  .pipe(sourcemaps.init())
  .pipe(sassGlob())
  .pipe(sass().on('error', sass.logError))
  .pipe(px2rem())
  .pipe(autoprefixer({ cascade: false }))
  .pipe(gcmq())
  .pipe(cleanCSS({debug: true}, (details) => {
    console.log(`${details.name}: ${details.stats.originalSize}`);
    console.log(`${details.name}: ${details.stats.minifiedSize}`);
  }))
  .pipe(sourcemaps.write())
  .pipe(dest('./dist/styles'))
  .pipe(browserSync.stream());
});

const watchers = (done) => {
    watch('src/**/*.html').on('all', series('copy', reload));
    watch('src/**/*.scss', series('compileScss'));
    done();
}

task("default", series('clean', 'copy', 'compileScss', parallel('server', watchers)));