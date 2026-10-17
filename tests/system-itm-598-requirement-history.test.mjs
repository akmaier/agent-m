// What an opened requirement shows of its history, through the dashboard's #spec (ITM-598): the history of SPEC.md is read when a requirement is
// opened and not when the tree is drawn, and kept for every later opening.
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// Level: system
//
// The page is the real #spec of the dashboard on the harness's repository server, which counts every request it answers. The server of this file adds
// what the harness does not serve: the commits of SPEC.md and, for each, the files it changed, its commit, its tree and the SPEC at it. A request
// `handler GET …` is one of those. The fixture has two commits of SPEC.md: h1 wrote it before any record, h2 changed the rule of HISTORIC RULE and
// added the record of its section. The expected requests are written in each case: one list of the commits, then for each of the two commits the
// files it changed, the commit and its tree, and the SPEC at h1 — eight requests. The SPEC at h2 is the head's, which drawing read already, and a
// text is read once by its blob. The same count holds with and without a token, since the SPEC at a commit is a file read that a batch cannot
// serve (a batch serves the head).

import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { TOKEN, openDashboard, repoServer } from "./app-harness.mjs";

const blobOf = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0${text}`).digest("hex");
const SPEC = (rule) => `# History fixture\n\n## A section\n\n**HISTORIC RULE** *(Source)*\n${rule}\n*Check:* at review.\n`;
const SECTION = (rule) => SPEC(rule).slice(SPEC(rule).indexOf("## A section"));
const H1 = "1a2b3c4d5e6f".padEnd(40, "0"), H2 = "9f8e7d6c5b4a".padEnd(40, "0");
const RECORD = `docs/approvals/spec-2026-10-01_historic-01-${blobOf(SECTION("The rule now.")).slice(0, 12)}.md`;
const API = "/repos/akmaier/agent-m";
const AT = { [H1]: { "SPEC.md": SPEC("The rule first.") }, [H2]: { "SPEC.md": SPEC("The rule now."), [RECORD]: "kind: spec\n" } };
const FILES = { "SPEC.md": SPEC("The rule now.") };

// The commits of SPEC.md, newest first, and what a request about one of them asks: its files, its commit, its tree, its SPEC.
async function history(url, init) {
  const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
  const listed = (sha, login, date, parents) => ({ sha, parents: parents.map((parent) => ({ sha: parent })), author: { login },
    commit: { author: { name: "A. Maier" }, committer: { date }, message: "" } });
  if (init.method !== "GET") return null;
  if (url.origin === "https://api.github.com" && url.pathname === `${API}/commits` && url.searchParams.get("path") === "SPEC.md") {
    return json([listed(H2, "akmaier", "2026-10-01T08:00:00Z", [H1]), listed(H1, "akmaier", "2026-09-23T12:17:09Z", [])]);
  }
  const sha = [H1, H2].find((candidate) => url.pathname.includes(candidate) || url.searchParams.get("ref") === candidate);
  if (!sha) return null;
  if (url.origin === "https://raw.githubusercontent.com" || url.pathname.startsWith(`${API}/contents/`)) return new Response(AT[sha]["SPEC.md"], { status: 200 });
  if (url.pathname === `${API}/commits/${sha}` && url.searchParams.has("per_page")) {
    return json({ files: [{ filename: "SPEC.md", status: sha === H1 ? "added" : "modified" }, ...(sha === H2 ? [{ filename: RECORD, status: "added" }] : [])] });
  }
  if (url.pathname === `${API}/commits/${sha}`) return json({ sha });
  if (url.pathname.startsWith(`${API}/git/trees/`)) {
    return json({ sha: "t".repeat(40), truncated: false, tree: Object.keys(AT[sha]).map((path) => ({ path, mode: "100644", type: "blob", sha: blobOf(AT[sha][path]) })) });
  }
  return null;
}
const historyRequests = (requests) => requests.filter((request) => request.startsWith("handler GET"));

async function scenario(token) {
  const server = await repoServer({ files: FILES, handlers: [history] });
  const page = await openDashboard({ server, hash: "#spec", token });
  assert.deepEqual(historyRequests(page.requests), [], "drawing #spec reads no history");
  const opening = await page.click("button.requirement-name");
  assert.equal(historyRequests(opening).length, 8);
  const html = page.main();
  for (const shown of ["2026-09-23T12:17:09Z — akmaier — commit 1a2b3c4d5e6f", "2026-10-01T08:00:00Z — akmaier — commit 9f8e7d6c5b4a", `Record ${RECORD}`,
    "No approval record names this commit."]) assert.equal(html.includes(shown), true, `the page shows ${shown}`);
  assert.deepEqual(await page.click("button.requirement-name"), [], "closing requests nothing");
  assert.deepEqual(await page.click("button.requirement-name"), [], "opening again requests nothing");
  assert.deepEqual(server.writes, []);
}

// CASE ITM-598-SYSTEM-01
// TST-598201 · level: system · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the dashboard without a token on a repository whose SPEC.md has two commits, h1 and h2
// input: the real #spec drawn; its requirement opened; closed; opened again
// expect: drawing makes no request about the history; opening makes exactly eight, and the page then shows both commits (2026-09-23T12:17:09Z … commit 1a2b3c4d5e6f, 2026-10-01T08:00:00Z … commit 9f8e7d6c5b4a), the record of h2 and the line that no record names h1; closing and opening again make none; nothing is written
test("the dashboard reads the history when a requirement is opened, not when #spec is drawn, and not again on the next opening", async () => {
  await scenario(null);
});

// CASE ITM-598-SYSTEM-02
// TST-598202 · level: system · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: the dashboard with a stored token on the same repository
// input: the real #spec drawn; its requirement opened; closed; opened again
// expect: as without a token: no request about the history while drawing, exactly eight while opening, none on closing and opening again
test("the dashboard with a token reads the same history in as many requests", async () => {
  await scenario(TOKEN);
});
