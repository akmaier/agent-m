---
id: ITM-534
title: The main page's menu links into the review pages without loading their views
level: module
realises:
  - THE MENU FOLLOWS THE PROCESS
modules:
  - MOD-site-frame
builds_on:
  - ITM-531
tests:
  - unit
origin:
  - the gate of #577 (ITM-531, sprint team1/42)
  - MOD-site-frame's draft 300ec0c1, accepted with 90ed6d66 (docs/approvals/MOD-site-frame-bb01528db1eb.md)
---
# ITM-534 The main page's menu links into the review pages without loading their views

**REGISTER**

## Outcome

MOD-site-frame, as accepted with `90ed6d66`: "On the main page each entry links into the review pages, which say there
when an entry is not built yet, so that the main page loads none of their views." ITM-531 built the main page's menu by
importing each view that `data-menu-views` names. The accepted text drops that setup.

- **`startPage` and `start.mjs`.** `startPage(setup)` takes `{ page, views }` and no `menuViews`. `start.mjs` reads no
  `data-menu-views` (`src/site-frame/start.mjs:37`, `src/site-frame/index.mjs:174–195`). A caller that still passes
  `menuViews: []` is not refused: the property is ignored, so the nine calls in tests that pass
  it, and `src/desktop-shell/window.mjs:107`, keep working unchanged.
- **The main page's menu.** Each of the eight entries is a link into the review pages, `docs/index.html#<entry>`
  (`linkOf`, `src/site-frame/menu.mjs:19`), and none is drawn as not built. The review pages say there when an entry is
  not built yet. The review pages' own menu stays as it is: served entries are links, and the others are not built.

**Existing tests whose expected result changes**, found by grepping `tests/` for `menuViews` and `data-menu-views`, with
`src/site-frame/start.mjs:37` as the known positive:
- **TST-531009** (`tests/site-frame-start-page.test.mjs:225`), the main page with no view, which expected eight entries
  drawn as not built. It now expects eight links into the review pages.
- **TST-531013** (`tests/site-frame-start-script.test.mjs:73`), the main page started with `data-menu-views`, which
  expected only *Tests* as a link. It now expects eight links, and that no view is imported.
- **The header comment** of `tests/site-frame-start-script.test.mjs`, which names `data-menu-views`. ITM-018 is run after
  the change.

The other hits pass `menuViews: []` and keep their expected results.

`src/desktop-shell/window.mjs:107` keeps passing `menuViews: []`, which is now ignored. Removing it is MOD-desktop-shell's,
and is left to that module's next item.

## Acceptance

- **The main page.** It imports no view module, and its menu holds eight links, each into the review pages.
- **The review pages.** Their menu marks as built exactly the entries their loaded views serve, as before.
- **`startPage`.** It takes no `menuViews`, and a caller that passes it is not refused.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
