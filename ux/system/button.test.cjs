const test=require('node:test');
const assert=require('node:assert/strict');
require('../design-system/components/bundle.js');
const UI=globalThis.SentriUI;

test('a waiting button stands alone: no reason line, aria-disabled, and the delegated guard refuses it',()=>{
 const html=UI.button({register:'primary',label:'Record 12 piglets',waiting:true,reason:'Choose <piglets> first'});
 assert.doesNotMatch(html,/st-button-reason|role="status"|aria-describedby|Choose/);
 assert.match(html,/aria-disabled="true"/);
 assert.equal(typeof UI.buttonReason,'undefined');
 assert.equal(UI.guard({getAttribute:k=>k==='aria-disabled'?'true':''},{answer:false}),true);
});
test('a footer draws no reason line: a waiting primary or hold has nothing above the bar',()=>{
 const html=UI.sheetFooter({primary:{label:'Record items',waiting:true,reason:'Tick the completed items first'},status:{text:'Tick the completed items first'}});
 assert.doesNotMatch(html,/role="status"|sheet-status|st-visually-hidden|aria-describedby|Tick the completed/);
 assert.equal((html.match(/<button /g)||[]).length,2);
 assert.ok(html.startsWith('<div class="sheet-footer'));
});
test('icon selection and unavailability have a non-colour explanation',()=>{
 const selected=UI.iconButton({variant:'plain',icon:'',label:'Remove breeder mark',selected:true});
 assert.match(selected,/aria-pressed="true"/);
 assert.match(selected,/st-icon-selected/);
 const disabled=UI.iconButton({icon:'',label:'Scan ear tag',disabled:true});
 assert.match(disabled,/aria-disabled="true"/);
 assert.doesNotMatch(disabled,/aria-describedby|Camera unavailable/);
});
