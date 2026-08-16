/* ============================================================
   COVERLY — controls.js
   Binds every UI control: rail tabs, panels (design / image /
   text / elements / brand), templates, modals, toasts, keyboard
   shortcuts and the mobile bottom sheet.
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
  let lastSampleIdx = 0;

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
  function commitOnce(el) {
    if (el.dataset.c) return;
    el.dataset.c = '1';
    Editor.commit();
  }
  function endCommit(el) { el.dataset.c = ''; }

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
    if (m) m.setAttribute('content', dark ? '#0b0b0f' : '#f5f5f2');
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

  /* ---------------- tabs / rail / sheet ---------------- */
  const PANELS = ['templates', 'design', 'image', 'text', 'elements', 'brand'];

  function selectTab(tab) {
    if (tab === 'export') { Export.openModal(); return; }
    Editor.setActiveTab(tab);
    if (isMobile()) openSheet(tab);
  }

  function openSheet(name) {
    const panel = $('panel-' + name);
    if (!panel) return;
    if (panel.parentNode !== els.sheetBody) {
      PANELS.forEach(function (p) {
        const el = $('panel-' + p);
        if (el && el.parentNode === els.sheetBody) {
          els.panelContainer.appendChild(el);
        }
      });
      els.sheetBody.appendChild(panel);
    }
    const titles = {
      templates: 'Templates', design: 'Design', image: 'Image',
      text: 'Text', elements: 'Elements', brand: 'Brand Kit'
    };
    els.sheetTitle.textContent = titles[name] || name;
    els.sheet.dataset.open = 'true';
  }

  function closeSheet() {
    if (!els.sheet) return;
    els.sheet.dataset.open = 'false';
    PANELS.forEach(function (p) {
      const el = $('panel-' + p);
      if (el && el.parentNode === els.sheetBody) {
        els.panelContainer.appendChild(el);
      }
    });
  }

  function syncTab() {
    const tab = S().activeTab;
    document.querySelectorAll('.tb-tab[data-tab], .rail-btn[data-tab]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.tab === tab);
      b.setAttribute('aria-pressed', String(b.dataset.tab === tab));
    });
    document.querySelectorAll('.m-tool[data-mtool]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.mtool === tab);
      b.setAttribute('aria-pressed', String(b.dataset.mtool === tab));
    });
    if (!isMobile() && els.panelContainer) {
      PANELS.forEach(function (p) {
        const el = $('panel-' + p);
        if (el && el.parentNode === els.panelContainer) {
          el.classList.toggle('is-visible', p === tab);
        }
      });
    }
  }

  /* ---------------- upload / image source ---------------- */
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

  function useSamplePhoto() {
    const idx = lastSampleIdx % 3;
    lastSampleIdx = idx + 1;
    Editor.commit();
    const st = S();
    st.image.img = Canvas.getSamplePhoto(idx);
    st.image.src = null;
    st.image.offsetX = 0;
    st.image.offsetY = 0;
    st.image.scale = 1;
    st.image.rotation = 0;
    fileInfo = { name: 'Sample photo ' + (idx + 1), size: 0 };
    Editor.render();
    syncEmpty();
    updateImgStatus();
    showToast('Sample photo added');
  }

  function updateImgStatus() {
    if (!fileInfo) return;
    const kb = fileInfo.size ? (fileInfo.size / 1024).toFixed(0) + ' KB' : 'built-in';
    els.imgStatus.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg> Loaded: ' +
      fileInfo.name + ' (' + kb + ') — processed locally';
  }

  function bindUpload() {
    els.dropzone.addEventListener('click', function (e) {
      if (e.target.closest('.stage-toolbar')) return;
      els.fileInput.click();
    });
    els.emptyUploadBtn.addEventListener('click', function (e) { e.stopPropagation(); els.fileInput.click(); });
    els.emptySampleBtn.addEventListener('click', function (e) { e.stopPropagation(); useSamplePhoto(); });
    els.editUploadBtn.addEventListener('click', function (e) { e.stopPropagation(); els.fileInput.click(); });
    els.sampleBtn.addEventListener('click', function (e) { e.stopPropagation(); useSamplePhoto(); });

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
  function renderTemplateCats() {
    els.templateCats.innerHTML = '';
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'tpl-cat' + (Storage.get('lastCat') === 'all' || !Storage.get('lastCat') ? ' is-active' : '');
    all.dataset.cat = 'all';
    all.setAttribute('role', 'tab');
    all.setAttribute('aria-selected', String(Storage.get('lastCat') === 'all'));
    all.textContent = 'All';
    els.templateCats.appendChild(all);
    T.CATEGORIES.forEach(function (c) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tpl-cat' + (Storage.get('lastCat') === c.id ? ' is-active' : '');
      btn.dataset.cat = c.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(Storage.get('lastCat') === c.id));
      btn.textContent = c.name;
      els.templateCats.appendChild(btn);
    });
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
  }

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
    renderTemplateCats();
    renderTemplateGrid(Storage.get('lastCat') || 'all');
  }

  /* ---------------- design panel ---------------- */
  const BG_SWATCHES = ['#0b0b0f', '#101014', '#0f1210', '#0c0c0e', '#1c1c22', '#f2efe7', '#edebe4', '#fafaf8', '#d9dad6', '#ffffff'];

  function bindDesignPanel() {
    els.bgSwatches.innerHTML = '';
    BG_SWATCHES.forEach(function (c) {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'bg-swatch';
      sw.dataset.color = c;
      sw.style.background = c;
      sw.setAttribute('aria-label', 'Background ' + c);
      els.bgSwatches.appendChild(sw);
    });

    els.canvasSizeSelect.addEventListener('change', function () {
      const parts = els.canvasSizeSelect.value.split('x').map(Number);
      Editor.setCanvasSize(parts[0], parts[1]);
      Storage.set('canvasSize', els.canvasSizeSelect.value);
    });

    els.bgColorInput.addEventListener('input', function () {
      commitOnce(els.bgColorInput);
      S().bgColor = els.bgColorInput.value;
      Editor.render();
      syncSwatches();
    });
    els.bgColorInput.addEventListener('change', function () { endCommit(els.bgColorInput); });
    els.bgSwatches.addEventListener('click', function (e) {
      const sw = e.target.closest('.bg-swatch');
      if (!sw) return;
      Editor.commit();
      S().bgColor = sw.dataset.color;
      els.bgColorInput.value = S().bgColor;
      Editor.render();
      syncSwatches();
    });

    bindSegGroup(els.ovSeg, function (btn) {
      Editor.commit();
      S().overlay.type = btn.dataset.ovtype;
      Editor.render();
      syncDesign();
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
    bindToggle(els.accentLineToggle, 'accentLine');
    bindToggle(els.pillToggle, 'pill');
    bindToggle(els.filmToggle, 'film');
    bindToggle(els.grainToggle, 'grain');

    els.pillTextInput.addEventListener('input', function () {
      commitOnce(els.pillTextInput);
      S().decor.pillText = els.pillTextInput.value;
      Editor.render();
    });
    els.pillTextInput.addEventListener('blur', function () { endCommit(els.pillTextInput); });

    els.browseTplBtn.addEventListener('click', function () { selectTab('templates'); });
  }

  function syncSwatches() {
    els.bgSwatches.querySelectorAll('.bg-swatch').forEach(function (sw) {
      sw.classList.toggle('is-active', sw.dataset.color.toLowerCase() === S().bgColor.toLowerCase());
    });
  }

  function syncDesign() {
    const o = S().overlay;
    els.bgColorInput.value = S().bgColor;
    syncSwatches();
    els.ovSeg.querySelectorAll('.seg-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.ovtype === o.type);
    });
    els.ovRange.value = Math.round(o.opacity * 100);
    els.ovVal.textContent = els.ovRange.value + '%';
    els.vigRange.value = Math.round(o.vignette * 100);
    els.vigVal.textContent = els.vigRange.value + '%';
    els.blurRange.value = Math.round(o.blur);
    els.blurVal.textContent = els.blurRange.value + 'px';
    els.accentLineToggle.setAttribute('aria-checked', String(!!S().decor.accentLine));
    els.pillToggle.setAttribute('aria-checked', String(!!S().decor.pill));
    els.filmToggle.setAttribute('aria-checked', String(!!S().decor.film));
    els.grainToggle.setAttribute('aria-checked', String(!!S().decor.grain));
    els.pillTextInput.value = S().decor.pillText || '';
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
      S().image.rotation = Math.max(-180, Math.round(S().image.rotation) - 5);
      els.rotRange.value = S().image.rotation;
      els.rotVal.textContent = S().image.rotation + '\u00b0';
      Editor.render();
    });
    els.rotPlusBtn.addEventListener('click', function () {
      Editor.commit();
      S().image.rotation = Math.min(180, Math.round(S().image.rotation) + 5);
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

  function setGradient(on) {
    const L = S()[S().activeText];
    if (on) {
      if (!L.gradient) {
        L.gradient = { colors: [L.color, '#ff5a36'], angle: 90 };
      } else if (!L.gradient.colors) {
        L.gradient.colors = [L.color, '#ff5a36'];
      }
    } else {
      L.gradient = null;
    }
    syncText();
    Editor.render();
  }

  function setShadow(on) {
    const L = S()[S().activeText];
    if (!L.shadow) L.shadow = { enabled: false, color: '#000000', blur: 24, offsetX: 0, offsetY: 6 };
    L.shadow.enabled = on;
    syncText();
    Editor.render();
  }

  function setOutline(on) {
    const L = S()[S().activeText];
    L.outline = on ? { color: '#000000', width: 6 } : null;
    syncText();
    Editor.render();
  }

  function bindEffectGroup(toggle, groupEl, action) {
    toggle.addEventListener('click', function () {
      Editor.commit();
      const on = toggle.getAttribute('aria-checked') !== 'true';
      toggle.setAttribute('aria-checked', String(on));
      groupEl.classList.toggle('is-open', on);
      action(on);
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

    /* gradient */
    bindEffectGroup(els.gradToggle, els.gradGroup, setGradient);
    els.gradColor1.addEventListener('input', function () {
      commitOnce(els.gradColor1);
      const L = S()[S().activeText];
      if (!L.gradient) L.gradient = { colors: [els.gradColor1.value, '#ff5a36'], angle: 90 };
      L.gradient.colors[0] = els.gradColor1.value;
      Editor.render();
    });
    els.gradColor1.addEventListener('change', function () { endCommit(els.gradColor1); });
    els.gradColor2.addEventListener('input', function () {
      commitOnce(els.gradColor2);
      const L = S()[S().activeText];
      if (!L.gradient) L.gradient = { colors: [L.color, els.gradColor2.value], angle: 90 };
      L.gradient.colors[1] = els.gradColor2.value;
      Editor.render();
    });
    els.gradColor2.addEventListener('change', function () { endCommit(els.gradColor2); });
    bindRange(els.gradAngle, function (v) {
      const L = S()[S().activeText];
      if (!L.gradient) L.gradient = { colors: [L.color, '#ff5a36'], angle: v };
      L.gradient.angle = v;
      els.gradAngleVal.textContent = v + '\u00b0';
    });

    /* shadow */
    bindEffectGroup(els.shadowToggle, els.shadowGroup, setShadow);
    els.shadowColor.addEventListener('input', function () {
      commitOnce(els.shadowColor);
      const L = S()[S().activeText];
      if (!L.shadow) L.shadow = { enabled: true, color: els.shadowColor.value, blur: 24, offsetX: 0, offsetY: 6 };
      L.shadow.color = els.shadowColor.value;
      Editor.render();
    });
    els.shadowColor.addEventListener('change', function () { endCommit(els.shadowColor); });
    bindRange(els.shadowBlur, function (v) {
      S()[S().activeText].shadow = S()[S().activeText].shadow || { enabled: true, color: '#000000', blur: v, offsetX: 0, offsetY: 6 };
      S()[S().activeText].shadow.blur = v;
      els.shadowBlurVal.textContent = v + 'px';
    });
    bindRange(els.shadowX, function (v) {
      S()[S().activeText].shadow = S()[S().activeText].shadow || { enabled: true, color: '#000000', blur: 24, offsetX: v, offsetY: 0 };
      S()[S().activeText].shadow.offsetX = v;
      els.shadowXVal.textContent = v + 'px';
    });
    bindRange(els.shadowY, function (v) {
      S()[S().activeText].shadow = S()[S().activeText].shadow || { enabled: true, color: '#000000', blur: 24, offsetX: 0, offsetY: v };
      S()[S().activeText].shadow.offsetY = v;
      els.shadowYVal.textContent = v + 'px';
    });

    /* outline */
    bindEffectGroup(els.outlineToggle, els.outlineGroup, setOutline);
    els.outlineColor.addEventListener('input', function () {
      commitOnce(els.outlineColor);
      const L = S()[S().activeText];
      L.outline = L.outline || { color: els.outlineColor.value, width: 6 };
      L.outline.color = els.outlineColor.value;
      Editor.render();
    });
    els.outlineColor.addEventListener('change', function () { endCommit(els.outlineColor); });
    bindRange(els.outlineWidth, function (v) {
      const L = S()[S().activeText];
      L.outline = L.outline || { color: '#000000', width: v };
      L.outline.width = v;
      els.outlineWidthVal.textContent = v + 'px';
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

    /* gradient */
    const hasGrad = !!L.gradient;
    els.gradToggle.setAttribute('aria-checked', String(hasGrad));
    els.gradGroup.classList.toggle('is-open', hasGrad);
    els.gradColor1.value = (L.gradient && L.gradient.colors[0]) || L.color;
    els.gradColor2.value = (L.gradient && L.gradient.colors[1]) || '#ff5a36';
    els.gradAngle.value = (L.gradient && L.gradient.angle) || 90;
    els.gradAngleVal.textContent = els.gradAngle.value + '\u00b0';

    /* shadow */
    const sh = L.shadow;
    els.shadowToggle.setAttribute('aria-checked', String(!!(sh && sh.enabled)));
    els.shadowGroup.classList.toggle('is-open', !!(sh && sh.enabled));
    els.shadowColor.value = (sh && sh.color) || '#000000';
    els.shadowBlur.value = (sh && sh.blur) || 24;
    els.shadowBlurVal.textContent = els.shadowBlur.value + 'px';
    els.shadowX.value = (sh && sh.offsetX) || 0;
    els.shadowXVal.textContent = els.shadowX.value + 'px';
    els.shadowY.value = (sh && sh.offsetY) || 0;
    els.shadowYVal.textContent = els.shadowY.value + 'px';

    /* outline */
    const ol = L.outline;
    els.outlineToggle.setAttribute('aria-checked', String(!!ol));
    els.outlineGroup.classList.toggle('is-open', !!ol);
    els.outlineColor.value = (ol && ol.color) || '#000000';
    els.outlineWidth.value = (ol && ol.width) || 6;
    els.outlineWidthVal.textContent = els.outlineWidth.value + 'px';

    els.posBtns.forEach(function (b) { b.classList.remove('is-active'); });
    Object.keys(T.POSITIONS).forEach(function (k) {
      const p = T.POSITIONS[k];
      if (p.x === L.x && p.y === L.y && p.align === L.align) {
        const btn = els.posGrid.querySelector('[data-pos="' + k + '"]');
        if (btn) btn.classList.add('is-active');
      }
    });
  }

  /* ---------------- elements panel ---------------- */
  const ELEMENT_GROUPS = [
    { label: 'Emojis', types: ['emoji'] },
    { label: 'Shapes', types: ['shape'] },
    { label: 'Badges', types: ['badge'] }
  ];

  function renderElementPalette() {
    els.elPalette.innerHTML = '';
    const frag = document.createDocumentFragment();
    ELEMENT_GROUPS.forEach(function (grp) {
      const head = document.createElement('h4');
      head.className = 'el-group-title';
      head.textContent = grp.label;
      frag.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'el-palette-grid';
      T.ELEMENTS.forEach(function (def) {
        if (grp.types.indexOf(def.type) === -1) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'el-add';
        btn.dataset.elem = def.id;
        btn.setAttribute('aria-label', 'Add ' + def.label);
        if (def.type === 'emoji') {
          btn.textContent = def.emoji;
        } else if (def.type === 'badge') {
          btn.textContent = def.text;
          btn.className = 'el-add el-add--badge';
        } else {
          btn.innerHTML = '<svg class="icon"><use href="#i-' + def.shape + '"/></svg>';
        }
        btn.addEventListener('click', function () {
          Editor.addElement(T.getElementDef(def.id));
          showToast(def.label + ' added');
          syncElements();
        });
        grid.appendChild(btn);
      });
      frag.appendChild(grid);
    });
    els.elPalette.appendChild(frag);
  }

  function renderElementList() {
    els.elList.innerHTML = '';
    const st = S();
    st.elements.forEach(function (el, i) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'el-chip' + (st.activeElement === i ? ' is-active' : '');
      chip.dataset.index = String(i);
      let label = el.text || el.emoji || el.shape;
      if (el.type === 'shape') label = el.shape;
      chip.textContent = label;
      chip.addEventListener('click', function () {
        Editor.selectElement(i);
        syncElements();
      });
      els.elList.appendChild(chip);
    });
  }

  function syncElements() {
    renderElementList();
    const i = S().activeElement;
    els.elControls.hidden = i < 0;
    if (i < 0) return;
    const el = S().elements[i];
    els.elScale.value = Math.round(el.scale * 100);
    els.elScaleVal.textContent = el.scale.toFixed(2);
    els.elRot.value = Math.round(el.rotation);
    els.elRotVal.textContent = els.elRot.value + '\u00b0';
    els.elOpacity.value = Math.round(el.opacity * 100);
    els.elOpacityVal.textContent = els.elOpacity.value + '%';
    els.elColor.hidden = el.type === 'emoji';
    els.elColor.value = el.color;
  }

  function bindElementsPanel() {
    renderElementPalette();

    bindRange(els.elScale, function (v) {
      if (S().activeElement < 0) return;
      Editor.updateElement(S().activeElement, { scale: v / 100 });
      els.elScaleVal.textContent = (v / 100).toFixed(2);
    });
    bindRange(els.elRot, function (v) {
      if (S().activeElement < 0) return;
      Editor.updateElement(S().activeElement, { rotation: v });
      els.elRotVal.textContent = v + '\u00b0';
    });
    bindRange(els.elOpacity, function (v) {
      if (S().activeElement < 0) return;
      Editor.updateElement(S().activeElement, { opacity: v / 100 });
      els.elOpacityVal.textContent = v + '%';
    });
    els.elColor.addEventListener('input', function () {
      commitOnce(els.elColor);
      if (S().activeElement < 0) return;
      Editor.updateElement(S().activeElement, { color: els.elColor.value });
    });
    els.elColor.addEventListener('change', function () { endCommit(els.elColor); });

    els.elDeleteBtn.addEventListener('click', function () {
      Editor.deleteElement(S().activeElement);
      syncElements();
      showToast('Element removed');
    });
    els.elDupBtn.addEventListener('click', function () {
      Editor.duplicateElement(S().activeElement);
      syncElements();
      showToast('Element duplicated');
    });
    els.elFrontBtn.addEventListener('click', function () {
      Editor.bringToFront(S().activeElement);
      syncElements();
      showToast('Element brought to front');
    });
  }

  /* ---------------- brand panel ---------------- */
  function saveBrandKit() {
    const name = els.brandName.value.trim();
    const st = S();
    if (!name) { showToast('Give your kit a name first.', 'error'); return; }
    const id = Storage.kits.save({
      name: name,
      colors: [st.bgColor, st.title.color, st.subtitle.color],
      fonts: [st.title.font, st.subtitle.font]
    });
    els.brandName.value = '';
    renderBrandList();
    showToast('Brand kit saved');
    return id;
  }

  function applyBrandKit(id) {
    const kit = Storage.kits.list().find(function (k) { return k.id === id; });
    if (!kit) return;
    Editor.commit();
    const st = S();
    st.bgColor = kit.colors[0];
    st.title.color = kit.colors[1];
    st.subtitle.color = kit.colors[2];
    st.title.font = kit.fonts[0];
    st.subtitle.font = kit.fonts[1];
    Editor.render();
    syncAll();
    showToast('Brand kit applied');
  }

  function renderBrandList() {
    els.brandList.innerHTML = '';
    const kits = Storage.kits.list();
    if (!kits.length) {
      const empty = document.createElement('p');
      empty.className = 'brand-empty';
      empty.textContent = 'No saved kits yet. Design something and save it as your brand.';
      els.brandList.appendChild(empty);
      return;
    }
    kits.forEach(function (kit) {
      const item = document.createElement('div');
      item.className = 'brand-item';
      const info = document.createElement('div');
      info.className = 'brand-info';
      const dots = document.createElement('div');
      dots.className = 'brand-dots';
      kit.colors.forEach(function (c) {
        const d = document.createElement('span');
        d.className = 'brand-dot';
        d.style.background = c;
        dots.appendChild(d);
      });
      const name = document.createElement('span');
      name.className = 'brand-name';
      name.textContent = kit.name;
      info.appendChild(dots);
      info.appendChild(name);
      const actions = document.createElement('div');
      actions.className = 'brand-actions';
      const applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'btn btn-ghost btn-sm';
      applyBtn.textContent = 'Apply';
      applyBtn.addEventListener('click', function () { applyBrandKit(kit.id); });
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'icon-btn';
      delBtn.setAttribute('aria-label', 'Delete brand kit ' + kit.name);
      delBtn.innerHTML = '<svg class="icon"><use href="#i-trash"/></svg>';
      delBtn.addEventListener('click', function () {
        Storage.kits.remove(kit.id);
        renderBrandList();
        showToast('Brand kit deleted');
      });
      actions.appendChild(applyBtn);
      actions.appendChild(delBtn);
      item.appendChild(info);
      item.appendChild(actions);
      els.brandList.appendChild(item);
    });
  }

  function bindBrandPanel() {
    els.brandSaveBtn.addEventListener('click', saveBrandKit);
    els.brandName.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveBrandKit(); }
    });
    renderBrandList();
  }

  function syncBrand() {
    els.brandSwatch.setAttribute('style', 'background: ' + S().bgColor);
    els.brandTitleColor.setAttribute('style', 'background: ' + S().title.color);
    els.brandSubColor.setAttribute('style', 'background: ' + S().subtitle.color);
    els.brandTitleFont.textContent = S().title.font;
    els.brandSubFont.textContent = S().subtitle.font;
  }

  /* ---------------- empty state ---------------- */
  function syncEmpty() {
    /* The empty overlay only makes sense before a template is applied:
       once a design exists the canvas speaks for itself. */
    const has = Editor.hasImage() || !!S().templateId;
    if (els.canvasEmpty.hidden !== has) {
      els.canvasEmpty.hidden = has;
    }
  }

  /* ---------------- history buttons ---------------- */
  function syncHistory() {
    els.undoBtn.disabled = !Editor.canUndo();
    els.redoBtn.disabled = !Editor.canRedo();
  }

  /* ---------------- stage ---------------- */
  function syncSize() {
    const c = S().canvas;
    els.canvasSizeSelect.value = c.width + 'x' + c.height;
    const text = els.sizeSelectText;
    if (text) {
      const label = c.width + 'x' + c.height;
      text.textContent = label === '1080x1080' ? 'Square' : label === '1080x1920' ? 'Story' : 'Portrait';
    }
  }
  function syncZoomLabel() {
    const z = Editor.getViewZoom();
    els.zoomPct.textContent = Math.abs(z - 1) < 0.02 ? 'Fit' : Math.round(z * 100) + '%';
  }
  function bindStage() {
    els.zoomOutBtn.addEventListener('click', function () {
      Editor.setViewZoom(Editor.getViewZoom() * 0.85);
      syncZoomLabel();
    });
    els.zoomInBtn.addEventListener('click', function () {
      Editor.setViewZoom(Editor.getViewZoom() * 1.18);
      syncZoomLabel();
    });
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
    els.expDownloadBtn.addEventListener('click', function () { Export.downloadCurrent(); });
    els.expAllBtn.addEventListener('click', function () { Export.downloadAll(); });

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
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        const i = S().activeElement;
        if (i >= 0) {
          e.preventDefault();
          Editor.deleteElement(i);
          syncElements();
          showToast('Element removed');
          return;
        }
        if (e.target === document.body) {
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
      }
    });
  }

  /* ---------------- notifications from editor ---------------- */
  function onNotify(type) {
    if (type === 'render') { syncEmpty(); }
    else if (type === 'sync') { syncAll(); }
    else if (type === 'activeText') { syncText(); }
    else if (type === 'activeTab') { syncTab(); }
    else if (type === 'template') { syncTemplates(); syncDesign(); syncText(); }
    else if (type === 'element') { syncElements(); }
    else if (type === 'history') { syncHistory(); }
  }

  function syncAll() {
    syncEmpty();
    syncImage();
    syncText();
    syncDesign();
    syncElements();
    syncTemplates();
    syncHistory();
    syncTab();
    syncSize();
    syncZoomLabel();
    syncBrand();
  }

  /* ---------------- init ---------------- */
  function cacheEls() {
    els.toasts = $('toasts');
    els.fileInput = $('fileInput');
    els.dropzone = $('dropzone');
    els.emptyUploadBtn = $('emptyUploadBtn');
    els.emptySampleBtn = $('emptySampleBtn');
    els.editUploadBtn = $('editUploadBtn');
    els.sampleBtn = $('sampleBtn');
    els.imgStatus = $('imgStatus');
    els.templateCats = $('templateCats');
    els.templateGrid = $('templateGrid');
    els.panelContainer = document.querySelector('.panels');
    els.sheet = $('bottomSheet');
    els.sheetBody = $('sheetBody');
    els.sheetTitle = $('sheetTitle');
    els.sheetClose = $('sheetClose');
    els.canvasSizeSelect = $('canvasSizeSelect');
    els.sizeSelectText = $('sizeSelectText');
    els.zoomOutBtn = $('zoomOutBtn');
    els.zoomInBtn = $('zoomInBtn');
    els.zoomPct = $('zoomPct');
    els.canvasEmpty = $('canvasEmpty');
    els.undoBtn = $('undoBtn');
    els.redoBtn = $('redoBtn');
    els.resetBtn = $('resetBtn');
    els.exportBtn = $('exportBtn');
    els.bgColorInput = $('bgColorInput');
    els.bgSwatches = $('bgSwatches');
    els.ovSeg = $('ovSeg');
    els.ovRange = $('ovRange');
    els.ovVal = $('ovVal');
    els.vigRange = $('vigRange');
    els.vigVal = $('vigVal');
    els.blurRange = $('blurRange');
    els.blurVal = $('blurVal');
    els.accentLineToggle = $('accentLineToggle');
    els.pillToggle = $('pillToggle');
    els.filmToggle = $('filmToggle');
    els.grainToggle = $('grainToggle');
    els.pillTextInput = $('pillTextInput');
    els.browseTplBtn = $('browseTplBtn');
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
    els.alignSeg = $('alignSeg');
    els.colorInput = $('colorInput');
    els.colorResetBtn = $('colorResetBtn');
    els.opacityRange = $('opacityRange');
    els.opacityVal = $('opacityVal');
    els.gradToggle = $('gradToggle');
    els.gradGroup = $('gradGroup');
    els.gradColor1 = $('gradColor1');
    els.gradColor2 = $('gradColor2');
    els.gradAngle = $('gradAngle');
    els.gradAngleVal = $('gradAngleVal');
    els.shadowToggle = $('shadowToggle');
    els.shadowGroup = $('shadowGroup');
    els.shadowColor = $('shadowColor');
    els.shadowBlur = $('shadowBlur');
    els.shadowBlurVal = $('shadowBlurVal');
    els.shadowX = $('shadowX');
    els.shadowXVal = $('shadowXVal');
    els.shadowY = $('shadowY');
    els.shadowYVal = $('shadowYVal');
    els.outlineToggle = $('outlineToggle');
    els.outlineGroup = $('outlineGroup');
    els.outlineColor = $('outlineColor');
    els.outlineWidth = $('outlineWidth');
    els.outlineWidthVal = $('outlineWidthVal');
    els.posGrid = $('posGrid');
    els.posBtns = Array.prototype.slice.call(document.querySelectorAll('.pos-btn'));
    els.ideasInput = $('ideasInput');
    els.ideasBtn = $('ideasBtn');
    els.ideasList = $('ideasList');
    els.elPalette = $('elPalette');
    els.elList = $('elList');
    els.elControls = $('elControls');
    els.elScale = $('elScale');
    els.elScaleVal = $('elScaleVal');
    els.elRot = $('elRot');
    els.elRotVal = $('elRotVal');
    els.elOpacity = $('elOpacity');
    els.elOpacityVal = $('elOpacityVal');
    els.elColor = $('elColor');
    els.elDeleteBtn = $('elDeleteBtn');
    els.elDupBtn = $('elDupBtn');
    els.elFrontBtn = $('elFrontBtn');
    els.brandName = $('brandName');
    els.brandSaveBtn = $('brandSaveBtn');
    els.brandList = $('brandList');
    els.brandSwatch = $('brandSwatch');
    els.brandTitleColor = $('brandTitleColor');
    els.brandSubColor = $('brandSubColor');
    els.brandTitleFont = $('brandTitleFont');
    els.brandSubFont = $('brandSubFont');
    els.expDownloadBtn = $('expDownloadBtn');
    els.expAllBtn = $('expAllBtn');
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

  function bindRail() {
    document.querySelectorAll('.tb-tab[data-tab], .rail-btn[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { selectTab(b.dataset.tab); });
    });
    document.querySelectorAll('.m-tool[data-mtool]').forEach(function (b) {
      b.addEventListener('click', function () { selectTab(b.dataset.mtool); });
    });
  }

  function init() {
    cacheEls();
    applyTheme(!!Storage.get('darkMode'));
    bindTheme();
    bindTopbar();
    bindRail();
    bindUpload();
    bindTemplates();
    bindStage();
    bindDesignPanel();
    bindImagePanel();
    bindTextPanel();
    bindElementsPanel();
    bindBrandPanel();
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
    closeSheet: closeSheet,
    openSheet: openSheet
  };
})(window);
