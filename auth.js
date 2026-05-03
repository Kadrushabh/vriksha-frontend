// ========================================
// VRIKSHA - User Auth (Email/Password)
// ========================================

var BACKEND_URL = window.BACKEND_URL || 'https://vriksha-production.up.railway.app';

class VrikshaAuth {
  constructor() {
    this.user = null;
    this.isLoggedIn = false;
    this._loadFromCache();
    this._verifySession();
  }

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

  _saveToCache(user) {
    try { localStorage.setItem('vriksha_user', JSON.stringify(user)); } catch (e) {}
  }

  _clearCache() {
    localStorage.removeItem('vriksha_user');
  }

  async _verifySession() {
    try {
      const { ok, data } = await this._requestJSON('/api/auth/me');
      if (ok && data.loggedIn && data.user) {
        this.user = data.user;
        this.isLoggedIn = true;
        this._saveToCache(data.user);
        this.updateUI();
      } else {
        // If we already have cached user data, keep user logged in until explicit logout.
        // This prevents cross-page flicker/logouts when backend session checks are inconsistent.
        if (!this.user) {
          this.isLoggedIn = false;
          this.updateUI();
        }
      }
    } catch (e) {
      console.log('Session verify skipped (server busy?):', e.message);
    }
  }

  async checkSession() { return this._verifySession(); }

  async login(email, password) {
    const btn = document.getElementById('loginSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (data.success && data.user) {
        this.user = data.user;
        this.isLoggedIn = true;
        this._saveToCache(data.user);
        this.closeLoginModal();
        this.updateUI();
        this.showToast('Welcome back! 🌿');

        if (window.checkout && typeof window.checkout.prefillFromUser === 'function') {
          window.checkout.prefillFromUser(this.user);
        }

        return true;
      }

      this.showError(data.error || 'Login failed');
      if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
      return false;
    } catch (e) {
      this.showError('Connection failed. Please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
      return false;
    }
  }

  async register(payload) {
    const btn = document.getElementById('signupSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (ok && data.success && data.user) {
        this.user = data.user;
        this.isLoggedIn = true;
        this._saveToCache(data.user);
        this.closeLoginModal();
        this.updateUI();
        this.showToast('Account created successfully ✨');

        if (window.checkout && typeof window.checkout.prefillFromUser === 'function') {
          window.checkout.prefillFromUser(this.user);
        }

        return true;
      }

      this.showError(data.error || 'Registration failed');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      return false;
    } catch (e) {
      this.showError('Connection failed. Please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      return false;
    }
  }

  async logout() {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {}
    this._clearCache();
    this.user = null;
    this.isLoggedIn = false;
    this.updateUI();
    this.showToast('Logged out');
  }

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
          <div class="login-modal-header" style="text-align:center;margin-bottom:1rem;">
            <h2 style="margin-bottom:.25rem;">Welcome</h2>
            <p style="color:var(--color-text-muted);font-size:.875rem;">Login or create your VRIKSHA account</p>
          </div>
          <div style="display:flex;gap:.5rem;margin-bottom:1rem;">
            <button id="authTabLogin" class="login-btn" style="flex:1;" onclick="auth.switchAuthTab('login')">Login</button>
            <button id="authTabSignup" class="login-btn" style="flex:1;background:var(--color-bg-warm);color:var(--color-primary);" onclick="auth.switchAuthTab('signup')">Create Account</button>
          </div>

          <div id="authError" style="color:var(--color-error);font-size:0.75rem;text-align:center;margin-bottom:0.75rem;display:none;"></div>

          <div id="loginPanel">
            <input type="email" class="phone-input" id="loginEmail" placeholder="Email address" autocomplete="email" style="margin-bottom:.75rem;" />
            <input type="password" class="phone-input" id="loginPassword" placeholder="Password" autocomplete="current-password" style="margin-bottom:.75rem;" />
            <button class="login-btn" id="loginSubmitBtn" onclick="auth.handleLogin()">Login</button>
          </div>

          <div id="signupPanel" style="display:none;">
            <input type="text" class="phone-input" id="signupFirstName" placeholder="First name" autocomplete="given-name" style="margin-bottom:.75rem;" />
            <input type="text" class="phone-input" id="signupLastName" placeholder="Last name" autocomplete="family-name" style="margin-bottom:.75rem;" />
            <input type="email" class="phone-input" id="signupEmail" placeholder="Email address" autocomplete="email" style="margin-bottom:.75rem;" />
            <input type="tel" class="phone-input" id="signupPhone" placeholder="Phone (10 digits)" inputmode="numeric" maxlength="10" style="margin-bottom:.75rem;" />
            <input type="password" class="phone-input" id="signupPassword" placeholder="Password (min 6 chars)" autocomplete="new-password" style="margin-bottom:.75rem;" />
            <button class="login-btn" id="signupSubmitBtn" onclick="auth.handleRegister()">Create Account</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    this.switchAuthTab('login');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('loginEmail')?.focus(), 150);
  }

  switchAuthTab(tab) {
    const loginPanel = document.getElementById('loginPanel');
    const signupPanel = document.getElementById('signupPanel');
    const loginTab = document.getElementById('authTabLogin');
    const signupTab = document.getElementById('authTabSignup');
    this.hideError();

    if (tab === 'signup') {
      if (loginPanel) loginPanel.style.display = 'none';
      if (signupPanel) signupPanel.style.display = 'block';
      if (loginTab) loginTab.style.background = 'var(--color-bg-warm)';
      if (loginTab) loginTab.style.color = 'var(--color-primary)';
      if (signupTab) signupTab.style.background = 'var(--color-primary)';
      if (signupTab) signupTab.style.color = '#fff';
    } else {
      if (loginPanel) loginPanel.style.display = 'block';
      if (signupPanel) signupPanel.style.display = 'none';
      if (loginTab) loginTab.style.background = 'var(--color-primary)';
      if (loginTab) loginTab.style.color = '#fff';
      if (signupTab) signupTab.style.background = 'var(--color-bg-warm)';
      if (signupTab) signupTab.style.color = 'var(--color-primary)';
    }
  }

  handleLogin() {
    const email = (document.getElementById('loginEmail')?.value || '').trim();
    const password = document.getElementById('loginPassword')?.value || '';
    if (!email || !password) {
      this.showError('Please enter email and password');
      return;
    }
    this.login(email, password);
  }

  handleRegister() {
    const firstName = (document.getElementById('signupFirstName')?.value || '').trim();
    const lastName  = (document.getElementById('signupLastName')?.value || '').trim();
    const email     = (document.getElementById('signupEmail')?.value || '').trim();
    const phone     = (document.getElementById('signupPhone')?.value || '').replace(/\D/g, '');
    const password  = document.getElementById('signupPassword')?.value || '';

    if (!firstName || !lastName || !email || !phone || !password) {
      this.showError('Please fill all required fields');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      this.showError('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }

    this.register({ firstName, lastName, email, phone, password });
  }

  closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  showError(msg) {
    const el = document.getElementById('authError');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  hideError() {
    const el = document.getElementById('authError');
    if (el) el.style.display = 'none';
  }

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

let auth;
document.addEventListener('DOMContentLoaded', () => {
  auth = new VrikshaAuth();
  window.auth = auth;
});
