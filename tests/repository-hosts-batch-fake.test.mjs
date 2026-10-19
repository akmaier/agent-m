// The shared fake of GitHub's batch request (ITM-712): tests/repository-hosts-batch-fake.mjs answers a GraphQL query of aliased `repository.object(expression: "<commit>:<path>")` fields as GitHub does, with the text of
// each file the commit holds. This is its own test; the files that serve /graphql through it are the tests of MOD-repository-hosts and of the modules that read through its host.
// Run: node --test tests/repository-hosts-batch-fake.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// GitHub's answer, as docs.github.com/en/graphql/reference/objects#blob and the batch request of MOD-repository-hosts' readMany document it: `data.repository` holds one field for each alias — a Blob with `text` (null for
// a binary file), `isTruncated`, `isBinary` and `byteSize`, or null where the commit holds no such file or the commit is unknown —; `data.rateLimit` holds the cost of the call. A repository the viewer cannot see
// is `data.repository: null` with an error of the type NOT_FOUND. Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";
import { batchAnswer, atCommit, askedPaths } from "./repository-hosts-batch-fake.mjs";

const A = "a".repeat(40), B = "b".repeat(40), C = "c".repeat(40);
const query = (...expressions) => `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){${expressions.map((e, i) => `f${i}:object(expression:${JSON.stringify(e)}){...on Blob{text isTruncated}}`).join(" ")}}}`;
const held = (commit, path) => ({ [A]: { "SPEC.md": "old\n", "a.md": "a\n" }, [B]: { "SPEC.md": "new\n" } })[commit]?.[path];

// TST-712001 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a repository whose commit A holds SPEC.md ("old") and a.md, and whose commit B holds SPEC.md ("new"); a query naming A:SPEC.md, B:SPEC.md, B:a.md (which B does not hold) and C:SPEC.md (a commit the repository does not hold)
// input: batchAnswer(query, { held })
// expect: f0 is the Blob with the text "old", f1 the Blob with "new", f2 and f3 null; each Blob has isTruncated false, isBinary false and byteSize the bytes of its text; data.rateLimit is present
test("batchAnswer — gives the text of each file at the commit asked, null for a file or a commit that is not held", () => {
  const { data } = batchAnswer(query(`${A}:SPEC.md`, `${B}:SPEC.md`, `${B}:a.md`, `${C}:SPEC.md`), { held });
  assert.deepEqual(data.repository, {
    f0: { text: "old\n", isTruncated: false, isBinary: false, byteSize: 4 },
    f1: { text: "new\n", isTruncated: false, isBinary: false, byteSize: 4 },
    f2: null, f3: null,
  });
  assert.equal(typeof data.rateLimit.cost, "number");
});

// TST-712002 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the same repository; the file a.md given as truncated and SPEC.md at B given as binary, and the path with a colon in it "docs/x:y.md" held at A
// input: batchAnswer with special { "<A>:a.md": "truncated", "<B>:SPEC.md": "binary" }
// expect: a.md is a Blob with isTruncated true and a text shorter than the file; SPEC.md at B has text null and isBinary true; "docs/x:y.md" at A is read whole (the path is whatever follows the first colon)
test("batchAnswer — a truncated file, a binary file and a path with a colon are answered as GitHub answers them", () => {
  const files = { [A]: { "a.md": "abcdefghij\n", "docs/x:y.md": "colon\n" }, [B]: { "SPEC.md": "bin" } };
  const { data } = batchAnswer(query(`${A}:a.md`, `${B}:SPEC.md`, `${A}:docs/x:y.md`), { held: (c, p) => files[c]?.[p], special: { [`${A}:a.md`]: "truncated", [`${B}:SPEC.md`]: "binary" } });
  assert.equal(data.repository.f0.isTruncated, true);
  assert.ok(data.repository.f0.text.length < "abcdefghij\n".length);
  assert.deepEqual([data.repository.f1.text, data.repository.f1.isBinary], [null, true]);
  assert.deepEqual(data.repository.f2, { text: "colon\n", isTruncated: false, isBinary: false, byteSize: 6 });
});

// TST-712003 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a repository the viewer cannot see (known: false); and askedPaths of a query that names A:SPEC.md and B:docs/x:y.md
// input: batchAnswer(query, { known: false }); askedPaths(query)
// expect: data.repository is null and errors holds one error of the type NOT_FOUND; askedPaths gives ["SPEC.md", "docs/x:y.md"]
test("batchAnswer — an unknown repository is null with a NOT_FOUND error; askedPaths names the paths asked for", () => {
  const q = query(`${A}:SPEC.md`, `${B}:docs/x:y.md`);
  const body = batchAnswer(q, { held, known: false });
  assert.equal(body.data.repository, null);
  assert.deepEqual(body.errors.map((e) => e.type), ["NOT_FOUND"]);
  assert.deepEqual(askedPaths(q), ["SPEC.md", "docs/x:y.md"]);
});

// TST-712004 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-020
// given: MOD-repository-hosts' real GitHub host with a token, behind a fetch that serves /graphql with batchAnswer over the repository of TST-712001; known positive: the same host reads the texts of A and B
// input: readFileAt("SPEC.md", [A, B, C])
// expect: the Map holds "old" at A, "new" at B and null at C — texts the host got from the fake's answer; a fake that answered empty would give null at all three
test("batchAnswer — the real host reads the texts of the files from its answer, one text for each commit", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    if (url.origin === "https://api.github.com" && url.pathname === "/graphql") return new Response(JSON.stringify(batchAnswer(JSON.parse(init.body).query, { held })), { status: 200 });
    return new Response("{}", { status: 404 });
  };
  try {
    const texts = await connect(parseAddress("https://github.com/alice/product"), { token: "github_pat_ALICEbatchFAKE0123456789abcdefghijk" }).readFileAt("SPEC.md", [A, B, C]);
    assert.deepEqual([...texts], [[A, "old\n"], [B, "new\n"], [C, null]]);
  } finally { globalThis.fetch = real; }
});

// TST-712005 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: atCommit(A, { "SPEC.md": "x" })
// input: the function at (A, "SPEC.md"), (B, "SPEC.md"), (A, "other.md")
// expect: "x", undefined, undefined
test("atCommit — holds the files at one commit and nothing at another", () => {
  const at = atCommit(A, { "SPEC.md": "x" });
  assert.deepEqual([at(A, "SPEC.md"), at(B, "SPEC.md"), at(A, "other.md")], ["x", undefined, undefined]);
});
