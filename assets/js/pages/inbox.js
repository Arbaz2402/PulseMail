/* =============================================
   Page — Inbox (with Focus Mode + Duplicates)
   ============================================= */

const InboxPage = {
  currentCategory: 'all',
  allEmails: [],
  duplicateGroups: [],

  async init() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');

    if (search) {
      const searchInput = document.getElementById('headerSearch');
      if (searchInput) searchInput.value = search;
      await this.search(search);
    } else {
      await this.load();
    }

    this._bindTabs();
    this._listenFocusMode();
  },

  async load(category) {
    if (category) this.currentCategory = category;
    const list = document.getElementById('emailList');
    list.innerHTML = this._skeletonHTML();

    try {
      this.allEmails = await MailService.getInbox(this.currentCategory);

      let display = this.allEmails;

      if (FocusModeService.isEnabled()) {
        display = FocusModeService.filterEmails(display);
        const stats = FocusModeService.getStats(this.allEmails);
        this._showFocusBanner(stats);
      } else {
        this._hideFocusBanner();
      }

      this._checkDuplicates(this.allEmails);

      EmailList.render(list, display, {
        emptyTitle: FocusModeService.isEnabled() ? 'All clear in Focus Mode' : 'Inbox Zero!',
        emptyText: FocusModeService.isEnabled()
          ? 'No important emails. Distracting emails are hidden.'
          : 'You\'re all caught up. Time for a coffee break.',
      });
    } catch (err) {
      list.innerHTML = `<div class="email-list__empty"><h3>Error loading emails</h3><p>${err.message}</p></div>`;
      Toast.error('Failed to load inbox: ' + err.message);
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
    return `<div class="skeleton-list">${row.repeat(7)}</div>`;
  },

  async search(query) {
    const list = document.getElementById('emailList');
    list.innerHTML = this._skeletonHTML();

    try {
      const emails = await MailService.search(query);
      EmailList.render(list, emails, {
        emptyTitle: 'No results',
        emptyText: `No emails match "${query}"`,
      });
    } catch (err) {
      Toast.error('Search failed: ' + err.message);
    }
  },

  _bindTabs() {
    document.querySelectorAll('.email-toolbar__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.email-toolbar__tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.load(tab.dataset.cat);
      });
    });
  },

  _listenFocusMode() {
    document.addEventListener('focusModeChanged', () => {
      this.load(this.currentCategory);
    });
  },

  /* ── Focus Mode ──────────────────────── */

  _showFocusBanner(stats) {
    const banner = document.getElementById('focusBanner');
    const desc = document.getElementById('focusBannerDesc');
    if (banner && desc) {
      banner.classList.add('visible');
      desc.textContent = `Hiding ${stats.hidden} of ${stats.total} emails (${stats.hiddenPercent}% noise removed)`;
    }
  },

  _hideFocusBanner() {
    document.getElementById('focusBanner')?.classList.remove('visible');
  },

  /* ── Duplicate Detection ─────────────── */

  _checkDuplicates(emails) {
    this.duplicateGroups = DuplicateService.detect(emails);
    const dismissed = DuplicateService.getDismissed();
    this.duplicateGroups = this.duplicateGroups.filter(g => !dismissed.includes(g.id));

    const banner = document.getElementById('dupBanner');
    const desc = document.getElementById('dupDesc');

    if (this.duplicateGroups.length > 0 && banner) {
      const stats = DuplicateService.getStats(this.duplicateGroups);
      banner.classList.add('visible');
      desc.textContent = `${stats.totalDuplicates} duplicate email${stats.totalDuplicates > 1 ? 's' : ''} in ${stats.groupCount} group${stats.groupCount > 1 ? 's' : ''}`;
    } else {
      banner?.classList.remove('visible');
    }
  },

  showDuplicateModal() {
    const modal = document.getElementById('dupModal');
    const body = document.getElementById('dupModalBody');
    if (!modal || !body) return;

    body.innerHTML = this.duplicateGroups.map(group => `
      <div class="duplicate-group">
        <div class="duplicate-group__header">
          <div class="duplicate-group__sender">${group.sender}</div>
          <span class="duplicate-group__count">${group.count} emails</span>
        </div>
        <div class="duplicate-group__subject">${group.subject}</div>
        <div class="duplicate-group__actions">
          <button class="duplicate-group__btn" onclick="InboxPage.archiveDuplicates('${group.id}')">Archive Duplicates</button>
          <button class="duplicate-group__btn duplicate-group__btn--delete" onclick="InboxPage.deleteDuplicates('${group.id}')">Delete Duplicates</button>
        </div>
      </div>
    `).join('');

    modal.classList.add('active');
  },

  dismissDuplicates() {
    this.duplicateGroups.forEach(g => DuplicateService.dismiss(g.id));
    document.getElementById('dupBanner')?.classList.remove('visible');
    Toast.info('Duplicates dismissed');
  },

  async archiveDuplicates(groupId) {
    const group = this.duplicateGroups.find(g => g.id === groupId);
    if (!group) return;

    for (const dup of group.duplicates) {
      await MailService.moveToTrash(dup.id);
    }

    DuplicateService.dismiss(groupId);
    Toast.success(`Archived ${group.duplicates.length} duplicate(s)`);
    document.getElementById('dupModal')?.classList.remove('active');
    this.load();
  },

  async deleteDuplicates(groupId) {
    const group = this.duplicateGroups.find(g => g.id === groupId);
    if (!group) return;

    for (const dup of group.duplicates) {
      await MailService.moveToTrash(dup.id);
    }

    DuplicateService.dismiss(groupId);
    Toast.success(`Deleted ${group.duplicates.length} duplicate(s)`);
    document.getElementById('dupModal')?.classList.remove('active');
    this.load();
  },
};

document.addEventListener('DOMContentLoaded', () => InboxPage.init());
