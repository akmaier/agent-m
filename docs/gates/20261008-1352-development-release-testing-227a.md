# Development → Release testing — PR227

**REGISTER**

Decision: **REJECTED** at d31d34b90ca1192e0861eadcb4a2b98a234ad7d0 into sprint/15.
Participant: po-sol; model: gpt-6.1-sol. Taken: 2026-10-08 13:43:49 UTC. Decision: 2026-10-08 13:52 UTC.
Job: JOB-20261008-1343-896a; originating JOB-20261008-1322-3e58, review round 1 of fixed limit 3.
PR: https://github.com/akmaier/agent-m/pull/227

## Original scope and provenance

Original AGENTS/SPEC readings remain pinned at 7e8f20ca35cd48a5250d143b07a469d46986f123 and
1de56e76de63bfe5f3f4bb98820adad801041def. Current item275, Sprint15, both jobs, Team2 process/participants,
pinned scrum-wip, UC003/044 and affected accepted architecture originals were reviewed, together with the complete
five-file diff, existing callers and tests. MOD-site-frame remains 4349b0b66830d8f07fab12616677cbfd86ef61a3;
ARC038 remains 1a583b96fa01cb37f2d277bd70036ce60dfdef83. No artifact acceptance is made here.

C's ordinary commits name unreleased, developer-terra-c and gpt-5.6-terra. First tests-only
4fc12f3f7ba435d552b4dbac953508110858d0f4 precedes production d31d34b. Actual red CI37784706813 fails the absent
public identifier/frame exports and pairing explanation before production. Final changes are only owned
src/identifiers/index.mjs, src/site-frame/index.mjs, explanations.md and their two module-named tests.
Old assertions, schemaForm, existing explanation behavior, helpers, SPEC/UC/architecture and PageSetup are preserved.
I implemented none of this behavior and am a different participant/model; E remains independent for release tests.

## Closed acceptance and executed counterproofs

Public instanceOf delegates to pure instanceOfPagesAddress, with upstream fallback. Actual startPage uses real
openStore and connect/parseAddress for the Pages instance, supplies product:null and the original ViewContext,
renders supplied routes, and responds to go/hash navigation. It starts no job-runner, watcher or repository write.
Notices display supplied text/link; confirmations resolve from the person's actual cancel/confirm clicks and reason.
The pairing explanation uses the existing public renderer. These bounded paths and old tests pass.

Disposable exact-head archive: /private/tmp/po-sol-227-skywzhod. Each new CASE was independently executed positive,
then with its relevant fault, then after exact restoration. proofs.json and individual logs preserve the commands/results.

| Case | Fault → actual assertion failure node | Exit positive/fault/restored |
|---|---|---|
| Pages identifier | Return null → identifiers-kind.test.mjs:72, null versus alice/research-agent | 0/1/0 |
| Bridge start | Wrong header title → site-frame.test.mjs:664, title mismatch | 0/1/0 |
| Instance fallback | Wrong fallback → site-frame.test.mjs:695, wrong/instance versus akmaier/agent-m | 0/1/0 |
| Notice/decision | Wrong supplied notice link label → site-frame.test.mjs:713, Details versus Learn about pairing | 0/1/0 |
| Pairing explanation | Corrupt supplied explanation → site-frame.test.mjs:747, required phrase absent | 0/1/0 |

Final restored related run: 22 tests pass, zero failures. All five changed files compare byte-identically with the exact
head; no mutant is committed. Restored index SHA25672057a0c0844f22dd83b4f6b12b669ae00995811a23c15bbb2c75334aec50dd0.

## One remaining original-contract finding

Item275 Outcome requires drawing the shared header/look. Accepted MOD-site-frame:48 and 68–71 assigns the lab
look/logo to this module; ARC038 requires the shared Bridge frame/look. SPEC:879–883 requires the lab look and PRL logo.

Failure path: src/site-frame/index.mjs:130 startPage →139–142 constructs a header with only an h1 →147 replaces
body with that header. Actual header is `<h1>Agent M Bridge</h1>`, class site-frame-header, with zero logo images.
Expected is the accepted shared lab header/look. Existing working docs/index.html:11 loads src/theme/lme.css;
its header at16 and PRL image at21 are the known positive. That existing stylesheet styles .site-header, while the
new frame uses a different class and supplies no shared styling integration.

Controlled header-probe-restored.log imports the existing unit DOM, first proves the same DOM/query finds the PRL
image in the working header, then calls actual public startPage and records the text-only header, zero logo images
and zero stylesheet links. The unit's current title assertion at664 still passes this incomplete header. This is an
original accepted scope gap, not a requirement for main/review menus, a product selector or a job runner.

Correct the shared header/look within the accepted module scope through an ordinary commit and guard its required
presence meaningfully. Preserve the history and fixed limit; 276 remains waiting for independently approved275 merge.

## Exact live CI and disposition

Live PR head and CI37786107013 independently re-read unchanged: Node113341149792 SUCCESS,975 tests,967 pass,
zero failures,eight TODO,zero skips; Python113341149575 SUCCESS,397 tests run,OK,five skips,six expected failures.
Current PR body contains all five author counterproofs. Green CI does not close the concrete shared-header finding.
Development → Release testing is rejected solely for that finding. No source/test/job edit, push or merge by this reviewer.
