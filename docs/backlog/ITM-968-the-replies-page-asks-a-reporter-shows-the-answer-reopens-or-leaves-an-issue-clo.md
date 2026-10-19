---
id: ITM-968
title: The replies page asks a reporter, shows the answer, reopens or leaves an issue closed, and closes and replies
level: module
realises:
  - UC-039
  - AN ISSUE WAITING FOR A REPORTER IS LABELLED
  - A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
  - A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-967
  - ITM-581
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-039-3, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-968 The replies page asks a reporter, shows the answer, reopens or leaves an issue closed, and closes and replies

**REGISTER**

## Outcome

MOD-maintenance-pages.md:120-122: "*Ask the reporter* and *Send and wait*; removing the label `waiting-for-reporter`;
*Reopen* and *Leave closed* for a mail that arrived in a closed issue's thread; *Close and reply*".
MOD-maintenance-pages.md:151-152 names the host functions: "`setIssueState` — *Close and reply*, *Reopen*;
`setIssueLabels` — the label `waiting-for-reporter` removed".

UC-039 gives the alternative flows 2a (`:132-134`), 1a with a question written by hand (`:150-153`), 1b (`:154-156`) and
7a (`:157-159`).

*Send and wait* calls MOD-mail-handling's `askReporter` (ITM-953). A question drafted by a participant is NEW-039-4 (a proposal in docs/measurements/2026-10-18_uc-036-049-gaps-and-proposals.md).

## Acceptance

- Unit tests that name MOD-maintenance-pages, over a fake host and a fake `askReporter`:
  - *Ask the reporter* opens a question draft, and *Send and wait* sends only after the confirmation;
  - the issue then stays open;
  - an issue under *answer received* shows the new mail and offers to remove the label, ask again or close;
  - a mail in a closed issue's thread offers *Reopen* and *Leave closed*, and only *Reopen* calls
    `setIssueState(…, "open")`;
  - *Close and reply* closes the issue and shows its drafts.
- Counter-proof: a page that reopens an issue without the click fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and the tests that name MOD-maintenance-pages change.
