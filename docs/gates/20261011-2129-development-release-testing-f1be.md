---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 6b36bb1bfb49fddd0246234487b384eb9caf4616
  - https://github.com/akmaier/agent-m/pull/431
date: 2026-10-11 21:29 UTC
---
# Development → Release testing: ITM-350, the library, and registering a source

**REGISTER**

## Reason

ITM-350, pull request #431 by developer-sonnet-a into `sprint/team1/21`, head `6b36bb1`. The condition that does not
hold: the form of the common fields is built inside `src/settings-pages/library.mjs` from the entry's schema, not with
MOD-site-frame's `schemaForm`, which MOD-settings-pages' file names among its uses for exactly that — "the frame's
… `schemaForm`" — and the Outcome's "form from the entry's schema" is; a second form builder beside the frame's is a
copy (AGENTS.md §2, "Nothing twice").

The reason the pull request gives holds, and was read at the gate: `source.schema.md` names no `rule`, while
MOD-documents' file says of a schema's `rule` "every schema names one"; so a finding of an entry has no rule, and
MOD-text-tools' `finding` throws "the rule is a requirement's name in capitals, not undefined", which `schemaForm`
meets as soon as a new entry holds an error. That is a defect of MOD-source-register's data file, not this item's:
ITM-458 gives `source.schema.md` its rule, and ITM-350's rework, on this condition, builds on it.

The rest was read too and stands for the rework: the tests-only commits `a07e29e` and `4342c1d` were red (runs
38175595767, 38176106010) and the code is green (run 38176279060); the kinds by route, the first version's date, and an
EU legal text registered as its entry alone, its fetch not part of this item.
