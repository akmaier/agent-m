---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0a13cf169f83591b8ea9da3cf7f461dd49e56558
  - https://github.com/akmaier/agent-m/pull/578
date: 2026-10-16 12:43 UTC
---
# Development → Release testing: ITM-495, A conversation's work is handed over to CI or a Bridge

**REGISTER**

## Reason

ITM-495, pull request #578 into `sprint/team1/42`, at head `0a13cf16`. developer-sonnet-c made the three commits. It
lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `42.md`, MOD-runtimes and UC-049 as read in full.

1. **The red commit.** The tests-only commit `680faee9` was pushed alone, and CI was red on it (run 38900967882). It failed
   on exactly the item's 14 tests, 13 of them at the missing export. The stub run is recorded: with `handOverJob` throwing,
   all 14 fail on behaviour. TST-495015 came with the code, with its own counter-proof.
2. **CI is green on the head**: ten of ten jobs, run 38902342998. Locally, the tests of the module and its use cases, the
   release and system tests among them, give 217 passing, none failing, 13 `todo`. The two Python failures are the known
   `test_bridge_mail` cases, the same on the base.
3. **The changes stay in the item's scope.**
   - `src/runtimes/`: the new `hand-over.mjs`, plus `ci.mjs`, `bridge.mjs`, `index.mjs` and `workflow/github.yml`.
     `queueOnCi`'s result is unchanged.
   - Two new test files and a fixture file, which name MOD-runtimes.
   - No existing test changed. TST-472724 holds, since `job` stays the template's first input.
4. **The new tests.** TST-495001 to TST-495015 state their values in their own text. Twelve planted faults are recorded
   in #578.
5. **The Acceptance holds, with the values the start decision named.**
   - Each route commits the record without the task's words and starts the run with them.
   - A refused start after the commit ends the record as failed with the server's reason.
   - Blocking, not-fitting and `before-write` jobs are refused before anything is written.
   - A task planted in the record is found.

**The workflow's identifier, settled from the code at the send-back.** `startWorkflow` gets `agent-m-jobs.yml` on GitHub.
MOD-repository-hosts' GitHub adapter puts the identifier into `…/actions/workflows/<id>/dispatches`
(`src/repository-hosts/github.mjs`), and the settings pages pass a file name alone
(`src/settings-pages/library.mjs`). TST-495010 states it, and the full path fails it.

**The readings named in #578 are within the accepted texts.**
- The findings are `Finding`-shaped objects, since MOD-runtimes' Uses names no MOD-text-tools.
- A tab route, an empty task, or a Bridge route without a Bridge is a `TypeError` before anything is written.
- The failed end follows `runOnTab`'s form.
- `endpoint` holds the kind, the address and the model, never a key.
- Reading the inputs on the entry's side is MOD-workflow-entries' (ITM-498).

Noted, not this item's:
- On a GitLab product the server's refusal ends the record as failed until ITM-532.
- `src/runtimes/tab.mjs` imports MOD-job-ledger's `jobCost`, which MOD-runtimes' Uses does not name. The code is right:
  an end records its cost. The module file lacks the line, so it is drafted for akmaier's acceptance on `main`; no item
  is needed.
