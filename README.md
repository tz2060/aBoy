# aBoy 的主页

纯原生 HTML / CSS / JavaScript 单页个人主页，**没有构建工具、没有第三方依赖**，双击 `index.html` 即可打开。

设计语言参考 DeepSeek：深蓝底色、品牌蓝 `#4D6BFE` 渐变、皮卡丘图标、圆角玻璃质感卡片、柔和光晕。

## 设计原则：一个模块只做一件事

每个文件只承担一个职责，模块之间通过 `App` 命名空间和注册表通信，互不感知：

| 目录 | 职责 | 说明 |
| --- | --- | --- |
| `css/tokens.css` | 设计变量 | 颜色、圆角、间距、动效时长；全站只有暗色主题 |
| `css/reset.css` | 重置默认样式 | 只抹平浏览器差异 |
| `css/base.css` | 页面排版 | 字体、标题、链接、焦点、选区 |
| `css/layout.css` | 页面骨架 | 容器、区块节奏、区块标题、跳转链接 |
| `css/atoms.css` | 原子控件 | 按钮、标签、徽章、卡片、图标按钮 |
| `css/effects.css` | 氛围与动效 | 背景光晕、滚动入场、打字光标、回到顶部按钮 |
| `css/header.css` 等 | 单个区块 | 一个区块一个样式文件 |
| `css/notes.css` | 首屏便签 | 便签卡片与便签窗口（高透玻璃） |
| `css/particle-layer.css` | 粒子背景层 | 只负责固定层的定位、柔光与画布尺寸 |
| `css/responsive.css` | 响应式覆盖 | 只按屏幕宽度覆盖布局 |
| `js/core/registry.js` | 模块注册表 | `define(名称, 函数)` / `all()` |
| `js/core/el.js` | 元素工厂 | 用描述创建 DOM，替代手写字符串拼接 |
| `js/core/brand-logo.js` | 品牌图标 | 按 `profile.logo` 生成 emoji 或图片图标，页头页脚共用 |
| `js/core/select.js` | 选择器 | 取不到元素时给出警告并返回 `null` |
| `js/effects/typewriter.js` | 打字机效果 | 只负责逐字循环输出文案 |
| `js/effects/count-up.js` | 数字滚动 | 只负责让数字从 0 增长到目标值 |
| `js/data/profile.js` | 数据 | 全站内容都在这里，**改内容只改这个文件** |
| `js/data/notes.js` | 数据 | 便签的默认内容（提交到仓库的就是这份数据） |
| `js/data/particles.js` | 数据 | 首屏粒子点云坐标（由脚本生成，勿手改） |
| `js/particles/geometry.js` | 粒子 · 几何 | 只负责把扁平坐标整理成居中的点数组 |
| `js/particles/palette.js` | 粒子 · 上色 | 只负责按高度给每个点分配颜色 |
| `js/particles/camera.js` | 粒子 · 视角 | 只负责自动旋转与 3D→2D 投影 |
| `js/particles/pointer.js` | 粒子 · 指针 | 只负责记录鼠标在画布内的位置 |
| `js/particles/disturbance.js` | 粒子 · 扰动 | 只负责鼠标附近粒子的推开与回弹 |
| `js/particles/painter.js` | 粒子 · 绘制 | 只负责把一帧画到画布上 |
| `js/particles/canvas-sizer.js` | 粒子 · 尺寸 | 只负责让画布像素尺寸等于 CSS 尺寸 |
| `js/particles/animation-loop.js` | 粒子 · 帧循环 | 只负责按帧调用回调并算好时间差 |
| `js/modules/site-header.js` | 渲染顶部导航 | 只输出结构 |
| `js/modules/hero.js` | 渲染首屏 | 渲染完把动效交给 effects 层 |
| `js/modules/notes.js` | 首屏便签 | 卡片 + 便签窗口，读仓库数据、写本机缓存、导出数据文件 |
| `js/modules/particle-scene.js` | 装配粒子场景 | 只负责把上面 8 个粒子模块接到固定背景层的画布上 |
| `js/modules/about.js` | 渲染「关于我」 | |
| `js/modules/skills.js` | 渲染「技能」 | 进度条只写目标值，展开交给 CSS |
| `js/modules/projects.js` | 渲染「作品」 | |
| `js/modules/contact.js` | 渲染「联系」 | 只输出 `data-copy` 按钮，行为交给 copy-text |
| `js/modules/site-footer.js` | 渲染页脚 | |
| `js/modules/reveal.js` | 滚动入场 | 只负责给进入视口的元素加 `is-visible` |
| `js/modules/scroll-spy.js` | 导航高亮 | 只负责高亮当前区块对应的导航项 |
| `js/modules/back-to-top.js` | 回到顶部 | 只负责这个按钮的显示与滚动 |
| `js/modules/copy-text.js` | 复制文本 | 只负责把 `data-copy` 的内容写进剪贴板 |
| `js/main.js` | 启动器 | 只负责按注册顺序执行所有模块 |
| `tools/self-check.js` | 自检脚本 | 只负责静态校验资源是否自洽（开发用，不参与页面运行） |
| `tools/build-particles.js` | 数据工具 | 只负责把坐标文本转换成粒子数据模块（开发用） |

模块登记顺序 = 脚本引入顺序（见 `index.html` 底部）：先是渲染模块，再是交互模块，因此交互模块总能拿到已经渲染好的 DOM。

## 目录结构

```
个人主页/
├── index.html
├── assets/       # 图片资源（品牌图标 + 标签图标）
├── css/          # 样式，一层一件事
├── js/
│   ├── core/     # 基础设施（注册表、元素工厂、品牌图标）
│   ├── effects/  # 可复用的动画能力
│   ├── particles/ # 粒子云的 8 个单一能力
│   ├── data/     # 内容数据（含粒子坐标、便签）
│   ├── modules/  # 渲染模块 + 交互模块
│   └── main.js   # 启动器
└── tools/
    ├── self-check.js      # 静态自检（可选）
    └── build-particles.js # 坐标文本 → 粒子数据（可选）
```

## 粒子背景层

页面右侧有一团会缓慢自转的三维点云，颜色按高度渐变（深蓝 → 亮蓝 → 青，另有少量浅色亮点）。
它固定在视口上（`position: fixed`），滚动页面时不会跟着内容一起滑走。

鼠标在页面任意位置移动时，光标附近的粒子都会被推开并带一点切向旋转，离开页面后靠弹簧回弹复原。

渲染链路（每一环都是一个独立模块）：

```
particles.js 坐标
   ↓ geometry.toPoints      居中 + 分位半径归一
   ↓ palette.assignColors   按高度上色
   ↓ camera.project         每帧旋转 + 透视投影 → 屏幕坐标
   ↓ disturbance.update     鼠标附近的位移与回弹
   ↓ painter.paintFrame     叠加混合画点
   ↑ animation-loop         每帧驱动；canvas-sizer 负责高清屏尺寸
```

### 图像大小与粒子大小是分开控制的

`camera.project` 每次会写出两个与缩放有关的量：

- `scale`：**定位**用的缩放，跟着画布尺寸走，决定这团点云在屏幕上有多大；
- `unit`：**只反映远近**的系数（`distance / depth`），与画布尺寸、放大倍数无关，粒子半径和亮度只看它。

所以“把图像放大”只改变点与点之间的距离，每个点的像素大小保持不变。

### 位置与尺寸都跟着页面走

- 位置：`anchorX = 2 / 3`，即始终落在页面宽度的 2/3 处；`anchorY = 0.5` 为垂直居中。两者都是比例，窗口怎么变都保持这个构图。
- 尺寸：基准值取 **√(宽 × 高)**，再乘 `focalFactor = 0.75`。所以窗口变宽、变高都会让点云等比例变化（16:9 时点云高度约为页面的 70%）。
- 每帧的 `size` 来自 `canvas-sizer.js` 的 `ResizeObserver`，画布尺寸一变，下一帧就按新尺寸重新投影，不需要刷新页面。

- 想调整大小：改 `js/particles/camera.js` 的 `distance`（越小越大）或 `focalFactor`；想改粒子大小：改 `js/particles/painter.js` 的 `dotRadius`（默认 1.8px，随远近在 1.3–2.9px 之间变化）。
- 想调手感：`js/modules/particle-scene.js` 顶部的 `DISTURBANCE = { radius, strength, maxOffset }`（影响半径 / 力度 / 最大位移），转速、锚点、尺寸系数都在 `CAMERA` 里。
- 换一份坐标：把新的 `.txt`（形如 `[x, y, z, x, y, z, ...]`）放到项目根目录，然后 `node tools/build-particles.js`，它会去重、保留 3 位小数并覆盖 `js/data/particles.js`。
- 坐标变换：当前数据做过两步——交换 y / z 轴（有些建模导出是 Z 轴朝上），再把 y 轴取反（上下镜像）。换新坐标文件时用 `node tools/build-particles.js 文件.txt --swap-yz --flip-y` 复现同样的朝向。
- 层级：粒子层 `z-index: 0`，各区块 `z-index: 1`，所以粒子永远在内容下面、背景氛围光上面。
- 响应式：手机 / 平板上粒子同样显示，只是透明度降低（≤ 1024px 为 0.6，≤ 720px 为 0.5）避免压住文字。
- 触摸交互：手指拖动会连续扰动；**单指点一下**（`pointerdown`）也会扰动，并在松手后继续保持约 0.6 秒的推挤，让点按有明显反馈（由 `js/particles/pointer.js` 的 `TAP_HOLD` 控制）。
- 系统开启「减少动态效果」时只画一帧静态画面，不做动画。

## 便签（首屏按钮下方）

便签是纯静态页面上能做到的「可提交」方案，数据分两层：

| 层 | 位置 | 作用 |
| --- | --- | --- |
| 仓库数据 | `js/data/notes.js` | 页面加载时先读这份，部署到 GitHub Pages 后读到的就是仓库里的内容 |
| 本机改动 | `localStorage`（`aboy:notes:v1`） | 新增 / 修改 / 删除先存这里，立即生效，不联网 |

页面显示的是两者的合并结果（按时间倒序，本机删除的记在 `hidden` 里）；内容和仓库一致的本机副本会被忽略，所以直接改 `js/data/notes.js` 也能生效。

**把本机的笔记提交到仓库**：

1. 点卡片底部的「导出」，浏览器会下载一个 `notes.js`；
2. 用它覆盖 `js/data/notes.js`；
3. `git add js/data/notes.js && git commit && git push`。

点 `+` 打开便签窗口（固定 320×300，可拖动标题栏移动，`Ctrl/⌘ + Enter` 保存，`Esc` 关闭）；点卡片里的便签是编辑，悬停右侧出现「删除」。

窗口里的功能：

| 位置 | 功能 |
| --- | --- |
| ☰ 菜单 | 「便签列表」回到卡片并高亮、「删除笔记」删掉当前这条（新建时隐藏） |
| 配色条 | 7 种颜色，只作为一层极淡的染色，卡片条目与窗口同步 |
| 工具条 | 加粗 / 斜体 / 下划线 / 删除线 / 无序列表 / 插入图片（自动等比缩到 640px 再转 data URL） |
| 底栏 | 字数（500 上限）、保存、取消 |

窄屏（≤ 720px）窗口铺满可用宽度、居中显示，并加一层遮罩压暗页面；窗口本身仍是高透玻璃。

数据结构：

```js
{
  id: 'repo-hello',
  text: '纯文本，用于列表预览和搜索',
  html: '带格式的内容，可省略',
  color: 'yellow',           // 可省略：yellow/green/pink/purple/blue/gray/dark
  time: '2026-10-24T04:20:00+08:00'
}
```

`id` 唯一，`time` 写 ISO 字符串或毫秒时间戳都行；`html` 在写入和渲染时都会按白名单清洗（只留 `b/i/u/s/ul/ol/li/img` 等标签，图片只认 `data:image/`）。`node tools/self-check.js` 会检查 id 唯一、text 非空、time 可解析。

## 自检

改完内容后可以跑一次静态自检，只用 Node 内置模块，不需要安装任何依赖：

```bash
node tools/self-check.js
```

它会检查：页面脚本与 `tools/` 下工具脚本的语法能否编译、`index.html` 引用的本地文件是否存在、JS 里用到的 class 有没有对应样式、模块要的挂载点是否存在（静态页面里或由其他模块创建）、`profile.js` 的字段是否齐全且类型正确、`notes.js` 的便签字段是否合法、粒子坐标是否为完整的三元组。

当前结果：脚本 33 个（页面 31 + 工具 2）、资源引用 49 处、class 116 个、挂载点 9 个、数据字段 103 项、粒子 937 个、便签 2 条，**全部通过**（另有 1 条提示：技能进度 999 会按 100% 显示）。

## 打开方式

- 直接双击 `index.html`（脚本用的是普通 `<script>`，不受 `file://` 的模块加载限制）。
- 也可以起一个静态服务器，效果完全相同：

```bash
python -m http.server 8080
# 然后访问 http://localhost:8080
```

## 换成你自己的内容

页面上的每一段文字、每一个数字、每一条链接，都在 **`js/data/profile.js`** 这一个文件里。改完保存、刷新浏览器即可，不需要动 HTML、CSS 或任何模块代码。

### 字段对照表

| 想改什么 | 字段（`js/data/profile.js` 行号） | 出现在页面哪里 |
| --- | --- | --- |
| 名字 | `name`（12） | 导航、首屏大标题、关于我卡片、页脚 |
| 品牌图标 | `logo`（11） | 导航和页脚左侧的图标 |
| 英文名 | `latin`（13） | 页脚 |
| 职位 / 角色 | `role`（14） | 关于我卡片的名字下方 |
| 邮箱 | `email`（15） | 联系区的两个按钮、复制邮箱 |
| 顶部小标签 | `brand`（10） | 导航右侧的胶囊 |
| 首屏小标签 | `badge`（18） | 首屏最上面的胶囊 |
| 首屏简介 | `summary`（19） | 首屏正文 |
| 打字机文案 | `typewriterLines`（20） | 首屏循环滚动的几句话 |
| 导航 | `nav`（27） | 顶部菜单，`href` 必须对应区块 id |
| 首屏数字 | `stats`（36） | 底部四个数字卡，`value` 是滚动目标值 |
| 关于我 | `about`（44） | 介绍段落、四项信息、标签；头像在 `about.avatar` |
| 技能 | `skills`（65） | 四组技能，`level` 为 0–100 的进度 |
| 作品 | `projects`（111） | 三张作品卡 |
| 联系方式 | `contact`（136） | 联系方式列表，`href` 留空就渲染成纯文本 |
| 页脚 | `footer`（150） | 页脚说明与链接 |

> 行号会随着你增删内容而变动，按字段名找就行。

### 品牌图标（`logo`）

`profile.logo` 填**图片路径**（含 `/` 或 `.`）就渲染成 `<img>`，填**单个字符**（如 `🐋`）就当作 emoji 渲染，两种随时切换：

```js
logo: 'assets/logo.png',   // 图片
logo: '🐋',                // emoji
```

图片放在 `assets/` 目录里。当前用的是从一张皮卡丘插画抠出来的透明 PNG：

- `assets/logo.png` —— 256×256 透明背景，页头和页脚使用
- `assets/favicon.png` —— 64×64，浏览器标签图标（`index.html` 的 `<link rel="icon">`）

图片版图标会自动去掉 emoji 版那个蓝色圆角底框（`.brand__logo--image`）。

「关于我」卡片里的圆形头像走**同一套规则**：`about.avatar` 填图片路径就显示图片（`.about__avatar--image`，四周留 12px 内边距避免贴住圆环），填 emoji 就显示 emoji。当前也指向 `assets/logo.png`。

### 只有两样东西不在数据文件里

- **浏览器标签页标题**：`index.html` 第 6 行的 `<title>`。
- **配色**：`css/tokens.css` 里 `--ds-blue` 系列变量，改完全站自动跟随。

### 改完检查一下

```bash
node tools/self-check.js
```

它会告诉你字段有没有漏、类型有没有写错、`logo` 指向的图片在不在、导航是否指向了不存在的区块。

## 已做的细节

- 只保留暗色主题：配色全在 `css/tokens.css` 的 `:root` 里，没有切换开关、没有 `localStorage` 记录。
- 无障碍：跳转链接、`aria-label`、进度条 `role="progressbar"`、`:focus-visible` 焦点环。
- 动态效果偏好：`prefers-reduced-motion: reduce` 时关闭打字机、数字滚动与入场动画。
- 容错：脚本失效时内容依然可见（隐藏样式依赖 `html.js-reveal`）；单个模块报错不影响其他模块。
