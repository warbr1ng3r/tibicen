import json, os, urllib.request
from pathlib import Path
REPO = 'warbr1ng3r/tibicen'
EXPECTED_MAIN = '2e37489e96c3d4df73b71803d7efd4613d8f6cb1'
assert os.environ['GITHUB_REPOSITORY'] == REPO
assert os.environ['GITHUB_REF'] == 'refs/heads/codex/release-1.7.0-ops'
assert os.environ['GITHUB_RUN_ATTEMPT'] == '1'
headers = {'Authorization': 'Bearer '+os.environ['GH_TOKEN'], 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10'}
def api(path, body=None):
    req = urllib.request.Request('https://api.github.com/repos/'+REPO+'/'+path, data=None if body is None else json.dumps(body).encode(), headers=headers, method='GET' if body is None else 'POST')
    with urllib.request.urlopen(req, timeout=30) as response:
        return None if response.status == 204 else json.load(response)
assert api('git/ref/heads/main')['object']['sha'] == EXPECTED_MAIN
release = api('releases/tags/v1.7.0')
assert release['id'] == 450156224 and not release['draft']
runs = api('actions/runs?branch=main&per_page=30')['workflow_runs']
for name in ['Offline checks','Deploy landing to Cloudflare Pages']:
    matches = [r for r in runs if r['name'] == name and r['head_sha'] == EXPECTED_MAIN]
    assert matches and matches[0]['status'] == 'completed' and matches[0]['conclusion'] == 'success', name
assert api('git/ref/heads/main')['object']['sha'] == EXPECTED_MAIN
api('actions/workflows/pages.yml/dispatches', {'ref': 'main'})
print('::notice::Dispatched existing pages.yml once for accepted main '+EXPECTED_MAIN)
