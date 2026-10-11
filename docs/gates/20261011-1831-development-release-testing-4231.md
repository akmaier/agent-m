---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 449fa419b534a2c0551e60e4794be9e1d44986b7
  - https://github.com/akmaier/agent-m/pull/396
date: 2026-10-11 18:31 UTC
---
# Development → Release testing: ITM-404, Bridges by name in the Bridge client

**REGISTER**

## Reason

ITM-404, pull request #396 by developer-sonnet-a into `sprint/team1/18`, head `449fa41`. The tests-only commits
`7672fd4` and `cc0cd83` each hold only `tests/bridge-client-bridges-by-name.test.mjs`, and CI was red on each (runs
38163744547, 38163784896): its eight tests fail, and no other test does. CI is green on `449fa41` (run 38163919400,
1642 tests, 0 failures). The code changes only `src/bridge-client/`; the new test names MOD-bridge-client and its
guards, and 20 planted faults are recorded. The Acceptance holds: the settings of a direct, an HTTPS and a forwarded
Bridge, `JumpHostMissing`, the name returned by `pair`, the lowest free port, and each Bridge's path in the proxy.

The readings weighed:
- `pair`: the module file types its result `{ name: string, settings: BridgeSettings }`; three existing assertions
  (`tests/bridge-client.test.mjs` lines 79 and 149, `tests/release-itm-263-bridge-client.test.mjs` line 50) expect
  `{ address, token }`, and check 3 lets no expected result change. The result carries `name` and `settings` as the
  interface states, readable by every caller written to it, beside the old fields; nothing in the texts is changed
  for it (AGENTS.md §6a.6). A plain `{ name, settings }` needs those three expected results changed, the release
  test's by a participant other than the implementer, which no implementation item may carry: noted for the review,
  with the test that pins the hidden shape (F13).
- A Bridge's name: no accepted text gives its characters. It is carried in a participant's route
  `bridge <name> agent <agent>` (MOD-participant-list), by default the computer's name (MOD-desktop-shell), and named
  by the person for one through the jump host (MOD-settings-pages); a name holding `/` or a space would break the
  path. Putting it into `/bridge/<name>` as it is follows the module file; what a name may contain is noted for the
  review and for ITM-405, where the person names it.
