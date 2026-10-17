// history.mjs — the history of a requirement (MOD-spec-changes, Interfaces: requirementHistory). ITM-598 builds it.
//
// Module: MOD-spec-changes
//
// readHistory names the commits that changed SPEC.md, not those that changed one requirement, so the SPEC is read at each of them through
// readSnapshot, and a commit is kept where the requirement's text differs from its text at the commit before. Where the module file
// leaves a reading open, this file states the one it takes:
//
//   - The history is that of SPEC.md from the ref the Host's readHistory is given where none is: the default branch. A caller that wants
//     the history up to a tag hands a Host whose readHistory names that ref.
//   - A requirement's text is its head line, its rule and its check as parseSpec reads them: `**NAME** *(source)*`, the rule, and
//     `*Check:* check`, each part left out where the SPEC has none.
//   - An accepted change is a commit at which that text differs from the text at the commit before: its first appearance (before
//     null), a change, and its withdrawal (after null). The date is the commit's date; the person is the author's account, or the name
//     the server gives where it names no account (A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT).
//   - A record is the approval record of the section the requirement stands in: the file docs/approvals/spec-<queue>-<NN>-<blob12>.md
//     whose blob12 is the first twelve digits of the blob SHA of that section's exact bytes at the commit, since an approved text is
//     written byte for byte (THE APPROVED TEXT IS TAKEN VERBATIM) and the record's name carries the proposal's blob. A record that the
//     commit adds is preferred to one an earlier commit added, which an approval without a token leaves for the instance's workflow to
//     apply; where no record has that name the record is null.

import { parseSpec, sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";

const TARGET = "SPEC.md";
const RECORD_FILE = /^docs\/approvals\/spec-.+-\d{2}-([0-9a-f]{12})\.md$/;
// How many commits are read at a time: the requests of one history go in groups, not all at once and not one by one.
const AT_ONCE = 8;

// The text of the requirement `name` in a parsed SPEC, or null where the SPEC holds none.
function textOf(spec, name) {
  const requirement = spec.requirements.get(name);
  if (!requirement) return null;
  const head = requirement.source === null ? `**${name}**` : `**${name}** *(${requirement.source})*`;
  return [head, requirement.rule, requirement.check === null ? null : `*Check:* ${requirement.check}`].filter((line) => line !== null).join("\n");
}

// The approval record of the section `heading` of `text`, among the `paths` of the commit's tree, or null.
async function recordOf(text, heading, paths, added) {
  const section = heading === null ? null : sectionText(text, heading);
  if (section === null) return null;
  const blob12 = (await blobSha(section)).slice(0, 12);
  const named = paths.filter((path) => RECORD_FILE.exec(path)?.[1] === blob12).sort();
  return named.find((path) => added.includes(path)) ?? named[0] ?? null;
}

/**
 * requirementHistory(name: string, host: Host) -> Promise<Array<{ date: string, person: string, commit: string, record: string | null,
 *   before: string | null, after: string | null }>> — every accepted change to the text of a requirement, oldest first (MOD-spec-changes,
 * Interfaces). Crosses the network; fails with the host's errors.
 */
export async function requirementHistory(name, host) {
  if (typeof name !== "string" || !name.trim()) throw new TypeError("requirementHistory names a requirement");
  const commits = [...await host.readHistory(TARGET)].reverse();
  const specs = new Array(commits.length);
  for (let from = 0; from < commits.length; from += AT_ONCE) {
    await Promise.all(commits.slice(from, from + AT_ONCE).map(async (entry, at) => {
      const snapshot = await host.readSnapshot(entry.commit);
      const text = (await snapshot.read(TARGET)) ?? "";
      specs[from + at] = { text, spec: parseSpec(text), paths: snapshot.paths };
    }));
  }

  const changes = [];
  let before = null;
  let previous = null;
  for (const [at, entry] of commits.entries()) {
    const { text, spec, paths } = specs[at];
    const after = textOf(spec, name);
    if (after !== before) {
      const stood = (after === null ? previous : spec).requirements.get(name);
      const added = entry.changes.filter(({ change }) => change === "added").map(({ path }) => path);
      changes.push({
        date: entry.date, person: entry.author.account ?? entry.author.name, commit: entry.commit,
        record: await recordOf(text, stood.section, paths, added), before, after,
      });
    }
    before = after;
    previous = spec;
  }
  return changes;
}
