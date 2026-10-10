# ITM-293 exact source gate — HOLD

**MEASUREMENT** — 2026-10-10 04:29:26 UTC; po-sol / gpt-6.1-sol; JOB-20261010-0413-p193.

Decision: **HOLD; Development correction required** for PR290 head
`72d3a419ca279de2fce23e0dfe4039202bb35369` against approved
`fc3901472a14cb2774c06ade13e8392e19fb1b49`. This decision authorizes no merge.
The blocker is the demonstrated loss of guarded requirements from worse-rate entries in the accepted Limitations format.

## Applicable originals and independence

Personally read the new published Start at `823a6499e0b85da48deb877b22ed081f3c3be2c7` before actual clock Taken
2026-10-10 04:19:00 UTC and fresh `agent-po-sol-confidence293-source-19` / `codex/p19-confidence293-source` isolation.
AGENTS §1/§6a require original reading, the working caller first, a known positive before a negative, and a supported failure path.
Original SPEC §12, “A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT”, requires “a recorded counter-proof: a fault deliberately
introduced into the code it guards, and the test's failing result on it.” SPEC §13, “A GATE IS NOT DECIDED BY THE PARTICIPANT
WHOSE WORK IT CHECKS”, requires an independent decider. Team2 declaration §Sprint/§Definition of Done and scrum-wip §Gates
assign this source gate to the Product Owner and retain the default job rules. C authored the owned source/test commits;
po-sol authored none of the guarded implementation. Full guarded predecessor records and original binding/process reads
are retained only after exact unchanged commit/blob/SHA256 verification; the fresh source record was personally read.

## Verified failure and bounded correction

Accepted `docs/architecture/MOD-release-evidence.md`, §Data, line78, states: “first: every failing test and every rate worse
than the last release's, each with the requirements it guards; empty when the run is green”. Its current blob is
`dbd34f3c7bf089692abf8e0b0cb4f4dba18a2047`, matching its original module approval record.
The actual path is dashboard `release-view.mjs:11` → public test-pages release route → `release.mjs:122–124`
reads candidate/results snapshots → public `releaseReport` → `report.mjs:234,244` selects worse IDs and formats Limitations
→ `limitationsText:145–146` selects the new `rateFindingText:128–140` string instead of the guard-bearing fallback
→ public caller renders that report text unchanged. `rateComparison` correctly marks current6of10 below running8of10.

The necessary nonnative public-call probe copied the existing module test's in-memory Snapshot/run/report fixtures.
At 04:20:48.527–04:20:48.555 UTC, exit0, the approved baseline produced `- TST-010: A SAMPLE REQUIREMENT` in Limitations;
the same valid input on72d3 produced the named finding/rates/Wilson interval but omitted `A SAMPLE REQUIREMENT` there.
Both reports were complete, failing[], worse[TST-010]. Guards elsewhere in Tests/Requirements do not supply each
Limitations entry's accepted content. Full reports, known-positive detector results, argv/cwd and timestamps are retained.
The initial probe script had a syntax error and yielded no finding; its invalid bytes are retained separately.

Required correction: preserve each worse-rate entry's guarded requirements alongside the new named finding, rates and
interval in the existing owned formatter. Preserve the accepted public schema/return, caller, rateComparison and
acceptance/refusal/reason paths. This requires no SPEC/use-case/module/API/architecture change. A changed head needs its
own exact review; this decision imposes no new per-assertion fault, isolation or redundant-proof quota.

## Supporting evidence and limits

Full owned diff is exactly two files: report19 additions/3 deletions and module test31 additions. Fresh tests-onlyddea
retains the approved source blob; its own product-red38021700431 fails the new SAME case at the expected missing finding.
Actual checkoutbd6b2d0 has approved06d932f andddea parents. Published04e9 preceded actual C Taken03:42:49;
published43748 is the later first-red/source-continuation record. Plain merge b324 integrates approvedfc; source72d3
follows the red. Generated test/source commits carry all three required provenance fields; failed old0304 stays unchanged.
The full570 current test-path blobs match the actual tree and working public report predicate. Retained public declaration/
trace graph has175 declarations, unread[], all duplicateIds[], unique unit MOD-release-evidence TST-293003 and a known
positive TST-287001. Older293001/002 bytes remain unchanged; no new metadata finding is inferred against inherited cases.
Original NIST Wilson formula and an independent Python NormalDist calculation give lower0.3126737697336583 and
upper0.8318196702937637, rendering31.3%–83.2%, two-sided95%. The numerical finding is supported.
The retained relevant production fault makes TST-293003 fail; exact source restoration makes that SAME case pass.
Its receipt truthfully captures faultStart04:02:18 and restorationEnd04:02:29 only, with combined reconstructed tool output;
distinct endpoints/split streams are absent and not inferred. Restored source/test SHA256 equal current72d3 bytes.

Own complete Ubuntu38022903825 is SUCCESS: Python41s,396 tests/5 skipped/6 expected failures; Node80s,1108 tests/
1100 pass/0 fail/8 inherited TODO. Actual checkout39e5711b8e80fe01633b1e095dab867734fb2e2f API parents arefc390147+72d3;
tree01296e2216a34a84a5999594ddac64ac655d9b67 equals the head. Required existing release/report/refusal/rate and inherited
native276/276901/291 positives remain green. Final live PR pair remains exact and the head's sole run is successful;
each complete job is within120s. Raw log SHA256:e24ec854b0c881fc67966317b800695bd88534d7943b1f5447aa883a8868eed1.

Immutable complete inputs: `/private/tmp/po-p19-confidence293-source/input-inventory.json`,
SHA256:fd159a6c99f71d64aaac8e67a9cfcb7e9e3f666618fe08035654f59b84dc2ab8. It records311 retained original pins, fresh
published originals, current owned/caller/15 same-guard pins,81 guarded history records,570 test blobs and100 artifacts.
Full diff, byte-identical private gate body and separate delivery inventory accompany this document-only handoff.
No local full/native/browser/system execution, source/test edits, publication or merge occurred. Usage/cost:null.
ITM293/257 and whole UC013 are not done; independent public release completion remains a subsequent assigned job.
