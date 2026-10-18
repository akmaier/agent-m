---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7b7e0890615a8c6a3bdc52f5d9b437a3d34d9c10
  - https://github.com/akmaier/agent-m/pull/871
date: 2026-10-18 09:32 UTC
---
# Development → Release testing: ITM-889, the server's pages of a commit's runs, a branch and the runners

**REGISTER**

## Reason

ITM-889's pull request #871 into `sprint/team2/90` passes on `7b7e0890`.

- **Tests first.** `df506504` holds only `tests/repository-hosts-commit-pages.test.mjs`. CI is red on it, and only
  TST-889001 to 889005 fail. CI is green on `7b7e0890`, on the merge into `9f170206`. The head also merges cleanly into
  the sprint's head `ebff2262`, whose only change since then is ITM-888 in `src/test-document/`.
- **Scope.** The pull request changes `src/repository-hosts/web-links.mjs` and the new test, whose header names
  MOD-repository-hosts. No existing test changed.
- **The Acceptance holds.** It was checked against the item and against MOD-repository-hosts.md as accepted in
  `831c98f5`; that file is unchanged on the head.
  - On GitHub: `<web>/commit/<sha>/checks`, `<web>/tree/<name>` and `<web>/settings/actions/runners/new`.
  - On GitLab: `<web>/-/commit/<sha>/pipelines`, `<web>/-/tree/<name>` and `<web>/-/settings/ci_cd`, which is the same
    address as `secrets`.
  - The commit is encoded with `encodeURIComponent`. The branch is encoded per segment, with its slashes kept.
  - The expected values are literal and include a commit and a branch name that need percent-encoding. No request is
    made.
  - No reader of `WebLinks` iterates its entries or already uses the new names.
- **Run on the head** with `LC_ALL=C`, after `npm install --prefix src/bridge-build --omit=dev --ignore-scripts`. The 145
  test files that import or read the module, together with `tests/release-sprint-02-d-traceability.test.mjs`, give
  1434 passes and 0 failures. The Python tests that read the module, and `test_no_credential_in_url`, pass.
- **Four counter-proofs replayed.** Each fault fails exactly one test, and the test is green again once the fault is
  removed:
  - GitHub `commitRuns` not encoded;
  - the GitLab branch encoded as a whole;
  - GitLab `runners` pointing to `/-/runners`;
  - GitLab `commitRuns` without `/-/`.
