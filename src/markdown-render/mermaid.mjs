// Mermaid drawing boundary: a local library produces a strict, safe SVG diagram.
// Module: MOD-markdown-render
import DOMPurify from "./vendor/purify.es.mjs";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);
let ready = false;
let loading;
let libraryScript;
const failed = (source, error) => {
  const element = document.createElement("div");
  element.className = "unrendered";
  element.innerHTML = `<p>Diagram error: ${esc(error?.message ?? error)}</p><pre><code>${esc(source)}</code></pre>`;
  return element;
};
const PRESENTATION = new Set(["fill", "stroke", "filter", "marker-start", "marker-mid", "marker-end", "clip-path", "mask", "cursor"]);
function unsafeCss(value) {
  if (/@|\\|\/\*|\bimage-set\s*\(/i.test(value)) return true;
  const allowed = new Set(["url", "rgb", "rgba", "hsl", "hsla", "drop-shadow", "var", "not", "is", "where", "nth-child"]);
  for (const match of value.matchAll(/\b([a-z-]+)\s*\(/gi)) {
    if (!allowed.has(match[1].toLowerCase())) return true;
  }
  for (const match of value.matchAll(/\burl\s*\(([^)]*)\)/gi)) {
    if (!/^\s*(?:#[-\w:.]+|'#[-\w:.]+'|"#[-\w:.]+")\s*$/.test(match[1])) return true;
  }
  const urls = [...value.matchAll(/\burl\s*\(/gi)].length;
  const complete = [...value.matchAll(/\burl\s*\(([^)]*)\)/gi)].length;
  return urls !== complete;
}
function safeSvg(root) {
  for (const node of root.getElementsByTagName("*")) {
    for (const attribute of node.attributes ?? []) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;
      if ((name === "href" || name === "xlink:href") && !value.startsWith("#")) return false;
      if ((name === "style" || PRESENTATION.has(name)) && unsafeCss(value)) return false;
    }
    if (node.localName === "style" && unsafeCss(node.textContent)) return false;
  }
  return true;
}

async function rejectImageMetadata(mermaid, source) {
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  const vertices = diagram.db?.getVertices?.() ?? diagram.db?.getData?.()?.nodes ?? [];
  const values = vertices instanceof Map ? vertices.values() : Object.values(vertices);
  if ([...values].some((vertex) => vertex?.img)) throw new Error("the diagram contains an image resource");
}

async function library() {
  if (globalThis.mermaid) return globalThis.mermaid;
  if (!loading || !libraryScript.parentNode) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      libraryScript = script;
      script.setAttribute("src", new URL("./vendor/mermaid.min.js", import.meta.url).href);
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error("the Mermaid library could not be loaded")), { once: true });
      (document.body ?? document.documentElement).appendChild(script);
    });
  }
  await loading;
  if (!globalThis.mermaid) throw new Error("the Mermaid library did not initialise");
  return globalThis.mermaid;
}

export async function renderMermaid(source) {
  try {
    const m = await library();
    if (!ready) {
      m.initialize({ startOnLoad: false, securityLevel: "strict", htmlLabels: false });
      ready = true;
    }
    const element = document.createElement("div");
    element.className = "mermaid";
    element.textContent = source;
    await rejectImageMetadata(m, source);
    await m.run({ nodes: [element] });
    element.innerHTML = DOMPurify.sanitize(element.innerHTML, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ["foreignObject", "image", "feImage"],
      FORBID_ATTR: ["href", "xlink:href"],
    });
    if (!safeSvg(element)) throw new Error("the diagram contains an external resource");
    return element;
  }
  catch (error) {
    return failed(source, error);
  }
}
