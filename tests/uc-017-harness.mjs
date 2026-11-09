// The harness of the system and release tests of UC-017 (Configure the participants of the instance): the frame of MOD-site-frame started at the fragment #participants over the module view of MOD-settings-pages
// (tests/settings-pages-sources.d/frame.mjs), against MOD-repository-hosts' real GitHub host for the instance akmaier/agent-m and the products acme/alpha and acme/beta, answered by the fake of fetch over
// repositories that hold files (tests/settings-pages-sources.d/github.mjs). This browser's connections are model endpoints in its store and, where a test starts one, a real Bridge (MOD-bridge-http's serveBridge over
// MOD-bridge-jobs' real jobHandlers) on a "computer" that is a folder holding a small shell script named claude, which is the whole PATH of the test — no real agent starts. Nothing reaches the network. It holds no
// test and no expected result: what it builds are inputs, and every test states its own expected values.
// Imported by tests/system-uc-017-configure-participants.test.mjs, tests/system-uc-017-participants-through-the-frame.test.mjs and tests/release-uc-017-configure-participants.test.mjs.
//
// Module: MOD-settings-pages
// Module: MOD-bridge-jobs
// Level: system

import { createHash } from "node:crypto";
import { setMaxListeners } from "node:events";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { byClass, byTag, type } from "./settings-pages-harness.mjs";
import { visit as visitFrame, click as clickFrame, go, settle as settleFrame } from "./settings-pages-sources.d/frame.mjs";
import { blobSha } from "./settings-pages-sources.d/github.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

export { byClass, byTag, go, type };

setMaxListeners(100); // each page opened starts a frame on a window of its own

let counter = null; // the open requests to the loopback of the page opened last
// The time the answers take: the host's (the frame's settle) and those of the Bridges, which the host's world does not count.
export async function settle() {
  for (let quiet = 0; quiet < 2;) {
    await settleFrame();
    while (counter && counter.open > 0) await new Promise((resolve) => setTimeout(resolve, 10));
    await new Promise((resolve) => setTimeout(resolve, 10));
    quiet = counter && counter.open > 0 ? 0 : quiet + 1;
  }
}
/** A person's click, and the time the answers take. */
export async function click(button) { await clickFrame(button); await settle(); }

const native = globalThis.fetch;
export const INSTANCE = "akmaier/agent-m";
export const ORIGIN = "https://akmaier.github.io";
export const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
export const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk";
export const ALPHA = "https://github.com/acme/alpha";
export const BETA = "https://github.com/acme/beta";
export const PARTICIPANTS = "docs/participants.md";
export const REGISTER = (...rows) => ["# Participants of this instance", "", "| Name | Type | Model |", "|---|---|---|", ...rows, ""].join("\n");
export const EMPTY = REGISTER();

// ---------------------------------------------------------------- this browser's model endpoints

export const KEY = "sk-endpoint-secret-0123456789";
/** A model endpoint setting of this browser (MOD-browser-store's endpoint:<name>), of the model `model` at the place `place`. */
export const endpoint = (model, place, more = {}) => ({ kind: "openai-compatible", url: "https://models.example/v1", model, key: KEY, place, context: 200000, ...more });

// ---------------------------------------------------------------- the products and the instance's process model

// The head the world gives a repository at its first state: the SHA-1 of "<owner>/<name>#0" (tests/settings-pages-sources.d/github.mjs).
export const headOf = (repository) => createHash("sha1").update(`${repository}#0`).digest("hex");
const MODEL_PATH = "docs/process-models/scrum.md";
// The shipped Scrum model with its Product Owner filled by a person, so that a role needs a person.
const SCRUM = readFileSync(new URL("../src/model-catalogue/models/scrum.md", import.meta.url), "utf8").replace("| Product Owner | either |", "| Product Owner | person |");
/** The instance's files: its SPEC, the Scrum model as its process model, the register `register`, and `more`. */
export const instanceFiles = (register = EMPTY, more = {}) => ({ "SPEC.md": "# Fixture instance\n\n## Process\n\nNo process requirement.\n", [MODEL_PATH]: SCRUM, [PARTICIPANTS]: register, ...more });
const declaration = ["---", "model: scrum", `model_file: ${MODEL_PATH}`, `model_version: ${headOf(INSTANCE)}`, "---", "# How the fixture product is developed", "", "## Practices", "", "- none", "", "## Branches", "",
  "| Phase or time box | Branch |", "|---|---|", "", "## Definition of Done", "", "The job rules hold for every pull request; no condition is added.", ""].join("\n");
/** A product repository: its declaration and, for each team, a role assignment `rows` = [[role, [participants]]]. */
export const productOf = (teams, visibility = "private") => ({ visibility, files: { "docs/process.md": declaration,
  ...Object.fromEntries(Object.entries(teams).map(([team, rows]) => [`docs/role-assignments/${team}.md`,
    [`# ${team}`, "", "## Roles", "", "| Role | Participants |", "|---|---|", ...rows.map(([role, names]) => `| ${role} | ${names.join(", ")} |`), ""].join("\n")])) } });
/** The settings of this browser that list the products `webs` with a token for each. */
export const productSettings = (...webs) => ({ products: webs,
  ...Object.fromEntries(webs.map((web) => [`github-token:${new URL(web).pathname.slice(1)}`, { value: PRODUCT_TOKEN, name: "p", expires: "2027-01-01" }])) });

// ---------------------------------------------------------------- a computer with a coding agent, and the Bridge on it

// Claude Code's answer to `claude -p --output-format json`: one `result` line; the values are synthetic.
const CLAUDE_RESULT = JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "ok", usage: { input_tokens: 5, output_tokens: 1 } });
/** computer() -> { root, bin, folder } — a folder that is the whole PATH, holding claude, logged in; `folder` is its working folder. */
export function computer() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-uc017-"))), bin = join(root, "bin"), folder = join(root, "work-claude");
  mkdirSync(bin);
  mkdirSync(folder);
  writeFileSync(join(bin, "claude"), `#!/bin/sh\ncase "$*" in '--version') echo '2.1.300';; 'auth status') echo '{"authMethod":"claude.ai"}';; *) printf '%s\\n' '${CLAUDE_RESULT}';; esac\n`);
  chmodSync(join(bin, "claude"), 0o755);
  return { root, bin, folder };
}

/**
 * startBridge(t, machine, { name }) -> { name, address, token } — a real Bridge (serveBridge over jobHandlers) on `machine`: it offers claude with its working folder and answers only the instance's Pages origin
 * with its pairing token. The PATH of the process is the machine's for the length of the test `t`.
 */
export async function startBridge(t, machine, { name = "laptop" } = {}) {
  const { serveBridge } = await import("../src/bridge-http/index.mjs");
  const { jobHandlers } = await import("../src/bridge-jobs/index.mjs");
  const prior = process.env.PATH, info = console.info;
  process.env.PATH = machine.bin;
  console.info = () => {};
  const handlers = jobHandlers({ enclosures: openEnclosures(), agents: [{ name: "claude", folder: machine.folder }] });
  const server = await serveBridge({ name: () => name, host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: join(machine.root, "data"), paused: () => false }, { jobs: handlers, mail: {}, tunnels: {} });
  t.after(async () => { process.env.PATH = prior; console.info = info; await server.close(); rmSync(machine.root, { recursive: true, force: true }); });
  return { name, address: server.address, token: server.token };
}

// ---------------------------------------------------------------- the network of the browser

// GitHub's "Get a tree" of "<commit>:<folder>", which the world does not answer and the prompt bar asks: the world's files under the folder at its current state, all of them with `?recursive=1`, else
// the folder's own entries; 404 for a folder the repository does not hold; null for any other request.
function folderTree(world, url) {
  const found = /^\/repos\/([^/]+\/[^/]+)\/git\/trees\/[^/:]+:(.+)$/.exec(url.pathname);
  if (url.origin !== "https://api.github.com" || !found) return null;
  const answer = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const folder = `${decodeURIComponent(found[2])}/`, recursive = url.searchParams.get("recursive") === "1";
  const files = Object.entries(world.files(found[1])).filter(([path]) => path.startsWith(folder)).map(([path, text]) => [path.slice(folder.length), text]);
  if (!files.length) return answer({ message: "Not Found" }, 404);
  const entry = ([path, text]) => (!recursive && path.includes("/") ? [path.split("/")[0], { path: path.split("/")[0], type: "tree", sha: "0".repeat(40) }]
    : [path, { path, type: "blob", sha: blobSha(text) }]);
  return answer({ sha: "0".repeat(40), truncated: false, tree: [...new Map(files.map(entry)).values()] });
}

// The fetch the browser meets: a request to the loopback goes to what listens there, with the Origin a browser adds; a tree of a folder is folderTree's; everything else is GitHub's, the world's.
function network(world) {
  counter = { open: 0 };
  const open = counter;
  return async (input, init = {}) => {
    open.open += 1;
    try {
      const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
      if (["127.0.0.1", "localhost"].includes(url.hostname) && url.port) {
        return await native(url, { ...init, headers: { ...Object.fromEntries(new Headers(init.headers ?? {})), origin: ORIGIN } });
      }
      return folderTree(world, url) ?? await world.fetch(input, init);
    } finally { open.open -= 1; }
  };
}

// ---------------------------------------------------------------- the page

/**
 * page(t, { instance, products, settings, fragment }) -> { world, main, location, scripted } — the frame started at `fragment` (#participants), the instance akmaier/agent-m holding `instance` (files by path;
 * docs/participants.md among them as given), the products `products` ({ "owner/name": { files, visibility } }), this browser's store holding `settings` plus the instance's token.
 */
export async function page(t, { instance = instanceFiles(), products = {}, settings = {}, fragment = "#participants" } = {}) {
  return visitFrame(t, fragment, {
    repositories: { [INSTANCE]: { files: instance, visibility: "private" }, ...products },
    settings: { "github-token": { value: TOKEN, name: "Agent M · akmaier/agent-m", expires: "2027-01-01" }, ...settings },
    serve: (world) => network(world),
  });
}

// ---------------------------------------------------------------- what a person sees and presses

export const one = (root, className) => {
  const found = byClass(root, className);
  if (found.length !== 1) throw new Error(`${found.length} elements of class ${className}, not one`);
  return found[0];
};
/** Types `value` into the field of class `className` under `root`. */
export async function put(root, className, value) { type(one(root, className), value); await settle(); }
/** Chooses `value` in the select of class `className` under `root`, as a person does. */
export async function choose(root, className, value) {
  const select = one(root, className);
  select.value = value;
  select.dispatchEvent(new Event("change"));
  await settle();
}
/** The options of a select, each [value, text]. */
export const optionsOf = (select) => byTag(select, "option").map((each) => [each.value, each.textContent]);
/** The person opens + Add participant and picks the type `kind`. -> the form's panel. */
export async function addParticipant(main, kind) {
  await click(one(main, "participants-add"));
  await choose(main, "participant-type", kind);
  return one(main, "participants-add-panel");
}
/** The person presses Change on the participant `name`. */
export async function change(main, name) { await click(byClass(main, "participant-change").find((button) => button.textContent === `Change ${name}`)); }
/** The person presses Save in the form. */
export async function save(main) { await click(one(main, "participant-save")); }
/** The text of docs/participants.md in the world's instance repository. */
export const registerOf = (shown) => shown.world.files(INSTANCE)[PARTICIPANTS];
/** The commits of a repository of the world. */
export const commitsOf = (shown, repository = INSTANCE) => shown.world.commits(repository);
/** The folded explanations under `root`. */
export const folds = (root) => byTag(root, "details").filter((node) => String(node.className).split(" ").includes("explain"));
export const textOf = (node) => node.textContent.replace(/\s+/g, " ");
