---
id: ITM-1401
title: The Architecture page loads, and a page that cannot load says so in plain words
level: module
realises:
  - UC-022
  - UC-023
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-review-pages
  - MOD-site-frame
builds_on: []
tests:
  - unit
origin:
  - akmaier's report on the live site, relayed to team1's sprint 142: the Architecture page shows only the menu and "Cannot access 'SERVICES' before initialization." — "This is not very useful and the user does not understand this. I think it just shows that the graph is being rebuilt. It should say so."
---
# ITM-1401 The Architecture page loads, and a page that cannot load says so in plain words

**REGISTER**

## Outcome

On the live site, the Architecture page shows only the menu and the raw exception "Cannot access 'SERVICES' before
initialization." `SERVICES` is declared at `src/review-pages/flow.mjs:185` and read by `reviewRoute` at :188, which
`routes.mjs:28` loads with `import("./flow.mjs")`. That `reviewRoute` reads `SERVICES` before `flow.mjs` has finished
evaluating points at an import cycle, a defect, not a graph being rebuilt. The probe names the path, a reproduction, the
commit that brought it in and the module that owns the fix. The modules above stand until the probe confirms them.

A route that fails to render is replaced by MOD-site-frame's `readProblem`, which shows "that this page could not be
drawn, with the error's message". The person reads a raw exception and learns neither what happened nor what to do.

## Acceptance

- The Architecture page loads on a fixture instance and on the live site's code, and shows the architecture.
  Counter-proof: the cause the probe names, put back, fails the case.
- A route that cannot be drawn says in plain words what happened and what the person can do, for example reload the page
  or report it. The error's message stays available below that text, not in its place.
- The probe's data-flow path, from the click on **Architecture** to the failure, stands in the pull request before any
  code.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- If the probe shows that the second part is a separate module's work that the first does not touch, it may become an
  item of its own.
