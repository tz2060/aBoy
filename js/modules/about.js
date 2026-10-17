/**
 * about.js —— 渲染模块｜只做一件事：渲染「关于我」区块
 */
(function (App) {
  'use strict';

  function render() {
    var root = App.select('#about');
    if (!root) return;

    var about = App.data.profile.about;
    var el = App.el;

    var heads = el('header', { class: 'section__head', 'data-reveal': true }, [
      el('p', { class: 'section__eyebrow', text: about.eyebrow }),
      el('h2', { class: 'section__title', text: about.title }),
      el('p', { class: 'section__subtitle', text: about.subtitle })
    ]);

    var profileCard = el('div', { class: 'about__card card', 'data-reveal': true }, [
      el('div', { class: 'about__avatar', text: about.avatar, 'aria-hidden': 'true' }),
      el('p', { class: 'about__name', text: App.data.profile.name }),
      el('p', { class: 'about__role', text: App.data.profile.role }),
      el('ul', { class: 'about__facts' }, about.facts.map(function (fact) {
        return el('li', { class: 'fact' }, [
          el('span', { class: 'fact__key', text: fact.key }),
          el('span', { class: 'fact__value', text: fact.value })
        ]);
      }))
    ]);

    var body = el('div', { class: 'about__body', 'data-reveal': true },
      about.paragraphs.map(function (text) {
        return el('p', { class: 'about__text', text: text });
      }).concat([
        el('ul', { class: 'about__tags' }, about.tags.map(function (tag) {
          return el('li', { class: 'chip', text: tag });
        }))
      ])
    );

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'container' }, [
      heads,
      el('div', { class: 'about' }, [profileCard, body])
    ]));
  }

  App.registry.define('关于我', render);
})(window.App);
