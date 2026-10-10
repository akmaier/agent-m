# Public Settings composition diagnosis

**MEASUREMENT**

at: 2026-10-10 16:27–16:30 UTC  
by: developer-terra-c / gpt-5.6-terra  
job: JOB-20261010-1626-c670  
usage: null  
cost: null

## Scope and evidence

This is a diagnosis of public composition head `5c04f43806219898d7838bd9cd9d8fb3225daffe` against base
`8ce84947391d3efeac29859029a0b14f42ccd113`. No source, test, runtime, native, browser, or device probe was run.
The raw own-red CI `38066918009` has 39 ordinary Node failures. Its complete failure blocks were read from
`/private/tmp/root-p19-ci-38066918009-failures.json`; raw Node/Python/checkout/run/jobs were also read. SHA-256:
failures `aabf3006057605d8746305a8cb225699fb58ddb6940c0e133585f4d9ac0ad337`, Node
`bb4c40c22542dd4b808710f5fc279ee335d69d6a5bceaa49d3a067f21c7193fb`, Python
`2ebc35994017a21ddc97014f4da321f4cfa8d02bae31673fa24243e1332156ce`, checkout
`9d7784fa184bfd885bf34c762834159253a1e5d74d7682773f8b4c7b46795630`, run
`c804aa25c65a6cd733500b02b10eda8e41c07b6daa018332a90e4efe3527db60`, jobs
`9ccd7f8cd6cb95d6d957eb126331d85ec655753efa26f963166e5c3c2c8404f4`.

Retained accepted inputs were identity-checked: UC-047 `9c3cf6e0500518f2e8af47f1efc160d351378f21` and
MOD-settings-pages `6357592c6ff7a2dd528ae959c918ad4ec1a903a4`. Composed source evidence: Settings
`773388fc38b25f2418c9df34773e86c760ef8d69`, site-frame `a4c377a9b07d7d328c4dc5ae68dd88efb7e0cac4`, layout test
`c789365d163d3adcc637ddaf9dfade6e707b5090`.

The full composition diff is 22 files, 1,209 additions and 722 deletions: `docs/assets/dashboard-app.mjs`,
`docs/assets/product-store-adapter.mjs`, dashboard bridge/canonical-export/endpoint/notifications/product-store/
public-tabs/review-flows/last-test/shell tests, release ITM280/ITM290, release Sprint01/Sprint02A/Sprint07, release
UC003 dashboard-HTTPS/direct-endpoint, and system UC003 bridge/direct-endpoint plus UC047 tests. Therefore the table
below classifies residual failures against already-adapted composition inputs; it does not assume every failure is an
unchanged old fixture.

## Failure classification

| failure indices | classification | actual failure node and known positive |
|---|---|---|
| 0 | unresolved production/composition | TST-294001 reaches `app-harness.mjs:495 → press` and has no target after the composed route. The raw block proves the missing target, not whether the Bridge or tunnel implementation is defective.|
| 1, 3, 20, 32, 37 | obsolete selector/fixture compatibility | Public HTML has the positive tab `Endpoints & Agents` and its Configure controls; historical assertions look for the old Settings/Repositories pane or an unshown route. These require a compatibility decision in their owning tests/caller, not a Settings source rollback.|
| 2 | obsolete serialized-order expectation | The public export notice contains Endpoint, Bridge, Jump host and Remote session, but in a different delivered order than the regex. Functional secret inventory is positive.|
| 4–19, 24–29 | unresolved composed public behavior | Raw failures are undefined controls, absent old panes, or old storage keys. Their call paths must be checked against the adapter's canonical browser-store migration before changing either behavior or expectations. They include token refusal, product remove/clear, consent, cache and history invariants and must not be weakened wholesale.|
| 21, 22 | unresolved harness/route ownership | A test handler precedence and tunnel pairing separation fail after composition. The blocks do not establish an ITM-290 source defect.|
| 30 | obsolete test implementation | `release-sprint-01-dashboard-app.test.mjs:1071 → folded` throws `Cannot access 'details' before initialization`; this is a test temporal-dead-zone error before a product assertion.|
| 31 | obsolete text serialization expectation | The positive token guidance contains the permissions and reasons; the historical regex expects a different serialized form.|
| 33 | obsolete migration-key fixture | The assertion expects both a legacy and canonical key while actual store has the canonical scoped key only. Branch absence is not evidence of data loss.|
| 34 | selector/text compatibility | Actual result is `Test notification sent.`; expected is `Test notification shown`. The block does not show notification failure.|
| 35 | obsolete shallow disclosure lookup | Current public Notifications details exists in the Usability panel. The historical test's lookup does not follow composed tabs.|
| 36, 38 | unresolved canonical-token migration | Expected legacy instance token is null after public composition. Diagnose adapter migration/read ordering before assigning any production fix.|

Every index 0–38 is represented above: 0; 1/3/20/32/37; 2; 4–19/24–29; 21/22; 30; 31; 33; 34; 35; 36/38. No classification converts a failure into a fixture correction without the named owner and path.

## Layout 115

`release-itm-290-public-settings-layout.test.mjs:92` launches Electron with a `BrowserWindow` that has no width,
so the launcher default is 800px. At `:108–115`, CDP then overrides a requested 390px viewport, while actual document
client/scroll width is 785px and General panel client width is 753px. The test computes `documentOverflow` as
`scrollWidth <= requestedWidth` and `panelOverflow` as `scrollWidth <= clientWidth`: despite their names, `true` means
no overflow. Thus `panelOverflow: true` is consistent with scroll/client 753, but document 785 cannot satisfy the
requested 390 comparison. This is viewport handling in the native harness/launcher measurement, not evidence of CSS
overflow or a Settings panel defect. The no-native-probe limit leaves any CSS conclusion unresolved.

## Recommended bounded follow-up ownership

First repair historical tab/pane and serialized selectors in their own composed-public test owners (1–3, 20, 30–35, 37)
while preserving assertions about tokens, refusal, consent, cache, history and endpoint routing. Diagnose canonical
browser-store read/migration order separately for 4–19, 24–29, 33, 36 and 38. Assign the 294 missing press target to
the composed Bridge route owner after tracing its source composition. Keep direct General endpoints browser-direct and
notification delivery human-confirmed. The conclusions follow one responsibility per file/rule and KISS: compatibility
work does not widen into a Settings behavior rewrite.

## Superseding receipt — 2026-10-10 16:31 UTC

The earlier grouped labels are superseded where they implied causality. The current exact callers were received as
original bodies: `dashboard-public-settings-tabs.test.mjs` blob `53dede8bf967867f9366c01395c7b5504484c8c8`,
`release-sprint-02-a-dashboard-app.test.mjs` `1953ed65cf198c294533d012c72eec42c56fc944`,
`release-sprint-01-dashboard-app.test.mjs` `07bed829677e3b7b93751b68102631e570a7c8a9`,
`release-sprint-02-b-dashboard-app.test.mjs` `215f979558d3e53fafcd7dbaaa5e1bb824b73518`,
TST-294001 `11ddd804e72e425b449ebcfdbd7d5f52918c45f7`, harness `66f735a636eb99cb5f78bfac09f8e548cf729ead`,
and `index.html` `1ee3d993f910accd1ea7281df1cbc0ce20723c37`.

Index32 is **unresolved**, not obsolete: `settingsPanes → page.go('#settings') → main.replaceChildren capture →
pane('Repositories')` fails before the refused-token reload test reaches `githubRow → repositoryControl('test')`.
The intended refusal/top-banner invariant is therefore untested by this failing execution. Index20 likewise requires
its exact missing-view caller before any selector conclusion; it remains unresolved. Index31's setup page contains the
permission explanations, but its `\\w` regex is a serialization mismatch only after an owner confirms the displayed
punctuation; its token-scope invariant remains required. Index33 proves only that the Backlog test expected both legacy
and canonical keys while actual had canonical only; it does not establish whether migration correctly removed or failed
to create the legacy key, so canonical migration ordering is unresolved.

For 294, the raw failure maps `component-itm-294-https-reverse-tunnel.test.mjs:250 → embedded child eval line150 →
app-harness.press:495`; `press` throws only because the script passed `null`. The target expression and its preceding
composed UI lookup must be read by the ITM-294 route owner; this receipt establishes a literal missing target, not the
cause. The test's own counterproof targets proxy upstream replacement separately, so it cannot prove this UI lookup.

For 115, only these observations are established: the test creates a BrowserWindow without width at line92, requests
390 through CDP at lines108–111, and records document client/scroll 785 and General panel client/scroll 753. Its
booleans are inversely named (`<=` means no overflow). CDP mobile metrics may change layout viewport or scale; no
runtime evidence here establishes whether that request took effect, whether the viewport meta source is involved, or
whether CSS contributes. The causal explanation remains **OPEN**; no CSS defect is diagnosed.

## Superseding receipt — 2026-10-10 16:34 UTC

TST-294001 is now proven an obsolete composition fixture hook, with its functional assertion retained. The full worker
body shows the old hook `main.querySelector('[data-settings-section="endpoints"]')` replacing children into `section`;
the current dispatcher `docs/assets/dashboard-app.mjs:509–524` instead calls `settings.render(main(), context, {})`.
It never queries that data attribute, so `section` remains `[]`, `section[0]` is **undefined**, and
`app-harness.press(server, undefined)` rejects at `:495` (`if (!el)`). Before that old hook, the same worker's signed
authentication, reverse-forward, foreign/allowed preflight, login refusal, and refused Bridge-token checks passed.
The index3 TST-290 case itself fails its `Endpoints &amp; Agents` serialization regex, but its raw HTML positively contains
the four tabs and Configure control. The wholly passing public positive is TST-290114, which captures the mounted four
tabs and the unique Settings control. Thus only the old capture hook is obsolete; endpoint-through-HTTPS and
direct-endpoint assertions remain required. The component test belongs to its original A scope, not a tunnel source defect.

Residual raw paths are narrower than the earlier migration grouping: index8 reaches product Remove at
`dashboard-review-flows.test.mjs:866` then reports list count `1 !== 0`; index15 reaches Clear at
`dashboard-review-flows.test.mjs:1047` then reports kept-file-text count `1 !== 0`; index14 reaches
`settings.mjs:579 → Array.from(undefined)` against its fixture writers; index19 at
`dashboard-settings-last-test.test.mjs:257` has no working remote-session last-test outcome. Each is an actual
behavior/fixture-interface question at its named node and must be diagnosed independently.
Index20 is a serialization selector: its expected `Endpoints &amp; Agents` differs from positive fake mounted HTML
`Endpoints & Agents`; no missing-view product defect is established. Index21 expects `will be published` after a custom
`private:false` Settings context but actual public HTML has the current pseudonymisation/public disclosure; its notice
placement semantics need its owning test/context review before any source conclusion.
