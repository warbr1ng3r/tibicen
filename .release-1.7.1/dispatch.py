import json,os,urllib.request
from pathlib import Path
E=json.loads((Path(__file__).parent/'expected.json').read_text())
assert os.environ['GITHUB_REPOSITORY']=='warbr1ng3r/tibicen'
assert os.environ['GITHUB_REF']=='refs/heads/codex/release-1.7.1-ops'
assert os.environ['GITHUB_RUN_ATTEMPT']=='1'
H={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','User-Agent':'Tibicen-release-1.7.1','Content-Type':'application/json'}
def api(path,data=None):
 req=urllib.request.Request('https://api.github.com/repos/warbr1ng3r/tibicen/'+path,data=None if data is None else json.dumps(data).encode(),headers=H)
 with urllib.request.urlopen(req,timeout=30) as r:return None if r.status==204 else json.load(r)
assert api('git/ref/heads/'+E['sourceBranch'])['object']['sha']==E['source']
for workflow in ['ci.yml','platforms.yml']:
 api('actions/workflows/'+workflow+'/dispatches',{'ref':E['sourceBranch']})
 print('::notice::Dispatched '+workflow+' at '+E['source'],flush=True)
