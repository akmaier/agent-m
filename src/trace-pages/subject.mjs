// The subject the specification view gives the prompt bar (docs/architecture/MOD-trace-pages.md, Data: specification; Interfaces: view),
// MOD-prompt-bar's `Subject`, for UC-049, UC-019 (step 1) and UC-020 (1a):
// - on the default branch, the open requirement, or the group with the names it holds, with the kind `change-requirements`, the person's own
//   source and the review pages' `draft` as its draft route, `draft/subject=<key, encoded>`, in the form the review pages' own subjects give; without the person's own
//   source its parameters are refused with the error NoPersonSource, which names registering the person as a source and linking it to the product (UC-019 4b);
// - at a released version, the requirement as it read there, with the kind `converse` and no draft route, since a change is drafted only
//   against the current text;
// - every other view, and the specification with nothing open, the frame's default with the version shown among its page.
// "The open requirement" is the one whose detail was opened last and is still open; "the open group" the section whose list was opened last
// and is still open; an open requirement is the narrower subject and wins. The subject is read at each Send, so what is open is kept as
// the person opens and closes it, and the person's source is read when the page is drawn: a subject reads nothing and sends nothing.
//
// Module: MOD-trace-pages
// Private to the module: flow.mjs uses it.

import { personSource, sourceSchemas } from "../source-register/index.mjs";
import { readDocument } from "../documents/index.mjs";

const DRAFT_ROUTE = "draft";

/** opening(list, item, open, same) — `item` in `list` as the last one opened while `open`, and out of it once closed. */
export function opening(list, item, open, same = (a, b) => a === b) {
  const at = list.findIndex((each) => same(each, item));
  if (at >= 0) list.splice(at, 1);
  if (open) list.push(item);
}

// The account of a person as the register writes it, `<host>/<owner>`: the owner of the instance's repository on the server of its origin,
// as the review pages' prompt route reads it for the person who gives an instruction.
function accountOf(snapshot) {
  const owner = String(snapshot.repository?.path ?? "").split("/")[0];
  if (!owner) return null;
  let server = snapshot.repository?.server === "github" ? "github.com" : null;
  try { server = new URL(snapshot.repository?.origin).host || server; } catch { /* use the canonical GitHub host above */ }
  return server ? `${server}/${owner}` : null;
}

/**
 * personsSource(context, snapshot) -> Promise<string | null> — the identifier of the register entry of the person who prompts, which the
 * product links (THE PERSON WHO PROMPTS IS A SOURCE): the product's links file at `snapshot`, and the instance's register at its default branch,
 * read through the hosts the frame gave the route. Null when there is none, and when a host or the context cannot say.
 */
export async function personsSource(context, snapshot) {
  try {
    const { entry, links } = sourceSchemas();
    const { host } = context.instance;
    const instance = await host.readSnapshot((await host.repositoryInfo()).defaultBranch);
    const linked = readDocument(links, "docs/sources.md", (await snapshot.read("docs/sources.md")) ?? "");
    const register = await Promise.all(instance.paths.filter((path) => /^docs\/sources\/[^/]+\.md$/.test(path))
      .map(async (path) => readDocument(entry, path, (await instance.read(path)) ?? "")));
    return personSource(linked, register, accountOf(instance));
  } catch {
    return null;
  }
}

const encoded = encodeURIComponent;
// A change of requirements without the person's own source sends nothing and names the two steps that are missing (UC-019 4b), as the review pages' subjects do.
function missingSource() {
  return Object.assign(new Error("The author has no personal source linked to this product. Register the person as a source (#library) and link that source to the product (#sources), then ask again."),
    { name: "NoPersonSource" });
}

const lines = (...parts) => parts.filter((part) => typeof part === "string" && part !== "").join("\n");

/**
 * subjectOf({ title, params, context, shown }) -> Subject — the subject of the route `trace` shown with these `params` and this `context`;
 * `shown` is what the route has kept while it was drawn: `target` (what it has drawn), `onDefaultBranch`, `spec` (as parseSpec reads it),
 * `source` (the person's, or null), and `requirements` (names) and `groups` ({ heading, names }) in the order they were opened; null where
 * the route was not drawn with this context. `key` tells the view, the version, what is open and the product apart.
 */
export function subjectOf({ title, params, context, shown }) {
  const ref = params.ref;
  const address = context.product?.address;
  const version = typeof ref === "string" && ref !== "" ? `Version: ${ref}` : "";
  const keyOf = (...parts) => ["trace", `key=${encoded(params.key ?? "")}`, ...(version ? [`ref=${encoded(ref)}`] : []), ...parts,
    ...(address ? [`product=${encoded(address)}`] : [])].join("/");
  const frames = () => ({ key: keyOf(), title, kind: "converse", paramsFor: () => ({ page: lines(title, address, version, shown?.target.textContent) }),
    draftRoute: null, withhold: null, refuses: [] });
  if (params.key !== "specification" || !shown?.spec) return frames();

  const name = shown.requirements.at(-1);
  const group = shown.groups.at(-1);
  const changing = (part, names, about) => {
    const key = keyOf(part);
    return { key, title: about, kind: "change-requirements",
      paramsFor: () => {
        if (shown.source === null) throw missingSource();
        return { requirements: [...names], source: shown.source };
      },
      draftRoute: `${DRAFT_ROUTE}/subject=${encoded(key)}`, withhold: null, refuses: [] };
  };
  if (name !== undefined && shown.onDefaultBranch) return changing(`requirement=${encoded(name)}`, [name], name);
  if (name === undefined && group !== undefined && shown.onDefaultBranch) {
    return changing(`requirements=${encoded(JSON.stringify(group.names))}`, group.names, group.heading);
  }
  const requirement = name === undefined ? undefined : shown.spec.requirements.get(name);
  if (requirement === undefined) return frames();
  return { key: keyOf(`requirement=${encoded(name)}`), title: `${name} at ${ref}`, kind: "converse",
    paramsFor: () => ({ page: lines(title, address, version, `Requirement ${name}`, `Source: ${requirement.source ?? ""}`,
      `Rule: ${requirement.rule ?? ""}`, `Check: ${requirement.check ?? ""}`) }),
    draftRoute: null, withhold: null, refuses: [] };
}
