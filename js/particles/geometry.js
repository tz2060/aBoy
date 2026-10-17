/**
 * geometry.js —— 粒子层｜只做一件事：把扁平坐标数组整理成「以原点为中心、半径归一」的点数组
 *
 * 输入：[x1, y1, z1, x2, y2, z2, ...]
 * 输出：[{ x, y, z }, ...]，整体平移到几何中心、并按最大半径缩放到 1
 */
(function (global) {
  'use strict';

  function toPoints(flat, options) {
    var opts = options || {};
    var radius = opts.radius || 1;
    var points = [];
    var index;

    for (index = 0; index + 2 < flat.length; index += 3) {
      points.push({ x: flat[index], y: flat[index + 1], z: flat[index + 2] });
    }

    if (!points.length) return points;

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    points.forEach(function (point) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
      if (point.z < minZ) minZ = point.z;
      if (point.z > maxZ) maxZ = point.z;
    });

    var centerX = (minX + maxX) / 2;
    var centerY = (minY + maxY) / 2;
    var centerZ = (minZ + maxZ) / 2;

    points.forEach(function (point) {
      point.x -= centerX;
      point.y -= centerY;
      point.z -= centerZ;
    });

    /* 按「分位半径」而不是最大半径归一：
       少量离群点不会把主体压小，画面里主体才能撑满 */
    var percentile = opts.percentile === undefined ? 0.95 : opts.percentile;
    var distances = points.map(function (point) {
      return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
    }).sort(function (a, b) { return a - b; });

    var index = Math.min(distances.length - 1, Math.floor(distances.length * percentile));
    var reference = distances[index] || 0;
    var scale = reference > 0 ? radius / reference : 1;
    var limit = radius * 1.25;

    points.forEach(function (point) {
      point.x *= scale;
      point.y *= scale;
      point.z *= scale;

      /* 夹紧极端离群点，避免旋转时飞出画面 */
      var length = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
      if (length > limit) {
        var shrink = limit / length;
        point.x *= shrink;
        point.y *= shrink;
        point.z *= shrink;
      }
    });

    return points;
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.toPoints = toPoints;
})(window);
