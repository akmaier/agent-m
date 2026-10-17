---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - abc6212baae686de529681547eb3e6b6828a10bc
  - https://github.com/akmaier/agent-m/pull/782
date: 2026-10-17 21:34 UTC
---
# Development → Release testing: ITM-826, the main page reads the repository in batches

**REGISTER**

## Reason

ITM-826, pull request #782 into `sprint/team1/77`, at head `abc6212b`. It follows the rejection on `681137fa`
(`docs/gates/20261017-2127-development-release-testing-64c7.md`). Run 39071284320 passed ten of ten. GitHub was still
computing mergeability after ITM-830's merge, and the Scrum Master checks it before merging.

**The rejection is met.** The one commit after `681137fa` changes only the tests: +29/−6 in
`progress-measures-batches.test.mjs` and its helper.
- The fake can serve a `test-results` branch. Without it, it answers as before, so TST-826001 to 005 keep their counts.
- TST-826006 asserts that `results` is that branch's snapshot, with its ref, its two paths and its own commit. The count
  is 20 requests, the 19 of TST-826001 plus the branch's tree, and the branch's files are not read.

**No red, read correctly.** The rejection said both that the test is written first and run red, and that the code needs no
change unless the test shows a fault. The code was right, so the test could not be red against it. The counter-proof
stands in for the red, as planted faults have before: with `resultsBranch` returning `null`, TST-826006 and 001 fail.
The restored code passes all six.

**Everything accepted at the first gate stands:**
- both scopes batched: the scope `all` takes 53 requests with a token, and the scope `work` falls from 2,049 to 38;
- the six sources built, and the rest of `Facts` named as unknown (ITM-843);
- four further planted faults caught;
- no release result changed.

**Open.** The pull request's body still describes `681137fa`. It is brought up to date before the merge, naming TST-826006
and the new head.
