# Module: none — the test runner's own names (tests/jsrun.py)
# Guards: A MODULE IS A FOLDER
# Level: unit
"""The names by which tests/jsrun.py reaches a module file.

A file in a folder of src/ that holds an index.mjs — the folder of a module of the architecture — is reached by the
folder's name in camelCase, and every other file of that folder by the folder's name followed by its own; every other
file keeps the name of its file, as before. So the index.mjs of every module and a part named like an alias (`store`)
are reached without two files sharing a name.
"""
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import jsrun


def tree(root: Path, files: list[str]):
    for f in files:
        p = root / f
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text("export const x = 1;\n")


class ModuleFolderNames(unittest.TestCase):
    def names(self, files):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            tree(root, files)
            with mock.patch.object(jsrun, "ASSETS", root / "docs" / "assets"), mock.patch.object(jsrun, "SRC", root / "src"):
                return {n: p.relative_to(root).as_posix() for n, p in jsrun.module_files().items() if n not in jsrun.ALIASES}

    def test_every_module_folder_has_its_index_and_its_parts_by_the_folder_name(self):
        # Expected: two module folders, each with an index.mjs, and a part named like the alias `store`.
        got = self.names(["docs/assets/git-host.mjs", "src/repository-hosts/index.mjs", "src/repository-hosts/github.mjs",
                          "src/browser-store/index.mjs", "src/browser-store/store.mjs"])
        self.assertEqual(got, {"gitHost": "docs/assets/git-host.mjs",
                               "repositoryHosts": "src/repository-hosts/index.mjs",
                               "repositoryHostsGithub": "src/repository-hosts/github.mjs",
                               "browserStore": "src/browser-store/index.mjs",
                               "browserStoreStore": "src/browser-store/store.mjs"})

    def test_a_folder_without_an_index_keeps_the_names_of_its_files(self):
        # Expected: the folders of today (src/home, src/site) keep `home`, `cards`, `instanceRepository`.
        got = self.names(["src/home/home.mjs", "src/home/cards.mjs", "src/site/instance-repository.mjs"])
        self.assertEqual(got, {"home": "src/home/home.mjs", "cards": "src/home/cards.mjs",
                               "instanceRepository": "src/site/instance-repository.mjs"})

    def test_two_files_that_would_share_a_name_are_still_refused(self):
        # Expected: two plain files of the same name in folders without an index.mjs are still refused.
        with self.assertRaises(AssertionError):
            self.names(["src/home/menu.mjs", "src/site/menu.mjs"])


if __name__ == "__main__":
    unittest.main()
