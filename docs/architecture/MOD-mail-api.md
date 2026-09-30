---
id: MOD-mail-api
title: Signs in to Microsoft 365 and calls Microsoft Graph's mail API from the browser
realises:
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - UC-037
  - UC-039
follows:
  - ARC-003
  - ARC-005
  - ARC-014
uses:
  - MOD-settings-store.browserStore
provides:
  - signIn
  - apiMailbox
  - MAIL_SCOPES
---
# MOD-mail-api Signs in to Microsoft 365 and calls Microsoft Graph's mail API from the browser

## Responsibility

The web-API route of ARC-014, for Microsoft 365 only; Gmail and every other mailbox go through the
bridge (MOD-bridge-mail). It keeps no token of its own — the settings store holds it — and sends it
only to Microsoft.

**Current state.** No code exists.

## Interfaces

- `MAIL_SCOPES -> ["Mail.ReadWrite", "Mail.Send", "offline_access"]` — the constant scope list, the narrowest Microsoft Graph offers for reading, creating drafts and sending (ARC-014); its test compares the requested scopes with exactly this list, and the sign-in step names each before Microsoft's window opens.
- `signIn(clientId, click) -> { token, refreshToken, expires }` — the authorization-code flow with PKCE (Web Crypto) for a `spa` redirect to the instance's Pages address, requesting `MAIL_SCOPES` and nothing else; the tokens are stored through the settings store; an expired refresh token (after 24 hours) leads to a new sign-in in Microsoft's window.
- `apiMailbox(token) -> { listIds(folders), read(messageId), find(hashes), draft(mail), send(draftId, click) }` — the mail interface of ARC-014 over Microsoft Graph; reads use `GET` only and never modify a message; a draft is created as a reply to the reporter's mail in *Drafts*; the token goes only to Graph's and Microsoft's sign-in origins.

Uses, as declared above: `MOD-settings-store.browserStore`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
