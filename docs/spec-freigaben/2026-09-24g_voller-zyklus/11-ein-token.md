## 7. Configuration and secrets

**CONFIGURATION LIVES IN THE BROWSER** *(PO A. Maier, 2026-09-23, extended 2026-09-25)*
Endpoint, model, model API key, the repository tokens, the list of products, the bridge's address and
token, and the mailbox connection are stored in the browser of the person using the site; Agent M has
no other store for them.
*Occasion:* the Product Owner's requirement — no API key is exposed to the repository. With no
server (§0) the browser is the only place left, which makes the property structural rather than a
promise.
*Check:* `tests/test_config_client_side.py`

**SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS** *(PO A. Maier, 2026-09-29)*
The dashboard exports all its browser settings — tokens, keys and passwords included — as one file, and
imports them from such a file.
*Occasion:* PO, 2026-09-29: "I want to be able to move from one browser store to another, so exporting
including secrets is useful." Everything lives in one browser (`CONFIGURATION LIVES IN THE BROWSER`);
with the secrets in the file, a second computer is set up by one import. The file is the person's own
copy: Agent M writes it to no repository (`NO SECRET IN THE REPOSITORY`) and puts it in no URL.
*Check:* `tests/review-core.test.mjs` — an import of an export restores every setting, secrets included;
counter-proof: no export is ever committed or sent anywhere by the dashboard.

**AN EXPORT STATES THAT IT CONTAINS SECRETS** *(PO A. Maier, 2026-09-29)*
Before an export is saved, the dashboard states that the file contains every token, key and password it
holds, and what each of them grants.
*Occasion:* a file with the GitHub token and a mailbox password opens the person's repositories and mail
to whoever holds it; the person decides where to keep it knowing that.
*Check:* `tests/test_settings_disclosure.py`

**EVERY SETTING IS REACHED FROM ONE PAGE** *(PO A. Maier, 2026-09-28)*
Every setting Agent M uses — kept in this browser, in the instance repository or in a product's
repository — is reached from one settings page.
*Occasion:* PO, 2026-09-28: settings "such as access tokens, workspace configuration and other user
settings … We should be able to handle this centrally." They were set up in seven use cases (UC-001,
UC-003, UC-011, UC-014, UC-017, UC-037, UC-038); none showed them together, so a person could not see
what is stored where, nor change it.
*Check:* `tests/test_settings_page.py` — every key the dashboard writes to `localStorage` appears on the
page; counter-proof: a fixture key without a place on the page fails.

**A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN** *(PO A. Maier, 2026-09-28)*
Each setting kept in the browser is shown with a test of whether it still works and a control that
clears it.
*Occasion:* "does my token still work?" and "remove the mailbox from this browser" are the two questions a
settings page must answer on the spot (`A CLEAR IS A REAL CLEAR`).
*Check:* `tests/test_settings_page.py`

**A STORED SECRET IS HIDDEN UNTIL SHOWN** *(PO A. Maier, 2026-09-29)*
A stored token, key or password is displayed in a password field with a *Show* control that reveals it
in full.
*Occasion:* PO, 2026-09-29: "It's ok to use password fields, but they should have a 'show' button that
allows to check whether the token is the correct one." Hidden by default for screen shares; shown on
request to compare it with the token on GitHub's page or to copy it.
*Check:* `tests/test_settings_page.py` — a stored secret is rendered hidden; counter-proof: after *Show*
it appears in full.

**A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE** *(PO A. Maier, 2026-09-28)*
For each stored token, the settings page shows the expiry date recorded when it was stored, and the
dashboard warns from fourteen days before it.
*Occasion:* the prefilled GitHub token expires after 90 days (`THE TOKEN LINK IS PREFILLED`), and an
expired token stops everything at once. Measured 2026-09-28: GitHub sends a token's expiry in a response
header that its API does not expose to web pages (`Access-Control-Expose-Headers` omits it), so the date
is the one the person set — preset to the prefilled 90 days — and entered when storing.
*Check:* `tests/test_settings_page.py`

**AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED** *(PO A. Maier, 2026-09-28)*
When a server refuses a stored token, the dashboard names that token and links the page on which it is
renewed with the same permissions and repositories.
*Occasion:* "401" teaches nothing. GitHub's *Regenerate token* keeps a fine-grained token's
permissions and repository selection; only the new value has to be pasted.
*Check:* `tests/review-core.test.mjs` — a refused request yields the token's name and the renewal link.

**A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY** *(PO A. Maier, 2026-09-28)*
Settings that govern how a product is developed — its process model, Definition of Done, test
schedule, pseudonymisation and collaborators — are kept in files of the product's repository, never only
in a browser.
*Occasion:* they bind everyone who works on the product and every agent that runs for it; a setting in one
person's browser would bind no one else.
*Check:* `tests/test_settings_page.py` — changing a product setting on the page commits to the product
repository; counter-proof: `localStorage` holds no product setting.

**CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE** *(PO A. Maier, 2026-09-23)*
Configuration is written to `localStorage`; Agent M sets no cookie carrying configuration or
credentials.
*Occasion:* a cookie set on the Pages origin is attached to every request to that origin and
therefore travels to GitHub's servers on each page load — the exposure the requirement exists to
prevent. `localStorage` is read only by script on the page and is never transmitted.
*Check:* `tests/test_no_config_cookie.py`

**A CREDENTIAL IS NEVER PLACED IN A URL** *(PO A. Maier, 2026-09-23)*
No key, token or credential appears in a query string, a fragment, or a link.
*Occasion:* URLs are logged by proxies, kept in browser history, and pasted into bug reports. A
credential that has been in a URL must be assumed to have leaked.
*Check:* `tests/test_no_credential_in_url.py`

**A TOKEN IS SCOPED TO WHAT IT WRITES** *(PO A. Maier, 2026-09-23)*
Every repository token Agent M asks for carries write access only to the repositories of the
instance and the products it manages.
*Occasion:* each managed product is its own repository, so the page needs cross-repository access.
An account-wide token to edit one product's requirements is more authority than the task needs,
and the reader is the one who bears the consequence.
*Check:* `tests/test_token_scope_documented.py` — the configuration screen states the minimum
scope and why each part is needed.

**THE PAGE STATES WHAT IT SENDS WHERE** *(PO A. Maier, 2026-09-23)*
Before a run, Agent M names every destination it will contact and what it will send there.
*Occasion:* a reader is about to send their requirements — possibly their employer's requirements —
to a third-party model endpoint. That is a decision they should make knowingly, once, rather than
discover afterwards.
*Check:* `tests/test_destination_disclosure.py`

**A CLEAR IS A REAL CLEAR** *(PO A. Maier, 2026-09-23)*
Clearing the configuration removes the stored credentials from the browser, not only from the
displayed form.
*Occasion:* a reset that leaves the key in storage is worse than no reset, because the reader
believes the key is gone.
*Check:* `tests/test_clear_removes_storage.py`

**THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN** *(PO A. Maier, 2026-09-23)*
Agent M uses a fine-grained personal access token that the person creates on github.com and pastes
into Agent M's settings.
*Occasion:* a "Sign in with GitHub" flow exchanges a code for a token, and that exchange needs a
server (§0 `NO SERVER`). A pasted token needs none, and the person decides its scope and expiry on
GitHub's own page.
*Check:* no automatic check; at review.

**THE TOKEN IS SENT ONLY TO GITHUB** *(PO A. Maier, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* products may live on GitLab servers, whose tokens go to those servers. Replaced by
`A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`. The name is not reused.

**A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT** *(PO A. Maier, 2026-09-24)*
Each repository token leaves the browser only as the authorisation header of requests to the API of
the server that issued it.
*Occasion:* a credential that can reach another origin can leak there. A GitHub token never goes to
a GitLab server, a GitLab token never to GitHub or to another GitLab, and no token to the model
endpoint.
*Check:* `tests/review-core.test.mjs`

**THE SHARED PAGES ORIGIN IS DISCLOSED** *(PO A. Maier, 2026-09-23)*
The settings page states, before a token or key is stored, that every GitHub Pages site under the
same `<owner>.github.io` domain can read what Agent M stores in the browser.
*Occasion:* browser storage belongs to the origin, not to the path. Measured 2026-09-23: seven Pages
sites share `https://akmaier.github.io`, and each could read Agent M's storage. The person decides
whether that is acceptable, or hosts their instance under an owner used for nothing else.
*Check:* `tests/test_settings_disclosure.py`

**THE TOKEN LINK IS PREFILLED** *(PO A. Maier, 2026-09-24)*
Agent M links to GitHub's page for new fine-grained tokens with name, description, expiry and the
required permissions already filled in.
*Occasion:* people new to GitHub should not have to find the page or know what a permission is.
Measured 2026-09-24: GitHub prefills `name`, `description`, `expires_in` and permissions such as
`contents` from the link.
*Check:* `tests/test_token_scope_documented.py`

**THE REPOSITORY CHOICE IS SPELLED OUT** *(PO A. Maier, 2026-09-24)*
Agent M tells the person to choose *Only select repositories* on GitHub's token page and names each
repository to select.
*Occasion:* the link cannot preselect repositories — GitHub documents no parameter for it — and
with prefilled permissions the page defaults to *All repositories* (measured 2026-09-24), the
broadest choice and the one `A TOKEN IS SCOPED TO WHAT IT WRITES` rules out.
*Check:* `tests/test_token_scope_documented.py`

**A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN** *(PO A. Maier, 2026-09-24)*
For a product on a GitLab server, Agent M guides the person to create a project access token for
that one project, with role *Developer* and scope `api`, and to paste it into Agent M.
*Occasion:* a GitLab personal access token with `api` scope reaches every project of its owner,
which `A TOKEN IS SCOPED TO WHAT IT WRITES` rules out. A project access token reaches one project.
It costs one token per GitLab product; where the server does not offer project access tokens, the
person is told so, and why a personal token is broader.
*Check:* `tests/review-core.test.mjs`

**ONE GITHUB TOKEN SERVES EVERY FEATURE** *(PO A. Maier, 2026-09-24)*
On GitHub, Agent M asks a person for one fine-grained token that carries every permission its
features need on the repositories the person selects — *Contents* and *Issues* read and write,
*Actions* read and write, *Metadata* read.
*Occasion:* PO, 2026-09-24: "Better to keep it in one token; otherwise users are overwhelmed."
Issues from mail need *Issues*, starting a CI run needs *Actions*; a second and a third token would
triple the setup that UC-014 just made manageable. The scope stays limited by the repository
selection (`A TOKEN IS SCOPED TO WHAT IT WRITES`), and a GitLab product keeps its project token
(`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`).
*Check:* `tests/test_token_scope_documented.py` — the prefilled link asks for exactly these
permissions.
