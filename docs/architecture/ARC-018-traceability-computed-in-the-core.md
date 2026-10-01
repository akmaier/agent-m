---
id: ARC-018
title: Traceability, gaps, impact lists and the audit view are computed in the core from the artifacts of one pinned commit
withdrawn: 2026-10-01
replaced_by: ARC-006
forced_by:
  - THE TRACEABILITY MATRIX IS DERIVED
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - THE BROWSER SHOWS ANY RELEASED VERSION
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
  - UC-020
  - UC-023
  - UC-025
  - UC-030
---
# ARC-018 Traceability is computed in the core

## Withdrawn

Merged into ARC-006 on 2026-10-01, at the PO's decision on the architecture review: traceability is one
of the views derived from the files of one pinned commit, which is the subject of ARC-006. Its section
*Traceability is computed from one pinned commit* carries this decision's link graph, its views, versions
as commits, gaps that never block, and the audit export. The identifier is not reused; the text this file
held is in the git history of this path.

## Context

See ARC-006.

## Decision

Withdrawn; ARC-006, section *Traceability is computed from one pinned commit*.

## Alternatives

See ARC-006.

## Consequences

Modules that followed this decision follow ARC-006.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; withdrawn on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023); open until accepted.*
