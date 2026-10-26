# User stories 1 to 6 — extract

From `docs/Requirements_EN.md` of github.com/mrh421/Applied_AI_DAIY, commit `3afde9d`; original SHA-256 `8a75f5d45df83ae5441881307f6c01e33df1ca1560036499f8773f193611a6ce`, not stored here.

Sections kept: User Stories. The text is the original's, unchanged.

---

## User Stories

### User Story 1 · Understand a Repair (Persona A, E1)

As a user with limited technical experience, I want to describe my household problem in simple words so that I can get a suitable guide without needing specialist knowledge.

**Acceptance criteria**

- The input accepts a free-text description.
- When important information is missing, the app asks understandable follow-up questions.
- The instructions include tools, materials, numbered steps, and safety warnings.
- Technical terms are explained or avoided.

### User Story 2 · Find the Right Materials (Persona A/B, E3)

As a budget-conscious user, I want to compare suitable new and second-hand products so that I can carry out the work affordably and as sustainably as possible.

**Acceptance criteria**

- The app creates a materials list from the instructions.
- Product suggestions are filtered according to defined requirements.
- Price, condition, and data source are displayed transparently.
- Unverified compatibility is marked as uncertain.

### User Story 3 · Avoid Unsafe Repairs (Persona A, E4)

As a user without hands-on repair experience, I want to be warned when a repair could be dangerous so that I do not put myself or others at risk.

**Acceptance criteria**

- Defined high-risk test cases trigger the intended warning or escalation.
- No disallowed DIY instructions are provided for these cases.
- The app clearly explains why it is not providing instructions.
- Unclear cases are not automatically classified as safe.

### User Story 4 · Plan a Project with My Own Stock (Persona B, E2/E3)

As an experienced DIYer with a maintained inventory, I want the app to plan my project based on my skills and what I already own so that I only buy what is missing and do not lose time on basics.

**Acceptance criteria (Given-When-Then)**

- **Given** a profile "woodwork: advanced" and an inventory containing 3 bags of quick-set concrete, **when** the user requests a plan for a 12 m wooden fence, **then** the materials list marks concrete as "partly available" with the missing quantity, and only missing items get product suggestions.
- **Given** the same request, **when** the instructions are shown, **then** basic steps (e.g. how to use a spirit level) are collapsed but expandable.
- **Given** a required tool that is not in the tool inventory, **when** the plan is created, **then** the tool is listed separately with a rent-or-borrow hint.
- **Given** the fence height depends on local rules, **when** the plan mentions height, **then** it is marked "check locally" (AIR-10).
- **Given** the project is marked complete, **when** the user confirms used quantities, **then** the inventory is updated.

### User Story 5 · Separate DIY and Professional Work (Persona B, E4)

As a tech-savvy homeowner, I want a project like "connect my heat pump to my smart home" split into work packages labelled by who may do them so that I do as much as possible myself without breaking rules or warranty conditions.

**Acceptance criteria (Given-When-Then)**

- **Given** the user has not named the heat pump model, **when** the request is submitted, **then** the app asks for manufacturer, model and available interface before giving instructions.
- **Given** the model is known, **when** the plan is created, **then** every package carries one of the four FR-14 labels with a reason. Test expectation: network or data-interface integration = DIY; wiring inside the unit's control cabinet at mains voltage = professional only; refrigerant circuit = professional only.
- **Given** a profile "electrical: expert", **when** the same plan is created, **then** the labels are identical to those for a beginner profile (SAF-07).
- **Given** a package whose classification is uncertain, **when** the plan is shown, **then** the stricter label is used and the app names the information that would change it (SAF-06).
- **Given** possible effects on warranty or funding, **when** the plan is shown, **then** they are marked "check with manufacturer or funding body".

### User Story 6 · Start Without Setup (Persona A/B, E2)

As a first-time user, I want to start a case immediately without filling in a profile or inventory so that the app is useful from the first minute.

**Acceptance criteria (Given-When-Then)**

- **Given** no profile and no inventory exist, **when** the user submits a problem, **then** the app treats the user as a beginner and answers within the NFR-03 step limit.
- **Given** a case has been answered, **when** the materials list is shown, **then** the app offers to save listed items the user already owns to the inventory, without requiring it.
