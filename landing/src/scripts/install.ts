export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/b6fd86e8927c3640fe66be064da5a34e63ac366d -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
