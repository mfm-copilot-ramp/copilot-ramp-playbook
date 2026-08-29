---
title: "Solution Template: Parts & Inventory Lookup Agent"
description: A Copilot Studio solution template for a parts lookup agent that checks availability, compatible replacements, and reservation steps for field technicians.
tags: [copilot-studio, field-service, parts, inventory, compatibility, actions, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Parts & Inventory Lookup Agent

> **What this builds.** A Copilot Studio agent that helps field technicians identify the right part, check whether it is available at a depot or on a van, and understand how to reserve or order it without leaving the job conversation.

**Pattern:** Capture equipment context → Identify compatible part → Check stock via connector action → Reserve or order after confirmation

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
| Part identification | Uses model, serial number, fault symptom, or old part number to narrow the right catalogue item |
| Compatibility check | Distinguishes exact replacements, approved alternates, and parts that must not be substituted |
| Stock lookup | Calls an inventory connector action to check depot, van, and central warehouse availability |
| Reservation guidance | Explains whether the part can be reserved, ordered, transferred, or needs buyer approval |
| Technician-ready output | Returns part number, description, fit notes, quantity, location, and next action |
| Safe handoff | Requires explicit confirmation before reserving stock or creating an order request |

---

## System prompt — copy and adapt

```
You are the Parts & Inventory Lookup agent for [Company Name]'s field service team.

Your job is to help field technicians find the correct part for the equipment in
front of them, verify availability, and explain the correct reservation or order
path. You are practical, precise, and careful with compatibility.

When a technician asks for a part:
1. Capture the equipment model, serial number or asset ID, site location, and the
   part description, part number, or fault symptom they are working from.
2. Look up the approved parts catalogue and compatibility rules before suggesting
   any part.
3. If there are multiple possible matches, ask one clarifying question at a time
   rather than listing every catalogue result.
4. Use the [Inventory Lookup connector action] to check stock for the requested
   depot, technician van, nearby depot, and central warehouse when available.
5. Return a concise parts answer: part number, description, compatibility note,
   available quantity, location, lead time if known, and recommended next step.

Reservation and ordering rules:
- Do not reserve, order, transfer, or allocate inventory until the technician has
  confirmed the part number, quantity, work order or job reference, and fulfilment
  location.
- For safety-critical, warranty-controlled, or regulated parts, only recommend
  exact or explicitly approved replacements. If approval is required, say who must
  approve it and stop before reservation.
- If the connector is unavailable or returns no result, do not guess stock levels.
  Give the manual lookup path and the details the technician should provide.
- Distinguish clearly between "in stock", "reserved", "available to order", and
  "not available". Never imply a part is secured until the action confirms it.
- If compatibility is unclear, escalate to [parts desk / technical support] with
  the model, serial number, symptom, and candidate part numbers.

Tone: concise and field-friendly. Technicians may be on site with a customer;
lead with the answer, then include only the details needed to act safely.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Approved parts catalogue | Part numbers, descriptions, supersession rules, compatible models, kit contents | Draft catalogue entries, discontinued parts with no approved replacement |
| Equipment model reference | Model families, serial ranges, asset variants, warranty notes | Engineering-only prototypes or unsupported model variants |
| Inventory connector data | Depot, van, and warehouse quantities, reservation status, lead times | Cost fields, supplier contracts, confidential procurement notes |
| Parts fulfilment policy | Reservation, transfer, back-order, buyer approval, and emergency-pick rules | Local workarounds that are not approved process |
| Safety and regulated parts list | Parts requiring exact replacement, certification, or supervisor approval | Informal notes that have not been reviewed |

!!! tip "Start simple"
    Start with one product family, one parts catalogue, and read-only stock lookup. Add reservation after technicians trust the compatibility answers and the inventory data is reliable.

---

## Topics to configure

### Topic 1 — Part identification and compatibility

Collects the minimum information needed to identify a safe, compatible part.

**Trigger phrases:** "need a part", "replacement part", "compatible with", "part number", "model", "serial number"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "What equipment model or asset ID are you working on?" | Model or asset |
| 2 | "What part, fault symptom, or old part number are you trying to replace?" | Part query |
| 3 | "Do you have the serial number or model variant? It helps confirm compatibility." | Serial or variant |
| 4 | "I found [part number]. It is [exact / approved alternate] for [model]. Do you want me to check stock?" | Confirmation |

---

### Topic 2 — Stock lookup

Checks availability through a connector action and reports stock without overpromising.

**Trigger phrases:** "is it in stock", "available nearby", "check inventory", "lead time", "where can I get"

**Response:** Use the inventory connector action with `part_number`, `quantity`, `preferred_location`, and `work_order_id` if known. Return the location, available quantity, reservation status, and lead time. If no stock is available, suggest the approved order or transfer path from the fulfilment policy.

---

### Topic 3 — Reserve or order handoff

Converts a confirmed parts lookup into a reservation or order request.

**Trigger phrases:** "reserve it", "order this", "transfer to my depot", "put it on the work order"

**Response:** Confirm the part number, quantity, fulfilment location, technician, and work order before calling any reservation action. After the action returns, give the reservation or order reference and the next pickup or delivery step. If the action fails, provide the manual request details to paste into the inventory system.

---

## Starter prompts

- "Do we have a replacement pump for model HX-200, serial starts A17?"
- "Part 41-778 is discontinued — what replaces it for the Vantage 4 unit?"
- "Check whether two filter kits are available at the north depot."
- "Reserve the approved alternator for work order WO-18422."
- "I have fault code F32 and need the likely sensor part."

---

## Conversation variables

Use these throughout the session so the technician does not have to repeat job details.

| Variable | Set from | Used in |
|---|---|---|
| `equipment_model` | Technician input or asset lookup | Compatibility filtering and catalogue lookup |
| `serial_number` | Technician input | Serial-range validation and warranty-controlled parts |
| `part_number` | Catalogue match or technician input | Stock lookup, reservation, and order request |
| `preferred_location` | Technician depot, van, or site | Inventory location search and transfer recommendation |
| `work_order_id` | Technician input or field-service context | Reservation reference and order audit trail |
| `quantity_needed` | Technician input | Stock check and reservation quantity |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Known part number and depot | Checks stock and returns quantity, location, and lead time | |
| 2 | Model plus symptom only | Asks for serial or variant, then suggests compatible part | |
| 3 | Discontinued part | Returns approved replacement or escalates if none exists | |
| 4 | Safety-critical part with alternate requested | Refuses unapproved substitute and routes for approval | |
| 5 | "Reserve two for WO-123" | Confirms part, quantity, work order, and location before action | |
| 6 | Inventory connector unavailable | Says stock cannot be verified and gives manual lookup path | |
| 7 | Part not compatible with model | Explains incompatibility and suggests next lookup step | |
| 8 | No confident catalogue match | Escalates to parts desk with collected details | |

---

## Deployment checklist

- [ ] Parts catalogue reviewed for current part numbers, supersessions, and compatibility rules
- [ ] Inventory connector action tested in read-only mode for depot, van, and warehouse locations
- [ ] Reservation action requires confirmation and logs work order, technician, quantity, and location
- [ ] Safety-critical and warranty-controlled parts list reviewed by service leadership
- [ ] Manual fallback path documented for connector errors and after-hours fulfilment
- [ ] All 8 test cases pass
- [ ] Piloted with a small technician group across at least one full stock cycle
- [ ] Parts desk feedback loop established for missing or ambiguous catalogue results

---

## What to build next

- **Work-order prefill** — pass confirmed parts directly into the work-order notes or task list
- **Van stock optimisation** — suggest common parts to replenish based on upcoming appointments
- **Returns workflow** — help technicians record unused or failed parts back into inventory

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)
