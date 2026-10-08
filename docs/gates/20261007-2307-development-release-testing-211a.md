---
gate: Development → Release testing
job: JOB-20261007-2243-5dfd
decider: po-sol
role: Product Owner
decision: passed
on:
  - 3eb57ee57976c14b332bea5c974b4e2963f97e4c
  - https://github.com/akmaier/agent-m/pull/211
date: 2026-10-07 23:07 UTC
---
# Development → Release testing: endpoint Settings composition

**REGISTER**

## Reason

Passed: merge only exact3eb57ee57976c14b332bea5c974b4e2963f97e4c into sprint/09. This is the separately selected between/09-endpoint-settings delegation, not owned endpoint implementation, main promotion, independent270, whole UC-003 or sprint closure. Checked tests JOB-20261007-2243-5dfd ended before delegation code. Independent deciding JOB-20261007-2303-a269 was started before review, with actual current-head extension recorded before decision.

Read original AGENTS/SPEC, Team2 process/participants,09handoff, UC-003/affected UC-001/047 paths and accepted settings/store/site-frame/endpoint-calls interfaces and existing dashboard callers. Sol implemented none of this PR. All four writing commits name version unreleased, Terra-d and gpt-5.6-terra. The final ordinary inheritance merge contains approved sprint source identical to its second parent; no new module implementation is attributed to Terra-d.

## Scope and data path

Complete final four-file diff: dashboard-app.mjs, dashboard/built.json, new dashboard/settings/endpoints.mjs and new component test. SPEC WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS permits old code delegating to accepted modules and descriptions of what those modules provide. The preceding selected write-tests job does not become a fictitious implementation/refactoring kind. Its first tests-only c9d34f9 and metadata correction9487d83 have actual red runs37698383398/37698539546. No helper modification remains; app-harness.mjs is byte-identical to base. No src, existing-test, SPEC or architecture change.

Existing settings-view routes.settings → findSections → viewSettings → dedicated endpoints section → renderSections → registered renderSection(app,box) → public settings-pages settings Route, with canonical openStore(instance), null product, instance repository and go. Configure delegates to #endpoints, Change delegates only nonsecret encoded name to #endpoints/name. Dashboard dispatch decodes that name and calls the public endpoints Route; it introduces no endpoint schema, test request, Bridge call or fallback. Secret/configuration stays in the module/store. The small mount capability check supports the existing HTML-only harness; actual browser Element provides replaceChildren. New component test supplies only its own mount adapter without changing an unowned helper.

Legacy Settings browser/product/token/notifications/export/import sections and all existing callers are unchanged. Endpoint dispatch uses an else branch, preserving the shared token expiry/refusal banner, flash and scroll postamble. No early return bypass is introduced. Existing add-product route remains unchanged. Approved direct module behavior and throughBridge setup-only limitation remain; no successful alternative2a is claimed.

## Actual exact-head evidence

Live CI37700122700 on exact3eb57ee: Node and Python completed SUCCESS. Refreshed refs show current290/291 only in the new component artifact; each names accepted modules, component level, guards, readable precondition/input/expected result. Full history retains the superseded helper change and its removal rather than rewriting it; only permitted final changes are delivered.

Independent exact-head archive /private/tmp/po-sol-211-q5j9f8bd: known-positive2/2 pass.290 reaches actual canonical stored campus/model via the public Route in the dedicated container and verifies legacy browser/notification areas and creation/named-change links.291 opens both public creation and named editing and sees the stored model. Individually remove the public settings Route call in renderSection → only290 fails tests:51 with actual empty text versus Endpoint: campus; restore, suppress dashboard endpoints dispatch → only291 fails tests:72 with actual Use cases versus Configure a model endpoint; restore →2/2 pass. PR body separately records the same actual faults/restoration. Logs positive.log,290-fault.log,291-fault.log,restored.log verify the failure nodes.

## Disposition

Root Scrum Master may merge only the approved current head into sprint/09. Independent270 becomes eligible after merge. All other selected work and full UC-003 alternative2a remain unfinished. This gate approves neither main endpoint delivery nor acceptance of withdrawn architecture proposals.
