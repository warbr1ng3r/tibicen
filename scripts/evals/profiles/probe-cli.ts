import path from 'node:path';
import os from 'node:os';
import { constants } from 'node:fs';
import { access, mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import { assert, digest, hashContent } from '../../core/contracts.ts';
import { validatePreflight } from '../contracts.ts';
import {
  nativeContainmentPreflight,
  nativeContainmentReason,
} from '../node-check-containment.ts';
import { createProcessSupervisor } from '../process-supervisor.ts';
import type { NativeProfile } from './contracts.ts';

// Discovery only. No login commands, personal HOME, prompt, install, provider or model request.
export async function probeNativeCli(
  agent: 'zcode' | 'claude-code',
  binary: string,
  options: { entrypoint?: string; dataHomeVariable?: string } = {},
) {
  let { entrypoint } = options;
  if (entrypoint) {
    assert(
      path.isAbsolute(entrypoint),
      'invalid-native-cli',
      'Use an absolute bundled entrypoint.',
    );
    entrypoint = await realpath(entrypoint);
  }
  assert(
    !options.dataHomeVariable ||
      (/^[A-Z][A-Z0-9_]+$/.test(options.dataHomeVariable) &&
        !['PATH', 'HOME', 'TMPDIR'].includes(options.dataHomeVariable)),
    'invalid-native-cli',
    'Use a distinct data-home environment name.',
  );
  let executable: string | null = null;
  for (const candidate of path.isAbsolute(binary)
    ? [binary]
    : (process.env.PATH ?? '')
        .split(path.delimiter)
        .filter(Boolean)
        .map((root) => path.join(root, binary))) {
    if (
      await access(candidate, constants.X_OK).then(
        () => true,
        () => false,
      )
    ) {
      executable = await realpath(candidate);
      break;
    }
  }
  let version = 'unavailable',
    helpHash: string | null = null;
  if (executable) {
    const scope = await mkdtemp(
      path.join(os.tmpdir(), 'tibicen-native-cli-probe-'),
    );
    const supervisor = createProcessSupervisor();
    try {
      for (const flag of ['--version', '--help']) {
        assert(
          !supervisor.signal.aborted,
          'native-preflight-aborted',
          'Preflight cancelled.',
        );
        const result = await supervisor.run({
          executable,
          argv: [...(entrypoint ? [entrypoint] : []), flag],
          cwd: scope,
          env: {
            PATH: process.env.PATH,
            HOME: scope,
            TMPDIR: scope,
            ...(options.dataHomeVariable
              ? { [options.dataHomeVariable]: scope }
              : {}),
          },
          timeoutMs: 3000,
          stdoutLimit: 65536,
        });
        const output = result.status === 0 ? result.stdout : '';
        assert(
          !supervisor.signal.aborted,
          'native-preflight-aborted',
          'Preflight cancelled.',
        );
        if (flag === '--version')
          version =
            output
              .trim()
              .split('\n')[0]
              .replace(/[^\w .:+-]/g, '')
              .slice(0, 120) || 'unavailable';
        else helpHash = hashContent(output);
      }
    } finally {
      supervisor.dispose();
      await rm(scope, { recursive: true, force: true });
    }
  }
  const entry = entrypoint
    ? { path: entrypoint, hash: hashContent(await readFile(entrypoint)) }
    : undefined;
  const reason = !executable
    ? 'native-cli-unavailable'
    : version === 'unavailable'
      ? 'native-cli-version-unverified'
      : nativeContainmentReason;
  return {
    schema: 1,
    profile: agent,
    cli: {
      path: executable,
      version,
      binaryHash: executable ? hashContent(await readFile(executable)) : null,
      helpHash,
      ...(entry ? { entrypoint: entry } : {}),
    },
    candidateModel: 'unavailable',
    authRoute: 'unverified',
    modelRequests: 0,
    preflight: {
      status: 'blocked' as const,
      startupControlled: false,
      authProtected: false,
      processTreeControlled: false,
      isolation: 'controlled' as const,
      reason,
    },
    startupHash: digest({
      agent,
      version,
      helpHash,
      ...(entry ? { entrypoint: entry } : {}),
      ...(options.dataHomeVariable
        ? { dataHomeVariable: options.dataHomeVariable }
        : {}),
    }),
    permissionsHash: digest({ agent, reason }),
    note: 'Trusted CLI discovery only; process groups do not contain detached descendants. CLI visibility/version/help only. Subscription startup, authorization boundary, tool observations and process isolation have not been verified.',
  };
}

export async function loadBlockedProfile(
  agent: 'zcode' | 'claude-code',
  filename: string,
): Promise<NativeProfile> {
  const probe = JSON.parse(await readFile(filename, 'utf8'));
  validatePreflight(probe.preflight);
  const preflight = nativeContainmentPreflight();
  assert(
    probe.profile === agent,
    'native-profile-unverified',
    'This profile has no verified native execution route yet.',
  );
  return {
    state: 'blocked',
    preflight,
    specification: {
      id: agent + '-blocked',
      agent,
      version: probe.cli.version.replace(/[^\w.:-]/g, '-') || 'unavailable',
      model: 'unavailable',
      auth: 'none',
      paid: false,
      startupHash: probe.startupHash,
      permissionsHash: probe.permissionsHash,
    },
  };
}
