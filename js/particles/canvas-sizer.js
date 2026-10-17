/**
 * canvas-sizer.js —— 粒子层｜只做一件事：让画布的像素尺寸始终等于它的 CSS 尺寸（含高清屏倍率）
 *
 * 尺寸变化时把 2D 上下文整体缩放一次，之后所有绘制都可以直接用 CSS 像素坐标。
 * 有 ResizeObserver 时自动跟随布局变化，否则退回监听窗口 resize。
 */
(function (global) {
  'use strict';

  function create(canvas, onChange) {
    var size = { width: 0, height: 0, dpr: 1 };
    var context = canvas.getContext('2d');

    function measure() {
      var rect = canvas.getBoundingClientRect();
      var width = Math.max(1, Math.round(rect.width));
      var height = Math.max(1, Math.round(rect.height));
      /* 背景层覆盖整个视口，倍率封顶 1.5 以控制每帧要清空的像素量 */
      var dpr = Math.min(global.devicePixelRatio || 1, 1.5);

      if (width === size.width && height === size.height && dpr === size.dpr) {
        return size;
      }

      size.width = width;
      size.height = height;
      size.dpr = dpr;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      /* 改过 canvas.width 会重置上下文状态，这里重新应用缩放 */
      if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (onChange) onChange(size);

      return size;
    }

    measure();

    if (typeof global.ResizeObserver === 'function') {
      new global.ResizeObserver(measure).observe(canvas);
    } else {
      global.addEventListener('resize', measure);
    }

    return {
      measure: measure,
      size: function () { return size; }
    };
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.createCanvasSizer = create;
})(window);
