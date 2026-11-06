#!/usr/bin/env python3
"""Prepare an official Pages artifact for the existing returned-body verifier.

Private, unexecuted release template. Run only in the separately guarded Actions
phase after all literal bindings and this exact script have been reviewed.
"""

from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile
import zipfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main(config_path, work_path):
    config_file = Path(config_path).resolve(strict=True)
    config_bytes = config_file.read_bytes()
    config = json.loads(config_bytes)
    assert config['version'] == '1.4.0'
    assert re.fullmatch(r'[0-9a-f]{40}', config['pagesSourceCommit'])
    assert config['distributionCommit'] == '7b3b08f58276034b1609e44ef393e5f7c0e01a1b'
    assert all(type(config[key]) is int and config[key] > 0 for key in ['pagesRunId', 'artifactId'])
    assert re.fullmatch(r'[0-9a-f]{64}', config['artifactSha256'])
    assert config['pagesDeploymentStatus'] == 'success'
    assert config['publishedRecord']['version'] == '1.4.0'
    assert config['publishedRecord']['distributionCommit'] == config['distributionCommit']
    previous_path = Path('.release-1.4/maintenance-before.json').resolve(strict=True)
    previous_bytes = previous_path.read_bytes()
    assert sha(previous_bytes) == config['maintenanceBeforeSha256']
    assert len(json.loads(previous_bytes)['versions']) == 5
    work = Path(work_path).resolve()
    assert Path(os.environ['RUNNER_TEMP']).resolve() in work.parents
    work.mkdir(mode=0o700, exist_ok=False)
    home = work / 'api-home'
    home.mkdir(mode=0o700)
    token = os.environ['GH_TOKEN']
    assert token
    api_env = {
        'HOME': str(home), 'XDG_CONFIG_HOME': str(home), 'PATH': os.environ['PATH'],
        'GH_TOKEN': token, 'GH_HOST': 'github.com', 'GH_PROMPT_DISABLED': '1',
        'GH_PAGER': 'cat', 'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8',
    }
    requests = []

    def api(endpoint, destination, binary=False):
        result = subprocess.run(
            ['gh', 'api', '--method', 'GET', endpoint,
             '-H', 'X-GitHub-Api-Version: 2026-03-10'],
            env=api_env, capture_output=True, timeout=60, check=False,
        )
        request = {'endpoint': endpoint, 'exitCode': result.returncode,
                   'stdoutBytes': len(result.stdout), 'stderrSha256': sha(result.stderr)}
        requests.append(request)
        (work / 'api-requests.json').write_text(json.dumps(requests, indent=2) + '\n')
        assert result.returncode == 0, f'GitHub GET failed with exit {result.returncode}; no retry'
        assert len(result.stdout) <= (10 * 1024 * 1024 if binary else 2 * 1024 * 1024)
        assert token.encode() not in result.stdout
        destination.write_bytes(result.stdout)
        return None if binary else json.loads(result.stdout)

    prefix = 'repos/warbr1ng3r/tibicen'
    run = api(f'{prefix}/actions/runs/{config["pagesRunId"]}', work / 'pages-run.json')
    assert run['id'] == config['pagesRunId']
    assert (run['head_sha'], run['head_branch'], run['path'], run['event']) == (
        config['pagesSourceCommit'], 'main', '.github/workflows/pages.yml', 'workflow_dispatch')
    assert (run['status'], run['conclusion'], run['run_attempt']) == ('completed', 'success', 1)
    jobs = api(f'{prefix}/actions/runs/{config["pagesRunId"]}/jobs?per_page=100', work / 'pages-jobs.json')
    assert jobs['total_count'] == len(jobs['jobs']) == 2
    assert {job['name'] for job in jobs['jobs']} == {'build', 'deploy'}
    assert all((job['status'], job['conclusion']) == ('completed', 'success') for job in jobs['jobs'])
    artifact = api(f'{prefix}/actions/artifacts/{config["artifactId"]}', work / 'artifact-metadata.json')
    assert artifact['id'] == config['artifactId'] and artifact['name'] == 'github-pages'
    assert artifact['expired'] is False
    assert artifact['digest'] == 'sha256:' + config['artifactSha256']
    assert (artifact['workflow_run']['id'], artifact['workflow_run']['head_sha']) == (
        config['pagesRunId'], config['pagesSourceCommit'])
    assert 0 < artifact['size_in_bytes'] <= 10 * 1024 * 1024
    archive = work / 'official-github-pages.zip'
    api(f'{prefix}/actions/artifacts/{config["artifactId"]}/zip', archive, binary=True)
    data = archive.read_bytes()
    assert len(data) == artifact['size_in_bytes'] and sha(data) == config['artifactSha256']
    with zipfile.ZipFile(io.BytesIO(data)) as zipped:
        entries = zipped.infolist()
        assert len(entries) == 1 and entries[0].filename == 'artifact.tar'
        entry = entries[0]
        assert not entry.is_dir() and not entry.flag_bits & 1
        assert (entry.external_attr >> 16) & 0o170000 in [0, 0o100000]
        assert entry.file_size <= 16 * 1024 * 1024
        tar_data = zipped.read(entry)
    site = work / 'official-site'
    site.mkdir(mode=0o700)
    inventory = {}
    total_bytes = 0
    with tarfile.open(fileobj=io.BytesIO(tar_data), mode='r:') as archived:
        for entry in archived.getmembers():
            name = PurePosixPath(entry.name)
            assert not name.is_absolute() and '..' not in name.parts
            if entry.isdir():
                continue
            assert entry.isfile() and name.parts and not any(part.startswith('.') for part in name.parts)
            relative = name.as_posix()
            assert relative not in inventory and entry.size <= 2 * 1024 * 1024
            total_bytes += entry.size
            assert total_bytes <= 16 * 1024 * 1024 and len(inventory) < 100
            body = archived.extractfile(entry).read()
            assert len(body) == entry.size and token.encode() not in body
            destination = site.joinpath(*name.parts)
            destination.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
            destination.write_bytes(body)
            destination.chmod(0o600)
            inventory[relative] = {'bytes': len(body), 'sha256': sha(body), 'archiveMode': oct(entry.mode)}
    assert {'index.html', 'ru/index.html', 'maintenance/index.json'} <= inventory.keys()
    (work / 'artifact-inventory.json').write_text(json.dumps(inventory, indent=2) + '\n')
    provenance = {
        'atUtc': datetime.now(timezone.utc).isoformat(), 'source': 'actual official GitHub Actions artifact',
        'pagesRunId': config['pagesRunId'], 'pagesSourceCommit': config['pagesSourceCommit'],
        'artifactId': config['artifactId'], 'zipBytes': len(data), 'zipSha256': sha(data),
        'tarSha256': sha(tar_data), 'regularFiles': len(inventory), 'safeUnpackWithoutExecution': True,
        'apiDownloadAttempts': 1, 'localRebuildUsed': False,
        'limits': ['A successful deploy job is checked; separate deployment-object provenance remains root-reviewed input.'],
    }
    (work / 'artifact-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
    returned_config = {
        'buildDirectory': str(site), 'maintenanceBefore': str(previous_path),
        'publishedRecord': config['publishedRecord'], 'pagesSourceCommit': config['pagesSourceCommit'],
        'pagesRunId': config['pagesRunId'], 'pagesDeploymentStatus': 'success',
        'observedPublicIp': config.get('observedPublicIp'),
        'buildProvenance': f'Official artifact {config["artifactId"]}, SHA256 {sha(data)}, run {config["pagesRunId"]}, source {config["pagesSourceCommit"]}; API digest and safe inventory verified without rebuilding.',
    }
    returned_config_path = work / 'returned-config.json'
    returned_config_path.write_text(json.dumps(returned_config, indent=2) + '\n')
    verifier = Path('.release-1.4/pages-verify-returned.py').resolve(strict=True)
    result = subprocess.run([sys.executable, str(verifier), str(returned_config_path), str(work / 'returned-check')], timeout=180, check=False)
    receipt_bytes = (work / 'returned-check/receipt.json').read_bytes()
    receipt = json.loads(receipt_bytes)
    assert result.returncode == 0 and receipt['verdict'] == 'PASS'
    summary = {'verdict': 'PASS', 'artifactId': config['artifactId'], 'artifactSha256': sha(data),
               'pagesRunId': config['pagesRunId'], 'pagesSourceCommit': config['pagesSourceCommit'],
               'expectedBodies': receipt['expectedBodyCount'], 'matchingBodies': receipt['matchingBodies'],
               'configSha256': sha(config_bytes), 'nativeOrModelCompatibilityTested': False,
               'artifactProvenance': provenance,
               'artifactInventorySha256': sha((work / 'artifact-inventory.json').read_bytes()),
               'returnedReceiptSha256': sha(receipt_bytes),
               'maintenanceBeforeSha256': receipt['maintenanceBeforeSha256'],
               'results': [{key: value for key, value in item.items() if key != 'stderr'}
                           for item in receipt['results']],
               'limits': receipt['limits']}
    compact = json.dumps(summary, separators=(',', ':'))
    assert token not in compact
    assert not re.search(r'/Users/|/private/|/var/folders/|/home/runner/|[A-Za-z]:\\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', compact)
    (work / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(compact)
    notice = compact.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    print('::notice title=Tibicen Pages returned-body audit::' + notice)
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as output:
        output.write('```json\n' + compact + '\n```\n')


if __name__ == '__main__':
    try:
        main(*sys.argv[1:])
    except Exception as error:
        print(f'Pages audit stopped: {type(error).__name__}. No scripted retry, rebuild or deployment occurred.', file=sys.stderr)
        raise SystemExit(1)
