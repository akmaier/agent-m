// The recipes MOD-source-register offers the job runner (MOD-source-register, Parts: strategies.mjs): the four recipes of
// the book's chapters, each with the chapters of its kind of work. The recipe `source-excerpt` belongs here too and is not
// built yet.
//
// Module: MOD-source-register
//
// The book is the instance's register entry SRC-vibe-coding, every instance holding it as a fork of Agent M (UC-014); its
// licence permits republishing, so its content lies in the instance itself, whose snapshot a job's context carries. Part
// and JobContext are MOD-job-runner's types.

import { readDocument } from "../documents/index.mjs";
import { failure, newestVersion, readContent } from "./content.mjs";

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

/**
 * strategiesOf(entrySchema: Schema) -> Partial<Strategies> — the four recipes of the book's chapters, `chapters-for-
 * requirements`, `chapters-for-tests`, `chapters-for-architecture` and `chapters-for-implementation`: each reads the
 * instance's register entry SRC-vibe-coding with `entrySchema`, takes its newest version, reads that version's files
 * through readContent, and returns one part per chapter of its row, in the order of their numbers: the whole file, naming
 * SRC-vibe-coding as its source and, in its name, the file, the version and the version's hash as its pin. Throws as
 * readContent throws, NotRegistered { source } when the instance has no entry SRC-vibe-coding, and ChapterMissing
 * { chapter, version } when the version holds no file for a chapter.
 */
export const strategiesOf = (entrySchema) => ({
  recipes: Object.fromEntries(Object.entries(CHAPTERS).map(([name, numbers]) =>
    [name, (context) => chapters(numbers, context, entrySchema)])),
});
