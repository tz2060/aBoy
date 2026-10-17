/**
 * pointer.js —— 粒子层｜只做一件事：记录鼠标 / 手指相对画布的位置与「是否在交互」
 *
 * 监听整个窗口而不是画布本身：粒子层是背景层（pointer-events: none），
 * 这样鼠标或手指在页面任何位置移动，粒子都能跟着响应。
 *
 * 手机上手指点一下不会产生 pointermove，所以 pointerdown 也算一次交互，
 * 并在松手后继续保持约 0.6 秒「交互中」，让粒子被推开之后再靠弹簧回弹——
 * 单指点一下就能看到扰动，不必拖动。
 *
 * 对外只暴露 get()：{ x, y, active }，坐标已换算成画布内的 CSS 像素。
 */
(function (global) {
  'use strict';

  /* 松手后继续施加扰动的时间，让「点一下」也有明显反馈 */
  var TAP_HOLD = 600;

  function create(canvas) {
    var state = { x: 0, y: 0, active: false };
    var holdTimer = 0;

    if (!canvas) {
      return { get: function () { return state; } };
    }

    function clearHold() {
      if (holdTimer) {
        global.clearTimeout(holdTimer);
        holdTimer = 0;
      }
    }

    function track(event) {
      var rect = canvas.getBoundingClientRect();
      state.x = event.clientX - rect.left;
      state.y = event.clientY - rect.top;
      state.active = true;
      clearHold();
    }

    /* 松手 / 取消：先保持一小段时间，再回到静止状态 */
    function hold() {
      clearHold();
      holdTimer = global.setTimeout(function () {
        holdTimer = 0;
        state.active = false;
      }, TAP_HOLD);
    }

    function release() {
      clearHold();
      state.active = false;
    }

    global.addEventListener('pointermove', track, { passive: true });
    global.addEventListener('pointerdown', track, { passive: true });
    global.addEventListener('pointerup', hold, { passive: true });
    global.addEventListener('pointercancel', hold);
    global.addEventListener('blur', release);
    document.addEventListener('mouseleave', release);

    return { get: function () { return state; } };
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.createPointer = create;
})(window);
