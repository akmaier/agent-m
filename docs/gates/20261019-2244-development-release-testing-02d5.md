---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d1102f7d743382fdfb917a52f6ae28a89d66eef6
  - https://github.com/akmaier/agent-m/pull/1176
date: 2026-10-19 22:44 UTC
---
# Development → Release testing: ITM-1144, a resource kind's required columns are stated once

**REGISTER**

## Reason

ITM-1144, pull request #1176 into `sprint/team2/97`, passes on `d1102f7d`. CI is green, on 20 of 20 jobs.

1. **One statement.** The five `requiredWhen` copies leave `src/resource-list/resources.schema.md`. The required columns
   stand once, in `rules.mjs`'s `NEEDS`, where MOD-resource-list.md:91-93 puts them (`resourceFindings`: "the columns
   its kind requires"). The known positive: with `NEEDS` off, `tests/test_resources.py` now fails 11 cases. Before, it
   failed none, which was ITM-1144's finding.
2. **The changed assertion of TST-472588, judged as no changed result.**
   - Its last assertion now says that the schema alone names none of these rules, and that the schema with
     `resourceFindings` names the same rules as before.
   - What a list is judged to lack is unchanged. Only which of the two places says it changed, which is the refactoring
     itself.
   - No caller judges `docs/resources.md` by `documentFindings` alone. The resources page runs `schemaForm` with
     `resourceFindings` as its `extraChecks` (`src/settings-pages/resources.mjs:105`), and no job's artifact schema is
     the resource list's.
3. **`writeDocument` no longer throws for a row that lacks its kind's column, judged harmless.**
   - *Save* writes only when no finding remains.
   - *Move* (`resources.mjs:263-264`) writes the list as it was opened, with one pin changed, so it adds no lack the
     repository did not already hold.
   - No other writer of `docs/resources.md` exists in `src/`. ITM-1122's fix of `schemaForm` keeps the gate for edited
     rows.
