/**
 * scroll-spy.js —— 交互模块｜只做一件事：滚动时高亮当前所在的导航项
 */
(function (App) {
  'use strict';

  /* 页头高度 + 一点余量，用来判断「当前区块」 */
  var OFFSET = 140;

  function init() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    if (!links.length) return;

    var items = links.map(function (link) {
      var selector = link.getAttribute('href');
      var node = selector && selector.charAt(0) === '#' ? document.querySelector(selector) : null;
      return { link: link, node: node };
    }).filter(function (item) {
      return item.node;
    });

    if (!items.length) return;

    var activeId = null;
    var ticking = false;

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;

      items.forEach(function (item) {
        item.link.classList.toggle('is-active', item.node.id === id);
      });
    }

    function update() {
      ticking = false;

      var currentId = items[0].node.id;

      items.forEach(function (item) {
        if (item.node.getBoundingClientRect().top <= OFFSET) currentId = item.node.id;
      });

      setActive(currentId);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  App.registry.define('导航高亮', init);
})(window.App);
