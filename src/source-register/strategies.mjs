// The recipes MOD-source-register offers the job runner (MOD-source-register, Parts: strategies.mjs): `source-excerpt`, the
// text of the version a product links of the source a job names; and the four recipes of the book's chapters, each with
// the chapters of its kind of work.
//
// Module: MOD-source-register
//
// A version's content lies in the instance when its licence permits republishing, and in the repository its entry names as
// `content_repository` otherwise, which the job's context opens with the credentials of the program. The book is the
// instance's register entry SRC-vibe-coding, every instance holding it as a fork of Agent M (UC-014); its licence permits
// republishing, so its content lies in the instance itself, whose snapshot a job's context carries. Part and JobContext are
// MOD-job-runner's types.

import { readDocument } from "../documents/index.mjs";
import { failure, newestVersion, readContent } from "./content.mjs";

const LINKS_PATH = "docs/sources.md";
const ENTRY_FILE = /^docs\/sources\/SRC-[^/]+\.md$/;

const BOOK = "SRC-vibe-coding";
const ENTRY_PATH = `docs/sources/${BOOK}.md`;
const decoder = new TextDecoder();

// The chapters a job receives for its kind of work, given once (Data: The book's chapters for a kind of work).
const CHAPTERS = {
  "chapters-for-requirements": [8],
  "chapters-for-tests": [13],
  "chapters-for-architecture": [9, 10, 11, 12],
  "chapters-for-implementation": [9, 11, 12, 13],
};

// The instance's snapshot as the host that holds the book's content.
const holderOf = (snapshot) => ({ repositoryInfo: async () => ({ defaultBranch: snapshot.ref }), readSnapshot: async () => snapshot });

// The parts of the chapters `numbers`, read from the newest version of the instance's entry SRC-vibe-coding.
async function chapters(numbers, context, entrySchema) {
  const snapshot = context.instance.snapshot;
  const text = await snapshot.read(ENTRY_PATH);
  if (text === null) throw failure("NotRegistered", `the instance has no register entry ${BOOK}`, { source: BOOK });
  const version = await newestVersion(readDocument(entrySchema, ENTRY_PATH, text));
  if (version === null) throw failure("NotRegistered", `the register entry ${BOOK} records no version`, { source: BOOK });
  const files = await readContent(version, async () => holderOf(snapshot));
  return numbers.map((chapter) => {
    const file = files.find((each) => each.name.startsWith(`${String(chapter).padStart(2, "0")}_`));
    if (!file) {
      throw failure("ChapterMissing", `the version ${version.version} of ${BOOK} holds no file for chapter ${chapter}`,
        { chapter, version: version.version });
    }
    return { name: `${file.name} — ${BOOK} ${version.version}, version hash ${version.hash}`, text: decoder.decode(file.bytes),
      size: 0, sources: [BOOK], required: true };
  });
}

// The text of the version the product links of `params.source`, as one part naming the source, and in its name the version
// and the part that applies — the job's, else the link's. Its content is read where it lies.
async function excerpt(context, params, module) {
  const source = String(params.source ?? "");
  const linksText = await context.product.snapshot.read(LINKS_PATH);
  const register = [];
  for (const path of context.instance.snapshot.paths.filter((each) => ENTRY_FILE.test(each))) {
    const text = await context.instance.snapshot.read(path);
    if (text !== null) register.push(readDocument(module.entry, path, text));
  }
  const linked = linksText === null ? null
    : module.linkedVersion(readDocument(module.links, LINKS_PATH, linksText), register, source);
  if (!linked) throw failure("NotLinked", `the product links no version of ${source}`, { source });
  // A smaller part is the files the job's `part` names — a list of file names, or one name —: fewer files of the version, in the version's order. A version of one
  // file has none. A file the version does not hold is refused before any content is read.
  const named = params.part === undefined || params.part === null ? [] : [].concat(params.part).map(String);
  let selected = linked.version.files;
  if (named.length > 0 && selected.length > 1) {
    const missing = [...new Set(named.filter((name) => !selected.some((file) => file.name === name && file.stored)))];
    if (missing.length > 0) throw failure("NotInVersion", `the version ${linked.version.version} of ${linked.source.id} holds no ${missing.join(", ")}`, { files: missing });
    selected = selected.filter((file) => named.includes(file.name));
  }
  let holder;
  if (module.permittedPlaces(linked.source) === "any") holder = holderOf(context.instance.snapshot);
  else if (linked.source.fields.content_repository) holder = await context.connect(String(linked.source.fields.content_repository));
  else {
    throw failure("ContentUnreadable", `the register entry ${linked.source.id} names no content repository`,
      { repository: null, reason: `the register entry ${linked.source.id} names no content repository` });
  }
  const files = await readContent({ ...linked.version, files: selected }, async () => holder);
  const sent = selected.length < linked.version.files.length ? `, ${selected.map((file) => file.name).join(", ")}` : "";
  return [{ name: `${linked.source.id} ${linked.version.version}${sent}${linked.part ? `, ${linked.part}` : ""}`,
    text: files.map((file) => decoder.decode(file.bytes)).join("\n\n"), size: 0, sources: [linked.source.id], required: true }];
}

/**
 * strategiesOf(module: { entry: Schema, links: Schema, linkedVersion, permittedPlaces }) -> Partial<Strategies> — the
 * recipes of MOD-source-register, with its schemas and the two functions of its interface they use:
 * - `source-excerpt`: for the source the job's parameter `source` names, reads the version the product links, through
 *   readContent, and returns the texts of the files its parameter `part` names — a list of file names, or one; every file of
 *   the version when it names none, or when the version holds one file —, in the version's order, a blank line between them,
 *   as one part that names the source. The part's name names the version, the files sent where they are fewer than the
 *   version's, and the part the product's link names. A file outside the part is not read. Throws as readContent throws,
 *   NotLinked { source } for a source the product does not link, and NotInVersion { files } for a part that names files
 *   the version does not hold, before any content is read;
 * - the four recipes of the book's chapters, `chapters-for-requirements`, `chapters-for-tests`, `chapters-for-
 *   architecture` and `chapters-for-implementation`: each reads the instance's register entry SRC-vibe-coding, takes its
 *   newest version, reads that version's files through readContent, and returns one part per chapter of its row, in the
 *   order of their numbers: the whole file, naming SRC-vibe-coding as its source and, in its name, the file, the version
 *   and the version's hash as its pin. Throws as readContent throws, NotRegistered { source } when the instance has no
 *   entry SRC-vibe-coding, and ChapterMissing { chapter, version } when the version holds no file for a chapter.
 */
export const strategiesOf = (module) => ({
  recipes: {
    "source-excerpt": (context, params) => excerpt(context, params, module),
    ...Object.fromEntries(Object.entries(CHAPTERS).map(([name, numbers]) =>
      [name, (context) => chapters(numbers, context, module.entry)])),
  },
});
