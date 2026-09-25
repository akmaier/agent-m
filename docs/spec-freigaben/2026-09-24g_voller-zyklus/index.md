# SPEC approvals — queue 2026-09-24g · the full cycle

**PO, 2026-09-24:** use cases and rules for editing (editor and prompt), the specification browser and
hierarchies, architecture and implementation, multi-level tests and CI, process execution with backlog
and jobs, issues from a mailbox, product resources — and "job"/"phase" instead of "stage".

Drafted by six subagents in parallel (one per topic), each reading `CLAUDE.md`, the maintenance rules,
the SPEC, the existing use cases and the relevant book chapters; **integrated by the main agent**: every
draft read in full, cross-checked, two duplicates dropped (entries 06 and 08 say which), the entries
assembled from the current SPEC so that only the intended lines change.

**Size:** about 115 new requirements, 7 extended under their existing names, 1 withdrawn and renamed, the preamble corrected (entry 12), and Agent M's licence (entry 13). Each
entry is a block you can accept, edit or strike; the rationale of each entry carries the open questions
of its drafting group.

**PO decisions of 2026-09-24 on the open questions — already built into the entries:**

| # | Decision | Where |
|---|---|---|
| 1 | a red release may be accepted with its limitations recorded (book ch. 13 §7) | 07 `A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED` |
| 2 | where a mailbox's mail may be processed is configured; the US may be allowed, then non-compliance with EU rules is stated | 09, two new rules |
| 3 | one GitHub token for every feature | 11 (new entry, §7) |
| 4 | new identifier prefixes `ITM-` (backlog items) and `RES-` (resources) | 01 `EVERY ARTIFACT HAS AN IDENTIFIER`, extended |
| 5 | ~~the merge is decided by the review role (Scrum Master)~~ — corrected after the PO's question: a pull request is merged when the product's **Definition of Done** holds; a sprint ends with a **review of its increment** and a **retrospective**; a phase or a sprint may have its own branch, merged into `main` at its end — in Scrum by the Product Owner after the review; default is `main` | 08, seven new rules; one occasion corrected |
| 6 | instance and product each declare resources, independently | 10, two new rules |
| 7 | groups live in files of their own (`docs/groups/`), not in the SPEC's sections; regrouping is committed directly | 01 (rules replaced), 05 (a SPEC edit no longer includes regrouping) |
| 8 | test results are kept permanently in the repository — on the branch `test-results`, append-only | 07, two new rules |
| 9 | refactoring needs no failing test first | 06 two new rules, one narrowed; 08 default Definition of Done |
| 10 | products have their own licence; Agent M is MIT | 06 two new rules; 13 (new entry, §0) |
| 11 | jobs have identifiers (`JOB-`) and records in their product repository, `docs/jobs/` | 01, 08 two new rules, 07 one new rule |
| 12 | UC-009 merged into UC-020 | use cases only |
| 13 | the dashboard keeps its products in the browser's local storage; a local clone holds them as ignored folders under `products/`; nothing in the instance repository names a product | 05 one withdrawn, three new rules; 04 one rule changed |
| — | consistency and comfort review by the main agent, 2026-09-25: `NO SERVER`'s check names registries and resource hosts (13); configuration in the browser extended, settings move without secrets (11); records are evidence, not proposals (04); the bridge is paired once (03); several files accepted in one click, a queue in its order, a person's edits in one queue (05); accepting the release report releases (07) | 03, 04, 05, 07, 11, 13 |

Interpretations by the main agent, correct them in the edit field if they are not what you meant:
"groups should have new files" → one group file per kind of artifact; "a permanent location in the
repo" → a branch of its own, so that results do not add a commit to `main` per run (which would
trigger CI again).

**Order that matters:**
1. **05 before 06–10** — 05 adds the headings §11–§15; until it is accepted, 06–10 show "anchor not
   found".
2. The rest is independent.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 1. Identity and traceability | — | — |
| 02 | `SPEC.md` | ## 5. Process models and practices | — | — |
| 03 | `SPEC.md` | ## 6. Runtimes | — | — |
| 04 | `SPEC.md` | ## 9. Human gates | — | — |
| 05 | `SPEC.md` | ## 10. Review on GitHub Pages | — | — |
| 06 | `SPEC.md` | ## 11. Architecture and implementation | — | — |
| 07 | `SPEC.md` | ## 12. Tests and continuous integration | — | — |
| 08 | `SPEC.md` | ## 13. Process execution and jobs | — | — |
| 09 | `SPEC.md` | ## 14. Issues and mail | — | — |
| 10 | `SPEC.md` | ## 15. Product resources | — | — |
| 11 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
| 12 | `SPEC.md` | # Agent M — Specification | ## 0. Hard product rules | — |
| 13 | `SPEC.md` | ## 0. Hard product rules | — | — |
