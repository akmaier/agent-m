// MOD-desktop-shell — the served products the paired browser hands the Bridge, as docs/architecture/MOD-desktop-shell.md states them (Data: "`products` — the
// addresses of the product repositories whose queued jobs and runs this Bridge serves: those the paired browser handed it last (`PUT /v1/products`); none is
// entered in the window"; Start: its own handler "for `PUT /v1/products`, which keeps the products the paired browser hands it in the settings and in the
// products the running Bridge serves and then checks out again"), with MOD-bridge-client's handProducts and MOD-bridge-http's route, as their files state them.
// Run: node --test tests/mod-desktop-shell-served-products.test.mjs
//
// Module: MOD-desktop-shell; MOD-bridge-client; MOD-bridge-http
// Guards: UC-044; UC-049; THE LOCAL BRIDGE REQUIRES A TOKEN
// Level: unit
//
// Deterministic: the Bridge's data folder is a temporary folder, its server runs on loopback at a free port, and the page's requests carry the instance's
// origin. Where the module file leaves a reading open, the test states the one it takes:
//   - "in the products the running Bridge serves" is read at the failure node of UC-049's message: MOD-bridge-jobs' `POST /v1/ask` refuses a product it does
//     not serve before it reads the message's session, so a message whose session is "" is refused for its product while the product is not served, and
//     for its session once it is — and no session is started either way.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { serveBridge } from "../src/bridge-http/index.mjs";
import { ask, bridgeAt, handProducts } from "../src/bridge-client/index.mjs";
import { composeBridgeHandlers, composeWatchConfig } from "../src/desktop-shell/compose.mjs";
import { loadSettings, saveSettings } from "../src/desktop-shell/settings.mjs";

const ORIGIN = "https://akmaier.github.io";
const INSTANCE = "https://github.com/akmaier/agent-m";
const PRODUCT = "https://github.com/akmaier/AlienInvasion";
const DECLARED = { place: "this machine", capabilities: ["draft text"], models: [{ model: "claude-opus-5-5", context: 200000 }] };

// TST-1820002 · level: unit · module: MOD-desktop-shell; MOD-bridge-client; MOD-bridge-http
// guards: UC-044; UC-049
// given: a running Bridge served on loopback with the shell's handlers, the instance akmaier/agent-m, the agent claude with a working folder, no served product, and a counted checkOutAgain
// input: a message of the prompt bar for akmaier/AlienInvasion with session ""; handProducts with akmaier/AlienInvasion; the same message again; handProducts with an empty address; handProducts with []; the message again
// expect: the first message refused invalid-request for its product; { served: 1 }, the settings file and the watching naming the product, checkOutAgain called once; the second message refused only for its session, past the product; the empty address refused invalid-request with nothing changed and no checkout; [] { served: 0 }, a second checkout; counter-proof: the last message refused for its product again
test("TST-1820002: PUT /v1/products keeps the products the paired browser hands the Bridge, the running Bridge serves them at once, and checks out again", async (t) => {
  const data = await mkdtemp(join(tmpdir(), "agent-m-shell-products-"));
  const settings = saveSettings(data, { ...loadSettings(data), folder: "/work/agents", agents: [{ name: "claude", ...DECLARED }] });
  let checkouts = 0;
  const bridge = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: data, paused: () => false, name: () => "lab", version: null },
    composeBridgeHandlers(settings, null, data, { checkOutAgain: () => { checkouts += 1; }, instance: INSTANCE }));
  t.after(() => bridge.close());
  const realFetch = globalThis.fetch;
  globalThis.fetch = (url, init) => realFetch(url, { ...init, headers: { ...init.headers, Origin: ORIGIN } });
  t.after(() => { globalThis.fetch = realFetch; });
  const at = bridgeAt({ address: bridge.address, token: bridge.token });
  const message = () => ask(at, { agent: "claude", product: PRODUCT, session: "" }, "The invaders look like boxes.");
  const refusedFor = (pattern) => (error) => error.name === "BridgeFailed" && error.error === "invalid-request" && pattern.test(error.message);

  await assert.rejects(message(), refusedFor(/names a product this Bridge serves/), "a product not served is refused");

  assert.deepEqual(await handProducts(at, [PRODUCT]), { served: 1 });
  assert.deepEqual(JSON.parse(await readFile(join(data, "settings.json"), "utf8")).products, [PRODUCT]);
  assert.deepEqual(composeWatchConfig(settings, INSTANCE).products, [{ address: PRODUCT }], "the watching serves it");
  assert.equal(checkouts, 1, "the Bridge checks out again with the products");
  await assert.rejects(message(), refusedFor(/running session as text/), "failure node: the running Bridge serves the product at once — the message passes the product");

  await assert.rejects(handProducts(at, [""]), refusedFor(/repository addresses/));
  assert.deepEqual(JSON.parse(await readFile(join(data, "settings.json"), "utf8")).products, [PRODUCT], "nothing is kept for a refused list");
  assert.equal(checkouts, 1, "no checkout for a refused list");

  assert.deepEqual(await handProducts(at, []), { served: 0 });
  assert.equal(checkouts, 2);
  await assert.rejects(message(), refusedFor(/names a product this Bridge serves/), "counter-proof: a product no longer handed is no longer served");
});
