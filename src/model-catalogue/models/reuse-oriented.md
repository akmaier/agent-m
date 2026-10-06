---
name: reuse-oriented
kind: planned
measure: plan entries per phase
---
# Reuse-oriented

**REGISTER**

The reuse-oriented model of the book *Vibe Coding* as this instance's source register holds it (`SRC-vibe-coding`,
version `2026-10-05`): chapter 6, *Reuse-Oriented Process Design*, and its Figure 6.5. The requirements specification
branches into software discovery and software evaluation, side by side; both feed requirements refinement, which may send
the team back to the specification to rethink what should be built, and otherwise leads to one of three routes —
configure the system, adapt components, or develop components — "before everything converges on integrate system". The
figure's diagram draws no arrow from configuring to integrating; its caption and the chapter's text ("before everything is
integrated") let all three routes converge, and this model follows them. Its gates follow the chapter: "good
reuse-oriented practice includes due diligence", and refined requirements are acceptable "only if the refined
requirements still meet the real user needs". The chapter names no role for a phase of the model: its roles are those of
the chapter's Geek Box *Artifacts, roles, and traceability* — product owner, developer and reviewer —, and whoever
discovers and evaluates software reaches the web: "let an agent help search package ecosystems".

## Phases

| Name | Role | Produces |
|---|---|---|
| Requirements Specification | Product owner | requirements |
| Software Discovery | Developer | — |
| Software Evaluation | Developer | ARC |
| Requirements Refinement | Product owner | requirements |
| Configure System | Developer | MOD |
| Adapt Components | Developer | MOD |
| Develop Components | Developer | MOD, TST |
| Integrate System | Developer | TST |

## Transitions

| From | To | Kind |
|---|---|---|
| Requirements Specification | Software Discovery | sequence |
| Requirements Specification | Software Evaluation | sequence |
| Software Discovery | Requirements Refinement | sequence |
| Software Evaluation | Requirements Refinement | sequence |
| Requirements Refinement | Requirements Specification | back |
| Requirements Refinement | Configure System | alternative |
| Requirements Refinement | Adapt Components | alternative |
| Requirements Refinement | Develop Components | alternative |
| Configure System | Integrate System | sequence |
| Adapt Components | Integrate System | sequence |
| Develop Components | Integrate System | sequence |

## Verification pairs

The reuse-oriented model pairs no phases.

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Software Evaluation → Requirements Refinement | the ARC that records the evaluation of each candidate | its due diligence is recorded: maintenance history, issue resolution, user adoption and update frequency | Reviewer |
| Requirements Refinement → Configure System | the refined requirements | they still meet the real user needs | Product owner |
| Requirements Refinement → Adapt Components | the refined requirements | they still meet the real user needs | Product owner |
| Requirements Refinement → Develop Components | the refined requirements | they still meet the real user needs | Product owner |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Product owner | either | read the repository, write to the repository |
| Developer | either | read the repository, write to the repository, run code and tests, reach the web |
| Reviewer | either | read the repository |
