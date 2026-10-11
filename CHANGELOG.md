# Changelog / 更新记录

## 0.1.1 — 2026-10-12

### 中文
- 从3种扩充至34种缓动，保留旧ID与端点行为。
- 新增向上/向下逐位字轮、同步/LTR/RTL启动顺序、错峰比例。
- 保留旧版单列布局、完整参数名和说明，撤回开发中的双列极简方案。
- 旧控制器原位迁移；自包含隐藏字形源和滚动变形器，保持字体、原出场及恢复能力。
- 修复Cavalry变形器数组断开时自动收缩/重排导致的重复连接；保护原行为作用层级。
- 新增缓动、方向、几何裁切、迁移、故障回滚、原行为保留与完整UI回归测试。

### English
- Expanded3 easings to34 while keeping legacy IDs/endpoints.
- Added up/down digit wheels, together/LTR/RTL start order and stagger.
- Retained classic single-column layout with full labels/instructions; discarded the terse two-column development variant.
- In-place controller migration with scene-contained hidden glyph atlas and deformer; original typography/entrance/restoration retained.
- Fixed duplicate connections caused by Cavalry compacting disconnected deformer array entries; preserves original behaviour level mode.
- Added easing, direction, geometry/clipping, migration, rollback, preservation and classic-UI regression coverage.

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
