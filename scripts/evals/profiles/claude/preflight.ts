import { probeNativeCli, loadBlockedProfile } from '../probe-cli.ts';
export const preflightClaude = (binary = 'claude') =>
  probeNativeCli('claude-code', binary);
export const loadClaudeProfile = (filename: string) =>
  loadBlockedProfile('claude-code', filename);
