// Builds a personal learning plan from role tiers, self-ratings and pace.
// Pure function: works in the browser (window.HCDPlan) and in Node for tests.
//
// Learning design:
// - Depth per area comes from the role matrix (baseline = 1 session, deep = 3).
//   With several tiers, the deepest level wins.
// - Week 1 is always the foundation (understand). After that, areas the learner
//   rated lowest, and deep areas, come first.
// - Sessions are interleaved across areas (spaced practice), not blocked.
// - Each session is about 20 minutes. Pace is either sessions per week, or
//   'daily': about 10 minutes on each workday, so a session spans two days.
// - In Canada, the free national course (Essentials for Canadians) replaces the
//   plan's own foundation sessions, split into 20-minute sittings.
// - The plan ends with a 90-day check-in using the same self-ratings.
(function (root) {
  const ORDER = ['understand', 'explore', 'direct', 'evaluate', 'responsible', 'build'];
  const RANK = { none: 0, baseline: 1, deep: 2 };
  const SESSION_MINUTES = 20;
  const DAILY_MINUTES = 10;
  const WORKDAYS = 5;

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
    const { tierIds, ratings = {}, minutes = SESSION_MINUTES, task, country, activities, roleTiers, foundation } = input;
    const fill = (text) => text.replace(/\{\{task\}\}/g, task || 'a task you do often');
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
      // Canada: the national course is the foundation, in 20-minute sittings.
      if (a === 'understand' && country === 'CA' && foundation) {
        const of = Math.ceil(foundation.minutes / SESSION_MINUTES);
        return Array.from({ length: of }, (_, i) => ({
          area: a,
          number: i + 1,
          of,
          course: true,
          title: foundation.sitting_title.replace('{{n}}', i + 1).replace('{{of}}', of),
          learn: foundation.sitting_learn,
          try: fill(foundation.sitting_try),
          reflect: foundation.sitting_reflect
        }));
      }
      const count = depth[a] === 'deep' ? 3 : 1;
      return activities.areas[a].sessions.slice(0, count).map((s, i) => ({
        area: a,
        number: i + 1,
        of: count,
        title: s.title,
        learn: pickText(s, 'learn', ctx),
        try: fill(pickText(s, 'try', ctx)),
        reflect: pickText(s, 'reflect', ctx)
      }));
    });
    const sessions = [];
    while (queues.some((q) => q.length)) {
      queues.forEach((q) => { if (q.length) sessions.push(q.shift()); });
    }

    const totalMinutes = sessions.length * SESSION_MINUTES;
    const weeks = [];
    if (minutes === 'daily') {
      // Each session takes two workdays; group sessions by the week their first day falls in.
      sessions.forEach((s, i) => {
        s.days = [2 * i + 1, 2 * i + 2];
        const w = Math.floor((2 * i) / WORKDAYS);
        (weeks[w] = weeks[w] || []).push(s);
      });
      return {
        areas: ordered, depth, weeks, pace: 'daily', perWeek: WORKDAYS / 2,
        minutesPerWeek: DAILY_MINUTES * WORKDAYS, totalMinutes, workdays: sessions.length * 2,
        sessionCount: sessions.length
      };
    }
    const perWeek = Math.max(1, Math.round(Number(minutes) / SESSION_MINUTES) || 1);
    for (let i = 0; i < sessions.length; i += perWeek) {
      weeks.push(sessions.slice(i, i + perWeek));
    }
    return {
      areas: ordered, depth, weeks, pace: 'weekly', perWeek,
      minutesPerWeek: perWeek * SESSION_MINUTES, totalMinutes, sessionCount: sessions.length
    };
  }

  const api = { buildPlan, depthFor, ORDER, SESSION_MINUTES, DAILY_MINUTES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HCDPlan = api;
})(this);
