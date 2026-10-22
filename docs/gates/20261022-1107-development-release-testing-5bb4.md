---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - bed85d08c31eaccf8b4188f684e2d13e494ee964
  - https://github.com/akmaier/agent-m/pull/1294
date: 2026-10-22 11:07 UTC
---
# Development → Release testing

**REGISTER**

## Reason

ITM-917 passes on exact bed85d08c31eaccf8b4188f684e2d13e494ee964 under JOB-20261022-1023-6226. Independent po-sol authored no Source, tests or proof executions. Original rules/contracts, current REGISTER/Selection, all three commits, complete PR diff/body, captures and immutable records were reviewed. This is only Development -> Release testing, not default delivery, sprint closure or whole-use-case coverage.

Native Host.pullRequestFacts at 2026-10-22T11:05:58.577Z reports that exact head, head CI success, all23 checks success and no remaining non-green check. Packet: /private/tmp/agent-m-po109-6226-final-20261022110558577.json. Changed files are only src/markdown-render/render.mjs (header-derived body-cell labels), src/site-frame/look.css (owned phone table/code wrapping), tests/markdown-render.test.mjs (new unit917001 and exactly authorized old472393 literals/prose), and tests/site-usability.test.mjs (new system917002 and only two resolved Markdown width TODO reasons). Canonical blobs respectively are 6dde34c37bad903ad795f07c127b53dea9551fe6, 2beac35949b7b79f802b7f3dd38973568919e860, 1a3230e157b096bf5970eb3567e251936dee6847 and 2d4df47e37cd319e05fddcccdf4ba5b07ddaa20a. Accepted Renderer d562254e7f9b4081e7d6c94324affef804a376cc and Frame d38b1f2e6ef8946e0a995d2d28ae2d2b770d4bfa are unchanged.

First465cedf8d93e860091bcb068c842ca0cd080eb80 changes tests only. CI39759714476 actually fails917001 with null labels instead of Request/Path read/Batch and917002 with phone table528/code449/page544 findings against literal[]. Actual path: renderArtifact -> sanitized Markdown table -> first-row heading text -> tbody cells' data-label -> shared phone styling; live #uc/UC-001 and #review/uc -> rendered table/inline/fenced code -> browser geometry -> unfiltered widths[]. Source fixes those actual nodes, retaining content and column meaning. Desktop controls at1280 and phone390, old geometry arrays, security/sanitization/Mermaid behaviour, helpers/fixtures and frozen922 are retained. Only TST472393's two literal td attributes and matching prose change under published1fe1496e/016b0464; the full table/headings/row/cell text and other patterns remain. No proof replay is required for this old-case maintenance.

Read all ten original JUnit captures and all ten actual remote native records, including four intermediate failed CSS iterations and the unit wrapper's reserved-status-variable boundary. TST917001 baseline passes, shifted-label owned-code fault fails at the exact column mapping, and restored baseline passes. TST917002 baseline5 passes, disabling owned inline-code wrapping fails with code449/page465 against[], and restoration passes. Records truthfully name tests-only465 with uncommitted:true and occasion:on-demand. The reviewed Source and both new case bodies remain unchanged between e5a07546663d718d69a23532b67fb12743761ae7 and final bed85; that final delta is only the authorized old table literal/prose. No new execution or measurement was made by PO. Detailed receipt texts/blobs and capture comparisons: /private/tmp/agent-m-po109-6226-preparation-20261022102540296.json, read at test-results c71ed709545bd21cddd93c129e1a929860e894cc, all schema findings[].

Canonical remote test-results04094f13bf7064fc9ff3eafbd4f59395f1b88f3e contains runs/bed85d08c31eaccf8b4188f684e2d13e494ee964/20261022-1022-pull-request-917c.md, blob a34abcb20233d5425c047b948f5c5edd78c88e72, schema findings[]. It records actual CI39762650551 old472393/unit and new917001/unit,917002/system passed. Anchored raw CI output agrees. This is not independent release evidence for the new physical phone outcome; the separately assigned independent Release-testing phase remains after both actual Source integrations.

CI39760985820's real old table clash remains historical. Final-run attempts1/2 each20green/3failed and their ten actual non-TODO Openbox setup failures remain; attempt3's22green/1failed TST919001 is electronCommand at dashboard-backlog-layout.test.mjs:61, called245, Linux Openbox installation null!=0 before layout measurement, not an executed chart failure. Separately authorized failed-jobs-only attempt4 now satisfies native all23green at unchanged bed85. No Source/helper/assertion/timeout change or retry of an intended product assertion is claimed. The PR body's older20/3/no-retry statement is superseded by those dated SM authorizations and this fresh native observation, not erased. Cost remains unknown. SM publishes unchanged and freshly guards exact-head integration; PO performs no push, merge, Source/test/REGISTER/formal or SM-closure work.
