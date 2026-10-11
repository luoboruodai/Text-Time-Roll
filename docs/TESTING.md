# Testing / 测试记录

Version: **0.1.1** · Date: **2026-10-12**

## Automated / 自动化

Run `npm test`, build, then audit the release. Tests cover:

- All34 curves: exact endpoints, finite samples, overshoot/bounce semantics; legacy3 modes unchanged.
- Up/down geometry displacement, simultaneous outgoing/incoming paths, clipping and static endpoint outlines/materials.
- LTR/RTL/together order, stagger, one-digit timing, stable padding, negative numbers/negative zero, decimals and Unicode affixes.
- v0.1.0 migration, original input restoration, idempotence, stale targets, damaged/foreign-rewired helper guards and late-failure rollback.
- Existing entrance stack/level mode preservation; no forward-disconnect assumptions on shrinking Cavalry arrays.
- Classic single-column UI/full text, language switches preserving drafts, unit conversion and hidden-atlas filtering.
- Explicit release allowlists, reproducible ZIP/checksums, source-identical artifacts, synthetic security rejection tests and version consistency.

The same suite runs on Windows, macOS and Ubuntu GitHub Actions runners. This covers logic/API/UI mocks and packaging, **not a Windows Cavalry installation**. Check the [Actions result for the exact commit](https://github.com/luoboruodai/Text-Time-Roll/actions). Release candidates must pass all3 runners before tagging.

## Real application / 真实应用

**macOS / Cavalry2.7.2**:

- Read the current live project rather than stale historical defaults. Saved a private baseline; preserved edited numeric/timing/format parameters.
- Compared v0.1.0 versus upgraded number-only evaluated text at several frames: identical.
- Used disposable synthetic compositions with visible text to render start/intermediate/end frames, compare upward versus downward rolling and LTR versus RTL order, and test negative/decimal/affix cases.
- Evaluated all34 curves in the actual host with no new native expression errors in the final synthetic run.
- Verified hidden atlas is not rendered, rolling geometry contains both glyphs, and the target's existing material is retained. Uses2.7-compatible Mesh methods, not newer-only material readers.
- Apply, Restore and reapply preserve the original text source and a single correctly ordered entrance connection. The array compaction regression was reproduced in the real host and corrected by removing slots from the end before rebuilding.
- Serialized scene comparison: authored properties/keyframes on unrelated existing nodes and the asset map unchanged. Allowed changes are the owned controller upgrade and target deformer-slot insertion; native helper nodes for the new atlas/deformer are expected. Evaluated caches/playhead normalization is separate from authored-state comparison.
- Classic Chinese panel restored after feedback; new options follow the original single-column layout and full wording. Panel changes do not reset existing parameters.

**Not certified:** Windows Cavalry real-app behaviour, older host versions, every font/mixed-style/ligature/path-text/deformer combination, or every rendering setup. No finite tests establish zero bugs. Production scenes/media/logs are not published.

## Manual acceptance / 手动验收

1. In a disposable Scene, create clearly visible single-line text with a locally installed font.
2. Apply1978→2026 over frames25–75 at25fps. Compare number-only and up/down modes at endpoints and fractional/intermediate frames.
3. Test together/LTR/RTL with35% stagger, and verify that strings are not reversed.
4. Test decimals, padding, Unicode affixes, negative values, all curve families and seconds conversion.
5. Update repeatedly, switch to number-only, Restore and reapply; verify one owned rig and the original entrance stack.
6. Save and reopen through the normal File menu, not an executing script that reloads its own Scene. Confirm glyph sources remain hidden and expressions evaluate without the panel.
7. Switch languages with an unapplied draft; verify values and meaningful complete labels. Changing Scene requires refresh/reselection.
8. Record OS/version/results with synthetic examples only.

## Historical note / 历史说明

v0.1.0 had37 passing automated tests on3 CI runners and macOS2.7.2 real-app checks. A private0.1.0 developer harness that called `openScene` while executing was followed by a host exit; its cause was not established. Neither distributed version opens/reloads/restarts the application, and that harness is not used in this update.
