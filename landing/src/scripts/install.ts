export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/7b3b08f58276034b1609e44ef393e5f7c0e01a1b -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
