---
id: ITM-1397
title: A person's SPEC edits of one day collect in one queue
level: module
realises:
  - UC-018
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
modules:
  - MOD-review-pages
builds_on:
  - ITM-376
tests:
  - unit
origin:
  - UC018-F1, TST-376206 and TST-376320 of ITM-376's system and release tests of UC-018 (#1682), ruled at its gate in team1's sprint 142 (docs/gates/20261101-1637-development-release-testing-0376.md)
---
# ITM-1397 A person's SPEC edits of one day collect in one queue

**REGISTER**

## Outcome

`A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE`: a SPEC edit saved on the dashboard is added to the person's newest queue of
the same day that has no accepted entry yet. The requirement's editor hands `proposeSection` the token's name as the
person (`src/review-pages/edit.mjs:96`, `person: token?.name`, for example "Agent M · library"). MOD-spec-changes'
`openQueueIn` compares that name with the account that created each queue (`creatorOf`, `src/spec-changes/propose.mjs:354`).
Nothing matches, so every edit opens a new queue: `2026-11-01b_…/01` where `2026-11-01_…/02` is expected. A second edit
of the same section adds a queue instead of replacing its entry.

## The reading taken

A queue's person is the account that created its index. So the editor hands the account of the token, as the host names
it, not the token's name.

## Waiting for akmaier

The page can reach no account of the token. MOD-repository-hosts' Interfaces offer no function that names it, and its
`RepositoryInfo` and `Credentials` carry none. The stored token holds `{ value, name, expires, stored }`. So nothing the
page reaches names the account before the first save.

Readings sought and not taken:
- the instance's owner, which is right only on a person's own fork;
- the account learnt after the first save, which the page forgets on reload;
- the queue's title, since the default token name is shared between people.

The general change is a function of MOD-repository-hosts that names the account a token belongs to (on GitHub, `GET /user`'s
login), named in MOD-review-pages' Uses. On GitLab, `HistoryEntry.author.account` is always `null` (`gitlab.mjs:261, 276`),
so the same change serves its queues. `requirements-draft.mjs:75` and `entry-edit.mjs:72` hand the token's name the same
way.

## Acceptance

- Two SPEC edits of one person on one day are entries of one queue. A second edit of the same section replaces its entry.
  Counter-proof: another person's edit opens a queue of its own.
- TST-376206 and TST-376320 lose their `todo` in a commit by a participant other than the implementer, written after the
  code is pushed. TST-376320 is a release test.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
