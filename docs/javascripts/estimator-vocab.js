/* Copilot Credit Estimator — shared VERIFIED component vocabulary.
 *
 * ONE source of truth for the Copilot Studio solution-export tokens that both the
 * WRITER (estimator-package.js) and the READER (estimator-core.js → analyzeSolution)
 * must agree on. Extracting them here stops the two sides drifting: the emitter
 * writes exactly what the analyzer looks for, and the emit→read self-consistency
 * test (files/phasec-*.cjs) fails loudly if they ever diverge.
 *
 * DOCTRINE: every token below is VERIFIED verbatim against a real unmanaged solution
 * export (files/golden-new-solution/ — GamedayOpsAssistant, a multi-agent new-experience
 * agent with file knowledge, an agent-flow tool, and a connected sub-agent) or an
 * official Microsoft reference. Do NOT add a token that isn't present in a real export.
 * Dependency-free; loads in the browser (window.EstimatorVocab) and Node (module.exports).
 */
(function (root) {
  "use strict";

  var VOCAB = {
    // ── New-experience (cliagent) bot configuration.json ─────────────────────
    // Verified: bots/<agent>/configuration.json in the golden export.
    //   "recognizer":{"$kind":"CLICopilotRecognizer"}          ← new experience
    //   "agentSettings":{"model":{"$kind":"ModelConfig","series":"Sonnet46"}}
    //   "instructions":{"segments":[{"$kind":"StaticSegment","value":"…"}]}
    //   "web":{"$kind":"WebSettings","enableWebSearch":false}
    RECOGNIZER_NEW_EXPERIENCE: "CLICopilotRecognizer",
    KIND_BOT_CONFIG: "BotConfiguration",
    KIND_AGENT_SETTINGS: "AgentSettings",
    KIND_MODEL_CONFIG: "ModelConfig",
    KIND_STATIC_SEGMENT: "StaticSegment",
    KIND_WEB_SETTINGS: "WebSettings",

    // ── botcomponent.xml <componenttype> numbers ─────────────────────────────
    // Verified: .file.* → 14 (file knowledge source); .tool.* and .action.* → 9
    //   (the tool/action wrapper is type 9 — the SAME number as a classic topic —
    //   and is disambiguated by its `data` file's `kind:` below). Classic-experience
    //   emit uses gpt.default → 15 and KnowledgeSourceConfiguration → 16.
    COMPONENTTYPE: {
      TOPIC: 9,             // classic AdaptiveDialog topic  AND  new-exp tool/action wrapper
      TOOL: 9,             // .tool.* / .action.* wrappers (distinguish via DATA_KIND)
      FILE_KNOWLEDGE: 14,  // .file.* file knowledge source (new experience)
      GPT_DEFAULT: 15,     // classic gpt.default orchestration component
      KNOWLEDGE_CLASSIC: 16 // classic KnowledgeSourceConfiguration component
    },

    // ── botcomponent `data` (extensionless YAML) `kind:` values ──────────────
    // Verified: .tool.*/data → "kind: WorkflowTool" (+ workflowId) — an agent flow used
    //   as a tool, the ZERO-RATED "When an agent calls the flow" path (0.13 cr/action).
    //   .action.*/data → "kind: ConnectedAgentTool" (+ botSchemaName) — a connected
    //   sub-agent (multi-agent orchestration). Knowledge config kind is shared with classic.
    DATA_KIND: {
      WORKFLOW_TOOL: "WorkflowTool",
      CONNECTED_AGENT_TOOL: "ConnectedAgentTool",
      KNOWLEDGE_SOURCE_CONFIG: "KnowledgeSourceConfiguration"
    },

    // ── Model series strings (agentSettings.model.series) ────────────────────
    // Only "Sonnet46" (Claude Sonnet 4.6) is verified from a real export, and it is a
    // STANDARD (non-reasoning) series. Reasoning-tier series would add the premium AI
    // meter (10 cr/1K tokens) — but NO reasoning series string is verified yet, so the
    // reasoning list stays empty until a real export confirms one. Never guess a series.
    MODEL_SERIES_VERIFIED: ["Sonnet46"],
    MODEL_SERIES_REASONING: [],

    // ── Work IQ (M365 tenant-graph) MCP tool pair ────────────────────────────
    // Verified verbatim from a real CLASSIC export (WorkIQClassicGroundTruth) where the
    // Work IQ toggle was ON. Turning Work IQ on adds EXACTLY these two MCP tool
    // components (each a `.topic.<suffix>` botcomponent, componenttype 9) + two paired
    // connection references. Each component's `data` is a `kind: TaskDialog` with an
    // `action.kind: InvokeExternalAgentTaskAction` + `operationDetails.kind:
    // ModelContextProtocolMetadata` (an MCP invocation of the M365 tenant graph).
    // Credit-wise these are tenant-graph grounding (the 10 cr/run meter), NOT connector
    // actions. `abbrev` is the VERIFIED truncated segment used in the connection-ref
    // logical name (`<schema>.<connector>.shared-<abbrev>-<guid>`).
    WORKIQ_MCP: [
      { suffix: "WorkIQCopilotPreview", modelDisplayName: "Work IQ Copilot (Preview)", connector: "shared_a365copilotchatmcp", abbrev: "a365copilotch", operationId: "mcp_m365copilot" },
      { suffix: "WorkIQUserPreview", modelDisplayName: "Work IQ User (Preview)", connector: "shared_a365memcp", abbrev: "a365memcp", operationId: "mcp_MeServer" }
    ]
  };

  // Prebuilt, case-insensitive matchers derived from the constants so the reader can
  // never look for a token the constants don't define.
  VOCAB.RE = {
    newExperience: function () { return new RegExp(VOCAB.RECOGNIZER_NEW_EXPERIENCE, "i"); },
    workflowTool: function () { return new RegExp("kind:\\s*" + VOCAB.DATA_KIND.WORKFLOW_TOOL + "\\b", "gi"); },
    connectedAgentTool: function () { return new RegExp("kind:\\s*" + VOCAB.DATA_KIND.CONNECTED_AGENT_TOOL + "\\b", "gi"); },
    fileKnowledgeType: function () { return new RegExp("<componenttype>\\s*" + VOCAB.COMPONENTTYPE.FILE_KNOWLEDGE + "\\s*</componenttype>", "gi"); },
    webSearchOn: function () { return /"?enableWebSearch"?\s*:\s*true\b/i; },
    // series may appear JSON-style ("series":"X") or YAML-style (series: X)
    modelSeries: function () { return /"?series"?\s*:\s*"?([A-Za-z0-9_.-]+)"?/i; },
    // Work IQ / M365 tenant-graph MCP tokens (either connector name or MCP operationId).
    // An uploaded agent carrying any of these grounds on the tenant graph → the 10 cr/run
    // meter must fire, the same as the classic graph-grounding tokens.
    workIQ: function () { return /shared_a365copilotchatmcp|shared_a365memcp|mcp_m365copilot|mcp_MeServer/gi; }
  };

  // Is a model series string a verified reasoning-tier series? (false for Sonnet46 and
  // for any unknown/unverified series — we never assume reasoning without verification.)
  VOCAB.isReasoningSeries = function (series) {
    if (!series) return false;
    var s = String(series).toLowerCase();
    for (var i = 0; i < VOCAB.MODEL_SERIES_REASONING.length; i++) {
      if (String(VOCAB.MODEL_SERIES_REASONING[i]).toLowerCase() === s) return true;
    }
    return false;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = VOCAB;
  else root.EstimatorVocab = VOCAB;
})(typeof globalThis !== "undefined" ? globalThis : this);
