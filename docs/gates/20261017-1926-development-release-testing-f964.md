---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 14043a27b956af4ef9557f5dcee0d4a196ac22b2
  - https://github.com/akmaier/agent-m/pull/756
date: 2026-10-17 19:26 UTC
---
# Development → Release testing: ITM-811, the destination-disclosure test reads no old settings text

**REGISTER**

## Reason

ITM-811, pull request #756 into `sprint/team1/75`, at head `14043a27`. It is one commit, and run 39062283783 passed ten
of ten. The diff against the sprint branch is `tests/test_destination_disclosure.py`, +3/−4.

**The ruling at its stop is met** (ITM-811, `75.md`).
- The case asserting `api.github.com` in `settingsView.TOKEN_GUIDANCE` is removed.
- The header names MOD-repository-hosts, without item history.
- The Guards line keeps only `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`.
- The `TOKEN_DESTINATIONS` and `authHeaders` assertions are unchanged.
- The pull request states that no requirement loses its test.
- It is declared as refactoring, and CI is green on its one commit.

**The docstring reading is accepted.** The docstring at `:4` drops the same name as the Guards line, so the file claims no
guard its header lacks. The name it dropped is in no sentence of SPEC.md.

**Checks.** The file passes before and after, as does ITM-018. No test asserts `api.github.com` in the guidance any more.
The removed line was the known positive of that grep.

**The reading** was done in full this time, with line counts.

**Findings.** None new. `MOD-repository-hosts.md:78` still lists the file among those taken over, for the half that is
kept, which ITM-689 moves.
