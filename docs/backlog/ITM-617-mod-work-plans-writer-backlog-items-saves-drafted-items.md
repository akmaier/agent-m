---
id: ITM-617
title: MOD-work-plans' writer backlog-items saves drafted items
level: module
realises:
  - UC-032
modules:
  - MOD-work-plans
builds_on:
  - ITM-616
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-617 MOD-work-plans' writer backlog-items saves drafted items

**REGISTER**

## Outcome

The writer `backlog-items` — the drafted items through `saveItems`, with the job's provenance lines — and `saveItems` itself, as MOD-work-plans' file states them. `saveItems` is not built.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `propose-items` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Readiness settled (sprint team2/105, po-opus-b), each function read against what it returns, not only against the Uses line.**
- **What `saveItems` calls, by its text (MOD-work-plans.md:217-223), and what each returns:**
  - `backlogFindings(items, architecture)` (`src/work-plans/checks.mjs:37`): `Finding[]`, `kind` `error` or `warning`.
    The warning is a title restating another item's, which `saveItems` returns with the commit.
  - `nextIdentifier("ITM", everUsed)` (`src/identifiers/scheme.mjs:92`): one more than the highest ITM of `everUsed`, three
    digits at least. Run on `["ITM-1194", "ITM-999"]`, it gives `ITM-1195`.
  - `everUsed`, "an identifier that no history holds": the head's paths and every path of `readHistory(null, { ref })`'s
    `changes`. With `changes` left on, each entry lists its changes (MOD-repository-hosts.md:197-200). That is the working
    caller's pattern, `src/artifact-edits/strategies.mjs:116-119`.
  - `writeDocument(schema, document)` (`src/documents/read-write.mjs:421`): the canonical text. It throws on a field that
    does not fit. A backlog item requires `id`, `title`, `realises`, `modules` and `origin`, and the sections `## Outcome`
    and `## Acceptance` (`src/documents/schemas/item.schema.md`).
  - `host.commitFiles({ branch, expectedHead, files, message })`: one commit. `provenanceLines`: the trailers. Both are
    as the writer `sprint-record` calls them (`src/work-plans/strategies.mjs`, `sprintRecord`).
- **The tests of its input and output forms:**
  - no test pins the keys of `workStrategies.writers`;
  - TST-615008 (`tests/work-plans-backlog-inputs.test.mjs`) pins that `propose-items` meets UnknownStrategy at
    `backlog-items`, and changes with this item;
  - `tests/job-catalogue.test.mjs:45` names the writer in the kind's table, and does not change.
- **The paths it reaches:** `context.product.host` and `.snapshot`, as `sprintRecord` reads them from the `JobContext`
  (`src/job-runner/index.mjs:44`).
- **Readings the text leaves open, for the developer to name or stop on:**
  - `origin`, required by the item format, for an item a job drafted;
  - what an entry classed `duplicate` of an existing item becomes;
  - how the answer's `outcome` and `acceptance` fill the two sections.
