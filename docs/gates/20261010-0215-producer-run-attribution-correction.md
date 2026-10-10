# Producer gate evidence: run attribution correction

**MEASUREMENT**

Recorded by po-sol / gpt-6.1-sol at 2026-10-10 02:15:56 UTC under
JOB-20261010-0201-p19producers, Agent M unreleased, published commit
`048d6ebfffc1dfb01e8a8d2998c1f33f22c0af7a`; usage/cost null/null.

This appended record corrects the sentence beginning “The retained source291 run has positive native app”
in `20261010-0212-fixture-a3104f2-hold.md`. That sentence conflates evidence from two different runs.
The original gate records, private byte-identical bodies and immutable inventories are retained unchanged.

Source291 run38014415911 on head `6492d27330aef05d1d0d5f28522b3f4ef2fa083a`, checkout13e753e,
contains positive native app cases TST-276001–TST-276006 and the six new291 cases TST-291001–TST-291006.
Its four older Node fixture files fail, and native release case TST-276901 times out; its complete Node outcome
is five failures. Raw evidence remains `/private/tmp/root-p19-ci-38014415911.log`.

The cited public Node positives TST-266001/TST-266002/TST-268901/TST-269901 belong to Store
run38015415729 on head `00b218d7ec50effabcc2578db82b434952be5326`, checkout
`0db74c5a215164f14b821e88c57ce9c5d3f890ac`, whose complete CI is green.
Its raw log remains `/private/tmp/root-p19-ci-38015415729.log`, SHA256
`15e1c62ca3dfe43072c815510444b8cd60fb52c0adda8ea7bb9baf82d6f5bc95`.
Those positives do not establish that the older Node fixtures passed on source291's649 combination.

This attribution correction changes neither the exact Store00b218d PASS nor the exact fixturea3104f2 HOLD.
The latter remains blocked by its own failing run38015445531. No later head is reviewed or approved here.
This is a document-only clarification of existing evidence; no new checks, execution, scope expansion,
publication or merge occurred. Private correction body is byte-identical at
`/private/tmp/po-p19-run-attribution-correction-body.md`.
