// Markdown to sanitised HTML (MOD-markdown-render, Interfaces: renderArtifact), with md() of docs/assets/dashboard-app.mjs as
// its model: marked turns the Markdown into HTML, and DOMPurify sanitises it before it reaches the page (ARC-049).
//
// Module: MOD-markdown-render
//
// The sanitiser keeps only the elements and attributes that Markdown writes, so no script, event handler or `javascript:`
// address of a text runs, and nothing a text names is loaded (NO SERVER): an image is written as a link to its address, and an
// image or other embedded resource written in HTML is removed. A Mermaid block is shown as its source with the reason, since
// this module draws no diagram; so is a whole text that cannot be rendered — renderArtifact never throws.

import { Marked } from "./vendor/marked.esm.js";
import DOMPurify from "./vendor/purify.es.mjs";

const h = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// A part of a text shown as its source, with the reason it is not rendered.
const unrendered = (source, reason) => `<div class="unrendered"><p>${h(reason)}</p><pre><code>${h(source)}</code></pre></div>`;

const NOT_DRAWN = "This diagram is not drawn: this page shows diagrams as their Mermaid source.";

const markdown = new Marked({
  renderer: {
    // An image is a link to its address: it is never loaded.
    image({ href, title, text }) {
      return `<a href="${h(href)}"${title ? ` title="${h(title)}"` : ""}>${h(text || href)}</a>`;
    },
    // A Mermaid block is shown as its source; every other block as marked writes it.
    code({ text, lang }) {
      return /^mermaid(?:\s|$)/.test(lang ?? "") ? unrendered(text, NOT_DRAWN) : false;
    },
  },
});

// What Markdown writes, and the source shown of a part that is not rendered, is all that may reach the page.
const SANITISE = {
  ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "blockquote", "pre", "code", "em", "strong", "del", "a",
    "ul", "ol", "li", "input", "table", "thead", "tbody", "tr", "th", "td", "div"],
  ALLOWED_ATTR: ["href", "title", "class", "start", "align", "type", "checked", "disabled"],
};

// renderArtifact(text: string) -> Element — the text rendered, sanitised before it is inserted. It never throws: a text that
// cannot be rendered, or a browser that cannot sanitise, shows the text as its source with the reason.
export function renderArtifact(text) {
  const rendered = document.createElement("div");
  rendered.className = "md";
  try {
    if (!DOMPurify.isSupported) throw new Error("this browser cannot sanitise HTML");
    rendered.innerHTML = DOMPurify.sanitize(markdown.parse(text), SANITISE);
  } catch (e) {
    rendered.innerHTML = unrendered(text, `This text is not rendered: ${e?.message ?? e}`);
  }
  return rendered;
}
