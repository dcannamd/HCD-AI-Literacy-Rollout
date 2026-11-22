const test = require('node:test');
const assert = require('node:assert');
const { buildPlan } = require('../public/js/plan.js');
const activities = require('../content/learning-plans/activities.json');
const roleTiers = require('../content/learning-plans/role-tiers.json');

const base = { activities, roleTiers, country: 'US', task: 'writing client emails' };

test('frontline: 3 baseline areas + 2 deep areas = 9 twenty-minute sessions, one a week', () => {
  const plan = buildPlan({ ...base, tierIds: ['frontline'] });
  assert.strictEqual(plan.sessionCount, 9);
  assert.strictEqual(plan.weeks.length, 9);
  assert.strictEqual(plan.weeks[0][0].area, 'understand', 'the foundation always comes first');
});

test('every role except technical builders fits the 90-day rollout at 20 minutes a week', () => {
  for (const tier of Object.keys(roleTiers.tiers)) {
    if (tier === 'builders') continue;
    const plan = buildPlan({ ...base, tierIds: [tier] });
    assert.ok(plan.weeks.length <= 13, `${tier}: ${plan.weeks.length} weeks`);
  }
});

test('technical builders fit the 90 days at 40 minutes a week', () => {
  assert.ok(buildPlan({ ...base, tierIds: ['builders'], minutes: 40 }).weeks.length <= 13);
});

test('more time per week means fewer weeks', () => {
  const plan = buildPlan({ ...base, tierIds: ['frontline'], minutes: 40 });
  assert.strictEqual(plan.perWeek, 2);
  assert.strictEqual(plan.weeks.length, 5);
});

test('low self-ratings move an area earlier', () => {
  const plan = buildPlan({ ...base, tierIds: ['knowledge'], ratings: { explore: 1, direct: 5, evaluate: 5 } });
  assert.strictEqual(plan.areas[1], 'explore');
});

test('several tiers take the deepest level for each area', () => {
  const plan = buildPlan({ ...base, tierIds: ['knowledge', 'managers'] });
  assert.strictEqual(plan.depth.direct, 'deep');
  assert.strictEqual(plan.depth.responsible, 'deep');
});

test('sessions are interleaved, not blocked', () => {
  const plan = buildPlan({ ...base, tierIds: ['frontline'] });
  const areas = plan.weeks.flat().map((s) => s.area);
  for (let i = 1; i < areas.length - 2; i++) {
    assert.ok(!(areas[i] === areas[i + 1] && areas[i] === areas[i + 2]), 'no three in a row');
  }
});

test('role-specific and Canadian wording are used, and the task is filled in', () => {
  const mgr = buildPlan({ ...base, tierIds: ['managers'] }).weeks.flat();
  assert.ok(mgr.some((s) => /team huddle/.test(s.try)));
  const ca = buildPlan({ ...base, tierIds: ['frontline'], country: 'CA' }).weeks.flat();
  assert.ok(ca.some((s) => /PIPEDA/.test(s.learn)));
  assert.ok(ca.every((s) => !s.try.includes('{{task}}')));
  assert.ok(ca.some((s) => s.try.includes('writing client emails')));
});

test('only technical builders get the build area', () => {
  assert.ok(!buildPlan({ ...base, tierIds: ['executives'] }).areas.includes('build'));
  assert.ok(buildPlan({ ...base, tierIds: ['builders'] }).areas.includes('build'));
});
