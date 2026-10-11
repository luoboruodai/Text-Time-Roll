# 使用教程 / Tutorial

## 参数对照 / Parameter reference

| 中文 / English | 含义 / Meaning |
|---|---|
| 目标文本图层 / Target text layer | 当前合成的 Text Shape；只修改该层的文字输入 / Text Shape in the active comp; only its text input is driven |
| 开始数值 / Start value | 区间开始前保持的数值 / Value held before the interval; ±1,000,000,000 |
| 结束数值 / End value | 区间结束后保持的数值 / Value held after the interval; ±1,000,000,000 |
| 时间单位 / Time unit | 帧或秒；秒按当前合成 fps 换算并四舍五入到整数帧 / Frames or seconds, rounded to frames using the current comp fps |
| 开始/结束时间 / Start/end time | 合成绝对时间，结束至少晚 1 帧；存储范围 ±1,000,000 帧 / Absolute composition time, at least one frame apart; stored within ±1,000,000 frames |
| 缓动 / Easing | 线性、缓入缓出 smoothstep、三次缓出 / Linear, smoothstep, cubic ease-out |
| 小数位数 / Decimal places | 0–6；年份通常使用 0 / 0–6; use 0 for years |
| 整数最少位数 / Minimum integer digits | 1–12，不含负号和小数；不足补零 / 1–12, excluding sign/fraction; pads with zeros |
| 数字前缀/后缀 / Prefix/suffix | 各最多 128 个 UTF-16 码元，不接受换行/控制字符 / Up to 128 UTF-16 code units each; no control characters |
| 允许替换 / Allow replacement | 首次接管其他输入需要勾选；原输入不删除 / Required for first takeover of another input; original source is not deleted |

## 示例 / Examples

### 年份 / Year

- `1978` → `2026`, frames `25` → `75`, decimals `0`, min digits `4`, smoothstep.
- 25 fps 下为 2 秒；短区间会跳过部分年份，这是有限帧数所致。要看清每一年，延长时间。 / Two seconds at 25 fps. Short intervals skip some integers; use more frames to see more years.
- 原有文字出场早于计数开始，则先显示 1978，随后开始递增。 / An earlier entrance reveals 1978 before counting starts.

### 倒数 / Countdown

- `10` → `0`, linear, decimals `0`, minimum digits `2`: `10 … 00`.
- 前缀 `T-`、后缀 ` s` 都只是格式文字，不参与计算。 / Affixes are plain formatting, not expressions.

### 小数 / Decimal metric

- `0` → `100`, decimals `2`, minimum digits `1`, suffix ` %`: `0.00 % … 100.00 %`.
- 原字体必须含所需字符；本插件不会安装或替换字体。 / Your font must contain the requested glyphs; the plugin does not install fonts.

## 修改、恢复与转移 / Edit, restore and transfer

- 再选同一个文本，读取参数后应用；已有 TTR 控制器原位更新。 / Reselect the text and Apply; the same TTR controller is updated.
- 恢复按钮只撤销文字输入接管，不撤销后续用户对字体/位置的手动编辑。 / Restore reverses text-input takeover, not subsequent manual typography/transform changes.
- 首次原输入是另外的控制器时，不要删除它；若已删除，恢复会拒绝执行。 / Keep the original source; restoration refuses to proceed if it is missing.
- 控制器以 `TTR Counter v0.1.0` 子层保存。不要直接修改内部 `TTRState`、时间连接或参数关键帧。 / The child is named `TTR Counter v0.1.0`; avoid modifying internal metadata, clock wiring or parameter keyframes.
- 先保存 Scene 再关闭/拷贝；插件表达式没有电脑路径。工程的其他素材/字体仍需要按正常工程流程打包。 / Save before closing/transferring. The counter expression contains no machine paths; other project assets and fonts still need normal packaging.
- 改 fps 不会自动重定时：计数器保存的是帧。若要保留秒数，重新输入时间并应用。 / Changing fps does not retime stored frames; re-enter seconds and apply if needed.

## 排错 / Troubleshooting

| 现象 / Symptom | 处理 / Check |
|---|---|
| 参数改变但画面不变 / Changes do not affect the scene | 点击“应用”；确认目标、当前帧与可见区间 / Apply changes; verify target, frame and visibility |
| 面板打开但没有目标 / No selected target | 使用下拉框；跨场景后刷新列表并重新选择 / Use the dropdown; refresh/reselect after changing scenes |
| 文字看不见 / Text is invisible | 检查原图层可见性、颜色与背景、相机、出场动画 / Check visibility, contrast, camera and entrance animation |
| 字符方框或缺字 / Missing glyph boxes | 中文字体是否存在？面板切 EN；正文使用支持字符的字体 / Verify fonts; switch UI to EN and use a font containing the text glyphs |
| 更新被拒绝 / Update is blocked | 检查是否换了场景、改了连接、复制了带控制器的图层或手动给内部参数加了关键帧 / Check stale target, rewiring, duplicated controllers or manual keys |
| 数字不逐年出现 / Years are skipped | 增加帧数；短区间无法展示所有整数 / Increase duration; a short interval cannot show every integer |
| 恢复后还有 TTR 子层 / TTR child remains after Restore | 有意保留用于再应用，已不驱动正文 / Retained intentionally for reuse, disconnected from the text |
| 导出与预览不同 / Export differs | 先保存 Scene，检查活动相机、Render Queue、可见性和字体；插件不配置导出 / Save, verify active camera, Render Queue, visibility and fonts; export settings are outside this plugin |

若是图层时移、逐字样式或自定义变形等复杂情况，先在工程副本试用。提供 bug 时只提交可公开的最小复现，勿上传工作工程、客户素材或机密路径。 / Test complex time offsets, per-character styles and custom deformers in a copy. Report bugs with a sanitized minimal reproduction, not private production files.
