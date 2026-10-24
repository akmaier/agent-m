// home.mjs — the route `home` (docs/architecture/MOD-main-page.md, Parts and Interfaces: `home`): one card per product this browser keeps — or Agent M's own card while it keeps none — with
// its bar of six stages and its build, and below the cards what waits for a person across the instance.
//
// Module: MOD-main-page
//
// THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT. The page computes no share, no stage and no
// state: MOD-progress-measures derives them from the facts it gathers once for each product (productFacts, the scope `all`, or — where the repository stores an overview of its
// head — that overview and the scope `build`), and MOD-job-ledger's listJobs derives the jobs' rows again with the
// live states their runtimes report, asked once for each job whose record has no end (MOD-runtimes, as the route `jobs` asks them). It stores nothing. Each product is connected, through jobs.mjs's sourcesOf, by
// MOD-site-frame's chosenProduct with the token this browser keeps for it, and the instance with the frame's own host; a token reaches no other server. Once the cards are drawn, reread.mjs reads the
// jobs' states of the cards again at an interval, while the route is shown, and nothing else.
//
// Readings the module file leaves open, which this file takes:
//   - The fragment handed to chosenProduct is `#home/product=<the product's address, percent-encoded>`, the form the frame writes for a route with a product.
//   - A product's name on its card is its repository's path, `owner/name`; Agent M's own card is called Agent M.
//   - A card whose repository cannot be read says which, with the reason its host gives, and a button to the token's setting; each item that waits has a button to the page where it is decided;
//     while no product is kept, *+ Add product* stands below Agent M's card. Each calls the ViewContext's `go(route, params)`; no address is written here. The greeting is greeting.mjs's, with
//     *Get your own Agent M* at the address of the route `get-your-own` of the review pages ("docs/index.html#get-your-own"), a link and not a call of go(), since the main page loads no view of the review pages.

import { readSetting } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { menuOf } from "../site-frame/index.mjs";
import { productFacts, stageShares, currentStage, buildInProgress, waitingForAPerson, storedOverview } from "../progress-measures/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { bridgesOf, liveStatesOf, sourcesOf } from "./jobs.mjs";
import { el, productCard, readingCard, errorCard } from "./cards.mjs";
import { waitsList } from "./waits.mjs";
import { greeting } from "./greeting.mjs";
import { readAgain } from "./reread.mjs";

const reasonOf = (failure) => String(failure?.message ?? failure);

// The sources to draw a card for: each product this browser keeps, once, connected with its own token — or, while it keeps none, the instance itself as Agent M. The sources are those of
// jobs.mjs's sourcesOf for the route `home`; a card adds its title and, for the instance's own source (marked `own`), whether a token is stored for it.
async function cardSources(context) {
  const { store } = context;
  return (await sourcesOf(context, "home")).map((source) => (source.own === true
    ? { ...source, title: "Agent M", tokenStored: readSetting(store, "github-token") !== null }
    : { ...source, title: parseAddress(source.address).path }));
}

// The host a card reads through: the same host, whose repositoryInfo and readSnapshot are asked once for each branch, so that the head's commit and tree are read once for the card
// whatever it reads after the overview (A PAGE LOAD READS THE REPOSITORY IN BATCHES).
function once(host) {
  let info;
  const branches = new Map();
  return { ...host, repositoryInfo: () => (info ??= host.repositoryInfo()),
    readSnapshot: (ref) => { if (!branches.has(ref)) branches.set(ref, host.readSnapshot(ref)); return branches.get(ref); } };
}

// The overview stored for the head of the host's default branch (MOD-progress-measures' storedOverview), or null where there is none. A failure of the host here is left to the
// scope `all`, which meets it again and gives the card its reason; any other error is a fault of the page.
const HOST_FAILURES = new Set(["NotFound", "NotSupported", "TokenRefused", "PermissionMissing", "RateLimited", "Unreachable"]);
async function storedFor(host) {
  try {
    const { defaultBranch } = await host.repositoryInfo();
    return await storedOverview(await host.readSnapshot(defaultBranch));
  } catch (failure) {
    if (HOST_FAILURES.has(failure?.name)) return null;
    throw failure;
  }
}

// One source's facts — only what the build takes (the scope `build`) where an overview is stored, else everything (the scope `all`) —, with the jobs' rows derived again with the
// live states of the jobs that have not ended.
async function factsOf(host, { store, instanceSnapshot, instanceAt }, scope) {
  const facts = await productFacts(host, instanceSnapshot, instanceAt, new Date(), { scope });
  const lives = await liveStatesOf(facts.jobs, new Map([[facts.address, host]]), bridgesOf(facts.jobs, store));
  return { ...facts, jobs: await listJobs([{ address: facts.address, snapshot: facts.snapshot }], lives) };
}

async function cardOf(source, reading, go, knownSnapshot = null) {
  try {
    const raw = knownSnapshot === null ? source.host : { ...source.host, readSnapshot: (ref) => ref === knownSnapshot.ref ? Promise.resolve(knownSnapshot) : source.host.readSnapshot(ref) };
    const host = once(raw);
    const stored = await storedFor(host);
    const facts = await factsOf(host, reading, stored ? "build" : "all");
    const shares = stored ? stored.shares : await stageShares(facts);
    const model = facts.model?.name ?? null, current = currentStage(shares);
    return { card: productCard({ title: source.title, address: source.address, model, shares, current, build: buildInProgress(facts), own: source.own === true }),
      held: { source, facts, shares, current, model },
      waits: (stored ? stored.waiting : waitingForAPerson(facts)).map((item) => ({ ...item, product: source.title, address: source.address, own: source.own === true })) };
  } catch (failure) {
    return { card: errorCard({ title: source.title, address: source.address, reason: reasonOf(failure), go }), waits: [] };
  }
}

async function render(target, context) {
  const { instance } = context;
  const sources = await cardSources(context);
  const nodes = sources.map((source) => (source.reason === undefined ? readingCard(source) : errorCard({ ...source, go: context.go })));
  const cards = el("section", "cards", ...nodes);
  const entries = menuOf("main", []);
  // The route get-your-own is served by the review pages, under the entry Settings: the address of that entry with the route's name in its place.
  const getYourOwnHref = entries.find((entry) => entry.key === "settings").href.replace(/settings$/, "get-your-own");
  const greet = greeting({ useCasesHref: entries.find((entry) => entry.key === "use-cases").href, getYourOwnHref });
  const add = el("button", "add-product btn", "+ Add product");
  add.setAttribute("type", "button");
  add.addEventListener("click", () => context.go("add-product"));
  const adding = sources[0]?.own === true ? [add] : [];
  const waiting = el("section", "waits", el("h2", null, "What waits for a person"), el("p", "muted", "Reading…"));
  target.replaceChildren(greet, cards, ...adding, waiting);

  let reading;
  try {
    const { defaultBranch } = await instance.host.repositoryInfo();
    reading = { store: context.store, instanceSnapshot: await instance.host.readSnapshot(defaultBranch), instanceAt: (commit) => instance.host.readSnapshot(commit) };
  } catch (failure) {
    const reason = `Agent M's own repository could not be read: ${reasonOf(failure)}`;
    cards.replaceChildren(...sources.map((source) => errorCard({ ...source, reason, go: context.go })));
    target.replaceChildren(greet, cards, ...adding, waitsList([], { several: false, go: context.go }));
    return;
  }
  const waits = [], held = [];
  await Promise.all(sources.map(async (source, at) => {
    if (source.reason !== undefined) return;
    const result = await cardOf(source, reading, context.go, source.own === true ? reading.instanceSnapshot : null);
    nodes[at] = result.card;
    waits[at] = result.waits;
    held[at] = result.held;
    cards.replaceChildren(...nodes);
  }));
  target.replaceChildren(greet, cards, ...adding, waitsList(waits.flat(), { several: sources.length > 1, go: context.go }));
  readAgain({ target, cards, nodes, held, store: context.store });
}

/**
 * home: Route — { name: "home", entry: null, title: "Agent M", render }; the frame's default subject.
 */
export const home = { name: "home", entry: null, title: "Agent M", render };
