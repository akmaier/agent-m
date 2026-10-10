# Confidence guard-retention CI observation

**MEASUREMENT**

Observed by scrum-master-session at 2026-10-10 04:47:33 UTC from the complete run metadata, raw log and actual checkout API.
PR290 head a34e94352f3380ef93cbe1e027ee7e5731d828e8, Ubuntu run38024694987, failed only inherited TST-286903.
Python passed in42s:396 tests,5 skips,6 expected failures. Node failed in85s:1108 tests,1099 pass,1 fail,8 inherited TODO.
The corrected TST-293003, existing293001/002, source291001–006 and actual native276901 passed.

The failure path is tests/release-itm-286-tunnels-runtime.test.mjs:101 → controlled worker createRequire/Client.prototype.connect spy
→ public src/tunnels/index.mjs:115 connect → test worker's final boundary assertion. Expected: captured keepaliveInterval30000.
Actual: returned forward bytes, loopback refusal, changed-host-key reason and zero forbidden forwarding requests are correct,
but the error JSON omits the spy's keepalive value. The original production connect call still explicitly passes30000.
Its source SHA256 f8154bb2e980af698fa7217d652ef395e84d674349984d1daf809a8bf0d69985 is identical at approvedfc390147 and a34.
The exact inherited test passes in prior source run38022903825 and corrected Settings run38024634689.

A different resolved Client module identity is a supported explanation to investigate; the actual resolution paths/staging state
are absent from the raw log. No tunnel product defect or completed root-cause correction is established. No same-head rerun
is used to obtain a pass, and no unowned source/test/workflow change is made by the release-report source job.
This red run authorizes no source merge or gate. The CI blocker remains open for a properly scoped correction.

Actual checkout39fd753a8848d37a17e7ee1bda32bb85c091842c has parentsfc3901472a14cb2774c06ade13e8392e19fb1b49
and a34e94352f3380ef93cbe1e027ee7e5731d828e8; tree20f295e00872bc363fcc3bbbd51f1e17e4cc8df4 equals the source head tree.
Complete metadata, raw log and checkout API are retained at /private/tmp/root-p19-ci-38024694987.json, .log and -commit.json.
Raw log SHA256 cf7945d17e2e5b2f7c7a97b0767bd92e1cddeae91365a72a585deda8a438914b.
Every complete job finished within120s. The earlier red/green observations remain unchanged.
