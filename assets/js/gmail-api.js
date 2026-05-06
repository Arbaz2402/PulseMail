/* =============================================
   Gmail API — Real Gmail Integration
   Handles OAuth tokens and Gmail REST API calls
   ============================================= */

const GmailAPI = {
  BASE: 'https://gmail.googleapis.com/gmail/v1/users/me',
  _token: null,

  setToken(token) {
    this._token = token;
    DB.set('access_token', token);
  },

  getToken() {
    if (this._token) return this._token;
    this._token = DB.get('access_token', null);
    return this._token;
  },

  clearToken() {
    this._token = null;
    DB.remove('access_token');
  },

  isConnected() {
    return !!this.getToken();
  },

  async _fetch(endpoint, options = {}, retryCount = 0) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${this.BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (res.status === 429 && retryCount < 2) {
      // Rate limited, wait and retry
      const waitTime = (retryCount + 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this._fetch(endpoint, options, retryCount + 1);
    }

    if (res.status === 401) {
      this.clearToken();
      DB.clearSession();
      window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
      throw new Error('Token expired');
    }

    if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);
    return res.json();
  },

  /* ── Profile ─────────────────────────── */

  async getProfile() {
    return this._fetch('/profile');
  },

  /* ── Messages ────────────────────────── */

  async listMessages(query = '', label = 'INBOX', maxResults = 30) {
    let q = query;
    const params = new URLSearchParams({ maxResults });
    if (label) params.set('labelIds', label);
    if (q) params.set('q', q);

    const data = await this._fetch(`/messages?${params}`);
    if (!data.messages) return [];

    const batchSize = 8;
    const details = [];
    for (let i = 0; i < data.messages.length; i += batchSize) {
      const batch = data.messages.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(m => this.getMessage(m.id))
      );
      for (const result of batchResults) {
        if (result.status === 'fulfilled') details.push(result.value);
      }
      if (i + batchSize < data.messages.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    return details;
  },

  async getMessage(id) {
    return this._fetch(`/messages/${id}?format=full`);
  },

  async getThread(id) {
    return this._fetch(`/threads/${id}?format=full`);
  },

  /* ── Actions ─────────────────────────── */

  async modifyMessage(id, addLabels = [], removeLabels = []) {
    return this._fetch(`/messages/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify({ addLabelIds: addLabels, removeLabelIds: removeLabels }),
    });
  },

  async starMessage(id) {
    return this.modifyMessage(id, ['STARRED'], []);
  },

  async unstarMessage(id) {
    return this.modifyMessage(id, [], ['STARRED']);
  },

  async markRead(id) {
    return this.modifyMessage(id, [], ['UNREAD']);
  },

  async markUnread(id) {
    return this.modifyMessage(id, ['UNREAD'], []);
  },

  async trashMessage(id) {
    return this._fetch(`/messages/${id}/trash`, { method: 'POST' });
  },

  async untrashMessage(id) {
    return this._fetch(`/messages/${id}/untrash`, { method: 'POST' });
  },

  async deleteMessage(id) {
    return this._fetch(`/messages/${id}`, { method: 'DELETE' });
  },

  async sendMessage(to, subject, body) {
    const raw = this._createRawEmail(to, subject, body);
    return this._fetch('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw }),
    });
  },

  /* ── Labels ──────────────────────────── */

  async getLabels() {
    const data = await this._fetch('/labels');
    return data.labels || [];
  },

  /* ── Parse Helpers ───────────────────── */

  parseEmail(msg) {
    const headers = msg.payload?.headers || [];
    const getHeader = name => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('From');
    const nameMatch = from.match(/^"?([^"<]+)"?\s*<?/);
    const emailMatch = from.match(/<([^>]+)>/);

    const fromName = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
    const fromEmail = emailMatch ? emailMatch[1] : from;
    const initials = fromName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

    const labels = msg.labelIds || [];
    let label = '';
    if (labels.includes('CATEGORY_SOCIAL')) label = 'social';
    else if (labels.includes('CATEGORY_UPDATES')) label = 'updates';
    else if (labels.includes('CATEGORY_PROMOTIONS')) label = 'promotions';
    else if (labels.includes('CATEGORY_FORUMS')) label = 'social';
    else label = 'primary';

    const body = this._extractBody(msg.payload);

    return {
      id: msg.id,
      threadId: msg.threadId,
      from: { name: fromName, email: fromEmail, avatar: initials },
      to: getHeader('To'),
      subject: getHeader('Subject') || '(no subject)',
      body: body,
      preview: msg.snippet || '',
      date: getHeader('Date') || new Date(parseInt(msg.internalDate)).toISOString(),
      read: !labels.includes('UNREAD'),
      starred: labels.includes('STARRED'),
      labels: labels,
      label: label,
      folder: labels.includes('TRASH') ? 'trash' : labels.includes('SENT') ? 'sent' : 'inbox',
      avatarColor: this._colorFromString(fromEmail),
    };
  },

  _extractBody(payload) {
    if (!payload) return '';

    if (payload.body?.data) {
      return this._decodeBase64(payload.body.data);
    }

    if (payload.parts) {
      const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
      if (htmlPart?.body?.data) return this._decodeBase64(htmlPart.body.data);

      const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        const text = this._decodeBase64(textPart.body.data);
        return `<p>${text.replace(/\n/g, '</p><p>')}</p>`;
      }

      for (const part of payload.parts) {
        if (part.parts) {
          const nested = this._extractBody(part);
          if (nested) return nested;
        }
      }
    }

    return '';
  },

  _decodeBase64(data) {
    try {
      const str = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(str).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    } catch {
      try { return atob(data.replace(/-/g, '+').replace(/_/g, '/')); }
      catch { return ''; }
    }
  },

  _createRawEmail(to, subject, body) {
    const session = DB.getSession();
    const email = [
      `From: ${session?.email || ''}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      body,
    ].join('\r\n');

    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  _colorFromString(str) {
    const colors = ['#4F46E5','#DC2626','#059669','#D97706','#7C3AED','#DB2777','#2563EB','#0891B2','#BE185D','#065F46'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },
};
