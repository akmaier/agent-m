// The page of ITM-572's tests of start.mjs (tests/site-frame-start-hand-over-review.test.mjs, tests/site-frame-start-hand-over-main.test.mjs):
// a fixture page whose only script tag is the one that loads start.mjs, with the given setup in its attributes, an offline fetch
// and a clock that runs nothing; and a probe that names who registered a strategy. Code only; it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

import { installPage, offline } from "./dom.mjs";
import { prepareJob, registerStrategies } from "../../src/job-runner/index.mjs";

// The page: `attributes` are those of the script tag that loads start.mjs; `fragment` the address's fragment.
export function pageWithScript(attributes, fragment = "") {
  const page = installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html", hash: fragment });
  offline();
  page.document.baseURI = new URL("../page.html", import.meta.url).href;
  const script = page.document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", "../src/site-frame/start.mjs");
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
  page.document.head.append(script);
  globalThis.setInterval = () => 1;
  return page;
}

// ownerOf(category, name) -> the owner that registered the strategy first, or null when nobody did. Registering the name as a probe
// is refused with a DuplicateStrategy that names the owners; a name nobody registered is taken by the probe, so a test asks only
// for names it expects to be registered, and for names it expects to be free once.
export function ownerOf(category, name) {
  try {
    registerStrategies("probe", { [category]: { [name]: () => [] } });
    return null;
  } catch (error) {
    if (error.name !== "DuplicateStrategy") throw error;
    return error.owners[0];
  }
}

// unknownStrategyOf(kind) -> the strategy prepareJob finds registered by nobody, or null when it finds none missing: the kind is prepared
// in a context with no product snapshot and no participant, so a kind whose strategies are all registered goes on to meet that empty
// context (and whatever error a recipe throws of it is not an UnknownStrategy) or is prepared.
export async function unknownStrategyOf(kind) {
  const context = { kind, params: {}, product: { address: "https://github.com/acme/product", snapshot: null, host: null }, instance: { snapshot: null, host: null },
    connect: async () => { throw new Error("no repository is opened here"); }, participants: [], places: { sources: {}, mailbox: null }, gates: [], person: "akmaier",
    now: new Date(0), agentM: { version: "test", commit: "test" }, jobId: null };
  try {
    await prepareJob(kind, context, { drafter: null, reviewers: [] });
    return null;
  } catch (error) {
    return error.name === "UnknownStrategy" ? error.strategy : null;
  }
}
