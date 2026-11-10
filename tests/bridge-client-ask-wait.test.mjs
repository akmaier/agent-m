// MOD-bridge-client — an ask that is still running is asked again after a wait, not at once.
// Module: MOD-bridge-client
// Guards: UC-049; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
import assert from "node:assert/strict";
import test from "node:test";
import { ask, bridgeAt } from "../src/bridge-client/index.mjs";

const bridge = () => bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
const response = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

 // TST-2026111013 · level: unit · module: MOD-bridge-client
 // guards: UC-049; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge whose ask answers running until the test ends it
 // input: ask(bridge, { agent: "opencode" }, "write"), watched for 300 ms
 // expect: one GET of the ask in those 300 ms, not one after another without a pause; once the ask is done, ask returns its text
 // counter-proof: a loop that asks again at once sends hundreds of GETs in the same 300 ms
test("TST-2026111013: a running ask is asked again only after a wait", async (t) => {
  const prior = globalThis.fetch;
  t.after(() => { globalThis.fetch = prior; });
  let follows = 0, done = false;
  globalThis.fetch = async (url, init = {}) => {
    if (init.method === "POST") return response({ ask: "ASK-wait" });
    follows += 1;
    return response(done ? { state: "done", text: "draft", usage: null } : { state: "running" });
  };
  const asked = ask(bridge(), { agent: "opencode" }, "write");
  await new Promise((resolve) => setTimeout(resolve, 300));
  const within = follows;
  done = true;
  assert.deepEqual(await asked, { text: "draft", calls: [], usage: null });
  assert.equal(within, 1, `${within} GETs of a running ask in 300 ms`);
});
