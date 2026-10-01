---
id: ARC-020
title: Conventions — the Module line in code, the Guards and Level lines in tests, group files as nested lists, a withdrawal note for decisions and modules, and what a module file lists
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
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - NO STATE IN THE SPECIFICATION
  - UC-021
  - UC-023
  - UC-024
  - UC-025
  - UC-026
---
# ARC-020 Conventions for code, tests, groups, withdrawal and module files

## Context

Traceability (ARC-006) works only if code and tests say where they belong. A code file names the one
module it belongs to; a test names the requirement it guards and the module it exercises; each test
has one level and states its expected result readably. Hierarchies live in group files; a withdrawn
identifier is never reused and carries a note (`THE NAME IS THE ID AND IT SURVIVES`, UC-023 1a).

What exists: the core reads `Module: MOD-<slug>` from the first 20 lines of a code file behind a
comment marker (`headerModules`, `HEADER_LINES = 20`); the test fixture
`tests/fixtures/architecture/tests/reader.test.js` already carries `// Guards: RULE ONE` above its
`// Module:` line, though no code reads `Guards:` yet. UC-021 says a group file is "Markdown: groups as
a nested list, each member by its identifier".

A module file is read by people at review, by a participant that implements a neighbouring module
(UC-024 gives it "the interfaces — not the code — of the modules they use"), and by the dashboard,
which computes the component diagram, the module rows and the gaps from it (UC-025). The architecture
review of 2026-10-01 found three ways in which the module files told those readers more than was true:
`realises` named rules the module does not enforce, often the same rule in several modules; `provides`
listed internal helpers, so that most provided interfaces had no user and the `uses` graph looked
complete when it was not; and "Current state" sections described the code of one day, which the next
commit made wrong — the state the SPEC keeps out of its own text (`NO STATE IN THE SPECIFICATION`).

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
   regrouping touches only this file. Withdrawn decisions and modules stay listed, in a group of their
   own named *Withdrawn*.
4. **Withdrawal of a decision or module.** The file stays under its name. Its front matter gains
   `withdrawn: <YYYY-MM-DD>` and, where there is one, `replaced_by: <ARC-nnn | MOD-slug>`; the body gains
   a section `## Withdrawn` with the reason as its first paragraph. The identifier is never given to
   another file. The format check accepts both keys; the impact list shows every code file and test
   still naming it. A withdrawn module lists nothing under `realises`, `uses` and `provides`, and keeps
   its `## Responsibility` and `## Interfaces` headings, each saying where the responsibility went; a
   withdrawn decision keeps its `forced_by`, which says what it once answered.
5. **`realises` lists only the rules the module's own check exercises.** A rule belongs under a module's
   `realises` when the check the SPEC names for it runs this module's code — its unit or component test,
   or, for a rule the SPEC guards at review, the review of this module's behaviour. Each rule stands
   under one module. A rule whose check runs no single module — a scan of all code, a property of the
   repository's layout, of the build or of the SPEC's own text, or the agreement of all three runtimes —
   is named in the `forced_by` of the decisions it forces and under no module; the module view shows it
   among the requirements no module realises, which blocks nothing (`MODULE GAPS ARE REPORTED, NOT
   FORBIDDEN`). Use cases are named by the modules that carry their main flow.
6. **`provides` lists only the public API**: the interfaces another module or a shell uses, each
   described in `## Interfaces`. Helpers a module calls only itself are not listed. A shell's entry
   points — the function a runtime starts, and a value a shell hands to other modules as a port — are
   listed and say so. A module that uses another names each interface it calls under `uses`, so that the
   component diagram (UC-025 step 5) and the run order (`A RUN FOLLOWS THE MODULES' INTERFACES`) are
   computed from a complete graph; an interface passed in as a parameter (a port, ARC-003) is not a use.
7. **No "Current state" sections.** A module file states the target. Which code belongs to a module is
   read from the code's `Module:` lines (decision 1) when the module view is shown (UC-025); which code
   still has to move is the business of the implementation job that moves it (UC-024).
8. **A module file has a third section, `## Testing`,** after `## Interfaces`: the level of the module's
   tests (ARC-016), the seams a test replaces — the ports passed in, a clock, a random source —, and,
   where behaviour depends on a model, the rate that is measured instead of a verdict
   (`A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`). The format check requires only the first two
   sections, so a file without it stays valid.

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
- Withdrawn
  - ARC-008
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
- **`realises` as "every rule the module helps with"** — rejected: a rule claimed by five modules says
  nothing about which of them a change can break, and the module gaps then hide the rules nobody checks.
- **`provides` as every exported function** — rejected: an interface nobody uses cannot be told from one
  whose user forgot to declare it, so the graph cannot be checked for completeness.
- **A "Current state" section kept up to date by hand** — rejected: it is stored state that drifts
  (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` states the same for job states).

## Consequences

- `tests/artifact_checks.py` and `parseArchitecture` accept `withdrawn` and `replaced_by` as further
  front-matter keys and a third section; checking that `replaced_by` names an existing identifier is a
  code change for an implementation job, not part of this decision's file.
- A `Guards:` entry that matches no requirement name is reported as an unknown name, as any other
  reference is (ARC-006).
- Existing code and tests have no `Guards:` or `Level:` lines yet; they appear as gaps until an
  implementation job adds them.
- The rules that cross every module show as requirements no module realises. That list is the
  architecture's statement of which rules only the whole system can keep; it is read at review, not
  shortened by naming a module that does not check them.
- With `provides` limited to what is used, an interface that loses its last user is removed from the
  list; one that is still listed and unused is a finding of the module view.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023); open until accepted.*
