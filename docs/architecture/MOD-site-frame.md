---
id: MOD-site-frame
title: The frame every page shares
folder: src/site-frame/
realises:
follows:
  - ARC-038
uses:
  - MOD-markdown-render.renderArtifact
  - MOD-markdown-render.openEditor
  - MOD-browser-store.openStore
  - MOD-browser-store.readSetting
  - MOD-browser-store.expiringSoon
  - MOD-browser-store.secretValues
  - MOD-repository-hosts.parseAddress
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.webLinks
  - MOD-job-runner.registerStrategies
  - MOD-job-runner.Strategies
  - MOD-job-runner.Prepared
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-documents.documentFindings
  - MOD-text-tools.Finding
  - MOD-identifiers.instanceOfPagesAddress
  - MOD-notifications.watchForAcceptance
provides:
  - View
  - Route
  - ViewContext
  - PageSetup
  - startPage
  - embedRoute
  - menuOf
  - instanceOf
  - chosenProduct
  - explain
  - runPanel
  - confirmDecision
  - notice
  - schemaForm
---
# MOD-site-frame The frame every page shares

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is what every page of the instance's site has in common: the
header with the lab's logo and the menu in the order of the process, the look of the Pattern Recognition Lab, the
product selector, the notices, the routing of views by the address's fragment, the instance derived from the Pages
address, the folded explanations, the run panel, the dialog of a decision, the form built from a schema, and the start of
the checks of what waits for the person's acceptance, which MOD-notifications runs on the main and the review pages. It is
the plug-in manager of the Site's views: an entry page names the view modules it carries, and the frame loads them through
the `View` interface it defines, registers the strategies they hand it with the job runner, and routes to them. It never
names a view itself.

It runs in a browser — the instance's pages, and the Bridge's window, which is drawn with it (ARC-040).

## Parts

- `index.mjs` — the interface.
- `start.mjs` — the script both entry pages load: it reads the page's setup from its own script tag, loads the named
  view modules from their folders, registers their strategies and calls `startPage`. This is where the entry pages
  register strategies (ARC-038).
- `menu.mjs` — the eight entries of the menu and the links they lead to.
- `routing.mjs` — views by the address's fragment, and the address of a route for a repository.
- `notices.mjs`, `run-panel.mjs`, `decision.mjs`, `forms.mjs` — notices, the run panel, the dialog of a decision, the
  form built from a schema.
- `look.css` — colours, fonts and the header, footer and menu of the lab's look: FAU blue `#04316a`, dark blue `#041e42`,
  metallic `#8c9fb1`, and their tints, for light and dark mode.
- `brand/` — the logo files of the Pattern Recognition Lab, lettered and as a sign, for light and dark backgrounds, the
  page icons, and a `README.md` stating the terms under which the logo is used.
- `explanations.md` — the folded explanations, as data.

## Data

It keeps nothing but what is on the screen. It owns these formats:

- **The page setup**, written by an entry page in the attributes of the script tag that loads `start.mjs`:
  `data-page` — `main` or `review`; `data-views` — the slugs of the view modules this page loads; `data-menu-views` —
  on the main page, the slugs of the views the review pages load, so its menu can tell built entries from those not yet
  built without loading them. Example: `<script type="module" src="../src/site-frame/start.mjs" data-page="review"
  data-views="review-pages trace-pages implementation-pages test-pages maintenance-pages settings-pages"></script>`.
- **The explanations file** `explanations.md`: one section `## <topic>` per topic, its body the Markdown shown when the
  explanation is unfolded; a topic is a lower-case slug, for example `## shared-pages-origin`. It holds the topics of the
  site's pages and those of the Bridge's window, which is drawn with this frame (ARC-040): the coding agents and how to
  install a missing one, the pairing token and pairing anew, the jump host and the public key, the tunnels, importing a
  settings export, updates, and why a newly signed release may still be warned about. A topic that a view or the
  Bridge's window names and the file does not hold is a finding of the frame's own check, which compares the topics
  named with the file's, never a failure at run time.
- **The view interface**: `View`, `Route`, `ViewContext` and `PageSetup`, below.

## Interfaces

- `View` — what a view module provides to the frame: `{ routes: Route[], strategies: Strategies[] }` — its routes, and
  the strategy sets of the services whose job kinds its routes prepare or run in the tab (MOD-job-runner's
  `Strategies`).
- `Route` — `{ name: string, entry: "requirements" | "use-cases" | "architecture" | "implementation" | "tests" |
  "releases" | "maintenance" | "settings" | null, title: string, render(target: Element, context: ViewContext,
  params: Record<string, string>) -> Promise<void> }`. `name` is the first part of the address's fragment, the rest are
  its `params`; a route's `entry` puts it under that entry of the menu, `null` keeps it out of the menu.
- `ViewContext` — what every route is given: `{ page: "main" | "review" | "bridge", instance: { repository: string,
  host: Host }, product: ProductContext | null, store: Store, go(route: string, params?: Record<string, string>) -> void }`
  — `Host` and `Store` as
  MOD-repository-hosts and MOD-browser-store define them; `ProductContext` is `{ address: string, kind: "github" |
  "gitlab", host: Host }`.
- `PageSetup` — `{ page: "main" | "review" | "bridge", views: View[], menuViews: string[] }`.
- `startPage(setup: PageSetup) -> Promise<void>` — draws the header, the menu and the product selector, shows the
  notices, connects the instance and the chosen product, and renders the route the fragment names, again on every
  change of the fragment. A fragment that names no loaded route shows the first route of its menu entry, or says that
  the entry is not built yet. On the main and the review pages, never in the Bridge's window, it starts MOD-notifications'
  `watchForAcceptance` with the page's store, the instance as it connected it, and its own writing of the address of a
  route of the review pages, for the instance itself or a product this browser keeps, in the form its routing and
  `chosenProduct` read back. Called by `start.mjs`, and by the Bridge's window with its own routes.
- `embedRoute(name: string, target: Element, params: Record<string, string>) -> Promise<void>` — renders a route of
  another view loaded on the same page inside an element of the calling view, so one view can show another's part
  without using it. Error: `RouteNotLoaded` — the route is not on this page; the frame then puts a link to it in
  `target`.
- `menuOf(page: "main" | "review", loaded: string[]) -> MenuEntry[]` — the entries in the order of `THE MENU FOLLOWS THE
  PROCESS`: Requirements, Use cases, Architecture, Implementation, Tests, Releases, then Maintenance and Settings; each
  `{ key, label, href: string | null, title }`, `href` null and `title` saying *not built yet* for an entry no loaded
  view serves. On the main page each entry links into the review pages.
- `instanceOf(location: { hostname: string, pathname: string }) -> string` — the instance repository `owner/name` from
  the Pages address the page is served from (`AN INSTANCE IS A FORK OF AGENT M`), read with MOD-identifiers'
  `instanceOfPagesAddress`; on any other host, the upstream instance named in the frame's data.
- `chosenProduct(context: { store: Store, fragment: string }) -> Promise<ProductContext | null>` — the product the
  address's fragment or the selector names, among the products this browser keeps, connected with its own token to its
  own server only; `null` when the fragment or the selector names the instance itself, which the selector offers beside
  the products, or when the browser keeps no product — the pages then show the instance itself. Errors: `UnknownProduct`
  — the fragment names a product this browser does not keep; the selector offers *+ Add product*. A refused token or a
  used-up rate limit is shown as a notice, with what MOD-repository-hosts names.
- `explain(topic: string) -> Element` — the folded *What is this?* of a topic, from `explanations.md`, rendered by the
  renderer (`EVERY STEP EXPLAINS ITSELF`); used by the site's views and by the Bridge's window. It never throws: for a
  topic the file does not hold it returns an empty element, and the frame's own check reports the missing topic.
- `runPanel(prepared: Prepared, handlers: { onRun: () -> Promise<void>, onCancel?: () -> void }) -> Element` — the panel
  before a job runs (`THE PAGE STATES WHAT IT SENDS WHERE`): every destination — the participant, its part as drafter,
  reviewer or checker, its model, where it processes data — and what goes there, part by part with its size against the
  participant's context and the requirement sources whose content it carries; what does not fit, and why; a part left
  out, with its reason; the findings that keep the job from starting; the limit of correction rounds fixed for it. *Run*
  is offered only when nothing keeps the job from starting and everything fits; pressing it is the decision and calls
  `onRun`. What the panel of a use case names besides — the route, the gates the jobs will meet, a run's limits — the
  view shows beside it.
- `confirmDecision(decision: { title: string, lines: string[], confirm: string, reason?: boolean }) -> Promise<{ confirmed:
  boolean, reason: string | null }>` — the one dialog of a decision: what will happen, in the given lines; with `reason`,
  a field the person fills in, as for rejecting a gate or recording a limitation.
- `notice(kind: "token-expiring" | "token-refused" | "rate-limit" | "unreachable" | "setup" | "moved" | "info", detail:
  { text: string, link?: { label: string, href: string } }) -> void` — shows a notice in the page's one place for them;
  the frame itself shows a token's expiry from fourteen days before it (`A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`) with
  its renewal page, and *Finish setting up* while no token is stored.
- `schemaForm(schema: Schema, document: Document | null, options: { onSave: (document: Document) -> Promise<void>,
  extraChecks?: (document: Document) -> Finding[], secretKeys?: string[], readOnly?: boolean }) -> Element` — a form with
  one field per key and section of a schema of MOD-documents, a section edited in the renderer's editor; the findings of
  `documentFindings` and of `extraChecks` shown beside their fields while typing; *Save* offered only while no error
  remains, so an invalid register is never saved; a key named in `secretKeys` shown hidden until *Show* (`A STORED
  SECRET IS HIDDEN UNTIL SHOWN`). It writes nothing itself: `onSave` does.

## Files

It reads its own `explanations.md`, `look.css` and `brand/` files, and the page setup from the entry page's script tag.
It reads the browser's store only through MOD-browser-store, and the repositories only through the hosts it connects.
It writes nothing.

## Uses

- MOD-markdown-render.renderArtifact — to render the explanations; MOD-markdown-render.openEditor — for a section field
  of a form.
- MOD-browser-store.openStore, MOD-browser-store.readSetting — the products, tokens and the instance's key;
  MOD-browser-store.expiringSoon — the expiry notice; MOD-browser-store.secretValues — handed to every host it connects,
  which refuses a commit that would write one.
- MOD-repository-hosts.parseAddress, MOD-repository-hosts.connect — to connect the instance and the chosen product,
  each with its own token; MOD-repository-hosts.webLinks — the renewal page of a token.
- MOD-job-runner.registerStrategies — the strategies the loaded views hand it; MOD-job-runner.Strategies,
  MOD-job-runner.Prepared — the types of `View` and of the run panel.
- MOD-documents.Schema, MOD-documents.Document, MOD-documents.documentFindings — the form built from a schema.
- MOD-text-tools.Finding — the findings shown beside a form's fields.
- MOD-identifiers.instanceOfPagesAddress — the instance that the Pages address names.
- MOD-notifications.watchForAcceptance — the checks of what waits for acceptance, started on the main and the review
  pages.
