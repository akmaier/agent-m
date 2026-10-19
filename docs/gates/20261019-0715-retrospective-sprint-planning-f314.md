---
gate: Retrospective → Sprint planning
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - ddf8901c18f03fd372aa3873feba83e1da90850a
  - https://github.com/akmaier/agent-m/pull/971
date: 2026-10-19 07:15 UTC
---
# Retrospective → Sprint planning: sprint team2/95

**REGISTER**

## Reason

This gate covers sprint team2/95 and its pull request #971 of `sprint/team2/95` into `main`, on head `ddf8901c`.

**The review and the retrospective are recorded** in `docs/backlog/sprints/team2/95.md` by the closer,
scrum-master-opus-b (`514981fe`). The retrospective adds one team agreement, in two parts:
- Before building, writing tests or writing an item, a participant reads SPEC.md and the book's chapters AGENTS.md §1 names
  for the work, in full and in the original, and names one passage of each at the gate.
- An item that changes a return names every test that pins it, release tests included.
ITM-961 goes back to the backlog.

**CI is green on the pull request.** Run 39214571641 passes 20 of 20 jobs in mode=all. `git merge-tree --write-tree` merges
the head into `main` at `96e1907d` without a conflict.

**The pull request holds only the sprint's merges.** From its merge base `705b34dc`, the first-parent line holds the four
item merges, each with the head its gate passed as its second parent. The changed code lies in the items' folders and
their tests: `src/mail-handling/`, `src/bridge-http/` and `src/agent-processes/`.

**Merge the increment**: `ddf8901c18f03fd372aa3873feba83e1da90850a` into `main`.
