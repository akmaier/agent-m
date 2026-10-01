---
id: MOD-bridge-mail
title: Speaks IMAP and SMTP in the bridge, over TLS, holding the password for one request
withdrawn: 2026-10-01
replaced_by: MOD-mailbox
realises: []
follows:
  - ARC-012
  - ARC-014
uses: []
provides: []
---
# MOD-bridge-mail Speaks IMAP and SMTP in the bridge, over TLS, holding the password for one request

## Withdrawn

Merged into MOD-mailbox: IMAP/SMTP in the bridge and Microsoft Graph are the two routes of ARC-014 behind one mail interface; the bridge side's handlers are the mailbox's `mailRoutes`. The identifier is not reused; the text this file held is in the git history of this path.

## Responsibility

See MOD-mailbox.

## Interfaces

None; see MOD-mailbox.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — withdrawn in the leaner architecture of the architecture review, as the PO approved it (UC-023); open until accepted.*
