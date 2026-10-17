/**
 * disturbance.js —— 粒子层｜只做一件事：让鼠标附近的粒子被「推开再弹回」
 *
 * 直接修改屏幕空间点上的 dx / dy（当前偏移）与 vx / vy（速度）：
 *   - 鼠标影响半径内的点获得一个向外的冲量，并带一点切向分量（看起来像被搅动）
 *   - 冲量与速度每帧衰减，偏移量向 0 回弹
 *   - 偏移量有上限 maxOffset，避免出现把粒子甩飞的极端情况
 */
(function (global) {
  'use strict';

  function create(options) {
    var opts = options || {};
    var radius = opts.radius || 120;
    var strength = opts.strength || 7;
    var swirl = opts.swirl === undefined ? 0.35 : opts.swirl;
    var decay = opts.decay || 0.9;
    var springBack = opts.springBack || 0.86;
    var maxOffset = opts.maxOffset || 36;

    function update(views, pointer, dt) {
      /* 把时间差换算成「以 60fps 为 1 帧」的系数，掉帧时也不会突然变形 */
      var frame = Math.min(dt * 60, 2);
      var radiusSquared = radius * radius;

      for (var index = 0; index < views.length; index += 1) {
        var view = views[index];

        if (pointer.active) {
          var offsetX = view.x - pointer.x;
          var offsetY = view.y - pointer.y;
          var distanceSquared = offsetX * offsetX + offsetY * offsetY;

          if (distanceSquared < radiusSquared) {
            var distance = Math.sqrt(distanceSquared) || 1;
            var falloff = 1 - distance / radius;
            var impulse = strength * falloff * falloff * frame;
            var unitX = offsetX / distance;
            var unitY = offsetY / distance;

            view.vx += unitX * impulse - unitY * impulse * swirl;
            view.vy += unitY * impulse + unitX * impulse * swirl;
          }
        }

        view.vx *= Math.pow(decay, frame);
        view.vy *= Math.pow(decay, frame);

        view.dx = view.dx * Math.pow(springBack, frame) + view.vx * frame;
        view.dy = view.dy * Math.pow(springBack, frame) + view.vy * frame;

        var length = Math.sqrt(view.dx * view.dx + view.dy * view.dy);

        if (length > maxOffset) {
          view.dx = (view.dx / length) * maxOffset;
          view.dy = (view.dy / length) * maxOffset;
        }
      }
    }

    return { update: update };
  }

  global.App = global.App || {};
  global.App.particles = global.App.particles || {};
  global.App.particles.createDisturbance = create;
})(window);
