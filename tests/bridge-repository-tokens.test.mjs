// MOD-bridge-jobs — the repository tokens the paired browser hands the Bridge, as docs/architecture/MOD-bridge-jobs.md (Data: The repository tokens;
// Interfaces: keepRepositoryTokens, useRepositoryTokens; the host of a repository through its clone) states them: "in git's configuration format, for each
// repository the browser handed a token for, a section for its address and one for its address with `.git`, each holding the header that authorises git's
// requests there"; "The header is Basic with the user `x-access-token` on GitHub and `oauth2` on a GitLab server"; "The Bridge's process includes the file in
// the configuration of every git it starts — its environment names the file by its path —, so that no token stands on a command line, in a remote address, in
// a clone's configuration or in an environment"; and the host of a repository is "MOD-repository-hosts' `connect` with the clone and the token the file holds
// for the repository's address: ... its pull or merge requests ... through the server's API with that token; without a token those are `NotSupported`".
// The check SPEC.md's A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT names (configuration-and-secrets/03), and the checks of A CLI SESSION FINDS ITS
// REPOSITORY'S TOKEN IN AN IGNORED FILE and A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE (configuration-and-secrets/04): "the Bridge leaves that token,
// alone, as the text of the file `.agent-m-token` at the root of the checkout ... and names the file in the checkout's `.git/info/exclude`"; "No other
// credential is left: not the instance's token, not the Bridge's pairing token"; "Where a token file is left, the Bridge adds [token.md], filled in, after
// the input it is given" (MOD-bridge-jobs, The token file, What the session is told of its checkout).
// Run: node --test tests/bridge-repository-tokens.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO MODEL READS A CREDENTIAL; CONFIGURATION LIVES IN THE BROWSER; A CREDENTIAL IS NEVER PLACED IN A URL; UC-044; UC-011
// Guards: A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE; A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE; UC-049
// Level: component
//
// Deterministic, no network beyond loopback: the repositories are bare repositories behind a fixture smart-HTTP server on 127.0.0.1 over HTTPS, with a
// certificate made for the test by openssl, which git trusts through GIT_SSL_CAINFO; the server answers git only with the header of the repository's own token
// and records every header it was sent. A repository at https://127.0.0.1:<port>/<group>/<project> is a GitLab project by MOD-repository-hosts' parseAddress, so
// that its header carries the user oauth2. The API is a fixture `fetch`. git is reached through a wrapper on PATH that records every command line and every
// environment it is started with. Where the module file leaves a reading open, the test states the one it takes:
//   - "nothing is written" for a refused list: the file holds the bytes it held before.
//   - The agent's side is checked where the enclosure makes it: agentEnvironment, the environment an agent receives, and hiddenPaths, the places it hides.
//   - The CLI session is a fixture executable named opencode, alone with a git wrapper on PATH, started through the fixture enclosure of
//     tests/enclosure-fixture.mjs; its git is given no include of the Bridge's tokens.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { jobHandlers, keepRepositoryTokens, useRepositoryTokens } from "../src/bridge-jobs/index.mjs";
import { cloneOrFetch, defaultHead, hostOf, leaveToken, workingClone } from "../src/bridge-jobs/workfolders.mjs";
import { startSession } from "../src/bridge-jobs/session.mjs";
import { agentEnvironment, hiddenPaths } from "../src/agent-enclosure/holders.mjs";
import { pairAnew } from "../src/bridge-http/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

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

// The CLI session's own git in `cwd`: an environment of its own, as its enclosure gives it, which names no include of the Bridge's tokens; each command must succeed.
// Started without blocking, so that the fixture server in this process answers it.
async function sessionGit(root, cwd, ...commands) {
  const env = { PATH: process.env.PATH, HOME: root, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0", GIT_SSL_CAINFO: process.env.GIT_SSL_CAINFO,
    GIT_AUTHOR_NAME: "Agent", GIT_AUTHOR_EMAIL: "agent@example.org", GIT_COMMITTER_NAME: "Agent", GIT_COMMITTER_EMAIL: "agent@example.org" };
  for (const args of commands) {
    const { status, stderr } = await new Promise((resolve) => {
      const child = spawn(REAL_GIT, args, { cwd, env });
      let said = "";
      child.stderr.on("data", (chunk) => { said += chunk; });
      child.on("close", (code) => resolve({ status: code, stderr: said }));
    });
    assert.equal(status, 0, `the session's git ${args.join(" ")}: ${stderr}`);
  }
}

// Every file below a folder, `.git` included, by its path.
const filesBelow = (folder) => readdirSync(folder, { withFileTypes: true, recursive: true }).filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath ?? entry.path, entry.name));

// TST-20261110101 · level: unit · module: MOD-bridge-jobs
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; CONFIGURATION LIVES IN THE BROWSER; UC-044
// given: an empty data folder of a Bridge
// input: keepRepositoryTokens(data, [the instance https://github.com/acme/agent-m with github_pat_A, the project https://gitlab.example.org/group/sub/project with glpat-B]); then keepRepositoryTokens(data, [the project alone]); then a list naming a GitLab token for a GitHub repository, a list naming one repository twice, and one naming no repository's address
// expect: 2, then 1; the file repository-tokens.gitconfig is readable by its user only and holds, first, for each repository a section for its address and one for it with .git, each with `Authorization: Basic` of x-access-token:github_pat_A for GitHub and oauth2:glpat-B for GitLab, then only the project's two sections — the instance's token forgotten; counter-proof: each refused list rejects with the code invalid-request, its message naming the repository and never the token, and the file holds the bytes it held before
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
// given: two projects behind the fixture server, group/widget and group/other, each answering only its own token's header; the Bridge's data folder keeping glpat-WIDGET for widget and glpat-OTHER for other, included by useRepositoryTokens; git reached through the recording wrapper
// input: cloneOrFetch of each into a clone of the Bridge; for widget a session's checkout (workingClone with widget's address) with its token file (leaveToken), a commit the session pushes to its origin with a git that is given no include, and a commit through hostOf(widget)'s commitFiles; then, with the include taken away, a fresh clone of widget
// expect: every request for widget carried Basic oauth2:glpat-WIDGET and every request for other Basic oauth2:glpat-OTHER, none the other's; the session's branch and the host's commit are on widget's branch and main; no clone's or checkout's .git/config, remote address, command line or environment of the Bridge's git holds a token or its header's encoding; counter-proof: without the include the clone is refused by the server and git names it
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
  const working = await workingClone(clone, join(root, "work", "jobs", "JOB-1"), widget.address);
  await leaveToken(working, widget.address);
  writeFileSync(join(working, "change.md"), "the agent's change\n");
  await sessionGit(root, working, ["checkout", "-q", "-b", "agent-branch"], ["add", "-A"], ["commit", "-q", "-m", "agent"], ["push", "-q", "origin", "agent-branch"]);
  assert.equal(git(root, "--git-dir", widget.origin, "rev-parse", "agent-branch"), git(working, "rev-parse", "HEAD"), "the session's branch reached the project");
  const host = await hostOf(widget.address, clone);
  const { commit: head } = await defaultHead(clone);
  const made = await host.commitFiles({ branch: "main", expectedHead: head, files: [{ path: "docs/end.md", text: "end\n" }], message: "end JOB-1" });
  assert.equal(git(root, "--git-dir", widget.origin, "rev-parse", "main"), made.commit, "the host's commit reached the project's main");

  const byRepository = (name) => fixture.seen.filter((each) => each.repository === name).map((each) => each.authorization);
  assert.ok(byRepository("group/widget").length >= 4, "known positive: widget was asked for clone, fetch and pushes");
  assert.ok(byRepository("group/other").length >= 1, "known positive: other was asked");
  // The session's git asks without a header first and, on the server's 401, with the token its credential helper reads from the file (git's own flow).
  assert.deepEqual([...new Set(byRepository("group/widget").filter(Boolean))], [expected["group/widget"]], "widget saw its own token only");
  assert.deepEqual([...new Set(byRepository("group/other"))], [expected["group/other"]], "other saw its own token only");
  const seenBefore = fixture.seen.length;

  const secrets = [widgetToken, otherToken, expected["group/widget"].slice(6), expected["group/other"].slice(6)];
  for (const folder of [clone, join(root, "work", "products", "other"), working]) {
    const config = readFileSync(join(folder, ".git", "config"), "utf8");
    assert.ok(!secrets.some((secret) => config.includes(secret)), `${folder}'s .git/config holds no token`);
    assert.doesNotMatch(git(folder, "remote", "get-url", "origin"), /@/, "the remote address carries no credential");
  }
  const recorded = calls();
  assert.ok(/^ARGS fetch .*origin/m.test(recorded), "known positive: the wrapper recorded the Bridge's git");
  assert.ok(!secrets.some((secret) => recorded.includes(secret)), "no command line and no environment of the Bridge's git holds a token or its header");
  assert.match(recorded, /^ENV GIT_CONFIG_VALUE_\d+=.*repository-tokens\.gitconfig$/m, "the environment names the file by its path only");

  for (const key of Object.keys(process.env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)) delete process.env[key];
  await assert.rejects(cloneOrFetch(widget.address, join(root, "elsewhere")), /401|Authentication|could not read Username|terminal prompts disabled/i,
    "counter-proof: without the include the server refuses the clone");
  assert.ok(fixture.seen.slice(seenBefore).some((each) => each.repository === "group/widget" && each.authorization === null), "counter-proof: that request carried no header");
});

// TST-20261110103 · level: component · module: MOD-bridge-jobs
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-011; UC-044
// given: a Bridge clone of the fixture project group/widget; the data folder keeping glpat-WIDGET for that project and github_pat_A for https://github.com/acme/agent-m, included by useRepositoryTokens; a fixture fetch answering GitLab's "Create MR" and GitHub's "Create a pull request" with 201
// input: openPullRequest of hostOf(widget) for the branch agent-branch into main; openPullRequest of hostOf(https://github.com/acme/agent-m) through the same clone; and openPullRequest of hostOf for https://github.com/acme/no-token, which the file holds no token for
// expect: one POST to https://127.0.0.1:<port>/api/v4/projects/group%2Fwidget/merge_requests with PRIVATE-TOKEN glpat-WIDGET, answered as merge request !7, and one POST to https://api.github.com/repos/acme/agent-m/pulls with Authorization Bearer github_pat_A, answered as pull request #9; counter-proof: the product without a token is NotSupported and no request is sent for it, and neither token was sent to the other's server
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
// expect: neither environment names any GIT_CONFIG_ variable or the file, and the places every enclosure hides begin with the data folder that holds the file; counter-proof: the Bridge's own environment does name the file
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

// ---------------------------------------------------------------- the token file of a CLI session (configuration-and-secrets/04)

// TST-20261112001 · level: component · module: MOD-bridge-jobs
// guards: A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL; UC-011
// given: behind the fixture server the product group/widget, answering only Basic oauth2:glpat-WIDGET, the instance group/agent-m, answering only its own token, and the product group/open, answering without a token; the Bridge's data folder keeping the tokens of widget and of the instance, included by useRepositoryTokens, and its pairing token PAIRING-0123456789abcdef
// input: startSession of a job JOB-1 of widget in an agent's working folder, at the instance's head; the session commits everything its checkout holds and pushes its branch JOB-1 with its own git, given no include; then startSession of a job JOB-2 of open
// expect: the checkout's .agent-m-token holds glpat-WIDGET, readable by its user only; `git status --porcelain` lists nothing, and lists the file among the ignored; the session's push reached widget, whose JOB-1 holds README.md and change.md and no token file; the checkout's origin is widget's address with no credential, and its .git/config holds no token; of every file of the checkout only the token file holds widget's token; counter-proof: no file of the checkout holds the instance's token, its header's encoding or the pairing token; for open no token file is left and no credential helper is named
test("TST-20261112001: a CLI session finds its product's token in a file of its checkout that git ignores, and no other credential", async (t) => {
  restoredEnvironment(t);
  const root = world(t);
  const widgetToken = "glpat-WIDGET0123456789", instanceToken = "glpat-INSTANCE0123456789", pairing = "PAIRING-0123456789abcdef";
  const fixture = await smartHttpServer(root, { "group/widget": basic("oauth2", widgetToken), "group/agent-m": basic("oauth2", instanceToken) }, t);
  const widget = { ...bareRepository(root, "group", "widget"), address: fixture.address("group/widget") };
  const instance = { ...bareRepository(root, "group", "agent-m", { "AGENTS.md": "the rules\n" }), address: fixture.address("group/agent-m") };
  const open = { ...bareRepository(root, "group", "open"), address: fixture.address("group/open") };
  const data = join(root, "data");
  await keepRepositoryTokens(data, [{ repository: widget.address, token: widgetToken }, { repository: instance.address, token: instanceToken }]);
  useRepositoryTokens(data);
  await pairAnew(data, pairing);
  const folder = join(root, "work"), commit = git(root, "--git-dir", instance.origin, "rev-parse", "main");

  const session = await startSession({ folder, instance: instance.address, commit, product: widget.address, id: "JOB-1" });
  assert.equal(session.file, join(session.working, ".agent-m-token"));
  assert.equal(readFileSync(session.file, "utf8"), widgetToken);
  assert.equal(statSync(session.file).mode & 0o777, 0o600, "the file is its user's alone");
  assert.equal(git(session.working, "status", "--porcelain"), "", "git status lists no file");
  assert.match(git(session.working, "status", "--porcelain", "--ignored"), /^!! \.agent-m-token$/m, "known positive: the file is there, and ignored");

  writeFileSync(join(session.working, "change.md"), "the session's change\n");
  await sessionGit(root, session.working, ["checkout", "-q", "-b", "JOB-1"], ["add", "-A"], ["commit", "-q", "-m", "change"], ["push", "-q", "origin", "JOB-1"]);
  assert.equal(git(root, "--git-dir", widget.origin, "rev-parse", "JOB-1"), git(session.working, "rev-parse", "HEAD"), "the session's push reached the product with the token from the file");
  assert.deepEqual(git(root, "--git-dir", widget.origin, "ls-tree", "-r", "--name-only", "JOB-1").split("\n").sort(), ["README.md", "change.md"], "no commit holds the token file");
  assert.equal(git(session.working, "remote", "get-url", "origin"), widget.address, "the origin is the product's address, with no credential in it");
  const config = readFileSync(join(session.working, ".git", "config"), "utf8");
  assert.ok(!config.includes(widgetToken) && !config.includes(basic("oauth2", widgetToken).slice(6)), "the checkout's configuration holds no token");

  const files = filesBelow(session.working);
  const holding = (secret) => files.filter((file) => readFileSync(file, "latin1").includes(secret));
  assert.deepEqual(holding(widgetToken), [session.file], "known positive of the search: the token file holds the product's token, and no other file does");
  for (const secret of [instanceToken, basic("oauth2", instanceToken).slice(6), pairing]) assert.deepEqual(holding(secret), [], "counter-proof: no other credential is in the checkout");

  const bare = await startSession({ folder, instance: instance.address, commit, product: open.address, id: "JOB-2" });
  assert.equal(bare.file, null);
  assert.equal(existsSync(join(bare.working, ".agent-m-token")), false, "no token file for a product the Bridge holds no token for");
  assert.equal(spawnSync(REAL_GIT, ["config", "--get-all", "credential.helper"], { cwd: bare.working, encoding: "utf8" }).stdout.trim(), "", "and no helper is named");
});

// TST-20261112002 · level: component · module: MOD-bridge-jobs
// guards: A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE; A CLI SESSION FINDS ITS REPOSITORY'S TOKEN IN AN IGNORED FILE; NO MODEL READS A CREDENTIAL; UC-049; UC-011
// given: the fixture server of TST-20261112001 with widget and the instance; the Bridge's data folder keeping their tokens; jobHandlers of a Bridge offering the fixture CLI session opencode with a working folder, its enclosures the fixture's, the instance's address and widget among its products; opencode records what it is given on its standard input, and pushes a branch with its own git
// input: POST /v1/ask { agent: opencode, model: opencode/big-pickle, input: "INPUT-MARKER: split the requirement", product: widget, instance: the instance's head }; GET /v1/ask/{ask} until it is no longer running; then POST /v1/ask naming a product the Bridge does not serve
// expect: the ask is done with the session's answer "I pushed JOB-ask."; the session's input begins with the input of the request and then names the file <checkout>/.agent-m-token and says to use the token without reading the file; the session's push reached widget; the checkout is removed after the answer; counter-proof: neither token stands in the session's input, and the ask for another product is invalid-request
test("TST-20261112002: the input of a CLI session names its token file and says to use the token without reading it, and holds no token", async (t) => {
  restoredEnvironment(t);
  const root = world(t);
  const widgetToken = "glpat-WIDGET0123456789", instanceToken = "glpat-INSTANCE0123456789";
  const fixture = await smartHttpServer(root, { "group/widget": basic("oauth2", widgetToken), "group/agent-m": basic("oauth2", instanceToken) }, t);
  const widget = { ...bareRepository(root, "group", "widget"), address: fixture.address("group/widget") };
  const instance = { ...bareRepository(root, "group", "agent-m", { "AGENTS.md": "the rules\n" }), address: fixture.address("group/agent-m") };
  const data = join(root, "data");
  await keepRepositoryTokens(data, [{ repository: widget.address, token: widgetToken }, { repository: instance.address, token: instanceToken }]);
  useRepositoryTokens(data);

  // The Bridge's computer: a PATH of the fixture session and a git wrapper only, so that no real agent is found.
  const bin = join(root, "session-bin"), told = join(root, "told.txt");
  mkdirSync(bin);
  writeFileSync(join(bin, "git"), `#!/bin/sh\nexec '${REAL_GIT}' "$@"\n`, { mode: 0o755 });
  const event = JSON.stringify({ type: "text", part: { text: "I pushed JOB-ask." } });
  writeFileSync(join(bin, "opencode"), `#!/bin/sh
case "$1" in --version) echo 1.4.0;; models) echo opencode/big-pickle;;
run) /bin/cat > '${told}'; printf 'change\\n' > change.md && git checkout -q -b JOB-ask && git add -A && git commit -q -m change && git push -q origin JOB-ask
printf '%s\\n' '${event}' '{"type":"step_finish","part":{"tokens":{"input":3,"output":2}}}';; esac
`, { mode: 0o755 });
  const prior = { PATH: process.env.PATH, HOME: process.env.HOME };
  Object.assign(process.env, { PATH: bin, HOME: root, GIT_AUTHOR_NAME: "Agent", GIT_COMMITTER_NAME: "Agent" });
  t.after(() => Object.assign(process.env, prior));

  const folder = join(root, "work");
  mkdirSync(folder);
  // The fixture enclosure, but with the environment an enclosure chooses: no include of the Bridge's tokens (agentEnvironment, TST-20261110104).
  const enclosed = (at) => ({ ...openEnclosures()(at), wrap: (command, args) => ({ command, args, input: null,
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key))) }) });
  const handlers = jobHandlers({ agents: [{ name: "opencode", folder }], enclosures: enclosed, instance: instance.address, products: [{ address: widget.address }] });
  const commit = git(root, "--git-dir", instance.origin, "rev-parse", "main");
  const asked = (body) => handlers["POST /v1/ask"]({ params: {}, query: {}, body });
  const { ask } = await asked({ agent: "opencode", model: "opencode/big-pickle", input: "INPUT-MARKER: split the requirement", product: widget.address, instance: commit });
  let answer;
  for (const end = Date.now() + 30000; Date.now() < end;) {
    answer = await handlers["GET /v1/ask/{ask}"]({ params: { ask }, query: {}, body: null });
    if (answer.state !== "running") break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.equal(answer.state, "done", JSON.stringify(answer));
  assert.equal(answer.text, "I pushed JOB-ask.");
  const input = readFileSync(told, "utf8");
  const file = join(folder, "jobs", ask, ".agent-m-token");
  assert.ok(input.startsWith("INPUT-MARKER: split the requirement"), input.slice(0, 200));
  assert.ok(input.includes(file), `the input names the file ${file}`);
  assert.match(input, /without reading the file/, "the input says to use the token without reading the file");
  assert.ok(!input.includes(widgetToken) && !input.includes(instanceToken), "counter-proof: no token stands in the input");
  assert.equal(git(root, "--git-dir", widget.origin, "show", "JOB-ask:change.md"), "change", "the session pushed with the token from the file");
  assert.equal(existsSync(join(folder, "jobs", ask)), false, "the checkout and its token file are removed after the answer");
  await assert.rejects(asked({ agent: "opencode", input: "x", product: "https://github.com/acme/elsewhere", instance: commit }), (error) => error?.code === "invalid-request",
    "counter-proof: a product the Bridge does not serve is refused");
});
