---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8b5c209318f8de9735783a08c0b285880eb7963c
  - https://github.com/akmaier/agent-m/pull/950
date: 2026-10-19 07:35 UTC
---
# Development → Release testing: ITM-686, the live page renders its Markdown with renderArtifact

**REGISTER**

## Reason

ITM-686 (MOD-markdown-render, MOD-site-frame), pull request #950 into `sprint/team1/93`, passes on `8b5c2093` as refactoring.
akmaier accepted MOD-site-frame's uses draft in `e1fc8bd7`, which its gate waited for.

1. **Each commit is green and carries its participant's trailer:**
   - `67f31783`, developer-sonnet-c, who built none of ITM-686, changes the release test's two lines;
   - `8b5c2093`, developer-sonnet-a, holds the code and the other tests.
   This answers both points of the rejection of #945.
2. **The change** follows the accepted texts:
   - `dashboard-app.mjs` renders with `renderArtifact` and draws diagrams with `renderMermaid`;
   - `docs/index.html` loads no library of its own;
   - `docs/assets/vendor/` goes;
   - `test_no_backend.py` changes as the item's own output.
3. **Counter-proof, replayed by me in a clean checkout of the head:**
   - `tests/dashboard-shell.test.mjs` passes 8 of 8;
   - with the live page's `md` returning its text unrendered, "the live page renders its Markdown with the renderer"
     fails.
4. **Green.** `git merge-tree --write-tree` merges the head into today's `sprint/team1/93` without a conflict (tree
   `aa1114b5`).
5. **The developer's findings** are registered: ITM-1018, the dark scheme. The burn-down chart drawn twice goes with
   `backlog-view.mjs`.
