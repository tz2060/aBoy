/**
 * particle-scene.js —— 渲染模块｜只做一件事：把粒子场景装配到固定背景层上
 *
 * 它自己不实现任何算法：几何、上色、视角、指针、扰动、绘制、尺寸同步、帧循环
 * 分别由 js/particles/ 下的模块提供，这里只按顺序把它们接起来。
 */
(function (App) {
  'use strict';

  /* 视角：锚点在页面宽度的 70% 处；focalFactor 0.75 让点云高度约占页面的 70%（16:9 时） */
  var CAMERA = {
    autoRotate: 0.16,
    tilt: -0.22,
    zoom: 1,
    focalFactor: 0.75,
    anchorX: 0.70,
    anchorY: 0.49
  };

  /* 鼠标扰动：影响半径 / 力度 / 最大位移 */
  var DISTURBANCE = { radius: 170, strength: 7, maxOffset: 46 };

  function render() {
    var host = App.select('#particle-layer');
    if (!host) return;

    var particles = App.particles;
    var canvas = App.el('canvas', { class: 'particle-canvas', 'aria-hidden': 'true' });

    host.innerHTML = '';
    host.appendChild(canvas);

    var context = canvas.getContext('2d');
    if (!context) return;

    var model = particles.toPoints(App.data.particles || [], { radius: 1 });
    if (!model.length) return;

    particles.assignColors(model);

    /* 屏幕空间的点：x / y / scale / unit 由 camera 写入，dx / dy / vx / vy 由 disturbance 维护 */
    var views = model.map(function (point) {
      return { x: 0, y: 0, scale: 0, unit: 0, dx: 0, dy: 0, vx: 0, vy: 0, color: point.color };
    });

    var camera = particles.createCamera(CAMERA);
    var disturbance = particles.createDisturbance(DISTURBANCE);
    var pointer = particles.createPointer(canvas);
    var size = { width: 0, height: 0 };

    particles.createCanvasSizer(canvas, function (next) {
      size = next;
    });

    function draw(dt) {
      if (!size.width || !size.height) return;

      camera.update(dt);

      for (var index = 0; index < model.length; index += 1) {
        camera.project(model[index], size, views[index]);
      }

      disturbance.update(views, pointer.get(), dt);
      particles.paintFrame(context, views, size);
    }

    var reduceMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      draw(0);
      return;
    }

    particles.createLoop(draw).start();
  }

  App.registry.define('粒子背景层', render);
})(window.App);
