# GHCP Prompt — Copilot Studio Agent Solution Generator (verified base format)

> Paste everything below the line into GitHub Copilot as the grounding spec for the credit-estimator's
> "describe an agent → downloadable solution .zip for import" feature. It encodes the **verified** Dataverse
> solution-package format captured from real `pac solution export` runs of live Copilot Studio agents
> (classic + new experience, incl. Work IQ). Reference zips live in
> `WorkIQ-Agent-GroundTruth\deliverables\`; unpacked trees in `...\exports\*_extracted\`.

---

You are generating **importable Microsoft Dataverse solution packages (.zip)** that define a Microsoft Copilot
Studio agent, so a user can download and import the agent via `pac solution import` or the maker portal. Follow
this format EXACTLY — it is derived from real exports that import successfully. Do not invent fields, connectors,
or operationIds; unverified values break import.

## 0. Two target shapes (pick based on the described agent)

Both use **generative orchestration**. The axis is the **authoring experience**, which changes the file shapes:

- **CLASSIC experience** — nav = Topics/Knowledge/Actions/Settings. Instructions live in a separate
  `gpt.default` (Custom GPT) component. System topics present. Connector tools are `.action.` components.
- **NEW experience** — nav = Build/Preview/Evaluate/Monitor. Instructions live INLINE in the bot's
  `configuration.json`. NO authored `.topic.*` components. Tools are `.tool.` components; also supports
  `.skill.` (uploaded SKILL.md) and connected/child agents. Model is inline (e.g. Sonnet46).
- Agents authored in one experience CANNOT be converted to the other — generate natively for the chosen shape.

## 1. Package tree (unmanaged solution .zip root)

```
[Content_Types].xml            # OPC content types (see §7)
solution.xml                   # manifest: uniquename, publisher, version, Managed=0, RootComponents
customizations.xml             # Entities/…/connectionreferences (bots ride in folders, see §6)
Assets/
  botcomponent_connectionreferenceset.xml   # maps each connector/MCP component → a connection reference
  botcomponent_workflowset.xml               # ONLY if the agent has cloud flows (classic triggers)
bots/
  <botSchemaName>/
    bot.xml
    configuration.json         # THE experience-defining file (see §3)
botcomponents/
  <botSchemaName>.<kind>.<Name>/
    botcomponent.xml           # metadata (see §5)
    data                       # YAML/JSON payload (see §4) — the actual definition
    dependencies.json          # only for connected agents
Workflows/                     # ONLY if cloud flows exist
  <flow>.json
```

`<botSchemaName>` = `<publisherprefix>_<slug>_<random6>` e.g. `cr201_workiqmeetingprepnewexper_j8UecA`.

## 2. Component naming convention (folder = `<botSchemaName>.<segment>.<Name>_<rand3>`)

| Segment | Meaning | Experience |
|---|---|---|
| `.gpt.default` | Custom GPT (instructions holder) | CLASSIC |
| `.topic.<Name>` | authored/system topic | CLASSIC (system topics), + Work IQ (see §8) |
| `.action.<Connector>-<Op>` | connector action tool | CLASSIC |
| `.tool.<Op>_<rand3>` | connector tool | NEW |
| `.skill.<slug>_<rand3>` | uploaded skill (SKILL.md) | NEW |
| `.action.<childBotSchema>_<rand>` | connected/child agent | NEW |
| `.ExternalTriggerComponent.<...>` | external trigger (e.g. "when email arrives") | CLASSIC |

## 3. `bots/<schema>/configuration.json` — the experience switch

**CLASSIC (generative):**
```json
{ "$kind": "BotConfiguration",
  "settings": { "GenerativeActionsEnabled": true },
  "isAgentConnectable": true,
  "gPTSettings": { "$kind": "GPTSettings", "defaultSchemaName": "<schema>.gpt.default" },
  "aISettings": { "$kind": "AISettings", "useModelKnowledge": true, "isFileAnalysisEnabled": true,
                  "isSemanticSearchEnabled": true, "optInUseLatestModels": false },
  "recognizer": { "$kind": "GenerativeAIRecognizer" } }
```

**NEW:**
```json
{ "$kind": "BotConfiguration",
  "recognizer": { "$kind": "CLICopilotRecognizer" },
  "agentSettings": {
    "$kind": "AgentSettings",
    "model": { "$kind": "ModelConfig", "series": "Sonnet46" },
    "instructions": { "$kind": "Instructions",
      "segments": [ { "$kind": "StaticSegment", "value": "<full natural-language instructions>" } ] },
    "web": { "$kind": "WebSettings", "enableWebSearch": true } } }
```
> Note: the estimator's OLD generator emitted a PascalCase wrapper `{ "BotConfiguration": { "GPTSettings": … } }`.
> That is NOT what real maker exports use — replace it with the `$kind` shapes above.

## 4. `botcomponents/<...>/data` payloads (YAML) by kind

**CLASSIC connector action** (`.action.` — `kind: TaskDialog`):
```yaml
kind: TaskDialog
inputs:
  - kind: ManualTaskInput      # or AutomaticTaskInput (agent-filled)
    propertyName: To
    value: someone@contoso.com
modelDisplayName: Send an email (V2)
modelDescription: This operation sends an email message.
action:
  kind: InvokeConnectorTaskAction
  connectionReference: <schema>.shared_office365.shared-office365-<guid>
  connectionProperties: { mode: Invoker }
  operationId: SendEmailV2
outputMode: All
```

**NEW connector tool** (`.tool.` — `kind: ConnectorTool`, lean):
```yaml
kind: ConnectorTool
authMode: Invoker
connectionReference: <schema>.cr.shared_office365
connectorId: /providers/Microsoft.PowerApps/apis/shared_office365
operationId: SendEmailV2
```

**NEW skill** (`.skill.` — `kind: InlineAgentSkill`, embeds a SKILL.md):
```yaml
kind: InlineAgentSkill
content: |
  ---
  name: meeting-brief-formatter      # MUST be a lowercase-hyphen slug (not a display name)
  description: <one-line description>
  ---
  # <Title>
  <markdown instructions…>
```

**NEW connected/child agent** (`.action.<childSchema>` — `kind: ConnectedAgentTool`):
```yaml
kind: ConnectedAgentTool
historyType: { kind: ConversationHistory }
botSchemaName: <childBotSchemaName>
```
> A connected agent PULLS THE CHILD BOT into the package: add `bots/<child>/…` + the child's botcomponents +
> `dependencies.json`. Account for multi-bot solutions when a connected agent is described.

## 5. Every `botcomponents/<...>/botcomponent.xml`

```xml
<botcomponent schemaname="<full component schemaname>">
  <componenttype>9</componenttype>          <!-- see map below -->
  <description>…</description>              <!-- optional -->
  <iscustomizable>0</iscustomizable>
  <name>Send an email (V2)</name>
  <parentbotid><schemaname><botSchemaName></schemaname></parentbotid>
  <statecode>0</statecode>
  <statuscode>1</statuscode>
</botcomponent>
```
componenttype values: Topic=9 (also used for `.tool.`, `.skill.`, connected-agent `.action.` in new exp,
and Work IQ topics), Custom GPT=15, External Trigger=17, Copilot Settings=18, Knowledge Source=16.

## 6. Connection references (REQUIRED for every connector/MCP component)

Two places, must stay in sync:

`Assets/botcomponent_connectionreferenceset.xml` — one row per connector/MCP component:
```xml
<botcomponent_connectionreference
  botcomponentid.schemaname="<schema>.tool.SendanemailV2_P2w"
  connectionreferenceid.connectionreferencelogicalname="<schema>.cr.shared_office365">
  <iscustomizable>1</iscustomizable>
</botcomponent_connectionreference>
```
`customizations.xml` → `<connectionreferences>`:
```xml
<connectionreference connectionreferencelogicalname="<schema>.cr.shared_office365">
  <connectionreferencedisplayname>…</connectionreferencedisplayname>
  <connectorid>/providers/Microsoft.PowerApps/apis/shared_office365</connectorid>
  <iscustomizable>0</iscustomizable><promptingbehavior>0</promptingbehavior>
  <statecode>0</statecode><statuscode>1</statuscode>
</connectionreference>
```
Connections are bound at import time; do not hardcode connection GUIDs/secrets.

## 7. `[Content_Types].xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/octet-stream" />
  <Default Extension="json" ContentType="application/octet-stream" />
  <!-- one <Override PartName="/botcomponents/<comp>/data" ContentType="application/octet-stream" /> per component 'data' -->
</Types>
```

## 8. Work IQ (the intelligence layer — NOT the Outlook/Teams connectors)

Work IQ is a distinct capability, Disabled by default. When ON, it adds **two MCP tool components** (componenttype
9) + two connection references — emit these to represent "Work IQ enabled":

| Component (`.topic.` in classic) | Connector (connection ref) | operationId | Source |
|---|---|---|---|
| `WorkIQCopilotPreview` — "Work IQ Copilot (Preview)" | `shared_a365copilotchatmcp` | `mcp_m365copilot` | M365 Copilot Search |
| `WorkIQUserPreview` — "Work IQ User (Preview)" | `shared_a365memcp` | `mcp_MeServer` | User Profile ("Me") |

`data` shape (both):
```yaml
kind: TaskDialog
modelDisplayName: Work IQ Copilot (Preview)
action:
  kind: InvokeExternalAgentTaskAction
  connectionReference: <schema>.shared_a365copilotchatmcp.shared-a365copilotch-<guid>
  connectionProperties: { mode: Invoker }
  operationDetails:
    kind: ModelContextProtocolMetadata
    operationId: mcp_m365copilot
```
Credit note: Work IQ is MCP/agent invocation — price it separately from ordinary connector actions.
(As of capture, Work IQ was available in the CLASSIC experience; the NEW-experience Microsoft IQ dialog in the
test tenant exposed only Fabric IQ + Foundry IQ — treat new-experience Work IQ as a tenant rollout gate.)

## 9. `solution.xml` manifest

```xml
<ImportExportXml version="9.2.…" SolutionPackageVersion="9.2" languagecode="1033" …>
  <SolutionManifest>
    <UniqueName>YourSolutionUniqueName</UniqueName>
    <LocalizedNames><LocalizedName description="Your Solution" languagecode="1033" /></LocalizedNames>
    <Version>1.0.0.0</Version>
    <Managed>0</Managed>
    <Publisher>… CustomizationPrefix e.g. atl …</Publisher>
    <RootComponents />   <!-- may be empty for agent-only solutions; bots ride in bots/ + botcomponents/ + solutioncomponent records -->
    <MissingDependencies />
  </SolutionManifest>
</ImportExportXml>
```

## 10. HARD RULES / gotchas (verified — do not rediscover)

1. **Package the agent into a FRESH solution** (or use maker "Add existing agent" / `pac solution
   add-solution-component --component <botid> --componentType bot --AddRequiredComponents true`). A pre-existing
   solution won't retro-include newly added child components (tools, skills, Work IQ) → silent omissions.
2. **Every connector/MCP/tool component needs BOTH** a `connectionreferenceset` row AND a `<connectionreference>`
   in customizations.xml, with matching logical names. Missing either → import/runtime failure.
3. **Do not fabricate operationIds or connectorIds.** Use verified ones (e.g. `SendEmailV2`,
   `/providers/Microsoft.PowerApps/apis/shared_office365`). Unknown ops break import.
4. **Skill YAML `name` must be a lowercase-hyphen slug**, or upload/import fails.
5. **Connected agent ⇒ multi-bot package** (child bot + its components + dependencies.json).
6. New experience: **no `.topic.*`**, instructions inline in configuration.json. Classic: instructions in
   `gpt.default`, system topics present.
7. Keep everything in ONE solution so managed + unmanaged both export/import cleanly.
8. Validate by importing: `pac solution import --path <zip> --publish-changes`. Target "Solution Imported
   successfully."

## 11. Reference material (in this repo)

- `deliverables\classic-experience_generative_WORKIQ-enabled_unmanaged.zip` — classic + Work IQ (2 MCP comps, 5 conn refs), import-verified.
- `deliverables\new-experience_generative_workiq_tools+skill+connectedagent_unmanaged.zip` — new exp: 3 tools + skill + connected agent.
- `deliverables\estimator-generated_ExecutiveMeetingPrepAgent_unmanaged.zip` — what the OLD generator emits (for gap diffing).
- `exports\*_extracted\` — unpacked trees to diff byte-for-byte.

**Task for you (GHCP):** given a natural-language agent description, choose the experience, then emit a complete
solution folder matching §1–§9, honoring §10, and (if requested) zip it. When a described capability has no
verified connector/operationId, surface it as a NEXT-STEP note instead of fabricating it.
