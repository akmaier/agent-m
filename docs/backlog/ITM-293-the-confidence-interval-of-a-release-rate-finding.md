---
id: ITM-293
title: The confidence interval of a release rate finding
level: module
realises:
  - UC-013
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
modules:
  - MOD-release-evidence
builds_on:
  - ITM-251
  - ITM-254
tests:
  - unit
  - release
origin:
  - UC-013
---
# ITM-293 The confidence interval of a release rate finding

**REGISTER**

## Outcome

When a model-dependent rate falls below the running version's, the existing public releaseReport text shows the finding
with its confidence interval under accepted UC013 alternative3b. Use the delivered MOD-result-records rates and the
existing candidate report text/schema. Keep releaseReport's public return, rateComparison's public interface and all
accepted schemas unchanged. The finding names the test, current and running-version rates, the interval, its method
and confidence level so the author can understand the sample uncertainty. It remains a finding for the person to decide;
the existing acceptance route retains that person's decision and reason.

Only MOD-release-evidence source and its module-named tests are authored in the source job. No result-records,
test-pages/dashboard caller, process/model/participant/workflow or accepted SPEC/use-case/module edit is needed.
ITM-257 remains separate dashboard test-only work. Its original expectations and any retained returned-branch evidence
remain unchanged; this item does not replay that branch or claim its dashboard outcome delivered.

## Acceptance

- A controlled current6of10/running8of10 rate produces the named worse-rate finding and a numerically verified
  confidence interval with its stated method/level in the actual public report text; merely including the words is insufficient.
- Positive unchanged/improved/no-baseline cases and existing failure/limitation/complete/rate/refusal behavior remain
  consistent with the accepted contracts. The report makes no automatic acceptance decision.
- Independent release verification through the owned public releaseReport and acceptAndRelease APIs shows that same
  finding and preserves the person's required reason, refusal and recorded decision on a controlled repository-host
  fixture. No real release is made. The dashboard Release-route composition remains separate ITM-257 scope; its original
  assertions and all existing expectations remain unchanged.
- The source job's first commit contains only tests and its actual product-red CI is read before implementation.
  Each final new case has canonical unique numeric declarations/real traces and a relevant guarded-code fault,
  SAME-case failure, exact restoration and SAME-case pass with complete raw commands/times/streams/hashes.
- Exact changed-head complete Ubuntu CI, independent source/release gates and every declared job bound hold.
