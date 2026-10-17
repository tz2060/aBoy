/**
 * build-particles.js —— 数据工具｜只做一件事：把坐标文本文件转换成 js/data/particles.js
 *
 * 用法（默认读取项目根目录下的第一个 .txt）：
 *     node tools/build-particles.js
 *     node tools/build-particles.js D:\path\to\points.txt
 *     node tools/build-particles.js D:\path\to\points.txt --swap-yz --flip-y
 *
 * 处理流程：提取全部数字 → 按 x,y,z 三元组分组 →（可选）交换 y / z 轴、翻转 y 轴
 *          → 去掉重复点 → 保留 3 位小数 → 写成数据模块。
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var OUTPUT_FILE = path.join(ROOT, 'js', 'data', 'particles.js');
var PER_LINE = 10;

var ARGS = process.argv.slice(2);
var SWAP_YZ = ARGS.indexOf('--swap-yz') !== -1;
var FLIP_Y = ARGS.indexOf('--flip-y') !== -1;
var SOURCE_ARG = ARGS.filter(function (arg) { return arg.indexOf('--') !== 0; })[0];

function findSource() {
  if (SOURCE_ARG) return path.resolve(SOURCE_ARG);

  var candidates = fs.readdirSync(ROOT).filter(function (name) {
    return /\.txt$/i.test(name);
  });

  if (!candidates.length) throw new Error('项目根目录下没有找到坐标 .txt 文件');
  return path.join(ROOT, candidates[0]);
}

function parseNumbers(text) {
  return text.split(/[\[\],\s]+/)
    .filter(function (chunk) { return chunk.length > 0; })
    .map(Number)
    .filter(function (value) { return isFinite(value); });
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

/* 去掉完全重复的点：重叠的点画在一起只会浪费性能，看不出区别 */
function dedupe(numbers) {
  var seen = {};
  var result = [];

  for (var i = 0; i + 2 < numbers.length; i += 3) {
    var x = round(numbers[i]);
    var y = round(numbers[i + 1]);
    var z = round(numbers[i + 2]);
    var key = x + ',' + y + ',' + z;

    if (seen[key]) continue;
    seen[key] = true;
    result.push(x, y, z);
  }

  return result;
}

/* 交换 y 与 z：有些建模导出的坐标是 Z 轴朝上，换过来点云才会“站着” */
function swapYz(numbers) {
  var result = [];

  for (var i = 0; i + 2 < numbers.length; i += 3) {
    result.push(numbers[i], numbers[i + 2], numbers[i + 1]);
  }

  return result;
}

/* 翻转 y：把点云上下镜像过来 */
function flipY(numbers) {
  var result = [];

  for (var i = 0; i + 2 < numbers.length; i += 3) {
    result.push(numbers[i], -numbers[i + 1], numbers[i + 2]);
  }

  return result;
}

function bounds(numbers) {
  var box = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity]
  };

  for (var i = 0; i + 2 < numbers.length; i += 3) {
    for (var axis = 0; axis < 3; axis += 1) {
      var value = numbers[i + axis];
      if (value < box.min[axis]) box.min[axis] = value;
      if (value > box.max[axis]) box.max[axis] = value;
    }
  }

  return box;
}

function formatNumbers(numbers) {
  var lines = [];

  for (var i = 0; i < numbers.length; i += PER_LINE * 3) {
    lines.push('  ' + numbers.slice(i, i + PER_LINE * 3).join(', '));
  }

  return lines.join(',\n');
}

var source = findSource();
var raw = fs.readFileSync(source, 'utf8');
var parsed = parseNumbers(raw);
var points = dedupe(parsed);

if (SWAP_YZ) points = swapYz(points);
if (FLIP_Y) points = flipY(points);

var box = bounds(points);
var pointCount = points.length / 3;

var content = [
  '/**',
  ' * particles.js —— 数据层｜只做一件事：提供粒子点云坐标（每 3 个数字一组 x, y, z）',
  ' *',
  ' * 本文件由 tools/build-particles.js 生成，请勿手工编辑。',
  ' * 数据来源：' + path.basename(source),
  ' * 原始数字：' + parsed.length + ' 个 → 去重后 ' + pointCount + ' 个点',
  SWAP_YZ || FLIP_Y
    ? ' * 坐标变换：' + [SWAP_YZ ? '交换 y / z 轴（--swap-yz）' : '', FLIP_Y ? '翻转 y 轴（--flip-y）' : '']
      .filter(Boolean).join('，')
    : ' * 坐标变换：无',
  ' */',
  '(function (global) {',
  "  'use strict';",
  '',
  '  var points = [',
  formatNumbers(points),
  '  ];',
  '',
  '  global.App = global.App || {};',
  '  global.App.data = global.App.data || {};',
  '  global.App.data.particles = points;',
  '})(window);',
  ''
].join('\n');

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, content, 'utf8');

var sizeKb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);

var transformLabel = [(SWAP_YZ ? '交换 y / z 轴' : ''), (FLIP_Y ? '翻转 y 轴' : '')]
  .filter(Boolean).join('、') || '无';

console.log('数据源：' + source);
console.log('原始数字：' + parsed.length + ' 个（' + Math.floor(parsed.length / 3) + ' 个点）');
console.log('去重后：' + pointCount + ' 个点');
console.log('坐标变换：' + transformLabel);
console.log('包围盒：x [' + box.min[0] + ', ' + box.max[0] + ']  y ['
  + box.min[1] + ', ' + box.max[1] + ']  z [' + box.min[2] + ', ' + box.max[2] + ']');
console.log('已写入：' + path.relative(ROOT, OUTPUT_FILE) + '（' + sizeKb + ' KB）');
