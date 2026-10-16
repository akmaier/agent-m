---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4e55469eaa520b174b213460118ecd30824aa3ba
  - https://github.com/akmaier/agent-m/pull/595
date: 2026-10-16 14:56 UTC
---
# Development → Release testing: ITM-547, An entry reads its environment on GitLab CI

**REGISTER**

## Reason

ITM-547, pull request #595 into `sprint/team1/46`, at head `4e55469e`. developer-sonnet-b wrote it, as `46.md` assigns.
It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `46.md`, MOD-workflow-entries and `compose.mjs` as read
in full.

1. **The tests-only commit is red.** `e5558c6a` was pushed alone. Run 38918909846 failed on that commit: node (6) has
   exactly TST-547001–004, 006 and 007 failing, on behaviour (`'github' !== 'gitlab'`). TST-547005, the GitHub path, is
   the known positive and passes there.
   - The code commit also changes TST-547006 and 007. They now read the pushed commits from the bare origin instead of
     the clone, as the GitHub tests do.
   - The diff between the two commits changes no expected value, only where the commits are read from.
   - Both tests were already red on the base.
2. **CI is green on the head**: run 38919582389, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** `src/workflow-entries/compose.mjs` (MOD-workflow-entries) and the new
   `tests/workflow-entries-gitlab-547.test.mjs`.
   - `ciEnvironment` chooses `gitlabEnvironment` where `GITLAB_CI` is `true`. Otherwise it runs the earlier body unchanged,
     as `githubEnvironment`, with only the key parsing moved into `keysOf`.
   - No function of another module is called, and no request is added.
   - `product.mjs` and `instance.mjs` are untouched.
   - The 15 test files that name MOD-workflow-entries, among them the release and system tests of UC-004, UC-006, UC-010
     and UC-019, give 91 pass, 0 fail and 13 todo, as on the base.
4. **The tests name their requirement and module, and each fault is caught.** Each of 13 planted faults is caught, and
   each test states its environment and its expected values in its own text.
5. **The Acceptance holds.** A GitLab environment gives:
   - the service `gitlab`;
   - the event `CI_PIPELINE_SOURCE`, with the inputs `job`, `task` and `endpoint`, each held only where not empty;
   - `CI_PROJECT_DIR`, `CI_PROJECT_URL`, `CI_COMMIT_REF_NAME` and `CI_COMMIT_SHA`;
   - `../instance` as the instance's folder, `GITLAB_USER_LOGIN` as the actor and `CI_PIPELINE_URL` as the run's address;
   - no summary file and no workflow token.

   Without `GITLAB_CI`, a GitHub environment is read as before.

The GitLab template does not yet set the `AGENT_M_INPUT_…` variables, and runs `onDispatch` only for `web`. That is
ITM-532's, in MOD-runtimes, as both items state. Until it is merged, the inputs on GitLab stay empty.
