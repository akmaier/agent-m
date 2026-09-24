# SPEC approvals — queue 2026-09-24c · process model versus requirement source

**PO, 2026-09-24:** *"Are reuse-oriented, incremental/prototyping, agile, DevOps, and disciplined
agile delivery at scale actual software process models? … is IEC 62304 Class B a process model or a
requirement that has to be met? … The software process model is how the agents develop (in teams)
and requirement sources are rules that have to be met during the development or rules on the
development process."*

**Cross-check against the book** (chapter sources in `vhb_vibe_coding/`, read 2026-09-24):

| Term | Where, and how the book classifies it | Result |
|---|---|---|
| Waterfall | ch. 6 §3 "The Waterfall Model"; ch. 2 figure of three process models | process model |
| V-model | ch. 6 §4; ch. 2 figure | process model |
| Reuse-oriented | ch. 6 §5, figure "Reuse-oriented development process" | process model |
| Scrum | ch. 7 §5: "another agile framework" | process model (agile) |
| Kanban | ch. 7 §4 "Kanban as Flow-Oriented Synchronization" | process model (agile) |
| Agile | ch. 7 §2: the Manifesto's "four value statements"; ch. 6 §2 "plan-driven and agile thinking" | family / values — its models are Scrum and Kanban |
| DevOps | ch. 7 §6: "a set of practices, cultural principles, and automation tools" | practice |
| Prototyping, incremental delivery | ch. 14 §5, as change management: prototyping is "an instrument for discovering what stakeholders actually need" | practices |
| Disciplined agile delivery at scale | ch. 7 §7, "layered view of agile scaling" (after Ambler) | scaling layer (practice) |
| IEC 62304 class A/B/C | ch. 6, regulatory box: "defines lifecycle processes"; its classes "align well with the V-model" | **requirement source** (standard), whose rules constrain the process |

The first version of §5 listed all nine as models and filed IEC 62304 as a "profile" of the model.
Both were wrong by the book's own classification.

**Impact analysis:**

| Name | Change | Referenced by |
|---|---|---|
| `A PROFILE ADDS, IT DOES NOT REPLACE` | **withdrawn** → `A PROCESS REQUIREMENT ADDS TO THE MODEL` | UC-002 (rewritten with this queue) |
| `AGENT M CARRIES THE BOOK'S CATALOGUE` | corrected: five models, practices separately | UC-002 |
| `THE MODEL DETERMINES THE STAGES AND THE GATES` | workflow = model **plus** process requirements | UC-002 |
| `THE CATALOGUE IS DATA` | includes practices | UC-002 |
| `THE GATE IS RECORDED` (§9) | its occasion no longer says "regulated profile (§5)" | UC-006, UC-008 — unchanged |
| §5 heading | "Process models and profiles" → "Process models and practices" | anchors of already-applied queues (history only) |

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 3. Requirements | — | — |
| 02 | `SPEC.md` | ## 5. Process models and profiles | — | — |
| 03 | `SPEC.md` | ## 9. Human gates | — | — |
