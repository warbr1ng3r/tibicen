from pathlib import Path
import hashlib, json, os, urllib.request, urllib.parse
D = Path(__file__).resolve().parent
E = json.loads((D / "expected.json").read_text())
BASE = "https://api.github.com/repos/warbr1ng3r/tibicen/"
assert os.environ["GITHUB_REPOSITORY"] == "warbr1ng3r/tibicen"
assert os.environ["GITHUB_REF"] == "refs/heads/codex/release-1.7.1-ops"
assert os.environ["GITHUB_RUN_ATTEMPT"] == "1"
HEADERS = {"Authorization": "Bearer " + os.environ["GH_TOKEN"], "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "Tibicen-release-1.7.1"}
def api(path, data=None, method=None, upload=None):
    url = BASE + path
    headers = dict(HEADERS)
    if upload is not None:
        url = "https://uploads.github.com/repos/warbr1ng3r/tibicen/" + path
        payload = upload
        headers["Content-Type"] = "application/octet-stream"
    else:
        payload = json.dumps(data).encode() if data is not None else None
        if payload is not None: headers["Content-Type"] = "application/json"
    with urllib.request.urlopen(urllib.request.Request(url, data=payload, headers=headers, method=method), timeout=60) as response:
        return None if response.status == 204 else json.load(response)
phase = 'start'
try:
    phase = 'payload-hashes'
    for name, digest in E["assets"].items():
        assert hashlib.sha256((D / name).read_bytes()).hexdigest() == digest, name
    phase = 'source-checks'
    for run in E["checks"]:
        result = api(f"actions/runs/{run}")
        assert result["head_sha"] == E["source"] and result["conclusion"] == "success"
    phase = 'platform-jobs'
    jobs = api(f"actions/runs/{E['checks'][1]}/jobs")["jobs"]
    assert len(jobs) == 6 and all(j["conclusion"] == "success" for j in jobs)
    phase = 'tag-identity'
    ref = api("git/ref/tags/v1.7.1")
    assert ref["object"]["type"] == "tag" and ref["object"]["sha"] == E["tagObject"]
    assert api("git/tags/" + E["tagObject"])["object"]["sha"] == E["distribution"]
    previous = json.loads((D / "previous-release.json").read_text())
    def check_previous():
        r = api("releases/tags/v1.7.0")
        assert r["id"] == previous["id"] and r["published_at"] == previous["published_at"]
        assert [{k:a.get(k) for k in ["id","name","size","digest"]} for a in r["assets"]] == previous["assets"]
    check_previous()
    phase = 'draft-selection'
    releases = api("releases?per_page=100")
    candidates = [r for r in releases if r["tag_name"] == "v1.7.1" or r["name"] == "Tibicen 1.7.1 — reliable failure comparison"]
    assert len(candidates) <= 1, "Ambiguous release draft"
    body = {"tag_name":"v1.7.1", "target_commitish":E["distribution"], "name":"Tibicen 1.7.1 — reliable failure comparison", "body":(D/"release-notes.md").read_text(), "draft":True, "prerelease":False}
    phase = 'draft-write'
    if candidates:
        release = candidates[0]
        assert release["draft"], "Refuse to modify a published release"
        release = api(f"releases/{release['id']}", body, "PATCH")
    else:
        release = api("releases", body, "POST")
    rid = release["id"]
    phase = 'asset-list'
    existing = {a["name"]:a for a in api(f"releases/{rid}/assets")}
    assert set(existing).issubset(E["assets"]), "Unexpected draft asset"
    phase = 'asset-upload'
    for name, digest in E["assets"].items():
        if name in existing:
            assert existing[name]["digest"] == "sha256:" + digest and existing[name]["state"] == "uploaded"
        else:
            result = api(f"releases/{rid}/assets?name=" + urllib.parse.quote(name), method="POST", upload=(D/name).read_bytes())
            assert result["digest"] == "sha256:" + digest and result["state"] == "uploaded"
    assets = api(f"releases/{rid}/assets")
    assert len(assets) == 3
    assert {a["name"]:a["digest"] for a in assets} == {n:"sha256:"+v for n,v in E["assets"].items()}
    check_previous()
    phase = 'publish'
    release = api(f"releases/{rid}", {"draft":False,"make_latest":"true"}, "PATCH")
    assert not release["draft"] and release["tag_name"] == "v1.7.1" and release["published_at"]
    check_previous()
    print(json.dumps({"releaseId":rid,"url":release["html_url"],"publishedAt":release["published_at"],"assets":[{k:a[k] for k in ["id","name","digest","size"]} for a in assets]}))
except Exception as error:
    detail = str(error)
    if hasattr(error, 'read'):
        try: detail = json.loads(error.read()).get('message', detail)
        except Exception: pass
    detail = detail.replace(os.environ['GH_TOKEN'], '[REDACTED]').replace('\n', ' ')
    print('::error title=Publication guard::' + phase + ': ' + type(error).__name__ + ': ' + detail, flush=True)
    raise
