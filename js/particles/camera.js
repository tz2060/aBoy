/**
 * camera.js —— 粒子层｜只做一件事：管理视角（自动旋转 + 把 3D 点投影成屏幕坐标）
 *
 * project(point, size, out) 会把结果写进 out，避免每帧创建对象：
 *   out.x / out.y —— 屏幕坐标（按 zoom 放大后的位置）
 *   out.scale     —— 定位用的缩放（会随画布尺寸和 zoom 变化）
 *   out.unit      —— 只反映远近的系数（= distance / depth，与画布尺寸、zoom 都无关）
 *                    粒子大小和亮度用它，所以图像放大时点的大小保持不变
 *
 * anchorX / anchorY 决定这团点云投影到画布的哪个位置（0.5 为正中，0.667 为宽度的 2/3 处）。
 * 点云的基准尺寸取 √(宽 × 高)，所以窗口变宽、变高时它都会等比例跟着变。
 */
(function (global) {
  'use strict';

  function create(options) {
    var opts = options || {};
    var autoRotate = opts.autoRotate === undefined ? 0.16 : opts.autoRotate;
    var tilt = opts.tilt === undefined ? -0.22 : opts.tilt;
    var distance = opts.distance || 2.6;
    var focalFactor = opts.focalFactor || 1;
    var zoom = opts.zoom || 1;
    var anchorX = opts.anchorX === undefined ? 0.5 : opts.anchorX;
    var anchorY = opts.anchorY === undefined ? 0.5 : opts.anchorY;

    var yaw = 0;

    function update(dt) {
      yaw = (yaw + autoRotate * dt) % (Math.PI * 2);
    }

    function project(point, size, out) {
      var cosYaw = Math.cos(yaw);
      var sinYaw = Math.sin(yaw);

      /* 绕 Y 轴旋转 */
      var x1 = point.x * cosYaw + point.z * sinYaw;
      var z1 = point.z * cosYaw - point.x * sinYaw;

      /* 绕 X 轴俯仰 */
      var cosTilt = Math.cos(tilt);
      var sinTilt = Math.sin(tilt);
      var y2 = point.y * cosTilt - z1 * sinTilt;
      var z2 = point.y * sinTilt + z1 * cosTilt;

      /* 透视：越近越靠外 */
      var depth = distance + z2;
      if (depth < 0.4) depth = 0.4;

      /* 基准尺寸取「页面面积的平方根」：窗口变宽或变高，点云都会等比例跟着变 */
      var focal = Math.sqrt(size.width * size.height) * focalFactor;
      var scale = (focal / depth) * zoom;

      out.x = size.width * anchorX + x1 * scale;
      out.y = size.height * anchorY + y2 * scale;
      out.scale = scale;
      out.unit = distance / depth;

      return out;
    }

    return { update: update, project: project };
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.createCamera = create;
})(window);
