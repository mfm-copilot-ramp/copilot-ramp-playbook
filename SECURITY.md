# Security Policy

> **⚠️ Unofficial project.** The Copilot Ramp Playbook is a community-built documentation site. It is
> **not** affiliated with, endorsed by, or an official resource of Microsoft, and this policy is **not**
> the Microsoft Security Response Center (MSRC).

## Reporting a vulnerability in *this project*

"This project" means the things we control: the MkDocs site, the build/CI configuration, and the helper
tooling in this repository (for example the Playwright screenshot tool under `tooling/`).

Please **report privately** — do not open a public issue for a security problem.

1. **Preferred:** use GitHub's private vulnerability reporting on this repo —
   **Security → Report a vulnerability** (the "Report a vulnerability" button). This opens a private
   advisory visible only to you and the maintainers.
2. **Fallback:** if private reporting is unavailable, email the maintainers at
   **`<security-contact@example.com>`** *(maintainers: replace with a real, monitored address)*.

Please include enough detail to reproduce: what you found, where, and the impact you expect. If you have
a suggested fix, a pull request link is welcome (but don't post exploit details publicly).

### What to expect

This is a volunteer, best-effort project — there is no paid on-call rotation. We aim to:

- **Acknowledge** your report within about **5 business days**.
- Give you an **assessment and a plan** (fix, mitigation, or "won't fix" with reasoning) once we've
  reproduced it.
- Credit you in the fix notes if you'd like (let us know how you'd like to be named).

## Out of scope — Microsoft product vulnerabilities

If you've found a vulnerability in an **actual Microsoft product or service** (Microsoft 365 Copilot,
Copilot Studio, Microsoft Foundry, Azure, etc.) — **not** in this documentation repo — please report it
to Microsoft, **not here**. We cannot triage or fix Microsoft product issues.

- **Microsoft Security Response Center (MSRC):** <https://msrc.microsoft.com/report>

## Supported versions

The site is continuously published from the `main` branch. Only the current `main` is supported; there
are no long-lived release branches to backport to.
