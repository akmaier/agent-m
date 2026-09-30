---
id: MOD-apply-workflow
title: Writes an accepted change of the instance's own SPEC when its approval was committed without the dashboard
realises:
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - A STALE APPROVAL IS NOT APPLIED
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - UC-006
follows:
  - ARC-006
uses: []
provides:
  - applyApprovals
---
# MOD-apply-workflow Writes an accepted change of the instance's own SPEC when its approval was committed without the dashboard

## Responsibility

The workflow half of `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL` for the instance's own
SPEC (`.github/workflows/apply-approvals.yml` runs it on pushes to `docs/approvals/`). It is the one
module in Python; it mirrors `MOD-spec-queue` section logic, and `tests/test_apply_approvals.py`
checks that both write the same bytes (ARC-003 names this exception).

**Current state.** `tools/apply_approvals.py` is this module, unchanged.

## Interfaces

- `applyApprovals` — `python3 tools/apply_approvals.py [--repo DIR] -> exit 0 | 1` — for every `kind: spec` record not yet applied: checks the proposal's and the SPEC section's blob SHAs and the queue's anchor, replaces the section byte for byte keeping the final newline, appends the decision row; a stale or malformed record is refused and makes the exit code 1; commits nothing — the workflow does.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
