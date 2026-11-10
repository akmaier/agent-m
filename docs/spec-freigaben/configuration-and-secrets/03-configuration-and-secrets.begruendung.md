# 7. Configuration and secrets: a repository token travels to the Bridge this browser is paired with

**The change.**
- `CONFIGURATION LIVES IN THE BROWSER`: a repository token is also stored in the data folder of a Bridge this browser is
  paired with. Its check is unchanged.
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`: a repository token may also leave the browser in the body of a request
  to a Bridge this browser is paired with, which sends it on only to the server that issued it, as the authorisation of
  its git and API requests for the token's repository. Its check adds `tests/bridge-repository-tokens.test.mjs`.

Every other byte of the section is carried over, `NO MODEL READS A CREDENTIAL` among it: it keeps holding, for a
repository token on a Bridge as for every other credential the Bridge holds.

**Why.** akmaier decided on 2026-11-10 that "the browser's repository token (the one the person pasted in the dashboard,
per host: GitHub or GitLab) is sent automatically to the Bridge this browser is paired with, and the Bridge uses it for
its git (clone, fetch, push) and for pull/merge requests through Agent M's own MOD-repository-hosts (GitHub AND
GitLab), replacing the dependency on the computer's own git login and on the `gh` CLI". His reason: the workflow so far
works only for GitHub, where the Bridge opens pull requests with `gh`, and not for GitLab; a token that travels is more
versatile, and easier for the person, who sets up no git login on the Bridge's computer. No token is entered in the
Bridge's window.

The two rules said that a token never left the browser but to its server, and that the browser was the only store of
it; with the decision both would be broken by the Bridge, so both name the Bridge. A token reaches the Bridge over the
channel the person paired, with the pairing token (`THE LOCAL BRIDGE REQUIRES A TOKEN`), and goes from the Bridge to no
other server than the one that issued it, so that what the rule protects — no third server receives a token — stays
as it was. The Bridge keeps it in its data folder, which every enclosure hides (ARC-054), and hands it to its own git
only, never to an agent (`NO MODEL READS A CREDENTIAL`).

A Bridge reached at the jump host's HTTPS address receives the token through the jump host's web server, as it receives
its pairing token and, for a mailbox through that Bridge, the mailbox password (`A MAILBOX THROUGH THE JUMP HOST IS NAMED
AS READABLE THERE`); the settings page says to which Bridges the tokens go (UC-044, step 4).

**Impact list.**
- `CONFIGURATION LIVES IN THE BROWSER`, changed: named by UC-001, UC-003, UC-014, UC-042 and UC-047, ARC-037, ARC-047,
  ARC-053, MOD-browser-store, ITM-003, ITM-065, ITM-204, ITM-259, ITM-262, ITM-265, ITM-269, ITM-279, ITM-283, ITM-403,
  ITM-422, ITM-687, the sprints that list them, and the headers of `tests/test_config_client_side.py` and of the tests of
  MOD-browser-store, MOD-settings-pages and the pages that keep settings. None of their sentences becomes false: each
  speaks of the browser, which keeps every setting as before. The check's cases are unchanged: no module but
  MOD-browser-store's store touches the browser's storage, and the Bridge's data folder is no browser storage.
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`, changed: named by UC-001, UC-036, UC-038, UC-042, UC-047 and UC-049,
  ARC-047, ARC-049, MOD-repository-hosts, MOD-runtimes, ITM-055, ITM-144, ITM-146, ITM-205, ITM-244, ITM-296, ITM-478,
  ITM-479, ITM-522, ITM-811, ITM-962, the sprints that list them, and the headers of the tests of MOD-repository-hosts,
  MOD-settings-pages, MOD-site-frame, MOD-prompt-bar, MOD-main-page, MOD-maintenance-pages, MOD-implementation-pages and
  MOD-markdown-render. None of their sentences becomes false: each speaks of a token on its way from the browser to its
  server, which stays as it was. UC-044, UC-011, ARC-054, MOD-bridge-jobs, MOD-bridge-http, MOD-bridge-client,
  MOD-browser-store, MOD-settings-pages and MOD-desktop-shell are drafted beside this entry.

**Origin.** github.com/akmaier, the design decided on 2026-11-10 in a conversation with Claude Code.
