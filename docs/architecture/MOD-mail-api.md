---
id: MOD-mail-api
title: Signs in to Microsoft 365 and Gmail and calls their mail APIs from the browser
realises:
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
---
# MOD-mail-api Signs in to Microsoft 365 and Gmail and calls their mail APIs from the browser

## Responsibility

The web-API route of ARC-014. It keeps no token of its own — the settings store holds it — and
sends it only to its provider.

**Current state.** No code exists.

## Interfaces

- `signIn(provider, clientId, click) -> { token, expires }` — Microsoft: authorization code with PKCE (Web Crypto) for a `spa` redirect; Gmail: the implicit flow in a popup; the scope list is a constant checked by a test; the token is stored through the settings store.
- `apiMailbox(provider, token) -> { listIds(folders), read(messageId), find(hashes), draft(mail), send(draftId, click) }` — the mail interface of ARC-014 over Microsoft Graph or the Gmail API; reads never modify a message; the token goes only to the provider's API origin.

Uses, as declared above: `MOD-settings-store.browserStore`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
