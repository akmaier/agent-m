# A product's artifact shows no image from a host the page does not name — the red first commit and fifteen planted faults

**MESSUNG** — 2026-10-03, branch `team/ITM-157` (from `sprint/03` at `fe693e1`), developer-opus-a (claude-opus-5-5), macOS 26.6,
Node 25.9, Python 3.14. ITM-157 (implementation job, MOD-dashboard-app): the dashboard rendered every Markdown artifact with
`DOMPurify.sanitize(marked.parse(text, { gfm: true }))`, whose defaults keep `img` with any `https:` address, so a product's
`![](https://other.host/x.png)` made the viewer's browser call that host (ITM-050's record,
`docs/measurements/2026-10-01_product-rules-repository-checks.md`). Soll: an image only from the product's repository server —
GitHub's raw host, or the product's GitLab server — or a `data:` address; any other shown as its address, as text.

## 1. The path, before and after

A view → `app.md(text)` (`docs/assets/dashboard-app.mjs`; callers: `review-views.mjs` — a use case's, an architecture file's, a
review page's and a withdrawal note's body, the components diagram —, `spec-changes-view.mjs` — the SPEC text, the proposal, the
rationale —, `how-view.mjs` — its own text) → `marked.parse` → `DOMPurify.sanitize` → `innerHTML` of the view. Every caller
passes the text only; none passes a product, so the product is the one the page shows (`T.product`), read inside `md`.

| Step | Before | After |
|---|---|---|
| Markdown image `![alt](address)` | marked writes `<img src="address">` for any address | `markdownRenderer(origins)`: marked's own `image` for an address on `imageOrigins(T.product)` or `data:`; otherwise the escaped text `[image "alt" not loaded — not on this product's repository server: address]` |
| HTML in the text (`<img>`, `srcset`, `poster`, `<source>`, an SVG `image`/`use`/`feImage` href, `background`, `data`, a `style` attribute's `url()`, a `<style>` element) | DOMPurify's defaults: every `https:` address kept | DOMPurify's hook `uponSanitizeElement` = `resourceGuard(origins)`, added for the one `sanitize` call and removed after it (`try … finally`): a foreign `<img>` is replaced by a text node with the same sentence; a foreign attribute of the others is removed; a `<style>` that loads is removed. A link's `href` is loaded only on a click and is kept |
| `imageOrigins(product)` | — | `[product.server]` for a GitLab product, `["https://raw.githubusercontent.com"]` for a GitHub one |
| An address without its own scheme (`pictures/c.png`, `//host/x`) | kept (DOMPurify admits relative addresses) | not loaded: it resolves against the page's own origin or names another host, neither the repository server |
| Mermaid block | `<pre><code class="language-mermaid">` | unchanged (marked's code renderer is untouched; Mermaid runs after `md`) |

How DOMPurify treats the hook was read in the vendored file (`docs/assets/vendor/purify.es.mjs`, 3.4.16): `_sanitizeElements`
runs `uponSanitizeElement` and then `_handleHookDetachedNode` (lines 2030–2034, 2007–2011), which ends the element's handling when
the hook has taken it out of the tree — so replacing an `<img>` or removing a `<style>` inside the hook is a supported use;
`addHook`/`removeHook(entryPoint, fn)` (lines 2439–2451) remove exactly the function added. When DOMPurify has no DOM
(`isSupported` false — node, the test harness) `md` sets no hook, as `addHook` does not exist there.

## 2. The tests

`tests/dashboard-markdown-images.test.mjs` (new; Module MOD-dashboard-app; Guards NO SERVER, ARTIFACTS ARE MARKDOWN, UC-008;
Level component), six cases:

| # | Case | Route |
|---|---|---|
| T1 | a github product's use case: its own and a data: image are shown, a foreign one only as its address | the real dashboard in `tests/app-harness.mjs`, `#uc/UC-001`: two `img` (raw host, `data:`), no third, the foreign address in the text, the Mermaid block as before, no request to the foreign host |
| T2 | the same for a gitlab product | the same, `?product=https://gitlab.example.org/team/proj`, a GitLab API fake read without a token |
| T3 | the image hosts of a product are its repository server's | `imageOrigins` for a GitHub and a GitLab product |
| T4 | DOMPurify's hook: an `<img>` in HTML loads from the product's repository server or data: only | `resourceGuard` on elements of the DOM's shape: own, `data:`, foreign, `//host`, relative path; a text node untouched |
| T5 | DOMPurify's hook: srcset, poster, source, an SVG image and a style's url() … | twelve attributes and two `<style>` elements |
| T6 | md sanitises with the hook of the product shown, and takes it off afterwards | DOMPurify's `addHook`/`removeHook`/`sanitize` replaced for the case: during each `sanitize` exactly one `uponSanitizeElement` hook is set, it keeps the product's own image and drops a foreign one; afterwards none is left |

The harness has no DOM: DOMPurify does not run there and the harness passes the HTML through (`tests/app-harness.mjs`
`openDashboard`). T1/T2 therefore see the Markdown route end to end, T4–T6 the HTML route in parts — the hook's decisions, and that
`md` sets it for the product shown. That a browser's DOMPurify then applies the hook as read in §1 is not run here (no browser at
level 1). "No request to the foreign host" in T1/T2 holds trivially in the harness, which loads no image; the assertion that
carries the check is that no `img` names the host.

## 3. Red first

Commit `dfceeeb` (tests only; the code of `sprint/03` at `fe693e1`). Local, on a clean tree: `node --test tests/*.test.mjs` — 524
tests, 511 pass, **6 fail**, 7 todo (the six cases above: T1/T2 at "no img for the foreign host" — their own and `data:` images
were found, as known positives —, T3/T4 at "… is exported", T5 `resourceGuard is not a function`, T6 at "one hook while md
sanitises"); `cd tests && python3 -m unittest` — 369 tests, **1 failure**
(`test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec.test_no_node_test_opens_agent_ms_own_spec`, which runs the Node suite nested
and fails because it is red), 5 expected failures. Start commit `fe693e1`: Node 518 tests / 511 pass / 0 fail / 7 todo; Python 369
OK (5 expected failures).

CI on pull request #81: runs `37117587553` (push) and `37117600233` (pull request) — **failure**, both on `dfceeeb`: the
Python step with the same one failure (369 tests, 5 expected failures); the Node step did not run after it. Not rerun.

The first implementation was red in two further Python checks: `test_no_backend.test_requests_leave_only_through_the_known_channels`
(and the release check `test_release_sprint_02_d`, which runs the same rule) found the literal at-rule name of CSS imports in
`dashboard-app.mjs` — in a comment and in the guard's own regular expression — as a request channel. The guard now treats any
at-rule in a CSS text as loading (`[\\@]`), which also names no channel; both checks pass. The scan thus hit a known positive.

## 4. Counter-proofs

Each fault planted alone in `docs/assets/dashboard-app.mjs`, the new test file run (`--test-reporter=tap`, the red cases read from
its `not ok` lines; the same reading of an unchanged file gives six `ok` lines), the file restored and run green afterwards.

| Fault | Red |
|---|---|
| M1 a GitLab product's images allowed from GitHub's raw host, not its server | T2, T3 |
| M2 every address loads (no host check) | T1, T2, T4, T5, T6 |
| M3 a `data:` address not allowed | T1, T2, T4 |
| M4 an address without its own scheme resolved against GitHub's raw host | T4 |
| M5 Markdown images rendered by marked's own renderer | T1, T2 |
| M6 `md` sets no hook | T6 |
| M7 `md` leaves its hook on | T6 |
| M8 `md`'s hook built for no product | T6 |
| M9 `srcset` not checked | T5 |
| M10 a `style` attribute's `url()` not checked | T5 |
| M11 an SVG image's `href` not checked | T5 |
| M12 every element's `href` checked, a link's too | T5 |
| M13 `poster` not checked | T5 |
| M14 a `<style>` element not checked | T5 |
| M15 a foreign `<img>` in HTML removed without its address | T4, T6 |

Every new case is red on at least one fault. M4 was first planted with `//host/x` only in T4, and T4 stayed green (the address
still resolves to the other host); the case was given a relative path (`pictures/c.png`), on which M4 is red.

## 5. Green

Commit `e272720` (the implementation, the relative-path case, this record), on a clean tree: `node --test tests/*.test.mjs` — 524
tests, 517 pass, 0 fail, 7 todo; `cd tests && python3 -m unittest` — 369 tests OK (5 expected failures). Every existing app-harness
check is unchanged and passes: the files `md` renders carry no image — a grep for `![…](` and `<img` over `docs/` and `SPEC.md`
hits only this item, this record and two measurement records of 2026-10-01, which no view hands to `md` (its callers are listed
in §1) —, and the harness passes HTML through DOMPurify unchanged, so `md`'s output for them is marked's as before.
