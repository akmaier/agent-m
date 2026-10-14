// MOD-settings-pages' routes `library` and `library/<source>` (UC-004 steps 1 to 6): the instance's register of sources with their versions, and + Register source by
// route — an EU legal text, a standard, documents, a repository —, the common fields in a form from the entry's schema, what becomes public stated before Save, and Save,
// which commits the plan MOD-source-register's registrationCommits gives, each file in its repository. The download of an EU legal text after saving and a new version of a
// source (UC-016) are not part of this page yet.
//
// Module: MOD-settings-pages
//
// Where the texts leave a reading open, this file states the one it takes:
//   - The routes preset the kind: an EU legal text `regulation`, a standard `standard`, documents `document`, a repository `system` (the closed set of kinds names no
//     `repository`); the person may change it in the form.
//   - The first version's identifier is the day of registration for documents and a repository, the designation for a standard; the Versions section is the person's to edit.
//   - An EU legal text is registered as its entry alone, with no version row: the later download (UC-004 7) records the version, and registrationCommits needs a first row.
//   - The content goes to its repository before the entry goes to the instance, so that an entry never names content that was not stored.
//   - A source is already in the library when its identifier, its title or, for a standard, its designation equals an entry's (as a requirement's source item names one).
//   - The form is MOD-site-frame's schemaForm over the entry's schema (the schema names its rule since ITM-458): the page's own checks (an unlinked or restricted source, a missing file or
//     pin, a source already in the library) are its extraChecks; the checks of the schema are documentFindings'.
//   - A choice outside the form (the route's own part, the files, the named repository) builds the form again, keeping what the person typed in it.
//   - The file of an entry's version is shown as stored or not as MOD-source-register's linkedVersion reads its note (`not stored:`).

import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { readDocument, writeDocument } from "../documents/index.mjs";
import { linkedVersion, recogniseLegalText, registrationCommits, sourceSchemas } from "../source-register/index.mjs";
import { explain, schemaForm } from "../site-frame/index.mjs";
import { finding, sha256 } from "../text-tools/index.mjs";
import { credentialsFor } from "./products.mjs";

const { entry: ENTRY, links: LINKS } = sourceSchemas();
const REGISTER_PATH = /^docs\/sources\/SRC-[^/]+\.md$/;
const FETCH_WORKFLOW = "fetch-sources.yml";
const KIND_OF = { "legal-text": "regulation", standard: "standard", documents: "document", repository: "system" };
const ROUTES = {
  "legal-text": "An EU legal text — paste its EUR-Lex or ELI address, for example the AI Act's.",
  standard: "A standard — enter its full designation, for example IEC 62304:2006+AMD1:2015.",
  documents: "Documents — PDF, Word or Markdown files, or a zip file containing them, for example a customer's requirements specification.",
  repository: "A repository — the address of a repository, public or private, on GitHub or GitLab, for example https://github.com/owner/guidelines.",
};
const REPUBLISHABLE = /^may be republished(?![\p{L}\p{N}_])/u;

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}
const unquoted = (text) => String(text ?? "").trim().replace(/^`|`$/g, "");
const today = () => new Date().toISOString().slice(0, 10);
const bytesToText = (bytes) => new TextDecoder().decode(bytes);

// The register of the instance: its entries in the order of their files.
async function readRegisterOf(host) {
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const entries = [];
  for (const path of snapshot.paths.filter((each) => REGISTER_PATH.test(each)).sort()) {
    const text = await snapshot.read(path);
    if (text !== null && text !== undefined) entries.push(readDocument(ENTRY, path, text));
  }
  return { entries, branch: defaultBranch };
}

const versionsOf = (entry) => entry.sections.find((section) => section.heading === "## Versions")?.rows ?? [];
const namesOf = (fields, id) => [id, fields.title, fields.kind === "standard" ? fields.designation : null].filter((name) => typeof name === "string" && name.trim() !== "");
const isLegalText = (entry) => Boolean(recogniseLegalText(entry.fields.identifier));

// The files of one version of an entry, each stored or not, as MOD-source-register's linkedVersion reads the entry's note.
function filesOfVersion(entry, row) {
  const version = unquoted(row.cells.Version);
  const hash = /version hash `([0-9a-f]{64})`/.exec(String(row.cells.Files ?? ""))?.[1] ?? "0".repeat(64);
  const links = readDocument(LINKS, "docs/sources.md", ["# Requirement sources", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| ${entry.id} | ${version} | ${hash} | |`, ""].join("\n"));
  return linkedVersion(links, [entry], entry.id)?.version.files ?? [];
}

function entryView(entry, context) {
  const versions = versionsOf(entry).map((row) => el("li", "library-version",
    `${unquoted(row.cells.Version)} · ${row.cells.Date ?? ""}${row.cells.Edition && row.cells.Edition !== "—" ? ` · ${row.cells.Edition}` : ""} · read from ${row.cells["Read from"] ?? "—"}`,
    el("ul", null, ...filesOfVersion(entry, row).map((file) => el("li", "library-file-state", `${file.name} — ${file.stored ? "stored" : "not stored"}`)))));
  const back = el("button", "library-back btn", "Back to the library");
  back.addEventListener("click", () => context.go("library", {}));
  const fields = Object.entries(entry.fields).map(([key, value]) => el("li", null, `${key}: ${Array.isArray(value) ? value.join(", ") : value}`));
  return el("section", "library-entry panel", el("h2", null, `${entry.fields.title} (${entry.id})`), el("ul", null, ...fields), el("h3", null, "Versions"),
    versions.length ? el("ul", null, ...versions) : el("p", null, "No version is recorded yet."), el("p", null, back));
}

async function fetchFailures(host, branch, entries) {
  if (typeof host.listCiRuns !== "function" || typeof host.ciRunLog !== "function") return new Map();
  let runs;
  try { runs = await host.listCiRuns({ workflow: FETCH_WORKFLOW, branch }); } catch { return new Map(); }
  const waiting = entries.filter((entry) => isLegalText(entry) && versionsOf(entry).length === 0);
  const failures = new Map();
  for (const run of runs.filter((each) => each.state === "failure")) {
    const log = await host.ciRunLog(run.id);
    for (const entry of waiting) {
      if (failures.has(entry.id) || !String(log ?? "").includes(entry.id)) continue;
      const line = String(log).split("\n").find((each) => each.includes(entry.id)) ?? String(log);
      failures.set(entry.id, line);
    }
  }
  return failures;
}

function fetchState(entry, failures, startFetch) {
  if (!isLegalText(entry)) return null;
  if (versionsOf(entry).length) return el("p", "library-fetch-state", "Fetched.");
  const failed = failures.get(entry.id);
  const state = el("p", "library-fetch-state", failed ? `Fetch failed: ${failed}` : "Waiting for fetch.");
  const again = el("button", "library-fetch-again btn", "Fetch again");
  again.addEventListener("click", async () => {
    again.disabled = true;
    state.textContent = "Starting fetch workflow.";
    try {
      const run = await startFetch();
      state.textContent = run?.url ? `Fetch workflow started: ${run.url}` : "Fetch workflow started.";
    } catch (error) {
      again.disabled = false;
      state.textContent = `The fetch workflow could not be started: ${error?.message ?? error}.`;
    }
  });
  return el("div", "library-fetch", state, again);
}

// The commit of one repository's files: the branch's head read just before, the commit made on it.
async function commitTo(host, files, message) {
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  return host.commitFiles({ branch: defaultBranch, expectedHead: snapshot.commit ?? null, message,
    files: files.map((file) => (typeof file.content === "string" ? { path: file.path, text: file.content } : { path: file.path, bytes: file.content })) });
}

function tokenNotice(web, host, error) {
  const links = host.webLinks();
  const page = links.newToken ? links.newToken("Agent M · sources", `Agent M writes the restricted content of requirement sources to ${web}`, 90) : links.projectTokens;
  const notice = el("p", null, `✗ The stored token cannot reach ${web} (${error?.message ?? error}). Nothing was committed. Extend the token so that it can write to that repository: `);
  const anchor = el("a", null, "the server's token page ↗");
  anchor.setAttribute("href", page ?? "#");
  notice.append(anchor, ".");
  return notice;
}

export const route = {
  name: "library",
  entry: "settings",
  title: "Library",
  async render(target, context, params = {}) {
    const instanceRepo = context.instance.repository;
    let entries, branch, failures;
    try {
      ({ entries, branch } = await readRegisterOf(context.instance.host));
      failures = await fetchFailures(context.instance.host, branch, entries);
    } catch (error) {
      target.replaceChildren(el("h2", null, "Library"), el("p", "library-unreadable", `The library could not be read: ${error?.message ?? error}.`));
      return;
    }
    if (typeof params.source === "string" && params.source) {
      const entry = entries.find((each) => each.id === params.source);
      target.replaceChildren(entry ? entryView(entry, context) : el("p", null, `The library holds no source ${params.source}.`));
      return;
    }

    // ------------------------------------------------------------ the list
    const list = el("div", "library-sources");
    const showList = () => list.replaceChildren(...entries.map((entry) => {
      const name = el("button", "library-source-name btn", entry.fields.title ?? entry.id);
      name.addEventListener("click", () => context.go("library", { source: entry.id }));
      const startFetch = () => context.instance.host.startWorkflow(FETCH_WORKFLOW, branch, {});
      return el("section", "library-source panel", el("h3", null, name), el("p", null, `${entry.id} · ${entry.fields.kind} · ${entry.fields.authority}`),
        el("p", null, versionsOf(entry).length ? `Versions: ${versionsOf(entry).map((row) => unquoted(row.cells.Version)).join(", ")}` : "No version recorded yet."),
        fetchState(entry, failures, startFetch) ?? "");
    }));
    showList();

    // ------------------------------------------------------------ + Register source
    const state = { route: "legal-text", identifier: "", designation: "", repo: null, files: [] };
    let remembered = {};
    let already = null;
    const open = el("button", "library-register btn primary", "+ Register source");
    const panel = el("section", "library-register-panel panel");
    panel.hidden = true;
    const routeSelect = el("select", "library-route", ...Object.keys(ROUTES).map((name) => el("option", null, name)));
    for (const option of routeSelect.childNodes) option.value = option.textContent;
    routeSelect.value = state.route;
    const help = el("p", "library-route-help", ...Object.values(ROUTES).flatMap((sentence) => [sentence, el("br")]));

    const legalAddress = el("input", "library-legal-address"), legalIdentifier = el("p", "library-legal-identifier");
    const designation = el("input", "library-standard-designation");
    const repositoryAddress = el("input", "library-repository-address"), repositoryCommit = el("p", "library-repository-commit");
    const filesInput = el("input", "library-files");
    filesInput.type = "file"; filesInput.multiple = true;
    const fileRows = el("div", "library-file-rows");
    const contentRepository = el("input", "library-content-repository");
    const filesBox = el("div", "library-files-box", el("p", null, el("label", null, "Files ", filesInput)), fileRows,
      el("p", null, el("label", null, "Repository for restricted content ", contentRepository)), explain("file-only-hashed"));
    const partLegal = el("div", "library-route-legal-text", el("p", null, el("label", null, "EUR-Lex or ELI address ", legalAddress)), legalIdentifier);
    const partStandard = el("div", "library-route-standard", el("p", null, el("label", null, "Full designation, with edition and amendments ", designation)), explain("standard-designation"));
    const partDocuments = el("div", "library-route-documents");
    const partRepository = el("div", "library-route-repository", el("p", null, el("label", null, "Repository address ", repositoryAddress)), repositoryCommit);
    const parts = { "legal-text": partLegal, standard: partStandard, documents: partDocuments, repository: partRepository };
    for (const input of [legalAddress, designation, repositoryAddress, contentRepository]) { input.value = ""; input.autocomplete = "off"; input.spellcheck = false; }
    const formBox = el("div", "library-form-box");
    const publicStatement = el("p", "library-public notice");
    const alreadyBox = el("div", "library-already-box");
    const result = el("div", "library-result");

    const showRoute = () => {
      for (const [name, part] of Object.entries(parts)) part.hidden = name !== state.route;
      (state.route === "standard" ? partStandard : partDocuments).append(filesBox);
      filesBox.hidden = !(state.route === "standard" || state.route === "documents");
    };

    const isRestricted = (licence) => !REPUBLISHABLE.test(String(licence ?? ""));
    const keptFiles = () => state.files.filter((file) => !file.onlyHashed);
    function statement(fields) {
      const lines = [`Becomes public: the register entry, always, in the instance repository ${instanceRepo}.`];
      const names = (files) => files.map((file) => file.name).join(", ");
      const kept = keptFiles(), hashed = state.files.filter((file) => file.onlyHashed);
      if (kept.length) {
        if (!isRestricted(fields.licence)) lines.push(`Content, public in the instance repository: ${names(kept)}.`);
        else if (fields.content_repository) lines.push(`Content, stored only in ${parseWeb(fields.content_repository)} and not in the public instance: ${names(kept)}.`);
        else lines.push(`Content: ${names(kept)} needs a repository to be named; until then nothing is stored.`);
      }
      if (hashed.length) lines.push(`Nothing of ${names(hashed)} is stored: only its SHA-256 is recorded, with a note.`);
      return lines.join(" ");
    }
    const parseWeb = (address) => { try { return parseAddress(address).path; } catch { return address; } };

    function checks(document) {
      const { fields } = document;
      remembered = { ...fields };
      publicStatement.textContent = statement(fields);
      const found = [];
      const add = (rule, what, fix) => found.push(finding({ artifact: "library", line: 1, kind: "error", rule, what, fix }));
      const names = namesOf(fields, fields.id).map((name) => name.toLowerCase());
      const same = entries.find((entry) => namesOf(entry.fields, entry.id).some((name) => names.includes(name.toLowerCase())));
      if (same !== already) {
        already = same ?? null;
        if (already) {
          const go = el("button", "library-already btn", `Open ${already.id}`);
          go.addEventListener("click", () => context.go("library", { source: already.id }));
          alreadyBox.replaceChildren(go);
        } else alreadyBox.replaceChildren();
      }
      if (same) add("THE INSTANCE KEEPS THE SOURCE REGISTER", `this source is already in the library as ${same.id}`, `open its entry and add a new version of it instead (UC-016), or name another source`);
      if (keptFiles().length && isRestricted(fields.licence) && !fields.content_repository) {
        add("RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE", "restricted content needs a repository of its own", "name the repository for the content in content_repository, or only hash the files");
      }
      if (state.route === "documents" && !state.files.length) add("THE SOURCE MODEL IS GENERIC", "no file is selected", "select the files or the zip file");
      if (state.route === "legal-text" && !fields.identifier) add("THE SOURCE MODEL IS GENERIC", "no EU legal text is recognised yet", "paste its EUR-Lex or ELI address");
      if (state.route === "repository" && !state.repo) add("A LIVING SOURCE IS PINNED", "the repository is not pinned to a commit yet", "paste its address so that its current commit is read");
      return found;
    }

    function versionRow() {
      if (state.route === "legal-text") return "";
      const readFrom = state.route === "repository" && state.repo ? `${state.repo.address} commit ${state.repo.commit}` : state.files.length ? "the selected files" : "—";
      const version = state.route === "standard" ? (state.designation || today()) : today();
      return `| \`${version}\` | ${today()} | ${state.route === "standard" ? "—" : "—"} | ${readFrom} | pending |`;
    }

    function draft(carried) {
      const fields = { ...carried, kind: carried.kind ?? KIND_OF[state.route] };
      if (state.route === "standard") { fields.licence ??= "restricted"; if (state.designation) fields.designation = state.designation; }
      if (state.route === "legal-text" && state.identifier) fields.identifier = state.identifier;
      if (state.route === "repository" && state.repo) fields.identifier = state.repo.address;
      if (contentRepository.value.trim()) fields.content_repository = contentRepository.value.trim();
      const front = Object.entries(fields).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => `${key}: ${value}`);
      const text = [...(front.length ? ["---", ...front, "---"] : []), `# ${fields.id ?? ""} ${fields.title ?? ""}`.trimEnd(), "", "## Versions", "",
        "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", versionRow(), ""].join("\n");
      return readDocument(ENTRY, `docs/sources/${fields.id ?? "SRC-new"}.md`, text);
    }

    async function save(document) {
      result.replaceChildren();
      const id = document.fields.id;
      const text = writeDocument(ENTRY, document);
      const entry = readDocument(ENTRY, `docs/sources/${id}.md`, text);
      try {
        const plan = state.route === "legal-text"
          ? [{ repository: instanceRepo, files: [{ path: `docs/sources/${id}.md`, content: text }] }]
          : await registrationCommits(entry, state.files.map((file) => ({ name: file.name, bytes: file.bytes, keep: !file.onlyHashed })), instanceRepo);
        const ordered = [...plan.filter((item) => item.repository !== instanceRepo), ...plan.filter((item) => item.repository === instanceRepo)];
        const done = [];
        for (const item of ordered) {
          let host = context.instance.host, web = instanceRepo;
          if (item.repository !== instanceRepo) {
            const address = parseAddress(item.repository);
            host = connect(address, credentialsFor(context.store, address) ?? {});
            web = address.web;
            try { await commitTo(host, item.files, `Register source ${id}: its content (Agent M dashboard)`); } catch (error) {
              if (["PermissionMissing", "NotFound", "TokenRefused"].includes(error?.name)) { result.append(tokenNotice(web, host, error)); return; }
              throw error;
            }
          } else {
            await commitTo(host, item.files, `Register source ${id} (Agent M dashboard)`);
          }
          done.push(web);
        }
        ({ entries } = await readRegisterOf(context.instance.host));
        showList();
        const open = el("button", "library-open-entry btn", `Open ${id}`);
        open.addEventListener("click", () => context.go("library", { source: id }));
        result.append(el("p", null, `✓ ${id} is registered: committed to ${done.join(" and ")}. `), open);
      } catch (error) {
        result.append(el("p", null, `✗ ${error?.message ?? error} — nothing more was written.`));
      }
    }

    function buildForm(fresh = false) {
      if (fresh) { remembered = {}; already = null; alreadyBox.replaceChildren(); }
      formBox.replaceChildren(schemaForm(ENTRY, draft(remembered), { onSave: save, extraChecks: checks }));
    }

    const openPanel = () => { panel.hidden = false; showRoute(); buildForm(true); };
    open.addEventListener("click", openPanel);
    routeSelect.addEventListener("change", () => { state.route = routeSelect.value; state.identifier = ""; state.designation = ""; state.repo = null; state.files = []; fileRows.replaceChildren(); showRoute(); buildForm(true); });
    legalAddress.addEventListener("change", () => {
      const found = recogniseLegalText(legalAddress.value.trim());
      state.identifier = found ? (found.celex ?? found.eli) : "";
      legalIdentifier.textContent = found ? `Recognised: ${found.celex ? `CELEX ${found.celex}` : `ELI ${found.eli}`}` : "No EU legal text is recognised in this address; use its EUR-Lex or ELI address.";
      buildForm();
    });
    designation.addEventListener("change", () => { state.designation = designation.value.trim(); buildForm(); });
    contentRepository.addEventListener("change", () => buildForm());
    filesInput.addEventListener("change", async () => {
      state.files = [];
      fileRows.replaceChildren();
      for (const file of Array.from(filesInput.files ?? [])) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const entryFile = { name: file.name, bytes, sha: await sha256(bytes), onlyHashed: false };
        state.files.push(entryFile);
        const only = el("input", "library-file-only-hashed");
        only.type = "checkbox";
        only.addEventListener("change", () => { entryFile.onlyHashed = only.checked; buildForm(); });
        fileRows.append(el("p", null, el("span", "library-file-hash", `${file.name}: ${entryFile.sha}`), " ", el("label", null, only, " Only hash it — store it nowhere")));
      }
      buildForm();
    });
    repositoryAddress.addEventListener("change", async () => {
      state.repo = null;
      try {
        const address = parseAddress(repositoryAddress.value.trim());
        const host = connect(address, credentialsFor(context.store, address) ?? {});
        const { defaultBranch } = await host.repositoryInfo();
        const snapshot = await host.readSnapshot(defaultBranch);
        state.repo = { address: address.web, commit: snapshot.commit };
        repositoryCommit.textContent = `Pinned to commit ${snapshot.commit} on ${defaultBranch}.`;
      } catch (error) {
        repositoryCommit.textContent = `The repository could not be read: ${error?.message ?? error}.`;
      }
      buildForm();
    });

    panel.append(el("h3", null, "Register a source"), el("p", null, el("label", null, "What is the source? ", routeSelect)), help, explain("source-kinds"),
      partLegal, partStandard, partDocuments, partRepository,
      explain("source-name"), explain("source-authority"), explain("source-licence"),
      formBox, alreadyBox, publicStatement, explain("source-public"), result);
    showRoute();
    target.replaceChildren(el("h2", null, "Library"), el("p", null, open), panel, list);
  },
};
