# Job Reading Checkout Cases

The cases use a temporary checkout of the Agent M instance. The checkout contains `docs/sources/SRC-vibe-coding.md`
and the registered chapter files of its newest version. The source-register chapter recipes are real; every other job
strategy that is not under test is a stand-in. The precondition for every case is that `context.instance.checkout` names
the temporary checkout and `context.instance.snapshot.commit` equals `context.agentM.commit`.

## each job kind receives checkout chapter paths

Input: prepare each listed job kind with MOD-source-register's real chapter recipes and a checkout of the instance.

Expected result: each SRC-vibe-coding part is the path of the chapter file in the checkout, not the chapter text, and the
file's SHA-256 equals the hash recorded in `docs/sources/SRC-vibe-coding.md`.

### Case

```json
{
  "input": {
    "corrupt": null,
    "work": {
      "requirements or use cases": {
        "kinds": ["derive-requirements", "change-requirements", "derive-use-cases", "change-use-case"],
        "chapters": [8]
      },
      "tests": {
        "kinds": ["propose-tests", "write-tests", "fix-bug"],
        "chapters": [13]
      },
      "the architecture": {
        "kinds": ["derive-architecture", "change-architecture", "review-architecture"],
        "chapters": [9, 10, 11, 12]
      },
      "implementation": {
        "kinds": ["implement"],
        "chapters": [9, 11, 12, 13]
      }
    }
  },
  "expected": {
    "ok": true
  }
}
```

## a changed checkout chapter is refused by name

Input: prepare `write-tests` with MOD-source-register's real chapter recipes and a checkout whose chapter 13 file has
bytes different from the hash recorded in `docs/sources/SRC-vibe-coding.md`.

Expected result: preparation fails before anything is sent, with `HashMismatch`, and names
`13_software-testing.md`.

### Case

```json
{
  "input": {
    "kind": "write-tests",
    "corrupt": "13_software-testing.md"
  },
  "expected": {
    "ok": false,
    "error": "HashMismatch",
    "file": "13_software-testing.md"
  }
}
```
