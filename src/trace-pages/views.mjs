// The private descriptors of the trace views this module draws: the current specification, the gaps and the modules. A TraceView descriptor
// belongs to MOD-trace-pages; the public Site-frame Route is `trace/<key>`.
//
// Module: MOD-trace-pages

export const specification = {
  key: "specification",
  entry: "requirements",
  title: "Current requirements",
  versions: "branch-and-tags",
  shape: "tree",
};

export const gaps = {
  key: "gaps",
  entry: "requirements",
  title: "Gaps",
  versions: "branch-and-tags",
  shape: "table",
};

export const modules = {
  key: "modules",
  entry: "architecture",
  title: "Modules",
  versions: "branch",
  shape: "table",
};

const descriptors = new Map([[specification.key, specification], [gaps.key, gaps], [modules.key, modules]]);

export const descriptorFor = (key) => descriptors.get(key) ?? null;
