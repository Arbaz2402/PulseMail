const TrashPage = {
  async init() {
    const list = document.getElementById('emailList');
    list.innerHTML = this._skeletonHTML();
    try {
      const emails = await MailService.getTrash();
      EmailList.render(list, emails, { emptyTitle: 'Trash is empty', emptyText: 'Deleted emails will appear here.' });
    } catch (err) {
      list.innerHTML = `<div class="email-list__empty"><h3>Error loading emails</h3><p>${err.message}</p></div>`;
      Toast.error('Failed to load trash: ' + err.message);
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
document.addEventListener('DOMContentLoaded', () => TrashPage.init());
