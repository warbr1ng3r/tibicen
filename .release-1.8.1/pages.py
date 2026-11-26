import json, os, urllib.request
from pathlib import Path
REPO = 'warbr1ng3r/tibicen'
E = json.loads((Path(__file__).parent / 'expected.json').read_text())
EXPECTED_MAIN = E['metadataSource']
assert len(EXPECTED_MAIN) == 40 and all(c in '0123456789abcdef' for c in EXPECTED_MAIN)
assert os.environ['GITHUB_REPOSITORY'] == REPO
assert os.environ['GITHUB_REF'] == 'refs/heads/codex/release-1.8.1-ops-20261126'
assert os.environ['GITHUB_RUN_ATTEMPT'] == '1'
headers = {'Authorization': 'Bearer '+os.environ['GH_TOKEN'], 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10'}
def api(path, body=None):
    req = urllib.request.Request('https://api.github.com/repos/'+REPO+'/'+path, data=None if body is None else json.dumps(body).encode(), headers=headers, method='GET' if body is None else 'POST')
    with urllib.request.urlopen(req, timeout=30) as response:
        return None if response.status == 204 else json.load(response)
assert api('git/ref/heads/main')['object']['sha'] == EXPECTED_MAIN
release = api('releases/tags/v1.8.1')
assert release['id'] == E['releaseId'] and not release['draft']
runs = api('actions/runs?branch=main&per_page=30')['workflow_runs']
for name,path in [('Offline checks','.github/workflows/ci.yml'),('Deploy landing to Cloudflare Pages','.github/workflows/cloudflare-pages.yml')]:
    matches = [r for r in runs if r['name'] == name and r['path'] == path and r['head_sha'] == EXPECTED_MAIN and r['event'] == 'push' and r['head_branch'] == 'main' and r['run_attempt'] == 1]
    assert matches and matches[0]['status'] == 'completed' and matches[0]['conclusion'] == 'success', name
assert api('git/ref/heads/main')['object']['sha'] == EXPECTED_MAIN
api('actions/workflows/pages.yml/dispatches', {'ref': 'main'})
print('::notice::Dispatched existing pages.yml once for accepted main '+EXPECTED_MAIN)
