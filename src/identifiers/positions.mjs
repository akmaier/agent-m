// positions.mjs — references by position (MOD-identifiers' positionalReferences: docs/architecture/MOD-identifiers.md).
//
// Module: MOD-identifiers
//
// A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION: a text that points at a part of an artifact of the product by a step
// number, a section number or a line number is warned, each place once. The step is `step 5`; the section is `§3` or
// `section 4`; the line is `line 12` or a file and its line, `SPEC.md:7`. A chapter of a book is no part of an artifact of the
// product, nor is a section of that chapter: `ch. 12 §6`, `chapter 7, section 5`.

import { finding } from "../text-tools/index.mjs";

const RULE = "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION";

// A number as a position is written: 5, 7a, 0.1, 4.0a.
const NUMBER = String.raw`\d+(?:\.\d+)*[a-z]?`;

// The three forms of a position. A file's name, in a file and its line, ends in the extension of a file the product holds.
const FORMS = [
  ["step", new RegExp(String.raw`\bsteps?\s+${NUMBER}`, "gi")],
  ["section", new RegExp(String.raw`§+\s*${NUMBER}|\bsections?\s+${NUMBER}`, "gi")],
  ["line", new RegExp(String.raw`\blines?\s+${NUMBER}|(?<![\w./-])[\w./-]+\.(?:md|mjs|js|json|py|html|css|yml|yaml|txt|sh|ts):\d+`,
    "gi")],
];

// A chapter of a book with the sections of it that follow — `ch. 12 §6`, `chapter 7, section 5`, `ch. 10 §4–§6` —: the sections
// of that chapter are the book's, not the product's.
const SECTION = String.raw`(?:§+\s*|\bsections?\s+)${NUMBER}(?:\s*[–-]\s*§?\s*${NUMBER})?`;
const CHAPTER = String.raw`\b(?:chapters?|ch\.)\s*\d+[a-z]?(?:\s*[–-]\s*\d+)?`;
const BOOK = new RegExp(`${CHAPTER}(?:[\\s,;–-]*(?:and\\s+)?${SECTION})*`, "gi");

// positionalReferences(path, text) -> Finding[] — a warning under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION for each
// place where the text points at a part of an artifact of the product by a step, section or line number, each with its line
// (from 1), in the order of the text. The finding names the path as its artifact: the identifier of a file is for the caller,
// which knows the format, to give.
export function positionalReferences(path, text) {
  const findings = [];
  String(text ?? "").split(/\r?\n/).forEach((line, i) => {
    const books = [...line.matchAll(BOOK)].map((m) => [m.index, m.index + m[0].length]);
    const places = [];
    for (const [form, pattern] of FORMS) {
      for (const m of line.matchAll(pattern)) {
        if (form === "section" && books.some(([from, to]) => m.index >= from && m.index < to)) continue;
        places.push({ at: m.index, reference: m[0] });
      }
    }
    places.sort((a, b) => a.at - b.at);
    for (const { reference } of places) {
      findings.push(finding({ artifact: path, line: i + 1, kind: "warning", rule: RULE,
        what: `"${reference}" names a part of an artifact by its position`,
        fix: "name the identifier of the artifact, and say in words which part is meant" }));
    }
  });
  return findings;
}
