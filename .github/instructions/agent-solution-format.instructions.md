---
applyTo: "docs/javascripts/estimator-package.js,docs/javascripts/estimator-zip.js,docs/credit-estimator.md"
---

# Copilot Studio agent solution package format (grounding for the estimator's downloadable-package feature)

When generating, editing, or reasoning about the credit-estimator's "describe an agent → downloadable solution
.zip for import" feature, follow the **verified package format** documented in
[`docs/agent-solution-format.md`](../../docs/agent-solution-format.md). It is derived from real
`pac solution export` outputs of live Copilot Studio agents (classic + new experience, including Work IQ) that
import successfully.

Key rules the generator must honor (see the doc for full detail + exact shapes):

- **Two experiences, both generative orchestration.** Classic = `gPTSettings` + `GenerativeAIRecognizer`,
  instructions in a `gpt.default` component, system `.topic.*` present, connector tools = `.action.`
  (`kind: TaskDialog`). New = `CLICopilotRecognizer` + inline `agentSettings` (model + instructions + web) in
  `configuration.json`, NO authored topics, tools = `.tool.` (`kind: ConnectorTool`), plus `.skill.`
  (`InlineAgentSkill`) and connected agents (`ConnectedAgentTool`).
- **Replace the legacy config wrapper.** Do not emit `{ "BotConfiguration": { "GPTSettings": … } }` (PascalCase
  wrapper) — real exports use the `$kind` shapes in the doc.
- **Connection references are mandatory and paired** — every connector/MCP/tool component needs a row in
  `Assets/botcomponent_connectionreferenceset.xml` AND a `<connectionreference>` in `customizations.xml`.
- **Work IQ ≠ connectors.** It serializes as two MCP components (`mcp_m365copilot`, `mcp_MeServer`) + two
  connection references; price it separately (MCP/agent invocation).
- **Never fabricate operationIds/connectorIds.** Surface unknowns as NEXT-STEP notes.
- **Fresh-solution packaging semantics** and **one-solution** rule (see doc §10).

Do NOT change the estimator engine (`estimator-core.js`), credit rates, or calculation logic when only the
package format is in scope.
