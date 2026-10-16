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

It builds against MOD-job-runner's file as accepted at `4345829a`: the tools offered leave out those the job's
parameter `refuses` names.

What the module file leaves unstated, and what is built:
- **Who gets a `ToolUse`.** A drafter whose type is `model endpoint` and that declares *use tools*, for a kind that names
  tools; every other drafter gets `null`.
  - Its `definitions` are the kind's tools in the kind's order, read with MOD-job-catalogue's `toolsOf`, less every tool
    whose capability the drafter does not declare and every tool `refuses` names. A missing `refuses` names none.
  - Its `limit` is the kind's `toolLimit`.
- **A call's arguments.** They are checked against the tool's argument schema with the validator the runner already
  reads a draft by. A tool not offered is answered `refused: <name> is not offered here`, and arguments the schema refuses
  are answered `refused: <what the validator names>`.
- **`list-files`.** The paths of the product's snapshot under `folder`, one per line, in order.
- **`read-file`.** The file's text, or `refused: no file <path>`.
- **`search-files`.** Each line of the product's files holding `text`, as `<path>:<line number>: <line>`.
- **A restricted path.** A path `places.contents` names for a source whose allowed places do not include the drafter's
  is answered `refused: <path> holds content of <source>, which may not go to <place>`. A missing `contents` names none.
- **`propose-edit`.** A path in `docs/` is held in the draft's `edits` as `{ path, text }`, the later of two edits of one
  path replacing the earlier. It is refused, naming where the document is changed, for:
  - `SPEC.md`, under `docs/use-cases/` and under `docs/architecture/`;
  - every record under `docs/approvals/`, `docs/gates/`, `docs/jobs/`, `docs/conversations/`, `docs/test-results/` and
    `docs/tests/`;
  - every change queue under `docs/spec-freigaben/`;
  - `docs/settings.md`, `docs/collaborators.md` and `docs/conversation-recording.md`;
  - every path outside `docs/`.
- **`hand-over`.** It holds `{ kind, works_on, task }` in the draft's `handOver`. A kind the catalogue does not hold, or
  one without a participant, is refused. The participant and the route are the bar's (ITM-505).
- **What a call returns.** One text, which the participant reads. Nothing is written by any tool.

No existing test's expected result changes, release tests included. The tests of `prepareJob` and `runJob` use kinds
that name no tools, whose drafters get `tools: null`, and no test compares a whole `DriverInput`. Model endpoints use the
tools from ITM-488 on, so `endpointDriver` is not changed here.

## Acceptance

- Each built-in tool answers a fixture call as the module file says, a refusal naming why; a tool not offered, or
  arguments its schema refuses, is answered with a refusal the participant reads.
- A coding agent gets `null`; a drafter without *use tools* gets no tool; `limit` is the kind's `tool_limit`.
- Nothing is written by any tool; a component test runs a fixture drafter that reads, proposes an edit and a hand-over.
