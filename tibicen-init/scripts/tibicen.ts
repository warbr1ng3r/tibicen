#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir, realpath } from 'node:fs/promises';
import { assert, parseData, serializeData, VERSION } from './core/contracts.ts';
import { createProposal, unwrapPlan } from './core/plan.ts';
import { applyPlan, getStatus, atomicWrite } from './core/apply.ts';
import type { Source } from './core/types.ts';

function parseArgs(argv: string[]) {
  const [command = 'help', ...args] = argv;
  const options: Record<string, string | true> = {};
  for (let i = 0; i < args.length; i++) {
    assert(
      args[i].startsWith('--'),
      'invalid-arguments',
      'Options must use --name value.',
    );
    const name = args[i].slice(2);
    assert(!(name in options), 'invalid-arguments', 'Duplicate option.');
    options[name] =
      args[i + 1] !== undefined && !args[i + 1].startsWith('--')
        ? args[++i]
        : true;
  }
  return { command, options };
}

async function inputData(filename: unknown) {
  assert(
    typeof filename === 'string',
    'invalid-arguments',
    'Provide --input FILE or --input - for stdin.',
  );
  const text =
    filename === '-'
      ? await new Promise<string>((resolve, reject) => {
          let text = '';
          process.stdin.setEncoding('utf8');
          process.stdin.on('data', (chunk) => {
            text += chunk;
            if (text.length > 8 * 1024 * 1024) {
              reject(
                Object.assign(new Error('Input too large.'), {
                  code: 'invalid-data',
                }),
              );
              process.stdin.destroy();
            }
          });
          process.stdin.on('end', () => resolve(text));
          process.stdin.on('error', reject);
        })
      : await readFile(filename, 'utf8');
  return parseData(text);
}

export async function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);
  const accepted: Record<string, string[]> = {
    scan: [],
    discover: ['query', 'kind'],
    'source-check': ['input'],
    practices: ['agents'],
    proposal: ['input'],
    apply: ['plan', 'approve'],
    resume: ['plan', 'approve'],
    status: [],
    verify: [],
    report: ['save', 'requested'],
    'mcp-verify': ['agent', 'config', 'input'],
    'preset-load': ['name'],
    'preset-save': ['input', 'requested'],
    'self-test': [],
    version: [],
    help: [],
    '--help': [],
    '-h': [],
  };
  if (accepted[command])
    for (const key of Object.keys(options))
      assert(
        key === 'root' || accepted[command].includes(key),
        'invalid-arguments',
        `Unsupported option --${key}.`,
      );
  const root = path.resolve(
    typeof options.root === 'string' ? options.root : process.cwd(),
  );
  if (['help', '--help', '-h'].includes(command))
    return {
      version: VERSION,
      commands: {
        scan: 'scan --root PATH',
        discover: 'discover --query TEXT [--kind skill|mcp]',
        'source-check': 'source-check --input FILE_OR_STDIN_DASH',
        practices: 'practices --agents codex,cursor,claude-code',
        proposal: 'proposal --root PATH --input FILE_OR_STDIN_DASH',
        apply: 'apply --root PATH --plan FILE_OR_STDIN_DASH --approve DIGEST',
        resume:
          'resume --root PATH [--plan FILE_OR_STDIN_DASH] --approve DIGEST',
        status: 'status --root PATH',
        verify: 'verify --root PATH',
        report: 'report --root PATH [--save --requested]',
        'mcp-verify':
          'mcp-verify --root PATH --agent claude-code|cursor|codex [--config CODEX_CONFIG --input SERVER_SPEC]',
        'preset-load': 'preset-load --name NAME_OR_PATH',
        'preset-save': 'preset-save --input FILE_OR_STDIN_DASH --requested',
        'self-test': 'self-test',
        version: 'version',
      },
      consent:
        'Review the exact proposal and obtain explicit user consent before apply/resume. Autopilot is not approval.',
    };
  if (command === 'version') return { version: VERSION, schema: 1 };
  if (command === 'scan') {
    const { scanProject } = await import('./scan/index.ts');
    return scanProject(root);
  }
  if (command === 'proposal')
    return createProposal(root, await inputData(options.input));
  if (command === 'status') {
    const result = await getStatus(root);
    return {
      schema: 1,
      status: result.status,
      continuationAvailable: Boolean(result.state),
      sessionId:
        result.state?.id ?? result.manifest?.sessions?.at(-1)?.id ?? null,
      applied: result.observedApplied.map(({ path, action }) => ({
        path,
        action,
      })),
      recovery: result.recovery,
      commandAttempts:
        result.state?.commandAttempts ??
        result.manifest?.sessions?.at(-1)?.commandAttempts ??
        [],
      checks: result.state?.checks ?? result.manifest?.checks ?? {},
    };
  }
  if (command === 'report') {
    const current = await getStatus(root);
    const session = current.state ?? current.manifest?.sessions?.at(-1);
    const process =
      current.state?.proposal.process ?? current.manifest?.process;
    const report = {
      schema: 1,
      status: current.status,
      reason:
        current.state?.reason ?? session?.attempts?.at(-1)?.reason ?? null,
      applied: current.observedApplied.map(({ path, action }) => ({
        path,
        action,
      })),
      recovery: current.recovery,
      ...(process ? { process } : {}),
      assumptions:
        current.state?.proposal.assumptions ??
        current.manifest?.assumptions ??
        [],
      commandAttempts:
        current.state?.commandAttempts ??
        current.manifest?.sessions?.at(-1)?.commandAttempts ??
        [],
      checks: current.state?.checks ?? current.manifest?.checks ?? {},
      manualActions:
        current.state?.proposal?.manualActions ??
        current.manifest?.sessions?.at(-1)?.manualActions ??
        [],
      manualFragments:
        current.state?.proposal?.manualFragments ??
        current.manifest?.manualFragments ??
        [],
    };
    if (options.save) {
      assert(
        options.requested === true,
        'consent-required',
        'Save a report file only after an explicit user request.',
      );
      await atomicWrite(
        root,
        '.tibicen/report.md',
        `# Tibicen\n\n\`\`\`json\n${serializeData(report)}\`\`\`\n`,
      );
      return { ...report, saved: '.tibicen/report.md' };
    }
    return report;
  }
  if (command === 'apply' || command === 'resume') {
    const plan = options.plan
      ? unwrapPlan(await inputData(options.plan))
      : (await getStatus(root)).state?.proposal;
    assert(
      plan,
      'plan-required',
      'A proposal is required. If state is absent, scan and make a new proposal.',
    );
    const { runtimeHooks } = await import('./core/runtime.ts');
    const hooks = runtimeHooks(
      root,
      plan,
      typeof options.approve === 'string' ? options.approve : '',
    );
    try {
      return await applyPlan(root, plan, {
        approvedDigest:
          typeof options.approve === 'string' ? options.approve : undefined,
        resume: command === 'resume',
        beforeApply: hooks.beforeApply,
        verify: hooks.verify,
      });
    } finally {
      await hooks.cleanup();
    }
  }
  if (command === 'verify') {
    const { scanProject } = await import('./scan/index.ts');
    const { verifyInfrastructure } = await import('./verify/index.ts');
    const scan = await scanProject(root);
    const current = await getStatus(root);
    return verifyInfrastructure(root, {
      observedFiles: scan.files,
      components: current.state?.proposal.components,
      expectedFiles: current.state ? current.observedApplied : [],
      sharedRules:
        current.state?.proposal.sharedRules ??
        current.manifest?.sharedRules ??
        [],
      process: current.state?.proposal.process ?? current.manifest?.process,
    });
  }
  if (command === 'source-check') {
    const { validateSources } = await import('./discovery/index.ts');
    const { loadBlocklist } = await import('./core/policy.ts');
    return validateSources((await inputData(options.input)) as Source[], {
      blocklist: await loadBlocklist(),
    });
  }
  if (command === 'discover') {
    assert(
      typeof options.query === 'string',
      'invalid-arguments',
      'Provide --query TEXT.',
    );
    const { searchCandidates } = await import('./discovery/index.ts');
    const { loadBlocklist } = await import('./core/policy.ts');
    return searchCandidates(options.query, {
      kind: typeof options.kind === 'string' ? options.kind : 'skill',
      blocklist: await loadBlocklist(),
    });
  }
  if (command === 'practices') {
    const { checkPractices } = await import('./discovery/practices.ts');
    assert(
      typeof options.agents === 'string',
      'invalid-arguments',
      'Provide --agents codex,cursor,claude-code.',
    );
    return checkPractices({ agents: options.agents.split(',') });
  }
  if (command === 'mcp-verify') {
    const { validateMcpConfig, verifyCodexMcpBlock } =
      await import('./mcp/index.ts');
    if (options.agent === 'codex') {
      assert(
        typeof options.config === 'string',
        'invalid-arguments',
        'Provide the explicitly selected Codex config path.',
      );
      return verifyCodexMcpBlock(
        await readFile(options.config as string, 'utf8'),
        await inputData(options.input),
      );
    }
    const { safePath } = await import('./core/paths.ts');
    const target =
      options.agent === 'claude-code'
        ? '.mcp.json'
        : options.agent === 'cursor'
          ? '.cursor/mcp.json'
          : null;
    assert(target, 'invalid-arguments', 'Select claude-code, cursor or codex.');
    return validateMcpConfig(
      options.agent as string,
      await readFile(await safePath(root, target), 'utf8'),
    );
  }
  if (command === 'preset-load' || command === 'preset-save') {
    const { loadPreset, savePreset } = await import('./presets/index.ts');
    return command === 'preset-load'
      ? loadPreset(typeof options.name === 'string' ? options.name : '')
      : savePreset(await inputData(options.input), {
          requested: options.requested === true,
        });
  }
  if (command === 'self-test') {
    const skillRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
    );
    const scripts = await readdir(path.join(skillRoot, 'scripts'));
    for (const stage of [
      'scan',
      'inventory',
      'interview',
      'product-arch',
      'agent-arch',
      'proposal',
      'build',
      'verify',
      'handoff',
    ]) {
      const text = await readFile(
        path.join(skillRoot, 'references', `stage-${stage}.md`),
        'utf8',
      );
      assert(text.trim(), 'missing-stage', 'Required stage resource is empty.');
    }
    return {
      schema: 1,
      status: 'passed',
      version: VERSION,
      resources: scripts.includes('tibicen.ts') ? 'available' : 'missing',
      scope: 'distribution-resource-check',
    };
  }
  assert(
    false,
    'unknown-command',
    'Unknown command. Run help for available commands.',
  );
}

if (
  process.argv[1] &&
  (await realpath(process.argv[1]).catch(() => '')) ===
    fileURLToPath(import.meta.url)
) {
  main()
    .then((result) => {
      process.stdout.write(serializeData(result));
      if (
        result &&
        'status' in result &&
        (result.status === 'incomplete' || result.status === 'issues-found')
      )
        process.exitCode = 1;
    })
    .catch((error) => {
      process.stdout.write(
        serializeData({
          schema: 1,
          error: {
            code: error.code ?? 'internal-error',
            message: error.code
              ? error.message
              : 'Operation could not complete; no successful result is claimed.',
          },
        }),
      );
      process.exitCode = 1;
    });
}
