/* ============================================================
   COVERLY — app.js
   Initialization, landing→editor view switching, hero mockup,
   sample cards, responsive resizing and PWA registration.
   ============================================================ */
(function (global) {
  'use strict';

  const Canvas = global.Coverly.Canvas;
  const Editor = global.Coverly.Editor;
  const Storage = global.Coverly.Storage;

  let viewLanding, viewEditor;

  function $(id) { return document.getElementById(id); }

  /* ---------------- landing visuals ---------------- */
  function renderLanding() {
    const hero = $('heroCanvas');
    if (hero) {
      Canvas.renderInto(hero, Canvas.sampleState('cinematic-dark'));
    }
    document.querySelectorAll('[data-sample-canvas]').forEach(function (cv) {
      Canvas.renderThumb(cv, cv.dataset.sampleCanvas);
    });
  }

  /* ---------------- editor boot ---------------- */
  function initEditor() {
    const previewCanvas = $('previewCanvas');
    const stage = document.querySelector('.stage-scroll');
    if (!previewCanvas || !stage) return;

    const S = Editor.getState();
    const sizePref = Storage.get('canvasSize') || '1080x1350';
    const parts = sizePref.split('x').map(Number);
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      S.canvas.width = parts[0];
      S.canvas.height = parts[1];
    }

    const templatePref = Storage.get('template');
    Editor.loadTemplate(templatePref || 'cinematic-dark');
    if (!templatePref) {
      const fontPref = Storage.get('font');
      if (fontPref) S.title.font = fontPref;
    }

    Editor.init({ canvas: previewCanvas, stage: stage });

    let resizeRaf = null;
    const onResize = function () {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () {
        resizeRaf = null;
        Editor.onStageResize();
      });
    };
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(onResize);
      ro.observe(stage);
    }
    window.addEventListener('resize', onResize);
  }

  /* ---------------- view switching ---------------- */
  function showEditor() {
    viewLanding.hidden = true;
    viewEditor.hidden = false;
    document.body.classList.add('editor-mode');
    requestAnimationFrame(function () { Editor.onStageResize(); });
  }

  function showLanding() {
    viewEditor.hidden = true;
    viewLanding.hidden = false;
    if (global.Coverly.Controls) global.Coverly.Controls.closeSheet();
  }

  function bindViews() {
    document.querySelectorAll('.js-open-editor').forEach(function (b) {
      b.addEventListener('click', showEditor);
    });
    document.querySelectorAll('.js-back-landing').forEach(function (b) {
      b.addEventListener('click', showLanding);
    });
  }

  function bindSamples() {
    document.querySelectorAll('.js-apply-sample').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.dataset.sample;
        if (!id) return;
        showEditor();
        Editor.applyTemplate(id);
        if (global.Coverly.Controls) {
          global.Coverly.Controls.showToast('Template applied — start editing!');
        }
      });
    });
  }

  /* ---------------- PWA ---------------- */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    const allowed = location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1';
    if (!allowed) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline only */ });
    });
  }

  function init() {
    viewLanding = $('view-landing');
    viewEditor = $('view-editor');
    renderLanding();
    initEditor();
    if (global.Coverly.Controls) global.Coverly.Controls.init();
    bindViews();
    bindSamples();
    registerSW();

    /* Re-render once web fonts finish loading so typography is accurate */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        renderLanding();
        Editor.render();
      }).catch(function () { /* fonts blocked — design still works */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.App = {
    showEditor: showEditor,
    showLanding: showLanding
  };
})(window);
