---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 2f1a1525245da6d6f3f381876cc04523a14e3b67
  - https://github.com/akmaier/agent-m/pull/1319
date: 2026-10-23 00:09 UTC
---
# Development → Release testing: ITM-617, the writer backlog-items, rejected once for a question to akmaier

**REGISTER**

## Reason

ITM-617, pull request #1319 into `sprint/team2/105`, is rejected once, on `2f1a1525`. Everything else holds, but one
reading derives what the texts do not give, and it needs akmaier.

**What holds.**
- **CI** is green on 28 of 28.
- **Red, from the full job logs of the tests-only commit `1df180bb`:**
  - job 120159372110: `not ok 434` to `440`, TST-617001 to 007, with `# fail 7`;
  - job 120159372128: `not ok 401`, TST-615008;
  - job 120159372146: `not ok 433`, TST-616010.
- **TST-1169002** failed at `c2a5d680` (job 120160343049), and `2f1a1525` fixes only the three declarations.
- **The three readings the item named are settled by texts:**
  - `origin` is what the item realises: UC-032:34 and EVERY ARTIFACT NAMES ITS ORIGIN.
  - A `duplicate` is saved, and the warning is returned with the commit: MOD-work-plans.md:219-220, "a warning — an
    item that restates an existing one — is returned with the commit".
  - The two sections come from the answer's `outcome` and `acceptance`.
- **The behaviour beyond them is asked by the text.**
  - `saveItems` takes `{ items, removed }` and serves "an item pointed at a replacing requirement or removed (UC-032
    1a)" (MOD-work-plans.md:217-220). So rewriting an item the head holds, and removing one, are its own.
  - `NotFound` for an unknown identifier in `removed` is the host's kind of error.
- **TST-617002** shows "no history holds": a withdrawn ITM-1400 gives ITM-1401.
- **TST-616010** pins the writers' keys. My brief said no test pinned them; that was wrong. It is a MOD-work-plans test,
  within the item's module.

**Why rejected: the fourth reading.** The item format requires `level` and `tests` for a backlog item, and
`integrates` for the level `subsystem` (`src/documents/schemas/item.schema.md`). The kind's answer
(`propose-items/answer.schema.json`) carries none of them. i derives them:
- `tests` from the words "unit", "component", "system" or "release" in the acceptance criteria;
- `level` as the highest of these;
- `integrates` from the one decision the item's modules follow.

The texts do not give this direction.
- UC-032:86-88 says the acceptance criteria "name the tests of its level — unit tests for a module, component tests for a
  subsystem, system and release tests for the system". The level decides which tests the criteria name. The criteria are
  not the source the level is read from.
- Reading a level out of a model's free text is a guess the texts do not make, and a criterion that mentions a test of
  another level would set the wrong one.
- Step 3 names the item's kinds (module items, one per subsystem, the system's), but the answer holds no field that says
  which an entry is.

Implementation is not possible without a text change: either the answer names the level, or a text says how it is
derived. So the item stops, under AGENTS.md §6a.6.

## The question for akmaier

UC-032 step 3 drafts items of three kinds, for a module, a subsystem and the system, but the drafted answer does not say
which an item is. The item file needs its `level`, its `tests` and, for a subsystem, the decision it `integrates`.

Should the drafted answer name each item's level, with the tests then following from UC-032 step 3 and `integrates`
from its modules' decision? Or should Agent M read the level from the item's acceptance criteria?

This cannot be settled from the texts: the answer schema has no such field, and UC-032 says only that the criteria name
the tests of the level, not where the level comes from.
