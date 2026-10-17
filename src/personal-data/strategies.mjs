// MOD-personal-data — the recipe `report-data` and the check `people-search`, offered to the job runner as `Strategies`.

import { eligible } from "../participant-list/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { personHits } from "./people.mjs";

const RULE = "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE";
const PLACES = "THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED";

/**
 * recipe report-data — one part per report-data piece the person picked (`params.pieces`, each `{ name, text }`), the piece's text as
 * picked. The mail's people (`params.people`) are not read here: they stay in the job's context for `people-search`. Throws
 * `PlaceNotAllowed` when the participant that receives the parts (`params.participant`) is at a place `context.places.mailbox`
 * does not allow; no part is then given. A mailbox that names no places (`null`) restricts nothing, as in the runner's own check.
 */
async function reportData(context, params) {
  const { participant, pieces } = params;
  const allowed = context.places?.mailbox ?? null;
  if (allowed && participant && eligible([participant], { capabilities: [], places: [{ from: "the mailbox", allowed }] }).leftOut.length) {
    throw Object.assign(new Error(`${participant.name} processes at ${participant.place}, which the mailbox does not allow (${allowed.join(", ")}); ${PLACES}`),
      { name: "PlaceNotAllowed", participant: participant.name, place: participant.place, allowed });
  }
  return (pieces ?? []).map(({ name, text }) => ({ name, text, size: 0, sources: [], required: true }));
}

/**
 * check people-search — an error finding for every hit of the context's people (`context.params.people`) in the draft's `text`,
 * naming the line.
 */
function peopleSearch(draft, context) {
  return personHits(String(draft?.text ?? ""), context.params?.people ?? {}).map((hit) => finding({
    artifact: "the rewritten text",
    line: hit.line,
    kind: "error",
    rule: RULE,
    what: `names ${hit.value} (${hit.kind}), a person of the mail`,
    fix: "describe it without the person",
  }));
}

export const privacyStrategies = { recipes: { "report-data": reportData }, checks: { "people-search": peopleSearch } };
