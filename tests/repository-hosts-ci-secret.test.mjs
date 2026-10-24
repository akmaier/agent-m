// MOD-repository-hosts' setCiSecret: a CI secret stored in a GitHub repository's Actions secrets, its value sealed to the repository's public key as libsodium's
// crypto_box_seal seals it. GitHub: "Get a repository public key" (GET /repos/{owner}/{repo}/actions/secrets/public-key: key_id and key, base64) and "Create or update a
// repository secret" (PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}, body encrypted_value and key_id; 201 created, 204 updated), docs.github.com/en/rest/actions/secrets.
// Deterministic, no network: GitHub is a fake of `fetch`; the value is a fixture, never a real key.
// Run: node --test tests/repository-hosts-ci-secret.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL; A REMOTE INTERFACE NAMES HOW IT FAILS; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: unit
//
// The libsodium vector of TST-1200104 was made once with PyNaCl 1.6.2 (libsodium's SealedBox.encrypt) for the secret key 01 02 … 20; it shows that the convention of
// sealed-box.mjs — the nonce BLAKE2b-192 of the ephemeral and the recipient's public key — is libsodium's own.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";
import { sealToBase64 } from "../src/repository-hosts/sealed-box.mjs";
import { blake2b, box, scalarMultBase } from "../src/repository-hosts/vendor/nacl-blake.mjs";

const TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const VALUE = "nvapi-FIXTURE-VALUE-0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const SECRETS = "https://api.github.com/repos/carol/sprint-tool/actions/secrets";
const fromBase64 = (text) => Uint8Array.from(Buffer.from(text, "base64"));
const RECIPIENT_SECRET = Uint8Array.from({ length: 32 }, (_, at) => at + 1);
const RECIPIENT_PUBLIC = Buffer.from(scalarMultBase(RECIPIENT_SECRET)).toString("base64");

// Opens a sealed box with the recipient's secret key, as libsodium's crypto_box_seal_open does.
function open(sealedBase64, secretKey) {
  const sealed = fromBase64(sealedBase64), ephemeral = sealed.subarray(0, 32), both = new Uint8Array(64);
  both.set(ephemeral);
  both.set(scalarMultBase(secretKey), 32);
  const opened = box.open(sealed.subarray(32), blake2b(both, undefined, 24), ephemeral, secretKey);
  return opened === null ? null : new TextDecoder().decode(opened);
}

function seen(input, init = {}) {
  const url = new URL(String(input));
  const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { method: String(init.method ?? "GET").toUpperCase(), href: url.href, headers, body: typeof init.body === "string" ? JSON.parse(init.body) : null };
}
const json = (status, body) => new Response(body === null ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init) => { const r = seen(input, init); requests.push(r); return answer(r); };
  try { return { result: await run().then((value) => ({ value }), (error) => ({ error })), requests }; } finally { globalThis.fetch = real; }
}
const github = (putStatus = 201) => (r) => (r.method === "GET" && r.href === `${SECRETS}/public-key` ? json(200, { key_id: "568250167242549743", key: RECIPIENT_PUBLIC })
  : r.method === "PUT" && r.href === `${SECRETS}/NVIDIA_API_KEY` ? json(putStatus, putStatus === 204 ? null : {}) : json(404, { message: "Not Found" }));

// TST-1200101 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a GitHub repository, the person's token, and a server that answers the repository's public key and 201 to the PUT
// input: setCiSecret("NVIDIA_API_KEY", VALUE)
// expect: two requests to GitHub's API of that repository, each with the token as a Bearer header: GET …/actions/secrets/public-key, then PUT …/actions/secrets/NVIDIA_API_KEY with key_id and encrypted_value; the encrypted value opens with the recipient's secret key to VALUE; VALUE is in no address and in no body in the clear
test("setCiSecret on GitHub — the value sealed to the repository's public key, sent only in the body of the PUT", async () => {
  const host = connect(GITHUB, { token: TOKEN });
  const { result, requests } = await serving(github(), () => host.setCiSecret("NVIDIA_API_KEY", VALUE));
  assert.equal(result.error, undefined, String(result.error));
  assert.deepEqual(requests.map((r) => [r.method, r.href]), [["GET", `${SECRETS}/public-key`], ["PUT", `${SECRETS}/NVIDIA_API_KEY`]]);
  for (const r of requests) assert.equal(r.headers.authorization, `Bearer ${TOKEN}`);
  assert.equal(requests[1].body.key_id, "568250167242549743");
  assert.equal(open(requests[1].body.encrypted_value, RECIPIENT_SECRET), VALUE);
  assert.equal(requests.some((r) => r.href.includes(VALUE) || JSON.stringify(r.body ?? {}).includes(VALUE)), false);
  assert.equal(open(requests[1].body.encrypted_value, Uint8Array.from({ length: 32 }, () => 7)), null, "counter-proof: another secret key does not open it");
});

// TST-1200102 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: known positive TST-1200101; then a server that answers 403 to the public key (a token without the permission Secrets)
// input: setCiSecret("NVIDIA_API_KEY", VALUE)
// expect: PermissionMissing whose permission is "Secrets" and whose message names it; no PUT was made
test("setCiSecret on GitHub — a token without the permission Secrets is PermissionMissing, naming it", async () => {
  const host = connect(GITHUB, { token: TOKEN });
  assert.equal((await serving(github(204), () => host.setCiSecret("NVIDIA_API_KEY", VALUE))).result.error, undefined, "known positive: an update answered 204");
  const { result, requests } = await serving(() => json(403, { message: "Resource not accessible by personal access token" }), () => host.setCiSecret("NVIDIA_API_KEY", VALUE));
  assert.equal(result.error?.name, "PermissionMissing");
  assert.equal(result.error.permission, "Secrets");
  assert.match(result.error.message, /Secrets/);
  assert.equal(requests.some((r) => r.method === "PUT"), false);
});

// TST-1200103 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub repository without a token; a GitLab project with its token; a GitHub repository with a token
// input: setCiSecret("NVIDIA_API_KEY", VALUE) on the first two; setCiSecret("GITHUB_TOKEN", VALUE) and setCiSecret("NOT A NAME", VALUE) on the third
// expect: NotSupported for the first two and TypeError for the names, each before any request
test("setCiSecret — refused before any request without a token, on GitLab, and for a name that is no plain name or begins with GITHUB_", async () => {
  const cases = [[connect(GITHUB, {}), "NVIDIA_API_KEY", "NotSupported"],
    [connect(parseAddress("https://gitlab.example.org/space/sprint-tool"), { token: "glpat-SPACEsprintTOOLvalue0123456789" }), "NVIDIA_API_KEY", "NotSupported"],
    [connect(GITHUB, { token: TOKEN }), "GITHUB_TOKEN", "TypeError"], [connect(GITHUB, { token: TOKEN }), "NOT A NAME", "TypeError"]];
  for (const [host, name, failure] of cases) {
    const { result, requests } = await serving(github(), () => host.setCiSecret(name, VALUE));
    assert.equal(result.error?.name, failure, name);
    assert.deepEqual(requests, [], name);
  }
});

// TST-1200104 · level: unit · module: MOD-repository-hosts
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a sealed box libsodium made (PyNaCl's SealedBox.encrypt) for the public key of the secret key 01 02 … 20; and sealToBase64 of a value for that public key
// input: open each with the secret key, by sealed-box.mjs's convention
// expect: libsodium's box opens to "sk-LIBSODIUM-VECTOR-1", so the convention is libsodium's; sealToBase64's opens to the value; two seals of one value differ (a new ephemeral key each time)
test("sealToBase64 — the sealed box of libsodium's crypto_box_seal", () => {
  assert.equal(RECIPIENT_PUBLIC, "B6N8vBQgk8i3VdwbEOhstCY3StFqqFPtC9/AsrhtHHw=");
  assert.equal(open("/qRQvhVxnl9sz8AX5hWtJiHd79FMP6bVciRzDT8yawL0DtpazfGT5BF3laF5tTYhJWaQcufBI3c2ATTomQFjITpKMonO", RECIPIENT_SECRET), "sk-LIBSODIUM-VECTOR-1");
  const sealed = sealToBase64(VALUE, RECIPIENT_PUBLIC);
  assert.equal(open(sealed, RECIPIENT_SECRET), VALUE);
  assert.notEqual(sealToBase64(VALUE, RECIPIENT_PUBLIC), sealed);
  assert.throws(() => sealToBase64(VALUE, Buffer.from("short").toString("base64")), TypeError);
});
