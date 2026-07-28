# Book2HTML

**中文** · [English](#english)

把浏览器收藏夹，变成一页好看的静态导航。

不用安装 Node、Python，也不用连网。在 Windows 上跑一个本地小工具，勾选要的文件夹，就能生成和[个人导航](https://github.com/snownico0722/index-main)同风格的 `bookmarks_xxx.html`。

## 它适合谁

- 书签栏塞满了，想整理成一页随时打开的导航
- 已经在用个人导航主站，想把收藏夹一键并进去
- 不想一条条手抄链接、配图标

## 怎么开始

1. 进入本文件夹（主项目里就是 `book2html/`）
2. 在地址栏输入 `powershell` 回车，或在此目录打开终端
3. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1
```

浏览器会自动打开本地页面（默认 `http://127.0.0.1:8765`，只在你自己电脑上）。

然后：

1. 右侧按层级浏览收藏夹，勾选需要的分组  
2. 左侧可拖动调整多个收藏夹的合并顺序  
3. 起一个顶栏名称（也会用作页面标题和文件名）  
4. 生成页面  

生成后的文件会出现在站点根目录（和主项目一起用时，就是主项目根目录）。

## 界面上还能做什么

| 操作 | 说明 |
| --- | --- |
| 覆盖 / 加序号 | 同名文件已存在时，可选覆盖或自动改名 |
| 写入导航 | 把生成页的入口写进其他页面的顶栏 |
| 清理跳转 | 删掉页面后，顺带清掉别处指向它的导航项 |

## 支持哪些浏览器

会自动找本机这些浏览器的收藏夹文件：

Chrome、Chrome Beta、Edge、Brave、Chromium

## 和主站怎么配合

| 运行方式 | 效果 |
| --- | --- |
| 放在主项目的 `book2html/` 里启动 | 直接用主站的样式和图标，生成页跟首页一套风格 |
| 单独克隆本仓库运行 | 用自带的 `data/` 资源，也能生成页面；样式是精简版，页面上会提示「极简模式」 |

独立运行时至少需要：

- `book2html-server.ps1`
- `data/css/`、`data/js/`、`data/images/`

## 常用启动参数

换端口（默认 8765，被占用会自动往后试）：

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1 -Port 8899
```

只启动服务、不自动打开浏览器：

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1 -NoBrowser
```

## 小贴士

- 服务只监听本机，不会暴露到局域网  
- 生成结果是普通 HTML，拷到别的电脑也能打开（图标和样式路径要对）  
- 生成页与主站一样使用自绘滚动条：整页右侧悬浮滑块、内部细圆角透明轨道，颜色会随主题/壁纸明暗适配  
- 更完整的导航站点说明见主项目 README  

## 相关链接

- 主项目：https://github.com/snownico0722/index-main  
- Book2HTML：https://github.com/snownico0722/Bookmarks-to-html  

---

<a id="english"></a>

# Book2HTML

**English** · [中文](#book2html)

Turn browser bookmarks into a clean static navigation page.

No Node, no Python, no network required. On Windows, run a small local tool, pick the folders you want, and export `bookmarks_xxx.html` in the same style as [Personal Start Page](https://github.com/snownico0722/index-main).

## Who it’s for

- Your bookmarks bar is packed and you want one page you can open anytime
- You already use the personal start page and want favorites merged in one click
- You don’t want to copy links and icons by hand

## Quick start

1. Open this folder (`book2html/` inside the main project)
2. Type `powershell` in the address bar, or open a terminal here
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1
```

A local page opens automatically (default `http://127.0.0.1:8765`, on this machine only).

Then:

1. Browse bookmarks on the right and check the groups you need  
2. Drag on the left to set merge order across multiple bookmark roots  
3. Give it a top-nav name (also used as page title and file name)  
4. Generate the page  

Output lands in the site root (the main project root when used together).

## Extra actions in the UI

| Action | What it does |
| --- | --- |
| Overwrite / number | If the file exists, overwrite or auto-rename |
| Write to nav | Add the new page to the top nav of other pages |
| Clean links | After deleting a page, remove nav items that pointed to it |

## Supported browsers

The tool looks for local bookmark files from:

Chrome, Chrome Beta, Edge, Brave, Chromium

## How it pairs with the main site

| How you run it | Result |
| --- | --- |
| From main project’s `book2html/` | Uses main site styles and icons; pages match the home look |
| Clone this repo alone | Uses bundled `data/` assets; simplified “minimal mode” banner on the page |

Standalone minimum:

- `book2html-server.ps1`
- `data/css/`, `data/js/`, `data/images/`

## Common flags

Change port (default 8765; tries the next free port if busy):

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1 -Port 8899
```

Start the server without opening a browser:

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1 -NoBrowser
```

## Tips

- Listens on localhost only — not exposed to the LAN  
- Output is plain HTML; copy to another PC works if asset paths stay valid  
- Generated pages match the main site scrollbar: floating page thumb, thin inner bars with transparent tracks, colors adapt to theme/wallpaper  
- Full start-page docs live in the main project README  

## Links

- Main project: https://github.com/snownico0722/index-main  
- Book2HTML: https://github.com/snownico0722/Bookmarks-to-html  
