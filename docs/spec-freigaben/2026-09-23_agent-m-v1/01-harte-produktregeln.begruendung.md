# Why these four, and why in §0

A specification needs a small set of rules that everything else can be checked against. These four
are the ones that, if reversed, would make Agent M a different product rather than a changed one.

**NO SERVER** is the decision that makes the rest cheap. Without a backend there is no account
system to build, no personal data to hold, no uptime obligation, and no hosting cost that outlives
the author's interest. It also forces the runtime split in §6 to be honest: if there is no server,
then the three places work can happen (browser, Actions, local machine) are the complete list, and
the design cannot quietly grow a fourth.

**ARTIFACTS ARE MARKDOWN** is not a preference. Chapter 9 §6 of the book argues it directly:
current AI workflows work better when a model exists twice, once visually and once textually, and
text-first diagramming is what makes a diagram versionable and reviewable. The worked example at
`akmaier/dvd_database/tree/main/docs/requirements` is the shape being adopted. The honest
limitation — Mermaid has no UML use-case diagram, so the actor notation is approximated — belongs
with the use-case requirements in §4, not here.

**NO SECRET IN THE REPOSITORY** restates the Product Owner's original requirement in the form that
survives being tested. The original phrasing was about where configuration is *stored*; this is
about what must never be *written*, which is the property that actually matters and the one a test
can check. The two together are why §7 also forbids the cookie: a cookie would not be written to
the repository, but it would be transmitted to GitHub on every page load, which defeats the same
intent by a different route.

**THE PRODUCT REPOSITORY IS SELF-SUFFICIENT** is the rule that keeps the tool a companion rather
than a platform. It costs nothing today, because Markdown artifacts are self-sufficient by
default. It is written down because that stops being true the moment someone adds a manifest that
only Agent M can read — and that addition always looks reasonable at the time.

**Why the checks name files that do not exist yet.** In Phase 1 there is no implementation. The
*Check* field names the test that will guard the requirement, which is what makes the requirement
answerable later; a requirement with no named guard is a wish. If the Product Owner strikes a
requirement here, its test is never written — which is the point of approving before building.
