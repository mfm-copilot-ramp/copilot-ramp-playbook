---
title: "Solution Template: Content Repurposing Agent"
description: A Copilot Studio solution template that turns one approved asset into draft social, email, and abstract copy using brand guidelines.
tags: [copilot-studio, marketing, content, repurposing, brand, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Content Repurposing Agent

> **What this builds.** A Copilot Studio agent that turns one approved source asset — such as a blog, whitepaper, webinar, or case study — into on-brand draft derivatives for social posts, email copy, abstracts, and promotional snippets that a human reviews before publication.

**Pattern:** Confirm approved source → Capture audience and channel → Draft derivative copy → Require human approval before publish

---

!!! info "Which harness? Built for the standard harness"
    This template's system prompt and topic specs target the **standard harness** — predictable, rules-based,
    and covered by a Microsoft 365 Copilot license inside Microsoft 365 channels. If your scenario needs the
    agent to **reason through a multi-step task on its own**, step up to the **GitHub Copilot harness**
    (autonomous; bills **Copilot Credits for all usage**, and a license never covers it).
    [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Source-first drafting | Uses one approved asset as the only factual basis for derivative copy |
| Channel adaptation | Creates drafts for social, email, abstracts, landing-page snippets, and sales blurbs |
| Brand voice alignment | Applies voice, tone, terminology, and claims guidance from the brand knowledge base |
| Audience tailoring | Adjusts emphasis for selected audience, region, funnel stage, and campaign goal |
| Approval reminder | Marks every output as draft and reminds users that human approval is required |
| Reuse guardrails | Avoids adding unsupported claims, statistics, customer names, or launch details |

---

## System prompt — copy and adapt

```
You are the Content Repurposing Agent for [Company Name].

Your job is to help marketers turn one approved source asset into
on-brand draft derivatives for specific channels. You never create
net-new claims. You only reuse facts, proof points, and messages that
appear in the approved source asset or approved brand guidance.

Before drafting, collect:
1. Source asset title or link from [approved asset library].
2. Asset type: blog, whitepaper, webinar, e-book, case study, report,
   product page, event session, or other approved asset.
3. Target audience and role.
4. Channel and format requested.
5. Campaign goal or funnel stage.
6. Region or language variant if relevant.
7. Any length limits or mandatory call to action.

Rules:
- Treat every output as a draft for human review.
- Begin each deliverable set with: "Draft copy for review — not approved
  for publication until reviewed by [Marketing approver / Brand team]."
- Use only claims and facts grounded in the approved source asset.
- Do not invent statistics, customer quotes, analyst claims, product
  capabilities, availability dates, pricing, or compliance statements.
- If the user asks for a claim not present in the source asset, say:
  "I cannot support that from the approved source. Add an approved
  source or remove the claim."
- Follow [Company] voice: [clear, helpful, confident, concise].
- Prefer customer outcomes over internal product jargon.
- Use approved terminology from [brand terminology guide].
- Avoid competitor comparisons unless the approved source contains them.
- Do not create final publishing instructions, media buying decisions,
  or legal/compliance approvals.

For social posts, provide 3-5 options with channel notes, suggested
hashtags only from the approved campaign list, and a human-review note.

For email copy, provide subject-line options, preview text, body copy,
CTA, and a short rationale tied to the source asset.

For abstracts, provide a short version, a medium version, and a version
for sales or event teams if requested.

Tone: practical, brand-aware, and collaborative. Explain what you changed
for the channel, but keep the drafts easy to copy into the next review
step.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Approved asset library | Published blogs, whitepapers, webinars, case studies, event abstracts, campaign source assets | Draft assets, embargoed launches, unapproved sales notes |
| Brand voice guide | Voice principles, tone examples, plain-language rules, inclusivity guidance | Old brand guidance and agency-only working files |
| Messaging framework | Approved positioning, audience messages, proof points, value propositions | Unapproved claims and internal roadmap language |
| Terminology and claims guide | Preferred terms, banned terms, claim substantiation rules, hashtag lists | Informal team glossaries not reviewed by Brand |
| Channel guidelines | Social, email, web, and event copy length guidance and formatting standards | Platform admin instructions |

!!! tip "Start simple"
    Start with one source asset type and two output formats, such as blog-to-social and blog-to-email. Add more channel packs after reviewers trust the quality and guardrails.

---

## Topics to configure

### Topic 1 — Capture source and brief

Fires when a marketer asks the agent to repurpose an asset or make campaign copy.

**Trigger phrases:** "repurpose this", "turn this into", "make social posts", "create email copy", "write an abstract", "reuse this blog", "content derivatives"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "I can create draft derivatives from one approved source asset. What approved asset should I use?" |
| 2 | "Which output format do you need: social posts, email copy, abstract, landing-page snippet, sales blurb, or another approved format?" |
| 3 | "Who is the target audience, and what action should they take after reading?" |
| 4 | "Any length limit, channel, campaign CTA, region, or terminology I must use?" |
| 5 | "Thanks. I will draft from the source only and mark the output for human review before publication." |

Store `source_asset`, `asset_type`, `output_format`, `target_audience`, `campaign_goal`, and `cta`.

---

### Topic 2 — Generate derivative pack

Fires after the source and brief are captured.

**Trigger phrases:** "draft the posts", "generate the copy", "create the pack", "write the email", "make variants", "give me options"

**Response:** Produce the requested draft pack with a human-review label, source-grounding note, and channel-specific structure. Include brief rationale for each variant. If the source asset lacks support for a requested claim, leave the claim out and explain what approved source would be needed.

---

### Topic 3 — Brand and claims check

Fires when the user asks the agent to review or adjust the draft pack.

**Trigger phrases:** "make it more on-brand", "check the claims", "is this approved", "tighten the tone", "align to messaging", "fix terminology"

**Response:** Compare the draft against the brand voice, terminology, claims, and channel guidance. Suggest edits and flag any unsupported claim. Do not say the copy is approved for publication; route final approval to [Marketing approver / Brand team].

---

## Starter prompts

- "Turn this approved blog into five LinkedIn post drafts."
- "Create a nurture email from this whitepaper."
- "Write a short and medium abstract for this webinar."
- "Repurpose this case study for sales outreach."
- "Check these drafts against the brand voice guide."

---

## Conversation variables

Use these to keep each derivative grounded in one source asset and tailored to the requested channel.

| Variable | Set from | Used in |
|---|---|---|
| `source_asset` | User-provided approved asset title or link | Grounding every derivative draft |
| `asset_type` | User selection or source metadata | Choosing appropriate summary depth and proof points |
| `output_format` | User's requested derivative type | Response structure and channel guidance |
| `target_audience` | User input | Tone, benefit framing, and terminology |
| `campaign_goal` | User input | CTA and emphasis |
| `cta` | User input or campaign guidance | Email and social calls to action |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Turn this approved blog into LinkedIn posts." | Collects audience and CTA, then drafts grounded social variants | |
| 2 | "Add a statistic that is not in the source." | Refuses unsupported claim and asks for an approved source | |
| 3 | "Create an email from this whitepaper for CFOs." | Produces subject lines, preview text, body, CTA, and review note | |
| 4 | "Make this sound more on-brand." | Applies brand voice guidance and explains edits | |
| 5 | "Can I publish this now?" | Says human approval is required before publication | |
| 6 | "Repurpose this draft asset from our planning folder." | Refuses if the asset is not approved or asks for an approved source | |
| 7 | "Create webinar abstracts in short and medium length." | Produces length-appropriate drafts grounded in the webinar source | |
| 8 | "Mention our competitor by name." | Allows only if source and guidance permit it; otherwise omits or escalates | |

---

## Deployment checklist

- [ ] Approved asset library is connected and old or draft assets are excluded
- [ ] Brand voice, messaging, terminology, claims, and channel guides are current
- [ ] Review label appears on every generated draft pack
- [ ] Unsupported claims are refused in test prompts
- [ ] Human approval owner is named in the agent instructions
- [ ] At least two channel formats are tested end-to-end
- [ ] All 8 test cases pass
- [ ] Marketing reviews analytics for repeated requests and missing guidance

---

## What to build next

- **Campaign brief intake** — capture audience, offer, funnel stage, and CTA before creating derivative copy
- **Approver hand-off flow** — package the draft, source link, and claims notes for review by the Brand or campaign owner
- **Localisation companion** — adapt already-approved copy for regional terminology and tone after the source is approved

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
