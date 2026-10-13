---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a8d1c223688e2dc60970b22260a2878b09b29492
  - https://github.com/akmaier/agent-m/pull/485
date: 2026-10-13 00:41 UTC
---
# Development → Release testing: ITM-451, drafted use cases, decisions, modules and items classified by their key

**REGISTER**

## Reason

ITM-451, pull request #485 by developer-sonnet-c into `sprint/team1/26`, head `a8d1c22`. The first commit
`808ea79` adds only `tests/job-runner-candidate-keys.test.mjs`, and CI is red on it on its four new tests alone
(run 38326920216). CI is green on `a8d1c22` (run 38328206972), ITM-369's component tests among the passing. Only
`src/job-runner/builtins.mjs` and the new test, naming MOD-job-runner and its guards, change; no existing test
changes. 23 planted faults are recorded, none surviving. The Acceptance holds: a drafted use case, module or item with
an existing one's key, classed new, goes back naming it; each kind is compared with its own; a file of no match keeps
its class; a draft of tests is not classified; `classes` holds the documents' classes. The change does what ITM-451's
Outcome states, by MOD-documents' keys as its file gives them.

The consequence weighed. A document's key is one field: the `title` of a use case, a decision and an item, the `id`
of a module. MOD-documents' `classifyCandidates` takes an equal key as a duplicate "whatever its participant
proposed", and ITM-450 keeps "a key of one field … decided by that field, as today". So a drafted change of a document
that keeps its title or identifier is a duplicate by rule. The pull request shows this over this repository: 383 of 383
documents drafted as changes of themselves. Among the catalogue's kinds, `change-architecture` runs
`candidate-classes` (MOD-job-catalogue), so every change of a decision that keeps its title would be sent back;
`change-use-case` does not run the check. For requirements, akmaier ruled that duplicate and change are two things, and
ITM-450 builds it by letting the rule decide. `THE DERIVATION RULES HOLD FOR ARCHITECTURE` applies `EXACT DUPLICATES
ARE FOUND WITHOUT A MODEL` and `A CHANGE IS PROPOSED UNDER THE EXISTING NAME` to decisions too. A one-field key has no
second value, like a requirement's rule, to tell the two apart. So the texts do not settle it: making it settle needs a
key that holds the document's text, or a rule for one-field keys, in MOD-documents' file. That is for akmaier, not an
item; the item to build it follows his decision. ITM-451 is not the defect, and it passes.

Noted for the review: the new test uses the file-header form, which `docs/instructions/developers.md` asked for until
`e982697`.
