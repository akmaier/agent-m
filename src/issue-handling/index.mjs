// MOD-issue-handling: an issue handled as a bug or a change (docs/architecture/MOD-issue-handling.md).
// This entry offers the classes of an issue and the person's one click on the class (classes.mjs), and the recipe that gives a participant the issue with the requirements, use cases and tests it touches
// (strategies.mjs). Prefilling and moving an issue into the backlog, closing it with links and the recipe `fix-inputs` are other items'.
// Module: MOD-issue-handling

export { IssueClass, confirmClass } from "./classes.mjs";
export { issueStrategies } from "./strategies.mjs";
