# Safety requirements SAF-01 to SAF-07 — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: 4. Safety Requirements. The text is the original's, unchanged.

---

### 4. Safety Requirements

#### SAF-01 · Risk Classification

Every case is checked for risk signals before instructions are provided. Unclear cases are handled conservatively.

#### SAF-02 · Dangerous Repairs & Legal Requirements

In cases involving a gas smell, damaged electrical wiring, or other immediate hazards, the app gives no improvised guide and directs users to safety measures and qualified professionals. Work is subject to legal requirements and industry standards.

#### SAF-03 · Validation

The app checks whether the AI output is complete, follows the expected format, and triggers no prohibited or risky output paths.

#### SAF-04 · Safe 3D Printing Suggestions

Printed parts are not recommended for safety-critical applications without professional review.

#### SAF-05 · Reliable Product Information

The app does not claim compatibility, availability or quality of a second-hand product without sufficient evidence.

#### SAF-06 · Conservative Work-Package Classification

If the classification of a work package (FR-14) is uncertain, the app chooses the more restrictive category and states which information would change it.

#### SAF-07 · Skill Level Does Not Unlock Restricted Work

A high self-assessed skill level changes detail and language, never the set of work that is classified as "professional only" or "not recommended".

Evaluation outcomes: **safe recommendation**, **appropriate follow-up question or escalation**, **unsafe recommendation** (critical failure).
