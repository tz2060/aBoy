/**
 * notes.js —— 数据层｜只做一件事：提供便签的默认内容（提交到仓库的就是这份数据）
 *
 * ⚠ 自动生成，别手改：改 js/data/notes/*.json 后运行 node tools/build-notes.js，
 *   或在页面上点「连接」把 js/data 文件夹接上，保存便签时会自动重写本文件。
 */
(function (global) {
  'use strict';

  var notes = [
    {
      id: "nmvlgkn75v4ay",
      text: "「认知改变世界，学习改变认知」——喜欢学习、喜欢运动、喜欢游戏。",
      color: "pink",
      time: "2026-10-23T21:05:57.526Z"
    },
    {
      id: "repo-export",
      text: "每条便签就是 js/data/notes/ 里的一个文件，保存后一起提交即可。",
      color: "blue",
      time: "2026-10-23T20:21:00.000Z"
    },
    {
      id: "repo-hello",
      text: "点右上角的 + 打开便签窗口，写下的内容会直接写进 js/data/notes/。",
      color: "yellow",
      time: "2026-10-23T20:20:00.000Z"
    }
  ];

  global.App = global.App || {};
  global.App.data = global.App.data || {};
  global.App.data.notes = notes;
})(window);
