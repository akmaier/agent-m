// MOD-site-frame — the frame every page shares (docs/architecture/MOD-site-frame.md): its interface. Built: the types View,
// Route, ViewContext and PageSetup; startPage for the Bridge's window and for the main and the review pages, the last two with the
// start of the prompt bar (subject.mjs gives it the subject of the route shown); menuOf (menu.mjs); instanceOf; chosenProduct
// (routing.mjs); explain; readProblem; runPanel (run-panel.mjs); confirmDecision (decision.mjs); notice (notices.mjs); schemaForm (forms.mjs), without its options secretKeys
// and readOnly. Not built yet: embedRoute and the frame's own check of the topics.
//
// Module: MOD-site-frame
//
// It belongs to the Site (ARC-038) and runs in a browser. Its one read is that of its own explanations.md, once, when the
// module is loaded: from the disk in Node, from the module's own address in a browser. If that read fails, the module still
// loads, and explain finds no topic: it never throws. It uses MOD-markdown-render and MOD-documents only through their
// index.mjs. Every other file of this folder is private to the module.

import { renderArtifact } from "../markdown-render/index.mjs";
import { openStore, readSetting, secretValues } from "../browser-store/index.mjs";
import { parseAddress, connect } from "../repository-hosts/index.mjs";
import { instanceOfPagesAddress } from "../identifiers/index.mjs";
import { watchForAcceptance } from "../notifications/index.mjs";
import { startPromptBar } from "../prompt-bar/index.mjs";
import { menuOf, labelOf, linkOf } from "./menu.mjs";
import { routeOf, fragmentOf, productOf, chosenProduct, addressWriter } from "./routing.mjs";
import { subjectOf } from "./subject.mjs";
import { notice, noticePlace } from "./notices.mjs";

export { schemaForm } from "./forms.mjs";
export { runPanel } from "./run-panel.mjs";
export { menuOf } from "./menu.mjs";
export { chosenProduct } from "./routing.mjs";
export { notice } from "./notices.mjs";
export { confirmDecision } from "./decision.mjs";

const UPSTREAM = "akmaier/agent-m";
const LOOK = new URL("./look.css", import.meta.url).href;
const PRL_LOGO = new URL("./brand/prl-lettered.png", import.meta.url).href;
const PRL_LOGO_DARK = new URL("./brand/prl-lettered-white.png", import.meta.url).href;

// Strategies, in the types below, is MOD-job-runner's type of that name; Host is MOD-repository-hosts', Store
// MOD-browser-store's.

/**
 * What a view module provides to the frame: its routes, and the strategy sets of the services whose job kinds its routes
 * prepare or run in the tab.
 * @typedef {{ routes: Route[], strategies: Strategies[] }} View
 */

/**
 * One route of a view. `name` is the first part of the address's fragment, the rest are the `params` render is given; a
 * route's `entry` puts it under that entry of the menu, null keeps it out of the menu. `subject`, MOD-prompt-bar's type, says what a
 * message in the prompt bar is about while the route is shown; a route that gives none, or whose `subject` gives `null`, has the frame's default (subject.mjs). `leave` is asked
 * of the route shown before the frame shows another on a change of the address; `false` keeps the route and the frame puts its address back.
 * @typedef {{ name: string, entry: "requirements" | "use-cases" | "architecture" | "implementation" | "tests" | "releases" |
 *   "maintenance" | "settings" | null, title: string,
 *   render(target: Element, context: ViewContext, params: Record<string, string>): Promise<void>,
 *   subject?: (params: Record<string, string>, context: ViewContext) => Subject | null,
 *   leave?: () => boolean }} Route
 */

/**
 * What every route is given: the page it is drawn on; the instance, by its repository and its connected host; the chosen
 * product, or null where the page shows the instance itself; the browser's store; and go, which shows another route.
 * @typedef {{ page: "main" | "review" | "bridge", instance: { repository: string, host: Host },
 *   product: ProductContext | null, store: Store, go(route: string, params?: Record<string, string>): void }} ViewContext
 */

/**
 * The chosen product as a route is given it: its address, the kind of its server, and its host, connected with its own
 * token.
 * @typedef {{ address: string, kind: "github" | "gitlab", host: Host }} ProductContext
 */

const OWNER = "MOD-site-frame";
const EXPLANATIONS_FILE = new URL("./explanations.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");
// The topics of explanations.md, each with the Markdown shown when it is unfolded: a line `## <topic>` begins a topic, and
// it runs to the next such line or to the end of the file. None when the file could not be read.
const TOPICS = topicsOf(await readExplanations());

// The one read of the module's own explanations.md. It never throws: a read that fails gives no text.
async function readExplanations() {
  try {
    return disk ? disk.readFileSync(EXPLANATIONS_FILE, "utf8") : await ownFile(EXPLANATIONS_FILE);
  } catch {
    return "";
  }
}

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file
// and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

function topicsOf(text) {
  const topics = new Map();
  for (const part of text.split(/^## /m).slice(1)) {
    const end = part.indexOf("\n");
    topics.set((end < 0 ? part : part.slice(0, end)).trim(), end < 0 ? "" : part.slice(end + 1));
  }
  return topics;
}

/**
 * explain(topic: string) -> Element — the folded "What is this?" of a topic (EVERY STEP EXPLAINS ITSELF): a <details
 * class="explain">, folded, holding the summary "What is this?" and the topic's Markdown from explanations.md, rendered by
 * MOD-markdown-render's renderArtifact. It never throws: for a topic the file does not hold it returns an empty element.
 * @param {string} topic — a lower-case slug, as a heading of explanations.md names it
 * @returns {Element}
 */
export function explain(topic) {
  const text = TOPICS.get(topic);
  if (text === undefined) return document.createElement("div");
  const folded = document.createElement("details");
  folded.className = "explain";
  const summary = document.createElement("summary");
  summary.textContent = "What is this?";
  folded.append(summary, renderArtifact(text));
  return folded;
}

/**
 * readProblem(failure: Error, tokenStored: boolean) -> Element — the problem a failed read of a repository shows on a page: a <p class="problem">. For a NotFound while no
 * token that reaches the repository is stored, it says that the repository is private or does not exist and that no token reaches it; otherwise it is the host's own
 * message. While no token is stored, a link "Store a token" to the add-product step follows. It reads nothing and never throws.
 */
export function readProblem(failure, tokenStored) {
  const paragraph = document.createElement("p");
  paragraph.className = "problem";
  paragraph.textContent = failure.name === "NotFound" && !tokenStored
    ? "This repository is private or does not exist, and this browser stores no token that reaches it. Store the product's token, then reload."
    : failure.message;
  if (!tokenStored) {
    const step = document.createElement("a");
    step.className = "token-step";
    step.setAttribute("href", fragmentOf("add-product"));
    step.textContent = "Store a token";
    paragraph.append(" ", step);
  }
  return paragraph;
}

// The instance whose Pages address this page belongs to. A local Bridge window keeps that Pages location as private shell
// metadata; when no Pages address is supplied, it deliberately uses the upstream instance.
export function instanceOf(location) {
  return instanceOfPagesAddress(location) ?? UPSTREAM;
}

// The header of every page: the lab's logo and the site's name; the Bridge's window names its section, "Bridge".
function sharedHeader(section = null) {
  const head = document.head ?? document.getElementsByTagName("head")[0];
  if (![...head.getElementsByTagName("link")].some((link) => link.getAttribute("href") === LOOK)) {
    const look = document.createElement("link");
    look.setAttribute("rel", "stylesheet");
    look.setAttribute("href", LOOK);
    head.append(look);
  }
  const header = document.createElement("header");
  header.className = "site-header top";
  const inner = document.createElement("div");
  inner.className = "inner";
  const brand = document.createElement("a");
  brand.className = "brand";
  brand.setAttribute("href", "#");
  brand.setAttribute("title", section ? `Agent M ${section}` : "Agent M");
  const picture = document.createElement("picture");
  const dark = document.createElement("source");
  dark.setAttribute("srcset", PRL_LOGO_DARK);
  dark.setAttribute("media", "(prefers-color-scheme: dark)");
  const logo = document.createElement("img");
  logo.setAttribute("src", PRL_LOGO);
  logo.setAttribute("alt", "Pattern Recognition Lab");
  logo.setAttribute("width", "126");
  logo.setAttribute("height", "44");
  picture.append(dark, logo);
  const name = document.createElement("span");
  name.className = "name";
  name.append(section ? "Agent M " : "Agent M");
  if (section) {
    const small = document.createElement("small");
    small.textContent = section;
    name.append(small);
  }
  brand.append(picture, name);
  inner.append(brand);
  header.append(inner);
  return header;
}

/**
 * startPage(setup: PageSetup) -> Promise<void> — starts a page. The Bridge's window gets the bounded composition below; the main
 * and the review pages get the header, the menu and the product selector, the notices, the instance and the chosen product
 * connected, the route the fragment names rendered again on every change of the fragment, MOD-notifications' check of what
 * waits for acceptance, and MOD-prompt-bar's bar in a footer after the route's main, started once with the store, the instance, the
 * chosen product, the subject of the route shown at each moment, `explain` and the navigation; that footer takes the height of the bar
 * it holds (footTakesBarHeight). Throws a TypeError for a page that is
 * none of the three, and for views that are no list. A property menuViews, which an earlier setup carried, is ignored.
 */
export async function startPage({ page, views }) {
  if (!["bridge", "main", "review"].includes(page)) throw new TypeError(`The frame starts the pages bridge, main and review, not ${page}.`);
  if (!Array.isArray(views)) throw new TypeError("PageSetup names views as a list.");
  if (page === "bridge") return startBridge({ page, views });
  return startSite({ page, views });
}

// The main and the review pages. On the review pages the menu serves the entries of the routes of `views`; on the main page, which
// loads no view of the review pages, every entry links into the review pages (menuOf).
async function startSite({ page, views }) {
  const location = globalThis.location ?? {};
  const repository = instanceOf(location);
  const store = openStore(repository);
  const secrets = secretValues(store);
  const instanceToken = readSetting(store, "github-token");
  const instance = { repository,
    host: connect(parseAddress(`https://github.com/${repository}`), { token: instanceToken?.value ?? null, tokenName: instanceToken?.name ?? null, secrets }) };
  const routes = views.flatMap((view) => view?.routes ?? []);
  const served = new Set(routes.map((route) => route.entry).filter(Boolean));
  const entries = menuOf(page, [...served]);

  const header = sharedHeader();
  const menu = document.createElement("nav");
  menu.className = "menu";
  const selector = document.createElement("select");
  selector.className = "product";
  header.getElementsByTagName("div")[0].append(selector, menu);
  const notices = noticePlace();
  const target = document.createElement("main");
  target.className = "site-frame-route";
  const foot = document.createElement("footer");
  foot.className = "site-frame-prompt-bar";
  document.body.replaceChildren(header, notices, target, foot);

  // The route shown now, with the parameters and the context it was rendered with: what the prompt bar's subject is read from.
  let shown = null;
  let shownName = routes[0]?.name ?? "";
  const drawMenu = (active, product) => {
    menu.replaceChildren(...entries.map((entry) => {
      const item = document.createElement(entry.href === null ? "span" : "a");
      item.setAttribute("title", entry.title);
      item.textContent = entry.label;
      if (entry.href === null) item.className = "soon";
      else {
        item.setAttribute("href", product ? `${entry.href}/product=${encodeURIComponent(product)}` : entry.href);
        if (entry.key === active) item.className = "active";
      }
      return item;
    }));
  };
  const drawSelector = (product) => {
    const option = (value, text) => {
      const choice = document.createElement("option");
      choice.setAttribute("value", value);
      choice.textContent = text;
      return choice;
    };
    const kept = (readSetting(store, "products") ?? []).flatMap((address) => { try { return [parseAddress(address).web]; } catch { return []; } });
    selector.replaceChildren(option("", repository), ...kept.map((web) => option(web, web)), option(ADD_PRODUCT, "+ Add product"));
    selector.value = product ?? "";
  };
  selector.addEventListener("change", () => {
    if (selector.value === ADD_PRODUCT) { location.hash = fragmentOf("add-product"); return; }
    const current = routeOf(location.hash);
    const params = { ...current.params };
    delete params.product;
    location.hash = fragmentOf(current.name || shownName, selector.value ? { ...params, product: selector.value } : params);
  });

  const show = async () => {
    const fragment = location.hash ?? "";
    const selected = routeOf(fragment);
    const { product: _named, ...params } = selected.params;
    let product = null;
    let unknown = null;
    try {
      product = await chosenProduct({ store, fragment });
    } catch (error) {
      if (error?.name !== "UnknownProduct") throw error;
      unknown = error.address;
    }
    notices.replaceChildren();
    if (readSetting(store, "github-token") === null) {
      notice("setup", { text: "Finish setting up: store your GitHub token on the settings page.", link: { label: "Settings", href: linkOf(page, "settings") } });
    }
    if (unknown !== null) notice("info", { text: `This browser does not keep the product ${unknown}; the instance is shown. Choose + Add product to add it.` });

    const byName = routes.find((candidate) => candidate.name === selected.name);
    const entryKey = labelOf(selected.name) ? selected.name : null;
    const route = byName ?? (entryKey ? routes.find((candidate) => candidate.entry === entryKey) : routes[0]) ?? null;
    drawSelector(product?.address ?? null);
    drawMenu(route?.entry ?? entryKey, product?.address ?? null);
    const context = { page, instance, product, store,
      go: (name, given = {}) => {
        location.hash = fragmentOf(name, product && !("product" in given) ? { ...given, product: product.address } : given);
      } };
    if (!route) {
      shown = { route: { name: selected.name, entry: entryKey, title: entryKey ? labelOf(entryKey) : "Agent M" }, params: {}, context, fragment };
      const paragraph = document.createElement("p");
      paragraph.textContent = entryKey ? `The ${labelOf(entryKey)} entry is not built yet.` : "This page is not built yet.";
      target.replaceChildren(paragraph);
      return;
    }
    shownName = route.name;
    shown = { route, params: route === byName ? params : {}, context, fragment };
    await route.render(target, context, shown.params);
  };
  const browser = globalThis.window ?? globalThis;
  browser.addEventListener?.("hashchange", askBeforeShowing(location, () => shown, show));
  await show();

  const pageAddress = `${location.protocol ?? "https:"}//${location.host ?? location.hostname}${location.pathname}`;
  watchForAcceptance({ store, instance,
    addressOf: (route, given, forRepository) =>
      addressWriter(page, pageAddress, repository, readSetting(store, "products") ?? [])(route, given, forRepository) });
  footTakesBarHeight(foot);
  startPromptBar(foot, { page, store, instance,
    product: () => shown.context.product && { address: shown.context.product.address, host: shown.context.product.host },
    subject: () => subjectOf({ ...shown, drawn: () => target.textContent }),
    explain,
    go: (name, given) => shown.context.go(name, given) });
}

// The prompt bar is fixed to the bottom of the window, so it takes no room in the page: the footer that holds it takes the bar's height,
// and the page can be scrolled until its last line stands above the bar. The bar is the footer's child that MOD-prompt-bar draws once it
// has read the participants; a MutationObserver on the footer notices that, and a ResizeObserver, where the browser has one, notices that
// the bar changes (a selector, a conversation, a draft). Where it has none, the height is set once, when the bar is drawn. The height is
// the footer's `style` attribute, as the bar's own position is its root's.
function footTakesBarHeight(foot) {
  const fit = () => {
    const bar = foot.children[0];
    if (bar) foot.setAttribute("style", `height: ${bar.offsetHeight}px;`);
  };
  const resizes = globalThis.ResizeObserver ? new globalThis.ResizeObserver(fit) : null;
  if (!globalThis.MutationObserver) return;
  new globalThis.MutationObserver(() => {
    resizes?.disconnect();
    if (foot.children[0]) resizes?.observe(foot.children[0]);
    fit();
  }).observe(foot, { childList: true });
}

// The listener of the fragment's changes, for the main, the review and the Bridge pages: before `show` draws another route it asks the route shown with its `leave`
// (Route). `current()` gives that route with the fragment it was drawn for. On `false` nothing is drawn and the fragment is put back; the browser announces the fragment put back
// as a change of its own, which is neither asked nor drawn.
function askBeforeShowing(location, current, show) {
  let putBack = null;
  return async () => {
    if (putBack !== null) {
      const fragment = putBack;
      putBack = null;
      if (location.hash === fragment) return;
    }
    const { route, fragment } = current() ?? {};
    if (route?.leave?.() === false) {
      putBack = fragment;
      location.hash = fragment;
      return;
    }
    await show();
  };
}

// The value of the selector's entry that goes to the add-product route of the settings.
const ADD_PRODUCT = "+add";

// The Bridge's window: one shared frame, the routes the entry passes it and the browser store and repository host of the
// instance. Bridge views have no strategies, so this starts neither jobs nor notifications and connects no repository until a
// view asks its supplied host to do so.
async function startBridge({ page, views }) {
  const location = globalThis.location ?? {};
  const repository = instanceOf(location);
  const store = openStore(repository);
  const host = connect(parseAddress(`https://github.com/${repository}`));
  const routes = views.flatMap((view) => view?.routes ?? []);
  const first = routes[0] ?? null;
  const header = sharedHeader("Bridge");
  const notices = noticePlace();
  const target = document.createElement("main");
  target.className = "site-frame-route";
  document.body.replaceChildren(header, notices, target);

  // The route shown and the fragment it was drawn for, asked by askBeforeShowing before another route is shown.
  let shown = null;
  const show = async () => {
    const selected = routeOf(location.hash);
    const route = routes.find((candidate) => candidate.name === selected.name) ?? first;
    if (!route) {
      target.textContent = "This Bridge page has no view yet.";
      return;
    }
    shown = { route, fragment: location.hash ?? "" };
    const context = { page, instance: { repository, host }, product: null, store,
      go: (name, params = {}) => { location.hash = fragmentOf(name, params); } };
    await route.render(target, context, route.name === selected.name ? selected.params : {});
  };
  const browser = globalThis.window ?? globalThis;
  browser.addEventListener?.("hashchange", askBeforeShowing(location, () => shown, show));
  await show();
}
