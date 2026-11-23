/* ==========================================================================
   Page 04: Laporan Bulanan Logic & Pure SVG Bar Chart
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let activeMonth = '2026-11';

  function svgEl(tag, attrs, textContent) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, String(attrs[k]));
      });
    }
    if (textContent !== undefined) {
      node.textContent = textContent;
    }
    return node;
  }

  function renderChart(summary) {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const wrap = document.getElementById('laporan-chart-wrap');
    const emptyEl = document.getElementById('laporan-chart-empty');
    const focusNote = document.getElementById('laporan-chart-focus-note');

    fmt.clear(wrap);
    fmt.clear(emptyEl);

    if (summary.totalSpent === 0) {
      wrap.hidden = true;
      emptyEl.hidden = false;
      emptyEl.appendChild(el('span', { className: 'empty-state__icon' }, CoinKeeper.icons.create('chart', 28)));
      emptyEl.appendChild(el('p', { className: 'empty-state__title', text: 'Belum Ada Data Pengeluaran Untuk Bulan Ini' }));
      emptyEl.appendChild(el('p', { className: 'empty-state__desc', text: 'Catat transaksi pengeluaran pada bulan ini agar grafik perbandingan kategori dapat ditampilkan.' }));
      return;
    }

    wrap.hidden = false;
    emptyEl.hidden = true;

    const rows = summary.categoryRows;
    let rawMax = 800000;
    rows.forEach(function (r) {
      rawMax = Math.max(rawMax, r.spent, r.limit);
    });
    const yMax = Math.max(800000, Math.ceil(rawMax / 200000) * 200000);
    const steps = 4;

    const svgWidth = 700;
    const svgHeight = 320;
    const plotLeft = 52;
    const plotRight = 684;
    const plotTop = 44;
    const plotBottom = 268;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;

    const svg = svgEl('svg', {
      class: 'laporan-chart-svg',
      viewBox: '0 0 ' + svgWidth + ' ' + svgHeight,
      role: 'img',
      'aria-labelledby': 'chart-svg-title chart-svg-desc'
    });

    svg.appendChild(svgEl('title', { id: 'chart-svg-title' }, 'Grafik pengeluaran per kategori ' + fmt.monthId(summary.month)));
    const descParts = rows.map(function (r) {
      return r.category + ' ' + fmt.rupiah(r.spent) + ' dari batas ' + fmt.rupiah(r.limit);
    });
    svg.appendChild(svgEl('desc', { id: 'chart-svg-desc' }, descParts.join('; ')));

    /* Gridlines & Y-Axis */
    for (let i = 0; i <= steps; i++) {
      const val = (yMax / steps) * i;
      const y = plotBottom - (val / yMax) * plotHeight;
      svg.appendChild(svgEl('line', {
        x1: plotLeft,
        y1: y,
        x2: plotRight,
        y2: y,
        stroke: i === 0 ? 'var(--color-border-input)' : 'var(--color-border-card)',
        'stroke-width': 1
      }));
      svg.appendChild(svgEl('text', {
        x: plotLeft - 10,
        y: y + 4,
        'text-anchor': 'end',
        fill: 'var(--color-text-muted)',
        'font-size': '12',
        'font-family': 'var(--font-mono)'
      }, String(Math.round(val / 1000))));
    }

    /* 5 Batang Kategori + Garis Batas Anggaran */
    const colWidth = plotWidth / rows.length;
    const barWidth = 48;

    rows.forEach(function (row, idx) {
      const cx = plotLeft + colWidth * idx + colWidth / 2;
      const barH = Math.max(0, (row.spent / yMax) * plotHeight);
      const barY = plotBottom - barH;
      const limitY = plotBottom - (row.limit / yMax) * plotHeight;
      const isOver = row.spent > row.limit && row.limit > 0;

      const group = svgEl('g', {
        class: 'chart-bar-group',
        tabindex: '0',
        role: 'button',
        'aria-label': row.category + ': ' + fmt.rupiah(row.spent) + ', batas ' + fmt.rupiah(row.limit) + ' (' + row.status.pct + '%)'
      });

      /* Area target sentuh/fokus penuh kolom */
      group.appendChild(svgEl('rect', {
        class: 'chart-bar-hit',
        x: plotLeft + colWidth * idx + 8,
        y: plotTop - 24,
        width: colWidth - 16,
        height: plotHeight + 48,
        rx: 8,
        fill: 'transparent'
      }));

      /* Batang Nilai */
      group.appendChild(svgEl('rect', {
        class: 'chart-bar-rect',
        x: cx - barWidth / 2,
        y: barY,
        width: barWidth,
        height: barH,
        rx: 4,
        fill: isOver ? 'var(--color-status-danger-solid)' : 'var(--color-action-primary)'
      }));

      /* Garis Batas Anggaran Horizontal Putus-putus */
      if (row.limit > 0) {
        svg.appendChild(svgEl('line', {
          x1: cx - 48,
          y1: limitY,
          x2: cx + 48,
          y2: limitY,
          stroke: isOver ? 'var(--color-status-danger-solid)' : 'var(--color-text-secondary)',
          'stroke-width': 1.75,
          'stroke-dasharray': '4 4'
        }));
      }

      /* Label Nilai di atas titik tertinggi antara batang & batas */
      const topAnchorY = Math.min(barY, limitY) - 10;
      const labelText = (isOver ? '× ' : '') + fmt.shortK(row.spent);
      group.appendChild(svgEl('text', {
        x: cx,
        y: Math.max(16, topAnchorY),
        'text-anchor': 'middle',
        fill: isOver ? 'var(--color-status-danger-text)' : 'var(--color-text-primary)',
        'font-size': '12',
        'font-weight': '700',
        'font-family': 'var(--font-mono)'
      }, labelText));

      /* Label Kategori Sumbu X */
      group.appendChild(svgEl('text', {
        x: cx,
        y: plotBottom + 26,
        'text-anchor': 'middle',
        fill: 'var(--color-text-secondary)',
        'font-size': '13',
        'font-weight': '600',
        'font-family': 'var(--font-sans)'
      }, row.category));

      function showDetail() {
        const extra = isOver
          ? ' · Melebihi batas ' + fmt.rupiah(row.status.overAmount)
          : ' · Sisa batas ' + fmt.rupiah(Math.max(0, row.limit - row.spent));
        focusNote.textContent =
          'Sorotan ' + row.category + ': ' + fmt.rupiah(row.spent) + ' dari batas ' +
          fmt.rupiah(row.limit) + ' (' + row.status.pct + '%)' + extra + '.';
      }

      group.addEventListener('mouseenter', showDetail);
      group.addEventListener('focus', showDetail);
      group.addEventListener('click', showDetail);
      group.addEventListener('keydown', function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.preventDefault();
          showDetail();
        }
      });

      svg.appendChild(group);
    });

    wrap.appendChild(svg);
    focusNote.textContent = 'Arahkan kursor atau fokus keyboard ke batang kategori untuk melihat detail anggaran.';
  }

  function renderMonthButtons() {
    document.querySelectorAll('[data-month]').forEach(function (btn) {
      const active = btn.dataset.month === activeMonth;
      btn.classList.toggle('segmented__btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderLaporan() {
    const fmt = CoinKeeper.fmt;
    const store = CoinKeeper.store;
    const state = store.load();
    const summary = store.getMonthlySummary(state, activeMonth);
    const comp = store.getMonthComparison(state, activeMonth);

    renderMonthButtons();
    document.getElementById('laporan-subtitle').textContent = 'Pengeluaran per kategori · ' + fmt.monthId(activeMonth);

    renderChart(summary);

    /* Rincian Laporan */
    const topEl = document.getElementById('rincian-terbesar');
    if (summary.largestCategory && summary.largestCategory.spent > 0) {
      topEl.textContent = summary.largestCategory.category + ' · ' + fmt.rupiah(summary.largestCategory.spent);
    } else {
      topEl.textContent = 'Belum ada pengeluaran';
    }

    const attnEl = document.getElementById('rincian-perhatian');
    attnEl.classList.remove('text-terlampaui', 'text-hampir', 'text-aman');
    if (summary.overbudgetCategories.length > 0) {
      const firstOver = summary.overbudgetCategories[0];
      attnEl.textContent = firstOver.category + ' · Melebihi ' + fmt.rupiah(firstOver.status.overAmount);
      attnEl.classList.add('text-terlampaui');
    } else if (summary.attentionCategories.length > 0) {
      const firstNear = summary.attentionCategories[0];
      attnEl.textContent = firstNear.category + ' · Terpakai ' + firstNear.status.pct + '%';
      attnEl.classList.add('text-hampir');
    } else {
      attnEl.textContent = 'Semua kategori aman';
      attnEl.classList.add('text-aman');
    }

    /* Perbandingan Bulanan */
    const deltaEl = document.getElementById('perbandingan-delta');
    const descEl = document.getElementById('perbandingan-desc');
    deltaEl.classList.remove('text-aman', 'text-terlampaui');

    if (comp.delta < 0) {
      deltaEl.textContent = '-' + fmt.rupiah(Math.abs(comp.delta));
      deltaEl.classList.add('text-aman');
      descEl.textContent = 'Turun ' + comp.pctChange + '% dibanding bulan sebelumnya.';
    } else if (comp.delta > 0) {
      deltaEl.textContent = '+' + fmt.rupiah(comp.delta);
      deltaEl.classList.add('text-terlampaui');
      descEl.textContent = 'Naik ' + comp.pctChange + '% dibanding bulan sebelumnya.';
    } else {
      deltaEl.textContent = 'Rp 0';
      descEl.textContent = 'Sama persis dengan bulan sebelumnya.';
    }

    document.getElementById('perbandingan-prev-label').textContent = 'Total bulan lalu (' + fmt.monthShort(comp.prevKey) + ' ' + comp.prevKey.slice(0, 4) + ')';
    document.getElementById('perbandingan-prev-val').textContent = fmt.rupiah(comp.prevTotal);

    /* Total Laporan */
    document.getElementById('judul-total-laporan').textContent = 'Total pengeluaran · ' + fmt.monthId(activeMonth);
    document.getElementById('laporan-total-val').textContent = fmt.rupiah(summary.totalSpent);
    document.getElementById('laporan-total-cats').textContent =
      summary.categoryRows.length + ' kategori utama · ' +
      summary.overbudgetCategories.length + ' melebihi batas';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-month]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeMonth = btn.dataset.month;
        renderLaporan();
      });
    });
    renderLaporan();
  });
})(window);
