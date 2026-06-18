# Go Public — deploy the Copilot Ramp Playbook to GitHub Pages

> The whole site is plain Markdown in `docs/`. This runbook takes you from "files on disk" to
> "live, public site" in about **30 minutes the first time**. Everything here is free — no domain
> purchase, no paid tiers.

You'll do four things: **preview locally → put it on GitHub → flip on Pages → it deploys itself.**

---

## 0. What you need first

- A **GitHub account** (free). If this will live under a team/org, have that org ready.
- **Git** installed locally (`git --version` to check).
- **Python 3.9+** installed locally (`python --version`). Only needed for the *local preview* — GitHub builds the live site for you.

You do **not** need to install MkDocs globally or buy anything.

---

## 1. Preview locally (optional but recommended — 5 min)

This lets you see the site exactly as visitors will, before anything is public.

```bash
cd copilot-ramp-cookbook

# Create an isolated Python environment and install the pinned build tools
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Serve the site with live reload
mkdocs serve
```

Open **http://127.0.0.1:8000** in your browser. Edit any `.md` file in `docs/` and the page reloads instantly. Press `Ctrl+C` to stop.

> If `mkdocs serve` reports a broken link or a nav entry pointing at a missing file, fix it now —
> the live build runs with `--strict`, which **fails** on broken internal links. Better to catch it here.

---

## 2. Set your repo name in `mkdocs.yml` (2 min)

Open `mkdocs.yml` and replace **`<org-or-user>`** (it appears in `site_url`, `repo_url`, and the social link)
with your actual GitHub account or org name. For example, if your repo will be
`https://github.com/acme/copilot-ramp-cookbook`, then `<org-or-user>` → `acme`.

The resulting public URL will be:

```
https://<org-or-user>.github.io/copilot-ramp-cookbook/
```

(That trailing `/copilot-ramp-cookbook/` matters — keep the repo named `copilot-ramp-cookbook` unless
you also change `site_url` and the repo name to match.)

---

## 3. Put it on GitHub (10 min)

There is **no git repository yet**, so initialize one:

```bash
cd copilot-ramp-cookbook

git init
git branch -M main
git add .
git commit -m "Initial publish: Copilot Ramp Playbook (walkthroughs + site scaffolding)"
```

Then create an **empty** repo on GitHub named `copilot-ramp-cookbook` (no README, no .gitignore —
you already have both), and connect it:

```bash
git remote add origin https://github.com/<org-or-user>/copilot-ramp-cookbook.git
git push -u origin main
```

> **Public vs private:** Pages on the free tier serves from **public** repos. Make the repo public when
> you create it (or upgrade Pages later). A public repo is also the whole point — this is a community resource.

---

## 4. Turn on GitHub Pages (2 min)

In your repo on github.com:

1. **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch").

That's it. The workflow at `.github/workflows/deploy.yml` is already in your repo, so the moment you
pushed `main` (or as soon as you flip the source), it will:

1. Install `mkdocs-material` from `requirements.txt`,
2. Run `mkdocs build --strict`,
3. Publish the result to Pages.

Watch it run under the **Actions** tab. When the green check appears, your site is live at
`https://<org-or-user>.github.io/copilot-ramp-cookbook/`.

From now on, **every push to `main` redeploys automatically.** Editing content = commit + push.

---

## 5. The screenshot pass (do this after go-live)

Every walkthrough is already *scaffolded* for screenshots: each has a `## Screenshots` section with
three commented-out image embeds and `> 📷` capture anchors on steps 1–3. The images themselves aren't
captured yet — that's the one remaining content task.

The capture harness lives in `tooling/screenshots/` (Playwright). To capture a walkthrough's shots:

```bash
cd tooling/screenshots
npm install
npm run auth        # one-time: sign in to your M365 tenant so captures are authenticated
npm run capture
```

Captured PNGs land under `docs/screenshots/<walkthrough-slug>/`. Then **uncomment** the matching
`<!-- ![NN — …](../screenshots/<slug>/NN-x.png) -->` embeds in that walkthrough and delete its
"Not captured yet" note. Commit, push, and the images go live with the next deploy.

> Do these incrementally — one walkthrough at a time, highest-demo-value first. The site is fully usable
> without screenshots; they're polish, not a blocker.

---

## 6. Free custom domain (optional, later)

The `*.github.io` URL is free and final — you never *have* to buy a domain. If you later want a custom
domain at no cost, the cleanest free path is to move the same `docs/` content to **Azure Static Web Apps**
(free tier includes free SSL + free custom domain). The Markdown doesn't change — only the hosting layer.
Revisit this once the site has traffic.

---

## Quick reference

| Task | Command |
|------|---------|
| Preview locally | `mkdocs serve` → http://127.0.0.1:8000 |
| Check for broken links | `mkdocs build --strict` |
| Publish a change | `git add . && git commit -m "…" && git push` |
| Capture screenshots | `cd tooling/screenshots && npm install && npm run auth && npm run capture` |

**Live URL:** `https://<org-or-user>.github.io/copilot-ramp-cookbook/`
