const {src, dest, watch, series, parallel, task, on} = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

task('copyImg', () => {
  return src('src/images/*.*')
    .pipe(dest('dist/images/'))
});

task('copyVendors', () => {
  return src(['src/js/vendors/**/*.*', '!src/js/vendors/slick/slick.js'])
    .pipe(dest('dist/js/vendors/'))
});

task('delImg', () => {
  return del(['dist/images/*.*']);
});

task('clean', () => {
  return del('dist');
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

task('reload', (done) => {
  browserSync.reload();
  done();
});

task('compileScss', () => {
  return src(['src/styles/main.scss',
    '!src/js/vendors/slick/slick.css',
    '!src/js/vendors/slick/slick-theme.css'
  ])
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
    .pipe(dest('./dist/styles/'))
    .pipe(browserSync.stream());
});

task('compilePug', () => {
  return src('src/pug/pages/*.pug')
    .pipe(pug({
      pretty: true,
    }))
    .pipe(dest('dist'));
});

const libs = [
  'node_modules/jquery/dist/jquery.js',
  'src/js/vendors/slick/slick.js',
  'src/js/*.js',
  'src/js/scripts/mainSlider.js',
]

task('scripts', () => {
  return src(libs)
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'));
})

const watchers = (done) => {
  watch('src/images/*', series("delImg", "copyImg", 'reload'));
  watch('src/**/*.scss', series('compileScss'));
  watch('src/**/*.pug', series('compilePug', 'reload'));
  watch('src/js/*.js', series('scripts'));
  done();
}

task("build", series('clean', 'copyImg', 'copyVendors', 'scripts', 'compilePug', 'compileScss'));
task("default", series('build', parallel('server', watchers)));


