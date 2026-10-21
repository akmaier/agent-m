---
id: ITM-1168
title: A run's log the server no longer keeps is marked in a test's history
level: module
realises:
  - UC-029
modules:
  - MOD-trace-pages
builds_on:
  - ITM-767
tests:
  - unit
origin:
  - ITM-767's pull request #1262 (sprint team1/102), from developer-sonnet-c's report
---
# ITM-1168 A run's log the server no longer keeps is marked in a test's history

**REGISTER**

## Outcome

UC-029 5b: "The CI server no longer keeps the logs of older runs. The outcomes stay in the history — they are read from
the result records on the branch `test-results` (UC-028) — and only the link to the full log is marked *no longer
available*." It is cut from ITM-767.

## Not ready: it begins with a draft for akmaier

Whether a log is still kept is told by MOD-repository-hosts' `ciRunLog(id)`, which gives `null` once the server no longer
keeps it (MOD-repository-hosts.md:242). The texts leave two things open:
- MOD-trace-pages' uses do not name `ciRunLog`;
- a mark of the history names its run only through a result record's optional `run` address, and not by the run's id.

The draft, of MOD-trace-pages, names `ciRunLog` among its uses, and says how a mark finds the id of its run.

## Acceptance

- On fixtures, a mark whose run's log the server no longer keeps keeps its outcome, and its link reads *no longer
  available*. Counter-proof: a mark whose log is kept links to it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft is on `main` as `122034cd`** (MOD-trace-pages, by developer-sonnet-c). The item is built once it is accepted.
