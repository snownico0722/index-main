# Book2HTML

把 Chromium 系浏览器的收藏夹导出成静态导航页的工具。

它只做一件事——读收藏夹，生成和主站风格一致的 `bookmarks_*.html`。纯 PowerShell，不依赖 Node、npm、Python 或数据库，也不联网。

## 特点

- **零依赖**。只要 Windows PowerShell 5.1 或 7+ 和一个浏览器，本地起一个 `127.0.0.1` 的网页界面操作，不暴露到局域网。
- **复用主站资源**。放在主项目 `book2html/` 下运行时，优先复用父目录的 `css/`、`js/`、`images/`，生成页输出到主项目根目录，可写回现有页面导航。
- **可独立运行**。父目录没有站点资源时，退回到 `data/` 里的极简资源单独运行，代价是生成页只走极简样式，并标红提示「极简模式」。
- **多收藏夹合并**。可选多个收藏夹组合成同一个页面，左侧已选列表拖动排序决定输出顺序。

## 支持的浏览器

自动扫描 Chrome、Chrome Beta、Edge、Brave、Chromium 的 `Bookmarks` 文件。

## 启动

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1
```

默认监听 `127.0.0.1:8765` 并自动打开浏览器。右侧按层级浏览收藏夹，勾选后自定义顶栏名生成页面；顶栏名同时作为页面标题、导航标签和文件名基准。目标文件已存在时可选覆盖或自动加序号，也可把生成页跳转写入其他页面、或清理已删除生成页的跳转。

端口被占用时从 `8765` 向后顺延，也可手动指定：

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1 -Port 8899
```

不自动打开浏览器：

```powershell
powershell -ExecutionPolicy Bypass -File .\book2html-server.ps1 -NoBrowser
```

## 独立运行所需文件

- `book2html-server.ps1`
- `data/css/`、`data/js/`、`data/images/`

与主项目联动时，父目录还需有主站自己的 `css/`、`js/`、`images/`。

## 相关仓库

- 主项目：<https://github.com/testsnow0722/index-main>
- Book2HTML 独立仓库：<https://github.com/testsnow0722/Bookmarks-to-html>
