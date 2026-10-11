---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0695011d3cbe670ea36987fd9e61448e07a20ead
  - https://github.com/akmaier/agent-m/pull/348
date: 2026-10-11 12:16 UTC
---
# Development → Release testing: ITM-388

**REGISTER**

## Reason

ITM-388, pull request #348 by developer-sonnet-c into `sprint/team1/14`, on head `0695011`, against the item and the
accepted files of MOD-job-runner and MOD-group-document as they stand on the sprint's branch and on `main`. All five points
hold:
- The first commit, `301cd30`, holds only `tests/job-runner-group-rules.test.mjs`, and CI was red on it (run
  38138182479): node failed on exactly its 4 tests, no module having registered `group-rules` — 1302 tests, 4 failed.
- CI is green on the head (run 38138418962): node 1302 tests, 0 failed; python passed.
- Only MOD-job-runner's folder — `builtins.mjs`, the header comment of `index.mjs` — and the new test whose header names
  the module change; no existing test or expected result changes. The check calls `parseGroupFile`, `applyMoves`,
  `hierarchy` and `traceGraph`, each among the module file's uses.
- The 4 new tests name what they guard and MOD-job-runner, and have 11 counter-proofs.
- The Acceptance holds: with a fixture snapshot, valid moves pass; a refused move goes back with its reason; a member placed
  twice and a group titled by an identifier go back; a fixed draft passes.

Noted for the sprint's review, no condition of this gate: `propose-groups`' answer schema still asks for `{ item, group }`
until ITM-396, so every move of a real answer is refused until then — no page runs the kind yet; the parameter naming the
kind is unnamed in the accepted texts, built as `kind`; a refused move is reported on the answer, at its place among the
moves; and the items read with `traceGraph` change no finding `hierarchy` reports.
