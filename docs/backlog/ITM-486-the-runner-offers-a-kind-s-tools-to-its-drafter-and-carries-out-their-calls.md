---
id: ITM-486
title: The runner offers a kind's tools to its drafter and carries out their calls
level: module
realises:
  - UC-049
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A PARTICIPANT DECLARES ITS CAPABILITIES
modules:
  - MOD-job-runner
builds_on:
  - ITM-484
  - ITM-485
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-runner, Parts: tools.mjs; Interfaces: ToolUse, Strategies, DriverInput, JobContext, runJob
---
# ITM-486 The runner offers a kind's tools to its drafter and carries out their calls

**REGISTER**

## Outcome

Where a kind names tools, MOD-job-runner gives the drafter of each exchange a `ToolUse` — only to a model endpoint
that declares *use tools*, only the tools whose capability it declares and that the page's subject does not refuse — and
carries out each call through the tool's strategy: `list-files`, `read-file` and `search-files` at the commit the job
read, refusing a path `places.contents` names for a restricted source that does not allow the drafter's place;
`propose-edit`, which holds a document's new text in the draft's `edits` and refuses every file its module file names;
and `hand-over`, which holds a proposed hand-over in the draft's `handOver` and queues nothing. Proposed edits are
checked in the round as every drafted document is.

## Acceptance

- Each built-in tool answers a fixture call as the module file says, a refusal naming why; a tool not offered, or
  arguments its schema refuses, is answered with a refusal the participant reads.
- A coding agent gets `null`; a drafter without *use tools* gets no tool; `limit` is the kind's `tool_limit`.
- Nothing is written by any tool; a component test runs a fixture drafter that reads, proposes an edit and a hand-over.
