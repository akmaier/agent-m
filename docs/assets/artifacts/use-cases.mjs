// Use cases — read and checked as docs/use-cases/UC-<nnn>-<slug>.md holds them: the front matter (id, title, area, actors,
// realises), the five parts of the description, and the diagram as a Mermaid block. Every format error is a finding in the
// compiler form of ARC-007: { artifact, line, kind, what, rule, fix }.
// Kernel (ARC-003): pure functions over the texts they are given; nothing is read, and nothing about status is decided.
// tests/artifact_checks.py use_case_findings is the Python twin: the same findings, each `what` word for word, compared on
// the same files by tests/artifacts-twin.test.mjs.
//
// Module: MOD-artifacts

import { parseFrontMatter, reviewedId, isRequirementName } from "../artifacts.mjs";

const FIELDS = "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION";
const REALISES = "A USE CASE REALISES NAMED REQUIREMENTS";
const MERMAID = "DIAGRAMS ARE MERMAID IN MARKDOWN";
const ONE_FILE = "ONE USE CASE, ONE FILE";

// ONE USE CASE, ONE FILE: UC-<nnn>-<slug>.md, three digits and a slug in lower case.
const FILE_NAME = /^UC-(\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
// A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION: the five parts, each a section of its own.
const USE_CASE_SECTIONS = ["Actors", "Precondition", "Main flow", "Alternative flows", "Postcondition"];
// DIAGRAMS ARE MERMAID IN MARKDOWN: a fenced block opened by a line ```mermaid; an image is a Markdown image or an HTML <img>
// whose address, without query or fragment, ends in an image type.
const MERMAID_OPEN = /^```mermaid\s*$/;
const FENCE_CLOSE = /^```\s*$/;
const MD_IMAGE = /!\[[^\]]*\]\(\s*<?([^\s)>]+)/g;
const HTML_IMAGE = /<img\b[^>]*?\bsrc\s*=\s*["']?([^"'\s>]+)/gi;
const IMAGE_TYPE = /\.(png|jpe?g|gif|svg|webp)$/i;

const fileName = (path) => String(path ?? "").split("/").pop();
const isList = (v) => Array.isArray(v);

// The lines of the text, and where the body begins (1-based), as parseFrontMatter splits it.
function layout(text) {
  const lines = text.split("\n");
  const { fields, body } = parseFrontMatter(text);
  const bodyStart = text.length === body.length ? 1 : text.slice(0, text.length - body.length).split("\n").length;
  return { lines, fields, body, bodyStart };
}

// The line of `key:` in the front matter, or of `  - item` under it; 1 when it is not there.
function frontMatterLine(lines, bodyStart, key, item) {
  let inKey = false;
  for (let i = 1; i < bodyStart - 2; i++) {
    const m = /^([a-z][a-z0-9_-]*):/.exec(lines[i]);
    if (m) {
      inKey = m[1] === key;
      if (inKey && item === undefined) return i + 1;
    } else if (inKey && item !== undefined && lines[i].replace(/^\s+-\s+/, "").trim() === item && /^\s+-\s+/.test(lines[i])) {
      return i + 1;
    }
  }
  return 1;
}

// The `## ` sections of a body, in order: { heading, from, to } over the body's lines; a lower heading stays inside.
function sections(bodyLines) {
  const out = [];
  let open = null;
  bodyLines.forEach((l, i) => {
    const m = /^## (.*?)\s*$/.exec(l);
    if ((m || /^# /.test(l)) && open) { open.to = i; open = null; }
    if (m) out.push(open = { heading: m[1], from: i + 1 });
  });
  if (open) open.to = bodyLines.length;
  return out;
}

// The Mermaid blocks of a body: { from, to, source } — `from` the line of ```mermaid, `to` that of its closing fence.
function mermaidBlocks(bodyLines) {
  const out = [];
  for (let i = 0; i < bodyLines.length; i++) {
    if (!MERMAID_OPEN.test(bodyLines[i])) continue;
    let j = i + 1;
    while (j < bodyLines.length && !FENCE_CLOSE.test(bodyLines[j])) j++;
    out.push({ from: i, to: j, source: bodyLines.slice(i + 1, j).join("\n") });
    i = j;
  }
  return out;
}

// Every image a text stores a diagram in: { target, index } — the address as written, and where it stands in the text.
function images(text) {
  const out = [];
  for (const re of [MD_IMAGE, HTML_IMAGE]) {
    for (const m of text.matchAll(re)) {
      if (IMAGE_TYPE.test(m[1].replace(/[?#].*$/, ""))) out.push({ target: m[1], index: m.index });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

// A use case as docs/use-cases/UC-<nnn>-<slug>.md holds it -> { id, title, area, actors, realises, sections, diagrams }.
// `sections` maps each `## ` heading to its prose — without its Mermaid blocks —, `diagrams` holds the source of every Mermaid
// block. Reading never throws: a missing field is "" or [].
export function parseUseCase(path, text) {
  const { lines, fields, bodyStart } = layout(String(text ?? ""));
  const bodyLines = lines.slice(bodyStart - 1);
  const blocks = mermaidBlocks(bodyLines);
  const inBlock = new Set(blocks.flatMap((b) => Array.from({ length: b.to - b.from + 1 }, (_, k) => b.from + k)));
  const out = {};
  for (const s of sections(bodyLines)) {
    out[s.heading] = bodyLines.slice(s.from, s.to).filter((_, k) => !inBlock.has(s.from + k)).join("\n")
      .replace(/\n{3,}/g, "\n\n").trim();
  }
  const str = (v) => (typeof v === "string" ? v : "");
  return {
    id: typeof fields.id === "string" ? fields.id : reviewedId(path),
    title: str(fields.title), area: str(fields.area),
    actors: isList(fields.actors) ? fields.actors : [], realises: isList(fields.realises) ? fields.realises : [],
    sections: out, diagrams: blocks.map((b) => b.source),
  };
}

// The known requirement names as a Set: a list, a Set, or the Map specRequirements returns (its keys).
function nameSet(knownNames) {
  if (knownNames == null) return null;
  return new Set(knownNames instanceof Map ? knownNames.keys() : knownNames);
}

// Every format error of a use case -> [finding]. knownNames (a list, a Set or specRequirements' Map) are the requirements a
// name under `realises` must match; without them only the form of each name is checked. Checked in this order, as the twin:
// the file name, the front matter (nothing more without it), the id against the file name, title, area, the old key `stage`,
// actors, realises and each name under it, the five sections, a Mermaid block, and every image.
export function useCaseProblems(path, text, knownNames) {
  text = String(text ?? "");
  const name = fileName(path);
  const artifact = reviewedId(path) ?? name;
  const out = [];
  const add = (line, rule, what, fix) => out.push({ artifact, line, kind: "error", what, rule, fix });
  const nameMatch = FILE_NAME.exec(name);
  if (!nameMatch) {
    add(1, ONE_FILE, "file name is not UC-<nnn>-<slug>.md",
      "name the file docs/use-cases/UC-<nnn>-<slug>.md: three digits, then a slug of lower-case words joined by hyphens.");
  }
  const { lines, fields, body, bodyStart } = layout(text);
  if (!Object.keys(fields).length) {
    add(1, ONE_FILE, "no front matter",
      "begin the file with a --- block naming id, title, area, actors and realises, closed by a line ---.");
    return out;
  }
  const at = (key, item) => frontMatterLine(lines, bodyStart, key, item);
  if (nameMatch && fields.id !== `UC-${nameMatch[1]}`) {
    const shown = typeof fields.id === "string" ? `"${fields.id}"` : "(none)";
    add("id" in fields ? at("id") : 1, ONE_FILE, `id ${shown} does not match the file name (UC-${nameMatch[1]})`,
      `set id: UC-${nameMatch[1]}, the identifier the file name gives; a use case keeps its identifier.`);
  }
  for (const key of ["title", "area"]) {
    if (!fields[key] || typeof fields[key] !== "string") {
      add(key in fields ? at(key) : 1, FIELDS, `missing ${key}`, `add a line ${key}: <text> to the front matter.`);
    }
  }
  if ("stage" in fields) add(at("stage"), FIELDS, "key 'stage' is now 'area'", "rename the key stage: to area:.");
  if (!isList(fields.actors) || !fields.actors.length) {
    add("actors" in fields ? at("actors") : 1, FIELDS, "actors must be a non-empty list",
      "list every actor under actors:, one per line as   - <actor>.");
  }
  const realises = isList(fields.realises) ? fields.realises : null;
  if (!realises || !realises.length) {
    add("realises" in fields ? at("realises") : 1, REALISES, "realises must be a non-empty list",
      "list the requirements the use case realises under realises:, each by its name in capitals.");
  }
  const known = nameSet(knownNames);
  for (const n of realises || []) {
    if (!isRequirementName(n)) {
      add(at("realises", n), REALISES, `realises: "${n}" is not a requirement name`,
        "name a requirement by its name in capitals, as the SPEC writes it.");
    } else if (known && !known.has(n)) {
      add(at("realises", n), REALISES, `realises "${n}" matches no requirement`, "use an existing name or remove the line.");
    }
  }
  const bodyLines = lines.slice(bodyStart - 1);
  for (const s of USE_CASE_SECTIONS) {
    if (!bodyLines.some((l) => l.trimEnd() === `## ${s}`)) {
      add(1, FIELDS, `missing section '## ${s}'`, `add the section ## ${s} to the description.`);
    }
  }
  if (!mermaidBlocks(bodyLines).length) {
    add(1, MERMAID, "no Mermaid diagram", "draw the use case as a fenced ```mermaid block inside this file.");
  }
  for (const img of images(body)) {
    add(bodyStart + body.slice(0, img.index).split("\n").length - 1, MERMAID, `diagram stored as an image file (${img.target})`,
      "replace the image by the same diagram as a ```mermaid block in this file.");
  }
  return out;
}
