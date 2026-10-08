// The private descriptor of the current-specification view. A TraceView descriptor belongs to MOD-trace-pages; the
// public Site-frame Route is `trace/<key>`.
//
// Module: MOD-trace-pages

export const specification = {
  key: "specification",
  entry: "requirements",
  title: "Current requirements",
  versions: "branch-and-tags",
  shape: "tree",
};

const descriptors = new Map([[specification.key, specification]]);

export const descriptorFor = (key) => descriptors.get(key) ?? null;
