#!/usr/bin/env python3
"""Retain an already completed audit; never repeat its artifact/body checks."""

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

PREFIX = 'repos/warbr1ng3r/tibicen'
AUDIT_RUN = 42137552667
AUDIT_COMMIT = '5ef7100f453cf96f3be90f3c2f5200ec662455e6'
CHECK_RUN = 127629445499
BUNDLE_ID = 13465938323
BUNDLE_SHA = 'c494e5785ae25226fb6c9299c09c65d6a674b8fb5c96145e203422a423f933f1'
BUNDLE_BYTES = 171820
PAGES_RUN = 42136931904
PAGES_SOURCE = 'e1487697d264eb9e14a03466550342f1ddd105dc'
PAGES_ARTIFACT = 13465038486
PAGES_SHA = 'fc5f717f1278308aa7c08efa55a7b6990fc7d4c78872ad429b14b1623b36f6e4'
CONFIG_SHA = '7b627faeac3b0832fcca2bb3e0abee8c1f73a74cf49f63598b884798c1927fd5'
PREVIOUS_SHA = '62666d334972d1377825b718f0e3c03c2cfbb153e9428a50a2a2dd804defd2f4'
UNSAFE = re.compile(r'/Users/|/private/|/var/folders/|/home/runner/|[A-Za-z]:\\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_bundle(data):
    with zipfile.ZipFile(io.BytesIO(data)) as zipped:
        entries = zipped.infolist()
        assert 0 < len(entries) <= 150
        names = set()
        total = 0
        for entry in entries:
            path = PurePosixPath(entry.filename)
            assert not path.is_absolute() and '..' not in path.parts and path.parts
            assert '\\' not in entry.filename and '\x00' not in entry.filename
            assert entry.filename not in names and not entry.flag_bits & 1
            assert (entry.external_attr >> 16) & 0o170000 in [0, 0o100000, 0o040000]
            assert 0 <= entry.file_size <= 10 * 1024 * 1024
            total += entry.file_size
            assert total <= 20 * 1024 * 1024
            names.add(entry.filename)
        assert {'summary.json', 'returned-check/receipt.json'} <= names
        return zipped.read('summary.json'), zipped.read('returned-check/receipt.json')


def validate_summary(data, receipt_data, token):
    text = data.decode('utf-8')
    assert token and token not in text and not UNSAFE.search(text)
    value = json.loads(text)
    assert value['verdict'] == 'PASS' and value['nativeOrModelCompatibilityTested'] is False
    assert (value['pagesRunId'], value['pagesSourceCommit']) == (PAGES_RUN, PAGES_SOURCE)
    assert (value['artifactId'], value['artifactSha256']) == (PAGES_ARTIFACT, PAGES_SHA)
    assert value['configSha256'] == CONFIG_SHA and value['maintenanceBeforeSha256'] == PREVIOUS_SHA
    assert value['returnedReceiptSha256'] == sha(receipt_data)
    assert re.fullmatch(r'[0-9a-f]{64}', value['artifactInventorySha256'])
    receipt = json.loads(receipt_data.decode('utf-8'))
    assert (receipt['verdict'], receipt['expectedBodyCount'], receipt['matchingBodies']) == ('PASS', 18, 18)
    assert (receipt['pagesRunId'], receipt['pagesSourceCommit'], receipt['pagesDeploymentStatus']) == (PAGES_RUN, PAGES_SOURCE, 'success')
    assert receipt['maintenanceBeforeSha256'] == PREVIOUS_SHA and receipt['observedPublicIp'] is None
    assert [{k: v for k, v in item.items() if k != 'stderr'} for item in receipt['results']] == value['results']
    assert value['expectedBodies'] == value['matchingBodies'] == len(value['results']) == 18
    names = set()
    for item in value['results']:
        path = PurePosixPath(item['path'])
        assert path.parts and not path.is_absolute() and '..' not in path.parts
        assert item['path'] not in names
        names.add(item['path'])
        assert item['url'].startswith('https://warbr1ng3r.github.io/tibicen/')
        assert (item['exitCode'], item['httpStatus'], item['match']) == (0, '200', True)
        assert item['actualBytes'] == item['expectedBytes'] and type(item['actualBytes']) is int
        assert re.fullmatch(r'[0-9a-f]{64}', item['actualSha256'])
        assert item['actualSha256'] == item['expectedSha256']
    assert {'index.html', 'ru/index.html', 'maintenance/index.json'} <= names
    provenance = value['artifactProvenance']
    assert (provenance['pagesRunId'], provenance['pagesSourceCommit'], provenance['artifactId']) == (PAGES_RUN, PAGES_SOURCE, PAGES_ARTIFACT)
    assert provenance['zipSha256'] == PAGES_SHA and provenance['regularFiles'] == 18
    assert provenance['apiDownloadAttempts'] == 1 and provenance['safeUnpackWithoutExecution'] is True
    assert provenance['localRebuildUsed'] is False
    return value


def packet(data):
    encoded = base64.b64encode(data).decode('ascii')
    parts = [encoded[index:index + 3000] for index in range(0, len(encoded), 3000)]
    assert 1 <= len(parts) <= 8 and all(0 < len(part) <= 3000 for part in parts)
    manifest = {'schema': 1, 'encoding': 'base64-utf8', 'summarySha256': sha(data),
                'summaryBytes': len(data), 'partCount': len(parts), 'sourceAuditRunId': AUDIT_RUN,
                'sourceAuditCommit': AUDIT_COMMIT, 'sourceArtifactId': BUNDLE_ID,
                'sourceArtifactSha256': BUNDLE_SHA}
    return manifest, parts


def main(output_path):
    output = Path(output_path).resolve()
    assert Path(os.environ['RUNNER_TEMP']).resolve() in output.parents
    output.mkdir(mode=0o700, exist_ok=False)
    token = os.environ['GH_TOKEN']
    assert token
    api_env = {'PATH': os.environ['PATH'], 'HOME': os.environ['HOME'], 'GH_TOKEN': token, 'GH_HOST': 'github.com',
               'GH_PROMPT_DISABLED': '1', 'GH_PAGER': 'cat', 'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8'}
    requests = []

    def get(endpoint, binary=False):
        result = subprocess.run(['gh', 'api', '--method', 'GET', PREFIX + endpoint,
                                 '-H', 'X-GitHub-Api-Version: 2026-03-10'],
                                env=api_env, capture_output=True, timeout=60, check=False)
        requests.append({'endpoint': endpoint, 'exitCode': result.returncode,
                         'stdoutBytes': len(result.stdout), 'stderrSha256': sha(result.stderr)})
        assert result.returncode == 0 and len(result.stdout) <= 2 * 1024 * 1024
        assert token.encode() not in result.stdout
        return result.stdout if binary else json.loads(result.stdout)

    run = get(f'/actions/runs/{AUDIT_RUN}')
    assert (run['id'], run['head_sha'], run['head_branch'], run['path'], run['event'], run['run_attempt']) == (
        AUDIT_RUN, AUDIT_COMMIT, 'codex/release-1.4-ops', '.github/workflows/release-1.4-ops.yml', 'push', 1)
    assert (run['status'], run['conclusion']) == ('completed', 'success')
    jobs = get(f'/actions/runs/{AUDIT_RUN}/jobs?per_page=100')
    assert jobs['total_count'] == len(jobs['jobs']) == 4
    assert {job['name'] for job in jobs['jobs']} == {'checks', 'publish', 'pages', 'pages-audit'}
    audit = next(job for job in jobs['jobs'] if job['name'] == 'pages-audit')
    assert (audit['status'], audit['conclusion']) == ('completed', 'success')
    assert audit['check_run_url'] == f'https://api.github.com/{PREFIX}/check-runs/{CHECK_RUN}'
    assert all((job['status'], job['conclusion']) == ('completed', 'skipped') for job in jobs['jobs'] if job != audit)
    check = get(f'/check-runs/{CHECK_RUN}')
    assert (check['id'], check['head_sha'], check['name'], check['status'], check['conclusion']) == (
        CHECK_RUN, AUDIT_COMMIT, 'pages-audit', 'completed', 'success')
    assert (check['app']['id'], check['app']['slug'], check['app']['owner']['login']) == (15368, 'github-actions', 'github')
    assert check['check_suite']['id'] == run['check_suite_id']
    artifact = get(f'/actions/artifacts/{BUNDLE_ID}')
    assert (artifact['id'], artifact['name'], artifact['size_in_bytes'], artifact['digest'], artifact['expired']) == (
        BUNDLE_ID, f'tibicen-1.4-pages-audit-{AUDIT_RUN}', BUNDLE_BYTES, 'sha256:' + BUNDLE_SHA, False)
    assert (artifact['workflow_run']['id'], artifact['workflow_run']['head_sha']) == (AUDIT_RUN, AUDIT_COMMIT)
    data = get(f'/actions/artifacts/{BUNDLE_ID}/zip', binary=True)
    assert len(data) == BUNDLE_BYTES and sha(data) == BUNDLE_SHA
    summary_data, receipt_data = read_bundle(data)
    summary = validate_summary(summary_data, receipt_data, token)
    manifest, parts = packet(summary_data)
    receipt = {'status': 'retained-existing-audit-summary', 'sourceArtifactDownloadAttempts': 1,
               'summarySha256': sha(summary_data), 'summaryBytes': len(summary_data),
               'sourceAuditRunId': AUDIT_RUN, 'sourceAuditCommit': AUDIT_COMMIT,
               'sourceArtifactId': BUNDLE_ID, 'sourceArtifactSha256': BUNDLE_SHA,
               'expectedBodies': summary['expectedBodies'], 'matchingBodies': summary['matchingBodies'],
               'publicIp': None, 'requests': requests, 'auditOrPagesOrBodyRerun': False,
               'nativeOrModelCompatibilityTested': False}
    (output / 'summary.json').write_bytes(summary_data)
    (output / 'notice-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    (output / 'courier-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print('::notice title=Tibicen Pages audit manifest::' + json.dumps(manifest, separators=(',', ':')))
    for index, part in enumerate(parts, 1):
        print(f'::notice title=Tibicen Pages audit part {index}/{len(parts)}::' + part)
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as target:
        target.write('Retained the existing successful audit summary without repeating audit/Pages/body requests.\n\n```json\n' + json.dumps(receipt, separators=(',', ':')) + '\n```\n')


if __name__ == '__main__':
    try:
        main(*sys.argv[1:])
    except Exception as error:
        print(f'Audit receipt courier stopped: {type(error).__name__}. No retry or audit rerun.', file=sys.stderr)
        raise SystemExit(1)
