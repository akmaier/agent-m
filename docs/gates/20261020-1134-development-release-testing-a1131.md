---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ba3d1bfedb9d5243dbf406a86419344c9bde918d
  - https://github.com/akmaier/agent-m/pull/1196
date: 2026-10-20 11:34 UTC
---
# Development → Release testing: ITM-1131, passed — the check that no secret is written exists, as the SPEC names it

**REGISTER**

## Reason

ITM-1131 (MOD-documents), pull request #1196 into `sprint/team1/97`, passes on `ba3d1bfe`.

- **One commit, one parent (`1d9cd123`), with the trailer `developer-sonnet-e`.** It is a job that writes tests, so it
  has no code commit.
  - `tests/test_no_secret_written.md` holds the data: seven cases in two sections.
  - `tests/test_no_secret_written.py` is only the loader (AGENTS.md §7). Its header names MOD-documents, level `system`.
  - `tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs` moves the check from `MISSING_CHECKS` to the
    evidence of NO SECRET IN THE REPOSITORY, as TST-513201 asks, and TST-513202 loses its `todo`.
- **Every check and counter-proof the SPEC names has its case:**
  - SPEC.md:39-40: a generated artifact containing a configured secret value fails the run. That is three cases (a
    text, bytes, the person's token) and a counter-proof.
  - SPEC.md:2259-2260: a configured resource credential in `docs/resources.md` fails the run. The list's findings and
    the commit each have a case, and the counter-proof is the secret's name alone.
- **The release test is changed by a participant who implemented none of what it tests.** developer-sonnet-e built
  neither `refuseSecrets` nor `resourceFindings`, so `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1501-1503)
  holds.
- **Every case passes on today's code,** so there is no finding to register.
- **CI:** 20 of 20 checks passed on the head (run 39415457840).
- **Replayed in a clean worktree at the head:**
  - `python3 -m unittest test_no_secret_written` is OK.
  - `tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs` passes 11 of 11, with no `todo`.
  - Planted fault: with `refuseSecrets` returning at once (`src/repository-hosts/index.mjs:108`), the four cases of a
    refused commit fail, and the counter-proofs pass.
