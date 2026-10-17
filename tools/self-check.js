/**
 * self-check.js —— 自检脚本｜只做一件事：静态校验这个主页的资源是否自洽
 *
 * 只依赖 Node 内置模块，不安装任何东西。运行方式：
 *     node tools/self-check.js
 *
 * 校验三件事：
 *   1. js/ 下所有脚本能否通过语法编译（语法错误会让整个页面空白）；
 *   2. index.html 里引用的本地 css/js 文件是否真实存在；
 *   3. js 中使用的 class 名是否都能在 css 中找到对应选择器。
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.resolve(__dirname, '..');
var problems = [];
var stats = { scripts: 0, assets: 0, classes: 0 };

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function walk(dir, filter) {
  var result = [];
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach(function (entry) {
    var relative = dir + '/' + entry.name;
    if (entry.isDirectory()) result = result.concat(walk(relative, filter));
    else if (filter(relative)) result.push(relative);
  });
  return result;
}

/* ---------- 1. 语法检查 ---------- */
function isScript(file) { return /\.js$/.test(file); }

/* 页面脚本与开发工具脚本都检查：工具坏了同样会在下次生成数据时炸掉 */
var scripts = walk('js', isScript);
var toolScripts = walk('tools', isScript);

scripts.concat(toolScripts).forEach(function (file) {
  stats.scripts += 1;
  try {
    new vm.Script(read(file), { filename: file });
  } catch (error) {
    problems.push('语法错误 ' + file + ' → ' + error.message);
  }
});

/* ---------- 2. 资源引用检查 ---------- */
var html = read('index.html');
var refs = [];
var pattern = /(?:href|src)="([^"]+)"/g;
var match;

while ((match = pattern.exec(html)) !== null) {
  var url = match[1];
  if (/^(https?:|mailto:|#|data:)/.test(url)) continue;
  refs.push(url);
}

refs.forEach(function (url) {
  stats.assets += 1;
  if (!fs.existsSync(path.join(ROOT, url))) problems.push('index.html 引用了不存在的文件：' + url);
});

/* ---------- 3. class 名检查 ---------- */
var css = walk('css', function (file) { return /\.css$/.test(file); })
  .map(read)
  .join('\n');

var js = scripts.map(read).join('\n');
var classPattern = /class:\s*'([^']+)'/g;
var used = {};

/* 纯结构包装类：本身不需要样式，外观由 card / 子元素决定 */
var STRUCTURAL = ['skills__group', 'skill'];

while ((match = classPattern.exec(js)) !== null) {
  match[1].split(/\s+/).forEach(function (name) {
    if (name) used[name] = true;
  });
}

Object.keys(used).forEach(function (name) {
  stats.classes += 1;
  if (STRUCTURAL.indexOf(name) !== -1) return;
  var escaped = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  if (!new RegExp('\\.' + escaped + '(?![\\w-])').test(css)) {
    problems.push('class 在 css 中没有对应样式：.' + name);
  }
});

/* ---------- 4. 挂载点检查：模块要的选择器必须存在（静态页面里，或由别的模块创建） ---------- */
var createdIds = {};
var createdPattern = /id:\s*'([A-Za-z][\w-]*)'/g;

while ((match = createdPattern.exec(js)) !== null) {
  createdIds[match[1]] = true;
}

var selectorPattern = /(?:App\.select\(|getElementById\()'?(#[A-Za-z][\w-]*|[A-Za-z][\w-]*)'?\)/g;
var mountPoints = 0;

while ((match = selectorPattern.exec(js)) !== null) {
  var id = match[1].replace('#', '');
  mountPoints += 1;

  if (createdIds[id]) continue;
  if (!new RegExp('id="' + id + '"').test(html)) problems.push('模块找不到挂载点：#' + id);
}

/* ---------- 5. 数据契约检查：profile.js 必须提供模块读取的字段 ---------- */
var sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/data/profile.js'), sandbox, { filename: 'js/data/profile.js' });

var profile = (sandbox.window.App || {}).data && sandbox.window.App.data.profile;
var fields = 0;

function needString(value, label) {
  fields += 1;
  if (typeof value !== 'string' || !value) problems.push('数据缺失：' + label + ' 应为非空字符串');
}

function needArray(value, label) {
  fields += 1;
  if (!Array.isArray(value) || !value.length) problems.push('数据缺失：' + label + ' 应为非空数组');
  return Array.isArray(value) ? value : [];
}

if (!profile) {
  problems.push('数据缺失：js/data/profile.js 没有导出 App.data.profile');
} else {
  ['name', 'latin', 'role', 'email', 'badge', 'summary'].forEach(function (key) {
    needString(profile[key], 'profile.' + key);
  });

  needArray(profile.typewriterLines, 'profile.typewriterLines');

  needArray(profile.nav, 'profile.nav').forEach(function (item, index) {
    needString(item.label, 'profile.nav[' + index + '].label');
    needString(item.href, 'profile.nav[' + index + '].href');
    if (!/^#/.test(item.href) || !new RegExp('id="' + item.href.slice(1) + '"').test(html)) {
      problems.push('导航指向的区块不存在：' + item.href);
    }
  });

  needArray(profile.stats, 'profile.stats').forEach(function (item, index) {
    if (typeof item.value !== 'number') problems.push('数据缺失：profile.stats[' + index + '].value 应为数字');
    needString(item.label, 'profile.stats[' + index + '].label');
  });

  var about = profile.about;
  if (!about) problems.push('数据缺失：profile.about');
  else {
    ['eyebrow', 'title', 'subtitle', 'avatar'].forEach(function (key) { needString(about[key], 'profile.about.' + key); });
    needArray(about.facts, 'profile.about.facts').forEach(function (item, index) {
      needString(item.key, 'profile.about.facts[' + index + '].key');
      needString(item.value, 'profile.about.facts[' + index + '].value');
    });
    needArray(about.paragraphs, 'profile.about.paragraphs');
    needArray(about.tags, 'profile.about.tags');
  }

  var skills = profile.skills;
  if (!skills) problems.push('数据缺失：profile.skills');
  else {
    ['eyebrow', 'title', 'subtitle'].forEach(function (key) { needString(skills[key], 'profile.skills.' + key); });
    needArray(skills.groups, 'profile.skills.groups').forEach(function (group, groupIndex) {
      needString(group.icon, 'profile.skills.groups[' + groupIndex + '].icon');
      needString(group.name, 'profile.skills.groups[' + groupIndex + '].name');
      needArray(group.items, 'profile.skills.groups[' + groupIndex + '].items').forEach(function (item, index) {
        needString(item.name, 'profile.skills.groups[' + groupIndex + '].items[' + index + '].name');
        if (typeof item.level !== 'number' || item.level < 0 || item.level > 100) {
          problems.push('数据非法：技能进度应在 0-100 之间 → ' + item.name);
        }
      });
    });
  }

  var projects = profile.projects;
  if (!projects) problems.push('数据缺失：profile.projects');
  else {
    ['eyebrow', 'title', 'subtitle'].forEach(function (key) { needString(projects[key], 'profile.projects.' + key); });
    needArray(projects.items, 'profile.projects.items').forEach(function (item, index) {
      ['icon', 'title', 'desc', 'link', 'linkLabel'].forEach(function (key) {
        needString(item[key], 'profile.projects.items[' + index + '].' + key);
      });
      needArray(item.tags, 'profile.projects.items[' + index + '].tags');
    });
  }

  var contact = profile.contact;
  if (!contact) problems.push('数据缺失：profile.contact');
  else {
    ['eyebrow', 'title', 'subtitle', 'copyLabel', 'mailLabel'].forEach(function (key) {
      needString(contact[key], 'profile.contact.' + key);
    });
    needArray(contact.items, 'profile.contact.items').forEach(function (item, index) {
      ['icon', 'label', 'value'].forEach(function (key) {
        needString(item[key], 'profile.contact.items[' + index + '].' + key);
      });
    });
  }

  var footer = profile.footer;
  if (!footer) problems.push('数据缺失：profile.footer');
  else {
    needString(footer.note, 'profile.footer.note');
    needArray(footer.links, 'profile.footer.links').forEach(function (item, index) {
      needString(item.label, 'profile.footer.links[' + index + '].label');
      needString(item.href, 'profile.footer.links[' + index + '].href');
    });
  }
}

/* ---------- 6. 粒子数据检查：坐标必须是完整的三元组 ---------- */
vm.runInContext(read('js/data/particles.js'), sandbox, { filename: 'js/data/particles.js' });

var particleData = sandbox.window.App && sandbox.window.App.data && sandbox.window.App.data.particles;
var particleCount = 0;

if (!Array.isArray(particleData) || !particleData.length) {
  problems.push('粒子数据缺失：js/data/particles.js 没有导出 App.data.particles');
} else if (particleData.length % 3 !== 0) {
  problems.push('粒子数据不是 3 的倍数（每 3 个数字应为 x,y,z）：当前 ' + particleData.length + ' 个数字');
} else {
  particleCount = particleData.length / 3;

  var invalidParticles = particleData.filter(function (value) {
    return typeof value !== 'number' || !isFinite(value);
  }).length;

  if (invalidParticles) problems.push('粒子坐标里有 ' + invalidParticles + ' 个非数字值');
}

/* ---------- 汇总 ---------- */
console.log('检查脚本 ' + stats.scripts + ' 个，资源引用 ' + stats.assets + ' 处，class ' + stats.classes
  + ' 个，挂载点 ' + mountPoints + ' 个，数据字段 ' + fields + ' 项，粒子 ' + particleCount + ' 个');

if (problems.length) {
  console.log('发现问题 ' + problems.length + ' 个：');
  problems.forEach(function (problem) { console.log('  - ' + problem); });
  process.exitCode = 1;
} else {
  console.log('全部通过 ✓');
}
