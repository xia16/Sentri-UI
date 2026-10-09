/* Which views of the interactive studies are full pages (the rest are drawers). The surfaces themselves are the Sheet card (SentriUI.sheet). */
(function(root){
'use strict';
const inspectionPages=new Set(['actions','pig','pig-profile','pig-production','pig-production-batch','pig-origin','pig-log','pig-feed','pig-feed-curve','pig-feed-changes','history','pen-detail','pen-log','feed','feed-editor','unit-detail','environment','equipment','batch-detail','treatment','sow-transfer']);
const farrowingPages=new Set(['history','roomOverview','roomEndTask','roomTaskReceipt','roomTaskSows','roomPenDetail','roomPenFeed','roomPenLog','marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile']);
function isPage(app,view,context){return app==='inspection'?(inspectionPages.has(view)||!!(context?.form?.recordEditor&&context.form.bulk&&!['picker','medicine-picker','bulk-health-picker','record-optional'].includes(view))):farrowingPages.has(view);}
const api={isPage};root.AstraSurfaces=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
