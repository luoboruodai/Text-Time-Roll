const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const ttr=require('../src/Text Time Roll.js'),{createMock}=require('./mock-cavalry.cjs'),{createUI}=require('./mock-ui.cjs');
const cfg=(patch={})=>({...ttr.defaults(0,25),endFrame:100,startValue:1976,endValue:2029,roll:1,order:1,...patch});
const attach=(m,c=cfg())=>ttr.apply(m.api,ttr.bind(m.api,'text#1'),c,false);
for(let mode=0;mode<ttr.easings.length;mode++)test('easing '+mode+' '+ttr.easings[mode][0]+' has exact endpoints and finite samples',()=>{
 assert.equal(ttr.ease(-1,mode),0);assert.equal(ttr.ease(0,mode),0);assert.equal(ttr.ease(1,mode),1);assert.equal(ttr.ease(2,mode),1);
 for(let i=0;i<=1000;i++){const n=ttr.ease(i/1000,mode);assert(Number.isFinite(n));assert(n>=-.4&&n<=1.4);}
});
test('Back/Elastic retain overshoot; Bounce is not a duplicate of linear',()=>{
 assert(ttr.ease(.8,24)>1);assert(ttr.ease(.2,23)<0);assert(ttr.ease(.2,27)>1);assert.notEqual(ttr.ease(.7,30),.7);
});
test('all curves and orders end on exact wheel digits, including decimals and negatives',()=>{
 for(let easing=0;easing<ttr.easings.length;easing++)for(const order of[0,1,2])for(const roll of[1,2]){
  for(const [startValue,endValue,first,last]of[[1976,2029,'1976.0','2029.0'],[2029,1976,'2029.0','1976.0'],[-12.5,-5.2,'-0012.5','-0005.2'],[-10,10,'-0010.0','0010.0']]){
   const c=cfg({easing,order,roll,startValue,endValue,decimals:1});assert.equal(ttr.textAt(c,-10),first);assert.equal(ttr.textAt(c,0),first);assert.equal(ttr.textAt(c,100),last);assert.equal(ttr.textAt(c,200),last);
   for(const f of[1,12,36,64,99])for(const g of ttr.wheelState(c,f).glyphs)if(g.digit){assert(g.from>=0&&g.from<=9);assert(g.to>=0&&g.to<=9);assert(g.mix>=0&&g.mix<=1);}
  }
 }
});
test('LTR and RTL delay different digits without reversing the text itself',()=>{
 const base=cfg({startValue:1111,endValue:9999,easing:0,stagger:.6});
 assert.equal(ttr.textAt({...base,order:1},10),'3111');assert.equal(ttr.textAt({...base,order:2},10),'1113');
 assert.equal(ttr.textAt({...base,order:0},10),'2222');
 assert.equal(ttr.textAt({...base,roll:1},23),ttr.textAt({...base,roll:2},23));
});
test('roll pads to stable width, preserves Unicode affixes and punctuation',()=>{
 const c=cfg({startValue:9.5,endValue:100.25,decimals:2,minDigits:1,prefix:'年 ',suffix:' 🕒'});
 assert.equal(ttr.textAt(c,0),'年 009.50 🕒');assert.equal(ttr.textAt(c,100),'年 100.25 🕒');assert.equal(ttr.wheelState(c,50).glyphs.at(-1).char,'🕒');
});
for(const patch of[{roll:3},{order:-1},{stagger:NaN},{stagger:.81},{stagger:-.1}])test('invalid wheel settings do not edit any node '+JSON.stringify(patch),()=>{
 const m=createMock();assert.throws(()=>attach(m,cfg(patch)),/rollRange/);assert.equal(m.state.calls.length,0);
});
for(const platform of['macOS','Windows'])test(platform+' roll is idempotent; original deformer stack and input restored',()=>{
 const m=createMock({platform}),before=structuredClone(m.state.records['text#2']);m.api.addArrayIndex('text#1','deformers');m.api.connect('entrance#1','id','text#1','deformers.0');
 const b=ttr.bind(m.api,'text#1'),result=attach(m),id=result.counter,meta=JSON.parse(m.api.get(id,'array.10'));
 assert.equal(m.api.getInConnection('text#1','deformers.0'),meta.rig.deformer+'.id');assert.equal(m.api.getInConnection('text#1','deformers.1'),'entrance#1.id');
 assert.equal(m.api.get(meta.rig.atlas,'on'),false);assert.equal(m.api.getInConnection(meta.rig.atlas,'font'),'text#1.font');
 const nodes=Object.keys(m.state.records);attach(m,cfg({roll:2,order:2,easing:30}));assert.deepEqual(Object.keys(m.state.records),nodes);
 for(const f of[0,42,100]){m.api.setFrame(f);assert.equal(m.api.get('text#1','text').text,ttr.textAt(cfg({roll:2,order:2,easing:30}),f));}
 attach(m,cfg({roll:0}));assert.equal(m.api.getInConnection('text#1','deformers.0'),'entrance#1.id');assert.equal(m.api.getArrayCount('text#1','deformers'),1);
 attach(m);ttr.restore(m.api,b);assert.equal(m.api.get('text#1','text').text,'2026');assert.equal(m.api.getInConnection('text#1','deformers.0'),'entrance#1.id');
 attach(m);assert.deepEqual(Object.keys(m.state.records),nodes);assert.deepEqual(m.state.records['text#2'],before);
});
test('v0.1.0 schema migrates without changing existing values or original input',()=>{
 const m=createMock({existing:true}),b=ttr.bind(m.api,'text#1');ttr.apply(m.api,b,cfg({roll:0}),true);const id=ttr.findCounter(m.api,'text#1');
 while(m.api.getArrayCount(id,'array')>11)m.api.removeArrayIndex(id,'array.'+(m.api.getArrayCount(id,'array')-1));
 const meta=JSON.parse(m.api.get(id,'array.10'));meta.schema=1;meta.version='0.1.0';m.api.set(id,{'array.10':JSON.stringify(meta),expression:'// TTR_COUNTER_SCHEMA_1\nString(StartValue);'});
 const imported=ttr.load(m.api,b);assert.equal(imported.config.roll,0);assert.equal(imported.config.order,0);assert.equal(imported.config.stagger,.35);
 const r=ttr.apply(m.api,b,imported.config,false);assert.equal(r.counter,id);assert.equal(r.created,false);assert.equal(m.api.getArrayCount(id,'array'),14);
 assert.deepEqual(JSON.parse(m.api.get(id,'array.10')).original,meta.original);ttr.restore(m.api,b);assert.equal(m.api.getInConnection('text#1','text'),'native#1.id');
});
test('damaged or foreign-rewired glyph rig is rejected, not silently replaced',()=>{
 for(const change of[(m,r)=>delete m.state.records[r.atlas],(m,r)=>m.api.set(r.atlas,{on:true}),(m,r)=>m.api.connect('foreign','font',r.atlas,'font'),(m,r)=>m.api.disconnectInput(r.deformer,'array.0')]){
  const m=createMock(),id=attach(m).counter,rig=JSON.parse(m.api.get(id,'array.10')).rig;change(m,rig);assert.throws(()=>attach(m),/changedRig/);
 }
});
test('late failure rolls back numeric-to-wheel migration and original entrance stack',()=>{
 const m=createMock();const id=attach(m,cfg({roll:0})).counter,original=JSON.parse(m.api.get(id,'array.10')),nodes=Object.keys(m.state.records);
 m.api.addArrayIndex('text#1','deformers');m.api.connect('entry','id','text#1','deformers.0');m.state.failure='connect';
 assert.throws(()=>attach(m),/Injected/);assert.deepEqual(Object.keys(m.state.records),nodes);assert.equal(m.api.getInConnection('text#1','deformers.0'),'entry.id');assert.deepEqual(JSON.parse(m.api.get(id,'array.10')),original);assert.equal(ttr.load(m.api,ttr.bind(m.api,'text#1')).config.roll,0);
});
test('classic UI preserves new controls across language switches and excludes owned atlas',()=>{
 const m=createMock();attach(m);const p=ttr.showUI(m.api,createUI());assert.equal(p.easing.entries.length,34);assert.equal(p.target.entries.length,3);assert.equal(p.consent.hidden,false);
 p.roll.setValue(2);p.order.setValue(2);p.fields.stagger.setValue(65);p.easing.setValue(27);p.languageButton.onClick();assert.equal(p.roll.getValue(),2);assert.equal(p.order.getValue(),2);assert.equal(p.easing.getValue(),27);assert.equal(p.fields.stagger.getValue(),65);
 p.roll.setValue(0);assert.equal(p.order.enabled,false);assert.equal(p.fields.stagger.enabled,false);
});
test('wheel expression is deterministic without external clock, I/O or panel state',()=>{
 const m=createMock();const c=cfg({easing:27,order:2,prefix:'Y '}),r=attach(m,c);for(const f of[78,10,46,10,100]){m.api.setFrame(f);assert.equal(m.api.get('text#1','text').text,ttr.textAt(c,f));}
 assert(!/api\.|Date\(|Math.random|require\(/.test(ttr.rollExpression()));
});
// Geometry spy: verifies displacement/clipping logic against a 2.7-compatible Mesh surface.
function geometry(){
 class Path{constructor(){this.ops=[];}translate(x,y){this.ops.push(['translate',x,y]);}addRect(...v){this.ops.push(['rect',...v]);}intersect(p){this.ops.push(['clip',p]);}append(p){this.ops.push(['append',p]);}}
 class Mesh{constructor(box={left:0,right:8,bottom:0,top:10,width:8,height:10,centre:{x:4,y:5}},children=[]){this.box=box;this.children=children;this.path=new Path();this.material='original';}getBoundingBox(){return this.box;}childMeshCount(){return this.children.length;}getChildMeshAtIndex(i){return this.children[i];}getFlattenedPath(){return new Path();}count(){return 1;}setPathAtIndex(i,p){this.path=p;}}
 const digits=Array.from({length:10},()=>new Mesh());const atlas=new Mesh(undefined,[new Mesh(undefined,[new Mesh(undefined,digits)])]);const character=new Mesh();const def={getMeshesAtDepth:()=>[character],setMeshAtDepthAtIndex:(_d,_i,m)=>{def.result=m;}};return{cavalry:{Path,Mesh},atlas,def,character};
}
test('actual geometry contains both outgoing/incoming paths, clipped; up/down reverse only displacement',()=>{
 const state={glyphs:[{char:'2',digit:true,from:1,to:2,mix:.6}]};
 const up=geometry(),down=geometry();ttr.renderWheels(up.def,up.cavalry,up.atlas,state,1);ttr.renderWheels(down.def,down.cavalry,down.atlas,state,2);
 assert(up.def.result);assert.equal(up.def.result.material,'original');assert.equal(up.def.result.path.ops[0][2],-down.def.result.path.ops[0][2]);
 assert(up.def.result.path.ops.some(x=>x[0]==='clip'));assert(up.def.result.path.ops.some(x=>x[0]==='append'));
});
test('integer/end-state geometry is untouched, with original glyph materials and outlines',()=>{
 const g=geometry();ttr.renderWheels(g.def,g.cavalry,g.atlas,{glyphs:[{char:'2',digit:true,from:2,to:2,mix:0}]},1);assert(!g.def.result);assert.equal(g.character.path.ops.length,0);
});
test('one-digit roll uses the full duration even when stagger/order are set',()=>{const c=cfg({startValue:0,endValue:9,minDigits:1,order:1,stagger:.8,easing:0});assert.equal(ttr.textAt(c,50),'5');});
test('rounding to zero never adds a negative-zero sign in rolling mode',()=>{const c=cfg({startValue:-.001,endValue:0,decimals:1});assert.equal(ttr.textAt(c,0),'0000.0');});
test('native connection-side-effect cannot reset existing entrance levelMode',()=>{
 const m=createMock();m.state.records['entry']={type:'autoAnimate',attrs:{levelMode:3},children:[]};m.api.addArrayIndex('text#1','deformers');m.api.connect('entry','id','text#1','deformers.0');
 const connect=m.api.connect;m.api.connect=(from,fa,to,ta)=>{connect(from,fa,to,ta);if(from==='entry'&&ta.startsWith('deformers.'))m.state.records.entry.attrs.levelMode=0;};
 attach(m);assert.equal(m.api.get('entry','levelMode'),3);ttr.restore(m.api,ttr.bind(m.api,'text#1'));assert.equal(m.api.get('entry','levelMode'),3);
});
test('Cavalry shrinking deformer arrays remain correct over repeated apply/restore cycles',()=>{
 const m=createMock();m.api.addArrayIndex('text#1','deformers');m.api.connect('entry','id','text#1','deformers.0');
 const disconnect=m.api.disconnectInput;m.api.disconnectInput=(id,attr)=>{disconnect(id,attr);if(attr.startsWith('deformers.'))throw Error('Unsafe forward disconnect of shrinking array');};
 for(let i=0;i<5;i++){const id=attach(m).counter;const rig=JSON.parse(m.api.get(id,'array.10')).rig;assert.equal(m.api.getArrayCount('text#1','deformers'),2);assert.equal(m.api.getInConnection('text#1','deformers.0'),rig.deformer+'.id');assert.equal(m.api.getInConnection('text#1','deformers.1'),'entry.id');ttr.restore(m.api,ttr.bind(m.api,'text#1'));assert.equal(m.api.getArrayCount('text#1','deformers'),1);assert.equal(m.api.getInConnection('text#1','deformers.0'),'entry.id');}
});
