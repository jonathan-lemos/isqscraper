// WARNING: gulpfile must be ES5

var gulp        = require("gulp");
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul"),
    browserSync = require("browser-sync").create();

var tsProject = tsc.createProject("tsconfig.json");

gulp.task("copy-mode-sicxe", function() {
    return gulp.src("src/sicxe.js")
        .pipe(gulp.dest("node_modules/brace/mode/sicxe"))
})

gulp.task("build-app", gulp.series("copy-mode-sicxe", function () {
    return gulp.src([
        "src/**/*.ts",
        "src/**/*.tsx",
    ])
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
}));

gulp.task("lint", function () {
    return gulp.src([
        "src/**/*.ts",
        "src/**/*.tsx",
        "tests/*.ts",
        "test/**/*.tsx"
    ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task("bundle", function () {
    var libraryName = "sicness";
    var mainTsFilePath = "dist/app.js";
    var outputFolder = "docs/";
    var outputFileName = libraryName + ".min.js";

    var bundler = browserify({
        debug: true,
        standalone: libraryName
    }).ignore(["jquery"]);

    return bundler.add(mainTsFilePath)
        .bundle()
        .pipe(source(outputFileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputFolder));
});


//gulp.task("watch", gulp.series("default", function() {
//    browserSync.init({
//        server: "."
//    });
//
//    gulp.watch([ "src/**/**.ts", "tests/**/**.ts" ], ["default"]);
//    gulp.watch("dst/*.js").on('change', browserSync.reload);
//}));

var tsTestProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function () {
    return gulp.src([
        "tests/*.ts",
        "test/*.tsx",
    ])
        .pipe(tsTestProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task("istanbul:hook", function () {
    return gulp.src(["dist/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", gulp.series("build-test", "istanbul:hook", function () {
    return gulp.src("dist/*.test.js")
        .pipe(mocha({ ui: "bdd" }))
        .pipe(istanbul.writeReports());
}));

gulp.task("default", gulp.series("build-app", "bundle"));