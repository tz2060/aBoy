/**
 * main.js —— 启动器｜只做一件事：按注册顺序执行所有模块
 *
 * 单个模块出错不会影响其他模块，错误会带着模块名打印到控制台。
 */
(function (App) {
  'use strict';

  function bootstrap() {
    App.registry.all().forEach(function (module) {
      try {
        module.run();
      } catch (error) {
        console.error('[模块执行失败] ' + module.name, error);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(window.App);
