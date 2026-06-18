<!--
  Pull request template for the Copilot Ramp Playbook.
  Keep PRs small and focused. Reviewers love bullet points.
-->

## What this PR does

<!-- One or two sentences. What changed and why? -->

## Type of change

<!-- Keep the ones that apply, delete the rest. -->

- [ ] New walkthrough
- [ ] Walkthrough edit / refresh
- [ ] Content fix (typo, link, terminology, formatting)
- [ ] New / updated resource link
- [ ] Tooling, build, or CI change
- [ ] Other (please describe)

## Linked issues

<!-- Closes #123, refs #456. Optional. -->

## Author checklist

- [ ] I previewed this locally with `mkdocs serve`.
- [ ] `python tooling/qa/check-content.py` passes locally.
- [ ] `mkdocs build --strict` passes locally (no broken internal links).
- [ ] Walkthroughs follow [`CONTENT-MODEL.md`](../CONTENT-MODEL.md) and the exemplar
      (`docs/walkthroughs/chat-meeting-followups.md`).
- [ ] Screenshots are **two-state honest** — real captures committed under `docs/screenshots/<slug>/`,
      **or** an honest no-screenshot note pointing at the numbered steps. No faked / stale UI.
- [ ] If I edited a walkthrough, I bumped its `updated:` frontmatter date.
- [ ] I'm not adding Microsoft-confidential, customer, or proprietary content.

## Notes for the reviewer

<!-- Anything reviewers should know — caveats, follow-ups, things to look at first. -->
