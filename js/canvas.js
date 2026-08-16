/* ============================================================
   COVERLY — canvas.js
   Canvas rendering pipeline. Renders the full design into any
   canvas context (preview scaled or export at full resolution).
   Supports text effects (gradient / shadow / outline), stickers
   & shapes (elements) and procedural sample photos.
   ============================================================ */
(function (global) {
  'use strict';

  const T = global.Coverly.Templates;
  const ACCENT = '#ff4a2e';

  /* Metrics of the last render — used for hit-testing + decorations */
  const metrics = { title: null, subtitle: null, elements: [] };

  /* ---------------- seeded PRNG (deterministic doodles/grain) ---------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- text helpers ---------------- */
  function transformCase(text, mode) {
    if (!text) return '';
    if (mode === 'uppercase') return text.toUpperCase();
    if (mode === 'lowercase') return text.toLowerCase();
    if (mode === 'capitalize') return text.replace(/\b\w/g, function (m) { return m.toUpperCase(); });
    return text;
  }

  function fontString(layer) {
    const style = layer.italic ? 'italic ' : '';
    return style + (layer.weight || 400) + ' ' + layer.size + 'px ' + T.fontStack(layer.font);
  }

  function measureWidth(ctx, text, ls) {
    if (!text) return 0;
    let w = 0;
    for (let i = 0; i < text.length; i++) w += ctx.measureText(text[i]).width;
    if (ls) w += ls * (text.length - 1);
    return w;
  }

  function isCJK(ch) {
    return /[\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(ch);
  }

  function wrapParagraph(ctx, paragraph, maxWidth, ls) {
    const lines = [];
    const hasCJK = Array.from(paragraph).some(isCJK);
    if (hasCJK) {
      let line = '';
      Array.from(paragraph).forEach(function (ch) {
        const test = line + ch;
        if (line && measureWidth(ctx, test, ls) > maxWidth) { lines.push(line); line = ch; }
        else line = test;
      });
      if (line) lines.push(line);
      return lines;
    }
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) return lines;
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = line + ' ' + words[i];
      if (measureWidth(ctx, test, ls) > maxWidth) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawLine(ctx, text, x, y, ls, align, mode) {
    if (!text) return;
    if (!ls || ls <= 0) {
      if (mode === 'stroke') ctx.strokeText(text, x, y); else ctx.fillText(text, x, y);
      return;
    }
    const chars = Array.from(text);
    let total = 0;
    const widths = chars.map(function (ch) { const w = ctx.measureText(ch).width; return w; });
    widths.forEach(function (w) { total += w; });
    total += ls * (chars.length - 1);
    let cx = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total;
    chars.forEach(function (ch, i) {
      if (mode === 'stroke') ctx.strokeText(ch, cx, y); else ctx.fillText(ch, cx, y);
      cx += widths[i] + ls;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /* ---------------- decoration: accent line / pill ---------------- */
  function drawAccentLine(ctx, centerX, bottom, maxLineWidth, W) {
    const w = Math.min(maxLineWidth * 0.85, W * 0.24);
    const y = bottom + W * 0.026;
    const px = W / 1080;
    ctx.save();
    ctx.fillStyle = ACCENT;
    ctx.fillRect(centerX - w / 2, y, w, 8 * px);
    ctx.globalAlpha *= 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - w / 2, y + 14 * px, w * 0.42, 3 * px);
    ctx.restore();
  }

  function drawPill(ctx, centerX, top, text, W) {
    if (!text) return;
    ctx.save();
    const px = W / 1080;
    ctx.font = '600 ' + (22 * px) + 'px ' + T.fontStack('Montserrat');
    const tw = ctx.measureText(text).width;
    const padX = 18 * px, padY = 10 * px;
    const w = tw + padX * 2;
    const h = 38 * px;
    const x = centerX - w / 2;
    const y = top - padY - h - 16 * px;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.5 * px; ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), centerX, y + h / 2 + px);
    ctx.restore();
  }

  /* ---------------- text layer (with effects) ---------------- */
  function buildGradient(ctx, L, left, top, right, bottom) {
    const g = L.gradient;
    if (!g || !g.colors || g.colors.length < 2) return null;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const dx = (right - left) / 2;
    const dy = (bottom - top) / 2;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const a = (g.angle != null ? g.angle : 90) * Math.PI / 180;
    const x0 = cx - Math.cos(a) * len;
    const y0 = cy - Math.sin(a) * len;
    const x1 = cx + Math.cos(a) * len;
    const y1 = cy + Math.sin(a) * len;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    const n = g.colors.length;
    g.colors.forEach(function (c, i) {
      grad.addColorStop(n === 1 ? 0 : i / (n - 1), c);
    });
    return grad;
  }

  function drawTextLayer(ctx, S, W, H, key, decor) {
    const L = S[key];
    metrics[key] = null;
    const text = transformCase(L.text, L.case);
    if (!text) return;

    const maxW = W * 0.82;
    const ls = L.letterSpacing || 0;
    ctx.font = fontString(L);
    ctx.textBaseline = 'middle';
    ctx.textAlign = L.align;

    const lines = [];
    text.split('\n').forEach(function (p) {
      if (measureWidth(ctx, p, ls) <= maxW) { lines.push(p); return; }
      wrapParagraph(ctx, p, maxW, ls).forEach(function (l) { lines.push(l); });
    });
    if (!lines.length) return;

    const size = L.size;
    const lh = L.lineHeight || 1.1;
    const lineH = size * lh;
    const blockH = lineH * (lines.length - 1) + size;

    let maxLineWidth = 0;
    lines.forEach(function (l) {
      const w = measureWidth(ctx, l, ls);
      if (w > maxLineWidth) maxLineWidth = w;
    });

    let left;
    if (L.align === 'left') { left = L.x * W; }
    else if (L.align === 'right') { left = L.x * W - maxLineWidth; }
    else { left = L.x * W - maxLineWidth / 2; }
    const centerX = left + maxLineWidth / 2;
    const top = L.y * H - blockH / 2;
    const bottom = L.y * H + blockH / 2;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, L.opacity != null ? L.opacity : 1));
    ctx.fillStyle = L.color;
    ctx.strokeStyle = L.color;

    const shadow = L.shadow;
    if (shadow && shadow.enabled) {
      ctx.shadowColor = shadow.color || '#000000';
      ctx.shadowBlur = shadow.blur || 0;
      ctx.shadowOffsetX = shadow.offsetX || 0;
      ctx.shadowOffsetY = shadow.offsetY || 0;
    }

    const grad = buildGradient(ctx, L, left, top, left + maxLineWidth, bottom);
    if (grad) ctx.fillStyle = grad;

    if (key === 'title' && decor.accentLine) drawAccentLine(ctx, centerX, bottom, maxLineWidth, W);
    if (key === 'title' && decor.pill) drawPill(ctx, centerX, top, decor.pillText, W);

    const outline = L.outline;
    let y = top + size / 2;
    if (outline && outline.color && outline.width > 0) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = outline.width;
      ctx.strokeStyle = outline.color;
      y = top + size / 2;
      lines.forEach(function (line) {
        drawLine(ctx, line, L.x * W, y, ls, L.align, 'stroke');
        y += lineH;
      });
      y = top + size / 2;
    }
    lines.forEach(function (line) {
      drawLine(ctx, line, L.x * W, y, ls, L.align, 'fill');
      y += lineH;
    });
    ctx.restore();

    metrics[key] = { left: left, centerX: centerX, top: top, bottom: bottom, maxLineWidth: maxLineWidth, size: size };
  }

  /* ---------------- overlays ---------------- */
  function drawTint(ctx, S, W, H) {
    const o = S.overlay;
    if (!o.tint || o.tintAlpha <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = o.tintAlpha;
    ctx.fillStyle = o.tint;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawOverlay(ctx, S, W, H) {
    const o = S.overlay;
    const op = o.opacity != null ? o.opacity : 0;
    if (o.type === 'none' || op <= 0) return;
    ctx.save();
    if (o.type === 'dark') {
      ctx.fillStyle = 'rgba(0,0,0,' + op + ')';
      ctx.fillRect(0, 0, W, H);
    } else if (o.type === 'light') {
      ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
      ctx.fillRect(0, 0, W, H);
    } else if (o.type === 'gradient') {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,' + (op * 0.7) + ')');
      g.addColorStop(0.45, 'rgba(0,0,0,' + (op * 0.12) + ')');
      g.addColorStop(1, 'rgba(0,0,0,' + (op * 0.9) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  function drawVignette(ctx, W, H, intensity) {
    if (!intensity) return;
    ctx.save();
    const g = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.4,
      W / 2, H / 2, Math.max(W, H) * 0.74
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,' + (intensity * 0.95) + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawFilmFrame(ctx, W, H) {
    ctx.save();
    const px = W / 1080;
    const bar = Math.round(H * 0.085);
    ctx.fillStyle = 'rgba(0,0,0,0.93)';
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(1, px);
    ctx.strokeRect(W * 0.035, H * 0.035, W * 0.93, H * 0.93);
    ctx.restore();
  }

  let grainCanvas = null;
  function getGrain() {
    if (grainCanvas) return grainCanvas;
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = 256; grainCanvas.height = 256;
    const g = grainCanvas.getContext('2d');
    const img = g.createImageData(256, 256);
    const rnd = mulberry32(2026);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (rnd() * 255) | 0;
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
      img.data[i + 3] = (rnd() * 20) | 0;
    }
    g.putImageData(img, 0, 0);
    return grainCanvas;
  }

  function drawGrain(ctx, W, H) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---------------- elements (stickers / shapes / badges) ---------------- */
  function starPath(ctx, cx, cy, r, points, rot) {
    ctx.beginPath();
    const n = points * 2;
    for (let i = 0; i < n; i++) {
      const ang = rot + i * Math.PI / points;
      const rad = (i % 2 === 0) ? r : r * 0.45;
      const px = cx + Math.cos(ang) * rad;
      const py = cy + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawShape(ctx, el, W, H, R) {
    const x = el.x * W, y = el.y * H;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((el.rotation || 0) * Math.PI / 180);
    ctx.fillStyle = el.color;
    ctx.strokeStyle = el.color;
    ctx.globalAlpha = el.opacity != null ? el.opacity : 1;
    ctx.lineWidth = Math.max(2, R * 0.16);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    switch (el.shape) {
      case 'circle':
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
        break;
      case 'oval':
        ctx.beginPath(); ctx.ellipse(0, 0, R * 1.35, R * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'star':
        starPath(ctx, 0, 0, R, 5, 0); ctx.fill();
        break;
      case 'arrow': {
        const s = R;
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.55);
        ctx.lineTo(s * 0.55, -s * 0.55);
        ctx.lineTo(s * 0.55, -s);
        ctx.lineTo(s * 1.45, 0);
        ctx.lineTo(s * 0.55, s);
        ctx.lineTo(s * 0.55, s * 0.55);
        ctx.lineTo(-s, s * 0.55);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'frame': {
        const fw = R * 2, fh = R * 1.25;
        roundRect(ctx, -fw / 2, -fh / 2, fw, fh, R * 0.3);
        ctx.lineWidth = Math.max(3, R * 0.14);
        ctx.stroke();
        break;
      }
      case 'zigzag': {
        const w = R * 2.4;
        const n = 6;
        const seg = w / n;
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        for (let i = 1; i <= n; i++) {
          ctx.lineTo(-w / 2 + seg * i, (i % 2 ? -1 : 1) * R * 0.5);
        }
        ctx.lineWidth = Math.max(3, R * 0.16);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  function drawEmoji(ctx, el, W, H, fs) {
    const x = el.x * W, y = el.y * H;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((el.rotation || 0) * Math.PI / 180);
    ctx.globalAlpha = el.opacity != null ? el.opacity : 1;
    ctx.font = fs + 'px "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.emoji, 0, 0);
    ctx.restore();
  }

  function drawBadge(ctx, el, W, H) {
    const x = el.x * W, y = el.y * H;
    const fh = W * 0.052 * el.scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((el.rotation || 0) * Math.PI / 180);
    ctx.globalAlpha = el.opacity != null ? el.opacity : 1;
    ctx.font = '700 ' + fh + 'px ' + T.fontStack('Montserrat');
    const tw = ctx.measureText(el.text).width;
    const padX = fh * 0.75;
    const w = tw + padX * 2;
    const h = fh * 1.85;
    ctx.fillStyle = el.color;
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.text, 0, 0);
    ctx.restore();
  }

  /* Returns logical bounds {x,y,w,h} for an element (used for hit-testing) */
  function elementBounds(el, W, H) {
    const cx = el.x * W, cy = el.y * H;
    let w, h;
    if (el.type === 'emoji') {
      const fs = W * 0.16 * el.scale;
      w = fs * 0.95; h = fs;
    } else if (el.type === 'badge') {
      const fh = W * 0.052 * el.scale;
      const tw = fh * 3.4;
      const padX = fh * 0.75;
      w = tw + padX * 2; h = fh * 1.85;
    } else {
      const R = W * 0.075 * el.scale;
      if (el.shape === 'oval') { w = R * 1.35 * 2; h = R * 0.7 * 2; }
      else if (el.shape === 'arrow') { w = R * 2.45; h = R * 2; }
      else if (el.shape === 'frame') { w = R * 2; h = R * 1.25; }
      else if (el.shape === 'zigzag') { w = R * 2.4; h = R; }
      else { w = R * 2; h = R * 2; }
    }
    return { cx: cx, cy: cy, w: w, h: h, rotation: (el.rotation || 0) * Math.PI / 180 };
  }

  function drawElements(ctx, S, W, H) {
    metrics.elements = [];
    if (!S.elements || !S.elements.length) return;
    S.elements.forEach(function (el) {
      if (el.type === 'emoji') {
        const fs = W * 0.16 * el.scale;
        drawEmoji(ctx, el, W, H, fs);
      } else if (el.type === 'badge') {
        drawBadge(ctx, el, W, H);
      } else if (el.type === 'shape') {
        const R = W * 0.075 * el.scale;
        drawShape(ctx, el, W, H, R);
      }
      metrics.elements.push(elementBounds(el, W, H));
    });
  }

  /* Draw dashed selection outline + handles around the active element */
  function drawSelection(ctx, S, W, H) {
    const i = S.activeElement;
    if (i == null || i < 0 || !metrics.elements[i]) return;
    const b = metrics.elements[i];
    const px = W / 1080;
    ctx.save();
    ctx.translate(b.cx, b.cy);
    ctx.rotate(b.rotation);
    ctx.setLineDash([8 * px, 6 * px]);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * px;
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.setLineDash([]);
    const hs = 9 * px;
    ctx.fillStyle = ACCENT;
    [[-b.w / 2, -b.h / 2], [b.w / 2, -b.h / 2], [-b.w / 2, b.h / 2], [b.w / 2, b.h / 2]].forEach(function (p) {
      ctx.fillRect(p[0] - hs / 2, p[1] - hs / 2, hs, hs);
    });
    ctx.restore();
  }

  /* Hit-test a point (logical coords) against all elements; returns index or -1 */
  function elementHitTest(S, W, H, px, py) {
    if (!S.elements) return -1;
    for (let i = S.elements.length - 1; i >= 0; i--) {
      const b = elementBounds(S.elements[i], W, H);
      const dx = px - b.cx;
      const dy = py - b.cy;
      const c = Math.cos(-b.rotation);
      const s = Math.sin(-b.rotation);
      const lx = dx * c - dy * s;
      const ly = dx * s + dy * c;
      if (Math.abs(lx) <= b.w / 2 && Math.abs(ly) <= b.h / 2) return i;
    }
    return -1;
  }

  /* ---------------- procedural sample photos (3 variants) ---------------- */
  const photoCache = [];

  function makePhoto(seed, palette) {
    const c = document.createElement('canvas');
    const w = 720, h = 900;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const rnd = mulberry32(seed);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    palette.sky.forEach(function (st) { g.addColorStop(st[0], st[1]); });
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const sunX = w * palette.sunX;
    const sunY = h * palette.sunY;
    ctx.save();
    ctx.fillStyle = palette.sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, w * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(sunX, sunY, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* back ridge */
    ctx.fillStyle = palette.ridge1;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.62);
    ctx.quadraticCurveTo(w * 0.22, h * 0.44, w * 0.42, h * 0.6);
    ctx.quadraticCurveTo(w * 0.58, h * 0.74, w * 0.76, h * 0.55);
    ctx.quadraticCurveTo(w * 0.9, h * 0.4, w, h * 0.57);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    /* front ridge */
    ctx.fillStyle = palette.ridge2;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.8);
    ctx.quadraticCurveTo(w * 0.3, h * 0.62, w * 0.55, h * 0.78);
    ctx.quadraticCurveTo(w * 0.82, h * 0.92, w, h * 0.72);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    if (palette.stars) {
      ctx.save();
      for (let i = 0; i < 60; i++) {
        ctx.globalAlpha = 0.15 + rnd() * 0.65;
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillRect(rnd() * w, rnd() * h * 0.4, 1.5, 1.5);
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    return c;
  }

  function getSamplePhoto(index) {
    const i = Math.max(0, Math.min(2, index || 0));
    if (photoCache[i]) return photoCache[i];
    const PALETTES = [
      {
        sky: [[0, '#1c2333'], [0.45, '#4a3f4f'], [0.72, '#c96f4a'], [1, '#2c2a30']],
        sunX: 0.62, sunY: 0.55, sun: '#ffd9a0', ridge1: '#241f2b', ridge2: '#17131c', stars: true
      },
      {
        sky: [[0, '#0f2027'], [0.5, '#203a43'], [0.8, '#2c5364'], [1, '#101820']],
        sunX: 0.3, sunY: 0.4, sun: '#eef7ff', ridge1: '#1b2b33', ridge2: '#0e161b', stars: true
      },
      {
        sky: [[0, '#f7d794'], [0.45, '#f5cd79'], [0.75, '#e15f41'], [1, '#c44569']],
        sunX: 0.72, sunY: 0.68, sun: '#ffe8c2', ridge1: '#b64c3a', ridge2: '#7a2f28', stars: false
      }
    ];
    photoCache[i] = makePhoto(99 + i * 17, PALETTES[i]);
    return photoCache[i];
  }

  /* ---------------- main render ---------------- */
  function render(ctx, S, opts) {
    const o = opts || {};
    const W = S.canvas.width;
    const H = S.canvas.height;
    const k = ctx.canvas.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = S.bgColor || '#101012';
    ctx.fillRect(0, 0, W, H);

    const img = S.image && S.image.img;
    if (img) {
      ctx.save();
      if (S.overlay.blur > 0) ctx.filter = 'blur(' + S.overlay.blur + 'px)';
      const s0 = Math.max(W / img.width, H / img.height);
      const sc = s0 * (S.image.scale || 1);
      ctx.translate(W / 2 + (S.image.offsetX || 0), H / 2 + (S.image.offsetY || 0));
      ctx.rotate((S.image.rotation || 0) * Math.PI / 180);
      ctx.scale(sc, sc);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    }

    drawTint(ctx, S, W, H);
    drawOverlay(ctx, S, W, H);
    if (S.overlay.vignette > 0) drawVignette(ctx, W, H, S.overlay.vignette);
    if (S.decor.film) drawFilmFrame(ctx, W, H);

    drawTextLayer(ctx, S, W, H, 'title', S.decor);
    drawTextLayer(ctx, S, W, H, 'subtitle', S.decor);
    drawElements(ctx, S, W, H);

    if (o.selection) drawSelection(ctx, S, W, H);

    if (S.decor.grain) drawGrain(ctx, W, H);
  }

  /* Build a full state for a given template (used for thumbs/hero/landing cards) */
  function sampleState(templateId) {
    const tpl = T.getTemplate(templateId) || T.getTemplate('cinematic-dark');
    return {
      templateId: tpl.id,
      canvas: { width: 1080, height: 1350 },
      bgColor: tpl.bg,
      image: { img: getSamplePhoto(0), offsetX: 0, offsetY: 0, scale: 1, rotation: 0 },
      title: JSON.parse(JSON.stringify(tpl.title)),
      subtitle: JSON.parse(JSON.stringify(tpl.subtitle)),
      overlay: JSON.parse(JSON.stringify(tpl.overlay)),
      decor: JSON.parse(JSON.stringify(tpl.decor))
    };
  }

  /* Render a state into a canvas scaled to fit the canvas element (same aspect) */
  function renderInto(canvas, state) {
    const W = state.canvas.width;
    const k = canvas.width / W;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(k, 0, 0, k, 0, 0);
    render(ctx, state, { selection: true });
  }

  function renderThumb(canvas, templateId) {
    renderInto(canvas, sampleState(templateId));
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Canvas = {
    ACCENT: ACCENT,
    render: render,
    renderInto: renderInto,
    renderThumb: renderThumb,
    sampleState: sampleState,
    getSamplePhoto: getSamplePhoto,
    elementHitTest: elementHitTest,
    metrics: metrics
  };
})(window);
