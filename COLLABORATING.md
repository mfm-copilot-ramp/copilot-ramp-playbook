# Collaborating — make the Copilot Ramp Playbook a shared community repo

> Companion to [`GO-PUBLIC.md`](GO-PUBLIC.md). That runbook gets a *single-author* repo onto GitHub
> Pages. **This** runbook moves the repo into a community **GitHub Organization** so a trusted core
> team can collaborate via the normal branch → PR → review → merge → auto-deploy flow — and renames
> it to **Copilot Ramp Playbook** at the same time.
>
> Plan on **30–45 minutes the first time**. Everything here is free.

You'll do six things, in order:

**Create the org → transfer + rename the repo → update the slug-bound config → set up the team and
permissions → lock down `main` with branch protection → verify with a real PR.**

---

## 0. What you need first

- The current repo: `MawellGlass/copilot-ramp-cookbook` — and **admin** rights on it.
- A name in mind for the org. The runbook uses **`<your-org>`** as a placeholder; substitute throughout.
- The **GitHub usernames** of the colleagues who'll be maintainers.
- The **`gh` CLI** installed and signed in (`gh auth login`). The branch-protection step uses it; you
  can also do every step in the GitHub UI if you prefer.
- The collaboration scaffolding files this branch already added (`LICENSE`, `LICENSE-CONTENT.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CONTRIBUTING.md`, `MAINTAINERS.md`, `.github/CODEOWNERS`,
  PR + issue templates, `ci.yml`, `dependabot.yml`) — merged into `main`.

---

## 1. Create the GitHub Organization (5 min)

1. Sign in to GitHub as the user who will own the org (you).
2. Open <https://github.com/organizations/plan> and choose the **Free** plan.
3. **Organization account name:** pick a clean, descriptive name — that's `<your-org>`.
   (You can rename later if needed; redirects handle the URL change.)
4. **Contact email:** a real, monitored address.
5. **This organization belongs to:** *My personal account* (community project, not a business).
6. Skip / decline the team invitations on the next screen — we'll add people in step 4.

> Org name advice: short, lowercase, hyphenated; not tied to one company; not "microsoft-…".
> Examples: `copilot-ramp`, `ramp-collective`, `<your-handle>-labs`. Keep it boring; the project name
> does the work.

---

## 2. Transfer + rename the repo (10 min)

We do these in **one trip**: transfer first (preserves history, issues, PRs, stars, and sets up the
auto-redirect from the old URL), then rename inside the new org.

### 2a. Transfer

1. Go to **`MawellGlass/copilot-ramp-cookbook` → Settings → General → Danger Zone → Transfer
   ownership**.
2. **New owner's GitHub username or organization name:** `<your-org>`.
3. **To confirm, type the repository's name:** `copilot-ramp-cookbook`.
4. Click **I understand, transfer this repository.** GitHub may email you to confirm.

GitHub keeps **all** issues, PRs, commits, releases, stars, and watchers, and sets up automatic
redirects from the old `MawellGlass/copilot-ramp-cookbook` URLs to the new ones.

### 2b. Rename inside the org

1. Go to **`<your-org>/copilot-ramp-cookbook` → Settings → General**.
2. **Repository name:** change `copilot-ramp-cookbook` → **`copilot-ramp-playbook`**.
3. Click **Rename**.

GitHub auto-redirects the old slug too, so links you've already shared keep working.

### 2c. Update your local clone

```bash
# In your local clone of the repo:
git remote set-url origin https://github.com/<your-org>/copilot-ramp-playbook.git
git remote -v   # confirm both fetch and push point at the new URL
```

---

## 3. Update the slug/URL-bound config (5 min)

The display name was already changed across the repo. A handful of files still reference the old
**slug** (`copilot-ramp-cookbook`) — those have to flip together with the rename so the live site URL,
the repo edit links, and a few in-doc references all match the new home. Each is a single-string
find-and-replace.

| File | What to change |
|------|----------------|
| `mkdocs.yml` | `site_url:` → `https://<your-org>.github.io/copilot-ramp-playbook/`<br>`repo_url:` → `https://github.com/<your-org>/copilot-ramp-playbook`<br>`repo_name:` → `copilot-ramp-playbook` |
| `mkdocs.yml` (social link near the bottom) | Update the GitHub social link to the new `<your-org>/copilot-ramp-playbook` URL |
| `overrides/main.html` | Three feedback / repo links — replace `MawellGlass/copilot-ramp-cookbook` with `<your-org>/copilot-ramp-playbook` |
| `docs/whats-new.md` | The repo link at the bottom — same substitution |
| `GO-PUBLIC.md` | Examples that include the old slug — same substitution |
| `tooling/screenshots/package.json` (optional) | `"name": "copilot-ramp-cookbook-screenshots"` → `"copilot-ramp-playbook-screenshots"` (also re-run `npm install` to refresh `package-lock.json`) |

A quick way to find anything else still pointing at the old slug:

```bash
git grep -n "copilot-ramp-cookbook"
git grep -n "MawellGlass/copilot-ramp-cookbook"
```

Walkthrough filenames and `docs/screenshots/<slug>/` directory names are **per-walkthrough** slugs,
not the project name — leave those alone.

### Re-enable GitHub Pages on the new repo

1. **Settings → Pages → Build and deployment → Source: GitHub Actions** (the
   `Deploy site to GitHub Pages` workflow is already in the repo).
2. Push the slug-update commit to `main`. The deploy workflow runs and publishes to:

   **`https://<your-org>.github.io/copilot-ramp-playbook/`**

3. Open it in a browser to confirm. The old `MawellGlass.github.io/copilot-ramp-cookbook/` URL stops
   working once Pages is reattached to the new repo (and you'll have updated any external links you
   shared via the redirect that GitHub provides for the *repo* URL).

---

## 4. Add maintainers and grant Write access (5 min)

We give the trusted core team **Write** — enough to push branches and manage PRs, but **not** enough
to bypass branch protection. Branch protection (next step) is what enforces "no direct pushes to
`main`."

### Create the team

1. **`<your-org>` → Teams → New team**.
2. **Team name:** `maintainers`. (Slug becomes `maintainers`. CODEOWNERS already routes review
   requests to `@<your-org>/maintainers`.)
3. **Description:** "Core maintainers of the Copilot Ramp Playbook."
4. **Visibility:** *Visible* (so contributors can see who's on the team).
5. **Notifications:** *Enabled* — members get review requests.

### Add people

In the team page → **Add a member** → invite the colleagues by GitHub username. Each person accepts
their org invite by email or in the GitHub notifications inbox.

### Grant Write on the repo

1. **`<your-org>/copilot-ramp-playbook` → Settings → Collaborators and teams → Add teams**.
2. Pick **`maintainers`** and choose **Write** access.

Update `MAINTAINERS.md` with real names + handles in the same PR that turns on branch protection (the
file ships with placeholders).

---

## 5. Branch protection on `main` (5 min)

This is the rule that makes "branch → PR → review → merge" mandatory and blocks direct pushes.

### Option A — `gh` CLI (recommended; copy-paste)

Run these from any machine signed in with `gh auth login`. Substitute `<your-org>`.

```bash
# Require: PR + ≥1 approval + CODEOWNERS review + the ci/build status check.
# Block: direct pushes, force pushes, deletion. Dismiss stale approvals on new commits.
gh api -X PUT \
  "repos/<your-org>/copilot-ramp-playbook/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  -F "required_status_checks[strict]=true" \
  -F "required_status_checks[contexts][]=build" \
  -F "enforce_admins=false" \
  -F "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -F "required_pull_request_reviews[require_code_owner_reviews]=true" \
  -F "restrictions=" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false" \
  -F "required_linear_history=true" \
  -F "required_conversation_resolution=true"
```

> Notes
>
> - The required status check **`build`** matches the `build` job name in `.github/workflows/ci.yml`.
>   It only becomes selectable once a PR run has reported it at least once — if the API call complains,
>   open a throwaway PR first (step 6), then re-run the command.
> - We set `enforce_admins=false` deliberately so a maintainer can ship an emergency fix if branch
>   protection itself is misconfigured. Flip to `true` later if you want fully strict protection.
> - `restrictions=` (empty) means *no* push restrictions to specific people/teams — branch protection
>   already blocks everyone except via PR.

### Option B — UI

**Settings → Branches → Branch protection rules → Add rule** with:

- **Branch name pattern:** `main`
- ☑ **Require a pull request before merging**
- ☑ **Require approvals: 1**
- ☑ **Dismiss stale pull request approvals when new commits are pushed**
- ☑ **Require review from Code Owners**
- ☑ **Require status checks to pass before merging**
  - ☑ **Require branches to be up to date before merging**
  - **Status checks:** add `build` (from the PR validation workflow)
- ☑ **Require conversation resolution before merging**
- ☑ **Require linear history**
- ☐ Do **not** check *Include administrators* (so you can recover from a misconfig).
- ☐ Allow force pushes: **off**
- ☐ Allow deletions: **off**

---

## 6. Verify (5 min)

1. Open a tiny PR from a feature branch — fix a typo in `README.md` or bump a date.
2. The **PR validation** workflow runs (`Actions → PR validation`). The job named **`build`** appears
   on the PR.
3. The PR template renders, the maintainers team is auto-requested for review, and the merge button
   stays disabled until you have:
   - ≥1 approving review,
   - a code-owner review,
   - the `build` status check ✅.
4. After merge, the **Deploy site to GitHub Pages** workflow runs from `main` and refreshes the live
   site.
5. Confirm direct push is blocked:
   ```bash
   git checkout main && git pull
   git commit --allow-empty -m "should be rejected"
   git push origin main
   ```
   GitHub should reject this. If it goes through, branch protection isn't on yet — re-run step 5.

---

## 7. Optional: labels and Discussions

### Labels

A helpful default taxonomy (run from a `gh`-authenticated shell):

```bash
gh label create "good first issue" --color "7057ff" --description "Friendly starter task" --repo <your-org>/copilot-ramp-playbook
gh label create "help wanted"      --color "008672" --description "Maintainers welcome help here" --repo <your-org>/copilot-ramp-playbook
gh label create "walkthrough"      --color "0e8a16" --description "New or expanded walkthrough"   --repo <your-org>/copilot-ramp-playbook
gh label create "content-fix"      --color "1d76db" --description "Typo, link, terminology, etc." --repo <your-org>/copilot-ramp-playbook
gh label create "tooling"          --color "5319e7" --description "Build, CI, scripts"            --repo <your-org>/copilot-ramp-playbook
gh label create "bug"              --color "d73a4a" --description "Something is broken"           --repo <your-org>/copilot-ramp-playbook
gh label create "needs-triage"     --color "fbca04" --description "Awaiting maintainer review"    --repo <your-org>/copilot-ramp-playbook
gh label create "dependencies"     --color "0366d6" --description "Dependabot updates"            --repo <your-org>/copilot-ramp-playbook
```

### Discussions

**Settings → General → Features → Discussions: ON**. The issue-template `config.yml` already links a
**💬 Discussions** entry; once Discussions is enabled, that link goes live.

---

## 8. Renaming the project later (optional)

The display name "Copilot Ramp Playbook" lives in a small set of places, and the repo slug
`copilot-ramp-playbook` lives in the URLs. To rename later:

1. **Repo slug** — Settings → Rename. GitHub auto-redirects old URLs.
2. **Display strings** — `mkdocs.yml` `site_name`, `README.md` H1 + intro, the same string in
   `CONTENT-MODEL.md`, `GO-PUBLIC.md`, and tooling comments. `git grep -n "Copilot Ramp Playbook"`
   finds them all.
3. **Slug-bound** — `mkdocs.yml` `site_url` / `repo_url` / `repo_name`, `overrides/main.html` feedback
   links, the `docs/whats-new.md` repo link, examples in `GO-PUBLIC.md`, and (optionally)
   `tooling/screenshots/package.json` `name`.
4. The Pages URL changes to match the new slug; update any external links.

---

## Handoff: what you do vs. what I can do for you

You (humans-only):
- Create the org, transfer + rename the repo, invite maintainers, accept invites.
- Replace the **`<conduct-contact@example.com>`** placeholder in `CODE_OF_CONDUCT.md` and the
  **`<security-contact@example.com>`** placeholder in `SECURITY.md` with real, monitored addresses.

I can run for you, once `<your-org>` exists and you've shared the maintainer GitHub handles:
- The slug/URL substitutions in step 3 (mechanical find-and-replace, opened as a PR).
- The branch-protection `gh api` call from step 5.
- The label set from step 7.
- Filling out `MAINTAINERS.md` with real names.

Just point me at the org and the maintainer list and I'll open the PR.
