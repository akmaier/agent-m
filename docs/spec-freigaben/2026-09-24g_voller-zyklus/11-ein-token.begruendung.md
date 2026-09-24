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
