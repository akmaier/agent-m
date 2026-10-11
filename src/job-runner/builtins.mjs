// The built-in strategies the runner registers itself (MOD-job-runner, Data: Built-in strategies): the recipes
// `instruction` and `draft`, the writer `return-draft` and the checks `document-schema`, `requirement-form`,
// `test-declarations` and `candidate-classes`, what a built-in check needs of a job's context, and the classes the last of
// them finds. The other built-in checks on the artifact model come with the modules they use.
//
// Module: MOD-job-runner

import { artifactSchemaOf, classifyCandidates, documentFindings, readDocument } from "../documents/index.mjs";
import { parseSpec, requirementFindings } from "../spec-document/index.mjs";
import { isTestFile, testDeclarations, testFindings } from "../test-document/index.mjs";
import { finding } from "../text-tools/index.mjs";

const part = (name, text) => ({ name, text, size: 0, sources: [], required: true });

// A candidate written as the SPEC writes a requirement — its name and the job's source on the head line, then its rule, then
// its check — for MOD-spec-document to read as it reads one. White space is folded into single blanks: a candidate is one
// block of lines, whatever its rule and its check hold.
const folded = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const written = ({ name, rule, check }, source) =>
  [`**${folded(name)}** *(${source})*`, folded(rule), `*Check:* ${folded(check)}`].filter(Boolean).join("\n");

const EXPECTED_RESULT = "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS";
const GOES_BACK = "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT";
const EXACT_DUPLICATE = "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL";
const CLASS_NAMES_ARTIFACT = "A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT";

// The classes of a draft's candidates against the artifacts the job's parts carry, and the findings on the classes its drafter
// gave. A candidate is a requirement, as a draft of `{ candidates }` holds it — the module file gives the key values of a
// requirement only: its reference in the draft its name, its key its name and its rule, the passage it came from its
// passage. A candidate that the rule finds a duplicate of an existing artifact while its drafter classed it otherwise than
// as a duplicate of that artifact is an error naming it; so is a change, a duplicate or a conflict that names no artifact a
// part carries. A draft whose parts carry no artifact has nothing to classify.
function classification(draft, parts) {
  const existing = parts.flatMap((part) => part.artifacts ?? []);
  const drafted = Array.isArray(draft?.candidates) ? draft.candidates : [];
  if (existing.length === 0 || drafted.length === 0) return { classes: [], findings: [] };
  const classes = classifyCandidates(drafted.map(({ name, rule, passage, class: proposed, of }) => ({ ref: name,
    keys: [name, rule], from: [passage].filter(Boolean), proposed: { class: proposed, of: of ?? null } })), existing);
  const carried = new Set(existing.map((artifact) => artifact.id));
  const findings = drafted.flatMap(({ name, class: proposed, of }) => {
    const shown = folded(name);
    const classed = `${proposed}${of ? ` of "${folded(of)}"` : ""}`;
    const decided = classes.find((each) => each.refs.includes(name));
    if (decided.decidedBy === "rule" && !(proposed === "duplicate" && of === decided.of)) {
      return [finding({ artifact: shown, line: 1, kind: "error", rule: EXACT_DUPLICATE,
        what: `"${shown}" states the name or the rule of the existing "${decided.of}" and is classed ${classed}`,
        fix: `class it as duplicate of ${decided.of}` })];
    }
    if (["change", "duplicate", "conflict"].includes(proposed) && !carried.has(of)) {
      return [finding({ artifact: shown, line: 1, kind: "error", rule: CLASS_NAMES_ARTIFACT,
        what: of ? `"${shown}" is classed ${classed}, which no part of the job shows`
          : `"${shown}" is classed ${proposed} and names no existing artifact`,
        fix: "name an existing artifact that a part shows, or class it new" })];
    }
    return [];
  });
  return { classes, findings };
}

// The classes of the last round's draft, for a kind that names candidate-classes; null for any other.
export const classesOf = (kind, draft, parts) => (kind.checks.includes("candidate-classes")
  ? classification(draft, parts).classes : null);

export const builtins = {
  recipes: {
    // The person's words, from the job's parameters, as one part.
    instruction: async (context, params) => (typeof params.instruction === "string" && params.instruction.trim()
      ? [part("instruction", params.instruction)] : []),
    // The draft the job is handed: the draft under review, for a reviewing kind; the cases as the person left them, for
    // write-tests. None while the job has no draft yet.
    draft: async (context, params) => (params.draft === undefined ? []
      : [part("draft", typeof params.draft === "string" ? params.draft : JSON.stringify(params.draft, null, 2))]),
  },
  checks: {
    // MOD-documents' documentFindings on every drafted document, read with the schema artifactSchemaOf names for its path; a
    // path no schema's pattern matches is not judged here.
    "document-schema": (draft) => draft.files.flatMap(({ path, text }) => {
      const schema = artifactSchemaOf(path);
      return schema ? documentFindings(schema, readDocument(schema, path, text)) : [];
    }),
    // MOD-spec-document's requirementFindings on every drafted requirement: the candidates of a draft written as one section
    // of a SPEC, each with the source the job names (its parameter `source`, as MOD-source-register's source-excerpt reads
    // it), and read by parseSpec. A finding's line is that of its candidate's head line in that text.
    "requirement-form": (draft, context) => {
      const source = folded(context.params.source);
      return requirementFindings(parseSpec(["## Candidates", ...draft.candidates.map((candidate) => written(candidate, source))]
        .join("\n\n")));
    },
    // MOD-test-document's testFindings on every declaration in the files that the branch the coding participant reports adds
    // or changes, and an error for a file the branch adds that isTestFile calls a test file and that declares none. The branch
    // is read through the product's host with readSnapshot; a file counts as changed when its blob differs from its blob in
    // the product's own snapshot, where a file the branch adds has none. A branch the host does not hold is a finding sent
    // back, since the participant reported a branch it has not pushed; any other failure of the host is thrown.
    "test-declarations": async (draft, context) => {
      const { host, snapshot } = context.product;
      let branch;
      try {
        branch = await host.readSnapshot(draft.branch);
      } catch (error) {
        if (error.name !== "NotFound") throw error;
        return [finding({ artifact: "answer", line: 1, kind: "error", rule: GOES_BACK,
          what: `the branch ${draft.branch} is not on the host`, fix: "push the branch, then report it" })];
      }
      const found = [];
      for (const path of branch.paths) {
        const before = snapshot.blob(path);
        if (branch.blob(path) === before) continue;
        const declarations = testDeclarations(path, await branch.read(path));
        for (const declaration of declarations) found.push(...testFindings(declaration));
        if (before === null && declarations.length === 0 && isTestFile(path)) {
          found.push(finding({ artifact: path, line: 1, kind: "error", rule: EXPECTED_RESULT,
            what: "the test file declares no test",
            fix: "declare each test case in comment lines directly before it: its TST-<nnn> identifier, then level:, module:, "
              + "guards:, given:, input: and expect:" }));
        }
      }
      return found;
    },
    // MOD-documents' classifyCandidates of the drafted candidates against the existing artifacts the job's parts carry, which
    // runJob hands to a check as its third argument: the findings of `classification`. The classes of the last round are the
    // result's, which runJob asks of classesOf.
    "candidate-classes": (draft, context, parts = []) => classification(draft, parts).findings,
  },
  writers: {
    // Writes nothing; hands the result to the caller.
    "return-draft": async (result) => ({ commits: [], files: [], pullRequest: null, shown: result.draft }),
  },
};

// What a built-in check needs of a job's context, for prepareJob to ask before the job starts: by the check's name, a function
// of the context and the kind that gives a finding while the context lacks it, else null.
export const needs = new Map([
  ["test-declarations", (context, kind) => (context.product.host ? null : finding({ artifact: context.product.address, line: 1,
    kind: "error", rule: EXPECTED_RESULT,
    what: `the job of ${kind.name} reads the branch the participant reports, and the product has no host to read it from`,
    fix: "connect the product's repository, with a token that can read it" }))],
]);
