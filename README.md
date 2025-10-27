# Cookie Exporter (JSON)

一个用于将浏览器 Cookie 导出为 JSON 文件的 Chrome 扩展。支持导出当前活动站点的 Cookie，或导出浏览器内的所有 Cookie。包含 HttpOnly Cookie，并尽可能与 Chrome DevTools 的字段保持一致。

## 功能
- 导出当前标签页站点的 Cookie（按钮：`Export cookies for current site`）。
- 导出浏览器中的所有 Cookie（按钮：`Export ALL cookies`）。
- 字段包括：`Name`、`Value`、`Domain`、`Path`、`Expires / Max-Age`、`Size`、`HttpOnly`、`Secure`、`SameSite`、`Partition Key Site`、`Cross Site`、`Priority`。
- 规范化 `SameSite` 值为 `None`、`Lax`、`Strict`。
- 根据站点 URL 生成安全的文件名，例如：`example.com_/path_cookies.json`。
- 基于 Manifest V3（背景脚本为 Service Worker）。

## 安装（本地加载）
1. 下载或克隆本仓库：
   - `git clone https://github.com/sosojust/cookies-exporter.git`
2. 在 Chrome 地址栏打开：`chrome://extensions/`。
3. 打开右上角的「开发者模式」。
4. 点击「加载已解压的扩展程序（Load unpacked）」并选择项目文件夹：`cookies-exporter`。
5. 如需方便使用，可将扩展固定到工具栏并打开弹窗。

## 使用方法
- 打开你想导出 Cookie 的站点页面。
- 点击扩展图标打开弹窗。
- 选择以下之一：
  - `Export cookies for current site`：只导出当前站点的 Cookie，下载文件名为 `<sanitized_host_and_path>_cookies.json`。
  - `Export ALL cookies`：导出浏览器中所有 Cookie，下载文件名为 `all_cookies.json`。
- 进度与结果会显示在弹窗的 `status` 区域。

## 权限说明
扩展声明以下权限：
- `cookies`：读取 Cookie（包含 HttpOnly）。
- `activeTab`：获取当前活动标签页的 URL。
- `scripting`、`storage`：常见 MV3 权限。
- `host_permissions`: `<all_urls>`：用于在你选择的站点范围内读取 Cookie。

## 文件结构
- `manifest.json`：扩展清单（MV3），声明背景 Service Worker 与弹窗。
- `background.js`：背景脚本（Service Worker），负责读取并整理 Cookie 字段。
- `popup.html`：弹窗 UI，两枚导出按钮与状态区。
- `popup.js`：弹窗逻辑，通过消息与背景脚本通信并触发 JSON 下载。

## 导出格式
每个 Cookie 在导出的 JSON 中包含以下字段：
- `Name`、`Value`、`Domain`、`Path`
- `Expires / Max-Age`（若有则为 epoch 秒，否则为空）
- `Size`（`name.length + value.length`）
- `HttpOnly`、`Secure`
- `SameSite`（`None` | `Lax` | `Strict`）
- `Partition Key Site`（若可用）
- `Cross Site`（布尔值，若可用）
- `Priority`（`Low` | `Medium` | `High`）

## 常见问题
- 弹窗提示 `No response from background`：打开 `chrome://extensions/`，找到本扩展，查看 `Service worker` 日志是否有错误。
- 弹窗提示 `Cannot detect active tab URL`：确认当前有一个正常的网页标签处于激活状态。
- 确保已在扩展页面开启「开发者模式」并成功加载本项目。

## 说明
- 文件下载在本地生成，数据不会上传到任何服务器。
- 项目使用纯 MV3 API，无需构建步骤。