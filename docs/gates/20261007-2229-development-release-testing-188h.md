---
gate: Development → Release testing
job: JOB-20261007-2217-c2ae
decider: po-sol
role: Product Owner
decision: rejected
on:
  - df3aab63258daa08ee9cbfe829c7645e020d58a3
  - https://github.com/akmaier/agent-m/pull/188
date: 2026-10-07 22:29 UTC
---
# Development → Release testing: ITM-265 retry

**REGISTER**

## Reason

Rejected: do not merge this exact head into sprint/09. The selected endpoint increment's production corrections close the reviewed UI omissions, but the new refused-state test can pass with the wrong displayed state, and generated writing commits lack the binding provenance. Green CI does not remove these Definition-of-Done barriers.

Checked JOB-20261007-2217-c2ae is a distinct author-authorized retry of ended JOB-20261007-2128-5ced, limit three, correction one. Decision JOB-20261007-2226-3bea was recorded before this delegated review. Earlier exhausted heads and their decisions stay unchanged. Neither retry record nor this gate claims that missing older start records existed.

## Original acceptance and exact-head evidence

Read originals AGENTS, SPEC, Team 2 process/participants, ITM-265, UC-003, accepted MOD-settings-pages, MOD-browser-store, MOD-site-frame and MOD-endpoint-calls; read the complete PR history/body and all four changed files through the public View/Route contract. Scope remains src/settings-pages/endpoints.mjs, index.mjs, settings.mjs and its new owned test file. Compared with rejected 2e07abc, retry changes only settings.mjs and appends four tests; the previous twelve cases and add-product expected results remain unchanged. No SPEC/use-case/architecture, browser-store, frame, allowlist, helper or dashboard-wiring change is included.

Final run 37695999339 on exact df3aab63258daa08ee9cbfe829c7645e020d58a3: Node 113047750463 and Python 113047750966 completed SUCCESS, verified live. Actual original tests-only red 8ad62f6/run37678059080 remains evidence for the original implementation. Actual retry first tests-only commit 5c1a437c7e9b31f8a6c7e09c1ef88760149c5c68 has red run37695473735: TST-265013 fails at browser explanation count 0 rather than1. The later tests-only7253841/run37695626228 is also actually red. No red history is invented.

Independent exact-head archive /private/tmp/po-sol-188-retry-ftmkwj8i: all16 endpoint tests and all14 add-product tests pass, thirty total, no failure/skip/TODO. The four new IDs occur only in tests/settings-pages-endpoints.test.mjs across the fetched remote refs. Each case states module/level/guard/precondition/input/expected result.

## Complete selected behaviour checklist

- Public endpoints Route: name/URL/kind/model/optional key; disclosure and shared-origin notice before storage/action; existing seven registered folded explanations; first field focus; hidden key with Show/Hide. Save writes canonical endpoint configuration before one short direct test; storage url maps to baseUrl, absent key to null. Driver success and provider/browser diagnosis remain public results; browser refusal names CI/Bridge and wrong key remains stored. Reload recovers fields; Clear removes actual endpoint setting and empties form. No cookie, navigation credential or repository write is introduced.
- Public Settings Route: canonical listSettings enumeration, selected readSetting, own-instance isolation, hidden/Show key, mapped direct Test, Change with nonsecret name, Clear only selected endpoint plus paired last-test metadata and redraw, other endpoint/data retained.
- Settings corrections: settings.mjs:96 listSettings → endpointLine:40/readSetting:42; destination URL and sent-data text:85 precedes Test:86; line explanation:87 and browser explanation/shared-origin notice:103–105 are public folded controls. Test:61–71 maps config, calls testEndpoint, persists canonical last-test:<key> with ISO date/outcome, then updates status; reload reads SettingInfo.lastTest through stateText. Clear:74–77 removes both selected records. Production refused/not-set/working rendering is present at this head.
- Both routes preserve stored throughBridge and show missing setup before any direct request; they do not call a rejected new Bridge probe, silently fall back or claim local success. This remains the selected direct increment, not full UC-003 alternative2a/Safari delivery. Dashboard endpoint wiring and independent ITM-270 remain separate, unfinished prerequisites to integrated delivery.

No additional production behaviour defect was demonstrated in this selected scope. The following test/provenance findings still prevent acceptance.

## Actual test finding and proofs

New body records browser explanation fault (013), destination disclosure fault (014), successful metadata-write fault (015), paired metadata-clear fault (015 again); it has no recorded failing planted fault for new016. Independently reran those four faults in temporary exact-head source and restored each: 013 fails at 0!=1; 014 fails at absent disclosure.textContent; 015-write at null.outcome; 015-clear at remaining metadata object instead of null. Restored thirty focused cases pass. Their logs are 013-fault.log,014-fault.log,015-write-fault.log,015-clear-fault.log and restored.log in the evidence directory.

TST-265016 has a concrete false-positive path: tests/settings-pages-endpoints.test.mjs:375 creates endpoint:refused → public Settings endpointLine h3 uses label Endpoint: refused → line text includes that word independent of state → line:382 assert.match(refused.textContent,/refused/i). The status it intends to guard is instead settings.mjs:30–34 stateText(info.lastTest) → .settings-endpoint-status.

Known positive: same public render with canonical last-test metadata outcome refused gives actual status node Refused. Planted fault: replace stateText's return Refused. with Works. Actual status node becomes Works., but the submitted TST-265016 still PASSES because its endpoint label contains refused. Expected: that test fails at the erroneous status. Restore: actual status returns Refused. and all thirty focused cases pass. Logs: 016-fault.log and 016-node-positive/fault/restored.log. Fix the test to assert the actual status node; record its real failing planted fault and restoration. Do not weaken production or change a requirement.

## Commit provenance

SPEC AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT requires the commit writing a generated artifact to name the Agent M version, participant and model. Retry writing commits5c1a437,7253841,df3aab6 have empty message bodies and headlines that name none of those. The Git author account and later JOB/PR prose establish attribution for review, but do not meet that commit requirement. Original generated production/test writing commits91e577f,21af4cc,e8e7057,854171d,9669b36,2e07abc also lack it; the older tests commits do carry developer/version provenance. This gate does not silently reinterpret or rewrite old decisions.

## Independence and disposition

PO Sol implemented neither the owned behaviour nor its submitted tests. Terra-c retains Terra-a's original tests authorship; retry inputs and predecessor record are explicit. Temporary reviewer planted faults were restored outside the repository.

Preserve this rejected head, old PR/branch, first-red/final-green and all old gates. Under the author's continuation authorization, a fresh retry record may name this checked job as retries, fix new limits before its first round, retain the accepted scope and findings, and start a new branch/PR from approved sprint/09. Deliver the complete corrected16-test package first in a properly attributed commit with actual red CI against the not-yet-implemented routes, then the same corrected owned code in properly attributed writing commits. Keep lineage to this PR and the original authors; no force/amend or claim that a new message changes the old commit. A fresh full exact-head gate is still required. No SPEC, architecture, process change or fourth round of the ended original job is authorized by this rejection. Sprint09 remains open; this item is unfinished.
