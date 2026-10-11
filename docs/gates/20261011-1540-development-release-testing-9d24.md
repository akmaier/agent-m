---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 14b923f9f3a4e75456c28c7a48da298a62db261c
  - https://github.com/akmaier/agent-m/pull/376
date: 2026-10-11 15:40 UTC
---
# Development → Release testing: ITM-383

**REGISTER**

## Reason

ITM-383, pull request #376 by developer-sonnet-c into `sprint/team1/16`, on head `14b923f`, against the item and
MOD-source-register's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `515cec9`, holds only `tests/source-register-person.test.mjs`, and CI was red on it (run
  38151799371): node failed on exactly its 2 tests of `personSource` — 1467 tests, 2 failed. Its third test passes on
  the code as it stood: it guards that a person's `identifier` passes the schema, which the entry's schema allows already.
- CI is green on the head (run 38151948301): node 1467 tests, 0 failed; python 441 tests, OK.
- Only MOD-source-register's folder — `personSource` in `index.mjs`, the prose of `source.schema.md` with its JSON
  unchanged — and the new test whose header names the module change; no existing test or expected result changes.
- The 3 new tests name what they guard — `THE PERSON WHO PROMPTS IS A SOURCE`, and `A REQUIREMENT HAS A REGISTERED
  SOURCE` — and MOD-source-register, with 22 faults planted on the draft first, the third test among those they fail.
- The Acceptance holds: this instance's SRC-po-a-maier found for `github.com/akmaier`; `null` for an account without an
  entry, for an entry the product does not link, and for an entry of another kind; a person's entry with its
  `identifier` passing the schema.

Noted for the sprint's review, no condition of this gate: the module file's table gives `identifier` as required for a
person, as for an EU legal text and a repository, while the schema requires it for none of the three, and the pull
request reads the column as where the key is written — for a person it is one `requiredWhen` line, which the review can
ask for; the account compared exactly as written; of two linked entries of one account the first answers.
