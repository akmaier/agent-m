# Settings and independent desktop release CI observations

**MEASUREMENT**

Observed by scrum-master-session at2026-10-10 04:28:29 UTC. These are actual changed-head Ubuntu outcomes, not source/release gate decisions or item completion.

## Settings source

PR289 headbc45331f7da27c007c5b46d8310b1eea1cfa11f7, run38023949256, failed only inherited release TST-288901.
The existing public export fixture includes catalogue-known `gitlab-token:g/p`. The path is
release-itm-288-settings-export.test.mjs:30 → public Settings.render:596 → repositoryLine:254 → repositoryAddress:328
→ parseAddress:46. Expected: the Settings/export page remains available. Actual: address parsing throws before export can be used.
The approved desktop-release branch's unchanged Settings source passed that same inherited case in run38023974222.
The correction must preserve the existing case and gracefully show/recover a malformed stored address rather than hide the page.

Python passed in62s:396 tests,5 skips,6 expected failures. Node failed in61s:1112 tests,1103 pass,1 fail,8 inherited TODO.
Actual checkout05774fe7ab7d6ecab0a9514fce0b034d128db99a has parentsfc390147 andbc45331; its treec64566385550e3a20755386118f7607aeb8b9b7e equals the source head tree.
Complete metadata/raw log/checkout API remain at/private/tmp/root-p19-ci-38023949256.json, .log, and -commit.json.
Raw log SHA2566c5bdaf50004c2400f321b6325cde2c0f38ef016bd98e62c778819a3bbd317a3.

## Independent desktop release test

PR291 head9f431a694f7cbf09322ac95f808f8afbd9ec81c1, run38023974222, failed only new release TST-291901.
Its actual public import/private-settings/key/loopback-tunnel assertions completed before its counterproof wrapper.
The wrapper's child executions returned0 with empty stdout and a recursive node:test warning that files were skipped.
The path is release-itm-291-desktop-shell.test.mjs:106 → spawnSync child node --test → inherited parent test-runner context
→ skipped child cases → wrapper:113 rejects the zero fault status. Neither child is a genuine fault or restoration test result.
The correction stays in the independent test's child-launch environment; no product defect is established by this harness failure.

Python passed in54s:396 tests,5 skips,6 expected failures. Node failed in65s:1108 tests,1099 pass,1 fail,8 inherited TODO.
Actual checkoutf7e1cbe8c67b2f8110422e4fba569cc04e4db439 has parentsfc390147 and9f431a6; its tree9d9b3dac0126a71c27f55fce285496ed079d52a1 equals the test head tree.
Complete metadata/raw log/checkout API remain at/private/tmp/root-p19-ci-38023974222.json, .log, and -commit.json.
Raw log SHA25682804c14e439a46064bce12772aae359f626682e66a8b1b1a7db8d39202ce5c1.

Every complete job finished within120s. Both runs preserve source291001–006 and actual native276901 positives.
No same-head rerun, weakened inherited expectation, native Mac interaction, system-setting change or whole-use-case completion is recorded.
