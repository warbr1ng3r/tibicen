import type {
  ProcessInput,
  ProcessPlan,
  ProcessCheck,
} from '../process/index.ts';
import type { NodeEnvironment } from '../verify/environment.ts';
export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type PathReason = {
  path?: string;
  agent?: string;
  reason: string;
  source?: string;
  resolution?: string;
  line?: number;
};

export interface PathOptions {
  forbiddenPaths?: string[];
  allowSensitive?: boolean;
  allowDot?: boolean;
  maxFileBytes?: number;
}

export interface ScanOptions extends PathOptions {
  maxFiles?: number;
  maxTotalBytes?: number;
  maxDepth?: number;
}

export interface FileRecord {
  path: string;
  hash: string;
  mode: number;
  size?: number;
  infrastructure?: boolean;
}

export interface Change {
  path: string;
  action: string;
  beforeHash: string | null;
  beforeMode?: number | null;
  fileMode?: number;
  content?: string | null;
  reason?: string;
  diff?: string;
}

export interface ManagedBlockInput {
  content: string | null;
  migrate?: boolean;
}

export interface AppliedChange {
  path: string;
  action: string;
  beforeHash: string | null;
  afterHash: string | null;
  beforeMode?: number | null;
  afterMode?: number | null;
  evidence?: 'written' | 'matches-approved-result';
}

export interface CommandAttempt {
  id: string;
  kind: string;
  commandDigest: string;
  status: 'running' | 'unknown' | 'completed' | 'failed';
  retryReason?: string;
  reason?: string;
}

export interface FileRecovery {
  path: string;
  state: 'pending' | 'matches-approved-result' | 'ambiguous';
  beforeHash: string | null;
  afterHash: string | null;
  actualHash?: string | null;
  beforeMode?: number | null;
  afterMode?: number | null;
  actualMode?: number | null;
  reason?: string;
}

export interface Command {
  id: string;
  kind: string;
  executable: string;
  argv: string[];
  cwd: string;
  envNames: string[];
  trusted?: boolean;
  source?: { path: string; script: string; scriptHash: string };
}

export interface CommandResult {
  exitCode: number | null;
  reason?: string;
  signal?: NodeJS.Signals | null;
  stdout?: string;
  stderr?: string;
  timedOut?: boolean;
}

export interface RunOptions {
  root: string;
  approvedDigest?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  env?: NodeJS.ProcessEnv;
}

export type Runner = (
  command: Command,
  options: RunOptions,
) => Promise<CommandResult>;

export interface CheckRun {
  id: string;
  commandHash?: string;
  exitCode: number | null;
  outputHash?: string;
  timedOut?: boolean;
}

export interface Regression {
  id: string;
  reason: string;
}

export interface CheckResult {
  kind: string;
  status: string;
  reason?: string;
  scope?: string;
  method?: string;
  evidence?:
    | { path: string; passed: boolean }[]
    | {
        type: string;
        toolUseId: string;
        contentHash: string;
        instructionsHash: string;
      };
  issues?: PathReason[];
  sharedRules?: SharedRuleCheck;
  process?: ProcessCheck;
  firstAttempt?: boolean;
  newRegressions?: Regression[];
  score?: number;
  total?: number;
  runs?: CheckRun[];
}

export interface ManualAction {
  id: string;
  status: string;
  description: string;
  required?: boolean;
}

export interface SourceFile {
  path: string;
  sourcePath: string;
  contentHash: string;
  installedHash?: string;
  fileMode?: number;
  installedMode?: number;
}

export interface ComponentUpdate {
  source: Source;
  decisions: {
    path: string;
    resolution: 'preserve' | 'merge' | 'replace' | 'remove';
    reason: string;
  }[];
}

export interface ComponentFileState {
  repo: string;
  sha: string;
  license: string;
  licenseException?: { reason: string };
  skillPath?: string;
  sourcePath: string;
  contentHash: string;
  installedHash: string;
  fileMode?: number;
  installedMode?: number;
}

export interface ComponentFilePlan {
  path: string;
  beforeHash: string | null;
  afterHash: string | null;
  beforeMode?: number | null;
  afterMode?: number | null;
  previous: ComponentFileState | null;
  next: ComponentFileState | null;
  resolution: string;
  reason: string;
}

export interface ComponentPlan {
  schema: number;
  baselineDigest: string;
  manifestHash: string | null;
  fromSchema: number | null;
  toSchema: number;
  recoveredOwnership?: boolean;
  files: ComponentFilePlan[];
}

export interface ManifestSnapshot {
  manifest: Manifest | null;
  hash: string | null;
  recoveredInstalled?: Source[];
  recoveredSharedRules?: SharedRule[];
  recoveredProcess?: ProcessPlan;
}

export interface SharedRuleInput {
  id: string;
  content: string;
  reason: string;
  targets?: { agent: string; agentVersion: string; path: string }[];
}

export interface SharedRule extends SharedRuleInput {
  revision: string;
  targets: NonNullable<SharedRuleInput['targets']>;
}

export interface SharedRuleCheck {
  status: string;
  copies: {
    id: string;
    agent: string;
    path: string;
    revision: string;
    actualRevision: string | null;
    status: string;
    reason?: string;
  }[];
  issues: PathReason[];
}

export interface Source {
  repo: string;
  sha: string;
  kind?: string;
  license?: string;
  licenseException?: { reason: string };
  skillPath?: string;
  sourcePath?: string;
  files?: SourceFile[];
  ref?: string;
  provenance?: string;
}

export type Blocklist =
  | (string | { repo: string; sha?: string })[]
  | { entries: (string | { repo: string; sha?: string })[] };

export interface HttpResponse {
  ok: boolean;
  status?: number;
  redirected?: boolean;
  url?: string;
  text(): Promise<string>;
  headers?: { get(name: string): string | null };
  body?: {
    getReader(): {
      read(): Promise<{ done: boolean; value?: Uint8Array }>;
      cancel(): Promise<void>;
    };
  } | null;
}

export type Fetch = (
  url: string,
  options: RequestInit,
) => Promise<HttpResponse>;

export interface DiscoveryOptions {
  allowedHosts?: string[];
  token?: string;
  fetch?: Fetch;
  timeoutMs?: number;
  maxResponseBytes?: number;
  now?: string | number;
  blocklist?: Blocklist;
  kind?: string;
  sourceCache?: Map<string, unknown>;
  _memory?: Map<string, unknown>;
}

export interface McpServer {
  name: string;
  command: string;
  args?: string[];
  envNames?: string[];
  type?: string;
  url?: string;
  env?: unknown;
  headers?: unknown;
  envFile?: unknown;
}

export interface McpOperation {
  name: string;
  action: string;
  server?: Omit<McpServer, 'name'>;
}

export interface McpOptions {
  availableEnvNames?: string[];
  targetContextKnown?: boolean;
}

export interface McpConnection {
  agent: string;
  operations?: McpOperation[];
  trusted?: boolean;
  requiresExecutionTrust?: boolean;
  path?: string;
  results?: McpServerResult[];
}

export interface McpServerResult {
  name: string;
  status: string;
  reason?: string;
  envNames?: string[];
}

export interface McpResult {
  agent: string;
  status?: string;
  reason?: string;
  servers?: McpServerResult[];
  name?: string;
  envNames?: string[];
}

export interface ManualFragment {
  agent: string;
  path: string;
  status: string;
  block: string;
  envNames: string[];
  manualActions: ManualAction[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface BehaviorSpec {
  id?: string;
  kind: string;
  prompt: string;
  context?: string;
  tools?: string[];
  expectedArtifacts?: { path: string; hash?: string; contains?: string }[];
  questions?: QuizQuestion[];
}

export interface ClaudeOptions {
  id?: string;
  kind?: string;
  agent?: string;
  agentVersion?: string;
  copyRoot?: string;
  prompt?: string;
  tools?: string[];
  context?: string;
  envNames?: string[];
  availableEnvNames?: string[];
  maxBudgetUsd?: number;
  startupControlled?: boolean;
  trusted?: boolean;
  enabled?: boolean;
  date?: string;
}

export interface CompatPair {
  skill: string;
  ref: string;
  agent: string;
  agentVersion?: string;
  path?: string;
  contentHash?: string;
}

export interface CompatOptions extends ClaudeOptions {
  runner?: (command: Command) => Promise<CommandResult>;
}

export interface CompatResult extends CheckResult {
  status: 'unverified' | 'verified';
  command?: never;
  expected?: never;
  loading?: string;
  skill?: string;
  ref?: string;
  agent?: string;
  agentVersion?: string;
  date?: string;
  method?: string;
  evidence?: {
    type: string;
    toolUseId: string;
    contentHash: string;
    instructionsHash: string;
  };
}

export type Launch =
  | { status: 'ready'; command: Command; reason?: never }
  | { status: 'unverified'; reason: string; command?: never };

export interface ProbeReady {
  status: 'ready';
  reason?: never;
  skill: string;
  ref: string;
  agent: string;
  agentVersion?: string;
  date: string;
  command: Command;
  expected: {
    skill: string;
    ref: string;
    contentHash: string;
    instructionsHash: string;
    instructions: string;
  };
  method: string;
}

export interface ChecksInput {
  environmentReady?: boolean;
  environment?: Pick<NodeEnvironment, 'kind' | 'roots'>;
  profile?: string;
  task?: { specification: BehaviorSpec; execution?: ClaudeOptions };
  quiz?: { specification: BehaviorSpec; execution?: ClaudeOptions };
}

export interface CompatInput {
  enabled?: boolean;
  pairs?: CompatPair[];
  execution?: ClaudeOptions;
}

export interface Checks {
  infrastructure?: CheckResult;
  verify?: CheckResult;
  task?: CheckResult;
  quiz?: CheckResult;
  compat?: {
    enabled: boolean;
    reason?: string;
    pairs: Partial<CompatResult>[];
  };
  mcp?: McpResult[];
}

export interface ProposalInput {
  mode: string;
  process?: ProcessInput;
  forbiddenPaths?: string[];
  changes?: (Omit<Change, 'beforeHash' | 'action'> & {
    beforeHash?: string | null;
    action?: string;
    managedBlock?: ManagedBlockInput;
  })[];
  commands?: (Omit<Command, 'cwd' | 'envNames'> &
    Partial<Pick<Command, 'cwd' | 'envNames'>>)[];
  sources?: Source[];
  componentUpdates?: ComponentUpdate[];
  migrateManifest?: boolean;
  retryCommands?: { id: string; commandDigest: string; reason: string }[];
  sharedRules?: SharedRuleInput[];
  manualActions?: ManualAction[];
  mcp?: McpConnection[];
  assumptions?: JsonValue[];
  gaps?: JsonValue[];
  checks?: ChecksInput;
  compat?: CompatInput;
  practices?: JsonValue[];
}

export interface Proposal extends ProposalInput {
  schema: number;
  process?: ProcessPlan;
  root: string;
  emptyProject: boolean;
  forbiddenPaths: string[];
  changes: Change[];
  commands: Command[];
  sources: Source[];
  components: ComponentPlan;
  sharedRules: SharedRule[];
  manualActions: ManualAction[];
  manualFragments: ManualFragment[];
  mcp: McpConnection[];
  assumptions: JsonValue[];
  gaps: JsonValue[];
  checks: ChecksInput & { environment?: NodeEnvironment };
  compat: CompatInput;
  practices: JsonValue[];
  unavailableChecks: { kind: string; reason: string; skill?: string }[];
  serviceWrites: string[];
  usageFile: string;
}

export interface Attempt {
  number: number;
  kind: string;
  outcome: string;
  reason?: string;
  newRegressions?: Regression[];
}

export interface SessionSummary {
  id: string;
  process?: ProcessPlan;
  processHistory?: ProcessPlan[];
  attempts: Attempt[];
  manualActions: ManualAction[];
  status: string;
  changes?: AppliedChange[];
  components?: ComponentFilePlan[];
  manifestMigration?: { from: number; to: number };
  commandAttempts?: CommandAttempt[];
  sharedRules?: SharedRule[];
}

export interface Session {
  schema: number;
  id: string;
  proposal: Proposal;
  proposalDigest: string;
  originalEmpty: boolean;
  originals: Record<string, string | null>;
  planOriginals: Record<string, string | null>;
  applied: AppliedChange[];
  history: Pick<
    SessionSummary,
    | 'changes'
    | 'components'
    | 'manifestMigration'
    | 'sharedRules'
    | 'processHistory'
  >;
  attempts: Attempt[];
  status: string;
  checks: Checks &
    Required<Pick<Checks, 'infrastructure' | 'verify' | 'task' | 'quiz'>>;
  baseline: unknown;
  completedCommands: string[];
  commandAttempts: CommandAttempt[];
  pendingManifest?: {
    beforeHash: string | null;
    afterHash: string;
    content: string;
  };
  componentBaseline?: ManifestSnapshot;
  manifestHash?: string | null;
  reason?: string;
}

export interface Manifest {
  schema: number;
  process?: ProcessPlan;
  tibicen: {
    version: string;
    rulesVersion: string;
    built: string;
    mode: string;
    status: string;
  };
  practices: JsonValue[];
  installed: Source[];
  mcpSources: Source[];
  changes: AppliedChange[];
  assumptions: JsonValue[];
  gaps: JsonValue[];
  checks: Checks;
  compat: Checks['compat'] | CompatInput;
  mcp: McpResult[];
  manualFragments: ManualFragment[];
  sessions: SessionSummary[];
  sharedRules?: SharedRule[];
}

export interface ApplyOptions {
  home?: string;
  approvedDigest?: string;
  resume?: boolean;
  discovery?: DiscoveryOptions;
  timeoutMs?: number;
  beforeApply?: (
    proposal: Proposal,
    options: { approvedDigest: string; runner?: Runner },
  ) => Promise<unknown>;
  verify?: (
    proposal: Proposal,
    session: Session,
    execution?: { runner: Runner },
  ) => Promise<Checks>;
  afterChange?: (change: Change, session: Session) => Promise<void> | void;
  checkpoint?: (
    point:
      | 'before-file-write'
      | 'after-file-write'
      | 'before-manifest-write'
      | 'after-manifest-write'
      | 'before-state-cleanup'
      | 'after-command',
    session: Session,
    change?: Change,
  ) => Promise<void> | void;
}

export interface Snapshot {
  schema: number;
  id: string;
  sourceRoot: string;
  root: string;
  files: FileRecord[];
  excluded: PathReason[];
  complete: boolean;
  gaps: PathReason[];
  baselineId?: string;
  environment?: NodeEnvironment;
}

export interface VerifyOptions extends ScanOptions {
  approvedDigest?: string;
  temporaryRoot?: string;
  runner?: Runner;
  environmentReady?: boolean;
  environment?: NodeEnvironment;
  profile?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  agent?: string;
  agentVersion?: string;
  trusted?: boolean;
  startupControlled?: boolean;
  envNames?: string[];
  availableEnvNames?: string[];
  maxBudgetUsd?: number;
}

export interface ScanResult {
  schema: number;
  root: string;
  kind: string;
  mode: string;
  files: FileRecord[];
  languages: string[];
  commands: Command[];
  agents: string[];
  gaps: PathReason[];
  excluded: PathReason[];
  complete: boolean;
}

export interface Preset {
  schema: number;
  name: string;
  stack_hint?: Record<string, string>;
  answers: {
    process?: string;
    style?: string;
    agents?: string[];
    forbidden_paths?: string[];
  };
  preferred_sources: string[];
}
