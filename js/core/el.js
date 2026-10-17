/**
 * el.js —— 核心层｜只做一件事：根据描述创建 DOM 元素
 *
 * 用法：App.el('div', { class: 'card', text: '内容' }, [子元素或字符串])
 * 支持的描述字段：class / text / html / dataset / style / on* 事件 / 其余作为属性
 */
(function (global) {
  'use strict';

  function createEl(tag, options, children) {
    var node = document.createElement(tag);
    var opts = options || {};

    Object.keys(opts).forEach(function (key) {
      var value = opts[key];
      if (value === null || value === undefined || value === false) return;

      if (key === 'class') {
        node.className = value;
      } else if (key === 'text') {
        node.textContent = value;
      } else if (key === 'html') {
        node.innerHTML = value;
      } else if (key === 'dataset') {
        Object.keys(value).forEach(function (dataKey) {
          node.dataset[dataKey] = value[dataKey];
        });
      } else if (key.indexOf('on') === 0 && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) {
        node.setAttribute(key, '');
      } else {
        node.setAttribute(key, value);
      }
    });

    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });

    return node;
  }

  global.App = global.App || {};
  global.App.el = createEl;
})(window);
