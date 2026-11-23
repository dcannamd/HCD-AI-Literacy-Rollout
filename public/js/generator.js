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

    // Ticks on checklist items in the document, saved in this browser by item text.
    const checksKey = `${opts.draftKey}-checks`;
    let checks = {};
    try { checks = JSON.parse(localStorage.getItem(checksKey)) || {}; } catch (e) { checks = {}; }
    const output = () => HCDTemplate.applyChecks(plainText(lastMarkdown), checks);

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
      // Checklist items: tickable, labelled, remembered, and shown without a bullet.
      preview.querySelectorAll('li > input[type=checkbox]').forEach((box) => {
        const li = box.parentElement;
        const text = li.textContent.trim();
        li.classList.add('task');
        li.parentElement.classList.add('task-list');
        box.disabled = false;
        box.checked = !!checks[text];
        box.setAttribute('aria-label', text);
        box.addEventListener('change', () => {
          if (box.checked) checks[text] = true;
          else delete checks[text];
          try { localStorage.setItem(checksKey, JSON.stringify(checks)); } catch (e) { /* storage unavailable */ }
        });
      });
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);

    document.getElementById('copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(output());
        status.textContent = 'Copied. Paste it into an email, document or intranet page.';
      } catch (e) {
        status.textContent = 'Your browser blocked copying. Use Download instead.';
      }
    });

    document.getElementById('download').addEventListener('click', () => {
      const blob = new Blob([output()], { type: 'text/markdown' });
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
