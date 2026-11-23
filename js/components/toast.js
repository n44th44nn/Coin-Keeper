/* ==========================================================================
   CoinKeeper Toast, ARIA Live Announcer, & Inline Undo Banner
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  function ensureAnnouncer() {
    let region = document.getElementById('aria-announcer');
    if (!region) {
      region = CoinKeeper.fmt.el('div', {
        id: 'aria-announcer',
        className: 'sr-only',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
      document.body.appendChild(region);
    }
    return region;
  }

  function ensureToastRegion() {
    let region = document.getElementById('toast-region');
    if (!region) {
      region = CoinKeeper.fmt.el('div', {
        id: 'toast-region',
        className: 'toast-region',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
      document.body.appendChild(region);
    }
    return region;
  }

  function announce(message) {
    const region = ensureAnnouncer();
    region.textContent = '';
    global.setTimeout(function () {
      region.textContent = message;
    }, 30);
  }

  function showToast(message, variant) {
    const el = CoinKeeper.fmt.el;
    const region = ensureToastRegion();
    const toastVariant = variant === 'danger' ? 'toast--danger' : 'toast--success';
    const iconName = variant === 'danger' ? 'alert' : 'check';

    const toast = el('div', {
      className: 'toast ' + toastVariant,
      role: 'status'
    }, [
      CoinKeeper.icons.create(iconName, 18),
      el('span', { text: message })
    ]);

    region.appendChild(toast);
    announce(message);

    global.setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3400);
  }

  function renderUndoBanner(container, config) {
    if (!container) return;
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    fmt.clear(container);

    if (!config) {
      container.hidden = true;
      return;
    }

    container.hidden = false;
    const undoBtn = el('button', {
      type: 'button',
      className: 'btn btn--secondary btn--full'
    }, [
      CoinKeeper.icons.create('undo', 18),
      el('span', { text: config.undoLabel || 'Urungkan' })
    ]);

    undoBtn.addEventListener('click', function () {
      if (config.onUndo) {
        config.onUndo();
      }
    });

    container.appendChild(el('div', { className: 'card__title card__title--success' }, [
      CoinKeeper.icons.create('check', 18),
      el('span', { text: config.title })
    ]));

    if (config.detail) {
      container.appendChild(el('p', { className: 'card__copy', text: config.detail }));
    }
    container.appendChild(undoBtn);
  }

  CoinKeeper.feedback = {
    announce: announce,
    toast: showToast,
    renderUndoBanner: renderUndoBanner
  };
})(window);
