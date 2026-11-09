export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/381c5d53972b53d60e9a134ec7f620bb7c35e6be -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
