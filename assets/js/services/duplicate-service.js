/* =============================================
   Service — Duplicate Email Detection
   Finds repeated promos, similar subjects,
   same-sender repetitive content
   ============================================= */

const DuplicateService = {
  detect(emails) {
    const groups = [];
    const processed = new Set();

    for (let i = 0; i < emails.length; i++) {
      if (processed.has(emails[i].id)) continue;

      const dupes = [emails[i]];

      for (let j = i + 1; j < emails.length; j++) {
        if (processed.has(emails[j].id)) continue;

        if (this._isDuplicate(emails[i], emails[j])) {
          dupes.push(emails[j]);
          processed.add(emails[j].id);
        }
      }

      if (dupes.length > 1) {
        processed.add(emails[i].id);
        groups.push({
          id: 'dup_' + emails[i].id,
          original: dupes[0],
          duplicates: dupes.slice(1),
          count: dupes.length,
          type: this._getDuplicateType(dupes[0], dupes[1]),
          sender: dupes[0].from?.name || dupes[0].from?.email,
          subject: dupes[0].subject,
        });
      }
    }

    groups.sort((a, b) => b.count - a.count);
    return groups;
  },

  _isDuplicate(a, b) {
    if (this._exactSubjectMatch(a, b)) return true;
    if (this._sameSenderSimilarSubject(a, b)) return true;
    if (this._sameSenderSameContent(a, b)) return true;
    return false;
  },

  _exactSubjectMatch(a, b) {
    const subA = this._normalize(a.subject);
    const subB = this._normalize(b.subject);
    if (!subA || !subB) return false;
    return subA === subB && a.id !== b.id;
  },

  _sameSenderSimilarSubject(a, b) {
    const sameFrom = (a.from?.email || '').toLowerCase() === (b.from?.email || '').toLowerCase();
    if (!sameFrom) return false;

    const similarity = this._similarity(
      this._normalize(a.subject),
      this._normalize(b.subject)
    );
    return similarity > 0.7;
  },

  _sameSenderSameContent(a, b) {
    const sameFrom = (a.from?.email || '').toLowerCase() === (b.from?.email || '').toLowerCase();
    if (!sameFrom) return false;

    const previewA = this._normalize(a.preview || '');
    const previewB = this._normalize(b.preview || '');
    if (!previewA || !previewB) return false;

    return this._similarity(previewA, previewB) > 0.8;
  },

  _getDuplicateType(a, b) {
    if (this._normalize(a.subject) === this._normalize(b.subject))
      return 'exact_subject';
    if ((a.from?.email || '').toLowerCase() === (b.from?.email || '').toLowerCase())
      return 'same_sender';
    return 'similar_content';
  },

  _normalize(str) {
    return (str || '')
      .toLowerCase()
      .replace(/^(re|fwd|fw):\s*/gi, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  },

  _similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;

    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  },

  getStats(groups) {
    return {
      groupCount: groups.length,
      totalDuplicates: groups.reduce((sum, g) => sum + g.duplicates.length, 0),
      byType: {
        exactSubject: groups.filter(g => g.type === 'exact_subject').length,
        sameSender: groups.filter(g => g.type === 'same_sender').length,
        similarContent: groups.filter(g => g.type === 'similar_content').length,
      },
    };
  },

  getDismissed() {
    return DB.get('dismissed_duplicates', []);
  },

  dismiss(groupId) {
    const dismissed = this.getDismissed();
    if (!dismissed.includes(groupId)) {
      dismissed.push(groupId);
      DB.set('dismissed_duplicates', dismissed);
    }
  },

  clearDismissed() {
    DB.remove('dismissed_duplicates');
  },
};
