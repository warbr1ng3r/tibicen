import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=process.env.SystemRoot??process.env.WINDIR;
const exe=path.join(root,'System32/WindowsPowerShell/v1.0/powershell.exe');
const minimal={PATH:path.dirname(process.execPath),SystemRoot:root,WINDIR:root,PSExecutionPolicyPreference:'Restricted'};
const variants=[['minimal-ignore',minimal,[]],['with-module-path',{...minimal,PSModulePath:process.env.PSModulePath},[]],['with-user-profile',{...minimal,USERPROFILE:process.env.USERPROFILE},[]],['full-env',{...process.env,PSExecutionPolicyPreference:'Restricted'},[]],['input-format-text',minimal,['-InputFormat','Text']]];
for(const [label,env,extra] of variants){const t=Date.now();const r=spawnSync(exe,['-NoLogo','-NoProfile','-NonInteractive',...extra,'-Command','Get-ExecutionPolicy'],{env,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:20000});const out={label,elapsedMs:Date.now()-t,status:r.status,error:r.error?.code,stdout:r.stdout,stderr:r.stderr?.slice(0,3000)};console.log('::notice title=PowerShell probe::'+JSON.stringify(out).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A'));}
