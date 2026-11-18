import os, json, urllib.request
H={"Authorization":"Bearer "+os.environ["GH_TOKEN"],"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10","User-Agent":"Tibicen-publication-inspection"}
def get(p):
 with urllib.request.urlopen(urllib.request.Request("https://api.github.com/repos/warbr1ng3r/tibicen/"+p,headers=H),timeout=30) as r:return json.load(r)
for n in [44331525617,44331426419]:
 r=get("actions/runs/"+str(n));print("::notice title=Source gate::"+json.dumps({k:r[k] for k in ["id","head_sha","conclusion"]}))
print("::notice title=Tag ref::"+json.dumps(get("git/ref/tags/v1.7.0")["object"]))
print("::notice title=Tag target::"+json.dumps(get("git/tags/5884e983a1a6f8ba1a0fa0becbe61b8c8950ad7e")["object"]))
r=get("releases/tags/v1.6.0");print("::notice title=Previous release::"+json.dumps({"id":r["id"],"published_at":r["published_at"],"assets":[{k:a.get(k) for k in ["id","name","size","digest"]} for a in r["assets"]]}))
rs=get("releases?per_page=100");matches=[r for r in rs if r["tag_name"]=="v1.7.0" or "Tibicen 1.7.0" in (r["name"] or "")]
for r in matches:print("::notice title=Draft inspection::"+json.dumps({"id":r["id"],"tag_name":r["tag_name"],"name":r["name"],"draft":r["draft"],"assets":[{k:a.get(k) for k in ["id","name","size","state","digest"]} for a in get("releases/"+str(r["id"])+"/assets")]}))
