// Release coverage of UC-001 through the dashboard's real #add route.
// Module: MOD-settings-pages
// Guards: UC-001; EVERY STEP EXPLAINS ITSELF; A MANAGED PRODUCT NEEDS NO PAGES SITE; ONE REVIEW LAYOUT FOR EVERY PRODUCT; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; EVERY PRODUCT HAS ITS OWN VERSION LINE; CONFIGURATION LIVES IN THE BROWSER; THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; ONE GITHUB TOKEN SERVES EVERY FEATURE; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT; A TOKEN IS SCOPED TO WHAT IT WRITES; THE SHARED PAGES ORIGIN IS DISCLOSED; THE PAGE NAMES WHERE IT SENDS; A PRODUCT IS NAMED BY ITS ADDRESS; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// Level: release
//
// TST-286 was revised for accepted UC-001 step 5 by a participant who implemented none of it (RELEASE TESTS ARE NOT WRITTEN BY THE
// IMPLEMENTER). Its expectations are read from the use case, not from the code: "writes the missing review layout into the product
// repository's default branch"; "on GitHub, sets up GitHub Actions for the product as UC-010's Set up GitHub Actions does: installs Agent M's
// workflows — among them the one that stores the product's trace graph on every push — and stores the secrets this browser keeps a value
// for; a secret it keeps none for is named with a link to the repository's secrets page"; "shows the commit as a link"; UC-010's
// Precondition: "the product's token as `AGENT_M_TOKEN`, an endpoint's key under the secret its configuration names"; and A TOKEN GOES
// ONLY TO THE SERVER THAT ISSUED IT. Left open by the texts and so not asserted: whether the workflows are a commit of their own or part of
// the layout's, and the order in which the secrets are stored.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, settle, setting, REPO, TOKEN } from "./app-harness.mjs";
import { blake2b, box, scalarMultBase } from "../src/repository-hosts/vendor/nacl-blake.mjs";

const PRODUCT = "alice/thesis-tool";
const GH = `https://github.com/${PRODUCT}`;
const GL = "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool";
const API = "https://api.github.com";
const PREFIX = `agent-m:${REPO}:`;
const PRODUCT_TOKEN = "github_pat_RELEASE0010123456789";
const GL_TOKEN = "glpat-RELEASE001";
const textOf = (html) => String(html).replace(/<[^>]*>/g, " ").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const sectionBefore = (html, heading, nextHeading) => {
  const start = html.indexOf(heading);
  const end = nextHeading ? html.indexOf(nextHeading, start + heading.length) : -1;
  return html.slice(start, end < 0 ? html.length : end);
};

async function page(address) {
  const server = await repoServer({ files: {} });
  await openDashboard({ server, hash: "#add" });
  const main = richDocument().byId("main");
  const input = main.querySelector("input.address");
  input.value = address;
  input.fire("input", { isTrusted: true });
  return main;
}

// The product repository's Actions secrets, as GitHub answers them (docs.github.com/en/rest/actions/secrets): the public key to seal to —
// made here from a fixed secret key, so that the test can open what is sealed —, the list of names, and each PUT noted with its body.
const RECIPIENT_SECRET = Uint8Array.from({ length: 32 }, (_, at) => at + 1);
const RECIPIENT_PUBLIC = Buffer.from(scalarMultBase(RECIPIENT_SECRET)).toString("base64");
const KEY_ID = "568250167242549743";
// Opens a sealed box with the recipient's secret key, as libsodium's crypto_box_seal_open does; null if it does not open.
function unseal(sealedBase64) {
  const sealed = Uint8Array.from(Buffer.from(String(sealedBase64), "base64"));
  if (sealed.length < 48) return null;
  const ephemeral = sealed.subarray(0, 32), both = new Uint8Array(64);
  both.set(ephemeral); both.set(scalarMultBase(RECIPIENT_SECRET), 32);
  const opened = box.open(sealed.subarray(32), blake2b(both, undefined, 24), ephemeral, RECIPIENT_SECRET);
  return opened === null ? null : new TextDecoder().decode(opened);
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// What this browser keeps beside the instance's token: the endpoint nvidia, whose configuration names its key's secret NVIDIA_API_KEY.
const NVIDIA_KEY = "nvapi-RELEASE-KEY-0123456789";
const ENDPOINT = setting("endpoint:nvidia", { kind: "openai-compatible", url: "https://integrate.api.nvidia.com/v1", model: "nemotron", key: NVIDIA_KEY, secret: "NVIDIA_API_KEY" });
// The instance's participants: one CI agent that reads the secret HOSTED_KEY, for which this browser keeps no value.
const PARTICIPANTS = ["# Participants of this instance", "", "**REGISTER**", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",
  "|---|---|---|---|---|---|---|---|",
  "| hosted-ci | CI agent | gpt-5 | 200000 | — | draft text, read the repository, write to the repository, run code and tests, use tools | hosted runner | ci hosted secret HOSTED_KEY |", ""].join("\n");
const SECRETS_PAGE = `${GH}/settings/secrets/actions`;
const LAYOUT = ["docs/use-cases/README.md", "docs/architecture/README.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "SPEC.md", "CHANGELOG.md"];
const WORKFLOW = /^\.github\/workflows\/[^/]+\.ya?ml$/;

// The repository a GitHub API request is about: its /repos/<owner>/<name> path, or for POST /graphql the owner and name its variables give.
function repositoryOf(url, body) {
  if (url.origin !== API) return null;
  if (url.pathname === "/graphql") {
    try { const { owner, name } = JSON.parse(String(body)).variables ?? {}; return owner && name ? `${owner}/${name}` : null; } catch { return null; }
  }
  const m = /^\/repos\/([^/]+\/[^/]+)(?:\/|$)/.exec(url.pathname);
  return m ? m[1] : null;
}

// The instance's server and the product's behind one fetch: a request goes to the product's server when it is about the product's
// repository. Every request is noted with its address, body, authorisation and the repository it is about.
async function releaseWorld(files = { "README.md": "# Product\n" }) {
  const requests = [], secrets = [];
  const product = await repoServer({ repo: PRODUCT, files, handlers: [
    (url) => url.pathname === `/repos/${PRODUCT}`
      ? json({ visibility: "public", private: false, default_branch: "main", permissions: { push: true } })
      : undefined,
    (url, init) => {
      const base = `/repos/${PRODUCT}/actions/secrets`;
      if (url.origin !== API || !url.pathname.startsWith(base)) return undefined;
      if (init.method === "GET" && url.pathname === `${base}/public-key`) return json({ key_id: KEY_ID, key: RECIPIENT_PUBLIC });
      if (init.method === "GET" && url.pathname === base) return json({ total_count: secrets.length, secrets: secrets.map(({ name }) => ({ name })) });
      if (init.method === "PUT") { secrets.push({ name: decodeURIComponent(url.pathname.slice(base.length + 1)), body: JSON.parse(String(init.body)) }); return new Response(null, { status: 201 }); }
      return undefined;
    },
  ] });
  const instance = await repoServer({ files: { "docs/participants.md": PARTICIPANTS }, handlers: [
    (url, init) => {
      const repository = repositoryOf(url, init.body);
      requests.push({ url: url.href, method: init.method ?? "GET", body: String(init.body ?? ""), authorization: new Headers(init.headers ?? {}).get("Authorization"), repository });
      return repository === PRODUCT ? product.fetch(url.href, init) : undefined;
    },
  ] });
  return { instance, product, requests, secrets };
}

async function addProduct(world) {
  await openDashboard({ server: world.instance, hash: "#add", entries: ENDPOINT });
  const main = richDocument().byId("main"), address = main.querySelector("input.address");
  address.value = GH; address.fire("input", { isTrusted: true });
  const ack = main.querySelector("input.ack"), token = main.querySelector("input.token");
  ack.checked = true; ack.fire("change", { isTrusted: true }); token.value = PRODUCT_TOKEN;
  await press(world.instance, main.querySelector("button.store"));
  return main;
}

async function gitlabReleaseWorld() {
  const base = `/api/v4/projects/${encodeURIComponent("fau-ai-taskforce/tools/thesis-tool")}`;
  const files = { "README.md": "# Product\n" }, requests = [], writes = [];
  const instance = await repoServer({ files: {}, handlers: [(url, init = {}) => {
    const token = new Headers(init.headers ?? {}).get("private-token");
    requests.push({ url: url.href, token, authorization: new Headers(init.headers ?? {}).get("Authorization") });
    if (url.origin !== "https://gitlab.rrze.fau.de" || !url.pathname.startsWith(base)) return undefined;
    const rest = url.pathname.slice(base.length), method = (init.method ?? "GET").toUpperCase();
    if (method === "GET" && !rest) return json({ id: 7, path_with_namespace: "fau-ai-taskforce/tools/thesis-tool", default_branch: "main", visibility: "private", permissions: { project_access: { access_level: 40 }, group_access: null } });
    if (method === "GET" && rest === "/repository/branches/main") return json({ name: "main", commit: { id: "a".repeat(40) } });
    if (method === "GET" && rest.startsWith("/repository/commits/")) return json({ id: "a".repeat(40) });
    if (method === "GET" && rest === "/repository/tree") return json(Object.keys(files).map((path) => ({ type: "blob", path, id: "b".repeat(40) })));
    if (method === "POST" && rest === "/repository/commits") { const body = JSON.parse(init.body); for (const action of body.actions) files[action.file_path] = action.content; writes.push(body); return json({ id: "c".repeat(40), web_url: `${GL}/-/commit/${"c".repeat(40)}` }); }
    return json({ message: "not found" }, 404);
  }] });
  return { instance, files, requests, writes };
}

// TST-283 · level: release · module: MOD-settings-pages
// guards: UC-001; EVERY STEP EXPLAINS ITSELF; A MANAGED PRODUCT NEEDS NO PAGES SITE; ONE REVIEW LAYOUT FOR EVERY PRODUCT; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; EVERY PRODUCT HAS ITS OWN VERSION LINE; CONFIGURATION LIVES IN THE BROWSER; THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; ONE GITHUB TOKEN SERVES EVERY FEATURE; A GITHUB PRODUCT USES A TOKEN OF ITS OWN; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT; A TOKEN IS SCOPED TO WHAT IT WRITES; THE SHARED PAGES ORIGIN IS DISCLOSED; THE PAGE NAMES WHERE IT SENDS; A PRODUCT IS NAMED BY ITS ADDRESS; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: an instance dashboard, a GitHub product address and a GitLab product address
// input: type each address in the actual Add product route
// expect: server-specific key steps disclose the required scope, storage, destinations, layout and GitLab project-token route before any credential can be stored
test("TST-283 UC-001 release disclosure covers GitHub and GitLab product routes", async () => {
  const gh = await page(GH);
  const ghText = textOf(gh.innerHTML);
  const stepA = gh.innerHTML.slice(gh.innerHTML.indexOf("Step A · A key for the product"), gh.innerHTML.indexOf("Step B · Check"));
  const repository = gh.innerHTML.slice(0, gh.innerHTML.indexOf('<div class="steps">'));
  assert.match(stepA, /<details class="explain">/, "Step A itself has the folded product-key explanation");
  assert.match(repository, /<details class="explain">[\s\S]*A \*repository\* is the folder on GitHub/, "the address field itself has the folded repository explanation");
  assert.match(ghText, /Open GitHub's token page \(prefilled\)/);
  assert.match(ghText, /Only select repositories/);
  assert.match(ghText, /alice\/thesis-tool.*nothing else/);
  const tokenLink = gh.querySelector("a");
  const prefilled = new URL(tokenLink.href).searchParams;
  assert.equal(prefilled.get("name"), "Agent M · alice/thesis-tool");
  assert.equal(prefilled.get("description"), "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.");
  assert.equal(prefilled.get("target_name"), "alice", "the product owner scopes the token page");
  assert.equal(prefilled.get("expires_in"), "90");
  assert.deepEqual(Object.fromEntries([...prefilled].filter(([key]) => !["name", "description", "target_name", "expires_in"].includes(key))), {
    contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", secrets: "write", metadata: "read",
  }, "the prefilled product token grants every and only UC-014 feature permission");
  const long = await page("https://github.com/owner-with-a-long-name/repository-name-that-is-longer-than-github-allows");
  const longParams = new URL(long.querySelector("a").href).searchParams;
  assert.equal(longParams.get("name"), "Agent M · repository-name-that-is-longer-than-github-allows".slice(0, 40), "a long token name drops the owner then truncates only the repository end");
  assert.equal(longParams.get("description"), "Agent M for the product owner-with-a-long-name/repository-name-that-is-longer-than-github-allows: reviews, commits, issues, pull requests and runs of the work you start in it.");
  assert.match(gh.querySelector("input.expires").value, /^\d{4}-\d\d-\d\d$/, "the pasted token has an expiry date to confirm");
  assert.match(ghText, /kept in this browser for this product only/i);
  assert.match(ghText, /sent only to GitHub's API/i);
  assert.match(ghText, /Everything Agent M stores in this browser is stored for the address https:\/\/akmaier\.github\.io — every GitHub Pages site under that same akmaier\.github\.io domain can read it\./);
  assert.match(ghText, /missing review layout.*default branch/i);
  assert.match(ghText, /nothing is written to the instance repository/i);
  const ghStepB = sectionBefore(gh.innerHTML, "Step B · Check", "Step C · Add the product");
  const ghStepC = sectionBefore(gh.innerHTML, "Step C · Add the product");
  assert.match(ghStepB, /<details class="explain">[\s\S]*The product gets a key of its own/, "GitHub Step B itself explains why this product needs its own key");
  assert.match(ghStepC, /<details class="explain">[\s\S]*Pressing \*Add product\* writes one commit/, "Step C explains the contents of its review-layout commit");
  assert.match(ghStepC, /<details class="explain">[\s\S]*ordinary commit[\s\S]*revert it/, "Step C explains how its layout commit can be reverted");
  assert.match(ghStepC, /<details class="explain">[\s\S]*kept only in this browser&#39;s own storage[\s\S]*instance repository/, "Step C explains why its product list stays in this browser");

  const gl = await page(GL);
  const glText = textOf(gl.innerHTML);
  const glStepA = sectionBefore(gl.innerHTML, "Step A · Create a key for this project", "Step B · Give the key to Agent M");
  const glStepB = sectionBefore(gl.innerHTML, "Step B · Give the key to Agent M", "Step C · Add the product");
  assert.match(glStepA, /<details class="explain">[\s\S]*The product gets a key of its own/, "GitLab Step A itself explains why this project needs its own key");
  assert.match(glStepB, /<details class="explain">[\s\S]*The product gets a key of its own/, "GitLab Step B itself explains why this project needs its own key");
  assert.match(glText, /Create a key for this project/);
  assert.match(glText, /Settings → Access tokens/);
  assert.match(glText, /Maintainer/);
  assert.match(glText, /scope: api/);
  assert.match(glText, /personal access token with api scope reaches every project you can reach/i);
  assert.match(glText, /only to this project's own API/i);
  assert.match(glText, /never to GitHub/i);
});

// TST-286 · level: release · module: MOD-settings-pages
// guards: UC-001; ONE CLICK PER DECISION; ADDING A PRODUCT CREATES ITS LAYOUT; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A MANAGED PRODUCT NEEDS NO PAGES SITE; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a browser with its instance token and the endpoint nvidia (key, secret NVIDIA_API_KEY); an instance whose participant hosted-ci reads HOSTED_KEY, kept by no value here; a public GitHub product with no review layout, no workflow and no Actions secret, whose server answers its Actions secrets with a public key
// input: store the product token, fire a synthetic Add product event, then make one trusted Add product click
// expect: the synthetic event writes nothing and stores no secret; the trusted click writes the complete missing layout first, then Agent M's workflows — one of them run on every push and storing the trace graph — and nothing else, no Pages site; it stores AGENT_M_TOKEN (the product's token) and NVIDIA_API_KEY (the endpoint's key), each sealed to the product repository's public key, and names HOSTED_KEY with a link to the repository's secrets page; the page shows the layout's commit as a link; the product's token goes only to GitHub's API for the product repository, the instance's token only to GitHub's API for the instance repository's reads; no token or key is in clear in any body or address; the instance repository is not written
test("TST-286 UC-001 release transaction guards product writes and browser state", async () => {
  const synthetic = await releaseWorld();
  let main = await addProduct(synthetic);
  main.querySelector("button.add").fire("click", { isTrusted: false });
  await settle(synthetic.instance);
  assert.equal(synthetic.product.writes.length, 0, "a synthetic event cannot write the product layout or a workflow");
  assert.deepEqual(synthetic.secrets, [], "a synthetic event cannot store an Actions secret");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "a synthetic event cannot change the product list");

  const trusted = await releaseWorld({ "README.md": "# Product\n", "CHANGELOG.md": "# Changelog of alice/thesis-tool\n\n## 1.0\n" });
  main = await addProduct(trusted);
  await press(trusted.instance, main.querySelector("button.add"));
  await settle(trusted.instance);

  // The layout: "writes the missing review layout into the product repository's default branch …, skipping whatever already exists".
  const writes = trusted.product.writes, written = (write) => Object.keys(write.files);
  const layoutWrites = writes.filter((write) => written(write).some((path) => LAYOUT.includes(path)));
  assert.equal(layoutWrites.length, 1, "the missing layout is written in one commit");
  assert.equal(writes[0], layoutWrites[0], "the layout's commit comes first");
  for (const path of LAYOUT) assert.ok(trusted.product.files[path], `the product receives required review-layout part ${path}`);
  assert.match(trusted.product.files["docs/use-cases/README.md"], /status is derived from the approval records/i, "the layout is self-sufficient rather than a product-site placeholder");
  assert.equal(trusted.product.files["CHANGELOG.md"], "# Changelog of alice/thesis-tool\n\n## 1.0\n", "an existing product keeps its independent version line");
  assert.equal(trusted.product.files["README.md"], "# Product\n", "the existing product content is preserved");

  // The workflows: "on GitHub, sets up GitHub Actions … installs Agent M's workflows — among them the one that stores the product's
  // trace graph on every push"; the postcondition: "the review layout and, on GitHub, Agent M's workflows; it has no Pages site".
  const workflows = writes.flatMap(written).filter((path) => WORKFLOW.test(path));
  assert.ok(workflows.length > 0, "Add product on GitHub installs Agent M's workflows");
  assert.ok(writes.every((write) => written(write).every((path) => LAYOUT.includes(path) || WORKFLOW.test(path))), "nothing but the layout and the workflows is written");
  assert.ok(!Object.keys(trusted.product.files).some((path) => /CNAME|pages/i.test(path)), "Add product creates no product Pages-site setup");
  // A workflow runs on every push when its `on:` block names `push:` with nothing under it (no branches or paths that narrow it).
  const onEveryPush = (text) => {
    const lines = String(text).split("\n"), at = lines.findIndex((line) => /^on:\s*$/.test(line));
    if (at < 0) return false;
    for (let i = at + 1; i < lines.length && (/^\s/.test(lines[i]) || lines[i] === ""); i += 1) {
      const push = /^(\s+)push:\s*(#.*)?$/.exec(lines[i]);
      if (!push) continue;
      const below = lines.slice(i + 1).find((line) => line.trim() !== "" && !/^\s*#/.test(line));
      return !below || below.search(/\S/) <= push[1].length;
    }
    return false;
  };
  assert.ok(workflows.some((path) => onEveryPush(trusted.product.files[path]) && /trace graph|trace-cache/i.test(trusted.product.files[path])),
    "among the workflows is one that runs on every push and stores the product's trace graph");

  // The secrets: "stores the secrets this browser keeps a value for" — UC-010: "the product's token as AGENT_M_TOKEN, an endpoint's key under
  // the secret its configuration names" — "through the server's API with the product's token; no value is shown, typed or written to a file".
  assert.deepEqual(trusted.secrets.map(({ name }) => name).sort(), ["AGENT_M_TOKEN", "NVIDIA_API_KEY"], "the secrets this browser keeps a value for are stored, and no other");
  const sealed = Object.fromEntries(trusted.secrets.map(({ name, body }) => [name, body]));
  for (const [name, value] of [["AGENT_M_TOKEN", PRODUCT_TOKEN], ["NVIDIA_API_KEY", NVIDIA_KEY]]) {
    assert.equal(sealed[name].key_id, KEY_ID, `${name} names the product repository's public key`);
    assert.equal(unseal(sealed[name].encrypted_value), value, `${name} is its value sealed to the product repository's public key`);
  }
  const secretPuts = trusted.requests.filter((request) => request.method === "PUT" && request.url.startsWith(`${API}/repos/${PRODUCT}/actions/secrets/`));
  assert.ok(secretPuts.length === 2 && secretPuts.every((request) => request.authorization === `Bearer ${PRODUCT_TOKEN}`), "each secret is stored through GitHub's API with the product's token");
  // "a secret it keeps none for is named with a link to the repository's secrets page".
  assert.ok(main.innerHTML.includes("HOSTED_KEY"), "the secret this browser keeps no value for is named");
  const hrefs = [...main.innerHTML.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
  assert.ok(hrefs.includes(SECRETS_PAGE), "with a link to the repository's secrets page");
  // "shows the commit as a link".
  assert.ok(hrefs.some((href) => new RegExp(`^${GH}/commit/[0-9a-z]{40}$`).test(href)), "the commit is shown as a link");

  // A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT: "as the authorisation header of its requests, or sealed to the public key of one of
  // that server's repositories as that repository's CI secret". The product's token is issued for the product repository; the instance's
  // token for the instance repository, which Add product only reads (its participants, for the secrets they name).
  const productTokenRequests = trusted.requests.filter((request) => request.authorization === `Bearer ${PRODUCT_TOKEN}`);
  assert.ok(productTokenRequests.length > 0 && productTokenRequests.every((request) => request.repository === PRODUCT), "the product's token goes only to GitHub's API for the product repository");
  assert.ok(trusted.requests.filter((request) => request.repository === PRODUCT).every((request) => request.authorization === `Bearer ${PRODUCT_TOKEN}`), "every request about the product repository carries the product's token");
  const instanceTokenRequests = trusted.requests.filter((request) => request.authorization === `Bearer ${TOKEN}`);
  assert.ok(instanceTokenRequests.every((request) => request.repository === REPO && (request.method === "GET" || request.url === `${API}/graphql`)),
    "the instance's token goes only to GitHub's API for reads of the instance repository");
  assert.ok(!trusted.requests.some((request) => request.authorization && request.repository === null), "no token goes to an address that is not a repository's API on its server");
  for (const value of [PRODUCT_TOKEN, TOKEN, NVIDIA_KEY]) {
    const encoded = Buffer.from(value).toString("base64");
    assert.ok(!trusted.requests.some((request) => request.url.includes(value) || request.body.includes(value) || request.body.includes(encoded)), "no token or key travels in clear in a body or an address");
    assert.equal(main.innerHTML.includes(value), false, "no value is shown on the page");
  }
  assert.deepEqual(trusted.instance.writes, [], "the instance repository is never named or written during Add product");
  assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token`)).value, TOKEN,
    "the canonical instance credential remains distinct from the product credential");
});

// TST-287 · level: release · module: MOD-settings-pages
// guards: UC-001; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab product and an instance whose GitHub token is present
// input: paste its project token and expiry, Store and check, then trusted Add product
// expect: the project token alone reads and writes GitLab, is kept under its canonical project key, and the instance token never reaches GitLab
test("TST-287 UC-001 release GitLab transaction keeps its project token at its issuer", async () => {
  const world = await gitlabReleaseWorld();
  await openDashboard({ server: world.instance, hash: "#add" });
  const main = richDocument().byId("main"), address = main.querySelector("input.address");
  address.value = GL; address.fire("input", { isTrusted: true });
  const ack = main.querySelector("input.ack"), token = main.querySelector("input.token");
  ack.checked = true; ack.fire("change", { isTrusted: true }); token.value = GL_TOKEN;
  await press(world.instance, main.querySelector("button.store"));
  await press(world.instance, main.querySelector("button.add"));
  assert.equal(world.writes.length, 1, "the actual GitLab product receives one layout commit");
  assert.ok(world.files["SPEC.md"] && world.files["docs/approvals/README.md"], "the GitLab product receives the review layout");
  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}products`)), [GL]);
  const storedRaw = globalThis.localStorage.getItem(`${PREFIX}gitlab-token:gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool`);
  assert.ok(storedRaw, `canonical GitLab key exists: ${Array.from({ length: globalThis.localStorage.length }, (_, i) => globalThis.localStorage.key(i)).join(",")}`);
  const stored = JSON.parse(storedRaw);
  assert.equal(stored.value, GL_TOKEN); assert.match(stored.expires, /^\d{4}-\d\d-\d\d$/);
  const gitlabRequests = world.requests.filter((request) => request.url.startsWith("https://gitlab.rrze.fau.de/api/v4/"));
  assert.ok(gitlabRequests.length > 0 && gitlabRequests.every((request) => request.token === GL_TOKEN && request.authorization === null), "every token-bearing request stays at the issuing GitLab API");
  assert.ok(!gitlabRequests.some((request) => request.token === TOKEN || request.authorization === `Bearer ${TOKEN}`), "the instance GitHub token never leaks to GitLab");
});
