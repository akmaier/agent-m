// legal-text.mjs — recognising an EU legal text (MOD-source-register, Parts: legal-text.mjs — "recognising an EU legal text, and
// fetching it"). Of it, ITM-313 builds recogniseLegalText; fetchLegalText is not built yet.
//
// Module: MOD-source-register
//
// An author pastes the address of an EU legal text and Agent M recognises what names it (UC-004 step 4): the CELEX number an EUR-Lex
// address carries in its `uri` parameter, or the ELI an EUR-Lex or data.europa.eu address has as its path. Pure: no request is made.

// The servers of the EU's publication office whose addresses name a text.
const EUR_LEX = "eur-lex.europa.eu", DATA_EUROPA = "data.europa.eu";

// A CELEX number: the sector (one digit), the year (four), the kind of act (one or two letters) and its number (four digits),
// as in 32024R1689; a consolidated text adds the date of its version, as in 02016R0679-20160504.
const CELEX = /^\d{5}[A-Z]{1,2}\d{4}(?:-\d{8})?$/;

// The path of an ELI: /eli/<type>/<year>/<number>, then /oj where the address names it, then a language.
const ELI_PATH = /^\/eli\/([a-z_]+)\/(\d{4})\/(\d+)(?:\/(oj))?(?:\/[a-z]{3})?\/?$/;

/**
 * recogniseLegalText(address: string) -> { celex: string } | { eli: string } | null — the CELEX number or the ELI that an EUR-Lex
 * or an ELI address names. An EUR-Lex address names a CELEX number in its `uri` parameter (`CELEX:32024R1689`, the colon plain or
 * as %3A), and an EUR-Lex or data.europa.eu address an ELI in its path; the ELI is returned as the URI the publication office gives
 * it — `http://` and the host DATA_EUROPA, then `/eli/<type>/<year>/<number>[/oj]` —, without the language. Null for an address of any other site, of a
 * page of EUR-Lex that names no text, a CELEX number or an ELI of no form, an address that is no http(s) address, and anything
 * that is no text. Pure.
 * @param {string} address
 * @returns {{ celex: string } | { eli: string } | null}
 */
export function recogniseLegalText(address) {
  if (typeof address !== "string") return null;
  let url;
  try { url = new URL(address); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.hostname === EUR_LEX) {
    const celex = /^CELEX:(.+)$/.exec(url.searchParams.get("uri") ?? "")?.[1];
    if (celex !== undefined && CELEX.test(celex)) return { celex };
  }
  if (url.hostname === EUR_LEX || url.hostname === DATA_EUROPA) {
    const eli = ELI_PATH.exec(url.pathname);
    if (eli) return { eli: `http://${DATA_EUROPA}/eli/${eli[1]}/${eli[2]}/${eli[3]}${eli[4] ? `/${eli[4]}` : ""}` };
  }
  return null;
}
