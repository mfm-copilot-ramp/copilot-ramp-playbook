---
title: "Legal & Compliance: Policy guidance and process navigation"
description: Build a Copilot Studio agent that answers compliance and legal-process questions with strict scope controls and a clear escalation path to a qualified human.
stage: studio
roles: [maker, it-admin, champion]
tags: [copilot-studio, legal, compliance, policies, data-handling, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# Legal & Compliance: Policy guidance and process navigation

> Give employees instant answers on compliance policies and legal processes — with strict scope controls and an unambiguous escalation path for anything that needs a qualified human.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Legal & Compliance Guidance Agent](../solutions/legal-compliance-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

## When to use this

Legal and compliance teams field a high volume of routine process questions that don't require a lawyer: How do we handle a subject access request? What's the process for getting an NDA signed? Can we share this data with a third party? Do I need to declare this?

These are answerable from policy documents — but they consistently land on the legal or compliance team's plate because employees don't know where to find the answer, or they want reassurance that they've understood the policy correctly.

A guidance agent handles the process and policy layer. It does not give legal advice. That distinction is not just a disclaimer — it needs to be structurally enforced in the agent's design: anything requiring judgment, interpretation, or a legal opinion routes unconditionally to a human.

**Why this is Stage 6:** the escalation logic needs to be airtight, not probabilistic. A topic-based "this is out of scope — here is exactly who to contact" path is more reliable than relying on the knowledge layer to know when to stop. Studio lets you own that logic explicitly.

## What you'll need

- **Copilot Studio access**
- Approved compliance and legal process docs in SharePoint (data handling policy, NDA process, GDPR/privacy notices, conflict of interest policy, acceptable use policy)
- **Sign-off from Legal** before publishing — this is the one agent where the team who owns the content should review and approve the agent before it goes live
- A named escalation contact or intake channel for the legal team

## Try it now — the prompt

Run this prompt in Copilot Chat to draft the persona, topics, and escalation flow — it works because it defines what counts as "legal advice" up front, so the refusal boundary is structural rather than improvised.

Before touching Studio, work through these with Legal or Compliance:

1. **What are the 10 process questions the team answers repeatedly?** These are the ones worth grounding the agent on — they have clear, policy-based answers.
2. **What constitutes "legal advice" for your context?** Define this explicitly. The agent must refuse unconditionally for anything in this category — interpretation, opinion, individual rulings, contract review.
3. **What is the intake path?** Where should the agent point people for real legal questions? A managed inbox, a intake form, a named contact — it needs to be something the legal team actually monitors.

```
Design a Copilot Studio compliance guidance agent for [Company].
Knowledge sources: [GDPR / data handling policy / NDA process /
conflict of interest policy / acceptable use policy — on SharePoint].
Scope: guide employees through compliance processes and answer
policy questions from approved documentation.
Out of scope: legal advice, contract interpretation, individual rulings.
Escalate out-of-scope queries to [intake channel / contact].

Give me: persona instructions, 3 topics to configure, and the
escalation flow for any question that needs a qualified human.
```

## Step by step

1. **Create the agent with a carefully scoped persona.** The instructions must make the distinction explicit:

    > *You are the Compliance Guide for [Company]. You help employees understand compliance policies and navigate legal processes using only approved documentation. You do not give legal advice, interpret contracts, or make individual rulings. For anything requiring legal judgment, respond: "This question needs a qualified human — please submit to [Legal intake channel / contact]." Always cite the policy document and section.*

2. **Add your knowledge sources.** Ground the agent on current versions of your key policies. Work with Legal to confirm which documents are approved for the agent to cite — do not include draft policies, legal opinions, or documents marked confidential.

3. **Build the escalation topic first.** More trigger phrases than any other agent type, because the failure mode matters more:
    - "legal advice" / "am I liable"
    - "can we get away with" / "what's the risk if we"
    - "contract" / "review this agreement"
    - "is this legal" / "is this allowed"
    - "loophole" / "exception to the policy"
    - Employee names or specific individual situations

    Response: clear redirect, no hedging: "That's a question I can't answer — it needs a legal review. Please submit to [intake channel]. If it's urgent, contact [named contact]."

4. **Build the NDA process topic.** One of the most commonly asked structured processes. Walk through: when an NDA is needed, how to request one (submit a request to [intake], include counterparty name and purpose), typical SLA, who signs on behalf of the company. End with the link to the request form.

5. **Build the data sharing / third-party topic.** "Can we share [data type] with [type of party]?" is a high-frequency query with a clear policy answer in most orgs. The topic should walk through the data classification check, the transfer mechanism requirements, and when Legal sign-off is required.

6. **Get Legal review before publishing.** Send the agent a set of test questions and share the responses with the legal team for review. This is non-negotiable for this domain. Their sign-off is your protection if an employee later claims the agent gave them wrong guidance.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Version-stamp the knowledge sources.** When policies are updated, the SharePoint docs should have a "last updated" date visible. Employees who see an answer can check when the policy was last reviewed — it builds trust.
- **Pair with a simple intake form.** The escalation redirect is much more effective if it points to a structured intake form (what's the question, what's the deadline, who's involved) rather than a free-text email. Compliance teams process structured requests faster.
- **Annual policy review reminder.** Set a calendar reminder to re-test the top 10 queries when annual policy reviews happen. Legal policy changes more slowly than IT config — but when it changes, the agent must reflect it.

## Watch out for

- **The agent hedging instead of escalating.** A knowledge-grounded response that starts "While I can't give legal advice, based on the policy..." is worse than a clean escalation. Test adversarial inputs like "just tell me what you think" and make sure the escalation topic fires hard.
- **Employees treating the agent as authoritative.** Make the scope clear in the intro message and in every out-of-scope response. Add a footer disclaimer to the agent's description: "This agent provides process guidance from approved documents. It does not constitute legal advice."
- **Documents that shouldn't be in the knowledge source.** Legal departments often have sensitive internal documents on the same SharePoint site as policy docs. Audit what's being indexed before launch — the agent will surface anything in the knowledge source.

## Where this leads (the ramp)

Studio lets you own the escalation logic explicitly — essential for a domain where hedging is a failure. When the agent faces the public or higher stakes, you'll want to attack that refusal boundary systematically, and Azure AI Foundry's red-team evaluation is built to do exactly that.

> **Next:** [Foundry: red-team and evaluate](foundry-red-team-eval.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Legal & Compliance Guidance Agent solution template](../solutions/legal-compliance-agent.md) gives you a copy-paste system prompt with strict escalation rules, the full topic set, all 8 test cases including adversarial inputs, and the Legal sign-off checklist.
