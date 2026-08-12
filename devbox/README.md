# 🧰 DevBox — Offline Developer Toolkit Chrome Extension

<p align="center">
  <img src="public/icons/icon128.png" alt="DevBox Logo" width="110" height="110" />
</p>

<p align="center">
  <strong>An offline, privacy-first developer Swiss Army knife for Chrome & Chromium browsers.</strong><br>
  Format, encode, decode, convert, generate, test, and inspect data locally with zero telemetry or network calls.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Offline-22c55e?style=flat-square" alt="Privacy Offline" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT" />
</p>

---

## 📑 Table of Contents

- [✨ Why DevBox?](#-why-devbox)
- [🛠️ Included Tools](#️-included-tools)
- [🚀 How to Install in Your Browser](#-how-to-install-in-your-browser)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone and Build](#step-1-clone-and-build)
  - [Step 2: Load into Google Chrome](#step-2-load-into-google-chrome)
  - [Installing on Other Chromium Browsers (Edge, Brave, Arc, Opera)](#installing-on-other-chromium-browsers)
- [💡 How to Use](#-how-to-use)
  - [Chrome Side Panel & Popout Mode](#chrome-side-panel--popout-mode)
  - [Universal Input Detector](#universal-input-detector)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
- [🔧 Development & Scripts](#-development--scripts)
- [📁 Project Structure](#-project-structure)
- [❓ Troubleshooting & FAQs](#-troubleshooting--faqs)
- [🔒 Privacy & Security Guarantee](#-privacy--security-guarantee)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Why DevBox?

As developers, we constantly paste sensitive tokens, JSON payloads, URLs, and timestamps into random online web utilities. **DevBox** eliminates this security risk by running **100% locally inside your browser**:

- **🔒 100% Offline & Private:** Zero network requests. No tracking, no backend servers, no third-party APIs.
- **⚡ Chrome Side Panel Native:** Dock DevBox right beside your code, localhost tabs, or documentation.
- **🧠 Universal Detector:** Paste any snippet into the home detector bar, and DevBox routes it to the right tool automatically (JSON, JWT, UUID, URL, Timestamp, Color, Base64).
- **🚀 Ultra-Fast:** Built with React 18, Vite, and Tailwind CSS for instant load times and snappy keyboard navigation.

---

## 🛠️ Included Tools

| Icon | Tool | Description & Capabilities |
| :---: | :--- | :--- |
| 📄 | **JSON Formatter & Validator** | Format with 2-space, 4-space, or Tabs; Minify; Alphabetical key sorting; Line numbers; Interactive collapsible tree viewer; Flattened property form grid. |
| 🔑 | **JWT Inspector** | Decodes Header, Payload, and Signature; Automatically checks & displays token expiration (`exp`) status and live human-readable countdowns. |
| 🔤 | **Base64 Encoder / Decoder** | Unicode-safe (UTF-8) Base64 encoding and decoding with one-click input/output swap. |
| 🔗 | **URL Encoder / Decoder** | Full URL and URI component encoder/decoder; Automatic query parameter parser table and breakdown. |
| ⏰ | **Epoch Timestamp Converter** | Bidirectional Unix epoch seconds/milliseconds ↔ Human ISO/UTC/Local date converter with live UTC clock. |
| 🆔 | **UUID Generator** | Cryptographically secure RFC4122 v4 UUID generator using `crypto.randomUUID()` with single and batch generation. |
| 🎨 | **Color Picker & Converter** | Live HEX, RGB, HSL converter with integrated Chrome EyeDropper API to pick colors from any website. |
| 🔍 | **Regex Tester** | Live interactive regular expression matcher with flag toggles (`g`, `i`, `m`, `s`), match highlights, capture groups, and preset cheat sheets. |
| 📱 | **QR Code Generator** | Generate high-res QR codes on the fly with PNG download and SVG clipboard copy options. |
| 📋 | **Smart Clipboard History** | Local-only clipboard manager with search, pinned items, and one-click handoff to any DevBox tool. |

---

## 🚀 How to Install in Your Browser

Follow these simple steps to install DevBox in **Google Chrome**, **Microsoft Edge**, **Brave**, or any Chromium-based browser.

### Prerequisites

Ensure you have **Node.js** (version 18.0 or higher) installed:
- Check version: `node -v`
- Download if needed: [nodejs.org](https://nodejs.org/)

---

### Step 1: Clone and Build

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/devbox.git
   cd devbox
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension package:**
   ```bash
   npm run build
   ```
   *This compiles TypeScript, bundles React with Vite and CRXJS, and creates the ready-to-use extension in the `dist` folder.*

---

### Step 2: Load into Google Chrome

1. Open **Google Chrome**.
2. In the address bar, navigate to:
   ```text
   chrome://extensions
   ```
3. In the top-right corner of the Extensions page, switch the **Developer mode** toggle to **ON**.
4. In the top-left corner, click the **Load unpacked** button.
5. In the file picker dialog, select the **`dist`** folder inside `devbox/`.
6. Click **Select Folder**.
7. 🎉 **DevBox is installed!**
   - Click the puzzle icon (🧩) in your Chrome toolbar.
   - Find **DevBox** and click the **Pin** (📌) icon so it's always accessible.

---

### Installing on Other Chromium Browsers

<details>
<summary><strong>🔵 Microsoft Edge</strong></summary>

1. Navigate to `edge://extensions`.
2. Turn on the **Developer mode** toggle in the left sidebar.
3. Click **Load unpacked**.
4. Select the `dist` folder.
</details>

<details>
<summary><strong>🦁 Brave Browser</strong></summary>

1. Navigate to `brave://extensions`.
2. Turn on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist` folder.
</details>

<details>
<summary><strong>🔴 Opera / Opera GX</strong></summary>

1. Navigate to `opera://extensions`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist` folder.
</details>

<details>
<summary><strong>🌐 Arc Browser</strong></summary>

1. Open Arc Settings or go to `arc://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist` folder.
</details>

---

## 💡 How to Use

### Chrome Side Panel & Popout Mode
- **Side Panel:** Click the DevBox extension icon to open it in Chrome's native Side Panel. It stays docked alongside your active tab without stealing focus or obscuring your work.
- **Detached Window:** Click the popout icon in the top header to open DevBox in a dedicated floating window.

### Universal Input Detector
Paste any raw text into the input bar on the Home screen. DevBox will analyze the format in real-time:
- Raw JSON → Opens **JSON Formatter**
- `eyJ...` token → Opens **JWT Inspector**
- `data:...;base64,...` or valid Base64 string → Opens **Base64 Tool**
- `https://...` or URI query → Opens **URL Tool**
- `1700000000` or ISO string → Opens **Timestamp Converter**
- `#ff5733`, `rgb(...)`, `hsl(...)` → Opens **Color Picker**
- `550e8400-e29b-41d4-a716-446655440000` → Opens **UUID Tool**

### Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+Shift+D` *(Mac: `Cmd+Shift+D`)* | Open / Toggle DevBox Extension |
| `Alt + 0` | Home / Universal Detector |
| `Alt + 1` | JSON Formatter |
| `Alt + 2` | JWT Inspector |
| `Alt + 3` | Base64 Encoder / Decoder |
| `Alt + 4` | URL Encoder / Decoder |
| `Alt + 5` | Epoch Timestamp Converter |
| `Alt + 6` | UUID Generator |
| `Alt + 7` | Color Picker & Converter |
| `Alt + 8` | Regex Tester |
| `Alt + 9` | QR Code Generator |
| `Alt + C` | Clipboard History |

---

## 🔧 Development & Scripts

If you want to contribute, modify tools, or build custom extensions:

```bash
# Install dependencies
npm install

# Start Vite live development server with Hot Module Replacement (HMR)
npm run dev

# Compile TypeScript and bundle production build in ./dist
npm run build

# Package dist/ into a clean devbox.zip for Chrome Web Store release
npm run package
```

> **Tip for Development:** When running `npm run dev`, you can load the `dist` folder into `chrome://extensions` once. Vite and CRXJS will hot-reload your code changes automatically in the browser!

---

## 📁 Project Structure

```text
devbox/
├── dist/                      # Compiled production output (Load Unpacked targets this)
├── public/
│   └── icons/                 # Extension icons (16x16, 32x32, 48x48, 128x128)
├── src/
│   ├── background.ts          # Chrome Extension Service Worker (Side panel handler)
│   ├── App.tsx                # Main application layout, sidebar, router & shortcuts
│   ├── main.tsx               # React root renderer
│   ├── index.css              # Custom Tailwind CSS styling & animations
│   ├── components/            # Shared UI components (DevBoxLogo, Header, Tooltip, etc.)
│   ├── storage/               # Chrome Storage & LocalStorage adapters
│   ├── utils/                 # Detector heuristics, formatting & clipboard utilities
│   └── tools/                 # Individual developer tool modules
│       ├── home/              # Universal Detector & Quick Launch Grid
│       ├── json/              # JSON Formatter, Tree View, Key Sorter
│       ├── jwt/               # JWT Decoder & Expiry Badge
│       ├── base64/            # Base64 Encoder / Decoder
│       ├── url/               # URL & Query Param Parser
│       ├── timestamp/         # Epoch & ISO Date Converter
│       ├── uuid/              # UUID v4 Generator
│       ├── color/             # Color Picker, Eyedropper & Palette
│       ├── regex/             # Regex Matcher & Tester
│       ├── qr/                # QR Code Generator
│       └── clipboard/         # Clipboard History Manager
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite + CRXJS plugin configuration
```

---

## ❓ Troubleshooting & FAQs

### 1. Error: "Manifest file is missing or unreadable"
- **Cause:** You selected the root folder or `src/` instead of the compiled `dist` folder.
- **Solution:** Run `npm run build` first, then in `chrome://extensions`, click **Load unpacked** and select the **`dist`** folder inside `devbox/`.

### 2. Changes not reflecting after editing code?
- Click the reload icon (🔄) on the **DevBox** card in `chrome://extensions`.
- If you made changes to `manifest.json` or `background.ts`, toggle the extension OFF and ON again.

### 3. Side Panel doesn't open?
- In Chrome 114+, the Side Panel API is natively supported. Ensure you are using an updated version of Chrome or Chromium.
- You can also open the Side Panel directly via Chrome's Side Panel icon in the top toolbar.

---

## 🔒 Privacy & Security Guarantee

- **Zero Analytics / Telemetry:** DevBox collects zero metrics, analytics, or usage logs.
- **Zero Network Traffic:** All operations run locally via JavaScript and browser Web APIs (`crypto.randomUUID`, `Intl.DateTimeFormat`, `Canvas`, etc.).
- **Permissions Explained:**
  - `storage`: Used solely to save your local preferences (theme, active tool, pinned history items) in your browser.
  - `clipboardRead` / `clipboardWrite`: Used only when you click "Copy", "Paste", or interact with the Clipboard tool.
  - `sidePanel`: Used to dock DevBox neatly into Chrome's native Side Panel.

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<p align="center">Made with ❤️ for developers everywhere.</p>
