/* =============================================
   Page — Compose
   ============================================= */

const ComposePage = {
  async init() {
    const params = new URLSearchParams(window.location.search);
    const replyId = params.get('reply');
    const forwardId = params.get('forward');

    if (replyId) await this._prepareReply(replyId);
    if (forwardId) await this._prepareForward(forwardId);
  },

  async _prepareReply(id) {
    try {
      const email = await MailService.getEmail(id);
      if (!email) return;

      document.getElementById('composeTo').value = email.from?.email || '';
      document.getElementById('composeSubject').value = `Re: ${email.subject}`;
      document.getElementById('composeBody').value = `\n\n--- Original Message ---\nFrom: ${email.from?.name} <${email.from?.email}>\n\n${(email.body || '').replace(/<[^>]+>/g, '')}`;
    } catch { /* ignore */ }
  },

  async _prepareForward(id) {
    try {
      const email = await MailService.getEmail(id);
      if (!email) return;

      document.getElementById('composeSubject').value = `Fwd: ${email.subject}`;
      document.getElementById('composeBody').value = `\n\n--- Forwarded Message ---\nFrom: ${email.from?.name} <${email.from?.email}>\nSubject: ${email.subject}\n\n${(email.body || '').replace(/<[^>]+>/g, '')}`;
    } catch { /* ignore */ }
  },

  async send() {
    const to = document.getElementById('composeTo').value.trim();
    const subject = document.getElementById('composeSubject').value.trim();
    const body = document.getElementById('composeBody').value.trim();

    if (!to) { Toast.error('Please enter a recipient'); return; }
    if (!subject) { Toast.error('Please enter a subject'); return; }

    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.innerHTML = 'Sending...';

    try {
      const htmlBody = `<p>${body.replace(/\n/g, '</p><p>')}</p>`;
      await MailService.sendEmail(to, subject, htmlBody);
      Toast.success('Email sent successfully!');
      setTimeout(() => window.location.href = 'sent.html', 1200);
    } catch (err) {
      Toast.error('Failed to send: ' + err.message);
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg> Send';
    }
  },
};

document.addEventListener('DOMContentLoaded', () => ComposePage.init());
