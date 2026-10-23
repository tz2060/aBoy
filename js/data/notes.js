/**
 * notes.js —— 数据层｜只做一件事：提供便签的默认内容（提交到仓库的就是这份数据）
 *
 * id 唯一，time 用 ISO 字符串，text 为纯文本。
 * 想手动加一条，直接在数组里补一项；页面里新增 / 修改的便签可以点卡片底部的「导出」，
 * 用下载回来的文件覆盖本文件即可提交到仓库。
 */
(function (global) {
  'use strict';

  var notes = [
    {
      id: 'repo-hello',
      text: '点右上角的 + 打开便签窗口，写下的内容会先存在本机。',
      color: 'yellow',
      time: '2026-10-24T04:20:00+08:00'
    },
    {
      id: 'repo-export',
      text: '想提交到 GitHub：点卡片底部的「导出」，用下载的文件覆盖 js/data/notes.js。',
      color: 'blue',
      time: '2026-10-24T04:21:00+08:00'
    }
  ];

  global.App = global.App || {};
  global.App.data = global.App.data || {};
  global.App.data.notes = notes;
})(window);
