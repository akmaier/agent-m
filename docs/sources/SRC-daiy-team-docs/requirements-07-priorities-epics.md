# MoSCoW prioritization and epics — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: 6. MoSCoW, Epics. The text is the original's, unchanged.

---

### 6. MoSCoW Prioritization

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Problem and project input | **Must** |
| FR-02 | Follow-up questions | **Must** |
| FR-03 | Structured instructions | **Must** |
| FR-04 | Materials list matched against inventory, sample products | **Must** |
| FR-07 | Guided execution | **Must** |
| FR-10 | Skill profile (local) | **Must** |
| FR-11 | Material inventory (local) | **Must** |
| FR-14 | Work-package classification | **Must** |
| SAF-01, SAF-02, SAF-06, SAF-07 | Risk detection, escalation, conservative classification | **Must** |
| AIR-03 | Structured output format | **Must** |
| NFR-01 | Usability tests with both persona groups | **Must** |
| SAF-03 | Validation of AI output *(v0.4)* | **Must** |
| SAF-05 | No unsupported claims about products *(v0.4)* | **Must** |
| AIR-01, AIR-02 | Problem summary, asking instead of assuming *(v0.4)* | **Must** |
| AIR-04 | Personalization by skill profile *(v0.4)* | **Must** |
| AIR-05, AIR-06 | Product matching, verified vs. estimated data *(v0.4)* | **Must** |
| AIR-07 | Understandable error handling *(v0.4)* | **Must** |
| AIR-09 | Inventory grounding *(v0.4)* | **Must** |
| AIR-10 | Location-dependent rules marked "check locally" *(v0.4)* | **Must** |
| NFR-02, NFR-03 | Plain language, at most 3 input steps *(v0.4)* | **Must** |
| NFR-05 | Reliability (validated output only) *(v0.4)* | **Must** |
| NFR-06 | Data protection notice *(v0.4)* | **Must** |
| NFR-08 | Versioned prompts and test cases *(v0.4)* | **Must** |
| NFR-09 | Adaptive depth, identical safety content *(v0.4)* | **Must** |
| SUS-07 | Reuse own stock first *(v0.4)* | **Must** |
| FR-05 | Real retailer and second-hand search | **Should** |
| SUS-01–05 | Second-hand offers, comparison, transparency, availability, redirect *(v0.4)* | **Should** |
| FR-08 | Accounts and sync | **Should** |
| NFR-10 | Account security, only with FR-08 *(v0.4)* | **Should** |
| FR-12 | Tool inventory | **Should** |
| FR-13 | Project history | **Should** |
| NFR-04 | Response time target *(v0.4)* | **Should** |
| NFR-07 | Accessible use *(v0.4)* | **Should** |
| AIR-08 | Consistency across repeated runs *(v0.4)* | **Should** |
| FR-06 | 3D model library | **Could** |
| SAF-04, SUS-06 | Safe 3D printing suggestions, model details *(v0.4)* | **Could** |
| FR-15 | Handover brief | **Could** |
| FR-09 | In-app purchasing | **Won't** |

**Scope guard:** New requirements enter as *Could* by default. A requirement moves up only if another one of equal effort moves down or the team confirms capacity.

## Epics

| Epic | Description | Requirements |
|---|---|---|
| E1 · Guidance | From problem description to completed work | FR-01–03, FR-07, AIR-01–04 |
| E2 · Profile & Inventory | Know the user and what they own | FR-10–13, FR-08, AIR-09 |
| E3 · Sourcing | Find missing items sustainably | FR-04–06, SUS-01–07 |
| E4 · Safety & Responsibility | Decide what is DIY and what is not | FR-14/15, SAF-01–07, AIR-10 |
