# Building our AI baseline together

*Conversation guide · {{org_name}} · {{today}}*

## Goal

Agree on an honest picture of how AI is used at {{org_name}} today, before anyone is trained. Surveys alone miss things, and usage data alone can feel like surveillance, so we'll use both, carefully.

## Who's at the table

- **{{hr_lead}}:** leads, and owns the promises to employees
- **{{it_contact}}:** knows what data exists and what it can show
- **{{employee_reps}}:** keep it fair, and bring employees' concerns
{{#if union}}
- **{{union_name}}:** helps decide what's measured and how it's used
{{/if}}
{{#if extra_people}}
- **{{extra_people}}**
{{/if}}

## Agree these first, in writing

1. **Amnesty:** no one is disciplined for what we learn.
2. **Grouped data only:** by team and tool, never by person, and no group under 5.
3. **Least data needed:** if we don't need it to plan training, we don't collect it.
4. **Employees hear first,** before anything is collected.
5. **Results go back to everyone.**

## Opening line

> Before we train anyone, we want an honest picture of where people are. This isn't monitoring or a performance review, and nobody gets in trouble for what we learn. Let's agree together on what we look at and how we protect people.

## Questions for IT

{{#if src_usage}}
- Which AI tools are in use, approved or not? Can we report it by team and tool, without names?
{{/if}}
{{#if src_licenses}}
- Which AI licenses do we pay for, and how many are used?
{{/if}}
{{#if approved_tools}}
- How do we see usage of {{approved_tools}} today?
{{/if}}
{{#if src_expenses}}
- Where policy allows, do expense reports show AI subscriptions people pay for themselves?
{{/if}}
{{#if src_incidents}}
- Any incidents of sensitive data entered into AI tools? Counts and types only.
{{/if}}
- How long is this data kept, and who can see it?

## Questions for employee representatives

- What worries people most about AI at work?
- What would make people comfortable being honest?
- What should we not measure?

## What we will and won't gather

| We will gather | We won't gather |
| --- | --- |
{{#if src_usage}}
| Tool usage, grouped by team and tool | Individual activity |
{{/if}}
{{#if src_licenses}}
| License counts and active use | Who is or isn't using a license |
{{/if}}
{{#if src_expenses}}
| Total AI subscription spending | Individual expense claims |
{{/if}}
{{#if src_incidents}}
| Counts of data incidents | Names of people involved |
{{/if}}
{{#if src_survey}}
| Anonymous confidence ratings | Names linked to answers |
{{/if}}
| Only what we need to plan training | Anyone's prompts or chats |

## Note to employees

Send with the purpose and promises statement{{#if notice_date}}, by {{notice_date}}{{/if}}:

> We're building a picture of how AI is used across {{org_name}} so we can plan useful training. We'll only look at team totals, never individual activity or anything you've written. No one will be disciplined for what we learn. You'll see the results{{#if results_date}} by {{results_date}}{{/if}}. Questions? Ask {{hr_lead}}.

## Share results back

{{#if results_date}}By {{results_date}}, share{{/if}}{{#if no_results_date}}Share{{/if}} a team-level summary: what we found and what we'll change. Repeat the baseline at 90 days.

## Next steps

- [ ] Ground rules signed
- [ ] IT confirms team-level reporting, no group under 5
- [ ] Employees notified
- [ ] Baseline collected
- [ ] Results shared
- [ ] 90-day repeat scheduled
