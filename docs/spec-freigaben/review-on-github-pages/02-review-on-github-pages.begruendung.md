# 10. Review on GitHub Pages: A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES withdrawn

**The change.** `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES` is withdrawn: its block — name, rule and
check — leaves the section. Every other byte of the section is carried over.

**Why.** akmaier, 2026-11-09: agents need the freedom to act, and "the agent does not have to follow the Dashboard UI.
This makes all only very complicated and the usability will be terrible." The rule is "bad and is to be removed", not
reworded. It bound a change by prompt to the derivation from a source: every resulting requirement classed new, a
change, a duplicate or a conflict, and a candidate whose name or normalised rule equals an existing requirement's forced
to a duplicate. A rename keeps the rule and changes the name, so it can never pass that rule. Job
JOB-20261109-0911-98ce of akmaier/AlienInvasion proposed `IMPLEMENTATION JAVASCRIPT WEB` for
`IMPLEMENTATION_JAVASCRIPT_WEB`, and the five `SESSION_HIGHSCORE_*` requirements of that product's open entry
`requirements/02` under their names in the scheme. Every candidate was forced to a duplicate, because the requirements of
the open entry counted as existing requirements.

With the rule gone, a change by prompt is the participant's new text: Agent M gives it the texts the change touches —
the sections, the open entries' proposals, the group file —, and it returns their new text, as a person writes it in the
editor. No new sentence is needed for that, since the SPEC already says it (*Nothing the SPEC already says*):
- the text is saved as a queue entry: `A SPEC EDIT IS SAVED AS A PROPOSAL` ("typed or drafted by a participant"), and
  for a CI agent `A CI AGENT'S DRAFT ENTERS AS OPEN`;
- its form is checked and sent back: every requirement of the form holds for every requirement (`A REQUIREMENT HAS FOUR
  FIELDS`, `EVERY ARTIFACT HAS AN IDENTIFIER`, `ONE STATEMENT PER REQUIREMENT`, `A REQUIREMENT NAMES ITS CHECK`),
  `THE PERSON WHO PROMPTS IS A SOURCE` holds for a requirement drafted from an instruction, and `A DRAFT THAT FAILS A
  CHECK GOES BACK TO ITS PARTICIPANT` sends back what fails one of Agent M's checks, after `A DRAFTING JOB RECEIVES THE
  FORM ITS DRAFT IS CHECKED BY` has given the drafter the form;
- it is shown against the current text and accepted or rejected by a person: `A DRAFTED CHANGE IS SHOWN AGAINST THE
  CURRENT TEXT`, `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`, `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS
  WRITTEN`, `A PROPOSAL IS REJECTED WITH A REASON`;
- what it renames follows from the two texts: `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`, for an edit, which
  `A SPEC EDIT IS SAVED AS A PROPOSAL` says may be drafted by a participant;
- a change to a requirement that an open entry proposes is a change of that entry: the SPEC forbids it nowhere, and
  `A CI AGENT'S DRAFT ENTERS AS OPEN` and `A SPEC EDIT IS SAVED AS A PROPOSAL` admit an entry of a change queue; UC-006 3a
  and UC-018 1a already save an open entry in place;
- the grouping is edited as any arrangement is: `A REGROUPING IS COMMITTED DIRECTLY` on the person's save, and, for a
  CI agent, a pull request, since `A CI AGENT'S DRAFT ENTERS AS OPEN` admits nothing else on the default branch.

The derivation rules — `DERIVATION SEES THE EXISTING REQUIREMENTS` to `CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES`,
and `THE DERIVATION RULES HOLD FOR ARCHITECTURE` — stay as they stand and apply to deriving requirements from a source
alone (*One responsibility per rule*).

**Impact list.**
- `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES`: withdrawn; no other requirement of the SPEC names it.
  Named by UC-019 (`realises`), ARC-041 and ARC-046 (forced by), MOD-job-runner (`propose-edit`),
  `docs/groups/requirements.md`, the backlog items ITM-337, ITM-369 and ITM-414 and the sprints `team1/16` and
  `team1/26`, and the headers of `tests/test_derivation_context.py`, `tests/spec-changes-requirement-recipes.test.mjs`,
  `tests/specification-and-design-drafting-together.test.mjs`, `tests/release-uc-019-change-by-prompt.test.mjs` and
  `tests/release-uc-019-change-requirements-by-prompt.test.mjs`. UC-019, UC-012, ARC-041, ARC-046, MOD-job-catalogue,
  MOD-job-runner, MOD-spec-changes, MOD-review-pages and MOD-maintenance-pages are drafted beside this entry. Once it is accepted, the group
  file drops the name, and the tests and the code follow in the modules' implementation jobs. Backlog items and sprints
  are records of done work and stay as they are.

**Origin.** akmaier's decision of 2026-11-09 on job JOB-20261109-0911-98ce of akmaier/AlienInvasion.
