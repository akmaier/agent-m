---
id: ITM-484
title: The tools a kind may offer, as data
level: module
realises:
  - UC-049
  - UC-019
  - ONE DEFINITION, THREE DRIVERS
  - A PARTICIPANT DECLARES ITS CAPABILITIES
modules:
  - MOD-job-catalogue
builds_on:
  - ITM-485
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-catalogue, Parts: tools.md, tools.schema.md; Interfaces: ToolDefinition, toolsOf, KindDefinition
---
# ITM-484 The tools a kind may offer, as data

**REGISTER**

## Outcome

MOD-job-catalogue holds the tools of its module file's table — `list-files`, `read-file`, `search-files`,
`propose-edit`, `hand-over` — in `tools.md`, read with `tools.schema.md`, each with its capability, its description and
the schema of its arguments; `toolsOf` gives them by name. A kind names `tools` and `tool_limit`, which `KindDefinition`
carries as `tools` and `toolLimit`: `converse` all five with a `tool_limit` of 30, and `change-requirements`,
`change-use-case` and `change-architecture` the three reading tools and `hand-over`, as the module file says. The kind
`converse` itself, and the recipe `conversation` of the change kinds, are ITM-485's.

## Acceptance

- `toolsOf` gives the named tools in the order named and throws `UnknownTool` for a name `tools.md` lacks.
- `kindOf` gives each kind's `tools` and `toolLimit` as the module file says, and an empty list for a kind that names
  none.
- No tool's description or schema stands in code.
