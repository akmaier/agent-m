# Issue To Specification Release Cases

The cases of `tests/test_issue_to_spec.py`, for the requirement `EVOLUTION ENTERS THROUGH THE SPECIFICATION` (SPEC.md): "An issue that changes behaviour — on
GitHub or on the product's GitLab server — becomes a specification change first and a code change second." UC-012 gives the order: in step 2 the author presses
**Implement**, which "puts the request to handle the issue as this use case does — with its number, title and text — into the prompt bar", and in step 6 the
agent of the conversation "writes them as entries under `docs/spec-freigaben/`, each naming the issue". The cases check the page's side of that order: an issue
of the kind change is handed on as UC-012, whose step 6 puts it into the specification first, and the page itself commits nothing — no code, no queue, no job.
On a GitLab server the class of the issue is checked over a fake fetch, and Implement over a fake GitLab server that serves the project, the issue and GitLab's commit API.

**How a case reads.** `given` is its precondition. `input` holds the issues of the product `alice/product` (`issues`: the number and the labels of each),
the number of the page opened (`issue`), the person's steps in order (`implement`: the click on Implement), and the texts looked for in what the page put into
the prompt bar (`promptNeedles`). `expected` names only what the case asserts, out of: `labels` and `state` (the issue at the end), `issueWrites` (the writes made
to the issue), `committed` (every path committed to the product), `outsideDocs` (those of them that do not lie under `docs/`, which are code or tests), `jobKinds`
(the kind of each job record committed), `implementOffered` (whether the page offers Implement), `runPanels` (how many run panels the page shows), `prompts` (how
many prompts the page put into the prompt bar) and `promptHolds` (each needle: whether a prompt holds it). A case with `server` `gitlab` in its `input` runs the
product on the fake GitLab server (its `issues` hold the one issue) and may state `unserved` (the requests of the project's API the fake did not serve). The class
case on a GitLab server has `input` `issue` and `cls` (the class clicked) and `expected` `writes` (every request that is not a read, the project's path left out)
and `requests` (how many requests the server received).

## EVOLUTION ENTERS THROUGH THE SPECIFICATION - a change is handed to the conversation as UC-012, and the page commits nothing

### Implement on a change hands it on as UC-012 with its number and text, and commits nothing

```json
{
  "given": "The issue 7 of the product alice/product on GitHub is labelled change. The known positive: the page offers Implement and the click puts one prompt into the bar.",
  "input": {
    "issues": [{ "number": 7, "labels": ["change"] }],
    "issue": 7,
    "steps": [{ "implement": true }],
    "promptNeedles": ["UC-012", "issue #7", "FIRST RULE says nothing about page counts"]
  },
  "expected": {
    "implementOffered": true,
    "prompts": 1,
    "promptHolds": { "UC-012": true, "issue #7": true, "FIRST RULE says nothing about page counts": true },
    "committed": [],
    "jobKinds": [],
    "issueWrites": [],
    "state": "open",
    "runPanels": 0
  }
}
```

## EVOLUTION ENTERS THROUGH THE SPECIFICATION - a change on a GitLab server is handed to the conversation as UC-012, and the page commits nothing

### Implement on a change of a GitLab product hands it on as UC-012 with its number and text, and commits nothing

```json
{
  "given": "The product is on a GitLab server and its issue 7 is labelled change. The known positive: the page offers Implement and the click puts one prompt into the bar.",
  "input": {
    "server": "gitlab",
    "issues": [{ "number": 7, "labels": ["change"] }],
    "issue": 7,
    "steps": [{ "implement": true }],
    "promptNeedles": ["UC-012", "issue #7", "FIRST RULE says nothing about page counts"]
  },
  "expected": {
    "implementOffered": true,
    "prompts": 1,
    "promptHolds": { "UC-012": true, "issue #7": true, "FIRST RULE says nothing about page counts": true },
    "committed": [],
    "jobKinds": [],
    "issueWrites": [],
    "state": "open",
    "unserved": []
  }
}
```

## EVOLUTION ENTERS THROUGH THE SPECIFICATION - on a GitLab server

### The class change on a GitLab server is one edit of the issue's labels and nothing else

```json
{
  "given": "The product is on a GitLab server. The person clicks Change on its issue 7.",
  "input": {
    "issue": 7,
    "cls": "change"
  },
  "expected": {
    "writes": ["PUT /issues/7 {\"add_labels\":\"change\",\"remove_labels\":\"defect,not-reproducible\"}"],
    "requests": 1
  }
}
```
