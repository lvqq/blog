---
category: Engineering
date: 2022-10-23
title: pnpm 原理解析
vssue-title: pnpm 原理解析
---

`pnpm` 作为当前比较流行的包管理器之一，主要特点是速度快、节省磁盘空间，本文将介绍 `pnpm` 的底层实现，帮助你理解 `pnpm` 的原理

<!-- more -->

## pnpm 简介
`pnpm` 的含义是 `performant npm`，意味着高性能 `npm`，从官网中提供的 `benchmarks` 也可以看出在 `intall`、`update` 等场景时对于 `npm`、`yarn`、`yarn_pnp` 有不错的性能优势：

![](https://img.chlorine.site/2022-10-23/01.png)

## node_modules 的目录结构

### 嵌套结构
在 `npm@2` 的早期版本中，对应 `Node.js 4.x` 及以前的版本，`node_modules` 在安装时是嵌套结构

一个简单的[例子](https://github.com/lvqq/blog-samples/tree/master/pnpm/01-npm%402)，`demo-foo` 和 `demo-baz` 中均依赖 `example-bar`，在同时安装 `demo-foo` 和 `demo-baz` 时会生成如下的 `node_modules` 结构：
```
node_modules
└─ demo-foo
   ├─ index.js
   ├─ package.json
   └─ node_modules
      └─ demo-bar
         ├─ index.js
         └─ package.json
└─ demo-baz
   ├─ index.js
   ├─ package.json
   └─ node_modules
      └─ demo-bar
         ├─ index.js
         └─ package.json
```

这个时候的目录结构虽然比较清晰，但是每个依赖包都会有自己的 `node_modules`，相同的依赖并没有复用，例如上面的相同依赖 `demo-bar` 就被安装了两次

另外一个问题是 `windows` 的[最长路径限制](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=registry)，在复杂项目场景依赖层级较深时，依赖的路径往往会超出长度限制

### 扁平结构
为了解决上述问题，`yarn` 提出了扁平结构的设计，将所有的依赖在 `node_modules` 中平铺，后来的 `npm v3`版本的实现也与之类似，因此使用 `yarn` 或者 `npm@3+` 安装上述的例子，将会得到如下扁平式的目录结构：
```
node_modules
└─ demo-bar
   ├─ index.js
   └─ package.json
└─ demo-baz
   ├─ index.js
   └─ package.json
└─ demo-foo
   ├─ index.js
   └─ package.json
```

另外这种方式对于相同依赖的不同版本，则只会将其中一个进行提升，剩余的版本则还是嵌套在对应的包中，例如我们上面的 `demo-foo` 中对于 `demo-bar` 的依赖升级到 `v1.0.1` 版本，则会得到下面的结构，具体哪个版本会提升到最顶层则取决于安装时的顺序（[示例](https://github.com/lvqq/blog-samples/tree/master/pnpm/03-npm-doppelgangers)）：
```
node_modules
└─ demo-bar
   ├─ index.js
   └─ package.json
└─ demo-baz
   ├─ index.js
   ├─ package.json
   └─ node_modules
      └─ demo-bar
         ├─ index.js
         └─ package.json
└─ demo-foo
   ├─ index.js
   ├─ package.json
   └─ node_modules
      └─ demo-bar
         ├─ index.js
         └─ package.json
```

### 扁平结构存在的问题
扁平化的方案并不完美，反而引入了一些新的问题：

#### 幽灵依赖
幽灵依赖（Phantom dependencies）指的是没有显示声明在 `package.json` 中的依赖，却可以直接引用到对应的包，这个问题是由扁平化的结构产生的，会将依赖的依赖也至于 `node_modules` 的顶层，也就可以在项目中直接引用到。当某一天这个子依赖不再是引用包的依赖时，项目中的引用则会出现问题

#### 分身问题
NPM 分身（NPM doppelgangers）则指的是对于相同依赖的不同版本，由于 `hoist` 的机制，只会提升一个，其他版本则可能会被重复安装，还是上面的[例子](https://github.com/lvqq/blog-samples/tree/master/pnpm/03-npm-doppelgangers)，当依赖的 `demo-bar` 的依赖升级到 `v1.0.1` 时，作为 `demo-foo` 和 `demo-baz` 依赖的 `v1.0.0` 版本则以嵌套的形式被重复安装：
```
node_modules
└─ demo-bar // v1.0.1
   ├─ index.js
   └─ package.json
└─ demo-baz
   ├─ index.js
   ├─ package.json
   └─ node_modules
      └─ demo-bar // v1.0.0
         ├─ index.js
         └─ package.json
└─ demo-foo
   ├─ index.js
   ├─ package.json
   └─ node_modules
      └─ demo-bar // v1.0.0
         ├─ index.js
         └─ package.json
```

## pnpm 解题思路
`pnpm` 首先将依赖安装到全局 `store`，然后通过 `symbolic link` 和 `hard link` 来组织目录结构，将全局的依赖链接到项目中，将项目的直接依赖链接到 `node_modules` 的顶层，所有的依赖则平铺于 `node_modules/.pnpm` 目录下，实现了所有项目的依赖共享 `store` 的全局依赖，解决了幽灵依赖和 NPM 分身的问题

### symbolic link 与 hard link

链接是操作系统中文件共享的方式，其中 `symbolic link` 是符号链接，也称软链接，`hard link` 是硬链接，从在使用的角度看，二者没有什么区别，都支持读写，如果是可执行文件也可以直接执行，主要区别在于底层原理不太一样：

![](https://img.chlorine.site/2022-10-23/04.png)

#### hard link
- 硬链接不会新建 `inode`（索引节点），源文件与硬链接指向同一个索引节点
- 硬链接不支持目录，只支持文件级别，也不支持跨分区
- 删除源文件和所有硬链接之后，文件才真正被删除

#### symbolic link
- 符号链接中存储的是源文件的路径，指向源文件，类似于 `Windows` 的快捷方式
- 符号链接支持目录与文件，它与源文件是不同的文件，`inode` 值不一样，文件类型也不同，因此符号链接可以跨分区访问
- 删除源文件后，符号链接依然存在，但是无法通过它访问到源文件

#### 如何创建链接
```bash
# symbolic ink
ln -s myfile mysymlink

# hard link
ln myfile myhardlink
```

### pnpm 实现
在 pnpm 中，会将依赖安装到当前分区的 `<home dir>/.pnpm-store` 位置中，可以通过以下命令获得当前的 `store` 位置：
```bash
pnpm store path
```

然后利用 `hard link` 将所需的包从 `node_modules/.pnpm` 硬链接到 `store` 中，最后通过 `symbolic link` 将 `node_modules` 中的顶层依赖以及依赖的依赖符号链接到 `node_modules/.pnpm` 中，一个依赖 `demo-foo@1.0.1` 和 `demo-baz@1.0.0` 的[例子](https://github.com/lvqq/blog-samples/tree/master/pnpm/04-pnpm)，`node_modules` 结构如下：
```
node_modules
└─ .pnpm
   └─ demo-bar@1.0.0
      └─ node_modules
         └─ demo-bar -> <store>/demo-bar
   └─ demo-bar@1.0.1
      └─ node_modules
         └─ demo-bar -> <store>/demo-bar
   └─ demo-baz@1.0.0
      └─ node_modules
         ├─ demo-bar -> ../../demo-bar@1.0.0/node_modules/demo-bar
         └─ demo-baz -> <store>/demo-baz
   └─ demo-foo@1.0.1
      └─ node_modules
         ├─ demo-bar -> ../../demo-bar@1.0.1/node_modules/demo-bar
         └─ demo-foo -> <store>/demo-foo
└─ demo-baz -> ./pnpm/demo-baz@1.0.0/node_modules/demo-baz
└─ demo-foo -> ./pnpm/demo-baz@1.0.1/node_modules/demo-foo
```

这里引用了官网的截图帮助你更好地理解 `symbolic ink` 与 `hard link` 在项目结构中是如何组织的：

![](https://img.chlorine.site/2022-10-23/02.png)

## 其他能力
`pnpm` 目前可以脱离 `Node.js` 的 `runtime` 去安装使用，还可以通过 `pnpm env` 来对 `Node.js` 版本进行管理，类似 `nvm`，与 `npm/yarn` 完整的功能比较详见：[feature-comparison](https://pnpm.io/feature-comparison)

## 当前不适用的场景

1. 由于 `symbolic link` 在一些场景下有兼容性问题，目前 `Eletron` 以及 `labmda` 部署的应用上无法使用 `pnpm`，详见：[discussion](https://github.com/nodejs/node/discussions/37509)

可以通过在 `.npmrc` 中 `node-linker=hoisted` 可以创建一个没有符号链接的扁平的 `node_modules`，此时 `pnpm` 创建的目录结构将与 `npm/yarn` 类似

2. 由于全局共用同一份 `store`，因此当需要修改 `node_modules` 内的内容时，会直接影响全局 `store` 中对应的内容，对其他项目也会造成影响

关于这个问题，其实最推荐的方式是 `clone`([copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write))，使用写入时复制，默认多个引用指向同一个文件，只有当用户需要修改的时候才进行复制，这样就不会影响其他引用对于源文件内容的读取

但是并不是所有的操作系统都支持，`pnpm` 默认会尝试使用 `clone`，如果不支持，则会退回至使用 `hard link`，你也可以通过在 `npmrc` 中指定 [package-import-method](https://pnpm.io/npmrc#package-import-method) 来手动设置包的引用方式

## 参考
- [Flat node_modules is not the only way](https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way)
- [Symlinked node_modules structure](https://pnpm.io/symlinked-node-modules-structure)
- [完整代码示例](https://github.com/lvqq/blog-samples/tree/master/pnpm)