import { probeNativeCli } from '../probe-cli.ts';
import path from 'node:path';
import os from 'node:os';
import { stat } from 'node:fs/promises';
export { loadZCodeProfile } from './profile.ts';

function unverified(probe: Awaited<ReturnType<typeof probeNativeCli>>) {
  return {
    ...probe,
    blockedBy: probe.cli.path
      ? [
          'zcode-subscription-startup-not-observed',
          'zcode-auth-read-boundary-unverified',
          'zcode-filesystem-write-boundary-unverified',
          'zcode-process-tree-cleanup-unverified',
        ]
      : ['native-cli-unavailable'],
  };
}

export async function preflightZCode(binary?: string) {
  const bundle = (entrypoint: string) =>
    probeNativeCli('zcode', process.execPath, {
      entrypoint,
      dataHomeVariable: 'ZCODE_DATA_BASE_DIR',
    }).then(unverified);
  if (binary)
    return binary.endsWith('.cjs')
      ? bundle(path.resolve(binary))
      : probeNativeCli('zcode', binary).then(unverified);
  const visible = unverified(await probeNativeCli('zcode', 'zcode'));
  if (visible.cli.path || process.platform !== 'darwin') return visible;
  for (const root of [
    '/Applications',
    path.join(os.homedir(), 'Applications'),
  ]) {
    const entry = path.join(root, 'ZCode.app/Contents/Resources/glm/zcode.cjs');
    if (
      (
        await stat(entry).catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        })
      )?.isFile()
    )
      return bundle(entry);
  }
  return visible;
}
