/* =============================================
   Storage Service — localStorage persistence
   ============================================= */

const DB = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`pm_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    try { localStorage.setItem(`pm_${key}`, JSON.stringify(value)); }
    catch { /* quota exceeded */ }
  },

  remove(key) {
    localStorage.removeItem(`pm_${key}`);
  },

  /* ── Session ──────────────────────────── */

  setSession(user) {
    this.set('session', {
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      picture: user.picture || null,
      mode: user.mode || 'demo',
      loggedInAt: Date.now(),
    });
  },

  getSession() {
    return this.get('session', null);
  },

  clearSession() {
    this.remove('session');
    this.remove('access_token');
  },

  clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pm_')) {
        localStorage.removeItem(key);
      }
    });
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  isGmailMode() {
    const s = this.getSession();
    return s && s.mode === 'gmail';
  },

  /* ── Settings ─────────────────────────── */

  getSettings() {
    return this.get('settings', {
      theme: 'light',
      density: 'default',
      notifications: true,
      autoRefresh: true,
      refreshInterval: 60,
    });
  },

  saveSettings(settings) {
    this.set('settings', settings);
  },

  getTheme() {
    return this.getSettings().theme || 'light';
  },

  setTheme(theme) {
    const s = this.getSettings();
    s.theme = theme;
    this.saveSettings(s);
    document.documentElement.setAttribute('data-theme', theme);
  },

  /* ── Client ID ────────────────────────── */

  getClientId() {
    return this.get('google_client_id', '462383795718-okj5s0nsprj7o9nvdvkko3l4c5phcnm5.apps.googleusercontent.com');
  },

  setClientId(id) {
    this.set('google_client_id', id);
  },

  /* ── Demo Data ────────────────────────── */

  getDemoEmails() {
    return this.get('demo_emails', null);
  },

  setDemoEmails(emails) {
    this.set('demo_emails', emails);
  },

  getDemoUsers() {
    return this.get('demo_users', []);
  },

  saveDemoUser(user) {
    const users = this.getDemoUsers();
    if (!users.find(u => u.email === user.email)) {
      users.push(user);
      this.set('demo_users', users);
    }
  },
};
