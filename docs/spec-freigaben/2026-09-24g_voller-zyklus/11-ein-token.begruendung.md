# One GitHub token for everything

**PO decision, 2026-09-24:** *"Better to keep it in one token; otherwise users are overwhelmed."*

Three drafting groups needed more permissions than *Contents*: mail needs *Issues* (g5), starting CI
runs needs *Actions* (g2, g3), and private dependencies need read access (g6), which the repository
selection already grants. One token carries them all. The link from `THE TOKEN LINK IS PREFILLED`
asks for exactly these, and `THE REPOSITORY CHOICE IS SPELLED OUT` still limits the token to the
repositories the person picks.

**Consequence for code already built:** the dashboard currently asks for *Contents* only. It follows
once this is accepted (the implementation changes `tokenLinkUrl` and the guidance text). Tokens that
were already created need *Edit → Permissions* on GitHub once; the dashboard will say so.

**Consistency and comfort review by the main agent, 2026-09-25:**
- `CONFIGURATION LIVES IN THE BROWSER` named endpoint, key and tokens only; the pending rules also keep
  the product list (entry 05), the bridge's address and token (entry 03) and the mailbox connection
  (entry 09) there. Extended under its name; impact: UC-001, UC-003, UC-014 realise it, unchanged.
- New `SETTINGS MOVE TO ANOTHER BROWSER WITHOUT THEIR SECRETS` — so that the browser-only design does not
  make a second computer expensive.

**PO question of 2026-09-28 — "Do we have a usecase for the user to edit and access settings such as
access tokens, workspace configuration and other user settings? We should be able to handle this
centrally."** No: settings were made in seven use cases and shown together nowhere. Six new rules give
them one page (new UC-042): every setting reached from it; browser settings tested and cleared in place;
secrets only masked; token expiry warned of in advance — measured: the browser cannot read GitHub's
expiry header, so the date is recorded when the token is stored —; expired tokens named with their
renewal link; product settings kept in the product's repository.

**Changed after the PO's objection of 2026-09-29** — *"This is too restrictive and we must be able to export
and change it. It's ok to use password fields, but they should have a 'show' button that allows to check
whether the token is the correct one. Also I want to be able to move from one browser store to another, so
exporting including secrets is useful."*
- `SETTINGS MOVE TO ANOTHER BROWSER WITHOUT THEIR SECRETS` → `SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR
  SECRETS`.
- `A STORED SECRET IS SHOWN ONLY MASKED` → `A STORED SECRET IS HIDDEN UNTIL SHOWN`.
- New, by the main agent: `AN EXPORT STATES THAT IT CONTAINS SECRETS` — the file now opens repositories and
  mail; the notice is one line before saving. Strike it if not wanted.

**Decided by the PO on 2026-09-29:** *"passphrase is a good option, yes please"* — `AN EXPORT CAN BE LOCKED
WITH A PASSPHRASE`, optional, done with the browser's Web Crypto API.
