// MOD-markdown-render — Markdown and Mermaid, rendered safely, edited and compared (docs/architecture/MOD-markdown-render.md):
// its interface. renderArtifact renders Markdown to sanitised HTML, draws Mermaid through the local library, and presents front
// matter as a table when asked. renderMermaid draws one Mermaid source and showDifference presents a bounded line difference.
// openEditor offers the existing Editor text() interface; its later Editor methods and leaving-unsaved-changes flow are outside
// this module's current interface.
//
// Module: MOD-markdown-render
//
// It belongs to the Site (ARC-038) and runs in a browser. It uses MOD-text-tools' formatFinding and lineDiff. Every other file
// of this folder is private to it; vendor/ holds marked, DOMPurify and Mermaid (ARC-049), each beside its licence file, named
// with its version in vendor/README.md.

/**
 * What the caller's `save` returns to the editor.
 * @typedef {{ kind: "saved", link: string } | { kind: "refused", newer: string } | { kind: "failed", reason: string }} SaveOutcome
 */

/**
 * The editor openEditor returns: the text in it now.
 * @typedef {{ text(): string }} Editor
 */

export { renderArtifact } from "./render.mjs";
export { renderMermaid } from "./mermaid.mjs";
export { showDifference } from "./difference.mjs";
export { openEditor } from "./editor.mjs";
