/* ==========================================================================
   Page 05: Rencana Tabungan Logic (Donut SVG, Deposit Validation, New Goal, Undo)
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let activeGoal = null;
  let lastActionUndo = null;
  let depositDialogCtrl = null;
  let newGoalDialogCtrl = null;
  let isProcessing = false;

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

  function createDonutSvg(pct, isComplete) {
    const size = 96;
    const stroke = 10;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'goal-donut__svg');
    svg.setAttribute('viewBox', '0 0 96 96');
    svg.setAttribute('aria-hidden', 'true');

    const track = document.createElementNS(SVG_NS, 'circle');
    track.setAttribute('cx', '48');
    track.setAttribute('cy', '48');
    track.setAttribute('r', String(r));
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke', 'var(--color-border-card)');
    track.setAttribute('stroke-width', String(stroke));

    const arc = document.createElementNS(SVG_NS, 'circle');
    arc.setAttribute('cx', '48');
    arc.setAttribute('cy', '48');
    arc.setAttribute('r', String(r));
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', isComplete ? 'var(--color-status-success-bar)' : 'var(--color-action-primary)');
    arc.setAttribute('stroke-width', String(stroke));
    arc.setAttribute('stroke-linecap', 'round');
    arc.setAttribute('stroke-dasharray', circumference.toFixed(2));
    arc.setAttribute('stroke-dashoffset', offset.toFixed(2));

    svg.appendChild(track);
    svg.appendChild(arc);

    return CoinKeeper.fmt.el('div', { className: 'goal-donut' }, [
      svg,
      CoinKeeper.fmt.el('span', { className: 'goal-donut__pct tabular-num', text: pct + '%' })
    ]);
  }

  function renderUndoBanner() {
    const banner = document.getElementById('tabungan-undo-banner');
    if (!lastActionUndo) {
      CoinKeeper.feedback.renderUndoBanner(banner, null);
      return;
    }

    const fmt = CoinKeeper.fmt;
    if (lastActionUndo.kind === 'deposit') {
      CoinKeeper.feedback.renderUndoBanner(banner, {
        title: 'Setoran ke ' + lastActionUndo.goalName + ' tercatat',
        detail: 'Nominal ' + fmt.rupiah(lastActionUndo.amount) + ' ditambahkan ke target tabungan.',
        undoLabel: 'Urungkan setoran',
        onUndo: function () {
          CoinKeeper.store.undoDeposit(lastActionUndo.goalId, lastActionUndo.amount);
          lastActionUndo = null;
          renderUndoBanner();
          renderPage();
          CoinKeeper.feedback.toast('Setoran tabungan dibatalkan.', 'success');
        }
      });
    } else if (lastActionUndo.kind === 'new-goal') {
      CoinKeeper.feedback.renderUndoBanner(banner, {
        title: 'Target "' + lastActionUndo.goalName + '" ditambahkan',
        detail: 'Target tabungan baru siap menerima setoran.',
        undoLabel: 'Urungkan target',
        onUndo: function () {
          CoinKeeper.store.removeGoal(lastActionUndo.goalId);
          lastActionUndo = null;
          renderUndoBanner();
          renderPage();
          CoinKeeper.feedback.toast('Penambahan target baru dibatalkan.', 'success');
        }
      });
    }
  }

  function renderPage() {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const store = CoinKeeper.store;

    const state = store.load();
    const savings = store.getSavingsSummary(state);
    const currentSaldo = store.getBalance(state);

    document.getElementById('tabungan-subtitle').textContent = 'Total terkumpul ' + fmt.rupiah(savings.totalCollected);
    document.getElementById('summary-savings-total').textContent = fmt.rupiah(savings.totalCollected);
    document.getElementById('summary-goals-count').textContent = savings.goals.length + ' target aktif';
    document.getElementById('summary-available-saldo').textContent = 'Saldo utama tersedia: ' + fmt.rupiah(currentSaldo);

    const grid = document.getElementById('goals-grid');
    const emptyEl = document.getElementById('goals-empty');
    fmt.clear(grid);
    fmt.clear(emptyEl);

    if (savings.goals.length === 0) {
      grid.hidden = true;
      emptyEl.hidden = false;
      emptyEl.appendChild(el('span', { className: 'empty-state__icon' }, CoinKeeper.icons.create('piggy', 28)));
      emptyEl.appendChild(el('p', { className: 'empty-state__title', text: 'Belum ada target tabungan' }));
      emptyEl.appendChild(el('p', { className: 'empty-state__desc', text: 'Tekan tombol + Target Baru untuk membuat rencana tabungan pertama Anda.' }));
      return;
    }

    grid.hidden = false;
    emptyEl.hidden = true;

    savings.goals.forEach(function (goal) {
      const setorBtn = el('button', {
        type: 'button',
        className: 'btn btn--primary btn--full',
        'aria-label': 'Setor tabungan ke ' + goal.name
      }, [
        el('span', { 'aria-hidden': 'true', text: '+' }),
        el('span', { text: 'Setor' })
      ]);

      setorBtn.addEventListener('click', function () {
        openDepositModal(goal, setorBtn);
      });

      const badge = goal.isComplete
        ? CoinKeeper.ui.createBadge({ badgeClass: 'badge--success', icon: 'check' }, 'Target tercapai!')
        : null;

      const card = el('article', { className: 'card goal-card' }, [
        el('div', { className: 'goal-card__header' }, [
          el('h2', { className: 'goal-card__title', text: goal.name }),
          badge
        ]),
        el('div', { className: 'goal-card__progress-row' }, [
          createDonutSvg(goal.pct, goal.isComplete),
          el('div', { className: 'goal-card__amounts' }, [
            el('span', { className: 'goal-card__label', text: 'Terkumpul' }),
            el('span', { className: 'goal-card__collected tabular-num', text: fmt.rupiah(goal.collected) }),
            el('span', { className: 'goal-card__target tabular-num', text: 'dari ' + fmt.rupiah(goal.target) })
          ])
        ]),
        el('hr', { className: 'divider' }),
        el('p', { className: 'goal-card__deadline', text: 'Tenggat ' + fmt.dateId(goal.deadline) }),
        el('div', { className: 'goal-card__action' }, setorBtn)
      ]);

      grid.appendChild(card);
    });
  }

  /* ---- Modal Setor ---- */
  function validateDepositInput(showMessage) {
    const fmt = CoinKeeper.fmt;
    const input = document.getElementById('input-deposit-amount');
    const errorEl = document.getElementById('error-deposit-amount');
    const helperEl = document.getElementById('helper-deposit-amount');
    const raw = input.value.trim();
    const numeric = fmt.parseNumeric(raw);
    const availableSaldo = CoinKeeper.store.getBalance(CoinKeeper.store.load());

    if (!raw) {
      helperEl.textContent = 'Contoh: 100000 (tanpa titik atau koma).';
      if (showMessage) {
        return setError(input, errorEl, 'Nominal setoran wajib diisi: kolom masih kosong. Masukkan angka lebih dari 0.');
      }
      return setError(input, errorEl, '') && false;
    }

    if (!Number.isFinite(numeric) || numeric <= 0) {
      helperEl.textContent = 'Contoh: 100000 (tanpa titik atau koma).';
      if (showMessage) {
        return setError(input, errorEl, 'Nominal setoran tidak valid: harus lebih dari Rp 0. Ubah menjadi angka positif.');
      }
      return false;
    }

    if (numeric > availableSaldo) {
      helperEl.textContent = 'Saldo utama tersedia: ' + fmt.rupiah(availableSaldo) + '.';
      return setError(
        input,
        errorEl,
        'Saldo tidak cukup: setoran ' + fmt.rupiah(numeric) + ' melebihi saldo utama Anda (' +
        fmt.rupiah(availableSaldo) + '). Kurangi nominal setoran agar kebutuhan harian tetap aman.'
      );
    }

    helperEl.textContent = 'Setara ' + fmt.rupiah(numeric) + ' (sisa saldo setelah setor: ' + fmt.rupiah(availableSaldo - numeric) + ').';
    return setError(input, errorEl, '');
  }

  function openDepositModal(goal, triggerBtn) {
    activeGoal = goal;
    const fmt = CoinKeeper.fmt;
    const state = CoinKeeper.store.load();
    const availableSaldo = CoinKeeper.store.getBalance(state);

    document.getElementById('dialog-deposit-title').textContent = 'Setor ' + goal.name;
    document.getElementById('dialog-deposit-desc').textContent =
      'Terkumpul ' + fmt.rupiah(goal.collected) + ' dari target ' + fmt.rupiah(goal.target) +
      '. Saldo utama tersedia: ' + fmt.rupiah(availableSaldo) + '.';

    const input = document.getElementById('input-deposit-amount');
    input.value = '';
    setError(input, document.getElementById('error-deposit-amount'), '');
    document.getElementById('helper-deposit-amount').textContent = 'Contoh: 100000 (tanpa titik atau koma).';
    document.getElementById('btn-confirm-deposit').disabled = true;

    depositDialogCtrl.open(triggerBtn);
  }

  function handleConfirmDeposit(evt) {
    evt.preventDefault();
    if (isProcessing || !activeGoal) return;

    if (!validateDepositInput(true)) {
      document.getElementById('input-deposit-amount').focus();
      document.getElementById('btn-confirm-deposit').disabled = true;
      return;
    }

    const numeric = CoinKeeper.fmt.parseNumeric(document.getElementById('input-deposit-amount').value);
    const btn = document.getElementById('btn-confirm-deposit');
    isProcessing = true;
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    global.setTimeout(function () {
      const res = CoinKeeper.store.depositToGoal(activeGoal.id, numeric);
      isProcessing = false;
      btn.disabled = false;
      btn.textContent = 'Konfirmasi setor';

      if (res.error) {
        validateDepositInput(true);
        return;
      }

      lastActionUndo = {
        kind: 'deposit',
        goalId: res.goal.id,
        goalName: res.goal.name,
        amount: res.amount
      };
      depositDialogCtrl.close();
      renderPage();
      renderUndoBanner();

      if (res.goal.collected >= res.goal.target) {
        CoinKeeper.feedback.toast('Selamat! Target "' + res.goal.name + '" tercapai!', 'success');
      } else {
        CoinKeeper.feedback.toast('Setoran ' + CoinKeeper.fmt.rupiah(res.amount) + ' ke ' + res.goal.name + ' tercatat.', 'success');
      }
    }, 150);
  }

  /* ---- Modal Target Baru ---- */
  function validateNewGoal(showMessage) {
    const fmt = CoinKeeper.fmt;
    const nameInput = document.getElementById('input-goal-name');
    const targetInput = document.getElementById('input-goal-target');
    const deadlineInput = document.getElementById('input-goal-deadline');

    let firstInvalid = null;

    if (!nameInput.value.trim()) {
      if (showMessage) {
        setError(nameInput, document.getElementById('error-goal-name'), 'Nama target wajib diisi: kolom nama masih kosong. Tuliskan tujuan tabungan, misal Biaya KKN.');
      }
      firstInvalid = firstInvalid || nameInput;
    } else {
      setError(nameInput, document.getElementById('error-goal-name'), '');
    }

    const numericTarget = fmt.parseNumeric(targetInput.value);
    if (!targetInput.value.trim() || !Number.isFinite(numericTarget) || numericTarget <= 0) {
      if (showMessage) {
        setError(targetInput, document.getElementById('error-goal-target'), 'Nominal tujuan tidak valid: masukkan angka lebih dari Rp 0, contoh 2000000.');
      }
      firstInvalid = firstInvalid || targetInput;
    } else {
      setError(targetInput, document.getElementById('error-goal-target'), '');
      document.getElementById('helper-goal-target').textContent = 'Target: ' + fmt.rupiah(numericTarget) + '.';
    }

    if (!deadlineInput.value) {
      if (showMessage) {
        setError(deadlineInput, document.getElementById('error-goal-deadline'), 'Tenggat wajib dipilih: pilih perkiraan tanggal target tercapai.');
      }
      firstInvalid = firstInvalid || deadlineInput;
    } else {
      setError(deadlineInput, document.getElementById('error-goal-deadline'), '');
    }

    return firstInvalid;
  }

  function handleCreateGoal(evt) {
    evt.preventDefault();
    if (isProcessing) return;

    const firstInvalid = validateNewGoal(true);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const nameVal = document.getElementById('input-goal-name').value.trim();
    const targetVal = CoinKeeper.fmt.parseNumeric(document.getElementById('input-goal-target').value);
    const deadlineVal = document.getElementById('input-goal-deadline').value;
    const btn = document.getElementById('btn-create-goal');

    isProcessing = true;
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    global.setTimeout(function () {
      const res = CoinKeeper.store.addGoal({
        name: nameVal,
        target: targetVal,
        deadline: deadlineVal
      });
      isProcessing = false;
      btn.disabled = false;
      btn.textContent = 'Buat target';

      lastActionUndo = {
        kind: 'new-goal',
        goalId: res.goal.id,
        goalName: res.goal.name
      };

      newGoalDialogCtrl.close();
      renderPage();
      renderUndoBanner();
      CoinKeeper.feedback.toast('Target "' + res.goal.name + '" ditambahkan.', 'success');
    }, 150);
  }

  document.addEventListener('DOMContentLoaded', function () {
    depositDialogCtrl = CoinKeeper.modal.bind(document.getElementById('dialog-goal-deposit'), {
      initialFocus: function () {
        return document.getElementById('input-deposit-amount');
      },
      onClose: function () {
        activeGoal = null;
      }
    });

    newGoalDialogCtrl = CoinKeeper.modal.bind(document.getElementById('dialog-goal-new'), {
      initialFocus: function () {
        return document.getElementById('input-goal-name');
      }
    });

    const depositInput = document.getElementById('input-deposit-amount');
    depositInput.addEventListener('input', function () {
      const digits = depositInput.value.replace(/[^0-9]/g, '');
      if (depositInput.value !== digits) {
        depositInput.value = digits;
      }
      const ok = validateDepositInput(false);
      document.getElementById('btn-confirm-deposit').disabled = !ok;
    });
    depositInput.addEventListener('blur', function () {
      if (depositInput.value.trim()) {
        validateDepositInput(true);
      }
    });

    const goalTargetInput = document.getElementById('input-goal-target');
    goalTargetInput.addEventListener('input', function () {
      const digits = goalTargetInput.value.replace(/[^0-9]/g, '');
      if (goalTargetInput.value !== digits) {
        goalTargetInput.value = digits;
      }
      validateNewGoal(false);
    });

    document.getElementById('btn-open-new-goal').addEventListener('click', function (evt) {
      document.getElementById('input-goal-name').value = '';
      document.getElementById('input-goal-target').value = '';
      document.getElementById('input-goal-deadline').value = '2027-08-31';
      document.getElementById('helper-goal-target').textContent = 'Contoh: 2000000 (tanpa titik atau koma).';
      setError(document.getElementById('input-goal-name'), document.getElementById('error-goal-name'), '');
      setError(document.getElementById('input-goal-target'), document.getElementById('error-goal-target'), '');
      setError(document.getElementById('input-goal-deadline'), document.getElementById('error-goal-deadline'), '');
      newGoalDialogCtrl.open(evt.currentTarget);
    });

    document.getElementById('form-goal-deposit').addEventListener('submit', handleConfirmDeposit);
    document.getElementById('form-goal-new').addEventListener('submit', handleCreateGoal);

    renderPage();
  });
})(window);
