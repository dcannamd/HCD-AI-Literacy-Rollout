const test = require('node:test');
const assert = require('node:assert');
const { buildPlan } = require('../public/js/plan.js');
const { summary, sessionKey, buildIcs, firstSlot } = require('../public/js/progress.js');
const activities = require('../content/learning-plans/activities.json');
const roleTiers = require('../content/learning-plans/role-tiers.json');

const plan = buildPlan({ tierIds: ['frontline'], activities, roleTiers, country: 'US', task: 'x' });

test('progress summary counts done sessions and finds the next one', () => {
  const sessions = plan.weeks.flat();
  const done = { [sessionKey(sessions[0])]: '2026-11-22', [sessionKey(sessions[1])]: '2026-11-29' };
  const s = summary(plan, done);
  assert.strictEqual(s.done, 2);
  assert.strictEqual(s.total, 9);
  assert.strictEqual(s.percent, 22);
  assert.strictEqual(s.next, sessions[2]);
  assert.strictEqual(s.complete, false);
});

test('a plan is complete when every session is done', () => {
  const done = Object.fromEntries(plan.weeks.flat().map((s) => [sessionKey(s), '2026-11-22']));
  const s = summary(plan, done);
  assert.ok(s.complete);
  assert.strictEqual(s.next, null);
});

test('reminders start on the next chosen weekday, never today', () => {
  const sunday = new Date(2026, 10, 22, 12, 0);
  assert.strictEqual(firstSlot(sunday, 2, '10:00').getDate(), 24, 'next Tuesday');
  const tuesdayLate = new Date(2026, 10, 24, 11, 0);
  assert.strictEqual(firstSlot(tuesdayLate, 2, '10:00').getDate(), 1, 'a week later, Dec 1');
});

test('the calendar file has one event per week plus the check-in', () => {
  const ics = buildIcs(plan, { from: new Date(2026, 10, 22, 12, 0), weekday: 2, time: '10:00' });
  assert.strictEqual((ics.match(/BEGIN:VEVENT/g) || []).length, plan.weeks.length + 1);
  assert.ok(ics.includes('DTSTART:20261124T100000'));
  assert.ok(ics.includes('DTEND:20261124T102000'), '20 minutes long');
  assert.ok(ics.includes('90-day check-in'));
  assert.ok(ics.split('\r\n').every((l) => !l.includes('\n')));
});

test('both countries map the plan to their foundational framework', () => {
  const us = require('../content/frameworks/us.json');
  const ca = require('../content/frameworks/ca.json');
  assert.ok(us.foundation_intro && us.principles.length >= 5);
  assert.ok(ca.foundation_intro && ca.foundation.minutes === 90);
});

test('a progress backup round-trips, and other files are rejected plainly', () => {
  const { makeBackup, readBackup } = require('../public/js/progress.js');
  const store = new Map([
    ['hcd-plan-v1', JSON.stringify({ tiers: ['frontline'] })],
    ['hcd-progress-v1', JSON.stringify({ done: { 'understand-1': '2026-11-22' } })],
    ['hcd-profile-v1', JSON.stringify({ org_name: 'Not included' })]
  ]);
  const backup = makeBackup({ getItem: (k) => store.get(k) || null });
  assert.deepStrictEqual(Object.keys(backup.data).sort(), ['hcd-plan-v1', 'hcd-progress-v1']);
  const entries = readBackup(JSON.parse(JSON.stringify(backup)));
  assert.strictEqual(entries.length, 2);
  assert.throws(() => readBackup({ hello: 'world' }), /isn't a learning plan backup/);
  assert.throws(() => readBackup({ app: 'hcd-ai-literacy-rollout', type: 'learning-plan-backup', data: {} }), /empty/);
});

test('the daily calendar has two 10-minute workday events per session, never on weekends', () => {
  const ca = require('../content/frameworks/ca.json');
  const daily = buildPlan({ tierIds: ['frontline'], activities, roleTiers, country: 'CA', foundation: ca.foundation, minutes: 'daily' });
  const ics = buildIcs(daily, { from: new Date(2026, 10, 27, 12, 0), time: '09:00' }); // a Friday, after 9:00
  const starts = [...ics.matchAll(/DTSTART:(\d{8})T(\d{4})/g)].map((m) => m[1]);
  assert.strictEqual(starts.length, daily.sessionCount * 2 + 1);
  assert.strictEqual(starts[0], '20261130', 'starts the next Monday');
  starts.forEach((d) => {
    const day = new Date(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8)).getDay();
    assert.ok(day >= 1 && day <= 5, `${d} is a workday`);
  });
  assert.ok(ics.includes('DTEND:20261130T091000'), '10 minutes long');
});
