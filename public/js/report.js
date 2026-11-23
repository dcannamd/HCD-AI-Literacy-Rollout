// Builds the 90-day results table for the measure and report page.
// Keeps the privacy promise: nothing is reported for fewer than 5 responses.
// Works in the browser (window.HCDReport) and in Node for tests.
(function (root) {
  const MIN_GROUP = 5;

  const ROWS = [
    { id: 'pulse', label: 'Found it useful (average, 1 to 5)', endOnly: true },
    { id: 'conf', label: 'Confidence (average, 1 to 5)' },
    { id: 'approved', label: 'Teams using approved tools' },
    { id: 'unapproved', label: 'Unapproved tools in use', lowerIsBetter: true },
    { id: 'incidents', label: 'Data incidents', lowerIsBetter: true },
    { id: 'outcome', label: null }
  ];

  const num = (v) => {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const n = Number(String(v).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  function change(start, end, lowerIsBetter) {
    const a = num(start);
    const b = num(end);
    if (a === null || b === null) return '';
    const d = Math.round((b - a) * 10) / 10;
    if (d === 0) return 'No change';
    const better = lowerIsBetter ? d < 0 : d > 0;
    return `${d > 0 ? '+' : ''}${d}${better ? ' ✓' : ''}`;
  }

  function resultsMarkdown(f, outcomeLabel) {
    const n = num(f.responses);
    const filled = ROWS.some((r) => (f[`${r.id}_end`] || '').trim());
    if (!filled) return 'Add your 90-day numbers above, and this section becomes your report.';
    if (n === null) return 'Add how many people responded. Results are only shown for 5 or more.';
    if (n < MIN_GROUP) return `Only ${n} responses: not reported, to protect privacy. Results need at least ${MIN_GROUP}.`;

    const lines = ['| Measure | Start | 90 days | Change |', '| --- | --- | --- | --- |'];
    ROWS.forEach((r) => {
      const end = (f[`${r.id}_end`] || '').trim();
      if (!end) return;
      const start = r.endOnly ? '' : (f[`${r.id}_start`] || '').trim();
      const label = r.id === 'outcome' ? (outcomeLabel || 'Our outcome') : r.label;
      lines.push(`| ${label} | ${start || '–'} | ${end} | ${r.endOnly ? '' : change(start, end, r.lowerIsBetter)} |`);
    });
    return `Based on ${n} responses.\n\n${lines.join('\n')}`;
  }

  const api = { resultsMarkdown, change, ROWS, MIN_GROUP };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HCDReport = api;
})(this);
