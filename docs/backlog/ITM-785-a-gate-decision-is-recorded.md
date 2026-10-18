---
id: ITM-785
title: A gate decision is recorded
level: module
realises:
  - UC-034
  - THE GATE IS RECORDED
  - A GATE NAMES WHO DECIDES IT
  - A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
modules:
  - MOD-product-process
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-785 A gate decision is recorded

**REGISTER**

## Outcome

UC-034 step 7, 7a and 7b. MOD-product-process states `recordGateDecision` and does not build it
(`src/product-process/gates.mjs:2`); `mayDecide` and `gateSchema` are built. This item builds `recordGateDecision`
as the module's file states it: `mayDecide` first, then one gate record of `gateSchema` under `docs/gates/` in one
commit on the head that was read, naming the decider, the role, the decision, the date and each checked artifact as
`<path>@<blob>` or the commit, with the job's provenance lines as trailers.

## Acceptance

- A decision `mayDecide` refuses is refused with `MayNotDecide` naming the reason and the holders, and nothing is
  written; a rejection without a reason fails with `ReasonMissing`; a moved head with `Moved`.
- A written record is read back by `gateStates` as passed, or rejected, on the texts it names.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change only

The question left for akmaier (`docs/backlog/sprints/team2/83.md:71-72`): MOD-product-process's Uses do not name `repositoryInfo`. `recordGateDecision` commits the gate record on the default branch (`commitFiles` needs `branch`, MOD-repository-hosts.md:189). The default branch is given
only by `RepositoryInfo.defaultBranch` (MOD-repository-hosts.md:136, `repositoryInfo()` at :185-186): a `Snapshot`'s
`ref` is what it was read at (:106, :168), here a commit. Its Uses name `commitFiles` one by one, so the absence reads as a gap of the Uses;
`grep -c repositoryInfo` gives 0 for MOD-product-process.md and 3 for MOD-runtimes.md (the known positive).

**The draft**, committed as `c2f0a91e`: MOD-product-process's Uses gain `MOD-repository-hosts.repositoryInfo`, for the default branch
the gate record is committed on,
in the form 13 other module files name it (e.g. MOD-runtimes.md:261). Principles: *no special first case* — named like
the module's other host functions; *nothing twice* — the default branch comes from the host the function already
receives, not from a second copy in a context.

The item builds on the acceptance of that draft. While team 1's sprint 87 runs, MOD-product-process is used by its modules
(MOD-settings-pages and MOD-trace-pages), so the item is held.
