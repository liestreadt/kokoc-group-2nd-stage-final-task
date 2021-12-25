const {src, dest, watch, series, parallel, task} = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');
const sassLint = require('gulp-sass-lint');

const env = process.env.NODE_ENV;

const {SRC_PATH, DIST_PATH, JS_LIBS, STYLES_LIBS, VENDOR_LIBS} = require('./gulp.config')

task('copyImg', () => {
  return src(`${SRC_PATH}/images/*.*`)
    .pipe(dest(`${DIST_PATH}/images/`));
});

task('copyVendors', () => {
  return src([`${SRC_PATH}/js/vendors/**/*.*`, `!${SRC_PATH}/js/vendors/slick/slick.js`])
    .pipe(dest(`${DIST_PATH}/js/vendors/`));
});

task('delImg', () => {
  return del([`${DIST_PATH}/images/*.*`]);
});

task('clean', () => {
  console.log(env);
  return del(DIST_PATH);
});

task('server', (done) => {
  browserSync.init({
    watch: true,
    server: {
      baseDir: `./${DIST_PATH}`
    }
  });
  done();
});

task('reload', (done) => {
  browserSync.reload();
  done();
});

task('compileScss', () => {
  return src([...VENDOR_LIBS,
    ...STYLES_LIBS,])
    .pipe(sassLint({
      files: {ignore: [...VENDOR_LIBS]},
      configFile: '.sass-lint.yml'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(gulpif(env === 'dev', sourcemaps.init()))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(env === 'prod', autoprefixer()))
    .pipe(gulpif(env === 'prod', gcmq()))
    .pipe(gulpif(env === 'prod', cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
    })))
    .pipe(gulpif(env === 'prod', rename('main.min.css')))
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(dest(`./${DIST_PATH}/styles/`))
    .pipe(browserSync.stream());
});

task('lint-check', () => {
  return src(`${SRC_PATH}/styles/**/*.scss`)
  .pipe(sassLint({
    configFile: '.sass-lint.yml'
  }))
  .pipe(sassLint.format())
  .pipe(sassLint.failOnError())
})

task('compilePug', () => {
  return src(`${SRC_PATH}/pug/pages/*.pug`)
    .pipe(pug({
      pretty: true,
    }))
    .pipe(dest(DIST_PATH));
});

task('scripts', () => {
  return src([...JS_LIBS,
    "src/js/vendors/slick/slick.js",
    "src/js/scripts/mainSlider.js",
    "src/js/*.js",])
    .pipe(gulpif(env === 'dev', sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(gulpif(env === 'prod', babel({
      presets: ['@babel/env']
    })))
    .pipe(gulpif(env === 'prod', uglify()))
    .pipe(gulpif(env === 'prod', rename('main.min.js')))
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(dest(`${DIST_PATH}/js`));
});

task('watchers', (done) => {
  watch(`${SRC_PATH}/images/*`, series("delImg", "copyImg", 'reload'));
  watch(`${SRC_PATH}/**/*.scss`, series('compileScss'));
  watch(`${SRC_PATH}/**/*.pug`, series('compilePug', 'reload'));
  watch(`${SRC_PATH}/js/*.js`, series('scripts'));
  done();
});

task("build", series('clean', 'copyImg', 'copyVendors', parallel('compilePug', 'scripts', 'compileScss'), 'lint-check'));
task("serve", series('build', parallel('server', 'watchers')));



