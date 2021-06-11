// Defining requirements
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var babel = require("gulp-babel");
var postcss = require("gulp-postcss");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");
var sourcemaps = require("gulp-sourcemaps");
var browserSync = require("browser-sync").create();
var del = require("del");
var cleanCSS = require("gulp-clean-css");
var autoprefixer = require("autoprefixer");
const browserify = require("browserify");

// Configuration file to keep your code DRY
var cfg = require("./gulpconfig.json");
var paths = cfg.paths;

/**
 * Compiles .scss to .css files.
 *
 * Run: gulp sass
 */
gulp.task("sass", function () {
  return gulp
    .src(paths.sass + "/*.scss")
    .pipe(
      plumber({
        errorHandler(err) {
          console.log(err);
          this.emit("end");
        },
      })
    )
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sass({ errLogToConsole: true }))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
    .pipe(gulp.dest(paths.css));
});

/**
 * Optimizes images and copies images from src to dest.
 *
 * Run: gulp imagemin
 */
gulp.task("imagemin", () =>
  gulp
    .src(paths.imgsrc + "/**")
    .pipe(
      imagemin(
        [
          // Bundled plugins
          imagemin.gifsicle({
            interlaced: true,
            optimizationLevel: 3,
          }),
          imagemin.mozjpeg({
            quality: 100,
            progressive: true,
          }),
          imagemin.optipng(),
          imagemin.svgo(),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(gulp.dest(paths.img))
);

/**
 * Minifies css files.
 *
 * Run: gulp minifycss
 */
gulp.task("minifycss", function () {
  return gulp
    .src([paths.css + "/styles.css"])
    .pipe(
      sourcemaps.init({
        loadMaps: true,
      })
    )
    .pipe(
      cleanCSS({
        compatibility: "*",
      })
    )
    .pipe(
      plumber({
        errorHandler(err) {
          console.log(err);
          this.emit("end");
        },
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.css));
});

/**
 * Delete minified CSS files and their maps
 *
 * Run: gulp cleancss
 */
gulp.task("cleancss", function () {
  return del(paths.css + "/*.min.css*");
});

// Compile and Compress js
gulp.task("convertJS", function () {
  console.log("Run");
  return gulp
    .src("src/js/*.js")
    .pipe(
      babel({
        presets: ["es2015"],
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
});

// browserify
gulp.task("browserify", function () {
  var b = browserify({
    entries: "dist/js/app.js",
  });

  return b.bundle().pipe(source("bundle.js")).pipe(gulp.dest("dist/js"));
});

/**
 * Compiles .scss to .css minifies css files.
 *
 * Run: gulp styles
 */
gulp.task("styles", function (callback) {
  gulp.series("sass", "minifycss")(callback);
});

gulp.task("scripts", function (callback) {
  gulp.series("convertJS", "browserify")(callback);
});

/**
 * Watches .scss, .js and image files for changes.
 * On change re-runs corresponding build task.
 *
 * Run: gulp watch
 */
gulp.task("watch", function () {
  gulp.watch(
    [paths.sass + "/**/*.scss", paths.sass + "/*.scss"],
    gulp.series("styles")
  );
  gulp.watch("app/js/*.js", gulp.series("scripts"));
  // Inside the watch task.
  gulp.watch(paths.imgsrc + "/**", gulp.series("imagemin-watch"));
  browserSync.init(cfg.browserSyncOptions);
});

/**
 * Starts browser-sync task for starting the server.
 *
 * Run: gulp browser-sync
 */
gulp.task("browser-sync", function () {
  browserSync.init(cfg.browserSyncOptions);
});

/**
 * Ensures the 'imagemin' task is complete before reloading browsers
 */
gulp.task(
  "imagemin-watch",
  gulp.series("imagemin", function () {
    browserSync.reload();
  })
);

/**
 * Starts watcher with browser-sync.
 * Browser-sync reloads page automatically on your browser.
 *
 * Run: gulp watch-bs
 */
gulp.task("watch-bs", gulp.parallel("browser-sync", "watch"));

// Deleting any file inside the /src folder
gulp.task("clean-source", function () {
  return del(["src/**/*"]);
});

/**
 * Deletes all files inside the dist folder and the folder itself.
 *
 * Run: gulp clean-dist
 */
gulp.task("clean-dist", function () {
  return del(paths.dist);
});

/**
 * Deletes all files inside the dist-product folder and the folder itself.
 *
 * Run: gulp clean-dist-product
 */
gulp.task("clean-dist-product", function () {
  return del(paths.distprod);
});

// Run
// gulp compile
// Compiles the styles and scripts and runs the dist task
gulp.task("compile", gulp.series("styles"));

// Run:
// gul
// Starts watcher (default task)
gulp.task("default", gulp.series("watch"));

// gulp.task("start", ["convertJS", "browserify", "watch"]);
