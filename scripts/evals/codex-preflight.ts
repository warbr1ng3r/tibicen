import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preflightCodex } from './profiles/codex/preflight.ts';
import { writeEvalArtifact } from './observations.ts';
export {
  preflightCodex,
  codexPermissions,
  controlledCodexConfig,
  toml,
} from './profiles/codex/preflight.ts';
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const output = process.argv[2];
  if (!output) throw new Error('Pass a new private output JSON path.');
  const result = await preflightCodex(
    '/opt/homebrew/bin/codex',
    process.argv[3] === '--observe-startup',
    process.argv[4] || 'gpt-6.1-sol',
  );
  await writeEvalArtifact(output, result);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
