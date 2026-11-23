const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { render, joinList } = require('../public/js/template.js');

test('inserts values and escapes HTML', () => {
  assert.strictEqual(render('Hi {{name}}', { name: '<b>Ana</b>' }), 'Hi &lt;b&gt;Ana&lt;/b&gt;');
});

test('marks missing values so they are easy to spot', () => {
  assert.strictEqual(render('Org: {{org_name}}', {}), 'Org: [org name]');
});

test('keeps or drops conditional blocks', () => {
  const t = 'A{{#if x}}, B{{/if}}.';
  assert.strictEqual(render(t, { x: 'yes' }), 'A, B.');
  assert.strictEqual(render(t, { x: '' }), 'A.');
  assert.strictEqual(render(t, { x: [] }), 'A.');
});

test('drops a block on its own lines without leaving a gap', () => {
  const t = 'one\n{{#if x}}\n- two\n{{/if}}\nthree';
  assert.strictEqual(render(t, {}), 'one\nthree');
  assert.strictEqual(render(t, { x: true }), 'one\n- two\nthree');
});

test('joins lists in plain English', () => {
  assert.strictEqual(joinList(['a']), 'a');
  assert.strictEqual(joinList(['a', 'b']), 'a and b');
  assert.strictEqual(joinList(['a', 'b', 'c']), 'a, b and c');
});

test('the purpose and promises template renders with no leftover tags', () => {
  const tpl = fs.readFileSync(path.join(__dirname, '../content/templates/purpose-and-promises.md'), 'utf8');
  const full = render(tpl, {
    org_name: 'Comox Valley Food Bank', today: 'November 21, 2026', role_tiers: 'frontline employees',
    purpose_note: 'Note.', start_date: 'January 2027', data_promise: 'P.', union: true, union_name: 'CUPE',
    data_detail: 'D.', approved_tools: 'Gemini', policy_line: 'Policy.', contact: 'HR',
    languages: 'French', signed_by: 'The leadership team', plan_link: 'https://example.org/plan'
  });
  assert.ok(!/\{\{|\}\}/.test(full));
  assert.ok(!/\[\w/.test(full), 'no missing-value markers when everything is filled');
  const empty = render(tpl, {});
  assert.ok(!/\{\{|\}\}/.test(empty));
  assert.ok(!empty.includes('CUPE'));
});

test('the HR conversation script drops unchosen data sources and keeps the table intact', () => {
  const tpl = fs.readFileSync(path.join(__dirname, '../content/templates/hr-conversation-script.md'), 'utf8');
  const out = render(tpl, {
    org_name: 'Comox Valley Food Bank', today: 'today', hr_lead: 'Our HR manager', it_contact: 'IT',
    employee_reps: 'Reps', src_usage: true, src_survey: true, results_date: 'February 9'
  });
  assert.ok(!/\{\{|\}\}/.test(out));
  assert.ok(out.includes('Tool usage, grouped by team'));
  assert.ok(!out.includes('expense reports show'));
  assert.ok(out.includes('By February 9, share'));
  const table = out.split('\n').filter((l) => l.startsWith('|'));
  assert.strictEqual(table.length, 5, 'header, divider, two chosen rows and the closing row');
  const none = render(tpl, { no_results_date: true });
  assert.ok(none.includes('\nShare a team-level summary'));
});

test('framework files cover every area the role matrix uses', () => {
  const tiers = require('../content/learning-plans/role-tiers.json').tiers;
  for (const code of ['us', 'ca']) {
    const fw = require(`../content/frameworks/${code}.json`);
    const grouped = fw.groups.flatMap((g) => g.areas);
    grouped.forEach((a) => assert.ok(fw.areas[a], `${code}: ${a} has a label`));
    for (const t of Object.values(tiers)) {
      for (const [area, depth] of Object.entries(t.depth)) {
        if (depth === 'none' || (code === 'us' && area === 'build')) continue;
        assert.ok(grouped.includes(area), `${code}: ${area} appears in a group`);
      }
    }
  }
});

test('the AI use guide shows country law notes only when AI is used in HR decisions', () => {
  const tpl = fs.readFileSync(path.join(__dirname, '../content/templates/ai-use-guide.md'), 'utf8');
  const base = {
    org_name: 'Harbourview', today: 'today', tools_line: 'Use Gemini.', request_line: 'ask IT',
    red_lines: '- Passwords', disclosure: 'Say so.', incident_contact: 'IT', review: '6 months', people_decisions: 'People decide.'
  };
  const without = render(tpl, base);
  assert.ok(!/\{\{|\}\}/.test(without));
  assert.ok(!/\[\w/.test(without.replace('[client name]', '')), 'no missing values');
  assert.ok(!without.includes('Laws we check'));
  for (const code of ['ca', 'us']) {
    const law = require(`../content/frameworks/${code}.json`).law_check;
    assert.ok(law.as_of && law.items.length >= 3 && law.sources.length, code);
    const withLaw = render(tpl, { ...base, hr_ai: true, law_as_of: law.as_of, law_lines: law.items.map((i) => `- ${i}`).join('\n') });
    assert.ok(withLaw.includes('Laws we check (as of November 2026)'));
  }
});

test('the launch kit renders with and without the optional parts', () => {
  const tpl = fs.readFileSync(path.join(__dirname, '../content/templates/launch-kit.md'), 'utf8');
  const full = render(tpl, {
    org_name: 'Harbourview', today: 'today', senders: 'Maria, Sam and Lee', launch_date: 'January 12',
    plan_link: 'https://example.org/plan', work_time: true, peer_quote: 'It was easy.', peer_name: 'Lee',
    contact: 'Sam', office_hours: 'Thursdays', data_answer: 'Team totals only.', tools: 'Gemini'
  });
  assert.ok(!/\{\{|\}\}/.test(full));
  assert.ok(!/\[\w/.test(full), 'no missing values');
  assert.ok(full.includes('*"It was easy."* (Lee)'));
  const bare = render(tpl, { org_name: 'H', today: 't', senders: 'S', plan_link: 'p', contact: 'c', data_answer: 'd' });
  assert.ok(!bare.includes('drop in'));
  assert.ok(!bare.includes('work time'));
  assert.ok(bare.split('\n').every((l) => !/^\{\{/.test(l)));
});

test('ticked checklist items are kept in copied and downloaded text', () => {
  const { applyChecks } = require('../public/js/template.js');
  const md = '## Next steps\n\n- [ ] Ground rules signed\n- [ ] Employees notified\n- Not a task';
  const out = applyChecks(md, { 'Employees notified': true });
  assert.ok(out.includes('- [ ] Ground rules signed'));
  assert.ok(out.includes('- [x] Employees notified'));
  assert.ok(out.includes('- Not a task'));
  assert.strictEqual(applyChecks(md, {}), md);
});
