# Documents prerequisite Development source gate — PR303 719aece

**MEASUREMENT**

Date: 2026-10-10 16:32:43 UTC. Method: independent original-document, immutable Git metadata/diff and existing Ubuntu CI evidence review by declared Team2 Product Owner po-sol, under JOB-20261010-1626-6fe4. Dedicated Taken: 16:27:02 UTC. Usage: null. Cost: null.

## Decision

**HOLD** exact PR303 head `719aece67a76118bb62c0985611d1a645694e400` into Sprint19 base `8ce84947391d3efeac29859029a0b14f42ccd113`. The bounded source logic and guard evidence are positive, but the artifact-writing fixture commit does not satisfy the binding provenance rule. This is no source approval or merge authorization.

SPEC §8, **AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT**, states: “The commit that writes a generated artifact names the Agent M version, the participant and the model that produced it.” The original job also requires three separate provenance paragraphs. Actual `2d1d7ca10b502ad2b298df2e234d889aa9acda49` writes the approved two fixture files; its entire message is `test(documents): align validated fixture paths`. It names none of those three values. The known positive is the actual message of `719aece`: it names `Agent-M-Version: unreleased, commit ec6fc86`, `Agent-M-Participant: developer-terra-b`, and `Agent-M-Model: gpt-5.6-terra`. However, `git diff 719aece^ 719aece` is empty: that commit writes no artifact and leaves 2d's message unchanged. A later attribution is truthful evidence, but does not make the writing commit satisfy the quoted sentence.

The failure node is `2d1d7ca → changed fixture blobs b83d661… / 6b0f8c4… → writing commit message → absent required provenance`, verified by the original full messages and empty correction diff. Preserve these published objects and their evidence. A normal new candidate can reproduce the already approved fixture correction from the properly attributed pre-fixture source, with the three paragraphs on its actual writing commit. Root owns assignment/publication and fresh exact-candidate CI; this review changes no source or history and grants no prospective approval.

## Source and preserved guard findings

The four-file PR diff is measured from merge base `2a0e9977669af0d4e30b534fa617728b005b1d05`, not a two-dot comparison that would incorrectly present the approved Settings base as removed. It changes only Documents checks and three tests naming the module they exercise: 173 additions, 12 deletions.

The public path is `src/documents/index.mjs:50–51 readDocument/documentFindings → read-write.mjs:223/254 retained document.path → schema-language.mjs:424–460 existing compiled patterns → checks.mjs:201 compiledOf → checks.mjs:211–214 mismatch check → checks.mjs:205–206 Finding`. A nonmatching folder or extension now adds line 1, kind error, artifact identifier or path, and the schema rule through the existing Finding function. Existing loaded string/list alternatives are reused. No pattern means no new constraint. No schema, parser, placeholder, public API, identifier-against-path check or object-pattern rule changes.

TST-297001–007 cover valid string paths, a wrong folder, a wrong extension, both valid alternatives, neither alternative, an absent pattern, and retained required-value findings. The cases use public loadSchema/readDocument/documentFindings; mismatches additionally check compiler-form formatting. This follows ch10 **DRY**, **KISS**, and **Develop against interfaces**, and ch12 **One Thing at a Time**: reuse the existing compiler and one bounded checking responsibility. It adds no design requirement.

Published compatibility assignment `1c0816c`, measurement SHA-256 `dc7aa129fa5b22594ee53997584c981dec9837b6715a89040213437833903b17`, supersedes the original NEW-tests-only instruction for these four demonstrated inputs. The three practice fixtures now use `src/model-catalogue/practices/{bare-gate,evidence-kind,bare-tables}.md`. TST-292017 explicitly uses `docs/gates/20261010-0211-development-review-a001.md`. The practice schema and gate schema remain unchanged; the shared gatePath helper and the `Development → Review` field remain unchanged. All existing workflow, role, produced-kind, table-count, gate, field and reason round-trip expectations remain. The added Documents declarations are supported by their actual readDocument/documentFindings calls and retained no-finding assertions, rather than cosmetic module relabelling. The author of these corrections is the Documents implementer; this is not independent Documents Release evidence.

## Exact CI and counter-proof

Own tests-only red `38065335400` at `54624c0625c8fafd21cc6c599c316d3ba5720c91` is retained: the three ordinary mismatch cases TST-297002/003/005 failed at expected Finding versus actual empty list; known positives passed. The bceef red `38065667242` remains evidence of the four formerly invalid compatibility inputs. The subsequent 2d green `38067104426` is retained without substituting it for the current head.

Current own CI `38067221995`, attempt 1, reports exact head 719aece, both Ubuntu jobs successful: Node 1151 tests / 1143 pass / 0 fail / 8 inherited TODO, 90 seconds; Python ran 396 tests, successful with 5 skips and 6 expected failures, 62 seconds. Raw checkout names `95f75f20734ac3fabe936b48a447bec5a557d745`; the original checkout metadata names parents 8ce and 719 and tree `506c51c5c787cf1b7980ffc19964642ecbd9dd3c`. I independently reconstructed the tree from the complete immutable base tree with precisely the four candidate changes, using Git tree ordering and object hashes; it equals that exact tree. Thus current CI tests the composed approved Settings base plus Documents candidate. Candidate tree alone is `37b7e27ce01878cd019fa7a71c8f8a0ba76f450b`; their difference is explained by the approved Settings composition.

The full TST-297008 same-case streams were read from raw Node line 1505 and compared with the supplied JSON. TAP's escaped `\#` is stripped only for that JSON comparison; doubled literal newline sequences are displayed as line breaks for reading, not misrepresented as original raw bytes. Its cwd is `/tmp/agent-m-297-documents-fault-Tom5HC/repo`; argv is `/opt/hostedtoolcache/node/22.23.3/x64/bin/node --test --test-name-pattern TST-29700[235]` with the copied Documents test path. Fault execution runs 16:20:25.898–16:20:26.016 UTC; restoration execution runs 16:20:26.016–16:20:26.134 UTC. Removing the unique path-finding block gives normal status 1 and all three same assertions fail at expected line-1 Finding versus actual `[]`; byte-exact restoration gives normal status 0 and all three same cases pass. Both signals/errors are null; stderr is empty. Original/restored source SHA is `d19addd3d3be3c1f9981c259328230059cb848a815a39ea4f2249fcc770b16d3`; fault SHA is `5f8032c5fdde6e1b951a53a4511aea42d99e6ba0f63ca3d566491e09de8ed918`; copied test SHA is `068268562d2173f9ce97b626cb741e9a237bd523e6e786632615144079d84497`. This verifies the failure node without another experiment or per-assertion quota.

Current raw evidence prefix: `/private/tmp/root-p19-ci-38067221995-`. Exact SHA-256 pins:

| File | SHA-256 |
|---|---|
| run.json | d1334237fe0eefc665e9f289d7fead6c68a733047ab53a5eae86cd2e49c060e5 |
| jobs.json | 0e00dd6c21001d8018d6a140030de764b526b3733fec56860cb71b3cfdce1cb4 |
| logs.zip | 6b9b3618935898e2046e82f920cad643416f238baf02ae2fb16aa9658cef6c5c |
| node.txt | c8cfad279cd154da7f4fca84e8255ac30957e873ec07e8120b81703a84ac51cc |
| python.txt | 94b9cbc7872a9bffb52b13f15a72a8a0afcdea28a42995363c826912cba9315c |
| checkout.txt | 831e892fe09764c065e1800725a116f7ab2ae8def4f64eac1e581ff771c647e0 |
| checkoutcommit.json | f3f9db0a3ab22831c990c856aeb6fc3ed350b4872e12bf2ba07c31609c921c30 |
| counterproof.json | 7c0459cbfcf936ee7d2ed0bd107479d9f52e7a3502905e5c6afb2662e650c3f7 |

## Original-input and independence receipt

I personally read the full fresh Start/current PRIMARY AGENTS before Taken. My own earlier full SPEC/README reads are retained after exact unchanged SHA verification: AGENTS `3cf05ca47af95bc2ae48053d3ca31c0d58f27d5004b916abe10eba253a252c7f`; SPEC `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594`; README `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b`. Current Team2 declaration/participants/model/Sprint19/order full original reads remain retained at verified blobs `eb772d456a24c145fe3f98778509f207e34e172d`, `aba8b680f7df66e2807701294c960a3c29fb0148`, `72fdea87d0c468ffcd53ae3a6d564623c686e22d`, `cf19d9ebdc000b0006a801b1901e436409b983c7`, `b7d786a0f5130cdd79ced3ea232c408345c37eaf`. Changed item297 and job1534-f01e were read in full, current blobs `2dfa8eb9b7a7b4f6e263df051c6de2e36dfefeed` and `871ccdb17f99739c0729a7b92839849406dcd04e`.

The entire accepted Documents original was reread at blob `01ec416ad20bbd91e026e9b7447422828dd58a34`, SHA `d16a5aad99610eb53292ec084d82a1277088dc5dff5c2260d48d356aade4002a`. My own complete accepted UC002/032/045 originals remain retained after verification at blobs `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4`, `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc`, `9ef8cbe1d749bb7054d37dd270dd220f9fb3d9f6`; needed accepted Catalogue and Product-process originals are `f01aca5e2777aa375ce9e572c6e7d721761ea90d` and `457809097e0b31c3c55e18865f42922d9861d67e`. Approval wrappers distinguish these accepted texts from current OPEN human drafts. Original book ch10 62–103 and ch12 178–211 were reread. Entire changed source/tests were received, retaining verified unchanged portions and rereading the changed originals and full diff.

The complete B receipt `/private/tmp/itm297-documents-path-original-input-receipt.md` is now SHA `bc7c1e5da0ae4dbd7fb2b067a4bf741238489bc86909a51580bbf85c14dda01d`. Its first 27442 bytes remain exactly the earlier fully read receipt SHA `89401a44a33f9a690d448f6c067ea32ce92f9d8efbd74adea3ea4242599e47f9`; the appended compatibility/provenance/current gate passages were freshly read. Its pre-generation 93 input rows and later 16:13 receipt of the two affected Product-process bodies are distinguished; later receipt is not backdated to first generation. No test/source changed during that later original-input read.

Exact candidate files:

| Path | Blob | SHA-256 |
|---|---|---|
| src/documents/checks.mjs | f646b7a1bc00958a7fda21e319ccc1e859cb34a8 | d19addd3d3be3c1f9981c259328230059cb848a815a39ea4f2249fcc770b16d3 |
| tests/documents-path-patterns.test.mjs | cdc2f9779f072554c2020821b75ab49290158cd7 | 068268562d2173f9ce97b626cb741e9a237bd523e6e786632615144079d84497 |
| tests/product-process.test.mjs | b83d661a59761ffbb2cfbdf3787e6982f9a69e12 | 9eb35fcee645c4ed0df11332b4f04e27ebabf8faf5a8b7f55ebdd5d194b87162 |
| tests/release-itm-292-product-process.test.mjs | 6b0f8c402972cea14802d690317ddf1393ca8a3f | 1b92a264f52bc7733b431f91ce2d6fe924c0f22f2a07608a0cc86209327a85cf |

I authored no candidate source or tests. My earlier compatibility decision is planning and does not substitute for this independent source review. No local runtime/test/fault or additional CI was performed. This HOLD concerns only exact719 Documents source delivery. Later Workplans implementation and the independent selected297 Release gate remain; whole UC002, the selected297 outcome and public pages are not declared delivered. Human acceptance remains with akmaier.
