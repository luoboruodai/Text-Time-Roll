# Testing / 测试记录

Version: **0.1.0** · Date: **2026-10-12**

## Automated / 自动化

Run `npm test`, then build and audit the release. Tests cover numeric endpoints/clamping, fractional samples, descending values, precision/padding, Unicode, validation, frame/second conversion, macOS/Windows API mocks, takeover/restore/reapply, rollback, foreign rewiring, stale scene/comp/ID guards, idempotence and UI drafts/callbacks. Release tests validate package reproducibility, allowlists, checksums and rejection of synthetic security violations.

The GitHub Actions workflow is configured to run the same public tests on **macos-latest, windows-latest and ubuntu-latest**, with no Cavalry installation. CI verifies JavaScript logic and packaging on those runners; it **does not** test their Cavalry rendering/UI/font engines. Check the [Actions result](https://github.com/luoboruodai/Text-Time-Roll/actions) for the exact commit being used. Release tags are created only after the publication candidate passes this matrix.

### Verified CI evidence / 已验证的 CI 记录

On 2026-10-12 (UTC+08:00), [run 38179207041](https://github.com/luoboruodai/Text-Time-Roll/actions/runs/38179207041) passed at source commit `0bc79b306c26f079a6c22dd71cdff2ce106247d6`:

| Runner | Tests | Public/Git/archive audit | Reproducible ZIP |
|---|---|---|---|
| Windows | 37 / 37 passed | Passed | Same SHA-256 |
| macOS | 37 / 37 passed | Passed | Same SHA-256 |
| Ubuntu Linux | 37 / 37 passed | Passed | Same SHA-256 |

三个 CI 系统均通过 37 项测试与安全审计，并生成同一校验值的归档；这仍然是逻辑/UI 模拟和构建验证，**不代表 Windows Cavalry 真机验收**。发布文档更新后的最终 tag 提交也必须通过同一 CI。 / The final tagged commit must also pass the same matrix after documentation updates. These results are not a substitute for Windows Cavalry real-app acceptance.

## Real application / 真实应用

- **macOS, Cavalry 2.7.2:** exercised the current dedicated test scene.
- Imported the existing native counter endpoints/timing; verified 1978, intermediate values, and 2026 through Cavalry's evaluated Text Shape output, including scrubbing out of order.
- Verified Unicode affixes, decimals, negative/descending endpoints, repeated updates without duplicate counters, restore and reapply.
- Compared the original 615 scene nodes and connection graph: one new owned JavaScript utility and the intended text-input replacement only. Original authored parameters, keyframes, assets and unrelated layers preserved; evaluated caches, asset ordering and current playhead normalized separately.
- Restoring the native controller produced a pixel-identical comparison frame. This scene has white text on a white background: that full-frame image alone is **not** evidence of visible text contrast; evaluated text and panel values were checked independently.
- Saved scene values survived reload, and normal UI reopening was verified. A **private developer harness** calling `openScene` from inside a running script was followed by a host process exit after its checks completed. It was recovered once; that harness and scene are not distributed. The plugin itself never opens/closes scenes or applications. The cause of that host exit has not been established.
- Chinese/English labels and target selection, Apply and end-frame preview were checked in the installed panel. Native internal parameters deliberately have ASCII names.

## Boundaries / 边界

**Windows Cavalry real-app testing is not completed.** Automated Windows tests are not a substitute. Older Cavalry versions, unsupported fonts, complex mixed rich-text overrides, every deformer/duplicated-controller arrangement and every rendering configuration are not certified. No finite test suite proves “zero bugs”.

**尚未完成 Windows Cavalry 真机测试。** 当前确认的是同源跨平台实现、模拟/CI 测试和 macOS 真实应用验证，不宣称所有机器“绝对无 bug”。真实工程截图、素材、日志与本地交接文档不公开。

## Manual acceptance / 手动验收

1. In a disposable Scene, create a clearly visible Text Shape with a locally available font.
2. At 25 fps, apply 1978 → 2026 over frames 25–75; verify before/start/middle/end/after.
3. Test decimal/negative values, padding, Unicode affixes, all easing modes and seconds conversion.
4. Save, close the panel, reopen the Scene using the normal File menu, and render several frames.
5. Update, Restore and reapply; check that one counter remains and unrelated layers are unchanged.
6. Switch languages with an unapplied draft. Change Scene/target and verify that stale binding cannot apply.
7. Record OS, Cavalry version and sanitized results. Do not upload production content as a test fixture.
