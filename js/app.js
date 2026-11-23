/* ==========================================================================
   CoinKeeper Global App Initialization
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  document.addEventListener('DOMContentLoaded', function () {
    if (CoinKeeper.layout && typeof CoinKeeper.layout.init === 'function') {
      CoinKeeper.layout.init();
    }
  });
})(window);
