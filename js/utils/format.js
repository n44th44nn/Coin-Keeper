/* ==========================================================================
   CoinKeeper Formatting, Validation & Safe DOM Helpers
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  const MONTH_NAMES_ID = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maret',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Agustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Desember'
  };

  const MONTH_SHORT_ID = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'Mei',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Agt',
    '09': 'Sep',
    '10': 'Okt',
    '11': 'Nov',
    '12': 'Des'
  };

  function formatNumberId(num) {
    return Math.round(Number(num) || 0).toLocaleString('id-ID');
  }

  function formatRupiah(num) {
    const val = Math.round(Number(num) || 0);
    if (val < 0) {
      return '-Rp ' + formatNumberId(Math.abs(val));
    }
    return 'Rp ' + formatNumberId(val);
  }

  function formatSignedRupiah(num, type) {
    const abs = formatNumberId(Math.abs(Number(num) || 0));
    return (type === 'pemasukan' ? '+Rp ' : '-Rp ') + abs;
  }

  function formatShortK(num) {
    const val = Math.round(Number(num) || 0);
    if (val >= 1000) {
      return Math.round(val / 1000) + 'rb';
    }
    return String(val);
  }

  function formatDateId(isoDate) {
    if (!isoDate || typeof isoDate !== 'string') return '-';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const day = Number(parts[2]);
    const month = MONTH_SHORT_ID[parts[1]] || parts[1];
    return day + ' ' + month + ' ' + parts[0];
  }

  function formatMonthId(ym) {
    if (!ym || typeof ym !== 'string') return '-';
    const parts = ym.split('-');
    if (parts.length !== 2) return ym;
    return (MONTH_NAMES_ID[parts[1]] || parts[1]) + ' ' + parts[0];
  }

  function formatMonthShort(ym) {
    if (!ym || typeof ym !== 'string') return '-';
    const parts = ym.split('-');
    if (parts.length !== 2) return ym;
    return MONTH_SHORT_ID[parts[1]] || parts[1];
  }

  function getPreviousMonthKey(ym) {
    const parts = ym.split('-');
    let y = Number(parts[0]);
    let m = Number(parts[1]) - 1;
    if (m <= 0) {
      m = 12;
      y -= 1;
    }
    return y + '-' + String(m).padStart(2, '0');
  }

  function getBudgetStatus(spent, limit) {
    const safeLimit = Number(limit) || 0;
    const safeSpent = Number(spent) || 0;
    const rawPct = safeLimit > 0 ? Math.round((safeSpent / safeLimit) * 100) : (safeSpent > 0 ? 100 : 0);
    const barPct = safeLimit > 0 ? Math.min(100, Math.round((safeSpent / safeLimit) * 100)) : 0;

    if (safeLimit > 0 && safeSpent > safeLimit) {
      return {
        key: 'terlampaui',
        label: 'Terlampaui',
        badgeClass: 'badge--danger',
        icon: 'alert',
        pct: rawPct,
        barPct: 100,
        overAmount: safeSpent - safeLimit
      };
    }

    if (rawPct >= 80) {
      return {
        key: 'hampir',
        label: 'Hampir habis',
        badgeClass: 'badge--warning',
        icon: 'warning',
        pct: rawPct,
        barPct: barPct,
        overAmount: 0
      };
    }

    return {
      key: 'aman',
      label: 'Aman',
      badgeClass: 'badge--success',
      icon: 'check',
      pct: rawPct,
      barPct: barPct,
      overAmount: 0
    };
  }

  function parseNumericInput(raw) {
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
    if (typeof raw !== 'string') return NaN;
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (!cleaned) return NaN;
    return Number(cleaned);
  }

  /* Helper DOM aman: teks selalu di-assign via textContent, tidak pernah innerHTML */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        const val = attrs[key];
        if (val === undefined || val === null || val === false) return;
        if (key === 'className') {
          node.className = val;
        } else if (key === 'text') {
          node.textContent = val;
        } else if (key === 'dataset' && typeof val === 'object') {
          Object.keys(val).forEach(function (dk) {
            node.dataset[dk] = val[dk];
          });
        } else {
          node.setAttribute(key, val === true ? '' : String(val));
        }
      });
    }
    if (children) {
      const list = Array.isArray(children) ? children : [children];
      list.forEach(function (child) {
        if (child === null || child === undefined || child === false) return;
        if (typeof child === 'string' || typeof child === 'number') {
          node.appendChild(document.createTextNode(String(child)));
        } else {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  function clearEl(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  CoinKeeper.fmt = {
    number: formatNumberId,
    rupiah: formatRupiah,
    signedRupiah: formatSignedRupiah,
    shortK: formatShortK,
    dateId: formatDateId,
    monthId: formatMonthId,
    monthShort: formatMonthShort,
    prevMonthKey: getPreviousMonthKey,
    budgetStatus: getBudgetStatus,
    parseNumeric: parseNumericInput,
    el: el,
    clear: clearEl
  };
})(window);
