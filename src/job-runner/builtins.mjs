// The built-in strategies the runner registers itself (MOD-job-runner, Data: Built-in strategies): the recipes
// `instruction` and `draft`, the writer `return-draft` and the checks `document-schema`, `requirement-form` and
// `test-declarations`. The other built-in checks on the artifact model come with the modules they use.
//
// Module: MOD-job-runner

import { artifactSchemas, documentFindings, readDocument } from "../documents/index.mjs";
import { parseSpec, requirementFindings } from "../spec-document/index.mjs";
import { testDeclarations, testFindings } from "../test-document/index.mjs";

const part = (name, text) => ({ name, text, size: 0, sources: [], required: true });

// The artifact schema whose path a drafted document's path matches: the first of the schemas MOD-documents owns with a path
// pattern the path fits. A schema's `path` is a pattern or a list of them, each a text or { pattern, rule }; `{nnn}` stands
// for three or more digits and `{slug}` for lower-case words joined by `-`, the two placeholders those schemas use.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const fits = (pattern, path) => new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\{nnn\}/g, "\\d{3,}")
  .replace(/\{slug\}/g, SLUG)}$`).test(path);
const schemaOf = (path) => Object.values(artifactSchemas()).find((schema) => [schema.path].flat()
  .some((entry) => fits(typeof entry === "string" ? entry : entry.pattern, path)));

// A candidate written as the SPEC writes a requirement — its name and the job's source on the head line, then its rule, then
// its check — for MOD-spec-document to read as it reads one. White space is folded into single blanks: a candidate is one
// block of lines, whatever its rule and its check hold.
const folded = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const written = ({ name, rule, check }, source) =>
  [`**${folded(name)}** *(${source})*`, folded(rule), `*Check:* ${folded(check)}`].filter(Boolean).join("\n");

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
    // MOD-documents' documentFindings on every drafted document, each read by the artifact schema whose path it matches; a
    // document whose path matches none of them is not judged here.
    "document-schema": (draft) => draft.files.flatMap(({ path, text }) => {
      const schema = schemaOf(path);
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
    // or changes: the branch is read through the product's host with readSnapshot, and a file counts as changed when its blob
    // differs from its blob in the product's own snapshot, where a file the branch adds has none. A host that fails is thrown.
    "test-declarations": async (draft, context) => {
      const { host, snapshot } = context.product;
      const branch = await host.readSnapshot(draft.branch);
      const found = [];
      for (const path of branch.paths) {
        if (branch.blob(path) === snapshot.blob(path)) continue;
        for (const declaration of testDeclarations(path, await branch.read(path))) found.push(...testFindings(declaration));
      }
      return found;
    },
  },
  writers: {
    // Writes nothing; hands the result to the caller.
    "return-draft": async (result) => ({ commits: [], files: [], pullRequest: null, shown: result.draft }),
  },
};
