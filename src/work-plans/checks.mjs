// The findings of a backlog (docs/architecture/MOD-work-plans.md, Interfaces: backlogFindings; A BACKLOG ITEM NAMES WHAT IT
// REALISES, A BACKLOG ITEM NAMES THE MODULES IT CHANGES; UC-032 step 3). Pure: the items and the architecture's module files are
// handed in as Documents; nothing is read, written or requested.
//
// Module: MOD-work-plans
//
// An item is a Document as MOD-documents' readDocument gives it for the item schema — `id`, `path`, and `fields` holding `title`,
// `realises`, `modules` and `builds_on` — and the architecture a list of Documents of which those of kind `module` are the
// module files. A Document carries no line for a front matter field, so every finding names line 1, where the front matter
// begins. A finding is MOD-text-tools' `finding`.

import { classifyCandidates } from "../documents/index.mjs";
import { finding } from "../text-tools/index.mjs";

const REALISES = "A BACKLOG ITEM NAMES WHAT IT REALISES";
const MODULES = "A BACKLOG ITEM NAMES THE MODULES IT CHANGES";
// The rule of the item schema (artifactSchemas().item) that no closer part of it names: it applies to builds_on.
const BACKLOG = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY";
// An item that restates another is found as MOD-documents' classifyCandidates finds an exact duplicate, by the schema's key, the title.
const DUPLICATE = "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL";

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
// A list as a Document holds it — or as a comma-separated line, where a field was read as text; a blank entry names nothing.
const list = (value) => (Array.isArray(value) ? value.map(text) : text(value).split(","))
  .map((part) => part.trim()).filter(Boolean);
const idOf = (document) => text(document?.id ?? document?.fields?.id);
const fieldList = (document, field) => list(document?.fields?.[field]);
const titleOf = (document) => text(document?.fields?.title ?? document?.title);

/**
 * backlogFindings(items: Document[], architecture: Document[]) -> Finding[] — for each item in the order given: an error for
 * an item that realises nothing; an error for an item that names no module that a module file of the architecture describes;
 * an error for each item it builds on that is not among `items`; an error for each item it builds on that builds on it in turn;
 * and a warning for an item whose title restates that of another of `items`, naming that one.
 */
export function backlogFindings(items, architecture) {
  const all = items ?? [];
  const byId = new Map(all.filter((item) => idOf(item)).map((item) => [idOf(item), item]));
  const described = new Set((architecture ?? []).filter((file) => file?.kind === "module").map(idOf));
  const out = [];
  for (const item of all) {
    const id = idOf(item);
    const at = (kind, rule, what, fix) => out.push(finding({ artifact: id || text(item.path), line: 1, kind, rule, what, fix }));
    if (!fieldList(item, "realises").length) {
      at("error", REALISES, "the item realises nothing",
        "name at least one requirement or use case the item realises, or remove the item");
    }
    if (!fieldList(item, "modules").some((name) => described.has(name))) {
      at("error", MODULES, "the item names no module the architecture describes",
        "name the modules of the architecture that the item's implementation changes");
    }
    for (const on of fieldList(item, "builds_on")) {
      const other = byId.get(on);
      if (!other) {
        at("error", BACKLOG, `the item builds on ${on}, which does not exist`,
          `name an item of the backlog under builds_on, or remove ${on}`);
      } else if (fieldList(other, "builds_on").includes(id)) {
        at("error", BACKLOG, `the item builds on ${on}, which builds on it in turn`,
          `remove ${id} from the items ${on} builds on, or ${on} from the items ${id} builds on`);
      }
    }
    const [classified] = classifyCandidates(
      [{ ref: id, keys: [titleOf(item)], from: [], proposed: { class: "new", of: null } }],
      all.filter((other) => other !== item).map((other) => ({ id: idOf(other), keys: [titleOf(other)] })),
    );
    if (classified.class === "duplicate") {
      at("warning", DUPLICATE, `the item restates ${classified.of}`,
        `extend ${classified.of} instead, or say how this item differs from it`);
    }
  }
  return out;
}
