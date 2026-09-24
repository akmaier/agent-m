# §1: grouping and hierarchy, the specification browser; the extension of `EVERY ARTIFACT NAMES ITS ORIGIN` (from g2)

**Drafted by a subagent** from the PO's words of 2026-09-24 (quoted in the draft) and the book; read in
full, cross-checked against the other groups and integrated by the main agent. The rules are in the
five-field form, one statement each, with a named check. Where the section already existed, only the
listed rules change — the diff on the dashboard shows exactly that.

**Changed under its existing name:** `EVERY ARTIFACT NAMES ITS ORIGIN` now also covers architecture
decisions, modules, code files and a test's module (group g2, B1; impact list: SPEC.md, UC-005, UC-007,
UC-012 — they realise it unchanged). The alternative the drafter offered: four separate names
(`AN ARCHITECTURE DECISION NAMES WHAT FORCES IT`, `A MODULE NAMES WHAT IT REALISES`, `A CODE FILE
NAMES ITS MODULE`, `A TEST NAMES THE MODULE IT EXERCISES`) — strike the extension and ask for them if
you prefer.

## Open questions of the drafting group (g1 — they concern entries 01 and 05)

1. **Grouping requirements = SPEC sections.** I propose that the requirement hierarchy *is* the
   SPEC's section headings (`THE SPEC'S SECTIONS ARE THE REQUIREMENT GROUPS`). Consequence: moving a
   requirement to another section, or adding a sub-section, is a SPEC change and needs acceptance
   (UC-006). The alternative — requirement groups in `docs/groups.md`, independent of sections —
   makes regrouping free but gives each requirement two places. Which one?
2. **A move across two sections must be accepted as one.** Today a queue entry replaces one section
   (anchor to next heading). If a move is split into two entries, accepting only one of them
   duplicates or loses the requirement. UC-021 assumes one entry may span the affected sections as
   one contiguous range, or that the dashboard accepts the entries of one move together. Which is
   intended?
3. **Is a regrouping of use cases a person's own input** (committed directly, as proposed, under
   `A PERSON'S OWN INPUT IS COMMITTED DIRECTLY`) or a reviewed artifact that needs acceptance?
4. **One place or several** (`AN ITEM HAS ONE PLACE IN ITS HIERARCHY`): a strict tree is proposed.
   If you want an item in several groups (tags, e.g. "security" across chapters), that rule goes.
5. **Where do `ARC-`, `MOD-` and `TST-` artifacts live?** `ONE REVIEW LAYOUT FOR EVERY PRODUCT`
   names only use cases, queues and approvals. The browser (UC-020) and the group file need to find
   them; I wrote "wherever the product repository holds them". Another group may already define this.
6. **Prompted change through a CI agent.** A CI agent's result reaches the default branch by commit
   (UC-010), i.e. without the person seeing the difference in the editor first. Should the dashboard
   route (difference first, then Save) be the only route for prompted changes of *use cases*, or is
   "committed as open, reviewed in UC-008" acceptable? If the latter, UC-008 should show the
   difference to the last accepted version.
7. **Placement of the browser rules.** I put the four browser rules under §1 (they are traceability
   views). They could equally go to §10 (review on Pages).
8. **Should the editor keep an unsaved draft** in the browser (`localStorage`) across a reload? Not
   proposed as a requirement; UC-018 only asks before discarding.

**Decided by the PO on 2026-09-24** — see the table on the queue's index page; the questions below that it answers are settled, the others stay open.
