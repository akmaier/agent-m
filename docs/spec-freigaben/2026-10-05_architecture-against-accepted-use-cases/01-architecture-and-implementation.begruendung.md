# 11. Architecture and implementation: architecture is designed only against accepted use cases

**The change.** One requirement is added after `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`:
`ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES`. Every other requirement of the section is carried over
byte for byte.

**Why.** PO decision, 2026-10-05: no architecture is designed against a use case that is not approved. On 2026-10-04
and 2026-10-05, architecture work changed eight approved use cases — UC-001, UC-004, UC-005, UC-010, UC-014, UC-016,
UC-030 and UC-044 — and designed decisions against the changed text, which no person had accepted.
`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS` stops only the acceptance of such a decision, not its drafting; by then the
design rests on text that may be rejected. The eight use cases were restored to their approved text in commit ffe243b.
The rule is `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED` one phase earlier.

**Impact list.** A new requirement; no artifact names it yet.
