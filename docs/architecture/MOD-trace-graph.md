---
id: MOD-trace-graph
title: The trace graph and everything derived from it
folder: src/trace-graph/
realises:
follows:
  - ARC-048
uses:
  - MOD-documents.artifactSchemas
  - MOD-documents.readDocument
  - MOD-documents.Document
  - MOD-identifiers.identifiersIn
  - MOD-identifiers.kindOfIdentifier
  - MOD-identifiers.positionalReferences
  - MOD-identifiers.IdentifierKind
  - MOD-identifiers.pagesAddress
  - MOD-spec-document.parseSpec
  - MOD-spec-document.Spec
  - MOD-test-document.testDeclarations
  - MOD-test-document.TestDeclaration
  - MOD-group-document.parseGroupFile
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
provides:
  - TextSource
  - Graph
  - Traces
  - Gaps
  - ImpactEntry
  - ArchitectureImpact
  - ModuleRow
  - ModuleGap
  - Comparison
  - traceGraph
  - graphFindings
  - tracesTo
  - coverageGaps
  - requirementImpact
  - architectureImpact
  - moduleOrder
  - moduleRows
  - compareGraphs
  - selfSufficiencyFindings
---
# MOD-trace-graph The trace graph and everything derived from it

## Responsibility

It belongs to the artifact model (ARC-048). From the files of one repository at one commit it builds the graph of every
identifier and of what names it — requirements, use cases, architecture decisions, modules, tests, items, the sources a
requirement names, and the code files in the modules' folders —, and derives from that graph alone what needs several
artifacts at once: the checks across artifacts, the traces of a requirement, the coverage gaps, the impact lists of a
change, the order of the modules by their uses, the module rows of UC-025, the comparison of two versions, and
references to what exists only inside Agent M. The matrix is computed every time and never stored (`THE TRACEABILITY
MATRIX IS DERIVED`). It runs in a browser and in Node; it reads only through the function it is given and writes nothing.

## Parts

- `index.mjs` — the interface.
- `build.mjs` — reading the artifacts of a repository into the graph.
- `code.mjs` — code files by module folder, and the imports between module folders.
- `checks.mjs` — the checks across artifacts.
- `derive.mjs` — traces, gaps, impact lists, module order and rows, comparison.

## Data

It keeps nothing between calls. A graph lives as long as its caller holds it.

What it reads, and as what:

| Path | Read as |
|---|---|
| `SPEC.md` | requirements, through MOD-spec-document |
| `docs/use-cases/UC-*.md`, `docs/architecture/ARC-*.md`, `docs/architecture/MOD-*.md`, `docs/plan/ITM-*.md`, `docs/backlog/ITM-*.md` | documents, through MOD-documents with the schemas it owns |
| test files — files under a folder named `test`, `tests` or `__tests__`, or named as tests are in their language | test declarations, through MOD-test-document |
| `docs/groups/<kind>.md` | the groups' titles, through MOD-group-document, so that a group's title named where an identifier is expected is found |
| code files — files whose extension names a programming or style-sheet language, outside `docs/`, test files and folders named `vendor` or `node_modules` | paths, and for JavaScript, TypeScript, Python and CSS the modules they import |

A code file belongs to the module whose `folder` holds it; a module's folder is named after its identifier (`A MODULE IS
A FOLDER`).

## Interfaces

- `TextSource` — `{ paths: string[], read(path: string) -> Promise<string | null> }`: the files of one repository at one
  commit, as the caller hands them; a snapshot of Access fits it.
- `Graph` — `{ commit: string | null, nodes: Map<string, { id: string, kind: IdentifierKind | "code", path: string, line:
  number, title: string | null, blob: string | null }>, edges: { from: string, to: string, via: "realises" | "forced_by" |
  "designs" | "follows" | "refines" | "uses" | "guards" | "exercises" | "changes" | "builds_on" | "source" | "imports" |
  "names", path: string, line: number }[], unread: { path: string, reason: string }[] }` — every node and every link, and
  the files it could not read with the reason.
- `Traces` — `{ sources: string[], useCases: string[], decisions: string[], modules: string[], tests: string[], items:
  string[] }`.
- `Gaps` — `{ requirementsWithoutUseCase: string[], requirementsWithoutModule: string[], requirementsWithoutTest:
  string[], useCasesWithoutRequirement: string[], unknownNames: { name: string, namedBy: { id: string, path: string,
  line: number }[] }[] }`.
- `ImpactEntry` — `{ id: string, kind: IdentifierKind, path: string, line: number, via: string }`: one artifact that names
  what changes, and how.
- `ArchitectureImpact` — `{ modules: { id: string, why: "changed" | "uses an interface that changes" | "uses an interface
  that is removed", breaks: boolean }[], codeFiles: string[], tests: { id: string, guards: string[] }[], named: { added:
  string[], removed: string[] }, items: string[] }`.
- `ModuleRow` — `{ module: string, subsystem: string | null, realises: string[], describedBy: string, code: string[],
  tests: string[], imports: string[], importsRead: boolean }`.
- `ModuleGap` — `{ kind: string, artifact: string, path: string, what: string }`, its `kind` one of the gaps
  `moduleRows` lists.
- `Comparison` — `{ requirements: { added: string[], changed: string[], removed: string[] }, coverage: { gained: { name:
  string, by: string }[], lost: { name: string, by: string }[] } }`.
- `traceGraph(source: TextSource, options?: { commit?: string }) -> Promise<Graph>` — reads the repository's artifacts and
  code files as listed under Data and builds the graph. A file that cannot be read, or not read as its format, is listed
  in `unread` with the reason, never left out silently; the findings of a single document's format are MOD-documents' and
  are not repeated here. Rejects only when `source.read` itself rejects, with that error.
- `graphFindings(graph: Graph) -> Finding[]` — the checks across artifacts, each an error naming the artifact and line:
  a name in `realises`, `forced_by`, an item's `realises` or a test's `guards` that matches no requirement or use case
  (`A USE CASE REALISES NAMED REQUIREMENTS`, `EVERY ARTIFACT NAMES ITS ORIGIN`); a used interface that its module does not
  provide (`DEVELOP AGAINST INTERFACES`); a cycle among the modules' uses (`MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE`);
  a module designed by no decision or by more than one, or that does not follow the decision that designs it (`A MODULE
  BELONGS TO ONE SUBSYSTEM`); more or fewer than one decision without `refines`, or a decision that does not refine it
  (`ONE DECISION STATES THE WHOLE ARCHITECTURE`); an item that names a module the architecture does not describe (`A
  BACKLOG ITEM NAMES THE MODULES IT CHANGES`), or a plan step whose tests are not those of its level (`A PLAN STEP NAMES
  THE TESTS OF ITS LEVEL`); a module whose folder is not named after its identifier, or lies inside another module's
  folder (`A MODULE IS A FOLDER`); a name where an identifier is expected that is the title of a group (`A GROUP CARRIES
  NO IDENTIFIER`); and a reference by position (`A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`).
- `tracesTo(graph: Graph, name: string) -> Traces` — for a requirement, its sources and every use case, decision, module,
  test and item that names it (`A REQUIREMENT SHOWS WHAT TRACES TO IT`); a module traces to a requirement through the
  tests of it that guard the requirement.
- `coverageGaps(graph: Graph) -> Gaps` — the requirements no use case realises and — once modules and tests exist — no
  module realises and no test guards; the use cases that realise nothing; every name that matches no requirement, with
  what names it (`UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`). The gaps are shown; none blocks anything.
- `requirementImpact(graph: Graph, name: string) -> ImpactEntry[]` — every artifact that names the requirement, which a
  change to it must list (`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`).
- `architectureImpact(graph: Graph, changes: { path: string, before: string | null, after: string | null }[]) ->
  ArchitectureImpact` — for changed, added or removed decision and module files: the modules they concern and the modules
  that use an interface they alter or remove, marked as breaking; the code files in each affected module's folder; the
  tests that exercise those modules and the requirements those tests guard; the requirements and use cases the files name
  and no longer name; the plan steps and backlog items that name an affected module (`AN ARCHITECTURE CHANGE IS NOT
  ACCEPTED WITHOUT AN IMPACT LIST`).
- `moduleOrder(graph: Graph) -> { order: string[] } | { cycle: string[] }` — the modules in an order in which every module
  stands after every module whose interfaces it uses, or the modules of a cycle when there is one (`A RUN FOLLOWS THE
  MODULES' INTERFACES`).
- `moduleRows(graph: Graph) -> { rows: ModuleRow[], gaps: ModuleGap[] }` — one row per module, as UC-025 shows it, and
  the gaps (`MODULE GAPS ARE REPORTED, NOT FORBIDDEN`): a module in no subsystem or whose subsystem's decision does not
  name it; a module that realises no requirement; an accepted requirement no module realises — accepted as its caller
  marks it —; a module no test exercises, or without code; a code file outside every module's folder, or a folder no
  module names; an import between modules that the importing module's file does not name among the interfaces it uses;
  a module folder inside another; a name that matches nothing. Where imports could not be read for a file's language,
  `importsRead` is false and the row says so.
- `compareGraphs(earlier: Graph, later: Graph) -> Comparison` — the requirements added, changed and removed between two
  versions, and the coverage gained and lost (UC-020).
- `selfSufficiencyFindings(graph: Graph, instance: string) -> Finding[]` — an error under `THE PRODUCT REPOSITORY IS
  SELF-SUFFICIENT` for each link in an artifact to a file that the repository does not hold, to the instance's
  repository `instance`, given as `owner/name`, or to its dashboard at the address MOD-identifiers' `pagesAddress` gives it
  (`AN INSTANCE IS A FORK OF AGENT M`). MOD-job-runner's check `graph-checks` runs it on every draft.

## Files

It reads, through the `TextSource` it is given, the files listed under Data. It writes no file.

## Uses

- `MOD-documents.artifactSchemas`, `MOD-documents.readDocument` and the type `MOD-documents.Document` — to read use cases,
  decisions, module files and items by their schemas.
- `MOD-identifiers.identifiersIn`, `MOD-identifiers.kindOfIdentifier`, `MOD-identifiers.positionalReferences` and the type
  `MOD-identifiers.IdentifierKind` — to find the identifiers and names a text writes, their kinds, and references by
  position; `MOD-identifiers.pagesAddress` — the instance's dashboard, which no artifact may link.
- `MOD-spec-document.parseSpec` and the type `MOD-spec-document.Spec` — to read the requirements.
- `MOD-test-document.testDeclarations` and the type `MOD-test-document.TestDeclaration` — to read the tests.
- `MOD-group-document.parseGroupFile` — to read the groups' titles.
- `MOD-text-tools.finding` and the type `MOD-text-tools.Finding` — the findings it reports.
