/**
 * particle-text.js —— 效果层｜只做一件事：把一段文字画成一团发光粒子
 *
 * 用法：App.effects.particleText(canvas, { lines: ['文案一', '文案二'], hold: 3800 })
 * 做法：把文字画到离屏画布上取像素，按点亮的位置生成粒子，再让粒子缓缓聚到目标点；
 * 换行时粒子从当前位置飞向新目标，颜色与背景点云同一套调色板。
 */
(function (global) {
  'use strict';

  var PALETTE = ['#9ab0ff', '#6c8bff', '#4d6bfe', '#6fe3ff'];
  var ACCENT = '#eaf2ff';
  var MAX_PARTICLES = 3200;

  function toRgba(hex, alpha) {
    var value = hex.replace('#', '');
    var r = parseInt(value.slice(0, 2), 16);
    var g = parseInt(value.slice(2, 4), 16);
    var b = parseInt(value.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* 每个颜色预渲染一张发光贴图，画的时候直接 drawImage，省掉逐帧建渐变 */
  function makeSprite(color) {
    var size = 32;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    var ctx = canvas.getContext('2d');
    var radius = size / 2;
    var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);

    gradient.addColorStop(0, toRgba(color, 1));
    gradient.addColorStop(0.25, toRgba(color, 0.5));
    gradient.addColorStop(0.6, toRgba(color, 0.12));
    gradient.addColorStop(1, toRgba(color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  function particleText(canvas, options) {
    if (!canvas || !canvas.getContext) return null;

    var opts = options || {};
    var lines = (opts.lines && opts.lines.length) ? opts.lines.slice() : ['永远少年，永远赤诚！'];
    var hold = opts.hold || 3800;
    var fontFamily = opts.fontFamily
      || '"PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif';

    var ctx = canvas.getContext('2d');
    var sprites = PALETTE.map(makeSprite);
    var accent = makeSprite(ACCENT);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var particles = [];
    var width = 1;
    var height = 1;
    var index = 0;
    var timer = null;
    var raf = null;
    var pointer = { x: 0, y: 0 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* 把文字画到离屏画布，按点亮的位置收集目标点 */
    function sample(text) {
      var off = document.createElement('canvas');
      off.width = width;
      off.height = height;

      var painter = off.getContext('2d');
      var fontSize = Math.max(16, Math.min(height * 0.82, (width * 0.96) / (text.length * 1.04)));

      painter.font = '700 ' + fontSize.toFixed(1) + 'px ' + fontFamily;
      painter.textAlign = 'left';
      painter.textBaseline = 'middle';
      painter.fillStyle = '#ffffff';
      painter.fillText(text, 0, height / 2);

      var data = painter.getImageData(0, 0, width, height).data;
      var step = Math.max(2, Math.round(fontSize / 20));
      var points = [];

      for (var y = 0; y < height; y += step) {
        for (var x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 150) points.push({ x: x, y: y });
        }
      }

      if (points.length > MAX_PARTICLES) {
        var stride = points.length / MAX_PARTICLES;
        var kept = [];
        for (var i = 0; i < points.length; i += stride) kept.push(points[Math.floor(i)]);
        points = kept;
      }

      return { points: points, fontSize: fontSize };
    }

    function setText(text) {
      var result = sample(text);
      var next = [];

      for (var i = 0; i < result.points.length; i += 1) {
        var point = result.points[i];
        var prev = particles[i];

        /* 目标点加一点抖动，别让点阵看起来像 LED 屏 */
        var jitter = result.fontSize * 0.022;

        next.push({
          x: prev ? prev.x : Math.random() * width,
          y: prev ? prev.y : Math.random() * height,
          tx: point.x + (Math.random() - 0.5) * jitter,
          ty: point.y + (Math.random() - 0.5) * jitter,
          z: 0.35 + Math.random() * 0.65,
          seed: Math.random() * Math.PI * 2,
          alpha: prev ? prev.alpha : 0,
          color: Math.min(sprites.length - 1, Math.floor((point.x / width) * sprites.length)),
          bright: Math.random() < 0.05,
          /* 小屏上字号小，给个下限，否则点太小会糊成一片 */
          size: Math.max(1, result.fontSize * (0.016 + Math.random() * 0.016))
        });
      }

      particles = next;
    }

    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < particles.length; i += 1) {
        var p = particles[i];

        p.x += (p.tx - p.x) * 0.14;
        p.y += (p.ty - p.y) * 0.14;
        p.alpha += (1 - p.alpha) * 0.1;

        var wave = Math.sin(now * 0.0011 + p.seed) * (0.6 + p.z * 1.6);
        var px = p.x + pointer.x * p.z * 9;
        var py = p.y + wave + pointer.y * p.z * 5;
        var size = p.size * (2.5 + p.z * 1.3);
        var sprite = p.bright ? accent : sprites[p.color];

        ctx.globalAlpha = Math.min(1, p.alpha) * (0.55 + p.z * 0.45);
        ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(now) {
      draw(now || 0);
      raf = window.requestAnimationFrame(loop);
    }

    function show(text) {
      setText(text);
      if (reduced) draw(0);
    }

    function start() {
      resize();
      show(lines[0]);

      if (reduced) return;

      raf = window.requestAnimationFrame(loop);
      timer = window.setInterval(function () {
        index = (index + 1) % lines.length;
        show(lines[index]);
      }, hold);
    }

    var observer = window.ResizeObserver ? new window.ResizeObserver(function () {
      resize();
      show(lines[index]);
    }) : null;

    if (observer) observer.observe(canvas);

    window.addEventListener('pointermove', function (event) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      pointer.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      pointer.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    }, { passive: true });

    start();

    return {
      destroy: function () {
        if (raf) window.cancelAnimationFrame(raf);
        if (timer) window.clearInterval(timer);
        if (observer) observer.disconnect();
      }
    };
  }

  global.App = global.App || {};
  global.App.effects = global.App.effects || {};
  global.App.effects.particleText = particleText;
})(window);
