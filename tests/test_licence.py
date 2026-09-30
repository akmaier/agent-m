"""SPEC §0 AGENT M IS MIT-LICENSED — the root LICENSE is the MIT text."""
import unittest
from pathlib import Path

LICENSE = Path(__file__).resolve().parents[1] / "LICENSE"

COPYRIGHT = "Copyright (c) 2026 Andreas Maier"
# The characteristic sentences of the MIT licence (https://opensource.org/license/mit), whitespace-normalised.
MIT_SENTENCES = [
    "MIT License",
    "Permission is hereby granted, free of charge, to any person obtaining a copy of this software "
    "and associated documentation files (the \"Software\"), to deal in the Software without "
    "restriction, including without limitation the rights to use, copy, modify, merge, publish, "
    "distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the "
    "Software is furnished to do so, subject to the following conditions:",
    "The above copyright notice and this permission notice shall be included in all copies or "
    "substantial portions of the Software.",
    "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING "
    "BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND "
    "NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, "
    "DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, "
    "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
]


def licence_problems(text: str) -> list[str]:
    flat = " ".join(text.split())
    problems = [f"missing: {s[:50]}…" for s in MIT_SENTENCES if s not in flat]
    if COPYRIGHT not in text.splitlines():
        problems.append(f"missing line: {COPYRIGHT}")
    return problems


class Licence(unittest.TestCase):
    def test_root_licence_is_mit(self):
        self.assertTrue(LICENSE.is_file(), "no LICENSE at the repository root")
        self.assertEqual(licence_problems(LICENSE.read_text(encoding="utf-8")), [])

    def test_counter_proof(self):
        text = LICENSE.read_text(encoding="utf-8") if LICENSE.is_file() else ""
        self.assertTrue(licence_problems(text.replace("sublicense, ", "")), "altered grant not caught")
        self.assertTrue(licence_problems(text.replace("NONINFRINGEMENT", "INFRINGEMENT")),
                        "altered disclaimer not caught")
        self.assertTrue(licence_problems(text.replace(COPYRIGHT, "Copyright (c) 2026")),
                        "missing copyright holder not caught")
        self.assertTrue(licence_problems(""), "empty licence not caught")


if __name__ == "__main__":
    unittest.main()
