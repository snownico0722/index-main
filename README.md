# 个人导航 / Personal Start Page

**中文** · [English](#english)

打开浏览器，就是你自己的起始页。

不用注册、不用服务器、不用装一堆依赖——双击 `index.html` 就能用。站点、搜索引擎、外观都在你自己手里，想怎么摆就怎么摆。

![主题切换示意](screenshots/Styles.gif)

## 它适合谁

- 想把常用网站收成一页，而不是每次在书签栏里翻
- 想换个顺眼的首页，又不想绑定某个在线导航服务
- 想把 Chrome / Edge 里的收藏夹，直接变成同风格的静态页面

## 怎么开始

1. 打开项目文件夹
2. 双击 `index.html`（或用浏览器打开它）
3. 右上角齿轮里改外观；导航内容在 `js/site-data.js` 里改

日常使用就这一步。关掉浏览器再打开，设置还在——都记在本机里。

## 你能改什么

点右上角设置，大部分都能拖一拖、点一点：

| 想调的 | 大概能做什么 |
| --- | --- |
| 浅色 / 深色 | 整体明暗 |
| 质感 | 毛玻璃、液态玻璃、亚克力、云母、纸纹、黑曜石、霓虹、像素…… |
| 密度 | 宽松或紧凑，屏幕小的时候紧凑更省地方 |
| 壁纸相关 | 背景模糊、主题背景优先等 |
| 卡片 | 明暗、透明度，文字和图标不会跟着糊掉 |
| 文字 | 颜色、明暗、阴影、加粗，还有反色增强可读性 |

默认是浅色 + 毛玻璃。不喜欢随时改，改完会自动记住。

### 质感一览

不必全记，逛一遍设置就知道自己喜欢哪个：

- **毛玻璃** — 最稳妥的默认选择
- **液态玻璃** — 更接近 iOS 那一类玻璃感（Chromium 浏览器效果最好）
- **亚克力 / 云母** — 更厚的磨砂，或让壁纸色温透出来
- **磨砂纸** — 铺一层真实纸纹
- **黑曜石** — 深黑 + 冷亮边
- **赛博霓虹 / 8-bit 像素** — 玩票向，换心情用

## 首页搜索

首页中间是搜索框。点左侧图标可以切换百度、Google、Bing 等引擎，回车或点搜索即可。

## 想改上面有哪些网站？

导航分组和链接都在：

```text
js/site-data.js
```

用任意文本编辑器打开，按现有格式增删分类和站点即可。图标放在 `images/` 里，路径写对就能显示。

`common.html`、`develop.html`、`tools.html` 等是其他分页；顶栏会跟着数据一起生成。

## 收藏夹一键变导航页

不想一条条手抄书签的话，用自带的 **Book2HTML**：

1. 进入 `book2html` 文件夹
2. 在地址栏输入 `powershell` 回车（或在此文件夹打开终端）
3. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1
```

浏览器会自动打开本地小工具。它会扫描本机 Chrome / Edge / Brave 等浏览器的收藏夹，你勾选需要的文件夹，就能生成同风格的 `bookmarks_xxx.html`，并可选写进顶栏导航。

更细的说明见 [book2html/README.md](book2html/README.md)。

## 使用小贴士

- **纯本地**：页面和设置都在你电脑上，不会上传到任何服务器
- **换电脑**：把整个文件夹拷过去就能用；若要带上外观偏好，浏览器里该站点的本地数据不会自动跟着走，到新环境再调一次设置即可
- **壁纸**：默认用 `images/beijing.jpg`，换成自己的图并保持文件名，或改代码里的引用路径
- **滚动条**：整页用右侧悬浮滑块（不再露出 Windows 系统那条白底轨道），颜色会跟着壁纸/主题明暗自动适配；设置面板等内部区域则是细圆角透明轨道
- **液态玻璃**：建议用 Chrome / Edge 等 Chromium 内核浏览器，效果更完整

## 相关链接

- 主项目：https://github.com/snownico0722/index-main
- Book2HTML：https://github.com/snownico0722/Bookmarks-to-html

## 致谢

- 磨砂纸纹理 `images/paper-texture.png` 来自 [transparenttextures.com](https://www.transparenttextures.com/)，作者 Atle Mo，许可 CC BY-SA 3.0

---

<a id="english"></a>

# Personal Start Page

**English** · [中文](#个人导航--personal-start-page)

Open the browser, and you’re on a homepage you actually own.

No signup, no server, no dependency maze — double-click `index.html` and go. Sites, search engines, and look-and-feel stay under your control.

![Theme switching demo](screenshots/Styles.gif)

## Who it’s for

- You want common sites on one page instead of hunting the bookmarks bar
- You want a nicer start page without locking into an online navigation service
- You want Chrome / Edge favorites turned into a matching static page

## Quick start

1. Open the project folder
2. Double-click `index.html` (or open it in a browser)
3. Use the gear (top-right) for appearance; edit navigation in `js/site-data.js`

That’s daily use. Close and reopen the browser — preferences stay on this machine.

## What you can tweak

Most options live in the settings panel:

| Control | What it does |
| --- | --- |
| Light / dark | Overall brightness |
| Material | Frosted glass, liquid glass, acrylic, mica, paper, obsidian, neon, pixel… |
| Density | Comfortable or compact (compact helps on small screens) |
| Wallpaper | Background blur, prefer theme wallpapers, etc. |
| Cards | Brightness & opacity — text and icons stay crisp |
| Text | Color, brightness, shadow, bold, and invert for readability |

Default: light + frosted glass. Change anytime; choices are remembered locally.

### Materials at a glance

- **Frosted glass** — safe default
- **Liquid glass** — closer to iOS-style glass (best on Chromium)
- **Acrylic / mica** — thicker frost, or let wallpaper warmth show through
- **Paper** — real paper texture
- **Obsidian** — deep black with cool edges
- **Cyber neon / 8-bit pixel** — mood switches

## Home search

The center search box can switch engines (Baidu, Google, Bing, …) via the icon on the left. Press Enter or click Search.

## Edit the site list

Groups and links live in:

```text
js/site-data.js
```

Open it in any editor and add/remove categories and sites using the existing format. Put icons under `images/` and keep paths correct.

`common.html`, `develop.html`, `tools.html`, and similar files are extra pages; the top nav follows the data.

## Bookmarks → navigation page

Use bundled **Book2HTML** instead of copying bookmarks by hand:

1. Go into the `book2html` folder
2. Open a terminal there
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1
```

A local tool opens in the browser, scans Chrome / Edge / Brave favorites, and can export matching `bookmarks_xxx.html` pages (optionally into the top nav).

Details: [book2html/README.md](book2html/README.md).

## Tips

- **Local-only**: pages and settings stay on your machine; nothing is uploaded
- **Another PC**: copy the whole folder; appearance prefs live in browser storage, so re-tune once on the new machine if needed
- **Wallpaper**: default is `images/beijing.jpg` — replace the file or update the path in code
- **Scrollbar**: the page uses a floating right-edge thumb (no Windows white system track); colors adapt to wallpaper/theme luminance. Inner panels keep thin rounded bars with transparent tracks
- **Liquid glass**: Chrome / Edge (Chromium) give the fullest effect

## Links

- Main project: https://github.com/snownico0722/index-main
- Book2HTML: https://github.com/snownico0722/Bookmarks-to-html

## Credits

- Paper texture `images/paper-texture.png` from [transparenttextures.com](https://www.transparenttextures.com/) by Atle Mo, CC BY-SA 3.0
