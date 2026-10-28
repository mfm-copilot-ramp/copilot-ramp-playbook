# Automation Learnings Registry

> **Append-only.** The Auditor automation appends entries here when it discovers recurring issues,
> successful patterns, or fixes that should compound across future runs. Humans may also add entries.
> **Never delete or reorder existing entries** — this is a log, not a living document.

---

## Format

Each entry follows this template:

```
### YYYY-MM-DD — [Category] Short title

**Issue:** What went wrong or what pattern was observed.
**Root cause:** Why it happened.
**Fix / guideline:** What to do differently going forward.
**Applies to:** Watcher | Reconciler | Author | Auditor | All
```

### Categories

- `accuracy` — A product claim was wrong or outdated
- `duplication` — The same signal was processed more than once
- `scope-creep` — An automation exceeded its per-run caps
- `style` — Content didn't match CONTENT-MODEL.md conventions
- `source` — A monitored source changed structure or went stale
- `process` — A procedural gap in the pipeline itself

---

## Entries

### 2026-10-28 — [process] Link checks must use GET, not HEAD

**Issue:** The Auditor's first working run flagged `copilot.cloud.microsoft` as dead (HTTP 405) and
reported Learn redirects inconsistently between the Actions runner and a local run.
**Root cause:** It probed links with HEAD. Some sites reject HEAD, and Learn can answer HEAD with 200
for pages whose GET redirects (for example `azure/ai-foundry/` → `azure/foundry/`). It also counted
locale-only redirects (`/x` → `/en-us/x`) as stale links.
**Fix / guideline:** Probe with a streamed GET, follow redirects to the final URL, and ignore
locale, trailing-slash and query-only differences. When Microsoft moves a docs set, fix every
occurrence site-wide and in generators such as `tooling/gen_path_catalog.py`, not just the sampled pages.
**Applies to:** All

### 2026-10-28 — [process] Author, Reconciler and Auditor looked busy but delivered nothing

**Issue:** Since August the Author failed every week, the Reconciler "succeeded" daily without
opening a PR, and the Auditor reported 140 findings a week but filed none. Meanwhile one
accuracy-risk issue collected 88 identical Reconciler comments.
**Root cause:** Four separate bugs. (1) Author read `title`, but the selector only wrote
`issue_title`, and it read the stage from a format the Watcher no longer used, so every draft
was `unknown-.md` and failed QA. (2) "Allow GitHub Actions to create and approve pull requests"
was off, so `gh pr create` failed. The script logged the error, kept the pushed branch and exited
0, and the leftover branch then made later runs skip the item. (3) The Reconciler re-commented on
accuracy-risk issues every day with no memory that it already had. (4) The Auditor's section-order
rule put Screenshots last, against CONTENT-MODEL.md, so all 140 walkthroughs "failed". Its fuzzy
dedupe then treated every "Section order mismatch in X" as a duplicate of the first, so it filed
nothing. The real problems it was hiding were three walkthroughs whose invalid YAML frontmatter
rendered as raw text on the live site.
**Fix / guideline:** A failed PR or issue write must exit non-zero, never just log. Each
automation needs one check that it produced output, not only that it ran. Rules that every page
fails mean the rule is wrong. Dedupe on exact keys, not word overlap. Parse frontmatter with a
real YAML parser in CI.
**Applies to:** All

### 2026-10-28 — [process] Watcher silently stopped filing issues for two months

**Issue:** From 2026-08-21 every daily Watcher run failed at "Commit state file", so the
assess step never ran. Cowork GA follow-ups, the Scout → Autopilot rename and the billing
changes were all missed and had to be found by hand.
**Root cause:** The workflow pushed its seen-state straight to `main`, which requires PRs and a
passing `build` check. Separately, the Tech Community Copilot blog feed started returning 404 and
the Foundry what's-new URL moved, and nothing flagged either.
**Fix / guideline:** Automations must never push to `main`. Watcher state now lives on the
unprotected `automation-state` branch. Sources that fail 3 runs in a row open a tracking issue.
Broad feeds carry `match` filters, and new sources are baselined silently instead of flooding
the backlog.
**Applies to:** All

### 2026-10-28 — [source] A stale CDN copy of a feed re-filed old posts as news

**Issue:** The first run on the `automation-state` branch filed 10 noise issues (#132–#141) two
minutes after a clean baseline. Posts like "Copilot Cowork is now generally available" (June) came
back as "New" and every other Copilot blog post as "Changed".
**Root cause:** www.microsoft.com serves the Copilot and Power Platform blog feeds from more than
one cache, and one copy was weeks old. Its older posts were outside the baseline, so they read as
new. The two copies also differ in the WordPress footer ("appeared first on Microsoft Copilot Blog"
vs "AI at Work Blog"), which changed every summary hash. One post's URL slug also differed while its
GUID matched.
**Fix / guideline:** Never trust a single fetch of a feed. The Watcher records each feed's build
date, refetches a copy that is older than the last one seen, and skips the source for that run if
every copy is stale. Feed items are keyed on the entry GUID, the WordPress footer is stripped
**Applies to:** Watcher

### 2026-10-28 — [source] No-cache headers don't reach www.microsoft.com's stale cache copies

**Issue:** After #142, the re-baseline run recorded the Copilot blog from a copy built 9/23, a
month stale. The next run got a 9/25 copy and filed #143 for a real but month-old post. The fresh
copy (built 10/27) also held two October posts that the stale baseline missed.
**Root cause:** The CDN ignores `Cache-Control: no-cache`. Plain requests got the stale copy 3 times
out of 5. A first-run baseline also accepted the first copy, because there was no recorded build
date to compare against.
**Fix / guideline:** Every feed request carries a unique `_wcb=<nanoseconds>` query string, which got
the fresh copy 5 times out of 5. Retries and the stale-copy check stay as a second line of defence.
**Applies to:** Watcher
