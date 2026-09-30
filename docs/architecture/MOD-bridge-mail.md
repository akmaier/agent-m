---
id: MOD-bridge-mail
title: Speaks IMAP and SMTP in the bridge, over TLS, holding the password for one request
realises:
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN
  - A REPLY IS THREADED ON THE REPORTER'S MAIL
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - UC-037
  - UC-038
  - UC-039
follows:
  - ARC-012
  - ARC-014
uses: []
provides:
  - mailRoutes
  - imapRead
  - imapFind
  - imapDraft
  - smtpSend
---
# MOD-bridge-mail Speaks IMAP and SMTP in the bridge, over TLS, holding the password for one request

## Responsibility

The IMAP and SMTP route of ARC-014, inside the bridge, for every mailbox that is not Microsoft 365 —
Gmail included, with an app password, since Gmail refuses the account password over IMAP. It is given
the password with each request and forgets it with the request; it writes nothing to disk.

**Current state.** No code exists. ARC-014 chooses imapflow and nodemailer, whose maintainer supports
Node only; whether they run in the compiled bridge is ARC-014's open measurement 1, and the fallback —
a small IMAP client over `Deno.connectTls` and `@upyo/smtp` — is named there. The interfaces below do
not depend on which is used.

## Interfaces

- `mailRoutes() -> { "POST /mail/read", "POST /mail/find", "POST /mail/draft", "POST /mail/send" }` — the route handlers the bridge app mounts; each takes connection and password in its body and drops them when it returns.
- `imapRead(conn, folders) -> [{ messageId, headers, text, attachments }]` — `EXAMINE` and `BODY.PEEK` only; no `STORE`, `COPY`, `MOVE`, `EXPUNGE`; login only after implicit TLS or STARTTLS.
- `imapFind(conn, folders, messageIdHashes) -> [mail | "not found in the mailbox"]` — lists `Message-ID`s of the named folders and matches their hashes.
- `imapDraft(conn, mail) -> { uid }` — `APPEND` to the folder marked `\Drafts`, with `In-Reply-To` and `References` of the reporter's mail.
- `smtpSend(conn, mail, confirmation) -> { sent }` — only with a single-use confirmation naming the SHA-256 of exactly this mail; a reused or mismatching one sends nothing; a copy goes to *Sent*.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
