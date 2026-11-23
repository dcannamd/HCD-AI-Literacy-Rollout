// "Send feedback" link at the bottom of every page.
// Paste the Google Form's pre-filled link below, made with the word "plan" in the
// "Which page?" box. The app swaps "plan" for each page's name. Leave it empty to hide the link.
(function () {
  const FEEDBACK_URL = '';

  if (!FEEDBACK_URL) return;
  const main = document.querySelector('main');
  if (!main) return;
  const page = location.pathname.replace(/^\/|\/$/g, '') || 'home';
  let href = FEEDBACK_URL;
  try {
    const url = new URL(FEEDBACK_URL);
    url.searchParams.forEach((value, key) => {
      if (value === 'plan') url.searchParams.set(key, page);
    });
    href = url.toString();
  } catch (e) { /* use the link as given */ }

  const p = document.createElement('p');
  p.className = 'feedback-link no-print';
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = 'Send feedback on this page';
  p.append(a);
  main.append(p);
})();
