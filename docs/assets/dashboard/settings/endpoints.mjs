// The dashboard's unowned Settings composition for MOD-settings-pages' endpoint routes.

import { view as settingsPages } from "../../../../src/settings-pages/index.mjs";
import { openStore } from "../../../../src/browser-store/index.mjs";

const endpointRoute = (name) => settingsPages.routes.find((route) => route.name === name);

export async function renderSection(app, box) {
  // A Settings section is an Element mount point. The dashboard's HTML-only test controls do not implement
  // tree replacement; the endpoint wiring test supplies that mount adapter when it exercises this composition.
  if (typeof box.replaceChildren !== "function") return;
  const context = {
    instance: { repository: app.T.instance },
    product: null,
    store: openStore(app.T.instance),
    go(route, params = {}) {
      if (route === "endpoints") location.hash = params.name ? `#endpoints/${encodeURIComponent(params.name)}` : "#endpoints";
      if (route === "bridge") location.hash = "#bridge";
    },
  };
  const configure = document.createElement("button");
  configure.className = "btn";
  configure.textContent = "Configure a model endpoint";
  configure.addEventListener("click", () => context.go("endpoints"));
  const slice = document.createElement("div");
  box.replaceChildren(configure, slice);
  await endpointRoute("settings").render(slice, context, {});
  const configureBridge = document.createElement("button");
  configureBridge.className = "btn settings-bridge-configure";
  configureBridge.textContent = "Configure the Agent M Bridge";
  configureBridge.addEventListener("click", () => context.go("bridge"));
  slice.append(configureBridge);
}
