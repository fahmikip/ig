/* ============================================================
   COVERLY — controls.js
   Binds every UI control: topbar, panels, templates, modals,
   toasts, keyboard shortcuts and the mobile bottom sheet.
   ============================================================ */
(function (global) {
  'use strict';

  const T = global.Coverly.Templates;
  const Canvas = global.Coverly.Canvas;
  const Editor = global.Coverly.Editor;
  const Export = global.Coverly.Export;
  const Storage = global.Coverly.Storage;

  const els = {};
  let fileInfo = null;

  function $(id) { return document.getElementById(id); }
  function isMobile() { return window.innerWidth < 1024; }
  function S() { return Editor.getState(); }

  /* ---------------- toasts ---------------- */
  function showToast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    el.setAttribute('role', 'status');
    el.textContent = msg;
    els.toasts.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 230);
    }, 2600);
  }

  /* ---------------- generic binding helpers ---------------- */
  /* continuous input (typing, color picker): commit once at gesture start */
  function commitOnce(el) {
    if (el.dataset.c) return;
    el.dataset.c = '1';
    Editor.commit();
  }
  function endCommit(el) { el.dataset.c = ''; }

  /* range input: commit once at gesture start, apply continuously */
  function bindRange(el, apply) {
    el.addEventListener('pointerdown', function () { Editor.commit(); }, { passive: true });
    el.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(e.key) !== -1) {
        Editor.commit();
      }
    });
    el.addEventListener('input', function () {
      apply(parseFloat(el.value));
      Editor.render();
    });
  }

  function bindSelect(el, apply) {
    el.addEventListener('change', function () {
      Editor.commit();
      apply(el.value);
      Editor.render();
    });
  }

  function bindSegGroup(container, onPick) {
    const btns = container.querySelectorAll('.seg-btn');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        onPick(b);
      });
    });
  }

  /* ---------------- theme ---------------- */
  function applyTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', dark ? '#0e0e0e' : '#f6f6f3');
  }
  function toggleTheme() {
    const dark = document.documentElement.dataset.theme !== 'dark';
    applyTheme(dark);
    Storage.set('darkMode', dark);
  }
  function bindTheme() {
    document.querySelectorAll('.js-dark-toggle').forEach(function (b) {
      b.addEventListener('click', toggleTheme);
    });
  }

  /* ---------------- tabs / mobile tools / sheet ---------------- */
  function selectTab(tab) {
    if (tab === 'templates') {
      if (isMobile()) {
        Editor.setActiveTab('templates');
        openSheet('templates');
      } else {
        const tabBtn = els.topTabs.querySelector('[data-tab="templates"]');
        if (tabBtn) {
          tabBtn.classList.add('is-highlight');
          setTimeout(function () { tabBtn.classList.remove('is-highlight'); }, 1300);
        }
        els.panelTemplates.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }
    Editor.setActiveTab(tab);
    if (isMobile()) openSheet(tab);
  }

  function openSheet(name) {
    if (name === 'templates') {
      els.sheetBody.appendChild(els.panelTemplates);
      els.sheetTitle.textContent = 'Templates';
    } else {
      if (els.panelTemplates.parentNode === els.sheetBody) {
        els.sidebarLeft.appendChild(els.panelTemplates);
      }
      els.sheetTitle.textContent = name === 'edit' ? 'Image' : name === 'text' ? 'Text' : 'Adjust';
    }
    els.sheet.dataset.open = 'true';
  }

  function closeSheet() {
    els.sheet.dataset.open = 'false';
    if (els.panelTemplates.parentNode === els.sheetBody) {
      els.sidebarLeft.appendChild(els.panelTemplates);
    }
  }

  function onMobileTool(tool) {
    if (tool === 'export') { Export.openModal(); return; }
    Editor.setActiveTab(tool);
    openSheet(tool);
  }

  function syncTab() {
    const tab = S().activeTab;
    els.topTabs.querySelectorAll('.tb-tab').forEach(function (b) {
      const on = b.dataset.tab === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    els.mTools.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.mtool === tab);
    });
    if (!isMobile()) {
      ['edit', 'text', 'adjust'].forEach(function (p) {
        const el = $('panel-' + p);
        if (el) el.classList.toggle('is-visible', p === tab);
      });
    }
  }

  /* ---------------- upload ---------------- */
  function isEditorVisible() { return !$('view-editor').hidden; }

  function downscale(img, maxDim) {
    const k = Math.min(1, maxDim / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function handleFile(file) {
    const okType = /^image\/(jpeg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!okType) { showToast('Please select a valid image file.', 'error'); return; }
    if (file.size > 20 * 1024 * 1024) {
      showToast('Large image detected — resizing for performance.');
    }
    const reader = new FileReader();
    reader.onerror = function () { showToast('Could not read that file.', 'error'); };
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        let finalImg = img;
        if (img.width > 2800 || img.height > 2800) {
          finalImg = downscale(img, 2800);
        }
        Editor.commit();
        const st = S();
        st.image.img = finalImg;
        st.image.src = reader.result;
        st.image.offsetX = 0;
        st.image.offsetY = 0;
        st.image.scale = 1;
        st.image.rotation = 0;
        fileInfo = { name: file.name, size: file.size };
        Editor.render();
        syncEmpty();
        updateImgStatus();
        showToast('Photo uploaded');
        if (!isEditorVisible() && global.Coverly.App) global.Coverly.App.showEditor();
      };
      img.onerror = function () { showToast('Could not load that image.', 'error'); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function updateImgStatus() {
    if (!fileInfo) return;
    const kb = (fileInfo.size / 1024).toFixed(0);
    els.imgStatus.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg> Loaded: ' +
      fileInfo.name + ' (' + kb + ' KB) — stored locally';
  }

  function bindUpload() {
    els.dropzone.addEventListener('click', function () { els.fileInput.click(); });
    els.emptyUploadBtn.addEventListener('click', function () { els.fileInput.click(); });
    els.editUploadBtn.addEventListener('click', function () { els.fileInput.click(); });

    els.fileInput.addEventListener('change', function () {
      if (els.fileInput.files[0]) handleFile(els.fileInput.files[0]);
      els.fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      els.dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        els.dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      els.dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        els.dropzone.classList.remove('is-dragover');
      });
    });
    els.dropzone.addEventListener('drop', function (e) {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });

    window.addEventListener('paste', function (e) {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') === 0) {
          const f = items[i].getAsFile();
          if (f) { handleFile(f); break; }
        }
      }
    });
  }

  /* ---------------- templates ---------------- */
  function renderTemplateGrid(cat) {
    els.templateGrid.innerHTML = '';
    const list = T.TEMPLATES.filter(function (t) { return cat === 'all' || t.category === cat; });
    const frag = document.createDocumentFragment();
    list.forEach(function (t) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tpl-item';
      btn.dataset.tpl = t.id;
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', 'Apply ' + t.name + ' template');
      const cv = document.createElement('canvas');
      cv.width = 120; cv.height = 150;
      Canvas.renderThumb(cv, t.id);
      const label = document.createElement('span');
      label.className = 'tpl-label';
      label.textContent = t.name;
      btn.appendChild(cv);
      btn.appendChild(label);
      btn.addEventListener('click', function () {
        Editor.applyTemplate(t.id);
        showToast('Template applied');
        syncTemplates();
      });
      frag.appendChild(btn);
    });
    els.templateGrid.appendChild(frag);
    syncTemplates();
  }

  function syncTemplates() {
    const cur = S().templateId;
    els.templateGrid.querySelectorAll('.tpl-item').forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.tpl === cur);
    });
  }

  function bindTemplates() {
    els.templateCats.querySelectorAll('.tpl-cat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        els.templateCats.querySelectorAll('.tpl-cat').forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        renderTemplateGrid(btn.dataset.cat);
        Storage.set('lastCat', btn.dataset.cat);
      });
    });
    renderTemplateGrid(Storage.get('lastCat') || 'all');
  }

  /* ---------------- stage (canvas size + view zoom) ---------------- */
  function syncSize() {
    const c = S().canvas;
    els.canvasSizeSelect.value = c.width + 'x' + c.height;
  }
  function syncZoomLabel() {
    const z = Editor.getViewZoom();
    els.zoomPct.textContent = Math.abs(z - 1) < 0.02 ? 'Fit' : Math.round(z * 100) + '%';
  }
  function bindStage() {
    els.canvasSizeSelect.addEventListener('change', function () {
      const parts = els.canvasSizeSelect.value.split('x').map(Number);
      Editor.setCanvasSize(parts[0], parts[1]);
      Storage.set('canvasSize', els.canvasSizeSelect.value);
    });
    els.zoomOutBtn.addEventListener('click', function () {
      Editor.setViewZoom(Editor.getViewZoom() * 0.85);
      syncZoomLabel();
    });
    els.zoomInBtn.addEventListener('click', function () {
      Editor.setViewZoom(Editor.getViewZoom() * 1.18);
      syncZoomLabel();
    });
  }

  /* ---------------- image panel ---------------- */
  function bindImagePanel() {
    bindRange(els.zoomRange, function (v) {
      S().image.scale = v / 100;
      els.zoomVal.textContent = v + '%';
    });
    bindRange(els.rotRange, function (v) {
      S().image.rotation = v;
      els.rotVal.textContent = v + '\u00b0';
    });
    els.zoomMinusBtn.addEventListener('click', function () {
      Editor.commit();
      S().image.scale = Math.max(0.5, Math.round((S().image.scale - 0.1) * 100) / 100);
      els.zoomRange.value = Math.round(S().image.scale * 100);
      els.zoomVal.textContent = els.zoomRange.value + '%';
      Editor.render();
    });
    els.zoomPlusBtn.addEventListener('click', function () {
      Editor.commit();
      S().image.scale = Math.min(3, Math.round((S().image.scale + 0.1) * 100) / 100);
      els.zoomRange.value = Math.round(S().image.scale * 100);
      els.zoomVal.textContent = els.zoomRange.value + '%';
      Editor.render();
    });
    els.rotMinusBtn.addEventListener('click', function () {
      Editor.commit();
      S().image.rotation = Math.max(-45, Math.round(S().image.rotation) - 5);
      els.rotRange.value = S().image.rotation;
      els.rotVal.textContent = S().image.rotation + '\u00b0';
      Editor.render();
    });
    els.rotPlusBtn.addEventListener('click', function () {
      Editor.commit();
      S().image.rotation = Math.min(45, Math.round(S().image.rotation) + 5);
      els.rotRange.value = S().image.rotation;
      els.rotVal.textContent = S().image.rotation + '\u00b0';
      Editor.render();
    });
    els.resetImgBtn.addEventListener('click', function () { Editor.resetImage(); });
  }

  function syncImage() {
    const im = S().image;
    els.zoomRange.value = Math.round(im.scale * 100);
    els.zoomVal.textContent = els.zoomRange.value + '%';
    els.rotRange.value = Math.round(im.rotation);
    els.rotVal.textContent = els.rotRange.value + '\u00b0';
  }

  /* ---------------- text panel ---------------- */
  function bindTextInput(el, key) {
    el.addEventListener('input', function () {
      commitOnce(el);
      S()[key].text = el.value;
      Editor.render();
    });
    el.addEventListener('blur', function () { endCommit(el); });
  }

  function templateDefaultColor(key) {
    const tpl = T.getTemplate(S().templateId);
    return (tpl && tpl[key]) ? tpl[key].color : '#ffffff';
  }

  function generateIdeas() {
    const input = els.ideasInput.value.trim();
    if (!input) { showToast('Type a theme first — e.g. "jalan pulang sore hari"'); return; }
    const list = T.generateTitleIdeas(input);
    els.ideasList.innerHTML = '';
    if (!list.length) { showToast('No ideas for that theme — try another word.'); return; }
    list.forEach(function (idea) {
      const li = document.createElement('li');
      li.textContent = idea;
      const apply = document.createElement('button');
      apply.type = 'button';
      apply.setAttribute('aria-label', 'Apply title: ' + idea);
      apply.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>';
      apply.addEventListener('click', function () {
        Editor.commit();
        S().title.text = idea;
        els.titleInput.value = idea;
        Editor.render();
        syncText();
        showToast('Title applied');
      });
      li.appendChild(apply);
      els.ideasList.appendChild(li);
    });
  }

  function bindTextPanel() {
    bindTextInput(els.titleInput, 'title');
    bindTextInput(els.subtitleInput, 'subtitle');

    els.textLayerBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        Editor.setActiveText(b.dataset.textlayer);
        syncText();
      });
    });

    bindSelect(els.fontSelect, function (v) {
      S()[S().activeText].font = v;
      Storage.set('font', v);
    });
    bindRange(els.sizeRange, function (v) {
      S()[S().activeText].size = v;
      els.sizeVal.textContent = v;
    });
    bindSelect(els.weightSelect, function (v) {
      S()[S().activeText].weight = parseInt(v, 10);
    });
    bindRange(els.lsRange, function (v) {
      S()[S().activeText].letterSpacing = v;
      els.lsVal.textContent = v;
    });
    bindRange(els.lhRange, function (v) {
      S()[S().activeText].lineHeight = v;
      els.lhVal.textContent = parseFloat(v);
    });
    bindSelect(els.caseSelect, function (v) {
      S()[S().activeText].case = v;
    });
    bindSegGroup(els.alignSeg, function (btn) {
      Editor.commit();
      S()[S().activeText].align = btn.dataset.align;
      Editor.render();
      syncText();
    });
    els.colorInput.addEventListener('input', function () {
      commitOnce(els.colorInput);
      S()[S().activeText].color = els.colorInput.value;
      Editor.render();
    });
    els.colorInput.addEventListener('change', function () { endCommit(els.colorInput); });
    els.colorResetBtn.addEventListener('click', function () {
      Editor.commit();
      S()[S().activeText].color = templateDefaultColor(S().activeText);
      els.colorInput.value = S()[S().activeText].color;
      Editor.render();
      syncText();
    });
    bindRange(els.opacityRange, function (v) {
      S()[S().activeText].opacity = v / 100;
      els.opacityVal.textContent = v + '%';
    });

    els.posBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        Editor.commit();
        const p = T.POSITIONS[b.dataset.pos];
        const L = S()[S().activeText];
        L.x = p.x; L.y = p.y; L.align = p.align;
        Editor.render();
        syncText();
      });
    });

    els.ideasBtn.addEventListener('click', generateIdeas);
    els.ideasInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); generateIdeas(); }
    });
  }

  function syncText() {
    const st = S();
    const L = Editor.getActiveLayer();
    const active = document.activeElement;
    if (els.titleInput !== active) els.titleInput.value = st.title.text;
    if (els.subtitleInput !== active) els.subtitleInput.value = st.subtitle.text;

    els.textLayerBtns.forEach(function (b) {
      const on = b.dataset.textlayer === st.activeText;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    els.fontSelect.value = L.font;
    els.sizeRange.value = L.size;
    els.sizeVal.textContent = L.size;
    els.weightSelect.value = String(L.weight);
    els.lsRange.value = L.letterSpacing;
    els.lsVal.textContent = L.letterSpacing;
    els.lhRange.value = L.lineHeight;
    els.lhVal.textContent = parseFloat(L.lineHeight.toFixed(2));
    els.caseSelect.value = L.case;
    els.alignSeg.querySelectorAll('.seg-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.align === L.align);
    });
    els.colorInput.value = L.color;
    els.opacityRange.value = Math.round(L.opacity * 100);
    els.opacityVal.textContent = els.opacityRange.value + '%';

    els.posBtns.forEach(function (b) { b.classList.remove('is-active'); });
    Object.keys(T.POSITIONS).forEach(function (k) {
      const p = T.POSITIONS[k];
      if (p.x === L.x && p.y === L.y && p.align === L.align) {
        const btn = els.posGrid.querySelector('[data-pos="' + k + '"]');
        if (btn) btn.classList.add('is-active');
      }
    });
  }

  /* ---------------- adjust panel ---------------- */
  function bindAdjustPanel() {
    bindSegGroup(els.ovSeg, function (btn) {
      Editor.commit();
      S().overlay.type = btn.dataset.ovtype;
      Editor.render();
      syncAdjust();
    });
    bindRange(els.ovRange, function (v) {
      S().overlay.opacity = v / 100;
      els.ovVal.textContent = v + '%';
    });
    bindRange(els.vigRange, function (v) {
      S().overlay.vignette = v / 100;
      els.vigVal.textContent = v + '%';
    });
    bindRange(els.blurRange, function (v) {
      S().overlay.blur = v;
      els.blurVal.textContent = v + 'px';
    });

    function bindToggle(btn, key) {
      btn.addEventListener('click', function () {
        Editor.commit();
        const on = btn.getAttribute('aria-checked') !== 'true';
        btn.setAttribute('aria-checked', String(on));
        S().decor[key] = on;
        Editor.render();
      });
    }
    bindToggle(els.doodleToggle, 'doodle');
    bindToggle(els.filmToggle, 'film');
    bindToggle(els.grainToggle, 'grain');
  }

  function syncAdjust() {
    const o = S().overlay;
    els.ovSeg.querySelectorAll('.seg-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.ovtype === o.type);
    });
    els.ovRange.value = Math.round(o.opacity * 100);
    els.ovVal.textContent = els.ovRange.value + '%';
    els.vigRange.value = Math.round(o.vignette * 100);
    els.vigVal.textContent = els.vigRange.value + '%';
    els.blurRange.value = Math.round(o.blur);
    els.blurVal.textContent = els.blurRange.value + 'px';
    els.doodleToggle.setAttribute('aria-checked', String(!!S().decor.doodle));
    els.filmToggle.setAttribute('aria-checked', String(!!S().decor.film));
    els.grainToggle.setAttribute('aria-checked', String(!!S().decor.grain));
  }

  /* ---------------- empty state ---------------- */
  function syncEmpty() {
    const has = Editor.hasImage();
    if (els.canvasEmpty.hidden !== has) {
      els.canvasEmpty.hidden = has;
    }
  }

  /* ---------------- history buttons ---------------- */
  function syncHistory() {
    els.undoBtn.disabled = !Editor.canUndo();
    els.redoBtn.disabled = !Editor.canRedo();
  }

  /* ---------------- modals ---------------- */
  function openModalEl(bp) {
    bp.hidden = false;
    document.body.classList.add('no-scroll');
    const d = bp.querySelector('.modal');
    if (d) d.focus();
  }
  function closeModalEl(bp) {
    bp.hidden = true;
    if (!document.querySelector('.modal-backdrop:not([hidden])')) {
      document.body.classList.remove('no-scroll');
    }
  }

  function bindModals() {
    document.querySelectorAll('.js-modal-close').forEach(function (b) {
      b.addEventListener('click', function () {
        const bp = b.closest('.modal-backdrop');
        if (bp) closeModalEl(bp);
      });
    });
    document.querySelectorAll('.modal-backdrop').forEach(function (bp) {
      bp.addEventListener('click', function (e) {
        if (e.target === bp) closeModalEl(bp);
      });
    });

    document.querySelectorAll('#modal-export [data-format]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#modal-export [data-format]').forEach(function (x) {
          x.classList.toggle('is-active', x === b);
        });
        Export.setFormat(b.dataset.format);
      });
    });
    document.querySelectorAll('#modal-export [data-quality]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#modal-export [data-quality]').forEach(function (x) {
          x.classList.toggle('is-active', x === b);
        });
        Export.setQuality(b.dataset.quality);
      });
    });
    els.expDownloadBtn.addEventListener('click', function () { Export.download(); });

    document.querySelectorAll('.js-open-shortcuts').forEach(function (b) {
      b.addEventListener('click', function () { openModalEl($('modal-shortcuts')); });
    });
    document.querySelectorAll('.js-open-about').forEach(function (b) {
      b.addEventListener('click', function () { openModalEl($('modal-about')); });
    });
  }

  /* ---------------- keyboard shortcuts ---------------- */
  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      const tag = document.activeElement ? document.activeElement.tagName : '';
      const isTyping = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);

      if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); Editor.undo(); return; }
      if (mod && k === 'z' && e.shiftKey) { e.preventDefault(); Editor.redo(); return; }
      if (mod && k === 's') { e.preventDefault(); Export.openModal(); return; }
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(closeModalEl);
        closeSheet();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping && e.target === document.body) {
        const L = Editor.getActiveLayer();
        if (L && L.text) {
          e.preventDefault();
          Editor.commit();
          L.text = '';
          if (S().activeText === 'title') els.titleInput.value = '';
          else els.subtitleInput.value = '';
          Editor.render();
          syncText();
          showToast('Text removed');
        }
      }
    });
  }

  /* ---------------- notifications from editor ---------------- */
  function onNotify(type) {
    if (type === 'render') { syncEmpty(); }
    else if (type === 'sync') { syncAll(); }
    else if (type === 'activeText') { syncText(); }
    else if (type === 'activeTab') { syncTab(); }
    else if (type === 'template') { syncTemplates(); }
    else if (type === 'history') { syncHistory(); }
  }

  function syncAll() {
    syncEmpty();
    syncImage();
    syncText();
    syncAdjust();
    syncTemplates();
    syncHistory();
    syncTab();
    syncSize();
    syncZoomLabel();
  }

  /* ---------------- init ---------------- */
  function cacheEls() {
    els.toasts = $('toasts');
    els.fileInput = $('fileInput');
    els.dropzone = $('dropzone');
    els.emptyUploadBtn = $('emptyUploadBtn');
    els.editUploadBtn = $('editUploadBtn');
    els.imgStatus = $('imgStatus');
    els.templateCats = $('templateCats');
    els.templateGrid = $('templateGrid');
    els.panelTemplates = $('panel-templates');
    els.sidebarLeft = document.querySelector('.sidebar-left');
    els.sheet = $('bottomSheet');
    els.sheetBody = $('sheetBody');
    els.sheetTitle = $('sheetTitle');
    els.sheetClose = $('sheetClose');
    els.topTabs = document.querySelector('.tb-nav');
    els.mTools = Array.prototype.slice.call(document.querySelectorAll('.m-tool'));
    els.canvasSizeSelect = $('canvasSizeSelect');
    els.zoomOutBtn = $('zoomOutBtn');
    els.zoomInBtn = $('zoomInBtn');
    els.zoomPct = $('zoomPct');
    els.canvasEmpty = $('canvasEmpty');
    els.undoBtn = $('undoBtn');
    els.redoBtn = $('redoBtn');
    els.resetBtn = $('resetBtn');
    els.exportBtn = $('exportBtn');
    els.zoomRange = $('zoomRange');
    els.zoomVal = $('zoomVal');
    els.zoomMinusBtn = $('zoomMinusBtn');
    els.zoomPlusBtn = $('zoomPlusBtn');
    els.rotRange = $('rotRange');
    els.rotVal = $('rotVal');
    els.rotMinusBtn = $('rotMinusBtn');
    els.rotPlusBtn = $('rotPlusBtn');
    els.resetImgBtn = $('resetImgBtn');
    els.titleInput = $('titleInput');
    els.subtitleInput = $('subtitleInput');
    els.textLayerBtns = Array.prototype.slice.call(document.querySelectorAll('[data-textlayer]'));
    els.fontSelect = $('fontSelect');
    els.sizeRange = $('sizeRange');
    els.sizeVal = $('sizeVal');
    els.weightSelect = $('weightSelect');
    els.lsRange = $('lsRange');
    els.lsVal = $('lsVal');
    els.lhRange = $('lhRange');
    els.lhVal = $('lhVal');
    els.caseSelect = $('caseSelect');
    els.alignSeg = document.querySelector('.seg[data-align-container]') || document.querySelector('#panel-text .seg');
    els.colorInput = $('colorInput');
    els.colorResetBtn = $('colorResetBtn');
    els.opacityRange = $('opacityRange');
    els.opacityVal = $('opacityVal');
    els.posGrid = document.querySelector('.pos-grid');
    els.posBtns = Array.prototype.slice.call(document.querySelectorAll('.pos-btn'));
    els.ideasInput = $('ideasInput');
    els.ideasBtn = $('ideasBtn');
    els.ideasList = $('ideasList');
    els.ovSeg = document.querySelector('#panel-adjust .seg');
    els.ovRange = $('ovRange');
    els.ovVal = $('ovVal');
    els.vigRange = $('vigRange');
    els.vigVal = $('vigVal');
    els.blurRange = $('blurRange');
    els.blurVal = $('blurVal');
    els.doodleToggle = $('doodleToggle');
    els.filmToggle = $('filmToggle');
    els.grainToggle = $('grainToggle');
    els.expDownloadBtn = $('expDownloadBtn');
  }

  function bindTopbar() {
    els.undoBtn.addEventListener('click', function () { Editor.undo(); });
    els.redoBtn.addEventListener('click', function () { Editor.redo(); });
    els.resetBtn.addEventListener('click', function () {
      Editor.resetDesign();
      showToast('Design reset');
      syncAll();
    });
    els.exportBtn.addEventListener('click', function () { Export.openModal(); });
    els.sheetClose.addEventListener('click', closeSheet);
  }

  function bindTabs() {
    document.querySelectorAll('.tb-tab').forEach(function (b) {
      b.addEventListener('click', function () { selectTab(b.dataset.tab); });
    });
    document.querySelectorAll('.m-tool').forEach(function (b) {
      b.addEventListener('click', function () { onMobileTool(b.dataset.mtool); });
    });
  }

  function init() {
    cacheEls();
    applyTheme(!!Storage.get('darkMode'));
    bindTheme();
    bindTopbar();
    bindTabs();
    bindUpload();
    bindTemplates();
    bindStage();
    bindImagePanel();
    bindTextPanel();
    bindAdjustPanel();
    bindModals();
    bindKeyboard();
    Editor.subscribe(onNotify);
    syncAll();
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Controls = {
    init: init,
    showToast: showToast,
    applyTheme: applyTheme,
    closeSheet: closeSheet
  };
})(window);
