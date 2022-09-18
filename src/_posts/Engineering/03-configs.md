---
category: Engineering
date: 2022-09-18
title: 快速从零开始搭建一个前端项目
vssue-title: 快速从零开始搭建一个前端项目
---

2022 年了，如何快速从零开始搭建一个合适的前端项目？

<!-- more -->

## 准备工作
首先本地需要安装好 `node` 环境以及包管理工具，推荐直接使用 `pnpm`，也可以通过 `pnpm` 来直接管理 `nodejs` 版本。

pnpm 安装：
```bash
# Mac or Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Windows
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

使用 pnpm 安装 `nodejs` 的 LTS 版本：
```bash
pnpm env use --global lts
```

## 项目搭建
这里我们以搭建一个 `React` + `TypeScript` 项目为例


### 脚手架
脚手架方面，新项目可以考虑直接使用 `vite`，我们通过以下命令创建一个基于 `vite` 的初始化项目：
```bash
pnpm create vite my-react-app --template react-ts
```

进入目录可以看到如下的结构：
```
.
├── public
├── src
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### ESLint
`ESLint` 可以通过静态分析，来审查你代码中的错误，对于前端项目也是不可或缺的存在，这里我们选择社区比较流行的 `airbnb` 风格的 `ESLint` 规则，通过以下命令安装基础的配置与插件：

```bash
pnpm add eslint eslint-config-airbnb-base eslint-plugin-import -D 
```

然后在项目根目录中添加 `.eslintrc.json` 文件：
```json
{
  "extends": [
    "eslint:recommended",
    "airbnb-base",
  ],
  "plugins": [
    "import"
  ],
}
```

#### 支持 TS 和 React
对于 `TypeScript` 以及 `React` 项目，还需要额外的 `parser` 和 `plugin` 来支持：
```bash
# TypeScirpt eslint parser
pnpm add @typescript-eslint/parser @typescript-eslint/eslint-plugin -D

# React eslint plugin
pnpm add eslint-plugin-react eslint-plugin-react-hooks -D
```

在 `.eslintrc.json` 文件中添加相应的规则：
```json
{
   "extends": [
    "eslint:recommended",
    "airbnb-base",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": [
    "import",
    "@typescript-eslint",
    "react",
  ],
  "parser": "@typescript-eslint/parser",
}
```
最后在 `package.json` 中添加对应的 `scripts` 就大功告成了：
```json
{
  "scripts": {
     "lint": "eslint --fix --quiet --ext .ts,.tsx src"
  }
}
```

### prettier
`prettier` 是一个代码格式化工具，可以通过它来实现代码缩进、空行等排版风格的统一，通过以下命令进行安装：
```bash
pnpm add prettier -D
```

然后在根目录中添加 `.prettierrc.json` 配置文件：
```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true
}
```

#### 结合 ESLint 使用
我们可以通过 `prettier` 的 `ESLint` 插件来实现检查 `ESLint` 规则时也同步检查 `prettier` 代码风格的规则：
```bash
pnpm add eslint-plugin-prettier eslint-config-prettier -D
```

安装后在 `.eslintrc.json` 中添加相应配置，注意需要设置 `prettier/prettier` 相关规则为 `error`：
```json
{
  "extends": [
    "eslint:recommended",
    "airbnb-base",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": [
    "import",
    "@typescript-eslint",
    "react",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "prettier/prettier": "error",
  }
}
```

### husky + lint-staged
配置好 `ESLint` 和 `prettier` 之后，你需要一个工作流来触发 lint 的相关检查，这里我们选择比较常用的 `husky` +  `lint-staged` 的组合：
```bash
pnpm add husky lint-staged -D
```

在根目录的 `package.json` 中添加对应的配置：
```json
{
  "lint-staged": {
    "**/*.{ts,tsx}": [
      "eslint --fix --quiet",
      "prettier --write",
      "git add"
    ]
  }
}
```

它会在匹配到 `.ts/.tsx` 后缀的文件时去执行 `ESLint` 和 `prettier` 的修复工作。

你还需要在 `.husky` 中添加 `precommit` 文件来触发 `lint-staged` 的这个行为：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

最后在 `package.json` 的 `scripts` 中添加 `husky` 的初始化脚本，来保证上述钩子能够正常触发：
```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

顺利的话，通过以上配置，你在每次进行 `commit` 之后都会由 `husky` 触发 `precommit` 钩子并由 `lint-staged` 来匹配文件规则，执行相应的 lint 检查与修复。

### vitest
单元测试是项目开发中比较重要的一部分，通过单元测试可以一定程度上保障项目的代码质量以及逻辑的完整性，对于 `vite` 创建的项目，我们选择与之匹配度比较高的测试框架 `vitest` 来编写测试用例，安装如下：
```bash
pnpm create vitest jsdom -D
```

在 `vite.config.ts` 中配置 `vitest`，选择 `js-dom` 环境，这里在顶部添加 `vitest` 的类型声明引入后，即可在 `vitest` 中共享 `vite` 的 `plugins` 等配置，无需配置 `vitest.config.ts` 文件:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    testTimeout: 20000,
    environment: 'jsdom',
  },
});
```

一个使用 `@testing-library/react` 编写的测试用例的简单例子可以参考：[react-typescript](https://github.com/lvqq/cap/blob/main/packages/template-react-typescript)

### github workflow
`CI` 则是项目自动化中比较重要的一环，通过 `CI` 可以帮助你自动执行一些任务，我们以 `github` 为例，这里配置一个 `CI` 相关的 `workflow`, 它的主要功能是在你 `push/pull_request` 代码到 `github` 时，自动执行相关的 `ESLint` 检查、`TypeScript` 类型检查以及对测试用例的执行。

首先我们在根目录新建 `.github/workflows` 文件夹，然后创建一个 `ci.yml` 文件，主要内容为：
```yaml
name: CI
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set node v14
        uses: actions/setup-node@v3
        with:
          node-version: '14'
      - name: Install
        run: npm install
      - name: Lint
        run: npm run lint
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set node v14
        uses: actions/setup-node@v3
        with:
          node-version: '14'
      - name: Install
        run: npm install
      - name: Typecheck
        run: npm run typecheck
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set node v14
        uses: actions/setup-node@v3
        with:
          node-version: '14'
      - name: Install
        run: npm install
      - name: Build
        run: npm run test
```
这里我们创建了三个 job：lint/typecheck/test，它们在触发了 `push/pull_request` 操作后会分别自动执行 `scripts` 中的 `lint/typecheck/test` 命令，其中 `typecheck` 前面没有写，主要内容其实就是 `tsc`

## 如何快速搭建
对于现在的前端项目而言，上述 `TypeScript` 以及 `eslint`、`prettier`、`husky` 等基本上属于标配了，但每次创建一个新项目都需要重新进行这样的一系列配置也比较耗费时间，因此我开发了一个小项目，可以帮助你快速创建一个配置好以上内容的项目，只需要一行代码：
```bash
pnpm create @tooltik/cap my-cap-app --template react-ts
```

- 项目地址：[cap](https://github.com/lvqq/cap)，欢迎试用、提 issue 和 PR