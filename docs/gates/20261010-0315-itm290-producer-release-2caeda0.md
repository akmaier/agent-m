---
gate: Release testing → Sprint review
job: JOB-20261010-0256-p19release290producers
decider: po-sol
role: Product Owner
decision: passed
on:
  - 2caeda0bb21f4be6e6a2468dfef0963896f8ab95
date: 2026-10-10 03:15:53 UTC
---
# ITM-290 bounded producer release gate — PR287

**MEASUREMENT**

PASS ONLY PR287 head2caeda0bb21f4be6e6a2468dfef0963896f8ab95 into approved
31995b6fba2258cd49dcd4da33937b044ec5406b. This permits root's exact producer release merge and is a
prerequisite for B's fresh Settings consumer. It does not deliver ITM290 or a whole use case.
Original queued Start02:56:55 UTC was read on published main0ee8af554d00c1caa34c29c84b4290754b741105
before actual clock Taken03:05:36 UTC and fresh agent-po-sol-release290-producers-19 /
codex/p19-release290-producers isolation. Decider po-sol / gpt-6.1-sol; usage/cost:null/null.

Applicable original SPEC §12 lines1418–1422 says “A test of level `release` is generated or written by a
participant other than the one that implemented the behaviour it tests.” Its new-test rule requires a recorded
production fault and the failing test result. SPEC §13 lines1599–1602 says “A gate's decision recorded by the
participant that did the work the gate checks does not pass it.” SPEC §12 lines1440–1443 requires every CI job
to finish within two minutes. AGENTS §6a requires reading the working caller and quoting applicable originals.
Original Team2 scrum-wip assigns this gate to the Product Owner; its declared DoD adds no condition.

I retained previously personally read full originals only after exact blob/hash verification: AGENTS, SPEC,
README, Team2 process/participants/model/current plan/items, accepted affected UC003/042/047 and
MOD-personal-data/browser-store/documents, source contracts and approvals. Current source/caller originals,
same-guard test cases and the complete97-line PR diff were read. The inventory contains311 retained original
pins,50 current same-guard test file pins and the original case blocks. The diff adds only
tests/release-itm-290-producers.test.mjs; all159 production source files match the approved base byte-for-byte.

Public failure-node paths and supported outcomes:

- TST-290105 at test:20 → settingsSchemas in personal-data/index.mjs:28 → Documents schemas/readDocument/
  writeDocument → pseudonymisationOf:36. Canonical docs/settings.md preserves unrelated text; missing/on is on,
  explicit off is off. Replacing the production return with unconditional off fails the SAME case at test:33,
  expected on/actual off; exact restoration passes it.
- TST-290106 at test:40 → settingsSchemas → collaborators.schema.md → Documents readRegister/writeDocument.
  Name/Account/Agreed yes and unrelated content round-trip. Changing affirmative enum yes to no fails the SAME
  case at test:52 through Documents' value validation; exact schema restoration passes it.
- TST-290107 at test:57 → public clearEverything → raw storage backward iteration/prefix removal. Canonical,
  unknown and malformed own-prefix entries disappear; another instance and unrelated browser keys survive.
  Replacing its removal predicate with false fails the SAME case at test:69, expected null/actual retained token;
  exact source restoration passes it.
- TST-290108 at test:75 → public secretValues → implemented catalogue → string credential extraction.
  Tokens/keys/passwords are returned, metadata excluded, including string login and the nested login.password
  actually written by settings-pages/bridge.mjs:196. Replacing the whole jump-host extraction with null omits
  BOTH login shapes; the SAME case fails at test:92 and exact restoration passes it.

All eight original fault/restored raw records and adjacent full streams were read and rehashed. They contain
actual argv/cwd/start/end/status and original/fault/restored source/test pins. Actual fault failures at02:36:01–26
and restored SAME-case successes are retained unchanged. Test SHA256fca7b9ff6d3cee80762d22347365d48603f1e7ed5ed602c16441df6a3578af24
is unchanged throughout. Newly handed-off exact original substitutions and retained backups were read; my readonly
reconstruction reproduces all four fault hashes and proves each backup equals exact2ca source bytes. No rerun or
source write occurred. The four-case final suite02:42:30 UTC is status0, four pass/zero fail with full streams.

Original0232's asserted Taken02:33:08 has no clock receipt and was explicitly withdrawn; its old manifest remains
immutable and is not an actual measurement. Fresh0239 published Start29255a4 precedes retained actual UTC
Taken02:42:06 and initial worktree reflog02:42:12. Current2ca manifest, root36-artifact inventory and canonical
current trace are separately retained. Earlier97 green38018081270 is historical, not this decision's CI basis.

E/developer-terra-e's whole guarded prerequisite/caller history and predecessor SonnetE history were reviewed,
including303 actual guarded commit objects and the previously read broader386-commit history. Actual commit
parents, rather than path-rewritten log parents, govern the proof. E's predecessor50ef591 has no novel guarded
production blob: all18 present current producer/Documents/text/caller paths are inherited from actual parents
d9e0133678306877a41b3642e32938cabe03c9ac and4b39fc344b0217597506851fbb81141a9a61be3b.
Personal producers are D/df8→31c; Store producer is D/70e5→00; consumed Documents/text histories identify other
participants. E wrote these release tests, not their guarded behavior. po-sol/predecessor po-opus did not implement
that behavior. Actual source tests-only reds and separate source gates are retained; no new first-red obligation
or per-assertion fault quota is invented for this tests-only handoff.

Actual live PR287 remains OPEN at the exact pair. Its own complete changed Ubuntu CI38018528426 is SUCCESS:
Node02:52:08–02:53:19,71s,1101 total/1093 pass/zero fail/8 inherited TODO; Python02:52:09–02:52:59,50s,
396 tests/5 skips/6 expected failures. Both jobs checked out4b0191ab3ed72fb5440ee04270bd92135c18f67a.
Actual live API parents are319+2ca and tree421b936363ba40acccb949e552d9e15729dbcfc1 equals the head tree.
Own-head run lookup has one completed success and no same-head flip. New105–108, inherited101–104,
276 native/public and291 integration outcomes,292012–019 and public canonical fixtures pass on THIS run.
R2/R3/A3/A4 and two batteries' G1/G2 remain the eight TODO limitations; earlier a310 red/HOLD and its separate
run-attribution correction are unchanged.

Real current testDeclarations/traceGraph/tracesTo reads569 paths with known positives, no unread paths or duplicate
IDs, exact SPEC/test/test-set pins, release/module/given/input/expect and correct four requirement traces. Public
report.mjs uses these same interfaces. Notifications and browser-direct endpoints preserve existing behavior.
Legacy bullet/date adaptation, mailbox/MSAL, strategies/scanner, full Settings/public caller/layout and whole290
remain outside this delivery. No source/test/accepted artifact/process/model/participant/DoD/backlog/selection edit,
publication/merge/child, local full/native/UI/device/system/personal/SSH/paid execution or human acceptance occurred.

Complete immutable input inventory: /private/tmp/po-p19-release290-producers/input-inventory.json,309 artifacts,
SHA25616bb849f875721b30bcfecf94fe32c273530a16e1f86dfc91046ef8422fcc5db.
Full delivery diff and byte-identical private body accompany this document; delivery inventory records their hashes.
