# One correction to the original requirement, and five consequences

The Product Owner's instruction was: configuration is saved in the browser that is using the
website as a cookie, so that no API keys are exposed to the repository. The intent is exactly
right and is adopted unchanged. The mechanism is the one thing in this queue proposed differently
from how it was asked for, so the reasoning is set out in full.

**Why not a cookie.** A cookie is not merely browser storage; it is browser storage *with an
automatic transmission rule*. A cookie set on `akmaier.github.io` is attached by the browser to
every subsequent request to that origin — every page load, every asset. Those requests go to
GitHub's Pages infrastructure. So a key kept in a cookie would be sent to a third party on every
visit, which is the precise exposure the requirement exists to prevent, arriving by a different
route than the one being guarded against.

`localStorage` has the same convenience — same origin, survives a reload, accessible to the page's
script — and no transmission rule. Nothing reads it but code running on the page. For this
requirement it is strictly better on the only dimension that motivated it.

The requirement is therefore split in two: `CONFIGURATION LIVES IN THE BROWSER` states the intent,
and `CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE` states the mechanism. Splitting
them means a future change of mechanism does not require reopening the intent.

**The other four are consequences of having thought about it once.**

`A CREDENTIAL IS NEVER PLACED IN A URL` closes the third leak route. Storage and transmission are
covered above; URLs are the remaining one, and they are the one that leaks into places nobody
controls — proxy logs, browser history, screenshots in bug reports.

`A TOKEN IS SCOPED TO WHAT IT WRITES` exists because the storage decision in §8 — each product in
its own repository — buys correct artifact placement at the price of cross-repository
credentials. That price should be paid at the minimum rate. The check is deliberately about
*documentation* rather than enforcement: Agent M cannot verify what a token can do without trying
it, but it can state plainly what it needs and why, so the reader issuing the token can decide.

`THE PAGE STATES WHAT IT SENDS WHERE` is the rule that takes the reader seriously. Someone running
this on their employer's requirements is about to send them to a third-party endpoint. That is
their call to make, and it can only be made if the destination is stated before the run rather
than inferable from network traffic afterwards.

`A CLEAR IS A REAL CLEAR` looks trivial and is not. A reset that empties the form while leaving
`localStorage` intact is a common implementation slip, and its consequence is a reader who hands
over a laptop believing the key is gone.

**What is deliberately absent:** encryption of the stored key. It would be theatre. Any key the
page can use, script on the page can read, so an encryption step that runs in the same page adds
ceremony without adding a boundary. Saying so is better than shipping a padlock icon.
