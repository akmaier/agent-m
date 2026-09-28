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
