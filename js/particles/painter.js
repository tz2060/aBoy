/**
 * painter.js —— 粒子层｜只做一件事：把一帧的粒子画到 2D 画布上
 *
 * 用叠加混合（lighter）画小圆点：越靠近镜头的粒子越大越亮，重叠处自然发光。
 * 点的大小只由 view.unit（远近系数）决定，与画布尺寸、图像放大倍数无关，
 * 因此把点云放大时每个粒子依然是同样大的小点。
 */
(function (global) {
  'use strict';

  function paint(ctx, views, size, options) {
    var opts = options || {};
    var dotRadius = opts.dotRadius === undefined ? 1.8 : opts.dotRadius;
    var minRadius = opts.minRadius === undefined ? 0.7 : opts.minRadius;
    var maxRadius = opts.maxRadius === undefined ? 3.1 : opts.maxRadius;
    var alphaUnit = opts.alphaUnit === undefined ? 0.55 : opts.alphaUnit;
    var alphaBase = opts.alphaBase === undefined ? 0.24 : opts.alphaBase;
    var alphaMax = opts.alphaMax === undefined ? 0.95 : opts.alphaMax;

    ctx.clearRect(0, 0, size.width, size.height);
    ctx.globalCompositeOperation = 'lighter';

    for (var index = 0; index < views.length; index += 1) {
      var view = views[index];

      var radius = view.unit * dotRadius;
      if (radius < minRadius) radius = minRadius;
      else if (radius > maxRadius) radius = maxRadius;

      var alpha = view.unit * alphaUnit;
      if (alpha < alphaBase) alpha = alphaBase;
      else if (alpha > alphaMax) alpha = alphaMax;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = view.color;
      ctx.beginPath();
      ctx.arc(view.x + view.dx, view.y + view.dy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.paintFrame = paint;
})(window);
