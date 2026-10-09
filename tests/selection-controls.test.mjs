import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
const UI=globalThis.SentriUI;
test('Segment preserves existing action contract, count zero and disabled reason',()=>{
 const html=UI.segment({variant:'two-line-lens',options:[['todo','To do',{count:0}],['done','Done',{disabled:true}]],active:'todo',action:'lens',ariaLabel:'Pens',reason:'Done records unavailable offline.'});
 assert.match(html,/data-variant="two-line-lens"/);assert.match(html,/data-action="lens" data-value="todo" aria-pressed="true"/);assert.match(html,/st-selection-count">0</);assert.match(html,/aria-pressed="false" disabled/);assert.match(html,/Done records unavailable offline/);
 assert.equal(UI.segment({options:[]}), '');
});
test('FilterChips permits dynamic overflow and a single selected check',()=>{
 const html=UI.filterChips({items:Array.from({length:8},(_,n)=>({value:String(n),label:'Job '+n,count:n,checked:n===5})),label:'Jobs'});
 assert.equal((html.match(/role="radio"/g)||[]).length,8);assert.equal((html.match(/aria-checked="true"/g)||[]).length,1);assert.equal((html.match(/tabindex="0"/g)||[]).length,1);assert.match(html,/st-chip-check/);assert.equal(UI.filterChips(), '');
});
