#!/usr/bin/env python3
"""Defense-in-depth checks; never print matched secret values. Human review is still required."""
import argparse
import hashlib
import re
import subprocess
import zipfile
from pathlib import Path
from release_manifest import ROOT, PUBLIC_FILES, RELEASE_FILES, ZIP_ROOT, ZIP_NAME

PATTERNS = (
    ('private-key', re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----')),
    ('github-token', re.compile(r'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{35,})')),
    ('api-token', re.compile(r'\bsk-[A-Za-z0-9_-]{24,}\b')),
    ('cloud-key', re.compile(r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b')),
    ('credential-url', re.compile(r'https?://[^\s/\"\']+:[^\s/@\"\']+@')),
    ('machine-home-path', re.compile(r'/(?:Users|home)/[^/\s\"\'<>]+/')),
    ('windows-home-path', re.compile(r'[A-Za-z]:[\\/]Users[\\/][^\s\"\'<>]+', re.I)),
    ('assigned-secret', re.compile(r'(?i)(?:api[_-]?key|access[_-]?token|password)\s*[:=]\s*[\"\'][A-Za-z0-9_+/=-]{20,}[\"\']')),
)


def scan_content(name, content, extra=()):
    text = content.decode('utf-8')
    issues = [label for label, pattern in PATTERNS if pattern.search(text)]
    if '\ufffd' in text:
        issues.append('replacement-character')
    if any(phrase and phrase in text for phrase in extra):
        issues.append('private-phrase')
    if issues:
        raise ValueError(name + ': blocked by ' + ', '.join(issues))


def scan_files(files, extra=()):
    for name, content in files.items():
        if name not in PUBLIC_FILES:
            raise ValueError(name + ': not on public allowlist')
        scan_content(name, content, extra)


def private_phrases():
    # Optional LOCAL-only additions are never copied to a release.
    path = ROOT / 'private' / 'audit-extra.txt'
    return path.read_text(encoding='utf-8').splitlines() if path.exists() else ()


def audit_worktree():
    data = {}
    for name in PUBLIC_FILES:
        path = ROOT / name
        if path.is_symlink() or not path.is_file():
            raise ValueError(name + ': missing or symlinked public file')
        data[name] = path.read_bytes()
    scan_files(data, private_phrases())
    return len(data)


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def audit_git():
    # Check staged blobs, not only worktree contents.
    names = git('ls-files', '-z').decode('utf-8').strip('\0').split('\0')
    scan_files({n: git('show', ':' + n) for n in names if n}, private_phrases())
    revisions = git('rev-list', '--all').decode('ascii').splitlines()
    checked = set()
    for rev in revisions:
        for entry in git('ls-tree', '-rz', '--full-tree', rev).split(b'\0'):
            if not entry:
                continue
            header, name = entry.split(b'\t', 1)
            mode, kind, oid = header.split()
            name = name.decode('utf-8')
            if mode not in (b'100644', b'100755') or kind != b'blob' or name not in PUBLIC_FILES:
                raise ValueError(name + ': unsafe historical entry')
            key = (name, oid)
            if key not in checked:
                scan_content(name, git('cat-file', 'blob', oid.decode('ascii')), private_phrases())
                checked.add(key)
    return len(checked)


def audit_archive(directory):
    directory = Path(directory)
    archive = directory / ZIP_NAME
    expected = {ZIP_ROOT + dest: src for dest, src in RELEASE_FILES.items()}
    with zipfile.ZipFile(archive) as z:
        if len(z.namelist()) != len(expected) or set(z.namelist()) != set(expected):
            raise ValueError('Unexpected release archive members')
        for name, source in expected.items():
            data = z.read(name)
            scan_content(name, data, private_phrases())
            if data != (ROOT / source).read_bytes():
                raise ValueError(name + ': release differs from source')
    expected_sum = hashlib.sha256(archive.read_bytes()).hexdigest() + '  ' + ZIP_NAME + '\n'
    if (directory / 'SHA256SUMS.txt').read_text(encoding='ascii') != expected_sum:
        raise ValueError('Release checksum mismatch')
    return len(expected)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--git', action='store_true', help='also audit index and reachable Git history')
    p.add_argument('--dist', type=Path, default=ROOT / 'dist')
    args = p.parse_args()
    try:
        count = audit_worktree()
        if args.git:
            audit_git()
        if args.dist.exists():
            audit_archive(args.dist)
        print('PASS: ' + str(count) + ' allowlisted public files; requested Git/archive checks passed.')
    except Exception as e:
        raise SystemExit('FAIL: ' + str(e))
