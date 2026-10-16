// The wait that the desktop shell's native Electron tests share (tests/desktop-shell.test.mjs,
// tests/release-itm-276-desktop-shell.test.mjs): it tries a condition every 125 ms until the condition returns a truthy value,
// and ends at a deadline in time — whatever each try takes, since a try that has not answered by then is given up. At the
// deadline it throws "<name> did not hold within <limit> s" and the last error a try threw. It is test code; it holds no
// expected result.
//
// Module: MOD-desktop-shell
// Level: unit

const DEADLINE = Symbol("deadline");

// wait(name: string, condition: () => Promise<any> | any, fatal?: () => void, limitMs?: number = 30000) -> Promise<any>
// The truthy value `condition` returned. `fatal` runs before each try and ends the wait with its own error, as a process that
// has exited does. A try that throws is tried again; the last such error is named when the deadline comes.
export async function wait(name, condition, fatal = () => {}, limitMs = 30000) {
  const deadline = Date.now() + limitMs;
  let lastError;
  for (;;) {
    fatal();
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    let timer;
    try {
      const value = await Promise.race([condition(), new Promise((_, reject) => { timer = setTimeout(() => reject(DEADLINE), remaining); })]);
      if (value) return value;
    } catch (failure) {
      if (failure === DEADLINE) break;
      lastError = failure;
    } finally { clearTimeout(timer); }
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, Math.min(125, deadline - Date.now()))));
  }
  const last = lastError === undefined ? "no try threw an error" : `last error: ${lastError?.message ?? lastError}`;
  throw new Error(`${name} did not hold within ${limitMs / 1000} s; ${last}`, { cause: lastError });
}
