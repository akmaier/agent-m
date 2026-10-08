// MOD-site-frame — the frame every page shares (docs/architecture/MOD-site-frame.md): its interface. Of it, ITM-221 builds
// what UC-002's page needs: the types View, Route and ViewContext; schemaForm (forms.mjs), without its options secretKeys
// and readOnly; and explain, with UC-002's topics in explanations.md, after stepHtml of docs/assets/dashboard-app.mjs.
// PageSetup, startPage, embedRoute, menuOf, instanceOf, chosenProduct, runPanel, confirmDecision, notice, the frame's own
// check of the topics, look.css and brand/ are not built yet.
//
// Module: MOD-site-frame
//
// It belongs to the Site (ARC-038) and runs in a browser. Its one read is that of its own explanations.md, once, when the
// module is loaded: from the disk in Node, from the module's own address in a browser. If that read fails, the module still
// loads, and explain finds no topic: it never throws. It uses MOD-markdown-render and MOD-documents only through their
// index.mjs. Every other file of this folder is private to the module.

import { renderArtifact } from "../markdown-render/index.mjs";
import { openStore } from "../browser-store/index.mjs";
import { parseAddress, connect } from "../repository-hosts/index.mjs";
import { instanceOfPagesAddress } from "../identifiers/index.mjs";

export { schemaForm } from "./forms.mjs";

const UPSTREAM = "akmaier/agent-m";
let notices = null;

// Strategies, in the types below, is MOD-job-runner's type of that name; Host is MOD-repository-hosts', Store
// MOD-browser-store's.

/**
 * What a view module provides to the frame: its routes, and the strategy sets of the services whose job kinds its routes
 * prepare or run in the tab.
 * @typedef {{ routes: Route[], strategies: Strategies[] }} View
 */

/**
 * One route of a view. `name` is the first part of the address's fragment, the rest are the `params` render is given; a
 * route's `entry` puts it under that entry of the menu, null keeps it out of the menu.
 * @typedef {{ name: string, entry: "requirements" | "use-cases" | "architecture" | "implementation" | "tests" | "releases" |
 *   "maintenance" | "settings" | null, title: string,
 *   render(target: Element, context: ViewContext, params: Record<string, string>): Promise<void> }} Route
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

// The instance whose Pages address this page belongs to. A local Bridge window keeps that Pages location as private shell
// metadata; when no Pages address is supplied, it deliberately uses the upstream instance.
export function instanceOf(location) {
  return instanceOfPagesAddress(location) ?? UPSTREAM;
}

const partsOf = (fragment) => String(fragment ?? "").replace(/^#/, "").split("/").filter(Boolean);
const routeOf = (fragment) => {
  const [name = "", ...given] = partsOf(fragment);
  const params = {};
  for (const part of given) {
    const at = part.indexOf("=");
    if (at > 0) params[decodeURIComponent(part.slice(0, at))] = decodeURIComponent(part.slice(at + 1));
  }
  return { name: decodeURIComponent(name), params };
};

const fragmentOf = (route, params = {}) => {
  const supplied = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  return `#${[route, ...supplied].join("/")}`;
};

// startPage(setup) -> Promise<void> — the bounded Bridge composition: one shared frame, the routes the entry passes it and
// the browser store and repository host of the instance. Bridge views have no strategies, so this starts neither jobs nor
// notifications and connects no repository until a view asks its supplied host to do so.
export async function startPage({ page, views, menuViews }) {
  if (page !== "bridge") throw new TypeError("This delivered frame starts the Bridge page only.");
  if (!Array.isArray(views) || !Array.isArray(menuViews)) throw new TypeError("PageSetup names views and menuViews as lists.");
  const location = globalThis.location ?? {};
  const repository = instanceOf(location);
  const store = openStore(repository);
  const host = connect(parseAddress(`https://github.com/${repository}`));
  const routes = views.flatMap((view) => view?.routes ?? []);
  const first = routes[0] ?? null;
  const header = document.createElement("header");
  header.className = "site-frame-header";
  header.append(document.createElement("h1"));
  header.firstChild.textContent = "Agent M Bridge";
  notices = document.createElement("section");
  notices.className = "site-frame-notices";
  const target = document.createElement("main");
  target.className = "site-frame-route";
  document.body.replaceChildren(header, notices, target);

  const show = async () => {
    const selected = routeOf(location.hash);
    const route = routes.find((candidate) => candidate.name === selected.name) ?? first;
    if (!route) {
      target.textContent = "This Bridge page has no view yet.";
      return;
    }
    const context = { page, instance: { repository, host }, product: null, store,
      go: (name, params = {}) => { location.hash = fragmentOf(name, params); } };
    await route.render(target, context, route.name === selected.name ? selected.params : {});
  };
  const browser = globalThis.window ?? globalThis;
  browser.addEventListener?.("hashchange", show);
  await show();
}

// notice(kind, detail) -> void — one supplied message at the frame's notice place. It performs no action beyond drawing the
// supplied text and optional link.
export function notice(kind, { text, link } = {}) {
  if (!notices) throw new Error("Start a page before showing a notice.");
  const shown = document.createElement("p");
  shown.className = `notice ${kind}`;
  shown.append(String(text ?? ""));
  if (link) {
    const anchor = document.createElement("a");
    anchor.setAttribute("href", link.href);
    anchor.textContent = link.label;
    shown.append(" ", anchor);
  }
  notices.append(shown);
}

// confirmDecision(decision) -> Promise<{ confirmed: boolean, reason: string | null }> — the single small confirmation
// surface used by the Bridge frame. The result is produced only by the person's button click.
export function confirmDecision({ title, lines, confirm, reason = false }) {
  return new Promise((resolve) => {
    const dialog = document.createElement("section");
    dialog.className = "decision";
    const heading = document.createElement("h2");
    heading.textContent = title;
    dialog.append(heading);
    for (const line of lines ?? []) {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      dialog.append(paragraph);
    }
    const reasonField = reason ? document.createElement("textarea") : null;
    if (reasonField) dialog.append(reasonField);
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    const accept = document.createElement("button");
    accept.textContent = confirm;
    const answer = (confirmed) => {
      dialog.remove();
      resolve({ confirmed, reason: confirmed && reasonField ? reasonField.value : null });
    };
    cancel.addEventListener("click", () => answer(false));
    accept.addEventListener("click", () => answer(true));
    dialog.append(cancel, accept);
    document.body.append(dialog);
  });
}
