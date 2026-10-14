// Composition adapter: the dashboard's structured requirement routes call MOD-review-pages.
import { view } from "../../../src/review-pages/index.mjs";
import { registerStrategies } from "../../../src/job-runner/index.mjs";
import { openStore } from "../../../src/browser-store/index.mjs";
import { connect, parseAddress } from "../../../src/repository-hosts/index.mjs";

let registered = false;

export async function renderRequirementPrompt(app, target, name, params) {
  if (!registered) {
    view.strategies.forEach((strategies, at) => registerStrategies(`MOD-review-pages#${at}`, strategies));
    registered = true;
  }
  const instance = { repository: app.T.instance,
    host: connect(parseAddress(`https://github.com/${app.T.instance}`), { token: app.ghToken() }) };
  const address = parseAddress(app.T.product.address);
  const product = address.server === "github" && address.path === app.T.instance ? null
    : { address: app.T.product.address, kind: address.server, host: connect(address, { token: app.token() }) };
  await view.routes.find((route) => route.name === name).render(target,
    { instance, product, store: openStore(app.T.instance), go(route) { location.hash = `#${route}`; } }, params);
}
