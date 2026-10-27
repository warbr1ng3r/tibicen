FROM --platform=linux/arm64 docker.io/library/node:24.15.0-bookworm-slim@sha256:682f301a9e8e5731d4bb1889182a2186fe65a312cc81ae86cea6038ef8b1603f

COPY image-lock.json /opt/tibicen/image-lock.json
RUN node --input-type=module <<'NODE'
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const lock = JSON.parse(readFileSync('/opt/tibicen/image-lock.json', 'utf8'));
if (process.arch !== 'arm64' || process.version !== `v${lock.base.nodeVersion}`) throw new Error('Unexpected base toolchain');
for (const item of lock.packages) {
  const response = await fetch(item.url);
  if (!response.ok) throw new Error(`Package download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (`sha512-${createHash('sha512').update(bytes).digest('base64')}` !== item.integrity || createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error('Package integrity mismatch');
  writeFileSync('/tmp/package.tgz', bytes);
  mkdirSync(item.directory, { recursive: true });
  execFileSync('tar', ['-xzf', '/tmp/package.tgz', '--strip-components=1', '-C', item.directory]);
  rmSync('/tmp/package.tgz');
}
symlinkSync('/opt/codex/vendor/aarch64-unknown-linux-musl/bin/codex', '/usr/local/bin/codex');
symlinkSync('/opt/codex/vendor/aarch64-unknown-linux-musl/codex-path/rg', '/usr/local/bin/rg');
symlinkSync('/opt/pnpm/bin/pnpm.mjs', '/usr/local/bin/pnpm');
symlinkSync('/opt/pnpm/bin/pnpx.mjs', '/usr/local/bin/pnpx');
NODE

COPY --chmod=0555 watchdog.mjs /opt/tibicen/watchdog.mjs
RUN mkdir -p /home/runner/.codex && chown -R 1000:1000 /home/runner && chmod -R go-w /opt /usr/local && test "$(codex --version)" = "codex-cli 0.157.0" && test "$(pnpm --version)" = "11.21.0"
ENV HOME=/home/runner CODEX_HOME=/home/runner/.codex TMPDIR=/tmp
WORKDIR /tmp
USER 0:0
ENTRYPOINT ["/usr/local/bin/node", "/opt/tibicen/watchdog.mjs"]
CMD ["180000"]
