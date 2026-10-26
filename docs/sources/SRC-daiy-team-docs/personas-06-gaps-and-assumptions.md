# Coverage gaps and open assumptions — extract

From `docs/Personas_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `1dbaf9aeb28710b8860f20153f4c6b827f10dbeff2a6ebb62890ec202fd98732`, not stored here.

Sections kept: Coverage and Gaps, Open Assumptions. The text is the original's, unchanged.

---

## Coverage and Gaps

Checked on 2026-10-24 against [`Requirements_EN.md`](Requirements_EN.md) v0.3. Gaps G1–G4 are needs the personas have that no requirement covers yet. They are listed as open questions in the requirements; the team decides whether they become requirements.

| ID | Gap | Personas | Proposal |
|---|---|---|---|
| G1 | **Tenant and landlord rules.** No requirement says the app points out what a tenant may change or must report. | A, C | New SAF or FR: tenant notice for interventions in rented property |
| G2 | **Budget limit.** Users state a budget, but no requirement makes the app respect it or show a total cost. | C, A | New FR: optional budget, total cost estimate, warning when exceeded |
| G3 | **Model identification and sources.** AIR-05/06 cover matching and transparency, but nothing requires naming the source of a specification. | D, B | Extend AIR-06: verified data carries its source |
| G4 | **App language.** Personas live in Germany and use German shops, but the language of the app is not specified. | all | New NFR: German UI, English optional |

Requirements no persona exercises yet:

- **NFR-07 accessibility:** no persona with visual or motor impairments. Consider an accessibility check in the usability test instead of a fifth persona.
- **NFR-06 data protection:** photos of homes and inventories are personal data; only Andreas is likely to ask. Test the privacy notice with all groups.

## Open Assumptions (to validate)

- Beginners really prefer photo input over text. Check in NFR-01 tests.
- Experienced users are willing to maintain an inventory manually. If not, consider quick capture from the materials list (User Story 6).
- Self-assessment of skills is reasonably accurate. If users systematically overrate themselves, add a short skill check.
- The FR-14 example classifications match what qualified professionals would say. Review with at least one electrician and one heating technician.
- Students like Emre would trust second-hand listings the app links to. Check whether the transparency labels are enough.
- Experts like Andreas accept an app answer at all. If not, citing sources (G3) becomes a Must.
