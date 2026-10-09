import {test} from 'node:test';
import assert from 'node:assert/strict';
await import('../ux/design-system/components/bundle.js');
const ui=globalThis.SentriUI;
test('range bounds normalize and expose distinct accessible handles',()=>{
 const html=ui.rangeSlider({min:-3,max:7,value:[9,-8],label:'Due in',unit:'days'});
 assert.equal((html.match(/role="slider"/g)||[]).length,2);
 assert.match(html,/aria-valuenow="-3"/);assert.match(html,/aria-valuenow="7"/);
 assert.throws(()=>ui.rangeSlider({min:7,max:7}),RangeError);
});
test('zero results and unavailable results block commit with a visible reason',()=>{
 const empty=ui.filterSheet({count:0,noun:'sows',emptyReason:'No sows match'});
 assert.match(empty,/data-action="filter-apply"[^>]*disabled/);assert.match(empty,/role="status"[^>]*>No sows match/);
 const loading=ui.filterSheet({count:12,loading:true});assert.match(loading,/data-action="filter-apply"[^>]*disabled/);
 const ready=ui.filterSheet({count:12,noun:'sows'});assert.match(ready,/Show 12 sows/);assert.doesNotMatch(ready,/data-action="filter-apply"[^>]*disabled/);
});
