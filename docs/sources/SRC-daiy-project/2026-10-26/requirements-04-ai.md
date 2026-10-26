# AI requirements AIR-01 to AIR-10 — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: 3. AI Requirements. The text is the original's, unchanged.

---

### 3. AI Requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| AIR-01 | Problem understanding | The AI summarizes the problem in a way the user can follow. |
| AIR-02 | Handling uncertainty | When important information is missing, the AI asks instead of presenting assumptions as facts. |
| AIR-03 | Structured output | Every standard set of instructions includes diagnosis, tools, materials, steps, and warnings. |
| AIR-04 | Personalization | The AI takes the skill profile into account. |
| AIR-05 | Product matching | Product recommendations are evaluated against concrete requirements such as dimensions, material, and function. |
| AIR-06 | Source and data transparency | The app distinguishes verified product data, AI estimates, and unverified information. |
| AIR-07 | Error handling | When information is insufficient or a technical error occurs, the app shows an understandable notice instead of inventing a solution. |
| AIR-08 | Consistency | Repeated tests with the same cases are evaluated, relevant variations are documented. |
| AIR-09 | Inventory grounding | The AI only marks an item as "available" if it exists in the inventory with sufficient quantity. |
| AIR-10 | Location-dependent rules | Rules that depend on location (e.g. permitted fence height, building permits) are marked "check locally" and not stated as fact. |

The AI must not automatically turn every request into a guide. Sometimes the right response is to ask first or advise against the work.
