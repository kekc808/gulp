//Определяем установленные плагины в переменные
var gulp 		 = require('gulp'),
	sass 		 = require('gulp-sass'),
	browserSync  = require('browser-sync'),
	concat 		 = require('gulp-concat'),
	uglify 		 = require('gulp-uglifyjs'),
	cssnano 	 = require('gulp-cssnano'),
	rename 		 = require('gulp-rename'),
	del 		 = require('del'),
	imagemin  	 = require('gulp-imagemin'),
	pngquant	 = require('imagemin-pngquant'),
	cache 		 = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer');

//Преобразует sass файлы в css и загружает в папку app/css
gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass())
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}))
});

//Загружает все установленные js плагины в файл libs.min.js, сжимает его и загружает в папку app/js
gulp.task('scripts', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
	])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'))
});

//Сжимает выбранные css файлы, переименовывает их и загружает в папку app/css, выполнив перед этим таск sass
gulp.task('css-libs', ['sass'], function() {
	return gulp.src([
		'app/css/libs.css',
		'app/css/main.css'
	])
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css'))
});

//Плагин автоматической перезагрузки браузера
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir:'app'
		},
		notify: false
	});
});

//Таск удаления папки dist
gulp.task('del', function() {
	return del.sync('dist');
})

//Чистка кэша

gulp.task('clean', function() {
	return cache.clearAll();
})

//Минификация и кэширование изображений
gulp.task('img', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'))
});

//watch отслеживает все сделанные изменения в файлах и перезагружает страницу, 
//перед этим выполнив включение сервера, преобразование sass и сжатие файлов
gulp.task('watch', ['browserSync', 'css-libs', 'scripts'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

//Собирает проект в продакшн, перед этим удалив папку dist и выолнив сжатие файлов
gulp.task('build', ['del', 'img', 'css-libs', 'scripts'], function() {
	var buildCss = gulp.src('app/css/**/*.min.css')
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src(['app/js/**/*'])
	.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));
});