/* ==========================================================================
   CoinKeeper Halaman Masuk (Form FSM, Validasi 3-Fase & Modal Bantuan)
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});
  const SESSION_KEY = 'coinkeeper_session_v1';
  const DEMO_EMAIL = 'faqih@student.ub.ac.id';
  const DEMO_PASSWORD = 'coinkeeper123';
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function populateStaticIcons() {
    const slots = document.querySelectorAll('[data-icon]');
    slots.forEach(function (slot) {
      const name = slot.getAttribute('data-icon');
      const size = Number(slot.getAttribute('data-size')) || 18;
      if (name && CoinKeeper.icons) {
        CoinKeeper.fmt.clear(slot);
        slot.appendChild(CoinKeeper.icons.create(name, size));
      }
    });

    const closeBtn = document.querySelector('[data-close-icon]');
    if (closeBtn && CoinKeeper.icons) {
      CoinKeeper.fmt.clear(closeBtn);
      closeBtn.appendChild(CoinKeeper.icons.create('close', 18));
    }
  }

  function deriveNameFromEmail(email) {
    const cleaned = String(email || '').trim().toLowerCase();
    if (cleaned === DEMO_EMAIL) {
      return 'Faqih';
    }
    const localPart = cleaned.split('@')[0] || '';
    const words = localPart
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return 'Pengguna';
    }

    return words
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  function setFieldError(inputEl, errorEl, message) {
    const fmt = CoinKeeper.fmt;
    fmt.clear(errorEl);

    if (!message) {
      inputEl.setAttribute('aria-invalid', 'false');
      errorEl.hidden = true;
      return;
    }

    inputEl.setAttribute('aria-invalid', 'true');
    errorEl.appendChild(CoinKeeper.icons.create('warning', 14));
    errorEl.appendChild(fmt.el('span', { text: message }));
    errorEl.hidden = false;
  }

  function saveSessionAndSyncProfile(email, remember) {
    const displayName = deriveNameFromEmail(email);
    const session = {
      authenticated: true,
      email: email,
      name: displayName,
      remember: Boolean(remember),
      loggedInAt: new Date().toISOString()
    };

    try {
      global.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (err) {
      /* Abaikan jika penyimpanan peramban dibatasi */
    }

    if (CoinKeeper.store) {
      const state = CoinKeeper.store.load();
      state.profile = state.profile || { name: displayName, accountType: 'Akun pribadi' };
      state.profile.name = displayName;
      CoinKeeper.store.save(state);
    }

    return displayName;
  }

  function init() {
    populateStaticIcons();

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const rememberInput = document.getElementById('login-remember');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const togglePasswordBtn = document.getElementById('btn-toggle-password');
    const submitBtn = document.getElementById('btn-login-submit');
    const fillDemoBtn = document.getElementById('btn-fill-demo');
    const forgotBtn = document.getElementById('btn-forgot-password');
    const forgotDialogEl = document.getElementById('dialog-forgot-password');
    const modalDemoBtn = document.getElementById('btn-modal-use-demo');

    if (!form || !emailInput || !passwordInput || !submitBtn) {
      return;
    }

    const touched = { email: false, password: false };
    let isSubmitting = false;

    function getEmailError() {
      const val = emailInput.value.trim();
      if (!val) {
        return 'Alamat email wajib diisi.';
      }
      if (!EMAIL_PATTERN.test(val)) {
        return 'Format email tidak valid. Contoh: nama@email.ac.id';
      }
      return '';
    }

    function getPasswordError() {
      const val = passwordInput.value;
      if (!val) {
        return 'Kata sandi wajib diisi.';
      }
      if (val.trim().length < 6) {
        return 'Kata sandi minimal terdiri dari 6 karakter.';
      }
      return '';
    }

    function updateSubmitState() {
      if (isSubmitting) {
        submitBtn.disabled = true;
        return;
      }
      const hasInputs = emailInput.value.trim().length > 0 && passwordInput.value.length > 0;
      submitBtn.disabled = !hasInputs;
    }

    function renderPasswordToggle(isVisible) {
      if (!togglePasswordBtn) return;
      CoinKeeper.fmt.clear(togglePasswordBtn);
      togglePasswordBtn.appendChild(
        CoinKeeper.icons.create(isVisible ? 'eyeOff' : 'eye', 18)
      );
      togglePasswordBtn.setAttribute(
        'aria-label',
        isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
      );
      togglePasswordBtn.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
    }

    function setLoadingState(loading) {
      isSubmitting = loading;
      submitBtn.disabled = loading;
      submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
      CoinKeeper.fmt.clear(submitBtn);

      if (loading) {
        submitBtn.classList.add('btn--loading');
        submitBtn.appendChild(CoinKeeper.fmt.el('span', { className: 'spinner', 'aria-hidden': 'true' }));
        submitBtn.appendChild(CoinKeeper.fmt.el('span', { text: 'Memeriksa akun...' }));
      } else {
        submitBtn.classList.remove('btn--loading');
        submitBtn.appendChild(document.createTextNode('Masuk ke Dasbor'));
      }
    }

    function fillDemoCredentials() {
      emailInput.value = DEMO_EMAIL;
      passwordInput.value = DEMO_PASSWORD;
      if (rememberInput) {
        rememberInput.checked = true;
      }
      touched.email = true;
      touched.password = true;
      setFieldError(emailInput, emailError, '');
      setFieldError(passwordInput, passwordError, '');
      updateSubmitState();
      if (CoinKeeper.feedback) {
        CoinKeeper.feedback.toast('Kredensial akun demo siap digunakan.', 'success');
      }
      submitBtn.focus();
    }

    renderPasswordToggle(false);
    updateSubmitState();

    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', function () {
        const nextVisible = passwordInput.type === 'password';
        passwordInput.type = nextVisible ? 'text' : 'password';
        renderPasswordToggle(nextVisible);
        if (CoinKeeper.feedback) {
          CoinKeeper.feedback.announce(
            nextVisible ? 'Kata sandi ditampilkan.' : 'Kata sandi disembunyikan.'
          );
        }
      });
    }

    emailInput.addEventListener('blur', function () {
      touched.email = true;
      setFieldError(emailInput, emailError, getEmailError());
      updateSubmitState();
    });

    emailInput.addEventListener('input', function () {
      if (touched.email) {
        setFieldError(emailInput, emailError, getEmailError());
      }
      updateSubmitState();
    });

    passwordInput.addEventListener('blur', function () {
      touched.password = true;
      setFieldError(passwordInput, passwordError, getPasswordError());
      updateSubmitState();
    });

    passwordInput.addEventListener('input', function () {
      if (touched.password) {
        setFieldError(passwordInput, passwordError, getPasswordError());
      }
      updateSubmitState();
    });

    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', fillDemoCredentials);
    }

    const forgotModal = forgotDialogEl && CoinKeeper.modal
      ? CoinKeeper.modal.bind(forgotDialogEl, { initialFocus: '#btn-modal-use-demo' })
      : null;

    if (forgotBtn && forgotModal) {
      forgotBtn.addEventListener('click', function () {
        forgotModal.open(forgotBtn);
      });
    }

    if (modalDemoBtn && forgotModal) {
      modalDemoBtn.addEventListener('click', function () {
        forgotModal.close();
        fillDemoCredentials();
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (isSubmitting) return;

      touched.email = true;
      touched.password = true;
      const emailErrMsg = getEmailError();
      const passwordErrMsg = getPasswordError();

      setFieldError(emailInput, emailError, emailErrMsg);
      setFieldError(passwordInput, passwordError, passwordErrMsg);

      if (emailErrMsg || passwordErrMsg) {
        updateSubmitState();
        if (CoinKeeper.feedback) {
          CoinKeeper.feedback.announce('Periksa kembali alamat email dan kata sandi.');
        }
        if (emailErrMsg) {
          emailInput.focus();
        } else {
          passwordInput.focus();
        }
        return;
      }

      const cleanEmail = emailInput.value.trim();
      setLoadingState(true);
      if (CoinKeeper.feedback) {
        CoinKeeper.feedback.announce('Memeriksa akun dan menyiapkan dasbor.');
      }

      global.setTimeout(function () {
        const displayName = saveSessionAndSyncProfile(
          cleanEmail,
          rememberInput ? rememberInput.checked : false
        );
        if (CoinKeeper.feedback) {
          CoinKeeper.feedback.toast('Berhasil masuk sebagai ' + displayName + '.', 'success');
        }
        global.setTimeout(function () {
          global.location.href = '../index.html';
        }, 120);
      }, 360);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
