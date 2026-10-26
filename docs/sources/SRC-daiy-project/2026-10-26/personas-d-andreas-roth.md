# Persona D, Andreas Roth — extract

From `docs/Personas_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `1dbaf9aeb28710b8860f20153f4c6b827f10dbeff2a6ebb62890ec202fd98732`, not stored here.

Sections kept: Persona D. The text is the original's, unchanged.

---

## Persona D · Andreas Roth — the critical expert from another field
*From the team presentation (slide 7)*

> "I know how these models fail. Tell me what is verified and what is a guess, and get me to a working turntable fast."

### Profile

| Attribute | Value |
|---|---|
| Age | 45 |
| Housing | Owns a flat in Erlangen |
| Profession | Professor of pattern recognition |
| Technical affinity | Very high in software and AI; reads datasheets, distrusts unsourced claims |
| Budget | Not the constraint; wants to keep original vintage parts where possible |
| Time | Very little. Researches on the laptop in the evening, repairs on a weekend |

### Skill profile (FR-10)

| Area | Level | Note |
|---|---|---|
| Electronics (low voltage) | Medium | Soldered kits as a student, owns a multimeter and a soldering iron |
| Mechanics, small devices | Beginner | Has never opened a turntable |
| Woodwork, furniture | Beginner | |
| Plumbing | None | |
| Electrical installation | None | Mains work always by a professional |
| Heating | None | |

### Inventory (FR-11, FR-12)

- Tools: precision screwdriver set, multimeter, soldering iron, tweezers.
- Materials: none relevant.

### Current problem

His father's 1970s record player has stopped playing at the right speed: the platter turns too slowly and the speed fluctuates. The hinge of the dust cover is also broken. Spare parts for the model are no longer produced.

### Goals

- Fix it quickly and correctly the first time.
- Keep the device original where possible; find the exact parts for his model and variant.
- Understand the cause (worn belt, hardened idler wheel or something else).
- Know which information is verified and where it comes from.

### Frustrations

- Forum threads with contradicting advice for slightly different model variants.
- AI chatbots that confidently invent part numbers and dimensions.
- Discontinued parts; listings without the exact dimensions.
- Long answers that bury the one fact he needs.

### Usage context

- Laptop in the evening, short concise answers, compares listings.
- Will test the app on purpose: asks the same question twice and checks whether specs and sources match.

### What the app must do for Andreas

- Identify the exact model and variant, or ask for it, before naming parts (FR-02, AIR-02).
- Match parts by concrete specifications, e.g. belt length, width and thickness (AIR-05).
- Separate verified data, AI estimates and unverified information, with the source (AIR-06).
- Offer second-hand and old-stock parts and show how fresh the offer data is (SUS-01, SUS-04, SAF-05).
- Suggest a 3D-printed dust-cover hinge with dimensions, material and licence (FR-06, SUS-06), but never a printed part where failure is a hazard (SAF-04).
- Tell him to unplug before opening, and treat anything inside the mains power supply as professional work, regardless of his expertise in other fields (scope, SAF-02, SAF-07).
- Answer quickly and consistently (NFR-04, AIR-08), and admit when it does not know (AIR-07).

### Important boundary

Andreas is highly skilled, but not in this domain. His confidence comes from another field, so a high self-assessment must never unlock work on mains-powered internals (SAF-07). He is also the persona most likely to spot hallucinated specifications, which makes him the reference user for AIR-05 to AIR-08.
