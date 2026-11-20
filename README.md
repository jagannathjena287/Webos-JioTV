# MyJio — JioTV for LG webOS

A modern **MyJio** Live TV client for LG Smart TVs running webOS, built with a 10-foot TV-scaled dark UI, full IR/D-pad remote support, live EPG programme guides, and low-RAM performance optimizations for 1920×1080 TV displays.

![webOS](https://img.shields.io/badge/webOS-TV-blue)
![Version](https://img.shields.io/badge/version-0.3.19-green)

## ✨ Features

- **MyJio 10-Foot TV UI** — Clean dark layout with MyJio branding, large couch-readable typography, and dark logo containers so both light and dark broadcaster logos stay sharp
- **Full IR & Magic Remote Support (`remote-controls.js`)** — Container-aware D-pad navigation (`ArrowUp`/`Down`/`Left`/`Right`), automatic initial/restored focus, Play/Pause/Stop, Channel Up/Down, Yellow-button Guide, and direct `0–9` channel ID tuning
- **3-Column Live TV (Genres + Languages)** — Filter by Genre (`Entertainment`, `Movies`, `Sports`, `News`, `Music`, `Infotainment`, etc.) and Language pills (`Hindi`, `Bengali`, `English`, and more), with a live EPG preview panel
- **In-Player Channel Switcher & Live Guide** — Open **Channels** while watching to browse and switch channels over the playing video while previewing each channel's **Now Playing** and **Up Next** schedule via `epg/get`
- **Programme Guide Tab** — Browse full-day schedules across all channels and tune straight into any broadcast
- **Low-RAM webOS Optimizations** — Zero `backdrop-filter` GPU blur overhead, lazy-decoded channel logos, and chunked 80-channel rendering for smooth scrolling on LG TVs
- **Search & OTP Sign-In** — On-screen TV keyboard for search and on-TV Jio mobile OTP authentication

## 🛠️ Build & Install

### Prerequisites

- [webOS SDK CLI](https://webostv.developer.lge.com/develop/tools/cli-installation) (`@webos-tools/cli` / `ares-*` tools)
- Node.js 18+
- LG webOS TV with Developer Mode enabled (or **webOS Dev Manager**)

### Build the IPK

```bash
cd Webos-JioTV
ares-package -e "sample.mp4" -e ".git" -e "dist" . service/com.codex.jtvwebos.service --outdir dist
```

### Install on TV

```bash
# Add your TV (first time only)
ares-setup-device

# Install
ares-install --device tv ./dist/com.codex.jtvwebos_0.3.19_all.ipk

# Launch
ares-launch --device tv com.codex.jtvwebos
```

### Browser Testing

```bash
ares-server -p 8080 .
# Open http://localhost:8080 in your browser
```

In browser mode, demo channels load automatically with `sample.mp4` for testing playback, OSD controls, and the OTP sign-in flow (use OTP `123456`).

## 🏗️ Architecture

```text
├── index.html                 # MyJio TV layout (Home, Live TV, Guide, Search, Player, Switcher)
├── styles.css                 # 10-foot TV dark theme & low-RAM performance styles
├── app.js                     # App logic, genre/language filters, EPG, Shaka/HTML5 playback
├── remote-controls.js         # 2D D-pad spatial/container navigation & webOS media keys
├── appinfo.json               # webOS app metadata (v0.3.19)
├── icon.png / largeIcon.png   # App launcher icons (80×80 & 130×130)
├── shaka-player.compiled.js   # Adaptive streaming player
├── webOSTVjs-1.2.13/          # LG webOS TV JavaScript library
└── service/
    └── com.codex.jtvwebos.service/
        ├── jio_service.js     # Jio API bridge (auth, channels, EPG, local stream proxy)
        ├── hls_utils.js       # HLS manifest utilities
        ├── package.json
        └── services.json
```

**On TV:** `app.js` → Luna Service Bus (`luna://com.codex.jtvwebos.service/`) → `jio_service.js` → Jio API

**In Browser:** `app.js` → Demo channels + local `sample.mp4`

## 📝 Credits

- Original webOS service backend by [andromyth/jiotv-lg-webos](https://github.com/andromyth/jiotv-lg-webos)
- Layout inspiration from [Vistaar](https://github.com/fortysev-en/vistaar)
- [Shaka Player](https://github.com/shaka-project/shaka-player) (Apache 2.0) for adaptive streaming
- [webOS TV JS Library](https://webostv.developer.lge.com) by LG Electronics

## 📄 License

This project builds upon open-source components. See [SHAKA-LICENSE.txt](SHAKA-LICENSE.txt) for the Shaka Player license (Apache 2.0).
