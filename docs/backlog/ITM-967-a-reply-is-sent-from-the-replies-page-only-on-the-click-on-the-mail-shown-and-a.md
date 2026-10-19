---
id: ITM-967
title: A reply is sent from the replies page only on the click on the mail shown, and a mail can be left unanswered
level: module
realises:
  - UC-039
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - A SENT REPLY IS NOTED IN THE ISSUE
  - ONE CLICK PER DECISION
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-966
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-039-2, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-967 A reply is sent from the replies page only on the click on the mail shown, and a mail can be left unanswered

**REGISTER**

## Outcome

MOD-maintenance-pages.md:119-120: "*Send* with its confirmation repeating recipient and subject; a reply sent but not
noted, its note offered again; *No reply*". MOD-maintenance-pages.md:43 names `confirmDecision`, which is built
(`src/site-frame/index.mjs:30`).

UC-039.md:97-104 gives steps 5 to 7, and the alternative flows 2c, 5a and 6a (UC-039.md:138-149).

*Send* calls MOD-mail-handling's `sendReply` with the `ShownMail` the person was shown. *No reply* calls `noReply`
(ITM-953). When `sendReply` fails with `DraftChanged`, the dialog shows the draft again. A reply that was sent but not
noted is named, and its note is offered again with `noteText` and `commentOnIssue`.

## Acceptance

- Unit tests that name MOD-maintenance-pages, over a fake `sendReply`:
  - no send happens without the dialog's confirmation, and the dialog repeats recipient and subject;
  - with the confirmation, exactly one `sendReply` is made with the `ShownMail` shown;
  - after an edit, the dialog shows the edited mail before anything is sent;
  - `SendRefused` shows the server's answer and leaves the draft;
  - a failed note offers the note again;
  - *No reply* calls `noReply` once.
- Counter-proof: a *Send* that sends without the confirmation fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and the tests that name MOD-maintenance-pages change.
