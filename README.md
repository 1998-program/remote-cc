# RemoteCC — 躺平使用 Claude Code / Codex

[English](README.en.md) | 中文

```
  ██████╗  ██████╗ ██████╗
  ██╔══██╗██╔════╝██╔════╝
  ██████╔╝██║     ██║
  ██╔══██╗██║     ██║
  ██║  ██║╚██████╗╚██████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝
  RemoteCC
```

> **本工具由 Claude Code 辅助生成，目前仍在打磨迭代中。欢迎提交 [Issue](https://github.com/changdazhou/remote-cc/issues) 反馈 BUG 和建议。**

---

## 这是什么？

**把 Claude Code 和 Codex 从本地终端解放出来，躺在床上用手机也能和它们对话。**

Claude Code / Codex 都是跑在终端里的 AI 编程助手，功能强大，但只能在本机用。RemoteCC 打通了这个限制——你的 Agent 会话可以同时从手机浏览器、平板、电脑终端访问，**所有端实时同步，真正共享同一个 PTY 进程**。

不是截图，不是日志，是**完全实时的双向同步**——你在手机上输入，电脑上看得到；你在终端里执行，手机上同步显示。任意断开任意端，Agent 在后台继续工作，随时重连、无缝恢复。

---

## 核心特性

- **真实终端** — 颜色、交互、鼠标全支持，和直接在本机用没有区别
- **实时多端同步** — 手机、平板、电脑同时接入同一个 Agent 会话
- **持久会话** — 关闭浏览器或断开 SSH，Agent 在后台继续跑，随时 reconnect
- **历史恢复** — 读取 Claude Code / Codex 历史，自动按工作目录恢复上次对话
- **目录式新建任务** — 新建会话时可从服务器目录树选择工作目录
- **文件浏览器** — 在 Web 端直接浏览服务器上的文件，预览代码/图片，复制路径
- **终端管理界面** — 在服务器上直接运行 `remotecc`，弹出可视化菜单管理所有会话
- **多端断开快捷键** — `Ctrl+]` 随时脱离当前会话回菜单，不终止 Agent
- **移动端优化** — 响应式 UI，手机上也能舒适操作
- **丰富主题** — 9 套颜色主题 + 3 种 UI 风格

---

## 上传文件 / 图片给 Agent

Web 端终端工具栏提供上传按钮，支持三种方式向 Claude Code 或 Codex 传递文件：

| 方式 | 操作 |
|------|------|
| 点击按钮选文件 | 点击终端下方上传按钮，选择任意文件或图片 |
| 拖拽 | 直接把文件拖到终端区域 |
| 粘贴图片 | 截图后 Ctrl+V 粘贴（自动上传） |

文件上传到服务器 `~/.rcc/uploads/` 目录，路径自动填入终端光标位置，直接回车或继续输入 Agent 命令即可。

---

## 文件浏览器

点击顶栏文件夹图标打开文件浏览器，默认显示服务器根目录 `/`。

| 操作 | 说明 |
|------|------|
| 单击文件 | 右侧预览内容（代码含行号，图片直接显示） |
| 双击文件 | 全屏查看，手机上阅读更舒适 |
| 双击目录 | 进入目录 |
| 新建文件夹按钮 | 在当前目录创建子目录 |
| 复制路径按钮 | 复制文件/目录的绝对路径 |
| 上传 / 下载按钮 | 上传到当前目录 / 下载文件 |
| 拖拽文件 | 直接把文件拖到文件浏览器，上传到当前目录 |
| 路径输入框 | 直接输入路径跳转，回车确认 |

支持预览的文件类型：`.md` `.txt` `.py` `.js` `.ts` `.json` `.sh` `.yaml` 等代码和文本文件，以及常见图片格式（`png` `jpg` `gif` `webp`）。

设置页可以配置文件浏览器默认打开目录、临时 Shell 默认目录、新建会话默认目录，也支持修改 Web 登录密码。

---

## 临时 Shell

点击顶栏终端图标打开临时终端。它是普通 shell PTY，不进入 RemoteCC 会话列表；浏览器断开或关闭该页面后进程会结束。默认优先使用 `zsh`，其次 `fish`、`bash`、`sh`；也可以用 `RCC_SHELL` 或 `REMOTECC_SHELL` 指定。需要长期保持时，建议在里面使用 `tmux`。

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
          Agent 进程（一直跑）
```

**任意端输入 → PTY stdin → 所有端同步看到输出**

这不是镜像或转发，而是多个订阅者共享同一个 PTY master fd。哪怕你把所有客户端都断开，Agent 还在后台继续执行任务。

---

## 快速开始

```bash
git clone https://github.com/changdazhou/remote-cc.git
cd remote-cc
bash install.sh
```

安装脚本全程交互，自动检测环境，无需手动配置。

RemoteCC 会自动检测 Claude Code 和 Codex，至少安装其中一个即可。新建会话时可以选择 Agent；历史恢复支持 Claude Code 的 `~/.claude/projects/`，以及 Codex 的 `~/.codex/sessions/` 会话记录。

如果 Codex 或 Claude Code 需要代理，可在安装向导中配置 `CODEX_PROXY` / `CLAUDE_PROXY`。代理只注入对应 Agent CLI，不作为 RemoteCC 全局代理；提示里的默认示例是 `http://127.0.0.1:7890`。

安装完成后：

```bash
remotecc start     # 启动服务
remotecc           # 弹出可视化菜单，管理会话
```

浏览器打开 `http://<服务器IP>:8310` 也可以使用。

---

## 常用命令

```bash
# 服务管理
remotecc start          # 启动服务（守护进程，崩溃自动重启）
remotecc stop           # 停止服务
remotecc restart        # 完整重启（更新后需要用）
remotecc reload         # 热重载（不断开正在进行的会话）
remotecc update         # 拉取最新版本，自动重启/热重载
remotecc status         # 查看服务是否在运行

# 日常使用（在服务器终端里运行）
remotecc                # 弹出可视化菜单，查看/进入/新建会话
remotecc attach <名称>  # 直接进入指定名称的会话
```

在任意会话内：**`Ctrl+]`** 退回菜单，不终止 Agent 进程。

---

## 更新日志

### 2026-06-03

- **TUI 断开修复**：修复 `rcc-tui` 新建会话后第一次 `Ctrl+]` 无法正常回菜单的问题
- **新建任务目录选择**：Web 新建会话支持通过目录选择器挑选工作目录
- **文件浏览器**：默认从 `/` 打开，支持新建文件夹、点击/拖拽上传到当前目录和下载文件
- **临时 Shell**：Web 顶栏新增通用终端入口，提供不持久化的纯终端
- **统一图标**：Web 顶栏、文件管理器、设置页和操作按钮改为统一 CSS 线框图标
- **设置增强**：支持配置默认目录和修改 Web 登录密码

### 2026-05-21

- **Codex 历史恢复**：改为读取 `~/.codex/sessions/` 中的真实会话元数据，按工作目录分组，恢复时不再落到 `~`
- **恢复界面**：Web/TUI 的 Codex 历史按工作目录展示，不再多出 `~/.codex/history.jsonl` 这一层
- **移动端终端**：优化 xterm 异步写入后的锁底逻辑，减少 Codex 输出底部留白

### 2026-05-19

- **Codex 支持**：新建会话可选择 Claude Code 或 Codex，活跃会话会显示 Agent 类型
- **历史恢复**：支持从 Claude Code / Codex 历史中恢复历史对话
- **Agent 代理**：安装和更新流程支持 `CODEX_PROXY` / `CLAUDE_PROXY`，代理只注入对应 Agent CLI
- **服务管理**：修复 `rcc-tui` 服务状态误判，端口占用时 `rcc-server` 会显示占用进程

### 2026-05-12

- **文件浏览器**：Web 界面新增文件浏览功能，支持代码/图片预览、双击全屏、复制路径
- **热重载**：`remotecc reload` 仅重启业务层，不断开正在进行的 Agent 会话
- **remotecc update**：一键更新，自动判断是否需要重启
- **remotecc attach**：直接进入指定会话，断开后回到菜单而非退出终端
- **登录页跳转**：服务重启后浏览器自动跳回登录页，不再白屏

---

## 截图

| Web 会话列表 | Web 终端 |
|---|---|
| <img src="docs/assets/screenshots/web-home-desktop.png" alt="Web 会话列表" width="520"> | <img src="docs/assets/screenshots/web-terminal-desktop.png" alt="Web 终端" width="520"> |

| 移动端会话列表 | TUI 会话管理 |
|---|---|
| <img src="docs/assets/screenshots/mobile-home.jpg" alt="移动端会话列表" width="260"> | <img src="docs/assets/screenshots/tui-session-list.png" alt="TUI 会话管理" width="520"> |

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
