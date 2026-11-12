// Release test of UC-011 "Hand a job to a local CLI session", steps 3 and 4 (docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md):
//   step 3: "The Bridge checks the token, brings the clones in the agent's working folder to the job's commits …, leaves the token of the job's repository in a
//           file of the checkout that git ignores, and starts the agent there with the participant's model and the task; the input names that file and says to
//           use the token without reading it."
//   step 4: "a code change the CLI session commits on a branch goes to that branch instead, which the CLI session pushes to the product and opens a pull
//           request for — a merge request on GitLab — with that token, follows its CI and merges as the product's process lets it."
// and SPEC §7 A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE, A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE, A TOKEN GOES ONLY TO THE SERVER
// THAT ISSUED IT. A black box over the Bridge's public startWatching: a queued job goes in, and what the session was given, what reached the product's
// repository and its server, and the job's record come out.
// Run: node --test tests/release-uc-011-hand-a-job-to-a-local-cli-session.test.mjs
//
// Module: MOD-bridge-jobs
// Module: MOD-runtimes
// Guards: UC-011; A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE; A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: release
//
// Written by a participant that implemented none of a CLI session's work in its own checkout (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
// Deterministic, no network beyond loopback, no real agent: the instance group/agent-m and the product group/widget are bare repositories behind a fixture
// smart-HTTP server on 127.0.0.1 over HTTPS — a GitLab project by its address —, with a certificate openssl makes for the test, which git trusts through
// GIT_SSL_CAINFO; the server answers git only with the header of the repository's own token, and keeps every request's header. The server's API is a fixture
// `fetch` in the Bridge's process. The CLI session is a fixture executable named opencode, its own git given no include of the Bridge's tokens, as an enclosure
// gives it; its merge request is opened by a fixture executable named glab, which records whether it was given the product's token. Readings the texts leave
// open, which the case states:
//   - "with that token" for the merge request is read as: the session's glab is given the token from the file, as the input tells it, and the Bridge's process
//     opens no merge request of its own where the session has opened one.
//   - "without reading it" is an instruction to the session; what the Bridge can be held to is that the input says so and holds no token.

import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { keepRepositoryTokens, startWatching, stopWatching, useRepositoryTokens } from "../src/bridge-jobs/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { routeStrategies } from "../src/runtimes/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });
const REAL_GIT = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
const BACKEND = join(execFileSync(REAL_GIT, ["--exec-path"], { encoding: "utf8" }).trim(), "git-http-backend");
const ID = "JOB-20261112-1100-c011";
const basic = (user, token) => `Basic ${Buffer.from(`${user}:${token}`).toString("base64")}`;

registerStrategies("tests/release-uc-011-hand-a-job-to-a-local-cli-session.test.mjs", {
  recipes: { "fix-inputs": async () => [{ name: "the issue", text: "The export is cut off after the second page.", sources: [], required: true, artifacts: [] }],
    "chapters-for-implementation": async () => [], "resource-pins": async () => [] },
});
registerStrategies("tests/release-uc-011-hand-a-job-to-a-local-cli-session.test.mjs (MOD-runtimes)", routeStrategies);

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}

// A bare repository at <root>/repositories/<group>/<project>, seeded with one commit on main; `push` adds a commit to its main.
function bareRepository(root, group, project, files) {
  const origin = join(root, "repositories", group, project), seed = join(root, `seed-${group}-${project}`);
  mkdirSync(origin, { recursive: true });
  git(origin, "init", "-q", "--bare", "-b", "main");
  git(origin, "config", "http.receivepack", "true");
  git(root, "clone", "-q", origin, seed);
  const push = (more, message) => {
    for (const [path, text] of Object.entries(more)) { mkdirSync(join(seed, path, ".."), { recursive: true }); writeFileSync(join(seed, path), text); }
    git(seed, "add", "-A");
    git(seed, "commit", "-q", "-m", message);
    git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
    return git(seed, "rev-parse", "HEAD");
  };
  push(files, "first");
  return { origin, seed, push };
}

// The fixture server: smart HTTP over TLS for every repository below <root>/repositories, answering a request only with the header `expected` gives for its
// repository (`<group>/<project>`), 401 otherwise; `seen` holds every request's repository, service and Authorization header.
async function smartHttpServer(root, expected, t) {
  const tls = join(root, "tls");
  mkdirSync(tls);
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(tls, "key.pem"), "-out", join(tls, "cert.pem"), "-days", "2",
    "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1"], { stdio: "ignore" });
  const seen = [];
  const server = createServer({ key: readFileSync(join(tls, "key.pem")), cert: readFileSync(join(tls, "cert.pem")) }, (request, response) => {
    const url = new URL(request.url, "https://127.0.0.1");
    const repository = url.pathname.split("/").slice(1, 3).join("/").replace(/\.git$/, "");
    seen.push({ repository, path: url.pathname, service: url.searchParams.get("service"), authorization: request.headers.authorization ?? null });
    if (request.headers.authorization !== expected[repository]) { response.writeHead(401, { "www-authenticate": 'Basic realm="fixture"' }); response.end(); return; }
    const child = spawn(BACKEND, [], { env: { GIT_PROJECT_ROOT: join(root, "repositories"), GIT_HTTP_EXPORT_ALL: "1", PATH_INFO: url.pathname.replace(/\.git(\/|$)/, "$1"),
      QUERY_STRING: url.search.slice(1), REQUEST_METHOD: request.method, CONTENT_TYPE: request.headers["content-type"] ?? "", REMOTE_USER: "fixture", REMOTE_ADDR: "127.0.0.1",
      GIT_PROTOCOL: request.headers["git-protocol"] ?? "", HTTP_CONTENT_ENCODING: request.headers["content-encoding"] ?? "" } });
    request.pipe(child.stdin);
    let head = Buffer.alloc(0), started = false;
    child.stdout.on("data", (chunk) => {
      if (started) { response.write(chunk); return; }
      head = Buffer.concat([head, chunk]);
      const end = head.indexOf("\r\n\r\n");
      if (end < 0) return;
      const headers = {}; let status = 200;
      for (const line of head.subarray(0, end).toString().split("\r\n")) {
        const [name, ...value] = line.split(":");
        if (name.toLowerCase() === "status") status = Number.parseInt(value.join(":"), 10); else headers[name] = value.join(":").trim();
      }
      response.writeHead(status, headers);
      response.write(head.subarray(end + 4));
      started = true;
    });
    child.on("close", () => response.end());
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  process.env.GIT_SSL_CAINFO = join(tls, "cert.pem");
  t.after(() => { delete process.env.GIT_SSL_CAINFO; });
  return { address: (path) => `https://127.0.0.1:${server.address().port}/${path}`, seen };
}

const PARTICIPANTS = "# Participants of this instance\n\n**REGISTER**\n\nThe participants of the test instance.\n\n| Name | Type | Model |\n|---|---|---|\n| fixer | agent | example-model |\n";

// TST-1112101 · level: release · module: MOD-bridge-jobs · MOD-runtimes
// guards: UC-011; A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE; A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: behind the fixture server the instance group/agent-m, answering only Basic oauth2:glpat-INSTANCE…, and the product group/widget, answering only Basic oauth2:glpat-WIDGET…, holding a queued fix-bug job of the participant fixer on the route `bridge lab-pc agent opencode`; the Bridge lab-pc keeping both tokens and offering opencode with a working folder; the fixture session, which records its input and its checkout's `git status`, commits on the branch named by the job, pushes it with its own git, opens its merge request with glab given "$(cat <token file>)", and answers its branch and commit; the server's API, which lists the merge request once glab has opened it
// input: startWatching of lab-pc serving widget; the test waits until the job's record has its end
// expect: step 3 — the session's input names <checkout>/.agent-m-token and says to use the token without reading the file, and the file was in the checkout while it worked, listed by `git status` among the ignored files only; step 4 — the session's branch is on widget at its commit, pushed with widget's token, and its merge request was opened by the session's glab with widget's token; the record ends done with the session's commit and the merge request's address; known positive — the Bridge's process listed widget's merge requests through the API;
//   counter-proof — no token stands in the input; no commit of widget holds the token file; widget was never sent the instance's token; the Bridge's process opened no merge request (no POST …/merge_requests); no outbox and no relay folder (`<job>.out.git`, `<job>.requests`, `<job>.answers`) was made beside the checkout; the checkout is removed after the job
test("TST-1112101: UC-011 steps 3 and 4 — the session finds its token in an ignored file named in its input, and pushes and opens its merge request itself", async (t) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-release-uc-011-")));
  const priorPath = process.env.PATH, priorHome = process.env.HOME;
  t.after(async () => {
    await stopWatching("quit");
    Object.assign(process.env, { PATH: priorPath, HOME: priorHome });
    for (const key of Object.keys(process.env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)) delete process.env[key];
    rmSync(root, { recursive: true, force: true });
  });
  const widgetToken = "glpat-WIDGET0123456789", instanceToken = "glpat-INSTANCE0123456789";
  const expected = { "group/widget": basic("oauth2", widgetToken), "group/agent-m": basic("oauth2", instanceToken) };
  const fixture = await smartHttpServer(root, expected, t);
  const instance = { ...bareRepository(root, "group", "agent-m", { "docs/participants.md": PARTICIPANTS, "AGENTS.md": "# The rules of the instance\n" }), address: fixture.address("group/agent-m") };
  const widget = { ...bareRepository(root, "group", "widget", { "README.md": "widget\n", "src/export.mjs": "export const pages = 2;\n" }), address: fixture.address("group/widget") };
  const agentM = git(instance.seed, "rev-parse", "HEAD");
  const { path, text } = startRecord({ id: ID, kind: "fix-bug", worksOn: ["THE EXPORT IS A PDF"], participant: "fixer", model: "example-model", route: "bridge lab-pc agent opencode",
    run: null, retries: null, declares: { context: 200000, capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests"] },
    startedBy: "alice", start: new Date("2026-11-12T11:00:00Z"), agentM: { version: "2026.11.0", commit: agentM }, inputs: [], limit: 1,
    destinations: [{ participant: "fixer", place: "this machine", parts: ["the issue"] }], params: { issue: 5 } });
  widget.push({ [path]: text }, `queue ${ID}`);
  const data = join(root, "data");
  await keepRepositoryTokens(data, [{ repository: widget.address, token: widgetToken }, { repository: instance.address, token: instanceToken }]);
  useRepositoryTokens(data);

  // The Bridge's computer: a PATH of the fixture session, its glab and a git wrapper, so that no real agent is found.
  const bin = join(root, "bin"), kept = join(root, "kept");
  mkdirSync(bin);
  mkdirSync(kept);
  const mergeRequest = `${widget.address}/-/merge_requests/3`;
  writeFileSync(join(bin, "git"), `#!/bin/sh\nexec '${REAL_GIT}' "$@"\n`, { mode: 0o755 });
  writeFileSync(join(bin, "glab"), `#!/bin/sh
if [ "$GITLAB_TOKEN" = '${widgetToken}' ]; then echo given > '${kept}/glab-token'; else echo other > '${kept}/glab-token'; fi
printf '%s\\n' "$*" > '${kept}/glab-args'
: > '${kept}/opened'
echo '${mergeRequest}'
`, { mode: 0o755 });
  const event = (said) => JSON.stringify({ type: "text", part: { text: said } });
  const [before, after] = event(JSON.stringify({ draft: { branch: ID, commits: ["@COMMIT@"] }, answers: [] })).split("@COMMIT@");
  writeFileSync(join(bin, "opencode"), `#!/bin/sh
case "$1" in --version) echo 1.4.0;; auth) echo '1 credentials';; models) echo opencode/big-pickle;;
run) cat > '${kept}/input'
  job="\${PWD##*/}"
  ls -a "$PWD" "$PWD/.." > '${kept}/listed'
  git status --porcelain > '${kept}/status'
  git status --porcelain --ignored > '${kept}/ignored'
  git checkout -q -b "$job" && printf 'pages = all\\n' > fix.md && git add -A && git commit -q -m 'the fix' && git push -q origin "$job" || exit 4
  GITLAB_TOKEN="$(cat .agent-m-token)" glab mr create --source-branch "$job" --target-branch main --title 'the fix' > /dev/null || exit 5
  commit="$(git rev-parse HEAD)"
  printf '%s%s%s\\n' '${before}' "$commit" '${after}'
  printf '%s\\n' '{"type":"step_finish","part":{"tokens":{"input":5,"output":3}}}';;
esac
`, { mode: 0o755 });
  Object.assign(process.env, { PATH: `${bin}:/usr/bin:/bin`, HOME: root, GIT_AUTHOR_NAME: "Agent", GIT_COMMITTER_NAME: "Agent" });

  // The server's API, in the Bridge's process: the merge requests of the job's branch — the session's once its glab has opened it —; every request kept.
  const api = [];
  const realFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = realFetch; });
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "x-total-pages": "1" } });
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input instanceof Request ? input.url : input));
    const method = String(init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    api.push({ method, url: url.href, token: new Headers(init.headers).get("private-token") });
    if (method === "GET" && url.pathname.endsWith("/merge_requests")) {
      return json(existsSync(join(kept, "opened")) ? [{ iid: 3, title: "the fix", source_branch: ID, target_branch: "main", sha: git(widget.origin, "rev-parse", ID), state: "opened",
        web_url: mergeRequest, created_at: "2026-11-12T11:01:00Z", description: "" }] : []);
    }
    // A merge request the Bridge's process would open itself is made, so that the counter-proof below, not the job's failure, names it.
    if (method === "POST" && url.pathname.endsWith("/merge_requests")) {
      return json({ iid: 4, title: "by the Bridge", source_branch: ID, target_branch: "main", sha: git(widget.origin, "rev-parse", ID), state: "opened",
        web_url: `${widget.address}/-/merge_requests/4`, created_at: "2026-11-12T11:02:00Z", description: "" }, 201);
    }
    if (method === "GET" && /\/api\/v4\/projects\/[^/]+$/.test(url.pathname)) return json({ default_branch: "main", visibility: "private", permissions: { project_access: { access_level: 40 } } });
    return json({ message: "404 Not Found" }, 404);
  };

  // The enclosure of the fixture, with the environment an enclosure chooses: no include of the Bridge's tokens.
  const enclosures = (at) => ({ ...openEnclosures()(at), wrap: (command, args) => ({ command, args, input: null,
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key))) }) });
  const folder = join(root, "agent-work");
  mkdirSync(folder);
  const record = () => spawnSync(REAL_GIT, ["--git-dir", widget.origin, "show", `main:${path}`], { encoding: "utf8" }).stdout;
  startWatching({ bridgeName: "lab-pc", agents: [{ name: "opencode", folder }], products: [{ address: widget.address }], every: 100, instance: instance.address, enclosures });
  for (const end = Date.now() + 60000; !/^## End$/m.test(record());) {
    if (Date.now() > end) assert.fail(`waited for the job's end: ${record()}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  // Step 3: "leaves the token of the job's repository in a file of the checkout that git ignores … the input names that file and says to use the token without reading it."
  const working = join(folder, "jobs", ID), file = join(working, ".agent-m-token");
  assert.ok(existsSync(join(kept, "input")), `known positive: the session was started: ${record()}`);
  const input = readFileSync(join(kept, "input"), "utf8");
  assert.ok(input.includes(file), `the input names the token file ${file}`);
  assert.match(input.replace(/\s+/g, " "), /Use the token without reading the file/, "the input says to use the token without reading the file");
  const listed = readFileSync(join(kept, "listed"), "utf8");
  assert.match(listed, /^\.agent-m-token$/m, "the token file was in the checkout while the session worked");
  assert.equal(readFileSync(join(kept, "status"), "utf8"), "", "git status lists no file of the checkout");
  assert.match(readFileSync(join(kept, "ignored"), "utf8"), /^!! \.agent-m-token$/m, "and lists the token file among the ignored");

  // Step 4: "which the CLI session pushes to the product and opens a pull request for — a merge request on GitLab — with that token".
  const commit = git(widget.origin, "rev-parse", ID);
  assert.equal(git(widget.origin, "show", `${ID}:fix.md`), "pages = all", "the session's branch is on the product");
  const pushes = fixture.seen.filter((each) => each.repository === "group/widget" && (each.service === "git-receive-pack" || each.path.endsWith("/git-receive-pack")));
  assert.ok(pushes.length >= 1, "known positive: the server saw the push");
  assert.deepEqual([...new Set(pushes.map((each) => each.authorization).filter(Boolean))], [expected["group/widget"]], "the push carried the product's token");
  assert.equal(readFileSync(join(kept, "glab-token"), "utf8").trim(), "given", "the session's glab was given the product's token");
  assert.match(readFileSync(join(kept, "glab-args"), "utf8"), new RegExp(`mr create --source-branch ${ID} --target-branch main`), "the session opened the merge request of its branch");
  const ended = record();
  assert.match(ended, /^state: done$/m, ended);
  assert.ok(ended.includes(commit), "the record names the session's commit");
  assert.ok(ended.includes(mergeRequest), "the record names the session's merge request");
  assert.ok(api.some((each) => each.method === "GET" && each.url.includes("/merge_requests")), "known positive: the Bridge's process asked the API for the branch's merge requests");

  // Counter-proof.
  assert.equal(input.includes(widgetToken) || input.includes(instanceToken), false, "no token stands in the input");
  assert.deepEqual(git(widget.origin, "ls-tree", "-r", "--name-only", ID).split("\n").filter((each) => each.endsWith(".agent-m-token")), [], "no commit holds the token file");
  assert.equal(fixture.seen.some((each) => each.repository === "group/widget" && each.authorization === expected["group/agent-m"]), false, "the product was never sent the instance's token");
  assert.deepEqual(api.filter((each) => each.method === "POST"), [], "the Bridge's process opened no merge request of its own");
  for (const absent of [`${ID}.out.git`, `${ID}.requests`, `${ID}.answers`]) assert.equal(listed.includes(absent), false, `no ${absent}: no outbox and no relay`);
  assert.equal(existsSync(working), false, "the checkout and its token file are removed after the job");
});
