---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - d1ba93a5fef9e653c6bfd804f69eb73a5b065458
  - https://github.com/akmaier/agent-m/pull/390
date: 2026-10-11 18:48 UTC
---
# Development → Release testing: ITM-320

**REGISTER**

## Reason

PR390 into `sprint/team2/22` passes ITM-320's Acceptance and the applicable default DoD. I implemented none of this
behavior. I personally read the current original binding texts, process/model, roles/instructions, item, accepted
MOD-agent-processes/ARC-046 and approvals, affected use cases, public dependency callers, relevant guards, chapters
9–13, author receipt, changed files, commit history, vendor originals, refreshed PR description and actual CI evidence;
completed own readings were retained only at verified unchanged identities. AGENTS `92de3725` and SPEC `7a309483`
remain current. Stale REGISTER filenames supply no binding rule.

- The first commit `457440bd` is tests-only; CI 38160800394 was red at the missing-module import. Corrected tests-only
  `472441bb` was likewise red in CI 38161845594. These import failures are not behavioral counter-proofs. Subsequent
  preparation failures exposed unreadable-register refusal and inherited-key handling before this decision; their
  original outcomes remain recorded. Fixture preparation changed without weakening public answer or argv expectations.
- Only `src/agent-processes/index.mjs` (public discovery/test and private execution), `agents.md` (supported-agent
  data), `agents.schema.md` (owned schema), and new `tests/agent-processes-320.test.mjs` (named module, five guarded
  cases and CI fault harness) change. Existing tests and expected results are unchanged. Team1/18 holds
  ITM-318/322/349/355/403/404/419/423; the unchanged shared dependencies and MOD-agent-processes scope remain clear.
- Discovery starts only register version/login checks, reports missing installations and named login steps without
  requesting a password. Register data determines vendor arguments, output and credential names. OpenCode uses a
  positive credential count and JSON text events, with no invented universal credential variable. The public
  `testAgent` success/failure union and public Documents register loading conform to their accepted interfaces.
- Concrete failure paths are verified at their nodes: discovery → missingAgent → false installed state (001,
  test:54); loginMatches → loggedIn (002, test:79); testAgent → ownLoginEnvironment → invoke/spawn → controlled task
  (003, test:103); failed task → refusal union (004, test:127); corrupted Command header → readRegister rows[] → owner
  load refusal (005, test:149). The local environment omits register-declared credential names before reading remaining
  values, preserving ordinary PATH/login. Bypassing that omission sends the constructed key to the task, producing
  exit 64/answered:false instead of the unchanged expected success. Disabling owner validation makes corrupt import
  succeed instead of refusing it.
- I decoded the original five raw receipts and read all five canonical records published at `309d59ff`. Each unique
  source fault produces the relevant AssertionError/status 1; source/test/fault hashes match, exact restored bytes match
  the original source hash, and the same selected case passes/status 0 afterward. Signals and execution errors are null,
  with ordered fault/restoration/positive timestamps. These are behavioral failures, not compile/import failures.

CI 38164653625 succeeds: Node 1528 passed, zero failed, eight existing TODOs; Python 441 successful. Jobs 87/58 seconds,
within the 120-second bound. Actual checkout `375042dc7b2379982b32ca47925030c079c2f989` has parents `9fba8fd2` and the
approved head; its entire tree `0ae75eb2e89d8921cb1871a57e9ec998b2753abd` equals that head. Immutable test-results
`53736ddddcbf7c0a2c0d7046efb7c5b77b14ba19`,
`runs/375042dc7b2379982b32ca47925030c079c2f989/20261011-1838-pull-request-c312.md`, retains 1977 outcome rows and
the raw proofs. I reviewed checkout pins, selected outcomes/proofs and runner totals/status/durations; the complete
unchanged raw log remains retained, without a claim of reading every log line. Live PR metadata confirms this exact
head and both successful checks. Verification uses controlled Ubuntu CI fixtures; no real vendor/account execution
or local runtime occurred. This decision accepts the selected Source scope, not agentDriver, Bridge wiring or whole
use cases. Root must publish these gate bytes before commenting or merging exactly the named head.
