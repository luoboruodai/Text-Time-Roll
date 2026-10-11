"""Explicit public/source and distribution allowlists; no recursive ZIP globs."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
RELEASE_DOC = 'docs/releases/v' + VERSION + '.md'
PUBLIC_FILES = (
    '.gitignore', '.gitattributes', '.github/workflows/ci.yml', 'README.md', 'CHANGELOG.md',
    'CONTRIBUTING.md', 'LICENSE', 'package.json', 'src/Text Time Roll.js',
    'docs/TUTORIAL.md', 'docs/TESTING.md', 'docs/releases/v0.1.0.md', 'docs/releases/v0.1.1.md',
    'tools/release_manifest.py', 'tools/build_release.py', 'tools/audit_public.py',
    'tests/mock-cavalry.cjs', 'tests/mock-ui.cjs', 'tests/time-roll.test.cjs',
    'tests/ui.test.cjs', 'tests/rolling.test.cjs', 'tests/release.test.cjs',
)
RELEASE_FILES = {
    'Text Time Roll.js': 'src/Text Time Roll.js',
    'README.md': 'README.md', 'CHANGELOG.md': 'CHANGELOG.md', 'LICENSE': 'LICENSE',
    'docs/TUTORIAL.md': 'docs/TUTORIAL.md', 'docs/TESTING.md': 'docs/TESTING.md',
    RELEASE_DOC: RELEASE_DOC,
}
ZIP_ROOT = 'Text Time Roll/'
ZIP_NAME = 'Text-Time-Roll-v' + VERSION + '.zip'
