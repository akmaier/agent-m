# What GitHub documents about self-hosted runners, its own runners' addresses and Actions secrets

**MESSUNG** — 2026-10-05, macOS 26.6.2, `curl 8.7.1`, one run at 07:34–07:35 UTC. It records what GitHub's documentation
says about where a self-hosted runner is registered, how it reaches GitHub, why GitHub advises against one on a public
repository, which addresses GitHub's own runners use, where an Actions secret is kept, and which field of a repository the
REST API reports its visibility in — for the participant form of the settings page (ARC-026 decision 12; UC-017 3, 3b;
UC-011 1c.5). SPEC §6 `A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY`.

## Method

- **Sources.** Each page was fetched once as Markdown through GitHub's documentation API,
  `https://docs.github.com/api/article/body?pathname=<path>`, with `curl -sS -m 60`, no token and no cookie; the table
  names each text's length and the first sixteen hexadecimal digits of its SHA-256. Every quotation is copied from the
  fetched text, not from a summary. The time of the run is the clock read before and after it (07:34:36 and 07:34:49 UTC).
- **Negative findings.** A word reported absent is reported with a word the same search found on the same page (CLAUDE.md
  §6a.2): on the self-hosted runners reference, `inbound` occurs 0 times and `outbound` once.
- **No hands-on measurement.** No runner was registered, no workflow run and no SSH connection opened. What the
  documentation says is what this file records.

| Path fetched | Bytes | SHA-256 (first 16) |
|---|---|---|
| `/en/actions/concepts/runners/self-hosted-runners` | 2 126 | `84c7ada0f8705fbd` |
| `/en/actions/reference/runners/self-hosted-runners` | 15 674 | `70f20f29857c34fe` |
| `/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners` | 15 037 | `a9621fc326127774` |
| `/en/actions/reference/security/secure-use` | 37 397 | `85b1df7cafbfc866` |
| `/en/actions/reference/runners/github-hosted-runners` | 20 497 | `2537c22a86f6ee64` |
| `/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets` | 28 862 | `e602985b3dfc1aae` |
| `/en/rest/repos/repos` | 90 916 | `a53d404d83b90a79` |

## Findings

| Fact | Source (path above) | Quotation |
|---|---|---|
| A self-hosted runner is added to a repository, an organisation or an enterprise. | `…/self-hosted-runners/add-runners` | "You can add a self-hosted runner to a repository, an organization, or an enterprise." |
| GitHub recommends self-hosted runners for private repositories only, for the reason UC-017 3 gives. | same page, warning at its top | "We recommend that you only use self-hosted runners with private repositories." — "forks of your public repository can potentially run dangerous code on your self-hosted runner machine by creating a pull request that executes the code in a workflow." |
| The same advice in the security reference. | `/en/actions/reference/security/secure-use`, *Hardening for self-hosted runners* | "self-hosted runners should almost [never be used for public repositories]" — "because any user can open pull requests against the repository and compromise the environment." |
| A runner is added on the repository's settings: Actions, Runners, New self-hosted runner. | `…/add-runners`, steps 2–4 | "click **Runners**." — "Click **New self-hosted runner**." |
| Registering a runner takes a token that expires within the hour. | `…/add-runners`, step 6 | "an automatically-generated time-limited token" — "The token expires after one hour." |
| A runner connects to GitHub to receive its jobs. | `/en/actions/reference/runners/self-hosted-runners`, *Communication* | "Self-hosted runners connect to GitHub to receive job assignments" |
| Its machine needs outbound HTTPS; no inbound connection is among the requirements listed (`inbound` 0 times, `outbound` once on the page). | same section, *Requirements for communication with GitHub* | "The host machine must be able to make outbound HTTPS connections over port 443." |
| GitHub's own Windows and Ubuntu runners use the address ranges of Azure's data centres. | `/en/actions/reference/runners/github-hosted-runners`, *IP addresses* | "Windows and Ubuntu runners are hosted in Azure and subsequently have the same IP address ranges as the Azure datacenters." |
| GitHub advises against allowing those addresses on internal resources, and recommends a self-hosted runner instead. | same section | "we do not recommend that you use these as allowlists for your internal resources." — "we recommend you use larger runners with a static IP address range, or self-hosted runners." |
| An Actions secret is a value stored on GitHub, entered on the repository's page. | `…/use-secrets`, *Creating secrets for a repository* | "Click **New repository secret**." — "In the **Secret** field, enter the value for your secret." |
| A workflow started from a fork receives no secret but `GITHUB_TOKEN`. | same page, *Using secrets in a workflow* | "secrets are not passed to the runner when a workflow is triggered from a forked repository." |
| *Get a repository* answers with the repository's visibility in a field of its own. | `/en/rest/repos/repos`, *Get a repository* (`GET /repos/{owner}/{repo}`), response schema | "`visibility`: string" |

## What it settles for ARC-026

- **Private repositories only.** GitHub's own documentation gives the reason the participant form states for refusing a
  self-hosted runner of a public repository: a pull request from a fork can run its code on the runner's machine
  (`private-only` and `public-refused`, ARC-026 decision 12). The page reads the visibility with *Get a repository*
  (`MOD-git-host.repositoryInfo`, ARC-004).
- **No inbound connection.** The runner connects to GitHub and needs outbound HTTPS on port 443; GitHub lists no inbound
  connection among a runner's requirements. That is the documented ground of `runner-on-agent-machine`: a runner on an
  agent's machine reaches the agent locally and works behind NAT.
- **The SSH alternative's cost** (UC-017 3b, `ssh-alternative`). A workflow on GitHub's machines reaching an agent over SSH
  needs the private key as an Actions secret — a value stored on GitHub — and a host that accepts connections from Azure's
  address ranges, which GitHub advises not to allow on internal resources, recommending a self-hosted runner instead.
- **Not measured.** Whether a runner registered to an organisation, not to the repository, serves a job of a private
  repository of that organisation, and how GitLab's runners behave: the participant form offers GitHub's runners alone, as
  the job workflow of ARC-029 does.
