const { LINKS } = require('./utils/dictionary')
const contacts = LINKS.map(item => `<a href="${item.href}" title="${item.title}" target="${item.target || ''}"><i class="iconfont ${item.icon}" style="color: ${item.color}"></i></a>`)

module.exports = {
  base: '/',
  title: 'chlorine\'s blog',
  description: 'chlorine\'s blog',
  head: [
    ['script', {}, 'var _hmt = _hmt || [];(function() {if(location.host !== "www.chlorine.site") return;var hm = document.createElement("script");hm.src = "https://hm.baidu.com/hm.js?d8d60e7ae4a779698e2d60a30ff11fa4";var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(hm, s);})();'],
    ['link', { rel: 'icon', href: 'https://img.chlorine.site/head.jpg' }],
    ['link', { rel: 'stylesheet', href: 'https://at.alicdn.com/t/c/font_952822_dgtfvniygmi.css'}],
  ],
  plugins: [
    'vuepress-plugin-click',
    ['@vuepress/back-to-top', false],
    'vuepress-plugin-rocket',
    ['vuepress-plugin-zooming', {
      selector: '.content :not(a) img'
    }]
  ],
  theme: 'meteorlxy',
  // 主题配置
  themeConfig: {
    // 主题语言，参考下方 [主题语言] 章节
    lang: 'zh-CN',

    // 个人信息（没有或不想设置的，删掉对应字段即可）
    personalInfo: {
      // 昵称
      nickname: 'chlorine',

      // 个人简介
      description: `
        <p class="side-desc side-desc-word">Sometimes ever, sometimes never</p>
        <p class="side-desc"><i class="iconfont icon-skill" style="color:rgb(22, 155, 250)"></i> Front-end, Python learning</p>
        <p class="side-desc"><i class="iconfont icon-aixin1" style="color:rgb(244, 110, 101)"></i> Coding, Cats</p>
        <div class="side-contacts">
          ${contacts.join('')}
        </div>
      `,

      // // 电子邮箱
      // email: 'nicksonlvqq@gmail.com',

      // // 所在地
      // location: 'ShangHai',

      // 头像
      // 设置为外部链接
      avatar: 'https://img.chlorine.site/head.jpg',
      

      // 社交平台帐号信息
      // sns: {
      //   // Github 帐号和链接
      //   github: {
      //     account: 'meteorlxy',
      //     link: 'https://github.com/meteorlxy',
      //   },

      //   // 掘金 帐号和链接
      //   juejin: {
      //     account: 'meteorlxy',
      //     link: 'https://juejin.im/user/5c6fa9dde51d453fcb7baf09',
      //   },
      // },
    },

    // 上方 header 的相关设置
    header: {
      // header 的背景，可以使用图片，或者随机变化的图案（geopattern）
      background: {
        // 使用图片的 URL，如果设置了图片 URL，则不会生成随机变化的图案，下面的 useGeo 将失效
        // url: '/assets/img/bg.jpg',

        // 使用随机变化的图案，如果设置为 false，且没有设置图片 URL，将显示为空白背景
        useGeo: true,
      },

      // 是否在 header 显示标题
      showTitle: true,
    },

    // 底部 footer 的相关设置 (可选)
    footer: {
      // 是否显示 Powered by VuePress
      poweredBy: false,

      // 是否显示使用的主题
      poweredByTheme: false,

      // 添加自定义 footer (支持 HTML)
      custom: 'Copyright © 2017-2024 <a href="https://www.chlorine.site/" target="_blank">chlorine</a> | <a href="http://beian.miit.gov.cn/">沪ICP备2024107248号</a>',
    },

    // 是否显示文章的最近更新时间
    lastUpdated: true,

    // 顶部导航栏内容
    nav: [
      { text: '首页', link: '/', exact: true },
      { text: '文章', link: '/posts/', exact: false },
      { text: '关于', link: '/about/', exact: false },
    ],

    // 评论配置，参考下方 [页面评论] 章节
    comments: {
      owner: 'lvqq',
      repo: 'blog',
      clientId: 'e4da136aba26cf86d754',
      clientSecret: '7f180cf22c126d80991bfe2df6a84f6d66cc67b5',
      autoCreateIssue: false,
      locale: 'zh-CN',
      perPage: 5,
      prefix: '[Blog] ',
      labels: ['blog'],
    },
    // comments: false,

    // 分页配置
    pagination: {
      perPage: 5,
    },

    // 默认页面（可选，默认全为 true）
    defaultPages: {
      // 是否允许主题自动添加 Home 页面 (url: /)
      home: true,
      // 是否允许主题自动添加 Posts 页面 (url: /posts/)
      posts: true,
    },
  },
}