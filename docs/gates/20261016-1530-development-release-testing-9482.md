---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6a555b7ae271341af1ee97863eebca408b4ea922
  - https://github.com/akmaier/agent-m/pull/597
date: 2026-10-16 15:30 UTC
---
# Development → Release testing: ITM-532, The GitLab job pipeline takes a hand-over's inputs

**REGISTER**

## Reason

ITM-532, pull request #597 into `sprint/team1/46`, at head `6a555b7a`. developer-sonnet-c wrote it, as `46.md` assigns.
It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `46.md`, MOD-runtimes, MOD-workflow-entries, `ci.mjs`
and both templates as read in full, and `compose.mjs` up to line 140.

1. **The tests-only commit is red.** `0a63d547` was pushed alone. Run 38922733489 failed on it: node (0) has exactly
   the changed TST-472723 and TST-532101–105 failing, on behaviour.
2. **CI is green on the head**: run 38924065872, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** `src/runtimes/ci.mjs`, `src/runtimes/workflow/gitlab.yml` (MOD-runtimes)
   and `tests/runtimes-workflow.test.mjs`.
   - Of the existing tests, only TST-472723 changes, as the item names. Its expected result is now the header and the
     include with its inputs. The diff removes no other assertion.
   - TST-472724 and TST-472727 are untouched and pass.
   - No other module is called in code. The local runs of the release and system tests of UC-010 and UC-019, and of
     every `runtimes-*` and `workflow-entries-*` test, give 175 pass, 0 fail and 7 todo, as on the base.
4. **The tests state their values, and each fault is caught.** TST-532104 writes the three variable names as literals
   and runs ITM-547's `ciEnvironment` on an environment built from the template. TST-532105 carries a task with quotes,
   a backslash, `$HOME`, braces and line breaks as one value, never in a file. Each of eight planted faults is caught.
   The new identifiers TST-532101–105 avoid TST-532001–007, which Team 2's tests already use.
5. **The Acceptance holds.**
   - `gitlab.yml` starts with `spec:inputs`, declaring `job`, `task` and `endpoint` with an empty default, then `---`.
   - Every job sets `AGENT_M_INPUT_JOB`, `AGENT_M_INPUT_TASK` and `AGENT_M_INPUT_ENDPOINT`, each to its `$[[ inputs.… ]]`
     as the whole value.
   - `onDispatch`'s one rule is `web` or `api`.
   - The `.gitlab-ci.yml` that `jobWorkflowFiles` writes is the same header and the include, which passes on the three
     inputs. The names are read from the template, so they are declared once.
   - It was not run on a real GitLab server. The tests check the text and the names, as the Acceptance asks.

**The developer's observation, outside this item.** The doc comment of `jobWorkflowFiles` calls `.gitlab-ci.yml` "to
be added to that file and not to replace it". MOD-test-schedule's Data says the product's `.gitlab-ci.yml` is changed
"where it is missing … every other line stays as it is", and that MOD-runtimes' job workflow "is included the same way,
by that module". Yet its one caller, `src/settings-pages/settings.mjs:714–735`, commits the file whole, which replaces a
product's own `.gitlab-ci.yml`. That was so before this item. ITM-532 changes only what that file says. It does not
hold this gate, and it is taken up as an item of its own.
