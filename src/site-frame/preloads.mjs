// preloads.mjs — the block of preloads each entry page carries in its <head> (docs/architecture/MOD-site-frame.md, Parts).
// Without a build, a browser finds a page's files level by level: it learns a module's imports only once that module has
// arrived, and a file a module reads as it is loaded only once that module runs. The block names every such file of the page,
// so that the browser asks for all of them at once, as the page arrives:
//   - `<link rel="modulepreload">` for each module the page loads as it starts: the static import closure of its module script
//     and of the view module of every slug its `data-views` names, which the frame loads on every start (routing.mjs'
//     viewAddress), a JSON module with `as="json"`. A module the page imports only when a route is shown is not among them.
//   - `<link rel="preload" as="fetch" crossorigin>` for each file of the repository those modules fetch as they are evaluated —
//     a module's schema, register or explanations, which it fetches from its own address in a browser. Which files those are is
//     found by evaluating the modules in a separate Node process as a browser runs them (filesRead).
//
// Run in the repository's root: `node src/site-frame/preloads.mjs` writes the block of every entry page; with `--check` it writes
// nothing and exits with 1, naming the page, when a page's block differs from what this file computes.
// tests/site-frame-preloads.test.mjs runs the same comparison, so that a pull request whose block is stale fails.
//
// Module: MOD-site-frame
// Runs in Node only. Throws for an entry page without a module script, for an import a browser cannot load, and for an import of
// a module that is not in the repository.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, relative, sep } from "node:path";
import { viewAddress } from "./routing.mjs";

const ROOT = new URL("../../", import.meta.url);

/** The entry pages of the instance's site, by their path from the repository's root (ARC-038). */
export const ENTRY_PAGES = ["index.html", "docs/index.html"];

export const BEGIN = "<!-- preloads: written by `node src/site-frame/preloads.mjs`; tests/site-frame-preloads.test.mjs fails when they are stale -->";
export const END = "<!-- /preloads -->";

// A static `import … from "x"`, `import "x"` or `export … from "x"` that begins a line, the pattern MOD-trace-graph's code.mjs
// reads imports with; the clause before `from` holds no other import or export.
const STATIC = /^[ \t]*(?:import|export)\b(?:(?:(?!\b(?:import|export)\b)[^'"`;()=])*?\bfrom)?\s*(["'])([^"'\r\n]+)\1/gm;

const isModule = (url) => /\.(?:m|c)?js$/.test(url.pathname);
const isJson = (url) => /\.json$/.test(url.pathname);
const fromRoot = (url) => relative(fileURLToPath(ROOT), fileURLToPath(url)).split(sep).join("/");

/**
 * The modules a module imports statically, as file URLs: its JavaScript modules and its JSON modules.
 * @param {URL} file
 * @returns {URL[]}
 */
export function staticImports(file) {
  const found = [];
  for (const [, , specifier] of readFileSync(file, "utf8").matchAll(STATIC)) {
    if (!/^\.{0,2}\//.test(specifier)) throw new Error(`preloads.mjs: ${fromRoot(file)} imports "${specifier}", which a browser cannot load`);
    const url = new URL(specifier, file);
    if (!isModule(url) && !isJson(url)) continue;
    if (!existsSync(url)) throw new Error(`preloads.mjs: ${fromRoot(file)} imports ${specifier}, which is not in the repository`);
    found.push(url);
  }
  return found;
}

/**
 * The static import closure of the given modules, breadth first, each with its level: 0 for a given module, one more than the
 * module that first names it otherwise — the round trip in which a browser without the block asks for it.
 * @param {URL[]} starts
 * @returns {Map<string, number>} file URL → level
 */
export function closure(starts) {
  const level = new Map(starts.map((url) => [url.href, 0]));
  const queue = [...starts];
  while (queue.length) {
    const file = queue.shift();
    for (const next of isJson(file) ? [] : staticImports(file)) {
      if (level.has(next.href)) continue;
      level.set(next.href, level.get(file.href) + 1);
      queue.push(next);
    }
  }
  return level;
}

// The page's module script and its `data-views`.
function moduleScript(page, html) {
  const tag = /<script\b[^>]*\btype="module"[^>]*>/.exec(html)?.[0];
  const src = tag && /\bsrc="([^"]+)"/.exec(tag)?.[1];
  if (!src) throw new Error(`preloads.mjs: ${page} has no module script`);
  const views = (/\bdata-views="([^"]*)"/.exec(tag)?.[1] ?? "").split(/\s+/).filter(Boolean);
  return { script: new URL(src, new URL(page, ROOT)), views };
}

// The files of the repository, other than modules, that the given modules fetch as they are evaluated in a browser. A separate
// Node process imports them as a browser runs them: Node's built-in modules are hidden from them, so that each module's
// own-file helper takes its browser branch and fetches the file from the module's own address, and `fetch` answers such an
// address from the disk and records it.
const RECORDER = `
import { readFileSync } from "node:fs";
const seen = new Set();
globalThis.fetch = async (address) => {
  const url = new URL(String(address instanceof Request ? address.url : address));
  if (url.protocol !== "file:") throw new Error("preloads.mjs: a module fetched " + url.href + " as it was evaluated");
  seen.add(url.href);
  return new Response(readFileSync(url));
};
process.getBuiltinModule = () => undefined;
for (const module of JSON.parse(process.argv[1])) await import(module);
process.stdout.write(JSON.stringify([...seen]));
`;
function filesRead(modules) {
  const seen = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", RECORDER, JSON.stringify(modules)],
    { cwd: fileURLToPath(ROOT), encoding: "utf8", maxBuffer: 1 << 26 }));
  return seen.filter((href) => href.startsWith(ROOT.href) && !isModule(new URL(href)) && !modules.includes(href));
}

/**
 * What an entry page loads as it starts.
 * @param {string} page — path from the repository's root
 * @param {string} [html] — the page's text
 * @returns {{ modules: string[], files: string[], depth: number }} modules and the other files they read as they are evaluated,
 *   as paths relative to the page, sorted; depth — the levels of modules a browser without the block asks for one after the other
 */
export function pageLoads(page, html = readFileSync(new URL(page, ROOT), "utf8")) {
  const { script, views } = moduleScript(page, html);
  const first = closure([script]);
  const firstDepth = Math.max(...first.values());
  const later = closure(views.map((slug) => new URL(viewAddress(slug))));
  let depth = firstDepth;
  for (const [href, n] of later) if (!first.has(href)) depth = Math.max(depth, firstDepth + 1 + n);
  const modules = [...new Set([...first.keys(), ...later.keys()])];
  // The page's own module script runs only in the page; the modules it imports are evaluated without it.
  const files = filesRead(modules.filter((href) => href !== script.href && isModule(new URL(href))));
  const pageDir = dirname(fileURLToPath(new URL(page, ROOT)));
  const fromPage = (href) => relative(pageDir, fileURLToPath(href)).split(sep).join("/");
  return { modules: modules.map(fromPage).sort(), files: files.map(fromPage).sort(), depth: depth + 1 };
}

/**
 * The block an entry page carries, indented as the page's `<head>` is.
 * @param {string} page
 * @param {string} [html]
 * @returns {string}
 */
export function preloadBlock(page, html) {
  const { modules, files } = pageLoads(page, html);
  return [BEGIN,
    ...modules.map((path) => `<link rel="modulepreload"${path.endsWith(".json") ? ' as="json"' : ""} href="${path}">`),
    ...files.map((path) => `<link rel="preload" as="fetch" crossorigin href="${path}">`),
    END].map((line) => `  ${line}`).join("\n");
}

const literally = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BLOCK = new RegExp(`[ \\t]*${literally(BEGIN)}[\\s\\S]*?${literally(END)}`);

/**
 * The page with its block as this file computes it: the block replaced where the page has one, put before `</head>` otherwise.
 * @param {string} page
 * @param {string} html
 * @returns {string}
 */
export function withBlock(page, html) {
  const block = preloadBlock(page, html);
  if (BLOCK.test(html)) return html.replace(BLOCK, () => block);
  if (!html.includes("</head>")) throw new Error(`preloads.mjs: ${page} has no </head>`);
  return html.replace("</head>", () => `${block}\n</head>`);
}

/**
 * The entry pages whose block differs from what this file computes.
 * @returns {string[]}
 */
export function stalePages() {
  return ENTRY_PAGES.filter((page) => {
    const html = readFileSync(new URL(page, ROOT), "utf8");
    return withBlock(page, html) !== html;
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--check")) {
    const stale = stalePages();
    for (const page of stale) console.error(`${page}: its preloads are stale; run node src/site-frame/preloads.mjs`);
    process.exit(stale.length ? 1 : 0);
  }
  for (const page of ENTRY_PAGES) {
    const file = new URL(page, ROOT);
    const html = readFileSync(file, "utf8");
    const next = withBlock(page, html);
    if (next !== html) writeFileSync(file, next);
    const { modules, files, depth } = pageLoads(page, next);
    console.log(`${page}: ${modules.length} modules, ${files.length} files they read; ${depth} levels of modules without the block`);
  }
}
