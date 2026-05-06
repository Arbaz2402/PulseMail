/* =============================================
   Page — Reminders Dashboard
   ============================================= */

const RemindersPage = {
  init() {
    this.renderStats();
    this.renderPending();
    this.renderCompleted();

    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
      const all = ReminderService.getAllReminders();
      all.filter(r => r.status === 'completed').forEach(r => {
        ReminderService.dismiss(r.emailId);
      });
      Toast.success('Completed reminders cleared');
      this.renderCompleted();
      this.renderStats();
    });
  },

  renderStats() {
    const stats = ReminderService.getStats();
    const el = document.getElementById('reminderStats');
    if (!el) return;

    el.innerHTML = `
      <div class="reminder-stat">
        <span class="reminder-stat__value">${stats.overdue}</span>
        <span class="reminder-stat__label">Overdue</span>
      </div>
      <div class="reminder-stat">
        <span class="reminder-stat__value" style="color: var(--warning)">${stats.snoozed}</span>
        <span class="reminder-stat__label">Snoozed</span>
      </div>
      <div class="reminder-stat">
        <span class="reminder-stat__value" style="color: var(--success)">${stats.completed}</span>
        <span class="reminder-stat__label">Completed</span>
      </div>
      <div class="reminder-stat">
        <span class="reminder-stat__value" style="color: var(--text-secondary)">${stats.total}</span>
        <span class="reminder-stat__label">Total Tracked</span>
      </div>
    `;
  },

  renderPending() {
    const el = document.getElementById('reminderList');
    if (!el) return;

    const pending = ReminderService.getPendingReminders();
    const snoozed = ReminderService.getAllReminders().filter(r => r.status === 'snoozed');
    const items = [...pending, ...snoozed];

    if (items.length === 0) {
      el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:0.88rem;">No pending follow-ups. You\'re all caught up!</div>';
      return;
    }

    el.innerHTML = items.map(r => {
      const timeLabel = r.status === 'snoozed'
        ? `Snoozed until ${new Date(r.snoozedUntil).toLocaleString()}`
        : `Opened ${ReminderService.getTimeAgo(r.firstOpened)} · ${r.openCount} view${r.openCount > 1 ? 's' : ''}`;
      const dotClass = r.status === 'snoozed' ? 'reminder-item__dot--snoozed' : '';

      return `
        <div class="reminder-list-item">
          <div class="reminder-list-item__avatar" style="background: ${r.avatarColor || '#6366F1'}">${(r.from || '?')[0].toUpperCase()}</div>
          <div class="reminder-list-item__info">
            <div class="reminder-list-item__subject">${r.subject}</div>
            <div class="reminder-list-item__from">${r.from} · ${timeLabel}</div>
          </div>
          <div class="reminder-list-item__time">
            ${r.overdueDays ? r.overdueDays + 'd overdue' : r.overdueHours ? r.overdueHours + 'h' : ''}
          </div>
          <div class="reminder-list-item__actions">
            <button class="btn btn--sm btn--secondary" onclick="RemindersPage.snooze('${r.emailId}')">Snooze</button>
            <button class="btn btn--sm btn--primary" onclick="RemindersPage.complete('${r.emailId}')">Done</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCompleted() {
    const el = document.getElementById('completedList');
    if (!el) return;

    const completed = ReminderService.getAllReminders().filter(r => r.status === 'completed');

    if (completed.length === 0) {
      el.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No completed items yet</div>';
      return;
    }

    el.innerHTML = completed.slice(0, 10).map(r => `
      <div class="reminder-list-item" style="opacity: 0.6">
        <div class="reminder-list-item__avatar" style="background: ${r.avatarColor || '#6366F1'}">${(r.from || '?')[0].toUpperCase()}</div>
        <div class="reminder-list-item__info">
          <div class="reminder-list-item__subject" style="text-decoration: line-through">${r.subject}</div>
          <div class="reminder-list-item__from">${r.from}</div>
        </div>
        <span class="sub-item__status sub-item__status--active">Completed</span>
      </div>
    `).join('');
  },

  snooze(emailId) {
    ReminderService.snooze(emailId, 24);
    Toast.info('Snoozed for 24 hours');
    this.renderPending();
    this.renderStats();
  },

  complete(emailId) {
    ReminderService.markCompleted(emailId);
    Toast.success('Marked as completed');
    this.renderPending();
    this.renderCompleted();
    this.renderStats();
  },
};

document.addEventListener('DOMContentLoaded', () => RemindersPage.init());
