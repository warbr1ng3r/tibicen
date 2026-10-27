import path from 'node:path';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { assert } from '../../core/contracts.ts';

const code = 'invalid-contained-subscription-auth';

/** Never returns the source refresh token. No network, refresh, or logging. */
export function accessOnlySubscriptionAuth(
  bytes: Buffer,
  lifetimeMs: number,
  now = Date.now(),
) {
  let source;
  try {
    assert(bytes.length <= 65536, code, 'Credential file exceeds the limit.');
    source = JSON.parse(bytes.toString('utf8'));
  } catch {
    assert(false, code, 'Invalid subscription credential document.');
  }
  assert(
    source &&
      ['chatgpt', 'chatgptAuthTokens'].includes(source.auth_mode) &&
      !source.OPENAI_API_KEY &&
      source.tokens &&
      ['id_token', 'access_token', 'account_id'].every(
        (key) =>
          typeof source.tokens[key] === 'string' &&
          source.tokens[key].length > 0 &&
          source.tokens[key].length <= 32768,
      ) &&
      typeof source.last_refresh === 'string' &&
      Number.isFinite(Date.parse(source.last_refresh)),
    code,
    'An existing ChatGPT subscription credential is required.',
  );
  let expiry: unknown;
  let account;
  try {
    const parts = source.tokens.access_token.split('.');
    assert(parts.length === 3, code, 'Expected a subscription access token.');
    expiry = JSON.parse(Buffer.from(parts[1], 'base64url').toString()).exp;
    const idParts = source.tokens.id_token.split('.');
    assert(
      idParts.length === 3,
      code,
      'Expected subscription identity metadata.',
    );
    account = JSON.parse(Buffer.from(idParts[1], 'base64url').toString())[
      'https://api.openai.com/auth'
    ];
  } catch {
    assert(false, code, 'Cannot verify access-token lifetime.');
  }
  assert(
    account &&
      ['free', 'go', 'plus', 'pro', 'prolite'].includes(
        account.chatgpt_plan_type,
      ) &&
      !account.chatgpt_account_is_fedramp,
    code,
    'This closed scope supports personal non-FedRAMP ChatGPT plans only.',
  );
  assert(
    typeof expiry === 'number' &&
      Number.isFinite(expiry) &&
      expiry * 1000 > now + lifetimeMs + 60000,
    code,
    'Access-token lifetime is insufficient; login is not refreshed here.',
  );
  return Buffer.from(
    JSON.stringify({
      auth_mode: 'chatgptAuthTokens',
      OPENAI_API_KEY: null,
      tokens: {
        id_token: source.tokens.id_token,
        access_token: source.tokens.access_token,
        refresh_token: '',
        account_id: source.tokens.account_id,
      },
      last_refresh: source.last_refresh,
    }) + '\n',
  );
}

export async function readAccessOnlySubscriptionAuth(
  filename: string,
  lifetimeMs: number,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  const stat = await lstat(filename);
  assert(
    path.isAbsolute(filename) &&
      (await realpath(filename)) === filename &&
      stat.isFile() &&
      stat.size <= 65536,
    code,
    'Use a canonical regular subscription credential file.',
  );
  signal?.throwIfAborted();
  const bytes = await readFile(filename, { signal });
  try {
    signal?.throwIfAborted();
    return accessOnlySubscriptionAuth(bytes, lifetimeMs);
  } finally {
    bytes.fill(0);
  }
}
