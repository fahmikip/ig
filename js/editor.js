/* ============================================================
   COVERLY — editor.js
   Editor state, undo/redo history and canvas interactions
   (drag / zoom / rotate / pinch / wheel / text dragging).
   ============================================================ */
(function (global) {
  'use strict';

  const Canvas = global.Coverly.Canvas;
  const T = global.Coverly.Templates;

  const MAX_HISTORY = 60;
  const DEFAULT_TEMPLATE = 'cinematic-dark';

  function defaultText(overrides) {
    return Object.assign({
      text: '', font: 'Space Grotesk', size: 96, weight: 700, letterSpacing: 0,
      lineHeight: 1.1, align: 'left', color: '#ffffff', opacity: 1, case: 'none',
      x: 0.08, y: 0.16
    }, overrides || {});
  }

  const state = {
    templateId: DEFAULT_TEMPLATE,
    canvas: { width: 1080, height: 1350 },
    bgColor: '#0c0c0e',
    image: { img: null, src: null, offsetX: 0, offsetY: 0, scale: 1, rotation: 0 },
    title: defaultText(),
    subtitle: defaultText({ size: 30, weight: 500, letterSpacing: 4, lineHeight: 1.5, opacity: 0.75, x: 0.08, y: 0.3 }),
    overlay: { type: 'dark', opacity: 0.5, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 },
    decor: { doodle: false, film: false, grain: false, accentLine: false, pill: false, pillText: '' },
    activeText: 'title',
    activeTab: 'edit'
  };

  /* ---------------- history ---------------- */
  /* history holds PRE-action snapshots; redoStack holds POST-action
     snapshots captured when undoing. commit() runs BEFORE a mutation. */
  let history = [];
  let redoStack = [];

  function cloneSnapshot() {
    return {
      templateId: state.templateId,
      canvas: Object.assign({}, state.canvas),
      bgColor: state.bgColor,
      image: {
        offsetX: state.image.offsetX, offsetY: state.image.offsetY,
        scale: state.image.scale, rotation: state.image.rotation
      },
      title: Object.assign({}, state.title),
      subtitle: Object.assign({}, state.subtitle),
      overlay: Object.assign({}, state.overlay),
      decor: Object.assign({}, state.decor)
    };
  }

  function applySnapshot(snap) {
    state.templateId = snap.templateId;
    state.canvas = Object.assign({}, snap.canvas);
    state.bgColor = snap.bgColor;
    state.image.offsetX = snap.image.offsetX;
    state.image.offsetY = snap.image.offsetY;
    state.image.scale = snap.image.scale;
    state.image.rotation = snap.image.rotation;
    state.title = Object.assign({}, snap.title);
    state.subtitle = Object.assign({}, snap.subtitle);
    state.overlay = Object.assign({}, snap.overlay);
    state.decor = Object.assign({}, snap.decor);
  }

  /* Push the CURRENT (pre-mutation) state onto history */
  function commit() {
    history.push(cloneSnapshot());
    if (history.length > MAX_HISTORY) history.shift();
    redoStack = [];
    notify('history');
  }

  function canUndo() { return history.length > 0; }
  function canRedo() { return redoStack.length > 0; }

  function undo() {
    if (!canUndo()) return;
    redoStack.push(cloneSnapshot());
    applySnapshot(history.pop());
    fitPreview();
    render();
    notify('sync');
  }

  function redo() {
    if (!canRedo()) return;
    history.push(cloneSnapshot());
    applySnapshot(redoStack.pop());
    fitPreview();
    render();
    notify('sync');
  }

  /* ---------------- preview canvas management ---------------- */
  let previewCanvas = null;
  let stageEl = null;
  let viewZoom = 1;
  let fitK = 0.6;

  function fitPreview() {
    if (!previewCanvas || !stageEl) return;
    const availW = Math.max(220, stageEl.clientWidth - 64);
    const availH = Math.max(220, stageEl.clientHeight - 64);
    const W = state.canvas.width;
    const H = state.canvas.height;
    fitK = Math.min(availW / W, availH / H, 1.15);
    const k = fitK * viewZoom;
    const w = Math.round(W * k);
    const h = Math.round(H * k);
    previewCanvas.width = w;
    previewCanvas.height = h;
    previewCanvas.style.width = w + 'px';
    previewCanvas.style.height = h + 'px';
    currentK = k;
  }

  let currentK = 1;

  function setViewZoom(z) {
    viewZoom = Math.max(0.5, Math.min(2, z));
    fitPreview();
    render();
  }
  function getViewZoom() { return viewZoom; }

  /* ---------------- render ---------------- */
  let rafPending = false;

  function render() {
    if (!previewCanvas) return;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      const ctx = previewCanvas.getContext('2d');
      Canvas.render(ctx, state);
      notify('render');
    });
  }

  /* ---------------- subscriptions ---------------- */
  const listeners = [];
  function subscribe(fn) { listeners.push(fn); }
  function notify(type) {
    for (let i = 0; i < listeners.length; i++) {
      try { listeners[i](type, state); } catch (e) { /* keep editor alive */ }
    }
  }

  /* ---------------- pointer interactions ---------------- */
  const pointers = new Map();
  let drag = null;
  let lastWheelAt = 0;
  let wheelCommitted = false;

  function toUnits(x) { return x / currentK; }

  function hitText(px, py) {
    const pad = 14 / currentK;
    const order = ['title', 'subtitle'];
    for (let i = 0; i < order.length; i++) {
      const m = Canvas.metrics[order[i]];
      if (!m) continue;
      if (px >= m.left - pad && px <= m.left + m.maxLineWidth + pad &&
          py >= m.top - pad && py <= m.bottom + pad) {
        return order[i];
      }
    }
    return null;
  }

  function onPointerDown(e) {
    if (!previewCanvas) return;
    previewCanvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });

    if (pointers.size === 1) {
      const px = toUnits(e.offsetX);
      const py = toUnits(e.offsetY);
      const hit = hitText(px, py);
      if (hit) {
        setActiveText(hit);
        const m = Canvas.metrics[hit];
        drag = {
          mode: 'text',
          layer: state[hit],
          startX: e.offsetX, startY: e.offsetY,
          startCenterX: m.centerX, startCenterY: (m.top + m.bottom) / 2,
          maxW: m.maxLineWidth,
          committed: false
        };
        previewCanvas.classList.add('is-textdragging');
        render();
        return;
      }
      if (state.image.img) {
        drag = {
          mode: 'image',
          startX: e.offsetX, startY: e.offsetY,
          startOffsetX: state.image.offsetX, startOffsetY: state.image.offsetY,
          committed: false
        };
        previewCanvas.classList.add('is-dragging');
      }
    } else if (pointers.size === 2) {
      drag = null;
      const pts = Array.from(pointers.values());
      const d = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      drag = {
        mode: 'pinch',
        dist0: Math.max(d, 1),
        scale0: state.image.scale,
        startOffsetX: state.image.offsetX,
        startOffsetY: state.image.offsetY,
        startCenterX: state.image.offsetX,
        startCenterY: state.image.offsetY,
        committed: false
      };
      previewCanvas.classList.add('is-dragging');
    }
  }

  function onPointerMove(e) {
    if (!drag || !pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });

    if (!drag.committed) {
      commit();
      drag.committed = true;
    }

    if (drag.mode === 'text') {
      const dx = toUnits(e.offsetX - drag.startX);
      const dy = toUnits(e.offsetY - drag.startY);
      const L = drag.layer;
      const W = state.canvas.width;
      const H = state.canvas.height;
      const nc = drag.startCenterX + dx;
      if (L.align === 'left') L.x = (nc - drag.maxW / 2) / W;
      else if (L.align === 'right') L.x = (nc + drag.maxW / 2) / W;
      else L.x = nc / W;
      L.y = (drag.startCenterY + dy) / H;
      L.y = Math.max(0.04, Math.min(0.96, L.y));
      render();
    } else if (drag.mode === 'image') {
      const dx = toUnits(e.offsetX - drag.startX);
      const dy = toUnits(e.offsetY - drag.startY);
      state.image.offsetX = drag.startOffsetX + dx;
      state.image.offsetY = drag.startOffsetY + dy;
      render();
    } else if (drag.mode === 'pinch') {
      const pts = Array.from(pointers.values());
      const d = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      state.image.scale = Math.max(0.5, Math.min(3, drag.scale0 * (d / drag.dist0)));
      render();
    }
  }

  function onPointerUp(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 1) {
      const pts = Array.from(pointers.values());
      drag = {
        mode: 'image',
        startX: pts[0].x, startY: pts[0].y,
        startOffsetX: state.image.offsetX, startOffsetY: state.image.offsetY,
        committed: true
      };
      previewCanvas.classList.remove('is-textdragging');
      previewCanvas.classList.add('is-dragging');
      return;
    }
    if (pointers.size === 0) {
      drag = null;
      previewCanvas.classList.remove('is-dragging', 'is-textdragging');
    }
  }

  function onWheel(e) {
    if (!state.image.img) return;
    const isPinch = e.ctrlKey;
    if (isPinch) {
      e.preventDefault();
      const now = Date.now();
      if (!wheelCommitted || now - lastWheelAt > 450) {
        commit();
        wheelCommitted = true;
      }
      lastWheelAt = now;
      const factor = Math.exp(-e.deltaY * 0.012);
      state.image.scale = Math.max(0.5, Math.min(3, state.image.scale * factor));
      render();
    }
  }

  /* ---------------- actions ---------------- */
  function setActiveText(key) {
    if (key !== 'title' && key !== 'subtitle') return;
    state.activeText = key;
    notify('activeText');
  }
  function getActiveLayer() { return state[state.activeText]; }
  function setActiveTab(tab) { state.activeTab = tab; notify('activeTab'); }
  function getState() { return state; }
  function hasImage() { return !!state.image.img; }

  function applyTemplate(id) {
    commit();
    if (!T.applyTemplateToState(state, id)) {
      history.pop();
      notify('history');
      return;
    }
    render();
    notify('template');
  }

  function loadTemplate(id) {
    /* initial load without history */
    T.applyTemplateToState(state, id || DEFAULT_TEMPLATE);
  }

  function setCanvasSize(w, h) {
    if (state.canvas.width === w && state.canvas.height === h) return;
    commit();
    const oldW = state.canvas.width;
    const oldH = state.canvas.height;
    const s = Math.min(w / oldW, h / oldH);
    state.canvas.width = w;
    state.canvas.height = h;
    state.title.size = Math.round(state.title.size * s);
    state.subtitle.size = Math.round(state.subtitle.size * s);
    state.title.letterSpacing = Math.round(state.title.letterSpacing * s);
    state.subtitle.letterSpacing = Math.round(state.subtitle.letterSpacing * s);
    state.image.offsetX = Math.round(state.image.offsetX * s);
    state.image.offsetY = Math.round(state.image.offsetY * s);
    state.overlay.blur = Math.round(state.overlay.blur * s);
    fitPreview();
    render();
    notify('sync');
  }

  function resetImage() {
    commit();
    state.image.offsetX = 0;
    state.image.offsetY = 0;
    state.image.scale = 1;
    state.image.rotation = 0;
    render();
    notify('sync');
  }

  function resetDesign() {
    commit();
    state.title = defaultText();
    state.subtitle = defaultText({ size: 30, weight: 500, letterSpacing: 4, lineHeight: 1.5, opacity: 0.75, x: 0.08, y: 0.3 });
    state.overlay = { type: 'dark', opacity: 0.5, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 };
    state.decor = { doodle: false, film: false, grain: false, accentLine: false, pill: false, pillText: '' };
    state.image.offsetX = 0;
    state.image.offsetY = 0;
    state.image.scale = 1;
    state.image.rotation = 0;
    state.templateId = DEFAULT_TEMPLATE;
    state.bgColor = '#0c0c0e';
    render();
    notify('sync');
  }

  /* ---------------- init ---------------- */
  function init(opts) {
    previewCanvas = opts.canvas;
    stageEl = opts.stage;
    viewZoom = 1;

    previewCanvas.addEventListener('pointerdown', onPointerDown);
    previewCanvas.addEventListener('pointermove', onPointerMove);
    previewCanvas.addEventListener('pointerup', onPointerUp);
    previewCanvas.addEventListener('pointercancel', onPointerUp);
    previewCanvas.addEventListener('wheel', onWheel, { passive: false });

    history = [];
    redoStack = [];

    fitPreview();
    render();
    notify('sync');
  }

  function onStageResize() {
    fitPreview();
    render();
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Editor = {
    init: init,
    subscribe: subscribe,
    getState: getState,
    hasImage: hasImage,
    commit: commit,
    render: render,
    undo: undo,
    redo: redo,
    canUndo: canUndo,
    canRedo: canRedo,
    applyTemplate: applyTemplate,
    loadTemplate: loadTemplate,
    setCanvasSize: setCanvasSize,
    resetImage: resetImage,
    resetDesign: resetDesign,
    setActiveText: setActiveText,
    getActiveLayer: getActiveLayer,
    setActiveTab: setActiveTab,
    setViewZoom: setViewZoom,
    getViewZoom: getViewZoom,
    onStageResize: onStageResize
  };
})(window);
