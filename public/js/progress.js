// Progress through a learning plan: done sessions, the 90-day check-in and calendar reminders.
// Saved only in this browser. No logins, no server.
// Pure helpers work in Node for tests; storage helpers need a browser.
(function (root) {
  const KEY = 'hcd-progress-v1';

  const sessionKey = (s) => `${s.area}-${s.number}`;

  function load() {
    try {
      const p = JSON.parse(localStorage.getItem(KEY)) || {};
      return { done: p.done || {}, after: p.after || {}, reminder: p.reminder || {} };
    } catch (e) {
      return { done: {}, after: {}, reminder: {} };
    }
  }

  function save(progress) {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
      return true;
    } catch (e) {
      return false;
    }
  }

  function summary(plan, done) {
    const sessions = plan.weeks.flat();
    const finished = sessions.filter((s) => done[sessionKey(s)]);
    const total = sessions.length;
    return {
      total,
      done: finished.length,
      percent: total ? Math.round((finished.length / total) * 100) : 0,
      next: sessions.find((s) => !done[sessionKey(s)]) || null,
      complete: total > 0 && finished.length === total
    };
  }

  // ---------- Calendar file (.ics), one event per week ----------

  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  // First occurrence of weekday (0 = Sunday) at hh:mm, strictly after `from`.
  function firstSlot(from, weekday, time) {
    const [h, m] = (time || '10:00').split(':').map(Number);
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), h, m);
    let add = (Number(weekday) - d.getDay() + 7) % 7;
    if (add === 0 && d <= from) add = 7;
    d.setDate(d.getDate() + add);
    return d;
  }

  function buildIcs(plan, opts) {
    const options = opts || {};
    const start = firstSlot(options.from || new Date(), options.weekday ?? 2, options.time);
    const minutes = 20;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HCD AI Literacy Rollout//Learning plan//EN', 'CALSCALE:GREGORIAN'];
    plan.weeks.forEach((week, i) => {
      const begin = new Date(start);
      begin.setDate(start.getDate() + i * 7);
      const end = new Date(begin.getTime() + minutes * week.length * 60000);
      const titles = week.map((s) => s.title).join(' + ');
      const detail = week.map((s) => `${s.title}\nLearn: ${s.learn}\nTry: ${s.try}\nReflect: ${s.reflect}`).join('\n\n');
      lines.push(
        'BEGIN:VEVENT',
        `UID:hcd-plan-week-${i + 1}-${stamp(start)}@hcd-ai-literacy`,
        `DTSTAMP:${stamp(options.from || new Date())}`,
        `DTSTART:${stamp(begin)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${esc(`AI learning, week ${i + 1}: ${titles}`)}`,
        `DESCRIPTION:${esc(detail)}`,
        'END:VEVENT'
      );
    });
    // 90-day check-in, the week after the last session.
    const check = new Date(start);
    check.setDate(start.getDate() + plan.weeks.length * 7);
    const checkEnd = new Date(check.getTime() + 20 * 60000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:hcd-plan-checkin-${stamp(start)}@hcd-ai-literacy`,
      `DTSTAMP:${stamp(options.from || new Date())}`,
      `DTSTART:${stamp(check)}`,
      `DTEND:${stamp(checkEnd)}`,
      `SUMMARY:${esc('AI learning: my 90-day check-in')}`,
      `DESCRIPTION:${esc('Rate the same statements again and compare with where you started.')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    );
    return lines.join('\r\n') + '\r\n';
  }

  // ---------- Save to / restore from a file, so a cleared browser doesn't lose progress ----------

  const BACKUP_KEYS = ['hcd-plan-v1', KEY];

  function makeBackup(store) {
    const data = {};
    BACKUP_KEYS.forEach((k) => {
      const v = store.getItem(k);
      if (v) data[k] = JSON.parse(v);
    });
    return { app: 'hcd-ai-literacy-rollout', type: 'learning-plan-backup', version: 1, saved: new Date().toISOString(), data };
  }

  // Returns the entries to restore, or throws with a plain-language reason.
  function readBackup(obj) {
    if (!obj || obj.app !== 'hcd-ai-literacy-rollout' || obj.type !== 'learning-plan-backup') {
      throw new Error("This file isn't a learning plan backup from this app.");
    }
    const entries = Object.entries(obj.data || {}).filter(([k, v]) => BACKUP_KEYS.includes(k) && v && typeof v === 'object');
    if (!entries.length) throw new Error('This backup file is empty.');
    return entries;
  }

  const api = { KEY, sessionKey, load, save, summary, buildIcs, firstSlot, makeBackup, readBackup, BACKUP_KEYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HCDProgress = api;
})(this);
