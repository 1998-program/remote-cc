# RemoteCC — 躺平使用 Claude Code

[English](README.en.md) | 中文

```
  ██████╗  ██████╗ ██████╗
  ██╔══██╗██╔════╝██╔════╝
  ██████╔╝██║     ██║
  ██╔══██╗██║     ██║
  ██║  ██║╚██████╗╚██████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝
  Remote Claude Code
```

> **本工具由 Claude Code 辅助生成，目前仍在打磨迭代中。欢迎提交 [Issue](https://github.com/changdazhou/remote-cc/issues) 反馈 BUG 和建议。**

---

## 这是什么？

**把 Claude Code 从本地终端解放出来，躺在床上用手机也能和它对话。**

Claude Code 是跑在终端里的 AI 编程助手，功能强大，但只能在本机用。RemoteCC 打通了这个限制——你的 Claude Code 会话可以同时从手机浏览器、平板、电脑终端访问，**所有端实时同步，真正共享同一个 PTY 进程**。

不是截图，不是日志，是**完全实时的双向同步**——你在手机上输入，电脑上看得到；你在终端里执行，手机上同步显示。任意断开任意端，Claude 在后台继续工作，随时重连、无缝恢复。

---

## 核心特性

- **真实终端** — PTY + xterm.js，颜色/交互/鼠标全支持
- **实时多端同步** — 同一 PTY 进程广播给所有连接端，零延迟
- **持久会话** — 类 tmux 架构，关闭浏览器/断开 SSH 不中断
- **历史恢复** — 读取 `~/.claude/projects/`，随时 `--resume` 继续上次对话
- **文件浏览器** — Web 端浏览服务器文件、预览代码/图片、复制路径，双击全屏阅读
- **本地 TUI** — `rcc-tui` 交互式终端界面，无需浏览器，无需登录
- **多端断开快捷键** — `Ctrl+]` 随时从任意端脱离，PTY 不受影响
- **移动端优化** — 响应式 UI，CC/SH 双模式快捷键栏
- **丰富主题** — 9 套颜色主题 + 3 种 UI 风格

---

## 上传文件 / 图片给 Claude

Web 端终端工具栏提供 **＋** 按钮，支持三种方式向 Claude 传递文件：

| 方式 | 操作 |
|------|------|
| 点击按钮选文件 | 点击终端下方 **＋** 按钮，选择任意文件或图片 |
| 拖拽 | 直接把文件拖到终端区域 |
| 粘贴图片 | 截图后 Ctrl+V 粘贴（自动上传） |

文件上传到服务器 `~/.rcc/uploads/` 目录，路径自动填入终端光标位置，直接回车或继续输入 Claude 命令即可。

---

## 文件浏览器

点击顶栏 **⊞** 图标打开文件浏览器，默认显示当前会话的工作目录。

| 操作 | 说明 |
|------|------|
| 单击文件 | 右侧预览内容（代码含行号，图片直接显示） |
| 双击文件 | 全屏查看，手机上阅读更舒适 |
| 双击目录 | 进入目录 |
| ⎘ 按钮 | 复制文件/目录的绝对路径 |
| 路径输入框 | 直接输入路径跳转，回车确认 |

支持预览的文件类型：`.md` `.txt` `.py` `.js` `.ts` `.json` `.sh` `.yaml` 等代码和文本文件，以及常见图片格式（`png` `jpg` `gif` `webp`）。

---

## 多端实时同步原理

```
                     你打开了三个窗口
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    手机浏览器          电脑浏览器         本地终端
    (WebSocket)       (WebSocket)      (Unix Socket)
          │                 │                 │
          └────────┬────────┘                 │
                   ▼                          │
             PTY Manager  ◀────────────────────┘
                   │
                   ▼
          claude 进程（一直跑）
```

**任意端输入 → PTY stdin → 所有端同步看到输出**

这不是镜像或转发，而是多个订阅者共享同一个 PTY master fd。哪怕你把所有客户端都断开，claude 还在后台继续执行任务。

---

## 快速开始

```bash
git clone https://github.com/changdazhou/remote-cc.git
cd remote-cc
bash install.sh
```

安装脚本全程交互，自动检测环境，无需手动配置。

安装完成后：

```bash
remotecc start          # 启动服务
```

浏览器打开 `http://<IP>:8310`，或直接用终端：

```bash
rcc-tui            # 本地交互式界面（推荐）
```

---

## 常用命令

```bash
remotecc start          # 启动服务（守护进程，崩溃自动重启）
remotecc stop           # 停止服务
remotecc restart        # 完整重启（更新 server/ 后用）
remotecc reload         # 热重载（仅更新前端/API，不断会话）
remotecc update         # 拉取最新代码并自动重启/热重载
remotecc status         # 查看服务状态
rcc-tui                 # 交互式 TUI（无需登录，本地直连）
remotecc attach <name>  # 通过 TUI 直接接入指定会话
```

在任意会话内：**`Ctrl+]`** 断开回菜单，不终止 Claude 进程。

---

## 更新日志

### 2026-05-12

- **文件浏览器**：Web 界面新增文件浏览功能，支持代码/图片预览、双击全屏、复制路径
- **热重载架构**：服务拆分为 proxy.js（常驻）和 app.js（可热重启），`remotecc reload` 不断会话
- **remotecc update**：自动检测变更类型，server 变更自动 restart，仅前端变更自动 reload
- **remotecc attach**：进入 TUI 界面，支持 `attach <name>` 直接接入指定会话
- **401 自动跳登录页**：服务重启后 token 失效，浏览器自动跳回登录页，不再白屏

---

## 截图

> Web 终端 · 会话管理 · rcc-tui · 移动端

（欢迎贡献截图 🙏）

---

## 文档

- [安装指南](docs/installation.md)
- [使用手册](docs/usage.md)
- [API 文档](docs/api.md)
- [架构说明](docs/architecture.md)
- [开发指南](docs/development.md)

---

## 参与贡献

这个工具还很年轻，欢迎：

- 🐛 [提交 BUG](https://github.com/changdazhou/remote-cc/issues/new?labels=bug)
- 💡 [提功能建议](https://github.com/changdazhou/remote-cc/issues/new?labels=enhancement)
- 🔧 提交 PR

---

## 许可证

[Apache 2.0](LICENSE) © 2026 changdazhou
