/* ==========================================================================
   Page 02: Catat Transaksi Logic (Form 3-Phase Validation, Modals, Undo)
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  let selectedType = 'pengeluaran';
  let selectedCategory = 'Makan';
  let pendingDeleteTx = null;
  let lastDeletedRecord = null;
  let nominalTouched = false;
  let isSubmitting = false;

  let savedDialogCtrl = null;
  let deleteDialogCtrl = null;

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

  function getNominalValue() {
    const input = document.getElementById('input-nominal');
    return CoinKeeper.fmt.parseNumeric(input.value);
  }

  function validateNominal(showErrorMessage) {
    const input = document.getElementById('input-nominal');
    const errorEl = document.getElementById('error-nominal');
    const helperEl = document.getElementById('helper-nominal');
    const raw = input.value.trim();
    const numeric = CoinKeeper.fmt.parseNumeric(raw);

    if (!raw) {
      helperEl.textContent = 'Contoh: 25000 (tanpa titik atau koma).';
      if (showErrorMessage) {
        return setError(input, errorEl, 'Nominal wajib diisi: kolom nominal masih kosong. Masukkan angka lebih dari 0, contoh 25000.');
      }
      return setError(input, errorEl, '') && false;
    }

    if (!Number.isFinite(numeric) || numeric <= 0) {
      helperEl.textContent = 'Contoh: 25000 (tanpa titik atau koma).';
      if (showErrorMessage) {
        return setError(input, errorEl, 'Nominal tidak valid: nilai transaksi harus lebih dari Rp 0. Ubah menjadi angka positif, misal 25000.');
      }
      return false;
    }

    helperEl.textContent = 'Setara ' + CoinKeeper.fmt.rupiah(numeric) + '.';
    return setError(input, errorEl, '');
  }

  function validateDate(showErrorMessage) {
    const input = document.getElementById('input-tanggal');
    const errorEl = document.getElementById('error-tanggal');
    if (!input.value) {
      if (showErrorMessage) {
        return setError(input, errorEl, 'Tanggal wajib dipilih: tanggal transaksi belum ditentukan. Pilih tanggal pada pemilih tanggal.');
      }
      return false;
    }
    return setError(input, errorEl, '');
  }

  function syncSubmitButton() {
    const btn = document.getElementById('btn-simpan-tx');
    if (isSubmitting) return;
    const numeric = getNominalValue();
    const dateVal = document.getElementById('input-tanggal').value;
    const valid = Number.isFinite(numeric) && numeric > 0 && Boolean(selectedCategory) && Boolean(dateVal);
    btn.disabled = !valid;
  }

  function renderCategoryChips() {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const container = document.getElementById('kategori-chips');
    const selectedNote = document.getElementById('kategori-terpilih');
    fmt.clear(container);

    CoinKeeper.SEED.categories.forEach(function (cat) {
      const active = cat === selectedCategory;
      const chip = el('button', {
        type: 'button',
        className: 'chip' + (active ? ' chip--active' : ''),
        'aria-pressed': active ? 'true' : 'false',
        text: cat
      });
      chip.addEventListener('click', function () {
        selectedCategory = cat;
        renderCategoryChips();
        syncSubmitButton();
      });
      container.appendChild(chip);
    });

    selectedNote.textContent = 'Kategori terpilih: ' + selectedCategory;
  }

  function renderTypeToggle() {
    document.querySelectorAll('[data-tx-type]').forEach(function (btn) {
      const active = btn.dataset.txType === selectedType;
      btn.classList.toggle('segmented__btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderHistory() {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const state = CoinKeeper.store.load();
    const listEl = document.getElementById('riwayat-list');
    const emptyEl = document.getElementById('riwayat-empty');
    const subEl = document.getElementById('riwayat-subtitle');

    fmt.clear(listEl);
    fmt.clear(emptyEl);

    const txs = state.transactions || [];
    subEl.textContent = txs.length + ' transaksi tercatat';

    if (txs.length === 0) {
      listEl.hidden = true;
      emptyEl.hidden = false;
      emptyEl.appendChild(el('span', { className: 'empty-state__icon' }, CoinKeeper.icons.create('list', 28)));
      emptyEl.appendChild(el('p', { className: 'empty-state__title', text: 'Riwayat transaksi kosong' }));
      emptyEl.appendChild(el('p', { className: 'empty-state__desc', text: 'Gunakan formulir di samping untuk mencatat transaksi pertama Anda.' }));
    } else {
      listEl.hidden = false;
      emptyEl.hidden = true;
      txs.forEach(function (tx) {
        listEl.appendChild(
          CoinKeeper.ui.createTransactionItem(tx, {
            inlineAmount: true,
            onDelete: openDeleteModal
          })
        );
      });
    }
  }

  function renderUndoState() {
    const banner = document.getElementById('catat-undo-banner');
    if (!lastDeletedRecord) {
      CoinKeeper.feedback.renderUndoBanner(banner, null);
      return;
    }
    const tx = lastDeletedRecord.removed;
    CoinKeeper.feedback.renderUndoBanner(banner, {
      title: 'Transaksi "' + tx.title + '" dihapus',
      detail: 'Nominal ' + CoinKeeper.fmt.rupiah(tx.amount) + ' telah dikeluarkan dari ringkasan bulan berjalan.',
      undoLabel: 'Urungkan',
      onUndo: function () {
        CoinKeeper.store.restoreTransaction(lastDeletedRecord.removed, lastDeletedRecord.index);
        const restoredName = lastDeletedRecord.removed.title;
        lastDeletedRecord = null;
        renderUndoState();
        renderHistory();
        CoinKeeper.feedback.toast('Penghapusan "' + restoredName + '" dibatalkan.', 'success');
      }
    });
  }

  function openDeleteModal(tx, triggerBtn) {
    pendingDeleteTx = tx;
    const fmt = CoinKeeper.fmt;
    document.getElementById('dialog-delete-item').textContent = tx.title + ' · ' + fmt.rupiah(tx.amount);
    document.getElementById('dialog-delete-desc').textContent =
      'Transaksi kategori ' + tx.category +
      ' akan dihapus dari riwayat. Saldo dan ringkasan anggaran akan dihitung ulang. Anda dapat mengurungkannya setelah ini.';
    deleteDialogCtrl.open(triggerBtn);
  }

  function resetForm() {
    selectedType = 'pengeluaran';
    selectedCategory = 'Makan';
    nominalTouched = false;
    const nominalInput = document.getElementById('input-nominal');
    const dateInput = document.getElementById('input-tanggal');
    const noteInput = document.getElementById('input-catatan');

    nominalInput.value = '';
    dateInput.value = CoinKeeper.SEED.defaultDate;
    noteInput.value = '';
    setError(nominalInput, document.getElementById('error-nominal'), '');
    setError(dateInput, document.getElementById('error-tanggal'), '');
    document.getElementById('helper-nominal').textContent = 'Contoh: 25000 (tanpa titik atau koma).';

    renderTypeToggle();
    renderCategoryChips();
    syncSubmitButton();
  }

  function setButtonLoading(loading) {
    const btn = document.getElementById('btn-simpan-tx');
    const fmt = CoinKeeper.fmt;
    isSubmitting = loading;
    fmt.clear(btn);
    if (loading) {
      btn.disabled = true;
      btn.classList.add('btn--loading');
      btn.appendChild(fmt.el('span', { className: 'spinner', 'aria-hidden': 'true' }));
      btn.appendChild(fmt.el('span', { text: 'Menyimpan...' }));
    } else {
      btn.classList.remove('btn--loading');
      btn.textContent = 'Simpan transaksi';
      syncSubmitButton();
    }
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    nominalTouched = true;
    const okNominal = validateNominal(true);
    const okDate = validateDate(true);

    if (!okNominal) {
      document.getElementById('input-nominal').focus();
      syncSubmitButton();
      return;
    }
    if (!okDate) {
      document.getElementById('input-tanggal').focus();
      syncSubmitButton();
      return;
    }

    const amount = getNominalValue();
    const dateVal = document.getElementById('input-tanggal').value;
    const noteVal = document.getElementById('input-catatan').value.trim();
    const titleVal = noteVal || selectedCategory;

    setButtonLoading(true);
    global.setTimeout(function () {
      const result = CoinKeeper.store.addTransaction({
        type: selectedType,
        title: titleVal,
        category: selectedCategory,
        amount: amount,
        date: dateVal,
        note: noteVal
      });

      setButtonLoading(false);
      lastDeletedRecord = null;
      renderUndoState();
      renderHistory();

      const fmt = CoinKeeper.fmt;
      const jenisLabel = result.transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
      document.getElementById('dialog-saved-desc').textContent =
        jenisLabel + ' "' + result.transaction.title + '" (' + result.transaction.category + ') sebesar ' +
        fmt.rupiah(result.transaction.amount) + ' pada ' + fmt.dateId(result.transaction.date) +
        ' berhasil dicatat. Saldo dan anggaran telah diperbarui.';

      resetForm();
      savedDialogCtrl.open(document.getElementById('btn-simpan-tx'));
      CoinKeeper.feedback.announce('Transaksi berhasil disimpan.');
    }, 150);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const savedIconHost = document.getElementById('dialog-saved-icon');
    if (savedIconHost) {
      savedIconHost.appendChild(CoinKeeper.icons.create('check', 22));
    }

    savedDialogCtrl = CoinKeeper.modal.bind(document.getElementById('dialog-tx-saved'));
    deleteDialogCtrl = CoinKeeper.modal.bind(document.getElementById('dialog-tx-delete'), {
      onClose: function () {
        pendingDeleteTx = null;
      }
    });

    document.querySelectorAll('[data-tx-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedType = btn.dataset.txType;
        renderTypeToggle();
      });
    });

    const nominalInput = document.getElementById('input-nominal');
    nominalInput.addEventListener('input', function () {
      const digits = nominalInput.value.replace(/[^0-9]/g, '');
      if (nominalInput.value !== digits) {
        nominalInput.value = digits;
      }
      validateNominal(nominalTouched);
      syncSubmitButton();
    });
    nominalInput.addEventListener('blur', function () {
      nominalTouched = true;
      validateNominal(true);
      syncSubmitButton();
    });

    const dateInput = document.getElementById('input-tanggal');
    dateInput.addEventListener('change', function () {
      validateDate(true);
      syncSubmitButton();
    });

    document.getElementById('btn-batal-tx').addEventListener('click', function () {
      resetForm();
      CoinKeeper.feedback.toast('Formulir transaksi direset.', 'success');
    });

    document.getElementById('form-transaksi').addEventListener('submit', handleSubmit);

    document.getElementById('btn-confirm-delete').addEventListener('click', function () {
      if (!pendingDeleteTx) return;
      const deleted = CoinKeeper.store.deleteTransaction(pendingDeleteTx.id);
      deleteDialogCtrl.close();
      if (deleted) {
        lastDeletedRecord = deleted;
        renderHistory();
        renderUndoState();
        CoinKeeper.feedback.toast('Transaksi "' + deleted.removed.title + '" dihapus.', 'danger');
      }
    });

    renderTypeToggle();
    renderCategoryChips();
    renderHistory();
    syncSubmitButton();
  });
})(window);
