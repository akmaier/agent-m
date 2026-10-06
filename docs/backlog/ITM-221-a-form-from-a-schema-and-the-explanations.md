---
id: ITM-221
title: A form from a schema, and the explanations
level: module
realises:
  - UC-002
  - EVERY STEP EXPLAINS ITSELF
  - A FORM OPENS WITH ITS FIRST FIELD FOCUSED
  - ONE CLICK PER DECISION
modules:
  - MOD-site-frame
builds_on:
  - ITM-213
  - ITM-220
  - ITM-227
tests:
  - unit
origin:
  - UC-002
---
# ITM-221 A form from a schema, and the explanations

**REGISTER**

## Outcome

MOD-site-frame's interface, as its file states it, for UC-002: the types `View`, `Route` and `ViewContext`;
`schemaForm` — a form built from a schema, with its findings beside the fields and *Save* —; and `explain` with the topics
of UC-002 in `explanations.md`, in `src/site-frame/`, with `stepHtml` of `docs/assets/dashboard-app.mjs` as the model of
an explanation. The header, the menu, the product selector and the other functions of the frame are not part of this
item.

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, a form built from a fixture schema with a field for each part of a document; a finding shown beside its field;
*Save* handing the document over once, on a person's click; the first open field focused when the form opens; and
`explain` giving the folded *What is this?* of a topic, and an empty element for a topic the file does not hold.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
