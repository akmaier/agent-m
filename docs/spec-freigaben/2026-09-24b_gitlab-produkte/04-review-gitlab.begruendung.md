# Products on GitLab, and a defect that affected GitHub products as well

**Three new rules make GitLab products possible:**
- `A PRODUCT IS NAMED BY ITS ADDRESS` — `owner/name` stops being unique the moment there is a second
  server, and GitLab projects sit in nested groups. The address is also what people copy from the
  browser, which removes the "what exactly do I type here?" question you raised for UC-001.
- `GITLAB PRODUCTS ARE SUPPORTED` — bounded by what was measured: the server's API must accept
  requests from the instance's address. Three servers were measured and all do.
- `A GITLAB PRODUCT IS WRITTEN WITH A TOKEN` — on GitHub, the no-token route prefills GitHub's
  new-file page. GitLab's equivalent reportedly ignores prefilled content (GitLab work item 594214;
  reported, not measured here). Offering a route that silently produces an empty file would be
  worse than saying "store a token first".

**Two withdrawals, both because the name stopped being true:**
- `ACCEPTANCE IS A COMMIT IN GITHUB` → `ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`. Same
  substance, without the server in the name.
- `AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW` → `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS
  APPROVAL`. **This one is a defect fix, not only a rename.** The workflow lives in the instance
  repository. A product's SPEC change, accepted on the dashboard, committed the record into the
  product repository — where no workflow exists. The SPEC was never updated; the entry would have
  shown *approved* forever. Nobody noticed because no product has been added yet.

**Why record and SPEC in one commit is the better design, not just the smaller fix.** It needs no
workflow in any product — on GitLab there would not even be GitHub Actions. The approval and its
effect can never be seen apart. And the same SHA checks the workflow ran (`A STALE APPROVAL IS NOT
APPLIED`) run in the dashboard before the commit, against the files at the commit being written on.

**What stays for the workflow:** the no-token route for the instance's *own* SPEC — the one
repository that carries it. `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` names
exactly that and nothing more.
