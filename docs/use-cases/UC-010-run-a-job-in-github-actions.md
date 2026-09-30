---
id: UC-010
title: Run a job in GitHub Actions
area: runtime
actors:
  - Author
  - GitHub Actions
  - CI agent
realises:
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
  - A GENERATED ARTIFACT IS A PROPOSAL
  - NO SECRET IN THE REPOSITORY
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A JOB RECORD STARTS NO CI RUN
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
---
# UC-010 Run a job in GitHub Actions

**Goal.** A job runs server-side in the product repository's own CI, for long runs or when the
endpoint does not accept browser calls.

## Actors

- **Author** — starts the run.
- **GitHub Actions** — executes the job with a repository secret.
- **CI agent** — the participant (UC-017) whose workflow runs the job, calling its model endpoint.

## Precondition

- The product repository holds the agent's or endpoint's key as an Actions secret, not in any file. The
  dashboard names the secret and opens the repository's secrets page for it; it never asks for the value.
  This is Agent M's first level: nothing is installed on the author's computer (UC-044 explains both
  levels), and the calls are billed per use by the agent's provider — the run panel says so.
- The job workflow of Agent M is installed in the product repository.

## Main flow

1. The author starts the job from the dashboard or from GitHub's Actions page. The start writes the
   job's record `docs/jobs/JOB-<id>.md` in the product repository — from the dashboard as part of the
   author's click.
2. The workflow reads the job definition and prompt — the same files the browser uses.
3. The workflow calls the endpoint with the secret.
4. The workflow commits the resulting artifacts to the default branch, where they are open, together
   with the job's end record.
5. The author reviews them on the dashboard, as in UC-006 or UC-008.

```mermaid
sequenceDiagram
    actor A as Author
    participant G as GitHub
    participant W as Actions workflow
    participant E as Model endpoint
    A->>G: start job
    G->>W: run
    W->>W: read job definition and prompt
    W->>E: request with secret
    E-->>W: result
    W->>G: commit artifacts (open)
    A->>G: review on the dashboard
```

## Alternative flows

- **3a. The secret is missing.** The workflow fails with a message naming the secret; nothing is
  written.
- **4a. The result equals the current artifacts.** Nothing is committed; the run reports
  "no change".

## Postcondition

- The artifacts are of the same kind the browser runtime would produce.
- Nothing counts as accepted before a person accepts it on the dashboard.
