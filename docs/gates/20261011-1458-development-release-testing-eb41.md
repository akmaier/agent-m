---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 009eaf7d54e2ac0a06f637e77abf02d3e649d427
  - https://github.com/akmaier/agent-m/pull/367
date: 2026-10-11 14:58 UTC
---
# Development → Release testing: ITM-335

**REGISTER**

## Reason

ITM-335, pull request #367 by developer-sonnet-d into `sprint/team1/16`, on head `009eaf7`, against the item and
MOD-artifact-edits' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `eea5906`, holds only the two new test files, and CI was red on it (run 38148489144): node failed on
  4 of their 5 tests. The second tests-only commit, `ba6b3b8`, adds the cases the faults planted on the draft left
  standing, as the team agreement asks, red on 5 tests (run 38148753264).
- CI is green on the head (run 38148968952): node 1403 tests, 0 failed; python 441 tests, passed.
- Only MOD-artifact-edits' folder — the refusal in `save.mjs`, the new `fallback.mjs`, the export and header of
  `index.mjs` — and the two new tests whose headers name the module change; no existing test or expected result changes.
- The 7 new tests name what they guard — `AN EDITED FILE KEEPS ITS IDENTIFIER`, `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE
  IS THE FALLBACK`, `NO TEXT TRAVELS IN A URL` and `A GITLAB PRODUCT IS WRITTEN WITH A TOKEN` — and MOD-artifact-edits,
  in their files' headers, with 31 planted faults recorded.
- The Acceptance holds: a use case and a module file saved under another identifier, each refused with both identifiers
  and nothing written; the same identifier saved; links that carry no text, the texts returned; `differs` once the
  branch moved, by a file removed and a file created; refused for GitLab.

`differs` reads, as the accepted signature allows, whether the default branch still has the file as the edit started:
`fallbackEditLinks` gets each file's `existing` and no version it was opened at, and returns at once, so a file changed
in place on the branch is not told apart. `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE` holds: it concerns a save
through Agent M, which `saveFile` still refuses on a changed blob; in the fallback Agent M writes nothing.

Noted for the sprint's review, no condition of this gate: UC-018 4a's warning for a file changed in place needs the
version the edit started from among `fallbackEditLinks`' inputs, a change of MOD-artifact-edits' file and a proposal for
akmaier; a test's identifier cannot be read without MOD-test-document, which the module's uses do not list, so a test
saved with an `openedId` is refused with `nowId` null; `fallbackEditLinks` reaches `webLinks` through `connect`, which
the uses do not name; and the pages stand on `main` until ITM-452, a new file's link ending `&value=`.
