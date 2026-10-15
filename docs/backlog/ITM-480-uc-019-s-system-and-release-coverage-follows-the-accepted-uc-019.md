---
id: ITM-480
title: UC-019's system and release coverage follows the accepted UC-019
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
builds_on:
tests:
  - system
  - release
origin:
  - UC-019 as akmaier accepted it at 7efc99a2 (93452ad0, the prompt bar of UC-049)
  - TST-377001 and TST-377101 failing on main at 7e893c63
---
# ITM-480 UC-019's system and release coverage follows the accepted UC-019

**REGISTER**

## Outcome

On `main` at `7e893c63`, `node --test tests/system-uc-019-change-by-prompt.test.mjs` fails TST-377001: its
`FLOW_EVIDENCE` names passages of UC-019 that akmaier's accepted change of UC-019 removed — "presses **Change by
prompt**", "The author writes the instruction", "shows for each where it processes data", "The run panel shows the
destination", "The author does not press Run", "The participant is a CI agent", "presses **Refine**". Every pull
request's CI into a sprint's branch therefore fails. `node --test tests/release-uc-019-change-by-prompt.test.mjs` fails
TST-377101: UC-019's `realises` names `THE PAGE NAMES WHERE IT SENDS` in place of the withdrawn `THE PAGE STATES WHAT IT
SENDS WHERE`, and adds `A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON`; that test runs on the pull
request of a sprint's branch into `main`.

Afterwards UC-019's system and release coverage follows the accepted UC-019: every passage the system test names stands
in UC-019; each flow whose executable evidence still holds keeps it; each flow the accepted text changed and that has no
executable evidence yet — among them the instruction written in the prompt bar (steps 1 to 3), **Send** (step 5, 5a), a
follow-up instruction in the prompt bar (step 8) and the work handed to GitHub Actions (6b) — is marked as a pending
finding of the test, `{ todo: "FINDING <id> — <what is missing>" }` (`docs/instructions/developers.md`, An item of
release or system tests), never pointed at evidence of the replaced behaviour — *Change by prompt*, the run panel's
*Run*, *Refine*, a CI agent as the participant, the instruction among a commit's provenance lines. The release test
names every requirement UC-019 realises, each with executable evidence or as such a pending finding. The prompt bar's
flows are built by ITM-503 to ITM-507; each finding names what is missing.

## Acceptance

- Both test files pass on `main` but for their pending findings, each named in the pull request.
- Each kept piece of evidence is read and asserts nothing the accepted UC-019 replaced; the pull request names, for each
  flow, whether it kept its evidence or became a finding, and why.
- A counter-proof: a passage planted that UC-019 does not hold fails TST-377001, and a requirement left out of the release
  test's list fails TST-377101.
- Only test files change; their author implemented none of UC-019's behaviour (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`).
