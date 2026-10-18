---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 266febc81a37232a2c94985c3973c0b874c160bb
  - https://github.com/akmaier/agent-m/pull/830
date: 2026-10-18 01:09 UTC
---
# Development → Release testing: ITM-722, a group file is saved on the blob it was opened on

## Reason

ITM-722 (MOD-artifact-edits, `saveGroupFile`) is rejected on check 5, its Acceptance "a member placed twice refused with
its items". `saveFile` names the items by the first word of each AN ITEM HAS ONE PLACE IN ITS HIERARCHY finding's `what`.
A requirements group file names its members by name, with spaces (MOD-group-document). So
`saveGroupFile(host, { kind: "requirements", … })` with one requirement listed twice returns
`{ refused: "not one place", items: ["AN"] }`. This was replayed on the head.

The other checks hold:
1. The first commit, f081eaf, holds only the test file, and CI is red on it (node (4)).
2. CI is green on 266febc.
3. Only `src/artifact-edits/save.mjs`, `src/artifact-edits/index.mjs` and the new
   `tests/artifact-edits-group-file.test.mjs` changed. `saveFile`'s "not one place" refusal is in the module file's
   Interfaces, and the item realises the requirement. No existing caller saves a group file, and no fixture or
   expected result changed.
4. TST-722001 to TST-722004 name the requirements they guard and the module. Five counter-proofs were replayed, and
   each fails its test: an extra path in the commit, `openedBlob` passed as null, the refusal disabled, the items
   hard-coded, and the blob comparison disabled. A fault that also fails other tests still counts as a counter-proof.

Release and system tests: the 14 files importing artifact-edits were run with `node --test` after the CI install. There
were 103 tests: 101 passed, 0 failed, and 2 are known TODO findings.

Two other findings, for the rework. "not one place" checked before "changed meanwhile" agrees with "before anything is
read from the host". `docs/groups/<name>.md` of no known kind now throws NotAGroupFile, which is not among `saveFile`'s
errors.
