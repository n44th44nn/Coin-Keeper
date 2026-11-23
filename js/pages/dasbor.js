/* ==========================================================================
   Page 01: Dasbor Logic
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  function renderDasbor() {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const store = CoinKeeper.store;
    const ui = CoinKeeper.ui;

    const state = store.load();
    const ym = state.activeMonth || '2026-11';
    const balance = store.getBalance(state);
    const summary = store.getMonthlySummary(state, ym);

    /* 1. Header & KPI */
    document.getElementById('dasbor-greeting').textContent = 'Halo, ' + (state.profile ? state.profile.name : 'Faqih');
    document.getElementById('dasbor-period').textContent = 'Ringkasan keuangan ' + fmt.monthId(ym);
    document.getElementById('dasbor-tx-period').textContent = fmt.monthId(ym);

    document.getElementById('kpi-saldo').textContent = fmt.rupiah(balance);
    const saldoBadgeWrap = document.getElementById('kpi-saldo-badge');
    fmt.clear(saldoBadgeWrap);
    let saldoStatus;
    if (balance <= 0) {
      saldoStatus = { badgeClass: 'badge--danger', icon: 'alert', label: 'Defisit' };
    } else if (balance < 200000) {
      saldoStatus = { badgeClass: 'badge--warning', icon: 'warning', label: 'Menipis' };
    } else {
      saldoStatus = { badgeClass: 'badge--success', icon: 'check', label: 'Aman' };
    }
    saldoBadgeWrap.appendChild(ui.createBadge(saldoStatus));

    document.getElementById('kpi-pengeluaran').textContent = fmt.rupiah(summary.totalSpent);
    const expBadgeWrap = document.getElementById('kpi-pengeluaran-badge');
    fmt.clear(expBadgeWrap);
    expBadgeWrap.appendChild(ui.createBadge(summary.overallStatus));

    const sisaEl = document.getElementById('kpi-sisa');
    sisaEl.textContent = fmt.rupiah(summary.remainingBudget);
    sisaEl.classList.toggle('text-terlampaui', summary.remainingBudget < 0);
    document.getElementById('kpi-batas-note').textContent = 'dari ' + fmt.rupiah(summary.totalBudget);

    /* 2. Daftar 4 Transaksi Terbaru */
    const txList = document.getElementById('dasbor-tx-list');
    const txEmpty = document.getElementById('dasbor-tx-empty');
    fmt.clear(txList);
    fmt.clear(txEmpty);

    const recentTx = (state.transactions || []).slice(0, 4);
    if (recentTx.length === 0) {
      txList.hidden = true;
      txEmpty.hidden = false;
      txEmpty.appendChild(el('span', { className: 'empty-state__icon' }, CoinKeeper.icons.create('list', 28)));
      txEmpty.appendChild(el('p', { className: 'empty-state__title', text: 'Belum ada transaksi tercatat' }));
      txEmpty.appendChild(el('p', { className: 'empty-state__desc', text: 'Mulai catat pemasukan atau pengeluaran harian untuk memantau anggaran.' }));
    } else {
      txList.hidden = false;
      txEmpty.hidden = true;
      recentTx.forEach(function (tx) {
        txList.appendChild(ui.createTransactionItem(tx, { inlineAmount: false }));
      });
    }

    /* 3. Kartu Perlu Perhatian */
    const attentionList = document.getElementById('dasbor-attention-list');
    fmt.clear(attentionList);
    if (summary.attentionCategories.length === 0) {
      attentionList.appendChild(
        el('div', { className: 'attention-item' }, [
          ui.createBadge({ badgeClass: 'badge--success', icon: 'check', label: 'Semua kategori aman' }),
          el('p', {
            className: 'attention-item__note',
            text: 'Seluruh pengeluaran kategori masih berada di bawah batas aman (< 80%).'
          })
        ])
      );
    } else {
      summary.attentionCategories.forEach(function (row) {
        const noteText = row.status.key === 'terlampaui'
          ? 'Melebihi batas anggaran ' + fmt.rupiah(row.status.overAmount) + ' (batas ' + fmt.rupiah(row.limit) + ').'
          : 'Sudah terpakai ' + row.status.pct + '% dari batas ' + fmt.rupiah(row.limit) + '.';
        attentionList.appendChild(
          el('div', { className: 'attention-item' }, [
            el('div', { className: 'attention-item__name', text: row.category }),
            ui.createBadge(row.status),
            el('p', { className: 'attention-item__note', text: noteText })
          ])
        );
      });
    }

    /* 4. Catatan Ringkasan */
    const summaryNote = document.getElementById('dasbor-summary-note');
    if (summary.overbudgetCategories.length > 0) {
      const names = summary.overbudgetCategories.map(function (c) {
        return c.category;
      }).join(', ');
      summaryNote.textContent =
        'Sisa anggaran bulan ini ' + fmt.rupiah(summary.remainingBudget) +
        '. Pos ' + names + ' sudah melampaui batas—tinjau pengeluaran di laporan atau sesuaikan batas anggaran.';
    } else if (summary.attentionCategories.length > 0) {
      summaryNote.textContent =
        'Sisa anggaran bulan ini ' + fmt.rupiah(summary.remainingBudget) +
        '. Perhatikan kategori yang sudah mencapai ≥ 80% agar uang saku tetap cukup sampai akhir bulan.';
    } else {
      summaryNote.textContent =
        'Seluruh anggaran bulan ini terkendali dengan sisa ' + fmt.rupiah(summary.remainingBudget) +
        '. Pertahankan kebiasaan mencatat setiap transaksi.';
    }
  }

  document.addEventListener('DOMContentLoaded', renderDasbor);
})(window);
