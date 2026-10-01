# Fixture product — Specification

**VERBINDLICH (SPEC)**

A fixture for the identity checks of MOD-artifacts (tests/test_identifiers.py,
tests/test_identifier_stability.py, tests/test_origin_links.py, tests/test_test_levels.py): the earlier
of two versions of one product. Every artifact here carries its identifier and names its origin.

## 1. Reading

**A FILE IS READ WHOLE** *(SRC-po, 2026-09-24)*
A file is read from its first byte to its last.
*Occasion:* a file read in part is a wrong file.
*Check:* `tests/reader.spec.mjs`

**THE STATUS IS SHOWN** *(SRC-po, 2026-09-24)*
The status of every file is shown on the page.
*Occasion:* the reader decides from it.
*Check:* `tests/page.spec.mjs`

**OLD READER** *(SRC-po, 2026-09-23 —
withdrawn 2026-09-24)*
*Withdrawn:* replaced by `A FILE IS READ WHOLE`. The name is not reused.
