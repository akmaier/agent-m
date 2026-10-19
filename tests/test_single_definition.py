# Module: MOD-job-catalogue
# Guards: ONE DEFINITION, THREE DRIVERS; THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
# Level: system
"""SPEC sections 6 and 14 - the check named tests/test_single_definition.py, for the two requirements that say the prompts, schemas and job definitions exist once.

The cases live in tests/test_single_definition.md, one section per requirement. This file only loads them and carries them out on the repository's files: it reads the
tree as the drivers see it (src/ and docs/assets/, the folders of the modules the browser, the workflow and the Bridge run), takes the prompts (`prompt.md`), the schemas
(`*.schema.md` and each kind's `answer.schema.json`) and the job definitions (`kind.md`, listed in `kinds.md`), and looks for their text anywhere else. A case's `plant`
puts a copy into an in-memory overlay of the tree - never into a file - which is the counter-proof of the check itself. The one question that needs the Bridge build's own function,
the files electron-builder is given, is asked of node through tests/jsrun.py.

Written for ITM-1133 by a participant who built neither the one definition (MOD-job-catalogue) nor the Bridge's build (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import base64
import json
import posixpath
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]
CODE = (".mjs", ".cjs", ".js", ".html", ".yml", ".css")
TEXT = (*CODE, ".md", ".json", ".txt")
CATALOGUE = "src/job-catalogue"


def tree(roots: list[str], plant: list[dict] | None = None) -> dict[str, str]:
    """{ path: text } of every text file below the roots, vendored and installed packages left out, with the case's planted copies laid over it."""
    found = {}
    for base in roots:
        for path in sorted((ROOT / base).rglob("*")):
            relative = path.relative_to(ROOT).as_posix()
            if path.is_file() and path.suffix in TEXT and "node_modules" not in relative and "/vendor/" not in relative:
                found[relative] = path.read_text(encoding="utf-8", errors="ignore")
    for each in plant or []:
        if "copyOf" in each:
            source = units_of(found[each["copyOf"]["file"]], each["copyOf"]["file"], each["minLength"])[each["copyOf"]["unit"]]
            found[each["path"]] = found.get(each["path"], "") + "\n" + source + "\n"
        elif "replaceWith" in each:
            for path in [each["path"]] if "pathsBelow" not in each else [path for path in found if path.startswith(each["pathsBelow"]) and path.endswith(".mjs")]:
                found[path] = each["replaceWith"]
        elif "copyFile" in each:
            found[each["path"]] = found[each["copyFile"]]
        else:
            found[each["path"]] = found.get(each["path"], "") + each["append"]
    return found


def is_prompt(path: str) -> bool:
    return path.endswith("/prompt.md")


def is_schema(path: str) -> bool:
    return path.endswith(".schema.md") or path.endswith("/answer.schema.json")


def subtrees(value):
    """Every part of a JSON schema, as the compact text it is written in: the whole and each value below it."""
    yield json.dumps(value, separators=(",", ":"), ensure_ascii=False)
    for each in (value.values() if isinstance(value, dict) else value if isinstance(value, list) else []):
        yield from subtrees(each)


def occurs(piece: str, text: str, source: str) -> bool:
    """Whether the piece stands in the text; a part of a JSON schema is looked for with the white space of both taken away, since a copy may be laid out otherwise."""
    return re.sub(r"\s+", "", piece) in re.sub(r"\s+", "", text) if source.endswith(".json") else piece in text


def units_of(text: str, path: str, minimum: int) -> list[str]:
    """The pieces of text a prompt or a schema is made of: its lines of at least `minimum` characters that say something (a heading, a table rule, a fence, a brace or a bare key is not text); for a JSON schema, its parts - the whole and each value below it - of that length, in compact form."""
    if path.endswith(".json"):
        try:
            return sorted({each for each in subtrees(json.loads(text)) if len(each) >= minimum}, key=lambda each: (-len(each), each))
        except ValueError:
            return []
    found = []
    for line in text.split("\n"):
        piece = re.sub(r"^\s*(?:[-*>]|\d+\.)\s*", "", line).strip()
        if len(piece) >= minimum and not piece.startswith(("#", "|---", "```", "{", "}", "[", "]", '"')):
            found.append(piece)
    return found


def definition_files(files: dict[str, str]) -> list[str]:
    return sorted(path for path in files if is_prompt(path) or is_schema(path))


class Index:
    """The texts of some files joined, once as they are and once with their white space taken away, so that a piece is looked for in all of them in one search; a hit is then placed in its file."""

    def __init__(self, files: dict[str, str]):
        self.files = files
        self.plain = "\n\u0000\n".join(files.values())
        self.bare = re.sub(r"\s+", "", self.plain)

    def count(self, piece: str, source: str) -> int:
        return self.bare.count(re.sub(r"\s+", "", piece)) if source.endswith(".json") else self.plain.count(piece)

    def where(self, piece: str, source: str) -> list[str]:
        return [path for path, text in self.files.items() if occurs(piece, text, source)] if self.count(piece, source) else []


def in_code(case: dict) -> dict:
    files = tree(case["roots"], case.get("plant"))
    sources = definition_files(files)
    code = Index({path: text for path, text in files.items() if path.endswith(CODE)})
    found = sorted({f"{source} -> {path}" for source in sources for piece in units_of(files[source], source, case["minLength"]) for path in code.where(piece, source)})
    # The known positive of "found: none": the definition files do hold text of that length, so that nothing found is not nothing looked at.
    looked_at = sum(len(units_of(files[source], source, case["minLength"])) for source in sources)
    return {"found": found, "foundHas": {each: each in found for each in case.get("expectHas", [])}, "textsLookedAt": looked_at > 300, "definitionFiles": len(sources) > 80}


def in_more_than_one_place(case: dict) -> dict:
    files = tree(case["roots"], case.get("plant"))
    everything = Index(files)
    out = {"prompt": [], "schema": []}
    for source in definition_files(files):
        own = occurs_count(files[source], source)
        for piece in units_of(files[source], source, case["minLength"]):
            if everything.count(piece, source) > own(piece):
                out["prompt" if is_prompt(source) else "schema"].append(piece[:60])
    return {key: sorted(set(value)) for key, value in out.items()}


def occurs_count(text: str, source: str):
    bare = re.sub(r"\s+", "", text)
    return (lambda piece: bare.count(re.sub(r"\s+", "", piece))) if source.endswith(".json") else (lambda piece: text.count(piece))


def definitions(case: dict) -> dict:
    files = tree(case["roots"], case.get("plant"))
    folders = sorted(path.split("/")[3] for path in files if re.fullmatch(rf"{CATALOGUE}/kinds/[^/]+/kind\.md", path))
    listed = re.findall(r"^\| ([a-z-]+) \| kinds/[a-z-]+ \|$", files[f"{CATALOGUE}/kinds.md"], re.M)
    named = [re.search(r"^name: (\S+)", files[f"{CATALOGUE}/kinds/{folder}/kind.md"], re.M).group(1) for folder in folders]
    signature = lambda text: text.startswith("---") and all(re.search(rf"^{key}:", text.split("---")[1], re.M) for key in ("name", "participant", "limit", "recipes"))
    elsewhere = sorted(path for path, text in files.items() if path.endswith(".md") and not re.fullmatch(rf"{CATALOGUE}/kinds/[^/]+/kind\.md", path) and signature(text))
    return {"kinds": len(folders), "listedOnce": sorted(listed) == folders and len(set(listed)) == len(listed), "namedLikeItsFolder": named == folders,
            "duplicates": sorted({kind for kind in listed if listed.count(kind) > 1}), "elsewhere": elsewhere}


def reached(entry: str, files: dict[str, str]) -> set[str]:
    """The folders of src/ that the entry reaches through relative imports, each module folder with all its files, as MOD-bridge-build's build stages them."""
    seen, folders, queue = set(), set(), [entry]
    pattern = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["'](\.{1,2}/[^"']+)["']""")
    while queue:
        path = queue.pop()
        if path in seen or path not in files:
            continue
        seen.add(path)
        parts = path.split("/")
        if parts[0] == "src" and len(parts) > 2 and parts[1] not in folders:
            folders.add(parts[1])
            queue.extend(each for each in files if each.startswith(f"src/{parts[1]}/") and each.endswith((".mjs", ".cjs", ".js")))
        for match in pattern.finditer(files[path]):
            queue.append(posixpath.normpath(posixpath.join(posixpath.dirname(path), match.group(1))))
    return folders


def bridge_reach(case: dict) -> dict:
    files = tree(["src"], case.get("plant"))
    bridge, dashboard = reached(case["bridge"], files), reached(case["dashboard"], files)
    return {"missingFromTheBridge": sorted(set(case["shared"]) - bridge), "missingFromTheDashboard": sorted(set(case["shared"]) - dashboard)}


def build_files(case: dict) -> dict:
    """The files electron-builder is given by MOD-bridge-build's own function, for the module folders the Bridge's entry reaches, less the folders a case leaves out."""
    files = tree(["src"])
    folders = sorted(reached(case["bridge"], files) - set(case.get("without", [])))
    encoded = base64.b64encode(json.dumps(folders).encode()).decode()  # not in the expression's words: js() imports every module the expression names
    config = js(f"const config = bridgeBuildBuilder.builderConfig(desktopShell.appDescription, {{ platform: 'linux', version: '2026.10.0', appId: 'io.github.a.b.bridge', owner: 'a', repository: 'b', folders: JSON.parse(atob('{encoded}')), resources: 'r', output: 'o' }}); return config.files;")
    held = [path for path in files if path.startswith(f"{CATALOGUE}/") and not path.endswith(".mjs")]
    return {"carried": [folder for folder in case["carries"] if f"src/{folder}/**/*" in config],
            "kindsAreData": len(held) > 0 and f"src/job-catalogue/**/*" in config,
            "copiesOfTheCatalogue": sorted(path for path in files if "/kinds/" in path and not path.startswith(f"{CATALOGUE}/")),
            "carriedFolders": len(folders) > 0}


RUN = {"in-code": in_code, "more-than-once": in_more_than_one_place, "definitions": definitions, "bridge-reach": bridge_reach, "build-files": build_files}


def cases(section: str, data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
    body = re.search(rf"^## {re.escape(section)}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not body:
        raise AssertionError(f"missing section {section}")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))} for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", body.group(1), re.M | re.S)]
    if not found:
        raise AssertionError(f"no cases under {section}")
    return found


def check(test: unittest.TestCase, section: str, only: str | None = None) -> None:
    for loaded in cases(section):
        if only and loaded["case"]["input"]["kind"] != only:
            continue
        with test.subTest(case=loaded["name"]):
            got = RUN[loaded["case"]["input"]["kind"]](loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got.get(key) for key in wanted}, wanted)


ONE = "ONE DEFINITION, THREE DRIVERS"
BUILT = "THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE"


class TestSingleDefinition(unittest.TestCase):
    # TST-1133001 · level: system · module: MOD-job-catalogue
    # guards: ONE DEFINITION, THREE DRIVERS
    # given: the files of src/ and docs/assets/, which the browser, the GitHub Actions workflow and the Bridge run; the prompts, the schemas and the job definitions of the catalogue
    # input: the text of every prompt and every schema (its lines and its strings of 50 characters or more) looked for in every code file of the drivers; and the same with a sentence of a prompt and a string of a schema copied into a code file
    # expect: no prompt or schema text stands in a code file; with a copy planted in the workflow template or the dashboard's code, the check names source and file
    def test_no_prompt_or_schema_text_is_in_a_driver(self):
        check(self, ONE, "in-code")

    # TST-1133002 · level: system · module: MOD-job-catalogue
    # guards: THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
    # given: the job definitions of the catalogue, one kind.md in the folder of each kind, listed in kinds.md
    # input: the kinds counted, listed and named; every other markdown file of src/ and docs/assets/ read for the front matter of a job definition; and the same with a kind listed twice and a kind.md copied into the Bridge's folder
    # expect: each kind has one folder, one row and its own name, and no job definition stands elsewhere; the listed twice and the copy are named
    def test_no_job_definition_exists_twice(self):
        check(self, BUILT, "definitions")

    # TST-1133003 · level: system · module: MOD-job-catalogue
    # guards: THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
    # given: the Bridge's entry, src/desktop-shell/main.mjs, and the dashboard's, src/site-frame/dashboard-app.mjs
    # input: the module folders each reaches through relative imports; and, as the counter-proof, the Bridge's entry with its imports taken out
    # expect: both reach the folders that hold the job definitions and run the jobs (job-catalogue, job-runner, runtimes, documents, site-frame); with the imports taken out the Bridge reaches none of them
    def test_the_bridge_imports_the_dashboards_modules(self):
        check(self, BUILT, "bridge-reach")

    # TST-1133004 · level: system · module: MOD-bridge-build
    # guards: THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
    # given: MOD-bridge-build's electron-builder configuration for the module folders the Bridge's entry reaches
    # input: the files it is given; and, as the counter-proof, the same with the job catalogue left out of the folders
    # expect: the build carries src/job-catalogue/ with its data files and the other dashboard folders, from src/ and not from a copy; with the catalogue left out the configuration does not carry it
    def test_the_build_carries_the_dashboards_modules_and_job_definitions(self):
        check(self, BUILT, "build-files")

    # TST-1133005 · level: system · module: MOD-job-catalogue
    # guards: ONE DEFINITION, THREE DRIVERS
    # given: the prompts and schemas of the catalogue and of the modules
    # input: every line of 50 characters or more of a prompt or schema, looked for in every other file of src/ and docs/assets/
    # expect: no prompt or schema text appears in more than one place
    # FINDING S1: sentences that several prompts share, and sentences that several schema files share, stand in more than one file (the lists are in the pull request). The SPEC's sentence read
    # as worded names them; whether the sentence means only the copies the drivers would keep (TST-1133001 passes) is the Product Owner's to say.
    @unittest.expectedFailure
    def test_no_prompt_or_schema_text_appears_in_more_than_one_place(self):
        check(self, ONE, "more-than-once")


if __name__ == "__main__":
    unittest.main()
