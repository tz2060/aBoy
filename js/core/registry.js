/**
 * registry.js —— 核心层｜只做一件事：提供「模块注册表」
 *
 * 每个模块调用 App.registry.define(名称, 执行函数) 自行登记，
 * 启动器（main.js）按登记顺序执行，模块之间互不感知。
 */
(function (global) {
  'use strict';

  function createRegistry() {
    var entries = [];

    return {
      define: function (name, run) {
        if (typeof run !== 'function') {
          console.warn('[registry] 模块「' + name + '」没有可执行的函数，已忽略');
          return;
        }
        entries.push({ name: name, run: run });
      },
      all: function () {
        return entries.slice();
      }
    };
  }

  global.App = global.App || {};
  global.App.registry = createRegistry();
})(window);
