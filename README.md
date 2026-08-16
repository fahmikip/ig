# Coverly — Instagram Cover Generator

> **Create covers that get noticed.**

Coverly is a fast, modern and premium **Instagram cover generator** that runs entirely in your browser. Upload a photo, pick a template, refine the text and download a crisp PNG or JPG — all locally, no backend, no sign-up, no tracking.

![Coverly](assets/icons/icon-512.png)

---

## ✨ Features

- **28 premium templates** — Cinematic, Travel, Street, Minimal, Editorial, Quote, Product, Fashion, Music, Fitness, Birthday & more, across 8 categories. Each with its own distinct typography and color palette.
- **Real-time canvas editor** — drag, zoom, rotate and reposition your photo with mouse, touch or trackpad (including pinch-to-zoom).
- **Full text control** — 8 fonts, size, weight, letter-spacing, line-height, case, color, opacity, alignment and 9 position presets. Drag text anywhere on the canvas.
- **Text effects** — gradient fills, soft shadows and outlines, each fully customizable.
- **Stickers & shapes** — 15 emojis, 6 shapes and 6 badges that you can drag, scale, rotate, recolor and layer on the canvas.
- **Brand kits** — save your colors + fonts as a reusable brand kit and apply it to any template.
- **Smart Title Ideas** — type a theme and get headline ideas generated **locally** (a keyword dictionary — no AI, no API).
- **Instant photos** — drag & drop, paste from clipboard, or use built-in sample photos to try a template instantly.
- **3 canvas sizes** — Portrait 1080×1350, Square 1080×1080, Story 1080×1920, with proportional scaling of your design.
- **Batch export** — download the current size, or all 3 IG sizes at once, as PNG or JPG.
- **Undo / Redo** — up to 60 history states + keyboard shortcuts.
- **Dark mode** — premium dark theme by default, light toggle, persisted to localStorage.
- **Mobile-first** — bottom toolbar and bottom sheets on small screens.
- **100% private** — photos never leave your device.

## 🛠 Technologies

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Canvas API (2D rendering)
- LocalStorage (preferences only — never images)
- Google Fonts (with graceful fallbacks)
- No frameworks · No build step · No backend · No API keys

## 📁 Folder structure

```
├── index.html          # Landing page + editor + modals
├── 404.html
├── .nojekyll           # Tells GitHub Pages to skip Jekyll
├── manifest.webmanifest
├── sw.js               # Optional service worker (offline cache)
├── css/
│   ├── style.css       # Design system + layout
│   ├── responsive.css  # Breakpoints
│   └── animations.css  # Transitions & keyframes
├── js/
│   ├── app.js          # Init, view switching, PWA
│   ├── editor.js       # State, history, canvas interactions
│   ├── canvas.js       # Rendering pipeline
│   ├── templates.js    # 28 templates + title ideas
│   ├── controls.js     # UI bindings, modals, keyboard
│   ├── export.js       # PNG/JPG export
│   └── storage.js      # localStorage wrapper
└── assets/
    └── icons/          # App icons (SVG + PNG)
```

Plain `<script>` tags are used instead of ES modules so the app works both from **GitHub Pages** and when opened directly via `file://`.

## 🚀 Local development

No build step, no installs. Just serve the folder:

```bash
# with Python
python -m http.server 8080

# or with Node
npx serve .
```

Then open `http://localhost:8080`. You can also simply double-click `index.html`.

## ☁️ Deploy to GitHub Pages

1. Create a repository and push this folder to it.
2. Go to **Settings → Pages**.
3. Under **Source** select *Deploy from a branch* and choose the `main` branch (root folder).
4. Your app will be live at `https://<USERNAME>.github.io/<REPOSITORY>/`.

All asset paths are relative, `.nojekyll` is included and the service worker is optional — so GitHub Pages works without any configuration.

## ⌨️ Keyboard shortcuts

| Shortcut                  | Action             |
| ------------------------- | ------------------ |
| `Ctrl/Cmd + Z`            | Undo               |
| `Ctrl/Cmd + Shift + Z`    | Redo               |
| `Ctrl/Cmd + S`            | Export             |
| `Delete`                  | Remove selected text |
| `Esc`                     | Close dialog/sheet |

## 🧩 Optional / future ideas

- Multi-page albums
- Advanced filters (HSL, curves)
- Sharing templates between devices

## 📄 License

MIT — free to use, modify and share.

---

Made with vanilla HTML, CSS & JavaScript. No cookies, no analytics, no tracking.
