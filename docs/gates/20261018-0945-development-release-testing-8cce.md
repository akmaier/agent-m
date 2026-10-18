---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f7567bc756426f52c062516a2104e726c4c9198a
  - https://github.com/akmaier/agent-m/pull/875
date: 2026-10-18 09:45 UTC
---
# Development → Release testing: ITM-653, The bridge-jobs tests hold under load

**REGISTER**

## Reason

ITM-653 (MOD-bridge-jobs, tests only). Its pull request #875 into `sprint/team2/90` passes on `f7567bc7`. On this head
it changes only `tests/bridge-jobs-agents.test.mjs`, whose header names `Module: MOD-bridge-jobs`. It changes how the
test prepares and tears down its fixture, and no `expect:` line.

- **CI.** The tests-only commit `60939207` is red (run 39115721144): TST-472080 fails "the test returned while an ask
  it started still ran". The head is green (run 39116187808) on the merge "Merge f7567bc7… into 9a7edee2…", and
  `9a7edee2` is the sprint's head. `ce5c034d` was also green, but `f7567bc7` came after it, so this decision is on
  `f7567bc7`.
- **The ENOTEMPTY cause.** I verified it at ITM-880's gate from job 117634976800, and the item records it. The fix
  removes it: `onComputer` now fails while an ask the test posted still runs, and TST-472080 and TST-472082 wait for
  their asks to be done before the folder is removed.
- **Acceptance.**
  - Ten runs beside the full node suite. On the head, with `LC_ALL=C` after the npm install, I started the full node
    suite. Beside it, 10 in parallel, I ran 20 runs of each file:
    - `bridge-jobs-agents`: 20 of 20 pass;
    - `bridge-jobs-endpoint-ask`: 20 of 20 pass.
  - A planted delay beyond the bound fails the wait. I put a 65 s `sleep` before the fixture opencode's first line, and
    TST-472082 fails "waited for the first ask to start". The known positive: a 7 s delay passes.
  - The first commit holds only tests and is red. No stub is committed.
- **Counter-proofs, replayed on the head.**
  - Removing the second ask's wait fails TST-472080 every run, with the `onComputer` message.
  - Removing the first ask's wait fails TST-472082 in 2 of 5 runs. The ask is often done already.
- **The 60 s bound.** Neither SPEC.md nor MOD-bridge-jobs.md has a sentence that fixes how long an ask may take to
  start. So the bound only ends a wait that can never be met. It stays inside `A PULL REQUEST'S CI RUNS WITHIN TWO
  MINUTES`. Ch. 13 places timing failures under load among interface defects. The planted delay above shows that the
  bound still fails.
- **endpoint-ask.** `ce5c034d` widened its bound although no failure had been reproduced, against AGENTS.md §6a.3.
  `f7567bc7` puts the file back as it is on the sprint branch, and the pull request says the failure from ITM-598's
  gate was not reproduced. That is right. The file passes under load as it stands.
- **`A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY`** (SPEC.md:1550-1553). It requires the product to show a test as
  flaky when both outcomes are recorded on one commit, and its check is `tests/review-core.test.mjs`. It asks this item
  for no record of a flake and nothing more.
- **Release tests (agreement 83).** The changed test file itself and `release-sprint-02-d-traceability`: 20 of 20 pass.
- **Seen beside the load runs, outside this item.** In the full node suite under that load, 2 of 4313 tests failed, both
  in files this pull request does not touch: TST-321001 (`tests/agent-processes-321.test.mjs`) and TST-320321902 (`tests/release-itm-320-321-agent-processes.test.mjs`).

**For the retrospective: reading before the work.** The developer started without reading SPEC.md, MOD-bridge-jobs.md
or ch. 13, which AGENTS.md §1 requires for tests. The work shows the gap twice:
- the endpoint-ask bound was widened without a reproduced failure;
- the bound's counter-proof was a 7 s delay against the old 5 s bound, not a delay beyond the new bound, as the
  Acceptance asks.

After being sent back, the developer read MOD-bridge-jobs.md and ch. 13 in full, and reverted endpoint-ask. Of SPEC.md
they read only four sentences. Ch. 9, 11 and 12 they read by search only. AGENTS.md §1 requires SPEC.md in the
original, and ch. 9, 11, 12 and 13 for code work. For this tests-only item, ch. 13 is required.
