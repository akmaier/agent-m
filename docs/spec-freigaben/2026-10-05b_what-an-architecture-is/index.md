# SPEC approvals — queue 2026-10-05b · what an architecture is

**PO decision:** an architecture is what book ch. 10 defines — the organisation of the whole system —, and its rules
stand in the SPEC. It decomposes the system into subsystems and each subsystem into modules. A product's first architecture is designed as a whole and only against accepted use cases. Modules
describe what is implemented, each in a file of its own, with a minimal, extensible interface. An architecture is
checked when it is complete, as a whole, by participants that know the entire project, and never by tests; the use
cases are checked against the system, the subsystems against the system and the modules against their
subsystem, never the modules against the use cases. Every review
finding is weighed before it is acted on, since a reviewer can be wrong.

**Size:** §11 rewritten — 40 requirements added (one of them restored), 7 changed, 8 withdrawn, 15 carried over byte
for byte.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 11. Architecture and implementation | — | — |
