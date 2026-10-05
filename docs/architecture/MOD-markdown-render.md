---
id: MOD-markdown-render
title: Markdown and Mermaid, rendered safely, edited and compared
folder: src/markdown-render/
realises:
follows:
  - ARC-038
  - ARC-049
uses:
  - MOD-text-tools.parseFrontMatter
  - MOD-text-tools.lineDiff
  - MOD-text-tools.Finding
  - MOD-text-tools.formatFinding
provides:
  - renderArtifact
  - renderMermaid
  - openEditor
  - showDifference
  - Editor
  - SaveOutcome
---
# MOD-markdown-render Markdown and Mermaid, rendered safely, edited and compared

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is turning Markdown — every artifact Agent M shows is Markdown
with its diagrams as Mermaid (`ARTIFACTS ARE MARKDOWN`, `DIAGRAMS ARE MERMAID IN MARKDOWN`) — into what a page shows:
sanitised HTML with drawn diagrams, an editor with a live preview, and a difference line by line. Nothing from an
artifact reaches a page unsanitised, and rendering never makes the page call an origin it has not named (`NO SERVER`):
an image or other embedded resource in an artifact is shown as a link, never loaded. The libraries are those ARC-049
decides, vendored.

It runs in a browser — the instance's pages and the Bridge's window.

## Parts

- `index.mjs` — the interface.
- `render.mjs` — Markdown to sanitised HTML, the front matter as a table, identifiers as links.
- `mermaid.mjs` — drawing a diagram; the diagram library is loaded only when a page holds a diagram.
- `editor.mjs` — the editor with its live preview and its marks.
- `difference.mjs` — the difference of two texts, line by line.
- `vendor/` — the vendored libraries for Markdown, sanitising and diagrams, each with its licence file, and a
  `README.md` naming each library, its version and its licence.

## Data

It keeps nothing. It owns the editor's contract with its caller, `Editor` and `SaveOutcome` below, and the list of
vendored libraries in `vendor/README.md` — one line per library: name, version, licence, file.

## Interfaces

- `renderArtifact(text: string, options?: { linkFor?: (identifier: string) -> string | null, frontMatter?: "table" |
  "hidden" }) -> Element` — the rendered text: front matter as a table unless hidden, Markdown as HTML sanitised before it
  is inserted, every Mermaid block drawn with `renderMermaid`, every identifier the caller's `linkFor` resolves turned
  into a link to its view, images and embedded resources shown as links. A part that cannot be rendered is shown as its
  source with the reason; it never throws.
- `renderMermaid(source: string) -> Promise<Element>` — one diagram, drawn with the diagram library's strict security
  level; a diagram that does not parse is shown with the parser's message beside its source. The prose beside a diagram
  stays what holds (`THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW`); this function only draws.
- `openEditor(target: Element, text: string, options: { marks: (text: string) -> Finding[], save: (text: string) ->
  Promise<SaveOutcome>, linkFor?: (identifier: string) -> string | null }) -> Editor` — the editor of
  `EDITS ARE PREPARED ON THE DASHBOARD`: Markdown on the left, the live preview with its diagrams on the right, following
  each keystroke; the caller's marks shown beside their lines in the one compiler form, without blocking; *Save* calls
  `save`. On `refused` the edited text stays in the editor and the newer version is shown beside it with the difference
  (`A REFUSED SAVE KEEPS THE EDIT`); leaving with unsaved changes asks first.
- `Editor` — `{ text() -> string, showDraft(draft: string, against: string) -> void, setMarks(findings: Finding[]) ->
  void, close() -> void }`; `showDraft` puts a participant's draft into the editor as the difference against the current
  text (`A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT`).
- `SaveOutcome` — `{ kind: "saved", link: string } | { kind: "refused", newer: string } | { kind: "failed", reason:
  string }` — what the caller's `save` returns to the editor.
- `showDifference(before: string, after: string, options?: { context?: number }) -> Element` — the two texts line by
  line, added and removed lines marked, with `context` unchanged lines around each change.

## Files

It reads the files of its `vendor/` folder. It writes nothing.

## Uses

- MOD-text-tools.parseFrontMatter — to show the front matter of an artifact as a table.
- MOD-text-tools.lineDiff — the differences it shows.
- MOD-text-tools.Finding, MOD-text-tools.formatFinding — the marks beside the editor's lines.
