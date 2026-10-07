# 3. Requirements: where a requirement stands names what it constrains

**The change.** The rule of `A REQUIREMENT NAMES WHAT IT CONSTRAINS` no longer asks every requirement to state whether it
constrains the product or the development process; where it stands decides. Its name is kept, so nothing that names it
changes. Its check becomes the existing `tests/test_products_folder.py`, which already finds a product's address in any
committed file of the instance repository, `SPEC.md` included; no test is added. `tests/test_requirement_fields.py` never
checked the rule.

**Why.** PO, 2026-10-07: "from the location. Process requirement is agent-m requirement; it lives in agent-m docs; product
requirement lives with the product. The distinction is no longer needed in agent-m". On the check: "A test could implement
that agent-m has no requirements that mention a product; The inverse is not needed; products can depend on agent-m, but
don't have to." — "Other tests are probably not meaningful." — "Don't overengineer the testing."

**Impact list** (`git grep` at `main`, each probe checked on a known positive): the name stands in SPEC.md, ARC-048,
MOD-spec-document, UC-005, UC-030, ITM-214, `tests/spec-document-parse.test.mjs`, a dated measurement and the frozen
fixtures of sprint 02. The name is kept, so none of them changes; MOD-spec-document's text already says that where a
requirement stands is what it constrains.
