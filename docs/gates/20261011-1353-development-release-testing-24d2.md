---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2a8781242091d151acc5fda4d9e8acd0f78deb09
  - https://github.com/akmaier/agent-m/pull/361
date: 2026-10-11 13:53 UTC
---
# Development → Release testing: ITM-315

**REGISTER**

## Reason

ITM-315, pull request #361 by developer-sonnet-c into `sprint/team1/15`, on head `2a87812`, against the item and
MOD-source-register's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `75e1536`, holds only `tests/source-register-findings.test.mjs`, and CI was red on it (run
  38144263069): node failed on exactly its 4 tests — 1367 tests, 4 failed.
- CI is green on the head (run 38144485458, its second attempt): node 1367 tests, 0 failed; python 441 tests, OK. The
  first attempt's node job failed in TST-276001 alone, MOD-desktop-shell's test of the real Electron entry, which timed
  out waiting for Electron; it passed in the red run and on the rerun of the same commit.
- Only MOD-source-register's folder — `sourceFindings` in `index.mjs`, with `entryNamed` and `linkOf` taken out of
  `linkedVersion` as they stood, its tests unchanged and green — and the new test whose header names the module change;
  no existing test or expected result changes. `finding` is MOD-text-tools', as the module file's uses state.
- The 4 new tests name `A REQUIREMENT HAS A REGISTERED SOURCE` and MOD-source-register, with 14 counter-proofs.
- The Acceptance holds: `Vibe Coding, ch. 9` names the entry titled Vibe Coding, and `SRC-x, Art. 13` names SRC-x; a
  requirement whose only item names an entry the product does not link, and one whose item names no entry, each give the
  error with its line and items; a requirement with one linked item among others gives none.

Noted for the sprint's review, no condition of this gate: the four readings the pull request names — a linked source as
an entry the links file holds a row for, without the version `linkedVersion` asks for; a requirement with no source item
reported; the requirement's name as the finding's artifact; `sourceFindings` in `index.mjs` — and that over this
repository the 406 requirements give no finding. MOD-desktop-shell's tests failed CI twice today without a change of
theirs (#324, #361), which the Scrum Master proposes as an item.
