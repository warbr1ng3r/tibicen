export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export const agents = {
  codex: 'Codex',
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
} as const;
export type Manager = keyof typeof managers;
export type Agent = keyof typeof agents;

export function installationCommand(manager: Manager, agent: Agent): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/v0.1.0-alpha.1 -g --agent ${agent} --skill tibicen-init tibicen-adopt --copy`;
}

export function mountInstallation() {
  const manager = document.querySelector<HTMLInputElement>(
    '#install-manager-select input',
  )!;
  const agent = document.querySelector<HTMLInputElement>(
    '#install-agent-select input',
  )!;
  const command = document.querySelector<HTMLElement>('#install-command')!;
  const update = () => {
    if (
      Object.hasOwn(managers, manager.value) &&
      Object.hasOwn(agents, agent.value)
    ) {
      command.textContent = installationCommand(
        manager.value as Manager,
        agent.value as Agent,
      );
    }
  };
  // Starwind emits the cancelable change proposal before updating its form input.
  document
    .querySelector('#install-manager-select')!
    .addEventListener('starwind:value-change', () => queueMicrotask(update));
  document
    .querySelector('#install-agent-select')!
    .addEventListener('starwind:value-change', () => queueMicrotask(update));
  document.querySelector<HTMLFieldSetElement>('#install-controls')!.disabled =
    false;
  update();
}
