const test = require('node:test');
const assert = require('node:assert');
const { buildPlan } = require('../public/js/plan.js');
const { summary, sessionKey, buildIcs, firstSlot } = require('../public/js/progress.js');
const activities = require('../content/learning-plans/activities.json');
const roleTiers = require('../content/learning-plans/role-tiers.json');

const plan = buildPlan({ tierIds: ['frontline'], activities, roleTiers, country: 'CA', task: 'x' });

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
