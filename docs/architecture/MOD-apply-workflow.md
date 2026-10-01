---
id: MOD-apply-workflow
title: Writes an accepted change of the instance's own SPEC when its approval was committed without the dashboard
withdrawn: 2026-10-01
replaced_by: MOD-review-core
realises: []
follows:
  - ARC-006
uses: []
provides: []
---
# MOD-apply-workflow Writes an accepted change of the instance's own SPEC when its approval was committed without the dashboard

## Withdrawn

Merged into MOD-review-core: applying recorded approvals is the review core's acceptance run without a dashboard; `applyApprovals` lives there, and the CI runtime calls it through `MOD-ci-entry.ciEntry`. The identifier is not reused; the text this file held is in the git history of this path.

## Responsibility

See MOD-review-core.

## Interfaces

None; see MOD-review-core.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — withdrawn in the leaner architecture of the architecture review, as the PO approved it (UC-023); open until accepted.*
