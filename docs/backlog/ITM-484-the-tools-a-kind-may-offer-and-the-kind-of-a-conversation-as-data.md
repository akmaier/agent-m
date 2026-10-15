---
id: ITM-484
title: The tools a kind may offer, and the kind of a conversation, as data
level: module
realises:
  - UC-049
  - UC-019
  - ONE DEFINITION, THREE DRIVERS
  - A PARTICIPANT DECLARES ITS CAPABILITIES
modules:
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-catalogue, Parts: tools.md, tools.schema.md; Interfaces: ToolDefinition, toolsOf, KindDefinition
---
# ITM-484 The tools a kind may offer, and the kind of a conversation, as data

**REGISTER**

## Outcome

MOD-job-catalogue holds the tools of its module file's table — `list-files`, `read-file`, `search-files`,
`propose-edit`, `hand-over` — in `tools.md`, read with `tools.schema.md`, each with its capability, its description and
the schema of its arguments; `toolsOf` gives them by name. A kind names `tools` and `tool_limit`, which `KindDefinition`
carries; the new kind `converse` serves UC-049 with the recipes `page`, `conversation`, `instruction` and the optional
`chapters-for-page`; `change-requirements`, `change-use-case` and `change-architecture` add the recipe `conversation`
and name the three reading tools and `hand-over`, as the module file's table says.

## Acceptance

- `toolsOf` gives the named tools in the order named and throws `UnknownTool` for a name `tools.md` lacks.
- `kindOf("converse")` and the three change kinds read without a finding and say what the module file's table says.
- No tool's description or schema stands in code.
