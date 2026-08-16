/* ============================================================
   COVERLY — export.js
   Full-resolution render + download. Supports the current canvas
   size and batch export of all Instagram cover sizes.
   ============================================================ */
(function (global) {
  'use strict';

  const Canvas = global.Coverly.Canvas;
  const Editor = global.Coverly.Editor;

  const exp = {
    format: 'png',
    quality: 'standard'
  };

  const SIZES = [
    { w: 1080, h: 1080, label: '1080 × 1080 — Feed' },
    { w: 1080, h: 1350, label: '1080 × 1350 — Portrait' },
    { w: 1080, h: 1920, label: '1080 × 1920 — Story / Reels' }
  ];

  let modal, finalCanvas, expInfo, downloadBtn, downloadLabel, downloadIcon, allBtn;
  let lastEstimate = null;

  function toast(msg, type) {
    if (global.Coverly.Controls && global.Coverly.Controls.showToast) {
      global.Coverly.Controls.showToast(msg, type);
    }
  }

  function cacheEls() {
    if (!modal) {
      modal = document.getElementById('modal-export');
      finalCanvas = document.getElementById('finalPreview');
      expInfo = document.getElementById('expInfo');
      downloadBtn = document.getElementById('expDownloadBtn');
      if (downloadBtn) {
        downloadLabel = downloadBtn.querySelector('.js-label');
        downloadIcon = downloadBtn.querySelector('.icon');
      }
      allBtn = document.getElementById('expAllBtn');
    }
  }

  function qualityFor() {
    if (exp.format === 'png') return null;
    return exp.quality === 'high' ? 0.96 : 0.92;
  }

  function ext() { return exp.format === 'png' ? 'png' : 'jpg'; }
  function mime() { return exp.format === 'png' ? 'image/png' : 'image/jpeg'; }

  /* Build a cloned state scaled to W×H (keeps image reference for rendering) */
  function buildScaledState(W, H) {
    const S = Editor.getState();
    const ratio = W / S.canvas.width;
    function scaleLayer(L) {
      const c = {
        text: L.text, font: L.font, size: Math.round(L.size * ratio),
        weight: L.weight, letterSpacing: Math.round(L.letterSpacing * ratio),
        lineHeight: L.lineHeight, align: L.align, color: L.color, opacity: L.opacity,
        case: L.case, x: L.x, y: L.y,
        gradient: L.gradient ? { colors: L.gradient.colors.slice(), angle: L.gradient.angle } : null,
        shadow: L.shadow ? Object.assign({}, L.shadow) : null,
        outline: L.outline ? Object.assign({}, L.outline) : null
      };
      if (c.shadow) c.shadow.blur = Math.round(c.shadow.blur * ratio);
      if (c.outline) c.outline.width = Math.round(c.outline.width * ratio);
      return c;
    }
    return {
      templateId: S.templateId,
      canvas: { width: W, height: H },
      bgColor: S.bgColor,
      image: {
        img: S.image.img,
        offsetX: S.image.offsetX * ratio,
        offsetY: S.image.offsetY * ratio,
        scale: S.image.scale,
        rotation: S.image.rotation
      },
      title: scaleLayer(S.title),
      subtitle: scaleLayer(S.subtitle),
      overlay: Object.assign({}, S.overlay),
      decor: Object.assign({}, S.decor),
      elements: S.elements.map(function (el) {
        return {
          type: el.type, emoji: el.emoji, shape: el.shape, text: el.text,
          x: el.x, y: el.y, scale: el.scale, rotation: el.rotation,
          color: el.color, opacity: el.opacity
        };
      })
    };
  }

  function fullResCanvas() {
    const S = Editor.getState();
    return renderStateCanvas(S);
  }

  function renderStateCanvas(S) {
    const c = document.createElement('canvas');
    c.width = S.canvas.width;
    c.height = S.canvas.height;
    Canvas.render(c.getContext('2d'), S);
    return c;
  }

  function estimateSize(cb) {
    const S = Editor.getState();
    const tmp = document.createElement('canvas');
    const k = 220 / Math.max(S.canvas.width, S.canvas.height);
    tmp.width = Math.max(2, Math.round(S.canvas.width * k));
    tmp.height = Math.max(2, Math.round(S.canvas.height * k));
    Canvas.render(tmp.getContext('2d'), S);
    tmp.toBlob(function (blob) {
      cb(blob ? blob.size : null);
    }, mime(), qualityFor());
  }

  function renderFinalPreview() {
    const S = Editor.getState();
    const W = S.canvas.width;
    const H = S.canvas.height;
    const k = 360 / W;
    finalCanvas.width = Math.round(W * k);
    finalCanvas.height = Math.round(H * k);
    Canvas.renderInto(finalCanvas, S);
  }

  function updateInfo() {
    const S = Editor.getState();
    const fmt = exp.format.toUpperCase();
    const q = exp.quality === 'high' ? 'High' : 'Standard';
    let sizeText = '…';
    if (lastEstimate) sizeText = formatBytes(lastEstimate);
    expInfo.innerHTML =
      '<strong>' + S.canvas.width + ' × ' + S.canvas.height + 'px</strong>' +
      '<span>Format: ' + fmt + ' · ' + q + ' quality</span>' +
      '<span>Est. file size: ' + sizeText + '</span>';
  }

  function formatBytes(bytes) {
    if (bytes == null) return '…';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function openModal() {
    cacheEls();
    if (!Editor.hasImage()) {
      toast('Please upload an image first.', 'error');
      return;
    }
    renderFinalPreview();
    estimateSize(function (size) {
      lastEstimate = size;
      updateInfo();
    });
    updateInfo();
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    const dialog = modal.querySelector('.modal');
    if (dialog) dialog.focus();
  }

  function setFormat(f) {
    exp.format = f;
    if (modal && !modal.hidden) {
      estimateSize(function (size) { lastEstimate = size; updateInfo(); });
      updateInfo();
    }
  }

  function setQuality(q) {
    exp.quality = q;
    if (modal && !modal.hidden) {
      estimateSize(function (size) { lastEstimate = size; updateInfo(); });
      updateInfo();
    }
  }

  function downloadCanvasBlob(c, filename, cb) {
    c.toBlob(function (blob) {
      if (!blob) { cb(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      cb(true);
    }, mime(), qualityFor());
  }

  function fileBase() {
    const S = Editor.getState();
    return 'coverly-' + S.templateId;
  }

  function setBusy(on) {
    if (!downloadBtn) return;
    if (on) {
      downloadBtn.disabled = true;
      if (downloadLabel) downloadLabel.textContent = 'Preparing your cover…';
      if (downloadIcon) downloadIcon.classList.add('spinner');
    } else {
      downloadBtn.disabled = false;
      if (downloadLabel) downloadLabel.textContent = 'Download current size';
      if (downloadIcon) downloadIcon.classList.remove('spinner');
    }
  }

  function downloadCurrent() {
    cacheEls();
    setBusy(true);
    requestAnimationFrame(function () {
      const c = fullResCanvas();
      downloadCanvasBlob(c, fileBase() + '-' + c.width + 'x' + c.height + '.' + ext(), function (ok) {
        setBusy(false);
        if (!ok) { toast('Export failed. Please try again.', 'error'); return; }
        toast('Cover downloaded');
        closeModal();
      });
    });
  }

  function downloadAll() {
    cacheEls();
    setBusy(true);
    const base = fileBase();
    let i = 0;
    function next() {
      if (i >= SIZES.length) {
        setBusy(false);
        toast('All 3 sizes downloaded');
        closeModal();
        return;
      }
      const s = SIZES[i];
      requestAnimationFrame(function () {
        const scaled = buildScaledState(s.w, s.h);
        const c = renderStateCanvas(scaled);
        downloadCanvasBlob(c, base + '-' + s.w + 'x' + s.h + '.' + ext(), function (ok) {
          i++;
          if (!ok) { toast('Export failed at ' + s.label, 'error'); setBusy(false); return; }
          next();
        });
      });
    }
    next();
  }

  function closeModal() {
    if (modal) {
      modal.hidden = true;
      document.body.classList.remove('no-scroll');
    }
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Export = {
    openModal: openModal,
    closeModal: closeModal,
    setFormat: setFormat,
    setQuality: setQuality,
    download: downloadCurrent,
    downloadCurrent: downloadCurrent,
    downloadAll: downloadAll,
    buildScaledState: buildScaledState,
    SIZES: SIZES,
    getFormat: function () { return exp.format; },
    getQuality: function () { return exp.quality; }
  };
})(window);
