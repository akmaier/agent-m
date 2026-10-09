import { view } from "../../../src/test-pages/index.mjs";
import { parseAddress, connect } from "../../../src/repository-hosts/index.mjs";

const route = view.routes.find((candidate) => candidate.name === "release");

export const routes = {
  async release(app) {
    const { T, ghToken, token, main } = app;
    const instanceHost = connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken() });
    const productHost = connect(parseAddress(T.product.address), { token: token() });
    await route.render(main(), { instance: { host: instanceHost }, product: { host: productHost } }, {});
  },
};
