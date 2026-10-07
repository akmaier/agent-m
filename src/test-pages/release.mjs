// The route `release` — the release panel (UC-013), as docs/architecture/MOD-test-pages.md states it and this item's
// own Outcome narrows it: the next version of the product's own line, preset to a minor step, and the changelog
// entry dated today, both editable; *Start release candidate*, one click, after which it names the candidate and its
// queued run; once the run has ended, every level with its result, every model-dependent check as a rate against the
// running version, and the release test report, whose "## Requirements" names every requirement with the tests that
// guard it, with *Accept and release*, which asks first for the reason of every failing test and every worse rate;
// each step with its folded explanation (ITM-255); what refuses a step, named.
//
// Not part of this item, per the Outcome: the audit drawn inside the panel (UC-030), the run on the job list
// (UC-036), the frame's parts that are not built — notice, confirmDecision, runPanel, embedRoute, chosenProduct —,
// and the routes schedule, runs and generate. So this route reads the host from `context.product.host`, asks the
// person for their own name directly (no identity setting exists yet — MOD-browser-store.md's own catalogue, Data,
// holds none — and this is the only input the item's two writes need besides what the form already carries), shows
// its own reasons for a failing test or a worse rate without the frame's dialog, and renders the whole release test
// report with MOD-markdown-render's renderArtifact rather than rebuilding its tables: the report's own "## Levels",
// "## Tests" and "## Requirements" sections already are "every level with its result", "every model-dependent check
// as a rate" and "every requirement with the tests that guard it" (MOD-release-evidence.md, Data), word for word.
//
// Gap, noted rather than designed around (developers.md, "Where the item ... is unclear"): acceptAndRelease's
// `report.blob` (docs/architecture/MOD-release-evidence.md, Interfaces) must be the git blob SHA of the report text
// this route itself just showed — MOD-release-evidence's own releaseReport returns no blob, only `text` (src/
// release-evidence/report.mjs), so a caller hashes it; MOD-text-tools.blobSha does that, but MOD-test-pages.md's own
// `uses:` list does not name MOD-text-tools. Used here through its index.mjs all the same, since acceptAndRelease
// cannot otherwise be called as its own file specifies; no item needs the architecture file changed for this alone.
//
// Gap: reportsAwaitingAcceptance, by which a notification would address this route at a report that already waits,
// is ITM-239's and not built yet (src/release-evidence/index.mjs's own header); so this route does not yet resolve
// such an address — it always opens at the version form. The address itself is reachable (`params` is accepted, per
// the Route contract render(target, context, params)), just not yet interpreted.
//
// Module: MOD-test-pages

import { nextVersion, startReleaseCandidate, releaseReport, acceptAndRelease, ReleaseEvidenceError }
  from "../release-evidence/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { renderArtifact } from "../markdown-render/index.mjs";

// ---------------------------------------------------------------- small helpers (the module runs in a browser; every
// element is built with createElement/append, never parsed from an HTML string, as src/settings-pages/products.mjs's
// own `el` already does for another view of this frame).

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const today = () => new Date().toISOString().slice(0, 10);

// The message a refusal is shown with: the Outcome's "what refuses a step, named" — UC-013 2a, 3a/3b (LimitationMissing),
// 4a (TagExists), 4b is never a refusal (acceptAndRelease still releases, on the candidate's own tested commit).
function messageFor(e) {
  if (e instanceof ReleaseEvidenceError) {
    if (e.name === "NoRunner") {
      return `${e.message} Assign a second participant to the schedule's row, or run the release tests yourself (UC-013 2a).`;
    }
    if (e.name === "LimitationMissing") {
      return `Enter a reason for every failing test and worse rate before releasing: ${e.tests.join(", ")}.`;
    }
    if (e.name === "TagExists") return `${e.message} The release stops; start the next version instead (4a).`;
    if (e.name === "Incomplete") return e.message;
    if (e.name === "Moved") return "The release test report changed since it was shown — press Check results, then try again.";
    return e.message;
  }
  return e?.message ?? String(e);
}

// ---------------------------------------------------------------- Accept and release: a reason for every failing
// test and every worse rate, asked first (UC-013 3a, 3b), before the one click that releases.

function paintAccept(container, host, context, candidate, report) {
  const ids = [...new Set([...report.failing, ...report.worse])].sort();
  const reasonFields = new Map(ids.map((id) => [id, el("input", "reason")]));
  for (const [id, field] of reasonFields) field.dataset.id = id;
  const personField = el("input", "person");
  personField.placeholder = "Your name";
  const acceptBtn = el("button", "accept", "Accept and release");
  const out = el("p", "result");

  const section = el("section", "accept", el("h4", null, "Accept and release"));
  if (ids.length) {
    section.append(el("p", "muted", "A reason is needed for every failing test and every rate worse than the running version's."));
    for (const [id, field] of reasonFields) section.append(el("label", null, `${id} `, field));
  }
  section.append(el("label", null, "Your name ", personField), el("p", null, acceptBtn), out, explain("version-not-rewritten"));

  acceptBtn.addEventListener("click", async () => {
    const person = personField.value.trim();
    if (!person) { out.textContent = "Enter your name first."; return; }
    const limitations = Object.fromEntries(ids.map((id) => [id, (reasonFields.get(id).value ?? "").trim()]));
    acceptBtn.disabled = true;
    out.textContent = "Releasing…";
    try {
      const blob = await blobSha(report.text);
      const path = `docs/tests/releases/v${candidate.version}.md`;
      const { commit, tag } = await acceptAndRelease(host, { path, blob }, { limitations }, person, today());
      out.textContent = `Released ${tag} (commit ${commit}).`;
    } catch (e) {
      acceptBtn.disabled = false;
      out.textContent = messageFor(e);
    }
  });

  container.append(section);
}

// ---------------------------------------------------------------- the candidate's run: its levels, rates and report
// once it has ended (UC-013 step 3), with Accept and release once it is complete.

async function paintCandidate(container, context, candidate) {
  const host = context.product.host;
  container.replaceChildren(
    el("h3", null, `Release candidate ${candidate.tag}`),
    el("p", "muted", `Queued run: ${candidate.run}`),
  );
  const refreshBtn = el("button", "refresh", "Check results");
  const reportArea = el("div", "report");
  container.append(el("p", null, refreshBtn), reportArea);

  async function load() {
    const [at, results] = await Promise.all([host.readSnapshot(candidate.tag), host.readSnapshot("test-results")]);
    const report = await releaseReport(at, results, candidate);
    reportArea.replaceChildren(renderArtifact(report.text));
    if (!report.complete) {
      reportArea.append(el("p", "muted", "The run has not finished at every level yet."));
      return;
    }
    paintAccept(reportArea, host, context, candidate, report);
  }
  refreshBtn.addEventListener("click", load);
  await load();
}

// ---------------------------------------------------------------- the version form: UC-013 step 1-2, 1a and 2a.

async function paintForm(container, context) {
  container.replaceChildren();
  const host = context.product.host;
  const [info, tags] = await Promise.all([host.repositoryInfo(), host.listTags()]);
  const head = await host.readSnapshot(info.defaultBranch);
  const version = nextVersion(tags.map((t) => t.name), "minor", today());

  const versionField = el("input", "version");
  versionField.value = version;
  const changelogField = el("textarea", "changelog");
  changelogField.value = "";
  const personField = el("input", "person");
  personField.placeholder = "Your name";
  const startBtn = el("button", "start", "Start release candidate");
  const out = el("p", "result");

  startBtn.addEventListener("click", async () => {
    const v = versionField.value.trim();
    const changelog = changelogField.value;
    const person = personField.value.trim();
    if (!v || !person) { out.textContent = "Enter the version and your name first."; return; }
    startBtn.disabled = true;
    out.textContent = "Starting the release candidate…";
    try {
      const { candidate, run } = await startReleaseCandidate(host, v, head.commit, changelog, person);
      await paintCandidate(container, context, { version: v, tag: candidate, commit: head.commit, changelog, run });
    } catch (e) {
      startBtn.disabled = false;
      out.textContent = messageFor(e);
    }
  });

  container.append(
    el("h3", null, "New release"),
    el("label", null, "Next version ", versionField),
    el("label", null, "Changelog entry ", changelogField),
    el("label", null, "Your name ", personField),
    el("p", null, startBtn),
    out,
    explain("release-test-levels"),
    explain("independent-release-tests"),
  );
  // A FORM OPENS WITH ITS FIRST FIELD FOCUSED.
  versionField.focus();
}

export const route = {
  name: "release",
  entry: "releases",
  title: "Release",
  // params: not yet interpreted — see the gap noted above.
  async render(target, context, params) {
    target.replaceChildren();
    if (!context.product?.host) {
      target.append(el("p", "muted", "Choose a product first."));
      return;
    }
    target.append(el("h2", null, "Release"));
    const body = el("div", "release-body");
    target.append(body);
    void params;
    await paintForm(body, context);
  },
};
