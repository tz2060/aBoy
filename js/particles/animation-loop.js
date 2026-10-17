/**
 * animation-loop.js —— 粒子层｜只做一件事：按帧调用回调，并把每帧时间差（秒）算好
 *
 * 页面被切到后台时 requestAnimationFrame 会自动暂停，回到前台的时间差会被截断，
 * 所以不会出现「一回来所有粒子瞬间飞走」的现象。
 */
(function (global) {
  'use strict';

  function create(step) {
    var handle = 0;
    var last = 0;
    var running = false;

    function frame(now) {
      if (!running) return;

      var dt = last ? (now - last) / 1000 : 1 / 60;
      if (dt > 0.05) dt = 0.05;
      last = now;

      step(dt);
      handle = global.requestAnimationFrame(frame);
    }

    return {
      start: function () {
        if (running) return;
        running = true;
        last = 0;
        handle = global.requestAnimationFrame(frame);
      },
      stop: function () {
        running = false;
        if (handle) global.cancelAnimationFrame(handle);
        handle = 0;
      }
    };
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.createLoop = create;
})(window);
