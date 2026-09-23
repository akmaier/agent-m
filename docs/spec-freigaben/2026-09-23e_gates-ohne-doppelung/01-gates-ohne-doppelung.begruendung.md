# Two gates for the same decision were one too many

**PO question, 2026-09-23:** *"Why do I have to accept the pull request? Can't you do that? What is
triggering the PR?"* — and the decision, the same day: reviewed artifacts go directly to `main`;
code goes through a pull request that the agent merges itself once CI is green.

**The problem.** The old rule said everything generated enters "as a branch, a pull request, or a
queued entry — never as a direct write to the default branch". For use cases, that put two gates in
a row: the merge of the pull request (does the text reach `main`?) and the approval record on the
dashboard (is the text accepted?). Only the second one decides anything. A merged use case is
still *open*, and its status comes from the record. The merge was a click without control, and an
unmerged use case could not even be reviewed on the dashboard, which reads `main`.

**What stays.** The name `A GENERATED ARTIFACT IS A PROPOSAL` stays and remains true: nothing
generated counts until a person accepts it. What changes is only the mechanism. The rule no longer
says where the text is stored; it says what makes it count.

**Code is different, and gets its own rule.** Code, tests, workflows and the dashboard have no
approval record, so the pull request with its CI run is the only check. The PO decided that the
author of the change may merge it once CI is green.

**One consequence you should know about.** Merging code to `main` deploys the dashboard to GitHub
Pages, so for Agent M a merge is a production deploy. `SOFTWARE_MAINTENANCE.md` §0.2 says "no
production deploy without approval". Read with this entry, your acceptance is the standing approval
for Agent M's code merges on green CI. It is not approval of any particular change, and it does not
cover any other product. If you want deploys to stay a click of yours, strike the last sentence of
the *Occasion* ("Who merges … including an agent").

**Impact analysis:** `A GENERATED ARTIFACT IS A PROPOSAL` is realised by UC-005, UC-007 and UC-010,
and by UC-001 on branch `feature/instance-use-cases`. Their flows describe pull requests and queues,
which remain allowed ("may be written directly" permits, it does not require), so none of them
becomes wrong. The old check `tests/test_no_direct_write.py` was never written. Its successor
checks what the new rule actually says.
