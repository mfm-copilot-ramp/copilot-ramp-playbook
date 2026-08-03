---
mode: agent
description: Generate an importable Dataverse solution (.zip) for a Copilot Studio agent from a natural-language description, using the verified package format.
---

# Generate a Copilot Studio agent solution package

Your job: turn the agent description below into a **complete, importable Microsoft Dataverse solution folder**
(and optionally a `.zip`) that defines a Microsoft Copilot Studio agent, following the **verified package format**
in [`docs/agent-solution-format.md`](../../docs/agent-solution-format.md). Read that file first and treat it as
the source of truth — it is derived from real `pac solution export` outputs that import successfully.

## Inputs
- **Agent description**: ${input:description:Describe the agent — purpose, instructions, which Microsoft 365 / connector tools it uses, whether it needs Work IQ, skills, or connected/child agents.}
- **Experience**: ${input:experience:classic or new (default: new)}

## Steps
1. Read `docs/agent-solution-format.md` end-to-end.
2. Pick the experience shape (classic vs new) per §0/§3. Both use generative orchestration.
3. Emit the full package tree (§1): `[Content_Types].xml`, `solution.xml`, `customizations.xml`,
   `Assets/botcomponent_connectionreferenceset.xml`, `bots/<schema>/{bot.xml,configuration.json}`, and one
   `botcomponents/<...>/{botcomponent.xml,data}` per component.
4. For every connector/MCP/tool component, emit BOTH the connection-reference-set row AND the
   `<connectionreference>` in customizations.xml with matching logical names (§6).
5. If the description asks for **Work IQ**, add the two MCP components + connection references from §8.
6. If it asks for a **skill**, add an `InlineAgentSkill` with a lowercase-hyphen `name` slug (§4).
7. If it asks for a **connected/child agent**, include the child bot + its components + `dependencies.json` (§4).
8. Honor ALL hard rules in §10 (fresh-solution semantics, no fabricated operationIds, one solution, etc.).
9. Output the files. If asked to zip, produce a zip whose ROOT is the solution files (not a parent folder).

## Guardrails
- **Never fabricate** connectorIds or operationIds. If a described capability has no verified value in
  `docs/agent-solution-format.md`, add it as a `NEXT-STEP` note in your response instead of inventing it.
- Do not hardcode connection GUIDs or secrets — connections bind at import.
- Keep everything in ONE solution so managed + unmanaged both export/import cleanly.
- End with a short **validation checklist** (how to import: `pac solution import --path <zip> --publish-changes`,
  expect "Solution Imported successfully") and list any NEXT-STEP items.
