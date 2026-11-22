// Previous / next links at the bottom of every step, in the order of modules.json,
// so people can always move through the rollout without going back to the home page.
(function () {
  const slug = location.pathname.replace(/^\/|\/$/g, '');
  const main = document.querySelector('main');
  if (!slug || !main) return;
  fetch('/modules.json')
    .then((r) => r.json())
    .then((modules) => {
      const i = modules.findIndex((m) => m.slug === slug);
      if (i < 0) return;
      const nav = document.createElement('nav');
      nav.className = 'step-nav no-print';
      nav.setAttribute('aria-label', 'Steps');
      const link = (m, dir) => {
        const a = document.createElement('a');
        a.href = '/' + m.slug;
        a.className = 'step-' + dir;
        const small = document.createElement('span');
        small.textContent = dir === 'next' ? 'Next' : 'Previous';
        const title = document.createElement('strong');
        title.textContent = dir === 'next' ? `${m.title} →` : `← ${m.title}`;
        a.append(small, title);
        return a;
      };
      if (modules[i - 1]) nav.append(link(modules[i - 1], 'prev'));
      if (modules[i + 1]) nav.append(link(modules[i + 1], 'next'));
      main.append(nav);
    });
})();
