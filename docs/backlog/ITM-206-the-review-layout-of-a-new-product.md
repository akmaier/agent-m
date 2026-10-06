---
id: ITM-206
title: The review layout of a new product
level: module
realises:
  - UC-001
  - ADDING A PRODUCT CREATES ITS LAYOUT
  - ONE REVIEW LAYOUT FOR EVERY PRODUCT
modules:
  - MOD-spec-document
  - MOD-artifact-edits
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - UC-001
---
# ITM-206 The review layout of a new product

**REGISTER**

## Outcome

MOD-spec-document's `specSkeleton` and MOD-artifact-edits' `reviewLayoutCommit`, as their files state them: the missing
parts of the review layout — the folders of use cases, architecture, approvals and SPEC change queues, a `SPEC.md`
skeleton and a `CHANGELOG.md` — written into the product's default branch in one commit under the person's account, and
nothing when the layout is complete. They are built in `src/spec-document/` and `src/artifact-edits/`, on the host of
ITM-205, with the missing layout in `docs/assets/review-core.mjs` and the write of `addProduct` in
`docs/assets/dashboard/writes.mjs` as their model.

## Acceptance

- Unit tests that name MOD-spec-document and MOD-artifact-edits state, before the code exists: the skeleton holds the
  title, a preamble and an empty first section, and reads as a SPEC without a requirement; a product without any of the
  layout gets every part in one commit; one with part of it gets only the missing parts; a complete one gets no commit;
  a refused write is named as the host names it, with nothing written.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/`, `src/artifact-edits/` and the tests that name their modules change.
