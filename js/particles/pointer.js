/**
 * pointer.js —— 粒子层｜只做一件事：记录鼠标相对画布的位置与是否还在页面里
 *
 * 监听整个窗口而不是画布本身：粒子层是背景层（不接收鼠标事件），
 * 这样鼠标在页面任何位置移动，粒子都能跟着响应。
 * 对外只暴露 get()：{ x, y, active }，坐标已换算成画布内的 CSS 像素。
 */
(function (global) {
  'use strict';

  function create(canvas) {
    var state = { x: 0, y: 0, active: false };

    if (!canvas) {
      return { get: function () { return state; } };
    }

    function track(event) {
      var rect = canvas.getBoundingClientRect();
      state.x = event.clientX - rect.left;
      state.y = event.clientY - rect.top;
      state.active = true;
    }

    function release() {
      state.active = false;
    }

    global.addEventListener('pointermove', track, { passive: true });
    global.addEventListener('blur', release);
    document.addEventListener('mouseleave', release);
    document.addEventListener('pointercancel', release);

    return { get: function () { return state; } };
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.createPointer = create;
})(window);
