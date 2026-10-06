// The addresses of the servers' own pages for one repository — the pages UC-001 opens: the page for a new token, the list of
// the person's tokens, a GitLab project's Access tokens page, the page for a new repository. Navigation only; nothing here is
// requested, and no page carries a credential (A CREDENTIAL IS NEVER PLACED IN A URL).
//
// Module: MOD-repository-hosts
//
// WebLinks' other pages — the CI secrets, the fallback's new-file and edit pages, the runs, pipeline schedules, Pages settings
// and the fork — are added by the items whose use cases open them.

// ONE GITHUB TOKEN SERVES EVERY FEATURE: the permissions of the one fine-grained token, as the parameters and access levels of
// GitHub's prefilled token page ("Pre-filling fine-grained personal access token details using URL parameters", table
// "Repository permissions": pull_requests read/write, workflows write only, metadata read only; write always includes read).
const GITHUB_PERMISSIONS = Object.freeze([["contents", "write"], ["issues", "write"], ["pull_requests", "write"],
  ["actions", "write"], ["workflows", "write"], ["metadata", "read"]]);

const GITHUB_TOKENS = "https://github.com/settings/personal-access-tokens";

// address: a RepositoryAddress -> WebLinks, with the pages this item needs.
export function webLinks(address) {
  if (address.server === "github") {
    return Object.freeze({
      // THE TOKEN LINK IS PREFILLED: name, description, expiry in days and the permissions. THE REPOSITORY CHOICE IS SPELLED OUT:
      // the repositories to select are named beside the link, never in it. The repository's owner owns the token (target_name):
      // "Each token is limited to access resources owned by a single user or organization" (GitHub, read 2026-10-06).
      newToken(name, description, days) {
        if (typeof name !== "string" || !name || typeof description !== "string") throw new TypeError("a token is given a name and a description");
        if (!Number.isInteger(days) || days < 1 || days > 366) throw new TypeError(`a token expires after 1 to 366 days: ${days}`);
        const fields = new URLSearchParams({ name, description, target_name: address.path.split("/")[0], expires_in: String(days),
          ...Object.fromEntries(GITHUB_PERMISSIONS) });
        return `${GITHUB_TOKENS}/new?${fields}`;
      },
      // The list of the person's fine-grained tokens: where a token is opened, extended to a repository, and regenerated.
      tokens: GITHUB_TOKENS,
      projectTokens: null,
      newRepository: "https://github.com/new",
    });
  }
  // A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: the project's Access tokens page, where the person creates the project access
  // token with role Maintainer and scope api, and rotates it; GitLab offers no page that could be prefilled for it.
  const projectTokens = `${address.web}/-/settings/access_tokens`;
  return Object.freeze({
    newToken: () => projectTokens,
    tokens: projectTokens,
    projectTokens,
    newRepository: `${address.origin}/projects/new`,
  });
}
