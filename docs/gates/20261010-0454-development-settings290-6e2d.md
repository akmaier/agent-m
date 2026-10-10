# Development source gate — ITM-290 Settings

**MEASUREMENT — 2026-10-10 04:54:12 UTC**

Decision: **HOLD** for PR #289, exact head `6e2d235882f111630a0f9c3ea57acd40d9ad3a51` against approved `fc3901472a14cb2774c06ade13e8392e19fb1b49`. This record authorizes no merge. It is a source decision only; public caller delivery, independent release and real narrow desktop/mobile geometry remain separate, and ITM-290 is not DONE.

## Assignment and originals

The full published original `docs/jobs/JOB-20261010-0437-ab71.md` was personally read on `ea56d45dabea482c3ef88b7e83d74cbf172e6b1f` before actual clock Taken **2026-10-10 04:42:51 UTC** and fresh isolation `.agent/worktrees/agent-po-sol-settings290-source-19`, branch `codex/p19-settings290-source`. The previous PO job/worktree was ended and not reused.

Applicable originals: AGENTS.md §§1, 2, 5 and 6a; SPEC.md §12 (tests and counter-proofs) and §13 (gate independence); Team2 process, participants, model and current Sprint19/ITM-290; accepted UC-042 main flow 2 and alternative 3a; affected UC-003/017/047 and accepted settings, browser-store, personal-data, repository-hosts, notifications, documents and artifact-edits modules. Prior personal full original reads were retained only on exact unchanged blob/SHA256 pins; fresh owned source/tests, working legacy/public callers and 18 same-guard tests were fully read or exact retained as individually recorded. Later B reads are not backdated to its initial source input.

The guarded source/caller/predecessor history was inspected independently through full commit records: B and earlier declared developers authored guarded implementation; po-sol did not. This review writes only this gate document. The full owned four-file diff has 691 additions and 12 deletions; no accepted artifact change is included.

## Exact CI and retained chronology

Own changed Ubuntu CI `38024634689` is complete SUCCESS. Actual checkout `5872e4af9b16c6cfb9af06f92782b9c6011a20d6` has API parents approved `fc3901472a14cb2774c06ade13e8392e19fb1b49` and exact head `6e2d235882f111630a0f9c3ea57acd40d9ad3a51`; tree `1f08c0bef549d2bc5adf1fcf30e11d04506b797b` matches the head. Live PR metadata retained OPEN/MERGEABLE and the same exact head/base/checks, with no head flip in the observed metadata.

Complete jobs: Python 53 s, 396 tests, 5 skipped and 6 expected failures; Node 56 s, 1112 tests, 1104 pass, 0 fail and 8 inherited TODO. Both satisfy the 120 s bound. Current 290109–113, inherited 288901, producer 290101–108, remote-session 287 cases, endpoint/import/export/notification cases, desktop 291 and native 276 outcomes were read in the retained raw. These are Ubuntu observations, not locally rerun native cases. Raw SHA256: `3dc747428cdd4e8ab2c6d970a8a76e9f87298c3c9bc641495478e3005c7ee434`.

First tests-only `1595c4994ba78b021e0338ca2f3bd92da9d273da` retains its actual own product-red CI `38020960013`: new tabs expected four names but obtained none, before source authoring. Checkout API identifies tests-only integration with `06d932f`, with only the new test file. Published source Start preceded B's actual Taken; the ordinary `609e3e3` merge of approved sprint base is retained. Earlier source CI `38023949256` failed unchanged inherited 288901 at an unreadable stored GitLab address. The current bounded address catch makes that inherited case green without weakening it; the earlier red is not erased.

B's reported deliberate production faults and relevant failures/restoration for 290109–113 and 288901 are retained as reports. B did not retain durable original full argv, endpoint timestamps or streams. No missing bytes are invented, no report is relabeled a raw receipt, and no additional per-assertion fault quota or redundant unchanged rerun is required. The three following concrete defects determine HOLD.

## F1 — token Clear skips the required confirmation

UC-042 main flow 2, lines 73–74: “*Clear* removes it from `localStorage`, after one confirmation, and says what no longer works without it.” The working legacy caller `docs/assets/dashboard/settings-view.mjs:667` asks that confirmation and names the consequence before removing the token.

Failure path: public `src/settings-pages/index.mjs` → Settings `route.render` → `repositoryLine` → `settings.mjs:311` Clear click directly calls `clearSetting` for the credential and adjacent test metadata → stored token becomes null. There is no confirmation or consequence explanation at this failure node.

The bounded public probe reused the existing test's inert Element/Storage adapter, without a browser or real network/system action. Known-positive legacy Clear with confirm returning false called confirmation once and retained `ghp_fixture`; the current public route with the same canceled-confirmation environment called confirmation zero times and deleted its canonical token. Actual probe interval: `2026-10-10T04:46:13.973Z`–`2026-10-10T04:46:14.007Z`, exit 0; cwd and argv are retained. Restore the required one confirmation and consequence at this actual Clear boundary.

## F2 — no-token product exposes writable controls

UC-042 alternative 3a, lines 140–141: “The person has no token that can write to the product. The product section is read-only and links to the token step of UC-001.”

Known-positive working legacy `settings-view.mjs:874` derives eligibility from the token, renders Read-only plus the token-step link, and returns before edit wiring at line 915. Current failure path: public Settings render → `settings.mjs:454` `productControls` → repositoryInfo result destructured only for defaultBranch at line 457 → snapshot read → unconditional pseudonymisation Save and collaborator Save/Remove controls → enabled editable product section despite an empty browser credential store.

The same bounded public probe gives both callers the known public repository/no-token case: legacy renders Read-only and its UC-001 token link; current renders enabled Save, no Read-only and no token-step link. No repository write was attempted or claimed. Restore the accepted read-only/token-step state at this public product form boundary. CI's old legacy positives do not exercise this new branch.

## F3 — three new declarations terminate before required fields

Accepted `MOD-test-document.md`, Data, line 36: “each following line is `key: value`.” Lines 52–54 require given/input/expect; line 59: “A declaration ends at the first line that is not a comment line of this form.” SPEC §12 requires a test to state its input, precondition and expected result before it runs.

Failure path: current `tests/settings-pages-tabs.test.mjs:1`, `:85`, `:147` declarations → bare non-key guard continuation comment → actual public `src/test-document/declarations.mjs:18` KEY_LINE and `:76` block termination → testDeclarations returns null given/input/expect for TST-290109/110/111. Later visible comments are outside those parsed declarations. Preserve test identity/assertions and write valid declared comment fields.

The fresh current public whole-test-path trace uses the actual release caller's tests/ predicate plus SPEC: 571 test paths, 179 declarations, 568 nodes, 260 edges, duplicateIds=[] and unread=[]. All five new canonical IDs are unique. Known positives TST-290112/113 and inherited 290105 have parsed given/input/expect, confirming the same caller works. This finding concerns only the three new declarations; no metadata claim is made against inherited tests. Earlier unrelated graph receipts are not substituted for the current graph.

## Immutable evidence and boundary

Private evidence directory: `/private/tmp/po-p19-settings290-source/`. The complete input inventory `input-inventory.json` SHA256 is `aca4f1413c69b638d1ee7a5ee58bebc22b37fa30ba6d00c480ca314a54cd1efb`: 311 exact retained original pins, 19 current pins, 18 same-guard pins, 72 guarded commit records, 571 whole test-path blobs and 38 evidence artifacts. It retains full scoped diff, current public probe/script/output, whole current graph, live pair metadata, all three raw CI/metadata/API sets, original root readiness/history, unchanged corrected B body and earlier legacy-format probe with their own exact heads and limits.

The private `gate-body.md` is byte-identical to this document. Delivery inventory and full document-only diff identify the clean delivery commit. No source/test/selection/process/accepted document changes, children, publication, merge or additional full/local/native/system operations were performed. Root owns publication and any fresh review of a corrected exact head.
