# RemoteCC — Use Claude Code from Anywhere

[中文](README.md) | English

```
  ██████╗  ██████╗ ██████╗
  ██╔══██╗██╔════╝██╔════╝
  ██████╔╝██║     ██║
  ██╔══██╗██║     ██║
  ██║  ██║╚██████╗╚██████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝
  Remote Claude Code
```

> **This tool was built with the help of Claude Code, and is still actively being improved. Bug reports and suggestions are very welcome — please open an [Issue](https://github.com/changdazhou/remote-cc/issues).**

---

## What is this?

**Access Claude Code from your phone, tablet, or any browser — all in real time.**

Claude Code is a powerful AI coding assistant that runs in your terminal — but only locally. RemoteCC breaks that limitation. Your Claude Code session can be accessed simultaneously from a phone browser, a tablet, and a local terminal, with **all clients sharing the same PTY process in real time**.

This is not screenshots or log forwarding. It is **true bidirectional real-time sync** — type on your phone and the desktop sees it instantly; run something in the terminal and your phone shows the output right away. Disconnect any client at any time, and Claude keeps working in the background. Reconnect whenever you want, seamlessly.

---

## Key Features

- **Real terminal** — full color, interactive, and mouse support, just like using it locally
- **Real-time multi-client sync** — phone, tablet, and desktop all share the same Claude session
- **Persistent sessions** — close the browser or drop SSH, Claude keeps running; reconnect anytime
- **History resume** — reads `~/.claude/projects/`, resume any past conversation
- **File browser** — browse server files in the web UI, preview code/images, copy paths
- **Session manager** — run `remotecc` on the server to get a visual menu for managing sessions
- **Detach shortcut** — `Ctrl+]` goes back to the menu without killing Claude
- **Mobile-optimized** — responsive UI, comfortable to use on a phone
- **Rich themes** — 9 color themes + 3 UI styles

---

## Upload Files / Images to Claude

The web terminal toolbar provides a **＋** button that supports three ways to pass files to Claude:

| Method | How |
|--------|-----|
| Click to select | Click the **＋** button below the terminal, choose any file or image |
| Drag & drop | Drag files directly onto the terminal area |
| Paste image | Screenshot then Ctrl+V (auto-uploads) |

Files are stored to `~/.rcc/uploads/` on the server, and the path is automatically typed at the terminal cursor — just press Enter or continue your Claude command.

---

## File Browser

Click the **⊞** icon in the top bar to open the file browser. It opens in the current session's working directory by default.

| Action | Description |
|--------|-------------|
| Single-click a file | Preview on the right (code with line numbers, images inline) |
| Double-click a file | Full-screen view — easier to read on mobile |
| Double-click a folder | Navigate into it |
| ⎘ button | Copy the absolute path of the file or folder |
| Path input box | Type a path directly and press Enter to jump there |

Supported preview types: `.md` `.txt` `.py` `.js` `.ts` `.json` `.sh` `.yaml` and other code/text files, plus common image formats (`png` `jpg` `gif` `webp`).

---

## How Real-Time Sync Works

```
               You have three windows open
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
  Phone browser     Desktop browser    Local terminal
  (WebSocket)        (WebSocket)      (Unix Socket)
       │                  │                  │
       └───────┬──────────┘                  │
               ▼                             │
         PTY Manager  ◀───────────────────────┘
               │
               ▼
        claude process (always running)
```

**Any client input → PTY stdin → all clients see the output**

This is not mirroring or proxying — multiple subscribers share the same PTY master fd. Even if you disconnect all clients, Claude keeps executing in the background.

---

## Quick Start

```bash
git clone https://github.com/changdazhou/remote-cc.git
cd remote-cc
bash install.sh
```

The install script is fully interactive and auto-detects your environment.

After installation:

```bash
remotecc start     # Start the service
remotecc           # Open the visual session manager
```

Or open `http://<server-ip>:8310` in a browser.

---

## Commands

```bash
# Service management
remotecc start          # Start service (daemon, auto-restart on crash)
remotecc stop           # Stop service
remotecc restart        # Full restart (use after server-side updates)
remotecc reload         # Hot reload (no session interruption)
remotecc update         # Pull latest version and auto-restart/reload
remotecc status         # Show whether the service is running

# Daily use (run on the server)
remotecc                # Open visual session manager
remotecc attach <name>  # Jump directly into a named session
```

Inside any session: **`Ctrl+]`** goes back to the menu without killing Claude.

---

## Changelog

### 2026-05-12

- **File browser**: browse server files, preview code/images, double-click for fullscreen, copy path
- **Hot reload**: `remotecc reload` restarts only the API layer, active Claude sessions are not interrupted
- **remotecc update**: detects what changed and automatically restarts or hot-reloads as needed
- **remotecc attach**: opens the session manager and goes directly into the named session; detaching returns to the menu instead of exiting
- **Login redirect**: when the service restarts and the token expires, the browser automatically shows the login page instead of a blank screen

---

## Screenshots

> Web terminal · Session manager · File browser · Mobile

(Screenshots welcome 🙏)

---

## Documentation

- [Installation Guide](docs/installation.md)
- [Usage Manual](docs/usage.md)
- [API Reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development.md)

---

## Contributing

This tool is young and actively evolving. Contributions welcome:

- 🐛 [Report a bug](https://github.com/changdazhou/remote-cc/issues/new?labels=bug)
- 💡 [Request a feature](https://github.com/changdazhou/remote-cc/issues/new?labels=enhancement)
- 🔧 Submit a PR

---

## License

[Apache 2.0](LICENSE) © 2026 changdazhou
