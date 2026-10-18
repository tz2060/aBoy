/**
 * profile.js —— 数据层｜只做一件事：提供页面全部内容（不含任何逻辑）
 *
 * 想换成自己的主页，只改这一个文件即可：把下面的文案、链接、数字替换掉。
 */
(function (global) {
  'use strict';

  var profile = {
    brand: '永远少年',
    name: '田壮壮',
    latin: 'Tz_Boy',
    role: '计算机科学学生，认知脑科学学生',
    email: '2060362032@qq.com',

    /* 首屏 */
    badge: '尝试做一个主页来介绍自己',
    summary: '「认知改变世界，学习改变认知」——喜欢学习、喜欢运动、喜欢游戏。',
    typewriterLines: [
      '认知改变世界',
      '学习改变认知',
      '永远少年，永远赤诚！'
    ],

    /* 顶部导航：href 必须对应页面区块的 id */
    nav: [
      { label: ' ', href: '#hero' },
      { label: 'me', href: '#about' },
      { label: '一些喜欢的东西', href: '#skills' },
      { label: '做过的事', href: '#projects' },
      { label: '联系方式', href: '#contact' }
    ],

    /* 首屏数字：value 为滚动目标值，suffix 为数字后缀 */
    stats: [
     /* { value: 6, suffix: '', label: '年 一线研发经验' },
      { value: 36, suffix: '+', label: '个 交付上线的项目' },
      { value: 1200, suffix: '+', label: '次 年度代码提交' },
      { value: 9, suffix: '', label: '个 开源 / 个人作品' } */
    ],

    /* 关于我 */
    about: {
      eyebrow: 'about me',
      title: '永远少年，对热爱的永远赤诚',
      subtitle: '从学习认知神经科学这本书开始，我就对人类的认知能力产生了浓厚的兴趣。希望通过学习计算机科学与认知脑科学，探索人类认知的奥秘。',
      avatar: '🐋',
      facts: [
        { key: '喜欢的事', value: '计算机，认知科学，运行，游戏' },
        { key: '当前方向', value: '计算机科学，认知科学，人工智能大语言模型' },
        { key: '常用工具', value: 'TypeScript · Vite · Node' },
        { key: '工作状态', value: '开放·合作' }
      ],
      paragraphs: [
        '我是田壮壮，我喜欢认识计算机、认知科学、系统运行原理以及游戏如何开发。',
        '我对人类认知与计算系统的交叉领域十分着迷，希望理解智能系统的运行方式，以及它们如何和人类思维机制产生关联。',
        '而游戏，也是我用来观察计算与认知之间交互的有趣载体。'
        
      ],
      tags: ['计算机科学', '认知科学', '游戏', 'AI', '操作系统', 'LLM 应用']
    },

    /* 技能：level 为进度条百分比 */
    skills: {
      eyebrow: '技能',
      title: '我常用的技术栈',
      subtitle: '不追求罗列，只保留真正在生产环境里反复使用、能独立负责的部分。',
      groups: [
        {
          icon: '🎨',
          name: '前端开发',
          items: [
            { name: 'HTML / CSS', level: 95 },
            { name: 'JavaScript / TypeScript', level: 92 },
            { name: 'Vue 3', level: 90 },
            { name: 'React', level: 82 }
          ]
        },
        {
          icon: '⚙️',
          name: '工程化与后端',
          items: [
            { name: 'Vite / Webpack', level: 86 },
            { name: 'Node.js', level: 80 },
            { name: '自动化测试', level: 74 },
            { name: 'CI / CD', level: 72 }
          ]
        },
        {
          icon: '🧠',
          name: 'AI 应用',
          items: [
            { name: 'LLM 提示与编排', level: 84 },
            { name: 'RAG 检索增强', level: 76 },
            { name: '流式对话界面', level: 88 },
            { name: '数据可视化', level: 70 }
          ]
        },
        {
          icon: '🤝',
          name: '协作与表达',
          items: [
            { name: '技术方案设计', level: 85 },
            { name: '代码评审', level: 88 },
            { name: '文档写作', level: 86 },
            { name: '跨职能沟通', level: 82 }
          ]
        }
      ]
    },

    /* 作品 */
    projects: {
      eyebrow: '作品',
      title: '最近在做的一些东西',
      subtitle: '每一个都解决一个具体问题：要么省时间，要么少出错。',
      items: [
        {
          icon: '🧩',
          title: '组件库 Lumen UI',
          desc: '一套面向中后台的组件库，40+ 组件，配套主题变量与无障碍规范，已在三个业务线复用。',
          tags: ['Vue 3', 'TypeScript', 'Vite'],
          link: 'https://github.com/',
          linkLabel: '查看源码'
        },
        {
          icon: '💬',
          title: 'DeepChat 对话面板',
          desc: '流式输出的 AI 对话界面：支持 Markdown、代码高亮、会话持久化与中断重试，首屏 1.2s 内可交互。',
          tags: ['流式渲染', 'SSE', '性能优化'],
          link: 'https://github.com/',
          linkLabel: '查看项目'
        },
        {
          icon: '📚',
          title: '知识库问答助手',
          desc: '把团队文档接入检索增强问答，回答自带引用来源，新同事上手时间从两周缩短到三天。',
          tags: ['RAG', 'Node.js', '向量检索'],
          link: 'https://github.com/',
          linkLabel: '了解方案'
        }
      ]
    },

    /* 联系方式：href 为空时渲染成纯文本 */
    contact: {
      eyebrow: '联系',
      title: '有想法？随时聊聊',
      subtitle: '无论是工作机会、技术合作，还是单纯想讨论一个产品点子，都欢迎给我发消息。',
      items: [
        { icon: '✉️', label: '邮箱', value: 'hello@linzhiyuan.dev', href: 'mailto:hello@linzhiyuan.dev' },
        { icon: '🐙', label: 'GitHub', value: 'github.com/linzhiyuan', href: 'https://github.com/' },
        { icon: '💬', label: '微信', value: 'linzhiyuan_dev', href: '' },
        { icon: '📝', label: '博客', value: 'blog.linzhiyuan.dev', href: 'https://example.com/' }
      ],
      copyLabel: '复制邮箱',
      mailLabel: '写一封邮件'
    },

    /* 页脚 */
    footer: {
      note: '。',
      links: [
        { label: '回到顶部', href: '#hero' },
        { label: 'GitHub', href: 'https://github.com/' },
        { label: '邮箱', href: 'mailto:hello@linzhiyuan.dev' }
      ]
    }
  };

  global.App = global.App || {};
  global.App.data = global.App.data || {};
  global.App.data.profile = profile;
})(window);
