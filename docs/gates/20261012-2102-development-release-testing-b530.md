---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 3f658755bfca4646067ceca8237c845d11e39162
  - https://github.com/akmaier/agent-m/pull/454
date: 2026-10-12 21:02 UTC
---
# Development → Release testing: ITM-358, editing a use case on the dashboard

**REGISTER**

## Reason

ITM-358, pull request #454 by developer-sonnet-d into `sprint/team1/23`, head `3f65875`. The condition that does not
hold: the page uses MOD-markdown-render's editor through its implementation, not its interface. After `openEditor` it
finds the editor's *Save* button in the element it rendered (`src/review-pages/flow.mjs`, `showEdit`) and disables or
removes it. `DEVELOP AGAINST INTERFACES`: "A module uses another module only through that module's interface, never
through its implementation." `openEditor` and `Editor` offer `marks`, `save`, `linkFor`, `text`, `showDraft`,
`setMarks` and `close`, and no way to disable or withhold *Save*.

The Acceptance asks for a *Save* disabled on a changed `id` and none on GitLab without a token, which the editor's
interface cannot give as it stands. So the way through is a change of MOD-markdown-render's file — `openEditor` or
`Editor` offering to disable or withhold *Save* —, which is akmaier's to accept, then an item of that module, as ITM-457
was for TST-276002; the rework follows them.

The rest was read too and stands: the tests-only commits `c6ebc1b` and `1dd1940` were red (runs 38306304454,
38306918379) and the code is green (run 38307656145); the address `use-case/id=…/edit=1`; the `differs` warning, the
route after `PermissionMissing`, the group link and the leaving confirmation untested, as the Acceptance names none.
