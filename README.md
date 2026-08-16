# Coverly — Instagram Cover Generator

> **Create covers that get noticed.**

Coverly is a fast, modern and premium **Instagram cover generator** that runs entirely in your browser. Upload a photo, pick a template, refine the text and download a crisp PNG or JPG — all locally, no backend, no sign-up, no tracking.

![Coverly](assets/icons/icon-512.png)

---

## ✨ Features

- **12 premium templates** — Cinematic, Travel, Street, Minimal, Editorial, Analog, Quote, Doodle & more, each with its own distinct character.
- **Real-time canvas editor** — drag, zoom, rotate and reposition your photo with mouse, touch or trackpad (including pinch-to-zoom).
- **Full text control** — 7 fonts, size, weight, letter-spacing, line-height, case, color, opacity, alignment and 7 position presets. Drag text anywhere on the canvas.
- **Overlays & effects** — dark/light/gradient overlays, vignette, blur, film frame, film grain, sepia tint and hand-drawn doodles.
- **Smart Title Ideas** — type a theme and get headline ideas generated **locally** (a simple keyword dictionary — no AI, no API).
- **3 canvas sizes** — Portrait 1080×1350, Square 1080×1080, Story 1080×1920, with proportional scaling of your design.
- **Undo / Redo** — up to 60 history states + keyboard shortcuts.
- **Export** — PNG or JPG (0.92 quality), full-resolution, with a final preview and estimated file size.
- **Dark mode** — persisted to localStorage.
- **Mobile-first** — canvas on top, bottom toolbar and bottom sheets on small screens.
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
│   ├── templates.js    # 12 templates + title ideas
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

- More templates & font presets
- Multi-page albums
- Custom brand kits (colors + fonts saved locally)
- Advanced filters (HSL, curves)

## 📄 License

MIT — free to use, modify and share.

---

Made with vanilla HTML, CSS & JavaScript. No cookies, no analytics, no tracking.
