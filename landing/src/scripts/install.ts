export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/0706d7caf6a93b79a117379c1cd5f8cd95effb04 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
