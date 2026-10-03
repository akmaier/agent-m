# 11. Architecture and implementation: the draft is reviewed by a second participant

**The change.** Four new requirements and one widened; every other requirement of the section is carried over byte for
byte.
- `THE USE-CASE MAPPING IS REVIEWED` — a reviewing participant checks that the interfaces named for each use-case step
  carry the step out, with the inputs it needs, the results it produces and the refusals it can meet.
- `THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION` — the reviewing participant checks that each requirement is
  kept by the module or decision it is placed with.
- `NO REVIEWER IS THE DRAFTER` — neither the drafting participant nor its model reviews the draft.
- `A REVIEWER'S FINDING IS A WARNING` — the drafting participant fixes it or answers it with a justification, which the
  person reads.
- `AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT` — the two reviews join the checks the draft runs through before a person sees it.

**Why.** The checks without a model see whether every use-case step names an interface and every requirement a place —
not whether the interfaces carry the step out, nor whether the requirement is kept. That takes judgement, so a second
participant with another model reviews the draft, and the drafting participant corrects what it finds before the person
sees anything. A model's judgement can be wrong; as a warning it is fixed or answered, never a loop without end. How well
a reviewer finds planted faults is measured as a rate.

**Impact list.**
- `AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT`: `docs/use-cases/UC-022-derive-the-architecture.md`.
- The four new names: nothing refers to them yet; UC-022 is revised to follow them, as an open use case.
