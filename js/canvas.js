/* ============================================================
   COVERLY — canvas.js
   Canvas rendering pipeline. Renders the full design into any
   canvas context (preview scaled or export at full resolution).
   ============================================================ */
(function (global) {
  'use strict';

  const T = global.Coverly.Templates;
  const ACCENT = '#ff4a2e';

  /* Metrics of the last render — used for hit-testing + decorations */
  const metrics = { title: null, subtitle: null };

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

  function fillLine(ctx, text, x, y, ls, align) {
    if (!ls || ls <= 0) { ctx.fillText(text, x, y); return; }
    const chars = Array.from(text);
    if (align === 'left') {
      let cx = x;
      chars.forEach(function (ch) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + ls; });
      return;
    }
    const total = measureWidth(ctx, text, ls);
    let cx = align === 'center' ? x - total / 2 : x - total;
    chars.forEach(function (ch) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + ls; });
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

  /* ---------------- text layer ---------------- */
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

    if (key === 'title' && decor.accentLine) drawAccentLine(ctx, centerX, bottom, maxLineWidth, W);
    if (key === 'title' && decor.pill) drawPill(ctx, centerX, top, decor.pillText, W);

    let y = top + size / 2;
    lines.forEach(function (line) {
      fillLine(ctx, line, L.x * W, y, ls, L.align);
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

  /* ---------------- doodles ---------------- */
  function drawStar(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = rot + i * Math.PI / 5;
      const rad = (i % 2 === 0) ? r : r * 0.45;
      const px = x + Math.cos(ang) * rad;
      const py = y + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawDoodles(ctx, S, W, H) {
    const rnd = mulberry32(7 + (S.templateId || '').length);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const px = W / 1080;
    const sw = Math.max(3, px * 3);
    const t = metrics.title;
    const sb = metrics.subtitle;
    const tl = t ? t.left : W * 0.12;
    const tw = t ? t.maxLineWidth : W * 0.6;
    const tt = t ? t.top : H * 0.4;
    const tb = t ? t.bottom : H * 0.55;

    /* wavy underline under title */
    if (t) {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = sw * 1.6;
      const y = tb + W * 0.035;
      const x0 = t.left;
      const x1 = t.left + tw;
      const n = Math.max(3, Math.round(tw / (W * 0.09)));
      const seg = (x1 - x0) / n;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      for (let i = 1; i <= n; i++) {
        ctx.quadraticCurveTo(x0 + seg * (i - 0.5), y + seg * 0.4 * (i % 2 ? 1 : -1), x0 + seg * i, y);
      }
      ctx.stroke();
    }

    /* star near top-right of title */
    if (t) {
      const sx = Math.min(t.left + tw + W * 0.05, W * 0.9);
      ctx.fillStyle = ACCENT;
      drawStar(ctx, sx, tt - W * 0.01, W * 0.026, rnd() * Math.PI);
      ctx.fill();
      drawStar(ctx, sx - W * 0.02, tt + W * 0.05, W * 0.012, rnd() * Math.PI);
      ctx.fill();
    }

    /* hand-drawn circle overlapping subtitle */
    if (sb) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = sw * 1.1;
      ctx.beginPath();
      const cr = W * 0.045;
      const cxp = Math.max(sb.left - cr * 0.5, W * 0.02);
      const cyp = (sb.top + sb.bottom) / 2;
      ctx.arc(cxp, cyp, cr, 0.3, Math.PI * 1.9);
      ctx.stroke();
    }

    /* arrow sweeping toward title */
    if (t) {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = sw * 1.2;
      const x0 = W * 0.86;
      const y0 = H * 0.18;
      const x2 = Math.min(t.left + tw, W * 0.82);
      const y2 = tb + W * 0.04;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 - W * 0.02, (y0 + y2) / 2, x2, y2);
      ctx.stroke();
      const ang = Math.atan2(y2 - (y0 + y2) / 2, x2 - (x0 - W * 0.02)) + Math.PI;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 + Math.cos(ang - 0.42) * sw * 3, y2 + Math.sin(ang - 0.42) * sw * 3);
      ctx.lineTo(x2 + Math.cos(ang + 0.42) * sw * 3, y2 + Math.sin(ang + 0.42) * sw * 3);
      ctx.closePath();
      ctx.fill();
    }

    /* sparkle near top-left of title */
    if (t) {
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = sw * 0.9;
      const sx = Math.max(t.left - W * 0.04, W * 0.03);
      const sy = tt + W * 0.01;
      ctx.beginPath();
      ctx.moveTo(sx - W * 0.018, sy); ctx.lineTo(sx + W * 0.018, sy);
      ctx.moveTo(sx, sy - W * 0.018); ctx.lineTo(sx, sy + W * 0.018);
      ctx.stroke();
    }

    /* dot trail under subtitle */
    if (sb) {
      ctx.fillStyle = ACCENT;
      for (let i = 0; i < 4; i++) {
        const d = (sb.left + tw * 0.5) + i * W * 0.018;
        const dy = (sb.top + sb.bottom) / 2 + W * 0.05;
        ctx.beginPath();
        ctx.arc(d, dy, W * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /* ---------------- procedural sample photo ---------------- */
  let basePhoto = null;
  function getSamplePhoto() {
    if (basePhoto) return basePhoto;
    basePhoto = document.createElement('canvas');
    const w = 720, h = 900;
    basePhoto.width = w; basePhoto.height = h;
    const ctx = basePhoto.getContext('2d');
    const rnd = mulberry32(99);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1c2333');
    g.addColorStop(0.45, '#4a3f4f');
    g.addColorStop(0.72, '#c96f4a');
    g.addColorStop(1, '#2c2a30');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.fillStyle = '#ffd9a0';
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.55, w * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.55, w * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#241f2b';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.68);
    ctx.quadraticCurveTo(w * 0.22, h * 0.5, w * 0.4, h * 0.66);
    ctx.quadraticCurveTo(w * 0.55, h * 0.78, w * 0.72, h * 0.6);
    ctx.quadraticCurveTo(w * 0.86, h * 0.46, w, h * 0.62);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#17131c';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.82);
    ctx.quadraticCurveTo(w * 0.3, h * 0.68, w * 0.52, h * 0.8);
    ctx.quadraticCurveTo(w * 0.8, h * 0.92, w, h * 0.76);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    for (let i = 0; i < 60; i++) {
      ctx.globalAlpha = 0.15 + rnd() * 0.65;
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fillRect(rnd() * w, rnd() * h * 0.4, 1.5, 1.5);
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    return basePhoto;
  }

  /* ---------------- main render ---------------- */
  function render(ctx, S) {
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

    if (S.decor.doodle) drawDoodles(ctx, S, W, H);
    if (S.decor.grain) drawGrain(ctx, W, H);
  }

  /* Build a full state for a given template (used for thumbs/hero/landing cards) */
  function sampleState(templateId) {
    const tpl = T.getTemplate(templateId) || T.getTemplate('cinematic-dark');
    return {
      templateId: tpl.id,
      canvas: { width: 1080, height: 1350 },
      bgColor: tpl.bg,
      image: { img: getSamplePhoto(), offsetX: 0, offsetY: 0, scale: 1, rotation: 0 },
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
    render(ctx, state);
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
    metrics: metrics
  };
})(window);
