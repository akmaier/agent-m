# Context: vision, scope, stakeholders, personas — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: 0. Context. The text is the original's, unchanged.

---

## 0. Context

### 0.1 Product Vision

> An AI-powered DIY platform that helps people, regardless of their technical skills, safely repair household items and carry out small home projects themselves. It adapts to the user's experience, knows which materials and tools they already own, shows clearly which work they may do themselves and which needs a qualified professional, and favors sustainable sourcing.

### 0.2 Scope

**In scope**

- Repairs of household items and fixtures (furniture, doors, fittings, appliances without opening mains-powered housings).
- Small home and garden projects (e.g. fence, shelf, insulation of an accessible attic floor, painting).
- Low-voltage and digital projects (router and mesh setup, smart-home integration, connecting a heat pump to a home-automation system via its data interface).
- Planning support that splits a project into DIY work and professional work.

**Out of scope** (the app informs and escalates, but gives no instructions)

- Work on fixed 230/400 V installations, grid connection, gas installations, refrigerant circuits, load-bearing structures, chimneys.
- Full energy-renovation planning and funding applications. The app may point out that such topics exist and who is responsible, but does not plan or certify them.
- Purchases inside the app (FR-09).

### 0.3 Stakeholders

| Stakeholder | Interest | Influence | Motivation | Strategy |
|---|---|---|---|---|
| Novice users (Personas A, C) | Simple, safe, affordable guidance | Low | High | Keep informed, usability tests |
| Experienced DIYers (Persona B) | Depth, inventory, efficiency | Low | High | Keep informed, usability tests |
| Experts from other fields (Persona D) | Exact parts, verified and sourced information | Low | Medium | Keep informed, usability tests |
| Course instructor / examiner | Structured, traceable RE process | High | High | Close cooperation |
| Project team (developers, testers) | Realistic, testable scope | High | High | Close cooperation |
| Qualified professionals (e.g. electricians) | Clear handover, no liability for unclear DIY work | Low | Medium | Observe, validate FR-14/15 examples |
| Retailers and second-hand platforms | Traffic, correct product data | Medium | Low | Keep satisfied (data terms) |
| Regulators and standards (GDPR, electrical safety rules) | Legal compliance | High | Low | Keep satisfied |
| Household members, landlords | Safety, permission for changes | Low | Medium | Observe |

### 0.4 Personas

Short profiles below. Full profiles, user journeys, traceability and persona-based test cases: [`Personas_EN.md`](Personas_EN.md).

| Persona | Who | Experience | Typical case | Role in product |
|---|---|---|---|---|
| **A · Sophie Keller** | 28, marketing assistant, rents a flat | Beginner, basic toolbox | Dripping faucet, sticking drawer; photo on the phone | Primary (default experience) |
| **B · Jonas Weber** | 35, IT admin, owns a house from 1978 | Advanced, area-dependent | Fence, heat pump integration; DIY vs. professional split | Secondary (extended depth) |
| **C · Emre Yildiz** | 22, student, room in a shared flat | Beginner, no tools | Desk and storage for €60; second-hand first | Secondary (budget and reuse) |
| **D · Andreas Roth** | 45, professor of pattern recognition | Medium in electronics, beginner in mechanics | Vintage record player; exact parts, verified data | Secondary (critical expert) |

**Relevant requirements:** A: FR-01–03, FR-07, NFR-01–03, SAF-01–03, AIR-02 · B: FR-04, FR-08, FR-10–15, AIR-04, AIR-09/10, SAF-06/07 · C: FR-04, FR-05, FR-11, FR-12, SUS-01–05, SUS-07 · D: FR-06, AIR-05–08, SAF-04, SAF-05, SAF-07, SUS-06.

**Design consequence:** All personas use the same flow. Persona A is the default (NFR-01/02). Higher skill (B, D) gets more depth through the skill profile (FR-10), never fewer safety checks (SAF-07). For NFR-01, A and C form the beginner group, B and D the experienced group.
