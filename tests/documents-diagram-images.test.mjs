// The images of a document — MOD-documents' documentFindings as docs/architecture/MOD-documents.md states it: "… and any image
// (`DIAGRAMS ARE MERMAID IN MARKDOWN`)", the schema language's `diagrams` being "`required`, `allowed` or `none`: whether the
// body must hold a Mermaid block; an image is never allowed".
// Run: node --test tests/documents-diagram-images.test.mjs
//
// Module: MOD-documents
// Guards: DIAGRAMS ARE MERMAID IN MARKDOWN
// Level: unit
//
// The documents are use cases read by the use-case schema the module owns (artifactSchemas), and a note read by a schema written
// here; the complete use case is tests/fixtures/use-cases/UC-001-complete.md, and each broken text is a copy of it with one
// change. Readings, each named: "any image" is read for a schema that names `diagrams` — the key the language says it of —, so
// a schema without the key is not checked for images; an image is a Markdown image or an HTML <img> whose address names a file
// of an image type, and one written inside a fenced block is an example, not an image of the document. Whether a Mermaid block
// is missing where `diagrams` is `required` is not checked yet, and not tested here. Each test states its input and its
// expected result before it runs; the counter-proofs are recorded in the pull request.

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

// The findings of a document, each as [line, rule, what].
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

// TST-1694004 · level: unit · module: MOD-documents
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN
// given: the complete use case, and copies of it with, after its Mermaid block on line 37, the line ![The flow](diagrams/flow.PNG "The flow"); the line <img alt="The flow" src="diagrams/flow.svg?raw=true">; and both inside a ```text block
// input: documentFindings of each, read by the use-case schema
// expect: none for the complete use case; one error under DIAGRAMS ARE MERMAID IN MARKDOWN at the line of the image, 39, naming its address as written, for each of the first two copies; none for the third
test("documentFindings — an image, as Markdown or as HTML, is an error at its line; one inside a fenced block is an example", () => {
  assert.deepEqual(findingsOf(PATH, COMPLETE), [], "known positive: the complete use case");
  const after = (line) => changed(COMPLETE, "    D-->>A: file\n```\n", `    D-->>A: file\n\`\`\`\n\n${line}\n`);
  assert.deepEqual(findingsOf(PATH, after('![The flow](diagrams/flow.PNG "The flow")')), [[39, DIAGRAMS,
    "the image diagrams/flow.PNG stands where a diagram is written as a ```mermaid block"]]);
  assert.deepEqual(findingsOf(PATH, after('<img alt="The flow" src="diagrams/flow.svg?raw=true">')), [[39, DIAGRAMS,
    "the image diagrams/flow.svg?raw=true stands where a diagram is written as a ```mermaid block"]]);
  assert.deepEqual(findingsOf(PATH, after("```text\n![The flow](flow.png)\n<img src=\"flow.svg\">\n```")), []);
});

// TST-1694005 · level: unit · module: MOD-documents
// guards: DIAGRAMS ARE MERMAID IN MARKDOWN
// given: a note at docs/notes/a-note.md that holds the image flow.png on line 8, read by a note schema with diagrams allowed, with diagrams none, and without the key diagrams
// input: documentFindings of the note by each schema
// expect: with allowed and with none, one error on line 8 under DIAGRAMS ARE MERMAID IN MARKDOWN for the image; without the key, no finding
test("documentFindings — an image is an error wherever the schema names diagrams, and only there", () => {
  const image = [8, DIAGRAMS, "the image flow.png stands where a diagram is written as a ```mermaid block"];
  assert.deepEqual(findingsOf("docs/notes/a-note.md", NOTE, noteSchema("allowed")), [image]);
  assert.deepEqual(findingsOf("docs/notes/a-note.md", NOTE, noteSchema("none")), [image]);
  assert.deepEqual(findingsOf("docs/notes/a-note.md", NOTE, noteSchema(undefined)), []);
});
