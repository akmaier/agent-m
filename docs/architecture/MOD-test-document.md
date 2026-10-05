---
id: MOD-test-document
title: The declaration of a test case
folder: src/test-document/
realises:
follows:
  - ARC-048
uses:
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
provides:
  - TestDeclaration
  - testDeclarations
  - testFindings
---
# MOD-test-document The declaration of a test case

## Responsibility

It belongs to the artifact model (ARC-048). It owns the form in which a test case declares itself inside a test file of
any language — its identifier, its one level, what it guards, the module it exercises, its precondition, input and
expected result — so that what a test checks can be read without running it (`A TEST STATES ITS EXPECTED RESULT BEFORE IT
RUNS`), and it checks these declarations. It runs in a browser and in Node, and performs no input or output.

## Parts

- `index.mjs` — the interface.
- `declarations.mjs` — finding the declarations in a file.
- `checks.mjs` — the findings of a declaration.

## Data

It keeps nothing. It owns the **test declaration**: a block of comment lines directly before a test case, in the
comment marker of the file's language — `//`, `#`, `--`, `;` or ` *` inside a block comment —, or, for a manual test of
level `user`, the same lines under a heading `### TST-<nnn> <title>` in a Markdown file. Its first line names the
identifier; each following line is `key: value`.

```text
// TST-014 · level: unit · module: MOD-text-tools
// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: a finding of kind error on line 4 of UC-007
// input: the finding formatted as text
// expect: "UC-007:4: error: … [A FINDING READS LIKE A COMPILER MESSAGE] — …"
```

| Key | Holds | Required |
|---|---|---|
| `TST-<nnn>` | the test case's identifier, on the first line | yes |
| `level` | one of `unit`, `component`, `system`, `release`, `user` (`EVERY TEST HAS ONE LEVEL`) | yes |
| `module` | the module it exercises, `MOD-<slug>`; for a test of level `system`, `release` or `user`, which exercises the whole product, the word `system` | yes |
| `guards` | the requirements it guards by name, or use cases by identifier, separated by `;` | yes |
| `given` | the precondition | yes |
| `input` | the input | yes |
| `expect` | the expected result | yes |
| `runs` | for a test whose outcome depends on a model's answer, the number of runs, fixed before the first | for such a test |
| `phrasings` | for such a test, how many phrasings of the same question it holds | for such a test |
| `paid` | the name of a paid service it calls, if any | when it calls one |

A declaration ends at the first line that is not a comment line of this form.

## Interfaces

- `TestDeclaration` — `{ id: string, level: "unit" | "component" | "system" | "release" | "user", module: string | null,
  guards: string[], given: string | null, input: string | null, expect: string | null, runs: number | null, phrasings:
  number | null, paid: string | null, path: string, line: number }`; `module` is a module's identifier or the word
  `system`.
- `testDeclarations(path: string, text: string) -> TestDeclaration[]` — every declaration in a test file, in order. It
  never throws on content: a declaration missing a key is read with that key `null`, and `testFindings` names it. A file
  with no declaration yields none; the caller decides whether that is a gap.
- `testFindings(declaration: TestDeclaration) -> Finding[]` — an error under `EVERY TEST HAS ONE LEVEL` for a missing or
  unknown level; under `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS` for a missing precondition, input or expected
  result; under `EVERY ARTIFACT NAMES ITS ORIGIN` for a test that guards nothing or names no module, or a test of level
  `unit` or `component` that names `system`; under `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE` for a test with `phrasings` and
  no `runs`, or with fewer than two runs. Whether a guarded name exists, and whether a commit-level test calls a paid
  service, need the graph and the schedule; they are decided by MOD-trace-graph and by the test schedule's owner.

## Files

It reads and writes no file; its callers give it the texts of test files.

## Uses

- `MOD-text-tools.finding` and the type `MOD-text-tools.Finding` — the findings it reports.
