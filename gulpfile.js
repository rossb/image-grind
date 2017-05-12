const gulp = require('gulp');
const rename = require('gulp-rename');
const imageResize = require('gulp-image-resize');
const imagemin = require('gulp-imagemin');
const parallel = require('concurrent-transform');
const runSequence = require('run-sequence');
const os = require('os');
const del = require('del');
const async = require('async');

// const resizeRange = [768,828,1024,1280,1534,1800,2000,2200,2400,2600,2800,3000,3400,3600,3800,4000,4400,4600,4800,5120];
// const resizeRangeHeight = [1079,1200,1400,1600,1800,2000,2200,2400,2600];
// const resizeRange = [320,640,750,828,1024,1280,1534,1800,2000,2200];
// const resizeRange = [320,640,750,828,1024,1280,1534];
// const resizeRange = [45,90,150,240,320,480,640,750,828,1024,1200,1534,1800];
// const resizeRange = [768,1200,1400,1536,1800,2000,2200,2400,2600];
// const resizeRange = [768,828,1024,1280,1536,1700,1800,1900,2048];
// const resizeRange = [2000];
const resizeRange = [3000];

function resizeImagesByWidth(imageSize, done) {

  console.log(`⏲  resizing ${imageSize}…`);

  gulp.src('in/**/*.{jpg,png,gif}')
    .pipe(parallel(
      imageResize({
        width: imageSize,
        crop: false,
        upscale: false,
        quality: 1,
        percentage: null,
        gravity: 'Center',
        filter: 'Catrom' // "Catrom is very good for reduction, while hermite is good for enlargement"
      }),
      os.cpus().length
    ))
    .pipe(rename(function(path) {
      path.basename += `-${imageSize}`;
    }))
    .pipe(gulp.dest('out-sized'))
    .on('end', done);

}

function resizeImagesByHeight(imageSize, done) {

  console.log(`⏲  resizing ${imageSize}…`);

  gulp.src('in/**/*.{jpg,png,gif}')
    .pipe(parallel(
      imageResize({
        height: imageSize,
        crop: false,
        upscale: false,
        quality: 1,
        percentage: null,
        gravity: 'Center',
        filter: 'Catrom' // "Catrom is very good for reduction, while hermite is good for enlargement"
      }),
      os.cpus().length
    ))
    .pipe(rename(function(path) {
      path.basename += `-${imageSize}h`;
    }))
    .pipe(gulp.dest('out-sized'))
    .on('end', done);

}

gulp.task('resize', function(cb) {

  // del.sync('out-sized');

  async.eachSeries(resizeRange, resizeImagesByWidth, function(err) {
  // async.eachSeries(resizeRangeHeight, resizeImagesByHeight, function(err) {
    if (err) throw err;
    console.log(`Images resized 🎉`);
    return cb();
  })

});

gulp.task('compress:imageoptim', function(cb) {

  // del.sync('out-compressed');

  gulp.src('in/**/*')
    .pipe(gulp.dest('out-compressed'));

  const exec = require('child_process').exec;

  // https://www.npmjs.com/package/imageoptim-cli#usage
  exec('./node_modules/imageoptim-cli/bin/imageOptim --image-alpha --jpeg-mini --quit -d ./out-compressed', function(err) {
    if (err) return cb(err);
    console.log(`Images compressed 🎉`);
    return cb();
  });

});

// (VERY) POOR RESULTS COMPARED TO IMAGEOPTIM
gulp.task('compress:imagemin', function(cb) {

  // del.sync('out-imagemin');

  return gulp.src('out-sized/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('out-compressed'));

});

gulp.task('all', function(cb) {
  runSequence('resize', 'compress:imageoptim', cb);
});

gulp.task('compress', ['compress:imageoptim']);
gulp.task('default', ['all']);

// const graphicsMagick = require('gulp-gm');

// const imageOptim = require('gulp-imageoptim');

// GULP PLUGIN BROKEN
// gulp.task('compress:gulp-imageoptim', function(cb) {
//
//   del.sync('out-gulp-imageoptim');
//
//   return gulp.src('out-sized/**/*.{jpg,png,gif}')
//     .pipe(imageOptim.optimize())
//     .pipe(gulp.dest('out-gulp-imageoptim'));
//
// });
