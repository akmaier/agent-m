// named-by.mjs — namedBy (MOD-resource-list, Parts: private; Interfaces: namedBy): the job records and the tests that name a resource, read through a snapshot (UC-040, 1a and 9a).
//
// Module: MOD-resource-list
//
// It only reads: the snapshot's `read` of the job records under docs/jobs/ and of the files under tests/. Where the texts leave a reading open, this file states the one it takes:
//   - A job record is a file `docs/jobs/JOB-*.md`; it names the resource when an entry of the `inputs` list of its front matter is `<name>@<pin>`, the name exactly.
//   - A test is a file under `tests/`; it names the resource when its text holds the name as a whole word: not preceded or followed by a letter, a digit, `-`, `_` or `.` and a letter or digit.
//   - Both lists are in the order of the snapshot's paths.

const JOB_RECORD = /^docs\/jobs\/JOB-[^/]+\.md$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The entries of the `inputs` list of a record's front matter.
function inputsOf(text) {
  const head = FRONT_MATTER.exec(text)?.[1];
  if (head === undefined) return [];
  const lines = head.split(/\r?\n/);
  const start = lines.findIndex((each) => /^inputs:\s*$/.test(each));
  if (start < 0) return [];
  const entries = [];
  for (const each of lines.slice(start + 1)) {
    const item = /^\s+-\s+(.*?)\s*$/.exec(each);
    if (!item) break;
    entries.push(item[1]);
  }
  return entries;
}

/**
 * namedBy(snapshot, name) -> Promise<{ jobs: string[], tests: string[] }> — the paths of the job records whose inputs pin the resource `name`, and of the test files whose text names it.
 * Changes nothing; fails as the snapshot's `read` fails.
 */
export async function namedBy(snapshot, name) {
  const pinned = (text) => inputsOf(text).some((entry) => entry.startsWith(`${name}@`));
  const word = new RegExp(`(?<![\\w.-])${escape(name)}(?![\\w-]|\\.\\w)`);
  const mentioned = (text) => word.test(text);
  const select = async (paths, test) => {
    const texts = await Promise.all(paths.map((path) => snapshot.read(path)));
    return paths.filter((_, index) => typeof texts[index] === "string" && test(texts[index]));
  };
  const jobs = await select(snapshot.paths.filter((path) => JOB_RECORD.test(path)), pinned);
  const tests = await select(snapshot.paths.filter((path) => path.startsWith("tests/")), mentioned);
  return { jobs, tests };
}
