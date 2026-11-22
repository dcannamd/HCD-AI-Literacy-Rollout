// Builds a personal learning plan from role tiers, self-ratings and pace.
// Pure function: works in the browser (window.HCDPlan) and in Node for tests.
//
// Learning design:
// - Depth per area comes from the role matrix (baseline = 1 session, deep = 3).
//   With several tiers, the deepest level wins.
// - Week 1 is always the foundation (understand). After that, areas the learner
//   rated lowest, and deep areas, come first.
// - Sessions are interleaved across areas (spaced practice), not blocked.
// - Each session is about 20 minutes; pace sets sessions per week.
// - The plan ends with a 90-day check-in using the same self-ratings.
(function (root) {
  const ORDER = ['understand', 'explore', 'direct', 'evaluate', 'responsible', 'build'];
  const RANK = { none: 0, baseline: 1, deep: 2 };
  const SESSION_MINUTES = 20;

  function depthFor(tierIds, roleTiers) {
    const depth = {};
    tierIds.forEach((id) => {
      const tier = roleTiers.tiers[id];
      if (!tier) return;
      Object.entries(tier.depth).forEach(([area, d]) => {
        if (!depth[area] || RANK[d] > RANK[depth[area]]) depth[area] = d;
      });
    });
    return depth;
  }

  function pickText(session, field, ctx) {
    const tierKey = ctx.tierIds.find((t) => session[`${field}_${t}`]);
    if (tierKey) return session[`${field}_${tierKey}`];
    if (ctx.country === 'CA' && session[`${field}_ca`]) return session[`${field}_ca`];
    return session[field];
  }

  function buildPlan(input) {
    const { tierIds, ratings = {}, minutes = SESSION_MINUTES, task, country, activities, roleTiers } = input;
    const ctx = { tierIds, country };
    const depth = depthFor(tierIds, roleTiers);
    const areas = ORDER.filter((a) => depth[a] && depth[a] !== 'none' && activities.areas[a]);
    if (!areas.length) return { areas: [], weeks: [], perWeek: 1 };

    // Priority: lower confidence and deeper areas first. The foundation always leads.
    const score = (a) => (6 - (Number(ratings[a]) || 3)) * (depth[a] === 'deep' ? 2 : 1);
    const ordered = areas
      .filter((a) => a !== 'understand')
      .sort((x, y) => score(y) - score(x) || ORDER.indexOf(x) - ORDER.indexOf(y));
    if (areas.includes('understand')) ordered.unshift('understand');

    // Queue each area's sessions, then interleave them round-robin.
    const queues = ordered.map((a) => {
      const count = depth[a] === 'deep' ? 3 : 1;
      return activities.areas[a].sessions.slice(0, count).map((s, i) => ({
        area: a,
        number: i + 1,
        of: count,
        title: s.title,
        learn: pickText(s, 'learn', ctx),
        try: pickText(s, 'try', ctx).replace(/\{\{task\}\}/g, task || 'a task you do often'),
        reflect: pickText(s, 'reflect', ctx)
      }));
    });
    const sessions = [];
    while (queues.some((q) => q.length)) {
      queues.forEach((q) => { if (q.length) sessions.push(q.shift()); });
    }

    const perWeek = Math.max(1, Math.round(minutes / SESSION_MINUTES));
    const weeks = [];
    for (let i = 0; i < sessions.length; i += perWeek) {
      weeks.push(sessions.slice(i, i + perWeek));
    }
    return { areas: ordered, depth, weeks, perWeek, sessionCount: sessions.length };
  }

  const api = { buildPlan, depthFor, ORDER, SESSION_MINUTES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HCDPlan = api;
})(this);
