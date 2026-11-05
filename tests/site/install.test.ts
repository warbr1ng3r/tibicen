import test from 'node:test';
import assert from 'node:assert/strict';
import {
  installationCommand,
  type Manager,
} from '../../landing/src/scripts/install.ts';

test('all command runners keep the exact published distribution and universal target', () => {
  for (const [manager, runner] of [
    ['npm', 'npx'],
    ['pnpm', 'pnpm dlx'],
    ['yarn', 'yarn dlx'],
  ] as const) {
    assert.equal(
      installationCommand(manager as Manager),
      `${runner} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/0656f12e00ea83d84229180d331f3178bf253407 -g --agent universal --skill tibicen-init tibicen-adopt --copy`,
    );
  }
});
