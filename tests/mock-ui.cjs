function createUI() {
  class Widget {
    constructor(value=''){this.value=value;this.text=String(value);this.entries=[];this.children=[];}
    getValue(){return this.value;}setValue(v){this.value=v;if(this.onValueChanged)this.onValueChanged();}
    getText(){return this.text;}setText(v){this.text=String(v);if(this.onValueChanged)this.onValueChanged();}
    clear(){this.entries=[];this.setValue(-1);}addEntry(v){this.entries.push(v);}
    add(v){this.children.push(v);}setLayout(v){this.layout=v;}
    addStretch(){}setMinimumWidth(){}setMargins(){}setSpaceBetween(){}setTextColor(){}
    setType(){}setMin(){}setMax(){}setStep(){}setToolTip(v){this.tooltip=v;}setHidden(v){this.hidden=v;}setEnabled(v){this.enabled=v;}
  }
  return {VLayout:Widget,HLayout:Widget,Label:Widget,Button:Widget,DropDown:Widget,
    NumericField:Widget,LineEdit:Widget,Checkbox:Widget,ScrollView:Widget,
    setTitle(){},setMinimumWidth(){},setMinimumHeight(){},setMaximumWidth(){},setMaximumHeight(){},add(){},show(){}};
}
module.exports={createUI};
