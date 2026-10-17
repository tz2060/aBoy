/**
 * copy-text.js —— 交互模块｜只做一件事：把元素上 data-copy 的文本复制到剪贴板
 *
 * 优先使用异步剪贴板 API，不可用时回退到临时文本框方案（便于本地 file:// 打开时使用）。
 */
(function (App) {
  'use strict';

  function init() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-copy]'));
    if (!buttons.length) return;

    function fallbackCopy(text) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();

      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (error) {
        ok = false;
      }

      document.body.removeChild(area);
      return ok;
    }

    buttons.forEach(function (button) {
      var label = button.textContent;
      var timer = null;

      function feedback(ok) {
        button.textContent = ok ? '已复制 ✓' : '复制失败，请手动选择';
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          button.textContent = label;
        }, 1800);
      }

      button.addEventListener('click', function () {
        var text = button.getAttribute('data-copy') || '';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { feedback(true); },
            function () { feedback(fallbackCopy(text)); }
          );
          return;
        }

        feedback(fallbackCopy(text));
      });
    });
  }

  App.registry.define('复制文本', init);
})(window.App);
