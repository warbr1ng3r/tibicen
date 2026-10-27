import path from 'node:path';
import os from 'node:os';
import {
  mkdtemp,
  cp,
  readFile,
  writeFile,
  realpath,
  symlink,
} from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { nativeSourcePins } from '../../scripts/evals/native-sources.ts';
import type { DiscoveryOptions } from '../../scripts/core/types.ts';

// Synthetic GitHub metadata is only an offline transport control, never observed provenance.
export async function sourceControl(): Promise<
  NonNullable<DiscoveryOptions['fetch']>
> {
  const { pins } = await nativeSourcePins(),
    responses = new Map<string, unknown>();
  const base = 'https://api.github.com/repos/DietrichGebert/ponytail';
  responses.set(base, {
    full_name: 'DietrichGebert/ponytail',
    created_at: '2020-01-01',
    default_branch: 'main',
    fork: false,
    archived: false,
  });
  for (const sha of new Set(pins.map((pin) => pin.commit))) {
    const selected = pins.filter((pin) => pin.commit === sha),
      tree = sha;
    responses.set(base + '/commits/' + sha, {
      sha,
      commit: { tree: { sha: tree } },
    });
    responses.set(base + '/git/trees/' + tree + '?recursive=1', {
      truncated: false,
      tree: await Promise.all(
        selected.map(async (pin) => ({
          path: pin.path,
          sha: pin.gitBlob,
          type: 'blob',
          mode: '100644',
          size: (await readFile(new URL('../../' + pin.local, import.meta.url)))
            .length,
        })),
      ),
    });
    const license = selected.find((pin) => pin.path === 'LICENSE')!;
    responses.set(base + '/license?ref=' + sha, {
      path: 'LICENSE',
      sha: license.gitBlob,
      license: { spdx_id: 'MIT' },
    });
    for (const pin of selected)
      responses.set(base + '/git/blobs/' + pin.gitBlob, {
        sha: pin.gitBlob,
        encoding: 'base64',
        content: (
          await readFile(new URL('../../' + pin.local, import.meta.url))
        ).toString('base64'),
      });
  }
  return async (url) => {
    if (!responses.has(url))
      throw new Error('Unexpected control request ' + url);
    return {
      ok: true,
      url,
      text: async () => JSON.stringify(responses.get(url)),
    };
  };
}

export async function nativeCheckout(mode = 'normal') {
  const root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-native-control-')),
  );
  for (const name of [
    'scripts',
    'references',
    'skills',
    'LICENSE',
    'package.json',
    'pnpm-lock.yaml',
  ])
    await cp(new URL('../../' + name, import.meta.url), path.join(root, name), {
      recursive: true,
    });
  await symlink(
    await realpath(new URL('../../node_modules', import.meta.url)),
    path.join(root, 'node_modules'),
  );
  const { buildSkills } = (await import(
    pathToFileURL(path.join(root, 'scripts/build.ts')).href
  )) as typeof import('../../scripts/build.ts');
  await buildSkills();
  const binary = path.join(root, 'fake-codex');
  await writeFile(
    binary,
    `#!${process.execPath}
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,writeSync} from 'node:fs';
import path from 'node:path';import {spawnSync,spawn} from 'node:child_process';
const args=process.argv.slice(2),mode=${JSON.stringify(mode)};
if(args[0]==='sandbox') {
  if(!existsSync(process.env.CODEX_HOME)){process.stderr.write('CODEX_HOME must exist');process.exit(1);}
  const command=args.indexOf('-C')+2,argv=args.slice(command+1);
  // This simulates a native boundary result; actual OS isolation has separate preflight evidence.
  if(argv[0]?.endsWith('boundary-probe.mjs')){console.log(JSON.stringify({denied:mode!=='boundary-failure',resourcesReadable:true,runtimeWriteDenied:mode!=='runtime-write-boundary-failure'}));process.exit(0);}
  const result=spawnSync(args[command],argv,{cwd:process.cwd(),encoding:'utf8',env:{...process.env,OPENSPEC_TELEMETRY:'0'}});process.stdout.write(result.stdout??'');process.exit(result.status??1);
}
if(mode.startsWith('kernel-reference')){
  const {loadNativeSources,nativeSourcePreload}=await import(${JSON.stringify(path.join(root, 'scripts/evals/native-sources.ts'))});
  const {mirror}=await loadNativeSources(${JSON.stringify(path.join(root, 'source-control.json'))});
  await import('data:text/javascript;base64,'+Buffer.from(nativeSourcePreload(mirror)).toString('base64'));
}
let prompt='';for await(const bytes of process.stdin)prompt+=bytes;
const emit=value=>{const bytes=Buffer.from(JSON.stringify(value)+'\\n');const at=bytes.findIndex(byte=>byte>=192);if(mode==='utf8-split'&&at>=0){writeSync(1,bytes.subarray(0,at+1));Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,30);writeSync(1,bytes.subarray(at+1));}else writeSync(1,bytes);};
if(mode==='null-record')emit(null);
if(mode!=='missing-start')emit({type:'turn.started'});
if(mode==='rate-diagnostic'){
  process.stderr.write('HTTP 429\\nRetry-After: 7\\nX-Request-Id: synthetic-request-id\\nAuthorization: Bearer sk-synthetic-private-value-1234567890\\nPrivate prompt text must not be retained\\n');
  emit({type:'error',message:'exceeded retry limit, last status: 429 Too Many Requests'});
  emit({type:'turn.failed',error:{message:'exceeded retry limit, last status: 429 Too Many Requests'}});
  process.exit(1);
}
if(mode==='oversized-output'){writeSync(1,'x'.repeat(2*1024*1024));await new Promise(()=>{});}
const item=(type,data)=>emit({type:'item.completed',item:{id:'control-'+Math.random(),type,...data}});
const read=relative=>{if(existsSync(relative))item('command_execution',{command:'cat '+relative,aggregated_output:readFileSync(relative,'utf8'),exit_code:0});};
if(mode==='missing-start'){read('AGENTS.md');item('agent_message',{text:JSON.stringify({summary:'No observed start',changes:[],commands:[],kernelPlan:null,question:null})});emit({type:'turn.completed'});process.exit(0);}
let proposal;
if(args.includes('--output-schema')) {
  if(mode.startsWith('kernel-reference')&&readdirSync(path.join(path.dirname(process.cwd()),'runtime')).some(file=>file.endsWith('-kernel.json')))throw new Error('Canonical plan leaked into another session');
  const phase=prompt.match(/Фаза ([a-z]+)./)[1];
  if(['specification','plan'].includes(phase)&&!prompt.includes('Обязательный состав planning:'))throw new Error('Required planning must be disclosed before proposal');
  const inspections=['openspec --version','openspec --help','openspec help','openspec validate --help','openspec version --help','openspec version --json','openspec instructions --help','openspec templates --help','openspec templates --schema spec-driven --json','openspec new change --help','openspec instructions specs --schema spec-driven','openspec instructions proposal --schema spec-driven'];
  if(mode==='metadata-read'&&inspections.some(command=>!prompt.includes(command)))throw new Error('Inspection recipes must be disclosed before the proposal');
  const observed=mode==='metadata-read'?inspections:mode==='metadata-unverified-cli'?['openspec help']:mode==='metadata-extra-args'?['openspec --help extra']:mode==='metadata-registry-check'?['openspec version --check']:mode==='project-check-before-approval'?['node --test']:phase==='specification'&&mode==='process-check-before-approval'?['openspec validate add-triple --strict']:phase==='specification'&&mode==='process-create-before-approval'?['openspec new change add-triple --json']:[];
  for(const command of observed)item('command_execution',{command,aggregated_output:'Offline command control',exit_code:0});
  const changes=[],commands=[],add=(path,content)=>changes.push({path,content});
  const application=()=>{add('src/math.js',readFileSync('src/math.js','utf8')+'\\nexport function triple(value) { return value * 3; }\\n');add('tests/math.test.js',readFileSync('tests/math.test.js','utf8')+'\\ntest("triple", async () => { const {triple}=await import("../src/math.js"); assert.equal(triple(3),9); });\\n');commands.push('node --test');};
  read('AGENTS.md');read('.agents/skills/ponytail/SKILL.md');read('.agents/skills/tibicen-openspec/SKILL.md');
  if(mode==='repeated-loading')for(let i=0;i<205;i++)read('AGENTS.md');
  if(phase==='setup') {
    const allowed=JSON.parse(prompt.match(/Пути только этой фазы: (\\[[^\\n]*?\\])./)[1]);
    if(allowed.length)commands.push('node --test');
    if(allowed.includes('.agents/skills/ponytail/SKILL.md'))for(const [target,source] of [['SKILL.md','skills/ponytail/SKILL.md'],['LICENSE','LICENSE']])add('.agents/skills/ponytail/'+target,readFileSync('available-sources/ponytail/'+source,'utf8'));
    if(allowed.includes('openspec/config.yaml'))add('openspec/config.yaml','schema: spec-driven\\n');
  } else if(phase==='specification') {
    const base='openspec/changes/add-triple/';
    add(base+'proposal.md','## Why\\nAdd triple while preserving double.\\n\\n## What Changes\\nExport triple.\\n\\n## Capabilities\\n### New Capabilities\\n- triple: Multiply a number by three.\\n\\n## Impact\\nMath exports and tests.\\n');
    add(base+'specs/triple/spec.md','## ADDED Requirements\\n\\n### Requirement: Triple value\\nThe library SHALL export triple(value) that returns value times three.\\n\\n#### Scenario: Positive input\\n- **WHEN** triple(3) is called\\n- **THEN** the result is 9\\n');
    if(mode==='early-code')application();
  } else if(phase==='plan') {
    if(!['process-skip-design','process-skip-unexplained','process-missing-tasks'].includes(mode))add('openspec/changes/add-triple/design.md','## Context\\nPreserve double.\\n## Decisions\\nOne pure export and a test.\\n');
    add('openspec/changes/add-triple/tasks.md','## 1. Implementation\\n- [ ] 1.1 Add triple and its test.\\n');
  } else {application();if(phase==='implementation'){add('openspec/changes/add-triple/tasks.md','## 1. Implementation\\n- [x] 1.1 Add triple and its test.\\n');commands.push('openspec validate add-triple --strict');}}
  if(mode==='missing-required-check'&&phase==='setup')commands.length=0;
  if(mode==='missing-process-check'&&phase==='implementation')commands.splice(commands.indexOf('openspec validate add-triple --strict'),1);
  proposal={summary:mode==='utf8-split'?'Сохраняю точный текст Привет':'Offline protocol control '+phase,changes,commands,kernelPlan:null,question:null};
  if(phase==='plan'&&mode==='process-skip-design'&&prompt.includes('Верни skipDesignReason:'))proposal.skipDesignReason='A local pure export has no architectural ambiguity; design is conditional.';
  if(phase==='plan'&&mode==='process-missing-tasks')proposal.changes=[];
  if(mode.startsWith('kernel-reference')&&phase==='setup'&&existsSync(path.join(process.env.HOME,'.agents/skills/tibicen-init/SKILL.md'))){
    const {createProposal}=await import(${JSON.stringify(path.join(root, 'scripts/core/plan.ts'))});
    const {nativeSourcePins}=await import(${JSON.stringify(path.join(root, 'scripts/evals/native-sources.ts'))});
    const {sources}=await nativeSourcePins();
    const envelope=await createProposal(process.cwd(),{mode:'init',sources:[sources[0]],changes:changes.map(file=>({...file,reason:'Exact synthetic source'})),commands:[],checks:{},compat:{enabled:false}},{home:process.env.HOME});
    item('command_execution',{command:'node trusted-tibicen proposal',aggregated_output:JSON.stringify(envelope),exit_code:0});
    proposal.kernelPlan='proposal-sha256:'+envelope.digest;
  }
  if(phase==='setup'&&mode==='clarification'&&!prompt.includes('Пользователь:'))proposal={...proposal,changes:[],commands:[],question:'Оставить отдельное ревью?'};
  item('agent_message',{text:JSON.stringify(proposal)});
} else {
  proposal=JSON.parse(prompt.split('Разрешаю только это предложение: ')[1].split('\\nDigest:')[0]);
  if(!prompt.includes('Внешние проверки после применения (все согласованные commands): '+JSON.stringify(proposal.commands)))throw new Error('Approved checks must be explicit');
  if(proposal.kernelPlan){
    const matched=prompt.match(/Готовый kernelPlan-файл: ("[^"]+")\\./);
    if(!matched)throw new Error('No approved canonical plan artifact');
    const filename=JSON.parse(matched[1]),envelope=JSON.parse(readFileSync(filename,'utf8'));
    const expected=[process.execPath,path.join(process.env.HOME,'.agents/skills',existsSync('AGENTS.md')||existsSync('.tibicen/manifest.yml')?'tibicen-adopt':'tibicen-init','scripts/tibicen.ts'),'apply','--root',process.cwd(),'--plan',filename,'--approve',envelope.digest].map(value=>"'"+value+"'").join(' ');
    const literal=prompt.split('Готовая команда применения (shell):\\n')[1]?.split('\\n')[0];
    if(literal!==expected)throw new Error('Missing or changed approved apply invocation');
    const {applyPlan}=await import(${JSON.stringify(path.join(root, 'scripts/core/apply.ts'))});
    try{await applyPlan(process.cwd(),envelope.proposal,{approvedDigest:envelope.digest});}catch(error){emit({type:'error',message:'Synthetic kernel apply: '+String(error?.code??error?.message??'failed')});process.exit(1);}
    if(mode==='kernel-reference-apply-failure'){emit({type:'turn.failed'});process.exit(1);}
  }else for(const file of proposal.changes){mkdirSync(path.dirname(file.path),{recursive:true});writeFileSync(file.path,file.content);}
  if(mode==='failed-apply-write'){writeFileSync('package.json','unapproved');emit({type:'turn.failed'});process.exit(1);}
  for(const command of proposal.commands)item('command_execution',{command,aggregated_output:'Offline execution record; independent host check executes the actual tools.',exit_code:0});
  item('agent_message',{text:'Applied exact control proposal.'});
}
emit({type:'turn.completed',usage:{input_tokens:10,output_tokens:2}});
if(mode==='timeout-after-completion')spawn(process.execPath,['-e','setTimeout(()=>{},10000)'],{stdio:'inherit'}).unref();
`,
    { mode: 0o755 },
  );
  const preflightPath = path.join(root, 'ready.json');
  await writeFile(
    preflightPath,
    JSON.stringify({
      preflight: {
        status: 'ready',
        startupControlled: true,
        authProtected: true,
        processTreeControlled: true,
        isolation: 'controlled',
      },
      cli: {
        path: binary,
        version: 'codex-cli 0.157.0',
        binaryHash: hashContent(await readFile(binary)),
      },
      candidateModel: 'gpt-6-sol',
      startupHash: digest('offline-startup'),
      permissionsHash: digest('offline-permissions'),
    }),
  );
  const api = (await import(
    pathToFileURL(path.join(root, 'scripts/evals/native.ts')).href
  )) as typeof import('../../scripts/evals/native.ts');
  return {
    root,
    api: { ...api, runNativeAcceptance: api.runTrustedNativeFixtureAcceptance },
    preflightPath,
    options: {
      profile: 'codex' as const,
      preflightPath,
      sourceSha: 'a'.repeat(40),
      experimentId: 'native-offline-control',
      repeats: 1,
      maxModelSessions: 32,
      limits: {
        launchMs: 3000,
        setupMs: 15000,
        taskMs: 15000,
        maxCostUsd: null,
      },
    },
  };
}
