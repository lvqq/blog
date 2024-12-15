---
category: Engineering
date: 2018-11-22
title: 使用gulp实现前端自动化
vssue-title: 使用gulp实现前端自动化
---

![](https://img.chlorine.site/2018-11-22/00.png)

gulp是一个自动化构建工具，开发者可以用它来自动执行一些常见的任务。这里以我之前做的一个demo为例，简要介绍如何使用gulp实现前端工程自动化

<!-- more -->

## 项目结构

![](https://img.chlorine.site/2018-11-22/01.jpg)

其中`src`目录下表示的是项目的源代码，可以看到其中有less、js、html等，而`dist`目录则是保存的是`gulp`编译后生成的代码，相当于生产环境。最后也最重要的是`gulpfile.js`，这个文件用于设置`gulp`相关的配置，类似于`webpack`中的`webpack.config.js`。

## 安装

这里使用的`gulp`为v3.9.1，语法和最新的v4.x有所出入，想学习最新的`gulp`语法，可以参考[gulp.js - The streaming build system ](https://gulpjs.com/)。

3.9.1 安装如下：

```bash
npm install --save-dev gulp
```

### 语法

- `gulp.task()`用于定义一个`gulp`任务，在命令行中可以使用`gulp [任务名]`开启该任务。
- `gulp.src()`会返回符合匹配的文件流，可以被`pipe()`到其他插件中。
- `gulp.dest()`：输出所有数据。
- `gulp.watch()`用于监测文件的变动。

## 实践

在这个项目中，有一些常见的需求，这里使用`gulp`来实现自动化：

- less转css
- css压缩合并
- js压缩合并
- 图片压缩

在`gulpfile.js`中首先需要导入`gulp`和一些常用的插件，本次demo使用到的插件如下：

```javascript
var gulp = require('gulp'),
    less = require('gulp-less'),                   //less 转 css
    csso = require('gulp-csso'),                   //css压缩
    concat = require('gulp-concat'),               //合并文件
    uglify = require('gulp-uglify'),               //js 压缩
    jshint = require('gulp-jshint'),               //js 检查
    clean = require('gulp-clean'),                 //清除文件
    imagemin = require('gulp-imagemin'),           //图片压缩
    rev = require('gulp-rev'),                     //添加版本号
    revReplace = require('gulp-rev-replace'),      //版本号替换
    useref = require('gulp-useref'),               //解析html资源定位
    gulpif = require('gulp-if'),                   //if语句
    connect = require('gulp-connect');             //创建web服务器
```

### 图片压缩

获取到`src`下所有以`.jpg`或`.png`结尾的图片，将其压缩后输出到`dist`目录下。

```javascript
gulp.task('dist:img', () => {
    gulp.src(['./src/**/*.jpg', './src/**/*.png'])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/'))
})
```

### less压缩合并为css

先清除已存在的css，然后将`src`下以`.less`结尾的文件通过`less()`转为css文件，再通过`csso()`以及`concat()`实现对css的压缩合并。

```javascript
gulp.task('dist:css', () => {
    gulp.src('dist/css/*.css').pipe(clean());
    return gulp.src('./src/less/*.less')
    .pipe(less())
    .pipe(csso())
    .pipe(concat('public.css'))
    .pipe(gulp.dest('dist/css/'));
});
```

### js压缩合并

js压缩合并的过程大同小异，增加了一个`jshint()`代码审查的过程，它会将不符合规范的错误代码输出到控制台。

```javascript
gulp.task('dist:js', () => {
    gulp.src('dist/js/*.js').pipe(clean());
    return gulp.src('./src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(concat('public.js'))
    .pipe(gulp.dest('dist/js/'))
});
```

### less转css

在开发过程中，因为`html`不能直接引入`.less`文件，因此还需要生成开发环境的`.css`。

```javascript
gulp.task('src:css', () => {
    gulp.src('src/css/*.css').pipe(clean());
    return gulp.src('./src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('src/css/'));
});
```

### 添加版本号

为了防止浏览器对文件进行缓存，需要对文件添加版本号，保证每次获取到的都是最新的代码。

```javascript
gulp.task('revision', ['dist:css', 'dist:js'], () => {
    return gulp.src(["dist/css/*.css", "dist/js/*.js"])
    .pipe(rev())
    .pipe(gulpif('*.css', gulp.dest('dist/css'), gulp.dest('dist/js')))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'))
})
gulp.task('build', ['dist:img'], () => {
    var manifest = gulp.src('dist/rev-manifest.json');
    return gulp.src('src/index.html')
    .pipe(revReplace({
        manifest: manifest
    }))
    .pipe(useref())
    .pipe(gulp.dest('dist/'))
})
```

在`revision`中，首先通过`rev()`对`dist`目录下的`.css/.js`生成一个文件名带版本号的文件，例如本例中`public.css`生成`public-5c001c53f6.css`，然后分别输出到不同的目录下，最后生成一个`rev-manifest.json`文件，存储了原文件和带版本号文件之间的映射关系，如下：

```json
{
  "public.css": "public-5c001c53f6.css",
  "public.js": "public-93c275a836.js"
}
```

在`build`中，先获取到`rev-manifest.json`中的对象，然后利用`revReplace()`来替换版本号，再使用`useref()`来进行资源的解析定位，最后输出即可。

以引入js文件为例，源html文件中对文件的引入则要改写为以下形式，即以注释的形式写入构建后生成的文件路径，如下:

```html
<!-- build:js ./js/public.js -->
<script src="./js/jquery-1.12.4.min.js"></script>
<script src="./js/myAlbum.js"></script>
<!-- endbuild -->

```

最后生成的html为：

```html
<script src="./js/public-93c275a836.js"></script>

```

具体的语法规则可以参见[gulp-useref](https://www.npmjs.com/package/gulp-useref)。

###### 创建本地服务器并实现自动刷新

使用`connet.server()`来创建一个本地服务器，利用`gulp.watch()`来对`src`下的文件进行监测，如果发生变化，则执行编译`less`为`css`和刷新页面的任务。

```javascript
gulp.task('connect', () => {
    connect.server({
        root: 'src',
        livereload: true,
        port: 8888
    })
})
gulp.task('reload', () => {
    gulp.src('src/*.html')
    .pipe(connect.reload())
})
gulp.task('watch', () => {
    gulp.watch('src/**/*', ['src:css', 'reload'])
})

```

完整的代码可以参见[github](https://github.com/lvqq/Demos/tree/master/gulp-demo)
