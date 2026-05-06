/* =============================================
   Service — Subscription Tracker
   Detects newsletter/promotional senders,
   tracks frequency, manages unsubscribe state
   ============================================= */

const SubscriptionService = {
  PROMO_DOMAINS: ['newsletter', 'promo', 'marketing', 'updates', 'notifications',
    'noreply', 'no-reply', 'mail', 'info', 'hello', 'team', 'news'],

  PROMO_SENDERS: ['linkedin', 'twitter', 'facebook', 'instagram', 'medium',
    'stripe', 'aws', 'vercel', 'github', 'figma', 'notion', 'slack',
    'spotify', 'netflix', 'youtube', 'google', 'apple', 'microsoft'],

  _getState() {
    return DB.get('subscriptions_state', {});
  },

  _saveState(state) {
    DB.set('subscriptions_state', state);
  },

  analyzeEmails(emails) {
    const senderMap = {};

    emails.forEach(email => {
      const senderEmail = email.from?.email || '';
      const senderName = email.from?.name || senderEmail.split('@')[0];
      const domain = senderEmail.split('@')[1] || '';

      const isSubscription = this._isSubscription(senderEmail, senderName, email);

      if (!isSubscription) return;

      const key = senderEmail.toLowerCase();
      if (!senderMap[key]) {
        senderMap[key] = {
          email: senderEmail,
          name: senderName,
          domain,
          category: this._categorize(senderEmail, senderName, email),
          emailCount: 0,
          emails: [],
          firstSeen: email.date,
          lastSeen: email.date,
          avatarColor: email.avatarColor || '#6366F1',
          initials: (senderName || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        };
      }

      senderMap[key].emailCount++;
      senderMap[key].emails.push(email.id);
      if (new Date(email.date) > new Date(senderMap[key].lastSeen)) {
        senderMap[key].lastSeen = email.date;
      }
      if (new Date(email.date) < new Date(senderMap[key].firstSeen)) {
        senderMap[key].firstSeen = email.date;
      }
    });

    const state = this._getState();
    const subscriptions = Object.values(senderMap).map(sub => ({
      ...sub,
      status: state[sub.email]?.status || 'active',
      muted: state[sub.email]?.muted || false,
    }));

    subscriptions.sort((a, b) => b.emailCount - a.emailCount);
    return subscriptions;
  },

  _isSubscription(email, name, emailData) {
    const lower = email.toLowerCase();
    const nameLower = (name || '').toLowerCase();
    const label = emailData.label || '';

    if (label === 'promotions' || label === 'social' || label === 'updates') return true;

    if (this.PROMO_DOMAINS.some(d => lower.includes(d))) return true;
    if (this.PROMO_SENDERS.some(s => lower.includes(s) || nameLower.includes(s))) return true;

    const body = (emailData.body || emailData.preview || '').toLowerCase();
    if (body.includes('unsubscribe') || body.includes('opt out') || body.includes('email preferences'))
      return true;

    return false;
  },

  _categorize(email, name, emailData) {
    const lower = (email + ' ' + name).toLowerCase();
    const label = emailData.label || '';

    if (label === 'social' || ['linkedin', 'twitter', 'facebook', 'instagram'].some(s => lower.includes(s)))
      return 'Social';
    if (label === 'promotions' || ['sale', 'deal', 'offer', 'promo'].some(s => lower.includes(s)))
      return 'Promotions';
    if (['github', 'vercel', 'aws', 'figma', 'deploy', 'build'].some(s => lower.includes(s)))
      return 'Developer Tools';
    if (['stripe', 'invoice', 'receipt', 'payment', 'bill'].some(s => lower.includes(s)))
      return 'Financial';
    return 'Newsletter';
  },

  unsubscribe(senderEmail) {
    const state = this._getState();
    state[senderEmail] = { ...state[senderEmail], status: 'unsubscribed', unsubscribedAt: Date.now() };
    this._saveState(state);
  },

  resubscribe(senderEmail) {
    const state = this._getState();
    state[senderEmail] = { ...state[senderEmail], status: 'active' };
    this._saveState(state);
  },

  mute(senderEmail) {
    const state = this._getState();
    state[senderEmail] = { ...state[senderEmail], muted: true, mutedAt: Date.now() };
    this._saveState(state);
  },

  unmute(senderEmail) {
    const state = this._getState();
    state[senderEmail] = { ...state[senderEmail], muted: false };
    this._saveState(state);
  },

  getStats(subscriptions) {
    return {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      unsubscribed: subscriptions.filter(s => s.status === 'unsubscribed').length,
      muted: subscriptions.filter(s => s.muted).length,
      totalEmails: subscriptions.reduce((sum, s) => sum + s.emailCount, 0),
      categories: this._groupByCategory(subscriptions),
    };
  },

  _groupByCategory(subs) {
    const groups = {};
    subs.forEach(s => {
      groups[s.category] = (groups[s.category] || 0) + 1;
    });
    return groups;
  },
};
