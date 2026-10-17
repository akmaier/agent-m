// The requests a save of a SPEC section makes to GitHub, with and without a token (ITM-611) — MOD-spec-changes' `proposeSection` and `saveEntry` over MOD-repository-hosts' real GitHub host, on a fake
// GitHub that answers as GitHub's REST API answers and records every request. Without a token the two functions return GitHub's pages for the files of the entry, each page's `differs` saying whether its
// file exists on the default branch otherwise than at `openedHead`, the commit the edit was opened on; so they read the repository at that commit, which is a request for the commit and one for its tree.
// With a token they commit, and read nothing at `openedHead`.
// Run: node --test tests/spec-changes-fallback-requests.test.mjs
//
// Module: MOD-spec-changes
// Guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A SPEC EDIT IS SAVED AS A PROPOSAL
// Level: unit
//
// The repository is a fixture this file builds, never Agent M's own: a SPEC of two sections and a use case, and for `saveEntry` a queue of one open entry. It stands at two commits, the one the edit was
// opened on (OPENED) and the default branch's head now (HEAD), both holding the same files. Nothing reaches the network: `fetch` is the fake GitHub for the length of each case. Where the module file
// leaves a reading open, the test states the one it takes, and the pull request names it:
//   - A request "at OPENED" is one whose address names the commit OPENED: the commit itself and its tree.
//   - A click is one call of `proposeSection` or `saveEntry`; the count is of the requests that call sends, those of finding the repository's head, reading its files and building the pages included.
// Each case states its expected counts before it runs. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { proposeSection, saveEntry } from "../src/spec-changes/index.mjs";

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const ADDRESS = "https://github.com/alice/product";
const TOKEN = "github_pat_ALICEfallbackREQUESTS0123456789abcdef";
const OPENED = "a".repeat(40), HEAD = "b".repeat(40);
const TODAY = new Date().toISOString().slice(0, 10);

const READING = text("## 1. Reading", "", "**A SAMPLE RULE** *(Product Owner)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "");
const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Product Owner)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const READING_EDITED = READING.replace("whole.", "whole, or says why not.");
const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const FILES = {
  "SPEC.md": text("# Fixture — Specification", "") + READING + WRITING,
  "docs/use-cases/UC-001-read-a-file.md": text("---", "id: UC-001", "title: Read a file", "area: reading", "actors:", "  - Reader", "realises:", "  - A SAMPLE RULE", "---", "# UC-001 Read a file", "", "**Goal.** Read a file."),
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 01 | `SPEC.md` | ## 1. Reading | — | — |"),
  [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 sample", "", "Append-only."),
  [`${QUEUE}/01-reading.md`]: READING_EDITED,
  [`${QUEUE}/01-reading.begruendung.md`]: text("# 1. Reading: A SAMPLE RULE", "", "**The change.** Changes A SAMPLE RULE.", "", "**Why.** A sample.", "", "**Impact list.**", "- A SAMPLE RULE: changed; named by UC-001.", "",
    "**Origin.** an issue of a reader; saved by alice."),
};

// A fake GitHub holding FILES at OPENED and at HEAD; `push` is whether the token may write. Every request is recorded as its method and address.
function fakeGitHub({ push }) {
  const requests = [];
  const prefix = "/repos/alice/product";
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method ?? "GET";
    requests.push(`${method} ${url.origin}${url.pathname}${url.search}`);
    if (url.origin === "https://raw.githubusercontent.com") {
      const body = FILES[decodeURIComponent(url.pathname.split("/").slice(4).join("/"))];
      return body === undefined ? json({ message: "Not Found" }, 404) : new Response(body);
    }
    if (url.origin !== "https://api.github.com") return json({ message: "Not Found" }, 404);
    if (url.pathname === "/graphql") return json({ data: { rateLimit: { cost: 1, remaining: 4999 }, repository: {} } });
    if (url.pathname === prefix) return json({ default_branch: "main", visibility: "public", private: false, permissions: { push }, archived: false, description: "" });
    if (url.pathname === `${prefix}/commits/main`) return json({ sha: HEAD, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/commits/${OPENED}`) return json({ sha: OPENED, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${HEAD}` || url.pathname === `${prefix}/git/trees/${OPENED}`) {
      return json({ tree: Object.entries(FILES).map(([path, body]) => ({ path, type: "blob", sha: gitBlob(body) })) });
    }
    if (url.pathname.startsWith(`${prefix}/contents/`)) {
      const body = FILES[decodeURIComponent(url.pathname.slice(`${prefix}/contents/`.length))];
      return body === undefined ? json({ message: "Not Found" }, 404) : new Response(body);
    }
    if (url.pathname === `${prefix}/git/ref/heads/main`) return json({ object: { sha: HEAD } });
    if (url.pathname === `${prefix}/git/commits/${HEAD}`) return json({ tree: { sha: "t" } });
    if (url.pathname === `${prefix}/git/trees` && method === "POST") return json({ sha: "t2" });
    if (url.pathname === `${prefix}/git/commits` && method === "POST") return json({ sha: "c2" });
    if (url.pathname === `${prefix}/git/refs/heads/main` && method === "PATCH") return json({});
    return json({ message: "Not Found" }, 404);
  };
  return { fetch, requests };
}

// One click on Save over the real GitHub host, with or without a token -> the requests it sent and its result.
async function click(save, { token }) {
  const fake = fakeGitHub({ push: token });
  const real = globalThis.fetch;
  globalThis.fetch = fake.fetch;
  try {
    const host = connect(parseAddress(ADDRESS), token ? { token: TOKEN } : {});
    const result = await save(host);
    return { requests: fake.requests, result };
  } finally {
    globalThis.fetch = real;
  }
}
const section = (host) => proposeSection(host, { target: "SPEC.md", anchor: "## 1. Reading", until: null, text: READING_EDITED, why: "A reader needs to know why a file cannot be read.",
  origin: "an issue of a reader", person: "alice", openedBlob: gitBlob(READING), openedHead: OPENED });
const entry = (host) => saveEntry(host, { queue: QUEUE, entry: 1, text: READING_EDITED.replace("whole,", "whole;"), why: "A semicolon reads better.", person: "alice",
  openedBlob: gitBlob(READING_EDITED), openedHead: OPENED });
const atOpened = (requests) => requests.filter((request) => request.includes(OPENED));

// TST-611009 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-018 4a
// given: the fake GitHub at two commits, OPENED the one the edit was opened on and HEAD the default branch's head; a section edited
// input: one click, proposeSection, without a token and with one
// expect: without a token GitHub's pages are returned and exactly two requests name OPENED — its commit and its tree; with a token a commit is made and no request names OPENED
test("proposeSection — a save without a token sends two requests at the commit the edit was opened on, a save with a token none", async () => {
  const without = await click(section, { token: false });
  assert.ok(Array.isArray(without.result.fallback), "known positive: the pages are returned");
  assert.deepEqual(atOpened(without.requests), [`GET https://api.github.com/repos/alice/product/commits/${OPENED}`, `GET https://api.github.com/repos/alice/product/git/trees/${OPENED}?recursive=1`]);
  const withToken = await click(section, { token: true });
  assert.equal(typeof withToken.result.commit, "string", "known positive: a commit is made");
  assert.deepEqual(atOpened(withToken.requests), []);
});

// TST-611010 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-018 4a
// given: the fake GitHub as in TST-611009, and an open entry
// input: one click, saveEntry, without a token and with one
// expect: without a token GitHub's pages are returned and exactly two requests name OPENED — its commit and its tree; with a token a commit is made and no request names OPENED
test("saveEntry — a save without a token sends two requests at the commit the edit was opened on, a save with a token none", async () => {
  const without = await click(entry, { token: false });
  assert.ok(Array.isArray(without.result.fallback), "known positive: the pages are returned");
  assert.deepEqual(atOpened(without.requests), [`GET https://api.github.com/repos/alice/product/commits/${OPENED}`, `GET https://api.github.com/repos/alice/product/git/trees/${OPENED}?recursive=1`]);
  const withToken = await click(entry, { token: true });
  assert.equal(typeof withToken.result.commit, "string", "known positive: a commit is made");
  assert.deepEqual(atOpened(withToken.requests), []);
});

// TST-611011 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018 4a
// given: the fake GitHub as in TST-611009
// input: one click each of proposeSection and saveEntry, without a token and with one
// expect: without a token 9 requests for proposeSection and 11 for saveEntry — the 7 and 9 that the same fixture costs when no page is built from the commit the edit began on, and the 2 for that commit and its tree; with a token 13 and 15, as before
test("proposeSection and saveEntry — the requests of a whole click, without a token and with one", async () => {
  const counts = async (token) => ({ section: (await click(section, { token })).requests.length, entry: (await click(entry, { token })).requests.length });
  assert.deepEqual({ without: await counts(false), withToken: await counts(true) }, { without: { section: 9, entry: 11 }, withToken: { section: 13, entry: 15 } });
});
