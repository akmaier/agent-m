---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5597da66059e701a560f8af6cc86121cc4aee83c
  - https://github.com/akmaier/agent-m/pull/784
date: 2026-10-17 21:30 UTC
---
# Development → Release testing: ITM-836, the Graph route reads and finds mails, and lists Drafts and Sent

**REGISTER**

## Reason

ITM-836, pull request #784 into `sprint/team2/79`, at head `5597da66`. All five checks hold.

- **Red first.** The tests-only commit `ff8b422d` was red on node (6). CI is green ten of ten on the head.
- **Scope.** Only `src/mail-routes/` and a new test naming MOD-mail-routes change. The new `vendor/postal-mime/` is a
  Part of the module file and the item's Outcome. It is byte-identical to `dist/esm/` and the MIT-0 licence of
  postal-mime 4.0.4. Its `sourceMappingURL`s name maps that are not vendored, which is harmless in a verbatim copy.
- **Counter-proofs replayed in a checkout of the head.** Each of these fails its test:
  - the token in the address;
  - a foreign next page followed;
  - `find` guessing;
  - a `POST`.
- **The readings stand.** Drafts and Sent are taken by Graph's well-known names. A next page is followed only under Graph
  v1.0. `find` matches by `Message-ID` only, never a guess.
