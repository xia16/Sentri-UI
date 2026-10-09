import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
require('../ux/design-system/components/bundle.js');
require('../ux/design-system/components/task-skeleton.js');
const UI=globalThis.SentriUI,K=globalThis.SentriTask;
test('task adapters retain identifiers, localized tokens and checkbox event hooks in Row',()=>{
 const html=K.row({id:{text:'000418',str:'test.code'},headline:{text:'12 owed',str:'test.headline'},meta:[{text:'2h ago'},{sep:true},{text:'parity 3'}],trail:'tick',tick:{action:'toggle',checked:true,value:'A02'}});
 assert.match(html,/data-ds="Row" data-variant="selectable"/);
 assert.match(html,/data-str="test.code"/);assert.match(html,/data-str="test.headline"/);
 assert.match(html,/data-action="toggle" value="A02" checked/);
 assert.doesNotMatch(html,/TaskRow|tk-row|\[object Object\]|&lt;span/);
});
test('TaskDay arranges shared Row doors and acts without a second row implementation',()=>{
 const html=K.day({title:'Day 3',items:[{title:{text:'Iron',str:'test.iron'},meta:'12 owed',id:'iron',action:'open',value:'iron',act:{label:'Record 12',action:'record'}},{title:'Tail',mark:'done',id:'tail'}]});
 assert.match(html,/data-ds="Row" data-variant="door-act"/);
 assert.match(html,/data-action="record" data-value="iron"/);
 assert.match(html,/id="iron-title"/);
 assert.doesNotMatch(html,/tk-day-door|tk-day-copy|tk-day-row|\[object Object\]/);
});
test('unavailable rows explain why and legacy trailing values cannot inject HTML',()=>{
 const html=UI.row({title:'Unit 6',disabled:true,reason:'Unit closed',action:'open',trailing:'<img src=x onerror=alert(1)>'});
 assert.match(html,/disabled aria-disabled="true"/);assert.match(html,/Unit closed/);
 assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
});
