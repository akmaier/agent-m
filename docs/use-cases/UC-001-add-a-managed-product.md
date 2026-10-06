---
id: UC-001
title: Add a managed product
area: setup
actors:
  - Author
  - GitHub
realises:
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - ADDING A PRODUCT CREATES ITS LAYOUT
  - A MANAGED PRODUCT NEEDS NO PAGES SITE
  - THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER
  - NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY
  - ONE REVIEW LAYOUT FOR EVERY PRODUCT
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - CONFIGURATION LIVES IN THE BROWSER
  - THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN
  - THE TOKEN LINK IS PREFILLED
  - THE REPOSITORY CHOICE IS SPELLED OUT
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - A GITHUB PRODUCT USES A TOKEN OF ITS OWN
  - A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT
  - A TOKEN IS SCOPED TO WHAT IT WRITES
  - THE SHARED PAGES ORIGIN IS DISCLOSED
  - THE PAGE STATES WHAT IT SENDS WHERE
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - A PRODUCT IS NAMED BY ITS ADDRESS
  - GITLAB PRODUCTS ARE SUPPORTED
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
---
# UC-001 Add a managed product

**Goal.** The author brings a GitHub repository under their Agent M instance with as little effort
as possible, even if they are new to GitHub. The product's artifacts live in the product's own
repository; they are reviewed on the instance's dashboard. The product gets no Pages site.

## Actors

- **Author** — runs the Agent M instance and owns the product; possibly new to GitHub.
- **GitHub** — hosts the product repository, the instance repository, and the token page.

## Precondition

- The author has an Agent M instance with its token stored in this browser (UC-014).
- The product repository exists on GitHub or on a GitLab server, and the author can write to it.

## Main flow

1. On the instance's dashboard, the author opens the product selector and chooses **+ Add product**.
   A panel opens on the same page.
2. The author pastes the address of the product repository, as it appears in the browser — for
   example `https://github.com/alice/thesis-tool` or
   `https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool`. Agent M recognises the server and
   whether it is GitHub or GitLab, and shows which of the two routes below applies.
3. **Step A · A key for the product.** The product gets a key of its own; the instance's key from UC-014
   stays as it is. From the address typed in step 2, the panel shows a button **Open GitHub's token page
   (prefilled)** — the page for a new token with every permission filled in as in UC-014, 90 days, the
   product's owner as the token's owner, and a name and description built from the product repository's
   name: the name `Agent M · <owner>/<repository>`, within GitHub's 40 characters — a longer one drops the
   owner, and then the end of the repository's name —, the description `Agent M for the product
   <owner>/<repository>: reviews, commits, issues, pull requests and runs of the work you start in it.` —
   and, underneath, exactly what to do there, with the names filled in:
   1. under *Repository access* choose *Only select repositories* and select **`<product repository>`**
      — nothing else;
   2. press **Generate token** and copy the token.

   Back in the panel, after the notice of UC-014, the author pastes the token, confirms its expiry date and
   presses **Store and check**: Agent M stores it for this product only and checks that it reaches the
   product repository.
4. **Step B · Check.** Agent M reads the product repository with the product's key — or, in 3a, with the
   key that already reaches it — and shows ✓, or names what is missing — after *Store and check* without
   another click, otherwise when the author presses **Check**. For a *public* repository a read succeeds
   even without the token's permission, so the panel says that write access is confirmed at the
   next step.
5. **Step C · Add the product** — one click. Agent M:
   - writes the missing review layout into the product repository's default branch
     (`docs/use-cases/`, `docs/architecture/`, `docs/approvals/`, `docs/spec-freigaben/`, a `SPEC.md`
     skeleton, a `CHANGELOG.md`), skipping whatever already exists;
   - adds the product's address to the list in this browser's `localStorage` — nothing is written to
     the instance repository;
   - shows the commit as a link, and offers to switch to the new product.

Every step carries a folded **What is this?** explanation for newcomers: what a repository is, why the
product gets a key of its own, what the commit contains, how to undo it, and why the product list
lives in this browser only.

```mermaid
sequenceDiagram
    actor A as Author
    participant D as Dashboard (instance Pages)
    participant G as GitHub token page
    participant P as Product repository
    A->>D: + Add product, paste the address
    D-->>A: Step A, token page prefilled for the product
    A->>G: select the product repository, Generate token, copy
    A->>D: paste, Store and check
    D->>P: read (the product's token)
    D-->>A: reachable
    A->>D: Step C, Add product
    D->>P: commit missing layout
    D->>D: add address to the list in localStorage
    D-->>A: commit link
```

## Alternative flows

- **3a. A key stored in this browser already reaches the product** — its own, or the instance's because
  the author selected the product in UC-014. Step A is shown as done; adding a product is typing its
  name, *Check*, *Add product*, and Agent M reads and writes the product with that key.
- **3b. No key is stored in this browser for the instance** (another computer, or the setup of UC-014 was
  skipped). The product's steps are the same: its key does not depend on the instance's.
- **4a. The check fails.** Agent M names the repository it cannot reach and shows Step A again.
- **5a. The write is refused** although the read succeeded — a public repository not yet added to the
  token. Agent M says so and shows Step A again; nothing was written.
- **2a. The product repository does not exist yet.** Agent M says so and links GitHub's page for a
  new repository, with a folded explanation of the choices there; the author returns and continues
  at step 2.
- **5b. The product already has the complete layout.** Nothing is committed; only the address is
  added to the list in this browser.
- **1a. The author works in another browser or on another computer.** Its product list is empty, as it
  has no token either; each product is added again with *+ Add product* — for a product that already
  has its layout, that is its key in Step A (3b), *Check* and *Add product* (5b).
- **3c. The product is on a GitLab server.** Step A becomes **Create a key for this project**: a
  button opens the project's *Settings → Access tokens* page on that server; underneath, what to set
  there — name `Agent M`, role **Maintainer**, scope **`api`**, an expiry date — then *Create project
  access token* and copy it. Step B is the familiar notice, paste field and *Store and check*; the
  token is stored for this project only and is sent only to that server. Then Step C as above. Each
  GitLab product has its own token; the instance's GitHub token is not involved there.
- **3d. The GitLab server offers no project access tokens, or the author is not *Maintainer*.**
  Agent M says which of the two it is, and explains that a personal token would reach every project
  of the author on that server; the author decides.

## Postcondition

- The product repository contains the review layout; it has no Pages site.
- This browser lists the product; the instance repository names no product.
- This browser keeps a token for this product that reaches the product repository and nothing else — or,
  in 3a, uses the key that already reached it; the instance's token is unchanged.
- Clicks: *+ Add product*, *Open GitHub's token page (prefilled)*, on GitHub the repositories and
  *Generate token*, *Store and check*, *Add product*. If the token already reaches the product:
  *+ Add product*, *Check*, *Add product*.
