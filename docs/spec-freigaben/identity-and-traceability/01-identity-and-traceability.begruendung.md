# 1. Identity and traceability: a requirement's name is words in capitals separated by single spaces

**The change.** The rule of `EVERY ARTIFACT HAS AN IDENTIFIER` states what a requirement's name is: a name in capitals,
words of capital letters, digits, apostrophes, commas, hyphens and dots, separated by single spaces. Its check names the
case of an underscore, of a lowercase letter and of two spaces, and two names of this SPEC as its counter-proof. Its name,
and every other byte of the section, are carried over.

**Why.** akmaier, 2026-11-08: "agent-m has rules and they need to be followed automatically by all agents", and the fix
"should also fix the underscores". A CI run of `change-requirements` (participant and model
`nvidia/nemotron-3-ultra-550b-a55b`, job JOB-20261108-2127-fa70 of the product it changed) drafted five requirements named
like `SESSION_HIGHSCORE_DATA`, and the check of a requirement passed them: no binding sentence said that a name is not
written with underscores. The preamble says only "a **name** in capitals", which a name of capitals and underscores
satisfies; MOD-identifiers' pattern accepts any character but a lowercase letter; and the fix the check of a requirement
asks for — "write the name in capitals, with digits, spaces, apostrophes, commas and hyphens only" — is a third wording
that no rule held. The rule now says it once, in the requirement whose check judges a name (*Nothing the SPEC already
says*: the requirement that gives a name its identifier is amended, no second requirement is added; the preamble is no
requirement and stays as it is). The dot is allowed because `EVERY MODEL READS AGENT M'S AGENTS.MD FIRST` holds one.
Every one of the 419 requirement names of this SPEC is of this form, checked by a script that first refused
`SESSION_HIGHSCORE_DATA`, a name with a lowercase letter, two spaces, a leading and a trailing space, a tab, a typographic
apostrophe, an en dash and a name of digits only, and accepted the two names the check names. The rule's "and" joins the
last two characters of one list; it states one thing.

**Impact list.**
- `EVERY ARTIFACT HAS AN IDENTIFIER`: changed; named by UC-004, UC-026, UC-032 and UC-045 (`realises`), ARC-048,
  MOD-identifiers, MOD-spec-document and MOD-documents, and the tests that guard identifiers — among them
  `tests/test_identifiers.py`, `tests/identifiers-kind.test.mjs` and `tests/spec-document-names.test.mjs`. The use cases
  realise the requirement as it is and need no change. MOD-identifiers' pattern of a requirement is drafted to follow the
  rule. `tests/identifiers-kind.test.mjs` holds that a name in capitals is a requirement "whatever else it holds", which no
  longer holds; it and `tests/test_identifiers.py` gain the cases the rule's check names, and the fix that
  `requirementFindings` asks for is worded from the rule.
- A product whose accepted SPEC holds names with underscores: once this entry is accepted and MOD-identifiers follows it,
  those names are no requirement's names by the scheme, so that the check of a requirement reports them and the trace
  graph and the groups no longer read them as requirements; the product renames them in an entry of its own queue, each
  as a withdrawal and an addition (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`).

**Origin.** akmaier's order of 2026-11-08, on the queue entry the run above wrote.
