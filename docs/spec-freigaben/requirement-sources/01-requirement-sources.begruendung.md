# 2. Requirement sources: the person who prompts is a source by their account

**The change.** Two rules change; their names, and every other byte of the section, are carried over.
- `A REQUIREMENT HAS A REGISTERED SOURCE`: a requirement may name, instead of a source its product links, the account
  `<server>/<account>` of a person.
- `THE PERSON WHO PROMPTS IS A SOURCE`: a requirement drafted from a person's instruction names that person's account,
  not a registered source of theirs.

**Why.** akmaier, 2026-11-08: "I/the user should be a default source that does not need adding." A change of
requirements by prompt for the new product Alien Invasion was refused under `THE PERSON WHO PROMPTS IS A SOURCE`,
since the product links no source of the person (job JOB-20261108-1334-93c5). Of two designs offered — Agent M
registering and linking a person source for every product, or the account itself being the source — akmaier chose
the account. The account already names the person, and the person's decisions are already recorded as their acceptance
commits in each product, so a register entry and a link of it would keep a second copy of what the account and the
version history hold (*Nothing twice*); it needs no first step for a new product (*No special first case*).

**Impact list.**
- Use cases: UC-019 (step 6 names "the author's own source — the register entry of the author's account, which the
  product links"; alternative flow 4b, no own source linked) and UC-005 and UC-015, which name the two rules, are
  drafted for acceptance once this entry is accepted.
- Architecture: MOD-source-register (`personSource`), MOD-job-catalogue and the kind `change-requirements` (its
  parameter `source`), MOD-spec-changes (the precondition `person-source`), MOD-prompt-bar, MOD-review-pages,
  MOD-trace-pages and MOD-maintenance-pages (the subjects' `source`), ARC-041, ARC-045; `docs/groups/requirements.md`.
- Checks: `tests/test_requirement_has_source.py` and `tests/test_prompted_source.py` gain the cases the rules' checks
  name; the tests of `personSource` and of the subjects' `source` move with the code.

**Origin.** akmaier's order of 2026-11-08 and choice of the same day ("Account is the source").
