/* =============================================
   Mail Service — Gmail API + Demo Data Layer
   ============================================= */

const MailService = {
  /* ── Mode Detection ──────────────────── */

  isGmail() {
    return DB.isGmailMode() && GmailAPI.isConnected();
  },

  /* ── Fetch Emails ────────────────────── */

  async getInbox(category = 'all') {
    if (this.isGmail()) {
      const label = category === 'all' ? 'INBOX' : null;
      const q = category !== 'all' ? `category:${category}` : '';
      const msgs = await GmailAPI.listMessages(q, label, 40);
      return msgs.map(m => GmailAPI.parseEmail(m));
    }
    return this._getDemoEmails('inbox', category);
  },

  async getSent() {
    if (this.isGmail()) {
      const msgs = await GmailAPI.listMessages('', 'SENT', 30);
      return msgs.map(m => GmailAPI.parseEmail(m));
    }
    return this._getDemoEmails('sent');
  },

  async getStarred() {
    if (this.isGmail()) {
      const msgs = await GmailAPI.listMessages('', 'STARRED', 30);
      return msgs.map(m => GmailAPI.parseEmail(m));
    }
    return this._getDemoEmails('starred');
  },

  async getDrafts() {
    if (this.isGmail()) {
      const msgs = await GmailAPI.listMessages('', 'DRAFT', 20);
      return msgs.map(m => GmailAPI.parseEmail(m));
    }
    return this._getDemoEmails('drafts');
  },

  async getTrash() {
    if (this.isGmail()) {
      const msgs = await GmailAPI.listMessages('', 'TRASH', 20);
      return msgs.map(m => GmailAPI.parseEmail(m));
    }
    return this._getDemoEmails('trash');
  },

  async search(query) {
    if (this.isGmail()) {
      const msgs = await GmailAPI.listMessages(query, null, 30);
      return msgs.map(m => GmailAPI.parseEmail(m));
    }
    return this._searchDemo(query);
  },

  /* ── Single Email ────────────────────── */

  async getEmail(id) {
    if (this.isGmail()) {
      const msg = await GmailAPI.getMessage(id);
      return GmailAPI.parseEmail(msg);
    }
    return this._getDemoEmail(id);
  },

  /* ── Actions ─────────────────────────── */

  async toggleStar(id) {
    if (this.isGmail()) {
      const msg = await GmailAPI.getMessage(id);
      const labels = msg.labelIds || [];
      if (labels.includes('STARRED')) await GmailAPI.unstarMessage(id);
      else await GmailAPI.starMessage(id);
      return;
    }
    this._toggleDemoStar(id);
  },

  async markRead(id) {
    if (this.isGmail()) {
      await GmailAPI.markRead(id);
      return;
    }
    this._markDemoRead(id);
  },

  async moveToTrash(id) {
    if (this.isGmail()) {
      await GmailAPI.trashMessage(id);
      return;
    }
    this._moveDemoToTrash(id);
  },

  async sendEmail(to, subject, body) {
    if (this.isGmail()) {
      await GmailAPI.sendMessage(to, subject, body);
      return;
    }
    this._sendDemoEmail(to, subject, body);
  },

  /* ── Stats ───────────────────────────── */

  _statsCache: null,
  _statsCacheTime: 0,

  async getStats() {
    if (this.isGmail()) {
      const CACHE_TTL = 30000;
      if (this._statsCache && (Date.now() - this._statsCacheTime) < CACHE_TTL) {
        return this._statsCache;
      }
      try {
        const unread = await GmailAPI.listMessages('is:unread', 'INBOX', 50);
        const stats = {
          inbox: unread.length > 0 ? '•' : 0,
          unread: unread.length,
          starred: 0,
          drafts: 0,
        };
        this._statsCache = stats;
        this._statsCacheTime = Date.now();
        return stats;
      } catch { return this._statsCache || { inbox: 0, unread: 0, starred: 0, drafts: 0 }; }
    }
    return this._getDemoStats();
  },

  /* ═══════════════════════════════════════
     Demo Mode — Fake Data
     ═══════════════════════════════════════ */

  _ensureDemoData() {
    if (DB.getDemoEmails()) return;
    const now = Date.now();
    const h = 3600000;
    const session = DB.getSession();

    const emails = [
      { id: 'd1', from: { name: 'GitHub', email: 'noreply@github.com', avatar: 'GH' }, to: session?.email || 'user@demo.com', subject: '[React] Fix: useEffect cleanup race condition #14892', body: '<p>A new pull request has been opened by <strong>@danabramov</strong> on the React repository.</p><p>This PR fixes a race condition in useEffect cleanup that could lead to state updates on unmounted components. The fix introduces a cancellation token pattern.</p><p><a href="#">View Pull Request →</a></p>', preview: 'A new pull request has been opened on the React repository...', date: new Date(now - h * 2).toISOString(), read: false, starred: false, label: 'primary', folder: 'inbox', avatarColor: '#2563EB' },
      { id: 'd2', from: { name: 'Sarah Chen', email: 'sarah.chen@company.com', avatar: 'SC' }, to: session?.email || 'user@demo.com', subject: 'Q3 Product Roadmap — Final Review', body: '<p>Hi team,</p><p>Attached is the finalized Q3 product roadmap. Key highlights:</p><ul><li>Launch of AI-powered search (July)</li><li>Mobile app redesign (August)</li><li>Enterprise SSO integration (September)</li></ul><p>Please review and share feedback by Friday.</p><p>Best,<br/>Sarah</p>', preview: 'Attached is the finalized Q3 product roadmap. Key highlights...', date: new Date(now - h * 5).toISOString(), read: false, starred: true, label: 'primary', folder: 'inbox', avatarColor: '#DC2626' },
      { id: 'd3', from: { name: 'Vercel', email: 'notifications@vercel.com', avatar: 'VR' }, to: session?.email || 'user@demo.com', subject: 'Deployment successful — pulsemail.vercel.app', body: '<p>Your deployment to <strong>pulsemail.vercel.app</strong> has been completed successfully.</p><p>Build time: 42s<br/>Status: Ready<br/>Preview: <a href="#">https://pulsemail-git-main.vercel.app</a></p>', preview: 'Your deployment to pulsemail.vercel.app has been completed...', date: new Date(now - h * 8).toISOString(), read: true, starred: false, label: 'updates', folder: 'inbox', avatarColor: '#111827' },
      { id: 'd4', from: { name: 'LinkedIn', email: 'notifications@linkedin.com', avatar: 'LI' }, to: session?.email || 'user@demo.com', subject: 'Alex Morgan viewed your profile', body: '<p>Alex Morgan, Senior Engineering Manager at Google, viewed your profile.</p><p>You appeared in 42 searches this week.</p>', preview: 'Alex Morgan, Senior Engineering Manager at Google, viewed your profile...', date: new Date(now - h * 12).toISOString(), read: true, starred: false, label: 'social', folder: 'inbox', avatarColor: '#0A66C2' },
      { id: 'd5', from: { name: 'Stripe', email: 'receipts@stripe.com', avatar: 'ST' }, to: session?.email || 'user@demo.com', subject: 'Payment receipt for $49.00 — Pro Plan', body: '<p>Your payment of <strong>$49.00</strong> for PulseMail Pro Plan has been processed.</p><p>Invoice #PM-2024-0847<br/>Period: Jul 1 — Aug 1, 2024</p>', preview: 'Your payment of $49.00 for PulseMail Pro Plan has been processed...', date: new Date(now - h * 24).toISOString(), read: true, starred: false, label: 'updates', folder: 'inbox', avatarColor: '#635BFF' },
      { id: 'd6', from: { name: 'David Park', email: 'david.park@agency.io', avatar: 'DP' }, to: session?.email || 'user@demo.com', subject: 'Re: Website Redesign Proposal', body: '<p>Thanks for the mockups! The glassmorphism approach looks stunning.</p><p>Let\'s schedule a call next Tuesday to discuss the animation timeline. Can you do 2pm EST?</p><p>— David</p>', preview: 'Thanks for the mockups! The glassmorphism approach looks stunning...', date: new Date(now - h * 30).toISOString(), read: false, starred: false, label: 'primary', folder: 'inbox', avatarColor: '#059669' },
      { id: 'd7', from: { name: 'Figma', email: 'team@figma.com', avatar: 'FG' }, to: session?.email || 'user@demo.com', subject: 'New comment on "Dashboard v3" design', body: '<p><strong>@emma.wilson</strong> left a comment on your "Dashboard v3" design file:</p><p><em>"Love the new color scheme! Can we try a darker variant for the sidebar?"</em></p>', preview: '@emma.wilson left a comment on your Dashboard v3 design file...', date: new Date(now - h * 36).toISOString(), read: true, starred: true, label: 'updates', folder: 'inbox', avatarColor: '#A259FF' },
      { id: 'd8', from: { name: 'Twitter', email: 'notify@twitter.com', avatar: 'TW' }, to: session?.email || 'user@demo.com', subject: 'Your tweet got 1,247 likes!', body: '<p>Your tweet about CSS container queries is going viral! It has received 1,247 likes, 342 retweets, and 89 replies.</p>', preview: 'Your tweet about CSS container queries is going viral!', date: new Date(now - h * 48).toISOString(), read: true, starred: false, label: 'social', folder: 'inbox', avatarColor: '#1DA1F2' },
      { id: 'd9', from: { name: 'AWS', email: 'no-reply@aws.amazon.com', avatar: 'AW' }, to: session?.email || 'user@demo.com', subject: 'Your AWS bill for June 2024 — $127.43', body: '<p>Your AWS bill for June 2024 is ready.</p><p>Total: <strong>$127.43</strong></p><p>EC2: $89.20<br/>S3: $12.30<br/>CloudFront: $25.93</p>', preview: 'Your AWS bill for June 2024 is ready. Total: $127.43', date: new Date(now - h * 72).toISOString(), read: true, starred: false, label: 'promotions', folder: 'inbox', avatarColor: '#FF9900' },
      { id: 'd10', from: { name: session?.name || 'Me', email: session?.email || 'user@demo.com', avatar: (session?.name || 'M')[0] }, to: 'sarah.chen@company.com', subject: 'Re: Q3 Product Roadmap — Final Review', body: '<p>Hi Sarah,</p><p>Roadmap looks great! One suggestion — can we move the SSO integration to August? Our enterprise clients are pushing for it.</p><p>Thanks!</p>', preview: 'Roadmap looks great! One suggestion — can we move the SSO...', date: new Date(now - h * 4).toISOString(), read: true, starred: false, label: 'primary', folder: 'sent', avatarColor: '#6366F1' },
      { id: 'd11', from: { name: session?.name || 'Me', email: session?.email || 'user@demo.com', avatar: (session?.name || 'M')[0] }, to: 'david.park@agency.io', subject: 'Re: Website Redesign Proposal', body: '<p>Hi David,</p><p>2pm EST on Tuesday works for me. I\'ll prepare the animation prototypes by then.</p><p>Cheers!</p>', preview: '2pm EST on Tuesday works for me...', date: new Date(now - h * 29).toISOString(), read: true, starred: false, label: 'primary', folder: 'sent', avatarColor: '#6366F1' },
    ];

    DB.setDemoEmails(emails);
  },

  _getDemoEmails(folder, category = 'all') {
    this._ensureDemoData();
    let emails = DB.getDemoEmails() || [];

    if (folder === 'starred') return emails.filter(e => e.starred);
    if (folder === 'drafts') return emails.filter(e => e.folder === 'drafts');
    if (folder === 'trash') return emails.filter(e => e.folder === 'trash');
    if (folder === 'sent') return emails.filter(e => e.folder === 'sent');

    let result = emails.filter(e => e.folder === 'inbox');
    if (category !== 'all') result = result.filter(e => e.label === category);
    return result;
  },

  _getDemoEmail(id) {
    this._ensureDemoData();
    const emails = DB.getDemoEmails() || [];
    return emails.find(e => e.id === id) || null;
  },

  _searchDemo(query) {
    this._ensureDemoData();
    const q = query.toLowerCase();
    return (DB.getDemoEmails() || []).filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.from.name.toLowerCase().includes(q) ||
      e.preview.toLowerCase().includes(q)
    );
  },

  _toggleDemoStar(id) {
    const emails = DB.getDemoEmails() || [];
    const email = emails.find(e => e.id === id);
    if (email) { email.starred = !email.starred; DB.setDemoEmails(emails); }
  },

  _markDemoRead(id) {
    const emails = DB.getDemoEmails() || [];
    const email = emails.find(e => e.id === id);
    if (email) { email.read = true; DB.setDemoEmails(emails); }
  },

  _moveDemoToTrash(id) {
    const emails = DB.getDemoEmails() || [];
    const email = emails.find(e => e.id === id);
    if (email) { email.folder = 'trash'; DB.setDemoEmails(emails); }
  },

  _sendDemoEmail(to, subject, body) {
    const emails = DB.getDemoEmails() || [];
    const session = DB.getSession();
    emails.unshift({
      id: 'd' + Date.now(),
      from: { name: session?.name || 'Me', email: session?.email || 'user@demo.com', avatar: (session?.name || 'M')[0] },
      to,
      subject,
      body,
      preview: body.replace(/<[^>]+>/g, '').slice(0, 100),
      date: new Date().toISOString(),
      read: true,
      starred: false,
      label: 'primary',
      folder: 'sent',
      avatarColor: '#6366F1',
    });
    DB.setDemoEmails(emails);
  },

  _getDemoStats() {
    this._ensureDemoData();
    const emails = DB.getDemoEmails() || [];
    const inbox = emails.filter(e => e.folder === 'inbox');
    return {
      inbox: inbox.length,
      unread: inbox.filter(e => !e.read).length,
      starred: emails.filter(e => e.starred).length,
      drafts: emails.filter(e => e.folder === 'drafts').length,
    };
  },

  /* ── Date Formatting ─────────────────── */

  formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';

    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
  },
};
