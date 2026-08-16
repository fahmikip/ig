/* ============================================================
   COVERLY — storage.js
   localStorage wrapper for preferences and brand kits.
   Never stores images or sensitive data.
   ============================================================ */
(function (global) {
  'use strict';

  const KEY = 'coverly.prefs.v1';
  const KITS_KEY = 'coverly.kits.v1';

  const DEFAULTS = {
    darkMode: true,
    template: 'cinematic-dark',
    canvasSize: '1080x1350',
    font: 'Space Grotesk',
    lastCat: 'all'
  };

  let cache = null;

  function read() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(KEY);
      cache = raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : Object.assign({}, DEFAULTS);
    } catch (e) {
      cache = Object.assign({}, DEFAULTS);
    }
    return cache;
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch (e) {
      /* storage full/unavailable — ignore, app still works */
    }
  }

  function jsonGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function jsonSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------------- brand kits ---------------- */
  function listKits() {
    const k = jsonGet(KITS_KEY, []);
    return Array.isArray(k) ? k : [];
  }

  function saveKit(kit) {
    const kits = listKits();
    const id = kit.id || ('k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    const clean = {
      id: id,
      name: String(kit.name || 'Brand kit').slice(0, 40),
      colors: [kit.colors[0], kit.colors[1], kit.colors[2]],
      fonts: [kit.fonts[0], kit.fonts[1]]
    };
    const idx = kits.findIndex(function (k) { return k.id === id; });
    if (idx >= 0) kits[idx] = clean; else kits.push(clean);
    jsonSet(KITS_KEY, kits);
    return id;
  }

  function removeKit(id) {
    const kits = listKits().filter(function (k) { return k.id !== id; });
    jsonSet(KITS_KEY, kits);
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Storage = {
    get(key) {
      return read()[key];
    },
    set(key, value) {
      read()[key] = value;
      persist();
    },
    reset() {
      cache = null;
      try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
    },
    kits: {
      list: listKits,
      save: saveKit,
      remove: removeKit
    }
  };
})(window);
