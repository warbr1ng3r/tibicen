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
      `${runner} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/7b3b08f58276034b1609e44ef393e5f7c0e01a1b -g --agent universal --skill tibicen-init tibicen-adopt --copy`,
    );
  }
});
