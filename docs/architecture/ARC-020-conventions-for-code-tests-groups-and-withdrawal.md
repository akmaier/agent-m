---
id: ARC-020
title: Conventions — the Module line in code, the Guards and Level lines in tests, group files as nested lists, and a withdrawal note for decisions and modules
forced_by:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - THE NAME IS THE ID AND IT SURVIVES
  - AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
  - EVERY TEST HAS ONE LEVEL
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
  - A GROUP CARRIES NO IDENTIFIER
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
  - UC-021
  - UC-023
  - UC-024
  - UC-026
---
# ARC-020 Conventions for code, tests, groups and withdrawal

## Context

Traceability (ARC-018) works only if code and tests say where they belong. A code file names the one
module it belongs to; a test names the requirement it guards and the module it exercises; each test
has one level and states its expected result readably. Hierarchies live in group files; a withdrawn
identifier is never reused and carries a note (`THE NAME IS THE ID AND IT SURVIVES`, UC-023 1a).

What exists: the core reads `Module: MOD-<slug>` from the first 20 lines of a code file behind a
comment marker (`headerModules`, `HEADER_LINES = 20`); the test fixture
`tests/fixtures/architecture/tests/reader.test.js` already carries `// Guards: RULE ONE` above its
`// Module:` line, though no code reads `Guards:` yet. UC-021 says a group file is "Markdown: groups as
a nested list, each member by its identifier".

## Decision

1. **Code files** carry, among their first 20 lines, one comment line `Module: MOD-<slug>` (exists).
   A file naming two modules is a gap (UC-025 3a).
2. **Tests** carry, among their first 20 lines, comment lines:
   - `Module: MOD-<slug>` — the module the test exercises (same syntax as code);
   - `Guards: <NAME>[; <NAME> …]` — what it guards: requirement names in capitals exactly as in the
     SPEC, or `UC-<nnn>`, separated by `; ` (a semicolon, because names such as
     `ONE DEFINITION, THREE DRIVERS` contain commas and no live name contains a semicolon);
   - `Level: unit|component|system|release|user`;
   - per test case, `TST-<nnn>` in the case's name, with its expected result as the assertion or, for
     a `user` test, as a line `Expected: …`.
   A test file with several cases may put `Guards:` per case in the comment directly above it.
3. **Group files** `docs/groups/<kind>.md`: a heading, one explaining paragraph, then a nested Markdown
   list. A list item that is not an identifier is a group title; an item that is an identifier is a
   member; nesting by two-space indentation. Items of one kind only; each identifier once; identifiers
   not listed are shown at the top level. The file names no status and no other artifact's data, so
   regrouping touches only this file.
4. **Withdrawal of a decision or module.** The file stays under its name. Its front matter gains
   `withdrawn: <YYYY-MM-DD>` and, where there is one, `replaced_by: <ARC-nnn | MOD-slug>`; the body gains
   a section `## Withdrawn` with the reason as its first paragraph. The identifier is never given to
   another file. The format check accepts both keys; the impact list shows every code file and test
   still naming it.

Example of a test header:

```js
// Module: MOD-review-core
// Guards: STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT
// Level: unit
```

Example of a group file:

```markdown
# Architecture decisions — groups

- Dashboard and review
  - ARC-001
  - ARC-002
- Agent M Bridge
  - ARC-011
```

## Alternatives

- **Traceability in a separate mapping file** — rejected: a second place that says which file belongs
  to which module is a hand-kept matrix (`THE TRACEABILITY MATRIX IS DERIVED`).
- **Test-framework tags or decorators** (`@guards(...)`) — rejected: every language and framework
  differs; a comment line is read the same way in all of them, as `Module:` already is.
- **Groups in front matter of the artifacts** — rejected by `REGROUPING LEAVES THE GROUPED FILE
  UNCHANGED`: regrouping would change accepted files.
- **Deleting a withdrawn file** — rejected: its identifier would vanish without the note the SPEC
  requires, and approval records would point at nothing.

## Consequences

- `tests/artifact_checks.py` and `parseArchitecture` have to accept `withdrawn` and `replaced_by` and
  check that `replaced_by` names an existing identifier; that is a code change for an implementation
  job, not part of this decision's file.
- A `Guards:` entry that matches no requirement name is reported as an unknown name, as any other
  reference is (ARC-018).
- Existing code and tests have no `Guards:` or `Level:` lines yet; they appear as gaps until an
  implementation job adds them.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
