# The GitHub token goes where the model key already goes, and the shared origin is disclosed

**PO, 2026-09-23:** *"It's unclear to me how the token is stored. It must be in the local store."*

**What changes.** `CONFIGURATION LIVES IN THE BROWSER` lists the GitHub token beside endpoint, model
and model key. Everything §7 already says about configuration then applies to the token too:
`localStorage` rather than a cookie, never in a URL, scoped to the product repositories, and a clear
that really clears.

**Three new requirements, each closing one question the old text left open:**
- *How does the token get there?* It is pasted, not obtained by a login button. A GitHub login flow
  exchanges a code for a token, and that exchange needs a server, which §0 forbids. The person
  creates a fine-grained token on github.com, choosing repositories, permissions and expiry on
  GitHub's page, and pastes it.
- *Where may it go?* Only to GitHub (API and raw file host), as a header. The model endpoint in
  particular never receives it.
- *Who else can read it?* Browser storage belongs to the origin `https://<owner>.github.io`, not to
  the path `/agent-m/`. Every other Pages site of the same owner can read it. **Measured
  2026-09-23:** seven Pages sites share `https://akmaier.github.io` (agent-m, Agent4CT,
  cris-team-stats, IfCampoKnew, Project-Claudio, SPIONvsXRay, UnderstandingVCS). The fork model keeps
  one reader's tokens away from another reader's sites, but not from their own. That cannot be fixed
  in code, so the requirement is to say so before anything is stored. Hosting an instance under an
  owner used for nothing else removes it.

*Method of the measurement:* `gh api "users/akmaier/repos?per_page=100" --paginate --jq
'.[] | select(.has_pages) | .name'`. A first query with `gh repo list --json hasPagesEnabled`
returned nothing, including agent-m, which is known to have Pages. It was discarded as a broken
query, not reported as "no other sites".
