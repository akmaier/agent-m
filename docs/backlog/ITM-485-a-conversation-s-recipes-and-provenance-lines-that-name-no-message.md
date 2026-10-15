---
id: ITM-485
title: A conversation's recipes, and provenance lines that name no message
level: module
realises:
  - UC-049
  - UC-019
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-runner, Data: the built-in strategies `conversation` and `page`, the provenance lines
---
# ITM-485 A conversation's recipes, and provenance lines that name no message

**REGISTER**

## Outcome

MOD-job-runner's built-in recipes `conversation` — the conversation so far from the job's parameters, each message
with who wrote it, none for the first message — and `page` — the page as the route's subject gives it. `provenanceLines`
takes a `jobId` that may be `null`, then without the line `Agent-M-Job`, and no line names the person's instruction or any
other message of a conversation.

## Acceptance

- Each recipe gives one part from fixture parameters, and `conversation` none for a first message.
- `provenanceLines` gives no `Agent-M-Instruction` line, and no `Agent-M-Job` line for `jobId: null`.
- A counter-proof: an instruction planted in the trailers is found by the test.
