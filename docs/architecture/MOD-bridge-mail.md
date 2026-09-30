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

The IMAP and SMTP route of ARC-014, inside the bridge. It is given the password with each request and
forgets it with the request; it writes nothing to disk.

**Current state.** No code exists; the IMAP and SMTP libraries are chosen in ARC-014, subject to the
measurement named there.

## Interfaces

- `mailRoutes() -> { "POST /mail/read", "POST /mail/find", "POST /mail/draft", "POST /mail/send" }` — the route handlers the bridge app mounts; each takes connection and password in its body and drops them when it returns.
- `imapRead(conn, folders) -> [{ messageId, headers, text, attachments }]` — `EXAMINE` and `BODY.PEEK` only; no `STORE`, `COPY`, `MOVE`, `EXPUNGE`; login only after implicit TLS or STARTTLS.
- `imapFind(conn, folders, messageIdHashes) -> [mail | "not found in the mailbox"]` — lists `Message-ID`s of the named folders and matches their hashes.
- `imapDraft(conn, mail) -> { uid }` — `APPEND` to the folder marked `\Drafts`, with `In-Reply-To` and `References` of the reporter's mail.
- `smtpSend(conn, mail, confirmation) -> { sent }` — only with a single-use confirmation naming the SHA-256 of exactly this mail; a reused or mismatching one sends nothing; a copy goes to *Sent*.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
