# Selected290 independent producer readiness

**MEASUREMENT**

Observed by po-sol / gpt-6.1-sol under JOB-20261010-0121-p19check at 2026-10-10 01:30:14 UTC.
Original published main: 0ecef7c; Taken 2026-10-10 01:27:44 UTC before fresh
.agent/worktrees/agent-po-sol-check-19 / codex/p19-check. Usage/cost: null/null.
Method: personally read complete original AGENTS/SPEC/README/Team2 declaration, participants, scrum-wip,
Sprint19/item290/readiness and affected accepted modules/use cases, then inspected actual producer imports,
caller interfaces and current published source/test jobs. No source/test/accepted-document change or local full/native run.

SPEC §13 A RUN FOLLOWS THE MODULES' INTERFACES says: “Within a run, a module is implemented only after every module
whose interfaces it uses.” Its check explicitly places independent D alongside A → B → C. UC032 orders by interfaces;
the textbook ch7 Scrum passage identifies artifacts as the synchronization mechanism and permits execution-plan adaptation.
MOD-browser-store Uses says: “It uses no other module.” Its accepted blob is058fd3b05cc14cb361575f16a2059f174417e8ac.
MOD-personal-data's settingsSchemas uses MOD-documents.loadSchema, not browser-store; accepted blob
4daf5fb0befa4c06f11fac61b11e04c757ef4ed9. MOD-settings-pages uses BOTH producers; its full consumer still waits for both.

Failure path: docs/backlog/sprints/19.md producer paragraph → “After that separate delivered job” → D's next browser-store
Start delayed behind personal-data source and independent release delivery → E's reserved290 release authoring delayed by
E's active257 job (JOB-20261010-0054-e19flow). Actual personal-data source df8 waits for separate PR282 registration;
CI38011975473 identifies the existing check registration failure, not a browser-store dependency. At the dependency node,
browser-store/index.mjs imports only ./catalogue.mjs and ./store.mjs and reexports ./export.mjs; export.mjs imports only
those same own-folder files. The accepted Uses is the positive authority, corroborated by actual import paths. Browser-store's
index explicitly states clearEverything/secretValues unbuilt while exposing working read/write/list/export functions.
No speculative missing interface or new architecture is inferred.

Decision: remove only the unnecessary producer delivery barrier. Root may issue a NEW browser-store Start/fresh isolation
after D's prior active source writing turn ends, without waiting for personal-data's check/source/release delivery.
D never has two writing contexts. Both producer jobs still require tests-only first actual product-red CI, owned source,
relevant same-case counter-proofs and independent exact source/release gates. B's full Settings consumer waits for both
producers' required delivery; later public caller and actual Linux narrow/desktop layout remain required. E's257 and later
independent releases stay sequential. No independent release/source requirement is waived or reassigned here.

Only docs/backlog/sprints/19.md changes as the current plan; this new dated measurement accompanies it and leaves the
2026-10-10-settings290-readiness original untouched. Selection290/291/292/257, WIP4 including waiting review, root plus
max3 active children and all accepted contracts/process/model/participants/DoD remain unchanged. This decision does not
start a source job itself, complete290/003/002/047, close a sprint, tag/release/deploy or perform human acceptance.
Full read pins, immutable raw evidence and actual receipt hashes: /private/tmp/po-sol-p19check-inventory.json.
