# Fixture product — Specification

**VERBINDLICH (SPEC)**

A fixture for the requirement checks of MOD-artifacts (tests/test_requirement_*.py,
tests/test_single_statement.py), well formed for a product that links SRC-po, SRC-model-licence and
SRC-iec-62304; one source is named as it is written. Each test breaks a copy of one requirement.

**Form of a requirement** — prose in bold, not a requirement.

## 1. Rules

**THE EXPORT IS A PDF** *(SRC-po, 2026-09-24)*
The export of a report is a PDF file.
*Occasion:* the readers print it.
*Check:* `tests/test_export.py`

**THE PRODUCT IS NOT SOLD** *(SRC-model-licence, 2026-09-24,
reworded 2026-09-30)*
The product is offered free of charge.
*Occasion:* the licence of the model the product calls forbids commercial use; its terms entered as
a registered source.
*Check:* no automatic check; at review.

**A NAMED RULE STAYS ONE** *(PO A. Maier, 2026-09-25)*
Every export follows `ONE DEFINITION AND ONE DRIVER` in its standard handling.
*Occasion:* a rule that names another requirement in backticks, and words that only contain the
letters a-n-d, still state one thing.
*Check:* `tests/test_named.py`

**OLD EXPORT** *(SRC-po, 2026-09-23 —
withdrawn 2026-09-24)*
*Withdrawn:* replaced by `THE EXPORT IS A PDF`. The name is not reused.

## 2. Process

**EVERY CHANGE IS VERIFIED** *(SRC-iec-62304, 2026-09-24)*
Every change to a safety-relevant unit is verified before it is merged.
*Occasion:* the standard asks for documented verification of each unit; a merge without it leaves
no evidence.
*Check:* `tests/test_verification.py` — a change without a recorded verification fails;
counter-proof: with one it passes.
