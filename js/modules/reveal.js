/**
 * reveal.js —— 交互模块｜只做一件事：元素进入视口时给它加上 is-visible
 *
 * 隐藏样式只在 html.js-reveal 存在时生效，脚本失效也不会导致内容不可见。
 */
(function (App) {
  'use strict';

  function init() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;

    function showAll() {
      nodes.forEach(function (node) {
        node.classList.add('is-visible');
      });
    }

    if (!('IntersectionObserver' in window)) {
      showAll();
      return;
    }

    document.documentElement.classList.add('js-reveal');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  App.registry.define('滚动入场', init);
})(window.App);
