// The ports one launch of the desktop shell's native Electron tests takes (tests/desktop-shell.test.mjs): the Bridge's, the browser's
// debugging port and the main process inspector's. They are chosen together: every server listens on port 0 and stays open until all
// the ports are read, so that the system gives no port twice. Chosen one after the other, each closed before the next is opened, two
// of them were once the same port. It is test code; it holds no expected result.
//
// Module: MOD-desktop-shell
// Level: unit

import { createServer } from "node:net";

const openOnLoopback = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => resolve({ port: server.address().port, close: () => new Promise((done) => server.close(done)) }));
});

// unusedPorts(count: number, open?: () => Promise<{ port: number, close: () => Promise<void> }>) -> Promise<number[]>
// `count` different ports no server holds now. Rejects with the error of an `open` that fails, after closing the servers already open.
export async function unusedPorts(count, open = openOnLoopback) {
  const opened = [];
  try {
    for (let n = 0; n < count; n += 1) opened.push(await open());
    return opened.map(({ port }) => port);
  } finally { await Promise.all(opened.map((each) => each.close())); }
}
