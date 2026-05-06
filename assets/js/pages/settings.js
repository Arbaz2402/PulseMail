/* =============================================
   Page — Settings
   ============================================= */

const SettingsPage = {
  init() {
    const theme = DB.getTheme();
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = theme;

    this._renderConnection();
    this._renderClientId();
  },

  _renderConnection() {
    const el = document.getElementById('connectionStatus');
    if (!el) return;

    const isGmail = DB.isGmailMode();
    const session = DB.getSession();

    el.innerHTML = `
      <div class="settings-connection__status">
        <span class="settings-connection__dot ${isGmail ? 'settings-connection__dot--connected' : 'settings-connection__dot--disconnected'}"></span>
        ${isGmail
          ? `Connected as <strong style="margin-left:4px">${session?.email || ''}</strong>`
          : 'Demo Mode — Not connected to Gmail'
        }
      </div>
    `;
  },

  _renderClientId() {
    const el = document.getElementById('clientIdStatus');
    if (!el) return;

    const clientId = DB.getClientId();
    el.textContent = clientId ? `Configured: ${clientId.slice(0, 20)}...` : 'Not configured';
  },

  changeTheme(theme) {
    DB.setTheme(theme);
  },

  configureGmail() {
    const clientId = prompt(
      'Enter your Google OAuth Client ID:\n\n' +
      'To get one:\n' +
      '1. Go to console.cloud.google.com\n' +
      '2. Create project → Enable Gmail API\n' +
      '3. Credentials → Create OAuth Client ID\n' +
      '4. Add http://localhost:8765 to JavaScript origins\n' +
      '5. Copy the Client ID'
    );

    if (clientId && clientId.trim()) {
      DB.setClientId(clientId.trim());
      this._renderClientId();
      Toast.success('Client ID saved! Sign out and sign in with Google to connect.');
    }
  },

  clearData() {
    if (confirm('Clear all local demo data? This cannot be undone.')) {
      DB.remove('demo_emails');
      Toast.success('Local data cleared');
    }
  },

  signOut() {
    if (confirm('Sign out of PulseMail?')) {
      DB.clearSession();
      GmailAPI.clearToken();
      window.location.href = '../index.html';
    }
  },
};

document.addEventListener('DOMContentLoaded', () => SettingsPage.init());
