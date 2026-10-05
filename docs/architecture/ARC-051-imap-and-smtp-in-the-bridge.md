---
id: ARC-051
title: IMAP and SMTP in the Bridge
refines: ARC-037
forced_by:
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN
  - A REPLY IS THREADED ON THE REPORTER'S MAIL
  - A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-037
  - UC-038
  - UC-039
---
# ARC-051 IMAP and SMTP in the Bridge

## Context

Every mailbox except one on Microsoft 365 is reached through the Bridge, over IMAP and SMTP (`A MAILBOX IS REACHED
THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE`, UC-037). Reading changes nothing in the mailbox — no mail marked
as read, moved, flagged or deleted (`READING THE MAILBOX CHANGES NOTHING IN IT`). A login goes to a server only over
implicit TLS or STARTTLS (`THE MAIL SERVER IS REACHED ONLY OVER TLS`), and the password is held only for the request that
carried it, never in a file or a log line (`THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST`). A reply is
stored as a draft in the mailbox's Drafts folder, threaded on the reporter's mail, sent only with a single-use
confirmation of the exact mail shown, and a copy kept in Sent (UC-039). A mail is named and found again by the SHA-256 of
its `Message-ID`, or of its bytes when it has none (`A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER`, `A MAIL IS FOUND AGAIN
BY ITS IDENTIFIER`).

A mail is parsed — headers, text, attachments — on both routes: in the Bridge for IMAP, and in the page for a mail that
Microsoft Graph returns in its raw form (MOD-mail-routes).

## Decision

MOD-mail-protocols speaks IMAP with **imapflow**, SMTP with **nodemailer**, and parses mails with **postal-mime**.

- **imapflow.** Every folder is opened with its `readOnly` option, which "uses IMAP EXAMINE instead of SELECT"; a draft
  is stored with its `append`. The connection is either implicit TLS (`secure: true`) or `doSTARTTLS: true`, which
  upgrades "using STARTTLS before authentication" and "fails if STARTTLS is not supported" — so no login ever travels in
  clear. Its built-in logger is switched off with `logger: false` (its documentation). MOD-mail-protocols offers no
  operation that sets, removes or changes a flag.
- **nodemailer.** A mail is sent either over implicit TLS (`secure: true`) or with `requireTLS: true`, under which "if
  the server does not support STARTTLS, sending fails with an error"; its `inReplyTo` and `references` are set from the
  reporter's `Message-ID`, which "helps email clients thread conversations together"; its logging stays off, which is
  its default (its documentation). The draft stored with imapflow and the mail sent are the same bytes, whose SHA-256 the
  confirmation names.
- **postal-mime**, "an email parsing library for Node.js, browsers (including Web Workers), and serverless
  environments", with no dependencies (its README and registry entry). One parser serves MOD-mail-protocols in the Bridge
  and MOD-mail-routes in the page (`DON'T REPEAT YOURSELF`).

## Alternatives

- **imap** (node-imap) for IMAP. Its last release is from 2016, and its registry entry names no licence (the package's
  own licence file is MIT). Rejected: no release in almost ten years.
- **emailjs-imap-client** for IMAP. Its last release is from 2020. Rejected for the same reason.
- **emailjs** for SMTP. MIT, maintained, without dependencies, but adopted by a small fraction of nodemailer's users
  (below), and nodemailer already gives the threading headers. Rejected.
- **mailparser** for parsing. MIT and maintained, but an "email parser for Node.js", whose own README asks new projects
  to consider PostalMime, "which works in both Node.js and browser environments". It would serve the Bridge's route only.
  Rejected.

## Due diligence

Agent M's own licence is MIT (its `LICENSE` file). Adoption is the package's downloads from the npm registry between
2026-09-05 and 2026-10-04. Releases count every version the registry lists, and in brackets those without a pre-release
tag. Issues are those of the source repository the registry names.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| imapflow — chosen | MIT | yes | 2019-12-19 | 2.2.5, 2026-10-04 | 267 (267) | 0 / 214 | 12,050,703 | [1] | 2026-10-05 |
| nodemailer — chosen | MIT-0 | yes | 2011-01-21 | 10.0.15, 2026-10-05 | 324 (294) | 1 / 1,509 | 98,330,026 | [2] | 2026-10-05 |
| postal-mime — chosen | MIT-0 | yes | 2021-01-12 | 4.0.4, 2026-10-03 | 60 (59) | 0 / 45 | 42,203,112 | [3] | 2026-10-05 |
| imap | none in the registry entry; MIT in the package's licence file | yes, by its licence file | 2011-04-10 | 0.8.19, 2016-12-06 | 54 (54) | 165 / 585 | 2,211,300 | [4] | 2026-10-05 |
| emailjs-imap-client | MIT | yes | 2016-01-15 | 3.1.0, 2020-02-14 | 20 (17) | 29 / 100 | 29,172 | [5] | 2026-10-05 |
| emailjs | MIT | yes | 2011-02-23 | 5.0.3, 2026-08-26 | 78 (78) | 0 / 236 | 179,113 | [6] | 2026-10-05 |
| mailparser | MIT | yes | 2011-09-14 | 3.9.36, 2026-10-05 | 153 (153) | 1 / 289 | 23,917,173 | [7] | 2026-10-05 |

No candidate is marked: every licence is known to be compatible with MIT.

The registry lists one and the same maintainer, `andris`, for imapflow, nodemailer, postal-mime and mailparser.

Where each fact was read — from a registry entry: licence, first release (`time.created`), latest release
(`dist-tags.latest` and its time), releases (`versions`), dependencies and `maintainers`; adoption from the downloads
address; open and closed issues as `total_count` of the two searches:

- [1] https://registry.npmjs.org/imapflow · https://api.npmjs.org/downloads/point/last-month/imapflow ·
  https://api.github.com/search/issues?q=repo:postalsys/imapflow+is:issue+is:open and `+is:closed` · its documentation:
  https://imapflow.com/docs/api/imapflow-client and https://imapflow.com/docs/guides/configuration
- [2] https://registry.npmjs.org/nodemailer · https://api.npmjs.org/downloads/point/last-month/nodemailer ·
  https://api.github.com/search/issues?q=repo:nodemailer/nodemailer+is:issue+is:open and `+is:closed` · its
  documentation: https://nodemailer.com/smtp and https://nodemailer.com/message
- [3] https://registry.npmjs.org/postal-mime · https://api.npmjs.org/downloads/point/last-month/postal-mime ·
  https://api.github.com/search/issues?q=repo:postalsys/postal-mime+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/postalsys/postal-mime/master/README.md
- [4] https://registry.npmjs.org/imap · https://api.npmjs.org/downloads/point/last-month/imap ·
  https://api.github.com/search/issues?q=repo:mscdex/node-imap+is:issue+is:open and `+is:closed` · the package's licence
  file: https://unpkg.com/imap@0.8.19/LICENSE
- [5] https://registry.npmjs.org/emailjs-imap-client ·
  https://api.npmjs.org/downloads/point/last-month/emailjs-imap-client ·
  https://api.github.com/search/issues?q=repo:emailjs/emailjs-imap-client+is:issue+is:open and `+is:closed`
- [6] https://registry.npmjs.org/emailjs · https://api.npmjs.org/downloads/point/last-month/emailjs ·
  https://api.github.com/search/issues?q=repo:eleith/emailjs+is:issue+is:open and `+is:closed`
- [7] https://registry.npmjs.org/mailparser · https://api.npmjs.org/downloads/point/last-month/mailparser ·
  https://api.github.com/search/issues?q=repo:nodemailer/mailparser+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/nodemailer/mailparser/master/README.md

## Consequences

- The mail route of the Bridge rests on three packages with one maintainer in common — one person's maintenance, as
  UC-040 would call a bus factor of one for a resource. The due diligence is read again before a release of the Bridge
  moves to a newer version of any of them.
- nodemailer and postal-mime are licensed MIT-0, which asks for no attribution; imapflow's MIT licence travels with the
  Bridge's files.
- imapflow brings eight dependencies of its own, among them a logger; it is switched off, and no request body or
  password is ever logged by the Bridge.
- MOD-mail-routes loads postal-mime in the page from its vendored copy of the package's folder of ECMAScript modules
  (`dist/esm/`, in the package's file list at https://unpkg.com/postal-mime@4.0.4/?meta, read on 2026-10-05); the package
  has no dependencies, so no build step is needed.
