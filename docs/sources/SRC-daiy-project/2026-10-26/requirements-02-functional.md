# Functional requirements FR-01 to FR-15 — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: 1. Functional Requirements. The text is the original's, unchanged.

---

### 1. Functional Requirements

#### FR-01 · Problem and Project Input

Users describe a repair problem or a small project in plain language and can optionally upload a photo. The input is interpreted in the context of the user's skill profile (FR-10) and inventory (FR-11, FR-12) if these exist.

**Priority:** Must-have

*Example A:* "My drawer is sticking and no longer closes properly."
*Example B:* "I want to build a 12 m wooden fence along the garden boundary."

#### FR-02 · Interactive Problem Diagnosis

The AI asks targeted follow-up questions when information needed to find a suitable solution is missing.

**Priority:** Must-have

*Example:* "Does the drawer stick when you pull it out, or only when you close it?"

#### FR-03 · Step-by-Step Instructions

The app provides instructions including required tools and materials, estimated time, and warnings. Level of detail follows the skill profile; basic explanations can always be expanded.

**Priority:** Must-have

#### FR-04 · Materials List and Product Search

The app creates a bill of materials from the instructions, matches it against the material inventory (FR-11), and suggests new and second-hand products only for missing items.

**Priority:** Must-have — using sample product data

#### FR-05 · Sustainable Alternatives

The app prioritizes repair and reuse and transparently compares new and second-hand offers.

**Priority:** Should-have

#### FR-06 · 3D Printing Option

For suitable, non-safety-critical replacement parts, the app can suggest matching 3D models and link to a download or printing service.

**Priority:** Could-have

#### FR-07 · Guided Execution

Users can check off individual steps, ask for a step to be explained again or simplified, and ask follow-up questions when they encounter a problem.

**Priority:** Must-have

#### FR-08 · User Accounts and Sync

Users can create an account to sync profile, inventory and history across devices and delete all their data.

**Priority:** Should-have *(changed in v0.2 from "Not in the MVP"; local use without account remains possible, see FR-10/11)*

#### FR-09 · In-App Purchasing

**Priority:** Won't-have (this project)

#### FR-10 · Skill Profile

Users can state their experience per area (e.g. woodwork, plumbing, electrical, network, heating) on a simple scale. Without a profile, the app assumes "beginner". The profile is stored on the device.

**Priority:** Must-have

#### FR-11 · Material Inventory

Users can record materials they own (name, quantity, unit, optional location). Consumed materials can be deducted after a project. Stored on the device; synced with FR-08 if an account exists.

**Priority:** Must-have

#### FR-12 · Tool Inventory

Users can record tools they own. Missing tools are listed separately, with a hint to rent or borrow where sensible.

**Priority:** Should-have

#### FR-13 · Project History

Completed and ongoing projects are saved with steps, materials used and notes.

**Priority:** Should-have

#### FR-14 · Work-Package Classification

For projects with several tasks, the app splits the work into packages and labels each as **DIY**, **DIY preparation for a professional**, **professional only**, or **not recommended**, with a short reason.

**Priority:** Must-have

#### FR-15 · Handover Brief for Professionals

For packages labelled "professional only", the app generates a short task description the user can send to a professional.

**Priority:** Could-have
