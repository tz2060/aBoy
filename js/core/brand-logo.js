/**
 * brand-logo.js —— 核心层｜只做一件事：按 profile.logo 创建品牌图标节点（页头与页脚共用）
 *
 * profile.logo 填图片路径（含 / 或 .）就渲染 <img>，填单个字符就当作 emoji 渲染，
 * 留空则只输出一个空的占位方块。这样换图标只需要改数据文件里的一个字段。
 */
(function (global) {
  'use strict';

  function createLogo() {
    var profile = global.App.data.profile;
    var el = global.App.el;
    var logo = profile && profile.logo;

    if (!logo) {
      return el('span', { class: 'brand__logo', 'aria-hidden': 'true' });
    }

    if (logo.indexOf('/') === -1 && logo.indexOf('.') === -1) {
      return el('span', { class: 'brand__logo', text: logo, 'aria-hidden': 'true' });
    }

    return el('span', { class: 'brand__logo brand__logo--image', 'aria-hidden': 'true' }, [
      el('img', { src: logo, alt: '' })
    ]);
  }

  global.App = global.App || {};
  global.App.createLogo = createLogo;
})(window);
