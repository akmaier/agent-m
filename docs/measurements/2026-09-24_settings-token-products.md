# Settings, token and product list — tests and browser check

**MESSUNG** — 2026-09-24, branch `feature/settings-token-products`, Chrome on macOS, dashboard served
locally from `docs/` against `akmaier/agent-m@main`. No real token was used; entering one is the
PO's step.

## Counter-proof of the new checks (SOFTWARE_MAINTENANCE §4.0a rule 5)

| Mutation | Suite |
|---|---|
| `clear()` removes nothing | red |
| token-in-URL guard removed | red |
| `authHeaders` sends the token to any origin | red |
| `canStore` true without acknowledging | red |
| `?repo=` not validated | red |
| app touches `localStorage` directly | red |
| code-block examples in `products.md` become products | red |
| token allowed to the raw host | red |
| token input enabled before the notice | **green in the first version of the test** — it looked for `disabled` within ±200 characters and found the neighbouring button's. Rewritten to inspect the input tag itself; then red. |

## Browser check

- Before the acknowledgement: token input and *Store* disabled; the notice names
  `https://akmaier.github.io`. After it: both enabled.
- Product selector: `akmaier/agent-m — this instance`, `+ Add product…`; the format example inside
  the code block of `docs/products.md` does **not** appear (it did in the first parser version — the
  same trap as the approvals README of 2026-09-23, caught by a test before shipping this time).
- With a dummy value (not a credential) under `agent-m.github-token`: status `stored (…1234)`;
  *Clear* → `none stored`, no `agent-m.*` key left, an unrelated key on the same origin kept.
- Use cases: 14 listed, UC-001 in its new form.

## Not measured

Reading a **private** repository with a real fine-grained token. It needs the PO's token and a
private product; the code path is the API's contents endpoint with `Accept:
application/vnd.github.raw+json`, which is covered by unit tests only.
