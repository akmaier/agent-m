---
name: waterfall
kind: planned
measure: plan entries per phase
---
# Waterfall

**REGISTER**

The waterfall model of the book *Vibe Coding* as this instance's source register holds it (`SRC-vibe-coding`, version
`2026-10-05`): chapter 6, *The Waterfall Model*, and its Figure 6.2. Five phases follow each other in one sequence: "Each
phase produces artifacts that become input to the next phase", and "every stage assumes that the previous one is already
complete enough". Its gates are the model's phase-gate reviews, which the chapter names beside the V-model's feedback
loops, one between each phase and the next. The chapter names no role for a phase of the model: its roles are those of
the chapter's Geek Box *Artifacts, roles, and traceability* — product owner, developer, tester and reviewer. The
waterfall model pairs no phases for verification; the pairs are what the V-model adds.

## Phases

| Name | Role | Produces |
|---|---|---|
| Requirements Analysis & Specification | Product owner | requirements |
| System & Software Design | Developer | ARC, MOD |
| Development & Testing | Developer | MOD, TST |
| Integration & System Testing | Tester | TST |
| Release & Maintenance | Developer | — |

## Transitions

| From | To | Kind |
|---|---|---|
| Requirements Analysis & Specification | System & Software Design | sequence |
| System & Software Design | Development & Testing | sequence |
| Development & Testing | Integration & System Testing | sequence |
| Integration & System Testing | Release & Maintenance | sequence |

## Verification pairs

The waterfall model pairs no phases.

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Requirements Analysis & Specification → System & Software Design | the requirements | they are complete enough to be the design's input | Reviewer |
| System & Software Design → Development & Testing | the ARC and MOD files of the design | they are complete enough to be the development's input | Reviewer |
| Development & Testing → Integration & System Testing | the code of each MOD, with its TST | each unit is developed and tested, complete enough to be integrated | Reviewer |
| Integration & System Testing → Release & Maintenance | the TST of the integrated system | the system is integrated and tested, complete enough to be released | Reviewer |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Product owner | either | read the repository, write to the repository |
| Developer | either | read the repository, write to the repository, run code and tests |
| Tester | either | read the repository, write to the repository, run code and tests |
| Reviewer | either | read the repository |
