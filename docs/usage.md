# 使用手册 / Usage Manual

[中文](#中文) | [English](#english)

---

## 中文

### 多端协同工作原理

RemoteCC 的核心是**一个 PTY 进程，多个同步观察者**：

```
Claude Code PTY（持续运行）
        ├──▶ 浏览器 WebSocket（手机/平板/PC）
        ├──▶ rcc-tui（本地交互式 TUI）
        └──▶ remotecc attach（进入 TUI 接入会话）
```

无论从哪端输入，所有端实时可见。PTY 独立于客户端运行——关闭浏览器或断开 SSH，Claude 在后台继续工作。

---

### Web 界面

浏览器访问 `http://<server>:8310` 登录后使用。

#### 对话列表（首页）

| 元素 | 说明 |
|------|------|
| 绿点 ● | 会话运行中 |
| 灰点 ○ | 会话已结束（5秒后自动移除） |
| 会话名 | 默认为目录名，双击可改名 |
| 时间 | 最后活跃时间 |
| `≡` | 查看日志 |
| `✕` | 关闭/删除会话 |

#### 新建对话

- **New 标签**：输入工作目录和会话名 → 启动
- **Resume 标签**：从 `~/.claude/projects/` 选历史对话 → 以 `--resume` 恢复

#### 终端操作

| 快捷键 | 功能 |
|--------|------|
| Shift+Tab | 切换 Claude 内部模式（Plan/Auto/Act） |
| Ctrl+Shift+C | 复制选中内容 |
| Ctrl+Shift+V | 粘贴 |
| 右键 | 上下文菜单（Copy/Paste/Clear） |

#### 符号快捷键栏

- **CC 模式**（蓝色）：`M`（Shift+Tab）`Esc` `Tab` `/` `!` `↑↓←→` `⏎`
- **SH 模式**（黄色，行首输入 `!` 自动切换）：两排 Linux 常用符号
- `Ctrl+]` 在会话内断开回菜单

#### 文件浏览器（右上角 ⊞）

点击顶栏 ⊞ 图标打开文件浏览器，默认显示当前会话的工作目录：

- **左栏**：目录浏览，双击进入子目录，支持隐藏文件显示
- **右栏**：文件预览（文本/代码含行号、图片）
- **复制路径**：鼠标悬停条目，点击 ⎘ 复制绝对路径；预览面板顶部也有复制按钮

#### 设置页（右上角 ⚙）

- **外观**：UI 风格（Cyberpunk/Minimal/Glass）+ 9 套颜色主题
- **终端**：字体/字号/行高/光标/回滚行数/符号栏
- **连接**：重连延迟
- **语言**：中文 / English

---

### 命令行工具

#### remotecc

统一管理入口：

```bash
remotecc                   # 进入 TUI 界面
remotecc attach            # 进入 TUI 界面
remotecc attach <name>     # 直接在 TUI 内接入指定会话
remotecc ls                # 列出所有会话
remotecc log <name>        # 实时查看会话日志（tail -f）
```

**断开方式**：`Ctrl+]`（不终止 PTY）

#### rcc-tui（推荐）

本地交互式 TUI，无需登录，直接通过 Unix Socket 连接：

```bash
rcc-tui
```

启动后显示大字 banner 和会话列表：

```
  ██████╗  ██████╗ ██████╗
  ...
  ● 服务运行中  :8310

  对话列表
  ─────────────────────────
   › ● my-project  ~/project  3m ago
     ＋  新建对话
     ⏎  恢复历史对话
     ✕  退出
```

**键盘操作**：

| 按键 | 功能 |
|------|------|
| `↑` / `↓` | 移动光标 |
| `Enter` | 确认/进入 |
| `q` / `Esc` | 返回上一页 |
| `Ctrl+C` | 退出 rcc-tui |
| **`Ctrl+]`** | **在会话内断开，返回菜单** |

---

### URL 路由

| URL | 说明 |
|-----|------|
| `/#/` | 首页 |
| `/#/new` | 新建对话 |
| `/#/session/:id` | 打开指定会话 |
| `/#/settings` | 设置页 |

---

## English

### How Multi-Client Sync Works

RemoteCC's core is **one PTY process, multiple synchronized observers**:

```
Claude Code PTY (always running)
        ├──▶ Browser WebSocket (phone/tablet/PC)
        ├──▶ rcc-tui (local interactive TUI)
        └──▶ remotecc attach (enter TUI to attach session)
```

Input from any client is visible to all others in real time. The PTY runs independently — closing the browser or dropping SSH does not interrupt Claude.

---

### Web Interface

Open `http://<server>:8310` in a browser and log in.

#### Conversation List (Home)

| Element | Description |
|---------|-------------|
| Green ● | Session running |
| Gray ○ | Session ended (auto-removed after 5s) |
| Session name | Defaults to directory name; double-click to rename |
| Time | Last active time |
| `≡` | View log |
| `✕` | Close/delete session |

#### New Conversation

- **New tab**: Enter working directory and session name → start
- **Resume tab**: Browse `~/.claude/projects/` history → resume with `--resume`

#### Terminal Shortcuts

| Shortcut | Function |
|----------|----------|
| Shift+Tab | Switch Claude mode (Plan/Auto/Act) |
| Ctrl+Shift+C | Copy selection |
| Ctrl+Shift+V | Paste |
| Right-click | Context menu (Copy/Paste/Clear) |

#### Symbol Bar

- **CC mode** (blue): `M`(Shift+Tab) `Esc` `Tab` `/` `!` `↑↓←→` `⏎`
- **SH mode** (yellow, auto-switch when `!` is first char): two rows of Linux symbols
- `Ctrl+]` detaches from session back to menu

#### File Browser (⊞ top right)

Click the ⊞ icon to open the file browser, which defaults to the current session's working directory:

- **Left panel**: directory listing, double-click to enter, toggle hidden files
- **Right panel**: file preview (text/code with line numbers, images)
- **Copy path**: hover over entry, click ⎘; also available in the preview header

#### Settings (⚙ top right)

- **Appearance**: UI style (Cyberpunk/Minimal/Glass) + 9 color themes
- **Terminal**: font / size / line-height / cursor / scrollback / symbol bar
- **Connection**: reconnect delays
- **Language**: 中文 / English

---

### CLI Tools

#### remotecc

Unified management entry point:

```bash
remotecc                   # Open TUI
remotecc attach            # Open TUI
remotecc attach <name>     # Open TUI and attach to named session directly
remotecc ls                # List all sessions
remotecc log <name>        # tail -f session log
```

**Detach**: `Ctrl+]` (does not kill the PTY)

#### rcc-tui (Recommended)

Local interactive TUI — no login required, connects directly via Unix Socket:

```bash
rcc-tui
```

Displays a large-text banner and session list on launch:

```
  ██████╗  ██████╗ ██████╗
  ...
  ● Service running  :8310

  Conversation List
  ─────────────────────────
   › ● my-project  ~/project  3m ago
     ＋  New conversation
     ⏎  Resume history
     ✕  Exit
```

**Keyboard**:

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move cursor |
| `Enter` | Confirm / enter |
| `q` / `Esc` | Back to previous page |
| `Ctrl+C` | Quit rcc-tui |
| **`Ctrl+]`** | **Detach from session, back to menu** |

---

### URL Routes

| URL | Description |
|-----|-------------|
| `/#/` | Home |
| `/#/new` | New conversation |
| `/#/session/:id` | Open specific session |
| `/#/settings` | Settings |

---

## 更新记录 / Changelog

### 2026-05-12

**文件浏览器**：Web 界面新增文件浏览功能。顶栏点击 ⊞ 打开，支持目录导航、文本/图片预览、复制路径、一键 cd 到终端。

**热重载架构**：服务拆分为 proxy.js（常驻）和 app.js（可热重启）。执行 `rcc-server reload` 仅重启业务层，WS 连接和 Claude 会话不中断。

**rcc-server 命令**：

| 命令 | 说明 |
|------|------|
| `rcc-server reload` | 热重载（改了 app.js 层代码用此命令，不断会话） |
| `rcc-server restart` | 完整重启（改了 proxy.js/auth.js 等核心文件用此命令） |

---

## License / 许可证

Apache 2.0 — see [LICENSE](../LICENSE)
