---
commit: cbe48ce8d02c077c16be06b37a15ac60bd7c02b4
levels:
  - unit
  - component
  - system
  - release
occasion: pull-request
participant: GitHub Actions Ubuntu runner
date: 2026-10-10T21:21:16Z
run: https://github.com/akmaier/agent-m/actions/runs/38087293940
---
## Outcomes

| Test | Level | Outcome | Runs |
|---|---|---|---|
| statuses — the status of a use case, a decision and a module that are open, accepted and changed, each with its kind | unit | undeclared | |
| approvalSchema — a record is read by its schema, as MOD-documents' readDocument gives it | unit | undeclared | |
| ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names | unit | undeclared | |
| parseArchitecture — a decision: id, title, forced_by, and its four sections | unit | undeclared | |
| parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described | unit | undeclared | |
| specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement | unit | undeclared | |
| module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code | unit | undeclared | |
| AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after | unit | undeclared | |
| AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first | unit | undeclared | |
| AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so | unit | undeclared | |
| ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained | component | undeclared | |
| the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases | component | undeclared | |
| STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count | unit | undeclared | |
| ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted | unit | undeclared | |
| saveFile — a file saved on the blob it was opened on, in one commit on the default branch | unit | undeclared | |
| saveFile — a file that changed meanwhile is refused with its current text, and nothing is written | unit | undeclared | |
| reviewLayoutCommit — a product without any of the layout gets every part, in one commit on its default branch | unit | undeclared | |
| reviewLayoutCommit — a product with part of the layout gets only the missing parts | unit | undeclared | |
| reviewLayoutCommit — a product with the complete layout gets no commit | unit | undeclared | |
| reviewLayoutCommit — a refused write is named as the host names it, and nothing is written | unit | undeclared | |
| reviewLayoutCommit — takes the host alone | unit | undeclared | |
| reviewLayoutCommit — returns the commit's sha and url as the host's commitFiles returns them, with the parts written | unit | undeclared | |
| reviewLayoutCommit — the commit's message names no one | unit | undeclared | |
| formatChecks knows the five kinds, and refuses another by naming them | unit | undeclared | |
| a complete artifact of every kind yields no finding | unit | undeclared | |
| one call runs every check of its kind — the same findings as the single checks, nothing left out | unit | undeclared | |
| a requirement: each broken field, check, source, statement and name is one finding at its line | unit | undeclared | |
| a use case: the identifier it was opened with is kept, beside every check of useCaseProblems | unit | undeclared | |
| a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line | unit | undeclared | |
| a test: its level, its module, what it guards and its case identifiers are each one finding | unit | undeclared | |
| a group file: each finding names the group file, at the line of the group file | unit | undeclared | |
| A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form | unit | undeclared | |
| one shape in every check of MOD-artifacts — fix, never correction | unit | undeclared | |
| every use case and group file of this repository passes formatChecks | unit | undeclared | |
| every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none | unit | undeclared | |
| A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction | unit | undeclared | |
| the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked | unit | undeclared | |
| parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram | unit | undeclared | |
| every use case of this repository passes the dashboard's reader | unit | undeclared | |
| the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository | unit | undeclared | |
| TST-282001 | unit | passed | |
| TST-282002 | unit | passed | |
| TST-282003 | unit | passed | |
| TST-263001 | unit | passed | |
| TST-263002 | unit | passed | |
| TST-263003 | unit | passed | |
| TST-263004 | unit | passed | |
| TST-263005 | unit | passed | |
| TST-263006 | unit | passed | |
| TST-263007 | unit | passed | |
| TST-263008 | unit | passed | |
| TST-261001 | unit | passed | |
| TST-261010 | unit | passed | |
| TST-261002 | unit | passed | |
| TST-261003 | unit | passed | |
| TST-261011 | unit | passed | |
| TST-261004 | unit | passed | |
| TST-261005 | unit | passed | |
| TST-261006 | unit | passed | |
| TST-261007 | unit | passed | |
| TST-261008 | unit | passed | |
| TST-261009 | unit | passed | |
| TST-262 | unit | passed | |
| TST-285001 | unit | passed | |
| TST-285002 | unit | passed | |
| TST-285003 | unit | passed | |
| TST-285004 | unit | passed | |
| TST-285005 | unit | passed | |
| TST-285006 | unit | passed | |
| TST-290103 | unit | passed | |
| TST-290104 | unit | passed | |
| an endpoint survives reopening the same instance store | unit | undeclared | |
| an endpoint without a key is stored unchanged | unit | undeclared | |
| a refused endpoint key changes only when the author explicitly writes a replacement | unit | undeclared | |
| clearing an endpoint removes its actual localStorage entry | unit | undeclared | |
| instance prefixes isolate endpoint and pairing settings | unit | undeclared | |
| TST-279 | unit | passed | |
| TST-283001 | unit | passed | |
| TST-283002 | unit | passed | |
| TST-283003 | unit | passed | |
| TST-283004 | unit | passed | |
| TST-272 | unit | passed | |
| TST-273 | unit | passed | |
| TST-274 | unit | passed | |
| TST-275 | unit | passed | |
| writeSetting/readSetting keep this item's catalogue keys in localStorage, under the instance's prefix, and set no cookie | unit | undeclared | |
| clearSetting removes each catalogue key from localStorage itself, not only from readSetting's answer | unit | undeclared | |
| writeSetting refuses a key outside the catalogue with UnknownSetting | unit | undeclared | |
| openStore throws StorageUnavailable where localStorage refuses to store anything | unit | undeclared | |
| writeSetting throws StorageUnavailable where localStorage refuses the write after the store was opened | unit | undeclared | |
| the running sprint's board: in progress with the open pull request and who opened it, done with the merged one and when, waiting for acceptance, ready | component | undeclared | |
| counter-proofs: a pull request naming no item changes no state; one merged into another base than the sprint branch is not done for the sprint | component | undeclared | |
| below the limit no ready item is held by it; a closed pull request that was not merged is no work in progress | component | undeclared | |
| with no running sprint, the last sprint's board is shown and the page says so | component | undeclared | |
| the backlog is folded: its unselected items are read only when the reader unfolds it — then in its order, each with its derived state | component | undeclared | |
| the accepted requirements and use cases that no item realises yet — withdrawn and open names are not among them | component | undeclared | |
| nothing is written: every request of the tab and of its fold is a GET | component | undeclared | |
| every part carries a folded What is this? — the uncovered names, the sprint, the limit, the backlog, and each state; no job runs yet | component | undeclared | |
| PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same board; a planted state changes nothing | component | undeclared | |
| API economy: each dashboard load reads the sprint, the order, the selected items and one page of pull requests | component | undeclared | |
| Agent M's own sprint 02: its goal, branch, closer and planner, the limit of four, and every selected item once on the board | component | undeclared | |
| TST-280003 | component | passed | |
| TST-280004 | component | passed | |
| TST-288101 | component | passed | |
| TST-290 | component | passed | |
| TST-291 | component | passed | |
| the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key | component | undeclared | |
| the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance | component | undeclared | |
| the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance | component | undeclared | |
| ITM-238 F1 fixed: the Notifications controls are in the public Usability tab | component | undeclared | |
| ITM-238 F2 fixed: the review pages' check connects the instance with the dashboard's own stored token | component | undeclared | |
| ITM-238 F2 fixed: the main page's check also connects the instance with the dashboard's own stored token | component | undeclared | |
| A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted | release | undeclared | |
| A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file already notified yields no further notification | release | undeclared | |
| A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — notifications switched off yields no notification | release | undeclared | |
| NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page, the main page among them, asks before the click; the click asks once | release | undeclared | |
| TST-289101 | component | passed | |
| TST-289102 | component | passed | |
| the dashboard reaches #process: views.mjs maps it to process-view.mjs, and built.json lists that file | component | undeclared | |
| routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed" | component | undeclared | |
| the dashboard migrates its product list and tokens into MOD-browser-store | component | undeclared | |
| the adapter discovers token-only GitLab products and preserves imported public values | component | undeclared | |
| the dashboard #add entry renders the settings-pages route with its instance token | component | undeclared | |
| the dashboard #settings entry mounts the public Settings route | component | undeclared | |
| the public add-product route rejects a synthetic Add product click | component | undeclared | |
| clearing product tokens clears their canonical values and cannot resurrect them on reload | component | undeclared | |
| removing a product clears its canonical address and token without reload resurrection | component | undeclared | |
| TST-290114 | component | passed | |
| UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance | component | undeclared | |
| UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted | component | undeclared | |
| UC-008 counter-proof: a click a script makes on Accept writes and reads nothing | component | undeclared | |
| UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names | component | undeclared | |
| UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone | component | undeclared | |
| UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open | component | undeclared | |
| UC-008 3a counter-proof: a click a script makes on Save writes nothing | component | undeclared | |
| UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor | component | undeclared | |
| UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor | component | undeclared | |
| UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown | component | undeclared | |
| UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted | component | undeclared | |
| UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor | component | undeclared | |
| UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case | component | undeclared | |
| UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token | component | undeclared | |
| UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and offers the way through GitHub's page as a link | component | undeclared | |
| UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale | component | undeclared | |
| UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC | component | undeclared | |
| UC-006 counter-proof: a click a script makes on Accept writes and reads nothing | component | undeclared | |
| UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state | component | undeclared | |
| UC-006 5a: the proposal changed after the entry was opened — nothing is written | component | undeclared | |
| UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text | component | undeclared | |
| UC-006 3a counter-proof: a click a script makes on Save writes nothing | component | undeclared | |
| UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor | component | undeclared | |
| UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit | component | undeclared | |
| UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs | component | undeclared | |
| A GITHUB PRODUCT USES A TOKEN OF ITS OWN — a product's pages are read with its own key, the instance with the instance's; counter-proof: a product without a key of its own is read with the instance's | component | undeclared | |
| A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE — a product's own key that expires within fourteen days is named on the product's pages, with Renew at GitHub's list of tokens and where to paste the new value; counter-proof: the instance's pages do not name it | component | undeclared | |
| UC-042 · A GITHUB PRODUCT USES A TOKEN OF ITS OWN — Settings lists each GitHub product's own key: hidden until shown, its expiry, Test reads the product with it, Change opens with its field focused and stores a new value, Clear removes it after a confirmation; Remove takes it with the product | component | undeclared | |
| UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not | component | undeclared | |
| UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance | component | undeclared | |
| UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready | component | undeclared | |
| UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored | component | undeclared | |
| UC-042 step 1: public component tabs keep every settings scope and existing control reachable | component | undeclared | |
| UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again | component | undeclared | |
| UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works | component | undeclared | |
| UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works | component | undeclared | |
| UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token | component | undeclared | |
| UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked | component | undeclared | |
| UC-042 step 2 on a phone: the token form carries the notice and its own I have read this beside the paste field; ticked there, the field and Store token open, and the notice at the top is ticked with it | component | undeclared | |
| A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Store a token: the notice's box I have read this, while it is not ticked | component | undeclared | |
| A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of the token: the paste field, once the notice is ticked | component | undeclared | |
| A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of a GitLab project token: the field for the new token | component | undeclared | |
| UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not | component | undeclared | |
| UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line | component | undeclared | |
| UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes | component | undeclared | |
| UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation | component | undeclared | |
| UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser | component | undeclared | |
| UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001 | component | undeclared | |
| UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md | component | undeclared | |
| UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why | component | undeclared | |
| UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says already written data needs a history rewrite to be removed | component | undeclared | |
| UC-042 step 5: + Collaborator creates the canonical new document with affirmative consent, name, account and one list row | component | undeclared | |
| UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing | component | undeclared | |
| UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name | component | undeclared | |
| UC-042 step 6: Clear everything removes every Agent M localStorage entry after a confirmation | component | undeclared | |
| UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test | component | undeclared | |
| UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top | component | undeclared | |
| UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load | component | undeclared | |
| UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it | component | undeclared | |
| UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage | component | undeclared | |
| UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result | component | undeclared | |
| EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page | component | undeclared | |
| UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload | component | undeclared | |
| UC-042 step 2: a GitLab project token changed or cleared takes its last test with it | component | undeclared | |
| UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload | component | undeclared | |
| with every view file of today, the menu shows the stages of the process in their order, each linked to its page | component | undeclared | |
| every dashboard view file of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, setup, review pages | component | undeclared | |
| a view or settings section whose file is not there yet is not shown, and its address shows the use cases | component | undeclared | |
| a load of every address of today asks for no view or settings file that is not built — no 404 per planned view | component | undeclared | |
| the list of built files beside the views names exactly the files of the table that are there | component | undeclared | |
| a request handler a test brings answers before the harness's own GitHub | component | undeclared | |
| a view may link a stylesheet of its own beside style.css — once, when it is first shown | component | undeclared | |
| UC-006 3b: an entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before Accept | component | undeclared | |
| UC-006 3b counter-proof: an entry that only adds a requirement shows no impact list and reads no use case, architecture file or test | component | undeclared | |
| UC-006 3b: a withdrawn requirement's entry lists what still names it | component | undeclared | |
| UC-006 3b: an entry whose impact list cannot be derived is not offered for acceptance, and says why | component | undeclared | |
| UC-006 3b: an entry that renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept | component | undeclared | |
| UC-006 3b: an entry whose heading another entry of its queue creates lists what names a requirement it leaves out | component | undeclared | |
| UC-006 3b: the requests one load of an entry makes, with an empty and with a kept file cache | component | undeclared | |
| the fixture resolves its actual current head but refuses an unknown SHA | component | undeclared | |
| #spec composes the pinned requirements view with the open SPEC changes | component | undeclared | |
| TST-268001 | unit | passed | |
| TST-276001 | component | passed | |
| TST-276002 | component | passed | |
| TST-276003 | component | passed | |
| TST-276004 | component | passed | |
| TST-276006 | component | passed | |
| TST-276005 | component | passed | |
| loadSchema — reads the rule of a schema, a section, a value specification, a condition and a variant | unit | undeclared | |
| loadSchema — a rule that is not a requirement's name in capitals is refused with SchemaError naming its key | unit | undeclared | |
| documentFindings — a document that fits its schema has no finding | unit | undeclared | |
| documentFindings — front matter keys missing, unknown and out of order | unit | undeclared | |
| documentFindings — front matter values: required or forbidden by a condition, empty where nonEmpty, not of their type | unit | undeclared | |
| documentFindings — front matter values not of their type, and not of the variant that holds | unit | undeclared | |
| documentFindings — each row of a table, cell by cell: required or forbidden by a condition, not of its type | unit | undeclared | |
| documentFindings — a cell empty where nonEmpty | unit | undeclared | |
| documentFindings — cells not of the variant that holds for their row, and each cell's closest rule | unit | undeclared | |
| documentFindings — required sections missing, sections out of order, and a section the schema forbids | unit | undeclared | |
| documentFindings — a section the schema does not name is a finding only where the schema forbids other sections | unit | undeclared | |
| documentFindings — a value's finding names the condition's rule, then the variant's, the value's, the section's, the schema's | unit | undeclared | |
| documentFindings — of combined conditions, the first part that holds and names a rule, before the combination's | unit | undeclared | |
| documentFindings — a front matter value's finding names the condition's rule, the variant's, the value's, the schema's | unit | undeclared | |
| documentFindings — a key the schema does not list, keys out of order and a forbidden section name the schema's rule | unit | undeclared | |
| a section under the title — read with the title line as its heading, and written back byte for byte | unit | undeclared | |
| loadSchema — a second section under the title, or one that is not the first, is refused with SchemaError | unit | undeclared | |
| documentFindings — a required section under the title that is missing is named | unit | undeclared | |
| a section's table is the first in it whose header row names exactly its columns, in their order | unit | undeclared | |
| a table without a header row is the section's first table, its first line a row | unit | undeclared | |
| loadSchema — a schema whose section and appended section name a field whose key holds spaces loads | unit | undeclared | |
| readDocument — such a line is read into that field | unit | undeclared | |
| appendSection — writes it as given | unit | undeclared | |
| loadSchema — a *.schema.md file holds its schema as its one ```json block; noHistory is read and kept | unit | undeclared | |
| loadSchema — the ```json block among other Markdown: CR LF line ends, a ```json example inside another fence | unit | undeclared | |
| loadSchema — a schema file without its one ```json block holding an object throws SchemaError naming the owner | unit | undeclared | |
| loadSchema — a schema that breaks the language throws SchemaError naming the key and the owner | unit | undeclared | |
| readDocument — a declaration read by its schema: front matter, tables, lists, free sections | unit | undeclared | |
| readDocument — a source entry: its identifier, a front matter list, the first table of a section | unit | undeclared | |
| readDocument — a value that depends on another, read by the variant that holds | unit | undeclared | |
| readDocument — never throws on the content: what does not fit is left as it stands, the parts that fit are read | unit | undeclared | |
| readDocument — records: key: value lines, and the sections appended to a record with their fields | unit | undeclared | |
| readDocument, writeDocument and readRegister — a schema that loadSchema did not return is refused with a TypeError | unit | undeclared | |
| readRegister — a register read row by row, under its title: each row with its line and its cells by column | unit | undeclared | |
| readRegister — a table without a header row, read by position into its columns | unit | undeclared | |
| readRegister — a schema that names no table, or more than one, is no register's: TypeError | unit | undeclared | |
| writeDocument — a canonical text read and written again is byte for byte the same | unit | undeclared | |
| writeDocument — the canonical form: front matter keys and sections in the schema's order, lists one item per line | unit | undeclared | |
| writeDocument — rows changed, removed and added: the table holds the section's rows, a row that stands keeps its bytes | unit | undeclared | |
| writeDocument — a value that does not fit its specification is refused with DocumentError naming the field | unit | undeclared | |
| writeDocument — the values that depend on other values in a row: DocumentError naming the row and the column | unit | undeclared | |
| writeDocument — an append-only table only grows: NotAppendable naming the row that would be lost or changed | unit | undeclared | |
| TST-260 | unit | passed | |
| kindOfIdentifier — the kind of an identifier of each kind of the scheme | unit | undeclared | |
| kindOfIdentifier — UC takes three or more digits | unit | undeclared | |
| kindOfIdentifier — null for a string that is none of the scheme's kinds | unit | undeclared | |
| instanceOfPagesAddress — the owner and first path segment of a Pages address, null elsewhere | unit | undeclared | |
| process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1) | unit | undeclared | |
| process route — the phases panel shows the model's transitions and its verification pairs (F2) | unit | undeclared | |
| process route — beside a branch, the model's own gate at its end is shown (F3) | unit | undeclared | |
| process route — each practice is shown with what it adds, beside the models it fits (F4) | unit | undeclared | |
| process route — selected tabled practice additions enter the workflow and disappear when the selection changes | unit | undeclared | |
| process route — a gate a process requirement adds is shown with the two phases it stands between (F5) | unit | undeclared | |
| process route — the missing-capability notice links to the participants' page, #participants (F6) | unit | undeclared | |
| process route — the five catalogue models, in two groups, each with what its about holds | unit | undeclared | |
| process route — the page of a product without a declaration | unit | undeclared | |
| process route — the page of a product with a declaration, its first field focused | unit | undeclared | |
| process route — the page of a product with Agent M's own declaration | unit | undeclared | |
| process route — a role's offered participants are those with every capability, each with its place; a role none can hold names the missing capability | unit | undeclared | |
| process route — the declaration's findings are shown before Save, among them a holder at a place a linked source does not permit | unit | undeclared | |
| process route — Save is disabled while a role that needs a person has none, naming it | unit | undeclared | |
| process route — a product without process requirements is told so | unit | undeclared | |
| process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not | unit | undeclared | |
| process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at | unit | undeclared | |
| process route — changing a practice in one live form updates the workflow before Save and Save preserves the selection | unit | undeclared | |
| process route — a refused save keeps the person's edit | unit | undeclared | |
| newJobId — an identifier of the record's form, none of those taken | unit | undeclared | |
| startRecord — the start of a record with each of its parts, read back as the same start | unit | undeclared | |
| listJobs — a record with each kind of part appended, read | unit | undeclared | |
| listJobs — a question to the author is read as the record's question, not a nameless gate | unit | undeclared | |
| listJobs — an End's draft is read from its one fenced JSON block | unit | undeclared | |
| jobState — the state of a record by its last part, with a live state and without one | unit | undeclared | |
| listJobs — the jobs of two products newest first, waiting at a gate first, a record that cannot be read listed with the reason | unit | undeclared | |
| jobCost — the cost as reported, at the declared price, or unknown, never zero | unit | undeclared | |
| recordsNewestFirst — yields only the newest record until its caller asks for another | unit | undeclared | |
| the use-case list reads the commit, the tree, the use cases and only the records it must — no architecture or queue file | component | undeclared | |
| the architecture view reads no use case and no queue file | component | undeclared | |
| the SPEC view lists only the open SPEC changes; an accepted queue's proposals are not read | component | undeclared | |
| opening one use case reads that use case and its records — no other file | component | undeclared | |
| opening a changed module reads what its impact list needs: its records, its last accepted text, every module, the code's headers | component | undeclared | |
| settings read the product's settings, and no use case, architecture file, record or queue | component | undeclared | |
| a second load on an unchanged tree reads its displayed files again | component | undeclared | |
| without Cache Storage the page still works; it reads every file it shows | component | undeclared | |
| counter-proof: a record named for the current text whose content names another blob does not accept the opened file | component | undeclared | |
| Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR) | component | undeclared | |
| renderArtifact — headings, lists, emphasis, links, tables and code are rendered | unit | undeclared | |
| renderArtifact — a script, an event attribute and a javascript: link are removed by the sanitiser | unit | undeclared | |
| renderArtifact — an image is shown as a link, never loaded | unit | undeclared | |
| renderArtifact — a Mermaid block is shown as its source with the reason, and the prose around it is rendered | unit | undeclared | |
| renderArtifact — the same text gives the same HTML | unit | undeclared | |
| openEditor — the preview follows an edit | unit | undeclared | |
| openEditor — a mark is shown beside its line, in the one form of a finding | unit | undeclared | |
| openEditor — Save hands the edited text to the caller's save | unit | undeclared | |
| openEditor — a refused save keeps the edit, with the newer version and the difference beside it | unit | undeclared | |
| TST-269001 | unit | passed | |
| TST-269002 | unit | passed | |
| TST-269003 | unit | passed | |
| TST-269004 | unit | passed | |
| TST-269005 | unit | passed | |
| TST-269006 | component | passed | |
| Model.about — every shipped model's ## About is read with its four lines | unit | undeclared | |
| Model.about — a model without ## About is read with about null | unit | undeclared | |
| catalogue — the shipped catalogue holds exactly the book's five models in their two groups, and its four practices | unit | undeclared | |
| catalogue — an instance's own model is read as a Model, listed after the shipped ones, with its findings | unit | undeclared | |
| modelFindings — every shipped model passes without an error, and every shipped practice fits its schema | unit | undeclared | |
| modelFindings — a complete definition, with a gate decided by a role and one decided by a CI check, has no finding | unit | undeclared | |
| modelFindings — a transition naming a phase that is not defined is an error | unit | undeclared | |
| modelFindings — a phase that no transition reaches from the first phase is an error | unit | undeclared | |
| modelFindings — a verification pair naming a missing phase is an error | unit | undeclared | |
| modelFindings — a gate without artifacts is an error | unit | undeclared | |
| modelFindings — a gate without a condition is an error | unit | undeclared | |
| modelFindings — a gate without a decider is an error: none named, or one that is no role of the model and no check | unit | undeclared | |
| modelFindings — a role without capabilities is an error | unit | undeclared | |
| modelFindings — a phase without a role is an error: none named, or one the model does not define | unit | undeclared | |
| modelFindings — a gate that checks a kind of artifact no earlier phase produces is an error | unit | undeclared | |
| modelFindings and catalogue — a kind in Produces may be followed by an explanation in parentheses: the kind is what stands before it, and a gate that checks it finds it produced | unit | undeclared | |
| modelFindings — a word before the parenthesis that is no kind of artifact is still a finding | unit | undeclared | |
| modelFindings — pulled work with neither a time box nor a work-in-progress limit, or with both, is an error | unit | undeclared | |
| modelFindings and catalogue — a Time box of none is no time box: pulled work with a WIP limit and a Time box of none has no finding of both | unit | undeclared | |
| modelFindings — a measure that does not fit the kind of work is an error | unit | undeclared | |
| modelFindings — no declaration of planned or pulled work is an error | unit | undeclared | |
| modelFindings — this repository's own docs/process-models/scrum-wip.md, as it stands, has no error finding | unit | undeclared | |
| THE CATALOGUE IS DATA — no name of a shipped model or practice stands in the module's code | unit | undeclared | |
| THE CATALOGUE IS DATA — the shipped models and practices are found in the module's list of its files, read from the disk in Node and from its own address in a browser | unit | undeclared | |
| switchOn asks the browser's permission only on the call, and a refusal stores nothing | unit | undeclared | |
| switchOff removes both notifications and notified, and unregisters the worker | unit | undeclared | |
| the first check after Switch on notifies nothing, and only records what waits then | unit | undeclared | |
| a file come to wait is notified once, with its text and address, and a file changed again anew | unit | undeclared | |
| more than three of one kind in one repository give one notification of their number | unit | undeclared | |
| a repository that cannot be read is skipped until the next check | unit | undeclared | |
| participantsOf — this instance's register read into participants: a person without a model and a place, a CLI agent with its model and its place | unit | undeclared | |
| participantsOf — a row with a context and a price read into numbers and a currency | unit | undeclared | |
| eligible — given the participants read from a register, offers for a role exactly those with every capability it needs | unit | undeclared | |
| participantSchema — the register's schema is read from the module's own participants.schema.md: from the disk in Node, from its own address in a browser | unit | undeclared | |
| participantSchema — this instance's register read into participants, each with its type, capabilities, processing place and model | unit | undeclared | |
| participantSchema — an entry of a type outside the five, and a participant based on a language model without its model, named as errors | unit | undeclared | |
| eligible — offers for a role exactly the participants with every capability it needs, each with where it processes data | unit | undeclared | |
| eligible — leaves out a participant whose processing place a restricted source does not allow, naming the place and the source | unit | undeclared | |
| TST-290101 | unit | passed | |
| TST-290102 | unit | passed | |
| declarationFindings — a holder that lacks a capability its role needs is an error, naming the holder, the role and the capability | unit | undeclared | |
| declarationFindings — a holder at a place a linked source does not permit is a warning naming the holder, the role and the source; a person holding a role is not warned of it | unit | undeclared | |
| declarationSchema — the declaration's schema is read from the module's own declaration.schema.md: from the disk in Node, from its own address in a browser | unit | undeclared | |
| declarationSchema — a product's declaration read by its schema: front matter, roles with their participants, branches and the gates requirements add | unit | undeclared | |
| declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding | unit | undeclared | |
| declarationFindings — the fixture product's declaration, against the catalogue at the commit it names, has no finding | unit | undeclared | |
| declarationFindings — a model that the catalogue at the declared commit does not hold at model_file is an error | unit | undeclared | |
| declarationFindings — a model whose findings in the catalogue at the declared commit hold an error is an error | unit | undeclared | |
| declarationFindings — a role that needs a person and has none is an error | unit | undeclared | |
| declarationFindings — a practice the catalogue does not hold is an error | unit | undeclared | |
| declarationFindings — a practice whose fits does not name the model is an error | unit | undeclared | |
| declarationFindings — a branch for a phase the model lacks is an error | unit | undeclared | |
| declarationFindings — a gate whose requirement the instance's SPEC does not hold is an error | unit | undeclared | |
| workflowOf — the model's phases, transitions, pairs and gates, and the gates the process requirements add, each with its requirement and source | unit | undeclared | |
| workflowOf — nothing else enters the workflow: a declared practice adds nothing, and a gate whose requirement the SPEC does not hold stays without a source | unit | undeclared | |
| workflowOf — an explicitly tabled practice adds its phase, artifact, role and marked gate beside the model and requirement gates | unit | undeclared | |
| workflowOf — a valid practice gate table directly under Adds enters the workflow without an invented heading | unit | undeclared | |
| workflowOf — the job rules are the Definition of Done when the declaration adds no condition | unit | undeclared | |
| workflowOf — a practice phase drops its Produces explanation as the model reader does | unit | undeclared | |
| workflowOf — consecutive bare phase and role tables do not cross into each other | unit | undeclared | |
| waitingForAcceptance — an open SPEC entry, an open use case and a changed module wait; an accepted decision, an approved and an in-SPEC entry do not | unit | undeclared | |
| waitingForAcceptance — an open architecture decision and a changed use case wait, with no SPEC change queue in the repository | unit | undeclared | |
| waitingForAcceptance — an empty repository waits for nothing | unit | undeclared | |
| waitingForAcceptance — a completed candidate run adds its release test report | unit | undeclared | |
| nextVersion — a minor step by default, from the product's own release tags only | unit | undeclared | |
| nextVersion — a patch step keeps the minor and steps the patch | unit | undeclared | |
| nextVersion — YYYY.1.0 in a new year, whatever step is asked (1a) | unit | undeclared | |
| nextVersion — a product with no release tag yet starts at YYYY.1.0 | unit | undeclared | |
| startReleaseCandidate — the next free N, and the complete run queued with the candidate's version, tag and changelog entry | unit | undeclared | |
| startReleaseCandidate — the next free N is the greatest existing one plus one | unit | undeclared | |
| startReleaseCandidate — TagExists propagates from the host's createTag | unit | undeclared | |
| startReleaseCandidate — NoRunner naming a person-run level the schedule names no one for | unit | undeclared | |
| startReleaseCandidate — NoRunner naming "release" where only the implementer could run the release tests (2a) | unit | undeclared | |
| startReleaseCandidate — no NoRunner where the release row's runner differs from every recorded implementer | unit | undeclared | |
| releaseReport — its parts in the module's own order, Limitations first, complete and green | unit | undeclared | |
| releaseReport — incomplete while a test has not run on the candidate's commit | unit | undeclared | |
| releaseReport — a worse model-dependent rate is read against the last release's commit, found in the report `at` already holds | unit | undeclared | |
| acceptAndRelease — one commit of the report, its approval record and the changelog entry, then the tag on the candidate's own commit, also when the default branch moved on (4b) | unit | undeclared | |
| acceptAndRelease — LimitationMissing naming each failing test and worse rate without its reason (3a, 3b) | unit | undeclared | |
| acceptAndRelease — resolves once every failing test and worse rate has its reason recorded | unit | undeclared | |
| acceptAndRelease — Incomplete while a test has not run on the candidate's commit | unit | undeclared | |
| acceptAndRelease — TagExists, an existing tag not moved (4a) | unit | undeclared | |
| reportsAwaitingAcceptance — a candidate's complete run waits, but an unfinished or accepted one does not | unit | undeclared | |
| reportsAwaitingAcceptance — calendar version 2026.10.0 is newer than 2026.9.0 | unit | undeclared | |
| TST-263901 | release | passed | |
| TST-263902 | release | passed | |
| TST-268901 | release | passed | |
| TST-269901 | release | passed | |
| TST-269902 | release | passed | |
| TST-269903 | release | passed | |
| TST-269904 | release | passed | |
| TST-275001 | release | passed | |
| TST-275002 | release | passed | |
| TST-276901 | release | passed | |
| TST-280901 | release | passed | |
| TST-280902 | release | passed | |
| TST-282901 | release | passed | |
| TST-283901 | release | passed | |
| TST-284901 | release | passed | |
| TST-284902 | release | passed | |
| TST-284903 | release | passed | |
| TST-285901 | release | passed | |
| TST-285902 | release | passed | |
| TST-285903 | release | passed | |
| TST-285904 | release | passed | |
| TST-285905 | release | passed | |
| TST-286901 | release | passed | |
| TST-286902 | release | passed | |
| TST-286903 | release | passed | |
| TST-286904 | release | passed | |
| TST-287901 | release | passed | |
| TST-288901 | release | passed | |
| TST-289901 | release | passed | |
| TST-290105 | release | passed | |
| TST-290106 | release | passed | |
| TST-290107 | release | passed | |
| TST-290108 | release | passed | |
| TST-290115 | release | passed | |
| release · UC-008 1–5: a use case is read with its diagram and accepted by one commit that names its exact text | release | undeclared | |
| release · UC-008 5a: an accepted use case edited afterwards shows as changed | release | undeclared | |
| release · UC-008 2a: a changed use case shows its difference to the text the most recent record names, across a rename | release | undeclared | |
| release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown | release | undeclared | |
| release · UC-008 3a: Save commits the edited use case, which is then shown again, open | release | undeclared | |
| release · UC-008 3a: a save whose file changed meanwhile writes nothing | release | undeclared | |
| release · UC-008 3b: without a token, Accept and Edit open GitHub's own pages, prefilled | release | undeclared | |
| release · UC-008 3c: a GitLab product without its token is read, offers no Accept or Save, and links to the token step | release | undeclared | |
| release · UC-008 3d: Accept ticked writes one record per ticked use case in one commit; a file changed since is left out and named | release | undeclared | |
| release · UC-008 3e: Review all shows every open use case and Accept all writes one record each; a file changed since is left out | release | undeclared | |
| release · UC-008 3: nothing is written on load or on a script's click; the person's click writes | release | undeclared | |
| release · UC-006 1–7: a SPEC change is accepted in one commit — record, section byte for byte, decision — and shows as in SPEC | release | undeclared | |
| release · UC-006 3a: an edited proposal is saved, shown again, and accepted as edited | release | undeclared | |
| release · UC-006 5a: a SPEC section or proposal changed since it was shown is not written; the new state is shown | release | undeclared | |
| release · UC-006 4d: an entry waits for the entry that creates its heading; ticked together both are written in queue order | release | undeclared | |
| release · UC-006 4b: without a token, Accept and Edit open GitHub's pages for the instance, prefilled | release | undeclared | |
| release · UC-006 4c: a product's SPEC change without a token is not offered GitHub's page; a token is required | release | undeclared | |
| release · UC-006 4a: an entry not accepted stays open and nothing is committed | release | undeclared | |
| release · UC-014 4a: an approval committed on GitHub's page and not yet applied shows as approved, with why | release | undeclared | |
| release · UC-014 6, 7a: without a token the start page offers Finish setting up, with Set up now and Import settings | release | undeclared | |
| release · UC-014 7: Step A links GitHub's token page prefilled with exactly the permissions every feature needs | release | undeclared | |
| release · UC-014 8–9: Store and check keeps token and expiry after the notice, checks the instance, and shows it ready | release | undeclared | |
| release · UC-014 6a: without setup, the dashboard reads public repositories and accepting goes through GitHub's page | release | undeclared | |
| release · UC-042 1: Settings is reached from the gear; a stored token is hidden until Show reveals it in full | release | undeclared | |
| release · UC-042 2: Test sends one harmless request to GitHub and the line shows ✓ works with the date | release | undeclared | |
| release · UC-042 2: Change stores a new token with its expiry date, preset to 90 days, after the notice | release | undeclared | |
| release · UC-042 2: Clear asks once, says what stops working, and removes the token from localStorage | release | undeclared | |
| release · UC-042 1a: a token expiring within fourteen days is warned of on every page, with Renew | release | undeclared | |
| release · UC-042 1a: the expiry line offers the paste field for the renewed value | release | undeclared | |
| release · UC-042 1b: a refused token is named, GitHub's with Renew, a GitLab project's with its Access tokens page | release | undeclared | |
| release · UC-042 3a: without a token the product section is read-only and links to UC-001's token step | release | undeclared | |
| release · UC-042 4: pseudonymisation is on by default; switching it off states what follows, then commits docs/settings.md | release | undeclared | |
| release · UC-042 4a: switching back on is saved without a notice; the page says earlier data stays in the history | release | undeclared | |
| release · UC-042 5: + Collaborator with the person's consent commits docs/collaborators.md, without it nothing | release | undeclared | |
| release · UC-042 6: Clear everything removes every entry from localStorage | release | undeclared | |
| release · UC-042: every line and section of the settings page explains itself | release | undeclared | |
| release · A TOKEN IS SCOPED TO WHAT IT WRITES: the settings page states the minimum scope and why each part is needed | release | undeclared | |
| release · A USED-UP RATE LIMIT IS NAMED: the account's or the network's limit with its reset time, never the token | release | undeclared | |
| release · AN EXPIRED TOKEN IS NAMED: a refused token is named with the link to renew it | release | undeclared | |
| release · git host: a write without an authority is refused before any request is sent | release | undeclared | |
| release · git host: each of the three authorities writes one commit with the person's own token | release | undeclared | |
| release · git host: a save whose file changed on the branch writes nothing | release | undeclared | |
| release · git host: a 403 with a used-up limit is the account's or the network's limit, not a refused token | release | undeclared | |
| release · git host: a 401 names the refused token and where it is renewed | release | undeclared | |
| release · git host: the GitHub token is sent to GitHub's API only | release | undeclared | |
| release · ITM-126 identifierKept: a changed identifier is a finding in the compiler form; the same identifier is none | release | undeclared | |
| release · ITM-126 identifierKept: a text that lost its identifier is a finding too | release | undeclared | |
| release · ITM-126 identifierKept: a text with CR LF line ends that keeps its identifier is no finding | release | undeclared | |
| release · ITM-126 formatChecks: the identifier finding comes once, as identifierKept gives it | release | undeclared | |
| release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a use case saved under another identifier is refused, nothing is written | release | undeclared | |
| release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a decision and a module saved under another identifier are refused | release | undeclared | |
| release · ITM-129 UC-024: a page load of every address asks for no file below docs/assets/ that is not there | release | undeclared | |
| release · ITM-129 UC-024: every menu entry and view of today is shown; a view whose file is not built is not | release | undeclared | |
| release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: no file of the dashboard imports the git host's request helper | release | undeclared | |
| release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: the dashboard reads through no name of the git host that MOD-git-host does not provide | release | undeclared | |
| release · ITM-130 ARC-003: no file of the dashboard calls fetch itself | release | undeclared | |
| release · ITM-130 UC-008 2a: the last accepted text is read by its blob and refused unless it hashes to that SHA | release | undeclared | |
| release · ITM-133 UC-008 4a: an Accept refused for missing write access offers GitHub's new-file page with the record, as a link | release | undeclared | |
| release · ITM-133 UC-008 4a: an Accept refused for a used-up rate limit gets no GitHub path and no word of write access | release | undeclared | |
| release · ITM-133 UC-008 4a: a GitLab product's refused Accept offers no GitHub path | release | undeclared | |
| release · ITM-133 UC-008 3d·4a: Accept ticked refused for missing write access offers the GitHub path for each ticked record | release | undeclared | |
| release · ITM-133 UC-008 3a·4a: a Save refused for missing write access offers GitHub's editor for the file | release | undeclared | |
| release · ITM-136 UC-042 1: the GitHub token's ✓ works and its date are shown after a reload | release | undeclared | |
| release · ITM-136 UC-042 1b: a GitHub token refused at its last use is shown refused after a reload, on its line and at the top | release | undeclared | |
| release · ITM-136 UC-042 1: a GitLab project token's last test — works, then refused — is shown after a reload | release | undeclared | |
| release · ITM-136 UC-042 2: a new token stored with Change does not inherit the old token's ✓ works | release | undeclared | |
| release · ITM-136 UC-042 2: Clear removes the token's kept test with the token, from localStorage itself | release | undeclared | |
| release · ITM-136 EVERY SETTING IS REACHED FROM ONE PAGE: every key kept after the tests is named on the settings page | release | undeclared | |
| release · ITM-130 readBlob: a blob's text on either host, refused unless it hashes to that SHA; each token to its own server | release | undeclared | |
| release · ITM-130 ARC-003: no kernel file imports from the git host or from any module outside the kernel | release | undeclared | |
| release · ITM-130 ARC-003: no kernel file calls fetch or touches the browser's storage | release | undeclared | |
| release · ITM-130 lastAccepted reads through its ports only and returns the record committed last, by identifier | release | undeclared | |
| release · ITM-130 lastAccepted refuses a text that does not hash to the record's blob | release | undeclared | |
| release · ITM-130 lastAccepted: two records at the same instant are an error naming both, not a guess | release | undeclared | |
| release · Backlog tab: sprint 02's own board — merged items done, the open one in progress, the limit named | release | undeclared | |
| release · Backlog tab: with the limit reached, every ready item says it cannot start, naming the limit | release | undeclared | |
| release · Backlog tab: an item realising a use case changed since its acceptance waits for acceptance | release | undeclared | |
| release · Backlog tab: the uncovered names above, the board, then the backlog below | release | undeclared | |
| release · Backlog tab: no request for an unselected item before the backlog is unfolded | release | undeclared | |
| release · Backlog tab: unfolded, the backlog in its order with derived states, and the uncovered names | release | undeclared | |
| release · Backlog tab: after clearing every browser store and reloading, the same board | release | undeclared | |
| release · Backlog tab: nothing is written and no state is stored | release | undeclared | |
| release · Backlog tab: every part and every column explains itself | release | undeclared | |
| release · Backlog tab: a product whose model works from a plan has no backlog and is sent to Progress | release | undeclared | |
| release · process model: Agent M's own model is read with its limit and measure, and validates without an error | release | undeclared | |
| release · process model: a transition naming a phase the model lacks is refused, beside the field that causes it | release | undeclared | |
| release · process model: a verification pair naming a phase the model lacks is refused, beside the field that causes it | release | undeclared | |
| release · process model: a gate without artifacts is refused, beside the field that causes it | release | undeclared | |
| release · process model: a gate without a condition is refused, beside the field that causes it | release | undeclared | |
| release · process model: a role without capabilities is refused, beside the field that causes it | release | undeclared | |
| release · process model: a phase without a role is refused, beside the field that causes it | release | undeclared | |
| release · process model: a missing declaration of whether work is planned or pulled is refused, beside the field that causes it | release | undeclared | |
| release · process model: a gate without a decider is refused, beside the field that causes it | release | undeclared | |
| release · process model: a gate decided by a role the model does not define is refused, beside the field that causes it | release | undeclared | |
| release · process model: a phase no transition reaches is refused, beside the field that causes it | release | undeclared | |
| release · process model: a gate that checks an artifact kind no earlier phase produces is refused, beside the field that causes it | release | undeclared | |
| release · process model: pulled work with neither a time box nor a WIP limit is refused, beside the field that causes it | release | undeclared | |
| release · process model: pulled work with both a time box and a WIP limit is refused, beside the field that causes it | release | undeclared | |
| release · process model: a progress measure that does not fit the kind of work is refused, beside the field that causes it | release | undeclared | |
| release · process model: an unknown progress measure is refused, beside the field that causes it | release | undeclared | |
| release · process model: a gate decided by a role and one decided by a named CI check both pass | release | undeclared | |
| release · process model: validation leaves the definition as it was, and names every error of a definition with two | release | undeclared | |
| release · work items: this backlog parses without a problem — each item names what it realises and where it came from | release | undeclared | |
| release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not | release | undeclared | |
| release · work items: an item naming a requirement or use case the product does not have is an error | release | undeclared | |
| release · work items: an item that restates an existing one is flagged, not rejected | release | undeclared | |
| release · work items: an item kept outside docs/backlog/ is an error | release | undeclared | |
| release · work items: this backlog's order places every item once, and appends the unnamed at the bottom | release | undeclared | |
| release · work items: an order that names an unknown item or one twice is a problem; the unnamed are appended | release | undeclared | |
| release · work items: an item from an issue names the issue as its origin, and realises what its class says | release | undeclared | |
| release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted | release | undeclared | |
| release · work items: an item file naming two issues as its origin is read with both | release | undeclared | |
| release · work items: this sprint's record is read with its selection in order, and stores no state | release | undeclared | |
| release · work items: with limit 2 and two items in progress a third start is refused with the limit named | release | undeclared | |
| release · work items: an item outside the running sprint's selection is refused | release | undeclared | |
| release · work items: a job without an item is refused, in Scrum and in Kanban | release | undeclared | |
| release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts | release | undeclared | |
| release · work items: an item's state follows its pull requests, not a field of its file | release | undeclared | |
| release · requirements: a source named as it is written, with its date, is no error and needs no SRC- identifier | release | undeclared | |
| release · requirements: an SRC- identifier must be linked to the product; a linked one passes | release | undeclared | |
| release · requirements: a resource entry named as source is an error | release | undeclared | |
| release · requirements: a source without a date, an empty source and a date alone are errors | release | undeclared | |
| release · requirements: a requirement written without any source is an error | release | undeclared | |
| release · reader: a withdrawn requirement is marked, bold prose and a quoted name are no requirement | release | undeclared | |
| release · pull requests: GitHub and GitLab give the same pull requests in one shape | release | undeclared | |
| release · pull requests: a field the GitLab answer lacks is null, never taken from another field | release | undeclared | |
| release · pull requests: open, merged and closed are told apart on both hosts, and a base branch is kept to | release | undeclared | |
| release · pull requests: each token is seen only at its own server, never in a URL, and nothing is written | release | undeclared | |
| release · pull requests: a list with a date reads only as far back as that date | release | undeclared | |
| release · gates: a SPEC change is written only with its acceptance, and only its own section | release | undeclared | |
| release · gates: the approved text is written byte for byte, on the dashboard's and on the workflow's route | release | undeclared | |
| release · gates: the current text beside a proposal is the section as it stands, byte for byte | release | undeclared | |
| release · gates: the replaced section is reachable in git history and kept nowhere in the tree | release | undeclared | |
| release · gates: a file on the default branch is open until a record names its current text | release | undeclared | |
| release · gates: records are not of a reviewed kind; a use case is | release | undeclared | |
| release · gates: a job record without approval is not open; a use case without approval is | release | undeclared | |
| release · gates: an acceptance handed a job record writes no approval record for it | release | undeclared | |
| release · applyApprovals: a stale or malformed record is refused by name and nothing is written | release | undeclared | |
| release · applyApprovals: several records in one run — each written, in order, a stale one refused beside them | release | undeclared | |
| release · applyApprovals: the same files, bytes and report as tools/apply_approvals.py | release | undeclared | |
| release · UC-022: a decision is accepted only when everything it names is accepted | release | undeclared | |
| ITM-131 · a use case: a refused save writes nothing, keeps the edit and shows the newer version beside it | release | undeclared | |
| ITM-131 · an architecture decision: a refused save writes nothing, keeps the edit and shows the newer version beside it | release | undeclared | |
| ITM-131 · a module: a refused save writes nothing, keeps the edit and shows the newer version beside it | release | undeclared | |
| ITM-131 · a SPEC change proposal: a refused save writes nothing, keeps the edit and shows the newer version beside it | release | undeclared | |
| ITM-131 · without a commit meanwhile, Save commits the edit and shows no newer version | release | undeclared | |
| ITM-134 · an entry that adds a new requirement shows no impact list | release | undeclared | |
| ITM-134 · an entry withdrawing a requirement lists what still names it | release | undeclared | |
| ITM-134 · an entry that takes a requirement out of its section lists what references it | release | undeclared | |
| ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included | release | undeclared | |
| ITM-125 · every secret the store keeps says what it grants | release | undeclared | |
| ITM-018 · what traces to a requirement is derived from the artifacts, never from a matrix kept by hand | release | undeclared | |
| ITM-018 · references are followed by identifier; a position is no reference | release | undeclared | |
| ITM-018 · coverage gaps are listed with the withdrawal note, and they block nothing | release | undeclared | |
| ITM-018 · module rows and every gap of UC-025, none of them an error | release | undeclared | |
| ITM-018 · the impact list of a requirement names every artifact that references it | release | undeclared | |
| ITM-018 · an entry whose section no longer states a requirement touches that requirement | release | undeclared | |
| ITM-018 · the impact list of an architecture change names what follows or uses it, with its code and tests | release | undeclared | |
| ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked | release | undeclared | |
| ITM-203 · UC-025 step 5 — every module of Agent M is one box, inside the box of its subsystem and of no other | release | undeclared | |
| ITM-203 · UC-025 step 5 — one arrow from each module to each module it uses, however many of its interfaces it uses | release | undeclared | |
| ITM-203 · UC-025 step 5 — a used module that has no file is one box marked missing, where the arrows of its users end | release | undeclared | |
| ITM-203 · the page draws Agent M's component diagram without Mermaid's "Maximum text size in diagram exceeded" | release | undeclared | |
| ITM-203 · the explanation under the component diagram says what the diagram draws | release | undeclared | |
| THE PROCESS MODEL IS DECLARED PER PRODUCT: no model is assumed; the product's own repository declares exactly one | release | undeclared | |
| A PROCESS MODEL ORGANISES PEOPLE AND AGENTS: each role is shown with whether a person, an agent or either may fill it | release | undeclared | |
| AGENT M CARRIES THE BOOK'S CATALOGUE: the five models, and apart from them the four practices | release | undeclared | |
| THE CATALOGUE IS DATA: a process model added as a data file is offered and used, no code changed | release | undeclared | |
| THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's phases, and its gates where they sit | release | undeclared | |
| THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's transitions and its verification pairs | release | undeclared | |
| A GATE NAMES WHAT IT CHECKS: each gate is shown with its artifacts and its condition | release | undeclared | |
| A PRACTICE IS NOT A MODEL: no practice is offered instead of a model; one added keeps the model | release | undeclared | |
| A PROCESS REQUIREMENT ADDS TO THE MODEL: the requirement's gate is added, the model's own phases and gate stay | release | undeclared | |
| A PERSON'S OWN INPUT IS COMMITTED DIRECTLY: Save commits onto the product's default branch, under the author's own token | release | undeclared | |
| ONE CLICK PER DECISION: one click on Save, once the declaration is complete, does all that follows | release | undeclared | |
| EVERY STEP EXPLAINS ITSELF: each step that asks something carries an explanation that can be expanded | release | undeclared | |
| A ROLE NAMES THE CAPABILITIES IT NEEDS: only a participant with all of them is offered, and one without them cannot be assigned | release | undeclared | |
| A PARTICIPANT DECLARES ITS CAPABILITIES: what a participant declares decides whether it is offered | release | undeclared | |
| A PARTICIPANT DECLARES WHERE IT PROCESSES DATA: each participant offered is shown with where it processes data | release | undeclared | |
| A PRODUCT DECLARES ITS DEFINITION OF DONE: a condition the author adds is declared in the product's own repository | release | undeclared | |
| THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, the Definition of Done shown is the job rules | release | undeclared | |
| THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, no condition beyond the job rules | release | undeclared | |
| A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: the sprint is given a branch of its own | release | undeclared | |
| A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: merging the branch into the default branch is the gate at its end, decided by the Product Owner after the review | release | undeclared | |
| WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET: without a branch, the page says the work merges into the default branch | release | undeclared | |
| A GATE NAMES WHO DECIDES IT: each gate is shown with its decider, a role or an automated check | release | undeclared | |
| A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file come to wait is notified, naming it and where it is | release | undeclared | |
| NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page asks before the click; the click asks once | release | undeclared | |
| STATUS IS DERIVED FROM THE RECORDS — accepted while the blob matches the record, waiting once it does not | release | undeclared | |
| PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting all local storage and reloading rederives the same facts | release | undeclared | |
| CONFIGURATION LIVES IN THE BROWSER — Switch on is kept in this browser's storage; no write request is made | release | undeclared | |
| EVERY SETTING IS REACHED FROM ONE PAGE — the "notifications" key the dashboard writes has a place on the settings page | release | undeclared | |
| A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN — Test and Switch off sit together with the state | release | undeclared | |
| TST-280 | release | passed | |
| EVERY STEP EXPLAINS ITSELF — the folded explanation names what, how often, whose tokens, and when not | release | undeclared | |
| NO SERVER — every request a check makes goes to a repository server, never to any origin of Agent M's own | release | undeclared | |
| TST-283 | release | passed | |
| TST-286 | release | passed | |
| TST-287 | release | passed | |
| the public paired Bridge dispatches endpoint-test over loopback and enforces token rotation | release | undeclared | |
| the release dashboard reads and opens current requirements without writes with or without a token | release | undeclared | |
| the public default endpoint-test job crosses a paired loopback Bridge and preserves provider results | release | undeclared | |
| the release dashboard toggles current requirements without writes with or without a token | release | undeclared | |
| TST-279 | release | passed | |
| ITM-281 — public process caller derives and clears only selected practice tables before one Save | release | undeclared | |
| TST-266002 | release | passed | |
| TST-292005 | release | passed | |
| TST-292006 | release | passed | |
| TST-292007 | release | passed | |
| TST-292008 | release | passed | |
| TST-292009 | release | passed | |
| TST-292010 | release | passed | |
| TST-293002 | release | passed | |
| MOD-repository-hosts listTags — the tags of a repository with their commits, and only those matching a pattern (GitHub, GitLab) | unit | undeclared | |
| MOD-repository-hosts listTags — every tag across more than one page, the pattern matched against all of them (GitHub, GitLab) | unit | undeclared | |
| MOD-repository-hosts createTag — a tag set on the commit named (GitHub, GitLab) | unit | undeclared | |
| MOD-repository-hosts createTag — an existing tag is refused with TagExists naming its commit, and not moved (GitHub's 422, GitLab's 400) | unit | undeclared | |
| MOD-repository-hosts listTags, createTag — a refused token, a missing permission and a used-up rate limit are the module's named failures | unit | undeclared | |
| A PRODUCT IS NAMED BY ITS ADDRESS — a GitHub repository's address, as the browser shows it | unit | undeclared | |
| A PRODUCT IS NAMED BY ITS ADDRESS · GITLAB PRODUCTS ARE SUPPORTED — a GitLab project's address, in nested groups | unit | undeclared | |
| A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only to GitHub's API, the project token only to its project's API | unit | undeclared | |
| A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — GitHub's 403 with a used-up limit is that limit, never the token | unit | undeclared | |
| UC-001 5a — a write that a public repository refuses because the token does not reach it is named so, and nothing is written | unit | undeclared | |
| UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitHub) | unit | undeclared | |
| UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitLab) | unit | undeclared | |
| UC-001 5 — GitLab: a commit that lands while the change's files are read, touching none of them, is Moved, and nothing is written | unit | undeclared | |
| UC-001 — the token pages: GitHub's prefilled token page and the list of tokens, a GitLab project's Access tokens page | unit | undeclared | |
| UC-001 5 — an empty repository: no commit and no path; its first commit through the contents API, the others in one commit on it | unit | undeclared | |
| UC-001 5 — on a GitLab server, a first commit is refused with the advice to push one, and nothing is requested | unit | undeclared | |
| UC-001 4 — repositoryInfo: default branch, visibility, whether the token may write, in one request | unit | undeclared | |
| UC-001 4–5 — readSnapshot: the repository at one commit, its files read at that commit, each once | unit | undeclared | |
| UC-001 2a, 4a — NotFound names the repository or the branch; a server the page cannot reach is Unreachable | unit | undeclared | |
| NO SECRET IN THE REPOSITORY — a commit holding a configured secret or the token is refused before anything is sent | unit | undeclared | |
| resultsAt — a commit's outcomes per level, with their counts | unit | undeclared | |
| resultsAt — a level without a record of the commit reads not run, never passed | unit | undeclared | |
| resultsAt — a record marked uncommitted is left out | unit | undeclared | |
| flakyTests — a deterministic test with both outcomes on one commit, with both records; a model-dependent test is not reported | unit | undeclared | |
| rateComparison — a rate lower than the last release's is marked worse, one at or above is not | unit | undeclared | |
| rateComparison — no comparison without a last release | unit | undeclared | |
| gitBlobSha equals git hash-object, byte for byte | unit | undeclared | |
| records round-trip and carry no text | unit | undeclared | |
| extractSection: heading to next heading of same level, code fences masked | unit | undeclared | |
| sectionText is the same bytes the Python applier hashes | unit | undeclared | |
| queue index and decisions parse like scripts/spec_dashboard.py | unit | undeclared | |
| STATUS IS DERIVED FROM THE RECORDS: use cases | unit | undeclared | |
| STATUS IS DERIVED FROM THE RECORDS: SPEC proposals | unit | undeclared | |
| an applied entry is judged by its own section, not by headings later entries filled | unit | undeclared | |
| an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text | unit | undeclared | |
| the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance | unit | undeclared | |
| ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing | unit | undeclared | |
| decisionRow is the row tools/apply_approvals.py writes | unit | undeclared | |
| replaceSection writes the proposal byte for byte and keeps the file's final newline | unit | undeclared | |
| an entry already written in the queue's decisions is not written twice | unit | undeclared | |
| A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch | unit | undeclared | |
| A STALE APPROVAL IS NOT APPLIED — the engine's workflow route: a proposal or a SPEC section changed after approval writes nothing and is named | unit | undeclared | |
| WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — the engine writes what the dashboard's acceptance commit writes, entry by entry in the queue's order | unit | undeclared | |
| WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — a second run writes nothing; a record the dashboard already applied is passed over | unit | undeclared | |
| A STALE APPROVAL IS NOT APPLIED — a malformed record is refused and named, and nothing of it is written | unit | undeclared | |
| the records are read from the approvals folder: README.md, other kinds and files that are no Markdown are passed over | unit | undeclared | |
| front matter: scalars and lists, body separated | unit | undeclared | |
| front matter with CR LF line ends: the fields of the LF text, the body the text's own bytes | unit | undeclared | |
| reviewedId: a reviewed file's identifier from its path — the same for a renamed file | unit | undeclared | |
| AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused with a finding | unit | undeclared | |
| AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends keeps its identifier; another one is still named | unit | undeclared | |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none | unit | undeclared | |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the click authority is what the write path takes: one commit, fast-forward only | unit | undeclared | |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event | unit | undeclared | |
| A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click | unit | undeclared | |
| EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so | unit | undeclared | |
| the jump host's settings are checked — a host, user or key name that could change the command is refused | unit | undeclared | |
| THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other | unit | undeclared | |
| a remote session is tested by asking whether anything answers at its local port — no token, nothing else | unit | undeclared | |
| the app never calls fetch directly — every request goes through fetchText | component | undeclared | |
| the kernel never writes — no kernel file imports a write function of the git host | component | undeclared | |
| the kernel never reads through the git host — no kernel file imports anything of it | component | undeclared | |
| the shells read only through what the git host provides — no file of the dashboard imports fetchText | component | undeclared | |
| the shells read only through what the git host provides — no file of the dashboard imports a read MOD-git-host keeps to itself | component | undeclared | |
| A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the GitLab check reports reach, branch and role as before, in one request | component | undeclared | |
| UC-001 — a server whose answer reports neither a visibility nor a default branch did not answer as a GitLab server | component | undeclared | |
| THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Pull requests, Actions, Workflows write, Metadata read | component | undeclared | |
| THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first | component | undeclared | |
| ONE GITHUB TOKEN SERVES EVERY FEATURE — the link, the steps and the guidance are written from requiredPermissions | component | undeclared | |
| UC-014: the setup step explains every permission and why it is needed | component | undeclared | |
| EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered | component | undeclared | |
| every site module parses — the app itself is only run in a browser, so check its syntax here | component | undeclared | |
| UC-014: setup names only the instance | component | undeclared | |
| the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed | component | undeclared | |
| A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — Agent M · owner/repository, within GitHub's 40 characters | component | undeclared | |
| A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — the description names the product repository, within GitHub's 1024 characters | component | undeclared | |
| the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere | component | undeclared | |
| status 'approved' is described truly for both routes — the dashboard's own commit and the workflow | component | undeclared | |
| the dashboard shows the last accepted text above a changed use case, with the core's diff | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — the load error names the account's limit and when it resets, and nothing about the token | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — without a token, the network's limit and when it resets | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — a refused write names the limit; counter-proof: a 403 without the headers is a missing permission | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — a GitLab product's limit is named by its server, without a time | component | undeclared | |
| AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — the load error still names a refused token and links its renewal | component | undeclared | |
| the dashboard is opened on a GitLab product by its address; its files link to GitLab | unit | undeclared | |
| A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line | unit | undeclared | |
| A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared | unit | undeclared | |
| A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier | unit | undeclared | |
| the accepted text is the exact text its record names — a blob that does not hash to it is refused | unit | undeclared | |
| A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only | unit | undeclared | |
| readBlob keeps the accepted text of a record by its blob SHA | unit | undeclared | |
| UC-001: no click, nothing at all — Add product without a click's authority writes nothing and stores nothing | unit | undeclared | |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes hands the authority to the write path; without one, none writes | unit | undeclared | |
| AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row | unit | undeclared | |
| A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on | unit | undeclared | |
| SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened | unit | undeclared | |
| A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order | unit | undeclared | |
| A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named | unit | undeclared | |
| A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice | unit | undeclared | |
| collaborators are saved by one commit of docs/collaborators.md, on a click | unit | undeclared | |
| GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head | unit | undeclared | |
| GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit | unit | undeclared | |
| GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed | unit | undeclared | |
| ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub | unit | undeclared | |
| ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each | unit | undeclared | |
| ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out | unit | undeclared | |
| AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named | unit | undeclared | |
| AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out | unit | undeclared | |
| GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token | unit | undeclared | |
| AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD | unit | undeclared | |
| SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other | unit | undeclared | |
| counter-proof: a file changed after the review page was built is left out and named; the others are still written | unit | undeclared | |
| A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until the engine's acceptance commit names its text, and an edit committed afterwards is not accepted | unit | undeclared | |
| A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file | unit | undeclared | |
| A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes an approval record for a reviewed file only, never for a job, gate or approval record | unit | undeclared | |
| A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is | unit | undeclared | |
| A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job record writes no approval record | unit | undeclared | |
| GITLAB PRODUCTS ARE SUPPORTED — list and get give the same data on GitHub and on a GitLab server | component | undeclared | |
| GITLAB PRODUCTS ARE SUPPORTED — counter-proof: a field the answer lacks is null, never invented | component | undeclared | |
| A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only at api.github.com, the GitLab token only at its project's API | component | undeclared | |
| A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — counter-proof: a product on another GitLab server gets neither token | component | undeclared | |
| UC-032 — list reads pages of 100, newest first, and stops at the page that reaches back past since | component | undeclared | |
| UC-032 — the state filter: open, merged, closed, all — merged told from closed on GitHub by merged_at | component | undeclared | |
| UC-032 — get(n) costs one request on GitLab and two on GitHub, the second for the workflow runs of the head commit | component | undeclared | |
| UC-032 — the CI state of the head: running, passed, failed, cancelled, or null where the server names none | component | undeclared | |
| a filter or a number that is not one is refused before anything is sent | component | undeclared | |
| a read needs no token: a public repository's pull requests are read without one, and no header is sent | component | undeclared | |
| ONE GITHUB TOKEN SERVES EVERY FEATURE — requiredPermissions on GitHub: Contents, Issues, Pull requests, Actions, Workflows write, Metadata read, each with why | component | undeclared | |
| A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — requiredPermissions on a GitLab server: role Maintainer, scope api | component | undeclared | |
| NO TEXT TRAVELS IN A URL: long values are refused | component | undeclared | |
| fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT) | component | undeclared | |
| THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the write path refuses a write without an authority: no request at all | component | undeclared | |
| the authority is one value of one shape — { kind } of three kinds; anything else is refused | component | undeclared | |
| each kind of authority writes one commit with the token it is given — the form the CI entry and the bridge app use | component | undeclared | |
| the request helper writes only on an authority and builds the header itself — a read needs none | component | undeclared | |
| one commit, fast-forward only, token only to the API | component | undeclared | |
| an edit is refused when the file changed since it was loaded | component | undeclared | |
| A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser | component | undeclared | |
| AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link | component | undeclared | |
| A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address | component | undeclared | |
| A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else | component | undeclared | |
| GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit | component | undeclared | |
| GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present | component | undeclared | |
| A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority: nothing is sent; the route is the token step | component | undeclared | |
| GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing | component | undeclared | |
| AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page | component | undeclared | |
| PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting | unit | undeclared | |
| A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly | unit | undeclared | |
| + Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off | unit | undeclared | |
| A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's | unit | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too | component | undeclared | |
| A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not | component | undeclared | |
| AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not | component | undeclared | |
| A REFUSED SAVE KEEPS THE EDIT — UC-008 3a: the use case changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it | component | undeclared | |
| A REFUSED SAVE KEEPS THE EDIT — UC-006 3a: the proposal changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it | component | undeclared | |
| A REFUSED SAVE KEEPS THE EDIT counter-proof: a save the server refuses for another reason (no write access) reads no newer version and shows none | component | undeclared | |
| the browser store keeps product addresses beside the token, once each | unit | undeclared | |
| SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting | unit | undeclared | |
| AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing | unit | undeclared | |
| UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both | unit | undeclared | |
| GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear | unit | undeclared | |
| SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product | unit | undeclared | |
| A GITHUB PRODUCT USES A TOKEN OF ITS OWN — in the browser store: one per GitHub product, beside the instance's; removed with the product and by a clear | unit | undeclared | |
| A GITHUB PRODUCT USES A TOKEN OF ITS OWN — tokenFor: a GitHub product's own token, or the instance's while it has none; a GitLab product's project token, never a GitHub one | unit | undeclared | |
| SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitHub product tokens included, merged per product | unit | undeclared | |
| THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear | unit | undeclared | |
| UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token | component | undeclared | |
| UC-008 4a counter-proof: a refusal for a used-up rate limit names the limit and offers no GitHub page | component | undeclared | |
| UC-008 4a counter-proof: a token the server refuses (401) is named for renewal, and no GitHub page is offered | component | undeclared | |
| A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's | component | undeclared | |
| UC-006 4c: a product's SPEC change refused for missing write access offers no GitHub page; counter-proof: the instance's does | component | undeclared | |
| writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not | component | undeclared | |
| reviewPage: every file that is not accepted is shown; those that can be accepted are counted; one that waits is named with what is open | unit | undeclared | |
| the architecture's review page shows every open or changed file in sequence — new in full, changed as a difference with its impact list, a waiting one marked | component | undeclared | |
| Accept all N shown: one commit with one record per file the page counted, each naming the blob of the text it rendered | component | undeclared | |
| counter-proof: a file changed between building the page and the click is left out and named | component | undeclared | |
| counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing | component | undeclared | |
| request count: the architecture's review page reads that area's files, the records and the texts its differences need on each load | component | undeclared | |
| the use cases' review page: a changed use case as its difference, no accepted one, no architecture file read; Accept all writes its record | component | undeclared | |
| without a token: no Accept all — GitHub's prefilled page for each record, as for a single Accept | component | undeclared | |
| the use-case list and the architecture view link to their review page; reading the lists stays as it was | component | undeclared | |
| queueJob — the CI route commits the job's start record at its path, on the head read, in one commit | unit | undeclared | |
| queueJob — the CI route refuses a moved head, with nothing written | unit | undeclared | |
| queueJob — the CI route refuses WorkflowMissing, naming the job workflow's file, for a product without it | unit | undeclared | |
| queueJob — the CI route's failures are the host's, by name | unit | undeclared | |
| TST-290128 | component | passed | |
| TST-290129 | component | passed | |
| TST-290125 | component | passed | |
| TST-290126 | component | passed | |
| TST-290127 | component | passed | |
| add-product — before a valid address, a placeholder with no known explanation, Step C disabled | unit | undeclared | |
| add-product — main flow: Step A prefilled and spelled out, Store and check flips Step A done, Add product writes and remembers | unit | undeclared | |
| add-product — 2a: Check on a 404 names the repository and links a new one; Step A stays not done | unit | undeclared | |
| add-product — 2a: Add product on a 404 names the repository, links a new one, writes nothing | unit | undeclared | |
| add-product — 3a/4a: a stored instance token alone never marks Step A done; a later failed check un-marks it | unit | undeclared | |
| add-product — step 4: a public repository's successful check never marks Step A done | unit | undeclared | |
| add-product — 5a: a write refused after a successful check un-marks Step A done; nothing is written | unit | undeclared | |
| add-product — 5b: a complete layout is left uncommitted, the address is still remembered | unit | undeclared | |
| TST-276 | unit | passed | |
| TST-277 | unit | passed | |
| TST-278 | unit | passed | |
| add-product — 3c/3d: GitLab's Step A is instructions only, Step B stores and checks the project's own token | unit | undeclared | |
| TST-288 | unit | passed | |
| TST-289 | unit | passed | |
| add-product — GitLab: a project's own token already stored offers Check beside pasting a new one | unit | undeclared | |
| add-product — the address field's folded explanation is the 'repository' topic | unit | undeclared | |
| TST-287001 | unit | passed | |
| TST-287002 | unit | passed | |
| the public Bridge route pairs, reloads, hides and really clears Bridge settings | unit | undeclared | |
| the Bridge route names a refused pair and saves HTTPS jump-host access without a hidden request | unit | undeclared | |
| TST-265001 | unit | passed | |
| TST-265002 | unit | passed | |
| TST-265003 | unit | passed | |
| TST-265004 | unit | passed | |
| TST-265005 | unit | passed | |
| TST-265006 | unit | passed | |
| TST-265007 | unit | passed | |
| TST-265008 | unit | passed | |
| TST-265009 | unit | passed | |
| TST-265010 | unit | passed | |
| TST-265011 | unit | passed | |
| TST-265012 | unit | passed | |
| TST-265013 | unit | passed | |
| TST-265014 | unit | passed | |
| TST-265015 | unit | passed | |
| TST-265016 | unit | passed | |
| TST-288001 | unit | passed | |
| TST-288002 | unit | passed | |
| TST-288003 | unit | passed | |
| TST-290116 | unit | passed | |
| TST-290117 | unit | passed | |
| TST-290118 | unit | passed | |
| TST-290119 | unit | passed | |
| TST-290120 | unit | passed | |
| TST-290123 | unit | passed | |
| TST-290124 | unit | passed | |
| TST-290121 | unit | passed | |
| TST-290122 | unit | passed | |
| TST-290109 | unit | passed | |
| TST-290110 | unit | passed | |
| TST-290111 | unit | passed | |
| TST-290112 | unit | passed | |
| TST-290113 | unit | passed | |
| explanations.md — each of UC-002's choices points to a chapter of the book | unit | undeclared | |
| schemaForm — a field for each key and each section of the schema, holding the document's values | unit | undeclared | |
| schemaForm — a finding is shown beside its field, and Save is offered only while no error remains | unit | undeclared | |
| schemaForm — Save hands the document over once, on a person's click | unit | undeclared | |
| schemaForm — the form opens with its first field focused | unit | undeclared | |
| explain — the folded What is this? of a topic, rendered from explanations.md | unit | undeclared | |
| explain — an empty element for a topic the file does not hold | unit | undeclared | |
| explain — repository: what a repository is (UC-001) | unit | undeclared | |
| explain — product-key: why the product gets a key of its own (UC-001) | unit | undeclared | |
| explain — review-layout-commit: what the commit contains (UC-001) | unit | undeclared | |
| explain — reverting-the-commit: how to undo it (UC-001) | unit | undeclared | |
| explain — the-product-list: why the product list lives in this browser only (UC-001) | unit | undeclared | |
| explain — release-test-levels: what each level checks (UC-013) | unit | undeclared | |
| explain — independent-release-tests: why a different participant writes them (UC-013) | unit | undeclared | |
| explain — version-not-rewritten: why a released version is never changed afterwards (UC-013) | unit | undeclared | |
| startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product | unit | undeclared | |
| instanceOf — Pages identity through MOD-identifiers and the upstream fallback | unit | undeclared | |
| notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation | unit | undeclared | |
| explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation | unit | undeclared | |
| TST-264 | unit | passed | |
| sourceSchemas — gives entry and links: links is the schema of a product's docs/sources.md, its table under the product's own title | unit | undeclared | |
| links — a product's links file read with the links schema, rows with and without a part, and written back byte for byte | unit | undeclared | |
| links — a row without its version or its hash is refused by writeDocument with DocumentError naming the row and the column | unit | undeclared | |
| links — this instance's docs/sources.md read with the links schema: its row naming SRC-vibe-coding at the version 2026-10-05 | unit | undeclared | |
| sourceSchemas — the entry's schema is read from the module's own source.schema.md: from the disk in Node, from its own address in a browser | unit | undeclared | |
| sourceSchemas — a register entry read through MOD-documents with the entry's schema: its front matter, ## Versions, ## Parts | unit | undeclared | |
| sourceSchemas — the entry's schema holds the module file's rules: a licence, the closed kinds, three authorities, a standard's designation, versions that only grow | unit | undeclared | |
| permittedPlaces — four entries: may be republished, any; restricted with places, those; restricted with none, none; unknown, as restricted | unit | undeclared | |
| permittedPlaces — this instance's entry SRC-vibe-coding, whose licence permits republishing, permits any place | unit | undeclared | |
| queues — an open, an approved and an in-SPEC entry, found past an impact table | unit | undeclared | |
| queues — more than one queue, newest first | unit | undeclared | |
| with skeleton.md unreadable on the disk, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason | unit | undeclared | |
| with skeleton.md not served at the module's address, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason | unit | undeclared | |
| with skeleton.md readable, specSkeleton gives the same text as before | unit | undeclared | |
| parseSpec — the requirements of a SPEC with their four fields, their section and their line | unit | undeclared | |
| parseSpec — a source over several lines, and several sources split at `;`, with and without their parts | unit | undeclared | |
| parseSpec — a check naming several tests split at ` · `, and one at review naming none | unit | undeclared | |
| parseSpec — a requirement missing a field is read with that field null, not guessed | unit | undeclared | |
| parseSpec — the text of one section, such as a change queue's proposal, is read as a SPEC is read | unit | undeclared | |
| parseSpec — what a requirement constrains follows from the SPEC it stands in; no field of Requirement holds it | unit | undeclared | |
| specSkeleton — the title names the product: `# <product> — Specification` | unit | undeclared | |
| specSkeleton — a preamble says what a requirement is in this form: its name, source, rule and *Check:* | unit | undeclared | |
| specSkeleton — an empty first section, and no other section | unit | undeclared | |
| specSkeleton — reads as a SPEC without a requirement | unit | undeclared | |
| specSkeleton — only the product is put in; the rest is the same for every product | unit | undeclared | |
| recordIndex: the records named in a tree, by identifier and by SPEC entry; any other name is unknown | unit | undeclared | |
| STATUS IS DERIVED FROM THE RECORDS — from the names, equal to reading every record, reading only where names cannot decide | unit | undeclared | |
| counter-proof: a record named for the current blob whose content names another blob does not accept the file where it is read | unit | undeclared | |
| STATUS IS DERIVED FROM THE RECORDS — SPEC entries: decided ones read no record, undecided ones only their own | unit | undeclared | |
| readByBlob: a kept text that hashes to the SHA is used without reading; a text read is kept by its SHA | unit | undeclared | |
| counter-proof: a kept text whose SHA does not match is read again and replaced; a text that does not match its SHA is not kept | unit | undeclared | |
| readByBlob: a cache that fails at every step is passed over — the text is read | unit | undeclared | |
| #spec reads fresh current SPEC bytes and keeps queue history for empty or absent SPEC | system | undeclared | |
| the dashboard #spec controls collapse sections and toggle a current requirement in place | system | undeclared | |
| TST-281 | system | passed | |
| TST-282 | system | passed | |
| TST-284 | system | passed | |
| TST-285 | system | passed | |
| UC-002 main flow, step 1: the page opens with the table of the process model and the rules to be met, folded only after the first reading | system | undeclared | |
| UC-002 main flow, steps 1–2: the table, then the book's five models in their two groups, each with its risks, its example and its chapter | system | undeclared | |
| UC-002 main flow, steps 3–4: the author chooses Scrum; its roles, who may fill each and what it needs; only participants with every capability are offered, each with its place | system | undeclared | |
| UC-002 main flow, step 5: the phases, each gate with what it checks and who decides it; without a branch, work merges into the default branch | system | undeclared | |
| UC-002 main flow, step 5: the transitions between the phases, and which phases pair for verification | system | undeclared | |
| UC-002 main flow, step 5: a sprint's branch of its own, and its merge into the default branch as the gate at its end, decided by the Product Owner after the review | system | undeclared | |
| UC-002 main flow, step 6: the practices, each with the models it fits; adding one leaves the model as it is | system | undeclared | |
| UC-002 main flow, step 6: each practice says what it adds | system | undeclared | |
| UC-002 main flow, step 7: what the product's process requirements add, each marked with its requirement and its source | system | undeclared | |
| UC-002 main flow, step 8: the Definition of Done, preset to the job rules, and the folded word on who meets it in Scrum | system | undeclared | |
| UC-002 main flow, steps 3–9: the author's choices, then one click on Save commits the declaration to the product repository | system | undeclared | |
| UC-002 main flow: every choice carries a folded What is this? with a pointer to the book | system | undeclared | |
| UC-002 alternative flow 3a: the organisation's own process, a data file in the catalogue's format, is offered and used | system | undeclared | |
| UC-002 alternative flow 3b: changing the model lists the artifacts the new one no longer requires; none is deleted, and the process requirement keeps its gate | system | undeclared | |
| UC-002 alternative flow 4a: a role that needs a person has none — Save stays disabled, and the role is named | system | undeclared | |
| UC-002 alternative flow 4b: no participant has the capabilities a role needs — the missing capability is named | system | undeclared | |
| UC-002 alternative flow 4b: the missing capability links to UC-017, to add a participant that has it | system | undeclared | |
| UC-002 alternative flow 4c: a participant processes data where a linked source does not permit it — the source and the role are named, and the assignment stays possible | system | undeclared | |
| UC-002 alternative flow 7a: no process requirements yet — the view says so; once one is accepted, its addition appears and the model stays | system | undeclared | |
| UC-002 alternative flow 7b: a process requirement needs a gate the model does not have — the gate is shown being added, and where; the model stays Kanban | system | undeclared | |
| TST-266001 | system | passed | |
| TST-292001 | system | passed | |
| TST-292002 | system | passed | |
| TST-292003 | system | passed | |
| TST-292004 | system | passed | |
| TST-292011 | system | passed | |
| step 1: the line Notifications sits in the section *this browser*, and says off | system | undeclared | |
| step 1: Switch on asks the browser's permission once, directly on the click, then offers Test and Switch off | system | undeclared | |
| step 2: the check of the instance connects with the instance's own stored token | system | undeclared | |
| TST-279 | system | passed | |
| step 1 into step 3: the first check after Switch on tells nothing, even though something already waits | system | undeclared | |
| step 3 (and 3a): a file come to wait is notified once, naming it and an address this page resolves | system | undeclared | |
| step 3: more than three of one kind in one repository give one notification of their number | system | undeclared | |
| step 4: what was notified is kept — nothing twice while unchanged, a file changed again comes to wait anew | system | undeclared | |
| 1a: the person, or the browser, refuses — the line says blocked, and where to allow it; nothing is stored | system | undeclared | |
| 1b: on an iPhone or iPad not opened from the Home Screen, the line says so and how to add it | system | undeclared | |
| 2a/2b: while not due, opening the page makes no check — the last check time is left exactly as it was | system | undeclared | |
| 2c: a server that cannot be reached is skipped until the next check; nothing lost, nothing notified in between | system | undeclared | |
| 4a: Switch off stops the checks and forgets what was notified | system | undeclared | |
| TST-293001 | system | passed | |
| a '//' declaration is read with every key — MOD-test-document | unit | undeclared | |
| a '#' declaration is read with every key — MOD-test-document | unit | undeclared | |
| a '--' declaration is read with every key — MOD-test-document | unit | undeclared | |
| a ';' declaration is read with every key — MOD-test-document | unit | undeclared | |
| a ' *' block-comment declaration is read with every key — MOD-test-document | unit | undeclared | |
| a Markdown heading declaration is read with every key — MOD-test-document | unit | undeclared | |
| a declaration missing a key is read with that key null — MOD-test-document | unit | undeclared | |
| a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document | unit | undeclared | |
| a following line whose value holds ' · ' does not end the declaration — MOD-test-document | unit | undeclared | |
| a file without a declaration yields none — MOD-test-document | unit | undeclared | |
| TST-289001 | unit | passed | |
| TST-289002 | unit | passed | |
| TST-289003 | unit | passed | |
| TST-289004 | unit | passed | |
| release — main flow: version and entry before Start, the candidate and its run after it, the report once the run has ended, Accept and release in one click | unit | undeclared | |
| release — 1a: the year that changed restarts the version at YYYY.1.0 | unit | undeclared | |
| release — 2a: only the implementing participant can run the release tests | unit | undeclared | |
| release — 3a/3b: a red level and a worse rate ask for a reason first; without one Accept and release is refused, with one it releases | unit | undeclared | |
| release — 4a: a tag that already exists stops the release, naming 4a; the existing tag is not moved | unit | undeclared | |
| release — 4b: a default branch that moved on while the suite ran still releases, tagged on the tested commit | unit | undeclared | |
| defaultSchedule — the book's default, read with the schema, marked as the default | unit | undeclared | |
| scheduleSchema — a product's own schedule, read with the schema | unit | undeclared | |
| scheduleSchema — a schedule of another shape, named by MOD-documents' findings | unit | undeclared | |
| parseFrontMatter — a text with front matter: its fields, their order, the body and the line it begins on | unit | undeclared | |
| parseFrontMatter — CR LF line ends, values trimmed, and `[]` as an empty list | unit | undeclared | |
| parseFrontMatter — a text without front matter, and one whose front matter is broken, are all body | unit | undeclared | |
| formatFrontMatter — what parseFrontMatter read gives back the same bytes | unit | undeclared | |
| formatFrontMatter — keys in `order`, a list one item per line, an empty list as `key:` alone, the body unchanged | unit | undeclared | |
| formatFrontMatter — a key not of the form [a-z][a-z0-9_-]*, or a value holding a line break, throws a TypeError | unit | undeclared | |
| finding and formatFinding — the module file's example, as data and as its one line of text | unit | undeclared | |
| parseFinding — a finding written in its one text form is read back unchanged | unit | undeclared | |
| finding — a kind, a line or a rule out of its form throws a TypeError | unit | undeclared | |
| parseFinding — null for any line of another form | unit | undeclared | |
| blobSha — git's blob SHA of a text, the same as git hash-object gives for its bytes | unit | undeclared | |
| blobSha — the known blobs, and a text hashed as given, line ends included | unit | undeclared | |
| historyMarks — withdrawals, edit stamps and dates, each with its line and its kind | unit | undeclared | |
| historyMarks — the same marks in a text with CR LF line ends | unit | undeclared | |
| historyMarks — none in a text without them | unit | undeclared | |
| historyMarks — a date of a change in its three forms, each marked dated-change | unit | undeclared | |
| historyMarks — a retrieval date, a version, a release, a measurement and a date in a table's cell are no mark | unit | undeclared | |
| lineDiff — every line of both texts, in order, each with its line before and after | unit | undeclared | |
| lineDiff — as few added and removed lines as the two texts allow | unit | undeclared | |
| lineDiff — a text that changed only its line endings shows no difference | unit | undeclared | |
| lineDiff — an empty text has no line | unit | undeclared | |
| the requirements of SPEC.md are nodes — MOD-trace-graph | unit | undeclared | |
| the tests of a test file are nodes, with a guards edge from each to what it guards — MOD-trace-graph | unit | undeclared | |
| a file that cannot be read is listed in unread, with the reason — MOD-trace-graph | unit | undeclared | |
| tracesTo gives the tests that guard a requirement, and none for a requirement that no test guards — MOD-trace-graph | unit | undeclared | |
| UC-025 step 5, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a module a gap names is marked, a module no gap names is not | unit | undeclared | |
| UC-025 step 4 and 5 — several gaps naming the same module mark it once; a gap naming no drawn module marks nothing | unit | undeclared | |
| UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used interface an existing module does not provide is drawn as an arrow ending in a box marked missing | unit | undeclared | |
| UC-025 step 5 — the text for 52 modules with 400 uses, every module also marked by a gap, stays below Mermaid's limit of 50,000 characters | unit | undeclared | |
| UC-025 step 5 — one box per module, showing its identifier and title, whatever its title holds | unit | undeclared | |
| UC-025 step 5, A MODULE BELONGS TO ONE SUBSYSTEM — one box per subsystem holding its modules; the subsystem is the first decision a module follows | unit | undeclared | |
| UC-025 step 5 — one arrow per pair of a module and a module it uses, however many of its interfaces it uses | unit | undeclared | |
| UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used module that has no file is drawn as one box marked missing | unit | undeclared | |
| UC-025 step 5 — the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters, however many interfaces each use names | unit | undeclared | |
| the public trace/specification route reads the pinned SPEC and lists each requirement in file order | unit | undeclared | |
| selecting a requirement renders its four fields safely without navigating to a queue | unit | undeclared | |
| section headings start collapsed and independently toggle their requirement lists | unit | undeclared | |
| a requirement name toggles its row-local detail closed and open again | unit | undeclared | |
| an absent or empty SPEC has an explicit empty state and rendering offers no write | unit | undeclared | |
| TST-284001 | unit | passed | |
| TST-284002 | unit | passed | |
| TST-284003 | unit | passed | |
| TST-286001 | unit | passed | |
| TST-286002 | unit | passed | |
| TST-286003 | unit | passed | |
| TST-286004 | unit | passed | |
| TST-286005 | unit | passed | |
| TST-286006 | unit | passed | |
| TST-286007 | unit | passed | |
| TST-286008 | unit | passed | |
| TST-286009 | unit | passed | |
| TST-286010 | unit | passed | |
| TST-286011 | unit | passed | |
| TST-286012 | unit | passed | |
| planSchemas.backlogOrder — an order whose table Item names items is read as those items, in the table's order | unit | undeclared | |
| planSchemas.backlogOrder — a row whose cell is no item's identifier is named as a finding of that row | unit | undeclared | |
| planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order | unit | undeclared | |
| test_apply_approvals.ApplierPassesOverArchitectureRecords.test_the_applier_passes_over_architecture_records | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_approved_proposal_is_written_verbatim | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_blob_sha_equals_git | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_readme_with_example_records_is_not_a_record | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_record_anchor_must_match_the_queue | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_record_outside_a_queue_is_refused | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_second_run_changes_nothing | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_stale_proposal_is_not_applied | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_stale_section_is_not_applied | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_unknown_queue_is_refused_not_crashed | unit | undeclared | |
| test_apply_approvals.ApplyTests.test_use_case_records_are_left_alone | unit | undeclared | |
| test_apply_approvals.DashboardCommitTests.test_dashboard_writes_what_the_workflow_writes | unit | undeclared | |
| test_apply_approvals.DashboardCommitTests.test_record_whose_decision_row_exists_is_skipped | unit | undeclared | |
| test_apply_approvals.EngineKeepsTheBytes.test_a_proposal_with_crlf_line_ends_is_written_byte_for_byte | unit | undeclared | |
| test_apply_approvals.EngineKeepsTheBytes.test_a_section_with_cr_bytes_that_did_not_change_is_replaced | unit | undeclared | |
| test_apply_approvals.EngineKeepsTheBytes.test_counter_proof_a_changed_section_with_cr_bytes_is_still_refused | unit | undeclared | |
| test_apply_approvals.EngineKeepsTheBytes.test_cr_bytes_outside_the_approved_section_stay | unit | undeclared | |
| test_apply_approvals.Twin.test_a_second_run_writes_nothing_on_either_side | unit | undeclared | |
| test_apply_approvals.Twin.test_the_cases_apply_refuse_and_pass_over | unit | undeclared | |
| test_apply_approvals.Twin.test_the_engine_writes_the_bytes_and_the_report_of_the_python_tool | unit | undeclared | |
| test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_proposal_with_crlf_line_ends | unit | undeclared | |
| test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_section_with_cr_bytes | unit | undeclared | |
| test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_spec_with_cr_bytes_outside_the_section | unit | undeclared | |
| test_approval_records.ApprovalRecords.test_a_record_of_a_renamed_use_case_stays_valid | unit | undeclared | |
| test_approval_records.ApprovalRecords.test_counter_proof | unit | undeclared | |
| test_approval_records.ApprovalRecords.test_every_record_is_well_formed | unit | undeclared | |
| test_approval_records.ApprovalRecords.test_records_of_architecture_decisions_and_modules | unit | undeclared | |
| test_architecture_files.ArchitectureFiles.test_a_file_that_is_neither_is_named | unit | undeclared | |
| test_architecture_files.ArchitectureFiles.test_counter_proof_decision | unit | undeclared | |
| test_architecture_files.ArchitectureFiles.test_counter_proof_module | unit | undeclared | |
| test_architecture_files.ArchitectureFiles.test_empty_lists_are_allowed_where_the_SPEC_reports_gaps | unit | undeclared | |
| test_architecture_files.ArchitectureFiles.test_every_architecture_file_of_the_instance_is_complete | unit | undeclared | |
| test_architecture_files.ArchitectureFiles.test_the_fixture_files_are_complete | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_a_diagram_that_is_not_mermaid | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_a_file_that_is_not_markdown | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_mermaid_and_text_about_images_pass | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_the_image_reader_finds_the_image_of_a_use_case_fixture | unit | undeclared | |
| test_artifact_format.ArtifactsAreMarkdown.test_this_repository_has_mermaid_diagrams_to_find | unit | undeclared | |
| test_backlog_item_fields.TestAgentMsOwnBacklog.test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from | unit | undeclared | |
| test_backlog_item_fields.TestAnItemFromAnIssue.test_a_bug_realises_the_requirement_the_code_violates | unit | undeclared | |
| test_backlog_item_fields.TestAnItemFromAnIssue.test_a_change_realises_the_requirements_of_its_queue_entries_each_once | unit | undeclared | |
| test_backlog_item_fields.TestAnItemFromAnIssue.test_an_issue_without_a_description_gives_an_empty_outcome | unit | undeclared | |
| test_backlog_item_fields.TestAnItemFromAnIssue.test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing | unit | undeclared | |
| test_backlog_item_fields.TestAnItemFromAnIssue.test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item | unit | undeclared | |
| test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_a_use_case_counts_only_when_the_product_has_it | unit | undeclared | |
| test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_checking_leaves_the_item_as_it_was | unit | undeclared | |
| test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_counter_proof_another_identifier_in_capitals_is_no_requirement_name | unit | undeclared | |
| test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_every_broken_item_yields_exactly_the_findings_expected_json_names | unit | undeclared | |
| test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_the_items_of_the_fixture_backlog_have_no_finding | unit | undeclared | |
| test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_without_known_names_only_the_form_of_a_name_is_checked | unit | undeclared | |
| test_backlog_item_fields.TestAnItemThatRestatesAnother.test_an_item_with_the_outcome_of_another_is_flagged | unit | undeclared | |
| test_backlog_item_fields.TestAnItemThatRestatesAnother.test_an_item_with_the_title_of_another_is_flagged | unit | undeclared | |
| test_backlog_item_fields.TestAnItemThatRestatesAnother.test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome | unit | undeclared | |
| test_backlog_item_fields.TestTheJobThatDraftsItems.test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria | unit | undeclared | |
| test_backlog_item_fields.TestTheJobThatDraftsItems.test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged | unit | undeclared | |
| test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_checks_it_names_are_functions_of_the_module | unit | undeclared | |
| test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items | unit | undeclared | |
| test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_prompt_fills_every_input_and_nothing_else | unit | undeclared | |
| test_backlog_layout.TestAgentMsOwnBacklog.test_every_item_of_this_repository_is_read_without_a_problem | unit | undeclared | |
| test_backlog_layout.TestAgentMsOwnBacklog.test_the_backlog_is_markdown_under_docs_backlog | unit | undeclared | |
| test_backlog_layout.TestAgentMsOwnBacklog.test_the_order_of_this_repository_places_every_item_once | unit | undeclared | |
| test_backlog_layout.TestAnItemIsRead.test_a_section_the_item_lacks_is_read_as_empty | unit | undeclared | |
| test_backlog_layout.TestAnItemIsRead.test_an_item_is_read_into_its_parts | unit | undeclared | |
| test_backlog_layout.TestAnItemIsRead.test_an_origin_that_is_no_issue_is_kept_as_it_is_written | unit | undeclared | |
| test_backlog_layout.TestAnItemIsRead.test_lists_may_be_empty_and_an_origin_may_name_several_issues | unit | undeclared | |
| test_backlog_layout.TestTheOrder.test_an_order_naming_every_item_leaves_nothing_unplaced | unit | undeclared | |
| test_backlog_layout.TestTheOrder.test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem | unit | undeclared | |
| test_backlog_layout.TestTheOrder.test_prose_and_other_lists_of_the_order_file_are_not_read_as_items | unit | undeclared | |
| test_backlog_layout.TestTheOrder.test_the_order_follows_the_lines_not_their_numbers | unit | undeclared | |
| test_backlog_layout.TestTheOrder.test_the_order_names_items_and_the_rest_is_appended_at_the_bottom | unit | undeclared | |
| test_backlog_layout.TestTheOrder.test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier | unit | undeclared | |
| test_backlog_layout.TestWhereAnItemLives.test_counter_proof_a_file_without_front_matter_is_no_item | unit | undeclared | |
| test_backlog_layout.TestWhereAnItemLives.test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem | unit | undeclared | |
| test_backlog_layout.TestWhereAnItemLives.test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem | unit | undeclared | |
| test_backlog_layout.TestWhereAnItemLives.test_every_item_of_the_fixture_backlog_is_where_an_item_must_be | unit | undeclared | |
| test_bridge_tunnel.ReverseTunnelOnLoopback.test_a_command_that_would_break_the_rule_is_never_written | unit | undeclared | |
| test_bridge_tunnel.ReverseTunnelOnLoopback.test_counter_proof_any_other_bind_address_fails | unit | undeclared | |
| test_bridge_tunnel.ReverseTunnelOnLoopback.test_the_generated_reverse_command_names_the_loopback_address | unit | undeclared | |
| test_ci_budget.PullRequestCiWithinTwoMinutes.test_counter_proof_a_job_without_the_limit_or_with_a_longer_one_is_named | unit | undeclared | |
| test_ci_budget.PullRequestCiWithinTwoMinutes.test_every_job_of_the_pull_request_workflow_stops_after_two_minutes | unit | undeclared | |
| test_clear_removes_storage.ClearRemovesStorage.test_clear_leaves_no_agent_m_key | unit | undeclared | |
| test_clear_removes_storage.ClearRemovesStorage.test_counter_proof_a_form_reset_is_not_a_clear | unit | undeclared | |
| test_config_client_side.ConfigClientSide.test_counter_proof_access_not_the_word | unit | undeclared | |
| test_config_client_side.ConfigClientSide.test_only_the_store_module_touches_browser_storage | unit | undeclared | |
| test_config_client_side.ConfigClientSide.test_token_lands_in_the_given_browser_store | unit | undeclared | |
| test_coverage_report.ModuleGaps.test_a_withdrawn_name_is_a_gap_with_its_note | unit | undeclared | |
| test_coverage_report.ModuleGaps.test_counter_proof_a_module_with_requirement_code_and_test_is_no_gap | unit | undeclared | |
| test_coverage_report.ModuleGaps.test_each_module_row_names_what_it_realises_follows_its_code_and_its_tests | unit | undeclared | |
| test_coverage_report.ModuleGaps.test_the_four_gaps_of_the_rule_and_those_of_uc_025_are_listed | unit | undeclared | |
| test_coverage_report.NothingBlocks.test_every_view_is_computed_on_a_graph_full_of_gaps | unit | undeclared | |
| test_coverage_report.UnrealisedRequirements.test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed | unit | undeclared | |
| test_coverage_report.UnrealisedRequirements.test_counter_proof_a_realised_requirement_is_no_gap | unit | undeclared | |
| test_coverage_report.UnrealisedRequirements.test_the_fixture_has_no_coverage_gap_but_its_untested_rule | unit | undeclared | |
| test_destination_disclosure.DestinationDisclosure.test_disclosed_destinations_match_where_the_token_may_go | component | undeclared | |
| test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_complete_use_case_passes | unit | undeclared | |
| test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_diagram_stored_as_an_image_is_reported | unit | undeclared | |
| test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_use_case_without_a_mermaid_block_is_reported | unit | undeclared | |
| test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image | unit | undeclared | |
| test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture | unit | undeclared | |
| test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_the_dashboards_reader_reports_the_same_on_their_lines | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_a_gate_may_check_what_an_earlier_phase_produced | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_a_gate_with_artifacts_and_a_condition_passes | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_counter_proof_a_back_transition_does_not_make_the_phase_it_leaves_earlier | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_without_a_condition_is_refused | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_without_artifacts_is_refused | unit | undeclared | |
| test_gate_definition.TestGateDefinition.test_every_gate_is_read_with_what_it_checks | unit | undeclared | |
| test_groups.ArrangedInNestedGroups.test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes | unit | undeclared | |
| test_groups.ArrangedInNestedGroups.test_every_kind_reads_as_its_nested_hierarchy | unit | undeclared | |
| test_groups.ArrangedInNestedGroups.test_format_of_parse_is_the_text_of_a_canonical_file | unit | undeclared | |
| test_groups.ArrangedInNestedGroups.test_format_writes_the_canonical_text | unit | undeclared | |
| test_groups.ArrangedInNestedGroups.test_format_writes_the_heading_it_is_given | unit | undeclared | |
| test_groups.GroupCarriesNoIdentifier.test_a_group_is_named_by_its_title_only | unit | undeclared | |
| test_groups.GroupCarriesNoIdentifier.test_a_group_title_named_as_an_identifier_is_found | unit | undeclared | |
| test_groups.GroupCarriesNoIdentifier.test_a_title_written_like_an_identifier_is_reported | unit | undeclared | |
| test_groups.GroupCarriesNoIdentifier.test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected | unit | undeclared | |
| test_groups.GroupFileFindings.test_every_broken_fixture_yields_exactly_the_findings_expected_json_names | unit | undeclared | |
| test_groups.GroupFileFindings.test_the_complete_files_yield_no_finding | unit | undeclared | |
| test_groups.OneKindOfArtifact.test_a_member_of_another_kind_is_reported | unit | undeclared | |
| test_groups.OneKindOfArtifact.test_a_move_into_a_group_of_another_kind_is_refused | unit | undeclared | |
| test_groups.OneKindOfArtifact.test_an_empty_hierarchy_holds_the_kind_it_is_given | unit | undeclared | |
| test_groups.OnePlaceInTheHierarchy.test_a_move_that_would_lose_or_duplicate_is_refused | unit | undeclared | |
| test_groups.OnePlaceInTheHierarchy.test_a_moved_item_or_group_leaves_no_copy_behind | unit | undeclared | |
| test_groups.OnePlaceInTheHierarchy.test_an_item_listed_twice_is_reported_in_both_places | unit | undeclared | |
| test_groups.OnePlaceInTheHierarchy.test_apply_moves_leaves_the_tree_it_is_given_as_it_was | unit | undeclared | |
| test_groups.OnePlaceInTheHierarchy.test_create_rename_and_delete_change_only_groups | unit | undeclared | |
| test_groups.OnePlaceInTheHierarchy.test_every_known_item_has_exactly_one_place | unit | undeclared | |
| test_groups.OwnGroupFile.test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind | unit | undeclared | |
| test_groups.OwnGroupFile.test_the_group_file_holds_titles_and_identifiers_only | unit | undeclared | |
| test_groups.RegroupingLeavesTheGroupedFilesUnchanged.test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after | unit | undeclared | |
| test_groups.UngroupedItemAtTheTopLevel.test_a_not_yet_placed_item_is_written_only_once_it_is_moved | unit | undeclared | |
| test_groups.UngroupedItemAtTheTopLevel.test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed | unit | undeclared | |
| test_groups.UngroupedItemAtTheTopLevel.test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named | unit | undeclared | |
| test_groups.UngroupedItemAtTheTopLevel.test_without_a_group_file_every_item_is_at_the_top_level | unit | undeclared | |
| test_home_screen_icon.HomeScreenIcon.test_both_pages_declare_the_icon | unit | undeclared | |
| test_home_screen_icon.HomeScreenIcon.test_counter_proofs_full_size_transparent_and_too_small_are_named | unit | undeclared | |
| test_home_screen_icon.HomeScreenIcon.test_the_sign_stands_at_80_percent_on_a_white_square | unit | undeclared | |
| test_identifier_stability.IdentifierStability.test_an_identifier_travels_with_its_artifact | unit | undeclared | |
| test_identifier_stability.IdentifierStability.test_counter_proof_a_withdrawn_identifier_is_not_reused | unit | undeclared | |
| test_identifier_stability.IdentifierStability.test_counter_proof_a_withdrawn_identifier_without_its_note | unit | undeclared | |
| test_identifier_stability.IdentifierStability.test_counter_proof_an_identifier_gone_without_a_note | unit | undeclared | |
| test_identifier_stability.IdentifierStability.test_counter_proof_the_earlier_version_read_as_the_later_one | unit | undeclared | |
| test_identifiers.Identifiers.test_counter_proof_a_file_without_an_identifier | unit | undeclared | |
| test_identifiers.Identifiers.test_counter_proof_a_malformed_identifier_has_no_kind | unit | undeclared | |
| test_identifiers.Identifiers.test_counter_proof_a_requirement_without_a_name_in_capitals | unit | undeclared | |
| test_identifiers.Identifiers.test_counter_proof_a_test_whose_cases_carry_no_identifier | unit | undeclared | |
| test_identifiers.Identifiers.test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries | unit | undeclared | |
| test_identifiers.Identifiers.test_counter_proof_one_identifier_on_two_artifacts | unit | undeclared | |
| test_identifiers.Identifiers.test_every_artifact_of_the_fixture_is_read_by_its_identifier | unit | undeclared | |
| test_identifiers.Identifiers.test_the_kind_of_an_identifier_is_told_by_its_form | unit | undeclared | |
| test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_a_requirement_renamed_in_place_is_touched_as_a_withdrawal | unit | undeclared | |
| test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_counter_proof_without_the_queues_index_or_its_section_nothing_is_guessed | unit | undeclared | |
| test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_the_section_is_the_one_the_index_names_not_the_entrys_first_line | unit | undeclared | |
| test_impact_list.ImpactOfARequirementChange.test_a_withdrawn_requirement_lists_what_still_names_it | unit | undeclared | |
| test_impact_list.ImpactOfARequirementChange.test_counter_proof_what_does_not_name_it_is_not_listed | unit | undeclared | |
| test_impact_list.ImpactOfARequirementChange.test_every_artifact_naming_the_requirement_is_listed | unit | undeclared | |
| test_impact_list.ImpactOfARequirementChange.test_the_open_entry_is_shown_with_what_it_would_change_and_the_list_of_each_existing_name | unit | undeclared | |
| test_instance_target.InstanceTarget.test_fork_address_names_the_fork | unit | undeclared | |
| test_instance_target.InstanceTarget.test_local_serving_falls_back_to_upstream | unit | undeclared | |
| test_instance_target.InstanceTarget.test_malformed_repo_query_is_ignored | unit | undeclared | |
| test_instance_target.InstanceTarget.test_product_is_chosen_by_query_the_instance_stays | unit | undeclared | |
| test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_a_planned_model_works_from_its_plan_and_refuses_neither | unit | undeclared | |
| test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model | unit | undeclared | |
| test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_counter_proof_an_item_of_the_backlog_starts_in_both | unit | undeclared | |
| test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_blocks_it | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_retried_by_a_later_running_one_is_in_progress | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_job_that_ended_without_record_blocks_it | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_merged_pull_request_makes_it_done_and_is_named | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_a_running_or_queued_job_makes_it_in_progress_and_is_named | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_an_item_back_in_development_after_its_merge_is_in_progress_again | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_an_item_whose_names_are_all_accepted_is_ready | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_an_open_pull_request_makes_it_in_progress_and_is_named | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing | unit | undeclared | |
| test_job_from_backlog.TestTheStateOfAnItem.test_what_is_happening_is_shown_before_what_is_not_accepted | unit | undeclared | |
| test_jsrun_names.ModuleFolderNames.test_a_folder_without_an_index_keeps_the_names_of_its_files | unit | undeclared | |
| test_jsrun_names.ModuleFolderNames.test_every_module_folder_has_its_index_and_its_parts_by_the_folder_name | unit | undeclared | |
| test_jsrun_names.ModuleFolderNames.test_two_files_that_would_share_a_name_are_still_refused | unit | undeclared | |
| test_licence.Licence.test_counter_proof | unit | undeclared | |
| test_licence.Licence.test_root_licence_is_mit | unit | undeclared | |
| test_main_page.EachProductsProgressByStage.test_counter_proof_a_red_ci_guards_no_requirement | unit | undeclared | |
| test_main_page.EachProductsProgressByStage.test_counter_proof_with_all_four_accepted_the_stage_is_at_100_percent | unit | undeclared | |
| test_main_page.EachProductsProgressByStage.test_each_stage_is_filled_by_the_share_of_its_work_that_is_accepted_or_done | unit | undeclared | |
| test_main_page.EachProductsProgressByStage.test_the_six_stages_stand_in_their_order | unit | undeclared | |
| test_main_page.EachProductsProgressByStage.test_the_stage_the_product_is_in_is_marked | unit | undeclared | |
| test_main_page.EachProductsProgressByStage.test_three_of_four_use_cases_accepted_show_the_use_case_stage_at_75_percent | unit | undeclared | |
| test_main_page.TheBuildIsShownAsItHappens.test_a_running_job_is_shown_beside_its_step | unit | undeclared | |
| test_main_page.TheBuildIsShownAsItHappens.test_counter_proof_once_the_job_has_ended_the_step_shows_done | unit | undeclared | |
| test_main_page.TheMainPageShowsWhatGoesOnInTheInstance.test_the_root_of_the_site_is_the_main_page | unit | undeclared | |
| test_main_page.TheMainPageShowsWhatGoesOnInTheInstance.test_what_waits_for_a_person_is_listed_with_the_page_where_it_is_decided | unit | undeclared | |
| test_main_page.TheMenuFollowsTheProcess.test_a_stage_whose_page_is_built_links_to_it_and_one_not_built_is_named_without_a_link | unit | undeclared | |
| test_main_page.TheMenuFollowsTheProcess.test_counter_proof_a_menu_with_two_stages_swapped_fails | unit | undeclared | |
| test_main_page.TheMenuFollowsTheProcess.test_the_main_page_and_the_review_pages_carry_the_menu | unit | undeclared | |
| test_main_page.TheMenuFollowsTheProcess.test_the_menu_lists_the_stages_in_the_order_of_the_process | unit | undeclared | |
| test_main_page.TheMenuFollowsTheProcess.test_the_rendered_menu_stands_in_the_same_order | unit | undeclared | |
| test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_agent_ms_bar_is_full_once_its_first_release_is_tagged | unit | undeclared | |
| test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_counter_proof_before_its_first_release_the_bar_shows_the_shares | unit | undeclared | |
| test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_counter_proof_with_one_product_the_bar_shows_the_product | unit | undeclared | |
| test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_without_a_product_the_bar_shows_agent_m | unit | undeclared | |
| test_matrix_derived.MatrixDerived.test_an_edited_artifact_changes_the_row_it_names | unit | undeclared | |
| test_matrix_derived.MatrixDerived.test_counter_proof_a_stored_matrix_is_not_read | unit | undeclared | |
| test_matrix_derived.MatrixDerived.test_each_row_is_what_the_artifacts_name | unit | undeclared | |
| test_matrix_derived.MatrixDerived.test_the_graph_is_a_value_of_the_files_alone | unit | undeclared | |
| test_model_validation.TestDecider.test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass | unit | undeclared | |
| test_model_validation.TestDecider.test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected | unit | undeclared | |
| test_model_validation.TestDecider.test_counter_proof_a_gate_without_a_decider_is_rejected | unit | undeclared | |
| test_model_validation.TestReading.test_a_planned_definition_is_read_into_its_parts | unit | undeclared | |
| test_model_validation.TestReading.test_a_pulled_definition_is_read_into_its_parts | unit | undeclared | |
| test_model_validation.TestReading.test_a_time_box_is_read_with_its_length | unit | undeclared | |
| test_model_validation.TestValidation.test_each_error_stands_beside_the_field_that_causes_it | unit | undeclared | |
| test_model_validation.TestValidation.test_each_rule_the_spec_and_uc_031_name_has_a_broken_definition_that_is_rejected | unit | undeclared | |
| test_model_validation.TestValidation.test_every_broken_definition_yields_exactly_the_errors_expected_json_names | unit | undeclared | |
| test_model_validation.TestValidation.test_every_model_definition_of_this_repository_passes_validation | unit | undeclared | |
| test_model_validation.TestValidation.test_the_complete_definitions_pass_validation | unit | undeclared | |
| test_model_validation.TestValidation.test_the_model_agent_m_declares_gives_its_flow_control | unit | undeclared | |
| test_model_validation.TestValidation.test_validation_leaves_the_model_as_it_was | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_a_foreign_address_is_found | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_a_markdown_file_that_loads_from_another_host | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_a_method_named_fetch_or_a_comment_is_no_call | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_a_modules_own_data_files | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_a_permitted_channel_without_its_evidence_is_found | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_a_vendored_librarys_addresses_are_not_the_own_codes | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_an_unknown_channel_is_found | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_only_the_bridge_handle_transport_is_allowed | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_only_the_configured_endpoint_transport_is_allowed | unit | undeclared | |
| test_no_backend.NoServer.test_counter_proof_only_the_site_frames_own_static_header_assets_load | unit | undeclared | |
| test_no_backend.NoServer.test_every_address_in_the_own_code_names_a_permitted_host | unit | undeclared | |
| test_no_backend.NoServer.test_mermaid_renders_katex_untrusted | unit | undeclared | |
| test_no_backend.NoServer.test_no_served_markdown_loads_from_another_host | unit | undeclared | |
| test_no_backend.NoServer.test_requests_leave_only_through_the_known_channels | unit | undeclared | |
| test_no_backend.NoServer.test_the_dashboard_sets_no_worker_address_for_mermaid | unit | undeclared | |
| test_no_backend.NoServer.test_the_site_has_code_to_check | unit | undeclared | |
| test_no_config_cookie.NoCookie.test_counter_proof | unit | undeclared | |
| test_no_config_cookie.NoCookie.test_no_site_code_writes_a_cookie | unit | undeclared | |
| test_no_credential_in_url.NoCredentialInUrl.test_fetch_refuses_a_url_that_contains_the_token | component | undeclared | |
| test_no_credential_in_url.NoCredentialInUrl.test_github_links_take_no_token | component | undeclared | |
| test_origin_links.OriginLinks.test_counter_proof_a_code_file_that_names_not_one_module | unit | undeclared | |
| test_origin_links.OriginLinks.test_counter_proof_a_test_that_names_no_module_or_guards_nothing | unit | undeclared | |
| test_origin_links.OriginLinks.test_counter_proof_a_use_case_decision_or_module_that_names_nothing | unit | undeclared | |
| test_origin_links.OriginLinks.test_every_artifact_of_the_fixture_names_its_origin | unit | undeclared | |
| test_origin_links.OriginLinks.test_guards_are_names_separated_by_semicolons | unit | undeclared | |
| test_pages_layout.PagesLayout.test_the_review_pages_and_the_review_layout_are_under_docs | unit | undeclared | |
| test_pages_layout.PagesLayout.test_the_root_holds_the_main_page | unit | undeclared | |
| test_products_folder.NoProductNamed.test_address_forms | unit | undeclared | |
| test_products_folder.NoProductNamed.test_counter_proof_a_fixture_that_commits_one_fails | unit | undeclared | |
| test_products_folder.NoProductNamed.test_instance_repository_names_no_product | unit | undeclared | |
| test_products_folder.ProductsFolder.test_counter_proof | unit | undeclared | |
| test_products_folder.ProductsFolder.test_created_product_folder_is_ignored | unit | undeclared | |
| test_products_folder.ProductsFolder.test_readme_is_not_ignored | unit | undeclared | |
| test_products_folder.ProductsFolder.test_readme_is_tracked | unit | undeclared | |
| test_progress_derived.ItemStatesAreDerived.test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown | component | undeclared | |
| test_progress_derived.ItemStatesAreDerived.test_deleting_local_storage_and_the_cached_texts_shows_the_same_board | component | undeclared | |
| test_progress_derived.ItemStatesAreDerived.test_the_board_shows_the_derived_states | component | undeclared | |
| test_proposal_shows_current.ProposalShowsCurrent.test_a_current_text_that_cannot_be_told_is_not_guessed | unit | undeclared | |
| test_proposal_shows_current.ProposalShowsCurrent.test_an_approval_that_names_no_current_text_is_not_written | unit | undeclared | |
| test_proposal_shows_current.ProposalShowsCurrent.test_the_current_text_beside_an_entry_is_the_whole_section | unit | undeclared | |
| test_references.ReferencesByIdentifier.test_counter_proof_a_name_spelled_otherwise_is_another_name | unit | undeclared | |
| test_references.ReferencesByIdentifier.test_counter_proof_a_reference_by_position_reaches_nothing | unit | undeclared | |
| test_references.ReferencesByIdentifier.test_moving_a_requirement_or_renaming_a_file_moves_no_reference | unit | undeclared | |
| test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_every_python_open_of_agent_ms_own_spec_comes_from_a_whole_repository_scan | release | undeclared | |
| test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_no_node_test_opens_agent_ms_own_spec | release | undeclared | |
| test_release_sprint_02_c.TheWatcherSeesAKnownRead.test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_artifacts_are_markdown_passes_a_mermaid_diagram | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_artifacts_are_markdown_refuses_another_format | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_no_server_passes_the_permitted_origins | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_no_server_refuses_a_call_to_another_origin | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_self_sufficient_passes_a_reference_into_the_product | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_self_sufficient_refuses_a_reference_into_agent_m | release | undeclared | |
| test_release_sprint_02_d.ProductRuleChecks.test_the_repository_passes_the_three_checks | release | undeclared | |
| test_replaced_in_history.ReplacedInHistory.test_the_dashboard_leaves_the_replaced_text_in_the_history_only | unit | undeclared | |
| test_replaced_in_history.ReplacedInHistory.test_the_workflow_leaves_the_replaced_text_in_the_history_only | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_a_field_that_runs_over_several_lines_is_read_whole | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_a_queue_entry_is_read_like_a_spec | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_a_requirement_written_without_any_source_is_read_and_its_source_named_as_missing | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_a_withdrawn_requirement_is_marked_and_owes_no_fields | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_counter_proof_a_missing_source_is_named_as_missing | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_counter_proof_bold_prose_between_requirements_stays_no_requirement | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_counter_proof_each_missing_field_is_an_error | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_every_requirement_is_read_by_its_name_with_its_fields | unit | undeclared | |
| test_requirement_fields.RequirementFields.test_the_well_formed_requirements_have_no_finding | unit | undeclared | |
| test_requirement_has_source.RequirementHasSource.test_a_linked_source_is_a_registered_source | unit | undeclared | |
| test_requirement_has_source.RequirementHasSource.test_a_resource_entry_named_as_source_is_rejected | unit | undeclared | |
| test_requirement_has_source.RequirementHasSource.test_a_source_named_as_it_is_written_is_no_error | unit | undeclared | |
| test_requirement_has_source.RequirementHasSource.test_counter_proof_a_source_the_product_does_not_link | unit | undeclared | |
| test_requirement_names_check.RequirementNamesItsCheck.test_a_named_test_or_review_is_a_check | unit | undeclared | |
| test_requirement_names_check.RequirementNamesItsCheck.test_counter_proof_a_check_that_names_neither_is_an_error | unit | undeclared | |
| test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_a_file_of_agent_m_is_found | unit | undeclared | |
| test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_a_service_of_agent_m_is_found | unit | undeclared | |
| test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_what_the_product_holds_or_nobody_holds_is_no_finding | unit | undeclared | |
| test_self_sufficient.ProductRepositoryIsSelfSufficient.test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m | unit | undeclared | |
| test_self_sufficient.ProductRepositoryIsSelfSufficient.test_the_fixture_product_is_made_by_agent_ms_writers | unit | undeclared | |
| test_self_sufficient.ProductRepositoryIsSelfSufficient.test_the_reader_finds_the_references_the_fixture_makes | unit | undeclared | |
| test_settings_disclosure.PseudonymisationExplained.test_the_dashboard_says_neither_stand_in_nor_surrogate | component | undeclared | |
| test_settings_disclosure.PseudonymisationExplained.test_the_explanation_names_the_rewriting_without_persons | component | undeclared | |
| test_settings_disclosure.PseudonymisationExplained.test_the_setting_shows_that_explanation | component | undeclared | |
| test_settings_disclosure.PseudonymisationOffDisclosure.test_a_public_repository_is_warned_of_publication | component | undeclared | |
| test_settings_disclosure.PseudonymisationOffDisclosure.test_the_notice_states_what_follows | component | undeclared | |
| test_settings_disclosure.PseudonymisationOffDisclosure.test_the_page_shows_the_notice_before_saving | component | undeclared | |
| test_settings_disclosure.SettingsDisclosure.test_notice_names_the_owner_domain | component | undeclared | |
| test_settings_disclosure.SettingsDisclosure.test_settings_view_shows_the_notice_before_the_input | component | undeclared | |
| test_settings_in_the_core.SettingsDisclosure.test_nothing_can_be_stored_before_acknowledging | unit | undeclared | |
| test_settings_page.EverySettingOnOnePage.test_counter_proof_a_key_without_a_place_fails | component | undeclared | |
| test_settings_page.EverySettingOnOnePage.test_every_key_the_store_writes_has_a_place_on_the_page | component | undeclared | |
| test_settings_page.EverySettingOnOnePage.test_the_store_writes_no_key_but_its_named_ones | component | undeclared | |
| test_settings_page.ExpiryWarnedInAdvance.test_default_expiry_is_the_links_90_days | component | undeclared | |
| test_settings_page.ExpiryWarnedInAdvance.test_storing_a_token_asks_for_its_expiry | component | undeclared | |
| test_settings_page.ExpiryWarnedInAdvance.test_the_banner_on_every_page_carries_renew | component | undeclared | |
| test_settings_page.ExpiryWarnedInAdvance.test_the_state_line_names_the_expiry | component | undeclared | |
| test_settings_page.ExpiryWarnedInAdvance.test_warning_from_fourteen_days_before | component | undeclared | |
| test_settings_page.GitLabTokensOnThePage.test_counter_proof_no_token_no_line_but_the_setting_keeps_its_place | component | undeclared | |
| test_settings_page.GitLabTokensOnThePage.test_expiry_warned_and_refusal_named | component | undeclared | |
| test_settings_page.GitLabTokensOnThePage.test_one_line_per_token_with_test_change_clear | component | undeclared | |
| test_settings_page.GitLabTokensOnThePage.test_the_token_is_hidden_until_shown | component | undeclared | |
| test_settings_page.JumpHostAndRemoteSessions.test_counter_proof_after_show_the_bridge_token_appears_in_full | component | undeclared | |
| test_settings_page.JumpHostAndRemoteSessions.test_each_session_has_its_commands_test_and_clear | component | undeclared | |
| test_settings_page.JumpHostAndRemoteSessions.test_the_bridge_token_is_hidden_until_shown | component | undeclared | |
| test_settings_page.JumpHostAndRemoteSessions.test_the_jump_host_is_shown_with_test_change_clear | component | undeclared | |
| test_settings_page.JumpHostAndRemoteSessions.test_without_a_jump_host_no_command_is_written | component | undeclared | |
| test_settings_page.ProductSettingsInTheRepository.test_the_store_has_no_product_setting | component | undeclared | |
| test_settings_page.SecretHiddenUntilShown.test_a_stored_secret_is_rendered_hidden | component | undeclared | |
| test_settings_page.SecretHiddenUntilShown.test_counter_proof_after_show_it_appears_in_full | component | undeclared | |
| test_settings_page.TestedAndCleared.test_counter_proof_a_row_without_clear_is_seen | component | undeclared | |
| test_settings_page.TestedAndCleared.test_each_browser_setting_has_test_and_clear | component | undeclared | |
| test_settings_page.TestedAndCleared.test_the_last_test_is_read_from_the_browser | component | undeclared | |
| test_single_statement.SingleStatement.test_a_conjunction_in_the_rule_is_a_warning | unit | undeclared | |
| test_single_statement.SingleStatement.test_counter_proof_no_conjunction_no_warning | unit | undeclared | |
| test_spec_gate.SpecGate.test_an_open_queue_is_not_written_by_the_workflow | unit | undeclared | |
| test_spec_gate.SpecGate.test_only_the_entry_a_record_names_is_written_by_the_workflow | unit | undeclared | |
| test_spec_gate.SpecGate.test_the_dashboard_changes_no_byte_outside_the_accepted_section | unit | undeclared | |
| test_spec_gate.SpecGate.test_the_workflow_changes_no_byte_outside_the_approved_section | unit | undeclared | |
| test_step_explanations.StepExplanations.test_a_step_without_explanation_is_refused | component | undeclared | |
| test_step_explanations.StepExplanations.test_the_app_renders_steps_only_through_stepHtml | component | undeclared | |
| test_test_levels.TestLevels.test_a_file_that_is_no_test_owes_no_level | unit | undeclared | |
| test_test_levels.TestLevels.test_counter_proof_no_level_more_than_one_or_another_one | unit | undeclared | |
| test_test_levels.TestLevels.test_every_test_of_the_fixture_has_one_level | unit | undeclared | |
| test_test_levels.TestLevels.test_the_header_of_a_test_is_read | unit | undeclared | |
| test_time_box_selection.TestASprintIsRead.test_a_closed_sprint_names_its_end | unit | undeclared | |
| test_time_box_selection.TestASprintIsRead.test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty | unit | undeclared | |
| test_time_box_selection.TestASprintIsRead.test_a_sprint_naming_no_closer_and_no_branch_leaves_both_empty | unit | undeclared | |
| test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem | unit | undeclared | |
| test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem | unit | undeclared | |
| test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem | unit | undeclared | |
| test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_text_without_front_matter_is_no_sprint_record | unit | undeclared | |
| test_time_box_selection.TestAgentMsOwnSprints.test_every_sprint_record_of_this_repository_is_read_without_a_problem | unit | undeclared | |
| test_time_box_selection.TestAgentMsOwnSprints.test_sprint_01_is_closed_and_sprint_02_runs | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_a_selected_item_starts | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_a_sprint_not_yet_begun_starts_nothing | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_a_time_box_ends_on_its_end_date | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_an_item_outside_the_selection_is_refused_with_the_sprint_named | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_counter_proof_a_model_without_sprints_has_no_selection_to_keep | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_with_no_sprint_running_nothing_starts | unit | undeclared | |
| test_time_box_selection.TestOnlyTheSelectionStarts.test_without_a_time_box_a_recorded_end_ends_the_sprint | unit | undeclared | |
| test_time_box_selection.TestSprintsAndALimitBothHold.test_a_selected_item_above_the_limit_is_refused_for_the_limit_only | unit | undeclared | |
| test_time_box_selection.TestSprintsAndALimitBothHold.test_a_selected_item_below_the_limit_starts | unit | undeclared | |
| test_time_box_selection.TestSprintsAndALimitBothHold.test_an_item_outside_the_selection_above_the_limit_is_refused_for_both | unit | undeclared | |
| test_time_box_selection.TestSprintsAndALimitBothHold.test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only | unit | undeclared | |
| test_token_scope_documented.TokenScopeDocumented.test_counter_proof_a_missing_or_extra_permission_is_seen | component | undeclared | |
| test_token_scope_documented.TokenScopeDocumented.test_guidance_names_minimum_scope_and_reason | component | undeclared | |
| test_token_scope_documented.TokenScopeDocumented.test_link_asks_for_exactly_the_one_token_permissions | component | undeclared | |
| test_token_scope_documented.TokenScopeDocumented.test_steps_carry_the_scope | component | undeclared | |
| test_usecase_fields.UseCaseFiles.test_counter_proof | unit | undeclared | |
| test_usecase_fields.UseCaseFiles.test_every_use_case_is_complete | unit | undeclared | |
| test_usecase_fields.UseCaseFiles.test_ids_are_unique | unit | undeclared | |
| test_usecase_fields.UseCaseFiles.test_the_old_key_stage_is_named | unit | undeclared | |
| test_usecase_fields.UseCaseFiles.test_there_are_use_cases | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_name_in_another_form_is_reported | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_name_no_requirement_has_is_reported | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_use_case_realising_known_requirements_passes | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_use_case_that_realises_nothing_is_reported | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_every_use_case_of_this_repository_names_requirements_by_name | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_the_dashboards_reader_reports_the_same_name_on_its_line | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_the_problem_names_the_file | unit | undeclared | |
| test_usecase_realises.UseCaseRealisesNamedRequirements.test_without_known_names_only_the_form_is_checked | unit | undeclared | |
| test_verbatim.Verbatim.test_blank_lines_at_the_end_of_a_proposal_are_written | unit | undeclared | |
| test_verbatim.Verbatim.test_both_writers_write_the_approved_text_byte_for_byte | unit | undeclared | |
| test_verbatim.Verbatim.test_cr_bytes_of_a_proposal_are_never_written_reformulated | unit | undeclared | |
| test_wip_limit.TestTheLimitOfTwo.test_an_item_in_progress_is_not_counted_against_itself | unit | undeclared | |
| test_wip_limit.TestTheLimitOfTwo.test_counter_proof_with_one_item_in_progress_the_start_succeeds | unit | undeclared | |
| test_wip_limit.TestTheLimitOfTwo.test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named | unit | undeclared | |
| test_wip_limit.TestTheLimitOfTwo.test_with_one_of_the_two_done_the_start_succeeds | unit | undeclared | |
| test_wip_limit.TestWhatCountsAsInProgress.test_a_blocked_item_holds_its_slot_until_it_is_merged | unit | undeclared | |
| test_wip_limit.TestWhatCountsAsInProgress.test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch | unit | undeclared | |
| test_wip_limit.TestWhatCountsAsInProgress.test_a_running_job_counts_and_is_not_named_as_in_review | unit | undeclared | |
| test_wip_limit.TestWhatCountsAsInProgress.test_an_item_waiting_for_review_counts_whatever_its_job_does | unit | undeclared | |
| test_wip_limit.TestWhatCountsAsInProgress.test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot | unit | undeclared | |
| test_wip_limit.TestWhatCountsAsInProgress.test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot | unit | undeclared | |
| test_wip_limit.TestWithoutALimit.test_a_model_without_a_wip_limit_refuses_no_start_for_it | unit | undeclared | |

Cases without a leading TST identifier are undeclared. The complete original check-step logs below retain each observed CI case outcome, including TODO, skip and expected-failure statuses, and the source-copy counter-proofs. The commit is the actual checkout, not the pull-request head.

**Node Dashboard core** — SHA-256 `f9aea7e3bbb0412a9c114f598c6a64d3a5af30487e1e71d4936a58f84d714469`.

````text
﻿2026-10-10T21:21:24.1413818Z ##[group]Run node --test tests/*.test.mjs
2026-10-10T21:21:24.1414333Z [36;1mnode --test tests/*.test.mjs[0m
2026-10-10T21:21:24.1589145Z shell: /usr/bin/bash -e {0}
2026-10-10T21:21:24.1589508Z ##[endgroup]
2026-10-10T21:21:24.2328593Z TAP version 13
2026-10-10T21:21:24.2864720Z # Subtest: statuses — the status of a use case, a decision and a module that are open, accepted and changed, each with its kind
2026-10-10T21:21:24.2884247Z ok 1 - statuses — the status of a use case, a decision and a module that are open, accepted and changed, each with its kind
2026-10-10T21:21:24.2886098Z   ---
2026-10-10T21:21:24.2886869Z   duration_ms: 2.666585
2026-10-10T21:21:24.2887610Z   type: 'test'
2026-10-10T21:21:24.2888228Z   ...
2026-10-10T21:21:24.2889756Z # Subtest: approvalSchema — a record is read by its schema, as MOD-documents' readDocument gives it
2026-10-10T21:21:24.2891657Z ok 2 - approvalSchema — a record is read by its schema, as MOD-documents' readDocument gives it
2026-10-10T21:21:24.2892931Z   ---
2026-10-10T21:21:24.2893689Z   duration_ms: 0.840162
2026-10-10T21:21:24.2894341Z   type: 'test'
2026-10-10T21:21:24.2895551Z   ...
2026-10-10T21:21:24.3043227Z # Subtest: ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names
2026-10-10T21:21:24.3045871Z ok 3 - ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names
2026-10-10T21:21:24.3047202Z   ---
2026-10-10T21:21:24.3047955Z   duration_ms: 2.783912
2026-10-10T21:21:24.3048749Z   type: 'test'
2026-10-10T21:21:24.3049399Z   ...
2026-10-10T21:21:24.3050734Z # Subtest: parseArchitecture — a decision: id, title, forced_by, and its four sections
2026-10-10T21:21:24.3052571Z ok 4 - parseArchitecture — a decision: id, title, forced_by, and its four sections
2026-10-10T21:21:24.3053610Z   ---
2026-10-10T21:21:24.3054294Z   duration_ms: 1.145918
2026-10-10T21:21:24.3054940Z   type: 'test'
2026-10-10T21:21:24.3055529Z   ...
2026-10-10T21:21:24.3057220Z # Subtest: parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described
2026-10-10T21:21:24.3059545Z ok 5 - parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described
2026-10-10T21:21:24.3060703Z   ---
2026-10-10T21:21:24.3061381Z   duration_ms: 1.066263
2026-10-10T21:21:24.3063053Z   type: 'test'
2026-10-10T21:21:24.3063659Z   ...
2026-10-10T21:21:24.3065071Z # Subtest: specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement
2026-10-10T21:21:24.3067792Z ok 6 - specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement
2026-10-10T21:21:24.3068930Z   ---
2026-10-10T21:21:24.3069528Z   duration_ms: 6.237023
2026-10-10T21:21:24.3070169Z   type: 'test'
2026-10-10T21:21:24.3070841Z   ...
2026-10-10T21:21:24.3072518Z # Subtest: module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code
2026-10-10T21:21:24.3075064Z ok 7 - module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code
2026-10-10T21:21:24.3076390Z   ---
2026-10-10T21:21:24.3076995Z   duration_ms: 0.989032
2026-10-10T21:21:24.3077636Z   type: 'test'
2026-10-10T21:21:24.3078221Z   ...
2026-10-10T21:21:24.3367845Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after
2026-10-10T21:21:24.3371157Z ok 8 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after
2026-10-10T21:21:24.3372987Z   ---
2026-10-10T21:21:24.3373695Z   duration_ms: 29.294188
2026-10-10T21:21:24.3374400Z   type: 'test'
2026-10-10T21:21:24.3375064Z   ...
2026-10-10T21:21:24.3384311Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first
2026-10-10T21:21:24.3401718Z ok 9 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first
2026-10-10T21:21:24.3432729Z   ---
2026-10-10T21:21:24.3443284Z   duration_ms: 1.738406
2026-10-10T21:21:24.3444304Z   type: 'test'
2026-10-10T21:21:24.3445155Z   ...
2026-10-10T21:21:24.3447534Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so
2026-10-10T21:21:24.3450403Z ok 10 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so
2026-10-10T21:21:24.3453568Z   ---
2026-10-10T21:21:24.3454422Z   duration_ms: 1.431814
2026-10-10T21:21:24.3455132Z   type: 'test'
2026-10-10T21:21:24.3455793Z   ...
2026-10-10T21:21:24.3642352Z # Subtest: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained
2026-10-10T21:21:24.3645131Z ok 11 - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained
2026-10-10T21:21:24.3646470Z   ---
2026-10-10T21:21:24.3647097Z   duration_ms: 1.501555
2026-10-10T21:21:24.3647746Z   type: 'test'
2026-10-10T21:21:24.3648307Z   ...
2026-10-10T21:21:24.5383590Z # Subtest: the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases
2026-10-10T21:21:24.5431323Z ok 12 - the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases
2026-10-10T21:21:24.5461159Z   ---
2026-10-10T21:21:24.5462069Z   duration_ms: 178.478519
2026-10-10T21:21:24.5465310Z   type: 'test'
2026-10-10T21:21:24.5466208Z   ...
2026-10-10T21:21:24.5629513Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count
2026-10-10T21:21:24.5653752Z ok 13 - STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count
2026-10-10T21:21:24.5655064Z   ---
2026-10-10T21:21:24.5671071Z   duration_ms: 8.724684
2026-10-10T21:21:24.5695753Z   type: 'test'
2026-10-10T21:21:24.5731336Z   ...
2026-10-10T21:21:24.5757797Z # Subtest: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted
2026-10-10T21:21:24.5764197Z ok 14 - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted
2026-10-10T21:21:24.5784249Z   ---
2026-10-10T21:21:24.5784986Z   duration_ms: 6.645457
2026-10-10T21:21:24.5785667Z   type: 'test'
2026-10-10T21:21:24.5786243Z   ...
2026-10-10T21:21:24.5787666Z # Subtest: saveFile — a file saved on the blob it was opened on, in one commit on the default branch
2026-10-10T21:21:24.5789486Z ok 15 - saveFile — a file saved on the blob it was opened on, in one commit on the default branch
2026-10-10T21:21:24.5790520Z   ---
2026-10-10T21:21:24.5791126Z   duration_ms: 9.385301
2026-10-10T21:21:24.5792198Z   type: 'test'
2026-10-10T21:21:24.5792830Z   ...
2026-10-10T21:21:24.5794276Z # Subtest: saveFile — a file that changed meanwhile is refused with its current text, and nothing is written
2026-10-10T21:21:24.5796273Z ok 16 - saveFile — a file that changed meanwhile is refused with its current text, and nothing is written
2026-10-10T21:21:24.5797408Z   ---
2026-10-10T21:21:24.5798008Z   duration_ms: 0.951526
2026-10-10T21:21:24.5798677Z   type: 'test'
2026-10-10T21:21:24.5799364Z   ...
2026-10-10T21:21:24.5801040Z # Subtest: reviewLayoutCommit — a product without any of the layout gets every part, in one commit on its default branch
2026-10-10T21:21:24.5803257Z ok 17 - reviewLayoutCommit — a product without any of the layout gets every part, in one commit on its default branch
2026-10-10T21:21:24.5804920Z   ---
2026-10-10T21:21:24.5805691Z   duration_ms: 5.700904
2026-10-10T21:21:24.5806864Z   type: 'test'
2026-10-10T21:21:24.5807537Z   ...
2026-10-10T21:21:24.5809288Z # Subtest: reviewLayoutCommit — a product with part of the layout gets only the missing parts
2026-10-10T21:21:24.5811018Z ok 18 - reviewLayoutCommit — a product with part of the layout gets only the missing parts
2026-10-10T21:21:24.5812252Z   ---
2026-10-10T21:21:24.5812917Z   duration_ms: 0.689728
2026-10-10T21:21:24.5813583Z   type: 'test'
2026-10-10T21:21:24.5814177Z   ...
2026-10-10T21:21:24.5815411Z # Subtest: reviewLayoutCommit — a product with the complete layout gets no commit
2026-10-10T21:21:24.5816995Z ok 19 - reviewLayoutCommit — a product with the complete layout gets no commit
2026-10-10T21:21:24.5818048Z   ---
2026-10-10T21:21:24.5818652Z   duration_ms: 0.621371
2026-10-10T21:21:24.5819298Z   type: 'test'
2026-10-10T21:21:24.5819894Z   ...
2026-10-10T21:21:24.5821314Z # Subtest: reviewLayoutCommit — a refused write is named as the host names it, and nothing is written
2026-10-10T21:21:24.5823334Z ok 20 - reviewLayoutCommit — a refused write is named as the host names it, and nothing is written
2026-10-10T21:21:24.5824486Z   ---
2026-10-10T21:21:24.5825080Z   duration_ms: 1.5822
2026-10-10T21:21:24.5825727Z   type: 'test'
2026-10-10T21:21:24.5826344Z   ...
2026-10-10T21:21:24.5827366Z # Subtest: reviewLayoutCommit — takes the host alone
2026-10-10T21:21:24.5828813Z ok 21 - reviewLayoutCommit — takes the host alone
2026-10-10T21:21:24.5829628Z   ---
2026-10-10T21:21:24.5830260Z   duration_ms: 0.657632
2026-10-10T21:21:24.5831079Z   type: 'test'
2026-10-10T21:21:24.5832178Z   ...
2026-10-10T21:21:24.5835128Z # Subtest: reviewLayoutCommit — returns the commit's sha and url as the host's commitFiles returns them, with the parts written
2026-10-10T21:21:24.5837594Z ok 22 - reviewLayoutCommit — returns the commit's sha and url as the host's commitFiles returns them, with the parts written
2026-10-10T21:21:24.5838872Z   ---
2026-10-10T21:21:24.5839498Z   duration_ms: 0.541823
2026-10-10T21:21:24.5840171Z   type: 'test'
2026-10-10T21:21:24.5840773Z   ...
2026-10-10T21:21:24.5841747Z # Subtest: reviewLayoutCommit — the commit's message names no one
2026-10-10T21:21:24.5843423Z ok 23 - reviewLayoutCommit — the commit's message names no one
2026-10-10T21:21:24.5844315Z   ---
2026-10-10T21:21:24.5844934Z   duration_ms: 0.55467
2026-10-10T21:21:24.5845613Z   type: 'test'
2026-10-10T21:21:24.5846232Z   ...
2026-10-10T21:21:24.5847314Z # Subtest: formatChecks knows the five kinds, and refuses another by naming them
2026-10-10T21:21:24.5848744Z ok 24 - formatChecks knows the five kinds, and refuses another by naming them
2026-10-10T21:21:24.5850084Z   ---
2026-10-10T21:21:24.5851286Z   duration_ms: 3.320182
2026-10-10T21:21:24.5852193Z   type: 'test'
2026-10-10T21:21:24.5852840Z   ...
2026-10-10T21:21:24.5854060Z # Subtest: a complete artifact of every kind yields no finding
2026-10-10T21:21:24.5855253Z ok 25 - a complete artifact of every kind yields no finding
2026-10-10T21:21:24.5855973Z   ---
2026-10-10T21:21:24.5856590Z   duration_ms: 9.912259
2026-10-10T21:21:24.5857278Z   type: 'test'
2026-10-10T21:21:24.5857947Z   ...
2026-10-10T21:21:24.5859434Z # Subtest: one call runs every check of its kind — the same findings as the single checks, nothing left out
2026-10-10T21:21:24.5861481Z ok 26 - one call runs every check of its kind — the same findings as the single checks, nothing left out
2026-10-10T21:21:24.5862768Z   ---
2026-10-10T21:21:24.5863430Z   duration_ms: 10.327839
2026-10-10T21:21:24.5864117Z   type: 'test'
2026-10-10T21:21:24.5864712Z   ...
2026-10-10T21:21:24.5865967Z # Subtest: a requirement: each broken field, check, source, statement and name is one finding at its line
2026-10-10T21:21:24.5867859Z ok 27 - a requirement: each broken field, check, source, statement and name is one finding at its line
2026-10-10T21:21:24.5868943Z   ---
2026-10-10T21:21:24.5869568Z   duration_ms: 4.403238
2026-10-10T21:21:24.5870235Z   type: 'test'
2026-10-10T21:21:24.5870764Z   ...
2026-10-10T21:21:24.5872079Z # Subtest: a use case: the identifier it was opened with is kept, beside every check of useCaseProblems
2026-10-10T21:21:24.5874138Z ok 28 - a use case: the identifier it was opened with is kept, beside every check of useCaseProblems
2026-10-10T21:21:24.5875195Z   ---
2026-10-10T21:21:24.5875798Z   duration_ms: 0.763227
2026-10-10T21:21:24.5876464Z   type: 'test'
2026-10-10T21:21:24.5877064Z   ...
2026-10-10T21:21:24.5878416Z # Subtest: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line
2026-10-10T21:21:24.5880377Z ok 29 - a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line
2026-10-10T21:21:24.5881560Z   ---
2026-10-10T21:21:24.5882500Z   duration_ms: 3.608245
2026-10-10T21:21:24.5883232Z   type: 'test'
2026-10-10T21:21:24.5883835Z   ...
2026-10-10T21:21:24.5885068Z # Subtest: a test: its level, its module, what it guards and its case identifiers are each one finding
2026-10-10T21:21:24.5886814Z ok 30 - a test: its level, its module, what it guards and its case identifiers are each one finding
2026-10-10T21:21:24.5887919Z   ---
2026-10-10T21:21:24.5888499Z   duration_ms: 1.549708
2026-10-10T21:21:24.5889132Z   type: 'test'
2026-10-10T21:21:24.5889709Z   ...
2026-10-10T21:21:24.5890863Z # Subtest: a group file: each finding names the group file, at the line of the group file
2026-10-10T21:21:24.5892537Z ok 31 - a group file: each finding names the group file, at the line of the group file
2026-10-10T21:21:24.5893532Z   ---
2026-10-10T21:21:24.5894126Z   duration_ms: 0.389092
2026-10-10T21:21:24.5894813Z   type: 'test'
2026-10-10T21:21:24.5895486Z   ...
2026-10-10T21:21:24.5897008Z # Subtest: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form
2026-10-10T21:21:24.5898963Z ok 32 - A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form
2026-10-10T21:21:24.5900068Z   ---
2026-10-10T21:21:24.5900684Z   duration_ms: 1.935602
2026-10-10T21:21:24.5901325Z   type: 'test'
2026-10-10T21:21:24.5902080Z   ...
2026-10-10T21:21:24.5903343Z # Subtest: one shape in every check of MOD-artifacts — fix, never correction
2026-10-10T21:21:24.5904838Z ok 33 - one shape in every check of MOD-artifacts — fix, never correction
2026-10-10T21:21:24.5905772Z   ---
2026-10-10T21:21:24.5906405Z   duration_ms: 1.750232
2026-10-10T21:21:24.5907043Z   type: 'test'
2026-10-10T21:21:24.5907616Z   ...
2026-10-10T21:21:24.5908607Z # Subtest: every use case and group file of this repository passes formatChecks
2026-10-10T21:21:24.5909991Z ok 34 - every use case and group file of this repository passes formatChecks
2026-10-10T21:21:24.5911313Z   ---
2026-10-10T21:21:24.5912084Z   duration_ms: 10.905166
2026-10-10T21:21:24.5912749Z   type: 'test'
2026-10-10T21:21:24.5913320Z   ...
2026-10-10T21:21:24.6537077Z # Subtest: every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none
2026-10-10T21:21:24.6554698Z ok 35 - every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none
2026-10-10T21:21:24.6556349Z   ---
2026-10-10T21:21:24.6556984Z   duration_ms: 8.806311
2026-10-10T21:21:24.6557675Z   type: 'test'
2026-10-10T21:21:24.6558301Z   ...
2026-10-10T21:21:24.6559983Z # Subtest: A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction
2026-10-10T21:21:24.6562465Z ok 36 - A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction
2026-10-10T21:21:24.6563908Z   ---
2026-10-10T21:21:24.6564721Z   duration_ms: 3.289386
2026-10-10T21:21:24.6565577Z   type: 'test'
2026-10-10T21:21:24.6566487Z   ...
2026-10-10T21:21:24.6568341Z # Subtest: the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked
2026-10-10T21:21:24.6570692Z ok 37 - the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked
2026-10-10T21:21:24.6572238Z   ---
2026-10-10T21:21:24.6573529Z   duration_ms: 1.481136
2026-10-10T21:21:24.6574320Z   type: 'test'
2026-10-10T21:21:24.6574928Z   ...
2026-10-10T21:21:24.6604091Z # Subtest: parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram
2026-10-10T21:21:24.6608653Z ok 38 - parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram
2026-10-10T21:21:24.6610258Z   ---
2026-10-10T21:21:24.6610990Z   duration_ms: 1.368966
2026-10-10T21:21:24.6612034Z   type: 'test'
2026-10-10T21:21:24.6612619Z   ...
2026-10-10T21:21:24.6613606Z # Subtest: every use case of this repository passes the dashboard's reader
2026-10-10T21:21:24.6614908Z ok 39 - every use case of this repository passes the dashboard's reader
2026-10-10T21:21:24.6615754Z   ---
2026-10-10T21:21:24.6616286Z   duration_ms: 11.754918
2026-10-10T21:21:24.6616906Z   type: 'test'
2026-10-10T21:21:24.6617452Z   ...
2026-10-10T21:21:24.6619008Z # Subtest: the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository
2026-10-10T21:21:24.6623281Z ok 40 - the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository
2026-10-10T21:21:24.6624690Z   ---
2026-10-10T21:21:24.6625319Z   duration_ms: 100.422506
2026-10-10T21:21:24.6626003Z   type: 'test'
2026-10-10T21:21:24.6626603Z   ...
2026-10-10T21:21:24.6661697Z # Subtest: TST-282001: allocatePort chooses the lowest free inclusive port and names exhaustion
2026-10-10T21:21:24.6672273Z ok 41 - TST-282001: allocatePort chooses the lowest free inclusive port and names exhaustion
2026-10-10T21:21:24.6673475Z   ---
2026-10-10T21:21:24.6674167Z   duration_ms: 1.648667
2026-10-10T21:21:24.6674890Z   type: 'test'
2026-10-10T21:21:24.6675481Z   ...
2026-10-10T21:21:24.6676728Z # Subtest: TST-282002: tunnelCommands keeps commands, plans, loopback ends and service aligned
2026-10-10T21:21:24.6678389Z ok 42 - TST-282002: tunnelCommands keeps commands, plans, loopback ends and service aligned
2026-10-10T21:21:24.6679444Z   ---
2026-10-10T21:21:24.6680015Z   duration_ms: 1.293451
2026-10-10T21:21:24.6680664Z   type: 'test'
2026-10-10T21:21:24.6681256Z   ...
2026-10-10T21:21:24.6682557Z # Subtest: TST-282003: proxyConfiguration emits authenticated instance-only Apache and nginx plans
2026-10-10T21:21:24.6684232Z ok 43 - TST-282003: proxyConfiguration emits authenticated instance-only Apache and nginx plans
2026-10-10T21:21:24.6685233Z   ---
2026-10-10T21:21:24.6686300Z   duration_ms: 1.390752
2026-10-10T21:21:24.6686966Z   type: 'test'
2026-10-10T21:21:24.6687544Z   ...
2026-10-10T21:21:24.6796312Z # Subtest: TST-263001: endpoint-test goes only to the paired Bridge with configuration in its JSON body
2026-10-10T21:21:24.6823588Z ok 44 - TST-263001: endpoint-test goes only to the paired Bridge with configuration in its JSON body
2026-10-10T21:21:24.6835296Z   ---
2026-10-10T21:21:24.6864852Z   duration_ms: 33.916273
2026-10-10T21:21:24.6865770Z   type: 'test'
2026-10-10T21:21:24.6866583Z   ...
2026-10-10T21:21:24.6868154Z # Subtest: TST-263002: an HTTPS Bridge sends jump-host login in a header and preserves a provider diagnosis
2026-10-10T21:21:24.6870245Z ok 45 - TST-263002: an HTTPS Bridge sends jump-host login in a header and preserves a provider diagnosis
2026-10-10T21:21:24.6871542Z   ---
2026-10-10T21:21:24.6892659Z   duration_ms: 1.156903
2026-10-10T21:21:24.6893717Z   type: 'test'
2026-10-10T21:21:24.6894560Z   ...
2026-10-10T21:21:24.6896128Z # Subtest: TST-263003: pair sends the copied token only as a header and returns reusable settings
2026-10-10T21:21:24.6898166Z ok 46 - TST-263003: pair sends the copied token only as a header and returns reusable settings
2026-10-10T21:21:24.6899424Z   ---
2026-10-10T21:21:24.6900243Z   duration_ms: 1.196999
2026-10-10T21:21:24.6901098Z   type: 'test'
2026-10-10T21:21:24.6902078Z   ...
2026-10-10T21:21:24.6903298Z # Subtest: TST-263004: a missing Bridge token is named before any request
2026-10-10T21:21:24.6905567Z ok 47 - TST-263004: a missing Bridge token is named before any request
2026-10-10T21:21:24.6906685Z   ---
2026-10-10T21:21:24.6907498Z   duration_ms: 0.961285
2026-10-10T21:21:24.6908337Z   type: 'test'
2026-10-10T21:21:24.6909113Z   ...
2026-10-10T21:21:24.6910427Z # Subtest: TST-263005: a refused pairing token is named TokenRefused
2026-10-10T21:21:24.6912155Z ok 48 - TST-263005: a refused pairing token is named TokenRefused
2026-10-10T21:21:24.6913236Z   ---
2026-10-10T21:21:24.6914059Z   duration_ms: 1.088372
2026-10-10T21:21:24.6914928Z   type: 'test'
2026-10-10T21:21:24.6915661Z   ...
2026-10-10T21:21:24.6917133Z # Subtest: TST-263006: an HTTPS login refusal is named separately from a Bridge token refusal
2026-10-10T21:21:24.6918992Z ok 49 - TST-263006: an HTTPS login refusal is named separately from a Bridge token refusal
2026-10-10T21:21:24.6920323Z   ---
2026-10-10T21:21:24.6921079Z   duration_ms: 0.994222
2026-10-10T21:21:24.6922187Z   type: 'test'
2026-10-10T21:21:24.6922997Z   ...
2026-10-10T21:21:24.6924524Z # Subtest: TST-263007: Bridge failures and unreadable answers have their separate named failures
2026-10-10T21:21:24.6926407Z ok 50 - TST-263007: Bridge failures and unreadable answers have their separate named failures
2026-10-10T21:21:24.6929569Z   ---
2026-10-10T21:21:24.6930597Z   duration_ms: 1.042084
2026-10-10T21:21:24.6931423Z   type: 'test'
2026-10-10T21:21:24.6932200Z   ...
2026-10-10T21:21:24.6933416Z # Subtest: TST-263008: pair and endpoint-test name a finite request timeout
2026-10-10T21:21:24.6935260Z ok 51 - TST-263008: pair and endpoint-test name a finite request timeout
2026-10-10T21:21:24.6936352Z   ---
2026-10-10T21:21:24.6936992Z   duration_ms: 2.110297
2026-10-10T21:21:24.6937684Z   type: 'test'
2026-10-10T21:21:24.6938372Z   ...
2026-10-10T21:21:24.7213927Z # Subtest: TST-261001: bridgeApi defines the typed endpoint-test probe
2026-10-10T21:21:24.7234770Z ok 52 - TST-261001: bridgeApi defines the typed endpoint-test probe
2026-10-10T21:21:24.7237513Z   ---
2026-10-10T21:21:24.7238332Z   duration_ms: 2.28306
2026-10-10T21:21:24.7239149Z   type: 'test'
2026-10-10T21:21:24.7239792Z   ...
2026-10-10T21:21:24.7253674Z # Subtest: TST-261010: bridgeApi has a browser-loadable public entry
2026-10-10T21:21:24.7258512Z ok 53 - TST-261010: bridgeApi has a browser-loadable public entry
2026-10-10T21:21:24.7259609Z   ---
2026-10-10T21:21:24.7260312Z   duration_ms: 11.052733
2026-10-10T21:21:24.7261060Z   type: 'test'
2026-10-10T21:21:24.7261702Z   ...
2026-10-10T21:21:24.7272860Z # Subtest: TST-261002: serveBridge refuses a non-loopback bind
2026-10-10T21:21:24.7278096Z ok 54 - TST-261002: serveBridge refuses a non-loopback bind
2026-10-10T21:21:24.7279419Z   ---
2026-10-10T21:21:24.7280055Z   duration_ms: 2.03908
2026-10-10T21:21:24.7280936Z   type: 'test'
2026-10-10T21:21:24.7281522Z   ...
2026-10-10T21:21:24.7486352Z # Subtest: TST-261003: serveBridge accepts every documented loopback bind
2026-10-10T21:21:24.7500669Z ok 55 - TST-261003: serveBridge accepts every documented loopback bind
2026-10-10T21:21:24.7502228Z   ---
2026-10-10T21:21:24.7502848Z   duration_ms: 20.897761
2026-10-10T21:21:24.7503511Z   type: 'test'
2026-10-10T21:21:24.7504065Z   ...
2026-10-10T21:21:24.7551331Z # Subtest: TST-261011: serveBridge names a loopback port already in use
2026-10-10T21:21:24.7562974Z ok 56 - TST-261011: serveBridge names a loopback port already in use
2026-10-10T21:21:24.7564512Z   ---
2026-10-10T21:21:24.7565484Z   duration_ms: 6.129049
2026-10-10T21:21:24.7566369Z   type: 'test'
2026-10-10T21:21:24.7567080Z   ...
2026-10-10T21:21:24.8073394Z # {"method":"GET","path":"/v1/pair","status":401,"duration":3}
2026-10-10T21:21:24.8132719Z # {"method":"GET","path":"/v1/pair","status":200,"duration":0}
2026-10-10T21:21:24.8173056Z # Subtest: TST-261004: pairAnew persists and rotates the token
2026-10-10T21:21:24.8183199Z ok 57 - TST-261004: pairAnew persists and rotates the token
2026-10-10T21:21:24.8199324Z   ---
2026-10-10T21:21:24.8201508Z   duration_ms: 60.192263
2026-10-10T21:21:24.8202885Z   type: 'test'
2026-10-10T21:21:24.8203574Z   ...
2026-10-10T21:21:24.8275387Z # {"method":"GET","path":"/v1/pair","status":200,"duration":1}
2026-10-10T21:21:24.8373786Z # Subtest: TST-261005: a restarted Bridge keeps its pairing token
2026-10-10T21:21:24.8374935Z ok 58 - TST-261005: a restarted Bridge keeps its pairing token
2026-10-10T21:21:24.8375632Z   ---
2026-10-10T21:21:24.8376118Z   duration_ms: 14.990232
2026-10-10T21:21:24.8376653Z   type: 'test'
2026-10-10T21:21:24.8377116Z   ...
2026-10-10T21:21:24.8506712Z # {"method":"OPTIONS","path":"/v1/probes/endpoint-test","status":204,"duration":0}
2026-10-10T21:21:24.8543233Z # {"method":"OPTIONS","path":"/v1/probes/endpoint-test","status":204,"duration":1}
2026-10-10T21:21:24.8593487Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":2}
2026-10-10T21:21:24.8678583Z # Subtest: TST-261006: serveBridge allows the paired origin and dispatches endpoint-test
2026-10-10T21:21:24.8709393Z ok 59 - TST-261006: serveBridge allows the paired origin and dispatches endpoint-test
2026-10-10T21:21:24.8754416Z   ---
2026-10-10T21:21:24.8772507Z   duration_ms: 33.06269
2026-10-10T21:21:24.8804929Z   type: 'test'
2026-10-10T21:21:24.8829289Z   ...
2026-10-10T21:21:24.8882801Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":403,"duration":0}
2026-10-10T21:21:24.8930111Z # {"method":"OPTIONS","path":"/v1/probes/endpoint-test","status":403,"duration":0}
2026-10-10T21:21:24.8966602Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":401,"duration":4}
2026-10-10T21:21:24.8967889Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":422,"duration":0}
2026-10-10T21:21:24.8993006Z # Subtest: TST-261007: serveBridge names origin, token and body refusals
2026-10-10T21:21:24.9033203Z ok 60 - TST-261007: serveBridge names origin, token and body refusals
2026-10-10T21:21:24.9034083Z   ---
2026-10-10T21:21:24.9082707Z   duration_ms: 21.463267
2026-10-10T21:21:24.9147340Z   type: 'test'
2026-10-10T21:21:24.9222784Z   ...
2026-10-10T21:21:24.9256719Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":503,"duration":1}
2026-10-10T21:21:24.9333250Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":422,"duration":1}
2026-10-10T21:21:24.9334683Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":502,"duration":1}
2026-10-10T21:21:24.9336032Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":502,"duration":7}
2026-10-10T21:21:24.9337323Z # Subtest: TST-261008: serveBridge names pause and handler failures
2026-10-10T21:21:24.9338885Z ok 61 - TST-261008: serveBridge names pause and handler failures
2026-10-10T21:21:24.9339687Z   ---
2026-10-10T21:21:24.9340245Z   duration_ms: 39.852374
2026-10-10T21:21:24.9340855Z   type: 'test'
2026-10-10T21:21:24.9341387Z   ...
2026-10-10T21:21:24.9532902Z # Subtest: TST-261009: request logs exclude endpoint-test secrets
2026-10-10T21:21:24.9600258Z ok 62 - TST-261009: request logs exclude endpoint-test secrets
2026-10-10T21:21:24.9663132Z   ---
2026-10-10T21:21:24.9664217Z   duration_ms: 28.435623
2026-10-10T21:21:24.9692849Z   type: 'test'
2026-10-10T21:21:24.9722620Z   ...
2026-10-10T21:21:24.9926362Z # Subtest: TST-262-001: endpoint-test maps body.args once and returns a success unchanged
2026-10-10T21:21:24.9944183Z ok 63 - TST-262-001: endpoint-test maps body.args once and returns a success unchanged
2026-10-10T21:21:24.9945378Z   ---
2026-10-10T21:21:24.9952117Z   duration_ms: 1.891413
2026-10-10T21:21:24.9953366Z   type: 'test'
2026-10-10T21:21:24.9954010Z   ...
2026-10-10T21:21:24.9954709Z # Subtest: TST-262-002: endpoint-test returns a refused-key diagnosis unchanged
2026-10-10T21:21:24.9955383Z ok 64 - TST-262-002: endpoint-test returns a refused-key diagnosis unchanged
2026-10-10T21:21:24.9955863Z   ---
2026-10-10T21:21:24.9956155Z   duration_ms: 1.568804
2026-10-10T21:21:24.9956436Z   type: 'test'
2026-10-10T21:21:24.9956669Z   ...
2026-10-10T21:21:24.9957430Z # Subtest: TST-262-003: endpoint-test returns an unknown-model diagnosis unchanged
2026-10-10T21:21:24.9959028Z ok 65 - TST-262-003: endpoint-test returns an unknown-model diagnosis unchanged
2026-10-10T21:21:24.9959742Z   ---
2026-10-10T21:21:24.9960152Z   duration_ms: 0.231076
2026-10-10T21:21:24.9960643Z   type: 'test'
2026-10-10T21:21:24.9961065Z   ...
2026-10-10T21:21:24.9963114Z # Subtest: TST-262-004: endpoint-test returns an unavailable local-server diagnosis unchanged
2026-10-10T21:21:24.9964502Z ok 66 - TST-262-004: endpoint-test returns an unavailable local-server diagnosis unchanged
2026-10-10T21:21:24.9965442Z   ---
2026-10-10T21:21:24.9965888Z   duration_ms: 0.204941
2026-10-10T21:21:24.9966379Z   type: 'test'
2026-10-10T21:21:24.9966798Z   ...
2026-10-10T21:21:24.9967699Z # Subtest: TST-262-005: endpoint-test returns another provider diagnosis unchanged
2026-10-10T21:21:24.9971184Z ok 67 - TST-262-005: endpoint-test returns another provider diagnosis unchanged
2026-10-10T21:21:24.9972095Z   ---
2026-10-10T21:21:24.9972568Z   duration_ms: 0.336185
2026-10-10T21:21:24.9973077Z   type: 'test'
2026-10-10T21:21:24.9973532Z   ...
2026-10-10T21:21:24.9974444Z # Subtest: TST-262-006: endpoint-test rejects invalid body.args before any endpoint call
2026-10-10T21:21:24.9975669Z ok 68 - TST-262-006: endpoint-test rejects invalid body.args before any endpoint call
2026-10-10T21:21:24.9976513Z   ---
2026-10-10T21:21:24.9976939Z   duration_ms: 0.845159
2026-10-10T21:21:24.9977438Z   type: 'test'
2026-10-10T21:21:24.9977872Z   ...
2026-10-10T21:21:24.9978820Z # Subtest: TST-262-007: endpoint-test names an unexpected handler failure without retrying
2026-10-10T21:21:24.9980310Z ok 69 - TST-262-007: endpoint-test names an unexpected handler failure without retrying
2026-10-10T21:21:24.9981143Z   ---
2026-10-10T21:21:24.9981598Z   duration_ms: 0.330593
2026-10-10T21:21:24.9982416Z   type: 'test'
2026-10-10T21:21:24.9982881Z   ...
2026-10-10T21:21:24.9983612Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":4}
2026-10-10T21:21:24.9984858Z # Subtest: TST-285001: GET tunnels dispatches exact constructed states through the route data
2026-10-10T21:21:24.9986274Z ok 70 - TST-285001: GET tunnels dispatches exact constructed states through the route data
2026-10-10T21:21:24.9987252Z   ---
2026-10-10T21:21:24.9991691Z   duration_ms: 84.606329
2026-10-10T21:21:24.9992681Z   type: 'test'
2026-10-10T21:21:24.9993381Z   ...
2026-10-10T21:21:24.9994342Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":0}
2026-10-10T21:21:24.9995508Z # {"method":"GET","path":"/v1/tunnels","status":404,"duration":0}
2026-10-10T21:21:24.9997064Z # Subtest: TST-285002: an explicit empty state differs from an absent tunnels handler
2026-10-10T21:21:24.9998436Z ok 71 - TST-285002: an explicit empty state differs from an absent tunnels handler
2026-10-10T21:21:24.9999302Z   ---
2026-10-10T21:21:24.9999830Z   duration_ms: 33.904364
2026-10-10T21:21:25.0000420Z   type: 'test'
2026-10-10T21:21:25.0000936Z   ...
2026-10-10T21:21:25.0006545Z # {"method":"GET","path":"/v1/tunnels","status":422,"duration":4}
2026-10-10T21:21:25.0007896Z # {"method":"GET","path":"/v1/tunnels","status":502,"duration":3}
2026-10-10T21:21:25.0009182Z # Subtest: TST-285003: tunnels handler failures retain the server error mapping
2026-10-10T21:21:25.0010567Z ok 72 - TST-285003: tunnels handler failures retain the server error mapping
2026-10-10T21:21:25.0011454Z   ---
2026-10-10T21:21:25.0012174Z   duration_ms: 29.308877
2026-10-10T21:21:25.0012926Z   type: 'test'
2026-10-10T21:21:25.0013517Z   ...
2026-10-10T21:21:25.0014394Z # {"method":"OPTIONS","path":"/v1/tunnels","status":204,"duration":0}
2026-10-10T21:21:25.0015606Z # {"method":"GET","path":"/v1/tunnels","status":403,"duration":0}
2026-10-10T21:21:25.0016767Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":6}
2026-10-10T21:21:25.0033058Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":1}
2026-10-10T21:21:25.0034408Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":2}
2026-10-10T21:21:25.0035847Z # Subtest: TST-285004: tunnels keeps origin, preflight and current-token protections after rotation
2026-10-10T21:21:25.0037668Z ok 73 - TST-285004: tunnels keeps origin, preflight and current-token protections after rotation
2026-10-10T21:21:25.0038735Z   ---
2026-10-10T21:21:25.0039307Z   duration_ms: 32.569702
2026-10-10T21:21:25.0039921Z   type: 'test'
2026-10-10T21:21:25.0040426Z   ...
2026-10-10T21:21:25.0041231Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":2}
2026-10-10T21:21:25.0042509Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":503,"duration":1}
2026-10-10T21:21:25.0043867Z # Subtest: TST-285005: paused Bridges expose tunnel state but retain paused POST refusal
2026-10-10T21:21:25.0045197Z ok 74 - TST-285005: paused Bridges expose tunnel state but retain paused POST refusal
2026-10-10T21:21:25.0046121Z   ---
2026-10-10T21:21:25.0046838Z   duration_ms: 12.600735
2026-10-10T21:21:25.0047606Z   type: 'test'
2026-10-10T21:21:25.0048256Z   ...
2026-10-10T21:21:25.0049288Z # Subtest: TST-285006: tunnel-state request logging excludes token and headers
2026-10-10T21:21:25.0050805Z ok 75 - TST-285006: tunnel-state request logging excludes token and headers
2026-10-10T21:21:25.0051965Z   ---
2026-10-10T21:21:25.0052649Z   duration_ms: 9.598326
2026-10-10T21:21:25.0053416Z   type: 'test'
2026-10-10T21:21:25.0054332Z   ...
2026-10-10T21:21:25.0056087Z # Subtest: TST-290103 clearEverything removes every entry of one instance without clearing other browser state
2026-10-10T21:21:25.0058174Z ok 76 - TST-290103 clearEverything removes every entry of one instance without clearing other browser state
2026-10-10T21:21:25.0059616Z   ---
2026-10-10T21:21:25.0060406Z   duration_ms: 4.318496
2026-10-10T21:21:25.0061236Z   type: 'test'
2026-10-10T21:21:25.0062138Z   ...
2026-10-10T21:21:25.0063379Z # Subtest: TST-290104 secretValues returns only implemented credential strings
2026-10-10T21:21:25.0065239Z ok 77 - TST-290104 secretValues returns only implemented credential strings
2026-10-10T21:21:25.0066359Z   ---
2026-10-10T21:21:25.0067136Z   duration_ms: 3.241121
2026-10-10T21:21:25.0067983Z   type: 'test'
2026-10-10T21:21:25.0068598Z   ...
2026-10-10T21:21:25.0069199Z # Subtest: an endpoint survives reopening the same instance store
2026-10-10T21:21:25.0070350Z ok 78 - an endpoint survives reopening the same instance store
2026-10-10T21:21:25.0071161Z   ---
2026-10-10T21:21:25.0071729Z   duration_ms: 4.106351
2026-10-10T21:21:25.0072449Z   type: 'test'
2026-10-10T21:21:25.0073008Z   ...
2026-10-10T21:21:25.0073824Z # Subtest: an endpoint without a key is stored unchanged
2026-10-10T21:21:25.0183859Z ok 79 - an endpoint without a key is stored unchanged
2026-10-10T21:21:25.0206601Z   ---
2026-10-10T21:21:25.0207501Z   duration_ms: 0.495001
2026-10-10T21:21:25.0208233Z   type: 'test'
2026-10-10T21:21:25.0208860Z   ...
2026-10-10T21:21:25.0210109Z # Subtest: a refused endpoint key changes only when the author explicitly writes a replacement
2026-10-10T21:21:25.0211826Z ok 80 - a refused endpoint key changes only when the author explicitly writes a replacement
2026-10-10T21:21:25.0213087Z   ---
2026-10-10T21:21:25.0213709Z   duration_ms: 0.377413
2026-10-10T21:21:25.0214384Z   type: 'test'
2026-10-10T21:21:25.0215015Z   ...
2026-10-10T21:21:25.0223970Z # Subtest: clearing an endpoint removes its actual localStorage entry
2026-10-10T21:21:25.0225186Z ok 81 - clearing an endpoint removes its actual localStorage entry
2026-10-10T21:21:25.0225918Z   ---
2026-10-10T21:21:25.0226348Z   duration_ms: 0.449566
2026-10-10T21:21:25.0226858Z   type: 'test'
2026-10-10T21:21:25.0227342Z   ...
2026-10-10T21:21:25.0228140Z # Subtest: instance prefixes isolate endpoint and pairing settings
2026-10-10T21:21:25.0229212Z ok 82 - instance prefixes isolate endpoint and pairing settings
2026-10-10T21:21:25.0229911Z   ---
2026-10-10T21:21:25.0230356Z   duration_ms: 0.640552
2026-10-10T21:21:25.0230848Z   type: 'test'
2026-10-10T21:21:25.0231318Z   ...
2026-10-10T21:21:25.0232542Z # Subtest: TST-279-01 persists the accepted jump-host value and lists only non-secret metadata
2026-10-10T21:21:25.0234430Z ok 83 - TST-279-01 persists the accepted jump-host value and lists only non-secret metadata
2026-10-10T21:21:25.0235405Z   ---
2026-10-10T21:21:25.0235876Z   duration_ms: 5.260828
2026-10-10T21:21:25.0236389Z   type: 'test'
2026-10-10T21:21:25.0236840Z   ...
2026-10-10T21:21:25.0237631Z # Subtest: TST-279-02 isolates jump-host settings between instances
2026-10-10T21:21:25.0238730Z ok 84 - TST-279-02 isolates jump-host settings between instances
2026-10-10T21:21:25.0239436Z   ---
2026-10-10T21:21:25.0239892Z   duration_ms: 0.432839
2026-10-10T21:21:25.0240363Z   type: 'test'
2026-10-10T21:21:25.0240791Z   ...
2026-10-10T21:21:25.0243755Z # Subtest: TST-279-03 clears the actual jump-host entry including its login and still refuses unknown keys
2026-10-10T21:21:25.0245451Z ok 85 - TST-279-03 clears the actual jump-host entry including its login and still refuses unknown keys
2026-10-10T21:21:25.0246384Z   ---
2026-10-10T21:21:25.0246843Z   duration_ms: 0.895375
2026-10-10T21:21:25.0247339Z   type: 'test'
2026-10-10T21:21:25.0247747Z   ...
2026-10-10T21:21:25.0585131Z # Subtest: TST-283001 exports and reads the canonical plain version-1 envelope without localStorage
2026-10-10T21:21:25.0590050Z ok 86 - TST-283001 exports and reads the canonical plain version-1 envelope without localStorage
2026-10-10T21:21:25.0591342Z   ---
2026-10-10T21:21:25.0592120Z   duration_ms: 2.562602
2026-10-10T21:21:25.0592783Z   type: 'test'
2026-10-10T21:21:25.0593363Z   ...
2026-10-10T21:21:25.5257430Z # Subtest: TST-283002 locks every exported secret with the accepted WebCrypto envelope and leaves storage unchanged on a wrong passphrase
2026-10-10T21:21:25.5286025Z ok 87 - TST-283002 locks every exported secret with the accepted WebCrypto envelope and leaves storage unchanged on a wrong passphrase
2026-10-10T21:21:25.5320198Z   ---
2026-10-10T21:21:25.5346211Z   duration_ms: 473.097205
2026-10-10T21:21:25.5349109Z   type: 'test'
2026-10-10T21:21:25.5349764Z   ...
2026-10-10T21:21:25.5350906Z # Subtest: TST-283003 persists named remote sessions, lists no secret metadata, and clears their raw entry
2026-10-10T21:21:25.5352837Z ok 88 - TST-283003 persists named remote sessions, lists no secret metadata, and clears their raw entry
2026-10-10T21:21:25.5353987Z   ---
2026-10-10T21:21:25.5354547Z   duration_ms: 0.857239
2026-10-10T21:21:25.5355125Z   type: 'test'
2026-10-10T21:21:25.5355634Z   ...
2026-10-10T21:21:25.5356688Z # Subtest: TST-283004 imports only absent settings and validates every incoming key before any write
2026-10-10T21:21:25.5358749Z ok 89 - TST-283004 imports only absent settings and validates every incoming key before any write
2026-10-10T21:21:25.5359751Z   ---
2026-10-10T21:21:25.5360270Z   duration_ms: 0.919319
2026-10-10T21:21:25.5360799Z   type: 'test'
2026-10-10T21:21:25.5361280Z   ...
2026-10-10T21:21:25.5417743Z # Subtest: TST-272 listSettings lists implemented literal settings without exposing their stored values
2026-10-10T21:21:25.5493499Z ok 90 - TST-272 listSettings lists implemented literal settings without exposing their stored values
2026-10-10T21:21:25.5512074Z   ---
2026-10-10T21:21:25.5512882Z   duration_ms: 4.061466
2026-10-10T21:21:25.5513540Z   type: 'test'
2026-10-10T21:21:25.5514095Z   ...
2026-10-10T21:21:25.5515283Z # Subtest: TST-273 listSettings discovers dynamic settings and removes a cleared endpoint from discovery
2026-10-10T21:21:25.5516779Z ok 91 - TST-273 listSettings discovers dynamic settings and removes a cleared endpoint from discovery
2026-10-10T21:21:25.5517816Z   ---
2026-10-10T21:21:25.5518401Z   duration_ms: 0.844807
2026-10-10T21:21:25.5518972Z   type: 'test'
2026-10-10T21:21:25.5519619Z   ...
2026-10-10T21:21:25.5520713Z # Subtest: TST-274 listSettings isolates an instance and only reads its known storage entries
2026-10-10T21:21:25.5522319Z ok 92 - TST-274 listSettings isolates an instance and only reads its known storage entries
2026-10-10T21:21:25.5523257Z   ---
2026-10-10T21:21:25.5523812Z   duration_ms: 0.605125
2026-10-10T21:21:25.5524370Z   type: 'test'
2026-10-10T21:21:25.5525309Z   ...
2026-10-10T21:21:25.5526534Z # Subtest: TST-275 listSettings lists a stored last-test setting without exposing values and preserves it after endpoint clear
2026-10-10T21:21:25.5528401Z ok 93 - TST-275 listSettings lists a stored last-test setting without exposing values and preserves it after endpoint clear
2026-10-10T21:21:25.5529540Z   ---
2026-10-10T21:21:25.5530062Z   duration_ms: 0.474319
2026-10-10T21:21:25.5530627Z   type: 'test'
2026-10-10T21:21:25.5531139Z   ...
2026-10-10T21:21:25.5532816Z # Subtest: writeSetting/readSetting keep this item's catalogue keys in localStorage, under the instance's prefix, and set no cookie
2026-10-10T21:21:25.5534906Z ok 94 - writeSetting/readSetting keep this item's catalogue keys in localStorage, under the instance's prefix, and set no cookie
2026-10-10T21:21:25.5536077Z   ---
2026-10-10T21:21:25.5536630Z   duration_ms: 3.483231
2026-10-10T21:21:25.5537198Z   type: 'test'
2026-10-10T21:21:25.5537697Z   ...
2026-10-10T21:21:25.5538761Z # Subtest: clearSetting removes each catalogue key from localStorage itself, not only from readSetting's answer
2026-10-10T21:21:25.5540442Z ok 95 - clearSetting removes each catalogue key from localStorage itself, not only from readSetting's answer
2026-10-10T21:21:25.5541474Z   ---
2026-10-10T21:21:25.5542174Z   duration_ms: 0.343163
2026-10-10T21:21:25.5542806Z   type: 'test'
2026-10-10T21:21:25.5543328Z   ...
2026-10-10T21:21:25.5544241Z # Subtest: writeSetting refuses a key outside the catalogue with UnknownSetting
2026-10-10T21:21:25.5545530Z ok 96 - writeSetting refuses a key outside the catalogue with UnknownSetting
2026-10-10T21:21:25.5546365Z   ---
2026-10-10T21:21:25.5546857Z   duration_ms: 0.7653
2026-10-10T21:21:25.5547417Z   type: 'test'
2026-10-10T21:21:25.5547921Z   ...
2026-10-10T21:21:25.5548966Z # Subtest: openStore throws StorageUnavailable where localStorage refuses to store anything
2026-10-10T21:21:25.5550372Z ok 97 - openStore throws StorageUnavailable where localStorage refuses to store anything
2026-10-10T21:21:25.5551360Z   ---
2026-10-10T21:21:25.5552065Z   duration_ms: 0.200129
2026-10-10T21:21:25.5552647Z   type: 'test'
2026-10-10T21:21:25.5553155Z   ...
2026-10-10T21:21:25.5554299Z # Subtest: writeSetting throws StorageUnavailable where localStorage refuses the write after the store was opened
2026-10-10T21:21:25.5556043Z ok 98 - writeSetting throws StorageUnavailable where localStorage refuses the write after the store was opened
2026-10-10T21:21:25.5557101Z   ---
2026-10-10T21:21:25.5557992Z   duration_ms: 0.211335
2026-10-10T21:21:25.5558707Z   type: 'test'
2026-10-10T21:21:25.5559243Z   ...
2026-10-10T21:21:25.6286623Z # Subtest: the running sprint's board: in progress with the open pull request and who opened it, done with the merged one and when, waiting for acceptance, ready
2026-10-10T21:21:25.6314585Z ok 99 - the running sprint's board: in progress with the open pull request and who opened it, done with the merged one and when, waiting for acceptance, ready
2026-10-10T21:21:25.6315912Z   ---
2026-10-10T21:21:25.6316155Z   duration_ms: 266.633151
2026-10-10T21:21:25.6316410Z   type: 'test'
2026-10-10T21:21:25.6316625Z   ...
2026-10-10T21:21:25.6317350Z # Subtest: counter-proofs: a pull request naming no item changes no state; one merged into another base than the sprint branch is not done for the sprint
2026-10-10T21:21:25.6318450Z ok 100 - counter-proofs: a pull request naming no item changes no state; one merged into another base than the sprint branch is not done for the sprint
2026-10-10T21:21:25.6319041Z   ---
2026-10-10T21:21:25.6319248Z   duration_ms: 229.905215
2026-10-10T21:21:25.6319485Z   type: 'test'
2026-10-10T21:21:25.6319683Z   ...
2026-10-10T21:21:25.7000008Z # Subtest: below the limit no ready item is held by it; a closed pull request that was not merged is no work in progress
2026-10-10T21:21:25.7001772Z ok 101 - below the limit no ready item is held by it; a closed pull request that was not merged is no work in progress
2026-10-10T21:21:25.7033648Z   ---
2026-10-10T21:21:25.7034030Z   duration_ms: 69.294705
2026-10-10T21:21:25.7034434Z   type: 'test'
2026-10-10T21:21:25.7034771Z   ...
2026-10-10T21:21:25.7904643Z # Subtest: with no running sprint, the last sprint's board is shown and the page says so
2026-10-10T21:21:25.7929669Z ok 102 - with no running sprint, the last sprint's board is shown and the page says so
2026-10-10T21:21:25.7950945Z   ---
2026-10-10T21:21:25.7968017Z   duration_ms: 91.952877
2026-10-10T21:21:25.7968731Z   type: 'test'
2026-10-10T21:21:25.7969343Z   ...
2026-10-10T21:21:25.9109357Z # Subtest: the backlog is folded: its unselected items are read only when the reader unfolds it — then in its order, each with its derived state
2026-10-10T21:21:25.9112287Z ok 103 - the backlog is folded: its unselected items are read only when the reader unfolds it — then in its order, each with its derived state
2026-10-10T21:21:25.9114393Z   ---
2026-10-10T21:21:25.9114966Z   duration_ms: 120.291715
2026-10-10T21:21:25.9115595Z   type: 'test'
2026-10-10T21:21:25.9116150Z   ...
2026-10-10T21:21:26.0365403Z # Subtest: the accepted requirements and use cases that no item realises yet — withdrawn and open names are not among them
2026-10-10T21:21:26.0366887Z ok 104 - the accepted requirements and use cases that no item realises yet — withdrawn and open names are not among them
2026-10-10T21:21:26.0367544Z   ---
2026-10-10T21:21:26.0367955Z   duration_ms: 126.046919
2026-10-10T21:21:26.0368376Z   type: 'test'
2026-10-10T21:21:26.0368741Z   ...
2026-10-10T21:21:26.1505344Z # Subtest: nothing is written: every request of the tab and of its fold is a GET
2026-10-10T21:21:26.1523064Z ok 105 - nothing is written: every request of the tab and of its fold is a GET
2026-10-10T21:21:26.1551713Z   ---
2026-10-10T21:21:26.1552471Z   duration_ms: 114.128047
2026-10-10T21:21:26.1553074Z   type: 'test'
2026-10-10T21:21:26.1553489Z   ...
2026-10-10T21:21:26.2148841Z # Subtest: every part carries a folded What is this? — the uncovered names, the sprint, the limit, the backlog, and each state; no job runs yet
2026-10-10T21:21:26.2150852Z ok 106 - every part carries a folded What is this? — the uncovered names, the sprint, the limit, the backlog, and each state; no job runs yet
2026-10-10T21:21:26.2151824Z   ---
2026-10-10T21:21:26.2152282Z   duration_ms: 64.209888
2026-10-10T21:21:26.2152652Z   type: 'test'
2026-10-10T21:21:26.2153038Z   ...
2026-10-10T21:21:26.4735591Z # Subtest: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same board; a planted state changes nothing
2026-10-10T21:21:26.4738506Z ok 107 - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same board; a planted state changes nothing
2026-10-10T21:21:26.4739925Z   ---
2026-10-10T21:21:26.4740692Z   duration_ms: 257.997196
2026-10-10T21:21:26.4741250Z   type: 'test'
2026-10-10T21:21:26.4741583Z   ...
2026-10-10T21:21:26.7120720Z # Subtest: API economy: each dashboard load reads the sprint, the order, the selected items and one page of pull requests
2026-10-10T21:21:26.7124157Z ok 108 - API economy: each dashboard load reads the sprint, the order, the selected items and one page of pull requests
2026-10-10T21:21:26.7125136Z   ---
2026-10-10T21:21:26.7132928Z   duration_ms: 199.935354
2026-10-10T21:21:26.7133687Z   type: 'test'
2026-10-10T21:21:26.7134276Z   ...
2026-10-10T21:21:26.7135699Z # backlog tab, 25 selected of 140 items: cold 33 requests (30 files, commit, tree, 1 page of pull requests); next load 33 (the same reads)
2026-10-10T21:21:26.7137314Z # unfolding the backlog, cold: 116 requests (115 item files, 1 pages of pull requests)
2026-10-10T21:21:26.9933774Z # Subtest: Agent M's own sprint 02: its goal, branch, closer and planner, the limit of four, and every selected item once on the board
2026-10-10T21:21:26.9935993Z ok 109 - Agent M's own sprint 02: its goal, branch, closer and planner, the limit of four, and every selected item once on the board
2026-10-10T21:21:26.9937571Z   ---
2026-10-10T21:21:26.9938151Z   duration_ms: 320.440868
2026-10-10T21:21:26.9938712Z   type: 'test'
2026-10-10T21:21:26.9939209Z   ...
2026-10-10T21:21:26.9942528Z # Agent M's sprint 02 on the fixture — ready: ITM-018, ITM-134, ITM-143, ITM-144, ITM-142, ITM-145; in progress: ITM-147, ITM-136; done: ITM-141, ITM-125, ITM-126, ITM-027, ITM-127, ITM-131, ITM-129, ITM-033, ITM-128, ITM-132, ITM-130, ITM-034, ITM-146, ITM-050, ITM-133, ITM-014, ITM-016; blocked: none; waiting for acceptance: none
2026-10-10T21:21:26.9945057Z # Agent M's own sprint 02, cold load: 34 requests (31 files, 1 page of pull requests)
2026-10-10T21:21:26.9961109Z # Agent M's own sprint 02, warm load: 34 requests (commit, tree, file docs/process.md, file docs/process-models/scrum-wip.md, file docs/backlog/sprints/sprint-01.md, file docs/backlog/sprints/sprint-02.md, file docs/backlog/order.md, file SPEC.md, pull requests file docs/backlog/ITM-141-release-tests-of-the-sprint-01-increment.md, file docs/backlog/ITM-125-the-export-notice-names-pull-requests.md, file docs/backlog/ITM-126-identifier-kept-returns-a-finding.md, file docs/backlog/ITM-027-process-model-parse-and-validate.md, file docs/backlog/ITM-127-a-source-named-as-written-is-no-error.md, file docs/backlog/ITM-131-a-refused-save-shows-the-newer-version.md, file docs/backlog/ITM-129-no-request-for-a-view-file-not-built.md, file docs/backlog/ITM-033-backlog-items-and-order.md, file docs/backlog/ITM-128-no-test-reads-agent-ms-own-spec.md, file docs/backlog/ITM-132-add-product-missing-repository-and-step-a-done.md, file docs/backlog/ITM-130-the-reads-leave-the-kernel.md, file docs/backlog/ITM-034-sprints-wip-and-selection.md, file docs/backlog/ITM-146-pull-requests-of-a-product-on-both-hosts.md, file docs/backlog/ITM-050-product-rules-repository-checks.md, file docs/backlog/ITM-133-a-refused-write-offers-the-github-path.md, file docs/backlog/ITM-147-the-backlog-and-the-sprint-read-a-first-process-dashboard.md, file docs/backlog/ITM-014-characterise-the-approval-gates.md, file docs/backlog/ITM-136-a-settings-line-keeps-its-last-test.md, file docs/backlog/ITM-018-link-graph-gaps-and-impact.md, file docs/backlog/ITM-016-apply-approvals-in-the-engine.md, file docs/backlog/ITM-134-spec-change-entry-shows-its-impact-list.md, file docs/backlog/ITM-143-release-tests-of-sprint-02-strand-b.md, file docs/backlog/ITM-144-release-tests-of-sprint-02-strand-c.md, file docs/backlog/ITM-142-release-tests-of-sprint-02-strand-a.md, file docs/backlog/ITM-145-release-tests-of-sprint-02-strand-d.md)
2026-10-10T21:21:26.9975671Z # Agent M's own backlog unfolded: 135 requests (133 item files, 2 pages of pull requests: sprint/01, main)
2026-10-10T21:21:27.0173250Z # Subtest: TST-280003: empty Settings reaches the public Bridge configuration route
2026-10-10T21:21:27.0193167Z ok 110 - TST-280003: empty Settings reaches the public Bridge configuration route
2026-10-10T21:21:27.0194154Z   ---
2026-10-10T21:21:27.0194759Z   duration_ms: 332.963042
2026-10-10T21:21:27.0195356Z   type: 'test'
2026-10-10T21:21:27.0195915Z   ...
2026-10-10T21:21:27.0196842Z # Subtest: TST-280004: saved Bridge Change reaches the public route through dashboard go
2026-10-10T21:21:27.0198163Z ok 111 - TST-280004: saved Bridge Change reaches the public route through dashboard go
2026-10-10T21:21:27.0199028Z   ---
2026-10-10T21:21:27.0199554Z   duration_ms: 169.911952
2026-10-10T21:21:27.0200115Z   type: 'test'
2026-10-10T21:21:27.0200616Z   ...
2026-10-10T21:21:27.0201791Z # Subtest: TST-288101: dashboard Settings exports and restores every delivered setup secret through its canonical route
2026-10-10T21:21:27.0203757Z ok 112 - TST-288101: dashboard Settings exports and restores every delivered setup secret through its canonical route
2026-10-10T21:21:27.0204839Z   ---
2026-10-10T21:21:27.0205360Z   duration_ms: 225.034865
2026-10-10T21:21:27.0205889Z   type: 'test'
2026-10-10T21:21:27.0206371Z   ...
2026-10-10T21:21:27.0207343Z # Subtest: TST-290: Settings composes the stored endpoint slice beside legacy browser settings
2026-10-10T21:21:27.0209037Z ok 113 - TST-290: Settings composes the stored endpoint slice beside legacy browser settings
2026-10-10T21:21:27.0209934Z   ---
2026-10-10T21:21:27.0210456Z   duration_ms: 253.266865
2026-10-10T21:21:27.0210985Z   type: 'test'
2026-10-10T21:21:27.0211431Z   ...
2026-10-10T21:21:27.0212405Z # Subtest: TST-291: dashboard dispatches public endpoint creation and named editing routes
2026-10-10T21:21:27.0213789Z ok 114 - TST-291: dashboard dispatches public endpoint creation and named editing routes
2026-10-10T21:21:27.0214691Z   ---
2026-10-10T21:21:27.0215202Z   duration_ms: 161.219566
2026-10-10T21:21:27.0215748Z   type: 'test'
2026-10-10T21:21:27.0216218Z   ...
2026-10-10T21:21:27.0217521Z # Subtest: the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key
2026-10-10T21:21:27.0219559Z ok 115 - the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key
2026-10-10T21:21:27.0220707Z   ---
2026-10-10T21:21:27.0221213Z   duration_ms: 269.832785
2026-10-10T21:21:27.0221735Z   type: 'test'
2026-10-10T21:21:27.0222313Z   ...
2026-10-10T21:21:27.0223772Z # Subtest: the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:21:27.0225608Z ok 116 - the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:21:27.0226773Z   ---
2026-10-10T21:21:27.0227395Z   duration_ms: 57.751435
2026-10-10T21:21:27.0228466Z   type: 'test'
2026-10-10T21:21:27.0229519Z   ...
2026-10-10T21:21:27.0231413Z # Subtest: the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:21:27.0234155Z ok 117 - the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:21:27.0235495Z   ---
2026-10-10T21:21:27.0236360Z   duration_ms: 61.947628
2026-10-10T21:21:27.0237097Z   type: 'test'
2026-10-10T21:21:27.0237610Z   ...
2026-10-10T21:21:27.0238800Z # Subtest: ITM-238 F1 fixed: the Notifications controls are in the public Usability tab
2026-10-10T21:21:27.0240143Z ok 118 - ITM-238 F1 fixed: the Notifications controls are in the public Usability tab
2026-10-10T21:21:27.0241222Z   ---
2026-10-10T21:21:27.0241850Z   duration_ms: 104.813391
2026-10-10T21:21:27.0242669Z   type: 'test'
2026-10-10T21:21:27.0243215Z   ...
2026-10-10T21:21:27.0244547Z # Subtest: ITM-238 F2 fixed: the review pages' check connects the instance with the dashboard's own stored token
2026-10-10T21:21:27.0246836Z ok 119 - ITM-238 F2 fixed: the review pages' check connects the instance with the dashboard's own stored token
2026-10-10T21:21:27.0247869Z   ---
2026-10-10T21:21:27.0248514Z   duration_ms: 61.550457
2026-10-10T21:21:27.0249201Z   type: 'test'
2026-10-10T21:21:27.0249821Z   ...
2026-10-10T21:21:27.0251155Z # Subtest: ITM-238 F2 fixed: the main page's check also connects the instance with the dashboard's own stored token
2026-10-10T21:21:27.0253056Z ok 120 - ITM-238 F2 fixed: the main page's check also connects the instance with the dashboard's own stored token
2026-10-10T21:21:27.0254026Z   ---
2026-10-10T21:21:27.0254629Z   duration_ms: 58.353202
2026-10-10T21:21:27.0255171Z   type: 'test'
2026-10-10T21:21:27.0255675Z   ...
2026-10-10T21:21:27.0257622Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted
2026-10-10T21:21:27.0260656Z ok 121 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted
2026-10-10T21:21:27.0262217Z   ---
2026-10-10T21:21:27.0262723Z   duration_ms: 215.725665
2026-10-10T21:21:27.0263258Z   type: 'test'
2026-10-10T21:21:27.0263706Z   ...
2026-10-10T21:21:27.0265004Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file already notified yields no further notification
2026-10-10T21:21:27.0267078Z ok 122 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file already notified yields no further notification
2026-10-10T21:21:27.0268050Z   ---
2026-10-10T21:21:27.0268536Z   duration_ms: 166.309054
2026-10-10T21:21:27.0269084Z   type: 'test'
2026-10-10T21:21:27.0269563Z   ...
2026-10-10T21:21:27.0270809Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — notifications switched off yields no notification
2026-10-10T21:21:27.0303543Z ok 123 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — notifications switched off yields no notification
2026-10-10T21:21:27.0308048Z   ---
2026-10-10T21:21:27.0312171Z   duration_ms: 107.14643
2026-10-10T21:21:27.0312942Z   type: 'test'
2026-10-10T21:21:27.0313613Z   ...
2026-10-10T21:21:27.0315519Z # Subtest: NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page, the main page among them, asks before the click; the click asks once
2026-10-10T21:21:27.0318202Z ok 124 - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page, the main page among them, asks before the click; the click asks once
2026-10-10T21:21:27.0319433Z   ---
2026-10-10T21:21:27.0320129Z   duration_ms: 225.448922
2026-10-10T21:21:27.0320855Z   type: 'test'
2026-10-10T21:21:27.0321528Z   ...
2026-10-10T21:21:27.0322981Z # Subtest: TST-289101: public \#release reopens the selected product's pending report without writes
2026-10-10T21:21:27.0324744Z ok 125 - TST-289101: public \#release reopens the selected product's pending report without writes
2026-10-10T21:21:27.0325910Z   ---
2026-10-10T21:21:27.0326452Z   duration_ms: 267.559724
2026-10-10T21:21:27.0327147Z   type: 'test'
2026-10-10T21:21:27.0327754Z   ...
2026-10-10T21:21:27.0329187Z # Subtest: TST-289102: public \#release keeps the new-release form when the selected product has no pending report
2026-10-10T21:21:27.0331148Z ok 126 - TST-289102: public \#release keeps the new-release form when the selected product has no pending report
2026-10-10T21:21:27.0332432Z   ---
2026-10-10T21:21:27.0333092Z   duration_ms: 114.365238
2026-10-10T21:21:27.0333764Z   type: 'test'
2026-10-10T21:21:27.0334387Z   ...
2026-10-10T21:21:27.1033449Z # Subtest: the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:21:27.1035045Z ok 127 - the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:21:27.1069475Z   ---
2026-10-10T21:21:27.1093814Z   duration_ms: 0.898159
2026-10-10T21:21:27.1095085Z   type: 'test'
2026-10-10T21:21:27.1095622Z   ...
2026-10-10T21:21:27.1096896Z # Subtest: routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:21:27.1098839Z ok 128 - routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:21:27.1100006Z   ---
2026-10-10T21:21:27.1100551Z   duration_ms: 111.36321
2026-10-10T21:21:27.1101127Z   type: 'test'
2026-10-10T21:21:27.1101709Z   ...
2026-10-10T21:21:27.2591715Z # Subtest: the dashboard migrates its product list and tokens into MOD-browser-store
2026-10-10T21:21:27.2595831Z ok 129 - the dashboard migrates its product list and tokens into MOD-browser-store
2026-10-10T21:21:27.2596542Z   ---
2026-10-10T21:21:27.2596962Z   duration_ms: 3.14546
2026-10-10T21:21:27.2597278Z   type: 'test'
2026-10-10T21:21:27.2597552Z   ...
2026-10-10T21:21:27.2598104Z # Subtest: the adapter discovers token-only GitLab products and preserves imported public values
2026-10-10T21:21:27.2599334Z ok 130 - the adapter discovers token-only GitLab products and preserves imported public values
2026-10-10T21:21:27.2599842Z   ---
2026-10-10T21:21:27.2600112Z   duration_ms: 0.928624
2026-10-10T21:21:27.2600410Z   type: 'test'
2026-10-10T21:21:27.2600687Z   ...
2026-10-10T21:21:27.2601204Z # Subtest: the dashboard \#add entry renders the settings-pages route with its instance token
2026-10-10T21:21:27.2602169Z ok 131 - the dashboard \#add entry renders the settings-pages route with its instance token
2026-10-10T21:21:27.2603096Z   ---
2026-10-10T21:21:27.2603463Z   duration_ms: 265.22312
2026-10-10T21:21:27.2603974Z   type: 'test'
2026-10-10T21:21:27.2604308Z   ...
2026-10-10T21:21:27.3953404Z # Subtest: the dashboard \#settings entry mounts the public Settings route
2026-10-10T21:21:27.3954514Z ok 132 - the dashboard \#settings entry mounts the public Settings route
2026-10-10T21:21:27.3955165Z   ---
2026-10-10T21:21:27.3955524Z   duration_ms: 135.307657
2026-10-10T21:21:27.3955954Z   type: 'test'
2026-10-10T21:21:27.3956290Z   ...
2026-10-10T21:21:27.5581040Z # Subtest: the public add-product route rejects a synthetic Add product click
2026-10-10T21:21:27.5582306Z ok 133 - the public add-product route rejects a synthetic Add product click
2026-10-10T21:21:27.5582961Z   ---
2026-10-10T21:21:27.5583311Z   duration_ms: 162.123284
2026-10-10T21:21:27.5583713Z   type: 'test'
2026-10-10T21:21:27.5584055Z   ...
2026-10-10T21:21:27.5584948Z # Subtest: clearing product tokens clears their canonical values and cannot resurrect them on reload
2026-10-10T21:21:27.5586222Z ok 134 - clearing product tokens clears their canonical values and cannot resurrect them on reload
2026-10-10T21:21:27.5586942Z   ---
2026-10-10T21:21:27.5587249Z   duration_ms: 0.834361
2026-10-10T21:21:27.5587599Z   type: 'test'
2026-10-10T21:21:27.5587954Z   ...
2026-10-10T21:21:27.5609307Z # Subtest: removing a product clears its canonical address and token without reload resurrection
2026-10-10T21:21:27.5659600Z ok 135 - removing a product clears its canonical address and token without reload resurrection
2026-10-10T21:21:27.5704340Z   ---
2026-10-10T21:21:27.5706203Z   duration_ms: 0.507612
2026-10-10T21:21:27.5716306Z   type: 'test'
2026-10-10T21:21:27.5717009Z   ...
2026-10-10T21:21:27.5800011Z # Subtest: TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect
2026-10-10T21:21:27.5801609Z ok 136 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect
2026-10-10T21:21:27.5802991Z   ---
2026-10-10T21:21:27.5806666Z   duration_ms: 273.761544
2026-10-10T21:21:27.5807225Z   type: 'test'
2026-10-10T21:21:27.5807708Z   ...
2026-10-10T21:21:27.6694317Z # Subtest: UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance
2026-10-10T21:21:27.6697165Z ok 137 - UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance
2026-10-10T21:21:27.6698800Z   ---
2026-10-10T21:21:27.6699330Z   duration_ms: 202.515055
2026-10-10T21:21:27.6699909Z   type: 'test'
2026-10-10T21:21:27.6700374Z   ...
2026-10-10T21:21:27.6701780Z # Subtest: UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted
2026-10-10T21:21:27.6704363Z ok 138 - UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted
2026-10-10T21:21:27.6705738Z   ---
2026-10-10T21:21:27.6706235Z   duration_ms: 152.88998
2026-10-10T21:21:27.6706734Z   type: 'test'
2026-10-10T21:21:27.6707190Z   ...
2026-10-10T21:21:27.6708119Z # Subtest: UC-008 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:21:27.6709377Z ok 139 - UC-008 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:21:27.6710271Z   ---
2026-10-10T21:21:27.6710749Z   duration_ms: 111.916411
2026-10-10T21:21:27.6711371Z   type: 'test'
2026-10-10T21:21:27.6711807Z   ...
2026-10-10T21:21:27.7289510Z # Subtest: UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names
2026-10-10T21:21:27.7309491Z ok 140 - UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names
2026-10-10T21:21:27.7310403Z   ---
2026-10-10T21:21:27.7311134Z   duration_ms: 59.841798
2026-10-10T21:21:27.7311534Z   type: 'test'
2026-10-10T21:21:27.7311854Z   ...
2026-10-10T21:21:27.8672326Z # Subtest: UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone
2026-10-10T21:21:27.8673476Z ok 141 - UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone
2026-10-10T21:21:27.8674172Z   ---
2026-10-10T21:21:27.8674679Z   duration_ms: 139.320271
2026-10-10T21:21:27.8675244Z   type: 'test'
2026-10-10T21:21:27.8675742Z   ...
2026-10-10T21:21:28.0852833Z # Subtest: UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open
2026-10-10T21:21:28.0854903Z ok 142 - UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open
2026-10-10T21:21:28.0856105Z   ---
2026-10-10T21:21:28.0856589Z   duration_ms: 218.251674
2026-10-10T21:21:28.0857299Z   type: 'test'
2026-10-10T21:21:28.0857782Z   ...
2026-10-10T21:21:28.2466175Z # Subtest: UC-008 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:21:28.2467398Z ok 143 - UC-008 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:21:28.2467883Z   ---
2026-10-10T21:21:28.2468093Z   duration_ms: 161.183482
2026-10-10T21:21:28.2468323Z   type: 'test'
2026-10-10T21:21:28.2468524Z   ...
2026-10-10T21:21:28.4037936Z # Subtest: UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor
2026-10-10T21:21:28.4039441Z ok 144 - UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor
2026-10-10T21:21:28.4040187Z   ---
2026-10-10T21:21:28.4040498Z   duration_ms: 156.993978
2026-10-10T21:21:28.4040854Z   type: 'test'
2026-10-10T21:21:28.4041141Z   ...
2026-10-10T21:21:28.5664125Z # Subtest: UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor
2026-10-10T21:21:28.5665752Z ok 145 - UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor
2026-10-10T21:21:28.5666279Z   ---
2026-10-10T21:21:28.5666491Z   duration_ms: 162.357869
2026-10-10T21:21:28.5666727Z   type: 'test'
2026-10-10T21:21:28.5666924Z   ...
2026-10-10T21:21:28.9541218Z # Subtest: UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown
2026-10-10T21:21:28.9542999Z ok 146 - UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown
2026-10-10T21:21:28.9543549Z   ---
2026-10-10T21:21:28.9543853Z   duration_ms: 387.730561
2026-10-10T21:21:28.9544157Z   type: 'test'
2026-10-10T21:21:28.9544400Z   ...
2026-10-10T21:21:29.3433141Z # Subtest: UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted
2026-10-10T21:21:29.3434341Z ok 147 - UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted
2026-10-10T21:21:29.3434832Z   ---
2026-10-10T21:21:29.3435035Z   duration_ms: 389.068903
2026-10-10T21:21:29.3435263Z   type: 'test'
2026-10-10T21:21:29.3435456Z   ...
2026-10-10T21:21:29.5089187Z # Subtest: UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor
2026-10-10T21:21:29.5091125Z ok 148 - UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor
2026-10-10T21:21:29.5091776Z   ---
2026-10-10T21:21:29.5092302Z   duration_ms: 165.436939
2026-10-10T21:21:29.5092550Z   type: 'test'
2026-10-10T21:21:29.5092741Z   ...
2026-10-10T21:21:29.6249675Z # Subtest: UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case
2026-10-10T21:21:29.6251101Z ok 149 - UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case
2026-10-10T21:21:29.6251650Z   ---
2026-10-10T21:21:29.6251843Z   duration_ms: 115.9633
2026-10-10T21:21:29.6252282Z   type: 'test'
2026-10-10T21:21:29.6252552Z   ...
2026-10-10T21:21:29.6809055Z # Subtest: UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token
2026-10-10T21:21:29.6811558Z ok 150 - UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token
2026-10-10T21:21:29.6813006Z   ---
2026-10-10T21:21:29.6813507Z   duration_ms: 56.120157
2026-10-10T21:21:29.6814038Z   type: 'test'
2026-10-10T21:21:29.6814576Z   ...
2026-10-10T21:21:29.7968418Z # Subtest: UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and offers the way through GitHub's page as a link
2026-10-10T21:21:29.7970523Z ok 151 - UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and offers the way through GitHub's page as a link
2026-10-10T21:21:29.7972847Z   ---
2026-10-10T21:21:29.7973456Z   duration_ms: 115.6925
2026-10-10T21:21:29.7974368Z   type: 'test'
2026-10-10T21:21:29.7975061Z   ...
2026-10-10T21:21:29.8689788Z # Subtest: UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale
2026-10-10T21:21:29.8691036Z ok 152 - UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale
2026-10-10T21:21:29.8691620Z   ---
2026-10-10T21:21:29.8692095Z   duration_ms: 72.273544
2026-10-10T21:21:29.8692514Z   type: 'test'
2026-10-10T21:21:29.8692733Z   ...
2026-10-10T21:21:30.0013950Z # Subtest: UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC
2026-10-10T21:21:30.0015601Z ok 153 - UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC
2026-10-10T21:21:30.0016522Z   ---
2026-10-10T21:21:30.0017402Z   duration_ms: 132.415746
2026-10-10T21:21:30.0017977Z   type: 'test'
2026-10-10T21:21:30.0018186Z   ...
2026-10-10T21:21:30.1108223Z # Subtest: UC-006 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:21:30.1109788Z ok 154 - UC-006 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:21:30.1110503Z   ---
2026-10-10T21:21:30.1110845Z   duration_ms: 109.306626
2026-10-10T21:21:30.1111239Z   type: 'test'
2026-10-10T21:21:30.1111556Z   ...
2026-10-10T21:21:30.2255230Z # Subtest: UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state
2026-10-10T21:21:30.2257666Z ok 155 - UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state
2026-10-10T21:21:30.2259237Z   ---
2026-10-10T21:21:30.2259949Z   duration_ms: 114.678003
2026-10-10T21:21:30.2260268Z   type: 'test'
2026-10-10T21:21:30.2260468Z   ...
2026-10-10T21:21:30.3484368Z # Subtest: UC-006 5a: the proposal changed after the entry was opened — nothing is written
2026-10-10T21:21:30.3488685Z ok 156 - UC-006 5a: the proposal changed after the entry was opened — nothing is written
2026-10-10T21:21:30.3489659Z   ---
2026-10-10T21:21:30.3490419Z   duration_ms: 122.715429
2026-10-10T21:21:30.3490860Z   type: 'test'
2026-10-10T21:21:30.3491167Z   ...
2026-10-10T21:21:30.6585238Z # Subtest: UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text
2026-10-10T21:21:30.6587015Z ok 157 - UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text
2026-10-10T21:21:30.6588139Z   ---
2026-10-10T21:21:30.6588565Z   duration_ms: 310.11599
2026-10-10T21:21:30.6588876Z   type: 'test'
2026-10-10T21:21:30.6589079Z   ...
2026-10-10T21:21:30.8177904Z # Subtest: UC-006 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:21:30.8178928Z ok 158 - UC-006 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:21:30.8179304Z   ---
2026-10-10T21:21:30.8179514Z   duration_ms: 159.135714
2026-10-10T21:21:30.8179866Z   type: 'test'
2026-10-10T21:21:30.8180066Z   ...
2026-10-10T21:21:30.9822966Z # Subtest: UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor
2026-10-10T21:21:30.9824596Z ok 159 - UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor
2026-10-10T21:21:30.9825215Z   ---
2026-10-10T21:21:30.9825545Z   duration_ms: 164.427587
2026-10-10T21:21:30.9825799Z   type: 'test'
2026-10-10T21:21:30.9826002Z   ...
2026-10-10T21:21:31.3134137Z # Subtest: UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit
2026-10-10T21:21:31.3135492Z ok 160 - UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit
2026-10-10T21:21:31.3136116Z   ---
2026-10-10T21:21:31.3136318Z   duration_ms: 331.155447
2026-10-10T21:21:31.3136554Z   type: 'test'
2026-10-10T21:21:31.3136746Z   ...
2026-10-10T21:21:31.5119925Z # Subtest: UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs
2026-10-10T21:21:31.5136185Z ok 161 - UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs
2026-10-10T21:21:31.5137082Z   ---
2026-10-10T21:21:31.5147825Z   duration_ms: 197.855288
2026-10-10T21:21:31.5149734Z   type: 'test'
2026-10-10T21:21:31.5150071Z   ...
2026-10-10T21:21:31.6277627Z # Subtest: A GITHUB PRODUCT USES A TOKEN OF ITS OWN — a product's pages are read with its own key, the instance with the instance's; counter-proof: a product without a key of its own is read with the instance's
2026-10-10T21:21:31.6280451Z ok 162 - A GITHUB PRODUCT USES A TOKEN OF ITS OWN — a product's pages are read with its own key, the instance with the instance's; counter-proof: a product without a key of its own is read with the instance's
2026-10-10T21:21:31.6282321Z   ---
2026-10-10T21:21:31.6282646Z   duration_ms: 116.022228
2026-10-10T21:21:31.6283087Z   type: 'test'
2026-10-10T21:21:31.6283442Z   ...
2026-10-10T21:21:31.7363059Z # Subtest: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE — a product's own key that expires within fourteen days is named on the product's pages, with Renew at GitHub's list of tokens and where to paste the new value; counter-proof: the instance's pages do not name it
2026-10-10T21:21:31.7366911Z ok 163 - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE — a product's own key that expires within fourteen days is named on the product's pages, with Renew at GitHub's list of tokens and where to paste the new value; counter-proof: the instance's pages do not name it
2026-10-10T21:21:31.7368421Z   ---
2026-10-10T21:21:31.7368757Z   duration_ms: 108.483415
2026-10-10T21:21:31.7369276Z   type: 'test'
2026-10-10T21:21:31.7369565Z   ...
2026-10-10T21:21:32.0924911Z # Subtest: UC-042 · A GITHUB PRODUCT USES A TOKEN OF ITS OWN — Settings lists each GitHub product's own key: hidden until shown, its expiry, Test reads the product with it, Change opens with its field focused and stores a new value, Clear removes it after a confirmation; Remove takes it with the product
2026-10-10T21:21:32.0927296Z ok 164 - UC-042 · A GITHUB PRODUCT USES A TOKEN OF ITS OWN — Settings lists each GitHub product's own key: hidden until shown, its expiry, Test reads the product with it, Change opens with its field focused and stores a new value, Clear removes it after a confirmation; Remove takes it with the product
2026-10-10T21:21:32.0928806Z   ---
2026-10-10T21:21:32.0929012Z   duration_ms: 356.241689
2026-10-10T21:21:32.0929242Z   type: 'test'
2026-10-10T21:21:32.0929438Z   ...
2026-10-10T21:21:32.2066078Z # Subtest: UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not
2026-10-10T21:21:32.2067858Z ok 165 - UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not
2026-10-10T21:21:32.2068859Z   ---
2026-10-10T21:21:32.2069201Z   duration_ms: 113.799461
2026-10-10T21:21:32.2069592Z   type: 'test'
2026-10-10T21:21:32.2069895Z   ...
2026-10-10T21:21:32.2611612Z # Subtest: UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance
2026-10-10T21:21:32.2613745Z ok 166 - UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance
2026-10-10T21:21:32.2614822Z   ---
2026-10-10T21:21:32.2615176Z   duration_ms: 54.569878
2026-10-10T21:21:32.2615574Z   type: 'test'
2026-10-10T21:21:32.2615908Z   ...
2026-10-10T21:21:32.5003861Z # Subtest: UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready
2026-10-10T21:21:32.5006633Z ok 167 - UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready
2026-10-10T21:21:32.5007822Z   ---
2026-10-10T21:21:32.5008175Z   duration_ms: 239.216079
2026-10-10T21:21:32.5008595Z   type: 'test'
2026-10-10T21:21:32.5008933Z   ...
2026-10-10T21:21:32.7030984Z # Subtest: UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored
2026-10-10T21:21:32.7036896Z ok 168 - UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored
2026-10-10T21:21:32.7037723Z   ---
2026-10-10T21:21:32.7038276Z   duration_ms: 202.218181
2026-10-10T21:21:32.7038785Z   type: 'test'
2026-10-10T21:21:32.7039233Z   ...
2026-10-10T21:21:32.8222444Z # Subtest: UC-042 step 1: public component tabs keep every settings scope and existing control reachable
2026-10-10T21:21:32.8223365Z ok 169 - UC-042 step 1: public component tabs keep every settings scope and existing control reachable
2026-10-10T21:21:32.8224290Z   ---
2026-10-10T21:21:32.8224600Z   duration_ms: 119.468025
2026-10-10T21:21:32.8224908Z   type: 'test'
2026-10-10T21:21:32.8225185Z   ...
2026-10-10T21:21:33.0217119Z # Subtest: UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again
2026-10-10T21:21:33.0233320Z ok 170 - UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again
2026-10-10T21:21:33.0234200Z   ---
2026-10-10T21:21:33.0234550Z   duration_ms: 199.305977
2026-10-10T21:21:33.0234943Z   type: 'test'
2026-10-10T21:21:33.0235278Z   ...
2026-10-10T21:21:33.1723433Z # Subtest: UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works
2026-10-10T21:21:33.1733034Z ok 171 - UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works
2026-10-10T21:21:33.1752643Z   ---
2026-10-10T21:21:33.1782840Z   duration_ms: 150.087228
2026-10-10T21:21:33.1812517Z   type: 'test'
2026-10-10T21:21:33.1824175Z   ...
2026-10-10T21:21:33.3299812Z # Subtest: UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works
2026-10-10T21:21:33.3301064Z ok 172 - UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works
2026-10-10T21:21:33.3301825Z   ---
2026-10-10T21:21:33.3302795Z   duration_ms: 158.361528
2026-10-10T21:21:33.3303257Z   type: 'test'
2026-10-10T21:21:33.3304000Z   ...
2026-10-10T21:21:33.4874543Z # Subtest: UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token
2026-10-10T21:21:33.4876506Z ok 173 - UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token
2026-10-10T21:21:33.4877563Z   ---
2026-10-10T21:21:33.4878101Z   duration_ms: 156.58449
2026-10-10T21:21:33.4878666Z   type: 'test'
2026-10-10T21:21:33.4879158Z   ...
2026-10-10T21:21:33.6900331Z # Subtest: UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked
2026-10-10T21:21:33.6902930Z ok 174 - UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked
2026-10-10T21:21:33.6923525Z   ---
2026-10-10T21:21:33.6924125Z   duration_ms: 202.802249
2026-10-10T21:21:33.6924720Z   type: 'test'
2026-10-10T21:21:33.6925094Z   ...
2026-10-10T21:21:33.9012625Z # Subtest: UC-042 step 2 on a phone: the token form carries the notice and its own I have read this beside the paste field; ticked there, the field and Store token open, and the notice at the top is ticked with it
2026-10-10T21:21:33.9014192Z ok 175 - UC-042 step 2 on a phone: the token form carries the notice and its own I have read this beside the paste field; ticked there, the field and Store token open, and the notice at the top is ticked with it
2026-10-10T21:21:33.9014928Z   ---
2026-10-10T21:21:33.9015131Z   duration_ms: 211.367239
2026-10-10T21:21:33.9015371Z   type: 'test'
2026-10-10T21:21:33.9015561Z   ...
2026-10-10T21:21:34.0588527Z # Subtest: A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Store a token: the notice's box I have read this, while it is not ticked
2026-10-10T21:21:34.0590570Z ok 176 - A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Store a token: the notice's box I have read this, while it is not ticked
2026-10-10T21:21:34.0591505Z   ---
2026-10-10T21:21:34.0592029Z   duration_ms: 157.522611
2026-10-10T21:21:34.0592440Z   type: 'test'
2026-10-10T21:21:34.0592774Z   ...
2026-10-10T21:21:34.2077114Z # Subtest: A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of the token: the paste field, once the notice is ticked
2026-10-10T21:21:34.2078348Z ok 177 - A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of the token: the paste field, once the notice is ticked
2026-10-10T21:21:34.2079263Z   ---
2026-10-10T21:21:34.2079579Z   duration_ms: 148.923138
2026-10-10T21:21:34.2079909Z   type: 'test'
2026-10-10T21:21:34.2080182Z   ...
2026-10-10T21:21:34.3586456Z # Subtest: A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of a GitLab project token: the field for the new token
2026-10-10T21:21:34.3587719Z ok 178 - A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of a GitLab project token: the field for the new token
2026-10-10T21:21:34.3588183Z   ---
2026-10-10T21:21:34.3588400Z   duration_ms: 150.647339
2026-10-10T21:21:34.3588629Z   type: 'test'
2026-10-10T21:21:34.3588826Z   ...
2026-10-10T21:21:34.6530285Z # Subtest: UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not
2026-10-10T21:21:34.6534982Z ok 179 - UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not
2026-10-10T21:21:34.6536267Z   ---
2026-10-10T21:21:34.6536750Z   duration_ms: 294.673894
2026-10-10T21:21:34.6537276Z   type: 'test'
2026-10-10T21:21:34.6537736Z   ...
2026-10-10T21:21:34.8461653Z # Subtest: UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line
2026-10-10T21:21:34.8462750Z ok 180 - UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line
2026-10-10T21:21:34.8463194Z   ---
2026-10-10T21:21:34.8463395Z   duration_ms: 193.050409
2026-10-10T21:21:34.8463639Z   type: 'test'
2026-10-10T21:21:34.8463829Z   ...
2026-10-10T21:21:35.0959384Z # Subtest: UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes
2026-10-10T21:21:35.0963441Z ok 181 - UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes
2026-10-10T21:21:35.0965521Z   ---
2026-10-10T21:21:35.0966044Z   duration_ms: 249.196347
2026-10-10T21:21:35.0966669Z   type: 'test'
2026-10-10T21:21:35.0967176Z   ...
2026-10-10T21:21:35.3803947Z # Subtest: UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation
2026-10-10T21:21:35.3805851Z ok 182 - UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation
2026-10-10T21:21:35.3806804Z   ---
2026-10-10T21:21:35.3807146Z   duration_ms: 284.668387
2026-10-10T21:21:35.3807542Z   type: 'test'
2026-10-10T21:21:35.3807868Z   ...
2026-10-10T21:21:35.7774111Z # Subtest: UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser
2026-10-10T21:21:35.7778805Z ok 183 - UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser
2026-10-10T21:21:35.7780092Z   ---
2026-10-10T21:21:35.7780666Z   duration_ms: 396.987957
2026-10-10T21:21:35.7781516Z   type: 'test'
2026-10-10T21:21:35.7782075Z   ...
2026-10-10T21:21:35.9429723Z # Subtest: UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001
2026-10-10T21:21:35.9431633Z ok 184 - UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001
2026-10-10T21:21:35.9441498Z   ---
2026-10-10T21:21:35.9442278Z   duration_ms: 164.671269
2026-10-10T21:21:35.9443227Z   type: 'test'
2026-10-10T21:21:35.9443655Z   ...
2026-10-10T21:21:36.1505545Z # Subtest: UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md
2026-10-10T21:21:36.1510351Z ok 185 - UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md
2026-10-10T21:21:36.1511810Z   ---
2026-10-10T21:21:36.1512796Z   duration_ms: 208.308335
2026-10-10T21:21:36.1513281Z   type: 'test'
2026-10-10T21:21:36.1513632Z   ...
2026-10-10T21:21:36.3579681Z # Subtest: UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why
2026-10-10T21:21:36.3581313Z ok 186 - UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why
2026-10-10T21:21:36.3582639Z   ---
2026-10-10T21:21:36.3583237Z   duration_ms: 207.514831
2026-10-10T21:21:36.3583792Z   type: 'test'
2026-10-10T21:21:36.3584249Z   ...
2026-10-10T21:21:36.5401144Z # Subtest: UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says already written data needs a history rewrite to be removed
2026-10-10T21:21:36.5403261Z ok 187 - UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says already written data needs a history rewrite to be removed
2026-10-10T21:21:36.5404491Z   ---
2026-10-10T21:21:36.5406700Z   duration_ms: 182.092845
2026-10-10T21:21:36.5432955Z   type: 'test'
2026-10-10T21:21:36.5445198Z   ...
2026-10-10T21:21:36.7149727Z # Subtest: UC-042 step 5: + Collaborator creates the canonical new document with affirmative consent, name, account and one list row
2026-10-10T21:21:36.7152018Z ok 188 - UC-042 step 5: + Collaborator creates the canonical new document with affirmative consent, name, account and one list row
2026-10-10T21:21:36.7182730Z   ---
2026-10-10T21:21:36.7183009Z   duration_ms: 174.544712
2026-10-10T21:21:36.7183292Z   type: 'test'
2026-10-10T21:21:36.7183508Z   ...
2026-10-10T21:21:36.9326334Z # Subtest: UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing
2026-10-10T21:21:36.9337508Z ok 189 - UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing
2026-10-10T21:21:36.9338386Z   ---
2026-10-10T21:21:36.9338596Z   duration_ms: 217.648652
2026-10-10T21:21:36.9338830Z   type: 'test'
2026-10-10T21:21:36.9339020Z   ...
2026-10-10T21:21:37.1109373Z # Subtest: UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name
2026-10-10T21:21:37.1111061Z ok 190 - UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name
2026-10-10T21:21:37.1112024Z   ---
2026-10-10T21:21:37.1112629Z   duration_ms: 178.021261
2026-10-10T21:21:37.1113033Z   type: 'test'
2026-10-10T21:21:37.1113321Z   ...
2026-10-10T21:21:37.2582413Z # Subtest: UC-042 step 6: Clear everything removes every Agent M localStorage entry after a confirmation
2026-10-10T21:21:37.2583842Z ok 191 - UC-042 step 6: Clear everything removes every Agent M localStorage entry after a confirmation
2026-10-10T21:21:37.2584523Z   ---
2026-10-10T21:21:37.2584991Z   duration_ms: 147.748719
2026-10-10T21:21:37.2585388Z   type: 'test'
2026-10-10T21:21:37.2585645Z   ...
2026-10-10T21:21:37.2825620Z # Subtest: UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test
2026-10-10T21:21:37.2827529Z ok 192 - UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test
2026-10-10T21:21:37.2828548Z   ---
2026-10-10T21:21:37.2829089Z   duration_ms: 378.86706
2026-10-10T21:21:37.2829653Z   type: 'test'
2026-10-10T21:21:37.2830138Z   ...
2026-10-10T21:21:37.2831532Z # Subtest: UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top
2026-10-10T21:21:37.2833514Z ok 193 - UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top
2026-10-10T21:21:37.2834560Z   ---
2026-10-10T21:21:37.2835031Z   duration_ms: 262.375767
2026-10-10T21:21:37.2835604Z   type: 'test'
2026-10-10T21:21:37.2836032Z   ...
2026-10-10T21:21:37.2837217Z # Subtest: UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load
2026-10-10T21:21:37.2839158Z ok 194 - UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load
2026-10-10T21:21:37.2840108Z   ---
2026-10-10T21:21:37.2840547Z   duration_ms: 234.471576
2026-10-10T21:21:37.2841038Z   type: 'test'
2026-10-10T21:21:37.2841837Z   ...
2026-10-10T21:21:37.2843436Z # Subtest: UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it
2026-10-10T21:21:37.2845337Z ok 195 - UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it
2026-10-10T21:21:37.2846377Z   ---
2026-10-10T21:21:37.2846887Z   duration_ms: 220.787194
2026-10-10T21:21:37.2847400Z   type: 'test'
2026-10-10T21:21:37.2847859Z   ...
2026-10-10T21:21:37.2849154Z # Subtest: UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage
2026-10-10T21:21:37.2868220Z ok 196 - UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage
2026-10-10T21:21:37.2869339Z   ---
2026-10-10T21:21:37.2869833Z   duration_ms: 223.372928
2026-10-10T21:21:37.2870345Z   type: 'test'
2026-10-10T21:21:37.2870805Z   ...
2026-10-10T21:21:37.2871852Z # Subtest: UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result
2026-10-10T21:21:37.2873515Z ok 197 - UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result
2026-10-10T21:21:37.2874382Z   ---
2026-10-10T21:21:37.2874869Z   duration_ms: 114.713196
2026-10-10T21:21:37.2875404Z   type: 'test'
2026-10-10T21:21:37.2875903Z   ...
2026-10-10T21:21:37.2877212Z # Subtest: EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page
2026-10-10T21:21:37.2879557Z ok 198 - EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page
2026-10-10T21:21:37.2880713Z   ---
2026-10-10T21:21:37.2881187Z   duration_ms: 235.288565
2026-10-10T21:21:37.2881717Z   type: 'test'
2026-10-10T21:21:37.2882356Z   ...
2026-10-10T21:21:37.2883589Z # Subtest: UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:21:37.2885239Z ok 199 - UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:21:37.2886166Z   ---
2026-10-10T21:21:37.2886627Z   duration_ms: 356.306415
2026-10-10T21:21:37.2887144Z   type: 'test'
2026-10-10T21:21:37.2887604Z   ...
2026-10-10T21:21:37.2888519Z # Subtest: UC-042 step 2: a GitLab project token changed or cleared takes its last test with it
2026-10-10T21:21:37.2889866Z ok 200 - UC-042 step 2: a GitLab project token changed or cleared takes its last test with it
2026-10-10T21:21:37.2890730Z   ---
2026-10-10T21:21:37.2891183Z   duration_ms: 445.211071
2026-10-10T21:21:37.2891696Z   type: 'test'
2026-10-10T21:21:37.2892213Z   ...
2026-10-10T21:21:37.2893428Z # Subtest: UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload
2026-10-10T21:21:37.2895145Z ok 201 - UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload
2026-10-10T21:21:37.2896106Z   ---
2026-10-10T21:21:37.2896563Z   duration_ms: 228.759783
2026-10-10T21:21:37.2897086Z   type: 'test'
2026-10-10T21:21:37.2897570Z   ...
2026-10-10T21:21:37.2898753Z # Subtest: with every view file of today, the menu shows the stages of the process in their order, each linked to its page
2026-10-10T21:21:37.2900440Z ok 202 - with every view file of today, the menu shows the stages of the process in their order, each linked to its page
2026-10-10T21:21:37.2901449Z   ---
2026-10-10T21:21:37.2901984Z   duration_ms: 97.190236
2026-10-10T21:21:37.2902509Z   type: 'test'
2026-10-10T21:21:37.2902967Z   ...
2026-10-10T21:21:37.2904478Z # Subtest: every dashboard view file of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, setup, review pages
2026-10-10T21:21:37.2906899Z ok 203 - every dashboard view file of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, setup, review pages
2026-10-10T21:21:37.2908274Z   ---
2026-10-10T21:21:37.2908775Z   duration_ms: 538.45286
2026-10-10T21:21:37.2909582Z   type: 'test'
2026-10-10T21:21:37.2910191Z   ...
2026-10-10T21:21:37.2911123Z # Subtest: a view or settings section whose file is not there yet is not shown, and its address shows the use cases
2026-10-10T21:21:37.2912918Z ok 204 - a view or settings section whose file is not there yet is not shown, and its address shows the use cases
2026-10-10T21:21:37.2913806Z   ---
2026-10-10T21:21:37.2914157Z   duration_ms: 155.391516
2026-10-10T21:21:37.2914556Z   type: 'test'
2026-10-10T21:21:37.2914857Z   ...
2026-10-10T21:21:37.2916108Z # Subtest: a load of every address of today asks for no view or settings file that is not built — no 404 per planned view
2026-10-10T21:21:37.2917859Z ok 205 - a load of every address of today asks for no view or settings file that is not built — no 404 per planned view
2026-10-10T21:21:37.2918760Z   ---
2026-10-10T21:21:37.2919104Z   duration_ms: 6040.648686
2026-10-10T21:21:37.2919502Z   type: 'test'
2026-10-10T21:21:37.2919846Z   ...
2026-10-10T21:21:37.2920707Z # Subtest: the list of built files beside the views names exactly the files of the table that are there
2026-10-10T21:21:37.2922164Z ok 206 - the list of built files beside the views names exactly the files of the table that are there
2026-10-10T21:21:37.2922941Z   ---
2026-10-10T21:21:37.2923253Z   duration_ms: 0.650318
2026-10-10T21:21:37.2923639Z   type: 'test'
2026-10-10T21:21:37.2923957Z   ...
2026-10-10T21:21:37.2924910Z # Subtest: a request handler a test brings answers before the harness's own GitHub
2026-10-10T21:21:37.2925889Z ok 207 - a request handler a test brings answers before the harness's own GitHub
2026-10-10T21:21:37.2926536Z   ---
2026-10-10T21:21:37.2926879Z   duration_ms: 161.799666
2026-10-10T21:21:37.2927263Z   type: 'test'
2026-10-10T21:21:37.2927586Z   ...
2026-10-10T21:21:37.2928586Z # Subtest: a view may link a stylesheet of its own beside style.css — once, when it is first shown
2026-10-10T21:21:37.2929968Z ok 208 - a view may link a stylesheet of its own beside style.css — once, when it is first shown
2026-10-10T21:21:37.2930677Z   ---
2026-10-10T21:21:37.2931011Z   duration_ms: 300.763158
2026-10-10T21:21:37.2931403Z   type: 'test'
2026-10-10T21:21:37.2931725Z   ...
2026-10-10T21:21:37.2939301Z # Subtest: UC-006 3b: an entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before Accept
2026-10-10T21:21:37.2941208Z ok 209 - UC-006 3b: an entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before Accept
2026-10-10T21:21:37.2942465Z   ---
2026-10-10T21:21:37.2942822Z   duration_ms: 255.832075
2026-10-10T21:21:37.2943214Z   type: 'test'
2026-10-10T21:21:37.2943537Z   ...
2026-10-10T21:21:37.2944583Z # Subtest: UC-006 3b counter-proof: an entry that only adds a requirement shows no impact list and reads no use case, architecture file or test
2026-10-10T21:21:37.2946388Z ok 210 - UC-006 3b counter-proof: an entry that only adds a requirement shows no impact list and reads no use case, architecture file or test
2026-10-10T21:21:37.2947405Z   ---
2026-10-10T21:21:37.2947724Z   duration_ms: 64.541644
2026-10-10T21:21:37.2948063Z   type: 'test'
2026-10-10T21:21:37.2948360Z   ...
2026-10-10T21:21:37.2949012Z # Subtest: UC-006 3b: a withdrawn requirement's entry lists what still names it
2026-10-10T21:21:37.2949951Z ok 211 - UC-006 3b: a withdrawn requirement's entry lists what still names it
2026-10-10T21:21:37.2950547Z   ---
2026-10-10T21:21:37.2950831Z   duration_ms: 67.557204
2026-10-10T21:21:37.2951156Z   type: 'test'
2026-10-10T21:21:37.2951461Z   ...
2026-10-10T21:21:37.2952493Z # Subtest: UC-006 3b: an entry whose impact list cannot be derived is not offered for acceptance, and says why
2026-10-10T21:21:37.2953799Z ok 212 - UC-006 3b: an entry whose impact list cannot be derived is not offered for acceptance, and says why
2026-10-10T21:21:37.2954501Z   ---
2026-10-10T21:21:37.2954798Z   duration_ms: 67.044435
2026-10-10T21:21:37.2955411Z   type: 'test'
2026-10-10T21:21:37.2955731Z   ...
2026-10-10T21:21:37.2956847Z # Subtest: UC-006 3b: an entry that renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept
2026-10-10T21:21:37.2958576Z ok 213 - UC-006 3b: an entry that renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept
2026-10-10T21:21:37.2959523Z   ---
2026-10-10T21:21:37.2959833Z   duration_ms: 119.497206
2026-10-10T21:21:37.2960220Z   type: 'test'
2026-10-10T21:21:37.2960544Z   ...
2026-10-10T21:21:37.2961510Z # Subtest: UC-006 3b: an entry whose heading another entry of its queue creates lists what names a requirement it leaves out
2026-10-10T21:21:37.2963277Z ok 214 - UC-006 3b: an entry whose heading another entry of its queue creates lists what names a requirement it leaves out
2026-10-10T21:21:37.2964129Z   ---
2026-10-10T21:21:37.2964433Z   duration_ms: 66.170337
2026-10-10T21:21:37.2964812Z   type: 'test'
2026-10-10T21:21:37.2965149Z   ...
2026-10-10T21:21:37.2965996Z # Subtest: UC-006 3b: the requests one load of an entry makes, with an empty and with a kept file cache
2026-10-10T21:21:37.2967382Z ok 215 - UC-006 3b: the requests one load of an entry makes, with an empty and with a kept file cache
2026-10-10T21:21:37.2968093Z   ---
2026-10-10T21:21:37.2968399Z   duration_ms: 238.522947
2026-10-10T21:21:37.2968790Z   type: 'test'
2026-10-10T21:21:37.2969316Z   ...
2026-10-10T21:21:37.2972486Z # SPEC entry 02: cold 8 requests (6 files, 0 of them use cases, architecture or tests); warm 8 (commit, tree, file docs/spec-freigaben/2026-10-01_rules/index.md, file docs/spec-freigaben/2026-10-01_rules/entscheidungen.md, file docs/spec-freigaben/2026-10-01_rules/01-one.md, file SPEC.md, file docs/spec-freigaben/2026-10-01_rules/02-new.md, file docs/spec-freigaben/2026-10-01_rules/03-two.md)
2026-10-10T21:21:37.2987895Z # SPEC entry 01: cold 16 requests (14 files, 7 of them use cases, architecture or tests); warm 16 (commit, tree, file docs/spec-freigaben/2026-10-01_rules/index.md, file docs/spec-freigaben/2026-10-01_rules/entscheidungen.md, file docs/spec-freigaben/2026-10-01_rules/01-one.md, file SPEC.md, file docs/spec-freigaben/2026-10-01_rules/02-new.md, file docs/spec-freigaben/2026-10-01_rules/03-two.md, file docs/spec-freigaben/2026-10-01_rules/01-one.begruendung.md, file docs/architecture/ARC-001-static.md, file docs/architecture/MOD-reader.md, file docs/use-cases/UC-001-one.md, file docs/use-cases/UC-002-two.md, file docs/use-cases/UC-003-three.md, file tests/one.test.mjs, file tests/three.test.mjs)
2026-10-10T21:21:37.2992525Z # Subtest: the fixture resolves its actual current head but refuses an unknown SHA
2026-10-10T21:21:37.2993526Z ok 216 - the fixture resolves its actual current head but refuses an unknown SHA
2026-10-10T21:21:37.2994196Z   ---
2026-10-10T21:21:37.2994529Z   duration_ms: 34.594736
2026-10-10T21:21:37.2994897Z   type: 'test'
2026-10-10T21:21:37.2995226Z   ...
2026-10-10T21:21:37.2995870Z # Subtest: \#spec composes the pinned requirements view with the open SPEC changes
2026-10-10T21:21:37.2996798Z ok 217 - \#spec composes the pinned requirements view with the open SPEC changes
2026-10-10T21:21:37.2997374Z   ---
2026-10-10T21:21:37.2997664Z   duration_ms: 195.720844
2026-10-10T21:21:37.2998040Z   type: 'test'
2026-10-10T21:21:37.2998354Z   ...
2026-10-10T21:21:37.2999317Z # Subtest: TST-268001: production compose registers endpoint-test with pairing, origin, loopback, and secret boundaries intact
2026-10-10T21:21:37.3000970Z ok 218 - TST-268001: production compose registers endpoint-test with pairing, origin, loopback, and secret boundaries intact
2026-10-10T21:21:37.3001853Z   ---
2026-10-10T21:21:37.3002387Z   duration_ms: 56.006963
2026-10-10T21:21:37.3002778Z   type: 'test'
2026-10-10T21:21:37.3003342Z   ...
2026-10-10T21:21:38.0743970Z # native-fixture {"stage":"Electron package acquisition","status":0,"signal":null,"error":null,"stdout":"\\nadded 13 packages in 1s\\n\\n1 package is looking for funding\\n  run `npm fund` for details\\n","stderr":""}
2026-10-10T21:21:38.0747018Z # native-fixture {"stage":"Electron binary acquisition","status":0,"signal":null,"error":null,"stdout":"","stderr":""}
2026-10-10T21:21:38.0757006Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:38.0773541Z # native-fixture {"stage":"Linux Openbox initial probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:38.0850868Z # native-fixture {"stage":"Linux Openbox diagnostic plan","status":0,"signal":null,"error":null,"elapsedMs":3103,"stdout":"Reading package lists...\\nBuilding dependency tree...\\nReading state information...\\nThe following additional packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 poppler-data xfonts-encodings\\n  xfonts-utils\\nSuggested packages:\\n  fonts-freefont-otf | fonts-freefont-ttf fonts-texgyre librsvg2-bin tint2\\n  openbox-gnome-session openbox-kde-session poppler-utils ghostscript\\n  fonts-japanese-mincho | fonts-ipafont-mincho fonts-japanese-gothic\\n  | fonts-ipafont-gothic fonts-arphic-ukai fonts-arphic-uming fonts-nanum\\nRecommended packages:\\n  fonts-droid-fallback libpaper-utils librsvg2-common obconf | obconf-qt scrot\\nThe following NEW packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 openbox poppler-data xfonts-encodings\\n  xfonts-utils\\n0 upgraded, 24 newly installed, 0 to remove and 6 not upgraded.\\nNeed to get 22.9 MB of archives.\\nAfter this operation, 75.6 MB of additional disk space will be used.\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/p/poppler-data/poppler-data_0.4.12-1_all.deb' poppler-data_0.4.12-1_all.deb 2059856 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb' xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb 578092 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb' xfonts-utils_1%3a7.7+6build3_amd64.deb 94438 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/f/fonts-urw-base35/fonts-urw-base35_20200910-8_all.deb' fonts-urw-base35_20200910-8_all.deb 10968180 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/giflib/libgif7_5.2.2-1ubuntu1.2_amd64.deb' libgif7_5.2.2-1ubuntu1.2_amd64.deb 35608 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/ghostscript/libgs-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb' libgs-common_10.02.1~dfsg1-0ubuntu7.9_all.deb 176148 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/ghostscript/libgs10-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb' libgs10-common_10.02.1~dfsg1-0ubuntu7.9_all.deb 487964 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libi/libidn/libidn12_1.42-1ubuntu0.1_amd64.deb' libidn12_1.42-1ubuntu0.1_amd64.deb 56086 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/i/ijs/libijs-0.35_0.35-15.1build1_amd64.deb' libijs-0.35_0.35-15.1build1_amd64.deb 15318 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/j/jbig2dec/libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb' libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb 65214 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libp/libpaper/libpaper1_1.1.29build1_amd64.deb' libpaper1_1.1.29build1_amd64.deb 13414 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/ghostscript/libgs10_10.02.1%7edfsg1-0ubuntu7.9_amd64.deb' libgs10_10.02.1~dfsg1-0ubuntu7.9_amd64.deb 3897792 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/h/highway/libhwy1t64_1.0.7-8.1build1_amd64.deb' libhwy1t64_1.0.7-8.1build1_amd64.deb 584050 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/libi/libid3tag/libid3tag0_0.15.1b-14build1_amd64.deb' libid3tag0_0.15.1b-14build1_amd64.deb 33598 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/j/jpeg-xl/libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb' libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb 1001370 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libr/librsvg/librsvg2-2_2.58.0%2bdfsg-1build1_amd64.deb' librsvg2-2_2.58.0+dfsg-1build1_amd64.deb 2135414 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libs/libspectre/libspectre1_0.2.12-1build2_amd64.deb' libspectre1_0.2.12-1build2_amd64.deb 30900 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/i/imlib2/libimlib2t64_1.12.1-1.1build2_amd64.deb' libimlib2t64_1.12.1-1.1build2_amd64.deb 207528 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/o/openbox/libobt2v5_3.6.1-12build5_amd64.deb' libobt2v5_3.6.1-12build5_amd64.deb 33324 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/p/pango1.0/libpangoxft-1.0-0_1.52.1%2bds-1build1_amd64.deb' libpangoxft-1.0-0_1.52.1+ds-1build1_amd64.deb 20272 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/o/openbox/libobrender32v5_3.6.1-12build5_amd64.deb' libobrender32v5_3.6.1-12build5_amd64.deb 42454 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/x/xcb-util/libxcb-util1_0.4.0-1build3_amd64.deb' libxcb-util1_0.4.0-1build3_amd64.deb 10678 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/s/startup-notification/libstartup-notification0_0.12-6build3_amd64.deb' libstartup-notification0_0.12-6build3_amd64.deb 18444 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/o/openbox/openbox_3.6.1-12build5_amd64.deb' openbox_3.6.1-12build5_amd64.deb 304440 MD5Sum:[redacted]\\n","stderr":"","packages":[{"transport":"mirror+file","filename":"poppler-data_0.4.12-1_all.deb","bytes":2059856,"md5":"c3aad80a7d501871f9e24fa9c6540998","digest":"c3aad80a7d501871f9e24fa9c6540998"},{"transport":"mirror+file","filename":"xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb","bytes":578092,"md5":"b7e27ff04dca332645f9acfcc8492237","digest":"b7e27ff04dca332645f9acfcc8492237"},{"transport":"mirror+file","filename":"xfonts-utils_1%3a7.7+6build3_amd64.deb","bytes":94438,"md5":"13b0675cc33bcd650f3e169c049cf670","digest":"13b0675cc33bcd650f3e169c049cf670"},{"transport":"mirror+file","filename":"fonts-urw-base35_20200910-8_all.deb","bytes":10968180,"md5":"c5e4cff568d83e11974a5462ffcaf851","digest":"c5e4cff568d83e11974a5462ffcaf851"},{"transport":"mirror+file","filename":"libgif7_5.2.2-1ubuntu1.2_amd64.deb","bytes":35608,"md5":"9bda8aae90439df1e038d133c9d9d469","digest":"9bda8aae90439df1e038d133c9d9d469"},{"transport":"mirror+file","filename":"libgs-common_10.02.1~dfsg1-0ubuntu7.9_all.deb","bytes":176148,"md5":"6852c1014d594050a33e25e1a6b274b3","digest":"6852c1014d594050a33e25e1a6b274b3"},{"transport":"mirror+file","filename":"libgs10-common_10.02.1~dfsg1-0ubuntu7.9_all.deb","bytes":487964,"md5":"4597efb9adaac038d0cd01c68520027a","digest":"4597efb9adaac038d0cd01c68520027a"},{"transport":"mirror+file","filename":"libidn12_1.42-1ubuntu0.1_amd64.deb","bytes":56086,"md5":"eb19310b82249d936f21e8dba37f68ae","digest":"eb19310b82249d936f21e8dba37f68ae"},{"transport":"mirror+file","filename":"libijs-0.35_0.35-15.1build1_amd64.deb","bytes":15318,"md5":"e6189d1148591eb2897e1500dde1ef2c","digest":"e6189d1148591eb2897e1500dde1ef2c"},{"transport":"mirror+file","filename":"libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb","bytes":65214,"md5":"39e2077f32a5b1e4d68087292dfd21d2","digest":"39e2077f32a5b1e4d68087292dfd21d2"},{"transport":"mirror+file","filename":"libpaper1_1.1.29build1_amd64.deb","bytes":13414,"md5":"c2f5a7ccf8a5ad5b96ac24d4657029c6","digest":"c2f5a7ccf8a5ad5b96ac24d4657029c6"},{"transport":"mirror+file","filename":"libgs10_10.02.1~dfsg1-0ubuntu7.9_amd64.deb","bytes":3897792,"md5":"b88e49f7caca690d85ab66f357304eda","digest":"b88e49f7caca690d85ab66f357304eda"},{"transport":"mirror+file","filename":"libhwy1t64_1.0.7-8.1build1_amd64.deb","bytes":584050,"md5":"96f46ff55f48790604d8bddefbe3d3e7","digest":"96f46ff55f48790604d8bddefbe3d3e7"},{"transport":"mirror+file","filename":"libid3tag0_0.15.1b-14build1_amd64.deb","bytes":33598,"md5":"1d246f1b0b12d5ab631843217bcace97","digest":"1d246f1b0b12d5ab631843217bcace97"},{"transport":"mirror+file","filename":"libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb","bytes":1001370,"md5":"fc7f390b8fd86a738789851017e84c6d","digest":"fc7f390b8fd86a738789851017e84c6d"},{"transport":"mirror+file","filename":"librsvg2-2_2.58.0+dfsg-1build1_amd64.deb","bytes":2135414,"md5":"b5016935a267e59d61a78a6deb53d8a6","digest":"b5016935a267e59d61a78a6deb53d8a6"},{"transport":"mirror+file","filename":"libspectre1_0.2.12-1build2_amd64.deb","bytes":30900,"md5":"de8ab642c44ac9c41b979f4ed73fae6a","digest":"de8ab642c44ac9c41b979f4ed73fae6a"},{"transport":"mirror+file","filename":"libimlib2t64_1.12.1-1.1build2_amd64.deb","bytes":207528,"md5":"4c392073aad241727c51dc82a84a20ba","digest":"4c392073aad241727c51dc82a84a20ba"},{"transport":"mirror+file","filename":"libobt2v5_3.6.1-12build5_amd64.deb","bytes":33324,"md5":"041e109bae276e3f4b031608dad52256","digest":"041e109bae276e3f4b031608dad52256"},{"transport":"mirror+file","filename":"libpangoxft-1.0-0_1.52.1+ds-1build1_amd64.deb","bytes":20272,"md5":"35053c3a8f97c33497e2e68e218140a6","digest":"35053c3a8f97c33497e2e68e218140a6"},{"transport":"mirror+file","filename":"libobrender32v5_3.6.1-12build5_amd64.deb","bytes":42454,"md5":"e8edef2dcae7d3cf5c10da4dd2184c6b","digest":"e8edef2dcae7d3cf5c10da4dd2184c6b"},{"transport":"mirror+file","filename":"libxcb-util1_0.4.0-1build3_amd64.deb","bytes":10678,"md5":"ceec9bf67b5c5f81fec8d8ae9e09ea61","digest":"ceec9bf67b5c5f81fec8d8ae9e09ea61"},{"transport":"mirror+file","filename":"libstartup-notification0_0.12-6build3_amd64.deb","bytes":18444,"md5":"7cc3b69df45e4c2ea7684e6793b01698","digest":"7cc3b69df45e4c2ea7684e6793b01698"},{"transport":"mirror+file","filename":"openbox_3.6.1-12build5_amd64.deb","bytes":304440,"md5":"7098defb6a06b6c4361700f86edd6448","digest":"7098defb6a06b6c4361700f86edd6448"}],"mirrors":["http://azure.archive.ubuntu.com/ubuntu/","https://archive.ubuntu.com/ubuntu/"],"observation":"font-uri-not-direct-http"}
2026-10-10T21:21:46.8739122Z # native-fixture {"stage":"Linux Openbox install","status":0,"signal":null,"error":null,"stdout":"Reading package lists...\\nBuilding dependency tree...\\nReading state information...\\nThe following additional packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 poppler-data xfonts-encodings\\n  xfonts-utils\\nSuggested packages:\\n  fonts-freefont-otf | fonts-freefont-ttf fonts-texgyre librsvg2-bin tint2\\n  openbox-gnome-session openbox-kde-session poppler-utils ghostscript\\n  fonts-japanese-mincho | fonts-ipafont-mincho fonts-japanese-gothic\\n  | fonts-ipafont-gothic fonts-arphic-ukai fonts-arphic-uming fonts-nanum\\nRecommended packages:\\n  fonts-droid-fallback libpaper-utils librsvg2-common obconf | obconf-qt scrot\\nThe following NEW packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 openbox poppler-data xfonts-encodings\\n  xfonts-utils\\n0 upgraded, 24 newly installed, 0 to remove and 6 not upgraded.\\nNeed to get 22.9 MB of archives.\\nAfter this operation, 75.6 MB of additional disk space will be used.\\nGet:1 file:/etc/apt/apt-mirrors.txt Mirrorlist [144 B]\\nGet:2 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 poppler-data all 0.4.12-1 [2060 kB]\\nGet:3 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 xfonts-encodings all 1:1.0.5-0ubuntu2 [578 kB]\\nGet:4 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 xfonts-utils amd64 1:7.7+6build3 [94.4 kB]\\nGet:5 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 fonts-urw-base35 all 20200910-8 [11.0 MB]\\nGet:6 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgif7 amd64 5.2.2-1ubuntu1.2 [35.6 kB]\\nGet:7 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgs-common all 10.02.1~dfsg1-0ubuntu7.9 [176 kB]\\nGet:8 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgs10-common all 10.02.1~dfsg1-0ubuntu7.9 [488 kB]\\nGet:9 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libidn12 amd64 1.42-1ubuntu0.1 [56.1 kB]\\nGet:10 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libijs-0.35 amd64 0.35-15.1build1 [15.3 kB]\\nGet:11 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libjbig2dec0 amd64 0.20-1ubuntu0.24.04.1 [65.2 kB]\\nGet:12 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libpaper1 amd64 1.1.29build1 [13.4 kB]\\nGet:13 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgs10 amd64 10.02.1~dfsg1-0ubuntu7.9 [3898 kB]\\nGet:14 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libhwy1t64 amd64 1.0.7-8.1build1 [584 kB]\\nGet:15 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libid3tag0 amd64 0.15.1b-14build1 [33.6 kB]\\nGet:16 http://azure.archive.ubuntu.com/ubuntu noble-updates/universe amd64 libjxl0.7 amd64 0.7.0-10.2ubuntu6.1 [1001 kB]\\nGet:17 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 librsvg2-2 amd64 2.58.0+dfsg-1build1 [2135 kB]\\nGet:18 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libspectre1 amd64 0.2.12-1build2 [30.9 kB]\\nGet:19 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libimlib2t64 amd64 1.12.1-1.1build2 [208 kB]\\nGet:20 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libobt2v5 amd64 3.6.1-12build5 [33.3 kB]\\nGet:21 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libpangoxft-1.0-0 amd64 1.52.1+ds-1build1 [20.3 kB]\\nGet:22 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libobrender32v5 amd64 3.6.1-12build5 [42.5 kB]\\nGet:23 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libxcb-util1 amd64 0.4.0-1build3 [10.7 kB]\\nGet:24 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libstartup-notification0 amd64 0.12-6build3 [18.4 kB]\\nGet:25 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 openbox amd64 3.6.1-12build5 [304 kB]\\nPreconfiguring packages ...\\nFetched 22.9 MB in 2s (11.2 MB/s)\\nSelecting previously unselected package poppler-data.\\r\\n(Reading database ... \\r(Reading database ... 5%\\r(Reading database ... 10%\\r(Reading database ... 15%\\r(Reading database ... 20%\\r(Reading database ... 25%\\r(Reading database ... 30%\\r(Reading database ... 35%\\r(Reading database ... 40%\\r(Reading database ... 45%\\r(Reading database ... 50%\\r(Reading database ... 55%\\r(Reading database ... 60%\\r(Reading database ... 65%\\r(Reading database ... 70%\\r(Reading database ... 75%\\r(Reading database ... 80%\\r(Reading database ... 85%\\r(Reading database ... 90%\\r(Reading database ... 95%\\r(Reading database ... 100%\\r(Reading database ... 203191 files and directories currently installed.)\\r\\nPreparing to unpack .../00-poppler-data_0.4.12-1_all.deb ...\\r\\nUnpacking poppler-data (0.4.12-1) ...\\r\\nSelecting previously unselected package xfonts-encodings.\\r\\nPreparing to unpack .../01-xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb ...\\r\\nUnpacking xfonts-encodings (1:1.0.5-0ubuntu2) ...\\r\\nSelecting previously unselected package xfonts-utils.\\r\\nPreparing to unpack .../02-xfonts-utils_1%3a7.7+6build3_amd64.deb ...\\r\\nUnpacking xfonts-utils (1:7.7+6build3) ...\\r\\nSelecting previously unselected package fonts-urw-base35.\\r\\nPreparing to unpack .../[redacted].deb ...\\r\\nUnpacking fonts-urw-base35 (20200910-8) ...\\r\\nSelecting previously unselected package libgif7:amd64.\\r\\nPreparing to unpack .../04-libgif7_5.2.2-1ubuntu1.2_amd64.deb ...\\r\\nUnpacking libgif7:amd64 (5.2.2-1ubuntu1.2) ...\\r\\nSelecting previously unselected package libgs-common.\\r\\nPreparing to unpack .../05-libgs-common_10.02.1~dfsg1-0ubuntu7.9_all.deb ...\\r\\nUnpacking libgs-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSelecting previously unselected package libgs10-common.\\r\\nPreparing to unpack .../06-libgs10-common_10.02.1~dfsg1-0ubuntu7.9_all.deb ...\\r\\nUnpacking libgs10-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSelecting previously unselected package libidn12:amd64.\\r\\nPreparing to unpack .../07-libidn12_1.42-1ubuntu0.1_amd64.deb ...\\r\\nUnpacking libidn12:amd64 (1.42-1ubuntu0.1) ...\\r\\nSelecting previously unselected package libijs-0.35:amd64.\\r\\nPreparing to unpack .../08-libijs-0.35_0.35-15.1build1_amd64.deb ...\\r\\nUnpacking libijs-0.35:amd64 (0.35-15.1build1) ...\\r\\nSelecting previously unselected package libjbig2dec0:amd64.\\r\\nPreparing to unpack .../09-libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb ...\\r\\nUnpacking libjbig2dec0:amd64 (0.20-1ubuntu0.24.04.1) ...\\r\\nSelecting previously unselected package libpaper1:amd64.\\r\\nPreparing to unpack .../10-libpaper1_1.1.29build1_amd64.deb ...\\r\\nUnpacking libpaper1:amd64 (1.1.29build1) ...\\r\\nSelecting previously unselected package libgs10:amd64.\\r\\nPreparing to unpack .../11-libgs10_10.02.1~dfsg1-0ubuntu7.9_amd64.deb ...\\r\\nUnpacking libgs10:amd64 (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSelecting previously unselected package libhwy1t64:amd64.\\r\\nPreparing to unpack .../12-libhwy1t64_1.0.7-8.1build1_amd64.deb ...\\r\\nUnpacking libhwy1t64:amd64 (1.0.7-8.1build1) ...\\r\\nSelecting previously unselected package libid3tag0:amd64.\\r\\nPreparing to unpack .../13-libid3tag0_0.15.1b-14build1_amd64.deb ...\\r\\nUnpacking libid3tag0:amd64 (0.15.1b-14build1) ...\\r\\nSelecting previously unselected package libjxl0.7:amd64.\\r\\nPreparing to unpack .../14-libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb ...\\r\\nUnpacking libjxl0.7:amd64 (0.7.0-10.2ubuntu6.1) ...\\r\\nSelecting previously unselected package librsvg2-2:amd64.\\r\\nPreparing to unpack .../15-librsvg2-2_2.58.0+dfsg-1build1_amd64.deb ...\\r\\nUnpacking librsvg2-2:amd64 (2.58.0+dfsg-1build1) ...\\r\\nSelecting previously unselected package libspectre1:amd64.\\r\\nPreparing to unpack .../16-libspectre1_0.2.12-1build2_amd64.deb ...\\r\\nUnpacking libspectre1:amd64 (0.2.12-1build2) ...\\r\\nSelecting previously unselected package libimlib2t64:amd64.\\r\\nPreparing to unpack .../17-libimlib2t64_1.12.1-1.1build2_amd64.deb ...\\r\\nUnpacking libimlib2t64:amd64 (1.12.1-1.1build2) ...\\r\\nSelecting previously unselected package libobt2v5:amd64.\\r\\nPreparing to unpack .../18-libobt2v5_3.6.1-12build5_amd64.deb ...\\r\\nUnpacking libobt2v5:amd64 (3.6.1-12build5) ...\\r\\nSelecting previously unselected package libpangoxft-1.0-0:amd64.\\r\\nPreparing to unpack .../19-libpangoxft-1.0-0_1.52.1+ds-1build1_amd64.deb ...\\r\\nUnpacking libpangoxft-1.0-0:amd64 (1.52.1+ds-1build1) ...\\r\\nSelecting previously unselected package libobrender32v5.\\r\\nPreparing to unpack .../20-libobrender32v5_3.6.1-12build5_amd64.deb ...\\r\\nUnpacking libobrender32v5 (3.6.1-12build5) ...\\r\\nSelecting previously unselected package libxcb-util1:amd64.\\r\\nPreparing to unpack .../21-libxcb-util1_0.4.0-1build3_amd64.deb ...\\r\\nUnpacking libxcb-util1:amd64 (0.4.0-1build3) ...\\r\\nSelecting previously unselected package libstartup-notification0:amd64.\\r\\nPreparing to unpack .../22-libstartup-notification0_0.12-6build3_amd64.deb ...\\r\\nUnpacking libstartup-notification0:amd64 (0.12-6build3) ...\\r\\nSelecting previously unselected package openbox.\\r\\nPreparing to unpack .../23-openbox_3.6.1-12build5_amd64.deb ...\\r\\nUnpacking openbox (3.6.1-12build5) ...\\r\\nSetting up libhwy1t64:amd64 (1.0.7-8.1build1) ...\\r\\nSetting up libpaper1:amd64 (1.1.29build1) ...\\r\\n\\r\\nCreating config file /etc/papersize with new version\\r\\nSetting up libpangoxft-1.0-0:amd64 (1.52.1+ds-1build1) ...\\r\\nSetting up libijs-0.35:amd64 (0.35-15.1build1) ...\\r\\nSetting up libgs-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSetting up libxcb-util1:amd64 (0.4.0-1build3) ...\\r\\nSetting up poppler-data (0.4.12-1) ...\\r\\nSetting up librsvg2-2:amd64 (2.58.0+dfsg-1build1) ...\\r\\nSetting up libid3tag0:amd64 (0.15.1b-14build1) ...\\r\\nSetting up libjbig2dec0:amd64 (0.20-1ubuntu0.24.04.1) ...\\r\\nSetting up xfonts-encodings (1:1.0.5-0ubuntu2) ...\\r\\nSetting up libidn12:amd64 (1.42-1ubuntu0.1) ...\\r\\nSetting up libobt2v5:amd64 (3.6.1-12build5) ...\\r\\nSetting up libjxl0.7:amd64 (0.7.0-10.2ubuntu6.1) ...\\r\\nSetting up libgif7:amd64 (5.2.2-1ubuntu1.2) ...\\r\\nSetting up libstartup-notification0:amd64 (0.12-6build3) ...\\r\\nSetting up xfonts-utils (1:7.7+6build3) ...\\r\\nSetting up fonts-urw-base35 (20200910-8) ...\\r\\nSetting up libgs10-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSetting up libgs10:amd64 (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSetting up libspectre1:amd64 (0.2.12-1build2) ...\\r\\nSetting up libimlib2t64:amd64 (1.12.1-1.1build2) ...\\r\\nSetting up libobrender32v5 (3.6.1-12build5) ...\\r\\nSetting up openbox (3.6.1-12build5) ...\\r\\nupdate-alternatives: using /usr/bin/openbox to provide /usr/bin/x-window-manager (x-window-manager) in auto mode\\r\\nupdate-alternatives: using /usr/bin/openbox-session to provide /usr/bin/x-session-manager (x-session-manager) in auto mode\\r\\nProcessing triggers for libc-bin (2.39-0ubuntu8.9) ...\\r\\nProcessing triggers for man-db (2.12.0-4build2) ...\\r\\nNot building database; man-db/auto-update is not 'true'.\\r\\nProcessing triggers for fontconfig (2.15.0-1.1ubuntu2) ...\\r\\n","stderr":"GET /ubuntu/pool/main/p/poppler-data/poppler-data_0.4.12-1_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/p/poppler-data/poppler-data_0.4.12-1_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:38 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 09 Feb 2023 17:45:19 GMT\\r\\nETag: \\"1f6e50-5f447f1c65370\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 2059856\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:38 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 24 Mar 2022 09:09:07 GMT\\r\\nETag: \\"8d22c-5daf332c4f03f\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 578092\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:38 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 18:39:31 GMT\\r\\nETag: \\"170e6-6159a204ab88b\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 94438\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/f/fonts-urw-base35/fonts-urw-base35_20200910-8_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/f/fonts-urw-base35/fonts-urw-base35_20200910-8_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:38 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Fri, 01 Mar 2024 05:58:37 GMT\\r\\nETag: \\"a75c74-6129311282be2\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 10968180\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/giflib/libgif7_5.2.2-1ubuntu1.2_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/giflib/libgif7_5.2.2-1ubuntu1.2_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Wed, 22 Jul 2026 12:43:42 GMT\\r\\nETag: \\"8b18-657327d4ec4e1\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 35608\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/ghostscript/libgs-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/ghostscript/libgs-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 21 Sep 2026 12:50:32 GMT\\r\\nETag: \\"2b014-65bfdb20f2297\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 176148\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/ghostscript/libgs10-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/ghostscript/libgs10-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 21 Sep 2026 12:50:32 GMT\\r\\nETag: \\"7721c-65bfdb20ca1f5\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 487964\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libi/libidn/libidn12_1.42-1ubuntu0.1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libi/libidn/libidn12_1.42-1ubuntu0.1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 09 Jul 2026 12:38:37 GMT\\r\\nETag: \\"db16-6562ce72ec187\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 56086\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/i/ijs/libijs-0.35_0.35-15.1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/i/ijs/libijs-0.35_0.35-15.1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 17:03:23 GMT\\r\\nETag: \\"3bd6-61598c87c5057\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 15318\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/j/jbig2dec/libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/j/jbig2dec/libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Tue, 21 Jul 2026 17:44:59 GMT\\r\\nETag: \\"febe-6572294ec0d45\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 65214\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libp/libpaper/libpaper1_1.1.29build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libp/libpaper/libpaper1_1.1.29build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 17:03:04 GMT\\r\\nETag: \\"3466-61598c7602197\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 13414\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/ghostscript/libgs10_10.02.1%7edfsg1-0ubuntu7.9_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/ghostscript/libgs10_10.02.1%7edfsg1-0ubuntu7.9_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 21 Sep 2026 12:50:33 GMT\\r\\nETag: \\"3b79c0-65bfdb21f0121\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 3897792\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/h/highway/libhwy1t64_1.0.7-8.1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/h/highway/libhwy1t64_1.0.7-8.1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 20:36:26 GMT\\r\\nETag: \\"8e972-614fad3b184cc\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 584050\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/libi/libid3tag/libid3tag0_0.15.1b-14build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/libi/libid3tag/libid3tag0_0.15.1b-14build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:39 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 18 Apr 2024 20:58:21 GMT\\r\\nETag: \\"833e-616653b3f6e34\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 33598\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/j/jpeg-xl/libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/j/jpeg-xl/libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 14 Jul 2025 16:22:38 GMT\\r\\nETag: \\"f479a-639e611705877\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 1001370\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libr/librsvg/librsvg2-2_2.58.0%2bdfsg-1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libr/librsvg/librsvg2-2_2.58.0%2bdfsg-1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 03:26:37 GMT\\r\\nETag: \\"209576-614ec70c8cfb8\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 2135414\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libs/libspectre/libspectre1_0.2.12-1build2_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libs/libspectre/libspectre1_0.2.12-1build2_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 17:03:01 GMT\\r\\nETag: \\"78b4-61598c7324b18\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 30900\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/i/imlib2/libimlib2t64_1.12.1-1.1build2_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/i/imlib2/libimlib2t64_1.12.1-1.1build2_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 19:32:49 GMT\\r\\nETag: \\"32aa8-614f9f02e8888\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 207528\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/o/openbox/libobt2v5_3.6.1-12build5_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/o/openbox/libobt2v5_3.6.1-12build5_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 15:20:35 GMT\\r\\nETag: \\"822c-6159758de4511\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 33324\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/p/pango1.0/libpangoxft-1.0-0_1.52.1%2bds-1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/p/pango1.0/libpangoxft-1.0-0_1.52.1%2bds-1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 18:38:03 GMT\\r\\nETag: \\"4f30-614f92c54da0b\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 20272\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/o/openbox/libobrender32v5_3.6.1-12build5_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/o/openbox/libobrender32v5_3.6.1-12build5_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 15:20:35 GMT\\r\\nETag: \\"a5d6-6159758dee152\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 42454\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/x/xcb-util/libxcb-util1_0.4.0-1build3_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/x/xcb-util/libxcb-util1_0.4.0-1build3_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 18:39:29 GMT\\r\\nETag: \\"29b6-6159a2034906f\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 10678\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/s/startup-notification/libstartup-notification0_0.12-6build3_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/s/startup-notification/libstartup-notification0_0.12-6build3_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 19:24:15 GMT\\r\\nETag: \\"480c-6159ac04f07a5\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 18444\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/o/openbox/openbox_3.6.1-12build5_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/o/openbox/openbox_3.6.1-12build5_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:21:40 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 15:20:35 GMT\\r\\nETag: \\"4a538-6159758ddb871\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 304440\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\n\\nRunning kernel seems to be up-to-date.\\n\\nNo services need to be restarted.\\n\\nNo containers need to be restarted.\\n\\nNo user sessions are running outdated binaries.\\n\\nNo VM guests are running outdated hypervisor (qemu) binaries on this host.\\n"}
2026-10-10T21:21:46.8884745Z # native-fixture {"stage":"Linux Openbox ready probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:46.8888240Z # native-fixture {"stage":"ready","electron":"44.5.1","executable":"/tmp/agent-m-276-component-electron-44/node_modules/electron/dist/electron"}
2026-10-10T21:21:46.8919703Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:46.9029204Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:47.8787367Z # Subtest: TST-276001: the actual Electron entry renders its forked pairing page and rotates its token
2026-10-10T21:21:47.8833169Z ok 219 - TST-276001: the actual Electron entry renders its forked pairing page and rotates its token
2026-10-10T21:21:47.8872672Z   ---
2026-10-10T21:21:47.8903980Z   duration_ms: 1005.141006
2026-10-10T21:21:47.9012511Z   type: 'test'
2026-10-10T21:21:47.9042381Z   ...
2026-10-10T21:21:47.9081770Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:47.9144901Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:48.8676194Z # Subtest: TST-276002: pause refuses new work, resume restores the real server refusal, and Quit stops it
2026-10-10T21:21:48.8706862Z ok 220 - TST-276002: pause refuses new work, resume restores the real server refusal, and Quit stops it
2026-10-10T21:21:48.8712626Z   ---
2026-10-10T21:21:48.8742654Z   duration_ms: 992.020656
2026-10-10T21:21:48.8743668Z   type: 'test'
2026-10-10T21:21:48.8744309Z   ...
2026-10-10T21:21:48.8804862Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:48.9015538Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:49.8469239Z # Subtest: TST-276003: an occupied port is visible and its replacement starts the same real composition
2026-10-10T21:21:49.8513612Z ok 221 - TST-276003: an occupied port is visible and its replacement starts the same real composition
2026-10-10T21:21:49.8582532Z   ---
2026-10-10T21:21:49.8612467Z   duration_ms: 977.353534
2026-10-10T21:21:49.8642572Z   type: 'test'
2026-10-10T21:21:49.8705180Z   ...
2026-10-10T21:21:49.8740003Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:49.8937306Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:50.9745966Z # Subtest: TST-276004: an unwritable private folder is shown without starting a server
2026-10-10T21:21:50.9763160Z ok 222 - TST-276004: an unwritable private folder is shown without starting a server
2026-10-10T21:21:50.9792453Z   ---
2026-10-10T21:21:50.9792892Z   duration_ms: 1124.093411
2026-10-10T21:21:50.9832487Z   type: 'test'
2026-10-10T21:21:50.9864826Z   ...
2026-10-10T21:21:50.9921478Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:51.0197879Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:52.0913425Z # Subtest: TST-276006: the production default stores the instance token privately
2026-10-10T21:21:52.0963196Z ok 223 - TST-276006: the production default stores the instance token privately
2026-10-10T21:21:52.0992532Z   ---
2026-10-10T21:21:52.1012476Z   duration_ms: 1121.762475
2026-10-10T21:21:52.1052453Z   type: 'test'
2026-10-10T21:21:52.1082425Z   ...
2026-10-10T21:21:52.1130849Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:52.1210787Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:52.9220593Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:52.9495851Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:53.2491477Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:53.2615003Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:53.5969698Z # Subtest: TST-276005: native close behavior and a second source start restore the first window
2026-10-10T21:21:53.5971809Z ok 224 - TST-276005: native close behavior and a second source start restore the first window
2026-10-10T21:21:53.5972652Z   ---
2026-10-10T21:21:53.5972956Z   duration_ms: 1502.680624
2026-10-10T21:21:53.5973202Z   type: 'test'
2026-10-10T21:21:53.5973397Z   ...
2026-10-10T21:21:53.6124146Z # Subtest: loadSchema — reads the rule of a schema, a section, a value specification, a condition and a variant
2026-10-10T21:21:53.6193815Z ok 225 - loadSchema — reads the rule of a schema, a section, a value specification, a condition and a variant
2026-10-10T21:21:53.6225490Z   ---
2026-10-10T21:21:53.6243978Z   duration_ms: 3.654286
2026-10-10T21:21:53.6297046Z   type: 'test'
2026-10-10T21:21:53.6352602Z   ...
2026-10-10T21:21:53.6383458Z # Subtest: loadSchema — a rule that is not a requirement's name in capitals is refused with SchemaError naming its key
2026-10-10T21:21:53.6401418Z ok 226 - loadSchema — a rule that is not a requirement's name in capitals is refused with SchemaError naming its key
2026-10-10T21:21:53.6422435Z   ---
2026-10-10T21:21:53.6442591Z   duration_ms: 6.847702
2026-10-10T21:21:53.6475444Z   type: 'test'
2026-10-10T21:21:53.6502323Z   ...
2026-10-10T21:21:53.6512415Z # Subtest: documentFindings — a document that fits its schema has no finding
2026-10-10T21:21:53.6533075Z ok 227 - documentFindings — a document that fits its schema has no finding
2026-10-10T21:21:53.6562676Z   ---
2026-10-10T21:21:53.6572555Z   duration_ms: 4.104693
2026-10-10T21:21:53.6602491Z   type: 'test'
2026-10-10T21:21:53.6622514Z   ...
2026-10-10T21:21:53.6653167Z # Subtest: documentFindings — front matter keys missing, unknown and out of order
2026-10-10T21:21:53.6673070Z ok 228 - documentFindings — front matter keys missing, unknown and out of order
2026-10-10T21:21:53.6692601Z   ---
2026-10-10T21:21:53.6712475Z   duration_ms: 1.484235
2026-10-10T21:21:53.6717344Z   type: 'test'
2026-10-10T21:21:53.6772408Z   ...
2026-10-10T21:21:53.6774188Z # Subtest: documentFindings — front matter values: required or forbidden by a condition, empty where nonEmpty, not of their type
2026-10-10T21:21:53.6787700Z ok 229 - documentFindings — front matter values: required or forbidden by a condition, empty where nonEmpty, not of their type
2026-10-10T21:21:53.6812513Z   ---
2026-10-10T21:21:53.6842397Z   duration_ms: 1.436893
2026-10-10T21:21:53.6852528Z   type: 'test'
2026-10-10T21:21:53.6872525Z   ...
2026-10-10T21:21:53.6898740Z # Subtest: documentFindings — front matter values not of their type, and not of the variant that holds
2026-10-10T21:21:53.6913053Z ok 230 - documentFindings — front matter values not of their type, and not of the variant that holds
2026-10-10T21:21:53.6913777Z   ---
2026-10-10T21:21:53.6914613Z   duration_ms: 1.531019
2026-10-10T21:21:53.6914997Z   type: 'test'
2026-10-10T21:21:53.6915274Z   ...
2026-10-10T21:21:53.6916337Z # Subtest: documentFindings — each row of a table, cell by cell: required or forbidden by a condition, not of its type
2026-10-10T21:21:53.6918080Z ok 231 - documentFindings — each row of a table, cell by cell: required or forbidden by a condition, not of its type
2026-10-10T21:21:53.6918969Z   ---
2026-10-10T21:21:53.6919292Z   duration_ms: 0.801116
2026-10-10T21:21:53.6919616Z   type: 'test'
2026-10-10T21:21:53.6919898Z   ...
2026-10-10T21:21:53.6920436Z # Subtest: documentFindings — a cell empty where nonEmpty
2026-10-10T21:21:53.6921012Z ok 232 - documentFindings — a cell empty where nonEmpty
2026-10-10T21:21:53.6921521Z   ---
2026-10-10T21:21:53.6922004Z   duration_ms: 0.364051
2026-10-10T21:21:53.6922403Z   type: 'test'
2026-10-10T21:21:53.6922752Z   ...
2026-10-10T21:21:53.6923892Z # Subtest: documentFindings — cells not of the variant that holds for their row, and each cell's closest rule
2026-10-10T21:21:53.6925547Z ok 233 - documentFindings — cells not of the variant that holds for their row, and each cell's closest rule
2026-10-10T21:21:53.6926418Z   ---
2026-10-10T21:21:53.6926755Z   duration_ms: 1.067431
2026-10-10T21:21:53.6927157Z   type: 'test'
2026-10-10T21:21:53.6927498Z   ...
2026-10-10T21:21:53.6928663Z # Subtest: documentFindings — required sections missing, sections out of order, and a section the schema forbids
2026-10-10T21:21:53.6930407Z ok 234 - documentFindings — required sections missing, sections out of order, and a section the schema forbids
2026-10-10T21:21:53.6931305Z   ---
2026-10-10T21:21:53.6931640Z   duration_ms: 2.009578
2026-10-10T21:21:53.6932408Z   type: 'test'
2026-10-10T21:21:53.6932751Z   ...
2026-10-10T21:21:53.6934001Z # Subtest: documentFindings — a section the schema does not name is a finding only where the schema forbids other sections
2026-10-10T21:21:53.6935843Z ok 235 - documentFindings — a section the schema does not name is a finding only where the schema forbids other sections
2026-10-10T21:21:53.6936773Z   ---
2026-10-10T21:21:53.6937100Z   duration_ms: 1.508945
2026-10-10T21:21:53.6937495Z   type: 'test'
2026-10-10T21:21:53.6937843Z   ...
2026-10-10T21:21:53.6939154Z # Subtest: documentFindings — a value's finding names the condition's rule, then the variant's, the value's, the section's, the schema's
2026-10-10T21:21:53.6940833Z ok 236 - documentFindings — a value's finding names the condition's rule, then the variant's, the value's, the section's, the schema's
2026-10-10T21:21:53.6941356Z   ---
2026-10-10T21:21:53.6941545Z   duration_ms: 2.946536
2026-10-10T21:21:53.6941755Z   type: 'test'
2026-10-10T21:21:53.6942130Z   ...
2026-10-10T21:21:53.6942775Z # Subtest: documentFindings — of combined conditions, the first part that holds and names a rule, before the combination's
2026-10-10T21:21:53.6943702Z ok 237 - documentFindings — of combined conditions, the first part that holds and names a rule, before the combination's
2026-10-10T21:21:53.6944184Z   ---
2026-10-10T21:21:53.6944373Z   duration_ms: 2.413255
2026-10-10T21:21:53.6944582Z   type: 'test'
2026-10-10T21:21:53.6944771Z   ...
2026-10-10T21:21:53.6945596Z # Subtest: documentFindings — a front matter value's finding names the condition's rule, the variant's, the value's, the schema's
2026-10-10T21:21:53.6946552Z ok 238 - documentFindings — a front matter value's finding names the condition's rule, the variant's, the value's, the schema's
2026-10-10T21:21:53.6947046Z   ---
2026-10-10T21:21:53.6947229Z   duration_ms: 0.998655
2026-10-10T21:21:53.6947435Z   type: 'test'
2026-10-10T21:21:53.6947618Z   ...
2026-10-10T21:21:53.6948230Z # Subtest: documentFindings — a key the schema does not list, keys out of order and a forbidden section name the schema's rule
2026-10-10T21:21:53.6949147Z ok 239 - documentFindings — a key the schema does not list, keys out of order and a forbidden section name the schema's rule
2026-10-10T21:21:53.6949623Z   ---
2026-10-10T21:21:53.6949800Z   duration_ms: 0.418019
2026-10-10T21:21:53.6950072Z   type: 'test'
2026-10-10T21:21:53.6950256Z   ...
2026-10-10T21:21:53.6950799Z # Subtest: a section under the title — read with the title line as its heading, and written back byte for byte
2026-10-10T21:21:53.6951600Z ok 240 - a section under the title — read with the title line as its heading, and written back byte for byte
2026-10-10T21:21:53.6952366Z   ---
2026-10-10T21:21:53.6952682Z   duration_ms: 6.465595
2026-10-10T21:21:53.6953033Z   type: 'test'
2026-10-10T21:21:53.6953343Z   ...
2026-10-10T21:21:53.6954372Z # Subtest: loadSchema — a second section under the title, or one that is not the first, is refused with SchemaError
2026-10-10T21:21:53.6956059Z ok 241 - loadSchema — a second section under the title, or one that is not the first, is refused with SchemaError
2026-10-10T21:21:53.6956812Z   ---
2026-10-10T21:21:53.6957130Z   duration_ms: 0.99494
2026-10-10T21:21:53.6957485Z   type: 'test'
2026-10-10T21:21:53.6957794Z   ...
2026-10-10T21:21:53.6958694Z # Subtest: documentFindings — a required section under the title that is missing is named
2026-10-10T21:21:53.6959938Z ok 242 - documentFindings — a required section under the title that is missing is named
2026-10-10T21:21:53.6960599Z   ---
2026-10-10T21:21:53.6960931Z   duration_ms: 1.02844
2026-10-10T21:21:53.6961308Z   type: 'test'
2026-10-10T21:21:53.6961646Z   ...
2026-10-10T21:21:53.6962734Z # Subtest: a section's table is the first in it whose header row names exactly its columns, in their order
2026-10-10T21:21:53.6964120Z ok 243 - a section's table is the first in it whose header row names exactly its columns, in their order
2026-10-10T21:21:53.6964883Z   ---
2026-10-10T21:21:53.6965219Z   duration_ms: 0.639834
2026-10-10T21:21:53.6965833Z   type: 'test'
2026-10-10T21:21:53.6966139Z   ...
2026-10-10T21:21:53.6967204Z # Subtest: a table without a header row is the section's first table, its first line a row
2026-10-10T21:21:53.6968283Z ok 244 - a table without a header row is the section's first table, its first line a row
2026-10-10T21:21:53.6968933Z   ---
2026-10-10T21:21:53.6969276Z   duration_ms: 0.447753
2026-10-10T21:21:53.6969615Z   type: 'test'
2026-10-10T21:21:53.6969948Z   ...
2026-10-10T21:21:53.6971080Z # Subtest: loadSchema — a schema whose section and appended section name a field whose key holds spaces loads
2026-10-10T21:21:53.6974313Z ok 245 - loadSchema — a schema whose section and appended section name a field whose key holds spaces loads
2026-10-10T21:21:53.6975141Z   ---
2026-10-10T21:21:53.6975440Z   duration_ms: 2.209739
2026-10-10T21:21:53.6975785Z   type: 'test'
2026-10-10T21:21:53.6976092Z   ...
2026-10-10T21:21:53.6976767Z # Subtest: readDocument — such a line is read into that field
2026-10-10T21:21:53.6977679Z ok 246 - readDocument — such a line is read into that field
2026-10-10T21:21:53.6978212Z   ---
2026-10-10T21:21:53.6978542Z   duration_ms: 1.87696
2026-10-10T21:21:53.6978890Z   type: 'test'
2026-10-10T21:21:53.6979203Z   ...
2026-10-10T21:21:53.6979694Z # Subtest: appendSection — writes it as given
2026-10-10T21:21:53.6980127Z ok 247 - appendSection — writes it as given
2026-10-10T21:21:53.6980396Z   ---
2026-10-10T21:21:53.6980583Z   duration_ms: 1.390241
2026-10-10T21:21:53.6980989Z   type: 'test'
2026-10-10T21:21:53.6981177Z   ...
2026-10-10T21:21:53.6981750Z # Subtest: loadSchema — a *.schema.md file holds its schema as its one ```json block; noHistory is read and kept
2026-10-10T21:21:53.6983156Z ok 248 - loadSchema — a *.schema.md file holds its schema as its one ```json block; noHistory is read and kept
2026-10-10T21:21:53.6983609Z   ---
2026-10-10T21:21:53.6983795Z   duration_ms: 3.353684
2026-10-10T21:21:53.6984010Z   type: 'test'
2026-10-10T21:21:53.6984202Z   ...
2026-10-10T21:21:53.6984804Z # Subtest: loadSchema — the ```json block among other Markdown: CR LF line ends, a ```json example inside another fence
2026-10-10T21:21:53.6985676Z ok 249 - loadSchema — the ```json block among other Markdown: CR LF line ends, a ```json example inside another fence
2026-10-10T21:21:53.6986133Z   ---
2026-10-10T21:21:53.6986316Z   duration_ms: 1.039811
2026-10-10T21:21:53.6986527Z   type: 'test'
2026-10-10T21:21:53.6986709Z   ...
2026-10-10T21:21:53.6987311Z # Subtest: loadSchema — a schema file without its one ```json block holding an object throws SchemaError naming the owner
2026-10-10T21:21:53.6988200Z ok 250 - loadSchema — a schema file without its one ```json block holding an object throws SchemaError naming the owner
2026-10-10T21:21:53.6988662Z   ---
2026-10-10T21:21:53.6988839Z   duration_ms: 0.899815
2026-10-10T21:21:53.6989049Z   type: 'test'
2026-10-10T21:21:53.6989230Z   ...
2026-10-10T21:21:53.6989762Z # Subtest: loadSchema — a schema that breaks the language throws SchemaError naming the key and the owner
2026-10-10T21:21:53.6990556Z ok 251 - loadSchema — a schema that breaks the language throws SchemaError naming the key and the owner
2026-10-10T21:21:53.6990976Z   ---
2026-10-10T21:21:53.6991157Z   duration_ms: 5.333541
2026-10-10T21:21:53.6991365Z   type: 'test'
2026-10-10T21:21:53.6991544Z   ...
2026-10-10T21:21:53.6992144Z # Subtest: readDocument — a declaration read by its schema: front matter, tables, lists, free sections
2026-10-10T21:21:53.6992928Z ok 252 - readDocument — a declaration read by its schema: front matter, tables, lists, free sections
2026-10-10T21:21:53.6993337Z   ---
2026-10-10T21:21:53.6993519Z   duration_ms: 1.535899
2026-10-10T21:21:53.6993724Z   type: 'test'
2026-10-10T21:21:53.6993909Z   ...
2026-10-10T21:21:53.6994456Z # Subtest: readDocument — a source entry: its identifier, a front matter list, the first table of a section
2026-10-10T21:21:53.6995264Z ok 253 - readDocument — a source entry: its identifier, a front matter list, the first table of a section
2026-10-10T21:21:53.6995822Z   ---
2026-10-10T21:21:53.6996007Z   duration_ms: 1.300968
2026-10-10T21:21:53.6996220Z   type: 'test'
2026-10-10T21:21:53.6996402Z   ...
2026-10-10T21:21:53.6996872Z # Subtest: readDocument — a value that depends on another, read by the variant that holds
2026-10-10T21:21:53.6997555Z ok 254 - readDocument — a value that depends on another, read by the variant that holds
2026-10-10T21:21:53.6997931Z   ---
2026-10-10T21:21:53.6998122Z   duration_ms: 1.207409
2026-10-10T21:21:53.6998332Z   type: 'test'
2026-10-10T21:21:53.6998515Z   ...
2026-10-10T21:21:53.6999117Z # Subtest: readDocument — never throws on the content: what does not fit is left as it stands, the parts that fit are read
2026-10-10T21:21:53.7000028Z ok 255 - readDocument — never throws on the content: what does not fit is left as it stands, the parts that fit are read
2026-10-10T21:21:53.7000492Z   ---
2026-10-10T21:21:53.7000678Z   duration_ms: 0.874047
2026-10-10T21:21:53.7000890Z   type: 'test'
2026-10-10T21:21:53.7001080Z   ...
2026-10-10T21:21:53.7001633Z # Subtest: readDocument — records: key: value lines, and the sections appended to a record with their fields
2026-10-10T21:21:53.7002607Z ok 256 - readDocument — records: key: value lines, and the sections appended to a record with their fields
2026-10-10T21:21:53.7003046Z   ---
2026-10-10T21:21:53.7003236Z   duration_ms: 1.004382
2026-10-10T21:21:53.7003450Z   type: 'test'
2026-10-10T21:21:53.7003647Z   ...
2026-10-10T21:21:53.7004368Z # Subtest: readDocument, writeDocument and readRegister — a schema that loadSchema did not return is refused with a TypeError
2026-10-10T21:21:53.7005319Z ok 257 - readDocument, writeDocument and readRegister — a schema that loadSchema did not return is refused with a TypeError
2026-10-10T21:21:53.7005808Z   ---
2026-10-10T21:21:53.7005990Z   duration_ms: 2.06696
2026-10-10T21:21:53.7006201Z   type: 'test'
2026-10-10T21:21:53.7006395Z   ...
2026-10-10T21:21:53.7006971Z # Subtest: readRegister — a register read row by row, under its title: each row with its line and its cells by column
2026-10-10T21:21:53.7008570Z ok 258 - readRegister — a register read row by row, under its title: each row with its line and its cells by column
2026-10-10T21:21:53.7009020Z   ---
2026-10-10T21:21:53.7009204Z   duration_ms: 0.961665
2026-10-10T21:21:53.7009412Z   type: 'test'
2026-10-10T21:21:53.7009607Z   ...
2026-10-10T21:21:53.7010076Z # Subtest: readRegister — a table without a header row, read by position into its columns
2026-10-10T21:21:53.7010758Z ok 259 - readRegister — a table without a header row, read by position into its columns
2026-10-10T21:21:53.7011134Z   ---
2026-10-10T21:21:53.7011316Z   duration_ms: 0.312074
2026-10-10T21:21:53.7011523Z   type: 'test'
2026-10-10T21:21:53.7011715Z   ...
2026-10-10T21:21:53.7012404Z # Subtest: readRegister — a schema that names no table, or more than one, is no register's: TypeError
2026-10-10T21:21:53.7013158Z ok 260 - readRegister — a schema that names no table, or more than one, is no register's: TypeError
2026-10-10T21:21:53.7013579Z   ---
2026-10-10T21:21:53.7013763Z   duration_ms: 0.463558
2026-10-10T21:21:53.7013974Z   type: 'test'
2026-10-10T21:21:53.7014165Z   ...
2026-10-10T21:21:53.7014640Z # Subtest: writeDocument — a canonical text read and written again is byte for byte the same
2026-10-10T21:21:53.7015341Z ok 261 - writeDocument — a canonical text read and written again is byte for byte the same
2026-10-10T21:21:53.7015735Z   ---
2026-10-10T21:21:53.7015922Z   duration_ms: 3.718235
2026-10-10T21:21:53.7016129Z   type: 'test'
2026-10-10T21:21:53.7016321Z   ...
2026-10-10T21:21:53.7016943Z # Subtest: writeDocument — the canonical form: front matter keys and sections in the schema's order, lists one item per line
2026-10-10T21:21:53.7017866Z ok 262 - writeDocument — the canonical form: front matter keys and sections in the schema's order, lists one item per line
2026-10-10T21:21:53.7018350Z   ---
2026-10-10T21:21:53.7018531Z   duration_ms: 0.942299
2026-10-10T21:21:53.7018875Z   type: 'test'
2026-10-10T21:21:53.7019069Z   ...
2026-10-10T21:21:53.7019718Z # Subtest: writeDocument — rows changed, removed and added: the table holds the section's rows, a row that stands keeps its bytes
2026-10-10T21:21:53.7020678Z ok 263 - writeDocument — rows changed, removed and added: the table holds the section's rows, a row that stands keeps its bytes
2026-10-10T21:21:53.7021176Z   ---
2026-10-10T21:21:53.7021359Z   duration_ms: 0.593258
2026-10-10T21:21:53.7021580Z   type: 'test'
2026-10-10T21:21:53.7021769Z   ...
2026-10-10T21:21:53.7022429Z # Subtest: writeDocument — a value that does not fit its specification is refused with DocumentError naming the field
2026-10-10T21:21:53.7023291Z ok 264 - writeDocument — a value that does not fit its specification is refused with DocumentError naming the field
2026-10-10T21:21:53.7023745Z   ---
2026-10-10T21:21:53.7023927Z   duration_ms: 2.866465
2026-10-10T21:21:53.7024149Z   type: 'test'
2026-10-10T21:21:53.7024332Z   ...
2026-10-10T21:21:53.7024939Z # Subtest: writeDocument — the values that depend on other values in a row: DocumentError naming the row and the column
2026-10-10T21:21:53.7025814Z ok 265 - writeDocument — the values that depend on other values in a row: DocumentError naming the row and the column
2026-10-10T21:21:53.7026269Z   ---
2026-10-10T21:21:53.7026447Z   duration_ms: 2.813108
2026-10-10T21:21:53.7026676Z   type: 'test'
2026-10-10T21:21:53.7026867Z   ...
2026-10-10T21:21:53.7027460Z # Subtest: writeDocument — an append-only table only grows: NotAppendable naming the row that would be lost or changed
2026-10-10T21:21:53.7028428Z ok 266 - writeDocument — an append-only table only grows: NotAppendable naming the row that would be lost or changed
2026-10-10T21:21:53.7028884Z   ---
2026-10-10T21:21:53.7029066Z   duration_ms: 1.066454
2026-10-10T21:21:53.7029289Z   type: 'test'
2026-10-10T21:21:53.7029474Z   ...
2026-10-10T21:21:53.7029890Z # Subtest: TST-260-001: an OpenAI-compatible test sends one short authorised chat request
2026-10-10T21:21:53.7030518Z ok 267 - TST-260-001: an OpenAI-compatible test sends one short authorised chat request
2026-10-10T21:21:53.7030896Z   ---
2026-10-10T21:21:53.7031077Z   duration_ms: 2.907956
2026-10-10T21:21:53.7031289Z   type: 'test'
2026-10-10T21:21:53.7031466Z   ...
2026-10-10T21:21:53.7031985Z # Subtest: TST-260-002: an Anthropic test uses its Messages format and omits an absent key
2026-10-10T21:21:53.7032591Z ok 268 - TST-260-002: an Anthropic test uses its Messages format and omits an absent key
2026-10-10T21:21:53.7032971Z   ---
2026-10-10T21:21:53.7033152Z   duration_ms: 0.504754
2026-10-10T21:21:53.7033374Z   type: 'test'
2026-10-10T21:21:53.7033559Z   ...
2026-10-10T21:21:53.7033870Z # Subtest: TST-260-003: a refused key keeps the provider message
2026-10-10T21:21:53.7034312Z ok 269 - TST-260-003: a refused key keeps the provider message
2026-10-10T21:21:53.7034606Z   ---
2026-10-10T21:21:53.7034819Z   duration_ms: 0.508341
2026-10-10T21:21:53.7035132Z   type: 'test'
2026-10-10T21:21:53.7035325Z   ...
2026-10-10T21:21:53.7035646Z # Subtest: TST-260-004: an unknown model keeps the provider message
2026-10-10T21:21:53.7036100Z ok 270 - TST-260-004: an unknown model keeps the provider message
2026-10-10T21:21:53.7036407Z   ---
2026-10-10T21:21:53.7036590Z   duration_ms: 0.393124
2026-10-10T21:21:53.7036806Z   type: 'test'
2026-10-10T21:21:53.7036998Z   ...
2026-10-10T21:21:53.7037305Z # Subtest: TST-260-005: a rate limit keeps the provider message
2026-10-10T21:21:53.7037742Z ok 271 - TST-260-005: a rate limit keeps the provider message
2026-10-10T21:21:53.7038040Z   ---
2026-10-10T21:21:53.7038223Z   duration_ms: 0.667891
2026-10-10T21:21:53.7038430Z   type: 'test'
2026-10-10T21:21:53.7038631Z   ...
2026-10-10T21:21:53.7039002Z # Subtest: TST-260-006: another endpoint error keeps its provider message
2026-10-10T21:21:53.7039502Z ok 272 - TST-260-006: another endpoint error keeps its provider message
2026-10-10T21:21:53.7039832Z   ---
2026-10-10T21:21:53.7040011Z   duration_ms: 0.467022
2026-10-10T21:21:53.7040331Z   type: 'test'
2026-10-10T21:21:53.7040536Z   ...
2026-10-10T21:21:53.7040835Z # Subtest: TST-260-007: a network failure is not reachable
2026-10-10T21:21:53.7041245Z ok 273 - TST-260-007: a network failure is not reachable
2026-10-10T21:21:53.7041536Z   ---
2026-10-10T21:21:53.7041718Z   duration_ms: 0.377631
2026-10-10T21:21:53.7042030Z   type: 'test'
2026-10-10T21:21:53.7042225Z   ...
2026-10-10T21:21:53.7042577Z # Subtest: TST-260-008: a browser cross-origin refusal offers CI and Bridge
2026-10-10T21:21:53.7043087Z ok 274 - TST-260-008: a browser cross-origin refusal offers CI and Bridge
2026-10-10T21:21:53.7043414Z   ---
2026-10-10T21:21:53.7043594Z   duration_ms: 0.262836
2026-10-10T21:21:53.7043798Z   type: 'test'
2026-10-10T21:21:53.7043987Z   ...
2026-10-10T21:21:53.7044340Z # Subtest: TST-260-009: a missing browser opt-in header offers CI and Bridge
2026-10-10T21:21:53.7044844Z ok 275 - TST-260-009: a missing browser opt-in header offers CI and Bridge
2026-10-10T21:21:53.7045177Z   ---
2026-10-10T21:21:53.7045352Z   duration_ms: 0.259474
2026-10-10T21:21:53.7045560Z   type: 'test'
2026-10-10T21:21:53.7045743Z   ...
2026-10-10T21:21:53.7046071Z # Subtest: TST-260-010: an opaque browser failure is not over-diagnosed
2026-10-10T21:21:53.7046555Z ok 276 - TST-260-010: an opaque browser failure is not over-diagnosed
2026-10-10T21:21:53.7046870Z   ---
2026-10-10T21:21:53.7047050Z   duration_ms: 0.272553
2026-10-10T21:21:53.7047261Z   type: 'test'
2026-10-10T21:21:53.7047510Z   ...
2026-10-10T21:21:53.7047991Z # Subtest: kindOfIdentifier — the kind of an identifier of each kind of the scheme
2026-10-10T21:21:53.7048627Z ok 277 - kindOfIdentifier — the kind of an identifier of each kind of the scheme
2026-10-10T21:21:53.7048995Z   ---
2026-10-10T21:21:53.7049176Z   duration_ms: 1.073732
2026-10-10T21:21:53.7049390Z   type: 'test'
2026-10-10T21:21:53.7049574Z   ...
2026-10-10T21:21:53.7049926Z # Subtest: kindOfIdentifier — UC takes three or more digits
2026-10-10T21:21:53.7050392Z ok 278 - kindOfIdentifier — UC takes three or more digits
2026-10-10T21:21:53.7050691Z   ---
2026-10-10T21:21:53.7050873Z   duration_ms: 0.125355
2026-10-10T21:21:53.7051079Z   type: 'test'
2026-10-10T21:21:53.7051260Z   ...
2026-10-10T21:21:53.7051712Z # Subtest: kindOfIdentifier — null for a string that is none of the scheme's kinds
2026-10-10T21:21:53.7052422Z ok 279 - kindOfIdentifier — null for a string that is none of the scheme's kinds
2026-10-10T21:21:53.7052796Z   ---
2026-10-10T21:21:53.7052997Z   duration_ms: 0.884273
2026-10-10T21:21:53.7053218Z   type: 'test'
2026-10-10T21:21:53.7053407Z   ...
2026-10-10T21:21:53.7053956Z # Subtest: instanceOfPagesAddress — the owner and first path segment of a Pages address, null elsewhere
2026-10-10T21:21:53.7054790Z ok 280 - instanceOfPagesAddress — the owner and first path segment of a Pages address, null elsewhere
2026-10-10T21:21:53.7055258Z   ---
2026-10-10T21:21:53.7055461Z   duration_ms: 0.367066
2026-10-10T21:21:53.7055671Z   type: 'test'
2026-10-10T21:21:53.7055860Z   ...
2026-10-10T21:21:53.7056609Z # Subtest: process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1)
2026-10-10T21:21:53.7057697Z ok 281 - process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1)
2026-10-10T21:21:53.7058246Z   ---
2026-10-10T21:21:53.7058425Z   duration_ms: 35.289885
2026-10-10T21:21:53.7058638Z   type: 'test'
2026-10-10T21:21:53.7058831Z   ...
2026-10-10T21:21:53.7059357Z # Subtest: process route — the phases panel shows the model's transitions and its verification pairs (F2)
2026-10-10T21:21:53.7060132Z ok 282 - process route — the phases panel shows the model's transitions and its verification pairs (F2)
2026-10-10T21:21:53.7060546Z   ---
2026-10-10T21:21:53.7060727Z   duration_ms: 17.97106
2026-10-10T21:21:53.7060932Z   type: 'test'
2026-10-10T21:21:53.7061120Z   ...
2026-10-10T21:21:53.7061587Z # Subtest: process route — beside a branch, the model's own gate at its end is shown (F3)
2026-10-10T21:21:53.7062522Z ok 283 - process route — beside a branch, the model's own gate at its end is shown (F3)
2026-10-10T21:21:53.7062898Z   ---
2026-10-10T21:21:53.7063084Z   duration_ms: 15.913619
2026-10-10T21:21:53.7063302Z   type: 'test'
2026-10-10T21:21:53.7063498Z   ...
2026-10-10T21:21:53.7064001Z # Subtest: process route — each practice is shown with what it adds, beside the models it fits (F4)
2026-10-10T21:21:53.7064748Z ok 284 - process route — each practice is shown with what it adds, beside the models it fits (F4)
2026-10-10T21:21:53.7065160Z   ---
2026-10-10T21:21:53.7065343Z   duration_ms: 12.093553
2026-10-10T21:21:53.7065556Z   type: 'test'
2026-10-10T21:21:53.7065749Z   ...
2026-10-10T21:21:53.7066372Z # Subtest: process route — selected tabled practice additions enter the workflow and disappear when the selection changes
2026-10-10T21:21:53.7067295Z ok 285 - process route — selected tabled practice additions enter the workflow and disappear when the selection changes
2026-10-10T21:21:53.7067784Z   ---
2026-10-10T21:21:53.7067967Z   duration_ms: 19.194352
2026-10-10T21:21:53.7068187Z   type: 'test'
2026-10-10T21:21:53.7068367Z   ...
2026-10-10T21:21:53.7068931Z # Subtest: process route — a gate a process requirement adds is shown with the two phases it stands between (F5)
2026-10-10T21:21:53.7069761Z ok 286 - process route — a gate a process requirement adds is shown with the two phases it stands between (F5)
2026-10-10T21:21:53.7070271Z   ---
2026-10-10T21:21:53.7070456Z   duration_ms: 13.266082
2026-10-10T21:21:53.7070676Z   type: 'test'
2026-10-10T21:21:53.7070859Z   ...
2026-10-10T21:21:53.7071428Z # Subtest: process route — the missing-capability notice links to the participants' page, \#participants (F6)
2026-10-10T21:21:53.7072334Z ok 287 - process route — the missing-capability notice links to the participants' page, \#participants (F6)
2026-10-10T21:21:53.7072778Z   ---
2026-10-10T21:21:53.7072958Z   duration_ms: 10.842543
2026-10-10T21:21:53.7073185Z   type: 'test'
2026-10-10T21:21:53.7073362Z   ...
2026-10-10T21:21:53.7073871Z # Subtest: process route — the five catalogue models, in two groups, each with what its about holds
2026-10-10T21:21:53.7074614Z ok 288 - process route — the five catalogue models, in two groups, each with what its about holds
2026-10-10T21:21:53.7075023Z   ---
2026-10-10T21:21:53.7075206Z   duration_ms: 32.943271
2026-10-10T21:21:53.7075423Z   type: 'test'
2026-10-10T21:21:53.7075619Z   ...
2026-10-10T21:21:53.7076006Z # Subtest: process route — the page of a product without a declaration
2026-10-10T21:21:53.7076542Z ok 289 - process route — the page of a product without a declaration
2026-10-10T21:21:53.7076862Z   ---
2026-10-10T21:21:53.7077043Z   duration_ms: 7.002694
2026-10-10T21:21:53.7077263Z   type: 'test'
2026-10-10T21:21:53.7077445Z   ...
2026-10-10T21:21:53.7077916Z # Subtest: process route — the page of a product with a declaration, its first field focused
2026-10-10T21:21:53.7078589Z ok 290 - process route — the page of a product with a declaration, its first field focused
2026-10-10T21:21:53.7078979Z   ---
2026-10-10T21:21:53.7079163Z   duration_ms: 25.710028
2026-10-10T21:21:53.7079383Z   type: 'test'
2026-10-10T21:21:53.7079574Z   ...
2026-10-10T21:21:53.7080041Z # Subtest: process route — the page of a product with Agent M's own declaration
2026-10-10T21:21:53.7081026Z ok 291 - process route — the page of a product with Agent M's own declaration
2026-10-10T21:21:53.7081657Z   ---
2026-10-10T21:21:53.7082115Z   duration_ms: 16.535468
2026-10-10T21:21:53.7082491Z   type: 'test'
2026-10-10T21:21:53.7082815Z   ...
2026-10-10T21:21:53.7084300Z # Subtest: process route — a role's offered participants are those with every capability, each with its place; a role none can hold names the missing capability
2026-10-10T21:21:53.7086579Z ok 292 - process route — a role's offered participants are those with every capability, each with its place; a role none can hold names the missing capability
2026-10-10T21:21:53.7087944Z   ---
2026-10-10T21:21:53.7088265Z   duration_ms: 10.32008
2026-10-10T21:21:53.7088652Z   type: 'test'
2026-10-10T21:21:53.7088986Z   ...
2026-10-10T21:21:53.7090263Z # Subtest: process route — the declaration's findings are shown before Save, among them a holder at a place a linked source does not permit
2026-10-10T21:21:53.7092467Z ok 293 - process route — the declaration's findings are shown before Save, among them a holder at a place a linked source does not permit
2026-10-10T21:21:53.7093489Z   ---
2026-10-10T21:21:53.7093801Z   duration_ms: 8.729279
2026-10-10T21:21:53.7094174Z   type: 'test'
2026-10-10T21:21:53.7094479Z   ...
2026-10-10T21:21:53.7095452Z # Subtest: process route — Save is disabled while a role that needs a person has none, naming it
2026-10-10T21:21:53.7096795Z ok 294 - process route — Save is disabled while a role that needs a person has none, naming it
2026-10-10T21:21:53.7097556Z   ---
2026-10-10T21:21:53.7097913Z   duration_ms: 12.63702
2026-10-10T21:21:53.7098338Z   type: 'test'
2026-10-10T21:21:53.7098692Z   ...
2026-10-10T21:21:53.7099414Z # Subtest: process route — a product without process requirements is told so
2026-10-10T21:21:53.7100403Z ok 295 - process route — a product without process requirements is told so
2026-10-10T21:21:53.7101031Z   ---
2026-10-10T21:21:53.7101348Z   duration_ms: 8.668949
2026-10-10T21:21:53.7101697Z   type: 'test'
2026-10-10T21:21:53.7102175Z   ...
2026-10-10T21:21:53.7103494Z # Subtest: process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not
2026-10-10T21:21:53.7105802Z ok 296 - process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not
2026-10-10T21:21:53.7106786Z   ---
2026-10-10T21:21:53.7107121Z   duration_ms: 24.269628
2026-10-10T21:21:53.7107589Z   type: 'test'
2026-10-10T21:21:53.7107884Z   ...
2026-10-10T21:21:53.7108975Z # Subtest: process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at
2026-10-10T21:21:53.7110714Z ok 297 - process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at
2026-10-10T21:21:53.7111610Z   ---
2026-10-10T21:21:53.7112111Z   duration_ms: 28.676591
2026-10-10T21:21:53.7112501Z   type: 'test'
2026-10-10T21:21:53.7112840Z   ...
2026-10-10T21:21:53.7114049Z # Subtest: process route — changing a practice in one live form updates the workflow before Save and Save preserves the selection
2026-10-10T21:21:53.7116253Z ok 298 - process route — changing a practice in one live form updates the workflow before Save and Save preserves the selection
2026-10-10T21:21:53.7117170Z   ---
2026-10-10T21:21:53.7117506Z   duration_ms: 19.079836
2026-10-10T21:21:53.7117893Z   type: 'test'
2026-10-10T21:21:53.7118184Z   ...
2026-10-10T21:21:53.7118881Z # Subtest: process route — a refused save keeps the person's edit
2026-10-10T21:21:53.7119835Z ok 299 - process route — a refused save keeps the person's edit
2026-10-10T21:21:53.7120417Z   ---
2026-10-10T21:21:53.7120733Z   duration_ms: 18.372752
2026-10-10T21:21:53.7121106Z   type: 'test'
2026-10-10T21:21:53.7121426Z   ...
2026-10-10T21:21:53.7122389Z # Subtest: newJobId — an identifier of the record's form, none of those taken
2026-10-10T21:21:53.7123513Z ok 300 - newJobId — an identifier of the record's form, none of those taken
2026-10-10T21:21:53.7124133Z   ---
2026-10-10T21:21:53.7124458Z   duration_ms: 1.360486
2026-10-10T21:21:53.7124799Z   type: 'test'
2026-10-10T21:21:53.7125100Z   ...
2026-10-10T21:21:53.7126020Z # Subtest: startRecord — the start of a record with each of its parts, read back as the same start
2026-10-10T21:21:53.7127370Z ok 301 - startRecord — the start of a record with each of its parts, read back as the same start
2026-10-10T21:21:53.7128085Z   ---
2026-10-10T21:21:53.7128403Z   duration_ms: 3.62599
2026-10-10T21:21:53.7128747Z   type: 'test'
2026-10-10T21:21:53.7129016Z   ...
2026-10-10T21:21:53.7129975Z # Subtest: listJobs — a record with each kind of part appended, read
2026-10-10T21:21:53.7130919Z ok 302 - listJobs — a record with each kind of part appended, read
2026-10-10T21:21:53.7131398Z   ---
2026-10-10T21:21:53.7131586Z   duration_ms: 1.262235
2026-10-10T21:21:53.7131805Z   type: 'test'
2026-10-10T21:21:53.7132159Z   ...
2026-10-10T21:21:53.7132687Z # Subtest: listJobs — a question to the author is read as the record's question, not a nameless gate
2026-10-10T21:21:53.7133561Z ok 303 - listJobs — a question to the author is read as the record's question, not a nameless gate
2026-10-10T21:21:53.7134290Z   ---
2026-10-10T21:21:53.7134582Z   duration_ms: 0.500459
2026-10-10T21:21:53.7134806Z   type: 'test'
2026-10-10T21:21:53.7134991Z   ...
2026-10-10T21:21:53.7135492Z # Subtest: listJobs — an End's draft is read from its one fenced JSON block
2026-10-10T21:21:53.7136136Z ok 304 - listJobs — an End's draft is read from its one fenced JSON block
2026-10-10T21:21:53.7136482Z   ---
2026-10-10T21:21:53.7136688Z   duration_ms: 0.420106
2026-10-10T21:21:53.7136973Z   type: 'test'
2026-10-10T21:21:53.7137161Z   ...
2026-10-10T21:21:53.7137749Z # Subtest: jobState — the state of a record by its last part, with a live state and without one
2026-10-10T21:21:53.7138540Z ok 305 - jobState — the state of a record by its last part, with a live state and without one
2026-10-10T21:21:53.7138937Z   ---
2026-10-10T21:21:53.7139153Z   duration_ms: 0.232156
2026-10-10T21:21:53.7139409Z   type: 'test'
2026-10-10T21:21:53.7139754Z   ...
2026-10-10T21:21:53.7140881Z # Subtest: listJobs — the jobs of two products newest first, waiting at a gate first, a record that cannot be read listed with the reason
2026-10-10T21:21:53.7142848Z ok 306 - listJobs — the jobs of two products newest first, waiting at a gate first, a record that cannot be read listed with the reason
2026-10-10T21:21:53.7143899Z   ---
2026-10-10T21:21:53.7144272Z   duration_ms: 0.790667
2026-10-10T21:21:53.7144695Z   type: 'test'
2026-10-10T21:21:53.7145075Z   ...
2026-10-10T21:21:53.7146051Z # Subtest: jobCost — the cost as reported, at the declared price, or unknown, never zero
2026-10-10T21:21:53.7147456Z ok 307 - jobCost — the cost as reported, at the declared price, or unknown, never zero
2026-10-10T21:21:53.7148219Z   ---
2026-10-10T21:21:53.7148577Z   duration_ms: 0.193238
2026-10-10T21:21:53.7148991Z   type: 'test'
2026-10-10T21:21:53.7149348Z   ...
2026-10-10T21:21:53.7150431Z # Subtest: recordsNewestFirst — yields only the newest record until its caller asks for another
2026-10-10T21:21:53.7152113Z ok 308 - recordsNewestFirst — yields only the newest record until its caller asks for another
2026-10-10T21:21:53.7152960Z   ---
2026-10-10T21:21:53.7153322Z   duration_ms: 0.608861
2026-10-10T21:21:53.7153741Z   type: 'test'
2026-10-10T21:21:53.7154101Z   ...
2026-10-10T21:21:53.7155501Z # Subtest: the use-case list reads the commit, the tree, the use cases and only the records it must — no architecture or queue file
2026-10-10T21:21:53.7157590Z ok 309 - the use-case list reads the commit, the tree, the use cases and only the records it must — no architecture or queue file
2026-10-10T21:21:53.7158651Z   ---
2026-10-10T21:21:53.7159029Z   duration_ms: 177.775955
2026-10-10T21:21:53.7159476Z   type: 'test'
2026-10-10T21:21:53.7159840Z   ...
2026-10-10T21:21:53.7160530Z # Subtest: the architecture view reads no use case and no queue file
2026-10-10T21:21:53.7161539Z ok 310 - the architecture view reads no use case and no queue file
2026-10-10T21:21:53.7162229Z   ---
2026-10-10T21:21:53.7162592Z   duration_ms: 83.605515
2026-10-10T21:21:53.7163023Z   type: 'test'
2026-10-10T21:21:53.7163393Z   ...
2026-10-10T21:21:53.7164343Z # Subtest: the SPEC view lists only the open SPEC changes; an accepted queue's proposals are not read
2026-10-10T21:21:53.7165824Z ok 311 - the SPEC view lists only the open SPEC changes; an accepted queue's proposals are not read
2026-10-10T21:21:53.7166686Z   ---
2026-10-10T21:21:53.7167045Z   duration_ms: 74.121877
2026-10-10T21:21:53.7167651Z   type: 'test'
2026-10-10T21:21:53.7168017Z   ...
2026-10-10T21:21:53.7168956Z # Subtest: opening one use case reads that use case and its records — no other file
2026-10-10T21:21:53.7170303Z ok 312 - opening one use case reads that use case and its records — no other file
2026-10-10T21:21:53.7171011Z   ---
2026-10-10T21:21:53.7171357Z   duration_ms: 67.849258
2026-10-10T21:21:53.7171782Z   type: 'test'
2026-10-10T21:21:53.7172198Z   ...
2026-10-10T21:21:53.7173482Z # Subtest: opening a changed module reads what its impact list needs: its records, its last accepted text, every module, the code's headers
2026-10-10T21:21:53.7175526Z ok 313 - opening a changed module reads what its impact list needs: its records, its last accepted text, every module, the code's headers
2026-10-10T21:21:53.7176612Z   ---
2026-10-10T21:21:53.7176964Z   duration_ms: 69.92147
2026-10-10T21:21:53.7177372Z   type: 'test'
2026-10-10T21:21:53.7177720Z   ...
2026-10-10T21:21:53.7178651Z # Subtest: settings read the product's settings, and no use case, architecture file, record or queue
2026-10-10T21:21:53.7180094Z ok 314 - settings read the product's settings, and no use case, architecture file, record or queue
2026-10-10T21:21:53.7180930Z   ---
2026-10-10T21:21:53.7181271Z   duration_ms: 59.737868
2026-10-10T21:21:53.7181696Z   type: 'test'
2026-10-10T21:21:53.7182131Z   ...
2026-10-10T21:21:53.7182867Z # Subtest: a second load on an unchanged tree reads its displayed files again
2026-10-10T21:21:53.7183969Z ok 315 - a second load on an unchanged tree reads its displayed files again
2026-10-10T21:21:53.7184766Z   ---
2026-10-10T21:21:53.7185112Z   duration_ms: 200.418806
2026-10-10T21:21:53.7185546Z   type: 'test'
2026-10-10T21:21:53.7185894Z   ...
2026-10-10T21:21:53.7186696Z # Subtest: without Cache Storage the page still works; it reads every file it shows
2026-10-10T21:21:53.7187926Z ok 316 - without Cache Storage the page still works; it reads every file it shows
2026-10-10T21:21:53.7188663Z   ---
2026-10-10T21:21:53.7189010Z   duration_ms: 122.029361
2026-10-10T21:21:53.7189445Z   type: 'test'
2026-10-10T21:21:53.7189799Z   ...
2026-10-10T21:21:53.7190977Z # Subtest: counter-proof: a record named for the current text whose content names another blob does not accept the opened file
2026-10-10T21:21:53.7192891Z ok 317 - counter-proof: a record named for the current text whose content names another blob does not accept the opened file
2026-10-10T21:21:53.7193924Z   ---
2026-10-10T21:21:53.7194276Z   duration_ms: 132.384291
2026-10-10T21:21:53.7194705Z   type: 'test'
2026-10-10T21:21:53.7195056Z   ...
2026-10-10T21:21:53.7195891Z # Subtest: Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR)
2026-10-10T21:21:53.7197150Z ok 318 - Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR)
2026-10-10T21:21:53.7197911Z   ---
2026-10-10T21:21:53.7198259Z   duration_ms: 2.21399
2026-10-10T21:21:53.7198667Z   type: 'test'
2026-10-10T21:21:53.7199012Z   ...
2026-10-10T21:21:53.7200063Z # Subtest: renderArtifact — headings, lists, emphasis, links, tables and code are rendered
2026-10-10T21:21:53.7201558Z ok 319 - renderArtifact — headings, lists, emphasis, links, tables and code are rendered
2026-10-10T21:21:53.7202437Z   ---
2026-10-10T21:21:53.7202778Z   duration_ms: 24.485579
2026-10-10T21:21:53.7203204Z   type: 'test'
2026-10-10T21:21:53.7203548Z   ...
2026-10-10T21:21:53.7204735Z # Subtest: renderArtifact — a script, an event attribute and a javascript: link are removed by the sanitiser
2026-10-10T21:21:53.7206475Z ok 320 - renderArtifact — a script, an event attribute and a javascript: link are removed by the sanitiser
2026-10-10T21:21:53.7207388Z   ---
2026-10-10T21:21:53.7207795Z   duration_ms: 1.459074
2026-10-10T21:21:53.7208198Z   type: 'test'
2026-10-10T21:21:53.7208556Z   ...
2026-10-10T21:21:53.7209351Z # Subtest: renderArtifact — an image is shown as a link, never loaded
2026-10-10T21:21:53.7210470Z ok 321 - renderArtifact — an image is shown as a link, never loaded
2026-10-10T21:21:53.7211282Z   ---
2026-10-10T21:21:53.7211637Z   duration_ms: 0.654472
2026-10-10T21:21:53.7212129Z   type: 'test'
2026-10-10T21:21:53.7212489Z   ...
2026-10-10T21:21:53.7213781Z # Subtest: renderArtifact — a Mermaid block is shown as its source with the reason, and the prose around it is rendered
2026-10-10T21:21:53.7215716Z ok 322 - renderArtifact — a Mermaid block is shown as its source with the reason, and the prose around it is rendered
2026-10-10T21:21:53.7216699Z   ---
2026-10-10T21:21:53.7217062Z   duration_ms: 0.819233
2026-10-10T21:21:53.7217465Z   type: 'test'
2026-10-10T21:21:53.7217821Z   ...
2026-10-10T21:21:53.7218559Z # Subtest: renderArtifact — the same text gives the same HTML
2026-10-10T21:21:53.7219563Z ok 323 - renderArtifact — the same text gives the same HTML
2026-10-10T21:21:53.7220171Z   ---
2026-10-10T21:21:53.7220525Z   duration_ms: 5.731115
2026-10-10T21:21:53.7220939Z   type: 'test'
2026-10-10T21:21:53.7221223Z   ...
2026-10-10T21:21:53.7221756Z # Subtest: openEditor — the preview follows an edit
2026-10-10T21:21:53.7222636Z ok 324 - openEditor — the preview follows an edit
2026-10-10T21:21:53.7223198Z   ---
2026-10-10T21:21:53.7223560Z   duration_ms: 1.390474
2026-10-10T21:21:53.7223975Z   type: 'test'
2026-10-10T21:21:53.7224307Z   ...
2026-10-10T21:21:53.7225256Z # Subtest: openEditor — a mark is shown beside its line, in the one form of a finding
2026-10-10T21:21:53.7226604Z ok 325 - openEditor — a mark is shown beside its line, in the one form of a finding
2026-10-10T21:21:53.7227522Z   ---
2026-10-10T21:21:53.7227883Z   duration_ms: 1.142621
2026-10-10T21:21:53.7228306Z   type: 'test'
2026-10-10T21:21:53.7228671Z   ...
2026-10-10T21:21:53.7229519Z # Subtest: openEditor — Save hands the edited text to the caller's save
2026-10-10T21:21:53.7230688Z ok 326 - openEditor — Save hands the edited text to the caller's save
2026-10-10T21:21:53.7231372Z   ---
2026-10-10T21:21:53.7231728Z   duration_ms: 6.661308
2026-10-10T21:21:53.7232225Z   type: 'test'
2026-10-10T21:21:53.7232585Z   ...
2026-10-10T21:21:53.7233756Z # Subtest: openEditor — a refused save keeps the edit, with the newer version and the difference beside it
2026-10-10T21:21:53.7235480Z ok 327 - openEditor — a refused save keeps the edit, with the newer version and the difference beside it
2026-10-10T21:21:53.7236380Z   ---
2026-10-10T21:21:53.7236745Z   duration_ms: 2.817711
2026-10-10T21:21:53.7237157Z   type: 'test'
2026-10-10T21:21:53.7237498Z   ...
2026-10-10T21:21:53.7238244Z # Subtest: TST-269001: a local endpoint saves then probes only its paired Bridge
2026-10-10T21:21:53.7239418Z ok 328 - TST-269001: a local endpoint saves then probes only its paired Bridge
2026-10-10T21:21:53.7240138Z   ---
2026-10-10T21:21:53.7240489Z   duration_ms: 36.474592
2026-10-10T21:21:53.7240907Z   type: 'test'
2026-10-10T21:21:53.7241260Z   ...
2026-10-10T21:21:53.7242229Z # Subtest: TST-269002: a provider refusal through Bridge remains a stored provider diagnosis
2026-10-10T21:21:53.7243584Z ok 329 - TST-269002: a provider refusal through Bridge remains a stored provider diagnosis
2026-10-10T21:21:53.7244411Z   ---
2026-10-10T21:21:53.7244767Z   duration_ms: 5.681901
2026-10-10T21:21:53.7245177Z   type: 'test'
2026-10-10T21:21:53.7245532Z   ...
2026-10-10T21:21:53.7246468Z # Subtest: TST-269003: absent Bridge setup retains the endpoint and directs the author to pairing
2026-10-10T21:21:53.7247900Z ok 330 - TST-269003: absent Bridge setup retains the endpoint and directs the author to pairing
2026-10-10T21:21:53.7248740Z   ---
2026-10-10T21:21:53.7249102Z   duration_ms: 2.771613
2026-10-10T21:21:53.7249513Z   type: 'test'
2026-10-10T21:21:53.7249869Z   ...
2026-10-10T21:21:53.7250762Z # Subtest: TST-269004: refused and unavailable Bridges stay distinct from provider diagnoses
2026-10-10T21:21:53.7252196Z ok 331 - TST-269004: refused and unavailable Bridges stay distinct from provider diagnoses
2026-10-10T21:21:53.7253018Z   ---
2026-10-10T21:21:53.7253374Z   duration_ms: 4.073986
2026-10-10T21:21:53.7253788Z   type: 'test'
2026-10-10T21:21:53.7254151Z   ...
2026-10-10T21:21:53.7255282Z # Subtest: TST-269005: HTTPS Bridge testing reads the separate jump-host login into transient settings
2026-10-10T21:21:53.7256805Z ok 332 - TST-269005: HTTPS Bridge testing reads the separate jump-host login into transient settings
2026-10-10T21:21:53.7257693Z   ---
2026-10-10T21:21:53.7258052Z   duration_ms: 1.986476
2026-10-10T21:21:53.7258482Z   type: 'test'
2026-10-10T21:21:53.7258859Z   ...
2026-10-10T21:21:53.7259848Z # Subtest: TST-269006: the public endpoint Route hands absent Bridge setup to the public Bridge Route
2026-10-10T21:21:53.7261349Z ok 333 - TST-269006: the public endpoint Route hands absent Bridge setup to the public Bridge Route
2026-10-10T21:21:53.7262295Z   ---
2026-10-10T21:21:53.7262652Z   duration_ms: 212.952435
2026-10-10T21:21:53.7263076Z   type: 'test'
2026-10-10T21:21:53.7263436Z   ...
2026-10-10T21:21:53.7264380Z # Subtest: Model.about — every shipped model's \#\# About is read with its four lines
2026-10-10T21:21:53.7265745Z ok 334 - Model.about — every shipped model's \#\# About is read with its four lines
2026-10-10T21:21:53.7266506Z   ---
2026-10-10T21:21:53.7266865Z   duration_ms: 9.001656
2026-10-10T21:21:53.7267277Z   type: 'test'
2026-10-10T21:21:53.7267634Z   ...
2026-10-10T21:21:53.7268497Z # Subtest: Model.about — a model without \#\# About is read with about null
2026-10-10T21:21:53.7269685Z ok 335 - Model.about — a model without \#\# About is read with about null
2026-10-10T21:21:53.7270366Z   ---
2026-10-10T21:21:53.7270827Z   duration_ms: 3.358069
2026-10-10T21:21:53.7271236Z   type: 'test'
2026-10-10T21:21:53.7271595Z   ...
2026-10-10T21:21:53.7273086Z # Subtest: catalogue — the shipped catalogue holds exactly the book's five models in their two groups, and its four practices
2026-10-10T21:21:53.7275139Z ok 336 - catalogue — the shipped catalogue holds exactly the book's five models in their two groups, and its four practices
2026-10-10T21:21:53.7276173Z   ---
2026-10-10T21:21:53.7276526Z   duration_ms: 7.3222
2026-10-10T21:21:53.7276947Z   type: 'test'
2026-10-10T21:21:53.7277318Z   ...
2026-10-10T21:21:53.7278547Z # Subtest: catalogue — an instance's own model is read as a Model, listed after the shipped ones, with its findings
2026-10-10T21:21:53.7280369Z ok 337 - catalogue — an instance's own model is read as a Model, listed after the shipped ones, with its findings
2026-10-10T21:21:53.7281296Z   ---
2026-10-10T21:21:53.7281650Z   duration_ms: 4.437615
2026-10-10T21:21:53.7282128Z   type: 'test'
2026-10-10T21:21:53.7282512Z   ...
2026-10-10T21:21:53.7283774Z # Subtest: modelFindings — every shipped model passes without an error, and every shipped practice fits its schema
2026-10-10T21:21:53.7285673Z ok 338 - modelFindings — every shipped model passes without an error, and every shipped practice fits its schema
2026-10-10T21:21:53.7286650Z   ---
2026-10-10T21:21:53.7287007Z   duration_ms: 4.408643
2026-10-10T21:21:53.7287420Z   type: 'test'
2026-10-10T21:21:53.7287792Z   ...
2026-10-10T21:21:53.7289147Z # Subtest: modelFindings — a complete definition, with a gate decided by a role and one decided by a CI check, has no finding
2026-10-10T21:21:53.7291193Z ok 339 - modelFindings — a complete definition, with a gate decided by a role and one decided by a CI check, has no finding
2026-10-10T21:21:53.7292286Z   ---
2026-10-10T21:21:53.7292640Z   duration_ms: 0.592933
2026-10-10T21:21:53.7293052Z   type: 'test'
2026-10-10T21:21:53.7293424Z   ...
2026-10-10T21:21:53.7294403Z # Subtest: modelFindings — a transition naming a phase that is not defined is an error
2026-10-10T21:21:53.7295829Z ok 340 - modelFindings — a transition naming a phase that is not defined is an error
2026-10-10T21:21:53.7296613Z   ---
2026-10-10T21:21:53.7296964Z   duration_ms: 0.742812
2026-10-10T21:21:53.7297371Z   type: 'test'
2026-10-10T21:21:53.7297740Z   ...
2026-10-10T21:21:53.7298786Z # Subtest: modelFindings — a phase that no transition reaches from the first phase is an error
2026-10-10T21:21:53.7300307Z ok 341 - modelFindings — a phase that no transition reaches from the first phase is an error
2026-10-10T21:21:53.7301263Z   ---
2026-10-10T21:21:53.7301617Z   duration_ms: 0.639763
2026-10-10T21:21:53.7302111Z   type: 'test'
2026-10-10T21:21:53.7302464Z   ...
2026-10-10T21:21:53.7303396Z # Subtest: modelFindings — a verification pair naming a missing phase is an error
2026-10-10T21:21:53.7304738Z ok 342 - modelFindings — a verification pair naming a missing phase is an error
2026-10-10T21:21:53.7305487Z   ---
2026-10-10T21:21:53.7305840Z   duration_ms: 0.650125
2026-10-10T21:21:53.7306258Z   type: 'test'
2026-10-10T21:21:53.7306623Z   ...
2026-10-10T21:21:53.7307366Z # Subtest: modelFindings — a gate without artifacts is an error
2026-10-10T21:21:53.7308460Z ok 343 - modelFindings — a gate without artifacts is an error
2026-10-10T21:21:53.7309079Z   ---
2026-10-10T21:21:53.7309431Z   duration_ms: 0.599422
2026-10-10T21:21:53.7309845Z   type: 'test'
2026-10-10T21:21:53.7310212Z   ...
2026-10-10T21:21:53.7310977Z # Subtest: modelFindings — a gate without a condition is an error
2026-10-10T21:21:53.7312124Z ok 344 - modelFindings — a gate without a condition is an error
2026-10-10T21:21:53.7312758Z   ---
2026-10-10T21:21:53.7313114Z   duration_ms: 1.410606
2026-10-10T21:21:53.7313529Z   type: 'test'
2026-10-10T21:21:53.7313897Z   ...
2026-10-10T21:21:53.7315233Z # Subtest: modelFindings — a gate without a decider is an error: none named, or one that is no role of the model and no check
2026-10-10T21:21:53.7317176Z ok 345 - modelFindings — a gate without a decider is an error: none named, or one that is no role of the model and no check
2026-10-10T21:21:53.7318286Z   ---
2026-10-10T21:21:53.7318645Z   duration_ms: 2.560118
2026-10-10T21:21:53.7319061Z   type: 'test'
2026-10-10T21:21:53.7319444Z   ...
2026-10-10T21:21:53.7320237Z # Subtest: modelFindings — a role without capabilities is an error
2026-10-10T21:21:53.7321315Z ok 346 - modelFindings — a role without capabilities is an error
2026-10-10T21:21:53.7322024Z   ---
2026-10-10T21:21:53.7322377Z   duration_ms: 0.650253
2026-10-10T21:21:53.7322795Z   type: 'test'
2026-10-10T21:21:53.7323148Z   ...
2026-10-10T21:21:53.7324305Z # Subtest: modelFindings — a phase without a role is an error: none named, or one the model does not define
2026-10-10T21:21:53.7326007Z ok 347 - modelFindings — a phase without a role is an error: none named, or one the model does not define
2026-10-10T21:21:53.7326890Z   ---
2026-10-10T21:21:53.7327238Z   duration_ms: 0.984551
2026-10-10T21:21:53.7327646Z   type: 'test'
2026-10-10T21:21:53.7328022Z   ...
2026-10-10T21:21:53.7329138Z # Subtest: modelFindings — a gate that checks a kind of artifact no earlier phase produces is an error
2026-10-10T21:21:53.7330787Z ok 348 - modelFindings — a gate that checks a kind of artifact no earlier phase produces is an error
2026-10-10T21:21:53.7331653Z   ---
2026-10-10T21:21:53.7332079Z   duration_ms: 0.494314
2026-10-10T21:21:53.7332503Z   type: 'test'
2026-10-10T21:21:53.7332862Z   ...
2026-10-10T21:21:53.7334852Z # Subtest: modelFindings and catalogue — a kind in Produces may be followed by an explanation in parentheses: the kind is what stands before it, and a gate that checks it finds it produced
2026-10-10T21:21:53.7337938Z ok 349 - modelFindings and catalogue — a kind in Produces may be followed by an explanation in parentheses: the kind is what stands before it, and a gate that checks it finds it produced
2026-10-10T21:21:53.7339366Z   ---
2026-10-10T21:21:53.7339725Z   duration_ms: 2.132709
2026-10-10T21:21:53.7340134Z   type: 'test'
2026-10-10T21:21:53.7340503Z   ...
2026-10-10T21:21:53.7341641Z # Subtest: modelFindings — a word before the parenthesis that is no kind of artifact is still a finding
2026-10-10T21:21:53.7343137Z ok 350 - modelFindings — a word before the parenthesis that is no kind of artifact is still a finding
2026-10-10T21:21:53.7344041Z   ---
2026-10-10T21:21:53.7344412Z   duration_ms: 0.523863
2026-10-10T21:21:53.7344824Z   type: 'test'
2026-10-10T21:21:53.7345188Z   ...
2026-10-10T21:21:53.7346478Z # Subtest: modelFindings — pulled work with neither a time box nor a work-in-progress limit, or with both, is an error
2026-10-10T21:21:53.7348567Z ok 351 - modelFindings — pulled work with neither a time box nor a work-in-progress limit, or with both, is an error
2026-10-10T21:21:53.7349551Z   ---
2026-10-10T21:21:53.7349917Z   duration_ms: 1.224746
2026-10-10T21:21:53.7350339Z   type: 'test'
2026-10-10T21:21:53.7350702Z   ...
2026-10-10T21:21:53.7352370Z # Subtest: modelFindings and catalogue — a Time box of none is no time box: pulled work with a WIP limit and a Time box of none has no finding of both
2026-10-10T21:21:53.7354770Z ok 352 - modelFindings and catalogue — a Time box of none is no time box: pulled work with a WIP limit and a Time box of none has no finding of both
2026-10-10T21:21:53.7355936Z   ---
2026-10-10T21:21:53.7356298Z   duration_ms: 2.500116
2026-10-10T21:21:53.7356721Z   type: 'test'
2026-10-10T21:21:53.7357091Z   ...
2026-10-10T21:21:53.7358029Z # Subtest: modelFindings — a measure that does not fit the kind of work is an error
2026-10-10T21:21:53.7359399Z ok 353 - modelFindings — a measure that does not fit the kind of work is an error
2026-10-10T21:21:53.7360161Z   ---
2026-10-10T21:21:53.7360512Z   duration_ms: 0.681239
2026-10-10T21:21:53.7360922Z   type: 'test'
2026-10-10T21:21:53.7361278Z   ...
2026-10-10T21:21:53.7362252Z # Subtest: modelFindings — no declaration of planned or pulled work is an error
2026-10-10T21:21:53.7363554Z ok 354 - modelFindings — no declaration of planned or pulled work is an error
2026-10-10T21:21:53.7364452Z   ---
2026-10-10T21:21:53.7364810Z   duration_ms: 0.737963
2026-10-10T21:21:53.7365223Z   type: 'test'
2026-10-10T21:21:53.7365640Z   ...
2026-10-10T21:21:53.7366942Z # Subtest: modelFindings — this repository's own docs/process-models/scrum-wip.md, as it stands, has no error finding
2026-10-10T21:21:53.7368898Z ok 355 - modelFindings — this repository's own docs/process-models/scrum-wip.md, as it stands, has no error finding
2026-10-10T21:21:53.7369908Z   ---
2026-10-10T21:21:53.7370262Z   duration_ms: 0.741652
2026-10-10T21:21:53.7370679Z   type: 'test'
2026-10-10T21:21:53.7371034Z   ...
2026-10-10T21:21:53.7372198Z # Subtest: THE CATALOGUE IS DATA — no name of a shipped model or practice stands in the module's code
2026-10-10T21:21:53.7373793Z ok 356 - THE CATALOGUE IS DATA — no name of a shipped model or practice stands in the module's code
2026-10-10T21:21:53.7374639Z   ---
2026-10-10T21:21:53.7375000Z   duration_ms: 6.965569
2026-10-10T21:21:53.7375413Z   type: 'test'
2026-10-10T21:21:53.7375783Z   ...
2026-10-10T21:21:53.7377626Z # Subtest: THE CATALOGUE IS DATA — the shipped models and practices are found in the module's list of its files, read from the disk in Node and from its own address in a browser
2026-10-10T21:21:53.7380441Z ok 357 - THE CATALOGUE IS DATA — the shipped models and practices are found in the module's list of its files, read from the disk in Node and from its own address in a browser
2026-10-10T21:21:53.7381772Z   ---
2026-10-10T21:21:53.7382197Z   duration_ms: 45.231102
2026-10-10T21:21:53.7382630Z   type: 'test'
2026-10-10T21:21:53.7382991Z   ...
2026-10-10T21:21:53.7383911Z # Subtest: switchOn asks the browser's permission only on the call, and a refusal stores nothing
2026-10-10T21:21:53.7385338Z ok 358 - switchOn asks the browser's permission only on the call, and a refusal stores nothing
2026-10-10T21:21:53.7386171Z   ---
2026-10-10T21:21:53.7386531Z   duration_ms: 3.028547
2026-10-10T21:21:53.7386941Z   type: 'test'
2026-10-10T21:21:53.7387314Z   ...
2026-10-10T21:21:53.7388186Z # Subtest: switchOff removes both notifications and notified, and unregisters the worker
2026-10-10T21:21:53.7389526Z ok 359 - switchOff removes both notifications and notified, and unregisters the worker
2026-10-10T21:21:53.7390330Z   ---
2026-10-10T21:21:53.7390685Z   duration_ms: 0.848286
2026-10-10T21:21:53.7391095Z   type: 'test'
2026-10-10T21:21:53.7391455Z   ...
2026-10-10T21:21:53.7392406Z # Subtest: the first check after Switch on notifies nothing, and only records what waits then
2026-10-10T21:21:53.7393897Z ok 360 - the first check after Switch on notifies nothing, and only records what waits then
2026-10-10T21:21:53.7394712Z   ---
2026-10-10T21:21:53.7395075Z   duration_ms: 7.997187
2026-10-10T21:21:53.7395490Z   type: 'test'
2026-10-10T21:21:53.7395851Z   ...
2026-10-10T21:21:53.7396817Z # Subtest: a file come to wait is notified once, with its text and address, and a file changed again anew
2026-10-10T21:21:53.7398314Z ok 361 - a file come to wait is notified once, with its text and address, and a file changed again anew
2026-10-10T21:21:53.7399174Z   ---
2026-10-10T21:21:53.7399529Z   duration_ms: 3.845584
2026-10-10T21:21:53.7399939Z   type: 'test'
2026-10-10T21:21:53.7400300Z   ...
2026-10-10T21:21:53.7401176Z # Subtest: more than three of one kind in one repository give one notification of their number
2026-10-10T21:21:53.7402590Z ok 362 - more than three of one kind in one repository give one notification of their number
2026-10-10T21:21:53.7403390Z   ---
2026-10-10T21:21:53.7403753Z   duration_ms: 1.786266
2026-10-10T21:21:53.7404167Z   type: 'test'
2026-10-10T21:21:53.7404524Z   ...
2026-10-10T21:21:53.7405274Z # Subtest: a repository that cannot be read is skipped until the next check
2026-10-10T21:21:53.7406389Z ok 363 - a repository that cannot be read is skipped until the next check
2026-10-10T21:21:53.7407086Z   ---
2026-10-10T21:21:53.7407440Z   duration_ms: 2.248593
2026-10-10T21:21:53.7407903Z   type: 'test'
2026-10-10T21:21:53.7408268Z   ...
2026-10-10T21:21:53.7410077Z # Subtest: participantsOf — this instance's register read into participants: a person without a model and a place, a CLI agent with its model and its place
2026-10-10T21:21:53.7412754Z ok 364 - participantsOf — this instance's register read into participants: a person without a model and a place, a CLI agent with its model and its place
2026-10-10T21:21:53.7414000Z   ---
2026-10-10T21:21:53.7414361Z   duration_ms: 4.191791
2026-10-10T21:21:53.7414775Z   type: 'test'
2026-10-10T21:21:53.7415132Z   ...
2026-10-10T21:21:53.7416167Z # Subtest: participantsOf — a row with a context and a price read into numbers and a currency
2026-10-10T21:21:53.7417626Z ok 365 - participantsOf — a row with a context and a price read into numbers and a currency
2026-10-10T21:21:53.7418442Z   ---
2026-10-10T21:21:53.7418795Z   duration_ms: 0.683666
2026-10-10T21:21:53.7419208Z   type: 'test'
2026-10-10T21:21:53.7419565Z   ...
2026-10-10T21:21:53.7420984Z # Subtest: eligible — given the participants read from a register, offers for a role exactly those with every capability it needs
2026-10-10T21:21:53.7423190Z ok 366 - eligible — given the participants read from a register, offers for a role exactly those with every capability it needs
2026-10-10T21:21:53.7424252Z   ---
2026-10-10T21:21:53.7424605Z   duration_ms: 0.582739
2026-10-10T21:21:53.7425017Z   type: 'test'
2026-10-10T21:21:53.7425374Z   ...
2026-10-10T21:21:53.7427138Z # Subtest: participantSchema — the register's schema is read from the module's own participants.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:21:53.7429852Z ok 367 - participantSchema — the register's schema is read from the module's own participants.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:21:53.7431143Z   ---
2026-10-10T21:21:53.7431507Z   duration_ms: 28.928765
2026-10-10T21:21:53.7431978Z   type: 'test'
2026-10-10T21:21:53.7432341Z   ...
2026-10-10T21:21:53.7433888Z # Subtest: participantSchema — this instance's register read into participants, each with its type, capabilities, processing place and model
2026-10-10T21:21:53.7436265Z ok 368 - participantSchema — this instance's register read into participants, each with its type, capabilities, processing place and model
2026-10-10T21:21:53.7437428Z   ---
2026-10-10T21:21:53.7437779Z   duration_ms: 0.827259
2026-10-10T21:21:53.7438188Z   type: 'test'
2026-10-10T21:21:53.7438554Z   ...
2026-10-10T21:21:53.7440120Z # Subtest: participantSchema — an entry of a type outside the five, and a participant based on a language model without its model, named as errors
2026-10-10T21:21:53.7442709Z ok 369 - participantSchema — an entry of a type outside the five, and a participant based on a language model without its model, named as errors
2026-10-10T21:21:53.7443686Z   ---
2026-10-10T21:21:53.7444005Z   duration_ms: 1.801863
2026-10-10T21:21:53.7444367Z   type: 'test'
2026-10-10T21:21:53.7444692Z   ...
2026-10-10T21:21:53.7445942Z # Subtest: eligible — offers for a role exactly the participants with every capability it needs, each with where it processes data
2026-10-10T21:21:53.7448132Z ok 370 - eligible — offers for a role exactly the participants with every capability it needs, each with where it processes data
2026-10-10T21:21:53.7449209Z   ---
2026-10-10T21:21:53.7449566Z   duration_ms: 0.257165
2026-10-10T21:21:53.7449992Z   type: 'test'
2026-10-10T21:21:53.7450356Z   ...
2026-10-10T21:21:53.7451857Z # Subtest: eligible — leaves out a participant whose processing place a restricted source does not allow, naming the place and the source
2026-10-10T21:21:53.7454577Z ok 371 - eligible — leaves out a participant whose processing place a restricted source does not allow, naming the place and the source
2026-10-10T21:21:53.7455711Z   ---
2026-10-10T21:21:53.7456079Z   duration_ms: 0.305966
2026-10-10T21:21:53.7456493Z   type: 'test'
2026-10-10T21:21:53.7456858Z   ...
2026-10-10T21:21:53.7457892Z # Subtest: TST-290101 settings schemas own the canonical product files and pseudonymisation defaults to on
2026-10-10T21:21:53.7459710Z ok 372 - TST-290101 settings schemas own the canonical product files and pseudonymisation defaults to on
2026-10-10T21:21:53.7460631Z   ---
2026-10-10T21:21:53.7460999Z   duration_ms: 7.629519
2026-10-10T21:21:53.7478120Z   type: 'test'
2026-10-10T21:21:53.7478616Z   ...
2026-10-10T21:21:53.7479313Z # Subtest: TST-290102 collaborators schema requires name, account and affirmative agreement
2026-10-10T21:21:53.7480511Z ok 373 - TST-290102 collaborators schema requires name, account and affirmative agreement
2026-10-10T21:21:53.7481373Z   ---
2026-10-10T21:21:53.7481740Z   duration_ms: 2.664873
2026-10-10T21:21:53.7482311Z   type: 'test'
2026-10-10T21:21:53.7482682Z   ...
2026-10-10T21:21:53.7484241Z # Subtest: declarationFindings — a holder that lacks a capability its role needs is an error, naming the holder, the role and the capability
2026-10-10T21:21:53.7486510Z ok 374 - declarationFindings — a holder that lacks a capability its role needs is an error, naming the holder, the role and the capability
2026-10-10T21:21:53.7487666Z   ---
2026-10-10T21:21:53.7488033Z   duration_ms: 7.781525
2026-10-10T21:21:53.7488452Z   type: 'test'
2026-10-10T21:21:53.7488813Z   ...
2026-10-10T21:21:53.7490767Z # Subtest: declarationFindings — a holder at a place a linked source does not permit is a warning naming the holder, the role and the source; a person holding a role is not warned of it
2026-10-10T21:21:53.7493907Z ok 375 - declarationFindings — a holder at a place a linked source does not permit is a warning naming the holder, the role and the source; a person holding a role is not warned of it
2026-10-10T21:21:53.7495325Z   ---
2026-10-10T21:21:53.7495686Z   duration_ms: 2.573081
2026-10-10T21:21:53.7496109Z   type: 'test'
2026-10-10T21:21:53.7496473Z   ...
2026-10-10T21:21:53.7498268Z # Subtest: declarationSchema — the declaration's schema is read from the module's own declaration.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:21:53.7501006Z ok 376 - declarationSchema — the declaration's schema is read from the module's own declaration.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:21:53.7502379Z   ---
2026-10-10T21:21:53.7502738Z   duration_ms: 33.162923
2026-10-10T21:21:53.7503163Z   type: 'test'
2026-10-10T21:21:53.7503534Z   ...
2026-10-10T21:21:53.7505265Z # Subtest: declarationSchema — a product's declaration read by its schema: front matter, roles with their participants, branches and the gates requirements add
2026-10-10T21:21:53.7508200Z ok 377 - declarationSchema — a product's declaration read by its schema: front matter, roles with their participants, branches and the gates requirements add
2026-10-10T21:21:53.7509476Z   ---
2026-10-10T21:21:53.7509834Z   duration_ms: 1.581683
2026-10-10T21:21:53.7510258Z   type: 'test'
2026-10-10T21:21:53.7510614Z   ...
2026-10-10T21:21:53.7512264Z # Subtest: declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding
2026-10-10T21:21:53.7514683Z ok 378 - declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding
2026-10-10T21:21:53.7515853Z   ---
2026-10-10T21:21:53.7516216Z   duration_ms: 1.458787
2026-10-10T21:21:53.7516643Z   type: 'test'
2026-10-10T21:21:53.7516965Z   ...
2026-10-10T21:21:53.7519006Z # Subtest: declarationFindings — the fixture product's declaration, against the catalogue at the commit it names, has no finding
2026-10-10T21:21:53.7521213Z ok 379 - declarationFindings — the fixture product's declaration, against the catalogue at the commit it names, has no finding
2026-10-10T21:21:53.7522387Z   ---
2026-10-10T21:21:53.7522757Z   duration_ms: 9.406351
2026-10-10T21:21:53.7523174Z   type: 'test'
2026-10-10T21:21:53.7523533Z   ...
2026-10-10T21:21:53.7524876Z # Subtest: declarationFindings — a model that the catalogue at the declared commit does not hold at model_file is an error
2026-10-10T21:21:53.7527041Z ok 380 - declarationFindings — a model that the catalogue at the declared commit does not hold at model_file is an error
2026-10-10T21:21:53.7528066Z   ---
2026-10-10T21:21:53.7528438Z   duration_ms: 1.95587
2026-10-10T21:21:53.7528848Z   type: 'test'
2026-10-10T21:21:53.7529211Z   ...
2026-10-10T21:21:53.7530551Z # Subtest: declarationFindings — a model whose findings in the catalogue at the declared commit hold an error is an error
2026-10-10T21:21:53.7532623Z ok 381 - declarationFindings — a model whose findings in the catalogue at the declared commit hold an error is an error
2026-10-10T21:21:53.7533663Z   ---
2026-10-10T21:21:53.7534020Z   duration_ms: 2.426918
2026-10-10T21:21:53.7534431Z   type: 'test'
2026-10-10T21:21:53.7534791Z   ...
2026-10-10T21:21:53.7535755Z # Subtest: declarationFindings — a role that needs a person and has none is an error
2026-10-10T21:21:53.7537159Z ok 382 - declarationFindings — a role that needs a person and has none is an error
2026-10-10T21:21:53.7537949Z   ---
2026-10-10T21:21:53.7538321Z   duration_ms: 4.110668
2026-10-10T21:21:53.7538738Z   type: 'test'
2026-10-10T21:21:53.7539094Z   ...
2026-10-10T21:21:53.7540048Z # Subtest: declarationFindings — a practice the catalogue does not hold is an error
2026-10-10T21:21:53.7541446Z ok 383 - declarationFindings — a practice the catalogue does not hold is an error
2026-10-10T21:21:53.7542357Z   ---
2026-10-10T21:21:53.7542713Z   duration_ms: 2.86821
2026-10-10T21:21:53.7543128Z   type: 'test'
2026-10-10T21:21:53.7543490Z   ...
2026-10-10T21:21:53.7544535Z # Subtest: declarationFindings — a practice whose fits does not name the model is an error
2026-10-10T21:21:53.7545989Z ok 384 - declarationFindings — a practice whose fits does not name the model is an error
2026-10-10T21:21:53.7546632Z   ---
2026-10-10T21:21:53.7546942Z   duration_ms: 2.547445
2026-10-10T21:21:53.7547338Z   type: 'test'
2026-10-10T21:21:53.7547700Z   ...
2026-10-10T21:21:53.7548654Z # Subtest: declarationFindings — a branch for a phase the model lacks is an error
2026-10-10T21:21:53.7550026Z ok 385 - declarationFindings — a branch for a phase the model lacks is an error
2026-10-10T21:21:53.7550799Z   ---
2026-10-10T21:21:53.7551154Z   duration_ms: 5.329033
2026-10-10T21:21:53.7551570Z   type: 'test'
2026-10-10T21:21:53.7552036Z   ...
2026-10-10T21:21:53.7553211Z # Subtest: declarationFindings — a gate whose requirement the instance's SPEC does not hold is an error
2026-10-10T21:21:53.7554946Z ok 386 - declarationFindings — a gate whose requirement the instance's SPEC does not hold is an error
2026-10-10T21:21:53.7556051Z   ---
2026-10-10T21:21:53.7556414Z   duration_ms: 5.405634
2026-10-10T21:21:53.7556839Z   type: 'test'
2026-10-10T21:21:53.7557204Z   ...
2026-10-10T21:21:53.7558860Z # Subtest: workflowOf — the model's phases, transitions, pairs and gates, and the gates the process requirements add, each with its requirement and source
2026-10-10T21:21:53.7561386Z ok 387 - workflowOf — the model's phases, transitions, pairs and gates, and the gates the process requirements add, each with its requirement and source
2026-10-10T21:21:53.7562720Z   ---
2026-10-10T21:21:53.7563077Z   duration_ms: 3.197372
2026-10-10T21:21:53.7563491Z   type: 'test'
2026-10-10T21:21:53.7563848Z   ...
2026-10-10T21:21:53.7565640Z # Subtest: workflowOf — nothing else enters the workflow: a declared practice adds nothing, and a gate whose requirement the SPEC does not hold stays without a source
2026-10-10T21:21:53.7568407Z ok 388 - workflowOf — nothing else enters the workflow: a declared practice adds nothing, and a gate whose requirement the SPEC does not hold stays without a source
2026-10-10T21:21:53.7569737Z   ---
2026-10-10T21:21:53.7570096Z   duration_ms: 2.410413
2026-10-10T21:21:53.7570503Z   type: 'test'
2026-10-10T21:21:53.7570864Z   ...
2026-10-10T21:21:53.7572446Z # Subtest: workflowOf — an explicitly tabled practice adds its phase, artifact, role and marked gate beside the model and requirement gates
2026-10-10T21:21:53.7574751Z ok 389 - workflowOf — an explicitly tabled practice adds its phase, artifact, role and marked gate beside the model and requirement gates
2026-10-10T21:21:53.7575976Z   ---
2026-10-10T21:21:53.7576326Z   duration_ms: 1.616443
2026-10-10T21:21:53.7576732Z   type: 'test'
2026-10-10T21:21:53.7577087Z   ...
2026-10-10T21:21:53.7578387Z # Subtest: workflowOf — a valid practice gate table directly under Adds enters the workflow without an invented heading
2026-10-10T21:21:53.7580357Z ok 390 - workflowOf — a valid practice gate table directly under Adds enters the workflow without an invented heading
2026-10-10T21:21:53.7581368Z   ---
2026-10-10T21:21:53.7581715Z   duration_ms: 1.231343
2026-10-10T21:21:53.7582183Z   type: 'test'
2026-10-10T21:21:53.7582540Z   ...
2026-10-10T21:21:53.7583665Z # Subtest: workflowOf — the job rules are the Definition of Done when the declaration adds no condition
2026-10-10T21:21:53.7585320Z ok 391 - workflowOf — the job rules are the Definition of Done when the declaration adds no condition
2026-10-10T21:21:53.7586195Z   ---
2026-10-10T21:21:53.7586555Z   duration_ms: 1.73871
2026-10-10T21:21:53.7586957Z   type: 'test'
2026-10-10T21:21:53.7587311Z   ...
2026-10-10T21:21:53.7588380Z # Subtest: workflowOf — a practice phase drops its Produces explanation as the model reader does
2026-10-10T21:21:53.7589956Z ok 392 - workflowOf — a practice phase drops its Produces explanation as the model reader does
2026-10-10T21:21:53.7590804Z   ---
2026-10-10T21:21:53.7591154Z   duration_ms: 1.737873
2026-10-10T21:21:53.7591560Z   type: 'test'
2026-10-10T21:21:53.7591993Z   ...
2026-10-10T21:21:53.7593016Z # Subtest: workflowOf — consecutive bare phase and role tables do not cross into each other
2026-10-10T21:21:53.7594511Z ok 393 - workflowOf — consecutive bare phase and role tables do not cross into each other
2026-10-10T21:21:53.7595331Z   ---
2026-10-10T21:21:53.7595684Z   duration_ms: 2.039315
2026-10-10T21:21:53.7596098Z   type: 'test'
2026-10-10T21:21:53.7596458Z   ...
2026-10-10T21:21:53.7598153Z # Subtest: waitingForAcceptance — an open SPEC entry, an open use case and a changed module wait; an accepted decision, an approved and an in-SPEC entry do not
2026-10-10T21:21:53.7600770Z ok 394 - waitingForAcceptance — an open SPEC entry, an open use case and a changed module wait; an accepted decision, an approved and an in-SPEC entry do not
2026-10-10T21:21:53.7602087Z   ---
2026-10-10T21:21:53.7602444Z   duration_ms: 4.348521
2026-10-10T21:21:53.7602857Z   type: 'test'
2026-10-10T21:21:53.7603215Z   ...
2026-10-10T21:21:53.7604711Z # Subtest: waitingForAcceptance — an open architecture decision and a changed use case wait, with no SPEC change queue in the repository
2026-10-10T21:21:53.7607135Z ok 395 - waitingForAcceptance — an open architecture decision and a changed use case wait, with no SPEC change queue in the repository
2026-10-10T21:21:53.7608325Z   ---
2026-10-10T21:21:53.7608687Z   duration_ms: 0.440498
2026-10-10T21:21:53.7609096Z   type: 'test'
2026-10-10T21:21:53.7609455Z   ...
2026-10-10T21:21:53.7610306Z # Subtest: waitingForAcceptance — an empty repository waits for nothing
2026-10-10T21:21:53.7611535Z ok 396 - waitingForAcceptance — an empty repository waits for nothing
2026-10-10T21:21:53.7612310Z   ---
2026-10-10T21:21:53.7612662Z   duration_ms: 0.150911
2026-10-10T21:21:53.7613074Z   type: 'test'
2026-10-10T21:21:53.7613437Z   ...
2026-10-10T21:21:53.7614450Z # Subtest: waitingForAcceptance — a completed candidate run adds its release test report
2026-10-10T21:21:53.7615938Z ok 397 - waitingForAcceptance — a completed candidate run adds its release test report
2026-10-10T21:21:53.7616764Z   ---
2026-10-10T21:21:53.7616935Z   duration_ms: 1.347138
2026-10-10T21:21:53.7617101Z   type: 'test'
2026-10-10T21:21:53.7617254Z   ...
2026-10-10T21:21:53.7617970Z # Subtest: nextVersion — a minor step by default, from the product's own release tags only
2026-10-10T21:21:53.7618756Z ok 398 - nextVersion — a minor step by default, from the product's own release tags only
2026-10-10T21:21:53.7618914Z   ---
2026-10-10T21:21:53.7619084Z   duration_ms: 1.248982
2026-10-10T21:21:53.7619351Z   type: 'test'
2026-10-10T21:21:53.7619504Z   ...
2026-10-10T21:21:53.7620168Z # Subtest: nextVersion — a patch step keeps the minor and steps the patch
2026-10-10T21:21:53.7620810Z ok 399 - nextVersion — a patch step keeps the minor and steps the patch
2026-10-10T21:21:53.7620957Z   ---
2026-10-10T21:21:53.7621133Z   duration_ms: 0.196674
2026-10-10T21:21:53.7621298Z   type: 'test'
2026-10-10T21:21:53.7621445Z   ...
2026-10-10T21:21:53.7622218Z # Subtest: nextVersion — YYYY.1.0 in a new year, whatever step is asked (1a)
2026-10-10T21:21:53.7622894Z ok 400 - nextVersion — YYYY.1.0 in a new year, whatever step is asked (1a)
2026-10-10T21:21:53.7623043Z   ---
2026-10-10T21:21:53.7623223Z   duration_ms: 0.129933
2026-10-10T21:21:53.7623380Z   type: 'test'
2026-10-10T21:21:53.7623535Z   ...
2026-10-10T21:21:53.7624235Z # Subtest: nextVersion — a product with no release tag yet starts at YYYY.1.0
2026-10-10T21:21:53.7624898Z ok 401 - nextVersion — a product with no release tag yet starts at YYYY.1.0
2026-10-10T21:21:53.7625068Z   ---
2026-10-10T21:21:53.7625246Z   duration_ms: 0.097017
2026-10-10T21:21:53.7625405Z   type: 'test'
2026-10-10T21:21:53.7625559Z   ...
2026-10-10T21:21:53.7626839Z # Subtest: startReleaseCandidate — the next free N, and the complete run queued with the candidate's version, tag and changelog entry
2026-10-10T21:21:53.7628079Z ok 402 - startReleaseCandidate — the next free N, and the complete run queued with the candidate's version, tag and changelog entry
2026-10-10T21:21:53.7628249Z   ---
2026-10-10T21:21:53.7628428Z   duration_ms: 6.046762
2026-10-10T21:21:53.7628586Z   type: 'test'
2026-10-10T21:21:53.7628741Z   ...
2026-10-10T21:21:53.7629563Z # Subtest: startReleaseCandidate — the next free N is the greatest existing one plus one
2026-10-10T21:21:53.7630367Z ok 403 - startReleaseCandidate — the next free N is the greatest existing one plus one
2026-10-10T21:21:53.7630522Z   ---
2026-10-10T21:21:53.7630696Z   duration_ms: 1.861289
2026-10-10T21:21:53.7630873Z   type: 'test'
2026-10-10T21:21:53.7631036Z   ...
2026-10-10T21:21:53.7631808Z # Subtest: startReleaseCandidate — TagExists propagates from the host's createTag
2026-10-10T21:21:53.7632600Z ok 404 - startReleaseCandidate — TagExists propagates from the host's createTag
2026-10-10T21:21:53.7632751Z   ---
2026-10-10T21:21:53.7632934Z   duration_ms: 1.27776
2026-10-10T21:21:53.7633100Z   type: 'test'
2026-10-10T21:21:53.7633247Z   ...
2026-10-10T21:21:53.7634207Z # Subtest: startReleaseCandidate — NoRunner naming a person-run level the schedule names no one for
2026-10-10T21:21:53.7635243Z ok 405 - startReleaseCandidate — NoRunner naming a person-run level the schedule names no one for
2026-10-10T21:21:53.7635397Z   ---
2026-10-10T21:21:53.7635575Z   duration_ms: 0.846917
2026-10-10T21:21:53.7635740Z   type: 'test'
2026-10-10T21:21:53.7635887Z   ...
2026-10-10T21:21:53.7637055Z # Subtest: startReleaseCandidate — NoRunner naming "release" where only the implementer could run the release tests (2a)
2026-10-10T21:21:53.7638286Z ok 406 - startReleaseCandidate — NoRunner naming "release" where only the implementer could run the release tests (2a)
2026-10-10T21:21:53.7638479Z   ---
2026-10-10T21:21:53.7638686Z   duration_ms: 1.659537
2026-10-10T21:21:53.7638852Z   type: 'test'
2026-10-10T21:21:53.7639039Z   ...
2026-10-10T21:21:53.7640297Z # Subtest: startReleaseCandidate — no NoRunner where the release row's runner differs from every recorded implementer
2026-10-10T21:21:53.7641461Z ok 407 - startReleaseCandidate — no NoRunner where the release row's runner differs from every recorded implementer
2026-10-10T21:21:53.7641659Z   ---
2026-10-10T21:21:53.7641845Z   duration_ms: 1.47968
2026-10-10T21:21:53.7642109Z   type: 'test'
2026-10-10T21:21:53.7642264Z   ...
2026-10-10T21:21:53.7643269Z # Subtest: releaseReport — its parts in the module's own order, Limitations first, complete and green
2026-10-10T21:21:53.7644248Z ok 408 - releaseReport — its parts in the module's own order, Limitations first, complete and green
2026-10-10T21:21:53.7644508Z   ---
2026-10-10T21:21:53.7644723Z   duration_ms: 7.031149
2026-10-10T21:21:53.7644900Z   type: 'test'
2026-10-10T21:21:53.7645092Z   ...
2026-10-10T21:21:53.7646013Z # Subtest: releaseReport — incomplete while a test has not run on the candidate's commit
2026-10-10T21:21:53.7646875Z ok 409 - releaseReport — incomplete while a test has not run on the candidate's commit
2026-10-10T21:21:53.7647058Z   ---
2026-10-10T21:21:53.7647255Z   duration_ms: 1.127603
2026-10-10T21:21:53.7647459Z   type: 'test'
2026-10-10T21:21:53.7647602Z   ...
2026-10-10T21:21:53.7648749Z # Subtest: releaseReport — a worse model-dependent rate is read against the last release's commit, found in the report `at` already holds
2026-10-10T21:21:53.7650197Z ok 410 - releaseReport — a worse model-dependent rate is read against the last release's commit, found in the report `at` already holds
2026-10-10T21:21:53.7650374Z   ---
2026-10-10T21:21:53.7650575Z   duration_ms: 3.782075
2026-10-10T21:21:53.7650781Z   type: 'test'
2026-10-10T21:21:53.7650932Z   ...
2026-10-10T21:21:53.7652940Z # Subtest: acceptAndRelease — one commit of the report, its approval record and the changelog entry, then the tag on the candidate's own commit, also when the default branch moved on (4b)
2026-10-10T21:21:53.7654498Z ok 411 - acceptAndRelease — one commit of the report, its approval record and the changelog entry, then the tag on the candidate's own commit, also when the default branch moved on (4b)
2026-10-10T21:21:53.7654622Z   ---
2026-10-10T21:21:53.7654833Z   duration_ms: 14.121305
2026-10-10T21:21:53.7654976Z   type: 'test'
2026-10-10T21:21:53.7655084Z   ...
2026-10-10T21:21:53.7655972Z # Subtest: acceptAndRelease — LimitationMissing naming each failing test and worse rate without its reason (3a, 3b)
2026-10-10T21:21:53.7657221Z ok 412 - acceptAndRelease — LimitationMissing naming each failing test and worse rate without its reason (3a, 3b)
2026-10-10T21:21:53.7657376Z   ---
2026-10-10T21:21:53.7657557Z   duration_ms: 12.200631
2026-10-10T21:21:53.7657732Z   type: 'test'
2026-10-10T21:21:53.7657889Z   ...
2026-10-10T21:21:53.7658857Z # Subtest: acceptAndRelease — resolves once every failing test and worse rate has its reason recorded
2026-10-10T21:21:53.7659773Z ok 413 - acceptAndRelease — resolves once every failing test and worse rate has its reason recorded
2026-10-10T21:21:53.7659934Z   ---
2026-10-10T21:21:53.7660117Z   duration_ms: 3.538323
2026-10-10T21:21:53.7660276Z   type: 'test'
2026-10-10T21:21:53.7660431Z   ...
2026-10-10T21:21:53.7661442Z # Subtest: acceptAndRelease — Incomplete while a test has not run on the candidate's commit
2026-10-10T21:21:53.7662354Z ok 414 - acceptAndRelease — Incomplete while a test has not run on the candidate's commit
2026-10-10T21:21:53.7662512Z   ---
2026-10-10T21:21:53.7662684Z   duration_ms: 3.445855
2026-10-10T21:21:53.7662852Z   type: 'test'
2026-10-10T21:21:53.7663006Z   ...
2026-10-10T21:21:53.7664048Z # Subtest: acceptAndRelease — TagExists, an existing tag not moved (4a)
2026-10-10T21:21:53.7664704Z ok 415 - acceptAndRelease — TagExists, an existing tag not moved (4a)
2026-10-10T21:21:53.7664859Z   ---
2026-10-10T21:21:53.7665029Z   duration_ms: 5.379145
2026-10-10T21:21:53.7665196Z   type: 'test'
2026-10-10T21:21:53.7665343Z   ...
2026-10-10T21:21:53.7666469Z # Subtest: reportsAwaitingAcceptance — a candidate's complete run waits, but an unfinished or accepted one does not
2026-10-10T21:21:53.7667566Z ok 416 - reportsAwaitingAcceptance — a candidate's complete run waits, but an unfinished or accepted one does not
2026-10-10T21:21:53.7667726Z   ---
2026-10-10T21:21:53.7667904Z   duration_ms: 1.59808
2026-10-10T21:21:53.7668069Z   type: 'test'
2026-10-10T21:21:53.7668217Z   ...
2026-10-10T21:21:53.7669056Z # Subtest: reportsAwaitingAcceptance — calendar version 2026.10.0 is newer than 2026.9.0
2026-10-10T21:21:53.7669867Z ok 417 - reportsAwaitingAcceptance — calendar version 2026.10.0 is newer than 2026.9.0
2026-10-10T21:21:53.7670015Z   ---
2026-10-10T21:21:53.7670193Z   duration_ms: 0.61273
2026-10-10T21:21:53.7670522Z   type: 'test'
2026-10-10T21:21:53.7670676Z   ...
2026-10-10T21:21:53.7671120Z # {"method":"GET","path":"/v1/pair","status":200,"duration":7}
2026-10-10T21:21:53.7671679Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":2}
2026-10-10T21:21:53.7672688Z # Subtest: TST-263901: public pair and endpoint-test traverse the paired loopback Bridge without URL credentials
2026-10-10T21:21:53.7673556Z ok 418 - TST-263901: public pair and endpoint-test traverse the paired loopback Bridge without URL credentials
2026-10-10T21:21:53.7673715Z   ---
2026-10-10T21:21:53.7673894Z   duration_ms: 79.017584
2026-10-10T21:21:53.7674066Z   type: 'test'
2026-10-10T21:21:53.7674213Z   ...
2026-10-10T21:21:53.7674646Z # {"method":"GET","path":"/v1/pair","status":200,"duration":0}
2026-10-10T21:21:53.7675203Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":2}
2026-10-10T21:21:53.7675860Z # Subtest: TST-263902: public pair and probe name both fetch and response-body timeouts
2026-10-10T21:21:53.7676496Z ok 419 - TST-263902: public pair and probe name both fetch and response-body timeouts
2026-10-10T21:21:53.7676644Z   ---
2026-10-10T21:21:53.7676827Z   duration_ms: 19.454709
2026-10-10T21:21:53.7676994Z   type: 'test'
2026-10-10T21:21:53.7677142Z   ...
2026-10-10T21:21:53.7677993Z # Subtest: TST-268901: real public compose pairs before dispatch and unwraps one controlled endpoint answer
2026-10-10T21:21:53.7678819Z ok 420 - TST-268901: real public compose pairs before dispatch and unwraps one controlled endpoint answer
2026-10-10T21:21:53.7678974Z   ---
2026-10-10T21:21:53.7679162Z   duration_ms: 83.461674
2026-10-10T21:21:53.7679327Z   type: 'test'
2026-10-10T21:21:53.7679473Z   ...
2026-10-10T21:21:53.7680040Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":13}
2026-10-10T21:21:53.7680771Z # Subtest: TST-269901: Route persists, shows, and clears an endpoint through the composed Bridge
2026-10-10T21:21:53.7681513Z ok 421 - TST-269901: Route persists, shows, and clears an endpoint through the composed Bridge
2026-10-10T21:21:53.7681676Z   ---
2026-10-10T21:21:53.7681844Z   duration_ms: 63.051925
2026-10-10T21:21:53.7682089Z   type: 'test'
2026-10-10T21:21:53.7682246Z   ...
2026-10-10T21:21:53.7682796Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":5}
2026-10-10T21:21:53.7683527Z # Subtest: TST-269902: Route preserves provider refusal and saved endpoint through real Bridge
2026-10-10T21:21:53.7684319Z ok 422 - TST-269902: Route preserves provider refusal and saved endpoint through real Bridge
2026-10-10T21:21:53.7684466Z   ---
2026-10-10T21:21:53.7684643Z   duration_ms: 24.78395
2026-10-10T21:21:53.7684800Z   type: 'test'
2026-10-10T21:21:53.7684955Z   ...
2026-10-10T21:21:53.7685710Z # Subtest: TST-269903: absent pairing stores endpoint and emits setup contract without fallback
2026-10-10T21:21:53.7686413Z ok 423 - TST-269903: absent pairing stores endpoint and emits setup contract without fallback
2026-10-10T21:21:53.7686572Z   ---
2026-10-10T21:21:53.7686749Z   duration_ms: 3.122775
2026-10-10T21:21:53.7686908Z   type: 'test'
2026-10-10T21:21:53.7687066Z   ...
2026-10-10T21:21:53.7687890Z # Subtest: TST-269904: Route maps configured HTTPS credentials and names refused/unavailable Bridge
2026-10-10T21:21:53.7688632Z ok 424 - TST-269904: Route maps configured HTTPS credentials and names refused/unavailable Bridge
2026-10-10T21:21:53.7688785Z   ---
2026-10-10T21:21:53.7688952Z   duration_ms: 5.027635
2026-10-10T21:21:53.7689121Z   type: 'test'
2026-10-10T21:21:53.7689273Z   ...
2026-10-10T21:21:53.7690137Z # Subtest: TST-275001: the release Bridge frame keeps configured identity and routes without repository writes
2026-10-10T21:21:53.7690980Z ok 425 - TST-275001: the release Bridge frame keeps configured identity and routes without repository writes
2026-10-10T21:21:53.7691133Z   ---
2026-10-10T21:21:53.7691300Z   duration_ms: 3.570921
2026-10-10T21:21:53.7691464Z   type: 'test'
2026-10-10T21:21:53.7691704Z   ...
2026-10-10T21:21:53.7692630Z # Subtest: TST-275002: the release frame explains pairing and keeps each confirmation to one person decision
2026-10-10T21:21:53.7693453Z ok 426 - TST-275002: the release frame explains pairing and keeps each confirmation to one person decision
2026-10-10T21:21:53.7693599Z   ---
2026-10-10T21:21:53.7693777Z   duration_ms: 1.281031
2026-10-10T21:21:53.7693941Z   type: 'test'
2026-10-10T21:21:53.7694086Z   ...
2026-10-10T21:21:53.7695866Z # native-fixture {"stage":"Electron package acquisition","status":0,"signal":null,"error":null,"stdout":"\\nadded 13 packages in 849ms\\n\\n1 package is looking for funding\\n  run `npm fund` for details\\n","stderr":""}
2026-10-10T21:21:53.7696801Z # native-fixture {"stage":"Electron binary acquisition","status":0,"signal":null,"error":null,"stdout":"","stderr":""}
2026-10-10T21:21:53.7706498Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:53.7707671Z # native-fixture {"stage":"Linux Openbox initial probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7733213Z # native-fixture {"stage":"Linux Openbox diagnostic plan","status":0,"signal":null,"error":null,"elapsedMs":505,"stdout":"Reading package lists...\\nBuilding dependency tree...\\nReading state information...\\nThe following additional packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 poppler-data xfonts-encodings\\n  xfonts-utils\\nSuggested packages:\\n  fonts-freefont-otf | fonts-freefont-ttf fonts-texgyre librsvg2-bin tint2\\n  openbox-gnome-session openbox-kde-session poppler-utils ghostscript\\n  fonts-japanese-mincho | fonts-ipafont-mincho fonts-japanese-gothic\\n  | fonts-ipafont-gothic fonts-arphic-ukai fonts-arphic-uming fonts-nanum\\nRecommended packages:\\n  fonts-droid-fallback libpaper-utils librsvg2-common obconf | obconf-qt scrot\\nThe following NEW packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 openbox poppler-data xfonts-encodings\\n  xfonts-utils\\n0 upgraded, 24 newly installed, 0 to remove and 6 not upgraded.\\nNeed to get 0 B/22.9 MB of archives.\\nAfter this operation, 75.6 MB of additional disk space will be used.\\n","stderr":"","packages":[],"mirrors":[],"observation":"unparseable-print-uris"}
2026-10-10T21:21:53.7736079Z # native-fixture {"stage":"Linux Openbox install","status":100,"signal":null,"error":null,"stdout":"","stderr":"E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 2917 (apt-get)\\nE: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?\\n"}
2026-10-10T21:21:53.7737280Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7738395Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7739505Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7740608Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7741700Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7742895Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7744003Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7745102Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7746206Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7747310Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:21:53.7750154Z # native-fixture {"stage":"Linux Openbox ready probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:53.7751240Z # native-fixture {"stage":"ready","electron":"44.5.1","executable":"/tmp/agent-m-276-release-electron-44/node_modules/electron/dist/electron"}
2026-10-10T21:21:53.7791004Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:21:53.7795447Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:21:53.7797293Z # Subtest: TST-276901: actual forked Electron source keeps its renderer private and pairs only on configured loopback
2026-10-10T21:21:53.7798667Z ok 427 - TST-276901: actual forked Electron source keeps its renderer private and pairs only on configured loopback
2026-10-10T21:21:53.7798888Z   ---
2026-10-10T21:21:53.7799179Z   duration_ms: 1495.353266
2026-10-10T21:21:53.7799447Z   type: 'test'
2026-10-10T21:21:53.7799656Z   ...
2026-10-10T21:21:53.7800296Z # {"method":"GET","path":"/v1/pair","status":200,"duration":3}
2026-10-10T21:21:53.7801590Z # Subtest: TST-280901: public Settings pairs a real Bridge, reloads through Change, and clears raw browser storage
2026-10-10T21:21:53.7813010Z ok 428 - TST-280901: public Settings pairs a real Bridge, reloads through Change, and clears raw browser storage
2026-10-10T21:21:53.7813207Z   ---
2026-10-10T21:21:53.7813388Z   duration_ms: 648.091801
2026-10-10T21:21:53.7813560Z   type: 'test'
2026-10-10T21:21:53.7813707Z   ...
2026-10-10T21:21:53.7814151Z # {"method":"GET","path":"/v1/pair","status":401,"duration":1}
2026-10-10T21:21:53.7814963Z # Subtest: TST-280902: failures do not pair, while configured HTTPS storage stays separate and untested
2026-10-10T21:21:53.7815730Z ok 429 - TST-280902: failures do not pair, while configured HTTPS storage stays separate and untested
2026-10-10T21:21:53.7815893Z   ---
2026-10-10T21:21:53.7816075Z   duration_ms: 558.685899
2026-10-10T21:21:53.7816236Z   type: 'test'
2026-10-10T21:21:53.7816395Z   ...
2026-10-10T21:21:53.7817225Z # Subtest: TST-282901: public canonical plans allocate, command and proxy each configured Bridge session
2026-10-10T21:21:53.7818016Z ok 430 - TST-282901: public canonical plans allocate, command and proxy each configured Bridge session
2026-10-10T21:21:53.7818173Z   ---
2026-10-10T21:21:53.7818354Z   duration_ms: 2.436487
2026-10-10T21:21:53.7818517Z   type: 'test'
2026-10-10T21:21:53.7818676Z   ...
2026-10-10T21:21:53.7819438Z # Subtest: TST-283901: public canonical export isolates, locks, imports and clears Bridge setup settings
2026-10-10T21:21:53.7820233Z ok 431 - TST-283901: public canonical export isolates, locks, imports and clears Bridge setup settings
2026-10-10T21:21:53.7820388Z   ---
2026-10-10T21:21:53.7820563Z   duration_ms: 879.963185
2026-10-10T21:21:53.7820731Z   type: 'test'
2026-10-10T21:21:53.7820891Z   ...
2026-10-10T21:21:53.7821688Z # Subtest: TST-284901: public ensureKey exposes only matching public Bridge key data
2026-10-10T21:21:53.7829870Z ok 432 - TST-284901: public ensureKey exposes only matching public Bridge key data
2026-10-10T21:21:53.7830046Z   ---
2026-10-10T21:21:53.7830212Z   duration_ms: 5485.683426
2026-10-10T21:21:53.7830430Z   type: 'test'
2026-10-10T21:21:53.7830627Z   ...
2026-10-10T21:21:53.7831783Z # Subtest: TST-284902: public ensureKey keeps the exact owner-only pair across Node children
2026-10-10T21:21:53.7832965Z ok 433 - TST-284902: public ensureKey keeps the exact owner-only pair across Node children
2026-10-10T21:21:53.7833126Z   ---
2026-10-10T21:21:53.7833322Z   duration_ms: 815.570344
2026-10-10T21:21:53.7833498Z   type: 'test'
2026-10-10T21:21:53.7833646Z   ...
2026-10-10T21:21:53.7834436Z # Subtest: TST-284903: public ensureKey refuses an unwritable supplied folder without creating a key
2026-10-10T21:21:53.7835201Z ok 434 - TST-284903: public ensureKey refuses an unwritable supplied folder without creating a key
2026-10-10T21:21:53.7835354Z   ---
2026-10-10T21:21:53.7835535Z   duration_ms: 206.543985
2026-10-10T21:21:53.7835694Z   type: 'test'
2026-10-10T21:21:53.7835854Z   ...
2026-10-10T21:21:53.7836320Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":10}
2026-10-10T21:21:53.7836976Z # Subtest: TST-285901: the public tunnel-state route returns only supplied exact states
2026-10-10T21:21:53.7837610Z ok 435 - TST-285901: the public tunnel-state route returns only supplied exact states
2026-10-10T21:21:53.7837918Z   ---
2026-10-10T21:21:53.7838090Z   duration_ms: 111.364247
2026-10-10T21:21:53.7838260Z   type: 'test'
2026-10-10T21:21:53.7838417Z   ...
2026-10-10T21:21:53.7838861Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":0}
2026-10-10T21:21:53.7839312Z # {"method":"GET","path":"/v1/tunnels","status":404,"duration":0}
2026-10-10T21:21:53.7839751Z # {"method":"GET","path":"/v1/tunnels","status":422,"duration":1}
2026-10-10T21:21:53.7840200Z # {"method":"GET","path":"/v1/tunnels","status":502,"duration":1}
2026-10-10T21:21:53.7840943Z # Subtest: TST-285902: supplied tunnel handler absence and failures keep their public meanings
2026-10-10T21:21:53.7841635Z ok 436 - TST-285902: supplied tunnel handler absence and failures keep their public meanings
2026-10-10T21:21:53.7841795Z   ---
2026-10-10T21:21:53.7842058Z   duration_ms: 41.048615
2026-10-10T21:21:53.7842223Z   type: 'test'
2026-10-10T21:21:53.7842380Z   ...
2026-10-10T21:21:53.7842877Z # {"method":"OPTIONS","path":"/v1/tunnels","status":204,"duration":0}
2026-10-10T21:21:53.7843323Z # {"method":"GET","path":"/v1/tunnels","status":403,"duration":0}
2026-10-10T21:21:53.7843772Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":2}
2026-10-10T21:21:53.7844219Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":2}
2026-10-10T21:21:53.7844657Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":7}
2026-10-10T21:21:53.7845384Z # Subtest: TST-285903: tunnel state preserves origin, preflight, and current-token boundaries
2026-10-10T21:21:53.7846075Z ok 437 - TST-285903: tunnel state preserves origin, preflight, and current-token boundaries
2026-10-10T21:21:53.7846232Z   ---
2026-10-10T21:21:53.7846413Z   duration_ms: 51.675167
2026-10-10T21:21:53.7846576Z   type: 'test'
2026-10-10T21:21:53.7846738Z   ...
2026-10-10T21:21:53.7847185Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":2}
2026-10-10T21:21:53.7847740Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":503,"duration":2}
2026-10-10T21:21:53.7848365Z # Subtest: TST-285904: pause leaves tunnel state readable and retains work refusal
2026-10-10T21:21:53.7848959Z ok 438 - TST-285904: pause leaves tunnel state readable and retains work refusal
2026-10-10T21:21:53.7849106Z   ---
2026-10-10T21:21:53.7849288Z   duration_ms: 28.44302
2026-10-10T21:21:53.7849447Z   type: 'test'
2026-10-10T21:21:53.7849606Z   ...
2026-10-10T21:21:53.7850297Z # Subtest: TST-285905: tunnel-state logging excludes request credentials and handler data
2026-10-10T21:21:53.7851074Z ok 439 - TST-285905: tunnel-state logging excludes request credentials and handler data
2026-10-10T21:21:53.7851211Z   ---
2026-10-10T21:21:53.7851392Z   duration_ms: 5.892637
2026-10-10T21:21:53.7851551Z   type: 'test'
2026-10-10T21:21:53.7851711Z   ...
2026-10-10T21:21:56.8306802Z # Subtest: TST-286901: public ensureKey persists a real matching Ed25519 pair in a fresh private folder
2026-10-10T21:21:56.8308685Z ok 440 - TST-286901: public ensureKey persists a real matching Ed25519 pair in a fresh private folder
2026-10-10T21:21:56.8309540Z   ---
2026-10-10T21:21:56.8310018Z   duration_ms: 5735.411192
2026-10-10T21:21:56.8310523Z   type: 'test'
2026-10-10T21:21:56.8310856Z   ...
2026-10-10T21:21:56.8316528Z # Subtest: TST-286902: reverse runtime bytes and the authenticated public state handler share the actual open tunnel
2026-10-10T21:21:56.8318178Z ok 441 - TST-286902: reverse runtime bytes and the authenticated public state handler share the actual open tunnel
2026-10-10T21:21:56.8319076Z   ---
2026-10-10T21:21:56.8319458Z   duration_ms: 884.395074
2026-10-10T21:21:56.8319931Z   type: 'test'
2026-10-10T21:21:56.8320395Z   ...
2026-10-10T21:21:56.8321685Z # Subtest: TST-286903: forward runtime keeps loopback, host-key, and keepalive boundaries while carrying bytes
2026-10-10T21:21:56.8325566Z ok 442 - TST-286903: forward runtime keeps loopback, host-key, and keepalive boundaries while carrying bytes
2026-10-10T21:21:56.8326373Z   ---
2026-10-10T21:21:56.8326938Z   duration_ms: 688.147934
2026-10-10T21:21:56.8327331Z   type: 'test'
2026-10-10T21:21:56.8327655Z   ...
2026-10-10T21:21:56.8328532Z # Subtest: TST-286904: public runtime isolates failures, grows reconnect waits, and stops reconnecting after close
2026-10-10T21:21:56.8330872Z ok 443 - TST-286904: public runtime isolates failures, grows reconnect waits, and stops reconnecting after close
2026-10-10T21:21:56.8331389Z   ---
2026-10-10T21:21:56.8331583Z   duration_ms: 1345.088845
2026-10-10T21:21:56.8331806Z   type: 'test'
2026-10-10T21:21:56.8332185Z   ...
2026-10-10T21:21:56.8407166Z # Subtest: TST-287901: public Bridge route persists and renders canonical remote-session setup
2026-10-10T21:21:56.8418925Z ok 444 - TST-287901: public Bridge route persists and renders canonical remote-session setup
2026-10-10T21:21:56.8419863Z   ---
2026-10-10T21:21:56.8420306Z   duration_ms: 11.202302
2026-10-10T21:21:56.8420795Z   type: 'test'
2026-10-10T21:21:56.8421170Z   ...
2026-10-10T21:21:56.8422118Z # Subtest: TST-288901: public Settings exports and imports every implemented setting
2026-10-10T21:21:56.8423301Z ok 445 - TST-288901: public Settings exports and imports every implemented setting
2026-10-10T21:21:56.8423974Z   ---
2026-10-10T21:21:56.8424307Z   duration_ms: 586.817557
2026-10-10T21:21:56.8424678Z   type: 'test'
2026-10-10T21:21:56.8424992Z   ...
2026-10-10T21:21:56.8425833Z # Subtest: TST-289901: public Release route reopens controlled pending report without opening writes
2026-10-10T21:21:56.8427195Z ok 446 - TST-289901: public Release route reopens controlled pending report without opening writes
2026-10-10T21:21:56.8427984Z   ---
2026-10-10T21:21:56.8428339Z   duration_ms: 30.501391
2026-10-10T21:21:56.8428775Z   type: 'test'
2026-10-10T21:21:56.8429112Z   ...
2026-10-10T21:21:56.8430088Z # Subtest: TST-290105: canonical product settings retain unrelated text and switch pseudonymisation off only explicitly
2026-10-10T21:21:56.8431663Z ok 447 - TST-290105: canonical product settings retain unrelated text and switch pseudonymisation off only explicitly
2026-10-10T21:21:56.8432804Z   ---
2026-10-10T21:21:56.8433144Z   duration_ms: 2.861094
2026-10-10T21:21:56.8433530Z   type: 'test'
2026-10-10T21:21:56.8433858Z   ...
2026-10-10T21:21:56.8434734Z # Subtest: TST-290106: canonical collaborator consent is represented in a retained product register
2026-10-10T21:21:56.8436077Z ok 448 - TST-290106: canonical collaborator consent is represented in a retained product register
2026-10-10T21:21:56.8436904Z   ---
2026-10-10T21:21:56.8437529Z   duration_ms: 1.716066
2026-10-10T21:21:56.8437931Z   type: 'test'
2026-10-10T21:21:56.8438282Z   ...
2026-10-10T21:21:56.8439229Z # Subtest: TST-290107: public clearEverything removes all raw instance storage without crossing prefixes
2026-10-10T21:21:56.8440749Z ok 449 - TST-290107: public clearEverything removes all raw instance storage without crossing prefixes
2026-10-10T21:21:56.8441536Z   ---
2026-10-10T21:21:56.8442023Z   duration_ms: 0.337223
2026-10-10T21:21:56.8442423Z   type: 'test'
2026-10-10T21:21:56.8442766Z   ...
2026-10-10T21:21:56.8443701Z # Subtest: TST-290108: public secretValues returns credentials only for both jump-host login shapes
2026-10-10T21:21:56.8445108Z ok 450 - TST-290108: public secretValues returns credentials only for both jump-host login shapes
2026-10-10T21:21:56.8445879Z   ---
2026-10-10T21:21:56.8446216Z   duration_ms: 0.745421
2026-10-10T21:21:56.8446592Z   type: 'test'
2026-10-10T21:21:56.8446931Z   ...
2026-10-10T21:21:59.1901739Z # TST-290115-counterproof {"cases":["TST-290114","TST-290115"],"cwd":"/home/runner/work/agent-m/agent-m/","childArgv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-290114|TST-290115","/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs","/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs"],"childEnvironment":{"AGENT_M_290_ROOT":"/tmp/agent-m-290-fault-dcZj3Q/agent-m","AGENT_M_290_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"source":"/tmp/agent-m-290-fault-dcZj3Q/agent-m/src/settings-pages/settings.mjs","tests":["/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs","/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs"],"originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultSourceHash":"da20e29b09a94ddb07d012d12fab01f69918d15b3a78b2297c7e50da9e4eb4bd","restoredSourceHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","testHashes":{"/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs":"83758b76c34b1f1213a5a89719b5627dfa3a5de11ba5ae6f1e03b254b3c32c4a","/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs":"6016ef1310941dd90d14ff0bc750e6fd98b81571e64bfe7b988438584951a18b"},"fault":"pane.hidden = !chosen;","faultStarted":"2026-10-10T21:21:57.033Z","faultEnded":"2026-10-10T21:21:58.112Z","faultStatus":1,"faultSignal":null,"faultError":null,"faultNodes":{"TST-290114":"not ok 1 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\n  ---\\n  duration_ms: 270.268681\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:33:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    exactly one panel is shown after a tab selection\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:60:14)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...","TST-290115":"not ok 2 - TST-290115: public Settings tabs fit phone and desktop layouts\\n  ---\\n  duration_ms: 934.439038\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:72:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    390px: exactly one tab panel is visible; actual={\\"requestedViewport\\":{\\"width\\":390,\\"height\\":900,\\"mobile\\":true},\\"url\\":\\"http://127.0.0.1:44039/docs/\#settings\\",\\"viewport\\":{\\"innerWidth\\":390,\\"innerHeight\\":900,\\"outerWidth\\":390,\\"outerHeight\\":900,\\"visual\\":{\\"width\\":390,\\"height\\":900,\\"scale\\":1},\\"screen\\":{\\"width\\":390,\\"height\\":900}},\\"cdpLayout\\":{\\"layoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"visualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"contentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298},\\"cssLayoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"cssVisualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"cssContentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298}},\\"document\\":{\\"scrollWidth\\":390,\\"clientWidth\\":390},\\"tab\\":{\\"name\\":\\"General\\",\\"label\\":\\"General\\",\\"rect\\":{\\"x\\":16,\\"y\\":287.546875,\\"width\\":78.796875,\\"height\\":38.703125},\\"computed\\":{\\"fontSize\\":\\"14.4px\\",\\"lineHeight\\":\\"22.32px\\",\\"paddingTop\\":\\"7.2px\\",\\"paddingRight\\":\\"12.8px\\",\\"paddingBottom\\":\\"7.2px\\",\\"paddingLeft\\":\\"12.8px\\"},\\"panel\\":{\\"width\\":358,\\"height\\":872.015625,\\"scrollWidth\\":358,\\"clientWidth\\":358},\\"selected\\":\\"true\\",\\"readable\\":true,\\"visible\\":true,\\"visibleCount\\":4,\\"documentOverflow\\":true,\\"panelOverflow\\":true,\\"longValue\\":false}}\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:123:533)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ..."},"faultStdout":"TAP version 13\\n\# Subtest: TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\nnot ok 1 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\n  ---\\n  duration_ms: 270.268681\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:33:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    exactly one panel is shown after a tab selection\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:60:14)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290115: public Settings tabs fit phone and desktop layouts\\nnot ok 2 - TST-290115: public Settings tabs fit phone and desktop layouts\\n  ---\\n  duration_ms: 934.439038\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:72:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    390px: exactly one tab panel is visible; actual={\\"requestedViewport\\":{\\"width\\":390,\\"height\\":900,\\"mobile\\":true},\\"url\\":\\"http://127.0.0.1:44039/docs/\#settings\\",\\"viewport\\":{\\"innerWidth\\":390,\\"innerHeight\\":900,\\"outerWidth\\":390,\\"outerHeight\\":900,\\"visual\\":{\\"width\\":390,\\"height\\":900,\\"scale\\":1},\\"screen\\":{\\"width\\":390,\\"height\\":900}},\\"cdpLayout\\":{\\"layoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"visualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"contentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298},\\"cssLayoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"cssVisualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"cssContentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298}},\\"document\\":{\\"scrollWidth\\":390,\\"clientWidth\\":390},\\"tab\\":{\\"name\\":\\"General\\",\\"label\\":\\"General\\",\\"rect\\":{\\"x\\":16,\\"y\\":287.546875,\\"width\\":78.796875,\\"height\\":38.703125},\\"computed\\":{\\"fontSize\\":\\"14.4px\\",\\"lineHeight\\":\\"22.32px\\",\\"paddingTop\\":\\"7.2px\\",\\"paddingRight\\":\\"12.8px\\",\\"paddingBottom\\":\\"7.2px\\",\\"paddingLeft\\":\\"12.8px\\"},\\"panel\\":{\\"width\\":358,\\"height\\":872.015625,\\"scrollWidth\\":358,\\"clientWidth\\":358},\\"selected\\":\\"true\\",\\"readable\\":true,\\"visible\\":true,\\"visibleCount\\":4,\\"documentOverflow\\":true,\\"panelOverflow\\":true,\\"longValue\\":false}}\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:123:533)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 0\\n\# fail 2\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 1044.294129\\n","faultStderr":"","restoredStarted":"2026-10-10T21:21:58.112Z","restoredEnded":"2026-10-10T21:21:59.185Z","restoredStatus":0,"restoredSignal":null,"restoredError":null,"restoredStdout":"TAP version 13\\n\# Subtest: TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\nok 1 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\n  ---\\n  duration_ms: 271.623292\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290115: public Settings tabs fit phone and desktop layouts\\nok 2 - TST-290115: public Settings tabs fit phone and desktop layouts\\n  ---\\n  duration_ms: 948.025022\\n  type: 'test'\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 2\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 1040.061043\\n","restoredStderr":""}
2026-10-10T21:21:59.2235677Z # Subtest: TST-290115: public Settings tabs fit phone and desktop layouts
2026-10-10T21:21:59.2239859Z ok 451 - TST-290115: public Settings tabs fit phone and desktop layouts
2026-10-10T21:21:59.2240558Z   ---
2026-10-10T21:21:59.2240921Z   duration_ms: 5275.22214
2026-10-10T21:21:59.2241465Z   type: 'test'
2026-10-10T21:21:59.2241837Z   ...
2026-10-10T21:21:59.3326362Z # Subtest: release · UC-008 1–5: a use case is read with its diagram and accepted by one commit that names its exact text
2026-10-10T21:21:59.3352629Z ok 452 - release · UC-008 1–5: a use case is read with its diagram and accepted by one commit that names its exact text
2026-10-10T21:21:59.3360428Z   ---
2026-10-10T21:21:59.3361002Z   duration_ms: 392.765349
2026-10-10T21:21:59.3361647Z   type: 'test'
2026-10-10T21:21:59.3362226Z   ...
2026-10-10T21:21:59.3363323Z # Subtest: release · UC-008 5a: an accepted use case edited afterwards shows as changed
2026-10-10T21:21:59.3364799Z ok 453 - release · UC-008 5a: an accepted use case edited afterwards shows as changed
2026-10-10T21:21:59.3365618Z   ---
2026-10-10T21:21:59.3366103Z   duration_ms: 124.878536
2026-10-10T21:21:59.3366657Z   type: 'test'
2026-10-10T21:21:59.3367142Z   ...
2026-10-10T21:21:59.3368455Z # Subtest: release · UC-008 2a: a changed use case shows its difference to the text the most recent record names, across a rename
2026-10-10T21:21:59.3370454Z ok 454 - release · UC-008 2a: a changed use case shows its difference to the text the most recent record names, across a rename
2026-10-10T21:21:59.3379210Z   ---
2026-10-10T21:21:59.3379755Z   duration_ms: 129.975482
2026-10-10T21:21:59.3380307Z   type: 'test'
2026-10-10T21:21:59.3380804Z   ...
2026-10-10T21:21:59.3382397Z # Subtest: release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown
2026-10-10T21:21:59.3384405Z ok 455 - release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown
2026-10-10T21:21:59.3385819Z   ---
2026-10-10T21:21:59.3386316Z   duration_ms: 161.670523
2026-10-10T21:21:59.3386851Z   type: 'test'
2026-10-10T21:21:59.3387305Z   ...
2026-10-10T21:21:59.3388403Z # Subtest: release · UC-008 3a: Save commits the edited use case, which is then shown again, open
2026-10-10T21:21:59.3389843Z ok 456 - release · UC-008 3a: Save commits the edited use case, which is then shown again, open
2026-10-10T21:21:59.3390716Z   ---
2026-10-10T21:21:59.3391180Z   duration_ms: 176.726053
2026-10-10T21:21:59.3391690Z   type: 'test'
2026-10-10T21:21:59.3392298Z   ...
2026-10-10T21:21:59.3393290Z # Subtest: release · UC-008 3a: a save whose file changed meanwhile writes nothing
2026-10-10T21:21:59.3394644Z ok 457 - release · UC-008 3a: a save whose file changed meanwhile writes nothing
2026-10-10T21:21:59.3395456Z   ---
2026-10-10T21:21:59.3395925Z   duration_ms: 151.843586
2026-10-10T21:21:59.3396439Z   type: 'test'
2026-10-10T21:21:59.3396923Z   ...
2026-10-10T21:21:59.3398053Z # Subtest: release · UC-008 3b: without a token, Accept and Edit open GitHub's own pages, prefilled
2026-10-10T21:21:59.3399652Z ok 458 - release · UC-008 3b: without a token, Accept and Edit open GitHub's own pages, prefilled
2026-10-10T21:21:59.3400653Z   ---
2026-10-10T21:21:59.3401094Z   duration_ms: 157.943097
2026-10-10T21:21:59.3401559Z   type: 'test'
2026-10-10T21:21:59.3402084Z   ...
2026-10-10T21:21:59.3403661Z # Subtest: release · UC-008 3c: a GitLab product without its token is read, offers no Accept or Save, and links to the token step
2026-10-10T21:21:59.3405526Z ok 459 - release · UC-008 3c: a GitLab product without its token is read, offers no Accept or Save, and links to the token step
2026-10-10T21:21:59.3406555Z   ---
2026-10-10T21:21:59.3407034Z   duration_ms: 103.385885
2026-10-10T21:21:59.3407522Z   type: 'test'
2026-10-10T21:21:59.3407956Z   ...
2026-10-10T21:21:59.3409393Z # Subtest: release · UC-008 3d: Accept ticked writes one record per ticked use case in one commit; a file changed since is left out and named
2026-10-10T21:21:59.3411692Z ok 460 - release · UC-008 3d: Accept ticked writes one record per ticked use case in one commit; a file changed since is left out and named
2026-10-10T21:21:59.3412926Z   ---
2026-10-10T21:21:59.3413400Z   duration_ms: 444.634898
2026-10-10T21:21:59.3413896Z   type: 'test'
2026-10-10T21:21:59.3414355Z   ...
2026-10-10T21:21:59.3415692Z # Subtest: release · UC-008 3e: Review all shows every open use case and Accept all writes one record each; a file changed since is left out
2026-10-10T21:21:59.3417561Z ok 461 - release · UC-008 3e: Review all shows every open use case and Accept all writes one record each; a file changed since is left out
2026-10-10T21:21:59.3418567Z   ---
2026-10-10T21:21:59.3419027Z   duration_ms: 377.471838
2026-10-10T21:21:59.3419547Z   type: 'test'
2026-10-10T21:21:59.3419993Z   ...
2026-10-10T21:21:59.3421104Z # Subtest: release · UC-008 3: nothing is written on load or on a script's click; the person's click writes
2026-10-10T21:21:59.3422825Z ok 462 - release · UC-008 3: nothing is written on load or on a script's click; the person's click writes
2026-10-10T21:21:59.3423801Z   ---
2026-10-10T21:21:59.3424245Z   duration_ms: 314.628848
2026-10-10T21:21:59.3424748Z   type: 'test'
2026-10-10T21:21:59.3425198Z   ...
2026-10-10T21:21:59.3426755Z # Subtest: release · UC-006 1–7: a SPEC change is accepted in one commit — record, section byte for byte, decision — and shows as in SPEC
2026-10-10T21:21:59.3428833Z ok 463 - release · UC-006 1–7: a SPEC change is accepted in one commit — record, section byte for byte, decision — and shows as in SPEC
2026-10-10T21:21:59.3429928Z   ---
2026-10-10T21:21:59.3430405Z   duration_ms: 201.903119
2026-10-10T21:21:59.3430985Z   type: 'test'
2026-10-10T21:21:59.3431413Z   ...
2026-10-10T21:21:59.3432690Z # Subtest: release · UC-006 3a: an edited proposal is saved, shown again, and accepted as edited
2026-10-10T21:21:59.3434108Z ok 464 - release · UC-006 3a: an edited proposal is saved, shown again, and accepted as edited
2026-10-10T21:21:59.3435310Z   ---
2026-10-10T21:21:59.3436088Z   duration_ms: 285.214012
2026-10-10T21:21:59.3436599Z   type: 'test'
2026-10-10T21:21:59.3436928Z   ...
2026-10-10T21:21:59.3438149Z # Subtest: release · UC-006 5a: a SPEC section or proposal changed since it was shown is not written; the new state is shown
2026-10-10T21:21:59.3439756Z ok 465 - release · UC-006 5a: a SPEC section or proposal changed since it was shown is not written; the new state is shown
2026-10-10T21:21:59.3440582Z   ---
2026-10-10T21:21:59.3440901Z   duration_ms: 378.819887
2026-10-10T21:21:59.3441254Z   type: 'test'
2026-10-10T21:21:59.3441545Z   ...
2026-10-10T21:21:59.3442684Z # Subtest: release · UC-006 4d: an entry waits for the entry that creates its heading; ticked together both are written in queue order
2026-10-10T21:21:59.3443687Z ok 466 - release · UC-006 4d: an entry waits for the entry that creates its heading; ticked together both are written in queue order
2026-10-10T21:21:59.3444194Z   ---
2026-10-10T21:21:59.3444381Z   duration_ms: 269.350241
2026-10-10T21:21:59.3444601Z   type: 'test'
2026-10-10T21:21:59.3444871Z   ...
2026-10-10T21:21:59.3445639Z # Subtest: release · UC-006 4b: without a token, Accept and Edit open GitHub's pages for the instance, prefilled
2026-10-10T21:21:59.3446481Z ok 467 - release · UC-006 4b: without a token, Accept and Edit open GitHub's pages for the instance, prefilled
2026-10-10T21:21:59.3447206Z   ---
2026-10-10T21:21:59.3447396Z   duration_ms: 159.069533
2026-10-10T21:21:59.3447616Z   type: 'test'
2026-10-10T21:21:59.3447802Z   ...
2026-10-10T21:21:59.3448418Z # Subtest: release · UC-006 4c: a product's SPEC change without a token is not offered GitHub's page; a token is required
2026-10-10T21:21:59.3449995Z not ok 468 - release · UC-006 4c: a product's SPEC change without a token is not offered GitHub's page; a token is required # TODO FINDING R2 — a product's SPEC entry without a token offers GitHub's new-file page, as for the instance (backlog item to be added by the Product Owner)
2026-10-10T21:21:59.3450953Z   ---
2026-10-10T21:21:59.3451135Z   duration_ms: 110.108737
2026-10-10T21:21:59.3451349Z   type: 'test'
2026-10-10T21:21:59.3451815Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:697:1'
2026-10-10T21:21:59.3452460Z   failureType: 'testCodeFailure'
2026-10-10T21:21:59.3452819Z   error: 'no GitHub page for the record'
2026-10-10T21:21:59.3453226Z   code: 'ERR_ASSERTION'
2026-10-10T21:21:59.3453454Z   name: 'AssertionError'
2026-10-10T21:21:59.3453683Z   expected: true
2026-10-10T21:21:59.3453883Z   actual: false
2026-10-10T21:21:59.3454081Z   operator: '=='
2026-10-10T21:21:59.3454274Z   stack: |-
2026-10-10T21:21:59.3454814Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:703:12)
2026-10-10T21:21:59.3455437Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:21:59.3456058Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:21:59.3456492Z   ...
2026-10-10T21:21:59.3457003Z # Subtest: release · UC-006 4a: an entry not accepted stays open and nothing is committed
2026-10-10T21:21:59.3457666Z ok 469 - release · UC-006 4a: an entry not accepted stays open and nothing is committed
2026-10-10T21:21:59.3458034Z   ---
2026-10-10T21:21:59.3458228Z   duration_ms: 257.182151
2026-10-10T21:21:59.3458448Z   type: 'test'
2026-10-10T21:21:59.3458652Z   ...
2026-10-10T21:21:59.3459255Z # Subtest: release · UC-014 4a: an approval committed on GitHub's page and not yet applied shows as approved, with why
2026-10-10T21:21:59.3460134Z ok 470 - release · UC-014 4a: an approval committed on GitHub's page and not yet applied shows as approved, with why
2026-10-10T21:21:59.3460583Z   ---
2026-10-10T21:21:59.3460773Z   duration_ms: 233.888463
2026-10-10T21:21:59.3460988Z   type: 'test'
2026-10-10T21:21:59.3461175Z   ...
2026-10-10T21:21:59.3462126Z # Subtest: release · UC-014 6, 7a: without a token the start page offers Finish setting up, with Set up now and Import settings
2026-10-10T21:21:59.3463059Z ok 471 - release · UC-014 6, 7a: without a token the start page offers Finish setting up, with Set up now and Import settings
2026-10-10T21:21:59.3463545Z   ---
2026-10-10T21:21:59.3463841Z   duration_ms: 59.519177
2026-10-10T21:21:59.3464125Z   type: 'test'
2026-10-10T21:21:59.3464309Z   ...
2026-10-10T21:21:59.3464925Z # Subtest: release · UC-014 7: Step A links GitHub's token page prefilled with exactly the permissions every feature needs
2026-10-10T21:21:59.3465838Z ok 472 - release · UC-014 7: Step A links GitHub's token page prefilled with exactly the permissions every feature needs
2026-10-10T21:21:59.3466304Z   ---
2026-10-10T21:21:59.3466492Z   duration_ms: 106.725335
2026-10-10T21:21:59.3466787Z   type: 'test'
2026-10-10T21:21:59.3467064Z   ...
2026-10-10T21:21:59.3467724Z # Subtest: release · UC-014 8–9: Store and check keeps token and expiry after the notice, checks the instance, and shows it ready
2026-10-10T21:21:59.3468936Z ok 473 - release · UC-014 8–9: Store and check keeps token and expiry after the notice, checks the instance, and shows it ready
2026-10-10T21:21:59.3469651Z   ---
2026-10-10T21:21:59.3469926Z   duration_ms: 294.586275
2026-10-10T21:21:59.3470238Z   type: 'test'
2026-10-10T21:21:59.3470522Z   ...
2026-10-10T21:21:59.3471548Z # Subtest: release · UC-014 6a: without setup, the dashboard reads public repositories and accepting goes through GitHub's page
2026-10-10T21:21:59.3473477Z ok 474 - release · UC-014 6a: without setup, the dashboard reads public repositories and accepting goes through GitHub's page
2026-10-10T21:21:59.3474359Z   ---
2026-10-10T21:21:59.3474698Z   duration_ms: 99.850198
2026-10-10T21:21:59.3475094Z   type: 'test'
2026-10-10T21:21:59.3475400Z   ...
2026-10-10T21:21:59.4888592Z # Subtest: release · UC-042 1: Settings is reached from the gear; a stored token is hidden until Show reveals it in full
2026-10-10T21:21:59.4901770Z ok 475 - release · UC-042 1: Settings is reached from the gear; a stored token is hidden until Show reveals it in full
2026-10-10T21:21:59.4902996Z   ---
2026-10-10T21:21:59.4903418Z   duration_ms: 158.074212
2026-10-10T21:21:59.4903908Z   type: 'test'
2026-10-10T21:21:59.4904314Z   ...
2026-10-10T21:21:59.7718004Z # Subtest: release · UC-042 2: Test sends one harmless request to GitHub and the line shows ✓ works with the date
2026-10-10T21:21:59.7719889Z ok 476 - release · UC-042 2: Test sends one harmless request to GitHub and the line shows ✓ works with the date
2026-10-10T21:21:59.7720839Z   ---
2026-10-10T21:21:59.7721286Z   duration_ms: 283.392446
2026-10-10T21:21:59.7721699Z   type: 'test'
2026-10-10T21:21:59.7722266Z   ...
2026-10-10T21:21:59.9627535Z # Subtest: release · UC-042 2: Change stores a new token with its expiry date, preset to 90 days, after the notice
2026-10-10T21:21:59.9629675Z ok 477 - release · UC-042 2: Change stores a new token with its expiry date, preset to 90 days, after the notice
2026-10-10T21:21:59.9630730Z   ---
2026-10-10T21:21:59.9631528Z   duration_ms: 191.44126
2026-10-10T21:21:59.9632153Z   type: 'test'
2026-10-10T21:21:59.9632472Z   ...
2026-10-10T21:22:00.1603921Z # Subtest: release · UC-042 2: Clear asks once, says what stops working, and removes the token from localStorage
2026-10-10T21:22:00.1604849Z ok 478 - release · UC-042 2: Clear asks once, says what stops working, and removes the token from localStorage
2026-10-10T21:22:00.1605362Z   ---
2026-10-10T21:22:00.1605700Z   duration_ms: 197.554357
2026-10-10T21:22:00.1606031Z   type: 'test'
2026-10-10T21:22:00.1606220Z   ...
2026-10-10T21:22:00.4991579Z # Subtest: release · UC-042 1a: a token expiring within fourteen days is warned of on every page, with Renew
2026-10-10T21:22:00.4993747Z ok 479 - release · UC-042 1a: a token expiring within fourteen days is warned of on every page, with Renew
2026-10-10T21:22:00.4994889Z   ---
2026-10-10T21:22:00.4995661Z   duration_ms: 338.637417
2026-10-10T21:22:00.4996528Z   type: 'test'
2026-10-10T21:22:00.4996874Z   ...
2026-10-10T21:22:00.7471141Z # Subtest: release · UC-042 1a: the expiry line offers the paste field for the renewed value
2026-10-10T21:22:00.7473746Z not ok 480 - release · UC-042 1a: the expiry line offers the paste field for the renewed value # TODO FINDING R3 — the expiry line names where to paste, but offers no paste field (backlog item to be added by the Product Owner)
2026-10-10T21:22:00.7475532Z   ---
2026-10-10T21:22:00.7476096Z   duration_ms: 247.307989
2026-10-10T21:22:00.7476674Z   type: 'test'
2026-10-10T21:22:00.7477620Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:928:1'
2026-10-10T21:22:00.7478679Z   failureType: 'testCodeFailure'
2026-10-10T21:22:00.7479407Z   error: 'a paste field, or a control that opens it'
2026-10-10T21:22:00.7480079Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:00.7480601Z   name: 'AssertionError'
2026-10-10T21:22:00.7481130Z   expected: true
2026-10-10T21:22:00.7481633Z   actual: false
2026-10-10T21:22:00.7482276Z   operator: '=='
2026-10-10T21:22:00.7483101Z   stack: |-
2026-10-10T21:22:00.7484239Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:939:12)
2026-10-10T21:22:00.7485431Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:00.7486326Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:00.7487009Z   ...
2026-10-10T21:22:01.2082811Z # Subtest: release · UC-042 1b: a refused token is named, GitHub's with Renew, a GitLab project's with its Access tokens page
2026-10-10T21:22:01.2085318Z ok 481 - release · UC-042 1b: a refused token is named, GitHub's with Renew, a GitLab project's with its Access tokens page
2026-10-10T21:22:01.2102912Z   ---
2026-10-10T21:22:01.2103447Z   duration_ms: 461.570602
2026-10-10T21:22:01.2104149Z   type: 'test'
2026-10-10T21:22:01.2104634Z   ...
2026-10-10T21:22:01.3579319Z # Subtest: release · UC-042 3a: without a token the product section is read-only and links to UC-001's token step
2026-10-10T21:22:01.3584145Z ok 482 - release · UC-042 3a: without a token the product section is read-only and links to UC-001's token step
2026-10-10T21:22:01.3585417Z   ---
2026-10-10T21:22:01.3585990Z   duration_ms: 149.544353
2026-10-10T21:22:01.3586541Z   type: 'test'
2026-10-10T21:22:01.3587021Z   ...
2026-10-10T21:22:01.5657596Z # Subtest: release · UC-042 4: pseudonymisation is on by default; switching it off states what follows, then commits docs/settings.md
2026-10-10T21:22:01.5660092Z ok 483 - release · UC-042 4: pseudonymisation is on by default; switching it off states what follows, then commits docs/settings.md
2026-10-10T21:22:01.5661422Z   ---
2026-10-10T21:22:01.5662399Z   duration_ms: 207.677043
2026-10-10T21:22:01.5662984Z   type: 'test'
2026-10-10T21:22:01.5663371Z   ...
2026-10-10T21:22:01.7780719Z # Subtest: release · UC-042 4a: switching back on is saved without a notice; the page says earlier data stays in the history
2026-10-10T21:22:01.7783513Z ok 484 - release · UC-042 4a: switching back on is saved without a notice; the page says earlier data stays in the history
2026-10-10T21:22:01.7784471Z   ---
2026-10-10T21:22:01.7784870Z   duration_ms: 212.398646
2026-10-10T21:22:01.7785338Z   type: 'test'
2026-10-10T21:22:01.7785751Z   ...
2026-10-10T21:22:01.9834734Z # Subtest: release · UC-042 5: + Collaborator with the person's consent commits docs/collaborators.md, without it nothing
2026-10-10T21:22:01.9835929Z ok 485 - release · UC-042 5: + Collaborator with the person's consent commits docs/collaborators.md, without it nothing
2026-10-10T21:22:01.9836413Z   ---
2026-10-10T21:22:01.9836644Z   duration_ms: 205.335252
2026-10-10T21:22:01.9836882Z   type: 'test'
2026-10-10T21:22:01.9837070Z   ...
2026-10-10T21:22:02.1323238Z # Subtest: release · UC-042 6: Clear everything removes every entry from localStorage
2026-10-10T21:22:02.1324575Z ok 486 - release · UC-042 6: Clear everything removes every entry from localStorage
2026-10-10T21:22:02.1325116Z   ---
2026-10-10T21:22:02.1325574Z   duration_ms: 148.623407
2026-10-10T21:22:02.1326067Z   type: 'test'
2026-10-10T21:22:02.1326416Z   ...
2026-10-10T21:22:02.2367913Z # Subtest: release · UC-042: every line and section of the settings page explains itself
2026-10-10T21:22:02.2372658Z ok 487 - release · UC-042: every line and section of the settings page explains itself
2026-10-10T21:22:02.2373456Z   ---
2026-10-10T21:22:02.2373777Z   duration_ms: 104.746463
2026-10-10T21:22:02.2374527Z   type: 'test'
2026-10-10T21:22:02.2374828Z   ...
2026-10-10T21:22:02.3329732Z # Subtest: release · A TOKEN IS SCOPED TO WHAT IT WRITES: the settings page states the minimum scope and why each part is needed
2026-10-10T21:22:02.3330934Z ok 488 - release · A TOKEN IS SCOPED TO WHAT IT WRITES: the settings page states the minimum scope and why each part is needed
2026-10-10T21:22:02.3331498Z   ---
2026-10-10T21:22:02.3331721Z   duration_ms: 96.062942
2026-10-10T21:22:02.3332224Z   type: 'test'
2026-10-10T21:22:02.3332519Z   ...
2026-10-10T21:22:02.5113998Z # Subtest: release · A USED-UP RATE LIMIT IS NAMED: the account's or the network's limit with its reset time, never the token
2026-10-10T21:22:02.5115805Z ok 489 - release · A USED-UP RATE LIMIT IS NAMED: the account's or the network's limit with its reset time, never the token
2026-10-10T21:22:02.5116588Z   ---
2026-10-10T21:22:02.5116810Z   duration_ms: 177.669365
2026-10-10T21:22:02.5117046Z   type: 'test'
2026-10-10T21:22:02.5117270Z   ...
2026-10-10T21:22:02.5602449Z # Subtest: release · AN EXPIRED TOKEN IS NAMED: a refused token is named with the link to renew it
2026-10-10T21:22:02.5604007Z ok 490 - release · AN EXPIRED TOKEN IS NAMED: a refused token is named with the link to renew it
2026-10-10T21:22:02.5604619Z   ---
2026-10-10T21:22:02.5605184Z   duration_ms: 49.88188
2026-10-10T21:22:02.5605574Z   type: 'test'
2026-10-10T21:22:02.5605807Z   ...
2026-10-10T21:22:02.5843839Z # Subtest: release · git host: a write without an authority is refused before any request is sent
2026-10-10T21:22:02.5855611Z ok 491 - release · git host: a write without an authority is refused before any request is sent
2026-10-10T21:22:02.5856523Z   ---
2026-10-10T21:22:02.5857067Z   duration_ms: 2.223334
2026-10-10T21:22:02.5857905Z   type: 'test'
2026-10-10T21:22:02.5858358Z   ...
2026-10-10T21:22:02.5859475Z # Subtest: release · git host: each of the three authorities writes one commit with the person's own token
2026-10-10T21:22:02.5860951Z ok 492 - release · git host: each of the three authorities writes one commit with the person's own token
2026-10-10T21:22:02.5861693Z   ---
2026-10-10T21:22:02.5862776Z   duration_ms: 23.389237
2026-10-10T21:22:02.5863177Z   type: 'test'
2026-10-10T21:22:02.5863508Z   ...
2026-10-10T21:22:02.5864359Z # Subtest: release · git host: a save whose file changed on the branch writes nothing
2026-10-10T21:22:02.5865502Z ok 493 - release · git host: a save whose file changed on the branch writes nothing
2026-10-10T21:22:02.5866605Z   ---
2026-10-10T21:22:02.5866912Z   duration_ms: 2.004032
2026-10-10T21:22:02.5867285Z   type: 'test'
2026-10-10T21:22:02.5867633Z   ...
2026-10-10T21:22:02.5868711Z # Subtest: release · git host: a 403 with a used-up limit is the account's or the network's limit, not a refused token
2026-10-10T21:22:02.5870340Z ok 494 - release · git host: a 403 with a used-up limit is the account's or the network's limit, not a refused token
2026-10-10T21:22:02.5871178Z   ---
2026-10-10T21:22:02.5871540Z   duration_ms: 1.019079
2026-10-10T21:22:02.5872100Z   type: 'test'
2026-10-10T21:22:02.5872459Z   ...
2026-10-10T21:22:02.5873324Z # Subtest: release · git host: a 401 names the refused token and where it is renewed
2026-10-10T21:22:02.5874488Z ok 495 - release · git host: a 401 names the refused token and where it is renewed
2026-10-10T21:22:02.5875178Z   ---
2026-10-10T21:22:02.5875528Z   duration_ms: 0.414454
2026-10-10T21:22:02.5875924Z   type: 'test'
2026-10-10T21:22:02.5876279Z   ...
2026-10-10T21:22:02.5877117Z # Subtest: release · git host: the GitHub token is sent to GitHub's API only
2026-10-10T21:22:02.5878243Z ok 496 - release · git host: the GitHub token is sent to GitHub's API only
2026-10-10T21:22:02.5878873Z   ---
2026-10-10T21:22:02.5879216Z   duration_ms: 0.372992
2026-10-10T21:22:02.5879604Z   type: 'test'
2026-10-10T21:22:02.5879955Z   ...
2026-10-10T21:22:02.5881245Z # Subtest: release · ITM-126 identifierKept: a changed identifier is a finding in the compiler form; the same identifier is none
2026-10-10T21:22:02.5883393Z ok 497 - release · ITM-126 identifierKept: a changed identifier is a finding in the compiler form; the same identifier is none
2026-10-10T21:22:02.5884315Z   ---
2026-10-10T21:22:02.5884656Z   duration_ms: 2.252204
2026-10-10T21:22:02.5885044Z   type: 'test'
2026-10-10T21:22:02.5885364Z   ...
2026-10-10T21:22:02.5886227Z # Subtest: release · ITM-126 identifierKept: a text that lost its identifier is a finding too
2026-10-10T21:22:02.5887489Z ok 498 - release · ITM-126 identifierKept: a text that lost its identifier is a finding too
2026-10-10T21:22:02.5888267Z   ---
2026-10-10T21:22:02.5888600Z   duration_ms: 0.204563
2026-10-10T21:22:02.5888927Z   type: 'test'
2026-10-10T21:22:02.5889222Z   ...
2026-10-10T21:22:02.5890256Z # Subtest: release · ITM-126 identifierKept: a text with CR LF line ends that keeps its identifier is no finding
2026-10-10T21:22:02.5891753Z ok 499 - release · ITM-126 identifierKept: a text with CR LF line ends that keeps its identifier is no finding
2026-10-10T21:22:02.5892754Z   ---
2026-10-10T21:22:02.5893079Z   duration_ms: 0.191068
2026-10-10T21:22:02.5893465Z   type: 'test'
2026-10-10T21:22:02.5893799Z   ...
2026-10-10T21:22:02.5894934Z # Subtest: release · ITM-126 formatChecks: the identifier finding comes once, as identifierKept gives it
2026-10-10T21:22:02.5896441Z ok 500 - release · ITM-126 formatChecks: the identifier finding comes once, as identifierKept gives it
2026-10-10T21:22:02.5897252Z   ---
2026-10-10T21:22:02.5897595Z   duration_ms: 4.635621
2026-10-10T21:22:02.5897976Z   type: 'test'
2026-10-10T21:22:02.5898264Z   ...
2026-10-10T21:22:02.8244290Z # Subtest: release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a use case saved under another identifier is refused, nothing is written
2026-10-10T21:22:02.8260371Z ok 501 - release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a use case saved under another identifier is refused, nothing is written
2026-10-10T21:22:02.8264251Z   ---
2026-10-10T21:22:02.8264727Z   duration_ms: 715.392946
2026-10-10T21:22:02.8265334Z   type: 'test'
2026-10-10T21:22:02.8265883Z   ...
2026-10-10T21:22:02.8267368Z # Subtest: release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a decision and a module saved under another identifier are refused
2026-10-10T21:22:02.8269478Z ok 502 - release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a decision and a module saved under another identifier are refused
2026-10-10T21:22:02.8283548Z   ---
2026-10-10T21:22:02.8284142Z   duration_ms: 532.566982
2026-10-10T21:22:02.8285046Z   type: 'test'
2026-10-10T21:22:02.8285545Z   ...
2026-10-10T21:22:02.8286977Z # Subtest: release · ITM-129 UC-024: a page load of every address asks for no file below docs/assets/ that is not there
2026-10-10T21:22:02.8288866Z ok 503 - release · ITM-129 UC-024: a page load of every address asks for no file below docs/assets/ that is not there
2026-10-10T21:22:02.8289892Z   ---
2026-10-10T21:22:02.8290385Z   duration_ms: 2600.672025
2026-10-10T21:22:02.8290946Z   type: 'test'
2026-10-10T21:22:02.8291442Z   ...
2026-10-10T21:22:02.8292792Z # Subtest: release · ITM-129 UC-024: every menu entry and view of today is shown; a view whose file is not built is not
2026-10-10T21:22:02.8294714Z ok 504 - release · ITM-129 UC-024: every menu entry and view of today is shown; a view whose file is not built is not
2026-10-10T21:22:02.8295678Z   ---
2026-10-10T21:22:02.8296124Z   duration_ms: 1874.226317
2026-10-10T21:22:02.8296611Z   type: 'test'
2026-10-10T21:22:02.8297090Z   ...
2026-10-10T21:22:02.8298532Z # Subtest: release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: no file of the dashboard imports the git host's request helper
2026-10-10T21:22:02.8300543Z ok 505 - release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: no file of the dashboard imports the git host's request helper
2026-10-10T21:22:02.8301549Z   ---
2026-10-10T21:22:02.8302171Z   duration_ms: 10.066103
2026-10-10T21:22:02.8302717Z   type: 'test'
2026-10-10T21:22:02.8303171Z   ...
2026-10-10T21:22:02.8304752Z # Subtest: release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: the dashboard reads through no name of the git host that MOD-git-host does not provide
2026-10-10T21:22:02.8307389Z ok 506 - release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: the dashboard reads through no name of the git host that MOD-git-host does not provide
2026-10-10T21:22:02.8308543Z   ---
2026-10-10T21:22:02.8309024Z   duration_ms: 22.959491
2026-10-10T21:22:02.8309576Z   type: 'test'
2026-10-10T21:22:02.8310046Z   ...
2026-10-10T21:22:02.8311059Z # Subtest: release · ITM-130 ARC-003: no file of the dashboard calls fetch itself
2026-10-10T21:22:02.8312556Z ok 507 - release · ITM-130 ARC-003: no file of the dashboard calls fetch itself
2026-10-10T21:22:02.8313403Z   ---
2026-10-10T21:22:02.8313862Z   duration_ms: 4.472594
2026-10-10T21:22:02.8314381Z   type: 'test'
2026-10-10T21:22:02.8314861Z   ...
2026-10-10T21:22:03.0370203Z # Subtest: release · ITM-130 UC-008 2a: the last accepted text is read by its blob and refused unless it hashes to that SHA
2026-10-10T21:22:03.0372269Z ok 508 - release · ITM-130 UC-008 2a: the last accepted text is read by its blob and refused unless it hashes to that SHA
2026-10-10T21:22:03.0373113Z   ---
2026-10-10T21:22:03.0373451Z   duration_ms: 216.180043
2026-10-10T21:22:03.0373853Z   type: 'test'
2026-10-10T21:22:03.0374184Z   ...
2026-10-10T21:22:03.1911308Z # Subtest: release · ITM-133 UC-008 4a: an Accept refused for missing write access offers GitHub's new-file page with the record, as a link
2026-10-10T21:22:03.1913972Z ok 509 - release · ITM-133 UC-008 4a: an Accept refused for missing write access offers GitHub's new-file page with the record, as a link
2026-10-10T21:22:03.1915470Z   ---
2026-10-10T21:22:03.1916004Z   duration_ms: 154.027288
2026-10-10T21:22:03.1916592Z   type: 'test'
2026-10-10T21:22:03.1917067Z   ...
2026-10-10T21:22:03.3645604Z # Subtest: release · ITM-133 UC-008 4a: an Accept refused for a used-up rate limit gets no GitHub path and no word of write access
2026-10-10T21:22:03.3647555Z ok 510 - release · ITM-133 UC-008 4a: an Accept refused for a used-up rate limit gets no GitHub path and no word of write access
2026-10-10T21:22:03.3648484Z   ---
2026-10-10T21:22:03.3648797Z   duration_ms: 173.180481
2026-10-10T21:22:03.3649186Z   type: 'test'
2026-10-10T21:22:03.3649520Z   ...
2026-10-10T21:22:03.7409459Z # Subtest: release · ITM-133 UC-008 4a: a GitLab product's refused Accept offers no GitHub path
2026-10-10T21:22:03.7411508Z ok 511 - release · ITM-133 UC-008 4a: a GitLab product's refused Accept offers no GitHub path
2026-10-10T21:22:03.7413037Z   ---
2026-10-10T21:22:03.7413837Z   duration_ms: 376.715145
2026-10-10T21:22:03.7414355Z   type: 'test'
2026-10-10T21:22:03.7414704Z   ...
2026-10-10T21:22:03.9524124Z # Subtest: release · ITM-133 UC-008 3d·4a: Accept ticked refused for missing write access offers the GitHub path for each ticked record
2026-10-10T21:22:03.9526993Z not ok 512 - release · ITM-133 UC-008 3d·4a: Accept ticked refused for missing write access offers the GitHub path for each ticked record # TODO FINDING A3 — docs/assets/dashboard/review-views.mjs runAccept: a batch (Accept ticked, Accept all) refused for missing write access gets the sentence only, no GitHub path — ITM-133 back to Development
2026-10-10T21:22:03.9528247Z   ---
2026-10-10T21:22:03.9528460Z   duration_ms: 210.921751
2026-10-10T21:22:03.9528695Z   type: 'test'
2026-10-10T21:22:03.9529174Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:741:1'
2026-10-10T21:22:03.9529683Z   failureType: 'testCodeFailure'
2026-10-10T21:22:03.9529946Z   error: ''
2026-10-10T21:22:03.9530142Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:03.9530369Z   name: 'AssertionError'
2026-10-10T21:22:03.9530590Z   expected: true
2026-10-10T21:22:03.9530783Z   actual: false
2026-10-10T21:22:03.9530974Z   operator: '=='
2026-10-10T21:22:03.9531163Z   stack: |-
2026-10-10T21:22:03.9531696Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:754:12)
2026-10-10T21:22:03.9532723Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:03.9533191Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:03.9533557Z   ...
2026-10-10T21:22:04.1085719Z # Subtest: release · ITM-133 UC-008 3a·4a: a Save refused for missing write access offers GitHub's editor for the file
2026-10-10T21:22:04.1090094Z not ok 513 - release · ITM-133 UC-008 3a·4a: a Save refused for missing write access offers GitHub's editor for the file # TODO FINDING A4 — docs/assets/dashboard/review-views.mjs wireCommon: a Save refused for missing write access shows the sentence only, no GitHub route for the edit — ITM-133 back to Development
2026-10-10T21:22:04.1093300Z   ---
2026-10-10T21:22:04.1094011Z   duration_ms: 155.528243
2026-10-10T21:22:04.1094550Z   type: 'test'
2026-10-10T21:22:04.1095509Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:761:1'
2026-10-10T21:22:04.1096580Z   failureType: 'testCodeFailure'
2026-10-10T21:22:04.1098333Z   error: "GitHub's editor offered: Your token cannot write to akmaier/agent-m (POST /git/trees: 403 Resource not accessible by personal access token). Extend it in Settings, or remove it to use GitHub's page instead. "
2026-10-10T21:22:04.1099948Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:04.1100596Z   name: 'AssertionError'
2026-10-10T21:22:04.1101125Z   expected: true
2026-10-10T21:22:04.1101596Z   actual: false
2026-10-10T21:22:04.1102260Z   operator: '=='
2026-10-10T21:22:04.1102760Z   stack: |-
2026-10-10T21:22:04.1103881Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:773:12)
2026-10-10T21:22:04.1105208Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:04.1106165Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:04.1107004Z   ...
2026-10-10T21:22:04.4834947Z # Subtest: release · ITM-136 UC-042 1: the GitHub token's ✓ works and its date are shown after a reload
2026-10-10T21:22:04.4836392Z ok 514 - release · ITM-136 UC-042 1: the GitHub token's ✓ works and its date are shown after a reload
2026-10-10T21:22:04.4837041Z   ---
2026-10-10T21:22:04.4837361Z   duration_ms: 375.632593
2026-10-10T21:22:04.4837793Z   type: 'test'
2026-10-10T21:22:04.4838158Z   ...
2026-10-10T21:22:04.8413710Z # Subtest: release · ITM-136 UC-042 1b: a GitHub token refused at its last use is shown refused after a reload, on its line and at the top
2026-10-10T21:22:04.8416160Z ok 515 - release · ITM-136 UC-042 1b: a GitHub token refused at its last use is shown refused after a reload, on its line and at the top
2026-10-10T21:22:04.8417141Z   ---
2026-10-10T21:22:04.8417444Z   duration_ms: 357.285207
2026-10-10T21:22:04.8417779Z   type: 'test'
2026-10-10T21:22:04.8418090Z   ...
2026-10-10T21:22:05.6178503Z # Subtest: release · ITM-136 UC-042 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:22:05.6180802Z ok 516 - release · ITM-136 UC-042 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:22:05.6182097Z   ---
2026-10-10T21:22:05.6182637Z   duration_ms: 777.156243
2026-10-10T21:22:05.6183493Z   type: 'test'
2026-10-10T21:22:05.6183776Z   ...
2026-10-10T21:22:06.0863878Z # Subtest: release · ITM-136 UC-042 2: a new token stored with Change does not inherit the old token's ✓ works
2026-10-10T21:22:06.0865917Z ok 517 - release · ITM-136 UC-042 2: a new token stored with Change does not inherit the old token's ✓ works
2026-10-10T21:22:06.0883168Z   ---
2026-10-10T21:22:06.0883681Z   duration_ms: 465.484633
2026-10-10T21:22:06.0884223Z   type: 'test'
2026-10-10T21:22:06.0884709Z   ...
2026-10-10T21:22:06.4997730Z # Subtest: release · ITM-136 UC-042 2: Clear removes the token's kept test with the token, from localStorage itself
2026-10-10T21:22:06.5000286Z ok 518 - release · ITM-136 UC-042 2: Clear removes the token's kept test with the token, from localStorage itself
2026-10-10T21:22:06.5001620Z   ---
2026-10-10T21:22:06.5003660Z   duration_ms: 410.875187
2026-10-10T21:22:06.5004571Z   type: 'test'
2026-10-10T21:22:06.5005075Z   ...
2026-10-10T21:22:07.1153926Z # Subtest: release · ITM-136 EVERY SETTING IS REACHED FROM ONE PAGE: every key kept after the tests is named on the settings page
2026-10-10T21:22:07.1165962Z ok 519 - release · ITM-136 EVERY SETTING IS REACHED FROM ONE PAGE: every key kept after the tests is named on the settings page
2026-10-10T21:22:07.1167147Z   ---
2026-10-10T21:22:07.1167773Z   duration_ms: 619.083752
2026-10-10T21:22:07.1168387Z   type: 'test'
2026-10-10T21:22:07.1168834Z   ...
2026-10-10T21:22:07.1428933Z # Subtest: release · ITM-130 readBlob: a blob's text on either host, refused unless it hashes to that SHA; each token to its own server
2026-10-10T21:22:07.1443912Z ok 520 - release · ITM-130 readBlob: a blob's text on either host, refused unless it hashes to that SHA; each token to its own server
2026-10-10T21:22:07.1445268Z   ---
2026-10-10T21:22:07.1445800Z   duration_ms: 25.69252
2026-10-10T21:22:07.1446298Z   type: 'test'
2026-10-10T21:22:07.1446762Z   ...
2026-10-10T21:22:07.1447907Z # Subtest: release · ITM-130 ARC-003: no kernel file imports from the git host or from any module outside the kernel
2026-10-10T21:22:07.1449654Z ok 521 - release · ITM-130 ARC-003: no kernel file imports from the git host or from any module outside the kernel
2026-10-10T21:22:07.1450612Z   ---
2026-10-10T21:22:07.1451091Z   duration_ms: 11.303371
2026-10-10T21:22:07.1451571Z   type: 'test'
2026-10-10T21:22:07.1452148Z   ...
2026-10-10T21:22:07.1473343Z # Subtest: release · ITM-130 ARC-003: no kernel file calls fetch or touches the browser's storage
2026-10-10T21:22:07.1474885Z ok 522 - release · ITM-130 ARC-003: no kernel file calls fetch or touches the browser's storage
2026-10-10T21:22:07.1482747Z   ---
2026-10-10T21:22:07.1532561Z   duration_ms: 5.172847
2026-10-10T21:22:07.1559452Z   type: 'test'
2026-10-10T21:22:07.1562374Z   ...
2026-10-10T21:22:07.1563644Z # Subtest: release · ITM-130 lastAccepted reads through its ports only and returns the record committed last, by identifier
2026-10-10T21:22:07.1565446Z ok 523 - release · ITM-130 lastAccepted reads through its ports only and returns the record committed last, by identifier
2026-10-10T21:22:07.1566370Z   ---
2026-10-10T21:22:07.1566697Z   duration_ms: 5.394486
2026-10-10T21:22:07.1567122Z   type: 'test'
2026-10-10T21:22:07.1602442Z   ...
2026-10-10T21:22:07.1603576Z # Subtest: release · ITM-130 lastAccepted refuses a text that does not hash to the record's blob
2026-10-10T21:22:07.1605422Z ok 524 - release · ITM-130 lastAccepted refuses a text that does not hash to the record's blob
2026-10-10T21:22:07.1672675Z   ---
2026-10-10T21:22:07.1722409Z   duration_ms: 1.323738
2026-10-10T21:22:07.1752366Z   type: 'test'
2026-10-10T21:22:07.1756096Z   ...
2026-10-10T21:22:07.1783462Z # Subtest: release · ITM-130 lastAccepted: two records at the same instant are an error naming both, not a guess
2026-10-10T21:22:07.1785330Z ok 525 - release · ITM-130 lastAccepted: two records at the same instant are an error naming both, not a guess
2026-10-10T21:22:07.1786163Z   ---
2026-10-10T21:22:07.1786516Z   duration_ms: 1.961375
2026-10-10T21:22:07.1786874Z   type: 'test'
2026-10-10T21:22:07.1787168Z   ...
2026-10-10T21:22:07.1788214Z # Subtest: release · Backlog tab: sprint 02's own board — merged items done, the open one in progress, the limit named
2026-10-10T21:22:07.1789779Z ok 526 - release · Backlog tab: sprint 02's own board — merged items done, the open one in progress, the limit named
2026-10-10T21:22:07.1790678Z   ---
2026-10-10T21:22:07.1791020Z   duration_ms: 221.921694
2026-10-10T21:22:07.1791418Z   type: 'test'
2026-10-10T21:22:07.1791751Z   ...
2026-10-10T21:22:07.1793071Z # Subtest: release · Backlog tab: with the limit reached, every ready item says it cannot start, naming the limit
2026-10-10T21:22:07.1794637Z ok 527 - release · Backlog tab: with the limit reached, every ready item says it cannot start, naming the limit
2026-10-10T21:22:07.1795716Z   ---
2026-10-10T21:22:07.1796064Z   duration_ms: 115.786856
2026-10-10T21:22:07.1796443Z   type: 'test'
2026-10-10T21:22:07.1796728Z   ...
2026-10-10T21:22:07.1797762Z # Subtest: release · Backlog tab: an item realising a use case changed since its acceptance waits for acceptance
2026-10-10T21:22:07.1799381Z ok 528 - release · Backlog tab: an item realising a use case changed since its acceptance waits for acceptance
2026-10-10T21:22:07.1800178Z   ---
2026-10-10T21:22:07.1800497Z   duration_ms: 90.841569
2026-10-10T21:22:07.1800890Z   type: 'test'
2026-10-10T21:22:07.1801206Z   ...
2026-10-10T21:22:07.1802310Z # Subtest: release · Backlog tab: the uncovered names above, the board, then the backlog below
2026-10-10T21:22:07.1803898Z ok 529 - release · Backlog tab: the uncovered names above, the board, then the backlog below
2026-10-10T21:22:07.1804601Z   ---
2026-10-10T21:22:07.1804936Z   duration_ms: 91.404609
2026-10-10T21:22:07.1805382Z   type: 'test'
2026-10-10T21:22:07.1805730Z   ...
2026-10-10T21:22:07.1806702Z # Subtest: release · Backlog tab: no request for an unselected item before the backlog is unfolded
2026-10-10T21:22:07.1808061Z ok 530 - release · Backlog tab: no request for an unselected item before the backlog is unfolded
2026-10-10T21:22:07.1808784Z   ---
2026-10-10T21:22:07.1809123Z   duration_ms: 212.53161
2026-10-10T21:22:07.1809497Z   type: 'test'
2026-10-10T21:22:07.1809812Z   ...
2026-10-10T21:22:07.1834873Z # Subtest: release · Backlog tab: unfolded, the backlog in its order with derived states, and the uncovered names
2026-10-10T21:22:07.1836487Z ok 531 - release · Backlog tab: unfolded, the backlog in its order with derived states, and the uncovered names
2026-10-10T21:22:07.1837287Z   ---
2026-10-10T21:22:07.1837632Z   duration_ms: 209.981642
2026-10-10T21:22:07.1838029Z   type: 'test'
2026-10-10T21:22:07.1838356Z   ...
2026-10-10T21:22:07.1839332Z # Subtest: release · Backlog tab: after clearing every browser store and reloading, the same board
2026-10-10T21:22:07.1840800Z ok 532 - release · Backlog tab: after clearing every browser store and reloading, the same board
2026-10-10T21:22:07.1841559Z   ---
2026-10-10T21:22:07.1842066Z   duration_ms: 416.780478
2026-10-10T21:22:07.1842476Z   type: 'test'
2026-10-10T21:22:07.1842821Z   ...
2026-10-10T21:22:07.1843644Z # Subtest: release · Backlog tab: nothing is written and no state is stored
2026-10-10T21:22:07.1844711Z ok 533 - release · Backlog tab: nothing is written and no state is stored
2026-10-10T21:22:07.1845638Z   ---
2026-10-10T21:22:07.1845956Z   duration_ms: 191.967127
2026-10-10T21:22:07.1846332Z   type: 'test'
2026-10-10T21:22:07.1846652Z   ...
2026-10-10T21:22:07.1847476Z # Subtest: release · Backlog tab: every part and every column explains itself
2026-10-10T21:22:07.1848563Z ok 534 - release · Backlog tab: every part and every column explains itself
2026-10-10T21:22:07.1849159Z   ---
2026-10-10T21:22:07.1849485Z   duration_ms: 96.165741
2026-10-10T21:22:07.1849865Z   type: 'test'
2026-10-10T21:22:07.1850208Z   ...
2026-10-10T21:22:07.1851328Z # Subtest: release · Backlog tab: a product whose model works from a plan has no backlog and is sent to Progress
2026-10-10T21:22:07.1853096Z ok 535 - release · Backlog tab: a product whose model works from a plan has no backlog and is sent to Progress
2026-10-10T21:22:07.1853909Z   ---
2026-10-10T21:22:07.1854230Z   duration_ms: 96.016951
2026-10-10T21:22:07.1854609Z   type: 'test'
2026-10-10T21:22:07.1854938Z   ...
2026-10-10T21:22:07.1856051Z # Subtest: release · process model: Agent M's own model is read with its limit and measure, and validates without an error
2026-10-10T21:22:07.1857742Z ok 536 - release · process model: Agent M's own model is read with its limit and measure, and validates without an error
2026-10-10T21:22:07.1858636Z   ---
2026-10-10T21:22:07.1858972Z   duration_ms: 3.788336
2026-10-10T21:22:07.1859345Z   type: 'test'
2026-10-10T21:22:07.1859675Z   ...
2026-10-10T21:22:07.1860850Z # Subtest: release · process model: a transition naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:22:07.1862904Z ok 537 - release · process model: a transition naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:22:07.1863749Z   ---
2026-10-10T21:22:07.1864080Z   duration_ms: 1.694206
2026-10-10T21:22:07.1864466Z   type: 'test'
2026-10-10T21:22:07.1864822Z   ...
2026-10-10T21:22:07.1866041Z # Subtest: release · process model: a verification pair naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:22:07.1867874Z ok 538 - release · process model: a verification pair naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:22:07.1868760Z   ---
2026-10-10T21:22:07.1869092Z   duration_ms: 0.469116
2026-10-10T21:22:07.1869555Z   type: 'test'
2026-10-10T21:22:07.1869974Z   ...
2026-10-10T21:22:07.1871022Z # Subtest: release · process model: a gate without artifacts is refused, beside the field that causes it
2026-10-10T21:22:07.1872730Z ok 539 - release · process model: a gate without artifacts is refused, beside the field that causes it
2026-10-10T21:22:07.1873534Z   ---
2026-10-10T21:22:07.1873868Z   duration_ms: 0.468635
2026-10-10T21:22:07.1874256Z   type: 'test'
2026-10-10T21:22:07.1874577Z   ...
2026-10-10T21:22:07.1875670Z # Subtest: release · process model: a gate without a condition is refused, beside the field that causes it
2026-10-10T21:22:07.1877370Z ok 540 - release · process model: a gate without a condition is refused, beside the field that causes it
2026-10-10T21:22:07.1878300Z   ---
2026-10-10T21:22:07.1878651Z   duration_ms: 0.366678
2026-10-10T21:22:07.1879052Z   type: 'test'
2026-10-10T21:22:07.1879394Z   ...
2026-10-10T21:22:07.1880517Z # Subtest: release · process model: a role without capabilities is refused, beside the field that causes it
2026-10-10T21:22:07.1882282Z ok 541 - release · process model: a role without capabilities is refused, beside the field that causes it
2026-10-10T21:22:07.1883327Z   ---
2026-10-10T21:22:07.1883673Z   duration_ms: 0.436717
2026-10-10T21:22:07.1884057Z   type: 'test'
2026-10-10T21:22:07.1884386Z   ...
2026-10-10T21:22:07.1885432Z # Subtest: release · process model: a phase without a role is refused, beside the field that causes it
2026-10-10T21:22:07.1887034Z ok 542 - release · process model: a phase without a role is refused, beside the field that causes it
2026-10-10T21:22:07.1887821Z   ---
2026-10-10T21:22:07.1888165Z   duration_ms: 0.446354
2026-10-10T21:22:07.1888585Z   type: 'test'
2026-10-10T21:22:07.1889174Z   ...
2026-10-10T21:22:07.1890677Z # Subtest: release · process model: a missing declaration of whether work is planned or pulled is refused, beside the field that causes it
2026-10-10T21:22:07.1892852Z ok 543 - release · process model: a missing declaration of whether work is planned or pulled is refused, beside the field that causes it
2026-10-10T21:22:07.1893935Z   ---
2026-10-10T21:22:07.1894296Z   duration_ms: 0.581172
2026-10-10T21:22:07.1894703Z   type: 'test'
2026-10-10T21:22:07.1895092Z   ...
2026-10-10T21:22:07.1896218Z # Subtest: release · process model: a gate without a decider is refused, beside the field that causes it
2026-10-10T21:22:07.1897713Z ok 544 - release · process model: a gate without a decider is refused, beside the field that causes it
2026-10-10T21:22:07.1898488Z   ---
2026-10-10T21:22:07.1898836Z   duration_ms: 0.652016
2026-10-10T21:22:07.1899210Z   type: 'test'
2026-10-10T21:22:07.1899537Z   ...
2026-10-10T21:22:07.1900782Z # Subtest: release · process model: a gate decided by a role the model does not define is refused, beside the field that causes it
2026-10-10T21:22:07.1902817Z ok 545 - release · process model: a gate decided by a role the model does not define is refused, beside the field that causes it
2026-10-10T21:22:07.1903592Z   ---
2026-10-10T21:22:07.1903901Z   duration_ms: 0.616949
2026-10-10T21:22:07.1904247Z   type: 'test'
2026-10-10T21:22:07.1904539Z   ...
2026-10-10T21:22:07.1905625Z # Subtest: release · process model: a phase no transition reaches is refused, beside the field that causes it
2026-10-10T21:22:07.1907379Z ok 546 - release · process model: a phase no transition reaches is refused, beside the field that causes it
2026-10-10T21:22:07.1908193Z   ---
2026-10-10T21:22:07.1908473Z   duration_ms: 0.830665
2026-10-10T21:22:07.1908785Z   type: 'test'
2026-10-10T21:22:07.1909057Z   ...
2026-10-10T21:22:07.1910299Z # Subtest: release · process model: a gate that checks an artifact kind no earlier phase produces is refused, beside the field that causes it
2026-10-10T21:22:07.1912416Z ok 547 - release · process model: a gate that checks an artifact kind no earlier phase produces is refused, beside the field that causes it
2026-10-10T21:22:07.1913399Z   ---
2026-10-10T21:22:07.1913714Z   duration_ms: 0.238241
2026-10-10T21:22:07.1914079Z   type: 'test'
2026-10-10T21:22:07.1914357Z   ...
2026-10-10T21:22:07.1915507Z # Subtest: release · process model: pulled work with neither a time box nor a WIP limit is refused, beside the field that causes it
2026-10-10T21:22:07.1917298Z ok 548 - release · process model: pulled work with neither a time box nor a WIP limit is refused, beside the field that causes it
2026-10-10T21:22:07.1918136Z   ---
2026-10-10T21:22:07.1918457Z   duration_ms: 0.213478
2026-10-10T21:22:07.1918827Z   type: 'test'
2026-10-10T21:22:07.1919132Z   ...
2026-10-10T21:22:07.1920303Z # Subtest: release · process model: pulled work with both a time box and a WIP limit is refused, beside the field that causes it
2026-10-10T21:22:07.1922235Z ok 549 - release · process model: pulled work with both a time box and a WIP limit is refused, beside the field that causes it
2026-10-10T21:22:07.1923123Z   ---
2026-10-10T21:22:07.1923478Z   duration_ms: 0.241185
2026-10-10T21:22:07.1923862Z   type: 'test'
2026-10-10T21:22:07.1924189Z   ...
2026-10-10T21:22:07.1925467Z # Subtest: release · process model: a progress measure that does not fit the kind of work is refused, beside the field that causes it
2026-10-10T21:22:07.1927283Z ok 550 - release · process model: a progress measure that does not fit the kind of work is refused, beside the field that causes it
2026-10-10T21:22:07.1928197Z   ---
2026-10-10T21:22:07.1928527Z   duration_ms: 0.258434
2026-10-10T21:22:07.1928883Z   type: 'test'
2026-10-10T21:22:07.1929170Z   ...
2026-10-10T21:22:07.1930069Z # Subtest: release · process model: an unknown progress measure is refused, beside the field that causes it
2026-10-10T21:22:07.1931440Z ok 551 - release · process model: an unknown progress measure is refused, beside the field that causes it
2026-10-10T21:22:07.1932574Z   ---
2026-10-10T21:22:07.1932888Z   duration_ms: 0.504498
2026-10-10T21:22:07.1933229Z   type: 'test'
2026-10-10T21:22:07.1933523Z   ...
2026-10-10T21:22:07.1934436Z # Subtest: release · process model: a gate decided by a role and one decided by a named CI check both pass
2026-10-10T21:22:07.1935601Z ok 552 - release · process model: a gate decided by a role and one decided by a named CI check both pass
2026-10-10T21:22:07.1936360Z   ---
2026-10-10T21:22:07.1936678Z   duration_ms: 0.473946
2026-10-10T21:22:07.1937039Z   type: 'test'
2026-10-10T21:22:07.1937352Z   ...
2026-10-10T21:22:07.1938443Z # Subtest: release · process model: validation leaves the definition as it was, and names every error of a definition with two
2026-10-10T21:22:07.1940150Z ok 553 - release · process model: validation leaves the definition as it was, and names every error of a definition with two
2026-10-10T21:22:07.1941010Z   ---
2026-10-10T21:22:07.1941329Z   duration_ms: 0.426293
2026-10-10T21:22:07.1941711Z   type: 'test'
2026-10-10T21:22:07.1942305Z   ...
2026-10-10T21:22:07.1943454Z # Subtest: release · work items: this backlog parses without a problem — each item names what it realises and where it came from
2026-10-10T21:22:07.1945103Z ok 554 - release · work items: this backlog parses without a problem — each item names what it realises and where it came from
2026-10-10T21:22:07.1945939Z   ---
2026-10-10T21:22:07.1946276Z   duration_ms: 830.559473
2026-10-10T21:22:07.1946829Z   type: 'test'
2026-10-10T21:22:07.1947132Z   ...
2026-10-10T21:22:07.1948346Z # Subtest: release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not
2026-10-10T21:22:07.1949999Z ok 555 - release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not
2026-10-10T21:22:07.1950844Z   ---
2026-10-10T21:22:07.1951165Z   duration_ms: 0.78815
2026-10-10T21:22:07.1951523Z   type: 'test'
2026-10-10T21:22:07.1951855Z   ...
2026-10-10T21:22:07.1952970Z # Subtest: release · work items: an item naming a requirement or use case the product does not have is an error
2026-10-10T21:22:07.1954427Z ok 556 - release · work items: an item naming a requirement or use case the product does not have is an error
2026-10-10T21:22:07.1955239Z   ---
2026-10-10T21:22:07.1955561Z   duration_ms: 0.303401
2026-10-10T21:22:07.1955939Z   type: 'test'
2026-10-10T21:22:07.1956268Z   ...
2026-10-10T21:22:07.1957162Z # Subtest: release · work items: an item that restates an existing one is flagged, not rejected
2026-10-10T21:22:07.1958404Z ok 557 - release · work items: an item that restates an existing one is flagged, not rejected
2026-10-10T21:22:07.1959058Z   ---
2026-10-10T21:22:07.1959346Z   duration_ms: 0.286105
2026-10-10T21:22:07.1959705Z   type: 'test'
2026-10-10T21:22:07.1960015Z   ...
2026-10-10T21:22:07.1960811Z # Subtest: release · work items: an item kept outside docs/backlog/ is an error
2026-10-10T21:22:07.1962048Z ok 558 - release · work items: an item kept outside docs/backlog/ is an error
2026-10-10T21:22:07.1962760Z   ---
2026-10-10T21:22:07.1963076Z   duration_ms: 0.339933
2026-10-10T21:22:07.1963435Z   type: 'test'
2026-10-10T21:22:07.1963738Z   ...
2026-10-10T21:22:07.1964807Z # Subtest: release · work items: this backlog's order places every item once, and appends the unnamed at the bottom
2026-10-10T21:22:07.1966359Z ok 559 - release · work items: this backlog's order places every item once, and appends the unnamed at the bottom
2026-10-10T21:22:07.1967176Z   ---
2026-10-10T21:22:07.1967480Z   duration_ms: 0.792499
2026-10-10T21:22:07.1967846Z   type: 'test'
2026-10-10T21:22:07.1968156Z   ...
2026-10-10T21:22:07.1969248Z # Subtest: release · work items: an order that names an unknown item or one twice is a problem; the unnamed are appended
2026-10-10T21:22:07.1970811Z ok 560 - release · work items: an order that names an unknown item or one twice is a problem; the unnamed are appended
2026-10-10T21:22:07.1971847Z   ---
2026-10-10T21:22:07.1972310Z   duration_ms: 0.291822
2026-10-10T21:22:07.1972683Z   type: 'test'
2026-10-10T21:22:07.1973011Z   ...
2026-10-10T21:22:07.1974158Z # Subtest: release · work items: an item from an issue names the issue as its origin, and realises what its class says
2026-10-10T21:22:07.1975788Z ok 561 - release · work items: an item from an issue names the issue as its origin, and realises what its class says
2026-10-10T21:22:07.1976601Z   ---
2026-10-10T21:22:07.1976940Z   duration_ms: 0.362304
2026-10-10T21:22:07.1977320Z   type: 'test'
2026-10-10T21:22:07.1977651Z   ...
2026-10-10T21:22:07.1978748Z # Subtest: release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted
2026-10-10T21:22:07.1980358Z ok 562 - release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted
2026-10-10T21:22:07.1981135Z   ---
2026-10-10T21:22:07.1981463Z   duration_ms: 0.827894
2026-10-10T21:22:07.1981848Z   type: 'test'
2026-10-10T21:22:07.1982343Z   ...
2026-10-10T21:22:07.1983262Z # Subtest: release · work items: an item file naming two issues as its origin is read with both
2026-10-10T21:22:07.1984626Z ok 563 - release · work items: an item file naming two issues as its origin is read with both
2026-10-10T21:22:07.1985374Z   ---
2026-10-10T21:22:07.1985706Z   duration_ms: 0.45945
2026-10-10T21:22:07.1986093Z   type: 'test'
2026-10-10T21:22:07.1986420Z   ...
2026-10-10T21:22:07.1987502Z # Subtest: release · work items: this sprint's record is read with its selection in order, and stores no state
2026-10-10T21:22:07.1989221Z ok 564 - release · work items: this sprint's record is read with its selection in order, and stores no state
2026-10-10T21:22:07.1989999Z   ---
2026-10-10T21:22:07.1990312Z   duration_ms: 0.872804
2026-10-10T21:22:07.1990689Z   type: 'test'
2026-10-10T21:22:07.1991028Z   ...
2026-10-10T21:22:07.1992325Z # Subtest: release · work items: with limit 2 and two items in progress a third start is refused with the limit named
2026-10-10T21:22:07.1993939Z ok 565 - release · work items: with limit 2 and two items in progress a third start is refused with the limit named
2026-10-10T21:22:07.1994739Z   ---
2026-10-10T21:22:07.1995065Z   duration_ms: 0.895816
2026-10-10T21:22:07.1995443Z   type: 'test'
2026-10-10T21:22:07.1995783Z   ...
2026-10-10T21:22:07.1996707Z # Subtest: release · work items: an item outside the running sprint's selection is refused
2026-10-10T21:22:07.1997955Z ok 566 - release · work items: an item outside the running sprint's selection is refused
2026-10-10T21:22:07.1998667Z   ---
2026-10-10T21:22:07.1999004Z   duration_ms: 0.379516
2026-10-10T21:22:07.1999375Z   type: 'test'
2026-10-10T21:22:07.1999701Z   ...
2026-10-10T21:22:07.2000580Z # Subtest: release · work items: a job without an item is refused, in Scrum and in Kanban
2026-10-10T21:22:07.2001789Z ok 567 - release · work items: a job without an item is refused, in Scrum and in Kanban
2026-10-10T21:22:07.2002643Z   ---
2026-10-10T21:22:07.2003003Z   duration_ms: 0.218155
2026-10-10T21:22:07.2003387Z   type: 'test'
2026-10-10T21:22:07.2003720Z   ...
2026-10-10T21:22:07.2004735Z # Subtest: release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts
2026-10-10T21:22:07.2006287Z ok 568 - release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts
2026-10-10T21:22:07.2007049Z   ---
2026-10-10T21:22:07.2007430Z   duration_ms: 0.173351
2026-10-10T21:22:07.2007825Z   type: 'test'
2026-10-10T21:22:07.2008170Z   ...
2026-10-10T21:22:07.2009187Z # Subtest: release · work items: an item's state follows its pull requests, not a field of its file
2026-10-10T21:22:07.2010557Z ok 569 - release · work items: an item's state follows its pull requests, not a field of its file
2026-10-10T21:22:07.2011262Z   ---
2026-10-10T21:22:07.2011586Z   duration_ms: 0.33504
2026-10-10T21:22:07.2012120Z   type: 'test'
2026-10-10T21:22:07.2012475Z   ...
2026-10-10T21:22:07.2013643Z # Subtest: release · requirements: a source named as it is written, with its date, is no error and needs no SRC- identifier
2026-10-10T21:22:07.2015644Z ok 570 - release · requirements: a source named as it is written, with its date, is no error and needs no SRC- identifier
2026-10-10T21:22:07.2016499Z   ---
2026-10-10T21:22:07.2016830Z   duration_ms: 4.19015
2026-10-10T21:22:07.2017219Z   type: 'test'
2026-10-10T21:22:07.2017559Z   ...
2026-10-10T21:22:07.2018570Z # Subtest: release · requirements: an SRC- identifier must be linked to the product; a linked one passes
2026-10-10T21:22:07.2020063Z ok 571 - release · requirements: an SRC- identifier must be linked to the product; a linked one passes
2026-10-10T21:22:07.2020872Z   ---
2026-10-10T21:22:07.2021181Z   duration_ms: 0.615298
2026-10-10T21:22:07.2021556Z   type: 'test'
2026-10-10T21:22:07.2022025Z   ...
2026-10-10T21:22:07.2022958Z # Subtest: release · requirements: a resource entry named as source is an error
2026-10-10T21:22:07.2024112Z ok 572 - release · requirements: a resource entry named as source is an error
2026-10-10T21:22:07.2024747Z   ---
2026-10-10T21:22:07.2025086Z   duration_ms: 1.089304
2026-10-10T21:22:07.2025472Z   type: 'test'
2026-10-10T21:22:07.2025782Z   ...
2026-10-10T21:22:07.2026825Z # Subtest: release · requirements: a source without a date, an empty source and a date alone are errors
2026-10-10T21:22:07.2028332Z ok 573 - release · requirements: a source without a date, an empty source and a date alone are errors
2026-10-10T21:22:07.2029267Z   ---
2026-10-10T21:22:07.2029601Z   duration_ms: 0.776386
2026-10-10T21:22:07.2029978Z   type: 'test'
2026-10-10T21:22:07.2030306Z   ...
2026-10-10T21:22:07.2031206Z # Subtest: release · requirements: a requirement written without any source is an error
2026-10-10T21:22:07.2032620Z ok 574 - release · requirements: a requirement written without any source is an error
2026-10-10T21:22:07.2033337Z   ---
2026-10-10T21:22:07.2033677Z   duration_ms: 0.475645
2026-10-10T21:22:07.2034064Z   type: 'test'
2026-10-10T21:22:07.2034421Z   ...
2026-10-10T21:22:07.2035545Z # Subtest: release · reader: a withdrawn requirement is marked, bold prose and a quoted name are no requirement
2026-10-10T21:22:07.2037209Z ok 575 - release · reader: a withdrawn requirement is marked, bold prose and a quoted name are no requirement
2026-10-10T21:22:07.2038055Z   ---
2026-10-10T21:22:07.2038392Z   duration_ms: 0.340674
2026-10-10T21:22:07.2038797Z   type: 'test'
2026-10-10T21:22:07.2039138Z   ...
2026-10-10T21:22:07.2040130Z # Subtest: release · pull requests: GitHub and GitLab give the same pull requests in one shape
2026-10-10T21:22:07.2041487Z ok 576 - release · pull requests: GitHub and GitLab give the same pull requests in one shape
2026-10-10T21:22:07.2042355Z   ---
2026-10-10T21:22:07.2042683Z   duration_ms: 23.172196
2026-10-10T21:22:07.2043091Z   type: 'test'
2026-10-10T21:22:07.2043416Z   ...
2026-10-10T21:22:07.2044498Z # Subtest: release · pull requests: a field the GitLab answer lacks is null, never taken from another field
2026-10-10T21:22:07.2046045Z ok 577 - release · pull requests: a field the GitLab answer lacks is null, never taken from another field
2026-10-10T21:22:07.2046844Z   ---
2026-10-10T21:22:07.2047164Z   duration_ms: 1.902197
2026-10-10T21:22:07.2047523Z   type: 'test'
2026-10-10T21:22:07.2047831Z   ...
2026-10-10T21:22:07.2048954Z # Subtest: release · pull requests: open, merged and closed are told apart on both hosts, and a base branch is kept to
2026-10-10T21:22:07.2050650Z ok 578 - release · pull requests: open, merged and closed are told apart on both hosts, and a base branch is kept to
2026-10-10T21:22:07.2051474Z   ---
2026-10-10T21:22:07.2051786Z   duration_ms: 2.935676
2026-10-10T21:22:07.2052329Z   type: 'test'
2026-10-10T21:22:07.2052632Z   ...
2026-10-10T21:22:07.2053716Z # Subtest: release · pull requests: each token is seen only at its own server, never in a URL, and nothing is written
2026-10-10T21:22:07.2055359Z ok 579 - release · pull requests: each token is seen only at its own server, never in a URL, and nothing is written
2026-10-10T21:22:07.2056416Z   ---
2026-10-10T21:22:07.2056771Z   duration_ms: 2.335978
2026-10-10T21:22:07.2057154Z   type: 'test'
2026-10-10T21:22:07.2057480Z   ...
2026-10-10T21:22:07.2058355Z # Subtest: release · pull requests: a list with a date reads only as far back as that date
2026-10-10T21:22:07.2059622Z ok 580 - release · pull requests: a list with a date reads only as far back as that date
2026-10-10T21:22:07.2060271Z   ---
2026-10-10T21:22:07.2060629Z   duration_ms: 13.087358
2026-10-10T21:22:07.2061021Z   type: 'test'
2026-10-10T21:22:07.2061346Z   ...
2026-10-10T21:22:07.2062665Z # Subtest: release · gates: a SPEC change is written only with its acceptance, and only its own section
2026-10-10T21:22:07.2064085Z ok 581 - release · gates: a SPEC change is written only with its acceptance, and only its own section
2026-10-10T21:22:07.2064817Z   ---
2026-10-10T21:22:07.2065149Z   duration_ms: 12.073078
2026-10-10T21:22:07.2065524Z   type: 'test'
2026-10-10T21:22:07.2065860Z   ...
2026-10-10T21:22:07.2066966Z # Subtest: release · gates: the approved text is written byte for byte, on the dashboard's and on the workflow's route
2026-10-10T21:22:07.2068570Z ok 582 - release · gates: the approved text is written byte for byte, on the dashboard's and on the workflow's route
2026-10-10T21:22:07.2069409Z   ---
2026-10-10T21:22:07.2069746Z   duration_ms: 2.963591
2026-10-10T21:22:07.2070116Z   type: 'test'
2026-10-10T21:22:07.2070437Z   ...
2026-10-10T21:22:07.2071669Z # Subtest: release · gates: the current text beside a proposal is the section as it stands, byte for byte
2026-10-10T21:22:07.2073274Z ok 583 - release · gates: the current text beside a proposal is the section as it stands, byte for byte
2026-10-10T21:22:07.2074021Z   ---
2026-10-10T21:22:07.2074380Z   duration_ms: 1.362509
2026-10-10T21:22:07.2074765Z   type: 'test'
2026-10-10T21:22:07.2075086Z   ...
2026-10-10T21:22:07.2076098Z # Subtest: release · gates: the replaced section is reachable in git history and kept nowhere in the tree
2026-10-10T21:22:07.2085612Z ok 584 - release · gates: the replaced section is reachable in git history and kept nowhere in the tree
2026-10-10T21:22:07.2086386Z   ---
2026-10-10T21:22:07.2086734Z   duration_ms: 36.192742
2026-10-10T21:22:07.2087094Z   type: 'test'
2026-10-10T21:22:07.2087389Z   ...
2026-10-10T21:22:07.2088381Z # Subtest: release · gates: a file on the default branch is open until a record names its current text
2026-10-10T21:22:07.2089850Z ok 585 - release · gates: a file on the default branch is open until a record names its current text
2026-10-10T21:22:07.2090642Z   ---
2026-10-10T21:22:07.2090978Z   duration_ms: 3.289838
2026-10-10T21:22:07.2091360Z   type: 'test'
2026-10-10T21:22:07.2091671Z   ...
2026-10-10T21:22:07.2092666Z # Subtest: release · gates: records are not of a reviewed kind; a use case is
2026-10-10T21:22:07.2093816Z ok 586 - release · gates: records are not of a reviewed kind; a use case is
2026-10-10T21:22:07.2094428Z   ---
2026-10-10T21:22:07.2094785Z   duration_ms: 0.203277
2026-10-10T21:22:07.2095156Z   type: 'test'
2026-10-10T21:22:07.2095497Z   ...
2026-10-10T21:22:07.2096474Z # Subtest: release · gates: a job record without approval is not open; a use case without approval is
2026-10-10T21:22:07.2099176Z not ok 587 - release · gates: a job record without approval is not open; a use case without approval is # TODO finding G1 (ITM-014, docs/measurements/2026-10-01_approval-gates-counter-proofs.md) — back to Development: the engine answers "open" for a record
2026-10-10T21:22:07.2100779Z   ---
2026-10-10T21:22:07.2101136Z   duration_ms: 1.43807
2026-10-10T21:22:07.2101508Z   type: 'test'
2026-10-10T21:22:07.2102467Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:266:1'
2026-10-10T21:22:07.2103372Z   failureType: 'testCodeFailure'
2026-10-10T21:22:07.2103901Z   error: 'docs/jobs/JOB-20261001-0900-a1b2.md'
2026-10-10T21:22:07.2104392Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:07.2104807Z   name: 'AssertionError'
2026-10-10T21:22:07.2105469Z   expected: 'open'
2026-10-10T21:22:07.2105820Z   actual: 'open'
2026-10-10T21:22:07.2106169Z   operator: 'notStrictEqual'
2026-10-10T21:22:07.2106532Z   stack: |-
2026-10-10T21:22:07.2107490Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:271:14)
2026-10-10T21:22:07.2108468Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:07.2109252Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:07.2109906Z   ...
2026-10-10T21:22:07.2110874Z # Subtest: release · gates: an acceptance handed a job record writes no approval record for it
2026-10-10T21:22:07.2113826Z not ok 588 - release · gates: an acceptance handed a job record writes no approval record for it # TODO finding G2 (ITM-014, docs/measurements/2026-10-01_approval-gates-counter-proofs.md) — back to Development: planAcceptance writes kind: use-case for it
2026-10-10T21:22:07.2115548Z   ---
2026-10-10T21:22:07.2115898Z   duration_ms: 2.334145
2026-10-10T21:22:07.2116272Z   type: 'test'
2026-10-10T21:22:07.2117045Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:282:1'
2026-10-10T21:22:07.2117933Z   failureType: 'testCodeFailure'
2026-10-10T21:22:07.2118311Z   error: |-
2026-10-10T21:22:07.2118691Z     Expected values to be strictly deep-equal:
2026-10-10T21:22:07.2119131Z     + actual - expected
2026-10-10T21:22:07.2119725Z     
2026-10-10T21:22:07.2120190Z     + [
2026-10-10T21:22:07.2120489Z     +   {
2026-10-10T21:22:07.2120806Z     +     content: 'kind: use-case\n' +
2026-10-10T21:22:07.2121150Z     +       'file: docs/jobs/JOB-20261001-0900-a1b2.md\n' +
2026-10-10T21:22:07.2121522Z     +       'blob: 5b58e565c8554718a06691423921af37e16e31e4\n',
2026-10-10T21:22:07.2122137Z     +     path: 'docs/approvals/JOB-20261001-0900-a1b2-5b58e565c855.md'
2026-10-10T21:22:07.2123878Z     +   }
2026-10-10T21:22:07.2124059Z     + ]
2026-10-10T21:22:07.2124262Z     - []
2026-10-10T21:22:07.2124434Z     
2026-10-10T21:22:07.2124614Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:07.2124841Z   name: 'AssertionError'
2026-10-10T21:22:07.2125061Z   expected:
2026-10-10T21:22:07.2125237Z   actual:
2026-10-10T21:22:07.2125411Z     0:
2026-10-10T21:22:07.2125722Z       path: 'docs/approvals/JOB-20261001-0900-a1b2-5b58e565c855.md'
2026-10-10T21:22:07.2126044Z       content: |-
2026-10-10T21:22:07.2126250Z         kind: use-case
2026-10-10T21:22:07.2126530Z         file: docs/jobs/JOB-20261001-0900-a1b2.md
2026-10-10T21:22:07.2126870Z         blob: 5b58e565c8554718a06691423921af37e16e31e4
2026-10-10T21:22:07.2127141Z         
2026-10-10T21:22:07.2127352Z   operator: 'deepStrictEqual'
2026-10-10T21:22:07.2127581Z   stack: |-
2026-10-10T21:22:07.2128109Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:287:12)
2026-10-10T21:22:07.2128722Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:07.2129184Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:07.2129545Z   ...
2026-10-10T21:22:07.2130457Z # Subtest: release · applyApprovals: a stale or malformed record is refused by name and nothing is written
2026-10-10T21:22:07.2131297Z ok 589 - release · applyApprovals: a stale or malformed record is refused by name and nothing is written
2026-10-10T21:22:07.2131745Z   ---
2026-10-10T21:22:07.2132100Z   duration_ms: 4.013017
2026-10-10T21:22:07.2132336Z   type: 'test'
2026-10-10T21:22:07.2132551Z   ...
2026-10-10T21:22:07.2133178Z # Subtest: release · applyApprovals: several records in one run — each written, in order, a stale one refused beside them
2026-10-10T21:22:07.2134090Z ok 590 - release · applyApprovals: several records in one run — each written, in order, a stale one refused beside them
2026-10-10T21:22:07.2134570Z   ---
2026-10-10T21:22:07.2134763Z   duration_ms: 2.669823
2026-10-10T21:22:07.2134978Z   type: 'test'
2026-10-10T21:22:07.2135338Z   ...
2026-10-10T21:22:07.2135856Z # Subtest: release · applyApprovals: the same files, bytes and report as tools/apply_approvals.py
2026-10-10T21:22:07.2136603Z ok 591 - release · applyApprovals: the same files, bytes and report as tools/apply_approvals.py
2026-10-10T21:22:07.2137014Z   ---
2026-10-10T21:22:07.2137197Z   duration_ms: 43.16467
2026-10-10T21:22:07.2137414Z   type: 'test'
2026-10-10T21:22:07.2137606Z   ...
2026-10-10T21:22:07.2138091Z # Subtest: release · UC-022: a decision is accepted only when everything it names is accepted
2026-10-10T21:22:07.2138795Z ok 592 - release · UC-022: a decision is accepted only when everything it names is accepted
2026-10-10T21:22:07.2139172Z   ---
2026-10-10T21:22:07.2139354Z   duration_ms: 5.088755
2026-10-10T21:22:07.2139559Z   type: 'test'
2026-10-10T21:22:07.2139754Z   ...
2026-10-10T21:22:07.2140344Z # Subtest: ITM-131 · a use case: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2141465Z ok 593 - ITM-131 · a use case: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2142086Z   ---
2026-10-10T21:22:07.2142280Z   duration_ms: 298.338176
2026-10-10T21:22:07.2142506Z   type: 'test'
2026-10-10T21:22:07.2142701Z   ...
2026-10-10T21:22:07.2143658Z # Subtest: ITM-131 · an architecture decision: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2145336Z ok 594 - ITM-131 · an architecture decision: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2146478Z   ---
2026-10-10T21:22:07.2146790Z   duration_ms: 186.940801
2026-10-10T21:22:07.2147168Z   type: 'test'
2026-10-10T21:22:07.2147466Z   ...
2026-10-10T21:22:07.2148419Z # Subtest: ITM-131 · a module: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2150117Z ok 595 - ITM-131 · a module: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2150985Z   ---
2026-10-10T21:22:07.2151315Z   duration_ms: 163.596838
2026-10-10T21:22:07.2151688Z   type: 'test'
2026-10-10T21:22:07.2152120Z   ...
2026-10-10T21:22:07.2153254Z # Subtest: ITM-131 · a SPEC change proposal: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2155103Z ok 596 - ITM-131 · a SPEC change proposal: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:22:07.2156124Z   ---
2026-10-10T21:22:07.2156501Z   duration_ms: 199.785365
2026-10-10T21:22:07.2156987Z   type: 'test'
2026-10-10T21:22:07.2157335Z   ...
2026-10-10T21:22:07.2158397Z # Subtest: ITM-131 · without a commit meanwhile, Save commits the edit and shows no newer version
2026-10-10T21:22:07.2159811Z ok 597 - ITM-131 · without a commit meanwhile, Save commits the edit and shows no newer version
2026-10-10T21:22:07.2160597Z   ---
2026-10-10T21:22:07.2160944Z   duration_ms: 160.699747
2026-10-10T21:22:07.2161326Z   type: 'test'
2026-10-10T21:22:07.2161659Z   ...
2026-10-10T21:22:07.2162671Z # Subtest: ITM-134 · an entry that adds a new requirement shows no impact list
2026-10-10T21:22:07.2163818Z ok 598 - ITM-134 · an entry that adds a new requirement shows no impact list
2026-10-10T21:22:07.2164610Z   ---
2026-10-10T21:22:07.2164936Z   duration_ms: 110.110369
2026-10-10T21:22:07.2165322Z   type: 'test'
2026-10-10T21:22:07.2165648Z   ...
2026-10-10T21:22:07.2166500Z # Subtest: ITM-134 · an entry withdrawing a requirement lists what still names it
2026-10-10T21:22:07.2167733Z ok 599 - ITM-134 · an entry withdrawing a requirement lists what still names it
2026-10-10T21:22:07.2168462Z   ---
2026-10-10T21:22:07.2168795Z   duration_ms: 110.427547
2026-10-10T21:22:07.2169177Z   type: 'test'
2026-10-10T21:22:07.2169501Z   ...
2026-10-10T21:22:07.2170487Z # Subtest: ITM-134 · an entry that takes a requirement out of its section lists what references it
2026-10-10T21:22:07.2172241Z ok 600 - ITM-134 · an entry that takes a requirement out of its section lists what references it
2026-10-10T21:22:07.2173283Z   ---
2026-10-10T21:22:07.2173635Z   duration_ms: 221.376274
2026-10-10T21:22:07.2174043Z   type: 'test'
2026-10-10T21:22:07.2174328Z   ...
2026-10-10T21:22:07.2175403Z # Subtest: ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included
2026-10-10T21:22:07.2177165Z ok 601 - ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included
2026-10-10T21:22:07.2178069Z   ---
2026-10-10T21:22:07.2178394Z   duration_ms: 2.039858
2026-10-10T21:22:07.2178775Z   type: 'test'
2026-10-10T21:22:07.2179115Z   ...
2026-10-10T21:22:07.2179855Z # Subtest: ITM-125 · every secret the store keeps says what it grants
2026-10-10T21:22:07.2180854Z ok 602 - ITM-125 · every secret the store keeps says what it grants
2026-10-10T21:22:07.2181439Z   ---
2026-10-10T21:22:07.2181778Z   duration_ms: 0.546523
2026-10-10T21:22:07.2182319Z   type: 'test'
2026-10-10T21:22:07.2182691Z   ...
2026-10-10T21:22:07.2183840Z # Subtest: ITM-018 · what traces to a requirement is derived from the artifacts, never from a matrix kept by hand
2026-10-10T21:22:07.2185347Z ok 603 - ITM-018 · what traces to a requirement is derived from the artifacts, never from a matrix kept by hand
2026-10-10T21:22:07.2186091Z   ---
2026-10-10T21:22:07.2186409Z   duration_ms: 26.329243
2026-10-10T21:22:07.2186775Z   type: 'test'
2026-10-10T21:22:07.2187095Z   ...
2026-10-10T21:22:07.2188189Z # Subtest: ITM-018 · references are followed by identifier; a position is no reference
2026-10-10T21:22:07.2189451Z ok 604 - ITM-018 · references are followed by identifier; a position is no reference
2026-10-10T21:22:07.2190107Z   ---
2026-10-10T21:22:07.2190385Z   duration_ms: 3.533476
2026-10-10T21:22:07.2190733Z   type: 'test'
2026-10-10T21:22:07.2191030Z   ...
2026-10-10T21:22:07.2192047Z # Subtest: ITM-018 · coverage gaps are listed with the withdrawal note, and they block nothing
2026-10-10T21:22:07.2193337Z ok 605 - ITM-018 · coverage gaps are listed with the withdrawal note, and they block nothing
2026-10-10T21:22:07.2194009Z   ---
2026-10-10T21:22:07.2194296Z   duration_ms: 2.6626
2026-10-10T21:22:07.2198678Z   type: 'test'
2026-10-10T21:22:07.2199027Z   ...
2026-10-10T21:22:07.2199889Z # Subtest: ITM-018 · module rows and every gap of UC-025, none of them an error
2026-10-10T21:22:07.2200998Z ok 606 - ITM-018 · module rows and every gap of UC-025, none of them an error
2026-10-10T21:22:07.2201670Z   ---
2026-10-10T21:22:07.2202154Z   duration_ms: 3.555846
2026-10-10T21:22:07.2202476Z   type: 'test'
2026-10-10T21:22:07.2202793Z   ...
2026-10-10T21:22:07.2203717Z # Subtest: ITM-018 · the impact list of a requirement names every artifact that references it
2026-10-10T21:22:07.2204997Z ok 607 - ITM-018 · the impact list of a requirement names every artifact that references it
2026-10-10T21:22:07.2205795Z   ---
2026-10-10T21:22:07.2206154Z   duration_ms: 1.470122
2026-10-10T21:22:07.2206539Z   type: 'test'
2026-10-10T21:22:07.2206847Z   ...
2026-10-10T21:22:07.2207765Z # Subtest: ITM-018 · an entry whose section no longer states a requirement touches that requirement
2026-10-10T21:22:07.2209132Z ok 608 - ITM-018 · an entry whose section no longer states a requirement touches that requirement
2026-10-10T21:22:07.2209880Z   ---
2026-10-10T21:22:07.2210235Z   duration_ms: 1.73443
2026-10-10T21:22:07.2210610Z   type: 'test'
2026-10-10T21:22:07.2210930Z   ...
2026-10-10T21:22:07.2212233Z # Subtest: ITM-018 · the impact list of an architecture change names what follows or uses it, with its code and tests
2026-10-10T21:22:07.2213846Z ok 609 - ITM-018 · the impact list of an architecture change names what follows or uses it, with its code and tests
2026-10-10T21:22:07.2214667Z   ---
2026-10-10T21:22:07.2214989Z   duration_ms: 14.990169
2026-10-10T21:22:07.2215369Z   type: 'test'
2026-10-10T21:22:07.2215707Z   ...
2026-10-10T21:22:07.2216798Z # Subtest: ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked
2026-10-10T21:22:07.2218574Z ok 610 - ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked
2026-10-10T21:22:07.2219376Z   ---
2026-10-10T21:22:07.2219679Z   duration_ms: 264.182994
2026-10-10T21:22:07.2220062Z   type: 'test'
2026-10-10T21:22:07.2220375Z   ...
2026-10-10T21:22:07.2221485Z # Subtest: ITM-203 · UC-025 step 5 — every module of Agent M is one box, inside the box of its subsystem and of no other
2026-10-10T21:22:07.2223363Z ok 611 - ITM-203 · UC-025 step 5 — every module of Agent M is one box, inside the box of its subsystem and of no other
2026-10-10T21:22:07.2224125Z   ---
2026-10-10T21:22:07.2224426Z   duration_ms: 301.335221
2026-10-10T21:22:07.2224769Z   type: 'test'
2026-10-10T21:22:07.2225024Z   ...
2026-10-10T21:22:07.2225354Z # 53 module boxes in 11 subsystem boxes
2026-10-10T21:22:07.2226533Z # Subtest: ITM-203 · UC-025 step 5 — one arrow from each module to each module it uses, however many of its interfaces it uses
2026-10-10T21:22:07.2228108Z ok 612 - ITM-203 · UC-025 step 5 — one arrow from each module to each module it uses, however many of its interfaces it uses
2026-10-10T21:22:07.2228881Z   ---
2026-10-10T21:22:07.2229182Z   duration_ms: 144.285847
2026-10-10T21:22:07.2229543Z   type: 'test'
2026-10-10T21:22:07.2229880Z   ...
2026-10-10T21:22:07.2230267Z # 387 arrows for 1093 used interfaces
2026-10-10T21:22:07.2231699Z # Subtest: ITM-203 · UC-025 step 5 — a used module that has no file is one box marked missing, where the arrows of its users end
2026-10-10T21:22:07.2233862Z ok 613 - ITM-203 · UC-025 step 5 — a used module that has no file is one box marked missing, where the arrows of its users end
2026-10-10T21:22:07.2234589Z   ---
2026-10-10T21:22:07.2234882Z   duration_ms: 287.414148
2026-10-10T21:22:07.2235228Z   type: 'test'
2026-10-10T21:22:07.2235527Z   ...
2026-10-10T21:22:07.2236183Z # without its file: "MOD-documents — missing", 31 arrows end there
2026-10-10T21:22:07.2237513Z # Subtest: ITM-203 · the page draws Agent M's component diagram without Mermaid's "Maximum text size in diagram exceeded"
2026-10-10T21:22:07.2239055Z ok 614 - ITM-203 · the page draws Agent M's component diagram without Mermaid's "Maximum text size in diagram exceeded"
2026-10-10T21:22:07.2239849Z   ---
2026-10-10T21:22:07.2240159Z   duration_ms: 160.450573
2026-10-10T21:22:07.2240536Z   type: 'test'
2026-10-10T21:22:07.2240855Z   ...
2026-10-10T21:22:07.2241270Z # 21672 characters, of at most 50000
2026-10-10T21:22:07.2242593Z # Subtest: ITM-203 · the explanation under the component diagram says what the diagram draws
2026-10-10T21:22:07.2243884Z ok 615 - ITM-203 · the explanation under the component diagram says what the diagram draws
2026-10-10T21:22:07.2244648Z   ---
2026-10-10T21:22:07.2245016Z   duration_ms: 132.04693
2026-10-10T21:22:07.2245419Z   type: 'test'
2026-10-10T21:22:07.2245742Z   ...
2026-10-10T21:22:07.2246762Z # Subtest: THE PROCESS MODEL IS DECLARED PER PRODUCT: no model is assumed; the product's own repository declares exactly one
2026-10-10T21:22:07.2248445Z ok 616 - THE PROCESS MODEL IS DECLARED PER PRODUCT: no model is assumed; the product's own repository declares exactly one
2026-10-10T21:22:07.2249380Z   ---
2026-10-10T21:22:07.2249703Z   duration_ms: 220.164742
2026-10-10T21:22:07.2250078Z   type: 'test'
2026-10-10T21:22:07.2250408Z   ...
2026-10-10T21:22:07.2251509Z # Subtest: A PROCESS MODEL ORGANISES PEOPLE AND AGENTS: each role is shown with whether a person, an agent or either may fill it
2026-10-10T21:22:07.2253397Z ok 617 - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS: each role is shown with whether a person, an agent or either may fill it
2026-10-10T21:22:07.2254361Z   ---
2026-10-10T21:22:07.2254680Z   duration_ms: 31.712505
2026-10-10T21:22:07.2255060Z   type: 'test'
2026-10-10T21:22:07.2255386Z   ...
2026-10-10T21:22:07.2256244Z # Subtest: AGENT M CARRIES THE BOOK'S CATALOGUE: the five models, and apart from them the four practices
2026-10-10T21:22:07.2257603Z ok 618 - AGENT M CARRIES THE BOOK'S CATALOGUE: the five models, and apart from them the four practices
2026-10-10T21:22:07.2258596Z   ---
2026-10-10T21:22:07.2258915Z   duration_ms: 31.554023
2026-10-10T21:22:07.2259283Z   type: 'test'
2026-10-10T21:22:07.2259591Z   ...
2026-10-10T21:22:07.2260438Z # Subtest: THE CATALOGUE IS DATA: a process model added as a data file is offered and used, no code changed
2026-10-10T21:22:07.2261773Z ok 619 - THE CATALOGUE IS DATA: a process model added as a data file is offered and used, no code changed
2026-10-10T21:22:07.2262738Z   ---
2026-10-10T21:22:07.2263065Z   duration_ms: 26.870673
2026-10-10T21:22:07.2263423Z   type: 'test'
2026-10-10T21:22:07.2263746Z   ...
2026-10-10T21:22:07.2264725Z # Subtest: THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's phases, and its gates where they sit
2026-10-10T21:22:07.2266318Z ok 620 - THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's phases, and its gates where they sit
2026-10-10T21:22:07.2267156Z   ---
2026-10-10T21:22:07.2267457Z   duration_ms: 22.518148
2026-10-10T21:22:07.2267803Z   type: 'test'
2026-10-10T21:22:07.2268108Z   ...
2026-10-10T21:22:07.2269075Z # Subtest: THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's transitions and its verification pairs
2026-10-10T21:22:07.2270587Z ok 621 - THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's transitions and its verification pairs
2026-10-10T21:22:07.2271471Z   ---
2026-10-10T21:22:07.2272160Z   duration_ms: 23.989031
2026-10-10T21:22:07.2272532Z   type: 'test'
2026-10-10T21:22:07.2272820Z   ...
2026-10-10T21:22:07.2273566Z # Subtest: A GATE NAMES WHAT IT CHECKS: each gate is shown with its artifacts and its condition
2026-10-10T21:22:07.2274713Z ok 622 - A GATE NAMES WHAT IT CHECKS: each gate is shown with its artifacts and its condition
2026-10-10T21:22:07.2275433Z   ---
2026-10-10T21:22:07.2275763Z   duration_ms: 18.550208
2026-10-10T21:22:07.2276107Z   type: 'test'
2026-10-10T21:22:07.2276433Z   ...
2026-10-10T21:22:07.2277226Z # Subtest: A PRACTICE IS NOT A MODEL: no practice is offered instead of a model; one added keeps the model
2026-10-10T21:22:07.2278511Z ok 623 - A PRACTICE IS NOT A MODEL: no practice is offered instead of a model; one added keeps the model
2026-10-10T21:22:07.2279222Z   ---
2026-10-10T21:22:07.2279545Z   duration_ms: 92.873372
2026-10-10T21:22:07.2279927Z   type: 'test'
2026-10-10T21:22:07.2280226Z   ...
2026-10-10T21:22:07.2281149Z # Subtest: A PROCESS REQUIREMENT ADDS TO THE MODEL: the requirement's gate is added, the model's own phases and gate stay
2026-10-10T21:22:07.2282789Z ok 624 - A PROCESS REQUIREMENT ADDS TO THE MODEL: the requirement's gate is added, the model's own phases and gate stay
2026-10-10T21:22:07.2283663Z   ---
2026-10-10T21:22:07.2284006Z   duration_ms: 20.556659
2026-10-10T21:22:07.2284384Z   type: 'test'
2026-10-10T21:22:07.2284682Z   ...
2026-10-10T21:22:07.2285750Z # Subtest: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY: Save commits onto the product's default branch, under the author's own token
2026-10-10T21:22:07.2287459Z ok 625 - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY: Save commits onto the product's default branch, under the author's own token
2026-10-10T21:22:07.2288368Z   ---
2026-10-10T21:22:07.2288691Z   duration_ms: 79.934987
2026-10-10T21:22:07.2289079Z   type: 'test'
2026-10-10T21:22:07.2289398Z   ...
2026-10-10T21:22:07.2290306Z # Subtest: ONE CLICK PER DECISION: one click on Save, once the declaration is complete, does all that follows
2026-10-10T21:22:07.2291556Z ok 626 - ONE CLICK PER DECISION: one click on Save, once the declaration is complete, does all that follows
2026-10-10T21:22:07.2292415Z   ---
2026-10-10T21:22:07.2292727Z   duration_ms: 76.955246
2026-10-10T21:22:07.2293090Z   type: 'test'
2026-10-10T21:22:07.2293361Z   ...
2026-10-10T21:22:07.2294252Z # Subtest: EVERY STEP EXPLAINS ITSELF: each step that asks something carries an explanation that can be expanded
2026-10-10T21:22:07.2295556Z ok 627 - EVERY STEP EXPLAINS ITSELF: each step that asks something carries an explanation that can be expanded
2026-10-10T21:22:07.2296548Z   ---
2026-10-10T21:22:07.2296874Z   duration_ms: 23.368206
2026-10-10T21:22:07.2297246Z   type: 'test'
2026-10-10T21:22:07.2297565Z   ...
2026-10-10T21:22:07.2298633Z # Subtest: A ROLE NAMES THE CAPABILITIES IT NEEDS: only a participant with all of them is offered, and one without them cannot be assigned
2026-10-10T21:22:07.2300267Z ok 628 - A ROLE NAMES THE CAPABILITIES IT NEEDS: only a participant with all of them is offered, and one without them cannot be assigned
2026-10-10T21:22:07.2301164Z   ---
2026-10-10T21:22:07.2301480Z   duration_ms: 24.544882
2026-10-10T21:22:07.2301843Z   type: 'test'
2026-10-10T21:22:07.2302507Z   ...
2026-10-10T21:22:07.2303414Z # Subtest: A PARTICIPANT DECLARES ITS CAPABILITIES: what a participant declares decides whether it is offered
2026-10-10T21:22:07.2304693Z ok 629 - A PARTICIPANT DECLARES ITS CAPABILITIES: what a participant declares decides whether it is offered
2026-10-10T21:22:07.2305531Z   ---
2026-10-10T21:22:07.2305842Z   duration_ms: 18.208956
2026-10-10T21:22:07.2306209Z   type: 'test'
2026-10-10T21:22:07.2306518Z   ...
2026-10-10T21:22:07.2307468Z # Subtest: A PARTICIPANT DECLARES WHERE IT PROCESSES DATA: each participant offered is shown with where it processes data
2026-10-10T21:22:07.2309027Z ok 630 - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA: each participant offered is shown with where it processes data
2026-10-10T21:22:07.2310156Z   ---
2026-10-10T21:22:07.2310486Z   duration_ms: 17.176161
2026-10-10T21:22:07.2310879Z   type: 'test'
2026-10-10T21:22:07.2311223Z   ...
2026-10-10T21:22:07.2312409Z # Subtest: A PRODUCT DECLARES ITS DEFINITION OF DONE: a condition the author adds is declared in the product's own repository
2026-10-10T21:22:07.2314179Z ok 631 - A PRODUCT DECLARES ITS DEFINITION OF DONE: a condition the author adds is declared in the product's own repository
2026-10-10T21:22:07.2315125Z   ---
2026-10-10T21:22:07.2315403Z   duration_ms: 100.206607
2026-10-10T21:22:07.2315768Z   type: 'test'
2026-10-10T21:22:07.2316120Z   ...
2026-10-10T21:22:07.2317188Z # Subtest: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, the Definition of Done shown is the job rules
2026-10-10T21:22:07.2318872Z ok 632 - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, the Definition of Done shown is the job rules
2026-10-10T21:22:07.2319753Z   ---
2026-10-10T21:22:07.2320083Z   duration_ms: 17.447271
2026-10-10T21:22:07.2320484Z   type: 'test'
2026-10-10T21:22:07.2320802Z   ...
2026-10-10T21:22:07.2321810Z # Subtest: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, no condition beyond the job rules
2026-10-10T21:22:07.2323406Z ok 633 - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, no condition beyond the job rules
2026-10-10T21:22:07.2324176Z   ---
2026-10-10T21:22:07.2324507Z   duration_ms: 20.173495
2026-10-10T21:22:07.2324858Z   type: 'test'
2026-10-10T21:22:07.2325160Z   ...
2026-10-10T21:22:07.2325983Z # Subtest: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: the sprint is given a branch of its own
2026-10-10T21:22:07.2327062Z ok 634 - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: the sprint is given a branch of its own
2026-10-10T21:22:07.2327935Z   ---
2026-10-10T21:22:07.2334717Z   duration_ms: 96.997763
2026-10-10T21:22:07.2335153Z   type: 'test'
2026-10-10T21:22:07.2335588Z   ...
2026-10-10T21:22:07.2337012Z # Subtest: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: merging the branch into the default branch is the gate at its end, decided by the Product Owner after the review
2026-10-10T21:22:07.2339127Z ok 635 - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: merging the branch into the default branch is the gate at its end, decided by the Product Owner after the review
2026-10-10T21:22:07.2340315Z   ---
2026-10-10T21:22:07.2340649Z   duration_ms: 22.970352
2026-10-10T21:22:07.2341054Z   type: 'test'
2026-10-10T21:22:07.2341477Z   ...
2026-10-10T21:22:07.2342990Z # Subtest: WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET: without a branch, the page says the work merges into the default branch
2026-10-10T21:22:07.2344880Z ok 636 - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET: without a branch, the page says the work merges into the default branch
2026-10-10T21:22:07.2345891Z   ---
2026-10-10T21:22:07.2346243Z   duration_ms: 36.045126
2026-10-10T21:22:07.2346640Z   type: 'test'
2026-10-10T21:22:07.2346975Z   ...
2026-10-10T21:22:07.2347858Z # Subtest: A GATE NAMES WHO DECIDES IT: each gate is shown with its decider, a role or an automated check
2026-10-10T21:22:07.2349081Z ok 637 - A GATE NAMES WHO DECIDES IT: each gate is shown with its decider, a role or an automated check
2026-10-10T21:22:07.2349856Z   ---
2026-10-10T21:22:07.2350194Z   duration_ms: 20.837239
2026-10-10T21:22:07.2350593Z   type: 'test'
2026-10-10T21:22:07.2350949Z   ...
2026-10-10T21:22:07.2352346Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file come to wait is notified, naming it and where it is
2026-10-10T21:22:07.2354164Z ok 638 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file come to wait is notified, naming it and where it is
2026-10-10T21:22:07.2355038Z   ---
2026-10-10T21:22:07.2355380Z   duration_ms: 253.918124
2026-10-10T21:22:07.2355792Z   type: 'test'
2026-10-10T21:22:07.2356129Z   ...
2026-10-10T21:22:07.2379989Z # Subtest: NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page asks before the click; the click asks once
2026-10-10T21:22:07.2381985Z ok 639 - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page asks before the click; the click asks once
2026-10-10T21:22:07.2382776Z   ---
2026-10-10T21:22:07.2383137Z   duration_ms: 158.583377
2026-10-10T21:22:07.2383556Z   type: 'test'
2026-10-10T21:22:07.2383903Z   ...
2026-10-10T21:22:07.2385006Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — accepted while the blob matches the record, waiting once it does not
2026-10-10T21:22:07.2386568Z ok 640 - STATUS IS DERIVED FROM THE RECORDS — accepted while the blob matches the record, waiting once it does not
2026-10-10T21:22:07.2387470Z   ---
2026-10-10T21:22:07.2387810Z   duration_ms: 157.112477
2026-10-10T21:22:07.2388226Z   type: 'test'
2026-10-10T21:22:07.2388567Z   ...
2026-10-10T21:22:07.2389847Z # Subtest: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting all local storage and reloading rederives the same facts
2026-10-10T21:22:07.2391609Z ok 641 - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting all local storage and reloading rederives the same facts
2026-10-10T21:22:07.2392766Z   ---
2026-10-10T21:22:07.2393073Z   duration_ms: 212.890165
2026-10-10T21:22:07.2393452Z   type: 'test'
2026-10-10T21:22:07.2393773Z   ...
2026-10-10T21:22:07.2394820Z # Subtest: CONFIGURATION LIVES IN THE BROWSER — Switch on is kept in this browser's storage; no write request is made
2026-10-10T21:22:07.2396434Z ok 642 - CONFIGURATION LIVES IN THE BROWSER — Switch on is kept in this browser's storage; no write request is made
2026-10-10T21:22:07.2397295Z   ---
2026-10-10T21:22:07.2397631Z   duration_ms: 151.538094
2026-10-10T21:22:07.2398023Z   type: 'test'
2026-10-10T21:22:07.2398340Z   ...
2026-10-10T21:22:07.2399550Z # Subtest: EVERY SETTING IS REACHED FROM ONE PAGE — the "notifications" key the dashboard writes has a place on the settings page
2026-10-10T21:22:07.2401417Z ok 643 - EVERY SETTING IS REACHED FROM ONE PAGE — the "notifications" key the dashboard writes has a place on the settings page
2026-10-10T21:22:07.2402563Z   ---
2026-10-10T21:22:07.2402925Z   duration_ms: 109.375386
2026-10-10T21:22:07.2403324Z   type: 'test'
2026-10-10T21:22:07.2403660Z   ...
2026-10-10T21:22:07.2404690Z # Subtest: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN — Test and Switch off sit together with the state
2026-10-10T21:22:07.2406307Z ok 644 - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN — Test and Switch off sit together with the state
2026-10-10T21:22:07.2407080Z   ---
2026-10-10T21:22:07.2407415Z   duration_ms: 194.628686
2026-10-10T21:22:07.2408098Z   type: 'test'
2026-10-10T21:22:07.2408440Z   ...
2026-10-10T21:22:07.2409589Z # Subtest: TST-280 A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a product's own token reaches only its own server
2026-10-10T21:22:07.2411207Z ok 645 - TST-280 A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a product's own token reaches only its own server
2026-10-10T21:22:07.2412177Z   ---
2026-10-10T21:22:07.2412508Z   duration_ms: 68.52237
2026-10-10T21:22:07.2412906Z   type: 'test'
2026-10-10T21:22:07.2413230Z   ...
2026-10-10T21:22:07.2414319Z # Subtest: EVERY STEP EXPLAINS ITSELF — the folded explanation names what, how often, whose tokens, and when not
2026-10-10T21:22:07.2415800Z ok 646 - EVERY STEP EXPLAINS ITSELF — the folded explanation names what, how often, whose tokens, and when not
2026-10-10T21:22:07.2416625Z   ---
2026-10-10T21:22:07.2416950Z   duration_ms: 106.157615
2026-10-10T21:22:07.2417333Z   type: 'test'
2026-10-10T21:22:07.2417657Z   ...
2026-10-10T21:22:07.2418688Z # Subtest: NO SERVER — every request a check makes goes to a repository server, never to any origin of Agent M's own
2026-10-10T21:22:07.2420241Z ok 647 - NO SERVER — every request a check makes goes to a repository server, never to any origin of Agent M's own
2026-10-10T21:22:07.2421099Z   ---
2026-10-10T21:22:07.2421380Z   duration_ms: 66.64942
2026-10-10T21:22:07.2421741Z   type: 'test'
2026-10-10T21:22:07.2422268Z   ...
2026-10-10T21:22:07.2422969Z # Subtest: TST-283 UC-001 release disclosure covers GitHub and GitLab product routes
2026-10-10T21:22:07.2424332Z ok 648 - TST-283 UC-001 release disclosure covers GitHub and GitLab product routes
2026-10-10T21:22:07.2428143Z   ---
2026-10-10T21:22:07.2428462Z   duration_ms: 257.68496
2026-10-10T21:22:07.2428811Z   type: 'test'
2026-10-10T21:22:07.2429092Z   ...
2026-10-10T21:22:07.2429766Z # Subtest: TST-286 UC-001 release transaction guards product writes and browser state
2026-10-10T21:22:07.2430811Z ok 649 - TST-286 UC-001 release transaction guards product writes and browser state
2026-10-10T21:22:07.2431546Z   ---
2026-10-10T21:22:07.2432184Z   duration_ms: 326.577326
2026-10-10T21:22:07.2432617Z   type: 'test'
2026-10-10T21:22:07.2432919Z   ...
2026-10-10T21:22:07.2433632Z # Subtest: TST-287 UC-001 release GitLab transaction keeps its project token at its issuer
2026-10-10T21:22:07.2434831Z ok 650 - TST-287 UC-001 release GitLab transaction keeps its project token at its issuer
2026-10-10T21:22:07.2435559Z   ---
2026-10-10T21:22:07.2435922Z   duration_ms: 159.536076
2026-10-10T21:22:07.2436308Z   type: 'test'
2026-10-10T21:22:07.2436591Z   ...
2026-10-10T21:22:07.2437376Z # Subtest: the public paired Bridge dispatches endpoint-test over loopback and enforces token rotation
2026-10-10T21:22:07.2438638Z ok 651 - the public paired Bridge dispatches endpoint-test over loopback and enforces token rotation
2026-10-10T21:22:07.2439386Z   ---
2026-10-10T21:22:07.2439706Z   duration_ms: 65.879678
2026-10-10T21:22:07.2440098Z   type: 'test'
2026-10-10T21:22:07.2440425Z   ...
2026-10-10T21:22:07.2441326Z # Subtest: the release dashboard reads and opens current requirements without writes with or without a token
2026-10-10T21:22:07.2443058Z ok 652 - the release dashboard reads and opens current requirements without writes with or without a token
2026-10-10T21:22:07.2443930Z   ---
2026-10-10T21:22:07.2444269Z   duration_ms: 339.730183
2026-10-10T21:22:07.2444666Z   type: 'test'
2026-10-10T21:22:07.2444986Z   ...
2026-10-10T21:22:07.2445695Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":401,"duration":1}
2026-10-10T21:22:07.2446727Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":3}
2026-10-10T21:22:07.2447747Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":2}
2026-10-10T21:22:07.2449018Z # Subtest: the public default endpoint-test job crosses a paired loopback Bridge and preserves provider results
2026-10-10T21:22:07.2450478Z ok 653 - the public default endpoint-test job crosses a paired loopback Bridge and preserves provider results
2026-10-10T21:22:07.2451537Z   ---
2026-10-10T21:22:07.2451999Z   duration_ms: 29.305146
2026-10-10T21:22:07.2452415Z   type: 'test'
2026-10-10T21:22:07.2452745Z   ...
2026-10-10T21:22:07.2453584Z # Subtest: the release dashboard toggles current requirements without writes with or without a token
2026-10-10T21:22:07.2454883Z ok 654 - the release dashboard toggles current requirements without writes with or without a token
2026-10-10T21:22:07.2455657Z   ---
2026-10-10T21:22:07.2456002Z   duration_ms: 331.665201
2026-10-10T21:22:07.2456377Z   type: 'test'
2026-10-10T21:22:07.2456696Z   ...
2026-10-10T21:22:07.2457432Z # Subtest: TST-279-R1 public Store persists the accepted optional jump-host shape
2026-10-10T21:22:07.2458503Z ok 655 - TST-279-R1 public Store persists the accepted optional jump-host shape
2026-10-10T21:22:07.2459148Z   ---
2026-10-10T21:22:07.2459495Z   duration_ms: 2.823127
2026-10-10T21:22:07.2459891Z   type: 'test'
2026-10-10T21:22:07.2460235Z   ...
2026-10-10T21:22:07.2460842Z # Subtest: TST-279-R2 public Store isolates jump hosts by instance
2026-10-10T21:22:07.2461700Z ok 656 - TST-279-R2 public Store isolates jump hosts by instance
2026-10-10T21:22:07.2462535Z   ---
2026-10-10T21:22:07.2462826Z   duration_ms: 0.321721
2026-10-10T21:22:07.2463167Z   type: 'test'
2026-10-10T21:22:07.2463447Z   ...
2026-10-10T21:22:07.2464051Z # Subtest: TST-279-R3 public listing hides jump-host login and values
2026-10-10T21:22:07.2464871Z ok 657 - TST-279-R3 public listing hides jump-host login and values
2026-10-10T21:22:07.2465623Z   ---
2026-10-10T21:22:07.2465947Z   duration_ms: 0.525516
2026-10-10T21:22:07.2466280Z   type: 'test'
2026-10-10T21:22:07.2466608Z   ...
2026-10-10T21:22:07.2467224Z # Subtest: TST-279-R4 public Clear removes the persisted jump-host login
2026-10-10T21:22:07.2468177Z ok 658 - TST-279-R4 public Clear removes the persisted jump-host login
2026-10-10T21:22:07.2468743Z   ---
2026-10-10T21:22:07.2469056Z   duration_ms: 0.16074
2026-10-10T21:22:07.2469457Z   type: 'test'
2026-10-10T21:22:07.2469776Z   ...
2026-10-10T21:22:07.2470717Z # Subtest: the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:22:07.2472404Z ok 659 - the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:22:07.2473252Z   ---
2026-10-10T21:22:07.2473599Z   duration_ms: 0.88346
2026-10-10T21:22:07.2474003Z   type: 'test'
2026-10-10T21:22:07.2474353Z   ...
2026-10-10T21:22:07.2475344Z # Subtest: routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:22:07.2476765Z ok 660 - routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:22:07.2477651Z   ---
2026-10-10T21:22:07.2477997Z   duration_ms: 77.088216
2026-10-10T21:22:07.2478401Z   type: 'test'
2026-10-10T21:22:07.2478736Z   ...
2026-10-10T21:22:07.2479905Z # Subtest: ITM-281 — public process caller derives and clears only selected practice tables before one Save
2026-10-10T21:22:07.2481394Z ok 661 - ITM-281 — public process caller derives and clears only selected practice tables before one Save
2026-10-10T21:22:07.2482426Z   ---
2026-10-10T21:22:07.2482776Z   duration_ms: 127.478483
2026-10-10T21:22:07.2483148Z   type: 'test'
2026-10-10T21:22:07.2483420Z   ...
2026-10-10T21:22:10.1507714Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":10}
2026-10-10T21:22:10.2025053Z # Subtest: TST-266002: configured HTTPS forwarding keeps jump-host login separate from the Bridge token
2026-10-10T21:22:10.2027271Z ok 662 - TST-266002: configured HTTPS forwarding keeps jump-host login separate from the Bridge token
2026-10-10T21:22:10.2028068Z   ---
2026-10-10T21:22:10.2028277Z   duration_ms: 393.700914
2026-10-10T21:22:10.2028512Z   type: 'test'
2026-10-10T21:22:10.2028707Z   ...
2026-10-10T21:22:10.2140091Z # Subtest: TST-292005: a direct configuration is browser-local localStorage state, never a cookie
2026-10-10T21:22:10.2142353Z ok 663 - TST-292005: a direct configuration is browser-local localStorage state, never a cookie
2026-10-10T21:22:10.2143496Z   ---
2026-10-10T21:22:10.2143989Z   duration_ms: 756.327139
2026-10-10T21:22:10.2144584Z   type: 'test'
2026-10-10T21:22:10.2145070Z   ...
2026-10-10T21:22:10.2146029Z # Subtest: TST-292006: an endpoint credential stays out of URLs and repository writes
2026-10-10T21:22:10.2147398Z ok 664 - TST-292006: an endpoint credential stays out of URLs and repository writes
2026-10-10T21:22:10.2148371Z   ---
2026-10-10T21:22:10.2149179Z   duration_ms: 248.953285
2026-10-10T21:22:10.2149731Z   type: 'test'
2026-10-10T21:22:10.2150230Z   ...
2026-10-10T21:22:10.2151180Z # Subtest: TST-292007: browser blocking remains actionable at the release route
2026-10-10T21:22:10.2152769Z ok 665 - TST-292007: browser blocking remains actionable at the release route
2026-10-10T21:22:10.2153765Z   ---
2026-10-10T21:22:10.2154250Z   duration_ms: 250.72497
2026-10-10T21:22:10.2154810Z   type: 'test'
2026-10-10T21:22:10.2155296Z   ...
2026-10-10T21:22:10.2156152Z # Subtest: TST-292008: Clear removes the persistent endpoint record
2026-10-10T21:22:10.2157247Z ok 666 - TST-292008: Clear removes the persistent endpoint record
2026-10-10T21:22:10.2158002Z   ---
2026-10-10T21:22:10.2158477Z   duration_ms: 349.06635
2026-10-10T21:22:10.2159019Z   type: 'test'
2026-10-10T21:22:10.2159586Z   ...
2026-10-10T21:22:10.2161051Z # Subtest: TST-292009: disclosure and key controls precede a retained Bridge configuration without a direct call
2026-10-10T21:22:10.2163150Z ok 667 - TST-292009: disclosure and key controls precede a retained Bridge configuration without a direct call
2026-10-10T21:22:10.2164229Z   ---
2026-10-10T21:22:10.2164708Z   duration_ms: 317.852715
2026-10-10T21:22:10.2165265Z   type: 'test'
2026-10-10T21:22:10.2165739Z   ...
2026-10-10T21:22:10.2166693Z # Subtest: TST-292010: an endpoint without an optional key succeeds without sending one
2026-10-10T21:22:10.2168092Z ok 668 - TST-292010: an endpoint without an optional key succeeds without sending one
2026-10-10T21:22:10.2168975Z   ---
2026-10-10T21:22:10.2169460Z   duration_ms: 250.638455
2026-10-10T21:22:10.2170004Z   type: 'test'
2026-10-10T21:22:10.2170483Z   ...
2026-10-10T21:22:10.2171820Z # Subtest: TST-293002: release notification names and routes exactly one completed report
2026-10-10T21:22:10.2173367Z ok 669 - TST-293002: release notification names and routes exactly one completed report
2026-10-10T21:22:10.2174310Z   ---
2026-10-10T21:22:10.2174790Z   duration_ms: 464.845776
2026-10-10T21:22:10.2175334Z   type: 'test'
2026-10-10T21:22:10.2175813Z   ...
2026-10-10T21:22:10.2177627Z # Subtest: MOD-repository-hosts listTags — the tags of a repository with their commits, and only those matching a pattern (GitHub, GitLab)
2026-10-10T21:22:10.2180081Z ok 670 - MOD-repository-hosts listTags — the tags of a repository with their commits, and only those matching a pattern (GitHub, GitLab)
2026-10-10T21:22:10.2181340Z   ---
2026-10-10T21:22:10.2182000Z   duration_ms: 42.451212
2026-10-10T21:22:10.2182554Z   type: 'test'
2026-10-10T21:22:10.2183052Z   ...
2026-10-10T21:22:10.2184660Z # Subtest: MOD-repository-hosts listTags — every tag across more than one page, the pattern matched against all of them (GitHub, GitLab)
2026-10-10T21:22:10.2187159Z ok 671 - MOD-repository-hosts listTags — every tag across more than one page, the pattern matched against all of them (GitHub, GitLab)
2026-10-10T21:22:10.2188228Z   ---
2026-10-10T21:22:10.2188556Z   duration_ms: 12.512938
2026-10-10T21:22:10.2188916Z   type: 'test'
2026-10-10T21:22:10.2189195Z   ...
2026-10-10T21:22:10.2190059Z # Subtest: MOD-repository-hosts createTag — a tag set on the commit named (GitHub, GitLab)
2026-10-10T21:22:10.2191040Z ok 672 - MOD-repository-hosts createTag — a tag set on the commit named (GitHub, GitLab)
2026-10-10T21:22:10.2191456Z   ---
2026-10-10T21:22:10.2191663Z   duration_ms: 1.69888
2026-10-10T21:22:10.2192078Z   type: 'test'
2026-10-10T21:22:10.2192647Z   ...
2026-10-10T21:22:10.2193775Z # Subtest: MOD-repository-hosts createTag — an existing tag is refused with TagExists naming its commit, and not moved (GitHub's 422, GitLab's 400)
2026-10-10T21:22:10.2195511Z ok 673 - MOD-repository-hosts createTag — an existing tag is refused with TagExists naming its commit, and not moved (GitHub's 422, GitLab's 400)
2026-10-10T21:22:10.2196179Z   ---
2026-10-10T21:22:10.2196368Z   duration_ms: 3.740954
2026-10-10T21:22:10.2196589Z   type: 'test'
2026-10-10T21:22:10.2196786Z   ...
2026-10-10T21:22:10.2197526Z # Subtest: MOD-repository-hosts listTags, createTag — a refused token, a missing permission and a used-up rate limit are the module's named failures
2026-10-10T21:22:10.2198662Z ok 674 - MOD-repository-hosts listTags, createTag — a refused token, a missing permission and a used-up rate limit are the module's named failures
2026-10-10T21:22:10.2199283Z   ---
2026-10-10T21:22:10.2199580Z   duration_ms: 4.652826
2026-10-10T21:22:10.2199940Z   type: 'test'
2026-10-10T21:22:10.2200271Z   ...
2026-10-10T21:22:10.2201208Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS — a GitHub repository's address, as the browser shows it
2026-10-10T21:22:10.2202700Z ok 675 - A PRODUCT IS NAMED BY ITS ADDRESS — a GitHub repository's address, as the browser shows it
2026-10-10T21:22:10.2203483Z   ---
2026-10-10T21:22:10.2203780Z   duration_ms: 3.37933
2026-10-10T21:22:10.2204164Z   type: 'test'
2026-10-10T21:22:10.2204486Z   ...
2026-10-10T21:22:10.2205807Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS · GITLAB PRODUCTS ARE SUPPORTED — a GitLab project's address, in nested groups
2026-10-10T21:22:10.2207758Z ok 676 - A PRODUCT IS NAMED BY ITS ADDRESS · GITLAB PRODUCTS ARE SUPPORTED — a GitLab project's address, in nested groups
2026-10-10T21:22:10.2208653Z   ---
2026-10-10T21:22:10.2208997Z   duration_ms: 0.821675
2026-10-10T21:22:10.2209378Z   type: 'test'
2026-10-10T21:22:10.2209717Z   ...
2026-10-10T21:22:10.2210985Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only to GitHub's API, the project token only to its project's API
2026-10-10T21:22:10.2213826Z ok 677 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only to GitHub's API, the project token only to its project's API
2026-10-10T21:22:10.2214855Z   ---
2026-10-10T21:22:10.2215224Z   duration_ms: 47.277327
2026-10-10T21:22:10.2215632Z   type: 'test'
2026-10-10T21:22:10.2215974Z   ...
2026-10-10T21:22:10.2217269Z # Subtest: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — GitHub's 403 with a used-up limit is that limit, never the token
2026-10-10T21:22:10.2219241Z ok 678 - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — GitHub's 403 with a used-up limit is that limit, never the token
2026-10-10T21:22:10.2220179Z   ---
2026-10-10T21:22:10.2220513Z   duration_ms: 10.216695
2026-10-10T21:22:10.2220986Z   type: 'test'
2026-10-10T21:22:10.2221432Z   ...
2026-10-10T21:22:10.2223883Z # Subtest: UC-001 5a — a write that a public repository refuses because the token does not reach it is named so, and nothing is written
2026-10-10T21:22:10.2226396Z ok 679 - UC-001 5a — a write that a public repository refuses because the token does not reach it is named so, and nothing is written
2026-10-10T21:22:10.2227598Z   ---
2026-10-10T21:22:10.2228036Z   duration_ms: 6.727844
2026-10-10T21:22:10.2228600Z   type: 'test'
2026-10-10T21:22:10.2241225Z   ...
2026-10-10T21:22:10.2242747Z # Subtest: UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitHub)
2026-10-10T21:22:10.2244740Z ok 680 - UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitHub)
2026-10-10T21:22:10.2246284Z   ---
2026-10-10T21:22:10.2246640Z   duration_ms: 9.581891
2026-10-10T21:22:10.2247043Z   type: 'test'
2026-10-10T21:22:10.2247396Z   ...
2026-10-10T21:22:10.2248687Z # Subtest: UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitLab)
2026-10-10T21:22:10.2250785Z ok 681 - UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitLab)
2026-10-10T21:22:10.2251703Z   ---
2026-10-10T21:22:10.2252202Z   duration_ms: 9.119117
2026-10-10T21:22:10.2252611Z   type: 'test'
2026-10-10T21:22:10.2252956Z   ...
2026-10-10T21:22:10.2254331Z # Subtest: UC-001 5 — GitLab: a commit that lands while the change's files are read, touching none of them, is Moved, and nothing is written
2026-10-10T21:22:10.2256916Z ok 682 - UC-001 5 — GitLab: a commit that lands while the change's files are read, touching none of them, is Moved, and nothing is written
2026-10-10T21:22:10.2257910Z   ---
2026-10-10T21:22:10.2258246Z   duration_ms: 5.098811
2026-10-10T21:22:10.2258657Z   type: 'test'
2026-10-10T21:22:10.2259003Z   ...
2026-10-10T21:22:10.2260343Z # Subtest: UC-001 — the token pages: GitHub's prefilled token page and the list of tokens, a GitLab project's Access tokens page
2026-10-10T21:22:10.2262458Z ok 683 - UC-001 — the token pages: GitHub's prefilled token page and the list of tokens, a GitLab project's Access tokens page
2026-10-10T21:22:10.2263375Z   ---
2026-10-10T21:22:10.2263718Z   duration_ms: 4.293308
2026-10-10T21:22:10.2264100Z   type: 'test'
2026-10-10T21:22:10.2264485Z   ...
2026-10-10T21:22:10.2265816Z # Subtest: UC-001 5 — an empty repository: no commit and no path; its first commit through the contents API, the others in one commit on it
2026-10-10T21:22:10.2268671Z ok 684 - UC-001 5 — an empty repository: no commit and no path; its first commit through the contents API, the others in one commit on it
2026-10-10T21:22:10.2269650Z   ---
2026-10-10T21:22:10.2269990Z   duration_ms: 5.730926
2026-10-10T21:22:10.2270359Z   type: 'test'
2026-10-10T21:22:10.2270696Z   ...
2026-10-10T21:22:10.2272282Z # Subtest: UC-001 5 — on a GitLab server, a first commit is refused with the advice to push one, and nothing is requested
2026-10-10T21:22:10.2274019Z ok 685 - UC-001 5 — on a GitLab server, a first commit is refused with the advice to push one, and nothing is requested
2026-10-10T21:22:10.2274924Z   ---
2026-10-10T21:22:10.2275266Z   duration_ms: 1.55634
2026-10-10T21:22:10.2275640Z   type: 'test'
2026-10-10T21:22:10.2275970Z   ...
2026-10-10T21:22:10.2277084Z # Subtest: UC-001 4 — repositoryInfo: default branch, visibility, whether the token may write, in one request
2026-10-10T21:22:10.2279356Z ok 686 - UC-001 4 — repositoryInfo: default branch, visibility, whether the token may write, in one request
2026-10-10T21:22:10.2280281Z   ---
2026-10-10T21:22:10.2280638Z   duration_ms: 1.422518
2026-10-10T21:22:10.2281029Z   type: 'test'
2026-10-10T21:22:10.2281373Z   ...
2026-10-10T21:22:10.2282650Z # Subtest: UC-001 4–5 — readSnapshot: the repository at one commit, its files read at that commit, each once
2026-10-10T21:22:10.2284309Z ok 687 - UC-001 4–5 — readSnapshot: the repository at one commit, its files read at that commit, each once
2026-10-10T21:22:10.2285175Z   ---
2026-10-10T21:22:10.2285537Z   duration_ms: 6.562916
2026-10-10T21:22:10.2285909Z   type: 'test'
2026-10-10T21:22:10.2286241Z   ...
2026-10-10T21:22:10.2287382Z # Subtest: UC-001 2a, 4a — NotFound names the repository or the branch; a server the page cannot reach is Unreachable
2026-10-10T21:22:10.2289056Z ok 688 - UC-001 2a, 4a — NotFound names the repository or the branch; a server the page cannot reach is Unreachable
2026-10-10T21:22:10.2290496Z   ---
2026-10-10T21:22:10.2290849Z   duration_ms: 2.024244
2026-10-10T21:22:10.2291264Z   type: 'test'
2026-10-10T21:22:10.2291612Z   ...
2026-10-10T21:22:10.2292970Z # Subtest: NO SECRET IN THE REPOSITORY — a commit holding a configured secret or the token is refused before anything is sent
2026-10-10T21:22:10.2294739Z ok 689 - NO SECRET IN THE REPOSITORY — a commit holding a configured secret or the token is refused before anything is sent
2026-10-10T21:22:10.2295681Z   ---
2026-10-10T21:22:10.2296029Z   duration_ms: 2.611307
2026-10-10T21:22:10.2296399Z   type: 'test'
2026-10-10T21:22:10.2296944Z   ...
2026-10-10T21:22:10.2297669Z # Subtest: resultsAt — a commit's outcomes per level, with their counts
2026-10-10T21:22:10.2298646Z ok 690 - resultsAt — a commit's outcomes per level, with their counts
2026-10-10T21:22:10.2299262Z   ---
2026-10-10T21:22:10.2299606Z   duration_ms: 6.718519
2026-10-10T21:22:10.2299997Z   type: 'test'
2026-10-10T21:22:10.2300311Z   ...
2026-10-10T21:22:10.2302107Z # Subtest: resultsAt — a level without a record of the commit reads not run, never passed
2026-10-10T21:22:10.2303324Z ok 691 - resultsAt — a level without a record of the commit reads not run, never passed
2026-10-10T21:22:10.2304043Z   ---
2026-10-10T21:22:10.2304388Z   duration_ms: 0.660857
2026-10-10T21:22:10.2304779Z   type: 'test'
2026-10-10T21:22:10.2305078Z   ...
2026-10-10T21:22:10.2305787Z # Subtest: resultsAt — a record marked uncommitted is left out
2026-10-10T21:22:10.2306730Z ok 692 - resultsAt — a record marked uncommitted is left out
2026-10-10T21:22:10.2307303Z   ---
2026-10-10T21:22:10.2307659Z   duration_ms: 0.75372
2026-10-10T21:22:10.2308044Z   type: 'test'
2026-10-10T21:22:10.2308363Z   ...
2026-10-10T21:22:10.2309640Z # Subtest: flakyTests — a deterministic test with both outcomes on one commit, with both records; a model-dependent test is not reported
2026-10-10T21:22:10.2312420Z ok 693 - flakyTests — a deterministic test with both outcomes on one commit, with both records; a model-dependent test is not reported
2026-10-10T21:22:10.2313455Z   ---
2026-10-10T21:22:10.2314035Z   duration_ms: 0.940505
2026-10-10T21:22:10.2314439Z   type: 'test'
2026-10-10T21:22:10.2314744Z   ...
2026-10-10T21:22:10.2315846Z # Subtest: rateComparison — a rate lower than the last release's is marked worse, one at or above is not
2026-10-10T21:22:10.2317413Z ok 694 - rateComparison — a rate lower than the last release's is marked worse, one at or above is not
2026-10-10T21:22:10.2318236Z   ---
2026-10-10T21:22:10.2318576Z   duration_ms: 1.314895
2026-10-10T21:22:10.2318949Z   type: 'test'
2026-10-10T21:22:10.2319283Z   ...
2026-10-10T21:22:10.2320009Z # Subtest: rateComparison — no comparison without a last release
2026-10-10T21:22:10.2321054Z ok 695 - rateComparison — no comparison without a last release
2026-10-10T21:22:10.2321650Z   ---
2026-10-10T21:22:10.2322135Z   duration_ms: 0.251063
2026-10-10T21:22:10.2322534Z   type: 'test'
2026-10-10T21:22:10.2323488Z   ...
2026-10-10T21:22:10.8903182Z # Subtest: gitBlobSha equals git hash-object, byte for byte
2026-10-10T21:22:10.8904235Z ok 696 - gitBlobSha equals git hash-object, byte for byte
2026-10-10T21:22:10.8904940Z   ---
2026-10-10T21:22:10.8905366Z   duration_ms: 230.716561
2026-10-10T21:22:10.8905853Z   type: 'test'
2026-10-10T21:22:10.8906231Z   ...
2026-10-10T21:22:10.8907052Z # Subtest: records round-trip and carry no text
2026-10-10T21:22:10.8907804Z ok 697 - records round-trip and carry no text
2026-10-10T21:22:10.8909099Z   ---
2026-10-10T21:22:10.8909777Z   duration_ms: 1.732643
2026-10-10T21:22:10.8910149Z   type: 'test'
2026-10-10T21:22:10.8910479Z   ...
2026-10-10T21:22:10.8911185Z # Subtest: extractSection: heading to next heading of same level, code fences masked
2026-10-10T21:22:10.8912393Z ok 698 - extractSection: heading to next heading of same level, code fences masked
2026-10-10T21:22:10.8913062Z   ---
2026-10-10T21:22:10.8913393Z   duration_ms: 0.766249
2026-10-10T21:22:10.8913745Z   type: 'test'
2026-10-10T21:22:10.8914076Z   ...
2026-10-10T21:22:10.8914589Z # Subtest: sectionText is the same bytes the Python applier hashes
2026-10-10T21:22:10.8915423Z ok 699 - sectionText is the same bytes the Python applier hashes
2026-10-10T21:22:10.8915958Z   ---
2026-10-10T21:22:10.8916338Z   duration_ms: 48.197081
2026-10-10T21:22:10.8916709Z   type: 'test'
2026-10-10T21:22:10.8917037Z   ...
2026-10-10T21:22:10.8917646Z # Subtest: queue index and decisions parse like scripts/spec_dashboard.py
2026-10-10T21:22:10.8918524Z ok 700 - queue index and decisions parse like scripts/spec_dashboard.py
2026-10-10T21:22:10.8919126Z   ---
2026-10-10T21:22:10.8919866Z   duration_ms: 1.323464
2026-10-10T21:22:10.8920229Z   type: 'test'
2026-10-10T21:22:10.8920518Z   ...
2026-10-10T21:22:10.8921010Z # Subtest: STATUS IS DERIVED FROM THE RECORDS: use cases
2026-10-10T21:22:10.8921729Z ok 701 - STATUS IS DERIVED FROM THE RECORDS: use cases
2026-10-10T21:22:10.8922425Z   ---
2026-10-10T21:22:10.8922749Z   duration_ms: 0.318776
2026-10-10T21:22:10.8923109Z   type: 'test'
2026-10-10T21:22:10.8923414Z   ...
2026-10-10T21:22:10.8923938Z # Subtest: STATUS IS DERIVED FROM THE RECORDS: SPEC proposals
2026-10-10T21:22:10.8924746Z ok 702 - STATUS IS DERIVED FROM THE RECORDS: SPEC proposals
2026-10-10T21:22:10.8925234Z   ---
2026-10-10T21:22:10.8925548Z   duration_ms: 0.720499
2026-10-10T21:22:10.8925909Z   type: 'test'
2026-10-10T21:22:10.8926209Z   ...
2026-10-10T21:22:10.8926902Z # Subtest: an applied entry is judged by its own section, not by headings later entries filled
2026-10-10T21:22:10.8927951Z ok 703 - an applied entry is judged by its own section, not by headings later entries filled
2026-10-10T21:22:10.8928435Z   ---
2026-10-10T21:22:10.8928625Z   duration_ms: 0.458385
2026-10-10T21:22:10.8928836Z   type: 'test'
2026-10-10T21:22:10.8929019Z   ...
2026-10-10T21:22:10.8929576Z # Subtest: an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text
2026-10-10T21:22:10.8930535Z ok 704 - an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text
2026-10-10T21:22:10.8931287Z   ---
2026-10-10T21:22:10.8931472Z   duration_ms: 0.948554
2026-10-10T21:22:10.8931693Z   type: 'test'
2026-10-10T21:22:10.8932063Z   ...
2026-10-10T21:22:10.8932999Z # Subtest: the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance
2026-10-10T21:22:10.8934469Z ok 705 - the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance
2026-10-10T21:22:10.8935128Z   ---
2026-10-10T21:22:10.8935318Z   duration_ms: 1.012152
2026-10-10T21:22:10.8935536Z   type: 'test'
2026-10-10T21:22:10.8935722Z   ...
2026-10-10T21:22:10.8936261Z # Subtest: ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing
2026-10-10T21:22:10.8936815Z ok 706 - ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing
2026-10-10T21:22:10.8937133Z   ---
2026-10-10T21:22:10.8937320Z   duration_ms: 0.619356
2026-10-10T21:22:10.8937536Z   type: 'test'
2026-10-10T21:22:10.8937725Z   ...
2026-10-10T21:22:10.8938054Z # Subtest: decisionRow is the row tools/apply_approvals.py writes
2026-10-10T21:22:10.8938663Z ok 707 - decisionRow is the row tools/apply_approvals.py writes
2026-10-10T21:22:10.8939156Z   ---
2026-10-10T21:22:10.8939458Z   duration_ms: 0.192661
2026-10-10T21:22:10.8939808Z   type: 'test'
2026-10-10T21:22:10.8940093Z   ...
2026-10-10T21:22:10.8940800Z # Subtest: replaceSection writes the proposal byte for byte and keeps the file's final newline
2026-10-10T21:22:10.8941991Z ok 708 - replaceSection writes the proposal byte for byte and keeps the file's final newline
2026-10-10T21:22:10.8942693Z   ---
2026-10-10T21:22:10.8942997Z   duration_ms: 0.728978
2026-10-10T21:22:10.8943312Z   type: 'test'
2026-10-10T21:22:10.8943665Z   ...
2026-10-10T21:22:10.8944344Z # Subtest: an entry already written in the queue's decisions is not written twice
2026-10-10T21:22:10.8945366Z ok 709 - an entry already written in the queue's decisions is not written twice
2026-10-10T21:22:10.8945980Z   ---
2026-10-10T21:22:10.8946283Z   duration_ms: 5.224596
2026-10-10T21:22:10.8946663Z   type: 'test'
2026-10-10T21:22:10.8946972Z   ...
2026-10-10T21:22:10.8948362Z # Subtest: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch
2026-10-10T21:22:10.8949967Z ok 710 - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch
2026-10-10T21:22:10.8950497Z   ---
2026-10-10T21:22:10.8950674Z   duration_ms: 3.248541
2026-10-10T21:22:10.8950883Z   type: 'test'
2026-10-10T21:22:10.8951251Z   ...
2026-10-10T21:22:10.8952362Z # Subtest: A STALE APPROVAL IS NOT APPLIED — the engine's workflow route: a proposal or a SPEC section changed after approval writes nothing and is named
2026-10-10T21:22:10.8954227Z ok 711 - A STALE APPROVAL IS NOT APPLIED — the engine's workflow route: a proposal or a SPEC section changed after approval writes nothing and is named
2026-10-10T21:22:10.8955215Z   ---
2026-10-10T21:22:10.8955538Z   duration_ms: 8.195126
2026-10-10T21:22:10.8955922Z   type: 'test'
2026-10-10T21:22:10.8956235Z   ...
2026-10-10T21:22:10.8957876Z # Subtest: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — the engine writes what the dashboard's acceptance commit writes, entry by entry in the queue's order
2026-10-10T21:22:10.8960417Z ok 712 - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — the engine writes what the dashboard's acceptance commit writes, entry by entry in the queue's order
2026-10-10T21:22:10.8961686Z   ---
2026-10-10T21:22:10.8962196Z   duration_ms: 16.276899
2026-10-10T21:22:10.8962623Z   type: 'test'
2026-10-10T21:22:10.8962967Z   ...
2026-10-10T21:22:10.8964324Z # Subtest: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — a second run writes nothing; a record the dashboard already applied is passed over
2026-10-10T21:22:10.8966326Z ok 713 - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — a second run writes nothing; a record the dashboard already applied is passed over
2026-10-10T21:22:10.8967656Z   ---
2026-10-10T21:22:10.8967984Z   duration_ms: 10.525473
2026-10-10T21:22:10.8968361Z   type: 'test'
2026-10-10T21:22:10.8968668Z   ...
2026-10-10T21:22:10.8969797Z # Subtest: A STALE APPROVAL IS NOT APPLIED — a malformed record is refused and named, and nothing of it is written
2026-10-10T21:22:10.8971421Z ok 714 - A STALE APPROVAL IS NOT APPLIED — a malformed record is refused and named, and nothing of it is written
2026-10-10T21:22:10.8972435Z   ---
2026-10-10T21:22:10.8972777Z   duration_ms: 6.034056
2026-10-10T21:22:10.8973188Z   type: 'test'
2026-10-10T21:22:10.8973531Z   ...
2026-10-10T21:22:10.8974490Z # Subtest: the records are read from the approvals folder: README.md, other kinds and files that are no Markdown are passed over
2026-10-10T21:22:10.8975990Z ok 715 - the records are read from the approvals folder: README.md, other kinds and files that are no Markdown are passed over
2026-10-10T21:22:10.8976830Z   ---
2026-10-10T21:22:10.8977142Z   duration_ms: 2.493461
2026-10-10T21:22:10.8977513Z   type: 'test'
2026-10-10T21:22:10.8977921Z   ...
2026-10-10T21:22:10.8978565Z # Subtest: front matter: scalars and lists, body separated
2026-10-10T21:22:10.8979514Z ok 716 - front matter: scalars and lists, body separated
2026-10-10T21:22:10.8980136Z   ---
2026-10-10T21:22:10.8980452Z   duration_ms: 0.546799
2026-10-10T21:22:10.8980841Z   type: 'test'
2026-10-10T21:22:10.8981138Z   ...
2026-10-10T21:22:10.8982061Z # Subtest: front matter with CR LF line ends: the fields of the LF text, the body the text's own bytes
2026-10-10T21:22:10.8983393Z ok 717 - front matter with CR LF line ends: the fields of the LF text, the body the text's own bytes
2026-10-10T21:22:10.8984116Z   ---
2026-10-10T21:22:10.8984444Z   duration_ms: 0.246658
2026-10-10T21:22:10.8984825Z   type: 'test'
2026-10-10T21:22:10.8985149Z   ...
2026-10-10T21:22:10.8986264Z # Subtest: reviewedId: a reviewed file's identifier from its path — the same for a renamed file
2026-10-10T21:22:10.8987666Z ok 718 - reviewedId: a reviewed file's identifier from its path — the same for a renamed file
2026-10-10T21:22:10.8988450Z   ---
2026-10-10T21:22:10.8988773Z   duration_ms: 0.35531
2026-10-10T21:22:10.8989147Z   type: 'test'
2026-10-10T21:22:10.8989475Z   ...
2026-10-10T21:22:10.8990765Z # Subtest: AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused with a finding
2026-10-10T21:22:10.8992970Z ok 719 - AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused with a finding
2026-10-10T21:22:10.8994378Z   ---
2026-10-10T21:22:10.8994759Z   duration_ms: 0.683744
2026-10-10T21:22:10.8995188Z   type: 'test'
2026-10-10T21:22:10.8995536Z   ...
2026-10-10T21:22:10.8996949Z # Subtest: AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends keeps its identifier; another one is still named
2026-10-10T21:22:10.8998850Z ok 720 - AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends keeps its identifier; another one is still named
2026-10-10T21:22:10.8999785Z   ---
2026-10-10T21:22:10.9000131Z   duration_ms: 0.347691
2026-10-10T21:22:10.9000527Z   type: 'test'
2026-10-10T21:22:10.9000877Z   ...
2026-10-10T21:22:10.9002268Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none
2026-10-10T21:22:10.9004004Z ok 721 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none
2026-10-10T21:22:10.9004824Z   ---
2026-10-10T21:22:10.9005142Z   duration_ms: 0.393315
2026-10-10T21:22:10.9005505Z   type: 'test'
2026-10-10T21:22:10.9005815Z   ...
2026-10-10T21:22:10.9007255Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the click authority is what the write path takes: one commit, fast-forward only
2026-10-10T21:22:10.9009278Z ok 722 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the click authority is what the write path takes: one commit, fast-forward only
2026-10-10T21:22:10.9010253Z   ---
2026-10-10T21:22:10.9010819Z   duration_ms: 30.151625
2026-10-10T21:22:10.9011211Z   type: 'test'
2026-10-10T21:22:10.9011530Z   ...
2026-10-10T21:22:10.9013039Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event
2026-10-10T21:22:10.9015090Z ok 723 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event
2026-10-10T21:22:10.9016076Z   ---
2026-10-10T21:22:10.9016432Z   duration_ms: 2.963903
2026-10-10T21:22:10.9016827Z   type: 'test'
2026-10-10T21:22:10.9017149Z   ...
2026-10-10T21:22:10.9019068Z # Subtest: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click
2026-10-10T21:22:10.9022116Z ok 724 - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click
2026-10-10T21:22:10.9023532Z   ---
2026-10-10T21:22:10.9023872Z   duration_ms: 33.80434
2026-10-10T21:22:10.9024243Z   type: 'test'
2026-10-10T21:22:10.9024521Z   ...
2026-10-10T21:22:10.9025655Z # Subtest: EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so
2026-10-10T21:22:10.9027369Z ok 725 - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so
2026-10-10T21:22:10.9028236Z   ---
2026-10-10T21:22:10.9028539Z   duration_ms: 1.65841
2026-10-10T21:22:10.9028880Z   type: 'test'
2026-10-10T21:22:10.9029183Z   ...
2026-10-10T21:22:10.9030170Z # Subtest: the jump host's settings are checked — a host, user or key name that could change the command is refused
2026-10-10T21:22:10.9031571Z ok 726 - the jump host's settings are checked — a host, user or key name that could change the command is refused
2026-10-10T21:22:10.9032430Z   ---
2026-10-10T21:22:10.9032722Z   duration_ms: 0.573648
2026-10-10T21:22:10.9033054Z   type: 'test'
2026-10-10T21:22:10.9033335Z   ...
2026-10-10T21:22:10.9034334Z # Subtest: THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other
2026-10-10T21:22:10.9035773Z ok 727 - THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other
2026-10-10T21:22:10.9036572Z   ---
2026-10-10T21:22:10.9037127Z   duration_ms: 1.006508
2026-10-10T21:22:10.9037513Z   type: 'test'
2026-10-10T21:22:10.9037834Z   ...
2026-10-10T21:22:10.9038834Z # Subtest: a remote session is tested by asking whether anything answers at its local port — no token, nothing else
2026-10-10T21:22:10.9040380Z ok 728 - a remote session is tested by asking whether anything answers at its local port — no token, nothing else
2026-10-10T21:22:10.9041196Z   ---
2026-10-10T21:22:10.9041518Z   duration_ms: 0.776655
2026-10-10T21:22:10.9042020Z   type: 'test'
2026-10-10T21:22:10.9042349Z   ...
2026-10-10T21:22:10.9043178Z # Subtest: the app never calls fetch directly — every request goes through fetchText
2026-10-10T21:22:10.9044358Z ok 729 - the app never calls fetch directly — every request goes through fetchText
2026-10-10T21:22:10.9045008Z   ---
2026-10-10T21:22:10.9045325Z   duration_ms: 8.838805
2026-10-10T21:22:10.9045704Z   type: 'test'
2026-10-10T21:22:10.9045995Z   ...
2026-10-10T21:22:10.9046609Z # Subtest: the kernel never writes — no kernel file imports a write function of the git host
2026-10-10T21:22:10.9047512Z ok 730 - the kernel never writes — no kernel file imports a write function of the git host
2026-10-10T21:22:10.9047889Z   ---
2026-10-10T21:22:10.9048069Z   duration_ms: 6.839575
2026-10-10T21:22:10.9048279Z   type: 'test'
2026-10-10T21:22:10.9048459Z   ...
2026-10-10T21:22:10.9048944Z # Subtest: the kernel never reads through the git host — no kernel file imports anything of it
2026-10-10T21:22:10.9049817Z ok 731 - the kernel never reads through the git host — no kernel file imports anything of it
2026-10-10T21:22:10.9050216Z   ---
2026-10-10T21:22:10.9050408Z   duration_ms: 6.913896
2026-10-10T21:22:10.9050620Z   type: 'test'
2026-10-10T21:22:10.9050814Z   ...
2026-10-10T21:22:10.9051383Z # Subtest: the shells read only through what the git host provides — no file of the dashboard imports fetchText
2026-10-10T21:22:10.9052522Z ok 732 - the shells read only through what the git host provides — no file of the dashboard imports fetchText
2026-10-10T21:22:10.9053311Z   ---
2026-10-10T21:22:10.9053624Z   duration_ms: 5.657482
2026-10-10T21:22:10.9053988Z   type: 'test'
2026-10-10T21:22:10.9054303Z   ...
2026-10-10T21:22:10.9055558Z # Subtest: the shells read only through what the git host provides — no file of the dashboard imports a read MOD-git-host keeps to itself
2026-10-10T21:22:10.9056874Z ok 733 - the shells read only through what the git host provides — no file of the dashboard imports a read MOD-git-host keeps to itself
2026-10-10T21:22:10.9057420Z   ---
2026-10-10T21:22:10.9057687Z   duration_ms: 5.091681
2026-10-10T21:22:10.9057999Z   type: 'test'
2026-10-10T21:22:10.9058185Z   ...
2026-10-10T21:22:10.9058847Z # Subtest: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the GitLab check reports reach, branch and role as before, in one request
2026-10-10T21:22:10.9059807Z ok 734 - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the GitLab check reports reach, branch and role as before, in one request
2026-10-10T21:22:10.9060472Z   ---
2026-10-10T21:22:10.9060815Z   duration_ms: 2.568102
2026-10-10T21:22:10.9061034Z   type: 'test'
2026-10-10T21:22:10.9061217Z   ...
2026-10-10T21:22:10.9061848Z # Subtest: UC-001 — a server whose answer reports neither a visibility nor a default branch did not answer as a GitLab server
2026-10-10T21:22:10.9063468Z ok 735 - UC-001 — a server whose answer reports neither a visibility nor a default branch did not answer as a GitLab server
2026-10-10T21:22:10.9063971Z   ---
2026-10-10T21:22:10.9064149Z   duration_ms: 2.90268
2026-10-10T21:22:10.9064363Z   type: 'test'
2026-10-10T21:22:10.9064544Z   ...
2026-10-10T21:22:10.9065339Z # Subtest: THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Pull requests, Actions, Workflows write, Metadata read
2026-10-10T21:22:10.9066548Z ok 736 - THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Pull requests, Actions, Workflows write, Metadata read
2026-10-10T21:22:10.9067288Z   ---
2026-10-10T21:22:10.9067479Z   duration_ms: 0.734874
2026-10-10T21:22:10.9067694Z   type: 'test'
2026-10-10T21:22:10.9067876Z   ...
2026-10-10T21:22:10.9068491Z # Subtest: THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first
2026-10-10T21:22:10.9069490Z ok 737 - THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first
2026-10-10T21:22:10.9069923Z   ---
2026-10-10T21:22:10.9070123Z   duration_ms: 0.409986
2026-10-10T21:22:10.9070334Z   type: 'test'
2026-10-10T21:22:10.9070515Z   ...
2026-10-10T21:22:10.9071205Z # Subtest: ONE GITHUB TOKEN SERVES EVERY FEATURE — the link, the steps and the guidance are written from requiredPermissions
2026-10-10T21:22:10.9072927Z ok 738 - ONE GITHUB TOKEN SERVES EVERY FEATURE — the link, the steps and the guidance are written from requiredPermissions
2026-10-10T21:22:10.9073728Z   ---
2026-10-10T21:22:10.9074053Z   duration_ms: 0.455108
2026-10-10T21:22:10.9074432Z   type: 'test'
2026-10-10T21:22:10.9074743Z   ...
2026-10-10T21:22:10.9075416Z # Subtest: UC-014: the setup step explains every permission and why it is needed
2026-10-10T21:22:10.9076098Z ok 739 - UC-014: the setup step explains every permission and why it is needed
2026-10-10T21:22:10.9076443Z   ---
2026-10-10T21:22:10.9076628Z   duration_ms: 0.768341
2026-10-10T21:22:10.9076833Z   type: 'test'
2026-10-10T21:22:10.9077011Z   ...
2026-10-10T21:22:10.9077500Z # Subtest: EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered
2026-10-10T21:22:10.9078329Z ok 740 - EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered
2026-10-10T21:22:10.9078705Z   ---
2026-10-10T21:22:10.9078899Z   duration_ms: 0.266196
2026-10-10T21:22:10.9079107Z   type: 'test'
2026-10-10T21:22:10.9079289Z   ...
2026-10-10T21:22:10.9080074Z # Subtest: every site module parses — the app itself is only run in a browser, so check its syntax here
2026-10-10T21:22:10.9080851Z ok 741 - every site module parses — the app itself is only run in a browser, so check its syntax here
2026-10-10T21:22:10.9081281Z   ---
2026-10-10T21:22:10.9081471Z   duration_ms: 528.995219
2026-10-10T21:22:10.9081691Z   type: 'test'
2026-10-10T21:22:10.9082034Z   ...
2026-10-10T21:22:10.9082453Z # Subtest: UC-014: setup names only the instance
2026-10-10T21:22:10.9082875Z ok 742 - UC-014: setup names only the instance
2026-10-10T21:22:10.9083141Z   ---
2026-10-10T21:22:10.9083453Z   duration_ms: 0.397863
2026-10-10T21:22:10.9083819Z   type: 'test'
2026-10-10T21:22:10.9084109Z   ...
2026-10-10T21:22:10.9084913Z # Subtest: the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed
2026-10-10T21:22:10.9086217Z ok 743 - the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed
2026-10-10T21:22:10.9086966Z   ---
2026-10-10T21:22:10.9087285Z   duration_ms: 0.283274
2026-10-10T21:22:10.9087694Z   type: 'test'
2026-10-10T21:22:10.9088010Z   ...
2026-10-10T21:22:10.9089118Z # Subtest: A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — Agent M · owner/repository, within GitHub's 40 characters
2026-10-10T21:22:10.9090617Z ok 744 - A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — Agent M · owner/repository, within GitHub's 40 characters
2026-10-10T21:22:10.9091375Z   ---
2026-10-10T21:22:10.9091685Z   duration_ms: 2.47196
2026-10-10T21:22:10.9092159Z   type: 'test'
2026-10-10T21:22:10.9092482Z   ...
2026-10-10T21:22:10.9093846Z # Subtest: A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — the description names the product repository, within GitHub's 1024 characters
2026-10-10T21:22:10.9095729Z ok 745 - A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — the description names the product repository, within GitHub's 1024 characters
2026-10-10T21:22:10.9096652Z   ---
2026-10-10T21:22:10.9096830Z   duration_ms: 0.185498
2026-10-10T21:22:10.9097035Z   type: 'test'
2026-10-10T21:22:10.9097216Z   ...
2026-10-10T21:22:10.9097701Z # Subtest: the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere
2026-10-10T21:22:10.9098569Z ok 746 - the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere
2026-10-10T21:22:10.9098962Z   ---
2026-10-10T21:22:10.9099150Z   duration_ms: 3.484923
2026-10-10T21:22:10.9099360Z   type: 'test'
2026-10-10T21:22:10.9099547Z   ...
2026-10-10T21:22:10.9100101Z # Subtest: status 'approved' is described truly for both routes — the dashboard's own commit and the workflow
2026-10-10T21:22:10.9100904Z ok 747 - status 'approved' is described truly for both routes — the dashboard's own commit and the workflow
2026-10-10T21:22:10.9101424Z   ---
2026-10-10T21:22:10.9101688Z   duration_ms: 5.107944
2026-10-10T21:22:10.9102139Z   type: 'test'
2026-10-10T21:22:10.9102372Z   ...
2026-10-10T21:22:10.9102821Z # Subtest: the dashboard shows the last accepted text above a changed use case, with the core's diff
2026-10-10T21:22:10.9103516Z ok 748 - the dashboard shows the last accepted text above a changed use case, with the core's diff
2026-10-10T21:22:10.9103986Z   ---
2026-10-10T21:22:10.9104254Z   duration_ms: 4.83419
2026-10-10T21:22:10.9104598Z   type: 'test'
2026-10-10T21:22:10.9104781Z   ...
2026-10-10T21:22:10.9105434Z # Subtest: A USED-UP RATE LIMIT IS NAMED — the load error names the account's limit and when it resets, and nothing about the token
2026-10-10T21:22:10.9106379Z ok 749 - A USED-UP RATE LIMIT IS NAMED — the load error names the account's limit and when it resets, and nothing about the token
2026-10-10T21:22:10.9106993Z   ---
2026-10-10T21:22:10.9107179Z   duration_ms: 6.282025
2026-10-10T21:22:10.9107392Z   type: 'test'
2026-10-10T21:22:10.9107578Z   ...
2026-10-10T21:22:10.9108075Z # Subtest: A USED-UP RATE LIMIT IS NAMED — without a token, the network's limit and when it resets
2026-10-10T21:22:10.9108793Z ok 750 - A USED-UP RATE LIMIT IS NAMED — without a token, the network's limit and when it resets
2026-10-10T21:22:10.9109187Z   ---
2026-10-10T21:22:10.9109372Z   duration_ms: 0.708914
2026-10-10T21:22:10.9109592Z   type: 'test'
2026-10-10T21:22:10.9109777Z   ...
2026-10-10T21:22:10.9110461Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a refused write names the limit; counter-proof: a 403 without the headers is a missing permission
2026-10-10T21:22:10.9111485Z ok 751 - A USED-UP RATE LIMIT IS NAMED — a refused write names the limit; counter-proof: a 403 without the headers is a missing permission
2026-10-10T21:22:10.9112102Z   ---
2026-10-10T21:22:10.9112292Z   duration_ms: 1.254703
2026-10-10T21:22:10.9112630Z   type: 'test'
2026-10-10T21:22:10.9112903Z   ...
2026-10-10T21:22:10.9113440Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a GitLab product's limit is named by its server, without a time
2026-10-10T21:22:10.9114211Z ok 752 - A USED-UP RATE LIMIT IS NAMED — a GitLab product's limit is named by its server, without a time
2026-10-10T21:22:10.9114623Z   ---
2026-10-10T21:22:10.9114801Z   duration_ms: 0.497159
2026-10-10T21:22:10.9115135Z   type: 'test'
2026-10-10T21:22:10.9115398Z   ...
2026-10-10T21:22:10.9116026Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — the load error still names a refused token and links its renewal
2026-10-10T21:22:10.9116941Z ok 753 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — the load error still names a refused token and links its renewal
2026-10-10T21:22:10.9117414Z   ---
2026-10-10T21:22:10.9117593Z   duration_ms: 3.557231
2026-10-10T21:22:10.9117799Z   type: 'test'
2026-10-10T21:22:10.9117979Z   ...
2026-10-10T21:22:10.9118405Z # Subtest: the dashboard is opened on a GitLab product by its address; its files link to GitLab
2026-10-10T21:22:10.9119057Z ok 754 - the dashboard is opened on a GitLab product by its address; its files link to GitLab
2026-10-10T21:22:10.9119446Z   ---
2026-10-10T21:22:10.9119624Z   duration_ms: 0.619859
2026-10-10T21:22:10.9119835Z   type: 'test'
2026-10-10T21:22:10.9120018Z   ...
2026-10-10T21:22:10.9120568Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line
2026-10-10T21:22:10.9121508Z ok 755 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line
2026-10-10T21:22:10.9122033Z   ---
2026-10-10T21:22:10.9122223Z   duration_ms: 20.479875
2026-10-10T21:22:10.9122444Z   type: 'test'
2026-10-10T21:22:10.9122633Z   ...
2026-10-10T21:22:10.9123254Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared
2026-10-10T21:22:10.9124404Z ok 756 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared
2026-10-10T21:22:10.9124885Z   ---
2026-10-10T21:22:10.9125067Z   duration_ms: 3.315061
2026-10-10T21:22:10.9125277Z   type: 'test'
2026-10-10T21:22:10.9125467Z   ...
2026-10-10T21:22:10.9126202Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier
2026-10-10T21:22:10.9127082Z ok 757 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier
2026-10-10T21:22:10.9127541Z   ---
2026-10-10T21:22:10.9127732Z   duration_ms: 1.898055
2026-10-10T21:22:10.9127937Z   type: 'test'
2026-10-10T21:22:10.9128127Z   ...
2026-10-10T21:22:10.9128661Z # Subtest: the accepted text is the exact text its record names — a blob that does not hash to it is refused
2026-10-10T21:22:10.9129444Z ok 758 - the accepted text is the exact text its record names — a blob that does not hash to it is refused
2026-10-10T21:22:10.9129896Z   ---
2026-10-10T21:22:10.9130209Z   duration_ms: 1.196956
2026-10-10T21:22:10.9130420Z   type: 'test'
2026-10-10T21:22:10.9130609Z   ...
2026-10-10T21:22:10.9131237Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only
2026-10-10T21:22:10.9132251Z ok 759 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only
2026-10-10T21:22:10.9132730Z   ---
2026-10-10T21:22:10.9132915Z   duration_ms: 2.548952
2026-10-10T21:22:10.9133142Z   type: 'test'
2026-10-10T21:22:10.9133322Z   ...
2026-10-10T21:22:10.9133667Z # Subtest: readBlob keeps the accepted text of a record by its blob SHA
2026-10-10T21:22:10.9134167Z ok 760 - readBlob keeps the accepted text of a record by its blob SHA
2026-10-10T21:22:10.9134630Z   ---
2026-10-10T21:22:10.9134885Z   duration_ms: 1.383356
2026-10-10T21:22:10.9135095Z   type: 'test'
2026-10-10T21:22:10.9135273Z   ...
2026-10-10T21:22:10.9135870Z # Subtest: UC-001: no click, nothing at all — Add product without a click's authority writes nothing and stores nothing
2026-10-10T21:22:10.9136783Z ok 761 - UC-001: no click, nothing at all — Add product without a click's authority writes nothing and stores nothing
2026-10-10T21:22:10.9137427Z   ---
2026-10-10T21:22:10.9137611Z   duration_ms: 1.123182
2026-10-10T21:22:10.9137825Z   type: 'test'
2026-10-10T21:22:10.9138004Z   ...
2026-10-10T21:22:10.9138710Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes hands the authority to the write path; without one, none writes
2026-10-10T21:22:10.9139796Z ok 762 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes hands the authority to the write path; without one, none writes
2026-10-10T21:22:10.9140333Z   ---
2026-10-10T21:22:10.9140518Z   duration_ms: 9.568638
2026-10-10T21:22:10.9140736Z   type: 'test'
2026-10-10T21:22:10.9140917Z   ...
2026-10-10T21:22:10.9141458Z # Subtest: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row
2026-10-10T21:22:10.9142537Z ok 763 - AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row
2026-10-10T21:22:10.9142971Z   ---
2026-10-10T21:22:10.9143171Z   duration_ms: 2.064981
2026-10-10T21:22:10.9143385Z   type: 'test'
2026-10-10T21:22:10.9143571Z   ...
2026-10-10T21:22:10.9144131Z # Subtest: A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on
2026-10-10T21:22:10.9144949Z ok 764 - A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on
2026-10-10T21:22:10.9145715Z   ---
2026-10-10T21:22:10.9145983Z   duration_ms: 2.222091
2026-10-10T21:22:10.9146192Z   type: 'test'
2026-10-10T21:22:10.9146373Z   ...
2026-10-10T21:22:10.9146910Z # Subtest: SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened
2026-10-10T21:22:10.9147774Z ok 765 - SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened
2026-10-10T21:22:10.9148479Z   ---
2026-10-10T21:22:10.9148678Z   duration_ms: 3.423311
2026-10-10T21:22:10.9148884Z   type: 'test'
2026-10-10T21:22:10.9149066Z   ...
2026-10-10T21:22:10.9149648Z # Subtest: A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order
2026-10-10T21:22:10.9150472Z ok 766 - A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order
2026-10-10T21:22:10.9150905Z   ---
2026-10-10T21:22:10.9151100Z   duration_ms: 2.563286
2026-10-10T21:22:10.9151310Z   type: 'test'
2026-10-10T21:22:10.9151492Z   ...
2026-10-10T21:22:10.9152233Z # Subtest: A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named
2026-10-10T21:22:10.9153175Z ok 767 - A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named
2026-10-10T21:22:10.9153663Z   ---
2026-10-10T21:22:10.9153984Z   duration_ms: 1.934487
2026-10-10T21:22:10.9154194Z   type: 'test'
2026-10-10T21:22:10.9154378Z   ...
2026-10-10T21:22:10.9155000Z # Subtest: A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice
2026-10-10T21:22:10.9155932Z ok 768 - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice
2026-10-10T21:22:10.9156554Z   ---
2026-10-10T21:22:10.9156826Z   duration_ms: 2.633237
2026-10-10T21:22:10.9157050Z   type: 'test'
2026-10-10T21:22:10.9157237Z   ...
2026-10-10T21:22:10.9157639Z # Subtest: collaborators are saved by one commit of docs/collaborators.md, on a click
2026-10-10T21:22:10.9158239Z ok 769 - collaborators are saved by one commit of docs/collaborators.md, on a click
2026-10-10T21:22:10.9158619Z   ---
2026-10-10T21:22:10.9158801Z   duration_ms: 1.101484
2026-10-10T21:22:10.9159142Z   type: 'test'
2026-10-10T21:22:10.9159422Z   ...
2026-10-10T21:22:10.9160224Z # Subtest: GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head
2026-10-10T21:22:10.9161289Z ok 770 - GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head
2026-10-10T21:22:10.9161834Z   ---
2026-10-10T21:22:10.9162165Z   duration_ms: 3.931341
2026-10-10T21:22:10.9162381Z   type: 'test'
2026-10-10T21:22:10.9162577Z   ...
2026-10-10T21:22:10.9163136Z # Subtest: GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit
2026-10-10T21:22:10.9163939Z ok 771 - GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit
2026-10-10T21:22:10.9164379Z   ---
2026-10-10T21:22:10.9164571Z   duration_ms: 3.37112
2026-10-10T21:22:10.9164779Z   type: 'test'
2026-10-10T21:22:10.9164959Z   ...
2026-10-10T21:22:10.9165480Z # Subtest: GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed
2026-10-10T21:22:10.9166305Z ok 772 - GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed
2026-10-10T21:22:10.9166768Z   ---
2026-10-10T21:22:10.9166945Z   duration_ms: 3.214224
2026-10-10T21:22:10.9167153Z   type: 'test'
2026-10-10T21:22:10.9167438Z   ...
2026-10-10T21:22:10.9168471Z # Subtest: ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub
2026-10-10T21:22:10.9170018Z ok 773 - ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub
2026-10-10T21:22:10.9170982Z   ---
2026-10-10T21:22:10.9171290Z   duration_ms: 8.037937
2026-10-10T21:22:10.9171641Z   type: 'test'
2026-10-10T21:22:10.9172081Z   ...
2026-10-10T21:22:10.9173185Z # Subtest: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each
2026-10-10T21:22:10.9174925Z ok 774 - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each
2026-10-10T21:22:10.9175786Z   ---
2026-10-10T21:22:10.9176074Z   duration_ms: 8.077396
2026-10-10T21:22:10.9176401Z   type: 'test'
2026-10-10T21:22:10.9176678Z   ...
2026-10-10T21:22:10.9177709Z # Subtest: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out
2026-10-10T21:22:10.9178987Z ok 775 - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out
2026-10-10T21:22:10.9179612Z   ---
2026-10-10T21:22:10.9179800Z   duration_ms: 16.721201
2026-10-10T21:22:10.9180019Z   type: 'test'
2026-10-10T21:22:10.9180203Z   ...
2026-10-10T21:22:10.9180725Z # Subtest: AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named
2026-10-10T21:22:10.9181464Z ok 776 - AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named
2026-10-10T21:22:10.9182203Z   ---
2026-10-10T21:22:10.9182388Z   duration_ms: 2.961885
2026-10-10T21:22:10.9182604Z   type: 'test'
2026-10-10T21:22:10.9182788Z   ...
2026-10-10T21:22:10.9183453Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out
2026-10-10T21:22:10.9184439Z ok 777 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out
2026-10-10T21:22:10.9184952Z   ---
2026-10-10T21:22:10.9185134Z   duration_ms: 2.752893
2026-10-10T21:22:10.9185350Z   type: 'test'
2026-10-10T21:22:10.9185542Z   ...
2026-10-10T21:22:10.9186160Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token
2026-10-10T21:22:10.9187076Z ok 778 - GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token
2026-10-10T21:22:10.9187645Z   ---
2026-10-10T21:22:10.9187904Z   duration_ms: 2.80571
2026-10-10T21:22:10.9188214Z   type: 'test'
2026-10-10T21:22:10.9188504Z   ...
2026-10-10T21:22:10.9189436Z # Subtest: AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD
2026-10-10T21:22:10.9190783Z ok 779 - AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD
2026-10-10T21:22:10.9191458Z   ---
2026-10-10T21:22:10.9191727Z   duration_ms: 3.514497
2026-10-10T21:22:10.9192088Z   type: 'test'
2026-10-10T21:22:10.9192286Z   ...
2026-10-10T21:22:10.9193014Z # Subtest: SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other
2026-10-10T21:22:10.9194067Z ok 780 - SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other
2026-10-10T21:22:10.9194593Z   ---
2026-10-10T21:22:10.9194785Z   duration_ms: 6.608807
2026-10-10T21:22:10.9194998Z   type: 'test'
2026-10-10T21:22:10.9195177Z   ...
2026-10-10T21:22:10.9195711Z # Subtest: counter-proof: a file changed after the review page was built is left out and named; the others are still written
2026-10-10T21:22:10.9196543Z ok 781 - counter-proof: a file changed after the review page was built is left out and named; the others are still written
2026-10-10T21:22:10.9197016Z   ---
2026-10-10T21:22:10.9197196Z   duration_ms: 3.053176
2026-10-10T21:22:10.9197561Z   type: 'test'
2026-10-10T21:22:10.9197739Z   ...
2026-10-10T21:22:10.9198633Z # Subtest: A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until the engine's acceptance commit names its text, and an edit committed afterwards is not accepted
2026-10-10T21:22:10.9200011Z ok 782 - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until the engine's acceptance commit names its text, and an edit committed afterwards is not accepted
2026-10-10T21:22:10.9200689Z   ---
2026-10-10T21:22:10.9200885Z   duration_ms: 8.374238
2026-10-10T21:22:10.9201095Z   type: 'test'
2026-10-10T21:22:10.9201274Z   ...
2026-10-10T21:22:10.9202252Z # Subtest: A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file
2026-10-10T21:22:10.9203520Z ok 783 - A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file
2026-10-10T21:22:10.9204104Z   ---
2026-10-10T21:22:10.9204286Z   duration_ms: 2.925061
2026-10-10T21:22:10.9204496Z   type: 'test'
2026-10-10T21:22:10.9204684Z   ...
2026-10-10T21:22:10.9205415Z # Subtest: A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes an approval record for a reviewed file only, never for a job, gate or approval record
2026-10-10T21:22:10.9206525Z ok 784 - A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes an approval record for a reviewed file only, never for a job, gate or approval record
2026-10-10T21:22:10.9207213Z   ---
2026-10-10T21:22:10.9207404Z   duration_ms: 0.691298
2026-10-10T21:22:10.9207619Z   type: 'test'
2026-10-10T21:22:10.9207809Z   ...
2026-10-10T21:22:10.9208530Z # Subtest: A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is
2026-10-10T21:22:10.9210757Z not ok 785 - A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is # TODO FINDING G1 — the approval engine derives the status open for a job record (deriveReviewedStatus, statusByNames) and its review page counts it; MOD-review-core's deriveStatus has no value for a file that is no proposal
2026-10-10T21:22:10.9212111Z   ---
2026-10-10T21:22:10.9212305Z   duration_ms: 1.780631
2026-10-10T21:22:10.9212520Z   type: 'test'
2026-10-10T21:22:10.9212913Z   location: '/home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:165:1'
2026-10-10T21:22:10.9213668Z   failureType: 'testCodeFailure'
2026-10-10T21:22:10.9213962Z   error: 'the job record is no proposal'
2026-10-10T21:22:10.9214223Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:10.9214448Z   name: 'AssertionError'
2026-10-10T21:22:10.9214669Z   expected: 'open'
2026-10-10T21:22:10.9214871Z   actual: 'open'
2026-10-10T21:22:10.9215096Z   operator: 'notStrictEqual'
2026-10-10T21:22:10.9215320Z   stack: |-
2026-10-10T21:22:10.9215785Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:172:12)
2026-10-10T21:22:10.9216346Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:10.9216804Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:10.9217166Z   ...
2026-10-10T21:22:10.9217761Z # Subtest: A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job record writes no approval record
2026-10-10T21:22:10.9219864Z not ok 786 - A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job record writes no approval record # TODO FINDING G2 — planAcceptance writes an approval record (kind: use-case, file: docs/jobs/JOB-….md) for a job record handed to it as a use case; the kind is taken from the item, not from the path
2026-10-10T21:22:10.9220943Z   ---
2026-10-10T21:22:10.9221134Z   duration_ms: 3.181848
2026-10-10T21:22:10.9221354Z   type: 'test'
2026-10-10T21:22:10.9221744Z   location: '/home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:183:1'
2026-10-10T21:22:10.9222429Z   failureType: 'testCodeFailure'
2026-10-10T21:22:10.9222671Z   error: |-
2026-10-10T21:22:10.9222904Z     no approval record for a job record
2026-10-10T21:22:10.9223173Z     + actual - expected
2026-10-10T21:22:10.9223383Z     
2026-10-10T21:22:10.9223557Z     + [
2026-10-10T21:22:10.9223730Z     +   {
2026-10-10T21:22:10.9223968Z     +     content: 'kind: use-case\n' +
2026-10-10T21:22:10.9224493Z     +       'file: docs/jobs/JOB-20261001-0900-a1b2.md\n' +
2026-10-10T21:22:10.9224949Z     +       'blob: c97d9f2bf14c6a324a75c78cdf8ff186aa3ba93a\n',
2026-10-10T21:22:10.9225384Z     +     path: 'docs/approvals/JOB-20261001-0900-a1b2-c97d9f2bf14c.md'
2026-10-10T21:22:10.9225712Z     +   }
2026-10-10T21:22:10.9225894Z     + ]
2026-10-10T21:22:10.9226071Z     - []
2026-10-10T21:22:10.9226241Z     
2026-10-10T21:22:10.9226425Z   code: 'ERR_ASSERTION'
2026-10-10T21:22:10.9226646Z   name: 'AssertionError'
2026-10-10T21:22:10.9226869Z   expected:
2026-10-10T21:22:10.9227048Z   actual:
2026-10-10T21:22:10.9227225Z     0:
2026-10-10T21:22:10.9227516Z       path: 'docs/approvals/JOB-20261001-0900-a1b2-c97d9f2bf14c.md'
2026-10-10T21:22:10.9227834Z       content: |-
2026-10-10T21:22:10.9228039Z         kind: use-case
2026-10-10T21:22:10.9228308Z         file: docs/jobs/JOB-20261001-0900-a1b2.md
2026-10-10T21:22:10.9228649Z         blob: c97d9f2bf14c6a324a75c78cdf8ff186aa3ba93a
2026-10-10T21:22:10.9228921Z         
2026-10-10T21:22:10.9229126Z   operator: 'deepStrictEqual'
2026-10-10T21:22:10.9229471Z   stack: |-
2026-10-10T21:22:10.9229974Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:189:12)
2026-10-10T21:22:10.9230541Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:22:10.9231011Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:22:10.9231373Z   ...
2026-10-10T21:22:10.9232070Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — list and get give the same data on GitHub and on a GitLab server
2026-10-10T21:22:10.9232889Z ok 787 - GITLAB PRODUCTS ARE SUPPORTED — list and get give the same data on GitHub and on a GitLab server
2026-10-10T21:22:10.9233328Z   ---
2026-10-10T21:22:10.9233517Z   duration_ms: 6.651906
2026-10-10T21:22:10.9233733Z   type: 'test'
2026-10-10T21:22:10.9233927Z   ...
2026-10-10T21:22:10.9234484Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — counter-proof: a field the answer lacks is null, never invented
2026-10-10T21:22:10.9235484Z ok 788 - GITLAB PRODUCTS ARE SUPPORTED — counter-proof: a field the answer lacks is null, never invented
2026-10-10T21:22:10.9236020Z   ---
2026-10-10T21:22:10.9236209Z   duration_ms: 1.530002
2026-10-10T21:22:10.9236426Z   type: 'test'
2026-10-10T21:22:10.9236617Z   ...
2026-10-10T21:22:10.9237318Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only at api.github.com, the GitLab token only at its project's API
2026-10-10T21:22:10.9238352Z ok 789 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only at api.github.com, the GitLab token only at its project's API
2026-10-10T21:22:10.9238899Z   ---
2026-10-10T21:22:10.9239083Z   duration_ms: 1.685862
2026-10-10T21:22:10.9239293Z   type: 'test'
2026-10-10T21:22:10.9239477Z   ...
2026-10-10T21:22:10.9240107Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — counter-proof: a product on another GitLab server gets neither token
2026-10-10T21:22:10.9241058Z ok 790 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — counter-proof: a product on another GitLab server gets neither token
2026-10-10T21:22:10.9241550Z   ---
2026-10-10T21:22:10.9241732Z   duration_ms: 3.314753
2026-10-10T21:22:10.9242028Z   type: 'test'
2026-10-10T21:22:10.9242212Z   ...
2026-10-10T21:22:10.9242761Z # Subtest: UC-032 — list reads pages of 100, newest first, and stops at the page that reaches back past since
2026-10-10T21:22:10.9243562Z ok 791 - UC-032 — list reads pages of 100, newest first, and stops at the page that reaches back past since
2026-10-10T21:22:10.9243987Z   ---
2026-10-10T21:22:10.9244309Z   duration_ms: 19.46596
2026-10-10T21:22:10.9244517Z   type: 'test'
2026-10-10T21:22:10.9244701Z   ...
2026-10-10T21:22:10.9245263Z # Subtest: UC-032 — the state filter: open, merged, closed, all — merged told from closed on GitHub by merged_at
2026-10-10T21:22:10.9246137Z ok 792 - UC-032 — the state filter: open, merged, closed, all — merged told from closed on GitHub by merged_at
2026-10-10T21:22:10.9246776Z   ---
2026-10-10T21:22:10.9246971Z   duration_ms: 28.809892
2026-10-10T21:22:10.9247201Z   type: 'test'
2026-10-10T21:22:10.9247378Z   ...
2026-10-10T21:22:10.9247999Z # Subtest: UC-032 — get(n) costs one request on GitLab and two on GitHub, the second for the workflow runs of the head commit
2026-10-10T21:22:10.9248884Z ok 793 - UC-032 — get(n) costs one request on GitLab and two on GitHub, the second for the workflow runs of the head commit
2026-10-10T21:22:10.9249349Z   ---
2026-10-10T21:22:10.9249530Z   duration_ms: 1.16504
2026-10-10T21:22:10.9249734Z   type: 'test'
2026-10-10T21:22:10.9249921Z   ...
2026-10-10T21:22:10.9250504Z # Subtest: UC-032 — the CI state of the head: running, passed, failed, cancelled, or null where the server names none
2026-10-10T21:22:10.9251347Z ok 794 - UC-032 — the CI state of the head: running, passed, failed, cancelled, or null where the server names none
2026-10-10T21:22:10.9251789Z   ---
2026-10-10T21:22:10.9252060Z   duration_ms: 7.488158
2026-10-10T21:22:10.9252274Z   type: 'test'
2026-10-10T21:22:10.9252462Z   ...
2026-10-10T21:22:10.9252959Z # Subtest: a filter or a number that is not one is refused before anything is sent
2026-10-10T21:22:10.9253517Z ok 795 - a filter or a number that is not one is refused before anything is sent
2026-10-10T21:22:10.9253874Z   ---
2026-10-10T21:22:10.9254055Z   duration_ms: 0.552377
2026-10-10T21:22:10.9254267Z   type: 'test'
2026-10-10T21:22:10.9254454Z   ...
2026-10-10T21:22:10.9254961Z # Subtest: a read needs no token: a public repository's pull requests are read without one, and no header is sent
2026-10-10T21:22:10.9255729Z ok 796 - a read needs no token: a public repository's pull requests are read without one, and no header is sent
2026-10-10T21:22:10.9256174Z   ---
2026-10-10T21:22:10.9256357Z   duration_ms: 3.884685
2026-10-10T21:22:10.9256569Z   type: 'test'
2026-10-10T21:22:10.9256751Z   ...
2026-10-10T21:22:10.9257847Z # Subtest: ONE GITHUB TOKEN SERVES EVERY FEATURE — requiredPermissions on GitHub: Contents, Issues, Pull requests, Actions, Workflows write, Metadata read, each with why
2026-10-10T21:22:10.9259166Z ok 797 - ONE GITHUB TOKEN SERVES EVERY FEATURE — requiredPermissions on GitHub: Contents, Issues, Pull requests, Actions, Workflows write, Metadata read, each with why
2026-10-10T21:22:10.9259797Z   ---
2026-10-10T21:22:10.9259981Z   duration_ms: 0.310866
2026-10-10T21:22:10.9260189Z   type: 'test'
2026-10-10T21:22:10.9260381Z   ...
2026-10-10T21:22:10.9261017Z # Subtest: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — requiredPermissions on a GitLab server: role Maintainer, scope api
2026-10-10T21:22:10.9262050Z ok 798 - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — requiredPermissions on a GitLab server: role Maintainer, scope api
2026-10-10T21:22:10.9262541Z   ---
2026-10-10T21:22:10.9262722Z   duration_ms: 0.163814
2026-10-10T21:22:10.9262931Z   type: 'test'
2026-10-10T21:22:10.9263121Z   ...
2026-10-10T21:22:10.9263424Z # Subtest: NO TEXT TRAVELS IN A URL: long values are refused
2026-10-10T21:22:10.9263846Z ok 799 - NO TEXT TRAVELS IN A URL: long values are refused
2026-10-10T21:22:10.9264149Z   ---
2026-10-10T21:22:10.9264330Z   duration_ms: 0.323016
2026-10-10T21:22:10.9264541Z   type: 'test'
2026-10-10T21:22:10.9264730Z   ...
2026-10-10T21:22:10.9265293Z # Subtest: fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)
2026-10-10T21:22:10.9266188Z ok 800 - fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)
2026-10-10T21:22:10.9266688Z   ---
2026-10-10T21:22:10.9266999Z   duration_ms: 0.744415
2026-10-10T21:22:10.9267225Z   type: 'test'
2026-10-10T21:22:10.9267410Z   ...
2026-10-10T21:22:10.9268049Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the write path refuses a write without an authority: no request at all
2026-10-10T21:22:10.9269266Z ok 801 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the write path refuses a write without an authority: no request at all
2026-10-10T21:22:10.9269765Z   ---
2026-10-10T21:22:10.9269951Z   duration_ms: 0.353872
2026-10-10T21:22:10.9270165Z   type: 'test'
2026-10-10T21:22:10.9270346Z   ...
2026-10-10T21:22:10.9270862Z # Subtest: the authority is one value of one shape — { kind } of three kinds; anything else is refused
2026-10-10T21:22:10.9271597Z ok 802 - the authority is one value of one shape — { kind } of three kinds; anything else is refused
2026-10-10T21:22:10.9272078Z   ---
2026-10-10T21:22:10.9272260Z   duration_ms: 0.452594
2026-10-10T21:22:10.9272473Z   type: 'test'
2026-10-10T21:22:10.9272669Z   ...
2026-10-10T21:22:10.9273288Z # Subtest: each kind of authority writes one commit with the token it is given — the form the CI entry and the bridge app use
2026-10-10T21:22:10.9274199Z ok 803 - each kind of authority writes one commit with the token it is given — the form the CI entry and the bridge app use
2026-10-10T21:22:10.9274682Z   ---
2026-10-10T21:22:10.9274879Z   duration_ms: 3.55582
2026-10-10T21:22:10.9275102Z   type: 'test'
2026-10-10T21:22:10.9275288Z   ...
2026-10-10T21:22:10.9275952Z # Subtest: the request helper writes only on an authority and builds the header itself — a read needs none
2026-10-10T21:22:10.9276749Z ok 804 - the request helper writes only on an authority and builds the header itself — a read needs none
2026-10-10T21:22:10.9277179Z   ---
2026-10-10T21:22:10.9277380Z   duration_ms: 0.775747
2026-10-10T21:22:10.9277597Z   type: 'test'
2026-10-10T21:22:10.9277781Z   ...
2026-10-10T21:22:10.9278099Z # Subtest: one commit, fast-forward only, token only to the API
2026-10-10T21:22:10.9278556Z ok 805 - one commit, fast-forward only, token only to the API
2026-10-10T21:22:10.9278859Z   ---
2026-10-10T21:22:10.9279038Z   duration_ms: 3.554312
2026-10-10T21:22:10.9279364Z   type: 'test'
2026-10-10T21:22:10.9279640Z   ...
2026-10-10T21:22:10.9280029Z # Subtest: an edit is refused when the file changed since it was loaded
2026-10-10T21:22:10.9280505Z ok 806 - an edit is refused when the file changed since it was loaded
2026-10-10T21:22:10.9280818Z   ---
2026-10-10T21:22:10.9281000Z   duration_ms: 0.591721
2026-10-10T21:22:10.9281212Z   type: 'test'
2026-10-10T21:22:10.9281395Z   ...
2026-10-10T21:22:10.9281852Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser
2026-10-10T21:22:10.9282574Z ok 807 - A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser
2026-10-10T21:22:10.9282924Z   ---
2026-10-10T21:22:10.9283108Z   duration_ms: 0.305559
2026-10-10T21:22:10.9283325Z   type: 'test'
2026-10-10T21:22:10.9283514Z   ...
2026-10-10T21:22:10.9284123Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link
2026-10-10T21:22:10.9285029Z ok 808 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link
2026-10-10T21:22:10.9285500Z   ---
2026-10-10T21:22:10.9285685Z   duration_ms: 0.368684
2026-10-10T21:22:10.9285894Z   type: 'test'
2026-10-10T21:22:10.9286077Z   ...
2026-10-10T21:22:10.9286672Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address
2026-10-10T21:22:10.9287533Z ok 809 - A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address
2026-10-10T21:22:10.9287984Z   ---
2026-10-10T21:22:10.9288177Z   duration_ms: 0.328031
2026-10-10T21:22:10.9288383Z   type: 'test'
2026-10-10T21:22:10.9288565Z   ...
2026-10-10T21:22:10.9289163Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else
2026-10-10T21:22:10.9290203Z ok 810 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else
2026-10-10T21:22:10.9290866Z   ---
2026-10-10T21:22:10.9291057Z   duration_ms: 1.412108
2026-10-10T21:22:10.9291261Z   type: 'test'
2026-10-10T21:22:10.9291442Z   ...
2026-10-10T21:22:10.9292146Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit
2026-10-10T21:22:10.9293057Z ok 811 - GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit
2026-10-10T21:22:10.9293543Z   ---
2026-10-10T21:22:10.9293729Z   duration_ms: 32.391856
2026-10-10T21:22:10.9293946Z   type: 'test'
2026-10-10T21:22:10.9294127Z   ...
2026-10-10T21:22:10.9294730Z # Subtest: GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present
2026-10-10T21:22:10.9295631Z ok 812 - GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present
2026-10-10T21:22:10.9296107Z   ---
2026-10-10T21:22:10.9296285Z   duration_ms: 1.697914
2026-10-10T21:22:10.9296499Z   type: 'test'
2026-10-10T21:22:10.9296679Z   ...
2026-10-10T21:22:10.9297284Z # Subtest: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority: nothing is sent; the route is the token step
2026-10-10T21:22:10.9298173Z ok 813 - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority: nothing is sent; the route is the token step
2026-10-10T21:22:10.9298743Z   ---
2026-10-10T21:22:10.9298921Z   duration_ms: 1.0673
2026-10-10T21:22:10.9299131Z   type: 'test'
2026-10-10T21:22:10.9299315Z   ...
2026-10-10T21:22:10.9299908Z # Subtest: GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing
2026-10-10T21:22:10.9300770Z ok 814 - GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing
2026-10-10T21:22:10.9301306Z   ---
2026-10-10T21:22:10.9301571Z   duration_ms: 2.751267
2026-10-10T21:22:10.9301994Z   type: 'test'
2026-10-10T21:22:10.9302182Z   ...
2026-10-10T21:22:10.9302840Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page
2026-10-10T21:22:10.9303801Z ok 815 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page
2026-10-10T21:22:10.9304303Z   ---
2026-10-10T21:22:10.9304487Z   duration_ms: 0.841922
2026-10-10T21:22:10.9304696Z   type: 'test'
2026-10-10T21:22:10.9304878Z   ...
2026-10-10T21:22:10.9305437Z # Subtest: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting
2026-10-10T21:22:10.9306261Z ok 816 - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting
2026-10-10T21:22:10.9306697Z   ---
2026-10-10T21:22:10.9306876Z   duration_ms: 0.291211
2026-10-10T21:22:10.9307091Z   type: 'test'
2026-10-10T21:22:10.9307275Z   ...
2026-10-10T21:22:10.9307840Z # Subtest: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly
2026-10-10T21:22:10.9308654Z ok 817 - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly
2026-10-10T21:22:10.9309077Z   ---
2026-10-10T21:22:10.9309261Z   duration_ms: 0.321914
2026-10-10T21:22:10.9309471Z   type: 'test'
2026-10-10T21:22:10.9309661Z   ...
2026-10-10T21:22:10.9310106Z # Subtest: + Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off
2026-10-10T21:22:10.9310786Z ok 818 - + Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off
2026-10-10T21:22:10.9311191Z   ---
2026-10-10T21:22:10.9311370Z   duration_ms: 0.760712
2026-10-10T21:22:10.9311574Z   type: 'test'
2026-10-10T21:22:10.9311756Z   ...
2026-10-10T21:22:10.9312653Z # Subtest: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's
2026-10-10T21:22:10.9313777Z ok 819 - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's
2026-10-10T21:22:10.9314250Z   ---
2026-10-10T21:22:10.9314436Z   duration_ms: 0.622442
2026-10-10T21:22:10.9314645Z   type: 'test'
2026-10-10T21:22:10.9314825Z   ...
2026-10-10T21:22:10.9315574Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time
2026-10-10T21:22:10.9316708Z ok 820 - A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time
2026-10-10T21:22:10.9317255Z   ---
2026-10-10T21:22:10.9317432Z   duration_ms: 0.586703
2026-10-10T21:22:10.9317640Z   type: 'test'
2026-10-10T21:22:10.9317824Z   ...
2026-10-10T21:22:10.9318229Z # Subtest: A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit
2026-10-10T21:22:10.9318787Z ok 821 - A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit
2026-10-10T21:22:10.9319106Z   ---
2026-10-10T21:22:10.9319288Z   duration_ms: 0.448102
2026-10-10T21:22:10.9319498Z   type: 'test'
2026-10-10T21:22:10.9319685Z   ...
2026-10-10T21:22:10.9320216Z # Subtest: A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit
2026-10-10T21:22:10.9321213Z ok 822 - A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit
2026-10-10T21:22:10.9322147Z   ---
2026-10-10T21:22:10.9322435Z   duration_ms: 0.340069
2026-10-10T21:22:10.9322656Z   type: 'test'
2026-10-10T21:22:10.9322840Z   ...
2026-10-10T21:22:10.9323733Z # Subtest: A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit
2026-10-10T21:22:10.9324702Z ok 823 - A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit
2026-10-10T21:22:10.9325190Z   ---
2026-10-10T21:22:10.9325374Z   duration_ms: 0.447749
2026-10-10T21:22:10.9325590Z   type: 'test'
2026-10-10T21:22:10.9325798Z   ...
2026-10-10T21:22:10.9326272Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too
2026-10-10T21:22:10.9326990Z ok 824 - A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too
2026-10-10T21:22:10.9327525Z   ---
2026-10-10T21:22:10.9327703Z   duration_ms: 0.561146
2026-10-10T21:22:10.9327915Z   type: 'test'
2026-10-10T21:22:10.9328101Z   ...
2026-10-10T21:22:10.9328680Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not
2026-10-10T21:22:10.9329519Z ok 825 - A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not
2026-10-10T21:22:10.9329987Z   ---
2026-10-10T21:22:10.9330168Z   duration_ms: 4.630176
2026-10-10T21:22:10.9330375Z   type: 'test'
2026-10-10T21:22:10.9330568Z   ...
2026-10-10T21:22:10.9331129Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not
2026-10-10T21:22:10.9332131Z ok 826 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not
2026-10-10T21:22:10.9332582Z   ---
2026-10-10T21:22:10.9332767Z   duration_ms: 0.382122
2026-10-10T21:22:10.9332986Z   type: 'test'
2026-10-10T21:22:10.9333167Z   ...
2026-10-10T21:22:10.9334078Z # Subtest: A REFUSED SAVE KEEPS THE EDIT — UC-008 3a: the use case changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:22:10.9335686Z ok 827 - A REFUSED SAVE KEEPS THE EDIT — UC-008 3a: the use case changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:22:10.9336353Z   ---
2026-10-10T21:22:10.9336546Z   duration_ms: 278.438342
2026-10-10T21:22:10.9336909Z   type: 'test'
2026-10-10T21:22:10.9337097Z   ...
2026-10-10T21:22:10.9337995Z # Subtest: A REFUSED SAVE KEEPS THE EDIT — UC-006 3a: the proposal changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:22:10.9339379Z ok 828 - A REFUSED SAVE KEEPS THE EDIT — UC-006 3a: the proposal changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:22:10.9340049Z   ---
2026-10-10T21:22:10.9340237Z   duration_ms: 230.033394
2026-10-10T21:22:10.9340465Z   type: 'test'
2026-10-10T21:22:10.9340649Z   ...
2026-10-10T21:22:10.9341302Z # Subtest: A REFUSED SAVE KEEPS THE EDIT counter-proof: a save the server refuses for another reason (no write access) reads no newer version and shows none
2026-10-10T21:22:10.9352411Z ok 829 - A REFUSED SAVE KEEPS THE EDIT counter-proof: a save the server refuses for another reason (no write access) reads no newer version and shows none
2026-10-10T21:22:10.9353073Z   ---
2026-10-10T21:22:10.9353296Z   duration_ms: 194.221853
2026-10-10T21:22:10.9353534Z   type: 'test'
2026-10-10T21:22:10.9353737Z   ...
2026-10-10T21:22:10.9354133Z # Subtest: the browser store keeps product addresses beside the token, once each
2026-10-10T21:22:10.9354709Z ok 830 - the browser store keeps product addresses beside the token, once each
2026-10-10T21:22:10.9355069Z   ---
2026-10-10T21:22:10.9355273Z   duration_ms: 0.395777
2026-10-10T21:22:10.9355650Z   type: 'test'
2026-10-10T21:22:10.9355846Z   ...
2026-10-10T21:22:10.9356651Z # Subtest: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting
2026-10-10T21:22:10.9357687Z ok 831 - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting
2026-10-10T21:22:10.9358141Z   ---
2026-10-10T21:22:10.9358345Z   duration_ms: 1.195831
2026-10-10T21:22:10.9358565Z   type: 'test'
2026-10-10T21:22:10.9358761Z   ...
2026-10-10T21:22:10.9359375Z # Subtest: AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing
2026-10-10T21:22:10.9360250Z ok 832 - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing
2026-10-10T21:22:10.9360706Z   ---
2026-10-10T21:22:10.9360905Z   duration_ms: 679.460358
2026-10-10T21:22:10.9361126Z   type: 'test'
2026-10-10T21:22:10.9361314Z   ...
2026-10-10T21:22:10.9361847Z # Subtest: UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both
2026-10-10T21:22:10.9362724Z ok 833 - UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both
2026-10-10T21:22:10.9363159Z   ---
2026-10-10T21:22:10.9363347Z   duration_ms: 0.448427
2026-10-10T21:22:10.9363566Z   type: 'test'
2026-10-10T21:22:10.9363752Z   ...
2026-10-10T21:22:10.9364293Z # Subtest: GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear
2026-10-10T21:22:10.9365150Z ok 834 - GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear
2026-10-10T21:22:10.9365633Z   ---
2026-10-10T21:22:10.9365822Z   duration_ms: 0.547945
2026-10-10T21:22:10.9366038Z   type: 'test'
2026-10-10T21:22:10.9366226Z   ...
2026-10-10T21:22:10.9366788Z # Subtest: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product
2026-10-10T21:22:10.9367780Z ok 835 - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product
2026-10-10T21:22:10.9368339Z   ---
2026-10-10T21:22:10.9368528Z   duration_ms: 0.333934
2026-10-10T21:22:10.9368740Z   type: 'test'
2026-10-10T21:22:10.9368932Z   ...
2026-10-10T21:22:10.9369713Z # Subtest: A GITHUB PRODUCT USES A TOKEN OF ITS OWN — in the browser store: one per GitHub product, beside the instance's; removed with the product and by a clear
2026-10-10T21:22:10.9370879Z ok 836 - A GITHUB PRODUCT USES A TOKEN OF ITS OWN — in the browser store: one per GitHub product, beside the instance's; removed with the product and by a clear
2026-10-10T21:22:10.9371654Z   ---
2026-10-10T21:22:10.9371845Z   duration_ms: 0.27683
2026-10-10T21:22:10.9372155Z   type: 'test'
2026-10-10T21:22:10.9372343Z   ...
2026-10-10T21:22:10.9373195Z # Subtest: A GITHUB PRODUCT USES A TOKEN OF ITS OWN — tokenFor: a GitHub product's own token, or the instance's while it has none; a GitLab product's project token, never a GitHub one
2026-10-10T21:22:10.9374524Z ok 837 - A GITHUB PRODUCT USES A TOKEN OF ITS OWN — tokenFor: a GitHub product's own token, or the instance's while it has none; a GitLab product's project token, never a GitHub one
2026-10-10T21:22:10.9375151Z   ---
2026-10-10T21:22:10.9375337Z   duration_ms: 0.152878
2026-10-10T21:22:10.9375553Z   type: 'test'
2026-10-10T21:22:10.9375746Z   ...
2026-10-10T21:22:10.9376346Z # Subtest: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitHub product tokens included, merged per product
2026-10-10T21:22:10.9377254Z ok 838 - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitHub product tokens included, merged per product
2026-10-10T21:22:10.9377720Z   ---
2026-10-10T21:22:10.9377907Z   duration_ms: 0.298253
2026-10-10T21:22:10.9378120Z   type: 'test'
2026-10-10T21:22:10.9378310Z   ...
2026-10-10T21:22:10.9379235Z # Subtest: THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear
2026-10-10T21:22:10.9380336Z ok 839 - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear
2026-10-10T21:22:10.9380841Z   ---
2026-10-10T21:22:10.9381027Z   duration_ms: 0.648288
2026-10-10T21:22:10.9381244Z   type: 'test'
2026-10-10T21:22:10.9381434Z   ...
2026-10-10T21:22:11.0563048Z # Subtest: UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token
2026-10-10T21:22:11.0564867Z ok 840 - UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token
2026-10-10T21:22:11.0565864Z   ---
2026-10-10T21:22:11.0566175Z   duration_ms: 167.284569
2026-10-10T21:22:11.0566483Z   type: 'test'
2026-10-10T21:22:11.0566681Z   ...
2026-10-10T21:22:11.1660356Z # Subtest: UC-008 4a counter-proof: a refusal for a used-up rate limit names the limit and offers no GitHub page
2026-10-10T21:22:11.1662162Z ok 841 - UC-008 4a counter-proof: a refusal for a used-up rate limit names the limit and offers no GitHub page
2026-10-10T21:22:11.1663061Z   ---
2026-10-10T21:22:11.1663502Z   duration_ms: 109.47983
2026-10-10T21:22:11.1663890Z   type: 'test'
2026-10-10T21:22:11.1664307Z   ...
2026-10-10T21:22:11.2782296Z # Subtest: UC-008 4a counter-proof: a token the server refuses (401) is named for renewal, and no GitHub page is offered
2026-10-10T21:22:11.2785058Z ok 842 - UC-008 4a counter-proof: a token the server refuses (401) is named for renewal, and no GitHub page is offered
2026-10-10T21:22:11.2790109Z   ---
2026-10-10T21:22:11.2790677Z   duration_ms: 112.337658
2026-10-10T21:22:11.2791483Z   type: 'test'
2026-10-10T21:22:11.2792299Z   ...
2026-10-10T21:22:11.2794081Z # Subtest: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's
2026-10-10T21:22:11.2796652Z ok 843 - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's
2026-10-10T21:22:11.2802689Z   ---
2026-10-10T21:22:11.2803295Z   duration_ms: 0.951912
2026-10-10T21:22:11.2813946Z   type: 'test'
2026-10-10T21:22:11.2814383Z   ...
2026-10-10T21:22:11.2815957Z # Subtest: UC-006 4c: a product's SPEC change refused for missing write access offers no GitHub page; counter-proof: the instance's does
2026-10-10T21:22:11.2818395Z ok 844 - UC-006 4c: a product's SPEC change refused for missing write access offers no GitHub page; counter-proof: the instance's does
2026-10-10T21:22:11.2819947Z   ---
2026-10-10T21:22:11.2847160Z   duration_ms: 1.027529
2026-10-10T21:22:11.2859318Z   type: 'test'
2026-10-10T21:22:11.2860080Z   ...
2026-10-10T21:22:11.2861980Z # Subtest: writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not
2026-10-10T21:22:11.2864632Z ok 845 - writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not
2026-10-10T21:22:11.2866071Z   ---
2026-10-10T21:22:11.2866764Z   duration_ms: 0.47708
2026-10-10T21:22:11.2867464Z   type: 'test'
2026-10-10T21:22:11.2868073Z   ...
2026-10-10T21:22:11.2985124Z # Subtest: reviewPage: every file that is not accepted is shown; those that can be accepted are counted; one that waits is named with what is open
2026-10-10T21:22:11.2987038Z ok 846 - reviewPage: every file that is not accepted is shown; those that can be accepted are counted; one that waits is named with what is open
2026-10-10T21:22:11.2988333Z   ---
2026-10-10T21:22:11.2988927Z   duration_ms: 20.59685
2026-10-10T21:22:11.2989491Z   type: 'test'
2026-10-10T21:22:11.2989969Z   ...
2026-10-10T21:22:11.2991837Z # Subtest: the architecture's review page shows every open or changed file in sequence — new in full, changed as a difference with its impact list, a waiting one marked
2026-10-10T21:22:11.2994544Z ok 847 - the architecture's review page shows every open or changed file in sequence — new in full, changed as a difference with its impact list, a waiting one marked
2026-10-10T21:22:11.2996086Z   ---
2026-10-10T21:22:11.2996568Z   duration_ms: 330.399754
2026-10-10T21:22:11.2997102Z   type: 'test'
2026-10-10T21:22:11.2997580Z   ...
2026-10-10T21:22:11.2998690Z # Subtest: Accept all N shown: one commit with one record per file the page counted, each naming the blob of the text it rendered
2026-10-10T21:22:11.3000396Z ok 848 - Accept all N shown: one commit with one record per file the page counted, each naming the blob of the text it rendered
2026-10-10T21:22:11.3004392Z   ---
2026-10-10T21:22:11.3004901Z   duration_ms: 208.371561
2026-10-10T21:22:11.3005445Z   type: 'test'
2026-10-10T21:22:11.3005912Z   ...
2026-10-10T21:22:11.3006945Z # Subtest: counter-proof: a file changed between building the page and the click is left out and named
2026-10-10T21:22:11.3008470Z ok 849 - counter-proof: a file changed between building the page and the click is left out and named
2026-10-10T21:22:11.3009393Z   ---
2026-10-10T21:22:11.3009963Z   duration_ms: 151.782187
2026-10-10T21:22:11.3010496Z   type: 'test'
2026-10-10T21:22:11.3010970Z   ...
2026-10-10T21:22:11.3012527Z # Subtest: counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing
2026-10-10T21:22:11.3014445Z ok 850 - counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing
2026-10-10T21:22:11.3015473Z   ---
2026-10-10T21:22:11.3015955Z   duration_ms: 190.741306
2026-10-10T21:22:11.3016491Z   type: 'test'
2026-10-10T21:22:11.3016964Z   ...
2026-10-10T21:22:11.3018326Z # Subtest: request count: the architecture's review page reads that area's files, the records and the texts its differences need on each load
2026-10-10T21:22:11.3020351Z ok 851 - request count: the architecture's review page reads that area's files, the records and the texts its differences need on each load
2026-10-10T21:22:11.3021509Z   ---
2026-10-10T21:22:11.3022133Z   duration_ms: 146.973875
2026-10-10T21:22:11.3022689Z   type: 'test'
2026-10-10T21:22:11.3023165Z   ...
2026-10-10T21:22:11.3027320Z # architecture review page: cold 14 requests (11 files, 1 blob, commit, tree); warm 14 (commit, tree, file docs/approvals/MOD-reader-d79e943ee4d6.md, file docs/architecture/MOD-page.md, file docs/architecture/MOD-reader.md, file docs/architecture/MOD-review.md, file SPEC.md, file docs/approvals/UC-002-a54bc1ba2797.md, file docs/architecture/ARC-001-static-client.md, file src/late.js, file src/reader.js, file src/review.py, file tests/reader.test.js, blob d79e943ee4d6b06d0d414e181e6832a4ee5d98bc)
2026-10-10T21:22:11.3031833Z # Subtest: the use cases' review page: a changed use case as its difference, no accepted one, no architecture file read; Accept all writes its record
2026-10-10T21:22:11.3033912Z ok 852 - the use cases' review page: a changed use case as its difference, no accepted one, no architecture file read; Accept all writes its record
2026-10-10T21:22:11.3035715Z   ---
2026-10-10T21:22:11.3036216Z   duration_ms: 121.227025
2026-10-10T21:22:11.3036766Z   type: 'test'
2026-10-10T21:22:11.3037243Z   ...
2026-10-10T21:22:11.3038995Z # use-case review page: 5 requests (commit, tree, file docs/approvals/UC-002-a54bc1ba2797.md, file docs/use-cases/UC-002-show-the-status.md, blob a54bc1ba2797ffd7caa94f7d34094f4ff1041004)
2026-10-10T21:22:11.3041347Z # Subtest: without a token: no Accept all — GitHub's prefilled page for each record, as for a single Accept
2026-10-10T21:22:11.3043108Z ok 853 - without a token: no Accept all — GitHub's prefilled page for each record, as for a single Accept
2026-10-10T21:22:11.3044054Z   ---
2026-10-10T21:22:11.3044548Z   duration_ms: 65.791972
2026-10-10T21:22:11.3045055Z   type: 'test'
2026-10-10T21:22:11.3045521Z   ...
2026-10-10T21:22:11.3046649Z # Subtest: the use-case list and the architecture view link to their review page; reading the lists stays as it was
2026-10-10T21:22:11.3048572Z ok 854 - the use-case list and the architecture view link to their review page; reading the lists stays as it was
2026-10-10T21:22:11.3049574Z   ---
2026-10-10T21:22:11.3050058Z   duration_ms: 118.287663
2026-10-10T21:22:11.3050616Z   type: 'test'
2026-10-10T21:22:11.3051028Z   ...
2026-10-10T21:22:11.3052356Z # Subtest: queueJob — the CI route commits the job's start record at its path, on the head read, in one commit
2026-10-10T21:22:11.3054267Z ok 855 - queueJob — the CI route commits the job's start record at its path, on the head read, in one commit
2026-10-10T21:22:11.3055295Z   ---
2026-10-10T21:22:11.3055800Z   duration_ms: 3.271804
2026-10-10T21:22:11.3056335Z   type: 'test'
2026-10-10T21:22:11.3056812Z   ...
2026-10-10T21:22:11.3057681Z # Subtest: queueJob — the CI route refuses a moved head, with nothing written
2026-10-10T21:22:11.3058897Z ok 856 - queueJob — the CI route refuses a moved head, with nothing written
2026-10-10T21:22:11.3059685Z   ---
2026-10-10T21:22:11.3060123Z   duration_ms: 0.733866
2026-10-10T21:22:11.3060643Z   type: 'test'
2026-10-10T21:22:11.3061106Z   ...
2026-10-10T21:22:11.3062753Z # Subtest: queueJob — the CI route refuses WorkflowMissing, naming the job workflow's file, for a product without it
2026-10-10T21:22:11.3064804Z ok 857 - queueJob — the CI route refuses WorkflowMissing, naming the job workflow's file, for a product without it
2026-10-10T21:22:11.3065922Z   ---
2026-10-10T21:22:11.3066425Z   duration_ms: 0.324502
2026-10-10T21:22:11.3066976Z   type: 'test'
2026-10-10T21:22:11.3067492Z   ...
2026-10-10T21:22:11.3068425Z # Subtest: queueJob — the CI route's failures are the host's, by name
2026-10-10T21:22:11.3069598Z ok 858 - queueJob — the CI route's failures are the host's, by name
2026-10-10T21:22:11.3070345Z   ---
2026-10-10T21:22:11.3070832Z   duration_ms: 0.652127
2026-10-10T21:22:11.3071382Z   type: 'test'
2026-10-10T21:22:11.3072017Z   ...
2026-10-10T21:22:12.8287921Z # TST-290129-counterproof {"argv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-290128","tests/settings-pages-acknowledgement.test.mjs"],"cwd":"/tmp/agent-m-290-ack-fault-Qpy2xq/repo","childEnv":{"AGENT_M_290_ACK_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"source":"/tmp/agent-m-290-ack-fault-Qpy2xq/repo/src/settings-pages/settings.mjs","testPath":"tests/settings-pages-acknowledgement.test.mjs","testHash":"3ab9530543293a7997425712d69e63c65b171ee937c524c959a50816e929f01b","originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultHash":"952460a86bdd87969750bca27fefabe271d2dccbde37d24a06bf887bebea3d3d","restoredHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultStarted":"2026-10-10T21:22:11.342Z","faultEnded":"2026-10-10T21:22:11.897Z","restoreStarted":"2026-10-10T21:22:11.897Z","restoreEnded":"2026-10-10T21:22:12.826Z","failed":{"status":1,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\nnot ok 1 - TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\n  ---\\n  duration_ms: 421.90465\\n  type: 'test'\\n  location: '/tmp/agent-m-290-ack-fault-Qpy2xq/repo/tests/settings-pages-acknowledgement.test.mjs:45:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    Change rereads acknowledgement ticked in another repository row\\n    \\n    false !== true\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: true\\n  actual: false\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///tmp/agent-m-290-ack-fault-Qpy2xq/repo/tests/settings-pages-acknowledgement.test.mjs:63:10)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\nok 2 - TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\n  ---\\n  duration_ms: 1.386454\\n  type: 'test'\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 1\\n\# fail 1\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 510.847567\\n","stderr":""},"passed":{"status":0,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\nok 1 - TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\n  ---\\n  duration_ms: 799.803043\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\nok 2 - TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\n  ---\\n  duration_ms: 0.399055\\n  type: 'test'\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 2\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 886.549897\\n","stderr":""}}
2026-10-10T21:22:13.0157927Z # Subtest: TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice
2026-10-10T21:22:13.0159509Z ok 859 - TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice
2026-10-10T21:22:13.0160355Z   ---
2026-10-10T21:22:13.0160850Z   duration_ms: 805.923315
2026-10-10T21:22:13.0161294Z   type: 'test'
2026-10-10T21:22:13.0161629Z   ...
2026-10-10T21:22:13.0175303Z # Subtest: TST-290129: CI counter-proof restores acknowledgement readback for TST-290128
2026-10-10T21:22:13.0176592Z ok 860 - TST-290129: CI counter-proof restores acknowledgement readback for TST-290128
2026-10-10T21:22:13.0177469Z   ---
2026-10-10T21:22:13.0177966Z   duration_ms: 1869.224079
2026-10-10T21:22:13.0178515Z   type: 'test'
2026-10-10T21:22:13.0178970Z   ...
2026-10-10T21:22:13.0317932Z # Subtest: TST-290125: refused product metadata does not replace public Settings with a route warning
2026-10-10T21:22:13.0343186Z ok 861 - TST-290125: refused product metadata does not replace public Settings with a route warning
2026-10-10T21:22:13.0365235Z   ---
2026-10-10T21:22:13.0365848Z   duration_ms: 210.701561
2026-10-10T21:22:13.0366408Z   type: 'test'
2026-10-10T21:22:13.0366879Z   ...
2026-10-10T21:22:13.0367719Z # Subtest: TST-290126: product Clear redraws the public managed-product list
2026-10-10T21:22:13.0368826Z ok 862 - TST-290126: product Clear redraws the public managed-product list
2026-10-10T21:22:13.0369580Z   ---
2026-10-10T21:22:13.0370065Z   duration_ms: 232.557498
2026-10-10T21:22:13.0370606Z   type: 'test'
2026-10-10T21:22:13.0371057Z   ...
2026-10-10T21:22:13.0405522Z # TST-290125-127-counterproof {"argv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-290125|TST-290126|TST-290127","/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs"],"cwd":"/home/runner/work/agent-m/agent-m/","environment":{"AGENT_M_290_ACTIONS_ROOT":"/tmp/agent-m-290-actions-fault-Y0mlsT/agent-m","AGENT_M_290_ACTIONS_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultHash":"be82a48ac7523a6c35118f0a6665b018e475f12068364d567461ebcc585140e1","restoredHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","started":"2026-10-10T21:22:11.159Z","failedAt":"2026-10-10T21:22:11.966Z","passedAt":"2026-10-10T21:22:12.868Z","faultStatus":1,"faultSignal":null,"faultError":null,"faultStdout":"TAP version 13\\n\# Subtest: TST-290125: refused product metadata does not replace public Settings with a route warning\\nnot ok 1 - TST-290125: refused product metadata does not replace public Settings with a route warning\\n  ---\\n  duration_ms: 216.446777\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:46:1'\\n  failureType: 'testCodeFailure'\\n  error: 'failure node: route.render keeps the public Repositories pane mounted after product metadata refusal'\\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: true\\n  operator: '=='\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:58:10)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290126: product Clear redraws the public managed-product list\\nnot ok 2 - TST-290126: product Clear redraws the public managed-product list\\n  ---\\n  duration_ms: 252.927611\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:70:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    failure node: the public mounted list redraws without cleared rows\\n    \\n    1 !== 0\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 0\\n  actual: 1\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:88:12)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290127: remote-session Test persists its public result for reload\\nnot ok 3 - TST-290127: remote-session Test persists its public result for reload\\n  ---\\n  duration_ms: 213.715104\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:99:1'\\n  failureType: 'testCodeFailure'\\n  error: \\"Cannot read properties of null (reading 'outcome')\\"\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'TypeError'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:107:22)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n1..3\\n\# tests 3\\n\# suites 0\\n\# pass 0\\n\# fail 3\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 764.746938\\n","faultStderr":"","restoredStatus":0,"restoredSignal":null,"restoredError":null,"restoredStdout":"TAP version 13\\n\# Subtest: TST-290125: refused product metadata does not replace public Settings with a route warning\\nok 1 - TST-290125: refused product metadata does not replace public Settings with a route warning\\n  ---\\n  duration_ms: 229.664595\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290126: product Clear redraws the public managed-product list\\nok 2 - TST-290126: product Clear redraws the public managed-product list\\n  ---\\n  duration_ms: 230.471989\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290127: remote-session Test persists its public result for reload\\nok 3 - TST-290127: remote-session Test persists its public result for reload\\n  ---\\n  duration_ms: 295.426397\\n  type: 'test'\\n  ...\\n1..3\\n\# tests 3\\n\# suites 0\\n\# pass 3\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 854.017894\\n","restoredStderr":""}
2026-10-10T21:22:13.0433561Z # Subtest: TST-290127: remote-session Test persists its public result for reload
2026-10-10T21:22:13.0434732Z ok 863 - TST-290127: remote-session Test persists its public result for reload
2026-10-10T21:22:13.0435407Z   ---
2026-10-10T21:22:13.0435753Z   duration_ms: 2104.057074
2026-10-10T21:22:13.0436150Z   type: 'test'
2026-10-10T21:22:13.0436475Z   ...
2026-10-10T21:22:13.0437674Z # Subtest: add-product — before a valid address, a placeholder with no known explanation, Step C disabled
2026-10-10T21:22:13.0439201Z ok 864 - add-product — before a valid address, a placeholder with no known explanation, Step C disabled
2026-10-10T21:22:13.0440043Z   ---
2026-10-10T21:22:13.0440384Z   duration_ms: 45.148684
2026-10-10T21:22:13.0440784Z   type: 'test'
2026-10-10T21:22:13.0441105Z   ...
2026-10-10T21:22:13.0444036Z # Subtest: add-product — main flow: Step A prefilled and spelled out, Store and check flips Step A done, Add product writes and remembers
2026-10-10T21:22:13.0446068Z ok 865 - add-product — main flow: Step A prefilled and spelled out, Store and check flips Step A done, Add product writes and remembers
2026-10-10T21:22:13.0447306Z   ---
2026-10-10T21:22:13.0447643Z   duration_ms: 56.785107
2026-10-10T21:22:13.0448021Z   type: 'test'
2026-10-10T21:22:13.0448336Z   ...
2026-10-10T21:22:13.0449371Z # Subtest: add-product — 2a: Check on a 404 names the repository and links a new one; Step A stays not done
2026-10-10T21:22:13.0450879Z ok 866 - add-product — 2a: Check on a 404 names the repository and links a new one; Step A stays not done
2026-10-10T21:22:13.0451667Z   ---
2026-10-10T21:22:13.0452183Z   duration_ms: 11.047269
2026-10-10T21:22:13.0452603Z   type: 'test'
2026-10-10T21:22:13.0452920Z   ...
2026-10-10T21:22:13.0453961Z # Subtest: add-product — 2a: Add product on a 404 names the repository, links a new one, writes nothing
2026-10-10T21:22:13.0455423Z ok 867 - add-product — 2a: Add product on a 404 names the repository, links a new one, writes nothing
2026-10-10T21:22:13.0456173Z   ---
2026-10-10T21:22:13.0456486Z   duration_ms: 8.647156
2026-10-10T21:22:13.0456892Z   type: 'test'
2026-10-10T21:22:13.0457229Z   ...
2026-10-10T21:22:13.0458366Z # Subtest: add-product — 3a/4a: a stored instance token alone never marks Step A done; a later failed check un-marks it
2026-10-10T21:22:13.0459972Z ok 868 - add-product — 3a/4a: a stored instance token alone never marks Step A done; a later failed check un-marks it
2026-10-10T21:22:13.0460849Z   ---
2026-10-10T21:22:13.0461167Z   duration_ms: 17.325052
2026-10-10T21:22:13.0461544Z   type: 'test'
2026-10-10T21:22:13.0461817Z   ...
2026-10-10T21:22:13.0463279Z # Subtest: add-product — step 4: a public repository's successful check never marks Step A done
2026-10-10T21:22:13.0464614Z ok 869 - add-product — step 4: a public repository's successful check never marks Step A done
2026-10-10T21:22:13.0465359Z   ---
2026-10-10T21:22:13.0465679Z   duration_ms: 5.477226
2026-10-10T21:22:13.0466047Z   type: 'test'
2026-10-10T21:22:13.0466382Z   ...
2026-10-10T21:22:13.0467462Z # Subtest: add-product — 5a: a write refused after a successful check un-marks Step A done; nothing is written
2026-10-10T21:22:13.0469092Z ok 870 - add-product — 5a: a write refused after a successful check un-marks Step A done; nothing is written
2026-10-10T21:22:13.0469857Z   ---
2026-10-10T21:22:13.0470170Z   duration_ms: 10.359198
2026-10-10T21:22:13.0470554Z   type: 'test'
2026-10-10T21:22:13.0470885Z   ...
2026-10-10T21:22:13.0472021Z # Subtest: add-product — 5b: a complete layout is left uncommitted, the address is still remembered
2026-10-10T21:22:13.0473429Z ok 871 - add-product — 5b: a complete layout is left uncommitted, the address is still remembered
2026-10-10T21:22:13.0474472Z   ---
2026-10-10T21:22:13.0474804Z   duration_ms: 7.414814
2026-10-10T21:22:13.0475167Z   type: 'test'
2026-10-10T21:22:13.0475479Z   ...
2026-10-10T21:22:13.0476392Z # Subtest: TST-276 add-product — a synthetic GitHub Step C click writes and remembers nothing
2026-10-10T21:22:13.0477699Z ok 872 - TST-276 add-product — a synthetic GitHub Step C click writes and remembers nothing
2026-10-10T21:22:13.0478425Z   ---
2026-10-10T21:22:13.0478759Z   duration_ms: 11.413278
2026-10-10T21:22:13.0479146Z   type: 'test'
2026-10-10T21:22:13.0479470Z   ...
2026-10-10T21:22:13.0480431Z # Subtest: TST-277 add-product — a synthetic GitLab Step C click writes and remembers nothing
2026-10-10T21:22:13.0481736Z ok 873 - TST-277 add-product — a synthetic GitLab Step C click writes and remembers nothing
2026-10-10T21:22:13.0482650Z   ---
2026-10-10T21:22:13.0482992Z   duration_ms: 12.650044
2026-10-10T21:22:13.0483354Z   type: 'test'
2026-10-10T21:22:13.0483681Z   ...
2026-10-10T21:22:13.0484648Z # Subtest: TST-278 add-product — a trusted GitLab Step C click commits and remembers the product
2026-10-10T21:22:13.0486043Z ok 874 - TST-278 add-product — a trusted GitLab Step C click commits and remembers the product
2026-10-10T21:22:13.0486769Z   ---
2026-10-10T21:22:13.0487115Z   duration_ms: 10.389981
2026-10-10T21:22:13.0487491Z   type: 'test'
2026-10-10T21:22:13.0487820Z   ...
2026-10-10T21:22:13.0489062Z # Subtest: add-product — 3c/3d: GitLab's Step A is instructions only, Step B stores and checks the project's own token
2026-10-10T21:22:13.0490978Z ok 875 - add-product — 3c/3d: GitLab's Step A is instructions only, Step B stores and checks the project's own token
2026-10-10T21:22:13.0491842Z   ---
2026-10-10T21:22:13.0492528Z   duration_ms: 17.838264
2026-10-10T21:22:13.0492924Z   type: 'test'
2026-10-10T21:22:13.0493256Z   ...
2026-10-10T21:22:13.0494519Z # Subtest: TST-288 add-product — GitLab's no-project-token cause is selected locally with personal-token breadth before the decision
2026-10-10T21:22:13.0496365Z ok 876 - TST-288 add-product — GitLab's no-project-token cause is selected locally with personal-token breadth before the decision
2026-10-10T21:22:13.0497345Z   ---
2026-10-10T21:22:13.0497659Z   duration_ms: 4.743201
2026-10-10T21:22:13.0498066Z   type: 'test'
2026-10-10T21:22:13.0498378Z   ...
2026-10-10T21:22:13.0499529Z # Subtest: TST-289 add-product — GitLab's not-Maintainer cause is selected separately without replacing the project-token route
2026-10-10T21:22:13.0501413Z ok 877 - TST-289 add-product — GitLab's not-Maintainer cause is selected separately without replacing the project-token route
2026-10-10T21:22:13.0502532Z   ---
2026-10-10T21:22:13.0502872Z   duration_ms: 4.452202
2026-10-10T21:22:13.0503256Z   type: 'test'
2026-10-10T21:22:13.0503581Z   ...
2026-10-10T21:22:13.0504643Z # Subtest: add-product — GitLab: a project's own token already stored offers Check beside pasting a new one
2026-10-10T21:22:13.0506198Z ok 878 - add-product — GitLab: a project's own token already stored offers Check beside pasting a new one
2026-10-10T21:22:13.0507216Z   ---
2026-10-10T21:22:13.0507543Z   duration_ms: 5.020056
2026-10-10T21:22:13.0507912Z   type: 'test'
2026-10-10T21:22:13.0508233Z   ...
2026-10-10T21:22:13.0509155Z # Subtest: add-product — the address field's folded explanation is the 'repository' topic
2026-10-10T21:22:13.0510457Z ok 879 - add-product — the address field's folded explanation is the 'repository' topic
2026-10-10T21:22:13.0511152Z   ---
2026-10-10T21:22:13.0511484Z   duration_ms: 1.450895
2026-10-10T21:22:13.0511858Z   type: 'test'
2026-10-10T21:22:13.0512443Z   ...
2026-10-10T21:22:13.0513358Z # Subtest: TST-287001: the public Bridge route persists a distinct remote session and renders canonical setup text
2026-10-10T21:22:13.0514874Z ok 880 - TST-287001: the public Bridge route persists a distinct remote session and renders canonical setup text
2026-10-10T21:22:13.0515658Z   ---
2026-10-10T21:22:13.0515998Z   duration_ms: 27.278564
2026-10-10T21:22:13.0516384Z   type: 'test'
2026-10-10T21:22:13.0516724Z   ...
2026-10-10T21:22:13.0518590Z # Subtest: TST-287002: the public Bridge route names exhausted and setup-required remote-session states without a tunnel claim
2026-10-10T21:22:13.0520205Z ok 881 - TST-287002: the public Bridge route names exhausted and setup-required remote-session states without a tunnel claim
2026-10-10T21:22:13.0521153Z   ---
2026-10-10T21:22:13.0521495Z   duration_ms: 2.294442
2026-10-10T21:22:13.0522241Z   type: 'test'
2026-10-10T21:22:13.0522596Z   ...
2026-10-10T21:22:13.0523406Z # Subtest: the public Bridge route pairs, reloads, hides and really clears Bridge settings
2026-10-10T21:22:13.0524623Z ok 882 - the public Bridge route pairs, reloads, hides and really clears Bridge settings
2026-10-10T21:22:13.0525367Z   ---
2026-10-10T21:22:13.0525689Z   duration_ms: 35.727147
2026-10-10T21:22:13.0526058Z   type: 'test'
2026-10-10T21:22:13.0526358Z   ...
2026-10-10T21:22:13.0527236Z # Subtest: the Bridge route names a refused pair and saves HTTPS jump-host access without a hidden request
2026-10-10T21:22:13.0528576Z ok 883 - the Bridge route names a refused pair and saves HTTPS jump-host access without a hidden request
2026-10-10T21:22:13.0529376Z   ---
2026-10-10T21:22:13.0529694Z   duration_ms: 7.543924
2026-10-10T21:22:13.0530035Z   type: 'test'
2026-10-10T21:22:13.0530344Z   ...
2026-10-10T21:22:13.0530998Z # Subtest: TST-265001: direct endpoint saves before its one short test
2026-10-10T21:22:13.0532106Z ok 884 - TST-265001: direct endpoint saves before its one short test
2026-10-10T21:22:13.0532719Z   ---
2026-10-10T21:22:13.0533058Z   duration_ms: 34.48651
2026-10-10T21:22:13.0533442Z   type: 'test'
2026-10-10T21:22:13.0533776Z   ...
2026-10-10T21:22:13.0534481Z # Subtest: TST-265002: browser refusal is shown with CI and Bridge alternatives
2026-10-10T21:22:13.0535487Z ok 885 - TST-265002: browser refusal is shown with CI and Bridge alternatives
2026-10-10T21:22:13.0536204Z   ---
2026-10-10T21:22:13.0536522Z   duration_ms: 3.418603
2026-10-10T21:22:13.0536857Z   type: 'test'
2026-10-10T21:22:13.0537128Z   ...
2026-10-10T21:22:13.0537672Z # Subtest: TST-265003: a refused key remains stored and reloads
2026-10-10T21:22:13.0538437Z ok 886 - TST-265003: a refused key remains stored and reloads
2026-10-10T21:22:13.0538961Z   ---
2026-10-10T21:22:13.0539262Z   duration_ms: 3.084744
2026-10-10T21:22:13.0539613Z   type: 'test'
2026-10-10T21:22:13.0539938Z   ...
2026-10-10T21:22:13.0540609Z # Subtest: TST-265004: Clear removes the stored endpoint and empties the form
2026-10-10T21:22:13.0541590Z ok 887 - TST-265004: Clear removes the stored endpoint and empties the form
2026-10-10T21:22:13.0545150Z   ---
2026-10-10T21:22:13.0545495Z   duration_ms: 1.233908
2026-10-10T21:22:13.0545863Z   type: 'test'
2026-10-10T21:22:13.0546167Z   ...
2026-10-10T21:22:13.0546838Z # Subtest: TST-265005: a Bridge endpoint is retained and never called directly
2026-10-10T21:22:13.0547754Z ok 888 - TST-265005: a Bridge endpoint is retained and never called directly
2026-10-10T21:22:13.0548579Z   ---
2026-10-10T21:22:13.0548875Z   duration_ms: 1.460582
2026-10-10T21:22:13.0549218Z   type: 'test'
2026-10-10T21:22:13.0549531Z   ...
2026-10-10T21:22:13.0550188Z # Subtest: TST-265006: an absent key maps to null at the direct-call boundary
2026-10-10T21:22:13.0551076Z ok 889 - TST-265006: an absent key maps to null at the direct-call boundary
2026-10-10T21:22:13.0551711Z   ---
2026-10-10T21:22:13.0552256Z   duration_ms: 1.579986
2026-10-10T21:22:13.0552660Z   type: 'test'
2026-10-10T21:22:13.0552985Z   ...
2026-10-10T21:22:13.0553841Z # Subtest: TST-265007: disclosure precedes a hidden endpoint key without repository or navigation leakage
2026-10-10T21:22:13.0555146Z ok 890 - TST-265007: disclosure precedes a hidden endpoint key without repository or navigation leakage
2026-10-10T21:22:13.0555889Z   ---
2026-10-10T21:22:13.0556201Z   duration_ms: 1.857318
2026-10-10T21:22:13.0556570Z   type: 'test'
2026-10-10T21:22:13.0556886Z   ...
2026-10-10T21:22:13.0557777Z # Subtest: TST-265008: endpoint storage is preceded by its Pages-origin notice and folded explanations
2026-10-10T21:22:13.0559091Z ok 891 - TST-265008: endpoint storage is preceded by its Pages-origin notice and folded explanations
2026-10-10T21:22:13.0559879Z   ---
2026-10-10T21:22:13.0560222Z   duration_ms: 0.799546
2026-10-10T21:22:13.0560600Z   type: 'test'
2026-10-10T21:22:13.0560932Z   ...
2026-10-10T21:22:13.0561495Z # Subtest: TST-265009: a stored endpoint key stays hidden until Show
2026-10-10T21:22:13.0562795Z ok 892 - TST-265009: a stored endpoint key stays hidden until Show
2026-10-10T21:22:13.0563373Z   ---
2026-10-10T21:22:13.0563690Z   duration_ms: 2.04202
2026-10-10T21:22:13.0564076Z   type: 'test'
2026-10-10T21:22:13.0564396Z   ...
2026-10-10T21:22:13.0565141Z # Subtest: TST-265010: Settings lists its stored endpoint with a hidden key and Show
2026-10-10T21:22:13.0566212Z ok 893 - TST-265010: Settings lists its stored endpoint with a hidden key and Show
2026-10-10T21:22:13.0566860Z   ---
2026-10-10T21:22:13.0567163Z   duration_ms: 6.242089
2026-10-10T21:22:13.0567508Z   type: 'test'
2026-10-10T21:22:13.0567866Z   ...
2026-10-10T21:22:13.0568646Z # Subtest: TST-265011: Settings tests a stored direct endpoint and changes its named route
2026-10-10T21:22:13.0569774Z ok 894 - TST-265011: Settings tests a stored direct endpoint and changes its named route
2026-10-10T21:22:13.0570463Z   ---
2026-10-10T21:22:13.0570793Z   duration_ms: 2.762417
2026-10-10T21:22:13.0571192Z   type: 'test'
2026-10-10T21:22:13.0571526Z   ...
2026-10-10T21:22:13.0573014Z # Subtest: TST-265012: Settings Clear removes only the selected endpoint entry
2026-10-10T21:22:13.0573993Z ok 895 - TST-265012: Settings Clear removes only the selected endpoint entry
2026-10-10T21:22:13.0574559Z   ---
2026-10-10T21:22:13.0574861Z   duration_ms: 2.750198
2026-10-10T21:22:13.0575199Z   type: 'test'
2026-10-10T21:22:13.0575498Z   ...
2026-10-10T21:22:13.0576291Z # Subtest: TST-265013: Settings explains its browser section and each stored endpoint line
2026-10-10T21:22:13.0577524Z ok 896 - TST-265013: Settings explains its browser section and each stored endpoint line
2026-10-10T21:22:13.0578190Z   ---
2026-10-10T21:22:13.0578486Z   duration_ms: 1.259351
2026-10-10T21:22:13.0578827Z   type: 'test'
2026-10-10T21:22:13.0579118Z   ...
2026-10-10T21:22:13.0579920Z # Subtest: TST-265014: Settings discloses an endpoint Test destination before its control
2026-10-10T21:22:13.0581103Z ok 897 - TST-265014: Settings discloses an endpoint Test destination before its control
2026-10-10T21:22:13.0581857Z   ---
2026-10-10T21:22:13.0582373Z   duration_ms: 1.054054
2026-10-10T21:22:13.0582775Z   type: 'test'
2026-10-10T21:22:13.0583117Z   ...
2026-10-10T21:22:13.0583898Z # Subtest: TST-265015: Settings persists a successful endpoint test and clears its metadata
2026-10-10T21:22:13.0584981Z ok 898 - TST-265015: Settings persists a successful endpoint test and clears its metadata
2026-10-10T21:22:13.0585733Z   ---
2026-10-10T21:22:13.0586259Z   duration_ms: 8.326466
2026-10-10T21:22:13.0586649Z   type: 'test'
2026-10-10T21:22:13.0586983Z   ...
2026-10-10T21:22:13.0587643Z # Subtest: TST-265016: Settings identifies untested and refused endpoint states
2026-10-10T21:22:13.0588809Z ok 899 - TST-265016: Settings identifies untested and refused endpoint states
2026-10-10T21:22:13.0589483Z   ---
2026-10-10T21:22:13.0589830Z   duration_ms: 1.565725
2026-10-10T21:22:13.0590217Z   type: 'test'
2026-10-10T21:22:13.0590551Z   ...
2026-10-10T21:22:13.0591450Z # Subtest: TST-288001: Settings discloses exported secrets and grants before one canonical download
2026-10-10T21:22:13.0593048Z ok 900 - TST-288001: Settings discloses exported secrets and grants before one canonical download
2026-10-10T21:22:13.0593847Z   ---
2026-10-10T21:22:13.0594185Z   duration_ms: 12.49193
2026-10-10T21:22:13.0594578Z   type: 'test'
2026-10-10T21:22:13.0594910Z   ...
2026-10-10T21:22:13.0595707Z # Subtest: TST-288002: Settings imports absent canonical settings and keeps existing bytes
2026-10-10T21:22:13.0596807Z ok 901 - TST-288002: Settings imports absent canonical settings and keeps existing bytes
2026-10-10T21:22:13.0597443Z   ---
2026-10-10T21:22:13.0597751Z   duration_ms: 3.189546
2026-10-10T21:22:13.0598099Z   type: 'test'
2026-10-10T21:22:13.0598399Z   ...
2026-10-10T21:22:13.0599319Z # Subtest: TST-288003: Settings locks imports with a passphrase and leaves malformed import destinations untouched
2026-10-10T21:22:13.0600816Z ok 902 - TST-288003: Settings locks imports with a passphrase and leaves malformed import destinations untouched
2026-10-10T21:22:13.0601836Z   ---
2026-10-10T21:22:13.0602509Z   duration_ms: 391.010351
2026-10-10T21:22:13.0602901Z   type: 'test'
2026-10-10T21:22:13.0603198Z   ...
2026-10-10T21:22:13.3944942Z # Subtest: TST-290116: an unset repository-token expiry defaults to the prefilled ninety days
2026-10-10T21:22:13.3946690Z ok 903 - TST-290116: an unset repository-token expiry defaults to the prefilled ninety days
2026-10-10T21:22:13.3947747Z   ---
2026-10-10T21:22:13.3948246Z   duration_ms: 4.504661
2026-10-10T21:22:13.3948783Z   type: 'test'
2026-10-10T21:22:13.3949238Z   ...
2026-10-10T21:22:13.3950339Z # Subtest: TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences
2026-10-10T21:22:13.3952154Z ok 904 - TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences
2026-10-10T21:22:13.3953231Z   ---
2026-10-10T21:22:13.3953698Z   duration_ms: 3.878006
2026-10-10T21:22:13.3954243Z   type: 'test'
2026-10-10T21:22:13.3954712Z   ...
2026-10-10T21:22:13.3955780Z # Subtest: TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data
2026-10-10T21:22:13.3957418Z ok 905 - TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data
2026-10-10T21:22:13.3958425Z   ---
2026-10-10T21:22:13.3958908Z   duration_ms: 6.253725
2026-10-10T21:22:13.3959431Z   type: 'test'
2026-10-10T21:22:13.3959914Z   ...
2026-10-10T21:22:13.3960889Z # Subtest: TST-290119: product removal and product-list clear ask before changing browser records
2026-10-10T21:22:13.3962420Z ok 906 - TST-290119: product removal and product-list clear ask before changing browser records
2026-10-10T21:22:13.3963358Z   ---
2026-10-10T21:22:13.3963859Z   duration_ms: 1.762311
2026-10-10T21:22:13.3964378Z   type: 'test'
2026-10-10T21:22:13.3964856Z   ...
2026-10-10T21:22:13.3965789Z # Subtest: TST-290120: repository token controls retain folded scope and purpose explanations
2026-10-10T21:22:13.3967169Z ok 907 - TST-290120: repository token controls retain folded scope and purpose explanations
2026-10-10T21:22:13.3968036Z   ---
2026-10-10T21:22:13.3968522Z   duration_ms: 0.777708
2026-10-10T21:22:13.3969032Z   type: 'test'
2026-10-10T21:22:13.3969490Z   ...
2026-10-10T21:22:13.3970581Z # Subtest: TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation
2026-10-10T21:22:13.3972450Z ok 908 - TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation
2026-10-10T21:22:13.3973868Z   ---
2026-10-10T21:22:13.3974359Z   duration_ms: 3.098723
2026-10-10T21:22:13.3974868Z   type: 'test'
2026-10-10T21:22:13.3975303Z   ...
2026-10-10T21:22:13.3976469Z # Subtest: TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation
2026-10-10T21:22:13.3978069Z ok 909 - TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation
2026-10-10T21:22:13.3979094Z   ---
2026-10-10T21:22:13.3979581Z   duration_ms: 1.185556
2026-10-10T21:22:13.3980083Z   type: 'test'
2026-10-10T21:22:13.3980547Z   ...
2026-10-10T21:22:13.4086420Z # TST-290122-counterproof {"argv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-29011[6-9]|TST-290120|TST-290121|TST-290123|TST-290124","tests/settings-pages-settings-regressions.test.mjs"],"cwd":"/tmp/agent-m-290-settings-fault-av8gda/repo","childEnv":{"AGENT_M_290_SETTINGS_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"source":"/tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs","testPath":"tests/settings-pages-settings-regressions.test.mjs","testHash":"af0c1c86de4671860742221dc8eedb17b5b8da742433d06a3dc465106a183d95","originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultHash":"0aa2b88c2171912cc407e83b512c743e2692a155392a2531ece7254a8cd382d7","restoredHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultStarted":"2026-10-10T21:22:12.957Z","faultEnded":"2026-10-10T21:22:13.165Z","restoreStarted":"2026-10-10T21:22:13.165Z","restoreEnded":"2026-10-10T21:22:13.391Z","failed":{"status":1,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\nnot ok 1 - TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\n  ---\\n  duration_ms: 4.213526\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:86:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:87:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\nnot ok 2 - TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\n  ---\\n  duration_ms: 3.619551\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:100:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:103:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\nnot ok 3 - TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\n  ---\\n  duration_ms: 1.119872\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:118:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:121:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290119: product removal and product-list clear ask before changing browser records\\nnot ok 4 - TST-290119: product removal and product-list clear ask before changing browser records\\n  ---\\n  duration_ms: 0.670516\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:140:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:144:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290120: repository token controls retain folded scope and purpose explanations\\nnot ok 5 - TST-290120: repository token controls retain folded scope and purpose explanations\\n  ---\\n  duration_ms: 2.386586\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:165:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:166:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\nnot ok 6 - TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\n  ---\\n  duration_ms: 1.322473\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:179:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:187:18)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\nnot ok 7 - TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\n  ---\\n  duration_ms: 0.604682\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:209:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:215:20)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\nnot ok 8 - TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\n  ---\\n  duration_ms: 0.900117\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:242:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-av8gda/repo/tests/settings-pages-settings-regressions.test.mjs:251:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\nok 9 - TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\n  ---\\n  duration_ms: 0.636928\\n  type: 'test'\\n  ...\\n1..9\\n\# tests 9\\n\# suites 0\\n\# pass 1\\n\# fail 8\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 161.431841\\n","stderr":""},"passed":{"status":0,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\nok 1 - TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\n  ---\\n  duration_ms: 6.56656\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\nok 2 - TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\n  ---\\n  duration_ms: 5.943988\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\nok 3 - TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\n  ---\\n  duration_ms: 9.452551\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290119: product removal and product-list clear ask before changing browser records\\nok 4 - TST-290119: product removal and product-list clear ask before changing browser records\\n  ---\\n  duration_ms: 2.609862\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290120: repository token controls retain folded scope and purpose explanations\\nok 5 - TST-290120: repository token controls retain folded scope and purpose explanations\\n  ---\\n  duration_ms: 1.173832\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\nok 6 - TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\n  ---\\n  duration_ms: 4.659653\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\nok 7 - TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\n  ---\\n  duration_ms: 1.513138\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\nok 8 - TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\n  ---\\n  duration_ms: 11.217688\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\nok 9 - TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\n  ---\\n  duration_ms: 0.75375\\n  type: 'test'\\n  ...\\n1..9\\n\# tests 9\\n\# suites 0\\n\# pass 9\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 190.98451\\n","stderr":""}}
2026-10-10T21:22:13.6038661Z # Subtest: TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link
2026-10-10T21:22:13.6054334Z ok 910 - TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link
2026-10-10T21:22:13.6084229Z   ---
2026-10-10T21:22:13.6090042Z   duration_ms: 7.02947
2026-10-10T21:22:13.6094771Z   type: 'test'
2026-10-10T21:22:13.6095236Z   ...
2026-10-10T21:22:13.6096333Z # Subtest: TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124
2026-10-10T21:22:13.6097864Z ok 911 - TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124
2026-10-10T21:22:13.6098808Z   ---
2026-10-10T21:22:13.6099300Z   duration_ms: 851.49766
2026-10-10T21:22:13.6099839Z   type: 'test'
2026-10-10T21:22:13.6100342Z   ...
2026-10-10T21:22:13.6183793Z # Subtest: TST-290109: Settings tabs preserve unfinished form state without actions
2026-10-10T21:22:13.6203557Z ok 912 - TST-290109: Settings tabs preserve unfinished form state without actions
2026-10-10T21:22:13.6207244Z   ---
2026-10-10T21:22:13.6207957Z   duration_ms: 13.506276
2026-10-10T21:22:13.6208692Z   type: 'test'
2026-10-10T21:22:13.6209166Z   ...
2026-10-10T21:22:13.6210546Z # Subtest: TST-290110: Settings exposes remote-session actions and requires acknowledgement before browser clear
2026-10-10T21:22:13.6212509Z ok 913 - TST-290110: Settings exposes remote-session actions and requires acknowledgement before browser clear
2026-10-10T21:22:13.6213682Z   ---
2026-10-10T21:22:13.6214180Z   duration_ms: 42.807548
2026-10-10T21:22:13.6214815Z   type: 'test'
2026-10-10T21:22:13.6215385Z   ...
2026-10-10T21:22:13.6216386Z # Subtest: TST-290111: Settings saves, tests, and records an expiring repository token
2026-10-10T21:22:13.6218293Z ok 914 - TST-290111: Settings saves, tests, and records an expiring repository token
2026-10-10T21:22:13.6219178Z   ---
2026-10-10T21:22:13.6219801Z   duration_ms: 6.573808
2026-10-10T21:22:13.6220322Z   type: 'test'
2026-10-10T21:22:13.6220883Z   ...
2026-10-10T21:22:13.6222048Z # Subtest: TST-290112: Settings names denied notification permission without asking again
2026-10-10T21:22:13.6223569Z ok 915 - TST-290112: Settings names denied notification permission without asking again
2026-10-10T21:22:13.6224484Z   ---
2026-10-10T21:22:13.6225102Z   duration_ms: 1.21494
2026-10-10T21:22:13.6225569Z   type: 'test'
2026-10-10T21:22:13.6226125Z   ...
2026-10-10T21:22:13.6227426Z # Subtest: TST-290113: Settings removes one legacy collaborator consent row without altering unrelated bytes
2026-10-10T21:22:13.6229203Z ok 916 - TST-290113: Settings removes one legacy collaborator consent row without altering unrelated bytes
2026-10-10T21:22:13.6230229Z   ---
2026-10-10T21:22:13.6230790Z   duration_ms: 9.978291
2026-10-10T21:22:13.6231422Z   type: 'test'
2026-10-10T21:22:13.6232242Z   ...
2026-10-10T21:22:13.6233541Z # Subtest: explanations.md — each of UC-002's choices points to a chapter of the book
2026-10-10T21:22:13.6235148Z ok 917 - explanations.md — each of UC-002's choices points to a chapter of the book
2026-10-10T21:22:13.6236244Z   ---
2026-10-10T21:22:13.6236627Z   duration_ms: 2.915629
2026-10-10T21:22:13.6237618Z   type: 'test'
2026-10-10T21:22:13.6237926Z   ...
2026-10-10T21:22:13.6239364Z # Subtest: schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:22:13.6240861Z ok 918 - schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:22:13.6241591Z   ---
2026-10-10T21:22:13.6242110Z   duration_ms: 21.095213
2026-10-10T21:22:13.6242525Z   type: 'test'
2026-10-10T21:22:13.6242853Z   ...
2026-10-10T21:22:13.6243934Z # Subtest: schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:22:13.6245163Z ok 919 - schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:22:13.6245658Z   ---
2026-10-10T21:22:13.6245854Z   duration_ms: 4.336402
2026-10-10T21:22:13.6246072Z   type: 'test'
2026-10-10T21:22:13.6246257Z   ...
2026-10-10T21:22:13.6246688Z # Subtest: schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:22:13.6247303Z ok 920 - schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:22:13.6247659Z   ---
2026-10-10T21:22:13.6247846Z   duration_ms: 12.601281
2026-10-10T21:22:13.6248073Z   type: 'test'
2026-10-10T21:22:13.6248251Z   ...
2026-10-10T21:22:13.6248624Z # Subtest: schemaForm — the form opens with its first field focused
2026-10-10T21:22:13.6249140Z ok 921 - schemaForm — the form opens with its first field focused
2026-10-10T21:22:13.6249456Z   ---
2026-10-10T21:22:13.6249637Z   duration_ms: 1.988292
2026-10-10T21:22:13.6249854Z   type: 'test'
2026-10-10T21:22:13.6250034Z   ...
2026-10-10T21:22:13.6250497Z # Subtest: explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:22:13.6251149Z ok 922 - explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:22:13.6251522Z   ---
2026-10-10T21:22:13.6251703Z   duration_ms: 10.779902
2026-10-10T21:22:13.6252098Z   type: 'test'
2026-10-10T21:22:13.6252401Z   ...
2026-10-10T21:22:13.6253092Z # Subtest: explain — an empty element for a topic the file does not hold
2026-10-10T21:22:13.6257115Z ok 923 - explain — an empty element for a topic the file does not hold
2026-10-10T21:22:13.6292886Z   ---
2026-10-10T21:22:13.6293271Z   duration_ms: 0.240248
2026-10-10T21:22:13.6293754Z   type: 'test'
2026-10-10T21:22:13.6294088Z   ...
2026-10-10T21:22:13.6294846Z # Subtest: explain — repository: what a repository is (UC-001)
2026-10-10T21:22:13.6295857Z ok 924 - explain — repository: what a repository is (UC-001)
2026-10-10T21:22:13.6296662Z   ---
2026-10-10T21:22:13.6296997Z   duration_ms: 1.150091
2026-10-10T21:22:13.6297379Z   type: 'test'
2026-10-10T21:22:13.6297716Z   ...
2026-10-10T21:22:13.6298532Z # Subtest: explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:22:13.6299686Z ok 925 - explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:22:13.6300374Z   ---
2026-10-10T21:22:13.6300697Z   duration_ms: 0.496454
2026-10-10T21:22:13.6301076Z   type: 'test'
2026-10-10T21:22:13.6301421Z   ...
2026-10-10T21:22:13.6302329Z # Subtest: explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:22:13.6303470Z ok 926 - explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:22:13.6304120Z   ---
2026-10-10T21:22:13.6304422Z   duration_ms: 2.179136
2026-10-10T21:22:13.6304765Z   type: 'test'
2026-10-10T21:22:13.6305102Z   ...
2026-10-10T21:22:13.6305843Z # Subtest: explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:22:13.6306878Z ok 927 - explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:22:13.6307499Z   ---
2026-10-10T21:22:13.6307815Z   duration_ms: 0.858743
2026-10-10T21:22:13.6308219Z   type: 'test'
2026-10-10T21:22:13.6308559Z   ...
2026-10-10T21:22:13.6309554Z # Subtest: explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:22:13.6310957Z ok 928 - explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:22:13.6312101Z   ---
2026-10-10T21:22:13.6362449Z   duration_ms: 0.945923
2026-10-10T21:22:13.6362903Z   type: 'test'
2026-10-10T21:22:13.6363229Z   ...
2026-10-10T21:22:13.6364124Z # Subtest: explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:22:13.6365264Z ok 929 - explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:22:13.6365850Z   ---
2026-10-10T21:22:13.6366187Z   duration_ms: 0.87076
2026-10-10T21:22:13.6366571Z   type: 'test'
2026-10-10T21:22:13.6366910Z   ...
2026-10-10T21:22:13.6367907Z # Subtest: explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:22:13.6369376Z ok 930 - explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:22:13.6370158Z   ---
2026-10-10T21:22:13.6370487Z   duration_ms: 0.488345
2026-10-10T21:22:13.6370872Z   type: 'test'
2026-10-10T21:22:13.6371209Z   ...
2026-10-10T21:22:13.6372488Z # Subtest: explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:22:13.6374080Z ok 931 - explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:22:13.6374884Z   ---
2026-10-10T21:22:13.6375234Z   duration_ms: 0.444697
2026-10-10T21:22:13.6375659Z   type: 'test'
2026-10-10T21:22:13.6375987Z   ...
2026-10-10T21:22:13.6377041Z # Subtest: startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:22:13.6378508Z ok 932 - startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:22:13.6379263Z   ---
2026-10-10T21:22:13.6379573Z   duration_ms: 2.504812
2026-10-10T21:22:13.6379905Z   type: 'test'
2026-10-10T21:22:13.6380204Z   ...
2026-10-10T21:22:13.6381037Z # Subtest: instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:22:13.6382723Z ok 933 - instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:22:13.6383446Z   ---
2026-10-10T21:22:13.6383756Z   duration_ms: 0.747543
2026-10-10T21:22:13.6384120Z   type: 'test'
2026-10-10T21:22:13.6384436Z   ...
2026-10-10T21:22:13.6385534Z # Subtest: notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:22:13.6387187Z ok 934 - notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:22:13.6388123Z   ---
2026-10-10T21:22:13.6388719Z   duration_ms: 1.212378
2026-10-10T21:22:13.6389067Z   type: 'test'
2026-10-10T21:22:13.6389362Z   ...
2026-10-10T21:22:13.6390320Z # Subtest: explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:22:13.6391654Z ok 935 - explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:22:13.6392509Z   ---
2026-10-10T21:22:13.6392881Z   duration_ms: 0.450234
2026-10-10T21:22:13.6393263Z   type: 'test'
2026-10-10T21:22:13.6393584Z   ...
2026-10-10T21:22:13.6394427Z # Subtest: TST-264-01 — explain provides every endpoint configuration step (UC-003)
2026-10-10T21:22:13.6395607Z ok 936 - TST-264-01 — explain provides every endpoint configuration step (UC-003)
2026-10-10T21:22:13.6396237Z   ---
2026-10-10T21:22:13.6396525Z   duration_ms: 5.072541
2026-10-10T21:22:13.6396867Z   type: 'test'
2026-10-10T21:22:13.6397179Z   ...
2026-10-10T21:22:13.6398146Z # Subtest: schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:22:13.6399599Z ok 937 - schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:22:13.6400355Z   ---
2026-10-10T21:22:13.6400702Z   duration_ms: 30.263585
2026-10-10T21:22:13.6401073Z   type: 'test'
2026-10-10T21:22:13.6401378Z   ...
2026-10-10T21:22:13.6402562Z # Subtest: schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:22:13.6404351Z ok 938 - schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:22:13.6405150Z   ---
2026-10-10T21:22:13.6405464Z   duration_ms: 7.429086
2026-10-10T21:22:13.6405823Z   type: 'test'
2026-10-10T21:22:13.6406159Z   ...
2026-10-10T21:22:13.6406978Z # Subtest: schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:22:13.6408082Z ok 939 - schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:22:13.6408727Z   ---
2026-10-10T21:22:13.6409042Z   duration_ms: 16.532639
2026-10-10T21:22:13.6409436Z   type: 'test'
2026-10-10T21:22:13.6409760Z   ...
2026-10-10T21:22:13.6410486Z # Subtest: schemaForm — the form opens with its first field focused
2026-10-10T21:22:13.6411400Z ok 940 - schemaForm — the form opens with its first field focused
2026-10-10T21:22:13.6428326Z   ---
2026-10-10T21:22:13.6428763Z   duration_ms: 1.96582
2026-10-10T21:22:13.6429161Z   type: 'test'
2026-10-10T21:22:13.6429508Z   ...
2026-10-10T21:22:13.6430427Z # Subtest: explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:22:13.6431599Z ok 941 - explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:22:13.6432430Z   ---
2026-10-10T21:22:13.6432781Z   duration_ms: 9.87962
2026-10-10T21:22:13.6433132Z   type: 'test'
2026-10-10T21:22:13.6433441Z   ...
2026-10-10T21:22:13.6434160Z # Subtest: explain — an empty element for a topic the file does not hold
2026-10-10T21:22:13.6435227Z ok 942 - explain — an empty element for a topic the file does not hold
2026-10-10T21:22:13.6435794Z   ---
2026-10-10T21:22:13.6436100Z   duration_ms: 0.218902
2026-10-10T21:22:13.6436480Z   type: 'test'
2026-10-10T21:22:13.6436785Z   ...
2026-10-10T21:22:13.6437485Z # Subtest: explain — repository: what a repository is (UC-001)
2026-10-10T21:22:13.6438456Z ok 943 - explain — repository: what a repository is (UC-001)
2026-10-10T21:22:13.6438956Z   ---
2026-10-10T21:22:13.6439295Z   duration_ms: 1.031149
2026-10-10T21:22:13.6439637Z   type: 'test'
2026-10-10T21:22:13.6439961Z   ...
2026-10-10T21:22:13.6440813Z # Subtest: explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:22:13.6442104Z ok 944 - explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:22:13.6442737Z   ---
2026-10-10T21:22:13.6443091Z   duration_ms: 0.546954
2026-10-10T21:22:13.6443484Z   type: 'test'
2026-10-10T21:22:13.6443814Z   ...
2026-10-10T21:22:13.6444628Z # Subtest: explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:22:13.6446018Z ok 945 - explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:22:13.6446664Z   ---
2026-10-10T21:22:13.6446970Z   duration_ms: 4.730261
2026-10-10T21:22:13.6447316Z   type: 'test'
2026-10-10T21:22:13.6447634Z   ...
2026-10-10T21:22:13.6448372Z # Subtest: explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:22:13.6449399Z ok 946 - explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:22:13.6450000Z   ---
2026-10-10T21:22:13.6450322Z   duration_ms: 0.625045
2026-10-10T21:22:13.6450711Z   type: 'test'
2026-10-10T21:22:13.6451058Z   ...
2026-10-10T21:22:13.6452197Z # Subtest: explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:22:13.6453585Z ok 947 - explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:22:13.6454293Z   ---
2026-10-10T21:22:13.6454637Z   duration_ms: 0.700142
2026-10-10T21:22:13.6455050Z   type: 'test'
2026-10-10T21:22:13.6455365Z   ...
2026-10-10T21:22:13.6456138Z # Subtest: explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:22:13.6457247Z ok 948 - explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:22:13.6457825Z   ---
2026-10-10T21:22:13.6458156Z   duration_ms: 0.832193
2026-10-10T21:22:13.6458556Z   type: 'test'
2026-10-10T21:22:13.6458881Z   ...
2026-10-10T21:22:13.6459868Z # Subtest: explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:22:13.6461583Z ok 949 - explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:22:13.6462495Z   ---
2026-10-10T21:22:13.6462816Z   duration_ms: 0.484104
2026-10-10T21:22:13.6463196Z   type: 'test'
2026-10-10T21:22:13.6463499Z   ...
2026-10-10T21:22:13.6464551Z # Subtest: explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:22:13.6466073Z ok 950 - explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:22:13.6466863Z   ---
2026-10-10T21:22:13.6467211Z   duration_ms: 0.46099
2026-10-10T21:22:13.6467578Z   type: 'test'
2026-10-10T21:22:13.6467902Z   ...
2026-10-10T21:22:13.6468982Z # Subtest: startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:22:13.6470775Z ok 951 - startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:22:13.6471644Z   ---
2026-10-10T21:22:13.6472365Z   duration_ms: 2.441573
2026-10-10T21:22:13.6472713Z   type: 'test'
2026-10-10T21:22:13.6473024Z   ...
2026-10-10T21:22:13.6473945Z # Subtest: instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:22:13.6475229Z ok 952 - instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:22:13.6475936Z   ---
2026-10-10T21:22:13.6476299Z   duration_ms: 0.186624
2026-10-10T21:22:13.6476682Z   type: 'test'
2026-10-10T21:22:13.6477012Z   ...
2026-10-10T21:22:13.6478177Z # Subtest: notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:22:13.6479936Z ok 953 - notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:22:13.6480848Z   ---
2026-10-10T21:22:13.6481192Z   duration_ms: 1.810284
2026-10-10T21:22:13.6481587Z   type: 'test'
2026-10-10T21:22:13.6482053Z   ...
2026-10-10T21:22:13.6483039Z # Subtest: explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:22:13.6484477Z ok 954 - explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:22:13.6485224Z   ---
2026-10-10T21:22:13.6485565Z   duration_ms: 0.454912
2026-10-10T21:22:13.6485927Z   type: 'test'
2026-10-10T21:22:13.6486248Z   ...
2026-10-10T21:22:13.6487829Z # Subtest: sourceSchemas — gives entry and links: links is the schema of a product's docs/sources.md, its table under the product's own title
2026-10-10T21:22:13.6489724Z ok 955 - sourceSchemas — gives entry and links: links is the schema of a product's docs/sources.md, its table under the product's own title
2026-10-10T21:22:13.6490705Z   ---
2026-10-10T21:22:13.6491009Z   duration_ms: 2.144001
2026-10-10T21:22:13.6491356Z   type: 'test'
2026-10-10T21:22:13.6491655Z   ...
2026-10-10T21:22:13.6493076Z # Subtest: links — a product's links file read with the links schema, rows with and without a part, and written back byte for byte
2026-10-10T21:22:13.6494892Z ok 956 - links — a product's links file read with the links schema, rows with and without a part, and written back byte for byte
2026-10-10T21:22:13.6495816Z   ---
2026-10-10T21:22:13.6496155Z   duration_ms: 3.560619
2026-10-10T21:22:13.6496546Z   type: 'test'
2026-10-10T21:22:13.6496870Z   ...
2026-10-10T21:22:13.6498001Z # Subtest: links — a row without its version or its hash is refused by writeDocument with DocumentError naming the row and the column
2026-10-10T21:22:13.6499960Z ok 957 - links — a row without its version or its hash is refused by writeDocument with DocumentError naming the row and the column
2026-10-10T21:22:13.6500856Z   ---
2026-10-10T21:22:13.6501184Z   duration_ms: 1.334515
2026-10-10T21:22:13.6501583Z   type: 'test'
2026-10-10T21:22:13.6502079Z   ...
2026-10-10T21:22:13.6503362Z # Subtest: links — this instance's docs/sources.md read with the links schema: its row naming SRC-vibe-coding at the version 2026-10-05
2026-10-10T21:22:13.6505540Z ok 958 - links — this instance's docs/sources.md read with the links schema: its row naming SRC-vibe-coding at the version 2026-10-05
2026-10-10T21:22:13.6506440Z   ---
2026-10-10T21:22:13.6506741Z   duration_ms: 0.31116
2026-10-10T21:22:13.6507094Z   type: 'test'
2026-10-10T21:22:13.6507407Z   ...
2026-10-10T21:22:13.6508804Z # Subtest: sourceSchemas — the entry's schema is read from the module's own source.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:22:13.6511159Z ok 959 - sourceSchemas — the entry's schema is read from the module's own source.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:22:13.6512531Z   ---
2026-10-10T21:22:13.6512985Z   duration_ms: 33.761286
2026-10-10T21:22:13.6513388Z   type: 'test'
2026-10-10T21:22:13.6513805Z   ...
2026-10-10T21:22:13.6515462Z # Subtest: sourceSchemas — a register entry read through MOD-documents with the entry's schema: its front matter, \#\# Versions, \#\# Parts
2026-10-10T21:22:13.6517852Z ok 960 - sourceSchemas — a register entry read through MOD-documents with the entry's schema: its front matter, \#\# Versions, \#\# Parts
2026-10-10T21:22:13.6519099Z   ---
2026-10-10T21:22:13.6519437Z   duration_ms: 0.36952
2026-10-10T21:22:13.6520052Z   type: 'test'
2026-10-10T21:22:13.6520361Z   ...
2026-10-10T21:22:13.6522303Z # Subtest: sourceSchemas — the entry's schema holds the module file's rules: a licence, the closed kinds, three authorities, a standard's designation, versions that only grow
2026-10-10T21:22:13.6525194Z ok 961 - sourceSchemas — the entry's schema holds the module file's rules: a licence, the closed kinds, three authorities, a standard's designation, versions that only grow
2026-10-10T21:22:13.6526477Z   ---
2026-10-10T21:22:13.6526922Z   duration_ms: 5.660362
2026-10-10T21:22:13.6527320Z   type: 'test'
2026-10-10T21:22:13.6527770Z   ...
2026-10-10T21:22:13.6529378Z # Subtest: permittedPlaces — four entries: may be republished, any; restricted with places, those; restricted with none, none; unknown, as restricted
2026-10-10T21:22:13.6532067Z ok 962 - permittedPlaces — four entries: may be republished, any; restricted with places, those; restricted with none, none; unknown, as restricted
2026-10-10T21:22:13.6533283Z   ---
2026-10-10T21:22:13.6533641Z   duration_ms: 3.981844
2026-10-10T21:22:13.6534033Z   type: 'test'
2026-10-10T21:22:13.6534357Z   ...
2026-10-10T21:22:13.6535743Z # Subtest: permittedPlaces — this instance's entry SRC-vibe-coding, whose licence permits republishing, permits any place
2026-10-10T21:22:13.6537501Z ok 963 - permittedPlaces — this instance's entry SRC-vibe-coding, whose licence permits republishing, permits any place
2026-10-10T21:22:13.6538471Z   ---
2026-10-10T21:22:13.6538830Z   duration_ms: 0.510063
2026-10-10T21:22:13.6539235Z   type: 'test'
2026-10-10T21:22:13.6539572Z   ...
2026-10-10T21:22:13.6540513Z # Subtest: queues — an open, an approved and an in-SPEC entry, found past an impact table
2026-10-10T21:22:13.6542048Z ok 964 - queues — an open, an approved and an in-SPEC entry, found past an impact table
2026-10-10T21:22:13.6542739Z   ---
2026-10-10T21:22:13.6543104Z   duration_ms: 13.106038
2026-10-10T21:22:13.6543508Z   type: 'test'
2026-10-10T21:22:13.6543829Z   ...
2026-10-10T21:22:13.6544481Z # Subtest: queues — more than one queue, newest first
2026-10-10T21:22:13.6545399Z ok 965 - queues — more than one queue, newest first
2026-10-10T21:22:13.6546030Z   ---
2026-10-10T21:22:13.6546396Z   duration_ms: 3.758124
2026-10-10T21:22:13.6546800Z   type: 'test'
2026-10-10T21:22:13.6547161Z   ...
2026-10-10T21:22:13.6548289Z # Subtest: with skeleton.md unreadable on the disk, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:22:13.6550166Z ok 966 - with skeleton.md unreadable on the disk, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:22:13.6551355Z   ---
2026-10-10T21:22:13.6551670Z   duration_ms: 6.736206
2026-10-10T21:22:13.6552126Z   type: 'test'
2026-10-10T21:22:13.6552470Z   ...
2026-10-10T21:22:13.6553640Z # Subtest: with skeleton.md not served at the module's address, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:22:13.6555527Z ok 967 - with skeleton.md not served at the module's address, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:22:13.6556580Z   ---
2026-10-10T21:22:13.6556928Z   duration_ms: 32.048971
2026-10-10T21:22:13.6557327Z   type: 'test'
2026-10-10T21:22:13.6557667Z   ...
2026-10-10T21:22:13.6558384Z # Subtest: with skeleton.md readable, specSkeleton gives the same text as before
2026-10-10T21:22:13.6559444Z ok 968 - with skeleton.md readable, specSkeleton gives the same text as before
2026-10-10T21:22:13.6560122Z   ---
2026-10-10T21:22:13.6560499Z   duration_ms: 4.017396
2026-10-10T21:22:13.6560850Z   type: 'test'
2026-10-10T21:22:13.6561156Z   ...
2026-10-10T21:22:13.6562258Z # Subtest: parseSpec — the requirements of a SPEC with their four fields, their section and their line
2026-10-10T21:22:13.6563658Z ok 969 - parseSpec — the requirements of a SPEC with their four fields, their section and their line
2026-10-10T21:22:13.6564403Z   ---
2026-10-10T21:22:13.6564731Z   duration_ms: 5.591673
2026-10-10T21:22:13.6565081Z   type: 'test'
2026-10-10T21:22:13.6565392Z   ...
2026-10-10T21:22:13.6566505Z # Subtest: parseSpec — a source over several lines, and several sources split at `;`, with and without their parts
2026-10-10T21:22:13.6568182Z ok 970 - parseSpec — a source over several lines, and several sources split at `;`, with and without their parts
2026-10-10T21:22:13.6569041Z   ---
2026-10-10T21:22:13.6569376Z   duration_ms: 0.660805
2026-10-10T21:22:13.6569765Z   type: 'test'
2026-10-10T21:22:13.6570089Z   ...
2026-10-10T21:22:13.6571095Z # Subtest: parseSpec — a check naming several tests split at ` · `, and one at review naming none
2026-10-10T21:22:13.6572754Z ok 971 - parseSpec — a check naming several tests split at ` · `, and one at review naming none
2026-10-10T21:22:13.6573580Z   ---
2026-10-10T21:22:13.6573929Z   duration_ms: 0.578174
2026-10-10T21:22:13.6574324Z   type: 'test'
2026-10-10T21:22:13.6574655Z   ...
2026-10-10T21:22:13.6575555Z # Subtest: parseSpec — a requirement missing a field is read with that field null, not guessed
2026-10-10T21:22:13.6576755Z ok 972 - parseSpec — a requirement missing a field is read with that field null, not guessed
2026-10-10T21:22:13.6577702Z   ---
2026-10-10T21:22:13.6578012Z   duration_ms: 0.631006
2026-10-10T21:22:13.6578377Z   type: 'test'
2026-10-10T21:22:13.6578693Z   ...
2026-10-10T21:22:13.6584554Z # Subtest: parseSpec — the text of one section, such as a change queue's proposal, is read as a SPEC is read
2026-10-10T21:22:13.6586038Z ok 973 - parseSpec — the text of one section, such as a change queue's proposal, is read as a SPEC is read
2026-10-10T21:22:13.6586783Z   ---
2026-10-10T21:22:13.6587122Z   duration_ms: 0.450008
2026-10-10T21:22:13.6587529Z   type: 'test'
2026-10-10T21:22:13.6587850Z   ...
2026-10-10T21:22:13.6589178Z # Subtest: parseSpec — what a requirement constrains follows from the SPEC it stands in; no field of Requirement holds it
2026-10-10T21:22:13.6590739Z ok 974 - parseSpec — what a requirement constrains follows from the SPEC it stands in; no field of Requirement holds it
2026-10-10T21:22:13.6591425Z   ---
2026-10-10T21:22:13.6591741Z   duration_ms: 0.514177
2026-10-10T21:22:13.6592277Z   type: 'test'
2026-10-10T21:22:13.6592593Z   ...
2026-10-10T21:22:13.6593443Z # Subtest: specSkeleton — the title names the product: `\# <product> — Specification`
2026-10-10T21:22:13.6594597Z ok 975 - specSkeleton — the title names the product: `\# <product> — Specification`
2026-10-10T21:22:13.6595248Z   ---
2026-10-10T21:22:13.6595563Z   duration_ms: 0.797513
2026-10-10T21:22:13.6595898Z   type: 'test'
2026-10-10T21:22:13.6596199Z   ...
2026-10-10T21:22:13.6597487Z # Subtest: specSkeleton — a preamble says what a requirement is in this form: its name, source, rule and *Check:*
2026-10-10T21:22:13.6599041Z ok 976 - specSkeleton — a preamble says what a requirement is in this form: its name, source, rule and *Check:*
2026-10-10T21:22:13.6599826Z   ---
2026-10-10T21:22:13.6600111Z   duration_ms: 1.284004
2026-10-10T21:22:13.6600462Z   type: 'test'
2026-10-10T21:22:13.6600769Z   ...
2026-10-10T21:22:13.6601473Z # Subtest: specSkeleton — an empty first section, and no other section
2026-10-10T21:22:13.6602627Z ok 977 - specSkeleton — an empty first section, and no other section
2026-10-10T21:22:13.6603134Z   ---
2026-10-10T21:22:13.6603445Z   duration_ms: 0.752575
2026-10-10T21:22:13.6603770Z   type: 'test'
2026-10-10T21:22:13.6604055Z   ...
2026-10-10T21:22:13.6604688Z # Subtest: specSkeleton — reads as a SPEC without a requirement
2026-10-10T21:22:13.6605552Z ok 978 - specSkeleton — reads as a SPEC without a requirement
2026-10-10T21:22:13.6606038Z   ---
2026-10-10T21:22:13.6606375Z   duration_ms: 0.306879
2026-10-10T21:22:13.6606757Z   type: 'test'
2026-10-10T21:22:13.6607067Z   ...
2026-10-10T21:22:13.6608026Z # Subtest: specSkeleton — only the product is put in; the rest is the same for every product
2026-10-10T21:22:13.6609371Z ok 979 - specSkeleton — only the product is put in; the rest is the same for every product
2026-10-10T21:22:13.6610084Z   ---
2026-10-10T21:22:13.6610383Z   duration_ms: 0.224212
2026-10-10T21:22:13.6610753Z   type: 'test'
2026-10-10T21:22:13.6611045Z   ...
2026-10-10T21:22:13.6611818Z # Subtest: recordIndex: the records named in a tree, by identifier and by SPEC entry; any other name is unknown
2026-10-10T21:22:13.6613301Z ok 980 - recordIndex: the records named in a tree, by identifier and by SPEC entry; any other name is unknown
2026-10-10T21:22:13.6614067Z   ---
2026-10-10T21:22:13.6614376Z   duration_ms: 2.394566
2026-10-10T21:22:13.6614735Z   type: 'test'
2026-10-10T21:22:13.6615066Z   ...
2026-10-10T21:22:13.6616231Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — from the names, equal to reading every record, reading only where names cannot decide
2026-10-10T21:22:13.6617943Z ok 981 - STATUS IS DERIVED FROM THE RECORDS — from the names, equal to reading every record, reading only where names cannot decide
2026-10-10T21:22:13.6618776Z   ---
2026-10-10T21:22:13.6619090Z   duration_ms: 20.273765
2026-10-10T21:22:13.6619469Z   type: 'test'
2026-10-10T21:22:13.6619863Z   ...
2026-10-10T21:22:13.6621183Z # Subtest: counter-proof: a record named for the current blob whose content names another blob does not accept the file where it is read
2026-10-10T21:22:13.6636793Z ok 982 - counter-proof: a record named for the current blob whose content names another blob does not accept the file where it is read
2026-10-10T21:22:13.6637860Z   ---
2026-10-10T21:22:13.6638191Z   duration_ms: 4.050349
2026-10-10T21:22:13.6638564Z   type: 'test'
2026-10-10T21:22:13.6638886Z   ...
2026-10-10T21:22:13.6640066Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — SPEC entries: decided ones read no record, undecided ones only their own
2026-10-10T21:22:13.6641715Z ok 983 - STATUS IS DERIVED FROM THE RECORDS — SPEC entries: decided ones read no record, undecided ones only their own
2026-10-10T21:22:13.6642718Z   ---
2026-10-10T21:22:13.6643036Z   duration_ms: 5.912017
2026-10-10T21:22:13.6643383Z   type: 'test'
2026-10-10T21:22:13.6643722Z   ...
2026-10-10T21:22:13.6644627Z # Subtest: readByBlob: a kept text that hashes to the SHA is used without reading; a text read is kept by its SHA
2026-10-10T21:22:13.6646056Z ok 984 - readByBlob: a kept text that hashes to the SHA is used without reading; a text read is kept by its SHA
2026-10-10T21:22:13.6646868Z   ---
2026-10-10T21:22:13.6647188Z   duration_ms: 3.399124
2026-10-10T21:22:13.6647584Z   type: 'test'
2026-10-10T21:22:13.6647921Z   ...
2026-10-10T21:22:13.6648953Z # Subtest: counter-proof: a kept text whose SHA does not match is read again and replaced; a text that does not match its SHA is not kept
2026-10-10T21:22:13.6650892Z ok 985 - counter-proof: a kept text whose SHA does not match is read again and replaced; a text that does not match its SHA is not kept
2026-10-10T21:22:13.6651816Z   ---
2026-10-10T21:22:13.6652521Z   duration_ms: 1.58257
2026-10-10T21:22:13.6652871Z   type: 'test'
2026-10-10T21:22:13.6653184Z   ...
2026-10-10T21:22:13.6654132Z # Subtest: readByBlob: a cache that fails at every step is passed over — the text is read
2026-10-10T21:22:13.6655389Z ok 986 - readByBlob: a cache that fails at every step is passed over — the text is read
2026-10-10T21:22:13.6656116Z   ---
2026-10-10T21:22:13.6656419Z   duration_ms: 1.681181
2026-10-10T21:22:13.6656759Z   type: 'test'
2026-10-10T21:22:13.6657062Z   ...
2026-10-10T21:22:14.1026722Z # Subtest: \#spec reads fresh current SPEC bytes and keeps queue history for empty or absent SPEC
2026-10-10T21:22:14.1053122Z ok 987 - \#spec reads fresh current SPEC bytes and keeps queue history for empty or absent SPEC
2026-10-10T21:22:14.1065770Z   ---
2026-10-10T21:22:14.1082623Z   duration_ms: 431.910228
2026-10-10T21:22:14.1092755Z   type: 'test'
2026-10-10T21:22:14.1093277Z   ...
2026-10-10T21:22:14.1236305Z # Subtest: the dashboard \#spec controls collapse sections and toggle a current requirement in place
2026-10-10T21:22:14.1238054Z ok 988 - the dashboard \#spec controls collapse sections and toggle a current requirement in place
2026-10-10T21:22:14.1248978Z   ---
2026-10-10T21:22:14.1249554Z   duration_ms: 334.050809
2026-10-10T21:22:14.1250110Z   type: 'test'
2026-10-10T21:22:14.1250583Z   ...
2026-10-10T21:22:14.3173945Z # Subtest: TST-281 UC-001 main flow stores a product token and adds the missing layout
2026-10-10T21:22:14.3203055Z ok 989 - TST-281 UC-001 main flow stores a product token and adds the missing layout
2026-10-10T21:22:14.3218548Z   ---
2026-10-10T21:22:14.3219317Z   duration_ms: 361.722116
2026-10-10T21:22:14.3219892Z   type: 'test'
2026-10-10T21:22:14.3220343Z   ...
2026-10-10T21:22:14.3221238Z # Subtest: TST-282 UC-001 alternatives 1a and 5b distinguish a synthetic click from a person's click
2026-10-10T21:22:14.3222865Z ok 990 - TST-282 UC-001 alternatives 1a and 5b distinguish a synthetic click from a person's click
2026-10-10T21:22:14.3223725Z   ---
2026-10-10T21:22:14.3224184Z   duration_ms: 229.941317
2026-10-10T21:22:14.3224769Z   type: 'test'
2026-10-10T21:22:14.3225225Z   ...
2026-10-10T21:22:15.0686615Z # Subtest: TST-284 UC-001 GitHub alternatives preserve the product and browser boundaries
2026-10-10T21:22:15.0713147Z ok 991 - TST-284 UC-001 GitHub alternatives preserve the product and browser boundaries
2026-10-10T21:22:15.0734554Z   ---
2026-10-10T21:22:15.0742627Z   duration_ms: 751.459729
2026-10-10T21:22:15.0743182Z   type: 'test'
2026-10-10T21:22:15.0743634Z   ...
2026-10-10T21:22:15.3003412Z # Subtest: TST-285 UC-001 GitLab alternatives use the product project token
2026-10-10T21:22:15.3022898Z ok 992 - TST-285 UC-001 GitLab alternatives use the product project token
2026-10-10T21:22:15.3052481Z   ---
2026-10-10T21:22:15.3082480Z   duration_ms: 234.294713
2026-10-10T21:22:15.3112441Z   type: 'test'
2026-10-10T21:22:15.3142403Z   ...
2026-10-10T21:22:15.3372624Z # Subtest: UC-002 main flow, step 1: the page opens with the table of the process model and the rules to be met, folded only after the first reading
2026-10-10T21:22:15.3403717Z ok 993 - UC-002 main flow, step 1: the page opens with the table of the process model and the rules to be met, folded only after the first reading
2026-10-10T21:22:15.3432426Z   ---
2026-10-10T21:22:15.3462521Z   duration_ms: 118.490969
2026-10-10T21:22:15.3463261Z   type: 'test'
2026-10-10T21:22:15.3492546Z   ...
2026-10-10T21:22:15.3523889Z # Subtest: UC-002 main flow, steps 1–2: the table, then the book's five models in their two groups, each with its risks, its example and its chapter
2026-10-10T21:22:15.3526566Z ok 994 - UC-002 main flow, steps 1–2: the table, then the book's five models in their two groups, each with its risks, its example and its chapter
2026-10-10T21:22:15.3552525Z   ---
2026-10-10T21:22:15.3582456Z   duration_ms: 29.684946
2026-10-10T21:22:15.3602584Z   type: 'test'
2026-10-10T21:22:15.3643742Z   ...
2026-10-10T21:22:15.3684458Z # Subtest: UC-002 main flow, steps 3–4: the author chooses Scrum; its roles, who may fill each and what it needs; only participants with every capability are offered, each with its place
2026-10-10T21:22:15.3714272Z ok 995 - UC-002 main flow, steps 3–4: the author chooses Scrum; its roles, who may fill each and what it needs; only participants with every capability are offered, each with its place
2026-10-10T21:22:15.3732325Z   ---
2026-10-10T21:22:15.3772585Z   duration_ms: 36.439836
2026-10-10T21:22:15.3795326Z   type: 'test'
2026-10-10T21:22:15.3800883Z   ...
2026-10-10T21:22:15.3802460Z # Subtest: UC-002 main flow, step 5: the phases, each gate with what it checks and who decides it; without a branch, work merges into the default branch
2026-10-10T21:22:15.3810742Z ok 996 - UC-002 main flow, step 5: the phases, each gate with what it checks and who decides it; without a branch, work merges into the default branch
2026-10-10T21:22:15.3812215Z   ---
2026-10-10T21:22:15.3812717Z   duration_ms: 42.419799
2026-10-10T21:22:15.3813311Z   type: 'test'
2026-10-10T21:22:15.3813793Z   ...
2026-10-10T21:22:15.3814871Z # Subtest: UC-002 main flow, step 5: the transitions between the phases, and which phases pair for verification
2026-10-10T21:22:15.3816499Z ok 997 - UC-002 main flow, step 5: the transitions between the phases, and which phases pair for verification
2026-10-10T21:22:15.3817467Z   ---
2026-10-10T21:22:15.3817946Z   duration_ms: 29.498246
2026-10-10T21:22:15.3818478Z   type: 'test'
2026-10-10T21:22:15.3818959Z   ...
2026-10-10T21:22:15.3820437Z # Subtest: UC-002 main flow, step 5: a sprint's branch of its own, and its merge into the default branch as the gate at its end, decided by the Product Owner after the review
2026-10-10T21:22:15.3823034Z ok 998 - UC-002 main flow, step 5: a sprint's branch of its own, and its merge into the default branch as the gate at its end, decided by the Product Owner after the review
2026-10-10T21:22:15.3824343Z   ---
2026-10-10T21:22:15.3824828Z   duration_ms: 25.725324
2026-10-10T21:22:15.3825352Z   type: 'test'
2026-10-10T21:22:15.3825808Z   ...
2026-10-10T21:22:15.3826915Z # Subtest: UC-002 main flow, step 6: the practices, each with the models it fits; adding one leaves the model as it is
2026-10-10T21:22:15.3828670Z ok 999 - UC-002 main flow, step 6: the practices, each with the models it fits; adding one leaves the model as it is
2026-10-10T21:22:15.3830034Z   ---
2026-10-10T21:22:15.3830548Z   duration_ms: 27.291277
2026-10-10T21:22:15.3831081Z   type: 'test'
2026-10-10T21:22:15.3831537Z   ...
2026-10-10T21:22:15.3832438Z # Subtest: UC-002 main flow, step 6: each practice says what it adds
2026-10-10T21:22:15.3833499Z ok 1000 - UC-002 main flow, step 6: each practice says what it adds
2026-10-10T21:22:15.3834217Z   ---
2026-10-10T21:22:15.3834659Z   duration_ms: 28.900352
2026-10-10T21:22:15.3835158Z   type: 'test'
2026-10-10T21:22:15.3835626Z   ...
2026-10-10T21:22:15.3836898Z # Subtest: UC-002 main flow, step 7: what the product's process requirements add, each marked with its requirement and its source
2026-10-10T21:22:15.3838759Z ok 1001 - UC-002 main flow, step 7: what the product's process requirements add, each marked with its requirement and its source
2026-10-10T21:22:15.3839807Z   ---
2026-10-10T21:22:15.3840268Z   duration_ms: 21.278034
2026-10-10T21:22:15.3840782Z   type: 'test'
2026-10-10T21:22:15.3841226Z   ...
2026-10-10T21:22:15.3842554Z # Subtest: UC-002 main flow, step 8: the Definition of Done, preset to the job rules, and the folded word on who meets it in Scrum
2026-10-10T21:22:15.3844369Z ok 1002 - UC-002 main flow, step 8: the Definition of Done, preset to the job rules, and the folded word on who meets it in Scrum
2026-10-10T21:22:15.3845415Z   ---
2026-10-10T21:22:15.3845882Z   duration_ms: 21.080894
2026-10-10T21:22:15.3846409Z   type: 'test'
2026-10-10T21:22:15.3846876Z   ...
2026-10-10T21:22:15.3848362Z # Subtest: UC-002 main flow, steps 3–9: the author's choices, then one click on Save commits the declaration to the product repository
2026-10-10T21:22:15.3850930Z ok 1003 - UC-002 main flow, steps 3–9: the author's choices, then one click on Save commits the declaration to the product repository
2026-10-10T21:22:15.3852185Z   ---
2026-10-10T21:22:15.3852667Z   duration_ms: 94.757649
2026-10-10T21:22:15.3853213Z   type: 'test'
2026-10-10T21:22:15.3853688Z   ...
2026-10-10T21:22:15.3854671Z # Subtest: UC-002 main flow: every choice carries a folded What is this? with a pointer to the book
2026-10-10T21:22:15.3856064Z ok 1004 - UC-002 main flow: every choice carries a folded What is this? with a pointer to the book
2026-10-10T21:22:15.3856935Z   ---
2026-10-10T21:22:15.3857381Z   duration_ms: 36.151374
2026-10-10T21:22:15.3857898Z   type: 'test'
2026-10-10T21:22:15.3858366Z   ...
2026-10-10T21:22:15.3859562Z # Subtest: UC-002 alternative flow 3a: the organisation's own process, a data file in the catalogue's format, is offered and used
2026-10-10T21:22:15.3861345Z ok 1005 - UC-002 alternative flow 3a: the organisation's own process, a data file in the catalogue's format, is offered and used
2026-10-10T21:22:15.3862591Z   ---
2026-10-10T21:22:15.3863083Z   duration_ms: 24.17757
2026-10-10T21:22:15.3863609Z   type: 'test'
2026-10-10T21:22:15.3864070Z   ...
2026-10-10T21:22:15.3865670Z # Subtest: UC-002 alternative flow 3b: changing the model lists the artifacts the new one no longer requires; none is deleted, and the process requirement keeps its gate
2026-10-10T21:22:15.3867979Z ok 1006 - UC-002 alternative flow 3b: changing the model lists the artifacts the new one no longer requires; none is deleted, and the process requirement keeps its gate
2026-10-10T21:22:15.3869239Z   ---
2026-10-10T21:22:15.3869707Z   duration_ms: 118.202305
2026-10-10T21:22:15.3870226Z   type: 'test'
2026-10-10T21:22:15.3870675Z   ...
2026-10-10T21:22:15.3872148Z # Subtest: UC-002 alternative flow 4a: a role that needs a person has none — Save stays disabled, and the role is named
2026-10-10T21:22:15.3874048Z ok 1007 - UC-002 alternative flow 4a: a role that needs a person has none — Save stays disabled, and the role is named
2026-10-10T21:22:15.3875057Z   ---
2026-10-10T21:22:15.3875586Z   duration_ms: 45.77335
2026-10-10T21:22:15.3876164Z   type: 'test'
2026-10-10T21:22:15.3876641Z   ...
2026-10-10T21:22:15.3877969Z # Subtest: UC-002 alternative flow 4b: no participant has the capabilities a role needs — the missing capability is named
2026-10-10T21:22:15.3880163Z ok 1008 - UC-002 alternative flow 4b: no participant has the capabilities a role needs — the missing capability is named
2026-10-10T21:22:15.3881206Z   ---
2026-10-10T21:22:15.3881669Z   duration_ms: 18.627799
2026-10-10T21:22:15.3882417Z   type: 'test'
2026-10-10T21:22:15.3882764Z   ...
2026-10-10T21:22:15.3883695Z # Subtest: UC-002 alternative flow 4b: the missing capability links to UC-017, to add a participant that has it
2026-10-10T21:22:15.3884948Z ok 1009 - UC-002 alternative flow 4b: the missing capability links to UC-017, to add a participant that has it
2026-10-10T21:22:15.3885408Z   ---
2026-10-10T21:22:15.3885596Z   duration_ms: 28.2868
2026-10-10T21:22:15.3885806Z   type: 'test'
2026-10-10T21:22:15.3885988Z   ...
2026-10-10T21:22:15.3886909Z # Subtest: UC-002 alternative flow 4c: a participant processes data where a linked source does not permit it — the source and the role are named, and the assignment stays possible
2026-10-10T21:22:15.3888252Z ok 1010 - UC-002 alternative flow 4c: a participant processes data where a linked source does not permit it — the source and the role are named, and the assignment stays possible
2026-10-10T21:22:15.3888899Z   ---
2026-10-10T21:22:15.3889086Z   duration_ms: 93.566738
2026-10-10T21:22:15.3889302Z   type: 'test'
2026-10-10T21:22:15.3889484Z   ...
2026-10-10T21:22:15.3890206Z # Subtest: UC-002 alternative flow 7a: no process requirements yet — the view says so; once one is accepted, its addition appears and the model stays
2026-10-10T21:22:15.3891474Z ok 1011 - UC-002 alternative flow 7a: no process requirements yet — the view says so; once one is accepted, its addition appears and the model stays
2026-10-10T21:22:15.3892246Z   ---
2026-10-10T21:22:15.3892542Z   duration_ms: 47.758679
2026-10-10T21:22:15.3892928Z   type: 'test'
2026-10-10T21:22:15.3893229Z   ...
2026-10-10T21:22:15.3894714Z # Subtest: UC-002 alternative flow 7b: a process requirement needs a gate the model does not have — the gate is shown being added, and where; the model stays Kanban
2026-10-10T21:22:15.3897026Z ok 1012 - UC-002 alternative flow 7b: a process requirement needs a gate the model does not have — the gate is shown being added, and where; the model stays Kanban
2026-10-10T21:22:15.3898139Z   ---
2026-10-10T21:22:15.3898498Z   duration_ms: 20.387166
2026-10-10T21:22:15.3898889Z   type: 'test'
2026-10-10T21:22:15.3899231Z   ...
2026-10-10T21:22:17.4555050Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":12}
2026-10-10T21:22:17.5127633Z # Subtest: TST-266001: public Settings sends a local model test through the real composed Bridge
2026-10-10T21:22:17.5137293Z ok 1013 - TST-266001: public Settings sends a local model test through the real composed Bridge
2026-10-10T21:22:17.5138803Z   ---
2026-10-10T21:22:17.5139842Z   duration_ms: 414.209476
2026-10-10T21:22:17.5140830Z   type: 'test'
2026-10-10T21:22:17.5142056Z   ...
2026-10-10T21:22:17.5303536Z # Subtest: TST-292001: Settings Configure saves an OpenAI-compatible endpoint before one short request
2026-10-10T21:22:17.5333430Z ok 1014 - TST-292001: Settings Configure saves an OpenAI-compatible endpoint before one short request
2026-10-10T21:22:17.5360315Z   ---
2026-10-10T21:22:17.5394273Z   duration_ms: 392.52178
2026-10-10T21:22:17.5422546Z   type: 'test'
2026-10-10T21:22:17.5434743Z   ...
2026-10-10T21:22:17.5435743Z # Subtest: TST-292002: the dashboard sends Anthropic's one short Messages request
2026-10-10T21:22:17.5436925Z ok 1015 - TST-292002: the dashboard sends Anthropic's one short Messages request
2026-10-10T21:22:17.5437817Z   ---
2026-10-10T21:22:17.5442875Z   duration_ms: 275.328637
2026-10-10T21:22:17.5443455Z   type: 'test'
2026-10-10T21:22:17.5443915Z   ...
2026-10-10T21:22:17.5444714Z # Subtest: TST-292003: a browser refusal is actionable through CI and Bridge
2026-10-10T21:22:17.5445905Z ok 1016 - TST-292003: a browser refusal is actionable through CI and Bridge
2026-10-10T21:22:17.5446710Z   ---
2026-10-10T21:22:17.5447222Z   duration_ms: 258.433432
2026-10-10T21:22:17.5447781Z   type: 'test'
2026-10-10T21:22:17.5448667Z   ...
2026-10-10T21:22:17.5449702Z # Subtest: TST-292004: refused key persists through reload until Clear removes the stored endpoint
2026-10-10T21:22:17.5451079Z ok 1017 - TST-292004: refused key persists through reload until Clear removes the stored endpoint
2026-10-10T21:22:17.5452074Z   ---
2026-10-10T21:22:17.5452635Z   duration_ms: 328.894736
2026-10-10T21:22:17.5453201Z   type: 'test'
2026-10-10T21:22:17.5453756Z   ...
2026-10-10T21:22:17.5454806Z # Subtest: TST-292011: Settings Change opens the stored endpoint's named public route
2026-10-10T21:22:17.5456307Z ok 1018 - TST-292011: Settings Change opens the stored endpoint's named public route
2026-10-10T21:22:17.5457233Z   ---
2026-10-10T21:22:17.5457716Z   duration_ms: 195.753634
2026-10-10T21:22:17.5458265Z   type: 'test'
2026-10-10T21:22:17.5458809Z   ...
2026-10-10T21:22:17.5459785Z # Subtest: step 1: the line Notifications sits in the section *this browser*, and says off
2026-10-10T21:22:17.5461183Z ok 1019 - step 1: the line Notifications sits in the section *this browser*, and says off
2026-10-10T21:22:17.5462194Z   ---
2026-10-10T21:22:17.5462779Z   duration_ms: 255.693967
2026-10-10T21:22:17.5463327Z   type: 'test'
2026-10-10T21:22:17.5463787Z   ...
2026-10-10T21:22:17.5465646Z # Subtest: step 1: Switch on asks the browser's permission once, directly on the click, then offers Test and Switch off
2026-10-10T21:22:17.5467510Z ok 1020 - step 1: Switch on asks the browser's permission once, directly on the click, then offers Test and Switch off
2026-10-10T21:22:17.5468775Z   ---
2026-10-10T21:22:17.5469283Z   duration_ms: 169.52483
2026-10-10T21:22:17.5469846Z   type: 'test'
2026-10-10T21:22:17.5470308Z   ...
2026-10-10T21:22:17.5471222Z # Subtest: step 2: the check of the instance connects with the instance's own stored token
2026-10-10T21:22:17.5472729Z ok 1021 - step 2: the check of the instance connects with the instance's own stored token
2026-10-10T21:22:17.5473595Z   ---
2026-10-10T21:22:17.5474050Z   duration_ms: 60.209635
2026-10-10T21:22:17.5474601Z   type: 'test'
2026-10-10T21:22:17.5475048Z   ...
2026-10-10T21:22:17.5476089Z # Subtest: TST-279 step 2: the check also reaches each product this browser keeps, with that product's own token
2026-10-10T21:22:17.5477651Z ok 1022 - TST-279 step 2: the check also reaches each product this browser keeps, with that product's own token
2026-10-10T21:22:17.5478639Z   ---
2026-10-10T21:22:17.5479115Z   duration_ms: 69.21441
2026-10-10T21:22:17.5479652Z   type: 'test'
2026-10-10T21:22:17.5480139Z   ...
2026-10-10T21:22:17.5481220Z # Subtest: step 1 into step 3: the first check after Switch on tells nothing, even though something already waits
2026-10-10T21:22:17.5483043Z ok 1023 - step 1 into step 3: the first check after Switch on tells nothing, even though something already waits
2026-10-10T21:22:17.5484070Z   ---
2026-10-10T21:22:17.5484580Z   duration_ms: 108.539281
2026-10-10T21:22:17.5485122Z   type: 'test'
2026-10-10T21:22:17.5485582Z   ...
2026-10-10T21:22:17.5486614Z # Subtest: step 3 (and 3a): a file come to wait is notified once, naming it and an address this page resolves
2026-10-10T21:22:17.5488051Z ok 1024 - step 3 (and 3a): a file come to wait is notified once, naming it and an address this page resolves
2026-10-10T21:22:17.5488947Z   ---
2026-10-10T21:22:17.5489441Z   duration_ms: 104.952283
2026-10-10T21:22:17.5489981Z   type: 'test'
2026-10-10T21:22:17.5490539Z   ...
2026-10-10T21:22:17.5491530Z # Subtest: step 3: more than three of one kind in one repository give one notification of their number
2026-10-10T21:22:17.5493158Z ok 1025 - step 3: more than three of one kind in one repository give one notification of their number
2026-10-10T21:22:17.5494252Z   ---
2026-10-10T21:22:17.5494795Z   duration_ms: 105.743977
2026-10-10T21:22:17.5495332Z   type: 'test'
2026-10-10T21:22:17.5495799Z   ...
2026-10-10T21:22:17.5497207Z # Subtest: step 4: what was notified is kept — nothing twice while unchanged, a file changed again comes to wait anew
2026-10-10T21:22:17.5499347Z ok 1026 - step 4: what was notified is kept — nothing twice while unchanged, a file changed again comes to wait anew
2026-10-10T21:22:17.5500371Z   ---
2026-10-10T21:22:17.5500867Z   duration_ms: 203.808768
2026-10-10T21:22:17.5501403Z   type: 'test'
2026-10-10T21:22:17.5502086Z   ...
2026-10-10T21:22:17.5503324Z # Subtest: 1a: the person, or the browser, refuses — the line says blocked, and where to allow it; nothing is stored
2026-10-10T21:22:17.5504929Z ok 1027 - 1a: the person, or the browser, refuses — the line says blocked, and where to allow it; nothing is stored
2026-10-10T21:22:17.5505843Z   ---
2026-10-10T21:22:17.5506268Z   duration_ms: 156.359342
2026-10-10T21:22:17.5506758Z   type: 'test'
2026-10-10T21:22:17.5507183Z   ...
2026-10-10T21:22:17.5508132Z # Subtest: 1b: on an iPhone or iPad not opened from the Home Screen, the line says so and how to add it
2026-10-10T21:22:17.5509553Z ok 1028 - 1b: on an iPhone or iPad not opened from the Home Screen, the line says so and how to add it
2026-10-10T21:22:17.5510472Z   ---
2026-10-10T21:22:17.5510953Z   duration_ms: 108.503135
2026-10-10T21:22:17.5511484Z   type: 'test'
2026-10-10T21:22:17.5512270Z   ...
2026-10-10T21:22:17.5513501Z # Subtest: 2a/2b: while not due, opening the page makes no check — the last check time is left exactly as it was
2026-10-10T21:22:17.5514961Z ok 1029 - 2a/2b: while not due, opening the page makes no check — the last check time is left exactly as it was
2026-10-10T21:22:17.5515871Z   ---
2026-10-10T21:22:17.5516541Z   duration_ms: 57.72438
2026-10-10T21:22:17.5517017Z   type: 'test'
2026-10-10T21:22:17.5517505Z   ...
2026-10-10T21:22:17.5518754Z # Subtest: 2c: a server that cannot be reached is skipped until the next check; nothing lost, nothing notified in between
2026-10-10T21:22:17.5520365Z ok 1030 - 2c: a server that cannot be reached is skipped until the next check; nothing lost, nothing notified in between
2026-10-10T21:22:17.5521374Z   ---
2026-10-10T21:22:17.5521825Z   duration_ms: 215.704303
2026-10-10T21:22:17.5522653Z   type: 'test'
2026-10-10T21:22:17.5523143Z   ...
2026-10-10T21:22:17.5523949Z # Subtest: 4a: Switch off stops the checks and forgets what was notified
2026-10-10T21:22:17.5524959Z ok 1031 - 4a: Switch off stops the checks and forgets what was notified
2026-10-10T21:22:17.5525636Z   ---
2026-10-10T21:22:17.5526081Z   duration_ms: 160.285984
2026-10-10T21:22:17.5526574Z   type: 'test'
2026-10-10T21:22:17.5526996Z   ...
2026-10-10T21:22:17.5527795Z # Subtest: TST-293001: UC-047 derives a release report only after its candidate run ends
2026-10-10T21:22:17.5528983Z ok 1032 - TST-293001: UC-047 derives a release report only after its candidate run ends
2026-10-10T21:22:17.5529776Z   ---
2026-10-10T21:22:17.5530226Z   duration_ms: 474.815191
2026-10-10T21:22:17.5530719Z   type: 'test'
2026-10-10T21:22:17.5531181Z   ...
2026-10-10T21:22:17.5532237Z # Subtest: a '//' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5533412Z ok 1033 - a '//' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5534170Z   ---
2026-10-10T21:22:17.5534642Z   duration_ms: 4.108288
2026-10-10T21:22:17.5535157Z   type: 'test'
2026-10-10T21:22:17.5535614Z   ...
2026-10-10T21:22:17.5536491Z # Subtest: a '\#' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5537640Z ok 1034 - a '\#' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5538360Z   ---
2026-10-10T21:22:17.5538829Z   duration_ms: 0.456991
2026-10-10T21:22:17.5539376Z   type: 'test'
2026-10-10T21:22:17.5539846Z   ...
2026-10-10T21:22:17.5540760Z # Subtest: a '--' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5542112Z ok 1035 - a '--' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5542837Z   ---
2026-10-10T21:22:17.5543275Z   duration_ms: 0.261962
2026-10-10T21:22:17.5543717Z   type: 'test'
2026-10-10T21:22:17.5544170Z   ...
2026-10-10T21:22:17.5545069Z # Subtest: a ';' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5546406Z ok 1036 - a ';' declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5547095Z   ---
2026-10-10T21:22:17.5547528Z   duration_ms: 0.192581
2026-10-10T21:22:17.5548024Z   type: 'test'
2026-10-10T21:22:17.5548485Z   ...
2026-10-10T21:22:17.5549515Z # Subtest: a ' *' block-comment declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5550827Z ok 1037 - a ' *' block-comment declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5551665Z   ---
2026-10-10T21:22:17.5552275Z   duration_ms: 0.239481
2026-10-10T21:22:17.5552756Z   type: 'test'
2026-10-10T21:22:17.5553242Z   ...
2026-10-10T21:22:17.5554183Z # Subtest: a Markdown heading declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5555529Z ok 1038 - a Markdown heading declaration is read with every key — MOD-test-document
2026-10-10T21:22:17.5556309Z   ---
2026-10-10T21:22:17.5556745Z   duration_ms: 0.398041
2026-10-10T21:22:17.5557239Z   type: 'test'
2026-10-10T21:22:17.5557737Z   ...
2026-10-10T21:22:17.5558775Z # Subtest: a declaration missing a key is read with that key null — MOD-test-document
2026-10-10T21:22:17.5560195Z ok 1039 - a declaration missing a key is read with that key null — MOD-test-document
2026-10-10T21:22:17.5561019Z   ---
2026-10-10T21:22:17.5561434Z   duration_ms: 0.317846
2026-10-10T21:22:17.5562075Z   type: 'test'
2026-10-10T21:22:17.5562520Z   ...
2026-10-10T21:22:17.5563721Z # Subtest: a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document
2026-10-10T21:22:17.5565681Z ok 1040 - a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document
2026-10-10T21:22:17.5566623Z   ---
2026-10-10T21:22:17.5567080Z   duration_ms: 0.367801
2026-10-10T21:22:17.5567577Z   type: 'test'
2026-10-10T21:22:17.5568020Z   ...
2026-10-10T21:22:17.5569151Z # Subtest: a following line whose value holds ' · ' does not end the declaration — MOD-test-document
2026-10-10T21:22:17.5570735Z ok 1041 - a following line whose value holds ' · ' does not end the declaration — MOD-test-document
2026-10-10T21:22:17.5571598Z   ---
2026-10-10T21:22:17.5572271Z   duration_ms: 0.571478
2026-10-10T21:22:17.5572783Z   type: 'test'
2026-10-10T21:22:17.5573238Z   ...
2026-10-10T21:22:17.5574145Z # Subtest: a file without a declaration yields none — MOD-test-document
2026-10-10T21:22:17.5575321Z ok 1042 - a file without a declaration yields none — MOD-test-document
2026-10-10T21:22:17.5576058Z   ---
2026-10-10T21:22:17.5576698Z   duration_ms: 0.559261
2026-10-10T21:22:17.5577165Z   type: 'test'
2026-10-10T21:22:17.5577780Z   ...
2026-10-10T21:22:17.5578624Z # Subtest: TST-289001: a refused pending-report lookup is named before the new-release form
2026-10-10T21:22:17.5579953Z ok 1043 - TST-289001: a refused pending-report lookup is named before the new-release form
2026-10-10T21:22:17.5580891Z   ---
2026-10-10T21:22:17.5581355Z   duration_ms: 1.790072
2026-10-10T21:22:17.5581856Z   type: 'test'
2026-10-10T21:22:17.5582474Z   ...
2026-10-10T21:22:17.5583540Z # Subtest: TST-289002: a completed recorded candidate reopens without writes and accepts through the existing service
2026-10-10T21:22:17.5585130Z ok 1044 - TST-289002: a completed recorded candidate reopens without writes and accepts through the existing service
2026-10-10T21:22:17.5586065Z   ---
2026-10-10T21:22:17.5586540Z   duration_ms: 19.773271
2026-10-10T21:22:17.5587032Z   type: 'test'
2026-10-10T21:22:17.5587501Z   ...
2026-10-10T21:22:17.5590119Z # Subtest: TST-289003: a selected product without a pending report keeps the new-release form
2026-10-10T21:22:17.5591638Z ok 1045 - TST-289003: a selected product without a pending report keeps the new-release form
2026-10-10T21:22:17.5592644Z   ---
2026-10-10T21:22:17.5593140Z   duration_ms: 0.514578
2026-10-10T21:22:17.5593683Z   type: 'test'
2026-10-10T21:22:17.5594143Z   ...
2026-10-10T21:22:17.5595088Z # Subtest: TST-289004: a pending candidate with missing results remains incomplete
2026-10-10T21:22:17.5596649Z ok 1046 - TST-289004: a pending candidate with missing results remains incomplete
2026-10-10T21:22:17.5597456Z   ---
2026-10-10T21:22:17.5597924Z   duration_ms: 1.202337
2026-10-10T21:22:17.5598434Z   type: 'test'
2026-10-10T21:22:17.5598847Z   ...
2026-10-10T21:22:17.5602212Z # Subtest: release — main flow: version and entry before Start, the candidate and its run after it, the report once the run has ended, Accept and release in one click
2026-10-10T21:22:17.5604820Z ok 1047 - release — main flow: version and entry before Start, the candidate and its run after it, the report once the run has ended, Accept and release in one click
2026-10-10T21:22:17.5605948Z   ---
2026-10-10T21:22:17.5606342Z   duration_ms: 74.354109
2026-10-10T21:22:17.5606779Z   type: 'test'
2026-10-10T21:22:17.5607176Z   ...
2026-10-10T21:22:17.5608010Z # Subtest: release — 1a: the year that changed restarts the version at YYYY.1.0
2026-10-10T21:22:17.5609145Z ok 1048 - release — 1a: the year that changed restarts the version at YYYY.1.0
2026-10-10T21:22:17.5609812Z   ---
2026-10-10T21:22:17.5610133Z   duration_ms: 1.757352
2026-10-10T21:22:17.5610578Z   type: 'test'
2026-10-10T21:22:17.5610905Z   ...
2026-10-10T21:22:17.5611728Z # Subtest: release — 2a: only the implementing participant can run the release tests
2026-10-10T21:22:17.5613101Z ok 1049 - release — 2a: only the implementing participant can run the release tests
2026-10-10T21:22:17.5613788Z   ---
2026-10-10T21:22:17.5614113Z   duration_ms: 8.854072
2026-10-10T21:22:17.5614696Z   type: 'test'
2026-10-10T21:22:17.5615023Z   ...
2026-10-10T21:22:17.5616366Z # Subtest: release — 3a/3b: a red level and a worse rate ask for a reason first; without one Accept and release is refused, with one it releases
2026-10-10T21:22:17.5618365Z ok 1050 - release — 3a/3b: a red level and a worse rate ask for a reason first; without one Accept and release is refused, with one it releases
2026-10-10T21:22:17.5619208Z   ---
2026-10-10T21:22:17.5619533Z   duration_ms: 47.690335
2026-10-10T21:22:17.5619969Z   type: 'test'
2026-10-10T21:22:17.5620274Z   ...
2026-10-10T21:22:17.5621274Z # Subtest: release — 4a: a tag that already exists stops the release, naming 4a; the existing tag is not moved
2026-10-10T21:22:17.5622977Z ok 1051 - release — 4a: a tag that already exists stops the release, naming 4a; the existing tag is not moved
2026-10-10T21:22:17.5623732Z   ---
2026-10-10T21:22:17.5624019Z   duration_ms: 32.482568
2026-10-10T21:22:17.5624354Z   type: 'test'
2026-10-10T21:22:17.5624655Z   ...
2026-10-10T21:22:17.5625689Z # Subtest: release — 4b: a default branch that moved on while the suite ran still releases, tagged on the tested commit
2026-10-10T21:22:17.5627131Z ok 1052 - release — 4b: a default branch that moved on while the suite ran still releases, tagged on the tested commit
2026-10-10T21:22:17.5627862Z   ---
2026-10-10T21:22:17.5628153Z   duration_ms: 28.260167
2026-10-10T21:22:17.5628507Z   type: 'test'
2026-10-10T21:22:17.5628832Z   ...
2026-10-10T21:22:17.5629741Z # Subtest: defaultSchedule — the book's default, read with the schema, marked as the default
2026-10-10T21:22:17.5631107Z ok 1053 - defaultSchedule — the book's default, read with the schema, marked as the default
2026-10-10T21:22:17.5631826Z   ---
2026-10-10T21:22:17.5632314Z   duration_ms: 2.495804
2026-10-10T21:22:17.5632682Z   type: 'test'
2026-10-10T21:22:17.5633019Z   ...
2026-10-10T21:22:17.5633765Z # Subtest: scheduleSchema — a product's own schedule, read with the schema
2026-10-10T21:22:17.5634838Z ok 1054 - scheduleSchema — a product's own schedule, read with the schema
2026-10-10T21:22:17.5635411Z   ---
2026-10-10T21:22:17.5635711Z   duration_ms: 1.928491
2026-10-10T21:22:17.5636081Z   type: 'test'
2026-10-10T21:22:17.5636398Z   ...
2026-10-10T21:22:17.5637219Z # Subtest: scheduleSchema — a schedule of another shape, named by MOD-documents' findings
2026-10-10T21:22:17.5639334Z ok 1055 - scheduleSchema — a schedule of another shape, named by MOD-documents' findings
2026-10-10T21:22:17.5639958Z   ---
2026-10-10T21:22:17.5640424Z   duration_ms: 0.592731
2026-10-10T21:22:17.5640767Z   type: 'test'
2026-10-10T21:22:17.5641088Z   ...
2026-10-10T21:22:17.5642353Z # Subtest: parseFrontMatter — a text with front matter: its fields, their order, the body and the line it begins on
2026-10-10T21:22:17.5643877Z ok 1056 - parseFrontMatter — a text with front matter: its fields, their order, the body and the line it begins on
2026-10-10T21:22:17.5644710Z   ---
2026-10-10T21:22:17.5645021Z   duration_ms: 1.804648
2026-10-10T21:22:17.5645372Z   type: 'test'
2026-10-10T21:22:17.5645681Z   ...
2026-10-10T21:22:17.5646521Z # Subtest: parseFrontMatter — CR LF line ends, values trimmed, and `[]` as an empty list
2026-10-10T21:22:17.5647752Z ok 1057 - parseFrontMatter — CR LF line ends, values trimmed, and `[]` as an empty list
2026-10-10T21:22:17.5648436Z   ---
2026-10-10T21:22:17.5648735Z   duration_ms: 0.538858
2026-10-10T21:22:17.5649085Z   type: 'test'
2026-10-10T21:22:17.5649379Z   ...
2026-10-10T21:22:17.5650392Z # Subtest: parseFrontMatter — a text without front matter, and one whose front matter is broken, are all body
2026-10-10T21:22:17.5652241Z ok 1058 - parseFrontMatter — a text without front matter, and one whose front matter is broken, are all body
2026-10-10T21:22:17.5653008Z   ---
2026-10-10T21:22:17.5653297Z   duration_ms: 0.344835
2026-10-10T21:22:17.5653646Z   type: 'test'
2026-10-10T21:22:17.5653939Z   ...
2026-10-10T21:22:17.5654748Z # Subtest: formatFrontMatter — what parseFrontMatter read gives back the same bytes
2026-10-10T21:22:17.5656110Z ok 1059 - formatFrontMatter — what parseFrontMatter read gives back the same bytes
2026-10-10T21:22:17.5656837Z   ---
2026-10-10T21:22:17.5657163Z   duration_ms: 0.574192
2026-10-10T21:22:17.5657534Z   type: 'test'
2026-10-10T21:22:17.5657863Z   ...
2026-10-10T21:22:17.5659011Z # Subtest: formatFrontMatter — keys in `order`, a list one item per line, an empty list as `key:` alone, the body unchanged
2026-10-10T21:22:17.5660610Z ok 1060 - formatFrontMatter — keys in `order`, a list one item per line, an empty list as `key:` alone, the body unchanged
2026-10-10T21:22:17.5661464Z   ---
2026-10-10T21:22:17.5661758Z   duration_ms: 0.324855
2026-10-10T21:22:17.5662582Z   type: 'test'
2026-10-10T21:22:17.5662891Z   ...
2026-10-10T21:22:17.5663951Z # Subtest: formatFrontMatter — a key not of the form [a-z][a-z0-9_-]*, or a value holding a line break, throws a TypeError
2026-10-10T21:22:17.5665457Z ok 1061 - formatFrontMatter — a key not of the form [a-z][a-z0-9_-]*, or a value holding a line break, throws a TypeError
2026-10-10T21:22:17.5666246Z   ---
2026-10-10T21:22:17.5666550Z   duration_ms: 0.890416
2026-10-10T21:22:17.5666906Z   type: 'test'
2026-10-10T21:22:17.5667237Z   ...
2026-10-10T21:22:17.5668224Z # Subtest: finding and formatFinding — the module file's example, as data and as its one line of text
2026-10-10T21:22:17.5669695Z ok 1062 - finding and formatFinding — the module file's example, as data and as its one line of text
2026-10-10T21:22:17.5670418Z   ---
2026-10-10T21:22:17.5670743Z   duration_ms: 0.396708
2026-10-10T21:22:17.5671103Z   type: 'test'
2026-10-10T21:22:17.5671425Z   ...
2026-10-10T21:22:17.5672488Z # Subtest: parseFinding — a finding written in its one text form is read back unchanged
2026-10-10T21:22:17.5673733Z ok 1063 - parseFinding — a finding written in its one text form is read back unchanged
2026-10-10T21:22:17.5674392Z   ---
2026-10-10T21:22:17.5674691Z   duration_ms: 0.764121
2026-10-10T21:22:17.5675032Z   type: 'test'
2026-10-10T21:22:17.5675343Z   ...
2026-10-10T21:22:17.5676115Z # Subtest: finding — a kind, a line or a rule out of its form throws a TypeError
2026-10-10T21:22:17.5677236Z ok 1064 - finding — a kind, a line or a rule out of its form throws a TypeError
2026-10-10T21:22:17.5677822Z   ---
2026-10-10T21:22:17.5678113Z   duration_ms: 1.74146
2026-10-10T21:22:17.5678449Z   type: 'test'
2026-10-10T21:22:17.5678736Z   ...
2026-10-10T21:22:17.5679325Z # Subtest: parseFinding — null for any line of another form
2026-10-10T21:22:17.5680147Z ok 1065 - parseFinding — null for any line of another form
2026-10-10T21:22:17.5680897Z   ---
2026-10-10T21:22:17.5681217Z   duration_ms: 0.49148
2026-10-10T21:22:17.5681587Z   type: 'test'
2026-10-10T21:22:17.5682068Z   ...
2026-10-10T21:22:17.5682969Z # Subtest: blobSha — git's blob SHA of a text, the same as git hash-object gives for its bytes
2026-10-10T21:22:17.5684225Z ok 1066 - blobSha — git's blob SHA of a text, the same as git hash-object gives for its bytes
2026-10-10T21:22:17.5684951Z   ---
2026-10-10T21:22:17.5685291Z   duration_ms: 28.471801
2026-10-10T21:22:17.5685664Z   type: 'test'
2026-10-10T21:22:17.5685962Z   ...
2026-10-10T21:22:17.5686767Z # Subtest: blobSha — the known blobs, and a text hashed as given, line ends included
2026-10-10T21:22:17.5688009Z ok 1067 - blobSha — the known blobs, and a text hashed as given, line ends included
2026-10-10T21:22:17.5688717Z   ---
2026-10-10T21:22:17.5689057Z   duration_ms: 3.75879
2026-10-10T21:22:17.5689453Z   type: 'test'
2026-10-10T21:22:17.5689799Z   ...
2026-10-10T21:22:17.5690878Z # Subtest: historyMarks — withdrawals, edit stamps and dates, each with its line and its kind
2026-10-10T21:22:17.5692491Z ok 1068 - historyMarks — withdrawals, edit stamps and dates, each with its line and its kind
2026-10-10T21:22:17.5693271Z   ---
2026-10-10T21:22:17.5693604Z   duration_ms: 3.147714
2026-10-10T21:22:17.5693995Z   type: 'test'
2026-10-10T21:22:17.5694328Z   ...
2026-10-10T21:22:17.5695097Z # Subtest: historyMarks — the same marks in a text with CR LF line ends
2026-10-10T21:22:17.5696365Z ok 1069 - historyMarks — the same marks in a text with CR LF line ends
2026-10-10T21:22:17.5696989Z   ---
2026-10-10T21:22:17.5697289Z   duration_ms: 0.241828
2026-10-10T21:22:17.5697612Z   type: 'test'
2026-10-10T21:22:17.5697911Z   ...
2026-10-10T21:22:17.5698441Z # Subtest: historyMarks — none in a text without them
2026-10-10T21:22:17.5699157Z ok 1070 - historyMarks — none in a text without them
2026-10-10T21:22:17.5699656Z   ---
2026-10-10T21:22:17.5699961Z   duration_ms: 0.31956
2026-10-10T21:22:17.5700364Z   type: 'test'
2026-10-10T21:22:17.5700671Z   ...
2026-10-10T21:22:17.5701310Z # Subtest: historyMarks — a date of a change in its three forms, each marked dated-change
2026-10-10T21:22:17.5702223Z ok 1071 - historyMarks — a date of a change in its three forms, each marked dated-change
2026-10-10T21:22:17.5702867Z   ---
2026-10-10T21:22:17.5703171Z   duration_ms: 0.111434
2026-10-10T21:22:17.5703512Z   type: 'test'
2026-10-10T21:22:17.5703814Z   ...
2026-10-10T21:22:17.5704902Z # Subtest: historyMarks — a retrieval date, a version, a release, a measurement and a date in a table's cell are no mark
2026-10-10T21:22:17.5706398Z ok 1072 - historyMarks — a retrieval date, a version, a release, a measurement and a date in a table's cell are no mark
2026-10-10T21:22:17.5707157Z   ---
2026-10-10T21:22:17.5707431Z   duration_ms: 0.128756
2026-10-10T21:22:17.5707774Z   type: 'test'
2026-10-10T21:22:17.5708124Z   ...
2026-10-10T21:22:17.5709086Z # Subtest: lineDiff — every line of both texts, in order, each with its line before and after
2026-10-10T21:22:17.5710275Z ok 1073 - lineDiff — every line of both texts, in order, each with its line before and after
2026-10-10T21:22:17.5710908Z   ---
2026-10-10T21:22:17.5711221Z   duration_ms: 0.471987
2026-10-10T21:22:17.5711564Z   type: 'test'
2026-10-10T21:22:17.5711853Z   ...
2026-10-10T21:22:17.5713834Z # Subtest: lineDiff — as few added and removed lines as the two texts allow
2026-10-10T21:22:17.5714787Z ok 1074 - lineDiff — as few added and removed lines as the two texts allow
2026-10-10T21:22:17.5715393Z   ---
2026-10-10T21:22:17.5715717Z   duration_ms: 0.367174
2026-10-10T21:22:17.5716095Z   type: 'test'
2026-10-10T21:22:17.5716441Z   ...
2026-10-10T21:22:17.5717278Z # Subtest: lineDiff — a text that changed only its line endings shows no difference
2026-10-10T21:22:17.5718447Z ok 1075 - lineDiff — a text that changed only its line endings shows no difference
2026-10-10T21:22:17.5719133Z   ---
2026-10-10T21:22:17.5719458Z   duration_ms: 0.18769
2026-10-10T21:22:17.5720092Z   type: 'test'
2026-10-10T21:22:17.5720419Z   ...
2026-10-10T21:22:17.5720981Z # Subtest: lineDiff — an empty text has no line
2026-10-10T21:22:17.5721701Z ok 1076 - lineDiff — an empty text has no line
2026-10-10T21:22:17.5722331Z   ---
2026-10-10T21:22:17.5722657Z   duration_ms: 0.104311
2026-10-10T21:22:17.5723038Z   type: 'test'
2026-10-10T21:22:17.5723367Z   ...
2026-10-10T21:22:17.5724065Z # Subtest: the requirements of SPEC.md are nodes — MOD-trace-graph
2026-10-10T21:22:17.5725053Z ok 1077 - the requirements of SPEC.md are nodes — MOD-trace-graph
2026-10-10T21:22:17.5725651Z   ---
2026-10-10T21:22:17.5725987Z   duration_ms: 2.971152
2026-10-10T21:22:17.5726363Z   type: 'test'
2026-10-10T21:22:17.5726679Z   ...
2026-10-10T21:22:17.5727719Z # Subtest: the tests of a test file are nodes, with a guards edge from each to what it guards — MOD-trace-graph
2026-10-10T21:22:17.5729256Z ok 1078 - the tests of a test file are nodes, with a guards edge from each to what it guards — MOD-trace-graph
2026-10-10T21:22:17.5730074Z   ---
2026-10-10T21:22:17.5730390Z   duration_ms: 1.213364
2026-10-10T21:22:17.5730762Z   type: 'test'
2026-10-10T21:22:17.5731079Z   ...
2026-10-10T21:22:17.5732050Z # Subtest: a file that cannot be read is listed in unread, with the reason — MOD-trace-graph
2026-10-10T21:22:17.5733336Z ok 1079 - a file that cannot be read is listed in unread, with the reason — MOD-trace-graph
2026-10-10T21:22:17.5734047Z   ---
2026-10-10T21:22:17.5734489Z   duration_ms: 0.277826
2026-10-10T21:22:17.5734856Z   type: 'test'
2026-10-10T21:22:17.5735177Z   ...
2026-10-10T21:22:17.5736373Z # Subtest: tracesTo gives the tests that guard a requirement, and none for a requirement that no test guards — MOD-trace-graph
2026-10-10T21:22:17.5738185Z ok 1080 - tracesTo gives the tests that guard a requirement, and none for a requirement that no test guards — MOD-trace-graph
2026-10-10T21:22:17.5739106Z   ---
2026-10-10T21:22:17.5739422Z   duration_ms: 0.805944
2026-10-10T21:22:17.5739804Z   type: 'test'
2026-10-10T21:22:17.5740117Z   ...
2026-10-10T21:22:17.5741316Z # Subtest: UC-025 step 5, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a module a gap names is marked, a module no gap names is not
2026-10-10T21:22:17.5743152Z ok 1081 - UC-025 step 5, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a module a gap names is marked, a module no gap names is not
2026-10-10T21:22:17.5744072Z   ---
2026-10-10T21:22:17.5744391Z   duration_ms: 3.175041
2026-10-10T21:22:17.5744758Z   type: 'test'
2026-10-10T21:22:17.5745095Z   ...
2026-10-10T21:22:17.5746251Z # Subtest: UC-025 step 4 and 5 — several gaps naming the same module mark it once; a gap naming no drawn module marks nothing
2026-10-10T21:22:17.5747985Z ok 1082 - UC-025 step 4 and 5 — several gaps naming the same module mark it once; a gap naming no drawn module marks nothing
2026-10-10T21:22:17.5748870Z   ---
2026-10-10T21:22:17.5749192Z   duration_ms: 1.847176
2026-10-10T21:22:17.5749564Z   type: 'test'
2026-10-10T21:22:17.5749889Z   ...
2026-10-10T21:22:17.5751470Z # Subtest: UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used interface an existing module does not provide is drawn as an arrow ending in a box marked missing
2026-10-10T21:22:17.5753946Z ok 1083 - UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used interface an existing module does not provide is drawn as an arrow ending in a box marked missing
2026-10-10T21:22:17.5755097Z   ---
2026-10-10T21:22:17.5755410Z   duration_ms: 0.681836
2026-10-10T21:22:17.5755787Z   type: 'test'
2026-10-10T21:22:17.5756110Z   ...
2026-10-10T21:22:17.5757451Z # Subtest: UC-025 step 5 — the text for 52 modules with 400 uses, every module also marked by a gap, stays below Mermaid's limit of 50,000 characters
2026-10-10T21:22:17.5759502Z ok 1084 - UC-025 step 5 — the text for 52 modules with 400 uses, every module also marked by a gap, stays below Mermaid's limit of 50,000 characters
2026-10-10T21:22:17.5760496Z   ---
2026-10-10T21:22:17.5760819Z   duration_ms: 7.644696
2026-10-10T21:22:17.5761328Z   type: 'test'
2026-10-10T21:22:17.5761655Z   ...
2026-10-10T21:22:17.5972828Z # Subtest: UC-025 step 5 — one box per module, showing its identifier and title, whatever its title holds
2026-10-10T21:22:17.5977902Z ok 1085 - UC-025 step 5 — one box per module, showing its identifier and title, whatever its title holds
2026-10-10T21:22:17.5978984Z   ---
2026-10-10T21:22:17.5979477Z   duration_ms: 5.045338
2026-10-10T21:22:17.5980000Z   type: 'test'
2026-10-10T21:22:17.5980471Z   ...
2026-10-10T21:22:17.5982484Z # Subtest: UC-025 step 5, A MODULE BELONGS TO ONE SUBSYSTEM — one box per subsystem holding its modules; the subsystem is the first decision a module follows
2026-10-10T21:22:17.5984830Z ok 1086 - UC-025 step 5, A MODULE BELONGS TO ONE SUBSYSTEM — one box per subsystem holding its modules; the subsystem is the first decision a module follows
2026-10-10T21:22:17.5986150Z   ---
2026-10-10T21:22:17.5986663Z   duration_ms: 0.625904
2026-10-10T21:22:17.5987187Z   type: 'test'
2026-10-10T21:22:17.5987673Z   ...
2026-10-10T21:22:17.5990180Z # Subtest: UC-025 step 5 — one arrow per pair of a module and a module it uses, however many of its interfaces it uses
2026-10-10T21:22:17.5992678Z ok 1087 - UC-025 step 5 — one arrow per pair of a module and a module it uses, however many of its interfaces it uses
2026-10-10T21:22:17.5993721Z   ---
2026-10-10T21:22:17.5994237Z   duration_ms: 0.374221
2026-10-10T21:22:17.5994757Z   type: 'test'
2026-10-10T21:22:17.5995205Z   ...
2026-10-10T21:22:17.6006295Z # Subtest: UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used module that has no file is drawn as one box marked missing
2026-10-10T21:22:17.6008367Z ok 1088 - UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used module that has no file is drawn as one box marked missing
2026-10-10T21:22:17.6009536Z   ---
2026-10-10T21:22:17.6010087Z   duration_ms: 0.686948
2026-10-10T21:22:17.6010624Z   type: 'test'
2026-10-10T21:22:17.6011103Z   ...
2026-10-10T21:22:17.6012842Z # Subtest: UC-025 step 5 — the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters, however many interfaces each use names
2026-10-10T21:22:17.6015242Z ok 1089 - UC-025 step 5 — the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters, however many interfaces each use names
2026-10-10T21:22:17.6016397Z   ---
2026-10-10T21:22:17.6016914Z   duration_ms: 11.24403
2026-10-10T21:22:17.6017457Z   type: 'test'
2026-10-10T21:22:17.6017942Z   ...
2026-10-10T21:22:17.6783839Z # Subtest: the public trace/specification route reads the pinned SPEC and lists each requirement in file order
2026-10-10T21:22:17.6788997Z ok 1090 - the public trace/specification route reads the pinned SPEC and lists each requirement in file order
2026-10-10T21:22:17.6790163Z   ---
2026-10-10T21:22:17.6790658Z   duration_ms: 5.061877
2026-10-10T21:22:17.6791188Z   type: 'test'
2026-10-10T21:22:17.6791670Z   ...
2026-10-10T21:22:17.6792865Z # Subtest: selecting a requirement renders its four fields safely without navigating to a queue
2026-10-10T21:22:17.6794273Z ok 1091 - selecting a requirement renders its four fields safely without navigating to a queue
2026-10-10T21:22:17.6795147Z   ---
2026-10-10T21:22:17.6795616Z   duration_ms: 26.170759
2026-10-10T21:22:17.6796157Z   type: 'test'
2026-10-10T21:22:17.6796637Z   ...
2026-10-10T21:22:17.6802357Z # Subtest: section headings start collapsed and independently toggle their requirement lists
2026-10-10T21:22:17.6804958Z ok 1092 - section headings start collapsed and independently toggle their requirement lists
2026-10-10T21:22:17.6805764Z   ---
2026-10-10T21:22:17.6806116Z   duration_ms: 1.184061
2026-10-10T21:22:17.6806506Z   type: 'test'
2026-10-10T21:22:17.6806849Z   ...
2026-10-10T21:22:17.6868131Z # Subtest: a requirement name toggles its row-local detail closed and open again
2026-10-10T21:22:17.6869535Z ok 1093 - a requirement name toggles its row-local detail closed and open again
2026-10-10T21:22:17.6870378Z   ---
2026-10-10T21:22:17.6870863Z   duration_ms: 8.618846
2026-10-10T21:22:17.6871726Z   type: 'test'
2026-10-10T21:22:17.6872398Z   ...
2026-10-10T21:22:17.6873349Z # Subtest: an absent or empty SPEC has an explicit empty state and rendering offers no write
2026-10-10T21:22:17.6874657Z ok 1094 - an absent or empty SPEC has an explicit empty state and rendering offers no write
2026-10-10T21:22:17.6875530Z   ---
2026-10-10T21:22:17.6876033Z   duration_ms: 0.408375
2026-10-10T21:22:17.6876575Z   type: 'test'
2026-10-10T21:22:17.6877053Z   ...
2026-10-10T21:22:21.9735962Z # Subtest: TST-284001: ensureKey creates the Bridge Ed25519 pair with matching public data
2026-10-10T21:22:21.9737659Z ok 1095 - TST-284001: ensureKey creates the Bridge Ed25519 pair with matching public data
2026-10-10T21:22:21.9738610Z   ---
2026-10-10T21:22:21.9739110Z   duration_ms: 3725.152365
2026-10-10T21:22:21.9739773Z   type: 'test'
2026-10-10T21:22:21.9740296Z   ...
2026-10-10T21:22:21.9765872Z # Subtest: TST-284002: ensureKey keeps the exact existing pair and private-file mode
2026-10-10T21:22:21.9767294Z ok 1096 - TST-284002: ensureKey keeps the exact existing pair and private-file mode
2026-10-10T21:22:21.9768280Z   ---
2026-10-10T21:22:21.9768812Z   duration_ms: 427.655062
2026-10-10T21:22:21.9769391Z   type: 'test'
2026-10-10T21:22:21.9769900Z   ...
2026-10-10T21:22:21.9770751Z # Subtest: TST-284003: ensureKey reports a controlled unwritable folder
2026-10-10T21:22:21.9772012Z ok 1097 - TST-284003: ensureKey reports a controlled unwritable folder
2026-10-10T21:22:21.9772841Z   ---
2026-10-10T21:22:21.9773654Z   duration_ms: 212.889245
2026-10-10T21:22:21.9774245Z   type: 'test'
2026-10-10T21:22:21.9774746Z   ...
2026-10-10T21:22:24.3819203Z # Subtest: TST-286001: public runtime exposes the exact opening state before a dynamic unavailable SSH port fails
2026-10-10T21:22:24.3822980Z ok 1098 - TST-286001: public runtime exposes the exact opening state before a dynamic unavailable SSH port fails
2026-10-10T21:22:24.3824134Z   ---
2026-10-10T21:22:24.3824675Z   duration_ms: 407.763804
2026-10-10T21:22:24.3825217Z   type: 'test'
2026-10-10T21:22:24.3825704Z   ...
2026-10-10T21:22:24.3826590Z # Subtest: TST-286002: runtime refuses a non-loopback reverse plan before forwarding
2026-10-10T21:22:24.3827885Z ok 1099 - TST-286002: runtime refuses a non-loopback reverse plan before forwarding
2026-10-10T21:22:24.3828733Z   ---
2026-10-10T21:22:24.3829213Z   duration_ms: 335.935634
2026-10-10T21:22:24.3829733Z   type: 'test'
2026-10-10T21:22:24.3830188Z   ...
2026-10-10T21:22:24.3831127Z # Subtest: TST-286003: reverse forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:22:24.3832562Z ok 1100 - TST-286003: reverse forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:22:24.3833432Z   ---
2026-10-10T21:22:24.3833890Z   duration_ms: 552.788181
2026-10-10T21:22:24.3834403Z   type: 'test'
2026-10-10T21:22:24.3834868Z   ...
2026-10-10T21:22:24.3835767Z # Subtest: TST-286004: forward forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:22:24.3837081Z ok 1101 - TST-286004: forward forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:22:24.3837942Z   ---
2026-10-10T21:22:24.3838402Z   duration_ms: 666.380169
2026-10-10T21:22:24.3838942Z   type: 'test'
2026-10-10T21:22:24.3839404Z   ...
2026-10-10T21:22:24.3840212Z # Subtest: TST-286005: changed host key is refused before forwarding
2026-10-10T21:22:24.3841260Z ok 1102 - TST-286005: changed host key is refused before forwarding
2026-10-10T21:22:24.3842816Z   ---
2026-10-10T21:22:24.3843334Z   duration_ms: 816.158912
2026-10-10T21:22:24.3843966Z   type: 'test'
2026-10-10T21:22:24.3844427Z   ...
2026-10-10T21:22:24.3845467Z # Subtest: TST-286006: an occupied forward listener fails without closing another authenticated tunnel
2026-10-10T21:22:24.3847010Z ok 1103 - TST-286006: an occupied forward listener fails without closing another authenticated tunnel
2026-10-10T21:22:24.3847974Z   ---
2026-10-10T21:22:24.3848431Z   duration_ms: 567.191216
2026-10-10T21:22:24.3848963Z   type: 'test'
2026-10-10T21:22:24.3849701Z   ...
2026-10-10T21:22:24.3850837Z # Subtest: TST-286007: authentication and unreachable failures are isolated from an open authenticated tunnel
2026-10-10T21:22:24.3852615Z ok 1104 - TST-286007: authentication and unreachable failures are isolated from an open authenticated tunnel
2026-10-10T21:22:24.3853642Z   ---
2026-10-10T21:22:24.3854117Z   duration_ms: 613.101198
2026-10-10T21:22:24.3854645Z   type: 'test'
2026-10-10T21:22:24.3855109Z   ...
2026-10-10T21:22:24.3855979Z # Subtest: TST-286008: reconnect delays grow and close cancels the next reconnect
2026-10-10T21:22:24.3857199Z ok 1105 - TST-286008: reconnect delays grow and close cancels the next reconnect
2026-10-10T21:22:24.3857992Z   ---
2026-10-10T21:22:24.3858459Z   duration_ms: 1155.658512
2026-10-10T21:22:24.3858987Z   type: 'test'
2026-10-10T21:22:24.3859438Z   ...
2026-10-10T21:22:24.3860663Z # Subtest: TST-286009: refused forward channels leave no listener for a later client after close
2026-10-10T21:22:24.3862108Z ok 1106 - TST-286009: refused forward channels leave no listener for a later client after close
2026-10-10T21:22:24.3863040Z   ---
2026-10-10T21:22:24.3864027Z   duration_ms: 849.899837
2026-10-10T21:22:24.3864437Z   type: 'test'
2026-10-10T21:22:24.3864812Z   ...
2026-10-10T21:22:24.3866107Z # Subtest: TST-286010: supplied runtime tunnelHandlers answer through the authenticated Bridge route
2026-10-10T21:22:24.3867534Z ok 1107 - TST-286010: supplied runtime tunnelHandlers answer through the authenticated Bridge route
2026-10-10T21:22:24.3868709Z   ---
2026-10-10T21:22:24.3869480Z   duration_ms: 260.493492
2026-10-10T21:22:24.3869898Z   type: 'test'
2026-10-10T21:22:24.3870342Z   ...
2026-10-10T21:22:24.3871136Z # Subtest: TST-286011: runtime refuses a non-loopback forward plan before forwarding
2026-10-10T21:22:24.3872421Z ok 1108 - TST-286011: runtime refuses a non-loopback forward plan before forwarding
2026-10-10T21:22:24.3873241Z   ---
2026-10-10T21:22:24.3873658Z   duration_ms: 242.352814
2026-10-10T21:22:24.3874135Z   type: 'test'
2026-10-10T21:22:24.3874548Z   ...
2026-10-10T21:22:24.3875681Z # Subtest: TST-286012: ensureKey regenerates malformed generated Ed25519 output without replacing existing invalid files
2026-10-10T21:22:24.3877400Z ok 1109 - TST-286012: ensureKey regenerates malformed generated Ed25519 output without replacing existing invalid files
2026-10-10T21:22:24.3878379Z   ---
2026-10-10T21:22:24.3878727Z   duration_ms: 261.521608
2026-10-10T21:22:24.3879136Z   type: 'test'
2026-10-10T21:22:24.3879479Z   ...
2026-10-10T21:22:24.3948880Z # Subtest: planSchemas.backlogOrder — an order whose table Item names items is read as those items, in the table's order
2026-10-10T21:22:24.3951068Z ok 1110 - planSchemas.backlogOrder — an order whose table Item names items is read as those items, in the table's order
2026-10-10T21:22:24.3952312Z   ---
2026-10-10T21:22:24.3952746Z   duration_ms: 3.349618
2026-10-10T21:22:24.3953219Z   type: 'test'
2026-10-10T21:22:24.3953715Z   ...
2026-10-10T21:22:24.3955138Z # Subtest: planSchemas.backlogOrder — a row whose cell is no item's identifier is named as a finding of that row
2026-10-10T21:22:24.3956908Z ok 1111 - planSchemas.backlogOrder — a row whose cell is no item's identifier is named as a finding of that row
2026-10-10T21:22:24.3957780Z   ---
2026-10-10T21:22:24.3958122Z   duration_ms: 2.842246
2026-10-10T21:22:24.3958514Z   type: 'test'
2026-10-10T21:22:24.3958853Z   ...
2026-10-10T21:22:24.3960215Z # Subtest: planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order
2026-10-10T21:22:24.3962314Z ok 1112 - planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order
2026-10-10T21:22:24.3963362Z   ---
2026-10-10T21:22:24.3963698Z   duration_ms: 1.055128
2026-10-10T21:22:24.3964085Z   type: 'test'
2026-10-10T21:22:24.3964432Z   ...
2026-10-10T21:22:24.3964749Z 1..1112
2026-10-10T21:22:24.3965074Z # tests 1112
2026-10-10T21:22:24.3965410Z # suites 0
2026-10-10T21:22:24.3966049Z # pass 1104
2026-10-10T21:22:24.3966428Z # fail 0
2026-10-10T21:22:24.3966803Z # cancelled 0
2026-10-10T21:22:24.3967202Z # skipped 0
2026-10-10T21:22:24.3967579Z # todo 8
2026-10-10T21:22:24.3967994Z # duration_ms 60201.1556
````

**Python checks** — SHA-256 `49b22315152be1ce398f4fca5be44dda60e6dc5f348181c19a953c9a27a7623e`.

```text
﻿2026-10-10T21:21:25.5203831Z ##[group]Run cd tests && python3 -m unittest -v
2026-10-10T21:21:25.5204412Z [36;1mcd tests && python3 -m unittest -v[0m
2026-10-10T21:21:25.5549678Z shell: /usr/bin/bash -e {0}
2026-10-10T21:21:25.5550240Z ##[endgroup]
2026-10-10T21:21:25.7926625Z test_the_applier_passes_over_architecture_records (test_apply_approvals.ApplierPassesOverArchitectureRecords.test_the_applier_passes_over_architecture_records) ... ok
2026-10-10T21:21:25.7959016Z test_approved_proposal_is_written_verbatim (test_apply_approvals.ApplyTests.test_approved_proposal_is_written_verbatim) ... ok
2026-10-10T21:21:25.8023409Z test_blob_sha_equals_git (test_apply_approvals.ApplyTests.test_blob_sha_equals_git) ... ok
2026-10-10T21:21:25.8034140Z test_readme_with_example_records_is_not_a_record (test_apply_approvals.ApplyTests.test_readme_with_example_records_is_not_a_record) ... ok
2026-10-10T21:21:25.8061697Z test_record_anchor_must_match_the_queue (test_apply_approvals.ApplyTests.test_record_anchor_must_match_the_queue) ... ok
2026-10-10T21:21:25.8086650Z test_record_outside_a_queue_is_refused (test_apply_approvals.ApplyTests.test_record_outside_a_queue_is_refused) ... ok
2026-10-10T21:21:25.8119423Z test_second_run_changes_nothing (test_apply_approvals.ApplyTests.test_second_run_changes_nothing) ... ok
2026-10-10T21:21:25.8149720Z test_stale_proposal_is_not_applied (test_apply_approvals.ApplyTests.test_stale_proposal_is_not_applied) ... ok
2026-10-10T21:21:25.8178956Z test_stale_section_is_not_applied (test_apply_approvals.ApplyTests.test_stale_section_is_not_applied) ... ok
2026-10-10T21:21:25.8205483Z test_unknown_queue_is_refused_not_crashed (test_apply_approvals.ApplyTests.test_unknown_queue_is_refused_not_crashed) ... ok
2026-10-10T21:21:25.8216405Z test_use_case_records_are_left_alone (test_apply_approvals.ApplyTests.test_use_case_records_are_left_alone) ... ok
2026-10-10T21:21:25.8893126Z test_dashboard_writes_what_the_workflow_writes (test_apply_approvals.DashboardCommitTests.test_dashboard_writes_what_the_workflow_writes) ... ok
2026-10-10T21:21:25.9581411Z test_record_whose_decision_row_exists_is_skipped (test_apply_approvals.DashboardCommitTests.test_record_whose_decision_row_exists_is_skipped) ... ok
2026-10-10T21:21:26.0416413Z test_a_proposal_with_crlf_line_ends_is_written_byte_for_byte (test_apply_approvals.EngineKeepsTheBytes.test_a_proposal_with_crlf_line_ends_is_written_byte_for_byte) ... ok
2026-10-10T21:21:26.1128692Z test_a_section_with_cr_bytes_that_did_not_change_is_replaced (test_apply_approvals.EngineKeepsTheBytes.test_a_section_with_cr_bytes_that_did_not_change_is_replaced) ... ok
2026-10-10T21:21:26.1780477Z test_counter_proof_a_changed_section_with_cr_bytes_is_still_refused (test_apply_approvals.EngineKeepsTheBytes.test_counter_proof_a_changed_section_with_cr_bytes_is_still_refused) ... ok
2026-10-10T21:21:26.2421460Z test_cr_bytes_outside_the_approved_section_stay (test_apply_approvals.EngineKeepsTheBytes.test_cr_bytes_outside_the_approved_section_stay) ... ok
2026-10-10T21:21:26.3684656Z test_a_second_run_writes_nothing_on_either_side (test_apply_approvals.Twin.test_a_second_run_writes_nothing_on_either_side) ... ok
2026-10-10T21:21:26.6173793Z test_the_cases_apply_refuse_and_pass_over (test_apply_approvals.Twin.test_the_cases_apply_refuse_and_pass_over) ... ok
2026-10-10T21:21:28.7588769Z test_the_engine_writes_the_bytes_and_the_report_of_the_python_tool (test_apply_approvals.Twin.test_the_engine_writes_the_bytes_and_the_report_of_the_python_tool) ... ok
2026-10-10T21:21:28.8252465Z test_twin_on_a_proposal_with_crlf_line_ends (test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_proposal_with_crlf_line_ends) ... expected failure
2026-10-10T21:21:28.8917748Z test_twin_on_a_section_with_cr_bytes (test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_section_with_cr_bytes) ... expected failure
2026-10-10T21:21:28.9643140Z test_twin_on_a_spec_with_cr_bytes_outside_the_section (test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_spec_with_cr_bytes_outside_the_section) ... expected failure
2026-10-10T21:21:28.9655982Z test_a_record_of_a_renamed_use_case_stays_valid (test_approval_records.ApprovalRecords.test_a_record_of_a_renamed_use_case_stays_valid) ... ok
2026-10-10T21:21:28.9661025Z test_counter_proof (test_approval_records.ApprovalRecords.test_counter_proof) ... ok
2026-10-10T21:21:28.9859960Z test_every_record_is_well_formed (test_approval_records.ApprovalRecords.test_every_record_is_well_formed) ... ok
2026-10-10T21:21:28.9867841Z test_records_of_architecture_decisions_and_modules (test_approval_records.ApprovalRecords.test_records_of_architecture_decisions_and_modules) ... ok
2026-10-10T21:21:28.9872698Z test_a_file_that_is_neither_is_named (test_architecture_files.ArchitectureFiles.test_a_file_that_is_neither_is_named) ... ok
2026-10-10T21:21:28.9880153Z test_counter_proof_decision (test_architecture_files.ArchitectureFiles.test_counter_proof_decision) ... ok
2026-10-10T21:21:28.9891497Z test_counter_proof_module (test_architecture_files.ArchitectureFiles.test_counter_proof_module) ... ok
2026-10-10T21:21:28.9894076Z test_empty_lists_are_allowed_where_the_SPEC_reports_gaps (test_architecture_files.ArchitectureFiles.test_empty_lists_are_allowed_where_the_SPEC_reports_gaps) ... ok
2026-10-10T21:21:29.0086300Z test_every_architecture_file_of_the_instance_is_complete (test_architecture_files.ArchitectureFiles.test_every_architecture_file_of_the_instance_is_complete) ... ok
2026-10-10T21:21:29.0090547Z test_the_fixture_files_are_complete (test_architecture_files.ArchitectureFiles.test_the_fixture_files_are_complete) ... ok
2026-10-10T21:21:29.0102578Z test_counter_proof_a_diagram_that_is_not_mermaid (test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_a_diagram_that_is_not_mermaid) ... ok
2026-10-10T21:21:29.0104892Z test_counter_proof_a_file_that_is_not_markdown (test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_a_file_that_is_not_markdown) ... ok
2026-10-10T21:21:29.0107185Z test_counter_proof_mermaid_and_text_about_images_pass (test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_mermaid_and_text_about_images_pass) ... ok
2026-10-10T21:21:29.2618304Z test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams (test_artifact_format.ArtifactsAreMarkdown.test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams) ... ok
2026-10-10T21:21:29.3230158Z test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams (test_artifact_format.ArtifactsAreMarkdown.test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams) ... ok
2026-10-10T21:21:29.3233957Z test_the_image_reader_finds_the_image_of_a_use_case_fixture (test_artifact_format.ArtifactsAreMarkdown.test_the_image_reader_finds_the_image_of_a_use_case_fixture) ... ok
2026-10-10T21:21:29.3236685Z test_this_repository_has_mermaid_diagrams_to_find (test_artifact_format.ArtifactsAreMarkdown.test_this_repository_has_mermaid_diagrams_to_find) ... ok
2026-10-10T21:21:29.6987073Z test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields.TestAgentMsOwnBacklog.test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from) ... ok
2026-10-10T21:21:29.8053406Z test_a_bug_realises_the_requirement_the_code_violates (test_backlog_item_fields.TestAnItemFromAnIssue.test_a_bug_realises_the_requirement_the_code_violates) ... ok
2026-10-10T21:21:29.9134048Z test_a_change_realises_the_requirements_of_its_queue_entries_each_once (test_backlog_item_fields.TestAnItemFromAnIssue.test_a_change_realises_the_requirements_of_its_queue_entries_each_once) ... ok
2026-10-10T21:21:29.9628287Z test_an_issue_without_a_description_gives_an_empty_outcome (test_backlog_item_fields.TestAnItemFromAnIssue.test_an_issue_without_a_description_gives_an_empty_outcome) ... ok
2026-10-10T21:21:30.1701087Z test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing (test_backlog_item_fields.TestAnItemFromAnIssue.test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing) ... ok
2026-10-10T21:21:30.3269033Z test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item (test_backlog_item_fields.TestAnItemFromAnIssue.test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item) ... ok
2026-10-10T21:21:30.4394095Z test_a_use_case_counts_only_when_the_product_has_it (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_a_use_case_counts_only_when_the_product_has_it) ... ok
2026-10-10T21:21:30.4966507Z test_checking_leaves_the_item_as_it_was (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_checking_leaves_the_item_as_it_was) ... ok
2026-10-10T21:21:30.5560891Z test_counter_proof_another_identifier_in_capitals_is_no_requirement_name (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_counter_proof_another_identifier_in_capitals_is_no_requirement_name) ... ok
2026-10-10T21:21:31.2254447Z test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_every_broken_item_yields_exactly_the_findings_expected_json_names) ... ok
2026-10-10T21:21:31.4927186Z test_the_items_of_the_fixture_backlog_have_no_finding (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_the_items_of_the_fixture_backlog_have_no_finding) ... ok
2026-10-10T21:21:31.7073867Z test_without_known_names_only_the_form_of_a_name_is_checked (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_without_known_names_only_the_form_of_a_name_is_checked) ... ok
2026-10-10T21:21:31.7681928Z test_an_item_with_the_outcome_of_another_is_flagged (test_backlog_item_fields.TestAnItemThatRestatesAnother.test_an_item_with_the_outcome_of_another_is_flagged) ... ok
2026-10-10T21:21:31.8282514Z test_an_item_with_the_title_of_another_is_flagged (test_backlog_item_fields.TestAnItemThatRestatesAnother.test_an_item_with_the_title_of_another_is_flagged) ... ok
2026-10-10T21:21:31.9519491Z test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome (test_backlog_item_fields.TestAnItemThatRestatesAnother.test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome) ... ok
2026-10-10T21:21:31.9526945Z test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria (test_backlog_item_fields.TestTheJobThatDraftsItems.test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria) ... ok
2026-10-10T21:21:32.0645594Z test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged (test_backlog_item_fields.TestTheJobThatDraftsItems.test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged) ... ok
2026-10-10T21:21:32.1153074Z test_the_checks_it_names_are_functions_of_the_module (test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_checks_it_names_are_functions_of_the_module) ... ok
2026-10-10T21:21:32.1155889Z test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items (test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items) ... ok
2026-10-10T21:21:32.1158894Z test_the_prompt_fills_every_input_and_nothing_else (test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_prompt_fills_every_input_and_nothing_else) ... ok
2026-10-10T21:21:32.2092919Z test_every_item_of_this_repository_is_read_without_a_problem (test_backlog_layout.TestAgentMsOwnBacklog.test_every_item_of_this_repository_is_read_without_a_problem) ... ok
2026-10-10T21:21:32.2173205Z test_the_backlog_is_markdown_under_docs_backlog (test_backlog_layout.TestAgentMsOwnBacklog.test_the_backlog_is_markdown_under_docs_backlog) ... ok
2026-10-10T21:21:32.3186883Z test_the_order_of_this_repository_places_every_item_once (test_backlog_layout.TestAgentMsOwnBacklog.test_the_order_of_this_repository_places_every_item_once) ... expected failure
2026-10-10T21:21:32.3716470Z test_a_section_the_item_lacks_is_read_as_empty (test_backlog_layout.TestAnItemIsRead.test_a_section_the_item_lacks_is_read_as_empty) ... ok
2026-10-10T21:21:32.4271172Z test_an_item_is_read_into_its_parts (test_backlog_layout.TestAnItemIsRead.test_an_item_is_read_into_its_parts) ... ok
2026-10-10T21:21:32.4781737Z test_an_origin_that_is_no_issue_is_kept_as_it_is_written (test_backlog_layout.TestAnItemIsRead.test_an_origin_that_is_no_issue_is_kept_as_it_is_written) ... ok
2026-10-10T21:21:32.5299303Z test_lists_may_be_empty_and_an_origin_may_name_several_issues (test_backlog_layout.TestAnItemIsRead.test_lists_may_be_empty_and_an_origin_may_name_several_issues) ... ok
2026-10-10T21:21:32.5890914Z test_an_order_naming_every_item_leaves_nothing_unplaced (test_backlog_layout.TestTheOrder.test_an_order_naming_every_item_leaves_nothing_unplaced) ... ok
2026-10-10T21:21:32.6476739Z test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout.TestTheOrder.test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem) ... ok
2026-10-10T21:21:32.7049526Z test_prose_and_other_lists_of_the_order_file_are_not_read_as_items (test_backlog_layout.TestTheOrder.test_prose_and_other_lists_of_the_order_file_are_not_read_as_items) ... ok
2026-10-10T21:21:32.7624196Z test_the_order_follows_the_lines_not_their_numbers (test_backlog_layout.TestTheOrder.test_the_order_follows_the_lines_not_their_numbers) ... ok
2026-10-10T21:21:32.8260043Z test_the_order_names_items_and_the_rest_is_appended_at_the_bottom (test_backlog_layout.TestTheOrder.test_the_order_names_items_and_the_rest_is_appended_at_the_bottom) ... ok
2026-10-10T21:21:32.8813928Z test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier (test_backlog_layout.TestTheOrder.test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier) ... ok
2026-10-10T21:21:32.9333315Z test_counter_proof_a_file_without_front_matter_is_no_item (test_backlog_layout.TestWhereAnItemLives.test_counter_proof_a_file_without_front_matter_is_no_item) ... ok
2026-10-10T21:21:32.9869458Z test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem (test_backlog_layout.TestWhereAnItemLives.test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem) ... ok
2026-10-10T21:21:33.3529948Z test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem (test_backlog_layout.TestWhereAnItemLives.test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem) ... ok
2026-10-10T21:21:33.5625721Z test_every_item_of_the_fixture_backlog_is_where_an_item_must_be (test_backlog_layout.TestWhereAnItemLives.test_every_item_of_the_fixture_backlog_is_where_an_item_must_be) ... ok
2026-10-10T21:21:33.6161508Z test_a_command_that_would_break_the_rule_is_never_written (test_bridge_tunnel.ReverseTunnelOnLoopback.test_a_command_that_would_break_the_rule_is_never_written) ... ok
2026-10-10T21:21:33.8684051Z test_counter_proof_any_other_bind_address_fails (test_bridge_tunnel.ReverseTunnelOnLoopback.test_counter_proof_any_other_bind_address_fails) ... ok
2026-10-10T21:21:34.0180873Z test_the_generated_reverse_command_names_the_loopback_address (test_bridge_tunnel.ReverseTunnelOnLoopback.test_the_generated_reverse_command_names_the_loopback_address) ... ok
2026-10-10T21:21:34.0184721Z test_counter_proof_a_job_without_the_limit_or_with_a_longer_one_is_named (test_ci_budget.PullRequestCiWithinTwoMinutes.test_counter_proof_a_job_without_the_limit_or_with_a_longer_one_is_named) ... ok
2026-10-10T21:21:34.0187361Z test_every_job_of_the_pull_request_workflow_stops_after_two_minutes (test_ci_budget.PullRequestCiWithinTwoMinutes.test_every_job_of_the_pull_request_workflow_stops_after_two_minutes) ... ok
2026-10-10T21:21:34.0680994Z test_clear_leaves_no_agent_m_key (test_clear_removes_storage.ClearRemovesStorage.test_clear_leaves_no_agent_m_key) ... ok
2026-10-10T21:21:34.1190392Z test_counter_proof_a_form_reset_is_not_a_clear (test_clear_removes_storage.ClearRemovesStorage.test_counter_proof_a_form_reset_is_not_a_clear) ... ok
2026-10-10T21:21:34.1193074Z test_counter_proof_access_not_the_word (test_config_client_side.ConfigClientSide.test_counter_proof_access_not_the_word) ... ok
2026-10-10T21:21:34.1366223Z test_only_the_store_module_touches_browser_storage (test_config_client_side.ConfigClientSide.test_only_the_store_module_touches_browser_storage) ... ok
2026-10-10T21:21:34.1849377Z test_token_lands_in_the_given_browser_store (test_config_client_side.ConfigClientSide.test_token_lands_in_the_given_browser_store) ... ok
2026-10-10T21:21:34.2607430Z test_a_withdrawn_name_is_a_gap_with_its_note (test_coverage_report.ModuleGaps.test_a_withdrawn_name_is_a_gap_with_its_note) ... ok
2026-10-10T21:21:34.3362489Z test_counter_proof_a_module_with_requirement_code_and_test_is_no_gap (test_coverage_report.ModuleGaps.test_counter_proof_a_module_with_requirement_code_and_test_is_no_gap) ... ok
2026-10-10T21:21:34.4111036Z test_each_module_row_names_what_it_realises_follows_its_code_and_its_tests (test_coverage_report.ModuleGaps.test_each_module_row_names_what_it_realises_follows_its_code_and_its_tests) ... ok
2026-10-10T21:21:34.6378837Z test_the_four_gaps_of_the_rule_and_those_of_uc_025_are_listed (test_coverage_report.ModuleGaps.test_the_four_gaps_of_the_rule_and_those_of_uc_025_are_listed) ... ok
2026-10-10T21:21:34.8485547Z test_every_view_is_computed_on_a_graph_full_of_gaps (test_coverage_report.NothingBlocks.test_every_view_is_computed_on_a_graph_full_of_gaps) ... ok
2026-10-10T21:21:35.0009436Z test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed (test_coverage_report.UnrealisedRequirements.test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed) ... ok
2026-10-10T21:21:35.0751119Z test_counter_proof_a_realised_requirement_is_no_gap (test_coverage_report.UnrealisedRequirements.test_counter_proof_a_realised_requirement_is_no_gap) ... ok
2026-10-10T21:21:35.1494466Z test_the_fixture_has_no_coverage_gap_but_its_untested_rule (test_coverage_report.UnrealisedRequirements.test_the_fixture_has_no_coverage_gap_but_its_untested_rule) ... ok
2026-10-10T21:21:35.2801121Z test_disclosed_destinations_match_where_the_token_may_go (test_destination_disclosure.DestinationDisclosure.test_disclosed_destinations_match_where_the_token_may_go) ... ok
2026-10-10T21:21:35.2805589Z test_a_complete_use_case_passes (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_complete_use_case_passes) ... ok
2026-10-10T21:21:35.2813778Z test_a_diagram_stored_as_an_image_is_reported (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_diagram_stored_as_an_image_is_reported) ... ok
2026-10-10T21:21:35.2816690Z test_a_use_case_without_a_mermaid_block_is_reported (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_use_case_without_a_mermaid_block_is_reported) ... ok
2026-10-10T21:21:35.2905657Z test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image) ... ok
2026-10-10T21:21:35.2922411Z test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture) ... ok
2026-10-10T21:21:35.4850072Z test_the_dashboards_reader_reports_the_same_on_their_lines (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_the_dashboards_reader_reports_the_same_on_their_lines) ... ok
2026-10-10T21:21:35.6021782Z test_a_gate_may_check_what_an_earlier_phase_produced (test_gate_definition.TestGateDefinition.test_a_gate_may_check_what_an_earlier_phase_produced) ... ok
2026-10-10T21:21:35.7231572Z test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says (test_gate_definition.TestGateDefinition.test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says) ... ok
2026-10-10T21:21:35.8434898Z test_a_gate_with_artifacts_and_a_condition_passes (test_gate_definition.TestGateDefinition.test_a_gate_with_artifacts_and_a_condition_passes) ... ok
2026-10-10T21:21:35.9020924Z test_counter_proof_a_back_transition_does_not_make_the_phase_it_leaves_earlier (test_gate_definition.TestGateDefinition.test_counter_proof_a_back_transition_does_not_make_the_phase_it_leaves_earlier) ... ok
2026-10-10T21:21:35.9630672Z test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused) ... ok
2026-10-10T21:21:36.0210364Z test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused) ... ok
2026-10-10T21:21:36.1441867Z test_counter_proof_a_gate_without_a_condition_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_without_a_condition_is_refused) ... ok
2026-10-10T21:21:36.2660516Z test_counter_proof_a_gate_without_artifacts_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_without_artifacts_is_refused) ... ok
2026-10-10T21:21:36.3951123Z test_every_gate_is_read_with_what_it_checks (test_gate_definition.TestGateDefinition.test_every_gate_is_read_with_what_it_checks) ... ok
2026-10-10T21:21:36.4487150Z test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes (test_groups.ArrangedInNestedGroups.test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes) ... ok
2026-10-10T21:21:36.7772760Z test_every_kind_reads_as_its_nested_hierarchy (test_groups.ArrangedInNestedGroups.test_every_kind_reads_as_its_nested_hierarchy) ... ok
2026-10-10T21:21:36.8366923Z test_format_of_parse_is_the_text_of_a_canonical_file (test_groups.ArrangedInNestedGroups.test_format_of_parse_is_the_text_of_a_canonical_file) ... ok
2026-10-10T21:21:36.8973864Z test_format_writes_the_canonical_text (test_groups.ArrangedInNestedGroups.test_format_writes_the_canonical_text) ... ok
2026-10-10T21:21:36.9538159Z test_format_writes_the_heading_it_is_given (test_groups.ArrangedInNestedGroups.test_format_writes_the_heading_it_is_given) ... ok
2026-10-10T21:21:37.0079948Z test_a_group_is_named_by_its_title_only (test_groups.GroupCarriesNoIdentifier.test_a_group_is_named_by_its_title_only) ... ok
2026-10-10T21:21:37.5978741Z test_a_group_title_named_as_an_identifier_is_found (test_groups.GroupCarriesNoIdentifier.test_a_group_title_named_as_an_identifier_is_found) ... ok
2026-10-10T21:21:37.6502355Z test_a_title_written_like_an_identifier_is_reported (test_groups.GroupCarriesNoIdentifier.test_a_title_written_like_an_identifier_is_reported) ... ok
2026-10-10T21:21:38.3437366Z test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected (test_groups.GroupCarriesNoIdentifier.test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected) ... ok
2026-10-10T21:21:38.6101989Z test_every_broken_fixture_yields_exactly_the_findings_expected_json_names (test_groups.GroupFileFindings.test_every_broken_fixture_yields_exactly_the_findings_expected_json_names) ... ok
2026-10-10T21:21:38.8743773Z test_the_complete_files_yield_no_finding (test_groups.GroupFileFindings.test_the_complete_files_yield_no_finding) ... ok
2026-10-10T21:21:38.9265807Z test_a_member_of_another_kind_is_reported (test_groups.OneKindOfArtifact.test_a_member_of_another_kind_is_reported) ... ok
2026-10-10T21:21:38.9809885Z test_a_move_into_a_group_of_another_kind_is_refused (test_groups.OneKindOfArtifact.test_a_move_into_a_group_of_another_kind_is_refused) ... ok
2026-10-10T21:21:39.0342753Z test_an_empty_hierarchy_holds_the_kind_it_is_given (test_groups.OneKindOfArtifact.test_an_empty_hierarchy_holds_the_kind_it_is_given) ... ok
2026-10-10T21:21:39.0901752Z test_a_move_that_would_lose_or_duplicate_is_refused (test_groups.OnePlaceInTheHierarchy.test_a_move_that_would_lose_or_duplicate_is_refused) ... ok
2026-10-10T21:21:39.2002582Z test_a_moved_item_or_group_leaves_no_copy_behind (test_groups.OnePlaceInTheHierarchy.test_a_moved_item_or_group_leaves_no_copy_behind) ... ok
2026-10-10T21:21:39.2536490Z test_an_item_listed_twice_is_reported_in_both_places (test_groups.OnePlaceInTheHierarchy.test_an_item_listed_twice_is_reported_in_both_places) ... ok
2026-10-10T21:21:39.3077880Z test_apply_moves_leaves_the_tree_it_is_given_as_it_was (test_groups.OnePlaceInTheHierarchy.test_apply_moves_leaves_the_tree_it_is_given_as_it_was) ... ok
2026-10-10T21:21:39.3638982Z test_create_rename_and_delete_change_only_groups (test_groups.OnePlaceInTheHierarchy.test_create_rename_and_delete_change_only_groups) ... ok
2026-10-10T21:21:39.4153865Z test_every_known_item_has_exactly_one_place (test_groups.OnePlaceInTheHierarchy.test_every_known_item_has_exactly_one_place) ... ok
2026-10-10T21:21:39.4156195Z test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind (test_groups.OwnGroupFile.test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind) ... skipped 'this repository has no group files'
2026-10-10T21:21:39.4678916Z test_the_group_file_holds_titles_and_identifiers_only (test_groups.OwnGroupFile.test_the_group_file_holds_titles_and_identifiers_only) ... ok
2026-10-10T21:21:39.6819035Z test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after (test_groups.RegroupingLeavesTheGroupedFilesUnchanged.test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after) ... ok
2026-10-10T21:21:39.7344532Z test_a_not_yet_placed_item_is_written_only_once_it_is_moved (test_groups.UngroupedItemAtTheTopLevel.test_a_not_yet_placed_item_is_written_only_once_it_is_moved) ... ok
2026-10-10T21:21:39.7859480Z test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed (test_groups.UngroupedItemAtTheTopLevel.test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed) ... ok
2026-10-10T21:21:39.8386112Z test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named (test_groups.UngroupedItemAtTheTopLevel.test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named) ... ok
2026-10-10T21:21:39.8905927Z test_without_a_group_file_every_item_is_at_the_top_level (test_groups.UngroupedItemAtTheTopLevel.test_without_a_group_file_every_item_is_at_the_top_level) ... ok
2026-10-10T21:21:39.8912158Z test_both_pages_declare_the_icon (test_home_screen_icon.HomeScreenIcon.test_both_pages_declare_the_icon) ... ok
2026-10-10T21:21:40.0529800Z test_counter_proofs_full_size_transparent_and_too_small_are_named (test_home_screen_icon.HomeScreenIcon.test_counter_proofs_full_size_transparent_and_too_small_are_named) ... ok
2026-10-10T21:21:40.0918234Z test_the_sign_stands_at_80_percent_on_a_white_square (test_home_screen_icon.HomeScreenIcon.test_the_sign_stands_at_80_percent_on_a_white_square) ... ok
2026-10-10T21:21:40.3155718Z test_an_identifier_travels_with_its_artifact (test_identifier_stability.IdentifierStability.test_an_identifier_travels_with_its_artifact) ... ok
2026-10-10T21:21:40.4830194Z test_counter_proof_a_withdrawn_identifier_is_not_reused (test_identifier_stability.IdentifierStability.test_counter_proof_a_withdrawn_identifier_is_not_reused) ... ok
2026-10-10T21:21:40.6476951Z test_counter_proof_a_withdrawn_identifier_without_its_note (test_identifier_stability.IdentifierStability.test_counter_proof_a_withdrawn_identifier_without_its_note) ... ok
2026-10-10T21:21:41.2319091Z test_counter_proof_an_identifier_gone_without_a_note (test_identifier_stability.IdentifierStability.test_counter_proof_an_identifier_gone_without_a_note) ... ok
2026-10-10T21:21:41.3154603Z test_counter_proof_the_earlier_version_read_as_the_later_one (test_identifier_stability.IdentifierStability.test_counter_proof_the_earlier_version_read_as_the_later_one) ... ok
2026-10-10T21:21:41.6819418Z test_counter_proof_a_file_without_an_identifier (test_identifiers.Identifiers.test_counter_proof_a_file_without_an_identifier) ... ok
2026-10-10T21:21:41.7353274Z test_counter_proof_a_malformed_identifier_has_no_kind (test_identifiers.Identifiers.test_counter_proof_a_malformed_identifier_has_no_kind) ... ok
2026-10-10T21:21:41.8098337Z test_counter_proof_a_requirement_without_a_name_in_capitals (test_identifiers.Identifiers.test_counter_proof_a_requirement_without_a_name_in_capitals) ... ok
2026-10-10T21:21:41.9584703Z test_counter_proof_a_test_whose_cases_carry_no_identifier (test_identifiers.Identifiers.test_counter_proof_a_test_whose_cases_carry_no_identifier) ... ok
2026-10-10T21:21:42.1816645Z test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries (test_identifiers.Identifiers.test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries) ... ok
2026-10-10T21:21:42.4087915Z test_counter_proof_one_identifier_on_two_artifacts (test_identifiers.Identifiers.test_counter_proof_one_identifier_on_two_artifacts) ... ok
2026-10-10T21:21:42.4826171Z test_every_artifact_of_the_fixture_is_read_by_its_identifier (test_identifiers.Identifiers.test_every_artifact_of_the_fixture_is_read_by_its_identifier) ... ok
2026-10-10T21:21:42.5348764Z test_the_kind_of_an_identifier_is_told_by_its_form (test_identifiers.Identifiers.test_the_kind_of_an_identifier_is_told_by_its_form) ... ok
2026-10-10T21:21:42.7053221Z test_a_requirement_renamed_in_place_is_touched_as_a_withdrawal (test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_a_requirement_renamed_in_place_is_touched_as_a_withdrawal) ... ok
2026-10-10T21:21:43.0375731Z test_counter_proof_without_the_queues_index_or_its_section_nothing_is_guessed (test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_counter_proof_without_the_queues_index_or_its_section_nothing_is_guessed) ... ok
2026-10-10T21:21:43.1222463Z test_the_section_is_the_one_the_index_names_not_the_entrys_first_line (test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_the_section_is_the_one_the_index_names_not_the_entrys_first_line) ... ok
2026-10-10T21:21:43.1960434Z test_a_withdrawn_requirement_lists_what_still_names_it (test_impact_list.ImpactOfARequirementChange.test_a_withdrawn_requirement_lists_what_still_names_it) ... ok
2026-10-10T21:21:43.5799708Z test_counter_proof_what_does_not_name_it_is_not_listed (test_impact_list.ImpactOfARequirementChange.test_counter_proof_what_does_not_name_it_is_not_listed) ... ok
2026-10-10T21:21:43.7259305Z test_every_artifact_naming_the_requirement_is_listed (test_impact_list.ImpactOfARequirementChange.test_every_artifact_naming_the_requirement_is_listed) ... ok
2026-10-10T21:21:43.9594550Z test_the_open_entry_is_shown_with_what_it_would_change_and_the_list_of_each_existing_name (test_impact_list.ImpactOfARequirementChange.test_the_open_entry_is_shown_with_what_it_would_change_and_the_list_of_each_existing_name) ... ok
2026-10-10T21:21:44.0785468Z test_fork_address_names_the_fork (test_instance_target.InstanceTarget.test_fork_address_names_the_fork) ... ok
2026-10-10T21:21:44.1936452Z test_local_serving_falls_back_to_upstream (test_instance_target.InstanceTarget.test_local_serving_falls_back_to_upstream) ... ok
2026-10-10T21:21:44.3104232Z test_malformed_repo_query_is_ignored (test_instance_target.InstanceTarget.test_malformed_repo_query_is_ignored) ... ok
2026-10-10T21:21:44.4267099Z test_product_is_chosen_by_query_the_instance_stays (test_instance_target.InstanceTarget.test_product_is_chosen_by_query_the_instance_stays) ... ok
2026-10-10T21:21:44.6084095Z test_a_planned_model_works_from_its_plan_and_refuses_neither (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_a_planned_model_works_from_its_plan_and_refuses_neither) ... ok
2026-10-10T21:21:44.7888673Z test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model) ... ok
2026-10-10T21:21:44.9716589Z test_counter_proof_an_item_of_the_backlog_starts_in_both (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_counter_proof_an_item_of_the_backlog_starts_in_both) ... ok
2026-10-10T21:21:45.1537072Z test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture) ... ok
2026-10-10T21:21:45.3402927Z test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not (test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not) ... ok
2026-10-10T21:21:45.4296084Z test_a_failed_job_blocks_it (test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_blocks_it) ... ok
2026-10-10T21:21:45.5195771Z test_a_failed_job_retried_by_a_later_running_one_is_in_progress (test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_retried_by_a_later_running_one_is_in_progress) ... ok
2026-10-10T21:21:45.6110307Z test_a_job_that_ended_without_record_blocks_it (test_job_from_backlog.TestTheStateOfAnItem.test_a_job_that_ended_without_record_blocks_it) ... ok
2026-10-10T21:21:45.7939197Z test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not (test_job_from_backlog.TestTheStateOfAnItem.test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not) ... ok
2026-10-10T21:21:45.8853934Z test_a_merged_pull_request_makes_it_done_and_is_named (test_job_from_backlog.TestTheStateOfAnItem.test_a_merged_pull_request_makes_it_done_and_is_named) ... ok
2026-10-10T21:21:46.0638172Z test_a_running_or_queued_job_makes_it_in_progress_and_is_named (test_job_from_backlog.TestTheStateOfAnItem.test_a_running_or_queued_job_makes_it_in_progress_and_is_named) ... ok
2026-10-10T21:21:46.1578994Z test_an_item_back_in_development_after_its_merge_is_in_progress_again (test_job_from_backlog.TestTheStateOfAnItem.test_an_item_back_in_development_after_its_merge_is_in_progress_again) ... ok
2026-10-10T21:21:46.2506725Z test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it (test_job_from_backlog.TestTheStateOfAnItem.test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it) ... ok
2026-10-10T21:21:46.6306773Z test_an_item_whose_names_are_all_accepted_is_ready (test_job_from_backlog.TestTheStateOfAnItem.test_an_item_whose_names_are_all_accepted_is_ready) ... ok
2026-10-10T21:21:46.7229082Z test_an_open_pull_request_makes_it_in_progress_and_is_named (test_job_from_backlog.TestTheStateOfAnItem.test_an_open_pull_request_makes_it_in_progress_and_is_named) ... ok
2026-10-10T21:21:47.0019145Z test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready (test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready) ... ok
2026-10-10T21:21:47.0956563Z test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items (test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items) ... ok
2026-10-10T21:21:47.1859163Z test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing) ... ok
2026-10-10T21:21:47.2794839Z test_what_is_happening_is_shown_before_what_is_not_accepted (test_job_from_backlog.TestTheStateOfAnItem.test_what_is_happening_is_shown_before_what_is_not_accepted) ... ok
2026-10-10T21:21:47.2811692Z test_a_folder_without_an_index_keeps_the_names_of_its_files (test_jsrun_names.ModuleFolderNames.test_a_folder_without_an_index_keeps_the_names_of_its_files) ... ok
2026-10-10T21:21:47.2832258Z test_every_module_folder_has_its_index_and_its_parts_by_the_folder_name (test_jsrun_names.ModuleFolderNames.test_every_module_folder_has_its_index_and_its_parts_by_the_folder_name) ... ok
2026-10-10T21:21:47.2842965Z test_two_files_that_would_share_a_name_are_still_refused (test_jsrun_names.ModuleFolderNames.test_two_files_that_would_share_a_name_are_still_refused) ... ok
2026-10-10T21:21:47.2844724Z test_counter_proof (test_licence.Licence.test_counter_proof) ... ok
2026-10-10T21:21:47.2846181Z test_root_licence_is_mit (test_licence.Licence.test_root_licence_is_mit) ... ok
2026-10-10T21:21:47.3782549Z test_counter_proof_a_red_ci_guards_no_requirement (test_main_page.EachProductsProgressByStage.test_counter_proof_a_red_ci_guards_no_requirement) ... ok
2026-10-10T21:21:47.5684085Z test_counter_proof_with_all_four_accepted_the_stage_is_at_100_percent (test_main_page.EachProductsProgressByStage.test_counter_proof_with_all_four_accepted_the_stage_is_at_100_percent) ... ok
2026-10-10T21:21:47.6651052Z test_each_stage_is_filled_by_the_share_of_its_work_that_is_accepted_or_done (test_main_page.EachProductsProgressByStage.test_each_stage_is_filled_by_the_share_of_its_work_that_is_accepted_or_done) ... ok
2026-10-10T21:21:47.7606190Z test_the_six_stages_stand_in_their_order (test_main_page.EachProductsProgressByStage.test_the_six_stages_stand_in_their_order) ... ok
2026-10-10T21:21:47.8538269Z test_the_stage_the_product_is_in_is_marked (test_main_page.EachProductsProgressByStage.test_the_stage_the_product_is_in_is_marked) ... ok
2026-10-10T21:21:48.0446273Z test_three_of_four_use_cases_accepted_show_the_use_case_stage_at_75_percent (test_main_page.EachProductsProgressByStage.test_three_of_four_use_cases_accepted_show_the_use_case_stage_at_75_percent) ... ok
2026-10-10T21:21:48.2368649Z test_a_running_job_is_shown_beside_its_step (test_main_page.TheBuildIsShownAsItHappens.test_a_running_job_is_shown_beside_its_step) ... ok
2026-10-10T21:21:48.5204752Z test_counter_proof_once_the_job_has_ended_the_step_shows_done (test_main_page.TheBuildIsShownAsItHappens.test_counter_proof_once_the_job_has_ended_the_step_shows_done) ... ok
2026-10-10T21:21:48.5207667Z test_the_root_of_the_site_is_the_main_page (test_main_page.TheMainPageShowsWhatGoesOnInTheInstance.test_the_root_of_the_site_is_the_main_page) ... ok
2026-10-10T21:21:48.6134523Z test_what_waits_for_a_person_is_listed_with_the_page_where_it_is_decided (test_main_page.TheMainPageShowsWhatGoesOnInTheInstance.test_what_waits_for_a_person_is_listed_with_the_page_where_it_is_decided) ... ok
2026-10-10T21:21:48.6657316Z test_a_stage_whose_page_is_built_links_to_it_and_one_not_built_is_named_without_a_link (test_main_page.TheMenuFollowsTheProcess.test_a_stage_whose_page_is_built_links_to_it_and_one_not_built_is_named_without_a_link) ... ok
2026-10-10T21:21:48.7171058Z test_counter_proof_a_menu_with_two_stages_swapped_fails (test_main_page.TheMenuFollowsTheProcess.test_counter_proof_a_menu_with_two_stages_swapped_fails) ... ok
2026-10-10T21:21:48.7173770Z test_the_main_page_and_the_review_pages_carry_the_menu (test_main_page.TheMenuFollowsTheProcess.test_the_main_page_and_the_review_pages_carry_the_menu) ... ok
2026-10-10T21:21:48.7680636Z test_the_menu_lists_the_stages_in_the_order_of_the_process (test_main_page.TheMenuFollowsTheProcess.test_the_menu_lists_the_stages_in_the_order_of_the_process) ... ok
2026-10-10T21:21:48.8184246Z test_the_rendered_menu_stands_in_the_same_order (test_main_page.TheMenuFollowsTheProcess.test_the_rendered_menu_stands_in_the_same_order) ... ok
2026-10-10T21:21:49.0034628Z test_agent_ms_bar_is_full_once_its_first_release_is_tagged (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_agent_ms_bar_is_full_once_its_first_release_is_tagged) ... ok
2026-10-10T21:21:49.0977725Z test_counter_proof_before_its_first_release_the_bar_shows_the_shares (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_counter_proof_before_its_first_release_the_bar_shows_the_shares) ... ok
2026-10-10T21:21:49.1531699Z test_counter_proof_with_one_product_the_bar_shows_the_product (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_counter_proof_with_one_product_the_bar_shows_the_product) ... ok
2026-10-10T21:21:49.2065250Z test_without_a_product_the_bar_shows_agent_m (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_without_a_product_the_bar_shows_agent_m) ... ok
2026-10-10T21:21:49.3557231Z test_an_edited_artifact_changes_the_row_it_names (test_matrix_derived.MatrixDerived.test_an_edited_artifact_changes_the_row_it_names) ... ok
2026-10-10T21:21:49.5059908Z test_counter_proof_a_stored_matrix_is_not_read (test_matrix_derived.MatrixDerived.test_counter_proof_a_stored_matrix_is_not_read) ... ok
2026-10-10T21:21:49.5829667Z test_each_row_is_what_the_artifacts_name (test_matrix_derived.MatrixDerived.test_each_row_is_what_the_artifacts_name) ... ok
2026-10-10T21:21:49.6585479Z test_the_graph_is_a_value_of_the_files_alone (test_matrix_derived.MatrixDerived.test_the_graph_is_a_value_of_the_files_alone) ... ok
2026-10-10T21:21:50.0175161Z test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass (test_model_validation.TestDecider.test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass) ... ok
2026-10-10T21:21:50.2600588Z test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected (test_model_validation.TestDecider.test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected) ... ok
2026-10-10T21:21:50.3792311Z test_counter_proof_a_gate_without_a_decider_is_rejected (test_model_validation.TestDecider.test_counter_proof_a_gate_without_a_decider_is_rejected) ... ok
2026-10-10T21:21:50.4362731Z test_a_planned_definition_is_read_into_its_parts (test_model_validation.TestReading.test_a_planned_definition_is_read_into_its_parts) ... ok
2026-10-10T21:21:50.4970725Z test_a_pulled_definition_is_read_into_its_parts (test_model_validation.TestReading.test_a_pulled_definition_is_read_into_its_parts) ... ok
2026-10-10T21:21:50.6166439Z test_a_time_box_is_read_with_its_length (test_model_validation.TestReading.test_a_time_box_is_read_with_its_length) ... ok
2026-10-10T21:21:51.2807710Z test_each_error_stands_beside_the_field_that_causes_it (test_model_validation.TestValidation.test_each_error_stands_beside_the_field_that_causes_it) ... ok
2026-10-10T21:21:52.0612718Z test_each_rule_the_spec_and_uc_031_name_has_a_broken_definition_that_is_rejected (test_model_validation.TestValidation.test_each_rule_the_spec_and_uc_031_name_has_a_broken_definition_that_is_rejected) ... ok
2026-10-10T21:21:53.8707142Z test_every_broken_definition_yields_exactly_the_errors_expected_json_names (test_model_validation.TestValidation.test_every_broken_definition_yields_exactly_the_errors_expected_json_names) ... ok
2026-10-10T21:21:53.9349668Z test_every_model_definition_of_this_repository_passes_validation (test_model_validation.TestValidation.test_every_model_definition_of_this_repository_passes_validation) ... ok
2026-10-10T21:21:54.0523800Z test_the_complete_definitions_pass_validation (test_model_validation.TestValidation.test_the_complete_definitions_pass_validation) ... ok
2026-10-10T21:21:54.1145778Z test_the_model_agent_m_declares_gives_its_flow_control (test_model_validation.TestValidation.test_the_model_agent_m_declares_gives_its_flow_control) ... ok
2026-10-10T21:21:54.1790909Z test_validation_leaves_the_model_as_it_was (test_model_validation.TestValidation.test_validation_leaves_the_model_as_it_was) ... ok
2026-10-10T21:21:54.2146376Z test_counter_proof_a_foreign_address_is_found (test_no_backend.NoServer.test_counter_proof_a_foreign_address_is_found) ... ok
2026-10-10T21:21:54.2491045Z test_counter_proof_a_markdown_file_that_loads_from_another_host (test_no_backend.NoServer.test_counter_proof_a_markdown_file_that_loads_from_another_host) ... ok
2026-10-10T21:21:54.2823297Z test_counter_proof_a_method_named_fetch_or_a_comment_is_no_call (test_no_backend.NoServer.test_counter_proof_a_method_named_fetch_or_a_comment_is_no_call) ... ok
2026-10-10T21:21:54.3160942Z test_counter_proof_a_modules_own_data_files (test_no_backend.NoServer.test_counter_proof_a_modules_own_data_files) ... ok
2026-10-10T21:21:54.3492514Z test_counter_proof_a_permitted_channel_without_its_evidence_is_found (test_no_backend.NoServer.test_counter_proof_a_permitted_channel_without_its_evidence_is_found) ... ok
2026-10-10T21:21:54.3815102Z test_counter_proof_a_vendored_librarys_addresses_are_not_the_own_codes (test_no_backend.NoServer.test_counter_proof_a_vendored_librarys_addresses_are_not_the_own_codes) ... ok
2026-10-10T21:21:54.4136185Z test_counter_proof_an_unknown_channel_is_found (test_no_backend.NoServer.test_counter_proof_an_unknown_channel_is_found) ... ok
2026-10-10T21:21:54.4475808Z test_counter_proof_only_the_bridge_handle_transport_is_allowed (test_no_backend.NoServer.test_counter_proof_only_the_bridge_handle_transport_is_allowed) ... ok
2026-10-10T21:21:54.4805751Z test_counter_proof_only_the_configured_endpoint_transport_is_allowed (test_no_backend.NoServer.test_counter_proof_only_the_configured_endpoint_transport_is_allowed) ... ok
2026-10-10T21:21:54.5140683Z test_counter_proof_only_the_site_frames_own_static_header_assets_load (test_no_backend.NoServer.test_counter_proof_only_the_site_frames_own_static_header_assets_load) ... ok
2026-10-10T21:21:54.5757743Z test_every_address_in_the_own_code_names_a_permitted_host (test_no_backend.NoServer.test_every_address_in_the_own_code_names_a_permitted_host) ... ok
2026-10-10T21:21:54.6136873Z test_mermaid_renders_katex_untrusted (test_no_backend.NoServer.test_mermaid_renders_katex_untrusted) ... ok
2026-10-10T21:21:54.8428197Z test_no_served_markdown_loads_from_another_host (test_no_backend.NoServer.test_no_served_markdown_loads_from_another_host) ... ok
2026-10-10T21:21:56.2698634Z test_requests_leave_only_through_the_known_channels (test_no_backend.NoServer.test_requests_leave_only_through_the_known_channels) ... ok
2026-10-10T21:21:56.3023713Z test_the_dashboard_sets_no_worker_address_for_mermaid (test_no_backend.NoServer.test_the_dashboard_sets_no_worker_address_for_mermaid) ... ok
2026-10-10T21:21:56.3336056Z test_the_site_has_code_to_check (test_no_backend.NoServer.test_the_site_has_code_to_check) ... ok
2026-10-10T21:21:56.3339632Z test_counter_proof (test_no_config_cookie.NoCookie.test_counter_proof) ... ok
2026-10-10T21:21:56.3363551Z test_no_site_code_writes_a_cookie (test_no_config_cookie.NoCookie.test_no_site_code_writes_a_cookie) ... ok
2026-10-10T21:21:56.3864657Z test_fetch_refuses_a_url_that_contains_the_token (test_no_credential_in_url.NoCredentialInUrl.test_fetch_refuses_a_url_that_contains_the_token) ... ok
2026-10-10T21:21:56.4361194Z test_github_links_take_no_token (test_no_credential_in_url.NoCredentialInUrl.test_github_links_take_no_token) ... ok
2026-10-10T21:21:56.6515756Z test_counter_proof_a_code_file_that_names_not_one_module (test_origin_links.OriginLinks.test_counter_proof_a_code_file_that_names_not_one_module) ... ok
2026-10-10T21:21:57.0058785Z test_counter_proof_a_test_that_names_no_module_or_guards_nothing (test_origin_links.OriginLinks.test_counter_proof_a_test_that_names_no_module_or_guards_nothing) ... ok
2026-10-10T21:21:57.3636001Z test_counter_proof_a_use_case_decision_or_module_that_names_nothing (test_origin_links.OriginLinks.test_counter_proof_a_use_case_decision_or_module_that_names_nothing) ... ok
2026-10-10T21:21:57.5022216Z test_every_artifact_of_the_fixture_names_its_origin (test_origin_links.OriginLinks.test_every_artifact_of_the_fixture_names_its_origin) ... ok
2026-10-10T21:21:57.5523881Z test_guards_are_names_separated_by_semicolons (test_origin_links.OriginLinks.test_guards_are_names_separated_by_semicolons) ... ok
2026-10-10T21:21:57.5527640Z test_the_review_pages_and_the_review_layout_are_under_docs (test_pages_layout.PagesLayout.test_the_review_pages_and_the_review_layout_are_under_docs) ... ok
2026-10-10T21:21:57.5531044Z test_the_root_holds_the_main_page (test_pages_layout.PagesLayout.test_the_root_holds_the_main_page) ... ok
2026-10-10T21:21:57.5532833Z test_address_forms (test_products_folder.NoProductNamed.test_address_forms) ... ok
2026-10-10T21:21:57.5663019Z test_counter_proof_a_fixture_that_commits_one_fails (test_products_folder.NoProductNamed.test_counter_proof_a_fixture_that_commits_one_fails) ... ok
2026-10-10T21:21:57.7658067Z test_instance_repository_names_no_product (test_products_folder.NoProductNamed.test_instance_repository_names_no_product) ... ok
2026-10-10T21:21:57.7709289Z test_counter_proof (test_products_folder.ProductsFolder.test_counter_proof) ... ok
2026-10-10T21:21:57.8452384Z test_created_product_folder_is_ignored (test_products_folder.ProductsFolder.test_created_product_folder_is_ignored) ... ok
2026-10-10T21:21:57.8472610Z test_readme_is_not_ignored (test_products_folder.ProductsFolder.test_readme_is_not_ignored) ... ok
2026-10-10T21:21:57.8494723Z test_readme_is_tracked (test_products_folder.ProductsFolder.test_readme_is_tracked) ... ok
2026-10-10T21:21:58.3011753Z test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown (test_progress_derived.ItemStatesAreDerived.test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown) ... ok
2026-10-10T21:21:58.3016038Z test_deleting_local_storage_and_the_cached_texts_shows_the_same_board (test_progress_derived.ItemStatesAreDerived.test_deleting_local_storage_and_the_cached_texts_shows_the_same_board) ... ok
2026-10-10T21:21:58.3019433Z test_the_board_shows_the_derived_states (test_progress_derived.ItemStatesAreDerived.test_the_board_shows_the_derived_states) ... ok
2026-10-10T21:21:58.4283945Z test_a_current_text_that_cannot_be_told_is_not_guessed (test_proposal_shows_current.ProposalShowsCurrent.test_a_current_text_that_cannot_be_told_is_not_guessed) ... ok
2026-10-10T21:21:58.5747496Z test_an_approval_that_names_no_current_text_is_not_written (test_proposal_shows_current.ProposalShowsCurrent.test_an_approval_that_names_no_current_text_is_not_written) ... ok
2026-10-10T21:21:58.6816205Z test_the_current_text_beside_an_entry_is_the_whole_section (test_proposal_shows_current.ProposalShowsCurrent.test_the_current_text_beside_an_entry_is_the_whole_section) ... ok
2026-10-10T21:21:58.7575749Z test_counter_proof_a_name_spelled_otherwise_is_another_name (test_references.ReferencesByIdentifier.test_counter_proof_a_name_spelled_otherwise_is_another_name) ... ok
2026-10-10T21:21:58.9049309Z test_counter_proof_a_reference_by_position_reaches_nothing (test_references.ReferencesByIdentifier.test_counter_proof_a_reference_by_position_reaches_nothing) ... ok
2026-10-10T21:21:59.0536647Z test_moving_a_requirement_or_renaming_a_file_moves_no_reference (test_references.ReferencesByIdentifier.test_moving_a_requirement_or_renaming_a_file_moves_no_reference) ... ok
2026-10-10T21:21:59.0539374Z test_every_python_open_of_agent_ms_own_spec_comes_from_a_whole_repository_scan (test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_every_python_open_of_agent_ms_own_spec_comes_from_a_whole_repository_scan) ... skipped 'runs nightly: it runs both suites once more (.github/workflows/nightly.yml)'
2026-10-10T21:21:59.0542368Z test_no_node_test_opens_agent_ms_own_spec (test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_no_node_test_opens_agent_ms_own_spec) ... skipped 'runs nightly: it runs both suites once more (.github/workflows/nightly.yml)'
2026-10-10T21:21:59.2985606Z test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not (test_release_sprint_02_c.TheWatcherSeesAKnownRead.test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not) ... ok
2026-10-10T21:22:00.6580003Z test_artifacts_are_markdown_passes_a_mermaid_diagram (test_release_sprint_02_d.ProductRuleChecks.test_artifacts_are_markdown_passes_a_mermaid_diagram) ... ok
2026-10-10T21:22:02.1336914Z test_artifacts_are_markdown_refuses_another_format (test_release_sprint_02_d.ProductRuleChecks.test_artifacts_are_markdown_refuses_another_format) ... ok
2026-10-10T21:22:04.0017438Z test_no_server_passes_the_permitted_origins (test_release_sprint_02_d.ProductRuleChecks.test_no_server_passes_the_permitted_origins) ... ok
2026-10-10T21:22:09.6423253Z test_no_server_refuses_a_call_to_another_origin (test_release_sprint_02_d.ProductRuleChecks.test_no_server_refuses_a_call_to_another_origin) ... ok
2026-10-10T21:22:09.7777908Z test_self_sufficient_passes_a_reference_into_the_product (test_release_sprint_02_d.ProductRuleChecks.test_self_sufficient_passes_a_reference_into_the_product) ... ok
2026-10-10T21:22:10.0506729Z test_self_sufficient_refuses_a_reference_into_agent_m (test_release_sprint_02_d.ProductRuleChecks.test_self_sufficient_refuses_a_reference_into_agent_m) ... ok
2026-10-10T21:22:12.3546411Z test_the_repository_passes_the_three_checks (test_release_sprint_02_d.ProductRuleChecks.test_the_repository_passes_the_three_checks) ... ok
2026-10-10T21:22:12.5778968Z test_the_dashboard_leaves_the_replaced_text_in_the_history_only (test_replaced_in_history.ReplacedInHistory.test_the_dashboard_leaves_the_replaced_text_in_the_history_only) ... ok
2026-10-10T21:22:12.6224278Z test_the_workflow_leaves_the_replaced_text_in_the_history_only (test_replaced_in_history.ReplacedInHistory.test_the_workflow_leaves_the_replaced_text_in_the_history_only) ... ok
2026-10-10T21:22:12.6795445Z test_a_field_that_runs_over_several_lines_is_read_whole (test_requirement_fields.RequirementFields.test_a_field_that_runs_over_several_lines_is_read_whole) ... ok
2026-10-10T21:22:12.7310033Z test_a_queue_entry_is_read_like_a_spec (test_requirement_fields.RequirementFields.test_a_queue_entry_is_read_like_a_spec) ... ok
2026-10-10T21:22:13.3178869Z test_a_requirement_written_without_any_source_is_read_and_its_source_named_as_missing (test_requirement_fields.RequirementFields.test_a_requirement_written_without_any_source_is_read_and_its_source_named_as_missing) ... ok
2026-10-10T21:22:13.4359857Z test_a_withdrawn_requirement_is_marked_and_owes_no_fields (test_requirement_fields.RequirementFields.test_a_withdrawn_requirement_is_marked_and_owes_no_fields) ... ok
2026-10-10T21:22:13.7263728Z test_counter_proof_a_missing_source_is_named_as_missing (test_requirement_fields.RequirementFields.test_counter_proof_a_missing_source_is_named_as_missing) ... ok
2026-10-10T21:22:13.8421581Z test_counter_proof_bold_prose_between_requirements_stays_no_requirement (test_requirement_fields.RequirementFields.test_counter_proof_bold_prose_between_requirements_stays_no_requirement) ... ok
2026-10-10T21:22:14.3141729Z test_counter_proof_each_missing_field_is_an_error (test_requirement_fields.RequirementFields.test_counter_proof_each_missing_field_is_an_error) ... ok
2026-10-10T21:22:14.3718203Z test_every_requirement_is_read_by_its_name_with_its_fields (test_requirement_fields.RequirementFields.test_every_requirement_is_read_by_its_name_with_its_fields) ... ok
2026-10-10T21:22:14.6058731Z test_the_well_formed_requirements_have_no_finding (test_requirement_fields.RequirementFields.test_the_well_formed_requirements_have_no_finding) ... ok
2026-10-10T21:22:14.8421540Z test_a_linked_source_is_a_registered_source (test_requirement_has_source.RequirementHasSource.test_a_linked_source_is_a_registered_source) ... ok
2026-10-10T21:22:15.0835521Z test_a_resource_entry_named_as_source_is_rejected (test_requirement_has_source.RequirementHasSource.test_a_resource_entry_named_as_source_is_rejected) ... ok
2026-10-10T21:22:15.6874442Z test_a_source_named_as_it_is_written_is_no_error (test_requirement_has_source.RequirementHasSource.test_a_source_named_as_it_is_written_is_no_error) ... ok
2026-10-10T21:22:15.8682327Z test_counter_proof_a_source_the_product_does_not_link (test_requirement_has_source.RequirementHasSource.test_counter_proof_a_source_the_product_does_not_link) ... ok
2026-10-10T21:22:16.1109812Z test_a_named_test_or_review_is_a_check (test_requirement_names_check.RequirementNamesItsCheck.test_a_named_test_or_review_is_a_check) ... ok
2026-10-10T21:22:16.3532471Z test_counter_proof_a_check_that_names_neither_is_an_error (test_requirement_names_check.RequirementNamesItsCheck.test_counter_proof_a_check_that_names_neither_is_an_error) ... ok
2026-10-10T21:22:16.3576325Z test_counter_proof_a_file_of_agent_m_is_found (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_a_file_of_agent_m_is_found) ... ok
2026-10-10T21:22:16.3581190Z test_counter_proof_a_service_of_agent_m_is_found (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_a_service_of_agent_m_is_found) ... ok
2026-10-10T21:22:16.3622219Z test_counter_proof_what_the_product_holds_or_nobody_holds_is_no_finding (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_what_the_product_holds_or_nobody_holds_is_no_finding) ... ok
2026-10-10T21:22:16.3689335Z test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m) ... ok
2026-10-10T21:22:16.3692482Z test_the_fixture_product_is_made_by_agent_ms_writers (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_the_fixture_product_is_made_by_agent_ms_writers) ... ok
2026-10-10T21:22:16.3695292Z test_the_reader_finds_the_references_the_fixture_makes (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_the_reader_finds_the_references_the_fixture_makes) ... ok
2026-10-10T21:22:16.3736766Z test_the_dashboard_says_neither_stand_in_nor_surrogate (test_settings_disclosure.PseudonymisationExplained.test_the_dashboard_says_neither_stand_in_nor_surrogate) ... ok
2026-10-10T21:22:16.4541483Z test_the_explanation_names_the_rewriting_without_persons (test_settings_disclosure.PseudonymisationExplained.test_the_explanation_names_the_rewriting_without_persons) ... ok
2026-10-10T21:22:16.4552532Z test_the_setting_shows_that_explanation (test_settings_disclosure.PseudonymisationExplained.test_the_setting_shows_that_explanation) ... ok
2026-10-10T21:22:16.5354265Z test_a_public_repository_is_warned_of_publication (test_settings_disclosure.PseudonymisationOffDisclosure.test_a_public_repository_is_warned_of_publication) ... ok
2026-10-10T21:22:16.6145917Z test_the_notice_states_what_follows (test_settings_disclosure.PseudonymisationOffDisclosure.test_the_notice_states_what_follows) ... ok
2026-10-10T21:22:16.6155228Z test_the_page_shows_the_notice_before_saving (test_settings_disclosure.PseudonymisationOffDisclosure.test_the_page_shows_the_notice_before_saving) ... ok
2026-10-10T21:22:16.6952107Z test_notice_names_the_owner_domain (test_settings_disclosure.SettingsDisclosure.test_notice_names_the_owner_domain) ... ok
2026-10-10T21:22:16.6965042Z test_settings_view_shows_the_notice_before_the_input (test_settings_disclosure.SettingsDisclosure.test_settings_view_shows_the_notice_before_the_input) ... ok
2026-10-10T21:22:16.7459004Z test_nothing_can_be_stored_before_acknowledging (test_settings_in_the_core.SettingsDisclosure.test_nothing_can_be_stored_before_acknowledging) ... ok
2026-10-10T21:22:16.8774818Z test_counter_proof_a_key_without_a_place_fails (test_settings_page.EverySettingOnOnePage.test_counter_proof_a_key_without_a_place_fails) ... ok
2026-10-10T21:22:17.0935217Z test_every_key_the_store_writes_has_a_place_on_the_page (test_settings_page.EverySettingOnOnePage.test_every_key_the_store_writes_has_a_place_on_the_page) ... ok
2026-10-10T21:22:17.0939777Z test_the_store_writes_no_key_but_its_named_ones (test_settings_page.EverySettingOnOnePage.test_the_store_writes_no_key_but_its_named_ones) ... ok
2026-10-10T21:22:17.1765740Z test_default_expiry_is_the_links_90_days (test_settings_page.ExpiryWarnedInAdvance.test_default_expiry_is_the_links_90_days) ... ok
2026-10-10T21:22:17.1782006Z test_storing_a_token_asks_for_its_expiry (test_settings_page.ExpiryWarnedInAdvance.test_storing_a_token_asks_for_its_expiry) ... ok
2026-10-10T21:22:17.2582375Z test_the_banner_on_every_page_carries_renew (test_settings_page.ExpiryWarnedInAdvance.test_the_banner_on_every_page_carries_renew) ... ok
2026-10-10T21:22:17.3893375Z test_the_state_line_names_the_expiry (test_settings_page.ExpiryWarnedInAdvance.test_the_state_line_names_the_expiry) ... ok
2026-10-10T21:22:17.4695314Z test_warning_from_fourteen_days_before (test_settings_page.ExpiryWarnedInAdvance.test_warning_from_fourteen_days_before) ... ok
2026-10-10T21:22:17.5484158Z test_counter_proof_no_token_no_line_but_the_setting_keeps_its_place (test_settings_page.GitLabTokensOnThePage.test_counter_proof_no_token_no_line_but_the_setting_keeps_its_place) ... ok
2026-10-10T21:22:17.8102916Z test_expiry_warned_and_refusal_named (test_settings_page.GitLabTokensOnThePage.test_expiry_warned_and_refusal_named) ... ok
2026-10-10T21:22:17.9402676Z test_one_line_per_token_with_test_change_clear (test_settings_page.GitLabTokensOnThePage.test_one_line_per_token_with_test_change_clear) ... ok
2026-10-10T21:22:18.2037307Z test_the_token_is_hidden_until_shown (test_settings_page.GitLabTokensOnThePage.test_the_token_is_hidden_until_shown) ... ok
2026-10-10T21:22:18.3396174Z test_counter_proof_after_show_the_bridge_token_appears_in_full (test_settings_page.JumpHostAndRemoteSessions.test_counter_proof_after_show_the_bridge_token_appears_in_full) ... ok
2026-10-10T21:22:18.4752784Z test_each_session_has_its_commands_test_and_clear (test_settings_page.JumpHostAndRemoteSessions.test_each_session_has_its_commands_test_and_clear) ... ok
2026-10-10T21:22:18.6087912Z test_the_bridge_token_is_hidden_until_shown (test_settings_page.JumpHostAndRemoteSessions.test_the_bridge_token_is_hidden_until_shown) ... ok
2026-10-10T21:22:18.7447212Z test_the_jump_host_is_shown_with_test_change_clear (test_settings_page.JumpHostAndRemoteSessions.test_the_jump_host_is_shown_with_test_change_clear) ... ok
2026-10-10T21:22:18.8777408Z test_without_a_jump_host_no_command_is_written (test_settings_page.JumpHostAndRemoteSessions.test_without_a_jump_host_no_command_is_written) ... ok
2026-10-10T21:22:18.9702372Z test_the_store_has_no_product_setting (test_settings_page.ProductSettingsInTheRepository.test_the_store_has_no_product_setting) ... ok
2026-10-10T21:22:19.1075449Z test_a_stored_secret_is_rendered_hidden (test_settings_page.SecretHiddenUntilShown.test_a_stored_secret_is_rendered_hidden) ... ok
2026-10-10T21:22:19.2384880Z test_counter_proof_after_show_it_appears_in_full (test_settings_page.SecretHiddenUntilShown.test_counter_proof_after_show_it_appears_in_full) ... ok
2026-10-10T21:22:19.2386334Z test_counter_proof_a_row_without_clear_is_seen (test_settings_page.TestedAndCleared.test_counter_proof_a_row_without_clear_is_seen) ... ok
2026-10-10T21:22:19.3697903Z test_each_browser_setting_has_test_and_clear (test_settings_page.TestedAndCleared.test_each_browser_setting_has_test_and_clear) ... ok
2026-10-10T21:22:19.7129397Z test_the_last_test_is_read_from_the_browser (test_settings_page.TestedAndCleared.test_the_last_test_is_read_from_the_browser) ... ok
2026-10-10T21:22:19.9510034Z test_a_conjunction_in_the_rule_is_a_warning (test_single_statement.SingleStatement.test_a_conjunction_in_the_rule_is_a_warning) ... ok
2026-10-10T21:22:20.0721397Z test_counter_proof_no_conjunction_no_warning (test_single_statement.SingleStatement.test_counter_proof_no_conjunction_no_warning) ... ok
2026-10-10T21:22:20.0801813Z test_an_open_queue_is_not_written_by_the_workflow (test_spec_gate.SpecGate.test_an_open_queue_is_not_written_by_the_workflow) ... ok
2026-10-10T21:22:20.0835627Z test_only_the_entry_a_record_names_is_written_by_the_workflow (test_spec_gate.SpecGate.test_only_the_entry_a_record_names_is_written_by_the_workflow) ... ok
2026-10-10T21:22:20.1581339Z test_the_dashboard_changes_no_byte_outside_the_accepted_section (test_spec_gate.SpecGate.test_the_dashboard_changes_no_byte_outside_the_accepted_section) ... ok
2026-10-10T21:22:20.1625130Z test_the_workflow_changes_no_byte_outside_the_approved_section (test_spec_gate.SpecGate.test_the_workflow_changes_no_byte_outside_the_approved_section) ... expected failure
2026-10-10T21:22:20.2772660Z test_a_step_without_explanation_is_refused (test_step_explanations.StepExplanations.test_a_step_without_explanation_is_refused) ... ok
2026-10-10T21:22:20.2824412Z test_the_app_renders_steps_only_through_stepHtml (test_step_explanations.StepExplanations.test_the_app_renders_steps_only_through_stepHtml) ... ok
2026-10-10T21:22:20.3324432Z test_a_file_that_is_no_test_owes_no_level (test_test_levels.TestLevels.test_a_file_that_is_no_test_owes_no_level) ... ok
2026-10-10T21:22:20.9531320Z test_counter_proof_no_level_more_than_one_or_another_one (test_test_levels.TestLevels.test_counter_proof_no_level_more_than_one_or_another_one) ... ok
2026-10-10T21:22:21.3150097Z test_every_test_of_the_fixture_has_one_level (test_test_levels.TestLevels.test_every_test_of_the_fixture_has_one_level) ... ok
2026-10-10T21:22:21.4731813Z test_the_header_of_a_test_is_read (test_test_levels.TestLevels.test_the_header_of_a_test_is_read) ... ok
2026-10-10T21:22:21.5590818Z test_a_closed_sprint_names_its_end (test_time_box_selection.TestASprintIsRead.test_a_closed_sprint_names_its_end) ... ok
2026-10-10T21:22:21.6121658Z test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty (test_time_box_selection.TestASprintIsRead.test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty) ... ok
2026-10-10T21:22:21.6981744Z test_a_sprint_naming_no_closer_and_no_branch_leaves_both_empty (test_time_box_selection.TestASprintIsRead.test_a_sprint_naming_no_closer_and_no_branch_leaves_both_empty) ... ok
2026-10-10T21:22:21.8586317Z test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem) ... ok
2026-10-10T21:22:22.0739163Z test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem) ... ok
2026-10-10T21:22:22.1815642Z test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem) ... ok
2026-10-10T21:22:22.2354678Z test_counter_proof_a_text_without_front_matter_is_no_sprint_record (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_text_without_front_matter_is_no_sprint_record) ... ok
2026-10-10T21:22:22.2356928Z test_every_sprint_record_of_this_repository_is_read_without_a_problem (test_time_box_selection.TestAgentMsOwnSprints.test_every_sprint_record_of_this_repository_is_read_without_a_problem) ... skipped 'this repository has no sprint records'
2026-10-10T21:22:22.2359438Z test_sprint_01_is_closed_and_sprint_02_runs (test_time_box_selection.TestAgentMsOwnSprints.test_sprint_01_is_closed_and_sprint_02_runs) ... skipped 'this repository has no sprint records'
2026-10-10T21:22:22.3297990Z test_a_selected_item_starts (test_time_box_selection.TestOnlyTheSelectionStarts.test_a_selected_item_starts) ... ok
2026-10-10T21:22:22.4209429Z test_a_sprint_not_yet_begun_starts_nothing (test_time_box_selection.TestOnlyTheSelectionStarts.test_a_sprint_not_yet_begun_starts_nothing) ... ok
2026-10-10T21:22:22.6043536Z test_a_time_box_ends_on_its_end_date (test_time_box_selection.TestOnlyTheSelectionStarts.test_a_time_box_ends_on_its_end_date) ... ok
2026-10-10T21:22:22.6957422Z test_an_item_outside_the_selection_is_refused_with_the_sprint_named (test_time_box_selection.TestOnlyTheSelectionStarts.test_an_item_outside_the_selection_is_refused_with_the_sprint_named) ... ok
2026-10-10T21:22:22.8749654Z test_counter_proof_a_model_without_sprints_has_no_selection_to_keep (test_time_box_selection.TestOnlyTheSelectionStarts.test_counter_proof_a_model_without_sprints_has_no_selection_to_keep) ... ok
2026-10-10T21:22:22.9665644Z test_with_no_sprint_running_nothing_starts (test_time_box_selection.TestOnlyTheSelectionStarts.test_with_no_sprint_running_nothing_starts) ... ok
2026-10-10T21:22:23.1530335Z test_without_a_time_box_a_recorded_end_ends_the_sprint (test_time_box_selection.TestOnlyTheSelectionStarts.test_without_a_time_box_a_recorded_end_ends_the_sprint) ... ok
2026-10-10T21:22:23.2493501Z test_a_selected_item_above_the_limit_is_refused_for_the_limit_only (test_time_box_selection.TestSprintsAndALimitBothHold.test_a_selected_item_above_the_limit_is_refused_for_the_limit_only) ... ok
2026-10-10T21:22:23.3467801Z test_a_selected_item_below_the_limit_starts (test_time_box_selection.TestSprintsAndALimitBothHold.test_a_selected_item_below_the_limit_starts) ... ok
2026-10-10T21:22:23.4396885Z test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection.TestSprintsAndALimitBothHold.test_an_item_outside_the_selection_above_the_limit_is_refused_for_both) ... ok
2026-10-10T21:22:23.5340386Z test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only (test_time_box_selection.TestSprintsAndALimitBothHold.test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only) ... ok
2026-10-10T21:22:23.5344682Z test_counter_proof_a_missing_or_extra_permission_is_seen (test_token_scope_documented.TokenScopeDocumented.test_counter_proof_a_missing_or_extra_permission_is_seen) ... ok
2026-10-10T21:22:23.6138719Z test_guidance_names_minimum_scope_and_reason (test_token_scope_documented.TokenScopeDocumented.test_guidance_names_minimum_scope_and_reason) ... ok
2026-10-10T21:22:23.6936383Z test_link_asks_for_exactly_the_one_token_permissions (test_token_scope_documented.TokenScopeDocumented.test_link_asks_for_exactly_the_one_token_permissions) ... ok
2026-10-10T21:22:23.7732140Z test_steps_carry_the_scope (test_token_scope_documented.TokenScopeDocumented.test_steps_carry_the_scope) ... ok
2026-10-10T21:22:23.7735804Z test_counter_proof (test_usecase_fields.UseCaseFiles.test_counter_proof) ... ok
2026-10-10T21:22:23.7822603Z test_every_use_case_is_complete (test_usecase_fields.UseCaseFiles.test_every_use_case_is_complete) ... ok
2026-10-10T21:22:23.7826177Z test_ids_are_unique (test_usecase_fields.UseCaseFiles.test_ids_are_unique) ... ok
2026-10-10T21:22:23.7828143Z test_the_old_key_stage_is_named (test_usecase_fields.UseCaseFiles.test_the_old_key_stage_is_named) ... ok
2026-10-10T21:22:23.7833681Z test_there_are_use_cases (test_usecase_fields.UseCaseFiles.test_there_are_use_cases) ... ok
2026-10-10T21:22:23.7836493Z test_a_name_in_another_form_is_reported (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_name_in_another_form_is_reported) ... ok
2026-10-10T21:22:23.7839151Z test_a_name_no_requirement_has_is_reported (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_name_no_requirement_has_is_reported) ... ok
2026-10-10T21:22:23.7841749Z test_a_use_case_realising_known_requirements_passes (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_use_case_realising_known_requirements_passes) ... ok
2026-10-10T21:22:23.7844404Z test_a_use_case_that_realises_nothing_is_reported (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_use_case_that_realises_nothing_is_reported) ... ok
2026-10-10T21:22:23.7929944Z test_every_use_case_of_this_repository_names_requirements_by_name (test_usecase_realises.UseCaseRealisesNamedRequirements.test_every_use_case_of_this_repository_names_requirements_by_name) ... ok
2026-10-10T21:22:23.8576075Z test_the_dashboards_reader_reports_the_same_name_on_its_line (test_usecase_realises.UseCaseRealisesNamedRequirements.test_the_dashboards_reader_reports_the_same_name_on_its_line) ... ok
2026-10-10T21:22:23.8581504Z test_the_problem_names_the_file (test_usecase_realises.UseCaseRealisesNamedRequirements.test_the_problem_names_the_file) ... ok
2026-10-10T21:22:23.8585195Z test_without_known_names_only_the_form_is_checked (test_usecase_realises.UseCaseRealisesNamedRequirements.test_without_known_names_only_the_form_is_checked) ... ok
2026-10-10T21:22:23.9361520Z test_blank_lines_at_the_end_of_a_proposal_are_written (test_verbatim.Verbatim.test_blank_lines_at_the_end_of_a_proposal_are_written) ... expected failure
2026-10-10T21:22:24.5485438Z test_both_writers_write_the_approved_text_byte_for_byte (test_verbatim.Verbatim.test_both_writers_write_the_approved_text_byte_for_byte) ... ok
2026-10-10T21:22:24.6226773Z test_cr_bytes_of_a_proposal_are_never_written_reformulated (test_verbatim.Verbatim.test_cr_bytes_of_a_proposal_are_never_written_reformulated) ... ok
2026-10-10T21:22:24.7156594Z test_an_item_in_progress_is_not_counted_against_itself (test_wip_limit.TestTheLimitOfTwo.test_an_item_in_progress_is_not_counted_against_itself) ... ok
2026-10-10T21:22:24.8975861Z test_counter_proof_with_one_item_in_progress_the_start_succeeds (test_wip_limit.TestTheLimitOfTwo.test_counter_proof_with_one_item_in_progress_the_start_succeeds) ... ok
2026-10-10T21:22:24.9895471Z test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit.TestTheLimitOfTwo.test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named) ... ok
2026-10-10T21:22:25.0819824Z test_with_one_of_the_two_done_the_start_succeeds (test_wip_limit.TestTheLimitOfTwo.test_with_one_of_the_two_done_the_start_succeeds) ... ok
2026-10-10T21:22:25.1740925Z test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit.TestWhatCountsAsInProgress.test_a_blocked_item_holds_its_slot_until_it_is_merged) ... ok
2026-10-10T21:22:25.2661090Z test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit.TestWhatCountsAsInProgress.test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch) ... ok
2026-10-10T21:22:25.3615525Z test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit.TestWhatCountsAsInProgress.test_a_running_job_counts_and_is_not_named_as_in_review) ... ok
2026-10-10T21:22:25.4532673Z test_an_item_waiting_for_review_counts_whatever_its_job_does (test_wip_limit.TestWhatCountsAsInProgress.test_an_item_waiting_for_review_counts_whatever_its_job_does) ... ok
2026-10-10T21:22:25.7276126Z test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot (test_wip_limit.TestWhatCountsAsInProgress.test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot) ... ok
2026-10-10T21:22:26.0043332Z test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot (test_wip_limit.TestWhatCountsAsInProgress.test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot) ... ok
2026-10-10T21:22:26.0976799Z test_a_model_without_a_wip_limit_refuses_no_start_for_it (test_wip_limit.TestWithoutALimit.test_a_model_without_a_wip_limit_refuses_no_start_for_it) ... ok
2026-10-10T21:22:26.0978639Z 
2026-10-10T21:22:26.0979246Z ----------------------------------------------------------------------
2026-10-10T21:22:26.0980188Z Ran 396 tests in 60.308s
2026-10-10T21:22:26.0980535Z 
2026-10-10T21:22:26.0980884Z OK (skipped=5, expected failures=6)
```

