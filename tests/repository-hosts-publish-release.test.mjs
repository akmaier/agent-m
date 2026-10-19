// MOD-repository-hosts' publishRelease (ITM-1048), as docs/architecture/MOD-repository-hosts.md states it: "`publishRelease(tag, release: { name, notes, files }) -> Promise<Release>` — on GitHub,
// creates the release of a tag that stands: first as a draft, then each file uploaded to it, then published, so that no release is seen with only part of its files. Returns the `Release` with
// each file's download address and the SHA-256 the server reports for it. An existing release of the tag is never replaced (`A VERSION IS NOT REWRITTEN`). On a GitLab server and through a clone
// without a token it throws `NotSupported`. … fails with `NotFound` when the tag does not exist, `ReleaseExists { tag }` when the tag has a release, `UploadFailed { file }` when a file could not
// be uploaded — the draft is then left unpublished and named, and nothing is published —, `PermissionMissing`, `TokenRefused`, `RateLimited`, `Unreachable`."
// Run: node --test tests/repository-hosts-publish-release.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-044; THE BRIDGE IS SIGNED BY ITS PUBLISHER; A VERSION IS NOT REWRITTEN; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: unit
//
// The server is a fake of `fetch`, deterministic, no network, answering as GitHub's REST API documents: "Get a reference" (GET git/ref/tags/{tag}), "Get a release by tag name" (GET
// releases/tags/{tag}; 404 where the tag has no published release), "Create a release" (POST releases with draft: true; the answer names the upload_url on uploads.github.com), "Upload a
// release asset" (POST {upload_url}?name=…, the file's bytes as the body; the answer is the asset with its digest) and "Update a release" (PATCH releases/{id} with draft: false). The fake
// keeps every request in order, and it refuses to publish a release that does not yet hold every file the test expects it to hold, so that a publish before the last upload fails.
// Readings the texts leave open, which the tests state (the pull request names them):
//   - The returned Release is the one the publishing answers with: tag, name, published (published_at), notes (body) and each asset's name, size, address and the SHA-256 of GitHub's digest "sha256:<hex>".
//   - A file's upload is refused with UploadFailed { file } when the server serves it with a failure other than a refused token or a used-up limit, and when the server cannot be reached.
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

const WEB = "https://github.com/carol/release-tool";
const PREFIX = "/repos/carol/release-tool";
const UPLOADS = "https://uploads.github.com";
const TOKEN = "github_pat_PUBLISHER0123456789abcdef";
const SHA_A = "a".repeat(64), SHA_B = "b".repeat(64);
const WINDOWS = { name: "agent-m-bridge-windows.exe", bytes: new Uint8Array([1, 2, 3, 4]), contentType: "application/vnd.microsoft.portable-executable" };
const LINUX = { name: "agent-m-bridge-linux", bytes: new Uint8Array([9, 8, 7]), contentType: "application/octet-stream" };
const RELEASE = { name: "Bridge 1.3.0", notes: "Signed files.", files: [WINDOWS, LINUX] };
const DIGESTS = { [WINDOWS.name]: SHA_A, [LINUX.name]: SHA_B };

// options: tagStands (default true), released (the tag has a published release), failUpload (the name of the file whose upload the server answers 500), expected (how many files the release must
// hold before the server lets it be published).
function fakeGitHub({ tagStands = true, released = false, failUpload = null, expected = 2 } = {}) {
  const events = [], requests = [];
  const draft = { id: 77, assets: [], published: false };
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = init.method ?? "GET";
    const headers = new Headers(init.headers ?? {});
    requests.push({ method, href: url.href, origin: url.origin, path: url.pathname, authorization: headers.get("authorization"), contentType: headers.get("content-type"), body: init.body });
    if (method === "GET" && url.pathname === `${PREFIX}/git/ref/tags/v1.3.0`) return tagStands ? json(200, { object: { sha: "c".repeat(40) } }) : json(404, { message: "Not Found" });
    if (method === "GET" && url.pathname === `${PREFIX}/releases/tags/v1.3.0`) return released ? json(200, { tag_name: "v1.3.0", assets: [] }) : json(404, { message: "Not Found" });
    if (method === "POST" && url.pathname === `${PREFIX}/releases`) {
      const body = JSON.parse(init.body);
      events.push(`create ${body.draft === true ? "draft" : "PUBLISHED"} ${body.tag_name} ${body.name}`);
      return json(201, { id: draft.id, draft: body.draft, upload_url: `${UPLOADS}${PREFIX}/releases/${draft.id}/assets{?name,label}` });
    }
    if (method === "POST" && url.origin === UPLOADS && url.pathname === `${PREFIX}/releases/${draft.id}/assets`) {
      const name = url.searchParams.get("name");
      events.push(`upload ${name}`);
      if (name === failUpload) return json(500, { message: "Server Error" });
      const asset = { name, size: init.body.length, browser_download_url: `${WEB}/releases/download/v1.3.0/${name}`, digest: `sha256:${DIGESTS[name]}` };
      draft.assets.push(asset);
      return json(201, asset);
    }
    if (method === "PATCH" && url.pathname === `${PREFIX}/releases/${draft.id}`) {
      const body = JSON.parse(init.body);
      if (body.draft === false && draft.assets.length < expected) { events.push("publish REFUSED"); return json(422, { message: "the release does not hold every file yet" }); }
      events.push(body.draft === false ? "publish" : "update");
      draft.published = body.draft === false;
      return json(200, { tag_name: "v1.3.0", name: "Bridge 1.3.0", published_at: "2026-10-19T09:00:00Z", body: "Signed files.", draft: false, assets: draft.assets });
    }
    throw new Error(`unscripted request ${method} ${url}`);
  };
  return { events, requests, draft, fetch };
}
const hostOf = () => connect(parseAddress(WEB), { token: TOKEN });

// TST-1048001 · level: unit · module: MOD-repository-hosts
// guards: UC-044; THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: a GitHub repository whose tag v1.3.0 stands and has no release; two files, agent-m-bridge-windows.exe and agent-m-bridge-linux
// input: publishRelease("v1.3.0", { name: "Bridge 1.3.0", notes: "Signed files.", files })
// expect: the server sees, in this order, the creation of the release as a draft named for the tag, the upload of the first file, the upload of the second, and the publication — nothing else is written —; the host returns { tag: "v1.3.0", name: "Bridge 1.3.0", published: "2026-10-19T09:00:00Z", notes: "Signed files.", assets } with each file's name, size, download address and the SHA-256 the server reports
test("publishRelease — creates the release as a draft, uploads each file, then publishes, and returns each file's address and SHA-256", async () => {
  const server = fakeGitHub();
  const release = await using(server.fetch, () => hostOf().publishRelease("v1.3.0", RELEASE));
  assert.deepEqual(server.events, ["create draft v1.3.0 Bridge 1.3.0", `upload ${WINDOWS.name}`, `upload ${LINUX.name}`, "publish"]);
  assert.deepEqual(release, { tag: "v1.3.0", name: "Bridge 1.3.0", published: "2026-10-19T09:00:00Z", notes: "Signed files.", assets: [
    { name: WINDOWS.name, size: 4, url: `${WEB}/releases/download/v1.3.0/${WINDOWS.name}`, sha256: SHA_A },
    { name: LINUX.name, size: 3, url: `${WEB}/releases/download/v1.3.0/${LINUX.name}`, sha256: SHA_B },
  ] });
});

// TST-1048002 · level: unit · module: MOD-repository-hosts
// guards: UC-044; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the same repository; known positive: the files are uploaded (TST-1048001)
// input: publishRelease with the token stored
// expect: each upload carries the bytes of its file as the body and its content type, goes to GitHub's upload host under this repository, and carries the token only in the authorisation header; no address holds the token; no request goes to any other host than api.github.com and uploads.github.com
test("publishRelease — each file's bytes and content type reach the upload host with the token in the header only", async () => {
  const server = fakeGitHub();
  await using(server.fetch, () => hostOf().publishRelease("v1.3.0", RELEASE));
  const uploads = server.requests.filter((r) => r.origin === UPLOADS);
  assert.equal(uploads.length, 2, "known positive: both files are uploaded");
  assert.deepEqual(uploads.map((r) => [r.contentType, [...r.body]]), [[WINDOWS.contentType, [1, 2, 3, 4]], [LINUX.contentType, [9, 8, 7]]]);
  assert.ok(uploads.every((r) => r.authorization === `Bearer ${TOKEN}`));
  assert.equal(server.requests.filter((r) => r.href.includes(TOKEN)).length, 0);
  assert.deepEqual([...new Set(server.requests.map((r) => r.origin))].sort(), ["https://api.github.com", UPLOADS]);
});

// TST-1048003 · level: unit · module: MOD-repository-hosts
// guards: A VERSION IS NOT REWRITTEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a repository whose tag v1.3.0 stands and already has a release
// input: publishRelease("v1.3.0", …)
// expect: fails with ReleaseExists { tag: "v1.3.0" }; no release is created, nothing is uploaded and nothing is changed
test("publishRelease — a tag that has a release fails with ReleaseExists and writes nothing", async () => {
  const server = fakeGitHub({ released: true });
  const failed = await using(server.fetch, () => failure(hostOf().publishRelease("v1.3.0", RELEASE)));
  assert.equal(failed?.name, "ReleaseExists");
  assert.equal(failed?.tag, "v1.3.0");
  assert.deepEqual(server.requests.filter((r) => r.method !== "GET"), []);
});

// TST-1048004 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a repository that has no tag v1.3.0
// input: publishRelease("v1.3.0", …)
// expect: fails with NotFound; nothing is written
test("publishRelease — a tag that does not stand fails with NotFound and writes nothing", async () => {
  const server = fakeGitHub({ tagStands: false });
  const failed = await using(server.fetch, () => failure(hostOf().publishRelease("v1.3.0", RELEASE)));
  assert.equal(failed?.name, "NotFound");
  assert.deepEqual(server.requests.filter((r) => r.method !== "GET"), []);
});

// TST-1048005 · level: unit · module: MOD-repository-hosts
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a repository whose server answers the upload of the second file with 500
// input: publishRelease("v1.3.0", …)
// expect: fails with UploadFailed { file: "agent-m-bridge-linux" }; the first file was uploaded, the release was never published (the events hold no publish), and the draft is not deleted
test("publishRelease — a failed upload leaves the draft unpublished and fails with UploadFailed naming the file", async () => {
  const server = fakeGitHub({ failUpload: LINUX.name });
  const failed = await using(server.fetch, () => failure(hostOf().publishRelease("v1.3.0", RELEASE)));
  assert.equal(failed?.name, "UploadFailed");
  assert.equal(failed?.file, LINUX.name);
  assert.deepEqual(server.events, ["create draft v1.3.0 Bridge 1.3.0", `upload ${WINDOWS.name}`, `upload ${LINUX.name}`]);
  assert.equal(server.draft.published, false);
  assert.equal(server.requests.filter((r) => r.method === "DELETE").length, 0);
});

// TST-1048006 · level: unit · module: MOD-repository-hosts
// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER
// given: known positive TST-1048001, where a server lets a release be published only once it holds both files; the same server, expecting three files, though only two are given
// input: publishRelease of two files
// expect: the publication is the last request, after both uploads, and the server refuses it (422) as incomplete: publishRelease fails and no release is published — a publication before the last upload would fail the same way
test("publishRelease — counter-proof: a release is published only after its last upload, and a server that holds fewer files than expected refuses the publication", async () => {
  const whole = fakeGitHub();
  await using(whole.fetch, () => hostOf().publishRelease("v1.3.0", RELEASE));
  assert.equal(whole.events.at(-1), "publish", "known positive: the publication is the last write");
  assert.ok(whole.events.indexOf("publish") > whole.events.lastIndexOf(`upload ${LINUX.name}`));
  const short = fakeGitHub({ expected: 3 });
  const failed = await using(short.fetch, () => failure(hostOf().publishRelease("v1.3.0", RELEASE)));
  assert.ok(failed instanceof Error, "the refused publication is a failure");
  assert.equal(short.draft.published, false);
});

// TST-1048007 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitLab project with a token, and a GitHub repository through a local clone without a token
// input: publishRelease on each
// expect: both fail with NotSupported, and no request goes out
test("publishRelease — on a GitLab server and through a clone without a token it is NotSupported, with no request", async () => {
  const server = fakeGitHub();
  const gitlab = connect(parseAddress("https://gitlab.rrze.fau.de/lme/speech-dlls"), { token: "glpat-PUBLISHER0123456789ab" });
  const clone = connect(parseAddress(WEB), { clone: "/tmp/a-clone" });
  for (const host of [gitlab, clone]) {
    const failed = await using(server.fetch, () => failure(host.publishRelease("v1.3.0", RELEASE)));
    assert.equal(failed?.name, "NotSupported");
  }
  assert.deepEqual(server.requests, []);
});
