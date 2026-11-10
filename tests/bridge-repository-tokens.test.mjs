// MOD-bridge-jobs — the repository tokens the paired browser hands the Bridge, as docs/architecture/MOD-bridge-jobs.md (Data: The repository tokens;
// Interfaces: keepRepositoryTokens, useRepositoryTokens; the host of a repository through its clone) states them: "in git's configuration format, for each
// repository the browser handed a token for, a section for its address and one for its address with `.git`, each holding the header that authorises git's
// requests there"; "The header is Basic with the user `x-access-token` on GitHub and `oauth2` on a GitLab server"; "The Bridge's process includes the file in
// the configuration of every git it starts — its environment names the file by its path —, so that no token stands on a command line, in a remote address, in
// a clone's configuration or in an environment"; and the host of a repository is "MOD-repository-hosts' `connect` with the clone and the token the file holds
// for the repository's address: ... its pull or merge requests ... through the server's API with that token; without a token those are `NotSupported`".
// The check SPEC.md's A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT names (configuration-and-secrets/03).
// Run: node --test tests/bridge-repository-tokens.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO MODEL READS A CREDENTIAL; CONFIGURATION LIVES IN THE BROWSER; A CREDENTIAL IS NEVER PLACED IN A URL; UC-044; UC-011
// Level: component
//
// Deterministic, no network beyond loopback: the repositories are bare repositories behind a fixture smart-HTTP server on 127.0.0.1 over HTTPS, with a
// certificate made for the test by openssl, which git trusts through GIT_SSL_CAINFO; the server answers git only with the header of the repository's own token
// and records every header it was sent. A repository at https://127.0.0.1:<port>/<group>/<project> is a GitLab project by MOD-repository-hosts' parseAddress, so
// that its header carries the user oauth2. The API is a fixture `fetch`. git is reached through a wrapper on PATH that records every command line and every
// environment it is started with. Where the module file leaves a reading open, the test states the one it takes:
//   - "nothing is written" for a refused list: the file holds the bytes it held before.
//   - The agent's side is checked where the enclosure makes it: agentEnvironment, the environment an agent receives, and hiddenPaths, the places it hides.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { keepRepositoryTokens, useRepositoryTokens } from "../src/bridge-jobs/index.mjs";
import { cloneOrFetch, defaultHead, hostOf, makeOutbox, publish, workingClone } from "../src/bridge-jobs/workfolders.mjs";
import { agentEnvironment, hiddenPaths } from "../src/agent-enclosure/holders.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });

const REAL_GIT = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
const BACKEND = join(execFileSync(REAL_GIT, ["--exec-path"], { encoding: "utf8" }).trim(), "git-http-backend");
const basic = (user, token) => `Basic ${Buffer.from(`${user}:${token}`).toString("base64")}`;
function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function world(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-tokens-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

// The environment entries useRepositoryTokens adds, taken away again after a test, so that one test's include reaches no other.
function restoredEnvironment(t) {
  const before = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("GIT_CONFIG_") && key !== "GIT_CONFIG_GLOBAL" && key !== "GIT_CONFIG_SYSTEM"));
  t.after(() => {
    for (const key of Object.keys(process.env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)) delete process.env[key];
    Object.assign(process.env, before);
  });
}

// A wrapper named git on PATH, before the real one: it records each command line and each environment, then runs git.
function recordingGit(root, t) {
  const bin = join(root, "bin"), log = join(root, "git-calls.log");
  mkdirSync(bin);
  writeFileSync(log, "");
  writeFileSync(join(bin, "git"), `#!/bin/sh\nprintf 'ARGS %s\\n' "$*" >> '${log}'\nenv | sed 's/^/ENV /' >> '${log}'\nexec '${REAL_GIT}' "$@"\n`, { mode: 0o755 });
  chmodSync(join(bin, "git"), 0o755);
  const prior = process.env.PATH;
  process.env.PATH = `${bin}:${prior}`;
  t.after(() => { process.env.PATH = prior; });
  return () => readFileSync(log, "utf8");
}

// A bare repository at <root>/repositories/<group>/<project>, seeded with one commit on main, served by the fixture server.
function bareRepository(root, group, project, files = { "README.md": `${project}\n` }) {
  const origin = join(root, "repositories", group, project), seed = join(root, `seed-${group}-${project}`);
  mkdirSync(origin, { recursive: true });
  git(origin, "init", "-q", "--bare", "-b", "main");
  git(origin, "config", "http.receivepack", "true");
  git(root, "clone", "-q", origin, seed);
  for (const [path, text] of Object.entries(files)) { mkdirSync(join(seed, path, ".."), { recursive: true }); writeFileSync(join(seed, path), text); }
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  return { origin, seed };
}

// The fixture server: smart HTTP over TLS for every repository below <root>/repositories, answering a request only with the header `expected` gives for its
// repository (`<group>/<project>`), 401 otherwise; `seen` holds every request's repository and Authorization header.
async function smartHttpServer(root, expected, t) {
  const tls = join(root, "tls");
  mkdirSync(tls);
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(tls, "key.pem"), "-out", join(tls, "cert.pem"), "-days", "2",
    "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1"], { stdio: "ignore" });
  const seen = [];
  const server = createServer({ key: readFileSync(join(tls, "key.pem")), cert: readFileSync(join(tls, "cert.pem")) }, (request, response) => {
    const url = new URL(request.url, "https://127.0.0.1");
    const repository = url.pathname.split("/").slice(1, 3).join("/").replace(/\.git$/, "");
    seen.push({ repository, authorization: request.headers.authorization ?? null });
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

// TST-20261110101 · level: unit · module: MOD-bridge-jobs
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; CONFIGURATION LIVES IN THE BROWSER; UC-044
// given: an empty data folder of a Bridge
// input: keepRepositoryTokens(data, [the instance https://github.com/acme/agent-m with github_pat_A, the project https://gitlab.example.org/group/sub/project with glpat-B]);
//   then keepRepositoryTokens(data, [the project alone]); then a list naming a GitLab token for a GitHub repository, a list naming one repository twice, and one
//   naming no repository's address
// expect: 2, then 1; the file repository-tokens.gitconfig is readable by its user only and holds, first, for each repository a section for its address and one for
//   it with .git, each with `Authorization: Basic` of x-access-token:github_pat_A for GitHub and oauth2:glpat-B for GitLab, then only the project's two sections —
//   the instance's token forgotten; counter-proof: each refused list rejects with the code invalid-request, its message naming the repository and never the token,
//   and the file holds the bytes it held before
test("TST-20261110101: keepRepositoryTokens keeps each repository's header for git in the data folder, and the browser's set replaces what was kept", async (t) => {
  const data = join(world(t), "data");
  const file = join(data, "repository-tokens.gitconfig");
  const instance = "https://github.com/acme/agent-m", project = "https://gitlab.example.org/group/sub/project";
  assert.equal(await keepRepositoryTokens(data, [{ repository: instance, token: "github_pat_A" }, { repository: project, token: "glpat-B" }]), 2);
  assert.equal(statSync(file).mode & 0o777, 0o600, "the file is its user's alone");
  const sections = (text) => [...text.matchAll(/\[http "([^"]+)"\]\n\textraHeader = (.+)\n/g)].map(([, at, header]) => [at, header]);
  assert.deepEqual(sections(readFileSync(file, "utf8")), [
    [instance, `Authorization: ${basic("x-access-token", "github_pat_A")}`], [`${instance}.git`, `Authorization: ${basic("x-access-token", "github_pat_A")}`],
    [project, `Authorization: ${basic("oauth2", "glpat-B")}`], [`${project}.git`, `Authorization: ${basic("oauth2", "glpat-B")}`]]);

  assert.equal(await keepRepositoryTokens(data, [{ repository: project, token: "glpat-B" }]), 1);
  const kept = readFileSync(file, "utf8");
  assert.deepEqual(sections(kept).map(([at]) => at), [project, `${project}.git`], "a token the browser no longer holds is forgotten");

  for (const [list, named] of [[[{ repository: instance, token: "glpat-C" }], instance],
    [[{ repository: project, token: "glpat-B" }, { repository: `${project}/`, token: "glpat-D" }], project],
    [[{ repository: "not an address", token: "github_pat_E" }], "not an address"]]) {
    await assert.rejects(keepRepositoryTokens(data, list), (error) => error.code === "invalid-request" && error.message.includes(named)
      && !/glpat-C|glpat-D|github_pat_E/.test(error.message), `refused: ${JSON.stringify(list.map((entry) => entry.repository))}`);
    assert.equal(readFileSync(file, "utf8"), kept, "counter-proof: nothing is written");
  }
});

// TST-20261110102 · level: component · module: MOD-bridge-jobs
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO MODEL READS A CREDENTIAL; A CREDENTIAL IS NEVER PLACED IN A URL; UC-011
// given: two projects behind the fixture server, group/widget and group/other, each answering only its own token's header; the Bridge's data folder keeping
//   glpat-WIDGET for widget and glpat-OTHER for other, included by useRepositoryTokens; git reached through the recording wrapper
// input: cloneOrFetch of each into a clone of the Bridge; for widget a job's workingClone, its outbox, a commit the agent pushes into the outbox with a git that is
//   given no include, publish of the outbox's branch, and a commit through hostOf(widget)'s commitFiles; then, with the include taken away, a fresh clone of widget
// expect: every request for widget carried Basic oauth2:glpat-WIDGET and every request for other Basic oauth2:glpat-OTHER, none the other's; the agent's branch and
//   the host's commit are on widget's main and branch; no clone's or outbox's .git/config, remote address, command line or environment of a git holds a token or
//   its header's encoding; counter-proof: without the include the clone is refused by the server and git names it
test("TST-20261110102: the Bridge's git clones, fetches and pushes with each repository's own token, which stays out of every clone, command line and environment", async (t) => {
  restoredEnvironment(t);
  const root = world(t);
  const widgetToken = "glpat-WIDGET0123456789", otherToken = "glpat-OTHER0123456789";
  const expected = { "group/widget": basic("oauth2", widgetToken), "group/other": basic("oauth2", otherToken) };
  const fixture = await smartHttpServer(root, expected, t);
  const widget = { ...bareRepository(root, "group", "widget"), address: fixture.address("group/widget") };
  const other = { ...bareRepository(root, "group", "other"), address: fixture.address("group/other") };
  const data = join(root, "data");
  await keepRepositoryTokens(data, [{ repository: widget.address, token: widgetToken }, { repository: other.address, token: otherToken }]);
  useRepositoryTokens(data);
  const calls = recordingGit(root, t);

  const clone = await cloneOrFetch(widget.address, join(root, "work", "products", "widget"));
  await cloneOrFetch(other.address, join(root, "work", "products", "other"));
  const working = await workingClone(widget.address, join(root, "work", "jobs", "JOB-1"));
  const outbox = await makeOutbox(working);
  writeFileSync(join(working, "change.md"), "the agent's change\n");
  // The agent's own git: an environment of its own, as its enclosure gives it, which names no include.
  const agentEnv = { PATH: process.env.PATH, HOME: root, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0",
    GIT_AUTHOR_NAME: "Agent", GIT_AUTHOR_EMAIL: "agent@example.org", GIT_COMMITTER_NAME: "Agent", GIT_COMMITTER_EMAIL: "agent@example.org" };
  for (const args of [["checkout", "-q", "-b", "agent-branch"], ["add", "-A"], ["commit", "-q", "-m", "agent"], ["push", "-q", "origin", "agent-branch"]]) {
    const r = spawnSync(REAL_GIT, args, { cwd: working, env: agentEnv, encoding: "utf8" });
    assert.equal(r.status, 0, `the agent's git ${args[0]}: ${r.stderr}`);
  }
  const pushed = await publish({ outbox, clone, job: "JOB-1" });
  assert.deepEqual(pushed.map(({ branch }) => branch), ["agent-branch"]);
  assert.equal(git(root, "--git-dir", widget.origin, "rev-parse", "agent-branch"), pushed[0].commit, "the agent's branch reached the project");
  const host = await hostOf(widget.address, clone);
  const { commit: head } = await defaultHead(clone);
  const made = await host.commitFiles({ branch: "main", expectedHead: head, files: [{ path: "docs/end.md", text: "end\n" }], message: "end JOB-1" });
  assert.equal(git(root, "--git-dir", widget.origin, "rev-parse", "main"), made.commit, "the host's commit reached the project's main");

  const byRepository = (name) => fixture.seen.filter((each) => each.repository === name).map((each) => each.authorization);
  assert.ok(byRepository("group/widget").length >= 4, "known positive: widget was asked for clone, fetch and pushes");
  assert.ok(byRepository("group/other").length >= 1, "known positive: other was asked");
  assert.deepEqual([...new Set(byRepository("group/widget"))], [expected["group/widget"]], "widget saw its own token only");
  assert.deepEqual([...new Set(byRepository("group/other"))], [expected["group/other"]], "other saw its own token only");

  const secrets = [widgetToken, otherToken, expected["group/widget"].slice(6), expected["group/other"].slice(6)];
  for (const folder of [clone, join(root, "work", "products", "other"), working]) {
    const config = readFileSync(join(folder, ".git", "config"), "utf8");
    assert.ok(!secrets.some((secret) => config.includes(secret)), `${folder}'s .git/config holds no token`);
    assert.doesNotMatch(git(folder, "remote", "get-url", "origin"), /@/, "the remote address carries no credential");
  }
  assert.ok(!secrets.some((secret) => readFileSync(join(outbox.path, "config"), "utf8").includes(secret)), "the outbox's configuration holds no token");
  const recorded = calls();
  assert.match(recorded, /^ARGS .*clone/m, "known positive: the wrapper recorded the Bridge's git");
  assert.ok(!secrets.some((secret) => recorded.includes(secret)), "no command line and no environment of the Bridge's git holds a token or its header");
  assert.match(recorded, /^ENV GIT_CONFIG_VALUE_\d+=.*repository-tokens\.gitconfig$/m, "the environment names the file by its path only");

  for (const key of Object.keys(process.env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)) delete process.env[key];
  await assert.rejects(cloneOrFetch(widget.address, join(root, "elsewhere")), /401|Authentication|could not read Username|terminal prompts disabled/i,
    "counter-proof: without the include the server refuses the clone");
  assert.ok(fixture.seen.some((each) => each.repository === "group/widget" && each.authorization === null), "counter-proof: that request carried no header");
});

// TST-20261110103 · level: component · module: MOD-bridge-jobs
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-011; UC-044
// given: a Bridge clone of the fixture project group/widget; the data folder keeping glpat-WIDGET for that project and github_pat_A for https://github.com/acme/agent-m,
//   included by useRepositoryTokens; a fixture fetch answering GitLab's "Create MR" and GitHub's "Create a pull request" with 201
// input: openPullRequest of hostOf(widget) for the branch agent-branch into main; openPullRequest of hostOf(https://github.com/acme/agent-m) through the same clone;
//   and openPullRequest of hostOf for https://github.com/acme/no-token, which the file holds no token for
// expect: one POST to https://127.0.0.1:<port>/api/v4/projects/group%2Fwidget/merge_requests with PRIVATE-TOKEN glpat-WIDGET, answered as merge request !7, and one POST
//   to https://api.github.com/repos/acme/agent-m/pulls with Authorization Bearer github_pat_A, answered as pull request #9; counter-proof: the product without a token
//   is NotSupported and no request is sent for it, and neither token was sent to the other's server
test("TST-20261110103: the host of a repository on a Bridge opens merge requests on GitLab and pull requests on GitHub with the token the Bridge holds for it", async (t) => {
  restoredEnvironment(t);
  const root = world(t);
  const widgetToken = "glpat-WIDGET0123456789";
  const fixture = await smartHttpServer(root, { "group/widget": basic("oauth2", widgetToken) }, t);
  bareRepository(root, "group", "widget");
  const widget = fixture.address("group/widget");
  const data = join(root, "data");
  await keepRepositoryTokens(data, [{ repository: widget, token: widgetToken }, { repository: "https://github.com/acme/agent-m", token: "github_pat_A" }]);
  useRepositoryTokens(data);
  const clone = await cloneOrFetch(widget, join(root, "work", "products", "widget"));

  const sent = [];
  const realFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = realFetch; });
  globalThis.fetch = async (url, init = {}) => {
    const headers = new Headers(init.headers);
    sent.push({ url: String(url), method: init.method, privateToken: headers.get("private-token"), authorization: headers.get("authorization") });
    if (String(url).endsWith("/merge_requests")) {
      return new Response(JSON.stringify({ iid: 7, title: "the job", source_branch: "agent-branch", target_branch: "main", sha: "a".repeat(40), state: "opened",
        web_url: `${widget}/-/merge_requests/7`, created_at: "2026-11-10T10:00:00Z", description: "" }), { status: 201, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ number: 9, title: "the job", head: { ref: "agent-branch", sha: "b".repeat(40) }, base: { ref: "main" }, state: "open",
      html_url: "https://github.com/acme/agent-m/pull/9", created_at: "2026-11-10T10:00:00Z", body: "" }), { status: 201, headers: { "content-type": "application/json" } });
  };
  const request = { branch: "agent-branch", base: "main", title: "the job", body: "" };
  const merge = await (await hostOf(widget, clone)).openPullRequest(request);
  const pull = await (await hostOf("https://github.com/acme/agent-m", clone)).openPullRequest(request);
  assert.equal(merge.number, 7);
  assert.equal(pull.number, 9);
  assert.deepEqual(sent.map(({ url, method }) => `${method} ${url}`), [`POST ${new URL(widget).origin}/api/v4/projects/group%2Fwidget/merge_requests`,
    "POST https://api.github.com/repos/acme/agent-m/pulls"]);
  assert.equal(sent[0].privateToken, widgetToken, "GitLab's merge request carries the project's token");
  assert.equal(sent[1].authorization, "Bearer github_pat_A", "GitHub's pull request carries the instance's token");
  assert.ok(!JSON.stringify(sent[0]).includes("github_pat_A") && !JSON.stringify(sent[1]).includes(widgetToken), "neither token went to the other's server");

  await assert.rejects((await hostOf("https://github.com/acme/no-token", clone)).openPullRequest(request), { name: "NotSupported" });
  assert.equal(sent.length, 2, "counter-proof: nothing is sent for a repository the Bridge holds no token for");
});

// TST-20261110104 · level: unit · module: MOD-bridge-jobs; MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: the Bridge's environment after useRepositoryTokens(data), which names the file of the repository tokens in GIT_CONFIG_*
// input: agentEnvironment of an agent on Linux and on macOS with that environment; hiddenPaths of the Bridge with that data folder
// expect: neither environment names any GIT_CONFIG_ variable or the file, and the places every enclosure hides begin with the data folder that holds the file;
//   counter-proof: the Bridge's own environment does name the file
test("TST-20261110104: an agent's environment names no file of the repository tokens, and its enclosure hides the data folder that holds it", (t) => {
  restoredEnvironment(t);
  const data = join(world(t), "data");
  useRepositoryTokens(data);
  const file = join(data, "repository-tokens.gitconfig");
  assert.ok(Object.values(process.env).includes(file), "counter-proof: the Bridge's own environment names the file");
  for (const platform of ["linux", "darwin"]) {
    const env = agentEnvironment({ platform, env: process.env, home: "/work/claude/home" });
    assert.deepEqual(Object.keys(env).filter((key) => key.startsWith("GIT_CONFIG")), [], `${platform}: no GIT_CONFIG_ variable`);
    assert.ok(!Object.values(env).includes(file), `${platform}: the file is not named`);
  }
  assert.equal(hiddenPaths({ platform: "darwin", dataFolder: data, personHome: "/Users/alice" })[0], data);
  assert.equal(existsSync(file), false, "useRepositoryTokens writes nothing; the file comes with keepRepositoryTokens");
});
