// Code — the code files of a repository and the imports between its module folders (MOD-trace-graph, Parts: `code.mjs`).
// A code file is a file whose extension is one of those the module's Data lists, outside `docs/`, test files and folders named
// `vendor` or `node_modules`. For JavaScript, TypeScript, Python and CSS the file is read for its imports; a file of another
// extension is a code node whose imports are not read. A specifier that begins with `.` is resolved against the importing
// file's directory, any other against the repository's root; the module imported is the one whose `folder` is the beginning of
// the resolved path, and an `imports` edge is made only when that module is another than the importing file's own.
//
// Module: MOD-trace-graph

import { isTestFile } from "../test-document/index.mjs";

const SCRIPT = ["js", "mjs", "cjs", "jsx", "ts", "tsx", "mts", "cts"];
const READ = new Set([...SCRIPT, "py", "css"]);
const NOT_READ = new Set(["rb", "go", "rs", "java", "kt", "kts", "scala", "c", "h", "cc", "cpp", "hpp", "cs", "swift", "m", "php",
  "pl", "lua", "r", "jl", "sh", "bash", "zsh", "ps1", "sql", "scss", "html", "vue", "svelte", "dart", "ex", "exs", "erl", "hs", "ml",
  "fs", "clj"]);

const extensionOf = (path) => /\.([A-Za-z0-9]+)$/.exec(path)?.[1].toLowerCase();

/** Whether a path is a code file of the module's Data. */
export function isCodePath(path) {
  const extension = extensionOf(path);
  return !path.startsWith("docs/") && !isTestFile(path) && !path.split("/").some((part) => part === "vendor" || part === "node_modules")
    && (READ.has(extension) || NOT_READ.has(extension));
}

/** Whether the imports of a code file's language are read: JavaScript, TypeScript, Python and CSS. */
export const readsImports = (path) => READ.has(extensionOf(path));

const lineAt = (text, index) => text.slice(0, index).split("\n").length;
// A whole line that is a comment holds no import.
const inComment = (text, index) => /^(?:\/\/|\/\*|\*)/.test(text.slice(text.lastIndexOf("\n", index - 1) + 1, index).trimStart());

// JavaScript and TypeScript: a static `import … from "x"`, `import "x"` or `export … from "x"` that begins a line (the clause
// before `from` holds no other import or export), a `import("x")` and a `require("x")` with a string literal.
const STATIC = /^[ \t]*(?:import|export)\b(?:(?:(?!\b(?:import|export)\b)[^'"`;()=])*?\bfrom)?\s*(["'])([^"'\r\n]+)\1/gm;
const DYNAMIC = /\b(?:import|require)[ \t]*\([ \t]*(["'])([^"'\r\n]+)\1[ \t]*\)/g;
function scriptImports(text) {
  const found = [...text.matchAll(STATIC)].map((match) => ({ at: match.index, specifier: match[2] }));
  for (const match of text.matchAll(DYNAMIC)) {
    if (!inComment(text, match.index)) found.push({ at: match.index, specifier: match[2] });
  }
  return found;
}

// Python: `import a.b` and `from a.b import c` name a path from the root, `from . import c` and `from ..a import c` one relative to
// the file's directory; each is given as the specifier of that path.
const PY_IMPORT = /^[ \t]*import[ \t]+([^\r\n#]+)/gm;
const PY_FROM = /^[ \t]*from[ \t]+(\.*)([A-Za-z_][\w.]*)?[ \t]+import\b/gm;
function pythonImports(text) {
  const found = [];
  for (const match of text.matchAll(PY_IMPORT)) {
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0];
      if (/^[A-Za-z_][\w.]*$/.test(name)) found.push({ at: match.index, specifier: name.replaceAll(".", "/") });
    }
  }
  for (const match of text.matchAll(PY_FROM)) {
    const dots = match[1].length, name = (match[2] ?? "").replaceAll(".", "/");
    found.push({ at: match.index, specifier: dots === 0 ? name : `${dots === 1 ? "./" : "../".repeat(dots - 1)}${name}` });
  }
  return found;
}

// CSS: `@import "x"` and `@import url("x")`.
const CSS_IMPORT = /@import\s+(?:url\(\s*)?(["'])([^"'\r\n]+)\1/g;
function cssImports(text) {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
  return [...code.matchAll(CSS_IMPORT)].map((match) => ({ at: match.index, specifier: match[2] }));
}

/**
 * The imports a code file of a language whose imports are read writes, in the order they stand: the specifier as written (for
 * Python, as the path it names) and the line the import begins on.
 * @param {string} path
 * @param {string} text
 * @returns {{ specifier: string, line: number }[]}
 */
export function importsOf(path, text) {
  const extension = extensionOf(path);
  const found = extension === "py" ? pythonImports(text) : extension === "css" ? cssImports(text) : scriptImports(text);
  return found.sort((a, b) => a.at - b.at).map(({ at, specifier }) => ({ specifier, line: lineAt(text, at) }));
}

// The path a specifier names: against the importing file's directory where it begins with `.`, against the root otherwise;
// null where it climbs out of the repository.
function resolve(importer, specifier) {
  const parts = specifier.startsWith(".") ? importer.split("/").slice(0, -1) : [];
  for (const part of specifier.split("/")) {
    if (part === "" || part === ".") continue;
    if (part !== "..") parts.push(part);
    else if (parts.length) parts.pop();
    else return null;
  }
  return parts.join("/");
}

/**
 * The function that tells which module a path belongs to: the module whose `folder` is the longest beginning of the path, or null.
 * @param {{ id: string, folder: string }[]} modules
 * @returns {(path: string) => string | null}
 */
export function moduleFinder(modules) {
  const folders = modules.map(({ id, folder }) => ({ id, folder: folder.endsWith("/") ? folder : `${folder}/` }))
    .sort((a, b) => b.folder.length - a.folder.length);
  return (path) => folders.find(({ folder }) => `${path}/`.startsWith(folder))?.id ?? null;
}

/**
 * The `imports` edges of the code files: for each import, an edge from the importing file to the module whose folder begins the
 * path the specifier names, unless that is the module the importing file is in.
 * @param {{ from: string, imports: { specifier: string, line: number }[] }[]} files
 * @param {{ id: string, folder: string }[]} modules
 * @returns {{ from: string, to: string, path: string, line: number }[]}
 */
export function importEdges(files, modules) {
  const moduleOf = moduleFinder(modules);
  const edges = [];
  for (const { from, imports } of files) {
    const own = moduleOf(from);
    for (const { specifier, line } of imports) {
      const path = resolve(from, specifier);
      const to = path === null ? null : moduleOf(path);
      if (to !== null && to !== own) edges.push({ from, to, path: from, line });
    }
  }
  return edges;
}
