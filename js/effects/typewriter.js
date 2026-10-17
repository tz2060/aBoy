/**
 * typewriter.js —— 效果层｜只做一件事：把一组文案逐字循环「打」进指定元素
 *
 * 用法：App.effects.typewriter(node, ['文案一', '文案二'], { typeSpeed: 90 })
 * 已开启「减少动态效果」时直接显示第一条文案。
 */
(function (global) {
  'use strict';

  function typewriter(node, lines, options) {
    if (!node || !lines || !lines.length) return;

    var opts = options || {};
    var typeSpeed = opts.typeSpeed || 90;
    var deleteSpeed = opts.deleteSpeed || 45;
    var holdTime = opts.holdTime || 1600;

    var reduceMotion = global.matchMedia
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      node.textContent = lines[0];
      return;
    }

    var lineIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var line = lines[lineIndex];

      if (!deleting) {
        charIndex += 1;
        node.textContent = line.slice(0, charIndex);

        if (charIndex >= line.length) {
          deleting = true;
          global.setTimeout(tick, holdTime);
          return;
        }
        global.setTimeout(tick, typeSpeed);
        return;
      }

      charIndex -= 1;
      node.textContent = line.slice(0, charIndex);

      if (charIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        global.setTimeout(tick, typeSpeed * 2);
        return;
      }
      global.setTimeout(tick, deleteSpeed);
    }

    node.textContent = '';
    global.setTimeout(tick, typeSpeed);
  }

  global.App = global.App || {};
  global.App.effects = global.App.effects || {};
  global.App.effects.typewriter = typewriter;
})(window);
