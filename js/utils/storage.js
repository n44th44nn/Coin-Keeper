/* ==========================================================================
   CoinKeeper State & LocalStorage Persistence Layer
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});
  const STORAGE_KEY = 'coinkeeper_state_v1';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadState() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.transactions)) {
          return parsed;
        }
      }
    } catch (err) {
      /* Fallback ke seed jika localStorage tidak tersedia */
    }
    return clone(CoinKeeper.SEED);
  }

  function saveState(state) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* Abaikan jika kuota/akses localStorage dibatasi */
    }
    return state;
  }

  function resetState() {
    const fresh = clone(CoinKeeper.SEED);
    saveState(fresh);
    return fresh;
  }

  function getCurrentBalance(state) {
    let balance = Number(state.baseBalanceBeforeHistory) || 0;
    state.transactions.forEach(function (tx) {
      if (tx.type === 'pemasukan') {
        balance += Number(tx.amount) || 0;
      } else {
        balance -= Number(tx.amount) || 0;
      }
    });
    balance -= Number(state.savingsDepositsTotal) || 0;
    return balance;
  }

  function getMonthCategorySpending(state, ym) {
    const base = (state.priorMonthlySpending && state.priorMonthlySpending[ym]) || {};
    const totals = {};

    CoinKeeper.SEED.budgetCategories.forEach(function (cat) {
      totals[cat] = Number(base[cat]) || 0;
    });

    state.transactions.forEach(function (tx) {
      if (tx.type === 'pengeluaran' && typeof tx.date === 'string' && tx.date.slice(0, 7) === ym) {
        const cat = tx.category || 'Lainnya';
        totals[cat] = (totals[cat] || 0) + (Number(tx.amount) || 0);
      }
    });

    return totals;
  }

  function getMonthlySummary(state, ym) {
    const fmt = CoinKeeper.fmt;
    const catTotals = getMonthCategorySpending(state, ym);
    const budgets = state.budgets || {};

    let totalBudget = 0;
    const categoryRows = CoinKeeper.SEED.budgetCategories.map(function (cat) {
      const spent = catTotals[cat] || 0;
      const limit = Number(budgets[cat]) || 0;
      totalBudget += limit;
      return {
        category: cat,
        spent: spent,
        limit: limit,
        status: fmt.budgetStatus(spent, limit)
      };
    });

    /* Pastikan pengeluaran di kategori non-anggaran (mis. Pendidikan/Lainnya) tetap dihitung ke total */
    let totalSpent = 0;
    Object.keys(catTotals).forEach(function (cat) {
      totalSpent += catTotals[cat] || 0;
    });

    const remainingBudget = totalBudget - totalSpent;
    const overallStatus = fmt.budgetStatus(totalSpent, totalBudget);

    const attentionCategories = categoryRows
      .filter(function (row) {
        return row.status.key !== 'aman';
      })
      .sort(function (a, b) {
        return b.status.pct - a.status.pct;
      });

    const overbudgetCategories = categoryRows.filter(function (row) {
      return row.status.key === 'terlampaui';
    });

    let largestCategory = null;
    categoryRows.forEach(function (row) {
      if (!largestCategory || row.spent > largestCategory.spent) {
        largestCategory = row;
      }
    });

    return {
      month: ym,
      totalSpent: totalSpent,
      totalBudget: totalBudget,
      remainingBudget: remainingBudget,
      overallStatus: overallStatus,
      categoryRows: categoryRows,
      attentionCategories: attentionCategories,
      overbudgetCategories: overbudgetCategories,
      largestCategory: largestCategory,
      allCategoryTotals: catTotals
    };
  }

  function getMonthComparison(state, ym) {
    const currentSummary = getMonthlySummary(state, ym);
    const prevKey = CoinKeeper.fmt.prevMonthKey(ym);
    let prevTotal = 0;

    if (state.priorMonthlySpending && state.priorMonthlySpending[prevKey]) {
      prevTotal = getMonthlySummary(state, prevKey).totalSpent;
    } else if (state.baselinePrevMonthTotal && state.baselinePrevMonthTotal[ym] !== undefined) {
      prevTotal = Number(state.baselinePrevMonthTotal[ym]) || 0;
    }

    const delta = currentSummary.totalSpent - prevTotal;
    const pctChange = prevTotal > 0 ? Math.round((Math.abs(delta) / prevTotal) * 100) : 0;

    return {
      currentTotal: currentSummary.totalSpent,
      prevKey: prevKey,
      prevTotal: prevTotal,
      delta: delta,
      pctChange: pctChange
    };
  }

  function getSavingsSummary(state) {
    let totalCollected = 0;
    const goals = (state.savingsGoals || []).map(function (g) {
      const collected = Number(g.collected) || 0;
      const target = Number(g.target) || 1;
      totalCollected += collected;
      const pct = Math.min(100, Math.round((collected / target) * 100));
      return {
        id: g.id,
        name: g.name,
        collected: collected,
        target: target,
        deadline: g.deadline,
        pct: pct,
        isComplete: collected >= target
      };
    });

    return {
      totalCollected: totalCollected,
      goals: goals
    };
  }

  function addTransaction(payload) {
    const state = loadState();
    const tx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type: payload.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran',
      title: payload.title,
      category: payload.category,
      amount: Math.round(Number(payload.amount)),
      date: payload.date,
      note: payload.note || ''
    };
    state.transactions.unshift(tx);
    saveState(state);
    return { state: state, transaction: tx };
  }

  function deleteTransaction(id) {
    const state = loadState();
    const index = state.transactions.findIndex(function (item) {
      return item.id === id;
    });
    if (index === -1) return null;
    const removed = state.transactions.splice(index, 1)[0];
    saveState(state);
    return { state: state, removed: removed, index: index };
  }

  function restoreTransaction(tx, index) {
    const state = loadState();
    const insertAt = Math.min(Math.max(0, Number(index) || 0), state.transactions.length);
    state.transactions.splice(insertAt, 0, tx);
    saveState(state);
    return state;
  }

  function updateBudget(category, newLimit) {
    const state = loadState();
    const previousLimit = Number(state.budgets[category]) || 0;
    state.budgets[category] = Math.round(Number(newLimit));
    saveState(state);
    return { state: state, previousLimit: previousLimit, newLimit: state.budgets[category] };
  }

  function depositToGoal(goalId, amount) {
    const state = loadState();
    const numeric = Math.round(Number(amount));
    const currentSaldo = getCurrentBalance(state);
    if (numeric > currentSaldo) {
      return { error: 'Saldo tidak cukup', available: currentSaldo };
    }
    const goal = state.savingsGoals.find(function (g) {
      return g.id === goalId;
    });
    if (!goal) {
      return { error: 'Target tabungan tidak ditemukan' };
    }
    goal.collected = (Number(goal.collected) || 0) + numeric;
    state.savingsDepositsTotal = (Number(state.savingsDepositsTotal) || 0) + numeric;
    saveState(state);
    return { state: state, goal: clone(goal), amount: numeric };
  }

  function undoDeposit(goalId, amount) {
    const state = loadState();
    const numeric = Math.round(Number(amount));
    const goal = state.savingsGoals.find(function (g) {
      return g.id === goalId;
    });
    if (goal) {
      goal.collected = Math.max(0, (Number(goal.collected) || 0) - numeric);
      state.savingsDepositsTotal = Math.max(0, (Number(state.savingsDepositsTotal) || 0) - numeric);
      saveState(state);
    }
    return state;
  }

  function addGoal(payload) {
    const state = loadState();
    const goal = {
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: payload.name,
      collected: 0,
      target: Math.round(Number(payload.target)),
      deadline: payload.deadline
    };
    state.savingsGoals.push(goal);
    saveState(state);
    return { state: state, goal: goal };
  }

  function removeGoal(goalId) {
    const state = loadState();
    state.savingsGoals = state.savingsGoals.filter(function (g) {
      return g.id !== goalId;
    });
    saveState(state);
    return state;
  }

  CoinKeeper.store = {
    load: loadState,
    save: saveState,
    reset: resetState,
    getBalance: getCurrentBalance,
    getMonthlySummary: getMonthlySummary,
    getMonthComparison: getMonthComparison,
    getSavingsSummary: getSavingsSummary,
    addTransaction: addTransaction,
    deleteTransaction: deleteTransaction,
    restoreTransaction: restoreTransaction,
    updateBudget: updateBudget,
    depositToGoal: depositToGoal,
    undoDeposit: undoDeposit,
    addGoal: addGoal,
    removeGoal: removeGoal
  };

  /* ------------------------------------------------------------------------
     Lapisan Sesi & Autentikasi Lokal (Lintas Halaman)
     ------------------------------------------------------------------------ */
  const SESSION_KEY = 'coinkeeper_session_v1';
  const ALLOWED_PAGES = [
    'index.html',
    'pages/catat-transaksi.html',
    'pages/anggaran.html',
    'pages/laporan.html',
    'pages/tabungan.html'
  ];

  function readSessionFrom(storageObj) {
    try {
      const raw = storageObj && storageObj.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.authenticated === true) {
        return parsed;
      }
    } catch (err) {
      /* Abaikan jika penyimpanan peramban dibatasi */
    }
    return null;
  }

  function getSession() {
    return readSessionFrom(global.localStorage) || readSessionFrom(global.sessionStorage);
  }

  function isAuthenticated() {
    return Boolean(getSession());
  }

  function saveSession(session) {
    const payload = JSON.stringify(session);
    try {
      global.localStorage.removeItem(SESSION_KEY);
    } catch (err) {}
    try {
      global.sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {}

    try {
      const target = session && session.remember ? global.localStorage : global.sessionStorage;
      if (target) {
        target.setItem(SESSION_KEY, payload);
      }
    } catch (err) {
      /* Abaikan jika kuota/akses penyimpanan dibatasi */
    }
    return session;
  }

  function logoutSession() {
    try {
      global.localStorage.removeItem(SESSION_KEY);
    } catch (err) {}
    try {
      global.sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {}
  }

  function resolveSafeNext(nextParam) {
    const candidate = String(nextParam || '').trim();
    return ALLOWED_PAGES.indexOf(candidate) !== -1 ? candidate : 'index.html';
  }

  CoinKeeper.auth = {
    SESSION_KEY: SESSION_KEY,
    getSession: getSession,
    isAuthenticated: isAuthenticated,
    saveSession: saveSession,
    logout: logoutSession,
    resolveSafeNext: resolveSafeNext
  };
})(window);
