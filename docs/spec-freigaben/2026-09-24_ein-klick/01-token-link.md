## 7. Configuration and secrets

**CONFIGURATION LIVES IN THE BROWSER** *(PO A. Maier, 2026-09-23)*
Endpoint, model, model API key and GitHub token are stored in the browser of the person using the
site; Agent M has no other store for them.
*Occasion:* the Product Owner's requirement — no API key is exposed to the repository. With no
server (§0) the browser is the only place left, which makes the property structural rather than a
promise.
*Check:* `tests/test_config_client_side.py`

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
The GitHub token Agent M asks for carries write access only to the repositories of the products it
manages.
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

**THE TOKEN IS SENT ONLY TO GITHUB** *(PO A. Maier, 2026-09-23)*
The GitHub token leaves the browser only as the authorisation header of requests to GitHub's API
and to GitHub's raw file host.
*Occasion:* a credential that can reach a third origin can leak there; the model endpoint in
particular never needs it.
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
