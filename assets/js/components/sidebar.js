/* =============================================
   Component — Sidebar (with AI features nav)
   ============================================= */

const Sidebar = {
  render(container, activePage = 'inbox') {
    const reminderStats = typeof ReminderService !== 'undefined' ? ReminderService.getStats() : { overdue: 0 };

    container.innerHTML = `
      <div class="sidebar" id="sidebar">
        <div class="sidebar__logo">
          <div class="sidebar__logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <div class="sidebar__logo-text">Pulse<span>Mail</span></div>
        </div>

        <div class="sidebar__compose">
          <a href="compose.html" class="sidebar__compose-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Compose
          </a>
        </div>

        <nav class="sidebar__nav">
          <a href="inbox.html" class="sidebar__nav-item ${activePage === 'inbox' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Inbox
            <span class="sidebar__badge" id="sidebarBadgeUnread" style="display:none"></span>
          </a>
          <a href="starred.html" class="sidebar__nav-item ${activePage === 'starred' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Starred
            <span class="sidebar__badge" id="sidebarBadgeStarred" style="display:none"></span>
          </a>
          <a href="sent.html" class="sidebar__nav-item ${activePage === 'sent' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg>
            Sent
          </a>
          <a href="drafts.html" class="sidebar__nav-item ${activePage === 'drafts' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            Drafts
            <span class="sidebar__badge" id="sidebarBadgeDrafts" style="display:none"></span>
          </a>
          <a href="trash.html" class="sidebar__nav-item ${activePage === 'trash' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Trash
          </a>

          <div class="sidebar__divider"></div>
          <div class="sidebar__section-title">AI Features</div>

          <a href="reminders.html" class="sidebar__nav-item ${activePage === 'reminders' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Reminders
            ${reminderStats.overdue ? `<span class="sidebar__badge">${reminderStats.overdue}</span>` : ''}
          </a>
          <a href="subscriptions.html" class="sidebar__nav-item ${activePage === 'subscriptions' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/></svg>
            Subscriptions
          </a>

          <div class="sidebar__divider"></div>

          <a href="settings.html" class="sidebar__nav-item ${activePage === 'settings' ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </a>
        </nav>

        <div class="sidebar__storage">
          <div class="sidebar__storage-bar">
            <div class="sidebar__storage-fill" style="width: 35%"></div>
          </div>
          <div class="sidebar__storage-text">5.2 GB of 15 GB used</div>
        </div>
      </div>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
    `;

    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('active');
    });

    this._loadStatsAsync();
  },

  async _loadStatsAsync() {
    try {
      const stats = await MailService.getStats();
      this._updateBadge('sidebarBadgeUnread', stats.unread);
      this._updateBadge('sidebarBadgeStarred', stats.starred);
      this._updateBadge('sidebarBadgeDrafts', stats.drafts);
    } catch (e) {
      // Stats failed silently — sidebar remains usable without badges
    }
  },

  _updateBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count) {
      el.textContent = count;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  },
};
