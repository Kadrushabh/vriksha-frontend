// ========================================
// VRIKSHA - User Auth (Phone OTP Login)
// ========================================

var BACKEND_URL = 'https://vriksha-production.up.railway.app';

class VrikshaAuth {
  constructor() {
    this.user = null;
    this.isLoggedIn = false;
    this.otpTimer = null;
    this.otpCountdown = 0;
    this._loadFromCache();   // instant — reads localStorage, no network
    this._verifySession();   // background — validates with server
  }

  // ── Load from localStorage (instant on every page load) ────────────
  _loadFromCache() {
    try {
      const cached = localStorage.getItem('vriksha_user');
      if (cached) {
        this.user = JSON.parse(cached);
        this.isLoggedIn = true;
        this.updateUI();
      }
    } catch (e) {
      localStorage.removeItem('vriksha_user');
    }
  }

  // ── Save user to localStorage ───────────────────────────────────────
  _saveToCache(user) {
    try { localStorage.setItem('vriksha_user', JSON.stringify(user)); } catch (e) {}
  }

  // ── Clear localStorage cache ────────────────────────────────────────
  _clearCache() {
    localStorage.removeItem('vriksha_user');
  }

  // ── Background session verify (non-blocking) ────────────────────────
  // Confirms with server. If server is slow/offline, keeps user logged in.
  // Only logs out if server explicitly says session is invalid.
  async _verifySession() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await res.json();
      if (data.loggedIn && data.user) {
        this.user = data.user;
        this.isLoggedIn = true;
        this._saveToCache(data.user);
        this.updateUI();
      } else {
        // Server explicitly says session is invalid — clear cache and log out
        this._clearCache();
        this.user = null;
        this.isLoggedIn = false;
        this.updateUI();
      }
    } catch (e) {
      // Network error or timeout — keep showing cached login, don't log out
      console.log('Session verify skipped (server busy?):', e.message);
    }
  }

  // ── Legacy alias ────────────────────────────────────────────────────
  async checkSession() { return this._verifySession(); }

  // ── Send OTP ────────────────────────────────────────────────────────
  async sendOTP(phone) {
    if (!/^\d{10}$/.test(phone)) {
      this.showError('Please enter a valid 10-digit mobile number');
      return false;
    }

    const btn = document.getElementById('sendOtpBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone })
      });
      const data = await res.json();

      if (data.success) {
        this.showOTPStep(phone);
        this.startTimer();
        if (data.otp) {
          console.log('Dev OTP:', data.otp);
          this.autoFillOTP(data.otp);
        }
        return true;
      } else {
        this.showError(data.error || 'Could not send OTP');
        if (btn) { btn.disabled = false; btn.textContent = 'Get OTP'; }
        return false;
      }
    } catch (e) {
      this.showError('Connection failed. Please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Get OTP'; }
      return false;
    }
  }

  // ── Verify OTP ──────────────────────────────────────────────────────
  async verifyOTP(phone, otp) {
    if (otp.length !== 6) {
      this.showError('Please enter the 6-digit OTP');
      return false;
    }

    const btn = document.getElementById('verifyOtpBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();

      if (data.success && data.user) {
        this.user = data.user;
        this.isLoggedIn = true;
        this._saveToCache(data.user);   // persist across pages
        this.closeLoginModal();
        this.updateUI();
        this.showToast('Welcome back! 🌿');

        // Auto-fill checkout form if on checkout page
        if (window.checkout && typeof window.checkout.prefillFromUser === 'function') {
          window.checkout.prefillFromUser(this.user);
        }

        return true;
      } else {
        this.showError(data.error || 'Verification failed');
        if (btn) { btn.disabled = false; btn.textContent = 'Verify & Login'; }
        return false;
      }
    } catch (e) {
      this.showError('Connection failed. Please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Verify & Login'; }
      return false;
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────
  async logout() {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) { /* silent */ }
    this._clearCache();   // remove from localStorage
    this.user = null;
    this.isLoggedIn = false;
    this.updateUI();
    this.showToast('Logged out');
  }

  // ── Get user orders ─────────────────────────────────────────────────
  async getOrders() {
    if (!this.isLoggedIn) return [];
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/orders`, { credentials: 'include' });
      const data = await res.json();
      return data.orders || [];
    } catch (e) {
      return [];
    }
  }

  // ── UI: Show Login Modal ────────────────────────────────────────────
  showLoginModal(redirectAfter) {
    this.redirectAfter = redirectAfter;
    let modal = document.getElementById('loginModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'loginModal';
      modal.className = 'login-modal-overlay';
      modal.innerHTML = `
        <div class="login-modal">
          <button class="login-close" onclick="auth.closeLoginModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div id="loginPhoneStep">
            <div class="login-modal-header">
              <h2>Login / Sign Up</h2>
              <p>Enter your mobile number to continue</p>
            </div>
            <div class="otp-phone-input">
              <span class="phone-prefix">+91</span>
              <input type="tel" class="phone-input" id="loginPhone" placeholder="Mobile Number" maxlength="10" inputmode="numeric" autocomplete="tel">
            </div>
            <div id="loginError" style="color:var(--color-error);font-size:0.75rem;text-align:center;margin-bottom:0.75rem;display:none;"></div>
            <button class="login-btn" id="sendOtpBtn" onclick="auth.handleSendOTP()">Get OTP</button>
            <p style="text-align:center;font-size:0.6875rem;color:var(--color-text-muted);margin-top:1rem;">By continuing, you agree to our Terms of Service</p>
          </div>
          <div id="loginOtpStep" style="display:none;">
            <div class="login-modal-header">
              <h2>Verify OTP</h2>
              <p>Enter the 6-digit code sent to <strong id="otpPhoneDisplay">+91 XXXXXXXXXX</strong></p>
            </div>
            <div class="otp-inputs" id="otpInputs">
              <input type="tel" class="otp-input" maxlength="1" inputmode="numeric" data-index="0">
              <input type="tel" class="otp-input" maxlength="1" inputmode="numeric" data-index="1">
              <input type="tel" class="otp-input" maxlength="1" inputmode="numeric" data-index="2">
              <input type="tel" class="otp-input" maxlength="1" inputmode="numeric" data-index="3">
              <input type="tel" class="otp-input" maxlength="1" inputmode="numeric" data-index="4">
              <input type="tel" class="otp-input" maxlength="1" inputmode="numeric" data-index="5">
            </div>
            <div class="otp-timer" id="otpTimerText">Resend OTP in <strong id="otpCountdownText">30s</strong></div>
            <div id="loginError2" style="color:var(--color-error);font-size:0.75rem;text-align:center;margin-bottom:0.75rem;display:none;"></div>
            <button class="login-btn" id="verifyOtpBtn" onclick="auth.handleVerifyOTP()">Verify & Login</button>
            <button style="display:block;margin:0.75rem auto 0;background:none;border:none;color:var(--color-text-muted);font-size:0.8125rem;cursor:pointer;" onclick="auth.showPhoneStep()">← Change Number</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      this.bindOTPInputs();
    }

    this.showPhoneStep();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('loginPhone')?.focus(), 300);
  }

  closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (this.otpTimer) clearInterval(this.otpTimer);
  }

  showPhoneStep() {
    document.getElementById('loginPhoneStep').style.display = 'block';
    document.getElementById('loginOtpStep').style.display = 'none';
    this.hideError();
  }

  showOTPStep(phone) {
    document.getElementById('loginPhoneStep').style.display = 'none';
    document.getElementById('loginOtpStep').style.display = 'block';
    document.getElementById('otpPhoneDisplay').textContent = '+91 ' + phone.replace(/(\d{5})(\d{5})/, '$1 $2');
    this._currentPhone = phone;
    this.hideError();
    document.querySelectorAll('.otp-input').forEach(i => i.value = '');
    setTimeout(() => document.querySelector('.otp-input')?.focus(), 100);
  }

  // ── OTP Input Auto-advance ──────────────────────────────────────────
  bindOTPInputs() {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.otp-input');
      inputs.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
          const val = e.target.value.replace(/\D/g, '');
          e.target.value = val.slice(0, 1);
          if (val && idx < inputs.length - 1) inputs[idx + 1].focus();
          const otp = Array.from(inputs).map(i => i.value).join('');
          if (otp.length === 6) this.handleVerifyOTP();
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !e.target.value && idx > 0) inputs[idx - 1].focus();
        });
        input.addEventListener('paste', (e) => {
          e.preventDefault();
          const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
          pasted.split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
          if (pasted.length === 6) this.handleVerifyOTP();
        });
      });
    }, 100);
  }

  autoFillOTP(otp) {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.otp-input');
      otp.split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
    }, 500);
  }

  // ── Timer ───────────────────────────────────────────────────────────
  startTimer() {
    this.otpCountdown = 30;
    const timerEl = document.getElementById('otpTimerText');
    if (timerEl) timerEl.innerHTML = `Resend OTP in <strong id="otpCountdownText">${this.otpCountdown}s</strong>`;
    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      const el = document.getElementById('otpCountdownText');
      if (el) el.textContent = this.otpCountdown + 's';
      if (this.otpCountdown <= 0) {
        clearInterval(this.otpTimer);
        const t = document.getElementById('otpTimerText');
        if (t) t.innerHTML = `Didn't receive? <a onclick="auth.handleResendOTP()" style="color:var(--color-primary);font-weight:600;cursor:pointer;">Resend OTP</a>`;
      }
    }, 1000);
  }

  // ── Handlers ────────────────────────────────────────────────────────
  handleSendOTP() {
    const phone = document.getElementById('loginPhone')?.value?.replace(/\D/g, '');
    this.sendOTP(phone);
  }

  handleVerifyOTP() {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(i => i.value).join('');
    this.verifyOTP(this._currentPhone, otp);
  }

  handleResendOTP() {
    this.sendOTP(this._currentPhone);
  }

  // ── Error Display ───────────────────────────────────────────────────
  showError(msg) {
    const el1 = document.getElementById('loginError');
    const el2 = document.getElementById('loginError2');
    const target = document.getElementById('loginOtpStep')?.style.display !== 'none' ? el2 : el1;
    if (target) { target.textContent = msg; target.style.display = 'block'; }
  }

  hideError() {
    ['loginError', 'loginError2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  // ── UI Updates ──────────────────────────────────────────────────────
  updateUI() {
    const userBtnMobile = document.getElementById('userBtnMobile');
    if (userBtnMobile) userBtnMobile.classList.toggle('active', this.isLoggedIn);
    const userBtnDesktop = document.getElementById('userBtnDesktop');
    if (userBtnDesktop) userBtnDesktop.classList.toggle('active', this.isLoggedIn);
    window.dispatchEvent(new CustomEvent('authChange', { detail: { isLoggedIn: this.isLoggedIn, user: this.user } }));
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage') || document.getElementById('toastMsg');
    if (toast && toastMsg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }
}

// Initialize
let auth;
document.addEventListener('DOMContentLoaded', () => {
  auth = new VrikshaAuth();
  window.auth = auth;
});