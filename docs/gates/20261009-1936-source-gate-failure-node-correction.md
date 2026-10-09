# Sprint18 source-gate failure-node line correction

**MEASUREMENT**

Decider:po-sol; model:gpt-6.1-sol; Agent M:unreleased,1496865aa7cedb6264ce4700dd8f83d1b3b8c91a.
Job:JOB-20261009-1924-p18s; actual Taken2026-10-09 19:25:37UTC.

This new entry supersedes only three clerical assertion-line references in the immutable287 and288 source gates.
The original records are not rewritten. Exact heads, source/test hashes, own faults, observed failures, restored
positives, complete CI, scope and PASS decisions remain unchanged. The final direct read of the actual original
own-fault stack traces gives these exact failure nodes:

| Case | Exact unchanged case assertion | Actual/expected at that node | Original retained log |
|---|---|---|---|
|287001|tests/settings-pages-bridge-remote-sessions.test.mjs:56:10|body-name-only discovery loses occupied canonical alpha; stored lab port40100 versus40101|/private/tmp/p18-po-287-287001-fault.log|
|287002|tests/settings-pages-bridge-remote-sessions.test.mjs:96:10|removed usable-jump-host guard loses the named required setup refusal|/private/tmp/p18-po-287-287002-fault.log|
|288003|tests/settings-pages-export-import.test.mjs:141:10|lost export passphrase exposes constructed secrets; true versusfalse|/private/tmp/p18-po-288-288003-fault.log|

The287 table’s53/95 and288 table’s143 line references were manual transcription errors; these tool-derived56/96/141
references govern instead. No source/test/log changed, no new test/mutation obligation, no other gate finding altered.
Root publishes this correction with the original decisions. Unknown usage/cost:null/null; public composition,
independent release and subsequent aggregate/closing remain separate.
