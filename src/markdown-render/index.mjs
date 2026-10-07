// MOD-markdown-render — Markdown and Mermaid, rendered safely, edited and compared (docs/architecture/MOD-markdown-render.md):
// its interface. Of it, ITM-220 builds, for what UC-002's page needs, renderArtifact — Markdown rendered to sanitised HTML, a
// Mermaid block shown as its source with the reason — and openEditor, whose Editor offers text(). renderMermaid and the
// diagram library, showDifference, renderArtifact's front matter as a table and its links for identifiers, the Editor's
// showDraft, setMarks and close, and asking before unsaved changes are left are not built yet.
//
// Module: MOD-markdown-render
//
// It belongs to the Site (ARC-038) and runs in a browser. It uses MOD-text-tools' formatFinding and lineDiff. Every other file
// of this folder is private to it; vendor/ holds marked and DOMPurify (ARC-049), each beside its licence file, named with its
// version in vendor/README.md.

/**
 * What the caller's `save` returns to the editor.
 * @typedef {{ kind: "saved", link: string } | { kind: "refused", newer: string } | { kind: "failed", reason: string }} SaveOutcome
 */

/**
 * The editor openEditor returns: the text in it now.
 * @typedef {{ text(): string }} Editor
 */

export { renderArtifact } from "./render.mjs";
export { openEditor } from "./editor.mjs";
