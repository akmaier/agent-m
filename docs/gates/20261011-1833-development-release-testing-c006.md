---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 13c4735f90e0c3667e225271a55f41925bfa0c8c
  - https://github.com/akmaier/agent-m/pull/395
date: 2026-10-11 18:33 UTC
---
# Development → Release testing: ITM-355, the use cases with their status, one use case, and accepting it

**REGISTER**

## Reason

ITM-355, pull request #395 by developer-sonnet-d into `sprint/team1/18`, head `13c4735`. The condition that does not
hold: for a GitHub product without a token of its own, the page takes the instance's `github-token` as the product's
token (`src/review-pages/flow.mjs` line 43), so it offers *Accept* and names the instance token's person where the
Acceptance asks, without a token, for the link that holds no text. No accepted text lets a product use the instance's
token: `A GITHUB PRODUCT USES A TOKEN OF ITS OWN`, and MOD-site-frame's `chosenProduct` connects a product "with its
own token to its own server only". The fault F18, which ignores the instance's token, survives because no test
covers that case.

The rest was read too and stands for the rework. The tests-only commits `5418328` and `ee9e5dd` were red, and the
code is green. The faults were planted on the draft: `ee9e5dd` adds cases for the faults that survived there, and
`13c4735` is that draft. Noted for the review, not conditions:
- one `Route` `use-case` with `id=<id>`, since the frame's routing takes `k=v` parameters where MOD-review-pages
  names `<k>/<id>`;
- the record composed with MOD-documents, which the module file's Uses do not list;
- the diagram asserted as handed to the renderer, since the tests' DOM cannot draw it;
- F20 and F21, a private or unreadable repository, which the Outcome names and no test covers.
