import type { ApprovalReceipt } from './types.ts';
import path from 'node:path';
import { assert } from './contracts.ts';

export const APPROVAL_RECEIPTS_LIMIT = 8;

const isApprovalChannel = (value: unknown) =>
  value === 'cli --approve' || value === 'programmatic';

export function validateApprovalChannel(
  channel: unknown,
): asserts channel is ApprovalReceipt['channel'] {
  assert(
    isApprovalChannel(channel),
    'invalid-approval-channel',
    'Approval channel must be cli --approve or programmatic.',
  );
}

export function validateApprovalReceipts(
  receipts: unknown,
  sessionId: string,
  active?: Pick<ApprovalReceipt, 'root' | 'proposalDigest'>,
): asserts receipts is ApprovalReceipt[] | undefined {
  if (receipts === undefined) return;
  assert(
    typeof sessionId === 'string' &&
      sessionId.length > 0 &&
      Array.isArray(receipts) &&
      receipts.length <= APPROVAL_RECEIPTS_LIMIT &&
      receipts.every(
        (receipt) =>
          receipt &&
          typeof receipt === 'object' &&
          !Array.isArray(receipt) &&
          receipt.outcome === 'consumed' &&
          ['apply', 'resume'].includes(receipt.operation) &&
          isApprovalChannel(receipt.channel) &&
          typeof receipt.approvedDigest === 'string' &&
          /^[a-f0-9]{64}$/.test(receipt.approvedDigest) &&
          receipt.approvedDigest === receipt.proposalDigest &&
          typeof receipt.root === 'string' &&
          (path.posix.isAbsolute(receipt.root) ||
            path.win32.isAbsolute(receipt.root)) &&
          receipt.sessionId === sessionId &&
          typeof receipt.at === 'string' &&
          !Number.isNaN(Date.parse(receipt.at)),
      ),
    'tamper-suspect',
    'Invalid approval receipt journal.',
  );
  const latest = receipts.at(-1);
  assert(
    !active ||
      !latest ||
      (latest.root === active.root &&
        latest.proposalDigest === active.proposalDigest),
    'tamper-suspect',
    'Latest approval receipt differs from the active proposal.',
  );
}
