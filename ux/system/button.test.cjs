const test=require('node:test');
const assert=require('node:assert/strict');
require('../design-system/components/bundle.js');
const UI=globalThis.SentriUI;

test('footer reason is never drawn above a waiting button, stays outside the two targets and describes it',()=>{
 const html=UI.sheetFooter({primary:{label:'Record items',waiting:true},status:{text:'Tick the completed items first',visible:false}});
 assert.match(html,/sheet-status st-visually-hidden/);
 assert.equal((html.match(/<button /g)||[]).length,2);
 assert.ok(html.indexOf('role="status"')>html.lastIndexOf('</button>'));
 const prop=UI.sheetFooter({primary:{label:'Record items',waiting:true,reason:'Tick the completed items first'}});
 assert.equal((prop.match(/role="status"/g)||[]).length,1);
 assert.match(prop,/aria-describedby=/);
});
test('icon selection and unavailability have a non-colour explanation',()=>{
 const selected=UI.iconButton({variant:'plain',icon:'',label:'Remove breeder mark',selected:true});
 assert.match(selected,/aria-pressed="true"/);
 assert.match(selected,/st-icon-selected/);
 const disabled=UI.iconButton({icon:'',label:'Scan ear tag',disabled:true});
 assert.match(disabled,/aria-disabled="true"/);
 assert.doesNotMatch(disabled,/aria-describedby|Camera unavailable/);
});
