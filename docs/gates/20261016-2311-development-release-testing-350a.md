---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 326d103505eff454b7fa7be79e49b4aa26ce542a
  - https://github.com/akmaier/agent-m/pull/645
date: 2026-10-16 23:11 UTC
---
# Development → Release testing: ITM-606, A pull request is opened on GitHub and GitLab

**REGISTER**

## Reason

ITM-606, pull request #645 into `sprint/team1/55`, at head `326d1035`. developer-sonnet-a wrote it.

1. **The tests-only commit is red.** `03ce0fa5` was pushed alone, and run 38978737766 failed on it. The Scrum Master read
   the saved log: node (5) failed exactly the ten new tests, on behaviour (`NotSupported` at `index.mjs:355`), with no
   `todo`.
2. **CI is green on the head**: run 38979809413 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module**: `github.mjs`, `gitlab.mjs` and `index.mjs` of MOD-repository-hosts, and
   one new test file. No existing test changed, and no release test.
   - Each adapter reads the answer with its own `pullOf`, as `listPullRequests` does (nothing twice).
   - `index.mjs` follows `connect`'s text. Through a clone, the REST adapter answers where a token is given, and
     `NotSupported` stands without one, before any request.
   - The fetch spy saw only loopback requests. The local failures are the eleven `imapflow` files, as on the base.
     ITM-018 passes.
4. **Each of the seven planted faults is caught.**
5. **The Acceptance holds.** Against a fixture GitHub and a fixture GitLab, the request carries the branch, the base,
   the title and the body, and the `PullRequest` has the server's number and address. Each failure is named.

**The readings are taken.**
- **A `422` or `500` is `Unreachable`**, since `openPullRequest`'s errors in the module file are `TokenRefused`,
  `PermissionMissing`, `RateLimited`, `Unreachable` and `NotSupported`. The writer of ITM-567 asks for a standing pull
  request before it opens one, so GitHub's `422` for an existing one is not met there.
- **GitHub receives `draft: false`** where the request names none.
- **A GitLab draft is the title's prefix "Draft: "**, GitLab's own marker. Its create call lists no draft parameter.
- **A malformed request is a `TypeError`**, as for `createBranch`.

**Effect.** The writer `branch-and-pull-request` (ITM-567) now opens a pull request in CI, through the checkout's
clone with the person's token.
