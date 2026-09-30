---
id: ARC-016
title: Agent M's own tests — deterministic core tests, repository checks, browser end-to-end with Playwright, model-dependent rates, and recorded counter-proofs
forced_by:
  - EVERY TEST HAS ONE LEVEL
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - COMMIT TESTS CALL NO PAID SERVICE
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
---
# ARC-016 Agent M's own tests

## Context

Agent M is itself developed SPEC-first, and its SPEC names a check for nearly every requirement. The
repository already runs two suites on every push (`.github/workflows/tests.yml`): Python `unittest`
checks over the repository's files (`tests/test_*.py`, with `tests/artifact_checks.py` for use cases
and architecture files) and `node --test` over the DOM-free core (`tests/review-core.test.mjs`,
`tests/architecture.test.mjs`). Counter-proofs are recorded in `docs/measurements/`
(`2026-09-30_review-dashboard-mutations.md`). The UI wiring in `review-app.mjs` runs only in a browser
and is covered only by parse and no-direct-`fetch`/no-`localStorage` checks. SOFTWARE_MAINTENANCE
§4.0a sets five rules: expected result first; metamorphic checks where there is no single right
answer; decide without a model what can be decided without one; measure what needs a model as a
rate; remove what cannot fail, and prove each new test fails on a planted fault.

## Decision

Five kinds, each with one level (`EVERY TEST HAS ONE LEVEL`):

1. **Core tests — `unit`/`component`, every commit.** `node --test` over the core modules, with
   recorded or constructed responses for every external service (a fake `fetch` that records
   requests; `COMMIT TESTS CALL NO PAID SERVICE`). Every requirement whose check names
   `tests/review-core.test.mjs` today moves with its code into a test file per module
   (`tests/<module>.test.mjs`), each test file naming its module and the requirements it guards
   (ARC-020).
2. **Repository checks — `unit`, every commit.** Python `unittest` over files: formats of use cases,
   architecture files, records, group files; the settings page covering every stored key; no product
   named in the instance. They read artifacts, never the SPEC's prose as a source of expected values
   (SOFTWARE_MAINTENANCE.md, section "Prozess und Produkt": `KEIN SOLLWERT AUS DER SPEC`).
3. **Browser end-to-end — `system`, pull request and nightly.** Playwright drives Chromium, Firefox
   and WebKit against the dashboard served from `docs/` locally, with the git host and the bridge
   replaced by local fake servers; it covers the flows the unit tests cannot: a click that commits,
   a refused save that keeps the edit, the settings page's Show/Clear, pairing with a fake bridge.
   The same harness runs the reachability measurements of ARC-012 and ARC-014 on a schedule and
   writes them as dated files, so `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` has a repeatable
   instrument.
4. **Model-dependent measurements — `release`, nightly and on release candidates.** The derivation
   classes, the correction loop's success per participant, the personal-data rate of neutral issue
   texts: each on a fixed set of cases with several phrasings, a number of runs fixed before the
   first run, reported as a rate against the last release — never gated on one run
   (`A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`, SOFTWARE_MAINTENANCE §4.0a rules 2 and 4).
5. **Bridge tests — `component`, every commit, and `system` on release candidates.** The bridge's
   modules run under `deno test` with fake agents (fixture executables on `PATH`), a local test IMAP
   and SMTP server, and a test SSH server in a container for the tunnel checks the SPEC names
   (`tests/test_bridge_tunnel.py`). The compiled binaries are started on each platform's hosted runner
   on release candidates (ARC-017).

**Counter-proofs.** Every new test is committed with a counter-proof: the mutation applied, the
suite's red result, the restore — recorded in a dated file in `docs/measurements/`, as the existing
files do. A test whose outcome flips on the same commit is shown as flaky and repaired or removed.

### Due diligence of the browser end-to-end tool (read 2026-09-30)

Sources as in ARC-002. Agent M does not ship the tool; it is a development dependency in CI.

| Candidate | Licence | Against MIT | Releases | Issues | Adoption |
|---|---|---|---|---|---|
| **Playwright** (microsoft/playwright, npm `playwright`) — chosen | Apache-2.0 | compatible | latest 1.63.0 on 2026-09-04; 14 GitHub releases in 12 months | 173 open, 17 896 closed, 1 973 closed in 12 months | 379 154 861 downloads last month; 96 918 stars |
| Puppeteer (puppeteer/puppeteer) | Apache-2.0 | compatible | latest 25.12.0 on 2026-09-23; 53 versions in 12 months | 243 open, 7 173 closed, 192 closed in 12 months | 45 482 329; 95 641 stars |
| Selenium WebDriver (SeleniumHQ/selenium, npm `selenium-webdriver`) | Apache-2.0 | compatible | latest 4.49.0 on 2026-09-09; 14 versions in 12 months | 107 open, 11 146 closed, 340 closed in 12 months | 8 423 890; 34 523 stars |

## Alternatives

- **Puppeteer** — its README (read 2026-09-30) names Chrome and Firefox; Playwright's README names
  "Chromium, Firefox, and WebKit". WebKit is Safari's engine, whose loopback and storage behaviour the
  measurements of ARC-012 need to cover.
- **Selenium** — needs a driver per browser and a grid for parallel runs; more setup for the same
  coverage.
- **No browser tests, manual checks only** — rejected: the write paths are the riskiest code, and
  `docs/measurements/2026-09-24_one-click.md` records them as "not measured".

## Consequences

- CI gains a Node dependency tree for Playwright and its browsers; it is installed in CI only, never
  served by Pages and never compiled into the bridge.
- Tests that need a real token, a real mailbox or a real signing identity are not commit tests; they
  run by hand or nightly with CI secrets, and their results are result records like any other.
- Moving `review-core.test.mjs` apart along the modules is part of the refactoring job of ARC-003;
  its tests keep their expected results (`A REFACTORING JOB CHANGES NO EXPECTED RESULT`).

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
