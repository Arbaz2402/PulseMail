/* =============================================
   Service — Follow-up Reminder Agent
   Tracks opened emails, detects unreplied,
   shows reminder notifications with snooze
   ============================================= */

const ReminderService = {
  STORAGE_KEY: 'pm_reminders',
  DEFAULT_THRESHOLD_HOURS: 24,

  _getAll() {
    return DB.get('reminders', {});
  },

  _save(data) {
    DB.set('reminders', data);
  },

  getSettings() {
    return DB.get('reminder_settings', {
      enabled: true,
      thresholdHours: this.DEFAULT_THRESHOLD_HOURS,
      soundEnabled: false,
    });
  },

  saveSettings(settings) {
    DB.set('reminder_settings', settings);
  },

  trackOpen(emailId, email) {
    const all = this._getAll();
    if (all[emailId] && all[emailId].status === 'completed') return;
    if (all[emailId]) {
      all[emailId].openCount = (all[emailId].openCount || 1) + 1;
      all[emailId].lastOpened = Date.now();
    } else {
      all[emailId] = {
        emailId,
        subject: email.subject || '(no subject)',
        from: email.from?.name || email.from?.email || 'Unknown',
        fromEmail: email.from?.email || '',
        avatarColor: email.avatarColor || '#6366F1',
        firstOpened: Date.now(),
        lastOpened: Date.now(),
        openCount: 1,
        replied: false,
        status: 'pending',
        snoozedUntil: null,
      };
    }
    this._save(all);
  },

  markReplied(emailId) {
    const all = this._getAll();
    if (all[emailId]) {
      all[emailId].replied = true;
      all[emailId].status = 'completed';
      this._save(all);
    }
  },

  markCompleted(emailId) {
    const all = this._getAll();
    if (all[emailId]) {
      all[emailId].status = 'completed';
      all[emailId].completedAt = Date.now();
      this._save(all);
    }
  },

  snooze(emailId, hours = 24) {
    const all = this._getAll();
    if (all[emailId]) {
      all[emailId].snoozedUntil = Date.now() + (hours * 3600000);
      all[emailId].status = 'snoozed';
      this._save(all);
    }
  },

  dismiss(emailId) {
    const all = this._getAll();
    if (all[emailId]) {
      all[emailId].status = 'dismissed';
      this._save(all);
    }
  },

  getPendingReminders() {
    const settings = this.getSettings();
    if (!settings.enabled) return [];

    const all = this._getAll();
    const threshold = settings.thresholdHours * 3600000;
    const now = Date.now();
    const pending = [];

    for (const id in all) {
      const r = all[id];
      if (r.status === 'completed' || r.status === 'dismissed') continue;
      if (r.replied) continue;

      if (r.status === 'snoozed' && r.snoozedUntil && now < r.snoozedUntil) continue;

      if (r.status === 'snoozed' && r.snoozedUntil && now >= r.snoozedUntil) {
        r.status = 'pending';
      }

      const elapsed = now - r.firstOpened;
      if (elapsed >= threshold) {
        r.overdueDays = Math.floor(elapsed / 86400000);
        r.overdueHours = Math.floor(elapsed / 3600000);
        pending.push(r);
      }
    }

    pending.sort((a, b) => a.firstOpened - b.firstOpened);
    return pending;
  },

  getAllReminders() {
    const all = this._getAll();
    return Object.values(all).sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));
  },

  getStats() {
    const all = this._getAll();
    const values = Object.values(all);
    return {
      total: values.length,
      pending: values.filter(r => r.status === 'pending' && !r.replied).length,
      snoozed: values.filter(r => r.status === 'snoozed').length,
      completed: values.filter(r => r.status === 'completed').length,
      overdue: this.getPendingReminders().length,
    };
  },

  getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  clearAll() {
    DB.remove('reminders');
  },
};
