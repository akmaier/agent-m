---
id: MOD-trace-pages
title: One trace page for every view over the trace graph
folder: src/trace-pages/
realises:
follows:
  - ARC-038
uses:
  - MOD-site-frame.View
  - MOD-site-frame.chosenProduct
  - MOD-site-frame.explain
  - MOD-site-frame.notice
  - MOD-site-frame.confirmDecision
  - MOD-markdown-render.renderArtifact
  - MOD-markdown-render.renderMermaid
  - MOD-markdown-render.showDifference
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.readHistory
  - MOD-repository-hosts.listTags
  - MOD-repository-hosts.webLinks
  - MOD-documents.artifactSchemas
  - MOD-documents.readDocument
  - MOD-spec-document.parseSpec
  - MOD-group-document.parseGroupFile
  - MOD-group-document.hierarchy
  - MOD-test-document.testDeclarations
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.tracesTo
  - MOD-trace-graph.coverageGaps
  - MOD-trace-graph.compareGraphs
  - MOD-trace-graph.moduleRows
  - MOD-trace-graph.graphFindings
  - MOD-approvals.statuses
  - MOD-spec-changes.queues
  - MOD-spec-changes.requirementHistory
  - MOD-source-register.sourceSchemas
  - MOD-source-register.linkedVersion
  - MOD-test-schedule.occasionsOf
  - MOD-result-records.resultsAt
  - MOD-result-records.flakyTests
  - MOD-result-records.rateComparison
  - MOD-result-records.testHistory
  - MOD-release-evidence.auditRows
  - MOD-release-evidence.auditDocument
  - MOD-artifact-edits.saveFile
provides:
  - view
---
# MOD-trace-pages One trace page for every view over the trace graph

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is every view that reads the trace graph of one version of a
product, written once as a template method: choosing a version — the default branch or a release tag, and a second one
to compare —, showing a tree or a table, narrowing it by filters, opening a row, and following its links. A view takes
part through its **descriptor**. The views are the specification browser with each requirement's traces, proposals and
history; the coverage gaps; the modules view with its component diagram; the tests browser; and the audit of a release
with its export. Everything is derived when it is shown, from the artifacts of the chosen version; nothing is read from a
stored matrix (`THE TRACEABILITY MATRIX IS DERIVED`).

It serves UC-020, UC-025, UC-029 and UC-030. Editing, changing by prompt and arranging are the review pages' routes,
which its links lead to.

It runs in a browser, loaded by `docs/index.html` through MOD-site-frame.

## Parts

- `index.mjs` — the interface: `view`.
- `flow.mjs` — the template method: version choice and comparison, tree or table, filters, a row's detail, links.
- `views.mjs` — the five descriptors.
- `diagram.mjs` — the component diagram of the modules view, as Mermaid.
- `export.mjs` — saving the audit document in the browser.

## Data

It keeps nothing but the screen. It owns the **descriptor** of a trace view:

```text
TraceView = {
  key: "specification" | "gaps" | "modules" | "tests" | "audit",
  entry: "requirements" | "architecture" | "tests" | "releases",   // the menu entry it is under
  versions: "branch-and-tags" | "tags",                            // what the version choice offers; a second version compares
  shape: "tree" | "table",
  rows: (graph, facts) -> Row[],                                   // built from the trace graph and the services' facts
  groupings: string[],                                             // the ways its rows can be grouped
  filters: Filter[],                                               // { name, values, keep(row) -> boolean }
  detail: (row, facts) -> Section[],                               // what opening a row shows
  links: (row) -> Link[],                                          // routes it leads to, its own or the review pages'
  extras: string[]                                                 // "component-diagram", "export"
}
```

| View | Versions | Shape and rows | Opening a row | Extras |
|---|---|---|---|---|
| specification | branch and tags | tree of `docs/groups/requirements.md`, every requirement once with its status — in SPEC, change proposed, removal proposed, proposed —, each group with how many it holds and how many no use case realises | the four fields; sources with version and part; use cases with their review status; decisions, modules and tests naming it; open proposals; its history of accepted changes | *Edit*, *Change by prompt*, *Arrange* to the review pages, on the default branch only |
| gaps | branch and tags | table of requirements realised by no use case and named by no module or test, use cases realising none, names matching nothing | the artifact as it read in that version | what became covered and what lost its coverage between two versions |
| modules | branch | table of modules: subsystem, the requirements its tests guard with their statuses, its file, code, tests; and every gap | the module's file and folder | component diagram: one box per module in its subsystem's box, one arrow per use, gaps marked, a missing provider as a box marked *missing*; *Change the architecture* and *Implement* |
| tests | branch and tags | tree by level, file and case, or by requirement, use case or module, each test with its outcome on the latest commit | its declaration, its schedule, its counter-proof, its code, its history across commits and releases | comparing two releases |
| audit | tags | one row per requirement valid at the tag, with a summary at the top | the guarding tests with outcomes or rates and counter-proofs, process gates, the acceptance of the report | *Export* as one Markdown document; *Commit export* |

## Interfaces

- `view: View` — the routes of the five trace views, `trace/<key>`, each with its version and filters in its `params`,
  and `trace/<key>/<row>` for an opened row; its strategies are none, since it runs no job.

## Files

It writes one file, and only on a person's click: the audit document under `docs/audits/<tag>.md` (*Commit export*).
It reads the product's snapshot at the chosen version through its host — the SPEC, the group files, use cases,
architecture files, code files, tests, approval records, the product's links to sources —, the history of the SPEC and
the result records on the branch `test-results`.

## Uses

- MOD-site-frame.View, MOD-site-frame.chosenProduct, MOD-site-frame.explain, MOD-site-frame.notice,
  MOD-site-frame.confirmDecision — the frame's parts of every route.
- MOD-markdown-render.renderArtifact, MOD-markdown-render.renderMermaid, MOD-markdown-render.showDifference — rows'
  details, the component diagram, the comparison of versions.
- MOD-repository-hosts.readSnapshot, MOD-repository-hosts.readHistory, MOD-repository-hosts.listTags,
  MOD-repository-hosts.webLinks — the version, the history of a requirement's section, the release tags, a test's code
  and a run's log on the server.
- MOD-documents.artifactSchemas, MOD-documents.readDocument, MOD-spec-document.parseSpec, MOD-group-document.parseGroupFile,
  MOD-group-document.hierarchy, MOD-test-document.testDeclarations — the artifacts of the version.
- MOD-trace-graph.traceGraph, MOD-trace-graph.tracesTo, MOD-trace-graph.coverageGaps, MOD-trace-graph.compareGraphs,
  MOD-trace-graph.moduleRows, MOD-trace-graph.graphFindings — the rows, gaps, unknown names and comparisons.
- MOD-approvals.statuses — the review status of use cases and architecture files.
- MOD-spec-changes.queues, MOD-spec-changes.requirementHistory — open proposals and a requirement's history.
- MOD-source-register.sourceSchemas, MOD-source-register.linkedVersion — a requirement's sources with version and part.
- MOD-test-schedule.occasionsOf — when the schedule runs a test.
- MOD-result-records.resultsAt, MOD-result-records.flakyTests, MOD-result-records.rateComparison,
  MOD-result-records.testHistory — outcomes, flaky tests, rates and history.
- MOD-release-evidence.auditRows, MOD-release-evidence.auditDocument — the audit and its document.
- MOD-artifact-edits.saveFile — *Commit export*, as the person's own input.
