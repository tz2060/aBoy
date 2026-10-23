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
var warnings = [];
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

/* 允许为空数组：例如把首屏数字整段注释掉是合法用法 */
function needList(value, label) {
  fields += 1;
  if (!Array.isArray(value)) problems.push('数据缺失：' + label + ' 应为数组');
  return Array.isArray(value) ? value : [];
}

if (!profile) {
  problems.push('数据缺失：js/data/profile.js 没有导出 App.data.profile');
} else {
  ['name', 'latin', 'role', 'email', 'badge', 'summary'].forEach(function (key) {
    needString(profile[key], 'profile.' + key);
  });

  /* 图标 / 头像：填了本地图片路径就确认文件真的在 */
  function needLocalFile(value, label) {
    if (!value || /^(https?:|data:)/.test(value) || !/[\/.]/.test(value)) return;
    fields += 1;
    if (!fs.existsSync(path.join(ROOT, value))) {
      problems.push(label + ' 指向的文件不存在：' + value);
    }
  }

  needLocalFile(profile.logo, 'profile.logo');

  needArray(profile.typewriterLines, 'profile.typewriterLines');

  needArray(profile.nav, 'profile.nav').forEach(function (item, index) {
    needString(item.label, 'profile.nav[' + index + '].label');
    needString(item.href, 'profile.nav[' + index + '].href');
    if (!/^#/.test(item.href) || !new RegExp('id="' + item.href.slice(1) + '"').test(html)) {
      problems.push('导航指向的区块不存在：' + item.href);
    }
  });

  needList(profile.stats, 'profile.stats').forEach(function (item, index) {
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
    needLocalFile(about.avatar, 'profile.about.avatar');
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
        if (typeof item.level !== 'number' || !isFinite(item.level)) {
          warnings.push('技能进度不是数字，会按 0% 显示：' + item.name);
        } else if (item.level < 0 || item.level > 100) {
          warnings.push('技能进度超出 0–100，会按 ' + (item.level > 100 ? 100 : 0) + '% 显示：'
            + item.name + ' = ' + item.level);
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

/* ---------- 7. 便签数据检查：id 唯一、text 非空、time 可解析 ---------- */
vm.runInContext(read('js/data/notes.js'), sandbox, { filename: 'js/data/notes.js' });

var notesData = sandbox.window.App && sandbox.window.App.data && sandbox.window.App.data.notes;
var noteCount = 0;

if (!Array.isArray(notesData)) {
  problems.push('便签数据缺失：js/data/notes.js 没有导出 App.data.notes');
} else {
  noteCount = notesData.length;
  var noteIds = {};

  notesData.forEach(function (item, index) {
    var label = 'notes[' + index + ']';

    if (!item || typeof item.id !== 'string' || !item.id) {
      problems.push('便签数据：' + label + '.id 应为非空字符串');
    } else if (noteIds[item.id]) {
      problems.push('便签数据：id 重复 → ' + item.id);
    } else {
      noteIds[item.id] = true;
    }

    if (!item || typeof item.text !== 'string' || !item.text) {
      problems.push('便签数据：' + label + '.text 应为非空字符串');
    }

    if (!item || (typeof item.time !== 'string' && typeof item.time !== 'number')) {
      problems.push('便签数据：' + label + '.time 应为 ISO 字符串或毫秒时间戳');
    } else if (typeof item.time === 'string' && isNaN(Date.parse(item.time))) {
      problems.push('便签数据：' + label + '.time 不是合法时间 → ' + item.time);
    }

    if (item && item.html !== undefined && typeof item.html !== 'string') {
      problems.push('便签数据：' + label + '.html 应为字符串');
    }

    if (item && item.color !== undefined && item.color !== ''
      && ['yellow', 'green', 'pink', 'purple', 'blue', 'gray', 'dark'].indexOf(item.color) === -1) {
      problems.push('便签数据：' + label + '.color 不在可选配色里 → ' + item.color);
    }
  });
}

/* ---------- 8. 便签文件夹：每条一个 json，且聚合文件不能漏 ---------- */
var notesDir = path.join(ROOT, 'js/data/notes');

if (fs.existsSync(notesDir)) {
  var folderIds = [];

  fs.readdirSync(notesDir).filter(function (name) {
    return /\.json$/i.test(name);
  }).forEach(function (name) {
    var data;

    try {
      data = JSON.parse(fs.readFileSync(path.join(notesDir, name), 'utf8'));
    } catch (error) {
      problems.push('便签文件解析失败：js/data/notes/' + name);
      return;
    }

    if (!data || typeof data.id !== 'string' || !data.id) {
      problems.push('便签文件缺少 id：js/data/notes/' + name);
      return;
    }
    if (typeof data.text !== 'string' || !data.text) {
      problems.push('便签文件缺少 text：js/data/notes/' + name);
    }
    if (typeof data.time !== 'string' || isNaN(Date.parse(data.time))) {
      problems.push('便签文件的 time 不是合法时间：js/data/notes/' + name);
    }

    folderIds.push(data.id);
  });

  var aggregateIds = (notesData || []).map(function (item) { return item.id; });

  folderIds.forEach(function (id) {
    if (aggregateIds.indexOf(id) === -1) {
      problems.push('js/data/notes.js 少了这条便签（运行 node tools/build-notes.js）：' + id);
    }
  });
}

/* ---------- 汇总 ---------- */
console.log('检查脚本 ' + stats.scripts + ' 个，资源引用 ' + stats.assets + ' 处，class ' + stats.classes
  + ' 个，挂载点 ' + mountPoints + ' 个，数据字段 ' + fields + ' 项，粒子 ' + particleCount + ' 个，便签 '
  + noteCount + ' 条');

if (warnings.length) {
  console.log('有 ' + warnings.length + ' 条提示（不影响通过）：');
  warnings.forEach(function (warning) { console.log('  · ' + warning); });
}

if (problems.length) {
  console.log('发现问题 ' + problems.length + ' 个：');
  problems.forEach(function (problem) { console.log('  - ' + problem); });
  process.exitCode = 1;
} else {
  console.log('全部通过 ✓');
}
