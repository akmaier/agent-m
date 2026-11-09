# 14. Issues, mail and personal data: a mail's places are judged by the connection it is sent to

**The change.**
- `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`: a connection that processes data elsewhere is never given the
  mails, where it named a participant; its check says so.
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`: each of the three checking participants runs on a connection at a place
  the mailbox allows, where it said at places the mailbox allows.

Their names and every other byte of the section are carried over.

**Why.** akmaier agreed on 2026-11-09 that "Place, capabilities, context, price and route leave the list", that the connections
in the browser's settings each declare "its processing place, its capabilities and the models it offers with their
context (and price where declared)", and that "a member's job runs on a connection that offers the member's model, and
the agent is started with that model" (the design quoted in full in `process-models-and-practices/01`). akmaier also named this rule among those that "stay and compare the members'/connections' models, which now
are what actually runs".

A participant no longer declares a place, so where a mail may go is decided by the connection it is sent to. The three
checkers stay three participants with three different models, and `NO CHECKER IS THE REWRITER` stays as it stands.

**Impact list.**
- `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`, changed: named by UC-037, UC-038, UC-039 and UC-049, ARC-044,
  MOD-mail-routes, ITM-067, ITM-071, and the headers of `tests/test_mail_privacy.py` and the tests of the maintenance
  pages, MOD-personal-data and the mailbox settings. UC-038 is drafted beside `process-models-and-practices/01`;
  MOD-settings-pages offers the mailbox's places from the places the connections declare.
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`, changed: named by UC-038, ARC-037, ARC-044, ARC-046, ITM-069, ITM-116,
  and the headers of `tests/test_mail_privacy.py`, `tests/maintenance-pages-propose.test.mjs`,
  `tests/personal-data-checkers-and-consent.test.mjs` and `tests/system-uc-038-turn-mails-into-issues.test.mjs`.
- It names the connection that `process-models-and-practices/01` defines (`A CONNECTION NAMES THE MODELS IT OFFERS`), and
  is accepted together with that entry or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.
