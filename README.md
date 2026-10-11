# Text Time Roll · 文本时间滚动

**v0.1.1 · Cavalry UI Script · Windows / macOS · MIT**

[下载 v0.1.1 / Download](https://github.com/luoboruodai/Text-Time-Roll/releases/tag/v0.1.1) · [源码 / Source](https://github.com/luoboruodai/Text-Time-Roll) · [CI / Actions](https://github.com/luoboruodai/Text-Time-Roll/actions)

在已有文本层上制作年份/数字变化，或真正的**逐位向上、向下滚动**。支持 **34 种缓动**及**从左往右 / 从右往左**的数字启动顺序，保留原单列界面和完整说明。

Animate numbers on an existing Text Shape, or use real **up/down digit wheels**. Choose **34 easing presets** and **left-to-right / right-to-left** digit start order, with the familiar single-column bilingual panel and full labels.

## 中文

### v0.1.1 新增

- **34 种缓动**：Linear、Smoothstep；Sine、Quad、Cubic、Quart、Quint、Expo、Circ、Back、Elastic、Bounce 的缓入/缓出/缓入缓出；8 段阶梯、保持至末帧。
- **滚动方向**：仅数值递增/递减、向上滚动、向下滚动。上下滚动使用同时出入的两个真实字形，并按每位的窗口裁切，不是单纯切换数字。
- **数字启动顺序**：所有数字同步、从左往右、从右往左。可调 **0–80% 错峰比例**。
- **旧布局保留**：起始数值、结束数值、完整按钮名、预览与说明仍采用 v0.1.0 的单列结构，不改成双列极简布局。
- **旧版兼容**：读取 v0.1.0 场景参数；首次升级保持“仅数值”模式，原三个缓动 ID 不变。用户选择上下滚动后才创建滚动辅助层。
- 修复 Cavalry 自动收缩变形器数组时可能造成重复连接的问题；重复应用/恢复保留原出场行为的顺序和层级设置。

> **两种模式的区别：**“仅数值”按起止数值插值；“上下滚动”让各位数字独立转到目标数字，因此中间显示值不保证按年份大小递增。顺序控制启动先后，不反转文字，也不是整段文字横向平移。Back/Elastic 会超调，Bounce 可能回摆；需要单调年份计数时用“仅数值”搭配 Linear/Smoothstep 等单调曲线。

### 安装与更新

1. 下载并解压 Release 中的 **`Text-Time-Roll-v0.1.1.zip`**。
2. Cavalry → **Scripts → Show Scripts Folder（脚本 → 显示脚本文件夹）**。
3. 关闭旧插件面板，用 ZIP 中的 **`Text Time Roll.js`** 替换 Scripts 文件夹中的同名文件。备份请放到 Scripts 文件夹之外。
4. 通过 **Scripts → Text Time Roll** 重新打开面板。无需为更新脚本反复重启 Cavalry。
5. 选择旧文本并点击“读取所选图层”，核对参数后“应用 / 更新动画”，最后保存 Scene。

Windows/macOS 使用同一脚本，不含电脑绝对路径或额外运行时依赖。真实应用验证为 **macOS / Cavalry 2.7.2**；需要 Scripts、JavaScript Utility 和 JavaScript Deformer 功能。**Windows Cavalry 真机尚未验证**，不能将 CI 当作真机认证。

### 快速使用

1. 保存工程，选择 Text Shape，打开插件并点击 **读取所选图层**，或从下拉框选择文本。
2. 输入起始/结束数值，例如 `1978` → `2026`；年份用小数 `0`、整数最少位数 `4`。
3. 设置开始/结束时间，例如 25 fps 下 `25` → `75` 帧为 2 秒。时间是**合成绝对帧**，不是图层入点后的相对时间。
4. 选择缓动。要启用新效果，设 **滚动方向 = 向上滚动**，**数字启动顺序 = 从左往右**，**错峰比例 = 35%**。
5. 已有文字输入时，确认目标后勾选接管选项。点击 **应用 / 更新动画**，使用“查看起点/中间/终点”检查，然后保存 Scene。

更详细的参数与案例见 [使用教程](docs/TUTORIAL.md)。

### 保留与恢复

插件保留字体、目标层变换和原出场动画。上下滚动只在目标文字的变形器列表前插入自己的变形器；原输入和原行为保留。**恢复原文字输入**会断开本插件的文本驱动及滚动变形器，恢复首次接管前的文字输入；保留辅助子层供再应用，不删除用户层。

所有表达式和隐藏字形源随 Scene 保存，关闭插件面板后继续计算。字体仍需在目标电脑安装；其他工程素材仍需正常打包。插件不修改相机、素材路径、背景、字体安装或导出设置，也不发送网络请求/遥测。

### 注意与范围

- 逐位滚动会按两个端点的最大整数位数补零，以稳定数字槽位，例如 `9 → 100` 显示 `009 → 100`。
- 滚动使用目标层主字体/字号和可连接的字体轴。复杂逐字混合字体、连字、沿路径文字或特殊变形器组合不保证兼容；先在工程副本测试，必要时用“仅数值”。
- 缓动实现参考 Magic Easing 常见曲线类型，使用自包含数学函数；**不是调用原生 Magic Easing，亦不保证逐点完全相同**。
- 旧原生 String Generator 导入只读取两关键帧端点、时间和格式，不复制自定义贝塞尔切线。
- 面板预览是草稿预览，修改参数后必须“应用”才写入场景。预览在操作面板/跳帧时刷新，不持续监听外部时间线。
- 本插件不是日历系统，不处理日期进位、月份或闰年。

## English

### What's new in v0.1.1

- **34 easing presets:** Linear, Smoothstep; In/Out/In-Out variants of Sine, Quad, Cubic, Quart, Quint, Expo, Circ, Back, Elastic and Bounce; 8-step and hold-to-end.
- **Roll direction:** number counting only, roll up, or roll down. Each active wheel contains outgoing and incoming glyphs, clipped to its digit window.
- **Digit start order:** together, left-to-right or right-to-left, with **0–80% stagger**.
- **Classic UI:** retained the single-column layout, full parameter/button names, preview and instructions instead of a terse two-column redesign.
- **Migration:** loads v0.1.0 parameters without changing its three easing IDs; number-only mode remains the migration default. Rolling helpers are added only when enabled.
- Safe deformer-array rebuilding prevents duplicate entrance connections when Cavalry compacts disconnected array slots. Apply/Restore preserves the existing entrance stack and level mode.

**Number counting** interpolates a numeric value. **Digit wheels** animate each digit independently, so intermediate displays are not necessarily chronological or monotonic. Order controls which digits start first; it does not reverse the text or move the entire string horizontally. Back/Elastic can overshoot and Bounce can reverse. For monotonic year counting, use number-only mode with a monotonic easing such as Linear or Smoothstep.

### Install / update

Extract **`Text-Time-Roll-v0.1.1.zip`**. In Cavalry, use **Scripts → Show Scripts Folder**, close the old panel, replace **`Text Time Roll.js`**, and reopen it through Scripts. Keep backups outside Scripts. Read the selected text, verify the loaded parameters, Apply and save the Scene. A full application restart is not normally needed.

One script is used on Windows/macOS with no external runtime or machine paths. Requires Scripts, JavaScript Utility and JavaScript Deformer support. Real-app validation: **macOS / Cavalry 2.7.2**. **Windows Cavalry itself remains unverified**; CI checks do not certify its UI/rendering/font engine.

### Quick start

1. Save your Scene, select a Text Shape, open the panel and **Read selected layer**, or use its dropdown.
2. Set `1978` → `2026`, decimals `0`, minimum integer digits `4`.
3. At 25 fps, frames `25` → `75` produce a two-second interval. Times are absolute composition frames.
4. Choose easing, **Roll up**, **Left to right** and **35% stagger** for the new wheel effect.
5. Explicitly consent if taking over an existing text input, click **Apply / Update**, inspect start/middle/end and save.

[Full tutorial](docs/TUTORIAL.md). Draft changes do not affect the Scene until applied. Preview refreshes on panel interaction/seek buttons, not every external timeline event.

### Preservation / limitations

Typography, target transforms, original input and entrance behaviour are retained. The rolling deformer is inserted before existing text deformers. Restore reconnects the first original input and removes only this plugin's active deformer connection; it retains inactive helper children for reuse.

Expressions and the hidden glyph atlas are stored in the Scene; the panel can be closed. Fonts must still be installed on the destination machine, and other project assets need normal packaging. The plugin does not modify cameras, backgrounds or export settings and performs no network/telemetry requests.

Wheels pad endpoints to a stable maximum digit count. They use the text layer's main font/size/font axes; complex per-character fonts, ligatures, path text or unusual deformer combinations need project-specific checking. Easing functions are independently implemented common curve families inspired by Magic Easing options, not calls to the native Magic Easing engine. Native String Generator import does not copy custom Bezier tangents. This is not a calendar/date engine.

## Development / 开发

Node.js 22+ and Python 3.9+; no package installation required:

```sh
npm test
python3 tools/build_release.py
python3 tools/audit_public.py --git
```

Use `python` on Windows if appropriate. `--git` also audits staged blobs and reachable history. Builds use explicit allowlists and SHA-256 checksums. Real scenes, customer media, local handoff notes, credentials and caches are not distributed.

[Testing / 测试范围](docs/TESTING.md) · [Changelog / 更新记录](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [MIT](LICENSE)

**维护要求 / Maintenance:** 每次更新同步版本、README功能介绍/教程/兼容性、CHANGELOG和对应Release说明。Update the introduction, tutorial, compatibility, changelog and release notes with every version. Independent community project; not affiliated with Cavalry.
