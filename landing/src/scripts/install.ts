export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/9a5e1ef2eb837075bb79e2fb2db01f439343d28d -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
