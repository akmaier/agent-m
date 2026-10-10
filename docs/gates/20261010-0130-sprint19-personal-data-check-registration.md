# Sprint19 personal-data check registration gate

**MEASUREMENT**

PASS only PR282 exact head92826b89f259679b1d41a3212f9c183051c85f00 into sprint/19
base9b44d15c3e819128f0a86ed892796bc85a6f9645. Decider: po-sol / gpt-6.1-sol,
under JOB-20261010-0121-p19check; decision 2026-10-10 01:30:14 UTC.
Published main0ecef7c; actual Taken01:27:44 UTC before fresh agent-po-sol-check-19 / codex/p19-check.
Agent M: unreleased. Usage/cost: null/null. Root alone publishes this byte-identical PR review and performs the exact merge.

## Scope, authority and independence

SPEC §11 WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS explicitly permits a separate PR that “lets a check of the whole
repository allow a module what the module's file states that it uses”. Accepted MOD-personal-data Files says:
“It reads the schemas in its folder.” Approval4daf5fb0befa identifies its unchanged exact blob.
PR282 changes ONLY tests/test_no_backend.py: adds one personal-data folder registration with the SAME count1,
OWN_DATA_FILES and _own_data_file predicate, and names the module in the descriptive list. Every assertion,
permitted host, predicate and other channel restriction is byte-unchanged. This is the requested between-jobs
registration, with no source behavior/new case/test-first obligation and no arbitrary transport permission.
C's original Start/Taken and two-line full diff were read. The exact commit trailers name developer-terra-c/gpt-5.6-terra.
Full guarded git history includes predecessor authors, with known-positive C/D and earlier scrum-master-session authors;
po-sol/PO predecessor did not implement this registration, checker or personal-data source. A historical commit says
“Product Owner's review”, but its authoring participant is scrum-master-session; reviewing is not source authorship.
The deciding PO authors no guarded source/tests or sprint close.

## Concrete diagnosis and failure-node verification

Actual df8a97e6bbff8f00ee4de91afe5ce1510dc3a386 src/personal-data/index.mjs:9–10 → two ./schema URLs resolved against
import.meta.url → :13 ownFile(url) → :14 fetch(url) → :20–21 MOD-documents.loadSchema. Existing checker
_entry → channel_findings: the unregistered folder is an unknown fetch channel despite satisfying the existing own-file
pattern. Expected: the accepted module may read its own schemas within the already guarded one-fetch-site count.
Actual Ubuntu source CI38011975473's Python three failures are this node and the two existing release wrappers of it;
Node1091/1083pass/0fail/8 inheritedTODO. This failed source run remains retained and is not a source PASS.

Fresh bounded in-memory probe on the EXACT PR282 checker bytes and EXACT df8 source confirms first the existing
product-process known positive and personal-data positive, each zero findings. Foreign settings-schema replacement gives
BOTH the :14 own-file evidence finding and :9 foreign URL channel finding. A second fetch file gives its own evidence
finding AND folder count2>1 finding. No assertion or counter-proof is changed. Raw actual argv/cwd/time/status/stdout/stderr
is /private/tmp/po-sol-p19check-probe-receipt.json; source /private/tmp/po-sol-p19check-probe.py.
C's original selected two named units and successful positive/foreign/extra probes were personally read and hash-verified.
Both failed diagnostic attempts remain honest: first01:18:27 omitted the second foreign URL finding and has no retained
raw file (session transcript only); second01:20:07 shell replacement quoting failed, leaving foreign=[] and raising
IndexError, with retained raw log. Neither is claimed a production failure or passing negative verification.

## Own exact full Ubuntu CI

Independently fetched live PR metadata shows OPEN, exact head92826b89, base sprint/19 at9b44d15 and one assigned commit.
Independent live CI38012844055 metadata/archive confirms SUCCESS, pull_request event, exact head and Ubuntu runner.
Both real checkout logs name38f7643ed5dfc7588361619a06614b2c46f0c168; independently fetched commit API identifies
parents9b44d15c3e819128f0a86ed892796bc85a6f9645 and92826b89f259679b1d41a3212f9c183051c85f00,
treeeda8f782ad116fd64f050b3b56c39965d1614641, identical to the exact registration head tree.
Python job61s:396 tests,5skip,6 expectedFailures; Node job67s:1089 tests,1081pass,0fail,0skip,8 inheritedTODO.
Every actual job≤120s. Full raw root log7537 lines and failed source log7621 lines were consumed, named outcomes retained,
and independent full CI archive agrees. All eight Node not-ok outcomes are inheritedTODOs, not new failures.
No same-head red/green flip is hidden; failed df8 source run is a DIFFERENT head. This check-registration CI DOES NOT
contain df8 source or its two tests, explaining1089 versus1091; it approves only the registration. Source and later
merged/tested-combination gates remain separate and require their actual full CI.

## Immutable evidence and limits

Exact checker blob0023a4a0c6045dddb209fa140b2285e11d4e1d31,
SHA2565103acf18b7d2aca0f445e110a84c09d3f457d55f0eea664722440133693880b.
Exact df8 source blobd03e97d2999c6dcab1e3dcc2a33e472ae5571bf5,
SHA256b00d051ac855126b486c9d0d7d3d064a6a40c492f09ec09e7321a81e47e49f17.
All7 other raw developer pins match. The developer inventory's source-CI metadata hash is a malformed63-hex transcription
(aa27ca11bb21fa0ee4de…); actual independently hashed unchanged metadata is
 aa27ca11bb21fa0eead4e285c12e7869fa8983f223f6968818b6a6249412e217.
The original manifest remains untouched, with explicit expected/actual mismatch in our raw analysis; no silent rewrite.
Full immutable inventory /private/tmp/po-sol-p19check-inventory.json contains original read pins, full developer manifest,
raw artifacts/current corrected hash, own live metadata, both complete raw logs, all named outcomes, independent archive
member hashes, exact diff, own probe, guarded authorship and output hashes. Earlier raw-provenance limits remain visible.

A separate selected290 readiness measurement justifies allowing the independent browser-store producer after D's prior
active source writing turn ends, in a NEW published job/isolation. All source/release/consumer gates stay required;
selection290/291/292/257 and WIP4 are unchanged. That current-plan correction is not part of PR282's tested tree.
No local full/native/UI/device work or source/test/accepted-contract/process/model/participant/DoD edit was performed.
This PASS does not complete290 or whole UC003/002/047, close Sprint19, release/tag/deploy or accept human artifacts.
