import path from 'node:path';
import { constants } from 'node:fs';
import {
  chmod,
  copyFile,
  lstat,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { assert, hashContent } from '../../core/contracts.ts';

export const linuxCodeModeHost =
  '/opt/codex/vendor/aarch64-unknown-linux-musl/bin/codex-code-mode-host';
export const linuxCodeModeHash =
  '26b7859408482fe16000f9fd1161c975ccf21f79a2b4aba786e8dfbed2053309';

/** CLI resolves its companion beside the real executable, so a symlink will not work. */
export async function stageContainerCodeMode(
  binary: string,
  binaryHash: string,
  cid: string,
) {
  assert(
    /^[a-f0-9]{64}$/.test(cid) && /^[a-f0-9]{64}$/.test(binaryHash),
    'invalid-container-code-mode',
    'Use an owned CID and frozen executable hash.',
  );
  assert(
    (await lstat(binary)).isFile() &&
      hashContent(await readFile(binary)) === binaryHash,
    'invalid-container-code-mode',
    'Host executable changed.',
  );
  const directory = await realpath(await mkdtemp('/tmp/tibicen-code-mode-'));
  const executable = path.join(directory, 'codex');
  const wrapper = path.join(directory, 'codex-code-mode-host');
  const contents =
    '#!/bin/sh\nexec /usr/bin/env -i PATH=/usr/bin:/bin DOCKER_HOST=unix:///var/run/docker.sock DOCKER_CONFIG=/nonexistent-tibicen-config /usr/local/bin/docker exec --interactive --user 1000:1000 --workdir /tmp ' +
    cid +
    ' /usr/bin/env -i HOME=/home/runner CODEX_HOME=/home/runner/.codex TMPDIR=/tmp PATH=/usr/local/bin:/usr/bin:/bin LANG=C.UTF-8 ' +
    linuxCodeModeHost +
    '\n';
  async function validate() {
    assert(
      (await realpath(directory)) === directory,
      'invalid-container-code-mode',
      'Staged executable directory changed.',
    );
    for (const [filename, hash] of [
      [executable, binaryHash],
      [wrapper, hashContent(contents)],
    ]) {
      const stat = await lstat(filename);
      assert(
        stat.isFile() &&
          (stat.mode & 0o777) === 0o500 &&
          hashContent(await readFile(filename)) === hash,
        'invalid-container-code-mode',
        'Staged executable or wrapper changed.',
      );
    }
  }
  try {
    await copyFile(binary, executable, constants.COPYFILE_EXCL);
    await chmod(executable, 0o500);
    await writeFile(wrapper, contents, { flag: 'wx', mode: 0o500 });
    await validate();
    return {
      executable,
      wrapper,
      wrapperHash: hashContent(contents),
      validate,
      dispose: () => rm(directory, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}
