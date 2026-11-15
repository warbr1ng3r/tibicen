export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/6d4baea666fc2885c04ba0fa0fc60dbb8b4e6a74 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
