import { assert } from '../../core/contracts.ts';
import { loadCodexProfile } from './codex/profile.ts';
import { loadZCodeProfile } from './zcode/preflight.ts';
import { loadClaudeProfile } from './claude/preflight.ts';

export const firstWaveProfiles = ['codex', 'claude-code', 'zcode'] as const;
export type NativeProfileId = (typeof firstWaveProfiles)[number];
export function loadNativeProfile(id: NativeProfileId, filename: string) {
  assert(
    firstWaveProfiles.includes(id),
    'invalid-native-profile',
    'Choose a first-wave native profile explicitly.',
  );
  return id === 'codex'
    ? loadCodexProfile(filename)
    : id === 'zcode'
      ? loadZCodeProfile(filename)
      : loadClaudeProfile(filename);
}
