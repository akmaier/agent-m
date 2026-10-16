---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 9dea8d1a50dcfc3578a459c1d1a137b76a79a082
date: 2026-10-16T06:17:48Z
---
## Reason
ITM-523; https://github.com/akmaier/agent-m/pull/550; write-tests job JOB-20261016-0612-587e, separate manual parent run JOB-20261016-0612-69ff. Developer-sol-c (gpt-6.1-sol); independent decider po-sol (Product Owner; gpt-6.1-sol) authored none of the source or tests checked.

PASS exact head 9dea8d1a50dcfc3578a459c1d1a137b76a79a082 into sprint/team2/63 at actual target 2b99284b8bccb076d18180a476929aabd0a7abbf ONLY, after this canonical record is published unchanged. Single commit, exactly that parent. No Release testing -> Sprint review pass, main increment merge, Review/Retro authorship or human artifact acceptance.

Read the full PR body, commit, complete changed file, exact CI and full raw local TAP/pins. Canonical ITM-523 blob88a72db9d59fd8f3ef657fc011653e1c0ff1a8c7/Selection36384662ec0525a2492419d2f22c02a30d6d5b1a precede Startsbbccc7147090bdf66246808ecb311acb661644d2 and Takenb1b9b031ac50324a6fda0c69c32a13f5fda8f125. Accepted MOD-tunnels blob0d7ed13e3e793bf081636b53c1ae64c7f15485f9 and binding SPEC/PO rules remain unchanged from original readings. Original run7b63 Start/works_on is not extended. C did not implement the key behaviour; original source job JOB-20261009-1630-c284 names developer-terra-c.

Only tests/release-itm-284-tunnels-key.test.mjs changes, six insertions/three deletions, entirely fixture preparation within selected MOD-tunnels ownership. runtime:29/30 chooses existing staged src/bridge-build/node_modules/ssh2/package.json, or the original temporary node_modules path when absent. The selected NODE_PATH reaches the byte-identical 1.17.0/version/key-correspondence positive script and unchanged ordinary child -> real public ensureKey. A failed positive propagates through unchanged runtimeFailure; it never triggers fallback. The original temp npm-install fallback remains when staged ssh2 is absent; its new execution is not claimed.

Independently compared bytes: header unchanged; positive script unchanged; child function and all subsequent case bodies unchanged; production and workflow trees unchanged. All IDs/levels/inputs/expected results/product/security assertions survive. No source/helper/workflow/manifest/lock/other-file edit or new test. The applicable implementation first-red and new-test counter-proof rules introduce no new obligation for this existing-test preparation job.

Local raw TAP06:13:30-06:13:33Z shows TST-284901/902/903 all pass:3 pass/0 fail/0 skipped/0 cancelled/0 TODO. Existing CI install command succeeded. Node25.9.0 darwin/arm64, isolated C worktree; source, changed test, manifest/lock, workflow, actual untracked staged-package JSON and executor hashes independently verified. The selected staged package is exactly1.17.0. Changed test blob01a7c0d693e00670102aa7af00d0eff3b652075e; SHA-25673126ea3c7c0d1a04c4eda8d378f8a4ffaf86d6e5ab63c9cafae5bc344b5cf68. Full raw /private/tmp/agent-m-itm523-job587e-raw-tap-pins.json; SHA-256 f3cca2a7a6f5a9b7be089bf2b39b0baa70685ca90c000caa5184e867714099f9.

CI38860112577 belongs to the exact head: all10 jobs completed SUCCESS, longest55s. This actual result supersedes the PR body's stale pending sentence. Sprint-target CI still excludes release files; local3-case success plus that sprint run supports only this test-adaptation merge. Prior Release rejection65793682 remains immutable until a later decision on actual repaired new-head all-level PR549 evidence. Prior source gates remain unchanged; no product defect, flaky baseline, paid service, new test or additional counter-proof is claimed. Recheck if exact head or actual target changes.
