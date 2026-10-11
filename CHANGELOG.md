# Changelog / 更新记录

## 0.1.0 — 2026-10-12

### 中文
- 首版年份/数值递增插件，Windows/macOS 共用一个 Cavalry UI Script。
- 中英面板、帧/秒、三种缓动、补零、小数、前后缀及倒数。
- 场景内自包含计数器；保持原文字布局、出场及无关图层。
- 明确接管确认、原输入恢复、防重复控制器、目标失效与外部改接保护。
- 修复开发测试中发现的空选择不填充列表、切换语言丢草稿、单位重复换算、前后缀预览回调与标签截断问题。
- 加入单元/UI 模拟测试、跨平台 CI、显式文件白名单打包和公开文件安全检查；Windows/macOS/Linux CI 各 37/37 通过且归档校验值一致。
- 提供双语介绍、安装和教程。Windows 真机 Cavalry 验证仍待补充。

### English
- Initial numeric/year counter, using one Cavalry UI Script on Windows and macOS.
- Bilingual panel, frames/seconds, three easings, padding, decimals, affixes and descending values.
- Self-contained scene counter that preserves existing text layout/entrance and unrelated layers.
- Explicit takeover consent, original-input restoration, idempotent updates and stale-target/rewiring guards.
- Fixed initial empty-selection dropdown, language-switch draft loss, repeated unit conversion, affix preview callbacks and clipped labels during development.
- Unit/UI mock tests, cross-platform CI, allowlisted packaging and public-file security checks; 37/37 passed on each Windows/macOS/Linux runner with identical archive checksums.
- Bilingual installation/tutorial documentation. Windows Cavalry real-app verification remains pending.
