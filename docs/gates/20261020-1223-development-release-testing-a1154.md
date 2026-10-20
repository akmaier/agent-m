---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 2c03697e0679ac3f611b2db7967eada64eba45fb
  - https://github.com/akmaier/agent-m/pull/1205
date: 2026-10-20 12:23 UTC
---
# Development → Release testing: ITM-1154, rejected — the section's rule changes the rule of the header's other findings

**REGISTER**

## Reason

ITM-1154 (MOD-resource-list), pull request #1205 into `sprint/team1/97`, is rejected on `2c03697e`.

**What holds.**
- **The commits:**
  - `abba5c4d` (developer-sonnet-a) holds only tests: `tests/resource-list-participant-columns.test.mjs`. Its red is
    run 39420700544, job 118620621987, exactly test 109.
  - `ddf48065` (developer-sonnet-a) changes `src/resource-list/resources.schema.md`.
  - `c71944e2` (developer-sonnet-d, who built none of the item) removes TST-1130013's `@unittest.expectedFailure`, as
    the Acceptance asks.
  - `2c03697e` merges `sprint/team1/97` (`d5132684`) with an empty `--cc`.
- **CI:** 20 of 20 checks passed on the head (run 39421514967). TST-1130013 passes.
- **The cell findings keep their rules,** since Name, Address and Route name A PRODUCT DECLARES ITS RESOURCES
  themselves.

**What fails: "No other finding of the resource list changes its rule."** The section's new `rule` is the rule of every
finding at the table's header, not only of the participant's columns. The probe `probe1154.mjs` read a list with
`documentFindings` at the base `d5132684` and at the head:

| The list | Base | Head |
|---|---|---|
| adds Capabilities (known positive) | A PRODUCT DECLARES ITS RESOURCES | A RESOURCE IS USED, A PARTICIPANT DEVELOPS |
| header lacks Secret | A PRODUCT DECLARES ITS RESOURCES | **A RESOURCE IS USED, A PARTICIPANT DEVELOPS** |
| columns out of order | A PRODUCT DECLARES ITS RESOURCES | **A RESOURCE IS USED, A PARTICIPANT DEVELOPS** |
| Name empty | A PRODUCT DECLARES ITS RESOURCES | A PRODUCT DECLARES ITS RESOURCES |
| Kind not of the set | THE RESOURCE KIND IS ONE OF A CLOSED SET | the same |

A list that lacks a column, or holds them out of order, has nothing to do with a participant.

**What passes on the next head.** Only a header that adds Capabilities or Role is named under A RESOURCE IS USED, A
PARTICIPANT DEVELOPS. A lacking column or a wrong order keeps A PRODUCT DECLARES ITS RESOURCES, and a test shows each.
- developer-sonnet-a reads again where MOD-resource-list's text gives that place. For example, `rules.mjs` already
  refuses "an entry that carries a participant's capabilities or role" (`resources.schema.md:15-16`).
- Where no accepted text gives it, the item stops for a draft.
