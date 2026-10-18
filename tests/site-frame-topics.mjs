// The frame's own check of the topics (MOD-site-frame, EVERY STEP EXPLAINS ITSELF): which topics the views and the Bridge's window name, which topics
// src/site-frame/explanations.md holds, and which named topics it does not hold. A topic the file lacks shows nothing at run time (explain returns an empty
// element and never throws), so this check, run over the files of src/, is where a mistyped or missing topic is found.
//
// A file NAMES a topic in two forms, each read from its source text, never from running it:
//   - a call of explain, folded or sourceExplain whose first argument is a double-quoted literal: explain("accepting");
//   - the double-quoted literals that stand as values in an object literal bound to a name that contains "explain" or "topic" (in any case):
//     `explain: { list: "accepting", draft: { whole: "what-is-an-architecture" } }` and `const TYPE_TOPIC = { person: "participant-person" }`. A literal
//     followed by a colon is a key, not a topic.
// Comments are skipped. It is code only; it holds no expected result. The one copy: tests/site-frame.test.mjs uses it.
//
// Module: MOD-site-frame
// Level: unit

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const CALLS = new Set(["explain", "folded", "sourceExplain"]);
const TABLE_NAME = /explain|topic/i;

// The tokens of a JavaScript source text that this check needs: string literals (with their quote), identifiers and single punctuation characters; comments and
// whitespace are dropped. A template literal is one opaque string token.
function tokens(text) {
  const out = [];
  for (let i = 0; i < text.length;) {
    const c = text[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "/" && text[i + 1] === "/") { while (i < text.length && text[i] !== "\n") i++; continue; }
    if (c === "/" && text[i + 1] === "*") { const end = text.indexOf("*/", i + 2); i = end < 0 ? text.length : end + 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let value = "";
      let j = i + 1;
      for (; j < text.length && text[j] !== c; j++) {
        if (text[j] === "\\") { j++; value += text[j] ?? ""; } else value += text[j];
      }
      out.push({ kind: "string", quote: c, value });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < text.length && /[\w$]/.test(text[j])) j++;
      out.push({ kind: "name", value: text.slice(i, j) });
      i = j;
      continue;
    }
    out.push({ kind: "punct", value: c });
    i++;
  }
  return out;
}

/** topicsNamed(sourceText: string) -> string[] — the topics one source text names, in the order it names them, each once. */
export function topicsNamed(sourceText) {
  const list = tokens(sourceText);
  const named = [];
  for (let i = 0; i < list.length; i++) {
    const token = list[i];
    if (token.kind !== "name") continue;
    const next = list[i + 1];
    if (CALLS.has(token.value) && next?.value === "(" && next.kind === "punct" && list[i + 2]?.kind === "string" && list[i + 2].quote === '"') {
      named.push(list[i + 2].value);
      continue;
    }
    if (TABLE_NAME.test(token.value) && (next?.value === ":" || next?.value === "=") && next.kind === "punct" && list[i + 2]?.value === "{" && list[i + 2].kind === "punct") {
      let depth = 0;
      for (let j = i + 2; j < list.length; j++) {
        const inside = list[j];
        if (inside.kind === "punct" && inside.value === "{") depth++;
        else if (inside.kind === "punct" && inside.value === "}") { if (--depth === 0) break; }
        else if (inside.kind === "string" && inside.quote === '"' && !(list[j + 1]?.kind === "punct" && list[j + 1].value === ":")) named.push(inside.value);
      }
    }
  }
  return [...new Set(named)];
}

/** topicsHeld(explanationsText: string) -> Set<string> — the topics of an explanations file: the text after `## ` on each heading line. */
export function topicsHeld(explanationsText) {
  return new Set([...explanationsText.matchAll(/^## (.+)$/gm)].map((heading) => heading[1].trim()));
}

/**
 * topicFindings(files: { path: string, text: string }[], explanationsText: string) -> { path: string, topic: string }[] — every topic that a file names and the
 * explanations file does not hold, with the file that names it; none when all are held.
 */
export function topicFindings(files, explanationsText) {
  const held = topicsHeld(explanationsText);
  return files.flatMap(({ path, text }) => topicsNamed(text).filter((topic) => !held.has(topic)).map((topic) => ({ path, topic })));
}

/** viewFiles(root: string) -> { path: string, text: string }[] — every .mjs file under src/ of the repository at `root`, with its path relative to `root`. */
export function viewFiles(root) {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : walk(path);
    return entry.name.endsWith(".mjs") ? [{ path: relative(root, path), text: readFileSync(path, "utf8") }] : [];
  });
  return walk(join(root, "src"));
}
