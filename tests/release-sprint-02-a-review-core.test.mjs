// Release tests of sprint 02, strand A — the reads leave the kernel (ITM-130, ITM-142). Written by tester-opus
// (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of strand A, from the SPEC, UC-024 and the
// accepted architecture alone; started on sprint/02 at 3ba86fb (the merge of ITM-136, the strand's last item), 2026-10-01.
//
// Module: MOD-review-core
// Guards: EVERY ARTIFACT NAMES ITS ORIGIN; UC-024; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; AN APPROVAL NAMES THE EXACT TEXT
// Level: release
//
// ARC-003 decision 1: the kernel is "pure functions and data … No fetch, no DOM, no storage … A kernel module imports only kernel
// modules"; decision 2: "a feature or kernel function that needs the outside receives it as a plain parameter". The kernel is
// the group Kernel of docs/groups/modules.md; a code file belongs to the module its `Module:` line names (ARC-020). MOD-review-core
// declares `lastAccepted({ records, id, committedAt, read }) -> { record, text, count } | null` — "of all records naming this
// identifier (matched by identifier, not path), the one committed last, and its text read by its blob SHA and refused unless it
// hashes to that SHA; committedAt(path) and read(blob) are ports; two records at the same instant raise an error naming both
// instead of guessing". ITM-142: "the kernel reads through ports only; no kernel file imports from the git host". Every case
// states its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { lastAccepted } from "../docs/assets/review-core.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

// ---------------------------------------------------------------- the files of the kernel, by the repository's own records

const KERNEL = (() => {
  const t = fs.readFileSync(path.join(ROOT, "docs/groups/modules.md"), "utf8");
  const block = /^- Kernel\n((?:  - .+\n)+)/m.exec(t)?.[1] ?? "";
  return new Set([...block.matchAll(/- (MOD-[a-z0-9-]+)/g)].map((m) => m[1]));
})();
function codeFiles(dir = path.join(ROOT, "docs/assets")) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "vendor" ? [] : codeFiles(p);
    return /\.(mjs|js)$/.test(e.name) ? [p] : [];
  });
}
const moduleOf = (file) => /(?:\/\/|#)\s*Module:\s*(MOD-[a-z0-9-]+)/.exec(fs.readFileSync(file, "utf8").split("\n").slice(0, 20).join("\n"))?.[1] ?? null;
const rel = (file) => path.relative(ROOT, file);
// Every module specifier a text imports: static `import … from`, `import "…"`, `export … from`, and `import("…")`.
const specifiers = (t) => [...t.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)].map((m) => m[1]);
const codeOnly = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((l) => l.replace(/(^|[^:"'`])\/\/.*$/, "$1")).join("\n");

// ITM-130 · ARC-003 decision 1 — Expected: no code file of a kernel module (the group Kernel of docs/groups/modules.md) imports
// a file of MOD-git-host, or of any module outside the kernel; review-core.mjs is among the files checked. Known positive of the
// reader: a planted `import { readFile } from "./git-host.mjs"` in review-core.mjs's text is seen as an import of MOD-git-host.
test("release · ITM-130 ARC-003: no kernel file imports from the git host or from any module outside the kernel", () => {
  assert.ok(KERNEL.has("MOD-review-core") && KERNEL.has("MOD-artifacts"), [...KERNEL].join(", "));
  const kernelFiles = codeFiles().filter((f) => KERNEL.has(moduleOf(f)));
  assert.ok(kernelFiles.some((f) => f.endsWith(path.join("docs/assets/review-core.mjs"))), "review-core.mjs is a kernel file");
  const target = (f, s) => path.resolve(path.dirname(f), s);
  const planted = `import { readFile } from "./git-host.mjs";\n${fs.readFileSync(path.join(ROOT, "docs/assets/review-core.mjs"), "utf8")}`;
  assert.ok(specifiers(planted).some((s) => moduleOf(target(path.join(ROOT, "docs/assets/review-core.mjs"), s)) === "MOD-git-host"), "known positive");
  const outside = [];
  for (const f of kernelFiles) {
    for (const s of specifiers(codeOnly(fs.readFileSync(f, "utf8")))) {
      if (!s.startsWith(".")) { outside.push(`${rel(f)} → ${s} (not a file of this repository)`); continue; }
      const t = target(f, s);
      if (!fs.existsSync(t) || /\.json$/.test(t)) continue;
      const m = moduleOf(t);
      if (!KERNEL.has(m)) outside.push(`${rel(f)} → ${rel(t)} (${m})`);
    }
  }
  assert.deepEqual(outside, []);
});

// ARC-003 decision 1 ("No fetch, no DOM, no storage") · ITM-130 — Expected: no code file of a kernel module calls fetch or
// touches localStorage or caches. Known positive of the scan: a planted call is seen; a comment is not code.
test("release · ITM-130 ARC-003: no kernel file calls fetch or touches the browser's storage", () => {
  const io = (t) => /(^|[^.\w])fetch\s*\(|\blocalStorage\b|\bcaches\s*\./m.test(codeOnly(t));
  assert.ok(io("await fetch(u)") && io("localStorage.getItem(k)") && !io("// fetch(u)") && !io("fetchText(u)"), "known positive");
  const kernelFiles = codeFiles().filter((f) => KERNEL.has(moduleOf(f)));
  assert.deepEqual(kernelFiles.filter((f) => io(fs.readFileSync(f, "utf8"))).map(rel), []);
});

// ---------------------------------------------------------------- lastAccepted, with its ports

const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0`).update(t).digest("hex");
const record = (file, text) => ({ kind: "use-case", file, blob: blobSha(text) });
const OLD = "docs/use-cases/UC-004-old-name.md", NOW = "docs/use-cases/UC-004-new-name.md";
const A0 = "UC-004 as FIRST accepted\n", A1 = "UC-004 as LAST accepted\n";

// MOD-review-core lastAccepted · ITM-130 ("take what they read as a port passed in") — Expected: with a global fetch that fails
// the test if it is called, lastAccepted reads only through the two ports it is given: of two records for UC-004 — the older
// under its old path, the newer under the old path too, while the file now has another name — it returns the record committed
// last and its text, read by that record's blob, and counts both; an identifier without a record gives null.
test("release · ITM-130 lastAccepted reads through its ports only and returns the record committed last, by identifier", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("the kernel called fetch"); };
  try {
    const r0 = { ...record(OLD, A0), _path: "docs/approvals/UC-004-a0.md" }, r1 = { ...record(OLD, A1), _path: "docs/approvals/UC-004-a1.md" };
    const dates = { [r0._path]: "2026-01-01T10:00:00Z", [r1._path]: "2026-02-01T10:00:00Z" };
    const texts = { [r0.blob]: A0, [r1.blob]: A1 };
    const asked = [];
    const got = await lastAccepted({ records: [r1, r0], id: "UC-004",
      committedAt: async (p) => { asked.push(`date ${p}`); return dates[p]; },
      read: async (b) => { asked.push(`read ${b}`); return texts[b]; } });
    assert.equal(got.text, A1, "the text of the record committed last");
    assert.equal(got.record.blob, r1.blob);
    assert.equal(got.count, 2);
    assert.ok(asked.includes(`read ${r1.blob}`), "read by the record's blob");
    assert.equal(await lastAccepted({ records: [r1, r0], id: "UC-005", committedAt: async () => null, read: async () => null }), null);
  } finally { globalThis.fetch = realFetch; }
});

// AN APPROVAL NAMES THE EXACT TEXT · lastAccepted "refused unless it hashes to that SHA" — Expected: when the read port answers
// the record's blob with another text, lastAccepted does not return that text — it refuses (an error) or returns no text.
test("release · ITM-130 lastAccepted refuses a text that does not hash to the record's blob", async () => {
  const r = { ...record(OLD, A1), _path: "docs/approvals/UC-004-a1.md" };
  const ok = await lastAccepted({ records: [r], id: "UC-004", committedAt: async () => "2026-02-01T10:00:00Z", read: async () => A1 });
  assert.equal(ok?.text, A1, "known positive: the true text is returned");
  const forged = await lastAccepted({ records: [r], id: "UC-004", committedAt: async () => "2026-02-01T10:00:00Z", read: async () => "FORGED\n" })
    .then((x) => x, (e) => ({ refused: e }));
  assert.ok(forged?.refused || (forged?.text ?? null) !== "FORGED\n", `the forged text is not returned: ${JSON.stringify(forged)}`);
});

// lastAccepted "two records at the same instant raise an error naming both instead of guessing" — Expected: two records for
// UC-004 committed at the same instant give an error that names both records; known positive: a second apart, no error.
test("release · ITM-130 lastAccepted: two records at the same instant are an error naming both, not a guess", async () => {
  const r0 = { ...record(OLD, A0), _path: "docs/approvals/UC-004-a0.md" }, r1 = { ...record(NOW, A1), _path: "docs/approvals/UC-004-a1.md" };
  const texts = { [r0.blob]: A0, [r1.blob]: A1 };
  const run = (d0, d1) => lastAccepted({ records: [r0, r1], id: "UC-004",
    committedAt: async (p) => (p === r0._path ? d0 : d1), read: async (b) => texts[b] });
  assert.equal((await run("2026-01-01T10:00:00Z", "2026-01-01T10:00:01Z")).text, A1, "known positive");
  const e = await run("2026-01-01T10:00:00Z", "2026-01-01T10:00:00Z").then(() => null, (x) => x);
  assert.ok(e instanceof Error, "an error, not a guess");
  assert.match(e.message, /UC-004-a0/);
  assert.match(e.message, /UC-004-a1/);
});
