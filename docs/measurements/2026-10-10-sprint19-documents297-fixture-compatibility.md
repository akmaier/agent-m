# ITM297 Documents compatibility assignment

**MEASUREMENT**

at: 2026-10-10 16:14:42 UTC
by: po-sol / gpt-6.1-sol
job: JOB-20261010-1604-f6e8
usage: null
cost: null

## Decision and next assignment

The minimal correction can continue under B's same open JOB-20261010-1534-f01e, owned MOD-documents, after root publishes
an explicit clarification superseding its NEW-tests-only restriction for exactly the two existing test files below.
This measurement supplies that bounded assignment decision for publication; B does not write before it is published.
The matching ITM297 REGISTER restriction to new tests is clarified to this same limited fixture compatibility scope.
Binding module ownership, source validation and all established expectations stay in force. No separate job or fifth
selected item is required by the literal rules. Current selected297 remains in progress within290/294/295/297 WIP4.

[PR303](https://github.com/akmaier/agent-m/pull/303), exact bceef4c78353fbeabc9c7a4a62952dac1b523693 into
2a0e9977669af0d4e30b534fa617728b005b1d05, is **not approved for merge**: its CI is red. After the authorized fixture
correction, root obtains the changed candidate's own bounded Ubuntu CI and fresh independent source decision. Workplans
schema generation follows approved Documents source delivery and actual previous End in its separate owned job.

SPEC §11 AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES says:

> The pull request of an implementation job changes only code files in the folders of the modules the job was
> given and tests that name one of those modules.

SPEC's default DoD also requires “every new test names the requirement it guards and the module it exercises.”
The three unit fixtures and release017 each directly invoke MOD-documents.documentFindings over a loaded schema and
assert its valid-input result; release017 also directly exercises readDocument/writeDocument. Naming Documents there
is truthful, not a cosmetic relabelling of an unrelated test. Existing Product-process workflow assertions still
exercise and name their original module. Update only the necessary header/case declarations to name the actually
exercised Documents module using the established declaration convention; retain existing guards, levels and all other
case declarations. The ownership rule does not say only newly created tests, nor that an authorized job instruction
cannot be clarified. The original NEW restriction was a planning boundary, and needs this explicit publication before
continuation. No accepted SPEC/contract or process declaration is changed.

## Four demonstrated failure paths

The entire bceef source/test diff was read: src/documents/checks.mjs adds only the existing compiled-pattern mismatch
Finding and corrects its unfinished-feature comment; tests/documents-path-patterns.test.mjs adds001–008. No path language
or schema format is changed. Accepted MOD-documents01ec416ad20bbd91e026e9b7447422828dd58a34 Data defines `{slug}` as
“lowercase words joined by `-`”; Interfaces requires documentFindings to check “the path against its pattern”.
Current schema-language.mjs424–460 already compiles string/list patterns; check211–214 now applies them.

Common path: `tests fixture readDocument → src/documents/index.mjs:50 → read-write.mjs:223/254 retains path →
index.mjs:51 → checks.mjs:201 compiledOf → patterns211 → add205–206 → Finding artifact/path,line1,schema.rule`.
The static path/body/schema comparison is corroborated by actual Ubuntu assertion failures, not a local test.

|Existing case and failure node|Actual path / expected finding result|Minimal input correction|
|---|---|---|
|product-process.test.mjs688 → readDocument690 → documentFindings707|docs/practices/bare-gate.md returns line1 A PRACTICE IS NOT A MODEL error; expected []|Change only its read path to src/model-catalogue/practices/bare-gate.md.|
|product-process.test.mjs741 → readDocument743 → documentFindings760|docs/practices/evidence-kind.md returns the same path error; expected []|Change only its read path to src/model-catalogue/practices/evidence-kind.md.|
|product-process.test.mjs771 → readDocument773 → documentFindings794|docs/practices/bare-tables.md returns the same path error; expected []|Change only its read path to src/model-catalogue/practices/bare-tables.md.|
|release-itm-292-product-process.test.mjs106 → record107 → helper74/75 → documentFindings108|docs/gates/Development → Review.md returns line1 THE GATE IS RECORDED error; expected []|Give this record call an explicit valid path, e.g. docs/gates/20261010-0211-development-review-a001.md; leave its gate field Development → Review intact.|

Working modelSchema.practice data src/model-catalogue/practice.schema.md names
src/model-catalogue/practices/{slug}.md. Accepted MOD-model-cataloguef01aca5e2777aa375ce9e572c6e7d721761ea90d owns its
practice schema and shipped practices folder; its Data/Interfaces define the existing practice documents. The three
fixtures already contain matching names/fits/Adds/What it is and valid bare model tables; their folder alone is wrong.
Current gateSchema data src/product-process/gate-record.schema.md names docs/gates/{slug}.md. Accepted
MOD-product-process457809097e0b31c3c55e18865f42922d9861d67e Data requires a dated gate-slug record path and keeps the
human-readable phase-arrow gate in the gate field. The proposed explicit path meets both the loaded slug pattern and
that accepted record convention. Keep the shared gatePath helper unchanged, so unrelated gateStates/current/stale/
rejected cases receive no unrequested data change.

Preserve [] assertions as valid-input positives, workflow gates/roles/phases/Produces/attribution/count assertions,
all round-trip fields/reason expectations, independence and existing refusal outcomes. Add no ignored path error,
TODO, changed expected result, broader pattern, bypass or source/schema alteration. The preceding explicitly tabled
practice case at630 remains unchanged; it has no failing documentFindings assertion. This is a four-input correction,
not a rewrite of every practice fixture. B must personally receive the entire two affected original bodies before edits
if its own complete retained body receipt cannot be verified; record the actual new read without backdating.

## Actual CI and same-case evidence

Own tests-only54624c0625c8fafd21cc6c599c316d3ba5720c91 [red38065335400](https://github.com/akmaier/agent-m/actions/runs/38065335400)
checks001/004/006/007 positively;002/003/005 fail normally with [] instead of line1 rule/artifact Findings. Node1141,
1130pass/3fail/8inheritedTODO65s; Python396/5skip/6expectedfail64s. Checkout002704e52468b8431e79ecf25dbeb79ae433a386,
parents2a/546,tree604de45fe3b6f02343f4ad592919df8065b82f90 equals tests-only head.

[Source38065667242](https://github.com/akmaier/agent-m/actions/runs/38065667242), attempt1, exactbceef:
001–008 pass. Four ordinary failures are exactly the three practice positives and release017 above; Node1142,
1130pass/4fail/8inheritedTODO73s; Python396/5skip/6expectedfail64s. Original checkout metadata names
d3f32625449ab90f6eb71b705e6071dffcf98fe5, parents2a0e9977669af0d4e30b534fa617728b005b1d05 and
bceef4c78353fbeabc9c7a4a62952dac1b523693,tree3a70e54a70447d9b97f4cde61cc7add10681173f equal to exact candidate tree.

Raw008 argv /opt/hostedtoolcache/node/22.23.3/x64/bin/node --test --test-name-pattern TST-29700[235]
/tmp/agent-m-297-documents-fault-3AWVPL/repo/tests/documents-path-patterns.test.mjs;
cwd /tmp/agent-m-297-documents-fault-3AWVPL/repo. Removing only the unique compiled-pattern finding block makes the SAME
002/003/005 fail normally status1,null signal/error,empty stderr,15:57:22.766–.863Z. Byte-exact restoration makes
those SAME three pass normally status0,null signal/error,empty stderr,15:57:22.863–.955Z. Source original/restored
SHA d19addd3d3be3c1f9981c259328230059cb848a815a39ea4f2249fcc770b16d3; fault
5f8032c5fdde6e1b951a53a4511aea42d99e6ba0f63ca3d566491e09de8ed918; test
068268562d2173f9ce97b626cb741e9a237bd523e6e786632615144079d84497. Full original streams received; extracted
counterproof.json equals untouched raw node.txt record after only TAP escaped# removal, with literal doubled newline
escapes preserved. This passing targeted proof does not turn the full red run green. No extra per-assertion quota.

## Receipt, authorship and limits

Entire B receipt /private/tmp/itm297-documents-path-original-input-receipt.md SHA
4e433acefd659e4ea5ea3734468c6279a2b3fa5415073c2c1d23ddaabfad4b45 was personally received;18 hash-bearing object rows
were verified, with current relevant source/test/schema pins below.
The later actual16:13:00UTC read-only continuation appended complete803-line product-process and162-line Release292
bodies, both schemas and accepted current interfaces/wrappers; its current receipt SHA is
89401a44a33f9a690d448f6c067ea32ce92f9d8efbd74adea3ea4242599e47f9. I received that entire added passage and verified the
original23249-byte prefix still hashes exactly4e433acefd659e4ea5ea3734468c6279a2b3fa5415073c2c1d23ddaabfad4b45.
These are actual later pre-edit compatibility reads, not earlier generation inputs; candidate source/tests remainbceef. It distinguishes its pre-generation retained73
immutable guard bodies and fresh Documents inputs from later selection reads and source/fault generation. That is B's
actual receipt, not a claim that this PO freshly read those73 bodies. Own full accepted UC00248fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4
and MOD-documents were retained after exact original hashes; the full actual candidate diff/new156-line battery and
complete relevant existing fixture cases/working public caller were received. Accepted catalogue/product-process
originals and wrappers were personally read, with primary human draft acceptance kept distinct. Current original
AGENTS/SPEC/README/Team2/Sprint19 receipt is also recorded in this job's separate Settings gate.

Book ch10 principles62–103 and ch12 Design/KISS178–232 were read in the original. Developing against interfaces repairs
fixture conformity instead of weakening the Documents implementation. KISS/YAGNI select four data inputs and necessary
truthful declarations, with no new producer, format or job ceremony; one responsibility keeps this measurement separate
from Settings and keeps the later Workplans schema job separate from Documents source.

B's fixture adjustment becomes authored compatibility data, not independent Release verification of its own Documents
source. E's prior292 Release authorship and prior passing evidence remain recorded; that prior evidence predates the new
path validation. Future independent297 Release must be by a participant who implemented none of the guarded behavior,
with then-current caller/source/predecessor history checked. Preserve E's290 then294 priority. po-sol wrote no source or
test. No wholeUC002/032/045 postcondition, acceptance, release tag or deployment is claimed. Root alone publishes,
clarifies B's scope, requests own changed-head CI, records actual Ends and performs exact approved merges.

## Immutable candidate inputs and raw evidence

|Path at bceef|Blob|SHA-256|
|---|---|---|
|src/documents/checks.mjs|f646b7a1bc00958a7fda21e319ccc1e859cb34a8|d19addd3d3be3c1f9981c259328230059cb848a815a39ea4f2249fcc770b16d3|
|tests/documents-path-patterns.test.mjs|cdc2f9779f072554c2020821b75ab49290158cd7|068268562d2173f9ce97b626cb741e9a237bd523e6e786632615144079d84497|
|tests/product-process.test.mjs|ce4152d5d57cf6099f5fe01239fa0319897b9e2c|bc003b6968f28593920c27e3702a8e31ae691dd1a71f514cdd1bcae7116d4271|
|tests/release-itm-292-product-process.test.mjs|e228e53cce0cda74ee5784279e687a83cc0824da|f87bd2d9bd27b047cf4b3b25086620af8275fdabc46097f5d7de74debc9128a3|
|src/model-catalogue/practice.schema.md|5b1e456a117b26ccf61e2377e2f05321abfdd0d7|d47bbdd46cfa855db4c7e79cddd72495a3d2e92c95f586a0a7834ae50e753a10|
|src/product-process/gate-record.schema.md|d03d1203e604956c1a4c827ee23ae47b75049049|d6871623b9998feb7f272e59122d6b226869c44ae3985bc9daae0e83ea0b5ed0|

|Raw prefix /private/tmp/root-p19-ci-|Suffix|Bytes|SHA-256|
|---|---|---:|---|
|38065335400-|run.json|12510|41b28c54224696758521be90a00c4eb100fc87d10adbbf89842d16af7f85ad43|
|38065335400-|jobs.json|4051|be5cc7257aab801150305da933affc40ed886877e579ac6a94692262c36af6eb|
|38065335400-|logs.zip|358384|e5dee89e18c9afcb5e29a030ca52896d567c8b287be3a87a2f6e87cc61680181|
|38065335400-|node.txt|865009|4a121ab3d35448f9995209bf090da681c0cdab5b2d099275edf38ad6544c22a7|
|38065335400-|python.txt|75447|7c82ffff9f7970ebae0257408d98bf2c1a7fd4a6fcc150332797cbdcdc876907|
|38065335400-|checkout.txt|6800|dfdeb96cedddd350fb26b796540b35a4b6d16faf870857667d25e8a6f3f49ab8|
|38065335400-|checkoutcommit.json|10897|b7cd45efd70514d4d9fdf2906623beb11ea55292073e0cbc4d2a877648b1861d|
|38065667242-|run.json|12513|e4b343e233b780f12ac779a570065076b80373a8e1842a17d45832b50fe22b70|
|38065667242-|jobs.json|4051|96a7351eae2c64616aa17071881315215564b66094f0696e61093b387dc7d2cf|
|38065667242-|logs.zip|362954|0b7f834137e00d4bce1ba61cd4f0b32b31219c3e79825179fbf096640d7fa1e0|
|38065667242-|node.txt|874944|6f7a784b98c94c0f80ec1ac3e3d0f0cf386fe29ee6b8aecc172864f210377df9|
|38065667242-|python.txt|75447|158ec421c380615960342b3b8deb41b39c6bc68b689b593849da7ff2c6d8a526|
|38065667242-|checkout.txt|6800|398d33b1833ae4b6c137581ba0709541d0027b359a4515744754c7d84bbaafde|
|38065667242-|checkoutcommit.json|17118|b9f5fd334fc0fad9c45af717c373b773e815e9aaeb76604bb7bdea829e3e8038|
|38065667242-|counterproof.json|6314|5193a7e84b58692ffa9a8daab37ddbd951d9634986ecbb18f412d564cfea94ef|
