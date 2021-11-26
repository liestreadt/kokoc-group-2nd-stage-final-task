const {src, dest, watch, series, parallel, task} = require('gulp');
const del = require('gulp-clean');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const reload = browserSync.reload;

task('copyImg', () => {
    return src('src/images/*.*')
    .pipe(dest('dist/images/'))
});

task('clean', () => {
    return src('dist/**/*.*')
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

task('compileScss', () => {
  return src('src/styles/main.scss')
  .pipe(sourcemaps.init())
  .pipe(sassGlob())
  .pipe(sass().on('error', sass.logError))
  .pipe(px2rem())
  .pipe(autoprefixer())
  .pipe(gcmq())
  .pipe(cleanCSS({debug: true}, (details) => {
    console.log(`${details.name}: ${details.stats.originalSize}`);
    console.log(`${details.name}: ${details.stats.minifiedSize}`);
  }))
  .pipe(sourcemaps.write())
  .pipe(dest('./dist/styles'))
  .pipe(browserSync.stream());
});

task('compilePug', () => {
  return src('src/pug/pages/*.pug')
  .pipe(pug({
    pretty: true,
  }))
  .pipe(dest('dist'));
});

const watchers = (done) => {
    // watch('src/**/*.html').on('all', series('copyHTML', reload));
    watch('src/**/*.scss', series('compileScss'));
    watch('src/**/*.pug', series('compilePug'));
    done();
}

task("build", series('clean', 'copyImg', 'compilePug', 'compileScss'));
task("start", series('build', parallel('server', watchers)));
task("default", series('build', 'start'));