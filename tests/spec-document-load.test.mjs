// MOD-spec-document loads when its skeleton cannot be read (ITM-224) — docs/architecture/MOD-spec-document.md, Files: the module
// reads its own skeleton.md when it is loaded; if that read fails, the module still loads, and specSkeleton fails with the
// reason when it is called, so that no page that loads the module fails with it — neither UC-001's page, nor a page that
// loads the module for parseSpec through MOD-product-process (UC-002).
// Run: node --test tests/spec-document-load.test.mjs
//
// Module: MOD-spec-document
// Guards: ADDING A PRODUCT CREATES ITS LAYOUT; UC-001
// Level: unit
//
// How a read is made to fail, or to give a known text: the module reads skeleton.md from the disk where the platform offers
// `process.getBuiltinModule("node:fs")`, as Node does, and from its own address with `fetch` where it does not, as in a
// browser. Each case sets these two for one load of the module — as tests/app-harness.mjs sets a page's globals before it
// loads the dashboard —, loads the module anew from its own address with a query of its own, `index.mjs?load=<n>`, and puts
// both back. The real skeleton.md is read, never changed, and nothing reaches the network. Each test states its input and
// its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { specSkeleton } from "../src/spec-document/index.mjs";

const MODULE = new URL("../src/spec-document/index.mjs", import.meta.url);
const SKELETON_FILE = new URL("../src/spec-document/skeleton.md", import.meta.url);
const PRODUCT = "alice/thesis-tool";

// One load of the module, anew: `disk` is what process.getBuiltinModule("node:fs") gives it — undefined, as in a browser —,
// `fetch` the browser's fetch. -> { module, error, reads } — the module's namespace, or the error its load failed with; and
// every read of the load, as "disk <address>" or "fetch <address>".
let loads = 0;
async function load({ disk, fetch }) {
  const saved = { getBuiltinModule: process.getBuiltinModule, fetch: globalThis.fetch };
  const reads = [];
  process.getBuiltinModule = (name) => (name === "node:fs" ? disk?.(reads) : saved.getBuiltinModule.call(process, name));
  globalThis.fetch = fetch ? (url) => { reads.push(`fetch ${url}`); return fetch(url); } : undefined;
  try {
    loads += 1;
    return { module: await import(new URL(`?load=${loads}`, MODULE)), error: null, reads };
  } catch (error) {
    return { module: null, error, reads };
  } finally {
    process.getBuiltinModule = saved.getBuiltinModule;
    globalThis.fetch = saved.fetch;
  }
}

// A disk that gives `text` for every read, or fails every read with `error`; given the list of reads to note each in.
const diskGiving = (text) => (reads) => ({ readFileSync: (url) => { reads.push(`disk ${url}`); return text; } });
const diskFailing = (error) => (reads) => ({ readFileSync: (url) => { reads.push(`disk ${url}`); throw error; } });
const NO_SUCH_FILE = Object.assign(new Error(`ENOENT: no such file or directory, open '${SKELETON_FILE.pathname}'`),
  { code: "ENOENT" });

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

// A SPEC for parseSpec, with what parseSpec reads in it as the module file's Interfaces state it.
const SPEC_TITLE = lines("# Thesis tool — Specification", "");                                     // lines 1–2
const SPEC_EXPORT = lines(
  "## 1. Export",                                                                                    // 3
  "",                                                                                                // 4
  "**THE EXPORT IS A PDF** *(Product Owner)*",                                                       // 5
  "The export of a report is one PDF file.",                                                         // 6
  "*Check:* `tests/export.test.mjs`",                                                                // 7
);
const SPEC = SPEC_TITLE + SPEC_EXPORT;
const SPEC_READ = {
  title: "Thesis tool — Specification",
  sections: [{ heading: "## 1. Export", line: 3, start: SPEC_TITLE.length, end: SPEC.length, requirements: ["THE EXPORT IS A PDF"] }],
  requirements: new Map([["THE EXPORT IS A PDF", {
    name: "THE EXPORT IS A PDF", source: "Product Owner", sources: ["Product Owner"], rule: "The export of a report is one PDF file.",
    check: "`tests/export.test.mjs`", checkPaths: ["tests/export.test.mjs"], section: "## 1. Export", line: 5,
  }]]),
};

// The module loaded, parseSpec reading SPEC, and specSkeleton failing with an Error that names skeleton.md and `reason`.
function loadedWithoutItsSkeleton({ module, error }, reason) {
  assert.equal(error, null, `the module loads: ${error?.message}`);
  assert.deepEqual(module.parseSpec(SPEC), SPEC_READ, "parseSpec reads a SPEC");
  assert.throws(() => module.specSkeleton(PRODUCT),
    (e) => e instanceof Error && e.message.includes("skeleton.md") && e.message.includes(reason),
    `specSkeleton fails, naming skeleton.md and the reason: ${reason}`);
}

// guards: ADDING A PRODUCT CREATES ITS LAYOUT; UC-001
// given: Node, where the module reads skeleton.md from the disk, and a disk on which that read fails as it does for a missing
//        file: "ENOENT: no such file or directory, open '…/skeleton.md'"
// input: the module loaded anew; parseSpec(SPEC); specSkeleton("alice/thesis-tool")
// expect: one read, of the module's own skeleton.md from the disk; the module loads all the same; parseSpec reads SPEC as
//         SPEC_READ writes it out; specSkeleton throws an Error whose message names skeleton.md and the reason, "ENOENT"
test("with skeleton.md unreadable on the disk, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason", async () => {
  const loaded = await load({ disk: diskFailing(NO_SUCH_FILE) });
  assert.deepEqual(loaded.reads, [`disk ${SKELETON_FILE.href}`]);
  loadedWithoutItsSkeleton(loaded, "ENOENT");
});

// guards: ADDING A PRODUCT CREATES ITS LAYOUT; UC-001
// given: a browser, where the module reads skeleton.md from its own address with fetch: once the server answers 404 Not Found,
//        once the request itself fails, as a browser's fetch does without a connection — TypeError "Failed to fetch"
// input: for each, the module loaded anew; parseSpec(SPEC); specSkeleton("alice/thesis-tool")
// expect: for each, one read, of the module's own skeleton.md from its address; the module loads all the same; parseSpec reads
//         SPEC as SPEC_READ writes it out; specSkeleton throws an Error whose message names skeleton.md and the reason — "404",
//         and "Failed to fetch"
test("with skeleton.md not served at the module's address, the module loads, parseSpec reads a SPEC, and specSkeleton fails with the reason", async () => {
  const cases = [
    ["404", async () => new Response("Not Found", { status: 404, statusText: "Not Found" })],
    ["Failed to fetch", async () => { throw new TypeError("Failed to fetch"); }],
  ];
  for (const [reason, fetch] of cases) {
    const loaded = await load({ disk: undefined, fetch });
    assert.deepEqual(loaded.reads, [`fetch ${SKELETON_FILE.href}`], reason);
    loadedWithoutItsSkeleton(loaded, reason);
  }
});

// guards: ADDING A PRODUCT CREATES ITS LAYOUT; UC-001
// given: (a) the module as every page loads it, from its own folder, with its real skeleton.md readable on the disk; (b) the
//        module loaded anew, once with a disk and once with an address that give A_SKELETON, a text naming `<product>` twice
// input: specSkeleton("alice/thesis-tool") of each
// expect: the same text as before — the text read, with "alice/thesis-tool" in every place of `<product>` and every other
//         byte as read: (a) skeleton.md's own text so; (b) WITH_PRODUCT, after one read each, from the disk and from the
//         address
test("with skeleton.md readable, specSkeleton gives the same text as before", async () => {
  assert.equal(specSkeleton(PRODUCT), readFileSync(SKELETON_FILE, "utf8").split("<product>").join(PRODUCT));
  const A_SKELETON = lines("# <product> — Specification", "", "**VERBINDLICH (SPEC)**", "", "The binding document of <product>.",
    "", "## Requirements");
  const WITH_PRODUCT = "# alice/thesis-tool — Specification\n\n**VERBINDLICH (SPEC)**\n\nThe binding document of " +
    "alice/thesis-tool.\n\n## Requirements\n";
  const onDisk = await load({ disk: diskGiving(A_SKELETON) });
  const atAddress = await load({ disk: undefined, fetch: async () => new Response(A_SKELETON, { status: 200 }) });
  for (const [where, loaded, read] of [["disk", onDisk, "disk"], ["address", atAddress, "fetch"]]) {
    assert.equal(loaded.error, null, `${where}: the module loads: ${loaded.error?.message}`);
    assert.deepEqual(loaded.reads, [`${read} ${SKELETON_FILE.href}`], where);
    assert.equal(loaded.module.specSkeleton(PRODUCT), WITH_PRODUCT, where);
  }
});
