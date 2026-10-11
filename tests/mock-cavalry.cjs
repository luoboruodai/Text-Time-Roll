const vm = require('node:vm');
function createMock({platform='macOS',existing=false,invalidSelection=false}={}) {
  const scene = platform==='Windows'?'D:/Tests/Scene.cv':'/tmp/tests/Scene.cv';
  let seq=0;const records={
    'comp#1':{type:'compNode',name:'Composition',attrs:{fps:25,time:0},children:[]},
    'text#1':{type:'textShape',name:'Year',parent:'',attrs:{text:{text:'2026',overrides:[{start:0,end:4,features:{liga:1}}]},font:{font:'Generic Sans',style:'Bold'},fontSize:124,autoName:true,uuid:'t1'},children:[]},
    'text#2':{type:'textShape',name:'Untouched',parent:'',attrs:{text:{text:'Untouched'},uuid:'t2',autoName:false},children:[]},
    'camera#1':{type:'planarCamera',attrs:{position:{x:10,y:20,z:30}},children:[]}
  };
  const state={scene,comp:'comp#1',frame:0,selection:invalidSelection?['camera#1']:['text#1'],failure:'',records,inputs:{},calls:[],platform};
  function out(id,attr){
    const input=state.inputs[id+'.'+attr];
    if(input){const p=input.indexOf('.');const sid=input.slice(0,p),sa=input.slice(p+1);if(sa==='id'&&records[sid]?.type==='javaScript'){
      const n=records[sid],vars={};n.dynamic.forEach((f,i)=>vars[f.name]=api.get(sid,'array.'+i));
      const val=vm.runInNewContext(n.attrs.expression,{...vars,Math,Number});
      return attr==='text'?{...records[id].attrs.text,text:val}:val;
    }if(sa==='id'&&sid==='native#1')return {text:state.frame<32?'1978':'2026'};return out(sid,sa);}
    if(attr==='time'&&id==='comp#1')return state.frame;
    if(attr==='generator.number'&&id==='native#1')return state.frame<=23?1978:2026;
    if(attr.startsWith('array.'))return records[id].dynamic[+attr.slice(6)]?.value;
    return structuredClone(records[id].attrs[attr]);
  }
  const api={
    getPlatform:()=>platform,getSceneFilePath:()=>state.scene,getActiveComp:()=>state.comp,getParentComp:()=>state.comp,
    layerExists:id=>!!records[id],getLayerType:id=>records[id]?.type||'',getParent:id=>records[id]?.parent||'',getChildren:id=>(records[id]?.children||[]).slice(),
    getNiceName:id=>records[id].name,rename:(id,name)=>{records[id].name=name;},get:out,
    getInConnection:(id,attr)=>state.inputs[id+'.'+attr]||'',getKeyframeTimes:(id,attr)=>id==='native#1'&&attr==='generator.number'?[23,32]:(records[id].keys?.[attr]||[]),
    getSelection:()=>state.selection,select:ids=>{state.selection=ids.slice();},getFrame:()=>state.frame,setFrame:f=>{state.frame=f;},
    getCompLayersOfType:(_top,type)=>Object.keys(records).filter(id=>records[id].type===type),getCurrentGeneratorType:id=>id==='native#1'?'textValue':'',
    create(type,name){const id='js#'+(++seq);records[id]={type,name,parent:'',attrs:{expression:'0;'},children:[],dynamic:[{name:'n0',value:0,type:'double'}]};state.calls.push(['create',id]);return id;},
    parent(id,parent){records[id].parent=parent;records[parent].children.push(id);},
    getArrayCount:id=>records[id].dynamic.length,addDynamic:(id,_attr,type)=>records[id].dynamic.push({type,name:'',value:type==='string'?'':0}),
    renameAttribute:(id,attr,name)=>{records[id].dynamic[+attr.slice(6)].name=name;},
    set(id,props){for(const [k,v]of Object.entries(props)){if(state.failure==='set'&&k==='expression'){state.failure='';throw new Error('Injected setter failure');}if(k.startsWith('array.'))records[id].dynamic[+k.slice(6)].value=structuredClone(v);else records[id].attrs[k]=structuredClone(v);}state.calls.push(['set',id]);},
    disconnectInput:(id,attr)=>{delete state.inputs[id+'.'+attr];},
    connect(from,fa,to,ta){if(state.failure==='connect'&&ta==='text'){state.failure='';throw new Error('Injected connection failure');}state.inputs[to+'.'+ta]=from+'.'+fa;},
    deleteLayer(id){if(records[id].parent)records[records[id].parent].children=records[records[id].parent].children.filter(x=>x!==id);delete records[id];for(const[k,v]of Object.entries(state.inputs)){if(k.startsWith(id+'.')||v.startsWith(id+'.'))delete state.inputs[k];}},
  };
  if(existing){records['native#1']={type:'stringGenerator',name:'Existing',parent:'text#1',attrs:{'generator.precision':0,'generator.length':4,prefix:'',suffix:''},children:[]};records['text#1'].children.push('native#1');state.inputs['text#1.text']='native#1.id';}
  return {api,state};
}
module.exports={createMock};
