// MOD-settings-pages' route `add-product`, Step C on a GitHub product (UC-001 step 5; docs/architecture/MOD-settings-pages.md, Interfaces:
// view, `add-product`): before its click Step C states what the click writes where — the layout and Agent M's job workflow into the
// product's default branch, the address into this browser's list, the secrets this browser keeps a value for into the repository's
// Actions secrets. The person's one click commits the layout with reviewLayoutCommit, adds the address, then calls MOD-runtimes'
// actionsSetup for the product — the host Step C read it with, and the key MOD-site-frame's tokenKeyOf gives for its token — on the head
// the layout's commit left, and runs its setUp in the same click. The panel shows the layout's commit as a link, then the commit setUp
// made and the secrets it stored, never a value, and names each secret this browser keeps no value for with the repository's secrets
// page. A failure of actionsSetup or setUp is named; it undoes neither the layout's commit nor the address. A GitLab product's click
// writes the layout and adds the address, nothing else.
// Run: node --test --test-timeout=120000 tests/settings-pages-add-product-actions-setup.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-001; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE PAGE NAMES WHERE IT SENDS; GITLAB PRODUCTS ARE SUPPORTED
// Level: unit
//
// The expected results are written here from UC-001 step 5 ("on GitHub, sets up GitHub Actions for the product as UC-010's Set up
// GitHub Actions does: installs Agent M's workflows … and stores the secrets this browser keeps a value for; a secret it keeps none for
// is named with a link to the repository's secrets page") and from A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT (a token leaves the
// browser only as the authorisation header of its server's requests, or sealed as that server's CI secret); none is read from a
// document when a test runs. The callers read first (AGENTS.md 6a.1): tests/settings-pages-job-workflow-github-setup.test.mjs
// (TST-2026110921, the same setup from the job workflow's line of Settings), tests/settings-pages-add-product.test.mjs (the route drawn
// over the fixture DOM) and tests/system-uc-001-add-product.test.mjs (repoServer behind a dispatching fetch). The DOM is
// tests/settings-pages-harness.mjs's; the GitHub servers of the instance and the product are tests/app-harness.mjs's repoServer, behind
// one fake of fetch that hands each request to the server of its repository; the product's server answers its Actions secrets through a
// handler of this file. The values are fixtures. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byTag, byClass, type, turn, click, until } from "./settings-pages-harness.mjs";
import { repoServer } from "./app-harness.mjs";

const document = installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, readSetting, writeSetting } = await import("../src/browser-store/index.mjs");
const { connect, parseAddress } = await import("../src/repository-hosts/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "add-product");

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
}

const API = "https://api.github.com";
const INSTANCE = "akmaier/agent-m";
const PRODUCT = "alice/thesis-tool", WEB = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_FIXTUREproductTOKEN0123456789";
const INSTANCE_TOKEN = "github_pat_FIXTUREinstanceTOKEN0123456789";
const NVIDIA_KEY = "nvapi-FIXTURE-KEY-0123456789";
const PUBLIC_KEY = Buffer.alloc(32, 7).toString("base64");
const text = (...lines) => `${lines.join("\n")}\n`;
const PARTICIPANTS = text("# Participants of this instance", "", "**REGISTER**", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",
  "|---|---|---|---|---|---|---|---|",
  "| hosted-ci | CI agent | gpt-5 | 200000 | — | draft text, read the repository, write to the repository, run code and tests, use tools | hosted runner | ci hosted secret HOSTED_KEY |");
const LAYOUT = ["docs/use-cases/README.md", "docs/architecture/README.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "SPEC.md", "CHANGELOG.md"];
const JOB_WORKFLOW = ".github/workflows/agent-m-jobs.yml";

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// The product's Actions secrets: listed by name, the public key to seal to, and each PUT noted with its body. `refuse`: the token may not
// read them (403), as GitHub answers a token without the permission Secrets.
function actionsSecrets({ refuse = false } = {}) {
  const stored = [];
  const handler = (url, init) => {
    if (url.origin !== API || !url.pathname.startsWith(`/repos/${PRODUCT}/actions/secrets`)) return undefined;
    if (refuse) return json({ message: "Resource not accessible by personal access token" }, 403);
    if (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/actions/secrets`) return json({ total_count: stored.length, secrets: stored.map(({ name }) => ({ name })) });
    if (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/actions/secrets/public-key`) return json({ key_id: "fixture-key-id", key: PUBLIC_KEY });
    if (init.method === "PUT") {
      stored.push({ name: decodeURIComponent(url.pathname.split("/").pop()), body: String(init.body) });
      return new Response(null, { status: 201 });
    }
    return undefined;
  };
  return { stored, handler };
}

// The instance's server (its participants register) and the product's, behind one fetch that hands each request to the server of its
// repository — a GraphQL request by the repository its variables name. Every request is noted with the authorisation it carries.
async function servers({ productFiles = { "README.md": "# Thesis tool\n" }, refuseSecrets = false } = {}) {
  const secrets = actionsSecrets({ refuse: refuseSecrets });
  const product = await repoServer({ repo: PRODUCT, files: productFiles, handlers: [secrets.handler] });
  const instance = await repoServer({ repo: INSTANCE, files: { "docs/participants.md": PARTICIPANTS } });
  const sent = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    sent.push({ method: String(init.method ?? "GET").toUpperCase(), url: url.href, authorization: new Headers(init.headers ?? {}).get("authorization"), body: typeof init.body === "string" ? init.body : "" });
    let repository = null;
    if (url.pathname === "/graphql") {
      const { owner, name } = JSON.parse(init.body).variables ?? {};
      repository = `${owner}/${name}`;
    } else repository = url.pathname.split("/").slice(2, 4).join("/");
    if (repository === PRODUCT) return product.fetch(input, init);
    if (repository === INSTANCE) return instance.fetch(input, init);
    return json({ message: "Not Found" }, 404);
  };
  return { product, instance, secrets, sent, fetch };
}

// The route drawn over a fresh store holding the product's own token and the endpoint nvidia with its key and secret; `instanceHost`
// true hands the route a connected instance host, as MOD-site-frame's frame does, else only the instance's repository, as the dashboard's
// own #add does. The address is typed. -> the target, the store and Step C.
async function drawn({ address = WEB, instanceHost = false, extra = () => {} } = {}) {
  Object.defineProperty(globalThis, "localStorage", { value: new FakeStorage(), configurable: true, writable: true });
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", { value: INSTANCE_TOKEN, name: "GitHub token", expires: "2027-06-01", stored: "2026-01-01" });
  writeSetting(store, `github-token:${PRODUCT}`, { value: PRODUCT_TOKEN, name: "Agent M · alice/thesis-tool", expires: "2027-06-01", stored: "2026-01-01" });
  writeSetting(store, "endpoint:nvidia", { kind: "openai-compatible", url: "https://integrate.api.nvidia.com/v1", model: "nemotron", key: NVIDIA_KEY, secret: "NVIDIA_API_KEY" });
  extra(store);
  const instance = { repository: INSTANCE, ...(instanceHost ? { host: connect(parseAddress(`https://github.com/${INSTANCE}`), { token: INSTANCE_TOKEN }) } : {}) };
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "settings", instance, product: null, store, go() {} }, {});
  type(byClass(target, "address")[0], address);
  await turn();
  const stepC = byClass(target, "step").find((step) => (byTag(step, "h3")[0]?.textContent ?? "").startsWith("Step C"));
  return { target, store, stepC };
}

// Presses Add product with `fetch` in place and waits until the Actions part of Step C has its outcome (or, for GitLab, until the layout's line has one).
async function press(stepC, fetch, settled) {
  const real = globalThis.fetch;
  globalThis.fetch = fetch;
  try {
    await click(byTag(stepC, "button").find((button) => button.textContent === "Add product"));
    await until(() => settled(stepC), "Step C's outcome");
    await new Promise((resolve) => setTimeout(resolve, 20));
  } finally { globalThis.fetch = real; }
}
const actionsPart = (stepC) => byClass(stepC, "add-product-actions")[0];
const actionsSettled = (stepC) => /Committed|not set up|Every workflow file stands already/.test(actionsPart(stepC)?.textContent ?? "");

// TST-2026110831 · level: unit · module: MOD-settings-pages
// guards: UC-001; ONE CLICK PER DECISION; THE PAGE NAMES WHERE IT SENDS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub product with no review layout, no job workflow and no Actions secret; this browser keeps the product's own token, the instance's token, and endpoint:nvidia with its key and the secret NVIDIA_API_KEY; the instance's participant hosted-ci reads HOSTED_KEY, for which this browser keeps no value; the route is given only the instance's repository, as the dashboard's #add gives it
// input: read Step C before the click; one person's click on Add product
// expect: before the click, Step C states that the click writes Agent M's job workflow into the default branch and the secrets this browser keeps a value for into the repository's Actions secrets; the click makes two commits on the product, the layout's (SPEC.md among its files) and then the job workflow's (.github/workflows/agent-m-jobs.yml among them), and stores AGENT_M_TOKEN and NVIDIA_API_KEY, each sealed, in that order, nothing else; the product is in this browser's list; the panel shows the layout's commit as a link, names the job workflow's commit and the two secrets stored, names HOSTED_KEY as kept by no value here with the link to https://github.com/alice/thesis-tool/settings/secrets/actions; neither value appears on the panel or in clear in any request's body or address; the product's token goes only to api.github.com requests of the product
test("TST-2026110831: Add product on GitHub writes the layout, then installs the job workflow and stores the known secrets in the same click", async () => {
  const world = await servers();
  const { store, stepC } = await drawn();
  const before = byClass(stepC, "muted").map((node) => node.textContent).join(" ");
  assert.match(before, /job workflow/, "failure node: Step C states before its click that the job workflow is written");
  assert.match(before, /Actions secrets/, "Step C states before its click that secrets go into the repository's Actions secrets");

  await press(stepC, world.fetch, actionsSettled);

  assert.equal(world.product.writes.length, 2, "two commits on the product: the layout's, then the job workflow's");
  assert.ok(LAYOUT.every((path) => path in world.product.writes[0].files), "the first commit is the layout's");
  assert.ok(JOB_WORKFLOW in world.product.writes[1].files, "the second commit holds the job workflow");
  assert.deepEqual(world.secrets.stored.map(({ name }) => name), ["AGENT_M_TOKEN", "NVIDIA_API_KEY"], "the secrets this browser keeps a value for are stored, in order");
  assert.deepEqual(world.instance.writes, [], "nothing is written to the instance repository");
  assert.deepEqual(readSetting(store, "products"), [WEB], "the product is in this browser's list");

  const layoutLink = byTag(stepC, "a").find((a) => a.textContent === "the commit ↗");
  assert.match(layoutLink?.href ?? "", new RegExp(`^${WEB}/commit/[0-9a-z]{40}$`), "the layout's commit is shown as a link");
  const actions = actionsPart(stepC).textContent;
  assert.match(actions, /Committed [0-9a-z]{40}/, "the job workflow's commit is named");
  assert.equal(actions.includes(layoutLink.href.split("/").pop()), false, "the job workflow's commit is another than the layout's");
  assert.match(actions, /AGENT_M_TOKEN, NVIDIA_API_KEY/, "the secrets stored are named");
  assert.match(actions, /This browser keeps no value for HOSTED_KEY/, "the secret without a value here is named");
  assert.ok(byTag(actionsPart(stepC), "a").some((a) => a.href === `${WEB}/settings/secrets/actions`), "with the repository's secrets page");
  for (const value of [PRODUCT_TOKEN, NVIDIA_KEY, INSTANCE_TOKEN]) {
    assert.equal(stepC.textContent.includes(value), false, "no value is shown");
    assert.equal(world.sent.some((request) => request.body.includes(value) || request.url.includes(value)), false, "no value travels in clear");
  }
  assert.ok(world.sent.filter((request) => request.authorization === `Bearer ${PRODUCT_TOKEN}`)
    .every((request) => request.url.startsWith(`${API}/repos/${PRODUCT}`) || request.url === `${API}/graphql`), "the product's token reaches only the product's API");
});

// TST-2026110832 · level: unit · module: MOD-settings-pages
// guards: UC-001; ONE CLICK PER DECISION
// given: the same GitHub product, and the route handed a connected instance host, as MOD-site-frame's frame hands it
// input: one person's click on Add product
// expect: the job workflow is committed after the layout, and AGENT_M_TOKEN and NVIDIA_API_KEY are stored, as with only the instance's repository given
test("TST-2026110832: with the frame's instance host, Add product sets up GitHub Actions the same way", async () => {
  const world = await servers();
  const { stepC } = await drawn({ instanceHost: true });
  await press(stepC, world.fetch, actionsSettled);
  assert.equal(world.product.writes.length, 2);
  assert.ok(JOB_WORKFLOW in world.product.writes[1].files);
  assert.deepEqual(world.secrets.stored.map(({ name }) => name), ["AGENT_M_TOKEN", "NVIDIA_API_KEY"]);
});

// TST-2026110833 · level: unit · module: MOD-settings-pages
// guards: UC-001; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the same GitHub product, whose server refuses the product's token the Actions secrets (403)
// input: one person's click on Add product
// expect: the layout's commit is made and stays, the product is in this browser's list, no job workflow is committed and no secret stored; the panel names that GitHub Actions were not set up with the server's refusal, and that the job workflow's line on Settings finishes the setup with Set up GitHub Actions
test("TST-2026110833: a failure of actionsSetup is named and undoes neither the layout's commit nor the address", async () => {
  const world = await servers({ refuseSecrets: true });
  const { store, stepC } = await drawn();
  await press(stepC, world.fetch, actionsSettled);
  assert.equal(world.product.writes.length, 1, "only the layout's commit");
  assert.ok(LAYOUT.every((path) => path in world.product.writes[0].files));
  assert.deepEqual(world.secrets.stored, []);
  assert.deepEqual(readSetting(store, "products"), [WEB], "the address stays in the list");
  const actions = actionsPart(stepC).textContent;
  assert.match(actions, /GitHub Actions were not set up/, "failure node: the failure is named");
  assert.match(actions, /Secrets/, "with the server's refusal");
  assert.match(actions, /Set up GitHub Actions/, "and where the setup is finished");
  assert.match(byClass(stepC, "result")[0].textContent, /Done — wrote the missing review layout/, "the layout's line stands");
});

// TST-2026110834 · level: unit · module: MOD-settings-pages
// guards: UC-001; ONE CLICK PER DECISION
// given: a GitHub product that already has the complete review layout (5b), no job workflow and no Actions secret
// input: one person's click on Add product
// expect: no layout commit; one commit, the job workflow's; AGENT_M_TOKEN and NVIDIA_API_KEY stored; the product in this browser's list
test("TST-2026110834: with the layout complete, Add product still sets up GitHub Actions", async () => {
  const world = await servers({ productFiles: Object.fromEntries(LAYOUT.map((path) => [path, "x\n"])) });
  const { store, stepC } = await drawn();
  await press(stepC, world.fetch, actionsSettled);
  assert.equal(world.product.writes.length, 1);
  assert.ok(JOB_WORKFLOW in world.product.writes[0].files, "the one commit is the job workflow's");
  assert.deepEqual(world.secrets.stored.map(({ name }) => name), ["AGENT_M_TOKEN", "NVIDIA_API_KEY"]);
  assert.deepEqual(readSetting(store, "products"), [WEB]);
});

// TST-2026110835 · level: unit · module: MOD-settings-pages
// guards: UC-001; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab project with no review layout, its own project token stored; a fake of GitLab's API that answers the layout's reads and commit and notes every request
// input: one person's click on Add product
// expect: one commit, the layout's, holding no file under .gitlab/ and no .gitlab-ci.yml; no request after the layout's commit; no part of Step C about GitHub Actions; the project in this browser's list
test("TST-2026110835: on GitLab, Add product writes the layout and adds the address, nothing else", async () => {
  const GL_ORIGIN = "https://gitlab.example.org", GL_PATH = "grp/sub/thesis-tool", GL_WEB = `${GL_ORIGIN}/${GL_PATH}`;
  const base = `/api/v4/projects/${encodeURIComponent(GL_PATH)}`;
  const sent = [], commits = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input)), method = String(init.method ?? "GET").toUpperCase(), path = url.pathname.slice(base.length);
    sent.push(`${method} ${url.pathname}`);
    if (!url.pathname.startsWith(base)) return json({ message: "Not Found" }, 404);
    if (method === "GET" && path === "") return json({ default_branch: "main", visibility: "private", archived: false, description: "", permissions: { project_access: { access_level: 40 } } });
    if (method === "GET" && path.startsWith("/repository/commits/")) return json({ id: "a".repeat(40) });
    if (method === "GET" && path === "/repository/branches/main") return json({ commit: { id: "a".repeat(40) } });
    if (method === "GET" && path === "/repository/tree") return json([]);
    if (method === "GET" && path.startsWith("/repository/files/")) return json({ message: "404 File Not Found" }, 404);
    if (method === "POST" && path === "/repository/commits") { commits.push(JSON.parse(init.body)); return json({ id: "d".repeat(40), web_url: `${GL_WEB}/-/commit/${"d".repeat(40)}` }); }
    return json({ message: "Not Found" }, 404);
  };
  const { store, stepC } = await drawn({ address: GL_WEB,
    extra: (kept) => writeSetting(kept, `gitlab-token:gitlab.example.org/${GL_PATH}`, { value: "glpat-FIXTURE0123456789", name: "Agent M", expires: "2027-06-01", stored: "2026-01-01" }) });
  await press(stepC, fetch, (c) => /Done — wrote the missing review layout/.test(byClass(c, "result").at(-1)?.textContent ?? ""));
  assert.equal(commits.length, 1, "one commit, the layout's");
  assert.equal(commits[0].actions.some((action) => action.file_path.startsWith(".gitlab/") || action.file_path === ".gitlab-ci.yml"), false, "no job workflow file");
  const atCommit = sent.lastIndexOf(`POST ${base}/repository/commits`);
  assert.deepEqual(sent.slice(atCommit + 1), [], "no request after the layout's commit");
  assert.equal(actionsPart(stepC), undefined, "Step C has no part about GitHub Actions");
  assert.deepEqual(readSetting(store, "products"), [GL_WEB]);
});
