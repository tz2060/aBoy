/**
 * skills.js —— 渲染模块｜只做一件事：渲染「技能」区块
 *
 * 进度条只写出目标值（--value），何时展开由 CSS 配合 reveal.js 决定。
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#skills');
    if (!root) return;

    var skills = App.data.profile.skills;
    var el = App.el;

    var heads = el('header', { class: 'section__head', 'data-reveal': true }, [
      el('p', { class: 'section__eyebrow', text: skills.eyebrow }),
      el('h2', { class: 'section__title', text: skills.title }),
      el('p', { class: 'section__subtitle', text: skills.subtitle })
    ]);

    var groups = el('div', { class: 'skills' }, skills.groups.map(function (group) {
      return el('div', { class: 'skills__group card', 'data-reveal': true }, [
        el('h3', { class: 'skills__group-title' }, [
          el('span', { class: 'skills__group-icon', text: group.icon, 'aria-hidden': 'true' }),
          el('span', { text: group.name })
        ]),
        el('ul', { class: 'skills__list' }, group.items.map(function (item) {
          return el('li', { class: 'skill' }, [
            el('div', { class: 'skill__head' }, [
              el('span', { class: 'skill__name', text: item.name }),
              el('span', { class: 'skill__value', text: item.level + '%' })
            ]),
            el('div', {
              class: 'skill__bar',
              role: 'progressbar',
              'aria-label': item.name,
              'aria-valuenow': item.level,
              'aria-valuemin': 0,
              'aria-valuemax': 100
            }, [
              el('span', { class: 'skill__fill', style: '--value: ' + item.level + '%' })
            ])
          ]);
        }))
      ]);
    }));

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'container' }, [heads, groups]));
  }

  App.registry.define('技能', render);
})(window.App);
