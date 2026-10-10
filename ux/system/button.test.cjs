const test=require('node:test');
const assert=require('node:assert/strict');
require('../design-system/components/bundle.js');
const UI=globalThis.SentriUI;

test('waiting action links a persistent escaped reason and refuses delegated writes',()=>{
 const html=UI.button({register:'primary',label:'Record 12 piglets',waiting:true,reason:'Choose <piglets> first'});
 const id=html.match(/aria-describedby="([^"]+)"/)[1];
 assert.match(html,new RegExp(`id="${id}" role="status"`));
 assert.match(html,/Choose &lt;piglets&gt; first/);
 assert.match(html,/aria-disabled="true"/);
 assert.equal(UI.guard({getAttribute:k=>k==='aria-disabled'?'true':''},{answer:false}),true);
});
test('footer reason is never drawn above a waiting button, stays outside the two targets and describes it',()=>{
 const html=UI.sheetFooter({primary:{label:'Record items',waiting:true},status:{text:'Tick the completed items first',visible:false}});
 assert.match(html,/sheet-status st-visually-hidden/);
 assert.equal((html.match(/<button /g)||[]).length,2);
 assert.ok(html.indexOf('role="status"')<html.indexOf('class="sheet-footer'));
 const prop=UI.sheetFooter({primary:{label:'Record items',waiting:true,reason:'Tick the completed items first'}});
 assert.equal((prop.match(/role="status"/g)||[]).length,1);
 assert.match(prop,/aria-describedby=/);
});
test('icon selection and unavailability have a non-colour explanation',()=>{
 const selected=UI.iconButton({variant:'plain',icon:'',label:'Remove breeder mark',selected:true});
 assert.match(selected,/aria-pressed="true"/);
 assert.match(selected,/st-icon-selected/);
 const disabled=UI.iconButton({icon:'',label:'Scan ear tag',disabled:true,reason:'Camera unavailable; type the tag instead'});
 assert.match(disabled,/aria-disabled="true"/);
 assert.match(disabled,/aria-describedby=/);
 assert.match(disabled,/Camera unavailable/);
});
