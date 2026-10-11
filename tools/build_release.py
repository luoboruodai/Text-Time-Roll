#!/usr/bin/env python3
"""Build a deterministic, allowlisted install ZIP with a SHA-256 sidecar."""
import argparse
import hashlib
import re
import zipfile
from pathlib import Path
from release_manifest import ROOT, VERSION, RELEASE_FILES, ZIP_ROOT, ZIP_NAME


def build(output):
    from audit_public import audit_worktree
    audit_worktree()
    source = (ROOT / 'src/Text Time Roll.js').read_text(encoding='ascii')
    if re.search(r"var VERSION = '([^']+)';", source).group(1) != VERSION:
        raise ValueError('Source and package versions differ')
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    archive = output / ZIP_NAME
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as z:
        for destination, source in sorted(RELEASE_FILES.items()):
            info = zipfile.ZipInfo(ZIP_ROOT + destination, (2026, 10, 12, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_STORED
            z.writestr(info, (ROOT / source).read_bytes())
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    (output / 'SHA256SUMS.txt').write_bytes((digest + '  ' + archive.name + '\n').encode('ascii'))
    return archive, digest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    archive, digest = build(args.output)
    print(archive.name + '\nSHA256 ' + digest)
