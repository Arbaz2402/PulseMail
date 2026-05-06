/* =============================================
   Component — Email List
   ============================================= */

const EmailList = {
  render(container, emails, options = {}) {
    if (!emails || emails.length === 0) {
      container.innerHTML = `
        <div class="email-list__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <h3>${options.emptyTitle || 'No emails'}</h3>
          <p>${options.emptyText || 'Your mailbox is empty right now.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = emails.map((email, i) => {
      const avatar = email.from?.avatar || email.from?.name?.[0]?.toUpperCase() || '?';
      const color = email.avatarColor || '#6366F1';
      const unread = !email.read ? 'unread' : '';
      const starred = email.starred ? 'starred' : '';
      const date = MailService.formatDate(email.date);
      const label = email.label && email.label !== 'primary' ? email.label : '';

      return `
        <div class="email-item ${unread}"
             data-id="${email.id}"
             style="animation-delay: ${i * 0.03}s"
             onclick="EmailList.openEmail('${email.id}')">
          <div class="email-item__star ${starred}"
               onclick="event.stopPropagation(); EmailList.toggleStar('${email.id}')">
            <svg viewBox="0 0 24 24" fill="${email.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="email-item__avatar" style="background: ${color}">${avatar}</div>
          <div class="email-item__content">
            <div class="email-item__sender">${email.from?.name || 'Unknown'}</div>
            <div class="email-item__text">
              <span class="email-item__subject">${email.subject}</span>
              <span class="email-item__preview">— ${email.preview || ''}</span>
            </div>
          </div>
          <div class="email-item__meta">
            ${label ? `<span class="email-item__label email-item__label--${label}">${label}</span>` : ''}
            <span class="email-item__date">${date}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  openEmail(id) {
    window.location.href = `mail.html?id=${id}`;
  },

  async toggleStar(id) {
    try {
      await MailService.toggleStar(id);
      window.location.reload();
    } catch (err) {
      console.error('Star toggle failed:', err);
    }
  },
};
