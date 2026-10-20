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
