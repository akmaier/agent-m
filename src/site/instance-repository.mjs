// The instance a page belongs to — AN INSTANCE IS A FORK OF AGENT M: the repository of the Pages address the page is served
// from, <owner>.github.io/<name>/, whatever page of the site it is; else Agent M itself (a page served from this machine).

export const UPSTREAM = "akmaier/agent-m";

export function instanceOf({ hostname, pathname }) {
  const owner = String(hostname ?? "").endsWith(".github.io") ? hostname.split(".")[0] : null;
  const name = String(pathname ?? "").split("/").filter(Boolean)[0];
  return owner && name ? `${owner}/${name}` : UPSTREAM;
}
