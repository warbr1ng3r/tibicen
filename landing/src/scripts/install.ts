export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/a748ba3932e85f5194a3ea450c003f83bf8dcd9f -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
