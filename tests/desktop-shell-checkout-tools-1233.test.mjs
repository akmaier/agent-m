// ITM-1233: the Bridge registers MOD-checkout-tools' strategies with its job runner, as MOD-checkout-tools states it ("It runs in Node only: the programs that run such jobs register its
// strategies"; "in CI or on a Bridge"; "A program registers them once, with MOD-job-runner's `registerStrategies`") and ARC-046 ("Those tools run in Node only, so only the Workflows and the
// Bridge register them"). CI does so in src/workflow-entries/compose.mjs (registerCheckoutTools); this file holds the Bridge to the same.
// Run: node --test tests/desktop-shell-checkout-tools-1233.test.mjs
//
// Module: MOD-desktop-shell
// Guards: ONE DEFINITION, THREE DRIVERS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; UC-049
// Level: unit
//
// No window and no server is started; no request is made. Whether a tool is registered is shown through the job runner itself: its offer of a kind's tools holds only the tools a program
// registered (MOD-job-runner, ToolUse), and registering the same tool under another owner throws DuplicateStrategy naming the first owner. The checkout is a folder of this file's own in
// the system's temporary folder. Each test states its input and its expected result before it runs (given / input / expect); the counter-proof — nothing registered yet — runs first in
// the same process.

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { offerTools } from "../src/job-runner/tools.mjs";
import { bridgeStrategyRegistrations, registerBridgeStrategiesOnce } from "../src/desktop-shell/compose.mjs";

const CHECKOUT_TOOLS = ["read", "write", "edit", "bash", "grep", "glob", "webfetch"];
const ENDPOINT = { name: "lab-model", type: "model endpoint", model: "small", context: 200000, place: "this machine", route: "endpoint lab-model",
  capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "reach the web", "use tools"] };
const contextIn = (checkout) => ({ params: {}, product: { address: "https://github.com/alice/product", snapshot: { commit: "c0ffee", paths: [], read: async () => null }, host: null, checkout },
  places: { sources: {}, mailbox: null, contents: [] } });

// TST-1233001 · level: unit · module: MOD-desktop-shell
// guards: ONE DEFINITION, THREE DRIVERS; UC-049
// given: the desktop composition module, nothing of MOD-checkout-tools registered yet in this process; the kind implement, a code kind whose tools are read, write, edit, bash, grep, glob and webfetch; a model endpoint that declares use tools and every capability those tools need
// input: offerTools(implement, endpoint) before the Bridge registers (counter-proof); bridgeStrategyRegistrations(); registerBridgeStrategiesOnce(); then registerStrategies("probe", { tools: { edit } })
// expect: before, the offer holds none of the seven tools; the registrations list MOD-checkout-tools with the strategies tools.read … tools.webfetch, each a function; registering them all raises no DuplicateStrategy; afterwards registering a tool edit throws DuplicateStrategy { strategy: "edit", owners: ["MOD-checkout-tools", "probe"] }
test("TST-1233001: the Bridge registers the tools of MOD-checkout-tools with its job runner — MOD-desktop-shell", async () => {
  const kind = await kindOf("implement");
  assert.deepEqual(kind.tools, CHECKOUT_TOOLS, "the kind's tools are the seven of MOD-checkout-tools");
  const before = await offerTools(kind, ENDPOINT, contextIn(null));
  assert.deepEqual((before?.use.definitions ?? []).map((tool) => tool.name).filter((name) => CHECKOUT_TOOLS.includes(name)), [], "counter-proof: no program registered them yet");
  const checkout = bridgeStrategyRegistrations().find(({ owner }) => owner === "MOD-checkout-tools");
  assert.ok(checkout, "failure node: the Bridge's registrations name MOD-checkout-tools");
  assert.deepEqual(Object.keys(checkout.strategies.tools ?? {}).sort(), [...CHECKOUT_TOOLS].sort());
  for (const name of CHECKOUT_TOOLS) assert.equal(typeof checkout.strategies.tools[name], "function", name);
  assert.doesNotThrow(() => registerBridgeStrategiesOnce());
  assert.throws(() => registerStrategies("probe", { tools: { edit: async () => "edited" } }),
    (error) => error.name === "DuplicateStrategy" && error.strategy === "edit" && JSON.stringify(error.owners) === JSON.stringify(["MOD-checkout-tools", "probe"]));
});

// TST-1233002 · level: unit · module: MOD-desktop-shell
// guards: ONE DEFINITION, THREE DRIVERS; UC-049
// given: the Bridge's strategies registered (TST-1233001); a checkout of the product — a folder holding a.txt "alpha\nbeta\n" — as the job context's product.checkout; the kind implement and the model endpoint of TST-1233001
// input: offerTools(implement, endpoint, context); the offer's call of edit { path: "a.txt", oldString: "beta", newString: "BETA" }, then of read { path: "a.txt" }
// expect: the offer holds the seven tools in the kind's order, with the kind's tool limit; edit answers "Edited a.txt (1 replacement)" and a.txt in the checkout holds "alpha\nBETA\n"; read answers the file's lines as "1: alpha" and "2: BETA"
test("TST-1233002: a code kind's job for a model endpoint on the Bridge is offered the checkout's tools and edits the checkout — MOD-desktop-shell", async (t) => {
  registerBridgeStrategiesOnce();
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-1233-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "a.txt"), "alpha\nbeta\n");
  const kind = await kindOf("implement");
  const offered = await offerTools(kind, ENDPOINT, contextIn(root));
  assert.deepEqual(offered.use.definitions.map((tool) => tool.name), CHECKOUT_TOOLS, "failure node: the offer holds the checkout's tools");
  assert.equal(offered.use.limit, kind.toolLimit);
  assert.equal(await offered.use.call("edit", { path: "a.txt", oldString: "beta", newString: "BETA" }), "Edited a.txt (1 replacement)");
  assert.equal(readFileSync(join(root, "a.txt"), "utf8"), "alpha\nBETA\n");
  const read = await offered.use.call("read", { path: "a.txt" });
  assert.match(read, /^1: alpha$/m);
  assert.match(read, /^2: BETA$/m);
});
