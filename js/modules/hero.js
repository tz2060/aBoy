/**
 * hero.js —— 渲染模块｜只做一件事：渲染首屏区块
 *
 * 结构：文案 + 按钮 + 数字战绩；右侧留白给固定的粒子背景层（由 particle-scene.js 渲染）。
 * 渲染完成后把「打字机」「数字滚动」两件事分别交给 effects 层的模块处理。
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#hero');
    if (!root) return;

    var profile = App.data.profile;
    var el = App.el;
    var counters = [];

    var pieces = [
      el('p', { class: 'badge' }, [
        el('span', { class: 'badge__dot', 'aria-hidden': 'true' }),
        el('span', { text: profile.badge })
      ]),
      el('h1', { class: 'hero__title' }, [
        el('span', { text: '你好，我是 ' }),
        el('span', { class: 'hero__name' }, [
          el('span', { class: 'hero__name-text', text: profile.name }),
          el('canvas', { class: 'hero__name-canvas', 'aria-hidden': 'true' })
        ])
      ]),
      el('p', { class: 'hero__typing' }, [
        el('span', { class: 'hero__typing-text', id: 'hero-typing' }),
        el('span', { class: 'cursor', 'aria-hidden': 'true' })
      ]),
      el('p', { class: 'hero__desc', text: profile.summary }),
      el('div', { class: 'hero__actions' }, [
        el('a', { class: 'btn btn--primary', href: '#projects' }, [
          el('span', { text: '查看我的作品' }),
          el('span', { class: 'btn__arrow', text: '→', 'aria-hidden': 'true' })
        ]),
        el('a', { class: 'btn btn--ghost', href: '#contact', text: '联系我' })
      ])
    ];

    /* 数据里没有数字就不渲染这一排，免得首屏底部留一段空白 */
    if (profile.stats && profile.stats.length) {
      pieces.push(el('ul', { class: 'stats' }, profile.stats.map(function (stat) {
        var valueNode = el('span', { class: 'stat__value', text: '0' });
        counters.push({ node: valueNode, stat: stat });

        return el('li', { class: 'stat' }, [
          valueNode,
          el('span', { class: 'stat__label', text: stat.label })
        ]);
      })));
    }

    var content = el('div', { class: 'container hero' }, pieces);

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'hero__glow hero__glow--a', 'aria-hidden': 'true' }));
    root.appendChild(el('div', { class: 'hero__glow hero__glow--b', 'aria-hidden': 'true' }));
    root.appendChild(content);

    App.effects.typewriter(content.querySelector('#hero-typing'), profile.typewriterLines);

    /* 名字：真文字留着排版和读屏，视觉上换成画布里的发光点阵 */
    var nameText = content.querySelector('.hero__name-text');
    var nameCanvas = content.querySelector('.hero__name-canvas');

    if (nameText && nameCanvas) {
      var nameSize = parseFloat(window.getComputedStyle(nameText).fontSize) || 32;
      App.effects.particleText(nameCanvas, {
        lines: [profile.name],
        hold: 0,
        fontSize: nameSize,
        parallax: 5,
        /* 手机上字号小，点再稀就认不出字了，留多一点 */
        density: nameSize < 40 ? 0.5 : 0.34
      });
    }

    counters.forEach(function (item) {
      App.effects.countUp(item.node, item.stat.value, { suffix: item.stat.suffix });
    });
  }

  App.registry.define('首屏', render);
})(window.App);
