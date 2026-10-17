---
id: ITM-859
title: The process page's version comparison survives an unreadable declared commit, and ITM-780's test guards identifiers
level: module
realises:
  - UC-031
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-780
tests:
  - unit
origin:
  - po-opus-b's rejection of "Release testing → Sprint review" on #811 (sprint team2/82), record 20261017-2315 fe93, run 39077789534
---
# ITM-859 The process page's version comparison survives an unreadable declared commit, and ITM-780's test guards identifiers

**REGISTER**

## Outcome

Two release tests fail on the merge of sprint team2/82 into `main` (run 39077789534), both on ITM-780 (#807):

- **The route throws when the declared commit cannot be read.** `versionChange`
  (`src/implementation-pages/process.mjs:225`) calls `instance.host.readSnapshot(declaredCommit)` without a guard. A
  `NotFound` there propagates through `render` (:157) and `docs/assets/dashboard/process-view.mjs:30`, and the whole
  route `process` fails (`tests/release-sprint-16-practice-workflow.test.mjs:174`, ITM-281: the fixture's
  `model_version` `a1b2c3d4…` is no commit of the fixture instance).
- **ITM-780's test file guards a non-identifier.** The header of `tests/implementation-pages-model-version.test.mjs`
  says `Guards: UC-031 (6a); …`. MOD-test-document's `guards` holds requirements by name or use cases by identifier,
  so the trace graph gets the edge `-guards-> UC-031 (6a)` (`tests/release-sprint-02-d-traceability.test.mjs:334`,
  "every edge names an identifier"). It names `UC-031`.

**A reading, since the accepted texts are silent.** UC-031 6a and MOD-implementation-pages' `process` say what the
route shows when the declared version can be read and differs; neither says what it shows when the commit the
declaration names cannot be read. Read here: the route is shown as when the model is unchanged — the models, the form,
the findings, *Save* —, and in place of the comparison one line says that the version the declaration names, commit
`<model_version>`, cannot be read, followed by the host's own message. It shows no workflows, difference or findings
of the comparison. This is the form MOD-implementation-pages already uses for a failed read in `roles.mjs`
(`<p class="warn">` with the host's message, `roles.mjs:247`, `:271`). MOD-implementation-pages' Uses do not name
`MOD-site-frame.readProblem`, so it is not used here. *Save* still names the instance's current commit, as before.

**Where it is built.** ITM-780's code is on `sprint/team2/82` (head `1861e7f9`), not on `main`, since #811 is not
merged. The item branch starts from `sprint/team2/82`'s head, and its pull request goes into `sprint/team2/82`, so the
fix reaches `main` with #811.

## Acceptance

- With a fixture instance whose declaration names a commit the host cannot read, the route renders its models and form,
  shows the line naming that commit with the host's message, and shows no comparison; nothing is written. Red first on
  `1861e7f9`'s `process.mjs`.
- The header of `tests/implementation-pages-model-version.test.mjs` names `UC-031` and the requirement by identifier.
- `tests/release-sprint-02-d-traceability.test.mjs` and `tests/release-sprint-16-practice-workflow.test.mjs` pass,
  run locally, and every other existing test that reads the changed files.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
