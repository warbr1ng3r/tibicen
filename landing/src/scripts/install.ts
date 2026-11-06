export const managers = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
} as const;
export type Manager = keyof typeof managers;

export function installationCommand(manager: Manager): string {
  return `${managers[manager]} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/7b3b08f58276034b1609e44ef393e5f7c0e01a1b -g --agent universal --skill tibicen-init tibicen-adopt --copy`;
}

export function mountInstallation() {
  const manager = document.querySelector<HTMLInputElement>(
    '#install-manager-select input',
  )!;
  const command = document.querySelector<HTMLElement>('#install-command')!;
  const update = () => {
    if (Object.hasOwn(managers, manager.value)) {
      command.textContent = installationCommand(manager.value as Manager);
    }
  };
  // Starwind emits the cancelable change proposal before updating its form input.
  document
    .querySelector('#install-manager-select')!
    .addEventListener('starwind:value-change', () => queueMicrotask(update));
  document.querySelector<HTMLFieldSetElement>('#install-controls')!.disabled =
    false;
  update();
}
