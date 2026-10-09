# Independent item release testing — ITM-284

**MEASUREMENT**

Decision: **PASS** for [PR258](https://github.com/akmaier/agent-m/pull/258), exact tests-only head
`a73ffd3dcde9a6af4e455c3b6a7a7408c0d320cd`, into actual sprint/17 currently
`843a19786b94d70325eb3db562a910864fbaff0c`. Independent decider po-sol, separate from writer developer-terra-e
and source developer-terra-c. Fresh JOB-20261009-1718-pe284; actual Taken clock2026-10-09 17:27:17 UTC;
decision clock2026-10-09 17:29:31 UTC. Usage/cost:null.

## Original inputs, independence and boundary

Read the entire original published fresh Start before creating new isolated
.agent/worktrees/agent-po-sol-e284-release-gate-17, branch codex/pe284-release-gate-17 from current
main795528291fe97138112229f52470a1f0e4aa5723. Personally read full original AGENTS/SPEC/README, Team2
declaration/participants/pinned scrum-wip, original Sprint17/item284, accepted UC044/ARC052/MOD-tunnels/
MOD-desktop-shell in preceding source jobs; verified all remain byte-identical to df81829. The original source
gate was read again, alongside original E Start/current item, full source/unit/release files, actual guarded
source/predecessor histories, exact commit/diff and corrected original fault receipt. No summary replaces an
original contract. AGENTS/SPEC blobs remain7e8f20ca35cd48a5250d143b07a469d46986f123 /
1de56e76de63bfe5f3f4bb98820adad801041def; pinned model72fdea87d0c468ffcd53ae3a6d564623c686e22d
at ef33e2f501289930960f13b55936e9b557003993. Accepted MOD-tunnels0d7ed13e3e793bf081636b53c1ae64c7f15485f9,
MOD-desktop-shell71d36abb286361f9349b30f3fa9bb8bd2e4f4a06, ARC0523fee08bacbb70bd95ecdfac91417f06f9a07d95c
and UC0446c80417a691b105488b2426c25245ae7f39a33a7 remain unchanged.

SPEC §§11–13 apply owned source/test boundaries, canonical readable cases/relevant own fault evidence,
independent release authorship and Product Owner gate/DoD. Team2 adds no job DoD conditions. Original guarded
history has source15c9f6f and unit-first271bc975 authored developer-terra-c; no prior src/tunnels implementation.
Only the new release file is authored by developer-terra-e at a73ffd3, parent1f76b1657e8d8a7511268dbb5a6dae580cd0fe54.
E and predecessor Sonnet-E authored none of guarded ensureKey behavior. This reviewer authored none of source,
unit or release tests. Diff from that parent adds exactly tests/release-itm-284-tunnels-key.test.mjs; production,
old expectations/helpers/callers/manifests/workflows/accepted documents/model/participants are unchanged.
This write-tests job over delivered behavior requires no fabricated tests-first implementation red.

Accepted MOD-desktop-shell Start supplies its per-user data folder → MOD-tunnels.ensureKey owns
ssh/id_ed25519 and ssh/id_ed25519.pub → returns only publicKey/fingerprint for UC0446a2 public display.
Actual pairing compose still supplies only job handlers and has no imported key/tunnel controls. This release
coverage verifies that prerequisite only; it claims no shell/SSH/HTTPS/browser integration or distribution.

Actual source index.mjs:27 ensureKey → :28–30 supplied-folder paths → :32 owner-only mkdir → :35–37
complete pair read with no rewrite, or :39 real ssh2 Ed25519 generation → :40–42 owner-only private write/
chmod0600 and public write → :44 matchedPair:21–24 parse and compare public SSH bytes → :45 return public
key and fingerprintOf:16–18 SHA256 of the actual public SSH bytes. Denied mkdir/write → :48 wraps EACCES/
EPERM/EROFS with notWritable:9–13 name NotWritable and exactly supplied folder; no private result or created key.

The independent release adapter follows the accepted original acquisition pattern: exact ssh2@1.17.0 in
outside-checkout temporary cache, real generation/parse/version known-positive, then ordinary Node children
with NODE_PATH and production's normal createRequire('ssh2'). No fake/injected generator, production install,
hard-coded temporary production path, manual key conversion, SSH executable or personal key is used.
Each fixture finally removes its constructed folder. Private key bytes are read only within controlled
fixtures to compare persistence, never copied into this public record or decision body.

## Corrected original evidence and actual own release-case reproduction

Read /private/tmp/JOB-20261009-1702-e284-actual-release-test-receipt.md in full. It records actual unchanged
release-file cases and exact guarded source/test hashes. Earlier inline-probe substitutions are insufficient
own-case evidence and explicitly excluded. Independently reproduced the corrected cases in an exact
 a73ffd3 archive at /private/tmp/pe284-po-disposable. Selected known-positive release3/unit3/declaration10/
trace4 cases20/20 pass,0fail/skip/TODO/cancel748.546ms before faults, including the real package known-positive.

For each fault the actual unchanged command is TMPDIR=/private/tmp node --test
--test-name-pattern=TST-28490N tests/release-itm-284-tunnels-key.test.mjs. Only disposable production bytes
change; repository source/test and author's checkout are untouched.

| Actual own case | Recorded production fault → actual verified assertion node | Exact restored same case |
|---|---|---|
|284901|source:45 fingerprint becomes wrong → release:96 fingerprint equality actual wrong versus real public-byte SHA256|exit0/pass1/fail0|
|284902|source:35 reuse branch forced false → release:114 existing private bytes unequal after ordinary child boundary|exit0/pass1/fail0|
|284903|source:48 access-denial mapping disabled → release:143 name actual Error expected NotWritable|exit0/pass1/fail0|

Every fault actually exits1/fails1; each same unchanged case after exact-byte restoration exits0/passes1,
0skip/TODO/cancel. The regeneration assertion's private-key diff remains only in private temporary logs;
no generated private bytes are included in public evidence. Restored source SHA256
678c0bff08757eb31cbb350027d504ba0b61639365b1674d45cbb56938e0d29f/blob1962849ff10cbb0dec73a77867bb582200935f91
and release test SHA2560d83740b8a1289ca2fe63dbebb97bc9bc978dacb5b40801fb659d915f0029aa8/
blob529fc9eaab4835ba10a7a3ef505e64d17ffe54b1 exactly match the reviewed head throughout.
Actual private logs /private/tmp/pe284-po-TST-28490N-{fault,restored}.log and positive
/private/tmp/pe284-po-positive.log retain outcomes. No new per-assertion mutation quota is imposed.

284901 independently parses both real keys, checks Ed25519 correspondence, returned public bytes/fingerprint,
exactly two public-only fields and absence of private contents.284902 checks exact private/public bytes across
two ordinary Node children, same result and private0600.284903 positively precedes its denial with the suite's
working generation, then tests controlled supplied folder/NotWritable/exact folder/no-created-key. These cover
the selected bounded outcome and preserve original unit expectations; they do not substitute broad SSH tests.

Delivered testDeclarations independently parses exactly three unique numeric284901–903 at lines83/102/121,
release/MOD-tunnels, lowercase nonempty guards/given/input/expect. Actual traceGraph/tracesTo positively
returns all three for THE BRIDGE CREATES ITS OWN SSH KEY and then zero for an unrelated signature requirement
(/private/tmp/pe284-po-declarations.log). This is canonical graph evidence, not test_origin_links alone.

## Complete Linux CI and actual tested/current trees

[Full CI37964885992](https://github.com/akmaier/agent-m/actions/runs/37964885992) is SUCCESS at exact
 a73ffd3dcde9a6af4e455c3b6a7a7408c0d320cd. Both jobs actually check out
`dcd32bde13678d97d365d65844443671769f16fc`; GitHub actual commit parents are tested target
`d492b4732ef31c2c4463bd9bd1e7cffec174f292` and exacta73ffd3, tree
`8f397b7cebb16d856e3ef534d9febba55c1c3bc9`. Retrieved all recursive entries without truncation;
all1965 actual files exactly equal tested target plus the single unchanged new release file.
This CI tested delivered284+285 and E284 coverage, not the later283/282 source.

Node113936648590 SUCCESS1052tests/1044pass/0fail/8TODO/0skip/cancel56.708s, full64s.
Python113936648799 SUCCESS399tests/388ok/5skip/6expected failures57.803s, full64s.
Both fit unchanged timeout-minutes2; native276001–006 and independent276901 actually execute/pass on Linux.
Complete log7236lines/735481bytes SHA2564fed0643735b8246dc785a7bddc190bc0d1236d3eca5e8f2913e93853f02b8e3
was retrieved/read in full, every399 Python and1052 Node named outcome extracted/read at
/private/tmp/pe284-final-ci.log and pe284-final-every-outcome.txt. Compared to original source284 final
37961925061, all399 Python/1043 Node named outcomes remain identical; additions are six merged285 cases
and three new release cases, all pass. No old outcome is silently omitted or weakened.

Live PR258 OPEN/MERGEABLE, unchanged exacta73ffd3, base sprint/17, both completed SUCCESS checks above.
Actual branch API confirms current843a19786b94d70325eb3db562a910864fbaff0c, adding accepted283 browser-store
and282 bridge-client source/tests since testedd492b473. Those exact original modules/deltas were personally
read in the preceding independent source jobs and inspected again. ensureKey imports only Node builtins and
ssh2; all guarded source/unit/release files, package runtime pattern and declaration/trace dependencies are
unchanged. It imports no browser-store, bridge-client or bridge API. New identifiers are disjoint. This supports
the bounded item release decision; oldCI is not relabelled testing later source/current aggregate tree.
Root rechecks the live base/head/checks before merge; combined aggregate/closing Linux CI remains separate.

## Preserved limits and disposition

Existing five Python skips remain groups, two nightly SPEC scans and two sprint-record checks; six expected
failures remain CR/CRLF approval twins, backlog order, outside-section SPEC bytes and trailing blanks. Eight
Node TODOs remain R2/R3/A3/A4 and release/core G1/G2 record-as-proposal findings. They are explicit retained
limitations, not product passes. Manual review has no invented fixed-round cap; unknown usage/cost remain null.

No local full/glob or desktop-shell/native tests, Mac app/browser/clipboard/focus/settings/accessibility,
personal/private-device audit, real host/SSH, paid provider, external write or child agent occurred. Full native/
integration authority is GitHub Linux CI. Reviewer writes only this new dated gate and private decision body.
Root may publish/comment/recheck/merge this exact release-test head, then record job End/item disposition.
This independent item release decision does not replace aggregate Release testing → Sprint review, sprint
closing or human release-report/artifact acceptance, deploy/distribute, or infer running tunnels/trusted TLS/
current-browser outcomes. E's284 release source independence is preserved.
