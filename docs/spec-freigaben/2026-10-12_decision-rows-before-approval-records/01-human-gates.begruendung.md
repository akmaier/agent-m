# 9. Human gates: a decision row that names the SPEC commit ends an entry's open state

**The change.** `A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN` gains one clause: a SPEC change entry also stops
counting as open when its queue's decision row names the commit that wrote it into the SPEC. The rest of the section is
carried over byte for byte.

**Why.** The queues 2026-09-23 (ten entries), 2026-09-23b (five) and 2026-09-23c (one) were accepted on 2026-09-23 through
`scripts/spec_dashboard.py`, before approval records existed. Each of their sixteen decision rows reads
`| <time> | <n> | uebernommen | <commit> |`, and each named commit changes `SPEC.md` — entry 1 of 2026-09-23, for
instance, names `e2ce99d`, "spec(freigabe 01): 0. Hard product rules". No approval record under `docs/approvals/` names
any of them. As the requirement stands, all sixteen count as open, although their text has stood in the SPEC since that
day. The queues 2026-09-23d and 2026-09-23e, accepted the same evening, already name approval records and are not
affected.

What that costs: MOD-approvals' `architecture-ready`, run over this repository (ITM-437, #389), lists exactly these
sixteen as open SPEC changes; the SPEC review page (ITM-357) would offer them for acceptance again, and for nine of them
accepting would write their old text over today's sections. ITM-454 and ITM-357 wait on this decision.

**Considered and not proposed.** An agent writing approval records for the sixteen now would issue acceptances in the
PO's name after the fact, which `AGENTS.md` §2 keeps with the PO. Accepting them again through the review page would
overwrite nine sections with old text. The clause instead states how these entries were in fact decided, and names the
evidence that already exists: the commit in each row.

**Impact list.** No existing name changes. After acceptance: MOD-spec-changes' Data, where an entry's state is derived,
and MOD-approvals' `architecture-ready` read a decision row that names a commit changing `SPEC.md` as deciding its entry;
ITM-454 implements it; ITM-357 builds on it.
