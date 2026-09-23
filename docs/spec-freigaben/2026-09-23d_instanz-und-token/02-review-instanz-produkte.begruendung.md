# One dashboard per instance; products keep their artifacts, not a site

**PO, 2026-09-23:** *"UC-001 seems wrong: the user seems to use the GitHub page of the product for
the dashboard. The dashboard should remain in agent-m but the docs must be in the product."* — and:
*"I was planning to have users of agent m to fork the entire repo."* — and, on private products:
*"Yes, read-only."*

**The error was in the SPEC, not only in UC-001.** `THE PAGES ROOT IS DOCS` said Pages is served
from `docs/` for Agent M *and every managed product*. UC-001 followed it faithfully. The rule now
applies to the instance only, and `A MANAGED PRODUCT NEEDS NO PAGES SITE` says the rest explicitly.
The dashboard already works this way: `?repo=owner/name` points it at any repository. It was tested
exactly like that against the feature branch.

**`THE REVIEW DASHBOARD HOLDS NO CREDENTIAL` is withdrawn, not reworded.** Its name states the
opposite of the new rule, and a name is the ID. Rewording the rule under the old name would leave
every reference asserting something false. The entry stays with its withdrawal note, and the name is
never reused. The replacement keeps what mattered: the dashboard writes nothing, and every write is
a commit under the reviewer's own account.

**Two requirements describe the fork model:**
- `AN INSTANCE IS A FORK OF AGENT M`: the instance's own Pages site is its dashboard. The dashboard
  already derives its repository from the address it is served from, which is what makes a fork work
  without configuration.
- `THE INSTANCE LISTS ITS PRODUCTS IN A FILE`: *which* products an instance manages. It is proposed
  as `docs/products.md` in the instance's repository rather than as browser settings, so the list is
  the same for every reviewer and changes by commit. **This one is a design proposal of mine, not
  something you said.** If the product list should be per browser instead, strike it.

**§10 was the last section of `SPEC.md`.** This entry replaces it, which is exactly the case where
the old approval tool lost the file's final newline. The workflow preserves the file's form and adds
nothing, so the file stays as it is: without a final newline since the first round.
