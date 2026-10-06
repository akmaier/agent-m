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
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-218
  - ITM-219
  - ITM-221
  - ITM-228
  - ITM-229
  - ITM-230
  - ITM-231
tests:
  - unit
origin:
  - UC-002
---
# ITM-222 How this product is developed

**REGISTER**

## Outcome

MOD-implementation-pages' route `process` — *How this product is developed* —, as its file states it, in
`src/implementation-pages/`, for UC-002:
- the five models in their two groups, each with what its `about` holds (ITM-229);
- the roles, each with whether a person, an agent or either may hold it and the capabilities it needs, and the
  participants offered for it — only those with every capability, each with where it processes data —, from the
  instance's register read with MOD-participant-list's reader (ITM-230); for a role no participant can hold, the missing
  capability and a link to the participants (4b);
- phases, transitions, verification pairs and gates with their deciders; a branch for a phase or a sprint; practices;
  what the process requirements add, or that there are none (7a); the Definition of Done;
- all in a form from the declaration's schema, with each finding of `declarationFindings` beside its field — given the
  product's linked sources, read from its `docs/sources.md` with the links schema (ITM-228) and from the instance's
  register —, and *Save*, offered only without an error, which writes the product's `docs/process.md` with `saveFile` as
  the person's own commit, naming the declared model's version by the commit of the instance its catalogue was read at;
- when the author selects another model than the declared one, the kinds of artifact the declared model's phases produce
  and the selected one's do not, none of them deleted (3b).

Reading the linked sources and the list of 3b follow parts 2 and 3 of the change request in sprint 06's record; the item
waits for akmaier's decision on it. The comparison of two versions of the declared model (UC-031 6a) and the other routes
of the module are not part of this item. How the dashboard reaches the route is a change between jobs.

Before `declarationFindings` judges it and before `saveFile` writes it, the form's document is written with `writeDocument`
and read back with `readDocument`, so that an edited section's rows are read again. The route inserts the form into the
page in the same turn as `schemaForm` returns it, so that its first field is focused.

## Acceptance

- Unit tests that name MOD-implementation-pages state, before the code exists, through the route with fixture
  repositories:
  - the page of a product without a declaration, and of one with Agent M's own;
  - each model with what its `about` holds;
  - for a role, exactly the participants with every capability it needs, each with its place; for a role none can hold,
    the missing capability named;
  - each finding of the declaration shown before *Save*, among them a holder at a place a linked source does not permit;
  - *Save* disabled while a role that needs a person has none, naming it;
  - one commit of `docs/process.md` on the person's click, whose `model_version` is the commit the catalogue was read at;
  - another model selected: the kinds of artifact the declared one produces and the selected one does not;
  - a product without process requirements, told so;
  - a refused save keeping the person's edit.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
