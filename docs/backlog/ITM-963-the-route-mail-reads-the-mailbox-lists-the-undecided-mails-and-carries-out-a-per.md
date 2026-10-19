---
id: ITM-963
title: The route mail reads the mailbox, lists the undecided mails, and carries out a person's decision on each
level: module
realises:
  - UC-038
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - MAIL STAYS IN THE MAILBOX
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-952
  - ITM-581
  - ITM-962
tests:
  - unit
  - component
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-038-2, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-963 The route mail reads the mailbox, lists the undecided mails, and carries out a person's decision on each

**REGISTER**

## Outcome

MOD-maintenance-pages.md:112-116 (blob `acdb0521`, accepted): "`mail` — *Read mailbox*; the mails no issue lists and
nobody marked *not an issue*, with sender, subject and date in this browser only; ... per mail, the mail in full beside
the proposal, its text editable, every hit of the mail's people marked; *Create issue* — only without a hit —, *Add to
#n*, *Not an issue*." Parts: "`mail.mjs` — reading mail into issues" (:91).

This item builds `index.mjs` (the `view` with the route `mail`) and `mail.mjs`, without participants: UC-038 steps 1-3,
7-9 and 4b (UC-038:158, "the author can still decide each mail by hand in step 7, with an empty proposal"). It calls
`readNewMail` and `decideMail` (ITM-952), `personHits` to mark hits, `mailbox` and `signIn` of MOD-mail-routes.

Reading of step 10 (UC-038:124-125, "the dashboard offers **Propose SPEC change** (UC-012)"): after *Create issue* of kind
*change*, the page links the issue's route `issue/<number>`, where MOD-maintenance-pages.md:107-110 drafts the change.
No other text is needed.

Alternative flows: 2a (UC-038:153, the reason named, nothing read), 6a (:168, hit marked, *Create issue* disabled until
edited out), 7a (:178, the author's choice is written), 7b (:180, *Create issue* once per concern, each listing the same
identifier), 8a (:182, token or permission named, nothing written).

## Acceptance

- Unit and component tests that name MOD-maintenance-pages, over a fake mailbox, fake hosts and a fake browser store:
  - *Read mailbox* lists only undecided mails, with sender, subject and date; a known-thread mail is shown under its issue;
  - a hand-written text with the sender's name shows the hit and *Create issue* is disabled; without it, one click creates
    one issue with the chosen label and the `Mails:` line;
  - *Add to #n* and *Not an issue* each take one click; a marked mail is not listed on the next read;
  - 7b: two issues from one mail both list its identifier;
  - an unreachable mailbox and a refused token are named, and nothing is written;
  - a created *change* issue links `issue/<number>`;
  - every step carries its folded explanation (`EVERY STEP EXPLAINS ITSELF`).
- Counter-proof: a page that enables *Create issue* with a hit fails.
- No mail text, sender or address is written to any repository request (checked on the fake hosts).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and the tests that name MOD-maintenance-pages change.
