const StarredPage = {
  async init() {
    const list = document.getElementById('emailList');
    list.innerHTML = this._skeletonHTML();
    try {
      const emails = await MailService.getStarred();
      EmailList.render(list, emails, { emptyTitle: 'No starred emails', emptyText: 'Star important emails to find them here.' });
    } catch (err) {
      list.innerHTML = `<div class="email-list__empty"><h3>Error loading emails</h3><p>${err.message}</p></div>`;
      Toast.error('Failed to load starred emails: ' + err.message);
    }
  },

  _skeletonHTML() {
    const row = `
      <div class="skeleton-item">
        <div class="skeleton-circle"></div>
        <div class="skeleton-circle skeleton-circle--sm"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line--short"></div>
          <div class="skeleton-line skeleton-line--long"></div>
        </div>
        <div class="skeleton-line skeleton-line--date"></div>
      </div>`;
    return `<div class="skeleton-list">${row.repeat(5)}</div>`;
  },
};
document.addEventListener('DOMContentLoaded', () => StarredPage.init());
