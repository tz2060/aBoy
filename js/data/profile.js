/**
 * profile.js —— 数据层｜只做一件事：提供页面全部内容（不含任何逻辑）
 *
 * 想换成自己的主页，只改这一个文件即可：把下面的文案、链接、数字替换掉。
 */
(function (global) {
  'use strict';

  var profile = {
    brand: '永远少年',
    logo: 'assets/logo.png',
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
      { label: ' I ', href: '#hero' },
      { label: 'me', href: '#about' },
      { label: '喜欢', href: '#skills' },
      { label: '事', href: '#projects' },
      { label: '交流', href: '#contact' }
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
      avatar: 'assets/logo.png',
      facts: [
        { key: '喜欢', value: '计算机，认知科学，运行，游戏' },
        { key: '目标', value: '计算机科学，认知科学，人工智能大语言模型' },
        { key: '常用', value: 'DeepSeek·正在深度求索中。。。' },
        { key: '状态', value: '每天两点一线的读书工作学习' }
      ],
      paragraphs: [
        '我是田壮壮，我喜欢计算机、认知科学、游戏，运动，以及一切美好的事物。',
        '我对人类认知与计算系统的交叉领域十分着迷，希望理解智能系统的运行方式，以及它们如何和人类思维机制产生关联。',
        '而游戏，也是我用来观察计算与认知之间交互的有趣载体。'
        
      ],
      tags: ['计算机科学', '认知科学', '游戏', 'AI', '操作系统', 'LLM 应用','软件工程','数据库']
    },

    /* 技能：level 为进度条百分比 */
    skills: {
      eyebrow: '可以明确实行的有结果的一些想法',
      title: '计划',
      subtitle: '有很多想做的事情，但是有明确目标的，有可验收的成果的想法才是值得全力以赴去努力的目标。',
      groups: [
        {
          icon: '🏃‍♂️',
          name: '运动',
          items: [
            { name: '每天五公里，至少40天', level: 0 },
            { name: '每天散步一小时，用来发呆', level: 0 },

          ]
        },
        {
          icon: '🧠',
          name: '认知神经科学',
          items: [
            { name: '《认知神经科学·关于生物的心智学》', level: 99,label: '已读完'},
            { name: '《生物心理学》', level: 900/12,label: '刚读到第九章' },
            { name: '这一年读过哪些书', level: 999,label: '人性的弱点/优点，梦的解析，这才是心理学，大脑的故事' },
          ]
        },
        {
          icon: '🖥️',
          name: '计算机科学',
          items: [
            { name: '软件工程·《生成式软件工程》', level: 10,label: '刚开始听课，认知到软件工程是一门怎么样的学科，学习怎么去做一个项目' },
            { name: '操作系统·《人工智能时代下的操作系统》', level: 5,label: '在人工智能时代的操作系统应该是怎么样的' },
            { name: '数据库与数据结构', level: 1,label: '怎么去设计一个自己的数据库系统？github？' },
          ]
        },
        {
          icon: '🤖',
          name: 'LLM',
          items: [
            { name: 'minimind', level: 50,label: '学习如何去做一个自己的大语言模型' },
            { name: 'transformer', level: 1,label: '学习Transformer架构' },
            { name: 'PyTorch 工程实践', level: 1,label: '学习PyTorch在实际项目中的应用' },
            { name: '推理部署', level: 1,label: '学习大语言模型在超大计算集群的推理和部署' }
          ]
        }
      ]
    },

    /* 作品 */
    projects: {
      eyebrow: '项目',
      title: '计划要做的一些东西',
      subtitle: '每一个都解决一个具体问题，或者是一个有趣的想法。每一个都可以落地，或者是一个可交付的成果。',
      items: [
        {
          icon: '💬',
          title: 'Chat 对话面板',
          desc: '一个本地优先、数据自主的多模态 AI 对话工作台：接云端 API 或本地模型，支持图片/文件/文本对话，所有会话以 Markdown 可携带格式保存。',
          tags: ['Tauri', 'React', 'TypeScript', 'SQLite', 'Ollama', 'OpenAI API'],
          link: 'https://github.com/',
          linkLabel: '查看项目'
        },
        {
          icon: '🗂️',
          title: '知识库个人助手',
          desc: '实现一个持续为你工作的个人助手，基于向量检索技术，能够快速从你的知识库中找到相关信息，并提供智能化的回答。',
          tags: ['Agent', '个人数据库', '手机端联动', '共享上下文'],
          link: 'https://jyywiki.cn/GSE/2026/lab1.md',
          linkLabel: '了解方案'
        }
      ]
    },

    /* 联系方式：href 为空时渲染成纯文本 */
    contact: {
      eyebrow: '微信邮箱和仓库',
      title: '有想法？随时聊聊',
      subtitle: '无论是工作机会、技术合作，还是单纯想讨论一个产品点子，都欢迎给我发消息。',
      items: [
        { icon: '📫', label: '邮箱', value: '2060362032@qq.com', href: 'mailto:2060362032@qq.com' },
        { icon: '📦', label: 'GitHub', value: 'https://tz2060.github.io/CODE/', href: 'https://github.com/' },
        { icon: '🌏', label: '微信', value: 'tz618033988', href: '' },
      ],
      copyLabel: '复制邮箱',
      mailLabel: '写一封邮件'
    },

    /* 页脚 */
    footer: {
      note: '。',
      links: [
        { label: '回到顶部', href: '#hero' },
        { label: 'GitHub', href: 'https://tz2060.github.io/CODE/' },
        { label: '邮箱', href: 'mailto:2060362032@qq.com' }
      ]
    }
  };

  global.App = global.App || {};
  global.App.data = global.App.data || {};
  global.App.data.profile = profile;
})(window);
