---
id: ITM-952
title: New mail is read without the decided ones, and a person's decision on a mail is carried out
level: module
realises:
  - UC-038
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
  - A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
  - A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE
modules:
  - MOD-mail-handling
builds_on:
tests:
  - unit
origin:
  - akmaier's question of 2026-10-18 whether team 2 can work on topics independent of team 1; MOD-mail-handling is accepted and not built (no src/mail-handling/)
---
# ITM-952 New mail is read without the decided ones, and a person's decision on a mail is carried out

**REGISTER**

## Outcome

MOD-mail-handling is accepted at blob `be10efd1` (`docs/approvals/MOD-mail-handling-be10efd16704.md`), and its folder
`src/mail-handling/` does not exist. This item builds its part `intake.mjs` and the interface's first half, as
MOD-mail-handling.md:74-94 states them:
- `NewMail`, `readNewMail(mailbox, products, marked)`: "reads the named folders without changing anything, names each
  mail by its identifier, reads the issues of every product and the identifiers they list, and leaves out every mail an
  issue lists or this browser marked *not an issue*". "A mail whose `In-Reply-To` or `References` names a listed mail is
  attached to that issue at once — a `mail-added` note —, without any participant"; "a closed issue stays closed".
- `MailDecision`, `decideMail(mail, decision, host)`: "*create* searches the title and text once more for the mail's
  people and refuses on a hit, then creates the issue ... labelled `defect` or `change`, its text ending with the mail's
  identifier; *add* lists the mail on an existing issue by a `mail-added` note; *not an issue* adds the identifier to this
  browser's marks". Errors: `PersonFound` — nothing written —, and Access's.

The inputs are accepted interfaces. Each is called through its fake in the tests:
- MOD-mail-routes' `Mailbox` and `Mail`;
- MOD-mail-records' `listedMailIds`, `withMailIds`, `noteText`, `threadMatch` and `undecided` (built,
  `src/mail-records/index.mjs`);
- MOD-personal-data's `peopleIn` and `personHits` (built);
- MOD-repository-hosts' `listIssues`, `createIssue` and `commentOnIssue`;
- MOD-browser-store's `readSetting` and `writeSetting`.
The host's issue functions are not built in `src/repository-hosts/` yet (ITM-581). The tests use a fake host of the
accepted signatures (MOD-repository-hosts.md:231-235), as other modules' tests do.

**Independent of team 1** (agreement 91). MOD-mail-handling uses none of the modules team 1's sprints 91 and 92 hold or
claim, and none of them uses it. It reads MOD-repository-hosts, MOD-browser-store, MOD-personal-data, MOD-mail-routes and
MOD-mail-records, and changes none of them.

## Acceptance

- Unit tests that name MOD-mail-handling, over a fake mailbox, fake hosts and a fake browser store:
  - `readNewMail` leaves out a mail that an issue lists and one marked *not an issue*, and counts them in `decided`;
  - it attaches a mail whose `In-Reply-To` names a listed mail by a `mail-added` note, and a closed issue stays closed;
  - it changes nothing in the mailbox;
  - `decideMail` *create* with a person's name in the title refuses with `PersonFound` and writes nothing. Without one,
    it creates one issue labelled `defect` whose text ends with the identifier;
  - *add* writes one `mail-added` note, and *not an issue* stores the mark.
- Counter-proofs: a `readNewMail` that ignores the marks fails, and so does a `decideMail` that skips the second people
  search.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-handling/` and the tests that name MOD-mail-handling change.
