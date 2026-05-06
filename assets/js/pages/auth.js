/* =============================================
   Page — Auth (Real Google + Demo Login)
   ============================================= */

const Auth = {
  _tokenClient: null,

  init() {
    if (DB.isLoggedIn()) {
      window.location.href = 'pages/inbox.html';
      return;
    }

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    loginForm?.addEventListener('submit', e => { e.preventDefault(); this.demoLogin(); });
    signupForm?.addEventListener('submit', e => { e.preventDefault(); this.demoSignup(); });

    switchToSignup?.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('demoAuthSection').style.display = 'none';
      signupForm.style.display = 'block';
      document.getElementById('googleAuthSection').style.display = 'none';
      document.querySelector('.auth-divider').style.display = 'none';
    });

    switchToLogin?.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('demoAuthSection').style.display = 'block';
      signupForm.style.display = 'none';
      document.getElementById('googleAuthSection').style.display = 'block';
      document.querySelector('.auth-divider').style.display = 'flex';
    });

    this._initGoogleAuth();
  },

  _initGoogleAuth() {
    const clientId = DB.getClientId();
    if (!clientId) return;

    const waitForGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        clearInterval(waitForGoogle);
        this._tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: (resp) => this._handleTokenResponse(resp),
        });
      }
    }, 200);
  },

  googleLogin() {
    if (!this._tokenClient) {
      this._initGoogleAuth();
      setTimeout(() => {
        if (this._tokenClient) this._tokenClient.requestAccessToken();
        else this.showError('Google API still loading. Please try again.');
      }, 1000);
      return;
    }

    this._tokenClient.requestAccessToken();
  },

  async _handleTokenResponse(response) {
    if (response.error) {
      this.showError('Google login failed: ' + response.error);
      return;
    }

    GmailAPI.setToken(response.access_token);

    try {
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${response.access_token}` },
      }).then(r => r.json());

      const profile = await GmailAPI.getProfile();

      DB.setSession({
        name: userInfo.name || userInfo.email,
        email: profile.emailAddress || userInfo.email,
        picture: userInfo.picture || null,
        mode: 'gmail',
      });

      window.location.href = 'pages/inbox.html';
    } catch (err) {
      this.showError('Failed to fetch profile: ' + err.message);
      GmailAPI.clearToken();
    }
  },

  demoLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      this.showError('Please fill all fields');
      return;
    }

    const users = DB.getDemoUsers();
    const user = users.find(u => u.email === email);

    if (user && user.password !== password) {
      this.showError('Invalid credentials');
      return;
    }

    DB.setSession({
      name: user?.name || email.split('@')[0],
      email,
      mode: 'demo',
    });

    if (!user) {
      DB.saveDemoUser({ name: email.split('@')[0], email, password });
    }

    window.location.href = 'pages/inbox.html';
  },

  demoSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
      this.showError('Please fill all fields');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }

    const users = DB.getDemoUsers();
    if (users.find(u => u.email === email)) {
      this.showError('Email already registered');
      return;
    }

    DB.saveDemoUser({ name, email, password });
    DB.setSession({ name, email, mode: 'demo' });

    window.location.href = 'pages/inbox.html';
  },

  showError(msg) {
    const el = document.getElementById('authError');
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
      setTimeout(() => el.classList.remove('visible'), 5000);
    }
  },

  resetAll() {
    if (confirm('Are you sure you want to reset all credentials and data? This will remove your Google Client ID and demo account data.')) {
      DB.clearAll();
      alert('Application reset. You can now set up your credentials again.');
      window.location.reload();
    }
  },
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
