/**
 * projects.js —— 渲染模块｜只做一件事：渲染「作品」区块
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#projects');
    if (!root) return;

    var projects = App.data.profile.projects;
    var el = App.el;

    var heads = el('header', { class: 'section__head', 'data-reveal': true }, [
      el('p', { class: 'section__eyebrow', text: projects.eyebrow }),
      el('h2', { class: 'section__title', text: projects.title }),
      el('p', { class: 'section__subtitle', text: projects.subtitle })
    ]);

    var list = el('div', { class: 'projects' }, projects.items.map(function (item) {
      return el('article', { class: 'project card', 'data-reveal': true }, [
        el('div', { class: 'project__icon', text: item.icon, 'aria-hidden': 'true' }),
        el('h3', { class: 'project__title', text: item.title }),
        el('p', { class: 'project__desc', text: item.desc }),
        el('ul', { class: 'project__tags' }, item.tags.map(function (tag) {
          return el('li', { class: 'chip chip--brand', text: tag });
        })),
        el('a', {
          class: 'project__link',
          href: item.link,
          target: '_blank',
          rel: 'noopener noreferrer'
        }, [
          el('span', { text: item.linkLabel }),
          el('span', { text: '↗', 'aria-hidden': 'true' })
        ])
      ]);
    }));

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'container' }, [heads, list]));
  }

  App.registry.define('作品', render);
})(window.App);
