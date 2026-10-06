// The review layout of a new product — ADDING A PRODUCT CREATES ITS LAYOUT · ONE REVIEW LAYOUT FOR EVERY PRODUCT (UC-001 step 5,
// 5a, 5b). Part of MOD-artifact-edits (docs/architecture/MOD-artifact-edits.md): the parts of the layout that the product's
// default branch lacks, written in one commit through the host the caller connected with the person's token, on the head
// that was read, without a pull request; nothing when the layout is complete. A refused read or write is the host's failure,
// passed on as the host names it; nothing is written then.
//
// Module: MOD-artifact-edits
//
// The model is missingLayout in docs/assets/review-core.mjs and addProduct in docs/assets/dashboard/writes.mjs, which stay as
// they are.

import { specSkeleton } from "../spec-document/index.mjs";

// The four folders of the layout, each with the one short paragraph of its README: what the folder holds, and that its status
// is derived from the approval records. A folder is there when the branch holds any file below it.
const FOLDERS = [
  ["docs/use-cases/", (product) => `This folder holds the use cases of ${product}, one file per use case named ` +
    "`UC-<nnn>-<slug>.md`. A use case counts as accepted only while an approval record in `docs/approvals/` names its " +
    "current text: its status is derived from the approval records and is kept nowhere else.\n"],
  ["docs/architecture/", (product) => `This folder holds the architecture of ${product}: its decisions, one file per ` +
    "decision named `ARC-<nnn>-<slug>.md`, and its modules, one file per module named `MOD-<slug>.md`. A file counts as " +
    "accepted only while an approval record in `docs/approvals/` names its current text: its status is derived from the " +
    "approval records and is kept nowhere else.\n"],
  ["docs/approvals/", (product) => `This folder holds the approval records of ${product}, one file per acceptance, each ` +
    "naming the file it accepts and the git blob SHA of the text that was accepted. The status of every use case, " +
    "architecture file and SPEC change is derived from the approval records; a record is never edited to change a status.\n"],
  ["docs/spec-freigaben/", (product) => `This folder holds the change queues of the SPEC of ${product}, one folder per ` +
    "queue, each entry a section proposed beside the text it would replace. An entry counts as accepted only when an " +
    "approval record in `docs/approvals/` names its text: its status is derived from the approval records, and `SPEC.md` " +
    "changes only by an accepted entry.\n"],
];

// The parts a branch with these paths lacks, as the files of one commit, in the order of the module file's table.
function missingParts(paths, product) {
  const there = new Set(paths);
  const below = (folder) => paths.some((path) => path.startsWith(folder));
  return [
    ...FOLDERS.filter(([folder]) => !below(folder)).map(([folder, readme]) => ({ path: `${folder}README.md`, text: readme(product) })),
    ...(there.has("SPEC.md") ? [] : [{ path: "SPEC.md", text: specSkeleton(product) }]),
    ...(there.has("CHANGELOG.md") ? [] : [{ path: "CHANGELOG.md", text: `# Changelog of ${product}\n` }]),
  ];
}

// reviewLayoutCommit(host: Host, person: string) -> Promise<{ commit: string, written: string[] } | { complete: true }> —
// reads the default branch the host names, and commits the parts it lacks there in one commit on the head it read; the
// product is named in the texts by its repository's path. Crosses the network, through the host. Fails with the host's
// failures, unchanged: Moved (the branch moved after it was read), TokenRefused, PermissionMissing (a public repository the
// token does not reach yet), NotFound, RateLimited, Unreachable — nothing is written then.
export async function reviewLayoutCommit(host, person) {
  const { defaultBranch } = await host.repositoryInfo();
  const head = await host.readSnapshot(defaultBranch);
  const files = missingParts(head.paths, head.repository.path);
  if (!files.length) return { complete: true };
  const written = files.map((f) => f.path);
  const { commit } = await host.commitFiles({ branch: defaultBranch, expectedHead: head.commit, files,
    message: `Add the Agent M review layout\n\nAdded by ${person}: ${written.join(", ")}.` });
  return { commit, written };
}
