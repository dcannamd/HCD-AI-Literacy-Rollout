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

// Render uses this to check the app is up.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: require('./package.json').version });
});

// One page per module. The page reads its own content from modules.json.
MODULES.forEach((m) => {
  app.get(`/${m.slug}`, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'module.html'));
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HCD AI Literacy Rollout running on http://localhost:${PORT}`);
});
