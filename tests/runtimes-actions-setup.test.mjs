// MOD-runtimes' actionsSetup (docs/architecture/MOD-runtimes.md, Interfaces): what a product lacks for the CI route — the job workflow's files against jobWorkflowFiles, the CI
// secrets the workflow reads against the repository host's ciSecretNames — and setUp, which on a person's click commits the files and stores each missing secret this browser
// keeps a value for: AGENT_M_TOKEN from the setting `tokenKey`, an endpoint's key under the secret its setting names (UC-010, Precondition).
// Run: node --test tests/runtimes-actions-setup.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// Level: unit
//
// The repository servers are fakes in memory: an instance whose participants register names agents and a person (actionsSetup reads no participant: the keys it names are
// the `secret` of this browser's `endpoint:*` settings alone, and the runners are the server's own), and a product on GitHub or on GitLab whose host notes every commit and
// every secret it is asked to store. The browser's store is MOD-browser-store's over a Storage in memory, with the endpoints hosted (secret HOSTED_KEY, no key kept here),
// lab-gpu (secret GPU_KEY, no key kept here), nvidia (secret NVIDIA_API_KEY, its key kept here) and plain (no secret). The values are fixtures, never real credentials.
// Nothing reaches the network. Each test states its input and its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { actionsSetup, jobWorkflowFiles } from "../src/runtimes/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

const TOKEN = "github_pat_FIXTUREproductTOKEN0123456789";
const NVIDIA_KEY = "nvapi-FIXTURE-KEY-0123456789";
const HOSTED_VALUE = "sk-FIXTURE-HOSTED-0123456789";
const INSTANCE_COMMIT = "0123456789abcdef0123456789abcdef01234567";
const PRODUCT_HEAD = "1".repeat(40);
const TOKEN_KEY = "github-token:fixture/product";
const text = (...lines) => `${lines.join("\n")}\n`;
const PARTICIPANTS = text("# Participants of this instance", "", "**REGISTER**", "",
  "| Name | Type | Model |",
  "|---|---|---|",
  "| dev-a | agent | gpt-5 |",
  "| dev-b | agent | nemotron |",
  "| alice | person | — |");
const INSTANCE = { repository: "fixture/instance", commit: INSTANCE_COMMIT };

const address = (server) => (server === "github"
  ? { server: "github", origin: "https://github.com", path: "fixture/product", web: "https://github.com/fixture/product" }
  : { server: "gitlab", origin: "https://gitlab.example.test", path: "fixture/product", web: "https://gitlab.example.test/fixture/product" });

const instanceHost = {
  async repositoryInfo() { return { defaultBranch: "main", canWrite: false, visibility: "public" }; },
  async readSnapshot(ref) {
    return { repository: { server: "github", origin: "https://github.com", path: "fixture/instance", web: "https://github.com/fixture/instance" }, ref, commit: INSTANCE_COMMIT,
      paths: ["docs/participants.md"], blob: () => "b".repeat(40), async read(path) { return path === "docs/participants.md" ? PARTICIPANTS : null; } };
  },
};

// A product on `server` holding `files` at PRODUCT_HEAD, whose Actions secrets are `secrets` by name; `calls` notes, in order, every request that would write.
function product(server, { files = {}, secrets = [] } = {}) {
  const calls = [], held = new Map(Object.entries(files));
  const host = {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private" }; },
    async readSnapshot(ref) {
      return { repository: address(server), ref, commit: PRODUCT_HEAD, paths: [...held.keys()], blob: (path) => (held.has(path) ? "c".repeat(40) : null),
        async read(path) { return held.get(path) ?? null; } };
    },
    async ciSecretNames() {
      calls.push(["ciSecretNames"]);
      if (server !== "github") throw Object.assign(new Error("not on GitLab"), { name: "NotSupported" });
      return [...secrets];
    },
    async commitFiles(change) { calls.push(["commitFiles", change]); return { commit: "2".repeat(40), url: "https://example.test/commit" }; },
    async setCiSecret(name, value) { calls.push(["setCiSecret", name, value]); },
  };
  return { host, calls, writes: () => calls.filter(([kind]) => kind !== "ciSecretNames") };
}

function store({ token = TOKEN } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browserStore = openStore("fixture/instance");
  if (token) writeSetting(browserStore, TOKEN_KEY, { value: token, name: "Agent M · product", expires: "2027-01-01" });
  // Two endpoints that name a CI secret whose value this browser does not keep (HOSTED_KEY, GPU_KEY); one whose key this browser keeps and whose CI secret is NVIDIA_API_KEY; one that names no secret.
  writeSetting(browserStore, "endpoint:hosted", { kind: "openai-compatible", url: "https://hosted.example.test/v1", model: "gpt-5", secret: "HOSTED_KEY" });
  writeSetting(browserStore, "endpoint:lab-gpu", { kind: "openai-compatible", url: "https://gpu.example.test/v1", model: "gpt-5", secret: "GPU_KEY" });
  writeSetting(browserStore, "endpoint:nvidia", { kind: "openai-compatible", url: "https://integrate.api.nvidia.com/v1", model: "nemotron", key: NVIDIA_KEY, secret: "NVIDIA_API_KEY" });
  writeSetting(browserStore, "endpoint:plain", { kind: "openai-compatible", url: "https://plain.example.test/v1", model: "m", key: "sk-PLAIN-NOT-A-SECRET" });
  return browserStore;
}

const setupOf = (server, repo, browserStore) => actionsSetup({ product: { address: address(server).web, host: repo.host, tokenKey: TOKEN_KEY }, instance: { host: instanceHost }, store: browserStore });
const KEYS = ["HOSTED_KEY", "GPU_KEY", "NVIDIA_API_KEY"];
const expectedFiles = (server, gitlabCi = null) => jobWorkflowFiles(server, INSTANCE, { token: "AGENT_M_TOKEN", keys: KEYS }, [], gitlabCi);
// What actionsSetup returns, without its function, as a text: what a caller could show, log or keep.
const shown = (setup) => JSON.stringify({ ...setup, setUp: undefined });

// TST-2026110911 · level: unit · module: MOD-runtimes
// guards: UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub product without the job workflow whose repository holds the Actions secret GPU_KEY; this browser keeps the product's token under TOKEN_KEY, endpoint:hosted and endpoint:lab-gpu naming HOSTED_KEY and GPU_KEY without a key, endpoint:nvidia with its key and the secret NVIDIA_API_KEY, endpoint:plain naming no secret
// input: actionsSetup for the product; setUp is not called
// expect: named is AGENT_M_TOKEN and HOSTED_KEY, GPU_KEY, NVIDIA_API_KEY; missing.workflow true, outdated empty; missing.secrets AGENT_M_TOKEN, HOSTED_KEY, NVIDIA_API_KEY, the token first; unknown HOSTED_KEY alone; the host was asked ciSecretNames and nothing that writes; the token and the keys are nowhere in what it returns
test("TST-2026110911: actionsSetup names what a GitHub product lacks, writes nothing without setUp, and returns no value", async () => {
  const repo = product("github", { secrets: ["GPU_KEY"] });
  const setup = await setupOf("github", repo, store());
  assert.deepEqual(setup.named, { token: "AGENT_M_TOKEN", keys: KEYS });
  assert.equal(setup.missing.workflow, true);
  assert.deepEqual(setup.outdated, []);
  assert.deepEqual(setup.missing.secrets, ["AGENT_M_TOKEN", "HOSTED_KEY", "NVIDIA_API_KEY"]);
  assert.deepEqual(setup.unknown, ["HOSTED_KEY"]);
  assert.equal(typeof setup.setUp, "function");
  assert.deepEqual(repo.calls.map(([kind]) => kind), ["ciSecretNames"], "known positive: the listing was asked for");
  assert.deepEqual(repo.writes(), [], "nothing is written without setUp");
  for (const value of [TOKEN, NVIDIA_KEY, "sk-PLAIN-NOT-A-SECRET"]) assert.equal(shown(setup).includes(value), false, "no value in what it returns");
  assert.ok(shown({ planted: TOKEN }).includes(TOKEN), "counter-proof: the search finds a value that is there");
});

// TST-2026110912 · level: unit · module: MOD-runtimes
// guards: UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: the GitHub product of TST-2026110911, whose first workflow file stands with another text and whose other files are absent; this browser's store as there
// input: actionsSetup, then setUp
// expect: outdated names the first file; setUp makes one commit on main, on PRODUCT_HEAD, of every file jobWorkflowFiles gives, then stores AGENT_M_TOKEN with the token from TOKEN_KEY and NVIDIA_API_KEY with endpoint:nvidia's key, and nothing for HOSTED_KEY, whose value this browser does not keep; it returns that commit and the names stored, and no value
test("TST-2026110912: setUp commits the absent and outdated files in one commit, then stores AGENT_M_TOKEN from tokenKey and each endpoint key under its named secret", async () => {
  const files = expectedFiles("github");
  const repo = product("github", { secrets: ["GPU_KEY"], files: { [files[0].path]: files[0].text.replace("AGENT_M_TOKEN", "OLD_TOKEN") } });
  const setup = await setupOf("github", repo, store());
  assert.deepEqual(setup.outdated, [files[0].path]);
  assert.equal(setup.missing.workflow, files.length > 1);
  const done = await setup.setUp();
  const writes = repo.writes();
  assert.equal(writes[0][0], "commitFiles");
  assert.equal(writes[0][1].branch, "main");
  assert.equal(writes[0][1].expectedHead, PRODUCT_HEAD);
  assert.deepEqual(writes[0][1].files.map(({ path, text: body }) => [path, body]), files.map(({ path, text: body }) => [path, body]));
  assert.deepEqual(writes.slice(1), [["setCiSecret", "AGENT_M_TOKEN", TOKEN], ["setCiSecret", "NVIDIA_API_KEY", NVIDIA_KEY]]);
  assert.deepEqual(done, { commit: "2".repeat(40), stored: ["AGENT_M_TOKEN", "NVIDIA_API_KEY"] });
  for (const value of [TOKEN, NVIDIA_KEY]) assert.equal(JSON.stringify(done).includes(value), false, "setUp returns no value");
});

// TST-2026110913 · level: unit · module: MOD-runtimes
// guards: UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a GitHub product holding every file jobWorkflowFiles gives and the secrets AGENT_M_TOKEN, HOSTED_KEY, GPU_KEY, NVIDIA_API_KEY; and, as the counter-proof, the same product holding the files and no secret, with no token in this browser
// input: actionsSetup, then setUp, for each
// expect: the first lacks nothing — missing.workflow false, no outdated, no missing secret, no unknown — and setUp writes nothing and returns { commit: null, stored: [] }; the second names every secret missing and AGENT_M_TOKEN and HOSTED_KEY, GPU_KEY unknown, and its setUp commits nothing and stores NVIDIA_API_KEY alone
test("TST-2026110913: a product set up lacks nothing and setUp writes nothing; without a token in this browser AGENT_M_TOKEN is unknown and not stored", async () => {
  const files = Object.fromEntries(expectedFiles("github").map(({ path, text: body }) => [path, body]));
  const complete = product("github", { files, secrets: ["AGENT_M_TOKEN", ...KEYS] });
  const setup = await setupOf("github", complete, store());
  assert.deepEqual({ missing: setup.missing, outdated: setup.outdated, unknown: setup.unknown }, { missing: { workflow: false, secrets: [] }, outdated: [], unknown: [] });
  assert.deepEqual(await setup.setUp(), { commit: null, stored: [] });
  assert.deepEqual(complete.writes(), []);

  const tokenless = product("github", { files });
  const lacking = await setupOf("github", tokenless, store({ token: null }));
  assert.deepEqual(lacking.missing.secrets, ["AGENT_M_TOKEN", ...KEYS]);
  assert.deepEqual(lacking.unknown, ["AGENT_M_TOKEN", "HOSTED_KEY", "GPU_KEY"]);
  assert.deepEqual(await lacking.setUp(), { commit: null, stored: ["NVIDIA_API_KEY"] });
  assert.deepEqual(tokenless.writes(), [["setCiSecret", "NVIDIA_API_KEY", NVIDIA_KEY]]);
});

// TST-2026110914 · level: unit · module: MOD-runtimes
// guards: UC-010; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab product whose own .gitlab-ci.yml has a job, and no job workflow
// input: actionsSetup, then setUp
// expect: it asks no secret listing; missing.secrets and unknown are empty; named is as on GitHub; missing.workflow true; setUp commits exactly the files jobWorkflowFiles gives for GitLab with that .gitlab-ci.yml, and stores no secret
test("TST-2026110914: on GitLab actionsSetup lists no secret, and setUp commits the job workflow with the product's own .gitlab-ci.yml", async () => {
  const own = "build:\n  script:\n    - make\n";
  const repo = product("gitlab", { files: { ".gitlab-ci.yml": own } });
  const setup = await setupOf("gitlab", repo, store());
  assert.deepEqual(repo.calls, [], "no secret listing is asked for");
  assert.deepEqual(setup.named, { token: "AGENT_M_TOKEN", keys: KEYS });
  assert.deepEqual(setup.missing, { workflow: true, secrets: [] });
  assert.deepEqual(setup.unknown, []);
  const done = await setup.setUp();
  assert.deepEqual(repo.writes().map(([kind]) => kind), ["commitFiles"]);
  assert.deepEqual(repo.writes()[0][1].files.map(({ path, text: body }) => [path, body]), expectedFiles("gitlab", own).map(({ path, text: body }) => [path, body]));
  assert.deepEqual(done.stored, []);
});

// TST-2026111201 · level: unit · module: MOD-runtimes
// guards: UC-010; UC-049
// given: an older instance commit OLD_COMMIT; four products — on GitHub one without the job workflow, one holding every file jobWorkflowFiles gives for INSTANCE_COMMIT, one holding every
//   file jobWorkflowFiles gives for OLD_COMMIT, and on GitLab one holding every file jobWorkflowFiles gives for OLD_COMMIT and its .gitlab-ci.yml; this browser's store as in TST-2026110911
// input: actionsSetup for each; setUp is not called
// expect: pins.instance is INSTANCE_COMMIT for each; pins.product is null for the product without the job workflow, INSTANCE_COMMIT for the current one, and OLD_COMMIT for both older ones;
//   the older ones name every file of their job workflow as outdated, the current one none; nothing is written
test("TST-2026111201: actionsSetup gives the instance commit its files pin and the one the product's job workflow file pins, null where that file is absent", async () => {
  const OLD_COMMIT = "fedcba9876543210fedcba9876543210fedcba98";
  // The paths of `older` whose text is not the one `current` gives for the same path.
  const differing = (older, current) => older.filter((file) => current.find((each) => each.path === file.path)?.text !== file.text).map((file) => file.path);
  const asFiles = (list) => Object.fromEntries(list.map(({ path, text: body }) => [path, body]));
  const olderOf = (server, gitlabCi = null) => jobWorkflowFiles(server, { ...INSTANCE, commit: OLD_COMMIT }, { token: "AGENT_M_TOKEN", keys: KEYS }, [], gitlabCi);
  const cases = [
    { name: "absent", server: "github", files: {}, product: null, outdated: [] },
    { name: "current", server: "github", files: asFiles(expectedFiles("github")), product: INSTANCE_COMMIT, outdated: [] },
    { name: "older on GitHub", server: "github", files: asFiles(olderOf("github")), product: OLD_COMMIT, outdated: differing(olderOf("github"), expectedFiles("github")) },
    { name: "older on GitLab", server: "gitlab", files: asFiles(olderOf("gitlab")), product: OLD_COMMIT,
      outdated: differing(olderOf("gitlab"), expectedFiles("gitlab", asFiles(olderOf("gitlab"))[".gitlab-ci.yml"])) },
  ];
  assert.ok(differing(olderOf("github"), expectedFiles("github")).includes(".github/workflows/agent-m-jobs.yml"), "known positive: the older job workflow file stands with another text");
  for (const each of cases) {
    const repo = product(each.server, { files: each.files, secrets: ["AGENT_M_TOKEN", ...KEYS] });
    const setup = await setupOf(each.server, repo, store());
    assert.deepEqual(setup.pins, { instance: INSTANCE_COMMIT, product: each.product }, each.name);
    assert.deepEqual(setup.outdated, each.outdated, each.name);
    assert.deepEqual(repo.writes(), [], `${each.name}: nothing is written without setUp`);
  }
});
