/**
 * contact.js —— 渲染模块｜只做一件事：渲染「联系」区块
 *
 * 只输出结构：带 data-copy 的按钮由 copy-text.js 处理点击行为。
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#contact');
    if (!root) return;

    var contact = App.data.profile.contact;
    var profile = App.data.profile;
    var el = App.el;

    var heads = el('header', { class: 'section__head', 'data-reveal': true }, [
      el('p', { class: 'section__eyebrow', text: contact.eyebrow }),
      el('h2', { class: 'section__title', text: contact.title }),
      el('p', { class: 'section__subtitle', text: contact.subtitle })
    ]);

    var items = el('ul', { class: 'contact__list' }, contact.items.map(function (item) {
      var value = item.href
        ? el('a', { class: 'contact__value', href: item.href, text: item.value })
        : el('span', { class: 'contact__value', text: item.value });

      return el('li', { class: 'contact__item' }, [
        el('span', { class: 'contact__icon', text: item.icon, 'aria-hidden': 'true' }),
        el('span', { class: 'contact__body' }, [
          el('span', { class: 'contact__label', text: item.label }),
          value
        ])
      ]);
    }));

    var actions = el('div', { class: 'contact__actions' }, [
      el('button', {
        class: 'btn btn--primary',
        id: 'copy-email',
        type: 'button',
        text: contact.copyLabel,
        'data-copy': profile.email
      }),
      el('a', { class: 'btn btn--ghost', href: 'mailto:' + profile.email, text: contact.mailLabel })
    ]);

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'container' }, [
      heads,
      el('div', { class: 'contact card', 'data-reveal': true }, [items, actions])
    ]));
  }

  App.registry.define('联系', render);
})(window.App);
