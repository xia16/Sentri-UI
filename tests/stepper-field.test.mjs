import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
createRequire(import.meta.url)('../ux/design-system/components/bundle.js');
const UI=globalThis.SentriUI;
test('Field describes corrective text without discarding existing help or repeating the label',()=>{
 const html=UI.field({id:'dose',label:'Dose',control:'<input aria-describedby="method-help" value="x">',error:'Enter a numeric dose.'});
 assert.match(html,/aria-describedby="method-help dose-hint"/);
 assert.equal((html.match(/aria-describedby=/g)||[]).length,1);
 assert.match(html,/aria-invalid="true"/);
 assert.match(html,/aria-labelledby="dose-label"/);
 assert.match(html,/id="dose-hint" role="alert">Enter a numeric dose\./);
});
test('disabled Field explains why, and textarea retains its native value',()=>{
 assert.match(UI.field({label:'Note',variant:'textarea',value:'猪栏已维修',disabled:true,reason:'Record locked.'}),/disabled/);
 assert.match(UI.field({label:'Note',variant:'textarea',value:'猪栏已维修',disabled:true,reason:'Record locked.'}),/Record locked\./);
 assert.match(UI.field({label:'Note',variant:'textarea',value:'猪栏已维修'}),/猪栏已维修<\/textarea>/);
});
test('Stepper receipts distinguish draft and correction in words, and bound keys remain answerable',()=>{
 const draft=UI.stepper({label:'Crushed',value:3,min:2,draft:true,status:'+1 unsaved'});
 assert.match(draft,/\+1 unsaved/);
 assert.match(UI.stepper({label:'Alive',value:10,changed:true}),/>Corrected<\/span>/);
 const floor=UI.stepper({value:2,min:2});
 assert.match(floor,/data-step="-1"[^>]*aria-disabled="true"/);
 assert.doesNotMatch(floor,/(?<!aria-)disabled=/);
});
test('all Stepper variants preserve host delta events; legacy hero maps to count',()=>{
 for(const variant of ['row','count','well']){
  const html=UI.stepper({variant,key:'alive',action:'adjust',value:3,step:2});
  assert.match(html,new RegExp(`data-variant="${variant}"`));
  assert.match(html,/data-action="adjust" data-value="alive" data-step="-2"/);
  assert.match(html,/data-action="adjust" data-value="alive" data-step="2"/);
 }
 assert.match(UI.stepper({variant:'hero'}),/data-variant="count"/);
});

test('repeated keyboard deltas retain focus when the host replaces the sheet',()=>{
 const handlers=[];
 runInNewContext(readFileSync(new URL('../ux/design-system/components/bundle.js',import.meta.url),'utf8'),{
  document:{addEventListener:(type,handler)=>{if(type==='keydown')handlers.push(handler);}},console
 });
 let value=9,active,focused,prevented=0;
 const host={isConnected:true,parentElement:null,querySelectorAll:()=>[active.group]};
 function mount(){
  const parent={isConnected:true,parentElement:host};
  let group;
  const spin={isConnected:true,closest:selector=>selector==='[data-st-spin]'?spin:group,focus:()=>{focused=spin;}};
  const keys=[-1,1].map(delta=>({click:()=>{
   value+=delta;parent.isConnected=false;spin.isConnected=false;active=mount();
  }}));
  group={dataset:{field:'alive',variant:'count'},parentElement:parent,closest:()=>null,
   querySelector:selector=>selector==='[data-st-spin]'?spin:{textContent:'Alive'},querySelectorAll:()=>keys};
  return {group,spin};
 }
 active=mount();
 for(const [key,expected] of [['ArrowUp',10],['ArrowUp',11],['ArrowDown',10]]){
  handlers[0]({key,target:active.spin,preventDefault:()=>{prevented++;}});
  assert.equal(value,expected);
  assert.equal(focused,active.spin,'focus returns to the newly mounted value');
 }
 assert.equal(prevented,3,'arrow keys change the value without scrolling the host');
});
