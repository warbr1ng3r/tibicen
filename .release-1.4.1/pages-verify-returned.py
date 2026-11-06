#!/usr/bin/env python3
"""Compare actual unauthenticated Pages bodies with an exact clean build."""

import concurrent.futures
import hashlib
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
    assert len(previous["versions"]) == 6 and previous["versions"][-1]["version"] == "1.4.0", "Expected six records through 1.4.0"
    assert len(index["versions"]) == 7, "Expected exactly one appended record"
    assert index["versions"][:-1] == previous["versions"], "Historical versions changed"
    assert index["warnings"] == previous["warnings"], "Historical warnings changed"
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


def self_test():
    assert route("index.html") == ""
    assert route("ru/index.html") == "ru/"
    assert route("assets/index.html.svg") == "assets/index.html.svg"
    old = {"versions": [{"version": version} for version in ["1.0.0-alpha.1", "1.0.0", "1.1.0", "1.2.0", "1.3.0", "1.4.0"]], "warnings": []}
    record = {"version": "1.4.1"}
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
    version = "1.4.1"
    commit = "a" * 40
    install = REPOSITORY + "/tree/" + commit
    release = REPOSITORY + "/releases/tag/v" + version
    suffix = f"skills@1.7.4 add {install} -g --agent universal --skill tibicen-init tibicen-adopt --copy"
    commands = "".join(f'<button data-copy-target="{element}"></button><code id="{element}">{runner} {suffix}</code>' for element, runner in [("install-command", "npx"), ("install-command-pnpm", "pnpm dlx"), ("install-command-yarn", "yarn dlx")])
    bodies = {
        path: f'<html lang="{locale}">Tibicen {version} {release}{commands}</html>'.encode()
        for path, locale in [("index.html", "en"), ("ru/index.html", "ru")]
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
    print("PASS: routes, six immutable records/warnings, one append, static commands/copy targets and rejection")


def main(config_path, output_path):
    config_file = Path(config_path).resolve(strict=True)
    config_bytes = config_file.read_bytes()
    config = json.loads(config_bytes)
    build = Path(config["buildDirectory"]).resolve(strict=True)
    previous_file = Path(config["maintenanceBefore"]).resolve(strict=True)
    previous_bytes = previous_file.read_bytes()
    previous = json.loads(previous_bytes)
    expected = config["publishedRecord"]
    assert expected["version"] == "1.4.1"
    assert expected["releaseNotes"] == REPOSITORY + "/releases/tag/v1.4.1"
    for value in [config["pagesSourceCommit"], expected["sourceCommit"], expected["distributionCommit"]]:
        assert re.fullmatch(r"[a-f0-9]{40}", value)
    assert re.fullmatch(r"[1-9][0-9]*", str(config["pagesRunId"]))
    assert config["pagesDeploymentStatus"] == "success"
    address = config.get("observedPublicIp")
    if address:
        assert ipaddress.ip_address(address).is_global
    files = sorted(path for path in build.rglob("*") if path.is_file())
    assert files and len(files) <= 100, "Unexpected production build size"
    bodies = {}
    for path in files:
        assert not path.is_symlink()
        relative = path.relative_to(build).as_posix()
        assert not any(part.startswith(".") for part in Path(relative).parts)
        bodies[relative] = path.read_bytes()
    check_record(json.loads(bodies["maintenance/index.json"]), previous, expected)
    check_pages(bodies, expected["version"], expected["distributionCommit"])
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
    receipt = {"verdict": "PASS" if all_match else "FAIL", "atUtc": datetime.now(timezone.utc).isoformat(), "configSha256": digest(config_bytes), "maintenanceBeforeSha256": digest(previous_bytes), "pagesSourceCommit": config["pagesSourceCommit"], "pagesRunId": config["pagesRunId"], "pagesDeploymentStatus": config["pagesDeploymentStatus"], "buildProvenance": config["buildProvenance"], "expectedBodyCount": len(results), "matchingBodies": sum(result["match"] for result in results), "enRuAndInstallAndMaintenanceChecksPassed": all_match, "tls": "Normal certificate verification; no authentication, cookies, redirects or retries", "observedPublicIp": address, "results": results, "limits": ["Workflow/deployment facts supplied by root must be independently verified against GitHub; body retrieval alone does not establish deployment identity.", "No report submission, agent loading, application behavior or human usefulness is tested."]}
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
