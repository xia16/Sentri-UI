import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
require('../ux/design-system/components/task-skeleton.js');
const UI=globalThis.SentriUI,K=globalThis.SentriTask;
test('Banner doors are single native buttons and never nest text actions',()=>{
 const html=UI.banner({tone:'notice',headline:'Saved here',door:{action:'sync'},actions:[{label:'Review'}]});
 assert.equal((html.match(/<button/g)||[]).length,1);
 assert.match(html,/data-tone="notice"/);assert.match(html,/data-action="sync"/);assert.match(html,/›/);
});
test('legacy warning slots keep localized markup through the shared Banner',()=>{
 const html=K.warning({tone:'amber',title:{text:'Review correction',str:'test.title'},text:'Before recording',actions:UI.button({label:'Review',register:'text'})});
 assert.match(html,/data-ds="Banner"/);assert.match(html,/data-str="test.title"/);assert.match(html,/Before recording/);assert.doesNotMatch(html,/tk-warning|TaskWarning/);
});
test('Photos derives localized counts once and preserves explicit token counts',()=>{
 const html=UI.photos({items:[{id:'a',pending:true}]});
 assert.match(html,/1 attached/);assert.match(html,/ds.c2.photos.attached/);assert.match(html,/Photo 1 · waiting to upload/);
 assert.match(UI.photos({count:[{text:'2 attached',strs:{text:'test.count'}}]}),/data-str="test.count"/);
});
test('inactive, full and adding photo rows have persistent visible reasons',()=>{
 for(const [props,pattern] of [[{active:false},/Record a death first/],[{items:Array.from({length:12},(_,id)=>({id}))},/12 photos at most/],[{adding:true},/Adding photo/]]){
 const html=UI.photos(props);assert.match(html,/aria-disabled="true"/);assert.match(html,/aria-describedby=/);assert.match(html,pattern);
 }
});
test('photo errors win over hints, cancellation keeps silent, task adapter is identical',()=>{
 assert.match(UI.photos({error:'denied',hint:'Wrong hint'}),/Camera not allowed/);
 assert.doesNotMatch(UI.photos({error:'denied',hint:'Wrong hint'}),/Wrong hint/);
 assert.doesNotMatch(UI.photos({error:'cancelled',hint:'Wrong hint'}),/Wrong hint/);
 const props={id:'same',items:[{id:'one'}]};assert.equal(K.photos(props),UI.photos(props));
});
