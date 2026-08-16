/* ============================================================
   COVERLY — export.js
   Final full-resolution render + download (PNG / JPG).
   ============================================================ */
(function (global) {
  'use strict';

  const Canvas = global.Coverly.Canvas;
  const Editor = global.Coverly.Editor;

  const exp = {
    format: 'png',
    quality: 'standard'
  };

  let modal, finalCanvas, expInfo, downloadBtn, downloadLabel, downloadIcon;
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
      downloadLabel = downloadBtn.querySelector('span');
      downloadIcon = downloadBtn.querySelector('.icon');
    }
  }

  function fullResCanvas() {
    const S = Editor.getState();
    const c = document.createElement('canvas');
    c.width = S.canvas.width;
    c.height = S.canvas.height;
    Canvas.render(c.getContext('2d'), S);
    return c;
  }

  function qualityFor() {
    if (exp.format === 'png') return null;
    return exp.quality === 'high' ? 0.96 : 0.92;
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
    }, 'image/' + exp.format, qualityFor());
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

  function download() {
    cacheEls();
    const S = Editor.getState();
    const ext = exp.format === 'png' ? 'png' : 'jpg';
    const mime = exp.format === 'png' ? 'image/png' : 'image/jpeg';

    const prevLabel = downloadLabel.textContent;
    downloadBtn.disabled = true;
    downloadLabel.textContent = 'Preparing your cover…';
    downloadIcon.classList.add('spinner');

    requestAnimationFrame(function () {
      const c = fullResCanvas();
      c.toBlob(function (blob) {
        downloadBtn.disabled = false;
        downloadIcon.classList.remove('spinner');
        downloadLabel.textContent = prevLabel;
        if (!blob) {
          toast('Export failed. Please try again.', 'error');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coverly-instagram-cover.' + ext;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        toast('Cover downloaded');
        closeModal();
      }, mime, qualityFor());
    });
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
    download: download,
    getFormat: function () { return exp.format; },
    getQuality: function () { return exp.quality; }
  };
})(window);
