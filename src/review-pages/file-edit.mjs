// file-edit.mjs — editing a reviewed file on the dashboard (MOD-review-pages, Parts): the editor opens on the file's
// current text, shows the descriptor's marks, and saves through MOD-artifact-edits on the blob it opened.
//
// Module: MOD-review-pages

import { fallbackEditLinks, saveFile } from "../artifact-edits/index.mjs";
import { artifactSchemas, documentFindings, readDocument } from "../documents/index.mjs";
import { openEditor, renderArtifact } from "../markdown-render/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { el, link, parseServer, TOKEN_STEP } from "./common.mjs";

const SCHEMA = { "use-case": "useCase", "architecture-decision": "decision", module: "module" };
const REALISES = "A USE CASE REALISES NAMED REQUIREMENTS";

const unquote = (text) => text.trim().replace(/^["']|["']$/g, "");

function schemaOf(kind) {
  return artifactSchemas()[SCHEMA[kind.kind]];
}

function listLines(text, key) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return [];
  const found = [];
  for (let at = 1; at < lines.length && lines[at] !== "---"; at++) {
    const start = new RegExp(`^${key}:\\s*(.*)$`).exec(lines[at]);
    if (!start) continue;
    if (start[1].trim()) found.push({ value: unquote(start[1]), line: at + 1 });
    for (let row = at + 1; row < lines.length && /^\s/.test(lines[row]); row++) {
      const item = /^\s*-\s*(.+?)\s*$/.exec(lines[row]);
      if (item) found.push({ value: unquote(item[1]), line: row + 1 });
    }
    return found;
  }
  return found;
}

function unmatchedRealises(artifact, text, requirements) {
  return listLines(text, "realises")
    .filter(({ value }) => value && !requirements.has(value))
    .map(({ value, line }) => finding({ artifact, line, kind: "error", rule: REALISES,
      what: `realises "${value}", which matches no requirement`, fix: "use an existing requirement name or remove it" }));
}

function fallbackPages(target, pages) {
  if (pages.refused) return false;
  const list = el("ul", "pages");
  for (const page of pages) {
    list.append(el("li", null, link(page.url, "github-page", `Open GitHub's page for ${page.path}`),
      page.differs ? el("p", "problem", "The file differs on the default branch; compare before committing.") : "",
      el("pre", "clipboard-text", page.text)));
  }
  target.replaceChildren(el("p", null, "There is no token: GitHub's page opens for the file, and you commit it there."), list);
  return true;
}

export async function showFileEdit(where, kind, file) {
  const { target, snapshot, token, host, context } = where;
  const body = await snapshot.read(file.path);
  if (body === null) {
    target.append(el("p", "problem", `No ${kind.noun} ${file.id} on the default branch.`));
    return;
  }
  target.append(el("h2", null, `Edit ${file.id}`), explain(kind.explain.edit ?? kind.explain.one));
  if (!token && parseServer(context) === "gitlab") {
    target.append(renderArtifact(body), el("p", "problem", "A GitLab product is written with the project's own token. ",
      link(TOKEN_STEP, "token-step", "Store the token")));
    return;
  }

  const schema = schemaOf(kind);
  const spec = await snapshot.read("SPEC.md");
  const requirements = spec === null ? new Set() : new Set(parseSpec(spec).requirements.keys());
  const openedBlob = snapshot.blob(file.path);
  const saved = el("div", "saved");
  const editorBox = el("div", "editor-box");
  target.append(editorBox, saved);

  const marks = (text) => {
    const document = readDocument(schema, file.path, text);
    const found = documentFindings(schema, document);
    if (kind.kind === "use-case") found.push(...unmatchedRealises(document.id ?? file.id, text, requirements));
    return found;
  };
  const disabledReason = (text) => {
    const id = readDocument(schema, file.path, text).id;
    return id === file.id ? null : `the identifier changed from ${file.id} to ${id ?? "none"}; keep ${file.id}.`;
  };
  const fallbackFor = (text) => fallbackEditLinks([{ path: file.path, text, existing: openedBlob !== null }], snapshot);

  async function save(text) {
    if (!token) {
      return fallbackPages(saved, fallbackFor(text)) ? { kind: "failed", reason: "there is no token, so nothing was committed from here." }
        : { kind: "failed", reason: "a GitLab product is written with the project's own token." };
    }
    try {
      const outcome = await saveFile(host, { path: file.path, text, openedBlob, openedId: file.id });
      if (outcome.refused === "changed meanwhile") return { kind: "refused", newer: outcome.current ?? "" };
      if (outcome.refused === "identifier changed") {
        return { kind: "failed", reason: `the identifier changed from ${outcome.openedId} to ${outcome.nowId ?? "none"}; keep ${outcome.openedId}.` };
      }
      return { kind: "saved", link: `${snapshot.repository.web}/commit/${outcome.commit}` };
    } catch (failure) {
      if (failure.name === "PermissionMissing" && fallbackPages(saved, fallbackFor(text))) {
        return { kind: "failed", reason: failure.message };
      }
      return { kind: "failed", reason: `${failure.name}: ${failure.message}` };
    }
  }

  openEditor(editorBox, body, { marks, save, disabledReason });
}
