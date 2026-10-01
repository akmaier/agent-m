# Guards: A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY
# Level: unit
"""SPEC §10 A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER — products/README.md is tracked;
a folder created under products/ is ignored by git.

SPEC §10 NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY — the instance repository's committed files
contain no address of a product in the fixture list; counter-proof: a fixture that commits one fails.
The fixture list is FIXTURE_PRODUCTS below, plus the address of every product clone that a local
checkout holds under products/ (each clone knows its own address; in CI there is none). This file is
the one committed file allowed to carry the fixture addresses — they name no real product.
"""
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
THIS = Path(__file__).resolve().relative_to(ROOT).as_posix()

# Addresses of products an instance might manage — invented, so that naming them here names nothing.
FIXTURE_PRODUCTS = [
    "https://github.com/fixture-owner/fixture-product",
    "https://gitlab.example.org/fixture-group/sub/fixture-product",
]


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True)


def ignored(path: str) -> bool:
    # --no-index: judge the ignore rules themselves, also for a path that is tracked.
    r = git("check-ignore", "-q", "--no-index", path)
    if r.returncode not in (0, 1):
        raise RuntimeError(r.stderr)
    return r.returncode == 0


def address_forms(address: str) -> list[str]:
    """The ways an address appears in a file: host/path (https, plain) and host:path (ssh remote)."""
    m = re.match(r"^(?:https?://|ssh://)?(?:[^@/]+@)?([^/:]+)[/:](.+?)(?:\.git)?/?$", address.strip())
    if not m:
        return [address]
    host, path = m.group(1).lower(), m.group(2)
    return [f"{host}/{path}", f"{host}:{path}"]


def local_clone_addresses(root: Path) -> list[str]:
    out = []
    folder = root / "products"
    for d in sorted(folder.iterdir()) if folder.is_dir() else []:
        if (d / ".git").exists():
            r = subprocess.run(["git", "-C", str(d), "remote", "get-url", "origin"], capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.strip():
                out.append(r.stdout.strip())
    return out


def named_products(root: Path, addresses: list[str], skip: tuple[str, ...] = ()) -> list[str]:
    """Every (committed file, address) where a committed file of `root` names a product address."""
    files = subprocess.run(["git", "-C", str(root), "ls-files", "-z"], capture_output=True, text=True,
                           check=True).stdout.split("\0")
    forms = {a: [f.lower() for f in address_forms(a)] for a in addresses}
    hits = []
    for f in filter(None, files):
        if f in skip or not (root / f).is_file():
            continue
        text = (root / f).read_bytes().decode("utf-8", errors="ignore").lower()
        hits += [f"{f}: {a}" for a, fs in forms.items() if any(x in text for x in fs)]
    return hits


class NoProductNamed(unittest.TestCase):
    def test_instance_repository_names_no_product(self):
        addresses = FIXTURE_PRODUCTS + local_clone_addresses(ROOT)
        self.assertEqual(named_products(ROOT, addresses, skip=(THIS,)), [])

    def test_counter_proof_a_fixture_that_commits_one_fails(self):
        with tempfile.TemporaryDirectory() as d:
            repo = Path(d)
            run = lambda *a: subprocess.run(["git", "-C", d, *a], capture_output=True, text=True, check=True)
            run("init", "-q")
            (repo / "README.md").write_text("# Instance\n", encoding="utf-8")
            (repo / "notes.md").write_text("see Fixture-Product at gitlab.example.org/fixture-group/sub/fixture-product\n",
                                           encoding="utf-8")
            (repo / "config").write_text("url = git@github.com:fixture-owner/fixture-product.git\n", encoding="utf-8")
            (repo / "untracked.md").write_text(FIXTURE_PRODUCTS[0] + "\n", encoding="utf-8")
            run("add", "README.md", "notes.md", "config")
            self.assertEqual(named_products(repo, FIXTURE_PRODUCTS),
                             ["config: https://github.com/fixture-owner/fixture-product",
                              "notes.md: https://gitlab.example.org/fixture-group/sub/fixture-product"])
            # The same check on a repository that commits no address finds nothing.
            run("rm", "-q", "--cached", "notes.md", "config")
            self.assertEqual(named_products(repo, FIXTURE_PRODUCTS), [])

    def test_address_forms(self):
        self.assertEqual(address_forms("git@gitlab.example.org:g/sub/p.git"),
                         ["gitlab.example.org/g/sub/p", "gitlab.example.org:g/sub/p"])
        self.assertEqual(address_forms("https://github.com/o/n/"), ["github.com/o/n", "github.com:o/n"])


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
