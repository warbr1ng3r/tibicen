export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/2f151b9fb1b9a2a3553e374fbb0ba6ad5b02fbb5 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
