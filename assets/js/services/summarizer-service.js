/* =============================================
   Service — Email Summarizer
   Extracts key info, priority, action items,
   dates/times from email body content
   ============================================= */

const SummarizerService = {
  summarize(email) {
    const text = this._stripHtml(email.body || email.preview || '');
    const subject = email.subject || '';

    return {
      summary: this._generateSummary(text, subject),
      priority: this._detectPriority(text, subject),
      actionRequired: this._extractActions(text),
      dates: this._extractDates(text),
      keyPeople: this._extractPeople(text, email),
      wordCount: text.split(/\s+/).filter(Boolean).length,
      readTime: Math.max(1, Math.ceil(text.split(/\s+/).length / 200)),
      category: this._categorize(text, subject, email),
    };
  },

  _stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  },

  _generateSummary(text, subject) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const cleaned = sentences.map(s => s.trim()).filter(s => s.length > 15 && s.length < 300);

    if (cleaned.length === 0) return subject || 'No content to summarize.';

    const scored = cleaned.map(sentence => {
      let score = 0;
      const lower = sentence.toLowerCase();

      const importantWords = ['important', 'urgent', 'deadline', 'action', 'required',
        'please', 'need', 'must', 'update', 'confirm', 'review', 'approve',
        'meeting', 'schedule', 'attached', 'launch', 'release', 'critical'];
      importantWords.forEach(w => { if (lower.includes(w)) score += 2; });

      if (sentences.indexOf(sentence + (sentence.endsWith('.') ? '' : '.')) < 3) score += 3;
      if (lower.includes('key') || lower.includes('highlight')) score += 2;
      if (sentence.length > 30 && sentence.length < 150) score += 1;

      return { sentence: sentence.trim(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored.slice(0, 2).map(s => s.sentence);

    return topSentences.join(' ') || subject;
  },

  _detectPriority(text, subject) {
    const combined = (text + ' ' + subject).toLowerCase();

    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency',
      'deadline today', 'time-sensitive', 'action required', 'respond now'];
    const highWords = ['important', 'deadline', 'required', 'must', 'priority',
      'review needed', 'approval needed', 'please confirm', 'by end of day', 'eod'];
    const lowWords = ['newsletter', 'unsubscribe', 'promotion', 'sale', 'deal',
      'no reply needed', 'fyi', 'for your information', 'just sharing'];

    if (urgentWords.some(w => combined.includes(w))) {
      return { level: 'urgent', label: 'Urgent', color: '#DC2626', icon: 'alert-triangle' };
    }
    if (highWords.some(w => combined.includes(w))) {
      return { level: 'high', label: 'High Priority', color: '#D97706', icon: 'alert-circle' };
    }
    if (lowWords.some(w => combined.includes(w))) {
      return { level: 'low', label: 'Low Priority', color: '#059669', icon: 'check-circle' };
    }
    return { level: 'normal', label: 'Normal', color: '#6366F1', icon: 'minus-circle' };
  },

  _extractActions(text) {
    const lower = text.toLowerCase();
    const actions = [];

    const patterns = [
      { regex: /please\s+([\w\s]+?)(?:\.|,|$)/gi, prefix: '' },
      { regex: /(?:need|needs)\s+(?:you\s+)?to\s+([\w\s]+?)(?:\.|,|$)/gi, prefix: 'Need to ' },
      { regex: /(?:could|can)\s+you\s+([\w\s]+?)(?:\.|,|\?|$)/gi, prefix: '' },
      { regex: /(?:kindly|do)\s+([\w\s]+?)(?:\.|,|$)/gi, prefix: '' },
      { regex: /action\s*(?:required|needed|item)[:\s]*([\w\s]+?)(?:\.|,|$)/gi, prefix: '' },
    ];

    patterns.forEach(({ regex, prefix }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const action = (prefix + match[1]).trim();
        if (action.length > 5 && action.length < 80 && !actions.includes(action)) {
          actions.push(action.charAt(0).toUpperCase() + action.slice(1));
        }
      }
    });

    if (actions.length === 0) {
      if (lower.includes('review')) actions.push('Review the content');
      if (lower.includes('confirm')) actions.push('Confirm receipt or details');
      if (lower.includes('schedule') || lower.includes('meeting')) actions.push('Schedule or confirm meeting');
      if (lower.includes('reply') || lower.includes('respond')) actions.push('Reply to sender');
      if (lower.includes('approve') || lower.includes('approval')) actions.push('Approve request');
    }

    return actions.slice(0, 4);
  },

  _extractDates(text) {
    const dates = [];

    const datePatterns = [
      /(?:on|by|before|after|until|due)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?)/gi,
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
      /(\d{4}-\d{2}-\d{2})/g,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
      /(tomorrow|next week|end of (?:day|week|month)|this (?:friday|monday|week))/gi,
      /(\d{1,2}\s*(?:am|pm))/gi,
      /(\d{1,2}:\d{2}\s*(?:am|pm)?)/gi,
      /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2})/gi,
    ];

    datePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const d = match[1].trim();
        if (d.length > 2 && !dates.includes(d)) {
          dates.push(d);
        }
      }
    });

    return dates.slice(0, 5);
  },

  _extractPeople(text, email) {
    const people = [];
    if (email.from?.name && email.from.name !== 'Unknown') {
      people.push(email.from.name);
    }

    const atMentions = text.match(/@(\w+)/g);
    if (atMentions) {
      atMentions.forEach(m => {
        const name = m.replace('@', '');
        if (!people.includes(name)) people.push(name);
      });
    }

    return people.slice(0, 5);
  },

  _categorize(text, subject, email) {
    const combined = (text + ' ' + subject).toLowerCase();
    const from = (email.from?.email || '').toLowerCase();

    if (from.includes('noreply') || from.includes('no-reply') || from.includes('newsletter'))
      return 'Newsletter';
    if (combined.includes('invoice') || combined.includes('receipt') || combined.includes('payment'))
      return 'Financial';
    if (combined.includes('meeting') || combined.includes('calendar') || combined.includes('schedule'))
      return 'Meeting';
    if (combined.includes('deploy') || combined.includes('build') || combined.includes('merge') || combined.includes('commit'))
      return 'Development';
    if (combined.includes('sale') || combined.includes('discount') || combined.includes('offer') || combined.includes('promo'))
      return 'Promotion';
    if (combined.includes('social') || combined.includes('follow') || combined.includes('like') || combined.includes('comment'))
      return 'Social';
    return 'General';
  },
};
