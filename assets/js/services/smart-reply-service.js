/* =============================================
   Service — Smart Reply Suggestions
   Detects email type, generates contextual
   quick reply suggestions
   ============================================= */

const SmartReplyService = {
  getSuggestions(email) {
    const text = this._stripHtml(email.body || email.preview || '');
    const subject = (email.subject || '').toLowerCase();
    const types = this._detectTypes(text, subject);
    const suggestions = [];

    types.forEach(type => {
      const replies = this._getRepliesForType(type);
      replies.forEach(r => {
        if (!suggestions.find(s => s.text === r.text)) {
          suggestions.push(r);
        }
      });
    });

    if (suggestions.length === 0) {
      suggestions.push(
        { text: 'Thanks for letting me know!', icon: 'thumbs-up', tone: 'friendly' },
        { text: 'Got it, thank you.', icon: 'check', tone: 'professional' },
        { text: 'I\'ll take a look and get back to you.', icon: 'eye', tone: 'professional' },
      );
    }

    return suggestions.slice(0, 5);
  },

  _detectTypes(text, subject) {
    const lower = text.toLowerCase();
    const types = [];

    if (lower.includes('?') || lower.includes('could you') || lower.includes('can you') ||
        lower.includes('would you') || lower.includes('do you'))
      types.push('question');

    if (lower.includes('meeting') || lower.includes('schedule') || lower.includes('calendar') ||
        lower.includes('call') || lower.includes('sync'))
      types.push('meeting');

    if (lower.includes('deadline') || lower.includes('due') || lower.includes('by end of') ||
        lower.includes('urgent') || lower.includes('asap'))
      types.push('deadline');

    if (lower.includes('please review') || lower.includes('feedback') || lower.includes('thoughts') ||
        lower.includes('what do you think') || lower.includes('opinion'))
      types.push('review');

    if (lower.includes('attached') || lower.includes('document') || lower.includes('file') ||
        lower.includes('share') || lower.includes('link'))
      types.push('document');

    if (lower.includes('congratulations') || lower.includes('great job') || lower.includes('well done') ||
        lower.includes('thank you') || lower.includes('thanks'))
      types.push('appreciation');

    if (lower.includes('invite') || lower.includes('join') || lower.includes('rsvp') ||
        lower.includes('attend'))
      types.push('invitation');

    if (lower.includes('issue') || lower.includes('problem') || lower.includes('bug') ||
        lower.includes('error') || lower.includes('fix'))
      types.push('issue');

    if (lower.includes('update') || lower.includes('progress') || lower.includes('status') ||
        lower.includes('report'))
      types.push('update');

    if (lower.includes('proposal') || lower.includes('offer') || lower.includes('quote') ||
        lower.includes('pricing'))
      types.push('proposal');

    if (types.length === 0) types.push('general');
    return types;
  },

  _getRepliesForType(type) {
    const replies = {
      question: [
        { text: 'Yes, that works for me.', icon: 'check-circle', tone: 'positive' },
        { text: 'Let me check and get back to you.', icon: 'clock', tone: 'neutral' },
        { text: 'Could you provide more details?', icon: 'help-circle', tone: 'clarifying' },
      ],
      meeting: [
        { text: 'That time works for me. See you then!', icon: 'calendar', tone: 'positive' },
        { text: 'Can we reschedule to a different time?', icon: 'clock', tone: 'neutral' },
        { text: 'I\'ll send a calendar invite shortly.', icon: 'calendar', tone: 'proactive' },
      ],
      deadline: [
        { text: 'Noted. I\'ll have it ready by then.', icon: 'check', tone: 'professional' },
        { text: 'Could we extend the deadline?', icon: 'clock', tone: 'request' },
        { text: 'I\'m on track to deliver on time.', icon: 'thumbs-up', tone: 'positive' },
      ],
      review: [
        { text: 'I\'ll review and share my feedback shortly.', icon: 'eye', tone: 'professional' },
        { text: 'Looks good to me! Approved.', icon: 'check-circle', tone: 'positive' },
        { text: 'I have a few suggestions. Let me compile them.', icon: 'edit', tone: 'constructive' },
      ],
      document: [
        { text: 'Thanks! I\'ll review the document.', icon: 'file', tone: 'professional' },
        { text: 'Received. I\'ll get back to you with feedback.', icon: 'check', tone: 'neutral' },
        { text: 'Could you share the latest version?', icon: 'refresh', tone: 'request' },
      ],
      appreciation: [
        { text: 'Thank you! Really appreciate it.', icon: 'heart', tone: 'warm' },
        { text: 'Glad I could help!', icon: 'smile', tone: 'friendly' },
        { text: 'Thanks! Happy to contribute.', icon: 'thumbs-up', tone: 'positive' },
      ],
      invitation: [
        { text: 'I\'d love to attend! Count me in.', icon: 'check-circle', tone: 'positive' },
        { text: 'Unfortunately, I won\'t be able to make it.', icon: 'x-circle', tone: 'decline' },
        { text: 'Thanks for the invite! Let me check my schedule.', icon: 'calendar', tone: 'neutral' },
      ],
      issue: [
        { text: 'I\'ll look into this right away.', icon: 'search', tone: 'urgent' },
        { text: 'Thanks for reporting. I\'m on it.', icon: 'tool', tone: 'professional' },
        { text: 'Can you share steps to reproduce?', icon: 'list', tone: 'clarifying' },
      ],
      update: [
        { text: 'Thanks for the update!', icon: 'thumbs-up', tone: 'positive' },
        { text: 'Noted. Keep me posted on any changes.', icon: 'bell', tone: 'professional' },
        { text: 'Great progress! Let\'s sync on next steps.', icon: 'trending-up', tone: 'proactive' },
      ],
      proposal: [
        { text: 'This looks promising. Let\'s discuss further.', icon: 'message-circle', tone: 'interested' },
        { text: 'I\'ll review the proposal and get back to you.', icon: 'file', tone: 'professional' },
        { text: 'Could you break down the costs?', icon: 'dollar-sign', tone: 'request' },
      ],
      general: [
        { text: 'Thanks, noted.', icon: 'check', tone: 'professional' },
        { text: 'I\'ll review and get back to you.', icon: 'eye', tone: 'professional' },
        { text: 'Sounds good!', icon: 'thumbs-up', tone: 'positive' },
      ],
    };

    return replies[type] || replies.general;
  },

  _stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  },
};
