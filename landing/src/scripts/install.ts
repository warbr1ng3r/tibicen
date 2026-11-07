export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/df15ae7e0ae67aee2bd278f7e4f265e03437e672 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
