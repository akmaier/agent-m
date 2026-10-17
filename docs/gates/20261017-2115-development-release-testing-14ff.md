---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 70ea40b25908d6f197223d6500e889f2d0208483
  - https://github.com/akmaier/agent-m/pull/778
date: 2026-10-17 21:15 UTC
---
# Development → Release testing: ITM-835

**REGISTER**

## Reason

ITM-835, MOD-mail-routes' `storeDraft`, `updateDraft`, `showDraft` and `sendDraft` on the Bridge route: pull request
#778 into `sprint/team2/79`, on head `70ea40b`.

The condition that does not hold: check 5. The Acceptance asks that "`sendDraft` makes `confirm-send` then `send`, with
the SHA-256 of the mail shown", and that "the test asserts no invented value". `sendDraft`
(`src/mail-routes/bridge-route.mjs`, the `send` call) sends `{ confirmation }` only, and TST-483504 asserts exactly that.
The accepted MOD-bridge-http says "`send` takes `{ ref, sha256, confirmation }`" (line 67). The pull request says the
request arguments are "not in the module file" and takes them from the Bridge's code instead. Replayed on the head: the
route changed to send `{ ref: shown.ref, sha256: shown.sha256, confirmation }`, the accepted form, makes TST-483504
fail. The Bridge's handler reads only the confirmation, so the accepted form also works against it.

The other checks hold. Check 1: the first commit `9b913db` holds only `tests/mail-routes-bridge-draft.test.mjs`, and CI
was red on it (run 39069759703; TST-483501 to 483507 fail because the operations are missing). Check 2: CI is green on
the head (run 39069882795). Check 3: two files change. `src/mail-routes/bridge-route.mjs` is the module's folder, and the
new test's header names MOD-mail-routes. No dependency changes. Check 4: each test names its requirements and
MOD-mail-routes, and the pull request records a counter-proof for each. Replayed on the head, each made the test fail
and was then restored to green (10 of 10):
- `confirm-send` with sha256 "0" (TST-483504);
- a refused confirmation swallowed and `send` made (TST-483505);
- the DraftChanged match never taken (TST-483506);
- the address check removed (TST-483503);
- of my own: `send` made without `confirm-send`, which fails TST-483504 to 483507.
The tests of ITM-425 and ITM-834 pass on the head (5 files, 63 tests).

The readings, judged:
- A usable reply address as one `name@host`, with no list: this is within "missing or invalid" and the Draft's one `to`.
  The test asserts only the plain cases.
- DraftChanged told from ConfirmationRefused by the Bridge's message: within the accepted texts no other reading
  exists. MOD-bridge-http answers both with `confirmation-refused` (409), and MOD-mail-routes says the call "first
  obtains" the confirmation, which leaves no room for a comparison of its own before it. The match is fragile but
  safe, because a changed message gives ConfirmationRefused and nothing is sent either way. A distinct code would need
  a change of MOD-bridge-http.
- SendRefused only on `send`: right. `upstream-failed` at `confirm-send` stays `Unreachable`.
- The byte comparison left to the Bridge: right. MOD-mail-protocols' `send` reads the draft's bytes again and compares
  them.
