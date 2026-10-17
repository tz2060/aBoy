/**
 * back-to-top.js —— 交互模块｜只做一件事：控制「回到顶部」按钮的显示与滚动
 */
(function (App) {
  'use strict';

  function init() {
    var button = document.getElementById('back-to-top');
    if (!button) return;

    var ticking = false;
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    function update() {
      ticking = false;
      button.hidden = window.scrollY < window.innerHeight * 0.6;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    button.addEventListener('click', function () {
      if (smooth && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  App.registry.define('回到顶部', init);
})(window.App);
