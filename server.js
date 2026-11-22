require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// The modules of the app. Each gets its own page at /<slug>,
// so every article on danacannam.com can link straight to its module.
const MODULES = require('./public/modules.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(PUBLIC_DIR));
// Markdown renderer for the browser, served from the installed package (no CDN needed).
app.get('/vendor/marked.min.js', (req, res) => {
  res.sendFile(require.resolve('marked/marked.min.js'));
});
// Document templates are read-only markdown in content/templates.
app.use('/templates', express.static(path.join(__dirname, 'content', 'templates')));
// Literacy frameworks (Canada and US) and learning plan data, also read-only.
app.use('/frameworks', express.static(path.join(__dirname, 'content', 'frameworks')));
app.use('/learning-plans', express.static(path.join(__dirname, 'content', 'learning-plans')));

// Render uses this to check the app is up.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: require('./package.json').version });
});

// One page per module. A module with its own page (public/<slug>.html) gets that page;
// the rest show a placeholder that reads its text from modules.json.
const fs = require('fs');
MODULES.forEach((m) => {
  const ownPage = path.join(PUBLIC_DIR, `${m.slug}.html`);
  app.get(`/${m.slug}`, (req, res) => {
    res.sendFile(fs.existsSync(ownPage) ? ownPage : path.join(PUBLIC_DIR, 'module.html'));
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HCD AI Literacy Rollout running on http://localhost:${PORT}`);
});
