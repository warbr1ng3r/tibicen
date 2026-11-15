import { assert, digest } from '../core/contracts.ts';
import type { NativePhase } from './native-workflow.ts';

export interface NativeApprovalBinding {
  root: string;
  stage: 'setup' | 'task';
  phase: NativePhase;
  planHash: string;
  kernelDigest: string | null;
}

// Controller-local programming guard; host permissions enforce the boundary.
export function createNativeApproval() {
  const grants = new WeakMap<object, string>();
  return {
    issue(binding: NativeApprovalBinding) {
      const grant = Object.freeze({});
      grants.set(grant, digest(binding));
      return grant;
    },
    consume(grant: unknown, binding: NativeApprovalBinding) {
      assert(
        grant !== null &&
          typeof grant === 'object' &&
          grants.get(grant) === digest(binding),
        'native-approval-required',
        'An unused exact-phase grant from this controller is required.',
      );
      grants.delete(grant);
    },
  };
}
