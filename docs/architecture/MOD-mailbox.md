---
id: MOD-mailbox
title: A mailbox read without changing it, reply drafts stored, released mails sent — over Microsoft Graph from the browser, or over IMAP and SMTP inside the bridge
realises:
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - UC-037
follows:
  - ARC-003
  - ARC-012
  - ARC-014
uses:
  - MOD-bridge-server.bridgeClient
provides:
  - MAIL_SCOPES
  - signIn
  - mailbox
  - mailRoutes
---
# MOD-mailbox A mailbox over Microsoft Graph or over IMAP and SMTP in the bridge

## Responsibility

Adapter. The two mail routes of ARC-014 behind one mail interface — list the `Message-ID`s of named
folders, read one mail by identifier without changing it, find mails by the hashes of their
identifiers, store a draft replying to a mail, send a draft the person released: over Microsoft Graph from
the browser for Microsoft 365, and over IMAP and SMTP inside the bridge for every other mailbox, Gmail
included with an app password. The browser side reaches the bridge through the generic bridge client; the
bridge side provides the mail routes the bridge app mounts. The connection, the password or the sign-in
token are passed in by the caller and handed back to be kept — this module reads and writes no store, and
the bridge side keeps the password only for the request that carried it.

## Interfaces

- `MAIL_SCOPES -> ["Mail.ReadWrite", "Mail.Send", "offline_access"]` — the constant scope list, the narrowest Microsoft Graph offers for reading, creating drafts and sending (ARC-014); the sign-in step names each before Microsoft's window opens.
- `signIn(clientId, redirect) -> { token, refreshToken, expires }` — the authorization-code flow with PKCE (Web Crypto) for a `spa` redirect to the instance's Pages address, requesting `MAIL_SCOPES` and nothing else; the tokens are returned to the caller, who keeps them; an expired refresh token leads to a new sign-in in Microsoft's window.
- `mailbox(connection, secret, bridge) -> { listIds(folders), read(id), find(hashes), draft(mail), send(draft, confirmation) }` — the one mail interface over either route: reads use `GET` or `EXAMINE` and `BODY.PEEK` only and never modify a message; `find` hashes the `Message-ID`s of the named folders and answers *not found in the mailbox* rather than guess; a draft is stored as a reply in the folder marked *Drafts*; `send` sends only the draft the person released — on the bridge route with a single-use confirmation naming the SHA-256 of exactly that mail; the provider token goes only to Graph and Microsoft's token endpoint, the password only inside a request to the bridge.
- `mailRoutes() -> { "POST /mail/read", "POST /mail/find", "POST /mail/draft", "POST /mail/send" }` — the bridge side: the handlers the bridge app mounts; each opens the connection over implicit TLS or STARTTLS and refuses to send `LOGIN` or `AUTH` otherwise, takes connection and password from its body and drops them when it returns, logs request names and outcomes only, and on send refuses a missing, reused or mismatching confirmation; a copy of a sent mail goes to *Sent*.

## Testing

Component tests on both routes against local test servers: a test IMAP and SMTP server without TLS gets
no login, a read issues no `STORE`, `COPY`, `MOVE`, `EXPUNGE` and no non-peek `FETCH`, and after a run with a
marker password no file and no log line contains it (`tests/test_bridge_mail.py`); a fake Graph API
records that reads modify nothing, that the requested scopes are exactly `MAIL_SCOPES`, and that no
request elsewhere carries the token (`tests/test_mail_routes.py`). Every outgoing request of a full mail
run is recorded, and the password appears only in requests to the bridge address
(`tests/test_mail_password_route.py`). The seams are `fetch`, the TLS socket and the clock. Whether the
chosen IMAP and SMTP libraries run in the compiled bridge is ARC-014's open measurement. No model is
involved.

*Drafted on 2026-10-01 by Claude (claude-opus-5-5) for the Agent M repository at commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): MOD-mail-api, MOD-bridge-mail and the mail flow's mailbox in one adapter, reading no store; open until accepted.*
