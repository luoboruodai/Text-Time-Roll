# Contributing / 贡献指南

Use a disposable Cavalry Scene; never commit production projects, images, recordings, account/session data, private paths, environment files or keys. Keep local handoff notes in ignored `PROJECT.md` and diagnostics in ignored `private/`.

使用专门的测试工程，不提交生产工程/素材、账户/会话、真实本机路径、环境配置或密钥。本地交接记录保留于忽略的 `PROJECT.md`，诊断资料位于忽略的 `private/`。

- Run `npm test`; do not mistake API mocks for real Cavalry testing.
- Build with `python3 tools/build_release.py`; validate with `python3 tools/audit_public.py --git`.
- Stage only reviewed public files. Inspect staged contents and release members before pushing.
- For every version, update `package.json`, the source version, README introduction/features/compatibility/tutorial, CHANGELOG, testing notes and `docs/releases/vX.Y.Z.md` together.
- Tag only the tested commit. Never silently replace a published tag or release artifact with different bytes.
- Provide checksums and verify uploaded downloads against local artifacts.
- If an issue may contain private information, replace it with a minimal synthetic reproduction before posting. Do not paste tokens into an issue.

The bundled scanner is defense in depth, not a complete secret detector. Human review remains necessary. / 内置扫描只是多层防护的一部分，不能代替人工检查。
