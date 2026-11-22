# Building our AI baseline together: a conversation guide

*{{org_name}} · Prepared for {{hr_lead}} · {{today}}*

## Why we're having this conversation

Before we train anyone, we want an honest picture of how AI is already used at {{org_name}}. That picture shapes training that fits, and it's what we'll measure progress against at 90 days.

Surveys alone miss a lot: people under-report tools they aren't sure are allowed. Usage data alone can feel like surveillance. So we'll combine the two, and agree on how before anything is collected.

## Who's at the table

- **{{hr_lead}}** leads the conversation and owns the promises made to employees.
- **{{it_contact}}** knows what usage data exists, and what it can and can't show.
- **{{employee_reps}}** make sure what we measure is fair and that employees' concerns are heard.
{{#if union}}
- **{{union_name}}** is involved in deciding what is measured and how it is used.
{{/if}}
{{#if extra_people}}
- **{{extra_people}}**
{{/if}}

## Ground rules to agree in writing first

1. **Amnesty.** Nobody will be disciplined for anything this baseline reveals, including use of tools we haven't approved. We need the truth more than we need enforcement right now.
2. **Grouped data only.** Results are reported by team and tool, never by person, and never for a group smaller than 5.
3. **The least data that does the job.** If we don't need it to plan training, we don't collect it.
4. **Employees hear first.** Everyone is told what will be collected, why and who sees it before collection starts.
5. **Results go back to everyone.** Employees see what we found and what we changed because of it.

## Suggested opening

> Thanks for making time for this. We're about to start an AI literacy program, and before we train anyone, we want an honest picture of where people are today. I want to be clear about what this is and what it isn't. It isn't monitoring, it isn't a performance review, and nobody will get in trouble for what we learn. Our goal is a map, not a disciplinary file. I'd like us to agree together on what we look at, how we protect people, and how we share the results back.

## Questions for IT

{{#if src_usage}}
- Which AI tools can we see in use today, approved or not? Where policy allows, this might come from sign-in logs, network or browser analytics.
- Can those numbers be reported by team and by tool, without individual names?
{{/if}}
{{#if src_licenses}}
- Which AI licenses are we paying for, and how many are actively used?
{{/if}}
{{#if approved_tools}}
- How do we currently see usage of {{approved_tools}}?
{{/if}}
{{#if src_expenses}}
- Where policy allows, do expense reports show AI subscriptions people are paying for themselves?
{{/if}}
{{#if src_incidents}}
- Have there been any incidents of sensitive data entered into AI tools? Counts and types only, no names.
{{/if}}
- How long would this data be kept, and who could see it?

## Questions for employee representatives

- What are people most worried about when it comes to AI at work?
- What would make people comfortable sharing how they really use AI?
- Is there anything we should definitely not measure?
- How should results be shared back so they feel trustworthy?

## What we will and won't gather

| We will gather | We won't gather |
| --- | --- |
{{#if src_usage}}
| Tool usage, grouped by team and tool | Individual browsing or activity histories |
{{/if}}
{{#if src_licenses}}
| License counts and how many are active | Who is or isn't using their license |
{{/if}}
{{#if src_expenses}}
| Totals spent on AI subscriptions, where policy allows | Individual expense claims |
{{/if}}
{{#if src_incidents}}
| Counts and types of data incidents | Names of the people involved |
{{/if}}
{{#if src_survey}}
| Anonymous self-reported confidence and needs | Names linked to answers |
{{/if}}
| What we need to plan training | The content of anyone's prompts or chats |

## Telling employees before we start

Send the purpose and promises statement, then a short note like this{{#if notice_date}} by {{notice_date}}{{/if}}:

> Next week we'll start building a picture of how AI is used across {{org_name}}, so we can plan training that actually helps. Here's exactly what we'll look at: only team-level totals, never individual activity or the content of anything you've written. Nobody will be disciplined for anything we learn, including use of tools we haven't approved. You'll see the results{{#if results_date}} by {{results_date}}{{/if}}. Questions? Contact {{hr_lead}}.

## Sharing results back

{{#if results_date}}By {{results_date}}, share{{/if}}{{#if no_results_date}}Share{{/if}} a team-level summary with everyone: what we found, what surprised us, and what we're changing because of it. We'll run the same baseline again at 90 days so everyone can see the progress.

## Agreed next steps

- [ ] Ground rules and amnesty agreed and signed
- [ ] IT confirms data can be grouped by team, with no group smaller than 5
- [ ] Employees notified before collection starts
- [ ] Baseline collected
- [ ] Results shared back with everyone
- [ ] Same baseline scheduled again at 90 days
