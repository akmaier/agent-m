# 11. Architecture and implementation: precise enough to generate from

**The change.** Ten new requirements; every existing requirement of the section is carried over byte for byte.
- What an architecture states: typed interfaces, each type defined once in machine-readable form, a sample for every
  type, an example for every interface, names that resolve, modules without a dependency cycle.
- What it covers: every step of every accepted use case is carried by named interfaces, and every accepted requirement
  has its place — a module that realises it, or the decision that keeps it across modules.
- When it is checked: in the correction loop, by the drafting participant, before a person sees the draft.
- What follows from it: source skeletons, interface documentation, sample input files and one failing test per example,
  generated without a model.

**Why.** An architecture is accepted to be implemented. When every interface is typed and exemplified and every type has
a sample, the implementation starts from generated skeletons and failing tests, and a coding agent's work is judged
against them. A draft that a check rejects never reaches the person; what is left after the round limit is shown with it.

**Impact list.**
- All ten names are new; nothing refers to them yet. UC-022 is revised to follow them, as an open use case.
