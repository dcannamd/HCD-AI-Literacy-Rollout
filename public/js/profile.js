// The company profile, entered once and reused by every module.
// It is stored only in this browser (localStorage). Nothing is sent to the server.
(function (root) {
  const KEY = 'hcd-profile-v1';

  const ROLE_TIERS = [
    { id: 'frontline', label: 'frontline employees' },
    { id: 'knowledge', label: 'knowledge workers' },
    { id: 'managers', label: 'people managers' },
    { id: 'executives', label: 'executives' },
    { id: 'builders', label: 'technical builders' }
  ];

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save(profile) {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) { /* storage unavailable */ }
  }

  // Fill a form from an object: text fields by name, checkbox groups as arrays, radios by value.
  function fillForm(form, values) {
    Array.from(form.elements).forEach((el) => {
      if (!el.name || !(el.name in values)) return;
      const v = values[el.name];
      if (el.type === 'checkbox') el.checked = Array.isArray(v) ? v.includes(el.value) : !!v;
      else if (el.type === 'radio') el.checked = el.value === v;
      else el.value = v;
    });
  }

  // Read a form into an object. Checkbox groups (same name, several boxes) become arrays.
  function readForm(form) {
    const out = {};
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        const group = form.querySelectorAll(`input[type=checkbox][name="${el.name}"]`);
        if (group.length > 1) {
          out[el.name] = out[el.name] || [];
          if (el.checked) out[el.name].push(el.value);
        } else {
          out[el.name] = el.checked;
        }
      } else if (el.type === 'radio') {
        if (el.checked) out[el.name] = el.value;
      } else if (el.tagName !== 'BUTTON' && el.type !== 'submit') {
        out[el.name] = el.value.trim();
      }
    });
    return out;
  }

  root.HCDProfile = { load, save, clear, fillForm, readForm, ROLE_TIERS };
})(window);
