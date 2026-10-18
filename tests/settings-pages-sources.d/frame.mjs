// The frame of the tests that open MOD-settings-pages' routes `sources` and `library` as a person does (tests/system-uc-015-sources-through-the-frame.test.mjs, tests/release-uc-015-link-sources.test.mjs,
// tests/release-uc-016-new-version.test.mjs): a page opened at a fragment — a window that announces a change of the fragment, the location of the instance's Pages address, this browser's store holding the
// settings a test names, the world's fetch (tests/settings-pages-sources.d/github.mjs) and MOD-site-frame's startPage over the module view of MOD-settings-pages — and a person's click, the wait for the
// host's answers, and the change of the fragment. The test file calls installDocument() before its first visit; the modules are loaded here, after it. It is code only; it holds no expected result.
//
// Module: MOD-settings-pages; MOD-site-frame
// Level: unit

import { byTag, click as clickOnce, turn } from "../settings-pages-harness.mjs";
import { freshStore } from "../settings-pages-setup.d/dom.mjs";
import { githubWorld, installWorld, settled } from "./github.mjs";

let current = null; // the world of the page opened last

// The time the host takes to answer the requests a click made.
export const settle = async () => { await turn(); await settled(current); };
// A person's click, and the time the answers take.
export const click = async (button) => { await clickOnce(button); await settle(); };
// The fragment changes, as when a person follows a link or presses back, and the frame shows the route it names.
export const go = async (page, fragment) => { page.location.hash = fragment; page.scripted.dispatchEvent(new Event("hashchange")); await settle(); };

// visit(t, fragment, { repositories, settings, instance? }) -> { world, location, scripted, main }.
// `repositories` is githubWorld's argument ({ "owner/name": { files } }); `settings` maps the keys this browser's store keeps to their values, written in the order given; `instance` is the repository whose store it is;
// `alsoViews` names the folders of src/ whose view the frame loads beside MOD-settings-pages'; `serve(world)`, where given, returns the fetch the page meets instead of the world's own (a fetch that answers the workflow runs and dispatches over it, tests/settings-pages-sources.d/dispatch.mjs).
export async function visit(t, fragment, { repositories, settings, instance = "akmaier/agent-m", serve, alsoViews = [] }) {
  const { view } = await import("../../src/settings-pages/index.mjs");
  const { startPage } = await import("../../src/site-frame/index.mjs");
  const { writeSetting } = await import("../../src/browser-store/index.mjs");
  const world = githubWorld(repositories);
  installWorld(t, world);
  if (serve) globalThis.fetch = serve(world);
  current = world;
  const scripted = new EventTarget();
  Object.assign(scripted, globalThis.window);
  globalThis.window = scripted;
  const location = { hostname: "akmaier.github.io", pathname: "/agent-m/docs/index.html", host: "akmaier.github.io", protocol: "https:", hash: fragment };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  const realInterval = globalThis.setInterval;
  globalThis.setInterval = () => 1;
  t.after(() => { globalThis.setInterval = realInterval; });
  const store = freshStore(instance);
  for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value);
  const others = await Promise.all(alsoViews.map(async (folder) => (await import(`../../src/${folder}/index.mjs`)).view));
  await startPage({ page: "review", views: [view, ...others] });
  const page = { world, location, scripted, main: () => byTag(document.body, "main")[0] };
  await settle();
  return page;
}
