export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/d881334f638ccffa74bcc032a392451f5d5b8f52 -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}
