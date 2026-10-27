// MOD-issue-handling: an issue handled as a bug or a change (docs/architecture/MOD-issue-handling.md).
// This entry offers the classes of an issue and the person's one click on the class (classes.mjs), the item prefilled from an issue and the move into the backlog (backlog.mjs), and the recipe that gives a participant the issue with the requirements, use cases and tests it touches
// (strategies.mjs). Closing an issue with links and the recipe `fix-inputs` are other items'.
// Module: MOD-issue-handling

export { backlogItemFrom, moveToBacklog } from "./backlog.mjs";
export { IssueClass, confirmClass } from "./classes.mjs";
export { issueStrategies } from "./strategies.mjs";
