---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7d448a524642cf4ef97e84a04648b97eaf04b78f
  - https://github.com/akmaier/agent-m/pull/522
date: 2026-10-15 22:56 UTC
---
# Development → Release testing: ITM-503, The recording switch and the conversation record

**REGISTER**

## Reason

ITM-503, pull request #522 by developer-sonnet-c into `sprint/team1/29`, head `7d448a52`. The head is the item's two
commits and two merges of the sprint's branch, with no change of the merges' own.

1. The tests-only commit `64b1b7fe` was red (run 38811549017).
2. CI is green on the head, ten of ten jobs. Its earlier red in `tests/test_no_backend.py` is resolved by the change
   between jobs #530.
3. Changed are `src/prompt-bar/` — `index.mjs`, `record.mjs`, `conversation.schema.md` and `recording.schema.md`, the
   module's own Parts — and the new `tests/prompt-bar-record.test.mjs` of MOD-prompt-bar. No existing test changed.
4. TST-600001 to TST-600005 name their module and requirements; six counter-proofs are recorded in #522. The tests read
   no SPEC, use case or architecture file for their expected results. One of them reads the module's own schema file to
   read a record with it.
5. The Acceptance holds:
   - `recordingOf` reads `on`, `off`, a missing key and a missing file.
   - `recordingSchema` gives the switch's schema.
   - Three messages, one of them withheld, make one record, each append its own commit, with nothing earlier changed.
   - A moved head is read again.
   - A refusal for a stored secret appends the message as withheld.

Noted for the review:

- The appending is not in MOD-prompt-bar's Interfaces. `startPromptBar` does it, which ITM-504 builds. Until then the
  tests reach `conversationPath` and `appendToConversation` in `record.mjs`.
- `conversation.schema.md` names no section of its own and allows others.
- A message whose text holds a line beginning `## ` would read back as a section of its own.
