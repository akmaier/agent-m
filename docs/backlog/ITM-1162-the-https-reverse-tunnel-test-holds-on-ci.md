---
id: ITM-1162
title: The HTTPS reverse tunnel test holds on CI
level: component
realises:
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
modules:
  - MOD-tunnels
builds_on:
tests:
  - component
origin:
  - CI of #1238 (run 39497075384) and of #1244's tests-only commit a564bce8 (run 39501135594), node (3), sprint team2/98 and 99 (agreement 94)
---
# ITM-1162 The HTTPS reverse tunnel test holds on CI

**REGISTER**

## Outcome

TST-294001 (`tests/component-itm-294-https-reverse-tunnel.test.mjs`) failed twice in node (3), on commits that do not
touch it. In run 39497075384, on #1238's `c02a910f`, its own retry printed `# fail 1`, then `# fail 0`, and the job failed.
In run 39501135594, on `a564bce8`, it failed the same way.
- In both runs, the job's log ends after that test, with no summary of the shard's other files.

**First task:** name, from the test's own steps, what it waits on when it fails: the Apache or nginx start, the TLS
handshake, or the tunnel. No change comes before the cause is named.

## Acceptance

- The cause is named as a data-flow path, with the run that showed it.
- The test waits on a condition, not on time, and holds in 20 runs of its shard.
- The shard's log carries the summary of every file it runs.

**Read again (team 2's sprint 100, po-opus-b), on developer-sonnet-i's finding at #1254: the premise does not hold.**
- **TST-294001 passed in both runs cited above.** The full logs from the jobs API give `ok 14` in job 118884784296 of run
  39497075384 and in job 118898619301 of run 39501135594.
  - Those shards failed on ITM-587's and ITM-655's new tests.
  - The `# fail 1`, then `# fail 0`, are the counter-proof's faulted and restored child runs (`:259-280`).
  - i surveyed 60 runs and found no `not ok` for TST-294001. The known positive is that the same pattern matches the
    `ok` lines.
- **What stands.** The test waited a fixed 2 s for the tunnel (`:102`).
  - On a fixture whose servers start 2.5 s late (`14174ab5`), it fails: run 39506108495, "reverse tunnel did not become
    open".
  - So this item now asks only that the test wait on its condition, with a bound below the job's budget.
  - The 20 runs were to show a flip gone. No flip was shown, so they are not asked. The nightly run keeps reading the test.
- **Acceptance, as it now reads:**
  - The wait is on the tunnel's condition, with a bound.
  - A fixture slowed past the old wait fails the old wait and passes the new.
  - The shard stays within its budget.
