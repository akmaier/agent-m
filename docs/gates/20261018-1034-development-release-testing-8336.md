---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1bd1fe548a0d512176c08031cf7cc3d07d738557
  - https://github.com/akmaier/agent-m/pull/882
date: 2026-10-18 10:34 UTC
---
# Development → Release testing: ITM-903, the tunnels runtime tests run in parallel without a fixed port or a shared cache

**REGISTER**

## Reason

ITM-903 (MOD-tunnels), pull request #882 into `sprint/team2/91`, passes on `1bd1fe54`.

**The checks:**
1. **The first commit.** `ae04d9df` is empty and records the flake: 28 of 60 parallel runs failed with EADDRINUSE on
   `1f0e1ef0`. The item changes no behaviour, only how two tests prepare their fixtures. So `AN IMPLEMENTATION JOB BEGINS
   WITH A FAILING TEST` (SPEC.md:1426), which covers a job "that adds or changes behaviour", does not apply. A red CI
   run was not possible either, because the failure needs parallel runs on one host and CI makes one run. ITM-653 was
   different: there the fault could be made deterministic (`onComputer` fails while an ask still runs), so its first
   commit was red. Here the load runs below take the place of the red run, as at ITM-902's gate.
2. **CI.** Run 39119288695 is green on the head.
3. **Scope.** Only `tests/tunnels-runtime.test.mjs` and `tests/release-itm-286-tunnels-runtime.test.mjs`, both headed
   MOD-tunnels. Only fixture lines changed: three remote ports now come from a listen on port 0, and the release
   file's cache folder is now `agent-m-286-release-ssh2-1.17.0`. No identifier, input or `expect:` line changed.
4. **New tests.** None. The counter-proof the Acceptance asks for was replayed (below).
5. **Acceptance.**
   - `grep -nE '4200[0-9]|4520[0-9]'` finds nothing in the two files on the head. The known positive: on `1f0e1ef0`
     it finds 3 lines.
   - The 11 `ssh2Cache` folders under `tests/` are all different.
   - Load runs on the head, with `LC_ALL=C` after `npm install --prefix src/bridge-build --omit=dev --ignore-scripts`:
     6 runs of each file at once, so the two files also run together, in 5 rounds. 0 of 60 runs failed.
   - Counter-proof, replayed: with `42003` put back in TST-286003, 7 of 60 runs failed, each one TST-286003 with
     "EADDRINUSE: address already in use 127.0.0.1:42003".
   - One run of `tests/ssh2-fixture.test.mjs`, `tests/release-sprint-02-d-traceability.test.mjs` and both files: 28 of
     28 pass.

**The other fixed ports.** I checked three of the developer's readings myself:
- 44005 (TST-286005): the fake server's request handler is `(a,r)=>{requests++;allow?a():r()}`. It accepts without a
  listen.
- 45107 to 45109 (TST-286007): the handler is `(a,r,n)=>n==="tcpip-forward"?a():r()`, with no listen.
- 41001 (TST-286001): there is no SSH server. For a reverse plan, `src/tunnels/index.mjs:98` only calls `forwardIn`. The
  local listen at `:110` is in the forward branch.

None of these ports is ever bound.

**Listen on 0, read the port, close.** This leaves a short window in which another process can take the port. The
system hands out ephemeral ports in turn, so in that window another process would have to get the same port. The
same file already uses this pattern in `closedPort()` (`:54`) and in TST-286007's `reserved`, so it follows AGENTS.md
§6a.1. The only way to close the window entirely would be to let the fake SSH server bind port 0 itself. But the plan's
`remotePort` is the test's input and appears in the expected state name, so that would change the input, which the
Acceptance forbids. The pattern is robust enough here.

**The merge.** The sprint's head is `5a86fdf1`, with main merged in. `git merge-tree` merges the head into it with no
conflict. Since `1f0e1ef0`, the sprint has changed neither of the two files, nor `src/tunnels/`, `src/bridge-http/` or
the ssh2 helper.
