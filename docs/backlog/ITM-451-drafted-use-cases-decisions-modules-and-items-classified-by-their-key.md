---
id: ITM-451
title: Drafted use cases, decisions, modules and items classified by their key
level: module
realises:
  - UC-007
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - THE DERIVATION RULES HOLD FOR ARCHITECTURE
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-job-runner
builds_on:
  - ITM-387
  - ITM-378
tests:
  - unit
origin:
  - UC-007 6a
  - MOD-job-runner, Data: the check candidate-classes
---
# ITM-451 Drafted use cases, decisions, modules and items classified by their key

**REGISTER**

## Outcome

The check `candidate-classes` in MOD-job-runner's `builtins.mjs`, as its file states it. Today (ITM-387) it classifies only
drafts of requirements, `{ candidates }`; a draft of files or of items has no class, and `classes` is `[]`. The accepted
texts give each format of MOD-documents its key — the schema language's `key`: the `title` of a use case, a decision and an
item, the `id` of a module — so the check classifies a drafted use case, decision, module file or item too: each drafted
document read with the schema `artifactSchemaOf` names for its path and with `readDocument`, its key the values of that
schema's `key` fields, against the artifacts of its kind the job's parts carry. A drafted use case whose title equals an
existing use case's is a duplicate of it by rule, and a drafter that classed it otherwise is sent back naming that use case
(UC-007 6a). A draft of tests has no key and is not classified. The recipes that fill the parts' artifacts are their
modules' (ITM-332, ITM-337).

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists, with a fixture recipe whose part carries existing use
  cases, a decision, a module and an item: a drafted use case whose title equals an existing one's, classed new, sent back
  naming it; a drafted module whose identifier, and a drafted item whose title, equal an existing one's, the same; a
  drafted file of no key's match keeping its class; a draft of tests not classified; `classes` holding the drafted
  documents' classes; ITM-387's cases asserting what they asserted.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
