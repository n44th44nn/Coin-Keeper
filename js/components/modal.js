/* ==========================================================================
   CoinKeeper Accessible Modal Controller (<dialog> dengan 4 Jalur Keluar Mudah)
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  function bindDialog(dialogEl, options) {
    if (!dialogEl) return null;
    const opts = options || {};
    let lastTrigger = null;

    function close() {
      if (dialogEl.open) {
        dialogEl.close();
      }
      if (opts.onClose) {
        opts.onClose();
      }
      if (lastTrigger && typeof lastTrigger.focus === 'function' && document.contains(lastTrigger)) {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    function open(triggerEl) {
      lastTrigger = triggerEl || document.activeElement;
      if (!dialogEl.open) {
        dialogEl.showModal();
      }
      if (opts.initialFocus) {
        const target = typeof opts.initialFocus === 'function' ? opts.initialFocus() : opts.initialFocus;
        if (target && typeof target.focus === 'function') {
          global.requestAnimationFrame(function () {
            target.focus();
          });
        }
      }
    }

    /* Jalur Keluar 1 & 2: Tombol Tutup (X) dan Tombol Batal */
    dialogEl.querySelectorAll('[data-dialog-close]').forEach(function (btn) {
      btn.addEventListener('click', close);
    });

    /* Jalur Keluar 3: Klik Backdrop Redup di luar panel modal */
    dialogEl.addEventListener('click', function (evt) {
      if (evt.target === dialogEl) {
        close();
      }
    });

    /* Jalur Keluar 4: Tombol Esc (native cancel + keydown fallback pada <dialog>) */
    dialogEl.addEventListener('cancel', function (evt) {
      evt.preventDefault();
      close();
    });

    dialogEl.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape' && dialogEl.open) {
        evt.preventDefault();
        close();
      }
    });

    return {
      open: open,
      close: close,
      el: dialogEl
    };
  }

  CoinKeeper.modal = {
    bind: bindDialog
  };
})(window);
