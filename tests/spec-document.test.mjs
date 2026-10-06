// The SPEC a new product starts with (ITM-206) — MOD-spec-document's specSkeleton, as docs/architecture/MOD-spec-document.md
// states it: the product's title, a preamble saying what a requirement is in this form, and an empty first section.
// Run: node --test tests/spec-document.test.mjs
//
// Module: MOD-spec-document
// Guards: ADDING A PRODUCT CREATES ITS LAYOUT; UC-001
// Level: unit
//
// The skeleton is read here by the form of a SPEC as the module file states it (Data): a title line `# <product> —
// Specification`, a preamble of any text, then sections, each beginning with a heading of level two and ending before the
// next one; a requirement begins with its head line — its name in bold, then its source in italics in parentheses,
// `**NAME** *(source)*` — and has a line `*Check:* …`. Each test states its input and its expected result before it runs;
// a negative result is shown on a known positive first. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { specSkeleton } from "../src/spec-document/index.mjs";

// Two products, each named by its repository's path: one on GitHub, one in a group of a GitLab server.
const GITHUB = "alice/thesis-tool";
const GITLAB = "fau-ai-taskforce/tools/thesis-tool";

// The form of a SPEC, as the module file states it.
const TITLE = (product) => `# ${product} — Specification`;
const SECTION = /^## /;
const HEAD_LINE = /^\*\*[^*]+\*\*\s*\*\(/;
const CHECK_LINE = /^\*Check:\*/;

// A SPEC text cut by that form: its first line, the preamble up to the first section, and each section with its lines.
function cut(text) {
  const lines = text.split("\n");
  const first = lines.findIndex((l) => SECTION.test(l));
  const sections = [];
  if (first >= 0) {
    for (const line of lines.slice(first)) {
      if (SECTION.test(line)) sections.push({ heading: line, body: [] });
      else sections[sections.length - 1].body.push(line);
    }
  }
  return { title: lines[0], preamble: lines.slice(1, first < 0 ? lines.length : first).join("\n"), sections };
}

// The lines of a text that begin a requirement or state its check.
const requirementLines = (text) => text.split("\n").filter((l) => HEAD_LINE.test(l) || CHECK_LINE.test(l));

// A requirement in the form of the module file's own example.
const A_REQUIREMENT = "**ONE STATEMENT PER REQUIREMENT** *(Product Owner)*\n" +
  "The rule of a requirement is a single statement; a rule containing \"and\" or \"additionally\" is two requirements.\n" +
  "*Check:* `tests/test_single_statement.py`\n";

// given: a product named by the path of its repository, on GitHub or on a GitLab server
// input: specSkeleton(path)
// expect: the first line is `# <path> — Specification`
test("specSkeleton — the title names the product: `# <product> — Specification`", () => {
  for (const product of [GITHUB, GITLAB]) {
    assert.equal(specSkeleton(product).split("\n")[0], TITLE(product), product);
  }
});

// given: the skeleton of alice/thesis-tool
// input: the text between its title and its first section
// expect: a preamble that says what a requirement is in this form — it names a requirement's name, its source, its rule and
//         the line `*Check:*` that names its check
test("specSkeleton — a preamble says what a requirement is in this form: its name, source, rule and *Check:*", () => {
  const { preamble } = cut(specSkeleton(GITHUB));
  assert.notEqual(preamble.trim(), "", "there is a preamble between the title and the first section");
  for (const part of [/\bname\b/i, /\bsource\b/i, /\brule\b/i, /\*Check:\*/]) assert.match(preamble, part);
});

// given: the skeleton of alice/thesis-tool
// input: its sections, by their headings of level two
// expect: exactly one section, the first, and under its heading nothing but empty lines
test("specSkeleton — an empty first section, and no other section", () => {
  const { sections } = cut(specSkeleton(GITHUB));
  assert.equal(sections.length, 1, "one section");
  assert.match(sections[0].heading, /^## \S/, "a heading of level two that names the section");
  assert.deepEqual(sections[0].body.filter((l) => l.trim()), [], "nothing under its heading");
  // Known positive: the same reading sees a requirement placed in that section.
  const filled = cut(`${specSkeleton(GITHUB)}\n${A_REQUIREMENT}`).sections;
  assert.equal(filled.length, 1);
  assert.notDeepEqual(filled[0].body.filter((l) => l.trim()), []);
});

// given: the skeleton of alice/thesis-tool
// input: every line of it
// expect: no line begins a requirement (`**NAME** *(source)*`) and none states a check (`*Check:* …`) — it reads as a SPEC
//         without a requirement
test("specSkeleton — reads as a SPEC without a requirement", () => {
  // Known positive: the reading finds the head line and the check of a requirement in this form.
  assert.equal(requirementLines(A_REQUIREMENT).length, 2);
  assert.equal(requirementLines(`${specSkeleton(GITHUB)}\n${A_REQUIREMENT}`).length, 2);
  assert.deepEqual(requirementLines(specSkeleton(GITHUB)), []);
});

// given: two products, alice/thesis-tool and fau-ai-taskforce/tools/thesis-tool
// input: specSkeleton of each, with the product's path replaced by one placeholder
// expect: the two skeletons differ, and are the same text once the product is taken out — only the product is put in
test("specSkeleton — only the product is put in; the rest is the same for every product", () => {
  const a = specSkeleton(GITHUB), b = specSkeleton(GITLAB);
  assert.notEqual(a, b);
  assert.equal(a.split(GITHUB).join("<the product>"), b.split(GITLAB).join("<the product>"));
});
