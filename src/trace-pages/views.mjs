// The private descriptors of the trace views this module draws: the current specification, the gaps and the modules. A TraceView descriptor
// belongs to MOD-trace-pages; the public Site-frame Route is `trace/<key>`.
//
// Module: MOD-trace-pages

// The filters of the specification tree (UC-020 step 4): `values(rows)` the choices, `keep(row, value)` whether a row of { name, rule, status, sources, realised } stays under the choice.
export const STATUSES = ["in SPEC", "change proposed", "removal proposed", "proposed"];
export const specification = {
  key: "specification",
  entry: "requirements",
  title: "Current requirements",
  versions: "branch-and-tags",
  shape: "tree",
  filters: [
    { name: "status", values: () => STATUSES, keep: (row, value) => row.status === value },
    { name: "source", values: (rows) => [...new Set(rows.flatMap((row) => row.sources))].sort(), keep: (row, value) => row.sources.includes(value) },
    { name: "realised", values: () => ["realised", "not realised"], keep: (row, value) => row.realised === (value === "realised") },
  ],
};

export const gaps = {
  key: "gaps",
  entry: "requirements",
  title: "Gaps",
  versions: "branch-and-tags",
  shape: "table",
};

// The views of the menu entry Tests, in its order — the batteries' setup first, then the results (ITM-1224) —, each as { text, href }: the links the tests browser
// and the audit draw under their heads, the one shown marked. MOD-test-pages' routes draw the same five (ITM-1223).
const TESTS_ENTRY = [
  { text: "Schedule", href: "#schedule" },
  { text: "Browser", href: "#trace/key=tests" },
  { text: "Runs", href: "#runs" },
  { text: "Audit", href: "#trace/key=audit" },
  { text: "Generate", href: "#generate" },
];
const testsEntry = () => TESTS_ENTRY.map((link) => ({ ...link }));

export const tests = {
  key: "tests",
  entry: "tests",
  title: "Tests",
  versions: "branch-and-tags",
  shape: "tree",
  links: testsEntry,
};

export const modules = {
  key: "modules",
  entry: "architecture",
  title: "Modules",
  versions: "branch",
  shape: "table",
};

export const audit = {
  key: "audit",
  entry: "tests",
  title: "Audit",
  versions: "tags",
  shape: "table",
  links: testsEntry,
};

const descriptors = new Map([[specification.key, specification], [gaps.key, gaps], [modules.key, modules], [tests.key, tests], [audit.key, audit]]);

export const descriptorFor = (key) => descriptors.get(key) ?? null;
