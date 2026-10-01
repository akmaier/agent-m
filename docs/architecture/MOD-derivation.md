---
id: MOD-derivation
title: Classifies drafted candidates against what exists — new, change, duplicate, conflict — and merges duplicates within a run
realises:
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
  - A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
  - A CONFLICT IS DECIDED BY A PERSON
  - CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
  - A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES
  - THE DERIVATION RULES HOLD FOR ARCHITECTURE
  - UC-005
  - UC-007
  - UC-022
follows:
  - ARC-003
  - ARC-007
uses:
  - MOD-spec-queue.specRequirements
provides:
  - normaliseRule
  - mergeCandidates
  - classifyCandidates
  - toProposals
---
# MOD-derivation Classifies drafted candidates against what exists — new, change, duplicate, conflict — and merges duplicates within a run

## Responsibility

The derivation rules, once, for every kind the SPEC applies them to — requirements from sources and
by prompt, use cases, architecture decisions and modules, tests. Pure core; the model's share is only
the proposal of a class, which this module checks where it can and marks where it cannot.

**Current state.** No code exists.

## Interfaces

- `normaliseRule(text) -> string` — case, whitespace and typographic punctuation folded, so equal rules compare equal.
- `mergeCandidates(candidates) -> candidates` — candidates of one run that state the same rule become one, naming every passage they came from.
- `classifyCandidates(candidates, existing) -> [{ candidate, class, target, byModel }]` — a name or normalised rule equal to an existing one is a duplicate whatever the model said; otherwise the model's class is kept, marked as the model's, for the person to change.
- `toProposals(classified, decisions) -> [entry]` — new: an addition; change: an entry under the existing name with current text and impact list; duplicate: an added source; conflict: only as the person resolved it.

Uses, as declared above: `MOD-spec-queue.specRequirements`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
