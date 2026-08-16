/* ============================================================
   COVERLY — storage.js
   Tiny localStorage wrapper for lightweight preferences.
   Never stores images or sensitive data.
   ============================================================ */
(function (global) {
  'use strict';

  const KEY = 'coverly.prefs.v1';

  const DEFAULTS = {
    darkMode: false,
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
    }
  };
})(window);
