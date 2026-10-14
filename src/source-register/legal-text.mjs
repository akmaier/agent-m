// legal-text.mjs — recognising an EU legal text (MOD-source-register, Parts: legal-text.mjs — "recognising an EU legal text, and
// fetching it").
//
// Module: MOD-source-register
//
// An author pastes the address of an EU legal text and Agent M recognises what names it (UC-004 step 4): the CELEX number an EUR-Lex
// address carries in its `uri` parameter, or the ELI an EUR-Lex or data.europa.eu address has as its path. Pure: no request is made.

// The servers of the EU's publication office whose addresses name a text.
const EUR_LEX = "eur-lex.europa.eu", DATA_EUROPA = "data.europa.eu";
const PUBLICATIONS = "https://publications.europa.eu";

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

const clean = (value) => String(value ?? "").trim().replace(/^W\//, "").replace(/^"|"$/g, "");

function requestOf(identifier) {
  if (identifier && typeof identifier.celex === "string" && CELEX.test(identifier.celex)) {
    const url = new URL(`/resource/celex/${encodeURIComponent(identifier.celex)}`, PUBLICATIONS);
    url.searchParams.set("language", "eng");
    return { url, baseName: identifier.celex };
  }
  if (identifier && typeof identifier.eli === "string") {
    let eli;
    try { eli = new URL(identifier.eli); } catch { eli = null; }
    if (eli && eli.hostname === DATA_EUROPA && /^\/eli\//.test(eli.pathname)) {
      const url = new URL(`/resource${eli.pathname.replace(/\/$/, "")}`, PUBLICATIONS);
      url.searchParams.set("language", "eng");
      return { url, baseName: eli.pathname.replace(/^\/eli\//, "").replace(/\/+/g, "-") };
    }
  }
  return null;
}

function extensionOf(type) {
  const media = String(type ?? "").split(";")[0].trim().toLowerCase();
  if (media === "application/xhtml+xml") return "xhtml";
  if (media === "text/html") return "html";
  if (media === "text/plain") return "txt";
  if (media === "application/xml" || media === "text/xml") return "xml";
  if (media === "application/pdf") return "pdf";
  return "bin";
}

function filenameOf(response, baseName) {
  const disposition = response.headers.get("content-disposition") ?? "";
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
  if (encoded) {
    try { return decodeURIComponent(encoded); } catch {}
  }
  const named = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
  if (named) return named;
  return `${baseName}.${extensionOf(response.headers.get("content-type"))}`;
}

function dateOf(response) {
  const header = response.headers.get("date");
  const date = header ? new Date(header) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}

function repositoryVersionOf(response) {
  return clean(response.headers.get("x-publication-version"))
    || clean(response.headers.get("etag"))
    || clean(response.headers.get("content-location"))
    || clean(response.url);
}

const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

/**
 * fetchLegalText(identifier: { celex: string } | { eli: string }) -> Promise<{ files: { name: string, bytes: Uint8Array
 * }[], retrieved: string, repositoryVersion: string }> — in Node: fetches the official text from the EU publication
 * repository, in English, with the date it was retrieved and the repository's version identifier. Throws NotFound
 * { address } when the publication repository says there is no text, and Unreachable { reason } when the repository
 * cannot be reached or cannot answer with a usable text. No fallback text is guessed.
 */
export async function fetchLegalText(identifier) {
  const request = requestOf(identifier);
  if (!request) throw failure("NotFound", "the identifier names no EU legal text fetch address", { address: "" });
  let response;
  try {
    response = await fetch(request.url, { headers: { accept: "application/xhtml+xml, text/html, text/plain, application/xml;q=0.8" } });
  } catch (error) {
    throw failure("Unreachable", `the publication repository could not be reached: ${error?.message ?? String(error)}`,
      { reason: error?.message ?? String(error) });
  }
  if (response.status === 404 || response.status === 410) {
    throw failure("NotFound", `${request.url.href} names no legal text`, { address: request.url.href });
  }
  if (!response.ok) {
    throw failure("Unreachable", `the publication repository answered ${response.status}`, { reason: `HTTP ${response.status}` });
  }
  let bytes;
  try {
    bytes = new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    throw failure("Unreachable", `the publication repository's answer could not be read: ${error?.message ?? String(error)}`,
      { reason: error?.message ?? String(error) });
  }
  if (!bytes.length) {
    throw failure("Unreachable", "the publication repository returned an empty text", { reason: "empty answer" });
  }
  return { files: [{ name: filenameOf(response, request.baseName), bytes }], retrieved: dateOf(response),
    repositoryVersion: repositoryVersionOf(response) };
}
