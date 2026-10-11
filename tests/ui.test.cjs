const test=require('node:test'),assert=require('node:assert/strict');
const ttr=require('../src/Text Time Roll.js'),{createMock}=require('./mock-cavalry.cjs'),{createUI}=require('./mock-ui.cjs');
const click=(p,key)=>p.buttons.find(b=>b.key===key).w.onClick();
test('opening and reading UI do not edit scene; native values loaded',()=>{
 const m=createMock({existing:true}),p=ttr.showUI(m.api,createUI());
 assert.equal(m.state.calls.length,0);assert.equal(p.fields.startFrame.getValue(),23);assert.equal(p.fields.endValue.getValue(),2026);
 click(p,'apply');assert.equal(m.state.calls.length,0);assert.match(p.status.getText(),/勾选|替换/);
 p.consent.setValue(true);click(p,'apply');assert(ttr.findCounter(m.api,'text#1'));assert.equal(p.consent.getValue(),false);
 click(p,'restore');assert.equal(m.api.getInConnection('text#1','text'),'native#1.id');
});
test('language toggling preserves unsaved draft values, invalid timing and consent',()=>{
 const m=createMock(),p=ttr.showUI(m.api,createUI());p.fields.startValue.setValue(123);p.fields.endFrame.setValue(-5);p.fields.prefix.setText('测试 ');p.easing.setValue(2);p.consent.setValue(true);
 p.languageButton.onClick();p.languageButton.onClick();
 assert.equal(p.fields.startValue.getValue(),123);assert.equal(p.fields.endFrame.getValue(),-5);assert.equal(p.fields.prefix.getText(),'测试 ');assert.equal(p.easing.getValue(),2);assert.equal(p.consent.getValue(),true);assert.equal(m.state.calls.length,0);
});
test('units convert once and same-value callbacks do not shift timing',()=>{
 const m=createMock({existing:true}),p=ttr.showUI(m.api,createUI());p.units.setValue(1);assert.equal(p.fields.startFrame.getValue(),23/25);p.units.onValueChanged();assert.equal(p.fields.startFrame.getValue(),23/25);
 p.languageButton.onClick();assert.equal(p.fields.endFrame.getValue(),32/25);p.units.setValue(0);assert.equal(p.fields.startFrame.getValue(),23);assert.equal(p.fields.endFrame.getValue(),32);
});
test('LineEdit callbacks immediately refresh the format preview',()=>{
 const m=createMock(),p=ttr.showUI(m.api,createUI());p.fields.prefix.setText('Year ');p.fields.suffix.setText(' 年');assert.match(p.output.getText(),/Year 1978 年/);
});
test('UI blocks stale targets; refresh requires explicit reselection',()=>{
 const m=createMock(),p=ttr.showUI(m.api,createUI());m.state.scene='new.cv';click(p,'apply');assert.equal(m.state.calls.length,0);p.refresh();click(p,'apply');assert.equal(m.state.calls.length,0);
});
test('empty initial selection still populates target dropdown',()=>{
 const m=createMock();m.state.selection=[];const p=ttr.showUI(m.api,createUI());assert.equal(p.target.entries.length,3);assert.match(p.target.entries[1],/Year/);p.target.setValue(1);click(p,'apply');assert(ttr.findCounter(m.api,'text#1'));
});
test('classic single-column labels, full buttons and explanatory text are restored',()=>{
 const m=createMock(),p=ttr.showUI(m.api,createUI());
 assert.equal(p.labels.find(x=>x.key==='startValue').w.getText(),'起始数值');assert.equal(p.labels.find(x=>x.key==='endFrame').w.getText(),'结束时间');assert.equal(p.buttons.find(x=>x.key==='apply').w.getText(),'应用 / 更新动画');assert.equal(p.buttons.find(x=>x.key==='restore').w.getText(),'恢复原文字输入');assert(p.intro.getText().includes('保留原有排版'));assert(p.note.getText().includes('请保存'));assert(p.timing.getText().includes('fps'));
});
