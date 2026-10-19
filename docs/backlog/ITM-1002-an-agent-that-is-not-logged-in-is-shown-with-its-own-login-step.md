---
id: ITM-1002
title: An agent that is not logged in is shown with its own login step
level: module
realises:
  - UC-044
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
modules:
  - MOD-agent-processes
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-13, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1002 An agent that is not logged in is shown with its own login step

**REGISTER**

## Outcome

UC-044-install-and-pair-the-bridge.md:108-109 (3b): "An agent is installed but not logged in. The bridge says so and
shows the agent's own login step; it never asks for the password itself."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-agent-processes.md:61-68:

> - `Agent` — `{ name: string, installed: boolean, version: string | null, loggedIn: boolean | null, login: string,
>   install: Record<"macos" | "windows" | "linux", string> }`: `login` is the agent's own login step from its row's Login
>   check, which the Bridge's window shows for an agent that is not logged in (UC-044 3b); `name` is the Agent of a row of `agents.md`, so that a supported
>   agent added is a row added, not a change of this interface (`OPEN FOR EXTENSION, CLOSED FOR CHANGE`).
> - `installedAgents() -> Promise<Agent[]>` — every supported agent, each found on the machine's path with its version, or
>   marked as missing with its vendor's installation page; an installed agent that is not logged in is marked so, and the
>   agent's own login step is named — this module never asks for a password (UC-044). Starts only the commands of the
>   register's Version and Login check columns; changes nothing.

## Acceptance

- Unit tests: an installed agent whose login check fails is returned with `loggedIn: false` and its login step from the
  register; nothing asks for a password.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
