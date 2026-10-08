---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - a3fb60230c01e45e749d78cbef48dfda6fc8d563
  - https://github.com/akmaier/agent-m/pull/204
date: 2026-10-07 21:25 UTC
---
# Development → Release testing: corrected ITM-207 early main promotion

**REGISTER**

## Reason

Passed: merge only this exact head into main under akmaier's explicit ITM-207 early-main instruction and Sprint09's
Explicit early promotion to main procedure. This promotes the independently approved ITM-273 correction of that
module, not another sprint increment. po-sol implemented none of the code/tests; the cherry-picked commits retain
original developer-terra-a (gpt-5.6-terra) provenance. Scrum Master executes the approved exact-head merge.

Read original AGENTS/SPEC requirements, accepted UC-001/MOD-settings-pages, Team 2 declaration, selected corrective
item and early-promotion record, full live PR body, both commits and full two-file diff. Corrective PR203 passed
its independent gate in main commit1f13a55b082d876cf85b67bb02a348d5b28e5713 on f2fae096990446b407460e5e75de6565a92b8296,
then merged into sprint/09 at dbc5317. The promotion has no new behaviour. Verified both blobs are byte-identical
to that approved head: products.mjs569be4b037434a46b764566b39dd771523df6be9 and its test97484f473971a770884ead0218d135bf8c389b9d.
Its merge base732aa02cb940446e11b5c16a61962e8ef9d5c956 contains Sprint12's merge. Current main's subsequent PO gate
record is preserved by the merge; no other team's implementation or declaration is overwritten.

Actual first-test/red evidence is the original corrective tests-only8943e37e7f39ee2183c199c42a946d650267f4ce,
run37687960674, directly verified at the correction gate: TST-276/277 each observe1 repository request instead of0.
Original final corrective run37688330461 is green; its individual actual guard-removal and reverse-guard counterproofs
are recorded in PR203 and the correction gate. The live promotion body cites these corrective records. This
cherry-pick retains those tests/proofs and all existing assertions, with the explicitly allowed trusted-person
fixture-input correction and public view route. Re-read final live status: promotion run37689003740 is completed
SUCCESS on the named head, Node113024073790 and Python113024074117. The source correction's green CI alone would
not suffice for this main decision.

Only src/settings-pages/products.mjs (owned Step C guard) and tests/settings-pages-add-product.test.mjs (owned module
header, unchanged expected results, TST-276/277/278) differ from main. No endpoint259/260/264/265 work, migration187,
new catalogue code, other Sprint09 implementation, architecture or SPEC changes enter main. The concrete path is
Step C listener:342 → isTrusted guard:343 → reviewLayoutCommit:350 → rememberProduct:351: untrusted input returns
before both write boundaries; trusted GitHub/GitLab positives still commit and remember the product.

This approves corrected module code only. It neither closes Sprint09 nor establishes the usable dashboard/whole
UC-001: separately reviewed migration187 and independent245/release evidence remain necessary. No deployment,
process amendment or acceptance of an architecture proposal is implied. Any head change needs a fresh decision.
