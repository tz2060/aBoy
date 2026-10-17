/**
 * palette.js —— 粒子层｜只做一件事：按高度给每个粒子分配一种颜色
 *
 * 主体按 Y 轴高度渐变（深蓝 → 亮蓝 → 青），另有少量浅色「亮点」让画面有层次。
 */
(function (global) {
  'use strict';

  var DEFAULT_PALETTE = ['#2f4fd8', '#4d6bfe', '#8aa2ff', '#6fe3ff'];
  var DEFAULT_ACCENTS = ['#ffffff', '#7cf7d8'];

  function assignColors(points, options) {
    var opts = options || {};
    var palette = opts.palette || DEFAULT_PALETTE;
    var accents = opts.accents || DEFAULT_ACCENTS;
    var accentRate = opts.accentRate || 0.05;

    if (!points.length) return points;

    var minY = Infinity;
    var maxY = -Infinity;

    points.forEach(function (point) {
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    });

    var span = maxY - minY || 1;

    points.forEach(function (point) {
      var position = (point.y - minY) / span;
      var index = Math.floor(position * palette.length);
      if (index >= palette.length) index = palette.length - 1;

      /* 用坐标算一个稳定的随机数：同一个点每次刷新颜色都一样 */
      var seed = Math.abs(Math.sin(point.x * 12.9898 + point.y * 78.233 + point.z * 37.719) * 43758.5453) % 1;
      var accentIndex = Math.floor((seed / accentRate) * accents.length) % accents.length;

      point.color = seed < accentRate ? accents[accentIndex] : palette[index];
    });

    return points;
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.assignColors = assignColors;
})(window);
