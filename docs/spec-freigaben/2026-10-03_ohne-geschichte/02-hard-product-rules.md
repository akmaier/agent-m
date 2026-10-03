## 0. Hard product rules

These five hold for every version of Agent M. A change to any of them is a change to what the
product is.

**NO SERVER** *(PO A. Maier)*
Agent M is delivered as a static site, repository conventions, and optional workflows; the project
operates no server, no account system and no database.
*Check:* `tests/test_no_backend.py` — the built site contains no call to an origin other than the
configured endpoints, the repository servers of the instance and its products, the mail provider's API
and sign-in, the local bridge, the jump host's HTTPS address, and the package registries and resource
hosts the page names before it calls them.

**ARTIFACTS ARE MARKDOWN** *(Vibe Coding, ch. 9 §6)*
Every artifact Agent M produces is Markdown, with diagrams written as Mermaid inside it.
*Check:* `tests/test_artifact_format.py`

**NO SECRET IN THE REPOSITORY** *(PO A. Maier)*
No API key, access token or endpoint credential is written into a repository managed by Agent M.
*Check:* `tests/test_no_secret_written.py` — a generated artifact containing a configured secret
value fails the run.

**THE PRODUCT REPOSITORY IS SELF-SUFFICIENT** *(PO A. Maier)*
Removing Agent M leaves a complete, readable set of artifacts behind in the product repository.
*Check:* `tests/test_self_sufficient.py` — no artifact references a file or service that exists
only inside Agent M.

**AGENT M IS MIT-LICENSED** *(PO A. Maier)*
Agent M is published under the MIT licence, stated in a `LICENSE` file at the root of its repository.
*Check:* `tests/test_licence.py` — the root `LICENSE` is the MIT text.
