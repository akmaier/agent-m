// The requests an acceptance of entries from several queues makes to GitHub, with a token — MOD-spec-changes' `acceptEntries` over MOD-repository-hosts' real GitHub host,
// on a fake GitHub that answers as GitHub's REST API and GraphQL API answer and records every file it is asked for. Two queues name the same target, SPEC.md; a file whose
// blob the acceptance has read is not read again, so each file is asked for once, however many queues name it.
// Run: node --test tests/spec-changes-accept-batched.test.mjs
//
// Module: MOD-spec-changes · MOD-repository-hosts
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A QUEUE IS ACCEPTED IN ITS ORDER; UC-006
// Level: component
//
// The product is a fixture this file builds: a SPEC of two sections, a register of one source that the product links, and two queues, 2026-03-01_a and 2026-03-02_b, of one open entry each: entry 01 of
// the first replaces "## 1. Reading", entry 01 of the second "## 2. Writing", both in SPEC.md. The acceptance shows both entries, as the page does. Nothing reaches the network: `fetch` is the
// fake GitHub for the length of the case. The case states its expected result before it runs. The counter-proof is in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import { acceptEntries } from "../src/spec-changes/index.mjs";

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const TOKEN = "github_pat_ALICEacceptBATCHED0123456789abcdefghijk";
const HEAD = "b".repeat(40);

const READING = text("## 1. Reading", "", "**A SAMPLE RULE** *(Fixture PO)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "");
const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const READING_NEW = READING.replace("whole.", "entirely.");
const WRITING_NEW = WRITING.replace("whole.", "entirely.");
const SPEC = text("# Fixture product - Specification", "") + READING + WRITING;

const ENTRY_PO = text("---", "id: SRC-fixture-po", "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished - fixture", "---", "# SRC-fixture-po Fixture PO", "", "A fixture source.");
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-fixture-po | 2026-10-05 | ${"0".repeat(64)} | |`);
const sources = () => ({ links: readDocument(sourceSchemas().links, "docs/sources.md", LINKS), register: [readDocument(sourceSchemas().entry, "docs/sources/SRC-fixture-po.md", ENTRY_PO)] });

const QUEUES = [["2026-03-01_a", "## 1. Reading", READING_NEW, READING], ["2026-03-02_b", "## 2. Writing", WRITING_NEW, WRITING]];
const FILES = { "SPEC.md": SPEC, "docs/sources.md": LINKS, "docs/sources/SRC-fixture-po.md": ENTRY_PO };
for (const [folder, anchor, proposal] of QUEUES) {
  const base = `docs/spec-freigaben/${folder}`;
  FILES[`${base}/index.md`] = text(`# SPEC approvals - queue ${folder.slice(0, 10)} · ${folder.slice(11)}`, "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", `| 01 | \`SPEC.md\` | ${anchor} | — | — |`);
  FILES[`${base}/entscheidungen.md`] = text(`# Decisions - queue ${folder}`, "", "Append-only.");
  FILES[`${base}/01-entry.md`] = proposal;
  FILES[`${base}/01-entry.begruendung.md`] = text(`# ${anchor}: a change`, "", "**The change.** A sample.");
}

// A fake GitHub holding FILES at HEAD. Every file it is asked for — by an aliased field of a GraphQL query or by a contents request — is recorded by its path.
function fakeGitHub() {
  const asked = [];
  const prefix = "/repos/alice/product";
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method ?? "GET";
    if (url.origin !== "https://api.github.com") return json({ message: "Not Found" }, 404);
    if (url.pathname === "/graphql") {
      const repository = {};
      for (const [, alias, expression] of JSON.parse(init.body).query.matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)) {
        const path = JSON.parse(expression).slice(41);
        asked.push(path);
        repository[alias] = FILES[path] === undefined ? null : { text: FILES[path], isTruncated: false };
      }
      return json({ data: { rateLimit: { cost: 1, remaining: 4999 }, repository } });
    }
    if (url.pathname === prefix) return json({ default_branch: "main", visibility: "public", private: false, permissions: { push: true }, archived: false, description: "" });
    if (url.pathname === `${prefix}/commits/main`) return json({ sha: HEAD, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${HEAD}`) return json({ tree: Object.entries(FILES).map(([path, body]) => ({ path, type: "blob", sha: gitBlob(body) })) });
    if (url.pathname.startsWith(`${prefix}/contents/`)) {
      const path = decodeURIComponent(url.pathname.slice(`${prefix}/contents/`.length));
      asked.push(path);
      return FILES[path] === undefined ? json({ message: "Not Found" }, 404) : new Response(FILES[path]);
    }
    if (url.pathname === `${prefix}/git/ref/heads/main`) return json({ object: { sha: HEAD } });
    if (url.pathname === `${prefix}/git/commits/${HEAD}`) return json({ tree: { sha: "t" } });
    if (url.pathname === `${prefix}/git/trees` && method === "POST") return json({ sha: "t2" });
    if (url.pathname === `${prefix}/git/commits` && method === "POST") return json({ sha: "c2" });
    if (url.pathname === `${prefix}/git/refs/heads/main` && method === "PATCH") return json({});
    return json({ message: "Not Found" }, 404);
  };
  return { fetch, asked };
}

// TST-677005 · level: component · module: MOD-spec-changes; MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A QUEUE IS ACCEPTED IN ITS ORDER; UC-006 4d
// given: a product on GitHub with two queues of one open entry each, both naming SPEC.md as their target, and the reader's token
// input: acceptEntries of entry 01 of each queue
// expect: one commit is made; each file is asked for exactly once: SPEC.md once, and not once for each queue, and none of the 8 files of the two queues (index, decisions, proposal, rationale of each) twice
test("TST-677005: an acceptance across two queues that name SPEC.md asks for each file once", async () => {
  const fake = fakeGitHub();
  const real = globalThis.fetch;
  globalThis.fetch = fake.fetch;
  try {
    const host = connect(parseAddress("https://github.com/alice/product"), { token: TOKEN });
    const shown = QUEUES.map(([folder, , proposal, section]) => ({ queue: `docs/spec-freigaben/${folder}`, entry: 1, proposalBlob: gitBlob(proposal), sectionBlob: gitBlob(section) }));
    const result = await acceptEntries(host, shown, "alice", new Date("2026-03-03T10:00:00Z"), sources());
    assert.equal(typeof result.commit, "string", "known positive: the entries are accepted");
  } finally {
    globalThis.fetch = real;
  }
  assert.equal(fake.asked.filter((path) => path === "SPEC.md").length, 1);
  const twice = fake.asked.filter((path, at) => fake.asked.indexOf(path) !== at);
  assert.deepEqual(twice, []);
});
