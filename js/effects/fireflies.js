/**
 * fireflies.js —— 效果层｜只做一件事：让几颗发光小点在一段文字的字形里游走
 *
 * 用法：App.effects.fireflies(canvas, { text: '田壮壮', fontSize: 52, count: 26 })
 * 做法：先把文字画到离屏画布取 alpha 当作「字形地图」，萤火虫只在字形内随机游走，
 * 碰到字形边缘就反弹，亮度按各自的相位闪烁。
 */
(function (global) {
  'use strict';

  var COLORS = ['#e8f4ff', '#bfe0ff', '#a9ffd9'];

  function toRgba(hex, alpha) {
    var value = hex.replace('#', '');
    return 'rgba(' + parseInt(value.slice(0, 2), 16) + ','
      + parseInt(value.slice(2, 4), 16) + ','
      + parseInt(value.slice(4, 6), 16) + ',' + alpha + ')';
  }

  function makeSprite(color) {
    var size = 28;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    var ctx = canvas.getContext('2d');
    var radius = size / 2;
    var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);

    gradient.addColorStop(0, toRgba(color, 1));
    gradient.addColorStop(0.22, toRgba(color, 0.7));
    gradient.addColorStop(0.55, toRgba(color, 0.18));
    gradient.addColorStop(1, toRgba(color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  function fireflies(canvas, options) {
    if (!canvas || !canvas.getContext) return null;

    var opts = options || {};
    var text = opts.text || '';
    var count = opts.count || 24;
    var fontFamily = opts.fontFamily
      || '"PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif';

    var ctx = canvas.getContext('2d');
    var sprites = COLORS.map(makeSprite);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var bugs = [];
    var mask = null;
    var width = 1;
    var height = 1;
    var raf = null;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* 字形地图：alpha 够高的像素才算「字里面」 */
    function buildMask() {
      var off = document.createElement('canvas');
      off.width = width;
      off.height = height;

      var painter = off.getContext('2d');
      var fontSize = opts.fontSize || Math.min(height * 0.9, width / Math.max(text.length, 1));

      painter.font = '700 ' + fontSize.toFixed(1) + 'px ' + fontFamily;
      painter.textAlign = 'left';
      painter.textBaseline = 'middle';
      painter.fillStyle = '#ffffff';
      painter.fillText(text, 0, height / 2);

      var data = painter.getImageData(0, 0, width, height).data;

      mask = function (x, y) {
        var px = Math.round(x);
        var py = Math.round(y);
        if (px < 0 || py < 0 || px >= width || py >= height) return false;
        return data[(py * width + px) * 4 + 3] > 90;
      };
    }

    function randomPoint() {
      for (var i = 0; i < 400; i += 1) {
        var x = Math.random() * width;
        var y = Math.random() * height;
        if (mask(x, y)) return { x: x, y: y };
      }
      return { x: width / 2, y: height / 2 };
    }

    function build() {
      bugs = [];

      for (var i = 0; i < count; i += 1) {
        var point = randomPoint();
        bugs.push({
          x: point.x,
          y: point.y,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          seed: Math.random() * Math.PI * 2,
          speed: 0.7 + Math.random() * 0.9,
          size: 2.2 + Math.random() * 1.6,
          color: Math.floor(Math.random() * sprites.length)
        });
      }
    }

    function step(dt) {
      for (var i = 0; i < bugs.length; i += 1) {
        var bug = bugs[i];

        bug.vx += (Math.random() - 0.5) * 0.05 * dt;
        bug.vy += (Math.random() - 0.5) * 0.05 * dt;

        var speed = Math.sqrt(bug.vx * bug.vx + bug.vy * bug.vy);
        if (speed > 0.5) {
          bug.vx = (bug.vx / speed) * 0.5;
          bug.vy = (bug.vy / speed) * 0.5;
        }

        var nx = bug.x + bug.vx * dt;
        var ny = bug.y + bug.vy * dt;

        if (mask(nx, ny)) {
          bug.x = nx;
          bug.y = ny;
        } else {
          bug.vx = -bug.vx;
          bug.vy = -bug.vy;
        }
      }
    }

    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < bugs.length; i += 1) {
        var bug = bugs[i];
        var flicker = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(now * 0.0016 * bug.speed + bug.seed));
        var size = bug.size * (3.2 + flicker * 1.2);

        ctx.globalAlpha = flicker;
        ctx.drawImage(sprites[bug.color], bug.x - size / 2, bug.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function start() {
      resize();
      buildMask();
      build();

      if (reduced) {
        draw(0);
        return;
      }

      var last = 0;

      function frame(now) {
        var dt = last ? Math.min((now - last) / 16.67, 3) : 1;
        last = now;

        step(dt);
        draw(now);
        raf = window.requestAnimationFrame(frame);
      }

      raf = window.requestAnimationFrame(frame);
    }

    var observer = window.ResizeObserver ? new window.ResizeObserver(function () {
      resize();
      buildMask();
      build();
    }) : null;

    if (observer) observer.observe(canvas);

    start();

    return {
      destroy: function () {
        if (raf) window.cancelAnimationFrame(raf);
        if (observer) observer.disconnect();
      }
    };
  }

  global.App = global.App || {};
  global.App.effects = global.App.effects || {};
  global.App.effects.fireflies = fireflies;
})(window);
