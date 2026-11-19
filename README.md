# Vistaar — JioTV for LG webOS

A modern JioTV client for LG Smart TVs running webOS, featuring the **Vistaar** design system — a sleek, near-black glass UI optimized for 1920×1080 TV displays and remote control navigation.

![webOS](https://img.shields.io/badge/webOS-TV-blue)
![Version](https://img.shields.io/badge/version-0.3.18-green)

## ✨ Features

- **Vistaar UI** — Premium dark glass design with ambient gradient backdrop, floating nav pill, hero showcase, and smooth focus animations
- **Live TV Streaming** — Stream 800+ Jio channels via HLS/DASH with Shaka Player
- **3-Column Live TV** — Categories sidebar, channel grid, and live preview panel
- **Programme Guide** — Full schedule browser with timeline slots
- **Search** — On-screen QWERTY keyboard for TV remote navigation
- **Channel Tune** — Type channel numbers directly with the remote numpad
- **Favourites & Recents** — Bookmark channels and track watch history
- **OTP Sign-In** — Authenticate with your Jio mobile number directly on TV
- **Browser Preview** — Full simulation mode with demo channels for desktop testing

## 📸 Screenshots

| Home | Live TV | Search |
|------|---------|--------|
| Hero showcase with channel rows | 3-column layout with preview | On-screen keyboard with results |

## 🛠️ Build & Install

### Prerequisites

- [webOS SDK CLI](https://webostv.developer.lge.com/develop/tools/cli-installation) (`ares-*` tools)
- Node.js 18+
- LG webOS TV with Developer Mode enabled

### Build the IPK

```bash
cd jiotv-lg-webos
ares-package -e "sample.mp4" . service/com.codex.jtvwebos.service -o dist
```

### Install on TV

```bash
# Add your TV (first time only)
ares-setup-device

# Install
ares-install dist/com.codex.jtvwebos_0.3.18_all.ipk -d <your-tv-name>

# Launch
ares-launch com.codex.jtvwebos -d <your-tv-name>
```

### Browser Testing

```bash
ares-server -p 8080 .
# Open http://localhost:8080 in your browser
```

In browser mode, 16 demo channels load automatically with a local sample video for testing playback, OSD controls, and the OTP sign-in flow (use OTP `123456`).

## 🏗️ Architecture

```
├── index.html          # Vistaar UI layout (all screens)
├── styles.css          # Vistaar design system (~1660 lines)
├── app.js              # App logic, navigation, playback (~900 lines)
├── appinfo.json        # webOS app metadata
├── shaka-player.compiled.js  # HLS/DASH video player
├── webOSTVjs-1.2.13/   # LG webOS TV JavaScript library
└── service/
    └── com.codex.jtvwebos.service/
        ├── jio_service.js   # Jio API bridge (auth, channels, proxy)
        ├── hls_utils.js     # HLS manifest utilities
        ├── package.json
        └── services.json
```

**On TV:** `app.js` → Luna Service Bus → `jio_service.js` → Jio API (`jiotvapi.media.jio.com`)

**In Browser:** `app.js` → Demo channels + local video (no Jio API needed)

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#07080A` | Near-black ground |
| `--accent` | `#5AA9FF` | Vistaar blue |
| `--text` | `#F5F6F8` | Primary text |
| `--live` | `#E5262F` | Live indicator red |
| `--glass` | `rgba(22,25,31,0.65)` | Glass morphism panels |

Focus style: white-fill with scale transform and elevation shadow.

## 📝 Credits

- Original webOS service backend by [andromyth/jiotv-lg-webos](https://github.com/andromyth/jiotv-lg-webos)
- UI inspired by [Vistaar](https://github.com/fortysev-en/vistaar) Android TV design
- [Shaka Player](https://github.com/shaka-project/shaka-player) (Apache 2.0) for adaptive streaming
- [webOS TV JS Library](https://webostv.developer.lge.com) by LG Electronics

## 📄 License

This project builds upon open-source components. See [SHAKA-LICENSE.txt](SHAKA-LICENSE.txt) for the Shaka Player license (Apache 2.0).
