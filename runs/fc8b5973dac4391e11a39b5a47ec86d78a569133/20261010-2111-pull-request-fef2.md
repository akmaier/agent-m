---
commit: fc8b5973dac4391e11a39b5a47ec86d78a569133
levels:
  - unit
  - component
  - system
  - release
occasion: pull-request
participant: GitHub Actions Ubuntu runner
date: 2026-10-10T21:11:04Z
run: https://github.com/akmaier/agent-m/actions/runs/38086639346
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

**Node Dashboard core** — SHA-256 `79d59ef6829bae63be440fd4510d71581d874b6f800b171474a15e666d6ed690`.

````text
﻿2026-10-10T21:11:10.9888939Z ##[group]Run node --test tests/*.test.mjs
2026-10-10T21:11:10.9889430Z [36;1mnode --test tests/*.test.mjs[0m
2026-10-10T21:11:11.0156307Z shell: /usr/bin/bash -e {0}
2026-10-10T21:11:11.0156773Z ##[endgroup]
2026-10-10T21:11:11.1004298Z TAP version 13
2026-10-10T21:11:11.1500327Z # Subtest: statuses — the status of a use case, a decision and a module that are open, accepted and changed, each with its kind
2026-10-10T21:11:11.1503233Z ok 1 - statuses — the status of a use case, a decision and a module that are open, accepted and changed, each with its kind
2026-10-10T21:11:11.1505154Z   ---
2026-10-10T21:11:11.1506163Z   duration_ms: 2.223833
2026-10-10T21:11:11.1507011Z   type: 'test'
2026-10-10T21:11:11.1507760Z   ...
2026-10-10T21:11:11.1509556Z # Subtest: approvalSchema — a record is read by its schema, as MOD-documents' readDocument gives it
2026-10-10T21:11:11.1511720Z ok 2 - approvalSchema — a record is read by its schema, as MOD-documents' readDocument gives it
2026-10-10T21:11:11.1513053Z   ---
2026-10-10T21:11:11.1514011Z   duration_ms: 0.728891
2026-10-10T21:11:11.1515277Z   type: 'test'
2026-10-10T21:11:11.1516142Z   ...
2026-10-10T21:11:11.1849238Z # Subtest: ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names
2026-10-10T21:11:11.1886865Z ok 3 - ONE REVIEW LAYOUT FOR EVERY PRODUCT — ARC and MOD files are reviewed files with identifiers from their names
2026-10-10T21:11:11.1888500Z   ---
2026-10-10T21:11:11.1888996Z   duration_ms: 6.149637
2026-10-10T21:11:11.1889411Z   type: 'test'
2026-10-10T21:11:11.1889712Z   ...
2026-10-10T21:11:11.1890980Z # Subtest: parseArchitecture — a decision: id, title, forced_by, and its four sections
2026-10-10T21:11:11.1892414Z ok 4 - parseArchitecture — a decision: id, title, forced_by, and its four sections
2026-10-10T21:11:11.1893220Z   ---
2026-10-10T21:11:11.1893845Z   duration_ms: 1.869221
2026-10-10T21:11:11.1894537Z   type: 'test'
2026-10-10T21:11:11.1895444Z   ...
2026-10-10T21:11:11.1896814Z # Subtest: parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described
2026-10-10T21:11:11.1899316Z ok 5 - parseArchitecture — a module: realises, follows, uses MOD-x.interface, provides, each interface described
2026-10-10T21:11:11.1905896Z   ---
2026-10-10T21:11:11.1906625Z   duration_ms: 1.923182
2026-10-10T21:11:11.1907365Z   type: 'test'
2026-10-10T21:11:11.1908021Z   ...
2026-10-10T21:11:11.1909339Z # Subtest: specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement
2026-10-10T21:11:11.1911267Z ok 6 - specRequirements — the names in SPEC.md; a withdrawn one is marked; prose in bold is no requirement
2026-10-10T21:11:11.1912135Z   ---
2026-10-10T21:11:11.1912794Z   duration_ms: 10.666241
2026-10-10T21:11:11.1913478Z   type: 'test'
2026-10-10T21:11:11.1914134Z   ...
2026-10-10T21:11:11.1916095Z # Subtest: module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code
2026-10-10T21:11:11.1917432Z ok 7 - module headers — `Module: MOD-x` in the first lines of a code file; tests told apart; Markdown and vendored code are not code
2026-10-10T21:11:11.1918059Z   ---
2026-10-10T21:11:11.1918326Z   duration_ms: 1.575923
2026-10-10T21:11:11.1918626Z   type: 'test'
2026-10-10T21:11:11.1919039Z   ...
2026-10-10T21:11:11.2077437Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after
2026-10-10T21:11:11.2080603Z ok 8 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a decision: the modules that follow it, their code and tests, names before and after
2026-10-10T21:11:11.2082060Z   ---
2026-10-10T21:11:11.2082604Z   duration_ms: 32.424789
2026-10-10T21:11:11.2083196Z   type: 'test'
2026-10-10T21:11:11.2083689Z   ...
2026-10-10T21:11:11.2085890Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first
2026-10-10T21:11:11.2088806Z ok 9 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a module: users of an altered or removed interface, breaks first
2026-10-10T21:11:11.2090006Z   ---
2026-10-10T21:11:11.2090476Z   duration_ms: 1.679727
2026-10-10T21:11:11.2090984Z   type: 'test'
2026-10-10T21:11:11.2091432Z   ...
2026-10-10T21:11:11.2093181Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so
2026-10-10T21:11:11.2096358Z ok 10 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — counter-proof: a change to the text alone touches no user; no code is said so
2026-10-10T21:11:11.2097740Z   ---
2026-10-10T21:11:11.2098269Z   duration_ms: 1.063346
2026-10-10T21:11:11.2098818Z   type: 'test'
2026-10-10T21:11:11.2099330Z   ...
2026-10-10T21:11:11.2368443Z # Subtest: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained
2026-10-10T21:11:11.2371475Z ok 11 - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — the blocked panel: Accept disabled, every open item named, explained
2026-10-10T21:11:11.2373037Z   ---
2026-10-10T21:11:11.2373894Z   duration_ms: 1.531971
2026-10-10T21:11:11.2374787Z   type: 'test'
2026-10-10T21:11:11.2376042Z   ...
2026-10-10T21:11:11.4471747Z # Subtest: the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases
2026-10-10T21:11:11.4496817Z ok 12 - the dashboard has an Architecture tab that lists, reviews, accepts and edits ARC and MOD files like use cases
2026-10-10T21:11:11.4516417Z   ---
2026-10-10T21:11:11.4525852Z   duration_ms: 215.137575
2026-10-10T21:11:11.4526637Z   type: 'test'
2026-10-10T21:11:11.4527243Z   ...
2026-10-10T21:11:11.4757914Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count
2026-10-10T21:11:11.4816714Z ok 13 - STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count
2026-10-10T21:11:11.4906039Z   ---
2026-10-10T21:11:11.4923452Z   duration_ms: 9.990109
2026-10-10T21:11:11.5039992Z   type: 'test'
2026-10-10T21:11:11.5085784Z   ...
2026-10-10T21:11:11.5223612Z # Subtest: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted
2026-10-10T21:11:11.5249694Z ok 14 - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted
2026-10-10T21:11:11.5252532Z   ---
2026-10-10T21:11:11.5253434Z   duration_ms: 10.363686
2026-10-10T21:11:11.5254198Z   type: 'test'
2026-10-10T21:11:11.5255020Z   ...
2026-10-10T21:11:11.5256505Z # Subtest: saveFile — a file saved on the blob it was opened on, in one commit on the default branch
2026-10-10T21:11:11.5258328Z ok 15 - saveFile — a file saved on the blob it was opened on, in one commit on the default branch
2026-10-10T21:11:11.5259377Z   ---
2026-10-10T21:11:11.5264605Z   duration_ms: 7.877255
2026-10-10T21:11:11.5266499Z   type: 'test'
2026-10-10T21:11:11.5267170Z   ...
2026-10-10T21:11:11.5268684Z # Subtest: saveFile — a file that changed meanwhile is refused with its current text, and nothing is written
2026-10-10T21:11:11.5270662Z ok 16 - saveFile — a file that changed meanwhile is refused with its current text, and nothing is written
2026-10-10T21:11:11.5271780Z   ---
2026-10-10T21:11:11.5272404Z   duration_ms: 0.750863
2026-10-10T21:11:11.5273054Z   type: 'test'
2026-10-10T21:11:11.5274044Z   ...
2026-10-10T21:11:11.5275949Z # Subtest: reviewLayoutCommit — a product without any of the layout gets every part, in one commit on its default branch
2026-10-10T21:11:11.5278432Z ok 17 - reviewLayoutCommit — a product without any of the layout gets every part, in one commit on its default branch
2026-10-10T21:11:11.5279809Z   ---
2026-10-10T21:11:11.5280485Z   duration_ms: 4.370773
2026-10-10T21:11:11.5281192Z   type: 'test'
2026-10-10T21:11:11.5281839Z   ...
2026-10-10T21:11:11.5283955Z # Subtest: reviewLayoutCommit — a product with part of the layout gets only the missing parts
2026-10-10T21:11:11.5286278Z ok 18 - reviewLayoutCommit — a product with part of the layout gets only the missing parts
2026-10-10T21:11:11.5287414Z   ---
2026-10-10T21:11:11.5288086Z   duration_ms: 0.534769
2026-10-10T21:11:11.5288786Z   type: 'test'
2026-10-10T21:11:11.5289430Z   ...
2026-10-10T21:11:11.5290694Z # Subtest: reviewLayoutCommit — a product with the complete layout gets no commit
2026-10-10T21:11:11.5292547Z ok 19 - reviewLayoutCommit — a product with the complete layout gets no commit
2026-10-10T21:11:11.5293767Z   ---
2026-10-10T21:11:11.5294532Z   duration_ms: 0.503771
2026-10-10T21:11:11.5295658Z   type: 'test'
2026-10-10T21:11:11.5296392Z   ...
2026-10-10T21:11:11.5297908Z # Subtest: reviewLayoutCommit — a refused write is named as the host names it, and nothing is written
2026-10-10T21:11:11.5300000Z ok 20 - reviewLayoutCommit — a refused write is named as the host names it, and nothing is written
2026-10-10T21:11:11.5301205Z   ---
2026-10-10T21:11:11.5301887Z   duration_ms: 1.419301
2026-10-10T21:11:11.5302601Z   type: 'test'
2026-10-10T21:11:11.5303250Z   ...
2026-10-10T21:11:11.5304233Z # Subtest: reviewLayoutCommit — takes the host alone
2026-10-10T21:11:11.5305663Z ok 21 - reviewLayoutCommit — takes the host alone
2026-10-10T21:11:11.5306517Z   ---
2026-10-10T21:11:11.5307114Z   duration_ms: 0.55105
2026-10-10T21:11:11.5307740Z   type: 'test'
2026-10-10T21:11:11.5308312Z   ...
2026-10-10T21:11:11.5309911Z # Subtest: reviewLayoutCommit — returns the commit's sha and url as the host's commitFiles returns them, with the parts written
2026-10-10T21:11:11.5313764Z ok 22 - reviewLayoutCommit — returns the commit's sha and url as the host's commitFiles returns them, with the parts written
2026-10-10T21:11:11.5315298Z   ---
2026-10-10T21:11:11.5315928Z   duration_ms: 0.538876
2026-10-10T21:11:11.5316565Z   type: 'test'
2026-10-10T21:11:11.5317139Z   ...
2026-10-10T21:11:11.5318177Z # Subtest: reviewLayoutCommit — the commit's message names no one
2026-10-10T21:11:11.5319502Z ok 23 - reviewLayoutCommit — the commit's message names no one
2026-10-10T21:11:11.5320562Z   ---
2026-10-10T21:11:11.5321150Z   duration_ms: 0.485897
2026-10-10T21:11:11.5321788Z   type: 'test'
2026-10-10T21:11:11.5322368Z   ...
2026-10-10T21:11:11.5323395Z # Subtest: formatChecks knows the five kinds, and refuses another by naming them
2026-10-10T21:11:11.5324796Z ok 24 - formatChecks knows the five kinds, and refuses another by naming them
2026-10-10T21:11:11.5326352Z   ---
2026-10-10T21:11:11.5327003Z   duration_ms: 4.349444
2026-10-10T21:11:11.5327671Z   type: 'test'
2026-10-10T21:11:11.5331082Z   ...
2026-10-10T21:11:11.5332104Z # Subtest: a complete artifact of every kind yields no finding
2026-10-10T21:11:11.5333277Z ok 25 - a complete artifact of every kind yields no finding
2026-10-10T21:11:11.5334144Z   ---
2026-10-10T21:11:11.5334780Z   duration_ms: 10.859062
2026-10-10T21:11:11.5335737Z   type: 'test'
2026-10-10T21:11:11.5336394Z   ...
2026-10-10T21:11:11.5337888Z # Subtest: one call runs every check of its kind — the same findings as the single checks, nothing left out
2026-10-10T21:11:11.5339913Z ok 26 - one call runs every check of its kind — the same findings as the single checks, nothing left out
2026-10-10T21:11:11.5341054Z   ---
2026-10-10T21:11:11.5341668Z   duration_ms: 14.737498
2026-10-10T21:11:11.5342325Z   type: 'test'
2026-10-10T21:11:11.5342909Z   ...
2026-10-10T21:11:11.5344187Z # Subtest: a requirement: each broken field, check, source, statement and name is one finding at its line
2026-10-10T21:11:11.5346301Z ok 27 - a requirement: each broken field, check, source, statement and name is one finding at its line
2026-10-10T21:11:11.5347451Z   ---
2026-10-10T21:11:11.5348051Z   duration_ms: 4.087675
2026-10-10T21:11:11.5348694Z   type: 'test'
2026-10-10T21:11:11.5349292Z   ...
2026-10-10T21:11:11.5350546Z # Subtest: a use case: the identifier it was opened with is kept, beside every check of useCaseProblems
2026-10-10T21:11:11.5352572Z ok 28 - a use case: the identifier it was opened with is kept, beside every check of useCaseProblems
2026-10-10T21:11:11.5353643Z   ---
2026-10-10T21:11:11.5354235Z   duration_ms: 0.97989
2026-10-10T21:11:11.5355069Z   type: 'test'
2026-10-10T21:11:11.5355706Z   ...
2026-10-10T21:11:11.5357074Z # Subtest: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line
2026-10-10T21:11:11.5359011Z ok 29 - a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line
2026-10-10T21:11:11.5360603Z   ---
2026-10-10T21:11:11.5361261Z   duration_ms: 4.05827
2026-10-10T21:11:11.5362024Z   type: 'test'
2026-10-10T21:11:11.5362687Z   ...
2026-10-10T21:11:11.5364008Z # Subtest: a test: its level, its module, what it guards and its case identifiers are each one finding
2026-10-10T21:11:11.5366080Z ok 30 - a test: its level, its module, what it guards and its case identifiers are each one finding
2026-10-10T21:11:11.5367254Z   ---
2026-10-10T21:11:11.5367916Z   duration_ms: 1.597984
2026-10-10T21:11:11.5368610Z   type: 'test'
2026-10-10T21:11:11.5369240Z   ...
2026-10-10T21:11:11.5370460Z # Subtest: a group file: each finding names the group file, at the line of the group file
2026-10-10T21:11:11.5372067Z ok 31 - a group file: each finding names the group file, at the line of the group file
2026-10-10T21:11:11.5373148Z   ---
2026-10-10T21:11:11.5373826Z   duration_ms: 0.379499
2026-10-10T21:11:11.5374926Z   type: 'test'
2026-10-10T21:11:11.5376294Z   ...
2026-10-10T21:11:11.5378989Z # Subtest: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form
2026-10-10T21:11:11.5381885Z ok 32 - A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form
2026-10-10T21:11:11.5383281Z   ---
2026-10-10T21:11:11.5383954Z   duration_ms: 1.974818
2026-10-10T21:11:11.5384660Z   type: 'test'
2026-10-10T21:11:11.5385570Z   ...
2026-10-10T21:11:11.5386862Z # Subtest: one shape in every check of MOD-artifacts — fix, never correction
2026-10-10T21:11:11.5388498Z ok 33 - one shape in every check of MOD-artifacts — fix, never correction
2026-10-10T21:11:11.5389389Z   ---
2026-10-10T21:11:11.5389846Z   duration_ms: 1.67026
2026-10-10T21:11:11.5390289Z   type: 'test'
2026-10-10T21:11:11.5390748Z   ...
2026-10-10T21:11:11.5391451Z # Subtest: every use case and group file of this repository passes formatChecks
2026-10-10T21:11:11.5392342Z ok 34 - every use case and group file of this repository passes formatChecks
2026-10-10T21:11:11.5393209Z   ---
2026-10-10T21:11:11.5393629Z   duration_ms: 11.311236
2026-10-10T21:11:11.5394069Z   type: 'test'
2026-10-10T21:11:11.5394472Z   ...
2026-10-10T21:11:11.5912520Z # Subtest: every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none
2026-10-10T21:11:11.5923511Z ok 35 - every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none
2026-10-10T21:11:11.5925653Z   ---
2026-10-10T21:11:11.5926544Z   duration_ms: 10.270934
2026-10-10T21:11:11.5927439Z   type: 'test'
2026-10-10T21:11:11.5928261Z   ...
2026-10-10T21:11:11.5930226Z # Subtest: A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction
2026-10-10T21:11:11.5932932Z ok 36 - A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction
2026-10-10T21:11:11.5934474Z   ---
2026-10-10T21:11:11.5935747Z   duration_ms: 4.17061
2026-10-10T21:11:11.5936629Z   type: 'test'
2026-10-10T21:11:11.5969062Z   ...
2026-10-10T21:11:11.5972079Z # Subtest: the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked
2026-10-10T21:11:11.5974627Z ok 37 - the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked
2026-10-10T21:11:11.5976444Z   ---
2026-10-10T21:11:11.5977703Z   duration_ms: 1.883738
2026-10-10T21:11:11.5978580Z   type: 'test'
2026-10-10T21:11:11.5979402Z   ...
2026-10-10T21:11:11.5981306Z # Subtest: parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram
2026-10-10T21:11:11.5984041Z ok 38 - parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram
2026-10-10T21:11:11.5985804Z   ---
2026-10-10T21:11:11.5986641Z   duration_ms: 1.514188
2026-10-10T21:11:11.5987575Z   type: 'test'
2026-10-10T21:11:11.5988369Z   ...
2026-10-10T21:11:11.5989672Z # Subtest: every use case of this repository passes the dashboard's reader
2026-10-10T21:11:11.5991464Z ok 39 - every use case of this repository passes the dashboard's reader
2026-10-10T21:11:11.5992626Z   ---
2026-10-10T21:11:11.5993422Z   duration_ms: 9.965803
2026-10-10T21:11:11.5994256Z   type: 'test'
2026-10-10T21:11:11.5995289Z   ...
2026-10-10T21:11:11.5997298Z # Subtest: the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository
2026-10-10T21:11:11.6000169Z ok 40 - the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository
2026-10-10T21:11:11.6001772Z   ---
2026-10-10T21:11:11.6002636Z   duration_ms: 152.674886
2026-10-10T21:11:11.6003561Z   type: 'test'
2026-10-10T21:11:11.6004429Z   ...
2026-10-10T21:11:11.6117484Z # Subtest: TST-282001: allocatePort chooses the lowest free inclusive port and names exhaustion
2026-10-10T21:11:11.6130747Z ok 41 - TST-282001: allocatePort chooses the lowest free inclusive port and names exhaustion
2026-10-10T21:11:11.6132029Z   ---
2026-10-10T21:11:11.6132757Z   duration_ms: 3.098547
2026-10-10T21:11:11.6133463Z   type: 'test'
2026-10-10T21:11:11.6134117Z   ...
2026-10-10T21:11:11.6135665Z # Subtest: TST-282002: tunnelCommands keeps commands, plans, loopback ends and service aligned
2026-10-10T21:11:11.6137498Z ok 42 - TST-282002: tunnelCommands keeps commands, plans, loopback ends and service aligned
2026-10-10T21:11:11.6138703Z   ---
2026-10-10T21:11:11.6139376Z   duration_ms: 2.127394
2026-10-10T21:11:11.6140120Z   type: 'test'
2026-10-10T21:11:11.6140781Z   ...
2026-10-10T21:11:11.6142216Z # Subtest: TST-282003: proxyConfiguration emits authenticated instance-only Apache and nginx plans
2026-10-10T21:11:11.6144051Z ok 43 - TST-282003: proxyConfiguration emits authenticated instance-only Apache and nginx plans
2026-10-10T21:11:11.6145498Z   ---
2026-10-10T21:11:11.6146544Z   duration_ms: 1.521191
2026-10-10T21:11:11.6147249Z   type: 'test'
2026-10-10T21:11:11.6147896Z   ...
2026-10-10T21:11:11.6226615Z # Subtest: TST-263001: endpoint-test goes only to the paired Bridge with configuration in its JSON body
2026-10-10T21:11:11.6241470Z ok 44 - TST-263001: endpoint-test goes only to the paired Bridge with configuration in its JSON body
2026-10-10T21:11:11.6242822Z   ---
2026-10-10T21:11:11.6243748Z   duration_ms: 39.252551
2026-10-10T21:11:11.6244532Z   type: 'test'
2026-10-10T21:11:11.6245387Z   ...
2026-10-10T21:11:11.6247363Z # Subtest: TST-263002: an HTTPS Bridge sends jump-host login in a header and preserves a provider diagnosis
2026-10-10T21:11:11.6249763Z ok 45 - TST-263002: an HTTPS Bridge sends jump-host login in a header and preserves a provider diagnosis
2026-10-10T21:11:11.6251141Z   ---
2026-10-10T21:11:11.6251748Z   duration_ms: 1.420423
2026-10-10T21:11:11.6252649Z   type: 'test'
2026-10-10T21:11:11.6253477Z   ...
2026-10-10T21:11:11.6254857Z # Subtest: TST-263003: pair sends the copied token only as a header and returns reusable settings
2026-10-10T21:11:11.6257303Z ok 46 - TST-263003: pair sends the copied token only as a header and returns reusable settings
2026-10-10T21:11:11.6258495Z   ---
2026-10-10T21:11:11.6259284Z   duration_ms: 3.35737
2026-10-10T21:11:11.6260164Z   type: 'test'
2026-10-10T21:11:11.6260768Z   ...
2026-10-10T21:11:11.6286181Z # Subtest: TST-263004: a missing Bridge token is named before any request
2026-10-10T21:11:11.6311142Z ok 47 - TST-263004: a missing Bridge token is named before any request
2026-10-10T21:11:11.6318263Z   ---
2026-10-10T21:11:11.6321423Z   duration_ms: 1.259052
2026-10-10T21:11:11.6326721Z   type: 'test'
2026-10-10T21:11:11.6353142Z   ...
2026-10-10T21:11:11.6357294Z # Subtest: TST-263005: a refused pairing token is named TokenRefused
2026-10-10T21:11:11.6363873Z ok 48 - TST-263005: a refused pairing token is named TokenRefused
2026-10-10T21:11:11.6395546Z   ---
2026-10-10T21:11:11.6408443Z   duration_ms: 1.688974
2026-10-10T21:11:11.6432057Z   type: 'test'
2026-10-10T21:11:11.6436039Z   ...
2026-10-10T21:11:11.6438142Z # Subtest: TST-263006: an HTTPS login refusal is named separately from a Bridge token refusal
2026-10-10T21:11:11.6440708Z ok 49 - TST-263006: an HTTPS login refusal is named separately from a Bridge token refusal
2026-10-10T21:11:11.6442170Z   ---
2026-10-10T21:11:11.6442898Z   duration_ms: 1.358868
2026-10-10T21:11:11.6443991Z   type: 'test'
2026-10-10T21:11:11.6444716Z   ...
2026-10-10T21:11:11.6446736Z # Subtest: TST-263007: Bridge failures and unreadable answers have their separate named failures
2026-10-10T21:11:11.6448633Z ok 50 - TST-263007: Bridge failures and unreadable answers have their separate named failures
2026-10-10T21:11:11.6449770Z   ---
2026-10-10T21:11:11.6450775Z   duration_ms: 1.471107
2026-10-10T21:11:11.6451488Z   type: 'test'
2026-10-10T21:11:11.6452153Z   ...
2026-10-10T21:11:11.6453280Z # Subtest: TST-263008: pair and endpoint-test name a finite request timeout
2026-10-10T21:11:11.6455355Z ok 51 - TST-263008: pair and endpoint-test name a finite request timeout
2026-10-10T21:11:11.6456452Z   ---
2026-10-10T21:11:11.6457078Z   duration_ms: 2.716223
2026-10-10T21:11:11.6458101Z   type: 'test'
2026-10-10T21:11:11.6458792Z   ...
2026-10-10T21:11:11.6948923Z # Subtest: TST-261001: bridgeApi defines the typed endpoint-test probe
2026-10-10T21:11:11.6959098Z ok 52 - TST-261001: bridgeApi defines the typed endpoint-test probe
2026-10-10T21:11:11.7005665Z   ---
2026-10-10T21:11:11.7017387Z   duration_ms: 2.702477
2026-10-10T21:11:11.7018162Z   type: 'test'
2026-10-10T21:11:11.7018772Z   ...
2026-10-10T21:11:11.7019783Z # Subtest: TST-261010: bridgeApi has a browser-loadable public entry
2026-10-10T21:11:11.7021249Z ok 53 - TST-261010: bridgeApi has a browser-loadable public entry
2026-10-10T21:11:11.7022277Z   ---
2026-10-10T21:11:11.7022902Z   duration_ms: 13.492743
2026-10-10T21:11:11.7023488Z   type: 'test'
2026-10-10T21:11:11.7023965Z   ...
2026-10-10T21:11:11.7024799Z # Subtest: TST-261002: serveBridge refuses a non-loopback bind
2026-10-10T21:11:11.7026729Z ok 54 - TST-261002: serveBridge refuses a non-loopback bind
2026-10-10T21:11:11.7027430Z   ---
2026-10-10T21:11:11.7027881Z   duration_ms: 2.498407
2026-10-10T21:11:11.7028488Z   type: 'test'
2026-10-10T21:11:11.7028945Z   ...
2026-10-10T21:11:11.7029904Z # Subtest: TST-261003: serveBridge accepts every documented loopback bind
2026-10-10T21:11:11.7031291Z ok 55 - TST-261003: serveBridge accepts every documented loopback bind
2026-10-10T21:11:11.7032173Z   ---
2026-10-10T21:11:11.7032697Z   duration_ms: 26.827686
2026-10-10T21:11:11.7033551Z   type: 'test'
2026-10-10T21:11:11.7034037Z   ...
2026-10-10T21:11:11.7035354Z # Subtest: TST-261011: serveBridge names a loopback port already in use
2026-10-10T21:11:11.7036577Z ok 56 - TST-261011: serveBridge names a loopback port already in use
2026-10-10T21:11:11.7037275Z   ---
2026-10-10T21:11:11.7037692Z   duration_ms: 5.082754
2026-10-10T21:11:11.7038150Z   type: 'test'
2026-10-10T21:11:11.7038595Z   ...
2026-10-10T21:11:11.7039349Z # {"method":"GET","path":"/v1/pair","status":401,"duration":4}
2026-10-10T21:11:11.7065867Z # {"method":"GET","path":"/v1/pair","status":200,"duration":0}
2026-10-10T21:11:11.7095856Z # Subtest: TST-261004: pairAnew persists and rotates the token
2026-10-10T21:11:11.7111272Z ok 57 - TST-261004: pairAnew persists and rotates the token
2026-10-10T21:11:11.7125538Z   ---
2026-10-10T21:11:11.7155685Z   duration_ms: 59.820729
2026-10-10T21:11:11.7185610Z   type: 'test'
2026-10-10T21:11:11.7196752Z   ...
2026-10-10T21:11:11.7226479Z # {"method":"GET","path":"/v1/pair","status":200,"duration":1}
2026-10-10T21:11:11.7246254Z # Subtest: TST-261005: a restarted Bridge keeps its pairing token
2026-10-10T21:11:11.7309306Z ok 58 - TST-261005: a restarted Bridge keeps its pairing token
2026-10-10T21:11:11.7311171Z   ---
2026-10-10T21:11:11.7311910Z   duration_ms: 12.656178
2026-10-10T21:11:11.7312651Z   type: 'test'
2026-10-10T21:11:11.7313294Z   ...
2026-10-10T21:11:11.7330367Z # {"method":"OPTIONS","path":"/v1/probes/endpoint-test","status":204,"duration":0}
2026-10-10T21:11:11.7332177Z # {"method":"OPTIONS","path":"/v1/probes/endpoint-test","status":204,"duration":0}
2026-10-10T21:11:11.7402054Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":1}
2026-10-10T21:11:11.7457079Z # Subtest: TST-261006: serveBridge allows the paired origin and dispatches endpoint-test
2026-10-10T21:11:11.7461191Z ok 59 - TST-261006: serveBridge allows the paired origin and dispatches endpoint-test
2026-10-10T21:11:11.7530410Z   ---
2026-10-10T21:11:11.7617131Z   duration_ms: 25.115358
2026-10-10T21:11:11.7694810Z   type: 'test'
2026-10-10T21:11:11.7725559Z   ...
2026-10-10T21:11:11.7756198Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":403,"duration":0}
2026-10-10T21:11:11.7757895Z # {"method":"OPTIONS","path":"/v1/probes/endpoint-test","status":403,"duration":0}
2026-10-10T21:11:11.7786306Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":401,"duration":1}
2026-10-10T21:11:11.7801145Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":422,"duration":1}
2026-10-10T21:11:11.7802663Z # Subtest: TST-261007: serveBridge names origin, token and body refusals
2026-10-10T21:11:11.7832425Z ok 60 - TST-261007: serveBridge names origin, token and body refusals
2026-10-10T21:11:11.7855682Z   ---
2026-10-10T21:11:11.7885662Z   duration_ms: 22.768325
2026-10-10T21:11:11.7915374Z   type: 'test'
2026-10-10T21:11:11.7916137Z   ...
2026-10-10T21:11:11.7921949Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":503,"duration":5}
2026-10-10T21:11:11.8068269Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":422,"duration":2}
2026-10-10T21:11:11.8218601Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":502,"duration":1}
2026-10-10T21:11:11.8607086Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":502,"duration":10}
2026-10-10T21:11:11.8749043Z # Subtest: TST-261008: serveBridge names pause and handler failures
2026-10-10T21:11:11.8807308Z ok 61 - TST-261008: serveBridge names pause and handler failures
2026-10-10T21:11:11.8893808Z   ---
2026-10-10T21:11:11.8960214Z   duration_ms: 91.407134
2026-10-10T21:11:11.8975594Z   type: 'test'
2026-10-10T21:11:11.9005521Z   ...
2026-10-10T21:11:11.9036286Z # Subtest: TST-261009: request logs exclude endpoint-test secrets
2026-10-10T21:11:11.9086210Z ok 62 - TST-261009: request logs exclude endpoint-test secrets
2026-10-10T21:11:11.9145753Z   ---
2026-10-10T21:11:11.9175641Z   duration_ms: 30.690651
2026-10-10T21:11:11.9272735Z   type: 'test'
2026-10-10T21:11:11.9295764Z   ...
2026-10-10T21:11:11.9616927Z # Subtest: TST-262-001: endpoint-test maps body.args once and returns a success unchanged
2026-10-10T21:11:11.9676679Z ok 63 - TST-262-001: endpoint-test maps body.args once and returns a success unchanged
2026-10-10T21:11:11.9705781Z   ---
2026-10-10T21:11:11.9796097Z   duration_ms: 2.051472
2026-10-10T21:11:11.9825696Z   type: 'test'
2026-10-10T21:11:11.9875780Z   ...
2026-10-10T21:11:11.9916376Z # Subtest: TST-262-002: endpoint-test returns a refused-key diagnosis unchanged
2026-10-10T21:11:11.9946062Z ok 64 - TST-262-002: endpoint-test returns a refused-key diagnosis unchanged
2026-10-10T21:11:11.9975565Z   ---
2026-10-10T21:11:12.0001598Z   duration_ms: 1.741322
2026-10-10T21:11:12.0037250Z   type: 'test'
2026-10-10T21:11:12.0056123Z   ...
2026-10-10T21:11:12.0102825Z # Subtest: TST-262-003: endpoint-test returns an unknown-model diagnosis unchanged
2026-10-10T21:11:12.0121168Z ok 65 - TST-262-003: endpoint-test returns an unknown-model diagnosis unchanged
2026-10-10T21:11:12.0136205Z   ---
2026-10-10T21:11:12.0146904Z   duration_ms: 0.229869
2026-10-10T21:11:12.0186620Z   type: 'test'
2026-10-10T21:11:12.0187520Z   ...
2026-10-10T21:11:12.0188887Z # Subtest: TST-262-004: endpoint-test returns an unavailable local-server diagnosis unchanged
2026-10-10T21:11:12.0190622Z ok 66 - TST-262-004: endpoint-test returns an unavailable local-server diagnosis unchanged
2026-10-10T21:11:12.0191827Z   ---
2026-10-10T21:11:12.0192577Z   duration_ms: 0.251771
2026-10-10T21:11:12.0216061Z   type: 'test'
2026-10-10T21:11:12.0232337Z   ...
2026-10-10T21:11:12.0233758Z # Subtest: TST-262-005: endpoint-test returns another provider diagnosis unchanged
2026-10-10T21:11:12.0235689Z ok 67 - TST-262-005: endpoint-test returns another provider diagnosis unchanged
2026-10-10T21:11:12.0236806Z   ---
2026-10-10T21:11:12.0237482Z   duration_ms: 0.378336
2026-10-10T21:11:12.0238237Z   type: 'test'
2026-10-10T21:11:12.0238869Z   ...
2026-10-10T21:11:12.0240049Z # Subtest: TST-262-006: endpoint-test rejects invalid body.args before any endpoint call
2026-10-10T21:11:12.0241738Z ok 68 - TST-262-006: endpoint-test rejects invalid body.args before any endpoint call
2026-10-10T21:11:12.0242840Z   ---
2026-10-10T21:11:12.0243498Z   duration_ms: 0.863323
2026-10-10T21:11:12.0244196Z   type: 'test'
2026-10-10T21:11:12.0244791Z   ...
2026-10-10T21:11:12.0246217Z # Subtest: TST-262-007: endpoint-test names an unexpected handler failure without retrying
2026-10-10T21:11:12.0247807Z ok 69 - TST-262-007: endpoint-test names an unexpected handler failure without retrying
2026-10-10T21:11:12.0248781Z   ---
2026-10-10T21:11:12.0249360Z   duration_ms: 0.308837
2026-10-10T21:11:12.0249972Z   type: 'test'
2026-10-10T21:11:12.0250525Z   ...
2026-10-10T21:11:12.0251426Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":3}
2026-10-10T21:11:12.0252848Z # Subtest: TST-285001: GET tunnels dispatches exact constructed states through the route data
2026-10-10T21:11:12.0254459Z ok 70 - TST-285001: GET tunnels dispatches exact constructed states through the route data
2026-10-10T21:11:12.0255683Z   ---
2026-10-10T21:11:12.0256276Z   duration_ms: 144.727422
2026-10-10T21:11:12.0256900Z   type: 'test'
2026-10-10T21:11:12.0257455Z   ...
2026-10-10T21:11:12.0258349Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":0}
2026-10-10T21:11:12.0259483Z # {"method":"GET","path":"/v1/tunnels","status":404,"duration":1}
2026-10-10T21:11:12.0261206Z # Subtest: TST-285002: an explicit empty state differs from an absent tunnels handler
2026-10-10T21:11:12.0262656Z ok 71 - TST-285002: an explicit empty state differs from an absent tunnels handler
2026-10-10T21:11:12.0263577Z   ---
2026-10-10T21:11:12.0264151Z   duration_ms: 32.442944
2026-10-10T21:11:12.0264774Z   type: 'test'
2026-10-10T21:11:12.0265631Z   ...
2026-10-10T21:11:12.0266611Z # {"method":"GET","path":"/v1/tunnels","status":422,"duration":2}
2026-10-10T21:11:12.0267778Z # {"method":"GET","path":"/v1/tunnels","status":502,"duration":2}
2026-10-10T21:11:12.0269066Z # Subtest: TST-285003: tunnels handler failures retain the server error mapping
2026-10-10T21:11:12.0270435Z ok 72 - TST-285003: tunnels handler failures retain the server error mapping
2026-10-10T21:11:12.0271318Z   ---
2026-10-10T21:11:12.0271890Z   duration_ms: 37.09292
2026-10-10T21:11:12.0272508Z   type: 'test'
2026-10-10T21:11:12.0273062Z   ...
2026-10-10T21:11:12.0273970Z # {"method":"OPTIONS","path":"/v1/tunnels","status":204,"duration":0}
2026-10-10T21:11:12.0275354Z # {"method":"GET","path":"/v1/tunnels","status":403,"duration":1}
2026-10-10T21:11:12.0276554Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":4}
2026-10-10T21:11:12.0277775Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":6}
2026-10-10T21:11:12.0279050Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":1}
2026-10-10T21:11:12.0280623Z # Subtest: TST-285004: tunnels keeps origin, preflight and current-token protections after rotation
2026-10-10T21:11:12.0282665Z ok 73 - TST-285004: tunnels keeps origin, preflight and current-token protections after rotation
2026-10-10T21:11:12.0283782Z   ---
2026-10-10T21:11:12.0284418Z   duration_ms: 54.321167
2026-10-10T21:11:12.0285364Z   type: 'test'
2026-10-10T21:11:12.0285968Z   ...
2026-10-10T21:11:12.0286927Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":2}
2026-10-10T21:11:12.0296005Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":503,"duration":2}
2026-10-10T21:11:12.0396359Z # Subtest: TST-285005: paused Bridges expose tunnel state but retain paused POST refusal
2026-10-10T21:11:12.0486277Z ok 74 - TST-285005: paused Bridges expose tunnel state but retain paused POST refusal
2026-10-10T21:11:12.0525551Z   ---
2026-10-10T21:11:12.0585775Z   duration_ms: 26.976675
2026-10-10T21:11:12.0617261Z   type: 'test'
2026-10-10T21:11:12.0617790Z   ...
2026-10-10T21:11:12.0618751Z # Subtest: TST-285006: tunnel-state request logging excludes token and headers
2026-10-10T21:11:12.0620176Z ok 75 - TST-285006: tunnel-state request logging excludes token and headers
2026-10-10T21:11:12.0620999Z   ---
2026-10-10T21:11:12.0621486Z   duration_ms: 19.672463
2026-10-10T21:11:12.0622032Z   type: 'test'
2026-10-10T21:11:12.0622518Z   ...
2026-10-10T21:11:12.1031774Z # Subtest: TST-290103 clearEverything removes every entry of one instance without clearing other browser state
2026-10-10T21:11:12.1056463Z ok 76 - TST-290103 clearEverything removes every entry of one instance without clearing other browser state
2026-10-10T21:11:12.1083146Z   ---
2026-10-10T21:11:12.1085925Z   duration_ms: 2.246155
2026-10-10T21:11:12.1086651Z   type: 'test'
2026-10-10T21:11:12.1155498Z   ...
2026-10-10T21:11:12.1195922Z # Subtest: TST-290104 secretValues returns only implemented credential strings
2026-10-10T21:11:12.1197428Z ok 77 - TST-290104 secretValues returns only implemented credential strings
2026-10-10T21:11:12.1225476Z   ---
2026-10-10T21:11:12.1255630Z   duration_ms: 5.019245
2026-10-10T21:11:12.1256297Z   type: 'test'
2026-10-10T21:11:12.1285483Z   ...
2026-10-10T21:11:12.1316091Z # Subtest: an endpoint survives reopening the same instance store
2026-10-10T21:11:12.1325956Z ok 78 - an endpoint survives reopening the same instance store
2026-10-10T21:11:12.1345970Z   ---
2026-10-10T21:11:12.1366014Z   duration_ms: 3.830244
2026-10-10T21:11:12.1366737Z   type: 'test'
2026-10-10T21:11:12.1367388Z   ...
2026-10-10T21:11:12.1368308Z # Subtest: an endpoint without a key is stored unchanged
2026-10-10T21:11:12.1369818Z ok 79 - an endpoint without a key is stored unchanged
2026-10-10T21:11:12.1370612Z   ---
2026-10-10T21:11:12.1371240Z   duration_ms: 0.339514
2026-10-10T21:11:12.1371896Z   type: 'test'
2026-10-10T21:11:12.1372475Z   ...
2026-10-10T21:11:12.1373647Z # Subtest: a refused endpoint key changes only when the author explicitly writes a replacement
2026-10-10T21:11:12.1375511Z ok 80 - a refused endpoint key changes only when the author explicitly writes a replacement
2026-10-10T21:11:12.1376700Z   ---
2026-10-10T21:11:12.1377498Z   duration_ms: 0.343512
2026-10-10T21:11:12.1378335Z   type: 'test'
2026-10-10T21:11:12.1379046Z   ...
2026-10-10T21:11:12.1380126Z # Subtest: clearing an endpoint removes its actual localStorage entry
2026-10-10T21:11:12.1381462Z ok 81 - clearing an endpoint removes its actual localStorage entry
2026-10-10T21:11:12.1382418Z   ---
2026-10-10T21:11:12.1383093Z   duration_ms: 0.440182
2026-10-10T21:11:12.1383831Z   type: 'test'
2026-10-10T21:11:12.1384548Z   ...
2026-10-10T21:11:12.1385892Z # Subtest: instance prefixes isolate endpoint and pairing settings
2026-10-10T21:11:12.1387371Z ok 82 - instance prefixes isolate endpoint and pairing settings
2026-10-10T21:11:12.1388308Z   ---
2026-10-10T21:11:12.1389039Z   duration_ms: 0.652348
2026-10-10T21:11:12.1389837Z   type: 'test'
2026-10-10T21:11:12.1390549Z   ...
2026-10-10T21:11:12.1391903Z # Subtest: TST-279-01 persists the accepted jump-host value and lists only non-secret metadata
2026-10-10T21:11:12.1394048Z ok 83 - TST-279-01 persists the accepted jump-host value and lists only non-secret metadata
2026-10-10T21:11:12.1395492Z   ---
2026-10-10T21:11:12.1396446Z   duration_ms: 5.071202
2026-10-10T21:11:12.1397250Z   type: 'test'
2026-10-10T21:11:12.1397998Z   ...
2026-10-10T21:11:12.1399121Z # Subtest: TST-279-02 isolates jump-host settings between instances
2026-10-10T21:11:12.1400617Z ok 84 - TST-279-02 isolates jump-host settings between instances
2026-10-10T21:11:12.1401658Z   ---
2026-10-10T21:11:12.1402489Z   duration_ms: 0.442326
2026-10-10T21:11:12.1403326Z   type: 'test'
2026-10-10T21:11:12.1404071Z   ...
2026-10-10T21:11:12.1405847Z # Subtest: TST-279-03 clears the actual jump-host entry including its login and still refuses unknown keys
2026-10-10T21:11:12.1407873Z ok 85 - TST-279-03 clears the actual jump-host entry including its login and still refuses unknown keys
2026-10-10T21:11:12.1409056Z   ---
2026-10-10T21:11:12.1409767Z   duration_ms: 0.994257
2026-10-10T21:11:12.1410557Z   type: 'test'
2026-10-10T21:11:12.1411253Z   ...
2026-10-10T21:11:12.5486872Z # Subtest: TST-283001 exports and reads the canonical plain version-1 envelope without localStorage
2026-10-10T21:11:12.5516524Z ok 86 - TST-283001 exports and reads the canonical plain version-1 envelope without localStorage
2026-10-10T21:11:12.5518013Z   ---
2026-10-10T21:11:12.5518560Z   duration_ms: 4.081323
2026-10-10T21:11:12.5519244Z   type: 'test'
2026-10-10T21:11:12.5519944Z   ...
2026-10-10T21:11:12.5521438Z # Subtest: TST-283002 locks every exported secret with the accepted WebCrypto envelope and leaves storage unchanged on a wrong passphrase
2026-10-10T21:11:12.5523877Z ok 87 - TST-283002 locks every exported secret with the accepted WebCrypto envelope and leaves storage unchanged on a wrong passphrase
2026-10-10T21:11:12.5526508Z   ---
2026-10-10T21:11:12.5527268Z   duration_ms: 471.562259
2026-10-10T21:11:12.5527827Z   type: 'test'
2026-10-10T21:11:12.5528312Z   ...
2026-10-10T21:11:12.5529780Z # Subtest: TST-283003 persists named remote sessions, lists no secret metadata, and clears their raw entry
2026-10-10T21:11:12.5532189Z ok 88 - TST-283003 persists named remote sessions, lists no secret metadata, and clears their raw entry
2026-10-10T21:11:12.5533252Z   ---
2026-10-10T21:11:12.5534016Z   duration_ms: 0.991341
2026-10-10T21:11:12.5534590Z   type: 'test'
2026-10-10T21:11:12.5535577Z   ...
2026-10-10T21:11:12.5537867Z # Subtest: TST-283004 imports only absent settings and validates every incoming key before any write
2026-10-10T21:11:12.5540576Z ok 89 - TST-283004 imports only absent settings and validates every incoming key before any write
2026-10-10T21:11:12.5541882Z   ---
2026-10-10T21:11:12.5542444Z   duration_ms: 1.088463
2026-10-10T21:11:12.5543018Z   type: 'test'
2026-10-10T21:11:12.5543792Z   ...
2026-10-10T21:11:12.5676355Z # Subtest: TST-272 listSettings lists implemented literal settings without exposing their stored values
2026-10-10T21:11:12.5680357Z ok 90 - TST-272 listSettings lists implemented literal settings without exposing their stored values
2026-10-10T21:11:12.5681534Z   ---
2026-10-10T21:11:12.5682133Z   duration_ms: 4.299611
2026-10-10T21:11:12.5682753Z   type: 'test'
2026-10-10T21:11:12.5683465Z   ...
2026-10-10T21:11:12.5684668Z # Subtest: TST-273 listSettings discovers dynamic settings and removes a cleared endpoint from discovery
2026-10-10T21:11:12.5686737Z ok 91 - TST-273 listSettings discovers dynamic settings and removes a cleared endpoint from discovery
2026-10-10T21:11:12.5687861Z   ---
2026-10-10T21:11:12.5688637Z   duration_ms: 0.822807
2026-10-10T21:11:12.5689766Z   type: 'test'
2026-10-10T21:11:12.5691114Z   ...
2026-10-10T21:11:12.5692252Z # Subtest: TST-274 listSettings isolates an instance and only reads its known storage entries
2026-10-10T21:11:12.5693793Z ok 92 - TST-274 listSettings isolates an instance and only reads its known storage entries
2026-10-10T21:11:12.5694779Z   ---
2026-10-10T21:11:12.5695562Z   duration_ms: 0.604529
2026-10-10T21:11:12.5696152Z   type: 'test'
2026-10-10T21:11:12.5697068Z   ...
2026-10-10T21:11:12.5698439Z # Subtest: TST-275 listSettings lists a stored last-test setting without exposing values and preserves it after endpoint clear
2026-10-10T21:11:12.5700668Z ok 93 - TST-275 listSettings lists a stored last-test setting without exposing values and preserves it after endpoint clear
2026-10-10T21:11:12.5703111Z   ---
2026-10-10T21:11:12.5703706Z   duration_ms: 0.990109
2026-10-10T21:11:12.5704338Z   type: 'test'
2026-10-10T21:11:12.5705123Z   ...
2026-10-10T21:11:12.5707375Z # Subtest: writeSetting/readSetting keep this item's catalogue keys in localStorage, under the instance's prefix, and set no cookie
2026-10-10T21:11:12.5710351Z ok 94 - writeSetting/readSetting keep this item's catalogue keys in localStorage, under the instance's prefix, and set no cookie
2026-10-10T21:11:12.5711860Z   ---
2026-10-10T21:11:12.5713974Z   duration_ms: 3.818742
2026-10-10T21:11:12.5715050Z   type: 'test'
2026-10-10T21:11:12.5715809Z   ...
2026-10-10T21:11:12.5717039Z # Subtest: clearSetting removes each catalogue key from localStorage itself, not only from readSetting's answer
2026-10-10T21:11:12.5718761Z ok 95 - clearSetting removes each catalogue key from localStorage itself, not only from readSetting's answer
2026-10-10T21:11:12.5719785Z   ---
2026-10-10T21:11:12.5720342Z   duration_ms: 0.394597
2026-10-10T21:11:12.5720931Z   type: 'test'
2026-10-10T21:11:12.5721456Z   ...
2026-10-10T21:11:12.5722370Z # Subtest: writeSetting refuses a key outside the catalogue with UnknownSetting
2026-10-10T21:11:12.5723620Z ok 96 - writeSetting refuses a key outside the catalogue with UnknownSetting
2026-10-10T21:11:12.5725731Z   ---
2026-10-10T21:11:12.5726281Z   duration_ms: 0.775729
2026-10-10T21:11:12.5726871Z   type: 'test'
2026-10-10T21:11:12.5727397Z   ...
2026-10-10T21:11:12.5728429Z # Subtest: openStore throws StorageUnavailable where localStorage refuses to store anything
2026-10-10T21:11:12.5729912Z ok 97 - openStore throws StorageUnavailable where localStorage refuses to store anything
2026-10-10T21:11:12.5730848Z   ---
2026-10-10T21:11:12.5731321Z   duration_ms: 0.258153
2026-10-10T21:11:12.5731836Z   type: 'test'
2026-10-10T21:11:12.5732308Z   ...
2026-10-10T21:11:12.5733541Z # Subtest: writeSetting throws StorageUnavailable where localStorage refuses the write after the store was opened
2026-10-10T21:11:12.5736605Z ok 98 - writeSetting throws StorageUnavailable where localStorage refuses the write after the store was opened
2026-10-10T21:11:12.5738584Z   ---
2026-10-10T21:11:12.5739461Z   duration_ms: 0.279973
2026-10-10T21:11:12.5740062Z   type: 'test'
2026-10-10T21:11:12.5740600Z   ...
2026-10-10T21:11:12.6789400Z # Subtest: the running sprint's board: in progress with the open pull request and who opened it, done with the merged one and when, waiting for acceptance, ready
2026-10-10T21:11:12.6791536Z ok 99 - the running sprint's board: in progress with the open pull request and who opened it, done with the merged one and when, waiting for acceptance, ready
2026-10-10T21:11:12.6792390Z   ---
2026-10-10T21:11:12.6792722Z   duration_ms: 274.314656
2026-10-10T21:11:12.6793083Z   type: 'test'
2026-10-10T21:11:12.6793401Z   ...
2026-10-10T21:11:12.6794290Z # Subtest: counter-proofs: a pull request naming no item changes no state; one merged into another base than the sprint branch is not done for the sprint
2026-10-10T21:11:12.6795931Z ok 100 - counter-proofs: a pull request naming no item changes no state; one merged into another base than the sprint branch is not done for the sprint
2026-10-10T21:11:12.6796693Z   ---
2026-10-10T21:11:12.6797011Z   duration_ms: 237.335005
2026-10-10T21:11:12.6797368Z   type: 'test'
2026-10-10T21:11:12.6797691Z   ...
2026-10-10T21:11:12.7431353Z # Subtest: below the limit no ready item is held by it; a closed pull request that was not merged is no work in progress
2026-10-10T21:11:12.7433554Z ok 101 - below the limit no ready item is held by it; a closed pull request that was not merged is no work in progress
2026-10-10T21:11:12.7436205Z   ---
2026-10-10T21:11:12.7436754Z   duration_ms: 64.492314
2026-10-10T21:11:12.7437333Z   type: 'test'
2026-10-10T21:11:12.7437891Z   ...
2026-10-10T21:11:12.8163140Z # Subtest: with no running sprint, the last sprint's board is shown and the page says so
2026-10-10T21:11:12.8167257Z ok 102 - with no running sprint, the last sprint's board is shown and the page says so
2026-10-10T21:11:12.8168283Z   ---
2026-10-10T21:11:12.8168829Z   duration_ms: 72.124672
2026-10-10T21:11:12.8169409Z   type: 'test'
2026-10-10T21:11:12.8169974Z   ...
2026-10-10T21:11:12.9457918Z # Subtest: the backlog is folded: its unselected items are read only when the reader unfolds it — then in its order, each with its derived state
2026-10-10T21:11:12.9464390Z ok 103 - the backlog is folded: its unselected items are read only when the reader unfolds it — then in its order, each with its derived state
2026-10-10T21:11:12.9466138Z   ---
2026-10-10T21:11:12.9466731Z   duration_ms: 130.43252
2026-10-10T21:11:12.9467404Z   type: 'test'
2026-10-10T21:11:12.9467986Z   ...
2026-10-10T21:11:13.0706263Z # Subtest: the accepted requirements and use cases that no item realises yet — withdrawn and open names are not among them
2026-10-10T21:11:13.0708687Z ok 104 - the accepted requirements and use cases that no item realises yet — withdrawn and open names are not among them
2026-10-10T21:11:13.0710161Z   ---
2026-10-10T21:11:13.0711372Z   duration_ms: 124.120533
2026-10-10T21:11:13.0712162Z   type: 'test'
2026-10-10T21:11:13.0712803Z   ...
2026-10-10T21:11:13.1935812Z # Subtest: nothing is written: every request of the tab and of its fold is a GET
2026-10-10T21:11:13.1937623Z ok 105 - nothing is written: every request of the tab and of its fold is a GET
2026-10-10T21:11:13.1944006Z   ---
2026-10-10T21:11:13.1944687Z   duration_ms: 123.376514
2026-10-10T21:11:13.1945685Z   type: 'test'
2026-10-10T21:11:13.1946850Z   ...
2026-10-10T21:11:13.2621265Z # Subtest: every part carries a folded What is this? — the uncovered names, the sprint, the limit, the backlog, and each state; no job runs yet
2026-10-10T21:11:13.2624264Z ok 106 - every part carries a folded What is this? — the uncovered names, the sprint, the limit, the backlog, and each state; no job runs yet
2026-10-10T21:11:13.2625964Z   ---
2026-10-10T21:11:13.2637741Z   duration_ms: 68.287494
2026-10-10T21:11:13.2638469Z   type: 'test'
2026-10-10T21:11:13.2639009Z   ...
2026-10-10T21:11:13.5336659Z # Subtest: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same board; a planted state changes nothing
2026-10-10T21:11:13.5343861Z ok 107 - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting local storage and the cached texts and reloading shows the same board; a planted state changes nothing
2026-10-10T21:11:13.5345867Z   ---
2026-10-10T21:11:13.5346242Z   duration_ms: 270.207053
2026-10-10T21:11:13.5346648Z   type: 'test'
2026-10-10T21:11:13.5346988Z   ...
2026-10-10T21:11:13.7962902Z # Subtest: API economy: each dashboard load reads the sprint, the order, the selected items and one page of pull requests
2026-10-10T21:11:13.7965735Z ok 108 - API economy: each dashboard load reads the sprint, the order, the selected items and one page of pull requests
2026-10-10T21:11:13.7967005Z   ---
2026-10-10T21:11:13.7967590Z   duration_ms: 218.630001
2026-10-10T21:11:13.7968287Z   type: 'test'
2026-10-10T21:11:13.7968900Z   ...
2026-10-10T21:11:13.7970323Z # backlog tab, 25 selected of 140 items: cold 33 requests (30 files, commit, tree, 1 page of pull requests); next load 33 (the same reads)
2026-10-10T21:11:13.7972161Z # unfolding the backlog, cold: 116 requests (115 item files, 1 pages of pull requests)
2026-10-10T21:11:14.0871222Z # Subtest: Agent M's own sprint 02: its goal, branch, closer and planner, the limit of four, and every selected item once on the board
2026-10-10T21:11:14.0873543Z ok 109 - Agent M's own sprint 02: its goal, branch, closer and planner, the limit of four, and every selected item once on the board
2026-10-10T21:11:14.0875672Z   ---
2026-10-10T21:11:14.0876425Z   duration_ms: 334.663259
2026-10-10T21:11:14.0877052Z   type: 'test'
2026-10-10T21:11:14.0877617Z   ...
2026-10-10T21:11:14.0881154Z # Agent M's sprint 02 on the fixture — ready: ITM-018, ITM-134, ITM-143, ITM-144, ITM-142, ITM-145; in progress: ITM-147, ITM-136; done: ITM-141, ITM-125, ITM-126, ITM-027, ITM-127, ITM-131, ITM-129, ITM-033, ITM-128, ITM-132, ITM-130, ITM-034, ITM-146, ITM-050, ITM-133, ITM-014, ITM-016; blocked: none; waiting for acceptance: none
2026-10-10T21:11:14.0884030Z # Agent M's own sprint 02, cold load: 34 requests (31 files, 1 page of pull requests)
2026-10-10T21:11:14.0903016Z # Agent M's own sprint 02, warm load: 34 requests (commit, tree, file docs/process.md, file docs/process-models/scrum-wip.md, file docs/backlog/sprints/sprint-01.md, file docs/backlog/sprints/sprint-02.md, file docs/backlog/order.md, file SPEC.md, pull requests file docs/backlog/ITM-141-release-tests-of-the-sprint-01-increment.md, file docs/backlog/ITM-125-the-export-notice-names-pull-requests.md, file docs/backlog/ITM-126-identifier-kept-returns-a-finding.md, file docs/backlog/ITM-027-process-model-parse-and-validate.md, file docs/backlog/ITM-127-a-source-named-as-written-is-no-error.md, file docs/backlog/ITM-131-a-refused-save-shows-the-newer-version.md, file docs/backlog/ITM-129-no-request-for-a-view-file-not-built.md, file docs/backlog/ITM-033-backlog-items-and-order.md, file docs/backlog/ITM-128-no-test-reads-agent-ms-own-spec.md, file docs/backlog/ITM-132-add-product-missing-repository-and-step-a-done.md, file docs/backlog/ITM-130-the-reads-leave-the-kernel.md, file docs/backlog/ITM-034-sprints-wip-and-selection.md, file docs/backlog/ITM-146-pull-requests-of-a-product-on-both-hosts.md, file docs/backlog/ITM-050-product-rules-repository-checks.md, file docs/backlog/ITM-133-a-refused-write-offers-the-github-path.md, file docs/backlog/ITM-147-the-backlog-and-the-sprint-read-a-first-process-dashboard.md, file docs/backlog/ITM-014-characterise-the-approval-gates.md, file docs/backlog/ITM-136-a-settings-line-keeps-its-last-test.md, file docs/backlog/ITM-018-link-graph-gaps-and-impact.md, file docs/backlog/ITM-016-apply-approvals-in-the-engine.md, file docs/backlog/ITM-134-spec-change-entry-shows-its-impact-list.md, file docs/backlog/ITM-143-release-tests-of-sprint-02-strand-b.md, file docs/backlog/ITM-144-release-tests-of-sprint-02-strand-c.md, file docs/backlog/ITM-142-release-tests-of-sprint-02-strand-a.md, file docs/backlog/ITM-145-release-tests-of-sprint-02-strand-d.md)
2026-10-10T21:11:14.0918904Z # Agent M's own backlog unfolded: 135 requests (133 item files, 2 pages of pull requests: sprint/01, main)
2026-10-10T21:11:14.1146209Z # Subtest: TST-280003: empty Settings reaches the public Bridge configuration route
2026-10-10T21:11:14.1148049Z ok 110 - TST-280003: empty Settings reaches the public Bridge configuration route
2026-10-10T21:11:14.1173422Z   ---
2026-10-10T21:11:14.1178418Z   duration_ms: 365.013536
2026-10-10T21:11:14.1179135Z   type: 'test'
2026-10-10T21:11:14.1179821Z   ...
2026-10-10T21:11:14.1180946Z # Subtest: TST-280004: saved Bridge Change reaches the public route through dashboard go
2026-10-10T21:11:14.1182360Z ok 111 - TST-280004: saved Bridge Change reaches the public route through dashboard go
2026-10-10T21:11:14.1183371Z   ---
2026-10-10T21:11:14.1183835Z   duration_ms: 166.325624
2026-10-10T21:11:14.1184380Z   type: 'test'
2026-10-10T21:11:14.1185079Z   ...
2026-10-10T21:11:14.1186272Z # Subtest: TST-288101: dashboard Settings exports and restores every delivered setup secret through its canonical route
2026-10-10T21:11:14.1188117Z ok 112 - TST-288101: dashboard Settings exports and restores every delivered setup secret through its canonical route
2026-10-10T21:11:14.1189214Z   ---
2026-10-10T21:11:14.1189725Z   duration_ms: 245.277769
2026-10-10T21:11:14.1190287Z   type: 'test'
2026-10-10T21:11:14.1190760Z   ...
2026-10-10T21:11:14.1191758Z # Subtest: TST-290: Settings composes the stored endpoint slice beside legacy browser settings
2026-10-10T21:11:14.1193536Z ok 113 - TST-290: Settings composes the stored endpoint slice beside legacy browser settings
2026-10-10T21:11:14.1194466Z   ---
2026-10-10T21:11:14.1195175Z   duration_ms: 251.330927
2026-10-10T21:11:14.1195739Z   type: 'test'
2026-10-10T21:11:14.1196229Z   ...
2026-10-10T21:11:14.1197311Z # Subtest: TST-291: dashboard dispatches public endpoint creation and named editing routes
2026-10-10T21:11:14.1198957Z ok 114 - TST-291: dashboard dispatches public endpoint creation and named editing routes
2026-10-10T21:11:14.1200029Z   ---
2026-10-10T21:11:14.1200599Z   duration_ms: 163.28984
2026-10-10T21:11:14.1201242Z   type: 'test'
2026-10-10T21:11:14.1201817Z   ...
2026-10-10T21:11:14.1203366Z # Subtest: the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key
2026-10-10T21:11:14.1206012Z ok 115 - the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key
2026-10-10T21:11:14.1207705Z   ---
2026-10-10T21:11:14.1208240Z   duration_ms: 287.731374
2026-10-10T21:11:14.1209122Z   type: 'test'
2026-10-10T21:11:14.1209651Z   ...
2026-10-10T21:11:14.1211002Z # Subtest: the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:11:14.1213044Z ok 116 - the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:11:14.1214248Z   ---
2026-10-10T21:11:14.1215107Z   duration_ms: 58.107228
2026-10-10T21:11:14.1215753Z   type: 'test'
2026-10-10T21:11:14.1216345Z   ...
2026-10-10T21:11:14.1217618Z # Subtest: the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:11:14.1219675Z ok 117 - the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance
2026-10-10T21:11:14.1220964Z   ---
2026-10-10T21:11:14.1221526Z   duration_ms: 60.851085
2026-10-10T21:11:14.1222165Z   type: 'test'
2026-10-10T21:11:14.1222703Z   ...
2026-10-10T21:11:14.1223801Z # Subtest: ITM-238 F1 fixed: the Notifications controls are in the public Usability tab
2026-10-10T21:11:14.1225496Z ok 118 - ITM-238 F1 fixed: the Notifications controls are in the public Usability tab
2026-10-10T21:11:14.1226491Z   ---
2026-10-10T21:11:14.1227030Z   duration_ms: 106.122446
2026-10-10T21:11:14.1227630Z   type: 'test'
2026-10-10T21:11:14.1228739Z   ...
2026-10-10T21:11:14.1230422Z # Subtest: ITM-238 F2 fixed: the review pages' check connects the instance with the dashboard's own stored token
2026-10-10T21:11:14.1232490Z ok 119 - ITM-238 F2 fixed: the review pages' check connects the instance with the dashboard's own stored token
2026-10-10T21:11:14.1233534Z   ---
2026-10-10T21:11:14.1234111Z   duration_ms: 64.111493
2026-10-10T21:11:14.1234778Z   type: 'test'
2026-10-10T21:11:14.1235536Z   ...
2026-10-10T21:11:14.1236842Z # Subtest: ITM-238 F2 fixed: the main page's check also connects the instance with the dashboard's own stored token
2026-10-10T21:11:14.1238712Z ok 120 - ITM-238 F2 fixed: the main page's check also connects the instance with the dashboard's own stored token
2026-10-10T21:11:14.1245799Z   ---
2026-10-10T21:11:14.1246552Z   duration_ms: 55.788307
2026-10-10T21:11:14.1247124Z   type: 'test'
2026-10-10T21:11:14.1247586Z   ...
2026-10-10T21:11:14.1249622Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted
2026-10-10T21:11:14.1252459Z ok 121 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted
2026-10-10T21:11:14.1257916Z   ---
2026-10-10T21:11:14.1259289Z   duration_ms: 251.76073
2026-10-10T21:11:14.1260082Z   type: 'test'
2026-10-10T21:11:14.1260672Z   ...
2026-10-10T21:11:14.1262156Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file already notified yields no further notification
2026-10-10T21:11:14.1264375Z ok 122 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file already notified yields no further notification
2026-10-10T21:11:14.1265728Z   ---
2026-10-10T21:11:14.1266232Z   duration_ms: 157.28719
2026-10-10T21:11:14.1266851Z   type: 'test'
2026-10-10T21:11:14.1267452Z   ...
2026-10-10T21:11:14.1268946Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — notifications switched off yields no notification
2026-10-10T21:11:14.1271133Z ok 123 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — notifications switched off yields no notification
2026-10-10T21:11:14.1272348Z   ---
2026-10-10T21:11:14.1272933Z   duration_ms: 110.995149
2026-10-10T21:11:14.1273540Z   type: 'test'
2026-10-10T21:11:14.1274110Z   ...
2026-10-10T21:11:14.1276073Z # Subtest: NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page, the main page among them, asks before the click; the click asks once
2026-10-10T21:11:14.1278468Z ok 124 - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page, the main page among them, asks before the click; the click asks once
2026-10-10T21:11:14.1279782Z   ---
2026-10-10T21:11:14.1280356Z   duration_ms: 206.359644
2026-10-10T21:11:14.1280984Z   type: 'test'
2026-10-10T21:11:14.1281505Z   ...
2026-10-10T21:11:14.1282571Z # Subtest: TST-289101: public \#release reopens the selected product's pending report without writes
2026-10-10T21:11:14.1284275Z ok 125 - TST-289101: public \#release reopens the selected product's pending report without writes
2026-10-10T21:11:14.1285608Z   ---
2026-10-10T21:11:14.1286205Z   duration_ms: 289.367729
2026-10-10T21:11:14.1286845Z   type: 'test'
2026-10-10T21:11:14.1287387Z   ...
2026-10-10T21:11:14.1288657Z # Subtest: TST-289102: public \#release keeps the new-release form when the selected product has no pending report
2026-10-10T21:11:14.1290575Z ok 126 - TST-289102: public \#release keeps the new-release form when the selected product has no pending report
2026-10-10T21:11:14.1291746Z   ---
2026-10-10T21:11:14.1292390Z   duration_ms: 112.222122
2026-10-10T21:11:14.1293055Z   type: 'test'
2026-10-10T21:11:14.1293661Z   ...
2026-10-10T21:11:14.1499580Z # Subtest: the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:11:14.1504037Z ok 127 - the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:11:14.1505648Z   ---
2026-10-10T21:11:14.1506202Z   duration_ms: 1.426414
2026-10-10T21:11:14.1507285Z   type: 'test'
2026-10-10T21:11:14.1507920Z   ...
2026-10-10T21:11:14.2776804Z # Subtest: routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:11:14.2779038Z ok 128 - routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:11:14.2805651Z   ---
2026-10-10T21:11:14.2815548Z   duration_ms: 129.232671
2026-10-10T21:11:14.2837476Z   type: 'test'
2026-10-10T21:11:14.2850548Z   ...
2026-10-10T21:11:14.3992578Z # Subtest: the dashboard migrates its product list and tokens into MOD-browser-store
2026-10-10T21:11:14.3994000Z ok 129 - the dashboard migrates its product list and tokens into MOD-browser-store
2026-10-10T21:11:14.3995340Z   ---
2026-10-10T21:11:14.3995900Z   duration_ms: 4.817347
2026-10-10T21:11:14.3996463Z   type: 'test'
2026-10-10T21:11:14.3996948Z   ...
2026-10-10T21:11:14.3997974Z # Subtest: the adapter discovers token-only GitLab products and preserves imported public values
2026-10-10T21:11:14.3999502Z ok 130 - the adapter discovers token-only GitLab products and preserves imported public values
2026-10-10T21:11:14.4000439Z   ---
2026-10-10T21:11:14.4000920Z   duration_ms: 3.775352
2026-10-10T21:11:14.4001453Z   type: 'test'
2026-10-10T21:11:14.4001943Z   ...
2026-10-10T21:11:14.4002908Z # Subtest: the dashboard \#add entry renders the settings-pages route with its instance token
2026-10-10T21:11:14.4004300Z ok 131 - the dashboard \#add entry renders the settings-pages route with its instance token
2026-10-10T21:11:14.4005875Z   ---
2026-10-10T21:11:14.4006366Z   duration_ms: 274.921508
2026-10-10T21:11:14.4006907Z   type: 'test'
2026-10-10T21:11:14.4007382Z   ...
2026-10-10T21:11:14.5318311Z # Subtest: the dashboard \#settings entry mounts the public Settings route
2026-10-10T21:11:14.5345977Z ok 132 - the dashboard \#settings entry mounts the public Settings route
2026-10-10T21:11:14.5375438Z   ---
2026-10-10T21:11:14.5400578Z   duration_ms: 134.904876
2026-10-10T21:11:14.5415990Z   type: 'test'
2026-10-10T21:11:14.5416603Z   ...
2026-10-10T21:11:14.7051970Z # Subtest: the public add-product route rejects a synthetic Add product click
2026-10-10T21:11:14.7053572Z ok 133 - the public add-product route rejects a synthetic Add product click
2026-10-10T21:11:14.7054607Z   ---
2026-10-10T21:11:14.7055518Z   duration_ms: 172.257552
2026-10-10T21:11:14.7056240Z   type: 'test'
2026-10-10T21:11:14.7056914Z   ...
2026-10-10T21:11:14.7060974Z # Subtest: clearing product tokens clears their canonical values and cannot resurrect them on reload
2026-10-10T21:11:14.7062443Z ok 134 - clearing product tokens clears their canonical values and cannot resurrect them on reload
2026-10-10T21:11:14.7063143Z   ---
2026-10-10T21:11:14.7063354Z   duration_ms: 0.953501
2026-10-10T21:11:14.7063598Z   type: 'test'
2026-10-10T21:11:14.7063802Z   ...
2026-10-10T21:11:14.7064323Z # Subtest: removing a product clears its canonical address and token without reload resurrection
2026-10-10T21:11:14.7065610Z ok 135 - removing a product clears its canonical address and token without reload resurrection
2026-10-10T21:11:14.7066076Z   ---
2026-10-10T21:11:14.7066280Z   duration_ms: 0.675171
2026-10-10T21:11:14.7066515Z   type: 'test'
2026-10-10T21:11:14.7066712Z   ...
2026-10-10T21:11:14.7217471Z # Subtest: TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect
2026-10-10T21:11:14.7219591Z ok 136 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect
2026-10-10T21:11:14.7220703Z   ---
2026-10-10T21:11:14.7221226Z   duration_ms: 282.149481
2026-10-10T21:11:14.7221790Z   type: 'test'
2026-10-10T21:11:14.7222292Z   ...
2026-10-10T21:11:14.7487431Z # Subtest: UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance
2026-10-10T21:11:14.7494213Z ok 137 - UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance
2026-10-10T21:11:14.7515422Z   ---
2026-10-10T21:11:14.7516051Z   duration_ms: 214.905332
2026-10-10T21:11:14.7516716Z   type: 'test'
2026-10-10T21:11:14.7517273Z   ...
2026-10-10T21:11:14.7519021Z # Subtest: UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted
2026-10-10T21:11:14.7521663Z ok 138 - UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted
2026-10-10T21:11:14.7523166Z   ---
2026-10-10T21:11:14.7523698Z   duration_ms: 157.008992
2026-10-10T21:11:14.7524417Z   type: 'test'
2026-10-10T21:11:14.7525341Z   ...
2026-10-10T21:11:14.8505859Z # Subtest: UC-008 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:11:14.8509933Z ok 139 - UC-008 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:11:14.8511119Z   ---
2026-10-10T21:11:14.8511759Z   duration_ms: 105.809964
2026-10-10T21:11:14.8512244Z   type: 'test'
2026-10-10T21:11:14.8512606Z   ...
2026-10-10T21:11:14.9141040Z # Subtest: UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names
2026-10-10T21:11:14.9167132Z ok 140 - UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names
2026-10-10T21:11:14.9195503Z   ---
2026-10-10T21:11:14.9225809Z   duration_ms: 61.623296
2026-10-10T21:11:14.9239556Z   type: 'test'
2026-10-10T21:11:14.9241677Z   ...
2026-10-10T21:11:15.0422699Z # Subtest: UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone
2026-10-10T21:11:15.0423813Z ok 141 - UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone
2026-10-10T21:11:15.0424277Z   ---
2026-10-10T21:11:15.0424488Z   duration_ms: 129.344476
2026-10-10T21:11:15.0424725Z   type: 'test'
2026-10-10T21:11:15.0425385Z   ...
2026-10-10T21:11:15.2529804Z # Subtest: UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open
2026-10-10T21:11:15.2533125Z ok 142 - UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open
2026-10-10T21:11:15.2535412Z   ---
2026-10-10T21:11:15.2536137Z   duration_ms: 210.977604
2026-10-10T21:11:15.2536649Z   type: 'test'
2026-10-10T21:11:15.2536970Z   ...
2026-10-10T21:11:15.4009024Z # Subtest: UC-008 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:11:15.4010855Z ok 143 - UC-008 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:11:15.4011774Z   ---
2026-10-10T21:11:15.4012279Z   duration_ms: 147.91742
2026-10-10T21:11:15.4012657Z   type: 'test'
2026-10-10T21:11:15.4013097Z   ...
2026-10-10T21:11:15.5484709Z # Subtest: UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor
2026-10-10T21:11:15.5486777Z ok 144 - UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor
2026-10-10T21:11:15.5487441Z   ---
2026-10-10T21:11:15.5487683Z   duration_ms: 147.31079
2026-10-10T21:11:15.5487973Z   type: 'test'
2026-10-10T21:11:15.5488209Z   ...
2026-10-10T21:11:15.7028566Z # Subtest: UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor
2026-10-10T21:11:15.7031404Z ok 145 - UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor
2026-10-10T21:11:15.7032231Z   ---
2026-10-10T21:11:15.7032753Z   duration_ms: 153.918941
2026-10-10T21:11:15.7033240Z   type: 'test'
2026-10-10T21:11:15.7033613Z   ...
2026-10-10T21:11:16.0451480Z # Subtest: UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown
2026-10-10T21:11:16.0452918Z ok 146 - UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown
2026-10-10T21:11:16.0453487Z   ---
2026-10-10T21:11:16.0453709Z   duration_ms: 342.490297
2026-10-10T21:11:16.0453945Z   type: 'test'
2026-10-10T21:11:16.0454144Z   ...
2026-10-10T21:11:16.3864658Z # Subtest: UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted
2026-10-10T21:11:16.3867305Z ok 147 - UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted
2026-10-10T21:11:16.3868572Z   ---
2026-10-10T21:11:16.3869104Z   duration_ms: 341.170533
2026-10-10T21:11:16.3869749Z   type: 'test'
2026-10-10T21:11:16.3870176Z   ...
2026-10-10T21:11:16.5337173Z # Subtest: UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor
2026-10-10T21:11:16.5339714Z ok 148 - UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor
2026-10-10T21:11:16.5341114Z   ---
2026-10-10T21:11:16.5341630Z   duration_ms: 147.167719
2026-10-10T21:11:16.5342048Z   type: 'test'
2026-10-10T21:11:16.5342374Z   ...
2026-10-10T21:11:16.6429963Z # Subtest: UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case
2026-10-10T21:11:16.6434630Z not ok 149 - UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case
2026-10-10T21:11:16.6435560Z   ---
2026-10-10T21:11:16.6435897Z   duration_ms: 108.273548
2026-10-10T21:11:16.6436230Z   type: 'test'
2026-10-10T21:11:16.6436705Z   location: '/home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:284:1'
2026-10-10T21:11:16.6437223Z   failureType: 'testCodeFailure'
2026-10-10T21:11:16.6437536Z   error: |-
2026-10-10T21:11:16.6437906Z     The input did not match the regular expression /HostError.*NotFound/i. Input:
2026-10-10T21:11:16.6438288Z     
2026-10-10T21:11:16.6439392Z     '<p class="warn">Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it.</p>\n' +
2026-10-10T21:11:16.6440177Z       '      \n' +
2026-10-10T21:11:16.6440393Z       '      \n' +
2026-10-10T21:11:16.6440772Z       '      \n' +
2026-10-10T21:11:16.6441165Z       '      \n' +
2026-10-10T21:11:16.6441523Z       '      \n' +
2026-10-10T21:11:16.6441890Z       '      \n' +
2026-10-10T21:11:16.6442252Z       '      \n' +
2026-10-10T21:11:16.6443296Z       '      '
2026-10-10T21:11:16.6443670Z     
2026-10-10T21:11:16.6444009Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:16.6444447Z   name: 'AssertionError'
2026-10-10T21:11:16.6445046Z   expected:
2026-10-10T21:11:16.6445413Z   actual: |-
2026-10-10T21:11:16.6447124Z     <p class="warn">Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it.</p>
2026-10-10T21:11:16.6448452Z           
2026-10-10T21:11:16.6448763Z           
2026-10-10T21:11:16.6449064Z           
2026-10-10T21:11:16.6449366Z           
2026-10-10T21:11:16.6449674Z           
2026-10-10T21:11:16.6449994Z           
2026-10-10T21:11:16.6450324Z           
2026-10-10T21:11:16.6450639Z           
2026-10-10T21:11:16.6450982Z   operator: 'match'
2026-10-10T21:11:16.6451356Z   stack: |-
2026-10-10T21:11:16.6452360Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:297:10)
2026-10-10T21:11:16.6453555Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:16.6455492Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:16.6456506Z   ...
2026-10-10T21:11:16.6995687Z # Subtest: UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token
2026-10-10T21:11:16.6997977Z ok 150 - UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token
2026-10-10T21:11:16.6998894Z   ---
2026-10-10T21:11:16.6999181Z   duration_ms: 57.617554
2026-10-10T21:11:16.6999510Z   type: 'test'
2026-10-10T21:11:16.6999807Z   ...
2026-10-10T21:11:16.8038344Z # Subtest: UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and offers the way through GitHub's page as a link
2026-10-10T21:11:16.8041151Z ok 151 - UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and offers the way through GitHub's page as a link
2026-10-10T21:11:16.8042406Z   ---
2026-10-10T21:11:16.8042993Z   duration_ms: 104.040757
2026-10-10T21:11:16.8043531Z   type: 'test'
2026-10-10T21:11:16.8044008Z   ...
2026-10-10T21:11:16.8721262Z # Subtest: UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale
2026-10-10T21:11:16.8722987Z ok 152 - UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale
2026-10-10T21:11:16.8723763Z   ---
2026-10-10T21:11:16.8724045Z   duration_ms: 68.191894
2026-10-10T21:11:16.8724376Z   type: 'test'
2026-10-10T21:11:16.8725441Z   ...
2026-10-10T21:11:17.0009643Z # Subtest: UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC
2026-10-10T21:11:17.0011206Z ok 153 - UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC
2026-10-10T21:11:17.0011878Z   ---
2026-10-10T21:11:17.0012087Z   duration_ms: 128.670262
2026-10-10T21:11:17.0012356Z   type: 'test'
2026-10-10T21:11:17.0012556Z   ...
2026-10-10T21:11:17.1091124Z # Subtest: UC-006 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:11:17.1092366Z ok 154 - UC-006 counter-proof: a click a script makes on Accept writes and reads nothing
2026-10-10T21:11:17.1092807Z   ---
2026-10-10T21:11:17.1093040Z   duration_ms: 106.624054
2026-10-10T21:11:17.1093290Z   type: 'test'
2026-10-10T21:11:17.1093495Z   ...
2026-10-10T21:11:17.2340375Z # Subtest: UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state
2026-10-10T21:11:17.2343844Z ok 155 - UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state
2026-10-10T21:11:17.2345377Z   ---
2026-10-10T21:11:17.2345925Z   duration_ms: 126.118132
2026-10-10T21:11:17.2346609Z   type: 'test'
2026-10-10T21:11:17.2347161Z   ...
2026-10-10T21:11:17.3725605Z # Subtest: UC-006 5a: the proposal changed after the entry was opened — nothing is written
2026-10-10T21:11:17.3726749Z ok 156 - UC-006 5a: the proposal changed after the entry was opened — nothing is written
2026-10-10T21:11:17.3727508Z   ---
2026-10-10T21:11:17.3727852Z   duration_ms: 138.696447
2026-10-10T21:11:17.3728239Z   type: 'test'
2026-10-10T21:11:17.3728452Z   ...
2026-10-10T21:11:17.6486749Z # Subtest: UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text
2026-10-10T21:11:17.6490020Z ok 157 - UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text
2026-10-10T21:11:17.6491294Z   ---
2026-10-10T21:11:17.6491941Z   duration_ms: 276.207702
2026-10-10T21:11:17.6492431Z   type: 'test'
2026-10-10T21:11:17.6492917Z   ...
2026-10-10T21:11:17.8012024Z # Subtest: UC-006 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:11:17.8013228Z ok 158 - UC-006 3a counter-proof: a click a script makes on Save writes nothing
2026-10-10T21:11:17.8014673Z   ---
2026-10-10T21:11:17.8015698Z   duration_ms: 152.502924
2026-10-10T21:11:17.8016287Z   type: 'test'
2026-10-10T21:11:17.8016748Z   ...
2026-10-10T21:11:17.9513336Z # Subtest: UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor
2026-10-10T21:11:17.9516684Z ok 159 - UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor
2026-10-10T21:11:17.9517993Z   ---
2026-10-10T21:11:17.9518303Z   duration_ms: 149.629366
2026-10-10T21:11:17.9518664Z   type: 'test'
2026-10-10T21:11:17.9518941Z   ...
2026-10-10T21:11:18.2756797Z # Subtest: UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit
2026-10-10T21:11:18.2759688Z ok 160 - UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit
2026-10-10T21:11:18.2761263Z   ---
2026-10-10T21:11:18.2761859Z   duration_ms: 324.306855
2026-10-10T21:11:18.2762347Z   type: 'test'
2026-10-10T21:11:18.2762735Z   ...
2026-10-10T21:11:18.4752577Z # Subtest: UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs
2026-10-10T21:11:18.4755524Z ok 161 - UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs
2026-10-10T21:11:18.4756969Z   ---
2026-10-10T21:11:18.4765681Z   duration_ms: 198.94079
2026-10-10T21:11:18.4766327Z   type: 'test'
2026-10-10T21:11:18.4766864Z   ...
2026-10-10T21:11:18.5906809Z # Subtest: A GITHUB PRODUCT USES A TOKEN OF ITS OWN — a product's pages are read with its own key, the instance with the instance's; counter-proof: a product without a key of its own is read with the instance's
2026-10-10T21:11:18.5910213Z ok 162 - A GITHUB PRODUCT USES A TOKEN OF ITS OWN — a product's pages are read with its own key, the instance with the instance's; counter-proof: a product without a key of its own is read with the instance's
2026-10-10T21:11:18.5911802Z   ---
2026-10-10T21:11:18.5912182Z   duration_ms: 115.82513
2026-10-10T21:11:18.5912601Z   type: 'test'
2026-10-10T21:11:18.5912952Z   ...
2026-10-10T21:11:18.7097491Z # Subtest: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE — a product's own key that expires within fourteen days is named on the product's pages, with Renew at GitHub's list of tokens and where to paste the new value; counter-proof: the instance's pages do not name it
2026-10-10T21:11:18.7103664Z ok 163 - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE — a product's own key that expires within fourteen days is named on the product's pages, with Renew at GitHub's list of tokens and where to paste the new value; counter-proof: the instance's pages do not name it
2026-10-10T21:11:18.7106535Z   ---
2026-10-10T21:11:18.7107062Z   duration_ms: 118.826004
2026-10-10T21:11:18.7107748Z   type: 'test'
2026-10-10T21:11:18.7108243Z   ...
2026-10-10T21:11:19.0543089Z # Subtest: UC-042 · A GITHUB PRODUCT USES A TOKEN OF ITS OWN — Settings lists each GitHub product's own key: hidden until shown, its expiry, Test reads the product with it, Change opens with its field focused and stores a new value, Clear removes it after a confirmation; Remove takes it with the product
2026-10-10T21:11:19.0548387Z ok 164 - UC-042 · A GITHUB PRODUCT USES A TOKEN OF ITS OWN — Settings lists each GitHub product's own key: hidden until shown, its expiry, Test reads the product with it, Change opens with its field focused and stores a new value, Clear removes it after a confirmation; Remove takes it with the product
2026-10-10T21:11:19.0549676Z   ---
2026-10-10T21:11:19.0550059Z   duration_ms: 344.60772
2026-10-10T21:11:19.0550478Z   type: 'test'
2026-10-10T21:11:19.0550832Z   ...
2026-10-10T21:11:19.1696183Z # Subtest: UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not
2026-10-10T21:11:19.1698603Z ok 165 - UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not
2026-10-10T21:11:19.1699384Z   ---
2026-10-10T21:11:19.1699612Z   duration_ms: 115.437786
2026-10-10T21:11:19.1699867Z   type: 'test'
2026-10-10T21:11:19.1700188Z   ...
2026-10-10T21:11:19.2201670Z # Subtest: UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance
2026-10-10T21:11:19.2204490Z ok 166 - UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance
2026-10-10T21:11:19.2205992Z   ---
2026-10-10T21:11:19.2206377Z   duration_ms: 50.538592
2026-10-10T21:11:19.2206810Z   type: 'test'
2026-10-10T21:11:19.2207170Z   ...
2026-10-10T21:11:19.4563857Z # Subtest: UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready
2026-10-10T21:11:19.4569893Z ok 167 - UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready
2026-10-10T21:11:19.4610183Z   ---
2026-10-10T21:11:19.4611303Z   duration_ms: 235.856786
2026-10-10T21:11:19.4611694Z   type: 'test'
2026-10-10T21:11:19.4612011Z   ...
2026-10-10T21:11:19.6507733Z # Subtest: UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored
2026-10-10T21:11:19.6510838Z ok 168 - UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored
2026-10-10T21:11:19.6512122Z   ---
2026-10-10T21:11:19.6512978Z   duration_ms: 194.065984
2026-10-10T21:11:19.6513848Z   type: 'test'
2026-10-10T21:11:19.6515236Z   ...
2026-10-10T21:11:19.7661925Z # Subtest: UC-042 step 1: public component tabs keep every settings scope and existing control reachable
2026-10-10T21:11:19.7664303Z ok 169 - UC-042 step 1: public component tabs keep every settings scope and existing control reachable
2026-10-10T21:11:19.7666162Z   ---
2026-10-10T21:11:19.7666910Z   duration_ms: 115.862601
2026-10-10T21:11:19.7739134Z   type: 'test'
2026-10-10T21:11:19.7739579Z   ...
2026-10-10T21:11:19.9630317Z # Subtest: UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again
2026-10-10T21:11:19.9632412Z ok 170 - UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again
2026-10-10T21:11:19.9634254Z   ---
2026-10-10T21:11:19.9635369Z   duration_ms: 196.706664
2026-10-10T21:11:19.9635916Z   type: 'test'
2026-10-10T21:11:19.9636386Z   ...
2026-10-10T21:11:20.1239801Z # Subtest: UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works
2026-10-10T21:11:20.1241505Z ok 171 - UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works
2026-10-10T21:11:20.1242719Z   ---
2026-10-10T21:11:20.1243123Z   duration_ms: 160.856666
2026-10-10T21:11:20.1243707Z   type: 'test'
2026-10-10T21:11:20.1244138Z   ...
2026-10-10T21:11:20.2764092Z # Subtest: UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works
2026-10-10T21:11:20.2766999Z ok 172 - UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works
2026-10-10T21:11:20.2768989Z   ---
2026-10-10T21:11:20.2769578Z   duration_ms: 152.314059
2026-10-10T21:11:20.2770143Z   type: 'test'
2026-10-10T21:11:20.2770591Z   ...
2026-10-10T21:11:20.4346651Z # Subtest: UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token
2026-10-10T21:11:20.4348258Z ok 173 - UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token
2026-10-10T21:11:20.4349305Z   ---
2026-10-10T21:11:20.4349965Z   duration_ms: 158.085593
2026-10-10T21:11:20.4350686Z   type: 'test'
2026-10-10T21:11:20.4351874Z   ...
2026-10-10T21:11:20.6347990Z # Subtest: UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked
2026-10-10T21:11:20.6349568Z ok 174 - UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked
2026-10-10T21:11:20.6350370Z   ---
2026-10-10T21:11:20.6350750Z   duration_ms: 200.170734
2026-10-10T21:11:20.6351003Z   type: 'test'
2026-10-10T21:11:20.6351204Z   ...
2026-10-10T21:11:20.8371291Z # Subtest: UC-042 step 2 on a phone: the token form carries the notice and its own I have read this beside the paste field; ticked there, the field and Store token open, and the notice at the top is ticked with it
2026-10-10T21:11:20.8378122Z ok 175 - UC-042 step 2 on a phone: the token form carries the notice and its own I have read this beside the paste field; ticked there, the field and Store token open, and the notice at the top is ticked with it
2026-10-10T21:11:20.8380613Z   ---
2026-10-10T21:11:20.8381445Z   duration_ms: 201.89757
2026-10-10T21:11:20.8382346Z   type: 'test'
2026-10-10T21:11:20.8383065Z   ...
2026-10-10T21:11:20.9971005Z # Subtest: A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Store a token: the notice's box I have read this, while it is not ticked
2026-10-10T21:11:20.9975452Z ok 176 - A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Store a token: the notice's box I have read this, while it is not ticked
2026-10-10T21:11:20.9976613Z   ---
2026-10-10T21:11:20.9977096Z   duration_ms: 159.76115
2026-10-10T21:11:20.9977923Z   type: 'test'
2026-10-10T21:11:20.9978365Z   ...
2026-10-10T21:11:21.1568849Z # Subtest: A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of the token: the paste field, once the notice is ticked
2026-10-10T21:11:21.1570281Z ok 177 - A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of the token: the paste field, once the notice is ticked
2026-10-10T21:11:21.1570927Z   ---
2026-10-10T21:11:21.1571270Z   duration_ms: 158.960342
2026-10-10T21:11:21.1571626Z   type: 'test'
2026-10-10T21:11:21.1571979Z   ...
2026-10-10T21:11:21.3096677Z # Subtest: A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of a GitLab project token: the field for the new token
2026-10-10T21:11:21.3098691Z ok 178 - A FORM OPENS WITH ITS FIRST FIELD FOCUSED — Change of a GitLab project token: the field for the new token
2026-10-10T21:11:21.3101652Z   ---
2026-10-10T21:11:21.3102146Z   duration_ms: 153.591198
2026-10-10T21:11:21.3102613Z   type: 'test'
2026-10-10T21:11:21.3103188Z   ...
2026-10-10T21:11:21.6226687Z # Subtest: UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not
2026-10-10T21:11:21.6286196Z ok 179 - UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not
2026-10-10T21:11:21.6348598Z   ---
2026-10-10T21:11:21.6375278Z   duration_ms: 309.142393
2026-10-10T21:11:21.6405314Z   type: 'test'
2026-10-10T21:11:21.6435222Z   ...
2026-10-10T21:11:21.8214624Z # Subtest: UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line
2026-10-10T21:11:21.8216562Z ok 180 - UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line
2026-10-10T21:11:21.8217254Z   ---
2026-10-10T21:11:21.8217600Z   duration_ms: 202.49327
2026-10-10T21:11:21.8218089Z   type: 'test'
2026-10-10T21:11:21.8218378Z   ...
2026-10-10T21:11:22.0806169Z # Subtest: UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes
2026-10-10T21:11:22.0808939Z ok 181 - UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes
2026-10-10T21:11:22.0810157Z   ---
2026-10-10T21:11:22.0810494Z   duration_ms: 258.327475
2026-10-10T21:11:22.0810885Z   type: 'test'
2026-10-10T21:11:22.0811211Z   ...
2026-10-10T21:11:22.3667771Z # Subtest: UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation
2026-10-10T21:11:22.3670061Z ok 182 - UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation
2026-10-10T21:11:22.3671029Z   ---
2026-10-10T21:11:22.3671390Z   duration_ms: 286.51922
2026-10-10T21:11:22.3671814Z   type: 'test'
2026-10-10T21:11:22.3672165Z   ...
2026-10-10T21:11:22.7766881Z # Subtest: UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser
2026-10-10T21:11:22.7769300Z ok 183 - UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser
2026-10-10T21:11:22.7770415Z   ---
2026-10-10T21:11:22.7770816Z   duration_ms: 409.522439
2026-10-10T21:11:22.7771302Z   type: 'test'
2026-10-10T21:11:22.7771682Z   ...
2026-10-10T21:11:22.9383372Z # Subtest: UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001
2026-10-10T21:11:22.9385884Z ok 184 - UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001
2026-10-10T21:11:22.9402711Z   ---
2026-10-10T21:11:22.9403285Z   duration_ms: 161.167727
2026-10-10T21:11:22.9403901Z   type: 'test'
2026-10-10T21:11:22.9404397Z   ...
2026-10-10T21:11:23.1861723Z # Subtest: UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md
2026-10-10T21:11:23.1867426Z not ok 185 - UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md
2026-10-10T21:11:23.1868940Z   ---
2026-10-10T21:11:23.1869331Z   duration_ms: 248.520814
2026-10-10T21:11:23.1869764Z   type: 'test'
2026-10-10T21:11:23.1870609Z   location: '/home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:939:1'
2026-10-10T21:11:23.1871725Z   failureType: 'testCodeFailure'
2026-10-10T21:11:23.1872211Z   error: |-
2026-10-10T21:11:23.1872669Z     Expected values to be strictly equal:
2026-10-10T21:11:23.1873227Z     + actual - expected
2026-10-10T21:11:23.1873644Z     
2026-10-10T21:11:23.1874111Z     + 'edit settings.md (Agent M dashboard)'
2026-10-10T21:11:23.1875081Z     - 'settings: pseudonymisation off (Agent M dashboard)'
2026-10-10T21:11:23.1875680Z     
2026-10-10T21:11:23.1876011Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:23.1876476Z   name: 'AssertionError'
2026-10-10T21:11:23.1877125Z   expected: 'settings: pseudonymisation off (Agent M dashboard)'
2026-10-10T21:11:23.1877898Z   actual: 'edit settings.md (Agent M dashboard)'
2026-10-10T21:11:23.1878471Z   operator: 'strictEqual'
2026-10-10T21:11:23.1879018Z   stack: |-
2026-10-10T21:11:23.1879988Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:959:10)
2026-10-10T21:11:23.1881167Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:23.1882125Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:23.1882919Z   ...
2026-10-10T21:11:23.3873188Z # Subtest: UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why
2026-10-10T21:11:23.3875617Z ok 186 - UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why
2026-10-10T21:11:23.3876711Z   ---
2026-10-10T21:11:23.3877096Z   duration_ms: 201.341366
2026-10-10T21:11:23.3877474Z   type: 'test'
2026-10-10T21:11:23.3877693Z   ...
2026-10-10T21:11:23.5578414Z # Subtest: UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says already written data needs a history rewrite to be removed
2026-10-10T21:11:23.5582672Z ok 187 - UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says already written data needs a history rewrite to be removed
2026-10-10T21:11:23.5590539Z   ---
2026-10-10T21:11:23.5591341Z   duration_ms: 170.455352
2026-10-10T21:11:23.5591828Z   type: 'test'
2026-10-10T21:11:23.5592226Z   ...
2026-10-10T21:11:23.7209660Z # Subtest: UC-042 step 5: + Collaborator creates the canonical new document with affirmative consent, name, account and one list row
2026-10-10T21:11:23.7212372Z ok 188 - UC-042 step 5: + Collaborator creates the canonical new document with affirmative consent, name, account and one list row
2026-10-10T21:11:23.7214236Z   ---
2026-10-10T21:11:23.7215154Z   duration_ms: 163.369985
2026-10-10T21:11:23.7215910Z   type: 'test'
2026-10-10T21:11:23.7216510Z   ...
2026-10-10T21:11:23.9216160Z # Subtest: UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing
2026-10-10T21:11:23.9226473Z ok 189 - UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing
2026-10-10T21:11:23.9227369Z   ---
2026-10-10T21:11:23.9227675Z   duration_ms: 200.380188
2026-10-10T21:11:23.9228010Z   type: 'test'
2026-10-10T21:11:23.9228284Z   ...
2026-10-10T21:11:24.0881063Z # Subtest: UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name
2026-10-10T21:11:24.0882850Z ok 190 - UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name
2026-10-10T21:11:24.0883793Z   ---
2026-10-10T21:11:24.0884477Z   duration_ms: 165.710669
2026-10-10T21:11:24.0885144Z   type: 'test'
2026-10-10T21:11:24.0885542Z   ...
2026-10-10T21:11:24.2375596Z # Subtest: UC-042 step 6: Clear everything removes every Agent M localStorage entry after a confirmation
2026-10-10T21:11:24.2377846Z ok 191 - UC-042 step 6: Clear everything removes every Agent M localStorage entry after a confirmation
2026-10-10T21:11:24.2379296Z   ---
2026-10-10T21:11:24.2380041Z   duration_ms: 150.082124
2026-10-10T21:11:24.2380788Z   type: 'test'
2026-10-10T21:11:24.2381429Z   ...
2026-10-10T21:11:24.2596341Z # Subtest: UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test
2026-10-10T21:11:24.2598702Z ok 192 - UC-042 step 1: a successful Test of the GitHub token is shown after a reload — ✓ works with the date of that test
2026-10-10T21:11:24.2599880Z   ---
2026-10-10T21:11:24.2600447Z   duration_ms: 384.16879
2026-10-10T21:11:24.2601020Z   type: 'test'
2026-10-10T21:11:24.2601532Z   ...
2026-10-10T21:11:24.2603040Z # Subtest: UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top
2026-10-10T21:11:24.2605410Z ok 193 - UC-042 step 1 · 1b: a token GitHub refused at its last use is shown refused after a reload — on its line and at the top
2026-10-10T21:11:24.2606653Z   ---
2026-10-10T21:11:24.2607205Z   duration_ms: 262.256908
2026-10-10T21:11:24.2607796Z   type: 'test'
2026-10-10T21:11:24.2608321Z   ...
2026-10-10T21:11:24.2609819Z # Subtest: UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load
2026-10-10T21:11:24.2611934Z ok 194 - UC-042 step 1: a successful Test after a refusal replaces it — the line works again, and so does the next page load
2026-10-10T21:11:24.2613084Z   ---
2026-10-10T21:11:24.2613614Z   duration_ms: 208.388842
2026-10-10T21:11:24.2614187Z   type: 'test'
2026-10-10T21:11:24.2614703Z   ...
2026-10-10T21:11:24.2617098Z # Subtest: UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it
2026-10-10T21:11:24.2619346Z ok 195 - UC-042 step 2: a new token stored with Change starts untested — the last test of the old token does not stick to it
2026-10-10T21:11:24.2620509Z   ---
2026-10-10T21:11:24.2621056Z   duration_ms: 205.264257
2026-10-10T21:11:24.2621657Z   type: 'test'
2026-10-10T21:11:24.2622197Z   ...
2026-10-10T21:11:24.2623640Z # Subtest: UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage
2026-10-10T21:11:24.2626337Z ok 196 - UC-042 step 2 · A CLEAR IS A REAL CLEAR: Clear removes the kept date and outcome with the token from localStorage
2026-10-10T21:11:24.2627643Z   ---
2026-10-10T21:11:24.2628207Z   duration_ms: 211.560393
2026-10-10T21:11:24.2628880Z   type: 'test'
2026-10-10T21:11:24.2629480Z   ...
2026-10-10T21:11:24.2630843Z # Subtest: UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result
2026-10-10T21:11:24.2632620Z ok 197 - UC-042 step 6 · A CLEAR IS A REAL CLEAR: Clear everything removes every kept test result
2026-10-10T21:11:24.2633605Z   ---
2026-10-10T21:11:24.2634171Z   duration_ms: 105.035263
2026-10-10T21:11:24.2634778Z   type: 'test'
2026-10-10T21:11:24.2635701Z   ...
2026-10-10T21:11:24.2637187Z # Subtest: EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page
2026-10-10T21:11:24.2639389Z ok 198 - EVERY SETTING IS REACHED FROM ONE PAGE: after the tests, every entry Agent M keeps in localStorage has its place on the settings page
2026-10-10T21:11:24.2640668Z   ---
2026-10-10T21:11:24.2641211Z   duration_ms: 211.4758
2026-10-10T21:11:24.2641804Z   type: 'test'
2026-10-10T21:11:24.2642340Z   ...
2026-10-10T21:11:24.2643715Z # Subtest: UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:11:24.2646042Z ok 199 - UC-042 step 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:11:24.2647432Z   ---
2026-10-10T21:11:24.2647975Z   duration_ms: 308.653398
2026-10-10T21:11:24.2648569Z   type: 'test'
2026-10-10T21:11:24.2649337Z   ...
2026-10-10T21:11:24.2650415Z # Subtest: UC-042 step 2: a GitLab project token changed or cleared takes its last test with it
2026-10-10T21:11:24.2652072Z ok 200 - UC-042 step 2: a GitLab project token changed or cleared takes its last test with it
2026-10-10T21:11:24.2653144Z   ---
2026-10-10T21:11:24.2653722Z   duration_ms: 414.186741
2026-10-10T21:11:24.2654365Z   type: 'test'
2026-10-10T21:11:24.2655163Z   ...
2026-10-10T21:11:24.2656627Z # Subtest: UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload
2026-10-10T21:11:24.2658685Z ok 201 - UC-042 step 1: a remote session's last test — something answered, or nothing — is shown after a reload
2026-10-10T21:11:24.2659768Z   ---
2026-10-10T21:11:24.2660389Z   duration_ms: 219.647731
2026-10-10T21:11:24.2661073Z   type: 'test'
2026-10-10T21:11:24.2661640Z   ...
2026-10-10T21:11:24.2662895Z # Subtest: with every view file of today, the menu shows the stages of the process in their order, each linked to its page
2026-10-10T21:11:24.2664768Z ok 202 - with every view file of today, the menu shows the stages of the process in their order, each linked to its page
2026-10-10T21:11:24.2666148Z   ---
2026-10-10T21:11:24.2666701Z   duration_ms: 101.873003
2026-10-10T21:11:24.2667308Z   type: 'test'
2026-10-10T21:11:24.2667867Z   ...
2026-10-10T21:11:24.2669583Z # Subtest: every dashboard view file of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, setup, review pages
2026-10-10T21:11:24.2672038Z ok 203 - every dashboard view file of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, setup, review pages
2026-10-10T21:11:24.2673340Z   ---
2026-10-10T21:11:24.2673925Z   duration_ms: 512.078255
2026-10-10T21:11:24.2674546Z   type: 'test'
2026-10-10T21:11:24.2675343Z   ...
2026-10-10T21:11:24.2676540Z # Subtest: a view or settings section whose file is not there yet is not shown, and its address shows the use cases
2026-10-10T21:11:24.2678295Z ok 204 - a view or settings section whose file is not there yet is not shown, and its address shows the use cases
2026-10-10T21:11:24.2679536Z   ---
2026-10-10T21:11:24.2680154Z   duration_ms: 148.143808
2026-10-10T21:11:24.2680801Z   type: 'test'
2026-10-10T21:11:24.2681383Z   ...
2026-10-10T21:11:24.2682913Z # Subtest: a load of every address of today asks for no view or settings file that is not built — no 404 per planned view
2026-10-10T21:11:24.2685729Z ok 205 - a load of every address of today asks for no view or settings file that is not built — no 404 per planned view
2026-10-10T21:11:24.2687052Z   ---
2026-10-10T21:11:24.2687730Z   duration_ms: 5844.105061
2026-10-10T21:11:24.2688461Z   type: 'test'
2026-10-10T21:11:24.2689198Z   ...
2026-10-10T21:11:24.2690695Z # Subtest: the list of built files beside the views names exactly the files of the table that are there
2026-10-10T21:11:24.2692424Z ok 206 - the list of built files beside the views names exactly the files of the table that are there
2026-10-10T21:11:24.2693414Z   ---
2026-10-10T21:11:24.2693922Z   duration_ms: 1.108781
2026-10-10T21:11:24.2694472Z   type: 'test'
2026-10-10T21:11:24.2695216Z   ...
2026-10-10T21:11:24.2696192Z # Subtest: a request handler a test brings answers before the harness's own GitHub
2026-10-10T21:11:24.2697627Z ok 207 - a request handler a test brings answers before the harness's own GitHub
2026-10-10T21:11:24.2698624Z   ---
2026-10-10T21:11:24.2699156Z   duration_ms: 167.872352
2026-10-10T21:11:24.2699755Z   type: 'test'
2026-10-10T21:11:24.2700274Z   ...
2026-10-10T21:11:24.2701478Z # Subtest: a view may link a stylesheet of its own beside style.css — once, when it is first shown
2026-10-10T21:11:24.2703174Z ok 208 - a view may link a stylesheet of its own beside style.css — once, when it is first shown
2026-10-10T21:11:24.2704516Z   ---
2026-10-10T21:11:24.2705334Z   duration_ms: 346.379271
2026-10-10T21:11:24.2705947Z   type: 'test'
2026-10-10T21:11:24.2706470Z   ...
2026-10-10T21:11:24.2707998Z # Subtest: UC-006 3b: an entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before Accept
2026-10-10T21:11:24.2710479Z ok 209 - UC-006 3b: an entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before Accept
2026-10-10T21:11:24.2711841Z   ---
2026-10-10T21:11:24.2712352Z   duration_ms: 290.820005
2026-10-10T21:11:24.2712919Z   type: 'test'
2026-10-10T21:11:24.2713417Z   ...
2026-10-10T21:11:24.2714794Z # Subtest: UC-006 3b counter-proof: an entry that only adds a requirement shows no impact list and reads no use case, architecture file or test
2026-10-10T21:11:24.2717270Z ok 210 - UC-006 3b counter-proof: an entry that only adds a requirement shows no impact list and reads no use case, architecture file or test
2026-10-10T21:11:24.2718494Z   ---
2026-10-10T21:11:24.2719030Z   duration_ms: 56.848297
2026-10-10T21:11:24.2719603Z   type: 'test'
2026-10-10T21:11:24.2720160Z   ...
2026-10-10T21:11:24.2721037Z # Subtest: UC-006 3b: a withdrawn requirement's entry lists what still names it
2026-10-10T21:11:24.2722264Z ok 211 - UC-006 3b: a withdrawn requirement's entry lists what still names it
2026-10-10T21:11:24.2723076Z   ---
2026-10-10T21:11:24.2723564Z   duration_ms: 66.143188
2026-10-10T21:11:24.2724165Z   type: 'test'
2026-10-10T21:11:24.2724727Z   ...
2026-10-10T21:11:24.2726169Z # Subtest: UC-006 3b: an entry whose impact list cannot be derived is not offered for acceptance, and says why
2026-10-10T21:11:24.2727854Z ok 212 - UC-006 3b: an entry whose impact list cannot be derived is not offered for acceptance, and says why
2026-10-10T21:11:24.2728905Z   ---
2026-10-10T21:11:24.2729442Z   duration_ms: 61.752975
2026-10-10T21:11:24.2730027Z   type: 'test'
2026-10-10T21:11:24.2730553Z   ...
2026-10-10T21:11:24.2732006Z # Subtest: UC-006 3b: an entry that renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept
2026-10-10T21:11:24.2734261Z ok 213 - UC-006 3b: an entry that renames a requirement in place or leaves it out of its section lists what names it, as withdrawn, before Accept
2026-10-10T21:11:24.2735839Z   ---
2026-10-10T21:11:24.2736414Z   duration_ms: 117.61922
2026-10-10T21:11:24.2737007Z   type: 'test'
2026-10-10T21:11:24.2737531Z   ...
2026-10-10T21:11:24.2739062Z # Subtest: UC-006 3b: an entry whose heading another entry of its queue creates lists what names a requirement it leaves out
2026-10-10T21:11:24.2740884Z ok 214 - UC-006 3b: an entry whose heading another entry of its queue creates lists what names a requirement it leaves out
2026-10-10T21:11:24.2742034Z   ---
2026-10-10T21:11:24.2742593Z   duration_ms: 62.058568
2026-10-10T21:11:24.2743219Z   type: 'test'
2026-10-10T21:11:24.2743770Z   ...
2026-10-10T21:11:24.2745138Z # Subtest: UC-006 3b: the requests one load of an entry makes, with an empty and with a kept file cache
2026-10-10T21:11:24.2746786Z ok 215 - UC-006 3b: the requests one load of an entry makes, with an empty and with a kept file cache
2026-10-10T21:11:24.2747897Z   ---
2026-10-10T21:11:24.2748526Z   duration_ms: 230.407839
2026-10-10T21:11:24.2749129Z   type: 'test'
2026-10-10T21:11:24.2749669Z   ...
2026-10-10T21:11:24.2753274Z # SPEC entry 02: cold 8 requests (6 files, 0 of them use cases, architecture or tests); warm 8 (commit, tree, file docs/spec-freigaben/2026-10-01_rules/index.md, file docs/spec-freigaben/2026-10-01_rules/entscheidungen.md, file docs/spec-freigaben/2026-10-01_rules/01-one.md, file SPEC.md, file docs/spec-freigaben/2026-10-01_rules/02-new.md, file docs/spec-freigaben/2026-10-01_rules/03-two.md)
2026-10-10T21:11:24.2762248Z # SPEC entry 01: cold 16 requests (14 files, 7 of them use cases, architecture or tests); warm 16 (commit, tree, file docs/spec-freigaben/2026-10-01_rules/index.md, file docs/spec-freigaben/2026-10-01_rules/entscheidungen.md, file docs/spec-freigaben/2026-10-01_rules/01-one.md, file SPEC.md, file docs/spec-freigaben/2026-10-01_rules/02-new.md, file docs/spec-freigaben/2026-10-01_rules/03-two.md, file docs/spec-freigaben/2026-10-01_rules/01-one.begruendung.md, file docs/architecture/ARC-001-static.md, file docs/architecture/MOD-reader.md, file docs/use-cases/UC-001-one.md, file docs/use-cases/UC-002-two.md, file docs/use-cases/UC-003-three.md, file tests/one.test.mjs, file tests/three.test.mjs)
2026-10-10T21:11:24.2768026Z # Subtest: the fixture resolves its actual current head but refuses an unknown SHA
2026-10-10T21:11:24.2769394Z ok 216 - the fixture resolves its actual current head but refuses an unknown SHA
2026-10-10T21:11:24.2770348Z   ---
2026-10-10T21:11:24.2770962Z   duration_ms: 43.16992
2026-10-10T21:11:24.2771393Z   type: 'test'
2026-10-10T21:11:24.2771733Z   ...
2026-10-10T21:11:24.2772478Z # Subtest: \#spec composes the pinned requirements view with the open SPEC changes
2026-10-10T21:11:24.2773593Z ok 217 - \#spec composes the pinned requirements view with the open SPEC changes
2026-10-10T21:11:24.2774283Z   ---
2026-10-10T21:11:24.2774614Z   duration_ms: 203.842069
2026-10-10T21:11:24.2775196Z   type: 'test'
2026-10-10T21:11:24.2775531Z   ...
2026-10-10T21:11:24.2776662Z # Subtest: TST-268001: production compose registers endpoint-test with pairing, origin, loopback, and secret boundaries intact
2026-10-10T21:11:24.2778429Z ok 218 - TST-268001: production compose registers endpoint-test with pairing, origin, loopback, and secret boundaries intact
2026-10-10T21:11:24.2779406Z   ---
2026-10-10T21:11:24.2779732Z   duration_ms: 62.051406
2026-10-10T21:11:24.2780116Z   type: 'test'
2026-10-10T21:11:24.2780446Z   ...
2026-10-10T21:11:25.7023607Z # native-fixture {"stage":"Electron package acquisition","status":0,"signal":null,"error":null,"stdout":"\\nadded 13 packages in 2s\\n\\n1 package is looking for funding\\n  run `npm fund` for details\\n","stderr":""}
2026-10-10T21:11:25.7025969Z # native-fixture {"stage":"Electron binary acquisition","status":0,"signal":null,"error":null,"stdout":"","stderr":""}
2026-10-10T21:11:25.7036369Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:25.7045667Z # native-fixture {"stage":"Linux Openbox initial probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:25.7139535Z # native-fixture {"stage":"Linux Openbox diagnostic plan","status":0,"signal":null,"error":null,"elapsedMs":3308,"stdout":"Reading package lists...\\nBuilding dependency tree...\\nReading state information...\\nThe following additional packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 poppler-data xfonts-encodings\\n  xfonts-utils\\nSuggested packages:\\n  fonts-freefont-otf | fonts-freefont-ttf fonts-texgyre librsvg2-bin tint2\\n  openbox-gnome-session openbox-kde-session poppler-utils ghostscript\\n  fonts-japanese-mincho | fonts-ipafont-mincho fonts-japanese-gothic\\n  | fonts-ipafont-gothic fonts-arphic-ukai fonts-arphic-uming fonts-nanum\\nRecommended packages:\\n  fonts-droid-fallback libpaper-utils librsvg2-common obconf | obconf-qt scrot\\nThe following NEW packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 openbox poppler-data xfonts-encodings\\n  xfonts-utils\\n0 upgraded, 24 newly installed, 0 to remove and 6 not upgraded.\\nNeed to get 22.9 MB of archives.\\nAfter this operation, 75.6 MB of additional disk space will be used.\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/p/poppler-data/poppler-data_0.4.12-1_all.deb' poppler-data_0.4.12-1_all.deb 2059856 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb' xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb 578092 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb' xfonts-utils_1%3a7.7+6build3_amd64.deb 94438 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/f/fonts-urw-base35/fonts-urw-base35_20200910-8_all.deb' fonts-urw-base35_20200910-8_all.deb 10968180 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/giflib/libgif7_5.2.2-1ubuntu1.2_amd64.deb' libgif7_5.2.2-1ubuntu1.2_amd64.deb 35608 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/ghostscript/libgs-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb' libgs-common_10.02.1~dfsg1-0ubuntu7.9_all.deb 176148 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/ghostscript/libgs10-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb' libgs10-common_10.02.1~dfsg1-0ubuntu7.9_all.deb 487964 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libi/libidn/libidn12_1.42-1ubuntu0.1_amd64.deb' libidn12_1.42-1ubuntu0.1_amd64.deb 56086 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/i/ijs/libijs-0.35_0.35-15.1build1_amd64.deb' libijs-0.35_0.35-15.1build1_amd64.deb 15318 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/j/jbig2dec/libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb' libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb 65214 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libp/libpaper/libpaper1_1.1.29build1_amd64.deb' libpaper1_1.1.29build1_amd64.deb 13414 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/g/ghostscript/libgs10_10.02.1%7edfsg1-0ubuntu7.9_amd64.deb' libgs10_10.02.1~dfsg1-0ubuntu7.9_amd64.deb 3897792 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/h/highway/libhwy1t64_1.0.7-8.1build1_amd64.deb' libhwy1t64_1.0.7-8.1build1_amd64.deb 584050 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/libi/libid3tag/libid3tag0_0.15.1b-14build1_amd64.deb' libid3tag0_0.15.1b-14build1_amd64.deb 33598 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/j/jpeg-xl/libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb' libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb 1001370 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libr/librsvg/librsvg2-2_2.58.0%2bdfsg-1build1_amd64.deb' librsvg2-2_2.58.0+dfsg-1build1_amd64.deb 2135414 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/libs/libspectre/libspectre1_0.2.12-1build2_amd64.deb' libspectre1_0.2.12-1build2_amd64.deb 30900 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/i/imlib2/libimlib2t64_1.12.1-1.1build2_amd64.deb' libimlib2t64_1.12.1-1.1build2_amd64.deb 207528 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/o/openbox/libobt2v5_3.6.1-12build5_amd64.deb' libobt2v5_3.6.1-12build5_amd64.deb 33324 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/p/pango1.0/libpangoxft-1.0-0_1.52.1%2bds-1build1_amd64.deb' libpangoxft-1.0-0_1.52.1+ds-1build1_amd64.deb 20272 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/o/openbox/libobrender32v5_3.6.1-12build5_amd64.deb' libobrender32v5_3.6.1-12build5_amd64.deb 42454 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/x/xcb-util/libxcb-util1_0.4.0-1build3_amd64.deb' libxcb-util1_0.4.0-1build3_amd64.deb 10678 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/main/s/startup-notification/libstartup-notification0_0.12-6build3_amd64.deb' libstartup-notification0_0.12-6build3_amd64.deb 18444 MD5Sum:[redacted]\\n'mirror+file:/etc/apt/apt-mirrors.txt/pool/universe/o/openbox/openbox_3.6.1-12build5_amd64.deb' openbox_3.6.1-12build5_amd64.deb 304440 MD5Sum:[redacted]\\n","stderr":"","packages":[{"transport":"mirror+file","filename":"poppler-data_0.4.12-1_all.deb","bytes":2059856,"md5":"c3aad80a7d501871f9e24fa9c6540998","digest":"c3aad80a7d501871f9e24fa9c6540998"},{"transport":"mirror+file","filename":"xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb","bytes":578092,"md5":"b7e27ff04dca332645f9acfcc8492237","digest":"b7e27ff04dca332645f9acfcc8492237"},{"transport":"mirror+file","filename":"xfonts-utils_1%3a7.7+6build3_amd64.deb","bytes":94438,"md5":"13b0675cc33bcd650f3e169c049cf670","digest":"13b0675cc33bcd650f3e169c049cf670"},{"transport":"mirror+file","filename":"fonts-urw-base35_20200910-8_all.deb","bytes":10968180,"md5":"c5e4cff568d83e11974a5462ffcaf851","digest":"c5e4cff568d83e11974a5462ffcaf851"},{"transport":"mirror+file","filename":"libgif7_5.2.2-1ubuntu1.2_amd64.deb","bytes":35608,"md5":"9bda8aae90439df1e038d133c9d9d469","digest":"9bda8aae90439df1e038d133c9d9d469"},{"transport":"mirror+file","filename":"libgs-common_10.02.1~dfsg1-0ubuntu7.9_all.deb","bytes":176148,"md5":"6852c1014d594050a33e25e1a6b274b3","digest":"6852c1014d594050a33e25e1a6b274b3"},{"transport":"mirror+file","filename":"libgs10-common_10.02.1~dfsg1-0ubuntu7.9_all.deb","bytes":487964,"md5":"4597efb9adaac038d0cd01c68520027a","digest":"4597efb9adaac038d0cd01c68520027a"},{"transport":"mirror+file","filename":"libidn12_1.42-1ubuntu0.1_amd64.deb","bytes":56086,"md5":"eb19310b82249d936f21e8dba37f68ae","digest":"eb19310b82249d936f21e8dba37f68ae"},{"transport":"mirror+file","filename":"libijs-0.35_0.35-15.1build1_amd64.deb","bytes":15318,"md5":"e6189d1148591eb2897e1500dde1ef2c","digest":"e6189d1148591eb2897e1500dde1ef2c"},{"transport":"mirror+file","filename":"libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb","bytes":65214,"md5":"39e2077f32a5b1e4d68087292dfd21d2","digest":"39e2077f32a5b1e4d68087292dfd21d2"},{"transport":"mirror+file","filename":"libpaper1_1.1.29build1_amd64.deb","bytes":13414,"md5":"c2f5a7ccf8a5ad5b96ac24d4657029c6","digest":"c2f5a7ccf8a5ad5b96ac24d4657029c6"},{"transport":"mirror+file","filename":"libgs10_10.02.1~dfsg1-0ubuntu7.9_amd64.deb","bytes":3897792,"md5":"b88e49f7caca690d85ab66f357304eda","digest":"b88e49f7caca690d85ab66f357304eda"},{"transport":"mirror+file","filename":"libhwy1t64_1.0.7-8.1build1_amd64.deb","bytes":584050,"md5":"96f46ff55f48790604d8bddefbe3d3e7","digest":"96f46ff55f48790604d8bddefbe3d3e7"},{"transport":"mirror+file","filename":"libid3tag0_0.15.1b-14build1_amd64.deb","bytes":33598,"md5":"1d246f1b0b12d5ab631843217bcace97","digest":"1d246f1b0b12d5ab631843217bcace97"},{"transport":"mirror+file","filename":"libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb","bytes":1001370,"md5":"fc7f390b8fd86a738789851017e84c6d","digest":"fc7f390b8fd86a738789851017e84c6d"},{"transport":"mirror+file","filename":"librsvg2-2_2.58.0+dfsg-1build1_amd64.deb","bytes":2135414,"md5":"b5016935a267e59d61a78a6deb53d8a6","digest":"b5016935a267e59d61a78a6deb53d8a6"},{"transport":"mirror+file","filename":"libspectre1_0.2.12-1build2_amd64.deb","bytes":30900,"md5":"de8ab642c44ac9c41b979f4ed73fae6a","digest":"de8ab642c44ac9c41b979f4ed73fae6a"},{"transport":"mirror+file","filename":"libimlib2t64_1.12.1-1.1build2_amd64.deb","bytes":207528,"md5":"4c392073aad241727c51dc82a84a20ba","digest":"4c392073aad241727c51dc82a84a20ba"},{"transport":"mirror+file","filename":"libobt2v5_3.6.1-12build5_amd64.deb","bytes":33324,"md5":"041e109bae276e3f4b031608dad52256","digest":"041e109bae276e3f4b031608dad52256"},{"transport":"mirror+file","filename":"libpangoxft-1.0-0_1.52.1+ds-1build1_amd64.deb","bytes":20272,"md5":"35053c3a8f97c33497e2e68e218140a6","digest":"35053c3a8f97c33497e2e68e218140a6"},{"transport":"mirror+file","filename":"libobrender32v5_3.6.1-12build5_amd64.deb","bytes":42454,"md5":"e8edef2dcae7d3cf5c10da4dd2184c6b","digest":"e8edef2dcae7d3cf5c10da4dd2184c6b"},{"transport":"mirror+file","filename":"libxcb-util1_0.4.0-1build3_amd64.deb","bytes":10678,"md5":"ceec9bf67b5c5f81fec8d8ae9e09ea61","digest":"ceec9bf67b5c5f81fec8d8ae9e09ea61"},{"transport":"mirror+file","filename":"libstartup-notification0_0.12-6build3_amd64.deb","bytes":18444,"md5":"7cc3b69df45e4c2ea7684e6793b01698","digest":"7cc3b69df45e4c2ea7684e6793b01698"},{"transport":"mirror+file","filename":"openbox_3.6.1-12build5_amd64.deb","bytes":304440,"md5":"7098defb6a06b6c4361700f86edd6448","digest":"7098defb6a06b6c4361700f86edd6448"}],"mirrors":["http://azure.archive.ubuntu.com/ubuntu/","https://archive.ubuntu.com/ubuntu/"],"observation":"font-uri-not-direct-http"}
2026-10-10T21:11:35.6840702Z # native-fixture {"stage":"Linux Openbox install","status":0,"signal":null,"error":null,"stdout":"Reading package lists...\\nBuilding dependency tree...\\nReading state information...\\nThe following additional packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 poppler-data xfonts-encodings\\n  xfonts-utils\\nSuggested packages:\\n  fonts-freefont-otf | fonts-freefont-ttf fonts-texgyre librsvg2-bin tint2\\n  openbox-gnome-session openbox-kde-session poppler-utils ghostscript\\n  fonts-japanese-mincho | fonts-ipafont-mincho fonts-japanese-gothic\\n  | fonts-ipafont-gothic fonts-arphic-ukai fonts-arphic-uming fonts-nanum\\nRecommended packages:\\n  fonts-droid-fallback libpaper-utils librsvg2-common obconf | obconf-qt scrot\\nThe following NEW packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 openbox poppler-data xfonts-encodings\\n  xfonts-utils\\n0 upgraded, 24 newly installed, 0 to remove and 6 not upgraded.\\nNeed to get 22.9 MB of archives.\\nAfter this operation, 75.6 MB of additional disk space will be used.\\nGet:1 file:/etc/apt/apt-mirrors.txt Mirrorlist [144 B]\\nGet:2 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 poppler-data all 0.4.12-1 [2060 kB]\\nGet:3 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 xfonts-encodings all 1:1.0.5-0ubuntu2 [578 kB]\\nGet:4 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 xfonts-utils amd64 1:7.7+6build3 [94.4 kB]\\nGet:5 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 fonts-urw-base35 all 20200910-8 [11.0 MB]\\nGet:6 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgif7 amd64 5.2.2-1ubuntu1.2 [35.6 kB]\\nGet:7 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgs-common all 10.02.1~dfsg1-0ubuntu7.9 [176 kB]\\nGet:8 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgs10-common all 10.02.1~dfsg1-0ubuntu7.9 [488 kB]\\nGet:9 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libidn12 amd64 1.42-1ubuntu0.1 [56.1 kB]\\nGet:10 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libijs-0.35 amd64 0.35-15.1build1 [15.3 kB]\\nGet:11 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libjbig2dec0 amd64 0.20-1ubuntu0.24.04.1 [65.2 kB]\\nGet:12 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libpaper1 amd64 1.1.29build1 [13.4 kB]\\nGet:13 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 libgs10 amd64 10.02.1~dfsg1-0ubuntu7.9 [3898 kB]\\nGet:14 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libhwy1t64 amd64 1.0.7-8.1build1 [584 kB]\\nGet:15 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libid3tag0 amd64 0.15.1b-14build1 [33.6 kB]\\nGet:16 http://azure.archive.ubuntu.com/ubuntu noble-updates/universe amd64 libjxl0.7 amd64 0.7.0-10.2ubuntu6.1 [1001 kB]\\nGet:17 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 librsvg2-2 amd64 2.58.0+dfsg-1build1 [2135 kB]\\nGet:18 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libspectre1 amd64 0.2.12-1build2 [30.9 kB]\\nGet:19 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libimlib2t64 amd64 1.12.1-1.1build2 [208 kB]\\nGet:20 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libobt2v5 amd64 3.6.1-12build5 [33.3 kB]\\nGet:21 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libpangoxft-1.0-0 amd64 1.52.1+ds-1build1 [20.3 kB]\\nGet:22 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 libobrender32v5 amd64 3.6.1-12build5 [42.5 kB]\\nGet:23 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libxcb-util1 amd64 0.4.0-1build3 [10.7 kB]\\nGet:24 http://azure.archive.ubuntu.com/ubuntu noble/main amd64 libstartup-notification0 amd64 0.12-6build3 [18.4 kB]\\nGet:25 http://azure.archive.ubuntu.com/ubuntu noble/universe amd64 openbox amd64 3.6.1-12build5 [304 kB]\\nPreconfiguring packages ...\\nFetched 22.9 MB in 1s (30.3 MB/s)\\nSelecting previously unselected package poppler-data.\\r\\n(Reading database ... \\r(Reading database ... 5%\\r(Reading database ... 10%\\r(Reading database ... 15%\\r(Reading database ... 20%\\r(Reading database ... 25%\\r(Reading database ... 30%\\r(Reading database ... 35%\\r(Reading database ... 40%\\r(Reading database ... 45%\\r(Reading database ... 50%\\r(Reading database ... 55%\\r(Reading database ... 60%\\r(Reading database ... 65%\\r(Reading database ... 70%\\r(Reading database ... 75%\\r(Reading database ... 80%\\r(Reading database ... 85%\\r(Reading database ... 90%\\r(Reading database ... 95%\\r(Reading database ... 100%\\r(Reading database ... 203191 files and directories currently installed.)\\r\\nPreparing to unpack .../00-poppler-data_0.4.12-1_all.deb ...\\r\\nUnpacking poppler-data (0.4.12-1) ...\\r\\nSelecting previously unselected package xfonts-encodings.\\r\\nPreparing to unpack .../01-xfonts-encodings_1%3a1.0.5-0ubuntu2_all.deb ...\\r\\nUnpacking xfonts-encodings (1:1.0.5-0ubuntu2) ...\\r\\nSelecting previously unselected package xfonts-utils.\\r\\nPreparing to unpack .../02-xfonts-utils_1%3a7.7+6build3_amd64.deb ...\\r\\nUnpacking xfonts-utils (1:7.7+6build3) ...\\r\\nSelecting previously unselected package fonts-urw-base35.\\r\\nPreparing to unpack .../[redacted].deb ...\\r\\nUnpacking fonts-urw-base35 (20200910-8) ...\\r\\nSelecting previously unselected package libgif7:amd64.\\r\\nPreparing to unpack .../04-libgif7_5.2.2-1ubuntu1.2_amd64.deb ...\\r\\nUnpacking libgif7:amd64 (5.2.2-1ubuntu1.2) ...\\r\\nSelecting previously unselected package libgs-common.\\r\\nPreparing to unpack .../05-libgs-common_10.02.1~dfsg1-0ubuntu7.9_all.deb ...\\r\\nUnpacking libgs-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSelecting previously unselected package libgs10-common.\\r\\nPreparing to unpack .../06-libgs10-common_10.02.1~dfsg1-0ubuntu7.9_all.deb ...\\r\\nUnpacking libgs10-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSelecting previously unselected package libidn12:amd64.\\r\\nPreparing to unpack .../07-libidn12_1.42-1ubuntu0.1_amd64.deb ...\\r\\nUnpacking libidn12:amd64 (1.42-1ubuntu0.1) ...\\r\\nSelecting previously unselected package libijs-0.35:amd64.\\r\\nPreparing to unpack .../08-libijs-0.35_0.35-15.1build1_amd64.deb ...\\r\\nUnpacking libijs-0.35:amd64 (0.35-15.1build1) ...\\r\\nSelecting previously unselected package libjbig2dec0:amd64.\\r\\nPreparing to unpack .../09-libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb ...\\r\\nUnpacking libjbig2dec0:amd64 (0.20-1ubuntu0.24.04.1) ...\\r\\nSelecting previously unselected package libpaper1:amd64.\\r\\nPreparing to unpack .../10-libpaper1_1.1.29build1_amd64.deb ...\\r\\nUnpacking libpaper1:amd64 (1.1.29build1) ...\\r\\nSelecting previously unselected package libgs10:amd64.\\r\\nPreparing to unpack .../11-libgs10_10.02.1~dfsg1-0ubuntu7.9_amd64.deb ...\\r\\nUnpacking libgs10:amd64 (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSelecting previously unselected package libhwy1t64:amd64.\\r\\nPreparing to unpack .../12-libhwy1t64_1.0.7-8.1build1_amd64.deb ...\\r\\nUnpacking libhwy1t64:amd64 (1.0.7-8.1build1) ...\\r\\nSelecting previously unselected package libid3tag0:amd64.\\r\\nPreparing to unpack .../13-libid3tag0_0.15.1b-14build1_amd64.deb ...\\r\\nUnpacking libid3tag0:amd64 (0.15.1b-14build1) ...\\r\\nSelecting previously unselected package libjxl0.7:amd64.\\r\\nPreparing to unpack .../14-libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb ...\\r\\nUnpacking libjxl0.7:amd64 (0.7.0-10.2ubuntu6.1) ...\\r\\nSelecting previously unselected package librsvg2-2:amd64.\\r\\nPreparing to unpack .../15-librsvg2-2_2.58.0+dfsg-1build1_amd64.deb ...\\r\\nUnpacking librsvg2-2:amd64 (2.58.0+dfsg-1build1) ...\\r\\nSelecting previously unselected package libspectre1:amd64.\\r\\nPreparing to unpack .../16-libspectre1_0.2.12-1build2_amd64.deb ...\\r\\nUnpacking libspectre1:amd64 (0.2.12-1build2) ...\\r\\nSelecting previously unselected package libimlib2t64:amd64.\\r\\nPreparing to unpack .../17-libimlib2t64_1.12.1-1.1build2_amd64.deb ...\\r\\nUnpacking libimlib2t64:amd64 (1.12.1-1.1build2) ...\\r\\nSelecting previously unselected package libobt2v5:amd64.\\r\\nPreparing to unpack .../18-libobt2v5_3.6.1-12build5_amd64.deb ...\\r\\nUnpacking libobt2v5:amd64 (3.6.1-12build5) ...\\r\\nSelecting previously unselected package libpangoxft-1.0-0:amd64.\\r\\nPreparing to unpack .../19-libpangoxft-1.0-0_1.52.1+ds-1build1_amd64.deb ...\\r\\nUnpacking libpangoxft-1.0-0:amd64 (1.52.1+ds-1build1) ...\\r\\nSelecting previously unselected package libobrender32v5.\\r\\nPreparing to unpack .../20-libobrender32v5_3.6.1-12build5_amd64.deb ...\\r\\nUnpacking libobrender32v5 (3.6.1-12build5) ...\\r\\nSelecting previously unselected package libxcb-util1:amd64.\\r\\nPreparing to unpack .../21-libxcb-util1_0.4.0-1build3_amd64.deb ...\\r\\nUnpacking libxcb-util1:amd64 (0.4.0-1build3) ...\\r\\nSelecting previously unselected package libstartup-notification0:amd64.\\r\\nPreparing to unpack .../22-libstartup-notification0_0.12-6build3_amd64.deb ...\\r\\nUnpacking libstartup-notification0:amd64 (0.12-6build3) ...\\r\\nSelecting previously unselected package openbox.\\r\\nPreparing to unpack .../23-openbox_3.6.1-12build5_amd64.deb ...\\r\\nUnpacking openbox (3.6.1-12build5) ...\\r\\nSetting up libhwy1t64:amd64 (1.0.7-8.1build1) ...\\r\\nSetting up libpaper1:amd64 (1.1.29build1) ...\\r\\n\\r\\nCreating config file /etc/papersize with new version\\r\\nSetting up libpangoxft-1.0-0:amd64 (1.52.1+ds-1build1) ...\\r\\nSetting up libijs-0.35:amd64 (0.35-15.1build1) ...\\r\\nSetting up libgs-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSetting up libxcb-util1:amd64 (0.4.0-1build3) ...\\r\\nSetting up poppler-data (0.4.12-1) ...\\r\\nSetting up librsvg2-2:amd64 (2.58.0+dfsg-1build1) ...\\r\\nSetting up libid3tag0:amd64 (0.15.1b-14build1) ...\\r\\nSetting up libjbig2dec0:amd64 (0.20-1ubuntu0.24.04.1) ...\\r\\nSetting up xfonts-encodings (1:1.0.5-0ubuntu2) ...\\r\\nSetting up libidn12:amd64 (1.42-1ubuntu0.1) ...\\r\\nSetting up libobt2v5:amd64 (3.6.1-12build5) ...\\r\\nSetting up libjxl0.7:amd64 (0.7.0-10.2ubuntu6.1) ...\\r\\nSetting up libgif7:amd64 (5.2.2-1ubuntu1.2) ...\\r\\nSetting up libstartup-notification0:amd64 (0.12-6build3) ...\\r\\nSetting up xfonts-utils (1:7.7+6build3) ...\\r\\nSetting up fonts-urw-base35 (20200910-8) ...\\r\\nSetting up libgs10-common (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSetting up libgs10:amd64 (10.02.1~dfsg1-0ubuntu7.9) ...\\r\\nSetting up libspectre1:amd64 (0.2.12-1build2) ...\\r\\nSetting up libimlib2t64:amd64 (1.12.1-1.1build2) ...\\r\\nSetting up libobrender32v5 (3.6.1-12build5) ...\\r\\nSetting up openbox (3.6.1-12build5) ...\\r\\nupdate-alternatives: using /usr/bin/openbox to provide /usr/bin/x-window-manager (x-window-manager) in auto mode\\r\\nupdate-alternatives: using /usr/bin/openbox-session to provide /usr/bin/x-session-manager (x-session-manager) in auto mode\\r\\nProcessing triggers for libc-bin (2.39-0ubuntu8.9) ...\\r\\nProcessing triggers for man-db (2.12.0-4build2) ...\\r\\nNot building database; man-db/auto-update is not 'true'.\\r\\nProcessing triggers for fontconfig (2.15.0-1.1ubuntu2) ...\\r\\n","stderr":"GET /ubuntu/pool/main/p/poppler-data/poppler-data_0.4.12-1_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/p/poppler-data/poppler-data_0.4.12-1_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 09 Feb 2023 17:45:19 GMT\\r\\nETag: \\"1f6e50-5f447f1c65370\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 2059856\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 24 Mar 2022 09:09:07 GMT\\r\\nETag: \\"8d22c-5daf332c4f03f\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 578092\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 18:39:31 GMT\\r\\nETag: \\"170e6-6159a204ab88b\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 94438\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/f/fonts-urw-base35/fonts-urw-base35_20200910-8_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/f/fonts-urw-base35/fonts-urw-base35_20200910-8_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Fri, 01 Mar 2024 05:58:37 GMT\\r\\nETag: \\"a75c74-6129311282be2\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 10968180\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/giflib/libgif7_5.2.2-1ubuntu1.2_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/giflib/libgif7_5.2.2-1ubuntu1.2_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Wed, 22 Jul 2026 12:43:42 GMT\\r\\nETag: \\"8b18-657327d4ec4e1\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 35608\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/ghostscript/libgs-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/ghostscript/libgs-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 21 Sep 2026 12:50:32 GMT\\r\\nETag: \\"2b014-65bfdb20f2297\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 176148\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/ghostscript/libgs10-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/ghostscript/libgs10-common_10.02.1%7edfsg1-0ubuntu7.9_all.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 21 Sep 2026 12:50:32 GMT\\r\\nETag: \\"7721c-65bfdb20ca1f5\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 487964\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libi/libidn/libidn12_1.42-1ubuntu0.1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libi/libidn/libidn12_1.42-1ubuntu0.1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 09 Jul 2026 12:38:37 GMT\\r\\nETag: \\"db16-6562ce72ec187\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 56086\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/i/ijs/libijs-0.35_0.35-15.1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/i/ijs/libijs-0.35_0.35-15.1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 17:03:23 GMT\\r\\nETag: \\"3bd6-61598c87c5057\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 15318\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/j/jbig2dec/libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/j/jbig2dec/libjbig2dec0_0.20-1ubuntu0.24.04.1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Tue, 21 Jul 2026 17:44:59 GMT\\r\\nETag: \\"febe-6572294ec0d45\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 65214\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libp/libpaper/libpaper1_1.1.29build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libp/libpaper/libpaper1_1.1.29build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 17:03:04 GMT\\r\\nETag: \\"3466-61598c7602197\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 13414\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/g/ghostscript/libgs10_10.02.1%7edfsg1-0ubuntu7.9_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/g/ghostscript/libgs10_10.02.1%7edfsg1-0ubuntu7.9_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 21 Sep 2026 12:50:33 GMT\\r\\nETag: \\"3b79c0-65bfdb21f0121\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 3897792\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/h/highway/libhwy1t64_1.0.7-8.1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/h/highway/libhwy1t64_1.0.7-8.1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 20:36:26 GMT\\r\\nETag: \\"8e972-614fad3b184cc\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 584050\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/libi/libid3tag/libid3tag0_0.15.1b-14build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/libi/libid3tag/libid3tag0_0.15.1b-14build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Thu, 18 Apr 2024 20:58:21 GMT\\r\\nETag: \\"833e-616653b3f6e34\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 33598\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/j/jpeg-xl/libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/j/jpeg-xl/libjxl0.7_0.7.0-10.2ubuntu6.1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 14 Jul 2025 16:22:38 GMT\\r\\nETag: \\"f479a-639e611705877\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 1001370\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libr/librsvg/librsvg2-2_2.58.0%2bdfsg-1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libr/librsvg/librsvg2-2_2.58.0%2bdfsg-1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 03:26:37 GMT\\r\\nETag: \\"209576-614ec70c8cfb8\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 2135414\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/libs/libspectre/libspectre1_0.2.12-1build2_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/libs/libspectre/libspectre1_0.2.12-1build2_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 17:03:01 GMT\\r\\nETag: \\"78b4-61598c7324b18\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 30900\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/i/imlib2/libimlib2t64_1.12.1-1.1build2_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/i/imlib2/libimlib2t64_1.12.1-1.1build2_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 19:32:49 GMT\\r\\nETag: \\"32aa8-614f9f02e8888\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 207528\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/o/openbox/libobt2v5_3.6.1-12build5_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/o/openbox/libobt2v5_3.6.1-12build5_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 15:20:35 GMT\\r\\nETag: \\"822c-6159758de4511\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 33324\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/p/pango1.0/libpangoxft-1.0-0_1.52.1%2bds-1build1_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/p/pango1.0/libpangoxft-1.0-0_1.52.1%2bds-1build1_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Sun, 31 Mar 2024 18:38:03 GMT\\r\\nETag: \\"4f30-614f92c54da0b\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 20272\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/o/openbox/libobrender32v5_3.6.1-12build5_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/o/openbox/libobrender32v5_3.6.1-12build5_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:26 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 15:20:35 GMT\\r\\nETag: \\"a5d6-6159758dee152\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 42454\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/x/xcb-util/libxcb-util1_0.4.0-1build3_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/x/xcb-util/libxcb-util1_0.4.0-1build3_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:27 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 18:39:29 GMT\\r\\nETag: \\"29b6-6159a2034906f\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 10678\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/main/s/startup-notification/libstartup-notification0_0.12-6build3_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/main/s/startup-notification/libstartup-notification0_0.12-6build3_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:27 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 19:24:15 GMT\\r\\nETag: \\"480c-6159ac04f07a5\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 18444\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\nGET /ubuntu/pool/universe/o/openbox/openbox_3.6.1-12build5_amd64.deb HTTP/1.1\\r\\nHost: azure.archive.ubuntu.com\\r\\nCache-Control: no-cache\\r\\nPragma: no-cache\\r\\nUser-Agent: Debian APT-HTTP/1.3 (2.8.3) non-interactive\\r\\n\\r\\n\\nAnswer for: http://azure.archive.ubuntu.com/ubuntu/pool/universe/o/openbox/openbox_3.6.1-12build5_amd64.deb\\nHTTP/1.1 200 OK\\r\\nDate: Sat, 10 Oct 2026 21:11:27 GMT\\r\\nServer: Apache/2.4.52 (Ubuntu)\\r\\nLast-Modified: Mon, 08 Apr 2024 15:20:35 GMT\\r\\nETag: \\"4a538-6159758ddb871\\"\\r\\nAccept-Ranges: bytes\\r\\nContent-Length: 304440\\r\\nCache-Control: max-age=86400\\r\\nContent-Type: application/vnd.debian.binary-package\\r\\n\\r\\n\\nRunning kernel seems to be up-to-date.\\n\\nNo services need to be restarted.\\n\\nNo containers need to be restarted.\\n\\nNo user sessions are running outdated binaries.\\n\\nNo VM guests are running outdated hypervisor (qemu) binaries on this host.\\n"}
2026-10-10T21:11:35.7010727Z # native-fixture {"stage":"Linux Openbox ready probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:35.7014714Z # native-fixture {"stage":"ready","electron":"44.5.1","executable":"/tmp/agent-m-276-component-electron-44/node_modules/electron/dist/electron"}
2026-10-10T21:11:35.7083882Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:35.7227424Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:36.9316634Z # Subtest: TST-276001: the actual Electron entry renders its forked pairing page and rotates its token
2026-10-10T21:11:36.9346223Z ok 219 - TST-276001: the actual Electron entry renders its forked pairing page and rotates its token
2026-10-10T21:11:36.9349932Z   ---
2026-10-10T21:11:36.9350698Z   duration_ms: 1241.409696
2026-10-10T21:11:36.9351273Z   type: 'test'
2026-10-10T21:11:36.9352152Z   ...
2026-10-10T21:11:36.9431115Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:36.9627219Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:38.0566428Z # Subtest: TST-276002: pause refuses new work, resume restores the real server refusal, and Quit stops it
2026-10-10T21:11:38.0595991Z ok 220 - TST-276002: pause refuses new work, resume restores the real server refusal, and Quit stops it
2026-10-10T21:11:38.0625366Z   ---
2026-10-10T21:11:38.0625828Z   duration_ms: 1129.430724
2026-10-10T21:11:38.0655334Z   type: 'test'
2026-10-10T21:11:38.0685356Z   ...
2026-10-10T21:11:38.0808333Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:38.1013841Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:39.1196705Z # Subtest: TST-276003: an occupied port is visible and its replacement starts the same real composition
2026-10-10T21:11:39.1198794Z ok 221 - TST-276003: an occupied port is visible and its replacement starts the same real composition
2026-10-10T21:11:39.1200150Z   ---
2026-10-10T21:11:39.1200616Z   duration_ms: 1066.888604
2026-10-10T21:11:39.1201149Z   type: 'test'
2026-10-10T21:11:39.1201588Z   ...
2026-10-10T21:11:39.1424276Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:39.1643583Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:40.3396453Z # Subtest: TST-276004: an unwritable private folder is shown without starting a server
2026-10-10T21:11:40.3446013Z ok 222 - TST-276004: an unwritable private folder is shown without starting a server
2026-10-10T21:11:40.3475398Z   ---
2026-10-10T21:11:40.3475785Z   duration_ms: 1219.607789
2026-10-10T21:11:40.3476197Z   type: 'test'
2026-10-10T21:11:40.3476524Z   ...
2026-10-10T21:11:40.3644715Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:40.3871516Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:41.3586795Z # Subtest: TST-276006: the production default stores the instance token privately
2026-10-10T21:11:41.3606084Z ok 223 - TST-276006: the production default stores the instance token privately
2026-10-10T21:11:41.3610223Z   ---
2026-10-10T21:11:41.3610775Z   duration_ms: 1019.291376
2026-10-10T21:11:41.3611442Z   type: 'test'
2026-10-10T21:11:41.3612043Z   ...
2026-10-10T21:11:41.3874521Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:41.4149095Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:42.1721409Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:42.2158868Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:42.6485416Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:42.6646797Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:43.1356522Z # Subtest: TST-276005: native close behavior and a second source start restore the first window
2026-10-10T21:11:43.1376817Z ok 224 - TST-276005: native close behavior and a second source start restore the first window
2026-10-10T21:11:43.1414334Z   ---
2026-10-10T21:11:43.1445623Z   duration_ms: 1776.584614
2026-10-10T21:11:43.1475417Z   type: 'test'
2026-10-10T21:11:43.1505476Z   ...
2026-10-10T21:11:43.1706654Z # Subtest: loadSchema — reads the rule of a schema, a section, a value specification, a condition and a variant
2026-10-10T21:11:43.1758910Z ok 225 - loadSchema — reads the rule of a schema, a section, a value specification, a condition and a variant
2026-10-10T21:11:43.1760231Z   ---
2026-10-10T21:11:43.1778614Z   duration_ms: 4.184335
2026-10-10T21:11:43.1779365Z   type: 'test'
2026-10-10T21:11:43.1782002Z   ...
2026-10-10T21:11:43.1783571Z # Subtest: loadSchema — a rule that is not a requirement's name in capitals is refused with SchemaError naming its key
2026-10-10T21:11:43.1785903Z ok 226 - loadSchema — a rule that is not a requirement's name in capitals is refused with SchemaError naming its key
2026-10-10T21:11:43.1787402Z   ---
2026-10-10T21:11:43.1787928Z   duration_ms: 8.696623
2026-10-10T21:11:43.1788506Z   type: 'test'
2026-10-10T21:11:43.1789030Z   ...
2026-10-10T21:11:43.1790062Z # Subtest: documentFindings — a document that fits its schema has no finding
2026-10-10T21:11:43.1791400Z ok 227 - documentFindings — a document that fits its schema has no finding
2026-10-10T21:11:43.1792248Z   ---
2026-10-10T21:11:43.1792816Z   duration_ms: 4.950756
2026-10-10T21:11:43.1793400Z   type: 'test'
2026-10-10T21:11:43.1793952Z   ...
2026-10-10T21:11:43.1795256Z # Subtest: documentFindings — front matter keys missing, unknown and out of order
2026-10-10T21:11:43.1796691Z ok 228 - documentFindings — front matter keys missing, unknown and out of order
2026-10-10T21:11:43.1797583Z   ---
2026-10-10T21:11:43.1798104Z   duration_ms: 1.985187
2026-10-10T21:11:43.1798687Z   type: 'test'
2026-10-10T21:11:43.1799224Z   ...
2026-10-10T21:11:43.1800720Z # Subtest: documentFindings — front matter values: required or forbidden by a condition, empty where nonEmpty, not of their type
2026-10-10T21:11:43.1802904Z ok 229 - documentFindings — front matter values: required or forbidden by a condition, empty where nonEmpty, not of their type
2026-10-10T21:11:43.1804137Z   ---
2026-10-10T21:11:43.1804672Z   duration_ms: 1.7614
2026-10-10T21:11:43.1855471Z   type: 'test'
2026-10-10T21:11:43.1856090Z   ...
2026-10-10T21:11:43.1886598Z # Subtest: documentFindings — front matter values not of their type, and not of the variant that holds
2026-10-10T21:11:43.1906442Z ok 230 - documentFindings — front matter values not of their type, and not of the variant that holds
2026-10-10T21:11:43.1921725Z   ---
2026-10-10T21:11:43.1945641Z   duration_ms: 1.837853
2026-10-10T21:11:43.1975416Z   type: 'test'
2026-10-10T21:11:43.1995322Z   ...
2026-10-10T21:11:43.2026411Z # Subtest: documentFindings — each row of a table, cell by cell: required or forbidden by a condition, not of its type
2026-10-10T21:11:43.2028391Z ok 231 - documentFindings — each row of a table, cell by cell: required or forbidden by a condition, not of its type
2026-10-10T21:11:43.2055565Z   ---
2026-10-10T21:11:43.2085331Z   duration_ms: 0.874914
2026-10-10T21:11:43.2085816Z   type: 'test'
2026-10-10T21:11:43.2145402Z   ...
2026-10-10T21:11:43.2146429Z # Subtest: documentFindings — a cell empty where nonEmpty
2026-10-10T21:11:43.2175796Z ok 232 - documentFindings — a cell empty where nonEmpty
2026-10-10T21:11:43.2225517Z   ---
2026-10-10T21:11:43.2235450Z   duration_ms: 0.379098
2026-10-10T21:11:43.2255552Z   type: 'test'
2026-10-10T21:11:43.2285945Z   ...
2026-10-10T21:11:43.2296597Z # Subtest: documentFindings — cells not of the variant that holds for their row, and each cell's closest rule
2026-10-10T21:11:43.2298986Z ok 233 - documentFindings — cells not of the variant that holds for their row, and each cell's closest rule
2026-10-10T21:11:43.2300117Z   ---
2026-10-10T21:11:43.2300669Z   duration_ms: 1.233463
2026-10-10T21:11:43.2301245Z   type: 'test'
2026-10-10T21:11:43.2301769Z   ...
2026-10-10T21:11:43.2303211Z # Subtest: documentFindings — required sections missing, sections out of order, and a section the schema forbids
2026-10-10T21:11:43.2305687Z ok 234 - documentFindings — required sections missing, sections out of order, and a section the schema forbids
2026-10-10T21:11:43.2306872Z   ---
2026-10-10T21:11:43.2307394Z   duration_ms: 2.290128
2026-10-10T21:11:43.2307963Z   type: 'test'
2026-10-10T21:11:43.2308479Z   ...
2026-10-10T21:11:43.2309929Z # Subtest: documentFindings — a section the schema does not name is a finding only where the schema forbids other sections
2026-10-10T21:11:43.2312023Z ok 235 - documentFindings — a section the schema does not name is a finding only where the schema forbids other sections
2026-10-10T21:11:43.2313164Z   ---
2026-10-10T21:11:43.2313684Z   duration_ms: 1.640494
2026-10-10T21:11:43.2314240Z   type: 'test'
2026-10-10T21:11:43.2314725Z   ...
2026-10-10T21:11:43.2316583Z # Subtest: documentFindings — a value's finding names the condition's rule, then the variant's, the value's, the section's, the schema's
2026-10-10T21:11:43.2319311Z ok 236 - documentFindings — a value's finding names the condition's rule, then the variant's, the value's, the section's, the schema's
2026-10-10T21:11:43.2320535Z   ---
2026-10-10T21:11:43.2321041Z   duration_ms: 2.864941
2026-10-10T21:11:43.2321598Z   type: 'test'
2026-10-10T21:11:43.2322099Z   ...
2026-10-10T21:11:43.2323574Z # Subtest: documentFindings — of combined conditions, the first part that holds and names a rule, before the combination's
2026-10-10T21:11:43.2326056Z ok 237 - documentFindings — of combined conditions, the first part that holds and names a rule, before the combination's
2026-10-10T21:11:43.2355421Z   ---
2026-10-10T21:11:43.2355815Z   duration_ms: 2.309123
2026-10-10T21:11:43.2356246Z   type: 'test'
2026-10-10T21:11:43.2356610Z   ...
2026-10-10T21:11:43.2358048Z # Subtest: documentFindings — a front matter value's finding names the condition's rule, the variant's, the value's, the schema's
2026-10-10T21:11:43.2360189Z ok 238 - documentFindings — a front matter value's finding names the condition's rule, the variant's, the value's, the schema's
2026-10-10T21:11:43.2361239Z   ---
2026-10-10T21:11:43.2361617Z   duration_ms: 0.909809
2026-10-10T21:11:43.2362019Z   type: 'test'
2026-10-10T21:11:43.2362396Z   ...
2026-10-10T21:11:43.2363777Z # Subtest: documentFindings — a key the schema does not list, keys out of order and a forbidden section name the schema's rule
2026-10-10T21:11:43.2366357Z ok 239 - documentFindings — a key the schema does not list, keys out of order and a forbidden section name the schema's rule
2026-10-10T21:11:43.2367340Z   ---
2026-10-10T21:11:43.2367679Z   duration_ms: 0.481058
2026-10-10T21:11:43.2368296Z   type: 'test'
2026-10-10T21:11:43.2368652Z   ...
2026-10-10T21:11:43.2369829Z # Subtest: a section under the title — read with the title line as its heading, and written back byte for byte
2026-10-10T21:11:43.2371583Z ok 240 - a section under the title — read with the title line as its heading, and written back byte for byte
2026-10-10T21:11:43.2372558Z   ---
2026-10-10T21:11:43.2372913Z   duration_ms: 7.610865
2026-10-10T21:11:43.2373281Z   type: 'test'
2026-10-10T21:11:43.2373636Z   ...
2026-10-10T21:11:43.2375171Z # Subtest: loadSchema — a second section under the title, or one that is not the first, is refused with SchemaError
2026-10-10T21:11:43.2377085Z ok 241 - loadSchema — a second section under the title, or one that is not the first, is refused with SchemaError
2026-10-10T21:11:43.2378067Z   ---
2026-10-10T21:11:43.2378433Z   duration_ms: 1.169665
2026-10-10T21:11:43.2378850Z   type: 'test'
2026-10-10T21:11:43.2379280Z   ...
2026-10-10T21:11:43.2380306Z # Subtest: documentFindings — a required section under the title that is missing is named
2026-10-10T21:11:43.2381795Z ok 242 - documentFindings — a required section under the title that is missing is named
2026-10-10T21:11:43.2382600Z   ---
2026-10-10T21:11:43.2382952Z   duration_ms: 1.333961
2026-10-10T21:11:43.2383382Z   type: 'test'
2026-10-10T21:11:43.2383727Z   ...
2026-10-10T21:11:43.2384676Z # Subtest: a section's table is the first in it whose header row names exactly its columns, in their order
2026-10-10T21:11:43.2427490Z ok 243 - a section's table is the first in it whose header row names exactly its columns, in their order
2026-10-10T21:11:43.2428363Z   ---
2026-10-10T21:11:43.2428721Z   duration_ms: 0.91553
2026-10-10T21:11:43.2429115Z   type: 'test'
2026-10-10T21:11:43.2429455Z   ...
2026-10-10T21:11:43.2430275Z # Subtest: a table without a header row is the section's first table, its first line a row
2026-10-10T21:11:43.2431506Z ok 244 - a table without a header row is the section's first table, its first line a row
2026-10-10T21:11:43.2432274Z   ---
2026-10-10T21:11:43.2432629Z   duration_ms: 0.596274
2026-10-10T21:11:43.2433037Z   type: 'test'
2026-10-10T21:11:43.2433373Z   ...
2026-10-10T21:11:43.2434592Z # Subtest: loadSchema — a schema whose section and appended section name a field whose key holds spaces loads
2026-10-10T21:11:43.2436935Z ok 245 - loadSchema — a schema whose section and appended section name a field whose key holds spaces loads
2026-10-10T21:11:43.2437855Z   ---
2026-10-10T21:11:43.2438211Z   duration_ms: 2.671559
2026-10-10T21:11:43.2438607Z   type: 'test'
2026-10-10T21:11:43.2438948Z   ...
2026-10-10T21:11:43.2439668Z # Subtest: readDocument — such a line is read into that field
2026-10-10T21:11:43.2440623Z ok 246 - readDocument — such a line is read into that field
2026-10-10T21:11:43.2441203Z   ---
2026-10-10T21:11:43.2441537Z   duration_ms: 1.336066
2026-10-10T21:11:43.2441925Z   type: 'test'
2026-10-10T21:11:43.2442258Z   ...
2026-10-10T21:11:43.2442820Z # Subtest: appendSection — writes it as given
2026-10-10T21:11:43.2443563Z ok 247 - appendSection — writes it as given
2026-10-10T21:11:43.2444078Z   ---
2026-10-10T21:11:43.2444419Z   duration_ms: 1.560475
2026-10-10T21:11:43.2445066Z   type: 'test'
2026-10-10T21:11:43.2445437Z   ...
2026-10-10T21:11:43.2446665Z # Subtest: loadSchema — a *.schema.md file holds its schema as its one ```json block; noHistory is read and kept
2026-10-10T21:11:43.2448529Z ok 248 - loadSchema — a *.schema.md file holds its schema as its one ```json block; noHistory is read and kept
2026-10-10T21:11:43.2449504Z   ---
2026-10-10T21:11:43.2449886Z   duration_ms: 4.008758
2026-10-10T21:11:43.2450317Z   type: 'test'
2026-10-10T21:11:43.2450668Z   ...
2026-10-10T21:11:43.2451962Z # Subtest: loadSchema — the ```json block among other Markdown: CR LF line ends, a ```json example inside another fence
2026-10-10T21:11:43.2454198Z ok 249 - loadSchema — the ```json block among other Markdown: CR LF line ends, a ```json example inside another fence
2026-10-10T21:11:43.2485528Z   ---
2026-10-10T21:11:43.2485895Z   duration_ms: 1.213817
2026-10-10T21:11:43.2486314Z   type: 'test'
2026-10-10T21:11:43.2486678Z   ...
2026-10-10T21:11:43.2488047Z # Subtest: loadSchema — a schema file without its one ```json block holding an object throws SchemaError naming the owner
2026-10-10T21:11:43.2490103Z ok 250 - loadSchema — a schema file without its one ```json block holding an object throws SchemaError naming the owner
2026-10-10T21:11:43.2491119Z   ---
2026-10-10T21:11:43.2491491Z   duration_ms: 1.080979
2026-10-10T21:11:43.2491926Z   type: 'test'
2026-10-10T21:11:43.2492302Z   ...
2026-10-10T21:11:43.2493512Z # Subtest: loadSchema — a schema that breaks the language throws SchemaError naming the key and the owner
2026-10-10T21:11:43.2495488Z ok 251 - loadSchema — a schema that breaks the language throws SchemaError naming the key and the owner
2026-10-10T21:11:43.2496437Z   ---
2026-10-10T21:11:43.2496802Z   duration_ms: 7.068062
2026-10-10T21:11:43.2497211Z   type: 'test'
2026-10-10T21:11:43.2497549Z   ...
2026-10-10T21:11:43.2498720Z # Subtest: readDocument — a declaration read by its schema: front matter, tables, lists, free sections
2026-10-10T21:11:43.2500384Z ok 252 - readDocument — a declaration read by its schema: front matter, tables, lists, free sections
2026-10-10T21:11:43.2501272Z   ---
2026-10-10T21:11:43.2501622Z   duration_ms: 1.780325
2026-10-10T21:11:43.2502024Z   type: 'test'
2026-10-10T21:11:43.2502364Z   ...
2026-10-10T21:11:43.2503578Z # Subtest: readDocument — a source entry: its identifier, a front matter list, the first table of a section
2026-10-10T21:11:43.2505585Z ok 253 - readDocument — a source entry: its identifier, a front matter list, the first table of a section
2026-10-10T21:11:43.2506497Z   ---
2026-10-10T21:11:43.2506852Z   duration_ms: 1.361202
2026-10-10T21:11:43.2507276Z   type: 'test'
2026-10-10T21:11:43.2507651Z   ...
2026-10-10T21:11:43.2508680Z # Subtest: readDocument — a value that depends on another, read by the variant that holds
2026-10-10T21:11:43.2510202Z ok 254 - readDocument — a value that depends on another, read by the variant that holds
2026-10-10T21:11:43.2511013Z   ---
2026-10-10T21:11:43.2511381Z   duration_ms: 1.373756
2026-10-10T21:11:43.2511816Z   type: 'test'
2026-10-10T21:11:43.2558266Z   ...
2026-10-10T21:11:43.2559744Z # Subtest: readDocument — never throws on the content: what does not fit is left as it stands, the parts that fit are read
2026-10-10T21:11:43.2561920Z ok 255 - readDocument — never throws on the content: what does not fit is left as it stands, the parts that fit are read
2026-10-10T21:11:43.2562827Z   ---
2026-10-10T21:11:43.2563150Z   duration_ms: 0.991231
2026-10-10T21:11:43.2563526Z   type: 'test'
2026-10-10T21:11:43.2563853Z   ...
2026-10-10T21:11:43.2565193Z # Subtest: readDocument — records: key: value lines, and the sections appended to a record with their fields
2026-10-10T21:11:43.2566961Z ok 256 - readDocument — records: key: value lines, and the sections appended to a record with their fields
2026-10-10T21:11:43.2567858Z   ---
2026-10-10T21:11:43.2568222Z   duration_ms: 1.104122
2026-10-10T21:11:43.2568630Z   type: 'test'
2026-10-10T21:11:43.2568977Z   ...
2026-10-10T21:11:43.2570346Z # Subtest: readDocument, writeDocument and readRegister — a schema that loadSchema did not return is refused with a TypeError
2026-10-10T21:11:43.2572431Z ok 257 - readDocument, writeDocument and readRegister — a schema that loadSchema did not return is refused with a TypeError
2026-10-10T21:11:43.2573470Z   ---
2026-10-10T21:11:43.2573832Z   duration_ms: 2.284257
2026-10-10T21:11:43.2574245Z   type: 'test'
2026-10-10T21:11:43.2574599Z   ...
2026-10-10T21:11:43.2606269Z # Subtest: readRegister — a register read row by row, under its title: each row with its line and its cells by column
2026-10-10T21:11:43.2608487Z ok 258 - readRegister — a register read row by row, under its title: each row with its line and its cells by column
2026-10-10T21:11:43.2609466Z   ---
2026-10-10T21:11:43.2609855Z   duration_ms: 0.962879
2026-10-10T21:11:43.2610294Z   type: 'test'
2026-10-10T21:11:43.2610667Z   ...
2026-10-10T21:11:43.2611711Z # Subtest: readRegister — a table without a header row, read by position into its columns
2026-10-10T21:11:43.2613206Z ok 259 - readRegister — a table without a header row, read by position into its columns
2026-10-10T21:11:43.2614009Z   ---
2026-10-10T21:11:43.2614344Z   duration_ms: 0.320459
2026-10-10T21:11:43.2614716Z   type: 'test'
2026-10-10T21:11:43.2615306Z   ...
2026-10-10T21:11:43.2618408Z # Subtest: readRegister — a schema that names no table, or more than one, is no register's: TypeError
2026-10-10T21:11:43.2620003Z ok 260 - readRegister — a schema that names no table, or more than one, is no register's: TypeError
2026-10-10T21:11:43.2621096Z   ---
2026-10-10T21:11:43.2621475Z   duration_ms: 0.590523
2026-10-10T21:11:43.2621935Z   type: 'test'
2026-10-10T21:11:43.2622297Z   ...
2026-10-10T21:11:43.2623368Z # Subtest: writeDocument — a canonical text read and written again is byte for byte the same
2026-10-10T21:11:43.2625177Z ok 261 - writeDocument — a canonical text read and written again is byte for byte the same
2026-10-10T21:11:43.2626037Z   ---
2026-10-10T21:11:43.2626403Z   duration_ms: 4.017875
2026-10-10T21:11:43.2626825Z   type: 'test'
2026-10-10T21:11:43.2627189Z   ...
2026-10-10T21:11:43.2628580Z # Subtest: writeDocument — the canonical form: front matter keys and sections in the schema's order, lists one item per line
2026-10-10T21:11:43.2630718Z ok 262 - writeDocument — the canonical form: front matter keys and sections in the schema's order, lists one item per line
2026-10-10T21:11:43.2631787Z   ---
2026-10-10T21:11:43.2632163Z   duration_ms: 1.085537
2026-10-10T21:11:43.2632607Z   type: 'test'
2026-10-10T21:11:43.2632962Z   ...
2026-10-10T21:11:43.2634366Z # Subtest: writeDocument — rows changed, removed and added: the table holds the section's rows, a row that stands keeps its bytes
2026-10-10T21:11:43.2666956Z ok 263 - writeDocument — rows changed, removed and added: the table holds the section's rows, a row that stands keeps its bytes
2026-10-10T21:11:43.2668036Z   ---
2026-10-10T21:11:43.2668422Z   duration_ms: 0.69592
2026-10-10T21:11:43.2668834Z   type: 'test'
2026-10-10T21:11:43.2669185Z   ...
2026-10-10T21:11:43.2670490Z # Subtest: writeDocument — a value that does not fit its specification is refused with DocumentError naming the field
2026-10-10T21:11:43.2672785Z ok 264 - writeDocument — a value that does not fit its specification is refused with DocumentError naming the field
2026-10-10T21:11:43.2673792Z   ---
2026-10-10T21:11:43.2674182Z   duration_ms: 3.173106
2026-10-10T21:11:43.2674598Z   type: 'test'
2026-10-10T21:11:43.2675217Z   ...
2026-10-10T21:11:43.2676573Z # Subtest: writeDocument — the values that depend on other values in a row: DocumentError naming the row and the column
2026-10-10T21:11:43.2678761Z ok 265 - writeDocument — the values that depend on other values in a row: DocumentError naming the row and the column
2026-10-10T21:11:43.2679937Z   ---
2026-10-10T21:11:43.2680355Z   duration_ms: 2.936494
2026-10-10T21:11:43.2680829Z   type: 'test'
2026-10-10T21:11:43.2681239Z   ...
2026-10-10T21:11:43.2682685Z # Subtest: writeDocument — an append-only table only grows: NotAppendable naming the row that would be lost or changed
2026-10-10T21:11:43.2684805Z ok 266 - writeDocument — an append-only table only grows: NotAppendable naming the row that would be lost or changed
2026-10-10T21:11:43.2686217Z   ---
2026-10-10T21:11:43.2686643Z   duration_ms: 1.888398
2026-10-10T21:11:43.2687112Z   type: 'test'
2026-10-10T21:11:43.2687522Z   ...
2026-10-10T21:11:43.2688471Z # Subtest: TST-260-001: an OpenAI-compatible test sends one short authorised chat request
2026-10-10T21:11:43.2689920Z ok 267 - TST-260-001: an OpenAI-compatible test sends one short authorised chat request
2026-10-10T21:11:43.2691102Z   ---
2026-10-10T21:11:43.2691543Z   duration_ms: 3.228079
2026-10-10T21:11:43.2691998Z   type: 'test'
2026-10-10T21:11:43.2692401Z   ...
2026-10-10T21:11:43.2693338Z # Subtest: TST-260-002: an Anthropic test uses its Messages format and omits an absent key
2026-10-10T21:11:43.2715351Z ok 268 - TST-260-002: an Anthropic test uses its Messages format and omits an absent key
2026-10-10T21:11:43.2716261Z   ---
2026-10-10T21:11:43.2716639Z   duration_ms: 0.589872
2026-10-10T21:11:43.2717079Z   type: 'test'
2026-10-10T21:11:43.2717457Z   ...
2026-10-10T21:11:43.2718137Z # Subtest: TST-260-003: a refused key keeps the provider message
2026-10-10T21:11:43.2719062Z ok 269 - TST-260-003: a refused key keeps the provider message
2026-10-10T21:11:43.2719659Z   ---
2026-10-10T21:11:43.2720017Z   duration_ms: 0.891626
2026-10-10T21:11:43.2720434Z   type: 'test'
2026-10-10T21:11:43.2720808Z   ...
2026-10-10T21:11:43.2721450Z # Subtest: TST-260-004: an unknown model keeps the provider message
2026-10-10T21:11:43.2722376Z ok 270 - TST-260-004: an unknown model keeps the provider message
2026-10-10T21:11:43.2722993Z   ---
2026-10-10T21:11:43.2723345Z   duration_ms: 0.434521
2026-10-10T21:11:43.2723745Z   type: 'test'
2026-10-10T21:11:43.2724095Z   ...
2026-10-10T21:11:43.2724702Z # Subtest: TST-260-005: a rate limit keeps the provider message
2026-10-10T21:11:43.2726769Z ok 271 - TST-260-005: a rate limit keeps the provider message
2026-10-10T21:11:43.2727381Z   ---
2026-10-10T21:11:43.2727734Z   duration_ms: 1.157843
2026-10-10T21:11:43.2728150Z   type: 'test'
2026-10-10T21:11:43.2728507Z   ...
2026-10-10T21:11:43.2729181Z # Subtest: TST-260-006: another endpoint error keeps its provider message
2026-10-10T21:11:43.2730186Z ok 272 - TST-260-006: another endpoint error keeps its provider message
2026-10-10T21:11:43.2730830Z   ---
2026-10-10T21:11:43.2731175Z   duration_ms: 0.774747
2026-10-10T21:11:43.2731569Z   type: 'test'
2026-10-10T21:11:43.2731913Z   ...
2026-10-10T21:11:43.2732498Z # Subtest: TST-260-007: a network failure is not reachable
2026-10-10T21:11:43.2733340Z ok 273 - TST-260-007: a network failure is not reachable
2026-10-10T21:11:43.2733890Z   ---
2026-10-10T21:11:43.2734232Z   duration_ms: 0.681683
2026-10-10T21:11:43.2734629Z   type: 'test'
2026-10-10T21:11:43.2735226Z   ...
2026-10-10T21:11:43.2735941Z # Subtest: TST-260-008: a browser cross-origin refusal offers CI and Bridge
2026-10-10T21:11:43.2736979Z ok 274 - TST-260-008: a browser cross-origin refusal offers CI and Bridge
2026-10-10T21:11:43.2738093Z   ---
2026-10-10T21:11:43.2738606Z   duration_ms: 0.53489
2026-10-10T21:11:43.2739019Z   type: 'test'
2026-10-10T21:11:43.2739358Z   ...
2026-10-10T21:11:43.2740056Z # Subtest: TST-260-009: a missing browser opt-in header offers CI and Bridge
2026-10-10T21:11:43.2741144Z ok 275 - TST-260-009: a missing browser opt-in header offers CI and Bridge
2026-10-10T21:11:43.2741794Z   ---
2026-10-10T21:11:43.2742135Z   duration_ms: 0.64268
2026-10-10T21:11:43.2742527Z   type: 'test'
2026-10-10T21:11:43.2742909Z   ...
2026-10-10T21:11:43.2743600Z # Subtest: TST-260-010: an opaque browser failure is not over-diagnosed
2026-10-10T21:11:43.2744659Z ok 276 - TST-260-010: an opaque browser failure is not over-diagnosed
2026-10-10T21:11:43.2747251Z   ---
2026-10-10T21:11:43.2747642Z   duration_ms: 0.544557
2026-10-10T21:11:43.2748131Z   type: 'test'
2026-10-10T21:11:43.2748693Z   ...
2026-10-10T21:11:43.2749709Z # Subtest: kindOfIdentifier — the kind of an identifier of each kind of the scheme
2026-10-10T21:11:43.2751168Z ok 277 - kindOfIdentifier — the kind of an identifier of each kind of the scheme
2026-10-10T21:11:43.2751887Z   ---
2026-10-10T21:11:43.2752221Z   duration_ms: 1.219457
2026-10-10T21:11:43.2752605Z   type: 'test'
2026-10-10T21:11:43.2752947Z   ...
2026-10-10T21:11:43.2753686Z # Subtest: kindOfIdentifier — UC takes three or more digits
2026-10-10T21:11:43.2754700Z ok 278 - kindOfIdentifier — UC takes three or more digits
2026-10-10T21:11:43.2755571Z   ---
2026-10-10T21:11:43.2756214Z   duration_ms: 0.13945
2026-10-10T21:11:43.2765676Z   type: 'test'
2026-10-10T21:11:43.2766058Z   ...
2026-10-10T21:11:43.2766977Z # Subtest: kindOfIdentifier — null for a string that is none of the scheme's kinds
2026-10-10T21:11:43.2768241Z ok 279 - kindOfIdentifier — null for a string that is none of the scheme's kinds
2026-10-10T21:11:43.2768965Z   ---
2026-10-10T21:11:43.2769314Z   duration_ms: 0.920379
2026-10-10T21:11:43.2769727Z   type: 'test'
2026-10-10T21:11:43.2770060Z   ...
2026-10-10T21:11:43.2771188Z # Subtest: instanceOfPagesAddress — the owner and first path segment of a Pages address, null elsewhere
2026-10-10T21:11:43.2772869Z ok 280 - instanceOfPagesAddress — the owner and first path segment of a Pages address, null elsewhere
2026-10-10T21:11:43.2773748Z   ---
2026-10-10T21:11:43.2774112Z   duration_ms: 0.384128
2026-10-10T21:11:43.2774522Z   type: 'test'
2026-10-10T21:11:43.2775127Z   ...
2026-10-10T21:11:43.2776668Z # Subtest: process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1)
2026-10-10T21:11:43.2779031Z ok 281 - process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1)
2026-10-10T21:11:43.2780233Z   ---
2026-10-10T21:11:43.2780649Z   duration_ms: 40.620558
2026-10-10T21:11:43.2781101Z   type: 'test'
2026-10-10T21:11:43.2781475Z   ...
2026-10-10T21:11:43.2782669Z # Subtest: process route — the phases panel shows the model's transitions and its verification pairs (F2)
2026-10-10T21:11:43.2784403Z ok 282 - process route — the phases panel shows the model's transitions and its verification pairs (F2)
2026-10-10T21:11:43.2786272Z   ---
2026-10-10T21:11:43.2786669Z   duration_ms: 21.364473
2026-10-10T21:11:43.2787073Z   type: 'test'
2026-10-10T21:11:43.2787424Z   ...
2026-10-10T21:11:43.2788425Z # Subtest: process route — beside a branch, the model's own gate at its end is shown (F3)
2026-10-10T21:11:43.2789783Z ok 283 - process route — beside a branch, the model's own gate at its end is shown (F3)
2026-10-10T21:11:43.2790555Z   ---
2026-10-10T21:11:43.2790907Z   duration_ms: 14.821382
2026-10-10T21:11:43.2791308Z   type: 'test'
2026-10-10T21:11:43.2791653Z   ...
2026-10-10T21:11:43.2792715Z # Subtest: process route — each practice is shown with what it adds, beside the models it fits (F4)
2026-10-10T21:11:43.2794243Z ok 284 - process route — each practice is shown with what it adds, beside the models it fits (F4)
2026-10-10T21:11:43.2795840Z   ---
2026-10-10T21:11:43.2796506Z   duration_ms: 13.431176
2026-10-10T21:11:43.2796898Z   type: 'test'
2026-10-10T21:11:43.2797245Z   ...
2026-10-10T21:11:43.2798545Z # Subtest: process route — selected tabled practice additions enter the workflow and disappear when the selection changes
2026-10-10T21:11:43.2800534Z ok 285 - process route — selected tabled practice additions enter the workflow and disappear when the selection changes
2026-10-10T21:11:43.2801545Z   ---
2026-10-10T21:11:43.2801923Z   duration_ms: 20.350108
2026-10-10T21:11:43.2802337Z   type: 'test'
2026-10-10T21:11:43.2802685Z   ...
2026-10-10T21:11:43.2803873Z # Subtest: process route — a gate a process requirement adds is shown with the two phases it stands between (F5)
2026-10-10T21:11:43.2805877Z ok 286 - process route — a gate a process requirement adds is shown with the two phases it stands between (F5)
2026-10-10T21:11:43.2806775Z   ---
2026-10-10T21:11:43.2807131Z   duration_ms: 14.021558
2026-10-10T21:11:43.2807536Z   type: 'test'
2026-10-10T21:11:43.2807891Z   ...
2026-10-10T21:11:43.2809067Z # Subtest: process route — the missing-capability notice links to the participants' page, \#participants (F6)
2026-10-10T21:11:43.2811003Z ok 287 - process route — the missing-capability notice links to the participants' page, \#participants (F6)
2026-10-10T21:11:43.2811985Z   ---
2026-10-10T21:11:43.2812370Z   duration_ms: 9.378446
2026-10-10T21:11:43.2812803Z   type: 'test'
2026-10-10T21:11:43.2813169Z   ...
2026-10-10T21:11:43.2814590Z # Subtest: process route — the five catalogue models, in two groups, each with what its about holds
2026-10-10T21:11:43.2842438Z ok 288 - process route — the five catalogue models, in two groups, each with what its about holds
2026-10-10T21:11:43.2843296Z   ---
2026-10-10T21:11:43.2843654Z   duration_ms: 37.393702
2026-10-10T21:11:43.2844057Z   type: 'test'
2026-10-10T21:11:43.2844396Z   ...
2026-10-10T21:11:43.2845507Z # Subtest: process route — the page of a product without a declaration
2026-10-10T21:11:43.2846612Z ok 289 - process route — the page of a product without a declaration
2026-10-10T21:11:43.2847262Z   ---
2026-10-10T21:11:43.2847605Z   duration_ms: 8.05795
2026-10-10T21:11:43.2847998Z   type: 'test'
2026-10-10T21:11:43.2848330Z   ...
2026-10-10T21:11:43.2849294Z # Subtest: process route — the page of a product with a declaration, its first field focused
2026-10-10T21:11:43.2850740Z ok 290 - process route — the page of a product with a declaration, its first field focused
2026-10-10T21:11:43.2851514Z   ---
2026-10-10T21:11:43.2851860Z   duration_ms: 32.072435
2026-10-10T21:11:43.2852258Z   type: 'test'
2026-10-10T21:11:43.2852591Z   ...
2026-10-10T21:11:43.2853428Z # Subtest: process route — the page of a product with Agent M's own declaration
2026-10-10T21:11:43.2854642Z ok 291 - process route — the page of a product with Agent M's own declaration
2026-10-10T21:11:43.2855634Z   ---
2026-10-10T21:11:43.2856005Z   duration_ms: 18.313205
2026-10-10T21:11:43.2856434Z   type: 'test'
2026-10-10T21:11:43.2856783Z   ...
2026-10-10T21:11:43.2858448Z # Subtest: process route — a role's offered participants are those with every capability, each with its place; a role none can hold names the missing capability
2026-10-10T21:11:43.2860996Z ok 292 - process route — a role's offered participants are those with every capability, each with its place; a role none can hold names the missing capability
2026-10-10T21:11:43.2862271Z   ---
2026-10-10T21:11:43.2862656Z   duration_ms: 14.076355
2026-10-10T21:11:43.2863121Z   type: 'test'
2026-10-10T21:11:43.2863475Z   ...
2026-10-10T21:11:43.2882238Z # Subtest: process route — the declaration's findings are shown before Save, among them a holder at a place a linked source does not permit
2026-10-10T21:11:43.2884558Z ok 293 - process route — the declaration's findings are shown before Save, among them a holder at a place a linked source does not permit
2026-10-10T21:11:43.2886337Z   ---
2026-10-10T21:11:43.2886707Z   duration_ms: 13.65885
2026-10-10T21:11:43.2887108Z   type: 'test'
2026-10-10T21:11:43.2887719Z   ...
2026-10-10T21:11:43.2888764Z # Subtest: process route — Save is disabled while a role that needs a person has none, naming it
2026-10-10T21:11:43.2890255Z ok 294 - process route — Save is disabled while a role that needs a person has none, naming it
2026-10-10T21:11:43.2891059Z   ---
2026-10-10T21:11:43.2891440Z   duration_ms: 13.587711
2026-10-10T21:11:43.2891878Z   type: 'test'
2026-10-10T21:11:43.2892255Z   ...
2026-10-10T21:11:43.2893175Z # Subtest: process route — a product without process requirements is told so
2026-10-10T21:11:43.2894499Z ok 295 - process route — a product without process requirements is told so
2026-10-10T21:11:43.2895511Z   ---
2026-10-10T21:11:43.2895894Z   duration_ms: 9.50878
2026-10-10T21:11:43.2896326Z   type: 'test'
2026-10-10T21:11:43.2896713Z   ...
2026-10-10T21:11:43.2898242Z # Subtest: process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not
2026-10-10T21:11:43.2900537Z ok 296 - process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not
2026-10-10T21:11:43.2901697Z   ---
2026-10-10T21:11:43.2902084Z   duration_ms: 35.744007
2026-10-10T21:11:43.2902521Z   type: 'test'
2026-10-10T21:11:43.2902887Z   ...
2026-10-10T21:11:43.2904228Z # Subtest: process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at
2026-10-10T21:11:43.2906608Z ok 297 - process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at
2026-10-10T21:11:43.2907892Z   ---
2026-10-10T21:11:43.2908255Z   duration_ms: 25.220046
2026-10-10T21:11:43.2908657Z   type: 'test'
2026-10-10T21:11:43.2908984Z   ...
2026-10-10T21:11:43.2910365Z # Subtest: process route — changing a practice in one live form updates the workflow before Save and Save preserves the selection
2026-10-10T21:11:43.2912360Z ok 298 - process route — changing a practice in one live form updates the workflow before Save and Save preserves the selection
2026-10-10T21:11:43.2913325Z   ---
2026-10-10T21:11:43.2913673Z   duration_ms: 26.444826
2026-10-10T21:11:43.2914053Z   type: 'test'
2026-10-10T21:11:43.2914390Z   ...
2026-10-10T21:11:43.2915434Z # Subtest: process route — a refused save keeps the person's edit
2026-10-10T21:11:43.2916516Z ok 299 - process route — a refused save keeps the person's edit
2026-10-10T21:11:43.2917133Z   ---
2026-10-10T21:11:43.2917489Z   duration_ms: 25.619846
2026-10-10T21:11:43.2917911Z   type: 'test'
2026-10-10T21:11:43.2918251Z   ...
2026-10-10T21:11:43.2919098Z # Subtest: newJobId — an identifier of the record's form, none of those taken
2026-10-10T21:11:43.2920268Z ok 300 - newJobId — an identifier of the record's form, none of those taken
2026-10-10T21:11:43.2920944Z   ---
2026-10-10T21:11:43.2921289Z   duration_ms: 1.38827
2026-10-10T21:11:43.2921672Z   type: 'test'
2026-10-10T21:11:43.2922005Z   ...
2026-10-10T21:11:43.2923033Z # Subtest: startRecord — the start of a record with each of its parts, read back as the same start
2026-10-10T21:11:43.2924522Z ok 301 - startRecord — the start of a record with each of its parts, read back as the same start
2026-10-10T21:11:43.2925752Z   ---
2026-10-10T21:11:43.2926119Z   duration_ms: 4.756143
2026-10-10T21:11:43.2926521Z   type: 'test'
2026-10-10T21:11:43.2926869Z   ...
2026-10-10T21:11:43.2927659Z # Subtest: listJobs — a record with each kind of part appended, read
2026-10-10T21:11:43.2928743Z ok 302 - listJobs — a record with each kind of part appended, read
2026-10-10T21:11:43.2929469Z   ---
2026-10-10T21:11:43.2929952Z   duration_ms: 1.682354
2026-10-10T21:11:43.2930506Z   type: 'test'
2026-10-10T21:11:43.2930959Z   ...
2026-10-10T21:11:43.2932363Z # Subtest: listJobs — a question to the author is read as the record's question, not a nameless gate
2026-10-10T21:11:43.2934375Z ok 303 - listJobs — a question to the author is read as the record's question, not a nameless gate
2026-10-10T21:11:43.2936939Z   ---
2026-10-10T21:11:43.2937748Z   duration_ms: 0.70733
2026-10-10T21:11:43.2938294Z   type: 'test'
2026-10-10T21:11:43.2938736Z   ...
2026-10-10T21:11:43.2939887Z # Subtest: listJobs — an End's draft is read from its one fenced JSON block
2026-10-10T21:11:43.2941422Z ok 304 - listJobs — an End's draft is read from its one fenced JSON block
2026-10-10T21:11:43.2942334Z   ---
2026-10-10T21:11:43.2942803Z   duration_ms: 0.571425
2026-10-10T21:11:43.2943329Z   type: 'test'
2026-10-10T21:11:43.2943790Z   ...
2026-10-10T21:11:43.2945289Z # Subtest: jobState — the state of a record by its last part, with a live state and without one
2026-10-10T21:11:43.2947202Z ok 305 - jobState — the state of a record by its last part, with a live state and without one
2026-10-10T21:11:43.2948189Z   ---
2026-10-10T21:11:43.2948563Z   duration_ms: 0.2662
2026-10-10T21:11:43.2948949Z   type: 'test'
2026-10-10T21:11:43.2949268Z   ...
2026-10-10T21:11:43.2950541Z # Subtest: listJobs — the jobs of two products newest first, waiting at a gate first, a record that cannot be read listed with the reason
2026-10-10T21:11:43.2952422Z ok 306 - listJobs — the jobs of two products newest first, waiting at a gate first, a record that cannot be read listed with the reason
2026-10-10T21:11:43.2953351Z   ---
2026-10-10T21:11:43.2953656Z   duration_ms: 0.946568
2026-10-10T21:11:43.2954008Z   type: 'test'
2026-10-10T21:11:43.2954316Z   ...
2026-10-10T21:11:43.2955369Z # Subtest: jobCost — the cost as reported, at the declared price, or unknown, never zero
2026-10-10T21:11:43.2957023Z ok 307 - jobCost — the cost as reported, at the declared price, or unknown, never zero
2026-10-10T21:11:43.2957713Z   ---
2026-10-10T21:11:43.2958025Z   duration_ms: 0.229668
2026-10-10T21:11:43.2958386Z   type: 'test'
2026-10-10T21:11:43.2958699Z   ...
2026-10-10T21:11:43.2959659Z # Subtest: recordsNewestFirst — yields only the newest record until its caller asks for another
2026-10-10T21:11:43.2961101Z ok 308 - recordsNewestFirst — yields only the newest record until its caller asks for another
2026-10-10T21:11:43.2961891Z   ---
2026-10-10T21:11:43.2962214Z   duration_ms: 0.743591
2026-10-10T21:11:43.2962582Z   type: 'test'
2026-10-10T21:11:43.2962901Z   ...
2026-10-10T21:11:43.2964173Z # Subtest: the use-case list reads the commit, the tree, the use cases and only the records it must — no architecture or queue file
2026-10-10T21:11:43.2966351Z ok 309 - the use-case list reads the commit, the tree, the use cases and only the records it must — no architecture or queue file
2026-10-10T21:11:43.2967334Z   ---
2026-10-10T21:11:43.2967654Z   duration_ms: 197.009719
2026-10-10T21:11:43.2968093Z   type: 'test'
2026-10-10T21:11:43.2968451Z   ...
2026-10-10T21:11:43.2969118Z # Subtest: the architecture view reads no use case and no queue file
2026-10-10T21:11:43.2970078Z ok 310 - the architecture view reads no use case and no queue file
2026-10-10T21:11:43.2970695Z   ---
2026-10-10T21:11:43.2971042Z   duration_ms: 83.866206
2026-10-10T21:11:43.2971444Z   type: 'test'
2026-10-10T21:11:43.2971798Z   ...
2026-10-10T21:11:43.2972688Z # Subtest: the SPEC view lists only the open SPEC changes; an accepted queue's proposals are not read
2026-10-10T21:11:43.2974078Z ok 311 - the SPEC view lists only the open SPEC changes; an accepted queue's proposals are not read
2026-10-10T21:11:43.2975153Z   ---
2026-10-10T21:11:43.2975517Z   duration_ms: 65.7427
2026-10-10T21:11:43.2975929Z   type: 'test'
2026-10-10T21:11:43.2976289Z   ...
2026-10-10T21:11:43.2977225Z # Subtest: opening one use case reads that use case and its records — no other file
2026-10-10T21:11:43.2978542Z ok 312 - opening one use case reads that use case and its records — no other file
2026-10-10T21:11:43.2979240Z   ---
2026-10-10T21:11:43.2979591Z   duration_ms: 68.6889
2026-10-10T21:11:43.2979937Z   type: 'test'
2026-10-10T21:11:43.2980215Z   ...
2026-10-10T21:11:43.2981204Z # Subtest: opening a changed module reads what its impact list needs: its records, its last accepted text, every module, the code's headers
2026-10-10T21:11:43.2983303Z ok 313 - opening a changed module reads what its impact list needs: its records, its last accepted text, every module, the code's headers
2026-10-10T21:11:43.2984442Z   ---
2026-10-10T21:11:43.2984780Z   duration_ms: 69.545821
2026-10-10T21:11:43.2985393Z   type: 'test'
2026-10-10T21:11:43.2985759Z   ...
2026-10-10T21:11:43.2986685Z # Subtest: settings read the product's settings, and no use case, architecture file, record or queue
2026-10-10T21:11:43.2988112Z ok 314 - settings read the product's settings, and no use case, architecture file, record or queue
2026-10-10T21:11:43.2988980Z   ---
2026-10-10T21:11:43.2989346Z   duration_ms: 58.73854
2026-10-10T21:11:43.2989766Z   type: 'test'
2026-10-10T21:11:43.2990132Z   ...
2026-10-10T21:11:43.2990879Z # Subtest: a second load on an unchanged tree reads its displayed files again
2026-10-10T21:11:43.2992008Z not ok 315 - a second load on an unchanged tree reads its displayed files again
2026-10-10T21:11:43.2992730Z   ---
2026-10-10T21:11:43.2993092Z   duration_ms: 183.188866
2026-10-10T21:11:43.2993542Z   type: 'test'
2026-10-10T21:11:43.2994314Z   location: '/home/runner/work/agent-m/agent-m/tests/load-per-view.test.mjs:153:1'
2026-10-10T21:11:43.2995540Z   failureType: 'testCodeFailure'
2026-10-10T21:11:43.2996033Z   error: |-
2026-10-10T21:11:43.2996513Z     Expected values to be strictly deep-equal:
2026-10-10T21:11:43.2997082Z     + actual - expected
2026-10-10T21:11:43.2997486Z     
2026-10-10T21:11:43.2997837Z       [
2026-10-10T21:11:43.2998575Z     +   'docs/approvals/UC-001-be750847452f.md',
2026-10-10T21:11:43.2999231Z         'docs/approvals/UC-002-a54bc1ba2797.md',
2026-10-10T21:11:43.2999841Z         'docs/use-cases/README.md',
2026-10-10T21:11:43.3000432Z         'docs/use-cases/UC-001-read-a-file.md',
2026-10-10T21:11:43.3001101Z         'docs/use-cases/UC-002-show-the-status.md'
2026-10-10T21:11:43.3001635Z       ]
2026-10-10T21:11:43.3001929Z     
2026-10-10T21:11:43.3002221Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:43.3002647Z   name: 'AssertionError'
2026-10-10T21:11:43.3003078Z   expected:
2026-10-10T21:11:43.3003494Z     0: 'docs/approvals/UC-002-a54bc1ba2797.md'
2026-10-10T21:11:43.3004070Z     1: 'docs/use-cases/README.md'
2026-10-10T21:11:43.3004645Z     2: 'docs/use-cases/UC-001-read-a-file.md'
2026-10-10T21:11:43.3005694Z     3: 'docs/use-cases/UC-002-show-the-status.md'
2026-10-10T21:11:43.3006262Z   actual:
2026-10-10T21:11:43.3006736Z     0: 'docs/approvals/UC-001-be750847452f.md'
2026-10-10T21:11:43.3007378Z     1: 'docs/approvals/UC-002-a54bc1ba2797.md'
2026-10-10T21:11:43.3008007Z     2: 'docs/use-cases/README.md'
2026-10-10T21:11:43.3008589Z     3: 'docs/use-cases/UC-001-read-a-file.md'
2026-10-10T21:11:43.3009262Z     4: 'docs/use-cases/UC-002-show-the-status.md'
2026-10-10T21:11:43.3009860Z   operator: 'deepStrictEqual'
2026-10-10T21:11:43.3010323Z   stack: |-
2026-10-10T21:11:43.3011251Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/load-per-view.test.mjs:164:10)
2026-10-10T21:11:43.3012416Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:43.3013365Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:43.3014077Z   ...
2026-10-10T21:11:43.3015166Z # Subtest: without Cache Storage the page still works; it reads every file it shows
2026-10-10T21:11:43.3016244Z ok 316 - without Cache Storage the page still works; it reads every file it shows
2026-10-10T21:11:43.3016951Z   ---
2026-10-10T21:11:43.3017283Z   duration_ms: 118.187351
2026-10-10T21:11:43.3017673Z   type: 'test'
2026-10-10T21:11:43.3017975Z   ...
2026-10-10T21:11:43.3019050Z # Subtest: counter-proof: a record named for the current text whose content names another blob does not accept the opened file
2026-10-10T21:11:43.3020742Z ok 317 - counter-proof: a record named for the current text whose content names another blob does not accept the opened file
2026-10-10T21:11:43.3021644Z   ---
2026-10-10T21:11:43.3021995Z   duration_ms: 123.192604
2026-10-10T21:11:43.3022399Z   type: 'test'
2026-10-10T21:11:43.3022993Z   ...
2026-10-10T21:11:43.3023758Z # Subtest: Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR)
2026-10-10T21:11:43.3025282Z ok 318 - Clear everything also removes the kept file texts (A CLEAR IS A REAL CLEAR)
2026-10-10T21:11:43.3026056Z   ---
2026-10-10T21:11:43.3026384Z   duration_ms: 2.295868
2026-10-10T21:11:43.3026785Z   type: 'test'
2026-10-10T21:11:43.3027113Z   ...
2026-10-10T21:11:43.3028121Z # Subtest: renderArtifact — headings, lists, emphasis, links, tables and code are rendered
2026-10-10T21:11:43.3029513Z ok 319 - renderArtifact — headings, lists, emphasis, links, tables and code are rendered
2026-10-10T21:11:43.3030204Z   ---
2026-10-10T21:11:43.3030559Z   duration_ms: 36.633442
2026-10-10T21:11:43.3030947Z   type: 'test'
2026-10-10T21:11:43.3031259Z   ...
2026-10-10T21:11:43.3032276Z # Subtest: renderArtifact — a script, an event attribute and a javascript: link are removed by the sanitiser
2026-10-10T21:11:43.3033872Z ok 320 - renderArtifact — a script, an event attribute and a javascript: link are removed by the sanitiser
2026-10-10T21:11:43.3034693Z   ---
2026-10-10T21:11:43.3035278Z   duration_ms: 1.84164
2026-10-10T21:11:43.3035649Z   type: 'test'
2026-10-10T21:11:43.3035948Z   ...
2026-10-10T21:11:43.3036704Z # Subtest: renderArtifact — an image is shown as a link, never loaded
2026-10-10T21:11:43.3037751Z ok 321 - renderArtifact — an image is shown as a link, never loaded
2026-10-10T21:11:43.3038400Z   ---
2026-10-10T21:11:43.3039005Z   duration_ms: 0.975873
2026-10-10T21:11:43.3039415Z   type: 'test'
2026-10-10T21:11:43.3039829Z   ...
2026-10-10T21:11:43.3041106Z # Subtest: renderArtifact — a Mermaid block is shown as its source with the reason, and the prose around it is rendered
2026-10-10T21:11:43.3043042Z ok 322 - renderArtifact — a Mermaid block is shown as its source with the reason, and the prose around it is rendered
2026-10-10T21:11:43.3043939Z   ---
2026-10-10T21:11:43.3044294Z   duration_ms: 0.948521
2026-10-10T21:11:43.3044715Z   type: 'test'
2026-10-10T21:11:43.3046467Z   ...
2026-10-10T21:11:43.3047267Z # Subtest: renderArtifact — the same text gives the same HTML
2026-10-10T21:11:43.3048294Z ok 323 - renderArtifact — the same text gives the same HTML
2026-10-10T21:11:43.3048912Z   ---
2026-10-10T21:11:43.3049234Z   duration_ms: 7.065527
2026-10-10T21:11:43.3049606Z   type: 'test'
2026-10-10T21:11:43.3049950Z   ...
2026-10-10T21:11:43.3050618Z # Subtest: openEditor — the preview follows an edit
2026-10-10T21:11:43.3051423Z ok 324 - openEditor — the preview follows an edit
2026-10-10T21:11:43.3051909Z   ---
2026-10-10T21:11:43.3052220Z   duration_ms: 1.866576
2026-10-10T21:11:43.3052602Z   type: 'test'
2026-10-10T21:11:43.3052918Z   ...
2026-10-10T21:11:43.3053747Z # Subtest: openEditor — a mark is shown beside its line, in the one form of a finding
2026-10-10T21:11:43.3055242Z ok 325 - openEditor — a mark is shown beside its line, in the one form of a finding
2026-10-10T21:11:43.3055935Z   ---
2026-10-10T21:11:43.3056255Z   duration_ms: 1.256877
2026-10-10T21:11:43.3056655Z   type: 'test'
2026-10-10T21:11:43.3056956Z   ...
2026-10-10T21:11:43.3057695Z # Subtest: openEditor — Save hands the edited text to the caller's save
2026-10-10T21:11:43.3058702Z ok 326 - openEditor — Save hands the edited text to the caller's save
2026-10-10T21:11:43.3059287Z   ---
2026-10-10T21:11:43.3059634Z   duration_ms: 7.89702
2026-10-10T21:11:43.3059978Z   type: 'test'
2026-10-10T21:11:43.3060287Z   ...
2026-10-10T21:11:43.3061331Z # Subtest: openEditor — a refused save keeps the edit, with the newer version and the difference beside it
2026-10-10T21:11:43.3062804Z ok 327 - openEditor — a refused save keeps the edit, with the newer version and the difference beside it
2026-10-10T21:11:43.3063562Z   ---
2026-10-10T21:11:43.3063878Z   duration_ms: 3.026004
2026-10-10T21:11:43.3064242Z   type: 'test'
2026-10-10T21:11:43.3064559Z   ...
2026-10-10T21:11:43.3065554Z # Subtest: TST-269001: a local endpoint saves then probes only its paired Bridge
2026-10-10T21:11:43.3066865Z ok 328 - TST-269001: a local endpoint saves then probes only its paired Bridge
2026-10-10T21:11:43.3067559Z   ---
2026-10-10T21:11:43.3067913Z   duration_ms: 34.054373
2026-10-10T21:11:43.3068339Z   type: 'test'
2026-10-10T21:11:43.3068681Z   ...
2026-10-10T21:11:43.3069529Z # Subtest: TST-269002: a provider refusal through Bridge remains a stored provider diagnosis
2026-10-10T21:11:43.3070771Z ok 329 - TST-269002: a provider refusal through Bridge remains a stored provider diagnosis
2026-10-10T21:11:43.3071563Z   ---
2026-10-10T21:11:43.3071907Z   duration_ms: 4.79618
2026-10-10T21:11:43.3072315Z   type: 'test'
2026-10-10T21:11:43.3072660Z   ...
2026-10-10T21:11:43.3073495Z # Subtest: TST-269003: absent Bridge setup retains the endpoint and directs the author to pairing
2026-10-10T21:11:43.3075072Z ok 330 - TST-269003: absent Bridge setup retains the endpoint and directs the author to pairing
2026-10-10T21:11:43.3075865Z   ---
2026-10-10T21:11:43.3076171Z   duration_ms: 2.486594
2026-10-10T21:11:43.3076586Z   type: 'test'
2026-10-10T21:11:43.3076915Z   ...
2026-10-10T21:11:43.3077707Z # Subtest: TST-269004: refused and unavailable Bridges stay distinct from provider diagnoses
2026-10-10T21:11:43.3078933Z ok 331 - TST-269004: refused and unavailable Bridges stay distinct from provider diagnoses
2026-10-10T21:11:43.3079648Z   ---
2026-10-10T21:11:43.3079970Z   duration_ms: 4.482522
2026-10-10T21:11:43.3080373Z   type: 'test'
2026-10-10T21:11:43.3080705Z   ...
2026-10-10T21:11:43.3081807Z # Subtest: TST-269005: HTTPS Bridge testing reads the separate jump-host login into transient settings
2026-10-10T21:11:43.3083172Z ok 332 - TST-269005: HTTPS Bridge testing reads the separate jump-host login into transient settings
2026-10-10T21:11:43.3083997Z   ---
2026-10-10T21:11:43.3084305Z   duration_ms: 5.429821
2026-10-10T21:11:43.3084683Z   type: 'test'
2026-10-10T21:11:43.3085318Z   ...
2026-10-10T21:11:43.3086173Z # Subtest: TST-269006: the public endpoint Route hands absent Bridge setup to the public Bridge Route
2026-10-10T21:11:43.3087501Z ok 333 - TST-269006: the public endpoint Route hands absent Bridge setup to the public Bridge Route
2026-10-10T21:11:43.3088301Z   ---
2026-10-10T21:11:43.3088650Z   duration_ms: 224.305101
2026-10-10T21:11:43.3089011Z   type: 'test'
2026-10-10T21:11:43.3089324Z   ...
2026-10-10T21:11:43.3090258Z # Subtest: Model.about — every shipped model's \#\# About is read with its four lines
2026-10-10T21:11:43.3091503Z ok 334 - Model.about — every shipped model's \#\# About is read with its four lines
2026-10-10T21:11:43.3092193Z   ---
2026-10-10T21:11:43.3092497Z   duration_ms: 5.907824
2026-10-10T21:11:43.3092902Z   type: 'test'
2026-10-10T21:11:43.3093251Z   ...
2026-10-10T21:11:43.3094107Z # Subtest: Model.about — a model without \#\# About is read with about null
2026-10-10T21:11:43.3095600Z ok 335 - Model.about — a model without \#\# About is read with about null
2026-10-10T21:11:43.3096283Z   ---
2026-10-10T21:11:43.3096643Z   duration_ms: 2.01854
2026-10-10T21:11:43.3097063Z   type: 'test'
2026-10-10T21:11:43.3097416Z   ...
2026-10-10T21:11:43.3098749Z # Subtest: catalogue — the shipped catalogue holds exactly the book's five models in their two groups, and its four practices
2026-10-10T21:11:43.3100734Z ok 336 - catalogue — the shipped catalogue holds exactly the book's five models in their two groups, and its four practices
2026-10-10T21:11:43.3101733Z   ---
2026-10-10T21:11:43.3102082Z   duration_ms: 8.667008
2026-10-10T21:11:43.3102476Z   type: 'test'
2026-10-10T21:11:43.3102836Z   ...
2026-10-10T21:11:43.3104034Z # Subtest: catalogue — an instance's own model is read as a Model, listed after the shipped ones, with its findings
2026-10-10T21:11:43.3106082Z ok 337 - catalogue — an instance's own model is read as a Model, listed after the shipped ones, with its findings
2026-10-10T21:11:43.3107004Z   ---
2026-10-10T21:11:43.3107355Z   duration_ms: 5.988615
2026-10-10T21:11:43.3107768Z   type: 'test'
2026-10-10T21:11:43.3108123Z   ...
2026-10-10T21:11:43.3109240Z # Subtest: modelFindings — every shipped model passes without an error, and every shipped practice fits its schema
2026-10-10T21:11:43.3111118Z ok 338 - modelFindings — every shipped model passes without an error, and every shipped practice fits its schema
2026-10-10T21:11:43.3111984Z   ---
2026-10-10T21:11:43.3112300Z   duration_ms: 4.022532
2026-10-10T21:11:43.3112666Z   type: 'test'
2026-10-10T21:11:43.3113009Z   ...
2026-10-10T21:11:43.3114391Z # Subtest: modelFindings — a complete definition, with a gate decided by a role and one decided by a CI check, has no finding
2026-10-10T21:11:43.3118919Z ok 339 - modelFindings — a complete definition, with a gate decided by a role and one decided by a CI check, has no finding
2026-10-10T21:11:43.3119931Z   ---
2026-10-10T21:11:43.3120291Z   duration_ms: 0.527785
2026-10-10T21:11:43.3120701Z   type: 'test'
2026-10-10T21:11:43.3121056Z   ...
2026-10-10T21:11:43.3122040Z # Subtest: modelFindings — a transition naming a phase that is not defined is an error
2026-10-10T21:11:43.3123461Z ok 340 - modelFindings — a transition naming a phase that is not defined is an error
2026-10-10T21:11:43.3124256Z   ---
2026-10-10T21:11:43.3124617Z   duration_ms: 0.773134
2026-10-10T21:11:43.3125290Z   type: 'test'
2026-10-10T21:11:43.3125648Z   ...
2026-10-10T21:11:43.3126698Z # Subtest: modelFindings — a phase that no transition reaches from the first phase is an error
2026-10-10T21:11:43.3128162Z ok 341 - modelFindings — a phase that no transition reaches from the first phase is an error
2026-10-10T21:11:43.3129254Z   ---
2026-10-10T21:11:43.3129619Z   duration_ms: 0.727008
2026-10-10T21:11:43.3130032Z   type: 'test'
2026-10-10T21:11:43.3130377Z   ...
2026-10-10T21:11:43.3131301Z # Subtest: modelFindings — a verification pair naming a missing phase is an error
2026-10-10T21:11:43.3132673Z ok 342 - modelFindings — a verification pair naming a missing phase is an error
2026-10-10T21:11:43.3133419Z   ---
2026-10-10T21:11:43.3133781Z   duration_ms: 0.581456
2026-10-10T21:11:43.3134193Z   type: 'test'
2026-10-10T21:11:43.3134565Z   ...
2026-10-10T21:11:43.3135738Z # Subtest: modelFindings — a gate without artifacts is an error
2026-10-10T21:11:43.3136804Z ok 343 - modelFindings — a gate without artifacts is an error
2026-10-10T21:11:43.3137423Z   ---
2026-10-10T21:11:43.3137784Z   duration_ms: 0.962879
2026-10-10T21:11:43.3138202Z   type: 'test'
2026-10-10T21:11:43.3138550Z   ...
2026-10-10T21:11:43.3139341Z # Subtest: modelFindings — a gate without a condition is an error
2026-10-10T21:11:43.3140347Z ok 344 - modelFindings — a gate without a condition is an error
2026-10-10T21:11:43.3140930Z   ---
2026-10-10T21:11:43.3141258Z   duration_ms: 0.772051
2026-10-10T21:11:43.3141642Z   type: 'test'
2026-10-10T21:11:43.3141981Z   ...
2026-10-10T21:11:43.3143287Z # Subtest: modelFindings — a gate without a decider is an error: none named, or one that is no role of the model and no check
2026-10-10T21:11:43.3145565Z ok 345 - modelFindings — a gate without a decider is an error: none named, or one that is no role of the model and no check
2026-10-10T21:11:43.3146583Z   ---
2026-10-10T21:11:43.3146945Z   duration_ms: 1.2527
2026-10-10T21:11:43.3147346Z   type: 'test'
2026-10-10T21:11:43.3147707Z   ...
2026-10-10T21:11:43.3148499Z # Subtest: modelFindings — a role without capabilities is an error
2026-10-10T21:11:43.3149584Z ok 346 - modelFindings — a role without capabilities is an error
2026-10-10T21:11:43.3150301Z   ---
2026-10-10T21:11:43.3150667Z   duration_ms: 0.577228
2026-10-10T21:11:43.3151087Z   type: 'test'
2026-10-10T21:11:43.3151426Z   ...
2026-10-10T21:11:43.3152587Z # Subtest: modelFindings — a phase without a role is an error: none named, or one the model does not define
2026-10-10T21:11:43.3154312Z ok 347 - modelFindings — a phase without a role is an error: none named, or one the model does not define
2026-10-10T21:11:43.3155551Z   ---
2026-10-10T21:11:43.3155928Z   duration_ms: 1.26322
2026-10-10T21:11:43.3156341Z   type: 'test'
2026-10-10T21:11:43.3156699Z   ...
2026-10-10T21:11:43.3158177Z # Subtest: modelFindings — a gate that checks a kind of artifact no earlier phase produces is an error
2026-10-10T21:11:43.3160439Z ok 348 - modelFindings — a gate that checks a kind of artifact no earlier phase produces is an error
2026-10-10T21:11:43.3161311Z   ---
2026-10-10T21:11:43.3161669Z   duration_ms: 0.695309
2026-10-10T21:11:43.3162085Z   type: 'test'
2026-10-10T21:11:43.3162440Z   ...
2026-10-10T21:11:43.3164253Z # Subtest: modelFindings and catalogue — a kind in Produces may be followed by an explanation in parentheses: the kind is what stands before it, and a gate that checks it finds it produced
2026-10-10T21:11:43.3167367Z ok 349 - modelFindings and catalogue — a kind in Produces may be followed by an explanation in parentheses: the kind is what stands before it, and a gate that checks it finds it produced
2026-10-10T21:11:43.3168788Z   ---
2026-10-10T21:11:43.3169170Z   duration_ms: 3.061267
2026-10-10T21:11:43.3169596Z   type: 'test'
2026-10-10T21:11:43.3169968Z   ...
2026-10-10T21:11:43.3171111Z # Subtest: modelFindings — a word before the parenthesis that is no kind of artifact is still a finding
2026-10-10T21:11:43.3172723Z ok 350 - modelFindings — a word before the parenthesis that is no kind of artifact is still a finding
2026-10-10T21:11:43.3173599Z   ---
2026-10-10T21:11:43.3173954Z   duration_ms: 1.136151
2026-10-10T21:11:43.3174366Z   type: 'test'
2026-10-10T21:11:43.3174726Z   ...
2026-10-10T21:11:43.3176351Z # Subtest: modelFindings — pulled work with neither a time box nor a work-in-progress limit, or with both, is an error
2026-10-10T21:11:43.3178509Z ok 351 - modelFindings — pulled work with neither a time box nor a work-in-progress limit, or with both, is an error
2026-10-10T21:11:43.3179472Z   ---
2026-10-10T21:11:43.3179910Z   duration_ms: 1.120041
2026-10-10T21:11:43.3180323Z   type: 'test'
2026-10-10T21:11:43.3180664Z   ...
2026-10-10T21:11:43.3182190Z # Subtest: modelFindings and catalogue — a Time box of none is no time box: pulled work with a WIP limit and a Time box of none has no finding of both
2026-10-10T21:11:43.3184481Z ok 352 - modelFindings and catalogue — a Time box of none is no time box: pulled work with a WIP limit and a Time box of none has no finding of both
2026-10-10T21:11:43.3185853Z   ---
2026-10-10T21:11:43.3186224Z   duration_ms: 2.796373
2026-10-10T21:11:43.3186651Z   type: 'test'
2026-10-10T21:11:43.3187002Z   ...
2026-10-10T21:11:43.3187937Z # Subtest: modelFindings — a measure that does not fit the kind of work is an error
2026-10-10T21:11:43.3189316Z ok 353 - modelFindings — a measure that does not fit the kind of work is an error
2026-10-10T21:11:43.3190058Z   ---
2026-10-10T21:11:43.3190408Z   duration_ms: 0.795565
2026-10-10T21:11:43.3190828Z   type: 'test'
2026-10-10T21:11:43.3191192Z   ...
2026-10-10T21:11:43.3192103Z # Subtest: modelFindings — no declaration of planned or pulled work is an error
2026-10-10T21:11:43.3193414Z ok 354 - modelFindings — no declaration of planned or pulled work is an error
2026-10-10T21:11:43.3194223Z   ---
2026-10-10T21:11:43.3194612Z   duration_ms: 0.901984
2026-10-10T21:11:43.3195322Z   type: 'test'
2026-10-10T21:11:43.3195700Z   ...
2026-10-10T21:11:43.3197015Z # Subtest: modelFindings — this repository's own docs/process-models/scrum-wip.md, as it stands, has no error finding
2026-10-10T21:11:43.3198975Z ok 355 - modelFindings — this repository's own docs/process-models/scrum-wip.md, as it stands, has no error finding
2026-10-10T21:11:43.3199979Z   ---
2026-10-10T21:11:43.3200356Z   duration_ms: 0.948392
2026-10-10T21:11:43.3200798Z   type: 'test'
2026-10-10T21:11:43.3201159Z   ...
2026-10-10T21:11:43.3202278Z # Subtest: THE CATALOGUE IS DATA — no name of a shipped model or practice stands in the module's code
2026-10-10T21:11:43.3203889Z ok 356 - THE CATALOGUE IS DATA — no name of a shipped model or practice stands in the module's code
2026-10-10T21:11:43.3204748Z   ---
2026-10-10T21:11:43.3217941Z   duration_ms: 4.910452
2026-10-10T21:11:43.3218412Z   type: 'test'
2026-10-10T21:11:43.3218786Z   ...
2026-10-10T21:11:43.3220873Z # Subtest: THE CATALOGUE IS DATA — the shipped models and practices are found in the module's list of its files, read from the disk in Node and from its own address in a browser
2026-10-10T21:11:43.3223611Z ok 357 - THE CATALOGUE IS DATA — the shipped models and practices are found in the module's list of its files, read from the disk in Node and from its own address in a browser
2026-10-10T21:11:43.3225334Z   ---
2026-10-10T21:11:43.3225694Z   duration_ms: 44.225551
2026-10-10T21:11:43.3226135Z   type: 'test'
2026-10-10T21:11:43.3226504Z   ...
2026-10-10T21:11:43.3227341Z # Subtest: switchOn asks the browser's permission only on the call, and a refusal stores nothing
2026-10-10T21:11:43.3228736Z ok 358 - switchOn asks the browser's permission only on the call, and a refusal stores nothing
2026-10-10T21:11:43.3229526Z   ---
2026-10-10T21:11:43.3229881Z   duration_ms: 3.302909
2026-10-10T21:11:43.3230296Z   type: 'test'
2026-10-10T21:11:43.3230666Z   ...
2026-10-10T21:11:43.3231520Z # Subtest: switchOff removes both notifications and notified, and unregisters the worker
2026-10-10T21:11:43.3232802Z ok 359 - switchOff removes both notifications and notified, and unregisters the worker
2026-10-10T21:11:43.3233595Z   ---
2026-10-10T21:11:43.3233953Z   duration_ms: 0.891635
2026-10-10T21:11:43.3234358Z   type: 'test'
2026-10-10T21:11:43.3234732Z   ...
2026-10-10T21:11:43.3235852Z # Subtest: the first check after Switch on notifies nothing, and only records what waits then
2026-10-10T21:11:43.3237390Z ok 360 - the first check after Switch on notifies nothing, and only records what waits then
2026-10-10T21:11:43.3238198Z   ---
2026-10-10T21:11:43.3238574Z   duration_ms: 8.571379
2026-10-10T21:11:43.3238999Z   type: 'test'
2026-10-10T21:11:43.3239363Z   ...
2026-10-10T21:11:43.3240312Z # Subtest: a file come to wait is notified once, with its text and address, and a file changed again anew
2026-10-10T21:11:43.3241759Z ok 361 - a file come to wait is notified once, with its text and address, and a file changed again anew
2026-10-10T21:11:43.3242601Z   ---
2026-10-10T21:11:43.3242963Z   duration_ms: 2.712136
2026-10-10T21:11:43.3243399Z   type: 'test'
2026-10-10T21:11:43.3243758Z   ...
2026-10-10T21:11:43.3244623Z # Subtest: more than three of one kind in one repository give one notification of their number
2026-10-10T21:11:43.3246244Z ok 362 - more than three of one kind in one repository give one notification of their number
2026-10-10T21:11:43.3247049Z   ---
2026-10-10T21:11:43.3247426Z   duration_ms: 1.873489
2026-10-10T21:11:43.3247856Z   type: 'test'
2026-10-10T21:11:43.3248217Z   ...
2026-10-10T21:11:43.3248964Z # Subtest: a repository that cannot be read is skipped until the next check
2026-10-10T21:11:43.3250144Z ok 363 - a repository that cannot be read is skipped until the next check
2026-10-10T21:11:43.3250846Z   ---
2026-10-10T21:11:43.3251203Z   duration_ms: 2.553229
2026-10-10T21:11:43.3251624Z   type: 'test'
2026-10-10T21:11:43.3251991Z   ...
2026-10-10T21:11:43.3253646Z # Subtest: participantsOf — this instance's register read into participants: a person without a model and a place, a CLI agent with its model and its place
2026-10-10T21:11:43.3256715Z ok 364 - participantsOf — this instance's register read into participants: a person without a model and a place, a CLI agent with its model and its place
2026-10-10T21:11:43.3257989Z   ---
2026-10-10T21:11:43.3258372Z   duration_ms: 3.492824
2026-10-10T21:11:43.3258815Z   type: 'test'
2026-10-10T21:11:43.3259182Z   ...
2026-10-10T21:11:43.3260264Z # Subtest: participantsOf — a row with a context and a price read into numbers and a currency
2026-10-10T21:11:43.3261797Z ok 365 - participantsOf — a row with a context and a price read into numbers and a currency
2026-10-10T21:11:43.3262615Z   ---
2026-10-10T21:11:43.3262982Z   duration_ms: 0.555377
2026-10-10T21:11:43.3263409Z   type: 'test'
2026-10-10T21:11:43.3263787Z   ...
2026-10-10T21:11:43.3265597Z # Subtest: eligible — given the participants read from a register, offers for a role exactly those with every capability it needs
2026-10-10T21:11:43.3268018Z ok 366 - eligible — given the participants read from a register, offers for a role exactly those with every capability it needs
2026-10-10T21:11:43.3269728Z   ---
2026-10-10T21:11:43.3270124Z   duration_ms: 0.499553
2026-10-10T21:11:43.3270562Z   type: 'test'
2026-10-10T21:11:43.3270941Z   ...
2026-10-10T21:11:43.3272712Z # Subtest: participantSchema — the register's schema is read from the module's own participants.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:11:43.3275667Z ok 367 - participantSchema — the register's schema is read from the module's own participants.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:11:43.3276866Z   ---
2026-10-10T21:11:43.3277210Z   duration_ms: 33.047715
2026-10-10T21:11:43.3277595Z   type: 'test'
2026-10-10T21:11:43.3277911Z   ...
2026-10-10T21:11:43.3279289Z # Subtest: participantSchema — this instance's register read into participants, each with its type, capabilities, processing place and model
2026-10-10T21:11:43.3281325Z ok 368 - participantSchema — this instance's register read into participants, each with its type, capabilities, processing place and model
2026-10-10T21:11:43.3282449Z   ---
2026-10-10T21:11:43.3282823Z   duration_ms: 0.891575
2026-10-10T21:11:43.3283235Z   type: 'test'
2026-10-10T21:11:43.3283557Z   ...
2026-10-10T21:11:43.3285186Z # Subtest: participantSchema — an entry of a type outside the five, and a participant based on a language model without its model, named as errors
2026-10-10T21:11:43.3287597Z ok 369 - participantSchema — an entry of a type outside the five, and a participant based on a language model without its model, named as errors
2026-10-10T21:11:43.3288616Z   ---
2026-10-10T21:11:43.3288967Z   duration_ms: 2.08229
2026-10-10T21:11:43.3289379Z   type: 'test'
2026-10-10T21:11:43.3289743Z   ...
2026-10-10T21:11:43.3291135Z # Subtest: eligible — offers for a role exactly the participants with every capability it needs, each with where it processes data
2026-10-10T21:11:43.3293245Z ok 370 - eligible — offers for a role exactly the participants with every capability it needs, each with where it processes data
2026-10-10T21:11:43.3294311Z   ---
2026-10-10T21:11:43.3294687Z   duration_ms: 0.30527
2026-10-10T21:11:43.3295476Z   type: 'test'
2026-10-10T21:11:43.3295851Z   ...
2026-10-10T21:11:43.3297469Z # Subtest: eligible — leaves out a participant whose processing place a restricted source does not allow, naming the place and the source
2026-10-10T21:11:43.3299714Z ok 371 - eligible — leaves out a participant whose processing place a restricted source does not allow, naming the place and the source
2026-10-10T21:11:43.3300754Z   ---
2026-10-10T21:11:43.3301126Z   duration_ms: 0.451614
2026-10-10T21:11:43.3301554Z   type: 'test'
2026-10-10T21:11:43.3301879Z   ...
2026-10-10T21:11:43.3302872Z # Subtest: TST-290101 settings schemas own the canonical product files and pseudonymisation defaults to on
2026-10-10T21:11:43.3304399Z ok 372 - TST-290101 settings schemas own the canonical product files and pseudonymisation defaults to on
2026-10-10T21:11:43.3305599Z   ---
2026-10-10T21:11:43.3305989Z   duration_ms: 7.102576
2026-10-10T21:11:43.3306431Z   type: 'test'
2026-10-10T21:11:43.3306815Z   ...
2026-10-10T21:11:43.3307713Z # Subtest: TST-290102 collaborators schema requires name, account and affirmative agreement
2026-10-10T21:11:43.3309102Z ok 373 - TST-290102 collaborators schema requires name, account and affirmative agreement
2026-10-10T21:11:43.3309944Z   ---
2026-10-10T21:11:43.3310305Z   duration_ms: 2.490933
2026-10-10T21:11:43.3310724Z   type: 'test'
2026-10-10T21:11:43.3311079Z   ...
2026-10-10T21:11:43.3312603Z # Subtest: declarationFindings — a holder that lacks a capability its role needs is an error, naming the holder, the role and the capability
2026-10-10T21:11:43.3315162Z ok 374 - declarationFindings — a holder that lacks a capability its role needs is an error, naming the holder, the role and the capability
2026-10-10T21:11:43.3316595Z   ---
2026-10-10T21:11:43.3316988Z   duration_ms: 8.749462
2026-10-10T21:11:43.3317412Z   type: 'test'
2026-10-10T21:11:43.3317770Z   ...
2026-10-10T21:11:43.3319708Z # Subtest: declarationFindings — a holder at a place a linked source does not permit is a warning naming the holder, the role and the source; a person holding a role is not warned of it
2026-10-10T21:11:43.3322677Z ok 375 - declarationFindings — a holder at a place a linked source does not permit is a warning naming the holder, the role and the source; a person holding a role is not warned of it
2026-10-10T21:11:43.3324102Z   ---
2026-10-10T21:11:43.3324479Z   duration_ms: 3.078871
2026-10-10T21:11:43.3325351Z   type: 'test'
2026-10-10T21:11:43.3325767Z   ...
2026-10-10T21:11:43.3327510Z # Subtest: declarationSchema — the declaration's schema is read from the module's own declaration.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:11:43.3330117Z ok 376 - declarationSchema — the declaration's schema is read from the module's own declaration.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:11:43.3331431Z   ---
2026-10-10T21:11:43.3331820Z   duration_ms: 29.36166
2026-10-10T21:11:43.3332227Z   type: 'test'
2026-10-10T21:11:43.3332581Z   ...
2026-10-10T21:11:43.3334061Z # Subtest: declarationSchema — a product's declaration read by its schema: front matter, roles with their participants, branches and the gates requirements add
2026-10-10T21:11:43.3337184Z ok 377 - declarationSchema — a product's declaration read by its schema: front matter, roles with their participants, branches and the gates requirements add
2026-10-10T21:11:43.3338458Z   ---
2026-10-10T21:11:43.3338836Z   duration_ms: 1.278198
2026-10-10T21:11:43.3339226Z   type: 'test'
2026-10-10T21:11:43.3339564Z   ...
2026-10-10T21:11:43.3340917Z # Subtest: declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding
2026-10-10T21:11:43.3343009Z not ok 378 - declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding
2026-10-10T21:11:43.3344088Z   ---
2026-10-10T21:11:43.3344443Z   duration_ms: 2.409991
2026-10-10T21:11:43.3345141Z   type: 'test'
2026-10-10T21:11:43.3345933Z   location: '/home/runner/work/agent-m/agent-m/tests/product-process.test.mjs:388:1'
2026-10-10T21:11:43.3346747Z   failureType: 'testCodeFailure'
2026-10-10T21:11:43.3347179Z   error: |-
2026-10-10T21:11:43.3347608Z     Expected values to be strictly deep-equal:
2026-10-10T21:11:43.3348106Z     + actual - expected
2026-10-10T21:11:43.3348467Z     
2026-10-10T21:11:43.3348788Z     + []
2026-10-10T21:11:43.3349129Z     - [
2026-10-10T21:11:43.3349452Z     -   [
2026-10-10T21:11:43.3349812Z     -     'Product Owner',
2026-10-10T21:11:43.3350296Z     -     [
2026-10-10T21:11:43.3350656Z     -       'po-opus'
2026-10-10T21:11:43.3351041Z     -     ]
2026-10-10T21:11:43.3351377Z     -   ],
2026-10-10T21:11:43.3351724Z     -   [
2026-10-10T21:11:43.3352091Z     -     'Scrum Master',
2026-10-10T21:11:43.3352510Z     -     [
2026-10-10T21:11:43.3352940Z     -       'scrum-master-session'
2026-10-10T21:11:43.3353422Z     -     ]
2026-10-10T21:11:43.3353777Z     -   ],
2026-10-10T21:11:43.3354110Z     -   [
2026-10-10T21:11:43.3354428Z     -     'Developers',
2026-10-10T21:11:43.3354807Z     -     [
2026-10-10T21:11:43.3355570Z     -       'developer-sonnet-a',
2026-10-10T21:11:43.3356098Z     -       'developer-sonnet-b',
2026-10-10T21:11:43.3356654Z     -       'developer-sonnet-c',
2026-10-10T21:11:43.3357210Z     -       'developer-sonnet-d',
2026-10-10T21:11:43.3357751Z     -       'developer-sonnet-e'
2026-10-10T21:11:43.3358229Z     -     ]
2026-10-10T21:11:43.3358572Z     -   ]
2026-10-10T21:11:43.3358909Z     - ]
2026-10-10T21:11:43.3359241Z     
2026-10-10T21:11:43.3359587Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:43.3360021Z   name: 'AssertionError'
2026-10-10T21:11:43.3360448Z   expected:
2026-10-10T21:11:43.3361059Z     0:
2026-10-10T21:11:43.3361436Z       0: 'Product Owner'
2026-10-10T21:11:43.3361841Z       1:
2026-10-10T21:11:43.3362191Z         0: 'po-opus'
2026-10-10T21:11:43.3362562Z     1:
2026-10-10T21:11:43.3362921Z       0: 'Scrum Master'
2026-10-10T21:11:43.3363316Z       1:
2026-10-10T21:11:43.3363731Z         0: 'scrum-master-session'
2026-10-10T21:11:43.3364198Z     2:
2026-10-10T21:11:43.3364564Z       0: 'Developers'
2026-10-10T21:11:43.3365224Z       1:
2026-10-10T21:11:43.3365668Z         0: 'developer-sonnet-a'
2026-10-10T21:11:43.3366205Z         1: 'developer-sonnet-b'
2026-10-10T21:11:43.3366723Z         2: 'developer-sonnet-c'
2026-10-10T21:11:43.3367242Z         3: 'developer-sonnet-d'
2026-10-10T21:11:43.3367761Z         4: 'developer-sonnet-e'
2026-10-10T21:11:43.3368198Z   actual:
2026-10-10T21:11:43.3368584Z   operator: 'deepStrictEqual'
2026-10-10T21:11:43.3369050Z   stack: |-
2026-10-10T21:11:43.3370004Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/product-process.test.mjs:396:10)
2026-10-10T21:11:43.3371428Z     Test.runInAsyncScope (node:async_hooks:214:14)
2026-10-10T21:11:43.3372200Z     Test.run (node:internal/test_runner/test:1047:25)
2026-10-10T21:11:43.3373098Z     Test.processPendingSubtests (node:internal/test_runner/test:744:18)
2026-10-10T21:11:43.3374025Z     Test.postRun (node:internal/test_runner/test:1173:19)
2026-10-10T21:11:43.3374783Z     Test.run (node:internal/test_runner/test:1101:12)
2026-10-10T21:11:43.3376318Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:43.3377085Z   ...
2026-10-10T21:11:43.3378529Z # Subtest: declarationFindings — the fixture product's declaration, against the catalogue at the commit it names, has no finding
2026-10-10T21:11:43.3381094Z ok 379 - declarationFindings — the fixture product's declaration, against the catalogue at the commit it names, has no finding
2026-10-10T21:11:43.3382194Z   ---
2026-10-10T21:11:43.3382568Z   duration_ms: 7.18463
2026-10-10T21:11:43.3382986Z   type: 'test'
2026-10-10T21:11:43.3383347Z   ...
2026-10-10T21:11:43.3384698Z # Subtest: declarationFindings — a model that the catalogue at the declared commit does not hold at model_file is an error
2026-10-10T21:11:43.3386974Z ok 380 - declarationFindings — a model that the catalogue at the declared commit does not hold at model_file is an error
2026-10-10T21:11:43.3387899Z   ---
2026-10-10T21:11:43.3388232Z   duration_ms: 1.339462
2026-10-10T21:11:43.3388591Z   type: 'test'
2026-10-10T21:11:43.3388933Z   ...
2026-10-10T21:11:43.3390206Z # Subtest: declarationFindings — a model whose findings in the catalogue at the declared commit hold an error is an error
2026-10-10T21:11:43.3392188Z ok 381 - declarationFindings — a model whose findings in the catalogue at the declared commit hold an error is an error
2026-10-10T21:11:43.3393185Z   ---
2026-10-10T21:11:43.3393549Z   duration_ms: 1.657306
2026-10-10T21:11:43.3393968Z   type: 'test'
2026-10-10T21:11:43.3394321Z   ...
2026-10-10T21:11:43.3395576Z # Subtest: declarationFindings — a role that needs a person and has none is an error
2026-10-10T21:11:43.3396838Z ok 382 - declarationFindings — a role that needs a person and has none is an error
2026-10-10T21:11:43.3397511Z   ---
2026-10-10T21:11:43.3397856Z   duration_ms: 2.715632
2026-10-10T21:11:43.3398274Z   type: 'test'
2026-10-10T21:11:43.3398634Z   ...
2026-10-10T21:11:43.3399598Z # Subtest: declarationFindings — a practice the catalogue does not hold is an error
2026-10-10T21:11:43.3400885Z ok 383 - declarationFindings — a practice the catalogue does not hold is an error
2026-10-10T21:11:43.3401543Z   ---
2026-10-10T21:11:43.3401870Z   duration_ms: 1.732296
2026-10-10T21:11:43.3402257Z   type: 'test'
2026-10-10T21:11:43.3402602Z   ...
2026-10-10T21:11:43.3403612Z # Subtest: declarationFindings — a practice whose fits does not name the model is an error
2026-10-10T21:11:43.3405367Z ok 384 - declarationFindings — a practice whose fits does not name the model is an error
2026-10-10T21:11:43.3406487Z   ---
2026-10-10T21:11:43.3406859Z   duration_ms: 1.772972
2026-10-10T21:11:43.3407288Z   type: 'test'
2026-10-10T21:11:43.3407639Z   ...
2026-10-10T21:11:43.3408486Z # Subtest: declarationFindings — a branch for a phase the model lacks is an error
2026-10-10T21:11:43.3409674Z ok 385 - declarationFindings — a branch for a phase the model lacks is an error
2026-10-10T21:11:43.3410406Z   ---
2026-10-10T21:11:43.3410724Z   duration_ms: 3.165562
2026-10-10T21:11:43.3411103Z   type: 'test'
2026-10-10T21:11:43.3411435Z   ...
2026-10-10T21:11:43.3412413Z # Subtest: declarationFindings — a gate whose requirement the instance's SPEC does not hold is an error
2026-10-10T21:11:43.3414076Z ok 386 - declarationFindings — a gate whose requirement the instance's SPEC does not hold is an error
2026-10-10T21:11:43.3415376Z   ---
2026-10-10T21:11:43.3415767Z   duration_ms: 2.391446
2026-10-10T21:11:43.3416175Z   type: 'test'
2026-10-10T21:11:43.3416324Z   ...
2026-10-10T21:11:43.3417798Z # Subtest: workflowOf — the model's phases, transitions, pairs and gates, and the gates the process requirements add, each with its requirement and source
2026-10-10T21:11:43.3419270Z ok 387 - workflowOf — the model's phases, transitions, pairs and gates, and the gates the process requirements add, each with its requirement and source
2026-10-10T21:11:43.3419452Z   ---
2026-10-10T21:11:43.3419623Z   duration_ms: 2.684954
2026-10-10T21:11:43.3419786Z   type: 'test'
2026-10-10T21:11:43.3419936Z   ...
2026-10-10T21:11:43.3421742Z # Subtest: workflowOf — nothing else enters the workflow: a declared practice adds nothing, and a gate whose requirement the SPEC does not hold stays without a source
2026-10-10T21:11:43.3423308Z ok 388 - workflowOf — nothing else enters the workflow: a declared practice adds nothing, and a gate whose requirement the SPEC does not hold stays without a source
2026-10-10T21:11:43.3423484Z   ---
2026-10-10T21:11:43.3423667Z   duration_ms: 2.632608
2026-10-10T21:11:43.3423841Z   type: 'test'
2026-10-10T21:11:43.3423985Z   ...
2026-10-10T21:11:43.3425588Z # Subtest: workflowOf — an explicitly tabled practice adds its phase, artifact, role and marked gate beside the model and requirement gates
2026-10-10T21:11:43.3426904Z ok 389 - workflowOf — an explicitly tabled practice adds its phase, artifact, role and marked gate beside the model and requirement gates
2026-10-10T21:11:43.3427079Z   ---
2026-10-10T21:11:43.3427267Z   duration_ms: 2.655209
2026-10-10T21:11:43.3427436Z   type: 'test'
2026-10-10T21:11:43.3427588Z   ...
2026-10-10T21:11:43.3428702Z # Subtest: workflowOf — a valid practice gate table directly under Adds enters the workflow without an invented heading
2026-10-10T21:11:43.3429752Z ok 390 - workflowOf — a valid practice gate table directly under Adds enters the workflow without an invented heading
2026-10-10T21:11:43.3429902Z   ---
2026-10-10T21:11:43.3430088Z   duration_ms: 2.215638
2026-10-10T21:11:43.3430252Z   type: 'test'
2026-10-10T21:11:43.3430396Z   ...
2026-10-10T21:11:43.3431347Z # Subtest: workflowOf — the job rules are the Definition of Done when the declaration adds no condition
2026-10-10T21:11:43.3432304Z ok 391 - workflowOf — the job rules are the Definition of Done when the declaration adds no condition
2026-10-10T21:11:43.3432478Z   ---
2026-10-10T21:11:43.3432650Z   duration_ms: 2.131431
2026-10-10T21:11:43.3432808Z   type: 'test'
2026-10-10T21:11:43.3432962Z   ...
2026-10-10T21:11:43.3433864Z # Subtest: workflowOf — a practice phase drops its Produces explanation as the model reader does
2026-10-10T21:11:43.3434767Z ok 392 - workflowOf — a practice phase drops its Produces explanation as the model reader does
2026-10-10T21:11:43.3435192Z   ---
2026-10-10T21:11:43.3435376Z   duration_ms: 1.780756
2026-10-10T21:11:43.3435533Z   type: 'test'
2026-10-10T21:11:43.3435685Z   ...
2026-10-10T21:11:43.3436525Z # Subtest: workflowOf — consecutive bare phase and role tables do not cross into each other
2026-10-10T21:11:43.3437357Z ok 393 - workflowOf — consecutive bare phase and role tables do not cross into each other
2026-10-10T21:11:43.3437791Z   ---
2026-10-10T21:11:43.3437967Z   duration_ms: 2.47381
2026-10-10T21:11:43.3438136Z   type: 'test'
2026-10-10T21:11:43.3438287Z   ...
2026-10-10T21:11:43.3439779Z # Subtest: waitingForAcceptance — an open SPEC entry, an open use case and a changed module wait; an accepted decision, an approved and an in-SPEC entry do not
2026-10-10T21:11:43.3441248Z ok 394 - waitingForAcceptance — an open SPEC entry, an open use case and a changed module wait; an accepted decision, an approved and an in-SPEC entry do not
2026-10-10T21:11:43.3441449Z   ---
2026-10-10T21:11:43.3441629Z   duration_ms: 7.637865
2026-10-10T21:11:43.3441790Z   type: 'test'
2026-10-10T21:11:43.3441925Z   ...
2026-10-10T21:11:43.3443235Z # Subtest: waitingForAcceptance — an open architecture decision and a changed use case wait, with no SPEC change queue in the repository
2026-10-10T21:11:43.3444494Z ok 395 - waitingForAcceptance — an open architecture decision and a changed use case wait, with no SPEC change queue in the repository
2026-10-10T21:11:43.3444673Z   ---
2026-10-10T21:11:43.3445260Z   duration_ms: 0.812828
2026-10-10T21:11:43.3445452Z   type: 'test'
2026-10-10T21:11:43.3445601Z   ...
2026-10-10T21:11:43.3446298Z # Subtest: waitingForAcceptance — an empty repository waits for nothing
2026-10-10T21:11:43.3446942Z ok 396 - waitingForAcceptance — an empty repository waits for nothing
2026-10-10T21:11:43.3447098Z   ---
2026-10-10T21:11:43.3447254Z   duration_ms: 0.322633
2026-10-10T21:11:43.3447640Z   type: 'test'
2026-10-10T21:11:43.3447781Z   ...
2026-10-10T21:11:43.3448567Z # Subtest: waitingForAcceptance — a completed candidate run adds its release test report
2026-10-10T21:11:43.3449265Z ok 397 - waitingForAcceptance — a completed candidate run adds its release test report
2026-10-10T21:11:43.3449410Z   ---
2026-10-10T21:11:43.3449572Z   duration_ms: 2.337265
2026-10-10T21:11:43.3449713Z   type: 'test'
2026-10-10T21:11:43.3449921Z   ...
2026-10-10T21:11:43.3450664Z # Subtest: nextVersion — a minor step by default, from the product's own release tags only
2026-10-10T21:11:43.3451431Z ok 398 - nextVersion — a minor step by default, from the product's own release tags only
2026-10-10T21:11:43.3451575Z   ---
2026-10-10T21:11:43.3451737Z   duration_ms: 1.294728
2026-10-10T21:11:43.3451903Z   type: 'test'
2026-10-10T21:11:43.3452046Z   ...
2026-10-10T21:11:43.3452656Z # Subtest: nextVersion — a patch step keeps the minor and steps the patch
2026-10-10T21:11:43.3453247Z ok 399 - nextVersion — a patch step keeps the minor and steps the patch
2026-10-10T21:11:43.3453406Z   ---
2026-10-10T21:11:43.3453554Z   duration_ms: 0.213419
2026-10-10T21:11:43.3453700Z   type: 'test'
2026-10-10T21:11:43.3453831Z   ...
2026-10-10T21:11:43.3454477Z # Subtest: nextVersion — YYYY.1.0 in a new year, whatever step is asked (1a)
2026-10-10T21:11:43.3455425Z ok 400 - nextVersion — YYYY.1.0 in a new year, whatever step is asked (1a)
2026-10-10T21:11:43.3455615Z   ---
2026-10-10T21:11:43.3455791Z   duration_ms: 0.149019
2026-10-10T21:11:43.3455963Z   type: 'test'
2026-10-10T21:11:43.3456098Z   ...
2026-10-10T21:11:43.3456702Z # Subtest: nextVersion — a product with no release tag yet starts at YYYY.1.0
2026-10-10T21:11:43.3457261Z ok 401 - nextVersion — a product with no release tag yet starts at YYYY.1.0
2026-10-10T21:11:43.3457406Z   ---
2026-10-10T21:11:43.3457571Z   duration_ms: 0.183022
2026-10-10T21:11:43.3457703Z   type: 'test'
2026-10-10T21:11:43.3457832Z   ...
2026-10-10T21:11:43.3458887Z # Subtest: startReleaseCandidate — the next free N, and the complete run queued with the candidate's version, tag and changelog entry
2026-10-10T21:11:43.3459900Z ok 402 - startReleaseCandidate — the next free N, and the complete run queued with the candidate's version, tag and changelog entry
2026-10-10T21:11:43.3460040Z   ---
2026-10-10T21:11:43.3460205Z   duration_ms: 6.159595
2026-10-10T21:11:43.3460351Z   type: 'test'
2026-10-10T21:11:43.3460479Z   ...
2026-10-10T21:11:43.3461165Z # Subtest: startReleaseCandidate — the next free N is the greatest existing one plus one
2026-10-10T21:11:43.3462056Z ok 403 - startReleaseCandidate — the next free N is the greatest existing one plus one
2026-10-10T21:11:43.3462196Z   ---
2026-10-10T21:11:43.3462345Z   duration_ms: 1.464104
2026-10-10T21:11:43.3462479Z   type: 'test'
2026-10-10T21:11:43.3462610Z   ...
2026-10-10T21:11:43.3463249Z # Subtest: startReleaseCandidate — TagExists propagates from the host's createTag
2026-10-10T21:11:43.3463873Z ok 404 - startReleaseCandidate — TagExists propagates from the host's createTag
2026-10-10T21:11:43.3464028Z   ---
2026-10-10T21:11:43.3464172Z   duration_ms: 1.055512
2026-10-10T21:11:43.3464331Z   type: 'test'
2026-10-10T21:11:43.3464460Z   ...
2026-10-10T21:11:43.3465476Z # Subtest: startReleaseCandidate — NoRunner naming a person-run level the schedule names no one for
2026-10-10T21:11:43.3466263Z ok 405 - startReleaseCandidate — NoRunner naming a person-run level the schedule names no one for
2026-10-10T21:11:43.3466413Z   ---
2026-10-10T21:11:43.3466560Z   duration_ms: 0.672706
2026-10-10T21:11:43.3466714Z   type: 'test'
2026-10-10T21:11:43.3466838Z   ...
2026-10-10T21:11:43.3467805Z # Subtest: startReleaseCandidate — NoRunner naming "release" where only the implementer could run the release tests (2a)
2026-10-10T21:11:43.3468750Z ok 406 - startReleaseCandidate — NoRunner naming "release" where only the implementer could run the release tests (2a)
2026-10-10T21:11:43.3468882Z   ---
2026-10-10T21:11:43.3469047Z   duration_ms: 1.349059
2026-10-10T21:11:43.3469393Z   type: 'test'
2026-10-10T21:11:43.3469521Z   ...
2026-10-10T21:11:43.3470458Z # Subtest: startReleaseCandidate — no NoRunner where the release row's runner differs from every recorded implementer
2026-10-10T21:11:43.3471364Z ok 407 - startReleaseCandidate — no NoRunner where the release row's runner differs from every recorded implementer
2026-10-10T21:11:43.3471499Z   ---
2026-10-10T21:11:43.3471651Z   duration_ms: 1.127846
2026-10-10T21:11:43.3471790Z   type: 'test'
2026-10-10T21:11:43.3471915Z   ...
2026-10-10T21:11:43.3472708Z # Subtest: releaseReport — its parts in the module's own order, Limitations first, complete and green
2026-10-10T21:11:43.3473510Z ok 408 - releaseReport — its parts in the module's own order, Limitations first, complete and green
2026-10-10T21:11:43.3473669Z   ---
2026-10-10T21:11:43.3473837Z   duration_ms: 6.352925
2026-10-10T21:11:43.3473999Z   type: 'test'
2026-10-10T21:11:43.3474154Z   ...
2026-10-10T21:11:43.3475187Z # Subtest: releaseReport — incomplete while a test has not run on the candidate's commit
2026-10-10T21:11:43.3476004Z ok 409 - releaseReport — incomplete while a test has not run on the candidate's commit
2026-10-10T21:11:43.3476177Z   ---
2026-10-10T21:11:43.3476360Z   duration_ms: 1.255415
2026-10-10T21:11:43.3476529Z   type: 'test'
2026-10-10T21:11:43.3476670Z   ...
2026-10-10T21:11:43.3477964Z # Subtest: releaseReport — a worse model-dependent rate is read against the last release's commit, found in the report `at` already holds
2026-10-10T21:11:43.3479266Z ok 410 - releaseReport — a worse model-dependent rate is read against the last release's commit, found in the report `at` already holds
2026-10-10T21:11:43.3479459Z   ---
2026-10-10T21:11:43.3479637Z   duration_ms: 3.704539
2026-10-10T21:11:43.3479810Z   type: 'test'
2026-10-10T21:11:43.3479965Z   ...
2026-10-10T21:11:43.3481766Z # Subtest: acceptAndRelease — one commit of the report, its approval record and the changelog entry, then the tag on the candidate's own commit, also when the default branch moved on (4b)
2026-10-10T21:11:43.3483607Z ok 411 - acceptAndRelease — one commit of the report, its approval record and the changelog entry, then the tag on the candidate's own commit, also when the default branch moved on (4b)
2026-10-10T21:11:43.3483788Z   ---
2026-10-10T21:11:43.3483974Z   duration_ms: 17.898169
2026-10-10T21:11:43.3484141Z   type: 'test'
2026-10-10T21:11:43.3484284Z   ...
2026-10-10T21:11:43.3485721Z # Subtest: acceptAndRelease — LimitationMissing naming each failing test and worse rate without its reason (3a, 3b)
2026-10-10T21:11:43.3487156Z ok 412 - acceptAndRelease — LimitationMissing naming each failing test and worse rate without its reason (3a, 3b)
2026-10-10T21:11:43.3487334Z   ---
2026-10-10T21:11:43.3487531Z   duration_ms: 6.832351
2026-10-10T21:11:43.3487710Z   type: 'test'
2026-10-10T21:11:43.3487850Z   ...
2026-10-10T21:11:43.3488822Z # Subtest: acceptAndRelease — resolves once every failing test and worse rate has its reason recorded
2026-10-10T21:11:43.3489797Z ok 413 - acceptAndRelease — resolves once every failing test and worse rate has its reason recorded
2026-10-10T21:11:43.3489979Z   ---
2026-10-10T21:11:43.3490166Z   duration_ms: 3.44789
2026-10-10T21:11:43.3490333Z   type: 'test'
2026-10-10T21:11:43.3490483Z   ...
2026-10-10T21:11:43.3491360Z # Subtest: acceptAndRelease — Incomplete while a test has not run on the candidate's commit
2026-10-10T21:11:43.3492219Z ok 414 - acceptAndRelease — Incomplete while a test has not run on the candidate's commit
2026-10-10T21:11:43.3492409Z   ---
2026-10-10T21:11:43.3492591Z   duration_ms: 1.999274
2026-10-10T21:11:43.3492751Z   type: 'test'
2026-10-10T21:11:43.3492902Z   ...
2026-10-10T21:11:43.3493604Z # Subtest: acceptAndRelease — TagExists, an existing tag not moved (4a)
2026-10-10T21:11:43.3494263Z ok 415 - acceptAndRelease — TagExists, an existing tag not moved (4a)
2026-10-10T21:11:43.3494440Z   ---
2026-10-10T21:11:43.3494624Z   duration_ms: 2.400504
2026-10-10T21:11:43.3494797Z   type: 'test'
2026-10-10T21:11:43.3495495Z   ...
2026-10-10T21:11:43.3496633Z # Subtest: reportsAwaitingAcceptance — a candidate's complete run waits, but an unfinished or accepted one does not
2026-10-10T21:11:43.3497748Z ok 416 - reportsAwaitingAcceptance — a candidate's complete run waits, but an unfinished or accepted one does not
2026-10-10T21:11:43.3497929Z   ---
2026-10-10T21:11:43.3498111Z   duration_ms: 1.725914
2026-10-10T21:11:43.3498281Z   type: 'test'
2026-10-10T21:11:43.3498438Z   ...
2026-10-10T21:11:43.3499282Z # Subtest: reportsAwaitingAcceptance — calendar version 2026.10.0 is newer than 2026.9.0
2026-10-10T21:11:43.3500053Z ok 417 - reportsAwaitingAcceptance — calendar version 2026.10.0 is newer than 2026.9.0
2026-10-10T21:11:43.3500204Z   ---
2026-10-10T21:11:43.3500375Z   duration_ms: 0.585484
2026-10-10T21:11:43.3500534Z   type: 'test'
2026-10-10T21:11:43.3500664Z   ...
2026-10-10T21:11:43.3501068Z # {"method":"GET","path":"/v1/pair","status":200,"duration":6}
2026-10-10T21:11:43.3501571Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":3}
2026-10-10T21:11:43.3502417Z # Subtest: TST-263901: public pair and endpoint-test traverse the paired loopback Bridge without URL credentials
2026-10-10T21:11:43.3503246Z ok 418 - TST-263901: public pair and endpoint-test traverse the paired loopback Bridge without URL credentials
2026-10-10T21:11:43.3503391Z   ---
2026-10-10T21:11:43.3503544Z   duration_ms: 90.989215
2026-10-10T21:11:43.3503698Z   type: 'test'
2026-10-10T21:11:43.3503833Z   ...
2026-10-10T21:11:43.3504234Z # {"method":"GET","path":"/v1/pair","status":200,"duration":0}
2026-10-10T21:11:43.3504757Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":4}
2026-10-10T21:11:43.3505713Z # Subtest: TST-263902: public pair and probe name both fetch and response-body timeouts
2026-10-10T21:11:43.3506311Z ok 419 - TST-263902: public pair and probe name both fetch and response-body timeouts
2026-10-10T21:11:43.3506472Z   ---
2026-10-10T21:11:43.3506648Z   duration_ms: 31.875064
2026-10-10T21:11:43.3506809Z   type: 'test'
2026-10-10T21:11:43.3506942Z   ...
2026-10-10T21:11:43.3507634Z # Subtest: TST-268901: real public compose pairs before dispatch and unwraps one controlled endpoint answer
2026-10-10T21:11:43.3508327Z ok 420 - TST-268901: real public compose pairs before dispatch and unwraps one controlled endpoint answer
2026-10-10T21:11:43.3508464Z   ---
2026-10-10T21:11:43.3508624Z   duration_ms: 76.192218
2026-10-10T21:11:43.3508762Z   type: 'test'
2026-10-10T21:11:43.3508885Z   ...
2026-10-10T21:11:43.3509641Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":19}
2026-10-10T21:11:43.3510251Z # Subtest: TST-269901: Route persists, shows, and clears an endpoint through the composed Bridge
2026-10-10T21:11:43.3510841Z ok 421 - TST-269901: Route persists, shows, and clears an endpoint through the composed Bridge
2026-10-10T21:11:43.3510975Z   ---
2026-10-10T21:11:43.3511126Z   duration_ms: 139.228207
2026-10-10T21:11:43.3511268Z   type: 'test'
2026-10-10T21:11:43.3511405Z   ...
2026-10-10T21:11:43.3511865Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":12}
2026-10-10T21:11:43.3512481Z # Subtest: TST-269902: Route preserves provider refusal and saved endpoint through real Bridge
2026-10-10T21:11:43.3513061Z ok 422 - TST-269902: Route preserves provider refusal and saved endpoint through real Bridge
2026-10-10T21:11:43.3513189Z   ---
2026-10-10T21:11:43.3513344Z   duration_ms: 34.768315
2026-10-10T21:11:43.3513502Z   type: 'test'
2026-10-10T21:11:43.3513628Z   ...
2026-10-10T21:11:43.3514229Z # Subtest: TST-269903: absent pairing stores endpoint and emits setup contract without fallback
2026-10-10T21:11:43.3515059Z ok 423 - TST-269903: absent pairing stores endpoint and emits setup contract without fallback
2026-10-10T21:11:43.3515199Z   ---
2026-10-10T21:11:43.3515359Z   duration_ms: 12.465351
2026-10-10T21:11:43.3515507Z   type: 'test'
2026-10-10T21:11:43.3515643Z   ...
2026-10-10T21:11:43.3516283Z # Subtest: TST-269904: Route maps configured HTTPS credentials and names refused/unavailable Bridge
2026-10-10T21:11:43.3517551Z ok 424 - TST-269904: Route maps configured HTTPS credentials and names refused/unavailable Bridge
2026-10-10T21:11:43.3517707Z   ---
2026-10-10T21:11:43.3517875Z   duration_ms: 12.846804
2026-10-10T21:11:43.3518013Z   type: 'test'
2026-10-10T21:11:43.3518143Z   ...
2026-10-10T21:11:43.3518865Z # Subtest: TST-275001: the release Bridge frame keeps configured identity and routes without repository writes
2026-10-10T21:11:43.3519562Z ok 425 - TST-275001: the release Bridge frame keeps configured identity and routes without repository writes
2026-10-10T21:11:43.3519715Z   ---
2026-10-10T21:11:43.3519862Z   duration_ms: 5.705386
2026-10-10T21:11:43.3520004Z   type: 'test'
2026-10-10T21:11:43.3520128Z   ...
2026-10-10T21:11:43.3520824Z # Subtest: TST-275002: the release frame explains pairing and keeps each confirmation to one person decision
2026-10-10T21:11:43.3521494Z ok 426 - TST-275002: the release frame explains pairing and keeps each confirmation to one person decision
2026-10-10T21:11:43.3521646Z   ---
2026-10-10T21:11:43.3521802Z   duration_ms: 2.279397
2026-10-10T21:11:43.3521939Z   type: 'test'
2026-10-10T21:11:43.3522066Z   ...
2026-10-10T21:11:43.3523560Z # native-fixture {"stage":"Electron package acquisition","status":0,"signal":null,"error":null,"stdout":"\\nadded 13 packages in 858ms\\n\\n1 package is looking for funding\\n  run `npm fund` for details\\n","stderr":""}
2026-10-10T21:11:43.3524446Z # native-fixture {"stage":"Electron binary acquisition","status":0,"signal":null,"error":null,"stdout":"","stderr":""}
2026-10-10T21:11:43.3533621Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:43.3535394Z # native-fixture {"stage":"Linux Openbox initial probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3549280Z # native-fixture {"stage":"Linux Openbox diagnostic plan","status":0,"signal":null,"error":null,"elapsedMs":567,"stdout":"Reading package lists...\\nBuilding dependency tree...\\nReading state information...\\nThe following additional packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 poppler-data xfonts-encodings\\n  xfonts-utils\\nSuggested packages:\\n  fonts-freefont-otf | fonts-freefont-ttf fonts-texgyre librsvg2-bin tint2\\n  openbox-gnome-session openbox-kde-session poppler-utils ghostscript\\n  fonts-japanese-mincho | fonts-ipafont-mincho fonts-japanese-gothic\\n  | fonts-ipafont-gothic fonts-arphic-ukai fonts-arphic-uming fonts-nanum\\nRecommended packages:\\n  fonts-droid-fallback libpaper-utils librsvg2-common obconf | obconf-qt scrot\\nThe following NEW packages will be installed:\\n  fonts-urw-base35 libgif7 libgs-common libgs10 libgs10-common libhwy1t64\\n  libid3tag0 libidn12 libijs-0.35 libimlib2t64 libjbig2dec0 libjxl0.7\\n  libobrender32v5 libobt2v5 libpangoxft-1.0-0 libpaper1 librsvg2-2 libspectre1\\n  libstartup-notification0 libxcb-util1 openbox poppler-data xfonts-encodings\\n  xfonts-utils\\n0 upgraded, 24 newly installed, 0 to remove and 6 not upgraded.\\nNeed to get 0 B/22.9 MB of archives.\\nAfter this operation, 75.6 MB of additional disk space will be used.\\n","stderr":"","packages":[],"mirrors":[],"observation":"unparseable-print-uris"}
2026-10-10T21:11:43.3551986Z # native-fixture {"stage":"Linux Openbox install","status":100,"signal":null,"error":null,"stdout":"","stderr":"E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 2999 (apt-get)\\nE: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?\\n"}
2026-10-10T21:11:43.3553076Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3554138Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3555408Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3556495Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3557537Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3558560Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3559594Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3560603Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3561667Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3563006Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3564065Z # native-fixture {"stage":"Linux Openbox ready probe","status":null,"signal":null,"error":"ENOENT","stdout":"undefined","stderr":"undefined"}
2026-10-10T21:11:43.3567284Z # native-fixture {"stage":"Linux Openbox ready probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:43.3568371Z # native-fixture {"stage":"ready","electron":"44.5.1","executable":"/tmp/agent-m-276-release-electron-44/node_modules/electron/dist/electron"}
2026-10-10T21:11:43.3577142Z # native-fixture {"stage":"Linux virtual display probe","status":0,"signal":null,"error":null,"stdout":"Usage: xvfb-run [OPTION ...] COMMAND\\nRun COMMAND (usually an X client) in a virtual X server environment.\\nOptions:\\n-a        --auto-servernum          try to get a free server number, starting at\\n                                    --server-num\\n-e FILE   --error-file=FILE         file used to store xauth errors and Xvfb\\n                                    output (default: /dev/null)\\n-f FILE   --auth-file=FILE          file used to store auth cookie\\n                                    (default: ./.Xauthority)\\n-h        --help                    display this usage message and exit\\n-n NUM    --server-num=NUM          server number to use (default: 99)\\n-l        --listen-tcp              enable TCP port listening in the X server\\n-p PROTO  --xauth-protocol=PROTO    X authority protocol name to use\\n                                    (default: xauth command's default)\\n-s ARGS   --server-args=ARGS        arguments (other than server number and\\n                                    \\"-nolisten tcp\\") to pass to the Xvfb server\\n                                    (default: \\"-screen 0 1280x1024x24\\")\\n","stderr":""}
2026-10-10T21:11:43.3580497Z # native-fixture {"stage":"Linux Openbox initial probe","status":0,"signal":null,"error":null,"stdout":"Openbox 3.6.1\\nCopyright (c) 2004   Mikael Magnusson\\nCopyright (c) 2002   Dana Jansens\\n\\nThis program comes with ABSOLUTELY NO WARRANTY.\\nThis is free software, and you are welcome to redistribute it\\nunder certain conditions. See the file COPYING for details.\\n\\n","stderr":""}
2026-10-10T21:11:43.3581404Z # Subtest: TST-276901: actual forked Electron source keeps its renderer private and pairs only on configured loopback
2026-10-10T21:11:43.3582258Z ok 427 - TST-276901: actual forked Electron source keeps its renderer private and pairs only on configured loopback
2026-10-10T21:11:43.3582426Z   ---
2026-10-10T21:11:43.3582594Z   duration_ms: 2016.958504
2026-10-10T21:11:43.3582735Z   type: 'test'
2026-10-10T21:11:43.3582878Z   ...
2026-10-10T21:11:43.3583298Z # {"method":"GET","path":"/v1/pair","status":200,"duration":9}
2026-10-10T21:11:43.3584129Z # Subtest: TST-280901: public Settings pairs a real Bridge, reloads through Change, and clears raw browser storage
2026-10-10T21:11:43.3585212Z ok 428 - TST-280901: public Settings pairs a real Bridge, reloads through Change, and clears raw browser storage
2026-10-10T21:11:43.3585382Z   ---
2026-10-10T21:11:43.3585585Z   duration_ms: 717.589514
2026-10-10T21:11:43.3585757Z   type: 'test'
2026-10-10T21:11:43.3585889Z   ...
2026-10-10T21:11:43.3586323Z # {"method":"GET","path":"/v1/pair","status":401,"duration":1}
2026-10-10T21:11:43.3587090Z # Subtest: TST-280902: failures do not pair, while configured HTTPS storage stays separate and untested
2026-10-10T21:11:43.3587806Z ok 429 - TST-280902: failures do not pair, while configured HTTPS storage stays separate and untested
2026-10-10T21:11:43.3587949Z   ---
2026-10-10T21:11:43.3588107Z   duration_ms: 576.052658
2026-10-10T21:11:43.3588577Z   type: 'test'
2026-10-10T21:11:43.3588729Z   ...
2026-10-10T21:11:43.3589514Z # Subtest: TST-282901: public canonical plans allocate, command and proxy each configured Bridge session
2026-10-10T21:11:43.3590270Z ok 430 - TST-282901: public canonical plans allocate, command and proxy each configured Bridge session
2026-10-10T21:11:43.3590413Z   ---
2026-10-10T21:11:43.3590567Z   duration_ms: 2.705264
2026-10-10T21:11:43.3590756Z   type: 'test'
2026-10-10T21:11:43.3590932Z   ...
2026-10-10T21:11:43.3591752Z # Subtest: TST-283901: public canonical export isolates, locks, imports and clears Bridge setup settings
2026-10-10T21:11:43.3592550Z ok 431 - TST-283901: public canonical export isolates, locks, imports and clears Bridge setup settings
2026-10-10T21:11:43.3592698Z   ---
2026-10-10T21:11:43.3592882Z   duration_ms: 494.872918
2026-10-10T21:11:43.3593034Z   type: 'test'
2026-10-10T21:11:43.3593188Z   ...
2026-10-10T21:11:43.3593836Z # Subtest: TST-284901: public ensureKey exposes only matching public Bridge key data
2026-10-10T21:11:43.3594463Z ok 432 - TST-284901: public ensureKey exposes only matching public Bridge key data
2026-10-10T21:11:43.3594601Z   ---
2026-10-10T21:11:43.3594797Z   duration_ms: 5595.763916
2026-10-10T21:11:43.3595267Z   type: 'test'
2026-10-10T21:11:43.3595435Z   ...
2026-10-10T21:11:43.3596147Z # Subtest: TST-284902: public ensureKey keeps the exact owner-only pair across Node children
2026-10-10T21:11:43.3596855Z ok 433 - TST-284902: public ensureKey keeps the exact owner-only pair across Node children
2026-10-10T21:11:43.3597233Z   ---
2026-10-10T21:11:43.3597398Z   duration_ms: 630.886984
2026-10-10T21:11:43.3597577Z   type: 'test'
2026-10-10T21:11:43.3597713Z   ...
2026-10-10T21:11:43.3598507Z # Subtest: TST-284903: public ensureKey refuses an unwritable supplied folder without creating a key
2026-10-10T21:11:43.3599246Z ok 434 - TST-284903: public ensureKey refuses an unwritable supplied folder without creating a key
2026-10-10T21:11:43.3599395Z   ---
2026-10-10T21:11:43.3599591Z   duration_ms: 476.595809
2026-10-10T21:11:43.3599736Z   type: 'test'
2026-10-10T21:11:43.3599870Z   ...
2026-10-10T21:11:43.3600279Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":6}
2026-10-10T21:11:43.3600884Z # Subtest: TST-285901: the public tunnel-state route returns only supplied exact states
2026-10-10T21:11:43.3601503Z ok 435 - TST-285901: the public tunnel-state route returns only supplied exact states
2026-10-10T21:11:43.3601633Z   ---
2026-10-10T21:11:43.3601802Z   duration_ms: 128.102221
2026-10-10T21:11:43.3601945Z   type: 'test'
2026-10-10T21:11:43.3602070Z   ...
2026-10-10T21:11:43.3602511Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":0}
2026-10-10T21:11:43.3602916Z # {"method":"GET","path":"/v1/tunnels","status":404,"duration":2}
2026-10-10T21:11:43.3603342Z # {"method":"GET","path":"/v1/tunnels","status":422,"duration":4}
2026-10-10T21:11:43.3603823Z # {"method":"GET","path":"/v1/tunnels","status":502,"duration":1}
2026-10-10T21:11:43.3604587Z # Subtest: TST-285902: supplied tunnel handler absence and failures keep their public meanings
2026-10-10T21:11:43.3605557Z ok 436 - TST-285902: supplied tunnel handler absence and failures keep their public meanings
2026-10-10T21:11:43.3605774Z   ---
2026-10-10T21:11:43.3605953Z   duration_ms: 46.728562
2026-10-10T21:11:43.3606098Z   type: 'test'
2026-10-10T21:11:43.3606230Z   ...
2026-10-10T21:11:43.3606608Z # {"method":"OPTIONS","path":"/v1/tunnels","status":204,"duration":0}
2026-10-10T21:11:43.3606970Z # {"method":"GET","path":"/v1/tunnels","status":403,"duration":0}
2026-10-10T21:11:43.3607324Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":1}
2026-10-10T21:11:43.3607693Z # {"method":"GET","path":"/v1/tunnels","status":401,"duration":2}
2026-10-10T21:11:43.3608064Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":1}
2026-10-10T21:11:43.3608706Z # Subtest: TST-285903: tunnel state preserves origin, preflight, and current-token boundaries
2026-10-10T21:11:43.3609342Z ok 437 - TST-285903: tunnel state preserves origin, preflight, and current-token boundaries
2026-10-10T21:11:43.3609667Z   ---
2026-10-10T21:11:43.3609808Z   duration_ms: 39.67509
2026-10-10T21:11:43.3609935Z   type: 'test'
2026-10-10T21:11:43.3610064Z   ...
2026-10-10T21:11:43.3610459Z # {"method":"GET","path":"/v1/tunnels","status":200,"duration":2}
2026-10-10T21:11:43.3610927Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":503,"duration":4}
2026-10-10T21:11:43.3611422Z # Subtest: TST-285904: pause leaves tunnel state readable and retains work refusal
2026-10-10T21:11:43.3611891Z ok 438 - TST-285904: pause leaves tunnel state readable and retains work refusal
2026-10-10T21:11:43.3612017Z   ---
2026-10-10T21:11:43.3612161Z   duration_ms: 32.300926
2026-10-10T21:11:43.3612294Z   type: 'test'
2026-10-10T21:11:43.3612419Z   ...
2026-10-10T21:11:43.3614013Z # Subtest: TST-285905: tunnel-state logging excludes request credentials and handler data
2026-10-10T21:11:43.3614670Z ok 439 - TST-285905: tunnel-state logging excludes request credentials and handler data
2026-10-10T21:11:43.3615084Z   ---
2026-10-10T21:11:43.3615264Z   duration_ms: 16.907289
2026-10-10T21:11:43.3615427Z   type: 'test'
2026-10-10T21:11:43.3615582Z   ...
2026-10-10T21:11:47.1690731Z # Subtest: TST-286901: public ensureKey persists a real matching Ed25519 pair in a fresh private folder
2026-10-10T21:11:47.1723150Z ok 440 - TST-286901: public ensureKey persists a real matching Ed25519 pair in a fresh private folder
2026-10-10T21:11:47.1785028Z   ---
2026-10-10T21:11:47.1799928Z   duration_ms: 5878.209122
2026-10-10T21:11:47.1808253Z   type: 'test'
2026-10-10T21:11:47.1808851Z   ...
2026-10-10T21:11:47.1810125Z # Subtest: TST-286902: reverse runtime bytes and the authenticated public state handler share the actual open tunnel
2026-10-10T21:11:47.1812025Z ok 441 - TST-286902: reverse runtime bytes and the authenticated public state handler share the actual open tunnel
2026-10-10T21:11:47.1813182Z   ---
2026-10-10T21:11:47.1813783Z   duration_ms: 732.752701
2026-10-10T21:11:47.1814473Z   type: 'test'
2026-10-10T21:11:47.1815285Z   ...
2026-10-10T21:11:47.1816581Z # Subtest: TST-286903: forward runtime keeps loopback, host-key, and keepalive boundaries while carrying bytes
2026-10-10T21:11:47.1818445Z ok 442 - TST-286903: forward runtime keeps loopback, host-key, and keepalive boundaries while carrying bytes
2026-10-10T21:11:47.1819568Z   ---
2026-10-10T21:11:47.1820082Z   duration_ms: 734.598572
2026-10-10T21:11:47.1820651Z   type: 'test'
2026-10-10T21:11:47.1821161Z   ...
2026-10-10T21:11:47.1822359Z # Subtest: TST-286904: public runtime isolates failures, grows reconnect waits, and stops reconnecting after close
2026-10-10T21:11:47.1824209Z ok 443 - TST-286904: public runtime isolates failures, grows reconnect waits, and stops reconnecting after close
2026-10-10T21:11:47.1825576Z   ---
2026-10-10T21:11:47.1826098Z   duration_ms: 1351.178536
2026-10-10T21:11:47.1826789Z   type: 'test'
2026-10-10T21:11:47.1827441Z   ...
2026-10-10T21:11:47.1986320Z # Subtest: TST-287901: public Bridge route persists and renders canonical remote-session setup
2026-10-10T21:11:47.2006460Z ok 444 - TST-287901: public Bridge route persists and renders canonical remote-session setup
2026-10-10T21:11:47.2007304Z   ---
2026-10-10T21:11:47.2036421Z   duration_ms: 21.070262
2026-10-10T21:11:47.2046265Z   type: 'test'
2026-10-10T21:11:47.2047026Z   ...
2026-10-10T21:11:47.2048207Z # Subtest: TST-288901: public Settings exports and imports every implemented setting
2026-10-10T21:11:47.2049816Z ok 445 - TST-288901: public Settings exports and imports every implemented setting
2026-10-10T21:11:47.2050972Z   ---
2026-10-10T21:11:47.2051497Z   duration_ms: 662.681307
2026-10-10T21:11:47.2052299Z   type: 'test'
2026-10-10T21:11:47.2052808Z   ...
2026-10-10T21:11:47.2054085Z # Subtest: TST-289901: public Release route reopens controlled pending report without opening writes
2026-10-10T21:11:47.2056165Z ok 446 - TST-289901: public Release route reopens controlled pending report without opening writes
2026-10-10T21:11:47.2058193Z   ---
2026-10-10T21:11:47.2059036Z   duration_ms: 46.72687
2026-10-10T21:11:47.2059659Z   type: 'test'
2026-10-10T21:11:47.2060448Z   ...
2026-10-10T21:11:47.2061973Z # Subtest: TST-290105: canonical product settings retain unrelated text and switch pseudonymisation off only explicitly
2026-10-10T21:11:47.2064382Z ok 447 - TST-290105: canonical product settings retain unrelated text and switch pseudonymisation off only explicitly
2026-10-10T21:11:47.2066154Z   ---
2026-10-10T21:11:47.2066844Z   duration_ms: 3.491942
2026-10-10T21:11:47.2067929Z   type: 'test'
2026-10-10T21:11:47.2072528Z   ...
2026-10-10T21:11:47.2073948Z # Subtest: TST-290106: canonical collaborator consent is represented in a retained product register
2026-10-10T21:11:47.2076160Z ok 448 - TST-290106: canonical collaborator consent is represented in a retained product register
2026-10-10T21:11:47.2077557Z   ---
2026-10-10T21:11:47.2078466Z   duration_ms: 2.018843
2026-10-10T21:11:47.2079106Z   type: 'test'
2026-10-10T21:11:47.2079935Z   ...
2026-10-10T21:11:47.2081313Z # Subtest: TST-290107: public clearEverything removes all raw instance storage without crossing prefixes
2026-10-10T21:11:47.2083637Z ok 449 - TST-290107: public clearEverything removes all raw instance storage without crossing prefixes
2026-10-10T21:11:47.2084948Z   ---
2026-10-10T21:11:47.2085731Z   duration_ms: 0.37263
2026-10-10T21:11:47.2086469Z   type: 'test'
2026-10-10T21:11:47.2086970Z   ...
2026-10-10T21:11:47.2088499Z # Subtest: TST-290108: public secretValues returns credentials only for both jump-host login shapes
2026-10-10T21:11:47.2090421Z ok 450 - TST-290108: public secretValues returns credentials only for both jump-host login shapes
2026-10-10T21:11:47.2091566Z   ---
2026-10-10T21:11:47.2092158Z   duration_ms: 0.92596
2026-10-10T21:11:47.2092810Z   type: 'test'
2026-10-10T21:11:47.2093298Z   ...
2026-10-10T21:11:49.4823948Z # TST-290115-counterproof {"cases":["TST-290114","TST-290115"],"cwd":"/home/runner/work/agent-m/agent-m/","childArgv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-290114|TST-290115","/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs","/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs"],"childEnvironment":{"AGENT_M_290_ROOT":"/tmp/agent-m-290-fault-Tdil1v/agent-m","AGENT_M_290_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"source":"/tmp/agent-m-290-fault-Tdil1v/agent-m/src/settings-pages/settings.mjs","tests":["/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs","/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs"],"originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultSourceHash":"da20e29b09a94ddb07d012d12fab01f69918d15b3a78b2297c7e50da9e4eb4bd","restoredSourceHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","testHashes":{"/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs":"83758b76c34b1f1213a5a89719b5627dfa3a5de11ba5ae6f1e03b254b3c32c4a","/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs":"6016ef1310941dd90d14ff0bc750e6fd98b81571e64bfe7b988438584951a18b"},"fault":"pane.hidden = !chosen;","faultStarted":"2026-10-10T21:11:47.025Z","faultEnded":"2026-10-10T21:11:48.306Z","faultStatus":1,"faultSignal":null,"faultError":null,"faultNodes":{"TST-290114":"not ok 1 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\n  ---\\n  duration_ms: 274.352287\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:33:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    exactly one panel is shown after a tab selection\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:60:14)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...","TST-290115":"not ok 2 - TST-290115: public Settings tabs fit phone and desktop layouts\\n  ---\\n  duration_ms: 1136.12618\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:72:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    390px: exactly one tab panel is visible; actual={\\"requestedViewport\\":{\\"width\\":390,\\"height\\":900,\\"mobile\\":true},\\"url\\":\\"http://127.0.0.1:33643/docs/\#settings\\",\\"viewport\\":{\\"innerWidth\\":390,\\"innerHeight\\":900,\\"outerWidth\\":390,\\"outerHeight\\":900,\\"visual\\":{\\"width\\":390,\\"height\\":900,\\"scale\\":1},\\"screen\\":{\\"width\\":390,\\"height\\":900}},\\"cdpLayout\\":{\\"layoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"visualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"contentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298},\\"cssLayoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"cssVisualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"cssContentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298}},\\"document\\":{\\"scrollWidth\\":390,\\"clientWidth\\":390},\\"tab\\":{\\"name\\":\\"General\\",\\"label\\":\\"General\\",\\"rect\\":{\\"x\\":16,\\"y\\":287.546875,\\"width\\":78.796875,\\"height\\":38.703125},\\"computed\\":{\\"fontSize\\":\\"14.4px\\",\\"lineHeight\\":\\"22.32px\\",\\"paddingTop\\":\\"7.2px\\",\\"paddingRight\\":\\"12.8px\\",\\"paddingBottom\\":\\"7.2px\\",\\"paddingLeft\\":\\"12.8px\\"},\\"panel\\":{\\"width\\":358,\\"height\\":872.015625,\\"scrollWidth\\":358,\\"clientWidth\\":358},\\"selected\\":\\"true\\",\\"readable\\":true,\\"visible\\":true,\\"visibleCount\\":4,\\"documentOverflow\\":true,\\"panelOverflow\\":true,\\"longValue\\":false}}\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:123:533)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ..."},"faultStdout":"TAP version 13\\n\# Subtest: TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\nnot ok 1 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\n  ---\\n  duration_ms: 274.352287\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:33:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    exactly one panel is shown after a tab selection\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-public-settings-tabs.test.mjs:60:14)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290115: public Settings tabs fit phone and desktop layouts\\nnot ok 2 - TST-290115: public Settings tabs fit phone and desktop layouts\\n  ---\\n  duration_ms: 1136.12618\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:72:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    390px: exactly one tab panel is visible; actual={\\"requestedViewport\\":{\\"width\\":390,\\"height\\":900,\\"mobile\\":true},\\"url\\":\\"http://127.0.0.1:33643/docs/\#settings\\",\\"viewport\\":{\\"innerWidth\\":390,\\"innerHeight\\":900,\\"outerWidth\\":390,\\"outerHeight\\":900,\\"visual\\":{\\"width\\":390,\\"height\\":900,\\"scale\\":1},\\"screen\\":{\\"width\\":390,\\"height\\":900}},\\"cdpLayout\\":{\\"layoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"visualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"contentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298},\\"cssLayoutViewport\\":{\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900},\\"cssVisualViewport\\":{\\"offsetX\\":0,\\"offsetY\\":0,\\"pageX\\":0,\\"pageY\\":0,\\"clientWidth\\":390,\\"clientHeight\\":900,\\"scale\\":1,\\"zoom\\":1},\\"cssContentSize\\":{\\"x\\":0,\\"y\\":0,\\"width\\":390,\\"height\\":3298}},\\"document\\":{\\"scrollWidth\\":390,\\"clientWidth\\":390},\\"tab\\":{\\"name\\":\\"General\\",\\"label\\":\\"General\\",\\"rect\\":{\\"x\\":16,\\"y\\":287.546875,\\"width\\":78.796875,\\"height\\":38.703125},\\"computed\\":{\\"fontSize\\":\\"14.4px\\",\\"lineHeight\\":\\"22.32px\\",\\"paddingTop\\":\\"7.2px\\",\\"paddingRight\\":\\"12.8px\\",\\"paddingBottom\\":\\"7.2px\\",\\"paddingLeft\\":\\"12.8px\\"},\\"panel\\":{\\"width\\":358,\\"height\\":872.015625,\\"scrollWidth\\":358,\\"clientWidth\\":358},\\"selected\\":\\"true\\",\\"readable\\":true,\\"visible\\":true,\\"visibleCount\\":4,\\"documentOverflow\\":true,\\"panelOverflow\\":true,\\"longValue\\":false}}\\n    \\n    4 !== 1\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 1\\n  actual: 4\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-itm-290-public-settings-layout.test.mjs:123:533)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 0\\n\# fail 2\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 1241.491049\\n","faultStderr":"","restoredStarted":"2026-10-10T21:11:48.307Z","restoredEnded":"2026-10-10T21:11:49.474Z","restoredStatus":0,"restoredSignal":null,"restoredError":null,"restoredStdout":"TAP version 13\\n\# Subtest: TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\nok 1 - TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect\\n  ---\\n  duration_ms: 270.82995\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290115: public Settings tabs fit phone and desktop layouts\\nok 2 - TST-290115: public Settings tabs fit phone and desktop layouts\\n  ---\\n  duration_ms: 1028.746711\\n  type: 'test'\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 2\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 1130.592391\\n","restoredStderr":""}
2026-10-10T21:11:49.5399346Z # Subtest: TST-290115: public Settings tabs fit phone and desktop layouts
2026-10-10T21:11:49.5400468Z ok 451 - TST-290115: public Settings tabs fit phone and desktop layouts
2026-10-10T21:11:49.5400864Z   ---
2026-10-10T21:11:49.5401078Z   duration_ms: 6075.055924
2026-10-10T21:11:49.5401341Z   type: 'test'
2026-10-10T21:11:49.5401548Z   ...
2026-10-10T21:11:49.7828898Z # Subtest: release · UC-008 1–5: a use case is read with its diagram and accepted by one commit that names its exact text
2026-10-10T21:11:49.7831313Z ok 452 - release · UC-008 1–5: a use case is read with its diagram and accepted by one commit that names its exact text
2026-10-10T21:11:49.7832604Z   ---
2026-10-10T21:11:49.7833223Z   duration_ms: 384.908404
2026-10-10T21:11:49.7833874Z   type: 'test'
2026-10-10T21:11:49.7834674Z   ...
2026-10-10T21:11:49.7836698Z # Subtest: release · UC-008 5a: an accepted use case edited afterwards shows as changed
2026-10-10T21:11:49.7838357Z ok 453 - release · UC-008 5a: an accepted use case edited afterwards shows as changed
2026-10-10T21:11:49.7839733Z   ---
2026-10-10T21:11:49.7840261Z   duration_ms: 120.596949
2026-10-10T21:11:49.7840907Z   type: 'test'
2026-10-10T21:11:49.7841477Z   ...
2026-10-10T21:11:49.7843073Z # Subtest: release · UC-008 2a: a changed use case shows its difference to the text the most recent record names, across a rename
2026-10-10T21:11:49.7845582Z ok 454 - release · UC-008 2a: a changed use case shows its difference to the text the most recent record names, across a rename
2026-10-10T21:11:49.7847509Z   ---
2026-10-10T21:11:49.7848086Z   duration_ms: 146.968449
2026-10-10T21:11:49.7848704Z   type: 'test'
2026-10-10T21:11:49.7849248Z   ...
2026-10-10T21:11:49.7850783Z # Subtest: release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown
2026-10-10T21:11:49.7853081Z not ok 455 - release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown
2026-10-10T21:11:49.7854322Z   ---
2026-10-10T21:11:49.7855066Z   duration_ms: 119.518803
2026-10-10T21:11:49.7855674Z   type: 'test'
2026-10-10T21:11:49.7856727Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:427:1'
2026-10-10T21:11:49.7858034Z   failureType: 'testCodeFailure'
2026-10-10T21:11:49.7859130Z   error: |-
2026-10-10T21:11:49.7859994Z     The input did not match the regular expression /HostError.*NotFound/i. Input:
2026-10-10T21:11:49.7861165Z     
2026-10-10T21:11:49.7862905Z     ' Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it. '
2026-10-10T21:11:49.7864371Z     
2026-10-10T21:11:49.7865096Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:49.7865699Z   name: 'AssertionError'
2026-10-10T21:11:49.7866268Z   expected:
2026-10-10T21:11:49.7868049Z   actual: ' Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it. '
2026-10-10T21:11:49.7870315Z   operator: 'match'
2026-10-10T21:11:49.7870891Z   stack: |-
2026-10-10T21:11:49.7872142Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:437:10)
2026-10-10T21:11:49.7873570Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:49.7874650Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:49.7875880Z   ...
2026-10-10T21:11:49.7877219Z # Subtest: release · UC-008 3a: Save commits the edited use case, which is then shown again, open
2026-10-10T21:11:49.7879074Z ok 456 - release · UC-008 3a: Save commits the edited use case, which is then shown again, open
2026-10-10T21:11:49.7880159Z   ---
2026-10-10T21:11:49.7880547Z   duration_ms: 190.113333
2026-10-10T21:11:49.7881152Z   type: 'test'
2026-10-10T21:11:49.7883912Z   ...
2026-10-10T21:11:49.7885094Z # Subtest: release · UC-008 3a: a save whose file changed meanwhile writes nothing
2026-10-10T21:11:49.7886382Z ok 457 - release · UC-008 3a: a save whose file changed meanwhile writes nothing
2026-10-10T21:11:49.7887126Z   ---
2026-10-10T21:11:49.7887475Z   duration_ms: 161.460817
2026-10-10T21:11:49.7887879Z   type: 'test'
2026-10-10T21:11:49.7888207Z   ...
2026-10-10T21:11:49.7889388Z # Subtest: release · UC-008 3b: without a token, Accept and Edit open GitHub's own pages, prefilled
2026-10-10T21:11:49.7891185Z ok 458 - release · UC-008 3b: without a token, Accept and Edit open GitHub's own pages, prefilled
2026-10-10T21:11:49.7892045Z   ---
2026-10-10T21:11:49.7892420Z   duration_ms: 149.333846
2026-10-10T21:11:49.7892861Z   type: 'test'
2026-10-10T21:11:49.7893219Z   ...
2026-10-10T21:11:49.7894619Z # Subtest: release · UC-008 3c: a GitLab product without its token is read, offers no Accept or Save, and links to the token step
2026-10-10T21:11:49.7896969Z ok 459 - release · UC-008 3c: a GitLab product without its token is read, offers no Accept or Save, and links to the token step
2026-10-10T21:11:49.7898290Z   ---
2026-10-10T21:11:49.7898667Z   duration_ms: 108.450903
2026-10-10T21:11:49.7899107Z   type: 'test'
2026-10-10T21:11:49.7899482Z   ...
2026-10-10T21:11:49.7900954Z # Subtest: release · UC-008 3d: Accept ticked writes one record per ticked use case in one commit; a file changed since is left out and named
2026-10-10T21:11:49.7903192Z ok 460 - release · UC-008 3d: Accept ticked writes one record per ticked use case in one commit; a file changed since is left out and named
2026-10-10T21:11:49.7904325Z   ---
2026-10-10T21:11:49.7904683Z   duration_ms: 443.350694
2026-10-10T21:11:49.7909375Z   type: 'test'
2026-10-10T21:11:49.7909782Z   ...
2026-10-10T21:11:49.7911292Z # Subtest: release · UC-008 3e: Review all shows every open use case and Accept all writes one record each; a file changed since is left out
2026-10-10T21:11:49.7913504Z ok 461 - release · UC-008 3e: Review all shows every open use case and Accept all writes one record each; a file changed since is left out
2026-10-10T21:11:49.7914618Z   ---
2026-10-10T21:11:49.7915288Z   duration_ms: 348.29728
2026-10-10T21:11:49.7915751Z   type: 'test'
2026-10-10T21:11:49.7916199Z   ...
2026-10-10T21:11:49.7917398Z # Subtest: release · UC-008 3: nothing is written on load or on a script's click; the person's click writes
2026-10-10T21:11:49.7919098Z ok 462 - release · UC-008 3: nothing is written on load or on a script's click; the person's click writes
2026-10-10T21:11:49.7920554Z   ---
2026-10-10T21:11:49.7920922Z   duration_ms: 314.707043
2026-10-10T21:11:49.7921371Z   type: 'test'
2026-10-10T21:11:49.7921741Z   ...
2026-10-10T21:11:49.7923221Z # Subtest: release · UC-006 1–7: a SPEC change is accepted in one commit — record, section byte for byte, decision — and shows as in SPEC
2026-10-10T21:11:49.7925669Z ok 463 - release · UC-006 1–7: a SPEC change is accepted in one commit — record, section byte for byte, decision — and shows as in SPEC
2026-10-10T21:11:49.7926755Z   ---
2026-10-10T21:11:49.7927130Z   duration_ms: 255.186598
2026-10-10T21:11:49.7927578Z   type: 'test'
2026-10-10T21:11:49.7927942Z   ...
2026-10-10T21:11:49.7928999Z # Subtest: release · UC-006 3a: an edited proposal is saved, shown again, and accepted as edited
2026-10-10T21:11:49.7930520Z ok 464 - release · UC-006 3a: an edited proposal is saved, shown again, and accepted as edited
2026-10-10T21:11:49.7931338Z   ---
2026-10-10T21:11:49.7931721Z   duration_ms: 251.794917
2026-10-10T21:11:49.7932185Z   type: 'test'
2026-10-10T21:11:49.7932540Z   ...
2026-10-10T21:11:49.7933906Z # Subtest: release · UC-006 5a: a SPEC section or proposal changed since it was shown is not written; the new state is shown
2026-10-10T21:11:49.7936220Z ok 465 - release · UC-006 5a: a SPEC section or proposal changed since it was shown is not written; the new state is shown
2026-10-10T21:11:49.7937226Z   ---
2026-10-10T21:11:49.7937599Z   duration_ms: 384.665418
2026-10-10T21:11:49.7938015Z   type: 'test'
2026-10-10T21:11:49.7938387Z   ...
2026-10-10T21:11:49.7939824Z # Subtest: release · UC-006 4d: an entry waits for the entry that creates its heading; ticked together both are written in queue order
2026-10-10T21:11:49.7941982Z ok 466 - release · UC-006 4d: an entry waits for the entry that creates its heading; ticked together both are written in queue order
2026-10-10T21:11:49.7943050Z   ---
2026-10-10T21:11:49.7943439Z   duration_ms: 238.171665
2026-10-10T21:11:49.7943874Z   type: 'test'
2026-10-10T21:11:49.7944255Z   ...
2026-10-10T21:11:49.7945752Z # Subtest: release · UC-006 4b: without a token, Accept and Edit open GitHub's pages for the instance, prefilled
2026-10-10T21:11:49.7956959Z ok 467 - release · UC-006 4b: without a token, Accept and Edit open GitHub's pages for the instance, prefilled
2026-10-10T21:11:49.7957914Z   ---
2026-10-10T21:11:49.7958311Z   duration_ms: 161.382742
2026-10-10T21:11:49.7958757Z   type: 'test'
2026-10-10T21:11:49.7959136Z   ...
2026-10-10T21:11:49.7960470Z # Subtest: release · UC-006 4c: a product's SPEC change without a token is not offered GitHub's page; a token is required
2026-10-10T21:11:49.7964211Z not ok 468 - release · UC-006 4c: a product's SPEC change without a token is not offered GitHub's page; a token is required # TODO FINDING R2 — a product's SPEC entry without a token offers GitHub's new-file page, as for the instance (backlog item to be added by the Product Owner)
2026-10-10T21:11:49.7966884Z   ---
2026-10-10T21:11:49.7967282Z   duration_ms: 129.792167
2026-10-10T21:11:49.7967734Z   type: 'test'
2026-10-10T21:11:49.7968642Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:697:1'
2026-10-10T21:11:49.7969680Z   failureType: 'testCodeFailure'
2026-10-10T21:11:49.7970246Z   error: 'no GitHub page for the record'
2026-10-10T21:11:49.7970779Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:49.7971461Z   name: 'AssertionError'
2026-10-10T21:11:49.7971922Z   expected: true
2026-10-10T21:11:49.7972321Z   actual: false
2026-10-10T21:11:49.7972730Z   operator: '=='
2026-10-10T21:11:49.7973144Z   stack: |-
2026-10-10T21:11:49.7974247Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:703:12)
2026-10-10T21:11:49.7975813Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:49.7976776Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:49.7977544Z   ...
2026-10-10T21:11:49.7978580Z # Subtest: release · UC-006 4a: an entry not accepted stays open and nothing is committed
2026-10-10T21:11:49.7980215Z ok 469 - release · UC-006 4a: an entry not accepted stays open and nothing is committed
2026-10-10T21:11:49.7980978Z   ---
2026-10-10T21:11:49.7981345Z   duration_ms: 257.694122
2026-10-10T21:11:49.7981758Z   type: 'test'
2026-10-10T21:11:49.7982094Z   ...
2026-10-10T21:11:49.7983362Z # Subtest: release · UC-014 4a: an approval committed on GitHub's page and not yet applied shows as approved, with why
2026-10-10T21:11:49.7985512Z ok 470 - release · UC-014 4a: an approval committed on GitHub's page and not yet applied shows as approved, with why
2026-10-10T21:11:49.7986525Z   ---
2026-10-10T21:11:49.7986898Z   duration_ms: 255.036445
2026-10-10T21:11:49.7987331Z   type: 'test'
2026-10-10T21:11:49.7987700Z   ...
2026-10-10T21:11:49.7989108Z # Subtest: release · UC-014 6, 7a: without a token the start page offers Finish setting up, with Set up now and Import settings
2026-10-10T21:11:49.7991160Z ok 471 - release · UC-014 6, 7a: without a token the start page offers Finish setting up, with Set up now and Import settings
2026-10-10T21:11:49.7992235Z   ---
2026-10-10T21:11:49.7992591Z   duration_ms: 64.934777
2026-10-10T21:11:49.7993015Z   type: 'test'
2026-10-10T21:11:49.7993376Z   ...
2026-10-10T21:11:49.7994723Z # Subtest: release · UC-014 7: Step A links GitHub's token page prefilled with exactly the permissions every feature needs
2026-10-10T21:11:49.7996975Z ok 472 - release · UC-014 7: Step A links GitHub's token page prefilled with exactly the permissions every feature needs
2026-10-10T21:11:49.7997985Z   ---
2026-10-10T21:11:49.7998349Z   duration_ms: 130.623574
2026-10-10T21:11:49.7998827Z   type: 'test'
2026-10-10T21:11:49.7999205Z   ...
2026-10-10T21:11:49.8000635Z # Subtest: release · UC-014 8–9: Store and check keeps token and expiry after the notice, checks the instance, and shows it ready
2026-10-10T21:11:49.8002844Z ok 473 - release · UC-014 8–9: Store and check keeps token and expiry after the notice, checks the instance, and shows it ready
2026-10-10T21:11:49.8003920Z   ---
2026-10-10T21:11:49.8004290Z   duration_ms: 305.634889
2026-10-10T21:11:49.8004735Z   type: 'test'
2026-10-10T21:11:49.8005358Z   ...
2026-10-10T21:11:49.8006792Z # Subtest: release · UC-014 6a: without setup, the dashboard reads public repositories and accepting goes through GitHub's page
2026-10-10T21:11:49.8008921Z ok 474 - release · UC-014 6a: without setup, the dashboard reads public repositories and accepting goes through GitHub's page
2026-10-10T21:11:49.8010257Z   ---
2026-10-10T21:11:49.8010625Z   duration_ms: 112.551058
2026-10-10T21:11:49.8011065Z   type: 'test'
2026-10-10T21:11:49.8011423Z   ...
2026-10-10T21:11:49.8012732Z # Subtest: release · UC-042 1: Settings is reached from the gear; a stored token is hidden until Show reveals it in full
2026-10-10T21:11:49.8014626Z ok 475 - release · UC-042 1: Settings is reached from the gear; a stored token is hidden until Show reveals it in full
2026-10-10T21:11:49.8015837Z   ---
2026-10-10T21:11:49.8016255Z   duration_ms: 191.201547
2026-10-10T21:11:49.8016758Z   type: 'test'
2026-10-10T21:11:49.8017111Z   ...
2026-10-10T21:11:49.8018368Z # Subtest: release · UC-042 2: Test sends one harmless request to GitHub and the line shows ✓ works with the date
2026-10-10T21:11:49.8020229Z ok 476 - release · UC-042 2: Test sends one harmless request to GitHub and the line shows ✓ works with the date
2026-10-10T21:11:49.8021162Z   ---
2026-10-10T21:11:49.8021522Z   duration_ms: 309.947424
2026-10-10T21:11:49.8021935Z   type: 'test'
2026-10-10T21:11:49.8022311Z   ...
2026-10-10T21:11:49.8023517Z # Subtest: release · UC-042 2: Change stores a new token with its expiry date, preset to 90 days, after the notice
2026-10-10T21:11:49.8025551Z ok 477 - release · UC-042 2: Change stores a new token with its expiry date, preset to 90 days, after the notice
2026-10-10T21:11:49.8026493Z   ---
2026-10-10T21:11:49.8026864Z   duration_ms: 212.614582
2026-10-10T21:11:49.8027287Z   type: 'test'
2026-10-10T21:11:49.8027898Z   ...
2026-10-10T21:11:49.8029119Z # Subtest: release · UC-042 2: Clear asks once, says what stops working, and removes the token from localStorage
2026-10-10T21:11:49.8030876Z ok 478 - release · UC-042 2: Clear asks once, says what stops working, and removes the token from localStorage
2026-10-10T21:11:49.8031793Z   ---
2026-10-10T21:11:49.8032159Z   duration_ms: 216.737289
2026-10-10T21:11:49.8032590Z   type: 'test'
2026-10-10T21:11:49.8032940Z   ...
2026-10-10T21:11:49.8034100Z # Subtest: release · UC-042 1a: a token expiring within fourteen days is warned of on every page, with Renew
2026-10-10T21:11:49.8036099Z ok 479 - release · UC-042 1a: a token expiring within fourteen days is warned of on every page, with Renew
2026-10-10T21:11:49.8037006Z   ---
2026-10-10T21:11:49.8037359Z   duration_ms: 340.396634
2026-10-10T21:11:49.8037788Z   type: 'test'
2026-10-10T21:11:49.8038142Z   ...
2026-10-10T21:11:50.0482247Z # Subtest: release · UC-042 1a: the expiry line offers the paste field for the renewed value
2026-10-10T21:11:50.0507387Z not ok 480 - release · UC-042 1a: the expiry line offers the paste field for the renewed value # TODO FINDING R3 — the expiry line names where to paste, but offers no paste field (backlog item to be added by the Product Owner)
2026-10-10T21:11:50.0539491Z   ---
2026-10-10T21:11:50.0540121Z   duration_ms: 265.847988
2026-10-10T21:11:50.0540676Z   type: 'test'
2026-10-10T21:11:50.0541745Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:928:1'
2026-10-10T21:11:50.0543255Z   failureType: 'testCodeFailure'
2026-10-10T21:11:50.0543971Z   error: 'a paste field, or a control that opens it'
2026-10-10T21:11:50.0544644Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:50.0545455Z   name: 'AssertionError'
2026-10-10T21:11:50.0546062Z   expected: true
2026-10-10T21:11:50.0546592Z   actual: false
2026-10-10T21:11:50.0547096Z   operator: '=='
2026-10-10T21:11:50.0547587Z   stack: |-
2026-10-10T21:11:50.0548781Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:939:12)
2026-10-10T21:11:50.0562635Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:50.0563766Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:50.0564608Z   ...
2026-10-10T21:11:50.5087119Z # Subtest: release · UC-042 1b: a refused token is named, GitHub's with Renew, a GitLab project's with its Access tokens page
2026-10-10T21:11:50.5089237Z ok 481 - release · UC-042 1b: a refused token is named, GitHub's with Renew, a GitLab project's with its Access tokens page
2026-10-10T21:11:50.5090513Z   ---
2026-10-10T21:11:50.5095681Z   duration_ms: 460.726802
2026-10-10T21:11:50.5096289Z   type: 'test'
2026-10-10T21:11:50.5096653Z   ...
2026-10-10T21:11:50.6653635Z # Subtest: release · UC-042 3a: without a token the product section is read-only and links to UC-001's token step
2026-10-10T21:11:50.6655801Z ok 482 - release · UC-042 3a: without a token the product section is read-only and links to UC-001's token step
2026-10-10T21:11:50.6657143Z   ---
2026-10-10T21:11:50.6657513Z   duration_ms: 156.797428
2026-10-10T21:11:50.6657924Z   type: 'test'
2026-10-10T21:11:50.6658272Z   ...
2026-10-10T21:11:50.8779812Z # Subtest: release · UC-042 4: pseudonymisation is on by default; switching it off states what follows, then commits docs/settings.md
2026-10-10T21:11:50.8781351Z ok 483 - release · UC-042 4: pseudonymisation is on by default; switching it off states what follows, then commits docs/settings.md
2026-10-10T21:11:50.8782044Z   ---
2026-10-10T21:11:50.8782278Z   duration_ms: 212.836601
2026-10-10T21:11:50.8782532Z   type: 'test'
2026-10-10T21:11:50.8782763Z   ...
2026-10-10T21:11:51.1012315Z # Subtest: release · UC-042 4a: switching back on is saved without a notice; the page says earlier data stays in the history
2026-10-10T21:11:51.1015076Z ok 484 - release · UC-042 4a: switching back on is saved without a notice; the page says earlier data stays in the history
2026-10-10T21:11:51.1016128Z   ---
2026-10-10T21:11:51.1016489Z   duration_ms: 223.07964
2026-10-10T21:11:51.1016907Z   type: 'test'
2026-10-10T21:11:51.1017266Z   ...
2026-10-10T21:11:51.3109923Z # Subtest: release · UC-042 5: + Collaborator with the person's consent commits docs/collaborators.md, without it nothing
2026-10-10T21:11:51.3112718Z ok 485 - release · UC-042 5: + Collaborator with the person's consent commits docs/collaborators.md, without it nothing
2026-10-10T21:11:51.3113978Z   ---
2026-10-10T21:11:51.3114424Z   duration_ms: 209.572594
2026-10-10T21:11:51.3115153Z   type: 'test'
2026-10-10T21:11:51.3115601Z   ...
2026-10-10T21:11:51.4686815Z # Subtest: release · UC-042 6: Clear everything removes every entry from localStorage
2026-10-10T21:11:51.4688322Z ok 486 - release · UC-042 6: Clear everything removes every entry from localStorage
2026-10-10T21:11:51.4689062Z   ---
2026-10-10T21:11:51.4689415Z   duration_ms: 157.453112
2026-10-10T21:11:51.4689833Z   type: 'test'
2026-10-10T21:11:51.4690171Z   ...
2026-10-10T21:11:51.5848710Z # Subtest: release · UC-042: every line and section of the settings page explains itself
2026-10-10T21:11:51.5850324Z ok 487 - release · UC-042: every line and section of the settings page explains itself
2026-10-10T21:11:51.5851537Z   ---
2026-10-10T21:11:51.5852693Z   duration_ms: 116.35479
2026-10-10T21:11:51.5853627Z   type: 'test'
2026-10-10T21:11:51.5854464Z   ...
2026-10-10T21:11:51.6868451Z # Subtest: release · A TOKEN IS SCOPED TO WHAT IT WRITES: the settings page states the minimum scope and why each part is needed
2026-10-10T21:11:51.6871363Z ok 488 - release · A TOKEN IS SCOPED TO WHAT IT WRITES: the settings page states the minimum scope and why each part is needed
2026-10-10T21:11:51.6872383Z   ---
2026-10-10T21:11:51.6872934Z   duration_ms: 101.676263
2026-10-10T21:11:51.6873610Z   type: 'test'
2026-10-10T21:11:51.6874215Z   ...
2026-10-10T21:11:51.8451602Z # Subtest: release · A USED-UP RATE LIMIT IS NAMED: the account's or the network's limit with its reset time, never the token
2026-10-10T21:11:51.8457536Z ok 489 - release · A USED-UP RATE LIMIT IS NAMED: the account's or the network's limit with its reset time, never the token
2026-10-10T21:11:51.8458961Z   ---
2026-10-10T21:11:51.8459604Z   duration_ms: 158.493527
2026-10-10T21:11:51.8460264Z   type: 'test'
2026-10-10T21:11:51.8460816Z   ...
2026-10-10T21:11:51.8953542Z # Subtest: release · AN EXPIRED TOKEN IS NAMED: a refused token is named with the link to renew it
2026-10-10T21:11:51.8955530Z ok 490 - release · AN EXPIRED TOKEN IS NAMED: a refused token is named with the link to renew it
2026-10-10T21:11:51.8956464Z   ---
2026-10-10T21:11:51.8956874Z   duration_ms: 50.669964
2026-10-10T21:11:51.8957318Z   type: 'test'
2026-10-10T21:11:51.8957980Z   ...
2026-10-10T21:11:51.9216387Z # Subtest: release · git host: a write without an authority is refused before any request is sent
2026-10-10T21:11:51.9247120Z ok 491 - release · git host: a write without an authority is refused before any request is sent
2026-10-10T21:11:51.9248503Z   ---
2026-10-10T21:11:51.9248969Z   duration_ms: 4.116924
2026-10-10T21:11:51.9249478Z   type: 'test'
2026-10-10T21:11:51.9249996Z   ...
2026-10-10T21:11:51.9251298Z # Subtest: release · git host: each of the three authorities writes one commit with the person's own token
2026-10-10T21:11:51.9252315Z ok 492 - release · git host: each of the three authorities writes one commit with the person's own token
2026-10-10T21:11:51.9252784Z   ---
2026-10-10T21:11:51.9252990Z   duration_ms: 48.054755
2026-10-10T21:11:51.9253252Z   type: 'test'
2026-10-10T21:11:51.9253448Z   ...
2026-10-10T21:11:51.9253937Z # Subtest: release · git host: a save whose file changed on the branch writes nothing
2026-10-10T21:11:51.9254623Z ok 493 - release · git host: a save whose file changed on the branch writes nothing
2026-10-10T21:11:51.9255481Z   ---
2026-10-10T21:11:51.9255690Z   duration_ms: 3.432307
2026-10-10T21:11:51.9255923Z   type: 'test'
2026-10-10T21:11:51.9256113Z   ...
2026-10-10T21:11:51.9257226Z # Subtest: release · git host: a 403 with a used-up limit is the account's or the network's limit, not a refused token
2026-10-10T21:11:51.9258969Z ok 494 - release · git host: a 403 with a used-up limit is the account's or the network's limit, not a refused token
2026-10-10T21:11:51.9259894Z   ---
2026-10-10T21:11:51.9260124Z   duration_ms: 1.496515
2026-10-10T21:11:51.9260356Z   type: 'test'
2026-10-10T21:11:51.9260549Z   ...
2026-10-10T21:11:51.9261067Z # Subtest: release · git host: a 401 names the refused token and where it is renewed
2026-10-10T21:11:51.9262386Z ok 495 - release · git host: a 401 names the refused token and where it is renewed
2026-10-10T21:11:51.9262975Z   ---
2026-10-10T21:11:51.9263315Z   duration_ms: 0.593076
2026-10-10T21:11:51.9263649Z   type: 'test'
2026-10-10T21:11:51.9263942Z   ...
2026-10-10T21:11:51.9264703Z # Subtest: release · git host: the GitHub token is sent to GitHub's API only
2026-10-10T21:11:51.9265650Z ok 496 - release · git host: the GitHub token is sent to GitHub's API only
2026-10-10T21:11:51.9266026Z   ---
2026-10-10T21:11:51.9266224Z   duration_ms: 0.72838
2026-10-10T21:11:51.9266438Z   type: 'test'
2026-10-10T21:11:51.9266630Z   ...
2026-10-10T21:11:51.9267332Z # Subtest: release · ITM-126 identifierKept: a changed identifier is a finding in the compiler form; the same identifier is none
2026-10-10T21:11:51.9268368Z ok 497 - release · ITM-126 identifierKept: a changed identifier is a finding in the compiler form; the same identifier is none
2026-10-10T21:11:51.9268902Z   ---
2026-10-10T21:11:51.9269324Z   duration_ms: 2.656938
2026-10-10T21:11:51.9269543Z   type: 'test'
2026-10-10T21:11:51.9269729Z   ...
2026-10-10T21:11:51.9270383Z # Subtest: release · ITM-126 identifierKept: a text that lost its identifier is a finding too
2026-10-10T21:11:51.9271870Z ok 498 - release · ITM-126 identifierKept: a text that lost its identifier is a finding too
2026-10-10T21:11:51.9272683Z   ---
2026-10-10T21:11:51.9273045Z   duration_ms: 0.275147
2026-10-10T21:11:51.9273471Z   type: 'test'
2026-10-10T21:11:51.9273852Z   ...
2026-10-10T21:11:51.9275351Z # Subtest: release · ITM-126 identifierKept: a text with CR LF line ends that keeps its identifier is no finding
2026-10-10T21:11:51.9277130Z ok 499 - release · ITM-126 identifierKept: a text with CR LF line ends that keeps its identifier is no finding
2026-10-10T21:11:51.9278086Z   ---
2026-10-10T21:11:51.9278470Z   duration_ms: 0.317287
2026-10-10T21:11:51.9278901Z   type: 'test'
2026-10-10T21:11:51.9279272Z   ...
2026-10-10T21:11:51.9280475Z # Subtest: release · ITM-126 formatChecks: the identifier finding comes once, as identifierKept gives it
2026-10-10T21:11:51.9282260Z ok 500 - release · ITM-126 formatChecks: the identifier finding comes once, as identifierKept gives it
2026-10-10T21:11:51.9283198Z   ---
2026-10-10T21:11:51.9283576Z   duration_ms: 5.35845
2026-10-10T21:11:51.9283995Z   type: 'test'
2026-10-10T21:11:51.9284444Z   ...
2026-10-10T21:11:53.4836175Z # Subtest: release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a use case saved under another identifier is refused, nothing is written
2026-10-10T21:11:53.4839011Z ok 501 - release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a use case saved under another identifier is refused, nothing is written
2026-10-10T21:11:53.4840036Z   ---
2026-10-10T21:11:53.4840374Z   duration_ms: 734.808984
2026-10-10T21:11:53.4840764Z   type: 'test'
2026-10-10T21:11:53.4841087Z   ...
2026-10-10T21:11:53.4842446Z # Subtest: release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a decision and a module saved under another identifier are refused
2026-10-10T21:11:53.4844475Z ok 502 - release · ITM-126 AN EDITED FILE KEEPS ITS IDENTIFIER: a decision and a module saved under another identifier are refused
2026-10-10T21:11:53.4845792Z   ---
2026-10-10T21:11:53.4846138Z   duration_ms: 565.035943
2026-10-10T21:11:53.4846526Z   type: 'test'
2026-10-10T21:11:53.4846844Z   ...
2026-10-10T21:11:53.4848071Z # Subtest: release · ITM-129 UC-024: a page load of every address asks for no file below docs/assets/ that is not there
2026-10-10T21:11:53.4849845Z ok 503 - release · ITM-129 UC-024: a page load of every address asks for no file below docs/assets/ that is not there
2026-10-10T21:11:53.4850727Z   ---
2026-10-10T21:11:53.4851052Z   duration_ms: 2622.31813
2026-10-10T21:11:53.4851439Z   type: 'test'
2026-10-10T21:11:53.4851761Z   ...
2026-10-10T21:11:53.4852936Z # Subtest: release · ITM-129 UC-024: every menu entry and view of today is shown; a view whose file is not built is not
2026-10-10T21:11:53.4854640Z ok 504 - release · ITM-129 UC-024: every menu entry and view of today is shown; a view whose file is not built is not
2026-10-10T21:11:53.4855978Z   ---
2026-10-10T21:11:53.4856347Z   duration_ms: 1926.862187
2026-10-10T21:11:53.4856782Z   type: 'test'
2026-10-10T21:11:53.4857120Z   ...
2026-10-10T21:11:53.4858426Z # Subtest: release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: no file of the dashboard imports the git host's request helper
2026-10-10T21:11:53.4860356Z ok 505 - release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: no file of the dashboard imports the git host's request helper
2026-10-10T21:11:53.4861331Z   ---
2026-10-10T21:11:53.4861685Z   duration_ms: 6.766849
2026-10-10T21:11:53.4862093Z   type: 'test'
2026-10-10T21:11:53.4862445Z   ...
2026-10-10T21:11:53.4864002Z # Subtest: release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: the dashboard reads through no name of the git host that MOD-git-host does not provide
2026-10-10T21:11:53.4886618Z ok 506 - release · ITM-130 EVERY ARTIFACT NAMES ITS ORIGIN: the dashboard reads through no name of the git host that MOD-git-host does not provide
2026-10-10T21:11:53.4888183Z   ---
2026-10-10T21:11:53.4888575Z   duration_ms: 11.108025
2026-10-10T21:11:53.4889021Z   type: 'test'
2026-10-10T21:11:53.4889418Z   ...
2026-10-10T21:11:53.4890375Z # Subtest: release · ITM-130 ARC-003: no file of the dashboard calls fetch itself
2026-10-10T21:11:53.4891681Z ok 507 - release · ITM-130 ARC-003: no file of the dashboard calls fetch itself
2026-10-10T21:11:53.4892425Z   ---
2026-10-10T21:11:53.4892824Z   duration_ms: 2.719866
2026-10-10T21:11:53.4893266Z   type: 'test'
2026-10-10T21:11:53.4893627Z   ...
2026-10-10T21:11:53.6990654Z # Subtest: release · ITM-130 UC-008 2a: the last accepted text is read by its blob and refused unless it hashes to that SHA
2026-10-10T21:11:53.6993709Z ok 508 - release · ITM-130 UC-008 2a: the last accepted text is read by its blob and refused unless it hashes to that SHA
2026-10-10T21:11:53.6995021Z   ---
2026-10-10T21:11:53.6995531Z   duration_ms: 216.496705
2026-10-10T21:11:53.6996103Z   type: 'test'
2026-10-10T21:11:53.6996429Z   ...
2026-10-10T21:11:53.8556632Z # Subtest: release · ITM-133 UC-008 4a: an Accept refused for missing write access offers GitHub's new-file page with the record, as a link
2026-10-10T21:11:53.8558929Z ok 509 - release · ITM-133 UC-008 4a: an Accept refused for missing write access offers GitHub's new-file page with the record, as a link
2026-10-10T21:11:53.8559961Z   ---
2026-10-10T21:11:53.8560299Z   duration_ms: 156.080011
2026-10-10T21:11:53.8561114Z   type: 'test'
2026-10-10T21:11:53.8561439Z   ...
2026-10-10T21:11:54.0289019Z # Subtest: release · ITM-133 UC-008 4a: an Accept refused for a used-up rate limit gets no GitHub path and no word of write access
2026-10-10T21:11:54.0290223Z ok 510 - release · ITM-133 UC-008 4a: an Accept refused for a used-up rate limit gets no GitHub path and no word of write access
2026-10-10T21:11:54.0290776Z   ---
2026-10-10T21:11:54.0290997Z   duration_ms: 172.942666
2026-10-10T21:11:54.0291241Z   type: 'test'
2026-10-10T21:11:54.0291472Z   ...
2026-10-10T21:11:54.4153101Z # Subtest: release · ITM-133 UC-008 4a: a GitLab product's refused Accept offers no GitHub path
2026-10-10T21:11:54.4155377Z ok 511 - release · ITM-133 UC-008 4a: a GitLab product's refused Accept offers no GitHub path
2026-10-10T21:11:54.4156384Z   ---
2026-10-10T21:11:54.4156969Z   duration_ms: 387.079296
2026-10-10T21:11:54.4157632Z   type: 'test'
2026-10-10T21:11:54.4158009Z   ...
2026-10-10T21:11:54.6271947Z # Subtest: release · ITM-133 UC-008 3d·4a: Accept ticked refused for missing write access offers the GitHub path for each ticked record
2026-10-10T21:11:54.6277863Z not ok 512 - release · ITM-133 UC-008 3d·4a: Accept ticked refused for missing write access offers the GitHub path for each ticked record # TODO FINDING A3 — docs/assets/dashboard/review-views.mjs runAccept: a batch (Accept ticked, Accept all) refused for missing write access gets the sentence only, no GitHub path — ITM-133 back to Development
2026-10-10T21:11:54.6280605Z   ---
2026-10-10T21:11:54.6280981Z   duration_ms: 210.919868
2026-10-10T21:11:54.6281407Z   type: 'test'
2026-10-10T21:11:54.6282313Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:741:1'
2026-10-10T21:11:54.6283325Z   failureType: 'testCodeFailure'
2026-10-10T21:11:54.6283826Z   error: ''
2026-10-10T21:11:54.6284198Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:54.6284669Z   name: 'AssertionError'
2026-10-10T21:11:54.6285361Z   expected: true
2026-10-10T21:11:54.6285762Z   actual: false
2026-10-10T21:11:54.6286127Z   operator: '=='
2026-10-10T21:11:54.6286492Z   stack: |-
2026-10-10T21:11:54.6287554Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:754:12)
2026-10-10T21:11:54.6288862Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:54.6289794Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:54.6290528Z   ...
2026-10-10T21:11:54.7881490Z # Subtest: release · ITM-133 UC-008 3a·4a: a Save refused for missing write access offers GitHub's editor for the file
2026-10-10T21:11:54.7885729Z not ok 513 - release · ITM-133 UC-008 3a·4a: a Save refused for missing write access offers GitHub's editor for the file # TODO FINDING A4 — docs/assets/dashboard/review-views.mjs wireCommon: a Save refused for missing write access shows the sentence only, no GitHub route for the edit — ITM-133 back to Development
2026-10-10T21:11:54.7888068Z   ---
2026-10-10T21:11:54.7888469Z   duration_ms: 160.729055
2026-10-10T21:11:54.7888920Z   type: 'test'
2026-10-10T21:11:54.7889845Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:761:1'
2026-10-10T21:11:54.7890868Z   failureType: 'testCodeFailure'
2026-10-10T21:11:54.7892680Z   error: "GitHub's editor offered: Your token cannot write to akmaier/agent-m (POST /git/trees: 403 Resource not accessible by personal access token). Extend it in Settings, or remove it to use GitHub's page instead. "
2026-10-10T21:11:54.7894362Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:54.7894817Z   name: 'AssertionError'
2026-10-10T21:11:54.7895539Z   expected: true
2026-10-10T21:11:54.7895945Z   actual: false
2026-10-10T21:11:54.7896339Z   operator: '=='
2026-10-10T21:11:54.7896725Z   stack: |-
2026-10-10T21:11:54.7897838Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-a-dashboard-app.test.mjs:773:12)
2026-10-10T21:11:54.7899649Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:54.7900611Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:54.7901358Z   ...
2026-10-10T21:11:55.1435989Z # Subtest: release · ITM-136 UC-042 1: the GitHub token's ✓ works and its date are shown after a reload
2026-10-10T21:11:55.1437983Z ok 514 - release · ITM-136 UC-042 1: the GitHub token's ✓ works and its date are shown after a reload
2026-10-10T21:11:55.1438800Z   ---
2026-10-10T21:11:55.1439222Z   duration_ms: 355.567495
2026-10-10T21:11:55.1439578Z   type: 'test'
2026-10-10T21:11:55.1439787Z   ...
2026-10-10T21:11:55.4806650Z # Subtest: release · ITM-136 UC-042 1b: a GitHub token refused at its last use is shown refused after a reload, on its line and at the top
2026-10-10T21:11:55.4809530Z ok 515 - release · ITM-136 UC-042 1b: a GitHub token refused at its last use is shown refused after a reload, on its line and at the top
2026-10-10T21:11:55.4810512Z   ---
2026-10-10T21:11:55.4810830Z   duration_ms: 337.601777
2026-10-10T21:11:55.4811158Z   type: 'test'
2026-10-10T21:11:55.4811436Z   ...
2026-10-10T21:11:56.2707650Z # Subtest: release · ITM-136 UC-042 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:11:56.2710230Z ok 516 - release · ITM-136 UC-042 1: a GitLab project token's last test — works, then refused — is shown after a reload
2026-10-10T21:11:56.2711507Z   ---
2026-10-10T21:11:56.2712161Z   duration_ms: 783.900966
2026-10-10T21:11:56.2713163Z   type: 'test'
2026-10-10T21:11:56.2714020Z   ...
2026-10-10T21:11:56.7758313Z # Subtest: release · ITM-136 UC-042 2: a new token stored with Change does not inherit the old token's ✓ works
2026-10-10T21:11:56.7776356Z ok 517 - release · ITM-136 UC-042 2: a new token stored with Change does not inherit the old token's ✓ works
2026-10-10T21:11:56.7795200Z   ---
2026-10-10T21:11:56.7802919Z   duration_ms: 505.040443
2026-10-10T21:11:56.7803655Z   type: 'test'
2026-10-10T21:11:56.7804235Z   ...
2026-10-10T21:11:57.1859311Z # Subtest: release · ITM-136 UC-042 2: Clear removes the token's kept test with the token, from localStorage itself
2026-10-10T21:11:57.1864328Z ok 518 - release · ITM-136 UC-042 2: Clear removes the token's kept test with the token, from localStorage itself
2026-10-10T21:11:57.1865744Z   ---
2026-10-10T21:11:57.1866255Z   duration_ms: 415.856654
2026-10-10T21:11:57.1866811Z   type: 'test'
2026-10-10T21:11:57.1867304Z   ...
2026-10-10T21:11:57.8108546Z # Subtest: release · ITM-136 EVERY SETTING IS REACHED FROM ONE PAGE: every key kept after the tests is named on the settings page
2026-10-10T21:11:57.8113824Z ok 519 - release · ITM-136 EVERY SETTING IS REACHED FROM ONE PAGE: every key kept after the tests is named on the settings page
2026-10-10T21:11:57.8115520Z   ---
2026-10-10T21:11:57.8116180Z   duration_ms: 625.623194
2026-10-10T21:11:57.8116888Z   type: 'test'
2026-10-10T21:11:57.8117516Z   ...
2026-10-10T21:11:57.8488122Z # Subtest: release · ITM-130 readBlob: a blob's text on either host, refused unless it hashes to that SHA; each token to its own server
2026-10-10T21:11:57.8513033Z ok 520 - release · ITM-130 readBlob: a blob's text on either host, refused unless it hashes to that SHA; each token to its own server
2026-10-10T21:11:57.8555874Z   ---
2026-10-10T21:11:57.8585429Z   duration_ms: 31.778836
2026-10-10T21:11:57.8586185Z   type: 'test'
2026-10-10T21:11:57.8615495Z   ...
2026-10-10T21:11:57.8646565Z # Subtest: release · ITM-130 ARC-003: no kernel file imports from the git host or from any module outside the kernel
2026-10-10T21:11:57.8656315Z ok 521 - release · ITM-130 ARC-003: no kernel file imports from the git host or from any module outside the kernel
2026-10-10T21:11:57.8675555Z   ---
2026-10-10T21:11:57.8705657Z   duration_ms: 11.768046
2026-10-10T21:11:57.8735603Z   type: 'test'
2026-10-10T21:11:57.8745357Z   ...
2026-10-10T21:11:57.8746779Z # Subtest: release · ITM-130 ARC-003: no kernel file calls fetch or touches the browser's storage
2026-10-10T21:11:57.8749009Z ok 522 - release · ITM-130 ARC-003: no kernel file calls fetch or touches the browser's storage
2026-10-10T21:11:57.8750043Z   ---
2026-10-10T21:11:57.8750572Z   duration_ms: 4.700843
2026-10-10T21:11:57.8751146Z   type: 'test'
2026-10-10T21:11:57.8751651Z   ...
2026-10-10T21:11:57.8753171Z # Subtest: release · ITM-130 lastAccepted reads through its ports only and returns the record committed last, by identifier
2026-10-10T21:11:57.8755614Z ok 523 - release · ITM-130 lastAccepted reads through its ports only and returns the record committed last, by identifier
2026-10-10T21:11:57.8756830Z   ---
2026-10-10T21:11:57.8757368Z   duration_ms: 5.951295
2026-10-10T21:11:57.8757929Z   type: 'test'
2026-10-10T21:11:57.8758420Z   ...
2026-10-10T21:11:57.8759658Z # Subtest: release · ITM-130 lastAccepted refuses a text that does not hash to the record's blob
2026-10-10T21:11:57.8761482Z ok 524 - release · ITM-130 lastAccepted refuses a text that does not hash to the record's blob
2026-10-10T21:11:57.8762617Z   ---
2026-10-10T21:11:57.8763217Z   duration_ms: 1.121459
2026-10-10T21:11:57.8763861Z   type: 'test'
2026-10-10T21:11:57.8764385Z   ...
2026-10-10T21:11:57.8766044Z # Subtest: release · ITM-130 lastAccepted: two records at the same instant are an error naming both, not a guess
2026-10-10T21:11:57.8768128Z ok 525 - release · ITM-130 lastAccepted: two records at the same instant are an error naming both, not a guess
2026-10-10T21:11:57.8769256Z   ---
2026-10-10T21:11:57.8769806Z   duration_ms: 1.582276
2026-10-10T21:11:57.8770475Z   type: 'test'
2026-10-10T21:11:57.8771005Z   ...
2026-10-10T21:11:57.8772442Z # Subtest: release · Backlog tab: sprint 02's own board — merged items done, the open one in progress, the limit named
2026-10-10T21:11:57.8774497Z ok 526 - release · Backlog tab: sprint 02's own board — merged items done, the open one in progress, the limit named
2026-10-10T21:11:57.8775910Z   ---
2026-10-10T21:11:57.8776437Z   duration_ms: 257.672324
2026-10-10T21:11:57.8777030Z   type: 'test'
2026-10-10T21:11:57.8777571Z   ...
2026-10-10T21:11:57.8778913Z # Subtest: release · Backlog tab: with the limit reached, every ready item says it cannot start, naming the limit
2026-10-10T21:11:57.8780764Z ok 527 - release · Backlog tab: with the limit reached, every ready item says it cannot start, naming the limit
2026-10-10T21:11:57.8781827Z   ---
2026-10-10T21:11:57.8782333Z   duration_ms: 126.308012
2026-10-10T21:11:57.8782898Z   type: 'test'
2026-10-10T21:11:57.8783404Z   ...
2026-10-10T21:11:57.8784719Z # Subtest: release · Backlog tab: an item realising a use case changed since its acceptance waits for acceptance
2026-10-10T21:11:57.8787270Z ok 528 - release · Backlog tab: an item realising a use case changed since its acceptance waits for acceptance
2026-10-10T21:11:57.8788377Z   ---
2026-10-10T21:11:57.8788900Z   duration_ms: 104.341155
2026-10-10T21:11:57.8789485Z   type: 'test'
2026-10-10T21:11:57.8789991Z   ...
2026-10-10T21:11:57.8791179Z # Subtest: release · Backlog tab: the uncovered names above, the board, then the backlog below
2026-10-10T21:11:57.8792871Z ok 529 - release · Backlog tab: the uncovered names above, the board, then the backlog below
2026-10-10T21:11:57.8793862Z   ---
2026-10-10T21:11:57.8794400Z   duration_ms: 101.852974
2026-10-10T21:11:57.8795308Z   type: 'test'
2026-10-10T21:11:57.8795842Z   ...
2026-10-10T21:11:57.8797065Z # Subtest: release · Backlog tab: no request for an unselected item before the backlog is unfolded
2026-10-10T21:11:57.8798836Z ok 530 - release · Backlog tab: no request for an unselected item before the backlog is unfolded
2026-10-10T21:11:57.8799911Z   ---
2026-10-10T21:11:57.8800434Z   duration_ms: 227.212492
2026-10-10T21:11:57.8801028Z   type: 'test'
2026-10-10T21:11:57.8801535Z   ...
2026-10-10T21:11:57.8802932Z # Subtest: release · Backlog tab: unfolded, the backlog in its order with derived states, and the uncovered names
2026-10-10T21:11:57.8805079Z ok 531 - release · Backlog tab: unfolded, the backlog in its order with derived states, and the uncovered names
2026-10-10T21:11:57.8806595Z   ---
2026-10-10T21:11:57.8807116Z   duration_ms: 214.358122
2026-10-10T21:11:57.8807732Z   type: 'test'
2026-10-10T21:11:57.8808271Z   ...
2026-10-10T21:11:57.8809566Z # Subtest: release · Backlog tab: after clearing every browser store and reloading, the same board
2026-10-10T21:11:57.8811375Z ok 532 - release · Backlog tab: after clearing every browser store and reloading, the same board
2026-10-10T21:11:57.8812397Z   ---
2026-10-10T21:11:57.8812890Z   duration_ms: 440.101995
2026-10-10T21:11:57.8813462Z   type: 'test'
2026-10-10T21:11:57.8813943Z   ...
2026-10-10T21:11:57.8815182Z # Subtest: release · Backlog tab: nothing is written and no state is stored
2026-10-10T21:11:57.8816570Z ok 533 - release · Backlog tab: nothing is written and no state is stored
2026-10-10T21:11:57.8817382Z   ---
2026-10-10T21:11:57.8817899Z   duration_ms: 206.37577
2026-10-10T21:11:57.8818460Z   type: 'test'
2026-10-10T21:11:57.8818949Z   ...
2026-10-10T21:11:57.8819939Z # Subtest: release · Backlog tab: every part and every column explains itself
2026-10-10T21:11:57.8821310Z ok 534 - release · Backlog tab: every part and every column explains itself
2026-10-10T21:11:57.8822227Z   ---
2026-10-10T21:11:57.8822772Z   duration_ms: 99.507672
2026-10-10T21:11:57.8823367Z   type: 'test'
2026-10-10T21:11:57.8823921Z   ...
2026-10-10T21:11:57.8825547Z # Subtest: release · Backlog tab: a product whose model works from a plan has no backlog and is sent to Progress
2026-10-10T21:11:57.8827549Z ok 535 - release · Backlog tab: a product whose model works from a plan has no backlog and is sent to Progress
2026-10-10T21:11:57.8828647Z   ---
2026-10-10T21:11:57.8829175Z   duration_ms: 97.124566
2026-10-10T21:11:57.8829792Z   type: 'test'
2026-10-10T21:11:57.8830345Z   ...
2026-10-10T21:11:57.8831873Z # Subtest: release · process model: Agent M's own model is read with its limit and measure, and validates without an error
2026-10-10T21:11:57.8834051Z ok 536 - release · process model: Agent M's own model is read with its limit and measure, and validates without an error
2026-10-10T21:11:57.8835563Z   ---
2026-10-10T21:11:57.8836115Z   duration_ms: 4.265774
2026-10-10T21:11:57.8836717Z   type: 'test'
2026-10-10T21:11:57.8837223Z   ...
2026-10-10T21:11:57.8838669Z # Subtest: release · process model: a transition naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:11:57.8840801Z ok 537 - release · process model: a transition naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:11:57.8842273Z   ---
2026-10-10T21:11:57.8842801Z   duration_ms: 1.710278
2026-10-10T21:11:57.8843359Z   type: 'test'
2026-10-10T21:11:57.8843903Z   ...
2026-10-10T21:11:57.8845731Z # Subtest: release · process model: a verification pair naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:11:57.8848066Z ok 538 - release · process model: a verification pair naming a phase the model lacks is refused, beside the field that causes it
2026-10-10T21:11:57.8849362Z   ---
2026-10-10T21:11:57.8849894Z   duration_ms: 0.550556
2026-10-10T21:11:57.8850465Z   type: 'test'
2026-10-10T21:11:57.8850997Z   ...
2026-10-10T21:11:57.8852361Z # Subtest: release · process model: a gate without artifacts is refused, beside the field that causes it
2026-10-10T21:11:57.8854234Z ok 539 - release · process model: a gate without artifacts is refused, beside the field that causes it
2026-10-10T21:11:57.8855616Z   ---
2026-10-10T21:11:57.8856183Z   duration_ms: 0.522813
2026-10-10T21:11:57.8856816Z   type: 'test'
2026-10-10T21:11:57.8857352Z   ...
2026-10-10T21:11:57.8858664Z # Subtest: release · process model: a gate without a condition is refused, beside the field that causes it
2026-10-10T21:11:57.8860485Z ok 540 - release · process model: a gate without a condition is refused, beside the field that causes it
2026-10-10T21:11:57.8861555Z   ---
2026-10-10T21:11:57.8862028Z   duration_ms: 0.445599
2026-10-10T21:11:57.8862568Z   type: 'test'
2026-10-10T21:11:57.8863300Z   ...
2026-10-10T21:11:57.8864539Z # Subtest: release · process model: a role without capabilities is refused, beside the field that causes it
2026-10-10T21:11:57.8866535Z ok 541 - release · process model: a role without capabilities is refused, beside the field that causes it
2026-10-10T21:11:57.8867553Z   ---
2026-10-10T21:11:57.8868051Z   duration_ms: 0.312698
2026-10-10T21:11:57.8868605Z   type: 'test'
2026-10-10T21:11:57.8869111Z   ...
2026-10-10T21:11:57.8870355Z # Subtest: release · process model: a phase without a role is refused, beside the field that causes it
2026-10-10T21:11:57.8872201Z ok 542 - release · process model: a phase without a role is refused, beside the field that causes it
2026-10-10T21:11:57.8873264Z   ---
2026-10-10T21:11:57.8873809Z   duration_ms: 0.289434
2026-10-10T21:11:57.8874401Z   type: 'test'
2026-10-10T21:11:57.8875158Z   ...
2026-10-10T21:11:57.8876809Z # Subtest: release · process model: a missing declaration of whether work is planned or pulled is refused, beside the field that causes it
2026-10-10T21:11:57.8879247Z ok 543 - release · process model: a missing declaration of whether work is planned or pulled is refused, beside the field that causes it
2026-10-10T21:11:57.8880671Z   ---
2026-10-10T21:11:57.8881212Z   duration_ms: 0.362902
2026-10-10T21:11:57.8881805Z   type: 'test'
2026-10-10T21:11:57.8882357Z   ...
2026-10-10T21:11:57.8883676Z # Subtest: release · process model: a gate without a decider is refused, beside the field that causes it
2026-10-10T21:11:57.8885832Z ok 544 - release · process model: a gate without a decider is refused, beside the field that causes it
2026-10-10T21:11:57.8886989Z   ---
2026-10-10T21:11:57.8887568Z   duration_ms: 0.674569
2026-10-10T21:11:57.8888187Z   type: 'test'
2026-10-10T21:11:57.8888737Z   ...
2026-10-10T21:11:57.8890323Z # Subtest: release · process model: a gate decided by a role the model does not define is refused, beside the field that causes it
2026-10-10T21:11:57.8892588Z ok 545 - release · process model: a gate decided by a role the model does not define is refused, beside the field that causes it
2026-10-10T21:11:57.8893875Z   ---
2026-10-10T21:11:57.8894450Z   duration_ms: 0.634023
2026-10-10T21:11:57.8895447Z   type: 'test'
2026-10-10T21:11:57.8896021Z   ...
2026-10-10T21:11:57.8897498Z # Subtest: release · process model: a phase no transition reaches is refused, beside the field that causes it
2026-10-10T21:11:57.8899536Z ok 546 - release · process model: a phase no transition reaches is refused, beside the field that causes it
2026-10-10T21:11:57.8900956Z   ---
2026-10-10T21:11:57.8901475Z   duration_ms: 0.922425
2026-10-10T21:11:57.8902052Z   type: 'test'
2026-10-10T21:11:57.8902584Z   ...
2026-10-10T21:11:57.8904258Z # Subtest: release · process model: a gate that checks an artifact kind no earlier phase produces is refused, beside the field that causes it
2026-10-10T21:11:57.8906980Z ok 547 - release · process model: a gate that checks an artifact kind no earlier phase produces is refused, beside the field that causes it
2026-10-10T21:11:57.8908305Z   ---
2026-10-10T21:11:57.8908856Z   duration_ms: 0.315845
2026-10-10T21:11:57.8909486Z   type: 'test'
2026-10-10T21:11:57.8910035Z   ...
2026-10-10T21:11:57.8911626Z # Subtest: release · process model: pulled work with neither a time box nor a WIP limit is refused, beside the field that causes it
2026-10-10T21:11:57.8913884Z ok 548 - release · process model: pulled work with neither a time box nor a WIP limit is refused, beside the field that causes it
2026-10-10T21:11:57.8915367Z   ---
2026-10-10T21:11:57.8915905Z   duration_ms: 0.312638
2026-10-10T21:11:57.8916482Z   type: 'test'
2026-10-10T21:11:57.8916994Z   ...
2026-10-10T21:11:57.8918462Z # Subtest: release · process model: pulled work with both a time box and a WIP limit is refused, beside the field that causes it
2026-10-10T21:11:57.8920633Z ok 549 - release · process model: pulled work with both a time box and a WIP limit is refused, beside the field that causes it
2026-10-10T21:11:57.8921857Z   ---
2026-10-10T21:11:57.8922665Z   duration_ms: 0.27114
2026-10-10T21:11:57.8923252Z   type: 'test'
2026-10-10T21:11:57.8923777Z   ...
2026-10-10T21:11:57.8925633Z # Subtest: release · process model: a progress measure that does not fit the kind of work is refused, beside the field that causes it
2026-10-10T21:11:57.8927977Z ok 550 - release · process model: a progress measure that does not fit the kind of work is refused, beside the field that causes it
2026-10-10T21:11:57.8929240Z   ---
2026-10-10T21:11:57.8929764Z   duration_ms: 0.333276
2026-10-10T21:11:57.8930367Z   type: 'test'
2026-10-10T21:11:57.8930898Z   ...
2026-10-10T21:11:57.8932228Z # Subtest: release · process model: an unknown progress measure is refused, beside the field that causes it
2026-10-10T21:11:57.8934103Z ok 551 - release · process model: an unknown progress measure is refused, beside the field that causes it
2026-10-10T21:11:57.8935484Z   ---
2026-10-10T21:11:57.8935955Z   duration_ms: 0.277873
2026-10-10T21:11:57.8936403Z   type: 'test'
2026-10-10T21:11:57.8936794Z   ...
2026-10-10T21:11:57.8938732Z # Subtest: release · process model: a gate decided by a role and one decided by a named CI check both pass
2026-10-10T21:11:57.8940380Z ok 552 - release · process model: a gate decided by a role and one decided by a named CI check both pass
2026-10-10T21:11:57.8941261Z   ---
2026-10-10T21:11:57.8941634Z   duration_ms: 0.399151
2026-10-10T21:11:57.8942046Z   type: 'test'
2026-10-10T21:11:57.8942404Z   ...
2026-10-10T21:11:57.8943790Z # Subtest: release · process model: validation leaves the definition as it was, and names every error of a definition with two
2026-10-10T21:11:57.8946094Z ok 553 - release · process model: validation leaves the definition as it was, and names every error of a definition with two
2026-10-10T21:11:57.8947132Z   ---
2026-10-10T21:11:57.8947505Z   duration_ms: 0.461148
2026-10-10T21:11:57.8947914Z   type: 'test'
2026-10-10T21:11:57.8948265Z   ...
2026-10-10T21:11:57.8961656Z # Subtest: release · work items: this backlog parses without a problem — each item names what it realises and where it came from
2026-10-10T21:11:57.8963619Z ok 554 - release · work items: this backlog parses without a problem — each item names what it realises and where it came from
2026-10-10T21:11:57.8964533Z   ---
2026-10-10T21:11:57.8965093Z   duration_ms: 840.026464
2026-10-10T21:11:57.8965472Z   type: 'test'
2026-10-10T21:11:57.8965787Z   ...
2026-10-10T21:11:57.8966922Z # Subtest: release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not
2026-10-10T21:11:57.8968909Z ok 555 - release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not
2026-10-10T21:11:57.8969778Z   ---
2026-10-10T21:11:57.8970085Z   duration_ms: 0.869015
2026-10-10T21:11:57.8970433Z   type: 'test'
2026-10-10T21:11:57.8970735Z   ...
2026-10-10T21:11:57.8972412Z # Subtest: release · work items: an item naming a requirement or use case the product does not have is an error
2026-10-10T21:11:57.8973973Z ok 556 - release · work items: an item naming a requirement or use case the product does not have is an error
2026-10-10T21:11:57.8974773Z   ---
2026-10-10T21:11:57.8975285Z   duration_ms: 0.338637
2026-10-10T21:11:57.8975641Z   type: 'test'
2026-10-10T21:11:57.8975949Z   ...
2026-10-10T21:11:57.8976849Z # Subtest: release · work items: an item that restates an existing one is flagged, not rejected
2026-10-10T21:11:57.8978154Z ok 557 - release · work items: an item that restates an existing one is flagged, not rejected
2026-10-10T21:11:57.8978865Z   ---
2026-10-10T21:11:57.8979170Z   duration_ms: 0.264317
2026-10-10T21:11:57.8979529Z   type: 'test'
2026-10-10T21:11:57.8979850Z   ...
2026-10-10T21:11:57.8980752Z # Subtest: release · work items: an item kept outside docs/backlog/ is an error
2026-10-10T21:11:57.8982611Z ok 558 - release · work items: an item kept outside docs/backlog/ is an error
2026-10-10T21:11:57.8983372Z   ---
2026-10-10T21:11:57.8983733Z   duration_ms: 0.285277
2026-10-10T21:11:57.8984434Z   type: 'test'
2026-10-10T21:11:57.8984794Z   ...
2026-10-10T21:11:57.8986209Z # Subtest: release · work items: this backlog's order places every item once, and appends the unnamed at the bottom
2026-10-10T21:11:57.8988009Z ok 559 - release · work items: this backlog's order places every item once, and appends the unnamed at the bottom
2026-10-10T21:11:57.8988943Z   ---
2026-10-10T21:11:57.8989299Z   duration_ms: 0.879084
2026-10-10T21:11:57.8989709Z   type: 'test'
2026-10-10T21:11:57.8990114Z   ...
2026-10-10T21:11:57.8991478Z # Subtest: release · work items: an order that names an unknown item or one twice is a problem; the unnamed are appended
2026-10-10T21:11:57.9006485Z ok 560 - release · work items: an order that names an unknown item or one twice is a problem; the unnamed are appended
2026-10-10T21:11:57.9007507Z   ---
2026-10-10T21:11:57.9007859Z   duration_ms: 0.3139
2026-10-10T21:11:57.9008247Z   type: 'test'
2026-10-10T21:11:57.9008592Z   ...
2026-10-10T21:11:57.9009810Z # Subtest: release · work items: an item from an issue names the issue as its origin, and realises what its class says
2026-10-10T21:11:57.9011549Z ok 561 - release · work items: an item from an issue names the issue as its origin, and realises what its class says
2026-10-10T21:11:57.9012489Z   ---
2026-10-10T21:11:57.9012865Z   duration_ms: 0.389353
2026-10-10T21:11:57.9013286Z   type: 'test'
2026-10-10T21:11:57.9013641Z   ...
2026-10-10T21:11:57.9015594Z # Subtest: release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted
2026-10-10T21:11:57.9017455Z ok 562 - release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted
2026-10-10T21:11:57.9018383Z   ---
2026-10-10T21:11:57.9018750Z   duration_ms: 1.247136
2026-10-10T21:11:57.9019171Z   type: 'test'
2026-10-10T21:11:57.9019593Z   ...
2026-10-10T21:11:57.9020661Z # Subtest: release · work items: an item file naming two issues as its origin is read with both
2026-10-10T21:11:57.9022173Z ok 563 - release · work items: an item file naming two issues as its origin is read with both
2026-10-10T21:11:57.9022963Z   ---
2026-10-10T21:11:57.9023330Z   duration_ms: 0.459014
2026-10-10T21:11:57.9023735Z   type: 'test'
2026-10-10T21:11:57.9024083Z   ...
2026-10-10T21:11:57.9025485Z # Subtest: release · work items: this sprint's record is read with its selection in order, and stores no state
2026-10-10T21:11:57.9027883Z ok 564 - release · work items: this sprint's record is read with its selection in order, and stores no state
2026-10-10T21:11:57.9029077Z   ---
2026-10-10T21:11:57.9029416Z   duration_ms: 0.868494
2026-10-10T21:11:57.9029796Z   type: 'test'
2026-10-10T21:11:57.9030121Z   ...
2026-10-10T21:11:57.9031265Z # Subtest: release · work items: with limit 2 and two items in progress a third start is refused with the limit named
2026-10-10T21:11:57.9033056Z ok 565 - release · work items: with limit 2 and two items in progress a third start is refused with the limit named
2026-10-10T21:11:57.9033999Z   ---
2026-10-10T21:11:57.9034389Z   duration_ms: 0.894162
2026-10-10T21:11:57.9035039Z   type: 'test'
2026-10-10T21:11:57.9035422Z   ...
2026-10-10T21:11:57.9036425Z # Subtest: release · work items: an item outside the running sprint's selection is refused
2026-10-10T21:11:57.9038649Z ok 566 - release · work items: an item outside the running sprint's selection is refused
2026-10-10T21:11:57.9039449Z   ---
2026-10-10T21:11:57.9039829Z   duration_ms: 0.44113
2026-10-10T21:11:57.9040239Z   type: 'test'
2026-10-10T21:11:57.9040609Z   ...
2026-10-10T21:11:57.9041600Z # Subtest: release · work items: a job without an item is refused, in Scrum and in Kanban
2026-10-10T21:11:57.9043009Z ok 567 - release · work items: a job without an item is refused, in Scrum and in Kanban
2026-10-10T21:11:57.9043774Z   ---
2026-10-10T21:11:57.9044143Z   duration_ms: 0.308731
2026-10-10T21:11:57.9044550Z   type: 'test'
2026-10-10T21:11:57.9045144Z   ...
2026-10-10T21:11:57.9046357Z # Subtest: release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts
2026-10-10T21:11:57.9049093Z ok 568 - release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts
2026-10-10T21:11:57.9050060Z   ---
2026-10-10T21:11:57.9050430Z   duration_ms: 0.236725
2026-10-10T21:11:57.9050840Z   type: 'test'
2026-10-10T21:11:57.9051189Z   ...
2026-10-10T21:11:57.9052292Z # Subtest: release · work items: an item's state follows its pull requests, not a field of its file
2026-10-10T21:11:57.9053875Z ok 569 - release · work items: an item's state follows its pull requests, not a field of its file
2026-10-10T21:11:57.9054723Z   ---
2026-10-10T21:11:57.9055337Z   duration_ms: 0.31358
2026-10-10T21:11:57.9055759Z   type: 'test'
2026-10-10T21:11:57.9056117Z   ...
2026-10-10T21:11:57.9057435Z # Subtest: release · requirements: a source named as it is written, with its date, is no error and needs no SRC- identifier
2026-10-10T21:11:57.9059230Z ok 570 - release · requirements: a source named as it is written, with its date, is no error and needs no SRC- identifier
2026-10-10T21:11:57.9060903Z   ---
2026-10-10T21:11:57.9061289Z   duration_ms: 4.524201
2026-10-10T21:11:57.9061709Z   type: 'test'
2026-10-10T21:11:57.9062077Z   ...
2026-10-10T21:11:57.9063252Z # Subtest: release · requirements: an SRC- identifier must be linked to the product; a linked one passes
2026-10-10T21:11:57.9065086Z ok 571 - release · requirements: an SRC- identifier must be linked to the product; a linked one passes
2026-10-10T21:11:57.9066038Z   ---
2026-10-10T21:11:57.9066409Z   duration_ms: 0.785287
2026-10-10T21:11:57.9066820Z   type: 'test'
2026-10-10T21:11:57.9067173Z   ...
2026-10-10T21:11:57.9068074Z # Subtest: release · requirements: a resource entry named as source is an error
2026-10-10T21:11:57.9069379Z ok 572 - release · requirements: a resource entry named as source is an error
2026-10-10T21:11:57.9070121Z   ---
2026-10-10T21:11:57.9070487Z   duration_ms: 1.155083
2026-10-10T21:11:57.9071649Z   type: 'test'
2026-10-10T21:11:57.9072046Z   ...
2026-10-10T21:11:57.9073221Z # Subtest: release · requirements: a source without a date, an empty source and a date alone are errors
2026-10-10T21:11:57.9075128Z ok 573 - release · requirements: a source without a date, an empty source and a date alone are errors
2026-10-10T21:11:57.9076033Z   ---
2026-10-10T21:11:57.9076397Z   duration_ms: 0.766752
2026-10-10T21:11:57.9076805Z   type: 'test'
2026-10-10T21:11:57.9077164Z   ...
2026-10-10T21:11:57.9078152Z # Subtest: release · requirements: a requirement written without any source is an error
2026-10-10T21:11:57.9079847Z ok 574 - release · requirements: a requirement written without any source is an error
2026-10-10T21:11:57.9080643Z   ---
2026-10-10T21:11:57.9081018Z   duration_ms: 0.505571
2026-10-10T21:11:57.9081438Z   type: 'test'
2026-10-10T21:11:57.9081795Z   ...
2026-10-10T21:11:57.9083786Z # Subtest: release · reader: a withdrawn requirement is marked, bold prose and a quoted name are no requirement
2026-10-10T21:11:57.9085897Z ok 575 - release · reader: a withdrawn requirement is marked, bold prose and a quoted name are no requirement
2026-10-10T21:11:57.9086857Z   ---
2026-10-10T21:11:57.9087229Z   duration_ms: 0.347193
2026-10-10T21:11:57.9087640Z   type: 'test'
2026-10-10T21:11:57.9088001Z   ...
2026-10-10T21:11:57.9089225Z # Subtest: release · pull requests: GitHub and GitLab give the same pull requests in one shape
2026-10-10T21:11:57.9090765Z ok 576 - release · pull requests: GitHub and GitLab give the same pull requests in one shape
2026-10-10T21:11:57.9091608Z   ---
2026-10-10T21:11:57.9091977Z   duration_ms: 31.800777
2026-10-10T21:11:57.9092407Z   type: 'test'
2026-10-10T21:11:57.9092765Z   ...
2026-10-10T21:11:57.9094713Z # Subtest: release · pull requests: a field the GitLab answer lacks is null, never taken from another field
2026-10-10T21:11:57.9096730Z ok 577 - release · pull requests: a field the GitLab answer lacks is null, never taken from another field
2026-10-10T21:11:57.9097642Z   ---
2026-10-10T21:11:57.9098356Z   duration_ms: 2.203926
2026-10-10T21:11:57.9098780Z   type: 'test'
2026-10-10T21:11:57.9099138Z   ...
2026-10-10T21:11:57.9100395Z # Subtest: release · pull requests: open, merged and closed are told apart on both hosts, and a base branch is kept to
2026-10-10T21:11:57.9102295Z ok 578 - release · pull requests: open, merged and closed are told apart on both hosts, and a base branch is kept to
2026-10-10T21:11:57.9103254Z   ---
2026-10-10T21:11:57.9103631Z   duration_ms: 3.477932
2026-10-10T21:11:57.9104058Z   type: 'test'
2026-10-10T21:11:57.9105150Z   ...
2026-10-10T21:11:57.9106643Z # Subtest: release · pull requests: each token is seen only at its own server, never in a URL, and nothing is written
2026-10-10T21:11:57.9108487Z ok 579 - release · pull requests: each token is seen only at its own server, never in a URL, and nothing is written
2026-10-10T21:11:57.9109394Z   ---
2026-10-10T21:11:57.9109767Z   duration_ms: 2.342587
2026-10-10T21:11:57.9110134Z   type: 'test'
2026-10-10T21:11:57.9110465Z   ...
2026-10-10T21:11:57.9111433Z # Subtest: release · pull requests: a list with a date reads only as far back as that date
2026-10-10T21:11:57.9112699Z ok 580 - release · pull requests: a list with a date reads only as far back as that date
2026-10-10T21:11:57.9113458Z   ---
2026-10-10T21:11:57.9113780Z   duration_ms: 13.692907
2026-10-10T21:11:57.9114164Z   type: 'test'
2026-10-10T21:11:57.9114514Z   ...
2026-10-10T21:11:57.9116350Z # Subtest: release · gates: a SPEC change is written only with its acceptance, and only its own section
2026-10-10T21:11:57.9118029Z ok 581 - release · gates: a SPEC change is written only with its acceptance, and only its own section
2026-10-10T21:11:57.9118884Z   ---
2026-10-10T21:11:57.9119237Z   duration_ms: 15.720933
2026-10-10T21:11:57.9119662Z   type: 'test'
2026-10-10T21:11:57.9120013Z   ...
2026-10-10T21:11:57.9121335Z # Subtest: release · gates: the approved text is written byte for byte, on the dashboard's and on the workflow's route
2026-10-10T21:11:57.9123151Z ok 582 - release · gates: the approved text is written byte for byte, on the dashboard's and on the workflow's route
2026-10-10T21:11:57.9124025Z   ---
2026-10-10T21:11:57.9124360Z   duration_ms: 3.276794
2026-10-10T21:11:57.9124740Z   type: 'test'
2026-10-10T21:11:57.9125333Z   ...
2026-10-10T21:11:57.9127146Z # Subtest: release · gates: the current text beside a proposal is the section as it stands, byte for byte
2026-10-10T21:11:57.9128838Z ok 583 - release · gates: the current text beside a proposal is the section as it stands, byte for byte
2026-10-10T21:11:57.9129954Z   ---
2026-10-10T21:11:57.9130302Z   duration_ms: 1.421524
2026-10-10T21:11:57.9130717Z   type: 'test'
2026-10-10T21:11:57.9131060Z   ...
2026-10-10T21:11:57.9132181Z # Subtest: release · gates: the replaced section is reachable in git history and kept nowhere in the tree
2026-10-10T21:11:57.9133865Z ok 584 - release · gates: the replaced section is reachable in git history and kept nowhere in the tree
2026-10-10T21:11:57.9134750Z   ---
2026-10-10T21:11:57.9135376Z   duration_ms: 50.047784
2026-10-10T21:11:57.9135808Z   type: 'test'
2026-10-10T21:11:57.9136155Z   ...
2026-10-10T21:11:57.9137945Z # Subtest: release · gates: a file on the default branch is open until a record names its current text
2026-10-10T21:11:57.9139616Z ok 585 - release · gates: a file on the default branch is open until a record names its current text
2026-10-10T21:11:57.9140436Z   ---
2026-10-10T21:11:57.9140789Z   duration_ms: 3.966111
2026-10-10T21:11:57.9141177Z   type: 'test'
2026-10-10T21:11:57.9141516Z   ...
2026-10-10T21:11:57.9142407Z # Subtest: release · gates: records are not of a reviewed kind; a use case is
2026-10-10T21:11:57.9143655Z ok 586 - release · gates: records are not of a reviewed kind; a use case is
2026-10-10T21:11:57.9144355Z   ---
2026-10-10T21:11:57.9144714Z   duration_ms: 0.23369
2026-10-10T21:11:57.9145385Z   type: 'test'
2026-10-10T21:11:57.9145745Z   ...
2026-10-10T21:11:57.9146853Z # Subtest: release · gates: a job record without approval is not open; a use case without approval is
2026-10-10T21:11:57.9150584Z not ok 587 - release · gates: a job record without approval is not open; a use case without approval is # TODO finding G1 (ITM-014, docs/measurements/2026-10-01_approval-gates-counter-proofs.md) — back to Development: the engine answers "open" for a record
2026-10-10T21:11:57.9152563Z   ---
2026-10-10T21:11:57.9152915Z   duration_ms: 1.422617
2026-10-10T21:11:57.9153319Z   type: 'test'
2026-10-10T21:11:57.9154195Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:266:1'
2026-10-10T21:11:57.9155438Z   failureType: 'testCodeFailure'
2026-10-10T21:11:57.9156029Z   error: 'docs/jobs/JOB-20261001-0900-a1b2.md'
2026-10-10T21:11:57.9156569Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:57.9157005Z   name: 'AssertionError'
2026-10-10T21:11:57.9157445Z   expected: 'open'
2026-10-10T21:11:57.9157828Z   actual: 'open'
2026-10-10T21:11:57.9158226Z   operator: 'notStrictEqual'
2026-10-10T21:11:57.9158672Z   stack: |-
2026-10-10T21:11:57.9160364Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:271:14)
2026-10-10T21:11:57.9161576Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:57.9162471Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:57.9163203Z   ...
2026-10-10T21:11:57.9164287Z # Subtest: release · gates: an acceptance handed a job record writes no approval record for it
2026-10-10T21:11:57.9167642Z not ok 588 - release · gates: an acceptance handed a job record writes no approval record for it # TODO finding G2 (ITM-014, docs/measurements/2026-10-01_approval-gates-counter-proofs.md) — back to Development: planAcceptance writes kind: use-case for it
2026-10-10T21:11:57.9169538Z   ---
2026-10-10T21:11:57.9169919Z   duration_ms: 2.682907
2026-10-10T21:11:57.9170344Z   type: 'test'
2026-10-10T21:11:57.9171995Z   location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:282:1'
2026-10-10T21:11:57.9173004Z   failureType: 'testCodeFailure'
2026-10-10T21:11:57.9173455Z   error: |-
2026-10-10T21:11:57.9173916Z     Expected values to be strictly deep-equal:
2026-10-10T21:11:57.9174478Z     + actual - expected
2026-10-10T21:11:57.9175110Z     
2026-10-10T21:11:57.9175447Z     + [
2026-10-10T21:11:57.9175782Z     +   {
2026-10-10T21:11:57.9176180Z     +     content: 'kind: use-case\n' +
2026-10-10T21:11:57.9176799Z     +       'file: docs/jobs/JOB-20261001-0900-a1b2.md\n' +
2026-10-10T21:11:57.9177780Z     +       'blob: 5b58e565c8554718a06691423921af37e16e31e4\n',
2026-10-10T21:11:57.9178573Z     +     path: 'docs/approvals/JOB-20261001-0900-a1b2-5b58e565c855.md'
2026-10-10T21:11:57.9179194Z     +   }
2026-10-10T21:11:57.9179516Z     + ]
2026-10-10T21:11:57.9179822Z     - []
2026-10-10T21:11:57.9180126Z     
2026-10-10T21:11:57.9180458Z   code: 'ERR_ASSERTION'
2026-10-10T21:11:57.9180872Z   name: 'AssertionError'
2026-10-10T21:11:57.9181281Z   expected:
2026-10-10T21:11:57.9181604Z   actual:
2026-10-10T21:11:57.9182135Z     0:
2026-10-10T21:11:57.9182696Z       path: 'docs/approvals/JOB-20261001-0900-a1b2-5b58e565c855.md'
2026-10-10T21:11:57.9183338Z       content: |-
2026-10-10T21:11:57.9183725Z         kind: use-case
2026-10-10T21:11:57.9184226Z         file: docs/jobs/JOB-20261001-0900-a1b2.md
2026-10-10T21:11:57.9185087Z         blob: 5b58e565c8554718a06691423921af37e16e31e4
2026-10-10T21:11:57.9185601Z         
2026-10-10T21:11:57.9185955Z   operator: 'deepStrictEqual'
2026-10-10T21:11:57.9186403Z   stack: |-
2026-10-10T21:11:57.9187422Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-02-c-review-core.test.mjs:287:12)
2026-10-10T21:11:57.9188636Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:11:57.9189564Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:11:57.9190275Z   ...
2026-10-10T21:11:57.9191452Z # Subtest: release · applyApprovals: a stale or malformed record is refused by name and nothing is written
2026-10-10T21:11:57.9193390Z ok 589 - release · applyApprovals: a stale or malformed record is refused by name and nothing is written
2026-10-10T21:11:57.9194285Z   ---
2026-10-10T21:11:57.9194651Z   duration_ms: 4.686125
2026-10-10T21:11:57.9196167Z   type: 'test'
2026-10-10T21:11:57.9196532Z   ...
2026-10-10T21:11:57.9197833Z # Subtest: release · applyApprovals: several records in one run — each written, in order, a stale one refused beside them
2026-10-10T21:11:57.9199748Z ok 590 - release · applyApprovals: several records in one run — each written, in order, a stale one refused beside them
2026-10-10T21:11:57.9200764Z   ---
2026-10-10T21:11:57.9201146Z   duration_ms: 2.949308
2026-10-10T21:11:57.9201640Z   type: 'test'
2026-10-10T21:11:57.9202039Z   ...
2026-10-10T21:11:57.9203154Z # Subtest: release · applyApprovals: the same files, bytes and report as tools/apply_approvals.py
2026-10-10T21:11:57.9204804Z ok 591 - release · applyApprovals: the same files, bytes and report as tools/apply_approvals.py
2026-10-10T21:11:57.9205947Z   ---
2026-10-10T21:11:57.9206305Z   duration_ms: 49.529736
2026-10-10T21:11:57.9235596Z   type: 'test'
2026-10-10T21:11:57.9235975Z   ...
2026-10-10T21:11:57.9237046Z # Subtest: release · UC-022: a decision is accepted only when everything it names is accepted
2026-10-10T21:11:57.9238476Z ok 592 - release · UC-022: a decision is accepted only when everything it names is accepted
2026-10-10T21:11:57.9239243Z   ---
2026-10-10T21:11:57.9239612Z   duration_ms: 6.553077
2026-10-10T21:11:57.9240002Z   type: 'test'
2026-10-10T21:11:57.9240329Z   ...
2026-10-10T21:11:57.9241512Z # Subtest: ITM-131 · a use case: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9243180Z ok 593 - ITM-131 · a use case: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9243977Z   ---
2026-10-10T21:11:57.9244312Z   duration_ms: 294.451245
2026-10-10T21:11:57.9244722Z   type: 'test'
2026-10-10T21:11:57.9245325Z   ...
2026-10-10T21:11:57.9246611Z # Subtest: ITM-131 · an architecture decision: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9248666Z ok 594 - ITM-131 · an architecture decision: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9249618Z   ---
2026-10-10T21:11:57.9249974Z   duration_ms: 177.213362
2026-10-10T21:11:57.9250389Z   type: 'test'
2026-10-10T21:11:57.9251016Z   ...
2026-10-10T21:11:57.9252250Z # Subtest: ITM-131 · a module: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9254025Z ok 595 - ITM-131 · a module: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9285443Z   ---
2026-10-10T21:11:57.9286033Z   duration_ms: 168.399394
2026-10-10T21:11:57.9286462Z   type: 'test'
2026-10-10T21:11:57.9286830Z   ...
2026-10-10T21:11:57.9288220Z # Subtest: ITM-131 · a SPEC change proposal: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9290206Z ok 596 - ITM-131 · a SPEC change proposal: a refused save writes nothing, keeps the edit and shows the newer version beside it
2026-10-10T21:11:57.9291184Z   ---
2026-10-10T21:11:57.9291524Z   duration_ms: 178.84523
2026-10-10T21:11:57.9291918Z   type: 'test'
2026-10-10T21:11:57.9292265Z   ...
2026-10-10T21:11:57.9293301Z # Subtest: ITM-131 · without a commit meanwhile, Save commits the edit and shows no newer version
2026-10-10T21:11:57.9294777Z ok 597 - ITM-131 · without a commit meanwhile, Save commits the edit and shows no newer version
2026-10-10T21:11:57.9295814Z   ---
2026-10-10T21:11:57.9296173Z   duration_ms: 158.442483
2026-10-10T21:11:57.9296580Z   type: 'test'
2026-10-10T21:11:57.9296912Z   ...
2026-10-10T21:11:57.9297743Z # Subtest: ITM-134 · an entry that adds a new requirement shows no impact list
2026-10-10T21:11:57.9299219Z ok 598 - ITM-134 · an entry that adds a new requirement shows no impact list
2026-10-10T21:11:57.9299897Z   ---
2026-10-10T21:11:57.9300235Z   duration_ms: 117.815971
2026-10-10T21:11:57.9300637Z   type: 'test'
2026-10-10T21:11:57.9300966Z   ...
2026-10-10T21:11:57.9301816Z # Subtest: ITM-134 · an entry withdrawing a requirement lists what still names it
2026-10-10T21:11:57.9302986Z ok 599 - ITM-134 · an entry withdrawing a requirement lists what still names it
2026-10-10T21:11:57.9303678Z   ---
2026-10-10T21:11:57.9304042Z   duration_ms: 110.516182
2026-10-10T21:11:57.9304445Z   type: 'test'
2026-10-10T21:11:57.9304766Z   ...
2026-10-10T21:11:57.9306015Z # Subtest: ITM-134 · an entry that takes a requirement out of its section lists what references it
2026-10-10T21:11:57.9307490Z ok 600 - ITM-134 · an entry that takes a requirement out of its section lists what references it
2026-10-10T21:11:57.9308338Z   ---
2026-10-10T21:11:57.9308693Z   duration_ms: 221.019562
2026-10-10T21:11:57.9309119Z   type: 'test'
2026-10-10T21:11:57.9309467Z   ...
2026-10-10T21:11:57.9310589Z # Subtest: ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included
2026-10-10T21:11:57.9312250Z ok 601 - ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included
2026-10-10T21:11:57.9313119Z   ---
2026-10-10T21:11:57.9313452Z   duration_ms: 2.007897
2026-10-10T21:11:57.9313845Z   type: 'test'
2026-10-10T21:11:57.9314179Z   ...
2026-10-10T21:11:57.9322958Z # Subtest: ITM-125 · every secret the store keeps says what it grants
2026-10-10T21:11:57.9324189Z ok 602 - ITM-125 · every secret the store keeps says what it grants
2026-10-10T21:11:57.9325070Z   ---
2026-10-10T21:11:57.9325425Z   duration_ms: 0.529285
2026-10-10T21:11:57.9325822Z   type: 'test'
2026-10-10T21:11:57.9326145Z   ...
2026-10-10T21:11:57.9327351Z # Subtest: ITM-018 · what traces to a requirement is derived from the artifacts, never from a matrix kept by hand
2026-10-10T21:11:57.9329001Z ok 603 - ITM-018 · what traces to a requirement is derived from the artifacts, never from a matrix kept by hand
2026-10-10T21:11:57.9329911Z   ---
2026-10-10T21:11:57.9330283Z   duration_ms: 21.419982
2026-10-10T21:11:57.9330709Z   type: 'test'
2026-10-10T21:11:57.9331066Z   ...
2026-10-10T21:11:57.9332054Z # Subtest: ITM-018 · references are followed by identifier; a position is no reference
2026-10-10T21:11:57.9338043Z ok 604 - ITM-018 · references are followed by identifier; a position is no reference
2026-10-10T21:11:57.9339169Z   ---
2026-10-10T21:11:57.9339532Z   duration_ms: 2.766293
2026-10-10T21:11:57.9339902Z   type: 'test'
2026-10-10T21:11:57.9340230Z   ...
2026-10-10T21:11:57.9341272Z # Subtest: ITM-018 · coverage gaps are listed with the withdrawal note, and they block nothing
2026-10-10T21:11:57.9342651Z ok 605 - ITM-018 · coverage gaps are listed with the withdrawal note, and they block nothing
2026-10-10T21:11:57.9343460Z   ---
2026-10-10T21:11:57.9343823Z   duration_ms: 1.859037
2026-10-10T21:11:57.9344233Z   type: 'test'
2026-10-10T21:11:57.9344578Z   ...
2026-10-10T21:11:57.9345740Z # Subtest: ITM-018 · module rows and every gap of UC-025, none of them an error
2026-10-10T21:11:57.9346907Z ok 606 - ITM-018 · module rows and every gap of UC-025, none of them an error
2026-10-10T21:11:57.9363849Z   ---
2026-10-10T21:11:57.9364232Z   duration_ms: 4.009202
2026-10-10T21:11:57.9364641Z   type: 'test'
2026-10-10T21:11:57.9365356Z   ...
2026-10-10T21:11:57.9366412Z # Subtest: ITM-018 · the impact list of a requirement names every artifact that references it
2026-10-10T21:11:57.9367841Z ok 607 - ITM-018 · the impact list of a requirement names every artifact that references it
2026-10-10T21:11:57.9368576Z   ---
2026-10-10T21:11:57.9368929Z   duration_ms: 1.799465
2026-10-10T21:11:57.9369340Z   type: 'test'
2026-10-10T21:11:57.9369684Z   ...
2026-10-10T21:11:57.9370744Z # Subtest: ITM-018 · an entry whose section no longer states a requirement touches that requirement
2026-10-10T21:11:57.9372521Z ok 608 - ITM-018 · an entry whose section no longer states a requirement touches that requirement
2026-10-10T21:11:57.9373365Z   ---
2026-10-10T21:11:57.9373736Z   duration_ms: 2.175131
2026-10-10T21:11:57.9374376Z   type: 'test'
2026-10-10T21:11:57.9374737Z   ...
2026-10-10T21:11:57.9376187Z # Subtest: ITM-018 · the impact list of an architecture change names what follows or uses it, with its code and tests
2026-10-10T21:11:57.9378026Z ok 609 - ITM-018 · the impact list of an architecture change names what follows or uses it, with its code and tests
2026-10-10T21:11:57.9378986Z   ---
2026-10-10T21:11:57.9379355Z   duration_ms: 11.915353
2026-10-10T21:11:57.9379779Z   type: 'test'
2026-10-10T21:11:57.9380134Z   ...
2026-10-10T21:11:57.9381336Z # Subtest: ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked
2026-10-10T21:11:57.9383141Z ok 610 - ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked
2026-10-10T21:11:57.9384080Z   ---
2026-10-10T21:11:57.9384457Z   duration_ms: 262.802422
2026-10-10T21:11:57.9385668Z   type: 'test'
2026-10-10T21:11:57.9386072Z   ...
2026-10-10T21:11:57.9387354Z # Subtest: ITM-203 · UC-025 step 5 — every module of Agent M is one box, inside the box of its subsystem and of no other
2026-10-10T21:11:57.9389215Z ok 611 - ITM-203 · UC-025 step 5 — every module of Agent M is one box, inside the box of its subsystem and of no other
2026-10-10T21:11:57.9390149Z   ---
2026-10-10T21:11:57.9390507Z   duration_ms: 319.131461
2026-10-10T21:11:57.9390913Z   type: 'test'
2026-10-10T21:11:57.9391236Z   ...
2026-10-10T21:11:57.9391657Z # 53 module boxes in 11 subsystem boxes
2026-10-10T21:11:57.9393043Z # Subtest: ITM-203 · UC-025 step 5 — one arrow from each module to each module it uses, however many of its interfaces it uses
2026-10-10T21:11:57.9395231Z ok 612 - ITM-203 · UC-025 step 5 — one arrow from each module to each module it uses, however many of its interfaces it uses
2026-10-10T21:11:57.9396885Z   ---
2026-10-10T21:11:57.9397280Z   duration_ms: 149.180479
2026-10-10T21:11:57.9397722Z   type: 'test'
2026-10-10T21:11:57.9398095Z   ...
2026-10-10T21:11:57.9398540Z # 387 arrows for 1093 used interfaces
2026-10-10T21:11:57.9400024Z # Subtest: ITM-203 · UC-025 step 5 — a used module that has no file is one box marked missing, where the arrows of its users end
2026-10-10T21:11:57.9401965Z ok 613 - ITM-203 · UC-025 step 5 — a used module that has no file is one box marked missing, where the arrows of its users end
2026-10-10T21:11:57.9403132Z   ---
2026-10-10T21:11:57.9403487Z   duration_ms: 299.690231
2026-10-10T21:11:57.9403886Z   type: 'test'
2026-10-10T21:11:57.9404220Z   ...
2026-10-10T21:11:57.9405257Z # without its file: "MOD-documents — missing", 31 arrows end there
2026-10-10T21:11:57.9406862Z # Subtest: ITM-203 · the page draws Agent M's component diagram without Mermaid's "Maximum text size in diagram exceeded"
2026-10-10T21:11:57.9409497Z ok 614 - ITM-203 · the page draws Agent M's component diagram without Mermaid's "Maximum text size in diagram exceeded"
2026-10-10T21:11:57.9410510Z   ---
2026-10-10T21:11:57.9410873Z   duration_ms: 188.582426
2026-10-10T21:11:57.9411293Z   type: 'test'
2026-10-10T21:11:57.9411642Z   ...
2026-10-10T21:11:57.9412081Z # 21672 characters, of at most 50000
2026-10-10T21:11:57.9413228Z # Subtest: ITM-203 · the explanation under the component diagram says what the diagram draws
2026-10-10T21:11:57.9414695Z ok 615 - ITM-203 · the explanation under the component diagram says what the diagram draws
2026-10-10T21:11:57.9415753Z   ---
2026-10-10T21:11:57.9416123Z   duration_ms: 145.820459
2026-10-10T21:11:57.9416548Z   type: 'test'
2026-10-10T21:11:57.9416888Z   ...
2026-10-10T21:11:57.9417984Z # Subtest: THE PROCESS MODEL IS DECLARED PER PRODUCT: no model is assumed; the product's own repository declares exactly one
2026-10-10T21:11:57.9420535Z ok 616 - THE PROCESS MODEL IS DECLARED PER PRODUCT: no model is assumed; the product's own repository declares exactly one
2026-10-10T21:11:57.9421794Z   ---
2026-10-10T21:11:57.9422157Z   duration_ms: 207.506798
2026-10-10T21:11:57.9422575Z   type: 'test'
2026-10-10T21:11:57.9422924Z   ...
2026-10-10T21:11:57.9424085Z # Subtest: A PROCESS MODEL ORGANISES PEOPLE AND AGENTS: each role is shown with whether a person, an agent or either may fill it
2026-10-10T21:11:57.9426168Z ok 617 - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS: each role is shown with whether a person, an agent or either may fill it
2026-10-10T21:11:57.9427174Z   ---
2026-10-10T21:11:57.9427537Z   duration_ms: 24.743735
2026-10-10T21:11:57.9427947Z   type: 'test'
2026-10-10T21:11:57.9428282Z   ...
2026-10-10T21:11:57.9429220Z # Subtest: AGENT M CARRIES THE BOOK'S CATALOGUE: the five models, and apart from them the four practices
2026-10-10T21:11:57.9431382Z ok 618 - AGENT M CARRIES THE BOOK'S CATALOGUE: the five models, and apart from them the four practices
2026-10-10T21:11:57.9432246Z   ---
2026-10-10T21:11:57.9432597Z   duration_ms: 28.548512
2026-10-10T21:11:57.9433023Z   type: 'test'
2026-10-10T21:11:57.9433372Z   ...
2026-10-10T21:11:57.9434349Z # Subtest: THE CATALOGUE IS DATA: a process model added as a data file is offered and used, no code changed
2026-10-10T21:11:57.9436087Z ok 619 - THE CATALOGUE IS DATA: a process model added as a data file is offered and used, no code changed
2026-10-10T21:11:57.9436962Z   ---
2026-10-10T21:11:57.9437306Z   duration_ms: 26.269866
2026-10-10T21:11:57.9437714Z   type: 'test'
2026-10-10T21:11:57.9438065Z   ...
2026-10-10T21:11:57.9439205Z # Subtest: THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's phases, and its gates where they sit
2026-10-10T21:11:57.9441648Z ok 620 - THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's phases, and its gates where they sit
2026-10-10T21:11:57.9442683Z   ---
2026-10-10T21:11:57.9443061Z   duration_ms: 25.701186
2026-10-10T21:11:57.9443473Z   type: 'test'
2026-10-10T21:11:57.9443826Z   ...
2026-10-10T21:11:57.9445228Z # Subtest: THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's transitions and its verification pairs
2026-10-10T21:11:57.9447069Z ok 621 - THE MODEL DETERMINES THE PHASES AND THE GATES: the workflow shows the model's transitions and its verification pairs
2026-10-10T21:11:57.9448082Z   ---
2026-10-10T21:11:57.9448433Z   duration_ms: 30.89237
2026-10-10T21:11:57.9448816Z   type: 'test'
2026-10-10T21:11:57.9449167Z   ...
2026-10-10T21:11:57.9450013Z # Subtest: A GATE NAMES WHAT IT CHECKS: each gate is shown with its artifacts and its condition
2026-10-10T21:11:57.9451576Z ok 622 - A GATE NAMES WHAT IT CHECKS: each gate is shown with its artifacts and its condition
2026-10-10T21:11:57.9453057Z   ---
2026-10-10T21:11:57.9453426Z   duration_ms: 19.067237
2026-10-10T21:11:57.9453838Z   type: 'test'
2026-10-10T21:11:57.9454182Z   ...
2026-10-10T21:11:57.9455375Z # Subtest: A PRACTICE IS NOT A MODEL: no practice is offered instead of a model; one added keeps the model
2026-10-10T21:11:57.9456860Z ok 623 - A PRACTICE IS NOT A MODEL: no practice is offered instead of a model; one added keeps the model
2026-10-10T21:11:57.9457727Z   ---
2026-10-10T21:11:57.9458082Z   duration_ms: 90.684755
2026-10-10T21:11:57.9458488Z   type: 'test'
2026-10-10T21:11:57.9458845Z   ...
2026-10-10T21:11:57.9459945Z # Subtest: A PROCESS REQUIREMENT ADDS TO THE MODEL: the requirement's gate is added, the model's own phases and gate stay
2026-10-10T21:11:57.9461652Z ok 624 - A PROCESS REQUIREMENT ADDS TO THE MODEL: the requirement's gate is added, the model's own phases and gate stay
2026-10-10T21:11:57.9462600Z   ---
2026-10-10T21:11:57.9463629Z   duration_ms: 25.53383
2026-10-10T21:11:57.9464110Z   type: 'test'
2026-10-10T21:11:57.9464471Z   ...
2026-10-10T21:11:57.9465882Z # Subtest: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY: Save commits onto the product's default branch, under the author's own token
2026-10-10T21:11:57.9467830Z ok 625 - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY: Save commits onto the product's default branch, under the author's own token
2026-10-10T21:11:57.9469204Z   ---
2026-10-10T21:11:57.9469563Z   duration_ms: 87.995504
2026-10-10T21:11:57.9469986Z   type: 'test'
2026-10-10T21:11:57.9470340Z   ...
2026-10-10T21:11:57.9471321Z # Subtest: ONE CLICK PER DECISION: one click on Save, once the declaration is complete, does all that follows
2026-10-10T21:11:57.9472829Z ok 626 - ONE CLICK PER DECISION: one click on Save, once the declaration is complete, does all that follows
2026-10-10T21:11:57.9473711Z   ---
2026-10-10T21:11:57.9474768Z   duration_ms: 89.235869
2026-10-10T21:11:57.9475441Z   type: 'test'
2026-10-10T21:11:57.9475823Z   ...
2026-10-10T21:11:57.9476836Z # Subtest: EVERY STEP EXPLAINS ITSELF: each step that asks something carries an explanation that can be expanded
2026-10-10T21:11:57.9478451Z ok 627 - EVERY STEP EXPLAINS ITSELF: each step that asks something carries an explanation that can be expanded
2026-10-10T21:11:57.9479384Z   ---
2026-10-10T21:11:57.9479757Z   duration_ms: 20.74178
2026-10-10T21:11:57.9480190Z   type: 'test'
2026-10-10T21:11:57.9480534Z   ...
2026-10-10T21:11:57.9481750Z # Subtest: A ROLE NAMES THE CAPABILITIES IT NEEDS: only a participant with all of them is offered, and one without them cannot be assigned
2026-10-10T21:11:57.9483683Z ok 628 - A ROLE NAMES THE CAPABILITIES IT NEEDS: only a participant with all of them is offered, and one without them cannot be assigned
2026-10-10T21:11:57.9484725Z   ---
2026-10-10T21:11:57.9485909Z   duration_ms: 29.906574
2026-10-10T21:11:57.9486347Z   type: 'test'
2026-10-10T21:11:57.9486713Z   ...
2026-10-10T21:11:57.9487747Z # Subtest: A PARTICIPANT DECLARES ITS CAPABILITIES: what a participant declares decides whether it is offered
2026-10-10T21:11:57.9489350Z ok 629 - A PARTICIPANT DECLARES ITS CAPABILITIES: what a participant declares decides whether it is offered
2026-10-10T21:11:57.9490270Z   ---
2026-10-10T21:11:57.9490631Z   duration_ms: 18.697652
2026-10-10T21:11:57.9491038Z   type: 'test'
2026-10-10T21:11:57.9491382Z   ...
2026-10-10T21:11:57.9492506Z # Subtest: A PARTICIPANT DECLARES WHERE IT PROCESSES DATA: each participant offered is shown with where it processes data
2026-10-10T21:11:57.9494257Z ok 630 - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA: each participant offered is shown with where it processes data
2026-10-10T21:11:57.9495497Z   ---
2026-10-10T21:11:57.9495863Z   duration_ms: 17.91871
2026-10-10T21:11:57.9496943Z   type: 'test'
2026-10-10T21:11:57.9497307Z   ...
2026-10-10T21:11:57.9498445Z # Subtest: A PRODUCT DECLARES ITS DEFINITION OF DONE: a condition the author adds is declared in the product's own repository
2026-10-10T21:11:57.9500504Z ok 631 - A PRODUCT DECLARES ITS DEFINITION OF DONE: a condition the author adds is declared in the product's own repository
2026-10-10T21:11:57.9501492Z   ---
2026-10-10T21:11:57.9501845Z   duration_ms: 100.953881
2026-10-10T21:11:57.9502263Z   type: 'test'
2026-10-10T21:11:57.9502598Z   ...
2026-10-10T21:11:57.9503723Z # Subtest: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, the Definition of Done shown is the job rules
2026-10-10T21:11:57.9505759Z ok 632 - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, the Definition of Done shown is the job rules
2026-10-10T21:11:57.9506788Z   ---
2026-10-10T21:11:57.9507139Z   duration_ms: 20.49386
2026-10-10T21:11:57.9508261Z   type: 'test'
2026-10-10T21:11:57.9508627Z   ...
2026-10-10T21:11:57.9509689Z # Subtest: THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, no condition beyond the job rules
2026-10-10T21:11:57.9511169Z ok 633 - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES: without a declaration, no condition beyond the job rules
2026-10-10T21:11:57.9512000Z   ---
2026-10-10T21:11:57.9512321Z   duration_ms: 20.608877
2026-10-10T21:11:57.9512726Z   type: 'test'
2026-10-10T21:11:57.9513074Z   ...
2026-10-10T21:11:57.9513970Z # Subtest: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: the sprint is given a branch of its own
2026-10-10T21:11:57.9515607Z ok 634 - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: the sprint is given a branch of its own
2026-10-10T21:11:57.9516653Z   ---
2026-10-10T21:11:57.9517021Z   duration_ms: 99.076627
2026-10-10T21:11:57.9517452Z   type: 'test'
2026-10-10T21:11:57.9517816Z   ...
2026-10-10T21:11:57.9520267Z # Subtest: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: merging the branch into the default branch is the gate at its end, decided by the Product Owner after the review
2026-10-10T21:11:57.9522660Z ok 635 - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN: merging the branch into the default branch is the gate at its end, decided by the Product Owner after the review
2026-10-10T21:11:57.9523819Z   ---
2026-10-10T21:11:57.9524174Z   duration_ms: 20.049517
2026-10-10T21:11:57.9524576Z   type: 'test'
2026-10-10T21:11:57.9525163Z   ...
2026-10-10T21:11:57.9526327Z # Subtest: WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET: without a branch, the page says the work merges into the default branch
2026-10-10T21:11:57.9528125Z ok 636 - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET: without a branch, the page says the work merges into the default branch
2026-10-10T21:11:57.9529081Z   ---
2026-10-10T21:11:57.9529430Z   duration_ms: 35.470295
2026-10-10T21:11:57.9530524Z   type: 'test'
2026-10-10T21:11:57.9530880Z   ...
2026-10-10T21:11:57.9531745Z # Subtest: A GATE NAMES WHO DECIDES IT: each gate is shown with its decider, a role or an automated check
2026-10-10T21:11:57.9533062Z ok 637 - A GATE NAMES WHO DECIDES IT: each gate is shown with its decider, a role or an automated check
2026-10-10T21:11:57.9533851Z   ---
2026-10-10T21:11:57.9534166Z   duration_ms: 21.871482
2026-10-10T21:11:57.9534570Z   type: 'test'
2026-10-10T21:11:57.9535115Z   ...
2026-10-10T21:11:57.9536317Z # Subtest: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file come to wait is notified, naming it and where it is
2026-10-10T21:11:57.9538013Z ok 638 - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file come to wait is notified, naming it and where it is
2026-10-10T21:11:57.9538897Z   ---
2026-10-10T21:11:57.9539231Z   duration_ms: 238.244716
2026-10-10T21:11:57.9539623Z   type: 'test'
2026-10-10T21:11:57.9539973Z   ...
2026-10-10T21:11:57.9541765Z # Subtest: NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page asks before the click; the click asks once
2026-10-10T21:11:57.9543378Z ok 639 - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page asks before the click; the click asks once
2026-10-10T21:11:57.9544266Z   ---
2026-10-10T21:11:57.9544646Z   duration_ms: 163.614732
2026-10-10T21:11:57.9545646Z   type: 'test'
2026-10-10T21:11:57.9546019Z   ...
2026-10-10T21:11:57.9547310Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — accepted while the blob matches the record, waiting once it does not
2026-10-10T21:11:57.9549082Z ok 640 - STATUS IS DERIVED FROM THE RECORDS — accepted while the blob matches the record, waiting once it does not
2026-10-10T21:11:57.9550046Z   ---
2026-10-10T21:11:57.9550421Z   duration_ms: 162.099644
2026-10-10T21:11:57.9550876Z   type: 'test'
2026-10-10T21:11:57.9551250Z   ...
2026-10-10T21:11:57.9553367Z # Subtest: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting all local storage and reloading rederives the same facts
2026-10-10T21:11:57.9555515Z ok 641 - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED — deleting all local storage and reloading rederives the same facts
2026-10-10T21:11:57.9556498Z   ---
2026-10-10T21:11:57.9556845Z   duration_ms: 206.68477
2026-10-10T21:11:57.9557246Z   type: 'test'
2026-10-10T21:11:57.9557617Z   ...
2026-10-10T21:11:57.9558818Z # Subtest: CONFIGURATION LIVES IN THE BROWSER — Switch on is kept in this browser's storage; no write request is made
2026-10-10T21:11:57.9560594Z ok 642 - CONFIGURATION LIVES IN THE BROWSER — Switch on is kept in this browser's storage; no write request is made
2026-10-10T21:11:57.9561505Z   ---
2026-10-10T21:11:57.9561866Z   duration_ms: 152.546983
2026-10-10T21:11:57.9562315Z   type: 'test'
2026-10-10T21:11:57.9562682Z   ...
2026-10-10T21:11:57.9565273Z # Subtest: EVERY SETTING IS REACHED FROM ONE PAGE — the "notifications" key the dashboard writes has a place on the settings page
2026-10-10T21:11:57.9567374Z ok 643 - EVERY SETTING IS REACHED FROM ONE PAGE — the "notifications" key the dashboard writes has a place on the settings page
2026-10-10T21:11:57.9568432Z   ---
2026-10-10T21:11:57.9568807Z   duration_ms: 103.018345
2026-10-10T21:11:57.9569247Z   type: 'test'
2026-10-10T21:11:57.9569612Z   ...
2026-10-10T21:11:57.9570877Z # Subtest: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN — Test and Switch off sit together with the state
2026-10-10T21:11:57.9572768Z ok 644 - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN — Test and Switch off sit together with the state
2026-10-10T21:11:57.9573717Z   ---
2026-10-10T21:11:57.9574087Z   duration_ms: 192.126611
2026-10-10T21:11:57.9575301Z   type: 'test'
2026-10-10T21:11:57.9575897Z   ...
2026-10-10T21:11:57.9577156Z # Subtest: TST-280 A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a product's own token reaches only its own server
2026-10-10T21:11:57.9578927Z ok 645 - TST-280 A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a product's own token reaches only its own server
2026-10-10T21:11:57.9579890Z   ---
2026-10-10T21:11:57.9580263Z   duration_ms: 65.22896
2026-10-10T21:11:57.9580656Z   type: 'test'
2026-10-10T21:11:57.9581006Z   ...
2026-10-10T21:11:57.9582133Z # Subtest: EVERY STEP EXPLAINS ITSELF — the folded explanation names what, how often, whose tokens, and when not
2026-10-10T21:11:57.9583915Z ok 646 - EVERY STEP EXPLAINS ITSELF — the folded explanation names what, how often, whose tokens, and when not
2026-10-10T21:11:57.9585617Z   ---
2026-10-10T21:11:57.9586041Z   duration_ms: 103.53172
2026-10-10T21:11:57.9586479Z   type: 'test'
2026-10-10T21:11:57.9586828Z   ...
2026-10-10T21:11:57.9588001Z # Subtest: NO SERVER — every request a check makes goes to a repository server, never to any origin of Agent M's own
2026-10-10T21:11:57.9589696Z ok 647 - NO SERVER — every request a check makes goes to a repository server, never to any origin of Agent M's own
2026-10-10T21:11:57.9590669Z   ---
2026-10-10T21:11:57.9591041Z   duration_ms: 64.73985
2026-10-10T21:11:57.9591452Z   type: 'test'
2026-10-10T21:11:57.9591791Z   ...
2026-10-10T21:11:57.9592531Z # Subtest: TST-283 UC-001 release disclosure covers GitHub and GitLab product routes
2026-10-10T21:11:57.9593734Z ok 648 - TST-283 UC-001 release disclosure covers GitHub and GitLab product routes
2026-10-10T21:11:57.9594489Z   ---
2026-10-10T21:11:57.9595402Z   duration_ms: 272.290666
2026-10-10T21:11:57.9595848Z   type: 'test'
2026-10-10T21:11:57.9596918Z   ...
2026-10-10T21:11:57.9597679Z # Subtest: TST-286 UC-001 release transaction guards product writes and browser state
2026-10-10T21:11:57.9598786Z ok 649 - TST-286 UC-001 release transaction guards product writes and browser state
2026-10-10T21:11:57.9599526Z   ---
2026-10-10T21:11:57.9599889Z   duration_ms: 325.083943
2026-10-10T21:11:57.9600266Z   type: 'test'
2026-10-10T21:11:57.9600596Z   ...
2026-10-10T21:11:57.9601375Z # Subtest: TST-287 UC-001 release GitLab transaction keeps its project token at its issuer
2026-10-10T21:11:57.9602576Z ok 650 - TST-287 UC-001 release GitLab transaction keeps its project token at its issuer
2026-10-10T21:11:57.9603344Z   ---
2026-10-10T21:11:57.9603738Z   duration_ms: 165.971975
2026-10-10T21:11:57.9604164Z   type: 'test'
2026-10-10T21:11:57.9604520Z   ...
2026-10-10T21:11:57.9605771Z # Subtest: the public paired Bridge dispatches endpoint-test over loopback and enforces token rotation
2026-10-10T21:11:57.9608040Z ok 651 - the public paired Bridge dispatches endpoint-test over loopback and enforces token rotation
2026-10-10T21:11:57.9608977Z   ---
2026-10-10T21:11:57.9609356Z   duration_ms: 72.98991
2026-10-10T21:11:57.9609768Z   type: 'test'
2026-10-10T21:11:57.9610122Z   ...
2026-10-10T21:11:57.9611144Z # Subtest: the release dashboard reads and opens current requirements without writes with or without a token
2026-10-10T21:11:57.9612690Z ok 652 - the release dashboard reads and opens current requirements without writes with or without a token
2026-10-10T21:11:57.9613857Z   ---
2026-10-10T21:11:57.9614235Z   duration_ms: 377.755723
2026-10-10T21:11:57.9614662Z   type: 'test'
2026-10-10T21:11:57.9615266Z   ...
2026-10-10T21:11:57.9615994Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":401,"duration":2}
2026-10-10T21:11:57.9617080Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":3}
2026-10-10T21:11:57.9618158Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":2}
2026-10-10T21:11:57.9620400Z # Subtest: the public default endpoint-test job crosses a paired loopback Bridge and preserves provider results
2026-10-10T21:11:57.9622090Z ok 653 - the public default endpoint-test job crosses a paired loopback Bridge and preserves provider results
2026-10-10T21:11:57.9623005Z   ---
2026-10-10T21:11:57.9623362Z   duration_ms: 32.725904
2026-10-10T21:11:57.9623757Z   type: 'test'
2026-10-10T21:11:57.9624131Z   ...
2026-10-10T21:11:57.9625338Z # Subtest: the release dashboard toggles current requirements without writes with or without a token
2026-10-10T21:11:57.9626824Z ok 654 - the release dashboard toggles current requirements without writes with or without a token
2026-10-10T21:11:57.9627669Z   ---
2026-10-10T21:11:57.9628035Z   duration_ms: 347.607236
2026-10-10T21:11:57.9628453Z   type: 'test'
2026-10-10T21:11:57.9628807Z   ...
2026-10-10T21:11:57.9630369Z # Subtest: TST-279-R1 public Store persists the accepted optional jump-host shape
2026-10-10T21:11:57.9631615Z ok 655 - TST-279-R1 public Store persists the accepted optional jump-host shape
2026-10-10T21:11:57.9632319Z   ---
2026-10-10T21:11:57.9632656Z   duration_ms: 3.427906
2026-10-10T21:11:57.9633048Z   type: 'test'
2026-10-10T21:11:57.9633403Z   ...
2026-10-10T21:11:57.9634060Z # Subtest: TST-279-R2 public Store isolates jump hosts by instance
2026-10-10T21:11:57.9635249Z ok 656 - TST-279-R2 public Store isolates jump hosts by instance
2026-10-10T21:11:57.9635889Z   ---
2026-10-10T21:11:57.9636234Z   duration_ms: 0.3034
2026-10-10T21:11:57.9636622Z   type: 'test'
2026-10-10T21:11:57.9636982Z   ...
2026-10-10T21:11:57.9637621Z # Subtest: TST-279-R3 public listing hides jump-host login and values
2026-10-10T21:11:57.9638544Z ok 657 - TST-279-R3 public listing hides jump-host login and values
2026-10-10T21:11:57.9639168Z   ---
2026-10-10T21:11:57.9639521Z   duration_ms: 0.662395
2026-10-10T21:11:57.9639916Z   type: 'test'
2026-10-10T21:11:57.9640265Z   ...
2026-10-10T21:11:57.9641951Z # Subtest: TST-279-R4 public Clear removes the persisted jump-host login
2026-10-10T21:11:57.9643002Z ok 658 - TST-279-R4 public Clear removes the persisted jump-host login
2026-10-10T21:11:57.9643688Z   ---
2026-10-10T21:11:57.9644062Z   duration_ms: 0.241894
2026-10-10T21:11:57.9644501Z   type: 'test'
2026-10-10T21:11:57.9656475Z   ...
2026-10-10T21:11:57.9657562Z # Subtest: the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:11:57.9659240Z ok 659 - the dashboard reaches \#process: views.mjs maps it to process-view.mjs, and built.json lists that file
2026-10-10T21:11:57.9660176Z   ---
2026-10-10T21:11:57.9660538Z   duration_ms: 1.0425
2026-10-10T21:11:57.9660937Z   type: 'test'
2026-10-10T21:11:57.9661296Z   ...
2026-10-10T21:11:57.9662350Z # Subtest: routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:11:57.9665090Z ok 660 - routes.process(app) renders MOD-implementation-pages' route, titled "How this product is developed"
2026-10-10T21:11:57.9666090Z   ---
2026-10-10T21:11:57.9666488Z   duration_ms: 86.258449
2026-10-10T21:11:57.9666907Z   type: 'test'
2026-10-10T21:11:57.9667267Z   ...
2026-10-10T21:11:57.9668489Z # Subtest: ITM-281 — public process caller derives and clears only selected practice tables before one Save
2026-10-10T21:11:57.9670221Z ok 661 - ITM-281 — public process caller derives and clears only selected practice tables before one Save
2026-10-10T21:11:57.9671515Z   ---
2026-10-10T21:11:57.9671911Z   duration_ms: 123.927392
2026-10-10T21:11:57.9672354Z   type: 'test'
2026-10-10T21:11:57.9672715Z   ...
2026-10-10T21:12:00.5100681Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":12}
2026-10-10T21:12:00.5663086Z # Subtest: TST-266002: configured HTTPS forwarding keeps jump-host login separate from the Bridge token
2026-10-10T21:12:00.5666309Z ok 662 - TST-266002: configured HTTPS forwarding keeps jump-host login separate from the Bridge token
2026-10-10T21:12:00.5667616Z   ---
2026-10-10T21:12:00.5668269Z   duration_ms: 424.833254
2026-10-10T21:12:00.5668980Z   type: 'test'
2026-10-10T21:12:00.5669612Z   ...
2026-10-10T21:12:00.5818104Z # Subtest: TST-292005: a direct configuration is browser-local localStorage state, never a cookie
2026-10-10T21:12:00.5832872Z ok 663 - TST-292005: a direct configuration is browser-local localStorage state, never a cookie
2026-10-10T21:12:00.5834214Z   ---
2026-10-10T21:12:00.5835074Z   duration_ms: 746.066165
2026-10-10T21:12:00.5835738Z   type: 'test'
2026-10-10T21:12:00.5836297Z   ...
2026-10-10T21:12:00.5837308Z # Subtest: TST-292006: an endpoint credential stays out of URLs and repository writes
2026-10-10T21:12:00.5838816Z ok 664 - TST-292006: an endpoint credential stays out of URLs and repository writes
2026-10-10T21:12:00.5839770Z   ---
2026-10-10T21:12:00.5840334Z   duration_ms: 244.841111
2026-10-10T21:12:00.5840952Z   type: 'test'
2026-10-10T21:12:00.5841520Z   ...
2026-10-10T21:12:00.5842745Z # Subtest: TST-292007: browser blocking remains actionable at the release route
2026-10-10T21:12:00.5844567Z ok 665 - TST-292007: browser blocking remains actionable at the release route
2026-10-10T21:12:00.5845711Z   ---
2026-10-10T21:12:00.5846258Z   duration_ms: 248.632865
2026-10-10T21:12:00.5846865Z   type: 'test'
2026-10-10T21:12:00.5847386Z   ...
2026-10-10T21:12:00.5848180Z # Subtest: TST-292008: Clear removes the persistent endpoint record
2026-10-10T21:12:00.5849425Z ok 666 - TST-292008: Clear removes the persistent endpoint record
2026-10-10T21:12:00.5850232Z   ---
2026-10-10T21:12:00.5850762Z   duration_ms: 365.660768
2026-10-10T21:12:00.5851347Z   type: 'test'
2026-10-10T21:12:00.5851881Z   ...
2026-10-10T21:12:00.5853045Z # Subtest: TST-292009: disclosure and key controls precede a retained Bridge configuration without a direct call
2026-10-10T21:12:00.5855503Z ok 667 - TST-292009: disclosure and key controls precede a retained Bridge configuration without a direct call
2026-10-10T21:12:00.5857415Z   ---
2026-10-10T21:12:00.5858035Z   duration_ms: 309.962482
2026-10-10T21:12:00.5858744Z   type: 'test'
2026-10-10T21:12:00.5859394Z   ...
2026-10-10T21:12:00.5860537Z # Subtest: TST-292010: an endpoint without an optional key succeeds without sending one
2026-10-10T21:12:00.5862173Z ok 668 - TST-292010: an endpoint without an optional key succeeds without sending one
2026-10-10T21:12:00.5863253Z   ---
2026-10-10T21:12:00.5863863Z   duration_ms: 265.446909
2026-10-10T21:12:00.5864617Z   type: 'test'
2026-10-10T21:12:00.5865563Z   ...
2026-10-10T21:12:00.5866623Z # Subtest: TST-293002: release notification names and routes exactly one completed report
2026-10-10T21:12:00.5867995Z ok 669 - TST-293002: release notification names and routes exactly one completed report
2026-10-10T21:12:00.5868781Z   ---
2026-10-10T21:12:00.5869150Z   duration_ms: 506.933516
2026-10-10T21:12:00.5869572Z   type: 'test'
2026-10-10T21:12:00.5869973Z   ...
2026-10-10T21:12:00.5871766Z # Subtest: MOD-repository-hosts listTags — the tags of a repository with their commits, and only those matching a pattern (GitHub, GitLab)
2026-10-10T21:12:00.5874052Z ok 670 - MOD-repository-hosts listTags — the tags of a repository with their commits, and only those matching a pattern (GitHub, GitLab)
2026-10-10T21:12:00.5875384Z   ---
2026-10-10T21:12:00.5875807Z   duration_ms: 38.002266
2026-10-10T21:12:00.5876080Z   type: 'test'
2026-10-10T21:12:00.5876291Z   ...
2026-10-10T21:12:00.5877092Z # Subtest: MOD-repository-hosts listTags — every tag across more than one page, the pattern matched against all of them (GitHub, GitLab)
2026-10-10T21:12:00.5878514Z ok 671 - MOD-repository-hosts listTags — every tag across more than one page, the pattern matched against all of them (GitHub, GitLab)
2026-10-10T21:12:00.5879103Z   ---
2026-10-10T21:12:00.5879308Z   duration_ms: 9.340744
2026-10-10T21:12:00.5879547Z   type: 'test'
2026-10-10T21:12:00.5879743Z   ...
2026-10-10T21:12:00.5880284Z # Subtest: MOD-repository-hosts createTag — a tag set on the commit named (GitHub, GitLab)
2026-10-10T21:12:00.5881064Z ok 672 - MOD-repository-hosts createTag — a tag set on the commit named (GitHub, GitLab)
2026-10-10T21:12:00.5881496Z   ---
2026-10-10T21:12:00.5881695Z   duration_ms: 1.318109
2026-10-10T21:12:00.5881931Z   type: 'test'
2026-10-10T21:12:00.5882127Z   ...
2026-10-10T21:12:00.5882926Z # Subtest: MOD-repository-hosts createTag — an existing tag is refused with TagExists naming its commit, and not moved (GitHub's 422, GitLab's 400)
2026-10-10T21:12:00.5884151Z ok 673 - MOD-repository-hosts createTag — an existing tag is refused with TagExists naming its commit, and not moved (GitHub's 422, GitLab's 400)
2026-10-10T21:12:00.5884754Z   ---
2026-10-10T21:12:00.5885303Z   duration_ms: 3.585361
2026-10-10T21:12:00.5885818Z   type: 'test'
2026-10-10T21:12:00.5886191Z   ...
2026-10-10T21:12:00.5887816Z # Subtest: MOD-repository-hosts listTags, createTag — a refused token, a missing permission and a used-up rate limit are the module's named failures
2026-10-10T21:12:00.5890308Z ok 674 - MOD-repository-hosts listTags, createTag — a refused token, a missing permission and a used-up rate limit are the module's named failures
2026-10-10T21:12:00.5891489Z   ---
2026-10-10T21:12:00.5891858Z   duration_ms: 4.029978
2026-10-10T21:12:00.5892285Z   type: 'test'
2026-10-10T21:12:00.5892644Z   ...
2026-10-10T21:12:00.5893751Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS — a GitHub repository's address, as the browser shows it
2026-10-10T21:12:00.5896161Z ok 675 - A PRODUCT IS NAMED BY ITS ADDRESS — a GitHub repository's address, as the browser shows it
2026-10-10T21:12:00.5897038Z   ---
2026-10-10T21:12:00.5897345Z   duration_ms: 4.842906
2026-10-10T21:12:00.5897687Z   type: 'test'
2026-10-10T21:12:00.5897994Z   ...
2026-10-10T21:12:00.5899234Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS · GITLAB PRODUCTS ARE SUPPORTED — a GitLab project's address, in nested groups
2026-10-10T21:12:00.5900898Z ok 676 - A PRODUCT IS NAMED BY ITS ADDRESS · GITLAB PRODUCTS ARE SUPPORTED — a GitLab project's address, in nested groups
2026-10-10T21:12:00.5901992Z   ---
2026-10-10T21:12:00.5902299Z   duration_ms: 0.864085
2026-10-10T21:12:00.5902666Z   type: 'test'
2026-10-10T21:12:00.5903014Z   ...
2026-10-10T21:12:00.5904449Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only to GitHub's API, the project token only to its project's API
2026-10-10T21:12:00.5912390Z ok 677 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only to GitHub's API, the project token only to its project's API
2026-10-10T21:12:00.5913497Z   ---
2026-10-10T21:12:00.5913837Z   duration_ms: 47.358958
2026-10-10T21:12:00.5914253Z   type: 'test'
2026-10-10T21:12:00.5914608Z   ...
2026-10-10T21:12:00.5916063Z # Subtest: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — GitHub's 403 with a used-up limit is that limit, never the token
2026-10-10T21:12:00.5917982Z ok 678 - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — GitHub's 403 with a used-up limit is that limit, never the token
2026-10-10T21:12:00.5918953Z   ---
2026-10-10T21:12:00.5919321Z   duration_ms: 11.398866
2026-10-10T21:12:00.5919743Z   type: 'test'
2026-10-10T21:12:00.5920073Z   ...
2026-10-10T21:12:00.5922135Z # Subtest: UC-001 5a — a write that a public repository refuses because the token does not reach it is named so, and nothing is written
2026-10-10T21:12:00.5924263Z ok 679 - UC-001 5a — a write that a public repository refuses because the token does not reach it is named so, and nothing is written
2026-10-10T21:12:00.5925956Z   ---
2026-10-10T21:12:00.5926317Z   duration_ms: 7.150265
2026-10-10T21:12:00.5926721Z   type: 'test'
2026-10-10T21:12:00.5927056Z   ...
2026-10-10T21:12:00.5928385Z # Subtest: UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitHub)
2026-10-10T21:12:00.5930314Z ok 680 - UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitHub)
2026-10-10T21:12:00.5931265Z   ---
2026-10-10T21:12:00.5931589Z   duration_ms: 13.045877
2026-10-10T21:12:00.5931979Z   type: 'test'
2026-10-10T21:12:00.5932301Z   ...
2026-10-10T21:12:00.5933563Z # Subtest: UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitLab)
2026-10-10T21:12:00.5935785Z ok 681 - UC-001 5 — all files of a change in one commit on the head that was read, and Moved when the head moved meanwhile (GitLab)
2026-10-10T21:12:00.5937090Z   ---
2026-10-10T21:12:00.5937503Z   duration_ms: 10.469536
2026-10-10T21:12:00.5937792Z   type: 'test'
2026-10-10T21:12:00.5938021Z   ...
2026-10-10T21:12:00.5938977Z # Subtest: UC-001 5 — GitLab: a commit that lands while the change's files are read, touching none of them, is Moved, and nothing is written
2026-10-10T21:12:00.5940298Z ok 682 - UC-001 5 — GitLab: a commit that lands while the change's files are read, touching none of them, is Moved, and nothing is written
2026-10-10T21:12:00.5940983Z   ---
2026-10-10T21:12:00.5941230Z   duration_ms: 3.810585
2026-10-10T21:12:00.5941524Z   type: 'test'
2026-10-10T21:12:00.5941776Z   ...
2026-10-10T21:12:00.5942605Z # Subtest: UC-001 — the token pages: GitHub's prefilled token page and the list of tokens, a GitLab project's Access tokens page
2026-10-10T21:12:00.5943806Z ok 683 - UC-001 — the token pages: GitHub's prefilled token page and the list of tokens, a GitLab project's Access tokens page
2026-10-10T21:12:00.5944387Z   ---
2026-10-10T21:12:00.5944580Z   duration_ms: 1.319611
2026-10-10T21:12:00.5944802Z   type: 'test'
2026-10-10T21:12:00.5945334Z   ...
2026-10-10T21:12:00.5946252Z # Subtest: UC-001 5 — an empty repository: no commit and no path; its first commit through the contents API, the others in one commit on it
2026-10-10T21:12:00.5947602Z ok 684 - UC-001 5 — an empty repository: no commit and no path; its first commit through the contents API, the others in one commit on it
2026-10-10T21:12:00.5948746Z   ---
2026-10-10T21:12:00.5949006Z   duration_ms: 5.143331
2026-10-10T21:12:00.5949528Z   type: 'test'
2026-10-10T21:12:00.5949749Z   ...
2026-10-10T21:12:00.5950525Z # Subtest: UC-001 5 — on a GitLab server, a first commit is refused with the advice to push one, and nothing is requested
2026-10-10T21:12:00.5951686Z ok 685 - UC-001 5 — on a GitLab server, a first commit is refused with the advice to push one, and nothing is requested
2026-10-10T21:12:00.5952298Z   ---
2026-10-10T21:12:00.5952521Z   duration_ms: 0.772824
2026-10-10T21:12:00.5952776Z   type: 'test'
2026-10-10T21:12:00.5953007Z   ...
2026-10-10T21:12:00.5953760Z # Subtest: UC-001 4 — repositoryInfo: default branch, visibility, whether the token may write, in one request
2026-10-10T21:12:00.5955422Z ok 686 - UC-001 4 — repositoryInfo: default branch, visibility, whether the token may write, in one request
2026-10-10T21:12:00.5956075Z   ---
2026-10-10T21:12:00.5956333Z   duration_ms: 5.149904
2026-10-10T21:12:00.5956631Z   type: 'test'
2026-10-10T21:12:00.5956892Z   ...
2026-10-10T21:12:00.5957693Z # Subtest: UC-001 4–5 — readSnapshot: the repository at one commit, its files read at that commit, each once
2026-10-10T21:12:00.5958727Z ok 687 - UC-001 4–5 — readSnapshot: the repository at one commit, its files read at that commit, each once
2026-10-10T21:12:00.5959603Z   ---
2026-10-10T21:12:00.5959819Z   duration_ms: 10.543415
2026-10-10T21:12:00.5960054Z   type: 'test'
2026-10-10T21:12:00.5960246Z   ...
2026-10-10T21:12:00.5960904Z # Subtest: UC-001 2a, 4a — NotFound names the repository or the branch; a server the page cannot reach is Unreachable
2026-10-10T21:12:00.5962233Z ok 688 - UC-001 2a, 4a — NotFound names the repository or the branch; a server the page cannot reach is Unreachable
2026-10-10T21:12:00.5962824Z   ---
2026-10-10T21:12:00.5963029Z   duration_ms: 3.397519
2026-10-10T21:12:00.5963270Z   type: 'test'
2026-10-10T21:12:00.5963464Z   ...
2026-10-10T21:12:00.5964167Z # Subtest: NO SECRET IN THE REPOSITORY — a commit holding a configured secret or the token is refused before anything is sent
2026-10-10T21:12:00.5965454Z ok 689 - NO SECRET IN THE REPOSITORY — a commit holding a configured secret or the token is refused before anything is sent
2026-10-10T21:12:00.5965992Z   ---
2026-10-10T21:12:00.5966191Z   duration_ms: 3.115228
2026-10-10T21:12:00.5966414Z   type: 'test'
2026-10-10T21:12:00.5966717Z   ...
2026-10-10T21:12:00.5967338Z # Subtest: resultsAt — a commit's outcomes per level, with their counts
2026-10-10T21:12:00.5968407Z ok 690 - resultsAt — a commit's outcomes per level, with their counts
2026-10-10T21:12:00.5969064Z   ---
2026-10-10T21:12:00.5969409Z   duration_ms: 5.829992
2026-10-10T21:12:00.5969843Z   type: 'test'
2026-10-10T21:12:00.5970200Z   ...
2026-10-10T21:12:00.5971190Z # Subtest: resultsAt — a level without a record of the commit reads not run, never passed
2026-10-10T21:12:00.5972529Z ok 691 - resultsAt — a level without a record of the commit reads not run, never passed
2026-10-10T21:12:00.5973279Z   ---
2026-10-10T21:12:00.5973634Z   duration_ms: 0.660963
2026-10-10T21:12:00.5974113Z   type: 'test'
2026-10-10T21:12:00.5974459Z   ...
2026-10-10T21:12:00.5975453Z # Subtest: resultsAt — a record marked uncommitted is left out
2026-10-10T21:12:00.5976447Z ok 692 - resultsAt — a record marked uncommitted is left out
2026-10-10T21:12:00.5977019Z   ---
2026-10-10T21:12:00.5977366Z   duration_ms: 0.896616
2026-10-10T21:12:00.5977758Z   type: 'test'
2026-10-10T21:12:00.5978095Z   ...
2026-10-10T21:12:00.5979508Z # Subtest: flakyTests — a deterministic test with both outcomes on one commit, with both records; a model-dependent test is not reported
2026-10-10T21:12:00.5981505Z ok 693 - flakyTests — a deterministic test with both outcomes on one commit, with both records; a model-dependent test is not reported
2026-10-10T21:12:00.5982531Z   ---
2026-10-10T21:12:00.5982881Z   duration_ms: 0.987247
2026-10-10T21:12:00.5983275Z   type: 'test'
2026-10-10T21:12:00.5983624Z   ...
2026-10-10T21:12:00.5984728Z # Subtest: rateComparison — a rate lower than the last release's is marked worse, one at or above is not
2026-10-10T21:12:00.5987061Z ok 694 - rateComparison — a rate lower than the last release's is marked worse, one at or above is not
2026-10-10T21:12:00.5987849Z   ---
2026-10-10T21:12:00.5988165Z   duration_ms: 1.452041
2026-10-10T21:12:00.5988521Z   type: 'test'
2026-10-10T21:12:00.5988830Z   ...
2026-10-10T21:12:00.5989524Z # Subtest: rateComparison — no comparison without a last release
2026-10-10T21:12:00.5990501Z ok 695 - rateComparison — no comparison without a last release
2026-10-10T21:12:00.5991106Z   ---
2026-10-10T21:12:00.5991432Z   duration_ms: 0.272873
2026-10-10T21:12:00.5991822Z   type: 'test'
2026-10-10T21:12:00.5992161Z   ...
2026-10-10T21:12:00.7346506Z # Subtest: gitBlobSha equals git hash-object, byte for byte
2026-10-10T21:12:00.7386055Z ok 696 - gitBlobSha equals git hash-object, byte for byte
2026-10-10T21:12:00.7409114Z   ---
2026-10-10T21:12:00.7415766Z   duration_ms: 270.256459
2026-10-10T21:12:00.7416497Z   type: 'test'
2026-10-10T21:12:00.7417074Z   ...
2026-10-10T21:12:00.7417855Z # Subtest: records round-trip and carry no text
2026-10-10T21:12:00.7418732Z ok 697 - records round-trip and carry no text
2026-10-10T21:12:00.7419613Z   ---
2026-10-10T21:12:00.7424610Z   duration_ms: 1.788563
2026-10-10T21:12:00.7425511Z   type: 'test'
2026-10-10T21:12:00.7426053Z   ...
2026-10-10T21:12:00.7427049Z # Subtest: extractSection: heading to next heading of same level, code fences masked
2026-10-10T21:12:00.7428466Z ok 698 - extractSection: heading to next heading of same level, code fences masked
2026-10-10T21:12:00.7429904Z   ---
2026-10-10T21:12:00.7430474Z   duration_ms: 0.844128
2026-10-10T21:12:00.7431078Z   type: 'test'
2026-10-10T21:12:00.7431603Z   ...
2026-10-10T21:12:00.7432408Z # Subtest: sectionText is the same bytes the Python applier hashes
2026-10-10T21:12:00.7433558Z ok 699 - sectionText is the same bytes the Python applier hashes
2026-10-10T21:12:00.7434420Z   ---
2026-10-10T21:12:00.7450633Z   duration_ms: 58.210563
2026-10-10T21:12:00.7451324Z   type: 'test'
2026-10-10T21:12:00.7451873Z   ...
2026-10-10T21:12:00.7452824Z # Subtest: queue index and decisions parse like scripts/spec_dashboard.py
2026-10-10T21:12:00.7454180Z ok 700 - queue index and decisions parse like scripts/spec_dashboard.py
2026-10-10T21:12:00.7455456Z   ---
2026-10-10T21:12:00.7456067Z   duration_ms: 1.168216
2026-10-10T21:12:00.7456734Z   type: 'test'
2026-10-10T21:12:00.7457312Z   ...
2026-10-10T21:12:00.7458103Z # Subtest: STATUS IS DERIVED FROM THE RECORDS: use cases
2026-10-10T21:12:00.7459167Z ok 701 - STATUS IS DERIVED FROM THE RECORDS: use cases
2026-10-10T21:12:00.7459988Z   ---
2026-10-10T21:12:00.7460754Z   duration_ms: 0.316515
2026-10-10T21:12:00.7472189Z   type: 'test'
2026-10-10T21:12:00.7472794Z   ...
2026-10-10T21:12:00.7473654Z # Subtest: STATUS IS DERIVED FROM THE RECORDS: SPEC proposals
2026-10-10T21:12:00.7474717Z ok 702 - STATUS IS DERIVED FROM THE RECORDS: SPEC proposals
2026-10-10T21:12:00.7475785Z   ---
2026-10-10T21:12:00.7476348Z   duration_ms: 0.757574
2026-10-10T21:12:00.7477013Z   type: 'test'
2026-10-10T21:12:00.7477597Z   ...
2026-10-10T21:12:00.7478681Z # Subtest: an applied entry is judged by its own section, not by headings later entries filled
2026-10-10T21:12:00.7480264Z ok 703 - an applied entry is judged by its own section, not by headings later entries filled
2026-10-10T21:12:00.7481269Z   ---
2026-10-10T21:12:00.7481796Z   duration_ms: 0.459634
2026-10-10T21:12:00.7482608Z   type: 'test'
2026-10-10T21:12:00.7483687Z   ...
2026-10-10T21:12:00.7485322Z # Subtest: an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text
2026-10-10T21:12:00.7487194Z ok 704 - an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text
2026-10-10T21:12:00.7488379Z   ---
2026-10-10T21:12:00.7488934Z   duration_ms: 1.0638
2026-10-10T21:12:00.7489506Z   type: 'test'
2026-10-10T21:12:00.7490051Z   ...
2026-10-10T21:12:00.7491396Z # Subtest: the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance
2026-10-10T21:12:00.7493653Z ok 705 - the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance
2026-10-10T21:12:00.7495872Z   ---
2026-10-10T21:12:00.7496496Z   duration_ms: 0.961277
2026-10-10T21:12:00.7497105Z   type: 'test'
2026-10-10T21:12:00.7497663Z   ...
2026-10-10T21:12:00.7498878Z # Subtest: ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing
2026-10-10T21:12:00.7500357Z ok 706 - ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing
2026-10-10T21:12:00.7501254Z   ---
2026-10-10T21:12:00.7501850Z   duration_ms: 0.573258
2026-10-10T21:12:00.7502483Z   type: 'test'
2026-10-10T21:12:00.7503051Z   ...
2026-10-10T21:12:00.7503933Z # Subtest: decisionRow is the row tools/apply_approvals.py writes
2026-10-10T21:12:00.7505351Z ok 707 - decisionRow is the row tools/apply_approvals.py writes
2026-10-10T21:12:00.7506923Z   ---
2026-10-10T21:12:00.7507556Z   duration_ms: 0.232627
2026-10-10T21:12:00.7508231Z   type: 'test'
2026-10-10T21:12:00.7508789Z   ...
2026-10-10T21:12:00.7509914Z # Subtest: replaceSection writes the proposal byte for byte and keeps the file's final newline
2026-10-10T21:12:00.7511590Z ok 708 - replaceSection writes the proposal byte for byte and keeps the file's final newline
2026-10-10T21:12:00.7512695Z   ---
2026-10-10T21:12:00.7513273Z   duration_ms: 0.710355
2026-10-10T21:12:00.7513883Z   type: 'test'
2026-10-10T21:12:00.7514449Z   ...
2026-10-10T21:12:00.7516379Z # Subtest: an entry already written in the queue's decisions is not written twice
2026-10-10T21:12:00.7518947Z ok 709 - an entry already written in the queue's decisions is not written twice
2026-10-10T21:12:00.7520306Z   ---
2026-10-10T21:12:00.7521252Z   duration_ms: 6.612614
2026-10-10T21:12:00.7521920Z   type: 'test'
2026-10-10T21:12:00.7522785Z   ...
2026-10-10T21:12:00.7525089Z # Subtest: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch
2026-10-10T21:12:00.7528681Z ok 710 - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch
2026-10-10T21:12:00.7531111Z   ---
2026-10-10T21:12:00.7531647Z   duration_ms: 3.270419
2026-10-10T21:12:00.7532484Z   type: 'test'
2026-10-10T21:12:00.7533479Z   ...
2026-10-10T21:12:00.7536105Z # Subtest: A STALE APPROVAL IS NOT APPLIED — the engine's workflow route: a proposal or a SPEC section changed after approval writes nothing and is named
2026-10-10T21:12:00.7539938Z ok 711 - A STALE APPROVAL IS NOT APPLIED — the engine's workflow route: a proposal or a SPEC section changed after approval writes nothing and is named
2026-10-10T21:12:00.7542349Z   ---
2026-10-10T21:12:00.7543254Z   duration_ms: 9.715568
2026-10-10T21:12:00.7543907Z   type: 'test'
2026-10-10T21:12:00.7544467Z   ...
2026-10-10T21:12:00.7546681Z # Subtest: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — the engine writes what the dashboard's acceptance commit writes, entry by entry in the queue's order
2026-10-10T21:12:00.7549914Z ok 712 - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — the engine writes what the dashboard's acceptance commit writes, entry by entry in the queue's order
2026-10-10T21:12:00.7551522Z   ---
2026-10-10T21:12:00.7552843Z   duration_ms: 7.271112
2026-10-10T21:12:00.7553517Z   type: 'test'
2026-10-10T21:12:00.7554109Z   ...
2026-10-10T21:12:00.7556245Z # Subtest: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — a second run writes nothing; a record the dashboard already applied is passed over
2026-10-10T21:12:00.7559013Z ok 713 - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — a second run writes nothing; a record the dashboard already applied is passed over
2026-10-10T21:12:00.7560431Z   ---
2026-10-10T21:12:00.7560990Z   duration_ms: 14.987761
2026-10-10T21:12:00.7561607Z   type: 'test'
2026-10-10T21:12:00.7562125Z   ...
2026-10-10T21:12:00.7564099Z # Subtest: A STALE APPROVAL IS NOT APPLIED — a malformed record is refused and named, and nothing of it is written
2026-10-10T21:12:00.7566593Z ok 714 - A STALE APPROVAL IS NOT APPLIED — a malformed record is refused and named, and nothing of it is written
2026-10-10T21:12:00.7567863Z   ---
2026-10-10T21:12:00.7568589Z   duration_ms: 19.519523
2026-10-10T21:12:00.7569146Z   type: 'test'
2026-10-10T21:12:00.7569878Z   ...
2026-10-10T21:12:00.7571399Z # Subtest: the records are read from the approvals folder: README.md, other kinds and files that are no Markdown are passed over
2026-10-10T21:12:00.7573803Z ok 715 - the records are read from the approvals folder: README.md, other kinds and files that are no Markdown are passed over
2026-10-10T21:12:00.7575989Z   ---
2026-10-10T21:12:00.7576862Z   duration_ms: 5.8873
2026-10-10T21:12:00.7578017Z   type: 'test'
2026-10-10T21:12:00.7578547Z   ...
2026-10-10T21:12:00.7579142Z # Subtest: front matter: scalars and lists, body separated
2026-10-10T21:12:00.7579939Z ok 716 - front matter: scalars and lists, body separated
2026-10-10T21:12:00.7580500Z   ---
2026-10-10T21:12:00.7580844Z   duration_ms: 0.518856
2026-10-10T21:12:00.7581236Z   type: 'test'
2026-10-10T21:12:00.7581583Z   ...
2026-10-10T21:12:00.7582350Z # Subtest: front matter with CR LF line ends: the fields of the LF text, the body the text's own bytes
2026-10-10T21:12:00.7583642Z ok 717 - front matter with CR LF line ends: the fields of the LF text, the body the text's own bytes
2026-10-10T21:12:00.7584424Z   ---
2026-10-10T21:12:00.7585335Z   duration_ms: 0.262734
2026-10-10T21:12:00.7585766Z   type: 'test'
2026-10-10T21:12:00.7586134Z   ...
2026-10-10T21:12:00.7587183Z # Subtest: reviewedId: a reviewed file's identifier from its path — the same for a renamed file
2026-10-10T21:12:00.7588758Z ok 718 - reviewedId: a reviewed file's identifier from its path — the same for a renamed file
2026-10-10T21:12:00.7589537Z   ---
2026-10-10T21:12:00.7589858Z   duration_ms: 0.404511
2026-10-10T21:12:00.7590234Z   type: 'test'
2026-10-10T21:12:00.7590557Z   ...
2026-10-10T21:12:00.7591940Z # Subtest: AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused with a finding
2026-10-10T21:12:00.7594223Z ok 719 - AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused with a finding
2026-10-10T21:12:00.7597367Z   ---
2026-10-10T21:12:00.7597691Z   duration_ms: 3.819151
2026-10-10T21:12:00.7598051Z   type: 'test'
2026-10-10T21:12:00.7598392Z   ...
2026-10-10T21:12:00.7599733Z # Subtest: AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends keeps its identifier; another one is still named
2026-10-10T21:12:00.7601951Z ok 720 - AN EDITED FILE KEEPS ITS IDENTIFIER — a text with CR LF line ends keeps its identifier; another one is still named
2026-10-10T21:12:00.7602949Z   ---
2026-10-10T21:12:00.7603314Z   duration_ms: 0.393991
2026-10-10T21:12:00.7603715Z   type: 'test'
2026-10-10T21:12:00.7604083Z   ...
2026-10-10T21:12:00.7605645Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none
2026-10-10T21:12:00.7608732Z ok 721 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none
2026-10-10T21:12:00.7609751Z   ---
2026-10-10T21:12:00.7610111Z   duration_ms: 0.450136
2026-10-10T21:12:00.7610503Z   type: 'test'
2026-10-10T21:12:00.7610840Z   ...
2026-10-10T21:12:00.7612315Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the click authority is what the write path takes: one commit, fast-forward only
2026-10-10T21:12:00.7614446Z ok 722 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the click authority is what the write path takes: one commit, fast-forward only
2026-10-10T21:12:00.7615677Z   ---
2026-10-10T21:12:00.7616028Z   duration_ms: 66.916553
2026-10-10T21:12:00.7616430Z   type: 'test'
2026-10-10T21:12:00.7616793Z   ...
2026-10-10T21:12:00.7618300Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event
2026-10-10T21:12:00.7621716Z ok 723 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event
2026-10-10T21:12:00.7622845Z   ---
2026-10-10T21:12:00.7623212Z   duration_ms: 3.667826
2026-10-10T21:12:00.7623608Z   type: 'test'
2026-10-10T21:12:00.7623936Z   ...
2026-10-10T21:12:00.7626103Z # Subtest: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click
2026-10-10T21:12:00.7629368Z ok 724 - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click
2026-10-10T21:12:00.7632216Z   ---
2026-10-10T21:12:00.7632450Z   duration_ms: 49.177678
2026-10-10T21:12:00.7632710Z   type: 'test'
2026-10-10T21:12:00.7633048Z   ...
2026-10-10T21:12:00.7634068Z # Subtest: EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so
2026-10-10T21:12:00.7635793Z ok 725 - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE — the lowest free port; a full range refuses and says so
2026-10-10T21:12:00.7636504Z   ---
2026-10-10T21:12:00.7636713Z   duration_ms: 2.026911
2026-10-10T21:12:00.7637310Z   type: 'test'
2026-10-10T21:12:00.7637518Z   ...
2026-10-10T21:12:00.7638268Z # Subtest: the jump host's settings are checked — a host, user or key name that could change the command is refused
2026-10-10T21:12:00.7640099Z ok 726 - the jump host's settings are checked — a host, user or key name that could change the command is refused
2026-10-10T21:12:00.7640999Z   ---
2026-10-10T21:12:00.7641360Z   duration_ms: 0.688535
2026-10-10T21:12:00.7641752Z   type: 'test'
2026-10-10T21:12:00.7643235Z   ...
2026-10-10T21:12:00.7644532Z # Subtest: THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other
2026-10-10T21:12:00.7646448Z ok 727 - THE DASHBOARD WRITES THE TUNNEL COMMANDS — both ends filled from the settings, matching each other
2026-10-10T21:12:00.7647351Z   ---
2026-10-10T21:12:00.7647694Z   duration_ms: 1.081644
2026-10-10T21:12:00.7648092Z   type: 'test'
2026-10-10T21:12:00.7648420Z   ...
2026-10-10T21:12:00.7649731Z # Subtest: a remote session is tested by asking whether anything answers at its local port — no token, nothing else
2026-10-10T21:12:00.7651573Z ok 728 - a remote session is tested by asking whether anything answers at its local port — no token, nothing else
2026-10-10T21:12:00.7652504Z   ---
2026-10-10T21:12:00.7652858Z   duration_ms: 1.072506
2026-10-10T21:12:00.7653245Z   type: 'test'
2026-10-10T21:12:00.7653581Z   ...
2026-10-10T21:12:00.7655894Z # Subtest: the app never calls fetch directly — every request goes through fetchText
2026-10-10T21:12:00.7657215Z ok 729 - the app never calls fetch directly — every request goes through fetchText
2026-10-10T21:12:00.7657710Z   ---
2026-10-10T21:12:00.7657928Z   duration_ms: 10.559464
2026-10-10T21:12:00.7658159Z   type: 'test'
2026-10-10T21:12:00.7658356Z   ...
2026-10-10T21:12:00.7658892Z # Subtest: the kernel never writes — no kernel file imports a write function of the git host
2026-10-10T21:12:00.7659638Z ok 730 - the kernel never writes — no kernel file imports a write function of the git host
2026-10-10T21:12:00.7660060Z   ---
2026-10-10T21:12:00.7660251Z   duration_ms: 16.394637
2026-10-10T21:12:00.7660475Z   type: 'test'
2026-10-10T21:12:00.7660665Z   ...
2026-10-10T21:12:00.7661188Z # Subtest: the kernel never reads through the git host — no kernel file imports anything of it
2026-10-10T21:12:00.7661939Z ok 731 - the kernel never reads through the git host — no kernel file imports anything of it
2026-10-10T21:12:00.7662358Z   ---
2026-10-10T21:12:00.7662542Z   duration_ms: 7.143883
2026-10-10T21:12:00.7662963Z   type: 'test'
2026-10-10T21:12:00.7663152Z   ...
2026-10-10T21:12:00.7663766Z # Subtest: the shells read only through what the git host provides — no file of the dashboard imports fetchText
2026-10-10T21:12:00.7664660Z ok 732 - the shells read only through what the git host provides — no file of the dashboard imports fetchText
2026-10-10T21:12:00.7665903Z   ---
2026-10-10T21:12:00.7666433Z   duration_ms: 5.546178
2026-10-10T21:12:00.7666828Z   type: 'test'
2026-10-10T21:12:00.7667054Z   ...
2026-10-10T21:12:00.7667859Z # Subtest: the shells read only through what the git host provides — no file of the dashboard imports a read MOD-git-host keeps to itself
2026-10-10T21:12:00.7668981Z ok 733 - the shells read only through what the git host provides — no file of the dashboard imports a read MOD-git-host keeps to itself
2026-10-10T21:12:00.7669538Z   ---
2026-10-10T21:12:00.7669733Z   duration_ms: 5.396476
2026-10-10T21:12:00.7669959Z   type: 'test'
2026-10-10T21:12:00.7670156Z   ...
2026-10-10T21:12:00.7670882Z # Subtest: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the GitLab check reports reach, branch and role as before, in one request
2026-10-10T21:12:00.7671924Z ok 734 - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the GitLab check reports reach, branch and role as before, in one request
2026-10-10T21:12:00.7672454Z   ---
2026-10-10T21:12:00.7672638Z   duration_ms: 2.761452
2026-10-10T21:12:00.7672851Z   type: 'test'
2026-10-10T21:12:00.7673044Z   ...
2026-10-10T21:12:00.7673902Z # Subtest: UC-001 — a server whose answer reports neither a visibility nor a default branch did not answer as a GitLab server
2026-10-10T21:12:00.7675217Z ok 735 - UC-001 — a server whose answer reports neither a visibility nor a default branch did not answer as a GitLab server
2026-10-10T21:12:00.7675757Z   ---
2026-10-10T21:12:00.7675948Z   duration_ms: 3.030839
2026-10-10T21:12:00.7676165Z   type: 'test'
2026-10-10T21:12:00.7676549Z   ...
2026-10-10T21:12:00.7678026Z # Subtest: THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Pull requests, Actions, Workflows write, Metadata read
2026-10-10T21:12:00.7679417Z ok 736 - THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Pull requests, Actions, Workflows write, Metadata read
2026-10-10T21:12:00.7680053Z   ---
2026-10-10T21:12:00.7680258Z   duration_ms: 0.723641
2026-10-10T21:12:00.7680485Z   type: 'test'
2026-10-10T21:12:00.7680674Z   ...
2026-10-10T21:12:00.7681294Z # Subtest: THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first
2026-10-10T21:12:00.7682167Z ok 737 - THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first
2026-10-10T21:12:00.7682629Z   ---
2026-10-10T21:12:00.7682819Z   duration_ms: 0.421172
2026-10-10T21:12:00.7683041Z   type: 'test'
2026-10-10T21:12:00.7683229Z   ...
2026-10-10T21:12:00.7683888Z # Subtest: ONE GITHUB TOKEN SERVES EVERY FEATURE — the link, the steps and the guidance are written from requiredPermissions
2026-10-10T21:12:00.7685060Z ok 738 - ONE GITHUB TOKEN SERVES EVERY FEATURE — the link, the steps and the guidance are written from requiredPermissions
2026-10-10T21:12:00.7685585Z   ---
2026-10-10T21:12:00.7685774Z   duration_ms: 0.442772
2026-10-10T21:12:00.7686000Z   type: 'test'
2026-10-10T21:12:00.7686191Z   ...
2026-10-10T21:12:00.7686583Z # Subtest: UC-014: the setup step explains every permission and why it is needed
2026-10-10T21:12:00.7687179Z ok 739 - UC-014: the setup step explains every permission and why it is needed
2026-10-10T21:12:00.7687682Z   ---
2026-10-10T21:12:00.7688042Z   duration_ms: 0.830952
2026-10-10T21:12:00.7688334Z   type: 'test'
2026-10-10T21:12:00.7688527Z   ...
2026-10-10T21:12:00.7689421Z # Subtest: EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered
2026-10-10T21:12:00.7690179Z ok 740 - EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered
2026-10-10T21:12:00.7690578Z   ---
2026-10-10T21:12:00.7690973Z   duration_ms: 0.272903
2026-10-10T21:12:00.7691206Z   type: 'test'
2026-10-10T21:12:00.7691397Z   ...
2026-10-10T21:12:00.7691962Z # Subtest: every site module parses — the app itself is only run in a browser, so check its syntax here
2026-10-10T21:12:00.7692779Z ok 741 - every site module parses — the app itself is only run in a browser, so check its syntax here
2026-10-10T21:12:00.7693218Z   ---
2026-10-10T21:12:00.7693406Z   duration_ms: 387.098221
2026-10-10T21:12:00.7693646Z   type: 'test'
2026-10-10T21:12:00.7693837Z   ...
2026-10-10T21:12:00.7694106Z # Subtest: UC-014: setup names only the instance
2026-10-10T21:12:00.7694474Z ok 742 - UC-014: setup names only the instance
2026-10-10T21:12:00.7694748Z   ---
2026-10-10T21:12:00.7695128Z   duration_ms: 0.408669
2026-10-10T21:12:00.7695351Z   type: 'test'
2026-10-10T21:12:00.7695537Z   ...
2026-10-10T21:12:00.7696046Z # Subtest: the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed
2026-10-10T21:12:00.7696838Z ok 743 - the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed
2026-10-10T21:12:00.7697290Z   ---
2026-10-10T21:12:00.7697476Z   duration_ms: 0.17544
2026-10-10T21:12:00.7697695Z   type: 'test'
2026-10-10T21:12:00.7697881Z   ...
2026-10-10T21:12:00.7698509Z # Subtest: A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — Agent M · owner/repository, within GitHub's 40 characters
2026-10-10T21:12:00.7700348Z ok 744 - A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — Agent M · owner/repository, within GitHub's 40 characters
2026-10-10T21:12:00.7701215Z   ---
2026-10-10T21:12:00.7701421Z   duration_ms: 0.420661
2026-10-10T21:12:00.7701658Z   type: 'test'
2026-10-10T21:12:00.7701852Z   ...
2026-10-10T21:12:00.7702625Z # Subtest: A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — the description names the product repository, within GitHub's 1024 characters
2026-10-10T21:12:00.7703723Z ok 745 - A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT — the description names the product repository, within GitHub's 1024 characters
2026-10-10T21:12:00.7704284Z   ---
2026-10-10T21:12:00.7704478Z   duration_ms: 0.192111
2026-10-10T21:12:00.7704694Z   type: 'test'
2026-10-10T21:12:00.7705092Z   ...
2026-10-10T21:12:00.7705629Z # Subtest: the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere
2026-10-10T21:12:00.7706381Z ok 746 - the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere
2026-10-10T21:12:00.7706812Z   ---
2026-10-10T21:12:00.7707008Z   duration_ms: 6.201891
2026-10-10T21:12:00.7707225Z   type: 'test'
2026-10-10T21:12:00.7707415Z   ...
2026-10-10T21:12:00.7708007Z # Subtest: status 'approved' is described truly for both routes — the dashboard's own commit and the workflow
2026-10-10T21:12:00.7708888Z ok 747 - status 'approved' is described truly for both routes — the dashboard's own commit and the workflow
2026-10-10T21:12:00.7709353Z   ---
2026-10-10T21:12:00.7709542Z   duration_ms: 2.224763
2026-10-10T21:12:00.7709767Z   type: 'test'
2026-10-10T21:12:00.7709953Z   ...
2026-10-10T21:12:00.7710429Z # Subtest: the dashboard shows the last accepted text above a changed use case, with the core's diff
2026-10-10T21:12:00.7711654Z ok 748 - the dashboard shows the last accepted text above a changed use case, with the core's diff
2026-10-10T21:12:00.7712286Z   ---
2026-10-10T21:12:00.7712492Z   duration_ms: 1.362302
2026-10-10T21:12:00.7712712Z   type: 'test'
2026-10-10T21:12:00.7712901Z   ...
2026-10-10T21:12:00.7713651Z # Subtest: A USED-UP RATE LIMIT IS NAMED — the load error names the account's limit and when it resets, and nothing about the token
2026-10-10T21:12:00.7714686Z ok 749 - A USED-UP RATE LIMIT IS NAMED — the load error names the account's limit and when it resets, and nothing about the token
2026-10-10T21:12:00.7715435Z   ---
2026-10-10T21:12:00.7715628Z   duration_ms: 1.716588
2026-10-10T21:12:00.7715848Z   type: 'test'
2026-10-10T21:12:00.7716040Z   ...
2026-10-10T21:12:00.7716575Z # Subtest: A USED-UP RATE LIMIT IS NAMED — without a token, the network's limit and when it resets
2026-10-10T21:12:00.7717530Z ok 750 - A USED-UP RATE LIMIT IS NAMED — without a token, the network's limit and when it resets
2026-10-10T21:12:00.7717957Z   ---
2026-10-10T21:12:00.7718146Z   duration_ms: 0.446159
2026-10-10T21:12:00.7718362Z   type: 'test'
2026-10-10T21:12:00.7718557Z   ...
2026-10-10T21:12:00.7719296Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a refused write names the limit; counter-proof: a 403 without the headers is a missing permission
2026-10-10T21:12:00.7720409Z ok 751 - A USED-UP RATE LIMIT IS NAMED — a refused write names the limit; counter-proof: a 403 without the headers is a missing permission
2026-10-10T21:12:00.7720966Z   ---
2026-10-10T21:12:00.7721154Z   duration_ms: 0.895885
2026-10-10T21:12:00.7721367Z   type: 'test'
2026-10-10T21:12:00.7721556Z   ...
2026-10-10T21:12:00.7722469Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a GitLab product's limit is named by its server, without a time
2026-10-10T21:12:00.7723644Z ok 752 - A USED-UP RATE LIMIT IS NAMED — a GitLab product's limit is named by its server, without a time
2026-10-10T21:12:00.7724110Z   ---
2026-10-10T21:12:00.7724309Z   duration_ms: 0.323799
2026-10-10T21:12:00.7724532Z   type: 'test'
2026-10-10T21:12:00.7724725Z   ...
2026-10-10T21:12:00.7725562Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — the load error still names a refused token and links its renewal
2026-10-10T21:12:00.7726559Z ok 753 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — the load error still names a refused token and links its renewal
2026-10-10T21:12:00.7727252Z   ---
2026-10-10T21:12:00.7727441Z   duration_ms: 0.40946
2026-10-10T21:12:00.7727660Z   type: 'test'
2026-10-10T21:12:00.7727852Z   ...
2026-10-10T21:12:00.7728310Z # Subtest: the dashboard is opened on a GitLab product by its address; its files link to GitLab
2026-10-10T21:12:00.7729013Z ok 754 - the dashboard is opened on a GitLab product by its address; its files link to GitLab
2026-10-10T21:12:00.7729429Z   ---
2026-10-10T21:12:00.7729614Z   duration_ms: 0.4094
2026-10-10T21:12:00.7729834Z   type: 'test'
2026-10-10T21:12:00.7730020Z   ...
2026-10-10T21:12:00.7730613Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line
2026-10-10T21:12:00.7731483Z ok 755 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line
2026-10-10T21:12:00.7731941Z   ---
2026-10-10T21:12:00.7732130Z   duration_ms: 20.692768
2026-10-10T21:12:00.7732358Z   type: 'test'
2026-10-10T21:12:00.7732542Z   ...
2026-10-10T21:12:00.7733488Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared
2026-10-10T21:12:00.7735021Z ok 756 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared
2026-10-10T21:12:00.7735551Z   ---
2026-10-10T21:12:00.7735745Z   duration_ms: 3.890916
2026-10-10T21:12:00.7735965Z   type: 'test'
2026-10-10T21:12:00.7736164Z   ...
2026-10-10T21:12:00.7736786Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier
2026-10-10T21:12:00.7737701Z ok 757 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier
2026-10-10T21:12:00.7738181Z   ---
2026-10-10T21:12:00.7738370Z   duration_ms: 2.306787
2026-10-10T21:12:00.7738586Z   type: 'test'
2026-10-10T21:12:00.7738771Z   ...
2026-10-10T21:12:00.7739357Z # Subtest: the accepted text is the exact text its record names — a blob that does not hash to it is refused
2026-10-10T21:12:00.7740214Z ok 758 - the accepted text is the exact text its record names — a blob that does not hash to it is refused
2026-10-10T21:12:00.7740664Z   ---
2026-10-10T21:12:00.7740852Z   duration_ms: 5.572798
2026-10-10T21:12:00.7741068Z   type: 'test'
2026-10-10T21:12:00.7741253Z   ...
2026-10-10T21:12:00.7741929Z # Subtest: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only
2026-10-10T21:12:00.7743120Z ok 759 - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only
2026-10-10T21:12:00.7743632Z   ---
2026-10-10T21:12:00.7743818Z   duration_ms: 2.537461
2026-10-10T21:12:00.7752614Z   type: 'test'
2026-10-10T21:12:00.7752878Z   ...
2026-10-10T21:12:00.7753282Z # Subtest: readBlob keeps the accepted text of a record by its blob SHA
2026-10-10T21:12:00.7753856Z ok 760 - readBlob keeps the accepted text of a record by its blob SHA
2026-10-10T21:12:00.7754214Z   ---
2026-10-10T21:12:00.7754415Z   duration_ms: 1.330322
2026-10-10T21:12:00.7754639Z   type: 'test'
2026-10-10T21:12:00.7754987Z   ...
2026-10-10T21:12:00.7756130Z # Subtest: UC-001: no click, nothing at all — Add product without a click's authority writes nothing and stores nothing
2026-10-10T21:12:00.7757395Z ok 761 - UC-001: no click, nothing at all — Add product without a click's authority writes nothing and stores nothing
2026-10-10T21:12:00.7757901Z   ---
2026-10-10T21:12:00.7758098Z   duration_ms: 0.792911
2026-10-10T21:12:00.7758318Z   type: 'test'
2026-10-10T21:12:00.7758521Z   ...
2026-10-10T21:12:00.7759282Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes hands the authority to the write path; without one, none writes
2026-10-10T21:12:00.7760427Z ok 762 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes hands the authority to the write path; without one, none writes
2026-10-10T21:12:00.7761190Z   ---
2026-10-10T21:12:00.7761376Z   duration_ms: 9.932679
2026-10-10T21:12:00.7761600Z   type: 'test'
2026-10-10T21:12:00.7761788Z   ...
2026-10-10T21:12:00.7762389Z # Subtest: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row
2026-10-10T21:12:00.7763251Z ok 763 - AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row
2026-10-10T21:12:00.7763703Z   ---
2026-10-10T21:12:00.7763904Z   duration_ms: 2.660142
2026-10-10T21:12:00.7764133Z   type: 'test'
2026-10-10T21:12:00.7764320Z   ...
2026-10-10T21:12:00.7765092Z # Subtest: A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on
2026-10-10T21:12:00.7765990Z ok 764 - A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on
2026-10-10T21:12:00.7766562Z   ---
2026-10-10T21:12:00.7766922Z   duration_ms: 2.243919
2026-10-10T21:12:00.7767373Z   type: 'test'
2026-10-10T21:12:00.7767657Z   ...
2026-10-10T21:12:00.7768292Z # Subtest: SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened
2026-10-10T21:12:00.7769154Z ok 765 - SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened
2026-10-10T21:12:00.7769606Z   ---
2026-10-10T21:12:00.7769801Z   duration_ms: 3.501704
2026-10-10T21:12:00.7770028Z   type: 'test'
2026-10-10T21:12:00.7770216Z   ...
2026-10-10T21:12:00.7770841Z # Subtest: A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order
2026-10-10T21:12:00.7771738Z ok 766 - A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order
2026-10-10T21:12:00.7772205Z   ---
2026-10-10T21:12:00.7772403Z   duration_ms: 2.453984
2026-10-10T21:12:00.7772616Z   type: 'test'
2026-10-10T21:12:00.7772811Z   ...
2026-10-10T21:12:00.7773491Z # Subtest: A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named
2026-10-10T21:12:00.7774512Z ok 767 - A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named
2026-10-10T21:12:00.7775370Z   ---
2026-10-10T21:12:00.7775788Z   duration_ms: 1.899071
2026-10-10T21:12:00.7776261Z   type: 'test'
2026-10-10T21:12:00.7776691Z   ...
2026-10-10T21:12:00.7778173Z # Subtest: A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice
2026-10-10T21:12:00.7780803Z ok 768 - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice
2026-10-10T21:12:00.7781973Z   ---
2026-10-10T21:12:00.7782395Z   duration_ms: 2.273024
2026-10-10T21:12:00.7782861Z   type: 'test'
2026-10-10T21:12:00.7783280Z   ...
2026-10-10T21:12:00.7784216Z # Subtest: collaborators are saved by one commit of docs/collaborators.md, on a click
2026-10-10T21:12:00.7785831Z ok 769 - collaborators are saved by one commit of docs/collaborators.md, on a click
2026-10-10T21:12:00.7786542Z   ---
2026-10-10T21:12:00.7786879Z   duration_ms: 1.747426
2026-10-10T21:12:00.7787241Z   type: 'test'
2026-10-10T21:12:00.7787550Z   ...
2026-10-10T21:12:00.7788942Z # Subtest: GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head
2026-10-10T21:12:00.7791062Z ok 770 - GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head
2026-10-10T21:12:00.7792130Z   ---
2026-10-10T21:12:00.7792386Z   duration_ms: 6.991777
2026-10-10T21:12:00.7792612Z   type: 'test'
2026-10-10T21:12:00.7792809Z   ...
2026-10-10T21:12:00.7793418Z # Subtest: GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit
2026-10-10T21:12:00.7794511Z ok 771 - GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit
2026-10-10T21:12:00.7795432Z   ---
2026-10-10T21:12:00.7795635Z   duration_ms: 4.478852
2026-10-10T21:12:00.7795859Z   type: 'test'
2026-10-10T21:12:00.7796057Z   ...
2026-10-10T21:12:00.7796635Z # Subtest: GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed
2026-10-10T21:12:00.7797519Z ok 772 - GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed
2026-10-10T21:12:00.7798022Z   ---
2026-10-10T21:12:00.7798212Z   duration_ms: 4.969554
2026-10-10T21:12:00.7798428Z   type: 'test'
2026-10-10T21:12:00.7798613Z   ...
2026-10-10T21:12:00.7799337Z # Subtest: ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub
2026-10-10T21:12:00.7800950Z ok 773 - ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub
2026-10-10T21:12:00.7801472Z   ---
2026-10-10T21:12:00.7801664Z   duration_ms: 8.281863
2026-10-10T21:12:00.7801889Z   type: 'test'
2026-10-10T21:12:00.7802075Z   ...
2026-10-10T21:12:00.7802778Z # Subtest: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each
2026-10-10T21:12:00.7803807Z ok 774 - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each
2026-10-10T21:12:00.7804330Z   ---
2026-10-10T21:12:00.7804523Z   duration_ms: 8.523096
2026-10-10T21:12:00.7804738Z   type: 'test'
2026-10-10T21:12:00.7805093Z   ...
2026-10-10T21:12:00.7805974Z # Subtest: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out
2026-10-10T21:12:00.7807327Z ok 775 - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out
2026-10-10T21:12:00.7807978Z   ---
2026-10-10T21:12:00.7808173Z   duration_ms: 5.23853
2026-10-10T21:12:00.7808386Z   type: 'test'
2026-10-10T21:12:00.7808569Z   ...
2026-10-10T21:12:00.7809112Z # Subtest: AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named
2026-10-10T21:12:00.7809914Z ok 776 - AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named
2026-10-10T21:12:00.7810344Z   ---
2026-10-10T21:12:00.7810539Z   duration_ms: 6.996425
2026-10-10T21:12:00.7810984Z   type: 'test'
2026-10-10T21:12:00.7811495Z   ...
2026-10-10T21:12:00.7812253Z # Subtest: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out
2026-10-10T21:12:00.7813333Z ok 777 - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out
2026-10-10T21:12:00.7813883Z   ---
2026-10-10T21:12:00.7814079Z   duration_ms: 2.556968
2026-10-10T21:12:00.7814303Z   type: 'test'
2026-10-10T21:12:00.7814509Z   ...
2026-10-10T21:12:00.7815354Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token
2026-10-10T21:12:00.7816364Z ok 778 - GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token
2026-10-10T21:12:00.7816893Z   ---
2026-10-10T21:12:00.7817089Z   duration_ms: 2.323379
2026-10-10T21:12:00.7817336Z   type: 'test'
2026-10-10T21:12:00.7817529Z   ...
2026-10-10T21:12:00.7818184Z # Subtest: AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD
2026-10-10T21:12:00.7819083Z ok 779 - AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD
2026-10-10T21:12:00.7819548Z   ---
2026-10-10T21:12:00.7819734Z   duration_ms: 2.986115
2026-10-10T21:12:00.7819950Z   type: 'test'
2026-10-10T21:12:00.7820142Z   ...
2026-10-10T21:12:00.7820890Z # Subtest: SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other
2026-10-10T21:12:00.7822547Z ok 780 - SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other
2026-10-10T21:12:00.7823141Z   ---
2026-10-10T21:12:00.7823334Z   duration_ms: 13.745214
2026-10-10T21:12:00.7823556Z   type: 'test'
2026-10-10T21:12:00.7823750Z   ...
2026-10-10T21:12:00.7824331Z # Subtest: counter-proof: a file changed after the review page was built is left out and named; the others are still written
2026-10-10T21:12:00.7825403Z ok 781 - counter-proof: a file changed after the review page was built is left out and named; the others are still written
2026-10-10T21:12:00.7825913Z   ---
2026-10-10T21:12:00.7826099Z   duration_ms: 6.534606
2026-10-10T21:12:00.7826319Z   type: 'test'
2026-10-10T21:12:00.7826507Z   ...
2026-10-10T21:12:00.7827493Z # Subtest: A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until the engine's acceptance commit names its text, and an edit committed afterwards is not accepted
2026-10-10T21:12:00.7828981Z ok 782 - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until the engine's acceptance commit names its text, and an edit committed afterwards is not accepted
2026-10-10T21:12:00.7829685Z   ---
2026-10-10T21:12:00.7829874Z   duration_ms: 7.831896
2026-10-10T21:12:00.7830086Z   type: 'test'
2026-10-10T21:12:00.7830273Z   ...
2026-10-10T21:12:00.7831047Z # Subtest: A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file
2026-10-10T21:12:00.7832242Z ok 783 - A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file
2026-10-10T21:12:00.7833013Z   ---
2026-10-10T21:12:00.7833352Z   duration_ms: 3.709485
2026-10-10T21:12:00.7833577Z   type: 'test'
2026-10-10T21:12:00.7833762Z   ...
2026-10-10T21:12:00.7834584Z # Subtest: A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes an approval record for a reviewed file only, never for a job, gate or approval record
2026-10-10T21:12:00.7836053Z ok 784 - A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes an approval record for a reviewed file only, never for a job, gate or approval record
2026-10-10T21:12:00.7836677Z   ---
2026-10-10T21:12:00.7836871Z   duration_ms: 0.87235
2026-10-10T21:12:00.7837093Z   type: 'test'
2026-10-10T21:12:00.7837284Z   ...
2026-10-10T21:12:00.7838247Z # Subtest: A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is
2026-10-10T21:12:00.7840528Z not ok 785 - A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is # TODO FINDING G1 — the approval engine derives the status open for a job record (deriveReviewedStatus, statusByNames) and its review page counts it; MOD-review-core's deriveStatus has no value for a file that is no proposal
2026-10-10T21:12:00.7841883Z   ---
2026-10-10T21:12:00.7842074Z   duration_ms: 2.146015
2026-10-10T21:12:00.7842294Z   type: 'test'
2026-10-10T21:12:00.7842703Z   location: '/home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:165:1'
2026-10-10T21:12:00.7843185Z   failureType: 'testCodeFailure'
2026-10-10T21:12:00.7843493Z   error: 'the job record is no proposal'
2026-10-10T21:12:00.7843894Z   code: 'ERR_ASSERTION'
2026-10-10T21:12:00.7844340Z   name: 'AssertionError'
2026-10-10T21:12:00.7844603Z   expected: 'open'
2026-10-10T21:12:00.7844809Z   actual: 'open'
2026-10-10T21:12:00.7845177Z   operator: 'notStrictEqual'
2026-10-10T21:12:00.7845410Z   stack: |-
2026-10-10T21:12:00.7845912Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:172:12)
2026-10-10T21:12:00.7846507Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:12:00.7846999Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:12:00.7847552Z   ...
2026-10-10T21:12:00.7848195Z # Subtest: A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job record writes no approval record
2026-10-10T21:12:00.7850651Z not ok 786 - A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job record writes no approval record # TODO FINDING G2 — planAcceptance writes an approval record (kind: use-case, file: docs/jobs/JOB-….md) for a job record handed to it as a use case; the kind is taken from the item, not from the path
2026-10-10T21:12:00.7851825Z   ---
2026-10-10T21:12:00.7852023Z   duration_ms: 4.0044
2026-10-10T21:12:00.7852248Z   type: 'test'
2026-10-10T21:12:00.7852658Z   location: '/home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:183:1'
2026-10-10T21:12:00.7853121Z   failureType: 'testCodeFailure'
2026-10-10T21:12:00.7853369Z   error: |-
2026-10-10T21:12:00.7853604Z     no approval record for a job record
2026-10-10T21:12:00.7853886Z     + actual - expected
2026-10-10T21:12:00.7854101Z     
2026-10-10T21:12:00.7854273Z     + [
2026-10-10T21:12:00.7854447Z     +   {
2026-10-10T21:12:00.7854666Z     +     content: 'kind: use-case\n' +
2026-10-10T21:12:00.7855452Z     +       'file: docs/jobs/JOB-20261001-0900-a1b2.md\n' +
2026-10-10T21:12:00.7855891Z     +       'blob: c97d9f2bf14c6a324a75c78cdf8ff186aa3ba93a\n',
2026-10-10T21:12:00.7856340Z     +     path: 'docs/approvals/JOB-20261001-0900-a1b2-c97d9f2bf14c.md'
2026-10-10T21:12:00.7856682Z     +   }
2026-10-10T21:12:00.7856872Z     + ]
2026-10-10T21:12:00.7857051Z     - []
2026-10-10T21:12:00.7857226Z     
2026-10-10T21:12:00.7857414Z   code: 'ERR_ASSERTION'
2026-10-10T21:12:00.7857649Z   name: 'AssertionError'
2026-10-10T21:12:00.7857885Z   expected:
2026-10-10T21:12:00.7858070Z   actual:
2026-10-10T21:12:00.7858244Z     0:
2026-10-10T21:12:00.7858556Z       path: 'docs/approvals/JOB-20261001-0900-a1b2-c97d9f2bf14c.md'
2026-10-10T21:12:00.7858900Z       content: |-
2026-10-10T21:12:00.7859135Z         kind: use-case
2026-10-10T21:12:00.7859413Z         file: docs/jobs/JOB-20261001-0900-a1b2.md
2026-10-10T21:12:00.7859762Z         blob: c97d9f2bf14c6a324a75c78cdf8ff186aa3ba93a
2026-10-10T21:12:00.7860055Z         
2026-10-10T21:12:00.7860260Z   operator: 'deepStrictEqual'
2026-10-10T21:12:00.7860504Z   stack: |-
2026-10-10T21:12:00.7860999Z     TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/review-core.d/gates.test.mjs:189:12)
2026-10-10T21:12:00.7861598Z     async Test.run (node:internal/test_runner/test:1054:7)
2026-10-10T21:12:00.7862305Z     async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
2026-10-10T21:12:00.7862689Z   ...
2026-10-10T21:12:00.7863312Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — list and get give the same data on GitHub and on a GitLab server
2026-10-10T21:12:00.7864185Z ok 787 - GITLAB PRODUCTS ARE SUPPORTED — list and get give the same data on GitHub and on a GitLab server
2026-10-10T21:12:00.7865011Z   ---
2026-10-10T21:12:00.7865499Z   duration_ms: 9.290608
2026-10-10T21:12:00.7865980Z   type: 'test'
2026-10-10T21:12:00.7866392Z   ...
2026-10-10T21:12:00.7867753Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — counter-proof: a field the answer lacks is null, never invented
2026-10-10T21:12:00.7869817Z ok 788 - GITLAB PRODUCTS ARE SUPPORTED — counter-proof: a field the answer lacks is null, never invented
2026-10-10T21:12:00.7870843Z   ---
2026-10-10T21:12:00.7871264Z   duration_ms: 1.831834
2026-10-10T21:12:00.7871898Z   type: 'test'
2026-10-10T21:12:00.7872426Z   ...
2026-10-10T21:12:00.7874177Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only at api.github.com, the GitLab token only at its project's API
2026-10-10T21:12:00.7876119Z ok 789 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only at api.github.com, the GitLab token only at its project's API
2026-10-10T21:12:00.7876699Z   ---
2026-10-10T21:12:00.7876894Z   duration_ms: 2.773985
2026-10-10T21:12:00.7877120Z   type: 'test'
2026-10-10T21:12:00.7877489Z   ...
2026-10-10T21:12:00.7878176Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — counter-proof: a product on another GitLab server gets neither token
2026-10-10T21:12:00.7879199Z ok 790 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — counter-proof: a product on another GitLab server gets neither token
2026-10-10T21:12:00.7879726Z   ---
2026-10-10T21:12:00.7879916Z   duration_ms: 0.775568
2026-10-10T21:12:00.7880138Z   type: 'test'
2026-10-10T21:12:00.7880329Z   ...
2026-10-10T21:12:00.7880924Z # Subtest: UC-032 — list reads pages of 100, newest first, and stops at the page that reaches back past since
2026-10-10T21:12:00.7881783Z ok 791 - UC-032 — list reads pages of 100, newest first, and stops at the page that reaches back past since
2026-10-10T21:12:00.7882239Z   ---
2026-10-10T21:12:00.7882434Z   duration_ms: 19.060883
2026-10-10T21:12:00.7882660Z   type: 'test'
2026-10-10T21:12:00.7882852Z   ...
2026-10-10T21:12:00.7883454Z # Subtest: UC-032 — the state filter: open, merged, closed, all — merged told from closed on GitHub by merged_at
2026-10-10T21:12:00.7884356Z ok 792 - UC-032 — the state filter: open, merged, closed, all — merged told from closed on GitHub by merged_at
2026-10-10T21:12:00.7885008Z   ---
2026-10-10T21:12:00.7885209Z   duration_ms: 16.042053
2026-10-10T21:12:00.7885434Z   type: 'test'
2026-10-10T21:12:00.7885620Z   ...
2026-10-10T21:12:00.7886272Z # Subtest: UC-032 — get(n) costs one request on GitLab and two on GitHub, the second for the workflow runs of the head commit
2026-10-10T21:12:00.7887245Z ok 793 - UC-032 — get(n) costs one request on GitLab and two on GitHub, the second for the workflow runs of the head commit
2026-10-10T21:12:00.7887740Z   ---
2026-10-10T21:12:00.7887924Z   duration_ms: 0.872661
2026-10-10T21:12:00.7888139Z   type: 'test'
2026-10-10T21:12:00.7888322Z   ...
2026-10-10T21:12:00.7888935Z # Subtest: UC-032 — the CI state of the head: running, passed, failed, cancelled, or null where the server names none
2026-10-10T21:12:00.7889855Z ok 794 - UC-032 — the CI state of the head: running, passed, failed, cancelled, or null where the server names none
2026-10-10T21:12:00.7890331Z   ---
2026-10-10T21:12:00.7890517Z   duration_ms: 4.900043
2026-10-10T21:12:00.7890732Z   type: 'test'
2026-10-10T21:12:00.7890917Z   ...
2026-10-10T21:12:00.7891305Z # Subtest: a filter or a number that is not one is refused before anything is sent
2026-10-10T21:12:00.7891905Z ok 795 - a filter or a number that is not one is refused before anything is sent
2026-10-10T21:12:00.7892413Z   ---
2026-10-10T21:12:00.7892606Z   duration_ms: 0.593767
2026-10-10T21:12:00.7892829Z   type: 'test'
2026-10-10T21:12:00.7893023Z   ...
2026-10-10T21:12:00.7893561Z # Subtest: a read needs no token: a public repository's pull requests are read without one, and no header is sent
2026-10-10T21:12:00.7894399Z ok 796 - a read needs no token: a public repository's pull requests are read without one, and no header is sent
2026-10-10T21:12:00.7895030Z   ---
2026-10-10T21:12:00.7895230Z   duration_ms: 0.852883
2026-10-10T21:12:00.7895451Z   type: 'test'
2026-10-10T21:12:00.7895641Z   ...
2026-10-10T21:12:00.7896553Z # Subtest: ONE GITHUB TOKEN SERVES EVERY FEATURE — requiredPermissions on GitHub: Contents, Issues, Pull requests, Actions, Workflows write, Metadata read, each with why
2026-10-10T21:12:00.7897933Z ok 797 - ONE GITHUB TOKEN SERVES EVERY FEATURE — requiredPermissions on GitHub: Contents, Issues, Pull requests, Actions, Workflows write, Metadata read, each with why
2026-10-10T21:12:00.7898612Z   ---
2026-10-10T21:12:00.7898796Z   duration_ms: 0.38825
2026-10-10T21:12:00.7899012Z   type: 'test'
2026-10-10T21:12:00.7899211Z   ...
2026-10-10T21:12:00.7900302Z # Subtest: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — requiredPermissions on a GitLab server: role Maintainer, scope api
2026-10-10T21:12:00.7901390Z ok 798 - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — requiredPermissions on a GitLab server: role Maintainer, scope api
2026-10-10T21:12:00.7901927Z   ---
2026-10-10T21:12:00.7902294Z   duration_ms: 0.197031
2026-10-10T21:12:00.7902515Z   type: 'test'
2026-10-10T21:12:00.7902719Z   ...
2026-10-10T21:12:00.7903033Z # Subtest: NO TEXT TRAVELS IN A URL: long values are refused
2026-10-10T21:12:00.7903480Z ok 799 - NO TEXT TRAVELS IN A URL: long values are refused
2026-10-10T21:12:00.7903784Z   ---
2026-10-10T21:12:00.7903973Z   duration_ms: 0.34543
2026-10-10T21:12:00.7904189Z   type: 'test'
2026-10-10T21:12:00.7904383Z   ...
2026-10-10T21:12:00.7905150Z # Subtest: fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)
2026-10-10T21:12:00.7906123Z ok 800 - fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)
2026-10-10T21:12:00.7906652Z   ---
2026-10-10T21:12:00.7906835Z   duration_ms: 0.887359
2026-10-10T21:12:00.7907128Z   type: 'test'
2026-10-10T21:12:00.7907547Z   ...
2026-10-10T21:12:00.7908394Z # Subtest: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the write path refuses a write without an authority: no request at all
2026-10-10T21:12:00.7909717Z ok 801 - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the write path refuses a write without an authority: no request at all
2026-10-10T21:12:00.7910253Z   ---
2026-10-10T21:12:00.7910439Z   duration_ms: 0.424609
2026-10-10T21:12:00.7910860Z   type: 'test'
2026-10-10T21:12:00.7911211Z   ...
2026-10-10T21:12:00.7911804Z # Subtest: the authority is one value of one shape — { kind } of three kinds; anything else is refused
2026-10-10T21:12:00.7912617Z ok 802 - the authority is one value of one shape — { kind } of three kinds; anything else is refused
2026-10-10T21:12:00.7913048Z   ---
2026-10-10T21:12:00.7913235Z   duration_ms: 0.464203
2026-10-10T21:12:00.7913459Z   type: 'test'
2026-10-10T21:12:00.7913646Z   ...
2026-10-10T21:12:00.7914316Z # Subtest: each kind of authority writes one commit with the token it is given — the form the CI entry and the bridge app use
2026-10-10T21:12:00.7915469Z ok 803 - each kind of authority writes one commit with the token it is given — the form the CI entry and the bridge app use
2026-10-10T21:12:00.7915983Z   ---
2026-10-10T21:12:00.7916171Z   duration_ms: 2.649482
2026-10-10T21:12:00.7916395Z   type: 'test'
2026-10-10T21:12:00.7916589Z   ...
2026-10-10T21:12:00.7917163Z # Subtest: the request helper writes only on an authority and builds the header itself — a read needs none
2026-10-10T21:12:00.7918005Z ok 804 - the request helper writes only on an authority and builds the header itself — a read needs none
2026-10-10T21:12:00.7918634Z   ---
2026-10-10T21:12:00.7918824Z   duration_ms: 0.796908
2026-10-10T21:12:00.7919060Z   type: 'test'
2026-10-10T21:12:00.7919249Z   ...
2026-10-10T21:12:00.7919581Z # Subtest: one commit, fast-forward only, token only to the API
2026-10-10T21:12:00.7920055Z ok 805 - one commit, fast-forward only, token only to the API
2026-10-10T21:12:00.7920372Z   ---
2026-10-10T21:12:00.7920563Z   duration_ms: 1.10088
2026-10-10T21:12:00.7920827Z   type: 'test'
2026-10-10T21:12:00.7921018Z   ...
2026-10-10T21:12:00.7921375Z # Subtest: an edit is refused when the file changed since it was loaded
2026-10-10T21:12:00.7922187Z ok 806 - an edit is refused when the file changed since it was loaded
2026-10-10T21:12:00.7922744Z   ---
2026-10-10T21:12:00.7923053Z   duration_ms: 0.688083
2026-10-10T21:12:00.7923445Z   type: 'test'
2026-10-10T21:12:00.7923762Z   ...
2026-10-10T21:12:00.7924603Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser
2026-10-10T21:12:00.7926166Z ok 807 - A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser
2026-10-10T21:12:00.7926841Z   ---
2026-10-10T21:12:00.7927177Z   duration_ms: 0.32423
2026-10-10T21:12:00.7927557Z   type: 'test'
2026-10-10T21:12:00.7927885Z   ...
2026-10-10T21:12:00.7929076Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link
2026-10-10T21:12:00.7930912Z ok 808 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link
2026-10-10T21:12:00.7932090Z   ---
2026-10-10T21:12:00.7932439Z   duration_ms: 0.377881
2026-10-10T21:12:00.7932840Z   type: 'test'
2026-10-10T21:12:00.7933173Z   ...
2026-10-10T21:12:00.7934377Z # Subtest: A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address
2026-10-10T21:12:00.7936485Z ok 809 - A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address
2026-10-10T21:12:00.7937414Z   ---
2026-10-10T21:12:00.7937786Z   duration_ms: 0.343075
2026-10-10T21:12:00.7938199Z   type: 'test'
2026-10-10T21:12:00.7938545Z   ...
2026-10-10T21:12:00.7939795Z # Subtest: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else
2026-10-10T21:12:00.7941650Z ok 810 - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else
2026-10-10T21:12:00.7942621Z   ---
2026-10-10T21:12:00.7942988Z   duration_ms: 1.707801
2026-10-10T21:12:00.7943389Z   type: 'test'
2026-10-10T21:12:00.7943737Z   ...
2026-10-10T21:12:00.7945177Z # Subtest: GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit
2026-10-10T21:12:00.7946234Z ok 811 - GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit
2026-10-10T21:12:00.7946742Z   ---
2026-10-10T21:12:00.7946966Z   duration_ms: 22.955541
2026-10-10T21:12:00.7947197Z   type: 'test'
2026-10-10T21:12:00.7947387Z   ...
2026-10-10T21:12:00.7948037Z # Subtest: GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present
2026-10-10T21:12:00.7949001Z ok 812 - GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present
2026-10-10T21:12:00.7949507Z   ---
2026-10-10T21:12:00.7949734Z   duration_ms: 3.996735
2026-10-10T21:12:00.7949962Z   type: 'test'
2026-10-10T21:12:00.7950150Z   ...
2026-10-10T21:12:00.7950799Z # Subtest: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority: nothing is sent; the route is the token step
2026-10-10T21:12:00.7951764Z ok 813 - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no authority: nothing is sent; the route is the token step
2026-10-10T21:12:00.7952264Z   ---
2026-10-10T21:12:00.7952445Z   duration_ms: 4.254609
2026-10-10T21:12:00.7952655Z   type: 'test'
2026-10-10T21:12:00.7953033Z   ...
2026-10-10T21:12:00.7953666Z # Subtest: GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing
2026-10-10T21:12:00.7954624Z ok 814 - GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing
2026-10-10T21:12:00.7955576Z   ---
2026-10-10T21:12:00.7955781Z   duration_ms: 2.868664
2026-10-10T21:12:00.7956000Z   type: 'test'
2026-10-10T21:12:00.7956188Z   ...
2026-10-10T21:12:00.7956920Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page
2026-10-10T21:12:00.7957947Z ok 815 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page
2026-10-10T21:12:00.7958476Z   ---
2026-10-10T21:12:00.7958659Z   duration_ms: 0.840911
2026-10-10T21:12:00.7958873Z   type: 'test'
2026-10-10T21:12:00.7959062Z   ...
2026-10-10T21:12:00.7959730Z # Subtest: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting
2026-10-10T21:12:00.7960616Z ok 816 - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting
2026-10-10T21:12:00.7961077Z   ---
2026-10-10T21:12:00.7961261Z   duration_ms: 0.278173
2026-10-10T21:12:00.7961477Z   type: 'test'
2026-10-10T21:12:00.7961671Z   ...
2026-10-10T21:12:00.7962261Z # Subtest: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly
2026-10-10T21:12:00.7963314Z ok 817 - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md parses and formats losslessly
2026-10-10T21:12:00.7963784Z   ---
2026-10-10T21:12:00.7963970Z   duration_ms: 0.282261
2026-10-10T21:12:00.7964183Z   type: 'test'
2026-10-10T21:12:00.7964365Z   ...
2026-10-10T21:12:00.7965067Z # Subtest: + Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off
2026-10-10T21:12:00.7965806Z ok 818 - + Collaborator needs the tick 'this person has agreed to be named'; Remove takes one off
2026-10-10T21:12:00.7966523Z   ---
2026-10-10T21:12:00.7966735Z   duration_ms: 0.801067
2026-10-10T21:12:00.7966958Z   type: 'test'
2026-10-10T21:12:00.7967152Z   ...
2026-10-10T21:12:00.7967854Z # Subtest: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's
2026-10-10T21:12:00.7968861Z ok 819 - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — a GitLab product accepts GitLab user names, a GitHub product GitHub's
2026-10-10T21:12:00.7969384Z   ---
2026-10-10T21:12:00.7969570Z   duration_ms: 0.645524
2026-10-10T21:12:00.7969785Z   type: 'test'
2026-10-10T21:12:00.7969974Z   ...
2026-10-10T21:12:00.7970784Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time
2026-10-10T21:12:00.7972012Z ok 820 - A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time
2026-10-10T21:12:00.7972613Z   ---
2026-10-10T21:12:00.7972802Z   duration_ms: 0.661985
2026-10-10T21:12:00.7973025Z   type: 'test'
2026-10-10T21:12:00.7973209Z   ...
2026-10-10T21:12:00.7973627Z # Subtest: A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit
2026-10-10T21:12:00.7974201Z ok 821 - A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit
2026-10-10T21:12:00.7974540Z   ---
2026-10-10T21:12:00.7974725Z   duration_ms: 0.408228
2026-10-10T21:12:00.7975351Z   type: 'test'
2026-10-10T21:12:00.7975549Z   ...
2026-10-10T21:12:00.7976230Z # Subtest: A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit
2026-10-10T21:12:00.7977157Z ok 822 - A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit
2026-10-10T21:12:00.7977815Z   ---
2026-10-10T21:12:00.7978007Z   duration_ms: 0.373392
2026-10-10T21:12:00.7978245Z   type: 'test'
2026-10-10T21:12:00.7978436Z   ...
2026-10-10T21:12:00.7979310Z # Subtest: A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit
2026-10-10T21:12:00.7980336Z ok 823 - A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit
2026-10-10T21:12:00.7980850Z   ---
2026-10-10T21:12:00.7981050Z   duration_ms: 1.01044
2026-10-10T21:12:00.7981275Z   type: 'test'
2026-10-10T21:12:00.7981467Z   ...
2026-10-10T21:12:00.7981984Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too
2026-10-10T21:12:00.7982716Z ok 824 - A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too
2026-10-10T21:12:00.7983111Z   ---
2026-10-10T21:12:00.7983295Z   duration_ms: 0.424087
2026-10-10T21:12:00.7983515Z   type: 'test'
2026-10-10T21:12:00.7983700Z   ...
2026-10-10T21:12:00.7984316Z # Subtest: A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not
2026-10-10T21:12:00.7985569Z ok 825 - A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not
2026-10-10T21:12:00.7986067Z   ---
2026-10-10T21:12:00.7986275Z   duration_ms: 4.899482
2026-10-10T21:12:00.7986497Z   type: 'test'
2026-10-10T21:12:00.7986686Z   ...
2026-10-10T21:12:00.7987299Z # Subtest: AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not
2026-10-10T21:12:00.7988824Z ok 826 - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not
2026-10-10T21:12:00.7989584Z   ---
2026-10-10T21:12:00.7989794Z   duration_ms: 0.29257
2026-10-10T21:12:00.7990006Z   type: 'test'
2026-10-10T21:12:00.7990195Z   ...
2026-10-10T21:12:00.7991224Z # Subtest: A REFUSED SAVE KEEPS THE EDIT — UC-008 3a: the use case changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:12:00.7992725Z ok 827 - A REFUSED SAVE KEEPS THE EDIT — UC-008 3a: the use case changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:12:00.7993446Z   ---
2026-10-10T21:12:00.7993636Z   duration_ms: 280.783256
2026-10-10T21:12:00.7993857Z   type: 'test'
2026-10-10T21:12:00.7994043Z   ...
2026-10-10T21:12:00.7995274Z # Subtest: A REFUSED SAVE KEEPS THE EDIT — UC-006 3a: the proposal changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:12:00.7996846Z ok 828 - A REFUSED SAVE KEEPS THE EDIT — UC-006 3a: the proposal changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it
2026-10-10T21:12:00.7997576Z   ---
2026-10-10T21:12:00.7997763Z   duration_ms: 234.832546
2026-10-10T21:12:00.7997983Z   type: 'test'
2026-10-10T21:12:00.7998166Z   ...
2026-10-10T21:12:00.9496771Z # Subtest: A REFUSED SAVE KEEPS THE EDIT counter-proof: a save the server refuses for another reason (no write access) reads no newer version and shows none
2026-10-10T21:12:00.9521954Z ok 829 - A REFUSED SAVE KEEPS THE EDIT counter-proof: a save the server refuses for another reason (no write access) reads no newer version and shows none
2026-10-10T21:12:00.9523078Z   ---
2026-10-10T21:12:00.9523588Z   duration_ms: 215.365291
2026-10-10T21:12:00.9524002Z   type: 'test'
2026-10-10T21:12:00.9524332Z   ...
2026-10-10T21:12:00.9525011Z # Subtest: the browser store keeps product addresses beside the token, once each
2026-10-10T21:12:00.9525698Z ok 830 - the browser store keeps product addresses beside the token, once each
2026-10-10T21:12:00.9526119Z   ---
2026-10-10T21:12:00.9526326Z   duration_ms: 0.387939
2026-10-10T21:12:00.9526564Z   type: 'test'
2026-10-10T21:12:00.9526767Z   ...
2026-10-10T21:12:00.9527624Z # Subtest: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting
2026-10-10T21:12:00.9528991Z ok 831 - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting
2026-10-10T21:12:00.9529546Z   ---
2026-10-10T21:12:00.9529749Z   duration_ms: 0.988028
2026-10-10T21:12:00.9529989Z   type: 'test'
2026-10-10T21:12:00.9530189Z   ...
2026-10-10T21:12:01.5012672Z # Subtest: AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing
2026-10-10T21:12:01.5037304Z ok 832 - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing
2026-10-10T21:12:01.5038610Z   ---
2026-10-10T21:12:01.5039208Z   duration_ms: 547.561116
2026-10-10T21:12:01.5039611Z   type: 'test'
2026-10-10T21:12:01.5040031Z   ...
2026-10-10T21:12:01.5040821Z # Subtest: UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both
2026-10-10T21:12:01.5041830Z ok 833 - UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both
2026-10-10T21:12:01.5042427Z   ---
2026-10-10T21:12:01.5042746Z   duration_ms: 0.661994
2026-10-10T21:12:01.5043101Z   type: 'test'
2026-10-10T21:12:01.5043414Z   ...
2026-10-10T21:12:01.5044149Z # Subtest: GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear
2026-10-10T21:12:01.5045547Z ok 834 - GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear
2026-10-10T21:12:01.5046519Z   ---
2026-10-10T21:12:01.5046848Z   duration_ms: 0.988439
2026-10-10T21:12:01.5047193Z   type: 'test'
2026-10-10T21:12:01.5047499Z   ...
2026-10-10T21:12:01.5048272Z # Subtest: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product
2026-10-10T21:12:01.5049501Z ok 835 - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product
2026-10-10T21:12:01.5050696Z   ---
2026-10-10T21:12:01.5051243Z   duration_ms: 0.583157
2026-10-10T21:12:01.5051854Z   type: 'test'
2026-10-10T21:12:01.5052377Z   ...
2026-10-10T21:12:01.5054189Z # Subtest: A GITHUB PRODUCT USES A TOKEN OF ITS OWN — in the browser store: one per GitHub product, beside the instance's; removed with the product and by a clear
2026-10-10T21:12:01.5056381Z ok 836 - A GITHUB PRODUCT USES A TOKEN OF ITS OWN — in the browser store: one per GitHub product, beside the instance's; removed with the product and by a clear
2026-10-10T21:12:01.5057144Z   ---
2026-10-10T21:12:01.5057513Z   duration_ms: 0.503366
2026-10-10T21:12:01.5057899Z   type: 'test'
2026-10-10T21:12:01.5058219Z   ...
2026-10-10T21:12:01.5059321Z # Subtest: A GITHUB PRODUCT USES A TOKEN OF ITS OWN — tokenFor: a GitHub product's own token, or the instance's while it has none; a GitLab product's project token, never a GitHub one
2026-10-10T21:12:01.5060803Z ok 837 - A GITHUB PRODUCT USES A TOKEN OF ITS OWN — tokenFor: a GitHub product's own token, or the instance's while it has none; a GitLab product's project token, never a GitHub one
2026-10-10T21:12:01.5061495Z   ---
2026-10-10T21:12:01.5061687Z   duration_ms: 0.279245
2026-10-10T21:12:01.5061907Z   type: 'test'
2026-10-10T21:12:01.5062095Z   ...
2026-10-10T21:12:01.5062742Z # Subtest: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitHub product tokens included, merged per product
2026-10-10T21:12:01.5063703Z ok 838 - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitHub product tokens included, merged per product
2026-10-10T21:12:01.5064208Z   ---
2026-10-10T21:12:01.5064487Z   duration_ms: 0.554472
2026-10-10T21:12:01.5065132Z   type: 'test'
2026-10-10T21:12:01.5065501Z   ...
2026-10-10T21:12:01.5066876Z # Subtest: THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear
2026-10-10T21:12:01.5069015Z ok 839 - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear
2026-10-10T21:12:01.5070022Z   ---
2026-10-10T21:12:01.5070705Z   duration_ms: 1.262394
2026-10-10T21:12:01.5071133Z   type: 'test'
2026-10-10T21:12:01.5071513Z   ...
2026-10-10T21:12:01.6701561Z # Subtest: UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token
2026-10-10T21:12:01.6705094Z ok 840 - UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token
2026-10-10T21:12:01.6707135Z   ---
2026-10-10T21:12:01.6707880Z   duration_ms: 168.95756
2026-10-10T21:12:01.6708525Z   type: 'test'
2026-10-10T21:12:01.6709132Z   ...
2026-10-10T21:12:01.7822302Z # Subtest: UC-008 4a counter-proof: a refusal for a used-up rate limit names the limit and offers no GitHub page
2026-10-10T21:12:01.7824032Z ok 841 - UC-008 4a counter-proof: a refusal for a used-up rate limit names the limit and offers no GitHub page
2026-10-10T21:12:01.7825473Z   ---
2026-10-10T21:12:01.7826906Z   duration_ms: 113.387071
2026-10-10T21:12:01.7827927Z   type: 'test'
2026-10-10T21:12:01.7828677Z   ...
2026-10-10T21:12:01.9033864Z # Subtest: UC-008 4a counter-proof: a token the server refuses (401) is named for renewal, and no GitHub page is offered
2026-10-10T21:12:01.9036095Z ok 842 - UC-008 4a counter-proof: a token the server refuses (401) is named for renewal, and no GitHub page is offered
2026-10-10T21:12:01.9037198Z   ---
2026-10-10T21:12:01.9037596Z   duration_ms: 122.080154
2026-10-10T21:12:01.9038591Z   type: 'test'
2026-10-10T21:12:01.9038956Z   ...
2026-10-10T21:12:01.9044236Z # Subtest: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's
2026-10-10T21:12:01.9047004Z ok 843 - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's
2026-10-10T21:12:01.9048100Z   ---
2026-10-10T21:12:01.9048489Z   duration_ms: 0.859225
2026-10-10T21:12:01.9048936Z   type: 'test'
2026-10-10T21:12:01.9049292Z   ...
2026-10-10T21:12:01.9056931Z # Subtest: UC-006 4c: a product's SPEC change refused for missing write access offers no GitHub page; counter-proof: the instance's does
2026-10-10T21:12:01.9058950Z ok 844 - UC-006 4c: a product's SPEC change refused for missing write access offers no GitHub page; counter-proof: the instance's does
2026-10-10T21:12:01.9061527Z   ---
2026-10-10T21:12:01.9062098Z   duration_ms: 0.795235
2026-10-10T21:12:01.9063236Z   type: 'test'
2026-10-10T21:12:01.9063648Z   ...
2026-10-10T21:12:01.9065243Z # Subtest: writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not
2026-10-10T21:12:01.9067459Z ok 845 - writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not
2026-10-10T21:12:01.9068647Z   ---
2026-10-10T21:12:01.9069017Z   duration_ms: 0.501203
2026-10-10T21:12:01.9069453Z   type: 'test'
2026-10-10T21:12:01.9069815Z   ...
2026-10-10T21:12:01.9220648Z # Subtest: reviewPage: every file that is not accepted is shown; those that can be accepted are counted; one that waits is named with what is open
2026-10-10T21:12:01.9242141Z ok 846 - reviewPage: every file that is not accepted is shown; those that can be accepted are counted; one that waits is named with what is open
2026-10-10T21:12:01.9244273Z   ---
2026-10-10T21:12:01.9244655Z   duration_ms: 25.597761
2026-10-10T21:12:01.9245319Z   type: 'test'
2026-10-10T21:12:01.9245667Z   ...
2026-10-10T21:12:01.9247405Z # Subtest: the architecture's review page shows every open or changed file in sequence — new in full, changed as a difference with its impact list, a waiting one marked
2026-10-10T21:12:01.9249993Z ok 847 - the architecture's review page shows every open or changed file in sequence — new in full, changed as a difference with its impact list, a waiting one marked
2026-10-10T21:12:01.9251189Z   ---
2026-10-10T21:12:01.9251844Z   duration_ms: 412.455498
2026-10-10T21:12:01.9252244Z   type: 'test'
2026-10-10T21:12:01.9252571Z   ...
2026-10-10T21:12:01.9253665Z # Subtest: Accept all N shown: one commit with one record per file the page counted, each naming the blob of the text it rendered
2026-10-10T21:12:01.9255664Z ok 848 - Accept all N shown: one commit with one record per file the page counted, each naming the blob of the text it rendered
2026-10-10T21:12:01.9256780Z   ---
2026-10-10T21:12:01.9269946Z   duration_ms: 172.578165
2026-10-10T21:12:01.9270825Z   type: 'test'
2026-10-10T21:12:01.9271450Z   ...
2026-10-10T21:12:01.9272649Z # Subtest: counter-proof: a file changed between building the page and the click is left out and named
2026-10-10T21:12:01.9274461Z ok 849 - counter-proof: a file changed between building the page and the click is left out and named
2026-10-10T21:12:01.9275921Z   ---
2026-10-10T21:12:01.9276566Z   duration_ms: 152.428293
2026-10-10T21:12:01.9277278Z   type: 'test'
2026-10-10T21:12:01.9277938Z   ...
2026-10-10T21:12:01.9279530Z # Subtest: counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing
2026-10-10T21:12:01.9281764Z ok 850 - counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing
2026-10-10T21:12:01.9283019Z   ---
2026-10-10T21:12:01.9283672Z   duration_ms: 206.764538
2026-10-10T21:12:01.9284408Z   type: 'test'
2026-10-10T21:12:01.9285318Z   ...
2026-10-10T21:12:01.9287196Z # Subtest: request count: the architecture's review page reads that area's files, the records and the texts its differences need on each load
2026-10-10T21:12:01.9289525Z ok 851 - request count: the architecture's review page reads that area's files, the records and the texts its differences need on each load
2026-10-10T21:12:01.9290930Z   ---
2026-10-10T21:12:01.9291764Z   duration_ms: 158.585377
2026-10-10T21:12:01.9292479Z   type: 'test'
2026-10-10T21:12:01.9293117Z   ...
2026-10-10T21:12:01.9298021Z # architecture review page: cold 14 requests (11 files, 1 blob, commit, tree); warm 14 (commit, tree, file docs/approvals/MOD-reader-d79e943ee4d6.md, file docs/architecture/MOD-page.md, file docs/architecture/MOD-reader.md, file docs/architecture/MOD-review.md, file SPEC.md, file docs/approvals/UC-002-a54bc1ba2797.md, file docs/architecture/ARC-001-static-client.md, file src/late.js, file src/reader.js, file src/review.py, file tests/reader.test.js, blob d79e943ee4d6b06d0d414e181e6832a4ee5d98bc)
2026-10-10T21:12:01.9302934Z # Subtest: the use cases' review page: a changed use case as its difference, no accepted one, no architecture file read; Accept all writes its record
2026-10-10T21:12:01.9305653Z ok 852 - the use cases' review page: a changed use case as its difference, no accepted one, no architecture file read; Accept all writes its record
2026-10-10T21:12:01.9307020Z   ---
2026-10-10T21:12:01.9307654Z   duration_ms: 141.046255
2026-10-10T21:12:01.9308343Z   type: 'test'
2026-10-10T21:12:01.9308997Z   ...
2026-10-10T21:12:01.9311036Z # use-case review page: 5 requests (commit, tree, file docs/approvals/UC-002-a54bc1ba2797.md, file docs/use-cases/UC-002-show-the-status.md, blob a54bc1ba2797ffd7caa94f7d34094f4ff1041004)
2026-10-10T21:12:01.9313738Z # Subtest: without a token: no Accept all — GitHub's prefilled page for each record, as for a single Accept
2026-10-10T21:12:01.9316050Z ok 853 - without a token: no Accept all — GitHub's prefilled page for each record, as for a single Accept
2026-10-10T21:12:01.9317253Z   ---
2026-10-10T21:12:01.9317910Z   duration_ms: 66.014627
2026-10-10T21:12:01.9318599Z   type: 'test'
2026-10-10T21:12:01.9319199Z   ...
2026-10-10T21:12:01.9320552Z # Subtest: the use-case list and the architecture view link to their review page; reading the lists stays as it was
2026-10-10T21:12:01.9322498Z ok 854 - the use-case list and the architecture view link to their review page; reading the lists stays as it was
2026-10-10T21:12:01.9323749Z   ---
2026-10-10T21:12:01.9324425Z   duration_ms: 119.158062
2026-10-10T21:12:01.9325734Z   type: 'test'
2026-10-10T21:12:01.9326399Z   ...
2026-10-10T21:12:01.9327901Z # Subtest: queueJob — the CI route commits the job's start record at its path, on the head read, in one commit
2026-10-10T21:12:01.9329980Z ok 855 - queueJob — the CI route commits the job's start record at its path, on the head read, in one commit
2026-10-10T21:12:01.9331129Z   ---
2026-10-10T21:12:01.9331713Z   duration_ms: 4.388701
2026-10-10T21:12:01.9332334Z   type: 'test'
2026-10-10T21:12:01.9341781Z   ...
2026-10-10T21:12:01.9342872Z # Subtest: queueJob — the CI route refuses a moved head, with nothing written
2026-10-10T21:12:01.9344304Z ok 856 - queueJob — the CI route refuses a moved head, with nothing written
2026-10-10T21:12:01.9345581Z   ---
2026-10-10T21:12:01.9346163Z   duration_ms: 1.006923
2026-10-10T21:12:01.9346739Z   type: 'test'
2026-10-10T21:12:01.9347248Z   ...
2026-10-10T21:12:01.9348656Z # Subtest: queueJob — the CI route refuses WorkflowMissing, naming the job workflow's file, for a product without it
2026-10-10T21:12:01.9350704Z ok 857 - queueJob — the CI route refuses WorkflowMissing, naming the job workflow's file, for a product without it
2026-10-10T21:12:01.9351865Z   ---
2026-10-10T21:12:01.9352398Z   duration_ms: 0.440207
2026-10-10T21:12:01.9352954Z   type: 'test'
2026-10-10T21:12:01.9353459Z   ...
2026-10-10T21:12:01.9354373Z # Subtest: queueJob — the CI route's failures are the host's, by name
2026-10-10T21:12:01.9355891Z ok 858 - queueJob — the CI route's failures are the host's, by name
2026-10-10T21:12:01.9357031Z   ---
2026-10-10T21:12:01.9357615Z   duration_ms: 0.762805
2026-10-10T21:12:01.9358243Z   type: 'test'
2026-10-10T21:12:01.9358816Z   ...
2026-10-10T21:12:03.2683612Z # TST-290129-counterproof {"argv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-290128","tests/settings-pages-acknowledgement.test.mjs"],"cwd":"/tmp/agent-m-290-ack-fault-f7GJ1h/repo","childEnv":{"AGENT_M_290_ACK_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"source":"/tmp/agent-m-290-ack-fault-f7GJ1h/repo/src/settings-pages/settings.mjs","testPath":"tests/settings-pages-acknowledgement.test.mjs","testHash":"3ab9530543293a7997425712d69e63c65b171ee937c524c959a50816e929f01b","originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultHash":"952460a86bdd87969750bca27fefabe271d2dccbde37d24a06bf887bebea3d3d","restoredHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultStarted":"2026-10-10T21:12:01.789Z","faultEnded":"2026-10-10T21:12:02.301Z","restoreStarted":"2026-10-10T21:12:02.301Z","restoreEnded":"2026-10-10T21:12:03.265Z","failed":{"status":1,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\nnot ok 1 - TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\n  ---\\n  duration_ms: 386.08719\\n  type: 'test'\\n  location: '/tmp/agent-m-290-ack-fault-f7GJ1h/repo/tests/settings-pages-acknowledgement.test.mjs:45:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    Change rereads acknowledgement ticked in another repository row\\n    \\n    false !== true\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: true\\n  actual: false\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///tmp/agent-m-290-ack-fault-f7GJ1h/repo/tests/settings-pages-acknowledgement.test.mjs:63:10)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\nok 2 - TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\n  ---\\n  duration_ms: 1.145023\\n  type: 'test'\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 1\\n\# fail 1\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 465.391064\\n","stderr":""},"passed":{"status":0,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\nok 1 - TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice\\n  ---\\n  duration_ms: 845.133746\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\nok 2 - TST-290129: CI counter-proof restores acknowledgement readback for TST-290128\\n  ---\\n  duration_ms: 0.545125\\n  type: 'test'\\n  ...\\n1..2\\n\# tests 2\\n\# suites 0\\n\# pass 2\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 924.102951\\n","stderr":""}}
2026-10-10T21:12:03.6040234Z # Subtest: TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice
2026-10-10T21:12:03.6046285Z ok 859 - TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice
2026-10-10T21:12:03.6061185Z   ---
2026-10-10T21:12:03.6061984Z   duration_ms: 770.818224
2026-10-10T21:12:03.6062785Z   type: 'test'
2026-10-10T21:12:03.6063686Z   ...
2026-10-10T21:12:03.6065263Z # Subtest: TST-290129: CI counter-proof restores acknowledgement readback for TST-290128
2026-10-10T21:12:03.6067206Z ok 860 - TST-290129: CI counter-proof restores acknowledgement readback for TST-290128
2026-10-10T21:12:03.6068455Z   ---
2026-10-10T21:12:03.6069282Z   duration_ms: 2198.939529
2026-10-10T21:12:03.6069976Z   type: 'test'
2026-10-10T21:12:03.6070862Z   ...
2026-10-10T21:12:03.6336371Z # Subtest: TST-290125: refused product metadata does not replace public Settings with a route warning
2026-10-10T21:12:03.6356004Z ok 861 - TST-290125: refused product metadata does not replace public Settings with a route warning
2026-10-10T21:12:03.6375574Z   ---
2026-10-10T21:12:03.6412636Z   duration_ms: 213.885681
2026-10-10T21:12:03.6436844Z   type: 'test'
2026-10-10T21:12:03.6437532Z   ...
2026-10-10T21:12:03.6438705Z # Subtest: TST-290126: product Clear redraws the public managed-product list
2026-10-10T21:12:03.6440169Z ok 862 - TST-290126: product Clear redraws the public managed-product list
2026-10-10T21:12:03.6441054Z   ---
2026-10-10T21:12:03.6441566Z   duration_ms: 228.892615
2026-10-10T21:12:03.6442403Z   type: 'test'
2026-10-10T21:12:03.6443062Z   ...
2026-10-10T21:12:03.6487352Z # TST-290125-127-counterproof {"argv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-290125|TST-290126|TST-290127","/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs"],"cwd":"/home/runner/work/agent-m/agent-m/","environment":{"AGENT_M_290_ACTIONS_ROOT":"/tmp/agent-m-290-actions-fault-8oP3eD/agent-m","AGENT_M_290_ACTIONS_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultHash":"be82a48ac7523a6c35118f0a6665b018e475f12068364d567461ebcc585140e1","restoredHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","started":"2026-10-10T21:12:01.487Z","failedAt":"2026-10-10T21:12:02.301Z","passedAt":"2026-10-10T21:12:03.250Z","faultStatus":1,"faultSignal":null,"faultError":null,"faultStdout":"TAP version 13\\n\# Subtest: TST-290125: refused product metadata does not replace public Settings with a route warning\\nnot ok 1 - TST-290125: refused product metadata does not replace public Settings with a route warning\\n  ---\\n  duration_ms: 212.904172\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:46:1'\\n  failureType: 'testCodeFailure'\\n  error: 'failure node: route.render keeps the public Repositories pane mounted after product metadata refusal'\\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: true\\n  operator: '=='\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:58:10)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290126: product Clear redraws the public managed-product list\\nnot ok 2 - TST-290126: product Clear redraws the public managed-product list\\n  ---\\n  duration_ms: 232.112102\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:70:1'\\n  failureType: 'testCodeFailure'\\n  error: |-\\n    failure node: the public mounted list redraws without cleared rows\\n    \\n    1 !== 0\\n    \\n  code: 'ERR_ASSERTION'\\n  name: 'AssertionError'\\n  expected: 0\\n  actual: 1\\n  operator: 'strictEqual'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:88:12)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290127: remote-session Test persists its public result for reload\\nnot ok 3 - TST-290127: remote-session Test persists its public result for reload\\n  ---\\n  duration_ms: 232.703128\\n  type: 'test'\\n  location: '/home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:99:1'\\n  failureType: 'testCodeFailure'\\n  error: \\"Cannot read properties of null (reading 'outcome')\\"\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'TypeError'\\n  stack: |-\\n    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/settings-pages-action-results.test.mjs:107:22)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n1..3\\n\# tests 3\\n\# suites 0\\n\# pass 0\\n\# fail 3\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 758.214774\\n","faultStderr":"","restoredStatus":0,"restoredSignal":null,"restoredError":null,"restoredStdout":"TAP version 13\\n\# Subtest: TST-290125: refused product metadata does not replace public Settings with a route warning\\nok 1 - TST-290125: refused product metadata does not replace public Settings with a route warning\\n  ---\\n  duration_ms: 258.280019\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290126: product Clear redraws the public managed-product list\\nok 2 - TST-290126: product Clear redraws the public managed-product list\\n  ---\\n  duration_ms: 261.094453\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290127: remote-session Test persists its public result for reload\\nok 3 - TST-290127: remote-session Test persists its public result for reload\\n  ---\\n  duration_ms: 296.215964\\n  type: 'test'\\n  ...\\n1..3\\n\# tests 3\\n\# suites 0\\n\# pass 3\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 897.630275\\n","restoredStderr":""}
2026-10-10T21:12:03.6518586Z # Subtest: TST-290127: remote-session Test persists its public result for reload
2026-10-10T21:12:03.6519850Z ok 863 - TST-290127: remote-session Test persists its public result for reload
2026-10-10T21:12:03.6520674Z   ---
2026-10-10T21:12:03.6521021Z   duration_ms: 2244.322339
2026-10-10T21:12:03.6521555Z   type: 'test'
2026-10-10T21:12:03.6521920Z   ...
2026-10-10T21:12:03.6523360Z # Subtest: add-product — before a valid address, a placeholder with no known explanation, Step C disabled
2026-10-10T21:12:03.6525543Z ok 864 - add-product — before a valid address, a placeholder with no known explanation, Step C disabled
2026-10-10T21:12:03.6526419Z   ---
2026-10-10T21:12:03.6526776Z   duration_ms: 40.979294
2026-10-10T21:12:03.6527183Z   type: 'test'
2026-10-10T21:12:03.6527519Z   ...
2026-10-10T21:12:03.6528974Z # Subtest: add-product — main flow: Step A prefilled and spelled out, Store and check flips Step A done, Add product writes and remembers
2026-10-10T21:12:03.6530414Z ok 865 - add-product — main flow: Step A prefilled and spelled out, Store and check flips Step A done, Add product writes and remembers
2026-10-10T21:12:03.6530978Z   ---
2026-10-10T21:12:03.6531202Z   duration_ms: 50.701013
2026-10-10T21:12:03.6531432Z   type: 'test'
2026-10-10T21:12:03.6531629Z   ...
2026-10-10T21:12:03.6532763Z # Subtest: add-product — 2a: Check on a 404 names the repository and links a new one; Step A stays not done
2026-10-10T21:12:03.6533926Z ok 866 - add-product — 2a: Check on a 404 names the repository and links a new one; Step A stays not done
2026-10-10T21:12:03.6534389Z   ---
2026-10-10T21:12:03.6534600Z   duration_ms: 8.673351
2026-10-10T21:12:03.6535071Z   type: 'test'
2026-10-10T21:12:03.6535546Z   ...
2026-10-10T21:12:03.6536510Z # Subtest: add-product — 2a: Add product on a 404 names the repository, links a new one, writes nothing
2026-10-10T21:12:03.6537674Z ok 867 - add-product — 2a: Add product on a 404 names the repository, links a new one, writes nothing
2026-10-10T21:12:03.6538139Z   ---
2026-10-10T21:12:03.6538336Z   duration_ms: 5.459245
2026-10-10T21:12:03.6538559Z   type: 'test'
2026-10-10T21:12:03.6538965Z   ...
2026-10-10T21:12:03.6539631Z # Subtest: add-product — 3a/4a: a stored instance token alone never marks Step A done; a later failed check un-marks it
2026-10-10T21:12:03.6540827Z ok 868 - add-product — 3a/4a: a stored instance token alone never marks Step A done; a later failed check un-marks it
2026-10-10T21:12:03.6541563Z   ---
2026-10-10T21:12:03.6541762Z   duration_ms: 11.851562
2026-10-10T21:12:03.6541987Z   type: 'test'
2026-10-10T21:12:03.6542180Z   ...
2026-10-10T21:12:03.6542755Z # Subtest: add-product — step 4: a public repository's successful check never marks Step A done
2026-10-10T21:12:03.6543904Z ok 869 - add-product — step 4: a public repository's successful check never marks Step A done
2026-10-10T21:12:03.6545256Z   ---
2026-10-10T21:12:03.6545771Z   duration_ms: 4.772364
2026-10-10T21:12:03.6546252Z   type: 'test'
2026-10-10T21:12:03.6546603Z   ...
2026-10-10T21:12:03.6548092Z # Subtest: add-product — 5a: a write refused after a successful check un-marks Step A done; nothing is written
2026-10-10T21:12:03.6549642Z ok 870 - add-product — 5a: a write refused after a successful check un-marks Step A done; nothing is written
2026-10-10T21:12:03.6550384Z   ---
2026-10-10T21:12:03.6550601Z   duration_ms: 7.763107
2026-10-10T21:12:03.6550824Z   type: 'test'
2026-10-10T21:12:03.6551015Z   ...
2026-10-10T21:12:03.6551830Z # Subtest: add-product — 5b: a complete layout is left uncommitted, the address is still remembered
2026-10-10T21:12:03.6552852Z ok 871 - add-product — 5b: a complete layout is left uncommitted, the address is still remembered
2026-10-10T21:12:03.6553333Z   ---
2026-10-10T21:12:03.6553528Z   duration_ms: 6.908781
2026-10-10T21:12:03.6553948Z   type: 'test'
2026-10-10T21:12:03.6554159Z   ...
2026-10-10T21:12:03.6554706Z # Subtest: TST-276 add-product — a synthetic GitHub Step C click writes and remembers nothing
2026-10-10T21:12:03.6556111Z ok 872 - TST-276 add-product — a synthetic GitHub Step C click writes and remembers nothing
2026-10-10T21:12:03.6556566Z   ---
2026-10-10T21:12:03.6556766Z   duration_ms: 6.239114
2026-10-10T21:12:03.6556993Z   type: 'test'
2026-10-10T21:12:03.6557415Z   ...
2026-10-10T21:12:03.6557966Z # Subtest: TST-277 add-product — a synthetic GitLab Step C click writes and remembers nothing
2026-10-10T21:12:03.6558728Z ok 873 - TST-277 add-product — a synthetic GitLab Step C click writes and remembers nothing
2026-10-10T21:12:03.6559149Z   ---
2026-10-10T21:12:03.6559342Z   duration_ms: 10.852966
2026-10-10T21:12:03.6559781Z   type: 'test'
2026-10-10T21:12:03.6559986Z   ...
2026-10-10T21:12:03.6560721Z # Subtest: TST-278 add-product — a trusted GitLab Step C click commits and remembers the product
2026-10-10T21:12:03.6561729Z ok 874 - TST-278 add-product — a trusted GitLab Step C click commits and remembers the product
2026-10-10T21:12:03.6562166Z   ---
2026-10-10T21:12:03.6562368Z   duration_ms: 12.583992
2026-10-10T21:12:03.6562595Z   type: 'test'
2026-10-10T21:12:03.6562781Z   ...
2026-10-10T21:12:03.6563407Z # Subtest: add-product — 3c/3d: GitLab's Step A is instructions only, Step B stores and checks the project's own token
2026-10-10T21:12:03.6564329Z ok 875 - add-product — 3c/3d: GitLab's Step A is instructions only, Step B stores and checks the project's own token
2026-10-10T21:12:03.6565432Z   ---
2026-10-10T21:12:03.6565698Z   duration_ms: 7.491787
2026-10-10T21:12:03.6565928Z   type: 'test'
2026-10-10T21:12:03.6566314Z   ...
2026-10-10T21:12:03.6567071Z # Subtest: TST-288 add-product — GitLab's no-project-token cause is selected locally with personal-token breadth before the decision
2026-10-10T21:12:03.6568152Z ok 876 - TST-288 add-product — GitLab's no-project-token cause is selected locally with personal-token breadth before the decision
2026-10-10T21:12:03.6568864Z   ---
2026-10-10T21:12:03.6569057Z   duration_ms: 5.001244
2026-10-10T21:12:03.6569279Z   type: 'test'
2026-10-10T21:12:03.6569464Z   ...
2026-10-10T21:12:03.6570156Z # Subtest: TST-289 add-product — GitLab's not-Maintainer cause is selected separately without replacing the project-token route
2026-10-10T21:12:03.6571185Z ok 877 - TST-289 add-product — GitLab's not-Maintainer cause is selected separately without replacing the project-token route
2026-10-10T21:12:03.6571716Z   ---
2026-10-10T21:12:03.6571909Z   duration_ms: 4.864797
2026-10-10T21:12:03.6572122Z   type: 'test'
2026-10-10T21:12:03.6572307Z   ...
2026-10-10T21:12:03.6572884Z # Subtest: add-product — GitLab: a project's own token already stored offers Check beside pasting a new one
2026-10-10T21:12:03.6573772Z ok 878 - add-product — GitLab: a project's own token already stored offers Check beside pasting a new one
2026-10-10T21:12:03.6574231Z   ---
2026-10-10T21:12:03.6574426Z   duration_ms: 4.735134
2026-10-10T21:12:03.6574646Z   type: 'test'
2026-10-10T21:12:03.6575048Z   ...
2026-10-10T21:12:03.6575605Z # Subtest: add-product — the address field's folded explanation is the 'repository' topic
2026-10-10T21:12:03.6576941Z ok 879 - add-product — the address field's folded explanation is the 'repository' topic
2026-10-10T21:12:03.6577434Z   ---
2026-10-10T21:12:03.6577637Z   duration_ms: 1.368102
2026-10-10T21:12:03.6577862Z   type: 'test'
2026-10-10T21:12:03.6578053Z   ...
2026-10-10T21:12:03.6578614Z # Subtest: TST-287001: the public Bridge route persists a distinct remote session and renders canonical setup text
2026-10-10T21:12:03.6579468Z ok 880 - TST-287001: the public Bridge route persists a distinct remote session and renders canonical setup text
2026-10-10T21:12:03.6579966Z   ---
2026-10-10T21:12:03.6580163Z   duration_ms: 28.150441
2026-10-10T21:12:03.6580387Z   type: 'test'
2026-10-10T21:12:03.6580576Z   ...
2026-10-10T21:12:03.6581177Z # Subtest: TST-287002: the public Bridge route names exhausted and setup-required remote-session states without a tunnel claim
2026-10-10T21:12:03.6582124Z ok 881 - TST-287002: the public Bridge route names exhausted and setup-required remote-session states without a tunnel claim
2026-10-10T21:12:03.6582655Z   ---
2026-10-10T21:12:03.6582845Z   duration_ms: 3.346893
2026-10-10T21:12:03.6583064Z   type: 'test'
2026-10-10T21:12:03.6583253Z   ...
2026-10-10T21:12:03.6583687Z # Subtest: the public Bridge route pairs, reloads, hides and really clears Bridge settings
2026-10-10T21:12:03.6584516Z ok 882 - the public Bridge route pairs, reloads, hides and really clears Bridge settings
2026-10-10T21:12:03.6585176Z   ---
2026-10-10T21:12:03.6585374Z   duration_ms: 40.143173
2026-10-10T21:12:03.6585597Z   type: 'test'
2026-10-10T21:12:03.6585786Z   ...
2026-10-10T21:12:03.6586288Z # Subtest: the Bridge route names a refused pair and saves HTTPS jump-host access without a hidden request
2026-10-10T21:12:03.6587067Z ok 883 - the Bridge route names a refused pair and saves HTTPS jump-host access without a hidden request
2026-10-10T21:12:03.6587541Z   ---
2026-10-10T21:12:03.6587729Z   duration_ms: 7.828691
2026-10-10T21:12:03.6587950Z   type: 'test'
2026-10-10T21:12:03.6588137Z   ...
2026-10-10T21:12:03.6588494Z # Subtest: TST-265001: direct endpoint saves before its one short test
2026-10-10T21:12:03.6589016Z ok 884 - TST-265001: direct endpoint saves before its one short test
2026-10-10T21:12:03.6589360Z   ---
2026-10-10T21:12:03.6589549Z   duration_ms: 48.596366
2026-10-10T21:12:03.6589770Z   type: 'test'
2026-10-10T21:12:03.6589965Z   ...
2026-10-10T21:12:03.6590351Z # Subtest: TST-265002: browser refusal is shown with CI and Bridge alternatives
2026-10-10T21:12:03.6590932Z ok 885 - TST-265002: browser refusal is shown with CI and Bridge alternatives
2026-10-10T21:12:03.6591323Z   ---
2026-10-10T21:12:03.6591510Z   duration_ms: 3.866217
2026-10-10T21:12:03.6591725Z   type: 'test'
2026-10-10T21:12:03.6591912Z   ...
2026-10-10T21:12:03.6592232Z # Subtest: TST-265003: a refused key remains stored and reloads
2026-10-10T21:12:03.6592838Z ok 886 - TST-265003: a refused key remains stored and reloads
2026-10-10T21:12:03.6593155Z   ---
2026-10-10T21:12:03.6593339Z   duration_ms: 3.56859
2026-10-10T21:12:03.6593554Z   type: 'test'
2026-10-10T21:12:03.6593746Z   ...
2026-10-10T21:12:03.6594123Z # Subtest: TST-265004: Clear removes the stored endpoint and empties the form
2026-10-10T21:12:03.6594686Z ok 887 - TST-265004: Clear removes the stored endpoint and empties the form
2026-10-10T21:12:03.6595325Z   ---
2026-10-10T21:12:03.6595529Z   duration_ms: 1.029306
2026-10-10T21:12:03.6595749Z   type: 'test'
2026-10-10T21:12:03.6595940Z   ...
2026-10-10T21:12:03.6596320Z # Subtest: TST-265005: a Bridge endpoint is retained and never called directly
2026-10-10T21:12:03.6596876Z ok 888 - TST-265005: a Bridge endpoint is retained and never called directly
2026-10-10T21:12:03.6597236Z   ---
2026-10-10T21:12:03.6597419Z   duration_ms: 1.199795
2026-10-10T21:12:03.6597630Z   type: 'test'
2026-10-10T21:12:03.6597824Z   ...
2026-10-10T21:12:03.6598189Z # Subtest: TST-265006: an absent key maps to null at the direct-call boundary
2026-10-10T21:12:03.6599203Z ok 889 - TST-265006: an absent key maps to null at the direct-call boundary
2026-10-10T21:12:03.6599593Z   ---
2026-10-10T21:12:03.6599786Z   duration_ms: 1.523024
2026-10-10T21:12:03.6600168Z   type: 'test'
2026-10-10T21:12:03.6600387Z   ...
2026-10-10T21:12:03.6600910Z # Subtest: TST-265007: disclosure precedes a hidden endpoint key without repository or navigation leakage
2026-10-10T21:12:03.6602091Z ok 890 - TST-265007: disclosure precedes a hidden endpoint key without repository or navigation leakage
2026-10-10T21:12:03.6603016Z   ---
2026-10-10T21:12:03.6603329Z   duration_ms: 1.823078
2026-10-10T21:12:03.6603695Z   type: 'test'
2026-10-10T21:12:03.6604013Z   ...
2026-10-10T21:12:03.6605124Z # Subtest: TST-265008: endpoint storage is preceded by its Pages-origin notice and folded explanations
2026-10-10T21:12:03.6606562Z ok 891 - TST-265008: endpoint storage is preceded by its Pages-origin notice and folded explanations
2026-10-10T21:12:03.6607419Z   ---
2026-10-10T21:12:03.6607731Z   duration_ms: 0.576795
2026-10-10T21:12:03.6608097Z   type: 'test'
2026-10-10T21:12:03.6608410Z   ...
2026-10-10T21:12:03.6609061Z # Subtest: TST-265009: a stored endpoint key stays hidden until Show
2026-10-10T21:12:03.6609996Z ok 892 - TST-265009: a stored endpoint key stays hidden until Show
2026-10-10T21:12:03.6610570Z   ---
2026-10-10T21:12:03.6610884Z   duration_ms: 2.439076
2026-10-10T21:12:03.6611443Z   type: 'test'
2026-10-10T21:12:03.6611762Z   ...
2026-10-10T21:12:03.6612555Z # Subtest: TST-265010: Settings lists its stored endpoint with a hidden key and Show
2026-10-10T21:12:03.6613708Z ok 893 - TST-265010: Settings lists its stored endpoint with a hidden key and Show
2026-10-10T21:12:03.6614435Z   ---
2026-10-10T21:12:03.6614749Z   duration_ms: 6.008387
2026-10-10T21:12:03.6615316Z   type: 'test'
2026-10-10T21:12:03.6615654Z   ...
2026-10-10T21:12:03.6616574Z # Subtest: TST-265011: Settings tests a stored direct endpoint and changes its named route
2026-10-10T21:12:03.6617880Z ok 894 - TST-265011: Settings tests a stored direct endpoint and changes its named route
2026-10-10T21:12:03.6618596Z   ---
2026-10-10T21:12:03.6619034Z   duration_ms: 2.419189
2026-10-10T21:12:03.6619407Z   type: 'test'
2026-10-10T21:12:03.6619729Z   ...
2026-10-10T21:12:03.6620523Z # Subtest: TST-265012: Settings Clear removes only the selected endpoint entry
2026-10-10T21:12:03.6621557Z ok 895 - TST-265012: Settings Clear removes only the selected endpoint entry
2026-10-10T21:12:03.6622324Z   ---
2026-10-10T21:12:03.6622636Z   duration_ms: 2.412777
2026-10-10T21:12:03.6623115Z   type: 'test'
2026-10-10T21:12:03.6623433Z   ...
2026-10-10T21:12:03.6624324Z # Subtest: TST-265013: Settings explains its browser section and each stored endpoint line
2026-10-10T21:12:03.6625808Z ok 896 - TST-265013: Settings explains its browser section and each stored endpoint line
2026-10-10T21:12:03.6626798Z   ---
2026-10-10T21:12:03.6627295Z   duration_ms: 1.015269
2026-10-10T21:12:03.6627719Z   type: 'test'
2026-10-10T21:12:03.6628068Z   ...
2026-10-10T21:12:03.6629127Z # Subtest: TST-265014: Settings discloses an endpoint Test destination before its control
2026-10-10T21:12:03.6630377Z ok 897 - TST-265014: Settings discloses an endpoint Test destination before its control
2026-10-10T21:12:03.6631263Z   ---
2026-10-10T21:12:03.6631584Z   duration_ms: 0.917655
2026-10-10T21:12:03.6632107Z   type: 'test'
2026-10-10T21:12:03.6632466Z   ...
2026-10-10T21:12:03.6633406Z # Subtest: TST-265015: Settings persists a successful endpoint test and clears its metadata
2026-10-10T21:12:03.6634657Z ok 898 - TST-265015: Settings persists a successful endpoint test and clears its metadata
2026-10-10T21:12:03.6635921Z   ---
2026-10-10T21:12:03.6636249Z   duration_ms: 6.559443
2026-10-10T21:12:03.6636624Z   type: 'test'
2026-10-10T21:12:03.6637076Z   ...
2026-10-10T21:12:03.6637783Z # Subtest: TST-265016: Settings identifies untested and refused endpoint states
2026-10-10T21:12:03.6638983Z ok 899 - TST-265016: Settings identifies untested and refused endpoint states
2026-10-10T21:12:03.6639656Z   ---
2026-10-10T21:12:03.6639970Z   duration_ms: 1.446119
2026-10-10T21:12:03.6640475Z   type: 'test'
2026-10-10T21:12:03.6640795Z   ...
2026-10-10T21:12:03.6641666Z # Subtest: TST-288001: Settings discloses exported secrets and grants before one canonical download
2026-10-10T21:12:03.6643134Z ok 900 - TST-288001: Settings discloses exported secrets and grants before one canonical download
2026-10-10T21:12:03.6644013Z   ---
2026-10-10T21:12:03.6644321Z   duration_ms: 12.308794
2026-10-10T21:12:03.6644678Z   type: 'test'
2026-10-10T21:12:03.6645182Z   ...
2026-10-10T21:12:03.6646140Z # Subtest: TST-288002: Settings imports absent canonical settings and keeps existing bytes
2026-10-10T21:12:03.6647314Z ok 901 - TST-288002: Settings imports absent canonical settings and keeps existing bytes
2026-10-10T21:12:03.6648030Z   ---
2026-10-10T21:12:03.6648462Z   duration_ms: 3.548933
2026-10-10T21:12:03.6648819Z   type: 'test'
2026-10-10T21:12:03.6649246Z   ...
2026-10-10T21:12:03.6650266Z # Subtest: TST-288003: Settings locks imports with a passphrase and leaves malformed import destinations untouched
2026-10-10T21:12:03.6651997Z ok 902 - TST-288003: Settings locks imports with a passphrase and leaves malformed import destinations untouched
2026-10-10T21:12:03.6653018Z   ---
2026-10-10T21:12:03.6653358Z   duration_ms: 327.602853
2026-10-10T21:12:03.6653746Z   type: 'test'
2026-10-10T21:12:03.6654430Z   ...
2026-10-10T21:12:04.2173018Z # Subtest: TST-290116: an unset repository-token expiry defaults to the prefilled ninety days
2026-10-10T21:12:04.2188718Z ok 903 - TST-290116: an unset repository-token expiry defaults to the prefilled ninety days
2026-10-10T21:12:04.2189896Z   ---
2026-10-10T21:12:04.2190529Z   duration_ms: 7.887319
2026-10-10T21:12:04.2191282Z   type: 'test'
2026-10-10T21:12:04.2191871Z   ...
2026-10-10T21:12:04.2193197Z # Subtest: TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences
2026-10-10T21:12:04.2195524Z ok 904 - TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences
2026-10-10T21:12:04.2196891Z   ---
2026-10-10T21:12:04.2197476Z   duration_ms: 5.18046
2026-10-10T21:12:04.2198114Z   type: 'test'
2026-10-10T21:12:04.2198691Z   ...
2026-10-10T21:12:04.2199997Z # Subtest: TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data
2026-10-10T21:12:04.2201996Z ok 905 - TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data
2026-10-10T21:12:04.2203211Z   ---
2026-10-10T21:12:04.2203807Z   duration_ms: 8.548232
2026-10-10T21:12:04.2204460Z   type: 'test'
2026-10-10T21:12:04.2205299Z   ...
2026-10-10T21:12:04.2206779Z # Subtest: TST-290119: product removal and product-list clear ask before changing browser records
2026-10-10T21:12:04.2208826Z ok 906 - TST-290119: product removal and product-list clear ask before changing browser records
2026-10-10T21:12:04.2210513Z   ---
2026-10-10T21:12:04.2211145Z   duration_ms: 4.237936
2026-10-10T21:12:04.2211799Z   type: 'test'
2026-10-10T21:12:04.2212575Z   ...
2026-10-10T21:12:04.2213702Z # Subtest: TST-290120: repository token controls retain folded scope and purpose explanations
2026-10-10T21:12:04.2215615Z ok 907 - TST-290120: repository token controls retain folded scope and purpose explanations
2026-10-10T21:12:04.2216681Z   ---
2026-10-10T21:12:04.2217280Z   duration_ms: 0.956308
2026-10-10T21:12:04.2217928Z   type: 'test'
2026-10-10T21:12:04.2218506Z   ...
2026-10-10T21:12:04.2219785Z # Subtest: TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation
2026-10-10T21:12:04.2221723Z ok 908 - TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation
2026-10-10T21:12:04.2223184Z   ---
2026-10-10T21:12:04.2223794Z   duration_ms: 4.118215
2026-10-10T21:12:04.2224629Z   type: 'test'
2026-10-10T21:12:04.2225613Z   ...
2026-10-10T21:12:04.2227141Z # Subtest: TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation
2026-10-10T21:12:04.2229481Z ok 909 - TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation
2026-10-10T21:12:04.2230902Z   ---
2026-10-10T21:12:04.2231497Z   duration_ms: 1.592024
2026-10-10T21:12:04.2232151Z   type: 'test'
2026-10-10T21:12:04.2232879Z   ...
2026-10-10T21:12:04.2353045Z # TST-290122-counterproof {"argv":["/opt/hostedtoolcache/node/22.23.3/x64/bin/node","--test","--test-name-pattern","TST-29011[6-9]|TST-290120|TST-290121|TST-290123|TST-290124","tests/settings-pages-settings-regressions.test.mjs"],"cwd":"/tmp/agent-m-290-settings-fault-CjHgcA/repo","childEnv":{"AGENT_M_290_SETTINGS_FAULT_CHILD":"1","NODE_TEST_CONTEXT":null},"source":"/tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs","testPath":"tests/settings-pages-settings-regressions.test.mjs","testHash":"af0c1c86de4671860742221dc8eedb17b5b8da742433d06a3dc465106a183d95","originalHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultHash":"0aa2b88c2171912cc407e83b512c743e2692a155392a2531ece7254a8cd382d7","restoredHash":"87342cd3a993b69548f54bc722b321a4d230ddcc20c72081a310919df395436d","faultStarted":"2026-10-10T21:12:03.720Z","faultEnded":"2026-10-10T21:12:03.952Z","restoreStarted":"2026-10-10T21:12:03.952Z","restoreEnded":"2026-10-10T21:12:04.216Z","failed":{"status":1,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\nnot ok 1 - TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\n  ---\\n  duration_ms: 4.629515\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:86:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:87:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)\\n  ...\\n\# Subtest: TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\nnot ok 2 - TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\n  ---\\n  duration_ms: 4.388311\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:100:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:103:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\nnot ok 3 - TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\n  ---\\n  duration_ms: 1.249519\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:118:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:121:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290119: product removal and product-list clear ask before changing browser records\\nnot ok 4 - TST-290119: product removal and product-list clear ask before changing browser records\\n  ---\\n  duration_ms: 0.790897\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:140:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:144:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290120: repository token controls retain folded scope and purpose explanations\\nnot ok 5 - TST-290120: repository token controls retain folded scope and purpose explanations\\n  ---\\n  duration_ms: 1.732618\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:165:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:166:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\nnot ok 6 - TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\n  ---\\n  duration_ms: 1.498688\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:179:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:187:18)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\nnot ok 7 - TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\n  ---\\n  duration_ms: 0.717479\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:209:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:215:20)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\nnot ok 8 - TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\n  ---\\n  duration_ms: 1.113042\\n  type: 'test'\\n  location: '/tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:242:1'\\n  failureType: 'testCodeFailure'\\n  error: 'repositoryLine is not defined'\\n  code: 'ERR_TEST_FAILURE'\\n  name: 'ReferenceError'\\n  stack: |-\\n    file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:52\\n    Array.map (<anonymous>)\\n    Object.render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/src/settings-pages/settings.mjs:693:38)\\n    async render (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:46:3)\\n    async TestContext.<anonymous> (file:///tmp/agent-m-290-settings-fault-CjHgcA/repo/tests/settings-pages-settings-regressions.test.mjs:251:31)\\n    async Test.run (node:internal/test_runner/test:1054:7)\\n    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)\\n  ...\\n\# Subtest: TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\nok 9 - TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\n  ---\\n  duration_ms: 0.757554\\n  type: 'test'\\n  ...\\n1..9\\n\# tests 9\\n\# suites 0\\n\# pass 1\\n\# fail 8\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 188.212816\\n","stderr":""},"passed":{"status":0,"signal":null,"error":null,"stdout":"TAP version 13\\n\# Subtest: TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\nok 1 - TST-290116: an unset repository-token expiry defaults to the prefilled ninety days\\n  ---\\n  duration_ms: 5.159331\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\nok 2 - TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences\\n  ---\\n  duration_ms: 4.848044\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\nok 3 - TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data\\n  ---\\n  duration_ms: 9.782741\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290119: product removal and product-list clear ask before changing browser records\\nok 4 - TST-290119: product removal and product-list clear ask before changing browser records\\n  ---\\n  duration_ms: 2.323138\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290120: repository token controls retain folded scope and purpose explanations\\nok 5 - TST-290120: repository token controls retain folded scope and purpose explanations\\n  ---\\n  duration_ms: 1.17524\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\nok 6 - TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation\\n  ---\\n  duration_ms: 3.999049\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\nok 7 - TST-290124: Notifications explains its off-state checks, tokens, and open-page boundary in a folded explanation\\n  ---\\n  duration_ms: 1.174809\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\nok 8 - TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link\\n  ---\\n  duration_ms: 9.381238\\n  type: 'test'\\n  ...\\n\# Subtest: TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\nok 9 - TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124\\n  ---\\n  duration_ms: 0.79239\\n  type: 'test'\\n  ...\\n1..9\\n\# tests 9\\n\# suites 0\\n\# pass 9\\n\# fail 0\\n\# cancelled 0\\n\# skipped 0\\n\# todo 0\\n\# duration_ms 214.03957\\n","stderr":""}}
2026-10-10T21:12:04.5483773Z # Subtest: TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link
2026-10-10T21:12:04.5488259Z ok 910 - TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link
2026-10-10T21:12:04.5489133Z   ---
2026-10-10T21:12:04.5489512Z   duration_ms: 9.731096
2026-10-10T21:12:04.5489902Z   type: 'test'
2026-10-10T21:12:04.5490245Z   ...
2026-10-10T21:12:04.5490910Z # Subtest: TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124
2026-10-10T21:12:04.5491859Z ok 911 - TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290124
2026-10-10T21:12:04.5492497Z   ---
2026-10-10T21:12:04.5492839Z   duration_ms: 1167.543202
2026-10-10T21:12:04.5493220Z   type: 'test'
2026-10-10T21:12:04.5493560Z   ...
2026-10-10T21:12:04.5641262Z # Subtest: TST-290109: Settings tabs preserve unfinished form state without actions
2026-10-10T21:12:04.5666179Z ok 912 - TST-290109: Settings tabs preserve unfinished form state without actions
2026-10-10T21:12:04.5685613Z   ---
2026-10-10T21:12:04.5686216Z   duration_ms: 11.665483
2026-10-10T21:12:04.5686814Z   type: 'test'
2026-10-10T21:12:04.5687325Z   ...
2026-10-10T21:12:04.5688549Z # Subtest: TST-290110: Settings exposes remote-session actions and requires acknowledgement before browser clear
2026-10-10T21:12:04.5690680Z ok 913 - TST-290110: Settings exposes remote-session actions and requires acknowledgement before browser clear
2026-10-10T21:12:04.5692921Z   ---
2026-10-10T21:12:04.5693468Z   duration_ms: 45.235127
2026-10-10T21:12:04.5694034Z   type: 'test'
2026-10-10T21:12:04.5694549Z   ...
2026-10-10T21:12:04.5695733Z # Subtest: TST-290111: Settings saves, tests, and records an expiring repository token
2026-10-10T21:12:04.5697142Z ok 914 - TST-290111: Settings saves, tests, and records an expiring repository token
2026-10-10T21:12:04.5698043Z   ---
2026-10-10T21:12:04.5698560Z   duration_ms: 6.540788
2026-10-10T21:12:04.5699130Z   type: 'test'
2026-10-10T21:12:04.5699603Z   ...
2026-10-10T21:12:04.5700571Z # Subtest: TST-290112: Settings names denied notification permission without asking again
2026-10-10T21:12:04.5701889Z ok 915 - TST-290112: Settings names denied notification permission without asking again
2026-10-10T21:12:04.5703953Z   ---
2026-10-10T21:12:04.5704525Z   duration_ms: 1.287019
2026-10-10T21:12:04.5705351Z   type: 'test'
2026-10-10T21:12:04.5705871Z   ...
2026-10-10T21:12:04.5707036Z # Subtest: TST-290113: Settings removes one legacy collaborator consent row without altering unrelated bytes
2026-10-10T21:12:04.5708804Z ok 916 - TST-290113: Settings removes one legacy collaborator consent row without altering unrelated bytes
2026-10-10T21:12:04.5709923Z   ---
2026-10-10T21:12:04.5710493Z   duration_ms: 12.129866
2026-10-10T21:12:04.5711064Z   type: 'test'
2026-10-10T21:12:04.5711393Z   ...
2026-10-10T21:12:04.5712565Z # Subtest: explanations.md — each of UC-002's choices points to a chapter of the book
2026-10-10T21:12:04.5713833Z ok 917 - explanations.md — each of UC-002's choices points to a chapter of the book
2026-10-10T21:12:04.5714513Z   ---
2026-10-10T21:12:04.5715056Z   duration_ms: 2.905002
2026-10-10T21:12:04.5715443Z   type: 'test'
2026-10-10T21:12:04.5715777Z   ...
2026-10-10T21:12:04.5716843Z # Subtest: schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:12:04.5718355Z ok 918 - schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:12:04.5719434Z   ---
2026-10-10T21:12:04.5719817Z   duration_ms: 33.147321
2026-10-10T21:12:04.5720220Z   type: 'test'
2026-10-10T21:12:04.5720557Z   ...
2026-10-10T21:12:04.5721628Z # Subtest: schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:12:04.5723195Z ok 919 - schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:12:04.5724012Z   ---
2026-10-10T21:12:04.5724322Z   duration_ms: 10.631841
2026-10-10T21:12:04.5724689Z   type: 'test'
2026-10-10T21:12:04.5725260Z   ...
2026-10-10T21:12:04.5726067Z # Subtest: schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:12:04.5727220Z ok 920 - schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:12:04.5727863Z   ---
2026-10-10T21:12:04.5728174Z   duration_ms: 19.130595
2026-10-10T21:12:04.5728545Z   type: 'test'
2026-10-10T21:12:04.5728871Z   ...
2026-10-10T21:12:04.5729557Z # Subtest: schemaForm — the form opens with its first field focused
2026-10-10T21:12:04.5730515Z ok 921 - schemaForm — the form opens with its first field focused
2026-10-10T21:12:04.5731082Z   ---
2026-10-10T21:12:04.5731439Z   duration_ms: 3.249179
2026-10-10T21:12:04.5731825Z   type: 'test'
2026-10-10T21:12:04.5732154Z   ...
2026-10-10T21:12:04.5733022Z # Subtest: explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:12:04.5734503Z ok 922 - explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:12:04.5806461Z   ---
2026-10-10T21:12:04.5806835Z   duration_ms: 13.389204
2026-10-10T21:12:04.5807236Z   type: 'test'
2026-10-10T21:12:04.5807574Z   ...
2026-10-10T21:12:04.5808408Z # Subtest: explain — an empty element for a topic the file does not hold
2026-10-10T21:12:04.5809580Z ok 923 - explain — an empty element for a topic the file does not hold
2026-10-10T21:12:04.5809971Z   ---
2026-10-10T21:12:04.5810195Z   duration_ms: 0.261903
2026-10-10T21:12:04.5810486Z   type: 'test'
2026-10-10T21:12:04.5810697Z   ...
2026-10-10T21:12:04.5811110Z # Subtest: explain — repository: what a repository is (UC-001)
2026-10-10T21:12:04.5811650Z ok 924 - explain — repository: what a repository is (UC-001)
2026-10-10T21:12:04.5811981Z   ---
2026-10-10T21:12:04.5812176Z   duration_ms: 1.14922
2026-10-10T21:12:04.5812391Z   type: 'test'
2026-10-10T21:12:04.5812586Z   ...
2026-10-10T21:12:04.5813063Z # Subtest: explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:12:04.5813720Z ok 925 - explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:12:04.5814093Z   ---
2026-10-10T21:12:04.5814282Z   duration_ms: 0.528484
2026-10-10T21:12:04.5814497Z   type: 'test'
2026-10-10T21:12:04.5814693Z   ...
2026-10-10T21:12:04.5815716Z # Subtest: explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:12:04.5816447Z ok 926 - explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:12:04.5816838Z   ---
2026-10-10T21:12:04.5817036Z   duration_ms: 2.458743
2026-10-10T21:12:04.5817257Z   type: 'test'
2026-10-10T21:12:04.5817450Z   ...
2026-10-10T21:12:04.5817848Z # Subtest: explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:12:04.5818404Z ok 927 - explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:12:04.5818730Z   ---
2026-10-10T21:12:04.5818914Z   duration_ms: 0.6439
2026-10-10T21:12:04.5819134Z   type: 'test'
2026-10-10T21:12:04.5819327Z   ...
2026-10-10T21:12:04.5819850Z # Subtest: explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:12:04.5820617Z ok 928 - explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:12:04.5821034Z   ---
2026-10-10T21:12:04.5821216Z   duration_ms: 0.655783
2026-10-10T21:12:04.5821424Z   type: 'test'
2026-10-10T21:12:04.5821614Z   ...
2026-10-10T21:12:04.5822034Z # Subtest: explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:12:04.5822876Z ok 929 - explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:12:04.5823228Z   ---
2026-10-10T21:12:04.5823416Z   duration_ms: 0.653398
2026-10-10T21:12:04.5823635Z   type: 'test'
2026-10-10T21:12:04.5823825Z   ...
2026-10-10T21:12:04.5824380Z # Subtest: explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:12:04.5825487Z ok 930 - explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:12:04.5825949Z   ---
2026-10-10T21:12:04.5826282Z   duration_ms: 0.319791
2026-10-10T21:12:04.5826696Z   type: 'test'
2026-10-10T21:12:04.5826931Z   ...
2026-10-10T21:12:04.5827554Z # Subtest: explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:12:04.5828412Z ok 931 - explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:12:04.5828896Z   ---
2026-10-10T21:12:04.5829089Z   duration_ms: 0.375577
2026-10-10T21:12:04.5829307Z   type: 'test'
2026-10-10T21:12:04.5829495Z   ...
2026-10-10T21:12:04.5830136Z # Subtest: startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:12:04.5831087Z ok 932 - startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:12:04.5831575Z   ---
2026-10-10T21:12:04.5831954Z   duration_ms: 1.908619
2026-10-10T21:12:04.5832163Z   type: 'test'
2026-10-10T21:12:04.5832348Z   ...
2026-10-10T21:12:04.5832870Z # Subtest: instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:12:04.5833607Z ok 933 - instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:12:04.5834013Z   ---
2026-10-10T21:12:04.5834199Z   duration_ms: 0.238379
2026-10-10T21:12:04.5834414Z   type: 'test'
2026-10-10T21:12:04.5834604Z   ...
2026-10-10T21:12:04.5836294Z # Subtest: notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:12:04.5837570Z ok 934 - notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:12:04.5838292Z   ---
2026-10-10T21:12:04.5838500Z   duration_ms: 1.013575
2026-10-10T21:12:04.5838733Z   type: 'test'
2026-10-10T21:12:04.5838929Z   ...
2026-10-10T21:12:04.5839501Z # Subtest: explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:12:04.5840310Z ok 935 - explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:12:04.5840741Z   ---
2026-10-10T21:12:04.5840933Z   duration_ms: 0.311245
2026-10-10T21:12:04.5841151Z   type: 'test'
2026-10-10T21:12:04.5841351Z   ...
2026-10-10T21:12:04.5841824Z # Subtest: TST-264-01 — explain provides every endpoint configuration step (UC-003)
2026-10-10T21:12:04.5842498Z ok 936 - TST-264-01 — explain provides every endpoint configuration step (UC-003)
2026-10-10T21:12:04.5842886Z   ---
2026-10-10T21:12:04.5843075Z   duration_ms: 3.716728
2026-10-10T21:12:04.5843287Z   type: 'test'
2026-10-10T21:12:04.5843481Z   ...
2026-10-10T21:12:04.5844051Z # Subtest: schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:12:04.5845207Z ok 937 - schemaForm — a field for each key and each section of the schema, holding the document's values
2026-10-10T21:12:04.5845690Z   ---
2026-10-10T21:12:04.5845884Z   duration_ms: 32.551158
2026-10-10T21:12:04.5846575Z   type: 'test'
2026-10-10T21:12:04.5846801Z   ...
2026-10-10T21:12:04.5847443Z # Subtest: schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:12:04.5848331Z ok 938 - schemaForm — a finding is shown beside its field, and Save is offered only while no error remains
2026-10-10T21:12:04.5849146Z   ---
2026-10-10T21:12:04.5849357Z   duration_ms: 9.509108
2026-10-10T21:12:04.5849788Z   type: 'test'
2026-10-10T21:12:04.5849993Z   ...
2026-10-10T21:12:04.5850473Z # Subtest: schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:12:04.5851111Z ok 939 - schemaForm — Save hands the document over once, on a person's click
2026-10-10T21:12:04.5851475Z   ---
2026-10-10T21:12:04.5851661Z   duration_ms: 16.44565
2026-10-10T21:12:04.5851879Z   type: 'test'
2026-10-10T21:12:04.5852076Z   ...
2026-10-10T21:12:04.5852466Z # Subtest: schemaForm — the form opens with its first field focused
2026-10-10T21:12:04.5853018Z ok 940 - schemaForm — the form opens with its first field focused
2026-10-10T21:12:04.5853352Z   ---
2026-10-10T21:12:04.5853546Z   duration_ms: 2.293653
2026-10-10T21:12:04.5853764Z   type: 'test'
2026-10-10T21:12:04.5853958Z   ...
2026-10-10T21:12:04.5854439Z # Subtest: explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:12:04.5855457Z ok 941 - explain — the folded What is this? of a topic, rendered from explanations.md
2026-10-10T21:12:04.5855879Z   ---
2026-10-10T21:12:04.5856078Z   duration_ms: 12.528185
2026-10-10T21:12:04.5856308Z   type: 'test'
2026-10-10T21:12:04.5856504Z   ...
2026-10-10T21:12:04.5857402Z # Subtest: explain — an empty element for a topic the file does not hold
2026-10-10T21:12:04.5858071Z ok 942 - explain — an empty element for a topic the file does not hold
2026-10-10T21:12:04.5858423Z   ---
2026-10-10T21:12:04.5858616Z   duration_ms: 0.295004
2026-10-10T21:12:04.5859015Z   type: 'test'
2026-10-10T21:12:04.5859211Z   ...
2026-10-10T21:12:04.5859828Z # Subtest: explain — repository: what a repository is (UC-001)
2026-10-10T21:12:04.5860590Z ok 943 - explain — repository: what a repository is (UC-001)
2026-10-10T21:12:04.5860918Z   ---
2026-10-10T21:12:04.5861113Z   duration_ms: 1.448434
2026-10-10T21:12:04.5861335Z   type: 'test'
2026-10-10T21:12:04.5861530Z   ...
2026-10-10T21:12:04.5862005Z # Subtest: explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:12:04.5862671Z ok 944 - explain — product-key: why the product gets a key of its own (UC-001)
2026-10-10T21:12:04.5863044Z   ---
2026-10-10T21:12:04.5863236Z   duration_ms: 0.752735
2026-10-10T21:12:04.5863455Z   type: 'test'
2026-10-10T21:12:04.5863644Z   ...
2026-10-10T21:12:04.5864094Z # Subtest: explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:12:04.5864724Z ok 945 - explain — review-layout-commit: what the commit contains (UC-001)
2026-10-10T21:12:04.5865399Z   ---
2026-10-10T21:12:04.5865592Z   duration_ms: 1.934096
2026-10-10T21:12:04.5865801Z   type: 'test'
2026-10-10T21:12:04.5865989Z   ...
2026-10-10T21:12:04.5866430Z # Subtest: explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:12:04.5867000Z ok 946 - explain — reverting-the-commit: how to undo it (UC-001)
2026-10-10T21:12:04.5867597Z   ---
2026-10-10T21:12:04.5867788Z   duration_ms: 2.340872
2026-10-10T21:12:04.5868002Z   type: 'test'
2026-10-10T21:12:04.5868193Z   ...
2026-10-10T21:12:04.5869317Z # Subtest: explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:12:04.5870117Z ok 947 - explain — the-product-list: why the product list lives in this browser only (UC-001)
2026-10-10T21:12:04.5870602Z   ---
2026-10-10T21:12:04.5870960Z   duration_ms: 1.044383
2026-10-10T21:12:04.5871360Z   type: 'test'
2026-10-10T21:12:04.5871563Z   ...
2026-10-10T21:12:04.5872037Z # Subtest: explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:12:04.5872671Z ok 948 - explain — release-test-levels: what each level checks (UC-013)
2026-10-10T21:12:04.5873066Z   ---
2026-10-10T21:12:04.5873260Z   duration_ms: 1.017673
2026-10-10T21:12:04.5873479Z   type: 'test'
2026-10-10T21:12:04.5873670Z   ...
2026-10-10T21:12:04.5874230Z # Subtest: explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:12:04.5875577Z ok 949 - explain — independent-release-tests: why a different participant writes them (UC-013)
2026-10-10T21:12:04.5876367Z   ---
2026-10-10T21:12:04.5876583Z   duration_ms: 0.507434
2026-10-10T21:12:04.5876811Z   type: 'test'
2026-10-10T21:12:04.5877005Z   ...
2026-10-10T21:12:04.5877639Z # Subtest: explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:12:04.5878496Z ok 950 - explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)
2026-10-10T21:12:04.5878954Z   ---
2026-10-10T21:12:04.5879151Z   duration_ms: 0.529896
2026-10-10T21:12:04.5880039Z   type: 'test'
2026-10-10T21:12:04.5880248Z   ...
2026-10-10T21:12:04.5880922Z # Subtest: startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:12:04.5882082Z ok 951 - startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product
2026-10-10T21:12:04.5882827Z   ---
2026-10-10T21:12:04.5883028Z   duration_ms: 2.955336
2026-10-10T21:12:04.5883251Z   type: 'test'
2026-10-10T21:12:04.5883463Z   ...
2026-10-10T21:12:04.5884004Z # Subtest: instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:12:04.5884748Z ok 952 - instanceOf — Pages identity through MOD-identifiers and the upstream fallback
2026-10-10T21:12:04.5885320Z   ---
2026-10-10T21:12:04.5885509Z   duration_ms: 0.226025
2026-10-10T21:12:04.5885723Z   type: 'test'
2026-10-10T21:12:04.5885918Z   ...
2026-10-10T21:12:04.5886574Z # Subtest: notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:12:04.5887742Z ok 953 - notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation
2026-10-10T21:12:04.5888287Z   ---
2026-10-10T21:12:04.5888476Z   duration_ms: 1.375085
2026-10-10T21:12:04.5888698Z   type: 'test'
2026-10-10T21:12:04.5888895Z   ...
2026-10-10T21:12:04.5889445Z # Subtest: explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:12:04.5890243Z ok 954 - explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation
2026-10-10T21:12:04.5891204Z   ---
2026-10-10T21:12:04.5891408Z   duration_ms: 0.921823
2026-10-10T21:12:04.5891631Z   type: 'test'
2026-10-10T21:12:04.5891830Z   ...
2026-10-10T21:12:04.5892612Z # Subtest: sourceSchemas — gives entry and links: links is the schema of a product's docs/sources.md, its table under the product's own title
2026-10-10T21:12:04.5894228Z ok 955 - sourceSchemas — gives entry and links: links is the schema of a product's docs/sources.md, its table under the product's own title
2026-10-10T21:12:04.5895094Z   ---
2026-10-10T21:12:04.5895309Z   duration_ms: 1.458172
2026-10-10T21:12:04.5895542Z   type: 'test'
2026-10-10T21:12:04.5895734Z   ...
2026-10-10T21:12:04.5896436Z # Subtest: links — a product's links file read with the links schema, rows with and without a part, and written back byte for byte
2026-10-10T21:12:04.5897468Z ok 956 - links — a product's links file read with the links schema, rows with and without a part, and written back byte for byte
2026-10-10T21:12:04.5898000Z   ---
2026-10-10T21:12:04.5898193Z   duration_ms: 3.079179
2026-10-10T21:12:04.5898420Z   type: 'test'
2026-10-10T21:12:04.5898609Z   ...
2026-10-10T21:12:04.5899313Z # Subtest: links — a row without its version or its hash is refused by writeDocument with DocumentError naming the row and the column
2026-10-10T21:12:04.5900361Z ok 957 - links — a row without its version or its hash is refused by writeDocument with DocumentError naming the row and the column
2026-10-10T21:12:04.5900913Z   ---
2026-10-10T21:12:04.5909821Z   duration_ms: 1.291778
2026-10-10T21:12:04.5910207Z   type: 'test'
2026-10-10T21:12:04.5910426Z   ...
2026-10-10T21:12:04.5911259Z # Subtest: links — this instance's docs/sources.md read with the links schema: its row naming SRC-vibe-coding at the version 2026-10-05
2026-10-10T21:12:04.5912952Z ok 958 - links — this instance's docs/sources.md read with the links schema: its row naming SRC-vibe-coding at the version 2026-10-05
2026-10-10T21:12:04.5913776Z   ---
2026-10-10T21:12:04.5913986Z   duration_ms: 0.320503
2026-10-10T21:12:04.5914220Z   type: 'test'
2026-10-10T21:12:04.5914417Z   ...
2026-10-10T21:12:04.5915813Z # Subtest: sourceSchemas — the entry's schema is read from the module's own source.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:12:04.5917759Z ok 959 - sourceSchemas — the entry's schema is read from the module's own source.schema.md: from the disk in Node, from its own address in a browser
2026-10-10T21:12:04.5918403Z   ---
2026-10-10T21:12:04.5918608Z   duration_ms: 41.213277
2026-10-10T21:12:04.5918838Z   type: 'test'
2026-10-10T21:12:04.5919027Z   ...
2026-10-10T21:12:04.5919794Z # Subtest: sourceSchemas — a register entry read through MOD-documents with the entry's schema: its front matter, \#\# Versions, \#\# Parts
2026-10-10T21:12:04.5920932Z ok 960 - sourceSchemas — a register entry read through MOD-documents with the entry's schema: its front matter, \#\# Versions, \#\# Parts
2026-10-10T21:12:04.5921500Z   ---
2026-10-10T21:12:04.5921692Z   duration_ms: 0.447411
2026-10-10T21:12:04.5921915Z   type: 'test'
2026-10-10T21:12:04.5922105Z   ...
2026-10-10T21:12:04.5923005Z # Subtest: sourceSchemas — the entry's schema holds the module file's rules: a licence, the closed kinds, three authorities, a standard's designation, versions that only grow
2026-10-10T21:12:04.5925283Z ok 961 - sourceSchemas — the entry's schema holds the module file's rules: a licence, the closed kinds, three authorities, a standard's designation, versions that only grow
2026-10-10T21:12:04.5926189Z   ---
2026-10-10T21:12:04.5926393Z   duration_ms: 3.843907
2026-10-10T21:12:04.5926616Z   type: 'test'
2026-10-10T21:12:04.5926804Z   ...
2026-10-10T21:12:04.5927623Z # Subtest: permittedPlaces — four entries: may be republished, any; restricted with places, those; restricted with none, none; unknown, as restricted
2026-10-10T21:12:04.5929359Z ok 962 - permittedPlaces — four entries: may be republished, any; restricted with places, those; restricted with none, none; unknown, as restricted
2026-10-10T21:12:04.5929989Z   ---
2026-10-10T21:12:04.5930189Z   duration_ms: 2.35121
2026-10-10T21:12:04.5930412Z   type: 'test'
2026-10-10T21:12:04.5930606Z   ...
2026-10-10T21:12:04.5931309Z # Subtest: permittedPlaces — this instance's entry SRC-vibe-coding, whose licence permits republishing, permits any place
2026-10-10T21:12:04.5932342Z ok 963 - permittedPlaces — this instance's entry SRC-vibe-coding, whose licence permits republishing, permits any place
2026-10-10T21:12:04.5932879Z   ---
2026-10-10T21:12:04.5933076Z   duration_ms: 0.386446
2026-10-10T21:12:04.5933300Z   type: 'test'
2026-10-10T21:12:04.5933498Z   ...
2026-10-10T21:12:04.5934006Z # Subtest: queues — an open, an approved and an in-SPEC entry, found past an impact table
2026-10-10T21:12:04.5935484Z ok 964 - queues — an open, an approved and an in-SPEC entry, found past an impact table
2026-10-10T21:12:04.5935925Z   ---
2026-10-10T21:12:04.5936122Z   duration_ms: 6.644923
2026-10-10T21:12:04.5936338Z   type: 'test'
2026-10-10T21:12:04.5936533Z   ...
2026-10-10T21:12:04.5936877Z # Subtest: queues — more than one queue, newest first
2026-10-10T21:12:04.5937313Z ok 965 - queues — more than one queue, newest first
2026-10-10T21:12:04.5937606Z   ---
2026-10-10T21:12:04.5937794Z   duration_ms: 2.284335
2026-10-10T21:12:04.5938010Z   type: 'test'
2026-10-10T21:12:04.5938203Z   ...
2026-10-10T21:12:04.5938850Z # Subtest: with skeleton.md unreadable on the disk, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:12:04.5940256Z ok 966 - with skeleton.md unreadable on the disk, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:12:04.5940806Z   ---
2026-10-10T21:12:04.5941000Z   duration_ms: 4.860922
2026-10-10T21:12:04.5941216Z   type: 'test'
2026-10-10T21:12:04.5941403Z   ...
2026-10-10T21:12:04.5942070Z # Subtest: with skeleton.md not served at the module's address, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:12:04.5943337Z ok 967 - with skeleton.md not served at the module's address, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason
2026-10-10T21:12:04.5943910Z   ---
2026-10-10T21:12:04.5944100Z   duration_ms: 27.536633
2026-10-10T21:12:04.5944323Z   type: 'test'
2026-10-10T21:12:04.5944520Z   ...
2026-10-10T21:12:04.5945447Z # Subtest: with skeleton.md readable, specSkeleton gives the same text as before
2026-10-10T21:12:04.5946099Z ok 968 - with skeleton.md readable, specSkeleton gives the same text as before
2026-10-10T21:12:04.5946491Z   ---
2026-10-10T21:12:04.5946692Z   duration_ms: 2.976947
2026-10-10T21:12:04.5946918Z   type: 'test'
2026-10-10T21:12:04.5947114Z   ...
2026-10-10T21:12:04.5947755Z # Subtest: parseSpec — the requirements of a SPEC with their four fields, their section and their line
2026-10-10T21:12:04.5948612Z ok 969 - parseSpec — the requirements of a SPEC with their four fields, their section and their line
2026-10-10T21:12:04.5949306Z   ---
2026-10-10T21:12:04.5949608Z   duration_ms: 5.904962
2026-10-10T21:12:04.5950104Z   type: 'test'
2026-10-10T21:12:04.5950510Z   ...
2026-10-10T21:12:04.5951987Z # Subtest: parseSpec — a source over several lines, and several sources split at `;`, with and without their parts
2026-10-10T21:12:04.5954146Z ok 970 - parseSpec — a source over several lines, and several sources split at `;`, with and without their parts
2026-10-10T21:12:04.5955693Z   ---
2026-10-10T21:12:04.5956629Z   duration_ms: 0.694065
2026-10-10T21:12:04.5957021Z   type: 'test'
2026-10-10T21:12:04.5957339Z   ...
2026-10-10T21:12:04.5958345Z # Subtest: parseSpec — a check naming several tests split at ` · `, and one at review naming none
2026-10-10T21:12:04.5959760Z ok 971 - parseSpec — a check naming several tests split at ` · `, and one at review naming none
2026-10-10T21:12:04.5960595Z   ---
2026-10-10T21:12:04.5960914Z   duration_ms: 0.635065
2026-10-10T21:12:04.5961303Z   type: 'test'
2026-10-10T21:12:04.5961624Z   ...
2026-10-10T21:12:04.5962570Z # Subtest: parseSpec — a requirement missing a field is read with that field null, not guessed
2026-10-10T21:12:04.5963964Z ok 972 - parseSpec — a requirement missing a field is read with that field null, not guessed
2026-10-10T21:12:04.5964422Z   ---
2026-10-10T21:12:04.5964746Z   duration_ms: 0.651485
2026-10-10T21:12:04.5965314Z   type: 'test'
2026-10-10T21:12:04.5965528Z   ...
2026-10-10T21:12:04.5966188Z # Subtest: parseSpec — the text of one section, such as a change queue's proposal, is read as a SPEC is read
2026-10-10T21:12:04.5967541Z ok 973 - parseSpec — the text of one section, such as a change queue's proposal, is read as a SPEC is read
2026-10-10T21:12:04.5968229Z   ---
2026-10-10T21:12:04.5968446Z   duration_ms: 0.545195
2026-10-10T21:12:04.5968679Z   type: 'test'
2026-10-10T21:12:04.5968882Z   ...
2026-10-10T21:12:04.5969576Z # Subtest: parseSpec — what a requirement constrains follows from the SPEC it stands in; no field of Requirement holds it
2026-10-10T21:12:04.5970591Z ok 974 - parseSpec — what a requirement constrains follows from the SPEC it stands in; no field of Requirement holds it
2026-10-10T21:12:04.5971103Z   ---
2026-10-10T21:12:04.5971296Z   duration_ms: 0.551678
2026-10-10T21:12:04.5971523Z   type: 'test'
2026-10-10T21:12:04.5971716Z   ...
2026-10-10T21:12:04.5972203Z # Subtest: specSkeleton — the title names the product: `\# <product> — Specification`
2026-10-10T21:12:04.5972907Z ok 975 - specSkeleton — the title names the product: `\# <product> — Specification`
2026-10-10T21:12:04.5973300Z   ---
2026-10-10T21:12:04.5973493Z   duration_ms: 1.460106
2026-10-10T21:12:04.5973718Z   type: 'test'
2026-10-10T21:12:04.5973909Z   ...
2026-10-10T21:12:04.5975100Z # Subtest: specSkeleton — a preamble says what a requirement is in this form: its name, source, rule and *Check:*
2026-10-10T21:12:04.5976153Z ok 976 - specSkeleton — a preamble says what a requirement is in this form: its name, source, rule and *Check:*
2026-10-10T21:12:04.5976856Z   ---
2026-10-10T21:12:04.5977071Z   duration_ms: 2.110428
2026-10-10T21:12:04.5977527Z   type: 'test'
2026-10-10T21:12:04.5977856Z   ...
2026-10-10T21:12:04.5979150Z # Subtest: specSkeleton — an empty first section, and no other section
2026-10-10T21:12:04.5979984Z ok 977 - specSkeleton — an empty first section, and no other section
2026-10-10T21:12:04.5980354Z   ---
2026-10-10T21:12:04.5980557Z   duration_ms: 1.158799
2026-10-10T21:12:04.5980803Z   type: 'test'
2026-10-10T21:12:04.5980994Z   ...
2026-10-10T21:12:04.5981382Z # Subtest: specSkeleton — reads as a SPEC without a requirement
2026-10-10T21:12:04.5981913Z ok 978 - specSkeleton — reads as a SPEC without a requirement
2026-10-10T21:12:04.5982229Z   ---
2026-10-10T21:12:04.5982418Z   duration_ms: 0.484461
2026-10-10T21:12:04.5982630Z   type: 'test'
2026-10-10T21:12:04.5982815Z   ...
2026-10-10T21:12:04.5983319Z # Subtest: specSkeleton — only the product is put in; the rest is the same for every product
2026-10-10T21:12:04.5984078Z ok 979 - specSkeleton — only the product is put in; the rest is the same for every product
2026-10-10T21:12:04.5984487Z   ---
2026-10-10T21:12:04.5984671Z   duration_ms: 0.373963
2026-10-10T21:12:04.5985110Z   type: 'test'
2026-10-10T21:12:04.5985392Z   ...
2026-10-10T21:12:04.5986212Z # Subtest: recordIndex: the records named in a tree, by identifier and by SPEC entry; any other name is unknown
2026-10-10T21:12:04.5987038Z ok 980 - recordIndex: the records named in a tree, by identifier and by SPEC entry; any other name is unknown
2026-10-10T21:12:04.5987702Z   ---
2026-10-10T21:12:04.5987891Z   duration_ms: 2.767483
2026-10-10T21:12:04.5988108Z   type: 'test'
2026-10-10T21:12:04.5988296Z   ...
2026-10-10T21:12:04.5989547Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — from the names, equal to reading every record, reading only where names cannot decide
2026-10-10T21:12:04.5990692Z ok 981 - STATUS IS DERIVED FROM THE RECORDS — from the names, equal to reading every record, reading only where names cannot decide
2026-10-10T21:12:04.5991242Z   ---
2026-10-10T21:12:04.5991439Z   duration_ms: 30.316369
2026-10-10T21:12:04.5991663Z   type: 'test'
2026-10-10T21:12:04.5991855Z   ...
2026-10-10T21:12:04.5992497Z # Subtest: counter-proof: a record named for the current blob whose content names another blob does not accept the file where it is read
2026-10-10T21:12:04.5993509Z ok 982 - counter-proof: a record named for the current blob whose content names another blob does not accept the file where it is read
2026-10-10T21:12:04.5994069Z   ---
2026-10-10T21:12:04.5994257Z   duration_ms: 3.569521
2026-10-10T21:12:04.5994471Z   type: 'test'
2026-10-10T21:12:04.5994661Z   ...
2026-10-10T21:12:04.5995649Z # Subtest: STATUS IS DERIVED FROM THE RECORDS — SPEC entries: decided ones read no record, undecided ones only their own
2026-10-10T21:12:04.5996890Z ok 983 - STATUS IS DERIVED FROM THE RECORDS — SPEC entries: decided ones read no record, undecided ones only their own
2026-10-10T21:12:04.5997568Z   ---
2026-10-10T21:12:04.5997768Z   duration_ms: 3.030037
2026-10-10T21:12:04.5997995Z   type: 'test'
2026-10-10T21:12:04.5998202Z   ...
2026-10-10T21:12:04.5998736Z # Subtest: readByBlob: a kept text that hashes to the SHA is used without reading; a text read is kept by its SHA
2026-10-10T21:12:04.5999549Z ok 984 - readByBlob: a kept text that hashes to the SHA is used without reading; a text read is kept by its SHA
2026-10-10T21:12:04.6009101Z   ---
2026-10-10T21:12:04.6009533Z   duration_ms: 1.251583
2026-10-10T21:12:04.6009964Z   type: 'test'
2026-10-10T21:12:04.6010359Z   ...
2026-10-10T21:12:04.6011564Z # Subtest: counter-proof: a kept text whose SHA does not match is read again and replaced; a text that does not match its SHA is not kept
2026-10-10T21:12:04.6013406Z ok 985 - counter-proof: a kept text whose SHA does not match is read again and replaced; a text that does not match its SHA is not kept
2026-10-10T21:12:04.6014415Z   ---
2026-10-10T21:12:04.6014761Z   duration_ms: 1.150383
2026-10-10T21:12:04.6015737Z   type: 'test'
2026-10-10T21:12:04.6016094Z   ...
2026-10-10T21:12:04.6017108Z # Subtest: readByBlob: a cache that fails at every step is passed over — the text is read
2026-10-10T21:12:04.6018527Z ok 986 - readByBlob: a cache that fails at every step is passed over — the text is read
2026-10-10T21:12:04.6019480Z   ---
2026-10-10T21:12:04.6019836Z   duration_ms: 3.145407
2026-10-10T21:12:04.6020232Z   type: 'test'
2026-10-10T21:12:04.6020582Z   ...
2026-10-10T21:12:04.6619369Z # Subtest: \#spec reads fresh current SPEC bytes and keeps queue history for empty or absent SPEC
2026-10-10T21:12:04.6621282Z ok 987 - \#spec reads fresh current SPEC bytes and keeps queue history for empty or absent SPEC
2026-10-10T21:12:04.6622538Z   ---
2026-10-10T21:12:04.6623233Z   duration_ms: 412.833742
2026-10-10T21:12:04.6623915Z   type: 'test'
2026-10-10T21:12:04.6624540Z   ...
2026-10-10T21:12:04.6869346Z # Subtest: the dashboard \#spec controls collapse sections and toggle a current requirement in place
2026-10-10T21:12:04.6883996Z ok 988 - the dashboard \#spec controls collapse sections and toggle a current requirement in place
2026-10-10T21:12:04.6885409Z   ---
2026-10-10T21:12:04.6886109Z   duration_ms: 394.981707
2026-10-10T21:12:04.6887104Z   type: 'test'
2026-10-10T21:12:04.6887729Z   ...
2026-10-10T21:12:05.0193963Z # Subtest: TST-281 UC-001 main flow stores a product token and adds the missing layout
2026-10-10T21:12:05.0200239Z ok 989 - TST-281 UC-001 main flow stores a product token and adds the missing layout
2026-10-10T21:12:05.0203375Z   ---
2026-10-10T21:12:05.0206475Z   duration_ms: 386.335008
2026-10-10T21:12:05.0208019Z   type: 'test'
2026-10-10T21:12:05.0211692Z   ...
2026-10-10T21:12:05.2708894Z # Subtest: TST-282 UC-001 alternatives 1a and 5b distinguish a synthetic click from a person's click
2026-10-10T21:12:05.2728710Z ok 990 - TST-282 UC-001 alternatives 1a and 5b distinguish a synthetic click from a person's click
2026-10-10T21:12:05.2746206Z   ---
2026-10-10T21:12:05.2746889Z   duration_ms: 251.013671
2026-10-10T21:12:05.2747421Z   type: 'test'
2026-10-10T21:12:05.2747903Z   ...
2026-10-10T21:12:06.0550333Z # Subtest: TST-284 UC-001 GitHub alternatives preserve the product and browser boundaries
2026-10-10T21:12:06.0576424Z ok 991 - TST-284 UC-001 GitHub alternatives preserve the product and browser boundaries
2026-10-10T21:12:06.0577502Z   ---
2026-10-10T21:12:06.0578000Z   duration_ms: 786.754942
2026-10-10T21:12:06.0578595Z   type: 'test'
2026-10-10T21:12:06.0579141Z   ...
2026-10-10T21:12:06.2915549Z # Subtest: TST-285 UC-001 GitLab alternatives use the product project token
2026-10-10T21:12:06.2926391Z ok 992 - TST-285 UC-001 GitLab alternatives use the product project token
2026-10-10T21:12:06.2927278Z   ---
2026-10-10T21:12:06.2927941Z   duration_ms: 236.353835
2026-10-10T21:12:06.2928523Z   type: 'test'
2026-10-10T21:12:06.2929027Z   ...
2026-10-10T21:12:06.3123344Z # Subtest: UC-002 main flow, step 1: the page opens with the table of the process model and the rules to be met, folded only after the first reading
2026-10-10T21:12:06.3137017Z ok 993 - UC-002 main flow, step 1: the page opens with the table of the process model and the rules to be met, folded only after the first reading
2026-10-10T21:12:06.3138550Z   ---
2026-10-10T21:12:06.3139092Z   duration_ms: 130.954432
2026-10-10T21:12:06.3139663Z   type: 'test'
2026-10-10T21:12:06.3140147Z   ...
2026-10-10T21:12:06.3141876Z # Subtest: UC-002 main flow, steps 1–2: the table, then the book's five models in their two groups, each with its risks, its example and its chapter
2026-10-10T21:12:06.3146321Z ok 994 - UC-002 main flow, steps 1–2: the table, then the book's five models in their two groups, each with its risks, its example and its chapter
2026-10-10T21:12:06.3147450Z   ---
2026-10-10T21:12:06.3147913Z   duration_ms: 34.640038
2026-10-10T21:12:06.3148485Z   type: 'test'
2026-10-10T21:12:06.3148945Z   ...
2026-10-10T21:12:06.3150778Z # Subtest: UC-002 main flow, steps 3–4: the author chooses Scrum; its roles, who may fill each and what it needs; only participants with every capability are offered, each with its place
2026-10-10T21:12:06.3153718Z ok 995 - UC-002 main flow, steps 3–4: the author chooses Scrum; its roles, who may fill each and what it needs; only participants with every capability are offered, each with its place
2026-10-10T21:12:06.3157018Z   ---
2026-10-10T21:12:06.3157538Z   duration_ms: 40.355442
2026-10-10T21:12:06.3158079Z   type: 'test'
2026-10-10T21:12:06.3158548Z   ...
2026-10-10T21:12:06.3159996Z # Subtest: UC-002 main flow, step 5: the phases, each gate with what it checks and who decides it; without a branch, work merges into the default branch
2026-10-10T21:12:06.3162200Z ok 996 - UC-002 main flow, step 5: the phases, each gate with what it checks and who decides it; without a branch, work merges into the default branch
2026-10-10T21:12:06.3163439Z   ---
2026-10-10T21:12:06.3163978Z   duration_ms: 57.464733
2026-10-10T21:12:06.3164577Z   type: 'test'
2026-10-10T21:12:06.3165401Z   ...
2026-10-10T21:12:06.3166525Z # Subtest: UC-002 main flow, step 5: the transitions between the phases, and which phases pair for verification
2026-10-10T21:12:06.3168757Z ok 997 - UC-002 main flow, step 5: the transitions between the phases, and which phases pair for verification
2026-10-10T21:12:06.3169768Z   ---
2026-10-10T21:12:06.3170244Z   duration_ms: 30.860569
2026-10-10T21:12:06.3170793Z   type: 'test'
2026-10-10T21:12:06.3171266Z   ...
2026-10-10T21:12:06.3172811Z # Subtest: UC-002 main flow, step 5: a sprint's branch of its own, and its merge into the default branch as the gate at its end, decided by the Product Owner after the review
2026-10-10T21:12:06.3175723Z ok 998 - UC-002 main flow, step 5: a sprint's branch of its own, and its merge into the default branch as the gate at its end, decided by the Product Owner after the review
2026-10-10T21:12:06.3177140Z   ---
2026-10-10T21:12:06.3177541Z   duration_ms: 30.102306
2026-10-10T21:12:06.3177949Z   type: 'test'
2026-10-10T21:12:06.3178298Z   ...
2026-10-10T21:12:06.3179350Z # Subtest: UC-002 main flow, step 6: the practices, each with the models it fits; adding one leaves the model as it is
2026-10-10T21:12:06.3180914Z ok 999 - UC-002 main flow, step 6: the practices, each with the models it fits; adding one leaves the model as it is
2026-10-10T21:12:06.3181775Z   ---
2026-10-10T21:12:06.3182114Z   duration_ms: 32.407333
2026-10-10T21:12:06.3182504Z   type: 'test'
2026-10-10T21:12:06.3182832Z   ...
2026-10-10T21:12:06.3183453Z # Subtest: UC-002 main flow, step 6: each practice says what it adds
2026-10-10T21:12:06.3184380Z ok 1000 - UC-002 main flow, step 6: each practice says what it adds
2026-10-10T21:12:06.3186198Z   ---
2026-10-10T21:12:06.3186569Z   duration_ms: 29.682764
2026-10-10T21:12:06.3186878Z   type: 'test'
2026-10-10T21:12:06.3187182Z   ...
2026-10-10T21:12:06.3188439Z # Subtest: UC-002 main flow, step 7: what the product's process requirements add, each marked with its requirement and its source
2026-10-10T21:12:06.3190584Z ok 1001 - UC-002 main flow, step 7: what the product's process requirements add, each marked with its requirement and its source
2026-10-10T21:12:06.3191615Z   ---
2026-10-10T21:12:06.3191973Z   duration_ms: 23.919655
2026-10-10T21:12:06.3192368Z   type: 'test'
2026-10-10T21:12:06.3192709Z   ...
2026-10-10T21:12:06.3193799Z # Subtest: UC-002 main flow, step 8: the Definition of Done, preset to the job rules, and the folded word on who meets it in Scrum
2026-10-10T21:12:06.3195792Z ok 1002 - UC-002 main flow, step 8: the Definition of Done, preset to the job rules, and the folded word on who meets it in Scrum
2026-10-10T21:12:06.3196797Z   ---
2026-10-10T21:12:06.3197140Z   duration_ms: 21.281792
2026-10-10T21:12:06.3197539Z   type: 'test'
2026-10-10T21:12:06.3197864Z   ...
2026-10-10T21:12:06.3199262Z # Subtest: UC-002 main flow, steps 3–9: the author's choices, then one click on Save commits the declaration to the product repository
2026-10-10T21:12:06.3201360Z ok 1003 - UC-002 main flow, steps 3–9: the author's choices, then one click on Save commits the declaration to the product repository
2026-10-10T21:12:06.3203294Z   ---
2026-10-10T21:12:06.3203670Z   duration_ms: 108.437704
2026-10-10T21:12:06.3204330Z   type: 'test'
2026-10-10T21:12:06.3204656Z   ...
2026-10-10T21:12:06.3205845Z # Subtest: UC-002 main flow: every choice carries a folded What is this? with a pointer to the book
2026-10-10T21:12:06.3207624Z ok 1004 - UC-002 main flow: every choice carries a folded What is this? with a pointer to the book
2026-10-10T21:12:06.3208427Z   ---
2026-10-10T21:12:06.3208923Z   duration_ms: 37.488533
2026-10-10T21:12:06.3209302Z   type: 'test'
2026-10-10T21:12:06.3209624Z   ...
2026-10-10T21:12:06.3211056Z # Subtest: UC-002 alternative flow 3a: the organisation's own process, a data file in the catalogue's format, is offered and used
2026-10-10T21:12:06.3213092Z ok 1005 - UC-002 alternative flow 3a: the organisation's own process, a data file in the catalogue's format, is offered and used
2026-10-10T21:12:06.3214265Z   ---
2026-10-10T21:12:06.3214752Z   duration_ms: 21.359349
2026-10-10T21:12:06.3215170Z   type: 'test'
2026-10-10T21:12:06.3215742Z   ...
2026-10-10T21:12:06.3217335Z # Subtest: UC-002 alternative flow 3b: changing the model lists the artifacts the new one no longer requires; none is deleted, and the process requirement keeps its gate
2026-10-10T21:12:06.3220014Z ok 1006 - UC-002 alternative flow 3b: changing the model lists the artifacts the new one no longer requires; none is deleted, and the process requirement keeps its gate
2026-10-10T21:12:06.3221819Z   ---
2026-10-10T21:12:06.3222145Z   duration_ms: 118.955936
2026-10-10T21:12:06.3222771Z   type: 'test'
2026-10-10T21:12:06.3223163Z   ...
2026-10-10T21:12:06.3224799Z # Subtest: UC-002 alternative flow 4a: a role that needs a person has none — Save stays disabled, and the role is named
2026-10-10T21:12:06.3227283Z ok 1007 - UC-002 alternative flow 4a: a role that needs a person has none — Save stays disabled, and the role is named
2026-10-10T21:12:06.3228506Z   ---
2026-10-10T21:12:06.3228909Z   duration_ms: 54.553124
2026-10-10T21:12:06.3229300Z   type: 'test'
2026-10-10T21:12:06.3230116Z   ...
2026-10-10T21:12:06.3231756Z # Subtest: UC-002 alternative flow 4b: no participant has the capabilities a role needs — the missing capability is named
2026-10-10T21:12:06.3234076Z ok 1008 - UC-002 alternative flow 4b: no participant has the capabilities a role needs — the missing capability is named
2026-10-10T21:12:06.3235324Z   ---
2026-10-10T21:12:06.3236090Z   duration_ms: 35.909825
2026-10-10T21:12:06.3236478Z   type: 'test'
2026-10-10T21:12:06.3237013Z   ...
2026-10-10T21:12:06.3238222Z # Subtest: UC-002 alternative flow 4b: the missing capability links to UC-017, to add a participant that has it
2026-10-10T21:12:06.3239987Z ok 1009 - UC-002 alternative flow 4b: the missing capability links to UC-017, to add a participant that has it
2026-10-10T21:12:06.3241082Z   ---
2026-10-10T21:12:06.3241660Z   duration_ms: 31.217223
2026-10-10T21:12:06.3242033Z   type: 'test'
2026-10-10T21:12:06.3242344Z   ...
2026-10-10T21:12:06.3244425Z # Subtest: UC-002 alternative flow 4c: a participant processes data where a linked source does not permit it — the source and the role are named, and the assignment stays possible
2026-10-10T21:12:06.3247822Z ok 1010 - UC-002 alternative flow 4c: a participant processes data where a linked source does not permit it — the source and the role are named, and the assignment stays possible
2026-10-10T21:12:06.3249306Z   ---
2026-10-10T21:12:06.3249947Z   duration_ms: 92.198896
2026-10-10T21:12:06.3250391Z   type: 'test'
2026-10-10T21:12:06.3250739Z   ...
2026-10-10T21:12:06.3252684Z # Subtest: UC-002 alternative flow 7a: no process requirements yet — the view says so; once one is accepted, its addition appears and the model stays
2026-10-10T21:12:06.3255361Z ok 1011 - UC-002 alternative flow 7a: no process requirements yet — the view says so; once one is accepted, its addition appears and the model stays
2026-10-10T21:12:06.3256978Z   ---
2026-10-10T21:12:06.3257601Z   duration_ms: 49.496532
2026-10-10T21:12:06.3258347Z   type: 'test'
2026-10-10T21:12:06.3258731Z   ...
2026-10-10T21:12:06.3261021Z # Subtest: UC-002 alternative flow 7b: a process requirement needs a gate the model does not have — the gate is shown being added, and where; the model stays Kanban
2026-10-10T21:12:06.3264090Z ok 1012 - UC-002 alternative flow 7b: a process requirement needs a gate the model does not have — the gate is shown being added, and where; the model stays Kanban
2026-10-10T21:12:06.3265589Z   ---
2026-10-10T21:12:06.3265960Z   duration_ms: 17.697782
2026-10-10T21:12:06.3266730Z   type: 'test'
2026-10-10T21:12:06.3267090Z   ...
2026-10-10T21:12:08.7518531Z # {"method":"POST","path":"/v1/probes/endpoint-test","status":200,"duration":16}
2026-10-10T21:12:08.8123596Z # Subtest: TST-266001: public Settings sends a local model test through the real composed Bridge
2026-10-10T21:12:08.8146454Z ok 1013 - TST-266001: public Settings sends a local model test through the real composed Bridge
2026-10-10T21:12:08.8185415Z   ---
2026-10-10T21:12:08.8193075Z   duration_ms: 463.243391
2026-10-10T21:12:08.8215601Z   type: 'test'
2026-10-10T21:12:08.8241909Z   ...
2026-10-10T21:12:08.8302350Z # Subtest: TST-292001: Settings Configure saves an OpenAI-compatible endpoint before one short request
2026-10-10T21:12:08.8326313Z ok 1014 - TST-292001: Settings Configure saves an OpenAI-compatible endpoint before one short request
2026-10-10T21:12:08.8351502Z   ---
2026-10-10T21:12:08.8375532Z   duration_ms: 382.401465
2026-10-10T21:12:08.8384611Z   type: 'test'
2026-10-10T21:12:08.8448057Z   ...
2026-10-10T21:12:08.8505282Z # Subtest: TST-292002: the dashboard sends Anthropic's one short Messages request
2026-10-10T21:12:08.8510483Z ok 1015 - TST-292002: the dashboard sends Anthropic's one short Messages request
2026-10-10T21:12:08.8511538Z   ---
2026-10-10T21:12:08.8512168Z   duration_ms: 268.855974
2026-10-10T21:12:08.8512861Z   type: 'test'
2026-10-10T21:12:08.8513450Z   ...
2026-10-10T21:12:08.8514451Z # Subtest: TST-292003: a browser refusal is actionable through CI and Bridge
2026-10-10T21:12:08.8516066Z ok 1016 - TST-292003: a browser refusal is actionable through CI and Bridge
2026-10-10T21:12:08.8516928Z   ---
2026-10-10T21:12:08.8517456Z   duration_ms: 293.27791
2026-10-10T21:12:08.8518038Z   type: 'test'
2026-10-10T21:12:08.8518550Z   ...
2026-10-10T21:12:08.8519634Z # Subtest: TST-292004: refused key persists through reload until Clear removes the stored endpoint
2026-10-10T21:12:08.8521241Z ok 1017 - TST-292004: refused key persists through reload until Clear removes the stored endpoint
2026-10-10T21:12:08.8522240Z   ---
2026-10-10T21:12:08.8522756Z   duration_ms: 350.25218
2026-10-10T21:12:08.8523356Z   type: 'test'
2026-10-10T21:12:08.8523903Z   ...
2026-10-10T21:12:08.8525099Z # Subtest: TST-292011: Settings Change opens the stored endpoint's named public route
2026-10-10T21:12:08.8526572Z ok 1018 - TST-292011: Settings Change opens the stored endpoint's named public route
2026-10-10T21:12:08.8527568Z   ---
2026-10-10T21:12:08.8528139Z   duration_ms: 196.890309
2026-10-10T21:12:08.8528788Z   type: 'test'
2026-10-10T21:12:08.8529340Z   ...
2026-10-10T21:12:08.8530357Z # Subtest: step 1: the line Notifications sits in the section *this browser*, and says off
2026-10-10T21:12:08.8531844Z ok 1019 - step 1: the line Notifications sits in the section *this browser*, and says off
2026-10-10T21:12:08.8532827Z   ---
2026-10-10T21:12:08.8533388Z   duration_ms: 316.02033
2026-10-10T21:12:08.8534033Z   type: 'test'
2026-10-10T21:12:08.8534553Z   ...
2026-10-10T21:12:08.8536079Z # Subtest: step 1: Switch on asks the browser's permission once, directly on the click, then offers Test and Switch off
2026-10-10T21:12:08.8537952Z ok 1020 - step 1: Switch on asks the browser's permission once, directly on the click, then offers Test and Switch off
2026-10-10T21:12:08.8539088Z   ---
2026-10-10T21:12:08.8539617Z   duration_ms: 171.277744
2026-10-10T21:12:08.8540275Z   type: 'test'
2026-10-10T21:12:08.8540824Z   ...
2026-10-10T21:12:08.8542273Z # Subtest: step 2: the check of the instance connects with the instance's own stored token
2026-10-10T21:12:08.8543742Z ok 1021 - step 2: the check of the instance connects with the instance's own stored token
2026-10-10T21:12:08.8544708Z   ---
2026-10-10T21:12:08.8545613Z   duration_ms: 63.046537
2026-10-10T21:12:08.8546302Z   type: 'test'
2026-10-10T21:12:08.8546907Z   ...
2026-10-10T21:12:08.8548186Z # Subtest: TST-279 step 2: the check also reaches each product this browser keeps, with that product's own token
2026-10-10T21:12:08.8550113Z ok 1022 - TST-279 step 2: the check also reaches each product this browser keeps, with that product's own token
2026-10-10T21:12:08.8551312Z   ---
2026-10-10T21:12:08.8551954Z   duration_ms: 70.680639
2026-10-10T21:12:08.8552663Z   type: 'test'
2026-10-10T21:12:08.8553288Z   ...
2026-10-10T21:12:08.8554622Z # Subtest: step 1 into step 3: the first check after Switch on tells nothing, even though something already waits
2026-10-10T21:12:08.8556873Z ok 1023 - step 1 into step 3: the first check after Switch on tells nothing, even though something already waits
2026-10-10T21:12:08.8558102Z   ---
2026-10-10T21:12:08.8558725Z   duration_ms: 115.716199
2026-10-10T21:12:08.8559395Z   type: 'test'
2026-10-10T21:12:08.8559992Z   ...
2026-10-10T21:12:08.8561209Z # Subtest: step 3 (and 3a): a file come to wait is notified once, naming it and an address this page resolves
2026-10-10T21:12:08.8562908Z ok 1024 - step 3 (and 3a): a file come to wait is notified once, naming it and an address this page resolves
2026-10-10T21:12:08.8564352Z   ---
2026-10-10T21:12:08.8565204Z   duration_ms: 106.399675
2026-10-10T21:12:08.8565871Z   type: 'test'
2026-10-10T21:12:08.8566409Z   ...
2026-10-10T21:12:08.8567597Z # Subtest: step 3: more than three of one kind in one repository give one notification of their number
2026-10-10T21:12:08.8569414Z ok 1025 - step 3: more than three of one kind in one repository give one notification of their number
2026-10-10T21:12:08.8570552Z   ---
2026-10-10T21:12:08.8571169Z   duration_ms: 108.288056
2026-10-10T21:12:08.8572038Z   type: 'test'
2026-10-10T21:12:08.8572750Z   ...
2026-10-10T21:12:08.8574437Z # Subtest: step 4: what was notified is kept — nothing twice while unchanged, a file changed again comes to wait anew
2026-10-10T21:12:08.8576921Z ok 1026 - step 4: what was notified is kept — nothing twice while unchanged, a file changed again comes to wait anew
2026-10-10T21:12:08.8578051Z   ---
2026-10-10T21:12:08.8578604Z   duration_ms: 209.611307
2026-10-10T21:12:08.8579220Z   type: 'test'
2026-10-10T21:12:08.8579751Z   ...
2026-10-10T21:12:08.8581129Z # Subtest: 1a: the person, or the browser, refuses — the line says blocked, and where to allow it; nothing is stored
2026-10-10T21:12:08.8583082Z ok 1027 - 1a: the person, or the browser, refuses — the line says blocked, and where to allow it; nothing is stored
2026-10-10T21:12:08.8584178Z   ---
2026-10-10T21:12:08.8584717Z   duration_ms: 157.198193
2026-10-10T21:12:08.8585547Z   type: 'test'
2026-10-10T21:12:08.8586103Z   ...
2026-10-10T21:12:08.8587212Z # Subtest: 1b: on an iPhone or iPad not opened from the Home Screen, the line says so and how to add it
2026-10-10T21:12:08.8588863Z ok 1028 - 1b: on an iPhone or iPad not opened from the Home Screen, the line says so and how to add it
2026-10-10T21:12:08.8589875Z   ---
2026-10-10T21:12:08.8590408Z   duration_ms: 113.847711
2026-10-10T21:12:08.8591001Z   type: 'test'
2026-10-10T21:12:08.8591531Z   ...
2026-10-10T21:12:08.8592975Z # Subtest: 2a/2b: while not due, opening the page makes no check — the last check time is left exactly as it was
2026-10-10T21:12:08.8595240Z ok 1029 - 2a/2b: while not due, opening the page makes no check — the last check time is left exactly as it was
2026-10-10T21:12:08.8596546Z   ---
2026-10-10T21:12:08.8597162Z   duration_ms: 56.89006
2026-10-10T21:12:08.8597890Z   type: 'test'
2026-10-10T21:12:08.8598483Z   ...
2026-10-10T21:12:08.8599857Z # Subtest: 2c: a server that cannot be reached is skipped until the next check; nothing lost, nothing notified in between
2026-10-10T21:12:08.8602111Z ok 1030 - 2c: a server that cannot be reached is skipped until the next check; nothing lost, nothing notified in between
2026-10-10T21:12:08.8603372Z   ---
2026-10-10T21:12:08.8604004Z   duration_ms: 206.515828
2026-10-10T21:12:08.8604698Z   type: 'test'
2026-10-10T21:12:08.8605574Z   ...
2026-10-10T21:12:08.8606519Z # Subtest: 4a: Switch off stops the checks and forgets what was notified
2026-10-10T21:12:08.8607815Z ok 1031 - 4a: Switch off stops the checks and forgets what was notified
2026-10-10T21:12:08.8608745Z   ---
2026-10-10T21:12:08.8609334Z   duration_ms: 156.158648
2026-10-10T21:12:08.8609980Z   type: 'test'
2026-10-10T21:12:08.8610591Z   ...
2026-10-10T21:12:08.8611727Z # Subtest: TST-293001: UC-047 derives a release report only after its candidate run ends
2026-10-10T21:12:08.8613265Z ok 1032 - TST-293001: UC-047 derives a release report only after its candidate run ends
2026-10-10T21:12:08.8614415Z   ---
2026-10-10T21:12:08.8615389Z   duration_ms: 482.888385
2026-10-10T21:12:08.8616464Z   type: 'test'
2026-10-10T21:12:08.8617126Z   ...
2026-10-10T21:12:08.8618312Z # Subtest: a '//' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8619828Z ok 1033 - a '//' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8620811Z   ---
2026-10-10T21:12:08.8621404Z   duration_ms: 2.96755
2026-10-10T21:12:08.8622052Z   type: 'test'
2026-10-10T21:12:08.8622674Z   ...
2026-10-10T21:12:08.8624131Z # Subtest: a '\#' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8625884Z ok 1034 - a '\#' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8626856Z   ---
2026-10-10T21:12:08.8627546Z   duration_ms: 0.349678
2026-10-10T21:12:08.8628235Z   type: 'test'
2026-10-10T21:12:08.8628871Z   ...
2026-10-10T21:12:08.8630006Z # Subtest: a '--' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8631492Z ok 1035 - a '--' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8632488Z   ---
2026-10-10T21:12:08.8633123Z   duration_ms: 0.231415
2026-10-10T21:12:08.8633877Z   type: 'test'
2026-10-10T21:12:08.8634501Z   ...
2026-10-10T21:12:08.8635861Z # Subtest: a ';' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8637347Z ok 1036 - a ';' declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8638305Z   ---
2026-10-10T21:12:08.8639021Z   duration_ms: 0.215255
2026-10-10T21:12:08.8639694Z   type: 'test'
2026-10-10T21:12:08.8640344Z   ...
2026-10-10T21:12:08.8641569Z # Subtest: a ' *' block-comment declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8643253Z ok 1037 - a ' *' block-comment declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8644292Z   ---
2026-10-10T21:12:08.8645117Z   duration_ms: 0.217008
2026-10-10T21:12:08.8645814Z   type: 'test'
2026-10-10T21:12:08.8646402Z   ...
2026-10-10T21:12:08.8647608Z # Subtest: a Markdown heading declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8649311Z ok 1038 - a Markdown heading declaration is read with every key — MOD-test-document
2026-10-10T21:12:08.8650345Z   ---
2026-10-10T21:12:08.8650845Z   duration_ms: 0.322005
2026-10-10T21:12:08.8651424Z   type: 'test'
2026-10-10T21:12:08.8652017Z   ...
2026-10-10T21:12:08.8653245Z # Subtest: a declaration missing a key is read with that key null — MOD-test-document
2026-10-10T21:12:08.8655153Z ok 1039 - a declaration missing a key is read with that key null — MOD-test-document
2026-10-10T21:12:08.8656149Z   ---
2026-10-10T21:12:08.8656654Z   duration_ms: 0.297109
2026-10-10T21:12:08.8657224Z   type: 'test'
2026-10-10T21:12:08.8657767Z   ...
2026-10-10T21:12:08.8659074Z # Subtest: a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document
2026-10-10T21:12:08.8660915Z ok 1040 - a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document
2026-10-10T21:12:08.8662313Z   ---
2026-10-10T21:12:08.8662877Z   duration_ms: 0.291888
2026-10-10T21:12:08.8663484Z   type: 'test'
2026-10-10T21:12:08.8664023Z   ...
2026-10-10T21:12:08.8665538Z # Subtest: a following line whose value holds ' · ' does not end the declaration — MOD-test-document
2026-10-10T21:12:08.8667292Z ok 1041 - a following line whose value holds ' · ' does not end the declaration — MOD-test-document
2026-10-10T21:12:08.8668449Z   ---
2026-10-10T21:12:08.8669129Z   duration_ms: 0.491505
2026-10-10T21:12:08.8669839Z   type: 'test'
2026-10-10T21:12:08.8670457Z   ...
2026-10-10T21:12:08.8671616Z # Subtest: a file without a declaration yields none — MOD-test-document
2026-10-10T21:12:08.8673142Z ok 1042 - a file without a declaration yields none — MOD-test-document
2026-10-10T21:12:08.8673948Z   ---
2026-10-10T21:12:08.8674440Z   duration_ms: 0.414489
2026-10-10T21:12:08.8675202Z   type: 'test'
2026-10-10T21:12:08.8675696Z   ...
2026-10-10T21:12:08.8676654Z # Subtest: TST-289001: a refused pending-report lookup is named before the new-release form
2026-10-10T21:12:08.8678093Z ok 1043 - TST-289001: a refused pending-report lookup is named before the new-release form
2026-10-10T21:12:08.8679183Z   ---
2026-10-10T21:12:08.8679783Z   duration_ms: 1.526901
2026-10-10T21:12:08.8680379Z   type: 'test'
2026-10-10T21:12:08.8680904Z   ...
2026-10-10T21:12:08.8682198Z # Subtest: TST-289002: a completed recorded candidate reopens without writes and accepts through the existing service
2026-10-10T21:12:08.8684455Z ok 1044 - TST-289002: a completed recorded candidate reopens without writes and accepts through the existing service
2026-10-10T21:12:08.8686009Z   ---
2026-10-10T21:12:08.8686603Z   duration_ms: 19.676905
2026-10-10T21:12:08.8687331Z   type: 'test'
2026-10-10T21:12:08.8687919Z   ...
2026-10-10T21:12:08.8689023Z # Subtest: TST-289003: a selected product without a pending report keeps the new-release form
2026-10-10T21:12:08.8690639Z ok 1045 - TST-289003: a selected product without a pending report keeps the new-release form
2026-10-10T21:12:08.8691745Z   ---
2026-10-10T21:12:08.8692434Z   duration_ms: 0.541127
2026-10-10T21:12:08.8693091Z   type: 'test'
2026-10-10T21:12:08.8693711Z   ...
2026-10-10T21:12:08.8694789Z # Subtest: TST-289004: a pending candidate with missing results remains incomplete
2026-10-10T21:12:08.8696534Z ok 1046 - TST-289004: a pending candidate with missing results remains incomplete
2026-10-10T21:12:08.8697583Z   ---
2026-10-10T21:12:08.8698169Z   duration_ms: 1.371719
2026-10-10T21:12:08.8698829Z   type: 'test'
2026-10-10T21:12:08.8699408Z   ...
2026-10-10T21:12:08.8701387Z # Subtest: release — main flow: version and entry before Start, the candidate and its run after it, the report once the run has ended, Accept and release in one click
2026-10-10T21:12:08.8704346Z ok 1047 - release — main flow: version and entry before Start, the candidate and its run after it, the report once the run has ended, Accept and release in one click
2026-10-10T21:12:08.8706252Z   ---
2026-10-10T21:12:08.8706789Z   duration_ms: 92.056228
2026-10-10T21:12:08.8715865Z   type: 'test'
2026-10-10T21:12:08.8716407Z   ...
2026-10-10T21:12:08.8717868Z # Subtest: release — 1a: the year that changed restarts the version at YYYY.1.0
2026-10-10T21:12:08.8719218Z ok 1048 - release — 1a: the year that changed restarts the version at YYYY.1.0
2026-10-10T21:12:08.8720032Z   ---
2026-10-10T21:12:08.8720600Z   duration_ms: 2.955446
2026-10-10T21:12:08.8721269Z   type: 'test'
2026-10-10T21:12:08.8721921Z   ...
2026-10-10T21:12:08.8723128Z # Subtest: release — 2a: only the implementing participant can run the release tests
2026-10-10T21:12:08.8724769Z ok 1049 - release — 2a: only the implementing participant can run the release tests
2026-10-10T21:12:08.8726045Z   ---
2026-10-10T21:12:08.8726695Z   duration_ms: 11.804825
2026-10-10T21:12:08.8727347Z   type: 'test'
2026-10-10T21:12:08.8727928Z   ...
2026-10-10T21:12:08.8729650Z # Subtest: release — 3a/3b: a red level and a worse rate ask for a reason first; without one Accept and release is refused, with one it releases
2026-10-10T21:12:08.8732547Z ok 1050 - release — 3a/3b: a red level and a worse rate ask for a reason first; without one Accept and release is refused, with one it releases
2026-10-10T21:12:08.8733951Z   ---
2026-10-10T21:12:08.8734561Z   duration_ms: 67.211266
2026-10-10T21:12:08.8735519Z   type: 'test'
2026-10-10T21:12:08.8736291Z   ...
2026-10-10T21:12:08.8737891Z # Subtest: release — 4a: a tag that already exists stops the release, naming 4a; the existing tag is not moved
2026-10-10T21:12:08.8739955Z ok 1051 - release — 4a: a tag that already exists stops the release, naming 4a; the existing tag is not moved
2026-10-10T21:12:08.8741141Z   ---
2026-10-10T21:12:08.8741774Z   duration_ms: 37.282205
2026-10-10T21:12:08.8742482Z   type: 'test'
2026-10-10T21:12:08.8743309Z   ...
2026-10-10T21:12:08.8745260Z # Subtest: release — 4b: a default branch that moved on while the suite ran still releases, tagged on the tested commit
2026-10-10T21:12:08.8747724Z ok 1052 - release — 4b: a default branch that moved on while the suite ran still releases, tagged on the tested commit
2026-10-10T21:12:08.8749121Z   ---
2026-10-10T21:12:08.8749774Z   duration_ms: 48.165998
2026-10-10T21:12:08.8750469Z   type: 'test'
2026-10-10T21:12:08.8751044Z   ...
2026-10-10T21:12:08.8752282Z # Subtest: defaultSchedule — the book's default, read with the schema, marked as the default
2026-10-10T21:12:08.8754081Z ok 1053 - defaultSchedule — the book's default, read with the schema, marked as the default
2026-10-10T21:12:08.8755723Z   ---
2026-10-10T21:12:08.8756351Z   duration_ms: 3.698253
2026-10-10T21:12:08.8757003Z   type: 'test'
2026-10-10T21:12:08.8757594Z   ...
2026-10-10T21:12:08.8758748Z # Subtest: scheduleSchema — a product's own schedule, read with the schema
2026-10-10T21:12:08.8760475Z ok 1054 - scheduleSchema — a product's own schedule, read with the schema
2026-10-10T21:12:08.8761512Z   ---
2026-10-10T21:12:08.8762100Z   duration_ms: 2.586493
2026-10-10T21:12:08.8762759Z   type: 'test'
2026-10-10T21:12:08.8763395Z   ...
2026-10-10T21:12:08.8764660Z # Subtest: scheduleSchema — a schedule of another shape, named by MOD-documents' findings
2026-10-10T21:12:08.8766709Z ok 1055 - scheduleSchema — a schedule of another shape, named by MOD-documents' findings
2026-10-10T21:12:08.8767778Z   ---
2026-10-10T21:12:08.8768449Z   duration_ms: 0.707771
2026-10-10T21:12:08.8769119Z   type: 'test'
2026-10-10T21:12:08.8770099Z   ...
2026-10-10T21:12:08.8771655Z # Subtest: parseFrontMatter — a text with front matter: its fields, their order, the body and the line it begins on
2026-10-10T21:12:08.8774017Z ok 1056 - parseFrontMatter — a text with front matter: its fields, their order, the body and the line it begins on
2026-10-10T21:12:08.8775535Z   ---
2026-10-10T21:12:08.8776131Z   duration_ms: 3.214995
2026-10-10T21:12:08.8776734Z   type: 'test'
2026-10-10T21:12:08.8777262Z   ...
2026-10-10T21:12:08.8778363Z # Subtest: parseFrontMatter — CR LF line ends, values trimmed, and `[]` as an empty list
2026-10-10T21:12:08.8779911Z ok 1057 - parseFrontMatter — CR LF line ends, values trimmed, and `[]` as an empty list
2026-10-10T21:12:08.8786376Z   ---
2026-10-10T21:12:08.8787060Z   duration_ms: 0.585621
2026-10-10T21:12:08.8787717Z   type: 'test'
2026-10-10T21:12:08.8788296Z   ...
2026-10-10T21:12:08.8789772Z # Subtest: parseFrontMatter — a text without front matter, and one whose front matter is broken, are all body
2026-10-10T21:12:08.8791866Z ok 1058 - parseFrontMatter — a text without front matter, and one whose front matter is broken, are all body
2026-10-10T21:12:08.8793093Z   ---
2026-10-10T21:12:08.8793725Z   duration_ms: 0.395644
2026-10-10T21:12:08.8794407Z   type: 'test'
2026-10-10T21:12:08.8795255Z   ...
2026-10-10T21:12:08.8796508Z # Subtest: formatFrontMatter — what parseFrontMatter read gives back the same bytes
2026-10-10T21:12:08.8798243Z ok 1059 - formatFrontMatter — what parseFrontMatter read gives back the same bytes
2026-10-10T21:12:08.8799242Z   ---
2026-10-10T21:12:08.8799882Z   duration_ms: 0.647006
2026-10-10T21:12:08.8800852Z   type: 'test'
2026-10-10T21:12:08.8801465Z   ...
2026-10-10T21:12:08.8803047Z # Subtest: formatFrontMatter — keys in `order`, a list one item per line, an empty list as `key:` alone, the body unchanged
2026-10-10T21:12:08.8805621Z ok 1060 - formatFrontMatter — keys in `order`, a list one item per line, an empty list as `key:` alone, the body unchanged
2026-10-10T21:12:08.8806927Z   ---
2026-10-10T21:12:08.8807589Z   duration_ms: 0.368523
2026-10-10T21:12:08.8818251Z   type: 'test'
2026-10-10T21:12:08.8819203Z   ...
2026-10-10T21:12:08.8820896Z # Subtest: formatFrontMatter — a key not of the form [a-z][a-z0-9_-]*, or a value holding a line break, throws a TypeError
2026-10-10T21:12:08.8823121Z ok 1061 - formatFrontMatter — a key not of the form [a-z][a-z0-9_-]*, or a value holding a line break, throws a TypeError
2026-10-10T21:12:08.8824383Z   ---
2026-10-10T21:12:08.8825265Z   duration_ms: 1.002595
2026-10-10T21:12:08.8825947Z   type: 'test'
2026-10-10T21:12:08.8826566Z   ...
2026-10-10T21:12:08.8827981Z # Subtest: finding and formatFinding — the module file's example, as data and as its one line of text
2026-10-10T21:12:08.8829940Z ok 1062 - finding and formatFinding — the module file's example, as data and as its one line of text
2026-10-10T21:12:08.8831008Z   ---
2026-10-10T21:12:08.8831603Z   duration_ms: 0.380165
2026-10-10T21:12:08.8832305Z   type: 'test'
2026-10-10T21:12:08.8832939Z   ...
2026-10-10T21:12:08.8834176Z # Subtest: parseFinding — a finding written in its one text form is read back unchanged
2026-10-10T21:12:08.8836427Z ok 1063 - parseFinding — a finding written in its one text form is read back unchanged
2026-10-10T21:12:08.8837501Z   ---
2026-10-10T21:12:08.8838140Z   duration_ms: 2.677454
2026-10-10T21:12:08.8838807Z   type: 'test'
2026-10-10T21:12:08.8839410Z   ...
2026-10-10T21:12:08.8840508Z # Subtest: finding — a kind, a line or a rule out of its form throws a TypeError
2026-10-10T21:12:08.8842117Z ok 1064 - finding — a kind, a line or a rule out of its form throws a TypeError
2026-10-10T21:12:08.8843169Z   ---
2026-10-10T21:12:08.8843804Z   duration_ms: 3.793933
2026-10-10T21:12:08.8844494Z   type: 'test'
2026-10-10T21:12:08.8845349Z   ...
2026-10-10T21:12:08.8846530Z # Subtest: parseFinding — null for any line of another form
2026-10-10T21:12:08.8847943Z ok 1065 - parseFinding — null for any line of another form
2026-10-10T21:12:08.8848829Z   ---
2026-10-10T21:12:08.8849463Z   duration_ms: 0.767403
2026-10-10T21:12:08.8850118Z   type: 'test'
2026-10-10T21:12:08.8850720Z   ...
2026-10-10T21:12:08.8852006Z # Subtest: blobSha — git's blob SHA of a text, the same as git hash-object gives for its bytes
2026-10-10T21:12:08.8853789Z ok 1066 - blobSha — git's blob SHA of a text, the same as git hash-object gives for its bytes
2026-10-10T21:12:08.8855112Z   ---
2026-10-10T21:12:08.8855740Z   duration_ms: 56.768362
2026-10-10T21:12:08.8856406Z   type: 'test'
2026-10-10T21:12:08.8856998Z   ...
2026-10-10T21:12:08.8858210Z # Subtest: blobSha — the known blobs, and a text hashed as given, line ends included
2026-10-10T21:12:08.8859895Z ok 1067 - blobSha — the known blobs, and a text hashed as given, line ends included
2026-10-10T21:12:08.8860919Z   ---
2026-10-10T21:12:08.8861540Z   duration_ms: 7.732177
2026-10-10T21:12:08.8862196Z   type: 'test'
2026-10-10T21:12:08.8862786Z   ...
2026-10-10T21:12:08.8864119Z # Subtest: historyMarks — withdrawals, edit stamps and dates, each with its line and its kind
2026-10-10T21:12:08.8866216Z ok 1068 - historyMarks — withdrawals, edit stamps and dates, each with its line and its kind
2026-10-10T21:12:08.8867338Z   ---
2026-10-10T21:12:08.8867942Z   duration_ms: 5.835541
2026-10-10T21:12:08.8868675Z   type: 'test'
2026-10-10T21:12:08.8869267Z   ...
2026-10-10T21:12:08.8870344Z # Subtest: historyMarks — the same marks in a text with CR LF line ends
2026-10-10T21:12:08.8871850Z ok 1069 - historyMarks — the same marks in a text with CR LF line ends
2026-10-10T21:12:08.8872816Z   ---
2026-10-10T21:12:08.8873402Z   duration_ms: 0.474411
2026-10-10T21:12:08.8874352Z   type: 'test'
2026-10-10T21:12:08.8875173Z   ...
2026-10-10T21:12:08.8876137Z # Subtest: historyMarks — none in a text without them
2026-10-10T21:12:08.8877334Z ok 1070 - historyMarks — none in a text without them
2026-10-10T21:12:08.8878151Z   ---
2026-10-10T21:12:08.8878756Z   duration_ms: 0.653959
2026-10-10T21:12:08.8879411Z   type: 'test'
2026-10-10T21:12:08.8879988Z   ...
2026-10-10T21:12:08.8881223Z # Subtest: historyMarks — a date of a change in its three forms, each marked dated-change
2026-10-10T21:12:08.8882961Z ok 1071 - historyMarks — a date of a change in its three forms, each marked dated-change
2026-10-10T21:12:08.8883956Z   ---
2026-10-10T21:12:08.8884495Z   duration_ms: 0.249689
2026-10-10T21:12:08.8885316Z   type: 'test'
2026-10-10T21:12:08.8885863Z   ...
2026-10-10T21:12:08.8887242Z # Subtest: historyMarks — a retrieval date, a version, a release, a measurement and a date in a table's cell are no mark
2026-10-10T21:12:08.8889304Z ok 1072 - historyMarks — a retrieval date, a version, a release, a measurement and a date in a table's cell are no mark
2026-10-10T21:12:08.8890430Z   ---
2026-10-10T21:12:08.8891003Z   duration_ms: 0.277542
2026-10-10T21:12:08.8891585Z   type: 'test'
2026-10-10T21:12:08.8892124Z   ...
2026-10-10T21:12:08.8893282Z # Subtest: lineDiff — every line of both texts, in order, each with its line before and after
2026-10-10T21:12:08.8894803Z ok 1073 - lineDiff — every line of both texts, in order, each with its line before and after
2026-10-10T21:12:08.8896235Z   ---
2026-10-10T21:12:08.8896769Z   duration_ms: 0.755461
2026-10-10T21:12:08.8897358Z   type: 'test'
2026-10-10T21:12:08.8897885Z   ...
2026-10-10T21:12:08.8898855Z # Subtest: lineDiff — as few added and removed lines as the two texts allow
2026-10-10T21:12:08.8900166Z ok 1074 - lineDiff — as few added and removed lines as the two texts allow
2026-10-10T21:12:08.8900999Z   ---
2026-10-10T21:12:08.8901516Z   duration_ms: 0.705857
2026-10-10T21:12:08.8902099Z   type: 'test'
2026-10-10T21:12:08.8902669Z   ...
2026-10-10T21:12:08.8903756Z # Subtest: lineDiff — a text that changed only its line endings shows no difference
2026-10-10T21:12:08.8905376Z ok 1075 - lineDiff — a text that changed only its line endings shows no difference
2026-10-10T21:12:08.8906244Z   ---
2026-10-10T21:12:08.8906758Z   duration_ms: 0.3617
2026-10-10T21:12:08.8907321Z   type: 'test'
2026-10-10T21:12:08.8907971Z   ...
2026-10-10T21:12:08.8908780Z # Subtest: lineDiff — an empty text has no line
2026-10-10T21:12:08.8909751Z ok 1076 - lineDiff — an empty text has no line
2026-10-10T21:12:08.8910474Z   ---
2026-10-10T21:12:08.8911071Z   duration_ms: 0.232688
2026-10-10T21:12:08.8911753Z   type: 'test'
2026-10-10T21:12:08.8912340Z   ...
2026-10-10T21:12:08.8913406Z # Subtest: the requirements of SPEC.md are nodes — MOD-trace-graph
2026-10-10T21:12:08.8915073Z ok 1077 - the requirements of SPEC.md are nodes — MOD-trace-graph
2026-10-10T21:12:08.8916021Z   ---
2026-10-10T21:12:08.8916655Z   duration_ms: 3.667265
2026-10-10T21:12:08.8917346Z   type: 'test'
2026-10-10T21:12:08.8917922Z   ...
2026-10-10T21:12:08.8919340Z # Subtest: the tests of a test file are nodes, with a guards edge from each to what it guards — MOD-trace-graph
2026-10-10T21:12:08.8921363Z ok 1078 - the tests of a test file are nodes, with a guards edge from each to what it guards — MOD-trace-graph
2026-10-10T21:12:08.8922537Z   ---
2026-10-10T21:12:08.8923151Z   duration_ms: 1.325532
2026-10-10T21:12:08.8923800Z   type: 'test'
2026-10-10T21:12:08.8924424Z   ...
2026-10-10T21:12:08.8925995Z # Subtest: a file that cannot be read is listed in unread, with the reason — MOD-trace-graph
2026-10-10T21:12:08.8927900Z ok 1079 - a file that cannot be read is listed in unread, with the reason — MOD-trace-graph
2026-10-10T21:12:08.8928966Z   ---
2026-10-10T21:12:08.8929879Z   duration_ms: 0.341031
2026-10-10T21:12:08.8930525Z   type: 'test'
2026-10-10T21:12:08.8931110Z   ...
2026-10-10T21:12:08.8932711Z # Subtest: tracesTo gives the tests that guard a requirement, and none for a requirement that no test guards — MOD-trace-graph
2026-10-10T21:12:08.8935615Z ok 1080 - tracesTo gives the tests that guard a requirement, and none for a requirement that no test guards — MOD-trace-graph
2026-10-10T21:12:08.8936831Z   ---
2026-10-10T21:12:08.8937360Z   duration_ms: 0.879454
2026-10-10T21:12:08.8937940Z   type: 'test'
2026-10-10T21:12:08.8938476Z   ...
2026-10-10T21:12:08.8939973Z # Subtest: UC-025 step 5, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a module a gap names is marked, a module no gap names is not
2026-10-10T21:12:08.8942198Z ok 1081 - UC-025 step 5, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a module a gap names is marked, a module no gap names is not
2026-10-10T21:12:08.8943453Z   ---
2026-10-10T21:12:08.8944066Z   duration_ms: 2.390704
2026-10-10T21:12:08.8944718Z   type: 'test'
2026-10-10T21:12:08.8945585Z   ...
2026-10-10T21:12:08.8947189Z # Subtest: UC-025 step 4 and 5 — several gaps naming the same module mark it once; a gap naming no drawn module marks nothing
2026-10-10T21:12:08.8949457Z ok 1082 - UC-025 step 4 and 5 — several gaps naming the same module mark it once; a gap naming no drawn module marks nothing
2026-10-10T21:12:08.8950738Z   ---
2026-10-10T21:12:08.8951341Z   duration_ms: 1.27136
2026-10-10T21:12:08.8951984Z   type: 'test'
2026-10-10T21:12:08.8952589Z   ...
2026-10-10T21:12:08.8954595Z # Subtest: UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used interface an existing module does not provide is drawn as an arrow ending in a box marked missing
2026-10-10T21:12:08.8958179Z ok 1083 - UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used interface an existing module does not provide is drawn as an arrow ending in a box marked missing
2026-10-10T21:12:08.8959741Z   ---
2026-10-10T21:12:08.8960359Z   duration_ms: 0.539945
2026-10-10T21:12:08.8961038Z   type: 'test'
2026-10-10T21:12:08.8961635Z   ...
2026-10-10T21:12:08.8963398Z # Subtest: UC-025 step 5 — the text for 52 modules with 400 uses, every module also marked by a gap, stays below Mermaid's limit of 50,000 characters
2026-10-10T21:12:08.8966285Z ok 1084 - UC-025 step 5 — the text for 52 modules with 400 uses, every module also marked by a gap, stays below Mermaid's limit of 50,000 characters
2026-10-10T21:12:08.8967718Z   ---
2026-10-10T21:12:08.8968412Z   duration_ms: 4.911477
2026-10-10T21:12:08.8969061Z   type: 'test'
2026-10-10T21:12:08.8969664Z   ...
2026-10-10T21:12:08.8971072Z # Subtest: UC-025 step 5 — one box per module, showing its identifier and title, whatever its title holds
2026-10-10T21:12:08.8973030Z ok 1085 - UC-025 step 5 — one box per module, showing its identifier and title, whatever its title holds
2026-10-10T21:12:08.8974188Z   ---
2026-10-10T21:12:08.8974794Z   duration_ms: 3.973731
2026-10-10T21:12:08.8975722Z   type: 'test'
2026-10-10T21:12:08.8976321Z   ...
2026-10-10T21:12:08.8978215Z # Subtest: UC-025 step 5, A MODULE BELONGS TO ONE SUBSYSTEM — one box per subsystem holding its modules; the subsystem is the first decision a module follows
2026-10-10T21:12:08.8981026Z ok 1086 - UC-025 step 5, A MODULE BELONGS TO ONE SUBSYSTEM — one box per subsystem holding its modules; the subsystem is the first decision a module follows
2026-10-10T21:12:08.8982427Z   ---
2026-10-10T21:12:08.8982974Z   duration_ms: 0.475734
2026-10-10T21:12:08.8983705Z   type: 'test'
2026-10-10T21:12:08.8984340Z   ...
2026-10-10T21:12:08.8986028Z # Subtest: UC-025 step 5 — one arrow per pair of a module and a module it uses, however many of its interfaces it uses
2026-10-10T21:12:08.8988185Z ok 1087 - UC-025 step 5 — one arrow per pair of a module and a module it uses, however many of its interfaces it uses
2026-10-10T21:12:08.8989429Z   ---
2026-10-10T21:12:08.8990042Z   duration_ms: 0.283804
2026-10-10T21:12:08.8990702Z   type: 'test'
2026-10-10T21:12:08.8991315Z   ...
2026-10-10T21:12:08.8992953Z # Subtest: UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used module that has no file is drawn as one box marked missing
2026-10-10T21:12:08.8995510Z ok 1088 - UC-025 5a, MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a used module that has no file is drawn as one box marked missing
2026-10-10T21:12:08.8997095Z   ---
2026-10-10T21:12:08.8997704Z   duration_ms: 0.587314
2026-10-10T21:12:08.8998370Z   type: 'test'
2026-10-10T21:12:08.8998915Z   ...
2026-10-10T21:12:08.9000703Z # Subtest: UC-025 step 5 — the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters, however many interfaces each use names
2026-10-10T21:12:08.9003311Z ok 1089 - UC-025 step 5 — the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters, however many interfaces each use names
2026-10-10T21:12:08.9004740Z   ---
2026-10-10T21:12:08.9005620Z   duration_ms: 6.902367
2026-10-10T21:12:08.9006300Z   type: 'test'
2026-10-10T21:12:08.9006871Z   ...
2026-10-10T21:12:08.9008118Z # Subtest: the public trace/specification route reads the pinned SPEC and lists each requirement in file order
2026-10-10T21:12:08.9010018Z ok 1090 - the public trace/specification route reads the pinned SPEC and lists each requirement in file order
2026-10-10T21:12:08.9011250Z   ---
2026-10-10T21:12:08.9011849Z   duration_ms: 4.842815
2026-10-10T21:12:08.9012526Z   type: 'test'
2026-10-10T21:12:08.9013099Z   ...
2026-10-10T21:12:08.9014257Z # Subtest: selecting a requirement renders its four fields safely without navigating to a queue
2026-10-10T21:12:08.9016234Z ok 1091 - selecting a requirement renders its four fields safely without navigating to a queue
2026-10-10T21:12:08.9017290Z   ---
2026-10-10T21:12:08.9018104Z   duration_ms: 22.431885
2026-10-10T21:12:08.9018732Z   type: 'test'
2026-10-10T21:12:08.9019305Z   ...
2026-10-10T21:12:08.9020401Z # Subtest: section headings start collapsed and independently toggle their requirement lists
2026-10-10T21:12:08.9021984Z ok 1092 - section headings start collapsed and independently toggle their requirement lists
2026-10-10T21:12:08.9023027Z   ---
2026-10-10T21:12:08.9023648Z   duration_ms: 0.908859
2026-10-10T21:12:08.9024263Z   type: 'test'
2026-10-10T21:12:08.9024803Z   ...
2026-10-10T21:12:08.9026011Z # Subtest: a requirement name toggles its row-local detail closed and open again
2026-10-10T21:12:08.9027326Z ok 1093 - a requirement name toggles its row-local detail closed and open again
2026-10-10T21:12:08.9028213Z   ---
2026-10-10T21:12:08.9028733Z   duration_ms: 6.099147
2026-10-10T21:12:08.9029319Z   type: 'test'
2026-10-10T21:12:08.9029850Z   ...
2026-10-10T21:12:08.9030868Z # Subtest: an absent or empty SPEC has an explicit empty state and rendering offers no write
2026-10-10T21:12:08.9032342Z ok 1094 - an absent or empty SPEC has an explicit empty state and rendering offers no write
2026-10-10T21:12:08.9033290Z   ---
2026-10-10T21:12:08.9033800Z   duration_ms: 0.343205
2026-10-10T21:12:08.9034382Z   type: 'test'
2026-10-10T21:12:08.9035144Z   ...
2026-10-10T21:12:12.8240057Z # Subtest: TST-284001: ensureKey creates the Bridge Ed25519 pair with matching public data
2026-10-10T21:12:12.8241701Z ok 1095 - TST-284001: ensureKey creates the Bridge Ed25519 pair with matching public data
2026-10-10T21:12:12.8242558Z   ---
2026-10-10T21:12:12.8242841Z   duration_ms: 3657.78738
2026-10-10T21:12:12.8243101Z   type: 'test'
2026-10-10T21:12:12.8243323Z   ...
2026-10-10T21:12:12.8247956Z # Subtest: TST-284002: ensureKey keeps the exact existing pair and private-file mode
2026-10-10T21:12:12.8249838Z ok 1096 - TST-284002: ensureKey keeps the exact existing pair and private-file mode
2026-10-10T21:12:12.8250420Z   ---
2026-10-10T21:12:12.8250673Z   duration_ms: 357.857003
2026-10-10T21:12:12.8250977Z   type: 'test'
2026-10-10T21:12:12.8251333Z   ...
2026-10-10T21:12:12.8253804Z # Subtest: TST-284003: ensureKey reports a controlled unwritable folder
2026-10-10T21:12:12.8256252Z ok 1097 - TST-284003: ensureKey reports a controlled unwritable folder
2026-10-10T21:12:12.8257127Z   ---
2026-10-10T21:12:12.8257633Z   duration_ms: 148.482459
2026-10-10T21:12:12.8258211Z   type: 'test'
2026-10-10T21:12:12.8258724Z   ...
2026-10-10T21:12:14.9121940Z # Subtest: TST-286001: public runtime exposes the exact opening state before a dynamic unavailable SSH port fails
2026-10-10T21:12:14.9124377Z ok 1098 - TST-286001: public runtime exposes the exact opening state before a dynamic unavailable SSH port fails
2026-10-10T21:12:14.9125854Z   ---
2026-10-10T21:12:14.9126374Z   duration_ms: 344.974828
2026-10-10T21:12:14.9126953Z   type: 'test'
2026-10-10T21:12:14.9127449Z   ...
2026-10-10T21:12:14.9144304Z # Subtest: TST-286002: runtime refuses a non-loopback reverse plan before forwarding
2026-10-10T21:12:14.9147441Z ok 1099 - TST-286002: runtime refuses a non-loopback reverse plan before forwarding
2026-10-10T21:12:14.9148515Z   ---
2026-10-10T21:12:14.9149241Z   duration_ms: 347.014483
2026-10-10T21:12:14.9149667Z   type: 'test'
2026-10-10T21:12:14.9149989Z   ...
2026-10-10T21:12:14.9150770Z # Subtest: TST-286003: reverse forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:12:14.9151954Z ok 1100 - TST-286003: reverse forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:12:14.9152686Z   ---
2026-10-10T21:12:14.9153017Z   duration_ms: 622.358949
2026-10-10T21:12:14.9153390Z   type: 'test'
2026-10-10T21:12:14.9153698Z   ...
2026-10-10T21:12:14.9154459Z # Subtest: TST-286004: forward forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:12:14.9155857Z ok 1101 - TST-286004: forward forwarding carries exact bytes through real ssh2 loopback
2026-10-10T21:12:14.9156572Z   ---
2026-10-10T21:12:14.9156885Z   duration_ms: 509.77255
2026-10-10T21:12:14.9157518Z   type: 'test'
2026-10-10T21:12:14.9157830Z   ...
2026-10-10T21:12:14.9158424Z # Subtest: TST-286005: changed host key is refused before forwarding
2026-10-10T21:12:14.9159307Z ok 1102 - TST-286005: changed host key is refused before forwarding
2026-10-10T21:12:14.9159877Z   ---
2026-10-10T21:12:14.9160197Z   duration_ms: 591.811375
2026-10-10T21:12:14.9160569Z   type: 'test'
2026-10-10T21:12:14.9160876Z   ...
2026-10-10T21:12:14.9163461Z # Subtest: TST-286006: an occupied forward listener fails without closing another authenticated tunnel
2026-10-10T21:12:14.9165144Z ok 1103 - TST-286006: an occupied forward listener fails without closing another authenticated tunnel
2026-10-10T21:12:14.9165969Z   ---
2026-10-10T21:12:14.9166286Z   duration_ms: 515.793855
2026-10-10T21:12:14.9166663Z   type: 'test'
2026-10-10T21:12:14.9166975Z   ...
2026-10-10T21:12:14.9167927Z # Subtest: TST-286007: authentication and unreachable failures are isolated from an open authenticated tunnel
2026-10-10T21:12:14.9169448Z ok 1104 - TST-286007: authentication and unreachable failures are isolated from an open authenticated tunnel
2026-10-10T21:12:14.9170308Z   ---
2026-10-10T21:12:14.9170615Z   duration_ms: 444.101851
2026-10-10T21:12:14.9170985Z   type: 'test'
2026-10-10T21:12:14.9171294Z   ...
2026-10-10T21:12:14.9171994Z # Subtest: TST-286008: reconnect delays grow and close cancels the next reconnect
2026-10-10T21:12:14.9173062Z ok 1105 - TST-286008: reconnect delays grow and close cancels the next reconnect
2026-10-10T21:12:14.9173734Z   ---
2026-10-10T21:12:14.9174039Z   duration_ms: 1188.74478
2026-10-10T21:12:14.9174403Z   type: 'test'
2026-10-10T21:12:14.9174707Z   ...
2026-10-10T21:12:14.9175705Z # Subtest: TST-286009: refused forward channels leave no listener for a later client after close
2026-10-10T21:12:14.9176980Z ok 1106 - TST-286009: refused forward channels leave no listener for a later client after close
2026-10-10T21:12:14.9177736Z   ---
2026-10-10T21:12:14.9178041Z   duration_ms: 830.927749
2026-10-10T21:12:14.9178409Z   type: 'test'
2026-10-10T21:12:14.9178723Z   ...
2026-10-10T21:12:14.9187955Z # Subtest: TST-286010: supplied runtime tunnelHandlers answer through the authenticated Bridge route
2026-10-10T21:12:14.9189621Z ok 1107 - TST-286010: supplied runtime tunnelHandlers answer through the authenticated Bridge route
2026-10-10T21:12:14.9190562Z   ---
2026-10-10T21:12:14.9190972Z   duration_ms: 278.320793
2026-10-10T21:12:14.9191488Z   type: 'test'
2026-10-10T21:12:14.9192044Z   ...
2026-10-10T21:12:14.9192902Z # Subtest: TST-286011: runtime refuses a non-loopback forward plan before forwarding
2026-10-10T21:12:14.9194391Z ok 1108 - TST-286011: runtime refuses a non-loopback forward plan before forwarding
2026-10-10T21:12:14.9195383Z   ---
2026-10-10T21:12:14.9195734Z   duration_ms: 235.892561
2026-10-10T21:12:14.9196148Z   type: 'test'
2026-10-10T21:12:14.9196490Z   ...
2026-10-10T21:12:14.9197601Z # Subtest: TST-286012: ensureKey regenerates malformed generated Ed25519 output without replacing existing invalid files
2026-10-10T21:12:14.9199361Z ok 1109 - TST-286012: ensureKey regenerates malformed generated Ed25519 output without replacing existing invalid files
2026-10-10T21:12:14.9200389Z   ---
2026-10-10T21:12:14.9200772Z   duration_ms: 283.29689
2026-10-10T21:12:14.9201203Z   type: 'test'
2026-10-10T21:12:14.9201572Z   ...
2026-10-10T21:12:14.9305880Z # Subtest: planSchemas.backlogOrder — an order whose table Item names items is read as those items, in the table's order
2026-10-10T21:12:14.9316756Z ok 1110 - planSchemas.backlogOrder — an order whose table Item names items is read as those items, in the table's order
2026-10-10T21:12:14.9330964Z   ---
2026-10-10T21:12:14.9333580Z   duration_ms: 3.809512
2026-10-10T21:12:14.9345483Z   type: 'test'
2026-10-10T21:12:14.9346255Z   ...
2026-10-10T21:12:14.9348143Z # Subtest: planSchemas.backlogOrder — a row whose cell is no item's identifier is named as a finding of that row
2026-10-10T21:12:14.9350212Z ok 1111 - planSchemas.backlogOrder — a row whose cell is no item's identifier is named as a finding of that row
2026-10-10T21:12:14.9352199Z   ---
2026-10-10T21:12:14.9352927Z   duration_ms: 2.665662
2026-10-10T21:12:14.9354435Z   type: 'test'
2026-10-10T21:12:14.9354835Z   ...
2026-10-10T21:12:14.9356583Z # Subtest: planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order
2026-10-10T21:12:14.9358794Z ok 1112 - planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order
2026-10-10T21:12:14.9359912Z   ---
2026-10-10T21:12:14.9360248Z   duration_ms: 1.18557
2026-10-10T21:12:14.9360623Z   type: 'test'
2026-10-10T21:12:14.9360845Z   ...
2026-10-10T21:12:14.9361052Z 1..1112
2026-10-10T21:12:14.9361242Z # tests 1112
2026-10-10T21:12:14.9361451Z # suites 0
2026-10-10T21:12:14.9361641Z # pass 1099
2026-10-10T21:12:14.9361844Z # fail 5
2026-10-10T21:12:14.9362032Z # cancelled 0
2026-10-10T21:12:14.9362248Z # skipped 0
2026-10-10T21:12:14.9362438Z # todo 8
2026-10-10T21:12:14.9362679Z # duration_ms 63870.735315
2026-10-10T21:12:14.9421343Z ##[error]Process completed with exit code 1.
````

**Python checks** — SHA-256 `9146757696cde71f92d2923a0db66ca77e4aa3f6a8adf92501488e8b58dc170f`.

```text
﻿2026-10-10T21:11:14.7190057Z ##[group]Run cd tests && python3 -m unittest -v
2026-10-10T21:11:14.7190538Z [36;1mcd tests && python3 -m unittest -v[0m
2026-10-10T21:11:14.7538710Z shell: /usr/bin/bash -e {0}
2026-10-10T21:11:14.7539053Z ##[endgroup]
2026-10-10T21:11:14.9920779Z test_the_applier_passes_over_architecture_records (test_apply_approvals.ApplierPassesOverArchitectureRecords.test_the_applier_passes_over_architecture_records) ... ok
2026-10-10T21:11:14.9960682Z test_approved_proposal_is_written_verbatim (test_apply_approvals.ApplyTests.test_approved_proposal_is_written_verbatim) ... ok
2026-10-10T21:11:15.0026154Z test_blob_sha_equals_git (test_apply_approvals.ApplyTests.test_blob_sha_equals_git) ... ok
2026-10-10T21:11:15.0037265Z test_readme_with_example_records_is_not_a_record (test_apply_approvals.ApplyTests.test_readme_with_example_records_is_not_a_record) ... ok
2026-10-10T21:11:15.0064695Z test_record_anchor_must_match_the_queue (test_apply_approvals.ApplyTests.test_record_anchor_must_match_the_queue) ... ok
2026-10-10T21:11:15.0090589Z test_record_outside_a_queue_is_refused (test_apply_approvals.ApplyTests.test_record_outside_a_queue_is_refused) ... ok
2026-10-10T21:11:15.0123774Z test_second_run_changes_nothing (test_apply_approvals.ApplyTests.test_second_run_changes_nothing) ... ok
2026-10-10T21:11:15.0153915Z test_stale_proposal_is_not_applied (test_apply_approvals.ApplyTests.test_stale_proposal_is_not_applied) ... ok
2026-10-10T21:11:15.0183612Z test_stale_section_is_not_applied (test_apply_approvals.ApplyTests.test_stale_section_is_not_applied) ... ok
2026-10-10T21:11:15.0211818Z test_unknown_queue_is_refused_not_crashed (test_apply_approvals.ApplyTests.test_unknown_queue_is_refused_not_crashed) ... ok
2026-10-10T21:11:15.0223391Z test_use_case_records_are_left_alone (test_apply_approvals.ApplyTests.test_use_case_records_are_left_alone) ... ok
2026-10-10T21:11:15.0900705Z test_dashboard_writes_what_the_workflow_writes (test_apply_approvals.DashboardCommitTests.test_dashboard_writes_what_the_workflow_writes) ... ok
2026-10-10T21:11:15.1495701Z test_record_whose_decision_row_exists_is_skipped (test_apply_approvals.DashboardCommitTests.test_record_whose_decision_row_exists_is_skipped) ... ok
2026-10-10T21:11:15.2162002Z test_a_proposal_with_crlf_line_ends_is_written_byte_for_byte (test_apply_approvals.EngineKeepsTheBytes.test_a_proposal_with_crlf_line_ends_is_written_byte_for_byte) ... ok
2026-10-10T21:11:15.2788891Z test_a_section_with_cr_bytes_that_did_not_change_is_replaced (test_apply_approvals.EngineKeepsTheBytes.test_a_section_with_cr_bytes_that_did_not_change_is_replaced) ... ok
2026-10-10T21:11:15.3395745Z test_counter_proof_a_changed_section_with_cr_bytes_is_still_refused (test_apply_approvals.EngineKeepsTheBytes.test_counter_proof_a_changed_section_with_cr_bytes_is_still_refused) ... ok
2026-10-10T21:11:15.4038046Z test_cr_bytes_outside_the_approved_section_stay (test_apply_approvals.EngineKeepsTheBytes.test_cr_bytes_outside_the_approved_section_stay) ... ok
2026-10-10T21:11:15.5307134Z test_a_second_run_writes_nothing_on_either_side (test_apply_approvals.Twin.test_a_second_run_writes_nothing_on_either_side) ... ok
2026-10-10T21:11:15.7735286Z test_the_cases_apply_refuse_and_pass_over (test_apply_approvals.Twin.test_the_cases_apply_refuse_and_pass_over) ... ok
2026-10-10T21:11:17.8599551Z test_the_engine_writes_the_bytes_and_the_report_of_the_python_tool (test_apply_approvals.Twin.test_the_engine_writes_the_bytes_and_the_report_of_the_python_tool) ... ok
2026-10-10T21:11:17.9238730Z test_twin_on_a_proposal_with_crlf_line_ends (test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_proposal_with_crlf_line_ends) ... expected failure
2026-10-10T21:11:17.9867612Z test_twin_on_a_section_with_cr_bytes (test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_section_with_cr_bytes) ... expected failure
2026-10-10T21:11:18.0560018Z test_twin_on_a_spec_with_cr_bytes_outside_the_section (test_apply_approvals.TwinWhereThePythonToolIsWrong.test_twin_on_a_spec_with_cr_bytes_outside_the_section) ... expected failure
2026-10-10T21:11:18.0571085Z test_a_record_of_a_renamed_use_case_stays_valid (test_approval_records.ApprovalRecords.test_a_record_of_a_renamed_use_case_stays_valid) ... ok
2026-10-10T21:11:18.0578552Z test_counter_proof (test_approval_records.ApprovalRecords.test_counter_proof) ... ok
2026-10-10T21:11:18.0780031Z test_every_record_is_well_formed (test_approval_records.ApprovalRecords.test_every_record_is_well_formed) ... ok
2026-10-10T21:11:18.0788139Z test_records_of_architecture_decisions_and_modules (test_approval_records.ApprovalRecords.test_records_of_architecture_decisions_and_modules) ... ok
2026-10-10T21:11:18.0790478Z test_a_file_that_is_neither_is_named (test_architecture_files.ArchitectureFiles.test_a_file_that_is_neither_is_named) ... ok
2026-10-10T21:11:18.0814301Z test_counter_proof_decision (test_architecture_files.ArchitectureFiles.test_counter_proof_decision) ... ok
2026-10-10T21:11:18.0824525Z test_counter_proof_module (test_architecture_files.ArchitectureFiles.test_counter_proof_module) ... ok
2026-10-10T21:11:18.0826781Z test_empty_lists_are_allowed_where_the_SPEC_reports_gaps (test_architecture_files.ArchitectureFiles.test_empty_lists_are_allowed_where_the_SPEC_reports_gaps) ... ok
2026-10-10T21:11:18.1006154Z test_every_architecture_file_of_the_instance_is_complete (test_architecture_files.ArchitectureFiles.test_every_architecture_file_of_the_instance_is_complete) ... ok
2026-10-10T21:11:18.1010829Z test_the_fixture_files_are_complete (test_architecture_files.ArchitectureFiles.test_the_fixture_files_are_complete) ... ok
2026-10-10T21:11:18.1022703Z test_counter_proof_a_diagram_that_is_not_mermaid (test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_a_diagram_that_is_not_mermaid) ... ok
2026-10-10T21:11:18.1024937Z test_counter_proof_a_file_that_is_not_markdown (test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_a_file_that_is_not_markdown) ... ok
2026-10-10T21:11:18.1026736Z test_counter_proof_mermaid_and_text_about_images_pass (test_artifact_format.ArtifactsAreMarkdown.test_counter_proof_mermaid_and_text_about_images_pass) ... ok
2026-10-10T21:11:18.3545568Z test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams (test_artifact_format.ArtifactsAreMarkdown.test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams) ... ok
2026-10-10T21:11:18.4168643Z test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams (test_artifact_format.ArtifactsAreMarkdown.test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams) ... ok
2026-10-10T21:11:18.4172010Z test_the_image_reader_finds_the_image_of_a_use_case_fixture (test_artifact_format.ArtifactsAreMarkdown.test_the_image_reader_finds_the_image_of_a_use_case_fixture) ... ok
2026-10-10T21:11:18.4174713Z test_this_repository_has_mermaid_diagrams_to_find (test_artifact_format.ArtifactsAreMarkdown.test_this_repository_has_mermaid_diagrams_to_find) ... ok
2026-10-10T21:11:18.7850636Z test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields.TestAgentMsOwnBacklog.test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from) ... ok
2026-10-10T21:11:18.8853345Z test_a_bug_realises_the_requirement_the_code_violates (test_backlog_item_fields.TestAnItemFromAnIssue.test_a_bug_realises_the_requirement_the_code_violates) ... ok
2026-10-10T21:11:18.9872448Z test_a_change_realises_the_requirements_of_its_queue_entries_each_once (test_backlog_item_fields.TestAnItemFromAnIssue.test_a_change_realises_the_requirements_of_its_queue_entries_each_once) ... ok
2026-10-10T21:11:19.0362130Z test_an_issue_without_a_description_gives_an_empty_outcome (test_backlog_item_fields.TestAnItemFromAnIssue.test_an_issue_without_a_description_gives_an_empty_outcome) ... ok
2026-10-10T21:11:19.2352145Z test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing (test_backlog_item_fields.TestAnItemFromAnIssue.test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing) ... ok
2026-10-10T21:11:19.3831780Z test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item (test_backlog_item_fields.TestAnItemFromAnIssue.test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item) ... ok
2026-10-10T21:11:19.4901901Z test_a_use_case_counts_only_when_the_product_has_it (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_a_use_case_counts_only_when_the_product_has_it) ... ok
2026-10-10T21:11:19.5476816Z test_checking_leaves_the_item_as_it_was (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_checking_leaves_the_item_as_it_was) ... ok
2026-10-10T21:11:19.6006106Z test_counter_proof_another_identifier_in_capitals_is_no_requirement_name (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_counter_proof_another_identifier_in_capitals_is_no_requirement_name) ... ok
2026-10-10T21:11:20.2421264Z test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_every_broken_item_yields_exactly_the_findings_expected_json_names) ... ok
2026-10-10T21:11:20.4805899Z test_the_items_of_the_fixture_backlog_have_no_finding (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_the_items_of_the_fixture_backlog_have_no_finding) ... ok
2026-10-10T21:11:20.6906928Z test_without_known_names_only_the_form_of_a_name_is_checked (test_backlog_item_fields.TestAnItemNamesWhatItRealises.test_without_known_names_only_the_form_of_a_name_is_checked) ... ok
2026-10-10T21:11:20.7512163Z test_an_item_with_the_outcome_of_another_is_flagged (test_backlog_item_fields.TestAnItemThatRestatesAnother.test_an_item_with_the_outcome_of_another_is_flagged) ... ok
2026-10-10T21:11:20.8205975Z test_an_item_with_the_title_of_another_is_flagged (test_backlog_item_fields.TestAnItemThatRestatesAnother.test_an_item_with_the_title_of_another_is_flagged) ... ok
2026-10-10T21:11:20.9383036Z test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome (test_backlog_item_fields.TestAnItemThatRestatesAnother.test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome) ... ok
2026-10-10T21:11:20.9387146Z test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria (test_backlog_item_fields.TestTheJobThatDraftsItems.test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria) ... ok
2026-10-10T21:11:21.0448503Z test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged (test_backlog_item_fields.TestTheJobThatDraftsItems.test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged) ... ok
2026-10-10T21:11:21.0920655Z test_the_checks_it_names_are_functions_of_the_module (test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_checks_it_names_are_functions_of_the_module) ... ok
2026-10-10T21:11:21.0924020Z test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items (test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items) ... ok
2026-10-10T21:11:21.0933945Z test_the_prompt_fills_every_input_and_nothing_else (test_backlog_item_fields.TestTheJobThatDraftsItems.test_the_prompt_fills_every_input_and_nothing_else) ... ok
2026-10-10T21:11:21.1819118Z test_every_item_of_this_repository_is_read_without_a_problem (test_backlog_layout.TestAgentMsOwnBacklog.test_every_item_of_this_repository_is_read_without_a_problem) ... ok
2026-10-10T21:11:21.1887213Z test_the_backlog_is_markdown_under_docs_backlog (test_backlog_layout.TestAgentMsOwnBacklog.test_the_backlog_is_markdown_under_docs_backlog) ... ok
2026-10-10T21:11:21.2851622Z test_the_order_of_this_repository_places_every_item_once (test_backlog_layout.TestAgentMsOwnBacklog.test_the_order_of_this_repository_places_every_item_once) ... expected failure
2026-10-10T21:11:21.3335568Z test_a_section_the_item_lacks_is_read_as_empty (test_backlog_layout.TestAnItemIsRead.test_a_section_the_item_lacks_is_read_as_empty) ... ok
2026-10-10T21:11:21.3842264Z test_an_item_is_read_into_its_parts (test_backlog_layout.TestAnItemIsRead.test_an_item_is_read_into_its_parts) ... ok
2026-10-10T21:11:21.4340359Z test_an_origin_that_is_no_issue_is_kept_as_it_is_written (test_backlog_layout.TestAnItemIsRead.test_an_origin_that_is_no_issue_is_kept_as_it_is_written) ... ok
2026-10-10T21:11:21.4843089Z test_lists_may_be_empty_and_an_origin_may_name_several_issues (test_backlog_layout.TestAnItemIsRead.test_lists_may_be_empty_and_an_origin_may_name_several_issues) ... ok
2026-10-10T21:11:21.5398784Z test_an_order_naming_every_item_leaves_nothing_unplaced (test_backlog_layout.TestTheOrder.test_an_order_naming_every_item_leaves_nothing_unplaced) ... ok
2026-10-10T21:11:21.5960166Z test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout.TestTheOrder.test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem) ... ok
2026-10-10T21:11:21.6518097Z test_prose_and_other_lists_of_the_order_file_are_not_read_as_items (test_backlog_layout.TestTheOrder.test_prose_and_other_lists_of_the_order_file_are_not_read_as_items) ... ok
2026-10-10T21:11:21.7069520Z test_the_order_follows_the_lines_not_their_numbers (test_backlog_layout.TestTheOrder.test_the_order_follows_the_lines_not_their_numbers) ... ok
2026-10-10T21:11:21.7629257Z test_the_order_names_items_and_the_rest_is_appended_at_the_bottom (test_backlog_layout.TestTheOrder.test_the_order_names_items_and_the_rest_is_appended_at_the_bottom) ... ok
2026-10-10T21:11:21.8171550Z test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier (test_backlog_layout.TestTheOrder.test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier) ... ok
2026-10-10T21:11:21.8650805Z test_counter_proof_a_file_without_front_matter_is_no_item (test_backlog_layout.TestWhereAnItemLives.test_counter_proof_a_file_without_front_matter_is_no_item) ... ok
2026-10-10T21:11:21.9138870Z test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem (test_backlog_layout.TestWhereAnItemLives.test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem) ... ok
2026-10-10T21:11:22.2626434Z test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem (test_backlog_layout.TestWhereAnItemLives.test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem) ... ok
2026-10-10T21:11:22.4600875Z test_every_item_of_the_fixture_backlog_is_where_an_item_must_be (test_backlog_layout.TestWhereAnItemLives.test_every_item_of_the_fixture_backlog_is_where_an_item_must_be) ... ok
2026-10-10T21:11:22.5119026Z test_a_command_that_would_break_the_rule_is_never_written (test_bridge_tunnel.ReverseTunnelOnLoopback.test_a_command_that_would_break_the_rule_is_never_written) ... ok
2026-10-10T21:11:22.7506674Z test_counter_proof_any_other_bind_address_fails (test_bridge_tunnel.ReverseTunnelOnLoopback.test_counter_proof_any_other_bind_address_fails) ... ok
2026-10-10T21:11:22.8958337Z test_the_generated_reverse_command_names_the_loopback_address (test_bridge_tunnel.ReverseTunnelOnLoopback.test_the_generated_reverse_command_names_the_loopback_address) ... ok
2026-10-10T21:11:22.8962355Z test_counter_proof_a_job_without_the_limit_or_with_a_longer_one_is_named (test_ci_budget.PullRequestCiWithinTwoMinutes.test_counter_proof_a_job_without_the_limit_or_with_a_longer_one_is_named) ... ok
2026-10-10T21:11:22.8965398Z test_every_job_of_the_pull_request_workflow_stops_after_two_minutes (test_ci_budget.PullRequestCiWithinTwoMinutes.test_every_job_of_the_pull_request_workflow_stops_after_two_minutes) ... ok
2026-10-10T21:11:22.9445734Z test_clear_leaves_no_agent_m_key (test_clear_removes_storage.ClearRemovesStorage.test_clear_leaves_no_agent_m_key) ... ok
2026-10-10T21:11:22.9927913Z test_counter_proof_a_form_reset_is_not_a_clear (test_clear_removes_storage.ClearRemovesStorage.test_counter_proof_a_form_reset_is_not_a_clear) ... ok
2026-10-10T21:11:22.9929228Z test_counter_proof_access_not_the_word (test_config_client_side.ConfigClientSide.test_counter_proof_access_not_the_word) ... ok
2026-10-10T21:11:23.0101761Z test_only_the_store_module_touches_browser_storage (test_config_client_side.ConfigClientSide.test_only_the_store_module_touches_browser_storage) ... ok
2026-10-10T21:11:23.0591014Z test_token_lands_in_the_given_browser_store (test_config_client_side.ConfigClientSide.test_token_lands_in_the_given_browser_store) ... ok
2026-10-10T21:11:23.1311139Z test_a_withdrawn_name_is_a_gap_with_its_note (test_coverage_report.ModuleGaps.test_a_withdrawn_name_is_a_gap_with_its_note) ... ok
2026-10-10T21:11:23.2034126Z test_counter_proof_a_module_with_requirement_code_and_test_is_no_gap (test_coverage_report.ModuleGaps.test_counter_proof_a_module_with_requirement_code_and_test_is_no_gap) ... ok
2026-10-10T21:11:23.2753788Z test_each_module_row_names_what_it_realises_follows_its_code_and_its_tests (test_coverage_report.ModuleGaps.test_each_module_row_names_what_it_realises_follows_its_code_and_its_tests) ... ok
2026-10-10T21:11:23.4938109Z test_the_four_gaps_of_the_rule_and_those_of_uc_025_are_listed (test_coverage_report.ModuleGaps.test_the_four_gaps_of_the_rule_and_those_of_uc_025_are_listed) ... ok
2026-10-10T21:11:23.7105336Z test_every_view_is_computed_on_a_graph_full_of_gaps (test_coverage_report.NothingBlocks.test_every_view_is_computed_on_a_graph_full_of_gaps) ... ok
2026-10-10T21:11:23.8591813Z test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed (test_coverage_report.UnrealisedRequirements.test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed) ... ok
2026-10-10T21:11:23.9325936Z test_counter_proof_a_realised_requirement_is_no_gap (test_coverage_report.UnrealisedRequirements.test_counter_proof_a_realised_requirement_is_no_gap) ... ok
2026-10-10T21:11:24.0044549Z test_the_fixture_has_no_coverage_gap_but_its_untested_rule (test_coverage_report.UnrealisedRequirements.test_the_fixture_has_no_coverage_gap_but_its_untested_rule) ... ok
2026-10-10T21:11:24.1318193Z test_disclosed_destinations_match_where_the_token_may_go (test_destination_disclosure.DestinationDisclosure.test_disclosed_destinations_match_where_the_token_may_go) ... ok
2026-10-10T21:11:24.1320639Z test_a_complete_use_case_passes (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_complete_use_case_passes) ... ok
2026-10-10T21:11:24.1327416Z test_a_diagram_stored_as_an_image_is_reported (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_diagram_stored_as_an_image_is_reported) ... ok
2026-10-10T21:11:24.1330518Z test_a_use_case_without_a_mermaid_block_is_reported (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_a_use_case_without_a_mermaid_block_is_reported) ... ok
2026-10-10T21:11:24.1414977Z test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image) ... ok
2026-10-10T21:11:24.1431047Z test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture) ... ok
2026-10-10T21:11:24.3386712Z test_the_dashboards_reader_reports_the_same_on_their_lines (test_diagrams_are_mermaid.DiagramsAreMermaidInMarkdown.test_the_dashboards_reader_reports_the_same_on_their_lines) ... ok
2026-10-10T21:11:24.4519368Z test_a_gate_may_check_what_an_earlier_phase_produced (test_gate_definition.TestGateDefinition.test_a_gate_may_check_what_an_earlier_phase_produced) ... ok
2026-10-10T21:11:24.5691371Z test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says (test_gate_definition.TestGateDefinition.test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says) ... ok
2026-10-10T21:11:24.6821680Z test_a_gate_with_artifacts_and_a_condition_passes (test_gate_definition.TestGateDefinition.test_a_gate_with_artifacts_and_a_condition_passes) ... ok
2026-10-10T21:11:24.7377084Z test_counter_proof_a_back_transition_does_not_make_the_phase_it_leaves_earlier (test_gate_definition.TestGateDefinition.test_counter_proof_a_back_transition_does_not_make_the_phase_it_leaves_earlier) ... ok
2026-10-10T21:11:24.7954016Z test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused) ... ok
2026-10-10T21:11:24.8529087Z test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused) ... ok
2026-10-10T21:11:24.9711989Z test_counter_proof_a_gate_without_a_condition_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_without_a_condition_is_refused) ... ok
2026-10-10T21:11:25.0897701Z test_counter_proof_a_gate_without_artifacts_is_refused (test_gate_definition.TestGateDefinition.test_counter_proof_a_gate_without_artifacts_is_refused) ... ok
2026-10-10T21:11:25.2023024Z test_every_gate_is_read_with_what_it_checks (test_gate_definition.TestGateDefinition.test_every_gate_is_read_with_what_it_checks) ... ok
2026-10-10T21:11:25.2511122Z test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes (test_groups.ArrangedInNestedGroups.test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes) ... ok
2026-10-10T21:11:25.5508794Z test_every_kind_reads_as_its_nested_hierarchy (test_groups.ArrangedInNestedGroups.test_every_kind_reads_as_its_nested_hierarchy) ... ok
2026-10-10T21:11:25.6043437Z test_format_of_parse_is_the_text_of_a_canonical_file (test_groups.ArrangedInNestedGroups.test_format_of_parse_is_the_text_of_a_canonical_file) ... ok
2026-10-10T21:11:25.6558402Z test_format_writes_the_canonical_text (test_groups.ArrangedInNestedGroups.test_format_writes_the_canonical_text) ... ok
2026-10-10T21:11:25.7061666Z test_format_writes_the_heading_it_is_given (test_groups.ArrangedInNestedGroups.test_format_writes_the_heading_it_is_given) ... ok
2026-10-10T21:11:25.7574025Z test_a_group_is_named_by_its_title_only (test_groups.GroupCarriesNoIdentifier.test_a_group_is_named_by_its_title_only) ... ok
2026-10-10T21:11:25.8636425Z test_a_group_title_named_as_an_identifier_is_found (test_groups.GroupCarriesNoIdentifier.test_a_group_title_named_as_an_identifier_is_found) ... ok
2026-10-10T21:11:25.9149827Z test_a_title_written_like_an_identifier_is_reported (test_groups.GroupCarriesNoIdentifier.test_a_title_written_like_an_identifier_is_reported) ... ok
2026-10-10T21:11:26.6081906Z test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected (test_groups.GroupCarriesNoIdentifier.test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected) ... ok
2026-10-10T21:11:26.8575933Z test_every_broken_fixture_yields_exactly_the_findings_expected_json_names (test_groups.GroupFileFindings.test_every_broken_fixture_yields_exactly_the_findings_expected_json_names) ... ok
2026-10-10T21:11:27.1080243Z test_the_complete_files_yield_no_finding (test_groups.GroupFileFindings.test_the_complete_files_yield_no_finding) ... ok
2026-10-10T21:11:27.1579304Z test_a_member_of_another_kind_is_reported (test_groups.OneKindOfArtifact.test_a_member_of_another_kind_is_reported) ... ok
2026-10-10T21:11:27.2079760Z test_a_move_into_a_group_of_another_kind_is_refused (test_groups.OneKindOfArtifact.test_a_move_into_a_group_of_another_kind_is_refused) ... ok
2026-10-10T21:11:27.2570402Z test_an_empty_hierarchy_holds_the_kind_it_is_given (test_groups.OneKindOfArtifact.test_an_empty_hierarchy_holds_the_kind_it_is_given) ... ok
2026-10-10T21:11:27.3104911Z test_a_move_that_would_lose_or_duplicate_is_refused (test_groups.OnePlaceInTheHierarchy.test_a_move_that_would_lose_or_duplicate_is_refused) ... ok
2026-10-10T21:11:27.4103806Z test_a_moved_item_or_group_leaves_no_copy_behind (test_groups.OnePlaceInTheHierarchy.test_a_moved_item_or_group_leaves_no_copy_behind) ... ok
2026-10-10T21:11:27.4604216Z test_an_item_listed_twice_is_reported_in_both_places (test_groups.OnePlaceInTheHierarchy.test_an_item_listed_twice_is_reported_in_both_places) ... ok
2026-10-10T21:11:27.5121228Z test_apply_moves_leaves_the_tree_it_is_given_as_it_was (test_groups.OnePlaceInTheHierarchy.test_apply_moves_leaves_the_tree_it_is_given_as_it_was) ... ok
2026-10-10T21:11:27.5626375Z test_create_rename_and_delete_change_only_groups (test_groups.OnePlaceInTheHierarchy.test_create_rename_and_delete_change_only_groups) ... ok
2026-10-10T21:11:27.6127656Z test_every_known_item_has_exactly_one_place (test_groups.OnePlaceInTheHierarchy.test_every_known_item_has_exactly_one_place) ... ok
2026-10-10T21:11:27.6129844Z test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind (test_groups.OwnGroupFile.test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind) ... skipped 'this repository has no group files'
2026-10-10T21:11:27.6636486Z test_the_group_file_holds_titles_and_identifiers_only (test_groups.OwnGroupFile.test_the_group_file_holds_titles_and_identifiers_only) ... ok
2026-10-10T21:11:27.8700703Z test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after (test_groups.RegroupingLeavesTheGroupedFilesUnchanged.test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after) ... ok
2026-10-10T21:11:27.9224753Z test_a_not_yet_placed_item_is_written_only_once_it_is_moved (test_groups.UngroupedItemAtTheTopLevel.test_a_not_yet_placed_item_is_written_only_once_it_is_moved) ... ok
2026-10-10T21:11:27.9744599Z test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed (test_groups.UngroupedItemAtTheTopLevel.test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed) ... ok
2026-10-10T21:11:28.0254051Z test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named (test_groups.UngroupedItemAtTheTopLevel.test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named) ... ok
2026-10-10T21:11:28.0759868Z test_without_a_group_file_every_item_is_at_the_top_level (test_groups.UngroupedItemAtTheTopLevel.test_without_a_group_file_every_item_is_at_the_top_level) ... ok
2026-10-10T21:11:28.0764741Z test_both_pages_declare_the_icon (test_home_screen_icon.HomeScreenIcon.test_both_pages_declare_the_icon) ... ok
2026-10-10T21:11:28.2398250Z test_counter_proofs_full_size_transparent_and_too_small_are_named (test_home_screen_icon.HomeScreenIcon.test_counter_proofs_full_size_transparent_and_too_small_are_named) ... ok
2026-10-10T21:11:28.2791536Z test_the_sign_stands_at_80_percent_on_a_white_square (test_home_screen_icon.HomeScreenIcon.test_the_sign_stands_at_80_percent_on_a_white_square) ... ok
2026-10-10T21:11:28.5002489Z test_an_identifier_travels_with_its_artifact (test_identifier_stability.IdentifierStability.test_an_identifier_travels_with_its_artifact) ... ok
2026-10-10T21:11:28.6656756Z test_counter_proof_a_withdrawn_identifier_is_not_reused (test_identifier_stability.IdentifierStability.test_counter_proof_a_withdrawn_identifier_is_not_reused) ... ok
2026-10-10T21:11:28.8238708Z test_counter_proof_a_withdrawn_identifier_without_its_note (test_identifier_stability.IdentifierStability.test_counter_proof_a_withdrawn_identifier_without_its_note) ... ok
2026-10-10T21:11:29.3838308Z test_counter_proof_an_identifier_gone_without_a_note (test_identifier_stability.IdentifierStability.test_counter_proof_an_identifier_gone_without_a_note) ... ok
2026-10-10T21:11:29.4644381Z test_counter_proof_the_earlier_version_read_as_the_later_one (test_identifier_stability.IdentifierStability.test_counter_proof_the_earlier_version_read_as_the_later_one) ... ok
2026-10-10T21:11:29.8232839Z test_counter_proof_a_file_without_an_identifier (test_identifiers.Identifiers.test_counter_proof_a_file_without_an_identifier) ... ok
2026-10-10T21:11:29.8749460Z test_counter_proof_a_malformed_identifier_has_no_kind (test_identifiers.Identifiers.test_counter_proof_a_malformed_identifier_has_no_kind) ... ok
2026-10-10T21:11:29.9470754Z test_counter_proof_a_requirement_without_a_name_in_capitals (test_identifiers.Identifiers.test_counter_proof_a_requirement_without_a_name_in_capitals) ... ok
2026-10-10T21:11:30.0936596Z test_counter_proof_a_test_whose_cases_carry_no_identifier (test_identifiers.Identifiers.test_counter_proof_a_test_whose_cases_carry_no_identifier) ... ok
2026-10-10T21:11:30.3078028Z test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries (test_identifiers.Identifiers.test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries) ... ok
2026-10-10T21:11:30.5305107Z test_counter_proof_one_identifier_on_two_artifacts (test_identifiers.Identifiers.test_counter_proof_one_identifier_on_two_artifacts) ... ok
2026-10-10T21:11:30.6016066Z test_every_artifact_of_the_fixture_is_read_by_its_identifier (test_identifiers.Identifiers.test_every_artifact_of_the_fixture_is_read_by_its_identifier) ... ok
2026-10-10T21:11:30.6525940Z test_the_kind_of_an_identifier_is_told_by_its_form (test_identifiers.Identifiers.test_the_kind_of_an_identifier_is_told_by_its_form) ... ok
2026-10-10T21:11:30.8135470Z test_a_requirement_renamed_in_place_is_touched_as_a_withdrawal (test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_a_requirement_renamed_in_place_is_touched_as_a_withdrawal) ... ok
2026-10-10T21:11:31.1302975Z test_counter_proof_without_the_queues_index_or_its_section_nothing_is_guessed (test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_counter_proof_without_the_queues_index_or_its_section_nothing_is_guessed) ... ok
2026-10-10T21:11:31.2113442Z test_the_section_is_the_one_the_index_names_not_the_entrys_first_line (test_impact_list.AnEntryThatLeavesARequirementOutOfItsSection.test_the_section_is_the_one_the_index_names_not_the_entrys_first_line) ... ok
2026-10-10T21:11:31.2842898Z test_a_withdrawn_requirement_lists_what_still_names_it (test_impact_list.ImpactOfARequirementChange.test_a_withdrawn_requirement_lists_what_still_names_it) ... ok
2026-10-10T21:11:31.6516490Z test_counter_proof_what_does_not_name_it_is_not_listed (test_impact_list.ImpactOfARequirementChange.test_counter_proof_what_does_not_name_it_is_not_listed) ... ok
2026-10-10T21:11:31.7941780Z test_every_artifact_naming_the_requirement_is_listed (test_impact_list.ImpactOfARequirementChange.test_every_artifact_naming_the_requirement_is_listed) ... ok
2026-10-10T21:11:32.0175921Z test_the_open_entry_is_shown_with_what_it_would_change_and_the_list_of_each_existing_name (test_impact_list.ImpactOfARequirementChange.test_the_open_entry_is_shown_with_what_it_would_change_and_the_list_of_each_existing_name) ... ok
2026-10-10T21:11:32.1315949Z test_fork_address_names_the_fork (test_instance_target.InstanceTarget.test_fork_address_names_the_fork) ... ok
2026-10-10T21:11:32.2434794Z test_local_serving_falls_back_to_upstream (test_instance_target.InstanceTarget.test_local_serving_falls_back_to_upstream) ... ok
2026-10-10T21:11:32.3569920Z test_malformed_repo_query_is_ignored (test_instance_target.InstanceTarget.test_malformed_repo_query_is_ignored) ... ok
2026-10-10T21:11:32.4695167Z test_product_is_chosen_by_query_the_instance_stays (test_instance_target.InstanceTarget.test_product_is_chosen_by_query_the_instance_stays) ... ok
2026-10-10T21:11:32.6408360Z test_a_planned_model_works_from_its_plan_and_refuses_neither (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_a_planned_model_works_from_its_plan_and_refuses_neither) ... ok
2026-10-10T21:11:32.8193555Z test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model) ... ok
2026-10-10T21:11:32.9913275Z test_counter_proof_an_item_of_the_backlog_starts_in_both (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_counter_proof_an_item_of_the_backlog_starts_in_both) ... ok
2026-10-10T21:11:33.1643384Z test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture (test_job_from_backlog.TestAJobImplementsAnItemOfTheBacklog.test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture) ... ok
2026-10-10T21:11:33.3432996Z test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not (test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not) ... ok
2026-10-10T21:11:33.4295746Z test_a_failed_job_blocks_it (test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_blocks_it) ... ok
2026-10-10T21:11:33.5165532Z test_a_failed_job_retried_by_a_later_running_one_is_in_progress (test_job_from_backlog.TestTheStateOfAnItem.test_a_failed_job_retried_by_a_later_running_one_is_in_progress) ... ok
2026-10-10T21:11:33.6028162Z test_a_job_that_ended_without_record_blocks_it (test_job_from_backlog.TestTheStateOfAnItem.test_a_job_that_ended_without_record_blocks_it) ... ok
2026-10-10T21:11:33.7744185Z test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not (test_job_from_backlog.TestTheStateOfAnItem.test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not) ... ok
2026-10-10T21:11:33.8651566Z test_a_merged_pull_request_makes_it_done_and_is_named (test_job_from_backlog.TestTheStateOfAnItem.test_a_merged_pull_request_makes_it_done_and_is_named) ... ok
2026-10-10T21:11:34.0346158Z test_a_running_or_queued_job_makes_it_in_progress_and_is_named (test_job_from_backlog.TestTheStateOfAnItem.test_a_running_or_queued_job_makes_it_in_progress_and_is_named) ... ok
2026-10-10T21:11:34.1256037Z test_an_item_back_in_development_after_its_merge_is_in_progress_again (test_job_from_backlog.TestTheStateOfAnItem.test_an_item_back_in_development_after_its_merge_is_in_progress_again) ... ok
2026-10-10T21:11:34.2113668Z test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it (test_job_from_backlog.TestTheStateOfAnItem.test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it) ... ok
2026-10-10T21:11:34.5594036Z test_an_item_whose_names_are_all_accepted_is_ready (test_job_from_backlog.TestTheStateOfAnItem.test_an_item_whose_names_are_all_accepted_is_ready) ... ok
2026-10-10T21:11:34.6486109Z test_an_open_pull_request_makes_it_in_progress_and_is_named (test_job_from_backlog.TestTheStateOfAnItem.test_an_open_pull_request_makes_it_in_progress_and_is_named) ... ok
2026-10-10T21:11:34.9103717Z test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready (test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready) ... ok
2026-10-10T21:11:34.9978805Z test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items (test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items) ... ok
2026-10-10T21:11:35.0884684Z test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog.TestTheStateOfAnItem.test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing) ... ok
2026-10-10T21:11:35.1760759Z test_what_is_happening_is_shown_before_what_is_not_accepted (test_job_from_backlog.TestTheStateOfAnItem.test_what_is_happening_is_shown_before_what_is_not_accepted) ... ok
2026-10-10T21:11:35.1776263Z test_a_folder_without_an_index_keeps_the_names_of_its_files (test_jsrun_names.ModuleFolderNames.test_a_folder_without_an_index_keeps_the_names_of_its_files) ... ok
2026-10-10T21:11:35.1796021Z test_every_module_folder_has_its_index_and_its_parts_by_the_folder_name (test_jsrun_names.ModuleFolderNames.test_every_module_folder_has_its_index_and_its_parts_by_the_folder_name) ... ok
2026-10-10T21:11:35.1806181Z test_two_files_that_would_share_a_name_are_still_refused (test_jsrun_names.ModuleFolderNames.test_two_files_that_would_share_a_name_are_still_refused) ... ok
2026-10-10T21:11:35.1807654Z test_counter_proof (test_licence.Licence.test_counter_proof) ... ok
2026-10-10T21:11:35.1808701Z test_root_licence_is_mit (test_licence.Licence.test_root_licence_is_mit) ... ok
2026-10-10T21:11:35.2696258Z test_counter_proof_a_red_ci_guards_no_requirement (test_main_page.EachProductsProgressByStage.test_counter_proof_a_red_ci_guards_no_requirement) ... ok
2026-10-10T21:11:35.4484124Z test_counter_proof_with_all_four_accepted_the_stage_is_at_100_percent (test_main_page.EachProductsProgressByStage.test_counter_proof_with_all_four_accepted_the_stage_is_at_100_percent) ... ok
2026-10-10T21:11:35.5398595Z test_each_stage_is_filled_by_the_share_of_its_work_that_is_accepted_or_done (test_main_page.EachProductsProgressByStage.test_each_stage_is_filled_by_the_share_of_its_work_that_is_accepted_or_done) ... ok
2026-10-10T21:11:35.6310474Z test_the_six_stages_stand_in_their_order (test_main_page.EachProductsProgressByStage.test_the_six_stages_stand_in_their_order) ... ok
2026-10-10T21:11:35.7229576Z test_the_stage_the_product_is_in_is_marked (test_main_page.EachProductsProgressByStage.test_the_stage_the_product_is_in_is_marked) ... ok
2026-10-10T21:11:35.9041505Z test_three_of_four_use_cases_accepted_show_the_use_case_stage_at_75_percent (test_main_page.EachProductsProgressByStage.test_three_of_four_use_cases_accepted_show_the_use_case_stage_at_75_percent) ... ok
2026-10-10T21:11:36.0854500Z test_a_running_job_is_shown_beside_its_step (test_main_page.TheBuildIsShownAsItHappens.test_a_running_job_is_shown_beside_its_step) ... ok
2026-10-10T21:11:36.3580952Z test_counter_proof_once_the_job_has_ended_the_step_shows_done (test_main_page.TheBuildIsShownAsItHappens.test_counter_proof_once_the_job_has_ended_the_step_shows_done) ... ok
2026-10-10T21:11:36.3584023Z test_the_root_of_the_site_is_the_main_page (test_main_page.TheMainPageShowsWhatGoesOnInTheInstance.test_the_root_of_the_site_is_the_main_page) ... ok
2026-10-10T21:11:36.4492067Z test_what_waits_for_a_person_is_listed_with_the_page_where_it_is_decided (test_main_page.TheMainPageShowsWhatGoesOnInTheInstance.test_what_waits_for_a_person_is_listed_with_the_page_where_it_is_decided) ... ok
2026-10-10T21:11:36.4978528Z test_a_stage_whose_page_is_built_links_to_it_and_one_not_built_is_named_without_a_link (test_main_page.TheMenuFollowsTheProcess.test_a_stage_whose_page_is_built_links_to_it_and_one_not_built_is_named_without_a_link) ... ok
2026-10-10T21:11:36.5458929Z test_counter_proof_a_menu_with_two_stages_swapped_fails (test_main_page.TheMenuFollowsTheProcess.test_counter_proof_a_menu_with_two_stages_swapped_fails) ... ok
2026-10-10T21:11:36.5461246Z test_the_main_page_and_the_review_pages_carry_the_menu (test_main_page.TheMenuFollowsTheProcess.test_the_main_page_and_the_review_pages_carry_the_menu) ... ok
2026-10-10T21:11:36.5933711Z test_the_menu_lists_the_stages_in_the_order_of_the_process (test_main_page.TheMenuFollowsTheProcess.test_the_menu_lists_the_stages_in_the_order_of_the_process) ... ok
2026-10-10T21:11:36.6423508Z test_the_rendered_menu_stands_in_the_same_order (test_main_page.TheMenuFollowsTheProcess.test_the_rendered_menu_stands_in_the_same_order) ... ok
2026-10-10T21:11:36.8234641Z test_agent_ms_bar_is_full_once_its_first_release_is_tagged (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_agent_ms_bar_is_full_once_its_first_release_is_tagged) ... ok
2026-10-10T21:11:36.9131724Z test_counter_proof_before_its_first_release_the_bar_shows_the_shares (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_counter_proof_before_its_first_release_the_bar_shows_the_shares) ... ok
2026-10-10T21:11:36.9645081Z test_counter_proof_with_one_product_the_bar_shows_the_product (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_counter_proof_with_one_product_the_bar_shows_the_product) ... ok
2026-10-10T21:11:37.0149077Z test_without_a_product_the_bar_shows_agent_m (test_main_page.WithoutAProductTheMainPageShowsAgentMsOwnProgress.test_without_a_product_the_bar_shows_agent_m) ... ok
2026-10-10T21:11:37.1603179Z test_an_edited_artifact_changes_the_row_it_names (test_matrix_derived.MatrixDerived.test_an_edited_artifact_changes_the_row_it_names) ... ok
2026-10-10T21:11:37.3071338Z test_counter_proof_a_stored_matrix_is_not_read (test_matrix_derived.MatrixDerived.test_counter_proof_a_stored_matrix_is_not_read) ... ok
2026-10-10T21:11:37.3823508Z test_each_row_is_what_the_artifacts_name (test_matrix_derived.MatrixDerived.test_each_row_is_what_the_artifacts_name) ... ok
2026-10-10T21:11:37.4547813Z test_the_graph_is_a_value_of_the_files_alone (test_matrix_derived.MatrixDerived.test_the_graph_is_a_value_of_the_files_alone) ... ok
2026-10-10T21:11:37.7991799Z test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass (test_model_validation.TestDecider.test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass) ... ok
2026-10-10T21:11:38.0388961Z test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected (test_model_validation.TestDecider.test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected) ... ok
2026-10-10T21:11:38.1564763Z test_counter_proof_a_gate_without_a_decider_is_rejected (test_model_validation.TestDecider.test_counter_proof_a_gate_without_a_decider_is_rejected) ... ok
2026-10-10T21:11:38.2133459Z test_a_planned_definition_is_read_into_its_parts (test_model_validation.TestReading.test_a_planned_definition_is_read_into_its_parts) ... ok
2026-10-10T21:11:38.2703150Z test_a_pulled_definition_is_read_into_its_parts (test_model_validation.TestReading.test_a_pulled_definition_is_read_into_its_parts) ... ok
2026-10-10T21:11:38.3843778Z test_a_time_box_is_read_with_its_length (test_model_validation.TestReading.test_a_time_box_is_read_with_its_length) ... ok
2026-10-10T21:11:39.0219003Z test_each_error_stands_beside_the_field_that_causes_it (test_model_validation.TestValidation.test_each_error_stands_beside_the_field_that_causes_it) ... ok
2026-10-10T21:11:39.7699134Z test_each_rule_the_spec_and_uc_031_name_has_a_broken_definition_that_is_rejected (test_model_validation.TestValidation.test_each_rule_the_spec_and_uc_031_name_has_a_broken_definition_that_is_rejected) ... ok
2026-10-10T21:11:41.5766778Z test_every_broken_definition_yields_exactly_the_errors_expected_json_names (test_model_validation.TestValidation.test_every_broken_definition_yields_exactly_the_errors_expected_json_names) ... ok
2026-10-10T21:11:41.6378911Z test_every_model_definition_of_this_repository_passes_validation (test_model_validation.TestValidation.test_every_model_definition_of_this_repository_passes_validation) ... ok
2026-10-10T21:11:41.7523974Z test_the_complete_definitions_pass_validation (test_model_validation.TestValidation.test_the_complete_definitions_pass_validation) ... ok
2026-10-10T21:11:41.8163647Z test_the_model_agent_m_declares_gives_its_flow_control (test_model_validation.TestValidation.test_the_model_agent_m_declares_gives_its_flow_control) ... ok
2026-10-10T21:11:41.8761035Z test_validation_leaves_the_model_as_it_was (test_model_validation.TestValidation.test_validation_leaves_the_model_as_it_was) ... ok
2026-10-10T21:11:41.9104524Z test_counter_proof_a_foreign_address_is_found (test_no_backend.NoServer.test_counter_proof_a_foreign_address_is_found) ... ok
2026-10-10T21:11:41.9439964Z test_counter_proof_a_markdown_file_that_loads_from_another_host (test_no_backend.NoServer.test_counter_proof_a_markdown_file_that_loads_from_another_host) ... ok
2026-10-10T21:11:41.9752301Z test_counter_proof_a_method_named_fetch_or_a_comment_is_no_call (test_no_backend.NoServer.test_counter_proof_a_method_named_fetch_or_a_comment_is_no_call) ... ok
2026-10-10T21:11:42.0069573Z test_counter_proof_a_modules_own_data_files (test_no_backend.NoServer.test_counter_proof_a_modules_own_data_files) ... ok
2026-10-10T21:11:42.0387103Z test_counter_proof_a_permitted_channel_without_its_evidence_is_found (test_no_backend.NoServer.test_counter_proof_a_permitted_channel_without_its_evidence_is_found) ... ok
2026-10-10T21:11:42.0698111Z test_counter_proof_a_vendored_librarys_addresses_are_not_the_own_codes (test_no_backend.NoServer.test_counter_proof_a_vendored_librarys_addresses_are_not_the_own_codes) ... ok
2026-10-10T21:11:42.1011958Z test_counter_proof_an_unknown_channel_is_found (test_no_backend.NoServer.test_counter_proof_an_unknown_channel_is_found) ... ok
2026-10-10T21:11:42.1338770Z test_counter_proof_only_the_bridge_handle_transport_is_allowed (test_no_backend.NoServer.test_counter_proof_only_the_bridge_handle_transport_is_allowed) ... ok
2026-10-10T21:11:42.1650681Z test_counter_proof_only_the_configured_endpoint_transport_is_allowed (test_no_backend.NoServer.test_counter_proof_only_the_configured_endpoint_transport_is_allowed) ... ok
2026-10-10T21:11:42.1970002Z test_counter_proof_only_the_site_frames_own_static_header_assets_load (test_no_backend.NoServer.test_counter_proof_only_the_site_frames_own_static_header_assets_load) ... ok
2026-10-10T21:11:42.2573759Z test_every_address_in_the_own_code_names_a_permitted_host (test_no_backend.NoServer.test_every_address_in_the_own_code_names_a_permitted_host) ... ok
2026-10-10T21:11:42.2944920Z test_mermaid_renders_katex_untrusted (test_no_backend.NoServer.test_mermaid_renders_katex_untrusted) ... ok
2026-10-10T21:11:42.5228792Z test_no_served_markdown_loads_from_another_host (test_no_backend.NoServer.test_no_served_markdown_loads_from_another_host) ... ok
2026-10-10T21:11:43.9458685Z test_requests_leave_only_through_the_known_channels (test_no_backend.NoServer.test_requests_leave_only_through_the_known_channels) ... ok
2026-10-10T21:11:43.9782192Z test_the_dashboard_sets_no_worker_address_for_mermaid (test_no_backend.NoServer.test_the_dashboard_sets_no_worker_address_for_mermaid) ... ok
2026-10-10T21:11:44.0103109Z test_the_site_has_code_to_check (test_no_backend.NoServer.test_the_site_has_code_to_check) ... ok
2026-10-10T21:11:44.0108053Z test_counter_proof (test_no_config_cookie.NoCookie.test_counter_proof) ... ok
2026-10-10T21:11:44.0132429Z test_no_site_code_writes_a_cookie (test_no_config_cookie.NoCookie.test_no_site_code_writes_a_cookie) ... ok
2026-10-10T21:11:44.0630498Z test_fetch_refuses_a_url_that_contains_the_token (test_no_credential_in_url.NoCredentialInUrl.test_fetch_refuses_a_url_that_contains_the_token) ... ok
2026-10-10T21:11:44.1116749Z test_github_links_take_no_token (test_no_credential_in_url.NoCredentialInUrl.test_github_links_take_no_token) ... ok
2026-10-10T21:11:44.3216060Z test_counter_proof_a_code_file_that_names_not_one_module (test_origin_links.OriginLinks.test_counter_proof_a_code_file_that_names_not_one_module) ... ok
2026-10-10T21:11:44.6673207Z test_counter_proof_a_test_that_names_no_module_or_guards_nothing (test_origin_links.OriginLinks.test_counter_proof_a_test_that_names_no_module_or_guards_nothing) ... ok
2026-10-10T21:11:45.0063546Z test_counter_proof_a_use_case_decision_or_module_that_names_nothing (test_origin_links.OriginLinks.test_counter_proof_a_use_case_decision_or_module_that_names_nothing) ... ok
2026-10-10T21:11:45.1435726Z test_every_artifact_of_the_fixture_names_its_origin (test_origin_links.OriginLinks.test_every_artifact_of_the_fixture_names_its_origin) ... ok
2026-10-10T21:11:45.1922467Z test_guards_are_names_separated_by_semicolons (test_origin_links.OriginLinks.test_guards_are_names_separated_by_semicolons) ... ok
2026-10-10T21:11:45.1925588Z test_the_review_pages_and_the_review_layout_are_under_docs (test_pages_layout.PagesLayout.test_the_review_pages_and_the_review_layout_are_under_docs) ... ok
2026-10-10T21:11:45.1928183Z test_the_root_holds_the_main_page (test_pages_layout.PagesLayout.test_the_root_holds_the_main_page) ... ok
2026-10-10T21:11:45.1929644Z test_address_forms (test_products_folder.NoProductNamed.test_address_forms) ... ok
2026-10-10T21:11:45.2051524Z test_counter_proof_a_fixture_that_commits_one_fails (test_products_folder.NoProductNamed.test_counter_proof_a_fixture_that_commits_one_fails) ... ok
2026-10-10T21:11:45.4009278Z test_instance_repository_names_no_product (test_products_folder.NoProductNamed.test_instance_repository_names_no_product) ... ok
2026-10-10T21:11:45.4056810Z test_counter_proof (test_products_folder.ProductsFolder.test_counter_proof) ... ok
2026-10-10T21:11:45.4789524Z test_created_product_folder_is_ignored (test_products_folder.ProductsFolder.test_created_product_folder_is_ignored) ... ok
2026-10-10T21:11:45.4807058Z test_readme_is_not_ignored (test_products_folder.ProductsFolder.test_readme_is_not_ignored) ... ok
2026-10-10T21:11:45.4825024Z test_readme_is_tracked (test_products_folder.ProductsFolder.test_readme_is_tracked) ... ok
2026-10-10T21:11:45.9347421Z test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown (test_progress_derived.ItemStatesAreDerived.test_counter_proof_a_state_planted_into_local_storage_changes_nothing_shown) ... ok
2026-10-10T21:11:45.9350467Z test_deleting_local_storage_and_the_cached_texts_shows_the_same_board (test_progress_derived.ItemStatesAreDerived.test_deleting_local_storage_and_the_cached_texts_shows_the_same_board) ... ok
2026-10-10T21:11:45.9353258Z test_the_board_shows_the_derived_states (test_progress_derived.ItemStatesAreDerived.test_the_board_shows_the_derived_states) ... ok
2026-10-10T21:11:46.0598378Z test_a_current_text_that_cannot_be_told_is_not_guessed (test_proposal_shows_current.ProposalShowsCurrent.test_a_current_text_that_cannot_be_told_is_not_guessed) ... ok
2026-10-10T21:11:46.2021725Z test_an_approval_that_names_no_current_text_is_not_written (test_proposal_shows_current.ProposalShowsCurrent.test_an_approval_that_names_no_current_text_is_not_written) ... ok
2026-10-10T21:11:46.3033341Z test_the_current_text_beside_an_entry_is_the_whole_section (test_proposal_shows_current.ProposalShowsCurrent.test_the_current_text_beside_an_entry_is_the_whole_section) ... ok
2026-10-10T21:11:46.3752038Z test_counter_proof_a_name_spelled_otherwise_is_another_name (test_references.ReferencesByIdentifier.test_counter_proof_a_name_spelled_otherwise_is_another_name) ... ok
2026-10-10T21:11:46.5181912Z test_counter_proof_a_reference_by_position_reaches_nothing (test_references.ReferencesByIdentifier.test_counter_proof_a_reference_by_position_reaches_nothing) ... ok
2026-10-10T21:11:46.6633719Z test_moving_a_requirement_or_renaming_a_file_moves_no_reference (test_references.ReferencesByIdentifier.test_moving_a_requirement_or_renaming_a_file_moves_no_reference) ... ok
2026-10-10T21:11:46.6636504Z test_every_python_open_of_agent_ms_own_spec_comes_from_a_whole_repository_scan (test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_every_python_open_of_agent_ms_own_spec_comes_from_a_whole_repository_scan) ... skipped 'runs nightly: it runs both suites once more (.github/workflows/nightly.yml)'
2026-10-10T21:11:46.6638706Z test_no_node_test_opens_agent_ms_own_spec (test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_no_node_test_opens_agent_ms_own_spec) ... skipped 'runs nightly: it runs both suites once more (.github/workflows/nightly.yml)'
2026-10-10T21:11:46.9257165Z test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not (test_release_sprint_02_c.TheWatcherSeesAKnownRead.test_every_way_of_opening_the_watched_file_is_seen_and_a_fixture_is_not) ... ok
2026-10-10T21:11:48.3050693Z test_artifacts_are_markdown_passes_a_mermaid_diagram (test_release_sprint_02_d.ProductRuleChecks.test_artifacts_are_markdown_passes_a_mermaid_diagram) ... ok
2026-10-10T21:11:49.7625257Z test_artifacts_are_markdown_refuses_another_format (test_release_sprint_02_d.ProductRuleChecks.test_artifacts_are_markdown_refuses_another_format) ... ok
2026-10-10T21:11:51.6296555Z test_no_server_passes_the_permitted_origins (test_release_sprint_02_d.ProductRuleChecks.test_no_server_passes_the_permitted_origins) ... ok
2026-10-10T21:11:57.2184619Z test_no_server_refuses_a_call_to_another_origin (test_release_sprint_02_d.ProductRuleChecks.test_no_server_refuses_a_call_to_another_origin) ... ok
2026-10-10T21:11:57.3606896Z test_self_sufficient_passes_a_reference_into_the_product (test_release_sprint_02_d.ProductRuleChecks.test_self_sufficient_passes_a_reference_into_the_product) ... ok
2026-10-10T21:11:57.6458118Z test_self_sufficient_refuses_a_reference_into_agent_m (test_release_sprint_02_d.ProductRuleChecks.test_self_sufficient_refuses_a_reference_into_agent_m) ... ok
2026-10-10T21:11:59.9434692Z test_the_repository_passes_the_three_checks (test_release_sprint_02_d.ProductRuleChecks.test_the_repository_passes_the_three_checks) ... ok
2026-10-10T21:12:00.1677176Z test_the_dashboard_leaves_the_replaced_text_in_the_history_only (test_replaced_in_history.ReplacedInHistory.test_the_dashboard_leaves_the_replaced_text_in_the_history_only) ... ok
2026-10-10T21:12:00.2120176Z test_the_workflow_leaves_the_replaced_text_in_the_history_only (test_replaced_in_history.ReplacedInHistory.test_the_workflow_leaves_the_replaced_text_in_the_history_only) ... ok
2026-10-10T21:12:00.2688354Z test_a_field_that_runs_over_several_lines_is_read_whole (test_requirement_fields.RequirementFields.test_a_field_that_runs_over_several_lines_is_read_whole) ... ok
2026-10-10T21:12:00.3171451Z test_a_queue_entry_is_read_like_a_spec (test_requirement_fields.RequirementFields.test_a_queue_entry_is_read_like_a_spec) ... ok
2026-10-10T21:12:00.8833312Z test_a_requirement_written_without_any_source_is_read_and_its_source_named_as_missing (test_requirement_fields.RequirementFields.test_a_requirement_written_without_any_source_is_read_and_its_source_named_as_missing) ... ok
2026-10-10T21:12:00.9979885Z test_a_withdrawn_requirement_is_marked_and_owes_no_fields (test_requirement_fields.RequirementFields.test_a_withdrawn_requirement_is_marked_and_owes_no_fields) ... ok
2026-10-10T21:12:01.2843793Z test_counter_proof_a_missing_source_is_named_as_missing (test_requirement_fields.RequirementFields.test_counter_proof_a_missing_source_is_named_as_missing) ... ok
2026-10-10T21:12:01.3975359Z test_counter_proof_bold_prose_between_requirements_stays_no_requirement (test_requirement_fields.RequirementFields.test_counter_proof_bold_prose_between_requirements_stays_no_requirement) ... ok
2026-10-10T21:12:01.8564822Z test_counter_proof_each_missing_field_is_an_error (test_requirement_fields.RequirementFields.test_counter_proof_each_missing_field_is_an_error) ... ok
2026-10-10T21:12:01.9117990Z test_every_requirement_is_read_by_its_name_with_its_fields (test_requirement_fields.RequirementFields.test_every_requirement_is_read_by_its_name_with_its_fields) ... ok
2026-10-10T21:12:02.1438191Z test_the_well_formed_requirements_have_no_finding (test_requirement_fields.RequirementFields.test_the_well_formed_requirements_have_no_finding) ... ok
2026-10-10T21:12:02.3720184Z test_a_linked_source_is_a_registered_source (test_requirement_has_source.RequirementHasSource.test_a_linked_source_is_a_registered_source) ... ok
2026-10-10T21:12:02.6030719Z test_a_resource_entry_named_as_source_is_rejected (test_requirement_has_source.RequirementHasSource.test_a_resource_entry_named_as_source_is_rejected) ... ok
2026-10-10T21:12:03.1749577Z test_a_source_named_as_it_is_written_is_no_error (test_requirement_has_source.RequirementHasSource.test_a_source_named_as_it_is_written_is_no_error) ... ok
2026-10-10T21:12:03.3441848Z test_counter_proof_a_source_the_product_does_not_link (test_requirement_has_source.RequirementHasSource.test_counter_proof_a_source_the_product_does_not_link) ... ok
2026-10-10T21:12:03.5739150Z test_a_named_test_or_review_is_a_check (test_requirement_names_check.RequirementNamesItsCheck.test_a_named_test_or_review_is_a_check) ... ok
2026-10-10T21:12:03.8127149Z test_counter_proof_a_check_that_names_neither_is_an_error (test_requirement_names_check.RequirementNamesItsCheck.test_counter_proof_a_check_that_names_neither_is_an_error) ... ok
2026-10-10T21:12:03.8167422Z test_counter_proof_a_file_of_agent_m_is_found (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_a_file_of_agent_m_is_found) ... ok
2026-10-10T21:12:03.8171456Z test_counter_proof_a_service_of_agent_m_is_found (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_a_service_of_agent_m_is_found) ... ok
2026-10-10T21:12:03.8208489Z test_counter_proof_what_the_product_holds_or_nobody_holds_is_no_finding (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_counter_proof_what_the_product_holds_or_nobody_holds_is_no_finding) ... ok
2026-10-10T21:12:03.8272066Z test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_no_artifact_of_the_fixture_product_references_what_exists_only_inside_agent_m) ... ok
2026-10-10T21:12:03.8274251Z test_the_fixture_product_is_made_by_agent_ms_writers (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_the_fixture_product_is_made_by_agent_ms_writers) ... ok
2026-10-10T21:12:03.8276907Z test_the_reader_finds_the_references_the_fixture_makes (test_self_sufficient.ProductRepositoryIsSelfSufficient.test_the_reader_finds_the_references_the_fixture_makes) ... ok
2026-10-10T21:12:03.8321748Z test_the_dashboard_says_neither_stand_in_nor_surrogate (test_settings_disclosure.PseudonymisationExplained.test_the_dashboard_says_neither_stand_in_nor_surrogate) ... ok
2026-10-10T21:12:03.9076584Z test_the_explanation_names_the_rewriting_without_persons (test_settings_disclosure.PseudonymisationExplained.test_the_explanation_names_the_rewriting_without_persons) ... ok
2026-10-10T21:12:03.9086591Z test_the_setting_shows_that_explanation (test_settings_disclosure.PseudonymisationExplained.test_the_setting_shows_that_explanation) ... ok
2026-10-10T21:12:03.9859179Z test_a_public_repository_is_warned_of_publication (test_settings_disclosure.PseudonymisationOffDisclosure.test_a_public_repository_is_warned_of_publication) ... ok
2026-10-10T21:12:04.0624081Z test_the_notice_states_what_follows (test_settings_disclosure.PseudonymisationOffDisclosure.test_the_notice_states_what_follows) ... ok
2026-10-10T21:12:04.0632829Z test_the_page_shows_the_notice_before_saving (test_settings_disclosure.PseudonymisationOffDisclosure.test_the_page_shows_the_notice_before_saving) ... ok
2026-10-10T21:12:04.1392766Z test_notice_names_the_owner_domain (test_settings_disclosure.SettingsDisclosure.test_notice_names_the_owner_domain) ... ok
2026-10-10T21:12:04.1404421Z test_settings_view_shows_the_notice_before_the_input (test_settings_disclosure.SettingsDisclosure.test_settings_view_shows_the_notice_before_the_input) ... ok
2026-10-10T21:12:04.1885311Z test_nothing_can_be_stored_before_acknowledging (test_settings_in_the_core.SettingsDisclosure.test_nothing_can_be_stored_before_acknowledging) ... ok
2026-10-10T21:12:04.3135731Z test_counter_proof_a_key_without_a_place_fails (test_settings_page.EverySettingOnOnePage.test_counter_proof_a_key_without_a_place_fails) ... ok
2026-10-10T21:12:04.5169139Z test_every_key_the_store_writes_has_a_place_on_the_page (test_settings_page.EverySettingOnOnePage.test_every_key_the_store_writes_has_a_place_on_the_page) ... ok
2026-10-10T21:12:04.5174191Z test_the_store_writes_no_key_but_its_named_ones (test_settings_page.EverySettingOnOnePage.test_the_store_writes_no_key_but_its_named_ones) ... ok
2026-10-10T21:12:04.5934543Z test_default_expiry_is_the_links_90_days (test_settings_page.ExpiryWarnedInAdvance.test_default_expiry_is_the_links_90_days) ... ok
2026-10-10T21:12:04.5949235Z test_storing_a_token_asks_for_its_expiry (test_settings_page.ExpiryWarnedInAdvance.test_storing_a_token_asks_for_its_expiry) ... ok
2026-10-10T21:12:04.6726962Z test_the_banner_on_every_page_carries_renew (test_settings_page.ExpiryWarnedInAdvance.test_the_banner_on_every_page_carries_renew) ... ok
2026-10-10T21:12:04.7997528Z test_the_state_line_names_the_expiry (test_settings_page.ExpiryWarnedInAdvance.test_the_state_line_names_the_expiry) ... ok
2026-10-10T21:12:04.8796100Z test_warning_from_fourteen_days_before (test_settings_page.ExpiryWarnedInAdvance.test_warning_from_fourteen_days_before) ... ok
2026-10-10T21:12:04.9565994Z test_counter_proof_no_token_no_line_but_the_setting_keeps_its_place (test_settings_page.GitLabTokensOnThePage.test_counter_proof_no_token_no_line_but_the_setting_keeps_its_place) ... ok
2026-10-10T21:12:05.2157448Z test_expiry_warned_and_refusal_named (test_settings_page.GitLabTokensOnThePage.test_expiry_warned_and_refusal_named) ... ok
2026-10-10T21:12:05.3431831Z test_one_line_per_token_with_test_change_clear (test_settings_page.GitLabTokensOnThePage.test_one_line_per_token_with_test_change_clear) ... ok
2026-10-10T21:12:05.6010898Z test_the_token_is_hidden_until_shown (test_settings_page.GitLabTokensOnThePage.test_the_token_is_hidden_until_shown) ... ok
2026-10-10T21:12:05.7297115Z test_counter_proof_after_show_the_bridge_token_appears_in_full (test_settings_page.JumpHostAndRemoteSessions.test_counter_proof_after_show_the_bridge_token_appears_in_full) ... ok
2026-10-10T21:12:05.8573848Z test_each_session_has_its_commands_test_and_clear (test_settings_page.JumpHostAndRemoteSessions.test_each_session_has_its_commands_test_and_clear) ... ok
2026-10-10T21:12:05.9828678Z test_the_bridge_token_is_hidden_until_shown (test_settings_page.JumpHostAndRemoteSessions.test_the_bridge_token_is_hidden_until_shown) ... ok
2026-10-10T21:12:06.1096385Z test_the_jump_host_is_shown_with_test_change_clear (test_settings_page.JumpHostAndRemoteSessions.test_the_jump_host_is_shown_with_test_change_clear) ... ok
2026-10-10T21:12:06.2349354Z test_without_a_jump_host_no_command_is_written (test_settings_page.JumpHostAndRemoteSessions.test_without_a_jump_host_no_command_is_written) ... ok
2026-10-10T21:12:06.3199521Z test_the_store_has_no_product_setting (test_settings_page.ProductSettingsInTheRepository.test_the_store_has_no_product_setting) ... ok
2026-10-10T21:12:06.4480716Z test_a_stored_secret_is_rendered_hidden (test_settings_page.SecretHiddenUntilShown.test_a_stored_secret_is_rendered_hidden) ... ok
2026-10-10T21:12:06.5726991Z test_counter_proof_after_show_it_appears_in_full (test_settings_page.SecretHiddenUntilShown.test_counter_proof_after_show_it_appears_in_full) ... ok
2026-10-10T21:12:06.5728246Z test_counter_proof_a_row_without_clear_is_seen (test_settings_page.TestedAndCleared.test_counter_proof_a_row_without_clear_is_seen) ... ok
2026-10-10T21:12:06.6981559Z test_each_browser_setting_has_test_and_clear (test_settings_page.TestedAndCleared.test_each_browser_setting_has_test_and_clear) ... ok
2026-10-10T21:12:07.0245664Z test_the_last_test_is_read_from_the_browser (test_settings_page.TestedAndCleared.test_the_last_test_is_read_from_the_browser) ... ok
2026-10-10T21:12:07.2517627Z test_a_conjunction_in_the_rule_is_a_warning (test_single_statement.SingleStatement.test_a_conjunction_in_the_rule_is_a_warning) ... ok
2026-10-10T21:12:07.3640329Z test_counter_proof_no_conjunction_no_warning (test_single_statement.SingleStatement.test_counter_proof_no_conjunction_no_warning) ... ok
2026-10-10T21:12:07.3699027Z test_an_open_queue_is_not_written_by_the_workflow (test_spec_gate.SpecGate.test_an_open_queue_is_not_written_by_the_workflow) ... ok
2026-10-10T21:12:07.3734784Z test_only_the_entry_a_record_names_is_written_by_the_workflow (test_spec_gate.SpecGate.test_only_the_entry_a_record_names_is_written_by_the_workflow) ... ok
2026-10-10T21:12:07.4463770Z test_the_dashboard_changes_no_byte_outside_the_accepted_section (test_spec_gate.SpecGate.test_the_dashboard_changes_no_byte_outside_the_accepted_section) ... ok
2026-10-10T21:12:07.4505347Z test_the_workflow_changes_no_byte_outside_the_approved_section (test_spec_gate.SpecGate.test_the_workflow_changes_no_byte_outside_the_approved_section) ... expected failure
2026-10-10T21:12:07.5616836Z test_a_step_without_explanation_is_refused (test_step_explanations.StepExplanations.test_a_step_without_explanation_is_refused) ... ok
2026-10-10T21:12:07.5663737Z test_the_app_renders_steps_only_through_stepHtml (test_step_explanations.StepExplanations.test_the_app_renders_steps_only_through_stepHtml) ... ok
2026-10-10T21:12:07.6137944Z test_a_file_that_is_no_test_owes_no_level (test_test_levels.TestLevels.test_a_file_that_is_no_test_owes_no_level) ... ok
2026-10-10T21:12:08.2029692Z test_counter_proof_no_level_more_than_one_or_another_one (test_test_levels.TestLevels.test_counter_proof_no_level_more_than_one_or_another_one) ... ok
2026-10-10T21:12:08.5442247Z test_every_test_of_the_fixture_has_one_level (test_test_levels.TestLevels.test_every_test_of_the_fixture_has_one_level) ... ok
2026-10-10T21:12:08.6917629Z test_the_header_of_a_test_is_read (test_test_levels.TestLevels.test_the_header_of_a_test_is_read) ... ok
2026-10-10T21:12:08.7740283Z test_a_closed_sprint_names_its_end (test_time_box_selection.TestASprintIsRead.test_a_closed_sprint_names_its_end) ... ok
2026-10-10T21:12:08.8245222Z test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty (test_time_box_selection.TestASprintIsRead.test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty) ... ok
2026-10-10T21:12:08.9122792Z test_a_sprint_naming_no_closer_and_no_branch_leaves_both_empty (test_time_box_selection.TestASprintIsRead.test_a_sprint_naming_no_closer_and_no_branch_leaves_both_empty) ... ok
2026-10-10T21:12:09.0665585Z test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem) ... ok
2026-10-10T21:12:09.2692288Z test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem) ... ok
2026-10-10T21:12:09.3709313Z test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem) ... ok
2026-10-10T21:12:09.4201938Z test_counter_proof_a_text_without_front_matter_is_no_sprint_record (test_time_box_selection.TestASprintThatIsNotOne.test_counter_proof_a_text_without_front_matter_is_no_sprint_record) ... ok
2026-10-10T21:12:09.4205550Z test_every_sprint_record_of_this_repository_is_read_without_a_problem (test_time_box_selection.TestAgentMsOwnSprints.test_every_sprint_record_of_this_repository_is_read_without_a_problem) ... skipped 'this repository has no sprint records'
2026-10-10T21:12:09.4208703Z test_sprint_01_is_closed_and_sprint_02_runs (test_time_box_selection.TestAgentMsOwnSprints.test_sprint_01_is_closed_and_sprint_02_runs) ... skipped 'this repository has no sprint records'
2026-10-10T21:12:09.5077469Z test_a_selected_item_starts (test_time_box_selection.TestOnlyTheSelectionStarts.test_a_selected_item_starts) ... ok
2026-10-10T21:12:09.5982197Z test_a_sprint_not_yet_begun_starts_nothing (test_time_box_selection.TestOnlyTheSelectionStarts.test_a_sprint_not_yet_begun_starts_nothing) ... ok
2026-10-10T21:12:09.7765664Z test_a_time_box_ends_on_its_end_date (test_time_box_selection.TestOnlyTheSelectionStarts.test_a_time_box_ends_on_its_end_date) ... ok
2026-10-10T21:12:09.8662377Z test_an_item_outside_the_selection_is_refused_with_the_sprint_named (test_time_box_selection.TestOnlyTheSelectionStarts.test_an_item_outside_the_selection_is_refused_with_the_sprint_named) ... ok
2026-10-10T21:12:10.0431379Z test_counter_proof_a_model_without_sprints_has_no_selection_to_keep (test_time_box_selection.TestOnlyTheSelectionStarts.test_counter_proof_a_model_without_sprints_has_no_selection_to_keep) ... ok
2026-10-10T21:12:10.1365427Z test_with_no_sprint_running_nothing_starts (test_time_box_selection.TestOnlyTheSelectionStarts.test_with_no_sprint_running_nothing_starts) ... ok
2026-10-10T21:12:10.3092817Z test_without_a_time_box_a_recorded_end_ends_the_sprint (test_time_box_selection.TestOnlyTheSelectionStarts.test_without_a_time_box_a_recorded_end_ends_the_sprint) ... ok
2026-10-10T21:12:10.3998341Z test_a_selected_item_above_the_limit_is_refused_for_the_limit_only (test_time_box_selection.TestSprintsAndALimitBothHold.test_a_selected_item_above_the_limit_is_refused_for_the_limit_only) ... ok
2026-10-10T21:12:10.4874411Z test_a_selected_item_below_the_limit_starts (test_time_box_selection.TestSprintsAndALimitBothHold.test_a_selected_item_below_the_limit_starts) ... ok
2026-10-10T21:12:10.5757755Z test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection.TestSprintsAndALimitBothHold.test_an_item_outside_the_selection_above_the_limit_is_refused_for_both) ... ok
2026-10-10T21:12:10.6650847Z test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only (test_time_box_selection.TestSprintsAndALimitBothHold.test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only) ... ok
2026-10-10T21:12:10.6653093Z test_counter_proof_a_missing_or_extra_permission_is_seen (test_token_scope_documented.TokenScopeDocumented.test_counter_proof_a_missing_or_extra_permission_is_seen) ... ok
2026-10-10T21:12:10.7424936Z test_guidance_names_minimum_scope_and_reason (test_token_scope_documented.TokenScopeDocumented.test_guidance_names_minimum_scope_and_reason) ... ok
2026-10-10T21:12:10.8232030Z test_link_asks_for_exactly_the_one_token_permissions (test_token_scope_documented.TokenScopeDocumented.test_link_asks_for_exactly_the_one_token_permissions) ... ok
2026-10-10T21:12:10.8993794Z test_steps_carry_the_scope (test_token_scope_documented.TokenScopeDocumented.test_steps_carry_the_scope) ... ok
2026-10-10T21:12:10.8997161Z test_counter_proof (test_usecase_fields.UseCaseFiles.test_counter_proof) ... ok
2026-10-10T21:12:10.9083419Z test_every_use_case_is_complete (test_usecase_fields.UseCaseFiles.test_every_use_case_is_complete) ... ok
2026-10-10T21:12:10.9086788Z test_ids_are_unique (test_usecase_fields.UseCaseFiles.test_ids_are_unique) ... ok
2026-10-10T21:12:10.9088280Z test_the_old_key_stage_is_named (test_usecase_fields.UseCaseFiles.test_the_old_key_stage_is_named) ... ok
2026-10-10T21:12:10.9093431Z test_there_are_use_cases (test_usecase_fields.UseCaseFiles.test_there_are_use_cases) ... ok
2026-10-10T21:12:10.9096091Z test_a_name_in_another_form_is_reported (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_name_in_another_form_is_reported) ... ok
2026-10-10T21:12:10.9098460Z test_a_name_no_requirement_has_is_reported (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_name_no_requirement_has_is_reported) ... ok
2026-10-10T21:12:10.9101046Z test_a_use_case_realising_known_requirements_passes (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_use_case_realising_known_requirements_passes) ... ok
2026-10-10T21:12:10.9103923Z test_a_use_case_that_realises_nothing_is_reported (test_usecase_realises.UseCaseRealisesNamedRequirements.test_a_use_case_that_realises_nothing_is_reported) ... ok
2026-10-10T21:12:10.9190419Z test_every_use_case_of_this_repository_names_requirements_by_name (test_usecase_realises.UseCaseRealisesNamedRequirements.test_every_use_case_of_this_repository_names_requirements_by_name) ... ok
2026-10-10T21:12:10.9809874Z test_the_dashboards_reader_reports_the_same_name_on_its_line (test_usecase_realises.UseCaseRealisesNamedRequirements.test_the_dashboards_reader_reports_the_same_name_on_its_line) ... ok
2026-10-10T21:12:10.9812453Z test_the_problem_names_the_file (test_usecase_realises.UseCaseRealisesNamedRequirements.test_the_problem_names_the_file) ... ok
2026-10-10T21:12:10.9815434Z test_without_known_names_only_the_form_is_checked (test_usecase_realises.UseCaseRealisesNamedRequirements.test_without_known_names_only_the_form_is_checked) ... ok
2026-10-10T21:12:11.0532908Z test_blank_lines_at_the_end_of_a_proposal_are_written (test_verbatim.Verbatim.test_blank_lines_at_the_end_of_a_proposal_are_written) ... expected failure
2026-10-10T21:12:11.6422417Z test_both_writers_write_the_approved_text_byte_for_byte (test_verbatim.Verbatim.test_both_writers_write_the_approved_text_byte_for_byte) ... ok
2026-10-10T21:12:11.7162365Z test_cr_bytes_of_a_proposal_are_never_written_reformulated (test_verbatim.Verbatim.test_cr_bytes_of_a_proposal_are_never_written_reformulated) ... ok
2026-10-10T21:12:11.8045122Z test_an_item_in_progress_is_not_counted_against_itself (test_wip_limit.TestTheLimitOfTwo.test_an_item_in_progress_is_not_counted_against_itself) ... ok
2026-10-10T21:12:11.9828204Z test_counter_proof_with_one_item_in_progress_the_start_succeeds (test_wip_limit.TestTheLimitOfTwo.test_counter_proof_with_one_item_in_progress_the_start_succeeds) ... ok
2026-10-10T21:12:12.0703411Z test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit.TestTheLimitOfTwo.test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named) ... ok
2026-10-10T21:12:12.1591752Z test_with_one_of_the_two_done_the_start_succeeds (test_wip_limit.TestTheLimitOfTwo.test_with_one_of_the_two_done_the_start_succeeds) ... ok
2026-10-10T21:12:12.2477906Z test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit.TestWhatCountsAsInProgress.test_a_blocked_item_holds_its_slot_until_it_is_merged) ... ok
2026-10-10T21:12:12.3381665Z test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit.TestWhatCountsAsInProgress.test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch) ... ok
2026-10-10T21:12:12.4259602Z test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit.TestWhatCountsAsInProgress.test_a_running_job_counts_and_is_not_named_as_in_review) ... ok
2026-10-10T21:12:12.5152326Z test_an_item_waiting_for_review_counts_whatever_its_job_does (test_wip_limit.TestWhatCountsAsInProgress.test_an_item_waiting_for_review_counts_whatever_its_job_does) ... ok
2026-10-10T21:12:12.7786964Z test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot (test_wip_limit.TestWhatCountsAsInProgress.test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot) ... ok
2026-10-10T21:12:13.0476024Z test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot (test_wip_limit.TestWhatCountsAsInProgress.test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot) ... ok
2026-10-10T21:12:13.1358102Z test_a_model_without_a_wip_limit_refuses_no_start_for_it (test_wip_limit.TestWithoutALimit.test_a_model_without_a_wip_limit_refuses_no_start_for_it) ... ok
2026-10-10T21:12:13.1359183Z 
2026-10-10T21:12:13.1359562Z ----------------------------------------------------------------------
2026-10-10T21:12:13.1360211Z Ran 396 tests in 58.147s
2026-10-10T21:12:13.1360458Z 
2026-10-10T21:12:13.1360692Z OK (skipped=5, expected failures=6)
```

## Failures

| Test | Expected | Observed | Log |
|---|---|---|---|
| UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case |  | &#124;- | not ok 149 - UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case<br>  ---<br>  duration_ms: 108.273548<br>  type: 'test'<br>  location: '/home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:284:1'<br>  failureType: 'testCodeFailure'<br>  error: &#124;-<br>    The input did not match the regular expression /HostError.*NotFound/i. Input:<br>    <br>    '<p class="warn">Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it.</p>\n' +<br>      '      \n' +<br>      '      \n' +<br>      '      \n' +<br>      '      \n' +<br>      '      \n' +<br>      '      \n' +<br>      '      \n' +<br>      '      '<br>    <br>  code: 'ERR_ASSERTION'<br>  name: 'AssertionError'<br>  expected:<br>  actual: &#124;-<br>    <p class="warn">Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it.</p><br>          <br>          <br>          <br>          <br>          <br>          <br>          <br>          <br>  operator: 'match'<br>  stack: &#124;-<br>    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:297:10)<br>    async Test.run (node:internal/test_runner/test:1054:7)<br>    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)<br>  ... |
| UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md | 'settings: pseudonymisation off (Agent M dashboard)' | 'edit settings.md (Agent M dashboard)' | not ok 185 - UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md<br>  ---<br>  duration_ms: 248.520814<br>  type: 'test'<br>  location: '/home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:939:1'<br>  failureType: 'testCodeFailure'<br>  error: &#124;-<br>    Expected values to be strictly equal:<br>    + actual - expected<br>    <br>    + 'edit settings.md (Agent M dashboard)'<br>    - 'settings: pseudonymisation off (Agent M dashboard)'<br>    <br>  code: 'ERR_ASSERTION'<br>  name: 'AssertionError'<br>  expected: 'settings: pseudonymisation off (Agent M dashboard)'<br>  actual: 'edit settings.md (Agent M dashboard)'<br>  operator: 'strictEqual'<br>  stack: &#124;-<br>    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/dashboard-review-flows.test.mjs:959:10)<br>    async Test.run (node:internal/test_runner/test:1054:7)<br>    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)<br>  ... |
| a second load on an unchanged tree reads its displayed files again |  | ordinary TAP failure | not ok 315 - a second load on an unchanged tree reads its displayed files again<br>  ---<br>  duration_ms: 183.188866<br>  type: 'test'<br>  location: '/home/runner/work/agent-m/agent-m/tests/load-per-view.test.mjs:153:1'<br>  failureType: 'testCodeFailure'<br>  error: &#124;-<br>    Expected values to be strictly deep-equal:<br>    + actual - expected<br>    <br>      [<br>    +   'docs/approvals/UC-001-be750847452f.md',<br>        'docs/approvals/UC-002-a54bc1ba2797.md',<br>        'docs/use-cases/README.md',<br>        'docs/use-cases/UC-001-read-a-file.md',<br>        'docs/use-cases/UC-002-show-the-status.md'<br>      ]<br>    <br>  code: 'ERR_ASSERTION'<br>  name: 'AssertionError'<br>  expected:<br>    0: 'docs/approvals/UC-002-a54bc1ba2797.md'<br>    1: 'docs/use-cases/README.md'<br>    2: 'docs/use-cases/UC-001-read-a-file.md'<br>    3: 'docs/use-cases/UC-002-show-the-status.md'<br>  actual:<br>    0: 'docs/approvals/UC-001-be750847452f.md'<br>    1: 'docs/approvals/UC-002-a54bc1ba2797.md'<br>    2: 'docs/use-cases/README.md'<br>    3: 'docs/use-cases/UC-001-read-a-file.md'<br>    4: 'docs/use-cases/UC-002-show-the-status.md'<br>  operator: 'deepStrictEqual'<br>  stack: &#124;-<br>    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/load-per-view.test.mjs:164:10)<br>    async Test.run (node:internal/test_runner/test:1054:7)<br>    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)<br>  ... |
| declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding |  | ordinary TAP failure | not ok 378 - declarationSchema — a declaration without its model's version is named; this instance's own docs/process.md is read without a finding<br>  ---<br>  duration_ms: 2.409991<br>  type: 'test'<br>  location: '/home/runner/work/agent-m/agent-m/tests/product-process.test.mjs:388:1'<br>  failureType: 'testCodeFailure'<br>  error: &#124;-<br>    Expected values to be strictly deep-equal:<br>    + actual - expected<br>    <br>    + []<br>    - [<br>    -   [<br>    -     'Product Owner',<br>    -     [<br>    -       'po-opus'<br>    -     ]<br>    -   ],<br>    -   [<br>    -     'Scrum Master',<br>    -     [<br>    -       'scrum-master-session'<br>    -     ]<br>    -   ],<br>    -   [<br>    -     'Developers',<br>    -     [<br>    -       'developer-sonnet-a',<br>    -       'developer-sonnet-b',<br>    -       'developer-sonnet-c',<br>    -       'developer-sonnet-d',<br>    -       'developer-sonnet-e'<br>    -     ]<br>    -   ]<br>    - ]<br>    <br>  code: 'ERR_ASSERTION'<br>  name: 'AssertionError'<br>  expected:<br>    0:<br>      0: 'Product Owner'<br>      1:<br>        0: 'po-opus'<br>    1:<br>      0: 'Scrum Master'<br>      1:<br>        0: 'scrum-master-session'<br>    2:<br>      0: 'Developers'<br>      1:<br>        0: 'developer-sonnet-a'<br>        1: 'developer-sonnet-b'<br>        2: 'developer-sonnet-c'<br>        3: 'developer-sonnet-d'<br>        4: 'developer-sonnet-e'<br>  actual:<br>  operator: 'deepStrictEqual'<br>  stack: &#124;-<br>    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/product-process.test.mjs:396:10)<br>    Test.runInAsyncScope (node:async_hooks:214:14)<br>    Test.run (node:internal/test_runner/test:1047:25)<br>    Test.processPendingSubtests (node:internal/test_runner/test:744:18)<br>    Test.postRun (node:internal/test_runner/test:1173:19)<br>    Test.run (node:internal/test_runner/test:1101:12)<br>    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)<br>  ... |
| release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown |  | ' Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it. ' | not ok 455 - release · UC-008 1a: a private repository is read with the token, and without one that reaches it nothing is shown<br>  ---<br>  duration_ms: 119.518803<br>  type: 'test'<br>  location: '/home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:427:1'<br>  failureType: 'testCodeFailure'<br>  error: &#124;-<br>    The input did not match the regular expression /HostError.*NotFound/i. Input:<br>    <br>    ' Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it. '<br>    <br>  code: 'ERR_ASSERTION'<br>  name: 'AssertionError'<br>  expected:<br>  actual: ' Could not read akmaier/agent-m @ main: https://github.com/akmaier/agent-m at main was not found — a private repository is found only with a token that reaches it. '<br>  operator: 'match'<br>  stack: &#124;-<br>    TestContext.<anonymous> (file:///home/runner/work/agent-m/agent-m/tests/release-sprint-01-dashboard-app.test.mjs:437:10)<br>    async Test.run (node:internal/test_runner/test:1054:7)<br>    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)<br>  ... |
