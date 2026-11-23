/* ==========================================================================
   CoinKeeper Shared Shell Layout & Shared UI Element Factories
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});

  const NAV_ITEMS = [
    { id: 'dasbor', label: 'Dasbor', mobileLabel: 'Dasbor', icon: 'home', path: 'index.html' },
    { id: 'catat', label: 'Catat Transaksi', mobileLabel: 'Catat Transaksi', icon: 'list', path: 'pages/catat-transaksi.html' },
    { id: 'anggaran', label: 'Anggaran', mobileLabel: 'Anggaran', icon: 'budget', path: 'pages/anggaran.html' },
    { id: 'laporan', label: 'Laporan', mobileLabel: 'Laporan', icon: 'chart', path: 'pages/laporan.html' },
    { id: 'tabungan', label: 'Tabungan', mobileLabel: 'Tabungan', icon: 'piggy', path: 'pages/tabungan.html' }
  ];

  function resolveHref(rootPrefix, relPath) {
    return rootPrefix + '/' + relPath;
  }

  function renderBrandMark() {
    const el = CoinKeeper.fmt.el;
    return el('div', { className: 'brand-mark' }, [
      el('span', { className: 'brand-mark__badge', 'aria-hidden': 'true' }, [
        CoinKeeper.icons.create('wallet', 18)
      ]),
      el('span', { className: 'brand-mark__name', text: 'CoinKeeper' })
    ]);
  }

  function renderSidebar(activePage, rootPrefix, profile) {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    const el = CoinKeeper.fmt.el;
    CoinKeeper.fmt.clear(sidebar);

    const navList = el('ul', { className: 'sidebar__nav-list' });
    NAV_ITEMS.forEach(function (item) {
      const isActive = item.id === activePage;
      const link = el('a', {
        className: 'sidebar__link',
        href: resolveHref(rootPrefix, item.path),
        'aria-current': isActive ? 'page' : null
      }, [
        CoinKeeper.icons.create(item.icon, 20),
        el('span', { text: item.label })
      ]);
      navList.appendChild(el('li', null, link));
    });

    sidebar.appendChild(el('div', { className: 'sidebar__brand' }, renderBrandMark()));
    sidebar.appendChild(el('p', { className: 'sidebar__section-label', text: 'KEUANGAN PRIBADI' }));
    sidebar.appendChild(el('nav', { 'aria-label': 'Menu utama' }, navList));

    const logoutBtn = el('button', {
      type: 'button',
      id: 'btn-sidebar-logout',
      className: 'sidebar__logout'
    }, [
      CoinKeeper.icons.create('logout', 18),
      el('span', { text: 'Keluar' })
    ]);
    logoutBtn.addEventListener('click', function () {
      handleLogout(rootPrefix);
    });

    sidebar.appendChild(el('div', { className: 'sidebar__footer' }, [
      el('div', { className: 'sidebar__account' }, [
        el('div', { className: 'sidebar__account-info' }, [
          el('span', { className: 'profile-name', text: profile.name }),
          el('span', { className: 'profile-type', text: profile.accountType })
        ]),
        el('span', { className: 'online-dot', role: 'img', 'aria-label': 'Status aktif' })
      ]),
      logoutBtn
    ]));
  }

  function handleLogout(rootPrefix) {
    if (CoinKeeper.auth && typeof CoinKeeper.auth.logout === 'function') {
      CoinKeeper.auth.logout();
    }
    if (CoinKeeper.feedback && typeof CoinKeeper.feedback.announce === 'function') {
      CoinKeeper.feedback.announce('Anda telah keluar dari akun.');
    }
    global.location.href = resolveHref(rootPrefix, 'pages/login.html');
  }

  function renderMobileTopbar(profile, rootPrefix) {
    const topbar = document.getElementById('app-mobile-topbar');
    if (!topbar) return;
    const el = CoinKeeper.fmt.el;
    CoinKeeper.fmt.clear(topbar);

    topbar.appendChild(el('div', { className: 'mobile-topbar__brand' }, [
      renderBrandMark(),
      el('span', { className: 'brand-sublabel', text: 'KEUANGAN PRIBADI' })
    ]));

    const mobileLogoutBtn = el('button', {
      type: 'button',
      id: 'btn-mobile-logout',
      className: 'mobile-topbar__logout',
      'aria-label': 'Keluar dari akun',
      title: 'Keluar'
    }, CoinKeeper.icons.create('logout', 18));
    mobileLogoutBtn.addEventListener('click', function () {
      handleLogout(rootPrefix);
    });

    topbar.appendChild(el('div', { className: 'mobile-topbar__right' }, [
      el('div', { className: 'mobile-topbar__profile' }, [
        el('div', { className: 'profile-row' }, [
          el('span', { className: 'profile-name', text: profile.name }),
          el('span', { className: 'online-dot', 'aria-hidden': 'true' })
        ]),
        el('span', { className: 'profile-type', text: profile.accountType })
      ]),
      mobileLogoutBtn
    ]));
  }

  function renderBottomNav(activePage, rootPrefix) {
    const nav = document.getElementById('app-bottom-nav');
    if (!nav) return;
    const el = CoinKeeper.fmt.el;
    CoinKeeper.fmt.clear(nav);

    const list = el('ul', { className: 'bottom-nav__list' });
    NAV_ITEMS.forEach(function (item) {
      const isActive = item.id === activePage;
      const link = el('a', {
        className: 'bottom-nav__link',
        href: resolveHref(rootPrefix, item.path),
        'aria-current': isActive ? 'page' : null
      }, [
        CoinKeeper.icons.create(item.icon, 20),
        el('span', { text: item.mobileLabel })
      ]);
      list.appendChild(el('li', null, link));
    });

    nav.appendChild(list);
  }

  function renderFooter(screenNum) {
    const footer = document.getElementById('app-footer');
    if (!footer) return;
    const el = CoinKeeper.fmt.el;
    CoinKeeper.fmt.clear(footer);

    footer.appendChild(el('span', { text: 'CoinKeeper · Keuangan Pribadi Mahasiswa' }));
    footer.appendChild(el('span', { className: 'tabular-num', text: screenNum }));
  }

  function initLayout() {
    const body = document.body;
    const activePage = body.dataset.page || 'dasbor';
    const rootPrefix = body.dataset.root || '.';
    const screenNum = body.dataset.screen || '1 / 5';
    const state = CoinKeeper.store.load();
    const profile = state.profile || CoinKeeper.SEED.profile;

    renderSidebar(activePage, rootPrefix, profile);
    renderMobileTopbar(profile, rootPrefix);
    renderBottomNav(activePage, rootPrefix);
    renderFooter(screenNum);
  }

  /* Komponen Dual-Signifier Badge bersama (Warna + Ikon + Teks) */
  function createStatusBadge(statusObj, customLabel) {
    const el = CoinKeeper.fmt.el;
    return el('span', { className: 'badge ' + statusObj.badgeClass }, [
      CoinKeeper.icons.create(statusObj.icon, 14),
      el('span', { text: customLabel || statusObj.label })
    ]);
  }

  /* Komponen Baris Transaksi bersama (Dasbor & Catat Transaksi) */
  function createTransactionItem(tx, options) {
    const fmt = CoinKeeper.fmt;
    const el = fmt.el;
    const opts = options || {};
    const isIncome = tx.type === 'pemasukan';
    const amountClass = 'tx-item__amount tabular-num ' +
      (isIncome ? 'tx-item__amount--income' : 'tx-item__amount--expense');
    const metaText = tx.category + ' · ' + fmt.dateId(tx.date);

    const children = [
      el('div', { className: 'tx-item__main' }, [
        el('div', { className: 'tx-item__title', text: tx.title }),
        el('div', { className: 'tx-item__meta', text: metaText }),
        opts.inlineAmount ? el('div', { className: amountClass, text: fmt.signedRupiah(tx.amount, tx.type) }) : null
      ])
    ];

    const rightChildren = [];
    if (!opts.inlineAmount) {
      rightChildren.push(el('div', { className: amountClass, text: fmt.signedRupiah(tx.amount, tx.type) }));
    }
    if (opts.onDelete) {
      const delBtn = el('button', {
        type: 'button',
        className: 'btn btn--icon btn--icon-danger',
        'aria-label': 'Hapus transaksi ' + tx.title,
        title: 'Hapus transaksi'
      }, CoinKeeper.icons.create('trash', 18));
      delBtn.addEventListener('click', function () {
        opts.onDelete(tx, delBtn);
      });
      rightChildren.push(delBtn);
    }

    if (rightChildren.length > 0) {
      children.push(el('div', { className: 'tx-item__right' }, rightChildren));
    }

    return el('li', { className: 'tx-item' }, children);
  }

  CoinKeeper.layout = {
    init: initLayout
  };

  CoinKeeper.ui = CoinKeeper.ui || {};
  CoinKeeper.ui.createBadge = createStatusBadge;
  CoinKeeper.ui.createTransactionItem = createTransactionItem;
})(window);
