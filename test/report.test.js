const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { resultsMarkdown, change } = require('../public/js/report.js');
const { render } = require('../public/js/template.js');

test('before 90 days, the report says to fill it in later', () => {
  assert.match(resultsMarkdown({}), /Add your 90-day numbers above/);
});

test('results are never shown for fewer than 5 responses', () => {
  const out = resultsMarkdown({ responses: '4', conf_start: '2.1', conf_end: '3.4' });
  assert.match(out, /not reported, to protect privacy/);
  assert.ok(!out.includes('3.4'));
  assert.match(resultsMarkdown({ conf_end: '3.4' }), /Add how many people responded/);
});

test('change shows direction, and marks improvements', () => {
  assert.strictEqual(change('2.1', '3.4'), '+1.3 ✓');
  assert.strictEqual(change('6', '2', true), '-4 ✓', 'fewer unapproved tools is better');
  assert.strictEqual(change('2', '6', true), '+4');
  assert.strictEqual(change('3', '3'), 'No change');
  assert.strictEqual(change('', '3'), '');
});

test('a full report lists only the measures that were filled in', () => {
  const out = resultsMarkdown({
    responses: '24', pulse_end: '4.2', conf_start: '2.1', conf_end: '3.4',
    incidents_start: '3', incidents_end: '1', outcome_start: '6 h', outcome_end: '4 h'
  }, 'Hours on follow-ups');
  assert.match(out, /Based on 24 responses/);
  assert.match(out, /\| Confidence \(average, 1 to 5\) \| 2\.1 \| 3\.4 \| \+1\.3 ✓ \|/);
  assert.match(out, /\| Hours on follow-ups \| 6 h \| 4 h \| -2 \|/);
  assert.ok(!out.includes('approved tools'));
});

test('the measure and report template renders cleanly', () => {
  const tpl = fs.readFileSync(path.join(__dirname, '../content/templates/measure-report.md'), 'utf8');
  const out = render(tpl, { org_name: 'H', today: 't', behaviour: 'Data incidents', results: 'Fill this in later.' });
  assert.ok(!/\{\{|\}\}/.test(out));
  assert.ok(!out.includes('Does it matter?'));
  assert.ok(!out.includes('You said, we did'));
  assert.strictEqual(out.split('\n').filter((l) => l.startsWith('|')).length, 5);
});
