---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 39da557743678ff90def48c2c6826b2e8d74785d
  - https://github.com/akmaier/agent-m/pull/466
date: 2026-10-12 22:29 UTC
---
# Development → Release testing: ITM-392, the book's chapters read in a checkout of the instance

**REGISTER**

## Reason

ITM-392, pull request #466 by developer-sonnet-c into `sprint/team1/24`, head `39da557`. The first commit `ff68623`
holds only `tests/source-register-checkout.test.mjs`, and CI was red on it (run 38316023287): its four tests fail, and
no other test does. CI is green on `39da557` (run 38316627017, node 2169 tests, 0 failures; python OK, the NO SERVER
check among it). The code changes only `src/source-register/strategies.mjs`; the new test names MOD-source-register and
its guards, and 22 faults are recorded, one more dropped as equivalent. The existing chapters tests are unchanged. Over
this repository all four recipes give their chapters as paths, each file's SHA-256 equal to the register's.

The points weighed:
- Node's `fs` and `path` are reached through `globalThis.process?.getBuiltinModule`, as `src/runtimes/ci.mjs` reaches
  its templates (ITM-322): no static import of a Node module, no `import()`. In a browser they are absent, and the
  chapters are given as text as before; the module loads in the dashboard, whose tests that load it by `import()` stay
  green in the whole suite.
- A part holds the chapter file's absolute path in the checkout — the path of the file in that checkout that
  `A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE` asks —, once its SHA-256 is the version's; `HashMismatch`
  otherwise and `ContentUnreadable` for a missing file; the part's name is unchanged. A file only hashed is not stored,
  so it is in no checkout and is not given, as `readContent` gives stored files only.
