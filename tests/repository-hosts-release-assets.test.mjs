// MOD-repository-hosts' listReleaseAssets (ITM-1046), as docs/architecture/MOD-repository-hosts.md states it: "`listReleaseAssets(tag: string | "latest") -> Promise<Release>` — a release and its
// files, as the Bridge's download page offers them (UC-044): name, size, the download address, and the SHA-256 the server reports for each file. … where the server reports none the caller links
// the release's checksum file … Crosses the network; fails with `NotFound` when the release does not exist, `TokenRefused`, `RateLimited`, `Unreachable`, and `NotSupported` through a clone." And
// `Release` — `{ tag, name, published, notes, assets: { name, size: number | null, url, sha256: string | null }[] }`.
// Run: node --test tests/repository-hosts-release-assets.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-044; THE BRIDGE IS ONE FILE PER PLATFORM; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// The servers are fakes of `fetch`, deterministic, no network, answering as the APIs document: GitHub's "Get the latest release" (GET /repos/{owner}/{repo}/releases/latest) and "Get a release by
// tag name" (GET /repos/{owner}/{repo}/releases/tags/{tag}) — each asset with name, size, browser_download_url and digest ("sha256:<hex>", null where GitHub reports none) —, 404 for a release that
// does not exist; GitLab's "Get a release by a tag name" (GET /projects/:id/releases/:tag_name) and "Get the latest release" (GET /projects/:id/releases/permalink/latest), whose assets are links
// with a name and an address and report neither size nor checksum.
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - GitHub's asset `digest` "sha256:<hex>" is the SHA-256 the server reports; any other digest, or none, is null.
//   - GitLab reports a release's files as links without size or checksum, so each has size null and sha256 null; the address is the link's direct_asset_url where it has one, else its url.
//   - A release's `published` is GitHub's published_at, GitLab's released_at.
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

const GH_WEB = "https://github.com/carol/release-tool";
const GH_PREFIX = "/repos/carol/release-tool";
const SHA = "a".repeat(64);
const WINDOWS = { name: "agent-m-bridge-windows.exe", size: 41230000, browser_download_url: `${GH_WEB}/releases/download/v1.2.0/agent-m-bridge-windows.exe`, digest: `sha256:${SHA}` };
const LINUX = { name: "agent-m-bridge-linux", size: 39000000, browser_download_url: `${GH_WEB}/releases/download/v1.2.0/agent-m-bridge-linux`, digest: null };
const SUMS = { name: "SHA256SUMS", size: 200, browser_download_url: `${GH_WEB}/releases/download/v1.2.0/SHA256SUMS` };
const GH_RELEASE = { tag_name: "v1.2.0", name: "Bridge 1.2.0", published_at: "2026-10-01T08:00:00Z", body: "Notes.", assets: [WINDOWS, LINUX, SUMS] };

function fakeGitHub() {
  const requests = [];
  return { requests, fetch: async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    requests.push({ path: url.pathname, authorization: new Headers(init.headers ?? {}).get("authorization") });
    if (url.pathname === `${GH_PREFIX}/releases/latest` || url.pathname === `${GH_PREFIX}/releases/tags/v1.2.0`) return json(200, GH_RELEASE);
    if (url.pathname.startsWith(`${GH_PREFIX}/releases/`)) return json(404, { message: "Not Found", status: "404" });
    throw new Error(`unscripted request ${url}`);
  } };
}

const EXPECTED_ASSETS = [
  { name: WINDOWS.name, size: 41230000, url: WINDOWS.browser_download_url, sha256: SHA },
  { name: LINUX.name, size: 39000000, url: LINUX.browser_download_url, sha256: null },
  { name: SUMS.name, size: 200, url: SUMS.browser_download_url, sha256: null },
];

// TST-1046001 · level: unit · module: MOD-repository-hosts
// guards: UC-044; THE BRIDGE IS ONE FILE PER PLATFORM
// given: a GitHub release v1.2.0 with three files: one with the digest sha256:aaaa…, one whose digest is null, one with none
// input: listReleaseAssets("latest") and listReleaseAssets("v1.2.0")
// expect: for each call, { tag: "v1.2.0", name: "Bridge 1.2.0", published: "2026-10-01T08:00:00Z", notes: "Notes.", assets } with each file's name, size, download address and the SHA-256 the server reports, null for the two files that have none
test("listReleaseAssets — latest and a named tag give each file's name, size, address and the server's SHA-256, null where it reports none", async () => {
  const server = fakeGitHub();
  const host = connect(parseAddress(GH_WEB));
  for (const tag of ["latest", "v1.2.0"]) {
    const release = await using(server.fetch, () => host.listReleaseAssets(tag));
    assert.deepEqual(release, { tag: "v1.2.0", name: "Bridge 1.2.0", published: "2026-10-01T08:00:00Z", notes: "Notes.", assets: EXPECTED_ASSETS });
  }
  assert.deepEqual(server.requests.map((r) => r.path), [`${GH_PREFIX}/releases/latest`, `${GH_PREFIX}/releases/tags/v1.2.0`]);
});

// TST-1046002 · level: unit · module: MOD-repository-hosts
// guards: UC-044; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the same GitHub repository, which has no release v9.9.9
// input: listReleaseAssets("v9.9.9")
// expect: fails with NotFound, and with no list of files
test("listReleaseAssets — a release that does not exist is NotFound", async () => {
  const failed = await using(fakeGitHub().fetch, () => failure(connect(parseAddress(GH_WEB)).listReleaseAssets("v9.9.9")));
  assert.equal(failed?.name, "NotFound");
});

// TST-1046003 · level: unit · module: MOD-repository-hosts
// guards: UC-044; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host through a local clone without a token
// input: listReleaseAssets("latest")
// expect: fails with NotSupported, and no request goes out
test("listReleaseAssets — through a clone without a token it is NotSupported, with no request", async () => {
  const server = fakeGitHub();
  const failed = await using(server.fetch, () => failure(connect(parseAddress(GH_WEB), { clone: "/tmp/a-clone" }).listReleaseAssets("latest")));
  assert.equal(failed?.name, "NotSupported");
  assert.equal(server.requests.length, 0);
});

// TST-1046004 · level: unit · module: MOD-repository-hosts
// guards: UC-044; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitHub token the server refuses (401), then a used-up rate limit (403 with x-ratelimit-remaining 0)
// input: listReleaseAssets("latest") with the token
// expect: TokenRefused, then RateLimited
test("listReleaseAssets — a refused token is TokenRefused and a used-up limit is RateLimited", async () => {
  const token = "github_pat_CAROLreleaseTOOL0123456789abcdef";
  const answers = [() => json(401, { message: "Bad credentials" }), () => new Response(JSON.stringify({ message: "API rate limit exceeded" }), { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1790000000" } })];
  const names = [];
  for (const answer of answers) names.push((await using(async () => answer(), () => failure(connect(parseAddress(GH_WEB), { token, tokenName: "t" }).listReleaseAssets("latest"))))?.name);
  assert.deepEqual(names, ["TokenRefused", "RateLimited"]);
});

// TST-1046005 · level: unit · module: MOD-repository-hosts
// guards: UC-044; THE BRIDGE IS ONE FILE PER PLATFORM
// given: a GitLab project whose release v1.2.0 has two links (a name and an address each, one with a direct_asset_url)
// input: listReleaseAssets("v1.2.0") and listReleaseAssets("latest")
// expect: the two files with their names and addresses (the direct address where there is one), size null and sha256 null, the tag, name, released_at and description as published and notes; "latest" asks the permalink
test("listReleaseAssets — on GitLab the links are the files, with size and checksum null", async () => {
  const requests = [];
  const release = { tag_name: "v1.2.0", name: "Bridge 1.2.0", released_at: "2026-10-01T08:00:00Z", description: "Notes.",
    assets: { links: [{ name: "bridge-linux", url: "https://gitlab.example.org/space/release-tool/-/packages/1", direct_asset_url: "https://gitlab.example.org/space/release-tool/-/releases/v1.2.0/downloads/bridge-linux" },
      { name: "SHA256SUMS", url: "https://gitlab.example.org/space/release-tool/-/packages/2" }] } };
  const fetchFn = async (input) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    requests.push(url.pathname);
    return json(200, release);
  };
  const host = connect(parseAddress("https://gitlab.example.org/space/release-tool"));
  const expected = { tag: "v1.2.0", name: "Bridge 1.2.0", published: "2026-10-01T08:00:00Z", notes: "Notes.", assets: [
    { name: "bridge-linux", size: null, url: "https://gitlab.example.org/space/release-tool/-/releases/v1.2.0/downloads/bridge-linux", sha256: null },
    { name: "SHA256SUMS", size: null, url: "https://gitlab.example.org/space/release-tool/-/packages/2", sha256: null }] };
  assert.deepEqual(await using(fetchFn, () => host.listReleaseAssets("v1.2.0")), expected);
  assert.deepEqual(await using(fetchFn, () => host.listReleaseAssets("latest")), expected);
  assert.deepEqual(requests, ["/api/v4/projects/space%2Frelease-tool/releases/v1.2.0", "/api/v4/projects/space%2Frelease-tool/releases/permalink/latest"]);
});
