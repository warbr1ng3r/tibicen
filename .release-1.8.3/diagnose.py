import json,os,re,urllib.request,urllib.error
from pathlib import Path
assert os.environ['GITHUB_REPOSITORY']=='warbr1ng3r/tibicen'
assert os.environ['GITHUB_REF']=='refs/heads/codex/release-1.8.3-ops-20261128'
assert os.environ['GITHUB_RUN_ATTEMPT']=='1'
BASE='https://api.github.com/repos/warbr1ng3r/tibicen/'
H={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','User-Agent':'Tibicen-release-1.8.3'}
def api(p):
 with urllib.request.urlopen(urllib.request.Request(BASE+p,headers=H),timeout=30) as r:return json.load(r)
run=api('actions/runs/46101311402');assert run['head_sha']=='d292ccebd2916aa8b5e7b80fd0f45e1d84bcb9ca' and run['head_branch']=='codex/memory-guidance-20261128'
job=next(x for x in api('actions/runs/46101311402/jobs?per_page=100')['jobs'] if x['name']=='standalone (windows-2022, 24.15.0)')
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a,**k):return None
try:
 r=urllib.request.build_opener(NoRedirect).open(urllib.request.Request(BASE+'actions/jobs/'+str(job['id'])+'/logs',headers=H),timeout=30);raw=r.read()
except urllib.error.HTTPError as e:
 assert e.code in [301,302,303,307];url=e.headers['Location'];assert url.startswith('https://')
 with urllib.request.urlopen(url,timeout=30) as r:raw=r.read()
text=raw.decode('utf8','replace').replace(os.environ['GH_TOKEN'],'[REDACTED]');lines=text.splitlines();picked=set()
for i,line in enumerate(lines):
 if any(k in line for k in ['not ok','AssertionError','error:','Expected values','actual:','expected:','fail ']):picked.update(range(max(0,i-5),min(len(lines),i+17)))
out='\n'.join(lines[i] for i in sorted(picked))[-55000:]
if not out:out=text[-55000:]
out=out.replace('%','%25').replace('\r','%0D').replace('\n','%0A')
print('::notice title=Windows retained failure::'+out,flush=True)
