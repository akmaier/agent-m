---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - c11e85f1cc644a1babc15322ae7f96485fb37c3a
  - https://github.com/akmaier/agent-m/pull/509
date: 2026-10-15 19:38:20 UTC
---
# Development → Release testing: accepted Host prerequisites

**REGISTER**

## Reason

PASS for exact head c11e85f1cc644a1babc15322ae7f96485fb37c3a into sprint/team2/62 at
a2409e056de29b16160733b19b4f5712f330d9e0 ONLY. Publish unchanged before SM merges this exact head.
Changed head/target needs renewed assessment. po-sol authored none of the source, tests or developer proofs.
I read the complete final body, four commits, all twenty changed files, accepted Host contract and ITM-476/job6678.
All changed paths are scoped as follows:
- src/repository-hosts/index.mjs: the two public methods, validation, existing secret refusal and clone delegation.
- src/repository-hosts/github.mjs: openPullRequest through existing request/error/result helpers.
- src/repository-hosts/gitlab.mjs: those accepted methods through existing helpers; description-based schedule upsert.
- tests/repository-hosts-pipeline-schedule.test.mjs: seven declared MOD-repository-hosts unit cases.
- tests/repository-hosts-open-pull-request.test.mjs: six declared MOD-repository-hosts unit cases.
- tests/fixtures/repository-hosts/pipeline-schedule.json and open-pull-request.json: readable inputs for those tests.
- docs/tests/counter-proofs/TST-476400.md, TST-476401.md, TST-476402.md, TST-476403.md,
  TST-476404.md, TST-476405.md, TST-476406.md, TST-476410.md, TST-476411.md, TST-476412.md,
  TST-476413.md, TST-476414.md and TST-476415.md: their canonical fault/restoration evidence.

History remains d0be1d54 tests/fixtures, d7e1f1d5 secret regression, abb26b89 production, c11e85f1 proofs. CI38792221916 on exact d0be1d547ca89d7e2868118ae01cb4e814741c38 is actual intended red:
controls400/410 pass, six missing-method and four stub assertions fail, eight other jobs pass.
The recorded415 baseline reaches NotSupported versus SecretRefused before its guard. abb26b89 strengthens
new case402 with KEEP-variable fixture/assertion; no old expected result changes.

Final paths: index.mjs:338/355 -> gitlab.mjs:244 -> everyPage description match -> schedule POST/PUT and
supplied variable POST/PUT -> string id/URL. Tests verify later-page reuse731 twice, unrelated schedules/KEEP,
false active/timezone/ref, GitHub NotSupported, clone routes and mapped failures. PR/MR:
index.mjs:322/332 -> github.mjs:274 or gitlab.mjs:265 -> existing call/send/refusal -> POST -> existing pullOf.
index.mjs:328/348 -> refuseSecrets on raw request/schedule texts and variable keys/values before requests;
fixed error paths contain no credential, independently of JSON escaping. Case415 checks both servers/clones.
All thirteen cases declare level/module/guards/precondition/input/expectation. All thirteen proof records pass
the owner's schema and byte-identical canonical writer. In memory each production-only hunk reproduces its fault
SHA-256; source/test/fixture pins match abb26b89 AND c11e85f1; complete fault/restored TAP hashes match.
Executor: developer-sol-b/gpt-6.1-sol, Node25.9.0 darwin/arm64; same-case0/1/0, null launcher/signal, exact
restoration/restored pass. Twelve native faults are ERR_ASSERTION;406 is NotSupported testCodeFailure in the
positive clone body, not an assertion/launcher error. I inspected evidence/hashes, not reran faults.
CI38794158679 identifies this exact head: all ten jobs SUCCESS,16-57 seconds; native TAP passes all thirteen.
Source/test diff --check passes; proof TAP whitespace is preserved. The developer's176-test count is not my run.
The live ref and #511 receipt confirm targeta2409e0; PR metadata still reports basea31. Comparison against the
actual target confirms merge basea31, the same twenty paths/four commits, and a docs/register-only target advance.
This CI predates that advance: complete merged-CI-tree identity at a2409e0 is NOT claimed. PR is MERGEABLE/CLEAN.
No blocking finding under SPEC §§11-13 and unchanged job-rule DoD; publish this gate before merge.
No other API/source/helper/workflow/SPEC/UC/architecture change or new job authorized. webLinks().pipelineSchedules
remains separate. NOT complete ITM-476/independent release acceptance. #510 needs human exact-blob approval;
none is supplied here. Sprint62/476 stay open; MAIN CLOSED.

API mappings checked: [GitLab schedules](https://docs.gitlab.com/api/pipeline_schedules/), [MR](https://docs.gitlab.com/api/merge_requests/#create-a-merge-request),
[drafts](https://docs.gitlab.com/user/project/merge_requests/drafts/), [GitHub PR](https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request).
CI: https://github.com/akmaier/agent-m/actions/runs/38794158679
PO comment: https://github.com/akmaier/agent-m/pull/509#issuecomment-6200720802
