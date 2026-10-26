# Module: MOD-test-schedule
# Level: unit
"""The Python suite's part of Agent M's own test command (tests/test-schedule-command.mjs): runs the Python test files it is
given with unittest, as `cd tests && python3 -m unittest -v <modules>` runs them, and writes their outcomes as a JUnit XML
report.

    python3 tests/test-schedule-command.d/unittest_junit.py <report> tests/test_a.py tests/test_b.py ...

Every file lies directly in tests/: the run takes tests/ as its working folder and imports each file as a module of that
name. Each test case is one <testcase> named by its method, its classname the module and the class; a failure is
<failure>, an error — a module that cannot be imported included — <error>, a skipped case <skipped>. Ends with 1 when a
case failed or raised an error, else 0.
"""
import os
import sys
import time
import unittest
from xml.sax.saxutils import quoteattr, escape


class Recorded(unittest.TextTestResult):
    """A text result that also keeps each case's outcome and time."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cases = []
        self._started = 0.0

    def startTest(self, test):
        self._started = time.monotonic()
        super().startTest(test)

    def _keep(self, test, kind, detail=""):
        self.cases.append((test, kind, detail, time.monotonic() - self._started))

    def addSuccess(self, test):
        super().addSuccess(test)
        self._keep(test, "passed")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self._keep(test, "failure", self._exc_info_to_string(err, test))

    def addError(self, test, err):
        super().addError(test, err)
        self._keep(test, "error", self._exc_info_to_string(err, test))

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self._keep(test, "skipped", reason)

    def addExpectedFailure(self, test, err):
        super().addExpectedFailure(test, err)
        self._keep(test, "passed")

    def addUnexpectedSuccess(self, test):
        super().addUnexpectedSuccess(test)
        self._keep(test, "failure", "unexpected success")


def testcase(test, kind, detail, seconds):
    """One <testcase> element of the report."""
    ident = test.id()
    classname, _, name = ident.rpartition(".")
    head = f"<testcase name={quoteattr(name)} classname={quoteattr(classname)} time=\"{seconds:.6f}\""
    if kind == "passed":
        return head + "/>"
    if kind == "skipped":
        return head + f"><skipped message={quoteattr(detail)}/></testcase>"
    message = detail.strip().splitlines()[-1] if detail.strip() else kind
    return head + f"><{kind} message={quoteattr(message)}>{escape(detail)}</{kind}></testcase>"


def main(argv):
    report, files = os.path.abspath(argv[1]), argv[2:]
    folder = os.path.dirname(os.path.abspath(files[0])) if files else os.getcwd()
    os.chdir(folder)
    sys.path.insert(0, folder)
    names = [os.path.splitext(os.path.basename(f))[0] for f in files]
    suite = unittest.defaultTestLoader.loadTestsFromNames(names)
    result = unittest.TextTestRunner(verbosity=2, resultclass=Recorded).run(suite)
    failed = sum(1 for case in result.cases if case[1] == "failure")
    errors = sum(1 for case in result.cases if case[1] == "error")
    skipped = sum(1 for case in result.cases if case[1] == "skipped")
    with open(report, "w", encoding="utf-8") as out:
        out.write(f"<testsuite name=\"python\" tests=\"{len(result.cases)}\" failures=\"{failed}\" errors=\"{errors}\" "
                  f"skipped=\"{skipped}\">\n")
        out.write("\n".join(testcase(*case) for case in result.cases))
        out.write("\n</testsuite>\n")
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
