/**
 * site-footer.js —— 渲染模块｜只做一件事：渲染页脚
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#site-footer');
    if (!root) return;

    var profile = App.data.profile;
    var footer = profile.footer;
    var el = App.el;

    var brand = el('div', { class: 'footer__brand' }, [
      el('span', { class: 'brand__logo', text: '🐋', 'aria-hidden': 'true' }),
      el('span', { text: profile.name + ' · ' + profile.latin })
    ]);

    var meta = el('p', {
      class: 'footer__meta',
      text: '© ' + new Date().getFullYear() + ' ' + profile.name + ' · ' + footer.note
    });

    var links = el('ul', { class: 'footer__links' }, footer.links.map(function (item) {
      return el('li', {}, [
        el('a', { href: item.href, text: item.label })
      ]);
    }));

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'container footer__inner' }, [brand, meta, links]));
  }

  App.registry.define('页脚', render);
})(window.App);
