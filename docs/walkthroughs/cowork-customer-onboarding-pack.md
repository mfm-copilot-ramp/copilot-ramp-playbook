---
title: Build a customer onboarding pack
description: Hand Cowork a signed deal and product docs to create a customer onboarding pack with welcome notes, timeline, roles, and milestones.
stage: cowork
roles: [end-user, manager, champion]
tags: [cowork, customer-success, onboarding, handoff]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Build a customer onboarding pack

> Convert the signed deal, product material, and delivery notes into a customer onboarding pack that helps everyone start aligned.

**Stage:** Cowork · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 20 min

## When to use this
The deal is signed, but the hand-off from sales to delivery or customer success is still scattered across an opportunity record, contract notes, product docs, and meeting summaries. Cowork can assemble the practical onboarding pack: welcome message, timeline, roles, first-value milestones, risks, and open questions.

Use this when you need a structured starting point for a kickoff, not a generic welcome deck.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Signed deal summary, scope, success criteria, product documentation, and any discovery notes
- Permission to use the customer and deal material you attach

## Try it now — the prompt
Give Cowork the deal context and ask for the complete pack:

```
Using the attached [signed deal summary], [scope notes], [discovery notes], and
[product documentation], build a customer onboarding pack for [customer name].

Create:
1. A customer-facing welcome note
2. A kickoff agenda
3. A timeline from kickoff to first value
4. A roles and responsibilities table for customer, partner, and our team
5. First-value milestones with success criteria
6. Known risks, assumptions, and open questions

Keep the tone clear, professional, and reassuring. Separate customer-facing
content from internal notes I should review before sharing.
```

**Why this works:** it asks Cowork to reconcile commercial, product, and delivery inputs into one package. Separating customer-facing content from internal notes keeps the result useful without accidentally exposing working assumptions.

## Step by step
1. **Collect the hand-off material.** Include the signed scope, discovery summary, implementation notes, stakeholder list, and product docs that define what will be delivered.
2. **Send the Cowork hand-off.** Paste the prompt, attach the sources, and name the customer and product or service.
3. **Review the first-value path.** Check that the milestones build towards a meaningful customer outcome, not just internal tasks.
4. **Check the roles table.** Make sure accountability is clear and no customer role is invented. Replace uncertain names with roles until confirmed.
5. **Separate shareable and internal content.** Move risks, assumptions, and unresolved questions into the right section before sending anything externally.
6. **Ask Cowork for the kickoff-ready version:**
   ```
   Turn the customer-facing sections into a kickoff pack I can share. Keep
   internal risks and assumptions in a separate prep note for our account team.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add a readiness checklist.** "Create a pre-kickoff checklist for access, stakeholders, data, environments, and decisions."
- **Draft stakeholder messages.** "Write separate emails for the executive sponsor, day-to-day owner, and technical lead."
- **Turn milestones into a tracker.** "Convert the first-value milestones into a table with owner, due date, dependency, and status."
- **Localise the tone.** "Rewrite the welcome note for [formal enterprise / startup / public sector] tone."

## Watch out for
- **Contracts and commitments are sensitive.** Verify scope, dates, and promised outcomes against the signed agreement before sharing.
- **Product docs can be too generic.** Ask Cowork to map features to this customer's stated goals, not to list every capability.
- **Roles may be incomplete.** Treat any stakeholder mapping as a draft until the account team confirms it.
- **First value needs the customer's definition.** If success criteria were not captured, add a question rather than inventing them.

## Where this leads (the ramp)
If every new customer needs the same onboarding pack, the next step is an always-on process that prepares the pack when a deal closes and keeps the team moving. That points to **Stage 5 · Autopilots**.

> **Next:** [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

## Related
- [Cowork → Create a proposal from discovery notes](cowork-proposal-from-discovery.md) — the pre-signature companion
- [Cowork → Hand off an end-to-end task to Cowork](cowork-end-to-end-task.md)
- [Stage 3 · Cowork](../stages/stage-3-cowork.md)
