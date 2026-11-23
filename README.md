# HCD AI Literacy Rollout

**A free, open-source planner for rolling out AI literacy the human-centered way.**

For organizations of any size, from small nonprofits to large enterprises. Leaders get five short documents to run the rollout; employees get a personal learning plan and a safe place to practise. Everything runs in the browser: no logins, no AI calls, and nothing personal is stored on the server.

Inspired by Devlin Peck's *AI Literacy Rollout Kit* and grounded in the US Department of Labor AI Literacy Framework, Canada's National AI Literacy Initiative, and the NIST AI Risk Management Framework.

Built by [Dana Cannam](https://www.danacannamdesign.com).

---

## Our promises

- **Capability-building, not surveillance.** This tool is never a performance review or a list of roles to cut.
- **Employees own their plans.** Personal plans and practice stay on the employee's device.
- **Grouped data only.** Any team results are anonymous, and are shown only once at least 5 people have responded.
- **Nobody is punished for honesty.** Disclosing unsanctioned AI use during a baseline is covered by amnesty.

---

## Two paths

**I'm leading an AI rollout** (HR, operations leads, consultants). Five documents to share:

| Step | Page | Document |
| --- | --- | --- |
| 1 | Your organization | Profile used by every document |
| 2 | Purpose and promises | What the program is, and is not |
| 3 | Build your baseline together | Conversation guide for HR, IT and employees, with the notice to staff |
| 4 | AI use guide | Approved tools, data red lines and no-blame reporting, plus Canadian or US laws to check if AI is used in HR |
| 5 | Launch kit | Announcement from leadership, HR and a colleague, plus manager talking points |
| 6 | Measure and report | Measurement plan now; add numbers at 90 days and it becomes the report (nothing shown for groups under 5) |
| Optional | Fund it | Grant finder and grant-ready proposal *(coming soon)* |

**I'm building my AI skills** (every employee). One living document:

| Step | Page | What it does |
| --- | --- | --- |
| 1 | Your AI learning plan | Role-based sessions of about 20 minutes, mapped to the US DOL framework or Canada's Understand, Use, Build progression, with progress, calendar reminders, a 90-day check-in and a completion record |
| 2 | Practice sandbox | Safe, browser-only practice: clear prompts, red lines, spotting errors |

No logins: progress is saved in the browser only.

---

## Project structure

```
server.js                  Express server: pages and read-only content
public/                    One page per step (vanilla HTML/CSS/JS)
public/js/                 Template engine, plan builder, progress, sandbox and report logic
public/modules.json        The steps and their order in each path
content/templates/         The documents, as editable markdown
content/frameworks/        Canada and US: literacy frameworks and laws to check
content/learning-plans/    Role matrix and the learning activities
content/sandbox/           Practice scenarios (all made up)
test/                      Automated tests (npm test)
prompts/, grants/, evals/  Reserved for later phases
render.yaml                Render deployment settings
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
3. Optional: add a custom domain (for example `tools.danacannamdesign.com`) under **Settings → Custom Domains**.

The free instance is fine for testing. Switch to an always-on instance before sharing it publicly.

---

## Status

Done:
- Leader path: all five documents
- Employee path: learning plan (with progress, reminders, 90-day check-in and completion record) and the browser-only practice sandbox
- Canada and US versions

Next:
- Fund it: grant finder (B.C. and Canada first)
- Optional anonymous team results, if a pilot needs them
- Map Canada's national course session by session once its modules are published

---

## Editing content without code

- **Document wording:** `content/templates/*.md`
- **Learning activities:** `content/learning-plans/activities.json`
- **Practice scenarios:** `content/sandbox/scenarios.json`
- **Laws to check (dated):** `law_check` in `content/frameworks/ca.json` and `us.json`

Run `npm test` after editing to catch mistakes.

---

## License

MIT. Use it, adapt it, and share what you learn.
