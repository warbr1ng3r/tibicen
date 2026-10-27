import type { EvalProfileSpec, Preflight } from '../contracts.ts';

export interface NativeCommand {
  executable: string;
  argv: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}
export interface NativePermissions {
  root: string;
  home: string;
  privateRoot: string;
  read: string[];
  write: string[];
  deny: string[];
}
export interface NativeSessionInput extends NativePermissions {
  schema?: string;
  environment: Record<string, string>;
}
export interface NativeFailureDiagnostics {
  messageId?: {
    value: 'model-unsupported-chatgpt' | 'config-load' | 'provider-not-found';
    source: 'terminal-message' | 'stderr-message';
  };
  httpStatus: { value: number; source: string } | null;
  serverCode: { value: string; source: string } | null;
  retryAfterSeconds: { value: number; source: string } | null;
  requestIdHash: { value: string; source: string } | null;
  internalRetryCount: null;
}
export interface NativeOutput {
  started: boolean;
  completed: boolean;
  messages: string[];
  records: Record<string, unknown>[];
  commands: {
    command: unknown;
    output: string;
    exitCode: number | null;
    toolUseId: string;
  }[];
  usage: { inputTokens: number | null; outputTokens: number | null };
  diagnostics?: NativeFailureDiagnostics;
}
export type NativeProfile =
  | {
      state: 'blocked';
      specification: EvalProfileSpec;
      preflight: Preflight;
    }
  | {
      state: 'ready';
      specification: EvalProfileSpec;
      preflight: Preflight;
      projectSkillRoots: string[];
      skillPath(home: string): string;
      prepare(home: string): Promise<void>;
      invocation(input: NativeSessionInput): NativeCommand;
      check(
        input: NativePermissions,
        executable: string,
        argv: string[],
      ): NativeCommand;
      starts(record: Record<string, unknown>): boolean;
      parse(output: string, stderr?: string): NativeOutput;
    };
