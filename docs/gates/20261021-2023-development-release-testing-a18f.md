---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 1eab60d40ce30f2d9d372956bb5e42aa8a471d63
  - https://github.com/akmaier/agent-m/pull/1287
date: 2026-10-21 20:23 UTC
---
## Reason

ITM-1165 is rejected on this exact head under JOB-20261021-2004-a18f for one condition: its published
Acceptance's navigation to the live review page does not preserve the chosen or explicitly supplied product
at the receiving page. This is a code-reading finding, not a new PO execution or a claim of failed head CI.

Concrete path at the checked head: src/site-frame/index.mjs:350-354 go -> the existing private
routing.mjs:40 addressWriter -> docs/index.html#use-case/id=UC-001/product=https%3A%2F%2Fgithub.com%2Facme%2Fproduct.
That is the literal URL TST-1165001 successfully checks. But the live entry loads dashboard-app.mjs:
start:915 calls deriveTarget(location); deriveTarget:211-220 destructures only hostname/pathname/search,
reads product/repo only from the query, and with this URL's empty query chooses the fork instance.
start:916 then sets T.product to that instance. reviewContext:660-666 consequently hands the route
product:null and the instance Host. MOD-review-pages common.mjs:124 readPlace uses that context's Host,
not params.product. Passing the fragment through reviewTargets therefore does not select the product.
Actual by this transformation: a product-specific main-page link reads the instance's artifacts; expected
by ITM-1165 Acceptance: the requested route on the chosen/explicit product. Existing test_instance_target.py's
test_product_is_chosen_by_query_the_instance_stays is the working query-targeting positive; an empty query
is the existing instance-targeting positive. The new URL-only assertion does not exercise the receiver.

The single permitted rework is end-to-end product preservation across this existing Frame-owned navigation
boundary, including chosen, explicit-other and empty-instance inputs, without changing public interfaces,
copying a serializer, loading review views on main, weakening old expectations or patching helpers. Preserve
the working legacy query addresses, route identifiers/parameters, add alias/get-your-own step, loaded-route
hash behavior, Bridge and notification semantics. No formal or unrelated module change is required or allowed.
This decision does not authorize a Source change or a merge; SM records the bounded return and assignments.

All other assessed evidence is retained, not rejected for missing clocks or publication retries:
- Native Host.pullRequestFacts at2026-10-21T20:21:02.024Z: exact1eab headCI success, all23 checks success.
  Automatic39667418398 attempt2 is green; the earlier Electron acquisition ETIMEDOUT and earlier failed
  Source heads remain history, not erased or reclassified as assertion results.
- First7aeed916b81523af3ba1ea5955893b67b6f8ee1b changes tests only and is natively CI failure;
  final tests-only85cd60295c03067c6118b875a738d350c7ed7557 likewise. Actual39666028629 jobs119451185205/
  119451184812 fail001/002 on missing href and003/004 on the legacy fallback, with old alias/hash positives.
- Only four files changed: Frame-owned index.mjs navigation; Frame-owned dashboard-app.mjs dispatch;
  site-frame-go-instance.test.mjs adds001/002 and only prepares the existing resources route as loaded,
  retaining its old hashes; site-frame-legacy-navigation.test.mjs adds003/004. No helper/formal/other Source edit.
  New cases have single valid module/level and literal inputs/expectations. Dynamic notification products
  are restored by1eab's call-time wrapper. Alias, step and fallback behavior have actual component positives.
- Read all eight current-head fault/restoration JUnit captures and captured metadata. Four effective owned
  code faults fail the intended assertions at98/116/24/40; each exact restored Source passes. The001 fault
  wrapper failed after Node, so its start/end/exit are unavailable; its JUnit assertion failure is real.
- Read all eight remote2019 on-demand receipts at test-results3953a2cbf890dfcbdf854e4e9a34ddfc521c9bd6,
  schema findings[]: fault/restoration pairs387f/2dd0,5171/7cdd,db13/2d92,9b04/28c9. Faults are uncommitted;
  restored records are canonical passes.387f explicitly dates publication, not a guessed run start.
  Earlier remote001 fault records2016-9488 and2017-16bc also exist and were read; their dates are not
  evidence of missing execution boundaries. Earlier claims that both Moved writers wrote nothing are not
  adopted. Partial publication/staging history needs truthful append-only clarification, not new proof runs.

Exact canonical blobs: index293797ce62e64d81d5172cb821aef72275021b91;
dashboardd9f45b3e512e2aeeb93c7e8317f8830e0c5f08fd; unit4ee751811ca281951b30b107431002a6c7d10ac9;
component62ae93d2185946bc955300f8526879c3815580fa. Native/remote evidence packet:
/private/tmp/agent-m-po108-a18f-1165-evidence-1792614063497.json. Accepted Frame, current1165 REGISTER,
Selection, full Start/Source assignments, relevant SPEC/DoD/original readings and actual PR history were read.
Independent po-sol wrote none of this Source, tests or proof executions; no test/probe/fault was run here.
This gate accepts no formal text and claims no whole-UC or independent release coverage.1175 has no decision
in this record and remains a separate exact-head assessment under the same gate job.
