/* =============================================
   Service — Focus Mode
   Filters emails to show only important/urgent
   when enabled, hides noise
   ============================================= */

const FocusModeService = {
  isEnabled() {
    return DB.get('focus_mode', false);
  },

  toggle() {
    const current = this.isEnabled();
    DB.set('focus_mode', !current);
    return !current;
  },

  enable() {
    DB.set('focus_mode', true);
  },

  disable() {
    DB.set('focus_mode', false);
  },

  getSettings() {
    return DB.get('focus_settings', {
      hidePromotions: true,
      hideSocial: true,
      hideNewsletters: true,
      hideLowPriority: true,
      showImportant: true,
      showUrgent: true,
      showPersonal: true,
      showStarred: true,
    });
  },

  saveSettings(settings) {
    DB.set('focus_settings', settings);
  },

  filterEmails(emails) {
    if (!this.isEnabled()) return emails;

    const settings = this.getSettings();

    return emails.filter(email => {
      const label = (email.label || '').toLowerCase();
      const subject = (email.subject || '').toLowerCase();
      const body = (email.body || email.preview || '').toLowerCase();
      const from = (email.from?.email || '').toLowerCase();

      if (email.starred && settings.showStarred) return true;

      if (settings.hidePromotions && label === 'promotions') return false;
      if (settings.hideSocial && label === 'social') return false;

      if (settings.hideNewsletters) {
        const isNewsletter = from.includes('newsletter') || from.includes('noreply') ||
          from.includes('no-reply') || from.includes('notifications') ||
          body.includes('unsubscribe');
        if (isNewsletter && label !== 'primary') return false;
      }

      if (settings.hideLowPriority) {
        const isLowPriority = ['sale', 'deal', 'discount', 'offer', 'promo', 'free trial']
          .some(w => subject.includes(w) || body.includes(w));
        if (isLowPriority && !email.starred) return false;
      }

      return true;
    });
  },

  getFilteredCount(emails) {
    if (!this.isEnabled()) return 0;
    return emails.length - this.filterEmails(emails).length;
  },

  getStats(emails) {
    const total = emails.length;
    const filtered = this.filterEmails(emails);
    return {
      total,
      visible: filtered.length,
      hidden: total - filtered.length,
      hiddenPercent: total > 0 ? Math.round(((total - filtered.length) / total) * 100) : 0,
    };
  },
};
