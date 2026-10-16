// kinds.mjs — the descriptors of the reviewed kinds this module shows (MOD-review-pages, Data): one record for each kind, which
// the one review flow in flow.mjs is driven by. ITM-355 builds the descriptor of the use cases, ITM-440 those of the architecture decisions and the module files, ITM-441 the whole architecture's Review all.
//
// Module: MOD-review-pages

// ReviewKind { kind, route, entry, title, plural, noun, record, explain, change } — `kind` is the kind MOD-approvals gives a reviewed
// file; `route` the first part of the address's fragment; `entry` the menu entry; `record` the identifier-and-title heading of
// a file, from its text; `explain` the topics of the folded "What is this?"; `change` the kind of job a message in the prompt bar runs
// on one of its files and, where a file is addressed by its identifier, the job's parameter that names it (the subject, subjects.mjs).
const heading = (body) => /^# (.+)$/m.exec(body)?.[1] ?? "";
const explain = { list: "accepting", all: "accepting", one: "accepting", changed: "edit-after-acceptance", edit: "edit-after-acceptance",
  fallback: "github-page-without-token" };

// `whole` marks the kind whose Review all is the review page of the whole architecture: the kinds of the files it shows together.
// `restsOn` marks a kind whose file names what it rests on (a decision its forces, a module what it realises): its page shows the
// section of what is not accepted yet, and offers no Accept while there is any.
export const USE_CASES = { kind: "use-case", route: "use-case", entry: "use-cases", title: "Use cases", plural: "use cases", noun: "use case",
  heading, explain: { ...explain, draft: { requirements: "requirements-to-cover", participant: "drafting-participant", panel: "run-panel", loop: "correction-loop",
    written: "drafted-use-cases", ci: "ci-agent-draft" }, instruction: "change-instruction" }, draft: "derive-use-cases", prompt: "change-use-case", save: "file",
  change: { kind: "change-use-case", parameter: "useCase" } };
export const DECISIONS = { kind: "architecture-decision", route: "decision", entry: "architecture", title: "Architecture decisions",
  plural: "architecture decisions", noun: "architecture decision", heading, restsOn: true, whole: ["architecture-decision", "module"], draft: "derive-architecture",
  change: { kind: "change-architecture", parameter: "target" },
  explain: { ...explain, draft: { whole: "what-is-an-architecture", participant: "drafting-participant", reviewer: "architecture-reviewer", panel: "run-panel", ci: "ci-agent-draft" } } };
export const MODULES = { kind: "module", route: "module", entry: "architecture", title: "Module files", plural: "module files",
  noun: "module file", heading, explain, restsOn: true, change: { kind: "change-architecture", parameter: "target" } };

// The descriptor of the SPEC change entries (ITM-357): a file of a change queue, not a reviewed file with a record of its own kind; its files are
// the entries of docs/spec-freigaben/<queue>/, accepted through MOD-spec-changes.
export const SPEC_ENTRIES = { kind: "spec-entry", route: "spec-entry", entry: "requirements", title: "SPEC changes", plural: "SPEC change entries", noun: "SPEC change entry",
  explain: { list: "change-queue", one: "spec-edit-waits-for-approval", fallback: "github-page-without-token", edit: "spec-edit-waits-for-approval",
    draft: { source: "source-selection", participant: "drafting-participant", panel: "run-panel", loop: "correction-loop", ci: "ci-agent-draft" } },
  accept: "queue", draft: "derive-requirements",
  save: "entry", change: { kind: "change-requirements", parameter: "target" } };

// The descriptors of editing a requirement (ITM-359): a requirement is a section of the SPEC, not a reviewed file; `edit` names the editing of its section, saved as an entry of
// the person's open queue of the day. REQUIREMENT_NEW is the same with the four fields empty, in the section handed in.
const requirementExplain = { edit: "spec-edit-waits-for-approval", instruction: "change-instruction",
  draft: { participant: "drafting-participant", panel: "run-panel", loop: "correction-loop", ci: "ci-agent-draft" } };
export const REQUIREMENT = { kind: "requirement", route: "requirement", entry: "requirements", title: "Requirement", plural: "requirements", noun: "requirement",
  explain: requirementExplain, edit: "section", prompt: "change-requirements", fresh: false, change: { kind: "change-requirements" } };
export const REQUIREMENT_NEW = { ...REQUIREMENT, route: "requirements", title: "New requirement", fresh: true };
