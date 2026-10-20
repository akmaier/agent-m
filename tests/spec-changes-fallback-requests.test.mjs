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
    if (url.pathname === "/graphql") {
      // The batch request, as GitHub answers it: one aliased field for each path asked for, the whole text of the file it holds.
      const repository = {};
      for (const [, alias, expression] of JSON.parse(init.body).query.matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)) {
        const held = FILES[JSON.parse(expression).slice(41)];
        repository[alias] = held === undefined ? null : { text: held, isTruncated: false };
      }
      return json({ data: { rateLimit: { cost: 1, remaining: 4999 }, repository } });
    }
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
// The save of a section, or of the open entry, opened on the commit `openedHead` (OPENED, the default branch's HEAD, or null for an empty repository).
const section = (openedHead = OPENED) => (host) => proposeSection(host, { target: "SPEC.md", anchor: "## 1. Reading", until: null, text: READING_EDITED, why: "A reader needs to know why a file cannot be read.",
  origin: "an issue of a reader", person: "alice", openedBlob: gitBlob(READING), openedHead });
const entry = (openedHead = OPENED) => (host) => saveEntry(host, { queue: QUEUE, entry: 1, text: READING_EDITED.replace("whole,", "whole;"), why: "A semicolon reads better.", person: "alice",
  openedBlob: gitBlob(READING_EDITED), openedHead });
const atOpened = (requests) => requests.filter((request) => request.includes(OPENED));

// TST-611009 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-018
// given: the fake GitHub at two commits, OPENED the one the edit was opened on and HEAD the default branch's head; a section edited
// input: one click, proposeSection, without a token and with one
// expect: without a token GitHub's pages are returned; opened on OPENED, exactly two requests name OPENED — its commit and its tree — and the click sends 9 requests (proposeSection) or 11 (saveEntry); opened on HEAD, 7 or 9; with a token a commit is made and no request names OPENED
test("proposeSection — a save without a token sends two requests at the commit the edit was opened on, a save with a token none", async () => {
  const without = await click(section(), { token: false });
  assert.ok(Array.isArray(without.result.fallback), "known positive: the pages are returned");
  assert.deepEqual(atOpened(without.requests), [`GET https://api.github.com/repos/alice/product/commits/${OPENED}`, `GET https://api.github.com/repos/alice/product/git/trees/${OPENED}?recursive=1`]);
  assert.equal(without.requests.length, 9, "an edit opened on an earlier commit: 7 and the 2 for that commit");
  assert.equal((await click(section(HEAD), { token: false })).requests.length, 7, "an edit opened on the current head reads nothing more");
  const withToken = await click(section(), { token: true });
  assert.equal(typeof withToken.result.commit, "string", "known positive: a commit is made");
  assert.deepEqual(atOpened(withToken.requests), []);
});

// TST-611010 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-018
// given: the fake GitHub as in TST-611009, and an open entry
// input: one click, saveEntry, without a token and with one
// expect: without a token GitHub's pages are returned; opened on OPENED, exactly two requests name OPENED — its commit and its tree — and the click sends 9 requests (proposeSection) or 11 (saveEntry); opened on HEAD, 7 or 9; with a token a commit is made and no request names OPENED
test("saveEntry — a save without a token sends two requests at the commit the edit was opened on, a save with a token none", async () => {
  const without = await click(entry(), { token: false });
  assert.ok(Array.isArray(without.result.fallback), "known positive: the pages are returned");
  assert.deepEqual(atOpened(without.requests), [`GET https://api.github.com/repos/alice/product/commits/${OPENED}`, `GET https://api.github.com/repos/alice/product/git/trees/${OPENED}?recursive=1`]);
  assert.equal(without.requests.length, 11, "an edit opened on an earlier commit: 9 and the 2 for that commit");
  assert.equal((await click(entry(HEAD), { token: false })).requests.length, 9, "an edit opened on the current head reads nothing more");
  const withToken = await click(entry(), { token: true });
  assert.equal(typeof withToken.result.commit, "string", "known positive: a commit is made");
  assert.deepEqual(atOpened(withToken.requests), []);
});

// TST-611011 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: the fake GitHub as in TST-611009
// input: one click each of proposeSection and saveEntry, without a token for an edit opened on an earlier commit, on the current head and on no commit (null, an empty repository), and with a token
// expect: without a token for an earlier commit 9 requests for proposeSection and 11 for saveEntry — the 7 and 9 of the edit opened on the current head, which reads nothing more, and the 2 for the earlier commit and its tree; for null 7 and 9, as nothing is read; with a token 11 and 13: the repository's information, commit and tree (3), `SPEC.md` by its own read (1) in the click of proposeSection, the queue's two files in one batch (1) and the trace graph's use case in one batch (1), and the 5 requests of the commit (ref, commit, tree, new commit, ref update) for proposeSection (13 for saveEntry, which instead reads the target `SPEC.md` in a batch of the queue read, and its entry's two files by their own reads)
test("proposeSection and saveEntry — the requests of a whole click, without a token and with one", async () => {
  const counts = async (token, openedHead) => ({ section: (await click(section(openedHead), { token })).requests.length, entry: (await click(entry(openedHead), { token })).requests.length });
  assert.deepEqual({ earlier: await counts(false, OPENED), current: await counts(false, HEAD), empty: await counts(false, null), withToken: await counts(true, OPENED) },
    { earlier: { section: 9, entry: 11 }, current: { section: 7, entry: 9 }, empty: { section: 7, entry: 9 }, withToken: { section: 11, entry: 13 } });
});

// TST-611012 · level: unit · module: MOD-spec-changes
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-018
// given: the fake GitHub as in TST-611009, and an open entry; the edit opened on no commit (null, an empty repository)
// input: one click, saveEntry, without a token
// expect: no request names OPENED; both files of the entry did not exist when the edit began, so both pages are GitHub's new-file pages and differs is true for both, since both exist on the default branch
test("saveEntry — an edit opened on no commit holds no file: every page is a new-file page that differs, and nothing is read for it", async () => {
  const { requests, result } = await click(entry(null), { token: false });
  assert.deepEqual(atOpened(requests), []);
  assert.deepEqual(result.fallback.map((page) => [page.path, page.url.split("/").slice(3, 6).join("/"), page.differs]),
    [[`${QUEUE}/01-reading.md`, "alice/product/new", true], [`${QUEUE}/01-reading.begruendung.md`, "alice/product/new", true]]);
});
