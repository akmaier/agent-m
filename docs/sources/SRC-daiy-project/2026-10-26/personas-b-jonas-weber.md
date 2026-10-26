# Persona B, Jonas Weber — extract

From `docs/Personas_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `1dbaf9aeb28710b8860f20153f4c6b827f10dbeff2a6ebb62890ec202fd98732`, not stored here.

Sections kept: Persona B. The text is the original's, unchanged.

---

## Persona B · Jonas Weber — the ambitious homeowner
*Author: gabrielfau*

> "I don't want the app to tell me to call a professional. I want it to tell me *when* and *why*."

### Profile

| Attribute | Value |
|---|---|
| Age | 35 |
| Family | Married, one small child |
| Housing | Owns a detached house built around 1978, bought in 2023, partially renovated |
| Profession | IT system administrator, hybrid work (2 days home office) |
| Technical affinity | High: runs a home-automation server, segmented home network, uses apps for most tasks |
| Budget | Cost-conscious, invests in tools rather than tradesperson hours |
| Time | Evenings and weekends, projects stretched over weeks |

### Skill profile (FR-10)

| Area | Level | Note |
|---|---|---|
| Woodwork, garden construction | Advanced | Several projects completed (raised beds, terrace) |
| Drywall, painting, flooring | Advanced | |
| Network, smart home | Expert | Professional background |
| Plumbing | Medium | Fittings, siphons, cisterns. No main lines, no gas |
| Electrical | Limited | Low-voltage and preparatory work (chases, conduits) only. Fixed installations always by a qualified electrician |
| Heating, heat pump | Basic | Control and data interface only. No hydraulics, no refrigerant circuit |

### Inventory (FR-11, FR-12)

- Tools: cordless drill, hammer drill, mitre saw, plunge saw, laser level, two-pole voltage tester, multimeter, manual post-hole auger.
- Materials: leftover larch boards, stainless steel screws (various sizes), 3 bags of quick-set concrete, conduit M20, 50 m network cable.

### Goals

- Improve the house step by step, functionally and energetically, with as much own work as possible.
- Know per project which parts he may do himself, which need a professional, and why (FR-14).
- Use what he already owns before buying anything (FR-04, SUS-07).
- Get instructions at his level: no basics, but precise dimensions, materials and standards.
- Hand over professional work with a clear task description (FR-15).

### Frustrations

- Tutorials and forums contradict each other, sources are unclear.
- Duplicate purchases because he has lost track of his stock.
- Unclear legal limits of DIY work (electrical, heating, structure, building law).
- AI answers that either forbid everything or hide the risks.

### Usage context

- Plans projects on the laptop in the evening, compares materials and offers.
- Executes with the smartphone in the workshop or garden, checks off steps with dirty hands (FR-07).
- Typical projects: garden fence, router and mesh setup, heat pump integration into home automation, replacing thermostats, cellar shelving, insulating the accessible attic floor.

### What the app must do for Jonas

- Use his skill profile to reduce basic explanations while keeping them expandable (FR-03, NFR-09).
- Match materials and tools against his inventory and suggest products only for missing items (FR-04, AIR-09).
- Split projects into work packages with clear DIY / professional labels and reasons (FR-14).
- Keep safety limits independent of his self-assessment (SAF-07).
- Mark location-dependent rules as "check locally" instead of stating them as fact (AIR-10).

### Important boundary

Jonas assumes that a qualified electrician will inspect and approve his preparatory work. Many electrical businesses refuse liability for work they did not carry out themselves. The app must present this as "agree with the electrician beforehand", not as a standard path.
