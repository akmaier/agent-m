// Process model definitions — a model file read into its parts (ARC-019 decision 1) and validated before any product may
// declare it (ARC-019 decision 2, UC-031 step 4, A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED).
// Kernel (ARC-003): pure functions over the text and the model they are given; nothing is read, written or committed here,
// and no model of the catalogue is known by name (THE CATALOGUE IS DATA).
//
// Module: MOD-process-model
//
// A definition is front matter — name, kind (planned | pulled), adapted_from, measure — and one table per part under a
// fixed heading:
//
//   ## Phases               | Name | Role | Produces |
//   ## Transitions          | From | To | Kind |                         Kind: sequence, alternative or back
//   ## Verification pairs   | Phase | Checked by |
//   ## Gates                | Between | Artifacts | Condition | Decider |   Between: "From → To"; Decider: a role of the
//                                                                          model, or a named check: CI check `<name>`
//   ## Roles                | Name | Filled by | Capabilities |           Filled by: person, agent or either
//   ## Flow control         | Kind | Value |                              rows: WIP limit, Time box ("none" for absent),
//                                                                          Sprints (yes or no)
//
// Parsing is strict (ARC-019, Consequences): a table with other columns, or a row with another number of cells, is an
// error, not a guess. An empty cell, or one holding only a dash, is empty. Every error is a finding in the compiler form
// of ARC-007 — { artifact, line, kind, rule, field, what, fix } —, `line` counting from 1 in the text read and `field`
// naming the part that causes it ("kind", "Gates/Decider", "Flow control").

const VALIDATED = "A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED";
const PHASES_AND_GATES = "THE MODEL DETERMINES THE PHASES AND THE GATES";
const GATE_WHAT = "A GATE NAMES WHAT IT CHECKS";
const GATE_WHO = "A GATE NAMES WHO DECIDES IT";
const PEOPLE = "A PROCESS MODEL ORGANISES PEOPLE AND AGENTS";
const CAPABILITIES = "A ROLE NAMES THE CAPABILITIES IT NEEDS";
const MEASURE = "PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE";

export const KINDS_OF_WORK = ["planned", "pulled"];
export const TRANSITION_KINDS = ["sequence", "alternative", "back"];
export const FILLED_BY = ["person", "agent", "either"];
// The progress measures of PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE, each with the kind of work it fits.
export const MEASURES = {
  "plan entries per phase": "planned",
  "remaining items per time box": "pulled",
  "items per state over time": "pulled",
};

const TABLES = {
  phases: { heading: "Phases", columns: ["Name", "Role", "Produces"] },
  transitions: { heading: "Transitions", columns: ["From", "To", "Kind"] },
  pairs: { heading: "Verification pairs", columns: ["Phase", "Checked by"] },
  gates: { heading: "Gates", columns: ["Between", "Artifacts", "Condition", "Decider"] },
  roles: { heading: "Roles", columns: ["Name", "Filled by", "Capabilities"] },
  flow: { heading: "Flow control", columns: ["Kind", "Value"] },
};
const FLOW_ROWS = { "wip limit": "wipLimit", "time box": "timeBox", "sprints": "sprints" };
const CHECK = /^CI check `([^`]+)`$/;
const BETWEEN = /^(.+?)\s*(?:→|->)\s*(.+)$/;
// The kinds of artifact a phase produces and a gate checks: the identifier prefixes of EVERY ARTIFACT HAS AN IDENTIFIER,
// and requirements, which are named by their names.
const PREFIX = /\b(UC|ARC|MOD|TST|ITM|SRC|RES|JOB)(?![A-Za-z0-9])/g;
const REQUIREMENT = /\brequirements?\b/i;

const finding = (artifact, line, rule, field, what, fix) => ({ artifact, line, kind: "error", rule, field, what, fix });
const empty = (cell) => /^[-—–]?$/.test(cell.trim());
const value = (cell) => (empty(cell) ? "" : cell.trim());
const cellsOf = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

// The kinds of artifact a text names, prefixes first, in the order they appear.
export function artifactKinds(text) {
  const kinds = [];
  for (const m of String(text ?? "").matchAll(PREFIX)) if (!kinds.includes(m[1])) kinds.push(m[1]);
  if (REQUIREMENT.test(String(text ?? ""))) kinds.push("requirement");
  return kinds;
}

// Front matter: { fields: { key: { value, line } }, end } — `end` is the index of the line after the closing "---".
function frontMatter(lines) {
  const fields = {};
  if (lines[0] !== "---") return { fields, end: 0 };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") return { fields, end: i + 1 };
    const m = lines[i].match(/^([a-z][a-z0-9_-]*):\s*(.*)$/);
    if (m) fields[m[1]] = { value: m[2].trim(), line: i + 1 };
  }
  return { fields: {}, end: 0 };
}

// The first table under each "## <heading>": { heading line, rows: [{ cells, line }] }, or a problem for its columns.
function tables(lines, start, problems, artifact) {
  const found = {};
  let section = null;
  for (let i = start; i < lines.length; i++) {
    const h = lines[i].match(/^##\s+(.+?)\s*$/);
    if (h) {
      const key = Object.keys(TABLES).find((k) => TABLES[k].heading.toLowerCase() === h[1].toLowerCase());
      section = key && !found[key] ? key : null;
      if (section) found[section] = { line: i + 1, rows: [], state: "before" };
      continue;
    }
    if (!section) continue;
    const t = found[section];
    const isRow = lines[i].trim().startsWith("|");
    if (t.state === "after" || (!isRow && t.state === "before")) continue;
    if (!isRow) { t.state = "after"; continue; }
    const cells = cellsOf(lines[i]);
    const { heading, columns } = TABLES[section];
    if (t.state === "before") {
      t.state = "header";
      if (cells.join("|").toLowerCase() !== columns.join("|").toLowerCase()) {
        problems.push(finding(artifact, i + 1, VALIDATED, heading,
          `the table ${heading} has the columns ${cells.join(" | ")}, not ${columns.join(" | ")}`,
          `write the table under ## ${heading} with the columns | ${columns.join(" | ")} |.`));
        t.state = "after";
      }
      continue;
    }
    if (t.state === "header") {
      t.state = "rows";
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    }
    if (cells.length !== columns.length) {
      problems.push(finding(artifact, i + 1, VALIDATED, heading,
        `the row has ${cells.length} cells; the table ${heading} has ${columns.length} columns`,
        `give the row one cell per column: | ${columns.join(" | ")} |.`));
      continue;
    }
    t.rows.push({ cells, line: i + 1 });
  }
  return found;
}

export function parseModel(text) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  const fm = frontMatter(lines);
  const field = (key) => fm.fields[key] ? (value(fm.fields[key].value) || null) : null;
  const artifact = field("name") ?? "process model";
  const problems = [];
  const t = tables(lines, fm.end, problems, artifact);
  const rows = (key) => t[key]?.rows ?? [];

  const phases = rows("phases").map(({ cells: [name, role, produces], line }) =>
    ({ name: value(name), role: value(role), produces: value(produces), kinds: artifactKinds(value(produces)), line }));
  const transitions = rows("transitions").map(({ cells: [from, to, kind], line }) =>
    ({ from: value(from), to: value(to), kind: value(kind), line }));
  const pairs = rows("pairs").map(({ cells: [phase, checkedBy], line }) => ({ phase: value(phase), checkedBy: value(checkedBy), line }));
  const gates = rows("gates").map(({ cells: [between, artifacts, condition, decider], line }) => {
    const b = value(between).match(BETWEEN);
    const d = value(decider);
    const check = d.match(CHECK);
    return {
      between: value(between), from: b ? b[1].trim() : null, to: b ? b[2].trim() : null,
      artifacts: value(artifacts), kinds: artifactKinds(value(artifacts)), condition: value(condition),
      decider: !d ? null : check ? { check: check[1] } : { role: d }, line,
    };
  });
  const roles = rows("roles").map(({ cells: [name, filledBy, capabilities], line }) => ({
    name: value(name), filledBy: value(filledBy),
    capabilities: value(capabilities).split(",").map((c) => c.trim()).filter(Boolean), line,
  }));

  const flow = { wipLimit: null, timeBox: null, sprints: null };
  const stated = {};
  for (const { cells: [kind, raw], line } of rows("flow")) {
    const key = FLOW_ROWS[value(kind).toLowerCase()];
    if (!key) {
      problems.push(finding(artifact, line, VALIDATED, "Flow control",
        `the row "${value(kind)}" is no part of the flow control (WIP limit, Time box, Sprints)`,
        "remove the row, or name a WIP limit, a time box or whether the work runs in sprints."));
      continue;
    }
    const v = value(raw);
    if (!v || v.toLowerCase() === "none") continue;
    stated[key] = { value: v, line };
    if (key === "timeBox") flow.timeBox = v;
    if (key === "wipLimit" && /^[1-9]\d*$/.test(v)) flow.wipLimit = Number(v);
    if (key === "sprints" && /^(yes|no)$/i.test(v)) flow.sprints = v.toLowerCase() === "yes";
  }

  return {
    name: field("name"), kind: field("kind"), adaptedFrom: field("adapted_from"), measure: field("measure"),
    phases, transitions, pairs, gates, roles, flow,
    at: {
      kind: fm.fields.kind?.line ?? 1, measure: fm.fields.measure?.line ?? 1, flow: t.flow?.line ?? 1, stated,
    },
    problems,
  };
}

// Every error of a model beside the field that causes it; [] when it may be declared. The model is not changed.
export function validateModel(model) {
  const m = model ?? {};
  const artifact = m.name ?? "process model";
  const out = [...(m.problems ?? [])];
  const err = (line, rule, field, what, fix) => out.push(finding(artifact, line, rule, field, what, fix));
  const phases = m.phases ?? [], transitions = m.transitions ?? [], pairs = m.pairs ?? [];
  const gates = m.gates ?? [], roles = m.roles ?? [];
  const at = m.at ?? { kind: 1, measure: 1, flow: 1, stated: {} };

  if (!m.name) err(1, VALIDATED, "name", "the model has no name", "name the model in the front matter: name: <name>.");
  if (!m.kind) {
    err(at.kind, VALIDATED, "kind", "the model declares no kind of work",
      "declare in the front matter whether work is planned or pulled from a backlog: kind: planned or kind: pulled.");
  } else if (!KINDS_OF_WORK.includes(m.kind)) {
    err(at.kind, VALIDATED, "kind", `the kind of work "${m.kind}" is neither planned nor pulled`,
      "write kind: planned or kind: pulled.");
  }

  // Phases, and the roles they name.
  const phaseAt = new Map();
  for (const p of phases) {
    if (phaseAt.has(p.name)) {
      err(p.line, PHASES_AND_GATES, "Phases/Name", `the phase ${p.name} is defined twice (first on line ${phaseAt.get(p.name)})`,
        "give each phase one row and a name of its own.");
    } else phaseAt.set(p.name, p.line);
  }
  const isPhase = (name) => phaseAt.has(name);
  if (!phases.length) err(1, PHASES_AND_GATES, "Phases", "the model names no phase", "list the phases under ## Phases.");
  const roleAt = new Map();
  for (const r of roles) {
    if (roleAt.has(r.name)) {
      err(r.line, PEOPLE, "Roles/Name", `the role ${r.name} is defined twice (first on line ${roleAt.get(r.name)})`,
        "give each role one row and a name of its own.");
    } else roleAt.set(r.name, r.line);
    if (!FILLED_BY.includes(r.filledBy)) {
      err(r.line, PEOPLE, "Roles/Filled by", `the role ${r.name} is filled by "${r.filledBy}", not by person, agent or either`,
        "write person, agent or either.");
    }
    if (!r.capabilities.length) {
      err(r.line, CAPABILITIES, "Roles/Capabilities", `the role ${r.name} names no capabilities`,
        "name the capabilities its holder needs, such as read the repository, run code and tests.");
    }
  }
  for (const p of phases) {
    if (!p.role) {
      err(p.line, PEOPLE, "Phases/Role", `the phase ${p.name} names no role`, "name the role of the model that does the phase.");
    } else if (!roleAt.has(p.role)) {
      err(p.line, PEOPLE, "Phases/Role", `the phase ${p.name} names the role ${p.role}, which the model does not define`,
        `define the role ${p.role} under ## Roles, or name one that is defined.`);
    }
  }

  // Transitions: known phases and kinds; every phase reached from the first.
  for (const tr of transitions) {
    for (const [end, name] of [["From", tr.from], ["To", tr.to]]) {
      if (!isPhase(name)) {
        err(tr.line, PHASES_AND_GATES, `Transitions/${end}`, `the transition ${tr.from} → ${tr.to} names ${name}, which is no phase of the model`,
          `name a phase defined under ## Phases, or define ${name} there.`);
      }
    }
    if (!TRANSITION_KINDS.includes(tr.kind)) {
      err(tr.line, PHASES_AND_GATES, "Transitions/Kind", `the transition ${tr.from} → ${tr.to} has the kind "${tr.kind}", not sequence, alternative or back`,
        "write sequence, alternative or back.");
    }
  }
  if (phases.length) {
    const reached = new Set([phases[0].name]);
    for (let grew = true; grew;) {
      grew = false;
      for (const tr of transitions) if (reached.has(tr.from) && isPhase(tr.to) && !reached.has(tr.to)) { reached.add(tr.to); grew = true; }
    }
    for (const p of phases) {
      if (!reached.has(p.name) && phaseAt.get(p.name) === p.line) {
        err(p.line, PHASES_AND_GATES, "Phases/Name", `no transition reaches the phase ${p.name}`,
          `add a transition to ${p.name} from a phase before it, or remove the phase.`);
      }
    }
  }

  for (const pr of pairs) {
    for (const [col, name] of [["Phase", pr.phase], ["Checked by", pr.checkedBy]]) {
      if (!isPhase(name)) {
        err(pr.line, PHASES_AND_GATES, `Verification pairs/${col}`, `the verification pair ${pr.phase} ↔ ${pr.checkedBy} names ${name}, which is no phase of the model`,
          `name a phase defined under ## Phases, or define ${name} there.`);
      }
    }
  }

  // Gates: where they sit, what they check, who decides them.
  const upTo = (phase) => {
    const seen = new Set([phase]);
    for (let grew = true; grew;) {
      grew = false;
      for (const tr of transitions) if (tr.kind !== "back" && seen.has(tr.to) && isPhase(tr.from) && !seen.has(tr.from)) { seen.add(tr.from); grew = true; }
    }
    return seen;
  };
  for (const g of gates) {
    const name = g.from ? `${g.from} → ${g.to}` : `"${g.between}"`;
    if (!g.from) {
      err(g.line, PHASES_AND_GATES, "Gates/Between", `the gate "${g.between}" does not name two phases as "From → To"`,
        "write the two phases the gate stands between as From → To.");
    } else {
      for (const end of [g.from, g.to]) {
        if (!isPhase(end)) {
          err(g.line, PHASES_AND_GATES, "Gates/Between", `the gate ${name} names ${end}, which is no phase of the model`,
            `name a phase defined under ## Phases, or define ${end} there.`);
        }
      }
    }
    if (!g.artifacts) {
      err(g.line, GATE_WHAT, "Gates/Artifacts", `the gate ${name} names no artifacts it checks`,
        "name the artifacts that must exist before the next phase opens.");
    } else if (g.from && isPhase(g.from)) {
      const before = upTo(g.from);
      const produced = new Set(phases.filter((p) => before.has(p.name)).flatMap((p) => p.kinds));
      for (const k of g.kinds.filter((k) => !produced.has(k))) {
        err(g.line, GATE_WHAT, "Gates/Artifacts", `the gate ${name} checks ${k}, which no phase up to ${g.from} produces`,
          `let a phase up to ${g.from} produce ${k}, or check an artifact that one produces.`);
      }
    }
    if (!g.condition) {
      err(g.line, GATE_WHAT, "Gates/Condition", `the gate ${name} names no condition that must hold`,
        "name the condition that must hold before the next phase opens.");
    }
    if (!g.decider) {
      err(g.line, GATE_WHO, "Gates/Decider", `the gate ${name} names no decider`,
        "name the role of the model that decides it, or the check whose result decides: CI check `<name>`.");
    } else if (g.decider.role && !roleAt.has(g.decider.role)) {
      err(g.line, GATE_WHO, "Gates/Decider", `the gate ${name} is decided by "${g.decider.role}", which is no role of the model and no CI check`,
        "name a role defined under ## Roles, or a check as CI check `<name>`.");
    }
  }

  // Flow control of pulled work: exactly one of a time box and a WIP limit.
  const stated = at.stated ?? {};
  if (stated.wipLimit && !/^[1-9]\d*$/.test(stated.wipLimit.value)) {
    err(stated.wipLimit.line, VALIDATED, "Flow control", `the WIP limit "${stated.wipLimit.value}" is no positive whole number`,
      "write the limit as a whole number of items, such as 3.");
  }
  if (stated.sprints && !/^(yes|no)$/i.test(stated.sprints.value)) {
    err(stated.sprints.line, VALIDATED, "Flow control", `"${stated.sprints.value}" does not say whether the work runs in sprints (yes or no)`,
      "write yes or no.");
  }
  if (m.kind === "pulled") {
    if (!stated.wipLimit && !stated.timeBox) {
      err(at.flow, VALIDATED, "Flow control", "pulled work names neither a time box nor a WIP limit",
        "name either a time box with its length or a WIP limit under ## Flow control.");
    } else if (stated.wipLimit && stated.timeBox) {
      err(at.flow, VALIDATED, "Flow control", "pulled work names both a time box and a WIP limit",
        "keep one of them and write none for the other.");
    }
  }

  // The progress measure, and whether it fits the kind of work.
  if (!m.measure) {
    err(at.measure, MEASURE, "measure", "the model names no progress measure",
      `name one in the front matter: measure: ${Object.keys(MEASURES).join(", or ")}.`);
  } else if (!(m.measure in MEASURES)) {
    err(at.measure, MEASURE, "measure", `the measure "${m.measure}" is no progress measure Agent M knows`,
      `name one of: ${Object.keys(MEASURES).join("; ")}.`);
  } else if (KINDS_OF_WORK.includes(m.kind) && MEASURES[m.measure] !== m.kind) {
    err(at.measure, MEASURE, "measure", `the measure "${m.measure}" does not fit ${m.kind} work`,
      `name a measure of ${m.kind} work: ${Object.keys(MEASURES).filter((k) => MEASURES[k] === m.kind).join("; ")}.`);
  }

  return out.sort((a, b) => a.line - b.line);
}
