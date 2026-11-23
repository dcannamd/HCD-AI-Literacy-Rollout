// Practice sandbox engine. No AI: feedback comes from rules that run in the browser,
// so nothing the learner types ever leaves their device.
// Works in the browser (window.HCDSandbox) and in Node for tests.
(function (root) {
  // ---------- Red lines: things that should never go into an AI tool ----------

  function luhn(digits) {
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = Number(digits[i]);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  const ID_LABEL = { CA: 'a Social Insurance Number', US: 'a Social Security number' };

  function detectRedLines(text, opts) {
    const options = opts || {};
    const country = options.country === 'CA' ? 'CA' : 'US';
    const found = [];
    const taken = [];
    const overlaps = (s, e) => taken.some(([a, b]) => s < b && e > a);
    const add = (match, index, kind, why) => {
      const end = index + match.length;
      if (overlaps(index, end)) return;
      taken.push([index, end]);
      found.push({ kind, text: match, index, why });
    };
    const scan = (re, fn) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) fn(m);
    };

    // Most specific first, so a card number isn't also reported as a phone number.
    scan(/\b(?:\d[ -]?){12,18}\d\b/g, (m) => {
      const digits = m[0].replace(/\D/g, '');
      if (digits.length >= 13 && luhn(digits)) {
        add(m[0], m.index, 'Payment card number', 'Card numbers are financial data. Never enter them into an AI tool.');
      }
    });
    scan(/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g, (m) =>
      add(m[0], m.index, 'Email address', "Someone's email address is personal information. Use a placeholder like [client email]."));
    const idRe = country === 'CA' ? /\b\d{3}[ -]?\d{3}[ -]?\d{3}\b/g : /\b\d{3}-?\d{2}-?\d{4}\b/g;
    scan(idRe, (m) =>
      add(m[0], m.index, `Possible ${ID_LABEL[country].replace(/^an? /, '')}`, `This looks like ${ID_LABEL[country]}, one of the most sensitive pieces of personal information there is.`));
    scan(/(?:\+?1[ .-]?)?\(?\b\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g, (m) =>
      add(m[0], m.index, 'Phone number', 'A phone number identifies a real person. Use a placeholder instead.'));
    scan(/\b(?:password|passcode|pwd|pin|api[ _-]?key|secret|token)\b\s*(?:is|:|=)?\s*\S+/gi, (m) =>
      add(m[0], m.index, 'Password or credential', 'Never share passwords, PINs or keys with an AI tool, even a trusted one.'));
    if (country === 'CA') {
      scan(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi, (m) =>
        add(m[0], m.index, 'Postal code', 'A postal code combined with other details can identify someone. Leave it out.'));
    }
    (options.names || []).forEach((name) => {
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      scan(re, (m) => add(m[0], m.index, 'Real person\'s name', `${name} is a client in this scenario. Use a placeholder like [client name].`));
    });
    (options.secrets || []).forEach((secret) => {
      const re = new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      scan(re, (m) => add(m[0], m.index, 'Confidential detail', 'This detail is confidential in this scenario. Describe the situation in general terms instead.'));
    });
    scan(/\b(?:confidential|internal only|under NDA|not for distribution|unreleased)\b/gi, (m) =>
      add(m[0], m.index, 'Marked confidential', 'If it is marked confidential, it does not go into an AI tool.'));

    return found.sort((a, b) => a.index - b.index);
  }

  // ---------- Clear instructions: the five parts of a good prompt ----------

  const PARTS = [
    {
      id: 'role',
      label: 'Role',
      tip: 'Who should the AI act as?',
      test: /\b(you are|you're|act as|acting as|as an? [a-z]+|take the role|pretend)\b/i
    },
    {
      id: 'task',
      label: 'Task',
      tip: 'What exactly should it do?',
      test: /\b(write|draft|summari[sz]e|create|list|explain|rewrite|translate|compare|suggest|outline|edit|review|plan|reply|respond|turn|make|give me|help me)\b/i
    },
    {
      id: 'context',
      label: 'Context',
      tip: "Who is it for, and what's the situation?",
      test: /\b(because|audience|reader|readers|background|context|situation|for (?:a|an|our|my|the|new|busy)\b|they are|they're|who (?:is|are|has|have)|we are|we're|our (?:team|clients|customers|organization))/i
    },
    {
      id: 'format',
      label: 'Format',
      tip: 'How long, what tone, what shape?',
      test: /\b(bullet|bullets|list|table|paragraph|paragraphs|words|sentences|email|tone|format|short|brief|headings|steps|plain language|friendly|formal|under \d+|no more than)\b/i
    },
    {
      id: 'example',
      label: 'Example',
      tip: 'Show what good looks like.',
      test: /\b(example|e\.g\.|for instance|like this|such as|sample|here's one|here is one)\b|"[^"]{12,}"/i
    }
  ];

  function checkPrompt(text) {
    const words = (text.trim().match(/\S+/g) || []).length;
    const parts = PARTS.map((p) => ({ id: p.id, label: p.label, tip: p.tip, present: p.test.test(text) }));
    const score = parts.filter((p) => p.present).length;
    let summary;
    if (words < 8) summary = 'Keep going: add a few more details.';
    else if (score >= 4) summary = 'Strong. The AI has what it needs.';
    else if (score >= 2) summary = 'Good start. Add the missing parts.';
    else summary = 'Too vague. Add a role, context and format.';
    return { parts, score, words, summary };
  }

  // ---------- Spot the error: score which sentences the learner flagged ----------

  function scoreFlags(sentences, flaggedIds) {
    const flagged = new Set(flaggedIds);
    const errors = sentences.filter((s) => s.error);
    return {
      caught: errors.filter((s) => flagged.has(s.id)),
      missed: errors.filter((s) => !flagged.has(s.id)),
      falseAlarms: sentences.filter((s) => !s.error && flagged.has(s.id)),
      total: errors.length
    };
  }

  const api = { detectRedLines, checkPrompt, scoreFlags, PARTS, luhn };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HCDSandbox = api;
})(this);
