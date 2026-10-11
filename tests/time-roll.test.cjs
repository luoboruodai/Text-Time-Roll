const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const ttr=require('../src/Text Time Roll.js');const {createMock}=require('./mock-cavalry.cjs');
function cfg(extra={}){return {...ttr.defaults(23,25),endFrame:32,...extra};}
function attach(m,c=cfg(),consent=false){return ttr.apply(m.api,ttr.bind(m.api,'text#1'),c,consent);}
test('1978 -> 2026 endpoints, clamping, smooth monotonic values and frame scrubbing',()=>{
 const c=cfg();assert.equal(ttr.textAt(c,-100),'1978');assert.equal(ttr.textAt(c,23),'1978');assert.equal(ttr.textAt(c,32),'2026');assert.equal(ttr.textAt(c,999),'2026');
 let last=1978;for(let f=23;f<=32;f+=.125){const n=+ttr.textAt(c,f);assert(n>=last&&n<=2026);last=n;}assert.equal(ttr.textAt(c,26),'1990');
});
test('descending, equal values, decimal rounding, padding, unicode, negative zero',()=>{
 assert.equal(ttr.textAt(cfg({startValue:10,endValue:-10,easing:0,minDigits:2}),27.5),'00');
 assert.equal(ttr.textAt(cfg({startValue:3,endValue:3}),27),'0003');
 assert.equal(ttr.formatNumber(-.000001,2,4,'年 ', ' 天'),'年 0000.00 天');assert.equal(ttr.formatNumber(-12.125,2,4,'',''),'-0012.13');
});
for(const [name,patch,code]of [
 ['NaN',{startValue:NaN},'invalidNumber'],['Infinity',{endValue:Infinity},'invalidNumber'],['huge',{endValue:1e10},'valueRange'],
 ['reversed',{endFrame:10},'timeOrder'],['zero duration',{endFrame:23},'timeOrder'],['fractional frame',{startFrame:23.2},'frameRange'],
 ['precision',{decimals:7},'formatRange'],['digits',{minDigits:0},'formatRange'],['easing',{easing:99},'easingRange'],
 ['newline',{prefix:'x\ny'},'affixRange'],['long affix',{suffix:'x'.repeat(129)},'affixRange']]){
 test('reject '+name+' before scene edits',()=>{const m=createMock();assert.throws(()=>attach(m,cfg(patch)),e=>e.code===code);assert.equal(m.state.calls.length,0);});
}
test('seconds -> frames handles fractional fps and rounded zero duration',()=>{
 assert.deepEqual(ttr.framesFromUnits(1,2,'seconds',29.97),[30,60]);assert.throws(()=>ttr.validate(cfg({startFrame:0,endFrame:0})),/timeOrder/);
});
for(const platform of ['Windows','macOS'])test(platform+': apply, update without duplicates, reload metadata, restore, reapply',()=>{
 const m=createMock({platform});const untouched=structuredClone(m.state.records['text#2']),camera=structuredClone(m.state.records['camera#1']),original=structuredClone(m.state.records['text#1']);
 const b=ttr.bind(m.api,'text#1'),r=ttr.apply(m.api,b,cfg(),false);assert.equal(m.api.getParent(r.counter),'text#1');assert.equal(m.api.getInConnection(r.counter,'array.0'),'comp#1.time');
 for(const[f,s]of [[0,'1978'],[28,'2006'],[32,'2026'],[25,'1984']]){m.api.setFrame(f);assert.equal(m.api.get('text#1','text').text,s);}
 ttr.apply(m.api,b,cfg({endValue:2050}),false);assert.equal(Object.values(m.state.records).filter(x=>x.type==='javaScript').length,1);assert.equal(ttr.load(m.api,b).config.endValue,2050);
 ttr.restore(m.api,b);assert.deepEqual(m.api.get('text#1','text'),original.attrs.text);assert.equal(m.api.get('text#1','autoName'),true);assert.equal(m.api.getNiceName('text#1'),'Year');
 ttr.apply(m.api,b,cfg(),false);assert.equal(Object.values(m.state.records).filter(x=>x.type==='javaScript').length,1);
 assert.deepEqual(m.state.records['text#2'],untouched);assert.deepEqual(m.state.records['camera#1'],camera);assert.deepEqual(m.api.get('text#1','font'),original.attrs.font);
});
test('existing native counter requires consent; restoration reconnects unchanged original',()=>{
 const m=createMock({existing:true}),b=ttr.bind(m.api,'text#1'),orig=structuredClone(m.state.records['native#1']);
 assert.throws(()=>ttr.apply(m.api,b,cfg(),false),/existingInput/);const data=ttr.load(m.api,b);assert.equal(data.config.startValue,1978);assert.equal(data.config.endFrame,32);assert.equal(m.state.frame,0);
 attach(m,cfg(),true);assert.deepEqual(m.state.records['native#1'],orig);ttr.restore(m.api,b);assert.equal(m.api.getInConnection('text#1','text'),'native#1.id');attach(m);assert.deepEqual(m.state.records['native#1'],orig);
});
test('stale scene, comp and reused layer ID cannot be edited',()=>{
 for(const change of [m=>m.state.scene='different.cv',m=>m.state.comp='comp#2',m=>m.state.records['text#1'].attrs.uuid='new']){
  const m=createMock(),b=ttr.bind(m.api,'text#1');change(m);assert.throws(()=>ttr.apply(m.api,b,cfg(),false),/staleTarget/);assert.equal(m.state.calls.length,0);
 }
});
test('wrong layer and duplicate owned controllers are blocked',()=>{
 const m=createMock();assert.throws(()=>ttr.bind(m.api,'camera#1'),/selectText/);const r=attach(m);m.state.records['text#1'].children.push(r.counter);assert.throws(()=>attach(m),/duplicateCounter/);
});
test('manual parameter keys are not overwritten',()=>{const m=createMock(),r=attach(m);m.state.records[r.counter].keys={'array.1':[0,10]};assert.throws(()=>attach(m),/manualParameters/);});
for(const failure of ['set','connect'])test('transaction rollback on '+failure+' failure',()=>{
 const m=createMock({existing:true}),before=structuredClone(m.state.records['text#1']);m.state.failure=failure;
 assert.throws(()=>attach(m,cfg(),true),/Injected/);assert.deepEqual(m.state.records['text#1'],before);assert.equal(m.api.getInConnection('text#1','text'),'native#1.id');assert.equal(Object.values(m.state.records).filter(x=>x.type==='javaScript').length,0);
});
test('external rewiring and missing original source are preserved, not silently lost',()=>{
 const m=createMock({existing:true}),b=ttr.bind(m.api,'text#1');attach(m,cfg(),true);m.api.connect('foreign','id','text#1','text');assert.throws(()=>ttr.restore(m.api,b),/changedInput/);assert.throws(()=>attach(m,cfg(),true),/changedInput/);
 const r=ttr.findCounter(m.api,'text#1');m.api.connect(r,'id','text#1','text');delete m.state.records['native#1'];assert.throws(()=>ttr.restore(m.api,b),/originalMissing/);
});
test('scene expression is self-contained and user affixes cannot inject code',()=>{
 const c=cfg({prefix:'\"; throw new Error(1); //',suffix:'年'}),m=createMock();attach(m,c);m.api.setFrame(23);assert.equal(m.api.get('text#1','text').text,c.prefix+'1978年');
 assert(!ttr.expression().includes('require('));assert(!ttr.expression().includes('api.'));
});
test('both languages expose every field and matching error code without replacement characters',()=>{
 assert.deepEqual(Object.keys(ttr.messages.zh).sort(),Object.keys(ttr.messages.en).sort());for(const lang of Object.values(ttr.messages)){for(const val of Object.values(lang))assert(!val.includes('\ufffd'));}
});
test('source is ASCII transport, no runtime I/O or embedded machine paths',()=>{
 const s=require('node:fs').readFileSync(require('node:path').join(__dirname,'../src/Text Time Roll.js'),'utf8');assert(/^[\x00-\x7f]*$/.test(s));assert(!/api\.(readFromFile|writeToFile|openURL|openScene)/.test(s));assert(!s.includes('/Users/'));
});
test('manually rewired counter clock is not silently overwritten',()=>{const m=createMock(),r=attach(m);m.api.disconnectInput(r.counter,'array.0');assert.throws(()=>attach(m),/manualParameters/);});
test('target moved into another composition invalidates panel binding',()=>{const m=createMock(),b=ttr.bind(m.api,'text#1');m.api.getParentComp=()=> 'otherComp';assert.throws(()=>ttr.apply(m.api,b,cfg(),false),/staleTarget/);assert.equal(m.state.calls.length,0);});
