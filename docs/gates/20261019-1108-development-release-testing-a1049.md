---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a27556f6fcd961b75ff3ee8a2e3c7e8accaa50f8
  - https://github.com/akmaier/agent-m/pull/1024
date: 2026-10-19 11:08 UTC
---
# Development → Release testing: ITM-1049, passed — a release tag builds and publishes the Bridge

**REGISTER**

## Reason

ITM-1049 (MOD-workflow-entries), pull request #1024 into `sprint/team1/93`, passes on `a27556f6`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-e`.**
  - `916f19c3` holds only tests: `tests/workflow-entries-release-tagged.test.mjs`.
  - `a27556f6` holds the code: `src/workflow-entries/` and `.github/workflows/release.yml`. It also makes one test line's fake
    token one that `connect` takes.
- **The red,** run 39241224128, job 118022238893: `# fail 6`, exactly the six new tests, with `# cancelled 0`. The 32 todo are
  known findings.
- **The Acceptance holds, with MOD-bridge-build's functions faked:**
  - a tag runs `buildPlatform` per platform and `publishRelease` once;
  - a missing secret ends `not run`, naming it;
  - a failed signature ends `failed` with nothing published.
- **The readings stand:**
  - `RELEASE_PHASE` and `RELEASE_PLATFORM` tell one entry which runner it is on;
  - the tag form is `v*`;
  - the secrets come from MOD-bridge-build's Data.
- **What is not built yet.** `buildPlatform` is not built (`src/bridge-build/index.mjs` exports `publishRelease` only), so a
  real tag fails at the build step until ITM-961 builds it.
- **Naming the new workflow file.** SPEC.md:1448-1450 asks that a CI workflow be named in the parts of one module.
  MOD-workflow-entries.md:115 names three files, not `.github/workflows/release.yml`. The draft that names it is ruled in
  93.md, as for ITM-908's `main-changed.yml`.
- **CI:** 20 of 20 checks passed on the head (run 39241947173).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`738fe3ef`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 6 of 6.
  - Counter-proof: with no secret ever found missing, exactly the missing-secret test fails.
