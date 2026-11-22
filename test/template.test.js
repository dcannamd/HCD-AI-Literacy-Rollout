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
    languages: 'French', signed_by: 'The leadership team'
  });
  assert.ok(!/\{\{|\}\}/.test(full));
  assert.ok(!/\[\w/.test(full), 'no missing-value markers when everything is filled');
  const empty = render(tpl, {});
  assert.ok(!/\{\{|\}\}/.test(empty));
  assert.ok(!empty.includes('CUPE'));
});
