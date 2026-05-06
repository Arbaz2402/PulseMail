/* =============================================
   Page — Settings
   ============================================= */

const SettingsPage = {
  init() {
    const theme = DB.getTheme();
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = theme;

    this._renderConnection();
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

  changeTheme(theme) {
    DB.setTheme(theme);
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
