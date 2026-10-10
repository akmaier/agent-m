# Desktop fixture dependency gate on the approved producer combination

**MEASUREMENT**

Decision: PASS PR285 only head `22affb7838eb5347bf2ced51375c358071fa0ca5` into `sprint/19`
base `708cd3bdc3dbced9e4a9deeccf10639f0ca8fd06`. Root publishes this review and performs only that exact merge.
Decider: po-sol; model: gpt-6.1-sol; Agent M: unreleased, published commit
`ee73e2fb89c081f1fa0c32d6458d2c2bd79f6a50`.
Job: JOB-20261010-0220-p19fixture22; published Start2026-10-10 02:20:38 UTC;
actual tools.clock Taken2026-10-10 02:22:37 UTC; decision2026-10-10 02:25:03 UTC.
Fresh isolation: `.agent/worktrees/agent-po-sol-fixture22-19` / `codex/p19-fixture22` from published main.
Usage/cost: null/null.

The new original published job was read before isolation. Forty personally read original AGENTS/SPEC/README/PLAN,
Team2 declaration/model/participants, selected Sprint19/items, affected accepted modules/use cases and existing
source/test inputs are retained by exact unchanged blob/SHA256 checks against published main. Complete retained
input pins are in `/private/tmp/po-p19-fixture22-original-retention.json`; the new job SHA256 is
`850e2c107b78d7c50a1c15d2a4f41375a4651f4169b54f480023ab9b903c712a`.
The accepted MOD-desktop-shell/MOD-tunnels public composition and original complete five fixtures were read in the
prior review and retained; all new changes and integration provenance were read. No summary substitutes for originals.

The declared Team2 gate requires “CI is green on it and the Definition of Done holds.” SPEC §13 states
“A gate's decision recorded by the participant that did the work the gate checks does not pass it.”
This review is by po-sol, separately from developer-terra-e's fixture work. SPEC §12 requires every PR CI job
finish within two minutes and preserves same-commit pass/fail flips as flaky. The current decision concerns this
new exact head; earlier failed/cancelled/flaky records remain evidence of their own heads.

Live read-only PR metadata identifies the exact22affb7/708cd3b pair and exactly five module-named test files:
release-itm-268-desktop-shell, release-itm-269-endpoint-route, release-itm-276-desktop-shell,
release-uc-003-dashboard-https-bridge, and system-uc-003-dashboard-bridge. There is no source/helper/workflow change.
The approved-base full diff is `/private/tmp/po-p19-fixture22-approved-base.diff`, SHA256
`5115de4c181d84e773835e75537be7a1783a8b6d276d87aa957ded3a7467528a`.
Every scenario suffix, including readable inputs/expected outcomes/assertions/cases/skips/TODOs, is byte-identical
to the approved base. This dependency adaptation introduces no product behavior or new case; no tests-first-red,
counterproof-per-assertion or stress-test quota is imposed.

The bounded correction follows the actual failure path from a310 run38015445531:
`four concurrently loaded fixtures → sshRuntime → npm install to the same temporary cache →
asn1/lib ENOTEMPTY and missing ./ber/index → known-positive/import failure before scenarios`.
Commit `c1c669bba5a088cfff8b08a82269340844137d70` changes only four cache-name literals. Each Node file now
owns a distinct temporary pinned ssh2@1.17.0 cache: release268, release269, release266-https and system266.
The existing known-positive child requires ssh2, checks version1.17.0 and generateKeyPairSync; then NODE_PATH,
Module._initPaths and dynamic compose import reach the production entry. Native276 retains its normal ancestor
resolution dependency link, owned cleanup and existing native lock; its bytes are unchanged from a310.
The incremental c1 diff and complete immutable c1 inventory remain retained, including the original failed receipts.

All five fixture hashes at22 exactly equal c1:

|Fixture|SHA256|
|---|---|
|release-itm-268-desktop-shell|0df28457757618b98ce38e497b44edc7ee488e1df5ef7f0ac7acd0d8e1124a9a|
|release-itm-269-endpoint-route|de9163d2a133300f812b2b6652ef30d14e8c55bf933c32cff6997cda0d040296|
|release-uc-003-dashboard-https-bridge|da6b4cfb31a8800da807eb1ec45469b2885104b6f3c138406b376436b3ce6932|
|system-uc-003-dashboard-bridge|12416b5fa6443926ececf006bd5fa69de8aa394c612a3be015743980555212b4|
|release-itm-276-desktop-shell|372f3f7e2ba288f8a750a593921188c404d7e8dc8d7d436d5bdb62efc0bbac09|

Actual GitHub head parents are c1c669bba5a088cfff8b08a82269340844137d70 and the approved708cd3b above.
Both CI jobs check out `4f93ad9d12d37f3819d1ee7a88caa6acb8d9b4c5`; its actual GitHub API parents are
708cd3bdc3dbced9e4a9deeccf10639f0ca8fd06 and22affb7838eb5347bf2ced51375c358071fa0ca5.
Checkout tree `bed70512e57cbf2f94dfffb78bf9fcc17cef32dc` equals the reviewed head's tree.
The source-scoped history command can rewrite displayed parent links; actual ancestry is established by the API,
unsimplified raw commit objects and explicit merge-parent blob inventory, never those rewritten displays.

Own complete changed Ubuntu run38016489292 is SUCCESS: Python66s with396 tests; Node74s with1093 tests,
1085pass,0fail,0skip,8TODO. Both complete job durations satisfy120s. At the earlier failure nodes the unchanged
scenarios now execute and pass: TST-268901, TST-269901–269904, TST-266001/TST-266002 and native TST-276901.
Raw current log SHA256 is `09953c1704d0e4e1c4996df5c4f855ecd4f31b07fddd95308160fd44244b86b2`.
Earlier c1 own green38015964222 (1091 Node tests,1083pass,0fail,8TODO) supports the correction on its prior base;
its raw log SHA256 is `f7f917fe7129cb064b91220862a1c4700024408e4c766ffe7e705cd057a1e0a1`.
It does not replace the changed22 combination's own green CI.

Full guarded source/caller/predecessor history retains all386 prior full messages unchanged and adds six source-history
entries. All392 source-history commit objects are also retained unsimplified with full messages/trailers.
The known-positive E source identity50ef591 remains the sole historical E/predecessor source match; its19 scoped
source blobs all inherit an exact parent, with zero novel blobs. No new E/predecessor source match occurs.
Actual integration22 and708 each have39 scoped source/caller paths, all inherited from an exact parent, zero novel.
New Store source70/00 and personal-data integration messages identify TerraD. E's c1/a310/713 fixture authorship
and earlier independent release work remain distinct from those implementations. Git author akmaier or replacing
Sonnet with Terra does not establish independence. Complete full-range fixture messages, raw commits, exact hashes
and merge-parent blobs are retained; history-retention inventory SHA256 is
`42b940f6e8f157e2d806c73fd393100d46909dd3cad454be5b11e7a10c9791a8`.

The historical a310 HOLD and its separate dated run-attribution correction remain unchanged. In particular, source291
run38014415911 on649 had six positive native276 and six new291 cases, while four older Node fixtures failed and
native276901 timed out. Store38015415729's public Node positives belong to Store00, not that649 combination.
The new22 fixture CI is another distinct combination; it does not establish a future desktop source combination.
All106 prior evidence-artifact hashes verify unchanged. Inherited TODOs R2 product SPEC token fallback, R3 renewal
paste field, A3/A4 missing-write GitHub routes and G1/G2 record classification/acceptance (release and requirement
cases) remain visible and are not delivered by green CI.

PASS permits ONLY this exact fixture merge. A's subsequent desktop source combination needs its own changed CI,
independent source/release decisions and required evidence. This gate completes no ITM291 or whole UC003/044;
ITM290's producers still need independent release verification and its consumer/public layout remain unfinished.
WIP selection290/291/292/257 stays unchanged;293 waits for a free slot; future004–006 assessment follows290 delivery.
Notifications and general browser-direct endpoint behavior remain preserved.

Complete immutable129-artifact evidence inventory: `/private/tmp/po-p19-fixture22-full-inventory.json`, SHA256
`ca3b7d44edeacb3ed4dfb452063e78aa4ee480bbdba9cab211f5f9b087ceb155`.
Private PR review body `/private/tmp/po-p19-fixture22-review-body.md` is byte-identical to this gate.
Only this gate and private evidence were authored: no source/tests/accepted artifacts/process/model/participants/
DoD/backlog/selection change, children, own publication/merge, local full/glob/native/Electron/browser/UI/device/
system/personal/SSH/paid execution.
