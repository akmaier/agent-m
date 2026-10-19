---
id: ITM-1008
title: A commit a job made after its cancel is flagged, and its revert offered
level: module
realises:
  - UC-036
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-runtimes
  - MOD-main-page
builds_on:
  - ITM-972
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-5, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1008 A commit a job made after its cancel is flagged, and its revert offered

**REGISTER**

## Outcome

UC-036:150-152 (6a): "If the job later pushes anyway, Agent M flags the commit as written after the cancel, and offers
to revert it." MOD-runtimes.md:187-188 states that `liveState` reports "a commit the job's branch got after a cancel …
in `writtenAfterCancel` (UC-036)". The code gives `[]` always: `src/runtimes/index.mjs:78`, "no way to read a branch's
commits is among this module's Uses".

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-runtimes.md:215-219:

> - `revertAfterCancel(record: JobRecord, product: { host: Host }, commits: string[], head: string) -> Promise<{ commit:
>   string }>` — on a person's click, one commit on the job's branch, on the head that was read, with the person's token:
>   every file the given commits changed gets back its text from before the first of them (`readFileAt`), and a file they
>   added is removed. Only commits `liveState` reported in `writtenAfterCancel` are accepted; any other is a `TypeError`.
>   Fails as `commitFiles` fails, `Moved` among them (UC-036 6a).

## Acceptance

- A fixture branch with a commit after the record's `cancelled` end is reported in `writtenAfterCancel` and flagged on
  the job's page with *Revert*; a branch without one reports none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
