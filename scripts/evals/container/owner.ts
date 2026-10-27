import { createServer } from 'node:net';
import type { Socket } from 'node:net';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { startContainerSession } from './session.ts';
import type { ContainerInput } from './session.ts';

/** One transient stdio broker. The caller lives outside the Codex process group. */
export async function createContainerOwner(
  input: ContainerInput,
  resultPaths = Object.keys(input.files),
) {
  const directory = await realpath(await mkdtemp('/tmp/tibicen-io-'));
  const socketPath = directory + '/stdio.sock',
    manifestPath = directory + '/manifest.json';
  const server = createServer();
  let peer: Socket | undefined;
  const session = await startContainerSession(input).catch(async (error) => {
    await rm(directory, { recursive: true, force: true });
    throw error;
  });
  const finished = session.finished.finally(async () => {
    peer?.destroy();
    if (server.listening)
      await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  });
  void finished.catch(() => {});
  const stop = (paths = resultPaths, reason = 'completed') => {
    void session.stop(paths, reason).catch(() => {});
    return finished;
  };
  server.on('connection', (socket) => {
    if (peer) {
      socket.destroy();
      return;
    }
    peer = socket;
    socket.on('end', () => {
      void stop(resultPaths, 'owner-end').catch(() => {});
    });
    socket.on('error', () => {
      void stop(resultPaths, 'owner-error').catch(() => {});
    });
    socket.pipe(session.child.stdin);
    session.child.stdout.pipe(socket);
  });
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(socketPath, () => {
        server.off('error', reject);
        resolve();
      });
    });
    await writeFile(manifestPath, JSON.stringify({ socketPath }) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
    return { manifestPath, session, finished, stop };
  } catch (error) {
    await stop([], 'owner-setup-error').catch(() => {});
    throw error;
  }
}
