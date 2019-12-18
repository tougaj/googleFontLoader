const gulp = require('gulp');
const ts = require('gulp-typescript');
var changed = require('gulp-changed');

let paths = {
	scripts: {
		src: ['src/**/*.ts', '!src/**/*.d.ts'],
		dest: './dist'
	},
};

let tsProject = ts.createProject('./tsconfig.json');
function typeScripts(){
	let tsResult = gulp.src(paths.scripts.src)
		.pipe(changed(paths.scripts.dest, {extension: '.js'}))
		.pipe(tsProject());

	return tsResult.js.pipe(gulp.dest(paths.scripts.dest));
}

function watch(){
	gulp.watch(paths.scripts.src, gulp.series(typeScripts));
}

gulp.task('ts', typeScripts);

let development = gulp.series(typeScripts, watch);
gulp.task('default', development);
