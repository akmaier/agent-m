# Documents prerequisite Development source gate — PR304 feefb40

**MEASUREMENT**

Date: 2026-10-10 16:42:39 UTC. Method: independent original-document, immutable Git ancestry/message/tree/diff and own existing Ubuntu CI evidence review by declared Team2 Product Owner po-sol under JOB-20261010-1639-5e6f. Dedicated Taken: 16:40:34 UTC. Usage: null. Cost: null.

## Decision

**PASS** exact PR304 head `feefb40d514c93a7b71b1b36e574c5ece44bf499` into Sprint19 base `8ce84947391d3efeac29859029a0b14f42ccd113`, for the bounded MOD-documents prerequisite of selected ITM-297. This records the assigned independent Development source decision. Root owns publication, actual merge and job End. B may begin a fresh Workplans job only after that approved source is actually merged and the Documents job actually Ends. The independent selected297 Release gate and whole UC002 outcome remain open.

SPEC §8 **AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT** states: “The commit that writes a generated artifact names the Agent M version, the participant and the model that produced it.” Actual feef's parent is `bceef4c78353fbeabc9c7a4a62952dac1b523693`; its two-file fixture-writing diff reproduces the approved correction and its own full message contains three separate paragraphs: `Agent-M-Version: unreleased, commit ec6fc86`, `Agent-M-Participant: developer-terra-b`, `Agent-M-Model: gpt-5.6-terra`. Its original ancestry consists of properly attributed b563c0d, 54624c0, 4b4958f and bceef4c. The first commit holds only tests; the retained own tests-only product-red evidence is stated below. The actual writing commit now satisfies the provenance rule. No provenance appears in the generated source/test texts.

The old exact719 HOLD remains unchanged at `docs/gates/20261010-163243-development-documents297-719aece.md`, published3920173/comment6099760848. Old 2d/719 objects and old branch/closed superseded PR303 are preserved; feef is a normal new descendant of bceef rather than an amend, rebase or force rewrite. The new decision approves feef's own evidence, not the old empty correction.

## Source, scope and expected results

I independently verified `git diff --exit-code 719aece feefb40` and exact equal candidate tree `37b7e27ce01878cd019fa7a71c8f8a0ba76f450b`. Thus my own entire source/test originals from the preceding review are retained at unchanged blob/SHA identities, rather than replaced by another agent's summary. The cumulative PR diff from merge base `2a0e9977669af0d4e30b534fa617728b005b1d05` remains four files, 173 additions and 12 deletions; no approved Settings bytes are removed by this branch's composition.

The public data-flow is `src/documents/index.mjs:50–51 readDocument/documentFindings → read-write.mjs:223/254 retained document.path → schema-language.mjs:424–460 existing compiled patterns → checks.mjs:201 compiledOf → checks.mjs:211–214 mismatch check → checks.mjs:205–206 Finding`. For a document fitting none of a loaded string/list path specification, the new check adds line 1, kind error, the document identifier or path, and the schema rule through the existing Finding interface. No pattern adds no path constraint. Matching paths and existing value/section/table checks retain their behavior. No schema-language/parser/API, object-pattern rule, identifier-against-path, new placeholder or filename-number rule is introduced.

TST-297001–007 use public loadSchema/readDocument/documentFindings, covering a valid string pattern before wrong folder/extension, both valid alternatives before neither alternative, an absent pattern, and retained required-value findings. Mismatch cases additionally verify compiler-form formatFinding output. Original book ch10 **DRY**, **KISS** and **Develop against interfaces**, and ch12 **One Thing at a Time**, support reusing the compiled patterns in the one existing checking responsibility. No new architecture or requirement is proposed.

The compatibility assignment published1c0816c (measurement SHA `dc7aa129fa5b22594ee53997584c981dec9837b6715a89040213437833903b17`) explicitly permits exactly the demonstrated four invalid path inputs and truthful Documents declarations. Three practice paths become `src/model-catalogue/practices/{bare-gate,evidence-kind,bare-tables}.md`; TST-292017 explicitly passes `docs/gates/20261010-0211-development-review-a001.md`. Both schema files remain unchanged. Shared gatePath helper, `Development → Review` field, all existing workflow/gate/role/produced-kind/table-count results and all record field/reason round-trip assertions remain. Direct readDocument/documentFindings calls and retained no-finding assertions substantiate the added module declarations. SPEC §11 **AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES** permits tests that name an assigned module; the correction actually exercises Documents and does not take over Product-process source. B's fixture adaptation does not constitute independent Documents Release authorship.

## Own current CI and failure-node verification

Own tests-only red `38065335400` at `54624c0625c8fafd21cc6c599c316d3ba5720c91` remains retained: TST-297002/003/005 ordinarily fail at expected line-1 Finding versus actual `[]`, with valid-path/list/absent-pattern/value cases positive. Prior bceef CI38065667242's four incompatible inputs, 2d CI38067104426 and old719 CI38067221995 remain preserved evidence; none substitutes for feef's own fresh run.

Current run `38068416822`, attempt1, identifies exact feef and two completed successful Ubuntu jobs. Node job114260685805 runs16:37:29–16:38:52 UTC (83 seconds): 1151 tests, 1143 pass, 0 fail, 8 inherited TODO. Python job114260685933 runs16:37:30–16:38:34 UTC (64 seconds): 396 tests run, successful with5 skips and6 expected failures. Each is within120 seconds. Static scanning of the complete raw Node result stream finds1151 top-level results and no ordinary not-ok result; its known positive includes TST-297001. All001–008 and the four corrected existing fixture cases pass. The8 TODO and Python inherited exceptions remain visible, not silently counted as repaired.

Raw checkout names `a7c38172f8461cea93ea8759697fe8a2b776b187`; original checkoutcommit metadata identifies parents8ce/feef and tree `506c51c5c787cf1b7980ffc19964642ecbd9dd3c`. My previously independently reconstructed complete base-plus-four-change tree is retained after exact byte identity of both base and candidate: it equals this current checkout tree. It incorporates approved Settings at base8ce; candidate tree alone need not equal the composed checkout. The raw checkout confirms this actual merge, not the stale pull_requests base summary in run metadata.

Raw Node line1505 contains the full TST-297008 counter-proof. I personally read its complete ordinary-failure and restored-pass streams, argv, cwd, timestamps, statuses, hashes and errors, and verified exact JSON equality with the supplied helper after only TAP `\#` unescaping. Doubled literal newline sequences are rendered for reading without claiming the rendered text is original raw bytes. Cwd is `/tmp/agent-m-297-documents-fault-vglELr/repo`; argv is `/opt/hostedtoolcache/node/22.23.3/x64/bin/node --test --test-name-pattern TST-29700[235]` with the copied Documents test path. Fault runs16:37:53.089–16:37:53.234 UTC; restored run16:37:53.234–16:37:53.358 UTC.

Removal of the unique path-finding block gives normal status1 and TST-297002/003/005 each fails at its exact expected artifact/line1/error/schema-rule object versus actual empty list (test lines52/63/83). Byte-exact source restoration precedes normal status0 and all three same-case passes. Both signals and errors are null; stderr is empty. Original/restored source SHA `d19addd3d3be3c1f9981c259328230059cb848a815a39ea4f2249fcc770b16d3`, fault SHA `5f8032c5fdde6e1b951a53a4511aea42d99e6ba0f63ca3d566491e09de8ed918`, and copied test SHA `068268562d2173f9ce97b626cb741e9a237bd523e6e786632615144079d84497` prove the same failure node was removed and restored. No extra fault quota or new experiment is required.

Raw prefix `/private/tmp/root-p19-ci-38068416822-`, exact SHA-256 pins:

| File | SHA-256 |
|---|---|
| run.json | c10594d1514551ecafb4410bc88d53d69862008ca5d598049e43f47a19787022 |
| jobs.json | d54aafb9dc72667e94779ab682b802ced83909514a2fc4b706b64cc1113e60be |
| logs.zip | b1b86993a0de375da919b4c307d43d7fe327eb81e067f2ca8f9c2e344a0796d0 |
| node.txt | 19a537b162f0aecd2ab0cbfca521d495eb2a79e4b07b7c88fdfe53b270a55162 |
| python.txt | ca2e50533f30115c483929c3d90baa76c98f7984b52c7770b3aca3b4df32a776 |
| checkout.txt | 37abb6eaab057a5d177efe9f23322655dfc9882a69d67b288412a1b8616b0a93 |
| checkoutcommit.json | 749d16a7dfabfb4683cdc149a7304df3f81d5b9febc5118f5293b955771f65e6 |
| counterproof.json | 20c3bbbfc9b85aaab7021ea087e9e8a2ac8625a9f3bc6a84d2202f8564ceaff6 |

## Original-input receipt and independence

The fresh original Start and current PRIMARY AGENTS were personally read before Taken at65319f4. Own full SPEC/README originals are retained after exact unchanged SHA checks: AGENTS `3cf05ca47af95bc2ae48053d3ca31c0d58f27d5004b916abe10eba253a252c7f`, SPEC `676ab39561507bc930be5cc5a35c5227fb71b0d5b8ae7d7fe1278c4873612594`, README `f0884cba300943b927cb6566e29dd6e206b580dfd86f24c88ef53092880ca25b`.

Own full current Team2 declaration/participants/model/Sprint19/order/item297 originals remain at verified blobs `eb772d456a24c145fe3f98778509f207e34e172d`, `aba8b680f7df66e2807701294c960a3c29fb0148`, `72fdea87d0c468ffcd53ae3a6d564623c686e22d`, `cf19d9ebdc000b0006a801b1901e436409b983c7`, `b7d786a0f5130cdd79ced3ea232c408345c37eaf`, `2dfa8eb9b7a7b4f6e263df051c6de2e36dfefeed`. Changed original implementation job1534-f01e, including published Resumed, and previous review job's actual End were freshly read in full. The previous gate is my own complete authored record, retained unchanged.

Own fully read accepted contracts remain at verified immutable blobs: Documents `01ec416ad20bbd91e026e9b7447422828dd58a34` / SHA `d16a5aad99610eb53292ec084d82a1277088dc5dff5c2260d48d356aade4002a`; UC002 `48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4`; UC032 `caa2f8e393cdeb36b7fa666448a46c90fa85b9bc`; UC045 `9ef8cbe1d749bb7054d37dd270dd220f9fb3d9f6`; needed Catalogue `f01aca5e2777aa375ce9e572c6e7d721761ea90d` and Product-process `457809097e0b31c3c55e18865f42922d9861d67e`. Their accepted approval wrappers are distinguished from OPEN human draft texts. Own original ch10 principles62–103 and ch12 Design/KISS178–211 remain verified at SHA `0c5d4ac246710236a3b105e7a575294dae46fbfd9af62b777a88a94fa482ebfe` and `648da26820f638bb96386d437f1c43ccbc523006ac814449a4e04a9c4330c6df`.

The complete B input receipt `/private/tmp/itm297-documents-path-original-input-receipt.md` is SHA `eccb68fadacd234e76bb7216afdfe61a7bd2576d67db8494511a15f96e056b1d`. Its first31756 bytes remain exactly my previously fully read receipt SHA `bc7c1e5da0ae4dbd7fb2b067a4bf741238489bc86909a51580bbf85c14dda01d`; new attributed-candidate and current CI passages were freshly read. The original93 pre-generation input rows and later16:13 full receipt of both Product-process fixture bodies remain distinct, with no backdating. The current receipt's dedicated CI-read/gate report says16:41:06 UTC; that is its actual recorded text.

Candidate file pins remain:

| Path | Blob | SHA-256 |
|---|---|---|
| src/documents/checks.mjs | f646b7a1bc00958a7fda21e319ccc1e859cb34a8 | d19addd3d3be3c1f9981c259328230059cb848a815a39ea4f2249fcc770b16d3 |
| tests/documents-path-patterns.test.mjs | cdc2f9779f072554c2020821b75ab49290158cd7 | 068268562d2173f9ce97b626cb741e9a237bd523e6e786632615144079d84497 |
| tests/product-process.test.mjs | b83d661a59761ffbb2cfbdf3787e6982f9a69e12 | 9eb35fcee645c4ed0df11332b4f04e27ebabf8faf5a8b7f55ebdd5d194b87162 |
| tests/release-itm-292-product-process.test.mjs | 6b0f8c402972cea14802d690317ddf1393ca8a3f | 1b92a264f52bc7733b431f91ce2d6fe924c0f22f2a07608a0cc86209327a85cf |

I authored no candidate source/tests and am independent of implementer developer-terra-b. My earlier planning compatibility decision does not replace this assigned source gate. No local runtime/tests/fault, additional CI, human acceptance or publication was performed. This PASS delivers only the exact Documents prerequisite source decision; it does not claim all accepted Documents checks, Workplans formats, selected297 Release, wholeUC002 or public pages are complete.
