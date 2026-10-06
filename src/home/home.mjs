// The main page — THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE (UC-046): the menu of the process, one card per product
// this browser manages — or Agent M's own while it manages none —, each with its bar of six stages and the build in progress,
// and what waits for a person. Everything is read when the page opens, through the git host (GET only, each token only to
// the server that issued it), and derived by src/home/progress.mjs; nothing is written and nothing is stored but the texts of
// files by their blob SHA, which git never changes (settings-store.mjs fileTexts, shared with the review pages).
//
// What one card costs on GitHub: two requests for the commit and its tree, one for the release tags, one for the CI state of
// the commit where a requirement names a test file, one per hundred pull requests where the product has a plan or a backlog;
// file texts come from GitHub's raw host, or from this browser where it keeps them.

import builtFiles from "../../docs/assets/dashboard/built.json" with { type: "json" };
import { browserStore, fileTexts } from "../../docs/assets/settings-store.mjs";
import { parseProductAddress, isGitLab, readSnapshot, readFile, repositoryInfo, releaseTags, usedUpLimit, tokenRefusal }
  from "../../docs/assets/git-host.mjs";
import { pullRequests, commitCi } from "../../docs/assets/git-host/pull-requests.mjs";
import { readByBlob } from "../../docs/assets/review-core.mjs";
import { builtViews } from "../site/views.mjs";
import { MENU, menuHtml, stageView } from "../site/menu.mjs";
import { instanceOf } from "../site/instance-repository.mjs";
import { h } from "../site/html.mjs";
import { cardsFor, productFacts } from "./progress.mjs";
import { cardHtml, waitsHtml, waitingAcross } from "./cards.mjs";

const built = builtViews(builtFiles);
// Set by start(): nothing here runs on import outside a page (no `document`), so that node imports the module.
let store, kept, instance, cards = [], ownProgress = false;

// The review page of a view, for a product — the instance's own when product is null (UC-046 step 2).
function docsHref(view, product = null) {
  const q = !product || product.repo === instance && !isGitLab(product) ? ""
    : isGitLab(product) ? `?product=${encodeURIComponent(product.address)}` : `?repo=${encodeURIComponent(product.repo)}`;
  return `docs/${q}#${view}`;
}
// The page of a stage of a card: its menu entry's view, while one is built.
const stageHref = (product) => (stage) => {
  const view = stageView(MENU.find((e) => e.key === stage.menu), built);
  return view ? docsHref(view, product) : null;
};

// The token that reads a product (settings-store tokenFor): a GitLab product's own project token, never the GitHub token; a
// GitHub product's own token, or the instance's while it has none (A GITHUB PRODUCT USES A TOKEN OF ITS OWN).
const tokenFor = (p) => store.tokenFor(p);

async function read(card) {
  const product = parseProductAddress(card.address), token = tokenFor(product);
  const ref = isGitLab(product) ? (await repositoryInfo({ product, token })).defaultBranch : "main";
  const { commit, tree } = await readSnapshot({ product, ref, token });
  const byPath = new Map(tree.map((e) => [e.path, e]));
  const text = (path) => {
    const e = byPath.get(path);
    if (!e) return Promise.resolve(null);
    return readByBlob({ sha: e.sha, key: `${product.host}/${product.repo}/${e.sha}`, cache: kept,
      read: () => readFile({ product, commit, path, token }) });
  };
  return productFacts({ tree, text, pullRequests: () => pullRequests({ product, token }).list(),
    ci: () => commitCi({ product, commit, token }), tags: () => releaseTags({ product, token }) });
}

// Why a card could not be read (UC-046 3b), in the reader's terms.
function whyNot(e, product) {
  const server = isGitLab(product) ? product.host : "GitHub";
  if (usedUpLimit(e, isGitLab(product) ? product : null)) {
    return `${server}'s request limit is used up for now. Reload in a while${isGitLab(product) ? "" : " — a token in Settings raises the limit"}.`;
  }
  if (tokenRefusal(e, isGitLab(product) ? product : null)) return `${server} refused the stored token. Renew it in Settings.`;
  if (e?.status === 404) {
    return tokenFor(product) ? "No key in this browser reaches this repository. Give it a key of its own with + Add product."
      : "This repository could not be found — a private one is read with a token, stored in Settings.";
  }
  return `It could not be read: ${e?.message ?? e}`;
}

function render(now = new Date()) {
  const html = cards.map((c) => cardHtml({ kind: c.kind, title: c.title, address: c.address, facts: c.facts ?? null,
    error: c.error ?? null, stageHref: stageHref(c.kind === "agent-m" ? null : c.product), now })).join("");
  document.getElementById("cards").innerHTML = html + (ownProgress
    ? `<aside class="card card-add"><div><h2>Your products</h2><p>This browser manages no product yet. Add the repository of a
       product you build, on GitHub or on a GitLab server; its progress then stands here, in place of Agent M's.</p></div>
       <a class="btn primary" href="${h(docsHref("add"))}">+ Add product</a></aside>` : "");
  const waits = waitingAcross(cards);
  document.getElementById("waits").innerHTML = cards.every((c) => c.facts || c.error)
    ? waitsHtml(waits, { href: (view, w) => docsHref(view, w.card.kind === "agent-m" ? null : w.card.product) })
    : `<p class="muted">Reading…</p>`;
}

async function start() {
  store = browserStore();
  kept = fileTexts();
  instance = instanceOf(location);
  cards = cardsFor({ products: store.getProducts(), instance })
    .map((c) => ({ ...c, title: c.kind === "agent-m" ? "Agent M" : c.repo, product: parseProductAddress(c.address) }));
  ownProgress = cards[0]?.kind === "agent-m";
  document.getElementById("tabs").innerHTML = menuHtml({ built, href: (v) => docsHref(v) });
  document.getElementById("progress-title").innerHTML = ownProgress
    ? "Agent M <small>on its way to its first release</small>" : `Your products <small>${cards.length} in this browser</small>`;
  render();
  await Promise.all(cards.map(async (c) => {
    try { c.facts = await read(c); } catch (e) { c.error = whyNot(e, c.product); }
    render();
  }));
}

if (globalThis.document) start();
