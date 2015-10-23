/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
var gulp = require('gulp'),
  watcher = require('gulp-watch'),
  connect = require('gulp-connect'),
  del = require('del'),
  gutil = require('gulp-util'),
  sourcemaps = require('gulp-sourcemaps'),
  sourcemapReporter = require('jshint-sourcemap-reporter'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  watchify = require('watchify'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  reactify = require('reactify'),
  sass = require('gulp-sass');


function buildJS(watch) {
  var bundler, compile;
  bundler = browserify('./src/main.js', watchify.args);

  if (watch) {
    bundler = watchify(bundler);
  }

  bundler.transform(babelify.configure({
    optional: ['es7.asyncFunctions','es7.decorators']
  }));
  bundler.transform(reactify);

  compile = function() {
    console.log('transpiling js...');
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .on('prebundle', function(bund) {
        // Make React available externally for dev tools
        bund.require('react');
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write(''))
      .pipe(gulp.dest('./app'));
  }

  bundler.on('update', compile);
  return compile();
}

function buildCSS(watch) {
  var compile = function() {
    console.log('transpiling scss...');
    return gulp.src('src/style/chat.scss')
    .pipe(sass())
    .pipe(gulp.dest('./app/css'));
  }

  if (watch) {
    watcher(['src/**/*.scss','src/**/*.css'], compile);
  }
  return compile();
}

function cleanSite(cb) {
  return del(['./app'], cb);
}

function copyMaterialize() {
  gulp.src('node_modules/materialize-css/font/**/*')
    .pipe(gulp.dest('./app/font'));
  gulp.src('node_modules/materialize-css/bin/*.js')
    .pipe(gulp.dest('./app/js'));
  return gulp.src(['node_modules/materialize-css/bin/*.css'])
    .pipe(gulp.dest('./app/css'));
}

function copyImages() {
  return gulp.src(['src/images/**/*'])
    .pipe(gulp.dest('./app/images'));
}

gulp.task('copy-images', ['clean_site'], copyImages);
gulp.task('copy-materialize', ['clean_site'], copyMaterialize);

gulp.task('clean_site', cleanSite);
gulp.task('js', ['clean_site'], buildJS);
gulp.task('style', ['clean_site'], buildCSS);

gulp.task('images', ['clean_site'], function() {
  return gulp.src('src/images/*')
    .pipe(gulp.dest('./app/images'));
});

gulp.task('xmpp', ['clean_site'], function() {
  return gulp.src('node_modules/node-xmpp/node-xmpp-browser.js')
    .pipe(gulp.dest('./app'));
});

gulp.task('site', ['copy-images', 'copy-materialize', 'xmpp', 'style', 'js', 'images', 'clean_site'], function() {
  return gulp.src('./src/index.html')
    .pipe(gulp.dest('./app'));
});

gulp.task('server', function () {
  connect.server({
    root: 'app',
    port: 9000
  });
});

gulp.task('watchStyles', function() {
  gulp.watch(['src/**/*.styl','src/**/*.css'], ['style']);
});

gulp.task('default', ['server', 'site', 'watchStyles']);
