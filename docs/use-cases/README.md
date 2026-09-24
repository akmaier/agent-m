# Use cases of Agent M

Each use case is one file, `UC-<nnn>-<slug>.md`. Its status — open, accepted, changed since
acceptance — is not written anywhere: the review dashboard derives it from the approval records
in [`../approvals/`](../approvals/) (SPEC §10).

Review them on the dashboard: **https://akmaier.github.io/agent-m/** — or on your own fork's
dashboard (UC-014).

```mermaid
flowchart LR
    Author([Author])
    Reviewer([Reviewer])
    Contributor([Contributor])
    Endpoint([Model endpoint])
    Actions([GitHub Actions])
    CLI([Local CLI session])

    subgraph setup [Setup]
        UC001[UC-001 Add a managed product]
        UC002[UC-002 Choose a process model]
        UC003[UC-003 Configure a model endpoint]
        UC014[UC-014 Set up an instance]
    end
    subgraph s1 [1 Sources]
        UC004[UC-004 Register a source in the library]
        UC015[UC-015 Link sources to a product]
        UC016[UC-016 A source gets a new version]
    end
    subgraph s2 [2 Requirements]
        UC005[UC-005 Derive requirements]
        UC006[UC-006 Approve a SPEC change]
    end
    subgraph s3 [3 Use cases]
        UC007[UC-007 Derive use cases]
        UC008[UC-008 Review and accept a use case]
        UC009[UC-009 Inspect coverage]
    end
    subgraph rt [Runtimes]
        UC010[UC-010 Run in GitHub Actions]
        UC011[UC-011 Hand to local CLI]
    end
    subgraph evo [Evolution and release]
        UC012[UC-012 Issue to SPEC change]
        UC013[UC-013 Release a version]
    end

    Author --- UC014 & UC001 & UC002 & UC003 & UC004 & UC015 & UC016 & UC005 & UC007 & UC013
    Reviewer --- UC006 & UC008 & UC009
    Contributor --- UC012
    UC005 & UC007 --- Endpoint
    UC010 --- Actions
    UC011 --- CLI
```

The diagram is an overview. Mermaid has no UML use-case diagram, so actors and use cases are
drawn as a flowchart; where it and a use case's text disagree, the text holds (SPEC §4).
