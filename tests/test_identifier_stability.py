# Module: MOD-identifiers
# Guards: THE NAME IS THE ID AND IT SURVIVES
# Level: unit
"""The check named tests/test_identifier_stability.py, for THE NAME IS THE ID AND IT SURVIVES: "An identifier travels with its
artifact when the artifact moves between sections or files, and a withdrawn identifier is never reused." Check: "an identifier
that the version history holds and the current files do not is never given to another artifact."

The cases live in tests/test_identifier_stability.md. This file only loads them and asks node to run the real code of
MOD-identifiers: identifiersIn reads the identifiers of the same text at two places, nextIdentifier gives the identifier of a new
artifact from what the version history holds. A withdrawn identifier stands in the history only - no current file carries a
withdrawal note (A DOCUMENT HOLDS NO HISTORY) -, and the counter-proofs show that the history is what keeps it from being given
again: left out of it, the same number or slug would be given.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
RULE = "THE NAME IS THE ID AND IT SURVIVES"


def cases(section: str, data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
    body = re.search(rf"^## {re.escape(section)}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not body:
        raise AssertionError(f"missing section {section}")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))}
             for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", body.group(1), re.M | re.S)]
    if not found:
        raise AssertionError(f"no cases under {section}")
    return found


def run(case_input: dict) -> dict:
    if case_input["check"] == "travels":
        return {"ids": js(f"const input = {json.dumps(case_input)};"
                          "return input.places.map((path) => identifiers.identifiersIn(path, input.text).map((place) => place.id));")}
    return js(f"const input = {json.dumps(case_input)};"
              "try { return { next: identifiers.nextIdentifier(input.kind, input.everUsed, input.slug) }; }"
              " catch (error) { return { refused: error.name }; }")


def check(test: unittest.TestCase, section: str) -> None:
    for loaded in cases(section):
        with test.subTest(case=loaded["name"]):
            got = run(loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got.get(key) for key in wanted}, wanted)


class IdentifierStability(unittest.TestCase):
    # TST-1201003 · level: unit · module: MOD-identifiers
    # guards: THE NAME IS THE ID AND IT SURVIVES
    # given: the cases under "An identifier travels with its artifact": a use case's text read from its file and from the file it was renamed to, a requirement's head read before and after it moved section
    # input: identifiersIn at each place
    # expect: the same identifiers at both places
    def test_an_identifier_travels_with_its_artifact(self):
        check(self, "An identifier travels with its artifact")

    # TST-1201004 · level: unit · module: MOD-identifiers
    # guards: THE NAME IS THE ID AND IT SURVIVES
    # given: the cases under "A withdrawn identifier is never reused": a history that holds a withdrawn use case and a withdrawn module, which no current file holds
    # input: nextIdentifier with that history
    # expect: the next use case gets the number after the withdrawn one; the withdrawn module's identifier is refused (IdentifierTaken)
    def test_an_identifier_the_history_holds_is_never_given_again(self):
        check(self, "A withdrawn identifier is never reused")

    # TST-1201005 · level: unit · module: MOD-identifiers
    # guards: THE NAME IS THE ID AND IT SURVIVES
    # given: the counter-proofs: the same histories without the withdrawn identifiers
    # input: nextIdentifier with them
    # expect: the withdrawn number and the withdrawn slug would then be given, so it is the history that keeps them
    def test_counter_proof_without_the_history_the_identifier_would_be_given(self):
        check(self, RULE + ": counter-proofs")


if __name__ == "__main__":
    unittest.main()
