/* Text Time Roll for Cavalry v0.1.1 | MIT License
 * A numeric counter with optional per-digit vertical wheels.
 * No filesystem, network, telemetry or platform-specific dependencies.
 */
var TextTimeRoll = (function () {
    'use strict';
    var VERSION = '0.1.1';
    var MAGIC = 'cavalry-text-time-roll';
    var MARK = '// TTR_COUNTER_SCHEMA_1';
    var FIELDS = [
        ['CurrentFrame', 'double'], ['StartValue', 'double'], ['EndValue', 'double'],
        ['StartFrame', 'double'], ['EndFrame', 'double'], ['Easing', 'int'],
        ['DecimalPlaces', 'int'], ['MinDigits', 'int'], ['Prefix', 'string'],
        ['Suffix', 'string'], ['TTRState', 'string'], ['DigitOrder', 'int'], ['RollDirection', 'int'], ['Stagger', 'double']
    ];
    var KEYS = ['currentFrame', 'startValue', 'endValue', 'startFrame', 'endFrame',
        'easing', 'decimals', 'minDigits', 'prefix', 'suffix', null, 'order', 'roll', 'stagger'];
    function copy(value) { return JSON.parse(JSON.stringify(value)); }
    function fail(code) { var e = new Error(code); e.code = code; throw e; }
    function finite(value) { return typeof value === 'number' && isFinite(value); }
    // IDs 0/1/2 retain v0.1.0 semantics. Presets are independently implemented.
    var EASINGS = [
        ['Linear','\u7ebf\u6027'],['Smoothstep','\u5e73\u6ed1\u7f13\u5165\u7f13\u51fa'],['Cubic Out','\u4e09\u6b21 \xb7 \u7f13\u51fa'],
        ['Sine In','\u6b63\u5f26 \xb7 \u7f13\u5165'],['Sine Out','\u6b63\u5f26 \xb7 \u7f13\u51fa'],['Sine In Out','\u6b63\u5f26 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Quad In','\u4e8c\u6b21 \xb7 \u7f13\u5165'],['Quad Out','\u4e8c\u6b21 \xb7 \u7f13\u51fa'],['Quad In Out','\u4e8c\u6b21 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Cubic In','\u4e09\u6b21 \xb7 \u7f13\u5165'],['Cubic In Out','\u4e09\u6b21 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Quart In','\u56db\u6b21 \xb7 \u7f13\u5165'],['Quart Out','\u56db\u6b21 \xb7 \u7f13\u51fa'],['Quart In Out','\u56db\u6b21 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Quint In','\u4e94\u6b21 \xb7 \u7f13\u5165'],['Quint Out','\u4e94\u6b21 \xb7 \u7f13\u51fa'],['Quint In Out','\u4e94\u6b21 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Expo In','\u6307\u6570 \xb7 \u7f13\u5165'],['Expo Out','\u6307\u6570 \xb7 \u7f13\u51fa'],['Expo In Out','\u6307\u6570 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Circ In','\u5706\u5f62 \xb7 \u7f13\u5165'],['Circ Out','\u5706\u5f62 \xb7 \u7f13\u51fa'],['Circ In Out','\u5706\u5f62 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Back In','\u56de\u62c9 \xb7 \u7f13\u5165'],['Back Out','\u56de\u62c9 \xb7 \u7f13\u51fa'],['Back In Out','\u56de\u62c9 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Elastic In','\u5f39\u6027 \xb7 \u7f13\u5165'],['Elastic Out','\u5f39\u6027 \xb7 \u7f13\u51fa'],['Elastic In Out','\u5f39\u6027 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Bounce In','\u5f39\u8df3 \xb7 \u7f13\u5165'],['Bounce Out','\u5f39\u8df3 \xb7 \u7f13\u51fa'],['Bounce In Out','\u5f39\u8df3 \xb7 \u7f13\u5165\u7f13\u51fa'],
        ['Steps (8)','\u9636\u68af \xb7 8\u6bb5'],['Hold to End','\u4fdd\u6301\u81f3\u672b\u5e27']
    ];
    function bounce(u) {
        var a=7.5625, b=2.75;
        if(u<1/b)return a*u*u;
        if(u<2/b){u-=1.5/b;return a*u*u+0.75;}
        if(u<2.5/b){u-=2.25/b;return a*u*u+0.9375;}
        u-=2.625/b;return a*u*u+0.984375;
    }
    function ease(u, mode) {
        if(u<=0)return 0;if(u>=1)return 1;
        var pi=Math.PI,c=1.70158,d=c*1.525;
        if(mode===1)return u*u*(3-2*u);
        if(mode===2)return 1-Math.pow(1-u,3);
        if(mode===3)return 1-Math.cos(u*pi/2);
        if(mode===4)return Math.sin(u*pi/2);
        if(mode===5)return (1-Math.cos(pi*u))/2;
        if(mode>=6&&mode<=16){
            var power=mode<9?2:mode<11?3:mode<14?4:5;
            var kind=mode<9?mode-6:mode<11?(mode===9?0:2):mode<14?mode-11:mode-14;
            if(kind===0)return Math.pow(u,power);
            if(kind===1)return 1-Math.pow(1-u,power);
            return u<0.5?Math.pow(2*u,power)/2:1-Math.pow(2*(1-u),power)/2;
        }
        if(mode===17)return Math.pow(2,10*u-10);
        if(mode===18)return 1-Math.pow(2,-10*u);
        if(mode===19)return u<0.5?Math.pow(2,20*u-10)/2:1-Math.pow(2,-20*u+10)/2;
        if(mode===20)return 1-Math.sqrt(1-u*u);
        if(mode===21)return Math.sqrt(1-(u-1)*(u-1));
        if(mode===22)return u<0.5?(1-Math.sqrt(1-4*u*u))/2:(Math.sqrt(1-Math.pow(-2*u+2,2))+1)/2;
        if(mode===23)return (c+1)*u*u*u-c*u*u;
        if(mode===24)return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2);
        if(mode===25)return u<0.5?Math.pow(2*u,2)*((d+1)*2*u-d)/2:(Math.pow(2*u-2,2)*((d+1)*(2*u-2)+d)+2)/2;
        if(mode===26)return -Math.pow(2,10*u-10)*Math.sin((10*u-10.75)*2*pi/3);
        if(mode===27)return Math.pow(2,-10*u)*Math.sin((10*u-0.75)*2*pi/3)+1;
        if(mode===28)return u<0.5?-(Math.pow(2,20*u-10)*Math.sin((20*u-11.125)*2*pi/4.5))/2:Math.pow(2,-20*u+10)*Math.sin((20*u-11.125)*2*pi/4.5)/2+1;
        if(mode===29)return 1-bounce(1-u);
        if(mode===30)return bounce(u);
        if(mode===31)return u<0.5?(1-bounce(1-2*u))/2:(1+bounce(2*u-1))/2;
        if(mode===32)return Math.floor(u*8)/8;
        if(mode===33)return 0;
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
        if(c.order===undefined)c.order=0;if(c.roll===undefined)c.roll=0;if(c.stagger===undefined)c.stagger=0.35;
        ['startValue', 'endValue', 'startFrame', 'endFrame', 'easing', 'decimals', 'minDigits'].forEach(function (key) {
            if (!finite(c[key])) fail('invalidNumber');
        });
        if (Math.abs(c.startValue) > 1e9 || Math.abs(c.endValue) > 1e9) fail('valueRange');
        if (Math.abs(c.startFrame) > 1e6 || Math.abs(c.endFrame) > 1e6 ||
            Math.floor(c.startFrame) !== c.startFrame || Math.floor(c.endFrame) !== c.endFrame) fail('frameRange');
        if (c.endFrame <= c.startFrame) fail('timeOrder');
        if (Math.floor(c.decimals) !== c.decimals || c.decimals < 0 || c.decimals > 6) fail('formatRange');
        if (Math.floor(c.minDigits) !== c.minDigits || c.minDigits < 1 || c.minDigits > 12) fail('formatRange');
        if (Math.floor(c.easing)!==c.easing || c.easing<0 || c.easing>=EASINGS.length) fail('easingRange');
        if([0,1,2].indexOf(c.order)<0||[0,1,2].indexOf(c.roll)<0||!finite(c.stagger)||c.stagger<0||c.stagger>0.8)fail('rollRange');
        ['prefix', 'suffix'].forEach(function (key) {
            if (typeof c[key] !== 'string' || c[key].length > 128 || /[\x00-\x1F\x7F]/.test(c[key])) fail('affixRange');
        });
        return c;
    }
    function defaults(frame, fps) {
        return {startValue: 1978, endValue: 2026, startFrame: Math.round(frame),
            endFrame: Math.round(frame) + Math.max(1, Math.round(fps)), easing: 1,
            decimals: 0, minDigits: 4, prefix: '', suffix: '', order:0, roll:0, stagger:0.35};
    }
    function framesFromUnits(start, end, units, fps) {
        if (!finite(start) || !finite(end) || !finite(fps) || fps <= 0) fail('invalidNumber');
        var factor = units === 'seconds' ? fps : 1;
        return [Math.round(start * factor), Math.round(end * factor)];
    }
    function characters(text) { return text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g)||[]; }
    function mod10(x) { return ((x%10)+10)%10; }
    function wheelState(c, frame) {
        var u=Math.max(0,Math.min(1,(frame-c.startFrame)/(c.endFrame-c.startFrame)));
        var digits=Math.max(c.minDigits,Math.abs(c.startValue).toFixed(c.decimals).split('.')[0].length,Math.abs(c.endValue).toFixed(c.decimals).split('.')[0].length);
        var first=formatNumber(Math.abs(c.startValue),c.decimals,digits,'','');
        var last=formatNumber(Math.abs(c.endValue),c.decimals,digits,'','');
        var sign=Number((u<0.5?c.startValue:c.endValue).toFixed(c.decimals))<0?'-':'';
        var glyphs=[], rank=0, total=first.replace(/[^0-9]/g,'').length;
        characters(c.prefix+sign).forEach(function(ch){glyphs.push({char:ch});});
        for(var i=0;i<first.length;i++){
            if(first.charAt(i)==='.'){glyphs.push({char:'.'});continue;}
            var start=Number(first.charAt(i)),end=Number(last.charAt(i));
            var slot=c.order===2?total-1-rank:rank;
            var delay=c.order===0||total<2?0:c.stagger*slot/(total-1);
            var local=c.order===0||total<2?u:Math.max(0,Math.min(1,(u-delay)/(1-c.stagger)));
            var direction=c.endValue>=c.startValue?1:-1;
            var steps=direction===1?mod10(end-start):mod10(start-end);
            var x=start+direction*steps*ease(local,c.easing);
            var base=direction===1?Math.floor(x):Math.ceil(x);
            var mix=Math.max(0,Math.min(1,Math.abs(x-base)));
            var from=mod10(base),to=mod10(base+direction);
            if(!steps||local<=0){from=start;to=start;mix=0;}
            if(local>=1){from=end;to=end;mix=0;}
            var shown=mix<0.5?from:to;
            glyphs.push({char:String(shown),digit:true,from:from,to:to,mix:mix});rank++;
        }
        characters(c.suffix).forEach(function(ch){glyphs.push({char:ch});});
        return {text:glyphs.map(function(g){return g.char;}).join(''),glyphs:glyphs};
    }
    function textAt(c, frame) {
        if(c.roll)return wheelState(c,frame).text;
        return formatNumber(sample(frame,c.startValue,c.endValue,c.startFrame,c.endFrame,c.easing),c.decimals,c.minDigits,c.prefix,c.suffix);
    }
    function sharedExpression() {
        return [bounce,ease,sample,formatNumber,characters,mod10,wheelState,textAt].map(function(f){return f.toString();}).join('\n')+
            '\nvar config={startValue:StartValue,endValue:EndValue,startFrame:StartFrame,endFrame:EndFrame,easing:Easing,decimals:DecimalPlaces,minDigits:MinDigits,prefix:Prefix,suffix:Suffix,order:DigitOrder,roll:RollDirection,stagger:Stagger};\n';
    }
    function expression() { return MARK+'\n'+sharedExpression()+'textAt(config,CurrentFrame);'; }
    function renderWheels(def, cavalry, atlas, state, direction) {
        var glyphs=[];
        function collect(mesh,depth){if(depth===3){glyphs.push(mesh);return;}for(var i=0;i<mesh.childMeshCount();i++)collect(mesh.getChildMeshAtIndex(i),depth+1);}
        collect(atlas,0);
        if(glyphs.length!==10)throw new Error('TTR atlas must contain ten single-line digits');
        var meshes=def.getMeshesAtDepth(3), chars=state.glyphs;
        if(meshes.length!==chars.length){chars=chars.filter(function(g){return !/\s/.test(g.char);});}
        if(meshes.length!==chars.length)throw new Error('TTR rolling requires one glyph per character');
        var boxes=glyphs.map(function(m){return m.getBoundingBox();});
        var bottom=Math.min.apply(null,boxes.map(function(b){return b.bottom;}));
        var top=Math.max.apply(null,boxes.map(function(b){return b.top;}));
        var pad=(top-bottom)*0.08, height=top-bottom+2*pad, sign=direction===1?1:-1;
        for(var i=0;i<meshes.length;i++){
            var g=chars[i];if(!g.digit||g.mix<0.000001||g.from===g.to)continue;
            var current=meshes[i],box=current.getBoundingBox();if(box.width<=0||box.height<=0)continue;
            var dy=box.bottom-boxes[Number(g.char)].bottom;
            var clip=new cavalry.Path();clip.addRect(box.left-height,bottom+dy-pad,box.right+height,top+dy+pad);
            var out=glyphs[g.from].getFlattenedPath(), incoming=glyphs[g.to].getFlattenedPath();
            out.translate(box.centre.x-boxes[g.from].centre.x,dy+sign*g.mix*height);
            incoming.translate(box.centre.x-boxes[g.to].centre.x,dy+sign*(g.mix-1)*height);
            out.intersect(clip);incoming.intersect(clip);
            out.append(incoming);current.setPathAtIndex(0,out);
            for(var p=1;p<current.count();p++)current.setPathAtIndex(p,new cavalry.Path());
            def.setMeshAtDepthAtIndex(3,i,current);
        }
    }
    function rollExpression() { return '// TTR_ROLL_SCHEMA_1\n'+sharedExpression()+'\n'+renderWheels.toString()+'\nif(RollDirection)renderWheels(def,cavalry,GlyphAtlas.mesh,wheelState(config,CurrentFrame),RollDirection);'; }
    function sourceId(input) { return String(input || '').split('.')[0]; }
    function owned(a, id, target) {
        if (!id || !a.layerExists(id) || a.getLayerType(id) !== 'javaScript' || a.getParent(id) !== target) return null;
        try {
            if (String(a.get(id, 'expression')).indexOf(MARK) !== 0) return null;
            var data = JSON.parse(a.get(id, 'array.10'));
            return data.magic === MAGIC && (data.schema === 1 || data.schema === 2) && data.target === target ? data : null;
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
        for (var i = 1; i < Math.min(KEYS.length,a.getArrayCount(id,'array')); i++) if(KEYS[i])c[KEYS[i]] = a.get(id, 'array.' + i);
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
        for (var i = 1; i < KEYS.length; i++) if(KEYS[i])values['array.' + i] = c[KEYS[i]];
        a.set(id, values);
    }
    function deformers(a,target) {
        var list=[];for(var i=0;i<a.getArrayCount(target,'deformers');i++)list.push(a.getInConnection(target,'deformers.'+i)||'');return list;
    }
    function connectString(a,source,to,attr) { if(source){var dot=source.indexOf('.');a.connect(source.substring(0,dot),source.substring(dot+1),to,attr);} }
    function writeDeformers(a,target,list) {
        // Cavalry may reset a behaviour's levelMode when its connection is moved.
        // Preserve that authored setting while inserting/removing our first slot.
        if(JSON.stringify(deformers(a,target))===JSON.stringify(list))return;
        var modes=[], seen={};
        deformers(a,target).concat(list).forEach(function(input){
            var id=sourceId(input);if(!id||seen[id]||!a.layerExists(id))return;seen[id]=true;
            if(a.getAttributes(id).indexOf('levelMode')>=0)modes.push({id:id,value:a.get(id,'levelMode'),input:a.getInConnection(id,'levelMode')||''});
        });
        // Disconnecting array inputs shrinks/reindexes this array in Cavalry.
        // Remove slots from the end instead of disconnecting forward by index.
        for(var i=a.getArrayCount(target,'deformers')-1;i>=0;i--)a.removeArrayIndex(target,'deformers.'+i);
        for(var n=0;n<list.length;n++)a.addArrayIndex(target,'deformers');
        for(var j=0;j<list.length;j++)connectString(a,list[j],target,'deformers.'+j);
        if(JSON.stringify(deformers(a,target))!==JSON.stringify(list))fail('connectFailed');
        modes.forEach(function(m){if(m.input){if(a.getInConnection(m.id,'levelMode')!==m.input){a.disconnectInput(m.id,'levelMode');connectString(a,m.input,m.id,'levelMode');}}else a.set(m.id,{levelMode:m.value});});
    }
    function ensureFields(a,id,roll) {
        for(var n=a.getArrayCount(id,'array');n<FIELDS.length;n++)a.addDynamic(id,'array',roll&&n===10?'layerId':FIELDS[n][1]);
        for(var i=0;i<FIELDS.length;i++)a.renameAttribute(id,'array.'+i,roll&&i===10?'GlyphAtlas':FIELDS[i][0]);
    }
    function assertRig(a,id,meta) {
        if(!meta.rig)return;
        var r=meta.rig;
        if(!a.layerExists(r.atlas)||!a.layerExists(r.deformer)||a.getParent(r.atlas)!==id||a.getParent(r.deformer)!==id||
            a.getLayerType(r.atlas)!=='textShape'||a.getLayerType(r.deformer)!=='javaScriptDeformer'||String(a.get(r.deformer,'expression')).indexOf('// TTR_ROLL_SCHEMA_1')!==0)fail('changedRig');
        for(var i=0;i<FIELDS.length;i++){
            var expected=i===10?r.atlas+'.id':id+'.array.'+i;
            if(a.getInConnection(r.deformer,'array.'+i)!==expected)fail('changedRig');
        }
        if(a.getInConnection(r.atlas,'font')!==meta.target+'.font'||a.getInConnection(r.atlas,'fontSize')!==meta.target+'.fontSize'||a.get(r.atlas,'on')!==false)fail('changedRig');
    }
    function addRig(a,id,meta,made) {
        var atlas=a.create('textShape','TTR Glyph Atlas');made.push(atlas);a.parent(atlas,id);
        a.set(atlas,{text:'0123456789',autoName:false,autoWidth:true,autoHeight:true,on:false});
        a.connect(meta.target,'font',atlas,'font');a.connect(meta.target,'fontSize',atlas,'fontSize');
        var axes=a.getArrayCount(meta.target,'fontAxes');
        while(a.getArrayCount(atlas,'fontAxes')<axes)a.addArrayIndex(atlas,'fontAxes');
        for(var q=0;q<axes;q++)a.connect(meta.target,'fontAxes.'+q,atlas,'fontAxes.'+q);
        var d=a.create('javaScriptDeformer','TTR Digit Roll');made.push(d);a.parent(d,id);ensureFields(a,d,true);
        for(var i=0;i<FIELDS.length;i++)a.connect(i===10?atlas:id,i===10?'id':'array.'+i,d,'array.'+i);
        a.set(d,{expression:rollExpression()});a.disconnectInput(atlas,'on');a.set(atlas,{on:false});meta.rig={atlas:atlas,deformer:d};
    }
    function apply(a,b,config,allowExisting) {
        assertBinding(a,b);var c=validate(config),target=b.target,id=findCounter(a,target);
        var input=a.getInConnection(target,'text')||'',meta=id?owned(a,id,target):null;
        if(input&&input!==id+'.id'&&!(meta&&input===meta.original.input)&&!allowExisting)fail('existingInput');
        if(meta&&input&&input!==id+'.id'&&input!==meta.original.input)fail('changedInput');
        if(id){
            if(a.getInConnection(id,'array.0')!==b.comp+'.time')fail('manualParameters');
            for(var i=1;i<Math.min(KEYS.length,a.getArrayCount(id,'array'));i++)if(KEYS[i]&&(a.getInConnection(id,'array.'+i)||a.getKeyframeTimes(id,'array.'+i).length))fail('manualParameters');
            assertRig(a,id,meta);
        }
        var before=originalState(a,target),beforeDefs=deformers(a,target),old=null,made=[];
        if(id){old={count:a.getArrayCount(id,'array'),expression:a.get(id,'expression'),name:a.getNiceName(id),values:{}};for(var k=1;k<old.count;k++)old.values['array.'+k]=a.get(id,'array.'+k);}
        try{
            if(!id){id=a.create('javaScript','TTR Counter v'+VERSION);if(!id||!a.layerExists(id))fail('createFailed');made.push(id);a.parent(id,target);meta={magic:MAGIC,schema:2,version:VERSION,target:target,original:before};a.connect(b.comp,'time',id,'array.0');}
            ensureFields(a,id,false);setConfig(a,id,c);a.set(id,{expression:expression()});
            meta.schema=2;meta.version=VERSION;
            if(c.roll&&!meta.rig)addRig(a,id,meta,made);
            if(meta.rig){
                var d=meta.rig.deformer,list=beforeDefs.filter(function(x){return x!==d+'.id';});
                if(c.roll)list.unshift(d+'.id');
                writeDeformers(a,target,list);
            }
            a.set(id,{'array.10':JSON.stringify(meta)});a.rename(id,'TTR Counter v'+VERSION);
            a.set(target,{autoName:false});a.disconnectInput(target,'text');a.connect(id,'id',target,'text');
            if(a.getInConnection(target,'text')!==id+'.id')fail('connectFailed');
            return {counter:id,target:target,config:c,created:!old};
        }catch(e){
            var errors=[];
            try{writeDeformers(a,target,beforeDefs);reconnect(a,target,before);}catch(r){errors.push(String(r));}
            for(var n=made.length-1;n>=0;n--)try{if(a.layerExists(made[n]))a.deleteLayer(made[n]);}catch(r2){errors.push(String(r2));}
            if(old)try{a.set(id,old.values);a.set(id,{expression:old.expression});a.rename(id,old.name);while(a.getArrayCount(id,'array')>old.count)a.removeArrayIndex(id,'array.'+(a.getArrayCount(id,'array')-1));}catch(r3){errors.push(String(r3));}
            if(errors.length)fail('rollbackFailed');throw e;
        }
    }
    function restore(a,b) {
        assertBinding(a,b);var id=findCounter(a,b.target),meta=id?owned(a,id,b.target):null;
        if(!meta)fail('noCounter');if(a.getInConnection(b.target,'text')!==id+'.id')fail('changedInput');
        if(meta.original.input&&!a.layerExists(sourceId(meta.original.input)))fail('originalMissing');
        var before=originalState(a,b.target),list=deformers(a,b.target);
        try{if(meta.rig)writeDeformers(a,b.target,list.filter(function(x){return x!==meta.rig.deformer+'.id';}));reconnect(a,b.target,meta.original);}
        catch(e){writeDeformers(a,b.target,list);reconnect(a,b.target,before);throw e;}return id;
    }
    function isAtlas(a,id) {
        var parent=a.getParent(id);if(!parent||a.getLayerType(parent)!=='javaScript')return false;
        try{var meta=JSON.parse(a.get(parent,'array.10'));return meta.magic===MAGIC&&meta.rig&&meta.rig.atlas===id;}catch(e){return false;}
    }
    var messages = {
    "en": {
        "title": "Text Time Roll",
        "language": "\u4e2d\u6587 / EN",
        "description": "Animate a year or number on one text layer. Existing layout and entrance stay intact.",
        "target": "Target text layer",
        "choose": "Select a text layer...",
        "read": "Read selected layer",
        "reload": "Refresh layer list",
        "startValue": "Start value",
        "endValue": "End value",
        "unit": "Time unit",
        "frames": "Frames",
        "seconds": "Seconds",
        "startFrame": "Start time",
        "endFrame": "End time",
        "easing": "Easing",
        "linear": "Linear",
        "smooth": "Ease in / out",
        "out": "Ease out",
        "decimals": "Decimal places",
        "minDigits": "Minimum integer digits",
        "prefix": "Prefix",
        "suffix": "Suffix",
        "consent": "Allow replacing the existing text input (original is kept)",
        "apply": "Apply / Update",
        "restore": "Restore original text",
        "first": "Go to start",
        "middle": "Go to middle",
        "last": "Go to end",
        "note": "Save the Scene after applying. Digit wheels animate independently, not in chronological order.",
        "ready": "Choose a text layer, then set the number and timing.",
        "loaded": "Parameters loaded. Other layers will not be changed.",
        "done": "Applied. Save the Scene to keep this counter.",
        "restored": "Original text input restored. Counter kept for reuse.",
        "existing": "Existing input found. Read its values, then enable replacement to take over.",
        "preview": "Preview at current frame: ",
        "duration": "Frames: ",
        "selectText": "Choose exactly one Text Shape (or its counter).",
        "staleTarget": "The Scene or target changed. Refresh and select again.",
        "invalidNumber": "Enter finite numeric values.",
        "valueRange": "Values must be between -1 billion and +1 billion.",
        "frameRange": "Frame positions must be integers within +/-1,000,000.",
        "timeOrder": "End time must be later than start time (at least one frame).",
        "formatRange": "Decimals: 0-6. Minimum digits: 1-12.",
        "easingRange": "Choose a supported easing.",
        "affixRange": "Prefix/suffix: up to 128 characters, no line breaks.",
        "existingInput": "Text already has an input. Enable replacement explicitly.",
        "changedInput": "Another input was connected; refusing to overwrite it.",
        "manualParameters": "Controller parameters have manual keys/connections. Remove them or use another text layer.",
        "duplicateCounter": "Multiple TTR counters found. Resolve them before applying.",
        "noCounter": "No TTR counter is attached to this text.",
        "originalMissing": "The original input was deleted. Restore it before using this command.",
        "createFailed": "Could not create the counter.",
        "connectFailed": "Could not connect the counter.",
        "rollbackFailed": "Recovery could not be completed. Use Undo or your Scene backup.",
        "roll": "Roll direction",
        "order": "Digit start order",
        "stagger": "Stagger (%)",
        "countOnly": "Number counting only",
        "up": "Roll up",
        "down": "Roll down",
        "together": "All digits together",
        "ltr": "Left to right",
        "rtl": "Right to left",
        "rollRange": "Check roll settings. Stagger must be 0\u201380%.",
        "rollTip": "Number only preserves counting. Up/Down animate digit wheels independently.",
        "orderTip": "Digit start order, not reversed text. Stagger is the share of total duration used to delay the last digit.",
        "easingTip": "Back/Elastic may overshoot; Bounce may reverse. Endpoints remain exact.",
        "changedRig": "Rolling helper layers/wiring changed. Restore the connections first."
    },
    "zh": {
        "title": "\u6587\u672c\u65f6\u95f4\u6eda\u52a8",
        "language": "\u4e2d\u6587 / EN",
        "description": "\u4e3a\u5355\u4e2a\u6587\u672c\u5c42\u6dfb\u52a0\u5e74\u4efd\u6216\u6570\u503c\u9012\u589e\uff0c\u4fdd\u7559\u539f\u6709\u6392\u7248\u548c\u51fa\u573a\u52a8\u753b\u3002",
        "target": "\u76ee\u6807\u6587\u672c\u56fe\u5c42",
        "choose": "\u8bf7\u9009\u62e9\u6587\u672c\u56fe\u5c42...",
        "read": "\u8bfb\u53d6\u6240\u9009\u56fe\u5c42",
        "reload": "\u5237\u65b0\u56fe\u5c42\u5217\u8868",
        "startValue": "\u8d77\u59cb\u6570\u503c",
        "endValue": "\u7ed3\u675f\u6570\u503c",
        "unit": "\u65f6\u95f4\u5355\u4f4d",
        "frames": "\u5e27",
        "seconds": "\u79d2",
        "startFrame": "\u5f00\u59cb\u65f6\u95f4",
        "endFrame": "\u7ed3\u675f\u65f6\u95f4",
        "easing": "\u7f13\u52a8\u65b9\u5f0f",
        "linear": "\u7ebf\u6027",
        "smooth": "\u7f13\u5165\u7f13\u51fa",
        "out": "\u51cf\u901f\u7ed3\u675f",
        "decimals": "\u5c0f\u6570\u4f4d\u6570",
        "minDigits": "\u6574\u6570\u6700\u5c11\u4f4d\u6570",
        "prefix": "\u6570\u5b57\u524d\u7f00",
        "suffix": "\u6570\u5b57\u540e\u7f00",
        "consent": "\u5141\u8bb8\u66ff\u6362\u5df2\u6709\u6587\u5b57\u8f93\u5165\uff08\u4fdd\u7559\u539f\u63a7\u5236\u5668\uff0c\u53ef\u6062\u590d\uff09",
        "apply": "\u5e94\u7528 / \u66f4\u65b0\u52a8\u753b",
        "restore": "\u6062\u590d\u539f\u6587\u5b57\u8f93\u5165",
        "first": "\u67e5\u770b\u8d77\u70b9",
        "middle": "\u67e5\u770b\u4e2d\u95f4",
        "last": "\u67e5\u770b\u7ec8\u70b9",
        "note": "\u5e94\u7528\u540e\u8bf7\u4fdd\u5b58\u5de5\u7a0b\u3002\u4e0a\u4e0b\u6eda\u52a8\u6309\u4f4d\u72ec\u7acb\u8fc7\u6e21\uff0c\u4e2d\u95f4\u6570\u5b57\u4e0d\u4e00\u5b9a\u6309\u5e74\u4efd\u9012\u589e\u3002",
        "ready": "\u9009\u62e9\u6587\u672c\u5c42\uff0c\u518d\u8bbe\u7f6e\u6570\u503c\u4e0e\u65f6\u95f4\u3002",
        "loaded": "\u5df2\u8bfb\u53d6\u53c2\u6570\uff1b\u4e0d\u4f1a\u6539\u52a8\u5176\u4ed6\u56fe\u5c42\u3002",
        "done": "\u5df2\u5e94\u7528\u3002\u8bf7\u4fdd\u5b58\u5de5\u7a0b\u4ee5\u4fdd\u7559\u52a8\u753b\u3002",
        "restored": "\u5df2\u6062\u590d\u539f\u6587\u5b57\u8f93\u5165\uff0c\u8ba1\u6570\u5668\u4fdd\u7559\u4ee5\u4fbf\u518d\u6b21\u5e94\u7528\u3002",
        "existing": "\u68c0\u6d4b\u5230\u5df2\u6709\u6587\u5b57\u8f93\u5165\uff0c\u5df2\u8bfb\u53d6\u53ef\u8bc6\u522b\u7684\u53c2\u6570\uff1b\u63a5\u7ba1\u524d\u9700\u52fe\u9009\u5141\u8bb8\u66ff\u6362\u3002",
        "preview": "\u5f53\u524d\u5e27\u6570\u503c\u9884\u89c8\uff1a",
        "duration": "\u5e27\u8303\u56f4\uff1a",
        "selectText": "\u8bf7\u9009\u62e9\u4e00\u4e2a\u6587\u672c\u5c42\uff0c\u6216\u8be5\u6587\u672c\u5c42\u4e0b\u7684\u8ba1\u6570\u5668\u3002",
        "staleTarget": "\u5de5\u7a0b\u6216\u76ee\u6807\u5df2\u53d8\u5316\uff0c\u8bf7\u5237\u65b0\u5e76\u91cd\u65b0\u9009\u62e9\u3002",
        "invalidNumber": "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u6570\u503c\u3002",
        "valueRange": "\u8d77\u59cb\u4e0e\u7ed3\u675f\u503c\u8303\u56f4\u4e3a\u6b63\u8d1f\u5341\u4ebf\u3002",
        "frameRange": "\u5e27\u4f4d\u7f6e\u987b\u4e3a\u6b63\u8d1f\u4e00\u767e\u4e07\u4ee5\u5185\u7684\u6574\u6570\u3002",
        "timeOrder": "\u7ed3\u675f\u65f6\u95f4\u5fc5\u987b\u665a\u4e8e\u5f00\u59cb\u65f6\u95f4\uff0c\u81f3\u5c11\u76f8\u5dee\u4e00\u5e27\u3002",
        "formatRange": "\u5c0f\u6570\u4f4d\u4e3a0\u20136\uff0c\u6574\u6570\u6700\u5c11\u4f4d\u6570\u4e3a1\u201312\u3002",
        "easingRange": "\u8bf7\u9009\u62e9\u6709\u6548\u7684\u7f13\u52a8\u65b9\u5f0f\u3002",
        "affixRange": "\u524d\u540e\u7f00\u6700\u591a128\u5b57\u7b26\uff0c\u4e0d\u652f\u6301\u6362\u884c\u6216\u63a7\u5236\u5b57\u7b26\u3002",
        "existingInput": "\u6587\u5b57\u5df2\u6709\u8f93\u5165\uff0c\u987b\u5148\u52fe\u9009\u5141\u8bb8\u66ff\u6362\u3002",
        "changedInput": "\u6587\u5b57\u5df2\u8fde\u63a5\u5176\u4ed6\u8f93\u5165\uff0c\u4e3a\u907f\u514d\u8986\u76d6\u5df2\u505c\u6b62\u64cd\u4f5c\u3002",
        "manualParameters": "\u63a7\u5236\u5668\u53c2\u6570\u88ab\u624b\u52a8\u6253\u5173\u952e\u5e27\u6216\u8fde\u63a5\uff0c\u8bf7\u5148\u5904\u7406\u6216\u53e6\u9009\u6587\u672c\u5c42\u3002",
        "duplicateCounter": "\u68c0\u6d4b\u5230\u591a\u4e2a\u8ba1\u6570\u5668\uff0c\u8bf7\u5148\u5904\u7406\u91cd\u590d\u9879\u3002",
        "noCounter": "\u8fd9\u4e2a\u6587\u672c\u5c42\u6ca1\u6709\u672c\u63d2\u4ef6\u8ba1\u6570\u5668\u3002",
        "originalMissing": "\u539f\u8f93\u5165\u56fe\u5c42\u5df2\u88ab\u5220\u9664\uff0c\u65e0\u6cd5\u5b89\u5168\u6062\u590d\u3002",
        "createFailed": "\u65e0\u6cd5\u521b\u5efa\u8ba1\u6570\u5668\u3002",
        "connectFailed": "\u8ba1\u6570\u5668\u8fde\u63a5\u5931\u8d25\u3002",
        "rollbackFailed": "\u6062\u590d\u672a\u5b8c\u6210\uff0c\u8bf7\u4f7f\u7528\u64a4\u9500\u6216\u573a\u666f\u5907\u4efd\u3002",
        "roll": "\u6eda\u52a8\u65b9\u5411",
        "order": "\u6570\u5b57\u542f\u52a8\u987a\u5e8f",
        "stagger": "\u9519\u5cf0\u6bd4\u4f8b\uff08%\uff09",
        "countOnly": "\u4ec5\u6570\u503c\u9012\u589e / \u9012\u51cf",
        "up": "\u5411\u4e0a\u6eda\u52a8",
        "down": "\u5411\u4e0b\u6eda\u52a8",
        "together": "\u6240\u6709\u6570\u5b57\u540c\u6b65",
        "ltr": "\u4ece\u5de6\u5f80\u53f3",
        "rtl": "\u4ece\u53f3\u5f80\u5de6",
        "rollRange": "\u8bf7\u68c0\u67e5\u6eda\u52a8\u53c2\u6570\uff1a\u9519\u5cf0\u8303\u56f4 0\u201380%\u3002",
        "rollTip": "\u4ec5\u6570\u503c\u4fdd\u7559\u8ba1\u6570\uff1b\u5411\u4e0a/\u5411\u4e0b\u4e3a\u5404\u4f4d\u6570\u5b57\u72ec\u7acb\u6eda\u52a8\u3002",
        "orderTip": "\u63a7\u5236\u6570\u5b57\u542f\u52a8\u5148\u540e\uff0c\u4e0d\u53cd\u8f6c\u6587\u5b57\u3002\u9519\u5cf0\u8868\u793a\u6700\u540e\u4e00\u4f4d\u5ef6\u540e\u7684\u603b\u65f6\u957f\u767e\u5206\u6bd4\u3002",
        "easingTip": "\u56de\u62c9/\u5f39\u6027\u53ef\u80fd\u8d85\u51fa\u8d77\u6b62\u8303\u56f4\uff0c\u5f39\u8df3\u53ef\u80fd\u56de\u6446\uff1b\u7aef\u70b9\u4fdd\u6301\u51c6\u786e\u3002",
        "changedRig": "\u6eda\u52a8\u8f85\u52a9\u5c42\u6216\u8fde\u63a5\u88ab\u66f4\u6539\uff0c\u8bf7\u6062\u590d\u8fde\u63a5\u540e\u91cd\u8bd5\u3002"
    }
};
    function showUI(a,ui) {
        var language='zh',binding=null,ids=[],fields={},labels=[],buttons=[],filling=false,unitIndex=0;
        function tr(k){return messages[language][k]||messages.en[k]||'';}
        ui.setTitle('Text Time Roll '+VERSION);ui.setMaximumWidth(16777215);ui.setMaximumHeight(16777215);ui.setMinimumWidth(660);ui.setMinimumHeight(640);
        var main=new ui.VLayout();main.setMargins(14,12,14,12);main.setSpaceBetween(9);
        var top=new ui.HLayout(),title=new ui.Label('Text Time Roll '+VERSION),lang=new ui.Button('\u4e2d\u6587 / EN');
        title.setTextColor('#ffc14d');top.add(title);top.addStretch();top.add(lang);main.add(top);var intro=new ui.Label(tr('description'));main.add(intro);
        function label(key){var w=new ui.Label(tr(key));labels.push({w:w,key:key});return w;}
        function row(key,w){var h=new ui.HLayout(),l=label(key);l.setMinimumWidth(185);h.add(l);h.addStretch();w.setMinimumWidth(290);h.add(w);main.add(h);}
        function button(key,fn,layout){var b=new ui.Button(tr(key));b.onClick=function(){try{fn();}catch(e){error(e);}};buttons.push({w:b,key:key});layout.add(b);return b;}
        var target=new ui.DropDown();row('target',target);
        var pick=new ui.HLayout();button('read',readSelection,pick);button('reload',refresh,pick);main.add(pick);
        function numeric(key,low,high,integer){var w=new ui.NumericField(0);w.setType(integer?0:1);w.setMin(low);w.setMax(high);w.setStep(integer?1:0.1);w.onValueChanged=preview;fields[key]=w;return w;}
        row('startValue',numeric('startValue',-1e9,1e9,false));row('endValue',numeric('endValue',-1e9,1e9,false));
        var units=new ui.DropDown();row('unit',units);
        row('startFrame',numeric('startFrame',-1e6,1e6,false));row('endFrame',numeric('endFrame',-1e6,1e6,false));
        var easing=new ui.DropDown();row('easing',easing);
        var roll=new ui.DropDown(),order=new ui.DropDown();row('roll',roll);row('order',order);
        row('stagger',numeric('stagger',0,80,false));
        row('decimals',numeric('decimals',0,6,true));row('minDigits',numeric('minDigits',1,12,true));
        ['prefix','suffix'].forEach(function(k){fields[k]=new ui.LineEdit();fields[k].onValueChanged=preview;});row('prefix',fields.prefix);row('suffix',fields.suffix);
        var consent=new ui.Checkbox(false),consentLabel=label('consent'),ch=new ui.HLayout();consentLabel.setMinimumWidth(530);ch.add(consent);ch.add(consentLabel);ch.addStretch();main.add(ch);
        var timing=new ui.Label(''),output=new ui.Label(''),status=new ui.Label('');output.setTextColor('#ffc14d');main.add(timing);main.add(output);
        var actions=new ui.HLayout();button('apply',function(){if(!binding)fail('selectText');apply(a,binding,values(),consent.getValue());consent.setValue(false);setConsent(false);status.setText(tr('done'));status.setTextColor('#74d29a');preview();},actions);
        button('restore',function(){if(!binding)fail('selectText');restore(a,binding);status.setText(tr('restored'));},actions);main.add(actions);
        var seek=new ui.HLayout();[['first',0],['middle',0.5],['last',1]].forEach(function(x){button(x[0],function(){if(!binding)fail('selectText');assertBinding(a,binding);var c=values();a.setFrame(Math.round(c.startFrame+(c.endFrame-c.startFrame)*x[1]));preview();},seek);});main.add(seek);main.add(status);var note=new ui.Label(tr('note'));main.add(note);main.addStretch();
        function error(e){status.setText(tr(e.code)||String(e.message||e));status.setTextColor('#ff8585');}
        function fps(){return a.get(a.getActiveComp(),'fps');}
        function setConsent(){consent.setHidden(false);consentLabel.setHidden(false);}
        function controls(){var on=roll.getValue()>0;order.setEnabled(on);fields.stagger.setEnabled(on&&order.getValue()>0);}
        function values(){var f=framesFromUnits(fields.startFrame.getValue(),fields.endFrame.getValue(),unitIndex?'seconds':'frames',fps());return validate({startValue:fields.startValue.getValue(),endValue:fields.endValue.getValue(),startFrame:f[0],endFrame:f[1],easing:easing.getValue(),decimals:fields.decimals.getValue(),minDigits:fields.minDigits.getValue(),prefix:fields.prefix.getText(),suffix:fields.suffix.getText(),roll:roll.getValue(),order:order.getValue(),stagger:fields.stagger.getValue()/100});}
        function fill(c){filling=true;['startValue','endValue','decimals','minDigits'].forEach(function(k){fields[k].setValue(c[k]);});['startFrame','endFrame'].forEach(function(k){fields[k].setValue(c[k]/(unitIndex?fps():1));});fields.prefix.setText(c.prefix);fields.suffix.setText(c.suffix);fields.stagger.setValue(c.stagger*100);easing.setValue(c.easing);order.setValue(c.order);roll.setValue(c.roll);filling=false;controls();preview();}
        function preview(){if(filling)return;try{var c=values();timing.setText(tr('duration')+c.startFrame+' - '+c.endFrame+' / '+fps()+' fps / '+((c.endFrame-c.startFrame)/fps()).toFixed(2)+' s');output.setText(tr('preview')+textAt(c,a.getFrame()));}catch(e){timing.setText(tr(e.code)||String(e.message));output.setText('');}}
        function choose(){if(filling)return;var idx=target.getValue()-1;binding=null;consent.setValue(false);setConsent(false);if(idx<0||!ids[idx]){status.setText(tr('ready'));return;}try{binding=bind(a,ids[idx]);var loaded=load(a,binding);fill(loaded.config||defaults(a.getFrame(),fps()));var existing=loaded.existing&&!loaded.active;setConsent(existing);status.setText(tr(existing?'existing':'loaded'));status.setTextColor('#eeeeee');}catch(e){error(e);}}
        function refresh(){filling=true;binding=null;ids=a.getCompLayersOfType(false,'textShape').filter(function(id){return !isAtlas(a,id);});target.clear();target.addEntry(tr('choose'));ids.forEach(function(id){target.addEntry(a.getNiceName(id)+' ['+id+']');});target.setValue(0);filling=false;consent.setValue(false);setConsent(false);status.setText(tr('ready'));}
        function readSelection(){var sel=a.getSelection();if(sel.length!==1)fail('selectText');var id=sel[0];for(var depth=0;id&&a.getLayerType(id)!=='textShape'&&depth<3;depth++)id=a.getParent(id);if(!id||isAtlas(a,id))fail('selectText');refresh();var i=ids.indexOf(id);if(i<0)fail('selectText');target.setValue(i+1);choose();}
        target.onValueChanged=choose;easing.onValueChanged=preview;roll.onValueChanged=order.onValueChanged=function(){if(filling)return;controls();preview();};
        units.onValueChanged=function(){if(filling)return;var next=units.getValue();if(next===unitIndex)return;filling=true;['startFrame','endFrame'].forEach(function(k){var v=fields[k].getValue();fields[k].setValue(unitIndex?v*fps():v/fps());});unitIndex=next;filling=false;preview();};
        function options(w,list,selected){w.clear();list.forEach(function(v){w.addEntry(v);});w.setValue(selected<0?0:selected);}
        function localise(){var t=target.getValue(),e=easing.getValue(),o=order.getValue(),r=roll.getValue();filling=true;labels.forEach(function(x){x.w.setText(tr(x.key));});buttons.forEach(function(x){x.w.setText(tr(x.key));});
            options(target,[tr('choose')].concat(ids.map(function(id){return a.layerExists(id)?a.getNiceName(id)+' ['+id+']':id;})),t);
            options(units,[tr('frames'),tr('seconds')],unitIndex);options(easing,EASINGS.map(function(x){return x[language==='zh'?1:0];}),e);
            options(order,[tr('together'),tr('ltr'),tr('rtl')],o);options(roll,[tr('countOnly'),tr('up'),tr('down')],r);
            roll.setToolTip(tr('rollTip'));order.setToolTip(tr('orderTip'));fields.stagger.setToolTip(tr('orderTip'));easing.setToolTip(tr('easingTip'));intro.setText(tr('description'));note.setText(tr('note'));filling=false;status.setText(tr(binding?'loaded':'ready'));controls();preview();}
        lang.onClick=function(){language=language==='zh'?'en':'zh';localise();};
        localise();refresh();fill(defaults(a.getFrame(),fps()));var scroll=new ui.ScrollView();scroll.setLayout(main);ui.add(scroll);ui.show();try{if(a.getSelection().length===1)readSelection();}catch(e){}
        return {target:target,fields:fields,units:units,easing:easing,roll:roll,order:order,consent:consent,languageButton:lang,buttons:buttons,refresh:refresh,status:status,output:output,timing:timing,labels:labels,intro:intro,note:note};
    }
    return {version:VERSION,fields:FIELDS,messages:messages,easings:EASINGS,validate:validate,defaults:defaults,bounce:bounce,ease:ease,sample:sample,formatNumber:formatNumber,
        textAt:textAt,wheelState:wheelState,renderWheels:renderWheels,framesFromUnits:framesFromUnits,expression:expression,rollExpression:rollExpression,bind:bind,load:load,apply:apply,restore:restore,findCounter:findCounter,showUI:showUI};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=TextTimeRoll;
else if(typeof api!=='undefined'&&typeof ui!=='undefined')TextTimeRoll.showUI(api,ui);
