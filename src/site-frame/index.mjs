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

export { schemaForm } from "./forms.mjs";

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
