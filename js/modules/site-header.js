/**
 * site-header.js —— 渲染模块｜只做一件事：渲染顶部导航条
 *
 * 只输出结构，导航高亮由 scroll-spy.js 负责。
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#site-header');
    if (!root) return;

    var profile = App.data.profile;
    var el = App.el;

    var brand = el('a', { class: 'brand', href: '#hero', 'aria-label': profile.name + ' 的个人主页' }, [
      el('span', { class: 'brand__logo', text: '🐋', 'aria-hidden': 'true' }),
      el('span', { class: 'brand__name', text: profile.name }),
      el('span', { class: 'brand__badge', text: profile.brand })
    ]);

    var nav = el('nav', { class: 'nav', 'aria-label': '主导航' },
      profile.nav.map(function (item) {
        return el('a', { class: 'nav__link', href: item.href, text: item.label });
      })
    );

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'container header__inner' }, [brand, nav]));
  }

  App.registry.define('顶部导航', render);
})(window.App);
