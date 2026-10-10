// The built-in strategies the runner registers itself (MOD-job-runner, Data: Built-in strategies): the recipes
// `instruction` and `draft`, and the writer `return-draft`. The built-in checks on the artifact model come with the
// correction loop.
//
// Module: MOD-job-runner

const part = (name, text) => ({ name, text, size: 0, sources: [], required: true });

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
  writers: {
    // Writes nothing; hands the result to the caller.
    "return-draft": async (result) => ({ commits: [], files: [], pullRequest: null, shown: result.draft }),
  },
};
