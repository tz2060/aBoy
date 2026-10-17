/**
 * count-up.js —— 效果层｜只做一件事：让数字从 0 增长到目标值
 *
 * 用法：App.effects.countUp(node, 1200, { suffix: '+' })
 * 元素进入视口后才开始滚动；已开启「减少动态效果」时直接显示最终值。
 */
(function (global) {
  'use strict';

  function countUp(node, target, options) {
    if (!node) return;

    var opts = options || {};
    var suffix = opts.suffix || '';
    var duration = opts.duration || 1200;
    var reduceMotion = global.matchMedia
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render(value) {
      node.textContent = value + suffix;
    }

    if (reduceMotion || !('IntersectionObserver' in global) || !global.requestAnimationFrame) {
      render(target);
      return;
    }

    render(0);

    var observer = new global.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        var startTime = null;

        function step(timestamp) {
          if (startTime === null) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          render(Math.round(target * eased));
          if (progress < 1) global.requestAnimationFrame(step);
        }

        global.requestAnimationFrame(step);
      });
    }, { threshold: 0.35 });

    observer.observe(node);
  }

  global.App = global.App || {};
  global.App.effects = global.App.effects || {};
  global.App.effects.countUp = countUp;
})(window);
