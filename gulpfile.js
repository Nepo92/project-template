const gulp = require('gulp');
const browserSync = require('browser-sync');
const del = require('del');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const webpCSS = require('gulp-webp-css');
const imagemin = require('gulp-imagemin');
const compress = require('gulp-uglify-es').default;
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

function cleanApp() {
  return del('dist');
}

function startServer() {
  browserSync({
    server: {
      baseDir: 'dist',
    },
    notify: false,
  });
}

function createHtml() {
  return gulp.src(['app/**/*.html', '!app/**/_*.html'])
    .pipe(webpHTML())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
}

function createFonts() {
  return gulp.src(['app/fonts/**/*.+(ttf||woff||woff2)', '!app/fonts/**/_*.+(ttf||woff||woff2)'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({ stream: true }));
}

function createCss() {
  return gulp.src(['app/sass/**/*.+(sass|scss)', '!app/sass/**/_*.+(sass||scss)'])
    .pipe(sass({
      outputStyle: 'expanded',
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 5 versions'],
      cascade: false,
    }))
    .pipe(webpCSS())
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({ stream: true }));
}

function createImg() {
  return gulp.src(['app/img/**/*.+(svg||webp||png||jpg||jpeg||gif)'])
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 10 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
        ],
      }),
    ]))
    .pipe(gulp.dest('dist/img'))
    .pipe(webp())
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.reload({ stream: true }));
}

function createJs() {
  return gulp.src(['app/js/**/*.js', '!app/js/_*.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(compress())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({ stream: true }));
}

function createPHP() {
  return gulp.src('app/**/*.php')
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
}

function createSprite() {
  return gulp.src('app/img/**/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true,
      },
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true },
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
        },
      },
    }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
}

function createFiles() {
  return gulp.src('app/files')
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function createPhpMailer() {
  return gulp.src('app/phpMailer/**')
    .pipe(gulp.dest('dist/phpMailer/'))
    .pipe(browserSync.reload({ stream: true }));
}

function spy() {
  gulp.watch(['app/**/*.html'], gulp.parallel('html'));
  gulp.watch(['app/sass/**/*.+(scss||sass)'], gulp.parallel('sass'));
  gulp.watch('app/img/**/*.+(svg||webp||png||jpg||jpeg||gif)', gulp.parallel('img'));
  gulp.watch(['app/js/**/*.js'], gulp.parallel('js'));
  gulp.watch('app/**/*.php', gulp.parallel('php'));
  gulp.watch(['app/fonts/**/*.+(ttf||woff||woff2)'], gulp.parallel('fonts'));
  gulp.watch('app/sprite.svg', gulp.parallel('spriteSVG'));
  gulp.watch('app/files/**', gulp.parallel('files'));
  gulp.watch('app/phpMailer/**', gulp.parallel('phpMailer'));
}

gulp.task('del', cleanApp);

gulp.task('server', startServer);

gulp.task('html', createHtml);

gulp.task('fonts', createFonts);

gulp.task('sass', createCss);

gulp.task('img', createImg);

gulp.task('js', createJs);

gulp.task('php', createPHP);

gulp.task('spriteSVG', createSprite);

gulp.task('files', createFiles);

gulp.task('phpMailer', createPhpMailer);

gulp.task('watch', spy);

gulp.task('default', gulp.parallel('server', 'watch', 'html', 'fonts', 'sass', 'img', 'spriteSVG', 'js', 'php', 'files', 'phpMailer'));
