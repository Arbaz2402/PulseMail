/* =============================================
   Page — Subscription Tracker
   ============================================= */

const SubscriptionsPage = {
  subscriptions: [],
  filter: 'all',

  async init() {
    await this.loadSubscriptions();
    this._bindFilters();
  },

  async loadSubscriptions() {
    try {
      const [inbox, sent] = await Promise.all([
        MailService.getInbox('all'),
        MailService.getSent(),
      ]);

      const allEmails = [...inbox, ...sent];
      this.subscriptions = SubscriptionService.analyzeEmails(allEmails);
      this.renderStats();
      this.renderList();
    } catch (err) {
      document.getElementById('subList').innerHTML =
        `<div class="sub-empty"><h3>Error loading subscriptions</h3><p>${err.message}</p></div>`;
      Toast.error('Failed to analyze subscriptions: ' + err.message);
    }
  },

  renderStats() {
    const stats = SubscriptionService.getStats(this.subscriptions);
    const el = document.getElementById('subStats');
    if (!el) return;

    el.innerHTML = `
      <div class="sub-stat-card">
        <div class="sub-stat-card__icon sub-stat-card__icon--total">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
        </div>
        <span class="sub-stat-card__value">${stats.total}</span>
        <span class="sub-stat-card__label">Total Subscriptions</span>
      </div>
      <div class="sub-stat-card">
        <div class="sub-stat-card__icon sub-stat-card__icon--active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <span class="sub-stat-card__value">${stats.active}</span>
        <span class="sub-stat-card__label">Active</span>
      </div>
      <div class="sub-stat-card">
        <div class="sub-stat-card__icon sub-stat-card__icon--muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-6 6M16 9l6 6"/></svg>
        </div>
        <span class="sub-stat-card__value">${stats.muted}</span>
        <span class="sub-stat-card__label">Muted</span>
      </div>
      <div class="sub-stat-card">
        <div class="sub-stat-card__icon sub-stat-card__icon--emails">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        <span class="sub-stat-card__value">${stats.totalEmails}</span>
        <span class="sub-stat-card__label">Total Emails</span>
      </div>
    `;
  },

  renderList() {
    const el = document.getElementById('subList');
    if (!el) return;

    let filtered = this.subscriptions;
    if (this.filter === 'active') filtered = filtered.filter(s => s.status === 'active' && !s.muted);
    else if (this.filter === 'muted') filtered = filtered.filter(s => s.muted);
    else if (this.filter === 'unsubscribed') filtered = filtered.filter(s => s.status === 'unsubscribed');

    if (filtered.length === 0) {
      el.innerHTML = `
        <div class="sub-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
          <h3>No subscriptions found</h3>
          <p>No ${this.filter !== 'all' ? this.filter + ' ' : ''}subscriptions detected.</p>
        </div>
      `;
      return;
    }

    el.innerHTML = filtered.map(sub => {
      const catClass = sub.category.toLowerCase().replace(/\s+/g, '-');
      const date = MailService.formatDate(sub.lastSeen);
      const statusClass = sub.status === 'unsubscribed' ? 'sub-item__status--unsubscribed' :
                          sub.muted ? 'sub-item__status--muted' : 'sub-item__status--active';
      const statusLabel = sub.status === 'unsubscribed' ? 'Unsubscribed' :
                          sub.muted ? 'Muted' : 'Active';

      return `
        <div class="sub-item">
          <div class="sub-item__avatar" style="background: ${sub.avatarColor}">${sub.initials}</div>
          <div class="sub-item__info">
            <div class="sub-item__name">${sub.name}</div>
            <div class="sub-item__email">${sub.email}</div>
          </div>
          <div class="sub-item__count">
            <span class="sub-item__count-value">${sub.emailCount}</span>
            <span class="sub-item__count-label">emails</span>
          </div>
          <span class="sub-item__category sub-item__category--${catClass}">${sub.category}</span>
          <span class="sub-item__date">${date}</span>
          <span class="sub-item__status ${statusClass}">${statusLabel}</span>
          <div class="sub-item__actions">
            ${sub.status !== 'unsubscribed' ? `
              <button class="sub-item__btn ${sub.muted ? 'sub-item__btn--muted' : ''}" onclick="SubscriptionsPage.toggleMute('${sub.email}', ${sub.muted})">
                ${sub.muted ? 'Unmute' : 'Mute'}
              </button>
              <button class="sub-item__btn sub-item__btn--unsub" onclick="SubscriptionsPage.unsubscribe('${sub.email}')">Unsub</button>
            ` : `
              <button class="sub-item__btn" onclick="SubscriptionsPage.resubscribe('${sub.email}')">Resubscribe</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  _bindFilters() {
    document.querySelectorAll('.sub-filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sub-filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.filter = tab.dataset.filter;
        this.renderList();
      });
    });
  },

  toggleMute(email, isMuted) {
    if (isMuted) SubscriptionService.unmute(email);
    else SubscriptionService.mute(email);
    Toast.show(isMuted ? 'Unmuted' : 'Muted — future emails hidden', 'info');
    this.loadSubscriptions();
  },

  unsubscribe(email) {
    SubscriptionService.unsubscribe(email);
    Toast.success('Unsubscribed');
    this.loadSubscriptions();
  },

  resubscribe(email) {
    SubscriptionService.resubscribe(email);
    Toast.info('Resubscribed');
    this.loadSubscriptions();
  },
};

document.addEventListener('DOMContentLoaded', () => SubscriptionsPage.init());
