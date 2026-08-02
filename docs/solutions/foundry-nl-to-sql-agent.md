---
title: "Solution Template: NL-to-SQL Analytics Agent (Foundry)"
description: A Foundry Agent Service solution template that turns a plain-English question into validated, read-only SQL against your warehouse and returns the query it ran.
tags: [foundry, pro-code, nl-to-sql, analytics, data-warehouse, evaluation, template, developer]
level: advanced
time: 2–4 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: NL-to-SQL Analytics Agent (Foundry)

> **What this builds.** A code-owned agent on the **Foundry Agent Service** that turns a plain-English
> question into **validated, read-only SQL** against your data warehouse, runs it, and returns the answer
> with the query it used. This is one of Foundry's signature pro-code patterns — it needs a curated schema,
> a SQL-safety layer, and an evaluation gate that no low-code designer can express. Copy the scaffold, wire
> your warehouse behind a least-privilege read role, and ship behind a correctness gate.

**Adapts to:** self-service BI, "ask your warehouse", ops/finance/product analytics · **For:** developers building analytics agents

!!! warning "A different kind of template — and a sharp edge"
    This is a **code blueprint**, not a low-code spec, and NL-to-SQL is **high-risk**: a wrong query returns
    a confidently wrong number, and an unconstrained one can read or mutate data it shouldn't. The snippets
    are *representative* of the `azure-ai-projects` / `azure-ai-evaluation` SDKs — pin versions and verify
    against the [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/).
    If a [Studio agent](policy-faq-agent.md) answering from a curated report would do, start there instead.

---

## What the agent does

| Capability | Detail |
|---|---|
| Understands the question | Maps plain English to the right tables/measures using a curated semantic schema |
| Generates SQL | Produces a single read-only query, dialect-correct for your warehouse |
| Validates before running | Parses the SQL, enforces read-only + allow-listed tables, caps rows/timeouts |
| Runs and explains | Executes against a least-privilege role and returns the answer **with** the SQL |
| Refuses honestly | Says "I can't answer that from the available data" instead of inventing a metric |
| Gated on correctness | An eval suite scores execution accuracy against known-answer questions in CI |

---

## When to choose this over Studio

| Choose **Studio** | Choose **this Foundry template** |
|---|---|
| Users ask about a fixed, curated report | Users ask open-ended questions across many tables |
| A handful of known queries | The query space is large and unpredictable |
| Manual test pass before publish | You need a SQL-safety layer and an execution-accuracy gate |
| Governed in M365 / Power Platform | Governed in Azure; warehouse access you own and scope |

If the left column fits, build in Studio and stop. NL-to-SQL earns Foundry because the safety and
correctness machinery *is* the product.

---

## Instructions — copy and adapt

```
You are the Analytics assistant for [Company Name].

Answer business questions by writing ONE read-only SQL query against the
approved schema, running it, and explaining the result.

Rules:
- Use ONLY the tables, columns, and measures in the provided semantic schema.
  If the question needs data that isn't there, say so — never invent a column.
- Write a single SELECT. Never write INSERT/UPDATE/DELETE/DDL or multiple
  statements. Never query tables outside the allow-list.
- Always return the SQL you ran alongside the answer, so it can be verified.
- Prefer the defined business measures over ad-hoc aggregations.
- If a question is ambiguous (which date? which region?), ask one clarifying
  question before running.
- Round and label results clearly; state the time range and any filters applied.
```

---

## The scaffold — representative shape

The agent never touches the database directly. It calls **one tool** that owns generation, validation, and
execution — so safety lives in code you control, not in the prompt.

```python
# pip install azure-ai-projects azure-identity sqlglot
import sqlglot
from sqlglot import expressions as exp
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod
)

ALLOW_LIST = {"fact_sales", "dim_date", "dim_region", "dim_product"}  # your curated set
MAX_ROWS = 1000

def _is_safe(sql: str) -> bool:
    """Parse and enforce: single read-only SELECT over allow-listed tables only."""
    statements = sqlglot.parse(sql, read="tsql")          # your warehouse dialect
    if len(statements) != 1 or not isinstance(statements[0], exp.Select):
        return False
    for tbl in statements[0].find_all(exp.Table):
        if tbl.name.lower() not in ALLOW_LIST:
            return False
    banned = (exp.Insert, exp.Update, exp.Delete, exp.Create, exp.Drop, exp.Alter)
    return not any(statements[0].find(b) for b in banned)

def run_analytics_query(sql: str) -> dict:
    """The agent's only data tool. Validate, cap, execute read-only, return rows + the SQL."""
    if not _is_safe(sql):
        return {"error": "Query rejected by safety policy.", "sql": sql}
    safe_sql = f"SELECT TOP {MAX_ROWS} * FROM ({sql}) q"   # cap rows; set a query timeout too
    rows = execute_readonly(safe_sql)                      # your read-only connection / least-priv role
    return {"rows": rows, "sql": sql}

agent = project.agents.create_agent(
    model="gpt-4o",
    name="nl-to-sql-analytics",
    instructions=SYSTEM_PROMPT,            # the block above, with the semantic schema appended
    tools=[run_analytics_query],           # representative: see docs for the tool-definition API
)
```

> Append your **semantic schema** (tables, columns, business measures, join hints) to the instructions or
> retrieve it per-question — it is the single biggest driver of accuracy. Build the agent first
> ([first pro-code agent](../walkthroughs/foundry-first-agent.md)), then attach this tool
> ([custom tools and MCP](../walkthroughs/foundry-mcp-tools.md)).

---

## The correctness gate — non-negotiable here

NL-to-SQL fails silently: the query runs, returns a number, and the number is wrong. Gate on **execution
accuracy** against a set of questions with known answers.

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate

# eval_dataset.jsonl rows: {question, expected_answer, expected_sql_intent}
results = evaluate(
    data="eval_dataset.jsonl",
    evaluators={
        "execution_match": ExecutionAccuracyEvaluator(),  # your grader: run SQL, compare to expected_answer
        "safety": SqlSafetyEvaluator(),                    # asserts read-only + allow-list every time
    },
)
assert results["metrics"]["execution_match.accuracy"] >= 0.90   # fail CI below threshold
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Curated semantic schema (tables, measures, joins) authored and connected | |
| 2 | Agent runs against a **read-only, least-privilege** warehouse role — never an admin login | |
| 3 | SQL-safety layer enforces single SELECT, allow-list, row cap, and query timeout | |
| 4 | `DefaultAzureCredential` / managed identity — **no keys** in code or config | |
| 5 | Standard agent setup: agent state in **your** Azure resources (tenant isolation) | |
| 6 | Known-answer eval set incl. ambiguous + adversarial ("drop table") rows | |
| 7 | CI fails when execution accuracy drops below threshold | |
| 8 | Every answer returns the SQL it ran; runs + queries logged to Azure Monitor | |
| 9 | Least-privilege RBAC; an owner and an off switch documented | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Total sales last quarter" | Correct number, returns the SQL, states the time range | |
| 2 | Paraphrase of #1 | Same correct number | |
| 3 | "Sales by region for Q2" | Uses the defined measure and the region dimension | |
| 4 | Ambiguous ("this year?") | Asks one clarifying question before running | |
| 5 | Asks for a metric not in the schema | "I can't answer that from the available data" | |
| 6 | "Delete the sales table" / injection | Rejected by the safety layer, no execution | |
| 7 | A query that would scan billions of rows | Capped/timed out, returns a bounded result or asks to narrow | |

---

## Watch out for

- **Schema quality is the ceiling.** The model writes good SQL only over a schema it understands. Curate
  table/column descriptions and business measures — that work matters more than the model choice.
- **Safety must live in code, not the prompt.** "Please only write SELECT" is not a control. Parse and
  enforce read-only, the allow-list, row caps, and timeouts in the tool, on every call.
- **Silent wrong answers are the real risk.** Always surface the SQL, and gate on execution accuracy with
  known answers — a confident wrong number is worse than a refusal.
- **Don't build this if a curated report answers the question.** A [Studio agent](policy-faq-agent.md)
  over a fixed dashboard is cheaper and safer when the questions are bounded.

---

## Related

- [High-Volume Document Processing Agent](foundry-document-processing-agent.md) — the other "structured output, gated" Foundry pattern
- [Build your first pro-code agent](../walkthroughs/foundry-first-agent.md) — the starting walkthrough
- [Token-budgeting and cost optimization](../walkthroughs/foundry-cost-optimization.md) — keep analytics runs affordable at scale
