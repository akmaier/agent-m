## 4. Use cases and models

**A USE CASE REALISES NAMED REQUIREMENTS** *(PO A. Maier, 2026-09-23)*
Every use case names the requirement identifiers it realises.
*Occasion:* a use case that realises nothing is either a missing requirement or a feature nobody
asked for, and the difference matters. Naming the requirements makes the question answerable
instead of arguable.
*Check:* `tests/test_usecase_realises.py`

**A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION** *(Vibe Coding, ch. 9 §2.1)*
A use-case description names its actor, its precondition, its main flow, its alternative flows,
and its postcondition.
*Occasion:* a use case captures a goal before it captures an implementation. Without the
precondition and postcondition it degrades into a feature list with actors attached.
*Check:* `tests/test_usecase_fields.py`

**DIAGRAMS ARE MERMAID IN MARKDOWN** *(Vibe Coding, ch. 9 §6)*
Every diagram is written as Mermaid inside the Markdown document it belongs to; no diagram is
stored as an image file.
*Occasion:* a diagram that is code can be versioned, diffed in a pull request, and read by a model
without visual parsing. An exported image can do none of these and drifts from the document it
illustrates.
*Check:* `tests/test_diagrams_are_mermaid.py`

**THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW** *(PO A. Maier, 2026-09-23)*
Where a diagram and its use-case description disagree, the description holds.
*Occasion:* Mermaid has no UML use-case diagram; the actor-and-ellipse notation is approximated
with a flowchart, as the reference project `akmaier/dvd_database` does. An approximation must not
be allowed to become the source of truth by accident.
*Check:* no automatic check; at review.

**UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN** *(PO A. Maier, 2026-09-23)*
A requirement with no use case and a use case with no requirement are both shown in the dashboard;
neither blocks a run.
*Occasion:* early in a product, unrealised requirements are the normal state. A gate that blocks
on them would train everyone to switch the gate off — the failure mode the process repository
records as a check that is red so often it stops being read.
*Check:* `tests/test_coverage_report.py`
