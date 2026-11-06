#!/usr/bin/env python3
"""Compare unauthenticated Pages bodies with the exact official Actions artifact."""

import concurrent.futures
import hashlib
from html import unescape
import ipaddress
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from urllib.parse import quote, urljoin

SITE = "https://warbr1ng3r.github.io/tibicen/"
REPOSITORY = "https://github.com/warbr1ng3r/tibicen"


def digest(body):
    return hashlib.sha256(body).hexdigest()


def route(path):
    return path[:-10] if path.endswith("index.html") else path


def check_record(index, previous, expected):
    assert index["schema"] == 1
    assert index["channel"] == SITE + "maintenance/index.json"
    assert len(previous["versions"]) == 7 and previous["versions"][-1]["version"] == "1.4.1", "Expected seven records through 1.4.1"
    assert len(index["versions"]) == 8, "Expected exactly one appended record"
    assert index["versions"][:-1] == previous["versions"], "Historical versions changed"
    assert index["warnings"] == previous["warnings"], "Historical warnings changed"
    assert index.get("independence") == previous.get("independence"), "Maintenance independence statement changed"
    assert index["versions"][-1] == expected, "Published release binding differs"


def check_pages(bodies, version, distribution_commit):
    release = REPOSITORY + "/releases/tag/v" + version
    install = REPOSITORY + "/tree/" + distribution_commit
    for path, locale in [("index.html", "en"), ("ru/index.html", "ru")]:
        body = bodies[path]
        assert re.search(rb'<html\b[^>]*lang="' + locale.encode() + rb'"', body)
        assert ("Tibicen " + version).encode() in body
        assert release.encode() in body
        assert install.encode() in body
        for element, runner in [("install-command", "npx"), ("install-command-pnpm", "pnpm dlx"), ("install-command-yarn", "yarn dlx")]:
            expected = f"{runner} skills@1.7.4 add {install} -g --agent universal --skill tibicen-init tibicen-adopt --copy"
            commands = re.findall(rb'<code\b[^>]*id="' + element.encode() + rb'"[^>]*>([\s\S]*?)</code>', body)
            assert commands == [expected.encode()], "Static installer has a different pin or flags"
            buttons = re.findall(rb'<button\b[^>]*data-copy-target="' + element.encode() + rb'"[^>]*>', body)
            assert len(buttons) == 1, "Static installer copy target is missing or duplicated"
    for path, locale in [("index.html", "en"), ("ru/index.html", "ru"), ("preset/index.html", "en"), ("ru/preset/index.html", "ru")]:
        body = bodies[path].decode("utf-8")
        assert re.search(r'<html\b[^>]*lang="' + locale + r'"', body), "Page language differs"
        footers = re.findall(r'<footer\b[^>]*>([\s\S]*?)</footer>', body)
        assert len(footers) == 1, "Expected one footer"
        groups = re.findall(r'<div\b[^>]*class="project-links"[^>]*>([\s\S]*?)</div>', footers[0])
        assert len(groups) == 1, "Expected one project-link group"
        def links(markup):
            return [(unescape(href), unescape(re.sub(r'<[^>]+>', '', label)).strip())
                    for href, label in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)</a>', markup)]
        expected = [(REPOSITORY, "GitHub"), (REPOSITORY + "/blob/main/README.md", "Documentation" if locale == "en" else "Документация"),
                    (REPOSITORY + "/blob/main/LICENSE", "MIT")]
        assert links(groups[0]) == expected, "Footer links or labels differ"
        all_links = links(footers[0])
        assert len(all_links) == 4 and all_links[1:] == expected, "Unexpected footer link"
        assert all_links[0][0] == "/tibicen/" + ("ru/" if locale == "ru" else ""), "Footer home link differs"


def check_notices(bodies):
    for path, expected_hash, expected_bytes in [
        ("licenses/astrowind.txt", "6b7e2fe59d6b85c47fd2de8cad65db3c37b84e8bbf662f37a7c7cc7fd1cfea25", 1065),
        ("licenses/starwind.txt", "b75ec854b30c7ae3b2e31f4b43f804fea11ef6a78db2f5b608455da84cf28fcd", 1096),
    ]:
        assert len(bodies[path]) == expected_bytes and digest(bodies[path]) == expected_hash, "Static license notice changed"


def self_test():
    assert route("index.html") == ""
    assert route("ru/index.html") == "ru/"
    assert route("assets/index.html.svg") == "assets/index.html.svg"
    old = {"versions": [{"version": version} for version in ["0.1.0-alpha.1", "1.0.0", "1.1.0", "1.2.0", "1.3.0", "1.4.0", "1.4.1"]], "warnings": []}
    record = {"version": "1.5.0"}
    index = {"schema": 1, "channel": SITE + "maintenance/index.json", **old}
    index["versions"] = old["versions"] + [record]
    check_record(index, old, record)
    changed = {**index, "versions": [{"version": "changed"}, *old["versions"][1:], record]}
    try:
        check_record(changed, old, record)
    except AssertionError:
        pass
    else:
        raise AssertionError("Historical mutation was accepted")
    for changed, prior in [
        ({**index, "warnings": ["changed"]}, old),
        ({**index, "versions": index["versions"][:-1]}, old),
        ({**index, "versions": index["versions"] + [record]}, old),
        (index, {**old, "versions": old["versions"][:-1]}),
    ]:
        try:
            check_record(changed, prior, record)
        except AssertionError:
            pass
        else:
            raise AssertionError("Maintenance history or append guard was bypassed")
    version = "1.5.0"
    commit = "a" * 40
    install = REPOSITORY + "/tree/" + commit
    release = REPOSITORY + "/releases/tag/v" + version
    suffix = f"skills@1.7.4 add {install} -g --agent universal --skill tibicen-init tibicen-adopt --copy"
    commands = "".join(f'<button data-copy-target="{element}"></button><code id="{element}">{runner} {suffix}</code>' for element, runner in [("install-command", "npx"), ("install-command-pnpm", "pnpm dlx"), ("install-command-yarn", "yarn dlx")])
    def footer(locale):
        home = "/tibicen/" + ("ru/" if locale == "ru" else "")
        documentation = "Documentation" if locale == "en" else "Документация"
        return f'<footer><a href="{home}">tibicen</a><div class="project-links"><a href="{REPOSITORY}">GitHub</a><a href="{REPOSITORY}/blob/main/README.md">{documentation}</a><a href="{REPOSITORY}/blob/main/LICENSE">MIT</a></div></footer>'
    bodies = {
        path: f'<html lang="{locale}">Tibicen {version} {release}{commands}{footer(locale)}</html>'.encode()
        for path, locale in [("index.html", "en"), ("ru/index.html", "ru"), ("preset/index.html", "en"), ("ru/preset/index.html", "ru")]
    }
    check_pages(bodies, version, commit)
    for before, after in [(f"pnpm dlx {suffix}".encode(), b"pnpm dlx wrong"), (b'data-copy-target="install-command"', b'data-copy-target="wrong"')]:
        changed = {**bodies, "ru/index.html": bodies["ru/index.html"].replace(before, after, 1)}
        try:
            check_pages(changed, version, commit)
        except AssertionError:
            pass
        else:
            raise AssertionError("Wrong static installer command or copy target was accepted")
    for path, before, after in [
        ("ru/index.html", "Документация", "Documentation"),
        ("preset/index.html", '/blob/main/README.md', '/blob/main/README_ru.md'),
        ("ru/preset/index.html", '<div class="project-links">', '<a href="https://example.org/">extra</a><div class="project-links">'),
        ("ru/preset/index.html", 'lang="ru"', 'lang="en"'),
    ]:
        changed = {**bodies, path: bodies[path].replace(before.encode(), after.encode(), 1)}
        try:
            check_pages(changed, version, commit)
        except AssertionError:
            pass
        else:
            raise AssertionError("Wrong footer or page language was accepted")
    try:
        check_notices({"licenses/astrowind.txt": b"changed", "licenses/starwind.txt": b"changed"})
    except AssertionError:
        pass
    else:
        raise AssertionError("Changed license notices were accepted")
    print("PASS: seven immutable records/warnings, one append, static commands, four localized footers and rejection")


def main(config_path, output_path):
    config_file = Path(config_path).resolve(strict=True)
    config_bytes = config_file.read_bytes()
    config = json.loads(config_bytes)
    build = Path(config["artifactDirectory"]).resolve(strict=True)
    previous_file = Path(config["maintenanceBefore"]).resolve(strict=True)
    previous_bytes = previous_file.read_bytes()
    previous = json.loads(previous_bytes)
    expected = config["publishedRecord"]
    assert expected["version"] == "1.5.0"
    assert expected["releaseNotes"] == REPOSITORY + "/releases/tag/v1.5.0"
    assert expected["sourceCommit"] == config["releaseSourceCommit"]
    assert expected["payloadManifest"]["sha256"] == "58632f3a3505257768be7fd3219fd67357fccd1abc9d81efface633ce559587c"
    assert expected["archives"] == [{"name": "tibicen-1.5.0.tar.gz", "url": REPOSITORY + "/releases/download/v1.5.0/tibicen-1.5.0.tar.gz",
                                     "sha256": "f6d5aa6f8dda0aef5f51ded9e711f534490d27ebdc289505fed73eef18fc2b46"}]
    for value in [config["pagesSourceCommit"], config["releaseSourceCommit"], expected["sourceCommit"], expected["distributionCommit"]]:
        assert re.fullmatch(r"[a-f0-9]{40}", value)
    assert re.fullmatch(r"[1-9][0-9]*", str(config["pagesRunId"]))
    assert config["pagesDeploymentStatus"] == "success"
    address = config.get("observedPublicIp")
    if address:
        assert ipaddress.ip_address(address).is_global
    files = sorted(path for path in build.rglob("*") if path.is_file())
    assert len(files) == 20, "Expected twenty official artifact files"
    bodies = {}
    for path in files:
        assert not path.is_symlink()
        relative = path.relative_to(build).as_posix()
        assert not any(part.startswith(".") for part in Path(relative).parts)
        bodies[relative] = path.read_bytes()
    check_record(json.loads(bodies["maintenance/index.json"]), previous, expected)
    check_pages(bodies, expected["version"], expected["distributionCommit"])
    check_notices(bodies)
    output = Path(output_path).resolve()
    output.mkdir(parents=True, exist_ok=False)
    returned = output / "returned"
    returned.mkdir()

    with tempfile.TemporaryDirectory(prefix="tibicen-pages-readonly-") as temporary:
        environment = {"HOME": temporary, "TMPDIR": temporary, "PATH": "/usr/bin:/bin", "LANG": "C", "LC_ALL": "C"}

        def fetch(item):
            relative, body = item
            destination = returned / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            url = urljoin(SITE, quote(route(relative), safe="/._-"))
            argv = ["/usr/bin/curl", "--disable", "--silent", "--show-error", "--proto", "=https", "--connect-timeout", "8", "--max-time", "20", "--retry", "0", "--header", "Accept-Encoding: identity"]
            if address:
                argv += ["--resolve", "warbr1ng3r.github.io:443:" + address]
            argv += ["--output", str(destination), "--write-out", "%{http_code}", url]
            result = subprocess.run(argv, env=environment, cwd=temporary, capture_output=True, timeout=25, check=False)
            actual = destination.read_bytes() if destination.exists() else b""
            return {"path": relative, "url": url, "exitCode": result.returncode, "httpStatus": result.stdout.decode(errors="replace"), "stderr": result.stderr.decode(errors="replace"), "expectedSha256": digest(body), "actualSha256": digest(actual), "expectedBytes": len(body), "actualBytes": len(actual), "match": result.returncode == 0 and result.stdout == b"200" and actual == body}

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(fetch, bodies.items()))

    all_match = all(result["match"] for result in results)
    if all_match:
        actual_bodies = {path: (returned / path).read_bytes() for path in bodies}
        check_record(json.loads(actual_bodies["maintenance/index.json"]), previous, expected)
        check_pages(actual_bodies, expected["version"], expected["distributionCommit"])
        check_notices(actual_bodies)
    receipt = {"verdict": "PASS" if all_match else "FAIL", "atUtc": datetime.now(timezone.utc).isoformat(), "configSha256": digest(config_bytes), "maintenanceBeforeSha256": digest(previous_bytes), "pagesSourceCommit": config["pagesSourceCommit"], "releaseSourceCommit": config["releaseSourceCommit"], "metadataCiRunId": config["metadataCiRunId"], "pagesRunId": config["pagesRunId"], "pagesDeploymentStatus": config["pagesDeploymentStatus"], "artifactProvenance": config["artifactProvenance"], "expectedBodyCount": len(results), "matchingBodies": sum(result["match"] for result in results), "enRuAndInstallAndMaintenanceChecksPassed": all_match, "tls": "Normal certificate verification; no authentication, cookies, redirects or retries", "observedPublicIp": address, "results": results, "limits": ["Workflow/deployment facts supplied by root must be independently verified against GitHub; body retrieval alone does not establish deployment identity.", "Release-source CI and platform/payload acceptance are separate publication gates; metadata CI and Pages do not replace them.", "No report submission, agent loading, application behavior or human usefulness is tested."]}
    (output / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps({key: receipt[key] for key in ["verdict", "expectedBodyCount", "matchingBodies", "pagesSourceCommit", "pagesRunId"]}))
    return 0 if all_match else 1


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
    elif len(sys.argv) == 3:
        sys.exit(main(sys.argv[1], sys.argv[2]))
    else:
        sys.exit("usage: verify-returned.py CONFIG.json NEW_OUTPUT_DIRECTORY | --self-test")
