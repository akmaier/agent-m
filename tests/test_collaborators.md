# Collaborators Release Cases

## A name that is neither an account nor listed is reported

### Case

```json
{
  "given": "A collaborators file that lists only Ada Example, no accounts on the server, and a generated artifact UC-900 whose line 3 names Bob Sample.",
  "input": {
    "collaborators": "# Collaborators\n\n| Name | Account | Agreed |\n|---|---|---|\n| Ada Example | ada-example | yes |\n",
    "accounts": [],
    "names": [
      "Bob Sample"
    ],
    "artifact": "UC-900",
    "text": "# Report\n\nThe fix was proposed by Bob Sample.\n"
  },
  "expected": {
    "findings": [
      {
        "artifact": "UC-900",
        "line": 3,
        "kind": "error",
        "rule": "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT"
      }
    ]
  }
}
```

## A listed collaborator's name passes

### Case

```json
{
  "given": "The same collaborators file and artifact, but line 3 names Ada Example, who is listed as agreed.",
  "input": {
    "collaborators": "# Collaborators\n\n| Name | Account | Agreed |\n|---|---|---|\n| Ada Example | ada-example | yes |\n",
    "accounts": [],
    "names": [
      "Ada Example"
    ],
    "artifact": "UC-900",
    "text": "# Report\n\nThe fix was proposed by Ada Example.\n"
  },
  "expected": {
    "findings": []
  }
}
```

## A name that is an account on the server passes

### Case

```json
{
  "given": "No collaborators file, the account bob-sample on the server, and an artifact whose line 3 names bob-sample.",
  "input": {
    "collaborators": null,
    "accounts": [
      "bob-sample"
    ],
    "names": [
      "bob-sample"
    ],
    "artifact": "UC-900",
    "text": "# Report\n\nThe fix was proposed by bob-sample.\n"
  },
  "expected": {
    "findings": []
  }
}
```
