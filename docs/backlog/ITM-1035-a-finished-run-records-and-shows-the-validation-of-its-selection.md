---
id: ITM-1035
title: A finished run records and shows the validation of its selection
level: module
realises:
  - UC-043
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
modules:
  - MOD-run-planner
  - MOD-implementation-pages
builds_on:
  - ITM-982
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-12, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1035 A finished run records and shows the validation of its selection

**REGISTER**

## Outcome

UC-043-run-the-process-over-a-selection.md:101-102 (step 8): "The run ends. Agent M shows the validation of the selection —
what each module realises, its code, its tests, every gap — beside the run's jobs and their pull requests, and completes the
run's record."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-run-planner.md:110-116:

> - `finishRun(host: Host, run: Run, context: { snapshot: Snapshot, trailers: string[] }) -> Promise<{ commit: string }>` —
>   what a route does on `finish`, whichever route got it: appends to the run's record, read from `snapshot`, its `## End`,
>   `done`, whose `results` name the default branch's commit the run's validation holds at. The validation — the module view
>   of its selection, MOD-trace-graph's `moduleRows` of that commit's graph for the modules of the selected steps or items,
>   with their gaps — is derived again from that commit wherever it is shown, and is not copied into the record. Committed
>   through `appendToRecord` and `commitFiles` on that head (`A RUN ENDS WITH THE VALIDATION OF ITS MODULES`). Errors:
>   `RecordEnded`, and the host's.

## Acceptance

- Unit tests: a finished run's record ends `done` with its validation, and the run page shows each module's requirements,
  code, tests and gaps beside the run's jobs and pull requests.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
