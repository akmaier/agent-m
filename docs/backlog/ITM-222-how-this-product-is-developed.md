---
id: ITM-222
title: How this product is developed
level: module
realises:
  - UC-002
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-218
  - ITM-219
  - ITM-221
tests:
  - unit
origin:
  - UC-002
---
# ITM-222 How this product is developed

**REGISTER**

## Outcome

MOD-implementation-pages' route `process` — *How this product is developed* —, as its file states it, in
`src/implementation-pages/`: the five models in their two groups, each with what its `about` holds — the risk it manages
well, the risk it accepts, an example project it suits, its chapter; the roles with the participants eligible for each;
phases, transitions, verification pairs and gates with their deciders; a branch for a phase or a sprint; practices; what
the process requirements add; the Definition of Done — in a form from the declaration's schema, and *Save*, which writes
the product's `docs/process.md` with `saveFile` as the person's own commit, naming the declared model's version by the
commit of the instance its catalogue was read at. When the catalogue as it stands holds another version of the declared
model than the commit the declaration names, the route shows what the new version changes for the product before *Save*
names it (UC-031 6a): the phases, gates and roles of `workflowOf` under each version, side by side; the difference of the
two model files; and what `declarationFindings` finds for the declaration as it would be saved. The other routes of the
module are not part of this item; how the dashboard's menu reaches the route is a change between jobs.

## Acceptance

- Unit tests that name MOD-implementation-pages state, before the code exists, through the route with fixture repositories: the page of a product without a declaration and of one with
Agent M's own; each model with what its `about` holds; each finding of the declaration shown before *Save*; *Save*
disabled while a role that needs a person has none, naming it; one commit of `docs/process.md` on the person's click,
whose `model_version` is the commit the catalogue was read at; for a declaration whose commit holds another version of
its model than the catalogue as it stands, the phases, gates and roles under each version side by side, the difference
of the two model files and the findings of the declaration as it would be saved, and none of them where the two
versions are the same; and a refused save keeping the person's edit.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
