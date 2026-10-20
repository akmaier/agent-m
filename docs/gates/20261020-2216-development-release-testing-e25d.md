---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0f3c431f2fc259e2ff4ede6cb5f3f5fd9cd65535
  - https://github.com/akmaier/agent-m/pull/1254
date: 2026-10-20 22:16 UTC
---
# Development → Release testing: ITM-1162, the HTTPS reverse tunnel test waits on its condition

**REGISTER**

## Reason

ITM-1162, pull request #1254 into `sprint/team2/100`, passes on `0f3c431f`. CI is green on 23 of 23 checks (run
39506285163).

1. **The item is read again, on i's finding.** TST-294001 never failed. The full job logs (jobs API) give it `ok 14` in both
   cited runs, and the shards failed on ITM-587's and ITM-655's new tests. The item's Outcome and Acceptance are corrected
   in it, and so are the gate records of #1237 and #1244.
2. **What stands, and is met.** The fixed 2 s wait (`:102`) becomes a wait on the tunnel's condition, with an 8 s bound,
   well within the job's two minutes.
   - **Red:** `14174ab5` slows both servers by 2.5 s and fails the old wait (run 39506108495, node (3): "reverse tunnel did
     not become open").
   - **Green:** `0f3c431f` passes with the same slowing kept in the counter-proof.
   - **Time:** node (3) took 57 s, and TST-294001 33.2 s, up from 23.9 s.
3. **The 20 runs** of the earlier Acceptance were to show a flip gone. There was none, so they are not asked, and no agent
   waits on CI for them. The nightly run keeps reading the test.
4. **Counter-proof 3**, the early exit of a dead server, has no fault run. The pull request says so.
   - It is one `throw` in the test's own helper, not a case the item states.
   - So it is noted and not asked.
   - **The faulted child now takes 8 s.** That is the bound, and it is counted in the shard's 57 s.
5. **Scope.** Only `tests/component-itm-294-https-reverse-tunnel.test.mjs` changes, at level `component`, naming MOD-tunnels.
   The traceability and test-level release runs on the head pass, by i's run.
6. **A lesson for every gate.** `gh run view --log` can cut a job's log short. A failure is named only from the full log
   (`gh api repos/<repo>/actions/jobs/<id>/logs`). The known positive is a test's `ok` line in the same log.
