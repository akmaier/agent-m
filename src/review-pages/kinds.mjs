// kinds.mjs — the descriptors of the reviewed kinds this module shows (MOD-review-pages, Data): one record for each kind, which
// the one review flow in flow.mjs is driven by. ITM-355 builds the descriptor of the use cases.
//
// Module: MOD-review-pages

// ReviewKind { kind, route, entry, title, plural, noun, record, explain } — `kind` is the kind MOD-approvals gives a reviewed
// file; `route` the first part of the address's fragment; `entry` the menu entry; `record` the identifier-and-title heading of
// a file, from its text; `explain` the topics of the folded "What is this?".
export const USE_CASES = {
  kind: "use-case",
  route: "use-case",
  entry: "use-cases",
  title: "Use cases",
  plural: "use cases",
  noun: "use case",
  heading: (body) => /^# (.+)$/m.exec(body)?.[1] ?? "",
  explain: { list: "accepting", all: "accepting", one: "accepting", changed: "edit-after-acceptance", fallback: "github-page-without-token" },
};
