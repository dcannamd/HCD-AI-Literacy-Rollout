const test = require('node:test');
const assert = require('node:assert');
const { detectRedLines, checkPrompt, scoreFlags } = require('../public/js/sandbox.js');
const scenarios = require('../content/sandbox/scenarios.json');

const kinds = (text, opts) => detectRedLines(text, opts).map((f) => f.kind);

test('finds emails, phone numbers and credentials', () => {
  const k = kinds('Email jo@example.com or call 250-555-0143. password: hunter2');
  assert.deepStrictEqual(k, ['Email address', 'Phone number', 'Password or credential']);
});

test('finds a Canadian SIN in Canada and a US SSN in the US', () => {
  assert.ok(kinds('SIN 046 454 286', { country: 'CA' }).includes('Possible Social Insurance Number'));
  assert.ok(kinds('SSN 123-45-6789', { country: 'US' }).includes('Possible Social Security number'));
});

test('finds a valid card number but not a random long number', () => {
  assert.ok(kinds('card 4111 1111 1111 1111').includes('Payment card number'));
  assert.ok(!kinds('order 1234 5678 9012 3456').includes('Payment card number'));
});

test('finds scenario names, secrets and confidential markings', () => {
  const k = kinds('Confidential: Tom Okafor says store 14 may close', {
    names: ['Tom Okafor'], secrets: ['store 14 may close']
  });
  assert.deepStrictEqual(k, ['Marked confidential', "Real person's name", 'Confidential detail']);
});

test('a safe prompt has no red lines', () => {
  assert.strictEqual(detectRedLines('Write a kind email to [client name] offering an afternoon appointment.', { names: ['Priya'] }).length, 0);
});

test('every scenario starter needs work, and its notes are full of red lines', () => {
  scenarios.prompt.forEach((s) => {
    assert.ok(checkPrompt(s.starter).score <= 2, s.id);
    assert.ok(detectRedLines(s.notes, { country: 'CA', names: s.names, secrets: s.secrets }).length >= 2, s.id);
  });
});

test('a complete prompt scores all five parts', () => {
  const r = checkPrompt('You are a friendly coordinator. Draft a short email for a client who missed an appointment because mornings are hard. Under 100 words, warm tone. For example: "We missed you today!"');
  assert.strictEqual(r.score, 5);
});

test('scores flagged sentences', () => {
  const s = scenarios.spot[0].sentences;
  const r = scoreFlags(s, ['b', 'a']);
  assert.deepStrictEqual(r.caught.map((x) => x.id), ['b']);
  assert.deepStrictEqual(r.missed.map((x) => x.id), ['d', 'e']);
  assert.deepStrictEqual(r.falseAlarms.map((x) => x.id), ['a']);
});

test('every compare scenario names a valid better prompt', () => {
  scenarios.compare.forEach((c) => assert.ok(['a', 'b'].includes(c.better) && c.why));
});
