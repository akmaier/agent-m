---
id: MOD-participant-ci
title: Runs jobs as CI agents through the product's own workflows, writing with the person's token from a CI secret
withdrawn: 2026-10-01
replaced_by: MOD-ci-generator
realises: []
follows:
  - ARC-009
  - ARC-010
  - ARC-015
uses: []
provides: []
---
# MOD-participant-ci Runs jobs as CI agents through the product's own workflows, writing with the person's token from a CI secret

## Withdrawn

Merged into MOD-ci-generator: the CI-agent driver dispatches the job workflow that module generates, and the secrets it names are the ones that workflow reads (ARC-015). The identifier is not reused; the text this file held is in the git history of this path.

## Responsibility

See MOD-ci-generator.

## Interfaces

None; see MOD-ci-generator.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — withdrawn in the leaner architecture of the architecture review, as the PO approved it (UC-023); open until accepted.*
