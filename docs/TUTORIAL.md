# 使用教程 / Tutorial

## 1. 选择效果 / Choose the effect

**仅数值递增 / 递减（Number counting only）** 保留v0.1.0的数值插值。适合年份逐步增加、倒数和指标数值。单调曲线保持单调数值；回拉/弹性/弹跳可能超调或回摆。

**向上 / 向下滚动（Roll up/down）** 使用逐位字轮。每位数字独立从起始数字过渡到结束数字，同时显示出入字形并裁切。中间数字可能不是按年份大小排列，属于视觉翻滚，不是时间历法。

Number-only mode interpolates a numeric value. Wheel mode animates each digit independently; intermediate displays can be non-chronological. Neither mode is a calendar/date engine.

## 2. 参数对照 / Parameters

| 中文 / English | 含义 / Meaning |
|---|---|
| 目标文本图层 / Target text layer | 当前合成的Text Shape；隐藏字形源不会出现在列表中 / Text Shape in active comp; owned glyph atlases are excluded |
| 起始/结束数值 / Start/end value | 范围±1,000,000,000；可倒数 / Range±1,000,000,000; descending supported |
| 时间单位 / Time unit | 帧或秒；秒按合成fps换算并取整 / Frames or seconds, rounded using comp fps |
| 开始/结束时间 / Start/end time | 合成绝对帧，至少相差1帧；存储范围±1,000,000帧 / Absolute comp time, at least1 frame apart |
| 缓动方式 / Easing | 34种曲线；Back/Elastic可能超调，Bounce可能回摆 / 34 curves, some overshoot/reverse |
| 滚动方向 / Roll direction | 仅数值、向上、向下 / Number only, up, down |
| 数字启动顺序 / Digit start order | 同步、从左往右、从右往左；只用于字轮 / Together, LTR, RTL; wheel mode only |
| 错峰比例 / Stagger | 0–80%；最后一位比第一位晚启动的总时长比例 / Share of total duration delaying the last digit relative to the first |
| 小数位数 / Decimal places | 0–6；年份通常0 / 0–6; normally0 for years |
| 整数最少位数 / Minimum integer digits | 1–12，不含负号和小数，补零 / 1–12 excluding sign/fraction, zero-padded |
| 数字前后缀 / Prefix/suffix | 各最多128个UTF-16码元，不接受控制字符 / Up to128 UTF-16 code units each; no control characters |
| 允许替换原输入 / Allow replacement | 首次接管其他输入需要确认；不删除原控制器 / Consent required for foreign input takeover; original source retained |

例如总时长100帧、错峰35%：最后一位比第一位晚35帧启动；各位的运动时长缩短到65帧，使所有位在结束时间前完成。单个数字不产生错峰，不缩短它的总时长。顺序按数字位置计算，标点和前后缀不参与。

For100 frames with35% stagger, the last digit starts35 frames later; per-digit movement lasts65 frames so all finish by the end. A single digit uses the full interval. Punctuation/affixes do not enter the ordering calculation.

## 3. 示例 / Examples

### 年份字轮 / Year wheels

1. 保存工程并选择文本；读取所选图层。
2. 1978→2026，小数0、最少整数位4，25→75帧（25fps下2秒）。
3. 平滑缓入缓出、向上滚动、从左往右、错峰35%。
4. 应用/更新动画，查看起点/中间/终点，再保存Scene。

Reverse vertical direction without reversing digit start order by choosing **Roll down**. Choose **Right to left** independently to change which digits start first.

### 连续数值计数 / Numeric count

- 1978→2026，选择“仅数值递增/递减”+Linear或Smoothstep。
- 在短时间内会跳过部分年份，这是有限帧数所致。延长区间可看到更多年份。
- Number-only mode ignores the disabled order/stagger controls but retains their draft values for later reuse.

### 倒数与小数 / Countdown and decimals

- 10→0，线性，小数0，最少整数位2，可加后缀` s`。
- 0→100，小数2，后缀` %`。
- 字轮稳定槽位时按两个端点的较大整数位数补零：9→100显示009→100；仅数值模式仍按最少位数普通格式化。
- Negative sign is static while its selected endpoint sign is negative; when signs differ it switches halfway through the interval. Digits still roll independently. Avoid assuming a mathematical zero-crossing display in wheel mode.

## 4. 更新、恢复与转移 / Update, restore, transfer

- v0.1.0升级后先读取参数。旧配置迁移默认仅数值模式；原三个曲线ID不变。开启字轮才新增隐藏Text Shape字形源和JavaScript Deformer。
- 反复应用复用同一套控制器，字形源随主字体、字号和连接的字体轴变化；不需要外部素材文件。
- Restore恢复首次接管前的文字输入，并移除自己的活动变形器连接，保留原出场行为及其他变形器的顺序/作用层级。辅助子层保留供再应用，不删除用户层。
- 不要手动删除或改接TTR子层、内部参数、隐藏字形源可见性。受损时插件会拒绝更新，而不是覆盖不明状态。
- 保存Scene后关闭插件面板仍可计算。跨电脑仍需安装字体、打包其他工程素材。改变fps不会自动重定时；计数器保存帧，若要保留秒数请重新输入并应用。

Reads and applies are separate: drafts do not change the Scene until Apply. Language switches preserve drafts. Refresh/reselection reloads scene parameters. The preview refreshes on panel interaction or seek buttons.

## 5. 排错 / Troubleshooting

| 现象 / Symptom | 检查 / Check |
|---|---|
| 数字变了但没上下移动 / No vertical movement | 确认滚动方向不是“仅数值”，点击应用；在两个端点之间检查 / Enable up/down, Apply and inspect an intermediate frame |
| 中间出现比结束年份更大的数 / Intermediate year exceeds final | 字轮按位独立，不是整体数值插值；切换仅数值+单调缓动 / Independent wheels are not chronological; use numeric mode for interpolation |
| 回拉/弹性暂时倒转或超调 / Reverse/overshoot | 这是曲线性质；改用Linear/Smoothstep / Expected curve behaviour; select a monotonic curve if needed |
| 文字看不见 / Invisible text | 检查原可见性、背景对比、相机、入场动画与字体 / Check original visibility, contrast, camera, entrance and font |
| 缺字/方框 / Missing glyphs | 目标字体需含所需字符；英文界面可用于无CJK界面字体的环境 / Install suitable glyph coverage; EN UI remains available |
| 字形源被显示或更新被拒绝 / Atlas visible or update blocked | 检查是否手动改接/显示TTR辅助层；不要删除原输入 / Check manual helper rewiring/visibility and retain the original source |
| 复杂文字滚动异常 / Complex text layout fails | 用单行统一字体试用；逐字混合字体、连字、沿路径等需额外验证 / Test uniform single-line text; mixed-font/ligature/path layouts are not certified |
| 导出与预览不同 / Export differs | 保存Scene并检查相机、Render Queue和字体，插件不修改导出设置 / Save and verify camera, Render Queue and fonts |

提供bug请使用可公开的合成最小复现，勿上传生产工程、客户素材、凭据或私有路径。 / Submit sanitized synthetic reproductions only.
