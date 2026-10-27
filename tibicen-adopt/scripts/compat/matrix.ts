// Sources and the distinction between CLI inspection and a live probe are in agent-matrix.md.
export const CHECKED_AT = '2026-10-21';
export const AGENT_MATRIX = Object.freeze({
  'claude-code': {
    inspectedVersion: '2.1.283',
    skillDirectories: ['.claude/skills'],
    entrypoints: ['CLAUDE.md'],
    mcpPath: '.mcp.json',
    behavior: 'conditional',
    auth: 'existing-explicit-api-key',
    sources: [
      'https://code.claude.com/docs/en/headless',
      'https://code.claude.com/docs/en/skills',
      'https://code.claude.com/docs/en/cli-reference',
    ],
  },
  codex: {
    inspectedVersion: '0.157.0',
    skillDirectories: ['.agents/skills'],
    entrypoints: ['AGENTS.md'],
    mcpPath: '~/.codex/config.toml',
    behavior: 'unsupported-in-v1',
    auth: 'unverified',
    sources: [
      'https://developers.openai.com/codex/skills',
      'https://developers.openai.com/codex/mcp',
    ],
  },
  cursor: {
    inspectedVersion: null,
    skillDirectories: ['.cursor/skills', '.agents/skills'],
    entrypoints: ['AGENTS.md'],
    mcpPath: '.cursor/mcp.json',
    behavior: 'unsupported-in-v1',
    auth: 'unverified',
    sources: ['https://cursor.com/docs/skills', 'https://cursor.com/docs/mcp'],
  },
});

export function agentSupport(agent: string, version?: string) {
  const adapter = AGENT_MATRIX[agent as keyof typeof AGENT_MATRIX];
  if (!adapter) return { supported: false, reason: 'unsupported-agent' };
  if (!version)
    return { supported: false, reason: 'agent-version-unverified', adapter };
  if (version !== adapter.inspectedVersion)
    return { supported: false, reason: 'unsupported-agent-version', adapter };
  return { supported: true, adapter };
}
