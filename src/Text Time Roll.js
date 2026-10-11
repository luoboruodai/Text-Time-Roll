/* Text Time Roll for Cavalry v0.1.0 | MIT License
 * A numeric/year counter, not a mechanical odometer or calendar generator.
 * No filesystem, network, telemetry or platform-specific dependencies.
 */
var TextTimeRoll = (function () {
    'use strict';
    var VERSION = '0.1.0';
    var MAGIC = 'cavalry-text-time-roll';
    var MARK = '// TTR_COUNTER_SCHEMA_1';
    var FIELDS = [
        ['CurrentFrame', 'double'], ['StartValue', 'double'], ['EndValue', 'double'],
        ['StartFrame', 'double'], ['EndFrame', 'double'], ['Easing', 'int'],
        ['DecimalPlaces', 'int'], ['MinDigits', 'int'], ['Prefix', 'string'],
        ['Suffix', 'string'], ['TTRState', 'string']
    ];
    var KEYS = ['currentFrame', 'startValue', 'endValue', 'startFrame', 'endFrame',
        'easing', 'decimals', 'minDigits', 'prefix', 'suffix'];
    function copy(value) { return JSON.parse(JSON.stringify(value)); }
    function fail(code) { var e = new Error(code); e.code = code; throw e; }
    function finite(value) { return typeof value === 'number' && isFinite(value); }
    function ease(u, mode) {
        if (mode === 1) return u * u * (3 - 2 * u);
        if (mode === 2) return 1 - Math.pow(1 - u, 3);
        return u;
    }
    function sample(frame, first, last, start, end, mode) {
        if (frame <= start) return first;
        if (frame >= end) return last;
        return first + (last - first) * ease((frame - start) / (end - start), mode);
    }
    function formatNumber(value, decimals, minDigits, prefix, suffix) {
        // toFixed rounds fractional frames deterministically, including during rendering.
        var text = value.toFixed(decimals);
        if (Number(text) === 0) text = (0).toFixed(decimals);
        var negative = text.charAt(0) === '-';
        if (negative) text = text.substring(1);
        var parts = text.split('.');
        while (parts[0].length < minDigits) parts[0] = '0' + parts[0];
        return prefix + (negative ? '-' : '') + parts.join('.') + suffix;
    }
    function validate(config) {
        var c = copy(config);
        ['startValue', 'endValue', 'startFrame', 'endFrame', 'easing', 'decimals', 'minDigits'].forEach(function (key) {
            if (!finite(c[key])) fail('invalidNumber');
        });
        if (Math.abs(c.startValue) > 1e9 || Math.abs(c.endValue) > 1e9) fail('valueRange');
        if (Math.abs(c.startFrame) > 1e6 || Math.abs(c.endFrame) > 1e6 ||
            Math.floor(c.startFrame) !== c.startFrame || Math.floor(c.endFrame) !== c.endFrame) fail('frameRange');
        if (c.endFrame <= c.startFrame) fail('timeOrder');
        if (Math.floor(c.decimals) !== c.decimals || c.decimals < 0 || c.decimals > 6) fail('formatRange');
        if (Math.floor(c.minDigits) !== c.minDigits || c.minDigits < 1 || c.minDigits > 12) fail('formatRange');
        if ([0, 1, 2].indexOf(c.easing) < 0) fail('easingRange');
        ['prefix', 'suffix'].forEach(function (key) {
            if (typeof c[key] !== 'string' || c[key].length > 128 || /[\x00-\x1F\x7F]/.test(c[key])) fail('affixRange');
        });
        return c;
    }
    function defaults(frame, fps) {
        return {startValue: 1978, endValue: 2026, startFrame: Math.round(frame),
            endFrame: Math.round(frame) + Math.max(1, Math.round(fps)), easing: 1,
            decimals: 0, minDigits: 4, prefix: '', suffix: ''};
    }
    function framesFromUnits(start, end, units, fps) {
        if (!finite(start) || !finite(end) || !finite(fps) || fps <= 0) fail('invalidNumber');
        var factor = units === 'seconds' ? fps : 1;
        return [Math.round(start * factor), Math.round(end * factor)];
    }
    function textAt(c, frame) {
        return formatNumber(sample(frame, c.startValue, c.endValue, c.startFrame, c.endFrame, c.easing),
            c.decimals, c.minDigits, c.prefix, c.suffix);
    }
    function expression() {
        return MARK + '\n' + ease.toString() + '\n' + sample.toString() + '\n' + formatNumber.toString() +
            '\nformatNumber(sample(CurrentFrame, StartValue, EndValue, StartFrame, EndFrame, Easing),' +
            ' DecimalPlaces, MinDigits, Prefix, Suffix);';
    }
    function sourceId(input) { return String(input || '').split('.')[0]; }
    function owned(a, id, target) {
        if (!id || !a.layerExists(id) || a.getLayerType(id) !== 'javaScript' || a.getParent(id) !== target) return null;
        try {
            if (String(a.get(id, 'expression')).indexOf(MARK) !== 0) return null;
            var data = JSON.parse(a.get(id, 'array.10'));
            return data.magic === MAGIC && data.schema === 1 && data.target === target ? data : null;
        } catch (e) { return null; }
    }
    function findCounter(a, target) {
        var candidates = [], children = a.getChildren(target) || [];
        children.forEach(function (id) { if (owned(a, id, target)) candidates.push(id); });
        if (candidates.length > 1) fail('duplicateCounter');
        return candidates[0] || '';
    }
    function bind(a, target) {
        if (!target || !a.layerExists(target) || a.getLayerType(target) !== 'textShape') fail('selectText');
        if (a.getParentComp(target) !== a.getActiveComp()) fail('selectText');
        return {target: target, scene: a.getSceneFilePath(), comp: a.getActiveComp(), uuid: a.get(target, 'uuid')};
    }
    function assertBinding(a, b) {
        if (!b || b.scene !== a.getSceneFilePath() || b.comp !== a.getActiveComp() ||
            !a.layerExists(b.target) || a.getParentComp(b.target) !== b.comp || a.getLayerType(b.target) !== 'textShape' || a.get(b.target, 'uuid') !== b.uuid) fail('staleTarget');
    }
    function readConfig(a, id) {
        var c = {};
        for (var i = 1; i < KEYS.length; i++) c[KEYS[i]] = a.get(id, 'array.' + i);
        return validate(c);
    }
    function readNative(a, target) {
        var id = sourceId(a.getInConnection(target, 'text'));
        if (!id || a.getLayerType(id) !== 'stringGenerator' || a.getCurrentGeneratorType(id, 'generator') !== 'textValue') return null;
        var times = a.getKeyframeTimes(id, 'generator.number');
        if (times.length !== 2) return null;
        var f = a.getFrame(), c = defaults(f, a.get(a.getActiveComp(), 'fps'));
        try {
            c.startFrame = times[0]; c.endFrame = times[1];
            a.setFrame(times[0]); c.startValue = a.get(id, 'generator.number');
            a.setFrame(times[1]); c.endValue = a.get(id, 'generator.number');
            c.decimals = a.get(id, 'generator.precision'); c.minDigits = a.get(id, 'generator.length');
            c.prefix = a.get(id, 'prefix'); c.suffix = a.get(id, 'suffix');
            return validate(c);
        } finally { a.setFrame(f); }
    }
    function load(a, b) {
        assertBinding(a, b);
        var id = findCounter(a, b.target), input = a.getInConnection(b.target, 'text');
        return {counter: id, active: !!id && input === id + '.id', existing: !!input,
            native: !id && !!input, config: id ? readConfig(a, id) : readNative(a, b.target)};
    }
    function originalState(a, target) {
        return {text: copy(a.get(target, 'text')), input: a.getInConnection(target, 'text') || '',
            name: a.getNiceName(target), autoName: a.get(target, 'autoName')};
    }
    function reconnect(a, target, original) {
        a.disconnectInput(target, 'text');
        if (!original.input) a.set(target, {text: original.text});
        a.rename(target, original.name);
        a.set(target, {autoName: original.autoName});
        if (original.input) {
            var p = original.input.indexOf('.');
            a.connect(original.input.substring(0, p), original.input.substring(p + 1), target, 'text');
        }
    }
    function setConfig(a, id, c) {
        var values = {};
        for (var i = 1; i < KEYS.length; i++) values['array.' + i] = c[KEYS[i]];
        a.set(id, values);
    }
    function apply(a, b, config, allowExisting) {
        assertBinding(a, b);
        var c = validate(config), target = b.target, id = findCounter(a, target);
        var input = a.getInConnection(target, 'text') || '', meta = id ? owned(a, id, target) : null;
        // Reapplying after Restore may safely reattach the exact original input.
        if (input && input !== id + '.id' && !(meta && input === meta.original.input) && !allowExisting) fail('existingInput');
        if (meta && input && input !== id + '.id' && input !== meta.original.input) fail('changedInput');
        if (id) {
            if (a.getInConnection(id, 'array.0') !== b.comp + '.time') fail('manualParameters');
            for (var i = 1; i < KEYS.length; i++) {
                if (a.getInConnection(id, 'array.' + i) || a.getKeyframeTimes(id, 'array.' + i).length) fail('manualParameters');
            }
        }
        var before = originalState(a, target), oldConfig = id ? readConfig(a, id) : null, created = false;
        try {
            if (!id) {
                id = a.create('javaScript', 'TTR Counter v' + VERSION);
                if (!id || !a.layerExists(id)) fail('createFailed');
                created = true;
                a.parent(id, target);
                // Cavalry normally starts a JavaScript utility with one double.
                for (var n = a.getArrayCount(id, 'array'); n < FIELDS.length; n++) a.addDynamic(id, 'array', FIELDS[n][1]);
                for (var q = 0; q < FIELDS.length; q++) a.renameAttribute(id, 'array.' + q, FIELDS[q][0]);
                meta = {magic: MAGIC, schema: 1, version: VERSION, target: target, original: before};
                a.set(id, {'array.10': JSON.stringify(meta)});
                a.connect(b.comp, 'time', id, 'array.0');
            }
            setConfig(a, id, c);
            a.set(id, {expression: expression()});
            a.set(target, {autoName: false});
            a.disconnectInput(target, 'text');
            a.connect(id, 'id', target, 'text');
            if (a.getInConnection(target, 'text') !== id + '.id') fail('connectFailed');
            return {counter: id, target: target, config: c, created: created};
        } catch (e) {
            var rollback = [];
            try { reconnect(a, target, before); } catch (r) { rollback.push(String(r)); }
            if (created && id) {
                try { a.deleteLayer(id); } catch (r2) { rollback.push(String(r2)); }
            } else if (id && oldConfig) {
                try { setConfig(a, id, oldConfig); } catch (r3) { rollback.push(String(r3)); }
            }
            if (rollback.length) { var error = new Error('rollbackFailed: ' + rollback.join('; ')); error.code = 'rollbackFailed'; throw error; }
            throw e;
        }
    }
    function restore(a, b) {
        assertBinding(a, b);
        var id = findCounter(a, b.target), meta = id ? owned(a, id, b.target) : null;
        if (!meta) fail('noCounter');
        if (a.getInConnection(b.target, 'text') !== id + '.id') fail('changedInput');
        if (meta.original.input && !a.layerExists(sourceId(meta.original.input))) fail('originalMissing');
        // Retain the inert counter as a child for safe reapplication; delete no user layers.
        var before = originalState(a, b.target);
        try { reconnect(a, b.target, meta.original); }
        catch (e) { reconnect(a, b.target, before); throw e; }
        return id;
    }
    var messages = {
        en: {
            title: 'Text Time Roll', language: '\u4e2d\u6587 / EN', description: 'Animate a year or number on one text layer. Existing layout and entrance stay intact.',
            target: 'Target text layer', choose: 'Select a text layer...', read: 'Read selected layer', reload: 'Refresh layer list',
            startValue: 'Start value', endValue: 'End value', unit: 'Time unit', frames: 'Frames', seconds: 'Seconds',
            startFrame: 'Start time', endFrame: 'End time', easing: 'Easing', linear: 'Linear', smooth: 'Ease in / out', out: 'Ease out',
            decimals: 'Decimal places', minDigits: 'Minimum integer digits', prefix: 'Prefix', suffix: 'Suffix',
            consent: 'Allow replacing the existing text input (original is kept)',
            apply: 'Apply / Update', restore: 'Restore original text', first: 'Go to start', middle: 'Go to middle', last: 'Go to end',
            note: 'Save the Scene after applying. Numeric counting only; not vertical digit wheels.', ready: 'Choose a text layer, then set the number and timing.',
            loaded: 'Parameters loaded. Other layers will not be changed.', done: 'Applied. Save the Scene to keep this counter.', restored: 'Original text input restored. Counter kept for reuse.',
            existing: 'Existing input found. Read its values, then enable replacement to take over.',
            preview: 'Preview at current frame: ', duration: 'Frames: ',
            selectText: 'Choose exactly one Text Shape (or its counter).', staleTarget: 'The Scene or target changed. Refresh and select again.',
            invalidNumber: 'Enter finite numeric values.', valueRange: 'Values must be between -1 billion and +1 billion.',
            frameRange: 'Frame positions must be integers within +/-1,000,000.', timeOrder: 'End time must be later than start time (at least one frame).',
            formatRange: 'Decimals: 0-6. Minimum digits: 1-12.', easingRange: 'Choose a supported easing.', affixRange: 'Prefix/suffix: up to 128 characters, no line breaks.',
            existingInput: 'Text already has an input. Enable replacement explicitly.', changedInput: 'Another input was connected; refusing to overwrite it.',
            manualParameters: 'Controller parameters have manual keys/connections. Remove them or use another text layer.',
            duplicateCounter: 'Multiple TTR counters found. Resolve them before applying.', noCounter: 'No TTR counter is attached to this text.',
            originalMissing: 'The original input was deleted. Restore it before using this command.', createFailed: 'Could not create the counter.',
            connectFailed: 'Could not connect the counter.', rollbackFailed: 'Recovery could not be completed. Use Undo or your Scene backup.'
        },
        zh: {
            title: '\u6587\u672c\u65f6\u95f4\u6eda\u52a8', language: '\u4e2d\u6587 / EN', description: '\u4e3a\u5355\u4e2a\u6587\u672c\u5c42\u6dfb\u52a0\u5e74\u4efd\u6216\u6570\u503c\u9012\u589e\uff0c\u4fdd\u7559\u539f\u6709\u6392\u7248\u548c\u51fa\u573a\u52a8\u753b\u3002',
            target: '\u76ee\u6807\u6587\u672c\u56fe\u5c42', choose: '\u8bf7\u9009\u62e9\u6587\u672c\u56fe\u5c42...', read: '\u8bfb\u53d6\u6240\u9009\u56fe\u5c42', reload: '\u5237\u65b0\u56fe\u5c42\u5217\u8868',
            startValue: '\u8d77\u59cb\u6570\u503c', endValue: '\u7ed3\u675f\u6570\u503c', unit: '\u65f6\u95f4\u5355\u4f4d', frames: '\u5e27', seconds: '\u79d2',
            startFrame: '\u5f00\u59cb\u65f6\u95f4', endFrame: '\u7ed3\u675f\u65f6\u95f4', easing: '\u7f13\u52a8\u65b9\u5f0f', linear: '\u7ebf\u6027', smooth: '\u7f13\u5165\u7f13\u51fa', out: '\u51cf\u901f\u7ed3\u675f',
            decimals: '\u5c0f\u6570\u4f4d\u6570', minDigits: '\u6574\u6570\u6700\u5c11\u4f4d\u6570', prefix: '\u6570\u5b57\u524d\u7f00', suffix: '\u6570\u5b57\u540e\u7f00',
            consent: '\u5141\u8bb8\u66ff\u6362\u5df2\u6709\u6587\u5b57\u8f93\u5165\uff08\u4fdd\u7559\u539f\u63a7\u5236\u5668\uff0c\u53ef\u6062\u590d\uff09',
            apply: '\u5e94\u7528 / \u66f4\u65b0\u52a8\u753b', restore: '\u6062\u590d\u539f\u6587\u5b57\u8f93\u5165', first: '\u67e5\u770b\u8d77\u70b9', middle: '\u67e5\u770b\u4e2d\u95f4', last: '\u67e5\u770b\u7ec8\u70b9',
            note: '\u5e94\u7528\u540e\u8bf7\u4fdd\u5b58\u5de5\u7a0b\u3002\u672c\u7248\u4e3a\u6570\u503c\u9012\u589e\uff0c\u4e0d\u662f\u4e0a\u4e0b\u7ffb\u6eda\u7684\u673a\u68b0\u6570\u5b57\u8f6e\u3002', ready: '\u9009\u62e9\u6587\u672c\u5c42\uff0c\u518d\u8bbe\u7f6e\u6570\u503c\u4e0e\u65f6\u95f4\u3002',
            loaded: '\u5df2\u8bfb\u53d6\u53c2\u6570\uff1b\u4e0d\u4f1a\u6539\u52a8\u5176\u4ed6\u56fe\u5c42\u3002', done: '\u5df2\u5e94\u7528\u3002\u8bf7\u4fdd\u5b58\u5de5\u7a0b\u4ee5\u4fdd\u7559\u52a8\u753b\u3002', restored: '\u5df2\u6062\u590d\u539f\u6587\u5b57\u8f93\u5165\uff0c\u8ba1\u6570\u5668\u4fdd\u7559\u4ee5\u4fbf\u518d\u6b21\u5e94\u7528\u3002',
            existing: '\u68c0\u6d4b\u5230\u5df2\u6709\u6587\u5b57\u8f93\u5165\uff0c\u5df2\u8bfb\u53d6\u53ef\u8bc6\u522b\u7684\u53c2\u6570\uff1b\u63a5\u7ba1\u524d\u9700\u52fe\u9009\u5141\u8bb8\u66ff\u6362\u3002',
            preview: '\u5f53\u524d\u5e27\u6570\u503c\u9884\u89c8\uff1a', duration: '\u5e27\u8303\u56f4\uff1a',
            selectText: '\u8bf7\u9009\u62e9\u4e00\u4e2a\u6587\u672c\u5c42\uff0c\u6216\u8be5\u6587\u672c\u5c42\u4e0b\u7684\u8ba1\u6570\u5668\u3002', staleTarget: '\u5de5\u7a0b\u6216\u76ee\u6807\u5df2\u53d8\u5316\uff0c\u8bf7\u5237\u65b0\u5e76\u91cd\u65b0\u9009\u62e9\u3002',
            invalidNumber: '\u8bf7\u8f93\u5165\u6709\u6548\u7684\u6570\u503c\u3002', valueRange: '\u8d77\u59cb\u4e0e\u7ed3\u675f\u503c\u8303\u56f4\u4e3a\u6b63\u8d1f\u5341\u4ebf\u3002', frameRange: '\u5e27\u4f4d\u7f6e\u987b\u4e3a\u6b63\u8d1f\u4e00\u767e\u4e07\u4ee5\u5185\u7684\u6574\u6570\u3002',
            timeOrder: '\u7ed3\u675f\u65f6\u95f4\u5fc5\u987b\u665a\u4e8e\u5f00\u59cb\u65f6\u95f4\uff0c\u81f3\u5c11\u76f8\u5dee\u4e00\u5e27\u3002', formatRange: '\u5c0f\u6570\u4f4d\u4e3a0\u20136\uff0c\u6574\u6570\u6700\u5c11\u4f4d\u6570\u4e3a1\u201312\u3002',
            easingRange: '\u8bf7\u9009\u62e9\u6709\u6548\u7684\u7f13\u52a8\u65b9\u5f0f\u3002', affixRange: '\u524d\u540e\u7f00\u6700\u591a128\u5b57\u7b26\uff0c\u4e0d\u652f\u6301\u6362\u884c\u6216\u63a7\u5236\u5b57\u7b26\u3002',
            existingInput: '\u6587\u5b57\u5df2\u6709\u8f93\u5165\uff0c\u987b\u5148\u52fe\u9009\u5141\u8bb8\u66ff\u6362\u3002', changedInput: '\u6587\u5b57\u5df2\u8fde\u63a5\u5176\u4ed6\u8f93\u5165\uff0c\u4e3a\u907f\u514d\u8986\u76d6\u5df2\u505c\u6b62\u64cd\u4f5c\u3002',
            manualParameters: '\u63a7\u5236\u5668\u53c2\u6570\u88ab\u624b\u52a8\u6253\u5173\u952e\u5e27\u6216\u8fde\u63a5\uff0c\u8bf7\u5148\u5904\u7406\u6216\u53e6\u9009\u6587\u672c\u5c42\u3002', duplicateCounter: '\u68c0\u6d4b\u5230\u591a\u4e2a\u8ba1\u6570\u5668\uff0c\u8bf7\u5148\u5904\u7406\u91cd\u590d\u9879\u3002',
            noCounter: '\u8fd9\u4e2a\u6587\u672c\u5c42\u6ca1\u6709\u672c\u63d2\u4ef6\u8ba1\u6570\u5668\u3002', originalMissing: '\u539f\u8f93\u5165\u56fe\u5c42\u5df2\u88ab\u5220\u9664\uff0c\u65e0\u6cd5\u5b89\u5168\u6062\u590d\u3002',
            createFailed: '\u65e0\u6cd5\u521b\u5efa\u8ba1\u6570\u5668\u3002', connectFailed: '\u8ba1\u6570\u5668\u8fde\u63a5\u5931\u8d25\u3002', rollbackFailed: '\u6062\u590d\u672a\u5b8c\u6210\uff0c\u8bf7\u4f7f\u7528\u64a4\u9500\u6216\u573a\u666f\u5907\u4efd\u3002'
        }
    };
    function showUI(a, ui) {
        var language = 'zh', binding = null, ids = [], fields = {}, labels = [], buttons = [], filling = false, unitIndex = 0;
        function tr(key) { return messages[language][key] || messages.en[key] || key; }
        ui.setTitle('Text Time Roll ' + VERSION); ui.setMinimumWidth(660); ui.setMinimumHeight(640);
        var main = new ui.VLayout(); main.setMargins(14, 12, 14, 12); main.setSpaceBetween(9);
        var top = new ui.HLayout(), title = new ui.Label('Text Time Roll ' + VERSION), lang = new ui.Button('\u4e2d\u6587 / EN');
        title.setTextColor('#ffc14d'); top.add(title); top.addStretch(); top.add(lang); main.add(top);
        var intro = new ui.Label(''); main.add(intro);
        function row(key, widget) { var h = new ui.HLayout(), l = new ui.Label(''); l.setMinimumWidth(185); h.add(l); h.addStretch(); widget.setMinimumWidth(290); h.add(widget); main.add(h); labels.push({w:l,key:key}); }
        var target = new ui.DropDown(); row('target', target);
        function button(key, fn, layout) { var b = new ui.Button(''); b.onClick = function () { try { fn(); } catch (e) { error(e); } }; buttons.push({w:b,key:key}); layout.add(b); return b; }
        var picks = new ui.HLayout(); button('read', readSelection, picks); button('reload', refresh, picks); main.add(picks);
        function numeric(key, low, high, integer) { var w = new ui.NumericField(0); w.setType(integer ? 0 : 1); w.setMin(low); w.setMax(high); w.setStep(integer ? 1 : 0.1); fields[key] = w; row(key, w); w.onValueChanged = preview; }
        numeric('startValue', -1e9, 1e9, false); numeric('endValue', -1e9, 1e9, false);
        var units = new ui.DropDown(); row('unit', units);
        numeric('startFrame', -1e6, 1e6, false); numeric('endFrame', -1e6, 1e6, false);
        var easing = new ui.DropDown(); row('easing', easing);
        numeric('decimals', 0, 6, true); numeric('minDigits', 1, 12, true);
        ['prefix','suffix'].forEach(function (key) { var w = new ui.LineEdit(); fields[key] = w; row(key, w); w.onValueChanged = preview; });
        var consent = new ui.Checkbox(false), consentLabel = new ui.Label(''), ch = new ui.HLayout(); consentLabel.setMinimumWidth(530); ch.add(consent); ch.add(consentLabel); ch.addStretch(); main.add(ch);
        var timing = new ui.Label(''), output = new ui.Label(''), status = new ui.Label('');
        output.setTextColor('#ffc14d'); main.add(timing); main.add(output);
        var run = new ui.HLayout(); button('apply', function () {
            if (!binding) fail('selectText'); var result = apply(a, binding, values(), consent.getValue());
            consent.setValue(false); status.setText(tr('done')); status.setTextColor('#74d29a'); preview(); return result;
        }, run); button('restore', function () { if (!binding) fail('selectText'); restore(a,binding); status.setText(tr('restored')); }, run); main.add(run);
        var seek = new ui.HLayout();
        [['first',0],['middle',0.5],['last',1]].forEach(function (x) { button(x[0],function () { if(!binding)fail('selectText');assertBinding(a,binding);var c=values();a.setFrame(Math.round(c.startFrame+(c.endFrame-c.startFrame)*x[1]));preview(); },seek); });main.add(seek);
        main.add(status); var note = new ui.Label(''); main.add(note);
        function error(e) { status.setText(tr(e.code || String(e.message || e))); status.setTextColor('#ff8585'); }
        function fps() { return a.get(a.getActiveComp(),'fps'); }
        function values() {
            var frames = framesFromUnits(fields.startFrame.getValue(),fields.endFrame.getValue(),unitIndex ? 'seconds' : 'frames',fps());
            return validate({startValue:fields.startValue.getValue(),endValue:fields.endValue.getValue(),startFrame:frames[0],endFrame:frames[1],easing:easing.getValue(),decimals:fields.decimals.getValue(),minDigits:fields.minDigits.getValue(),prefix:fields.prefix.getText(),suffix:fields.suffix.getText()});
        }
        function fill(c) { filling=true;['startValue','endValue','decimals','minDigits'].forEach(function(k){fields[k].setValue(c[k]);});['startFrame','endFrame'].forEach(function(k){fields[k].setValue(c[k]/(unitIndex?fps():1));});fields.prefix.setText(c.prefix);fields.suffix.setText(c.suffix);easing.setValue(c.easing);filling=false;preview(); }
        function preview() { if(filling)return;try{var c=values();timing.setText(tr('duration')+c.startFrame+' - '+c.endFrame+' / '+fps()+' fps / '+((c.endFrame-c.startFrame)/fps()).toFixed(2)+' s');output.setText(tr('preview')+textAt(c,a.getFrame()));}catch(e){timing.setText(tr(e.code||e.message));output.setText('');} }
        function choose() {
            if(filling)return;var idx=target.getValue()-1;binding=null;consent.setValue(false);
            if(idx<0||!ids[idx]){status.setText(tr('ready'));return;}
            try { binding=bind(a,ids[idx]);var loaded=load(a,binding);fill(loaded.config||defaults(a.getFrame(),fps()));status.setText(tr(loaded.existing&&!loaded.active?'existing':'loaded'));status.setTextColor('#eeeeee'); }catch(e){error(e);}
        }
        function refresh() { filling=true;binding=null;ids=a.getCompLayersOfType(false,'textShape');target.clear();target.addEntry(tr('choose'));ids.forEach(function(id){target.addEntry(a.getNiceName(id)+' ['+id+']');});target.setValue(0);filling=false;consent.setValue(false);status.setText(tr('ready')); }
        function readSelection() { var sel=a.getSelection();if(sel.length!==1)fail('selectText');var id=sel[0];if(a.getLayerType(id)!=='textShape')id=a.getParent(id);if(!id||a.getLayerType(id)!=='textShape')fail('selectText');refresh();var i=ids.indexOf(id);if(i<0)fail('selectText');target.setValue(i+1);choose(); }
        target.onValueChanged=choose; easing.onValueChanged=preview;
        units.onValueChanged=function(){if(filling)return;var old=unitIndex,next=units.getValue();if(next===old)return;filling=true;['startFrame','endFrame'].forEach(function(k){var v=fields[k].getValue();fields[k].setValue(old?v*fps():v/fps());});unitIndex=next;filling=false;preview();};
        function localise() {
            // Relabel in place: keep unsaved drafts, selection, units and consent.
            var selected=target.getValue(), mode=easing.getValue(); filling=true;
            labels.forEach(function(x){x.w.setText(tr(x.key));});
            buttons.forEach(function(x){x.w.setText(tr(x.key));});
            intro.setText(tr('description'));lang.setText(tr('language'));
            note.setText(tr('note'));consentLabel.setText(tr('consent'));
            target.clear();target.addEntry(tr('choose'));
            ids.forEach(function(id){target.addEntry(a.layerExists(id)?a.getNiceName(id)+' ['+id+']':id);});
            target.setValue(selected>=0?selected:0);
            units.clear();units.addEntry(tr('frames'));units.addEntry(tr('seconds'));units.setValue(unitIndex);
            easing.clear();['linear','smooth','out'].forEach(function(k){easing.addEntry(tr(k));});easing.setValue(mode>=0?mode:1);
            filling=false;status.setText(tr(binding?'loaded':'ready'));preview();
        }
        lang.onClick=function(){language=language==='zh'?'en':'zh';localise();};
        // Use our own visible labels instead of relying on third-party translated native UI.
        localise(); refresh(); fill(defaults(a.getFrame(),fps()));
        var scroll = new ui.ScrollView();scroll.setLayout(main);ui.add(scroll);ui.show();
        try { if(a.getSelection().length===1)readSelection(); }catch(e){}
        return {target:target,fields:fields,units:units,easing:easing,consent:consent,languageButton:lang,buttons:buttons,refresh:refresh,status:status,output:output,timing:timing};
    }
    return {version:VERSION,fields:FIELDS,messages:messages,validate:validate,defaults:defaults,ease:ease,sample:sample,formatNumber:formatNumber,
        textAt:textAt,framesFromUnits:framesFromUnits,expression:expression,bind:bind,load:load,apply:apply,restore:restore,findCounter:findCounter,showUI:showUI};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TextTimeRoll;
else if (typeof api !== 'undefined' && typeof ui !== 'undefined') TextTimeRoll.showUI(api, ui);
