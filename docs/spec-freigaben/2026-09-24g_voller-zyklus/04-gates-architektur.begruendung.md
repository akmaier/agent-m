# Architecture decisions and modules enter `main` as open, like use cases

Group g2, change B2 under the existing name `A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN`: an
architecture decision or a module is a reviewed artifact — accepted by an approval record — so it may be
written to the default branch as open, like a use case. Code still goes through a pull request.
Impact: UC-005, UC-007, UC-010, UC-011 realise it and stay correct.

**Changed on 2026-09-24 with the PO's decision on where products are kept** (see entry 05's
rationale): `ADDING A PRODUCT CREATES ITS LAYOUT` no longer writes the product into the instance's
`docs/products.md`, which is withdrawn.
