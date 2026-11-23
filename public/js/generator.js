// Shared logic for every document generator page:
// a form, a markdown template, and a live preview with copy, download and print.
// Form answers are kept as a draft in this browser only.
(function (root) {
  function plainText(markdown) {
    // The template engine HTML-escapes values; undo that for copied and downloaded text.
    return markdown.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }

  function setup(opts) {
    const form = document.getElementById(opts.formId || 'doc-form');
    const preview = document.getElementById(opts.previewId || 'preview');
    const status = document.getElementById(opts.statusId || 'status');
    let template = '';
    let lastMarkdown = '';

    try {
      const draft = JSON.parse(localStorage.getItem(opts.draftKey));
      if (draft) HCDProfile.fillForm(form, draft);
    } catch (e) { /* no saved draft */ }

    function update() {
      if (!template) return;
      const answers = HCDProfile.readForm(form);
      try {
        localStorage.setItem(opts.draftKey, JSON.stringify(answers));
      } catch (e) { /* storage unavailable */ }
      lastMarkdown = HCDTemplate.render(template, opts.buildData(answers, HCDProfile.load()));
      // Values are HTML-escaped by the template engine before markdown is parsed.
      preview.innerHTML = marked.parse(lastMarkdown);
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);

    document.getElementById('copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(plainText(lastMarkdown));
        status.textContent = 'Copied. Paste it into an email, document or intranet page.';
      } catch (e) {
        status.textContent = 'Your browser blocked copying. Use Download instead.';
      }
    });

    document.getElementById('download').addEventListener('click', () => {
      const blob = new Blob([plainText(lastMarkdown)], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = opts.filename;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById('print').addEventListener('click', () => window.print());

    const note = document.getElementById('profile-note');
    if (note) {
      note.innerHTML = HCDProfile.load().org_name
        ? 'Using your organization details. <a href="/profile">Edit them</a>.'
        : 'Add your organization details first to fill in more of this document. <a href="/profile">Add them</a>.';
    }

    fetch(opts.templateUrl)
      .then((r) => r.text())
      .then((text) => { template = text; update(); });

    return { update };
  }

  function today() {
    return new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  root.HCDGenerator = { setup, today, plainText };
})(window);
