/* ==========================================================================
   CoinKeeper Global App Initialization
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  const PAGE_ROUTES = {
    dasbor: 'index.html',
    catat: 'pages/catat-transaksi.html',
    anggaran: 'pages/anggaran.html',
    laporan: 'pages/laporan.html',
    tabungan: 'pages/tabungan.html'
  };

  function ensureAuthenticated() {
    if (!CoinKeeper.auth || CoinKeeper.auth.isAuthenticated()) {
      return true;
    }

    const body = document.body;
    const activePage = (body && body.dataset.page) || 'dasbor';
    const rootPrefix = (body && body.dataset.root) || '.';
    const route = PAGE_ROUTES[activePage] || 'index.html';
    const query = route !== 'index.html' ? '?next=' + encodeURIComponent(route) : '';

    global.location.replace(rootPrefix + '/pages/login.html' + query);
    return false;
  }

  const isAuthed = ensureAuthenticated();

  document.addEventListener('DOMContentLoaded', function () {
    if (!isAuthed) return;
    if (CoinKeeper.layout && typeof CoinKeeper.layout.init === 'function') {
      CoinKeeper.layout.init();
    }
  });
})(window);
