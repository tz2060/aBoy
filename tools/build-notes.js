/**
 * build-notes.js —— 数据工具｜只做一件事：把 js/data/notes/*.json 合并成 js/data/notes.js
 *
 * 页面只会加载 js/data/notes.js 这一个脚本（file:// 下也能用，不需要 fetch）。
 * 每条便签一个 json 文件，方便单独提交 / 手改；改完运行：
 *
 *     node tools/build-notes.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var DIR = path.join(ROOT, 'js/data/notes');
var OUT = path.join(ROOT, 'js/data/notes.js');

function fail(message) {
  console.error('✗ ' + message);
  process.exitCode = 1;
}

function readNotes() {
  if (!fs.existsSync(DIR)) {
    fail('找不到目录 js/data/notes');
    return [];
  }

  var notes = [];

  fs.readdirSync(DIR).filter(function (name) {
    return /\.json$/i.test(name);
  }).forEach(function (name) {
    var file = path.join(DIR, name);
    var data;

    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      fail('JSON 解析失败：' + name + ' → ' + error.message);
      return;
    }

    if (!data || typeof data.id !== 'string' || !data.id) {
      fail(name + ' 缺少 id');
      return;
    }
    if (typeof data.text !== 'string' || !data.text) {
      fail(name + ' 缺少 text');
      return;
    }
    if (typeof data.time !== 'string' || isNaN(Date.parse(data.time))) {
      fail(name + ' 的 time 不是合法时间');
      return;
    }

    notes.push(data);
  });

  return notes.sort(function (a, b) {
    return Date.parse(b.time) - Date.parse(a.time);
  });
}

function toSource(notes) {
  var body = notes.map(function (note) {
    var lines = [
      '    {',
      '      id: ' + JSON.stringify(note.id) + ',',
      '      text: ' + JSON.stringify(note.text) + ','
    ];

    if (note.html) lines.push('      html: ' + JSON.stringify(note.html) + ',');
    if (note.color) lines.push('      color: ' + JSON.stringify(note.color) + ',');
    lines.push('      time: ' + JSON.stringify(new Date(note.time).toISOString()));
    lines.push('    }');

    return lines.join('\n');
  }).join(',\n');

  return [
    '/**',
    ' * notes.js —— 数据层｜只做一件事：提供便签的默认内容（提交到仓库的就是这份数据）',
    ' *',
    ' * ⚠ 自动生成，别手改：改 js/data/notes/*.json 后运行 node tools/build-notes.js，',
    ' *   或在页面上点「连接」把 js/data 文件夹接上，保存便签时会自动重写本文件。',
    ' */',
    '(function (global) {',
    "  'use strict';",
    '',
    '  var notes = [',
    body,
    '  ];',
    '',
    '  global.App = global.App || {};',
    '  global.App.data = global.App.data || {};',
    '  global.App.data.notes = notes;',
    '})(window);',
    ''
  ].join('\n');
}

var notes = readNotes();
fs.writeFileSync(OUT, toSource(notes), 'utf8');

console.log('已生成 js/data/notes.js（' + notes.length + ' 条便签）');
notes.forEach(function (note) {
  console.log('  · ' + note.id + '  ' + String(note.text).slice(0, 24));
});
