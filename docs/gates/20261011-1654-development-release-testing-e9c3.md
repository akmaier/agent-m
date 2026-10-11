---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 04a03940e62ee81f36beec7effeed098cb110e68
  - https://github.com/akmaier/agent-m/pull/382
date: 2026-10-11 16:54 UTC
---
# Development → Release testing: ITM-395

**REGISTER**

## Reason

ITM-395, pull request #382 by developer-sonnet-d into `sprint/team1/17`, on head `04a0394`, against the item and
MOD-artifact-edits' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `78b1bd9`, holds only `tests/artifact-edits-several.test.mjs`, and CI was red on it (run
  38157028545): node failed on 5 of its tests. The second tests-only commit, `81112b3`, adds what the faults planted on
  the draft left standing, red on 6 (run 38157126944).
- CI is green on the head (run 38157148375): node 1514 tests, 0 failed; python 441 tests, OK.
- Only MOD-artifact-edits' folder — `saveFile` over several edits and `keptIdentifier` in `save.mjs`, the export of
  `index.mjs` — and the new test whose header names the module change; no existing test or expected result changes.
- The 7 new tests name what they guard — `AN EDITED FILE KEEPS ITS IDENTIFIER`, `A SAVE IS REFUSED WHEN THE TEXT CHANGED
  MEANWHILE` and `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT` — and MOD-artifact-edits, in their file's header,
  with 18 planted faults recorded.
- The Acceptance holds: two files in one commit; one changed meanwhile refusing both; the trailers at the end of the
  message and none in the files; a changed `id` restored; a kept one unchanged; a single edit saved as before.

Noted for the sprint's review, no condition of this gate: the readings the pull request names — the trailers of all
edits once each, the blobs as a list for a list of edits, an empty list and a path given twice not refused, and
`keptIdentifier` setting back only an `id` line that stands.
