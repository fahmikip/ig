/* ============================================================
   COVERLY — templates.js
   Template engine data: 12 templates, font presets,
   text position presets and a local "Smart Title Ideas" dictionary.
   ============================================================ */
(function (global) {
  'use strict';

  /* Font stacks used for canvas rendering + <select> options */
  const FONTS = [
    { id: 'Inter', name: 'Inter', stack: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" },
    { id: 'Poppins', name: 'Poppins', stack: "'Poppins', system-ui, sans-serif" },
    { id: 'Montserrat', name: 'Montserrat', stack: "'Montserrat', system-ui, sans-serif" },
    { id: 'Playfair Display', name: 'Playfair Display', stack: "'Playfair Display', Georgia, 'Times New Roman', serif" },
    { id: 'Bebas Neue', name: 'Bebas Neue', stack: "'Bebas Neue', 'Arial Narrow', Impact, sans-serif" },
    { id: 'DM Sans', name: 'DM Sans', stack: "'DM Sans', system-ui, sans-serif" },
    { id: 'Space Grotesk', name: 'Space Grotesk', stack: "'Space Grotesk', system-ui, sans-serif" }
  ];

  function fontStack(id) {
    const f = FONTS.find(function (x) { return x.id === id; });
    return f ? f.stack : "'Inter', system-ui, sans-serif";
  }

  /* Normalized text position presets (x = align-anchor fraction, y = block center) */
  const POSITIONS = {
    'top-left': { x: 0.08, y: 0.16, align: 'left' },
    'top-center': { x: 0.5, y: 0.16, align: 'center' },
    'top-right': { x: 0.92, y: 0.16, align: 'right' },
    'center': { x: 0.5, y: 0.5, align: 'center' },
    'bottom-left': { x: 0.08, y: 0.84, align: 'left' },
    'bottom-center': { x: 0.5, y: 0.84, align: 'center' },
    'bottom-right': { x: 0.92, y: 0.84, align: 'right' }
  };

  function pos(key) {
    return Object.assign({}, POSITIONS[key] || POSITIONS['center']);
  }

  /* ------------------------------------------------------------
     Templates
     ------------------------------------------------------------ */
  const TEMPLATES = [
    {
      id: 'cinematic-dark',
      name: 'Cinematic Dark',
      category: 'cinematic',
      bg: '#0c0c0e',
      title: Object.assign(pos('bottom-left'), {
        text: 'The Road Home', font: 'Bebas Neue', size: 148, weight: 400,
        letterSpacing: 6, lineHeight: 1.02, color: '#ffffff', opacity: 1, case: 'uppercase'
      }),
      subtitle: Object.assign(pos('bottom-left'), {
        text: 'A quiet journey through the valley', font: 'Inter', size: 30, weight: 500,
        letterSpacing: 4, lineHeight: 1.5, color: '#ffffff', opacity: 0.75, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.5, vignette: 0.45, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: false, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'film-frame',
      name: 'Film Frame',
      category: 'cinematic',
      bg: '#050505',
      title: Object.assign(pos('center'), {
        text: 'Afterglow', font: 'Space Grotesk', size: 96, weight: 600,
        letterSpacing: 14, lineHeight: 1.15, color: '#f4f4f1', opacity: 1, case: 'uppercase'
      }),
      subtitle: Object.assign(pos('center'), {
        text: 'GOLDEN HOUR · 2026', font: 'DM Sans', size: 24, weight: 500,
        letterSpacing: 6, lineHeight: 1.5, color: '#ffffff', opacity: 0.7, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.32, vignette: 0.6, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: true, grain: true, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'minimal-white',
      name: 'Minimal White',
      category: 'minimal',
      bg: '#f4f4f0',
      title: Object.assign(pos('top-left'), {
        text: 'Less, but better', font: 'Space Grotesk', size: 72, weight: 600,
        letterSpacing: -1, lineHeight: 1.12, color: '#111111', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('bottom-left'), {
        text: 'A minimal study in form', font: 'Inter', size: 24, weight: 400,
        letterSpacing: 1, lineHeight: 1.6, color: '#555555', opacity: 1, case: 'none'
      }),
      overlay: { type: 'light', opacity: 0.35, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: false, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'editorial',
      name: 'Editorial',
      category: 'editorial',
      bg: '#101012',
      title: Object.assign(pos('top-left'), {
        text: 'The Quiet Hours', font: 'Playfair Display', size: 88, weight: 600,
        letterSpacing: 0, lineHeight: 1.05, color: '#f7f5f0', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('bottom-right'), {
        text: 'STORIES FROM THE MARGIN — ISSUE 04', font: 'Montserrat', size: 24, weight: 600,
        letterSpacing: 4, lineHeight: 1.6, color: '#f7f5f0', opacity: 0.6, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.4, vignette: 0.3, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: false, accentLine: true, pill: false, pillText: '' }
    },
    {
      id: 'street-night',
      name: 'Street Night',
      category: 'street',
      bg: '#0a0a0c',
      title: Object.assign(pos('bottom-left'), {
        text: 'City After Dark', font: 'Bebas Neue', size: 168, weight: 400,
        letterSpacing: 4, lineHeight: 1, color: '#ff4a2e', opacity: 1, case: 'uppercase'
      }),
      subtitle: Object.assign(pos('bottom-left'), {
        text: 'NEON RAIN · 2:00 AM', font: 'Montserrat', size: 28, weight: 600,
        letterSpacing: 6, lineHeight: 1.6, color: '#ffffff', opacity: 0.85, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.55, vignette: 0.65, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: true, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'travel-journal',
      name: 'Travel Journal',
      category: 'travel',
      bg: '#0e0e10',
      title: Object.assign(pos('center'), {
        text: 'Escape the ordinary', font: 'Playfair Display', size: 84, weight: 500,
        letterSpacing: 0, lineHeight: 1.15, color: '#ffffff', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('center'), {
        text: 'WANDER · EXPLORE · RETURN', font: 'Inter', size: 24, weight: 600,
        letterSpacing: 8, lineHeight: 1.6, color: '#ffffff', opacity: 0.75, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.3, vignette: 0.25, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: false, accentLine: false, pill: true, pillText: 'JOURNEY 001' }
    },
    {
      id: 'analog-film',
      name: 'Analog Film',
      category: 'analog',
      bg: '#141210',
      title: Object.assign(pos('top-left'), {
        text: 'Summer memories', font: 'Playfair Display', size: 76, weight: 500,
        letterSpacing: 0, lineHeight: 1.1, color: '#f1e8d8', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('top-left'), {
        text: '35mm · found on the floor', font: 'DM Sans', size: 24, weight: 400,
        letterSpacing: 2, lineHeight: 1.6, color: '#d8cbb6', opacity: 0.85, case: 'none'
      }),
      overlay: { type: 'dark', opacity: 0.2, vignette: 0.7, blur: 0, tint: '#c9a86a', tintAlpha: 0.18 },
      decor: { doodle: false, film: true, grain: true, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'bold-typography',
      name: 'Bold Typography',
      category: 'quote',
      bg: '#0d0d0f',
      title: Object.assign(pos('center'), {
        text: 'Make it loud', font: 'Bebas Neue', size: 220, weight: 400,
        letterSpacing: 6, lineHeight: 0.95, color: '#ffffff', opacity: 1, case: 'uppercase'
      }),
      subtitle: Object.assign(pos('center'), {
        text: 'IF YOU ARE GOING TO SAY IT, SAY IT', font: 'Montserrat', size: 24, weight: 500,
        letterSpacing: 6, lineHeight: 1.6, color: '#a9a9a4', opacity: 1, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.42, vignette: 0.35, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: false, accentLine: true, pill: false, pillText: '' }
    },
    {
      id: 'clean-story',
      name: 'Clean Story',
      category: 'minimal',
      bg: '#e9e9e4',
      title: Object.assign(pos('top-left'), {
        text: 'A quiet morning', font: 'Playfair Display', size: 64, weight: 500,
        letterSpacing: 0, lineHeight: 1.2, color: '#151515', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('bottom-left'), {
        text: 'STORIES TOLD IN GOOD LIGHT', font: 'Inter', size: 22, weight: 600,
        letterSpacing: 5, lineHeight: 1.6, color: '#3f3f3a', opacity: 0.9, case: 'uppercase'
      }),
      overlay: { type: 'light', opacity: 0.3, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: false, film: false, grain: false, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'moody',
      name: 'Moody',
      category: 'cinematic',
      bg: '#08080a',
      title: Object.assign(pos('center'), {
        text: 'muted', font: 'Space Grotesk', size: 60, weight: 500,
        letterSpacing: 10, lineHeight: 1.2, color: '#f0f0ec', opacity: 0.9, case: 'lowercase'
      }),
      subtitle: Object.assign(pos('center'), {
        text: 'SOME LIGHT ONLY MAKES SENSE IN THE DARK', font: 'Inter', size: 22, weight: 500,
        letterSpacing: 6, lineHeight: 1.8, color: '#8f8f8a', opacity: 0.9, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.6, vignette: 0.8, blur: 6, tint: '#1a2433', tintAlpha: 0.25 },
      decor: { doodle: false, film: false, grain: true, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'doodle',
      name: 'Doodle',
      category: 'doodle',
      bg: '#f2f1ec',
      title: Object.assign(pos('top-left'), {
        text: 'Good things take time', font: 'DM Sans', size: 72, weight: 700,
        letterSpacing: -1, lineHeight: 1.15, color: '#161616', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('bottom-left'), {
        text: 'small steps, every day', font: 'DM Sans', size: 28, weight: 500,
        letterSpacing: 0, lineHeight: 1.5, color: '#6b6b66', opacity: 1, case: 'none'
      }),
      overlay: { type: 'light', opacity: 0.28, vignette: 0, blur: 0, tint: null, tintAlpha: 0 },
      decor: { doodle: true, film: false, grain: false, accentLine: false, pill: false, pillText: '' }
    },
    {
      id: 'vintage',
      name: 'Vintage',
      category: 'analog',
      bg: '#181410',
      title: Object.assign(pos('top-right'), {
        text: 'Golden days', font: 'Playfair Display', size: 84, weight: 500,
        letterSpacing: 0, lineHeight: 1.1, color: '#f3e6cd', opacity: 1, case: 'none'
      }),
      subtitle: Object.assign(pos('top-right'), {
        text: 'est. 1998', font: 'Montserrat', size: 24, weight: 500,
        letterSpacing: 6, lineHeight: 1.6, color: '#cbb279', opacity: 0.9, case: 'uppercase'
      }),
      overlay: { type: 'dark', opacity: 0.25, vignette: 0.75, blur: 0, tint: '#d8a86b', tintAlpha: 0.22 },
      decor: { doodle: false, film: true, grain: true, accentLine: false, pill: false, pillText: '' }
    }
  ];

  const CATEGORIES = ['all', 'cinematic', 'travel', 'street', 'minimal', 'editorial', 'analog', 'quote', 'doodle'];

  function getTemplate(id) {
    return TEMPLATES.find(function (t) { return t.id === id; });
  }

  function applyTemplateToState(state, id) {
    const tpl = getTemplate(id);
    if (!tpl) return false;
    const S = state;
    S.templateId = id;
    S.bgColor = tpl.bg;
    S.overlay = Object.assign({}, tpl.overlay);
    S.decor = Object.assign({}, tpl.decor);
    const oldTitleText = S.title.text;
    const oldSubText = S.subtitle.text;
    S.title = Object.assign({}, tpl.title);
    S.subtitle = Object.assign({}, tpl.subtitle);
    S.title.text = oldTitleText || '';
    S.subtitle.text = oldSubText || '';
    return true;
  }

  /* ------------------------------------------------------------
     Smart Title Ideas (local dictionary — no AI, no API)
     ------------------------------------------------------------ */
  const TITLE_IDEAS = {
    travel: {
      keys: ['jalan', 'pulang', 'pergi', 'libur', 'liburan', 'beach', 'pantai', 'gunung', 'sunset',
             'senja', 'petualang', 'mudik', 'pasar', 'jembatan', 'hutan', 'pulau', 'pesawat', 'berangkat', 'peta', 'destinasi', 'pengembara'],
      titles: ['SEPANJANG JALAN INI', 'JALAN PULANG', 'ADA CERITA DI SETIAP LANGKAH', 'SORE YANG TERTINGGAL',
               'PULANG, TAPI TIDAK SELALU SAMA', 'LANGKAH KECIL KE TEMPAT JAUH', 'DI UJUNG SENJA', 'PERJALANAN YANG TIDAK DIRENCANAKAN']
    },
    street: {
      keys: ['kota', 'malam', 'neon', 'kafe', 'lampu', 'stasiun', 'kereta', 'metro', 'tembok', 'gang',
             'sepeda', 'hujan', 'bundaran', 'kendaraan', 'motor', 'mobil', 'ramai', 'senyap', 'jalan', 'trotoar'],
      titles: ['CITY AFTER DARK', 'NEON RAIN', 'GANG YANG SEPI', 'KOTA TIDAK TIDUR', 'LAMPU-LAMPU KECIL',
               'DI PERSIMPANGAN', 'JALAN YANG BERBICARA', 'MALAM PERTAMA DI KOTA INI']
    },
    cinematic: {
      keys: ['sore', 'senja', 'hujan', 'bayang', 'matahari', 'cahaya', 'kabut', 'gelap', 'film', 'moody',
             'suasana', 'diam', 'sendiri', 'biru', 'kuning', 'jingga', 'pagi', 'senyap', 'langit', 'golden'],
      titles: ['SCENE 01', 'A LIGHT IN THE DARK', 'SORE YANG PERLAHAN', 'SEBAGIAN LANGIT', 'BAYANG YANG TINGGAL',
               'KABUT DI UJUNG JALAN', 'SUNSET UNTUK KAMU', 'THE LAST FRAME']
    },
    lifestyle: {
      keys: ['kopi', 'cafe', 'sarapan', 'buku', 'musik', 'rumah', 'libur', 'minggu', 'santai', 'teman',
             'jalan-jalan', 'hari', 'hangat', 'senyum', 'bunga', 'sepeda', 'slow', 'sunday', 'pagi'],
      titles: ['SUNDAY FEELING', 'SECANGKIR KOPI', 'HARI YANG LAMBAT', 'HIDUP YANG SEDERHANA', 'MOMENT YANG KECIL',
               'RITUAL PAGI', 'JALAN-JALAN TANPA TUJUAN', 'RASA YANG TERSISA']
    },
    food: {
      keys: ['makan', 'nasi', 'mie', 'roti', 'manis', 'pedas', 'dapur', 'kue', 'sate', 'bakso',
             'gulai', 'sambal', 'teh', 'jus', 'seblak', 'noodles', 'brunch'],
      titles: ['SELERA KOTA', 'RASA NUSANTARA', 'DARI DAPUR', 'SEDAPNYA HIDUP', 'RECIPE OF THE DAY',
               'MANIS, PEDAS, DAN CERITA', 'MEJA MAKAN KITA']
    },
    nature: {
      keys: ['gunung', 'hutan', 'awan', 'pohon', 'daun', 'sungai', 'danau', 'angin', 'sejuk', 'hijau',
             'biru', 'sawah', 'bukit', 'langit', 'pantai', 'senja', 'alam', 'embun', 'kabut'],
      titles: ['KEMBALI KE ALAM', 'NAPAS HIJAU', 'DI BAWAH LANGIT', 'SUARA DAUN', 'BUKIT YANG BERNAPAS',
               'PULANG KE HUTAN', 'SEJUK YANG LANGKA']
    },
    city: {
      keys: ['gedung', 'pencakar', 'metro', 'toko', 'bandara', 'ramai', 'kilau', 'kota', 'beton', 'jembatan', 'stasiun'],
      titles: ['KOTA INI MILIK KITA', 'BETON DAN LANGIT', 'JALAN UTAMA', 'KILAU KOTA', 'DARI ATAS MENARA',
               'ORANG-ORANG KOTA']
    },
    personal: {
      keys: ['aku', 'kamu', 'kita', 'hidup', 'cerita', 'kenangan', 'rumah', 'pulang', 'rasa', 'perasaan',
             'masa', 'waktu', 'tumbuh', 'belajar', 'luka', 'takut', 'harap', 'impian', 'mimpi', 'kembali'],
      titles: ['UNTUK AKU YANG LAMA', 'HIDUP YANG SEDANG DIBANGUN', 'KENANGAN YANG TERSIMPAN', 'RUMAH, BUKAN HANYA TEMPAT',
               'WAKTU YANG MENYEMBUHKAN', 'CERITA YANG BELUM SELESAI', 'BELAJAR LEPAS', 'KITA, PERLAHAN']
    },
    quote: {
      keys: ['kata', 'mutiara', 'kutipan', 'quote', 'bijak', 'inspirasi', 'motivasi', 'semangat', 'percaya',
             'berani', 'fokus', 'pikiran', 'jangan', 'tetap', 'mulai', 'selesai', 'berhenti', 'berharap'],
      titles: ['BERANI MULAI DARI NOL', 'FOKUS PADA LANGKAH BERIKUTNYA', 'MIMPI TANPA BATAS', 'KONSTANSI MENGALAHKAN BAKAT',
               'JANGAN MENYERAH SEBELUM MENCOBA', 'JADI DIRI SENDIRI', 'HARI INI, SATU LANGKAH LAGI']
    }
  };

  function generateTitleIdeas(input) {
    const words = String(input || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return [];

    const matched = [];
    Object.keys(TITLE_IDEAS).forEach(function (cat) {
      const hit = TITLE_IDEAS[cat].keys.some(function (k) { return words.indexOf(k) !== -1; });
      if (hit) matched.push(cat);
    });

    const result = [];
    const used = {};
    const push = function (t) {
      if (!used[t]) { used[t] = true; result.push(t); }
    };

    matched.forEach(function (cat, i) {
      TITLE_IDEAS[cat].titles.slice(0, i === 0 ? 3 : 2).forEach(push);
    });
    if (result.length < 3) {
      const generic = [
        TITLE_IDEAS.lifestyle.titles[0],
        TITLE_IDEAS.quote.titles[0],
        TITLE_IDEAS.personal.titles[2]
      ];
      generic.forEach(push);
    }
    return result.slice(0, 5);
  }

  global.Coverly = global.Coverly || {};
  global.Coverly.Templates = {
    FONTS: FONTS,
    fontStack: fontStack,
    TEMPLATES: TEMPLATES,
    CATEGORIES: CATEGORIES,
    POSITIONS: POSITIONS,
    getTemplate: getTemplate,
    applyTemplateToState: applyTemplateToState,
    generateTitleIdeas: generateTitleIdeas
  };
})(window);
