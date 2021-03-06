// npm install --global gulp
// npm install --save-dev gulp gulp-header gulp-eslint gulp-uglify gulp-concat gulp-rename merge-stream gulp-bump

const gulp = require('gulp'),
    fs = require('fs'),
    header = require('gulp-header'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    bump = require('gulp-bump'),
    config = require('./config.json');

function build(cfg) {
    let mainPackage = gulp.src([...cfg.externals, cfg.header, ...cfg.src]);

    mainPackage = mainPackage
        .pipe(eslint({
            rules: {
                'strict': 2,
                'no-alert': 0,
                'no-bitwise': 0,
                'camelcase': 1,
                'curly': 1,
                'eqeqeq': 0,
                'no-eq-null': 0,
                'guard-for-in': 1,
                'no-empty': 1
            },
            globals: [
                'jQuery',
                '$'
            ],
            envs: [
                'browser'
            ]
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat(cfg.filename))
        .pipe(gulp.dest(cfg.dest))
        .pipe(uglify())
        .pipe(header(fs.readFileSync(cfg.header, 'utf8')))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(cfg.dest));

    return mainPackage;
}

gulp.task('release', function () {
    let single = {...config.release, ...config.single},
        fullBuild = {...config.release, ...config.full_build};

    single.src = [...single.src];
    // remove the regular publish 'src/publish.js' and replace with 'src/publish-single.js'
    single.src.splice(-1, 1, 'src/publish-single.js');

    return merge(
        build(config.release),
        build(single),
        build(fullBuild)
    );
});

var getPackageVersion = function () {
  return 'v' + JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
};

gulp.task('bump', done => {
    gulp.src(['./package.json'])
        .pipe(bump())
        .pipe(gulp.dest('./'));

    let headerPath = config.release.header,
        header = fs.readFileSync(headerPath, 'utf-8'),
        version = getPackageVersion();

    header = header.replace(/v?\d\.\d\.\d/, version);
    header = header.replace(/Date: .+/i, 'Date: ' + new Date().toJSON());

    fs.writeFileSync(headerPath, header);
    console.log('git tag -a ' + version + ' -m "release ' + version + '"');

    done();
});