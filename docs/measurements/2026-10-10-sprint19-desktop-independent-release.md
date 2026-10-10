# Independent desktop release CI

**MEASUREMENT**

Observed by scrum-master-session at 2026-10-10 05:02:15 UTC from complete Ubuntu CI metadata, raw log and checkout API.
PR291 exact test-only head57d85275ea185a630f9de6a11464337376d16ddf ran38025539396 successfully on approvedfc390147.
Python finished in66s:396 tests total,5 skipped,6 expected failures. Node finished in83s:1108 tests total,1100 pass,0 fail,8 inherited TODO.
All complete jobs satisfy120s. Existing source291001–006, inherited286903 and actual native276901 passed.
The different-head confidence CI failure remains recorded separately; this observation erases none of its evidence.

TST-291901 exercises public exportSettings → desktop takeExport/loadSettings → production compose → own key and real
controlled loopback SSH tunnel runtime. It retains the private local port/pause state, excludes actual browser credential
shapes, and selects one named reverse plan with this Bridge's own key. All source code is unchanged by this test-only PR.

The recorded production fault at src/desktop-shell/settings.mjs:60 changes the own-versus-remote direction selector to forward.
The same original test's plan assertion at tests/release-itm-291-desktop-shell.test.mjs:85 then fails with actualforward/expectedreverse.
Fault interval04:52:53.235–04:52:53.948 UTC, status1; exact restoration04:52:53.948–04:52:54.693 UTC, status0.
Both children execute exactly the same one TST-291901; no launcher error or signal occurred. The corrected child environment
removes inherited NODE_TEST_CONTEXT so the children execute rather than skip. The prior skipped-child failure is preserved.
Original/restored source SHA2567616865c01d349849f54fbcf55bf7c379caeaf420de8898b912028868f0b624c;
faulted sourcef1be1264866ef49d629c6546cac3ab9202dc2465826f40b02d62c4f2b60e3051;
unchanged testca6535ce5d688531cd421987f223d18c6622ae5b4d1f753064d230cc9a16d58f.

Actual checkout23b19514beccc5ff02c371a196b46e07203aa950 has parentsfc3901472a14cb2774c06ade13e8392e19fb1b49
and57d85275ea185a630f9de6a11464337376d16ddf; treeac30ab66ac613c284027e5fc90dfaea35bd9df33 equals the test head tree.
Complete raw/meta/API remain at /private/tmp/root-p19-ci-38025539396.log, .json and -commit.json.
Raw log SHA256582f13d28d3cd159e18fc38090ff78bfdff54346d6f65c5bfaaae5a8c001601b.
The full derived receipt is /private/tmp/root-p19-ci-38025539396-counterproof.json. Its only transformation is Node TAP
comment unescaping of paired backslash/backslash and backslash/hash, verified by a known-positive JSON roundtrip;
original raw bytes remain unchanged. It retains full actual argv/cwd/environment/times/status/hashes/child stdout and stderr.

The actual whole-tree public declaration/trace record at /private/tmp/root-p19-e57-fulltestset-trace.json covers571 test paths,
175 declarations, duplicateIds[] and unread[], with one valid901 and non-null given/input/expect. The replacement author
completed its individually received originals and15 same-guard plus four earlier truncated files before final current review.
Its original job Taken is not a captured replacement read-start. These are test observations; independent release approval,
actual merge, aggregate and closing decisions remain separate. No whole UC003 delivery, signature, trusted HTTPS,
current-browser certification, human acceptance, notification rerun or personal device interaction is claimed.
