# Fixture product — Specification

A fixture for the requirement checks of MOD-spec-document (tests/test_requirement_has_source.py,
tests/test_requirement_names_check.py, tests/test_single_statement.py), in the form of a SPEC that
MOD-spec-document reads, and well formed for a product that links SRC-po, SRC-model-licence and
SRC-iec-62304; one source is named by its register entry's title. Each test breaks a copy of one
requirement.

**Form of a requirement** — prose in bold, not a requirement.

## 1. Rules

**THE EXPORT IS A PDF** *(SRC-po)*
The export of a report is a PDF file.
*Check:* `tests/test_export.py`

**THE PRODUCT IS NOT SOLD** *(SRC-model-licence, its terms
of use)*
The product is offered free of charge.
*Check:* no automatic check; at review.

**A NAMED RULE STAYS ONE** *(PO A. Maier)*
Every export follows `ONE DEFINITION AND ONE DRIVER` in its standard handling.
*Check:* `tests/test_named.py`

## 2. Process

**EVERY CHANGE IS VERIFIED** *(SRC-iec-62304, 5.5.5)*
Every change to a safety-relevant unit is verified before it is merged.
*Check:* `tests/test_verification.py` — a change without a recorded verification fails;
counter-proof: with one it passes.
