// A tiny template engine for the document generator.
//   {{name}}                 inserts a value (HTML-escaped)
//   {{#if name}} ... {{/if}} keeps the block only when the value is non-empty
// Works in the browser (window.HCDTemplate) and in Node (require) for tests.
(function (root) {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function isPresent(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== false && String(value).trim() !== '';
  }

  function render(template, data) {
    // Conditionals first (not nested). A block on its own lines takes its line break with it.
    let out = template.replace(/\{\{#if (\w+)\}\}\n?([\s\S]*?)\{\{\/if\}\}\n?/g, (match, key, body) => {
      if (!isPresent(data[key])) return '';
      return match.endsWith('\n') && !body.endsWith('\n') ? body + '\n' : body;
    });
    out = out.replace(/\{\{(\w+)\}\}/g, (match, key) =>
      isPresent(data[key]) ? escapeHtml(data[key]) : `[${key.replace(/_/g, ' ')}]`
    );
    return out.replace(/\n{3,}/g, '\n\n');
  }

  function joinList(items) {
    const list = (items || []).filter(isPresent);
    if (list.length <= 1) return list.join('');
    if (list.length === 2) return list.join(' and ');
    return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }

  const api = { render, escapeHtml, isPresent, joinList };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HCDTemplate = api;
})(this);
