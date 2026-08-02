---
title: Secure a Studio agent with authentication
description: Secure a Copilot Studio agent with authentication so only the right people can use it and it acts as the right identity when accessing data on their behalf.
stage: studio
roles: [maker, it-admin]
tags: [studio, security, authentication, entra, identity]
level: advanced
time: 30 min
status: walkthrough
prereqs: [copilot-studio-license, entra-id-access, environment-admin]
updated: 2026-06-03
---

# Secure a Studio agent with authentication

> Make sure only the right people can use your agent — and that it acts as the right identity when accessing data or systems on their behalf.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Advanced · **Time:** 30 min

## When to use this

Your agent connects to sensitive data or performs actions in systems that require authorization. Without authentication, anyone with the agent URL can use it, and the agent can't distinguish who is asking — meaning it can't personalize answers, enforce data access boundaries, or log actions by user identity.

This walkthrough covers configuring Microsoft Entra ID authentication for a Copilot Studio agent so that users sign in before accessing it, and the agent can act on their behalf (delegated access) or with its own identity (application access).

## What you'll need

- **Copilot Studio** with admin access to the environment's security settings
- **Microsoft Entra ID** (Azure AD) — a tenant admin or app registration admin for setup
- A clear decision: **delegated** (agent acts as the user) or **application** (agent acts as itself)

## Delegated vs. application authentication

| | Delegated (user sign-in) | Application (service identity) |
|---|---|---|
| **Who the agent acts as** | The signed-in user | The agent's own app identity |
| **Data access** | What the user can see | What the service account can see |
| **Best for** | Personalized answers, user-scoped data | Automated flows, shared data |
| **Requires user to sign in?** | Yes | No |

For most agents serving internal employees, **delegated authentication** is the right choice — it enforces existing permissions and personalizes the experience.

## Step by step: Delegated authentication (most common)

### 1. Register an app in Microsoft Entra ID

In the Azure portal, go to **Entra ID → App registrations → New registration**.

- Name: `[Agent Name] - Copilot Studio`
- Supported account types: **Accounts in this organizational directory only**
- Redirect URI: `https://token.botframework.com/.auth/web/redirect`

After registration, note the **Application (client) ID** and **Directory (tenant) ID**.

Under **Certificates & secrets**, create a new client secret. Save the value — you'll only see it once.

### 2. Grant API permissions

Under **API permissions**, add the permissions your agent's downstream connectors need. Common permissions:

- `User.Read` — for basic user identity
- `Sites.Read.All` — for SharePoint content access
- `Mail.Read` — for Outlook access

Click **Grant admin consent** for each permission (requires tenant admin role).

### 3. Configure authentication in Copilot Studio

In Copilot Studio, open your agent. Go to **Settings → Security → Authentication**.

Select **Authenticate with Microsoft** (Entra ID).

Fill in:
- **Client ID:** from step 1
- **Client secret:** from step 1
- **Tenant ID:** from step 1
- **Scopes:** list the permissions you granted in step 2 (e.g., `User.Read Sites.Read.All`)

Save. The agent will now require users to sign in with their Microsoft account before they can interact with it.

### 4. Test the sign-in flow

In the Studio test panel, you'll be prompted to authenticate. Verify:
- The sign-in prompt appears
- The agent correctly identifies the signed-in user: `{System.User.DisplayName}`
- The agent's data access respects the user's permissions (not an admin's)

### 5. Use user identity in your topics

After authentication, the user's identity is available in topic variables:

- `{System.User.DisplayName}` — the user's name
- `{System.User.PrincipalName}` — the user's email / UPN

Use these in topic messages for personalization:

```
Hi {System.User.DisplayName}! Based on your access, here's what I can see for your team...
```

### 6. Set the agent's channel to require authentication

In **Channels**, for any channel where the agent is published, ensure authentication is set to **Required** — so users can't bypass sign-in by accessing the agent directly.

## Application authentication (service identity)

For autonomous agents or scenarios where no user is present, use **Service Principal** authentication instead. Register the app in Entra ID, grant application-level permissions (not delegated), and configure the agent with those credentials. Consult your IT admin for service account setup.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Role-based access:** after authentication, use the user's group membership (via a Microsoft Graph call in a Power Automate flow) to show different content to different roles.
- **Conditional access:** apply Entra Conditional Access policies to the app registration to enforce MFA or restrict access to managed devices.
- **Token refresh:** delegated tokens expire. Copilot Studio handles refresh automatically for interactive sessions — for long-running autonomous agents, use application credentials instead.
- **Audit logging:** authenticated agents generate sign-in logs in Entra ID — use these for compliance and to see who is using the agent.

## Watch out for

- **Anyone-with-the-URL access.** Unless authentication is set to **Required** on every published channel, users can bypass sign-in by hitting the agent directly. Lock down each channel, not just the test panel.
- **Over-broad API permissions.** Grant only the scopes the agent's connectors actually need — each extra permission widens what a compromised agent can reach.
- **Secret expiry.** Client secrets expire, and a delegated agent silently stops working when they do. Track the expiry date and rotate before it lapses.

## Where this leads (the ramp)

Wiring Entra sign-in into one Studio agent is the right control for an internal tool. When agents start acting autonomously across systems — with their own managed identities and token exchange — you've reached the platform-security problems Azure AI Foundry is built to handle.

> **Next:** [Foundry: govern and secure agents](foundry-govern-secure.md)

## Related

- [Test and evaluate a Studio agent before publishing](studio-test-evaluate.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)
