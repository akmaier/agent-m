---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6adbbe3ecb35d5400e7068988ed120a5d8552451
  - https://github.com/akmaier/agent-m/pull/406
date: 2026-10-11 19:41 UTC
---
# Development → Release testing: ITM-313, an EU legal text recognised by its address

**REGISTER**

## Reason

ITM-313, pull request #406 by developer-sonnet-c into `sprint/team1/19`, head `6adbbe3`. The first commit `d1e81cb`
holds only `tests/source-register-legal-text.test.mjs`, and CI was red on it (run 38168414224): its three tests fail,
and no other test does. The code `9006548` was red in python, since a comment wrote an ELI as an address, which the NO
SERVER check reads; `6adbbe3` rewrites that comment only, and CI is green on it (run 38168851911, node 1737 tests, 0
failures; python OK). The code changes only `src/source-register/`; the new test names MOD-source-register and its
guard, and 30 faults planted on the draft are recorded. The Acceptance holds: the AI Act's EUR-Lex and ELI addresses
yield `32024R1689` and its ELI, another site's address `null`, nothing reaching the network.

The readings weighed: `recogniseLegalText` returns "the CELEX number or ELI" an address names, in no form the module
file fixes; the ELI as the URI the publication office gives it, without a language, the CELEX number from EUR-Lex's
`uri` parameter, and `null` for anything else. The ELI is an identifier the page never calls, built from the host
name at run time; that check 1 of `tests/test_no_backend.py` reads only addresses written with a scheme, and so does
not see it, is noted for the review.
