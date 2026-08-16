/* ============================================================
   COVERLY — templates.js
   Font library, ready-to-use template collection, sticker/element
   palette, position presets and the local title-ideas dictionary.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------------- fonts ---------------- */
  const FONTS = [
    { name: 'Space Grotesk', stack: "'Space Grotesk',sans-serif", cat: 'Sans' },
    { name: 'Inter', stack: "'Inter',sans-serif", cat: 'Sans' },
    { name: 'Poppins', stack: "'Poppins',sans-serif", cat: 'Sans' },
    { name: 'Montserrat', stack: "'Montserrat',sans-serif", cat: 'Sans' },
    { name: 'Oswald', stack: "'Oswald',sans-serif", cat: 'Condensed' },
    { name: 'Bebas Neue', stack: "'Bebas Neue',sans-serif", cat: 'Condensed' },
    { name: 'Playfair Display', stack: "'Playfair Display',serif", cat: 'Serif' },
    { name: 'DM Serif Display', stack: "'DM Serif Display',serif", cat: 'Serif' }
  ];

  function fontStack(name) {
    const f = FONTS.find(function (x) { return x.name === name; });
    return (f && f.stack) || FONTS[0].stack;
  }

  /* ---------------- categories ---------------- */
  const CATEGORIES = [
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'bold', name: 'Bold Quote' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'product', name: 'Product' },
    { id: 'promo', name: 'Promo' },
    { id: 'typography', name: 'Typography' },
    { id: 'special', name: 'Special' },
    { id: 'official', name: 'Government' }
  ];

  /* ---------------- templates ---------------- */
  const TEMPLATES = [
    /* ---------- CINEMATIC ---------- */
    {
      id: 'cinematic-dark', name: 'Cinematic Dark', category: 'cinematic',
      bg: '#0B0B0F', overlay: { type: 'dark', opacity: 0.4, vignette: 0.5, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Space Grotesk', size: 118, weight: 700, letterSpacing: 0, lineHeight: 1.05, align: 'left', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.08, y: 0.16, shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 34, offsetX: 0, offsetY: 6 } },
      subtitle: { font: 'Inter', size: 28, weight: 500, letterSpacing: 2, lineHeight: 1.6, align: 'left', color: 'rgba(255,255,255,0.78)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3 },
      sample: { title: 'SCENE 01', subtitle: 'SORE YANG PERLAHAN — DI UJUNG SENJA' }
    },
    {
      id: 'golden-hour', name: 'Golden Hour', category: 'cinematic',
      bg: '#120D08', overlay: { type: 'dark', opacity: 0.25, vignette: 0.42, blur: 0, tint: 'sepia', tintAlpha: 0.5 },
      decor: { accentLine: true },
      title: { font: 'DM Serif Display', size: 112, weight: 400, letterSpacing: 0, lineHeight: 1.1, align: 'left', color: '#FFE9C7', opacity: 1, case: 'none', x: 0.08, y: 0.15, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 28, offsetX: 0, offsetY: 4 } },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 4, lineHeight: 1.6, align: 'left', color: 'rgba(255,233,199,0.8)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3 },
      sample: { title: 'Golden Hour', subtitle: 'THE LAST LIGHT BEFORE NIGHT' }
    },
    {
      id: 'street-night', name: 'Street Night', category: 'cinematic',
      bg: '#08070B', overlay: { type: 'dark', opacity: 0.45, vignette: 0.6, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Oswald', size: 120, weight: 600, letterSpacing: 2, lineHeight: 1.05, align: 'left', color: '#F2EDE4', opacity: 1, case: 'uppercase', x: 0.08, y: 0.15, shadow: { enabled: true, color: 'rgba(0,0,0,0.7)', blur: 26, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Space Grotesk', size: 26, weight: 500, letterSpacing: 5, lineHeight: 1.6, align: 'left', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.08, y: 0.29 },
      sample: { title: 'CITY AFTER DARK', subtitle: 'NEON RAIN · LATE NIGHT DRIVE' }
    },
    {
      id: 'moody-calm', name: 'Moody Calm', category: 'cinematic',
      bg: '#0F1210', overlay: { type: 'light', opacity: 0.12, vignette: 0.55, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Inter', size: 96, weight: 300, letterSpacing: 0, lineHeight: 1.2, align: 'left', color: '#F4F4F2', opacity: 1, case: 'none', x: 0.09, y: 0.16 },
      subtitle: { font: 'Inter', size: 24, weight: 400, letterSpacing: 3, lineHeight: 1.7, align: 'left', color: 'rgba(244,244,242,0.65)', opacity: 1, case: 'uppercase', x: 0.09, y: 0.31 },
      sample: { title: 'Breathe in, quietly', subtitle: 'A NOTE ON SLOW LIVING' }
    },

    /* ---------- MINIMAL ---------- */
    {
      id: 'minimal-ivory', name: 'Minimal Ivory', category: 'minimal',
      bg: '#EDEBE4', overlay: { type: 'none', opacity: 0, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Space Grotesk', size: 104, weight: 600, letterSpacing: -2, lineHeight: 1.05, align: 'left', color: '#111111', opacity: 1, case: 'none', x: 0.08, y: 0.16 },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: '#6B6B63', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3 },
      sample: { title: 'Less, but better', subtitle: 'VOL. 02 — THE MINIMAL EDIT' }
    },
    {
      id: 'clean-white', name: 'Clean White', category: 'minimal',
      bg: '#FAFAF8', overlay: { type: 'light', opacity: 0.1, vignette: 0.12, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'EST. 2026', accentLine: false },
      title: { font: 'DM Serif Display', size: 110, weight: 400, letterSpacing: 0, lineHeight: 1.1, align: 'left', color: '#111111', opacity: 1, case: 'none', x: 0.08, y: 0.15 },
      subtitle: { font: 'Inter', size: 26, weight: 400, letterSpacing: 4, lineHeight: 1.6, align: 'left', color: '#8A8A82', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3 },
      sample: { title: 'Today, simply', subtitle: 'ONE GOOD DAY AT A TIME' }
    },
    {
      id: 'editorial', name: 'Editorial', category: 'minimal',
      bg: '#0F0F12', overlay: { type: 'none', opacity: 0, vignette: 0.3, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Playfair Display', size: 100, weight: 500, letterSpacing: 0, lineHeight: 1.15, align: 'left', color: '#F5F1E8', opacity: 1, case: 'none', x: 0.09, y: 0.15 },
      subtitle: { font: 'Inter', size: 24, weight: 400, letterSpacing: 5, lineHeight: 1.7, align: 'left', color: 'rgba(245,241,232,0.6)', opacity: 1, case: 'uppercase', x: 0.09, y: 0.3 },
      sample: { title: 'The Quiet Issue', subtitle: 'ISSUE NO. 04 — WINTER' }
    },
    {
      id: 'soft-grey', name: 'Soft Grey', category: 'minimal',
      bg: '#D9DAD6', overlay: { type: 'none', opacity: 0, vignette: 0.1, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Inter', size: 88, weight: 400, letterSpacing: 1, lineHeight: 1.2, align: 'center', color: '#161616', opacity: 1, case: 'none', x: 0.5, y: 0.5 },
      subtitle: { font: 'Inter', size: 24, weight: 500, letterSpacing: 5, lineHeight: 1.6, align: 'center', color: '#3C3C38', opacity: 1, case: 'uppercase', x: 0.5, y: 0.62 },
      sample: { title: 'Keep it simple', subtitle: '— LESS NOISE, MORE SIGNAL —' }
    },

    /* ---------- BOLD QUOTE ---------- */
    {
      id: 'bold-quote', name: 'Bold Quote', category: 'bold',
      bg: '#101014', overlay: { type: 'dark', opacity: 0.5, vignette: 0.5, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Bebas Neue', size: 170, weight: 400, letterSpacing: 1, lineHeight: 0.95, align: 'left', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.08, y: 0.35, shadow: { enabled: true, color: 'rgba(0,0,0,0.55)', blur: 24, offsetX: 0, offsetY: 4 } },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 5, lineHeight: 1.6, align: 'left', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.08, y: 0.63 },
      sample: { title: 'Make it count', subtitle: 'THIS IS YOUR MOMENT' }
    },
    {
      id: 'quote-lines', name: 'Quote Lines', category: 'bold',
      bg: '#0C0C0E', overlay: { type: 'dark', opacity: 0.45, vignette: 0.4, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Playfair Display', size: 96, weight: 500, letterSpacing: 0, lineHeight: 1.25, align: 'left', color: '#F7F4ED', opacity: 1, case: 'none', x: 0.08, y: 0.22 },
      subtitle: { font: 'Space Grotesk', size: 26, weight: 500, letterSpacing: 4, lineHeight: 1.6, align: 'left', color: 'rgba(247,244,237,0.6)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.52 },
      sample: { title: '“Growth is never by mere chance.”', subtitle: '— DAILY REMINDER —' }
    },
    {
      id: 'massive-type', name: 'Massive Type', category: 'bold',
      bg: '#F0F0EC', overlay: { type: 'none', opacity: 0, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Bebas Neue', size: 200, weight: 400, letterSpacing: 0, lineHeight: 0.9, align: 'center', color: '#111111', opacity: 1, case: 'none', x: 0.5, y: 0.48 },
      subtitle: { font: 'Inter', size: 28, weight: 600, letterSpacing: 8, lineHeight: 1.6, align: 'center', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.5, y: 0.68 },
      sample: { title: 'NOW', subtitle: 'THIS MOMENT IS YOURS' }
    },
    {
      id: 'blackout', name: 'Blackout', category: 'bold',
      bg: '#000000', overlay: { type: 'none', opacity: 0, vignette: 0.35, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Oswald', size: 124, weight: 600, letterSpacing: 3, lineHeight: 1, align: 'center', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.5, y: 0.5, shadow: { enabled: true, color: 'rgba(255,255,255,0.25)', blur: 40, offsetX: 0, offsetY: 0 } },
      subtitle: { font: 'Space Grotesk', size: 28, weight: 500, letterSpacing: 6, lineHeight: 1.6, align: 'center', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.5, y: 0.65 },
      sample: { title: 'NO EXCUSES', subtitle: 'SHOW UP. DO THE WORK.' }
    },

    /* ---------- LIFESTYLE ---------- */
    {
      id: 'travel', name: 'Wanderlust', category: 'lifestyle',
      bg: '#0E1212', overlay: { type: 'dark', opacity: 0.35, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'TRAVEL' },
      title: { font: 'Poppins', size: 96, weight: 700, letterSpacing: -1, lineHeight: 1.1, align: 'left', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.08, y: 0.2, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 24, offsetX: 0, offsetY: 4 } },
      subtitle: { font: 'Inter', size: 26, weight: 400, letterSpacing: 2, lineHeight: 1.7, align: 'left', color: 'rgba(255,255,255,0.8)', opacity: 1, case: 'none', x: 0.08, y: 0.36 },
      sample: { title: 'Sepanjang jalan ini', subtitle: 'menyusuri pantai, hutan, dan senja' }
    },
    {
      id: 'sunday', name: 'Sunday Feeling', category: 'lifestyle',
      bg: '#141210', overlay: { type: 'dark', opacity: 0.3, vignette: 0.4, blur: 0, tint: 'sepia', tintAlpha: 0.25 },
      decor: {},
      title: { font: 'DM Serif Display', size: 100, weight: 400, letterSpacing: 0, lineHeight: 1.1, align: 'left', color: '#F7EFE3', opacity: 1, case: 'none', x: 0.08, y: 0.16 },
      subtitle: { font: 'Inter', size: 26, weight: 400, letterSpacing: 3, lineHeight: 1.7, align: 'left', color: 'rgba(247,239,227,0.7)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3 },
      sample: { title: 'Sunday, slowly', subtitle: 'SLOW MORNINGS & WARM COFFEE' }
    },
    {
      id: 'food', name: 'Food Diary', category: 'lifestyle',
      bg: '#0C0E0D', overlay: { type: 'dark', opacity: 0.4, vignette: 0.5, blur: 0, tint: 'warm', tintAlpha: 0.35 },
      decor: { pill: true, pillText: 'FOOD DIARY' },
      title: { font: 'Poppins', size: 104, weight: 700, letterSpacing: -1, lineHeight: 1.05, align: 'left', color: '#FFF7EC', opacity: 1, case: 'none', x: 0.08, y: 0.16, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 26, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 27, weight: 500, letterSpacing: 2, lineHeight: 1.6, align: 'left', color: 'rgba(255,247,236,0.8)', opacity: 1, case: 'none', x: 0.08, y: 0.3 },
      sample: { title: 'Rasa Nusantara', subtitle: 'manis, pedas, dan cerita di meja makan' }
    },
    {
      id: 'homegrown', name: 'Homegrown', category: 'lifestyle',
      bg: '#F2EFE7', overlay: { type: 'none', opacity: 0, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Playfair Display', size: 96, weight: 500, letterSpacing: 0, lineHeight: 1.15, align: 'left', color: '#1C1C18', opacity: 1, case: 'none', x: 0.08, y: 0.16 },
      subtitle: { font: 'Inter', size: 24, weight: 400, letterSpacing: 3, lineHeight: 1.7, align: 'left', color: '#7A766B', opacity: 1, case: 'uppercase', x: 0.08, y: 0.31 },
      sample: { title: 'Homegrown', subtitle: 'GROWN SLOWLY, WITH LOVE' }
    },

    /* ---------- PRODUCT ---------- */
    {
      id: 'product', name: 'Product Shot', category: 'product',
      bg: '#0F0F12', overlay: { type: 'dark', opacity: 0.35, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'NEW IN' },
      title: { font: 'Space Grotesk', size: 104, weight: 700, letterSpacing: -1, lineHeight: 1.05, align: 'center', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.5, y: 0.22, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 28, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'center', color: 'rgba(255,255,255,0.75)', opacity: 1, case: 'uppercase', x: 0.5, y: 0.36 },
      sample: { title: 'The Everyday Bag', subtitle: 'CRAFTED TO LAST A DECADE' }
    },
    {
      id: 'product-min', name: 'Product Minimal', category: 'product',
      bg: '#EFEDE7', overlay: { type: 'none', opacity: 0, vignette: 0.12, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'DM Serif Display', size: 84, weight: 400, letterSpacing: 0, lineHeight: 1.2, align: 'left', color: '#191919', opacity: 1, case: 'none', x: 0.08, y: 0.2 },
      subtitle: { font: 'Inter', size: 24, weight: 500, letterSpacing: 4, lineHeight: 1.6, align: 'left', color: '#6E6E66', opacity: 1, case: 'uppercase', x: 0.08, y: 0.34 },
      sample: { title: 'Aroma N°1', subtitle: 'ESPRESSO · CEDAR · SALT' }
    },

    /* ---------- PROMO ---------- */
    {
      id: 'sale', name: 'Big Sale', category: 'promo',
      bg: '#0C0C0E', overlay: { type: 'dark', opacity: 0.5, vignette: 0.5, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'LIMITED TIME' },
      title: { font: 'Bebas Neue', size: 240, weight: 400, letterSpacing: 2, lineHeight: 0.9, align: 'center', color: '#FF5A36', opacity: 1, case: 'none', x: 0.5, y: 0.42, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 30, offsetX: 0, offsetY: 6 } },
      subtitle: { font: 'Inter', size: 30, weight: 600, letterSpacing: 6, lineHeight: 1.6, align: 'center', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.5, y: 0.6 },
      sample: { title: 'SALE', subtitle: 'UP TO 50% OFF · THIS WEEK ONLY' }
    },
    {
      id: 'launch', name: 'Launch Day', category: 'promo',
      bg: '#0D0E12', overlay: { type: 'dark', opacity: 0.45, vignette: 0.5, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'DROP 01' },
      title: { font: 'Space Grotesk', size: 108, weight: 700, letterSpacing: 0, lineHeight: 1.05, align: 'left', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.08, y: 0.18, shadow: { enabled: true, color: 'rgba(0,0,0,0.55)', blur: 26, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 27, weight: 500, letterSpacing: 4, lineHeight: 1.6, align: 'left', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.08, y: 0.32 },
      sample: { title: 'Something New', subtitle: 'LAUNCHING FRIDAY 09:00' }
    },
    {
      id: 'story-highlight', name: 'Story Highlight', category: 'promo',
      bg: '#0F0F12', overlay: { type: 'dark', opacity: 0.4, vignette: 0.4, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: false },
      title: { font: 'Poppins', size: 88, weight: 600, letterSpacing: 0, lineHeight: 1.15, align: 'center', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.5, y: 0.34 },
      subtitle: { font: 'Inter', size: 24, weight: 400, letterSpacing: 4, lineHeight: 1.7, align: 'center', color: 'rgba(255,255,255,0.7)', opacity: 1, case: 'uppercase', x: 0.5, y: 0.5 },
      sample: { title: 'Tips & Tricks', subtitle: 'TAP TO EXPLORE' }
    },
    {
      id: 'newsletter', name: 'Join Now', category: 'promo',
      bg: '#101014', overlay: { type: 'dark', opacity: 0.4, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'FREE GUIDE' },
      title: { font: 'DM Serif Display', size: 92, weight: 400, letterSpacing: 0, lineHeight: 1.15, align: 'left', color: '#F7F4ED', opacity: 1, case: 'none', x: 0.08, y: 0.18 },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.08, y: 0.32 },
      sample: { title: 'Start growing', subtitle: 'GET THE FREE 30-DAY GUIDE' }
    },

    /* ---------- TYPOGRAPHY ---------- */
    {
      id: 'typography', name: 'Big Type', category: 'typography',
      bg: '#0C0C0E', overlay: { type: 'none', opacity: 0, vignette: 0.2, blur: 0, tint: null, tintAlpha: 0 },
      decor: { accentLine: true },
      title: { font: 'Bebas Neue', size: 220, weight: 400, letterSpacing: 1, lineHeight: 0.88, align: 'center', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.5, y: 0.45 },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 8, lineHeight: 1.6, align: 'center', color: 'rgba(255,255,255,0.55)', opacity: 1, case: 'uppercase', x: 0.5, y: 0.6 },
      sample: { title: 'TYPE', subtitle: 'SPEAKS LOUDER' }
    },
    {
      id: 'serif-poem', name: 'Serif Poem', category: 'typography',
      bg: '#F4F1EA', overlay: { type: 'none', opacity: 0, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Playfair Display', size: 92, weight: 500, letterSpacing: 0, lineHeight: 1.3, align: 'left', color: '#1D1B17', opacity: 1, case: 'none', x: 0.1, y: 0.18 },
      subtitle: { font: 'Inter', size: 24, weight: 400, letterSpacing: 4, lineHeight: 1.8, align: 'left', color: '#8C877C', opacity: 1, case: 'uppercase', x: 0.1, y: 0.45 },
      sample: { title: 'Rumah adalah tempat pulang', subtitle: 'SEBUAH CATATAN KECIL' }
    },

    /* ---------- SPECIAL ---------- */
    {
      id: 'fashion', name: 'Fashion', category: 'special',
      bg: '#0A0A0C', overlay: { type: 'dark', opacity: 0.4, vignette: 0.5, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Playfair Display', size: 100, weight: 500, lineHeight: 1.1, letterSpacing: 0, align: 'left', color: '#F5F1E8', opacity: 1, case: 'none', x: 0.08, y: 0.16, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 26, offsetX: 0, offsetY: 4 } },
      subtitle: { font: 'Inter', size: 26, weight: 400, letterSpacing: 6, lineHeight: 1.6, align: 'left', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3 },
      sample: { title: 'Autumn in Paris', subtitle: 'COLLECTION AW 26' }
    },
    {
      id: 'music', name: 'On Repeat', category: 'special',
      bg: '#0D0C10', overlay: { type: 'dark', opacity: 0.45, vignette: 0.5, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'ON REPEAT' },
      title: { font: 'Oswald', size: 118, weight: 600, letterSpacing: 2, lineHeight: 1.05, align: 'left', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.08, y: 0.18, shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 28, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 27, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: 'rgba(255,255,255,0.75)', opacity: 1, case: 'none', x: 0.08, y: 0.32 },
      sample: { title: 'Late Night Mix', subtitle: 'VOL. 7 — lo-fi, jazz & rain' }
    },
    {
      id: 'fitness', name: 'Train Hard', category: 'special',
      bg: '#0B0B0D', overlay: { type: 'dark', opacity: 0.5, vignette: 0.55, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Oswald', size: 150, weight: 700, letterSpacing: 4, lineHeight: 0.95, align: 'left', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.08, y: 0.28, shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 30, offsetX: 0, offsetY: 6 } },
      subtitle: { font: 'Inter', size: 28, weight: 600, letterSpacing: 6, lineHeight: 1.6, align: 'left', color: '#FF5A36', opacity: 1, case: 'uppercase', x: 0.08, y: 0.46 },
      sample: { title: 'DAY 04', subtitle: 'PUSH YOUR LIMITS' }
    },
    {
      id: 'birthday', name: 'Celebrate', category: 'special',
      bg: '#0F0E13', overlay: { type: 'dark', opacity: 0.4, vignette: 0.4, blur: 0, tint: null, tintAlpha: 0 },
      decor: { pill: true, pillText: 'A SPECIAL DAY' },
      title: { font: 'Poppins', size: 104, weight: 700, letterSpacing: 0, lineHeight: 1.1, align: 'center', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.5, y: 0.22, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 28, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'center', color: '#FFD166', opacity: 1, case: 'uppercase', x: 0.5, y: 0.35 },
      sample: { title: 'Happy Birthday', subtitle: 'CELEBRATING YOU TODAY' }
    },

    /* ---------- GOVERNMENT / OFFICIAL ---------- */
    {
      id: 'government-official', name: 'Official Service', category: 'official',
      bg: '#0E2440', overlay: { type: 'dark', opacity: 0.22, vignette: 0.42, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Montserrat', size: 102, weight: 700, letterSpacing: 1, lineHeight: 1.08, align: 'left', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.08, y: 0.2, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 28, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 26, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: 'rgba(255,255,255,0.78)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.35 },
      elements: [
        { type: 'badge', text: 'RESMI', x: 0.12, y: 0.07, scale: 0.9, rotation: 0, color: '#C9A227', opacity: 1 },
        { type: 'shape', shape: 'frame', x: 0.9, y: 0.9, scale: 0.5, rotation: 0, color: '#C9A227', opacity: 0.85 }
      ],
      sample: { title: 'Layanan Publik', subtitle: 'PELAYANAN PRIMA · MUDAH · CEPAT · TERPERCAYA' }
    },
    {
      id: 'government-announcement', name: 'Official Notice', category: 'official',
      bg: '#A51C24', overlay: { type: 'dark', opacity: 0.18, vignette: 0.4, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Playfair Display', size: 96, weight: 600, letterSpacing: 0, lineHeight: 1.15, align: 'left', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.08, y: 0.2, shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 24, offsetX: 0, offsetY: 4 } },
      subtitle: { font: 'Montserrat', size: 25, weight: 600, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: 'rgba(255,255,255,0.88)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.34 },
      elements: [
        { type: 'badge', text: 'PENGUMUMAN', x: 0.12, y: 0.07, scale: 0.78, rotation: 0, color: '#C9A227', opacity: 1 }
      ],
      sample: { title: 'Perhatian warga', subtitle: 'PENGUMUMAN RESMI — MOHON DIBACA DENGAN SEKSAMA' }
    },
    {
      id: 'government-program', name: 'Public Program', category: 'official',
      bg: '#F6F3EC', overlay: { type: 'none', opacity: 0, vignette: 0.08, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Montserrat', size: 94, weight: 700, letterSpacing: 0, lineHeight: 1.1, align: 'left', color: '#0F2440', opacity: 1, case: 'uppercase', x: 0.08, y: 0.18 },
      subtitle: { font: 'Inter', size: 24, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: '#5A6472', opacity: 1, case: 'uppercase', x: 0.08, y: 0.32 },
      elements: [
        { type: 'badge', text: 'PROGRAM', x: 0.12, y: 0.06, scale: 0.85, rotation: 0, color: '#12314E', opacity: 1 },
        { type: 'shape', shape: 'circle', x: 0.92, y: 0.1, scale: 0.1, rotation: 0, color: '#C9A227', opacity: 0.9 }
      ],
      sample: { title: 'Program Bantuan', subtitle: 'SASARAN · SYARAT · JADWAL PENDAFTARAN' }
    },
    {
      id: 'government-schedule', name: 'Service Hours', category: 'official',
      bg: '#0F2A3E', overlay: { type: 'dark', opacity: 0.25, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Oswald', size: 130, weight: 600, letterSpacing: 2, lineHeight: 1.02, align: 'center', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.5, y: 0.3, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 30, offsetX: 0, offsetY: 6 } },
      subtitle: { font: 'Montserrat', size: 26, weight: 600, letterSpacing: 5, lineHeight: 1.6, align: 'center', color: '#C9A227', opacity: 1, case: 'uppercase', x: 0.5, y: 0.5 },
      elements: [
        { type: 'badge', text: 'JADWAL', x: 0.5, y: 0.08, scale: 0.9, rotation: 0, color: '#C9A227', opacity: 1 }
      ],
      sample: { title: '08.00 – 16.00', subtitle: 'JAM PELAYANAN · SENIN – JUMAT' }
    },
    {
      id: 'government-report', name: 'Public Report', category: 'official',
      bg: '#123D2E', overlay: { type: 'dark', opacity: 0.2, vignette: 0.42, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Playfair Display', size: 104, weight: 500, letterSpacing: 0, lineHeight: 1.1, align: 'left', color: '#F3EFE4', opacity: 1, case: 'none', x: 0.08, y: 0.2 },
      subtitle: { font: 'Inter', size: 24, weight: 500, letterSpacing: 3, lineHeight: 1.6, align: 'left', color: 'rgba(243,239,228,0.72)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.34 },
      elements: [
        { type: 'badge', text: 'LAPORAN', x: 0.12, y: 0.07, scale: 0.85, rotation: 0, color: '#C9A227', opacity: 1 }
      ],
      sample: { title: 'Laporan Publik', subtitle: 'TAHUN 2026 · TRANSPARANSI & AKUNTABILITAS' }
    },
    {
      id: 'government-education', name: 'Public Education', category: 'official',
      bg: '#FBFBF7', overlay: { type: 'none', opacity: 0, vignette: 0.05, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Montserrat', size: 90, weight: 700, letterSpacing: 0, lineHeight: 1.15, align: 'center', color: '#0F2440', opacity: 1, case: 'none', x: 0.5, y: 0.22 },
      subtitle: { font: 'Inter', size: 24, weight: 500, letterSpacing: 4, lineHeight: 1.6, align: 'center', color: '#4A5568', opacity: 1, case: 'uppercase', x: 0.5, y: 0.37 },
      elements: [
        { type: 'badge', text: 'INFO PUBLIK', x: 0.5, y: 0.07, scale: 0.85, rotation: 0, color: '#0F2440', opacity: 1 }
      ],
      sample: { title: 'Cegah, Kenali, Tangani', subtitle: 'SOSIALISASI & EDUKASI PUBLIK' }
    },
    {
      id: 'government-emergency', name: 'Important Notice', category: 'official',
      bg: '#C62828', overlay: { type: 'dark', opacity: 0.15, vignette: 0.38, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Oswald', size: 120, weight: 700, letterSpacing: 3, lineHeight: 1, align: 'left', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.08, y: 0.2, shadow: { enabled: true, color: 'rgba(0,0,0,0.45)', blur: 26, offsetX: 0, offsetY: 5 } },
      subtitle: { font: 'Inter', size: 26, weight: 600, letterSpacing: 2, lineHeight: 1.6, align: 'left', color: 'rgba(255,255,255,0.92)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.35 },
      elements: [
        { type: 'badge', text: 'PERHATIAN', x: 0.12, y: 0.07, scale: 0.85, rotation: 0, color: '#1A1A1A', opacity: 1 }
      ],
      sample: { title: 'Info Penting', subtitle: 'JADWAL GILIRAN PETUGAS · 1–7 SEPTEMBER 2026' }
    },
    {
      id: 'government-events', name: 'Official Event', category: 'official',
      bg: '#101A2C', overlay: { type: 'dark', opacity: 0.22, vignette: 0.42, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Playfair Display', size: 100, weight: 500, letterSpacing: 0, lineHeight: 1.15, align: 'left', color: '#F5F1E8', opacity: 1, case: 'none', x: 0.08, y: 0.2 },
      subtitle: { font: 'Montserrat', size: 25, weight: 600, letterSpacing: 4, lineHeight: 1.6, align: 'left', color: '#C9A227', opacity: 1, case: 'uppercase', x: 0.08, y: 0.35 },
      elements: [
        { type: 'badge', text: 'ACARA RESMI', x: 0.12, y: 0.07, scale: 0.78, rotation: 0, color: '#C9A227', opacity: 1 },
        { type: 'shape', shape: 'frame', x: 0.9, y: 0.1, scale: 0.45, rotation: 0, color: '#C9A227', opacity: 0.9 }
      ],
      sample: { title: 'Selamat Datang', subtitle: 'ACARA RESMI · UPACARA PERINGATAN' }
    },
    {
      id: 'government-contact', name: 'Service Contact', category: 'official',
      bg: '#FFFFFF', overlay: { type: 'none', opacity: 0, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Montserrat', size: 90, weight: 700, letterSpacing: 0, lineHeight: 1.12, align: 'left', color: '#101A2C', opacity: 1, case: 'none', x: 0.08, y: 0.22 },
      subtitle: { font: 'Inter', size: 27, weight: 400, letterSpacing: 0, lineHeight: 1.7, align: 'left', color: '#4A5568', opacity: 1, case: 'none', x: 0.08, y: 0.37 },
      elements: [
        { type: 'badge', text: 'KONTAK', x: 0.12, y: 0.07, scale: 0.85, rotation: 0, color: '#12314E', opacity: 1 },
        { type: 'shape', shape: 'circle', x: 0.92, y: 0.1, scale: 0.1, rotation: 0, color: '#C9A227', opacity: 0.9 }
      ],
      sample: { title: 'Hubungi Kami', subtitle: 'Call center 1500-XXX · halo@lembaga.go.id' }
    },
    {
      id: 'government-policy', name: 'Policy & Regulation', category: 'official',
      bg: '#0B1B2B', overlay: { type: 'dark', opacity: 0.25, vignette: 0.42, blur: 0, tint: null, tintAlpha: 0 },
      decor: {},
      title: { font: 'Montserrat', size: 82, weight: 700, letterSpacing: 2, lineHeight: 1.12, align: 'center', color: '#FFFFFF', opacity: 1, case: 'uppercase', x: 0.5, y: 0.24 },
      subtitle: { font: 'Inter', size: 25, weight: 500, letterSpacing: 4, lineHeight: 1.6, align: 'center', color: 'rgba(255,255,255,0.78)', opacity: 1, case: 'uppercase', x: 0.5, y: 0.4 },
      elements: [
        { type: 'badge', text: 'REGULASI', x: 0.5, y: 0.07, scale: 0.85, rotation: 0, color: '#C9A227', opacity: 1 },
        { type: 'shape', shape: 'frame', x: 0.5, y: 0.93, scale: 0.5, rotation: 0, color: '#C9A227', opacity: 0.8 }
      ],
      sample: { title: 'Ketentuan Layanan', subtitle: 'KEBIJAKAN PRIVASI · SYARAT & KETENTUAN' }
    }
  ];

  function getTemplate(id) {
    return TEMPLATES.find(function (t) { return t.id === id; });
  }

  /* default layers (used before any template, on reset) */
  function defaultTitle() {
    return {
      font: 'Space Grotesk', size: 104, weight: 700, letterSpacing: 0, lineHeight: 1.1,
      align: 'left', color: '#FFFFFF', opacity: 1, case: 'none', x: 0.08, y: 0.16,
      gradient: null, shadow: { enabled: false, color: '#000000', blur: 24, offsetX: 0, offsetY: 6 }, outline: null
    };
  }
  function defaultSubtitle() {
    return {
      font: 'Inter', size: 28, weight: 500, letterSpacing: 4, lineHeight: 1.6,
      align: 'left', color: 'rgba(255,255,255,0.75)', opacity: 1, case: 'uppercase', x: 0.08, y: 0.3,
      gradient: null, shadow: { enabled: false, color: '#000000', blur: 18, offsetX: 0, offsetY: 4 }, outline: null
    };
  }

  function cloneLayer(L) {
    return {
      font: L.font, size: L.size, weight: L.weight, letterSpacing: L.letterSpacing,
      lineHeight: L.lineHeight, align: L.align, color: L.color, opacity: L.opacity,
      case: L.case, x: L.x, y: L.y,
      gradient: L.gradient ? { colors: L.gradient.colors.slice(), angle: L.gradient.angle } : null,
      shadow: L.shadow ? Object.assign({}, L.shadow) : null,
      outline: L.outline ? Object.assign({}, L.outline) : null
    };
  }

  function cloneElement(E) {
    return {
      type: E.type, emoji: E.emoji || null, shape: E.shape || null, text: E.text || null,
      x: E.x, y: E.y, scale: E.scale, rotation: E.rotation || 0,
      color: E.color, opacity: E.opacity != null ? E.opacity : 1
    };
  }

  /* Apply a template onto the state (keeps user's typed text if any) */
  function applyTemplateToState(state, id) {
    const tpl = getTemplate(id);
    if (!tpl) return false;
    const S = state;
    S.templateId = id;
    S.bgColor = tpl.bg;
    S.overlay = Object.assign({}, tpl.overlay);
    S.decor = Object.assign({}, tpl.decor);
    const oldTitle = S.title && S.title.text ? S.title.text : '';
    const oldSub = S.subtitle && S.subtitle.text ? S.subtitle.text : '';
    S.title = cloneLayer(tpl.title);
    S.subtitle = cloneLayer(tpl.subtitle);
    S.title.text = oldTitle || tpl.sample.title;
    S.subtitle.text = oldSub || tpl.sample.subtitle;
    S.elements = (tpl.elements || []).map(cloneElement);
    S.activeElement = -1;
    return true;
  }

  /* ---------------- position presets ---------------- */
  const POSITIONS = {
    'top-left': { x: 0.08, y: 0.12, align: 'left' },
    'top-center': { x: 0.5, y: 0.12, align: 'center' },
    'top-right': { x: 0.92, y: 0.12, align: 'right' },
    'mid-left': { x: 0.08, y: 0.5, align: 'left' },
    center: { x: 0.5, y: 0.5, align: 'center' },
    'mid-right': { x: 0.92, y: 0.5, align: 'right' },
    'bottom-left': { x: 0.08, y: 0.86, align: 'left' },
    'bottom-center': { x: 0.5, y: 0.86, align: 'center' },
    'bottom-right': { x: 0.92, y: 0.86, align: 'right' }
  };

  /* ---------------- sticker / element palette ---------------- */
  const ELEMENTS = [
    { id: 'emoji-fire', type: 'emoji', emoji: '🔥', label: 'Fire' },
    { id: 'emoji-sparkles', type: 'emoji', emoji: '✨', label: 'Sparkles' },
    { id: 'emoji-heart', type: 'emoji', emoji: '❤️', label: 'Heart' },
    { id: 'emoji-star', type: 'emoji', emoji: '⭐', label: 'Star' },
    { id: 'emoji-crown', type: 'emoji', emoji: '👑', label: 'Crown' },
    { id: 'emoji-camera', type: 'emoji', emoji: '📸', label: 'Camera' },
    { id: 'emoji-cinema', type: 'emoji', emoji: '🎬', label: 'Cinema' },
    { id: 'emoji-plane', type: 'emoji', emoji: '✈️', label: 'Plane' },
    { id: 'emoji-coffee', type: 'emoji', emoji: '☕', label: 'Coffee' },
    { id: 'emoji-trophy', type: 'emoji', emoji: '🏆', label: 'Trophy' },
    { id: 'emoji-rocket', type: 'emoji', emoji: '🚀', label: 'Rocket' },
    { id: 'emoji-flower', type: 'emoji', emoji: '🌸', label: 'Flower' },
    { id: 'emoji-flag', type: 'emoji', emoji: '🏁', label: 'Flag' },
    { id: 'emoji-check', type: 'emoji', emoji: '✅', label: 'Check' },
    { id: 'shape-circle', type: 'shape', shape: 'circle', label: 'Circle' },
    { id: 'shape-oval', type: 'shape', shape: 'oval', label: 'Oval' },
    { id: 'shape-star', type: 'shape', shape: 'star', label: 'Star Shape' },
    { id: 'shape-arrow', type: 'shape', shape: 'arrow', label: 'Arrow' },
    { id: 'shape-frame', type: 'shape', shape: 'frame', label: 'Frame' },
    { id: 'shape-zigzag', type: 'shape', shape: 'zigzag', label: 'Zigzag' },
    { id: 'badge-new', type: 'badge', text: 'NEW', label: 'NEW' },
    { id: 'badge-sale', type: 'badge', text: 'SALE', label: 'SALE' },
    { id: 'badge-hot', type: 'badge', text: 'HOT', label: 'HOT' },
    { id: 'badge-special', type: 'badge', text: 'SPECIAL', label: 'SPECIAL' },
    { id: 'badge-tutorial', type: 'badge', text: 'TUTORIAL', label: 'TUTORIAL' },
    { id: 'badge-vlog', type: 'badge', text: 'VLOG', label: 'VLOG' }
  ];

  function getElementDef(id) {
    return ELEMENTS.find(function (e) { return e.id === id; });
  }

  function makeElement(def) {
    return {
      type: def.type,
      emoji: def.emoji || null,
      shape: def.shape || null,
      text: def.text || null,
      x: 0.5, y: 0.5, scale: 1, rotation: 0,
      color: def.type === 'badge' ? '#FF5A36' : '#FFFFFF',
      opacity: 1
    };
  }

  /* ---------------- smart title ideas (local dictionary) ---------------- */
  const TITLE_IDEAS = {
    travel: {
      keys: ['jalan', 'pulang', 'pergi', 'libur', 'beach', 'pantai', 'gunung', 'sunset', 'senja', 'petualang', 'mudik', 'pasar', 'pulau', 'pesawat', 'berangkat', 'peta', 'destinasi', 'pengembara'],
      titles: ['SEPANJANG JALAN INI', 'JALAN PULANG', 'ADA CERITA DI SETIAP LANGKAH', 'SORE YANG TERTINGGAL', 'PULANG, TAPI TIDAK SELALU SAMA', 'LANGKAH KECIL KE TEMPAT JAUH', 'DI UJUNG SENJA', 'PERJALANAN YANG TIDAK DIRENCANAKAN']
    },
    street: {
      keys: ['kota', 'malam', 'neon', 'kafe', 'lampu', 'stasiun', 'kereta', 'gang', 'sepeda', 'hujan', 'ramai', 'senyap', 'jalan', 'trotoar'],
      titles: ['CITY AFTER DARK', 'NEON RAIN', 'GANG YANG SEPI', 'KOTA TIDAK TIDUR', 'LAMPU-LAMPU KECIL', 'DI PERSIMPANGAN', 'JALAN YANG BERBICARA', 'MALAM PERTAMA DI KOTA INI']
    },
    cinematic: {
      keys: ['sore', 'senja', 'hujan', 'bayang', 'matahari', 'cahaya', 'kabut', 'gelap', 'film', 'moody', 'suasana', 'diam', 'sendiri', 'biru', 'kuning', 'jingga', 'pagi', 'senyap', 'langit', 'golden'],
      titles: ['SCENE 01', 'A LIGHT IN THE DARK', 'SORE YANG PERLAHAN', 'SEBAGIAN LANGIT', 'BAYANG YANG TINGGAL', 'KABUT DI UJUNG JALAN', 'SUNSET UNTUK KAMU', 'THE LAST FRAME']
    },
    lifestyle: {
      keys: ['kopi', 'cafe', 'sarapan', 'buku', 'musik', 'rumah', 'libur', 'minggu', 'santai', 'teman', 'jalan-jalan', 'hari', 'hangat', 'senyum', 'bunga', 'slow', 'sunday', 'pagi'],
      titles: ['SUNDAY FEELING', 'SECANGKIR KOPI', 'HARI YANG LAMBAT', 'HIDUP YANG SEDERHANA', 'MOMENT YANG KECIL', 'RITUAL PAGI', 'JALAN-JALAN TANPA TUJUAN', 'RASA YANG TERSISA']
    },
    food: {
      keys: ['makan', 'nasi', 'mie', 'roti', 'manis', 'pedas', 'dapur', 'kue', 'sate', 'bakso', 'gulai', 'sambal', 'teh', 'jus', 'seblak', 'noodles', 'brunch'],
      titles: ['SELERA KOTA', 'RASA NUSANTARA', 'DARI DAPUR', 'SEDAPNYA HIDUP', 'RECIPE OF THE DAY', 'MANIS, PEDAS, DAN CERITA', 'MEJA MAKAN KITA']
    },
    nature: {
      keys: ['gunung', 'hutan', 'awan', 'pohon', 'daun', 'sungai', 'danau', 'angin', 'sejuk', 'hijau', 'sawah', 'bukit', 'langit', 'pantai', 'alam', 'embun', 'kabut'],
      titles: ['KEMBALI KE ALAM', 'NAPAS HIJAU', 'DI BAWAH LANGIT', 'SUARA DAUN', 'BUKIT YANG BERNAPAS', 'PULANG KE HUTAN', 'SEJUK YANG LANGKA']
    },
    personal: {
      keys: ['aku', 'kamu', 'kita', 'hidup', 'cerita', 'kenangan', 'rumah', 'pulang', 'rasa', 'perasaan', 'masa', 'waktu', 'tumbuh', 'belajar', 'luka', 'takut', 'harap', 'impian', 'mimpi', 'kembali'],
      titles: ['UNTUK AKU YANG LAMA', 'HIDUP YANG SEDANG DIBANGUN', 'KENANGAN YANG TERSIMPAN', 'RUMAH, BUKAN HANYA TEMPAT', 'WAKTU YANG MENYEMBUHKAN', 'CERITA YANG BELUM SELESAI', 'BELAJAR LEPAS', 'KITA, PERLAHAN']
    },
    quote: {
      keys: ['kata', 'mutiara', 'kutipan', 'quote', 'bijak', 'inspirasi', 'motivasi', 'semangat', 'percaya', 'berani', 'fokus', 'pikiran', 'jangan', 'tetap', 'mulai', 'selesai', 'berhenti', 'berharap'],
      titles: ['BERANI MULAI DARI NOL', 'FOKUS PADA LANGKAH BERIKUTNYA', 'MIMPI TANPA BATAS', 'KONSTANSI MENGALAHKAN BAKAT', 'JANGAN MENYERAH SEBELUM MENCOBA', 'JADI DIRI SENDIRI', 'HARI INI, SATU LANGKAH LAGI']
    },
    promo: {
      keys: ['sale', 'promo', 'diskon', 'obral', 'murah', 'diskon', 'beli', 'terbatas', 'baru', 'launch', 'drop', 'deal', 'tawaran', 'harga'],
      titles: ['BIG SALE NOW', 'UP TO 50% OFF', 'NEW DROP', 'LIMITED TIME ONLY', 'DON\u2019T MISS OUT', 'SEASON SALE', 'LAST CHANCE']
    }
  };

  function generateTitleIdeas(input) {
    const words = String(input || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const matched = [];
    Object.keys(TITLE_IDEAS).forEach(function (cat) {
      const has = TITLE_IDEAS[cat].keys.some(function (k) { return words.indexOf(k) !== -1; });
      if (has) matched.push.apply(matched, TITLE_IDEAS[cat].titles);
    });
    const unique = [];
    matched.forEach(function (t) { if (unique.indexOf(t) === -1) unique.push(t); });
    return unique.slice(0, 12);
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Templates = {
    FONTS: FONTS,
    CATEGORIES: CATEGORIES,
    TEMPLATES: TEMPLATES,
    ELEMENTS: ELEMENTS,
    POSITIONS: POSITIONS,
    getTemplate: getTemplate,
    getElementDef: getElementDef,
    makeElement: makeElement,
    fontStack: fontStack,
    defaultTitle: defaultTitle,
    defaultSubtitle: defaultSubtitle,
    cloneLayer: cloneLayer,
    applyTemplateToState: applyTemplateToState,
    generateTitleIdeas: generateTitleIdeas
  };
})(window);
