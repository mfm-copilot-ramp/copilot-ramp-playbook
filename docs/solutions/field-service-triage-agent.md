---
title: "Solution Template: Field Service Triage Agent"
description: A Copilot Studio solution template for a field service triage agent that turns a symptom or fault code into the likely cause and the right dispatch path.
tags: [copilot-studio, field-service, triage, dispatch, troubleshooting, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-06-05
---

# Solution Template: Field Service Triage Agent

> **What this builds.** A Copilot Studio agent that takes a reported symptom or fault code, returns the **most likely cause** from your equipment knowledge base, and recommends the right **dispatch path** — self-serve fix, remote resolution, or a truck roll with the right parts — so the easy ones never become a costly site visit.

> **🛠️ Build it step by step →** [Field Service: symptoms to dispatch path](../walkthroughs/studio-functional-field-service-triage.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Capture symptoms / fault code → match to likely cause → recommend dispatch path (self-fix · remote · dispatch + parts)

---

## What the agent does

| Capability | Detail |
|---|---|
| Symptom intake | Collects the equipment model, fault code, and what the customer is seeing |
| Cause matching | Returns the most likely cause(s) from manuals and the fault-code database |
| Triage decision | Recommends self-fix, remote resolution, or on-site dispatch |
| Parts hint | When dispatch is needed, suggests the likely parts so the truck rolls once |
| SLA awareness | Flags the response window based on the asset's service tier |
| Work-order handoff | Creates or pre-fills a work order with the triage notes attached |

---

## System prompt — copy and adapt

```
You are the Field Service Triage agent for [Company Name].

Your job is to triage equipment problems: take the reported symptom or fault
code, identify the most likely cause from our approved service knowledge, and
recommend the right dispatch path. You help avoid unnecessary truck rolls and
make sure the ones that happen are first-time fixes.

When a problem is reported:
1. Confirm the equipment model and capture the fault code or symptom.
2. Return the most likely cause(s), citing the manual or fault-code reference.
3. Recommend ONE dispatch path:
   - SELF-FIX: a safe step the customer/tech can do now (with the steps).
   - REMOTE: resolvable by remote support (say what to try).
   - DISPATCH: needs an on-site visit (list the likely parts and skill needed).
4. State the SLA/response window for this asset's service tier.

Rules:
- Safety first. For any hazard (electrical, gas, pressure, height), do NOT
  recommend self-fix — escalate to a qualified technician immediately.
- Never guess at a cause that isn't supported by the knowledge base. If the
  symptom doesn't match anything, route to a human dispatcher.
- Be precise: technicians act on what you say. Cite the reference.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Equipment manuals | Service procedures, diagrams, safe-handling notes by model | Marketing/sales material, superseded models you no longer support |
| Fault-code database | Code → cause → recommended action mappings | Internal engineering codes not used in the field |
| Troubleshooting decision trees | Validated symptom-to-cause flows | Tribal-knowledge notes that aren't reviewed |
| Dispatch & SLA policy | Service-tier response windows, dispatch rules, skill matrix | Customer contract specifics that change per account |
| Parts catalog | Part numbers, compatibility by model | Discontinued parts with no replacement |

!!! warning "Safety is the hard boundary"
    Field work carries real physical risk. Make the safety rule explicit in the prompt and test it hard: any hazard class must route to a qualified technician, never a self-fix. Keep your manuals current — an outdated procedure is worse than no procedure.

---

## Topics to configure

### Topic 1 — Symptom & equipment intake

**Trigger phrases:** "not working", "fault code", "error", "won't start", "showing"

**Flow:**
- Capture the equipment model (ask if unknown)
- Capture the fault code or a plain-language symptom description
- Note any safety-relevant context (smell, smoke, sparks, leak) and branch to safety escalation if present

---

### Topic 2 — Cause matching

**Behaviour:** Look up the fault code or symptom against the manuals and fault-code database. Return the most likely cause(s) ranked, each with its reference. If nothing matches with confidence, hand to a human dispatcher rather than guess.

---

### Topic 3 — Dispatch decision

The core value. Returns exactly one recommended path:

| Path | When | Output |
|---|---|---|
| Self-fix | Safe, simple, well-documented step | The steps + a "call us if this doesn't resolve it" line |
| Remote | Resolvable by remote support | What remote should try, with the reference |
| Dispatch | On-site required or any safety class | Likely parts, skill needed, SLA window |

---

### Topic 4 — Work-order handoff

**Behaviour:** When dispatch or remote is chosen, create or pre-fill a work order with the model, fault code, suspected cause, recommended parts, and triage notes, so the assigned tech starts informed.

---

## Power Automate action spec

**Inputs from agent:** `model`, `fault_code`, `symptom`, `suspected_cause`, `dispatch_path`, `likely_parts` (list), `service_tier`, `reporter_contact`.

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. Create a work order in [Field Service / Dynamics 365 / ServiceNow / your FSM tool]
3. Attach the triage notes and set priority from the SLA tier
4. Reserve or flag the likely parts if your inventory system supports it
5. Notify the dispatch queue / on-call dispatcher
6. Return the work-order number to the agent

**Error handling:** If work-order creation fails, the agent returns the full triage summary and says: "I couldn't open the work order automatically — log it manually with these details: [summary]. Dispatch queue: [link]."

---

## Starter prompts

- "Model X-200 showing fault code E14, customer says it won't heat"
- "Unit is making a grinding noise on startup, model Y-50"
- "Error code on the controller and there's a burning smell" *(tests safety branch)*
- "Customer's panel won't power on, no error code"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Known fault code, simple cause | Self-fix steps with manual reference | |
| 2 | Symptom resolvable remotely | Remote path with what to try | |
| 3 | Hardware failure symptom | Dispatch path with likely parts + SLA | |
| 4 | Any hazard mentioned (smoke/gas/electrical) | Safety escalation, no self-fix | |
| 5 | Symptom matches nothing | Routes to human dispatcher, no guess | |
| 6 | Model not provided | Intake asks for the model first | |
| 7 | Dispatch chosen, PA enabled | Work order created with triage notes | |
| 8 | PA connector down | Triage summary returned with manual fallback | |

---

## Deployment checklist

- [ ] Equipment manuals and fault-code database current and connected
- [ ] Safety rule tested across every hazard class — all route to a qualified tech
- [ ] Dispatch/SLA policy reflects your actual service tiers
- [ ] Parts catalog mapped to models so parts hints are accurate
- [ ] Power Automate work-order flow tested including the error path
- [ ] All 8 test cases pass
- [ ] Piloted with a small dispatch team before broad rollout
- [ ] First-time-fix and truck-roll metrics baselined for a 30-day review

---

## What to build next

- **Image input** — let techs send a photo of the unit/error so the agent can match visually documented faults
- **Inventory check** — confirm the likely parts are in the local depot before recommending dispatch
- **Outcome feedback** — capture whether the triage was right so the cause-matching improves over time

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [Field Service Triage walkthrough](../walkthroughs/studio-functional-field-service-triage.md) covers the safety design, how to structure cause-matching, and what to watch for before you let it touch dispatch.
