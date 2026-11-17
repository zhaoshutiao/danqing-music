# 丹青化韵 · Chinese Painting to Music Converter

以《千里江山图》为背景的交互原型：拖拽山水元素创作画面，将元素映射为传统乐器，通过 Mureka 生成民乐，并探索乐器音色与文化。

## 功能

- 山水元素拖拽、移动、撤销与清空。
- 根据元素类型和数量构建音乐 Prompt，指定民乐风格、目标时长和无人声约束。
- 提交音乐生成任务、查询进度、播放与下载结果。
- 传统乐器试听及 Wikipedia 文化信息查询。

画布通过规则转换为提示词，不使用视觉模型识别整幅画；模型不一定严格遵循乐器和时长约束。

## 下载与运行

需要 Python 3.10+ 和联网环境，无需安装 Python 第三方依赖。使用 Git 克隆你的仓库，或在 GitHub 点击 **Code → Download ZIP** 并解压，然后进入包含 `server.py` 的目录。

### macOS / Linux

```bash
cp .env.example .env
# 用文本编辑器打开 .env，填写自己的 MUREKA_API_KEY
python3 server.py
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
notepad .env
py -3 server.py
```

浏览器访问 **http://127.0.0.1:8000**。不要直接双击 HTML。停止服务时，在终端按 Ctrl+C。

不配置密钥也可以查看页面和体验本地交互，音乐生成会提示未配置。填写 `.env` 后需重启服务。系统中已设置的同名环境变量优先于 `.env`；可选的 `PORT` 用于更换端口。

音乐生成使用你自己的 Mureka 账户和额度，可能产生费用。不要提交 `.env` 或把密钥写进前端；`.gitignore` 已排除本地配置。

## 工作原理

浏览器运行 HTML/CSS/JavaScript → 本地 Python 代理 → Mureka 服务。

API Key 由本地代理读取，不传给网页。项目默认仅监听本机；其他人 clone 后运行自己的服务，不需要项目作者保持电脑在线。

## 目录

```text
index.html        页面结构
css/styles.css    样式
js/app.js         画布、提示词与音乐交互
server.py         本地服务及音乐 API 代理
images/           绘画与界面图片
Instrument/       页面使用的 12 个乐器试听音频
.env.example      配置模板
ASSETS.md         素材来源与许可状态
VERIFICATION.md   验证范围与限制
```

## 常见问题

- **缺少或无效密钥**：在 `.env` 填写有效密钥，确认没有同名系统环境变量覆盖，再重启。
- **付费、权限或限额提示**：检查 Mureka 账户余额、权限及调用额度；429 也可能表示请求过于频繁。
- **生成失败或等待超时**：页面会恢复按钮。停止本地等待不会取消远程任务，任务仍可能产生费用，请勿连续重复提交。
- **页面没有样式或试听不可用**：检查网络。CDN、在线字体与 Wikipedia 需要联网。
- **下载按钮打开音频而没有保存**：浏览器对跨域下载存在限制，可在打开的音频页面使用浏览器保存功能。
- **端口被占用**：在 `.env` 设置 `PORT=8001` 后重启，访问对应端口。

## 项目状态

这是课程项目的整理版本，署名为 zhao、zhang。音乐接口沿用原项目的请求和响应约定；尚未用真实有效密钥完成端到端验证。语法与模拟检查不代表实际生成已验证。

GitHub 存储代码，不会自动运行 Python 服务；GitHub Pages 只能展示静态部分。面向公众部署前需另外设计鉴权、限流及任务访问控制。

## 素材与许可

素材授权尚待确认，公开发布前请核对 [ASSETS.md](ASSETS.md)。仓库暂未添加整体开源许可证。未使用的音频已从项目中移出，详见 [RESOURCE_NOTES.md](RESOURCE_NOTES.md)。
