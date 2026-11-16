export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/2c7cb6f50a36d5fc3ca29a127e83b194d1e2a169 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
