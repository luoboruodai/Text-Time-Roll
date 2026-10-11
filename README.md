# Text Time Roll · 文本时间滚动

**v0.1.0 · Cavalry UI Script · Windows / macOS · MIT**

在已有文本层上制作 **1978 → 2026** 一类年份/数字递增动画。保留文字的字体、排版、位置和原有出场动画；只添加一个场景内计数器，不要求渲染时打开插件面板。

Animate a year or number on an existing Text Shape. Keep its typography, transforms and entrance animation. One scene-contained counter drives the text; the panel does not need to remain open for rendering.

> 这是**数值递增/递减**，不是数字上下翻动的机械滚轮，也不是自动处理月份和闰年的日历。
> This is a **numeric counter**, not vertical digit wheels or a calendar engine.

## 中文

### 功能

- 清晰的中文 / English 面板；内部变量使用 ASCII 名称，不依赖第三方汉化的原生属性标签。
- 起止数值、起止帧或秒、线性 / 缓入缓出 / 缓出。
- 小数 0–6 位、整数补零 1–12 位、可选文字前后缀；支持倒数和负数。
- 时间区间外保持起点/终点；任意拖动时间线得到确定值。
- 从当前合成选择文本层；可读取本插件参数，以及原生 String Generator 的两关键帧数值/时间。
- 已有文本输入需要明确勾选后才能接管；原控制器保留，可一键恢复。
- 重复应用更新同一个子计数器，不重复建层；场景/目标改变、外部改接、手工关键帧等情况会拦截更新。
- 没有网络请求、遥测、API 密钥、外部素材、操作系统路径或额外运行时依赖。

### 安装（Windows / macOS 相同）

1. 从本仓库 **Releases → v0.1.0** 下载 `Text-Time-Roll-v0.1.0.zip` 并解压。也可下载仓库里的 `src/Text Time Roll.js`。
2. 在 Cavalry 选择 **Scripts → Show Scripts Folder（脚本 → 显示脚本文件夹）**。使用菜单定位，避免不同系统、用户名和版本的目录差异。
3. 将解压出的 **`Text Time Roll.js`** 放进该 Scripts 文件夹。
4. 选择 **Scripts → Text Time Roll**。菜单未刷新时先重新展开菜单；更新版本时关闭旧面板，再打开新面板。通常不需要重启整个应用。
5. 更新前将旧脚本备份到 **Scripts 文件夹以外**，避免菜单出现多个旧版本。

需要提供 Scripts 和 JavaScript Utility 功能的 Cavalry 版本/许可。真实应用验证环境为 **macOS / Cavalry 2.7.2**。Windows 使用相同源码，并纳入跨平台自动化测试；**尚未完成 Windows Cavalry 真机验证**，不能将模拟测试当作真机认证。详见 [测试与限制](docs/TESTING.md)。

### 快速开始：1978 → 2026

1. 先保存工程。选择要修改的 Text Shape，打开面板，点击 **读取所选图层**；也可在下拉框选择目标。
2. 设置：开始 `1978`、结束 `2026`，小数 `0`、最少整数位 `4`。
3. 例如在 25 fps 合成中设置开始 `25` 帧、结束 `75` 帧，得到 2 秒计数。时间使用**合成绝对帧**，不是图层入点之后的相对帧。
4. 选择缓动。若目标已有文字输入，检查目标后勾选 **允许替换已有文字输入（保留原控制器，可恢复）**。
5. 点击 **应用 / 更新动画**。可用“查看起点 / 中间 / 终点”检查数值，再播放时间线。
6. **保存 Scene**。此后即使关闭面板、重新打开场景，也由场景中的 JavaScript Utility 计算数值。

面板中的修改只在点击“应用”后写入场景；面板数值预览反映当前草稿，操作面板或使用跳帧按钮时刷新。改变选择、点击读取/刷新会重新加载参数；语言切换不会丢弃未应用草稿。
完整流程、参数表和排错见 [使用教程 / Tutorial](docs/TUTORIAL.md)。

### 恢复与限制

“恢复原文字输入”会重新连接首次接管前的输入（或原文字），保留未连接的 TTR 子计数器供再应用；不会删除用户控制器。不要删除原控制器或手动改接 TTR 的时间/参数，再期待自动恢复。插件不移动其他层，不调整相机、素材、背景和导出设置。字体缺失、图层不可见或同色背景仍需按原工程设置处理。

导入原生两关键帧时只读取端点、格式和时间，**不复制自定义贝塞尔切线**，默认使用本插件的缓入缓出。更复杂的原生控制器不自动转换。数值以普通十进制显示，不使用区域化千位分隔符；极端小数遵循 JavaScript `toFixed` 的舍入规则。混合逐字富文本样式及复杂变形需要在工程副本中额外检查。

## English

### Features

- Chinese / English UI with explicit labels; ASCII internal parameter names and Unicode-escaped translations.
- Start/end values, absolute composition frames or seconds, linear / smoothstep / cubic ease-out.
- 0–6 decimals, 1–12 minimum integer digits, prefixes/suffixes, descending and negative values.
- Deterministic scrubbing and endpoint clamping. A self-contained JavaScript Utility is saved in the Scene.
- Reads this plugin's parameters or the endpoints/timing/format of a two-key native String Generator.
- Explicit consent before replacing another text input; the original controller is retained for restoration.
- Updates reuse the owned counter. Stale targets, external rewiring and manually animated parameters are guarded.
- No networking, telemetry, keys, external media, OS paths or extra runtime dependencies.

### Install

Download `Text-Time-Roll-v0.1.0.zip` from **Releases**, extract it, and copy **`Text Time Roll.js`** into the folder opened by **Scripts → Show Scripts Folder** in Cavalry. Open **Scripts → Text Time Roll**. The same file is used on both systems. When updating, close the old panel, replace the file, reopen the menu/panel, and keep old backups outside Scripts. A full application restart is normally unnecessary.

Requires access to Cavalry's Scripts and JavaScript Utility features. Real-app validation: **macOS / Cavalry 2.7.2**. Windows uses the same source and cross-platform automated tests, but **Windows Cavalry itself has not been tested on a real machine**. See [Testing](docs/TESTING.md).

### Use

1. Save your Scene, select a Text Shape, open the panel and choose **Read selected layer** (or select it in the dropdown).
2. Enter `1978` → `2026`, 0 decimals, 4 minimum digits.
3. At 25 fps, frames `25` → `75` give a two-second counter. Times refer to **absolute composition frames**, not the layer's in-point.
4. Choose easing; explicitly allow replacement only if you intend to take over an existing text input.
5. Click **Apply / Update**, inspect start/middle/end, play the timeline and **save the Scene**.
6. Close the panel freely; the saved expression remains in the Scene for evaluation/rendering.

Draft changes are not applied until you click Apply. The draft preview refreshes on panel interaction/seek buttons, not every external timeline event. Changing target or refreshing reloads parameters; toggling language preserves drafts. **Restore original text** reconnects the first original input or text and keeps the inactive TTR child for reuse. Keep the original controller for restoration. [Full tutorial and troubleshooting](docs/TUTORIAL.md).

Native import does not copy custom Bezier tangents; it defaults to this plugin's smoothstep. It does not convert complex native controllers. Decimal formatting uses JavaScript `toFixed`, not locale separators. Mixed character styles/complex deformers need project-specific checking. The plugin does not adjust cameras, fonts, visibility, backgrounds or export settings.

## Development / 开发

No package installation is required. Development checks use Node.js 22+ and Python 3.9+ (standard libraries only):

```sh
npm test
python3 tools/build_release.py
python3 tools/audit_public.py --git
```

On Windows use `python` instead of `python3` if appropriate. `--git` requires an initialized Git repository; omit it for source-only checks. Release builds are explicit-allowlist ZIPs with SHA-256 checksums. See [Contributing](CONTRIBUTING.md) and [Changelog](CHANGELOG.md).

**维护要求 / Maintenance:** 每次版本更新同步更新 README 的介绍、功能、安装/教程、兼容性、CHANGELOG 和对应 release notes，不只改版本号。Update the README's introduction, features, installation/tutorial and compatibility notes together with the version, changelog and release notes.

[MIT License](LICENSE). Independent community project; not affiliated with Cavalry.
