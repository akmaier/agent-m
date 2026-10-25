// Release tests of sprint 02, strand A — the finding behind a refused save (ITM-126, ITM-142). Written by tester-opus
// (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of strand A, from the SPEC and the accepted
// module file alone; started on sprint/02 at 3ba86fb (the merge of ITM-136, the strand's last item), 2026-10-01.
//
// Module: MOD-documents
// Guards: AN EDITED FILE KEEPS ITS IDENTIFIER; A FINDING READS LIKE A COMPILER MESSAGE
// Level: release
//
// MOD-artifact-edits offers the job runner the check `identifier-kept`: "an error finding when a drafted change of an existing
// file carries another identifier than the file it changes; the finding names the identifier to keep" (its Interfaces,
// editStrategies); the identifier a text carries is read by MOD-documents. SPEC §9, A FINDING READS LIKE A COMPILER MESSAGE:
// "names the artifact and line it concerns, its kind (error or warning), the rule it violates by name, and the correction
// expected, in one fixed text form", e.g. `UC-007:12: error: … [A USE CASE REALISES NAMED REQUIREMENTS] — use an existing name
// or remove the line.`; MOD-text-tools' formatFinding writes that form. The check is called as the job runner calls it,
// (draft, context, parts), on a head that holds the file the draft changes. Every case states its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { editStrategies } from "../src/artifact-edits/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

const RULE = "AN EDITED FILE KEEPS ITS IDENTIFIER";

// The one fixed text form of the SPEC's example: <artifact>:<line>: <kind>: <what> [<RULE>] — <fix>
const FORM = /^([A-Za-z][\w./-]*):(\d+): (error|warning): (\S[^\n]*) \[([A-Z][A-Z0-9 ,'’-]+)\] — (\S[^\n]*)$/;

const useCase = (id) => `---
id: ${id}
title: Read a report
area: test
actors:
  - Reader
realises:
  - RULE ONE
---
# ${id} Read a report

**Goal.** The reader gets the report.

## Actors

- **Reader** — reads reports.

## Precondition

- A report exists.

## Main flow

1. The reader opens the report.

\`\`\`mermaid
sequenceDiagram
    actor R as Reader
    R->>R: read
\`\`\`

## Alternative flows

- **1a. No report.** The reader is told so.

## Postcondition

- The reader has read the report.
`;
const decision = (id) => `---
id: ${id}
title: The dashboard is a static client
forced_by:
  - RULE ONE
---
# ${id} The dashboard is a static client

## Context

No server of its own.

## Decision

The page reads and writes through the server's API.

## Alternatives

- A server of our own — rejected.

## Consequences

Every write is a commit.
`;
const moduleFile = (id) => `---
id: ${id}
title: Reads files at a pinned commit
folder: src/reader/
realises:
  - RULE ONE
follows:
  - ARC-001
uses:
provides:
  - readFile
---
# ${id} Reads files at a pinned commit

## Responsibility

Reads the product's files.

## Interfaces

- \`readFile(path) -> text | null\` — one file's text.
`;
// The 1-based line of the text's front-matter `id:`.
const idLine = (text) => text.split(/\r?\n/).findIndex((l) => /^id:/.test(l)) + 1;

// Where each file stands, under the identifier it was opened with; the head holds all three.
const PATH = { "UC-001": "docs/use-cases/UC-001-read-a-report.md", "ARC-001": "docs/architecture/ARC-001-static-client.md",
  "MOD-reader": "docs/architecture/MOD-reader.md" };
// The check identifier-kept on a draft that changes the file opened as `opened`, its text now `text`.
const kept = (opened, text) => editStrategies.checks["identifier-kept"](
  { files: [{ path: PATH[opened], text, class: "change", of: opened }] }, { product: { snapshot: { paths: Object.values(PATH) } } }, []);

// AN EDITED FILE KEEPS ITS IDENTIFIER · A FINDING READS LIKE A COMPILER MESSAGE (ITM-126) — Expected: for a use case, an
// architecture decision and a module opened as one identifier whose drafted text now carries another, identifier-kept returns
// one finding — a value, not a sentence — of kind error, naming the file as its artifact, the line of the `id:`, the rule AN
// EDITED FILE KEEPS ITS IDENTIFIER by name, what is wrong (naming both identifiers) and the correction, which names the
// identifier to keep; written in the SPEC's one text form it is one line of that form. Known positive: the same text under its
// own identifier gives none.
test("release · ITM-126 identifier-kept: a changed identifier is a finding in the compiler form; the same identifier is none", async () => {
  for (const [opened, now, make] of [["UC-001", "UC-009", useCase], ["ARC-001", "ARC-009", decision], ["MOD-reader", "MOD-writer", moduleFile]]) {
    assert.deepEqual(await kept(opened, make(opened)), [], `${opened}: known positive — the same identifier is no finding`);
    const text = make(now), found = await kept(opened, text);
    assert.equal(found.length, 1, `${opened}: one finding`);
    const [f] = found;
    assert.equal(typeof f, "object", `${opened}: a finding is a value`);
    assert.equal(f.artifact, PATH[opened]);
    assert.equal(f.line, idLine(text), `${opened}: the line of the id`);
    assert.equal(f.kind, "error");
    assert.equal(f.rule, RULE);
    assert.match(f.what, new RegExp(opened), `${opened}: what names the identifier opened`);
    assert.match(f.what, new RegExp(now), `${opened}: what names the identifier the text carries`);
    assert.match(f.fix, new RegExp(opened), `${opened}: the correction names the identifier to keep`);
    const line = formatFinding(f);
    assert.match(line, FORM, `${opened}: one line of the compiler form — ${line}`);
  }
});

// AN EDITED FILE KEEPS ITS IDENTIFIER — the identifier "differs from the one it was opened with" also when the text carries
// none. Expected: a use case opened as UC-001 whose front matter has lost its `id:` line gives a finding of the rule, kind
// error, artifact the use case's path, at a line within the front matter.
test("release · ITM-126 identifier-kept: a text that lost its identifier is a finding too", async () => {
  const text = useCase("UC-001").replace("id: UC-001\n", "");
  const found = await kept("UC-001", text);
  assert.equal(found.length, 1, "a finding");
  const [f] = found;
  assert.equal(f.rule, RULE);
  assert.equal(f.kind, "error");
  assert.equal(f.artifact, PATH["UC-001"]);
  const close = text.split("\n").indexOf("---", 1) + 1;
  assert.ok(f.line >= 1 && f.line <= close, `line ${f.line} within the front matter (1–${close})`);
  assert.match(formatFinding(f), FORM);
});

// AN EDITED FILE KEEPS ITS IDENTIFIER — the rule is about the identifier, not about how the text's lines end. Expected: a use
// case opened as UC-001 whose text keeps `id: UC-001` but ends its lines with CR LF — as a file written on Windows does, or a
// participant's draft — gives no finding; its counterpart with UC-009 gives one naming UC-009. Known positive: the same text
// with LF line ends gives none.
test("release · ITM-126 identifier-kept: a text with CR LF line ends that keeps its identifier is no finding", async () => {
  assert.deepEqual(await kept("UC-001", useCase("UC-001")), [], "known positive");
  const crlf = (t) => t.replace(/\n/g, "\r\n");
  assert.deepEqual(await kept("UC-001", crlf(useCase("UC-001"))), [], "CR LF, the same identifier");
  assert.match((await kept("UC-001", crlf(useCase("UC-009"))))[0]?.what ?? "", /UC-009/, "CR LF, another identifier is named");
});
