/* =============================================
   Page — Single Email View
   With AI Summarizer + Smart Reply + Reminder
   ============================================= */

const MailPage = {
  emailId: null,
  email: null,

  async init() {
    const params = new URLSearchParams(window.location.search);
    this.emailId = params.get('id');

    if (!this.emailId) {
      window.location.href = 'inbox.html';
      return;
    }

    await this.load();
  },

  async load() {
    const view = document.getElementById('mailView');

    try {
      this.email = await MailService.getEmail(this.emailId);
      if (!this.email) throw new Error('Email not found');

      await MailService.markRead(this.emailId);

      ReminderService.trackOpen(this.emailId, this.email);

      const summary = SummarizerService.summarize(this.email);
      const smartReplies = SmartReplyService.getSuggestions(this.email);

      const color = this.email.avatarColor || '#6366F1';
      const avatar = this.email.from?.avatar || this.email.from?.name?.[0]?.toUpperCase() || '?';
      const date = new Date(this.email.date).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      });

      view.innerHTML = `
        <div class="mail-view__toolbar">
          <button class="mail-view__toolbar-btn" onclick="history.back()" title="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="mail-view__toolbar-btn" onclick="MailPage.trash()" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
          <button class="mail-view__toolbar-btn" onclick="MailPage.toggleStar()" title="Star">
            <svg viewBox="0 0 24 24" fill="${this.email.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" style="color: ${this.email.starred ? '#D97706' : 'inherit'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
        </div>

        <!-- AI Summary Card -->
        ${this._renderSummary(summary)}

        <div class="mail-view__header">
          <h1 class="mail-view__subject">${this.email.subject}</h1>
          <div class="mail-view__sender-row">
            <div class="mail-view__avatar" style="background: ${color}">${avatar}</div>
            <div class="mail-view__sender-info">
              <div class="mail-view__sender-name">${this.email.from?.name || 'Unknown'}</div>
              <div class="mail-view__sender-email">&lt;${this.email.from?.email || ''}&gt;</div>
              <div class="mail-view__to">to ${this.email.to || 'me'}</div>
            </div>
            <div class="mail-view__date">${date}</div>
          </div>
        </div>

        <div class="mail-view__body">${this.email.body || '<p>No content</p>'}</div>

        <!-- Smart Reply Suggestions -->
        ${this._renderSmartReplies(smartReplies)}

        <div class="mail-view__actions">
          <button class="mail-view__action-btn" onclick="window.location.href='compose.html?reply=${this.emailId}'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
            Reply
          </button>
          <button class="mail-view__action-btn" onclick="window.location.href='compose.html?forward=${this.emailId}'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>
            Forward
          </button>
        </div>
      `;
    } catch (err) {
      view.innerHTML = `<div class="email-list__empty"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  },

  _renderSummary(summary) {
    const priorityClass = `summary-priority--${summary.priority.level}`;

    const actionsHtml = summary.actionRequired.length > 0
      ? `<div class="summary-section">
           <div class="summary-section__title">Action Required</div>
           <div class="summary-actions">${summary.actionRequired.map(a => `<span class="summary-action">${a}</span>`).join('')}</div>
         </div>`
      : '';

    const datesHtml = summary.dates.length > 0
      ? `<div class="summary-section">
           <div class="summary-section__title">Dates & Times</div>
           <div class="summary-dates">${summary.dates.map(d => `<span class="summary-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${d}</span>`).join('')}</div>
         </div>`
      : '';

    return `
      <div class="summary-card open" id="summaryCard">
        <button class="summary-card__toggle" onclick="document.getElementById('summaryCard').classList.toggle('open')">
          <div class="summary-card__toggle-left">
            <div class="summary-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <span class="summary-card__label">AI Summary</span>
            <span class="summary-priority ${priorityClass}">${summary.priority.label}</span>
          </div>
          <svg class="summary-card__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="summary-card__body">
          <div class="summary-card__content">
            <div class="summary-section">
              <div class="summary-section__title">Summary</div>
              <p class="summary-text">${summary.summary}</p>
            </div>
            ${actionsHtml}
            ${datesHtml}
            <div class="summary-section">
              <div class="summary-section__title">Details</div>
              <div class="summary-meta">
                <span class="summary-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  ${summary.wordCount} words
                </span>
                <span class="summary-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${summary.readTime} min read
                </span>
                <span class="summary-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  ${summary.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderSmartReplies(replies) {
    if (!replies || replies.length === 0) return '';

    return `
      <div class="smart-reply">
        <div class="smart-reply__header">
          <svg class="smart-reply__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          <span class="smart-reply__title">Smart Replies</span>
        </div>
        <div class="smart-reply__chips">
          ${replies.map(r => `
            <button class="smart-reply__chip" onclick="MailPage.selectReply(this, '${r.text.replace(/'/g, "\\'")}')">
              ${r.text}
            </button>
          `).join('')}
        </div>
        <div class="smart-reply__compose" id="smartReplyCompose">
          <textarea class="smart-reply__textarea" id="smartReplyText" placeholder="Edit your reply..."></textarea>
          <div class="smart-reply__send-row">
            <button class="smart-reply__cancel" onclick="MailPage.cancelReply()">Cancel</button>
            <button class="smart-reply__send" onclick="MailPage.sendQuickReply()">Send Reply</button>
          </div>
        </div>
      </div>
    `;
  },

  selectReply(chip, text) {
    document.querySelectorAll('.smart-reply__chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    document.getElementById('smartReplyText').value = text;
    document.getElementById('smartReplyCompose').classList.add('visible');
  },

  cancelReply() {
    document.querySelectorAll('.smart-reply__chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('smartReplyCompose')?.classList.remove('visible');
    document.getElementById('smartReplyText').value = '';
  },

  async sendQuickReply() {
    const text = document.getElementById('smartReplyText')?.value?.trim();
    if (!text) { Toast.error('Reply is empty'); return; }

    try {
      const to = this.email.from?.email;
      const subject = `Re: ${this.email.subject}`;
      const body = `<p>${text.replace(/\n/g, '</p><p>')}</p>`;
      await MailService.sendEmail(to, subject, body);

      ReminderService.markReplied(this.emailId);

      Toast.success('Reply sent!');
      this.cancelReply();
    } catch (err) {
      Toast.error('Failed to send: ' + err.message);
    }
  },

  async toggleStar() {
    try {
      await MailService.toggleStar(this.emailId);
      this.email.starred = !this.email.starred;
      await this.load();
      Toast.success(this.email.starred ? 'Starred' : 'Unstarred');
    } catch (err) { Toast.error(err.message); }
  },

  async trash() {
    try {
      await MailService.moveToTrash(this.emailId);
      Toast.success('Moved to trash');
      setTimeout(() => window.location.href = 'inbox.html', 500);
    } catch (err) { Toast.error(err.message); }
  },
};

document.addEventListener('DOMContentLoaded', () => MailPage.init());
