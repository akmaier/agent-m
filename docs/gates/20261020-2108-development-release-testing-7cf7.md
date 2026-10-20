---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1807ffdb48983e0a595687f874228c80d24eba65
  - https://github.com/akmaier/agent-m/pull/1237
date: 2026-10-20 21:08 UTC
---
# Development → Release testing: ITM-587, Get your own Agent M guides the fork, Pages and Actions steps

**REGISTER**

## Reason

ITM-587, pull request #1237 into `sprint/team2/98`, passes on `1807ffdb`. CI is green on 23 of 23 checks. The head merges
`sprint/team2/98`, ITM-1150 included.

1. **Red first.** Helper pull request #1238 has a CI run at the tests-only commit `c02a910f` (run 39497075384).
   - node (4) fails the eight new cases of `get-your-own`: the four steps, the fork page without an owner, each step's
     exact page with the owner known, Pages' choice, Later, Later storing nothing, `step=actions` with the owner read
     from the instance, and the step names.
   - node (3) failed on TST-294001 (`tests/component-itm-294-https-reverse-tunnel.test.mjs`, the TLS reverse tunnels),
     which this item does not touch. That is a flip under agreement 94, reported here to both teams.
2. **The accepted text.**
   - MOD-settings-pages.md:171 reads "the fork, Pages and Actions steps with their direct links once the owner is known".
   - The steps link MOD-repository-hosts' `webLinks` (ITM-950) and MOD-identifiers' `pagesAddress`
     (MOD-settings-pages.md:37). Each of `parseAddress`, `connect`, `webLinks`, `pagesAddress` and
     `MOD-site-frame.explain` is in the module's uses.
   - The page requests, stores and writes nothing.
3. **f's readings hold.**
   - **Not wired into the live page.** The route is served by the frame (`start.mjs`), and `dashboard-app.mjs` and
     `src/site/views.mjs` stay as they are.
     - The live switch is ITM-684's chain, and changing the old page would break ITM-129's release test.
     - The Acceptance names the route and its address `#get-your-own/step=actions`, not the live page.
   - **The owner.** Without an owner in the address, the owner is read from the person's own instance.
   - **Later** moves on to Step 4 and stores nothing (UC-014's optional Actions step).
   - **The explanations.** Each step carries its folded explanation, six new topics in `src/site-frame/explanations.md`,
     with their test.
4. **Scope.** ITM-587's modules are MOD-settings-pages and MOD-site-frame.
   - The pull request changes `src/settings-pages/`, `src/site-frame/explanations.md` and three new tests that name
     those modules.
   - No release test changes.
5. **The reading** is named in the pull request: AGENTS.md §2, SPEC.md's `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`,
   and chapters 9, 11, 12 and 13.
