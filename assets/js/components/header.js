/* =============================================
   Component — Header (with Focus Mode + Reminders)
   ============================================= */

const Header = {
  render(container) {
    const session = DB.getSession();
    const initials = (session?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const mode = DB.isGmailMode() ? 'Gmail' : 'Demo';
    const focusActive = typeof FocusModeService !== 'undefined' && FocusModeService.isEnabled();
    const reminderCount = typeof ReminderService !== 'undefined' ? ReminderService.getPendingReminders().length : 0;

    const avatarHTML = session?.picture
      ? `<img src="${session.picture}" alt="${session.name}" referrerpolicy="no-referrer" />`
      : initials;

    container.innerHTML = `
      <header class="header">
        <div class="header__left">
          <button class="header__hamburger" id="hamburgerBtn" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="header__search">
            <svg class="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" id="headerSearch" placeholder="Search emails..." />
          </div>
        </div>
        <div class="header__right">
          <div class="focus-toggle ${focusActive ? 'active' : ''}" id="focusToggle" title="Focus Mode">
            <div class="focus-toggle__switch"></div>
            <span class="focus-toggle__label">Focus</span>
          </div>

          <div class="reminder-bell" id="reminderBell">
            <button class="header__icon-btn" id="reminderBtn" title="Reminders">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              ${reminderCount ? `<span class="reminder-bell__badge">${reminderCount}</span>` : ''}
            </button>
            <div class="reminder-dropdown" id="reminderDropdown">
              <div class="reminder-dropdown__header">
                <span class="reminder-dropdown__title">Follow-up Reminders</span>
                <a href="reminders.html" class="reminder-dropdown__link">View all</a>
              </div>
              <div class="reminder-dropdown__list" id="reminderList"></div>
            </div>
          </div>

          <button class="header__icon-btn" id="refreshBtn" title="Refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </button>
          <button class="header__icon-btn" id="themeToggle" title="Toggle theme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <div class="header__divider"></div>
          <div class="header__profile" id="profileDropdown">
            <div class="header__avatar">${avatarHTML}</div>
            <div class="header__user-info">
              <div class="header__user-name">${session?.name || 'User'}</div>
              <div class="header__user-email">${mode} Mode</div>
            </div>
          </div>
        </div>
      </header>
    `;

    this._bindEvents();
    this._populateReminders();
  },

  _bindEvents() {
    document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebarOverlay')?.classList.toggle('active');
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const current = DB.getTheme();
      DB.setTheme(current === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('refreshBtn')?.addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('profileDropdown')?.addEventListener('click', () => {
      if (confirm('Sign out of PulseMail?')) {
        DB.clearSession();
        if (typeof GmailAPI !== 'undefined') GmailAPI.clearToken();
        window.location.href = '../index.html';
      }
    });

    const search = document.getElementById('headerSearch');
    let timer;
    search?.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = search.value.trim();
        if (q.length >= 2) {
          window.location.href = `inbox.html?search=${encodeURIComponent(q)}`;
        }
      }, 500);
    });

    document.getElementById('focusToggle')?.addEventListener('click', () => {
      if (typeof FocusModeService === 'undefined') return;
      const enabled = FocusModeService.toggle();
      document.getElementById('focusToggle')?.classList.toggle('active', enabled);
      if (typeof Toast !== 'undefined') {
        Toast.show(enabled ? 'Focus Mode ON — showing important emails only' : 'Focus Mode OFF — showing all emails', 'info');
      }
      document.dispatchEvent(new CustomEvent('focusModeChanged', { detail: { enabled } }));
    });

    const reminderBtn = document.getElementById('reminderBtn');
    const reminderDropdown = document.getElementById('reminderDropdown');
    reminderBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      reminderDropdown?.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      reminderDropdown?.classList.remove('open');
    });

    reminderDropdown?.addEventListener('click', (e) => e.stopPropagation());
  },

  _populateReminders() {
    if (typeof ReminderService === 'undefined') return;
    const list = document.getElementById('reminderList');
    if (!list) return;

    const reminders = ReminderService.getPendingReminders();
    if (reminders.length === 0) {
      list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.82rem;">No pending follow-ups</div>';
      return;
    }

    list.innerHTML = reminders.slice(0, 5).map(r => `
      <div class="reminder-item">
        <div class="reminder-item__dot"></div>
        <div class="reminder-item__content">
          <div class="reminder-item__subject">${r.subject}</div>
          <div class="reminder-item__meta">From ${r.from} · Opened ${ReminderService.getTimeAgo(r.firstOpened)}</div>
        </div>
        <div class="reminder-item__actions">
          <button class="reminder-item__btn reminder-item__btn--snooze" title="Snooze 24h" onclick="event.stopPropagation(); ReminderService.snooze('${r.emailId}'); location.reload();">⏰</button>
          <button class="reminder-item__btn reminder-item__btn--complete" title="Mark done" onclick="event.stopPropagation(); ReminderService.markCompleted('${r.emailId}'); location.reload();">✓</button>
        </div>
      </div>
    `).join('');
  },
};
