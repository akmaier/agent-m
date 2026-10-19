---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - ef5f876fd260cc91ed87a72bd0e70df3b19080ca
  - https://github.com/akmaier/agent-m/pull/945
date: 2026-10-19 05:36 UTC
---
# Development → Release testing: ITM-686, rejected — a release test changed by its implementer, and a red commit in a refactoring

**REGISTER**

## Reason

ITM-686 (MOD-markdown-render, MOD-site-frame), pull request #945 into `sprint/team1/93`, is rejected on `ef5f876f`.

**What holds.**
- The trailer is `developer-sonnet-a`, and CI run 39205045332 passes all twenty jobs.
- The change follows the accepted texts:
  - `dashboard-app.mjs` renders with `renderArtifact` and `renderMermaid`;
  - `docs/index.html` loads no library of its own;
  - `docs/assets/vendor/` goes.
- The change of `tests/test_no_backend.py`, the vendor paths, is the item's own output (`d995c09b`), named in 93.md.

**What fails.**
1. **A release test is changed by the item's implementer.** `tests/release-sprint-04-trace-pages.test.mjs` now reads
   `src/markdown-render/vendor/mermaid.min.js`. The standing rule (`d995c09b`, 87.md, 89.md:127) is that a release test is
   changed only by a participant who builds none of the item. The brief asks the developer to stop and report first.
2. **The item is declared as refactoring, so CI is green on every commit** (ITM-686's Acceptance). The tests-only commit
   `5cf10f38` is red (run 39204503978).
   - Most of its failures are unchanged tests that fail because `tests/app-harness.mjs` changed, not behaviour of the
     item.
   - For a refactoring, the proof is identical results, not a red.

**What passes the gate on the next head:**
- No red commit. The branch holds the change in commits that are each green, for example one commit for the code and its
  tests.
- The one line of `release-sprint-04-trace-pages.test.mjs` is changed in a commit of its own, by a participant who built
  none of ITM-686, with that participant's trailer. developer-sonnet-c or developer-sonnet-d is free for it. The files are
  byte-identical (the developer's `cmp`).

**The developer's findings,** for the next start, registered once four-digit identifiers stand on `main`:
- `src/markdown-render/mermaid.mjs:73` draws Mermaid without the dark theme the old app used under
  `prefers-color-scheme: dark`, and CI tests the light mode only;
- the burn-down chart is drawn twice until `backlog-view.mjs` goes;
- the exclusion at `tests/release-sprint-02-d-traceability.test.mjs:322` is dead.
