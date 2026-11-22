// Canada or United States, chosen once at the start and kept in the profile.
// It decides which literacy framework, resources and (later) grants the app shows.
// The choice is never guessed from location.
(function (root) {
  const LABELS = { CA: 'Canada', US: 'United States' };

  function get() {
    return HCDProfile.load().country || '';
  }

  function set(code) {
    const profile = HCDProfile.load();
    profile.country = code;
    return HCDProfile.save(profile);
  }

  function framework(code) {
    const c = (code || get() || 'US').toLowerCase();
    return fetch(`/frameworks/${c}.json`).then((r) => r.json());
  }

  root.HCDCountry = { get, set, framework, LABELS };
})(window);
