// MOD-markdown-render — Markdown and Mermaid, rendered safely, edited and compared (docs/architecture/MOD-markdown-render.md):
// its interface. renderArtifact renders Markdown to sanitised HTML, draws Mermaid through the local library, and presents front
// matter as a table when asked. renderMermaid draws one Mermaid source and showDifference presents a bounded line difference.
// openEditor offers the Editor text(), setMarks(), showDraft() and close() interface, including its leaving-unsaved-changes
// flow.
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
 * The editor openEditor returns: the text in it now, caller-supplied marks, a draft against its current text, and closing.
 * @typedef {{ text(): string, setMarks(findings: Finding[]): void, showDraft(draft: string, against: string): void,
 *   close(): void }} Editor
 */

export { renderArtifact } from "./render.mjs";
export { renderMermaid } from "./mermaid.mjs";
export { showDifference } from "./difference.mjs";
export { openEditor } from "./editor.mjs";
