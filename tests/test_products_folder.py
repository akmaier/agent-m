"""SPEC §10 A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER — products/README.md is tracked;
a folder created under products/ is ignored by git."""
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True)


def ignored(path: str) -> bool:
    # --no-index: judge the ignore rules themselves, also for a path that is tracked.
    r = git("check-ignore", "-q", "--no-index", path)
    if r.returncode not in (0, 1):
        raise RuntimeError(r.stderr)
    return r.returncode == 0


class ProductsFolder(unittest.TestCase):
    def test_readme_is_tracked(self):
        self.assertEqual(git("ls-files", "--error-unmatch", "products/README.md").returncode, 0,
                         "products/README.md is not tracked")

    def test_readme_is_not_ignored(self):
        self.assertFalse(ignored("products/README.md"))

    def test_created_product_folder_is_ignored(self):
        folder = Path(tempfile.mkdtemp(prefix="some-product-", dir=ROOT / "products"))
        try:
            (folder / "x").write_text("x\n", encoding="utf-8")
            rel = folder.relative_to(ROOT).as_posix()
            self.assertTrue(ignored(f"{rel}/x"), f"{rel}/x is not ignored")
            self.assertTrue(ignored(f"{rel}/"), f"{rel}/ is not ignored")
            self.assertEqual(git("status", "--porcelain", "--untracked-files=all", "--", rel).stdout,
                             "", f"git status shows {rel}")
        finally:
            shutil.rmtree(folder)

    def test_counter_proof(self):
        # The check must say "not ignored" where nothing ignores the path.
        self.assertFalse(ignored("docs/some-product/x"))
        self.assertFalse(ignored("some-product/x"))
        self.assertTrue(ignored("__pycache__/x.pyc"), "check-ignore does not detect a known ignored path")


if __name__ == "__main__":
    unittest.main()
