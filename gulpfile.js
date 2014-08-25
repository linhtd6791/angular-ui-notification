var gulp = require('gulp');
var less = require('gulp-less');
var csscomb = require('gulp-csscomb');
var ngmin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var header = require('gulp-header');
var templateCache = require('gulp-angular-templatecache');
var minifyHtml = require("gulp-minify-html");
var concat = require('gulp-concat');
var addsrc = require('gulp-add-src');
var order = require("gulp-order");
var protractor = require("gulp-protractor").protractor;

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @author <%= pkg.author %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

  // ==== Styles
gulp.task('styles', function() {
    gulp.src('src/angular-ui-notification.less')
        .pipe(less({
            strictMath: true
        }))
        .pipe(csscomb())
        .pipe(less({
            cleancss: true,
            report: 'gzip'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(header(banner, { pkg : pkg }))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('demo'))
        .pipe(notify("Styles '<%= file.relative %>' has been compiled!"));
});

// ====== Templates
gulp.task('templates', function() {
    gulp.src(['*.html'], {cwd: 'src'})
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(templateCache({
            module: 'ui-notification',
        }))
        .pipe(rename('angular-ui-notification.templates.js'))
        .pipe(gulp.dest("build"));
});

gulp.task('service', ['templates'], function() {
    gulp.src(['src/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .pipe(ngmin())
        .pipe(addsrc('build/*.js'))
        .pipe(order([
            'src/*.js',
            'build/angular-ui-notification.templates.js'
        ]))
        .pipe(concat('angular-ui-notification.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(header(banner, { pkg : pkg }))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('demo'))
        .pipe(notify("File '<%= file.relative %>' has been compiled!"));
});

// ======
gulp.task('e2eTest', function() {
    gulp.src(['./test/**/*_spec.js'])
        .pipe(protractor({
            configFile: "protractor_conf.js",
        }))
        .on('error', function(e) {throw e});
});

gulp.task('tests', ['e2eTest']);
gulp.task('build', ['service', 'styles']);
gulp.task('deploy', ['build', 'tests']);

gulp.task('default', ['deploy'], function() {});