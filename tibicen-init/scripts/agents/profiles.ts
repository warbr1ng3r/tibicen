export interface HarnessProfile {
  readonly id: string;
  readonly label: string;
  readonly status: 'documented' | 'legacy';
  readonly checkedAt: string;
  readonly documentationScope: string;
  readonly instructionPaths: readonly string[];
  readonly skillPaths: readonly string[] | null;
  readonly sources: readonly string[];
}

// Documentation and file observations do not grant write, install or execution rights.
export const HARNESS_PROFILES: readonly HarnessProfile[] = Object.freeze([
  {
    id: 'claude-code',
    label: 'Claude Code',
    status: 'documented',
    checkedAt: '2026-10-21',
    documentationScope:
      'Existing Claude Code adapter documentation; current installation and loading unverified.',
    instructionPaths: ['CLAUDE.md', '.claude/rules/'],
    skillPaths: ['.claude/skills/'],
    sources: [
      'https://code.claude.com/docs/en/best-practices',
      'https://code.claude.com/docs/en/skills',
    ],
  },
  {
    id: 'codex',
    label: 'Codex',
    status: 'documented',
    checkedAt: '2026-10-21',
    documentationScope:
      'Existing Codex adapter documentation; current installation and loading unverified.',
    instructionPaths: ['AGENTS.md'],
    skillPaths: ['.agents/skills/'],
    sources: [
      'https://learn.chatgpt.com/docs/agent-configuration/agents-md',
      'https://learn.chatgpt.com/docs/build-skills',
    ],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    status: 'documented',
    checkedAt: '2026-10-21',
    documentationScope:
      'Existing Cursor format documentation; installed version and loading unverified.',
    instructionPaths: ['AGENTS.md', '.cursor/rules/', '.cursorrules'],
    skillPaths: ['.cursor/skills/', '.agents/skills/'],
    sources: [
      'https://cursor.com/docs/rules',
      'https://cursor.com/docs/skills',
    ],
  },
  {
    id: 'opencode',
    label: 'OpenCode V2',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'OpenCode V2 documentation only; no CLAUDE.md fallback. Exact installed patch and loading unverified.',
    instructionPaths: ['AGENTS.md'],
    skillPaths: ['.opencode/skills/', '.claude/skills/', '.agents/skills/'],
    sources: [
      'https://dev.opencode.ai/v2/docs/instructions/',
      'https://dev.opencode.ai/v2/docs/skills/',
    ],
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Unversioned Gemini CLI documentation; alternative instruction names require explicit configuration. Installed version and loading unverified.',
    instructionPaths: ['GEMINI.md'],
    skillPaths: ['.gemini/skills/', '.agents/skills/'],
    sources: [
      'https://geminicli.com/docs/cli/gemini-md/',
      'https://geminicli.com/docs/cli/skills/',
    ],
  },
  {
    id: 'copilot-cli',
    label: 'GitHub Copilot CLI',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Copilot CLI only; documentation disagrees on some import and nested-scope details. Installed version, applicable scope and loading unverified.',
    instructionPaths: [
      '.github/copilot-instructions.md',
      '.github/instructions/**/*.instructions.md',
      'AGENTS.md',
      'CLAUDE.md',
      '.claude/CLAUDE.md',
      'GEMINI.md',
    ],
    skillPaths: ['.github/skills/', '.agents/skills/', '.claude/skills/'],
    sources: [
      'https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions',
      'https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference',
    ],
  },
  {
    id: 'aider',
    label: 'Aider',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Convention files require explicit --read, /read or read configuration; CONVENTIONS.md is an example, not autodiscovery. Native skills and installed version/loading unknown.',
    instructionPaths: ['CONVENTIONS.md (explicit read configuration)'],
    skillPaths: null,
    sources: ['https://aider.chat/docs/usage/conventions.html'],
  },
  {
    id: 'zcode',
    label: 'ZCode Agent',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Built-in ZCode Agent workspace AGENTS.md only; no ancestor/child merge or imports. Project skill path unknown; installed version and loading unverified.',
    instructionPaths: ['AGENTS.md'],
    skillPaths: null,
    sources: [
      'https://zcode.z.ai/en/docs/agents',
      'https://zcode.z.ai/en/docs/skill',
    ],
  },
  {
    id: 'cline',
    label: 'Cline',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Current Cline documentation; rules may be toggled and scoped. Existing Memory Bank is a method, not a native store guarantee. Installed version and loading unverified.',
    instructionPaths: [
      '.clinerules/',
      '.cline/rules/',
      'AGENTS.md',
      '.cursorrules',
      '.windsurfrules',
    ],
    skillPaths: [
      '.cline/skills/',
      '.clinerules/skills/',
      '.claude/skills/',
      '.agents/skills/',
    ],
    sources: [
      'https://docs.cline.bot/customization/cline-rules',
      'https://docs.cline.bot/customization/skills',
    ],
  },
  {
    id: 'devin-local',
    label: 'Devin Local',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Devin Local in Devin Desktop, sharing the Devin CLI harness; legacy Windsurf imports do not identify the installed harness. Installed version and loading unverified.',
    instructionPaths: [
      'AGENTS.md',
      'AGENTS.local.md',
      'AGENT.md',
      '.devin/rules/',
      '.devin/global_rules.md',
    ],
    skillPaths: ['.devin/skills/', '.agents/skills/', '.windsurf/skills/'],
    sources: ['https://docs.devin.ai/desktop/devin-local/customizations'],
  },
  {
    id: 'continue-ide',
    label: 'Continue IDE',
    status: 'documented',
    checkedAt: '2026-11-05',
    documentationScope:
      'Continue IDE extensions, Agent/Chat/Edit rules, not autocomplete or apply. AGENTS.md and native skills unknown in this review; installed version and loading unverified.',
    instructionPaths: ['.continue/rules/'],
    skillPaths: null,
    sources: [
      'https://docs.continue.dev/customize/deep-dives/rules',
      'https://docs.continue.dev/customize/deep-dives/mcp',
    ],
  },
  {
    id: 'roo-code',
    label: 'Roo Code',
    status: 'legacy',
    checkedAt: '2026-11-05',
    documentationScope:
      'Historical Roo Code documentation; official shutdown notice dated 15 May 2026. Preserve existing setup; forks inherit no support. Installed version and loading unknown.',
    instructionPaths: [
      '.roo/rules/',
      '.roo/rules-{modeSlug}/',
      '.roorules',
      '.roorules-{modeSlug}',
      'AGENTS.md',
      'AGENT.md',
    ],
    skillPaths: ['.roo/skills/', '.roo/skills-{modeSlug}/', '.agents/skills/'],
    sources: [
      'https://roocodeinc.github.io/Roo-Code/',
      'https://roocodeinc.github.io/Roo-Code/features/custom-instructions/',
    ],
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    status: 'legacy',
    checkedAt: '2026-11-05',
    documentationScope:
      'Legacy path recognition through current Devin Local import documentation, not a current Cascade contract or migration permission. Installed identity/version and loading unknown.',
    instructionPaths: [
      '.windsurf/rules/',
      '.windsurf/global_rules.md',
      '.windsurfrules',
    ],
    skillPaths: ['.windsurf/skills/'],
    sources: ['https://docs.devin.ai/desktop/devin-local/customizations'],
  },
]);

export function getHarnessProfile(id: string) {
  return HARNESS_PROFILES.find((profile) => profile.id === id);
}

export const isHarnessId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 64 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export function isHarnessHintList(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  const distinct = new Set<string>();
  for (let index = 0; index < value.length; index++) {
    if (!Object.hasOwn(value, index) || !isHarnessId(value[index]))
      return false;
    distinct.add(value[index]);
    if (distinct.size > 16) return false;
  }
  return true;
}

export function instructionCandidate(relative: string) {
  return (
    /(?:^|\/)(?:AGENTS(?:\.local)?\.md|AGENT\.md|CLAUDE\.md|GEMINI\.md|\.cursorrules|\.windsurfrules|\.roorules(?:-[a-zA-Z0-9_-]+)?|\.clinerules)$/.test(
      relative,
    ) ||
    /(?:^|\/)\.(?:claude|cursor|cline|devin|continue|windsurf)\/rules\/.+\.(?:md|mdc|txt)$/.test(
      relative,
    ) ||
    /(?:^|\/)\.clinerules\/(?!skills\/).+\.(?:md|txt)$/.test(relative) ||
    /(?:^|\/)\.roo\/rules(?:-[a-zA-Z0-9_-]+)?\/.+\.(?:md|txt)$/.test(
      relative,
    ) ||
    /(?:^|\/)\.(?:devin|windsurf)\/global_rules\.md$/.test(relative) ||
    /(?:^|\/)\.github\/(?:copilot-instructions\.md|instructions\/.+\.instructions\.md)$/.test(
      relative,
    )
  );
}

const distinctiveMarkers: readonly [string, RegExp][] = [
  ['claude-code', /(?:^|\/)(?:CLAUDE\.md|\.claude\/)|^\.mcp\.json$/],
  ['codex', /(?:^|\/)\.codex\//],
  ['cursor', /(?:^|\/)(?:\.cursor\/|\.cursorrules$)/],
  ['opencode', /(?:^|\/)(?:\.opencode\/|opencode\.jsonc?$)/],
  ['gemini-cli', /(?:^|\/)(?:GEMINI\.md$|\.gemini\/)/],
  [
    'copilot-cli',
    /(?:^|\/)\.github\/(?:copilot-instructions\.md$|instructions\/.+\.instructions\.md$|skills\/|mcp\.json$)/,
  ],
  ['aider', /(?:^|\/)\.aider\.conf\.yml$/],
  ['zcode', /(?:^|\/)\.zcode\/config\.json$/],
  ['cline', /(?:^|\/)(?:\.cline\/|\.clinerules(?:\/|$))/],
  ['devin-local', /(?:^|\/)(?:\.devin\/|AGENTS\.local\.md$)/],
  ['continue-ide', /(?:^|\/)\.continue\//],
  ['roo-code', /(?:^|\/)(?:\.roo\/|\.roorules(?:-[a-zA-Z0-9_-]+)?$)/],
  ['windsurf', /(?:^|\/)(?:\.windsurf\/|\.windsurfrules$)/],
];

export function observedHarnesses(relative: string): string[] {
  return distinctiveMarkers
    .filter(([, marker]) => marker.test(relative))
    .map(([id]) => id);
}

export function harnessInfrastructurePath(relative: string) {
  return (
    instructionCandidate(relative) ||
    /(?:^|\/)\.(?:claude|cursor|codex)\/(?:settings(?:\.local)?\.json|config\.toml|commands\/|agents\/|skills\/|rules\/)/.test(
      relative,
    ) ||
    /(?:^|\/)\.(?:agents|opencode|gemini|cline|devin|windsurf)\/skills\//.test(
      relative,
    ) ||
    /(?:^|\/)\.clinerules\/skills\//.test(relative) ||
    /(?:^|\/)\.roo\/skills(?:-[a-zA-Z0-9_-]+)?\//.test(relative) ||
    /(?:^|\/)\.github\/skills\//.test(relative) ||
    /(?:^|\/)(?:opencode\.jsonc?|\.aider\.conf\.yml)$/.test(relative) ||
    /(?:^|\/)\.(?:zcode\/config\.json|gemini\/settings\.json|github\/mcp\.json|devin\/mcp_config(?:\.local)?\.json|roo\/mcp\.json)$/.test(
      relative,
    ) ||
    /(?:^|\/)\.continue\/mcpServers\/.+\.(?:ya?ml|json)$/.test(relative)
  );
}
