#!/usr/bin/env python3
"""Retrieve only the existing failed audit's logs and retained JSON evidence."""
import base64
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import zipfile

PREFIX = "repos/warbr1ng3r/tibicen"
AUDIT_RUN = 42172383940
AUDIT_COMMIT = "ef7f819ba8be7953d21efa4df09dd6e6ad2eb006"
AUDIT_JOB = 127742966717
SELECTED = {
    "api-requests.json", "pages-run.json", "pages-jobs.json", "artifact-metadata.json",
    "artifact-provenance.json", "artifact-inventory.json", "returned-config.json",
    "returned-check/receipt.json", "summary.json", "notice-manifest.json",
}
PRIVATE = re.compile(r"/Users/|/private/|/var/folders/|/home/runner/|[A-Za-z]:\\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def need(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def sanitize(value, token):
    text = str(value).replace(token, "[token-redacted]")
    text = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", text)
    text = re.sub(r"(?i)(authorization\s*:\s*(?:bearer|token)\s+)\S+", r"\1[redacted]", text)
    text = re.sub(r"(?i)\b([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY)[A-Z0-9_]*\s*[:=]\s*)\S+", r"\1[redacted]", text)
    text = re.sub(r"\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]+", "[token-redacted]", text)
    text = re.sub(r"\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b", "[token-redacted]", text)
    text = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[contact-redacted]", text)
    text = re.sub(r"(?<![A-Za-z0-9:/])/(?:Users|private|var|home|tmp|opt|root|usr)(?:/[^\s\"'<>]*)?", "[absolute-path-redacted]", text)
    text = re.sub(r"[A-Za-z]:\\[^\s\"'<>]*", "[absolute-path-redacted]", text)
    return "".join(char for char in text if ord(char) >= 32 or char in "\n\t")


def safe_value(value, token):
    if isinstance(value, str):
        return sanitize(value, token)[:300]
    if isinstance(value, list):
        return [safe_value(item, token) for item in value[:12]]
    if isinstance(value, dict):
        return {sanitize(key, token)[:120]: safe_value(item, token) for key, item in list(value.items())[:20]}
    return value if value is None or type(value) in (bool, int, float) else type(value).__name__


def json_value(data):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            need(key not in result, "Duplicate JSON key")
            result[key] = value
        return result

    def invalid(_):
        raise ValueError("Nonfinite JSON")

    return json.loads(data.decode("utf-8"), object_pairs_hook=unique, parse_constant=invalid)


def read_selected(data, token):
    files, parsed, members = [], {}, []
    with zipfile.ZipFile(io.BytesIO(data)) as bundle:
        entries = bundle.infolist()
        need(0 < len(entries) <= 150, "Unexpected retained ZIP member count")
        names, total = set(), 0
        for entry in entries:
            name = entry.filename.rstrip("/") if entry.is_dir() else entry.filename
            path = PurePosixPath(name)
            need(path.parts and not path.is_absolute() and ".." not in path.parts and path.as_posix() == name, "Unsafe retained ZIP path")
            need("\\" not in name and not re.match(r"^[A-Za-z]:", name) and all(32 <= ord(c) != 127 for c in name), "Unsafe retained ZIP filename")
            need(name not in names and not entry.flag_bits & 1, "Duplicate or encrypted retained ZIP entry")
            need((entry.external_attr >> 16) & 0o170000 in (0, 0o100000, 0o040000), "Retained ZIP contains a link or special file")
            total += entry.file_size
            need(0 <= entry.file_size <= 10 * 1024 * 1024 and total <= 20 * 1024 * 1024, "Retained ZIP inventory exceeds bounds")
            names.add(name)
            members.append(name)
            if name not in SELECTED:
                continue
            need(not entry.is_dir() and entry.file_size <= 2 * 1024 * 1024, "Selected JSON exceeds bounds")
            raw = bundle.read(entry)
            need(len(raw) == entry.file_size, "Selected JSON length mismatch")
            row = {"path": name, "bytes": len(raw), "sha256": sha(raw)}
            try:
                parsed[name] = json_value(raw)
                row["jsonParseStatus"] = "valid"
                row["jsonType"] = type(parsed[name]).__name__
            except (ValueError, UnicodeError) as error:
                row["jsonParseStatus"] = "invalid-" + type(error).__name__
            files.append(row)
    need(files, "Retained bundle has none of the selected JSON evidence")
    stages = {}
    for name in sorted(SELECTED):
        if name not in parsed:
            stages[name] = {"state": "absent-or-invalid"}
            continue
        value = parsed[name]
        if name == "api-requests.json" and isinstance(value, list):
            stages[name] = {"state": "present", "requestCount": len(value), "requests": [safe_value({k: item[k] for k in ("endpoint", "exitCode", "stdoutBytes", "stderrSha256") if k in item}, token) for item in value[-8:] if isinstance(item, dict)]}
        elif name == "artifact-inventory.json" and isinstance(value, dict):
            stages[name] = {"state": "present", "fileCount": len(value), "entries": [{"path": sanitize(path, token)[:180], **safe_value(item, token)} for path, item in list(value.items())[:12] if isinstance(item, dict)], "additionalEntriesNotEmitted": max(0, len(value) - 12)}
        elif name == "returned-check/receipt.json" and isinstance(value, dict):
            results = value.get("results", [])
            failed = [item for item in results if isinstance(item, dict) and item.get("match") is not True] if isinstance(results, list) else []
            stages[name] = {"state": "present", **safe_value({k: value[k] for k in ("verdict", "expectedBodyCount", "matchingBodies", "maintenanceBeforeSha256", "pagesSourceCommit", "pagesRunId", "pagesDeploymentStatus", "limits") if k in value}, token), "resultsCount": len(results) if isinstance(results, list) else None, "failedResults": [safe_value(item, token) for item in failed[:4]], "additionalFailedResultsNotEmitted": max(0, len(failed) - 4)}
        elif isinstance(value, dict):
            keys = ("id", "name", "status", "conclusion", "head_sha", "head_branch", "path", "event", "run_attempt", "digest", "size_in_bytes", "expired", "workflow_run", "atUtc", "source", "pagesRunId", "pagesSourceCommit", "artifactId", "zipBytes", "zipSha256", "tarSha256", "regularFiles", "safeUnpackWithoutExecution", "apiDownloadAttempts", "localRebuildUsed", "limits", "verdict", "expectedBodies", "matchingBodies", "configSha256", "artifactSha256", "returnedReceiptSha256", "artifactInventorySha256")
            stages[name] = {"state": "present", "fields": safe_value({k: value[k] for k in keys if k in value}, token)}
        else:
            stages[name] = {"state": "present", "jsonType": type(value).__name__}
    return files, stages, len(members), len([name for name in members if name not in SELECTED])


def log_excerpt(raw, token):
    lines = raw.decode("utf-8", errors="replace").splitlines()
    stop = next((index + 1 for index, line in enumerate(lines) if "Process completed with exit code 1" in line), len(lines))
    chosen = lines[max(0, stop - 45):stop]
    return {"rawBytes": len(raw), "rawSha256": sha(raw), "rawLines": len(lines), "excerptKind": "up to 45 lines ending at first exit-1 marker, otherwise final 45 lines", "sanitizedLines": [sanitize(line, token)[:200] for line in chosen]}


def packet(data, artifact):
    encoded = base64.b64encode(data).decode("ascii")
    parts = [encoded[index:index + 3000] for index in range(0, len(encoded), 3000)]
    need(1 <= len(parts) <= 8, "Sanitized diagnosis exceeds bounded notice protocol")
    manifest = {"schema": 1, "encoding": "base64-utf8", "summarySha256": sha(data), "summaryBytes": len(data), "partCount": len(parts), "sourceAuditRunId": AUDIT_RUN, "sourceAuditCommit": AUDIT_COMMIT, "sourceJobId": AUDIT_JOB, "sourceArtifactId": artifact["id"], "sourceArtifactSha256": artifact["digest"].removeprefix("sha256:")}
    return manifest, parts


def main(output_path):
    output = Path(output_path).resolve()
    need(Path(os.environ["RUNNER_TEMP"]).resolve() in output.parents, "Output must be a new owned runner-temp directory")
    output.mkdir(mode=0o700, exist_ok=False)
    home = output / "api-home"
    home.mkdir(mode=0o700)
    token = os.environ["GH_TOKEN"]
    need(bool(token), "Missing read-only token")
    env = {"HOME": str(home), "XDG_CONFIG_HOME": str(home), "PATH": os.environ["PATH"], "GH_TOKEN": token, "GH_HOST": "github.com", "GH_PROMPT_DISABLED": "1", "GH_PAGER": "cat", "LANG": "C.UTF-8", "LC_ALL": "C.UTF-8"}
    requests = []

    def get(endpoint, limit=2 * 1024 * 1024, binary=False):
        need(endpoint not in {item["endpoint"] for item in requests}, "No request retry is permitted")
        result = subprocess.run(["gh", "api", "--method", "GET", PREFIX + endpoint, "-H", "X-GitHub-Api-Version: 2026-03-10"], env=env, capture_output=True, timeout=60, check=False)
        requests.append({"endpoint": endpoint, "exitCode": result.returncode, "stdoutBytes": len(result.stdout), "stderrBytes": len(result.stderr), "stderrSha256": sha(result.stderr)})
        (output / "api-requests.json").write_text(json.dumps(requests, indent=2) + "\n")
        need(result.returncode == 0 and 0 < len(result.stdout) <= limit, "Read-only GET failed or exceeded its byte limit; no retry")
        return result.stdout if binary else json_value(result.stdout)

    run = get(f"/actions/runs/{AUDIT_RUN}")
    need((run["id"], run["head_sha"], run["head_branch"], run["path"], run["event"], run["run_attempt"], run["status"], run["conclusion"]) == (AUDIT_RUN, AUDIT_COMMIT, "codex/release-1.4.1-ops", ".github/workflows/release-1.4.1-ops.yml", "push", 1, "completed", "failure"), "Wrong failed audit identity")
    jobs = get(f"/actions/runs/{AUDIT_RUN}/jobs?per_page=100")
    need(jobs["total_count"] == len(jobs["jobs"]) == 4 and {j["name"] for j in jobs["jobs"]} == {"checks", "publish", "pages", "pages-audit"}, "Wrong failed audit job set")
    audit = next(job for job in jobs["jobs"] if job["name"] == "pages-audit")
    need((audit["id"], audit["run_id"], audit["head_sha"], audit["run_attempt"], audit["status"], audit["conclusion"]) == (AUDIT_JOB, AUDIT_RUN, AUDIT_COMMIT, 1, "completed", "failure"), "Wrong failed audit job")
    need(all((job["status"], job["conclusion"]) == ("completed", "skipped") for job in jobs["jobs"] if job != audit), "Another original phase ran")
    need(audit["check_run_url"] == f"https://api.github.com/{PREFIX}/check-runs/{AUDIT_JOB}", "Wrong failed job check URL")
    check = get(f"/check-runs/{AUDIT_JOB}")
    need((check["id"], check["head_sha"], check["name"], check["status"], check["conclusion"], check["check_suite"]["id"]) == (AUDIT_JOB, AUDIT_COMMIT, "pages-audit", "completed", "failure", run["check_suite_id"]), "Wrong failed job check identity")
    need((check["app"]["id"], check["app"]["slug"], check["app"]["owner"]["login"]) == (15368, "github-actions", "github"), "Wrong Actions app")
    logs = get(f"/actions/jobs/{AUDIT_JOB}/logs", binary=True)
    listing = get(f"/actions/runs/{AUDIT_RUN}/artifacts?per_page=100")
    need(listing["total_count"] == len(listing["artifacts"]) == 1, "Require the sole retained artifact of the failed audit")
    observed = listing["artifacts"][0]
    need(type(observed["id"]) is int and observed["id"] > 0, "Invalid retained artifact ID")
    artifact = get(f"/actions/artifacts/{observed['id']}")
    for key in ["id", "name", "size_in_bytes", "digest", "expired", "workflow_run"]:
        need(artifact[key] == observed[key], "Retained artifact list/metadata mismatch")
    need(artifact["name"] == f"tibicen-1.4.1-pages-audit-{AUDIT_RUN}" and artifact["expired"] is False, "Wrong or expired retained bundle")
    need(type(artifact["size_in_bytes"]) is int and 0 < artifact["size_in_bytes"] <= 10 * 1024 * 1024 and re.fullmatch(r"sha256:[0-9a-f]{64}", artifact["digest"]), "Invalid retained bundle size/digest")
    need((artifact["workflow_run"]["id"], artifact["workflow_run"]["head_sha"]) == (AUDIT_RUN, AUDIT_COMMIT), "Bundle is not from the failed audit")
    bundle = get(f"/actions/artifacts/{artifact['id']}/zip", limit=10 * 1024 * 1024, binary=True)
    need(len(bundle) == artifact["size_in_bytes"] and "sha256:" + sha(bundle) == artifact["digest"], "Returned retained bundle bytes/digest mismatch")
    files, stages, member_count, unselected_count = read_selected(bundle, token)
    diagnosis = {"status": "retained-failed-audit-evidence", "sourceAuditRunId": AUDIT_RUN, "sourceAuditCommit": AUDIT_COMMIT, "sourceJobId": AUDIT_JOB, "sourceAuditConclusion": "failure", "pagesAcceptance": "not-established-by-this-diagnosis", "logEvidence": log_excerpt(logs, token), "sourceArtifact": {key: artifact[key] for key in ["id", "name", "size_in_bytes", "digest"]}, "sourceArtifactBytesVerified": True, "zipMembers": member_count, "unselectedMembersNotRead": unselected_count, "selectedJsonFiles": files, "stageReceipts": stages, "cause": "not-inferred-by-courier", "logDownloads": 1, "retainedBundleDownloads": 1, "newAuditOrDeployOrPublicationOrPublicBodyRequests": False, "nativeOrModelCompatibilityTested": False}
    data = (json.dumps(diagnosis, separators=(",", ":")) + "\n").encode("utf-8")
    need(token.encode() not in data and not PRIVATE.search(data.decode()), "Sanitized diagnosis still contains private data")
    manifest, parts = packet(data, artifact)
    (output / "diagnosis.json").write_bytes(data)
    (output / "notice-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    receipt = {"status": "retained-existing-failed-audit-not-pages-acceptance", "sourceAuditRunId": AUDIT_RUN, "sourceAuditCommit": AUDIT_COMMIT, "sourceJobId": AUDIT_JOB, "sourceAuditConclusion": "failure", "diagnosisSha256": sha(data), "diagnosisBytes": len(data), "requests": requests, "newAuditOrDeployOrPublicationOrPublicBodyRequests": False}
    (output / "courier-receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print("::notice title=Tibicen Pages diagnosis manifest::" + json.dumps(manifest, separators=(",", ":")))
    for index, part in enumerate(parts, 1):
        print(f"::notice title=Tibicen Pages diagnosis part {index}/{len(parts)}::" + part)
    with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as target:
        target.write("Retained existing failed audit evidence only. Original audit conclusion remains failure; no Pages acceptance or rerun.\n\n```json\n" + json.dumps(receipt, separators=(",", ":")) + "\n```\n")


if __name__ == "__main__":
    try:
        main(*sys.argv[1:])
    except Exception as error:
        print(f"Failed-audit evidence courier stopped: {type(error).__name__}. No retry, audit, body request or deployment rerun.", file=sys.stderr)
        raise SystemExit(1)
