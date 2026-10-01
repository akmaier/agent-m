// Release tests of sprint 02, strand A — the finding behind a refused save (ITM-126, ITM-142). Written by tester-opus
// (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of strand A, from the SPEC and the accepted
// module file alone; started on sprint/02 at 3ba86fb (the merge of ITM-136, the strand's last item), 2026-10-01.
//
// Module: MOD-artifacts
// Guards: AN EDITED FILE KEEPS ITS IDENTIFIER; A FINDING READS LIKE A COMPILER MESSAGE
// Level: release
//
// MOD-artifacts (docs/architecture/MOD-artifacts.md) declares `identifierKept(openedId, text) -> null | finding` and
// `formatChecks(kind, text, context) -> [finding]`, "each finding naming the artifact, the line, the rule and the expected
// correction"; ARC-003 decision 5: the kernel returns findings, the sentence a person reads is the shell's. SPEC §9, A FINDING
// READS LIKE A COMPILER MESSAGE: "names the artifact and line it concerns, its kind (error or warning), the rule it violates by
// name, and the correction expected, in one fixed text form", e.g. `UC-007:12: error: … [A USE CASE REALISES NAMED
// REQUIREMENTS] — use an existing name or remove the line.` The form is written out below from that example
// (MOD-job-harness formatFinding, which will hold it, is not built yet). Every case states its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { identifierKept } from "../docs/assets/artifacts.mjs";
import { formatChecks } from "../docs/assets/artifacts/checks.mjs";

const RULE = "AN EDITED FILE KEEPS ITS IDENTIFIER";

// The one fixed text form of the SPEC's example: <artifact>:<line>: <kind>: <what> [<RULE>] — <fix>
const compilerForm = (f) => `${f.artifact}:${f.line}: ${f.kind}: ${f.what} [${f.rule}] — ${f.fix}`;
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
const idLine = (text) => text.split("\n").findIndex((l) => /^id:/.test(l)) + 1;

// AN EDITED FILE KEEPS ITS IDENTIFIER · A FINDING READS LIKE A COMPILER MESSAGE (ITM-126) — Expected: for a use case, an
// architecture decision and a module opened as one identifier whose text now carries another, identifierKept returns a finding
// — a value, not a sentence — of kind error, naming the identifier it was opened with as its artifact, the line of the `id:`, the
// rule AN EDITED FILE KEEPS ITS IDENTIFIER by name, what is wrong (naming both identifiers) and the correction; written in the
// SPEC's one text form it is one line of that form. Known positive: the same text under its own identifier gives null.
test("release · ITM-126 identifierKept: a changed identifier is a finding in the compiler form; the same identifier is none", () => {
  for (const [opened, now, make] of [["UC-001", "UC-009", useCase], ["ARC-001", "ARC-009", decision], ["MOD-reader", "MOD-writer", moduleFile]]) {
    assert.equal(identifierKept(opened, make(opened)), null, `${opened}: known positive — the same identifier is no finding`);
    const text = make(now), f = identifierKept(opened, text);
    assert.equal(typeof f, "object", `${opened}: a finding is a value`);
    assert.ok(f !== null, `${opened}: a finding`);
    assert.equal(f.artifact, opened);
    assert.equal(f.line, idLine(text), `${opened}: the line of the id`);
    assert.equal(f.kind, "error");
    assert.equal(f.rule, RULE);
    assert.match(f.what, new RegExp(opened), `${opened}: what names the identifier opened`);
    assert.match(f.what, new RegExp(now), `${opened}: what names the identifier the text carries`);
    assert.ok(typeof f.fix === "string" && f.fix.trim().length > 0, `${opened}: the correction expected`);
    const line = compilerForm(f);
    assert.match(line, FORM, `${opened}: one line of the compiler form — ${line}`);
  }
});

// AN EDITED FILE KEEPS ITS IDENTIFIER — the identifier "differs from the one it was opened with" also when the text carries
// none. Expected: a use case opened as UC-001 whose front matter has lost its `id:` line gives a finding of the rule, kind
// error, artifact UC-001, at a line within the front matter.
test("release · ITM-126 identifierKept: a text that lost its identifier is a finding too", () => {
  const text = useCase("UC-001").replace("id: UC-001\n", "");
  const f = identifierKept("UC-001", text);
  assert.ok(f, "a finding");
  assert.equal(f.rule, RULE);
  assert.equal(f.kind, "error");
  assert.equal(f.artifact, "UC-001");
  const close = text.split("\n").indexOf("---", 1) + 1;
  assert.ok(f.line >= 1 && f.line <= close, `line ${f.line} within the front matter (1–${close})`);
  assert.match(compilerForm(f), FORM);
});

// AN EDITED FILE KEEPS ITS IDENTIFIER — the rule is about the identifier, not about how the text's lines end. Expected: a use
// case opened as UC-001 whose text keeps `id: UC-001` but ends its lines with CR LF — as a file written on Windows does, or a
// participant's draft — gives no finding; its counterpart with UC-009 gives one naming UC-009. Known positive: the same text
// with LF line ends gives none.
test("release · ITM-126 identifierKept: a text with CR LF line ends that keeps its identifier is no finding",
  { todo: "FINDING A5 — docs/assets/artifacts.mjs identifierKept reads the front matter with parseFrontMatter, which finds no field in a CR LF text: \"the text carries no identifier\" — ITM-126 back to Development" }, () => {
    assert.equal(identifierKept("UC-001", useCase("UC-001")), null, "known positive");
    const crlf = (t) => t.replace(/\n/g, "\r\n");
    assert.equal(identifierKept("UC-001", crlf(useCase("UC-001"))), null, "CR LF, the same identifier");
    assert.match(identifierKept("UC-001", crlf(useCase("UC-009")))?.what ?? "", /UC-009/, "CR LF, another identifier is named");
  });

// AN EDITED FILE KEEPS ITS IDENTIFIER · ITM-126 ("formatChecks … take[s] the finding as it comes") — Expected: formatChecks of a
// use case, a decision and a module, given the identifier the file was opened with, holds exactly one finding of the rule when
// the text carries another identifier — the same values identifierKept returns — and none when it carries its own.
test("release · ITM-126 formatChecks: the identifier finding comes once, as identifierKept gives it", () => {
  for (const [kind, p, opened, now, make] of [
    ["use-case", "docs/use-cases/UC-001-read-a-report.md", "UC-001", "UC-009", useCase],
    ["architecture-decision", "docs/architecture/ARC-001-static-client.md", "ARC-001", "ARC-009", decision],
    ["module", "docs/architecture/MOD-reader.md", "MOD-reader", "MOD-writer", moduleFile],
  ]) {
    const kept = formatChecks(kind, make(opened), { path: p, openedId: opened }).filter((f) => f.rule === RULE);
    assert.deepEqual(kept, [], `${kind}: known positive — none for its own identifier`);
    const text = make(now);
    const fs = formatChecks(kind, text, { path: p, openedId: opened }).filter((f) => f.rule === RULE);
    assert.equal(fs.length, 1, `${kind}: one finding of the rule`);
    const { artifact, line, kind: k, what, rule, fix } = identifierKept(opened, text);
    assert.deepEqual({ artifact: fs[0].artifact, line: fs[0].line, kind: fs[0].kind, what: fs[0].what, rule: fs[0].rule, fix: fs[0].fix },
      { artifact, line, kind: k, what, rule, fix }, `${kind}: as identifierKept gives it`);
    assert.match(compilerForm(fs[0]), FORM);
  }
});
