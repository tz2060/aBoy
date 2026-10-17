/**
 * select.js —— 核心层｜只做一件事：按选择器取出页面元素
 *
 * 取不到时打印警告并返回 null，调用方只需判断空值，不必自己写容错。
 */
(function (global) {
  'use strict';

  function select(selector, scope) {
    var root = scope || document;
    var node = root.querySelector(selector);
    if (!node) {
      console.warn('[select] 未找到元素：' + selector);
      return null;
    }
    return node;
  }

  global.App = global.App || {};
  global.App.select = select;
})(window);
