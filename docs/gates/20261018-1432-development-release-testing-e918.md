---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0cf673ab709bc5d1026492d2f986b20655f8120d
  - https://github.com/akmaier/agent-m/pull/902
date: 2026-10-18 14:32 UTC
---
# Development → Release testing: ITM-918, a Mermaid diagram draws in the page

**REGISTER**

## Reason

ITM-918 (MOD-markdown-render), pull request #902 into `sprint/team1/90`, passes on `0cf673ab`, under the two rulings of
`bd01657d`.

1. **Red first.** `d81b58f6` holds only tests, plus a merge of the sprint branch. Run 39134477081 is red on exactly
   TST-918001, 918002, 918005 and 918006, and on TST-904054 and 904072, whose width todos for `#arc` and `#module` are
   removed.
   - TST-342005's stand-in for `body.appendChild` collects only scripts, and its expected value is unchanged.
   - In `site-usability`, `#uc/UC-001`'s todo now names only its table and code run.
   - In `site-accessibility`, `scroll` is removed for the three routes.
   All of these are named at the commit, under `d995c09b`.
2. **The harness line** (`9c38dba9`, `tests/app-harness.mjs:383`) gives the page's body a real element, as ruled. Its
   message says it was pushed by a participant who builds none of the item, and the Scrum Master names
   developer-sonnet-b. **The commit carries no participant trailer,** so that rests on the message and the Scrum Master's
   word. That is noted for the retrospective.
3. **The change** (`0cf673ab`, only `src/markdown-render/mermaid.mjs`):
   - an off-screen stage is attached to `document.body`, each draw runs in it, and it is emptied in `finally`;
   - `unsafeCss` allows only `@keyframes` (`/@(?!keyframes\\b)/`) and `nth-of-type`, as ruled. `@import`, `@font-face` and
     every non-fragment `url()` stay refused;
   - the pull request names the widening for akmaier.
   This is MOD-markdown-render.md:59, "one diagram, drawn with the diagram library's strict security level", and :29-30.
4. **Green.** Run 39135731096 on `0cf673ab` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/90` without a conflict (tree `7f91b93a`).
5. **The Acceptance holds.**
   - The developer's four counter-proofs each fail their tests: the stage not attached, `unsafeCss` emptied, the old `@`
     check, and no `nth-of-type`.
   - The new drawing test runs in the check's Electron, which this machine's stale native lock keeps from running here. So
     I did not replay a counter-proof locally. CI ran it green on the head, and the developer's counter-proofs ran on the
     head.
   - The Scrum Master's base-against-head run over 188 files moves exactly the six named tests from not ok to ok.
6. **Release tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does:
   `markdown-render-342`, `dashboard-component-diagram`, `release-sprint-04-trace-pages`,
   `release-uc-022-derive-architecture` and `trace-pages-diagram`. That was 29 of 29.

**Sprint 90 has no item left open.** Its end gates follow its pull request into `main`.
