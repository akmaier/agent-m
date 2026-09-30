# §14: the report data a writing job gets; no checker is the rewriter

**Findings (architecture change, PR #20).**
- `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL` gave jobs "the report data rewritten without
  persons", while `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF` lets a product receive the original
  data and UC-038 6b puts it into the issue unchanged — the two contradicted each other when the switch is off.
- The SPEC did not say whether the rewriting participant may also check, or share a model with a checker.

**PO decisions, 2026-10-01:** "1 OK" — the job gets the report data as the issue holds it; "3 OK" — no checker
is the rewriter or uses its model.

**The changes:**
- `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL` — "the report data as the issue holds it —
  rewritten without persons unless the product switched that off —"; the occasion says the job never gets more
  than the issue.
- New `NO CHECKER IS THE REWRITER`, after the rules on rewriting — the reasoning of `A GATE IS NOT DECIDED BY
  THE PARTICIPANT WHOSE WORK IT CHECKS` applied to the three checks.

The rest of §14 is carried over byte for byte.

**Impact list:** `SPEC.md`; UC-038 (checking participants) already describes three different models and needs
no change; MOD-pseudonymiser (`writeGate`), MOD-mail-flow (picking checkers), MOD-job-harness follow as an
architecture change — the architecture already excludes the rewriter as a checker; it must also exclude its
model.
