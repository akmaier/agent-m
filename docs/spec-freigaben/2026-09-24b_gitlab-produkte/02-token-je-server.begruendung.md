# One token per server, and on GitLab one per project

**Why `THE TOKEN IS SENT ONLY TO GITHUB` is withdrawn rather than reworded.** Its name says GitHub;
with GitLab products that is no longer the rule. Its successor keeps the property that mattered —
no token reaches an origin other than the one it belongs to — and sharpens it: a GitLab token does
not even reach a *different* GitLab server.

**Why a project access token, per your decision.** On GitHub, one fine-grained token can be limited
to a list of repositories. GitLab has no equivalent for personal tokens: with scope `api`, a personal
token reaches every project its owner can reach — at a university that can be hundreds.
`A TOKEN IS SCOPED TO WHAT IT WRITES` rules that out. A *project access token* is created inside one
project and reaches only that project. The cost: one token per GitLab product, and the person needs
the *Maintainer* role in that project to create it. Some gitlab.com plans do not offer project access
tokens at all; then Agent M says so and explains why a personal token is broader — the choice stays
with the person, but it is an informed one.

**Role Developer, scope `api`:** `api` is the scope GitLab requires for committing through the API;
*Developer* is the lowest role that may push to an unprotected branch. If the default branch is
protected, pushing needs *Maintainer* — the dashboard reports the refusal and says which setting
causes it.
