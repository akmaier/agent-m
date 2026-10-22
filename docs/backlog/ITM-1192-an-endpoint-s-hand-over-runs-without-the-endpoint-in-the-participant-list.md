---
id: ITM-1192
title: A prompt-bar endpoint's hand-over runs on CI without the endpoint in the instance's participant list
level: module
realises:
  - UC-049
  - THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-1189
tests:
  - unit
origin:
  - developer-sonnet-i's open point at #1312 (ITM-1189), and the gate of #1312
---
# ITM-1192 A prompt-bar endpoint's hand-over runs on CI without the endpoint in the instance's participant list

**REGISTER**

## Outcome

`runHandOver` (`src/workflow-entries/product.mjs`) finds the job record's participant in the instance's
`docs/participants.md`, and fails the hand-over when it is not there.
- Once ITM-1187 is built, the prompt bar offers this browser's endpoints. By the SPEC's THE PROMPT BAR'S ENDPOINTS AND
  CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE, they are "not listed in the instance's participant list". So every hand-over
  of an endpoint's own job (UC-049 4a.1, "for any other kind, the job is the endpoint's own") would fail.
- MOD-workflow-entries.md:169-174: on such a run `onDispatch` "runs it … for a model endpoint, with opencode working with
  the endpoint the input `endpoint` names and the key from the CI secret the input `secret` names".

## Acceptance

- A hand-over whose inputs name `endpoint` runs with the endpoint the input names and the key from `secret`, whether or
  not the record's participant is in the instance's list.
- A kind of the product's workflow still goes only to a listed participant who holds its role (UC-049 4a.1).
  Counter-proof: such a kind with an unlisted participant still fails.
- **First, read what the run needs of its drafter beyond the input** (its context, its capabilities, its place for the
  record's provenance), from MOD-workflow-entries, MOD-job-runner and MOD-runtimes.
  - Where the texts give it, build it, and name the reading.
  - Where they do not, stop under AGENTS.md §6a.6, before any code, with the sentence that is missing. A draft then goes
    to akmaier.
- The first commit holds only the tests, and CI is red on it.
