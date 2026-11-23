/* ==========================================================================
   CoinKeeper Seed Data — Sesuai Angka & Profil Figma web-hi-fi (124:2)
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  CoinKeeper.SEED = {
    profile: {
      name: 'Faqih',
      accountType: 'Akun pribadi'
    },
    activeMonth: '2026-11',
    defaultDate: '2026-11-23',
    categories: [
      'Makan',
      'Transport',
      'Belanja',
      'Hiburan',
      'Tagihan',
      'Pendidikan',
      'Lainnya'
    ],
    budgetCategories: [
      'Makan',
      'Belanja',
      'Hiburan',
      'Transport',
      'Tagihan'
    ],
    /* Saldo dasar sebelum 4 transaksi terbaru:
       41.000 + 1.500.000 (Uang saku) - 18.000 (Ojek) - 65.000 (Streaming) - 28.000 (Makan) = 1.430.000 */
    baseBalanceBeforeHistory: 41000,
    budgets: {
      Makan: 700000,
      Belanja: 400000,
      Hiburan: 300000,
      Transport: 300000,
      Tagihan: 300000
    },
    /* Pengeluaran historis per bulan sebelum 4 transaksi terbaru di Nov 2026:
       - Sep 2026: total Rp 1.510.000 (Makan 620rb, Belanja 280rb, Hiburan 210rb, Transport 170rb, Tagihan 230rb)
       - Okt 2026: total Rp 1.770.000 (Makan 690rb, Belanja 350rb, Hiburan 310rb, Transport 190rb, Tagihan 230rb)
       - Nov 2026 dasar (+ 3 pengeluaran terbaru = 650rb, 310rb, 360rb, 180rb, 230rb -> total Rp 1.730.000) */
    priorMonthlySpending: {
      '2026-09': {
        Makan: 620000,
        Belanja: 280000,
        Hiburan: 210000,
        Transport: 170000,
        Tagihan: 230000
      },
      '2026-10': {
        Makan: 690000,
        Belanja: 350000,
        Hiburan: 310000,
        Transport: 190000,
        Tagihan: 230000
      },
      '2026-11': {
        Makan: 622000,
        Belanja: 310000,
        Hiburan: 295000,
        Transport: 162000,
        Tagihan: 230000
      }
    },
    baselinePrevMonthTotal: {
      '2026-09': 1560000
    },
    transactions: [
      {
        id: 'tx-1',
        type: 'pengeluaran',
        title: 'Ojek kampus',
        category: 'Transport',
        amount: 18000,
        date: '2026-11-23',
        note: 'Ojek kampus'
      },
      {
        id: 'tx-2',
        type: 'pemasukan',
        title: 'Uang saku',
        category: 'Lainnya',
        amount: 1500000,
        date: '2026-11-22',
        note: 'Uang saku'
      },
      {
        id: 'tx-3',
        type: 'pengeluaran',
        title: 'Langganan streaming',
        category: 'Hiburan',
        amount: 65000,
        date: '2026-11-21',
        note: 'Langganan streaming'
      },
      {
        id: 'tx-4',
        type: 'pengeluaran',
        title: 'Makan siang',
        category: 'Makan',
        amount: 28000,
        date: '2026-11-20',
        note: 'Makan siang'
      }
    ],
    savingsGoals: [
      {
        id: 'goal-laptop',
        name: 'Laptop baru',
        collected: 1200000,
        target: 10000000,
        deadline: '2027-03-31'
      },
      {
        id: 'goal-darurat',
        name: 'Dana darurat',
        collected: 700000,
        target: 3000000,
        deadline: '2027-06-30'
      }
    ],
    savingsDepositsTotal: 0
  };
})(window);
