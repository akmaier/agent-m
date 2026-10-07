---
name: v-model
kind: planned
measure: plan entries per phase
---
# V-model

**REGISTER**

The V-model of the book *Vibe Coding* as this instance's source register holds it (`SRC-vibe-coding`, version
`2026-10-05`): chapter 6, *The V-Model as Structured Verification Strategy*, and its Figure 6.4. The left branch
decomposes the project from concept to implementation, the right branch integrates it again through testing, validation
and verification, and operation: "whenever you define something on the way down, you should already know how you will
check it on the way back up". Its verification pairs are the figure's horizontal links. Its gates follow the chapter: a
requirement states on the way down how it will be checked on the way up; code is written "because there is a documented
requirement, a verified design impact, and a defensible reason for the change"; and the release rests on "documented,
risk-based verification rather than improvisation at release time". The chapter names no role for a phase of the model:
its roles are those of the chapter's Geek Box *Artifacts, roles, and traceability* — product owner, developer, tester and
reviewer.

## About

manages: uncontrolled change — teams "are expected to change code because there is a documented requirement, a verified design impact, and a defensible reason for the change"
accepts: late testing — "much of the actual testing activity still happens later in the timeline", without "the extremely short learning cycles associated with agile methods"
example: medical-grade software — the V-model is "attractive for large, complex, or heavily regulated systems", as in "medical products, security-relevant software, and government systems"
chapter: 6, The V-Model as Structured Verification Strategy

## Phases

| Name | Role | Produces |
|---|---|---|
| Concept | Product owner | — |
| Requirements | Product owner | requirements |
| Design | Developer | ARC, MOD |
| Implementation | Developer | MOD |
| Testing | Tester | TST |
| Validation & Verification | Tester | TST |
| Operation & Maintenance | Developer | — |

## Transitions

| From | To | Kind |
|---|---|---|
| Concept | Requirements | sequence |
| Requirements | Design | sequence |
| Design | Implementation | sequence |
| Implementation | Testing | sequence |
| Testing | Validation & Verification | sequence |
| Validation & Verification | Operation & Maintenance | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|
| Concept | Operation & Maintenance |
| Requirements | Validation & Verification |
| Design | Testing |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Requirements → Design | the requirements | each requirement states how it will be checked on the way back up | Reviewer |
| Design → Implementation | the requirements, and the ARC and MOD files of the design | every requirement is documented, and the design's impact verified, before code is written | Reviewer |
| Validation & Verification → Operation & Maintenance | the TST of the testing and of the validation and verification | the verification is documented before the release | Reviewer |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Product owner | either | read the repository, write to the repository |
| Developer | either | read the repository, write to the repository, run code and tests |
| Tester | either | read the repository, write to the repository, run code and tests |
| Reviewer | either | read the repository |
