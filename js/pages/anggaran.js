/* ==========================================================================
   Page 03: Anggaran Kategori Logic
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  let activeEditCategory = null;
  let lastBudgetChange = null;
  let editDialogCtrl = null;
  let isSaving = false;

  function setError(inputEl, errorEl, message) {
    if (!message) {
      inputEl.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
      return true;
    }
    inputEl.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.hidden = false;
    return false;
  }

  function validateBudgetInput(showMessage) {
    const input = document.getElementById('input-budget-limit');
    const errorEl = document.getElementById('error-budget-limit');
    const helperEl = document.getElementById('helper-budget-limit');
    const raw = input.value.trim();
    const numeric = CoinKeeper.fmt.parseNumeric(raw);

    if (!raw) {
      helperEl.textContent = 'Masukkan batas bulanan tanpa titik atau koma.';
      if (showMessage) {
        return setError(input, errorEl, 'Batas anggaran wajib diisi: kolom masih kosong. Masukkan angka lebih dari 0, contoh 750000.');
      }
      return false;
    }

    if (!Number.isFinite(numeric) || numeric <= 0) {
      helperEl.textContent = 'Masukkan batas bulanan tanpa titik atau koma.';
      if (showMessage) {
        return setError(input, errorEl, 'Batas anggaran tidak valid: nilai harus lebih dari Rp 0. Ubah menjadi angka positif.');
      }
      return false;
    }

    helperEl.textContent = 'Batas baru: ' + CoinKeeper.fmt.rupiah(numeric) + '.';
    return setError(input, errorEl, '');
  }

  function openEditModal(row, triggerBtn) {
    activeEditCategory = row.category;
    const fmt = CoinKeeper.fmt;
    const input = document.getElementById('input-budget-limit');

    document.getElementById('dialog-budget-title').textContent = 'Ubah anggaran ' + row.category;
    document.getElementById('dialog-budget-desc').textContent =
      'Pengeluaran ' + row.category + ' bulan ini tercatat ' + fmt.rupiah(row.spent) +
      ' dengan batas saat ini ' + fmt.rupiah(row.limit) + '.';

    input.value = String(row.limit);
    setError(input, document.getElementById('error-budget-limit'), '');
    document.getElementById('helper-budget-limit').textContent = 'Batas baru: ' + fmt.rupiah(row.limit) + '.';
    document.getElementById('btn-save-budget').disabled = false;

    editDialogCtrl.open(triggerBtn);
  }

  function renderUndoBanner() {
    const banner = document.getElementById('anggaran-undo-banner');
    if (!lastBudgetChange) {
      CoinKeeper.feedback.renderUndoBanner(banner, null);
      return;
    }

    const fmt = CoinKeeper.fmt;
    CoinKeeper.feedback.renderUndoBanner(banner, {
      title: 'Anggaran ' + lastBudgetChange.category + ' diperbarui',
      detail: 'Batas baru ditetapkan ke ' + fmt.rupiah(lastBudgetChange.newLimit) + '.',
      undoLabel: 'Urungkan perubahan',
      onUndo: function () {
        CoinKeeper.store.updateBudget(lastBudgetChange.category, lastBudgetChange.previousLimit);
        const catName = lastBudgetChange.category;
        lastBudgetChange = null;
        renderUndoBanner();
        renderPage();
        CoinKeeper.feedback.toast('Batas anggaran ' + catName + ' dikembalikan.', 'success');
      }
    });
  }

  function renderPage() {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const store = CoinKeeper.store;
    const ui = CoinKeeper.ui;

    const state = store.load();
    const ym = state.activeMonth || '2026-11';
    const summary = store.getMonthlySummary(state, ym);

    /* 1. Grid 5 Kartu Anggaran Kategori */
    const grid = document.getElementById('budget-cards-grid');
    fmt.clear(grid);

    summary.categoryRows.forEach(function (row) {
      const editBtn = el('button', {
        type: 'button',
        className: 'btn btn--secondary btn--sm',
        'aria-label': 'Ubah batas anggaran ' + row.category,
        text: 'Ubah'
      });
      editBtn.addEventListener('click', function () {
        openEditModal(row, editBtn);
      });

      const fill = el('div', {
        className: 'progress-fill progress-fill--' + row.status.key
      });
      fill.style.width = row.status.barPct + '%';

      const track = el('div', {
        className: 'progress-track',
        role: 'progressbar',
        'aria-label': 'Penggunaan anggaran ' + row.category,
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': String(row.status.pct)
      }, fill);

      const card = el('article', { className: 'card budget-card' }, [
        el('div', { className: 'budget-card__top' }, [
          el('div', { className: 'budget-card__head' }, [
            el('h2', { className: 'budget-card__title', text: row.category }),
            ui.createBadge(row.status)
          ]),
          editBtn
        ]),
        track,
        el('div', { className: 'budget-card__bottom' }, [
          el('span', {
            className: 'budget-card__ratio tabular-num',
            text: fmt.rupiah(row.spent) + ' / ' + fmt.rupiah(row.limit)
          }),
          el('span', {
            className: 'budget-card__pct tabular-num text-' + row.status.key,
            text: row.status.pct + '%'
          })
        ])
      ]);

      grid.appendChild(card);
    });

    /* 2. Ringkasan Bulanan */
    document.getElementById('summary-total-spent').textContent = fmt.rupiah(summary.totalSpent);
    document.getElementById('summary-total-limit').textContent = 'dari batas ' + fmt.rupiah(summary.totalBudget);

    const track = document.getElementById('summary-progress-track');
    const fill = document.getElementById('summary-progress-fill');
    track.setAttribute('aria-valuenow', String(summary.overallStatus.pct));
    fill.className = 'progress-fill progress-fill--' + summary.overallStatus.key;
    fill.style.width = summary.overallStatus.barPct + '%';

    const badgeHost = document.getElementById('summary-status-badge');
    fmt.clear(badgeHost);
    badgeHost.appendChild(ui.createBadge(summary.overallStatus));

    /* 3. Kartu Peringatan Overbudget */
    const warnCard = document.getElementById('anggaran-warning-card');
    fmt.clear(warnCard);
    if (summary.overbudgetCategories.length > 0) {
      const topOver = summary.overbudgetCategories[0];
      warnCard.className = 'card card--danger';
      warnCard.appendChild(el('h2', { className: 'card__title card__title--danger' }, [
        CoinKeeper.icons.create('alert', 20),
        el('span', { text: 'Peringatan ' + topOver.category.toLowerCase() })
      ]));
      warnCard.appendChild(el('p', {
        className: 'card__copy',
        text: 'Pengeluaran ' + topOver.category + ' mencapai ' + fmt.rupiah(topOver.spent) +
          ', melebihi batas ' + fmt.rupiah(topOver.limit) + ' sebesar ' + fmt.rupiah(topOver.status.overAmount) + '.'
      }));
      warnCard.appendChild(el('div', { className: 'anggaran-warning__cta' }, [
        el('a', {
          href: 'laporan.html',
          className: 'btn btn--secondary btn--full',
          text: 'Tinjau ' + topOver.category.toLowerCase()
        })
      ]));
    } else {
      warnCard.className = 'card card--success';
      warnCard.appendChild(el('h2', { className: 'card__title card__title--success' }, [
        CoinKeeper.icons.create('check', 20),
        el('span', { text: 'Tidak ada pos terlampaui' })
      ]));
      warnCard.appendChild(el('p', {
        className: 'card__copy',
        text: 'Semua batas anggaran kategori bulan ini masih terkendali.'
      }));
      warnCard.appendChild(el('div', { className: 'anggaran-warning__cta' }, [
        el('a', {
          href: 'laporan.html',
          className: 'btn btn--secondary btn--full',
          text: 'Lihat tren bulanan'
        })
      ]));
    }
  }

  function handleSaveBudget(evt) {
    evt.preventDefault();
    if (isSaving || !activeEditCategory) return;

    if (!validateBudgetInput(true)) {
      document.getElementById('input-budget-limit').focus();
      return;
    }

    const numeric = CoinKeeper.fmt.parseNumeric(document.getElementById('input-budget-limit').value);
    const saveBtn = document.getElementById('btn-save-budget');
    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Menyimpan...';

    global.setTimeout(function () {
      const updated = CoinKeeper.store.updateBudget(activeEditCategory, numeric);
      lastBudgetChange = {
        category: activeEditCategory,
        previousLimit: updated.previousLimit,
        newLimit: updated.newLimit
      };
      isSaving = false;
      saveBtn.disabled = false;
      saveBtn.textContent = 'Simpan batas';
      editDialogCtrl.close();
      renderPage();
      renderUndoBanner();
      CoinKeeper.feedback.toast('Batas anggaran ' + lastBudgetChange.category + ' diperbarui.', 'success');
    }, 150);
  }

  document.addEventListener('DOMContentLoaded', function () {
    editDialogCtrl = CoinKeeper.modal.bind(document.getElementById('dialog-budget-edit'), {
      initialFocus: function () {
        return document.getElementById('input-budget-limit');
      },
      onClose: function () {
        activeEditCategory = null;
      }
    });

    const input = document.getElementById('input-budget-limit');
    input.addEventListener('input', function () {
      const digits = input.value.replace(/[^0-9]/g, '');
      if (input.value !== digits) {
        input.value = digits;
      }
      const ok = validateBudgetInput(false);
      document.getElementById('btn-save-budget').disabled = !ok;
    });
    input.addEventListener('blur', function () {
      validateBudgetInput(true);
    });

    document.getElementById('form-budget-edit').addEventListener('submit', handleSaveBudget);
    renderPage();
  });
})(window);
