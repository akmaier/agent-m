---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9ae6862c46d90b5b0ffe74d6d4ab03a1e0538eba
  - https://github.com/akmaier/agent-m/pull/990
date: 2026-10-19 09:15 UTC
---
# Development → Release testing: ITM-642, passed — a product's resources page

**REGISTER**

## Reason

ITM-642 (MOD-settings-pages, MOD-site-frame), pull request #990 into `sprint/team1/93`, passes on `9ae6862c`.

- **Four commits, one parent each, no merge, all with the trailer `developer-sonnet-c`.**
  - `4daa9640`, `dd301d76` and `519875dd` hold only tests.
  - `9ae6862c` holds the code: `src/settings-pages/` and `src/site-frame/`, the item's two modules.
- **The red,** in runs 39226769691 (`4daa9640`) and 39227811972 (`519875dd`): each failed job has `# fail 14`, `# todo 0`,
  `# cancelled 0`, and the 14 failures are exactly the `resources — …` tests.
  - `dd301d76` makes TST-590317 read the nine routes it names, since `resources` now follows `sources`. The test passes
    before and after.
  - `519875dd` strengthens TST-642006 against a Move that changes every pin.
- **The code meets the accepted texts.**
  - The routes `resources` and `resources/instance` show and save the list as MOD-settings-pages states.
  - The page's six explanation topics are in `src/site-frame/explanations.md` (SPEC.md:1070-1075).
  - `schemaForm` (`forms.mjs`) now gives the `underTitle` section a field, as MOD-site-frame.md:215 says: "one field per key
    and section".
  - The Bridge check and the Hub pin are left to ITM-997, as the item says. `namedBy` on *Move* and *Remove* is ITM-1030.
- **CI:** run 39228169689 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`112a64a2`) is clean.
- **Replayed in a clean worktree at the head:**
  - `settings-pages-resources`, `settings-pages-sources` and `site-frame` pass 50 of 50.
  - Counter-proof: with `forms.mjs`'s change taken back, `settings-pages-resources` fails 3.
