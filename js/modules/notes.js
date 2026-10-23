/**
 * notes.js —— 交互模块｜只做一件事：首屏的便签卡片 + 便签编辑窗口
 *
 * 数据来源分两层：
 *   1. 仓库数据 js/data/notes.js —— 页面加载时先读它，部署到 GitHub 后就是仓库里的内容；
 *   2. 本机改动 localStorage —— 新增 / 修改先存这里，不联网。
 * 想把自己的改动写回仓库：点卡片底部的「导出」，用下载的文件覆盖 js/data/notes.js 后提交。
 */
(function (App) {
  'use strict';

  var STORE_KEY = 'aboy:notes:v1';
  var MAX_LENGTH = 500;

  /* 便签配色：这里只写 key，具体颜色在 notes.css 的 --note-tint 里 */
  var COLORS = ['yellow', 'green', 'pink', 'purple', 'blue', 'gray', 'dark'];

  /* 允许留在便签里的标签，其余一律拆掉只留文字 */
  var ALLOWED_TAGS = {
    B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, STRIKE: 1, DEL: 1,
    BR: 1, DIV: 1, P: 1, UL: 1, OL: 1, LI: 1, IMG: 1
  };

  var store = { local: [], hidden: [] };
  var keyword = '';
  var editingId = null;
  var currentColor = 'default';
  var els = {};

  /* ---------- 富文本清洗 ---------- */

  function cleanInto(source, target) {
    Array.prototype.slice.call(source.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        target.appendChild(document.createTextNode(node.nodeValue));
        return;
      }
      if (node.nodeType !== 1) return;

      if (!ALLOWED_TAGS[node.tagName]) {
        cleanInto(node, target); /* 不认识的标签拆掉，保留里面的内容 */
        return;
      }

      if (node.tagName === 'IMG') {
        var src = node.getAttribute('src') || '';
        if (!/^data:image\//i.test(src)) return; /* 只允许本机转出来的图片 */
        var image = document.createElement('img');
        image.setAttribute('src', src);
        image.setAttribute('alt', node.getAttribute('alt') || '');
        target.appendChild(image);
        return;
      }

      var copy = document.createElement(node.tagName.toLowerCase());
      cleanInto(node, copy);
      target.appendChild(copy);
    });
  }

  function sanitize(html) {
    var holder = document.createElement('div');
    holder.innerHTML = String(html || '');

    var output = document.createElement('div');
    cleanInto(holder, output);
    return output.innerHTML;
  }

  function plainText(node) {
    return String(node.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function hasImage(html) {
    return /<img/i.test(html);
  }

  /* ---------- 数据 ---------- */

  function isValidNote(item) {
    return !!item && typeof item.id === 'string' && typeof item.text === 'string';
  }

  /* 仓库数据：time 允许写 ISO 字符串，也允许直接写毫秒时间戳 */
  function repoNotes() {
    var raw = (App.data && App.data.notes) || [];

    return raw.map(function (item) {
      var stamp = typeof item.time === 'number' ? item.time : Date.parse(item.time);
      return {
        id: String(item.id || ''),
        text: String(item.text || ''),
        html: typeof item.html === 'string' ? sanitize(item.html) : '',
        color: COLORS.indexOf(item.color) === -1 ? '' : item.color,
        time: isNaN(stamp) ? Date.now() : stamp
      };
    }).filter(function (item) {
      return item.id && (item.text || item.html);
    });
  }

  function loadStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return { local: [], hidden: [] };

      var parsed = JSON.parse(raw);
      return {
        local: Array.isArray(parsed.local) ? parsed.local.filter(isValidNote) : [],
        hidden: Array.isArray(parsed.hidden) ? parsed.hidden : []
      };
    } catch (error) {
      return { local: [], hidden: [] };
    }
  }

  function saveStore() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (error) {
      return false; /* 多半是图片太多撑满了 5MB 配额 */
    }
  }

  /* 仓库笔记 + 本机改动，按时间倒序；本机删除的记在 hidden 里 */
  function visibleNotes() {
    var map = {};
    var order = [];

    repoNotes().forEach(function (note) {
      map[note.id] = note;
      order.push(note.id);
    });

    store.local.forEach(function (note) {
      if (!map[note.id]) order.push(note.id);
      var base = map[note.id];
      /* 内容和仓库一致时用仓库那条，这样以后直接改数据文件也能生效 */
      map[note.id] = base && base.text === note.text ? base : note;
    });

    return order
      .filter(function (id) { return store.hidden.indexOf(id) === -1; })
      .map(function (id) { return map[id]; })
      .sort(function (a, b) { return b.time - a.time; });
  }

  function findNote(id) {
    var list = visibleNotes();
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function newId() {
    return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function formatTime(stamp) {
    var diff = Date.now() - stamp;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';

    var date = new Date(stamp);
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  /* ---------- 卡片 ---------- */

  function buildCard() {
    var el = App.el;

    return el('aside', { class: 'note-card', 'aria-label': '便签' }, [
      el('div', { class: 'nc-head' }, [
        el('h2', { class: 'nc-title', text: '便签' }),
        el('button', { class: 'nc-add', type: 'button', 'aria-label': '新建便签', title: '新建便签', text: '+' })
      ]),
      el('div', { class: 'nc-search' }, [
        el('label', { class: 'sr-only', for: 'note-search', text: '搜索便签' }),
        el('input', {
          class: 'nc-search__input',
          id: 'note-search',
          type: 'search',
          placeholder: '搜索便签',
          maxlength: '40',
          autocomplete: 'off'
        })
      ]),
      el('ul', { class: 'nc-list' }),
      el('p', { class: 'nc-foot' }, [
        el('span', { text: '本机保存' }),
        el('button', {
          class: 'nc-export',
          type: 'button',
          title: '下载 notes.js，覆盖 js/data/notes.js 后提交',
          text: '导出'
        })
      ])
    ]);
  }

  function renderList() {
    var list = els.list;
    var query = keyword.trim().toLowerCase();
    var all = visibleNotes();
    var visible = query
      ? all.filter(function (note) { return note.text.toLowerCase().indexOf(query) !== -1; })
      : all;

    list.innerHTML = '';

    if (!visible.length) {
      list.appendChild(App.el('li', {
        class: 'nc-empty',
        text: all.length ? '没有匹配的便签' : '还没有便签，点 + 记一条'
      }));
      return;
    }

    visible.forEach(function (note) {
      var item = App.el('li', { class: 'note', tabindex: '0', dataset: { id: note.id } }, [
        App.el('p', { class: 'note__txt', text: note.text || '（图片便签）' }),
        App.el('div', { class: 'note__meta' }, [
          App.el('span', { class: 'note__time', text: formatTime(note.time) }),
          App.el('button', { class: 'note__del', type: 'button', 'aria-label': '删除这条便签', text: '删除' })
        ])
      ]);

      if (note.color) item.dataset.color = note.color;
      list.appendChild(item);
    });
  }

  /* ---------- 编辑窗口 ---------- */

  function buildWindow() {
    var el = App.el;

    function tool(cmd, label, title, extra) {
      return el('button', {
        class: 'nw-tool ' + extra,
        type: 'button',
        title: title,
        'aria-label': title,
        dataset: { cmd: cmd },
        text: label
      });
    }

    return el('div', {
      class: 'note-window',
      id: 'note-window',
      role: 'dialog',
      'aria-label': '便签编辑窗口',
      hidden: true
    }, [
      el('div', { class: 'nw-head' }, [
        el('button', { class: 'nw-menu-btn', type: 'button', 'aria-label': '更多操作', title: '更多', text: '☰' }),
        el('span', { class: 'nw-title', text: '新便签' }),
        el('button', { class: 'nw-close', type: 'button', 'aria-label': '关闭便签窗口', text: '×' })
      ]),
      el('div', { class: 'nw-menu', hidden: true }, [
        el('button', { class: 'nw-menu__item', type: 'button', dataset: { act: 'list' }, text: '便签列表' }),
        el('button', {
          class: 'nw-menu__item nw-menu__item--danger',
          type: 'button',
          dataset: { act: 'delete' },
          text: '删除笔记'
        })
      ]),
      el('div', { class: 'nw-colors' }, COLORS.map(function (color) {
        return el('button', {
          class: 'nw-swatch',
          type: 'button',
          title: '换成这个颜色',
          'aria-label': '配色 ' + color,
          dataset: { color: color }
        });
      })),
      el('div', {
        class: 'nw-area',
        contenteditable: 'true',
        spellcheck: 'false',
        'data-placeholder': '记笔记…',
        'aria-label': '便签内容'
      }),
      el('div', { class: 'nw-tools' }, [
        tool('bold', 'B', '加粗', 'nw-tool--bold'),
        tool('italic', 'I', '斜体', 'nw-tool--italic'),
        tool('underline', 'U', '下划线', 'nw-tool--underline'),
        tool('strikeThrough', 'S', '删除线', 'nw-tool--strike'),
        tool('insertUnorderedList', '≡', '无序列表', ''),
        tool('image', '▧', '插入图片', '')
      ]),
      el('div', { class: 'nw-foot' }, [
        el('span', { class: 'nw-count', text: '0/' + MAX_LENGTH }),
        el('button', { class: 'nw-btn nw-btn--save', type: 'button', text: '保存' }),
        el('button', { class: 'nw-btn nw-btn--cancel', type: 'button', text: '取消' })
      ]),
      el('input', { id: 'note-file', type: 'file', accept: 'image/*', hidden: true })
    ]);
  }

  function placeWindow() {
    var card = els.card.getBoundingClientRect();
    var width = els.win.offsetWidth;
    var height = els.win.offsetHeight;
    var narrow = window.innerWidth <= 720;

    els.scrim.hidden = !narrow;

    /* 窄屏没有卡片右侧的空间，直接居中当弹窗 */
    if (narrow) {
      els.win.style.left = Math.max(16, (window.innerWidth - width) / 2) + 'px';
      els.win.style.top = Math.max(16, (window.innerHeight - height) / 2) + 'px';
      return;
    }

    var left = card.right + 16;
    var top = card.top - 24;

    if (left + width > window.innerWidth - 16) left = window.innerWidth - width - 16;
    if (left < 16) left = 16;
    if (top + height > window.innerHeight - 16) top = window.innerHeight - height - 16;
    if (top < 16) top = 16;

    els.win.style.left = left + 'px';
    els.win.style.top = top + 'px';
  }

  function setColor(color) {
    currentColor = color || 'default';

    if (currentColor === 'default') els.win.removeAttribute('data-color');
    else els.win.dataset.color = currentColor;

    Array.prototype.slice.call(els.swatches).forEach(function (swatch) {
      swatch.classList.toggle('is-active', swatch.dataset.color === currentColor);
    });
  }

  function syncEmpty() {
    els.area.classList.toggle('is-empty', !plainText(els.area) && !els.area.querySelector('img'));
  }

  function updateCount() {
    els.count.textContent = plainText(els.area).length + '/' + MAX_LENGTH;
    syncEmpty();
  }

  function openWindow(id) {
    var note = id ? findNote(id) : null;
    editingId = note ? note.id : null;

    els.title.textContent = note ? '编辑便签' : '新便签';
    els.menu.hidden = true;
    els.menuDelete.hidden = !note;
    setColor(note && note.color ? note.color : 'default');

    if (note && note.html) {
      els.area.innerHTML = note.html; /* 加载时已清洗过 */
    } else {
      els.area.textContent = note ? note.text : '';
    }

    els.win.hidden = false;
    placeWindow();
    updateCount();

    els.area.focus();
    var range = document.createRange();
    range.selectNodeContents(els.area);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function closeWindow() {
    editingId = null;
    els.menu.hidden = true;
    els.win.hidden = true;
    els.scrim.hidden = true;
  }

  function saveNote() {
    var html = sanitize(els.area.innerHTML);
    var text = plainText(els.area);

    if (!text && !hasImage(html)) {
      closeWindow();
      return;
    }

    var id = editingId || newId();
    var entry = {
      id: id,
      text: text,
      html: html,
      color: currentColor === 'default' ? '' : currentColor,
      time: Date.now()
    };
    var replaced = false;

    store.local = store.local.map(function (note) {
      if (note.id !== id) return note;
      replaced = true;
      return entry;
    });

    if (!replaced) store.local.push(entry);

    if (!saveStore()) {
      els.count.textContent = '本机存储已满，删掉图片再试';
      return;
    }

    closeWindow();
    renderList();
  }

  function removeNote(id) {
    store.local = store.local.filter(function (note) { return note.id !== id; });
    if (store.hidden.indexOf(id) === -1) store.hidden.push(id);
    if (editingId === id) closeWindow();

    saveStore();
    renderList();
  }

  /* ---------- 插入图片：先等比缩到 640px 再转 data URL ---------- */

  function shrinkImage(source, done) {
    var image = new Image();

    image.onload = function () {
      var max = 640;
      var scale = Math.min(1, max / Math.max(image.width, image.height));
      var canvas = document.createElement('canvas');

      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL('image/jpeg', 0.82));
    };

    image.onerror = function () { done(source); };
    image.src = source;
  }

  function insertImage(source) {
    els.area.focus();
    document.execCommand('insertHTML', false, '<img src="' + source + '" alt="">');
    updateCount();
  }

  function pickImage() {
    els.file.click();
  }

  /* ---------- 导出到仓库 ---------- */

  function exportSource() {
    var body = visibleNotes().map(function (note) {
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
      ' * 由页面上的「导出」生成，直接覆盖本文件即可。',
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

  function exportNotes() {
    var blob = new Blob([exportSource()], { type: 'text/javascript;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');

    link.href = url;
    link.download = 'notes.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- 工具条状态 ---------- */

  function syncTools() {
    if (!els.win || els.win.hidden) return;

    ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList'].forEach(function (cmd) {
      var button = els.tools.querySelector('[data-cmd="' + cmd + '"]');
      if (!button) return;

      var active = false;
      try {
        active = document.queryCommandState(cmd);
      } catch (error) {
        active = false;
      }

      button.classList.toggle('is-active', active);
    });
  }

  /* ---------- 拖拽窗口 ---------- */

  function startDrag(event) {
    if (event.button !== 0 || event.target.closest('button')) return;

    var rect = els.win.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;
    var offsetY = event.clientY - rect.top;

    event.preventDefault();
    els.win.setPointerCapture(event.pointerId);

    function move(moveEvent) {
      var maxLeft = window.innerWidth - els.win.offsetWidth - 8;
      var maxTop = window.innerHeight - els.win.offsetHeight - 8;

      els.win.style.left = Math.min(Math.max(8, moveEvent.clientX - offsetX), maxLeft) + 'px';
      els.win.style.top = Math.min(Math.max(8, moveEvent.clientY - offsetY), maxTop) + 'px';
    }

    function end() {
      els.win.removeEventListener('pointermove', move);
      els.win.removeEventListener('pointerup', end);
      els.win.removeEventListener('pointercancel', end);
    }

    els.win.addEventListener('pointermove', move);
    els.win.addEventListener('pointerup', end);
    els.win.addEventListener('pointercancel', end);
  }

  /* ---------- 事件 ---------- */

  function bind() {
    els.add.addEventListener('click', function () { openWindow(null); });
    els.export.addEventListener('click', exportNotes);

    els.search.addEventListener('input', function () {
      keyword = els.search.value;
      renderList();
    });

    els.list.addEventListener('click', function (event) {
      var item = event.target.closest('.note');
      if (!item) return;

      if (event.target.closest('.note__del')) {
        removeNote(item.dataset.id);
        return;
      }

      openWindow(item.dataset.id);
    });

    els.list.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (!event.target.classList.contains('note')) return;
      event.preventDefault();
      openWindow(event.target.dataset.id);
    });

    /* 标题栏拖拽 + 关闭 */
    els.head.addEventListener('pointerdown', startDrag);
    els.close.addEventListener('click', closeWindow);
    els.scrim.addEventListener('click', closeWindow);

    /* 更多菜单：便签列表 / 删除笔记 */
    els.menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      els.menu.hidden = !els.menu.hidden;
    });

    els.menu.addEventListener('click', function (event) {
      var item = event.target.closest('.nw-menu__item');
      if (!item) return;

      els.menu.hidden = true;

      if (item.dataset.act === 'delete') {
        if (editingId) removeNote(editingId);
        return;
      }

      closeWindow();
      els.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      els.card.classList.add('is-flash');
      window.setTimeout(function () { els.card.classList.remove('is-flash'); }, 1200);
    });

    document.addEventListener('click', function (event) {
      if (els.menu.hidden) return;
      if (event.target.closest('.nw-menu') || event.target.closest('.nw-menu-btn')) return;
      els.menu.hidden = true;
    });

    /* 配色 */
    els.colors.addEventListener('click', function (event) {
      var swatch = event.target.closest('.nw-swatch');
      if (swatch) setColor(swatch.dataset.color);
    });

    /* 工具条：mousedown 阻止默认，避免编辑区失焦 */
    els.tools.addEventListener('mousedown', function (event) {
      if (event.target.closest('.nw-tool')) event.preventDefault();
    });

    els.tools.addEventListener('click', function (event) {
      var button = event.target.closest('.nw-tool');
      if (!button) return;

      var cmd = button.dataset.cmd;
      if (cmd === 'image') {
        pickImage();
        return;
      }

      els.area.focus();
      document.execCommand('styleWithCSS', false, false);
      document.execCommand(cmd, false, null);
      updateCount();
      syncTools();
    });

    els.file.addEventListener('change', function () {
      var file = els.file.files && els.file.files[0];
      els.file.value = '';
      if (!file || !/^image\//.test(file.type)) return;

      var reader = new FileReader();
      reader.onload = function () {
        shrinkImage(String(reader.result), insertImage);
      };
      reader.readAsDataURL(file);
    });

    /* 粘贴：只保留允许的标签 */
    els.area.addEventListener('paste', function (event) {
      var html = event.clipboardData && event.clipboardData.getData('text/html');
      if (!html) return;

      event.preventDefault();
      document.execCommand('insertHTML', false, sanitize(html));
      updateCount();
    });

    els.area.addEventListener('input', updateCount);
    els.area.addEventListener('keyup', syncTools);
    els.area.addEventListener('mouseup', syncTools);

    els.area.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWindow();
      } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        saveNote();
      }
    });

    els.save.addEventListener('click', saveNote);
    els.cancel.addEventListener('click', closeWindow);

    document.addEventListener('selectionchange', syncTools);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !els.win.hidden) closeWindow();
    });

    window.addEventListener('resize', function () {
      if (!els.win.hidden) placeWindow();
    });
  }

  /* ---------- 挂载 ---------- */

  function mount(card) {
    var actions = document.querySelector('.hero__actions');

    if (actions && actions.parentNode) {
      actions.parentNode.insertBefore(card, actions.nextSibling);
      return true;
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.appendChild(card);
      return true;
    }

    return false;
  }

  function init() {
    var card = buildCard();
    if (!mount(card)) return;

    var win = buildWindow();
    var scrim = App.el('div', { class: 'note-scrim', 'aria-hidden': 'true', hidden: true });

    document.body.appendChild(scrim);
    document.body.appendChild(win);

    store = loadStore();
    els = {
      card: card,
      list: card.querySelector('.nc-list'),
      add: card.querySelector('.nc-add'),
      search: card.querySelector('.nc-search__input'),
      export: card.querySelector('.nc-export'),
      scrim: scrim,
      win: win,
      head: win.querySelector('.nw-head'),
      title: win.querySelector('.nw-title'),
      menuBtn: win.querySelector('.nw-menu-btn'),
      menu: win.querySelector('.nw-menu'),
      menuDelete: win.querySelector('.nw-menu__item--danger'),
      close: win.querySelector('.nw-close'),
      colors: win.querySelector('.nw-colors'),
      swatches: win.querySelectorAll('.nw-swatch'),
      area: win.querySelector('.nw-area'),
      tools: win.querySelector('.nw-tools'),
      count: win.querySelector('.nw-count'),
      save: win.querySelector('.nw-btn--save'),
      cancel: win.querySelector('.nw-btn--cancel'),
      file: win.querySelector('#note-file')
    };

    bind();
    renderList();
  }

  App.registry.define('首屏便签', init);
})(window.App);
