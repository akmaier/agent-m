// The identifier against its path, and the diagrams of a document — MOD-documents' documentFindings as
// docs/architecture/MOD-documents.md states it: "the identifier against the path", "a diagram missing where `required`, and any
// image (`DIAGRAMS ARE MERMAID IN MARKDOWN`)", the schema language's `identifier` "must match the identifier in its path" and its
// `diagrams` "`required`, `allowed` or `none`: whether the body must hold a Mermaid block; an image is never allowed".
// Run: node --test tests/documents-identifier-and-diagrams.test.mjs
//
// Module: MOD-documents
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; DIAGRAMS ARE MERMAID IN MARKDOWN
// Level: unit
//
// The documents are use cases read by the use-case schema the module owns (artifactSchemas), and texts of a schema written
// here; the complete use case is tests/fixtures/use-cases/UC-001-complete.md, and each broken text is a copy of it with one
// change. Readings, each named: "any image" is read for a schema that names `diagrams` — the key the language says it of —, so
// a schema without the key is not checked for diagrams; an image is a Markdown image or an HTML <img> whose address names a file
// of an image type, and one written inside a fenced block is an example, not an image of the document. A diagram that is
// missing stands on no line, and its finding names line 1, as a missing key or section does. Each test states its input and
// its expected result before it runs; the counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as documents from "../src/documents/index.mjs";

const { useCase } = documents.artifactSchemas();
const COMPLETE = readFileSync(new URL("./fixtures/use-cases/UC-001-complete.md", import.meta.url), "utf8");
const PATH = "docs/use-cases/UC-001-complete.md";
const DIAGRAMS = "DIAGRAMS ARE MERMAID IN MARKDOWN";

// A copy of a text with one change: `from` must occur exactly once.
function changed(text, from, to) {
  assert.equal(text.split(from).length - 1, 1, `the changed text occurs once: ${JSON.stringify(from)}`);
  return text.replace(from, () => to);
}

// The findings of a use case, each as [line, rule, what].
const findingsOf = (path, text, schema = useCase) => documents.documentFindings(schema, documents.readDocument(schema, path, text))
  .map((f) => [f.line, f.rule, f.what]);

// A schema of a note, with or without the key `diagrams`, loaded as its owner loads it.
function noteSchema(diagrams) {
  const schema = { schema: "note", shape: "document", rule: "ONE NOTE, ONE FILE", path: "docs/notes/{slug}.md",
    frontMatter: { title: { type: "text", required: true } }, sections: [], otherSections: "allowed",
    ...(diagrams === undefined ? {} : { diagrams }) };
  return documents.loadSchema(`# The note schema\n\nA note.\n\n\`\`\`json\n${JSON.stringify(schema)}\n\`\`\`\n`, "MOD-example");
}
const NOTE = "---\ntitle: A note\n---\n# A note\n\nThe flow, as it was drawn:\n\n![the flow](flow.png)\n";

// TST-1694001 · level: unit · module: MOD-documents
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: the complete use case at docs/use-cases/UC-001-complete.md, and copies whose front matter says id: UC-017, and whose path is docs/use-cases/UC-016-complete.md
// input: documentFindings of each, read by the use-case schema
// expect: none for the complete use case; for each copy one error on line 2, the line of its id, under EVERY ARTIFACT HAS AN IDENTIFIER, naming the id it carries and the one its path gives
test("documentFindings — an identifier that is not the one its path gives is an error at the line of the key", () => {
  assert.deepEqual(findingsOf(PATH, COMPLETE), [], "known positive: the identifier its path gives");
  assert.deepEqual(findingsOf(PATH, changed(COMPLETE, "id: UC-001", "id: UC-017")), [[2, "EVERY ARTIFACT HAS AN IDENTIFIER",
    `the key id is "UC-017", and the path ${PATH} gives the identifier UC-001`]]);
  const moved = "docs/use-cases/UC-016-complete.md";
  assert.deepEqual(findingsOf(moved, COMPLETE), [[2, "EVERY ARTIFACT HAS AN IDENTIFIER",
    `the key id is "UC-001", and the path ${moved} gives the identifier UC-016`]]);
});

// TST-1694002 · level: unit · module: MOD-documents
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: copies of the complete use case whose id is left out, and whose id is uc-001, which is no identifier UC
// input: documentFindings of each, read by the use-case schema
// expect: the identifier is not compared with the path where the key is missing or does not fit: each copy has the one finding of its key, and no second one
test("documentFindings — an identifier that is missing or of no kind is named once, as a value, and not compared with the path", () => {
  assert.deepEqual(findingsOf(PATH, changed(COMPLETE, "id: UC-001\n", "")).map(([, , what]) => what),
    ["the key id is required, and left out"]);
  assert.deepEqual(findingsOf(PATH, changed(COMPLETE, "id: UC-001", "id: uc-001")).map(([line, , what]) => [line, what]),
    [[2, 'the key id does not fit: "uc-001" is not an identifier UC']]);
});

// TST-1694003 · level: unit · module: MOD-documents
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN
// given: copies of the complete use case whose ```mermaid block is a ```text block, and whose only mention of mermaid is a sentence about a ```mermaid block
// input: documentFindings of each, read by the use-case schema, whose diagrams is required
// expect: for each one error on line 1 under DIAGRAMS ARE MERMAID IN MARKDOWN, saying the document has no ```mermaid block
test("documentFindings — a document whose schema requires a diagram and that holds no Mermaid block is an error", () => {
  const missing = [1, DIAGRAMS, "the format use-case holds a diagram, and the document has no ```mermaid block"];
  assert.deepEqual(findingsOf(PATH, changed(COMPLETE, "```mermaid", "```text")), [missing]);
  const mentioned = changed(COMPLETE, /```mermaid[\s\S]*?\n```\n/.exec(COMPLETE)[0], "The diagram belongs in a ```mermaid block.\n");
  assert.deepEqual(findingsOf(PATH, mentioned), [missing]);
});

// TST-1694004 · level: unit · module: MOD-documents
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN
// given: copies of the complete use case with, after its Mermaid block on line 37, the line ![The flow](diagrams/flow.PNG "The flow"); the line <img alt="The flow" src="diagrams/flow.svg?raw=true">; and both inside a ```text block
// input: documentFindings of each, read by the use-case schema
// expect: one error under DIAGRAMS ARE MERMAID IN MARKDOWN at the line of the image, 39, naming its address as written, for each of the first two; none for the third
test("documentFindings — an image, as Markdown or as HTML, is an error at its line; one inside a fenced block is an example", () => {
  const after = (line) => changed(COMPLETE, "    D-->>A: file\n```\n", `    D-->>A: file\n\`\`\`\n\n${line}\n`);
  assert.deepEqual(findingsOf(PATH, after('![The flow](diagrams/flow.PNG "The flow")')), [[39, DIAGRAMS,
    "the image diagrams/flow.PNG stands where a diagram is written as a ```mermaid block"]]);
  assert.deepEqual(findingsOf(PATH, after('<img alt="The flow" src="diagrams/flow.svg?raw=true">')), [[39, DIAGRAMS,
    "the image diagrams/flow.svg?raw=true stands where a diagram is written as a ```mermaid block"]]);
  assert.deepEqual(findingsOf(PATH, after("```text\n![The flow](flow.png)\n<img src=\"flow.svg\">\n```")), []);
});

// TST-1694005 · level: unit · module: MOD-documents
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN
// given: a note at docs/notes/a-note.md that holds no Mermaid block and the image flow.png on line 8, read by a note schema with diagrams allowed, with diagrams none, and without the key diagrams
// input: documentFindings of the note by each schema
// expect: with allowed and with none, one error on line 8 under DIAGRAMS ARE MERMAID IN MARKDOWN for the image, and none for the missing block; without the key, no finding
test("documentFindings — an image is an error wherever the schema names diagrams; a block is required only where it says required", () => {
  const image = [8, DIAGRAMS, "the image flow.png stands where a diagram is written as a ```mermaid block"];
  assert.deepEqual(findingsOf("docs/notes/a-note.md", NOTE, noteSchema("allowed")), [image]);
  assert.deepEqual(findingsOf("docs/notes/a-note.md", NOTE, noteSchema("none")), [image]);
  assert.deepEqual(findingsOf("docs/notes/a-note.md", NOTE, noteSchema(undefined)), []);
});
