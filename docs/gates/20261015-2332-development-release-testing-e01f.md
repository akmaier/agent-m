---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - fdd169ee390e0d75505e0fb21a7ce2171069f9c4
  - https://github.com/akmaier/agent-m/pull/533
date: 2026-10-15 23:32 UTC
---
# Development → Release testing: ITM-484, The tools a kind may offer, as data

**REGISTER**

## Reason

ITM-484, pull request #533 into `sprint/team1/30`, head `fdd169ee`. developer-sonnet-c made both commits.

1. The tests-only commit `cc1b551e` holds only `tests/job-catalogue-tools.test.mjs`, and CI was red on it (run
   38822324172, node (7)).
2. CI is green on the head, ten of ten jobs. Locally, UC-019's release and system tests and every test of the catalogue
   give 172 passing tests and none failing; the marks left are UC-019's existing `todo` findings. UC-049 has no release
   test.
3. The changes stay in the item's scope, all under `src/job-catalogue/`, the item's module:
   - `index.mjs`, `definition.schema.md`, the new `tools.md` and `tools.schema.md`;
   - the `kind.md` of `converse`, `change-requirements`, `change-use-case` and `change-architecture`.
   The new test file names MOD-job-catalogue. No existing test changed, as the item states.
4. TST-484001 to TST-484006 name their requirements and MOD-job-catalogue, and state their values in their own text.
   Their counter-proofs are recorded in #533.
5. The Acceptance holds:
   - `toolsOf` gives the named tools in the order named, and throws `UnknownTool` for a name `tools.md` lacks.
   - `kindOf` gives `tools` and `toolLimit`, as the module file says.
   - A kind naming no tools gets an empty list.
   - No description or schema stands in code.

The developer named three values that MOD-job-catalogue's file leaves open. They are within the accepted file, because
it states each field's type and makes the descriptions and argument schemas data of the module itself:
- the `tool_limit` of the three change kinds: 30, as for `converse`;
- the tools' argument names: `folder`, `path`, `text`, `path` and `text`, `kind` and `task`;
- the `toolLimit` of a kind that names no tools: 0.
None needs an architecture change. They are noted for the review: ITM-486 builds the tools' strategies on these
argument names.
