# HCD AI Literacy Rollout

**A free, open-source planner for rolling out AI literacy the human-centered way.**

An organization describes its situation once, and the app helps it bring people into the process, learn and practise safely, find funding, and generate the documents a rollout needs.

Inspired by Devlin Peck's *AI Literacy Rollout Kit* and grounded in the US Department of Labor AI Literacy Framework, Canada's National AI Literacy Initiative, and the NIST AI Risk Management Framework.

Built by [Dana Cannam](https://www.danacannam.com).

---

## Our promises

- **Capability-building, not surveillance.** This tool is never a performance review or a list of roles to cut.
- **Employees own their plans.** Personal plans and practice stay on the employee's device.
- **Grouped data only.** Any team results are anonymous, and are shown only once at least 5 people have responded.
- **Nobody is punished for honesty.** Disclosing unsanctioned AI use during a baseline is covered by amnesty.

---

## The steps

| Step | Module | What it does |
| --- | --- | --- |
| 0 | Purpose and promises | Leadership states what the program is for, and what it is not |
| 1 | People | HR conversation script (with IT and employees) + a personal learning plan |
| 2 | Learn and practise | The shared core (about 80% the same at any company) + a prompt practice sandbox |
| 3 | Funding | A grant finder for training funding (B.C. and Canada first) |
| 4 | Keep it going | Office hours, champions, and a 90-day re-check |
| — | Documents | Generates the documents the rollout needs |

---

## Project structure

```
server.js        Express server: routes and API
public/          Front end: one page per module (vanilla HTML/CSS/JS)
content/         Markdown curriculum, templates and sandbox scenarios
prompts/         AI prompts, kept as files so they are open and versioned
grants/          Grant knowledge-base build script (Notion -> search index)
evals/           Test questions for the grant finder and prompts
render.yaml      Render deployment settings
```

---

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
cp .env.example .env
npm start
```

Run the tests with `npm test`.

Then visit `http://localhost:3000`. Check that it's running at `http://localhost:3000/health`.

---

## Deploy on Render

1. In Render, choose **New → Blueprint** and select this repo. Render reads `render.yaml`.
2. Add any keys from `.env.example` under the service's **Environment** tab.
3. Optional: add a custom domain (for example `tools.danacannam.com`) under **Settings → Custom Domains**.

The free instance is fine for testing. Switch to an always-on instance before sharing it publicly.

---

## Build phases

1. **Forms and templates (no AI)** ← current: company profile and the purpose and promises statement are live
2. AI personalization
3. Practice sandbox
4. Grant finder (RAG)

---

## License

MIT. Use it, adapt it, and share what you learn.
