// Release tests of ITM-1268 — the last accepted text of a changed file is read as one file of one commit. The behaviour is the SPEC's A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT ("For a reviewed file that has changed since it was accepted, the dashboard shows the difference between
// the text named by the most recent approval record for the same identifier and the current text") and A PAGE LOAD READS THE REPOSITORY IN BATCHES, as docs/architecture/MOD-approvals.md (`lastAcceptedText`: "the text named by the most recent approval record of an identifier [...] A record whose content
// names another blob than its name, or a file of another identifier, counts as no record (`AN APPROVAL NAMES THE EXACT TEXT`) [...] reads the history of the records and of the file through the host; fails with the host's errors (`TokenRefused`, `RateLimited`, `NotFound`, `Unreachable`)"),
// docs/architecture/MOD-repository-hosts.md (`readFileAt(path, commits)`: one file at each of several commits, one request for each batch) and docs/architecture/MOD-site-frame.md (a route is given a `Host` as MOD-repository-hosts defines it) state them, seen as UC-008 steps 1 and 2 show them to a person: a changed use case, a changed module file, and
// Review all.
// Run: node --test tests/release-itm-1268-last-accepted-one-file.test.mjs
//
// Module: MOD-approvals; MOD-site-frame
// Guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A PAGE LOAD READS THE REPOSITORY IN BATCHES; AN APPROVAL NAMES THE EXACT TEXT; UC-008
// Level: release
//
// Written for the release testing of sprint 111 by a participant who implemented none of ITM-1268 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). The world is the one of the page tests (tests/app-harness.mjs: the real app src/site-frame/dashboard-app.mjs over a counting fake GitHub that
// serves the batch request and the query of folders' entries, and counts the requests for an earlier commit apart as "era commit", "era tree" and "era file"; the older text is asked for in the batch request, one aliased field for the commit and the file, and the harness lists the paths each batch names in `batches`) with the fixture product tests/fixtures/architecture. The implementers' tests (tests/approvals-last-accepted-one-file.test.mjs, the cases of
// tests/load-per-view.test.mjs) look at lastAcceptedText over a fake host and at two addresses; these cases look at what a person sees on the pages of a changed use case, a changed module file and Review all, and at the failure a text that is not the one the record names makes. Readings the texts leave open:
//   - "no older tree read": none of the requests "era commit", "era tree" and "era file" is sent, and one batch request names the one file; a change that reads the older commit's commit, its tree or the file by a request of its own is the failure.
//   - "failing by name": the page says that it could not show the file, naming the file's path; a text that is not the one the record names is never shown as the last accepted text.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { blobSha } from "../src/text-tools/index.mjs";
import { repoServer, openDashboard } from "./app-harness.mjs";
import { recordText, approvalPath, reviewedRecord } from "./approval-records.mjs";

// ---------------------------------------------------------------- the product: tests/fixtures/architecture with UC-001, UC-002 and MOD-reader edited since their acceptance

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const base = {};
// The fixture keeps its test file as tests/reader.test.js.fixture, so that node --test tests/ does not run it; the walk builds it back under its name.
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else base[relative(FIX, p).split("\\").join("/").replace(/\.fixture$/, "")] = readFileSync(p, "utf8");
  }
})(FIX);
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md", READER = "docs/architecture/MOD-reader.md";
const era = (requests) => requests.filter((r) => r.startsWith("era "));
const count = (requests, what) => requests.filter((r) => r === what).length;

/** The product: UC-001, UC-002 and MOD-reader each accepted in an earlier text (the history holds it) and edited since. */
async function product() {
  const f = { ...base, "docs/use-cases/README.md": "# Use cases\n\nThe overview.\n", "docs/approvals/README.md": "# Approval records\n" };
  const history = [];
  const rec = async (id, path, earlier) => {
    history.push(earlier);
    f[approvalPath(id, await blobSha(earlier))] = recordText(reviewedRecord(path, await blobSha(earlier)));
  };
  await rec("UC-001", UC1, f[UC1].replace("Read a file", "Read one file"));
  await rec("UC-002", UC2, f[UC2].replace("Show the status", "Show a status"));
  await rec("MOD-reader", READER, f[READER].replace("Reads files at", "Reads a file at"));
  return { files: f, history };
}
const serverOf = async (handlers = []) => { const { files, history } = await product(); return repoServer({ files, history, handlers }); };

// ---------------------------------------------------------------- the older commit answered otherwise, by the fake's own handler

/** Answers the batch request that reads a file at an older commit (the harness's eras) with `answer(expression)` for each of its fields, and every other request not at all. */
const olderCommitAnswers = (answer) => async (url, init) => {
  if (init.method !== "POST" || url.pathname !== "/graphql") return null;
  const query = JSON.parse(init.body).query;
  const asks = [...query.matchAll(/(f\d+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)].filter((m) => /^d\d{6}0*:/.test(JSON.parse(m[2])));
  if (asks.length === 0) return null;
  return new Response(JSON.stringify({ data: { repository: Object.fromEntries(asks.map((m) => [m[1], answer(JSON.parse(m[2]))])) } }), { status: 200, headers: { "Content-Type": "application/json" } });
};

// TST-1268301 · level: release · module: MOD-approvals, MOD-site-frame
// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-008
// given: UC-008 steps 1 and 2. the fixture product in which UC-002 was accepted as "Show a status" and is "Show the status" now; a token; known positive first — the same page with UC-002 edited back to the accepted text reads no older commit at all
// input: open #uc/UC-002, and then #use-case/id=UC-002, each in a load of its own
// expect: each page shows the heading "Changed since it was last accepted" with the line "- title: Show a status" deleted and the current title; no request for the older commit is sent apart from the batch ("era commit", "era tree" and "era file" are none); one batch request names UC-002's file alone, no request for entries names it, and the head's tree is not read
// Planted fault: lastAcceptedText reading the older commit whole (`host.readSnapshot(last.commit)` in place of `host.readFileAt(file, [last.commit])` in src/approvals/status.mjs) sends "era commit" and "era tree", and the case fails on it.
test("TST-1268301 a changed use case is shown against its last accepted text, which is read as one file of the commit that added its record", async () => {
  const accepted = await product();
  accepted.files[UC2] = accepted.files[UC2].replace("Show the status", "Show a status");
  const clean = await repoServer({ files: accepted.files, history: accepted.history });
  const unchanged = await openDashboard({ server: clean, hash: "#uc/UC-002" });
  assert.deepEqual(era(unchanged.requests), [], "known positive: UC-002 accepted as it stands reads no older commit");
  assert.doesNotMatch(unchanged.main(), /Changed since it was last accepted/);

  for (const hash of ["#uc/UC-002", "#use-case/id=UC-002"]) {
    const srv = await serverOf();
    const page = await openDashboard({ server: srv, hash });
    assert.match(page.main(), /Changed since it was last accepted/, hash);
    assert.match(page.main(), /<span class="ddel">- title: Show a status/, `${hash}: the difference to the accepted text`);
    assert.match(page.main(), /Show the status/, hash);
    assert.deepEqual(era(page.requests), [], `${hash}: no request of its own for the older commit, its tree or its file`);
    assert.deepEqual(srv.batches.filter((paths) => paths.includes(UC2)), [[UC2]], `${hash}: one batch request, naming the file alone`);
    assert.equal(srv.folders.filter((paths) => paths.includes(UC2)).length, 0, `${hash}: no request for entries names the file`);
    assert.equal(count(page.requests, "tree"), 0, `${hash}: the head's tree is not read`);
  }
});

// TST-1268302 · level: release · module: MOD-approvals, MOD-site-frame
// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-008
// given: the fixture product in which MOD-reader was accepted as "Reads a file at" and says "Reads files at" now; a token
// input: open #module/id=MOD-reader and #arc/MOD-reader, each in a load of its own
// expect: each page shows "Changed since it was last accepted" with the accepted line deleted; no request for the older commit is sent apart from the batch ("era commit", "era tree" and "era file" are none); one batch request names MOD-reader's file alone and no request for entries names it
// Planted fault: lastAcceptedText reading the older commit whole (`host.readSnapshot(last.commit)` in place of `host.readFileAt(file, [last.commit])` in src/approvals/status.mjs) sends "era commit" and "era tree" for the module as well, and the case fails on it.
test("TST-1268302 a changed module file is shown against its last accepted text read as one file, the same on its own page and in the architecture", async () => {
  for (const hash of ["#module/id=MOD-reader", "#arc/MOD-reader"]) {
    const srv = await serverOf();
    const page = await openDashboard({ server: srv, hash });
    assert.match(page.main(), /Changed since it was last accepted/, hash);
    assert.match(page.main(), /<span class="ddel">[^<]*Reads a file at/, `${hash}: the accepted line is deleted`);
    assert.deepEqual(era(page.requests), [], hash);
    assert.deepEqual(srv.batches.filter((paths) => paths.includes(READER)), [[READER]], `${hash}: one batch request, naming the file alone`);
    assert.equal(srv.folders.filter((paths) => paths.includes(READER)).length, 0, `${hash}: no request for entries names the file`);
    assert.equal(count(page.requests, "tree"), 0, hash);
  }
});

// TST-1268303 · level: release · module: MOD-approvals, MOD-site-frame
// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-008
// given: UC-001 and UC-002 both accepted in an earlier text and edited since; a token
// input: open Review all of the use cases (#use-case/id=all)
// expect: the page shows both as a difference to their accepted texts; the older texts are read for the two files once each, one batch request naming UC-001's file alone and one naming UC-002's alone (never both in one request), with no "era commit", "era tree" or "era file" and no request for entries naming either
// Planted fault: the older commit read whole (`host.readSnapshot(last.commit)` in place of `host.readFileAt(file, [last.commit])` in src/approvals/status.mjs) sends one "era commit" and one "era tree" for each of the two files, and the case fails on it.
test("TST-1268303 Review all reads the older commit of each changed use case as one file, and no older tree", async () => {
  const srv = await serverOf();
  const page = await openDashboard({ server: srv, hash: "#use-case/id=all" });
  assert.match(page.main(), /<span class="ddel">- title: Show a status/);
  assert.match(page.main(), /<span class="ddel">[^<]*Read one file/);
  assert.deepEqual(era(page.requests), []);
  const older = srv.batches.filter((paths) => paths.length === 1 && [UC1, UC2].includes(paths[0])).map((paths) => paths[0]).sort();
  assert.deepEqual(older, [UC1, UC2], "one batch request for each older text, naming its file");
  assert.equal(srv.folders.filter((paths) => paths.some((path) => [UC1, UC2].includes(path))).length, 0, "no request for entries names either file");
  assert.equal(count(page.requests, "tree"), 0);
});

// TST-1268304 · level: release · module: MOD-approvals, MOD-site-frame
// guards: AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the fixture product; known positive first — #uc/UC-002 shows the difference; the same page where the commit that added UC-002's record holds the file with another text than the record names (the batch's answer for the older commit is another text)
// input: open #uc/UC-002 on each
// expect: the second page does not show a difference to a last accepted text: its section "Changed since it was last accepted" holds the problem "docs/use-cases/UC-002-show-the-status.md did not give the text docs/approvals/UC-002-<blob12>.md names when the record was added" and no deleted line
// Planted fault: the comparison of the blob left out (`if (await blobSha(text) !== blob)` made `if (false)` in src/approvals/status.mjs) shows the difference to a text the record does not name, and the case fails on it.
test("TST-1268304 a text of another blob than the record names is not shown as the last accepted text; the page names the file", async () => {
  const known = await openDashboard({ server: await serverOf(), hash: "#uc/UC-002" });
  assert.match(known.main(), /<span class="ddel">- title: Show a status/, "known positive");

  const wrong = await serverOf([olderCommitAnswers(() => ({ text: "title: not the accepted text\n", isTruncated: false }))]);
  const page = await openDashboard({ server: wrong, hash: "#uc/UC-002" });
  assert.doesNotMatch(page.main(), /<span class="ddel">- title: Show a status/, "no difference to a text the record does not name");
  assert.match(page.main(), /<p class="problem">docs\/use-cases\/UC-002-show-the-status\.md did not give the text docs\/approvals\/UC-002-[0-9a-f]{12}\.md names when the record was added<\/p>/, "the failure names the file and the record");
});

// TST-1268305 · level: release · module: MOD-approvals, MOD-site-frame
// guards: AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the fixture product, in which the commit that added MOD-reader's record holds no MOD-reader file (the batch's answer for the older commit is null)
// input: open #module/id=MOD-reader
// expect: the page shows no deleted line and the problem "docs/architecture/MOD-reader.md did not hold the text docs/approvals/MOD-reader-<blob12>.md names when the record was added"
// Planted fault: the check of the text left out (`if (typeof text !== "string")` made `if (false)` in src/approvals/status.mjs) lets the null through as a failure of another name, and the case fails on the absent name or on the difference.
test("TST-1268305 a file the commit that added its record does not hold is named, and no last accepted text is shown", async () => {
  const absent = await serverOf([olderCommitAnswers(() => null)]);
  const page = await openDashboard({ server: absent, hash: "#module/id=MOD-reader" });
  assert.doesNotMatch(page.main(), /<span class="ddel">[^<]*Reads a file at/);
  assert.match(page.main(), /<p class="problem">docs\/architecture\/MOD-reader\.md did not hold the text docs\/approvals\/MOD-reader-[0-9a-f]{12}\.md names when the record was added<\/p>/, "the failure names the file and the record");
});
