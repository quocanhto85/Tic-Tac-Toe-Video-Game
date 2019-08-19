var gulp = require('gulp'),
    pug = require('gulp-pug');
var fileinclude = require('gulp-file-include');

// gulp.task('pug', function(){
//     return gulp.src(templates.pug)
//         .pipe(pug()) 
//         .pipe(gulp.dest(build));
// });

gulp.task('fileinclude', function(){
    // return gulp.src('./public/html/*.html', 
    //                 './view/*.pug')
    return gulp.src('**/*.html', '**/*.pug')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./public//'))
})
gulp.task('default', gulp.series(['fileinclude']));

