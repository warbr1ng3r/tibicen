export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/3fab265ce311c8d2de9d8942da1b031f6aba49b3 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
