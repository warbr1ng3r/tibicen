export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/29ab6308811c50304d61456011d1b7ec17b96c76 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
