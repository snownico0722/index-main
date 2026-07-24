# Book2HTML

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
- 更完整的导航站点说明见主项目 README  

## 相关链接

- 主项目：https://github.com/snownico0722/index-main  
- Book2HTML：https://github.com/snownico0722/Bookmarks-to-html  
