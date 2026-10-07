# 3. Requirements: where a requirement stands names what it constrains

**The change.** The rule of `A REQUIREMENT NAMES WHAT IT CONSTRAINS` no longer asks every requirement to state whether it
constrains the product or the development process; where it stands decides. Its name is kept, so nothing that names it
changes. Its check becomes `tests/spec-document-parse.test.mjs`, which reads a SPEC's requirements with no such field
(ITM-214); `tests/test_requirement_fields.py` never checked the rule.

**Why.** PO, 2026-10-07: "from the location. Process requirement is agent-m requirement; it lives in agent-m docs; product
requirement lives with the product. The distinction is no longer needed in agent-m". The architecture says the same
(MOD-spec-document, Data); with the rule in the SPEC, no participant has to ask again.

**Impact list** (`git grep` at `main`, each probe checked on a known positive): the name stands in SPEC.md, ARC-048,
MOD-spec-document, UC-005, UC-030, ITM-214, `tests/spec-document-parse.test.mjs`, a dated measurement and the frozen
fixtures of sprint 02. The name is kept, so none of them changes; MOD-spec-document's text already says that where a
requirement stands is what it constrains.
