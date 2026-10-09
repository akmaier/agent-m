# Sprint17 planning readiness

**MEASUREMENT**

Participant po-sol; model gpt-6.1-sol; job JOB-20261009-1612-p17p; local version unreleased
af494a49a3a171d987018b6051bcf6404bc152a4. Actual Taken2026-10-09 16:13:38 UTC. Isolated branch
codex/p17-plan, base fa6f67c40ea6b1b4999fd6ba38f75c2b57a3751f. No external write or native interaction.
Unknown usage and cost: null. Decision: select necessary existing-architecture foundations282–285; add none to SPEC.

## Original inputs and acceptance

Full original Start, original ordered backlog203–281 and Sprint04–16 records read, including repair of truncated
outputs. Read original UC032, UC003/011/042/044, MODbridge-client/browser-store/bridge-http/tunnels/desktop-shell and
ARC040/050/052; retained personally read full AGENTS/SPEC and original gates after exact unchanged verification.
No other participant's summary substituted for these originals. Readiness audit feedback was cross-checked against
these originals and actual source/caller data.

Retained binding/process pins: AGENTS7e8f20ca35cd48a5250d143b07a469d46986f123;
SPEC1de56e76de63bfe5f3f4bb98820adad801041def; process_team2 eb772d456a24c145fe3f98778509f207e34e172d;
participants_team2 aba8b680f7df66e2807701294c960a3c29fb0148; scrum-wip72fdea87d0c468ffcd53ae3a6d564623c686e22d,
model version ef33e2f501289930960f13b55936e9b557003993. UC032 steps1–6/1c provide this manual PO selection;
its builds_on concerns implemented interfaces; independent aggregate release remains separately required.

The current original approval record for each of these names exactly the following blob:

| Contract | Current accepted blob |
|---|---|
| MOD-bridge-client |c1605d3972e8a38f8a282acfbbb64223e9b7b617|
| MOD-tunnels |0d7ed13e3e793bf081636b53c1ae64c7f15485f9|
| MOD-browser-store |058fd3b05cc14cb361575f16a2059f174417e8ac|
| MOD-bridge-http |2792f1d3a1a66eec9750fac85949ee78874e2956|
| MOD-desktop-shell |71d36abb286361f9349b30f3fa9bb8bd2e4f4a06|
| ARC-052 |3fee08bacbb70bd95ecdfac91417f06f9a07d95c|
| UC-011 |982753a5278bdcb9e0f895d30d1cc274fe2ba80f|
| UC-042 |a8c595676ef0afd54290024c928b7268c49dfbe9|
| UC-044 |6c80417a691b105488b2426c25245ae7f39a33a7|

## Derived original backlog

These actual integration commits independently pass git merge-base --is-ancestor against the planning base, exit0.
The original completion rows are read as delivered outcomes, not as acceptance of other unbuilt use-case branches.

| Done original items | Original record | Main integration |
|---|---|---|
|203,205,206,208,211|04 Review/Items|19f70142b6bf7cea7471f695f56afd24181bc7cc|
|212–218,224,227|05 Review/Items|07b25e4931af719e49311280e2da244888e09111|
|219–223,226,228–231|06 Review/Items|7f646832382c21bb18c778f36245dd527e3fd85c|
|204,210,225,232–236,238,240–242|07 Review/Items|986273393d8842b90a51c1bf156ec57b11da571f|
|243,255,258|08 Review/Items|c04f30d274ab36a3a5072be9c08598a8feb3b4fe|
|207,244,245,259,260,264,265,270,272–274|09 Review/Items and Integration result|40e799b5e2a3dbe38386408113fa7dac69aa5265|
|246,247,252|11 Review/Items|d69931e1ff1487aa430f514ebc87239db10d2b6f|
|209,248–251,253,254,256|12 Review/Items|732aa02cb940446e11b5c16a61962e8ef9d5c956|
|239,271|13 Review rows115–116|9f83fc578b73668ea391a7f9180f3ddffb606c56|
|261,277|14 Review/Items|cc6d4d53b4639e734f25d2a7622c4b74b8c51e1a|
|262,263,275,278|15 Review/Items|439f10a78f33c2239e45219ea353b18bb9f4710a|
|237,266,268,269,276,279–281|16 Review/Items and independent close|af494a49a3a171d987018b6051bcf6404bc152a4|

77 done,257/267 unfinished.208's replaced legacy test delivery is preserved through245, not repeated.
257's original Outcome requires256 and the between-jobs release caller. Sprint12 Unfinished retains that caller,
then waiting for09main;09 has landed. Current dashboard-app.mjs:418 still says release view is not built; built.json
has no release view. The known-positive process-view.mjs:19 public module import validates that source search.
257 is not selected until its separately scoped caller integration; no job-execution requirement is invented.

16's public human notification confirmation and own independent237 gate remain authoritative;41 automated guards
are distinct from human browser acceptance.239/271's Sprint13 delivery replaces their older Sprint07/12 waits.
UC002 retains20 system/22 release plus281 practice path. No duplicate002/047 work or personal-device finding is added.

## Verified working caller and failure nodes

Read the working public settings-view imports and legacy helpers before probing. A read-only Node probe with
constructed values positively allocates40102 after40101 is occupied, generates reverse/forward commands both bound
to127.0.0.1, round-trips a constructed legacy export, saves/reads/lists canonical jump-host and constructs the real
canonical bridgeAt handle. The same probe then observes:

- canonical bridge-client has no allocatePort/tunnelCommands/proxyConfiguration public functions;
- canonical browser-store has no exportSettings/importSettings/readExport public functions;
- canonical writeSetting(remote-session:lab) throws UnknownSetting;
- legacy commands return reverse/forward/url; legacy export keys are format/version/exported/note/settings.

All probe assertions pass. These are known positives before the absence/refusal observations. No endpoint, paid
model, actual SSH, browser, private export or native app was contacted by the planning probe.

Actual path: MOD-desktop-shell.md:103–113 accepts readExport → selected jump-host/session → tunnelCommands → plans;
current src/desktop-shell/compose.mjs:5–7 only serveBridge with jobs. MOD-bridge-client.md:147–161 supplies the missing
pure planner/proxy contract; current index.mjs only exposes BridgeError/bridgeAt/pair/probe. Source281/269/266 delivery
does not implement these functions. Accepted MOD-tunnels.md:49–51 supplies ensureKey; its consumer is shell Start and
UC0446a2; source276 explicitly excludes tunnels/imports. This is necessary unimplemented key work, not a claim that
an absent folder alone diagnoses a bug. Accepted MOD-bridge-http.md:62 supplies GET/v1/tunnels; current protocol.mjs:16
holds only POST probes and server.mjs:32 rejects other non-pair routes. The supplied-handler285 unit slice can start
without automatic SSH state implementation. Delivered server pair/probe is the existing positive route.

Accepted283 export has exact version1 instance/locked/settings/foreign envelope and specified KDF/cipher; every
implemented canonical setting/secret is in scope, remote-session is newly in scope, foreign is empty because no
mailbox sign-in family is implemented in this slice. Existing legacy caller/export remain unchanged and working.
The contract is not broadened into unimplemented mailbox, MSAL, personal-device export or full042 completion.

## Provenance and verification

All-ref source history over bridge-client/browser-store/tunnels/bridge-http yields13 non-merge source commits;
no current/predecessor E source trailer, with positive A/B trailers in42d875b,259c6bd,fcf2d18,fcd7dac and3cf36ad.
Inherited core store is Sonnet-A; current store/client is B, protocol is A, and new key code is unimplemented.
The previously independently read actual-source/caller provenance and merge-parent comparison in the published
Sprint16 aggregate gate remain intact, including E merge50ef591 inheriting identical reviewed endpoint bytes.
E's old test writing is not implementation. Reserve E and recheck every finally exercised source path, including
helpers/predecessors, before its release job. PO authors no implementation or tests.

Bounded validation of the changed planning inputs: tests/test_backlog_item_fields.py, test_backlog_layout.py and
test_origin_links.py run42 tests, OK with1 preserved expected failure. Canonical current order guard
tests/work-plans-backlog-order.test.mjs runs3/3 pass,0fail/skip/TODO/cancel,85.555333ms. Private logs:
/private/tmp/po17-planning-python.log and /private/tmp/po17-planning-node.log. No broad source-suite repetition was
needed for this planning-only diff. Native interaction stays stopped. Final-head CI/source/per-case proofs belong
to the fresh implementation jobs, then independent release/aggregate/closing decisions; none is inferred here.

## Key runtime readiness correction before selection publication

Original tests/desktop-shell.test.mjs:36–54 supplies the approved temporary exact npm acquisition/runtime verification
pattern, blob236527845ec972d94f226f27ee6d08acfc27ee31, actually included in successful closingCI37956741653.
284 follows that pattern only in its new module-named test adapter for ssh2@1.17.0, outside checkout, with ordinary
Node child package resolution; real source calls the real generator and its public-key parsing verifies correspondence.
No fake generator, manual PEM conversion, production temporary path or repository manifest is selected. Package/version
and generation known positive precede interpreting tests-only red; an unavailable package is a tooling failure.
A demonstrated inability to run requires separately scoped between-jobs tooling before implementation.
Primary [ssh2 v1.17.0 README](https://raw.githubusercontent.com/mscdex/ssh2/v1.17.0/README.md), read on2026-10-09,
Generate an SSH key and Utilities, documents utils.generateKeyPairSync('ed25519'), OpenSSH key output and parseKey/
getPublicSSH. This verifies the accepted operation, not new due diligence or actual acquisition already performed.
No native fixture was launched by this planning check. The actual implementation job must establish acquisition.
