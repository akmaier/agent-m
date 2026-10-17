---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c981f00b968e6fe97892f99e55605285327bd62d
  - https://github.com/akmaier/agent-m/pull/778
date: 2026-10-17 21:19 UTC
---
# Development → Release testing: ITM-835

**REGISTER**

## Reason

ITM-835, MOD-mail-routes' `storeDraft`, `updateDraft`, `showDraft` and `sendDraft` on the Bridge route: pull request
#778 into `sprint/team2/79`, on head `c981f00b`, after the rejection on `70ea40b`
(`docs/gates/20261017-2115-development-release-testing-14ff.md`, check 5).

The condition of the rejection holds now. At the failure node, `sendDraft` in `src/mail-routes/bridge-route.mjs` sends
`send` the arguments `{ ref: shown.ref, sha256: shown.sha256, confirmation: confirmed.confirmation }`, the form
MOD-bridge-http states ("`send` takes `{ ref, sha256, confirmation }`", line 67) and `src/bridge-http/protocol.mjs`
declares. TST-483504 asserts that form with an exact comparison of the request body.

Replayed on the head, in a checkout of `c981f00b`: the test file passes (10 of 10). Each counter-proof made TST-483504
fail and nothing else, and the file was restored to green:
- `ref` dropped from the `send` arguments (the developer's);
- `sha256` dropped (the developer's);
- of my own: only `{ confirmation }`, the rejected form; and `sha256` "0" in place of the SHA-256 of the mail shown.
The tests that name MOD-mail-routes or the mailbox pages pass on the head (12 files, 159 tests). CI is green on the head
(run 39070257331).

The rework changes only what the condition needs: one commit, `c981f00b`, on top of `70ea40b`; one line of
`bridge-route.mjs` (the `send` arguments) and, in the test file, the header's two lines on the request arguments, the expect
line of TST-483504 and its assertion. No other file, no dependency. The checks that held on `70ea40b` hold unchanged.

## Note (not a condition of this item)

MOD-mail-protocols' merged `send` handler (`src/mail-protocols/index.mjs`, `POST /v1/mail/send`) reads only
`args.confirmation` and takes the draft and the SHA-256 from the spent confirmation; `args.ref` and `args.sha256` are
neither read nor compared. This agrees with MOD-mail-protocols ("only when their SHA-256 is the one the confirmation
names"), and safety does not depend on it, since the confirmation is bound to one draft and one SHA-256 and the bytes are
read and compared again. Against MOD-bridge-http line 67 it is a gap rather than a breach: the line names the arguments
`send` takes but no check of them, so a `send` whose `ref` or `sha256` differ from the confirmation's is sent for the
confirmed draft rather than refused. Whether the Bridge should refuse such a request is open; deciding it would be a
statement in MOD-bridge-http or MOD-mail-protocols, for the Product Owner and the user, not part of ITM-835.
