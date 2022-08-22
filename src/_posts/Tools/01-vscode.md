---
category: Tools
tags:
  - VSCode
date: 2020-06-03
title: 你不能错过的 VSCode 插件
vssue-title: 你不能错过的 VSCode 插件
---

![](https://img.chlorine.site/2020-06-03/0.png)

VSCode 是一个轻量级的 IDE，许多功能都是依靠插件来进行支持的，这里介绍一些常见好用的 VSCode 插件，帮助大家提升开发体验和效率~

<!-- more -->

## 自动补全类

- 【Auto Rename Tag】更改 tag 名时自动前后更新
- 【CSS Modules】对 jsx 中使用了 css module 类名的补全和跳转
- 【Vetur】VSCode 官方推荐的针对 vue 文件的扩展，支持高亮、自动补全等


## Snippets 类

- 【JavaScript (ES6) code snippets】 JS 代码片段，e.g.
   - clg => `console.log()` 
   - sto => `setTimeOut(() => {})` 



- 【React-Native/React/Redux snippets for es6/es7】 React 代码片段，e.g.
   - imr => `import React from 'react';` 
   - imrc => `import React, { Component } from 'react';` 



- 【React Hooks Snippets】hooks 代码片段，例如 
   - ush => `const [, set] = useState()`
- 【Vue VSCode Snippets】Vue 代码片段，e.g.
   - vbase =>
```vue
<template>
  <div>
  </div>
</template>
<script>
  export default {
    
  }
</script>
<style lang="scss" scoped>
</style>
```

## 调试类

- 【Code Runner】运行代码文件，支持多种语言。
   - 例如在一个 js 文件中启用Code Runner，将会用 node 去执行该文件
- 【Debugger for Chrome】VSCode 官方推荐，chrome 调试插件
- 【stylelint】为 CSS/Less/SCSS 增加 stylelint 提示
- 【ESLint】VSCode 官方推荐的 eslint 扩展，可以为你的代码增加 eslint 错误提示，还可以在 setting.json 中增加下面的设置来开启保存时自动修复：
```json
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
}
```

## Git 类

- 【GitLens — Git supercharged】对 VSCode git 功能的增强，在代码行末尾增加一段作者注释，方便快速定位；还可以在左侧控制面板查看 文件/单行代码 的 git 历史记录等

![image.png](https://img.chlorine.site/2020-06-03/01.png)

## 视觉类

- 【Bracket Pair Colorizer】根据颜色区别不同层次的括号

![image.png](https://img.chlorine.site/2020-06-03/02.png)

- 【indent-rainbow】使用不同背景色块对缩进进行区分，大片背景色块在视觉上可能会形成阻碍

![image.png](https://img.chlorine.site/2020-06-03/03.png)

- 【Markdown Preview Enhanced】在 VSCode 中预览 markdown 文件

![image.png](https://img.chlorine.site/2020-06-03/04.png)

- 【SVG Viewer】在 VSCode 中预览 SVG 文件
- 【TODO Highlight】高亮 TODO，醒目提示

![](https://img.chlorine.site/2020-06-03/05.png)

- 【vscode-icons】提供一组图标丰富文件夹类型

![image.png](https://img.chlorine.site/2020-06-03/06.png)


## 资源类

- 【filesize】展示文件大小以及一些额外信息

![image.png](https://img.chlorine.site/2020-06-03/07.png)

- 【Import Cost】成本提示，展示引入包的体积大小，但目前 `v0.2.12` 只支持 js/ts，vue 中无法使用

![image.png](https://img.chlorine.site/2020-06-03/08.png)


## 通用类

- 【Chinese (Simplified) Language Pack for Visual Studio Code】中文语言包
- 【Code Spell Checker】检查代码中的英文拼写错误
- 【Project Manager】提供方便快捷的项目管理，可以 save/open 项目

![image.png](https://img.chlorine.site/2020-06-03/09.png)

- 【Setting Sync】可以保存/同步你的 VSCode 设置


