---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2c7666f7662cf7307ced2c7432dd7834a422c91e
  - https://github.com/akmaier/agent-m/pull/846
date: 2026-10-18 06:31 UTC
---
# Development → Release testing: ITM-735, the trace graph holds code files and their imports

**REGISTER**

## Reason

ITM-735 (MOD-trace-graph), pull request #846 into `sprint/team1/87`, passes on `2c7666f7`.

1. **Red first, tests only.**
   - `09db34fc` holds the new and changed tests. Run 39102975259 is red on exactly the twelve tests named.
   - `3f971278` changes `tests/dashboard-spec-impact.test.mjs:180`, the fifth exception in the Acceptance: the
     assertion goes from "is not read" to "is read for its imports". Run 39103335268 is red on those and UC-006 3b.
2. **The change** (`1774c738`, only `src/trace-graph/`):
   - `code.mjs` is new. It holds the extension table, the import forms, the resolution of a specifier, and
     `importEdges`, which makes an edge only into another module.
   - `build.mjs`, `derive.mjs` and `index.mjs` take the code nodes in.
   - That is what the accepted MOD-trace-graph.md (blob `cd5ced9e`) states.
3. **The guard** (`2c7666f7`, `tests/test_no_backend.py`, as ruled in `28527e56`). The guard's own `PERMITTED_CHANNELS`
   gains entries for `src/trace-graph/code.mjs`:
   - `import()`: 1, admitted only in a comment;
   - `@import`: 3, admitted in a comment or on the one line `const CSS_IMPORT = /`.
   Its counter-proof test shows four things: a real `import("./x.mjs")` is found; a CSS string outside the pattern is
   found; one match above the count is found; and the same text in another file is found.
   - **Noted:** a `//` comment line is admitted wherever it stands in that file, so a commented-out `@import` with an
     address would pass. That is acceptable because a comment is no request, and the count still bounds it.
4. **Green.** Run 39104012736 on `2c7666f7` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/87`, which now holds #845 and #847, without a conflict (tree `27268844`).
5. **The Acceptance holds:**
   - one `code` node per code file, none for the excluded ones;
   - `imports` edges for the four languages;
   - a file of another extension as a code node, not read;
   - the five named test changes and no other;
   - the count of a `traceGraph` call with and without code files, on its recorded fixture
     (`tests/trace-graph-code-requests.test.mjs`).
   - **My own runs:** in a clean checkout of the head, the item's four test files, `dashboard-spec-impact` and the release
     tests named below pass, 49 of 49, and `test_no_backend` passes.
   - **The counter-proof I replayed:** with `importEdges` keeping edges into the file's own module, 4 of 8 tests of
     `trace-graph-code.test.mjs` fail. Restored, `src/` is clean. The developer's four planted faults each fail too.
   - **UC-006 3b:** the diagnostic's last batch changes from 7 to 8. The test asserts no batch size, and it passes.
6. **Release tests (agreement 83).** `release-uc-006-batched-reads` is the release test that imports the trace graph. I
   also ran those that load it through the review pages, with the Bridge packages installed as CI does: `release-uc-006`
   (approve), `release-uc-008`, `release-uc-022` and `release-sprint-02-d-dashboard-app`, within the 49. The traceability
   release test `release-sprint-02-d-traceability` passes, 8 of 8.

**Noted, not the item's:** `tests/test_expected_results_stated.py` fails locally because `src/tunnels/index.mjs` needs an
npm package that is not installed there. CI's python jobs pass.
