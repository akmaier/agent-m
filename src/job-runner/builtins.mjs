// The built-in strategies the runner registers itself (MOD-job-runner, Data: Built-in strategies): the recipes
// `instruction` and `draft`, the writer `return-draft` and the check `document-schema`. The other built-in checks on the
// artifact model come with the modules they use.
//
// Module: MOD-job-runner

import { artifactSchemas, documentFindings, readDocument } from "../documents/index.mjs";

const part = (name, text) => ({ name, text, size: 0, sources: [], required: true });

// The artifact schema whose path a drafted document's path matches: the first of the schemas MOD-documents owns with a path
// pattern the path fits. A schema's `path` is a pattern or a list of them, each a text or { pattern, rule }; `{nnn}` stands
// for three or more digits and `{slug}` for lower-case words joined by `-`, the two placeholders those schemas use.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const fits = (pattern, path) => new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\{nnn\}/g, "\\d{3,}")
  .replace(/\{slug\}/g, SLUG)}$`).test(path);
const schemaOf = (path) => Object.values(artifactSchemas()).find((schema) => [schema.path].flat()
  .some((entry) => fits(typeof entry === "string" ? entry : entry.pattern, path)));

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
  },
  writers: {
    // Writes nothing; hands the result to the caller.
    "return-draft": async (result) => ({ commits: [], files: [], pullRequest: null, shown: result.draft }),
  },
};
