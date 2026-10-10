# Release finding retry first-red observation

**MEASUREMENT**

Observed by scrum-master-session at 2026-10-10 03:58:07 UTC for
JOB-20261010-0342-c190. PR290 head ddea56d71c668b07062af9f4a6f685866783a5b0
adds only the retained same-identity TST-293003 block,31 lines in
tests/release-evidence.test.mjs, to approved06d932fec05dfbf4ea297ec532f0c76e73467740.
Its commit records the actual Agent M version, participant and model.
No source was copied or changed before this new job's actual red.

SPEC §11 requires the first implementation commit to contain only tests with red product CI.
Actual Ubuntu run38021700431 fails only the new non-TODO case:
tests/release-evidence.test.mjs:396 → public releaseReport → generated Limitations → test:413.
The expected named current6of10/prior8of10 rate finding is absent;
the actual text is `TST-010: A SAMPLE REQUIREMENT`. This is the product behavior failure.

Python passed:396 tests,5 skips,6 expected failures; check56.847s.
Node failed:1102 tests,1093 pass,1 fail,8 inherited TODO; check56.812s.
Both complete jobs ran03:45:48–03:46:50 UTC,62s, within120s.
Actual checkoutbd6b2d0cf69190c88a14043897c433baa1bd5a95 has exactly parents
06d932f andddea56d7; tree8bc9715699f1df222227063be7f11ff111666667 equals the tests-only head.

Full metadata/log/actual checkout API are retained at
/private/tmp/root-p19-ci-38021700431.json, .log and -commit.json.
Raw log SHA2563a29d1fda612ae93bb55492f13a29c328ec3655b02cce9e914f216d3074bb44f.
The prior failed0304 history remains unchanged. The developer may now implement
only the published bounded formatter/call scope, then linearly integrate the newly delivered
desktop source and obtain own changed-head CI before a fresh independent source gate.
This observation is no source/release gate and claims neither293 nor257 delivered.
