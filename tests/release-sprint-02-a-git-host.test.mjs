// Release tests of sprint 02, strand A — the read that moved into the git host (ITM-130, ITM-142). Written by tester-opus
// (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of strand A, from the SPEC and the accepted
// module file alone; started on sprint/02 at 3ba86fb (the merge of ITM-136, the strand's last item), 2026-10-01.
//
// Module: MOD-git-host
// Guards: EVERY ARTIFACT NAMES ITS ORIGIN; AN APPROVAL NAMES THE EXACT TEXT; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; GITLAB PRODUCTS ARE SUPPORTED
// Level: release
//
// ITM-130: the kernel's reads "move into the git host where MOD-git-host already provides them (readBlob is in its provides)".
// MOD-git-host declares `readBlob({ product, blob, token }) -> text` — "a text by its blob SHA; refused unless it hashes to that
// SHA" — and sends each token "only as the authorisation header of requests to the API of the server that issued it". The
// servers are fakes of `fetch`; nothing leaves the process. Every case states its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readBlob, parseProductAddress } from "../docs/assets/git-host.mjs";

const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0`).update(t).digest("hex");
const TEXT = "kind: use-case\nfile: docs/use-cases/UC-001-read.md\nblob: 0123\n";
const GH_TOKEN = "github_pat_STRANDA0123456789abcdefghij", GL_TOKEN = "glpat-STRANDA0123456789abcdef";
const GITHUB = parseProductAddress("https://github.com/alice/thesis-tool");
const GITLAB = parseProductAddress("https://gitlab.example.org/team/proj");

// A server that answers every blob with `answer`, recording each request and the credentials it carried.
function serve(answer) {
  const sent = [];
  globalThis.fetch = async (u, init = {}) => {
    const h = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    const url = new URL(String(u));
    sent.push({ origin: url.origin, path: url.pathname, auth: h.authorization ?? null, privateToken: h["private-token"] ?? null });
    if (url.origin === "https://api.github.com") {
      return new Response(JSON.stringify({ encoding: "base64", content: Buffer.from(answer).toString("base64") }), { status: 200 });
    }
    return new Response(answer, { status: 200 });
  };
  return sent;
}

// MOD-git-host readBlob · AN APPROVAL NAMES THE EXACT TEXT — Expected: on GitHub and on a GitLab server, readBlob returns the
// text its server answers for a blob SHA when that text hashes to the SHA, byte for byte; when the server answers another text,
// it refuses — an error, no text. Each read goes to its own server's API, the GitHub token only to api.github.com, the GitLab
// project token only to that GitLab server.
test("release · ITM-130 readBlob: a blob's text on either host, refused unless it hashes to that SHA; each token to its own server", async () => {
  const realFetch = globalThis.fetch;
  try {
    for (const [product, token] of [[GITHUB, GH_TOKEN], [GITLAB, GL_TOKEN]]) {
      const sent = serve(TEXT);
      assert.equal(await readBlob({ product, blob: blobSha(TEXT), token }), TEXT, `${product.address}: known positive, the true text`);
      assert.equal(sent.length, 1);
      if (product === GITHUB) {
        assert.equal(sent[0].origin, "https://api.github.com");
        assert.ok(String(sent[0].auth).includes(GH_TOKEN) && sent[0].privateToken === null, "the GitHub token, to GitHub");
      } else {
        assert.equal(sent[0].origin, "https://gitlab.example.org");
        assert.ok(String(sent[0].privateToken ?? sent[0].auth).includes(GL_TOKEN), "the project token, to its server");
        assert.ok(!String(sent[0].auth ?? "").includes(GH_TOKEN));
      }
      serve("A FORGED TEXT\n");
      const e = await readBlob({ product, blob: blobSha(TEXT), token }).then((t) => ({ text: t }), (x) => x);
      assert.ok(e instanceof Error, `${product.address}: refused, not ${JSON.stringify(e)}`);
    }
  } finally { globalThis.fetch = realFetch; }
});
