---
id: ITM-552
title: The account of the person who prompts is read in one place
level: module
realises:
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-source-register
  - MOD-trace-pages
  - MOD-review-pages
builds_on:
  - ITM-508
  - ITM-507
tests:
  - unit
origin:
  - ITM-508's gate (#600): `accountOf` in `src/trace-pages/subject.mjs` copies the private `accountOf` of `src/review-pages/requirements-prompt.mjs` line for line
  - architecture draft for akmaier: MOD-source-register provides personAccount
---
# ITM-552 The account of the person who prompts is read in one place

**REGISTER**

## Outcome

MOD-source-register's `personAccount(instance: Snapshot) -> string | null`, as the draft of its file states it: the
owner of the instance's repository on its server's host, `<server>/<owner>`, or `null`. The specification browser
(`src/trace-pages/subject.mjs`) and the review pages call it in place of their own `accountOf`, and both copies are
removed (AGENTS.md §2, "Nothing twice"). This includes the copy ITM-507 uses, should it still stand after ITM-551.

It waits for akmaier's acceptance of the draft, which adds `personAccount` to MOD-source-register's provides and to the
uses of MOD-trace-pages and MOD-review-pages.

No existing test's expected result changes: the account is the same.

**Settled at sprint team1/52's start.** `personAccount` was accepted with `220b55d0`
(`docs/approvals/MOD-source-register-b00a6cc1f259.md`).
- **The two copies of `accountOf`** stand at `src/review-pages/common.mjs:82` and `src/trace-pages/subject.mjs:30`. Both
  callers use `personAccount` in their place, and both copies go.
- **The trace pages' own default subject** (`frames()`, `src/trace-pages/subject.mjs:78`) is not a copy of the frame's
  default. It adds the version shown to the page, which MOD-trace-pages asks for ("every other trace view the frame's
  default with the version shown"). The version is chosen in a field, whose value the frame's default, built from the
  drawn text, does not hold. So it stays, and this item does not change it.
- **The message of `NoPersonSource`** stands word for word in both modules. No accepted text gives MOD-source-register
  that refusal, so it stays in both until a draft does. It is left out of this item.
- **Existing tests.** None changes, since the account is the same. `accountOf` is private in both modules, and no test
  names it.
- **Where `personAccount` stands**, settled after the first CI run of #631. In `src/source-register/index.mjs`, its
  `new URL(<origin>)` makes `tests/test_no_backend.py`'s check of that file refuse the file's existing `fetch` (line 48).
  That check allows a file's `fetch` only where every `new URL(` in it resolves `./…` against the module's own address
  (`_own_data_file`, lines 167–173).
  - **The settled measure.** `personAccount` and `personSource` stand in a part of their own, `person.mjs`, which
    `index.mjs` re-exports, as the interface re-exports its other parts (AGENTS.md §2, one responsibility per file).
  - **The draft.** MOD-source-register's Parts gain `person.mjs` in a draft for akmaier, as the trace pages' and review
    pages' new parts were drafted, and the gate is not held by it.
  - **What is set aside.** Parsing the host without `new URL(` would only dodge the check. Widening the check would
    weaken a rule on what a page may request, which no text asks for.

## Acceptance

- **The function.** `personAccount` gives `github.com/<owner>` for a GitHub instance, `<host>/<owner>` for a GitLab one,
  and `null` without an owner.
- **No copy left.** `git grep "function accountOf"` in `src/` finds none, with a known positive shown before the change.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
